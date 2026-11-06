import { Button, Surface, Text } from "@/components/ui";
import { useTrade } from "@/context/TradeContext";
import { ActivityIndicator, View } from "react-native";

export function TradeStatus() {
  const { loading, error, retry } = useTrade();
  if (loading) return <Surface className="mb-4 flex-row items-center gap-3 p-4"><ActivityIndicator color="#0869F2" /><Text className="text-[12px] text-muted">Loading trade records...</Text></Surface>;
  if (error) return <Surface className="mb-4 border-[#FFD6DB] bg-[#FFF2F3] p-4"><Text className="text-[12px] font-semibold text-danger">Could not load trade records</Text><Text className="mt-1 text-[11px] text-muted">{error}</Text><View className="mt-3"><Button title="Try again" variant="outline" onPress={() => void retry()} /></View></Surface>;
  return null;
}
