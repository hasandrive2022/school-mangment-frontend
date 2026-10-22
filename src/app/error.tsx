"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /* Next.js error boundary hook */
  }, []);
  return (
    <main className="error-page">
      <div className="error-card">
        <div className="error-code">!</div>
        <p className="public-kicker">সাময়িক সমস্যা</p>
        <h1>পৃষ্ঠাটি লোড করা যায়নি</h1>
        <p>আবার চেষ্টা করুন অথবা হোমপেজে ফিরে যান।</p>
        <div className="error-actions">
          <Button onClick={() => reset()}>আবার চেষ্টা করুন</Button>
          <Link className="error-button error-button-outline" href="/">
            হোমপেজ
          </Link>
        </div>
      </div>
    </main>
  );
}
