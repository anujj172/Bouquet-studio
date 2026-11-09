export const ACCESSORIES = [
  { id: 'eucalyptus', name: 'Эвкалипт навч', price: 2500, max: 5, icon: 'leaf', image: '/flowers/eucalyptus.png' },
  { id: 'gypsophila', name: 'Дэгдээхэйн амьсгал', price: 3000, max: 5, icon: 'flower', image: '/flowers/babys-breath.png' },
  { id: 'ribbon', name: 'Тууз', price: 2000, max: 1, icon: 'ribbon' },
  { id: 'card', name: 'Мэндчилгээний карт', price: 1500, max: 1, icon: 'mail' },
]

export const WRAPPINGS = [
  { id: 'simple', name: 'Энгийн боолт', description: 'Цагаан цаас, утсан боолт', price: 3000, color: '#e6dfd8' },
  { id: 'fancy', name: 'Гоёлын боолт', description: 'Давхар солонгос цаас, том туус', price: 9000, color: '#f2a7b8' },
]

// Гоёлын боолтны өнгө (үнэ өөрчлөгдөхгүй)
export const WRAP_COLORS = [
  { id: 'pink', name: 'Ягаан', hex: '#f2a7b8' },
  { id: 'red', name: 'Улаан', hex: '#c8344a' },
  { id: 'purple', name: 'Нил', hex: '#b99ad6' },
  { id: 'blue', name: 'Цэнхэр', hex: '#8db8e0' },
  { id: 'green', name: 'Ногоон', hex: '#7fb08a' },
  { id: 'yellow', name: 'Шар', hex: '#f2cf62' },
  { id: 'orange', name: 'Улбар шар', hex: '#f2a066' },
  { id: 'black', name: 'Хар', hex: '#2b2b2b' },
]

export const DEFAULT_WRAP_COLOR = WRAP_COLORS[0].hex
export const RIBBON_COLORS = ['#a84c63', '#4f7a5a', '#dcc0a0', '#16291f']

// hex өнгийг target өнгө рүү t (0..1) хувиар ойртуулна
export function mix(hex, target, t) {
  const parse = (h) => {
    const n = parseInt(h.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const a = parse(hex)
  const b = parse(target)
  return (
    '#' +
    a
      .map((v, i) =>
        Math.round(v + (b[i] - v) * t)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  )
}

// Боолтны өнгөний багц: энгийн нь цагаан, гоёлын нь сонгосон өнгөөс гарна
export function wrapPalette(wrap, color = DEFAULT_WRAP_COLOR) {
  if (wrap.id !== 'fancy') {
    return { base: '#ffffff', light: '#ffffff', dark: '#e9e3dc', edge: '#d8cfc5', inner: '#efe9e2' }
  }
  return {
    base: color,
    light: mix(color, '#ffffff', 0.45),
    dark: mix(color, '#000000', 0.14),
    edge: mix(color, '#000000', 0.25),
    inner: mix(color, '#000000', 0.1),
  }
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

// Цэцэг бүрийг ширхгээр нь "stem" болгон хуваана. Анхны байрлалыг спираль хэлбэрээр тооцно.
export function buildStems(items, acc) {
  const total = items.reduce((s, i) => s + i.qty, 0)
  const size = clamp(30 - total * 0.5, 15, 26)
  const stems = []
  const queues = items.map((item) => ({ item, left: item.qty, n: 0 }))
  let idx = 0

  while (queues.some((q) => q.left > 0)) {
    for (const q of queues) {
      if (q.left <= 0) continue
      const r = Math.sqrt((idx + 0.5) / total)
      const a = idx * 2.39996
      stems.push({
        key: `f-${q.item.id}-${q.n}`,
        kind: 'flower',
        item: q.item,
        w: size,
        ratio: 1,
        pos: { x: 50 + Math.cos(a) * r * 24, y: 40 + Math.sin(a) * r * 13 },
      })
      q.n++
      q.left--
      idx++
    }
  }

  // Эвкалипт: хоёр талд өндөр иштэй
  for (let n = 0; n < (acc.eucalyptus ?? 0); n++) {
    const left = n % 2 === 0
    const row = Math.floor(n / 2)
    stems.push({
      key: `a-eucalyptus-${n}`,
      kind: 'acc',
      id: 'eucalyptus',
      w: 22,
      ratio: 0.5,
      pos: { x: (left ? 19 : 81) + (left ? 1 : -1) * row * 5, y: 32 + row * 3 },
    })
  }

  // Дэгдээхэйн амьсгал: дээд хэсэгт
  for (let n = 0; n < (acc.gypsophila ?? 0); n++) {
    stems.push({
      key: `a-gypsophila-${n}`,
      kind: 'acc',
      id: 'gypsophila',
      w: 26,
      ratio: 1,
      pos: { x: n % 2 === 0 ? 34 : 66, y: 20 + Math.floor(n / 2) * 8 },
    })
  }
  return stems
}