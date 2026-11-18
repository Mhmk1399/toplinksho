import Link from "next/link";
import { ArrowUpLeft, Mail, Phone } from "lucide-react";
import content from "@/content/home.fa.json";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";

export function HomeContact() {
  const section = content.contact;
  return <section id="contact" aria-labelledby="home-contact-title" className="pb-14 pt-2 sm:pb-20">
    <Container><div className="neon-surface grid items-center gap-8 rounded-3xl p-6 md:grid-cols-[1fr_1fr] sm:p-8 lg:p-10">
      <div><span className="eyebrow">{section.eyebrow}</span><h2 id="home-contact-title" className="home-title font-extrabold">{section.title}</h2><p className="mt-3 max-w-md text-sm leading-7 text-muted">{section.description}</p><Link href={section.cta.href} className={buttonClasses({ variant: "secondary", size: "sm", className: "mt-5" })}>{section.cta.label}</Link></div>
      <div className="space-y-3">
        {[{ icon: Phone, label: section.phoneLabel, href: `tel:${site.phone}`, value: site.phoneDisplay }, { icon: Mail, label: section.emailLabel, href: `mailto:${site.email}`, value: site.email }].map(item => <a href={item.href} key={item.href} className="neon-surface flex min-h-20 items-center gap-4 px-4 py-3">
          <item.icon size={20} aria-hidden="true" className="shrink-0 text-accent" /><span className="min-w-0 flex-1"><span className="block text-xs text-muted">{item.label}</span><span className="mt-1 block break-all text-base font-medium" dir="ltr">{item.value}</span></span><ArrowUpLeft size={17} aria-hidden="true" className="shrink-0 text-muted" />
        </a>)}
      </div>
    </div></Container>
  </section>;
}
