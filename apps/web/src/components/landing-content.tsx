"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, Building2, CheckCircle2, PackageCheck, ShieldCheck } from "lucide-react";
import { PublicLanguageSelect } from "@/components/public-language-select";
import { usePublicLanguage } from "@/lib/use-public-language";

export function LandingContent() {
  const { language, setLanguage, t } = usePublicLanguage();
  return <main className="landing">
    <div className="landing-image" /><div className="landing-cover" />
    <div className="landing-inner">
      <header className="landing-top"><div className="brand-lockup"><span className="brand-mark"><Boxes size={23} strokeWidth={2.3} /></span><span>PrimeStock</span></div><div className="public-header-actions"><PublicLanguageSelect language={language} onChange={setLanguage} light/><Link className="landing-signin" href="/login">{t("Sign in")} <ArrowRight size={17}/></Link></div></header>
      <div className="landing-content"><div className="eyebrow light"><span className="eyebrow-line"/>{t("A clear view of every product")}</div><h1>{t("Know your stock.")}<br/><span>{t("Move with confidence.")}</span></h1><p>{t("One calm workspace for inventory, sales, purchasing and every branch of your business.")}</p><div className="landing-actions"><Link className="button white" href="/login">{t("Open your workspace")} <ArrowRight size={18}/></Link><span><CheckCircle2 size={17}/> {t("Built for the way you work")}</span></div></div>
      <div className="landing-bottom"><div><PackageCheck size={21}/><span>{t("Track every item")}</span></div><div><BarChart3 size={21}/><span>{t("See the full picture")}</span></div><div><Building2 size={21}/><span>{t("Stay in sync across branches")}</span></div><div><ShieldCheck size={21}/><span>{t("One secure workspace")}</span></div></div>
    </div>
  </main>;
}
