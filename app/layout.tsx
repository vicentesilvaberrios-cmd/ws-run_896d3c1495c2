import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "Flappy Bird" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
