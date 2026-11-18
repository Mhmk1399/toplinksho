"use client";

import { useCallback, useState } from "react";
import { toast, type ToastKind, type ToastOptions } from "@/lib/client/toast";

/** Keep a persistent inline message and show the same operation in the shared viewport. */
export function useFeedback(kind: ToastKind, id: string) {
  const [message, setMessage] = useState("");
  const update = useCallback((value: string, options?: ToastOptions & { kind?: ToastKind }) => {
    setMessage(value);
    // Inline live regions already announce these messages. Avoid reading them twice.
    if (value) toast[options?.kind || kind](value, { id, announce: false, ...options });
    else toast.dismiss(id);
  }, [id, kind]);
  return [message, update] as const;
}
