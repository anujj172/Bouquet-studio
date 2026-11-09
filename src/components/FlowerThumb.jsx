import { useState } from 'react'
import { flowerColor } from '../lib/flowerColor'

export default function FlowerThumb({ flower }) {
  // Аль зураг ачаалагдаагүйг хадгална (өөр цэцэг дээр дахин оролдоно)
  const [failedUrl, setFailedUrl] = useState(null)
  const failed = failedUrl === flower.image_url

  if (flower.image_url && !failed) {
    return (
      <img
        src={flower.image_url}
        alt={flower.name}
        className="h-full w-full object-contain p-4"
        loading="lazy"
        onError={() => setFailedUrl(flower.image_url)}
      />
    )
  }

  const c = flowerColor(flower.color)
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={flower.name} className="h-28 w-28">
      <circle cx="60" cy="60" r="46" fill={c} />
      <circle cx="60" cy="60" r="30" fill="#00000022" />
      <circle cx="60" cy="60" r="14" fill={c} />
    </svg>
  )
}