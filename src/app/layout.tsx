import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Toma una foto de tu comida y la IA estima sus calorías y macros. Lleva tu diario diario y recibe consejos de un coach nutricional con inteligencia artificial.";

export const metadata: Metadata = {
  metadataBase: new URL("https://plato-cyan.vercel.app"),
  title: {
    default: "Plato — cuenta calorías con una foto",
    template: "%s · Plato",
  },
  description: DESCRIPTION,
  applicationName: "Plato",
  keywords: [
    "contador de calorías",
    "calorías por foto",
    "nutrición",
    "inteligencia artificial",
    "macros",
    "dieta",
    "diario de comidas",
    "coach nutricional",
  ],
  authors: [{ name: "Victor de la Hoz" }],
  openGraph: {
    title: "Plato — cuenta calorías con una foto",
    description: DESCRIPTION,
    url: "/",
    siteName: "Plato",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plato — cuenta calorías con una foto",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0F6E56",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
