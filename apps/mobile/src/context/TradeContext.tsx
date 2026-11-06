import { BankTransfer, CourierArrival, ImportPurchase, initialTradeSnapshot, mockTradeApi, TradeApi, TradeSnapshot } from "@/data/tradeApi";
import { useInventory } from "@/context/InventoryContext";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type TradeContextValue = {
  data: TradeSnapshot;
  loading: boolean;
  error: string | null;
  retry: () => Promise<void>;
  createPurchase: (input: Omit<ImportPurchase, "id">) => Promise<ImportPurchase>;
  createArrival: (input: Omit<CourierArrival, "id">) => Promise<CourierArrival>;
  createTransfer: (input: Omit<BankTransfer, "id">) => Promise<BankTransfer>;
};

const TradeContext = createContext<TradeContextValue | null>(null);

export function TradeProvider({ children, api = mockTradeApi }: { children: React.ReactNode; api?: TradeApi }) {
  const { data: inventory, activeBranchId, createIntake, retry: refreshInventory } = useInventory();
  const [data, setData] = useState(api === mockTradeApi ? initialTradeSnapshot : { purchases: [], arrivals: [], transfers: [] });
  const [loadedBranchId, setLoadedBranchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try { setData(await api.getSnapshot(activeBranchId)); setError(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load import data."); throw cause; }
    finally { setLoadedBranchId(activeBranchId); }
  }, [api, activeBranchId]);
  useEffect(() => {
    if (api !== mockTradeApi && !activeBranchId) return;
    let mounted = true;
    api.getSnapshot(activeBranchId).then((snapshot) => {
      if (mounted) { setData(snapshot); setError(null); }
    }).catch((cause) => {
      if (mounted) setError(cause instanceof Error ? cause.message : "Could not load import data.");
    }).finally(() => { if (mounted) setLoadedBranchId(activeBranchId); });
    return () => { mounted = false; };
  }, [api, activeBranchId]);
  const retry = useCallback(async () => { await refresh().catch(() => undefined); }, [refresh]);
  const createPurchase = useCallback(async (input: Omit<ImportPurchase, "id">) => {
    const result = await api.createPurchase(input, activeBranchId); await retry(); return result;
  }, [api, activeBranchId, retry]);
  const createArrival = useCallback(async (input: Omit<CourierArrival, "id">) => {
    const product = inventory.products.find((item) => item.id === input.productId);
    if (!product || input.quantity <= 0 || !input.courier.trim()) throw new Error("Complete the required arrival fields.");
    const purchase = data.purchases.find((item) => item.id === input.purchaseId);
    const result = await api.createArrival(input, activeBranchId);
    if (api === mockTradeApi) {
      const supplierId = inventory.suppliers.find((item) => item.name === purchase?.supplier)?.id ?? inventory.suppliers[0]?.id ?? "s1";
      await createIntake({ productId: input.productId, batch: result.id, quantity: input.quantity, unitCost: purchase ? purchase.unitPriceUsd * purchase.usdRateEtb + purchase.freightEtb : product.cost, supplierId });
    }
    if (api !== mockTradeApi) await refreshInventory();
    await retry();
    return result;
  }, [api, activeBranchId, createIntake, data.purchases, inventory.products, inventory.suppliers, refreshInventory, retry]);
  const createTransfer = useCallback(async (input: Omit<BankTransfer, "id">) => {
    const result = await api.createTransfer(input, activeBranchId); await retry(); return result;
  }, [api, activeBranchId, retry]);
  const value = useMemo(() => ({ data, loading: loadedBranchId !== activeBranchId, error, retry, createPurchase, createArrival, createTransfer }), [data, loadedBranchId, activeBranchId, error, retry, createPurchase, createArrival, createTransfer]);
  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}

export function useTrade() {
  const context = useContext(TradeContext);
  if (!context) throw new Error("useTrade must be used within TradeProvider");
  return context;
}
