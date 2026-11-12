import{spawn}from"node:child_process";import{chromium}from"@playwright/test";import{writeFile}from"node:fs/promises";
const base="http://127.0.0.1:3193",server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","3193","-H","127.0.0.1"],{stdio:"ignore"});
let browser;const results=[];
try{for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
for(const [name,css]of [["current",""],["no-hero-scenery",".hero-backdrop,.hero-light-orbits,.hero-flare{display:none!important}"],["simple-glass",".nav-shell,.mobile-menu,.footer-shell{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.feature-card :is(img,.card-visual-grid){mask-image:none!important;mix-blend-mode:normal!important}.hero-image{mask-image:none!important}"],["current-repeat",""]]){
 browser=await chromium.launch({channel:"chrome",headless:true});
 const context=await browser.newContext({viewport:{width:412,height:823},isMobile:true,hasTouch:true,serviceWorkers:"block",locale:"fa-IR"});
 const page=await context.newPage();const cdp=await context.newCDPSession(page);await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
 await page.addInitScript(()=>{window.__probe={long:[],lcp:0};new PerformanceObserver(list=>{window.__probe.long.push(...list.getEntries().map(e=>({t:e.startTime,d:e.duration})))}).observe({type:"longtask",buffered:true});new PerformanceObserver(list=>{window.__probe.lcp=list.getEntries().at(-1).startTime}).observe({type:"largest-contentful-paint",buffered:true});});
 if(css)await page.route(base+"/",async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace("</head>","<style>"+css+"</style></head>")});});
 await page.goto(base);await page.waitForTimeout(2500);
 const probe=await page.evaluate(()=>({...window.__probe,total:performance.now()}));results.push({name,...probe});console.log(JSON.stringify(results.at(-1)));await browser.close();browser=null;
}
await writeFile("artifacts/hero-render-probe.json",JSON.stringify({mode:"Chrome mobile, 4x applied CPU, local network, diagnostic CSS overrides only",results},null,2));
}finally{await browser?.close();server.kill("SIGTERM");}
