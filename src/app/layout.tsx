import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reborn — Los 4 mejores posts de IA, cada día",
  description:
    "Cada día, los 4 mejores artículos sobre Inteligencia Artificial de Reddit y Hacker News, curados por IA. Sin ruido, solo lo mejor de hoy.",
  keywords: ["inteligencia artificial", "IA", "AI", "noticias", "curación", "hacker news", "reddit", "daily"],
  metadataBase: new URL("https://rebornfromzerotohero.com"),
  alternates: {
    canonical: "https://rebornfromzerotohero.com",
  },
  openGraph: {
    title: "Reborn — Los 4 mejores posts de IA, cada día",
    description:
      "Cada día, los 4 mejores artículos sobre Inteligencia Artificial de Reddit y Hacker News, curados por IA.",
    url: "https://rebornfromzerotohero.com",
    siteName: "Reborn",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reborn — Los 4 mejores posts de IA, cada día",
    description:
      "Los 4 mejores posts sobre IA de Reddit y Hacker News, curados por Claude. Actualizados diariamente.",
    site: "@rebornfromzero",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
