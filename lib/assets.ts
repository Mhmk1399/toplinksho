const defaultAssetBase = "https://storadge.arziplus.com/toplinksho";
const configured = new URL(process.env.NEXT_PUBLIC_ASSET_BASE_URL?.trim() || defaultAssetBase);
if (configured.protocol !== "https:" || configured.username || configured.password || configured.search || configured.hash) {
  throw new Error("NEXT_PUBLIC_ASSET_BASE_URL must be an HTTPS public asset prefix without credentials, query or fragment");
}

export const assetBaseUrl = configured.href.replace(/\/+$/, "");

/** Existing content keeps logical paths; public image objects use flat bucket keys. */
export function assetUrl(src: string): string {
  if (!/^\/(?:images|social|socials)\//.test(src)) return src;
  const suffixAt = src.search(/[?#]/);
  const pathname = suffixAt < 0 ? src : src.slice(0, suffixAt);
  const suffix = suffixAt < 0 ? "" : src.slice(suffixAt);
  const filename = pathname.slice(pathname.lastIndexOf("/") + 1);
  if (!filename) return src;
  let name = filename;
  try { name = decodeURIComponent(filename); } catch { /* Encode malformed percent signs as a literal filename. */ }
  return `${assetBaseUrl}/${encodeURIComponent(name)}${suffix}`;
}
