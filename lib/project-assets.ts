import registry from "@/content/project-assets.json";
import type { MediaAsset } from "@/lib/projects";

// Only registered public files are accepted; API callers cannot add arbitrary
// URLs, filesystem paths or another project's local assets.
const assets = new Map(registry.assets.map(asset => [asset.id, asset]));
export const localProjectAsset = (id: string) => assets.get(id);
export function localProjectAssets(projectId: string): MediaAsset[] {
  return registry.assets.filter(asset => asset.projectId === projectId).map(({ src: _src, projectId: _projectId, ...asset }) => {
    void _src; void _projectId;
    return { ...asset, kind: "image", source: "public" };
  });
}
