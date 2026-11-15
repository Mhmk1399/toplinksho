/** UUID v4 for idempotency, including browsers on a non-HTTPS LAN origin.
 * getRandomValues is available there even when randomUUID is not. This is
 * invoked only on submit, so SSR/hydration never depends on random values.
 */
export function createSubmissionId() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
