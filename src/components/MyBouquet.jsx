import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flower, Heart, Leaf, Mail, Ribbon, ShoppingBag, Trash2, X } from 'lucide-react'
import BouquetCanvas from './BouquetCanvas'
import QtyStepper from './QtyStepper'
import { useBouquet } from '../context/BouquetContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { saveBouquet } from '../services/profile'
import { flowerColor } from '../lib/flowerColor'
import { formatMNT } from '../lib/format'
import {
  ACCESSORIES,
  DEFAULT_WRAP_COLOR,
  RIBBON_COLORS,
  WRAPPINGS,
  WRAP_COLORS,
  buildStems,
} from '../lib/bouquetDesign'

const KEY = 'bouquet_design_v1'
const DEFAULT = {
  acc: {},
  wrappingId: 'simple',
  wrapColor: DEFAULT_WRAP_COLOR,
  ribbonColor: RIBBON_COLORS[0],
  positions: {},
}

const ACC_ICONS = { leaf: Leaf, flower: Flower, ribbon: Ribbon, mail: Mail }

function load() {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULT
  }
}

const card = 'rounded-3xl bg-white p-6 shadow-sm'
const heading = 'font-serif text-2xl font-semibold'

export default function MyBouquet({ onQty }) {
  const bouquet = useBouquet()
  const { user } = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const [design, setDesign] = useState(load)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(design))
    } catch {
      /* үл тоомсорлоно */
    }
  }, [design])

  const stems = useMemo(() => buildStems(bouquet.items, design.acc), [bouquet.items, design.acc])
  const wrap = WRAPPINGS.find((w) => w.id === design.wrappingId) ?? WRAPPINGS[0]
  const isFancy = wrap.id === 'fancy'
  const hasFlowers = bouquet.items.length > 0

  const accLines = ACCESSORIES.filter((a) => (design.acc[a.id] ?? 0) > 0).map((a) => ({
    ...a,
    qty: design.acc[a.id],
    total: a.price * design.acc[a.id],
  }))
  const total = hasFlowers ? bouquet.flowersTotal + accLines.reduce((s, a) => s + a.total, 0) + wrap.price : 0

  function setAcc(id, qty) {
    setDesign((d) => {
      const acc = { ...d.acc }
      if (qty <= 0) delete acc[id]
      else acc[id] = qty
      return { ...d, acc }
    })
  }
  const movePos = (key, pos) => setDesign((d) => ({ ...d, positions: { ...d.positions, [key]: pos } }))
  const resetPositions = () => setDesign((d) => ({ ...d, positions: {} }))

  function handleClear() {
    if (window.confirm('Баглааг бүхэлд нь арилгах уу?')) {
      bouquet.clear()
      setDesign(DEFAULT)
    }
  }

  function handleAddToCart() {
    cart.addItem({
      type: 'custom',
      name: `Миний баглаа (${bouquet.count} ширхэг)`,
      qty: 1,
      unitPrice: total,
      art: bouquet.items.map((i) => ({
        id: i.id,
        color: i.color,
        image: i.bouquet_image_url || i.image_url,
        qty: i.qty,
      })),
      fancy: isFancy,
      wrapping: wrap.id,
      wrapColor: design.wrapColor,
      ribbonColor: design.ribbonColor,
      accessories: design.acc,
      hasCard: (design.acc.card ?? 0) > 0,
      positions: design.positions,
    })
    navigate('/cart')
  }

  async function handleSave() {
    if (!user) return navigate('/login')
    const name = window.prompt('Баглаандаа нэр өгнө үү', `Миний баглаа (${bouquet.count} ширхэг)`)
    if (!name?.trim()) return
    const { error } = await saveBouquet(user.id, { name, items: bouquet.items, design, total })
    setSaveMsg(error ?? 'Баглаа хадгалагдлаа. Профайл → Баглаанууд хэсгээс харна уу.')
    setTimeout(() => setSaveMsg(''), 4000)
  }

  return (
    <section id="my-bouquet" className="scroll-mt-4 bg-cream py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-stone-500">БАГЛАА ЗОХИОГЧ</p>
            <h2 className="font-serif text-5xl font-semibold">Миний баглаа</h2>
          </div>
          {hasFlowers && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-red-600"
            >
              <Trash2 size={18} strokeWidth={1.75} />
              Баглаа арилгах
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* ЗҮҮН: дүрслэл */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BouquetCanvas
              stems={stems}
              positions={design.positions}
              onMove={movePos}
              onResetPositions={resetPositions}
              wrap={wrap}
              wrapColor={design.wrapColor}
              ribbonColor={design.ribbonColor}
              hasRibbon={(design.acc.ribbon ?? 0) > 0}
              hasCard={(design.acc.card ?? 0) > 0}
            />
          </div>

          {/* БАРУУН: сонголтууд */}
          <div className="space-y-6">
            {/* Сонгосон цэцэг */}
            <div className={card}>
              <div className="flex items-baseline justify-between">
                <h3 className={heading}>Сонгосон цэцэг</h3>
                <span className="text-sm text-stone-500">{bouquet.count} ширхэг</span>
              </div>
              {!hasFlowers ? (
                <p className="mt-4 rounded-2xl border border-dashed border-stone-300 p-5 text-center text-sm text-stone-600">
                  Дээрээс цэцгээ сонгоод баглаагаа бүтээгээрэй.{' '}
                  <a href="#flowers" className="font-semibold text-brand">Цэцэг сонгох</a>
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-stone-100">
                  {bouquet.items.map((i) => (
                    <li key={i.id} className="flex items-center gap-3 py-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blush/30">
                        {i.image_url ? (
                          <img src={i.image_url} alt="" className="h-full w-full object-contain p-1" />
                        ) : (
                          <span className="h-6 w-6 rounded-full" style={{ background: flowerColor(i.color) }} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{i.name}</p>
                        <p className="text-xs text-stone-500">
                          {formatMNT(i.unit_price)} × {i.qty} = <b className="text-ink">{formatMNT(i.unit_price * i.qty)}</b>
                        </p>
                      </div>
                      <QtyStepper qty={i.qty} max={i.available} onChange={(q) => onQty(i, q)} />
                      <button
                        type="button"
                        aria-label="Устгах"
                        onClick={() => onQty(i, 0)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
                      >
                        <X size={18} strokeWidth={1.75} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Чимэглэл */}
            <div className={card}>
              <h3 className={heading}>Чимэглэл</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {ACCESSORIES.map((a) => {
                  const qty = design.acc[a.id] ?? 0
                  const Icon = ACC_ICONS[a.icon] ?? Leaf
                  return (
                    <div
                      key={a.id}
                      className={
                        'flex items-center gap-3 rounded-full border p-1.5 pr-4 ' +
                        (qty > 0 ? 'border-2 border-brand' : 'border-stone-200')
                      }
                    >
                      <button
                        type="button"
                        onClick={() => qty === 0 && setAcc(a.id, 1)}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e3efe5] text-[#3f6b4d]">
                          <Icon size={18} strokeWidth={1.75} />
                        </span>
                        <span className="font-semibold">{a.name}</span>
                        <span className="text-xs text-stone-500">+{formatMNT(a.price)}</span>
                      </button>
                      {qty > 0 && <QtyStepper qty={qty} max={a.max} onChange={(q) => setAcc(a.id, q)} />}
                    </div>
                  )
                })}
              </div>

              {(design.acc.ribbon ?? 0) > 0 && (
                <div className="mt-4 flex items-center gap-3 text-sm text-stone-600">
                  <span>Туузны өнгө:</span>
                  {RIBBON_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={c}
                      onClick={() => setDesign((d) => ({ ...d, ribbonColor: c }))}
                      className={
                        'h-9 w-9 rounded-full ring-offset-2 ' + (design.ribbonColor === c ? 'ring-2 ring-ink' : '')
                      }
                      style={{ background: c }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Боолт */}
            <div className={card}>
              <h3 className={heading}>Боолт</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {WRAPPINGS.map((w) => {
                  const active = w.id === wrap.id
                  const chipColor = w.id === 'fancy' ? design.wrapColor : w.color
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setDesign((d) => ({ ...d, wrappingId: w.id }))}
                      className={
                        'rounded-2xl border-2 p-4 text-left ' +
                        (active ? 'border-brand bg-blush/30' : 'border-stone-200 hover:bg-stone-50')
                      }
                    >
                      <span
                        className="block h-2 w-12 rounded-full border border-black/5"
                        style={{ background: chipColor }}
                      />
                      <p className="mt-3 font-semibold">{w.name}</p>
                      <p className="text-xs text-stone-500">{w.description}</p>
                      <p className="mt-2 text-sm font-bold">+{formatMNT(w.price)}</p>
                    </button>
                  )
                })}
              </div>

              {isFancy && (
                <div className="mt-5">
                  <p className="text-sm text-stone-600">Боолтны өнгө:</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {WRAP_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        title={c.name}
                        aria-label={c.name}
                        onClick={() => setDesign((d) => ({ ...d, wrapColor: c.hex }))}
                        className={
                          'h-9 w-9 rounded-full border border-black/10 ring-offset-2 ' +
                          (design.wrapColor === c.hex ? 'ring-2 ring-ink' : '')
                        }
                        style={{ background: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Үнийн задрал */}
            <div className="rounded-3xl bg-ink p-6 text-white shadow-lg">
              <h3 className="font-serif text-2xl font-semibold">Үнийн задрал</h3>
              <div className="mt-4 space-y-2 border-b border-white/15 pb-4 text-sm">
                {bouquet.items.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span>{i.name} × {i.qty}</span>
                    <span>{formatMNT(i.unit_price * i.qty)}</span>
                  </div>
                ))}
                {hasFlowers && accLines.map((a) => (
                  <div key={a.id} className="flex justify-between text-white/80">
                    <span>{a.name} × {a.qty}</span>
                    <span>{formatMNT(a.total)}</span>
                  </div>
                ))}
                {hasFlowers && (
                  <div className="flex justify-between text-white/80">
                    <span>{wrap.name}</span>
                    <span>{formatMNT(wrap.price)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-semibold">Нийт</span>
                <b className="font-serif text-4xl">{formatMNT(total)}</b>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  disabled={!hasFlowers}
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingBag size={18} strokeWidth={1.75} />
                  Сагсанд нэмэх
                </button>
                <button
                  type="button"
                  disabled={!hasFlowers}
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 font-semibold hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Heart size={18} strokeWidth={1.75} />
                  Хадгалах
                </button>
              </div>

              {saveMsg && <p className="mt-3 text-sm text-white/90">{saveMsg}</p>}

              {!user && (
                <p className="mt-3 text-xs text-white/70">
                  Таны баглаа энэ төхөөрөмж дээр түр хадгалагдсан.{' '}
                  <Link to="/login" className="underline">Нэвтэрвэл</Link> алдагдахгүй.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}