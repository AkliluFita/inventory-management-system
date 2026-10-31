import { Button, Icon, Page, ProductArt, SectionTitle, Surface, Text, TopBar } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTrade } from "@/context/TradeContext";
import { money } from "@/data/inventoryApi";
import { landedUnitCost, totalImportCost } from "@/data/tradeApi";
import { router } from "expo-router";
import { View } from "react-native";

export default function ImportsScreen() {
  const { data } = useTrade();
  const { data: inventory } = useInventory();
  const { t } = useLanguage();
  const total = data.purchases.reduce((sum, item) => sum + totalImportCost(item), 0);
  return <Page>
    <TopBar title="Import purchases" subtitle="Track purchase costs and landed value" />
    <Surface className="flex-row items-center gap-4 bg-[#EAF2FF] p-5"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-white"><Icon name="globe-outline" color="#0869F2" /></View><View className="flex-1"><Text className="text-[11px] font-semibold text-muted">Total landed cost</Text><Text className="mt-1 text-[19px] font-extrabold text-ink">{money(total)}</Text><Text className="mt-1 text-[10px] text-muted">{data.purchases.length} {t("purchase records")}</Text></View></Surface>
    <View className="mt-4"><Button title="New import purchase" icon="add" onPress={() => router.push("/new-import")} /></View>
    <SectionTitle title="Purchase history" />
    <View className="gap-3">{data.purchases.map((item) => { const product = inventory.products.find((p) => p.id === item.productId); return <Surface key={item.id} className="p-4"><View className="flex-row items-center gap-3">{product ? <ProductArt product={product} size="small" /> : null}<View className="flex-1"><Text className="text-[12px] font-bold text-ink">{product?.name ?? "Product"}</Text><Text className="mt-1 text-[10px] text-muted">{item.id} · {item.date}</Text></View><Icon name="chevron-forward" size={15} color="#9BA9BC" /></View><View className="mt-4 flex-row justify-between border-t border-line pt-3"><View><Text className="text-[10px] text-muted">Quantity</Text><Text className="mt-1 text-[12px] font-bold text-ink">{item.quantity} {product?.unit}</Text></View><View><Text className="text-[10px] text-muted">Landed / unit</Text><Text className="mt-1 text-[12px] font-bold text-ink">{money(landedUnitCost(item))}</Text></View><View><Text className="text-[10px] text-muted">Total cost</Text><Text className="mt-1 text-[12px] font-bold text-brand">{money(totalImportCost(item))}</Text></View></View><Text className="mt-3 text-[10px] text-muted">{item.supplier} · USD {item.unitPriceUsd.toFixed(2)} × {item.usdRateEtb.toFixed(2)} ETB + {money(item.freightEtb)} {t("freight")}</Text></Surface>; })}</View>
  </Page>;
}
