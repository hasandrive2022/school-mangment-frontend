function Line({ className = "" }: { className?: string }) {
  return <div className={`loading-bar ${className}`} aria-hidden="true" />;
}

function CardGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="loading-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => <div className="loading-card" key={index} />)}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="page-skeleton results-skeleton">
      <div className="skeleton-toolbar"><Line className="skeleton-short" /><Line className="skeleton-control" /></div>
      <div className="skeleton-table" aria-hidden="true">
        <Line className="skeleton-table-head" />
        {Array.from({ length: 7 }, (_, index) => <Line className="skeleton-row" key={index} />)}
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="page-skeleton form-skeleton">
      <Line className="loading-title" />
      <Line className="skeleton-lead" />
      <div className="skeleton-form-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => <Line className="skeleton-field" key={index} />)}
      </div>
      <Line className="skeleton-button" />
    </div>
  );
}

export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" className="public-page">
      <div className="public-page-inner loading-state">
        <span className="sr-only">পৃষ্ঠা লোড হচ্ছে</span>
        <Line className="loading-title" />
        <Line className="skeleton-lead" />
        <CardGrid count={3} />
      </div>
    </main>
  );
}
