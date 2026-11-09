import FlowerThumb from './FlowerThumb'
import QtyStepper from './QtyStepper'
import { formatMNT } from '../lib/format'

const COLOR_MN = {
  red: 'Улаан',
  pink: 'Ягаан',
  yellow: 'Шар',
  white: 'Цагаан',
  orange: 'Улбар шар',
  purple: 'Нил ягаан',
}

export default function FlowerCard({ flower, qty, onChange, onOpen }) {
  const out = flower.available <= 0
  const low = !out && flower.available <= 5

  const categoryName = flower.category?.name ?? flower.categories?.name ?? ''
  const colorName = COLOR_MN[flower.color] ?? flower.color_name ?? ''
  const subtitle = [categoryName, colorName].filter(Boolean).join(' · ')

  return (
    <article
      onClick={() => onOpen?.(flower)}
      className={
        'flex cursor-pointer flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 transition hover:shadow-md ' +
        (qty > 0 ? 'ring-brand' : 'ring-stone-100') +
        (out ? ' opacity-60' : '')
      }
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-linear-to-b from-blush/60 to-blush/20">
        <span
          className={
            'absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold ' +
            (out ? 'bg-stone-400 text-white' : low ? 'bg-brand text-white' : 'bg-white/80 text-ink')
          }
        >
          {out ? 'Дууссан' : low ? `Цөөхөн: ${flower.available}` : `Үлдэгдэл: ${flower.available}`}
        </span>

        {qty > 0 && (
          <span className="absolute bottom-3 right-3 z-10 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
            Баглаанд: {qty}
          </span>
        )}

        <FlowerThumb flower={flower} />
      </div>

      <h3 className="mt-4 font-serif text-xl font-semibold">{flower.name}</h3>
      {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}

      <p className="mt-3 text-sm text-stone-600">
        1 ширхэг: <b className="text-ink">{formatMNT(flower.unit_price)}</b>
      </p>

      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <QtyStepper qty={qty} max={flower.available} onChange={onChange} />
      </div>
    </article>
  )
}