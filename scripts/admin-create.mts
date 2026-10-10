/**
 * Creates the first /admin account. Works only while ridelink_user is empty;
 * every later account is added from /admin/accounts.
 * Run via `pnpm admin:create`.
 */
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SUPABASE_URL || !KEY) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

let muted = false;
const echo = new Writable({
  write(chunk, encoding, done) {
    if (!muted) stdout.write(chunk, encoding);
    done();
  },
});
const rl = createInterface({ input: stdin, output: echo, terminal: Boolean(stdin.isTTY) });
const lines = rl[Symbol.asyncIterator]();

async function ask(question: string, hidden = false): Promise<string> {
  stdout.write(question);
  muted = hidden;
  const { value, done } = await lines.next();
  muted = false;
  if (hidden) stdout.write('\n');
  if (done) {
    console.error('Đã dừng trước khi nhập xong.');
    process.exit(1);
  }
  return value as string;
}

const email = (await ask('Email: ')).trim().toLowerCase();
const name = (await ask('Tên hiển thị: ')).trim();
const password = await ask('Mật khẩu (10 đến 72 ký tự): ', true);
const again = await ask('Nhập lại mật khẩu: ', true);
rl.close();

if (password !== again) {
  console.error('Hai lần nhập chưa khớp.');
  process.exit(1);
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ridelink_admin_bootstrap`, {
  method: 'POST',
  headers: {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({ p_email: email, p_display_name: name, p_password: password }),
});

if (!res.ok) {
  console.error(`Supabase trả lỗi ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}

const body = (await res.json()) as { ok: boolean; code: string | null };
const MESSAGE: Record<string, string> = {
  exists: 'Đã có tài khoản. Đăng nhập /admin bằng tài khoản admin rồi thêm người ở mục Tài khoản.',
  weak: 'Mật khẩu cần từ 10 đến 72 ký tự.',
  invalid: 'Email hoặc tên hiển thị chưa hợp lệ.',
};

if (!body.ok) {
  console.error(MESSAGE[body.code ?? ''] ?? `Không tạo được (${body.code}).`);
  process.exit(1);
}

console.log(`Đã tạo admin ${email}. Đăng nhập tại /admin/login.`);
