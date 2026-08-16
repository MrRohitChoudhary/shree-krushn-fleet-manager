import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const pushToGoogleSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isOwner, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "owner",
    });
    if (error) throw new Error(error.message);
    if (!isOwner) throw new Error("Only the owner can sync the Google Sheet");
    const { pushAllToSheet } = await import("./sheets-sync.server");
    return pushAllToSheet(context.supabase);
  });

export const pullFromGoogleSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isOwner, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "owner",
    });
    if (error) throw new Error(error.message);
    if (!isOwner) throw new Error("Only the owner can import from the Google Sheet");
    const { pullFromSheet } = await import("./sheets-sync.server");
    return pullFromSheet(context.supabase);
  });
