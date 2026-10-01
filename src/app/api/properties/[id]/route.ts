import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  z,
} from "zod";

import {
  requireUser,
} from "@/lib/auth";

const VIDEO_ALT =
  "__NEXORA_VIDEO__";

const schema =
  z.object({
    title:
      z.string()
        .min(3)
        .max(180)
        .optional(),

    description:
      z.string()
        .max(12000)
        .optional(),

    operation:
      z.enum([
        "sale",
        "rent",
        "short_rent",
      ])
        .optional(),

    status:
      z.enum([
        "draft",
        "published",
        "reserved",
        "sold",
        "rented",
        "archived",
      ])
        .optional(),

    property_type:
      z.string()
        .min(2)
        .max(80)
        .optional(),

    price:
      z.number()
        .nonnegative()
        .optional(),

    currency:
      z.string()
        .length(3)
        .optional(),

    bedrooms:
      z.number()
        .nonnegative()
        .nullable()
        .optional(),

    bathrooms:
      z.number()
        .nonnegative()
        .nullable()
        .optional(),

    parking_spaces:
      z.number()
        .nonnegative()
        .nullable()
        .optional(),

    area_m2:
      z.number()
        .nonnegative()
        .nullable()
        .optional(),

    lot_m2:
      z.number()
        .nonnegative()
        .nullable()
        .optional(),

    land_tareas:
      z.number()
        .nonnegative()
        .nullable()
        .optional(),

    construction_status:
      z.enum([
        "ready",
        "under_construction",
        "pre_sale",
      ])
        .optional(),

    expected_delivery_date:
      z.string()
        .max(20)
        .optional()
        .or(
          z.literal(""),
        ),

    animals_present:
      z.boolean()
        .optional(),

    animals_description:
      z.string()
        .max(500)
        .optional(),

    furnished:
      z.boolean()
        .optional(),

    pool:
      z.boolean()
        .optional(),

    featured:
      z.boolean()
        .optional(),

    sector:
      z.string()
        .max(120)
        .optional(),

    city:
      z.string()
        .max(120)
        .optional(),

    province:
      z.string()
        .max(120)
        .optional(),

    country:
      z.string()
        .max(120)
        .optional(),

    amenities:
      z.array(
        z.string()
          .max(80),
      )
        .max(50)
        .optional(),

    video_url:
      z.string()
        .url()
        .or(
          z.literal(""),
        )
        .optional(),
  });

export async function PATCH(
  request:
    NextRequest,

  {
    params,
  }: {
    params:
      Promise<{
        id:
          string;
      }>;
  },
) {
  try {
    const auth =
      await requireUser();

    const {
      id,
    } =
      await params;

    const parsed =
      schema.safeParse(
        await request.json(),
      );

    if (
      !parsed.success
    ) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues
              .map(
                (issue) =>
                  issue.message,
              )
              .join(", "),
        },
        {
          status: 400,
        },
      );
    }

    const {
      video_url,
      ...input
    } =
      parsed.data;

    const update:
      Record<
        string,
        unknown
      > = {
        ...input,
      };

    if (
      input.expected_delivery_date !==
      undefined
    ) {
      update.expected_delivery_date =
        input.expected_delivery_date ||
        null;
    }

    if (
      input.animals_present ===
      false
    ) {
      update.animals_description =
        "";
    }

    if (
      input.status ===
      "published"
    ) {
      update.published_at =
        new Date()
          .toISOString();
    }

    if (
      input.status &&
      input.status !==
        "published"
    ) {
      update.published_at =
        null;
    }

    const {
      data:
        property,
      error,
    } =
      await auth.supabase
        .from("properties")
        .update(
          update,
        )
        .eq(
          "id",
          id,
        )
        .select("*")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!property) {
      return NextResponse.json(
        {
          error:
            "Propiedad no encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      video_url !==
      undefined
    ) {
      const {
        error:
          deleteError,
      } =
        await auth.supabase
          .from(
            "property_images",
          )
          .delete()
          .eq(
            "property_id",
            id,
          )
          .eq(
            "alt_text",
            VIDEO_ALT,
          );

      if (deleteError) {
        throw deleteError;
      }

      if (video_url) {
        const {
          error:
            videoError,
        } =
          await auth.supabase
            .from(
              "property_images",
            )
            .insert({
              organization_id:
                auth.organizationId,

              property_id:
                id,

              url:
                video_url,

              alt_text:
                VIDEO_ALT,

              position:
                99,
            });

        if (
          videoError
        ) {
          throw videoError;
        }
      }
    }

    const {
      data:
        propertyImages,
    } =
      await auth.supabase
        .from(
          "property_images",
        )
        .select(
          "id,url,alt_text,position,property_id",
        )
        .eq(
          "property_id",
          id,
        )
        .order(
          "position",
          {
            ascending:
              true,
          },
        );

    return NextResponse.json({
      property: {
        ...property,
        property_images:
          propertyImages ??
          [],
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error interno";

    return NextResponse.json(
      {
        error:
          message,
      },
      {
        status:
          message ===
          "UNAUTHORIZED"
            ? 401
            : 500,
      },
    );
  }
}
