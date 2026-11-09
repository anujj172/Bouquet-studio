export default function QtyStepper({ qty, max, onChange }) {
  const btn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-xl disabled:cursor-not-allowed disabled:opacity-40'
  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label="Хасах" className={btn} disabled={qty <= 0} onClick={() => onChange(qty - 1)}>
        −
      </button>
      <span className="min-w-6 text-center font-semibold">{qty}</span>
      <button type="button" aria-label="Нэмэх" className={btn} disabled={qty >= max} onClick={() => onChange(qty + 1)}>
        +
      </button>
    </div>
  )
}