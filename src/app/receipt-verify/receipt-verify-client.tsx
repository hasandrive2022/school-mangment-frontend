"use client";
import { useState } from "react";
import Link from "next/link";
const api =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";
export default function ReceiptVerifyClient() { const [number, setNumber] = useState(""); const [code, setCode] = useState(""); const [result, setResult] = useState<boolean | null>(null); const [error, setError] = useState(""); async function verify() { setError(""); setResult(null); try { const r = await fetch(`${api}/public/receipts/verify?receiptNumber=${encodeURIComponent(number)}&verifyCode=${encodeURIComponent(code)}`); const p = await r.json() as { valid?: boolean }; if (!r.ok) throw new Error("request failed"); setResult(Boolean(p.valid)); } catch { setError("রসিদ যাচাই করা যায়নি। আবার চেষ্টা করুন।"); } } return (
  <>
    <div className="pbanner">
      <div className="container">
        <h2>
          <svg className="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M9 15l2 2 4-4" /></svg>
          রসিদ যাচাই
        </h2>
        <nav className="crumbs">
          <Link href="/">হোম</Link><span className="sep">›</span><span className="cur">রসিদ যাচাই</span>
        </nav>
      </div>
    </div>
    <div className="container page-body">
      <div className="card filter-card verify-card">
        <h3 style={{ fontSize: 18, color: "var(--p800)", marginBottom: 4 }}>রসিদ যাচাই</h3>
        <p className="small muted" style={{ margin: "0 0 14px" }}>রসিদ নম্বর ও যাচাই কোড দিয়ে তথ্য মিলিয়ে নিন</p>
        <div className="field">
          <label htmlFor="receipt-number">রসিদ নম্বর</label>
          <input id="receipt-number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="রসিদ নম্বর" />
        </div>
        <div className="field">
          <label htmlFor="receipt-code">যাচাই কোড</label>
          <input id="receipt-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="যাচাই কোড" />
        </div>
        <button className="btn btn-primary btn-lg" type="button" style={{ width: "100%", justifyContent: "center" }} onClick={() => void verify()}>যাচাই করুন</button>
        {error && <div className="alert alert-red" style={{ marginTop: 16, marginBottom: 0 }}><span>{error}</span></div>}
        {result !== null && (
          <div className={`alert ${result ? "alert-green" : "alert-red"}`} style={{ marginTop: 16, marginBottom: 0 }}>
            {result ? (
              <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><path d="M22 4 12 14l-3-3" /></svg>
            ) : (
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></svg>
            )}
            <span><b>{result ? "বৈধ রসিদ" : "অবৈধ রসিদ"}</b></span>
          </div>
        )}
      </div>
    </div>
  </>
); }
