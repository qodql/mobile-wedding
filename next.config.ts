import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16은 허용 목록에 있는 화질만 쓸 수 있음 (기본 75만 허용)
    qualities: [75, 90],
  },
};

export default nextConfig;