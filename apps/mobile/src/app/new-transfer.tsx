import { Button, Icon, InputField, Page, PickerField, SectionTitle, Surface, Text, TopBar } from "@/components/ui";
import { useTrade } from "@/context/TradeContext";
import { useLanguage } from "@/context/LanguageContext";
import { money } from "@/data/inventoryApi";
import { positiveNumber, today, validDate } from "@/data/formUtils";
import { ethiopianBanks, transferEquivalent } from "@/data/tradeApi";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

const currency = (value: number, code: string) => `${code} ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function NewTransferScreen() {
  const { createTransfer } = useTrade();
  const { t } = useLanguage();
  const [date, setDate] = useState(today());
  const [amountEtb, setAmountEtb] = useState("");
  const [bank, setBank] = useState("");
  const [usdRate, setUsdRate] = useState("");
  const [aedRate, setAedRate] = useState("");
  const [remitter, setRemitter] = useState("");
  const [receipt, setReceipt] = useState<{ name: string; uri: string; size: number; mimeType?: string }>();
  const [busy, setBusy] = useState(false);
  const amount = positiveNumber(amountEtb);
  const usd = transferEquivalent(amount, positiveNumber(usdRate));
  const aed = transferEquivalent(amount, positiveNumber(aedRate));
  const pickReceipt = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"], copyToCacheDirectory: true });
      if (result.canceled) return;
      const file = result.assets[0];
      if (!file.size || file.size > 10 * 1024 * 1024) { Alert.alert(t("File size unavailable or too large"), t("Choose a receipt with a known size smaller than 10 MB.")); return; }
      setReceipt({ name: file.name, uri: file.uri, size: file.size, mimeType: file.mimeType });
    } catch (error) { Alert.alert(t("Could not choose receipt"), t(error instanceof Error ? error.message : "Please try again.")); }
  };
  const save = async () => {
    const values = [amount, positiveNumber(usdRate), positiveNumber(aedRate)];
    if (!validDate(date) || !bank || !remitter.trim() || values.some((v) => !Number.isFinite(v) || v <= 0)) { Alert.alert(t("Check transfer details"), t("Enter a valid date, amount, bank, exchange rates, and remitter.")); return; }
    setBusy(true);
    try { await createTransfer({ date, amountEtb: values[0], bank, usdRate: values[1], aedRate: values[2], remitter: remitter.trim(), receipt }); router.replace("/transfers"); }
    catch (error) { Alert.alert(t("Could not save transfer"), t(error instanceof Error ? error.message : "Please try again.")); }
    finally { setBusy(false); }
  };
  return <Page>
    <TopBar title="New bank transfer" subtitle="Record rates and attach a receipt" />
    <SectionTitle title="Transfer details" />
    <InputField label="Transfer date (YYYY-MM-DD)" value={date} onChangeText={setDate} required />
    <InputField label="Amount (ETB)" value={amountEtb} onChangeText={setAmountEtb} keyboardType="decimal-pad" required />
    <PickerField label="Bank" value={bank} options={ethiopianBanks.map((name) => ({ label: name, value: name }))} onChange={setBank} required />
    <InputField label="ETB per USD" value={usdRate} onChangeText={setUsdRate} keyboardType="decimal-pad" required />
    <InputField label="ETB per AED" value={aedRate} onChangeText={setAedRate} keyboardType="decimal-pad" required />
    <InputField label="Seller / remitter" value={remitter} onChangeText={setRemitter} required />
    <SectionTitle title="Currency equivalents" />
    <Surface className="p-4"><View className="flex-row justify-between"><Text className="text-[11px] text-muted">ETB amount</Text><Text className="text-[13px] font-bold text-ink">{money(Number.isFinite(amount) ? amount : 0)}</Text></View><View className="mt-3 flex-row justify-between"><Text className="text-[11px] text-muted">USD equivalent</Text><Text className="text-[13px] font-bold text-ink">{currency(usd, "USD")}</Text></View><View className="mt-3 flex-row justify-between"><Text className="text-[11px] text-muted">AED equivalent</Text><Text className="text-[13px] font-bold text-brand">{currency(aed, "AED")}</Text></View></Surface>
    <SectionTitle title="Receipt" />
    <Pressable onPress={pickReceipt} className="min-h-[86px] flex-row items-center gap-3 rounded-[22px] border border-dashed border-[#94BDF7] bg-[#F4F8FF] p-4"><View className="h-11 w-11 items-center justify-center rounded-2xl bg-white"><Icon name="document-attach-outline" color="#0869F2" /></View><View className="flex-1"><Text className="text-[12px] font-bold text-ink">{receipt ? receipt.name : "Choose receipt image or PDF"}</Text><Text className="mt-1 text-[10px] text-muted">Maximum file size: 10 MB</Text></View><Icon name="add-circle-outline" size={20} color="#0869F2" /></Pressable>
    <View className="mt-6"><Button title={busy ? "Saving..." : "Save transfer"} onPress={save} disabled={busy} /></View>
  </Page>;
}
