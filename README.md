# 마비노기 모바일 청첩장

## 수정하기
- 이름·날짜·장소·사진·계좌: `app/config.ts`
- 사진: `public/` 폴더에 넣고 `config.ts`의 `photo`에 `"/파일명.jpg"` 입력 (3:4 비율 권장)
- 색상: `app/globals.css` 맨 위 `:root` 변수
- 인사말: `app/page.tsx`의 인사말 섹션

## 로컬 실행
```bash
npm install
npm run dev
```

## Vercel 배포
GitHub에 올린 뒤 Vercel에서 Import 하면 설정 없이 바로 배포됩니다.
