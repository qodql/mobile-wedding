"use client";

import Image from "next/image";
import { useRef, useState } from "react";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Gallery({ photos }: { photos: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const go = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="gallery">
      {/* 화살표가 사진 영역 기준으로 정중앙에 오도록 사진+화살표만 따로 감쌈 */}
      <div className="gal-viewport">
        <div className="gal-track" ref={trackRef} onScroll={onScroll}>
          {photos.map((src, i) => (
            <div key={i} className="gal-slide">
              {src ? (
                <Image src={src} alt={`웨딩 사진 ${i + 1}`} fill sizes="420px" style={{ objectFit: "cover" }} />
              ) : (
                <div className="photo-empty">PHOTO {i + 1}</div>
              )}
            </div>
          ))}
        </div>

        <button
          className="gal-arrow left"
          onClick={() => go(index - 1)}
          aria-label="이전 사진"
          disabled={index === 0}
        >
          <Chevron dir="left" />
        </button>
        <button
          className="gal-arrow right"
          onClick={() => go(index + 1)}
          aria-label="다음 사진"
          disabled={index === photos.length - 1}
        >
          <Chevron dir="right" />
        </button>

        <span className="gal-count">
          {index + 1} / {photos.length}
        </span>
      </div>

      <div className="gal-dots">
        {photos.map((_, i) => (
          <button
            key={i}
            className={`gal-dot ${i === index ? "on" : ""}`}
            onClick={() => go(i)}
            aria-label={`${i + 1}번 사진`}
          />
        ))}
      </div>
    </div>
  );
}
