import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { mediaPath, projectPath, type ProjectDTO } from "@/lib/projects";
export function ProjectCards({ projects }: { projects: ProjectDTO[] }) {
  return <CardGrid label="نمونه‌کارهای مرتبط" mobileScroll>{projects.map(project => <FeatureCard key={project.id} title={project.title} description={project.summary} image={mediaPath(project.coverId)} imageAlt={project.coverAlt} href={projectPath(project.slug)} category={project.industry || "نمونه‌کار"} linkLabel="مشاهدهٔ پروژه" headingAs="h3" />)}</CardGrid>;
}
