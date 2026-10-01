import type { ReactNode } from "react";

import {
  Bath,
  BedDouble,
  CarFront,
  MapPin,
  Ruler,
} from "lucide-react";

import { notFound } from "next/navigation";

import { InquiryForm } from "@/components/inquiry-form";
import { Navbar } from "@/components/navbar";
import { getPropertyBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

function Feature({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
      {icon}
      {value}
    </div>
  );
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const property =
    await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const mainImage =
    [...(property.property_images ?? [])]
      .sort(
        (a, b) =>
          (a.position ?? 0) -
          (b.position ?? 0),
      )[0]?.url ??
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

  const location = [
    property.sector,
    property.city,
    property.province,
  ]
    .filter(Boolean)
    .join(", ");

  const operationLabel =
    property.operation === "sale"
      ? "Venta"
      : property.operation === "rent"
        ? "Alquiler"
        : "Renta corta";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        <div className="h-[52vh] min-h-[420px] bg-slate-900">
          <img
            src={mainImage}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]">
          <section>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black uppercase text-white">
                {operationLabel}
              </span>

              <span className="rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-black uppercase text-cyan-900">
                {property.property_type}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              {property.title}
            </h1>

            <div className="mt-4 flex items-center gap-2 text-slate-500">
              <MapPin size={19} />
              {location || "Ubicación no especificada"}
            </div>

            <p className="mt-6 text-4xl font-black text-cyan-700">
              {formatCurrency(
                property.price,
                property.currency,
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Feature
                icon={<BedDouble />}
                value={`${property.bedrooms ?? 0} habitaciones`}
              />

              <Feature
                icon={<Bath />}
                value={`${property.bathrooms ?? 0} baños`}
              />

              <Feature
                icon={<CarFront />}
                value={`${property.parking_spaces ?? 0} parqueos`}
              />

              <Feature
                icon={<Ruler />}
                value={`${property.area_m2 ?? 0} m²`}
              />
            </div>

            <div className="mt-10 rounded-3xl bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black">
                Descripción
              </h2>

              <p className="mt-4 whitespace-pre-line leading-8 text-slate-600">
                {property.description ||
                  "Propiedad disponible dentro del inventario Nexora Realty."}
              </p>

              {property.amenities?.length ? (
                <div className="mt-7 flex flex-wrap gap-2">
                  {property.amenities.map(
                    (amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold"
                      >
                        {amenity}
                      </span>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <aside>
            {property.id.startsWith(
              "demo-",
            ) ? (
              <div className="rounded-3xl bg-slate-950 p-7 text-white">
                <h3 className="text-2xl font-black">
                  Propiedad demostrativa
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Conecta Supabase y
                  publica inventario real
                  para activar captura
                  automática de leads.
                </p>
              </div>
            ) : (
              <InquiryForm
                propertyId={property.id}
              />
            )}
          </aside>
        </div>
      </main>
    </>
  );
}