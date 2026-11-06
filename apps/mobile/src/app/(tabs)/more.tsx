import { Icon, IconName, Page, SectionTitle, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

const shortcuts: { title: string; detail: string; icon: IconName; href: "/procurement" | "/debts" | "/branches" | "/profile" | "/new-intake" | "/cart" | "/imports" | "/courier" | "/transfers"; tint: string }[] = [
  { title: "Stock intake", detail: "Receive new inventory", icon: "cube-outline", href: "/procurement", tint: "#E8F1FF" },
  { title: "Customer debts", detail: "Track unpaid balances", icon: "wallet-outline", href: "/debts", tint: "#FFE8EC" },
  { title: "Branches", detail: "Switch locations", icon: "business-outline", href: "/branches", tint: "#E2F7EE" },
  { title: "New intake", detail: "Add incoming stock", icon: "add-circle-outline", href: "/new-intake", tint: "#FFF1DB" },
  { title: "Import purchases", detail: "Landed costs and exchange rates", icon: "globe-outline", href: "/imports", tint: "#E9E8FF" },
  { title: "Courier arrivals", detail: "Receive goods and update stock", icon: "airplane-outline", href: "/courier", tint: "#E2F7EE" },
  { title: "Bank transfers", detail: "Payments and receipts", icon: "swap-horizontal-outline", href: "/transfers", tint: "#E6F3F9" },
  { title: "Current cart", detail: "Finish a sale", icon: "cart-outline", href: "/cart", tint: "#E9E8FF" },
  { title: "Profile & access", detail: "Account settings", icon: "person-outline", href: "/profile", tint: "#E6F3F9" },
];

export default function MoreScreen() {
  const { session, demo } = useAuth();
  const { data, activeBranchId } = useInventory();
  const branch = data.branches.find((item) => item.id === activeBranchId);
  return (
    <Page>
      <TopBar title="Workspace" subtitle="Everything you need, in one place" back={false} />
      <Pressable onPress={() => router.push("/profile")} className="flex-row items-center gap-4 rounded-[22px] bg-navy p-5"><View className="h-14 w-14 items-center justify-center rounded-[18px] bg-white/15"><Text className="text-[17px] font-extrabold text-white">{session ? "PS" : "DE"}</Text></View><View className="flex-1"><Text className="text-[16px] font-bold text-white">{session?.user.phone ?? session?.user.email ?? "Demo workspace"}</Text><Text className="mt-1 text-[11px] text-[#BBD1F3]">{session ? "Owner" : "Demo"} · {branch?.name}</Text></View><Icon name="chevron-forward" size={18} color="#fff" /></Pressable>
      <SectionTitle title="Manage" />
      <Surface className="px-4">{shortcuts.map((item) => <Pressable key={item.title} onPress={() => router.push(item.href)} className="flex-row items-center gap-3 border-b border-line py-4 last:border-b-0"><View style={{ backgroundColor: item.tint }} className="h-11 w-11 items-center justify-center rounded-2xl"><Icon name={item.icon} size={21} color="#1A4B83" /></View><View className="flex-1"><Text className="text-[12px] font-bold text-ink">{item.title}</Text><Text className="mt-0.5 text-[10px] text-muted">{item.detail}</Text></View><Icon name="chevron-forward" size={16} color="#9BA9BC" /></Pressable>)}</Surface>
      <View className="mt-7 items-center"><View className="flex-row items-center gap-2"><Icon name="cube" size={14} color="#9AA6BB" /><Text className="text-[11px] font-bold text-muted">PrimeStock</Text></View><Text className="mt-1 text-[10px] text-muted">{demo ? "Demo workspace" : "Live workspace"} · v1.0</Text></View>
    </Page>
  );
}
