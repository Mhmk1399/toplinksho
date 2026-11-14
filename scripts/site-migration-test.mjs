import assert from "node:assert/strict";
import {readFile,writeFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import {paint,baseline} from "./theme-colors.mjs";
import {publicEntries,servicePages,legacyRedirects,breadcrumbItems} from "../lib/page-registry.ts";
const original=JSON.parse(await readFile("content/source/cheetahnova-site.en.json","utf8"));
const services=JSON.parse(await readFile("content/services.fa.json","utf8"));
const nav=JSON.parse(await readFile("content/navigation.fa.json","utf8"));
const theme=JSON.parse(await readFile("theme/theme.json","utf8"));
assert.deepEqual(services.pages.map(page=>page.path).sort(),original.pages.filter(page=>page.route.startsWith("/services")).map(page=>page.route).sort());
const urls=new Set(publicEntries.map(page=>page.path));assert.equal(urls.size,publicEntries.length);
for(const item of nav.items)assert(urls.has(item.href),item.href);
for(const group of nav.groups){assert(urls.has(group.path));for(const item of group.items)assert(urls.has(item.path));}
for(const page of servicePages){assert(urls.has(page.parent));assert.equal(breadcrumbItems(page.path).at(-1).path,page.path);}
for(const target of Object.values(legacyRedirects))assert(urls.has(target));
const generated=await readFile("theme/generated.css","utf8");
async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(x=>x.isDirectory()?walk(join(dir,x.name)):[join(dir,x.name)]))).flat();}
const files=[...(await walk("app")),...(await walk("components")),"public/offline.html"];
let paints=0, sharedSelectConsumers=0;
for(const file of files.filter(path=>/\.(tsx|css|html)$/.test(path))){
 const source=await readFile(file,"utf8");
 assert(!/#[a-f\d]{3,8}\b/i.test(source),"Raw paint in "+file);
 if(file.endsWith(".tsx")){
  const canonicalSelect=file.replaceAll("\\","/")==="components/ui/Select.tsx";
  assert(canonicalSelect || !/<(?:select|option|optgroup)\b/.test(source),"Use the shared data-driven Select in "+file);
  sharedSelectConsumers += [...source.matchAll(/<Select\b/g)].length;
 }
 for(const match of source.matchAll(/var\((--paint-[a-f\d]+)\)/g)){assert(generated.includes(match[1]+":"),file+" missing "+match[1]);paints++;}
}
for(const hex of ["343db5","c2a1ff","f51b7e","111422","ffffff1a"])assert.equal(paint(hex,baseline),"#"+hex);
assert.notEqual(paint("c2a1ff",{...theme.colors,accent:"#ffbf47"}),paint("c2a1ff",theme.colors));
assert.notEqual(paint("080a16",{...theme.colors,background:"#162030"}),paint("080a16",theme.colors));
await writeFile("artifacts/site-migration-results.json",JSON.stringify({passed:true,sourceServiceRoutes:services.pages.length,publicRoutes:urls.size,primaryNavigation:nav.items.length,serviceGroups:nav.groups.length,verifiedPaintUses:paints,sharedSelectConsumers,theme:"theme/theme.json",sourceCodeExecuted:false},null,2));
console.log("PASS migration: "+services.pages.length+" source service routes, "+urls.size+" public routes, shared theme and navigation.");
