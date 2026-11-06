import { Chip, EmptyState, Icon, IconButton, Page, ProductArt, SearchField, SectionTitle, StatusBadge, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { Product, money } from "@/data/inventoryApi";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";

export default function SalesScreen() {
  const { data, activeBranchId, cart, addToCart } = useInventory();
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const branch = data.branches.find((item) => item.id === activeBranchId) ?? data.branches[0];
  const categories = ["All", ...new Set(data.products.map((item) => item.category))];
  const products = useMemo(() => data.products.filter((item) => {
    const matchesSearch = `${item.name} ${item.sku} ${item.brand}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === "All" || item.category === category);
  }), [data.products, search, category]);
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const columns = width >= 720 ? 3 : 2;

  return (
    <Page>
      <TopBar title="Point of sale" subtitle="Find an item and start a sale" back={false} right={<IconButton name="cart-outline" badge={cartCount} onPress={() => router.push("/cart")} />} />
      <Pressable onPress={() => router.push("/branches")} className="mb-4 flex-row items-center gap-2 self-start rounded-xl border border-line bg-white px-3 py-2"><Icon name="location-outline" size={14} color="#0869F2" /><Text className="text-[11px] font-semibold text-ink">{branch?.name ?? "Select branch"}</Text><Icon name="chevron-down" size={13} color="#7E8DA6" /></Pressable>
      <SearchField value={search} onChangeText={setSearch} placeholder="Search product, brand, or SKU..." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-[18px] mt-4" contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
        {categories.map((item) => <Chip key={item} title={item} selected={category === item} onPress={() => setCategory(item)} />)}
      </ScrollView>
      <SectionTitle title="Products" action={`${products.length} items`} />
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {products.map((product) => <ProductCard key={product.id} product={product} width={`${100 / columns - 2}%`} inCart={cart.find((item) => item.productId === product.id)?.quantity ?? 0} onAdd={() => addToCart(product.id)} />)}
      </View>
      {products.length === 0 && data.products.length === 0 ? <EmptyState icon="cube-outline" title="No products in this branch" detail="Add a product, then receive stock before making a sale." action="Add product" onAction={() => router.push("/new-product")} /> : null}
      {products.length === 0 && data.products.length > 0 ? <View className="items-center rounded-[20px] border border-line bg-white p-10"><Icon name="search-outline" size={30} color="#9AA6BB" /><Text className="mt-3 text-[13px] font-bold text-ink">No products match</Text><Text className="mt-1 text-[11px] text-muted">Try a different search or category.</Text></View> : null}
      {cartCount > 0 ? <Pressable onPress={() => router.push("/cart")} className="mt-5 flex-row items-center justify-between rounded-[18px] bg-brand px-5 py-4"><View className="flex-row items-center gap-3"><View className="h-8 w-8 items-center justify-center rounded-lg bg-white/20"><Text className="text-[12px] font-bold text-white">{cartCount}</Text></View><Text className="text-[13px] font-bold text-white">View cart</Text></View><Icon name="arrow-forward" size={20} color="#fff" /></Pressable> : null}
    </Page>
  );
}

function ProductCard({ product, width, inCart, onAdd }: { product: Product; width: string; inCart: number; onAdd: () => void }) {
  const disabled = product.stock === 0 || inCart >= product.stock;
  return (
    <View style={{ width: width as `${number}%` }} className="rounded-[20px] border border-line bg-white p-3">
      <View className="items-center rounded-[16px] py-2" style={{ backgroundColor: product.tint }}><ProductArt product={product} size="medium" /></View>
      <View className="mt-3 min-h-[40px]"><Text className="text-[11px] font-bold leading-4 text-ink" numberOfLines={2}>{product.name}</Text></View>
      <Text className="mt-1 text-[10px] text-muted">{product.brand}</Text>
      <View className="mt-2"><StatusBadge label={product.stock === 0 ? "Out of stock" : `${product.stock} ${product.unit}`} tone={product.stock === 0 ? "red" : "green"} /></View>
      <View className="mt-3 flex-row items-end justify-between gap-1"><Text className="flex-1 text-[12px] font-extrabold text-ink" numberOfLines={1}>{money(product.price)}</Text><Pressable disabled={disabled} onPress={onAdd} accessibilityLabel={`Add ${product.name} to cart`} className={`h-8 w-8 items-center justify-center rounded-xl ${disabled ? "bg-[#E9EEF7]" : "bg-brand"}`}><Icon name={inCart > 0 ? "checkmark" : "add"} size={19} color={disabled ? "#9AA6BB" : "#fff"} /></Pressable></View>
    </View>
  );
}
