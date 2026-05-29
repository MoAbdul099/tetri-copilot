export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-7 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-tetri-text">{title}</h1>
        {subtitle && <p className="text-sm text-tetri-muted mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">{children}</div>}
    </div>
  );
}
