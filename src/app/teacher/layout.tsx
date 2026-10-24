import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "শিক্ষক পোর্টাল",
  description: "শিক্ষক পোর্টাল — হাজিরা, নম্বর এন্ট্রি, বেতন ও প্রোফাইল।",
  robots: { index: false, follow: false },
};

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return children;
}
