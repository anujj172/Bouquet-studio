const COLORS = {
  'улаан': '#B3202E',
  'ягаан': '#E58CA5',
  'шар': '#F2C230',
  'цагаан': '#F2EEF0',
  'улбар шар': '#EE8A3A',
  'нил ягаан': '#8E6BB8',
}

export function flowerColor(name) {
  return COLORS[(name || '').trim().toLowerCase()] || '#D8A7B1'
}