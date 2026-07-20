export default function DashboardPanel({ title, description, action, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-[10px] border border-[var(--almex-border)] bg-[var(--almex-surface)] ${className}`}>
      {(title || description || action) && (
        <div className="flex min-h-12 flex-col gap-2 border-b border-[var(--almex-border)] px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h3 className="text-[13px] font-semibold text-[var(--almex-text)]">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-[var(--almex-text-3)]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
