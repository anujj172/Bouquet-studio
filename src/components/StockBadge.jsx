export const LOW_STOCK = 10

export default function StockBadge({ available }) {
  if (available <= 0) {
    return <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-600">Дууссан</span>
  }
  if (available <= LOW_STOCK) {
    return <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">Цөөхөн үлдсэн ({available} ш)</span>
  }
  return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Хангалттай ({available} ш)</span>
}