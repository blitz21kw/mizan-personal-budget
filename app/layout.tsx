import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./mobile-polish.css";

const publicAssetPath = process.env.GITHUB_PAGES === "true"
  ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "mizan-personal-budget"}`
  : "";

export const metadata: Metadata = {
  title: "ميزان | ميزانيتك الشخصية",
  description: "تطبيق شخصي بسيط لمتابعة الراتب والمصروفات الشهرية.",
  applicationName: "ميزان",
  icons: {
    icon: [
      { url: `${publicAssetPath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${publicAssetPath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${publicAssetPath}/icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ميزان",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f8f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
