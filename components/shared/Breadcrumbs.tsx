import Link from "next/link";
import { ChevronLeft, House } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { breadcrumbItems } from "@/lib/page-registry";

export function Breadcrumbs({ path }: { path: string }) {
 const items = breadcrumbItems(path);
 return <div className="page-breadcrumbs"><Container>
  <div className="breadcrumb-shell">
   <nav aria-label="مسیر صفحه" className="breadcrumb-scroll" tabIndex={0} data-lenis-prevent>
    <ol>{items.map((item,index) => <li key={item.path}>
     {index > 0 && <ChevronLeft size={13} aria-hidden="true" />}
     {index === items.length-1 ? <span aria-current="page">{item.title}</span> :
      <Link href={item.path}>{index === 0 && <House size={14} aria-hidden="true" />}{item.title}</Link>}
    </li>)}</ol>
   </nav>
   </div>
 </Container></div>;
}

