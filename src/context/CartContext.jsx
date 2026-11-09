/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'bouquet_cart_v1'
const CartContext = createContext(null)

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

// `selected` талбаргүй хуучин мөрийг сонгогдсон гэж үзнэ
const isSelected = (i) => i.selected !== false

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* үл тоомсорлоно */
    }
  }, [items])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      if (item.type === 'ready') {
        const same = prev.find((p) => p.type === 'ready' && p.bouquetId === item.bouquetId)
        if (same) return prev.map((p) => (p === same ? { ...p, qty: Math.min(10, p.qty + item.qty) } : p))
      }
      return [...prev, { ...item, selected: true, key: crypto.randomUUID() }]
    })
  }, [])

  const setQty = useCallback(
    (key, qty) =>
      setItems((prev) => prev.map((p) => (p.key === key ? { ...p, qty: Math.max(1, Math.min(10, qty)) } : p))),
    []
  )
  const remove = useCallback((key) => setItems((prev) => prev.filter((p) => p.key !== key)), [])
  const clear = useCallback(() => setItems((prev) => (prev.length ? [] : prev)), [])

  const toggleSelect = useCallback(
    (key) => setItems((prev) => prev.map((p) => (p.key === key ? { ...p, selected: !isSelected(p) } : p))),
    []
  )
  const selectAll = useCallback((value) => setItems((prev) => prev.map((p) => ({ ...p, selected: value }))), [])

  // Захиалга амжилттай болсны дараа зөвхөн сонгосон мөрүүдийг хасах
  const removeSelected = useCallback(() => setItems((prev) => prev.filter((p) => !isSelected(p))), [])

  const value = useMemo(() => {
    const selectedItems = items.filter(isSelected)
    return {
      items,
      addItem,
      setQty,
      remove,
      clear,
      toggleSelect,
      selectAll,
      removeSelected,
      isSelected,
      selectedItems,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.unitPrice * i.qty, 0),
      selectedCount: selectedItems.reduce((s, i) => s + i.qty, 0),
      selectedSubtotal: selectedItems.reduce((s, i) => s + (Number(i.unitPrice) || 0) * (Number(i.qty) || 0), 0),
      hasCard: selectedItems.some((i) => i.hasCard),
      hasCustom: selectedItems.some((i) => i.type === 'custom'),
    }
  }, [items, addItem, setQty, remove, clear, toggleSelect, selectAll, removeSelected])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}