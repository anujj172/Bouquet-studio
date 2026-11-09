import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { FlaskConical, LoaderCircle, Smartphone, Timer } from 'lucide-react'
import StepIndicator from '../components/StepIndicator'
import { useCart } from '../context/CartContext'
import { fetchOrder, markOrderPaid } from '../services/orders'
import { formatMNT } from '../lib/format'

const BANKS = ['Хаан банк', 'Голомт', 'ХХБ', 'Төрийн банк', 'Хас банк', 'Капитрон']
const HOLD_MS = 15 * 60 * 1000
const pad = (n) => String(n).padStart(2, '0')

export default function Payment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const cart = useCart()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [left, setLeft] = useState(HOLD_MS)
  const [busy, setBusy] = useState(false)

  // Захиалга ачаалах + төлөгдсөн эсэхийг 3 секунд тутам шалгах
  useEffect(() => {
    let stop = false
    async function load() {
      const { data, error: err } = await fetchOrder(id)
      if (stop) return
      if (err || !data) return setError('Захиалга олдсонгүй.')
      setOrder(data)
      if (data.status === 'paid') {
        cart.removeSelected()
        navigate(`/success/${id}`, { replace: true })
      }
    }
    load()
    const t = setInterval(load, 3000)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [id, navigate, cart])

  // Тоолуур
  useEffect(() => {
    if (!order) return
    const end = new Date(order.expires_at ?? new Date(order.created_at).getTime() + HOLD_MS).getTime()
    const tick = () => setLeft(Math.max(0, end - Date.now()))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [order])

  async function simulatePaid() {
    setBusy(true)
    const { error: err } = await markOrderPaid(id)
    setBusy(false)
    if (err) return setError(err)
    cart.removeSelected()
    navigate(`/success/${id}`, { replace: true })
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</p>
        <Link to="/cart" className="mt-6 inline-block font-semibold text-brand">Сагс руу буцах</Link>
      </div>
    )
  }
  if (!order) return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-stone-500">Ачаалж байна...</div>

  const expired = left <= 0
  const mm = Math.floor(left / 60000)
  const ss = Math.floor((left % 60000) / 1000)
  const orderNo = order.order_number ?? order.id
  const qrValue = `qpay://pay?order=${orderNo}&amount=${order.total}` // sandbox: жинхэнэ QPay-ийн хэрэглэх холбоосоор солино

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-5xl font-semibold">Төлбөр</h1>
        <StepIndicator current={1} />
      </div>

      <div className="mt-8 grid overflow-hidden rounded-4xl bg-white shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Зүүн: QR */}
        <div className="flex flex-col items-center justify-center gap-6 bg-linear-to-b from-blush/30 to-blush/60 p-10">
          <div className={'rounded-3xl bg-white p-8 shadow-sm ' + (expired ? 'opacity-30' : '')}>
            <QRCodeSVG value={qrValue} size={220} fgColor="#16291f" bgColor="#ffffff" />
          </div>
          <p className="flex items-center gap-3 text-stone-700">
            <LoaderCircle size={18} className="animate-spin text-brand" />
            {expired ? 'Хугацаа дууссан' : 'Төлбөр хүлээж байна...'}
          </p>
        </div>

        {/* Баруун: мэдээлэл */}
        <div className="p-8 md:p-10">
          <p className="text-xs font-semibold tracking-widest text-stone-500">ТӨЛӨХ ДҮН</p>
          <p className="mt-2 font-serif text-6xl font-semibold">{formatMNT(order.total)}</p>
          <p className="mt-1 text-stone-600">
            Захиалгын дугаар: <b className="text-ink">{orderNo}</b>
          </p>

          <div className="mt-6 flex items-center gap-4 rounded-3xl bg-stone-100 p-5">
            <Timer size={22} strokeWidth={1.75} />
            <div>
              <p className="font-serif text-3xl font-semibold">{pad(mm)}:{pad(ss)}</p>
              <p className="text-sm text-stone-600">Энэ хугацаанд таны цэцэг хадгалагдана</p>
            </div>
          </div>

          <p className="mt-6 flex items-center gap-2 font-semibold">
            <Smartphone size={18} strokeWidth={1.75} />
            Утаснаас банкны аппаар төлөх
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {BANKS.map((b) => (
              <button
                key={b}
                type="button"
                disabled={expired}
                className="rounded-full border border-stone-300 py-3 text-sm font-semibold hover:bg-stone-50 disabled:opacity-40"
              >
                {b}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-dashed border-stone-300 p-4">
            <p className="flex items-center gap-2 text-sm text-stone-600">
              <FlaskConical size={16} strokeWidth={1.75} />
              Sandbox туршилт
            </p>
            <button
              type="button"
              disabled={busy || expired}
              onClick={simulatePaid}
              className="mt-3 w-full rounded-full bg-[#4f7a5a] py-3.5 font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              {busy ? 'Баталгаажуулж байна...' : 'Төлбөр төлөгдсөн гэж дуурайх'}
            </button>
          </div>

          {expired && (
            <Link to="/cart" className="mt-5 block text-center font-semibold text-brand">
              Сагс руу буцаж дахин захиалах
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}