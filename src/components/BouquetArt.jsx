import BouquetPreview from './BouquetPreview'
import { DEFAULT_WRAP_COLOR } from '../lib/bouquetDesign'

// { image }, { image_url }, { flower, qty } гурван хэлбэрийг нэг болгоно
function normalize(i) {
  const f = i.flower ? { ...i.flower, qty: i.qty } : i
  const image = f.image ?? f.bouquet_image_url ?? f.image_url
  return {
    ...f,
    image_url: f.image_url ?? image,
    bouquet_image_url: f.bouquet_image_url ?? image,
  }
}

export default function BouquetArt({
  items = [],
  fancy = false,
  wrapColor,
  ribbonColor,
  accessories,
  hasCard,
  positions,
  eucalyptus = 2,
  className = '',
}) {
  const flat = items.map(normalize)

  const acc = { eucalyptus }
  if ((accessories?.ribbon ?? 0) > 0) acc.ribbon = 1
  if ((accessories?.card ?? 0) > 0 || hasCard) acc.card = 1

  const design = {
    acc,
    wrappingId: fancy ? 'fancy' : 'simple',
    wrapColor: wrapColor ?? DEFAULT_WRAP_COLOR,
    ribbonColor: ribbonColor ?? '#a84c63',
    positions: positions ?? {},
  }

  return <BouquetPreview items={flat} design={design} className={className} />
}