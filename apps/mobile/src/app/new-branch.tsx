import { Button, InputField, Page, Surface, Text, TopBar } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { router } from "expo-router";
import { useState } from "react";

export default function NewBranchScreen() {
  const { createBranch } = useInventory();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!name.trim()) { setError("Branch name is required."); return; }
    setBusy(true); setError("");
    try { await createBranch(name.trim(), city.trim()); router.replace("/branches"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save branch."); }
    finally { setBusy(false); }
  };
  return <Page>
    <TopBar title="New branch" subtitle="Track stock separately at each location" />
    <Surface className="p-5">
      <InputField label="Branch name" value={name} onChangeText={setName} required />
      <InputField label="City" value={city} onChangeText={setCity} />
      {error ? <Text className="mb-4 text-[12px] text-danger">{error}</Text> : null}
      <Button title={busy ? "Saving..." : "Create branch"} disabled={busy} onPress={() => void save()} />
    </Surface>
  </Page>;
}
