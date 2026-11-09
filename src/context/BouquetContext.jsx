/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'bouquet_draft_v1'
export const MAX_STEMS = 51

const BouquetContext = createContext(null)

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function toEntry(flower, qty) {
  return {
    id: flower.id,
    name: flower.name,
    unit_price: flower.unit_price,
    color: flower.color,
    image_url: flower.image_url,
    bouquet_image_url: flower.bouquet_image_url,
    available: flower.available,
    qty,
  }
}

export function BouquetProvider({ children }) {
  const [map, setMap] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(map))
    } catch {
      /* хадгалж чадаагүй бол үл тоомсорлоно */
    }
  }, [map])

  const items = useMemo(() => Object.values(map), [map])
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const flowersTotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.unit_price, 0), [items])

  function setQty(flower, qty) {
    const current = map[flower.id]?.qty ?? 0
    const others = count - current
    let next = Math.max(0, qty)
    let reason = null

    if (next > flower.available) {
      next = flower.available
      reason = 'stock'
    }
    if (others + next > MAX_STEMS) {
      next = Math.max(0, MAX_STEMS - others)
      reason = 'max'
    }

    setMap((prev) => {
      const copy = { ...prev }
      if (next <= 0) delete copy[flower.id]
      else copy[flower.id] = toEntry(flower, next)
      return copy
    })
    return reason
  }

  // Одоогийн баглааг бүхэлд нь солих (бэлэн баглааг засварлах үед)
  function replaceAll(list) {
    const next = {}
    let total = 0
    for (const f of list) {
      const q = Math.min(f.qty, f.available, MAX_STEMS - total)
      if (q > 0) {
        next[f.id] = toEntry(f, q)
        total += q
      }
    }
    setMap(next)
  }

  const clear = () => setMap({})

  const value = {
    items,
    count,
    flowersTotal,
    setQty,
    replaceAll,
    clear,
    qtyOf: (id) => map[id]?.qty ?? 0,
  }
  return <BouquetContext.Provider value={value}>{children}</BouquetContext.Provider>
}

export function useBouquet() {
  return useContext(BouquetContext)
}