import { Chip, FeatureHero, Icon, IconButton, MetricCard, Page, SectionTitle, StatusBadge, Surface, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { useAuth } from "@/context/AuthContext";
import { money, stockStatus } from "@/data/inventoryApi";
import { salesForPeriod } from "@/data/reportUtils";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

const chartValues: Record<string, number[]> = {
  Week: [36, 53, 45, 68, 55, 82, 92],
  Month: [29, 48, 43, 66, 58, 72, 68, 91],
  Year: [30, 42, 39, 57, 53, 66, 77, 91],
};

export default function HomeScreen() {
  const { session, demo } = useAuth();
  const { data, activeBranchId } = useInventory();
  const [period, setPeriod] = useState("Month");
  const branch = data.branches.find((item) => item.id === activeBranchId) ?? data.branches[0];
  const lowStock = data.products.filter((item) => stockStatus(item) === "low-stock").length;
  const outOfStock = data.products.filter((item) => stockStatus(item) === "out-of-stock").length;
  const debtTotal = data.debts.filter((item) => !item.paid).reduce((total, item) => total + item.amount, 0);
  const reportPeriod = period === "Week" ? "Weekly" : period === "Year" ? "Annual" : "Monthly";
  const recentSales = salesForPeriod(data.sales, reportPeriod).slice(0, 8).reverse();
  const maxSale = Math.max(...recentSales.map((item) => item.total), 1);
  const bars = demo ? chartValues[period] : recentSales.map((item) => Math.max(5, Math.round(item.total / maxSale * 100)));
  const periodRevenue = data.reportTotals?.[reportPeriod].revenue ?? data.monthlyRevenueBase;

  return (
    <Page>
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-brand"><Icon name="cube" size={22} color="#fff" /></View>
          <View><Text className="text-[17px] font-extrabold tracking-tight text-ink">PrimeStock</Text><Text className="text-[10px] text-muted">{session ? "Welcome back 👋" : "Welcome to the demo 👋"}</Text></View>
        </View>
        <View className="flex-row gap-2">
          <IconButton name="notifications-outline" badge={data.debts.filter((item) => !item.paid && item.daysOverdue > 0).length} onPress={() => router.push("/debts")} />
          <Pressable onPress={() => router.push("/profile")} className="h-10 w-10 items-center justify-center rounded-2xl bg-[#DCEBFF]"><Text className="text-[12px] font-extrabold text-brand">{session ? "PS" : "DE"}</Text></Pressable>
        </View>
      </View>

      <Pressable onPress={() => router.push("/branches")} className="mb-5 mt-5 flex-row items-center gap-3 rounded-2xl border border-line bg-white px-3 py-3">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#E8F1FF]"><Icon name="business-outline" size={18} color="#0869F2" /></View>
        <View className="flex-1"><Text className="text-[11px] font-bold text-ink">{branch?.name ?? "Main branch"}</Text><Text className="mt-0.5 text-[10px] text-muted">{demo ? "Preview data" : "Live inventory"} · {branch?.staff ?? 1} team members</Text></View>
        <Icon name="chevron-down" size={17} color="#60738F" />
      </Pressable>

      <FeatureHero eyebrow="Today's sales" title={money(data.todaySalesBase)} detail="Track every sale, item, and payment in one place." icon="trending-up-outline" action="Open point of sale" onPress={() => router.push("/sales")} />

      <View className="mt-3 flex-row gap-3">
        <MetricCard title="Items in catalog" value={data.products.length.toLocaleString()} icon="cube-outline" tone="mint" onPress={() => router.push("/inventory")} />
        <MetricCard title="Low stock" value={String(lowStock)} icon="alert-circle-outline" tone="amber" onPress={() => router.push("/inventory?filter=low")} />
      </View>
      <View className="mt-3 flex-row gap-3">
        <MetricCard title="Out of stock" value={String(outOfStock)} icon="close-circle-outline" tone="red" onPress={() => router.push("/inventory?filter=out")} />
        <MetricCard title="Outstanding" value={money(debtTotal)} icon="wallet-outline" tone="blue" onPress={() => router.push("/debts")} />
      </View>

      <SectionTitle title="Sales performance" action="View reports" onAction={() => router.push("/reports")} />
      <Surface className="p-4">
        <View className="flex-row items-center justify-between"><View><Text className="text-[10px] text-muted">Revenue trend</Text><Text className="mt-1 text-[18px] font-extrabold text-ink">{money(periodRevenue)}</Text></View>{demo ? <StatusBadge label="Sample" tone="blue" /> : null}</View>
        <View className="mt-4 flex-row gap-2">{["Week", "Month", "Year"].map((item) => <Chip key={item} title={item} selected={period === item} onPress={() => setPeriod(item)} />)}</View>
        <View className="mt-6 h-[130px] flex-row items-end justify-between border-b border-line px-1">
          {bars.map((height, index) => <View key={index} style={{ height: `${height}%` }} className={`w-[9%] rounded-t-lg ${index === bars.length - 1 ? "bg-brand" : "bg-[#BFD8FF]"}`} />)}{!demo && !bars.length ? <Text className="mb-12 flex-1 text-center text-[12px] text-muted">No sales in this period yet</Text> : null}
        </View>
        <View className="mt-2 flex-row justify-between"><Text className="text-[9px] text-muted">{demo ? "Start" : "Recent sales"}</Text><Text className="text-[9px] text-muted">{demo ? "Mid period" : ""}</Text><Text className="text-[9px] text-muted">{demo ? "Today" : "Latest"}</Text></View>
      </Surface>

      <SectionTitle title="Quick actions" />
      <View className="flex-row gap-3">
        <Pressable onPress={() => router.push("/new-intake")} className="flex-1 items-center rounded-[18px] border border-line bg-white px-2 py-4"><View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-[#E8F1FF]"><Icon name="add-circle-outline" size={21} color="#0869F2" /></View><Text className="text-center text-[11px] font-bold text-ink">New intake</Text></Pressable>
        <Pressable onPress={() => router.push("/sales")} className="flex-1 items-center rounded-[18px] border border-line bg-white px-2 py-4"><View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-[#E3F8EF]"><Icon name="cart-outline" size={21} color="#08AD7D" /></View><Text className="text-center text-[11px] font-bold text-ink">New sale</Text></Pressable>
        <Pressable onPress={() => router.push("/procurement")} className="flex-1 items-center rounded-[18px] border border-line bg-white px-2 py-4"><View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1DE]"><Icon name="receipt-outline" size={21} color="#DB8B14" /></View><Text className="text-center text-[11px] font-bold text-ink">Stock intake</Text></Pressable>
      </View>

      <SectionTitle title="Recent activity" action="See inventory" onAction={() => router.push("/inventory")} />
      <Surface className="px-4 py-1">
        {data.activities.slice(0, 4).map((item) => (
          <View key={item.id} className="flex-row gap-3 border-b border-line py-3 last:border-b-0">
            <View className={`h-9 w-9 items-center justify-center rounded-xl ${item.kind === "sale" ? "bg-[#E3F8EF]" : item.kind === "alert" ? "bg-[#FFE9ED]" : "bg-[#E8F1FF]"}`}><Icon name={item.kind === "sale" ? "cart-outline" : item.kind === "alert" ? "alert-circle-outline" : "cube-outline"} size={17} color={item.kind === "sale" ? "#08AD7D" : item.kind === "alert" ? "#EA4F63" : "#0869F2"} /></View>
            <View className="flex-1"><Text className="text-[11px] font-bold text-ink">{item.title}</Text><Text className="mt-0.5 text-[10px] text-muted" numberOfLines={1}>{item.detail}</Text></View>
            <Text className="text-[9px] text-muted">{item.time}</Text>
          </View>
        ))}
      </Surface>
    </Page>
  );
}
