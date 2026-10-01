import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  Bath,
  BedDouble,
  CalendarDays,
  CarFront,
  ExternalLink,
  MapPin,
  PawPrint,
  Play,
  Ruler,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  InquiryForm,
} from "@/components/inquiry-form";

import {
  Navbar,
} from "@/components/navbar";

import {
  getPropertyBySlug,
} from "@/lib/data";

import {
  formatCurrency,
} from "@/lib/utils";

const VIDEO_ALT =
  "__NEXORA_VIDEO__";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.startsWith(
    "http",
  )
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://monseo.icu";

function getAbsoluteImageUrl(
  image?:
    string | null,
) {
  try {
    return new URL(
      image ||
        "/opengraph-image",
      SITE_URL,
    ).toString();
  } catch {
    return new URL(
      "/opengraph-image",
      SITE_URL,
    ).toString();
  }
}

function getVideoPlayer(
  value:
    string,
) {
  try {
    const url =
      new URL(
        value,
      );

    const host =
      url.hostname
        .replace(
          "www.",
          "",
        )
        .toLowerCase();

    if (
      host ===
      "youtu.be"
    ) {
      const id =
        url.pathname
          .replace(
            /^\//,
            "",
          )
          .split("/")[0];

      if (id) {
        return {
          kind:
            "embed" as const,
          src:
            `https://www.youtube.com/embed/${id}`,
        };
      }
    }

    if (
      host.endsWith(
        "youtube.com",
      )
    ) {
      let id =
        url.searchParams.get(
          "v",
        );

      if (
        !id &&
        url.pathname.startsWith(
          "/shorts/",
        )
      ) {
        id =
          url.pathname
            .split(
              "/",
            )[2] ??
          null;
      }

      if (
        !id &&
        url.pathname.startsWith(
          "/embed/",
        )
      ) {
        id =
          url.pathname
            .split(
              "/",
            )[2] ??
          null;
      }

      if (id) {
        return {
          kind:
            "embed" as const,
          src:
            `https://www.youtube.com/embed/${id}`,
        };
      }
    }

    if (
      host.endsWith(
        "vimeo.com",
      )
    ) {
      const id =
        url.pathname
          .split("/")
          .filter(Boolean)
          .find(
            (part) =>
              /^\d+$/.test(
                part,
              ),
          );

      if (id) {
        return {
          kind:
            "embed" as const,
          src:
            `https://player.vimeo.com/video/${id}`,
        };
      }
    }

    if (
      /\.(mp4|webm|ogg)$/i.test(
        url.pathname,
      )
    ) {
      return {
        kind:
          "video" as const,
        src:
          url.toString(),
      };
    }

    return {
      kind:
        "link" as const,
      src:
        url.toString(),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params:
    Promise<{
      slug:
        string;
    }>;
}): Promise<Metadata> {
  const {
    slug,
  } =
    await params;

  const property =
    await getPropertyBySlug(
      slug,
    );

  if (!property) {
    return {
      title:
        "Propiedad | Nexora Realty",
    };
  }

  const sortedImages =
    [
      ...(
        property.property_images ??
        []
      ),
    ]
      .filter(
        (image) =>
          image.alt_text !==
          VIDEO_ALT,
      )
      .sort(
        (a, b) =>
          (a.position ?? 0) -
          (b.position ?? 0),
      );

  const mainImage =
    getAbsoluteImageUrl(
      sortedImages[0]?.url,
    );

  const location =
    [
      property.sector,
      property.city,
      property.province,
    ]
      .filter(Boolean)
      .join(", ");

  const description =
    property.description
      ?.trim()
      .slice(
        0,
        155,
      ) ||
    `${property.property_type} disponible en ${location || "República Dominicana"}.`;

  const propertyUrl =
    `${SITE_URL}/properties/${slug}`;

  return {
    title:
      property.title,

    description,

    alternates: {
      canonical:
        propertyUrl,
    },

    openGraph: {
      type:
        "website",

      locale:
        "es_DO",

      siteName:
        "Nexora Realty",

      url:
        propertyUrl,

      title:
        property.title,

      description,

      images: [
        {
          url:
            mainImage,

          width:
            1200,

          height:
            630,

          alt:
            property.title,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        property.title,

      description,

      images: [
        mainImage,
      ],
    },
  };
}

function Feature({
  icon,
  value,
}: {
  icon:
    ReactNode;
  value:
    string;
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
  params:
    Promise<{
      slug:
        string;
    }>;
}) {
  const {
    slug,
  } =
    await params;

  const property =
    await getPropertyBySlug(
      slug,
    );

  if (!property) {
    notFound();
  }

  const allMedia =
    property.property_images ??
    [];

  const videoUrl =
    allMedia.find(
      (media) =>
        media.alt_text ===
        VIDEO_ALT,
    )?.url ??
    null;

  const video =
    videoUrl
      ? getVideoPlayer(
          videoUrl,
        )
      : null;

  const images =
    [
      ...allMedia,
    ]
      .filter(
        (image) =>
          image.alt_text !==
          VIDEO_ALT,
      )
      .sort(
        (a, b) =>
          (a.position ?? 0) -
          (b.position ?? 0),
      )
      .slice(
        0,
        6,
      );

  const mainImage =
    images[0]?.url ??
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

  const extraImages =
    images.slice(
      1,
    );

  const location =
    [
      property.sector,
      property.city,
      property.province,
    ]
      .filter(Boolean)
      .join(", ");

  const operationLabel =
    property.operation ===
    "sale"
      ? "Venta"
      : property.operation ===
          "rent"
        ? "Alquiler"
        : "Renta corta";

  const constructionLabel =
    property.construction_status ===
    "under_construction"
      ? "En construcción"
      : property.construction_status ===
          "pre_sale"
        ? "Preventa"
        : "Lista";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        <div className="h-[52vh] min-h-[420px] bg-slate-900">
          <img
            src={
              mainImage
            }
            alt={
              property.title
            }
            className="h-full w-full object-cover"
          />
        </div>

        {extraImages.length >
        0 ? (
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-6 pt-6 md:grid-cols-5">
            {extraImages.map(
              (
                image,
                index,
              ) => (
                <div
                  key={
                    image.id ??
                    `${image.url}-${index}`
                  }
                  className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200"
                >
                  <img
                    src={
                      image.url
                    }
                    alt={`${property.title} - foto ${index + 2}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ),
            )}
          </div>
        ) : null}

        {video ? (
          <section className="mx-auto max-w-7xl px-6 pt-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
              <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4 text-white">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500">
                  <Play size={19} />
                </span>

                <div>
                  <p className="font-black">
                    Video de la propiedad
                  </p>

                  <p className="text-xs text-slate-400">
                    Recorrido o presentación audiovisual
                  </p>
                </div>
              </div>

              {video.kind ===
              "embed" ? (
                <div className="aspect-video">
                  <iframe
                    src={
                      video.src
                    }
                    title={`Video - ${property.title}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : video.kind ===
                "video" ? (
                <video
                  src={
                    video.src
                  }
                  controls
                  playsInline
                  className="aspect-video w-full bg-black"
                />
              ) : (
                <div className="p-8 text-center">
                  <a
                    href={
                      video.src
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 font-black text-white"
                  >
                    <ExternalLink size={17} />
                    Ver video
                  </a>
                </div>
              )}
            </div>
          </section>
        ) : null}

        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]">
          <section>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black uppercase text-white">
                {operationLabel}
              </span>

              <span className="rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-black uppercase text-cyan-900">
                {
                  property.property_type
                }
              </span>

              {property.construction_status &&
              property.construction_status !==
                "ready" ? (
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black uppercase text-amber-900">
                  {
                    constructionLabel
                  }
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              {
                property.title
              }
            </h1>

            <div className="mt-4 flex items-center gap-2 text-slate-500">
              <MapPin size={19} />
              {location ||
                "Ubicación no especificada"}
            </div>

            <p className="mt-6 text-4xl font-black text-cyan-700">
              {property.price > 0
                ? formatCurrency(
                    property.price,
                    property.currency,
                  )
                : "Precio a consultar"}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {(property.bedrooms ??
                0) > 0 ? (
                <Feature
                  icon={
                    <BedDouble />
                  }
                  value={`${property.bedrooms} habitaciones`}
                />
              ) : null}

              {(property.bathrooms ??
                0) > 0 ? (
                <Feature
                  icon={
                    <Bath />
                  }
                  value={`${property.bathrooms} baños`}
                />
              ) : null}

              {(property.parking_spaces ??
                0) > 0 ? (
                <Feature
                  icon={
                    <CarFront />
                  }
                  value={`${property.parking_spaces} parqueos`}
                />
              ) : null}

              {(property.area_m2 ??
                0) > 0 ? (
                <Feature
                  icon={
                    <Ruler />
                  }
                  value={`${property.area_m2} m² construidos`}
                />
              ) : null}

              {(property.lot_m2 ??
                0) > 0 ? (
                <Feature
                  icon={
                    <Ruler />
                  }
                  value={`${property.lot_m2} m² de terreno`}
                />
              ) : null}

              {(property.land_tareas ??
                0) > 0 ? (
                <Feature
                  icon={
                    <Ruler />
                  }
                  value={`${property.land_tareas} tareas`}
                />
              ) : null}

              {property.expected_delivery_date ? (
                <Feature
                  icon={
                    <CalendarDays />
                  }
                  value={`Entrega ${new Intl.DateTimeFormat(
                    "es-DO",
                    {
                      month:
                        "short",
                      year:
                        "numeric",
                      timeZone:
                        "UTC",
                    },
                  ).format(
                    new Date(
                      property.expected_delivery_date,
                    ),
                  )}`}
                />
              ) : null}
            </div>

            {property.animals_present ? (
              <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-900 text-white">
                    <PawPrint size={21} />
                  </div>

                  <div>
                    <p className="font-black text-emerald-950">
                      Animales en la propiedad
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                      {property.animals_description ||
                        "La propiedad actualmente cuenta con animales."}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

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
                        key={
                          amenity
                        }
                        className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold"
                      >
                        {
                          amenity
                        }
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
                  Ejemplo de inventario dentro de Nexora Realty OS.
                </p>
              </div>
            ) : (
              <InquiryForm
                propertyId={
                  property.id
                }
              />
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
