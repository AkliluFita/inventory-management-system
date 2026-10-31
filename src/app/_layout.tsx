import "../../global.css";
import { InventoryProvider } from "@/context/InventoryContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { TradeProvider } from "@/context/TradeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <LanguageProvider><InventoryProvider><TradeProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F4F7FC" } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="procurement" />
        <Stack.Screen name="new-intake" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="debts" />
        <Stack.Screen name="reorder" />
        <Stack.Screen name="branches" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="imports" />
        <Stack.Screen name="new-import" />
        <Stack.Screen name="courier" />
        <Stack.Screen name="new-arrival" />
        <Stack.Screen name="transfers" />
        <Stack.Screen name="new-transfer" />
      </Stack>
    </TradeProvider></InventoryProvider></LanguageProvider>
  );
}
