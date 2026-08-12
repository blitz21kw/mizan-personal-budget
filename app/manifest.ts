import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ميزان | ميزانيتك الشخصية",
    short_name: "ميزان",
    description: "تطبيق شخصي بسيط لمتابعة الراتب والمصروفات الشهرية.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f8f6",
    theme_color: "#f5f8f6",
    lang: "ar",
    dir: "rtl",
  };
}
