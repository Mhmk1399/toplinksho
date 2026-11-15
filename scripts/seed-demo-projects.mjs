import assert from "node:assert/strict";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import mongoose from "mongoose";
import sharp from "sharp";
import nextEnv from "@next/env";
import connect from "../lib/server/db.ts";
import Project from "../models/Project.ts";
import User from "../models/User.ts";
import { validateProject, projectIdPattern, mediaPath, projectPath } from "../lib/projects.ts";
import { servicePages } from "../lib/page-registry.ts";
import { localProjectAssets, localProjectAsset } from "../lib/project-assets.ts";
const projectServices = servicePages.filter(page => page.path !== "/services");

export async function demoProjectPlan() {
  const source = JSON.parse(await readFile(new URL("../content/demo-projects.fa.json", import.meta.url), "utf8"));
  const publicRoot = await realpath(resolve("public"));
  assert.equal(source.projects.length, 3);
  assert.equal(new Set(source.projects.map(project => project.id)).size, 3);
  const plans = [];
  for (const { id, ...raw } of source.projects) {
    assert(projectIdPattern.test(id));
    const { data, errors } = validateProject(raw, projectServices.map(service => service.path));
    assert.deepEqual(errors, {}, `Invalid demo project: ${raw.slug}`);
    assert.equal(data.status, "published");
    const assets = localProjectAssets(id);
    assert.equal(assets.length, 3);
    assert.equal(localProjectAsset(data.coverId)?.projectId, id);
    for (const item of data.media) {
      const asset = localProjectAsset(item.id);
      assert.equal(asset?.projectId, id);
      assert(asset.src.startsWith("/images/") && !asset.src.includes(".."));
      const file = await realpath(resolve("public", asset.src.slice(1)));
      assert(file.startsWith(publicRoot + sep));
      const [meta, info] = await Promise.all([sharp(file).metadata(), stat(file)]);
      assert.equal(meta.format, "png"); assert.equal(meta.hasAlpha, true);
      assert.equal(meta.width, asset.width); assert.equal(meta.height, asset.height); assert.equal(info.size, asset.bytes);
      assert.equal(item.duration, 0); assert.equal(item.posterId, "");
      assert(item.alt.trim());
      assert.equal(mediaPath(item.id, true), asset.src);
    }
    plans.push({ id, data });
  }
  return plans;
}

/** Explicitly invoked only. Never runs during app startup, build or deployment. */
export async function seedDemoProjects(ownerId) {
  const plans = await demoProjectPlan();
  await connect(); await Project.init();
  assert(await User.exists({ _id: ownerId, role: "admin", status: "active" }), "An existing active admin must own the demo projects.");
  // Check every collision before writing. Existing projects are never overwritten.
  for (const plan of plans) {
    const collision = await Project.findOne({ $or: [{ publicId: plan.id }, { slug: plan.data.slug }] }).select("publicId isDemo").lean();
    assert(!collision || (collision.publicId === plan.id && collision.isDemo), "A demo ID or slug is already used by another project.");
  }
  const created = [], skipped = [];
  for (const plan of plans) {
    if (await Project.exists({ publicId: plan.id })) { skipped.push(plan.data.slug); continue; }
    try {
      await Project.create({ ...plan.data, publicId: plan.id, isDemo: true, version: 1, publishedAt: new Date(), createdBy: ownerId, updatedBy: ownerId });
      created.push(plan.data.slug);
    } catch (error) {
      if (error?.code === 11000 && await Project.exists({ publicId: plan.id, isDemo: true })) skipped.push(plan.data.slug);
      else throw error;
    }
  }
  return { created, skipped, projects: plans.map(plan => ({ id: plan.id, path: projectPath(plan.data.slug), adminPath: `/admin/projects/${plan.id}`, imageSource: "public", images: 3, videos: 0 })) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  nextEnv.loadEnvConfig(process.cwd());
  try {
    if (process.argv.includes("--dry-run")) {
      const plans = await demoProjectPlan();
      console.log(JSON.stringify({ dryRun: true, projects: plans.map(plan => ({ id: plan.id, path: projectPath(plan.data.slug) })), images: 9, videos: 0 }, null, 2));
    } else {
      await connect();
      const where = { role: "admin", status: "active" };
      const owner = (process.env.ADMIN_EMAIL ? await User.findOne({ ...where, email: process.env.ADMIN_EMAIL.trim().toLowerCase() }).select("_id").lean() : null) || await User.findOne(where).sort({ createdAt: 1 }).select("_id").lean();
      assert(owner, "Sign in once to initialize an admin account before seeding projects.");
      const result = await seedDemoProjects(owner._id);
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(JSON.stringify({ success: false, errorType: error.name, message: error instanceof assert.AssertionError ? error.message.split("\n")[0] : "Demo projects could not be prepared; check the local database configuration." }));
    process.exitCode = 1;
  } finally { await mongoose.disconnect(); }
}
