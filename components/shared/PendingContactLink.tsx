"use client";

import type { ReactNode } from "react";
import { toast } from "@/lib/client/toast";
import type { ContactChannel } from "@/lib/contact-links";

type PendingContactLinkProps = {
  children: ReactNode;
  className?: string;
  channel?: ContactChannel;
  label?: string;
  onActivate?: () => void;
};

export function PendingContactLink({
  children,
  className,
  channel = "instagram",
  label = "اینستاگرام",
  onActivate,
}: PendingContactLinkProps) {
  const message = `لینک ${label} به‌زودی اضافه می‌شود`;

  return (
    <button
      type="button"
      className={className}
      data-channel={channel}
      data-pending="true"
      aria-label={`${label}؛ لینک به‌زودی اضافه می‌شود`}
      title={message}
      onClick={() => {
        onActivate?.();
        toast.info(message, { id: `pending-contact-${channel}`, title: "به‌زودی" });
      }}
    >
      {children}
    </button>
  );
}
