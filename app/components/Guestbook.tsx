"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Entry = { id: string; name: string; message: string; createdAt: number };
type Field = "name" | "password" | "message";
type FieldErrors = Partial<Record<Field, string>>;

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

// 브라우저 기본 경고 대신 쓰는 검사 (서버에서도 같은 규칙으로 한 번 더 검사함)
function validate(name: string, password: string, message: string): FieldErrors {
  const e: FieldErrors = {};
  if (!name.trim()) e.name = "닉네임을 입력해 주세요";
  if (!password) e.password = "비밀번호를 입력해 주세요";
  else if (password.length < 4) e.password = "비밀번호는 4자 이상이에요";
  if (!message.trim()) e.message = "축하 메시지를 입력해 주세요";
  return e;
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const refs = {
    name: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

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

  // 입력을 고치면 그 칸의 경고는 바로 사라짐
  const clearError = (field: Field) =>
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;

    const errors = validate(name, password, message);
    setFieldErrors(errors);
    const firstInvalid = (["name", "password", "message"] as Field[]).find((f) => errors[f]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }

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
    if (!delPassword) {
      setDelError("비밀번호를 입력해 주세요");
      return;
    }
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
      {/* noValidate: 브라우저 기본 경고 말풍선을 끄고 아래 안내 문구로 대신함 */}
      <form className="gb-form" onSubmit={submit} noValidate>
        <div className="gb-row">
          <div className="gb-field">
            <input
              ref={refs.name}
              className={`gb-input ${fieldErrors.name ? "invalid" : ""}`}
              placeholder="닉네임"
              value={name}
              maxLength={20}
              aria-invalid={!!fieldErrors.name}
              aria-describedby="gb-err-name"
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
            />
            {fieldErrors.name && (
              <p id="gb-err-name" className="gb-hint">
                {fieldErrors.name}
              </p>
            )}
          </div>
          <div className="gb-field">
            <input
              ref={refs.password}
              className={`gb-input ${fieldErrors.password ? "invalid" : ""}`}
              type="password"
              placeholder="비밀번호 (삭제용)"
              value={password}
              maxLength={20}
              aria-invalid={!!fieldErrors.password}
              aria-describedby="gb-err-password"
              onChange={(e) => {
                setPassword(e.target.value);
                clearError("password");
              }}
            />
            {fieldErrors.password && (
              <p id="gb-err-password" className="gb-hint">
                {fieldErrors.password}
              </p>
            )}
          </div>
        </div>
        <div className="gb-field">
          <textarea
            ref={refs.message}
            className={`gb-input gb-text ${fieldErrors.message ? "invalid" : ""}`}
            placeholder="축하 메시지를 남겨주세요"
            value={message}
            maxLength={300}
            rows={3}
            aria-invalid={!!fieldErrors.message}
            aria-describedby="gb-err-message"
            onChange={(e) => {
              setMessage(e.target.value);
              clearError("message");
            }}
          />
          {fieldErrors.message && (
            <p id="gb-err-message" className="gb-hint">
              {fieldErrors.message}
            </p>
          )}
        </div>
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
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  remove(en.id);
                }}
              >
                <input
                  className={`gb-input ${delError ? "invalid" : ""}`}
                  type="password"
                  placeholder="작성 시 비밀번호"
                  value={delPassword}
                  aria-invalid={!!delError}
                  onChange={(e) => {
                    setDelPassword(e.target.value);
                    setDelError("");
                  }}
                  autoFocus
                />
                <button className="gb-submit small" type="submit">
                  삭제
                </button>
                {delError && <p className="gb-hint">{delError}</p>}
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