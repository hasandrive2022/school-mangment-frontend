"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="bn">
      <body>
        <main className="error-page">
          <div className="error-card">
            <div className="error-code">!</div>
            <h1>সাময়িক সিস্টেম সমস্যা</h1>
            <p>দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
            <button className="error-button" onClick={() => reset()} type="button">
              আবার চেষ্টা করুন
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
