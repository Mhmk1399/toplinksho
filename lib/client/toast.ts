"use client";

export type ToastKind = "success" | "error" | "warning" | "info";
export type ToastOptions = { id?: string; title?: string; duration?: number; announce?: boolean };
export type ToastMessage = Required<ToastOptions> & { kind: ToastKind; message: string; revision: number };
const empty: readonly ToastMessage[] = [];
let messages = empty;
let sequence = 0;
const listeners = new Set<() => void>();
function publish(next: readonly ToastMessage[]) {
  messages = next;
  listeners.forEach(listener => listener());
}
function show(kind: ToastKind, message: string, options: ToastOptions = {}) {
  if (typeof window === "undefined" || !message.trim()) return "";
  const revision = ++sequence;
  const id = options.id || `notice-${revision}`;
  const title = options.title || { success: "با موفقیت انجام شد", error: "عملیات انجام نشد", warning: "لطفاً بررسی کنید", info: "جهت اطلاع شما" }[kind];
  const item = { id, kind, message, title, duration: options.duration ?? (kind === "error" ? 10000 : 6500), announce: options.announce ?? true, revision };
  // Updating the same operation replaces its notice; rapid clicks cannot fill the screen.
  publish([...messages.filter(item => item.id !== id), item].slice(-3));
  return id;
}
export const toast = {
  success: (message: string, options?: ToastOptions) => show("success", message, options),
  error: (message: string, options?: ToastOptions) => show("error", message, options),
  warning: (message: string, options?: ToastOptions) => show("warning", message, options),
  info: (message: string, options?: ToastOptions) => show("info", message, options),
  dismiss: (id?: string) => { if (messages.length && (!id || messages.some(item => item.id === id))) publish(id ? messages.filter(item => item.id !== id) : empty); },
};
export const toastStore = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  getSnapshot: () => messages,
  getServerSnapshot: () => empty,
};
