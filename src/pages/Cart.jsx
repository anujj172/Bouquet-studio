import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import BouquetArt from '../components/BouquetArt'
import QtyStepper from '../components/QtyStepper'
import { useCart } from '../context/CartContext'
import { ACCESSORIES, WRAPPINGS } from '../lib/bouquetDesign'
import { formatMNT } from '../lib/format'

function details(item) {
  if (item.type === 'ready') return 'Бэлэн баглаа'
  const acc = ACCESSORIES.filter((a) => (item.accessories?.[a.id] ?? 0) > 0)
    .map((a) => `${a.name} × ${item.accessories[a.id]}`)
    .join(', ')
  const wrap = WRAPPINGS.find((w) => w.id === item.wrapping)?.name
  return [wrap, acc].filter(Boolean).join(' · ')
}

export default function Cart() {
  const cart = useCart()
  const navigate = useNavigate()

  const allSelected = cart.items.length > 0 && cart.selectedItems.length === cart.items.length
  const noneSelected = cart.selectedItems.length === 0

  function changeQty(item, q) {
    if (q <= 0) {
      if (window.confirm('Энэ баглааг сагснаас хасах уу?')) cart.remove(item.key)
      return
    }
    cart.setQty(item.key, q)
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-5xl font-semibold">Сагс</h1>
        <p className="mt-6 rounded-3xl border border-dashed border-stone-300 p-12 text-stone-600">
          Сагс хоосон байна.
        </p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-brand px-7 py-3.5 font-semibold text-white">
          Баглаа зохиох
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-5xl font-semibold">Сагс</h1>
        <button
          type="button"
          onClick={() => cart.selectAll(!allSelected)}
          className="text-sm font-semibold hover:text-brand"
        >
          {allSelected ? 'Сонголт арилгах' : 'Бүгдийг сонгох'}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          {cart.items.map((item) => {
            const selected = cart.isSelected(item)
            return (
              <li
                key={item.key}
                className={
                  'flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-2 transition ' +
                  (selected ? 'ring-brand/40' : 'opacity-70 ring-transparent')
                }
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  aria-label="Захиалахад сонгох"
                  onClick={() => cart.toggleSelect(item.key)}
                  className={
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ' +
                    (selected ? 'border-brand bg-brand text-white' : 'border-stone-300 bg-white')
                  }
                >
                  {selected && <Check size={16} strokeWidth={2.5} />}
                </button>

                <div className="w-28 shrink-0 self-start">
                  <BouquetArt
                    items={item.art ?? []}
                    fancy={item.fancy ?? item.wrapping === 'fancy'}
                    wrapColor={item.wrapColor}
                    ribbonColor={item.ribbonColor}
                    accessories={item.accessories}
                    hasCard={item.hasCard}
                    positions={item.positions}
                    eucalyptus={item.type === 'ready' ? 2 : 0}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col self-stretch">
                  <p className="text-xs font-semibold tracking-widest text-stone-500">
                    {item.type === 'ready' ? 'БЭЛЭН БАГЛАА' : 'ӨӨРИЙН БАГЛАА'}
                  </p>
                  <h2 className="font-serif text-2xl font-semibold">{item.name}</h2>
                  <p className="text-sm text-stone-600">{details(item)}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <QtyStepper qty={item.qty} max={10} onChange={(q) => changeQty(item, q)} />
                    <b className="text-lg">{formatMNT(item.unitPrice * item.qty)}</b>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Устгах"
                  onClick={() => changeQty(item, 0)}
                  className="h-9 w-9 shrink-0 self-start rounded-full text-xl text-stone-500 hover:bg-stone-100"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl font-semibold">Хураангуй</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">Сонгосон</span>
              <span>
                {cart.selectedItems.length} төрөл · {cart.selectedCount} ширхэг
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Барааны дүн</span>
              <span>{formatMNT(cart.selectedSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Хүргэлтийн хураамж</span>
              <span className="text-stone-500">Дараагийн алхамд</span>
            </div>
          </div>
          <div className="mt-5 flex items-baseline justify-between border-t border-stone-100 pt-5">
            <span className="font-semibold">Нийт</span>
            <b className="font-serif text-4xl">{formatMNT(cart.selectedSubtotal)}</b>
          </div>

          <button
            type="button"
            disabled={noneSelected}
            onClick={() => navigate('/checkout')}
            className="mt-5 block w-full rounded-full bg-brand py-3.5 text-center font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Захиалах 
          </button>
          {noneSelected && (
            <p className="mt-2 text-center text-xs text-stone-500">Захиалах баглаагаа сонгоно уу.</p>
          )}
          <Link to="/" className="mt-3 block text-center text-sm font-semibold text-stone-600 hover:text-ink">
            Дэлгүүр үргэлжлүүлэх
          </Link>
          <p className="mt-4 text-xs text-stone-500">Эцсийн үнийг захиалга үүсгэх үед сервер баталгаажуулна.</p>
        </aside>
      </div>
    </div>
  )
}