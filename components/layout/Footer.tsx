import { Camera, Link2, Mail, MapPin, Phone, Send } from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const quickLinks = ["خانه", "خدمات", "نمونه کارها", "مقالات", "درباره ما", "تماس با ما"];
const services = ["مشاوره و کمپین‌های تبلیغاتی", "تبلیغات گوگل", "شبکه‌های اجتماعی", "طراحی سایت و توسعه", "تبلیغات و برندینگ"];

export function Footer() {
  return (
    <footer className="relative pb-8 pt-28 max-md:pt-20" id="contact">
      <Container>
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012)),rgba(12,16,41,.75)] px-10 pt-12 shadow-2xl backdrop-blur-xl max-md:px-6">
          <div className="grid grid-cols-[1.5fr_1fr_1.2fr_1.2fr] gap-12 max-lg:grid-cols-2 max-sm:grid-cols-1">
            <div><Brand /><p className="mt-6 max-w-sm leading-8 text-white/55">شریک استراتژیک شما برای ساختن تجربه‌های دیجیتال ماندگار و رشد قابل اندازه‌گیری.</p><div className="mt-6 flex gap-2"><a className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10" href="#" aria-label="اینستاگرام"><Camera size={19} /></a><a className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10" href="#" aria-label="لینکدین"><Link2 size={19} /></a><a className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10" href="#" aria-label="تلگرام"><Send size={19} /></a></div></div>
            <div className="flex flex-col gap-3 text-sm text-white/55"><h3 className="mb-2 text-base font-bold text-white">دسترسی سریع</h3>{quickLinks.map((item) => <a className="transition hover:text-white" href="#" key={item}>{item}</a>)}</div>
            <div className="flex flex-col gap-3 text-sm text-white/55"><h3 className="mb-2 text-base font-bold text-white">خدمات</h3>{services.map((item) => <a className="transition hover:text-white" href="#services" key={item}>{item}</a>)}</div>
            <div className="flex flex-col gap-4 text-sm text-white/55"><h3 className="mb-1 text-base font-bold text-white">ارتباط با ما</h3><a className="flex items-center gap-3 transition hover:text-white" href="tel:+982100000000"><Phone className="text-pink-300" size={18} /><span dir="ltr">+98 21 0000 0000</span></a><a className="flex items-center gap-3 transition hover:text-white" href="mailto:hello@toplinksho.com"><Mail className="text-pink-300" size={18} /><span dir="ltr">hello@toplinksho.com</span></a><p className="flex items-center gap-3"><MapPin className="text-pink-300" size={18} />تهران، ایران</p></div>
          </div>
          <div className="my-10 flex items-center justify-between gap-8 rounded-[22px] border border-white/10 bg-white/[.035] p-6 max-md:flex-col max-md:items-stretch"><div><h3 className="font-bold">از جدیدترین مطالب و آموزش‌ها باخبر شوید</h3><p className="mt-1 text-sm text-white/50">خبرنامه‌ای کوتاه، کاربردی و بدون ایمیل‌های اضافه.</p></div><form className="flex min-w-[380px] gap-2 max-md:min-w-0 max-sm:flex-col"><label className="sr-only" htmlFor="newsletter-email">ایمیل</label><input className="min-h-11 flex-1 rounded-[14px] border border-white/10 bg-[#050817]/50 px-4 text-left outline-none placeholder:text-white/30 focus:border-violet-400/60" id="newsletter-email" type="email" dir="ltr" placeholder="your@email.com" /><Button type="submit" size="sm">اشتراک</Button></form></div>
          <div className="flex justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/40 max-sm:flex-col"><span>© ۱۴۰۵ تاپ لینک شو. تمامی حقوق محفوظ است.</span><span>طراحی شده برای رشد</span></div>
        </div>
      </Container>
    </footer>
  );
}
