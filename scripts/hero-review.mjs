import {spawn} from "node:child_process";
import {writeFile,mkdir} from "node:fs/promises";
import {gzipSync} from "node:zlib";
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const origin="http://127.0.0.1:3194";
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","3194","-H","127.0.0.1"],{stdio:["ignore","pipe","pipe"],env:{...process.env,SITE_INDEXABLE:"false"}});
let logs="",browser;const results=[],errors=[];
server.stdout.on("data",data=>logs+=data);server.stderr.on("data",data=>logs+=data);
try{
 let ready=false;for(let i=0;i<80;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}assert(ready,logs);
 await mkdir("artifacts",{recursive:true});browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||"chrome",headless:true});
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},locale:"fa-IR",isMobile:width<768,hasTouch:width<768,reducedMotion:"reduce",serviceWorkers:"block"});
  const page=await context.newPage();page.on("pageerror",error=>errors.push(error.message));
  for(const [name,path]of [["home","/"],["about","/about-us"],["services","/services"],["contact","/contact"]]){
   await page.goto(origin+path);await page.evaluate(()=>document.fonts.ready);await page.locator(".hero-image").evaluate(image=>image.decode());
   const scene=page.locator(".hero-stage");const file="artifacts/hero-neon-"+name+"-"+width+".png";await scene.screenshot({path:file});
   const markup=await page.locator(".hero-backdrop").evaluate(node=>node.outerHTML);
   const geometry=await page.evaluate(()=>{
    const hero=document.querySelector(".hero-stage"),scenery=document.querySelector(".hero-backdrop"),art=document.querySelector(".hero-art"),copy=document.querySelector(".hero-copy");
    const action=document.querySelector(".hero-actions a"),rect=action.getBoundingClientRect();
    const atPoint=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
    return {overflow:document.documentElement.scrollWidth>innerWidth,heroHeight:hero.getBoundingClientRect().height,scenery:scenery.getBoundingClientRect().toJSON(),copyBottom:copy.getBoundingClientRect().bottom,artTop:art.getBoundingClientRect().top,buttonClear:atPoint?.closest("a")===action,sceneElements:scenery.querySelectorAll("*").length};
   });
   assert(!geometry.overflow,path+" overflow");assert(geometry.buttonClear,path+" CTA occluded");if(width<768)assert(geometry.artTop>=geometry.copyBottom-1);
   const report=await new AxeBuilder({page}).include(".hero-stage").withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();assert.deepEqual(report.violations,[],path+" hero accessibility");
   results.push({path,width,file,...geometry,backgroundGzipBytes:gzipSync(markup).length});
  }
  await context.close();
 }
 const weak=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:"no-preference",serviceWorkers:"block"});
 await weak.addInitScript(()=>{Object.defineProperty(navigator,"hardwareConcurrency",{get:()=>2});Object.defineProperty(navigator,"deviceMemory",{get:()=>2});});
 const page=await weak.newPage();const cdp=await weak.newCDPSession(page);await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});await page.goto(origin);await page.waitForFunction(()=>document.documentElement.dataset.performance==="reduced");
 const reduced=await page.evaluate(()=>({motion:getComputedStyle(document.querySelector(".hero-visual")).animationName,flareShadow:getComputedStyle(document.querySelector(".hero-flare")).boxShadow,scroll:document.documentElement.dataset.scrollMode}));
 assert.equal(reduced.motion,"none");assert.equal(reduced.flareShadow,"none");assert.equal(reduced.scroll,"native");await weak.close();assert.deepEqual(errors,[]);
 await writeFile("artifacts/hero-design-review.json",JSON.stringify({passed:true,results,reduced,pageErrors:errors,limits:"Local Chrome and simulated constrained device checks; no physical-device benchmark."},null,2));
 console.log(JSON.stringify({passed:true,screenshots:results.length,maxBackgroundGzipBytes:Math.max(...results.map(x=>x.backgroundGzipBytes)),reduced}));
}finally{await browser?.close();server.kill("SIGTERM");}

