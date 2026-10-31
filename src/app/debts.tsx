import { Button, Chip, EmptyState, Icon, Page, SectionTitle, StatusBadge, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { useLanguage } from "@/context/LanguageContext";
import { money } from "@/data/inventoryApi";
import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

const filters = ["All", "Overdue", "Due soon", "Paid"];

export default function DebtsScreen() {
  const { data, settleDebt } = useInventory();
  const { t } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = data.debts.find((item) => item.id === selectedId);
  const unpaid = data.debts.filter((item) => !item.paid);
  const overdue = unpaid.filter((item) => item.daysOverdue > 0);
  const total = unpaid.reduce((sum, item) => sum + item.amount, 0);
  const debts = data.debts.filter((item) => filter === "All" || (filter === "Overdue" && !item.paid && item.daysOverdue > 0) || (filter === "Due soon" && !item.paid && item.daysOverdue <= 0) || (filter === "Paid" && item.paid));

  const markPaid = async () => {
    if (!selected) return;
    setBusy(true); setError("");
    try { await settleDebt(selected.id); setSelectedId(null); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update debt."); }
    finally { setBusy(false); }
  };

  return (
    <Page>
      <TopBar title="Customer debts" subtitle="Stay ahead of every payment" />
      <Surface className="border-[#FFD6DC] bg-[#FFF0F2] p-5">
        <View className="flex-row items-start gap-3"><View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE0E5]"><Icon name="notifications-outline" size={22} color="#E4485A" /></View><View className="flex-1"><Text className="text-[11px] font-bold uppercase tracking-[1px] text-danger">Debt due-date alert</Text><Text className="mt-1 text-[12px] leading-5 text-ink">{overdue.length} {t("customers have overdue payments.")}</Text></View></View>
        <View className="mt-5 flex-row justify-between border-t border-[#FFD6DC] pt-4"><View><Text className="text-[10px] text-muted">TOTAL OUTSTANDING</Text><Text className="mt-1 text-[21px] font-extrabold text-ink">{money(total)}</Text></View><StatusBadge label={`${overdue.length} ${t("Overdue")}`} tone="red" /></View>
      </Surface>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-[18px] mt-5" contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
        {filters.map((item) => <Chip key={item} title={item} selected={filter === item} onPress={() => setFilter(item)} tone="red" />)}
      </ScrollView>
      <SectionTitle title="Customer balances" action={`${debts.length} ${t("records")}`} />
      <View className="gap-3">{debts.map((debt) => <Pressable key={debt.id} onPress={() => setSelectedId(debt.id)} className="rounded-[20px] border border-line bg-white p-4"><View className="flex-row items-center gap-3"><View className="h-11 w-11 items-center justify-center rounded-full bg-[#E4F2F7]"><Text className="text-[12px] font-bold text-[#39738C]">{debt.initials}</Text></View><View className="flex-1"><Text className="text-[12px] font-bold text-ink">{debt.customer}</Text><Text className="mt-1 text-[11px] font-semibold text-ink">{money(debt.amount)}</Text></View><StatusBadge label={debt.paid ? "Paid" : debt.daysOverdue > 0 ? "Overdue" : "Due soon"} tone={debt.paid ? "green" : debt.daysOverdue > 0 ? "red" : "amber"} /></View><View className="mt-3 flex-row items-center justify-between border-t border-line pt-3"><Text className="text-[10px] text-muted">{t("Due")} {debt.dueDate}</Text><Text className={`text-[10px] font-semibold ${debt.paid ? "text-mint" : debt.daysOverdue > 0 ? "text-danger" : "text-amber"}`}>{debt.paid ? t("Payment received") : debt.daysOverdue > 0 ? `${debt.daysOverdue} ${t("days overdue")}` : `${t("Due in")} ${Math.abs(debt.daysOverdue)} ${t("days")}`}</Text></View></Pressable>)}</View>
      {debts.length === 0 ? <EmptyState icon="checkmark-circle-outline" title="All clear" detail="No customer debts in this view." /> : null}

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelectedId(null)}>
        <View className="flex-1 justify-end bg-[#061D43]/40"><Pressable className="absolute inset-0" onPress={() => setSelectedId(null)} />
          {selected ? <View className="rounded-t-[30px] bg-canvas px-5 pb-9 pt-4"><View className="mb-4 h-1 w-10 self-center rounded-full bg-[#C8D3E4]" /><Text className="text-[19px] font-extrabold text-ink">Payment details</Text><Text className="mt-1 text-[12px] text-muted">{selected.customer}</Text><Surface className="mt-5 p-5"><Text className="text-[10px] text-muted">OUTSTANDING BALANCE</Text><Text className="mt-2 text-[27px] font-extrabold text-ink">{money(selected.amount)}</Text><View className="mt-5 flex-row justify-between border-t border-line pt-4"><Text className="text-[11px] text-muted">Due date</Text><Text className="text-[11px] font-semibold text-ink">{selected.dueDate}</Text></View></Surface>{error ? <Text className="mt-3 text-[11px] text-danger">{error}</Text> : null}<View className="mt-5"><Button title={busy ? "Updating..." : selected.paid ? "Payment received" : "Mark as paid"} disabled={busy || selected.paid} onPress={() => void markPaid()} /></View><Pressable onPress={() => setSelectedId(null)} className="mt-3 items-center py-3"><Text className="text-[12px] font-semibold text-muted">Close</Text></Pressable></View> : null}
        </View>
      </Modal>
    </Page>
  );
}
