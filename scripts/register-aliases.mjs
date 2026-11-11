import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
registerHooks({ resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
  const target = resolve(specifier.slice(2));
  for (const extension of [".ts", ".tsx", ".js"]) if (existsSync(target + extension)) return nextResolve(pathToFileURL(target + extension).href, context);
  return nextResolve(specifier, context);
} });
