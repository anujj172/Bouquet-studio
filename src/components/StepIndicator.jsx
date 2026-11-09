const STEPS = ['Мэдээлэл', 'Төлбөр', 'Баталгаа']

export default function StepIndicator({ current }) {
  return (
    <ol className="flex items-center gap-3 text-sm font-semibold">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-3">
          <span
            className={
              'flex h-9 w-9 items-center justify-center rounded-full ' +
              (i < current
                ? 'bg-green-700 text-white'
                : i === current
                  ? 'bg-brand text-white ring-4 ring-brand/20'
                  : 'bg-stone-200 text-stone-600')
            }
          >
            {i < current ? '✓' : i + 1}
          </span>
          <span className={i === current ? 'text-ink' : 'text-stone-500'}>{s}</span>
          {i < STEPS.length - 1 && <span className="hidden h-px w-12 bg-stone-300 sm:block" />}
        </li>
      ))}
    </ol>
  )
}