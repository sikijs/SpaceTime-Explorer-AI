import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  DETECTORS,
  DIRECTION_PRESETS,
  TIMELINE_MAX_MS,
  TRIANGULATION_PART1_DIRECTION_INDEX,
  arrivalSummary,
  firstDetectorGuessMatches,
  gapVersusLimitWord,
  timingGuessMarker,
  timingGuessMatches,
  yourDirectionComparison,
} from '../physics/gravitationalWaveTriangulationExperiment'
import type {
  ArrivalSummary,
  DetectorName,
  FirstDetectorChoice,
  TimingChoice,
} from '../physics/gravitationalWaveTriangulationExperiment'
import { GravitationalWaveTriangulationTutor } from './GravitationalWaveTriangulationTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'

// Gravitational Waves, Experiment 6, audited to the newer rules (docs/audit/gravitational-waves/06-draft-wording.md): the page in four
// Parts, one Run at a fixed Direction A, a picture with two panels (the map; the timeline), the white YOUR GUESS marks for both
// predictions, pink marks for the learner's own direction in Part 2, a full caption on every picture, a reading guide for the results, a
// links list, a words box, a "Start over" button and a tutor that marks both guesses. Every number drawn or shown comes from the
// physics module (src/physics/gravitationalWaveTriangulationExperiment.ts; CLAUDE.md §9). The wording is the owner's, approved on
// 2026-11-07 as drafted, "approve with defaults" (CLAUDE.md §28.1).

interface GravitationalWaveTriangulationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const
const captionBox = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' } as const
const bulletList = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const
const f2 = (value: number) => value.toFixed(2)

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const DOT_COLOR = '#67e8f9'
const FLASH_COLOR = '#f5f3ff'
const ARROW_COLOR = '#fbbf24'
const WEDGE_ONE = '#a78bfa' // violet: an illustration; pink is only the learner's own choice
const WEDGE_TWO = '#34d399'

// A purely visual slowdown (CLAUDE.md §11): the real gaps are a few thousandths of a second, far too fast to watch. The largest gap
// of a run is played out over this many real milliseconds; no arrival time is changed.
const VISUAL_DURATION_MS = 5000
const WEDGE_SWEEP_MS = 1800

const detectorNames: FirstDetectorChoice[] = ['Hanford', 'Livingston', 'Virgo']
const timingChoices: Array<{ value: TimingChoice; label: string }> = [
  { value: 'same', label: 'Essentially the same instant' },
  { value: 'different', label: 'Measurably different times' },
]
const TIMING_BOX: Record<TimingChoice, string> = {
  same: 'all three at essentially the same instant',
  different: 'at measurably different times',
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages and papers fetched and read by a helper on 7 November 2026 (see the audit's draft wording, section 9).
const LINK_GROUPS: Array<{ heading: string; links: Array<{ href: string; label: string; what: string }> }> = [
  {
    heading: 'How detectors find a direction',
    links: [
      {
        href: 'https://www.ligo.caltech.edu/video/ligo20171016v5',
        label: 'LIGO Lab, Caltech: "Hearing the Wave"',
        what: 'a video that compares finding a source to turning your head towards a sound, with the two LIGO detectors as your two ears; the Hanford and Livingston data are analysed together to get the direction.',
      },
      {
        href: 'https://www.ligo.caltech.edu/page/ligo-detectors',
        label: 'LIGO Lab, Caltech: "LIGO’s Dual Detectors"',
        what: 'the two LIGO sites are 3,002 kilometres apart, and the page says how long a gravitational wave, travelling at light speed, can take to cross that distance. Virgo is in Italy.',
      },
      {
        href: 'https://www.ligo.caltech.edu/news/ligo20260526',
        label: 'LIGO Lab, Caltech: "GWTC-5.0: Updated LIGO-Virgo-KAGRA Catalog sets new records in precision gravitational wave astronomy" (26 May 2026)',
        what: 'two detectors place a source on a ring on the sky, and a third detector such as Virgo sharpens that by triangulation; the record, GW240615, was placed within about 6 square degrees. News style, readable.',
      },
    ],
  },
  {
    heading: 'Real events seen by three detectors',
    links: [
      {
        href: 'http://ligo.org/science-summaries/GW170814/',
        label: 'LIGO Scientific Collaboration: "GW170814: A three-detector observation of gravitational waves from a binary black hole coalescence"',
        what: 'the first wave seen by all three detectors, with the order in which they registered it; adding Virgo cut the possible area of sky from 1,160 square degrees (two detectors) to 100, and to 60 after the final analysis. Virgo is at Cascina, near Pisa, Italy. Semi-technical, readable.',
      },
      {
        href: 'https://ligo.org/detections/gw170817/',
        label: 'LIGO Scientific Collaboration: "GW170817"',
        what: 'before Virgo joined, the possible region of sky "wrapped around" the sky; once it joined, the region became far smaller, and telescopes then found the galaxy NGC 4993 and the light about 11 hours after the wave.',
      },
    ],
  },
  {
    heading: 'The original papers',
    links: [
      {
        href: 'https://arxiv.org/abs/1710.05832',
        label: '"GW170817: Observation of Gravitational Waves from a Binary Neutron Star Inspiral"',
        what: 'the abstract gives the sky region, 28 square degrees, and the distance, about 40 megaparsecs. Technical.',
      },
      {
        href: 'https://arxiv.org/abs/1710.05833',
        label: '"Multi-messenger Observations of a Binary Neutron Star Merger"',
        what: 'the abstract gives the first sky region, 31 square degrees. Technical.',
      },
    ],
  },
]

// The "Words and formulas" box. The formulas show how big the gaps can be, so they appear only after the Part 1 run (CLAUDE.md §12).
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Triangulation', meaning: 'finding a direction from the moments a signal reaches several places.' },
    { term: 'Detector', meaning: 'an instrument that notices a gravitational wave passing.' },
    { term: 'Hanford and Livingston', meaning: 'the two LIGO detectors, in the United States.' },
    { term: 'Virgo', meaning: 'the detector in Italy.' },
    { term: 'Wavefront', meaning: 'the flat front of the wave as it sweeps across the detectors.' },
    { term: 'c', meaning: 'the speed of light, about 300,000 kilometres every second. Gravitational waves travel at this speed too.' },
    { term: 'Millisecond (ms)', meaning: 'a thousandth of a second.' },
    { term: 'Arrival time', meaning: 'the moment the wave reaches a detector.' },
    { term: 'Arrival-time gap', meaning: 'how many milliseconds after the first detector a later detector registers the wave.' },
    { term: 'Network', meaning: 'several detectors working together.' },
    { term: 'Schematic map', meaning: 'a simplified drawing, not a real map. Only the distance between Hanford and Livingston is close to the real one; the Virgo distances on this map are not claimed to be real.' },
    { term: 'Illustration', meaning: 'a sketch to show an idea, not a calculation. The two shaded wedges are illustrations.' },
  ]
  if (afterRun) {
    const hl = arrivalSummary(DIRECTION_PRESETS[TRIANGULATION_PART1_DIRECTION_INDEX].directionDegrees).pairGaps[0]
    entries.push(
      {
        term: 'Formula: the most a gap can be',
        meaning: `the separation of the two detectors ÷ c. Example: Hanford and Livingston are 3,000 km apart on this map, so 3,000 ÷ 299,792 = 0.01001 seconds = ${f2(hl.limitMs)} milliseconds.`,
      },
      {
        term: 'Formula: arrival time',
        meaning: 'minus (the detector’s position along the direction the wave comes from) ÷ c, measured from the centre of the three detectors. A detector nearer the source is reached earlier.',
      },
    )
  }
  return entries
}

// ---- Small shared pieces ----
function WhereFrom({ measured, calculated, imagined, guess }: { measured: ReactNode; calculated: ReactNode; imagined: ReactNode; guess?: ReactNode }) {
  return (
    <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
      <strong>Where the real picture comes from.</strong> <em>Measured:</em> {measured} <em>Calculated here:</em> {calculated}{' '}
      {guess && (
        <>
          <em>Your guesses:</em> {guess}{' '}
        </>
      )}
      <em>Imagined for the question:</em> {imagined}
    </p>
  )
}

function LookFor({ items }: { items: Array<{ look: string; means: string; matters: string }> }) {
  return (
    <>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
    </>
  )
}

function Block({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: '1rem' }}>{children}</div>
}

function GuessTag({ n }: { n: 1 | 2 }) {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: GUESS_COLOR,
        backgroundColor: '#0b1020',
        border: `1px solid ${GUESS_COLOR}`,
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      guess {n}
    </span>
  )
}

// ---- Timing hooks: a timed run (0 to 1) and a sweep (0 to 1 once something has finished) ----
type RunStatus = 'idle' | 'running' | 'complete'

function useTimedRun(durationMs: number, onFinish?: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [progress, setProgress] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min(Math.max((now - startTime) / durationMs, 0), 1)
      setProgress(p)
      if (p >= 1) {
        setStatus('complete')
        finishRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, durationMs])

  const start = () => {
    setProgress(0)
    setStatus('running')
  }
  const reset = () => {
    setStatus('idle')
    setProgress(0)
  }
  return { status, progress, start, reset }
}

function useSweep(active: boolean, resetKey: number, durationMs: number) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!active) {
      setProgress(0)
      return
    }
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min((now - startTime) / durationMs, 1)
      setProgress(p)
      if (p < 1) frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [active, resetKey, durationMs])
  return progress
}

// ---- The drawing: Panel A (the map) ----
const WIDTH = 580
const MAP_SIZE = 320
const PADDING = 50
const A_TOP = 30 // room for the panel title
const A_BOX_Y = MAP_SIZE + 10 // the guess box sits under the map
const A_HEIGHT = A_TOP + A_BOX_Y + 32 + 10

// Maps the schematic km coordinates in the physics model onto the drawing. This scaling is a display concern only (CLAUDE.md §9): it
// never changes an arrival time, only where a detector is drawn.
const minX = Math.min(...DETECTORS.map((d) => d.x))
const maxX = Math.max(...DETECTORS.map((d) => d.x))
const minY = Math.min(...DETECTORS.map((d) => d.y))
const maxY = Math.max(...DETECTORS.map((d) => d.y))
const scale = (MAP_SIZE - PADDING * 2) / (Math.max(maxX - minX, maxY - minY) || 1)

function toSvgPoint(x: number, y: number) {
  return { x: PADDING + (x - minX) * scale, y: MAP_SIZE - PADDING - (y - minY) * scale }
}

const centerSvg = toSvgPoint((minX + maxX) / 2, (minY + maxY) / 2)

function pointAt(angleDegrees: number, radiusPixels: number) {
  const radians = (angleDegrees * Math.PI) / 180
  return { x: centerSvg.x + Math.cos(radians) * radiusPixels, y: centerSvg.y - Math.sin(radians) * radiusPixels }
}

function clampToView(point: { x: number; y: number }) {
  return { x: Math.min(Math.max(point.x, 45), MAP_SIZE - 45), y: Math.min(Math.max(point.y, 15), MAP_SIZE - 15) }
}

function MapPanel({
  directionDegrees,
  directionLabel,
  flashed,
  showWedges,
  wedgeProgress,
  guess,
  guessNote,
  pink,
}: {
  directionDegrees: number
  directionLabel: string
  flashed: string[]
  showWedges: boolean
  wedgeProgress: number
  guess: FirstDetectorChoice | null
  guessNote: string
  pink: boolean
}) {
  const arrowLength = 70
  const arrowRadians = (directionDegrees * Math.PI) / 180
  const arrowTip = { x: centerSvg.x + Math.cos(arrowRadians) * arrowLength, y: centerSvg.y - Math.sin(arrowRadians) * arrowLength }
  const arrowColor = pink ? YOURS_COLOR : ARROW_COLOR

  // Two wedges, sketching the directions "consistent with" two pairs' timing gaps, centred near the chosen direction but offset from it
  // and from each other. They are an illustration, not a computed position (CLAUDE.md §9; the specification, "Simplifying assumptions").
  const oneStart = directionDegrees - 50
  const oneEnd = oneStart + 70 * wedgeProgress
  const twoStart = directionDegrees - 20
  const twoEnd = twoStart + 70 * wedgeProgress
  const oneA = pointAt(oneStart, 130)
  const oneB = pointAt(oneEnd, 130)
  const twoA = pointAt(twoStart, 155)
  const twoB = pointAt(twoEnd, 155)
  const oneLabel = clampToView(pointAt(directionDegrees - 48, 112))
  const twoLabel = clampToView(pointAt(directionDegrees + 44, 140))

  const guessed = guess ? DETECTORS.find((d) => d.name === guess) : undefined
  const gp = guessed ? toSvgPoint(guessed.x, guessed.y) : null
  const connector = (() => {
    if (!gp || !guessed) return ''
    // Hanford: out to the left edge and down; the others: out to the right and down, clear of every label
    if (guessed.name === 'Hanford') return `M ${gp.x - 20},${gp.y} H 14 V ${A_BOX_Y}`
    return `M ${gp.x + 20},${gp.y} H 306 V ${A_BOX_Y}`
  })()

  return (
    <g>
      <text x={14} y={20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Panel A: the three detectors and the wave
      </text>
      <g transform={`translate(0, ${A_TOP})`}>
        <line x1={centerSvg.x} y1={centerSvg.y} x2={arrowTip.x} y2={arrowTip.y} stroke={arrowColor} strokeWidth={2} />
        <polygon
          points={`${arrowTip.x},${arrowTip.y} ${arrowTip.x - 6},${arrowTip.y + 10} ${arrowTip.x + 6},${arrowTip.y + 10}`}
          fill={arrowColor}
          transform={`rotate(${90 - directionDegrees}, ${arrowTip.x}, ${arrowTip.y})`}
        />
        <text x={arrowTip.x} y={arrowTip.y - 10} fill={arrowColor} fontSize="10" textAnchor="middle">
          the wave arrives from here
        </text>
        {pink && (
          <text x={14} y={22} fill={YOURS_COLOR} fontSize="12" fontWeight="bold">
            YOUR DIRECTION: {directionLabel}
          </text>
        )}

        {DETECTORS.map((detector) => {
          const point = toSvgPoint(detector.x, detector.y)
          const hasFlashed = flashed.includes(detector.name)
          return (
            <g key={detector.name}>
              <circle cx={point.x} cy={point.y} r={hasFlashed ? 14 : 8} fill={hasFlashed ? FLASH_COLOR : DOT_COLOR} opacity={hasFlashed ? 0.95 : 0.7} />
              <text x={point.x} y={point.y + 36} fill="#e5e7eb" fontSize="12" textAnchor="middle">
                {detector.name}
              </text>
            </g>
          )
        })}

        {showWedges && (
          <>
            <path d={`M ${centerSvg.x},${centerSvg.y} L ${oneA.x},${oneA.y} A 130,130 0 0,1 ${oneB.x},${oneB.y} Z`} fill={WEDGE_ONE} fillOpacity={0.18} stroke={WEDGE_ONE} strokeWidth={1.5} strokeDasharray="6 5" opacity={0.9} />
            <path d={`M ${centerSvg.x},${centerSvg.y} L ${twoA.x},${twoA.y} A 155,155 0 0,1 ${twoB.x},${twoB.y} Z`} fill={WEDGE_TWO} fillOpacity={0.18} stroke={WEDGE_TWO} strokeWidth={1.5} strokeDasharray="6 5" opacity={0.9} />
            {wedgeProgress >= 1 && (
              <>
                <text x={oneLabel.x} y={oneLabel.y} fill={WEDGE_ONE} fontSize="10" textAnchor="middle">
                  possible directions (A)
                </text>
                <text x={twoLabel.x} y={twoLabel.y} fill={WEDGE_TWO} fontSize="10" textAnchor="middle">
                  possible directions (B)
                </text>
              </>
            )}
          </>
        )}

        {/* white: the learner's first guess, drawn from the start (the detectors are always drawn); a ring round the detector chosen. Big on purpose. */}
        {guess && gp && (
          <g>
            <path d={connector} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
            <circle cx={gp.x} cy={gp.y} r={20} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
            <rect x={12} y={A_BOX_Y} width={440} height={32} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
            <text x={22} y={A_BOX_Y + 21} fill={GUESS_COLOR} fontSize="14" fontWeight="bold">
              YOUR GUESS{guessNote}: {guess} will be reached first
            </text>
          </g>
        )}
      </g>
    </g>
  )
}

// ---- Panel B: when each detector registers the wave (milliseconds after the first) ----
const T = { labelX: 12, left: 130, right: 480 }
const ROW_STEP = 26
const GROUP_GAP = 30
const ROW_ORDER: DetectorName[] = ['Hanford', 'Livingston', 'Virgo']

function panelBHeight(groups: number) {
  return (groups > 1 ? 58 : 40) + groups * (3 * ROW_STEP + (groups > 1 ? GROUP_GAP : 0)) + 44 + 32 + 20
}

function TimelinePanel({
  top,
  drawn,
  part1,
  guess,
  yours,
  yoursLabel,
}: {
  top: number
  drawn: boolean
  part1: ArrivalSummary
  guess: TimingChoice | null
  yours: ArrivalSummary | null
  yoursLabel: string
}) {
  const groups = yours ? 2 : 1
  const xOf = (ms: number) => T.left + ((T.right - T.left) * ms) / TIMELINE_MAX_MS
  const groupTop = (g: number) => top + (yours ? 58 : 40) + g * (3 * ROW_STEP + GROUP_GAP)
  const axisY = groupTop(groups - 1) + 3 * ROW_STEP + 4
  const boxY = axisY + 42
  const afterFirst = (summary: ArrivalSummary, name: DetectorName) => summary.order.find((entry) => entry.name === name)!.afterFirstMs
  const marker = guess ? timingGuessMarker(guess) : null
  const bracketTop = groupTop(0) - (yours ? 20 : 8)
  const bracketBottom = groupTop(0) + 3 * ROW_STEP - 2

  const rows = (summary: ArrivalSummary, g: number, pink: boolean) =>
    ROW_ORDER.map((name, i) => {
      const y = groupTop(g) + i * ROW_STEP
      const ms = afterFirst(summary, name)
      const x = xOf(ms)
      const color = pink ? YOURS_COLOR : DOT_COLOR
      return (
        <g key={`${g}-${name}`}>
          <text x={T.labelX} y={y + 14} fill={pink ? YOURS_COLOR : TEXT_COLOR} fontSize="12" fontWeight={pink ? 'bold' : 'normal'}>
            {name}
          </text>
          <line x1={T.left} y1={y + 10} x2={x} y2={y + 10} stroke={color} strokeWidth={4} opacity={0.6} />
          <circle cx={x} cy={y + 10} r={7} fill={color} />
          <text x={x + 14} y={y + 14} fill={pink ? YOURS_COLOR : TEXT_COLOR} fontSize="12" fontWeight="bold">
            {f2(ms)} ms
          </text>
        </g>
      )
    })

  return (
    <g>
      <text x={14} y={top + 20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Panel B: when each detector registers the wave (milliseconds after the first)
      </text>
      <line x1={T.left} y1={groupTop(0) - 6} x2={T.left} y2={axisY} stroke={MUTED_COLOR} />
      {drawn && (
        <>
          {yours && (
            <text x={T.labelX} y={groupTop(0) - 8} fill={TEXT_COLOR} fontSize="11">
              Part 1: Direction A
            </text>
          )}
          {rows(part1, 0, false)}
          {yours && (
            <>
              <text x={T.labelX} y={groupTop(1) - 8} fill={YOURS_COLOR} fontSize="11" fontWeight="bold">
                YOUR DIRECTION: {yoursLabel}
              </text>
              {rows(yours, 1, true)}
            </>
          )}
        </>
      )}
      <line x1={T.left} y1={axisY} x2={T.right} y2={axisY} stroke={MUTED_COLOR} />
      {[0, 10, 20, 30].map((ms) => (
        <text key={ms} x={xOf(ms)} y={axisY + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
          {ms}
        </text>
      ))}
      <text x={(T.left + T.right) / 2} y={axisY + 28} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        milliseconds after the first detector (a fixed scale, 0 to {TIMELINE_MAX_MS})
      </text>
      {!drawn && (
        <text x={WIDTH / 2} y={groupTop(0) + 40} fill={TEXT_COLOR} fontSize="14" textAnchor="middle">
          Press Run: the timeline is drawn when the run has finished.
        </text>
      )}
      {/* white: the learner's second guess, drawn once the timeline is drawn; a sign only, with no size of its own. Big on purpose. */}
      {drawn && guess && marker && (
        <g>
          <rect x={4} y={bracketTop} width={WIDTH - 8} height={bracketBottom - bracketTop} fill="none" stroke={GUESS_COLOR} strokeWidth={4} rx={6} />
          <path d={`M 12,${boxY + 16} H 4 V ${bracketBottom}`} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
          <rect x={12} y={boxY} width={440} height={32} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
          {marker === 'equals' ? (
            <>
              <rect x={20} y={boxY + 10} width={16} height={4} fill={GUESS_COLOR} />
              <rect x={20} y={boxY + 18} width={16} height={4} fill={GUESS_COLOR} />
            </>
          ) : (
            <>
              <rect x={20} y={boxY + 10} width={16} height={4} fill={GUESS_COLOR} />
              <rect x={20} y={boxY + 18} width={16} height={4} fill={GUESS_COLOR} />
              <line x1={22} y1={boxY + 26} x2={34} y2={boxY + 6} stroke={GUESS_COLOR} strokeWidth={3} />
            </>
          )}
          <text x={46} y={boxY + 21} fill={GUESS_COLOR} fontSize="14" fontWeight="bold">
            YOUR GUESS: {TIMING_BOX[guess]}
          </text>
        </g>
      )}
    </g>
  )
}

// The whole picture of Part 1: Panel A above Panel B in one drawing; Drawing A (Part 2) is Panel A alone and Drawing B is Panel B alone.
export function TriangulationPicture({
  scope,
  directionIndex,
  flashed,
  wedgeProgress,
  showWedges,
  finished,
  firstGuess,
  timingGuess,
  yours,
  yoursLabel,
  label,
}: {
  scope: 'both' | 'A' | 'B'
  directionIndex: number
  flashed: string[]
  wedgeProgress: number
  showWedges: boolean
  finished: boolean
  firstGuess: FirstDetectorChoice | null
  timingGuess: TimingChoice | null
  yours: ArrivalSummary | null
  yoursLabel: string
  label: string
}) {
  const part1 = arrivalSummary(DIRECTION_PRESETS[TRIANGULATION_PART1_DIRECTION_INDEX].directionDegrees)
  const showA = scope !== 'B'
  const showB = scope !== 'A'
  const bTop = showA ? A_HEIGHT : 0
  const height = (showA ? A_HEIGHT : 0) + (showB ? panelBHeight(yours ? 2 : 1) : 0)
  const preset = DIRECTION_PRESETS[directionIndex]
  return (
    <svg width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`} style={svgStyle} role="img" aria-label={label}>
      {showA && (
        <MapPanel
          directionDegrees={preset.directionDegrees}
          directionLabel={preset.label.replace('Direction ', '')}
          flashed={flashed}
          showWedges={showWedges}
          wedgeProgress={wedgeProgress}
          guess={firstGuess}
          guessNote={scope === 'A' ? ' (for Direction A)' : ''}
          pink={scope === 'A'}
        />
      )}
      {showB && <TimelinePanel top={bTop} drawn={finished} part1={part1} guess={timingGuess} yours={yours} yoursLabel={yoursLabel} />}
    </svg>
  )
}

// ---- Captions (CLAUDE.md §14, "Animated Diagrams") ----
// One caption per picture. When a picture has two panels (the one in Part 1), each panel is explained in its own section, with its own
// elements, its own "what you see, and when", its own worked moment and its own "what to look for".
function PictureCaption({
  name,
  scope,
  finished,
  pink,
  summary,
  firstGuess,
  timingGuess,
}: {
  name: string
  scope: 'both' | 'A' | 'B'
  finished: boolean
  pink: boolean
  summary: ArrivalSummary
  firstGuess: FirstDetectorChoice | null
  timingGuess: TimingChoice | null
}) {
  const showA = scope !== 'B'
  const showB = scope !== 'A'
  const [first, second, third] = summary.order
  const hl = summary.pairGaps[0]
  const heading = (text: string) => (
    <p style={{ margin: '1rem 0 0.4rem', fontWeight: 'bold', color: 'var(--text-color, inherit)' }}>{text}</p>
  )
  const atLimit = Math.abs(hl.limitMs - hl.gapMs) <= 1e-6
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong>{' '}
        {scope === 'both'
          ? 'It has two panels, one above the other. Panel A is a map of three real detectors and the wave reaching them. Panel B is a timeline that writes down the moment each detector registers the wave. Each is explained separately below.'
          : showA
            ? 'It is a map of three real detectors and the wave reaching them.'
            : 'It is a timeline that writes down the moment each detector registers the wave.'}{' '}
        {pink && 'Pink marks your own direction.'}
      </p>

      {showA && (
        <>
          {scope === 'both' && heading('Panel A: the three detectors and the wave')}
          <p style={paragraph}>
            <strong>What it shows.</strong> Where the three detectors are, which way the wave comes from, and, as the run plays, the order in which the wave reaches them.
          </p>
          <ul style={bulletList}>
            <li>
              <strong>The three dots (cyan)</strong> are the detectors: Hanford and Livingston in the United States and Virgo in Italy, drawn on a flat, schematic map, not a real map. A dot turns white-violet and grows at
              the moment the wave reaches it.
            </li>
            <li>
              <strong>The {pink ? 'pink' : 'amber'} arrow</strong>, labelled &ldquo;the wave arrives from here&rdquo;, shows the direction the wave comes from.
            </li>
            <li>
              <strong>The violet and green wedges</strong> (after the run) are a sketch. Comparing just two detectors&rsquo; timing narrows the direction to a band; a second pair narrows it to another band; where the bands
              overlap is a smaller region, which is what a third detector adds. They are placed near the real direction only to show the idea; they are not calculated, and they still cover many directions.
            </li>
            {firstGuess && (
              <li>
                <strong>The white ring and box</strong> are your first guess, drawn only as a marker: they show which detector you chose and say nothing about how much. They never change a dot.
              </li>
            )}
          </ul>
          <p style={paragraph}>
            <strong>What you see, and when.</strong> At the start only the three detectors, the arrow and your first guess are drawn. As the run plays, each dot turns white-violet at its moment, slowed down so that you can
            watch: the largest gap plays out over 5 seconds. When the run has finished, the two wedges sweep in.{pink && ' The map changes to your direction when you press Run at your direction.'}
          </p>
          {finished && (
            <>
              <p style={paragraph}>
                <strong>A worked moment (Panel A).</strong> {first.name} registers the wave first, {second.name} {f2(second.afterFirstMs)} ms later and {third.name} {f2(third.afterFirstMs)} ms after the first. So the wave reached {first.name} before the other two, and {third.name} last.
              </p>
              <LookFor
                items={[
                  {
                    look: 'the order the three dots turn white-violet.',
                    means: `${first.name} first, then ${second.name}, then ${third.name}.`,
                    matters: 'this is the first question, drawn as it happens.',
                  },
                  ...(firstGuess
                    ? [
                        {
                          look: 'the white ring round the detector you chose.',
                          means: 'your first guess, a marker for the detector you chose.',
                          matters: 'it lets you check your idea against the order before the tutor talks about it; it does not say whether you were right.',
                        },
                      ]
                    : []),
                  {
                    look: 'the violet and green wedges and where they overlap.',
                    means: 'a sketch of what comparing two pairs of detectors would narrow the direction to.',
                    matters: 'it shows the idea that a third detector narrows the direction further than two; the tutor asks you about it.',
                  },
                ]}
              />
            </>
          )}
        </>
      )}

      {showB && (
        <>
          {scope === 'both' && heading('Panel B: when each detector registers the wave')}
          <p style={paragraph}>
            <strong>What it shows.</strong> The same run as Panel A, written down as numbers: how many milliseconds (thousandths of a second) after the first detector each of the three registers the wave.
          </p>
          <ul style={bulletList}>
            <li>
              <strong>Each row</strong> is one detector. The dot, and the number beside it, is how many milliseconds after the first detector it registers the wave; the line from 0 to the dot is that delay. The first
              detector is always at 0.00 ms.
            </li>
            <li>
              <strong>The axis</strong> along the bottom is in milliseconds. It is fixed (0 to {TIMELINE_MAX_MS} ms), so a longer line is a longer delay and nothing rescales when you change the direction.
            </li>
            {pink && (
              <li>
                <strong>The pink rows</strong> are your own direction, under the Part 1 rows (cyan), on the same scale.
              </li>
            )}
            {timingGuess && (
              <li>
                <strong>The white outline round the Part 1 rows, the box and the sign</strong> are your second guess, drawn only as a marker: an equals sign for &ldquo;the same instant&rdquo;, a &ldquo;not equal&rdquo; sign for
                &ldquo;different times&rdquo;. They say nothing about how big the gaps are and never change a row.
              </li>
            )}
          </ul>
          <p style={paragraph}>
            <strong>What you see, and when.</strong> Nothing is drawn in Panel B until the run has finished; until then it shows a note. When the run has finished, the three rows appear with your second guess.
            {pink && ' The pink rows appear when you press Run at your direction.'}
          </p>
          {finished && (
            <>
              <p style={paragraph}>
                <strong>A worked moment (Panel B).</strong> The three rows read {f2(first.afterFirstMs)}, {f2(second.afterFirstMs)} and {f2(third.afterFirstMs)} ms. The two LIGO detectors are about 3,000 km apart and the wave
                travels about 300,000 km every second, so crossing that distance takes at most 3,000 ÷ 300,000 = 0.01 seconds, 10 milliseconds. On this map the limit is {f2(hl.limitMs)} ms
                {atLimit
                  ? `, and Hanford and Livingston are exactly ${f2(hl.gapMs)} ms apart: the wave came from exactly along the line between them, so it takes that full time.`
                  : `, and here Hanford and Livingston are ${f2(hl.gapMs)} ms apart, less than the most it could be.`}
              </p>
              <LookFor
                items={[
                  {
                    look: 'the rows of the timeline and the gaps between the dots.',
                    means: `${f2(first.afterFirstMs)}, ${f2(second.afterFirstMs)} and ${f2(third.afterFirstMs)} ms, so the detectors register the wave at times that are different and easy to measure.`,
                    matters: 'this is the second question, drawn on one scale so you can see how big the gaps are.',
                  },
                  ...(timingGuess
                    ? [
                        {
                          look: 'the white outline and sign round the Part 1 rows.',
                          means: 'your second guess, a marker for "the same instant" or "different times".',
                          matters: 'it lets you check your idea against the rows; it does not say whether you were right.',
                        },
                      ]
                    : []),
                ]}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

function flashedAt(summary: ArrivalSummary, progress: number): string[] {
  if (summary.maxGapMs <= 0) return summary.order.map((entry) => entry.name)
  return summary.order.filter((entry) => entry.afterFirstMs / summary.maxGapMs <= progress).map((entry) => entry.name)
}

// What the learner's own direction shows (updates with the buttons; every number from the module).
function yourDirectionParagraph(directionIndex: number): string {
  const cmp = yourDirectionComparison(directionIndex)
  const y = cmp.yours
  const p = cmp.part1
  const label = DIRECTION_PRESETS[directionIndex].label
  if (cmp.atPart1Direction) {
    return `Your direction is ${label}, the same as Part 1’s, so every comparison above says "the same". Choose another direction and press Run at your direction again to see it change.`
  }
  const [first, second, third] = y.order
  const word = cmp.words.maxGap
  const closest = y.pairGaps.find((pair) => pair.gapMs / pair.limitMs >= 0.95)
  const orderChanged = cmp.words.first === 'different' || cmp.words.second === 'different' || cmp.words.third === 'different'
  return `At ${label} ${first.name} is reached first, ${second.name} ${f2(second.afterFirstMs)} ms later and ${third.name} ${f2(third.afterFirstMs)} ms later, so the largest gap is ${f2(y.maxGapMs)} ms against Direction A’s ${f2(p.maxGapMs)} ms: ${word}. The order ${orderChanged ? 'has changed' : 'is the same'}, the three detectors are still reached at measurably different times, and every gap is still within its limit.${closest ? ` ${closest.a} to ${closest.b}, ${f2(closest.gapMs)} ms against a limit of ${f2(closest.limitMs)} ms, is close to the most it could be.` : ''}`
}

export function GravitationalWaveTriangulationExperiment({ onComplete, onTutorComplete }: GravitationalWaveTriangulationExperimentProps) {
  const [dirIndex, setDirIndex] = useState(TRIANGULATION_PART1_DIRECTION_INDEX)
  const [runDirIndex, setRunDirIndex] = useState(TRIANGULATION_PART1_DIRECTION_INDEX)
  const [ranPart1, setRanPart1] = useState(false)
  const [firstPrediction, setFirstPrediction] = useState<FirstDetectorChoice | null>(null)
  const [timingPrediction, setTimingPrediction] = useState<TimingChoice | null>(null)
  const [firstSubmitted, setFirstSubmitted] = useState<FirstDetectorChoice | null>(null)
  const [timingSubmitted, setTimingSubmitted] = useState<TimingChoice | null>(null)
  const [part1Runs, setPart1Runs] = useState(0)
  const [part2Runs, setPart2Runs] = useState(0)
  const completedOnce = useRef(false)

  const finishPart1 = () => {
    setRanPart1(true)
    if (!completedOnce.current) {
      completedOnce.current = true
      onComplete?.()
    }
  }
  const part1 = useTimedRun(VISUAL_DURATION_MS, finishPart1)
  const part2 = useTimedRun(VISUAL_DURATION_MS)

  const hasPrediction = firstPrediction !== null && timingPrediction !== null
  const locked = firstSubmitted !== null && timingSubmitted !== null
  const part1Running = part1.status === 'running'
  const part2Running = part2.status === 'running'
  const part1Started = part1.status !== 'idle'
  const part1Finished = part1.status === 'complete' || ranPart1
  const ranHere = part2.status !== 'idle' && runDirIndex === dirIndex
  const part2Done = part2.status === 'complete' && runDirIndex === dirIndex

  const partOne = arrivalSummary(DIRECTION_PRESETS[TRIANGULATION_PART1_DIRECTION_INDEX].directionDegrees)
  const part1Wedges = useSweep(part1.status === 'complete', part1Runs, WEDGE_SWEEP_MS)
  const part2Wedges = useSweep(part2Done, part2Runs, WEDGE_SWEEP_MS)
  const comparison = yourDirectionComparison(runDirIndex)
  const picked = DIRECTION_PRESETS[dirIndex]
  const ran = DIRECTION_PRESETS[runDirIndex]
  const partTwoSummary = arrivalSummary(picked.directionDegrees)
  const ranSummary = comparison.yours

  const handleRunPart1 = () => {
    if (!hasPrediction || part1Running || part2Running) return
    if (!locked) {
      setFirstSubmitted(firstPrediction)
      setTimingSubmitted(timingPrediction)
    }
    part2.reset()
    setPart1Runs((n) => n + 1)
    part1.start()
  }
  const handleRunPart2 = () => {
    if (part1Running || part2Running) return
    setRunDirIndex(dirIndex)
    setPart2Runs((n) => n + 1)
    part2.start()
  }
  // Start over: clears both guesses, the runs, Part 2 and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setRanPart1(false)
    completedOnce.current = false
    setFirstSubmitted(null)
    setTimingSubmitted(null)
    setFirstPrediction(null)
    setTimingPrediction(null)
    setDirIndex(TRIANGULATION_PART1_DIRECTION_INDEX)
    setRunDirIndex(TRIANGULATION_PART1_DIRECTION_INDEX)
  }

  const timingLabel = (choice: TimingChoice) => (choice === 'same' ? 'at essentially the same instant' : 'at measurably different times')
  const yourVal = (value: string) => (part2Done ? value : 'not run yet')
  const yourWord = (word: string) => (part2Done ? word : 'run your direction to compare')
  const pairGaps = partOne.pairGaps

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 6 — Triangulation</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> A single detector can tell you that a gravitational wave arrived. Can it tell you which direction the wave came from? This is the problem astronomers faced with GW170817
            (the neutron-star collision in &ldquo;Comparing Two Real Events&rdquo;): knowing a signal had arrived was not enough. Working out roughly where it came from is what let telescopes around the world
            point in the right direction and catch the matching light.
          </p>
          <p style={paragraph}>
            <strong>The everyday version of this idea.</strong> Imagine three friends standing far apart from each other in a field. Someone far away shouts, and each friend hears it. None of them can tell,
            from hearing it alone, which way the shout came from. But the three friends can compare notes: not what each heard, but <strong>when</strong> each heard it. The answer to which direction the shout
            came from is hidden in that comparison. Finding a direction this way, from the moments a signal reaches several places, is called <strong>triangulation</strong>.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> Three real detectors, <strong>Hanford</strong> and <strong>Livingston</strong> (the two LIGO detectors, in the United States) and <strong>Virgo</strong> (in Italy), play
            the role of the three friends. They sit far apart on Earth (Hanford and Livingston, for example, are about 3,000 kilometres apart). A gravitational wave travels at a fixed speed, the speed of light,
            about 300,000 kilometres every second (written <strong>c</strong>). You will pick a wave that comes from one direction and watch it reach the three detectors.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> In Part 1, make two predictions about a wave that comes from one fixed direction (Direction A): which detector will it reach first, and will the three detectors register it at
            essentially the same instant or at measurably different times? Then press Run once and watch. In Part 2, choose a different direction and see how the order and the gaps change. Then the tutor will ask
            you what you saw.
          </p>
          <p style={paragraph}>
            <strong>Your predictions and the real pictures.</strong> Your predictions never change the real pictures, the tables or the numbers: the map, the timeline and the tables come from a calculation that
            knows nothing about what you guessed. Your guesses are drawn on the picture in white, in boxes labelled YOUR GUESS, and listed again beside the results. In Part 2, the direction buttons do change the
            drawings; the marks they move are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning: triangulation, detector, Hanford, Livingston, Virgo, wavefront, c, millisecond,
            arrival time, arrival-time gap, network, schematic map and illustration.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>The wave is a flat front travelling in a straight line at exactly the speed of light.</li>
            <li>
              The three detectors are drawn on a flat, schematic map, not a real map: their positions are chosen only so that the distances between them come out close to the real ones. Only Hanford to Livingston
              (about 3,000 kilometres) is a distance a source gives for the real detectors; the Virgo distances on this map are not claimed to be real.
            </li>
            <li>Only the moment each detector is reached is modelled, not how strongly each detector responds or any noise.</li>
            <li>
              The animation is slowed down so that the gaps, which are really a few thousandths of a second, can be watched: the largest gap in Part 1 plays out over 5 seconds. The two shaded wedges that appear after the
              run are a sketch, not a calculation.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(part1Finished)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages and the original scientific papers are listed here. Checked on 7 November 2026. Each link opens in a new tab.
          </p>
          {LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <p style={{ margin: '0.5rem 0 0.25rem', fontWeight: 'bold' }}>{group.heading}</p>
              <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p style={{ ...smallNote, marginTop: '0.5rem' }}>
            No plain page from an official source was found that gives the distances from Virgo to Hanford or to Livingston, so this page does not call the Virgo distances on its map real. GW170817&rsquo;s sky region is
            given as 31 square degrees in the first announcement and 28 in the detection paper; the LIGO page rounds it to about 30.
          </p>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you make two predictions about a wave that comes from one fixed direction, Direction A. Then you press Run once and watch the wave reach the three detectors. Your guesses are drawn on the picture in white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>For a wave that comes from Direction A, which detector do you think it will reach first?</p>
          <div style={{ marginBottom: '0.5rem' }}>
            {detectorNames.map((choice) => (
              <button
                key={choice}
                onClick={() => setFirstPrediction(choice)}
                disabled={locked}
                className={`toggle-button${firstPrediction === choice ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Do you think the three detectors will all register the wave at essentially the same instant, or at measurably different times?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {timingChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setTimingPrediction(choice.value)}
                disabled={locked}
                className={`toggle-button${timingPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || locked
              ? `Your predictions: ${firstPrediction ?? firstSubmitted}, ${timingChoices.find((c) => c.value === (timingPrediction ?? timingSubmitted))!.label}`
              : 'Answer both questions to continue'}
            {locked && ' Your predictions are locked while you try other directions. To change them, press Start over.'}
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRunPart1}
          disabled={!hasPrediction || part1Running || part2Running}
          style={{ padding: '0.6rem 1.5rem', marginRight: '0.75rem', marginBottom: '0.5rem' }}
        >
          {part1Running ? 'Running...' : part1Finished ? 'Run again' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={!(hasPrediction || part1Started || ranPart1) || part1Running || part2Running}
          className="secondary-button"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer', backgroundColor: 'rgba(124, 58, 237, 0.22)', marginBottom: '0.5rem' }}
        >
          Start over
        </button>
        {!hasPrediction && <p style={smallNote}>Answer both predictions above to press Run.</p>}

        <Block>
          <TriangulationPicture
            scope="both"
            directionIndex={TRIANGULATION_PART1_DIRECTION_INDEX}
            flashed={part1Started ? flashedAt(partOne, part1.progress) : []}
            wedgeProgress={part1Wedges}
            showWedges={part1.status === 'complete'}
            finished={part1Finished}
            firstGuess={firstSubmitted}
            timingGuess={timingSubmitted}
            yours={null}
            yoursLabel=""
            label="A map of three detectors with an arrow for the direction the wave comes from, above a timeline of when each detector registers the wave. Your guesses are drawn in white in boxes marked YOUR GUESS."
          />
          {part1Finished && (
            <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem' }}>
              First: {partOne.order[0].name} &nbsp;|&nbsp; {partOne.order[1].name}: {f2(partOne.order[1].afterFirstMs)} ms later &nbsp;|&nbsp; {partOne.order[2].name}: {f2(partOne.order[2].afterFirstMs)} ms later
            </p>
          )}
          <PictureCaption name="the picture" scope="both" finished={part1Finished} pink={false} summary={partOne} firstGuess={firstSubmitted} timingGuess={timingSubmitted} />
          <WhereFrom
            measured="nothing in this picture is a measurement (the real detectors are real places, but the map is a schematic)."
            calculated="the order and every arrival time in the timeline, from the detectors' schematic positions and the speed of light."
            guess="the white rings, boxes and signs are your guesses, drawn only as markers. They are not part of the calculation."
            imagined="the schematic map itself, the direction (A) and the two shaded wedges, which are a sketch and not a computed position, and the slowed-down playback."
          />
        </Block>

        {/* ===== Part 2 ===== */}
        {part1Finished && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose one of three directions, A, B or C, and run it. The buttons change the drawings in this Part, marked in pink. They do not change Part 1&rsquo;s picture, the tables in Part 3, or your guesses.
            </PartHeader>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>What you are changing.</strong> The direction the wave comes from: one of three, A, B or C. Nothing else changes: the same three detectors and the same speed are used for every direction, so
                any difference you see comes from the direction.
              </p>
              <p style={paragraph}>
                <strong>What to try.</strong> Run Direction B, then Direction C, and watch how the order of the three detectors changes and how the largest gap compares with Direction A&rsquo;s.
              </p>
              <p style={paragraph}>
                <strong>The pink marks.</strong> Pink always means your own choice. Drawing A is the map with your direction. Drawing B has pink rows for your direction under the Part 1 rows. The pink rows are drawn when you
                press Run at your direction.
              </p>
              <p style={paragraph}>
                <strong>Your guesses.</strong> White always means your guesses. Your first guess is drawn again on Drawing A (it was about Direction A) and your second on Drawing B, beside the real rows, so you can
                compare. They never change a dot or a row.
              </p>
              <p style={{ ...smallNote, marginBottom: '0.75rem' }}>
                Your guesses do not change these drawings or the tables in Part 3, but these buttons do change the drawings below and Table 2. While the buttons are on Direction A (the Part 1 direction), Table 2 says
                &ldquo;the same&rdquo; in every comparison; choose another direction to see it change.
              </p>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              {DIRECTION_PRESETS.map((preset, index) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDirIndex(index)}
                  disabled={part1Running || part2Running}
                  className={`toggle-button${dirIndex === index ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <button type="button" className="action-button" onClick={handleRunPart2} disabled={part1Running || part2Running} style={{ padding: '0.6rem 1.5rem' }}>
              {part2Running ? 'Running...' : 'Run at your direction'}
            </button>

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Drawing A: the three detectors and the wave from your direction</p>
            <TriangulationPicture
              scope="A"
              directionIndex={ranHere ? runDirIndex : dirIndex}
              flashed={ranHere ? flashedAt(ranHere ? ranSummary : partTwoSummary, part2.progress) : []}
              wedgeProgress={part2Wedges}
              showWedges={part2Done}
              finished={false}
              firstGuess={firstSubmitted}
              timingGuess={null}
              yours={null}
              yoursLabel=""
              label="Drawing A: the three detectors and an arrow for your direction. Your first guess is drawn in white in a box marked YOUR GUESS."
            />
            <PictureCaption name="Drawing A" scope="A" finished={part2Done} pink summary={part2Done ? ranSummary : partTwoSummary} firstGuess={firstSubmitted} timingGuess={null} />
            <WhereFrom
              measured="nothing in this picture is a measurement."
              calculated={<>the order in which the dots turn white-violet, from the detectors&rsquo; schematic positions and the speed of light, for {(ranHere ? ran : picked).label}.</>}
              guess="the white ring and box are your first guess (about Direction A), drawn only as a marker. They are not part of the calculation."
              imagined={<>the direction (your own choice, a trial value that does not say a real wave came from there), the two shaded wedges (a sketch) and the slowed-down playback.</>}
            />

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Drawing B: when each detector registers the wave, in Part 1 and in your direction</p>
            <TriangulationPicture
              scope="B"
              directionIndex={dirIndex}
              flashed={[]}
              wedgeProgress={0}
              showWedges={false}
              finished={part1Finished}
              firstGuess={null}
              timingGuess={timingSubmitted}
              yours={part2Done ? ranSummary : null}
              yoursLabel={ran.label.replace('Direction ', '')}
              label="Drawing B: when each detector registers the wave in Part 1 and, in pink, in your direction. Your second guess is drawn in white in a box marked YOUR GUESS."
            />
            {!part2Done && (
              <p style={{ ...smallNote, marginTop: '0.5rem' }}>
                <span style={{ color: YOURS_COLOR, fontWeight: 'bold' }}>YOUR DIRECTION: {picked.label.replace('Direction ', '')}</span> — choose a direction and press Run at your direction to draw the pink rows.
              </p>
            )}
            <PictureCaption name="Drawing B" scope="B" finished={part1Finished} pink summary={part2Done ? ranSummary : partOne} firstGuess={null} timingGuess={timingSubmitted} />
            <WhereFrom
              measured="nothing in this picture is a measurement."
              calculated={<>the rows, from the detectors&rsquo; schematic positions and the speed of light, for Direction A and for {ran.label}.</>}
              guess="the white outline and sign are your second guess, drawn only as a marker. They are not part of the calculation."
              imagined={<>the direction of the pink rows (a trial value that does not say a real wave came from there).</>}
            />
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>These are trial values for the pictures. They do not say the real system is like that.</p>
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Finished && firstSubmitted && timingSubmitted && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the arrival times from the Part 1 run, with your guesses listed beside them, a check of every gap against its limit, and a table for the direction you chose. Table 1 and the check-up never change with
              your guesses or with the direction buttons. Table 2 follows the buttons.
            </PartHeader>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Your guesses, beside the results</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 0, marginBottom: '0.5rem' }}>
              Your guesses are shown here as you made them, with the place where each number appears. They are not marked here, and they never change a picture or a table. The tutor marks them, in Part 4.
            </p>
            <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <li>
                <strong>Your first guess:</strong> {firstSubmitted} would be reached first. Its number is in Table 1, the &ldquo;Arrives first&rdquo; row, and in the white ring on the map.
              </li>
              <li>
                <strong>Your second guess:</strong> the three detectors would register the wave {timingLabel(timingSubmitted)}. Its numbers are in Table 1, the &ldquo;Largest gap&rdquo; row, and in the timeline.
              </li>
            </ul>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>How to read these results.</strong> A table of numbers is hard to read until someone says what it is. The check-up sets the biggest gap each pair of detectors could ever have next to the gap this run
                actually had. Table 1 gives the Part 1 run in full. Table 2 follows the direction you chose in Part 2, and tells you what changes when you press another button.
              </p>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Check-up: every gap in the Part 1 run against the most it could be</strong>
            </p>
            <ResultsTable
              head={['Pair of detectors', 'Most it could be (separation ÷ c)', 'Found in Part 1', 'Reading']}
              minWidth={580}
              rows={pairGaps.map((pair) => {
                const word = gapVersusLimitWord(pair.gapMs, pair.limitMs)
                return [
                  `${pair.a} and ${pair.b}`,
                  `${f2(pair.limitMs)} ms`,
                  `${f2(pair.gapMs)} ms`,
                  word === 'at the limit' ? 'at the limit: the wave came from along the line between them' : 'less than the limit',
                ]
              })}
            />
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.75rem 0 1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The check.</strong> <em>What it is:</em> for each pair, the biggest gap the wave could possibly have, next to the gap it did have. <em>What it means:</em> Hanford and Livingston are 3,000 km apart on this
                  map, so 3,000 ÷ 299,792 = 0.01001 seconds, {f2(pairGaps[0].limitMs)} milliseconds. The run gave {f2(pairGaps[0].gapMs)} ms for that pair, so the wave came along the line through those two detectors. The other
                  two pairs gave less than their limits ({f2(pairGaps[1].gapMs)} of {f2(pairGaps[1].limitMs)} ms and {f2(pairGaps[2].gapMs)} of {f2(pairGaps[2].limitMs)} ms), because the wave came from a direction that is not along
                  their lines. <em>Why it matters:</em> the size of each gap, as a share of its limit, says how closely the wave&rsquo;s direction lines up with that pair, which is the clue triangulation uses. The tutor asks how
                  three pairs, not one, narrow the direction.
                </li>
                <li>
                  <strong>How sure the numbers are.</strong> The separations are schematic: the Hanford to Livingston distance is close to the real 3,002 km, and the Virgo distances on this map are not claimed to be real. The
                  three limits are exact results of the formula at these map distances, so the two Virgo limits are limits for this map, not for the real network.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Table 1: the Part 1 run (Direction A)</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value']}
              minWidth={420}
              rows={[
                [
                  <>
                    Arrives first
                    <GuessTag n={1} />
                  </>,
                  partOne.order[0].name,
                ],
                ['Second', `${partOne.order[1].name}, ${f2(partOne.order[1].afterFirstMs)} ms after the first`],
                ['Third', `${partOne.order[2].name}, ${f2(partOne.order[2].afterFirstMs)} ms after the first`],
                [
                  <>
                    Largest gap (first to last)
                    <GuessTag n={2} />
                  </>,
                  `${f2(partOne.maxGapMs)} ms`,
                ],
              ]}
            />
            <p style={{ ...smallNote, margin: '0.5rem 0 1rem' }}>The tags show which rows relate to your guesses. They do not say whether the guesses matched.</p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The order.</strong> <em>What it is:</em> which detector registered the wave first, second and third. <em>What it means:</em> {partOne.order[0].name} first, then {partOne.order[1].name}, then {partOne.order[2].name}.{' '}
                  <em>Why it matters:</em> the order alone already says something about which side the wave came from; that is your first question.
                </li>
                <li>
                  <strong>The largest gap.</strong> <em>What it is:</em> how long after the first detector the last one registered the wave. <em>What it means:</em> {f2(partOne.maxGapMs)} milliseconds, about {Math.round(partOne.maxGapMs)}{' '}
                  thousandths of a second. <em>Why it matters:</em> it is small but easy to measure, and it is the clue a detector network uses; that is your second question.
                </li>
                <li>
                  <strong>How sure the numbers are.</strong> They come from a flat schematic map and one made-up direction, not from a real signal. They show how a direction changes the timing, not where any real wave came from.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Table 2: your own direction (a trial value)</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Part 1 (Direction A)', 'Your value', 'How yours compares']}
              minWidth={620}
              rows={[
                ['Arrives first', partOne.order[0].name, yourVal(comparison.yours.order[0].name), yourWord(comparison.words.first)],
                ['Second', partOne.order[1].name, yourVal(comparison.yours.order[1].name), yourWord(comparison.words.second)],
                ['Third', partOne.order[2].name, yourVal(comparison.yours.order[2].name), yourWord(comparison.words.third)],
                ['Largest gap', `${f2(partOne.maxGapMs)} ms`, yourVal(`${f2(comparison.yours.maxGapMs)} ms`), yourWord(comparison.words.maxGap)],
              ]}
            />
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.75rem 0 1.5rem' }}>
              {part2Done ? (
                <p style={paragraph}>
                  <strong>What your numbers show.</strong> {yourDirectionParagraph(runDirIndex)}
                </p>
              ) : (
                <p style={paragraph}>
                  <strong>What your numbers show.</strong> Table 2 fills in when you press Run at your direction in Part 2. Until then only the Part 1 column has numbers.
                </p>
              )}
              <p style={paragraph}>
                <strong>What this table tells us.</strong> <em>What it is:</em> the order and the largest gap for the direction you chose, next to Direction A. <em>What it means:</em> for the detector rows the last column says
                &ldquo;the same&rdquo; or &ldquo;different&rdquo;, and for the gap it says &ldquo;the same&rdquo;, &ldquo;more&rdquo; or &ldquo;less&rdquo;; there is no cut-off for &ldquo;close enough&rdquo;. <em>Why it matters:</em> it shows that
                the direction changes both the order and the size of the gaps, which is why a direction can be worked out from them. The published value for each row is the same formula as the one used here, so there is no
                separate published column.
              </p>
              <p style={{ ...smallNote, marginBottom: 0 }}>These are trial values. They do not say the real system is like that.</p>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>What about a real network?</strong> A real detector network compares timing gaps across three or more detectors, not just one, to narrow down which patch of sky a signal came from. That is how
                GW170817 could be matched to a place telescopes could point at and see light from. In GW170814, the first wave all three detectors saw, adding Virgo cut the possible area of sky from 1,160 square degrees
                to 100 (60 after the final analysis); for GW170817 the region was about 30 square degrees (28 in the final analysis), and telescopes found the galaxy NGC 4993 about 11 hours after the wave.
              </p>
              <p style={{ ...smallNote, marginBottom: 0 }}>
                <strong>Where these figures come from.</strong> The areas and times are from LIGO&rsquo;s pages on{' '}
                <ExternalLink href="http://ligo.org/science-summaries/GW170814/">GW170814</ExternalLink> and <ExternalLink href="https://ligo.org/detections/gw170817/">GW170817</ExternalLink> and the abstracts of the{' '}
                <ExternalLink href="https://arxiv.org/abs/1710.05832">GW170817 paper</ExternalLink> and the{' '}
                <ExternalLink href="https://arxiv.org/abs/1710.05833">multi-messenger paper</ExternalLink>; the 3,002 km and 10 millisecond figures are from LIGO&rsquo;s{' '}
                <ExternalLink href="https://www.ligo.caltech.edu/page/ligo-detectors">&ldquo;LIGO&rsquo;s Dual Detectors&rdquo;</ExternalLink>. The tables and the check-up are calculated on this page from the formulas in the
                &ldquo;Words and formulas&rdquo; box.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ===== Part 4 ===== */}
      {part1Finished && firstSubmitted && timingSubmitted && (
        <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            Talk through what you saw. The tutor points to your white guess marks, then explains.
          </PartHeader>
          <GravitationalWaveTriangulationTutor
            key={`${firstSubmitted}-${timingSubmitted}`}
            predictedFirstDetector={firstSubmitted}
            predictedTiming={timingSubmitted}
            firstMatched={firstDetectorGuessMatches(firstSubmitted, DIRECTION_PRESETS[TRIANGULATION_PART1_DIRECTION_INDEX].directionDegrees)}
            timingMatched={timingGuessMatches(timingSubmitted, DIRECTION_PRESETS[TRIANGULATION_PART1_DIRECTION_INDEX].directionDegrees)}
            onExplained={onTutorComplete}
          />
        </div>
      )}
    </div>
  )
}
