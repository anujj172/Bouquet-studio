import { supabase } from '../lib/supabaseClient'

export async function fetchReadyBouquets() {
  const { data, error } = await supabase
    .from('bouquets')
    .select(
      `id, name, description, image_url, extra_price, accessories,
       wrappings ( name, price ),
       bouquet_items ( qty, flowers ( id, name, unit_price, color, image_url, bouquet_image_url, stock_qty, reserved_qty ) )`
    )
    .eq('is_active', true)
    .order('created_at')

  if (error) return { rows: [], error: error.message }

  const rows = (data ?? []).map((b) => {
    const raw = b.bouquet_items ?? []
    const items = raw
      .filter((x) => x.flowers)
      .map((x) => ({
        qty: x.qty,
        flower: { ...x.flowers, available: Math.max(0, x.flowers.stock_qty - x.flowers.reserved_qty) },
      }))
      .sort((a, c) => a.flower.name.localeCompare(c.flower.name))

    const complete = items.length > 0 && items.length === raw.length
    const flowersTotal = items.reduce((s, i) => s + i.flower.unit_price * i.qty, 0)
    const wrapping = b.wrappings ?? null
    const price = flowersTotal + (wrapping?.price ?? 0) + b.extra_price
    const available = complete ? Math.min(...items.map((i) => Math.floor(i.flower.available / i.qty))) : 0

    return {
      id: b.id,
      name: b.name,
      description: b.description,
      image_url: b.image_url,
      extra_price: b.extra_price,
      accessories: b.accessories ?? {},
      wrapping,
      items,
      flowersTotal,
      price,
      available,
    }
  })

  return { rows, error: null }
}