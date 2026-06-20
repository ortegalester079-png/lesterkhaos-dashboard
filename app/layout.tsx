import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "@lesterkhaos · Content OS",
  description:
    "Tablero de contenido para posicionamiento, diagnóstico psicológico y conversión a conversación privada.",
};

export const viewport: Viewport = {
  themeColor: "#0c0c0d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="scroll-thin antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
