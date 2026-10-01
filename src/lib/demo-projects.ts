export interface DemoProjectUnit {
  id: string;
  code: string;
  floor?: string;
  status: "available" | "reserved" | "sold";
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area_m2: number;
}

export interface DemoProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "published";
  featured: boolean;
  sector: string;
  city: string;
  province: string;
  country: string;
  delivery_date: string;
  cover_url: string;

  developers: {
    name: string;
  };

  project_units: DemoProjectUnit[];
}

export const demoProjects: DemoProject[] = [
  {
    id: "demo-project-nexora-towers",
    name: "Nexora Towers Piantini",
    slug: "nexora-towers-piantini",
    description:
      "Torre residencial contemporánea orientada a un público premium, con apartamentos de 2 y 3 habitaciones, lobby climatizado, piscina, gimnasio, terraza y seguridad 24 horas.",
    status: "published",
    featured: true,
    sector: "Piantini",
    city: "Santo Domingo",
    province: "Distrito Nacional",
    country: "República Dominicana",
    delivery_date: "2028-06-30",
    cover_url:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85",

    developers: {
      name: "Nexora Developments",
    },

    project_units: [
      {
        id: "nt-a201",
        code: "A-201",
        floor: "2",
        status: "available",
        price: 225000,
        currency: "USD",
        bedrooms: 2,
        bathrooms: 2.5,
        area_m2: 128,
      },
      {
        id: "nt-a501",
        code: "A-501",
        floor: "5",
        status: "available",
        price: 315000,
        currency: "USD",
        bedrooms: 3,
        bathrooms: 3.5,
        area_m2: 185,
      },
      {
        id: "nt-ph1",
        code: "PH-01",
        floor: "14",
        status: "reserved",
        price: 495000,
        currency: "USD",
        bedrooms: 4,
        bathrooms: 4.5,
        area_m2: 295,
      },
    ],
  },

  {
    id: "demo-project-caribbean-residences",
    name: "Caribbean Residences Punta Cana",
    slug: "caribbean-residences-punta-cana",
    description:
      "Complejo turístico y residencial diseñado para vivienda, inversión y renta vacacional, con piscinas, áreas verdes, club social y acceso controlado.",
    status: "published",
    featured: true,
    sector: "Bávaro",
    city: "Punta Cana",
    province: "La Altagracia",
    country: "República Dominicana",
    delivery_date: "2027-12-15",
    cover_url:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85",

    developers: {
      name: "Caribbean Living Group",
    },

    project_units: [
      {
        id: "cr-b101",
        code: "B-101",
        floor: "1",
        status: "available",
        price: 139000,
        currency: "USD",
        bedrooms: 1,
        bathrooms: 1,
        area_m2: 68,
      },
      {
        id: "cr-b302",
        code: "B-302",
        floor: "3",
        status: "available",
        price: 189000,
        currency: "USD",
        bedrooms: 2,
        bathrooms: 2,
        area_m2: 104,
      },
      {
        id: "cr-c404",
        code: "C-404",
        floor: "4",
        status: "sold",
        price: 249000,
        currency: "USD",
        bedrooms: 3,
        bathrooms: 2.5,
        area_m2: 142,
      },
    ],
  },

  {
    id: "demo-project-cibao-center",
    name: "Cibao Business & Living",
    slug: "cibao-business-living",
    description:
      "Proyecto de uso mixto en Santiago con apartamentos, oficinas, locales comerciales y amenidades corporativas en una ubicación estratégica.",
    status: "published",
    featured: true,
    sector: "Cerros de Gurabo",
    city: "Santiago",
    province: "Santiago",
    country: "República Dominicana",
    delivery_date: "2028-03-01",
    cover_url:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85",

    developers: {
      name: "Cibao Urban Developments",
    },

    project_units: [
      {
        id: "cb-ap201",
        code: "APT-201",
        floor: "2",
        status: "available",
        price: 178000,
        currency: "USD",
        bedrooms: 2,
        bathrooms: 2,
        area_m2: 115,
      },
      {
        id: "cb-ap701",
        code: "APT-701",
        floor: "7",
        status: "available",
        price: 269000,
        currency: "USD",
        bedrooms: 3,
        bathrooms: 3,
        area_m2: 176,
      },
      {
        id: "cb-ph",
        code: "PH-02",
        floor: "12",
        status: "available",
        price: 395000,
        currency: "USD",
        bedrooms: 4,
        bathrooms: 4,
        area_m2: 260,
      },
    ],
  },

  {
    id: "demo-project-montana-verde",
    name: "Montaña Verde Jarabacoa",
    slug: "montana-verde-jarabacoa",
    description:
      "Proyecto de villas de montaña concebido para segunda vivienda y renta turística, rodeado de naturaleza, senderos y vistas panorámicas.",
    status: "published",
    featured: false,
    sector: "Buena Vista",
    city: "Jarabacoa",
    province: "La Vega",
    country: "República Dominicana",
    delivery_date: "2027-10-30",
    cover_url:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=85",

    developers: {
      name: "Montaña Verde Constructora",
    },

    project_units: [
      {
        id: "mv-v01",
        code: "VILLA-01",
        status: "available",
        price: 285000,
        currency: "USD",
        bedrooms: 3,
        bathrooms: 3,
        area_m2: 245,
      },
      {
        id: "mv-v02",
        code: "VILLA-02",
        status: "available",
        price: 345000,
        currency: "USD",
        bedrooms: 4,
        bathrooms: 4,
        area_m2: 320,
      },
      {
        id: "mv-v03",
        code: "VILLA-03",
        status: "reserved",
        price: 425000,
        currency: "USD",
        bedrooms: 4,
        bathrooms: 4.5,
        area_m2: 385,
      },
    ],
  },

  {
    id: "demo-project-samana-ocean",
    name: "Samaná Ocean Residence",
    slug: "samana-ocean-residence",
    description:
      "Residencial de inspiración tropical próximo al mar, orientado a propietarios e inversionistas interesados en renta vacacional y turismo premium.",
    status: "published",
    featured: true,
    sector: "Playa Bonita",
    city: "Las Terrenas",
    province: "Samaná",
    country: "República Dominicana",
    delivery_date: "2028-11-30",
    cover_url:
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1800&q=85",

    developers: {
      name: "Atlantic Caribbean Homes",
    },

    project_units: [
      {
        id: "so-a102",
        code: "A-102",
        floor: "1",
        status: "available",
        price: 195000,
        currency: "USD",
        bedrooms: 1,
        bathrooms: 1.5,
        area_m2: 78,
      },
      {
        id: "so-b303",
        code: "B-303",
        floor: "3",
        status: "available",
        price: 289000,
        currency: "USD",
        bedrooms: 2,
        bathrooms: 2,
        area_m2: 126,
      },
      {
        id: "so-ph01",
        code: "PH-01",
        floor: "5",
        status: "available",
        price: 485000,
        currency: "USD",
        bedrooms: 3,
        bathrooms: 3.5,
        area_m2: 215,
      },
    ],
  },
];