import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Sparkles } from 'lucide-react'
import BouquetArt from '../components/BouquetArt'
import Calendar from '../components/Calendar'
import StepIndicator from '../components/StepIndicator'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder, fetchCheckoutSettings } from '../services/orders'
import { formatMNT } from '../lib/format'
import {
  DEFAULT_LEAD,
  DELIVERY_SLOTS,
  dayHours,
  earliestPickup,
  slotReason,
  todayStr,
  toIso,
  validateSchedule,
} from '../lib/schedule'

const input =
  'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50'
const box = 'rounded-3xl bg-white p-6 shadow-sm md:p-8'
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)
const pad = (n) => String(n).padStart(2, '0')

function Label({ children, required }) {
  return (
    <span className="text-sm font-semibold">
      {children} {required && <span className="text-brand">*</span>}
    </span>
  )
}

export default function Checkout() {
  const { profile } = useAuth()
  const cart = useCart()
  const navigate = useNavigate()

  // Зөвхөн сагсан дахь сонгосон баглаанууд
  const items = cart.selectedItems
  const subtotal = cart.selectedSubtotal

  const [settings, setSettings] = useState(null)
  const [mode, setMode] = useState('delivery')
  const [f, setF] = useState(() => ({
    name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    district: '',
    address: '',
    date: '',
    slot: null,
    hh: '',
    mm: '',
    note: '',
    cardMessage: '',
    cardSender: profile?.full_name ?? '',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCheckoutSettings().then(setSettings)
  }, [])

  const set = (patch) => setF((p) => ({ ...p, ...patch }))

  const lead = settings?.lead ?? DEFAULT_LEAD
  const openHours = settings?.openHours
  const zones = settings?.zones ?? []
  const pickupLead = cart.hasCustom ? lead.custom_bouquet : lead.ready_bouquet
  const zone = zones.find((z) => z.district === f.district)
  const fee = mode === 'delivery' && zone ? zone.fee : 0
  const total = subtotal + fee

  // ---- Очиж авах цаг ----
  const earliest = earliestPickup(openHours, pickupLead)
  const dayInfo = f.date ? dayHours(openHours, f.date) : null
  const hourOptions = dayInfo
    ? Array.from({ length: Math.floor(dayInfo.close / 60) - Math.floor(dayInfo.open / 60) + 1 }, (_, i) => Math.floor(dayInfo.open / 60) + i)
    : []
  const pickupErr = (hh, mm) => validateSchedule({ date: f.date, hh, mm, openHours, leadMin: pickupLead })
  const hourOk = (h) => MINUTES.some((m) => !pickupErr(h, m))
  const minuteOptions = f.hh !== '' ? MINUTES.filter((m) => !pickupErr(Number(f.hh), m)) : []

  // ---- Хүргэлтийн цагийн интервал ----
  const slotInfos = f.date
    ? DELIVERY_SLOTS.map((s) => ({ s, reason: slotReason(f.date, s, openHours, lead.delivery) }))
    : []

  let scheduleError = null
  if (mode === 'delivery' && f.slot !== null) scheduleError = slotReason(f.date, f.slot, openHours, lead.delivery)
  if (mode === 'pickup' && f.hh !== '' && f.mm !== '') scheduleError = pickupErr(Number(f.hh), Number(f.mm))

  // ---- Дутуу талбарууд ----
  const phoneDigits = f.phone.replace(/\s/g, '')
  const missing = []
  if (!f.name.trim()) missing.push(mode === 'delivery' ? 'Хүлээн авагчийн нэр' : 'Нэр')
  if (!/^\d{8}$/.test(phoneDigits)) missing.push('Утас')
  if (mode === 'delivery') {
    if (!f.district) missing.push('Дүүрэг')
    if (!f.address.trim()) missing.push('Хаяг')
    if (!f.date) missing.push('Хүргэх өдөр')
    if (f.slot === null) missing.push('Цагийн интервал')
  } else {
    if (!f.date) missing.push('Авах өдөр')
    if (f.hh === '' || f.mm === '') missing.push('Цаг')
  }
  const canSubmit = !!settings && missing.length === 0 && !scheduleError && !submitting

  async function submit() {
    setSubmitting(true)
    setError('')
    const scheduledAt =
      mode === 'delivery' ? toIso(f.date, f.slot, 0) : toIso(f.date, Number(f.hh), Number(f.mm))
    const { data, error: err } = await createOrder(
      {
        fulfillment: mode,
        name: f.name.trim(),
        phone: phoneDigits,
        district: mode === 'delivery' ? f.district : null,
        address: mode === 'delivery' ? f.address.trim() : null,
        scheduledAt,
        note: f.note.trim(),
        cardMessage: cart.hasCard ? f.cardMessage.trim() : '',
        cardSender: cart.hasCard ? f.cardSender.trim() : '',
      },
      items
    )
    setSubmitting(false)
    if (err) {
      setError(err)
      return
    }
    navigate(`/pay/${data.id}`)
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-5xl font-semibold">Захиалга</h1>
        <p className="mt-6 rounded-3xl border border-dashed border-stone-300 p-12 text-stone-600">
          Захиалах баглаа сонгогдоогүй байна.
        </p>
        <Link to="/cart" className="mt-6 inline-block rounded-full bg-brand px-7 py-3.5 font-semibold text-white">
          Сагс руу буцах
        </Link>
      </div>
    )
  }

  const storeHours = openHours?.weekday ? `${openHours.weekday[0]}–${openHours.weekday[1]}` : '09:00–20:00'
  const todayLabel = (d) => (d === todayStr() ? 'өнөөдөр' : d)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-5xl font-semibold">Захиалга</h1>
        <StepIndicator current={0} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Хүлээн авах хэлбэр */}
          <div className="grid grid-cols-2 rounded-full bg-stone-200/60 p-1.5">
            {[
              ['delivery', 'Хүргүүлж авах'],
              ['pickup', 'Очиж авах'],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setMode(k)
                  set({ date: '', slot: null, hh: '', mm: '' })
                }}
                className={
                  'rounded-full py-3 text-sm font-semibold ' + (mode === k ? 'bg-white shadow-sm' : 'text-stone-600')
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* ХҮРГЭЛТ */}
          {mode === 'delivery' && (
            <div className={box}>
              <h2 className="font-serif text-3xl font-semibold">Хүргэлтийн мэдээлэл</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <Label required>Хүлээн авагчийн нэр</Label>
                  <input className={input + ' mt-2'} value={f.name} onChange={(e) => set({ name: e.target.value })} />
                </label>
                <label className="block">
                  <Label required>Хүлээн авагчийн утас</Label>
                  <input
                    className={input + ' mt-2'}
                    inputMode="numeric"
                    placeholder="9911 2233"
                    value={f.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                  />
                </label>
                <label className="block">
                  <Label required>Дүүрэг</Label>
                  <select className={input + ' mt-2'} value={f.district} onChange={(e) => set({ district: e.target.value })}>
                    <option value="">Сонгох</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.district}>
                        {z.district} — {formatMNT(z.fee)}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-stone-500">
                    {zone ? `Хүргэлтийн хураамж: ${formatMNT(zone.fee)}` : 'Хураамж дүүргээс хамаарна'}
                  </span>
                </label>
                <label className="block">
                  <Label required>Дэлгэрэнгүй хаяг</Label>
                  <input
                    className={input + ' mt-2'}
                    placeholder="Хороо, байр, орц, тоот"
                    value={f.address}
                    onChange={(e) => set({ address: e.target.value })}
                  />
                </label>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
                <div>
                  <Label required>Хүргэх өдөр</Label>
                  <div className="mt-2">
                    <Calendar value={f.date} onChange={(d) => set({ date: d, slot: null })} />
                  </div>
                </div>
                <div>
                  <Label required>Цагийн интервал</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {(f.date ? slotInfos : DELIVERY_SLOTS.map((s) => ({ s, reason: 'Өдрөө сонгоно уу' }))).map(({ s, reason }) => (
                      <button
                        key={s}
                        type="button"
                        disabled={!!reason}
                        title={reason ?? ''}
                        onClick={() => set({ slot: s })}
                        className={
                          'rounded-2xl border px-4 py-3.5 text-sm font-semibold ' +
                          (f.slot === s
                            ? 'border-brand bg-blush/50'
                            : reason
                              ? 'cursor-not-allowed border-stone-200 text-stone-300'
                              : 'border-stone-200 hover:bg-stone-50')
                        }
                      >
                        {pad(s)}:00–{pad(s + 2)}:00
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-stone-500">
                    {f.date ? 'Хамгийн ойрын хүргэлт: одооноос 2 цагийн дараа' : 'Эхлээд өдрөө сонгоно уу.'}
                  </p>
                </div>
              </div>

              <label className="mt-6 block">
                <Label>Нэмэлт тэмдэглэл</Label>
                <textarea
                  className={input + ' mt-2'}
                  rows={2}
                  placeholder="Жишээ нь: Ирэхээсээ өмнө залгана уу"
                  value={f.note}
                  onChange={(e) => set({ note: e.target.value })}
                />
              </label>
            </div>
          )}

          {/* ОЧИЖ АВАХ */}
          {mode === 'pickup' && (
            <div className={box}>
              <h2 className="font-serif text-3xl font-semibold">Дэлгүүрээс очиж авах</h2>
              <p className="mt-2 text-sm text-stone-600">
                Сүхбаатар дүүрэг, 1-р хороо · {storeHours} · Бэлтгэх хугацаа {pickupLead} минут
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <Label required>Таны нэр</Label>
                  <input className={input + ' mt-2'} value={f.name} onChange={(e) => set({ name: e.target.value })} />
                </label>
                <label className="block">
                  <Label required>Утас</Label>
                  <input
                    className={input + ' mt-2'}
                    inputMode="numeric"
                    placeholder="9911 2233"
                    value={f.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
                <div>
                  <Label required>Авах өдөр</Label>
                  <div className="mt-2">
                    <Calendar value={f.date} onChange={(d) => set({ date: d, hh: '', mm: '' })} />
                  </div>
                </div>
                <div>
                  <Label required>Цаг, минут</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <select
                      className={input + ' w-28'}
                      disabled={!f.date}
                      value={f.hh}
                      onChange={(e) => set({ hh: e.target.value, mm: '' })}
                      aria-label="Цаг"
                    >
                      <option value="">Цаг</option>
                      {hourOptions.map((h) => (
                        <option key={h} value={h} disabled={!hourOk(h)}>
                          {pad(h)}
                        </option>
                      ))}
                    </select>
                    <b>:</b>
                    <select
                      className={input + ' w-28'}
                      disabled={f.hh === ''}
                      value={f.mm}
                      onChange={(e) => set({ mm: e.target.value })}
                      aria-label="Минут"
                    >
                      <option value="">Мин</option>
                      {minuteOptions.map((m) => (
                        <option key={m} value={m}>
                          {pad(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">Минутыг 5 минутын алхмаар сонгоно</p>

                  {earliest && (
                    <button
                      type="button"
                      onClick={() => set({ date: earliest.date, hh: String(earliest.hh), mm: String(earliest.mm) })}
                      className="mt-4 flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-200"
                    >
                      <Sparkles size={16} strokeWidth={1.75} />
                      Хамгийн ойрын боломжит цаг: {todayLabel(earliest.date)} {pad(earliest.hh)}:{pad(earliest.mm)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {scheduleError && (
            <p className="rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-700">{scheduleError}</p>
          )}

          {/* МЭНДЧИЛГЭЭНИЙ КАРТ: сонгосон баглаанд карт байвал л гарна */}
          {cart.hasCard && (
            <div className={box}>
              <h2 className="font-serif text-3xl font-semibold">Мэндчилгээний карт</h2>
              <label className="mt-5 block">
                <Label>Бичвэр</Label>
                <textarea
                  className={input + ' mt-2'}
                  rows={3}
                  maxLength={200}
                  placeholder="Төрсөн өдрийн мэнд хүргэе..."
                  value={f.cardMessage}
                  onChange={(e) => set({ cardMessage: e.target.value })}
                />
                <span className="mt-1 block text-xs text-stone-500">{f.cardMessage.length}/200</span>
              </label>
              <label className="mt-4 block">
                <Label>Илгээгчийн нэр</Label>
                <input
                  className={input + ' mt-2'}
                  maxLength={60}
                  value={f.cardSender}
                  onChange={(e) => set({ cardSender: e.target.value })}
                />
              </label>
            </div>
          )}
        </div>

        {/* ЗАХИАЛГЫН ХУРААНГУЙ */}
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl font-semibold">Захиалгын хураангуй</h2>
          <ul className="mt-5 space-y-4">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3">
                <span className="w-14 shrink-0">
                  <BouquetArt
                    items={i.art ?? []}
                    fancy={i.fancy ?? i.wrapping === 'fancy'}
                    wrapColor={i.wrapColor}
                    ribbonColor={i.ribbonColor}
                    accessories={i.accessories}
                    hasCard={i.hasCard}
                    positions={i.positions}
                    eucalyptus={i.type === 'ready' ? 2 : 0}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{i.name}</span>
                  <span className="text-xs text-stone-500">× {i.qty}</span>
                </span>
                <b className="text-sm">{formatMNT(i.unitPrice * i.qty)}</b>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-stone-100 pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">Барааны дүн</span>
              <span>{formatMNT(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Хүргэлтийн хураамж</span>
              <span>{mode === 'pickup' ? 'Үнэгүй' : zone ? formatMNT(fee) : '—'}</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-semibold">Нийт</span>
            <b className="font-serif text-4xl">{formatMNT(total)}</b>
          </div>

          {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Lock size={18} strokeWidth={1.75} />
            {submitting ? 'Захиалга үүсгэж байна...' : 'Төлбөр төлөх'}
          </button>

          {missing.length > 0 && (
            <p className="mt-3 text-xs text-stone-600">
              Дутуу: <b className="text-ink">{missing.join(', ')}</b>
            </p>
          )}
          <p className="mt-3 text-center text-xs text-stone-500">QPay-ээр аюулгүй төлнө · Нөөц 15 минут хадгалагдана</p>
        </aside>
      </div>
    </div>
  )
}