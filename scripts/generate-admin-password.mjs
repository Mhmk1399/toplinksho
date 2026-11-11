import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';

if (!process.stdin.isTTY) {
  console.error('Run this command in an interactive terminal. Passwords are never accepted as command-line arguments.');
  process.exit(1);
}
let visible = false;
const output = new Writable({ write(chunk, encoding, callback) { if (visible) process.stdout.write(chunk); callback(); } });
const terminal = createInterface({ input: process.stdin, output, terminal: true });
function ask(prompt) {
  visible = true;
  const answer = new Promise(resolve => terminal.question(prompt, value => { process.stdout.write('\n'); resolve(value); }));
  visible = false;
  return answer;
}
try {
  const password = await ask('Admin password (at least 12 characters; input hidden): ');
  const confirm = await ask('Repeat password: ');
  if (password.length < 12 || password.length > 256 || password !== confirm) throw new Error('Passwords must match and contain 12–256 characters.');
  const salt = randomBytes(16).toString('hex');
  const derived = await promisify(scrypt)(password, salt, 64);
  console.log(`\nSet ADMIN_PASSWORD_HASH in .env.local to:\nscrypt:${salt}:${derived.toString('hex')}\n`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { terminal.close(); }
