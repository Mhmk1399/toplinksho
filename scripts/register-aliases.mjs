import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { existsSync, readFileSync, statSync } from "node:fs";
registerHooks({ resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
  const target = resolve(specifier.slice(2));
  if (existsSync(target) && statSync(target).isFile()) return nextResolve(pathToFileURL(target).href, context);
  for (const extension of [".ts", ".tsx", ".js"]) if (existsSync(target + extension)) return nextResolve(pathToFileURL(target + extension).href, context);
  return nextResolve(specifier, context);
}, load(url, context, nextLoad) {
  // Next bundles JSON imports; use the same data in Node-only SEO verification.
  if (["content", "theme"].some(directory => url.startsWith(pathToFileURL(resolve(directory)).href + "/")) && url.endsWith(".json")) {
    return { format: "module", shortCircuit: true, source: `export default JSON.parse(${JSON.stringify(readFileSync(new URL(url), "utf8"))});` };
  }
  return nextLoad(url, context);
} });
