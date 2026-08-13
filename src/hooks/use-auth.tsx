import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "owner" | "driver";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
    staleTime: 60_000,
  });
}

export function useRole() {
  const { data: user, isLoading } = useSession();
  const query = useQuery({
    queryKey: ["role", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      const roles = (data ?? []).map((r) => r.role as AppRole);
      return roles.includes("owner") ? "owner" : "driver";
    },
    staleTime: 60_000,
  });
  return {
    role: query.data as AppRole | undefined,
    isOwner: query.data === "owner",
    isLoading: isLoading || query.isLoading,
    user,
  };
}

export function useMyDriver() {
  const { data: user } = useSession();
  return useQuery({
    queryKey: ["my-driver", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*, vehicles:assigned_vehicle_id(*)")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
