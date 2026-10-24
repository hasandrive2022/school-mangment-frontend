import Link from "next/link";
import { Suspense } from "react";
import { publicApi, type HomeData } from "@/lib/api";
import PublicShell from "@/components/site-chrome";
import ContactClient from "./contact-client";

async function ContactContent() {
  const payload = await publicApi<HomeData>("/public/content/home");
  const school = payload?.data.school;

  return (
    <ContactClient
      school={
        school
          ? { nameBn: school.nameBn, address: school.address, eiin: school.eiin, foundedYear: school.foundedYear }
          : undefined
      }
    />
  );
}

function ContactLoading() {
  return <div className="contact-loading" aria-hidden="true" />;
}

export default function ContactPage() {
  return (
    <PublicShell>
      <div className="pbanner">
        <div className="container">
          <h2>
            <svg className="icon" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z" /></svg>
            যোগাযোগ
          </h2>
          <nav className="crumbs">
            <Link href="/">হোম</Link>
            <span className="sep">›</span>
            <span className="cur">যোগাযোগ</span>
          </nav>
        </div>
      </div>
      <div className="container page-body">
        <Suspense fallback={<ContactLoading />}>
          <ContactContent />
        </Suspense>
      </div>
    </PublicShell>
  );
}
