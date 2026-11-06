import { Button, Chip, Icon, Page, ProductArt, SearchField, SectionTitle, StatusBadge, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { Intake, money } from "@/data/inventoryApi";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";

export default function ProcurementScreen() {
  const { data } = useInventory();
  const params = useLocalSearchParams<{ created?: string }>();
  const [tab, setTab] = useState<"intakes" | "suppliers">("intakes");
  const [search, setSearch] = useState("");
  const [monthOnly, setMonthOnly] = useState(false);
  const intakes = useMemo(() => data.intakes.filter((item) => {
    const product = data.products.find((product) => product.id === item.productId);
    const supplier = data.suppliers.find((supplier) => supplier.id === item.supplierId);
    const matches = `${product?.name ?? ""} ${item.batch} ${supplier?.name ?? ""}`.toLowerCase().includes(search.toLowerCase());
    return matches && (!monthOnly || item.date.slice(0, 7) === new Date().toISOString().slice(0, 7));
  }), [data.intakes, data.products, data.suppliers, search, monthOnly]);
  const suppliers = data.suppliers.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Page>
      <TopBar title="Procurement" subtitle="Stock intake & suppliers" />
      {params.created === "1" ? <View className="mb-4 flex-row items-center gap-2 rounded-2xl bg-[#E0F8EE] p-3"><Icon name="checkmark-circle" size={18} color="#078759" /><Text className="text-[11px] font-bold text-[#078759]">Stock intake saved successfully</Text></View> : null}
      <View className="mb-5 flex-row rounded-[15px] bg-[#E8EEF8] p-1">
        <Pressable onPress={() => setTab("intakes")} className={`flex-1 items-center rounded-xl py-2.5 ${tab === "intakes" ? "bg-white" : ""}`}><Text className={`text-[12px] font-bold ${tab === "intakes" ? "text-brand" : "text-muted"}`}>Stock intakes</Text></Pressable>
        <Pressable onPress={() => setTab("suppliers")} className={`flex-1 items-center rounded-xl py-2.5 ${tab === "suppliers" ? "bg-white" : ""}`}><Text className={`text-[12px] font-bold ${tab === "suppliers" ? "text-brand" : "text-muted"}`}>Suppliers</Text></Pressable>
      </View>
      <SearchField value={search} onChangeText={setSearch} placeholder={tab === "intakes" ? "Search product, batch, supplier..." : "Search supplier..."} />
      {tab === "intakes" ? <>
        <View className="mb-4 mt-3 flex-row gap-2"><Chip title="All dates" selected={!monthOnly} onPress={() => setMonthOnly(false)} /><Chip title="This month" selected={monthOnly} onPress={() => setMonthOnly(true)} /></View>
        <View className="flex-row gap-2"><View className="flex-1"><Button title="Register intake" icon="add" onPress={() => router.push("/new-intake")} /></View><View className="flex-1"><Button title="Import purchase" icon="globe-outline" variant="outline" onPress={() => router.push("/imports")} /></View></View>
        <View className="mt-2"><Button title="Log courier arrival" icon="airplane-outline" variant="soft" onPress={() => router.push("/courier")} /></View>
        <SectionTitle title="Recent stock intakes" action={`${intakes.length} records`} />
        <View className="gap-3">{intakes.map((item) => <IntakeCard key={item.id} intake={item} />)}</View>
        {intakes.length === 0 ? <Surface className="items-center p-8"><Text className="text-[12px] text-muted">No intakes match your search.</Text></Surface> : null}
      </> : <>
        <SectionTitle title="Trusted suppliers" action="Add supplier" onAction={() => router.push("/new-supplier")} />
        <View className="gap-3">{suppliers.map((supplier) => <Surface key={supplier.id} className="p-4"><View className="flex-row items-center gap-3"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F1FF]"><Icon name="business-outline" size={22} color="#0869F2" /></View><View className="flex-1"><Text className="text-[12px] font-bold text-ink">{supplier.name}</Text><Text className="mt-1 text-[10px] text-muted">{supplier.category}</Text></View><StatusBadge label={`${supplier.rating} ★`} tone="amber" /></View><View className="mt-4 flex-row justify-between border-t border-line pt-3"><Text className="text-[10px] text-muted">{supplier.orders} fulfilled orders</Text><Text className="text-[10px] font-semibold text-brand">{supplier.phone}</Text></View></Surface>)}</View>
        {suppliers.length === 0 ? <Surface className="items-center p-8"><Text className="text-[12px] text-muted">No suppliers match your search.</Text></Surface> : null}
      </>}
    </Page>
  );
}

function IntakeCard({ intake }: { intake: Intake }) {
  const { data } = useInventory();
  const product = data.products.find((item) => item.id === intake.productId);
  const supplier = data.suppliers.find((item) => item.id === intake.supplierId);
  if (!product) return null;
  return (
    <Surface className="p-4">
      <View className="flex-row items-center gap-3"><ProductArt product={product} size="small" /><View className="flex-1"><Text className="text-[12px] font-bold text-ink" numberOfLines={1}>{product.name}</Text><Text className="mt-1 text-[10px] text-muted">{intake.batch} · {intake.date}</Text></View><StatusBadge label={intake.status} tone={intake.status === "Received" ? "green" : intake.status === "In transit" ? "amber" : "slate"} /></View>
      <View className="mt-4 flex-row justify-between border-t border-line pt-3"><View><Text className="text-[9px] text-muted">QUANTITY</Text><Text className="mt-1 text-[11px] font-bold text-ink">{intake.quantity} {product.unit}</Text></View><View><Text className="text-[9px] text-muted">PURCHASE VALUE</Text><Text className="mt-1 text-[11px] font-bold text-ink">{money(intake.quantity * intake.unitCost)}</Text></View><View><Text className="text-[9px] text-muted">SUPPLIER</Text><Text className="mt-1 max-w-[90px] text-[10px] font-bold text-ink" numberOfLines={1}>{supplier?.name}</Text></View></View>
    </Surface>
  );
}
