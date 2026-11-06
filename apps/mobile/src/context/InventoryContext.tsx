import {
  Branch, CartLine, Intake, InventoryApi, InventorySnapshot, Product, PurchaseOrder, Sale, SalePayment, Supplier,
  emptyInventorySnapshot, initialInventorySnapshot, mockInventoryApi,
} from "@/data/inventoryApi";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type InventoryContextValue = {
  data: InventorySnapshot;
  loading: boolean;
  error: string | null;
  retry: () => Promise<void>;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  cart: CartLine[];
  addToCart: (productId: string) => void;
  changeQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createIntake: (input: Omit<Intake, "id" | "date" | "status">) => Promise<Intake>;
  createIntakes: (inputs: Omit<Intake, "id" | "date" | "status">[]) => Promise<Intake[]>;
  createPurchaseOrder: (productId: string, quantity: number) => Promise<PurchaseOrder>;
  completeSale: (method: Sale["method"], payment?: SalePayment) => Promise<Sale>;
  settleDebt: (id: string) => Promise<void>;
  createBranch: (name: string, city: string) => Promise<Branch>;
  createSupplier: (name: string, category: string, phone: string) => Promise<Supplier>;
  createProduct: (input: Omit<Product, "id" | "stock" | "icon" | "tint">) => Promise<Product>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children, api = mockInventoryApi }: { children: React.ReactNode; api?: InventoryApi }) {
  const [data, setData] = useState<InventorySnapshot>(api === mockInventoryApi ? initialInventorySnapshot : emptyInventorySnapshot);
  const [activeBranchId, updateActiveBranchId] = useState(api === mockInventoryApi ? "b1" : "");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setActiveBranchId = useCallback((id: string) => {
    if (!id || id === activeBranchId) return;
    setLoading(true);
    setError(null);
    updateActiveBranchId(id);
    setCart([]);
  }, [activeBranchId]);

  const refresh = useCallback(async () => {
    try {
      const snapshot = await api.getSnapshot(activeBranchId);
      setData(snapshot);
      if (!activeBranchId && snapshot.branches[0]) updateActiveBranchId(snapshot.branches[0].id);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load inventory.");
      throw cause;
    }
  }, [api, activeBranchId]);

  useEffect(() => {
    let mounted = true;
    api.getSnapshot(activeBranchId).then((snapshot) => {
      if (mounted) {
        setData(snapshot);
        if (!activeBranchId && snapshot.branches[0]) updateActiveBranchId(snapshot.branches[0].id);
        setError(null);
      }
    }).catch((cause) => {
      if (mounted) setError(cause instanceof Error ? cause.message : "Could not load inventory.");
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [api, activeBranchId]);

  const retry = useCallback(async () => {
    setLoading(true);
    try { await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load inventory."); }
    finally { setLoading(false); }
  }, [refresh]);

  const addToCart = useCallback((productId: string) => {
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId);
      const available = data.products.find((product) => product.id === productId)?.stock ?? 0;
      if (!available) return current;
      if (existing) return current.map((line) => line.productId === productId ? { ...line, quantity: Math.min(line.quantity + 1, available) } : line);
      return [...current, { productId, quantity: 1 }];
    });
  }, [data.products]);

  const changeQuantity = useCallback((productId: string, quantity: number) => {
    const available = data.products.find((product) => product.id === productId)?.stock ?? 0;
    setCart((current) => quantity <= 0
      ? current.filter((line) => line.productId !== productId)
      : current.map((line) => line.productId === productId ? { ...line, quantity: Math.min(quantity, available) } : line));
  }, [data.products]);

  const createIntake = useCallback(async (input: Omit<Intake, "id" | "date" | "status">) => {
    const result = await api.createIntake(input);
    await refresh().catch(() => undefined);
    return result;
  }, [api, refresh]);
  const createIntakes = useCallback(async (inputs: Omit<Intake, "id" | "date" | "status">[]) => {
    const result = await api.createIntakes(inputs);
    await refresh().catch(() => undefined);
    return result;
  }, [api, refresh]);

  const createPurchaseOrder = useCallback(async (productId: string, quantity: number) => {
    const result = await api.createPurchaseOrder(productId, quantity);
    await refresh().catch(() => undefined);
    return result;
  }, [api, refresh]);

  const completeSale = useCallback(async (method: Sale["method"], payment?: SalePayment) => {
    const result = await api.completeSale(cart, method, payment);
    setCart([]);
    await refresh().catch(() => undefined);
    return result;
  }, [api, cart, refresh]);

  const settleDebt = useCallback(async (id: string) => {
    await api.settleDebt(id);
    await refresh().catch(() => undefined);
  }, [api, refresh]);

  const createBranch = useCallback(async (name: string, city: string) => {
    const result = await api.createBranch(name, city);
    setActiveBranchId(result.id);
    return result;
  }, [api, setActiveBranchId]);
  const createSupplier = useCallback(async (name: string, category: string, phone: string) => {
    const result = await api.createSupplier(name, category, phone);
    await refresh().catch(() => undefined);
    return result;
  }, [api, refresh]);
  const createProduct = useCallback(async (input: Omit<Product, "id" | "stock" | "icon" | "tint">) => {
    const result = await api.createProduct(input, activeBranchId);
    await refresh().catch(() => undefined);
    return result;
  }, [api, activeBranchId, refresh]);

  const value = useMemo(() => ({
    data, loading, error, retry, activeBranchId, setActiveBranchId, cart, addToCart, changeQuantity,
    clearCart: () => setCart([]), createIntake, createIntakes, createPurchaseOrder, completeSale, settleDebt,
    createBranch, createSupplier, createProduct,
  }), [data, loading, error, retry, activeBranchId, setActiveBranchId, cart, addToCart, changeQuantity, createIntake, createIntakes, createPurchaseOrder, completeSale, settleDebt, createBranch, createSupplier, createProduct]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within InventoryProvider");
  return context;
}
