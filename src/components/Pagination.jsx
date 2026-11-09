export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const base = 'h-11 min-w-11 rounded-full border px-4 text-sm font-semibold disabled:opacity-40'
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Хуудаслалт">
      <button className={base + ' border-stone-300 bg-white'} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Өмнөх
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={base + (p === page ? ' border-brand bg-brand text-white' : ' border-stone-300 bg-white')}
        >
          {p}
        </button>
      ))}
      <button className={base + ' border-stone-300 bg-white'} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Дараах
      </button>
    </nav>
  )
}