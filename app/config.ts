// 청첩장 내용은 전부 여기서 수정하면 됩니다.

export const wedding = {
  groom: "신랑 캐릭터명",
  bride: "신부 캐릭터명",
  // 예식 일시 (한국 시간 기준)
  date: new Date("2026-11-07T20:00:00+09:00"),
  // 예식 장소 (게임 내 서버/채널 등, 비워두면 표시 안 됨)
  place: "",
  // 사진: public 폴더에 넣고 경로 입력 (예: "/photo.jpg"). 비워두면 회색 자리표시.
  photo: "",
};

export type Account = {
  role: string; // 예: 신랑, 신랑 아버지
  name: string;
  bank: string;
  number: string;
};

export const accounts: { title: string; list: Account[] }[] = [
  {
    title: "신랑측 마음 전하실 곳",
    list: [{ role: "신랑", name: "홍길동", bank: "○○은행", number: "000-0000-0000-00" }],
  },
  {
    title: "신부측 마음 전하실 곳",
    list: [{ role: "신부", name: "김영희", bank: "○○은행", number: "000-0000-0000-00" }],
  },
];
