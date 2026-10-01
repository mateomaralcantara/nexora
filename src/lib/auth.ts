import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  /*
   * Todo lo que viene después depende de cookies/sesión.
   * Nunca debe ejecutarse durante prerender/build.
   */
  await connection();

  const supabase = await createClient();

  if (!supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError) {
    throw new Error("UNAUTHORIZED");
  }

  const userId =
    claimsData?.claims?.sub;

  if (
    !userId ||
    typeof userId !== "string"
  ) {
    throw new Error("UNAUTHORIZED");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, organization_id, role, full_name"
    )
    .eq("id", userId)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.organization_id
  ) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  return {
    supabase,

    userId,

    organizationId:
      profile.organization_id as string,

    role:
      profile.role as string,

    fullName:
      profile.full_name as string | null,
  };
}

export async function getOptionalUser() {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}