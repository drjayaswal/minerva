import type { Metadata } from "next";
import { Raleway, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { AlertCircle, CheckCircle, InformationCircleIcon, Unlink04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
      <body className="antialiased min-h-screen flex flex-col bg-accent text-white selection:bg-white selection:text-accent">
        <Navbar />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              width: "fit-content",
              background: "oklch(0.59 0.23 280)",
              border: "2px solid transparent",
              borderRadius: "20px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#ffffff",
              boxShadow: "0 0px 0px rgba(0, 0, 0, 0.05)",
            },
            actionButtonStyle:{
              background: "#ffffff",
              color:"oklch(0.59 0.23 280)",
              border:"1px solid #e5e7eb",
              borderRadius:"7px",
              fontSize:"12px",
              marginLeft:"10px"
            }
          }}
          icons={{
            error: <HugeiconsIcon icon={Unlink04Icon} strokeWidth={2} size={20} color="#ffffff" />,
            success: <HugeiconsIcon icon={CheckCircle} strokeWidth={2} size={20} color="#ffffff" />,
            info: <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} size={20} color="#ffffff" />,
            warning: <HugeiconsIcon icon={AlertCircle} strokeWidth={2} size={20} color="#ffffff" />,
          }}
        />
        <main className="flex-1 w-full overflow-hidden">{children}</main>
      </body>
    </html>
  );
}