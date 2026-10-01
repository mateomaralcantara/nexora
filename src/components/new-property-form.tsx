"use client";

const DOMINICAN_PROVINCES = [
  "Azua",
  "Bahoruco",
  "Barahona",
  "Dajabón",
  "Distrito Nacional",
  "Duarte",
  "Elías Piña",
  "El Seibo",
  "Espaillat",
  "Hato Mayor",
  "Hermanas Mirabal",
  "Independencia",
  "La Altagracia",
  "La Romana",
  "La Vega",
  "María Trinidad Sánchez",
  "Monseñor Nouel",
  "Monte Cristi",
  "Monte Plata",
  "Pedernales",
  "Peravia",
  "Puerto Plata",
  "Samaná",
  "San Cristóbal",
  "San José de Ocoa",
  "San Juan",
  "San Pedro de Macorís",
  "Sánchez Ramírez",
  "Santiago",
  "Santiago Rodríguez",
  "Santo Domingo",
  "Valverde",
] as const;


import {
  type FormEvent,
  useState,
} from "react";

import {
  LoaderCircle,
  Save,
} from "lucide-react";

import { useRouter } from "next/navigation";

export function NewPropertyForm() {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const form =
      new FormData(event.currentTarget);

    const text = (
      key: string,
    ) =>
      String(
        form.get(key) ?? "",
      );

    const number = (
      key: string,
    ) =>
      Number(
        form.get(key) ?? 0,
      );

    const payload = {
      title:
        text("title"),

      description:
        text("description"),

      operation:
        text("operation"),

      status:
        text("status"),

      property_type:
        text("property_type"),

      price:
        number("price"),

      currency:
        text("currency"),

      bedrooms:
        number("bedrooms"),

      bathrooms:
        number("bathrooms"),

      parking_spaces:
        number("parking_spaces"),

      area_m2:
        number("area_m2"),

      lot_m2:
        number("lot_m2"),

      sector:
        text("sector"),

      city:
        text("city"),

      province:
        text("province"),

      country:
        text("country"),

      image_url:
        text("image_url"),

      amenities:
        text("amenities")
          .split(",")
          .map(
            (item) =>
              item.trim(),
          )
          .filter(Boolean),
    };

    try {
      const response =
        await fetch(
          "/api/properties",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No fue posible crear la propiedad.",
        );
      }

      setMessage(
        "Propiedad creada correctamente.",
      );

      router.push(
        "/dashboard/properties",
      );

      router.refresh();

    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Error inesperado.",
      );

    } finally {
      setLoading(false);
    }
  }

  const input =
    "h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500";

  const propertyTypes = [
    "Apartamento",
    "Casa",
    "Villa",
    "Solar",
    "Local Comercial",
    "Oficina",
    "Penthouse",
    "Finca",
    "Nave industrial",
  ];

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold">
            Título
          </span>

          <input
            required
            name="title"
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Operación
          </span>

          <select
            name="operation"
            className={input}
          >
            <option value="sale">
              Venta
            </option>

            <option value="rent">
              Alquiler
            </option>

            <option value="short_rent">
              Renta corta
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Estado
          </span>

          <select
            name="status"
            className={input}
          >
            <option value="published">
              Publicada
            </option>

            <option value="draft">
              Borrador
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Tipo
          </span>

          <select
            name="property_type"
            className={input}
          >
            {propertyTypes.map(
              (type) => (
                <option key={type}>
                  {type}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Precio
          </span>

          <input
            required
            min="0"
            step="0.01"
            type="number"
            name="price"
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Moneda
          </span>

          <select
            name="currency"
            className={input}
          >
            <option>USD</option>
            <option>DOP</option>
            <option>EUR</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Habitaciones
          </span>

          <input
            min="0"
            type="number"
            name="bedrooms"
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Baños
          </span>

          <input
            min="0"
            step="0.5"
            type="number"
            name="bathrooms"
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Parqueos
          </span>

          <input
            min="0"
            type="number"
            name="parking_spaces"
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Área m²
          </span>

          <input
            min="0"
            type="number"
            name="area_m2"
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Solar m²
          </span>

          <input
            min="0"
            type="number"
            name="lot_m2"
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Sector
          </span>

          <input
            name="sector"
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Ciudad
          </span>

          <input
            name="city"
            className={input}
          />
        </label>

        <label>
  <span className="mb-2 block text-sm font-bold">
    Provincia
  </span>

  <select
    name="province"
    required
    defaultValue=""
    className={input}
  >
    <option value="" disabled>
      Selecciona una provincia
    </option>

    {DOMINICAN_PROVINCES.map(
      (province) => (
        <option
          key={province}
          value={province}
        >
          {province}
        </option>
      ),
    )}
  </select>
</label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            País
          </span>

          <input
            name="country"
            defaultValue="República Dominicana"
            className={input}
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold">
            Amenidades separadas por coma
          </span>

          <input
            name="amenities"
            placeholder="Piscina, gimnasio, lobby..."
            className={input}
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold">
            URL imagen principal
          </span>

          <input
            name="image_url"
            type="url"
            placeholder="https://..."
            className={input}
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold">
            Descripción
          </span>

          <textarea
            name="description"
            rows={7}
            className="w-full rounded-xl border border-slate-200 p-4"
          />
        </label>
      </div>

      {message && (
        <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm font-medium">
          {message}
        </div>
      )}

      <button
        disabled={loading}
        className="mt-6 flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-6 font-black text-white hover:bg-cyan-600"
      >
        {loading ? (
          <LoaderCircle
            className="animate-spin"
            size={18}
          />
        ) : (
          <Save size={18} />
        )}

        Guardar propiedad
      </button>
    </form>
  );
}