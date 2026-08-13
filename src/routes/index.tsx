import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Shree Krushna Enterprises | Fleet, Fuel & Driver Manager" },
      {
        name: "description",
        content:
          "Manage drivers, vehicles, fuel expenses, attendance and salary for Shree Krushna Enterprises.",
      },
      { property: "og:title", content: "Shree Krushna Enterprises | Fleet Manager" },
      {
        property: "og:description",
        content: "Fleet, fuel, attendance and salary management for Shree Krushna Enterprises.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/dashboard" : "/auth" });
  },
  component: () => null,
});
