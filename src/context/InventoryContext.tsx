import {
  CartLine, Intake, InventoryApi, InventorySnapshot, PurchaseOrder, Sale, SalePayment,
  initialInventorySnapshot, mockInventoryApi,
} from "@/data/inventoryApi";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type InventoryContextValue = {
  data: InventorySnapshot;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  cart: CartLine[];
  addToCart: (productId: string) => void;
  changeQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createIntake: (input: Omit<Intake, "id" | "date" | "status">) => Promise<Intake>;
  createPurchaseOrder: (productId: string, quantity: number) => Promise<PurchaseOrder>;
  completeSale: (method: Sale["method"], payment?: SalePayment) => Promise<Sale>;
  settleDebt: (id: string) => Promise<void>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children, api = mockInventoryApi }: { children: React.ReactNode; api?: InventoryApi }) {
  const [data, setData] = useState<InventorySnapshot>(initialInventorySnapshot);
  const [activeBranchId, setActiveBranchId] = useState("b1");
  const [cart, setCart] = useState<CartLine[]>([]);

  const refresh = useCallback(async () => {
    setData(await api.getSnapshot(activeBranchId));
  }, [api, activeBranchId]);

  useEffect(() => {
    let mounted = true;
    api.getSnapshot(activeBranchId).then((snapshot) => { if (mounted) setData(snapshot); });
    return () => { mounted = false; };
  }, [api, activeBranchId]);

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
    await refresh();
    return result;
  }, [api, refresh]);

  const createPurchaseOrder = useCallback(async (productId: string, quantity: number) => {
    const result = await api.createPurchaseOrder(productId, quantity);
    await refresh();
    return result;
  }, [api, refresh]);

  const completeSale = useCallback(async (method: Sale["method"], payment?: SalePayment) => {
    const result = await api.completeSale(cart, method, payment);
    setCart([]);
    await refresh();
    return result;
  }, [api, cart, refresh]);

  const settleDebt = useCallback(async (id: string) => {
    await api.settleDebt(id);
    await refresh();
  }, [api, refresh]);

  const value = useMemo(() => ({
    data, activeBranchId, setActiveBranchId, cart, addToCart, changeQuantity,
    clearCart: () => setCart([]), createIntake, createPurchaseOrder, completeSale, settleDebt,
  }), [data, activeBranchId, cart, addToCart, changeQuantity, createIntake, createPurchaseOrder, completeSale, settleDebt]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within InventoryProvider");
  return context;
}
