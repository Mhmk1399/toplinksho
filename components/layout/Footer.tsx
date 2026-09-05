import { Camera, Link2, Mail, MapPin, Phone, Send } from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const quickLinks = ["خانه", "خدمات", "نمونه کارها", "مقالات", "درباره ما", "تماس با ما"];
const services = ["مشاوره و کمپین‌های تبلیغاتی", "تبلیغات گوگل", "شبکه‌های اجتماعی", "طراحی سایت و توسعه", "تبلیغات و برندینگ"];

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <Container>
        <div className="footer-panel">
          <div className="footer-top">
            <div className="footer-intro"><Brand /><p>شریک استراتژیک شما برای ساختن تجربه‌های دیجیتال ماندگار و رشد قابل اندازه‌گیری.</p><div className="socials"><a href="#" aria-label="اینستاگرام"><Camera /></a><a href="#" aria-label="لینکدین"><Link2 /></a><a href="#" aria-label="تلگرام"><Send /></a></div></div>
            <div className="footer-links"><h3>دسترسی سریع</h3>{quickLinks.map((item) => <a href="#" key={item}>{item}</a>)}</div>
            <div className="footer-links"><h3>خدمات</h3>{services.map((item) => <a href="#services" key={item}>{item}</a>)}</div>
            <div className="footer-contact"><h3>ارتباط با ما</h3><a href="tel:+982100000000"><Phone size={18} /><span dir="ltr">+98 21 0000 0000</span></a><a href="mailto:hello@toplinksho.com"><Mail size={18} /><span dir="ltr">hello@toplinksho.com</span></a><p><MapPin size={18} />تهران، ایران</p></div>
          </div>
          <div className="newsletter"><div><h3>از جدیدترین مطالب و آموزش‌ها باخبر شوید</h3><p>خبرنامه‌ای کوتاه، کاربردی و بدون ایمیل‌های اضافه.</p></div><form><label className="sr-only" htmlFor="newsletter-email">ایمیل</label><input id="newsletter-email" type="email" dir="ltr" placeholder="your@email.com" /><Button type="submit" size="sm">اشتراک</Button></form></div>
          <div className="footer-bottom"><span>© ۱۴۰۵ تاپ لینک شو. تمامی حقوق محفوظ است.</span><span>طراحی شده برای رشد</span></div>
        </div>
      </Container>
    </footer>
  );
}
