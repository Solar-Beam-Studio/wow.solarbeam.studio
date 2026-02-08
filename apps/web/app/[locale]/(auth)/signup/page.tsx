"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { Zap } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp.email({
      name,
      email,
      password,
    });

    if (error) {
      toast.error(error.message || t("signupFailed"));
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg)] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 text-xs font-bold text-accent uppercase tracking-widest mb-12 hover:opacity-80 transition-opacity">
          <Zap className="w-4 h-4" />
          {t("brandName")}
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-black tracking-tight mb-3">{t("heading")}</h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium">{t("subtitle")}</p>
        </div>

        <div className="bg-[var(--bg-secondary)] p-8 rounded-3xl border border-[var(--border)] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 px-1">{t("nameLabel")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t("namePlaceholder")}
                className="w-full h-12 px-4 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-[var(--text-secondary)]/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 px-1">{t("emailLabel")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t("emailPlaceholder")}
                className="w-full h-12 px-4 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-[var(--text-secondary)]/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 px-1">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder={t("passwordPlaceholder")}
                className="w-full h-12 px-4 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-[var(--text-secondary)]/50"
              />
              <p className="text-[10px] text-[var(--text-secondary)] mt-2 px-1 font-medium italic">{t("passwordHint")}</p>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full h-12 font-bold shadow-lg shadow-accent/20 mt-2">
              {loading ? t("submitLoading") : t("submit")}
            </button>
          </form>
        </div>

        <p className="text-center text-[var(--text-secondary)] text-sm mt-8 font-medium">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-accent hover:underline font-bold">
            {t("signInLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
