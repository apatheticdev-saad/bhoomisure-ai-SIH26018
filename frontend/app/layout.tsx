import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import AppSidebar from "@/components/AppSidebar";

export const metadata: Metadata = {
  title: "BhoomiSure AI",
  description:
    "AI-assisted land record digitization, validation and verification system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#f5f7fb] text-slate-900 antialiased">

        <AppSidebar />

        <div className="min-h-screen lg:pl-[260px]">
          <div className="pt-16 lg:pt-0">
            {children}
          </div>
        </div>

      </body>
    </html>
  );
}