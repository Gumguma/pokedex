export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-14 px-6 rounded-3xl border border-dashed border-line bg-white/60">
      <div className="w-14 h-14 rounded-2xl bg-brand-soft text-indigo-600 flex items-center justify-center mb-4">
        {icon ?? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M3 12h18M12 3v18" />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-extrabold text-slate-800 m-0">{title}</h3>
      {description && <p className="text-xs text-slate-400 font-medium mt-1.5 mb-0 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-secondary mt-5">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
