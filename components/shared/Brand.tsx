import Link from "next/link";

export function Brand() {
  return (
    <Link href="#top" className="brand" aria-label="تاپ لینک شو، صفحه اصلی">
      <span className="brand-mark" aria-hidden="true"><i /><b /></span>
      <span dir="ltr">TopLink<span>Sho</span></span>
    </Link>
  );
}
