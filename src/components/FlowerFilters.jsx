import { formatMNT } from '../lib/format'

const MAX_PRICE = 15000

const input =
  'w-full rounded-full border border-stone-200 bg-white px-5 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand/30'

const label = 'text-xs font-semibold tracking-widest text-stone-500'

export function SortSelect({ value, onChange }) {
  return (
    <select
      className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm shadow-sm outline-none"
      value={value}
      onChange={(e) => onChange({ sort: e.target.value })}
      aria-label="Эрэмбэ"
    >
      <option value="newest">Шинээр нэмэгдсэн</option>
      <option value="price_asc">Үнэ өсөхөөр</option>
      <option value="price_desc">Үнэ буурахаар</option>
      <option value="name">А-Я</option>
    </select>
  )
}

export default function FlowerFilters({ filters, categories, onChange }) {
  const maxValue = filters.maxPrice === '' ? MAX_PRICE : Number(filters.maxPrice)

  return (
    <div className="space-y-8">
      <div>
        <p className={label}>ХАЙЛТ</p>
        <input
          className={input + ' mt-3'}
          placeholder="Цэцгийн нэр..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <p className={label}>АНГИЛАЛ</p>
        <div className="mt-3 space-y-3">
          {categories.map((c) => {
            const active = filters.categoryId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange({ categoryId: active ? '' : c.id })}
                className="flex w-full items-center gap-3 text-left text-[15px]"
              >
                <span
                  className={
                    'flex h-5 w-5 items-center justify-center rounded-full border-2 ' +
                    (active ? 'border-brand' : 'border-brand/60')
                  }
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                </span>
                {c.name}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className={label}>ҮНИЙН ЗАВСАР</p>
        <input
          type="range"
          min="0"
          max={MAX_PRICE}
          step="500"
          value={maxValue}
          onChange={(e) => {
            const v = Number(e.target.value)
            onChange({ maxPrice: v >= MAX_PRICE ? '' : String(v) })
          }}
          className="mt-4 w-full accent-[#a84c63]"
        />
        <div className="mt-1 flex justify-between text-xs text-stone-500">
          <span>{formatMNT(0)}</span>
          <span>{formatMNT(maxValue)}</span>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between text-[15px]">
        Зөвхөн үлдэгдэлтэй
        <span className="relative inline-block h-6 w-11">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={filters.inStock}
            onChange={(e) => onChange({ inStock: e.target.checked })}
          />
          <span className="absolute inset-0 rounded-full bg-stone-300 transition peer-checked:bg-brand" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>
    </div>
  )
}