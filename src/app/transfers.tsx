import { Button, Icon, Page, SectionTitle, Surface, Text, TopBar } from "@/components/ui";
import { TradeStatus } from "@/components/TradeStatus";
import { useTrade } from "@/context/TradeContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { money } from "@/data/inventoryApi";
import { transferEquivalent } from "@/data/tradeApi";
import { supabase } from "@/data/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Alert, Pressable, View } from "react-native";

const currency = (value: number, code: string) => `${code} ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TransfersScreen() {
  const { demo } = useAuth();
  const { data } = useTrade();
  const { t } = useLanguage();
  const total = data.transfers.reduce((sum, item) => sum + item.amountEtb, 0);
  const openReceipt = async (path: string) => {
    if (demo) return;
    try {
      const { data: signed, error } = await supabase.storage.from("ps-receipts").createSignedUrl(path, 60);
      if (error || !signed?.signedUrl) throw new Error(error?.message ?? "Please try again.");
      await Linking.openURL(signed.signedUrl);
    } catch (error) { Alert.alert("Could not open receipt", error instanceof Error ? error.message : "Please try again."); }
  };
  return <Page>
    <TopBar title="Bank transfers" subtitle="ETB payments with USD and AED equivalents" />
    <TradeStatus />
    <Surface className="flex-row items-center gap-4 bg-[#E9E8FF] p-5"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-white"><Icon name="swap-horizontal-outline" color="#6053C8" /></View><View className="flex-1"><Text className="text-[11px] text-muted">Total transferred</Text><Text className="mt-1 text-[19px] font-extrabold text-ink">{money(total)}</Text><Text className="mt-1 text-[10px] text-muted">{data.transfers.length} {t("transfers")}</Text></View></Surface>
    <View className="mt-4"><Button title="New bank transfer" icon="add" onPress={() => router.push("/new-transfer")} /></View>
    <SectionTitle title="Transfer history" />
    <View className="gap-3">{data.transfers.map((item) => <Surface key={item.id} className="p-4"><View className="flex-row items-center gap-3"><View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF2FF]"><Icon name="business-outline" color="#0869F2" /></View><View className="flex-1"><Text className="text-[12px] font-bold text-ink" numberOfLines={1}>{item.bank}</Text><Text className="mt-1 text-[10px] text-muted">{item.id} · {item.date}</Text></View></View><Text className="mt-4 text-[20px] font-extrabold text-brand">{money(item.amountEtb)}</Text><View className="mt-3 flex-row justify-between border-t border-line pt-3"><Text className="text-[11px] font-semibold text-ink">{currency(transferEquivalent(item.amountEtb, item.usdRate), "USD")}</Text><Text className="text-[11px] font-semibold text-ink">{currency(transferEquivalent(item.amountEtb, item.aedRate), "AED")}</Text></View><View className="mt-3 flex-row items-center justify-between"><Text className="text-[10px] text-muted">{item.remitter}</Text>{item.receipt ? <Pressable onPress={() => void openReceipt(item.receipt!.uri)} disabled={demo} className="flex-row items-center gap-1"><Icon name="attach-outline" size={14} color="#0869F2" /><Text className="text-[10px] text-brand">{item.receipt.name}</Text></Pressable> : null}</View></Surface>)}</View>
  </Page>;
}
