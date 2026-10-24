import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "শিক্ষার্থী পোর্টাল",
  description: "শিক্ষার্থীর ফলাফল, ফি ও রশিদ, হাজিরা, রুটিন ও প্রোফাইল — রেজিস্ট্রেশন নম্বর দিয়ে লগইন করুন।",
  robots: { index: false, follow: false },
};

export default function StudentLayout({ children }: { children: ReactNode }) {
  return children;
}
