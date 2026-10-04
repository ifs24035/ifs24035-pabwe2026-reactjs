export function StatusBadge({ status, className = '' }) {
  const isLost = status === 'lost';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isLost ? 'bg-rose-500' : 'bg-emerald-500'
        }`}
      />
      {isLost ? 'Hilang' : 'Ditemukan'}
    </span>
  );
}

export function CompletedBadge({ isCompleted, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
        isCompleted ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
      } ${className}`}
    >
      {isCompleted ? 'Selesai' : 'Proses'}
    </span>
  );
}