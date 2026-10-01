import type {
  Metadata,
} from "next";

import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.startsWith(
    "http",
  )
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://monseo.icu";

export const metadata: Metadata = {
  metadataBase:
    new URL(SITE_URL),

  applicationName:
    "Nexora Realty",

  title: {
    default:
      "Nexora Realty | Propiedades e Inversiones",
    template:
      "%s | Nexora Realty",
  },

  description:
    "Encuentra propiedades, solares, apartamentos, casas, villas, terrenos, fincas y proyectos inmobiliarios en República Dominicana.",

  keywords: [
    "propiedades",
    "inmobiliaria",
    "solares",
    "terrenos",
    "apartamentos",
    "casas",
    "villas",
    "Boca Chica",
    "República Dominicana",
    "Nexora Realty",
  ],

  openGraph: {
    type: "website",
    locale: "es_DO",
    url: SITE_URL,
    siteName: "Nexora Realty",

    title:
      "Nexora Realty | Propiedades e Inversiones",

    description:
      "Propiedades, solares, apartamentos, casas, terrenos y proyectos inmobiliarios en República Dominicana.",

    images: [
      {
        url:
          "/opengraph-image",

        width: 1200,
        height: 630,

        alt:
          "Nexora Realty - Propiedades e Inversiones",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Nexora Realty | Propiedades e Inversiones",

    description:
      "Propiedades e inversiones inmobiliarias en República Dominicana.",

    images: [
      "/opengraph-image",
    ],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}