// 청첩장 내용은 전부 여기서 수정하면 됩니다.

export const wedding = {
  groom: "뱅고쿠",
  bride: "진유설",
  // 예식 일시 (한국 시간 기준)
  date: new Date("2026-11-07T20:00:00+09:00"),
  // 예식 장소 (게임 내 서버/채널 등, 비워두면 표시 안 됨)
  place: "",
  // 메인 사진: public 폴더에 넣고 경로 입력 (예: "/main.jpg"). 비워두면 회색 자리표시.
  photo: "/1.png",
  // 갤러리 사진: public/gallery 폴더에 넣고 경로 입력 (예: "/gallery/1.jpg").
  // 빈 문자열("")은 회색 자리표시로 나옵니다. 개수는 자유롭게 늘리고 줄이면 됩니다.
  gallery: ["/gallery/2.png", "/gallery/3.png", "/gallery/4.png", "/gallery/5.png", "/gallery/6.png"],
};
