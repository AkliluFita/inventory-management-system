import { Chip, Icon, MetricCard, Page, SectionTitle, StatusBadge, Surface, TopBar, Text } from "@/components/ui";
import { useInventory } from "@/context/InventoryContext";
import { useAuth } from "@/context/AuthContext";
import { money, ReportPeriod } from "@/data/inventoryApi";
import { salesForPeriod } from "@/data/reportUtils";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const periods = ["Daily", "Weekly", "Monthly", "Annual"];
const chart: Record<string, number[]> = {
  Daily: [30, 42, 60, 52, 75, 65, 89],
  Weekly: [22, 40, 34, 58, 62, 72, 91],
  Monthly: [29, 43, 39, 63, 55, 73, 68, 91],
  Annual: [18, 28, 38, 45, 57, 66, 77, 92],
};

export default function ReportsScreen() {
  const { demo } = useAuth();
  const { data } = useInventory();
  const [period, setPeriod] = useState("Monthly");
  const report = data.reportTotals?.[period as ReportPeriod];
  const revenue = report?.revenue ?? (period === "Daily" ? data.todaySalesBase : period === "Weekly" ? Math.round(data.monthlyRevenueBase / 4) : period === "Annual" ? data.monthlyRevenueBase * 12 : data.monthlyRevenueBase);
  const cost = report?.cost ?? Math.round(revenue * 0.736);
  const profit = revenue - cost;
  const recentSales = salesForPeriod(data.sales, period as ReportPeriod).slice(0, 8).reverse();
  const maxSale = Math.max(...recentSales.map((item) => item.total), 1);
  const bars = demo ? chart[period] : recentSales.map((item) => Math.max(5, Math.round(item.total / maxSale * 100)));
  const categoryValues = data.products.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.stock * item.cost;
    return acc;
  }, {});
  const topCategory = Math.max(...Object.values(categoryValues), 1);
  const categoryColors: Record<string, string> = { Electronics: "#0869F2", Groceries: "#08AD7D", Home: "#F3A42B", Apparel: "#A66DE9", Supplies: "#EA4F63", Stationery: "#3AA8CB" };

  return (
    <Page>
      <TopBar title="Financial reports" subtitle="A clear view of your business" back={false} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-[18px]" contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
        {periods.map((item) => <Chip key={item} title={item} selected={period === item} onPress={() => setPeriod(item)} />)}
      </ScrollView>
      <SectionTitle title="Revenue overview" />
      <Surface className="p-5">
        <View className="flex-row items-start justify-between"><View><Text className="text-[10px] text-muted">TOTAL REVENUE</Text><Text className="mt-1 text-[25px] font-extrabold tracking-tight text-ink">{money(revenue)}</Text><Text className="mt-1 text-[10px] text-muted">{period} snapshot · selected branch</Text></View>{demo ? <StatusBadge label="Sample" tone="blue" /> : null}</View>
        <View className="mt-6 h-[175px] flex-row items-end justify-between border-b border-line px-2">{bars.map((height, index) => <View key={index} style={{ height: `${height}%` }} className={`w-[9%] rounded-t-lg ${index === bars.length - 1 ? "bg-brand" : "bg-[#C7DCFD]"}`} />)}{!demo && !bars.length ? <Text className="mb-16 flex-1 text-center text-[12px] text-muted">No sales in this period yet</Text> : null}</View>
        <View className="mt-2 flex-row justify-between"><Text className="text-[9px] text-muted">{demo ? "Start" : "Recent sales"}</Text><Text className="text-[9px] text-muted">{demo ? "Middle" : ""}</Text><Text className="text-[9px] text-muted">{demo ? "Current" : "Latest"}</Text></View>
      </Surface>
      <SectionTitle title="Profit & loss" />
      <View className="flex-row gap-3"><MetricCard title="Gross profit" value={money(profit)} icon="trending-up-outline" tone="mint" /><MetricCard title="Cost of goods" value={money(cost)} icon="receipt-outline" tone="amber" /></View>
      <Surface className="mt-3 flex-row items-center justify-between p-4"><View className="flex-row items-center gap-3"><View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E8F1FF]"><Icon name="pie-chart-outline" size={20} color="#0869F2" /></View><View><Text className="text-[11px] font-bold text-ink">Profit margin</Text><Text className="mt-0.5 text-[10px] text-muted">After cost of goods sold</Text></View></View><Text className="text-[20px] font-extrabold text-brand">{revenue > 0 ? Math.round((profit / revenue) * 100) : 0}%</Text></Surface>
      <SectionTitle title="Inventory value by category" />
      <Surface className="p-4">{Object.entries(categoryValues).sort((a, b) => b[1] - a[1]).map(([category, value]) => <View key={category} className="mb-4 last:mb-0"><View className="mb-2 flex-row justify-between"><Text className="text-[11px] font-semibold text-ink">{category}</Text><Text className="text-[11px] font-bold text-ink">{money(value)}</Text></View><View className="h-2 rounded-full bg-[#E9EEF7]"><View style={{ width: `${Math.max((value / topCategory) * 100, 3)}%`, backgroundColor: categoryColors[category] ?? "#7C8DA7" }} className="h-2 rounded-full" /></View></View>)}</Surface>
      <SectionTitle title="Recent transactions" action={`${data.sales.length} sales`} />
      <Surface className="px-4">{data.sales.slice(0, 4).map((sale) => <View key={sale.id} className="flex-row items-center gap-3 border-b border-line py-3 last:border-b-0"><View className="h-9 w-9 items-center justify-center rounded-xl bg-[#E3F8EF]"><Icon name="cart-outline" size={17} color="#08AD7D" /></View><View className="flex-1"><Text className="text-[11px] font-bold text-ink">{sale.id}</Text><Text className="mt-0.5 text-[10px] text-muted">{sale.items} items · {sale.date}</Text></View><Text className="text-[11px] font-bold text-ink">{money(sale.total)}</Text></View>)}</Surface>
      <Pressable onPress={() => router.push("/transfers")} className="mt-3 flex-row items-center justify-between rounded-[18px] border border-line bg-white p-4"><View className="flex-row items-center gap-3"><Icon name="swap-horizontal-outline" size={21} color="#0869F2" /><Text className="text-[12px] font-bold text-ink">View bank transfers</Text></View><Icon name="chevron-forward" size={17} color="#9BA9BC" /></Pressable>
      {demo ? <Text className="mt-5 text-center text-[10px] leading-4 text-muted">Demo figures are sample data.</Text> : null}
    </Page>
  );
}
