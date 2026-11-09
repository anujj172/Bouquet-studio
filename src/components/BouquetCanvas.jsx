import { useId, useRef, useState } from 'react'
import { flowerColor } from '../lib/flowerColor'
import { ACCESSORIES, wrapPalette } from '../lib/bouquetDesign'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

function Sprig() {
  const dots = [[25, 40], [18, 32], [32, 30], [75, 36], [82, 28], [68, 26], [50, 28], [44, 18], [58, 18], [38, 44], [62, 44]]
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M50 98V60M50 70L25 40M50 66L75 36M50 60L50 28" stroke="#8fb59a" strokeWidth="1.5" fill="none" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="#fff" stroke="#e5d9dc" />
      ))}
    </svg>
  )
}

/**
 * Боолт. layer: 'back' (цэцгийн ард) | 'front' (цэцгийн урд) | 'all'
 * Цэцгүүд арын болон урд давхаргын хооронд орж, иш нь боолтонд ороосон мэт харагдана.
 */
export function WrapSvg({ wrap, wrapColor, ribbonColor, hasRibbon, hasCard, layer = 'all', className = '', style }) {
  const uid = useId().replace(/:/g, '')
  const c = wrapPalette(wrap, wrapColor)
  const fancy = wrap.id === 'fancy'
  const showBack = layer !== 'front'
  const showFront = layer !== 'back'

  return (
    <svg viewBox="0 0 400 500" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-inner`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={c.dark} />
          <stop offset="0.5" stopColor={c.inner} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
        <linearGradient id={`${uid}-front`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={c.dark} />
          <stop offset="0.3" stopColor={c.light} />
          <stop offset="0.6" stopColor={c.base} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="-3" stdDeviation="4" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>

      {showBack && (
        <g>
          {/* иш */}
          <rect x="182" y="440" width="36" height="55" rx="4" fill="#4f7a5a" />

          {/* хажуугийн намхан цаас */}
          <path d="M65 232 Q38 192 56 166 Q100 192 138 228 Z" fill={c.light} stroke={c.edge} strokeWidth="2" strokeLinejoin="round" />
          <path d="M335 232 Q362 192 344 166 Q300 192 262 228 Z" fill={c.light} stroke={c.edge} strokeWidth="2" strokeLinejoin="round" />

          {/* конусын арын тал */}
          <polygon
            points="65,230 335,230 222,470 178,470"
            fill={`url(#${uid}-inner)`}
            stroke={c.edge}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* дээд нүх */}
          <ellipse cx="200" cy="230" rx="135" ry="17" fill={c.inner} stroke={c.edge} strokeWidth="2" />
        </g>
      )}

      {showFront && (
        <g>
          {/* урд цаас */}
          <path
            d="M76 246 C105 232 135 254 160 240 C185 226 215 254 240 240 C265 226 295 252 324 246 L222 470 L178 470 Z"
            fill={`url(#${uid}-front)`}
            stroke={c.edge}
            strokeWidth="3"
            strokeLinejoin="round"
            filter={`url(#${uid}-shadow)`}
          />

          {/* гоёлын боолтны хоёр дахь давхар цаас */}
          {fancy && (
            <path
              d="M100 292 C125 278 160 300 190 286 C220 272 260 298 300 288 L218 466 L182 466 Z"
              fill={c.light}
              opacity="0.8"
              stroke={c.edge}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}

          {/* нугалаас */}
          <path
            d="M150 246 L188 466 M200 244 L200 466 M252 246 L212 466"
            stroke={c.edge}
            strokeWidth="1.5"
            opacity="0.35"
            fill="none"
          />
          {/* гэрлийн тусгал */}
          <path d="M96 262 L186 458" stroke="#fff" strokeWidth="7" opacity="0.35" strokeLinecap="round" />

          {/* туус */}
          {hasRibbon && (
            <g fill={ribbonColor}>
              <polygon points="142,352 258,352 254,368 146,368" />
              <path d="M200 360 C162 328 140 362 160 382 C176 390 190 374 200 360 Z" />
              <path d="M200 360 C238 328 260 362 240 382 C224 390 210 374 200 360 Z" />
              <path d="M198 366 L178 408 L194 400 L202 384 Z" opacity="0.9" />
              <path d="M202 366 L222 408 L206 400 L198 384 Z" opacity="0.9" />
              <circle cx="200" cy="361" r="9" />
            </g>
          )}

          {/* карт */}
          {hasCard && (
            <g transform="translate(258 312) rotate(12)">
              <rect width="60" height="42" rx="5" fill="#fff" stroke="#e5d9dc" />
              <path d="M8 12h44M8 22h32M8 32h26" stroke="#d7a1ae" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}
        </g>
      )}
    </svg>
  )
}

export function StemView({ s }) {
  if (s.kind === 'flower') {
    const src = s.item.bouquet_image_url || s.item.image_url
    return src ? (
      <img src={src} alt={s.item.name} draggable={false} className="pointer-events-none h-full w-full object-contain drop-shadow-md" />
    ) : (
      <span className="block h-full w-full rounded-full" style={{ background: flowerColor(s.item.color) }} />
    )
  }

  const image = ACCESSORIES.find((a) => a.id === s.id)?.image
  return image ? (
    <img src={image} alt="" draggable={false} className="pointer-events-none h-full w-full object-contain drop-shadow" />
  ) : (
    <Sprig />
  )
}

function depthOf(p, i) {
  const nx = (p.x - 50) / 36
  const ny = (p.y - 38) / 26
  const k = Math.max(0, 1 - nx * nx - ny * ny)
  return Math.sqrt(k) * 130 * (i % 2 ? 1 : -1)
}

export default function BouquetCanvas({
  stems,
  positions,
  onMove,
  onResetPositions,
  wrap,
  wrapColor,
  ribbonColor,
  hasRibbon,
  hasCard,
}) {
  const [mode, setMode] = useState('2d')
  const [angle, setAngle] = useState(25)
  const [activeKey, setActiveKey] = useState(null)
  const canvasRef = useRef(null)
  const dragKey = useRef(null)
  const spin = useRef(null)

  const is3D = mode === '3d'
  const empty = !stems.some((s) => s.kind === 'flower')
  const placed = stems.map((s) => ({ ...s, p: positions[s.key] ?? s.pos }))

  // ---- 2D: цэцэг чирэх ----
  function stemDown(e, key) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragKey.current = key
    setActiveKey(key)
  }
  function stemMove(e) {
    if (dragKey.current == null || !canvasRef.current) return
    const r = canvasRef.current.getBoundingClientRect()
    onMove(dragKey.current, {
      x: clamp(((e.clientX - r.left) / r.width) * 100, 4, 96),
      y: clamp(((e.clientY - r.top) / r.height) * 100, 4, 82),
    })
  }
  function stemUp() {
    dragKey.current = null
    setActiveKey(null)
  }

  // ---- 3D: чирж эргүүлэх ----
  function bgDown(e) {
    if (!is3D) return
    e.currentTarget.setPointerCapture(e.pointerId)
    spin.current = { x: e.clientX, a: angle }
  }
  function bgMove(e) {
    if (!is3D || !spin.current) return
    setAngle(spin.current.a + (e.clientX - spin.current.x) * 0.6)
  }
  function bgUp() {
    spin.current = null
  }

  const wrapProps = { wrap, wrapColor, ribbonColor, hasRibbon, hasCard }

  return (
    <div>
      <div
        ref={canvasRef}
        className={
          'relative aspect-4/5 w-full select-none overflow-hidden rounded-[2rem] bg-linear-to-b from-blush/30 to-blush/70 ' +
          (is3D ? 'cursor-grab touch-none active:cursor-grabbing' : '')
        }
        style={{ perspective: '1100px' }}
        onPointerDown={bgDown}
        onPointerMove={bgMove}
        onPointerUp={bgUp}
        onPointerCancel={bgUp}
      >
        {/* 2D / 3D сэлгүүр */}
        <div
          className="absolute left-4 top-4 z-200 flex rounded-full bg-white p-1 shadow-sm"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {['2d', '3d'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                'rounded-full px-5 py-2 text-sm font-semibold ' +
                (mode === m ? 'bg-ink text-white' : 'text-stone-600 hover:bg-stone-100')
              }
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {empty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-dashed border-brand/40 text-5xl text-brand/60">
              ✿
            </span>
            <p className="font-serif text-xl italic text-stone-500">Дээрээс цэцгээ сонгоод баглаагаа бүтээгээрэй</p>
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: is3D ? `rotateY(${angle}deg)` : 'none',
            }}
          >
            {is3D ? (
              [0, 60, 120].map((r) => (
                <WrapSvg
                  key={r}
                  {...wrapProps}
                  layer="all"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ transform: `rotateY(${r}deg)`, opacity: 0.85 }}
                />
              ))
            ) : (
              <>
                <WrapSvg
                  {...wrapProps}
                  layer="back"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ zIndex: 0 }}
                />
                <WrapSvg
                  {...wrapProps}
                  layer="front"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ zIndex: 90 }}
                />
              </>
            )}

            {placed.map((s, i) => (
              <div
                key={s.key}
                onPointerDown={is3D ? undefined : (e) => stemDown(e, s.key)}
                onPointerMove={is3D ? undefined : stemMove}
                onPointerUp={is3D ? undefined : stemUp}
                onPointerCancel={is3D ? undefined : stemUp}
                className={
                  'absolute ' +
                  (is3D ? 'pointer-events-none' : activeKey === s.key ? 'cursor-grabbing touch-none' : 'cursor-grab touch-none')
                }
                style={{
                  left: `${s.p.x}%`,
                  top: `${s.p.y}%`,
                  width: `${s.w}%`,
                  aspectRatio: s.ratio,
                  transform: is3D
                    ? `translate(-50%, -50%) translateZ(${depthOf(s.p, i)}px) rotateY(${-angle}deg)`
                    : `translate(-50%, -50%) ${activeKey === s.key ? 'scale(1.08)' : ''}`,
                  zIndex: is3D ? undefined : activeKey === s.key ? 100 : Math.round(s.p.y) + 1,
                }}
              >
                <StemView s={s} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-stone-500">
        <span>
          {is3D
            ? 'Баглааг чирж эргүүлж харна. Байрлал солихдоо 2D горимд шилжинэ.'
            : 'Цэцгийг чирж байрлалыг нь солино. Флорист яг энэ дүрслэлээр бэлтгэнэ.'}
        </span>
        {!empty && Object.keys(positions).length > 0 && (
          <button type="button" onClick={onResetPositions} className="font-semibold text-brand hover:underline">
            Байрлал шинэчлэх
          </button>
        )}
      </div>

      {is3D && !empty && (
        <input
          type="range"
          min="-180"
          max="180"
          value={Math.max(-180, Math.min(180, angle))}
          onChange={(e) => setAngle(Number(e.target.value))}
          aria-label="Эргүүлэх"
          className="mt-2 w-full accent-[#a84c63]"
        />
      )}
    </div>
  )
}