import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  driverId: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const createDriverLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isOwner, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "owner",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isOwner) throw new Error("Only the owner can create driver logins");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      throw new Error(createError?.message ?? "Could not create the login");
    }

    const userId = created.user.id;

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "driver" }, { onConflict: "user_id,role" });

    const { error: linkError } = await supabaseAdmin
      .from("drivers")
      .update({ user_id: userId })
      .eq("id", data.driverId);
    if (linkError) throw new Error(linkError.message);

    return { ok: true, email: data.email };
  });
