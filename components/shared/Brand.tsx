import Link from "next/link";
import Image from "next/image";

export function Brand() {
  return (
    <Link href="#top" className="inline-flex shrink-0 items-center" aria-label="تاپ لینک شو، صفحه اصلی">
      <Image
        src="/web-logo2333.webp"
        alt="تاپ لینک شو"
        width={132}
        height={71}
        className="h-[52px] w-auto object-contain"
        priority
      />
    </Link>
  );
}
