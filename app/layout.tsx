import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ميزان | ميزانيتك الشخصية",
  description: "تطبيق شخصي بسيط لمتابعة الراتب والمصروفات الشهرية.",
  applicationName: "ميزان",
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
