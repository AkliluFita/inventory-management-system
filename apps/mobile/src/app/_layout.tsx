import "../../global.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { InventoryProvider, useInventory } from "@/context/InventoryContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { TradeProvider } from "@/context/TradeContext";
import { mockInventoryApi } from "@/data/inventoryApi";
import { supabaseInventoryApi } from "@/data/supabaseInventoryApi";
import { mockTradeApi } from "@/data/tradeApi";
import { supabaseTradeApi } from "@/data/supabaseTradeApi";
import { Text } from "@/components/ui";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, View } from "react-native";

function InventoryGate({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const { loading, error, retry } = useInventory();
  return <View className="flex-1">
    {children}
    {authLoading || (session && loading) ? <View className="absolute inset-0 z-50 items-center justify-center bg-canvas"><ActivityIndicator color="#0869F2" /><Text className="mt-4 text-muted">Loading workspace...</Text></View> : null}
    {session && !loading && error ? <View className="absolute inset-0 z-50 items-center justify-center bg-canvas px-8"><Text className="text-center text-ink">Could not load your workspace</Text><Text className="mt-2 text-center text-muted">{error}</Text><Pressable onPress={() => void retry()} className="mt-5 rounded-xl bg-brand px-6 py-3"><Text className="font-bold text-white">Try again</Text></Pressable></View> : null}
  </View>;
}

function SessionLayout() {
  const { session, demo, loading } = useAuth();
  const allowed = Boolean(session || demo) && !loading;
  return <InventoryProvider key={session?.user.id ?? (demo ? "demo" : "guest")} api={session ? supabaseInventoryApi : mockInventoryApi}>
    <TradeProvider api={session ? supabaseTradeApi : mockTradeApi}>
      <StatusBar style="dark" />
      <InventoryGate>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F4F7FC" } }}>
          <Stack.Protected guard={!allowed}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
          </Stack.Protected>
          <Stack.Protected guard={allowed}>
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
            <Stack.Screen name="new-product" />
            <Stack.Screen name="new-supplier" />
            <Stack.Screen name="new-branch" />
          </Stack.Protected>
        </Stack>
      </InventoryGate>
    </TradeProvider>
  </InventoryProvider>;
}

export default function RootLayout() {
  return <AuthProvider><LanguageProvider><SessionLayout /></LanguageProvider></AuthProvider>;
}
