import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ميزان | ميزانيتك الشخصية",
  description: "تطبيق شخصي بسيط لمتابعة الراتب والمصروفات الشهرية.",
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
