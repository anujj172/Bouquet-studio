import { supabase } from '../lib/supabaseClient'

export const PAGE_SIZE = 12

export async function fetchCategories() {
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .order('sort_order')
  return data ?? []
}

export async function fetchFlowers({ search, categoryId, minPrice, maxPrice, inStock, sort, page }) {
  let q = supabase.from('flowers').select('*', { count: 'exact' }).eq('is_active', true)

  const term = (search || '').trim().replace(/[%_\\]/g, '')
  if (term) q = q.ilike('name', `%${term}%`)
  if (categoryId) q = q.eq('category_id', categoryId)
  if (minPrice) q = q.gte('unit_price', Number(minPrice))
  if (maxPrice) q = q.lte('unit_price', Number(maxPrice))
  if (inStock) q = q.gt('stock_qty', 0)

  if (sort === 'price_asc') q = q.order('unit_price', { ascending: true })
  else if (sort === 'price_desc') q = q.order('unit_price', { ascending: false })
  else if (sort === 'name') q = q.order('name', { ascending: true })
  else q = q.order('created_at', { ascending: false })

  const from = (page - 1) * PAGE_SIZE
  const { data, count, error } = await q.range(from, from + PAGE_SIZE - 1)
  return { rows: data ?? [], count: count ?? 0, error: error ? error.message : null }
}