import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

const IDS = "guestbook:ids"; // 정렬용 (score = 작성 시각)
const entryKey = (id: string) => `guestbook:entry:${id}`;
const LIMIT = 100; // 최근 100개까지 불러옴

type Stored = {
  id: string;
  name: string;
  message: string;
  createdAt: number;
  salt: string;
  hash: string;
};

const publicEntry = ({ id, name, message, createdAt }: Stored) => ({ id, name, message, createdAt });

const hashPassword = (password: string, salt: string) => scryptSync(password, salt, 32).toString("hex");

function checkPassword(entry: Stored, password: string) {
  // 신랑·신부용 관리자 비밀번호 (Vercel 환경변수 GUESTBOOK_ADMIN_PASSWORD, 선택)
  const admin = process.env.GUESTBOOK_ADMIN_PASSWORD;
  if (admin && password === admin) return true;
  const a = Buffer.from(hashPassword(password, entry.salt), "hex");
  const b = Buffer.from(entry.hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

const notReady = () => error("방명록 저장소가 아직 연결되지 않았어요.", 503);

export async function GET() {
  if (!redis) return notReady();
  const ids = await redis.zrange<string[]>(IDS, 0, LIMIT - 1, { rev: true });
  if (ids.length === 0) return NextResponse.json({ entries: [] });
  const rows = await redis.mget<(Stored | null)[]>(...ids.map(entryKey));
  const entries = rows.filter((r): r is Stored => !!r).map(publicEntry);
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  if (!redis) return notReady();

  let body: { name?: unknown; message?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return error("잘못된 요청이에요.", 400);
  }

  const name = String(body.name ?? "").trim();
  const message = String(body.message ?? "").trim();
  const password = String(body.password ?? "");

  if (!name || name.length > 20) return error("이름은 1~20자로 입력해 주세요.", 400);
  if (!message || message.length > 300) return error("메시지는 1~300자로 입력해 주세요.", 400);
  if (password.length < 4 || password.length > 20) return error("비밀번호는 4~20자로 입력해 주세요.", 400);

  // 도배 방지: 같은 IP는 10초에 한 번만 작성 가능 (IP는 해시로만 사용하고 저장하지 않음)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipKey = `guestbook:rl:${createHash("sha256").update(ip).digest("hex").slice(0, 16)}`;
  const ok = await redis.set(ipKey, 1, { nx: true, ex: 10 });
  if (!ok) return error("잠시 후 다시 시도해 주세요.", 429);

  const salt = randomBytes(16).toString("hex");
  const entry: Stored = {
    id: randomUUID(),
    name,
    message,
    createdAt: Date.now(),
    salt,
    hash: hashPassword(password, salt),
  };

  await redis
    .multi()
    .set(entryKey(entry.id), entry)
    .zadd(IDS, { score: entry.createdAt, member: entry.id })
    .exec();

  return NextResponse.json({ entry: publicEntry(entry) }, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!redis) return notReady();

  let body: { id?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return error("잘못된 요청이에요.", 400);
  }

  const id = String(body.id ?? "");
  const password = String(body.password ?? "");
  const entry = id ? await redis.get<Stored>(entryKey(id)) : null;
  if (!entry) return error("이미 삭제된 글이에요.", 404);
  if (!checkPassword(entry, password)) return error("비밀번호가 맞지 않아요.", 403);

  await redis.multi().del(entryKey(id)).zrem(IDS, id).exec();
  return NextResponse.json({ ok: true });
}
