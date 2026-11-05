"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { GalleryItem } from "../config";

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

// 문자열/객체 둘 다 받아서 같은 모양으로 맞춤
const normalize = (item: GalleryItem) =>
  typeof item === "string"
    ? { src: item, fit: "cover" as const, position: "50% 50%" }
    : { src: item.src, fit: item.fit ?? "cover", position: item.position ?? "50% 50%" };

export default function Gallery({ photos }: { photos: GalleryItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const items = photos.map(normalize);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const go = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(items.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="gallery">
      {/* 화살표가 사진 영역 기준으로 정중앙에 오도록 사진+화살표만 따로 감쌈 */}
      <div className="gal-viewport">
        <div className="gal-track" ref={trackRef} onScroll={onScroll}>
          {items.map(({ src, fit, position }, i) => (
            <div key={i} className="gal-slide">
              {!src ? (
                <div className="photo-empty">PHOTO {i + 1}</div>
              ) : (
                <>
                  {/* contain일 때 빈 공간을 같은 사진의 흐린 버전으로 채움 */}
                  {fit === "contain" && (
                    <Image
                      src={src}
                      alt=""
                      aria-hidden
                      fill
                      sizes="200px"
                      className="gal-blur"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  <Image
                    src={src}
                    alt={`웨딩 사진 ${i + 1}`}
                    fill
                    quality={90}
                    sizes="(max-width: 420px) 200vw, 840px"
                    style={{ objectFit: fit, objectPosition: position }}
                  />
                </>
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
          disabled={index === items.length - 1}
        >
          <Chevron dir="right" />
        </button>

        <span className="gal-count">
          {index + 1} / {items.length}
        </span>
      </div>

      <div className="gal-dots">
        {items.map((_, i) => (
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