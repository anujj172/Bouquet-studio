import BouquetArt from './BouquetArt'
import { formatMNT } from '../lib/format'

export default function ReadyBouquetCard({ bouquet, onOpen }) {
  const fancy = bouquet.wrapping?.name === 'Гоёлын боолт'
  const items = bouquet.items.map((i) => ({
    id: i.flower.id,
    color: i.flower.color,
    image: i.flower.bouquet_image_url || i.flower.image_url,
    qty: i.qty,
  }))
  const soldOut = bouquet.available <= 0

  return (
    <button
      type="button"
      onClick={() => onOpen(bouquet)}
      className={'group block w-full min-w-0 text-left ' + (soldOut ? 'opacity-60' : '')}
    >
      <div className="flex w-full justify-center overflow-hidden rounded-3xl bg-linear-to-b from-blush/30 to-blush/70 p-4 transition group-hover:shadow-lg">
        <div className="w-full max-w-72">
          <BouquetArt
            items={items}
            fancy={fancy}
            accessories={bouquet.accessories}
            hasCard={(bouquet.accessories?.card ?? 0) > 0}
            className="w-full bg-transparent"
          />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-2xl font-semibold">{bouquet.name}</h3>
        <b className="shrink-0">{formatMNT(bouquet.price)}</b>
      </div>
      <p className="text-sm text-stone-600">{bouquet.description}</p>
    </button>
  )
}