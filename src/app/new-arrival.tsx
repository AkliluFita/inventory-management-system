import { Button, InputField, Page, PickerField, SectionTitle, Surface, Text, TopBar } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTrade } from "@/context/TradeContext";
import { positiveNumber, today, validDate } from "@/data/formUtils";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function NewArrivalScreen() {
  const { data: inventory } = useInventory();
  const { data, createArrival } = useTrade();
  const { t } = useLanguage();
  const [date, setDate] = useState(today());
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [courier, setCourier] = useState("");
  const [purchaseId, setPurchaseId] = useState("");
  const [busy, setBusy] = useState(false);
  const linkedPurchase = data.purchases.find((p) => p.id === purchaseId);
  const availablePurchases = data.purchases.filter((purchase) => purchase.productId === productId).map((purchase) => ({
    purchase,
    remaining: purchase.quantity - data.arrivals.filter((arrival) => arrival.purchaseId === purchase.id).reduce((sum, arrival) => sum + arrival.quantity, 0),
  })).filter((item) => item.remaining > 0);
  const save = async () => {
    const count = positiveNumber(quantity);
    if (!validDate(date) || !productId || !courier.trim() || !Number.isInteger(count) || count <= 0 || (linkedPurchase && linkedPurchase.productId !== productId)) { Alert.alert(t("Check arrival details"), t("Enter a valid date, product, quantity, courier, and matching purchase.")); return; }
    setBusy(true);
    try { await createArrival({ date, productId, quantity: count, courier: courier.trim(), purchaseId: purchaseId || undefined }); router.replace("/courier"); }
    catch (error) { Alert.alert(t("Could not save arrival"), t(error instanceof Error ? error.message : "Please try again.")); }
    finally { setBusy(false); }
  };
  return <Page>
    <TopBar title="Register arrival" subtitle="Received goods increase available stock" />
    <SectionTitle title="Courier details" />
    <InputField label="Arrival date (YYYY-MM-DD)" value={date} onChangeText={setDate} required />
    <PickerField label="Product" value={productId} options={inventory.products.map((p) => ({ label: p.name, value: p.id, subtitle: p.sku }))} onChange={(value) => { setProductId(value); setPurchaseId(""); }} required />
    <InputField label="Arrived quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" required />
    <InputField label="Courier / transporter" value={courier} onChangeText={setCourier} required />
    <PickerField label="Related purchase (optional)" value={purchaseId} options={[{ label: "No linked purchase", value: "" }, ...availablePurchases.map(({ purchase, remaining }) => ({ label: `${purchase.id} · ${remaining} ${t("remaining")}`, value: purchase.id }))]} onChange={setPurchaseId} />
    <Surface className="p-4"><Text className="text-[12px] font-semibold text-ink">Stock update</Text><Text className="mt-2 text-[11px] leading-5 text-muted">Saving this arrival adds the received quantity to the selected product and creates a stock intake record.</Text></Surface>
    <View className="mt-6"><Button title={busy ? "Saving..." : "Save arrival"} onPress={save} disabled={busy} /></View>
  </Page>;
}
