"use client";

import { useEffect, useState } from "react";

// 서버/클라이언트 시간 차이로 인한 hydration 오류를 피하려고 마운트 후에만 계산합니다.
export default function Countdown({ target }: { target: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const t = new Date(target).getTime();
    const tick = () => {
      const diff = t - Date.now();
      if (diff <= 0) {
        setText(diff > -3 * 60 * 60 * 1000 ? "지금 예식이 진행 중이에요 💍" : "예식이 끝났어요. 축하해주셔서 감사합니다!");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setText(d > 0 ? `예식까지 ${d}일 ${h}시간 ${m}분` : `예식까지 ${h}시간 ${m}분`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [target]);

  return <p className="countdown">{text ?? " "}</p>;
}
