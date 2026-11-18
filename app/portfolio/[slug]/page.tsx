import { notFound } from "next/navigation";
import { publishedProject } from "@/lib/server/projects";
import { projectMetadata } from "@/lib/project-seo";
import { ProjectDetail } from "@/components/portfolio/ProjectDetail";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) { const project = await publishedProject((await params).slug); if (!project) notFound(); return projectMetadata(project); }
export default async function ProjectPage({ params }: Props) { const project = await publishedProject((await params).slug); if (!project) notFound(); return <ProjectDetail project={project} />; }
