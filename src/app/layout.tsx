import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthContext";
import { LoadingProvider } from "@/components/LoadingContext";
import { PushManager } from "@/components/PushManager";

export const metadata: Metadata = {
  title: "Bohemian Cinema",
  description: "Rate movies with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-gray-100 min-h-screen font-[--font-display]">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-[120px]" />
        </div>
        <LoadingProvider>
          <AuthProvider>
            <PushManager />
            <Navbar />
            <main className="relative max-w-6xl mx-auto px-4 py-8 pb-20">{children}</main>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
