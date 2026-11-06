import { Button, InputField, Page, Surface, Text, TopBar } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { goBackOrHome } from "@/data/navigation";
import { useState } from "react";

export default function NewProductScreen() {
  const { createProduct, activeBranchId } = useInventory();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [minStock, setMinStock] = useState("0");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!activeBranchId || !name.trim() || !sku.trim() || !unit.trim() || !minStock.trim() || !price.trim() || !cost.trim() || !Number.isInteger(Number(minStock)) || Number(minStock) < 0 || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isFinite(Number(cost)) || Number(cost) < 0) {
      setError("Enter a name, SKU, unit, and valid stock and price values."); return;
    }
    setBusy(true); setError("");
    try {
      await createProduct({
        name: name.trim(), sku: sku.trim(), category: category.trim() || "General",
        brand: brand.trim(), unit: unit.trim(), minStock: Number(minStock),
        price: Number(price), cost: Number(cost), description: description.trim(),
      });
      goBackOrHome();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save product."); }
    finally { setBusy(false); }
  };
  return <Page>
    <TopBar title="New product" subtitle="Add any item to this branch" />
    <Surface className="p-5">
      <InputField label="Product name" value={name} onChangeText={setName} required />
      <InputField label="SKU" value={sku} onChangeText={setSku} autoCapitalize="characters" required />
      <InputField label="Category" value={category} onChangeText={setCategory} placeholder="General" />
      <InputField label="Brand" value={brand} onChangeText={setBrand} />
      <InputField label="Unit" value={unit} onChangeText={setUnit} placeholder="pcs, kg, box..." required />
      <InputField label="Reorder point" value={minStock} onChangeText={setMinStock} keyboardType="numeric" required />
      <InputField label="Selling price (ETB)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" required />
      <InputField label="Unit cost (ETB)" value={cost} onChangeText={setCost} keyboardType="decimal-pad" required />
      <InputField label="Description" value={description} onChangeText={setDescription} />
      {error ? <Text className="mb-4 text-[12px] text-danger">{error}</Text> : null}
      <Button title={busy ? "Saving..." : "Save product"} disabled={busy} onPress={() => void save()} />
    </Surface>
    <Text className="mt-4 text-center text-[11px] text-muted">Initial stock is zero. Use Stock intake to receive inventory.</Text>
  </Page>;
}
