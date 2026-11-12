/* Generated with a content revision before each production build. */
const PREFIX = "toplinksho-";
const VERSION = "65a840f638a7c291";
const SHELL = PREFIX + "shell-" + VERSION;
const PAGES = PREFIX + "pages-" + VERSION;
const ASSETS = PREFIX + "assets-" + VERSION;
const PUBLIC_ROUTES = new Set(["/","/about-us","/contact","/pricing","/blog","/live-case-studies","/live-case-studies/success-van-hire","/live-case-studies/real-estate","/faq","/services","/services/development","/services/design","/services/growth","/services/development/web-development","/services/development/web-development/service-business-websites","/services/development/web-development/custom-web-applications","/services/development/web-development/booking-system-development","/services/development/web-development/api-system-integrations","/services/development/web-development/website-performance-optimization","/services/development/app-development","/services/development/app-development/mobile-app-development","/services/development/app-development/app-modernization","/services/development/e-commerce-development","/services/development/e-commerce-development/custom-e-commerce-development","/services/development/e-commerce-development/e-commerce-modernization-migration","/services/development/e-commerce-development/e-commerce-performance-checkout-optimization","/services/development/ai-automation","/services/development/ai-automation/ai-workflow-automation","/services/development/ai-automation/ai-assistants-knowledge-systems","/services/development/ai-automation/ai-document-processing","/services/design/web-design","/services/design/web-design/business-websites","/services/design/web-design/landing-page-design","/services/design/web-design/website-redesign","/services/design/web-design/nextjs-websites","/services/design/ui-designs","/services/design/ui-designs/web-app-ui-ux-design","/services/design/ui-designs/mobile-app-ui-ux-design","/services/design/ui-designs/ux-audit","/services/design/ui-designs/design-systems","/services/design/brand-identity","/services/design/brand-identity/brand-strategy","/services/design/brand-identity/logo-and-visual-identity","/services/design/brand-identity/brand-guidelines","/services/growth/seo","/services/growth/seo/technical-seo","/services/growth/seo/seo-content-strategy","/services/growth/seo/local-seo","/services/growth/social-media-marketing","/services/growth/social-media-marketing/social-media-strategy","/services/growth/social-media-marketing/social-media-content-strategy","/services/growth/social-media-marketing/social-media-campaign-strategy","/services/growth/security","/services/growth/security/website-security-audit","/services/growth/security/website-protection","/services/growth/security/security-monitoring","/services/google-ads","/services/campaigns","/services/graphic-design","/services/content-production","/services/online-advertising"]);
const CORE = ["/theme.css", "/offline.html", "/images/logo.webp", "/icons/icon-192.png", "/icons/icon-512.png"];
self.addEventListener("install", event => {
  // An update waits for existing tabs to close; never interrupt an unsaved form.
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(CORE)));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && ![SHELL, PAGES, ASSETS].includes(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});
async function store(cacheName, request, response, max) {
  if (!response.ok || response.type === "opaque" || /no-store|private/i.test(response.headers.get("cache-control") || "") || response.headers.has("set-cookie")) return;
  const size = Number(response.headers.get("content-length") || 0);
  if (size > 3 * 1024 * 1024) return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
    const keys = await cache.keys();
    for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
  } catch { /* Storage quota/private mode must not break normal navigation. */ }
}
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  // Never cache personal data, API mutations, private pages, RSC payloads or cross-origin requests.
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/") || request.headers.has("rsc") || url.searchParams.has("_rsc") || request.headers.has("next-router-prefetch") || request.headers.has("range")) return;
  if (request.mode === "navigate") {
    if (!PUBLIC_ROUTES.has(url.pathname) || url.search) return;
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get("content-type")?.includes("text/html")) event.waitUntil(store(PAGES, url.href, response.clone(), 20));
        return response;
      } catch {
        return (await caches.open(PAGES)).match(url.href, { ignoreVary: true }).then(async cached => cached || (await caches.open(SHELL)).match("/offline.html"));
      }
    })());
    return;
  }
  const cacheable = CORE.includes(url.pathname) || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/") || url.pathname === "/_next/image";
  if (!cacheable) return;
  event.respondWith((async () => {
    const cache = await caches.open(ASSETS);
    const cached = await cache.match(request) || await (await caches.open(SHELL)).match(request);
    if (cached) return cached;
    const response = await fetch(request);
    event.waitUntil(store(ASSETS, request, response.clone(), 100));
    return response;
  })());
});
