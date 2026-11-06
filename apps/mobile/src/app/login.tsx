import { Button, Icon, InputField, Page, Surface, Text, TopBar } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { normalizePhone } from "@/data/phone";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    const normalized = normalizePhone(phone);
    if (!normalized) { setError(t("Enter a valid phone number, such as 0912345678 or +251912345678.")); return; }
    if (password.length < 6) { setError(t("Use a password of at least 6 characters.")); return; }
    if (mode === "signup" && password !== confirmPassword) { setError(t("Passwords do not match.")); return; }
    setBusy(true);
    try {
      if (mode === "signup") await signUp(normalized, password);
      else await signIn(normalized, password);
    } catch (cause) { setError(cause instanceof Error ? t(cause.message) : t("Could not access your account.")); }
    finally { setBusy(false); }
  };

  const switchMode = () => { setMode(mode === "login" ? "signup" : "login"); setError(""); setConfirmPassword(""); };

  return <Page>
    <TopBar title={t(mode === "login" ? "Sign in" : "Create account")} subtitle={t("Your inventory workspace")} backToWelcome />
    <Surface className="p-5">
      <View className="mb-6 h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F1FF]"><Icon name="cube" size={28} color="#0869F2" /></View>
      <Text className="mb-2 text-[17px] font-bold text-ink">{t(mode === "login" ? "Welcome back" : "Start your workspace")}</Text>
      <Text className="mb-5 text-[11px] leading-5 text-muted">{t("Use your mobile number. Ethiopian numbers can start with 09 or 07; other countries need a +country code.")}</Text>
      <InputField label={t("Phone number")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoCapitalize="none" placeholder="0912345678 or +251912345678" required />
      <InputField label={t("Password")} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" required />
      {mode === "signup" ? <InputField label={t("Confirm password")} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" required /> : null}
      {error ? <Text className="mb-4 text-[12px] text-danger">{error}</Text> : null}
      <Button title={t(busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account")} disabled={busy} onPress={() => void submit()} />
      <Pressable onPress={switchMode} disabled={busy} className="mt-5 items-center"><Text className="text-[12px] text-muted">{t(mode === "login" ? "New here? Create an account" : "Already have an account? Sign in")}</Text></Pressable>
    </Surface>
  </Page>;
}
