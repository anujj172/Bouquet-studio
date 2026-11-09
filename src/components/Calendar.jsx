import { useState } from 'react'
import { MAX_DAYS, addDays, todayStr } from '../lib/schedule'

const DOW = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня']
const pad = (n) => String(n).padStart(2, '0')

export default function Calendar({ value, onChange }) {
  const today = todayStr()
  const last = addDays(today, MAX_DAYS)
  const [ym, setYm] = useState((value || today).slice(0, 7))
  const [y, m] = ym.split('-').map(Number)

  const first = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7 // Даваа гарагаас эхэлнэ
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]

  function shift(n) {
    const t = new Date(Date.UTC(y, m - 1 + n, 1))
    setYm(`${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`)
  }

  return (
    <div className="w-full max-w-xs rounded-3xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Өмнөх сар"
          disabled={ym <= today.slice(0, 7)}
          onClick={() => shift(-1)}
          className="h-9 w-9 rounded-full text-lg hover:bg-stone-100 disabled:opacity-30"
        >
          ‹
        </button>
        <b className="text-sm">{y} оны {m}-р сар</b>
        <button
          type="button"
          aria-label="Дараах сар"
          disabled={ym >= last.slice(0, 7)}
          onClick={() => shift(1)}
          className="h-9 w-9 rounded-full text-lg hover:bg-stone-100 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-stone-500">
        {DOW.map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />
          const ds = `${ym}-${pad(d)}`
          const disabled = ds < today || ds > last
          const selected = ds === value
          return (
            <button
              key={ds}
              type="button"
              disabled={disabled}
              onClick={() => onChange(ds)}
              className={
                'h-10 rounded-full text-sm ' +
                (selected
                  ? 'bg-brand font-bold text-white'
                  : disabled
                    ? 'cursor-not-allowed text-stone-300'
                    : ds === today
                      ? 'bg-blush/60 font-semibold hover:bg-blush'
                      : 'hover:bg-stone-100')
              }
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}