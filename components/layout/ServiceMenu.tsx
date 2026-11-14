import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronDown,
  Grid2X2,
  Layers3,
  MessageCircle,
  Tags,
} from "lucide-react";
import { serviceNavigation } from "@/lib/site";
import { getMenuArtwork } from "@/lib/menu-artwork";
import { NavigationIcon } from "@/components/layout/NavigationIcon";

type CloseProps = { onNavigate: () => void };

function ServiceMenuImage({
  path,
  className = "",
}: {
  path: string;
  className?: string;
}) {
  const image = { src: getMenuArtwork(path) };
  return (
    <span className={`service-menu-art ${className}`} aria-hidden="true">
      <Image
        src={image.src}
        alt=""
        width={300}
        height={200}
        sizes="(min-width: 1200px) 220px, 68px"
        loading="lazy"
      />
    </span>
  );
}

export function DesktopServiceMenu({ onNavigate }: CloseProps) {
  return (
    <div className="mega-menu service-mega-menu" data-lenis-prevent>
    
      <div className="mega-menu-groups service-menu-columns">
        {serviceNavigation.map((group) => {
          return (
            <section
              key={group.id}
              className="service-menu-column"
              aria-label={group.menuTitle}
            >
              <Link
                className="service-menu-group"
                href={group.path}
                prefetch={false}
                onClick={onNavigate}
              >
                <ServiceMenuImage path={group.path} />
                <span className="service-menu-group-label">
                  <span className="service-menu-icon">
                    <NavigationIcon path={group.path} />
                  </span>
                  <strong>{group.menuTitle}</strong>
                  <ChevronLeft size={13} aria-hidden="true" />
                </span>
              </Link>
              <ul>
                {group.items.map((service) => (
                  <li key={service.path}>
                    <Link
                      className="service-menu-link"
                      href={service.path}
                      prefetch={false}
                      onClick={onNavigate}
                    >
                      <span className="service-menu-icon">
                        <NavigationIcon path={service.path} />
                      </span>
                      <span className="service-menu-link-copy">
                        <strong>{service.title}</strong>
                        <span>{service.summary}</span>
                      </span>
                      <ChevronLeft size={13} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <aside className="service-menu-feature">
          <ServiceMenuImage path="featured" />
          <p className="service-menu-feature-title">رشد و امنیت</p>
          <p className="service-menu-feature-copy">
            تحلیل، بهینه‌سازی و افزایش امنیت؛ برای حضوری هدفمند و قابل نگهداری.
          </p>
          <Link
            href="/services/growth"
            prefetch={false}
            onClick={onNavigate}
            className="service-menu-button"
          >
            مشاهدهٔ راهکارها
            <ChevronLeft size={15} aria-hidden="true" />
          </Link>
        </aside>
      </div>
      <div className="service-menu-footer">
        <div className="service-menu-shortcuts">
          {[
            { href: "/services", label: "همهٔ خدمات", Icon: Grid2X2 },
            { href: "/pricing", label: "تعرفه‌ها", Icon: Tags },
            {
              href: "/live-case-studies",
              label: "مطالعهٔ موردی",
              Icon: Layers3,
            },
          ].map(({ href, label, Icon }) => (
            <Link href={href} key={href} prefetch={false} onClick={onNavigate}>
              <Icon size={17} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
        <div className="service-menu-help">
          <div>
            <strong>نیاز به راهنمایی دارید؟</strong>
            <span>با هم مسیر مناسب پروژه‌تان را پیدا می‌کنیم.</span>
          </div>
          <Link
            href="/contact#consultation"
            prefetch={false}
            onClick={onNavigate}
            className="service-menu-button"
          >
            <MessageCircle size={16} aria-hidden="true" />
            مشاوره رایگان
          </Link>
        </div>
      </div>
    </div>
  );
}

export function MobileServiceMenu({ onNavigate }: CloseProps) {
  return (
    <details className="mobile-services" open>
      <summary className="mobile-service-toggle">
        <Layers3 size={19} aria-hidden="true" />
        <span>خدمات ما</span>
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      {serviceNavigation.map((group) => {
        return (
          <details className="mobile-service-group" key={group.id}>
            <summary>
              <ServiceMenuImage path={group.path} />
              <span className="mobile-service-group-copy">
                <strong>{group.menuTitle}</strong>
                <span>{group.menuDescription}</span>
              </span>
              <ChevronLeft size={15} aria-hidden="true" />
            </summary>
            <div className="mobile-service-links">
              <Link
                href={group.path}
                prefetch={false}
                onClick={onNavigate}
                className="mobile-service-all"
              >
                <NavigationIcon path={group.path} />
                همهٔ خدمات {group.title}
                <ArrowLeft size={15} aria-hidden="true" />
              </Link>
              {group.items.map((service) => (
                <Link
                  href={service.path}
                  key={service.path}
                  prefetch={false}
                  onClick={onNavigate}
                >
                  <NavigationIcon path={service.path} size={17} />
                  <span>{service.title}</span>
                  <ChevronLeft size={13} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </details>
        );
      })}
      <Link
        href="/services#catalog"
        prefetch={false}
        onClick={onNavigate}
        className="mobile-all-services"
      >
        <Grid2X2 size={16} aria-hidden="true" />
        مشاهده و جست‌وجوی همهٔ خدمات
        <ArrowLeft size={15} aria-hidden="true" />
      </Link>
    </details>
  );
}
