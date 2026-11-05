"use client";

import { FormEvent, useEffect, useState } from "react";

type Entry = { id: string; name: string; message: string; createdAt: number };

const PAGE = 5;

const fmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

async function readError(res: Response) {
  try {
    const data = await res.json();
    return data.error ?? "문제가 생겼어요. 다시 시도해 주세요.";
  } catch {
    return "문제가 생겼어요. 다시 시도해 주세요.";
  }
}

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [shown, setShown] = useState(PAGE);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleting, setDeleting] = useState<string | null>(null);
  const [delPassword, setDelPassword] = useState("");
  const [delError, setDelError] = useState("");

  useEffect(() => {
    fetch("/api/guestbook", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res));
        return res.json();
      })
      .then((data: { entries: Entry[] }) => {
        setEntries(data.entries);
        setStatus("ready");
      })
      .catch((e: Error) => {
        setLoadError(e.message);
        setStatus("error");
      });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setFormError("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, message }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const { entry } = (await res.json()) as { entry: Entry };
      setEntries((prev) => [entry, ...prev]);
      setMessage("");
      setPassword("");
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    setDelError("");
    const res = await fetch("/api/guestbook", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: delPassword }),
    });
    if (!res.ok && res.status !== 404) {
      setDelError(await readError(res));
      return;
    }
    setEntries((prev) => prev.filter((x) => x.id !== id));
    setDeleting(null);
    setDelPassword("");
  };

  return (
    <div className="gb">
      <form className="gb-form" onSubmit={submit}>
        <div className="gb-row">
          <input
            className="gb-input"
            placeholder="이름"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="gb-input"
            type="password"
            placeholder="비밀번호 (삭제용)"
            value={password}
            minLength={4}
            maxLength={20}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <textarea
          className="gb-input gb-text"
          placeholder="축하 메시지를 남겨주세요"
          value={message}
          maxLength={300}
          rows={3}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <div className="gb-actions">
          <span className="gb-len">{message.length}/300</span>
          <button className="gb-submit" type="submit" disabled={sending || status === "error"}>
            {sending ? "남기는 중…" : "남기기"}
          </button>
        </div>
        {formError && <p className="gb-error">{formError}</p>}
      </form>

      <div className="gb-list">
        {status === "loading" && <p className="gb-empty">불러오는 중…</p>}
        {status === "error" && <p className="gb-empty">{loadError}</p>}
        {status === "ready" && entries.length === 0 && (
          <p className="gb-empty">첫 번째 축하 메시지를 남겨주세요 ♥</p>
        )}

        {entries.slice(0, shown).map((en) => (
          <article key={en.id} className="gb-item">
            <header className="gb-head">
              <strong>{en.name}</strong>
              <span className="gb-date">{fmt.format(en.createdAt)}</span>
              <button
                className="gb-del"
                aria-label="삭제"
                onClick={() => {
                  setDeleting(deleting === en.id ? null : en.id);
                  setDelPassword("");
                  setDelError("");
                }}
              >
                ×
              </button>
            </header>
            <p className="gb-msg">{en.message}</p>

            {deleting === en.id && (
              <form
                className="gb-delform"
                onSubmit={(e) => {
                  e.preventDefault();
                  remove(en.id);
                }}
              >
                <input
                  className="gb-input"
                  type="password"
                  placeholder="작성 시 비밀번호"
                  value={delPassword}
                  onChange={(e) => setDelPassword(e.target.value)}
                  autoFocus
                  required
                />
                <button className="gb-submit small" type="submit">
                  삭제
                </button>
                {delError && <p className="gb-error">{delError}</p>}
              </form>
            )}
          </article>
        ))}

        {entries.length > shown && (
          <button className="gb-more" onClick={() => setShown((s) => s + PAGE)}>
            더보기 ({entries.length - shown})
          </button>
        )}
      </div>
    </div>
  );
}
