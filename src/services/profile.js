import { supabase } from '../lib/supabaseClient'

const msg = (error) => error?.message ?? null

// ---- Профайл ----
export async function updateProfile(userId, { full_name, phone }) {
  const { error } = await supabase.from('profiles').update({ full_name, phone }).eq('id', userId)
  return { error: msg(error) }
}

// ---- Хаяг ----
export async function fetchAddresses(userId) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at')
  return { data: data ?? [], error: msg(error) }
}

async function clearDefault(userId) {
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
}

export async function saveAddress(userId, a) {
  const { count } = await supabase
    .from('addresses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  const makeDefault = a.is_default || !count // анхны хаяг автоматаар үндсэн болно
  if (makeDefault) await clearDefault(userId)

  const row = { label: a.label.trim(), district: a.district, address: a.address.trim(), is_default: makeDefault }
  const q = a.id
    ? supabase.from('addresses').update(row).eq('id', a.id)
    : supabase.from('addresses').insert({ ...row, user_id: userId })
  const { error } = await q
  return { error: msg(error) }
}

export async function setDefaultAddress(userId, id) {
  await clearDefault(userId)
  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id)
  return { error: msg(error) }
}

export async function deleteAddress(id) {
  const { error } = await supabase.from('addresses').delete().eq('id', id)
  return { error: msg(error) }
}

// ---- Захиалга ----
export async function fetchMyOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data ?? [], error: msg(error) }
}

// ---- Хадгалсан баглаа ----
export async function fetchSavedBouquets(userId) {
  const { data, error } = await supabase
    .from('saved_bouquets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data ?? [], error: msg(error) }
}

export async function saveBouquet(userId, { name, items, design, total }) {
  const slim = items.map((i) => ({
    id: i.id,
    name: i.name,
    color: i.color,
    unit_price: i.unit_price,
    image_url: i.image_url,
    bouquet_image_url: i.bouquet_image_url,
    available: i.available,
    qty: i.qty,
  }))
  const { error } = await supabase
    .from('saved_bouquets')
    .insert({ user_id: userId, name: name.trim(), items: slim, design, total })
  return { error: msg(error) }
}

export async function deleteSavedBouquet(id) {
  const { error } = await supabase.from('saved_bouquets').delete().eq('id', id)
  return { error: msg(error) }
}