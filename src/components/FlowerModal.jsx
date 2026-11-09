import { useEffect } from 'react'
import { Droplets, Palette, X } from 'lucide-react'
import QtyStepper from './QtyStepper'
import { flowerColor } from '../lib/flowerColor'
import { formatMNT } from '../lib/format'

const COLOR_MN = {
  red: 'Улаан',
  pink: 'Ягаан',
  yellow: 'Шар',
  white: 'Цагаан',
  orange: 'Улбар шар',
  purple: 'Нил ягаан',
}

export default function FlowerModal({ flower, qty, onChange, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const out = flower.available <= 0
  const category = flower.category?.name ?? flower.categories?.name ?? ''
  const colorName = COLOR_MN[flower.color] ?? flower.color_name ?? flower.color ?? ''
  // ⚠️ арчилгааны талбарын нэрийг өөрийн хүснэгтээр шалгаарай
  const care = flower.care_tips ?? flower.care ?? flower.care_info ?? ''

  function handleAdd() {
    if (qty === 0) onChange(1)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={flower.name}
    >
      <div
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-cream md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Хаах"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-200"
        >
          <X size={20} strokeWidth={1.75} />
        </button>

        <div className="flex min-h-72 items-center justify-center bg-linear-to-br from-blush/40 to-blush/10 p-8">
          {flower.image_url ? (
            <img src={flower.image_url} alt={flower.name} className="max-h-96 w-full object-contain" />
          ) : (
            <span className="h-40 w-40 rounded-full" style={{ background: flowerColor(flower.color) }} />
          )}
        </div>

        <div className="flex flex-col p-8">
          {category && <p className="pr-10 text-xs font-semibold uppercase tracking-widest text-stone-500">{category}</p>}
          <h2 className="mt-2 font-serif text-4xl font-semibold">{flower.name}</h2>
          {flower.description && <p className="mt-2 text-stone-600">{flower.description}</p>}

          <div className="mt-5 space-y-3 text-[15px]">
            {colorName && (
              <p className="flex items-center gap-3">
                <Palette size={18} strokeWidth={1.75} className="shrink-0 text-brand" />
                Өнгө: {colorName}
              </p>
            )}
            {care && (
              <p className="flex items-start gap-3">
                <Droplets size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-brand" />
                {care}
              </p>
            )}
          </div>

          <div className="mt-auto pt-8">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 p-5">
              <div>
                <b className="text-2xl">{formatMNT(flower.unit_price)}</b>
                <p className="text-xs text-stone-500">
                  ширхэгийн үнэ · үлдэгдэл {flower.available}
                </p>
              </div>
              <QtyStepper qty={qty} max={flower.available} onChange={onChange} />
            </div>

            <button
              type="button"
              disabled={out}
              onClick={handleAdd}
              className="mt-4 w-full rounded-full bg-brand py-4 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {out ? 'Дууссан' : 'Баглаанд нэмэх'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}