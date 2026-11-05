"use client";

import { useState } from "react";
import type { Account } from "../config";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 일부 인앱 브라우저(카톡 등)용 대체 방법
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  }
}

function Group({ title, list }: { title: string; list: Account[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const onCopy = async (i: number, a: Account) => {
    if (await copyText(`${a.bank} ${a.number}`)) {
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
    }
  };

  return (
    <div className="acc-group">
      <button className="acc-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{title}</span>
        <span className={`chev ${open ? "up" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul className="acc-list">
          {list.map((a, i) => (
            <li key={i} className="acc-item">
              <div>
                <p className="acc-who">
                  {a.role} <strong>{a.name}</strong>
                </p>
                <p className="acc-num">
                  {a.bank} {a.number}
                </p>
              </div>
              <button className="copy" onClick={() => onCopy(i, a)}>
                {copied === i ? "복사됨" : "복사"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AccountSection({ groups }: { groups: { title: string; list: Account[] }[] }) {
  return (
    <div className="acc">
      {groups.map((g) => (
        <Group key={g.title} {...g} />
      ))}
    </div>
  );
}
