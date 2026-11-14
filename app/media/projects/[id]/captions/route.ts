import { serveProjectCaptions } from "@/lib/server/project-media";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) { return serveProjectCaptions((await params).id); }
