import { StemView, WrapSvg } from './BouquetCanvas'
import { DEFAULT_WRAP_COLOR, WRAPPINGS, buildStems } from '../lib/bouquetDesign'

export default function BouquetPreview({ items, design, className = '' }) {
  const acc = design?.acc ?? {}
  const stems = buildStems(items, acc)
  const wrap = WRAPPINGS.find((w) => w.id === design?.wrappingId) ?? WRAPPINGS[0]

  const wrapProps = {
    wrap,
    wrapColor: design?.wrapColor ?? DEFAULT_WRAP_COLOR,
    ribbonColor: design?.ribbonColor ?? '#a84c63',
    hasRibbon: (acc.ribbon ?? 0) > 0,
    hasCard: (acc.card ?? 0) > 0,
  }

  return (
    <div
      className={
        'relative isolate aspect-4/5 w-full overflow-hidden rounded-2xl bg-linear-to-b from-blush/30 to-blush/70 ' +
        className
      }
    >
      <WrapSvg {...wrapProps} layer="back" className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />
      {stems.map((s) => {
        const p = design?.positions?.[s.key] ?? s.pos
        return (
          <div
            key={s.key}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${s.w}%`,
              aspectRatio: s.ratio,
              transform: 'translate(-50%, -50%)',
              zIndex: Math.round(p.y) + 1,
            }}
          >
            <StemView s={s} />
          </div>
        )
      })}
      <WrapSvg {...wrapProps} layer="front" className="absolute inset-0 h-full w-full" style={{ zIndex: 90 }} />
    </div>
  )
}