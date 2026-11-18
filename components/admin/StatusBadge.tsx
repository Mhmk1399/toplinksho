import { requestStatuses, type RequestStatus } from "@/lib/consultation";

const colors: Record<RequestStatus, string> = {
  new: "border-sky-300/20 bg-sky-300/8 text-sky-200",
  reviewing: "border-amber-300/20 bg-amber-300/8 text-amber-200",
  contacted: "border-violet-300/20 bg-violet-300/8 text-violet-200",
  completed: "border-emerald-300/20 bg-emerald-300/8 text-emerald-200",
  archived: "border-white/15 bg-white/4 text-muted",
};
export function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] whitespace-nowrap ${colors[status]}`}>{requestStatuses[status]}</span>;
}
