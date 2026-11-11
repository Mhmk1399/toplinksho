import assert from 'node:assert/strict';
import { randomBytes, randomUUID, scryptSync, createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
const { MongoClient } = mongoose.mongo;
import { SMTPServer } from 'smtp-server';

const directory = await mkdtemp(join(tmpdir(), 'toplinksho-backend-'));
const mongo = await MongoMemoryServer.create({ binary: { version: process.env.MONGOMS_VERSION || '8.0.34' }, instance: { ip: '127.0.0.1' } });
const mongoClient = new MongoClient(mongo.getUri());
await mongoClient.connect();
const databaseName = 'toplinksho_backend_test';
const keyPath = join(directory, 'key.pem');
const certPath = join(directory, 'cert.pem');
const port = 3197;
const base = `http://127.0.0.1:${port}`;
const password = randomBytes(24).toString('hex');
const salt = randomBytes(16).toString('hex');
const passwordHash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
const smtpPassword = randomBytes(24).toString('hex');
const checks = [];
const messages = [];
let rejectMail = false;
let server;
let db = mongoClient.db(databaseName);
const leadBy = async filter => { const lead = await db.collection('leads').findOne(filter); return lead && { ...lead, id: lead.publicId, email_status: lead.notification.status }; };
let smtp;
let logs = '';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const record = name => { checks.push(name); console.log(`PASS ${name}`); };

async function start(extra = {}) {
  logs = '';
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, APP_URL: base, ADMIN_EMAIL: 'admin@toplinksho.invalid', ADMIN_PASSWORD_HASH: passwordHash, MONGODB_URI: mongo.getUri(), MONGODB_DB_NAME: databaseName, SITE_INDEXABLE: 'false', TRUST_PROXY: 'true', SMTP_HOST: '127.0.0.1', SMTP_PORT: String(smtp.server.address().port), SMTP_SECURE: 'true', SMTP_USER: 'smtp@toplinksho.invalid', SMTP_PASS: smtpPassword, SMTP_FROM: 'sender@toplinksho.invalid', LEADS_EMAIL: 'inbox@toplinksho.invalid', NODE_EXTRA_CA_CERTS: certPath, ...extra },
  });
  server.stdout.on('data', data => logs += data);
  server.stderr.on('data', data => logs += data);
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${logs}`);
    try { if ((await fetch(base)).ok) return; } catch {}
    await pause(200);
  }
  throw new Error(`Server did not start: ${logs}`);
}

async function stop() {
  if (!server || server.exitCode !== null) return;
  const exited = once(server, 'exit');
  server.kill('SIGTERM');
  await exited;
}

async function call(path, { method = 'POST', body, cookie, ip = '192.0.2.10', origin = base } = {}) {
  const headers = { Origin: origin, 'x-forwarded-for': ip };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (cookie) headers.Cookie = cookie;
  return fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
}

async function waitFor(check, label) {
  for (let i = 0; i < 80; i++) { if (await check()) return; await pause(100); }
  throw new Error(`Timed out: ${label}`);
}

const body = (overrides = {}) => ({ name: 'بررسی آزمایشی کسب‌وکار', phone: '۰۹۱۲۱۲۳۴۵۶۷', subject: 'طراحی سایت', description: 'درخواست آزمایشی محلی؛ هیچ پیام واقعی ارسال نمی‌شود.', website: 'https://example.invalid', company: '', submissionId: randomUUID(), ...overrides });
function messageText(message) {
  const boundary = message.indexOf('\r\n\r\n');
  const headers = message.slice(0, boundary);
  const content = message.slice(boundary + 4);
  if (/Content-Transfer-Encoding:\s*base64/i.test(headers)) return Buffer.from(content.replace(/\s/g, ''), 'base64').toString('utf8');
  return content.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

try {
  const openssl = process.env.OPENSSL_BIN || (process.platform === 'win32' && existsSync('C:/Program Files/Git/usr/bin/openssl.exe') ? 'C:/Program Files/Git/usr/bin/openssl.exe' : 'openssl');
  execFileSync(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath, '-out', certPath, '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1', '-days', '1'], { stdio: 'ignore' });
  smtp = new SMTPServer({
    secure: true, key: await readFile(keyPath), cert: await readFile(certPath), logger: false,
    onAuth(auth, session, done) { done(auth.username === 'smtp@toplinksho.invalid' && auth.password === smtpPassword ? null : new Error('Invalid test credentials'), { user: 'test' }); },
    onData(stream, session, done) {
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => {
        if (rejectMail) { const error = new Error('Temporary test rejection'); error.responseCode = 451; done(error); }
        else { messages.push(Buffer.concat(chunks).toString('utf8')); done(); }
      });
    },
  });
  await new Promise(resolve => smtp.listen(0, '127.0.0.1', resolve));
  await start();

  assert.equal((await fetch(base + '/admin', { redirect: 'manual' })).status, 307);
  assert.equal((await call('/api/admin/consultations/search', { body: { query: '', status: '', page: 1 } })).status, 401);
  assert.equal((await call(`/api/admin/consultations/${randomUUID()}`, { method: 'PATCH', body: { status: 'completed', notes: '', version: 1 } })).status, 401);
  record('private pages and endpoints reject unauthenticated access');

  assert.equal((await call('/api/consultations', { body: body(), origin: 'https://attacker.invalid' })).status, 403);
  const invalid = await call('/api/consultations', { body: body({ name: '', phone: 'abc', subject: 'unknown' }) });
  assert.equal(invalid.status, 422);
  assert.deepEqual(Object.keys((await invalid.json()).errors).sort(), ['name', 'phone', 'subject']);
  assert.equal((await call('/api/consultations', { body: body({ company: 'spam' }) })).status, 422);
  assert.equal((await call('/api/consultations', { body: body({ description: 'x'.repeat(17000) }) })).status, 400);
  record('same-origin, server validation, honeypot and body-size limits');

  assert.equal((await call('/api/admin/login', { body: { email: 'admin@toplinksho.invalid', password: 'incorrect' } })).status, 401);
  const login = await call('/api/admin/login', { body: { email: 'admin@toplinksho.invalid', password } });
  assert.equal(login.status, 200);
  const setCookie = login.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /SameSite=lax/i); assert.match(setCookie, /Secure/i);
  let cookie = setCookie.split(';')[0];
  const token = cookie.split('=')[1];
  const storedSession = await db.collection('adminsessions').findOne({});
  const storedUser = await db.collection('users').findOne({ email: 'admin@toplinksho.invalid' });
  assert.equal(storedUser.password, passwordHash); assert.equal(storedUser.role, 'admin'); assert.equal(storedUser.loginCount, 1);
  assert.notEqual(storedUser.password, password);
  await mongoose.connect(mongo.getUri(), { dbName: databaseName });
  const { default: User } = await import('../models/User.ts');
  const visibleUser = await User.findOne({ email: storedUser.email }).lean();
  assert.equal(Object.hasOwn(visibleUser, 'password'), false);
  const credentialUser = await User.findOne({ email: storedUser.email }).select('+password');
  assert.equal(Object.hasOwn(credentialUser.toJSON(), 'password'), false);
  await assert.rejects(new User({ name: 'آزمایش', email: 'hash-test@toplinksho.invalid', password: 'plain-text' }).validate());
  assert.notEqual(storedSession.tokenHash, token);
  assert.equal(storedSession.tokenHash, createHash('sha256').update(token).digest('hex'));
  assert.match((await call('/api/admin/mail/verify', { cookie })).headers.get('cache-control'), /no-store/);
  assert.equal((await call('/api/admin/mail/verify', { cookie })).status, 200);
  record('password login, hashed expiring sessions, secure cookies and authenticated TLS SMTP');

  const submission = body();
  const concurrent = await Promise.all(Array.from({ length: 6 }, () => call('/api/consultations', { body: submission })));
  assert.equal(concurrent.filter(response => response.status === 201).length, 1);
  assert(concurrent.every(response => [200, 201].includes(response.status)));
  const created = concurrent.find(response => response.status === 201);
  assert.equal(created.status, 201);
  const { reference } = await created.json();
  assert.match(reference, /^TLS-[\dA-F]+$/);
  const lead = await leadBy({ reference });
  assert.equal(lead.phone, '09121234567');
  assert.equal(lead.status, 'new');
  const duplicate = await call('/api/consultations', { body: submission });
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).reference, reference);
  assert.equal(await db.collection('leads').countDocuments(), 1);
  await waitFor(async () => (await leadBy({ publicId: lead.id })).email_status === 'sent', 'mail delivery');
  assert.equal(messages.length, 1); assert(messageText(messages[0]).includes(reference));
  record('durable submission, Persian telephone normalization, idempotency and one email notification');

  const updated = await call(`/api/admin/consultations/${lead.id}`, { method: 'PATCH', cookie, body: { status: 'contacted', notes: 'پیگیری آزمایشی ثبت شد.', version: 1 } });
  assert.equal(updated.status, 200); assert.equal((await updated.json()).version, 2);
  assert.equal((await call(`/api/admin/consultations/${lead.id}`, { method: 'PATCH', cookie, body: { status: 'completed', notes: 'stale overwrite', version: 1 } })).status, 409);
  assert.equal((await leadBy({ publicId: lead.id })).notes, 'پیگیری آزمایشی ثبت شد.');
  const search = await call('/api/admin/consultations/search', { cookie, body: { query: '۰۹۱۲۱۲۳۴۵۶۷', status: 'contacted', page: 1 } });
  assert.equal((await search.json()).total, 1);
  const injected = await call('/api/admin/consultations/search', { cookie, body: { query: "%' OR 1=1 --", status: '', page: 1 } });
  assert.equal((await injected.json()).total, 0);
  const wildcard = await call('/api/admin/consultations/search', { cookie, body: { query: '^.*$', status: '', page: 1 } });
  assert.equal((await wildcard.json()).total, 0);
  record('private status/notes, optimistic concurrency, normalized search and literal MongoDB search');

  rejectMail = true;
  const failed = await call('/api/consultations', { body: body({ name: 'درخواست با خطای ایمیل' }) });
  assert.equal(failed.status, 201);
  const failedLead = await leadBy({ reference: (await failed.json()).reference });
  await waitFor(async () => (await leadBy({ publicId: failedLead.id })).email_status === 'failed', 'failure status');
  assert.equal((await leadBy({ publicId: failedLead.id })).status, 'new');
  rejectMail = false;
  assert.equal((await call(`/api/admin/consultations/${failedLead.id}/notification`, { cookie })).status, 200);
  await waitFor(async () => (await leadBy({ publicId: failedLead.id })).email_status === 'sent', 'mail retry');
  assert.equal((await call(`/api/admin/consultations/${failedLead.id}/notification`, { cookie })).status, 409);
  record('SMTP failure preserves the lead; explicit retry succeeds without re-sending sent mail');

  for (let index = 0; index < 25; index++) {
    const now = new Date(Date.now() + index);
    await db.collection("leads").insertOne({ publicId: randomUUID(), reference: `TLS-FIXTURE-${index}`, submissionKey: randomUUID(), name: `آزمایشی ${index}`, phone: "09121111111", subject: "طراحی سایت", description: "", website: "", notes: "", status: "new", version: 1, notification: { status: "unconfigured", attempts: 0, updatedAt: now }, createdAt: now, updatedAt: now });
  }
  const page = await (await call('/api/admin/consultations/search', { cookie, body: { query: '', status: '', page: 2 } })).json();
  assert.equal(page.page, 2); assert.equal(page.rows.length, 7); assert.equal(page.total, 27);
  const clamped = await (await call('/api/admin/consultations/search', { cookie, body: { query: 'not-found', status: '', page: 999 } })).json();
  assert.equal(clamped.page, 1); assert.equal(clamped.rows.length, 0);
  record('bounded server pagination, totals, empty search and page clamping');

  for (let index = 0; index < 7; index++) {
    const attempt = await call('/api/admin/login', { ip: '198.51.100.55', body: { email: 'admin@toplinksho.invalid', password: 'wrong' } });
    assert.equal(attempt.status, index < 6 ? 401 : 429);
    if (index === 6) assert(Number(attempt.headers.get('retry-after')) > 0);
  }
  record('login brute-force limits with retry guidance');
  await db.collection('users').insertOne({ name: 'کاربر معمولی آزمایشی', email: 'user@toplinksho.invalid', password: passwordHash, role: 'user', status: 'active', sessionVersion: 1 });
  assert.equal((await call('/api/admin/login', { body: { email: 'user@toplinksho.invalid', password } })).status, 401);
  await db.collection('users').updateOne({ email: 'admin@toplinksho.invalid' }, { $set: { status: 'suspended' }, $inc: { sessionVersion: 1 } });
  assert.equal((await call('/api/admin/consultations/search', { cookie, body: { query: '', status: '', page: 1 } })).status, 401);
  await db.collection('users').updateOne({ email: 'admin@toplinksho.invalid' }, { $set: { status: 'active' } });
  assert.equal((await call('/api/admin/consultations/search', { cookie, body: { query: '', status: '', page: 1 } })).status, 401);
  const renewed = await call('/api/admin/login', { body: { email: 'admin@toplinksho.invalid', password } });
  assert.equal(renewed.status, 200); cookie = renewed.headers.get('set-cookie').split(';')[0];
  record('database user roles, suspension and session-version revocation');

  const count = await db.collection('leads').countDocuments();
  await stop();
  await start({ SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '', SMTP_FROM: '', LEADS_EMAIL: '' });
  assert.equal(await db.collection('leads').countDocuments(), count);
  const withoutMail = await call('/api/consultations', { body: body({ name: 'بدون سرویس ایمیل' }) });
  assert.equal(withoutMail.status, 201);
  const missingLead = await leadBy({ reference: (await withoutMail.json()).reference });
  await waitFor(async () => (await leadBy({ publicId: missingLead.id })).email_status === 'unconfigured', 'unconfigured mail status');
  record('server restart preserves data; missing SMTP never blocks consultation storage');

  assert.equal((await call('/api/admin/logout', { cookie })).status, 200);
  assert.equal((await call('/api/admin/consultations/search', { cookie, body: { query: '', status: '', page: 1 } })).status, 401);
  const newLogin = await call('/api/admin/login', { body: { email: 'admin@toplinksho.invalid', password } });
  const oldCredentialCookie = newLogin.headers.get('set-cookie').split(';')[0];
  await stop();
  const nextSalt = randomBytes(16).toString('hex');
  await start({ ADMIN_PASSWORD_HASH: `scrypt:${nextSalt}:${scryptSync(randomBytes(24), nextSalt, 64).toString('hex')}` });
  assert.equal((await call('/api/admin/consultations/search', { cookie: oldCredentialCookie, body: { query: '', status: '', page: 1 } })).status, 401);
  record('logout and credential rotation invalidate sessions');

  await mkdir('artifacts', { recursive: true });
  await writeFile('artifacts/backend-results.json', JSON.stringify({ passed: true, checks, realEmailSent: false, smtp: 'local TLS server with isolated credentials', database: 'isolated local MongoDB process' }, null, 2));
  console.log(JSON.stringify({ passed: true, checks: checks.length, realEmailSent: false }));
} finally {
  await stop();
  await mongoose.disconnect();
  await mongoClient.close();
  await mongo.stop();
  if (smtp) await new Promise(resolve => smtp.close(resolve));
  if (dirname(resolve(directory)) === resolve(tmpdir()) && basename(directory).startsWith('toplinksho-backend-')) await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
