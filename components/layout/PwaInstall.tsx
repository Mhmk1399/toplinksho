"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstall() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator) ||
      !window.isSecureContext
    )
      return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const standalone = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone;
    const install = (event: Event) => {
      event.preventDefault();
      if (!standalone()) setPrompt(event as InstallEvent);
    };
    const installed = () => {
      setPrompt(null);
      setIos(false);
    };
    const register = () => {
      timer = setTimeout(() => {
        if (cancelled) return;
        navigator.serviceWorker
          .register("/sw.js", { scope: "/", updateViaCache: "none" })
          .catch(() => {
            /* Native site remains available when registration is blocked. */
          });
        if (
          !standalone() &&
          (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
        )
          setIos(true);
      }, 1200);
    };
    window.addEventListener("beforeinstallprompt", install);
    window.addEventListener("appinstalled", installed);
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("load", register);
      window.removeEventListener("beforeinstallprompt", install);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  if (!prompt && !ios) return null;
  if (ios)
    return (
      <details className="max-w-xs text-xs leading-7 text-muted">
        <summary className="cursor-pointer rounded-lg px-2 py-2 transition hover:text-white focus-visible:outline-2 focus-visible:outline-accent">
          افزودن تاپ لینک شو به صفحهٔ اصلی
        </summary>
        <p className="mt-2">
          در Safari، منوی اشتراک‌گذاری را باز کنید و «Add to Home Screen» را
          بزنید.
        </p>
      </details>
    );
  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        loading={busy}
        icon={<Download size={16} aria-hidden="true" />}
        onClick={async () => {
          if (!prompt) return;
          setBusy(true);
          setError("");
          try {
            await prompt.prompt();
            await prompt.userChoice;
            setPrompt(null);
          } catch {
            setError("نصب انجام نشد. از منوی مرورگر دوباره امتحان کنید.");
          } finally {
            setBusy(false);
          }
        }}
      >
        نصب تاپ لینک شو
      </Button>
      {error && (
        <p role="status" className="max-w-xs text-xs leading-7 text-muted">
          {error}
        </p>
      )}
    </div>
  );
}
