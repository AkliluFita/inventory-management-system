import { Icon, IconName } from "@/components/ui";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabs: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: "home", title: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "inventory", title: "Inventory", icon: "cube-outline", activeIcon: "cube" },
  { name: "sales", title: "Sales", icon: "cart-outline", activeIcon: "cart" },
  { name: "reports", title: "Reports", icon: "bar-chart-outline", activeIcon: "bar-chart" },
  { name: "more", title: "More", icon: "grid-outline", activeIcon: "grid" },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#0869F2",
      tabBarInactiveTintColor: "#8B9AB2",
      tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 },
      tabBarStyle: { height: 72 + insets.bottom, paddingTop: 7, paddingBottom: Math.max(insets.bottom + 3, 11), borderTopColor: "#E4EAF3", backgroundColor: "#fff" },
    }}>
      {tabs.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: t(tab.title), tabBarIcon: ({ color, focused }) => <Icon name={focused ? tab.activeIcon : tab.icon} size={21} color={color} /> }} />)}
    </Tabs>
  );
}
