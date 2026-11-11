import Link from "next/link";
import { Brand } from "@/components/shared/Brand";
import { Container } from "@/components/ui/Container";
import { ArrowUpLeft } from "lucide-react";
export function Footer(){return <footer className="site-footer"><Container><div className="footer-top"><div><Brand/><p>برای برندهایی که به قدم بعدی فکر می‌کنند.</p></div><nav aria-label="ناوبری پاورقی"><Link href="/#services">راهکارها</Link><Link href="/#about">روش همکاری</Link><Link href="/#portfolio">کانسپت‌ها</Link><Link href="/#blog">پرسش‌ها</Link></nav><Link href="https://www.linkedin.com/company/toplinksho" className="text-link" dir="ltr">LinkedIn <ArrowUpLeft size={16}/></Link></div><div className="footer-bottom"><span>© تاپ لینک شو. تمامی حقوق محفوظ است.</span><span dir="ltr">STRATEGY MEETS CREATIVITY.</span><Link href="/#top">بازگشت به بالا ↑</Link></div></Container></footer>}
