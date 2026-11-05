import { Button, EmptyState, Icon, Page, ProductArt, SectionTitle, StatusBadge, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { PurchaseOrder, money, stockStatus } from "@/data/inventoryApi";
import { goBackOrHome } from "@/data/navigation";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function ReorderScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, createPurchaseOrder } = useInventory();
  const product = data.products.find((item) => item.id === id) ?? data.products.find((item) => stockStatus(item) !== "in-stock");
  const [quantity, setQuantity] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<PurchaseOrder | null>(null);

  if (!product) return <Page><TopBar title="Reorder item" /><EmptyState icon="cube-outline" title="No product selected" detail="Choose a product from inventory to create a purchase order." action="Open inventory" onAction={() => router.replace("/inventory")} /></Page>;

  const submit = async () => {
    setBusy(true); setError("");
    try { setOrder(await createPurchaseOrder(product.id, quantity)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create order."); }
    finally { setBusy(false); }
  };

  if (order) return <Page><TopBar title="Purchase order" /><View className="min-h-[65vh] items-center justify-center"><View className="h-20 w-20 items-center justify-center rounded-[26px] bg-[#E0F8EE]"><Icon name="checkmark-circle" size={48} color="#08AD7D" /></View><Text className="mt-6 text-[23px] font-extrabold text-ink">Draft created</Text><Text className="mt-2 text-center text-[12px] leading-5 text-muted">Your purchase order is ready to send to the supplier when the backend is connected.</Text><Surface className="mt-7 w-full p-5"><Text className="text-[11px] text-muted">{order.id}</Text><Text className="mt-2 text-[14px] font-bold text-ink">{product.name}</Text><Text className="mt-2 text-[12px] text-muted">{order.quantity} {product.unit} · {money(order.cost)}</Text></Surface><View className="mt-7 w-full"><Button title="Back to inventory" onPress={() => router.replace("/inventory")} /></View></View></Page>;

  return (
    <Page>
      <TopBar title="Reorder item" subtitle="Create a purchase order draft" />
      <Surface className="flex-row items-center gap-4 p-4"><ProductArt product={product} size="large" /><View className="flex-1"><Text className="text-[15px] font-extrabold text-ink">{product.name}</Text><Text className="mt-1 text-[11px] text-muted">Current stock: {product.stock} {product.unit}</Text><View className="mt-2"><StatusBadge label={stockStatus(product) === "out-of-stock" ? "Out of stock" : stockStatus(product) === "low-stock" ? "Low stock" : "In stock"} tone={stockStatus(product) === "out-of-stock" ? "red" : stockStatus(product) === "low-stock" ? "amber" : "green"} /></View></View></Surface>
      <SectionTitle title="Recommended reorder" />
      <Surface className="p-4"><View className="flex-row items-center justify-between"><Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF]"><Icon name="remove" size={20} color="#0869F2" /></Pressable><View className="items-center"><Text className="text-[28px] font-extrabold text-ink">{quantity}</Text><Text className="text-[10px] text-muted">{product.unit}</Text></View><Pressable onPress={() => setQuantity(quantity + 1)} className="h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF]"><Icon name="add" size={20} color="#0869F2" /></Pressable></View><Text className="mt-4 text-center text-[10px] leading-4 text-muted">Suggested based on the product&apos;s reorder point of {product.minStock} {product.unit}.</Text></Surface>
      <SectionTitle title="Cost estimate" />
      <Surface className="p-5"><View className="flex-row justify-between"><Text className="text-[11px] text-muted">Unit purchase cost</Text><Text className="text-[11px] font-semibold text-ink">{money(product.cost)}</Text></View><View className="mt-4 flex-row justify-between border-t border-line pt-4"><Text className="text-[12px] font-bold text-ink">Estimated total</Text><Text className="text-[20px] font-extrabold text-brand">{money(product.cost * quantity)}</Text></View></Surface>
      {error ? <Text className="mt-4 text-[11px] text-danger">{error}</Text> : null}
      <View className="mt-8 gap-3"><Button title={busy ? "Creating..." : "Create purchase order"} disabled={busy} onPress={() => void submit()} /><Button title="Cancel" variant="outline" onPress={goBackOrHome} /></View>
    </Page>
  );
}
