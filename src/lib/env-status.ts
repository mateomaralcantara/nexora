export interface EnvironmentStatus {
  supabase: boolean;
  supabaseAdmin: boolean;
  openai: boolean;
  whatsapp: boolean;
  email: boolean;
}

function hasValue(
  value: string | undefined,
) {
  return Boolean(
    value &&
      value.trim().length > 0 &&
      !value.includes("YOUR_") &&
      !value.includes("REPLACE_"),
  );
}

export function getEnvironmentStatus(): EnvironmentStatus {
  return {
    supabase:
      hasValue(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      ) &&
      hasValue(
        process.env
          .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ),

    supabaseAdmin:
      hasValue(
        process.env
          .SUPABASE_SERVICE_ROLE_KEY,
      ),

    openai:
      hasValue(
        process.env.OPENAI_API_KEY,
      ),

    whatsapp:
      hasValue(
        process.env
          .WHATSAPP_ACCESS_TOKEN,
      ) &&
      hasValue(
        process.env
          .WHATSAPP_PHONE_NUMBER_ID,
      ),

    email:
      hasValue(
        process.env.RESEND_API_KEY,
      ),
  };
}