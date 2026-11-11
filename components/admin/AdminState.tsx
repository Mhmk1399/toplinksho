"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { InboxResult } from "@/lib/server/consultations";
import type { RequestStatus } from "@/lib/consultation";

export type InboxSnapshot = { query: string; status: string; page: number; result: InboxResult };
export type RequestDraft = { status: RequestStatus; notes: string; version: number; unsaved?: boolean };
type State = {
  inbox: InboxSnapshot | null;
  setInbox: (snapshot: InboxSnapshot) => void;
  drafts: Record<string, RequestDraft>;
  setDraft: (id: string, value: RequestDraft | null) => void;
  clear: () => void;
};
const Context = createContext<State | null>(null);

export function AdminState({ children }: { children: ReactNode }) {
  const [inbox, setInbox] = useState<InboxSnapshot | null>(null);
  const [drafts, setDrafts] = useState<Record<string, RequestDraft>>({});
  function setDraft(id: string, value: RequestDraft | null) {
    setDrafts(current => {
      const next = { ...current };
      if (value) next[id] = value; else delete next[id];
      return next;
    });
  }
  function clear() { setInbox(null); setDrafts({}); }
  return <Context.Provider value={{ inbox, setInbox, drafts, setDraft, clear }}>{children}</Context.Provider>;
}

export function useAdminState() {
  const value = useContext(Context);
  if (!value) throw new Error("Admin state is unavailable.");
  return value;
}
