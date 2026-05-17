export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-tetri-text">{title}</h1>
        {subtitle && <p className="text-sm text-tetri-muted mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
    </div>
  );
}
