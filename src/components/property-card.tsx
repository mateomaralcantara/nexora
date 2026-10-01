import Link from "next/link";

import {
  Bath,
  BedDouble,
  CarFront,
  MapPin,
  Ruler,
  Video,
} from "lucide-react";

import type {
  Property,
} from "@/lib/types";

import {
  formatCurrency,
} from "@/lib/utils";

const VIDEO_ALT =
  "__NEXORA_VIDEO__";

export function PropertyCard({
  property,
}: {
  property:
    Property;
}) {
  const media =
    property.property_images ??
    [];

  const images =
    media
      .filter(
        (item) =>
          item.alt_text !==
          VIDEO_ALT,
      )
      .sort(
        (a, b) =>
          (a.position ?? 0) -
          (b.position ?? 0),
      );

  const hasVideo =
    media.some(
      (item) =>
        item.alt_text ===
        VIDEO_ALT,
    );

  const image =
    images[0]?.url ??
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={
            property.title
          }
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-950/90 px-3 py-1.5 text-xs font-bold uppercase text-white">
            {property.operation ===
            "sale"
              ? "Venta"
              : property.operation ===
                  "rent"
                ? "Alquiler"
                : "Renta corta"}
          </span>

          {property.featured ? (
            <span className="rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-black uppercase text-slate-950">
              Destacada
            </span>
          ) : null}

          {hasVideo ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-black uppercase text-white">
              <Video size={13} />
              Video
            </span>
          ) : null}

          {property.construction_status ===
          "under_construction" ? (
            <span className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black uppercase text-slate-950">
              En construcción
            </span>
          ) : null}

          {property.construction_status ===
          "pre_sale" ? (
            <span className="rounded-full bg-orange-300 px-3 py-1.5 text-xs font-black uppercase text-slate-950">
              Preventa
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <p className="mb-2 text-2xl font-black tracking-tight text-slate-950">
          {property.price > 0
            ? formatCurrency(
                property.price,
                property.currency,
              )
            : "Precio a consultar"}
        </p>

        <p className="mb-2 text-xs font-black uppercase tracking-wide text-cyan-700">
          {
            property.property_type
          }
        </p>

        <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
          {
            property.title
          }
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={15} />

          <span>
            {[
              property.sector,
              property.city,
              property.province,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {(property.bedrooms ??
            0) > 0 ? (
            <span className="flex items-center gap-1.5">
              <BedDouble size={16} />
              {
                property.bedrooms
              }
            </span>
          ) : null}

          {(property.bathrooms ??
            0) > 0 ? (
            <span className="flex items-center gap-1.5">
              <Bath size={16} />
              {
                property.bathrooms
              }
            </span>
          ) : null}

          {(property.parking_spaces ??
            0) > 0 ? (
            <span className="flex items-center gap-1.5">
              <CarFront size={16} />
              {
                property.parking_spaces
              }
            </span>
          ) : null}

          {(property.area_m2 ??
            0) > 0 ? (
            <span className="flex items-center gap-1.5">
              <Ruler size={16} />
              {
                property.area_m2
              } m²
            </span>
          ) : null}

          {(property.lot_m2 ??
            0) > 0 ? (
            <span className="flex items-center gap-1.5">
              <Ruler size={16} />
              {
                property.lot_m2
              } m² terreno
            </span>
          ) : null}

          {(property.land_tareas ??
            0) > 0 ? (
            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
              <Ruler size={16} />
              {
                property.land_tareas
              } tareas
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
