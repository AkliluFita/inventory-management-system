"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Boxes, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { normalizePhone } from "@primestock/domain";
import { PublicLanguageSelect } from "@/components/public-language-select";
import { createClient } from "@/lib/supabase/browser";
import { usePublicLanguage } from "@/lib/use-public-language";

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = usePublicLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizePhone(phone);
    if (!normalized) { setError(t("Enter a valid phone number, such as 0912345678 or +251912345678.")); return; }
    if (password.length < 6) { setError(t("Use a password of at least 6 characters.")); return; }
    if (mode === "signup" && password !== confirm) { setError(t("Passwords do not match.")); return; }
    setBusy(true); setError("");
    try {
      const client = createClient();
      if (mode === "signin") {
        const { error } = await client.auth.signInWithPassword({ phone: normalized, password });
        if (error) throw error;
      } else {
        const { data, error } = await client.auth.signUp({ phone: normalized, password });
        if (error) throw error;
        if (!data.session) throw new Error(t("This account needs confirmation enabled. Contact the workspace owner."));
      }
      router.replace("/dashboard"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("Could not access your account.")); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <aside className="auth-visual"><div className="auth-visual-image"/><div className="auth-visual-shade"/><div className="auth-visual-inner"><div className="brand-lockup"><span className="brand-mark"><Boxes size={23}/></span><span>PrimeStock</span></div><div><div className="eyebrow light"><span className="eyebrow-line"/>{t("Your business, in focus")}</div><h1>{t("Every item.")}<br/>{t("Every branch.")}<br/><span>{t("All together.")}</span></h1><p>{t("A smarter way to handle stock from purchase to sale.")}</p></div><div className="auth-visual-footer">{t("Inventory, simplified.")}</div></div></aside>
    <section className="auth-form-side"><div className="auth-form-wrap">
      <div className="auth-top-actions"><Link href="/" className="back-link"><ArrowLeft size={17}/> {t("Back to home")}</Link><PublicLanguageSelect language={language} onChange={setLanguage}/></div>
      <div className="auth-mobile-brand brand-lockup"><span className="brand-mark"><Boxes size={22}/></span><span>PrimeStock</span></div>
      <div className="auth-kicker">{t("WELCOME TO PRIMESTOCK")}</div>
      <h2>{mode === "signin" ? t("Welcome back") : t("Create your workspace")}</h2>
      <p className="auth-subtitle">{mode === "signin" ? t("Sign in to continue managing your inventory.") : t("Start with your phone number and a secure password.")}</p>
      <div className="auth-toggle"><button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>{t("Sign in")}</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>{t("Create account")}</button></div>
      <form onSubmit={submit} className="auth-form">
        <label>{t("Phone number")}<input autoComplete="tel" inputMode="tel" type="tel" placeholder="0912 345 678" value={phone} onChange={event => setPhone(event.target.value)} required/></label>
        <label>{t("Password")}<div className="password-field"><input autoComplete={mode === "signin" ? "current-password" : "new-password"} type={visible ? "text" : "password"} placeholder={t("Enter your password")} value={password} onChange={event => setPassword(event.target.value)} required minLength={6}/><button type="button" aria-label={visible ? t("Hide password") : t("Show password")} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
        {mode === "signup" && <label>{t("Confirm password")}<input autoComplete="new-password" type={visible ? "text" : "password"} placeholder={t("Repeat your password")} value={confirm} onChange={event => setConfirm(event.target.value)} required minLength={6}/></label>}
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button primary auth-submit" disabled={busy} type="submit">{busy ? <LoaderCircle className="spin" size={18}/> : null}{mode === "signin" ? t("Sign in") : t("Create account")}<ArrowRight size={18}/></button>
      </form>
      <p className="auth-note">{t("Your mobile and web apps use the same account and stock data.")}</p>
    </div></section>
  </main>;
}
