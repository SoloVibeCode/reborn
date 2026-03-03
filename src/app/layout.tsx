import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastContainer } from "@/components/Toast";
import MobileNav from "@/components/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Reborn — Los 4 mejores posts de IA, cada día",
  description:
    "Los 4 mejores posts de IA de Reddit y Hacker News, curados por Claude cada día. Define tus metas, obtén un plan de acción personalizado y construye tu racha de hábitos.",
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
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <ToastContainer />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
