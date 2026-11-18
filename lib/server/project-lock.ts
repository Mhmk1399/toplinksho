import "server-only";
import Project from "@/models/Project";
import { ProjectError } from "@/lib/server/project-errors";
export async function acquireProjectLease(projectId: string) {
  const lease = new Date(Date.now() + 310000);
  const row = await Project.findOneAndUpdate({ publicId: projectId, $or: [{ uploadLockUntil: null }, { uploadLockUntil: { $lt: new Date() } }] }, { $set: { uploadLockUntil: lease } }, { timestamps: false });
  if (!row) throw new ProjectError("عملیات دیگری برای این پروژه در حال انجام است. کمی بعد دوباره تلاش کنید.", 423);
  return lease;
}
export async function releaseProjectLease(projectId: string, lease: Date) {
  await Project.updateOne({ publicId: projectId, uploadLockUntil: lease }, { $set: { uploadLockUntil: null } }, { timestamps: false }).catch(() => {});
}
