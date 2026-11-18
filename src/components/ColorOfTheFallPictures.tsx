import type { CSSProperties, ReactNode } from 'react'
import {
  BANDS,
  LAMP_WAVELENGTH_NM,
  MASS_PANEL_DISTANCE_IN_HORIZON_RADII,
  SMALLEST_GAP_IN_HORIZON_RADII,
  bandOf,
  colorGuessMarker,
  curveEnd,
  massGuessMarker,
  massPanelColumns,
  nearHorizonReadings,
  receivedWavelengthNm,
  stretchFactor,
  visibleGuessMarker,
  workedDistance,
  workedSteps,
} from '../physics/colorOfTheFallExperiment'
import type { ColorChoice, ColorOfTheFallResult, MassChoice, VisibleChoice } from '../physics/colorOfTheFallExperiment'

// Black Holes, Experiment 7 (audit update): the two pictures, their white guess marks and their captions
// (docs/audit/black-holes-and-strong-gravity/07-draft-wording.md, section 5). White always means the learner's guess (CLAUDE.md §14), so the
// "traveler now" dot is the traveler's cyan and no other drawing uses a white line, fill or outline. Every number shown comes from the physics
// module (§9). Picture 1 is the color strip; Picture 2 is the wavelength graph, with a small panel below it for guess 3.

const KM_PER_AU = 149_597_870.7

const LAMP_COLOR = '#4ade80' // the lamp's own color, as emitted
const RECEIVED_COLOR = '#fb923c' // the color as received by the observer, orange as the observer's clock in Black Holes 6
const REFERENCE_COLOR = '#94a3b8' // grey: white is reserved for the learner's guess
const TRAVELER_COLOR = '#22d3ee' // the traveler, cyan as the traveler's watch in Black Holes 6
const LABEL_TEXT = '#f1f5f9' // near-white text for labels on the band colours (not the guess white)

// The color strip (the first picture): wavelength on a logarithmic axis from 100 nm to 10 m.
const STRIP_WIDTH = 640
const STRIP_HEIGHT = 500
const STRIP_LEFT = 30
const STRIP_RIGHT = 610
const STRIP_Y = 222
const STRIP_BAND_HEIGHT = 84
const STRIP_MIN_NM = 100
const STRIP_MAX_NM = 1e10
const CREST_SPACING_PX = 14
const MAX_DRAWN_STRETCH = 20

// The wavelength graph (the second picture), and the small panel below it.
const GRAPH_WIDTH = 640
const GRAPH_HEIGHT = 440
const GRAPH_LEFT = 84
const GRAPH_RIGHT = 610
const GRAPH_TOP = 66
const GRAPH_BOTTOM = 300
const PANEL_HEIGHT = 200

const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }

const BAND_FILL: Record<string, string> = {
  ultraviolet: '#4c1d95',
  visible: 'url(#visible-rainbow)',
  infrared: '#7f1d1d',
  microwave: '#78350f',
  radio: '#1e293b',
}
export const BAND_LABEL: Record<string, string> = {
  ultraviolet: 'ultraviolet',
  visible: 'visible light',
  infrared: 'infrared',
  microwave: 'microwave',
  radio: 'radio waves',
}

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
export function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

// A number in plain form when it is moderate, as a power of ten when it is very large or very small.
export function formatBig(value: number): string {
  if (value >= 0.01 && value < 10_000) return formatNumber(value)
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Number((value / 10 ** exponent).toPrecision(2))
  return `${mantissa} × 10${String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')}`
}

// A length in plain units, from meters to trillions of kilometers.
export function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

// Kilometers, with astronomical units added once that is the more natural unit.
export function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}

export function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// A wavelength in the unit that fits it, from nanometers to meters.
export function formatWavelength(nm: number): string {
  if (nm < 1000) return `${formatNumber(nm)} nm`
  if (nm < 1e6) return `${formatNumber(nm / 1e3)} µm`
  if (nm < 1e9) return `${formatNumber(nm / 1e6)} mm`
  return `${formatNumber(nm / 1e9)} m`
}

export const withBand = (nm: number) => `${formatWavelength(nm)} (${BAND_LABEL[bandOf(nm)]})`

// A gap above the horizon, with enough digits to tell 0.01 from 0.001.
export const formatGap = (gap: number) => (gap >= 1 ? formatNumber(gap) : String(Number(gap.toPrecision(2))))

// Where the traveler is at a given point of the playback: the gap above the horizon falls from the release gap to the
// smallest gap, by the same factor in each equal slice of the playback.
function gapAt(result: ColorOfTheFallResult, progress: number): number {
  const widest = result.startInHorizonRadii - 1
  return widest * (SMALLEST_GAP_IN_HORIZON_RADII / widest) ** progress
}

// A white YOUR GUESS box joined by a line to its mark on the real picture. White always means the learner's guess.
function GuessBox({ x, y, width = 196, text, target }: { x: number; y: number; width?: number; text: string; target: { x: number; y: number } }) {
  const height = 38
  const startX = Math.min(Math.max(target.x, x + 10), x + width - 10)
  const from =
    target.y <= y
      ? { x: startX, y }
      : target.y >= y + height
        ? { x: startX, y: y + height }
        : target.x < x
          ? { x, y: y + height / 2 }
          : { x: x + width, y: y + height / 2 }
  return (
    <g>
      <line x1={from.x} y1={from.y} x2={target.x} y2={target.y} stroke="#ffffff" strokeWidth={2} />
      <rect x={x} y={y} width={width} height={height} rx={5} fill="#0b1020" stroke="#ffffff" strokeWidth={2.5} />
      <text x={x + 10} y={y + 15} fill="#ffffff" fontSize="11" fontWeight="bold">
        YOUR GUESS
      </text>
      <text x={x + 10} y={y + 30} fill="#ffffff" fontSize="11">
        {text}
      </text>
    </g>
  )
}

const WHITE_MARK = { fill: 'none', stroke: '#ffffff', strokeWidth: 3 } as const
const WHITE_SOLID = { fill: '#ffffff', stroke: '#0b1020', strokeWidth: 1.5 } as const

const colorText: Record<ColorChoice, string> = {
  same: 'it stays green',
  bluer: 'it turns bluer',
  limit: 'redder, up to a point',
  'no-limit': 'redder, with no limit',
}
const visibleText: Record<VisibleChoice, string> = {
  'all-the-way': 'visible all the way down',
  'near-horizon': 'visible until very close',
  'well-before': 'not visible well before',
}
const massText: Record<MassChoice, string> = {
  small: 'redder for the 10-Sun hole',
  big: 'redder for M87*',
  same: 'the same for both',
}

// The first picture: the traveler's lamp and the observer's view of its crests, and the strip of colors, with the lamp's
// own wavelength (fixed) and the wavelength as received (moving). With a guess, it also draws the white guess-1 mark.
export function ColorStrip({ result, progress, guess }: { result: ColorOfTheFallResult; progress: number; guess?: ColorChoice | null }) {
  const start = result.startInHorizonRadii
  const gap = gapAt(result, progress)
  const r = Math.min(1 + gap, start)
  const wavelength = receivedWavelengthNm(start, r)
  const factor = stretchFactor(start, r)
  const band = bandOf(wavelength)

  const logMin = Math.log10(STRIP_MIN_NM)
  const logMax = Math.log10(STRIP_MAX_NM)
  const xFor = (nm: number) => STRIP_LEFT + ((Math.log10(nm) - logMin) / (logMax - logMin)) * (STRIP_RIGHT - STRIP_LEFT)
  const ticks: Array<{ nm: number; label: string }> = [
    { nm: 1e2, label: '100 nm' },
    { nm: 1e3, label: '1 µm' },
    { nm: 1e4, label: '10 µm' },
    { nm: 1e5, label: '100 µm' },
    { nm: 1e6, label: '1 mm' },
    { nm: 1e7, label: '1 cm' },
    { nm: 1e8, label: '10 cm' },
    { nm: 1e9, label: '1 m' },
    { nm: 1e10, label: '10 m' },
  ]
  const rainbowStops = [380, 450, 495, 570, 590, 620, 750].map((nm) => ({
    nm,
    color: nm < 450 ? '#8b5cf6' : nm < 495 ? '#3b82f6' : nm < 570 ? '#22c55e' : nm < 590 ? '#eab308' : nm < 620 ? '#f97316' : '#ef4444',
  }))

  // The crests: at the lamp they are CREST_SPACING_PX apart. At the observer they are that times the stretch factor,
  // drawn to scale only up to MAX_DRAWN_STRETCH, since a larger spacing would not fit on the picture.
  const drawnStretch = Math.min(factor, MAX_DRAWN_STRETCH)
  const crestsFrom = (left: number, right: number, spacing: number) => {
    const xs: number[] = []
    for (let x = left; x <= right; x += spacing) xs.push(x)
    return xs
  }
  const emittedCrests = crestsFrom(104, 236, CREST_SPACING_PX)
  const receivedCrests = crestsFrom(404, 600, CREST_SPACING_PX * drawnStretch)

  const bandRect = (name: string) => {
    const b = BANDS.find((x) => x.name === name)!
    return { from: xFor(Math.max(b.fromNm, STRIP_MIN_NM)), to: xFor(Math.min(b.toNm, STRIP_MAX_NM)) }
  }
  const markerX = xFor(Math.min(Math.max(wavelength, STRIP_MIN_NM), STRIP_MAX_NM))
  const lampX = xFor(LAMP_WAVELENGTH_NM)
  const labelAnchor = markerX > STRIP_RIGHT - 130 ? 'end' : markerX < STRIP_LEFT + 130 ? 'start' : 'middle'
  const midY = STRIP_Y + STRIP_BAND_HEIGHT / 2

  return (
    <svg
      viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`}
      width="100%"
      style={{
        display: 'block',
        maxWidth: `${STRIP_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <defs>
        <linearGradient id="visible-rainbow" x1="0" x2="1" y1="0" y2="0">
          {rainbowStops.map((s) => (
            <stop key={s.nm} offset={(Math.log10(s.nm) - Math.log10(380)) / (Math.log10(750) - Math.log10(380))} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The color of the lamp, as received
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Traveler {String(Number(r.toPrecision(6)))} horizon radii from the center ({formatGap(gap)} above the horizon) · stretch factor {formatBig(factor)}
      </text>
      <text x={12} y={54} fill="#94a3b8" fontSize="11">
        Wavelength as received: {formatWavelength(wavelength)} ({BAND_LABEL[band]})
      </text>

      {/* The traveler with the lamp, the crests at the lamp and the crests at the observer */}
      <circle cx={52} cy={104} r={9} fill={TRAVELER_COLOR} />
      <circle cx={62} cy={104} r={4} fill={LAMP_COLOR} />
      <text x={52} y={132} fill={TRAVELER_COLOR} fontSize="10" textAnchor="middle">
        traveler + lamp
      </text>
      <text x={592} y={132} fill={RECEIVED_COLOR} fontSize="10" textAnchor="end">
        observer, far away
      </text>
      {emittedCrests.map((x) => (
        <line key={`e${x}`} x1={x} y1={88} x2={x} y2={120} stroke={LAMP_COLOR} strokeWidth={2.5} />
      ))}
      <text x={170} y={82} fill={LAMP_COLOR} fontSize="10" textAnchor="middle">
        crests as emitted, at the lamp
      </text>
      {receivedCrests.map((x) => (
        <line key={`r${x}`} x1={x} y1={88} x2={x} y2={120} stroke={RECEIVED_COLOR} strokeWidth={2.5} />
      ))}
      <text x={500} y={82} fill={RECEIVED_COLOR} fontSize="10" textAnchor="middle">
        crests as received, at the observer
      </text>
      <line x1={252} y1={104} x2={388} y2={104} stroke="#64748b" strokeDasharray="4 4" />
      <polygon points="388,100 396,104 388,108" fill="#64748b" />
      <text x={320} y={98} fill="#94a3b8" fontSize="10" textAnchor="middle">
        light travels outward
      </text>
      <text x={320} y={150} fill="#94a3b8" fontSize="10" textAnchor="middle">
        crests are {formatBig(factor)} times as far apart at the observer
      </text>
      {factor > MAX_DRAWN_STRETCH && (
        <text x={320} y={164} fill="#94a3b8" fontSize="10" textAnchor="middle">
          (drawn to scale only up to {MAX_DRAWN_STRETCH} times; beyond that they would not fit)
        </text>
      )}

      {/* The strip of colors */}
      {BANDS.map((b) => {
        const { from, to } = bandRect(b.name)
        return (
          <g key={b.name}>
            <rect x={from} y={STRIP_Y} width={to - from} height={STRIP_BAND_HEIGHT} fill={BAND_FILL[b.name]} />
            {to - from < 60 ? (
              // Narrow bands (ultraviolet and visible light) get their name written upward inside the band.
              <text
                x={(from + to) / 2 + 4}
                y={midY}
                fill={LABEL_TEXT}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(-90 ${(from + to) / 2 + 4} ${midY})`}
              >
                {BAND_LABEL[b.name]}
              </text>
            ) : (
              <text x={(from + to) / 2} y={midY + 4} fill={LABEL_TEXT} fontSize="10" fontWeight="bold" textAnchor="middle">
                {BAND_LABEL[b.name]}
              </text>
            )}
          </g>
        )
      })}
      {ticks.map((t) => (
        <g key={t.nm}>
          <line x1={xFor(t.nm)} y1={STRIP_Y + STRIP_BAND_HEIGHT} x2={xFor(t.nm)} y2={STRIP_Y + STRIP_BAND_HEIGHT + 5} stroke="#94a3b8" />
          <text x={xFor(t.nm)} y={STRIP_Y + STRIP_BAND_HEIGHT + 18} fill="#94a3b8" fontSize="9" textAnchor="middle">
            {t.label}
          </text>
        </g>
      ))}
      <text x={(STRIP_LEFT + STRIP_RIGHT) / 2} y={STRIP_Y + STRIP_BAND_HEIGHT + 34} fill="#94a3b8" fontSize="10" textAnchor="middle">
        wavelength (each step to the right is ten times longer)
      </text>

      {/* The lamp's own wavelength (fixed) below the strip's labels, and the wavelength as received (moving) above the strip */}
      <polygon points={`${lampX},${STRIP_Y + STRIP_BAND_HEIGHT} ${lampX - 6},${STRIP_Y + STRIP_BAND_HEIGHT + 12} ${lampX + 6},${STRIP_Y + STRIP_BAND_HEIGHT + 12}`} fill={LAMP_COLOR} />
      <text x={lampX} y={STRIP_Y + STRIP_BAND_HEIGHT + 46} fill={LAMP_COLOR} fontSize="10" textAnchor="start">
        green marker: the lamp's own color, {LAMP_WAVELENGTH_NM} nm (as emitted)
      </text>
      <line x1={markerX} y1={STRIP_Y - 26} x2={markerX} y2={wavelength > 750 ? STRIP_Y + STRIP_BAND_HEIGHT : STRIP_Y} stroke={RECEIVED_COLOR} strokeWidth={3} />
      <polygon points={`${markerX},${STRIP_Y} ${markerX - 7},${STRIP_Y - 12} ${markerX + 7},${STRIP_Y - 12}`} fill={RECEIVED_COLOR} />
      <text x={markerX} y={STRIP_Y - 32} fill={RECEIVED_COLOR} fontSize="11" fontWeight="bold" textAnchor={labelAnchor}>
        orange marker: as received, {formatWavelength(wavelength)}
      </text>

      <circle cx={24} cy={STRIP_HEIGHT - 44} r={4} fill={TRAVELER_COLOR} />
      <text x={34} y={STRIP_HEIGHT - 40} fill="#e2e8f0" fontSize="10">
        the traveler, carrying a lamp
      </text>
      <line x1={220} y1={STRIP_HEIGHT - 44} x2={234} y2={STRIP_HEIGHT - 44} stroke={LAMP_COLOR} strokeWidth={3} />
      <text x={240} y={STRIP_HEIGHT - 40} fill="#e2e8f0" fontSize="10">
        a crest of the light as emitted
      </text>
      <line x1={420} y1={STRIP_HEIGHT - 44} x2={434} y2={STRIP_HEIGHT - 44} stroke={RECEIVED_COLOR} strokeWidth={3} />
      <text x={440} y={STRIP_HEIGHT - 40} fill="#e2e8f0" fontSize="10">
        a crest as received
      </text>
      <text x={24} y={STRIP_HEIGHT - 20} fill="#94a3b8" fontSize="10">
        The bands are the usual ranges, not sharp edges. Only the wavelength is shown, not how bright the light is.
      </text>

      {/* Guess 1: a white marker on the strip. A place, not a size: it shows which kind of answer was given. */}
      {guess &&
        (() => {
          const marker = colorGuessMarker(guess)
          const target =
            marker.kind === 'at-lamp'
              ? { x: lampX, y: midY }
              : marker.kind === 'left-of-lamp'
                ? { x: xFor(300), y: midY }
                : marker.kind === 'stop-bar'
                  ? { x: xFor(1e5), y: midY }
                  : { x: STRIP_RIGHT - 34, y: STRIP_Y + STRIP_BAND_HEIGHT - 16 }
          return (
            <g>
              <GuessBox x={(STRIP_LEFT + STRIP_RIGHT) / 2 - 98} y={STRIP_Y + STRIP_BAND_HEIGHT + 62} text={colorText[guess]} target={target} />
              {marker.kind === 'at-lamp' && <circle cx={target.x} cy={target.y} r={7} {...WHITE_MARK} />}
              {marker.kind === 'left-of-lamp' && (
                <polygon points={`${target.x - 9},${target.y} ${target.x + 7},${target.y - 9} ${target.x + 7},${target.y + 9}`} {...WHITE_SOLID} />
              )}
              {marker.kind === 'stop-bar' && (
                <g>
                  <line x1={target.x} y1={STRIP_Y + 8} x2={target.x} y2={STRIP_Y + STRIP_BAND_HEIGHT - 8} stroke="#ffffff" strokeWidth={5} />
                  <line x1={target.x - 8} y1={STRIP_Y + 8} x2={target.x + 8} y2={STRIP_Y + 8} stroke="#ffffff" strokeWidth={3} />
                  <line x1={target.x - 8} y1={STRIP_Y + STRIP_BAND_HEIGHT - 8} x2={target.x + 8} y2={STRIP_Y + STRIP_BAND_HEIGHT - 8} stroke="#ffffff" strokeWidth={3} />
                </g>
              )}
              {marker.kind === 'arrow-to-right-edge' && (
                <g>
                  <line x1={target.x - 26} y1={target.y} x2={target.x + 14} y2={target.y} stroke="#ffffff" strokeWidth={4} />
                  <polygon points={`${target.x + 24},${target.y} ${target.x + 10},${target.y - 9} ${target.x + 10},${target.y + 9}`} {...WHITE_SOLID} />
                </g>
              )}
            </g>
          )
        })()}
    </svg>
  )
}

// The received wavelength against the traveler's gap above the horizon, over shaded stripes for each band. With guesses it draws the white
// marks for guess 1 (at the right-hand end of the curve) and guess 2 (at the 750 nm line). With `panel` it adds the small panel below for guess 3.
export function WavelengthGraph({
  result,
  progress,
  guesses,
  panel,
}: {
  result: ColorOfTheFallResult
  progress: number
  guesses?: { color: ColorChoice; visible: VisibleChoice } | null
  panel?: { complete: boolean; guess: MassChoice | null }
}) {
  const widest = result.curve[0].gap
  const logWidest = Math.log10(widest)
  const logSmallest = Math.log10(SMALLEST_GAP_IN_HORIZON_RADII)
  const logBottom = 2 // 100 nm
  const logTop = Math.ceil(Math.log10(result.curve[result.curve.length - 1].wavelengthNm) + 0.05)
  const xFor = (gap: number) => GRAPH_LEFT + ((logWidest - Math.log10(gap)) / (logWidest - logSmallest)) * (GRAPH_RIGHT - GRAPH_LEFT)
  const yFor = (nm: number) => GRAPH_BOTTOM - ((Math.log10(nm) - logBottom) / (logTop - logBottom)) * (GRAPH_BOTTOM - GRAPH_TOP)
  const clampY = (nm: number) => Math.min(Math.max(yFor(nm), GRAPH_TOP), GRAPH_BOTTOM)
  const line = result.curve.map((p) => `${xFor(p.gap)},${yFor(p.wavelengthNm)}`).join(' ')
  const gapTicks: number[] = []
  for (let k = Math.ceil(logSmallest); k <= Math.floor(logWidest); k++) gapTicks.push(10 ** k)
  const nmTicks = Array.from({ length: logTop - logBottom + 1 }, (_, i) => 10 ** (logBottom + i))

  const start = result.startInHorizonRadii
  const gap = Math.max(gapAt(result, progress), SMALLEST_GAP_IN_HORIZON_RADII)
  const wavelength = receivedWavelengthNm(start, Math.min(1 + gap, start))
  const lastPoint = result.curve[result.curve.length - 1]
  const height = GRAPH_HEIGHT + (panel ? PANEL_HEIGHT : 0)

  return (
    <svg
      viewBox={`0 0 ${GRAPH_WIDTH} ${height}`}
      width="100%"
      style={{
        marginTop: '1rem',
        display: 'block',
        maxWidth: `${GRAPH_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <defs>
        <clipPath id="wavelength-plot">
          <rect x={GRAPH_LEFT} y={GRAPH_TOP} width={GRAPH_RIGHT - GRAPH_LEFT} height={GRAPH_BOTTOM - GRAPH_TOP + 1} />
        </clipPath>
      </defs>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The wavelength against the traveler's distance
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: gap above the horizon (log, farther on the left). Vertical: wavelength as received (log).
      </text>

      {/* The bands, as shaded stripes */}
      <g clipPath="url(#wavelength-plot)">
        {BANDS.map((b) => {
          const top = clampY(Math.min(b.toNm, 10 ** logTop))
          const bottom = clampY(Math.max(b.fromNm, 10 ** logBottom))
          const fill = { ultraviolet: '#4c1d95', visible: '#166534', infrared: '#7f1d1d', microwave: '#78350f', radio: '#1e293b' }[b.name]
          return bottom > top ? (
            <g key={b.name}>
              <rect x={GRAPH_LEFT} y={top} width={GRAPH_RIGHT - GRAPH_LEFT} height={bottom - top} fill={fill} fillOpacity={0.45} />
              <text x={GRAPH_LEFT + 8} y={Math.min(top + 14, (top + bottom) / 2 + 4)} fill="#e2e8f0" fontSize="10" fontWeight="bold">
                {BAND_LABEL[b.name]}
              </text>
            </g>
          ) : null
        })}
      </g>

      {nmTicks.map((nm) => (
        <g key={nm}>
          <line x1={GRAPH_LEFT} y1={yFor(nm)} x2={GRAPH_RIGHT} y2={yFor(nm)} stroke="#334155" />
          <text x={GRAPH_LEFT - 8} y={yFor(nm) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {formatWavelength(nm)}
          </text>
        </g>
      ))}
      <text x={14} y={(GRAPH_TOP + GRAPH_BOTTOM) / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}>
        wavelength as received
      </text>
      {gapTicks.map((g) => (
        <g key={g}>
          <line x1={xFor(g)} y1={GRAPH_BOTTOM} x2={xFor(g)} y2={GRAPH_BOTTOM + 5} stroke="#94a3b8" />
          <text x={xFor(g)} y={GRAPH_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {formatNumber(g)}
          </text>
        </g>
      ))}
      <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_BOTTOM + 36} fill="#94a3b8" fontSize="11" textAnchor="middle">
        gap above the horizon, in horizon radii (the traveler falls to the right)
      </text>

      {/* The lamp's own color, if nothing stretched it, and the two edges worth marking */}
      <line x1={GRAPH_LEFT} y1={yFor(LAMP_WAVELENGTH_NM)} x2={GRAPH_RIGHT} y2={yFor(LAMP_WAVELENGTH_NM)} stroke={LAMP_COLOR} strokeDasharray="5 4" />
      <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={yFor(LAMP_WAVELENGTH_NM) + 14} fill={LAMP_COLOR} fontSize="10" textAnchor="middle">
        the lamp's own color, 550 nm: where the line would stay if nothing stretched it
      </text>
      <line x1={GRAPH_LEFT} y1={yFor(750)} x2={GRAPH_RIGHT} y2={yFor(750)} stroke={REFERENCE_COLOR} strokeDasharray="2 4" strokeOpacity={0.9} />
      <text x={GRAPH_RIGHT - 6} y={yFor(750) - 12} fill={REFERENCE_COLOR} fontSize="10" textAnchor="end">
        750 nm: the red edge of visible light
      </text>
      <line x1={GRAPH_LEFT} y1={yFor(1e6)} x2={GRAPH_RIGHT} y2={yFor(1e6)} stroke={REFERENCE_COLOR} strokeDasharray="2 4" strokeOpacity={0.9} />
      <text x={GRAPH_LEFT + 300} y={yFor(1e6) - 5} fill={REFERENCE_COLOR} fontSize="10">
        1 mm: microwaves begin
      </text>

      <g clipPath="url(#wavelength-plot)">
        <polyline points={line} fill="none" stroke={RECEIVED_COLOR} strokeWidth={3.5} />
      </g>
      <text x={xFor(lastPoint.gap) - 12} y={yFor(lastPoint.wavelengthNm) - 8} fill={RECEIVED_COLOR} fontSize="10" textAnchor="end">
        keeps going, no limit
      </text>
      {progress > 0 && <circle cx={xFor(gap)} cy={yFor(wavelength)} r={5} fill={TRAVELER_COLOR} stroke={RECEIVED_COLOR} strokeWidth={2} />}

      <line x1={96} y1={GRAPH_HEIGHT - 60} x2={126} y2={GRAPH_HEIGHT - 60} stroke={RECEIVED_COLOR} strokeWidth={4} />
      <text x={132} y={GRAPH_HEIGHT - 56} fill={RECEIVED_COLOR} fontSize="11">
        the wavelength the observer receives
      </text>
      <line x1={96} y1={GRAPH_HEIGHT - 42} x2={126} y2={GRAPH_HEIGHT - 42} stroke={LAMP_COLOR} strokeWidth={2} strokeDasharray="5 4" />
      <text x={132} y={GRAPH_HEIGHT - 38} fill={LAMP_COLOR} fontSize="11">
        the lamp's own wavelength
      </text>
      <circle cx={400} cy={GRAPH_HEIGHT - 60} r={5} fill={TRAVELER_COLOR} stroke={RECEIVED_COLOR} strokeWidth={2} />
      <text x={412} y={GRAPH_HEIGHT - 56} fill="#e2e8f0" fontSize="11">
        the traveler, now
      </text>
      <text x={96} y={GRAPH_HEIGHT - 16} fill="#94a3b8" fontSize="10">
        Shaded stripes are the usual ranges of each kind of light, not sharp edges.
      </text>

      {/* Guesses 1 and 2: white markers on the real graph. Places, not sizes. */}
      {guesses &&
        (() => {
          const c = colorGuessMarker(guesses.color)
          const v = visibleGuessMarker(guesses.visible)
          const colorTarget =
            c.kind === 'at-lamp'
              ? { x: GRAPH_RIGHT - 30, y: yFor(LAMP_WAVELENGTH_NM) }
              : c.kind === 'left-of-lamp'
                ? { x: GRAPH_RIGHT - 30, y: yFor(LAMP_WAVELENGTH_NM) + 22 }
                : c.kind === 'stop-bar'
                  ? { x: GRAPH_RIGHT - 30, y: yFor(2e4) }
                  : { x: GRAPH_RIGHT - 30, y: GRAPH_TOP + 12 }
          const visibleX = v.kind === 'right-end' ? GRAPH_RIGHT - 6 : v.kind === 'near-right-end' ? xFor(0.01) : xFor(1)
          const visibleTarget = { x: visibleX, y: yFor(750) }
          return (
            <g>
              <GuessBox x={GRAPH_LEFT + 84} y={GRAPH_TOP + 4} text={colorText[guesses.color]} target={colorTarget} />
              <GuessBox x={GRAPH_LEFT + 84} y={GRAPH_TOP + 48} text={visibleText[guesses.visible]} target={visibleTarget} />
              {c.kind === 'at-lamp' && <circle cx={colorTarget.x} cy={colorTarget.y} r={7} {...WHITE_MARK} />}
              {c.kind === 'left-of-lamp' && (
                <polygon points={`${colorTarget.x},${colorTarget.y + 8} ${colorTarget.x - 8},${colorTarget.y - 6} ${colorTarget.x + 8},${colorTarget.y - 6}`} {...WHITE_SOLID} />
              )}
              {c.kind === 'stop-bar' && <line x1={colorTarget.x} y1={colorTarget.y - 16} x2={colorTarget.x} y2={colorTarget.y + 16} stroke="#ffffff" strokeWidth={5} />}
              {c.kind === 'arrow-to-right-edge' && (
                <polygon points={`${colorTarget.x},${colorTarget.y - 8} ${colorTarget.x - 9},${colorTarget.y + 10} ${colorTarget.x + 9},${colorTarget.y + 10}`} {...WHITE_SOLID} />
              )}
              <circle cx={visibleTarget.x} cy={visibleTarget.y} r={8} {...WHITE_MARK} />
            </g>
          )
        })()}

      {/* The small panel for guess 3, with its own title and scale: the color at 5 horizon radii for two black holes */}
      {panel &&
        (() => {
          const y0 = GRAPH_HEIGHT + 6
          const columns = massPanelColumns()
          const left = 170
          const scale = 220 // pixels for 1,000 nm
          const xNm = (nm: number) => left + (nm / 1000) * scale
          const barY = [y0 + 50, y0 + 88]
          const rowLabels = ['10-Sun black hole', 'M87*']
          const target =
            panel.guess === null
              ? null
              : (() => {
                  const m = massGuessMarker(panel.guess)
                  const end = xNm(columns[0].wavelengthNm)
                  return m.target === 'small-column'
                    ? { x: end, y: barY[0] + 11 }
                    : m.target === 'big-column'
                      ? { x: xNm(columns[1].wavelengthNm), y: barY[1] + 11 }
                      : { x: end, y: (barY[0] + barY[1]) / 2 + 11 }
                })()
          return (
            <g>
              <line x1={0} y1={y0 - 4} x2={GRAPH_WIDTH} y2={y0 - 4} stroke="#334155" />
              <text x={12} y={y0 + 16} fill="#e2e8f0" fontSize="12" fontWeight="bold">
                The color at {MASS_PANEL_DISTANCE_IN_HORIZON_RADII} horizon radii from the center, for two black holes
              </text>
              <text x={12} y={y0 + 32} fill="#94a3b8" fontSize="11">
                A fall from rest at 10 horizon radii. Wavelength as received, on its own linear scale (0 to 1,000 nm).
              </text>
              {!panel.complete ? (
                <text x={left} y={y0 + 70} fill="#94a3b8" fontSize="11">
                  Drawn when the run finishes.
                </text>
              ) : (
                <g>
                  {[0, 250, 500, 750, 1000].map((nm) => (
                    <g key={nm}>
                      <line x1={xNm(nm)} y1={y0 + 44} x2={xNm(nm)} y2={y0 + 122} stroke="#334155" />
                      <text x={xNm(nm)} y={y0 + 136} fill="#94a3b8" fontSize="10" textAnchor="middle">
                        {formatNumber(nm)}
                      </text>
                    </g>
                  ))}
                  <text x={xNm(500)} y={y0 + 152} fill="#94a3b8" fontSize="10" textAnchor="middle">
                    wavelength as received (nm)
                  </text>
                  {columns.map((col, i) => (
                    <g key={col.presetId}>
                      <text x={left - 8} y={barY[i] + 15} fill="#e2e8f0" fontSize="11" textAnchor="end">
                        {rowLabels[i]}
                      </text>
                      <rect x={left} y={barY[i]} width={xNm(col.wavelengthNm) - left} height={22} fill={RECEIVED_COLOR} />
                      <text x={left + 8} y={barY[i] + 15} fill="#0b1020" fontSize="11" fontWeight="bold">
                        {formatWavelength(col.wavelengthNm)}
                      </text>
                    </g>
                  ))}
                  {panel.guess && target && (
                    <g>
                      <GuessBox x={GRAPH_RIGHT - 160} y={y0 + 56} width={186} text={massText[panel.guess]} target={target} />
                      {massGuessMarker(panel.guess).target === 'both-columns' ? (
                        <rect x={target.x - 6} y={barY[0] - 4} width={12} height={barY[1] + 26 - barY[0]} rx={6} {...WHITE_MARK} />
                      ) : (
                        <circle cx={target.x} cy={target.y} r={8} {...WHITE_MARK} />
                      )}
                    </g>
                  )}
                </g>
              )}
            </g>
          )
        })()}
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// The captions. Each names every drawn thing, defines its terms, gives a worked moment and "what to look for" in three parts. The mechanism
// ("why the crests are stretched by the same number") and every verdict are left to the tutor (CLAUDE.md §12, §13, §14).
// ---------------------------------------------------------------------------------------------------------------
const list = { margin: '0.25rem 0 0.5rem', paddingLeft: '1.25rem' } as const

function LookFor({ look, means, matters }: { look: ReactNode; means: ReactNode; matters: ReactNode }) {
  return (
    <li style={{ marginBottom: '0.3rem' }}>
      <strong>Look at</strong> {look} <strong>What it means:</strong> {means} <strong>Why it matters:</strong> {matters}
    </li>
  )
}

export function StripCaption({ result, started, complete, own, withGuess }: { result: ColorOfTheFallResult; started: boolean; complete: boolean; own?: boolean; withGuess?: boolean }) {
  const steps = workedSteps(result.startInHorizonRadii)
  const distance = workedDistance(result.startInHorizonRadii)
  const end = curveEnd(result)
  return (
    <div style={CAPTION_STYLE}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read {own ? 'Picture 3' : 'Picture 1'}: the color of the lamp, as received.</strong> This picture is made for you from the formulas the experiment is built on. The traveler falls toward the black hole carrying a lamp that shines a steady green light straight outward. A far-away observer, at rest, receives the light and measures its wavelength. A <em>wavelength</em> is the distance from one crest of a light wave to the next, and a nanometer (nm) is a billionth of a meter.
      </p>
      <ul style={list}>
        <li>
          <strong>The top part.</strong> The cyan dot is the traveler, with the lamp. The green lines on the left are crests of the light as emitted, at the lamp. The orange lines on the right are the crests as received, at the observer. Under them, the picture says how many times as far apart the crests are at the observer. This is only drawn to scale up to 20 times.
        </li>
        <li>
          <strong>The strip.</strong> It is a scale of all the wavelengths, from short (left) to long (right). Each step to the right is ten times longer, so one strip covers a huge range: 100 nm (ultraviolet) to 10 m (radio). It is divided into the usual kinds of light: ultraviolet, visible light (drawn as the rainbow), infrared, microwave and radio waves. The edges are conventions, not sharp lines. Visible light is drawn from about 380 nm (violet) to about 750 nm (red); NASA’s page says the eye typically detects up to about 700 nm, so the red edge is a round figure chosen for this page.
        </li>
        <li>
          <strong>The green marker</strong> below the strip is the lamp’s own wavelength, {LAMP_WAVELENGTH_NM} nm, “as emitted”. It never moves. <strong>The orange marker</strong> above the strip is the wavelength as received, and it moves as the traveler falls. Its number and its kind of light are written beside it.
        </li>
        {withGuess && complete && (
          <li>
            <strong>The white YOUR GUESS box</strong> is your first guess, joined by a line to a white mark on the strip. A white mark is only a marker: it shows which kind of answer you gave and where it belongs on the strip, not a number you chose. A longer white arrow does not mean a bigger guess.
          </li>
        )}
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>What appears when.</strong> Before the run the picture is not drawn. During the run the traveler falls and the orange marker moves to the right. When the run has finished, the picture stays and, if you made a guess, your white mark is drawn.
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong> At {distance} horizon radii from the center the orange marker is at {withBand(steps.wavelengthNm)}, which is {LAMP_WAVELENGTH_NM} nm × {formatNumber(steps.stretch)}. The green marker has not moved: it is still at {LAMP_WAVELENGTH_NM} nm.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        {started && (
          <LookFor
            look="the orange marker at the start of the fall."
            means={`it is at ${withBand(result.wavelengthAtReleaseNm)}, against the lamp’s ${LAMP_WAVELENGTH_NM} nm.`}
            matters="the color already differs from the lamp’s before the traveler is moving fast."
          />
        )}
        {complete && (
          <LookFor
            look="where the orange marker crosses the red edge of the rainbow."
            means={
              result.leavesVisibleAt === null
                ? 'it is already past 750 nm at the release, so it never starts inside the rainbow.'
                : `it passes 750 nm at ${formatNumber(result.leavesVisibleAt)} horizon radii from the center, ${formatNumber(result.leavesVisibleAt - 1)} horizon radii above the horizon.`
            }
            matters="it says how far from the horizon the lamp’s light stops being visible light."
          />
        )}
        {complete && (
          <LookFor
            look="the orange marker at the end of the run."
            means={`it is at ${withBand(end.wavelengthNm)}, at a gap of ${formatGap(SMALLEST_GAP_IN_HORIZON_RADII)} above the horizon.`}
            matters="it shows which kinds of light the color has passed through on the way."
          />
        )}
      </ul>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>A limit.</strong> This follows the wavelength only, for a lamp shining straight outward. It is not what a camera would see, it does not say how bright the light is, and it stops at the horizon: nothing inside is shown.
      </p>
    </div>
  )
}

export function GraphCaption({
  result,
  complete,
  own,
  withGuesses,
}: {
  result: ColorOfTheFallResult
  complete: boolean
  own?: boolean
  withGuesses?: boolean
}) {
  const steps = workedSteps(result.startInHorizonRadii)
  const distance = workedDistance(result.startInHorizonRadii)
  const end = curveEnd(result)
  const columns = massPanelColumns()
  const near = nearHorizonReadings(result.startInHorizonRadii)
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${GRAPH_WIDTH}px` }}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read {own ? 'Picture 4' : 'Picture 2'}: the wavelength against the traveler’s distance.</strong> This picture is made for you from the formulas the experiment is built on.
      </p>
      <ul style={list}>
        <li>
          <strong>The vertical axis</strong> is the wavelength the observer receives, on a log scale, so each step up is ten times longer. The shaded stripes are the kinds of light, as on the strip.
        </li>
        <li>
          <strong>The horizontal axis</strong> is the gap above the horizon: how far the traveler is above the horizon, in horizon radii (their distance from the center, minus 1). A traveler 10 horizon radii from the center is 9 horizon radii above the horizon; at 1.0001 from the center the gap is 0.0001. It is a distance, not a time. The traveler starts at the left and falls to the right, so the gap shrinks, and each step to the right is a gap ten times smaller.
        </li>
        <li>
          <strong>The orange curve</strong> is the wavelength the observer receives when the traveler is at each gap. <strong>The cyan dot</strong> is where the traveler is now. <strong>The green dashed line</strong> is the lamp’s own color, 550 nm: where the curve would stay if nothing stretched it. <strong>The grey dotted lines</strong> mark 750 nm, the red edge of visible light, and 1 mm, where microwaves begin (a microwave is 1 mm to 1 m long).
        </li>
        {!own && complete && (
          <li>
            <strong>The small panel below the graph</strong> has its own title and its own scale, from 0 to 1,000 nm. It shows the wavelength the observer receives at {MASS_PANEL_DISTANCE_IN_HORIZON_RADII} horizon radii from the center, as a bar for each of two black holes: the 10-Sun black hole and M87*. A longer bar is a longer wavelength.
          </li>
        )}
        {withGuesses && complete && (
          <li>
            <strong>The white YOUR GUESS boxes</strong> are your guesses, each joined by a line to a white mark: your first guess at the right-hand end of the curve, your second at the grey 750 nm line, and your third beside the bars in the small panel. A white mark is only a marker: it shows which kind of answer you gave and where it belongs, not a number you chose. Where the answer is a yes or a no, the mark is only a marker.
          </li>
        )}
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>What appears when.</strong> The curve and the lines are drawn at once. During the run the cyan dot moves from the left along the curve. When the run has finished, the small panel is drawn, and your white marks are drawn beside the features they are about.
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong> At {distance} horizon radii the curve is at {withBand(steps.wavelengthNm)}. At 2 horizon radii (if the traveler has got that far) it is at {formatWavelength(receivedWavelengthNm(result.startInHorizonRadii, Math.min(2, result.startInHorizonRadii)))}, and at a gap of {formatGap(near[2].gap)} above the horizon it is at {withBand(near[2].wavelengthNm)}.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        {complete && (
          <LookFor
            look="where the orange curve crosses the grey 750 nm line."
            means={
              result.leavesVisibleAt === null
                ? 'it is already above 750 nm at the left-hand end.'
                : `that is ${formatNumber(result.leavesVisibleAt)} horizon radii from the center, ${formatNumber(result.leavesVisibleAt - 1)} above the horizon.`
            }
            matters="it shows how far from the horizon the lamp’s light stops being visible."
          />
        )}
        {complete && (
          <LookFor
            look="the right-hand end of the orange curve."
            means={`it reaches ${withBand(end.wavelengthNm)} at a gap of ${formatGap(SMALLEST_GAP_IN_HORIZON_RADII)} and is still rising where the picture stops.`}
            matters="the picture stops there only because it must stop somewhere."
          />
        )}
        {!own && complete && (
          <LookFor
            look="the two bars in the small panel."
            means={`they are ${formatWavelength(columns[0].wavelengthNm)} for the 10-Sun black hole and ${formatWavelength(columns[1].wavelengthNm)} for M87*, drawn at the same distance in horizon radii.`}
            matters="it shows the color at the same distance in horizon radii, for two very different black holes."
          />
        )}
      </ul>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>A limit.</strong> The curve is drawn until the traveler is {formatGap(SMALLEST_GAP_IN_HORIZON_RADII)} horizon radii above the horizon and then stops. That is only where the drawing ends.
      </p>
    </div>
  )
}
