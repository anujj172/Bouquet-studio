import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBouquet } from '../context/BouquetContext'
import { fetchCheckoutSettings } from '../services/orders'
import {
  deleteAddress,
  deleteSavedBouquet,
  fetchAddresses,
  fetchMyOrders,
  fetchSavedBouquets,
  saveAddress,
  setDefaultAddress,
  updateProfile,
} from '../services/profile'
import { formatMNT } from '../lib/format'

const TABS = [
  ['orders', 'Захиалгууд'],
  ['bouquets', 'Баглаанууд'],
  ['profile', 'Профайл'],
]
const DESIGN_KEY = 'bouquet_design_v1'
const FALLBACK_DISTRICTS = ['Сүхбаатар', 'Чингэлтэй', 'Баянгол', 'Баянзүрх', 'Хан-Уул', 'Сонгинохайрхан']

const card = 'rounded-4xl bg-white p-8 shadow-sm'
const input =
  'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-brand/30 disabled:bg-stone-50 disabled:text-stone-400'

const STATUS = {
  pending: ['Төлбөр хүлээгдэж буй', 'bg-amber-100 text-amber-800'],
  paid: ['Төлөгдсөн', 'bg-green-100 text-green-800'],
  preparing: ['Бэлтгэж байна', 'bg-blue-100 text-blue-800'],
  delivering: ['Хүргэлтэнд гарсан', 'bg-blue-100 text-blue-800'],
  completed: ['Дууссан', 'bg-stone-200 text-stone-700'],
  cancelled: ['Цуцлагдсан', 'bg-red-100 text-red-700'],
  expired: ['Хугацаа дууссан', 'bg-stone-200 text-stone-600'],
}

const fmtDate = (s) => {
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* ───────────── Захиалгууд ───────────── */
function OrdersTab({ userId }) {
  const [state, setState] = useState({ loading: true, rows: [], error: null })

  useEffect(() => {
    let off = false
    fetchMyOrders(userId).then((r) => !off && setState({ loading: false, rows: r.data, error: r.error }))
    return () => {
      off = true
    }
  }, [userId])

  if (state.loading) return <p className="text-stone-500">Ачаалж байна...</p>
  if (state.error) return <p className="rounded-2xl bg-red-50 p-5 text-red-700">{state.error}</p>
  if (state.rows.length === 0) {
    return (
      <div className={card + ' text-center'}>
        <p className="text-stone-600">Танд одоогоор захиалга байхгүй байна.</p>
        <Link to="/ready" className="mt-5 inline-block rounded-full bg-brand px-7 py-3 font-semibold text-white">
          Бэлэн баглаа үзэх
        </Link>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {state.rows.map((o) => {
        const [text, cls] = STATUS[o.status] ?? [o.status ?? '—', 'bg-stone-200 text-stone-700']
        const href = o.status === 'pending' ? `/pay/${o.id}` : `/success/${o.id}`
        return (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm">
            <div>
              <p className="font-semibold">{o.order_number ?? o.id}</p>
              <p className="text-sm text-stone-500">
                {fmtDate(o.created_at)} · {o.fulfillment === 'delivery' ? 'Хүргэлт' : 'Очиж авах'}
              </p>
            </div>
            <span className={'rounded-full px-3 py-1 text-xs font-semibold ' + cls}>{text}</span>
            <b className="text-lg">{formatMNT(o.total)}</b>
            <Link to={href} className="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold hover:bg-stone-50">
              {o.status === 'pending' ? 'Төлбөр төлөх' : 'Дэлгэрэнгүй'}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/* ───────────── Баглаанууд ───────────── */
function BouquetsTab({ userId }) {
  const bouquet = useBouquet()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, rows: [], error: null })

  const load = useCallback(async () => {
    const r = await fetchSavedBouquets(userId)
    setState({ loading: false, rows: r.data, error: r.error })
  }, [userId])

  useEffect(() => {
    let off = false
    fetchSavedBouquets(userId).then((r) => !off && setState({ loading: false, rows: r.data, error: r.error }))
    return () => {
      off = true
    }
  }, [userId])

  function open(b) {
    bouquet.replaceAll(b.items)
    try {
      localStorage.setItem(DESIGN_KEY, JSON.stringify(b.design))
    } catch {
      /* үл тоомсорлоно */
    }
    navigate('/#my-bouquet')
  }

  async function remove(b) {
    if (!window.confirm(`"${b.name}" баглааг устгах уу?`)) return
    await deleteSavedBouquet(b.id)
    load()
  }

  if (state.loading) return <p className="text-stone-500">Ачаалж байна...</p>
  if (state.error) return <p className="rounded-2xl bg-red-50 p-5 text-red-700">{state.error}</p>
  if (state.rows.length === 0) {
    return (
      <div className={card + ' text-center'}>
        <p className="text-stone-600">Хадгалсан баглаа байхгүй байна. "Миний баглаа" дээр зохиогоод "Хадгалах" дарна уу.</p>
        <Link to="/#my-bouquet" className="mt-5 inline-block rounded-full bg-brand px-7 py-3 font-semibold text-white">
          Баглаа зохиох
        </Link>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {state.rows.map((b) => (
        <li key={b.id} className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-serif text-2xl font-semibold">{b.name}</h3>
              <p className="mt-1 text-sm text-stone-600">
                {b.items.map((i) => `${i.name} × ${i.qty}`).join(' · ')}
              </p>
              <p className="mt-1 text-xs text-stone-400">{fmtDate(b.created_at)}</p>
            </div>
            <b>{formatMNT(b.total)}</b>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => open(b)} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              Нээх
            </button>
            <button type="button" onClick={() => remove(b)} className="flex items-center gap-1 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50">
              <Trash2 size={15} strokeWidth={1.75} /> Устгах
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ───────────── Хаяг нэмэх / засах ───────────── */
function AddressModal({ initial, districts, onClose, onSave }) {
  const [a, setA] = useState(
    initial ?? { label: 'Гэр', district: '', address: '', is_default: false }
  )
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (p) => setA((x) => ({ ...x, ...p }))
  const ok = a.label.trim() && a.district && a.address.trim()

  async function submit(e) {
    e.preventDefault()
    if (!ok) return
    setBusy(true)
    const msg = await onSave(a)
    setBusy(false)
    if (msg) setErr(msg)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-4xl bg-cream p-7">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-3xl font-semibold">{a.id ? 'Хаяг засах' : 'Хаяг нэмэх'}</h3>
          <button type="button" aria-label="Хаах" onClick={onClose} className="rounded-full p-2 hover:bg-stone-200">
            <X size={20} />
          </button>
        </div>

        <label className="mt-5 block text-sm font-semibold">
          Нэр
          <input className={input + ' mt-1.5 font-normal'} maxLength={30} placeholder="Гэр, Ажил..." value={a.label} onChange={(e) => set({ label: e.target.value })} />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Дүүрэг
          <select className={input + ' mt-1.5 font-normal'} value={a.district} onChange={(e) => set({ district: e.target.value })}>
            <option value="">Сонгох</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Дэлгэрэнгүй хаяг
          <input className={input + ' mt-1.5 font-normal'} placeholder="Хороо, байр, орц, тоот" value={a.address} onChange={(e) => set({ address: e.target.value })} />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={a.is_default} onChange={(e) => set({ is_default: e.target.checked })} />
          Үндсэн хаяг болгох
        </label>

        {err && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}

        <button type="submit" disabled={!ok || busy} className="mt-6 w-full rounded-full bg-brand py-3.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-40">
          {busy ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </form>
    </div>
  )
}

/* ───────────── Профайл + Хаягийн дэвтэр ───────────── */
function ProfileTab({ user, profile, refresh }) {
  const [name, setName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)

  const [addresses, setAddresses] = useState([])
  const [districts, setDistricts] = useState(FALLBACK_DISTRICTS)
  const [modal, setModal] = useState(null) // null | 'new' | address

  const loadAddresses = useCallback(async () => {
    const r = await fetchAddresses(user.id)
    setAddresses(r.data)
  }, [user.id])

  useEffect(() => {
    let off = false
    fetchAddresses(user.id).then((r) => !off && setAddresses(r.data))
    fetchCheckoutSettings().then((s) => {
      const list = (s?.zones ?? []).map((z) => z.district)
      if (!off && list.length) setDistricts(list)
    })
    return () => {
      off = true
    }
  }, [user.id])

  const phoneDigits = phone.replace(/\s/g, '')
  const phoneOk = phoneDigits === '' || /^\d{8}$/.test(phoneDigits)
  const canSave = name.trim() && phoneOk && !saving

  async function handleSave(e) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setMsg({ type: '', text: '' })
    const { error } = await updateProfile(user.id, { full_name: name.trim(), phone: phoneDigits })
    setSaving(false)
    if (error) return setMsg({ type: 'err', text: error })
    await refresh?.()
    setMsg({ type: 'ok', text: 'Амжилттай хадгалагдлаа.' })
  }

  async function handleSaveAddress(a) {
    const { error } = await saveAddress(user.id, a)
    if (error) return error
    setModal(null)
    loadAddresses()
    return null
  }

  async function makeDefault(a) {
    await setDefaultAddress(user.id, a.id)
    loadAddresses()
  }

  async function remove(a) {
    if (!window.confirm(`"${a.label}" хаягийг устгах уу?`)) return
    await deleteAddress(a.id)
    loadAddresses()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Хувийн мэдээлэл */}
      <form onSubmit={handleSave} className={card}>
        <h2 className="font-serif text-3xl font-semibold">Хувийн мэдээлэл</h2>

        <label className="mt-6 block text-sm font-semibold">
          Овог нэр <span className="text-brand">*</span>
          <input className={input + ' mt-2 font-normal'} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="mt-5 block text-sm font-semibold">
          Утас <span className="text-brand">*</span>
          <input
            className={input + ' mt-2 font-normal'}
            inputMode="numeric"
            placeholder="9911 2233"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {!phoneOk && <span className="mt-1 block text-xs font-normal text-red-600">Утас 8 оронтой тоо байх ёстой.</span>}
        </label>
        <label className="mt-5 block text-sm font-semibold">
          И-мэйл
          <input className={input + ' mt-2 font-normal'} value={user.email ?? ''} disabled />
        </label>

        {msg.text && (
          <p className={'mt-5 rounded-2xl px-4 py-3 text-sm ' + (msg.type === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700')}>
            {msg.text}
          </p>
        )}

        <button type="submit" disabled={!canSave} className="mt-6 rounded-full bg-brand px-8 py-3.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-40">
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </form>

      {/* Хаягийн дэвтэр */}
      <section className={card}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl font-semibold">Хаягийн дэвтэр</h2>
          <button type="button" onClick={() => setModal('new')} className="flex items-center gap-1.5 rounded-full bg-blush px-4 py-2 text-sm font-semibold hover:bg-blush/70">
            <Plus size={16} /> Нэмэх
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
            Хаяг хадгалаагүй байна.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {addresses.map((a) => (
              <li
                key={a.id}
                className={
                  'flex items-start gap-3 rounded-3xl border p-4 ' +
                  (a.is_default ? 'border-brand/50 bg-blush/40' : 'border-stone-200')
                }
              >
                <MapPin size={18} className="mt-1 shrink-0 text-brand" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold">
                    {a.label}
                    {a.is_default && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">Үндсэн</span>}
                  </p>
                  <p className="text-stone-600">{a.district}, {a.address}</p>
                </div>
                <div className="flex shrink-0 items-center">
                  {!a.is_default && (
                    <button type="button" aria-label="Үндсэн болгох" title="Үндсэн болгох" onClick={() => makeDefault(a)} className="rounded-full p-2 hover:bg-white">
                      <Star size={18} strokeWidth={1.75} />
                    </button>
                  )}
                  <button type="button" aria-label="Засах" onClick={() => setModal(a)} className="rounded-full p-2 hover:bg-white">
                    <Pencil size={18} strokeWidth={1.75} />
                  </button>
                  <button type="button" aria-label="Устгах" onClick={() => remove(a)} className="rounded-full p-2 hover:bg-white">
                    <Trash2 size={18} strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modal && (
        <AddressModal
          initial={modal === 'new' ? null : modal}
          districts={districts}
          onClose={() => setModal(null)}
          onSave={handleSaveAddress}
        />
      )}
    </div>
  )
}

/* ───────────── Хуудас ───────────── */
export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'orders'
  const name = profile?.full_name || user?.email?.split('@')[0] || ''

  if (!user) return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Сайн байна уу, {name}</p>
      <h1 className="font-serif text-6xl font-semibold">Миний хэсэг</h1>

      <div className="mt-8 inline-flex rounded-full bg-stone-200/60 p-1.5">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setParams({ tab: k })}
            className={'rounded-full px-7 py-3 font-semibold ' + (tab === k ? 'bg-white shadow-sm' : 'text-stone-600')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'orders' && <OrdersTab userId={user.id} />}
        {tab === 'bouquets' && <BouquetsTab userId={user.id} />}
        {tab === 'profile' && <ProfileTab user={user} profile={profile} refresh={refreshProfile} />}
      </div>
    </div>
  )
}