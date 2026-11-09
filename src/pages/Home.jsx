import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FlowerCard from '../components/FlowerCard'
import FlowerModal from '../components/FlowerModal'
import FlowerFilters, { SortSelect } from '../components/FlowerFilters'
import Pagination from '../components/Pagination'
import MyBouquet from '../components/MyBouquet'
import { fetchCategories, fetchFlowers, PAGE_SIZE } from '../services/flowers'
import { useBouquet, MAX_STEMS } from '../context/BouquetContext'
import { useDebounce } from '../hooks/useDebounce'

const INITIAL = { search: '', categoryId: '', minPrice: '', maxPrice: '', inStock: false, sort: 'newest', page: 1 }

export default function Home() {
  const bouquet = useBouquet()
  const location = useLocation()
  const [filters, setFilters] = useState(() => ({
    ...INITIAL,
    search: new URLSearchParams(location.search).get('search') ?? '',
  }))
  const [categories, setCategories] = useState([])
  const [reload, setReload] = useState(0)
  const [result, setResult] = useState({ key: null, rows: [], count: 0, error: null })
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState(null)

  const debounced = useDebounce(filters, 300)
  const key = JSON.stringify({ debounced, reload })
  const loading = result.key !== key

  useEffect(() => {
    fetchCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  useEffect(() => {
    let cancelled = false
    fetchFlowers(debounced).then((r) => {
      if (!cancelled) setResult({ key, ...r })
    })
    return () => {
      cancelled = true
    }
  }, [debounced, key])

  function change(patch) {
    setFilters((f) => ({ ...f, ...patch, page: 'page' in patch ? patch.page : 1 }))
  }

  function showNotice(text) {
    setNotice(text)
    setTimeout(() => setNotice(''), 3000)
  }

  function handleQty(flower, qty) {
    const reason = bouquet.setQty(flower, qty)
    if (reason === 'stock') showNotice('Үлдэгдэл хүрэлцэхгүй байна')
    if (reason === 'max') showNotice(`Нэг баглаанд хамгийн ихдээ ${MAX_STEMS} ширхэг сонгоно`)
  }

  const totalPages = Math.max(1, Math.ceil(result.count / PAGE_SIZE))

  return (
    <div>
      {/* HERO */}
      <section
        className="bg-[#F1E4E2] bg-cover bg-right"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(248,243,238,0.96) 38%, rgba(248,243,238,0) 75%), url('/flowers/hero-bouquet.jpg')",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
          <p className="text-xs font-semibold tracking-widest text-stone-600">BOUQUET STUDIO · УЛААНБААТАР</p>
          <h1 className="mt-4 max-w-xl font-serif text-5xl font-semibold leading-tight md:text-6xl">
            Өөрийн хүссэн цэцгээр, <em className="text-brand">баглаагаа</em> бүтээгээрэй
          </h1>
          <p className="mt-5 max-w-md text-lg text-stone-600">
            Баглааныхаа боолтыг сонгоод хүргүүлж авах эсвэл өөрийн биеэр ирж аваарай.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#flowers" className="rounded-full bg-brand px-7 py-3.5 font-semibold text-white hover:bg-brand-dark">
              Баглаа зохиох 
            </a>
            <Link to="/ready" className="rounded-full border border-stone-300 bg-white px-7 py-3.5 font-semibold">
              Бэлэн баглаа
            </Link>
          </div>
          <ol className="mt-10 flex flex-wrap gap-6 text-sm font-semibold">
            {['Цэцгээ сонго', 'Баглаагаа хар', 'Төлөөд ав'].map((t, i) => (
              <li key={t} className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs text-white">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ЦЭЦГИЙН ЖАГСААЛТ */}
      <section id="flowers" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-stone-500">ӨНӨӨДРИЙН ЦЭЦЭГ</p>
            <h2 className="font-serif text-5xl font-semibold">Ширхгээр сонгох</h2>
          </div>
          <SortSelect value={filters.sort} onChange={change} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <FlowerFilters filters={filters} categories={categories} onChange={change} />
          </aside>

          <div>
            <p className="text-sm text-stone-500">{result.count} цэцэг</p>

            {notice && <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-800">{notice}</p>}

            <div className="mt-4">
              {result.error ? (
                <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700">
                  <p>Цэцгийн мэдээллийг ачаалж чадсангүй.</p>
                  <button className="mt-3 rounded-full border border-red-300 px-5 py-2 font-semibold" onClick={() => setReload((n) => n + 1)}>
                    Дахин оролдох
                  </button>
                </div>
              ) : loading ? (
                <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="h-80 animate-pulse rounded-3xl bg-stone-200" />
                  ))}
                </div>
              ) : result.rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center">
                  <p className="text-lg font-semibold">Таны хайлтад тохирох цэцэг олдсонгүй</p>
                  <button className="mt-4 rounded-full bg-ink px-5 py-2.5 font-semibold text-white" onClick={() => setFilters(INITIAL)}>
                    Шүүлтүүр цэвэрлэх
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {result.rows.map((f) => {
                    const flower = { ...f, available: Math.max(0, f.stock_qty - f.reserved_qty) }
                    return (
                      <FlowerCard
                        key={f.id}
                        flower={flower}
                        qty={bouquet.qtyOf(f.id)}
                        onChange={(q) => handleQty(flower, q)}
                        onOpen={setSelected}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            <Pagination page={filters.page} totalPages={totalPages} onChange={(p) => change({ page: p })} />
          </div>
        </div>
      </section>

      {/* МИНИЙ БАГЛАА */}
      <MyBouquet onQty={handleQty} />

      {selected && (
        <FlowerModal
          flower={selected}
          qty={bouquet.qtyOf(selected.id)}
          onChange={(q) => handleQty(selected, q)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}