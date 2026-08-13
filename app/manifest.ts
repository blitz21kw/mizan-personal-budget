import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.GITHUB_PAGES === "true"
    ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "mizan-personal-budget"}`
    : "";

  return {
    name: "ميزان | ميزانيتك الشخصية",
    short_name: "ميزان",
    description: "تطبيق شخصي بسيط لمتابعة الراتب والمصروفات الشهرية.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#f5f8f6",
    theme_color: "#f5f8f6",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
