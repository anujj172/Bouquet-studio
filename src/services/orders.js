import { supabase } from '../lib/supabaseClient'

export async function fetchCheckoutSettings() {
  const [s, z] = await Promise.all([
    supabase.from('store_settings').select('key, value'),
    supabase.from('delivery_zones').select('id, district, fee').eq('is_active', true).order('fee'),
  ])
  const map = Object.fromEntries((s.data ?? []).map((r) => [r.key, r.value]))
  return {
    openHours: map.open_hours,
    lead: map.lead_minutes,
    zones: z.data ?? [],
    error: s.error?.message || z.error?.message || null,
  }
}

export async function createOrder(form, cartItems) {
  const items = cartItems.map((i) =>
    i.type === 'ready'
      ? { type: 'ready', bouquet_id: i.bouquetId, qty: i.qty }
      : {
          type: 'custom',
          qty: i.qty,
          flowers: i.flowers,
          accessories: i.accessories,
          wrapping: i.wrapping,
          ribbonColor: i.ribbonColor,
          positions: i.positions,
        }
  )
  const { data, error } = await supabase.rpc('create_order', {
    p_items: items,
    p_fulfillment: form.fulfillment,
    p_name: form.name,
    p_phone: form.phone,
    p_district: form.district || null,
    p_address: form.address || null,
    p_scheduled: form.scheduledAt,
    p_note: form.note || null,
    p_card_message: form.cardMessage || null,
    p_card_sender: form.cardSender || null,
  })
  return { data, error: error?.message ?? null }
}

// Захиалгын мэдээллийг авах
export async function fetchOrder(id) {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
  return { data, error: error?.message ?? null }
}

// Sandbox: төлөгдсөн гэж тэмдэглэнэ
export async function markOrderPaid(id) {
  const { error } = await supabase.from('orders').update({ status: 'paid' }).eq('id', id)
  return { error: error?.message ?? null }
}

export async function sandboxPay(id) {
  const { error } = await supabase.rpc('sandbox_pay_order', { p_order: id })
  return error?.message ?? null
}

export async function cancelOrder(id) {
  const { error } = await supabase.rpc('cancel_order', { p_order: id })
  return error?.message ?? null
}