import { Button, Icon, InputField, Page, PickerField, SectionTitle, Surface, Text, TopBar } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTrade } from "@/context/TradeContext";
import { money } from "@/data/inventoryApi";
import { positiveNumber, today, validDate } from "@/data/formUtils";
import { landedUnitCost } from "@/data/tradeApi";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function NewImportScreen() {
  const { data: inventory } = useInventory();
  const { createPurchase } = useTrade();
  const { t } = useLanguage();
  const [date, setDate] = useState(today());
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPriceUsd, setUnitPriceUsd] = useState("");
  const [usdRateEtb, setUsdRateEtb] = useState("");
  const [freightEtb, setFreightEtb] = useState("0");
  const [supplier, setSupplier] = useState("");
  const [busy, setBusy] = useState(false);
  const landed = landedUnitCost({ unitPriceUsd: positiveNumber(unitPriceUsd), usdRateEtb: positiveNumber(usdRateEtb), freightEtb: positiveNumber(freightEtb) });
  const total = landed * positiveNumber(quantity);
  const save = async () => {
    const values = [positiveNumber(quantity), positiveNumber(unitPriceUsd), positiveNumber(usdRateEtb), positiveNumber(freightEtb)];
    if (!validDate(date) || !productId || !supplier.trim() || !Number.isInteger(values[0]) || values[0] <= 0 || values[1] <= 0 || values[2] <= 0 || values[3] < 0 || values.some((v) => !Number.isFinite(v))) { Alert.alert(t("Check purchase details"), t("Enter a valid date, product, supplier, quantity, rates, and freight.")); return; }
    setBusy(true);
    try { await createPurchase({ date, productId, quantity: values[0], unitPriceUsd: values[1], usdRateEtb: values[2], freightEtb: values[3], supplier: supplier.trim() }); router.replace("/imports"); }
    catch (error) { Alert.alert(t("Could not save purchase"), t(error instanceof Error ? error.message : "Please try again.")); }
    finally { setBusy(false); }
  };
  return <Page>
    <TopBar title="New import purchase" subtitle="Capture purchase and exchange details" />
    <SectionTitle title="Purchase details" />
    <InputField label="Purchase date (YYYY-MM-DD)" value={date} onChangeText={setDate} required />
    <PickerField label="Product" value={productId} options={inventory.products.map((item) => ({ label: item.name, value: item.id, subtitle: item.sku }))} onChange={setProductId} required />
    <InputField label="Purchased quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" required />
    <InputField label="Unit price (USD)" value={unitPriceUsd} onChangeText={setUnitPriceUsd} keyboardType="decimal-pad" required />
    <InputField label="Exchange rate (ETB per USD)" value={usdRateEtb} onChangeText={setUsdRateEtb} keyboardType="decimal-pad" required />
    <InputField label="Freight per unit (ETB)" value={freightEtb} onChangeText={setFreightEtb} keyboardType="decimal-pad" required />
    <InputField label="Supplier / company" value={supplier} onChangeText={setSupplier} required />
    <SectionTitle title="Calculated costs" />
    <Surface className="p-4"><View className="flex-row items-center gap-2"><Icon name="calculator-outline" size={18} color="#0869F2" /><Text className="text-[11px] font-semibold text-muted">USD price × exchange rate + freight</Text></View><View className="mt-4 flex-row justify-between"><Text className="text-[12px] text-muted">Landed cost / unit</Text><Text className="text-[14px] font-bold text-ink">{money(Number.isFinite(landed) ? landed : 0)}</Text></View><View className="mt-3 flex-row justify-between border-t border-line pt-3"><Text className="text-[12px] font-semibold text-ink">Total landed cost</Text><Text className="text-[17px] font-extrabold text-brand">{money(Number.isFinite(total) ? total : 0)}</Text></View></Surface>
    <View className="mt-6"><Button title={busy ? "Saving..." : "Save purchase"} onPress={save} disabled={busy} /></View>
  </Page>;
}
