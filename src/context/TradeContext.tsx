import { BankTransfer, CourierArrival, ImportPurchase, initialTradeSnapshot, mockTradeApi, TradeApi, TradeSnapshot } from "@/data/tradeApi";
import { useInventory } from "@/context/InventoryContext";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type TradeContextValue = {
  data: TradeSnapshot;
  createPurchase: (input: Omit<ImportPurchase, "id">) => Promise<ImportPurchase>;
  createArrival: (input: Omit<CourierArrival, "id">) => Promise<CourierArrival>;
  createTransfer: (input: Omit<BankTransfer, "id">) => Promise<BankTransfer>;
};

const TradeContext = createContext<TradeContextValue | null>(null);

export function TradeProvider({ children, api = mockTradeApi }: { children: React.ReactNode; api?: TradeApi }) {
  const { data: inventory, createIntake } = useInventory();
  const [data, setData] = useState(initialTradeSnapshot);
  const refresh = useCallback(async () => setData(await api.getSnapshot()), [api]);
  useEffect(() => {
    let mounted = true;
    api.getSnapshot().then((snapshot) => { if (mounted) setData(snapshot); });
    return () => { mounted = false; };
  }, [api]);
  const createPurchase = useCallback(async (input: Omit<ImportPurchase, "id">) => {
    const result = await api.createPurchase(input); await refresh(); return result;
  }, [api, refresh]);
  const createArrival = useCallback(async (input: Omit<CourierArrival, "id">) => {
    const product = inventory.products.find((item) => item.id === input.productId);
    if (!product || input.quantity <= 0 || !input.courier.trim()) throw new Error("Complete the required arrival fields.");
    const purchase = data.purchases.find((item) => item.id === input.purchaseId);
    const result = await api.createArrival(input);
    const supplierId = inventory.suppliers.find((item) => item.name === purchase?.supplier)?.id ?? inventory.suppliers[0]?.id ?? "s1";
    await createIntake({ productId: input.productId, batch: result.id, quantity: input.quantity, unitCost: purchase ? purchase.unitPriceUsd * purchase.usdRateEtb + purchase.freightEtb : product.cost, supplierId });
    await refresh();
    return result;
  }, [api, createIntake, data.purchases, inventory.products, inventory.suppliers, refresh]);
  const createTransfer = useCallback(async (input: Omit<BankTransfer, "id">) => {
    const result = await api.createTransfer(input); await refresh(); return result;
  }, [api, refresh]);
  const value = useMemo(() => ({ data, createPurchase, createArrival, createTransfer }), [data, createPurchase, createArrival, createTransfer]);
  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}

export function useTrade() {
  const context = useContext(TradeContext);
  if (!context) throw new Error("useTrade must be used within TradeProvider");
  return context;
}
