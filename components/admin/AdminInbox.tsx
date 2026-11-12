"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Inbox, LoaderCircle, RefreshCw, Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAdminState, type InboxSnapshot } from "@/components/admin/AdminState";
import { formatDate, requestStatuses } from "@/lib/consultation";
import type { InboxResult } from "@/lib/server/consultations";

export function AdminInbox({ initial, initialStatus }: { initial: InboxResult; initialStatus: string }) {
  const router = useRouter();
  const { inbox, setInbox } = useAdminState();
  const snapshot: InboxSnapshot = inbox && inbox.status === initialStatus && inbox.page === initial.page ? inbox : { query: "", status: initialStatus, page: initial.page, result: initial };
  const [draft, setDraft] = useState(snapshot.query);
  const [status, setStatus] = useState(snapshot.status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const result = snapshot.result;
  const formatter = new Intl.NumberFormat("fa-IR");

  async function search(query: string, filter: string, page: number) {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setPending(true);
    setError("");
    setExpired(false);
    try {
      const response = await fetch("/api/admin/consultations/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, status: filter, page }), signal: current.signal });
      const data = await response.json();
      if (controller.current !== current) return;
      if (!response.ok) { setExpired(response.status === 401); setError(data.error || "دریافت درخواست‌ها انجام نشد."); return; }
      setInbox({ query, status: filter, page: data.page, result: data });
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      if (data.page > 1) params.set("page", String(data.page));
      router.replace(`/admin${params.size ? `?${params}` : ""}`, { scroll: false });
    } catch (failure) { if (!(failure instanceof Error && failure.name === "AbortError")) setError("ارتباط برقرار نشد. نتایج قبلی حفظ شده‌اند؛ دوباره تلاش کنید."); }
    finally { if (controller.current === current) setPending(false); }
  }

  return <>
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">{(["new", "reviewing", "contacted", "completed"] as const).map(key => <div key={key} className="neon-surface px-5 py-4"><span className="text-xs text-muted">{requestStatuses[key]}</span><strong className="mt-3 block text-3xl font-semibold tabular-nums">{formatter.format(result.counts.find(item => item.status === key)?.count || 0)}</strong></div>)}</div>
    <div className="neon-surface overflow-hidden">
      <form noValidate onSubmit={event => { event.preventDefault(); void search(draft.trim(), status, 1); }} className="grid items-start gap-4 border-b border-white/10 p-5 sm:grid-cols-[1fr_180px_auto] sm:items-end sm:p-6" aria-label="جست‌وجوی درخواست‌ها">
        <div className="relative"><Input id="admin-search" label="جست‌وجو" placeholder="نام، شماره تماس یا کد پیگیری" maxLength={100} value={draft} onChange={event => setDraft(event.target.value)} style={{ paddingInlineEnd: "3rem" }} enterKeyHint="search" autoComplete="off" />{draft && <button type="button" aria-label="پاک کردن جست‌وجو" className="absolute top-8 left-1 grid size-11 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-white" onClick={() => { setDraft(""); void search("", status, 1); document.getElementById("admin-search")?.focus(); }}><X size={17} aria-hidden="true" /></button>}</div>
        <Select id="admin-status" label="وضعیت" value={status} onChange={event => setStatus(event.target.value)}><option value="">همهٔ وضعیت‌ها</option>{Object.entries(requestStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
        <Button type="submit" variant="secondary" loading={pending} disabled={pending} icon={<Search size={17} aria-hidden="true" />}>جست‌وجو</Button>
      </form>
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-3"><p className="text-xs text-muted">{formatter.format(result.total)} درخواست{snapshot.query && <span> · نتایج جست‌وجو</span>}</p><button type="button" onClick={() => void search(snapshot.query, snapshot.status, snapshot.page)} disabled={pending} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs text-accent hover:bg-white/5 disabled:opacity-50">{pending ? <LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> : <RefreshCw size={15} aria-hidden="true" />}به‌روزرسانی</button></div>
      {error && <div role="alert" className="m-5 rounded-xl border border-rose-300/20 bg-rose-300/5 px-4 py-3 text-sm leading-7 text-rose-200">{error}{expired && <Link href="/admin/login" target="_blank" rel="noreferrer" className="mt-2 block text-accent underline">ورود مجدد در زبانهٔ جدید</Link>}</div>}
      <div className={`min-h-80 transition-opacity ${pending ? "opacity-55" : "opacity-100"}`} aria-busy={pending}>
        {!result.rows.length ? <div className="grid min-h-80 place-items-center px-5 text-center"><div><Inbox size={34} className="mx-auto mb-5 text-accent/60" aria-hidden="true" /><h2 className="text-lg font-semibold">{snapshot.query || snapshot.status ? "درخواستی با این فیلتر پیدا نشد." : "هنوز درخواستی ثبت نشده است."}</h2><p className="mt-3 text-sm leading-8 text-muted">{snapshot.query || snapshot.status ? "جست‌وجو یا وضعیت را تغییر دهید." : "درخواست‌های فرم مشاوره پس از ثبت، اینجا نمایش داده می‌شوند."}</p>{(snapshot.query || snapshot.status) && <button type="button" className="mt-5 min-h-11 rounded-xl px-4 text-sm text-accent hover:bg-white/5" onClick={() => { setDraft(""); setStatus(""); void search("", "", 1); }}>نمایش همهٔ درخواست‌ها</button>}</div></div> : <>
          <div className="hidden overflow-x-auto md:block"><table className="w-full text-right text-sm"><caption className="sr-only">درخواست‌های مشاوره</caption><thead className="border-b border-white/10 text-xs text-muted"><tr>{["درخواست‌کننده", "زمینهٔ مشاوره", "وضعیت", "تاریخ ثبت", "پیگیری"].map(label => <th scope="col" key={label} className="px-5 py-4 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{result.rows.map(lead => <tr key={lead.id} className="hover:bg-white/2"><td className="max-w-64 px-5 py-5"><span className="block break-words font-medium">{lead.name}</span><span className="mt-2 inline-block text-xs text-muted" dir="ltr">{lead.phone}</span></td><td className="px-5 py-5 text-xs leading-7 text-muted">{lead.subject}</td><td className="px-5 py-5"><StatusBadge status={lead.status} /></td><td className="px-5 py-5 text-xs leading-7 whitespace-nowrap text-muted">{formatDate(lead.created_at)}</td><td className="px-5 py-5"><Link href={`/admin/requests/${lead.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-accent hover:border-accent/40" aria-label={`بررسی درخواست ${lead.name}`}>بررسی<ArrowLeft size={15} aria-hidden="true" /></Link></td></tr>)}</tbody></table></div>
          <div className="divide-y divide-white/10 md:hidden">{result.rows.map(lead => <article key={lead.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-semibold">{lead.name}</h2><span className="mt-2 inline-block text-xs text-muted" dir="ltr">{lead.phone}</span></div><StatusBadge status={lead.status} /></div><p className="mt-4 text-xs leading-7 text-muted">{lead.subject}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><time className="text-[11px] text-muted" dateTime={new Date(lead.created_at).toISOString()}>{formatDate(lead.created_at)}</time><Link className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-accent hover:border-accent/40" href={`/admin/requests/${lead.id}`} aria-label={`بررسی درخواست ${lead.name}`}>بررسی درخواست<ArrowLeft size={15} aria-hidden="true" /></Link></div></article>)}</div>
        </>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-5 py-4"><span className="text-xs text-muted">صفحهٔ {formatter.format(result.page)} از {formatter.format(result.pages)}</span><nav className="flex gap-2" aria-label="صفحه‌بندی درخواست‌ها"><button type="button" disabled={pending || result.page <= 1} onClick={() => void search(snapshot.query, snapshot.status, result.page - 1)} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-xs hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35"><ArrowRight size={15} aria-hidden="true" />قبلی</button><button type="button" disabled={pending || result.page >= result.pages} onClick={() => void search(snapshot.query, snapshot.status, result.page + 1)} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-xs hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35">بعدی<ArrowLeft size={15} aria-hidden="true" /></button></nav></div>
    </div>
  </>;
}
