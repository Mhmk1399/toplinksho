import Image from "next/image";
import Link from "next/link";

export function Brand({ href = "/#top", label = "تاپ لینک شو، صفحه اصلی" }: { href?: string; label?: string } = {}) {
  return (
    <Link
      href={href}
      className="brand"
      aria-label={label}
    >
      <Image
        src="/images/logo.webp"
        alt="تاپ لینک شو"
        width={132}
        height={71}
        className="brand-logo"
        loading="eager"
        unoptimized
      />
    </Link>
  );
}
