// 서버(Vercel)는 UTC로 돌기 때문에 날짜는 항상 한국 시간 기준으로 계산합니다.

const TZ = "Asia/Seoul";
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function koreanParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { year, month, day, hour: get("hour"), minute: get("minute"), weekday };
}

export function formatWeddingDate(date: Date) {
  const { year, month, day, hour, minute, weekday } = koreanParts(date);
  const ampm = hour < 12 ? "오전" : "오후";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const min = minute ? ` ${minute}분` : "";
  return {
    short: `${year}. ${String(month).padStart(2, "0")}. ${String(day).padStart(2, "0")}`,
    long: `${year}년 ${month}월 ${day}일 ${WEEKDAYS[weekday]}요일 ${ampm} ${h12}시${min}`,
  };
}

export function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export { WEEKDAYS };
