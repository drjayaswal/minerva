import type { Metadata } from "next";
import { Raleway, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

/* ---------------- FONTS ---------------- */

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

/* ---------------- METADATA ---------------- */

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Minerva",
    template: "%s | Minerva",
  },
  description:
    "Minerva — Your Assistant",
  keywords: ["Minerva ai", "ai chat", "assistant", "chatbot", "ai helper"],
  icons: {
    icon: "/logo-no-bg.png",
    shortcut: "/logo-no-bg.png",
    apple: "/logo-no-bg.png",
  },
  openGraph: {
    title: "Minerva AI",
    description: "Your Assistant.",
    images: ["/logo-no-bg.png"],
  },
};

/* ---------------- LAYOUT ---------------- */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${raleway.variable} ${geistMono.variable}`}
    >
      <body className="antialiased min-h-screen flex flex-col bg-accent text-white selection:bg-white selection:text-[#685AFF]">
        <Navbar />
        <ToastProvider>
          <main className="flex-1 w-full overflow-hidden">{children}</main>
          </ToastProvider>
      </body>
    </html>
  );
}
