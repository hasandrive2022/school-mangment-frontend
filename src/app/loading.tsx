export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" className="public-page">
      <div className="public-page-inner loading-state">
        <span className="sr-only">পৃষ্ঠা লোড হচ্ছে</span>
        <div className="loading-bar loading-title" />
        <div className="loading-grid">
          <div className="loading-card" />
          <div className="loading-card" />
          <div className="loading-card" />
        </div>
      </div>
    </main>
  );
}
