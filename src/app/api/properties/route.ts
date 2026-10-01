import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title:
    z.string().min(3).max(180),

  description:
    z.string().max(12000).optional().default(""),

  operation:
    z.enum([
      "sale",
      "rent",
      "short_rent",
    ]),

  status:
    z.enum([
      "draft",
      "published",
    ]),

  property_type:
    z.string().min(2).max(80),

  price:
    z.number().nonnegative(),

  currency:
    z.string().length(3),

  bedrooms:
    z.number().nonnegative().optional(),

  bathrooms:
    z.number().nonnegative().optional(),

  parking_spaces:
    z.number().nonnegative().optional(),

  area_m2:
    z.number().nonnegative().optional(),

  lot_m2:
    z.number().nonnegative().optional(),

  land_tareas:
    z.number().nonnegative().optional(),

  construction_status:
    z.enum([
      "ready",
      "under_construction",
      "pre_sale",
    ]).optional(),

  expected_delivery_date:
    z.string().max(20).optional().or(
      z.literal(""),
    ),

  animals_present:
    z.boolean().optional().default(false),

  animals_description:
    z.string().max(500).optional().default(""),

  sector:
    z.string().max(120).optional(),

  city:
    z.string().max(120).optional(),

  province:
    z.string().max(120).optional(),

  country:
    z.string().max(120).optional(),

  image_url:
    z.string().url().or(
      z.literal(""),
    ).optional(),

  amenities:
    z.array(
      z.string().max(80),
    ).max(50).optional(),
});

export async function GET() {
  try {
    const {
      supabase,
    } = await requireUser();

    const {
      data,
      error,
    } = await supabase
      .from("properties")
      .select(
        "*,property_images(*)",
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      properties:
        data ?? [],
    });

  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error",
      },
      {
        status: 401,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const auth =
      await requireUser();

    const parsed =
      schema.safeParse(
        await request.json(),
      );

    if (!parsed.success) {
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
      image_url,
      ...input
    } = parsed.data;

    const slug =
      `${slugify(
        input.title,
      )}-${Date.now()
        .toString()
        .slice(-7)}`;

    const {
      data: property,
      error,
    } = await auth.supabase
      .from("properties")
      .insert({
        ...input,

        expected_delivery_date:
          input.expected_delivery_date ||
          null,

        animals_description:
          input.animals_present
            ? input.animals_description
            : "",

        organization_id:
          auth.organizationId,

        agent_id:
          auth.userId,

        slug,

        published_at:
          input.status === "published"
            ? new Date().toISOString()
            : null,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // Compatibilidad con el formulario anterior
    if (image_url) {
      const {
        error: imageError,
      } = await auth.supabase
        .from("property_images")
        .insert({
          organization_id:
            auth.organizationId,

          property_id:
            property.id,

          url:
            image_url,

          position: 0,
        });

      if (imageError) {
        console.error(
          imageError.message,
        );
      }
    }

    return NextResponse.json(
      {
        property,
      },
      {
        status: 201,
      },
    );

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error interno";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          message === "UNAUTHORIZED"
            ? 401
            : 500,
      },
    );
  }
}