import { Button, InputField, Page, Surface, Text, TopBar } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { goBackOrHome } from "@/data/navigation";
import { useState } from "react";

export default function NewSupplierScreen() {
  const { createSupplier } = useInventory();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!name.trim()) { setError("Supplier name is required."); return; }
    setBusy(true); setError("");
    try { await createSupplier(name.trim(), category.trim(), phone.trim()); goBackOrHome(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save supplier."); }
    finally { setBusy(false); }
  };
  return <Page>
    <TopBar title="New supplier" subtitle="Keep your purchasing contacts together" />
    <Surface className="p-5">
      <InputField label="Supplier name" value={name} onChangeText={setName} required />
      <InputField label="Products supplied" value={category} onChangeText={setCategory} placeholder="e.g. general merchandise" />
      <InputField label="Phone" value={phone} onChangeText={setPhone} />
      {error ? <Text className="mb-4 text-[12px] text-danger">{error}</Text> : null}
      <Button title={busy ? "Saving..." : "Save supplier"} disabled={busy} onPress={() => void save()} />
    </Surface>
  </Page>;
}
