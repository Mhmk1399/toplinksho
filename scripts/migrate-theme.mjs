import {readFile,writeFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import {normalizeColor} from "./theme-colors.mjs";
async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(x=>x.isDirectory()?walk(join(dir,x.name)):[join(dir,x.name)]))).flat();}
const files=[...(await walk("app")),...(await walk("components")),"public/offline.html"];
let changed=0;
for(const path of files.filter(path=>/\.(tsx|css|html)$/.test(path)&&!["app/layout.tsx","app/manifest.ts"].includes(path.replaceAll("\\","/")))){
 const old=await readFile(path,"utf8");
 const next=old.replace(/((?:color|background(?:-color)?|border-color|fill|stroke)\s*:\s*)(white|black)\b/g,(_,property,color)=>property+"var(--paint-"+(color==="white"?"ffffff":"000000")+")").replace(/#[a-f\d]{3,8}\b/gi,raw=>"var(--paint-"+normalizeColor(raw)+")").replace(/rgba?\([^()]*\)/g,raw=>{const hex=normalizeColor(raw);return hex?"var(--paint-"+hex+")":raw;});
 if(next!==old){await writeFile(path,next);changed++;}
}
console.log("Centralized paint references in "+changed+" files.");
