import { Mail, MessageCircle, Phone } from "lucide-react";
import type { ContactChannel } from "@/lib/contact-links";

export function ContactIcon({ channel, size = 20 }: { channel: ContactChannel; size?: number }) {
  if (channel === "phone") return <Phone size={size} aria-hidden="true" />;
  if (channel === "email") return <Mail size={size} aria-hidden="true" />;
  if (channel === "whatsapp") return <MessageCircle size={size} aria-hidden="true" />;
  if (channel === "instagram") return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M5 8.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM3.6 10H6.4V20H3.6ZM9 10h2.7v1.4c.7-1.1 1.7-1.7 3.1-1.7 3 0 3.6 1.9 3.6 4.5V20h-2.8v-5.1c0-1.2 0-2.6-1.6-2.6s-2.2 1.2-2.2 2.5V20H9Z" /></svg>;
}
