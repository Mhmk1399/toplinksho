"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormControls";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  return <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><Input id="contact-name" name="name" label="نام و نام خانوادگی" autoComplete="name" required /><Input id="contact-phone" name="phone" label="شماره تماس" inputMode="tel" autoComplete="tel" required /><Input id="contact-email" name="email" label="ایمیل" type="email" dir="ltr" autoComplete="email" /><Select id="contact-service" name="service" label="نوع خدمات" defaultValue=""><option value="" disabled>انتخاب کنید</option><option>کمپین تبلیغاتی</option><option>شبکه‌های اجتماعی</option><option>طراحی سایت</option><option>تبلیغات گوگل</option><option>برندینگ</option></Select><Textarea id="contact-message" name="message" label="پیام شما" required /><Button className="w-full" type="submit" icon={<Send size={18} />}>ارسال درخواست</Button>{sent ? <p className="rounded-xl bg-emerald-400/10 p-3 text-center text-sm text-emerald-300" role="status">درخواست شما ثبت شد. به‌زودی با شما تماس می‌گیریم.</p> : null}</form>;
}
