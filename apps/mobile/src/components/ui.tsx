import { Product, StockStatus, money, stockStatus } from "@/data/inventoryApi";
import { languages, useLanguage } from "@/context/LanguageContext";
import { goBackOrHome } from "@/data/navigation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ReactNode, useState } from "react";
import { ColorValue, Modal, Pressable, ScrollView, Text as NativeText, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];

export function Text({ children, ...props }: React.ComponentProps<typeof NativeText>) {
  const { t } = useLanguage();
  return <NativeText {...props}>{typeof children === "string" ? t(children) : children}</NativeText>;
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const selected = languages.find((item) => item.code === language)!;
  return <>
    <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={t("Language")} className={compact ? "flex-row items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 px-3 py-2" : "flex-row items-center gap-2 rounded-xl bg-[#EAF2FF] px-3 py-2"}><Icon name="language-outline" size={17} color={compact ? "#fff" : "#0869F2"} /><Text className={compact ? "text-[11px] font-bold text-white" : "text-[11px] font-bold text-brand"}>{selected.nativeName}</Text><Icon name="chevron-down" size={13} color={compact ? "#fff" : "#0869F2"} /></Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}><View className="flex-1 justify-end bg-[#061D43]/45"><Pressable className="absolute inset-0" onPress={() => setOpen(false)} /><View className="rounded-t-[28px] bg-white px-5 pb-9 pt-5"><View className="mb-5 h-1 w-10 self-center rounded-full bg-line" /><Text className="mb-4 text-[18px] font-bold text-ink">Language</Text>{languages.map((item) => <Pressable key={item.code} onPress={() => { setLanguage(item.code); setOpen(false); }} className="flex-row items-center justify-between border-b border-line py-4"><View><Text className="text-[14px] font-bold text-ink">{item.nativeName}</Text><Text className="mt-1 text-[11px] text-muted">{item.name}</Text></View>{item.code === language ? <Icon name="checkmark-circle" size={23} color="#0869F2" /> : null}</Pressable>)}</View></View></Modal>
  </>;
}

export function Icon({ name, size = 20, color = "#102244" }: { name: IconName; size?: number; color?: ColorValue }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function Page({ children, scroll = true, className = "" }: { children: ReactNode; scroll?: boolean; className?: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F7FC" }} edges={["top", "left", "right"]}>
      {scroll ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}>
          <View className={className}>{children}</View>
        </ScrollView>
      ) : <View className={`flex-1 px-[18px] ${className}`}>{children}</View>}
    </SafeAreaView>
  );
}

export function TopBar({ title, subtitle, right, back = true, backToWelcome = false }: { title: string; subtitle?: string; right?: ReactNode; back?: boolean; backToWelcome?: boolean }) {
  const { t } = useLanguage();
  const displayTitle = title.startsWith("Current cart (") ? title.replace("Current cart", t("Current cart")) : title;
  return (
    <View className="mb-6 mt-3 flex-row items-center gap-3">
      {back && (
        <Pressable onPress={() => { if (backToWelcome) { if (router.canGoBack()) router.back(); else router.replace("/"); } else goBackOrHome(); }} accessibilityLabel={t("Go back")} className="h-10 w-10 items-center justify-center rounded-2xl bg-white border border-line">
          <Icon name="arrow-back" size={19} />
        </Pressable>
      )}
      <View className="flex-1">
        <Text className="text-[20px] font-bold tracking-tight text-ink">{displayTitle}</Text>
        {subtitle ? <Text className="mt-0.5 text-[12px] text-muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-[22px] border border-line bg-white ${className}`}>{children}</View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="mb-3 mt-6 flex-row items-center justify-between">
      <Text className="text-[16px] font-bold text-ink">{title}</Text>
      {action ? <Pressable onPress={onAction}><Text className="text-[12px] font-semibold text-brand">{action}</Text></Pressable> : null}
    </View>
  );
}

export function Button({ title, onPress, icon, variant = "primary", disabled = false, className = "" }: {
  title: string; onPress: () => void; icon?: IconName; variant?: "primary" | "outline" | "soft" | "danger"; disabled?: boolean; className?: string;
}) {
  const base = variant === "primary" ? "bg-brand border-brand" : variant === "danger" ? "bg-danger border-danger" : variant === "soft" ? "bg-[#EAF2FF] border-[#EAF2FF]" : "bg-white border-brand";
  const textColor = variant === "primary" || variant === "danger" ? "text-white" : "text-brand";
  return (
    <Pressable onPress={onPress} disabled={disabled} className={`min-h-[50px] flex-row items-center justify-center gap-2 rounded-2xl border ${base} ${disabled ? "opacity-45" : ""} ${className}`}>
      {icon ? <Icon name={icon} size={18} color={variant === "primary" || variant === "danger" ? "#fff" : "#0869F2"} /> : null}
      <Text className={`text-[13px] font-bold ${textColor}`}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ name, onPress, badge }: { name: IconName; onPress: () => void; badge?: number }) {
  return (
    <Pressable onPress={onPress} className="relative h-10 w-10 items-center justify-center rounded-2xl border border-line bg-white">
      <Icon name={name} size={19} />
      {badge ? <View className="absolute -right-1 -top-1 h-[17px] min-w-[17px] items-center justify-center rounded-full bg-danger px-0.5"><Text className="text-[9px] font-bold text-white">{badge}</Text></View> : null}
    </Pressable>
  );
}

export function SearchField({ value, onChangeText, placeholder = "Search..." }: { value: string; onChangeText: (text: string) => void; placeholder?: string }) {
  const { t } = useLanguage();
  return (
    <View className="h-[48px] flex-row items-center gap-2 rounded-2xl border border-line bg-white px-4">
      <Icon name="search-outline" size={19} color="#8492AC" />
      <TextInput value={value} onChangeText={onChangeText} placeholder={t(placeholder)} placeholderTextColor="#9AA6BB" className="flex-1 text-[13px] text-ink" autoCapitalize="none" />
      {value ? <Pressable onPress={() => onChangeText("")}><Icon name="close-circle" size={17} color="#9AA6BB" /></Pressable> : null}
    </View>
  );
}

export function Chip({ title, selected, onPress, tone = "blue" }: { title: string; selected: boolean; onPress: () => void; tone?: "blue" | "red" }) {
  return (
    <Pressable onPress={onPress} className={`rounded-xl border px-3.5 py-2 ${selected ? tone === "red" ? "border-danger bg-danger" : "border-brand bg-brand" : "border-line bg-white"}`}>
      <Text className={`text-[11px] font-semibold ${selected ? "text-white" : "text-muted"}`}>{title}</Text>
    </Pressable>
  );
}

export function StatusBadge({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "blue" | "slate" }) {
  const styles = {
    green: ["bg-[#E0F8EE]", "text-[#078759]"],
    amber: ["bg-[#FFF1DB]", "text-[#BF7600]"],
    red: ["bg-[#FFE8EC]", "text-[#D83C55]"],
    blue: ["bg-[#E8F1FF]", "text-[#0869F2]"],
    slate: ["bg-[#EDF1F7]", "text-[#65738B]"],
  }[tone];
  return <View className={`self-start rounded-full px-2.5 py-1 ${styles[0]}`}><Text className={`text-[10px] font-bold ${styles[1]}`}>{label}</Text></View>;
}

export function ProductArt({ product, size = "medium" }: { product: Product; size?: "small" | "medium" | "large" }) {
  const dimensions = size === "small" ? 52 : size === "large" ? 110 : 78;
  const iconSize = size === "small" ? 25 : size === "large" ? 52 : 36;
  return (
    <View style={{ width: dimensions, height: dimensions, backgroundColor: product.tint }} className="items-center justify-center rounded-2xl">
      <View className="absolute right-2 top-2 h-3 w-3 rounded-full bg-white/50" />
      <Icon name={product.icon as IconName} size={iconSize} color="#1D4B84" />
    </View>
  );
}

export function ProductStatus({ product }: { product: Product }) {
  const status: StockStatus = stockStatus(product);
  if (status === "out-of-stock") return <StatusBadge label="Out of stock" tone="red" />;
  if (status === "low-stock") return <StatusBadge label="Low stock" tone="amber" />;
  return <StatusBadge label="In stock" tone="green" />;
}

export function MetricCard({ title, value, icon, tone = "blue", onPress, detail }: {
  title: string; value: string; icon: IconName; tone?: "blue" | "mint" | "amber" | "red"; onPress?: () => void; detail?: string;
}) {
  const tint = { blue: "#EAF2FF", mint: "#E4F9F1", amber: "#FFF2DE", red: "#FFECEF" }[tone];
  const accent = { blue: "#0869F2", mint: "#08AD7D", amber: "#E2931B", red: "#EA4F63" }[tone];
  return (
    <Pressable onPress={onPress} className="min-h-[123px] flex-1 rounded-[20px] border border-line bg-white p-4">
      <View style={{ backgroundColor: tint }} className="h-8 w-8 items-center justify-center rounded-xl"><Icon name={icon} size={17} color={accent} /></View>
      <Text className="mt-3 text-[20px] font-extrabold tracking-tight text-ink" numberOfLines={1}>{value}</Text>
      <Text className="mt-0.5 text-[11px] font-semibold text-muted">{title}</Text>
      {detail ? <Text className="mt-1 text-[10px] text-muted">{detail}</Text> : null}
    </Pressable>
  );
}

export function EmptyState({ icon, title, detail, action, onAction }: { icon: IconName; title: string; detail: string; action?: string; onAction?: () => void }) {
  return (
    <View className="items-center px-6 py-12">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-[22px] bg-[#E9F2FF]"><Icon name={icon} size={30} color="#0869F2" /></View>
      <Text className="text-center text-[16px] font-bold text-ink">{title}</Text>
      <Text className="mt-2 text-center text-[12px] leading-5 text-muted">{detail}</Text>
      {action && onAction ? <View className="mt-5 w-full"><Button title={action} onPress={onAction} variant="soft" /></View> : null}
    </View>
  );
}

export function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
  return <Text className="mb-2 text-[11px] font-semibold text-muted">{label}{required ? <Text className="text-danger"> *</Text> : null}</Text>;
}

export function InputField({ label, value, onChangeText, placeholder, keyboardType = "default", required = false, secureTextEntry = false, autoCapitalize }: {
  label: string; value: string; onChangeText: (text: string) => void; placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad" | "email-address" | "phone-pad" | "number-pad"; required?: boolean;
  secureTextEntry?: boolean; autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  const { t } = useLanguage();
  return (
    <View className="mb-4">
      <FieldLabel label={label} required={required} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder ? t(placeholder) : undefined} placeholderTextColor="#A2AEC1" keyboardType={keyboardType} secureTextEntry={secureTextEntry} autoCapitalize={autoCapitalize} className="h-[50px] rounded-2xl border border-line bg-white px-4 text-[13px] text-ink" />
    </View>
  );
}

export function PickerField({ label, value, options, onChange, required = false }: {
  label: string; value: string; options: { label: string; value: string; subtitle?: string }[]; onChange: (value: string) => void; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { language, t } = useLanguage();
  const selected = options.find((option) => option.value === value);
  return (
    <View className="mb-4">
      <FieldLabel label={label} required={required} />
      <Pressable onPress={() => setOpen(true)} className="h-[50px] flex-row items-center justify-between rounded-2xl border border-line bg-white px-4">
        <Text className={`text-[13px] ${selected ? "text-ink" : "text-[#A2AEC1]"}`}>{selected?.label ?? "Select an option"}</Text>
        <Icon name="chevron-down" size={16} color="#7485A2" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-[#061D43]/40">
          <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />
          <View className="max-h-[70%] rounded-t-[28px] bg-white px-5 pb-9 pt-5">
            <View className="mb-5 h-1 w-10 self-center rounded-full bg-line" />
            <Text className="mb-4 text-[18px] font-bold text-ink">{language === "en" ? `Choose ${label.toLowerCase()}` : `${t(label)} ${t("Choose")}`}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <Pressable key={option.value} onPress={() => { onChange(option.value); setOpen(false); }} className="flex-row items-center justify-between border-b border-line py-4">
                  <View><Text className="text-[13px] font-semibold text-ink">{option.label}</Text>{option.subtitle ? <Text className="mt-1 text-[11px] text-muted">{option.subtitle}</Text> : null}</View>
                  {value === option.value ? <Icon name="checkmark-circle" size={21} color="#0869F2" /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function FeatureHero({ eyebrow, title, detail, icon, action, onPress }: { eyebrow: string; title: string; detail: string; icon: IconName; action?: string; onPress?: () => void }) {
  return (
    <LinearGradient colors={["#082F70", "#0869F2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, overflow: "hidden" }}>
      <View className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10" />
      <View className="absolute right-10 top-12 h-16 w-16 rounded-full bg-white/10" />
      <View className="p-5">
        <View className="mb-5 h-10 w-10 items-center justify-center rounded-2xl bg-white/20"><Icon name={icon} size={22} color="#fff" /></View>
        <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#BBD7FF]">{eyebrow}</Text>
        <Text className="mt-1 text-[24px] font-extrabold tracking-tight text-white">{title}</Text>
        <Text className="mt-2 max-w-[260px] text-[12px] leading-5 text-[#D3E6FF]">{detail}</Text>
        {action && onPress ? <Pressable onPress={onPress} className="mt-5 self-start flex-row items-center gap-2 rounded-xl bg-white px-4 py-2.5"><Text className="text-[11px] font-bold text-brand">{action}</Text><Icon name="arrow-forward" size={15} color="#0869F2" /></Pressable> : null}
      </View>
    </LinearGradient>
  );
}

export function ProductListRow({ product, onPress, trailing }: { product: Product; onPress?: () => void; trailing?: ReactNode }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 border-b border-line py-3 last:border-b-0">
      <ProductArt product={product} size="small" />
      <View className="flex-1">
        <Text className="text-[12px] font-bold text-ink" numberOfLines={1}>{product.name}</Text>
        <Text className="mt-1 text-[10px] text-muted">{product.sku} · {product.stock} {product.unit}</Text>
      </View>
      {trailing ?? <Icon name="chevron-forward" size={16} color="#9AA6BB" />}
    </Pressable>
  );
}

export function CartSummary({ subtotal, discount = 0 }: { subtotal: number; discount?: number }) {
  return (
    <Surface className="p-4">
      <View className="flex-row justify-between py-1"><Text className="text-[12px] text-muted">Subtotal</Text><Text className="text-[12px] font-semibold text-ink">{money(subtotal)}</Text></View>
      <View className="flex-row justify-between py-1"><Text className="text-[12px] text-muted">Discount</Text><Text className="text-[12px] font-semibold text-ink">{money(discount)}</Text></View>
      <View className="mt-3 flex-row justify-between border-t border-line pt-3"><Text className="text-[15px] font-bold text-ink">Total</Text><Text className="text-[17px] font-extrabold text-brand">{money(subtotal - discount)}</Text></View>
    </Surface>
  );
}
