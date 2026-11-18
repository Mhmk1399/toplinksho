import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import connect from "@/lib/server/db";
import User, { type UserRecord } from "@/models/User";
import AdminSession from "@/models/AdminSession";

const derive = promisify(scrypt);
export const sessionCookie = "toplinksho_admin";
export const sessionSeconds = 8 * 60 * 60;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
type Principal = { id: string; email: string; name: string; credentialVersion: string };

export function adminConfigured() { return !!process.env.MONGODB_URI; }
function environmentAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD_HASH;
  return email && /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(password || "") ? { email, password: password! } : null;
}
function fingerprint(user: UserRecord) {
  return hash(`${user.email}:${user.password}:${user.role}:${user.status}:${user.sessionVersion}`);
}
function activeAdmin(user: UserRecord) {
  if (user.role !== "admin" || user.status !== "active") return false;
  if (!user.managedByEnvironment) return true;
  const env = environmentAdmin();
  return !!env && env.email === user.email && env.password === user.password;
}
async function bootstrapAdmin() {
  const env = environmentAdmin();
  if (!env) return;
  await User.init();
  // Environment credentials can only manage the account created by this bootstrap.
  // An existing account never gains admin permissions from a matching environment email.
  const existing = await User.findOne({ email: env.email }).select("+password +managedByEnvironment");
  if (!existing) {
    try { await User.create({ name: "مدیریت تاپ لینک شو", ...env, role: "admin", managedByEnvironment: true }); }
    catch (error) { if ((error as { code?: number }).code !== 11000) throw error; }
  } else if (existing.managedByEnvironment && existing.password !== env.password) {
    await User.updateOne({ _id: existing._id, managedByEnvironment: true, password: existing.password }, { $set: { password: env.password }, $inc: { sessionVersion: 1 } }, { runValidators: true });
  }
}
export async function verifyCredentials(email: string, password: string): Promise<Principal | null> {
  await connect();
  await bootstrapAdmin();
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password +managedByEnvironment");
  const [, salt = "0".repeat(32), expected = "0".repeat(128)] = (user?.password || "").split(":");
  const actual = await derive(password, salt, 64) as Buffer;
  const target = Buffer.from(expected, "hex");
  if (target.length !== actual.length || !timingSafeEqual(actual, target) || !user || !activeAdmin(user)) return null;
  await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() }, $inc: { loginCount: 1 } });
  return { id: user._id.toString(), email: user.email, name: user.name, credentialVersion: fingerprint(user) };
}
export async function createSession(admin: Principal) {
  await connect();
  await AdminSession.init();
  const token = randomBytes(32).toString("hex");
  await AdminSession.create({ user: admin.id, tokenHash: hash(token), credentialVersion: admin.credentialVersion, expiresAt: new Date(Date.now() + sessionSeconds * 1000) });
  return token;
}
export async function revokeSession(token: string) {
  await connect();
  await AdminSession.deleteOne({ tokenHash: hash(token) });
}
export async function getAdminSession() {
  if (!adminConfigured()) return null;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  await connect();
  const session = await AdminSession.findOne({ tokenHash: hash(token), expiresAt: { $gt: new Date() } }).select("+credentialVersion").lean();
  if (!session) return null;
  const user = await User.findById(session.user).select("+password +managedByEnvironment");
  if (!user || !activeAdmin(user) || session.credentialVersion !== fingerprint(user)) return null;
  return { id: user._id.toString(), email: user.email, name: user.name };
}
export async function requireAdmin(returnTo = "/admin") {
  const session = await getAdminSession();
  if (!session) redirect(returnTo === "/admin" ? "/admin/login" : `/admin/login?next=${encodeURIComponent(returnTo)}`);
  return session;
}
export const sessionOptions = { httpOnly: true, sameSite: "lax" as const, path: "/", secure: process.env.NODE_ENV === "production", maxAge: sessionSeconds };
