import { Container } from "@/components/ui/Container";
// A verified metrics source is required before publishing numerical proof.
export function Statistics() {
  return <section className="py-10" aria-label="اصول همکاری"><Container><div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 p-8 md:grid-cols-4">{["شناخت مسئله", "دامنه روشن", "اجرای هماهنگ", "ارزیابی نتیجه"].map(principle => <p key={principle} className="text-center text-sm text-violet-200">{principle}</p>)}</div></Container></section>;
}
