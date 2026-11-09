import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import StepIndicator from '../components/StepIndicator'
import { fetchOrder } from '../services/orders'
import { formatMNT } from '../lib/format'

const DAYS = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба']
const pad = (n) => String(n).padStart(2, '0')

function formatWhen(order) {
  const d = new Date(order.scheduled_at)
  if (Number.isNaN(d.getTime())) return '—'
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} (${DAYS[d.getDay()]})`
  const start = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (order.fulfillment === 'delivery') {
    const end = `${pad(d.getHours() + 2)}:00`
    return `${date} ${start}–${end}`
  }
  return `${date} ${start}`
}

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    fetchOrder(id).then(({ data }) => setOrder(data))
  }, [id])

  if (!order) return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-stone-500">Ачаалж байна...</div>

  const image = order.preview_image_url ?? null // захиалгын зураг байвал харуулна
  const delivery = order.fulfillment === 'delivery'

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex justify-end">
        <StepIndicator current={2} />
      </div>

      <div className="mx-auto mt-6 grid max-w-5xl gap-8 rounded-4xl bg-white p-8 shadow-sm md:grid-cols-[1fr_auto] md:p-12">
        <div>
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-green-700 text-green-700">
            <Check size={30} strokeWidth={3} />
          </span>
          <h1 className="mt-6 font-serif text-5xl font-semibold">Баярлалаа!</h1>
          <p className="mt-2 text-stone-600">Таны төлбөр амжилттай. Флорист таны баглааг бэлтгэж эхэлнэ.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-stone-100 p-5">
              <p className="text-xs font-semibold tracking-widest text-stone-500">ЗАХИАЛГЫН ДУГААР</p>
              <p className="mt-1 font-semibold">{order.order_number ?? order.id}</p>
            </div>
            <div className="rounded-3xl bg-stone-100 p-5">
              <p className="text-xs font-semibold tracking-widest text-stone-500">ТӨЛСӨН ДҮН</p>
              <p className="mt-1 font-semibold">{formatMNT(order.total)}</p>
            </div>
            <div className="rounded-3xl bg-stone-100 p-5 sm:col-span-2">
              <p className="text-xs font-semibold tracking-widest text-stone-500">
                {delivery ? 'ХҮРГЭХ ЦАГ' : 'АВАХ ЦАГ'}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold">{formatWhen(order)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/profile" className="rounded-full bg-brand px-7 py-3.5 font-semibold text-white hover:bg-brand-dark">
              Захиалгаа харах
            </Link>
            <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              Төлөгдсөн
            </span>
          </div>
        </div>

        {image && (
          <div className="hidden w-80 overflow-hidden rounded-3xl bg-blush/40 md:block">
            <img src={image} alt="Таны баглаа" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}