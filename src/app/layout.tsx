import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const bricolage = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const figtree = Figtree({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "ParaPath — Paraprofessional Training & Competency Platform",
  description: "Job-embedded coaching for special education paraprofessionals. 30/60/90-day duty-unlock track with supervisor dashboards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-ink">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
