"use client";

import { useEffect, useState } from "react";

type Left = { d: number; h: number; m: number; s: number } | "live" | "done" | null;

// 서버/클라이언트 시간 차이로 인한 hydration 오류를 피하려고 마운트 후에만 계산합니다.
export default function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState<Left>(null);

  useEffect(() => {
    const t = new Date(target).getTime();
    const tick = () => {
      const diff = t - Date.now();
      if (diff <= 0) {
        setLeft(diff > -3 * 60 * 60 * 1000 ? "live" : "done");
        return;
      }
      const sec = Math.floor(diff / 1000);
      setLeft({
        d: Math.floor(sec / 86400),
        h: Math.floor((sec % 86400) / 3600),
        m: Math.floor((sec % 3600) / 60),
        s: sec % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (left === "live") return <p className="countdown-msg">지금 예식이 진행 중이에요 💍</p>;
  if (left === "done") return <p className="countdown-msg">예식이 끝났어요. 축하해주셔서 감사합니다!</p>;

  const units: [string, number | undefined][] = [
    ["DAYS", left?.d],
    ["HOUR", left?.h],
    ["MIN", left?.m],
    ["SEC", left?.s],
  ];

  return (
    <div className="countdown" aria-live="off">
      {units.map(([label, v], i) => (
        <div key={label} className="cd-cell">
          <span className="cd-num">{v === undefined ? "--" : String(v).padStart(2, "0")}</span>
          <span className="cd-label">{label}</span>
          {i < units.length - 1 && <span className="cd-colon">:</span>}
        </div>
      ))}
    </div>
  );
}
