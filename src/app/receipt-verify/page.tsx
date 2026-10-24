import PublicShell from "@/components/site-chrome";
import ReceiptVerifyClient from "./receipt-verify-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "রশিদ যাচাই",
  description: "ফি পরিশোধের রশিদ নম্বর দিয়ে রশিদের সত্যতা যাচাই করুন।",
  alternates: { canonical: "/receipt-verify" },
  openGraph: { title: "রশিদ যাচাই", description: "ফি পরিশোধের রশিদ নম্বর দিয়ে রশিদের সত্যতা যাচাই করুন।", url: "/receipt-verify" },
};

export default function ReceiptVerifyPage() {
  return (
    <PublicShell>
      <ReceiptVerifyClient />
    </PublicShell>
  );
}
