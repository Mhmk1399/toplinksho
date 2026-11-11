import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const port = 3198;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server.stdout.on('data', data => logs += data);
server.stderr.on('data', data => logs += data);
const base = `http://127.0.0.1:${port}`;
const results = [];
try {
  let ready = false;
  for(let i=0;i<60;i++) {
    try { if((await fetch(base)).ok) {ready=true;break;} } catch {}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert(ready, `Server did not start: ${logs}`);
  const routes = ['/', '/about-us', '/services', '/contact', '/services/web-design','/services/social-media','/services/branding','/services/google-ads','/services/campaigns', '/services/graphic-design', '/services/content-production', '/services/seo', '/services/online-advertising'];
  for(const route of routes) {
    const response = await fetch(base + route);
    const html = await response.text();
    assert.equal(response.status, 200, route);
    assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${route}: H1`);
    assert.match(html, /lang="fa"/);
    assert.match(html, /dir="rtl"/);
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.match(html, /id="main-content"/);
    assert(!/href="#"/.test(html), `${route}: placeholder link`);
    assert(!html.includes('250+') && !html.includes('98%') && !html.includes('4.7x'), `${route}: unverified metrics`);
    assert(!/سعید میرصادق|علی پیک|محمدرضا انصاری|حسین امین فرشچییان/.test(html), `${route}: conflicting team names`);
    assert.match(html, /images\/logo.webp/);
    assert.match(html, /hero-grid/);
    if(route==='/') {
      assert.match(html,/tel:\+989122191549/);
      assert.match(html,/mailto:Info@TopLinkSho.com/);
      for(const id of ['top','services','about','portfolio','blog','contact']) assert(html.includes(`id="${id}"`),`Missing ${id}`);
    }
    results.push({route,status:response.status,h1:1,persianRTL:true,noindex:true,noPlaceholderLinks:true});
  }
  const missing=await fetch(base+'/services/unknown-service');
  assert.equal(missing.status,404);
  results.push({route:'/services/unknown-service',status:404});
  for(const asset of ['/images/logo.webp','/images/hero-home.webp','/images/hero-about.webp','/images/hero-services.webp','/images/hero-contact.webp','/images/portfolio-aryan.webp','/images/portfolio-card.webp','/images/portfolio-creative.webp','/images/portfolio-posters.webp','/fonts/vazirmatn-arabic.woff2','/fonts/vazirmatn-latin.woff2']) assert.equal((await fetch(base+asset)).status,200,asset);
  assert.equal((await fetch(base+'/admin',{redirect:'manual'})).status,307);
  await mkdir('artifacts',{recursive:true});
  await writeFile('artifacts/smoke-results.json',JSON.stringify({passed:true,results,limits:'HTTP and server-rendered HTML checks only. Browser visual, mobile interaction, performance and accessibility audits not run.'},null,2));
  console.log(JSON.stringify(results,null,2));
} finally { server.kill('SIGTERM'); }
