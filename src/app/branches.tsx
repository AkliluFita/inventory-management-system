import { Icon, Page, SearchField, SectionTitle, StatusBadge, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { Branch } from "@/data/inventoryApi";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function BranchesScreen() {
  const { data, activeBranchId, setActiveBranchId } = useInventory();
  const [search, setSearch] = useState("");
  const branches = data.branches.filter((item) => `${item.name} ${item.city}`.toLowerCase().includes(search.toLowerCase()));
  const active = data.branches.filter((item) => item.status === "Active").length;

  const select = (branch: Branch) => {
    if (branch.status !== "Active") return;
    setActiveBranchId(branch.id);
    router.back();
  };

  return (
    <Page>
      <TopBar title="Branches" subtitle="Manage every location" />
      <View className="mb-5 flex-row gap-3"><Surface className="flex-1 p-4"><Text className="text-[24px] font-extrabold text-ink">{data.branches.length}</Text><Text className="mt-1 text-[10px] text-muted">Total branches</Text></Surface><Surface className="flex-1 p-4"><Text className="text-[24px] font-extrabold text-mint">{active}</Text><Text className="mt-1 text-[10px] text-muted">Active now</Text></Surface></View>
      <SearchField value={search} onChangeText={setSearch} placeholder="Search branches..." />
      <SectionTitle title="Locations" action={`${branches.length} found`} />
      <View className="gap-3">{branches.map((branch) => <Pressable key={branch.id} onPress={() => select(branch)} className={`rounded-[20px] border bg-white p-4 ${activeBranchId === branch.id ? "border-brand" : "border-line"}`}><View className="flex-row items-center gap-3"><View className={`h-11 w-11 items-center justify-center rounded-2xl ${branch.status === "Active" ? "bg-[#E8F1FF]" : branch.status === "Pending" ? "bg-[#FFF2DE]" : "bg-[#EDF1F7]"}`}><Icon name="business-outline" size={21} color={branch.status === "Active" ? "#0869F2" : branch.status === "Pending" ? "#E2931B" : "#8794A9"} /></View><View className="flex-1"><Text className="text-[12px] font-bold text-ink">{branch.name}</Text><Text className="mt-1 text-[10px] text-muted">{branch.items.toLocaleString()} items · {branch.staff} staff</Text></View><StatusBadge label={branch.status} tone={branch.status === "Active" ? "green" : branch.status === "Pending" ? "amber" : "slate"} /></View>{activeBranchId === branch.id ? <View className="mt-3 flex-row items-center gap-1.5 border-t border-line pt-3"><Icon name="checkmark-circle" size={15} color="#0869F2" /><Text className="text-[10px] font-semibold text-brand">Current branch</Text></View> : branch.status !== "Active" ? <Text className="mt-3 border-t border-line pt-3 text-[10px] text-muted">Unavailable for selection in demo mode</Text> : null}</Pressable>)}</View>
      {branches.length === 0 ? <Surface className="items-center p-8"><Text className="text-[12px] text-muted">No branches found.</Text></Surface> : null}
      <Text className="mt-5 text-center text-[10px] leading-4 text-muted">The demo catalog is shared across branches. A connected API can return stock for each location.</Text>
    </Page>
  );
}
