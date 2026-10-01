import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Nexora Realty OS", template: "%s | Nexora Realty" },
  description: "AI-native real estate operating system for agencies, brokers, developers and property managers.",
  keywords: ["real estate", "inmobiliaria", "propiedades", "CRM inmobiliario", "AI real estate"],
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="es"><body>{children}</body></html>;
}
