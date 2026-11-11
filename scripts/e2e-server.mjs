import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "node:child_process";
import { once } from "node:events";

const mongo = await MongoMemoryServer.create({ binary: { version: process.env.MONGOMS_VERSION || '8.0.34' }, instance: { ip: "127.0.0.1" } });
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3196", "-H", "127.0.0.1"], {
  stdio: "inherit", env: { ...process.env, MONGODB_URI: mongo.getUri(), MONGODB_DB_NAME: "toplinksho_browser_test" },
});
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (server.exitCode === null) { server.kill("SIGTERM"); await once(server, "exit"); }
  await mongo.stop();
}
process.on("SIGTERM", () => { void stop(); });
process.on("SIGINT", () => { void stop(); });
server.on("exit", async code => { await stop(); process.exitCode = code || 0; });
