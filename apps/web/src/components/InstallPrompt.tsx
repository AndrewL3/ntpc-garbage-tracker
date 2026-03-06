import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => setDeferredPrompt(null);

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-lg">
        <span className="text-sm text-foreground">
          {t("pwa.installPrompt")}
        </span>
        <button
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          onClick={install}
        >
          {t("pwa.install")}
        </button>
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={dismiss}
        >
          {t("pwa.dismiss")}
        </button>
      </div>
    </div>
  );
}
