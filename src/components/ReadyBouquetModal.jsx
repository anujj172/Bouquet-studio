import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BouquetArt from './BouquetArt'
import { PencilIcon } from './Icons'
import { useCart } from '../context/CartContext'
import { flowerColor } from '../lib/flowerColor'
import { formatMNT } from '../lib/format'

export default function ReadyBouquetModal({ bouquet, onClose, onEdit }) {
  const cart = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const soldOut = bouquet.available <= 0
  const fancy = bouquet.wrapping?.name === 'Гоёлын боолт'
  const artItems = bouquet.items.map((i) => ({
    id: i.flower.id,
    color: i.flower.color,
    image: i.flower.bouquet_image_url || i.flower.image_url,
    qty: i.qty,
  }))

  function addToCart(next) {
    cart.addItem({
      type: 'ready',
      bouquetId: bouquet.id,
      name: bouquet.name,
      qty: 1,
      unitPrice: bouquet.price,
      art: artItems,
      fancy,
      hasCard: (bouquet.accessories?.card ?? 0) > 0,
      accessories: bouquet.accessories ?? {},
    })
    onClose()
    navigate(next)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={bouquet.name}
    >
      <div
        className="relative isolate grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-cream md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Зүүн: зураг (өргөн нь хязгаарлагдсан) */}
        <div className="flex min-w-0 items-center justify-center bg-linear-to-b from-blush/40 to-blush/80 p-6">
          <div className="w-full max-w-xs">
            <BouquetArt
              items={artItems}
              fancy={fancy}
              accessories={bouquet.accessories}
              hasCard={(bouquet.accessories?.card ?? 0) > 0}
              className="bg-transparent"
            />
          </div>
        </div>

        {/* Баруун: мэдээлэл */}
        <div className="flex min-w-0 flex-col p-8">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold tracking-widest text-stone-500">БЭЛЭН БАГЛАА</p>
            <button
              onClick={onClose}
              aria-label="Хаах"
              className="flex h-10 w-10 items-center justify-center rounded-full text-2xl hover:bg-stone-200"
            >
              ×
            </button>
          </div>
          <h2 className="mt-1 font-serif text-4xl font-semibold">{bouquet.name}</h2>
          <p className="text-stone-600">{bouquet.description}</p>

          <p className="mt-6 text-xs font-semibold tracking-widest text-stone-500">НАЙРЛАГА</p>
          <ul className="mt-2 space-y-2">
            {bouquet.items.map((i) => (
              <li key={i.flower.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  {i.flower.image_url ? (
                    <img src={i.flower.image_url} alt="" className="h-8 w-8 object-contain" />
                  ) : (
                    <span
                      className="inline-block h-4 w-4 rounded-full"
                      style={{ background: flowerColor(i.flower.color) }}
                    />
                  )}
                  {i.flower.name} × {i.qty}
                </span>
                <span className="text-stone-600">{formatMNT(i.flower.unit_price * i.qty)}</span>
              </li>
            ))}
            {bouquet.wrapping && (
              <li className="flex justify-between text-sm text-stone-600">
                <span>+ {bouquet.wrapping.name}</span>
                <span>{formatMNT(bouquet.wrapping.price)}</span>
              </li>
            )}
            {bouquet.extra_price > 0 && (
              <li className="flex justify-between text-sm text-stone-600">
                <span>+ Флористийн ажил</span>
                <span>{formatMNT(bouquet.extra_price)}</span>
              </li>
            )}
          </ul>

          <div className="mt-auto pt-8">
            <p className="font-serif text-4xl font-semibold">{formatMNT(bouquet.price)}</p>
            {soldOut && (
              <p className="mt-2 text-sm text-orange-700">Зарим цэцгийн үлдэгдэл хүрэлцэхгүй тул түр дууссан.</p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={soldOut}
                onClick={() => addToCart('/cart')}
                className="rounded-full bg-[#a84c63] py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Сагсанд нэмэх
              </button>
              <button
                type="button"
                disabled={soldOut}
                onClick={() => addToCart('/checkout')}
                className="rounded-full bg-[#1f3a2b] py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Захиалах
              </button>
              <button
                type="button"
                onClick={() => onEdit(bouquet)}
                className="col-span-2 flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white py-3 font-semibold hover:bg-stone-100"
              >
                <PencilIcon />
                Засварлаж захиалах
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}