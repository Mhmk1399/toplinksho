import {spawn} from "node:child_process";
import {writeFile,mkdir} from "node:fs/promises";
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const origin="http://127.0.0.1:3199";
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","3199","-H","127.0.0.1"],{stdio:["ignore","pipe","pipe"],env:{...process.env,SITE_INDEXABLE:"false"}});
let logs="";server.stdout.on("data",value=>logs+=value);server.stderr.on("data",value=>logs+=value);
let browser;
const screenshots=[],measurements=[],errors=[];
try{
 let ready=false;for(let i=0;i<80;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}
 assert(ready,logs);await mkdir("artifacts",{recursive:true});
 browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||"chrome",headless:true});
 const context=await browser.newContext({locale:"fa-IR",reducedMotion:"reduce",serviceWorkers:"block"});
 const page=await context.newPage();page.on("pageerror",error=>errors.push(error.message));
 async function shot(name,path,width,height=1000){
  await page.setViewportSize({width,height});await page.goto(origin+path);await page.evaluate(()=>document.fonts.ready);
  const heightTotal=await page.evaluate(()=>document.documentElement.scrollHeight); for(let y=0;y<heightTotal;y+=900){await page.evaluate(value=>window.scrollTo(0,value),y);await page.waitForTimeout(70);} await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(100);
  const file="artifacts/"+name+".png";await page.screenshot({path:file,fullPage:true});screenshots.push(file);
  measurements.push({path,width,...await page.evaluate(()=>({pageHeight:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth,background:getComputedStyle(document.body).backgroundColor,blur:getComputedStyle(document.querySelector(".home-glass")||document.body).backdropFilter}))});
 }
 await shot("home-graphic-desktop","/",1440);
 await shot("home-graphic-mobile","/",390,844);
 await shot("services-directory-desktop","/services",1440);
 await page.locator(".service-disclosure-trigger").click();
 let report=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();assert.deepEqual(report.violations,[],"Desktop menu accessibility");
 await page.screenshot({path:"artifacts/services-menu-desktop.png"});screenshots.push("artifacts/services-menu-desktop.png");
 await shot("service-booking-desktop","/services/development/web-development/booking-system-development",1440);
 await shot("services-directory-mobile","/services",390,844);
 await page.getByRole("button",{name:"باز کردن منو",exact:true}).click();
 const menu=page.getByRole("dialog",{name:"منوی اصلی"});
 assert.equal(await menu.locator(".mobile-services").getAttribute("open"), "");
 await menu.locator(".mobile-services > details").first().locator("summary").click();
 report=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();assert.deepEqual(report.violations,[],"Mobile menu accessibility");
 await page.screenshot({path:"artifacts/services-menu-mobile.png"});screenshots.push("artifacts/services-menu-mobile.png");
 await menu.locator(".brand").click();assert.equal(await menu.isVisible(),false,"Logo closes mobile dialog");
 await shot("service-booking-mobile","/services/development/web-development/booking-system-development",320,900);
 await shot("pricing-mobile","/pricing",390,844);
 await shot("service-design-tablet","/services/design/ui-designs/design-systems",1024,900);
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin+"/services/development");await page.evaluate(()=>document.fonts.ready);
 const referenceCard=page.locator("#catalog .feature-card").filter({has:page.getByRole("heading",{name:"توسعه اپلیکیشن",exact:true})});
 await referenceCard.scrollIntoViewIfNeeded();await page.waitForTimeout(150);await referenceCard.screenshot({path:"artifacts/reference-card-desktop.png"});screenshots.push("artifacts/reference-card-desktop.png");
 await page.setViewportSize({width:390,height:844});await page.goto(origin+"/services/development");
 const mobileCard=page.locator("#catalog .feature-card").filter({has:page.getByRole("heading",{name:"توسعه اپلیکیشن",exact:true})});
 await mobileCard.scrollIntoViewIfNeeded();await page.waitForTimeout(150);await mobileCard.screenshot({path:"artifacts/reference-card-mobile.png"});screenshots.push("artifacts/reference-card-mobile.png");
 assert(measurements.every(item=>!item.overflow),"Horizontal overflow");assert.deepEqual(errors,[]);
 await writeFile("artifacts/site-visual-review.json",JSON.stringify({passed:true,screenshots,measurements,pageErrors:errors,openMenuA11yViolations:0,limits:"Chrome screenshots and automated checks; physical low-end devices were not profiled."},null,2));
 console.log(JSON.stringify({passed:true,screenshots:screenshots.length,measurements}));
 await context.close();
}finally{await browser?.close();server.kill("SIGTERM");}

