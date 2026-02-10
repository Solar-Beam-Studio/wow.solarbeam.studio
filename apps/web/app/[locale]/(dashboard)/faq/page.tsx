import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: { en: "/faq", fr: "/fr/faq" },
    },
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faq");

  const items = FAQ_KEYS.map((n) => ({
    question: t(`q${n}`),
    answer: t(`a${n}`),
  }));

  // JSON-LD FAQPage structured data for Google rich results
  // Safe: content comes from our own translation files, not user input
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-8 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
        {t("title")}
      </h1>
      <p className="text-gray-500 text-sm font-bold tracking-wide mb-12">
        {t("description")}
      </p>

      <div className="space-y-8">
        {items.map((item, i) => (
          <div key={i} className="border-b border-white/5 pb-8 last:border-0">
            <h2 className="text-lg font-bold text-white mb-2">{item.question}</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
