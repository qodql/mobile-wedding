import { Redis } from "@upstash/redis";

// Vercel Storage(마켓플레이스)로 연결하면 KV_REST_API_* 이름으로,
// Upstash 콘솔에서 직접 복사하면 UPSTASH_REDIS_REST_* 이름으로 들어옵니다. 둘 다 지원.
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;
