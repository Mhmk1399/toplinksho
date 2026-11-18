"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { InboxResult } from "@/lib/server/consultations";
import type { RequestStatus } from "@/lib/consultation";
import type { ProjectInput } from "@/lib/projects";

export type InboxSnapshot = { query: string; status: string; page: number; result: InboxResult };
export type RequestDraft = { status: RequestStatus; notes: string; version: number; unsaved?: boolean };
export type ProjectDraft = { data: ProjectInput; version: number; unsaved: boolean; projectId?: string };
type State = {
  inbox: InboxSnapshot | null;
  setInbox: (snapshot: InboxSnapshot) => void;
  drafts: Record<string, RequestDraft>;
  setDraft: (id: string, value: RequestDraft | null) => void;
  projectDrafts: Record<string, ProjectDraft>;
  setProjectDraft: (id: string, value: ProjectDraft | null) => void;
  projectUploads: Record<string, boolean>;
  setProjectUploading: (id: string, uploading: boolean) => void;
  clear: () => void;
};
const Context = createContext<State | null>(null);

export function AdminState({ children }: { children: ReactNode }) {
  const [inbox, setInbox] = useState<InboxSnapshot | null>(null);
  const [drafts, setDrafts] = useState<Record<string, RequestDraft>>({});
  const [projectDrafts, setProjectDrafts] = useState<Record<string, ProjectDraft>>({});
  const [projectUploads, setProjectUploads] = useState<Record<string, boolean>>({});
  function setProjectUploading(id: string, uploading: boolean) { setProjectUploads(current => { const next = { ...current }; if (uploading) next[id] = true; else delete next[id]; return next; }); }
  function setProjectDraft(id: string, value: ProjectDraft | null) { setProjectDrafts(current => { const next = { ...current }; if (value) next[id] = value; else delete next[id]; return next; }); }
  function setDraft(id: string, value: RequestDraft | null) {
    setDrafts(current => {
      const next = { ...current };
      if (value) next[id] = value; else delete next[id];
      return next;
    });
  }
  function clear() { setInbox(null); setDrafts({}); setProjectDrafts({}); setProjectUploads({}); }
  return <Context.Provider value={{ inbox, setInbox, drafts, setDraft, projectDrafts, setProjectDraft, projectUploads, setProjectUploading, clear }}>{children}</Context.Provider>;
}

export function useAdminState() {
  const value = useContext(Context);
  if (!value) throw new Error("Admin state is unavailable.");
  return value;
}
