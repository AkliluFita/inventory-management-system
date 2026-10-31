import { Button, Chip, Icon, IconButton, MetricCard, Page, ProductArt, ProductStatus, SearchField, SectionTitle, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { Product, money, stockStatus } from "@/data/inventoryApi";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

const statusFilters = ["All", "In stock", "Low stock", "Out of stock"];

export default function InventoryScreen() {
  const { data } = useInventory();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [search, setSearch] = useState("");
  const [chosenStatus, setChosenStatus] = useState("All");
  const status = params.filter === "low" ? "Low stock" : params.filter === "out" ? "Out of stock" : chosenStatus;
  const chooseStatus = (value: string) => { router.setParams({ filter: "" }); setChosenStatus(value); };
  const [category, setCategory] = useState("All categories");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.products.find((item) => item.id === selectedId);
  const low = data.products.filter((item) => stockStatus(item) === "low-stock").length;
  const out = data.products.filter((item) => stockStatus(item) === "out-of-stock").length;
  const categories = ["All categories", ...new Set(data.products.map((item) => item.category))];
  const products = useMemo(() => data.products.filter((item) => {
    const matchesSearch = `${item.name} ${item.sku} ${item.brand} ${item.category}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All categories" || item.category === category;
    const stock = stockStatus(item);
    const matchesStatus = status === "All" || (status === "In stock" && stock === "in-stock") || (status === "Low stock" && stock === "low-stock") || (status === "Out of stock" && stock === "out-of-stock");
    return matchesSearch && matchesCategory && matchesStatus;
  }), [data.products, search, category, status]);

  return (
    <Page>
      <TopBar title="Inventory" subtitle="Know what you have, everywhere" back={false} right={<IconButton name="add" onPress={() => router.push("/new-intake")} />} />
      <SearchField value={search} onChangeText={setSearch} placeholder="Search product, SKU, brand..." />
      <View className="mt-4 flex-row gap-3">
        <MetricCard title="Products" value={String(data.products.length)} icon="cube-outline" tone="blue" />
        <MetricCard title="Low stock" value={String(low)} icon="alert-circle-outline" tone="amber" onPress={() => chooseStatus("Low stock")} />
        <MetricCard title="Out of stock" value={String(out)} icon="close-circle-outline" tone="red" onPress={() => chooseStatus("Out of stock")} />
      </View>
      <SectionTitle title="Stock levels" action="Stock intake" onAction={() => router.push("/procurement")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-[18px]" contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
        {statusFilters.map((item) => <Chip key={item} title={item} selected={status === item} onPress={() => chooseStatus(item)} />)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-[18px] mt-3" contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
        {categories.map((item) => <Chip key={item} title={item} selected={category === item} onPress={() => setCategory(item)} />)}
      </ScrollView>
      <Text className="mb-2 mt-5 text-[11px] text-muted">Showing {products.length} products</Text>
      <View className="gap-3">
        {products.map((product) => <InventoryCard key={product.id} product={product} onPress={() => setSelectedId(product.id)} />)}
        {products.length === 0 ? <Surface className="items-center p-8"><Icon name="search-outline" size={30} color="#9AA6BB" /><Text className="mt-3 text-[13px] font-bold text-ink">No products found</Text><Text className="mt-1 text-[11px] text-muted">Try another search or filter.</Text></Surface> : null}
      </View>
      <Surface className="mt-5 flex-row items-center gap-3 border-[#FFD6DB] bg-[#FFF2F3] p-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFE1E5]"><Icon name="warning-outline" size={19} color="#E1475A" /></View>
        <View className="flex-1"><Text className="text-[11px] font-bold text-ink">Stock needs attention</Text><Text className="mt-0.5 text-[10px] text-muted">{low + out} products are below their reorder point.</Text></View>
        <Pressable onPress={() => router.push("/reorder?id=p4")} className="rounded-lg bg-danger px-3 py-2"><Text className="text-[10px] font-bold text-white">Reorder</Text></Pressable>
      </Surface>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelectedId(null)}>
        <View className="flex-1 justify-end bg-[#061D43]/40">
          <Pressable className="absolute inset-0" onPress={() => setSelectedId(null)} />
          {selected ? <View className="rounded-t-[30px] bg-canvas px-5 pb-9 pt-4">
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-[#C8D3E4]" />
            <View className="flex-row gap-4"><ProductArt product={selected} size="large" /><View className="flex-1 justify-center"><Text className="text-[18px] font-extrabold text-ink">{selected.name}</Text><Text className="mb-2 mt-1 text-[11px] text-muted">{selected.sku} · {selected.brand}</Text><ProductStatus product={selected} /></View></View>
            <Text className="mt-5 text-[12px] leading-5 text-muted">{selected.description}</Text>
            <View className="my-5 flex-row gap-3"><MetricCard title="Available" value={`${selected.stock} ${selected.unit}`} icon="cube-outline" /><MetricCard title="Selling price" value={money(selected.price)} icon="pricetag-outline" tone="mint" /></View>
            <View className="flex-row gap-3"><View className="flex-1"><Button title="Close" variant="outline" onPress={() => setSelectedId(null)} /></View><View className="flex-1"><Button title="Reorder" icon="add" onPress={() => { const id = selected.id; setSelectedId(null); router.push({ pathname: "/reorder", params: { id } }); }} /></View></View>
          </View> : null}
        </View>
      </Modal>
    </Page>
  );
}

function InventoryCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const ratio = Math.min(product.stock / Math.max(product.minStock * 4, 1), 1);
  const stock = stockStatus(product);
  return (
    <Pressable onPress={onPress} className="rounded-[20px] border border-line bg-white p-3.5">
      <View className="flex-row items-center gap-3"><ProductArt product={product} /><View className="flex-1"><Text className="text-[12px] font-bold text-ink" numberOfLines={2}>{product.name}</Text><Text className="mt-1 text-[10px] text-muted">{product.sku} · {product.category}</Text><View className="mt-2"><ProductStatus product={product} /></View></View><Icon name="chevron-forward" size={17} color="#9AA6BB" /></View>
      <View className="mt-4 flex-row items-center justify-between"><Text className="text-[11px] text-muted">{product.stock} {product.unit} available</Text><Text className="text-[11px] font-bold text-ink">{money(product.price)}</Text></View>
      <View className="mt-2 h-1.5 rounded-full bg-[#E9EEF7]"><View style={{ width: `${Math.max(ratio * 100, product.stock ? 5 : 0)}%` }} className={`h-1.5 rounded-full ${stock === "in-stock" ? "bg-mint" : stock === "low-stock" ? "bg-amber" : "bg-danger"}`} /></View>
    </Pressable>
  );
}
