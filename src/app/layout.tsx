import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "আদর্শ মডেল উচ্চ বিদ্যালয়",
  description: "আদর্শ মডেল উচ্চ বিদ্যালয়ের জনসাধারণের ও শিক্ষার্থী পোর্টাল",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
