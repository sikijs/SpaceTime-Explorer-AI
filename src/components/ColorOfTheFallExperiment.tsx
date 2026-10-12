import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  BANDS,
  BLACK_HOLE_PRESETS,
  LAMP_WAVELENGTH_NM,
  SMALLEST_GAP_IN_HORIZON_RADII,
  bandOf,
  receivedWavelengthNm,
  runColorOfTheFallExperiment,
  stretchFactor,
} from '../physics/colorOfTheFallExperiment'
import type { ColorOfTheFallResult } from '../physics/colorOfTheFallExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'

interface ColorOfTheFallExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The traveler's
// gap above the horizon shrinks by the same factor in each equal slice of it, as on the graph's logarithmic axis.
const ANIMATION_DURATION_MS = 10_000

const KM_PER_AU = 149_597_870.7

const LAMP_COLOR = '#4ade80' // the lamp's own color, as emitted
const RECEIVED_COLOR = '#fb923c' // the color as received by the observer, orange as the observer's clock in Experiment 6
const REFERENCE_COLOR = '#e2e8f0'
const TRAVELER_COLOR = '#22d3ee' // the traveler, cyan as the traveler's watch in Experiment 6

const START_PRESETS = [100, 20, 10, 5, 2]

// The color strip (the first picture): wavelength on a logarithmic axis from 100 nm to 10 m.
const STRIP_WIDTH = 640
const STRIP_HEIGHT = 440
const STRIP_LEFT = 30
const STRIP_RIGHT = 610
const STRIP_Y = 222
const STRIP_BAND_HEIGHT = 84
const STRIP_MIN_NM = 100
const STRIP_MAX_NM = 1e10
const CREST_SPACING_PX = 14
const MAX_DRAWN_STRETCH = 20

// The wavelength graph (the second picture).
const GRAPH_WIDTH = 640
const GRAPH_HEIGHT = 440
const GRAPH_LEFT = 84
const GRAPH_RIGHT = 610
const GRAPH_TOP = 66
const GRAPH_BOTTOM = 300

const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }

const BAND_FILL: Record<string, string> = {
  ultraviolet: '#4c1d95',
  visible: 'url(#visible-rainbow)',
  infrared: '#7f1d1d',
  microwave: '#78350f',
  radio: '#1e293b',
}
const BAND_LABEL: Record<string, string> = {
  ultraviolet: 'ultraviolet',
  visible: 'visible light',
  infrared: 'infrared',
  microwave: 'microwave',
  radio: 'radio waves',
}

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

// A number in plain form when it is moderate, as a power of ten when it is very large or very small.
function formatBig(value: number): string {
  if (value >= 0.01 && value < 10_000) return formatNumber(value)
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Number((value / 10 ** exponent).toPrecision(2))
  return `${mantissa} × 10${String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')}`
}

// A length in plain units, from meters to trillions of kilometers.
function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

// Kilometers, with astronomical units added once that is the more natural unit.
function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}

function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// A wavelength in the unit that fits it, from nanometers to meters.
function formatWavelength(nm: number): string {
  if (nm < 1000) return `${formatNumber(nm)} nm`
  if (nm < 1e6) return `${formatNumber(nm / 1e3)} µm`
  if (nm < 1e9) return `${formatNumber(nm / 1e6)} mm`
  return `${formatNumber(nm / 1e9)} m`
}

// A gap above the horizon, with enough digits to tell 0.01 from 0.001.
const formatGap = (gap: number) => (gap >= 1 ? formatNumber(gap) : String(Number(gap.toPrecision(2))))

// Where the traveler is at a given point of the playback: the gap above the horizon falls from the release gap to the
// smallest gap, by the same factor in each equal slice of the playback.
function gapAt(result: ColorOfTheFallResult, progress: number): number {
  const widest = result.startInHorizonRadii - 1
  return widest * (SMALLEST_GAP_IN_HORIZON_RADII / widest) ** progress
}

// The first picture: the traveler's lamp and the observer's view of its crests, and the strip of colors, with the lamp's
// own wavelength (fixed) and the wavelength as received (moving).
function ColorStrip({ result, progress }: { result: ColorOfTheFallResult; progress: number }) {
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

  const bandEdge = (name: string) => BANDS.find((b) => b.name === name)!
  const bandRect = (name: string) => {
    const b = bandEdge(name)
    const from = xFor(Math.max(b.fromNm, STRIP_MIN_NM))
    const to = xFor(Math.min(b.toNm, STRIP_MAX_NM))
    return { from, to }
  }
  const markerX = xFor(Math.min(Math.max(wavelength, STRIP_MIN_NM), STRIP_MAX_NM))
  const lampX = xFor(LAMP_WAVELENGTH_NM)
  const labelAnchor = markerX > STRIP_RIGHT - 130 ? 'end' : markerX < STRIP_LEFT + 130 ? 'start' : 'middle'

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
        Traveler {String(Number(r.toPrecision(6)))} horizon radii from the center ({formatGap(gap)} above the horizon) · stretch factor{' '}
        {formatBig(factor)}
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
                y={STRIP_Y + STRIP_BAND_HEIGHT / 2}
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(-90 ${(from + to) / 2 + 4} ${STRIP_Y + STRIP_BAND_HEIGHT / 2})`}
              >
                {BAND_LABEL[b.name]}
              </text>
            ) : (
              <text x={(from + to) / 2} y={STRIP_Y + STRIP_BAND_HEIGHT / 2 + 4} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
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
    </svg>
  )
}

// The received wavelength against the traveler's gap above the horizon, over shaded stripes for each band.
function WavelengthGraph({ result, progress }: { result: ColorOfTheFallResult; progress: number }) {
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

  return (
    <svg
      viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
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
      <text x={GRAPH_RIGHT - 6} y={yFor(LAMP_WAVELENGTH_NM) + 14} fill={LAMP_COLOR} fontSize="10" textAnchor="end">
        the lamp's own color, 550 nm: where the line would stay if nothing stretched it
      </text>
      <line x1={GRAPH_LEFT} y1={yFor(750)} x2={GRAPH_RIGHT} y2={yFor(750)} stroke={REFERENCE_COLOR} strokeDasharray="2 4" strokeOpacity={0.7} />
      <text x={GRAPH_RIGHT - 6} y={yFor(750) - 5} fill={REFERENCE_COLOR} fontSize="10" textAnchor="end">
        750 nm: the red edge of visible light
      </text>
      <line x1={GRAPH_LEFT} y1={yFor(1e6)} x2={GRAPH_RIGHT} y2={yFor(1e6)} stroke={REFERENCE_COLOR} strokeDasharray="2 4" strokeOpacity={0.7} />
      <text x={GRAPH_LEFT + 8} y={yFor(1e6) - 5} fill={REFERENCE_COLOR} fontSize="10">
        1 mm: where microwaves begin
      </text>

      <g clipPath="url(#wavelength-plot)">
        <polyline points={line} fill="none" stroke={RECEIVED_COLOR} strokeWidth={3.5} />
      </g>
      <text x={xFor(lastPoint.gap) - 6} y={yFor(lastPoint.wavelengthNm) + 14} fill={RECEIVED_COLOR} fontSize="10" textAnchor="end">
        keeps going, no limit
      </text>
      {progress > 0 && <circle cx={xFor(gap)} cy={yFor(wavelength)} r={5} fill="#ffffff" stroke={RECEIVED_COLOR} strokeWidth={2} />}

      <line x1={96} y1={GRAPH_HEIGHT - 60} x2={126} y2={GRAPH_HEIGHT - 60} stroke={RECEIVED_COLOR} strokeWidth={4} />
      <text x={132} y={GRAPH_HEIGHT - 56} fill={RECEIVED_COLOR} fontSize="11">
        the wavelength the observer receives
      </text>
      <line x1={96} y1={GRAPH_HEIGHT - 42} x2={126} y2={GRAPH_HEIGHT - 42} stroke={LAMP_COLOR} strokeWidth={2} strokeDasharray="5 4" />
      <text x={132} y={GRAPH_HEIGHT - 38} fill={LAMP_COLOR} fontSize="11">
        the lamp's own wavelength
      </text>
      <circle cx={400} cy={GRAPH_HEIGHT - 60} r={5} fill="#ffffff" stroke={RECEIVED_COLOR} strokeWidth={2} />
      <text x={412} y={GRAPH_HEIGHT - 56} fill="#e2e8f0" fontSize="11">
        where the traveler is now
      </text>
      <text x={96} y={GRAPH_HEIGHT - 16} fill="#94a3b8" fontSize="10">
        Shaded stripes are the usual ranges of each kind of light, not sharp edges.
      </text>
    </svg>
  )
}

export function ColorOfTheFallExperiment({ onComplete }: ColorOfTheFallExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('stellar-black-hole')
  const [start, setStart] = useState(10)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const result = useMemo(() => runColorOfTheFallExperiment(presetId, start), [presetId, start])

  const handlePresetChange = (id: ObjectPreset['id']) => {
    setPresetId(id)
    setStatus('idle')
    setProgress(0)
  }

  const handleStartChange = (value: number) => {
    setStart(value)
    setStatus('idle')
    setProgress(0)
  }

  const handleRun = () => {
    if (status === 'running') return
    setStatus('running')
    setProgress(0)
  }

  useEffect(() => {
    if (status !== 'running') return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)

      if (fraction >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, onComplete])

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 7 — The Color of the Fall: What Color Does the Falling Traveler's Light Have?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Black hole:</p>
          {BLACK_HOLE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              disabled={status === 'running'}
              className={`toggle-button${presetId === p.id ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Release the traveler from rest at this distance from the black hole's center, in horizon radii:
          </p>
          {START_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleStartChange(d)}
              disabled={status === 'running'}
              className={`toggle-button${start === d ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {d}
            </button>
          ))}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            That is {formatDistance(result.startInHorizonRadii * result.horizonRadiusKm)} from the center. A horizon radius is
            the size of the black hole's edge.
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={status === 'running'}
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

        {/* Shown only once the current settings have been run: changing the black hole or the release distance returns to idle and hides it again. */}
        {status !== 'idle' && (
          <>
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {result.preset.label}: {formatMass(result.preset.massSolarMasses)}; horizon radius{' '}
              {formatDistance(result.horizonRadiusKm)}
              <br />
              Released from rest at {result.startInHorizonRadii} horizon radii (
              {formatDistance(result.startInHorizonRadii * result.horizonRadiusKm)}). The lamp is {LAMP_WAVELENGTH_NM} nm,
              green.
            </p>

            <div style={{ marginTop: '1rem', maxWidth: `${STRIP_WIDTH}px` }}>
              <ColorStrip result={result} progress={progress} />
              {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). */}
              <div style={CAPTION_STYLE}>
                <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                  <strong>How to read this picture: the color of the lamp, as received.</strong>
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>1. What is happening.</strong> The traveler falls toward the black hole carrying a lamp that
                  shines a steady green light straight outward, with a wavelength of 550 nm. A <em>wavelength</em> is the
                  distance from one crest of a light wave to the next, and a nanometer (nm) is a billionth of a meter. A
                  far-away observer, at rest, receives the light and measures its wavelength.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>2. The top part.</strong> The cyan dot is the traveler, with the lamp. The green lines on the left
                  are crests of the light as emitted, at the lamp, and the orange lines on the right are the same crests as
                  received by the observer. Under them, the picture says how many times as far apart the crests are at the
                  observer. That number is the stretch factor you met in Experiment 6.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>3. The strip.</strong> The strip is a scale of all the wavelengths, from short (left) to long
                  (right). Each step to the right is ten times longer, so the scale covers a huge range. It is divided into
                  the usual kinds of light: ultraviolet, visible light (drawn as the rainbow), infrared, microwave and radio
                  waves. The edges between them are conventions, not sharp lines.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>4. The two markers.</strong> The green marker below the strip is the lamp's own wavelength,
                  550 nm, and it never moves. The orange marker above the strip is the wavelength as received, and it moves
                  as the traveler falls.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>5. What is really happening.</strong> The lamp sends out one crest after another at equal steps
                  of its own clock, just as the traveler in Experiment 6 sent flashes at equal steps of their own watch. So
                  the crests reach the observer stretched apart in the same way as the flashes did, by the same stretch
                  factor: gravity slows the traveler's clock as seen from far away, and the traveler is moving away, so
                  each crest has a little farther to travel than the one before. The wavelength is the speed of light times
                  the time between crests, so it is longer by that same factor.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>6. How the picture shows it.</strong> The orange crests are farther apart than the green ones by
                  the stretch factor. The orange marker is the green marker's 550 nm multiplied by that factor, so it is
                  always to the right of the green marker, and the further the traveler has fallen the further to the right
                  it is. When the orange marker leaves the rainbow, the light is no longer visible light.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>7. What to watch.</strong> Where the orange marker is at the start, which kind of light it is in
                  as the traveler falls, and what it does near the end.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>A limit.</strong> This follows the wavelength only, for a lamp shining straight outward. It is not
                  what a camera would see, it does not say how bright the light is, and it stops at the horizon: nothing
                  inside is shown. The crests are drawn to scale only up to 20 times as far apart.
                </p>
              </div>
            </div>

            <WavelengthGraph result={result} progress={progress} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${GRAPH_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this graph: the wavelength against the traveler's distance.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What you are looking at.</strong> The vertical axis is the wavelength the observer receives, on a
                logarithmic scale, so each step up is ten times longer. The shaded stripes are the kinds of light, as in
                the strip. The dashed green line is the lamp's own wavelength, 550 nm: where the received wavelength would
                stay if nothing stretched it.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The gap above the horizon.</strong> This is the horizontal axis. It means how far the traveler is
                above the horizon, measured in horizon radii. It is the traveler's distance from the center of the black
                hole, minus 1 (the horizon is 1 horizon radius from the center). For example, a traveler 10 horizon radii
                from the center is 9 horizon radii above the horizon, and at 1.0001 from the center the gap is 0.0001. The
                traveler starts at the left and falls to the right, so the gap shrinks. Each step to the right is ten times
                smaller.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The curve and the dot.</strong> The orange curve is the wavelength the observer receives when the
                traveler is at each gap. The white dot is where the traveler is now. The two dotted lines mark 750 nm, the
                red edge of visible light, and 1 mm, where microwaves begin.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What is really happening.</strong> At each gap, the received wavelength is the lamp's 550 nm times
                the stretch factor of Experiment 6. That factor is the product of two effects (gravity slowing the
                traveler's clock, and the traveler moving away), and both keep growing as the traveler nears the horizon.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>How the picture shows it.</strong> At the left, the traveler has not started moving, so only gravity
                acts and the curve starts just above the dashed line. Moving right it climbs through the stripes, and near
                the right edge it is a straight line on this scale: each step ten times closer to the horizon makes the
                wavelength ten times longer. It does not level off.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> The curve is drawn until the traveler is 0.0001 horizon radii above the horizon
                (a tiny distance, explained above) and then stops, but that is only where the drawing ends.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
