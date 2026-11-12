import {spawn} from "node:child_process";
import {readFile,writeFile,mkdir,readdir,access} from "node:fs/promises";
import {join} from "node:path";
import {once} from "node:events";
import assert from "node:assert/strict";
const cache=process.env.LOCALAPPDATA&&join(process.env.LOCALAPPDATA,"npm-cache","_npx");
let cli;
if(cache)for(const name of await readdir(cache)){const candidate=join(cache,name,"node_modules/lighthouse/cli/index.js");try{await access(candidate);const packageInfo=JSON.parse(await readFile(join(cache,name,"node_modules/lighthouse/package.json"),"utf8"));if(packageInfo.version==="13.6.0"){cli=candidate;break;}}catch{}}
assert(cli,"Install the review tool in npm cache first: npx --yes lighthouse@13.6.0 --version");
const throttlingMethod = process.env.LIGHTHOUSE_THROTTLING === "devtools" ? "devtools" : "simulate";
const reportSuffix = throttlingMethod === "devtools" ? "-applied" : "";
const origin="http://127.0.0.1:3195";
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","3195","-H","127.0.0.1"],{stdio:["ignore","pipe","pipe"],env:{...process.env,SITE_INDEXABLE:"false"}});
let logs="";server.stdout.on("data",value=>logs+=value);server.stderr.on("data",value=>logs+=value);
const results=[];
try{
 let ready=false;for(let i=0;i<80;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}assert(ready,logs);
 await mkdir("artifacts",{recursive:true});
 for(const [name,path]of [["home","/"],["services","/services"],["booking","/services/development/web-development/booking-system-development"]].filter(([name])=>!process.env.LIGHTHOUSE_PAGE||process.env.LIGHTHOUSE_PAGE===name)){
  const file="artifacts/lighthouse-"+name+"-mobile"+reportSuffix+".json";
  const processReview=spawn(process.execPath,[cli,origin+path,...(process.env.LIGHTHOUSE_TRACE==="true"?["--save-assets"]:[]),"--chrome-flags=--headless=new --no-sandbox","--quiet","--throttling-method="+throttlingMethod,"--only-categories=performance,accessibility,best-practices,seo","--output=json","--output-path="+file],{stdio:["ignore","pipe","pipe"]});
  let output="";processReview.stderr.on("data",value=>output+=value);
  const [code]=await once(processReview,"exit");assert.equal(code,0,output);
  const report=JSON.parse(await readFile(file,"utf8"));
  const result={path,scores:Object.fromEntries(Object.entries(report.categories).map(([key,value])=>[key,Math.round(value.score*100)])),metrics:Object.fromEntries(["first-contentful-paint","largest-contentful-paint","total-blocking-time","cumulative-layout-shift"].map(key=>[key,{value:report.audits[key].numericValue,display:report.audits[key].displayValue}])),failedAudits:Object.entries(report.audits).filter(([,audit])=>audit.score!==null&&audit.score<1&&["binary","numeric"].includes(audit.scoreDisplayMode)).map(([id,audit])=>({id,title:audit.title,score:audit.score,details:audit.displayValue})),file};
  results.push(result);console.log(JSON.stringify(result));
 }
 await writeFile("artifacts/lighthouse-summary"+reportSuffix+".json",JSON.stringify({lighthouse:"13.6.0",mode:"mobile "+throttlingMethod+" throttling, local production build",indexing:"Preview intentionally remains noindex; is-crawlable is expected to fail.",results},null,2));
}finally{server.kill("SIGTERM");}

