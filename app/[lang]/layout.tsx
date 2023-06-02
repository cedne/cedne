import { getDictionary } from "@/get-dictionary";
import { Locale, i18n } from "@/i18n-config";
import type { Metadata } from "next";
import "./globals.css";
import Footer from "./footer";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang as Locale);

  return {
    title: "CEdNe",
    description: dict.description,
  };
}

export default async function Root({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <html lang={params.lang}>
      <body>
        {children}
        <Footer dict={dict.footer} />
      </body>
    </html>
  );
}
