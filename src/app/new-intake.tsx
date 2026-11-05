import { Button, Icon, InputField, Page, PickerField, ProductArt, SectionTitle, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { Intake, money } from "@/data/inventoryApi";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

type Draft = Omit<Intake, "id" | "date" | "status">;

export default function NewIntakeScreen() {
  const { data, createIntakes } = useInventory();
  const [productId, setProductId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [batch, setBatch] = useState(`BCH-${new Date().getFullYear()}-${String(data.intakes.length + 1).padStart(3, "0")}`);
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [queued, setQueued] = useState<Draft[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const product = data.products.find((item) => item.id === productId);

  const current = (): Draft | null => {
    const qty = Number(quantity);
    const cost = Number(unitCost);
    if (!productId || !supplierId || !batch.trim() || !Number.isInteger(qty) || qty <= 0 || !Number.isFinite(cost) || cost <= 0) {
      setError("Complete every required field with a quantity and cost above zero.");
      return null;
    }
    setError("");
    return { productId, supplierId, batch: batch.trim(), quantity: qty, unitCost: cost };
  };

  const addAnother = () => {
    const item = current();
    if (!item) return;
    setQueued((items) => [...items, item]);
    setProductId(""); setQuantity(""); setUnitCost("");
    setBatch(`BCH-${new Date().getFullYear()}-${String(data.intakes.length + queued.length + 2).padStart(3, "0")}`);
  };

  const save = async () => {
    const item = productId || quantity || unitCost ? current() : null;
    if (!item && queued.length === 0) { setError("Add at least one item to this intake."); return; }
    if ((productId || quantity || unitCost) && !item) return;
    setSaving(true);
    try {
      await createIntakes([...queued, ...(item ? [item] : [])]);
      router.replace({ pathname: "/procurement", params: { created: "1" } });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save intake."); }
    finally { setSaving(false); }
  };

  return (
    <Page>
      <TopBar title="New stock intake" subtitle="Receive products into inventory" />
      <Surface className="p-4"><View className="flex-row gap-3"><View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E8F1FF]"><Icon name="cube-outline" size={20} color="#0869F2" /></View><View className="flex-1"><Text className="text-[12px] font-bold text-ink">Keep stock accurate</Text><Text className="mt-1 text-[10px] leading-4 text-muted">Received items increase available stock when you save.</Text></View></View></Surface>
      <SectionTitle title="Item details" />
      <PickerField label="Product" required value={productId} onChange={(id) => { setProductId(id); const selected = data.products.find((item) => item.id === id); if (selected) setUnitCost(String(selected.cost)); }} options={data.products.map((item) => ({ label: item.name, value: item.id, subtitle: `${item.sku} · ${item.category}` }))} />
      {product ? <Surface className="mb-4 flex-row items-center gap-3 p-3"><ProductArt product={product} size="small" /><View><Text className="text-[11px] font-bold text-ink">{product.name}</Text><Text className="mt-1 text-[10px] text-muted">Current stock: {product.stock} {product.unit}</Text></View></Surface> : null}
      <InputField label="Batch number" required value={batch} onChangeText={setBatch} placeholder="Enter batch or lot number" />
      <View className="flex-row gap-3"><View className="flex-1"><InputField label="Quantity" required value={quantity} onChangeText={setQuantity} placeholder="0" keyboardType="numeric" /></View><View className="flex-1"><InputField label="Unit cost (ETB)" required value={unitCost} onChangeText={setUnitCost} placeholder="0" keyboardType="decimal-pad" /></View></View>
      <PickerField label="Supplier" required value={supplierId} onChange={setSupplierId} options={data.suppliers.map((item) => ({ label: item.name, value: item.id, subtitle: item.category }))} />
      {product && Number(quantity) > 0 && Number(unitCost) > 0 ? <Surface className="mb-4 flex-row justify-between p-4"><Text className="text-[11px] text-muted">Estimated purchase value</Text><Text className="text-[12px] font-bold text-ink">{money(Number(quantity) * Number(unitCost))}</Text></Surface> : null}
      {queued.length > 0 ? <><SectionTitle title={`Queued items (${queued.length})`} /><Surface className="px-4">{queued.map((item, index) => <View key={`${item.batch}-${index}`} className="flex-row items-center justify-between border-b border-line py-3 last:border-b-0"><View className="flex-1"><Text className="text-[11px] font-bold text-ink">{data.products.find((product) => product.id === item.productId)?.name}</Text><Text className="mt-1 text-[10px] text-muted">{item.quantity} units · {item.batch}</Text></View><Pressable onPress={() => setQueued((items) => items.filter((_, position) => position !== index))}><Icon name="close-circle-outline" size={20} color="#EA4F63" /></Pressable></View>)}</Surface></> : null}
      {error ? <Text className="mt-3 text-[11px] font-semibold text-danger">{error}</Text> : null}
      <View className="mt-7 gap-3"><Button title="Add another item" icon="add" variant="outline" onPress={addAnother} /><Button title={saving ? "Saving intake..." : "Save stock intake"} icon="checkmark" disabled={saving} onPress={() => void save()} /></View>
    </Page>
  );
}
