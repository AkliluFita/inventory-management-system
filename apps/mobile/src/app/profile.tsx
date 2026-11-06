import { Icon, IconName, LanguageSelector, Page, SectionTitle, StatusBadge, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Pressable, Switch, View } from "react-native";

function SettingRow({ icon, title, detail, onPress, trailing }: { icon: IconName; title: string; detail: string; onPress?: () => void; trailing?: React.ReactNode }) {
  return <Pressable onPress={onPress} className="flex-row items-center gap-3 border-b border-line py-4 last:border-b-0"><View className="h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FD]"><Icon name={icon} size={18} color="#1D4B84" /></View><View className="flex-1"><Text className="text-[12px] font-bold text-ink">{title}</Text><Text className="mt-0.5 text-[10px] text-muted">{detail}</Text></View>{trailing ?? <Icon name="chevron-forward" size={16} color="#9AA6BB" />}</Pressable>;
}

export default function ProfileScreen() {
  const { session, demo, exitDemo, signOut } = useAuth();
  const { data, activeBranchId } = useInventory();
  const [notifications, setNotifications] = useState(true);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const branch = data.branches.find((item) => item.id === activeBranchId);
  return (
    <Page>
      <TopBar title="Profile" subtitle="Your account & preferences" />
      <Surface className="items-center p-6"><View className="h-20 w-20 items-center justify-center rounded-[26px] bg-[#DCEBFF]"><Text className="text-[27px] font-extrabold text-brand">{session ? "PS" : "DE"}</Text></View><Text className="mt-4 text-[19px] font-extrabold text-ink">{session ? (session.user.user_metadata?.full_name || "Workspace owner") : "Demo workspace"}</Text><Text className="mt-1 text-[11px] text-muted">{session?.user.phone ?? session?.user.email ?? "Local preview"}</Text><View className="mt-3"><StatusBadge label={session ? "Owner" : "Demo"} tone="blue" /></View></Surface>
      <SectionTitle title="Workspace" />
      <Surface className="px-4"><SettingRow icon="business-outline" title="Active branch" detail={branch?.name ?? "No branch selected"} onPress={() => router.push("/branches")} /><SettingRow icon="shield-checkmark-outline" title="Role & permissions" detail={session ? "Workspace owner" : "Demo access"} onPress={() => setPermissionsOpen(true)} /></Surface>
      <SectionTitle title="Preferences" />
      <Surface className="px-4"><SettingRow icon="notifications-outline" title="Notifications" detail={notifications ? "Alerts enabled for this session" : "Alerts paused for this session"} trailing={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#DDE5F0", true: "#B9D6FF" }} thumbColor={notifications ? "#0869F2" : "#fff"} />} /><View className="flex-row items-center justify-between border-b border-line py-4"><View className="flex-row items-center gap-3"><View className="h-9 w-9 items-center justify-center rounded-xl bg-[#EEF4FD]"><Icon name="language-outline" size={18} color="#1D4B84" /></View><Text className="text-[12px] font-bold text-ink">Language</Text></View><LanguageSelector /></View><SettingRow icon="cash-outline" title="Currency" detail="Ethiopian birr" trailing={<Text className="text-[11px] font-semibold text-muted">ETB</Text>} /></Surface>
      <SectionTitle title="About" />
      <Surface className="px-4"><SettingRow icon="information-circle-outline" title="PrimeStock" detail={demo ? "Inventory workspace demo" : "Connected inventory workspace"} trailing={<Text className="text-[11px] font-semibold text-muted">v1.0</Text>} /></Surface>
      <Pressable onPress={() => { if (demo) exitDemo(); else void signOut().catch((error) => Alert.alert("Could not sign out", error instanceof Error ? error.message : "Please try again.")); }} className="mt-7 h-[50px] flex-row items-center justify-center gap-2 rounded-2xl border border-[#FFD7DD] bg-white"><Icon name="log-out-outline" size={18} color="#EA4F63" /><Text className="text-[12px] font-bold text-danger">{demo ? "Exit demo" : "Sign out"}</Text></Pressable>

      <Modal visible={permissionsOpen} transparent animationType="slide" onRequestClose={() => setPermissionsOpen(false)}><View className="flex-1 justify-end bg-[#061D43]/40"><Pressable className="absolute inset-0" onPress={() => setPermissionsOpen(false)} /><View className="rounded-t-[30px] bg-canvas px-5 pb-9 pt-4"><View className="mb-4 h-1 w-10 self-center rounded-full bg-[#C8D3E4]" /><Text className="text-[19px] font-extrabold text-ink">Role & permissions</Text><Text className="mt-1 text-[12px] text-muted">{demo ? "Demo access" : "Workspace owner"}</Text><Surface className="mt-5 px-4">{["Manage inventory", "Create sales", "View financial reports", "Manage branches"].map((item) => <View key={item} className="flex-row items-center gap-3 border-b border-line py-4 last:border-b-0"><Icon name="checkmark-circle" size={19} color="#08AD7D" /><Text className="text-[12px] font-semibold text-ink">{item}</Text></View>)}</Surface><Pressable onPress={() => setPermissionsOpen(false)} className="mt-5 h-[50px] items-center justify-center rounded-2xl bg-brand"><Text className="text-[12px] font-bold text-white">Done</Text></Pressable></View></View></Modal>
    </Page>
  );
}
