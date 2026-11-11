import { Button } from "@/components/ui/Button";
// No backend exists in this prototype. Do not imply that a lead was saved.
export function ContactForm(){return <div className="grid gap-4"><p className="text-white/70 leading-8">برای گفت‌وگو درباره پروژه، با ما تماس بگیرید یا ایمیل بفرستید. فرم آنلاین پس از اتصال به سرویس دریافت درخواست فعال خواهد شد.</p><Button href="mailto:Info@TopLinkSho.com">باز کردن برنامه ایمیل</Button><Button href="tel:+989122191549" variant="secondary">تماس با تاپ لینک شو</Button></div>}
