import Link from "next/link";

export function Brand() {
  return (
    <Link href="#top" className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white" aria-label="تاپ لینک شو، صفحه اصلی">
      <span className="relative grid size-9 rotate-45 place-items-center rounded-[10px] bg-[linear-gradient(135deg,#3157ff,#8b3dff_55%,#f02b78)] shadow-[0_8px_24px_rgba(124,58,237,.35)]" aria-hidden="true"><i className="h-4 w-1.5 -rotate-45 rounded-full bg-white" /><b className="absolute size-2 -translate-x-2 translate-y-2 rounded-full bg-white/75" /></span>
      <span dir="ltr">TopLink<span className="text-[#ff3d9a]">Sho</span></span>
    </Link>
  );
}
