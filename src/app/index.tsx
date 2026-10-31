import { Icon, LanguageSelector, Text } from "@/components/ui";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ImageBackground, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  return <ImageBackground source={require("../../assets/images/landing-warehouse.png")} resizeMode="cover" style={{ flex: 1 }}>
    <LinearGradient colors={["rgba(4,20,47,0.4)", "rgba(3,24,58,0.6)", "#061B3D", "#06152F"]} locations={[0, 0.35, 0.67, 1]} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}><View className="flex-1 justify-between px-6 pb-5 pt-5">
        <View className="flex-row items-center justify-between"><View className="flex-row items-center gap-3"><View className="h-10 w-10 items-center justify-center rounded-[14px] bg-white"><Icon name="cube" size={23} color="#0869F2" /></View><Text className="text-[17px] font-extrabold tracking-tight text-white">PrimeStock</Text></View><LanguageSelector compact /></View>
        <View className="pb-6"><View className="mb-5 self-start rounded-full border border-white/30 bg-white/15 px-3 py-1.5"><Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#D3E6FF]">Inventory, simplified</Text></View><Text className="max-w-[330px] text-[35px] font-extrabold leading-[42px] tracking-tight text-white">Keep every item in its place.</Text><Text className="mt-4 max-w-[320px] text-[14px] leading-[23px] text-[#D7E8FF]">Track stock, sales, suppliers, and branches from one calm workspace—whatever you sell.</Text><View className="mt-6 flex-row items-center gap-3"><View className="h-1.5 w-7 rounded-full bg-white" /><View className="h-1.5 w-2 rounded-full bg-white/40" /><View className="h-1.5 w-2 rounded-full bg-white/40" /></View></View>
        <View><Pressable onPress={() => router.replace("/home")} className="h-[54px] flex-row items-center justify-center gap-2 rounded-2xl bg-white"><Text className="text-[13px] font-bold text-brand">Explore demo</Text><Icon name="arrow-forward" size={18} color="#0869F2" /></Pressable><Pressable onPress={() => router.replace("/home")} className="mt-3 h-[50px] items-center justify-center rounded-2xl border border-white/40 bg-white/10"><Text className="text-[13px] font-semibold text-white">Sign in</Text></Pressable><Text className="mt-4 text-center text-[10px] text-[#C4D8F5]">Preview mode · No account required</Text></View>
      </View></SafeAreaView>
    </LinearGradient>
  </ImageBackground>;
}
