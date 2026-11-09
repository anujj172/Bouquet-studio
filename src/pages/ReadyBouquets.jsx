import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReadyBouquetCard from '../components/ReadyBouquetCard'
import ReadyBouquetModal from '../components/ReadyBouquetModal'
import { fetchReadyBouquets } from '../services/bouquets'
import { useBouquet } from '../context/BouquetContext'
import { DEFAULT_WRAP_COLOR, RIBBON_COLORS } from '../lib/bouquetDesign'

const DESIGN_KEY = 'bouquet_design_v1'

// DB-ийн accessories (true / тоо) -> { id: тоо }
function normalizeAcc(raw) {
  const acc = { eucalyptus: 2 } // бэлэн баглааны зурагт үргэлж 2 эвкалипт гардаг
  for (const [k, v] of Object.entries(raw ?? {})) {
    const n = v === true ? 1 : Number(v) || 0
    if (n > 0) acc[k] = n
    else delete acc[k]
  }
  return acc
}

export default function ReadyBouquets() {
  const bouquet = useBouquet()
  const navigate = useNavigate()
  const [reload, setReload] = useState(0)
  const [result, setResult] = useState({ key: null, rows: [], error: null })
  const [selected, setSelected] = useState(null)

  const loading = result.key !== reload

  useEffect(() => {
    let cancelled = false
    fetchReadyBouquets().then((r) => {
      if (!cancelled) setResult({ key: reload, ...r })
    })
    return () => {
      cancelled = true
    }
  }, [reload])

  function handleEdit(b) {
    // 1) Цэцгүүдийг бүхэлд нь солино
    bouquet.replaceAll(b.items.map((i) => ({ ...i.flower, qty: i.qty })))

    // 2) Дизайныг (чимэглэл, боолт) бэлэн баглааныхаар солж, хуучин байрлалыг цэвэрлэнэ
    try {
      localStorage.setItem(
        DESIGN_KEY,
        JSON.stringify({
          acc: normalizeAcc(b.accessories),
          wrappingId: b.wrapping?.name === 'Гоёлын боолт' ? 'fancy' : 'simple',
          wrapColor: DEFAULT_WRAP_COLOR,
          ribbonColor: RIBBON_COLORS[0],
          positions: {},
        })
      )
    } catch {
      /* үл тоомсорлоно */
    }

    setSelected(null)
    navigate('/#my-bouquet')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div>
        <p className="text-xs font-semibold tracking-widest text-stone-500">ФЛОРИСТЫН СОНГОЛТ</p>
        <h1 className="font-serif text-5xl font-semibold">Бэлэн баглаа</h1>
      </div>

      <div className="mt-8">
        {result.error ? (
          <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700">
            <p>Бэлэн баглааг ачаалж чадсангүй.</p>
            <button className="mt-3 rounded-full border border-red-300 px-5 py-2 font-semibold" onClick={() => setReload((n) => n + 1)}>
              Дахин оролдох
            </button>
          </div>
        ) : loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl bg-stone-200" />
            ))}
          </div>
        ) : result.rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-600">
            Одоогоор бэлэн баглаа байхгүй байна.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {result.rows.map((b) => (
              <ReadyBouquetCard key={b.id} bouquet={b} onOpen={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ReadyBouquetModal bouquet={selected} onClose={() => setSelected(null)} onEdit={handleEdit} />
      )}
    </div>
  )
}