const HOUR_MS = 3600000
const UB_OFFSET = 8 * HOUR_MS

export const DELIVERY_SLOTS = [10, 12, 14, 16, 18]
export const MAX_DAYS = 14
export const DEFAULT_LEAD = { ready_bouquet: 30, custom_bouquet: 60, delivery: 120 }

const WEEKDAYS = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба']
const pad = (n) => String(n).padStart(2, '0')

function partsOf(t) {
  const d = new Date(t * 60000)
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    hh: d.getUTCHours(),
    mm: d.getUTCMinutes(),
  }
}

export function nowWall() {
  return Math.floor((Date.now() + UB_OFFSET) / 60000)
}

export function wallMinutes(dateStr, hh = 0, mm = 0) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Date.UTC(y, m - 1, d, hh, mm) / 60000
}

export function todayStr() {
  return partsOf(nowWall()).date
}

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return partsOf(Date.UTC(y, m - 1, d + n) / 60000).date
}

export function weekdayName(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
}

export function dayHours(openHours, dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  const key = dow === 0 ? 'sunday' : dow === 6 ? 'saturday' : 'weekday'
  const [o, c] = openHours?.[key] ?? ['09:00', '20:00']
  const toMin = (s) => {
    const [h, mi] = s.split(':').map(Number)
    return h * 60 + mi
  }
  return { open: toMin(o), close: toMin(c) }
}

export function earliestPickup(openHours, leadMin) {
  let t = Math.ceil((nowWall() + leadMin) / 5) * 5
  const lastDay = addDays(todayStr(), MAX_DAYS)
  for (let i = 0; i <= MAX_DAYS + 1; i++) {
    const { date } = partsOf(t)
    if (date > lastDay) return null
    const dayStart = wallMinutes(date)
    const { open, close } = dayHours(openHours, date)
    if (t <= dayStart + close) return partsOf(Math.max(t, dayStart + open))
    t = dayStart + 24 * 60
  }
  return null
}

export function validateSchedule({ date, hh, mm, openHours, leadMin }) {
  if (!date) return 'Өдрөө сонгоно уу'
  if (date < todayStr()) return 'Өнгөрсөн өдөр сонгох боломжгүй'
  if (date > addDays(todayStr(), MAX_DAYS)) return `${MAX_DAYS} хоногоос хойших өдөр сонгох боломжгүй`
  const day = wallMinutes(date)
  const t = wallMinutes(date, hh, mm)
  const { open, close } = dayHours(openHours, date)
  if (t - day < open || t - day > close) return 'Ажлын цагаас гадуур байна'
  if (t < nowWall() + leadMin) return `Бэлтгэх хугацаа хүрэхгүй байна (дор хаяж ${leadMin} минут)`
  return null
}

export function slotReason(date, start, openHours, leadMin) {
  const { open, close } = dayHours(openHours, date)
  if (start * 60 < open || (start + 2) * 60 > close) return 'Ажлын цагаас гадуур'
  return validateSchedule({ date, hh: start, mm: 0, openHours, leadMin })
}

export const toIso = (date, hh, mm) => `${date}T${pad(hh)}:${pad(mm)}:00+08:00`

export function formatWhen(iso, fulfillment) {
  const p = partsOf(Math.floor((new Date(iso).getTime() + UB_OFFSET) / 60000))
  const head = `${p.date} (${weekdayName(p.date)})`
  if (fulfillment === 'delivery') return `${head} ${pad(p.hh)}:00–${pad(p.hh + 2)}:00`
  return `${head} ${pad(p.hh)}:${pad(p.mm)}`
}