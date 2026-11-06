import { Button, Icon, Page, ProductArt, SectionTitle, Surface, Text, TopBar } from "@/components/ui";
import { TradeStatus } from "@/components/TradeStatus";
import { useInventory } from "@/context/InventoryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTrade } from "@/context/TradeContext";
import { router } from "expo-router";
import { View } from "react-native";

export default function CourierScreen() {
  const { data } = useTrade();
  const { data: inventory } = useInventory();
  const { t } = useLanguage();
  return <Page>
    <TopBar title="Courier arrivals" subtitle="Log incoming goods and update stock" />
    <TradeStatus />
    <Surface className="flex-row items-center gap-4 bg-[#E4F9F1] p-5"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-white"><Icon name="airplane-outline" color="#079965" /></View><View><Text className="text-[19px] font-extrabold text-ink">{data.arrivals.length}</Text><Text className="text-[11px] text-muted">Recorded arrivals</Text></View></Surface>
    <View className="mt-4"><Button title="Register arrival" icon="add" onPress={() => router.push("/new-arrival")} /></View>
    <SectionTitle title="Arrival history" />
    <View className="gap-3">{data.arrivals.map((item) => { const product = inventory.products.find((p) => p.id === item.productId); return <Surface key={item.id} className="p-4"><View className="flex-row items-center gap-3">{product ? <ProductArt product={product} size="small" /> : null}<View className="flex-1"><Text className="text-[12px] font-bold text-ink">{product?.name ?? "Product"}</Text><Text className="mt-1 text-[10px] text-muted">{item.id} · {item.date}</Text></View><View className="rounded-full bg-[#E0F8EE] px-2.5 py-1"><Text className="text-[10px] font-bold text-[#078759]">Received</Text></View></View><View className="mt-4 flex-row justify-between border-t border-line pt-3"><View><Text className="text-[10px] text-muted">Arrived quantity</Text><Text className="mt-1 text-[12px] font-bold text-ink">{item.quantity} {product?.unit}</Text></View><View><Text className="text-[10px] text-muted">Courier</Text><Text className="mt-1 text-[12px] font-bold text-ink">{item.courier}</Text></View></View>{item.purchaseId ? <Text className="mt-3 text-[10px] text-muted">{t("Linked purchase")}: {item.purchaseId}</Text> : null}</Surface>; })}</View>
  </Page>;
}
