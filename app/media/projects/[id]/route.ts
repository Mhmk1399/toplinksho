import { serveProjectAsset } from "@/lib/server/project-media";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { return serveProjectAsset(request, (await params).id); }
export const HEAD = GET;
