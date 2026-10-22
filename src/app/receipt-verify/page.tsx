"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const api =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";
export default function ReceiptVerifyPage() { const [number, setNumber] = useState(""); const [code, setCode] = useState(""); const [result, setResult] = useState<boolean | null>(null); async function verify() { const r = await fetch(`${api}/public/receipts/verify?receiptNumber=${encodeURIComponent(number)}&verifyCode=${encodeURIComponent(code)}`); const p = await r.json() as { valid?: boolean }; setResult(Boolean(p.valid)); } return <main className="public-page"><div className="public-page-inner receipt-page"><p className="public-breadcrumb">হোম → রসিদ যাচাই</p><Card className="receipt-card"><CardHeader><CardTitle>রসিদ যাচাই</CardTitle><p className="portal-muted">রসিদ নম্বর ও যাচাই কোড দিয়ে তথ্য মিলিয়ে নিন</p></CardHeader><CardContent className="receipt-form"><Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="রসিদ নম্বর" /><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="যাচাই কোড" /><Button onClick={() => void verify()}>যাচাই করুন</Button>{result !== null && <Badge variant={result ? "success" : "destructive"}>{result ? "বৈধ রসিদ" : "অবৈধ রসিদ"}</Badge>}</CardContent></Card></div></main>; }
