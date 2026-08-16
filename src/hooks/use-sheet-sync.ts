import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { pushToGoogleSheet, pullFromGoogleSheet } from "@/lib/sheets.functions";

/** Mirrors the whole database into the company Google Sheet. */
export function useSheetPush() {
  const push = useServerFn(pushToGoogleSheet);
  return useMutation({
    mutationFn: async () => push(),
  });
}

/** Fire-and-forget mirror used after every record change. */
export function useAutoSheetSync() {
  const { mutate } = useSheetPush();
  return () =>
    mutate(undefined, {
      onError: (e: Error) => toast.error(`Google Sheet not updated: ${e.message}`),
    });
}

export function useSheetPull() {
  const pull = useServerFn(pullFromGoogleSheet);
  return useMutation({
    mutationFn: async () => pull(),
  });
}
