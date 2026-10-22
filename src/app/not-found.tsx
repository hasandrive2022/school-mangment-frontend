import Link from "next/link";

export default function NotFound() {
  return (
    <main className="error-page">
      <div className="error-card">
        <div className="error-code">৪০৪</div>
        <p className="public-kicker">পৃষ্ঠাটি পাওয়া যায়নি</p>
        <h1>এই ঠিকানায় কোনো তথ্য নেই</h1>
        <p>লিংকটি পরিবর্তিত হতে পারে অথবা পৃষ্ঠাটি সরিয়ে নেওয়া হয়েছে।</p>
        <Link className="error-button" href="/">
          হোমপেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}
