import { PwaInstall } from "@/components/layout/PwaInstall";
import Link from "next/link";
import { Brand } from "@/components/shared/Brand";
import { Container } from "@/components/ui/Container";
import { ContactLinks } from "@/components/shared/ContactLinks";
import { ArrowUp } from "lucide-react";
import { navigation } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer site-footer--contacts">
      <Container>
        <div className="footer-shell">
          <div className="footer-top">
            <div className="footer-brand">
              <Brand />
              <p>برای برندهایی که به قدم بعدی فکر می‌کنند.</p>
            </div>
            <nav aria-label="ناوبری پاورقی">
              {navigation.map(({ href, label }) => <Link href={href} key={href}>{label}</Link>)}
            </nav>
            <ContactLinks variant="footer" className="footer-contact-links" />
          </div>
          <div className="footer-bottom">
            <PwaInstall />
            <span>© تاپ لینک شو. تمامی حقوق محفوظ است.</span>
            <span className="footer-signature" dir="ltr">
              STRATEGY MEETS CREATIVITY.
            </span>
            <Link href="#top" className="footer-back-top">
              بازگشت به بالا <ArrowUp size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
