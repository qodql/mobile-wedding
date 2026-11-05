import Image from "next/image";
import { wedding, accounts } from "./config";
import { formatWeddingDate, koreanParts, monthGrid, WEEKDAYS } from "./date";
import AccountSection from "./components/AccountSection";
import Countdown from "./components/Countdown";

export default function Page() {
  const { year, month, day } = koreanParts(wedding.date);
  const label = formatWeddingDate(wedding.date);
  const cells = monthGrid(year, month);

  return (
    <main className="card">
      {/* 상단 */}
      <header className="hero">
        <p className="eyebrow">MABINOGI MOBILE · WEDDING</p>
        <h1 className="names">
          {wedding.groom}
          <span className="amp">&amp;</span>
          {wedding.bride}
        </h1>
        <p className="hero-date">{label.short}</p>
      </header>

      {/* 사진 */}
      <section className="photo">
        {wedding.photo ? (
          <Image src={wedding.photo} alt="웨딩 사진" fill priority sizes="420px" style={{ objectFit: "cover" }} />
        ) : (
          <div className="photo-empty">PHOTO</div>
        )}
      </section>

      {/* 인사말 */}
      <section className="section greeting">
        <p>
          에린에서 만나 함께 모험해 온 두 사람이
          <br />
          이제 평생의 파티원이 되려 합니다.
          <br />
          오셔서 축복해 주세요.
        </p>
      </section>

      {/* 날짜 */}
      <section className="section">
        <h2 className="title">WEDDING DAY</h2>
        <p className="date-long">{label.long}</p>
        {wedding.place && <p className="place">{wedding.place}</p>}

        <div className="cal">
          <p className="cal-month">{month}월</p>
          <div className="cal-grid">
            {WEEKDAYS.map((w, i) => (
              <span key={w} className={`cal-wd ${i === 0 ? "sun" : ""}`}>
                {w}
              </span>
            ))}
            {cells.map((d, i) => (
              <span
                key={i}
                className={`cal-day ${d === day ? "on" : ""} ${i % 7 === 0 ? "sun" : ""}`}
              >
                {d ?? ""}
              </span>
            ))}
          </div>
        </div>

        <Countdown target={wedding.date.toISOString()} />
      </section>

      {/* 계좌 */}
      <section className="section">
        <h2 className="title">마음 전하실 곳</h2>
        <p className="sub">축하의 마음을 전해주셔서 감사합니다.</p>
        <AccountSection groups={accounts} />
      </section>

      <footer className="foot">♥ {wedding.groom} &amp; {wedding.bride}</footer>
    </main>
  );
}
