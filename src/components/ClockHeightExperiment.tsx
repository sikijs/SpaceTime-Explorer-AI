import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  clockHeightCheckUp,
  clockHeightDrawingReference,
  clockHeightDrawingValues,
  DRAWING_SCALES,
  gapGuessSeconds,
  heightGuessMetres,
  PREDICTION_PRECISION,
  predictionGapSeconds,
  predictionHeightMetres,
  G_EARTH,
  JILA_2022,
  rateDifference,
  runClockHeight,
  SECONDS_PER_YEAR,
  sigmasFromExpected,
  signalToPrecision,
  smallestHeight,
  SPEED_OF_LIGHT,
  timeGap,
  WISCONSIN_2023,
  yearsToDrift,
} from '../physics/clockHeight'
import type { LengthScale, TimeScale } from '../physics/clockHeight'
import { ClockHeightTutor } from './ClockHeightTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Cosmic Horizons, Experiment 9 (docs/experiments/cosmic-horizons/09-can-a-clock-tell-its-height.md).
// Step 6 builds the three controls (the height, the duration and the clock's precision), shown after the run, which add a pink mark to each picture and a Table 4. Step 5 built the results (the status label, three tables, the formulas in the "Words and formulas" panel and the links kept back until after the run). Step 4 built the five-stage run: Picture 1 fills in at stages 1 and 3, Picture 2 at stages 2 and 3, Picture 3 at stages 4 and 5, each with a guide. Step 3 built the two predictions. Step 2 built the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of an optical lattice clock
// (an illustration, not data), the collapsed "Words and formulas" panel and the skeleton of Picture 1 (its axes and a guide). Step 7 built the tutor (ClockHeightTutor.tsx) and, in App, the
// chapter summary. All wording is draft for the owner's line-by-line
// approval (CLAUDE.md §28.1), written to the standard of §29. The introduction does not give the rate difference per metre, the gap after a year or the
// height that one part in 10^19 means (that is what the two predictions ask, §12). The interface only displays numbers from src/physics (CLAUDE.md §9); the
// only calculation here is where a point is drawn.

interface ClockHeightExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const ATOM_COLOR = '#fde047' // yellow: a strontium atom
const LASER_COLOR = '#ef4444' // red: the laser light that holds the atoms
const GRAVITY_COLOR = '#38bdf8' // sky blue: gravity
const CLOCK_COLOR = '#5eead4' // teal: the clock's light
const EDGE_COLOR = '#c084fc' // purple: the upper and lower edges of the cloud
const LINE_COLOR = '#fbbf24' // amber: the rate difference and the gap (Pictures 1 and 2)
const WISCONSIN_COLOR = '#a3e635' // lime: the Wisconsin measurement (pink is kept for the learner's own choice)
const YOURS_COLOR = '#f472b6' // pink: the learner's own choice (Part 2)
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14, "Predictions and the Real Results")
const IMAGINED_COLOR = '#a78bfa' // violet: a clock imagined for the question (Prediction 2's)

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

// The four Parts of the page (CLAUDE.md §14, "The Page in Four Parts"): a thick coloured line, a coloured heading and a short lead.
function PartHeader({ color, title, children }: { color: string; title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${color}` }}>
      <h3 style={{ margin: '0 0 0.5rem', color }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
        <strong>What we are about to do.</strong> {children}
      </p>
    </div>
  )
}
const PredictionTag = ({ n }: { n: 1 | 2 }) => (
  <span style={{ marginLeft: '0.5rem', padding: '0.05rem 0.4rem', fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${GUESS_COLOR}`, borderRadius: '4px', whiteSpace: 'nowrap' }}>
    your Prediction {n}
  </span>
)
const GAP_SHORT = { microsecond: 'about 3 microseconds', nanosecond: 'about 3 nanoseconds', picosecond: 'about 3 picoseconds' } as const
const HEIGHT_SHORT = { metre: 'about 1 metre', centimetre: 'about 1 centimetre', millimetre: 'about 1 millimetre' } as const

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <>
      {lines.map((line, i) => (
        <text key={i} x={x} y={y + i * (size + 2)} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor}>
          {line}
        </text>
      ))}
    </>
  )
}

// A power of ten written as 10⁻¹⁹.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const tenTo = (exponent: number) => `10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`

// ---- An optical lattice clock (an illustration, not data) ----
function ClockDrawing() {
  const height = 420
  const cx = 200
  const layers = [100, 155, 210, 265] // the y of each thin layer of laser light
  // Atoms, drawn as dots sitting in the layers (the real cloud holds about 100,000).
  const atoms: [number, number][] = [
    [-70, 0], [-35, 0], [0, 0], [35, 0], [70, 0],
    [-52, 1], [-17, 1], [17, 1], [52, 1],
    [-70, 2], [-35, 2], [0, 2], [35, 2], [70, 2],
    [-52, 3], [-17, 3], [17, 3], [52, 3],
  ]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="A stack of four thin horizontal layers of laser light, each holding a row of ultracold strontium atoms, like eggs in an egg carton. The top layer and the bottom layer are marked, light from the atoms goes to a counter, and an arrow shows that gravity pulls down"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: an optical lattice clock, seen from the side
      </text>

      {/* The layers of laser light. */}
      {layers.map((y) => (
        <rect key={y} x={cx - 100} y={y - 7} width={200} height={14} rx={7} fill="none" stroke={LASER_COLOR} strokeWidth={2} />
      ))}
      {/* The atoms, sitting in the layers. */}
      {atoms.map(([dx, row], i) => (
        <circle key={i} cx={cx + dx} cy={layers[row]} r={4.5} fill={ATOM_COLOR} />
      ))}

      {/* The upper and lower edges of the cloud. */}
      <line x1={cx - 112} y1={layers[0]} x2={cx - 112} y2={layers[3]} stroke={EDGE_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
      <polygon points={`${cx - 112},${layers[0] - 8} ${cx - 116},${layers[0]} ${cx - 108},${layers[0]}`} fill={EDGE_COLOR} />
      <polygon points={`${cx - 112},${layers[3] + 8} ${cx - 116},${layers[3]} ${cx - 108},${layers[3]}`} fill={EDGE_COLOR} />
      <SvgLines x={cx - 120} y={layers[0] - 4} lines={['upper edge of', 'the cloud']} fill={EDGE_COLOR} bold anchor="end" />
      <SvgLines x={cx - 120} y={layers[3] - 4} lines={['lower edge of', 'the cloud']} fill={EDGE_COLOR} bold anchor="end" />

      {/* The labels on the right. */}
      <SvgLines x={cx + 112} y={layers[0] - 14} lines={['layers of laser light:', 'each holds a row of atoms,', 'like eggs in an egg carton']} fill={LASER_COLOR} bold />
      <SvgLines x={cx + 112} y={layers[2] - 10} lines={['ultracold strontium atoms', '(about 100,000 in the real clock;', 'a few are drawn)']} fill={ATOM_COLOR} bold />

      {/* The light from the atoms, to the counter. */}
      <line x1={cx} y1={layers[3] + 18} x2={cx} y2={350} stroke={CLOCK_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
      <polygon points={`${cx - 6},344 ${cx},356 ${cx + 6},344`} fill={CLOCK_COLOR} />
      <rect x={cx - 70} y={358} width={140} height={34} rx={6} fill="none" stroke={CLOCK_COLOR} strokeWidth={2} />
      <text x={cx} y={379} fill={CLOCK_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        counter: the ticks
      </text>
      <SvgLines x={cx + 12} y={310} lines={['light from the atoms: the clock', 'counts its vibrations']} fill={CLOCK_COLOR} bold />

      {/* Gravity. */}
      <line x1={528} y1={120} x2={528} y2={220} stroke={GRAVITY_COLOR} strokeWidth={4} />
      <polygon points="518,214 528,234 538,214" fill={GRAVITY_COLOR} />
      <text x={528} y={106} fill={GRAVITY_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        gravity
      </text>
      <text x={528} y={252} fill={GRAVITY_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        pulls down
      </text>

      <SvgLines
        x={20}
        y={height - 12}
        lines={['A sketch of the idea, not to scale: the real cloud is far smaller than this drawing.']}
        fill={MUTED_COLOR}
      />
    </svg>
  )
}

const lookForClock: LookFor[] = [
  {
    look: 'the red layers and the yellow atoms in them.',
    means: 'the laser light makes a pattern that holds the atoms in place, one row to a layer, a little like eggs in an egg carton. Because the atoms are held and barely move, the clock can watch them for a long time.',
    matters: 'a long, steady look at many identical atoms is what makes the clock so precise. One atom would give a noisier answer than a cloud of 100,000.',
  },
  {
    look: 'the purple arrows at the upper edge and the lower edge of the cloud.',
    means: 'the cloud is not a point: it has a top and a bottom, and the top is a tiny bit higher than the bottom.',
    matters: 'if a higher clock ticks differently, the atoms at the top and at the bottom of the same cloud could tick at slightly different rates. That is the idea behind this experiment.',
  },
  {
    look: 'the teal dashed line and the counter.',
    means: 'the clock works by counting the vibrations of light from the atoms. Each vibration is one tick.',
    matters: 'a clock is only as good as the number of ticks it can count each second and how steady they are. Light vibrates tens of thousands of times faster than the microwaves of today’s caesium clocks, so each second is cut into much finer pieces.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Atomic clock', meaning: 'a clock that counts something inside atoms. Atoms of one kind absorb and give out light at a predictable frequency, and the clock counts those vibrations. The second is defined today by caesium atoms, which an atomic clock counts at microwave frequencies.' },
  { term: 'Frequency', meaning: 'how many times something vibrates in one second. A faster vibration cuts time into finer pieces, like a ruler with finer marks.' },
  { term: 'Optical clock', meaning: 'an atomic clock that counts light itself, not microwaves. NIST says that optical atomic clocks emit light at frequencies “tens of thousands of times higher than the microwave frequencies emitted by cesium atoms”, so they divide time into much finer pieces.' },
  { term: 'Optical lattice clock', meaning: 'an optical clock in which thousands of ultracold atoms, such as strontium or ytterbium, are held in a pattern of laser light. NIST compares the pattern to eggs resting in an egg carton. Watching many atoms at once makes the clock more precise and quicker to read.' },
  { term: 'Strontium', meaning: 'the kind of atom (a metal) used in the JILA clock of this experiment. Ytterbium is another kind used in similar clocks.' },
  { term: 'Ultracold', meaning: 'cooled until the atoms almost stop moving, a tiny fraction of a degree above the lowest temperature that is possible. Atoms that barely move can be held in place and watched for longer.' },
  { term: 'Fractional rate difference', meaning: 'by what fraction one clock ticks faster than another. “One part in 1,000” means that for every 1,000 ticks of the slower clock, the faster one makes 1,001. It is written as a power of ten: 10⁻³ is one part in a thousand, 10⁻⁶ one part in a million.' },
  { term: 'Power of ten', meaning: '10⁻⁶ means 1 ÷ 1,000,000. Each step down in the exponent makes the number ten times smaller, so 10⁻¹⁹ is one part in 10 followed by 18 zeros, ten million trillion.' },
  { term: 'Millisecond, microsecond, nanosecond, picosecond', meaning: 'a thousandth, a millionth, a billionth and a trillionth of a second. In a nanosecond, light travels about 30 centimetres.' },
  { term: 'Precision', meaning: 'the smallest difference that a clock can notice. A clock whose precision is 10⁻¹⁸ can notice that another clock ticks faster or slower by one part in 10¹⁸, and not a smaller difference.' },
  { term: 'Height difference', meaning: 'how much higher one clock is than the other, measured along a vertical line. In this experiment it is called h.' },
  { term: 'g', meaning: 'the acceleration of an ordinary falling object near the Earth’s surface, 9.81 metres per second per second. It measures how strong gravity is there. Gravity is slightly weaker higher up.' },
  { term: 'Geodesy', meaning: 'the science of measuring the shape of the Earth and its gravity. NIST says that ultraprecise clocks could help “more precisely measure the shape and gravity of the Earth”. In 2018 a transportable clock was used to find the difference in gravity between two places about 1,000 metres apart in height, and the result agreed with conventional methods.' },
  { term: 'Accuracy and precision', meaning: 'two different things. Accuracy is how close a clock’s ticks come to the true length of the second; the BIPM says that optical clocks are “10 to 100 times more accurate” than microwave clocks. Precision, as this experiment uses the word, is the smallest difference in rate that a clock can notice when two clocks are compared. JILA’s 7.6 × 10⁻²¹ is a measurement uncertainty from hours of data on one cloud of atoms: it says what difference that measurement could see, and it is not the accuracy of the clock as a clock.' },
  { term: 'The second and its redefinition', meaning: 'the second is the unit of time, defined today by caesium atoms. Scientists want to replace the caesium definition with an optical one, because the best optical clocks have overtaken caesium clocks. This is a plan: the BIPM’s member states met in October 2026 and asked for a proposal in 2030. No new definition has been adopted.' },
  { term: 'BIPM, CGPM and CIPM', meaning: 'the BIPM is the international bureau that looks after the units of measurement. The CGPM is the general conference of its member states, which has met every four years lately (the 25th to the 28th met in 2014, 2018, 2022 and 2026; the 28th on 13 to 15 October 2026). The CIPM is the committee that prepares its work.' },
  { term: 'Sigma', meaning: 'a way of saying how many give-or-takes a result is from a value that was expected (Experiments 1, 2 and 8 of this group): the bigger the number, the harder it is to say the gap is just chance. About 3 sigma is often called a hint, and 5 sigma is the usual bar for a discovery.' },
]

// ---- Picture 1's skeleton: the axes of the rate difference against the height, both on logarithmic scales (the line comes with Run) ----
const P1_LEFT = 90
const P1_RIGHT = 520
const P1_TOP = 56
const P1_BOTTOM = 330
const P1_HEIGHT = 440
const MIN_HEIGHT_EXPONENT = -3 // 1 mm
const MAX_HEIGHT_EXPONENT = 4 // 10 km
const MIN_RATE_EXPONENT = -20
const MAX_RATE_EXPONENT = -12
const exponentToX = (e: number) => P1_LEFT + ((e - MIN_HEIGHT_EXPONENT) / (MAX_HEIGHT_EXPONENT - MIN_HEIGHT_EXPONENT)) * (P1_RIGHT - P1_LEFT)
const exponentToY = (e: number) => P1_BOTTOM - ((e - MIN_RATE_EXPONENT) / (MAX_RATE_EXPONENT - MIN_RATE_EXPONENT)) * (P1_BOTTOM - P1_TOP)
const HEIGHT_TICKS: [number, string][] = [
  [-3, '1 mm'], [-2, '1 cm'], [-1, '10 cm'], [0, '1 m'], [1, '10 m'], [2, '100 m'], [3, '1 km'], [4, '10 km'],
]

// The durations of control 2 (a month is a twelfth of a year of 365.25 days).
type DurationName = '1 hour' | '1 day' | '1 month' | '1 year'
const DURATIONS: { name: DurationName; seconds: number }[] = [
  { name: '1 hour', seconds: 3600 },
  { name: '1 day', seconds: 86_400 },
  { name: '1 month', seconds: SECONDS_PER_YEAR / 12 },
  { name: '1 year', seconds: SECONDS_PER_YEAR },
]
const HEIGHT_PRESETS: { label: string; exponent: number }[] = [
  { label: '1 mm', exponent: -3 },
  { label: '1 cm', exponent: -2 },
  { label: '1 m', exponent: 0 },
  { label: '1 km', exponent: 3 },
]

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'Two clocks, one above the other', 'The gap that builds up', 'Smaller heights', 'How good must a clock be?', 'What was measured']

// ---- Number formats for the pictures and the text (every value comes from the physics module) ----
function sciText(value: number, digits = 2): string {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × ${tenTo(Number(exponent))}`
}
function timeText(seconds: number): string {
  if (seconds < 1e-12) return `${(seconds * 1e15).toPrecision(3)} femtoseconds`
  if (seconds < 1e-9) return `${(seconds * 1e12).toPrecision(3)} picoseconds`
  if (seconds < 1e-6) return `${(seconds * 1e9).toPrecision(3)} nanoseconds`
  if (seconds < 1e-3) return `${(seconds * 1e6).toPrecision(3)} microseconds`
  return `${(seconds * 1e3).toPrecision(3)} milliseconds`
}
function timeShort(seconds: number): string {
  if (seconds < 1e-12) return `${(seconds * 1e15).toPrecision(3)} fs`
  if (seconds < 1e-9) return `${(seconds * 1e12).toPrecision(3)} ps`
  if (seconds < 1e-6) return `${(seconds * 1e9).toPrecision(3)} ns`
  if (seconds < 1e-3) return `${(seconds * 1e6).toPrecision(3)} µs`
  return `${(seconds * 1e3).toPrecision(3)} ms`
}
// A height as the learner chose it: millimetres, centimetres, metres or kilometres.
function lengthLabel(metres: number): string {
  if (metres < 0.01) return `${Number((metres * 1000).toPrecision(2))} mm`
  if (metres < 1) return `${Number((metres * 100).toPrecision(2))} cm`
  if (metres < 1000) return `${Number(metres.toPrecision(2))} m`
  return `${Number((metres / 1000).toPrecision(2))} km`
}
function lengthText(metres: number): string {
  if (metres < 1e-4) return `${(metres * 1000).toPrecision(2)} mm`
  if (metres < 0.1) return `${(metres * 1000).toPrecision(2)} mm`
  return `${metres.toPrecision(2)} m`
}

// The heights marked on Pictures 1 and 2 (this experiment's own choice): the first is the prediction's 1 metre.
const MARKED_HEIGHTS: { metres: number; name: string }[] = [
  { metres: 1, name: '1 m' },
  { metres: 0.001, name: '1 mm' },
  { metres: 0.01, name: '1 cm' },
  { metres: 1000, name: '1 km' },
]

// ---- Picture 1: how much faster does a higher clock tick? Stage 0: the axes; stage 1: the line and the 1 m point; stage 3: the other marked heights ----
function PictureOne({ stage, yourHeight }: { stage: number; yourHeight: number | null }) {
  const point = (metres: number) => ({ x: exponentToX(Math.log10(metres)), y: exponentToY(Math.log10(rateDifference(metres))) })
  const start = point(10 ** MIN_HEIGHT_EXPONENT)
  const end = point(10 ** MAX_HEIGHT_EXPONENT)
  return (
    <svg
      width={VIEW_WIDTH}
      height={P1_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${P1_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label="The fraction by which a higher clock ticks faster, against the height difference between two clocks, both on logarithmic scales. From the first stage a straight line rises to the right, with the heights 1 metre, 1 millimetre, 1 centimetre and 1 kilometre marked on it"
    >
      <text x={P1_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: how much faster does a higher clock tick?
      </text>
      <line x1={P1_LEFT} y1={P1_TOP} x2={P1_LEFT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <line x1={P1_LEFT} y1={P1_BOTTOM} x2={P1_RIGHT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {HEIGHT_TICKS.map(([exponent, label]) => (
        <g key={exponent}>
          <line x1={exponentToX(exponent)} y1={P1_BOTTOM} x2={exponentToX(exponent)} y2={P1_BOTTOM + 5} stroke={TEXT_COLOR} />
          <text x={exponentToX(exponent)} y={P1_BOTTOM + 18} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      {[-20, -18, -16, -14, -12].map((exponent) => (
        <g key={exponent}>
          <line x1={P1_LEFT - 6} y1={exponentToY(exponent)} x2={P1_LEFT} y2={exponentToY(exponent)} stroke={TEXT_COLOR} />
          <line x1={P1_LEFT} y1={exponentToY(exponent)} x2={P1_RIGHT} y2={exponentToY(exponent)} stroke={MUTED_COLOR} strokeWidth={0.5} strokeDasharray="2 4" />
          <text x={P1_LEFT - 10} y={exponentToY(exponent) + 3} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
            {tenTo(exponent)}
          </text>
        </g>
      ))}
      <text x={P1_LEFT} y={P1_TOP - 8} fill={MUTED_COLOR} fontSize="10">
        by what fraction the higher clock ticks faster
      </text>
      <text x={P1_RIGHT} y={P1_BOTTOM + 38} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        height difference between the two clocks (each step to the right is 10 times higher)
      </text>

      {stage >= 1 && <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={LINE_COLOR} strokeWidth={2.5} />}
      {MARKED_HEIGHTS.filter((h) => stage >= 3 || h.metres === 1)
        .filter(() => stage >= 1)
        .map((h) => {
          const p = point(h.metres)
          return (
            <g key={h.name}>
              <circle cx={p.x} cy={p.y} r={5} fill={LINE_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
              <text x={p.x + 9} y={p.y + 16} fill={LINE_COLOR} fontSize="10" fontWeight="bold">
                {h.name}: {sciText(rateDifference(h.metres), 2)}
              </text>
            </g>
          )
        })}
      {yourHeight !== null && <YourHeightMark metres={yourHeight} point={point} />}
      {stage === 0 && (
        <text x={P1_LEFT} y={P1_HEIGHT - 12} fill={MUTED_COLOR} fontSize="11">
          The line, and the heights marked on it, are drawn here when you press Run.
        </text>
      )}
    </svg>
  )
}

// The learner's own height on Picture 1: a pink ring on the line with a label that is moved out of the way of the labels of the marked heights.
function YourHeightMark({ metres, point }: { metres: number; point: (m: number) => { x: number; y: number } }) {
  const p = point(metres)
  const taken = MARKED_HEIGHTS.map((h) => {
    const q = point(h.metres)
    return { x1: q.x + 9, x2: q.x + 9 + 135, y1: q.y + 6, y2: q.y + 19 }
  })
  const collides = (x: number, y: number) => taken.some((t) => x + 9 < t.x2 && x + 9 + 150 > t.x1 && y - 10 < t.y2 && y + 3 > t.y1)
  let labelY = p.y - 12
  for (const offset of [-12, 32, 48, -28, 64, -44]) {
    const candidate = p.y + offset
    if (candidate > P1_TOP && candidate < P1_BOTTOM + 8 && !collides(p.x, candidate)) {
      labelY = candidate
      break
    }
  }
  const labelX = Math.min(p.x + 9, P1_RIGHT - 150)
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={7} fill="none" stroke={YOURS_COLOR} strokeWidth={2.5} />
      <text x={labelX} y={labelY} fill={YOURS_COLOR} fontSize="10" fontWeight="bold">
        your height {lengthLabel(metres)}: {sciText(rateDifference(metres), 2)}
      </text>
    </g>
  )
}

// ---- Picture 2: how big is the gap after a year? Stage 2: the 1 m dot; stage 3: the other heights ----
const P2_LEFT = 130
const P2_RIGHT = 520
const P2_TOP = 56
const MIN_TIME_EXPONENT = -16 // 0.1 femtosecond
const MAX_TIME_EXPONENT = -4 // 100 microseconds
const timeToX = (e: number) => P2_LEFT + ((e - MIN_TIME_EXPONENT) / (MAX_TIME_EXPONENT - MIN_TIME_EXPONENT)) * (P2_RIGHT - P2_LEFT)
const TIME_TICKS: [number, string][] = [
  [-15, '1 fs'], [-12, '1 ps'], [-9, '1 ns'], [-6, '1 µs'],
]
const P2_ROWS = [0.001, 0.01, 1, 1000] // the four heights, from the top row to the bottom

function PictureTwo({ stage, yours, gapGuess }: { stage: number; yours: { metres: number; seconds: number; durationName: string } | null; gapGuess: TimeScale | null }) {
  const axisY = yours !== null ? 345 : 290
  const height = (yours !== null ? 430 : 370) + 96 // room for the guess's own line under the axis
  const stripY = axisY + 82
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="The gap that builds up in one year between two clocks, on a logarithmic scale from 0.1 femtosecond to 100 microseconds. From the second stage a dot marks the gap for a height of 1 metre, and from the third stage dots mark the gaps for 1 millimetre, 1 centimetre and 1 kilometre"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: how big is the gap after a year?
      </text>
      <text x={20} y={40} fill={MUTED_COLOR} fontSize="10">
        How far ahead the higher clock is after one year, for four heights (and, after the run, for your own)
      </text>
      <line x1={P2_LEFT} y1={axisY} x2={P2_RIGHT} y2={axisY} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {Array.from({ length: MAX_TIME_EXPONENT - MIN_TIME_EXPONENT + 1 }, (_, i) => MIN_TIME_EXPONENT + i).map((exponent) => (
        <line key={exponent} x1={timeToX(exponent)} y1={P2_TOP} x2={timeToX(exponent)} y2={axisY} stroke={MUTED_COLOR} strokeWidth={0.5} strokeDasharray="2 4" />
      ))}
      {TIME_TICKS.map(([exponent, label]) => (
        <g key={exponent}>
          <line x1={timeToX(exponent)} y1={axisY} x2={timeToX(exponent)} y2={axisY + 5} stroke={TEXT_COLOR} />
          <text x={timeToX(exponent)} y={axisY + 18} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      <text x={P2_RIGHT} y={axisY + 38} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        gap after the time shown (each step to the right is 10 times bigger)
      </text>
      {P2_ROWS.map((metres, i) => {
        const y = P2_TOP + 30 + i * 52
        const gap = timeGap(metres, SECONDS_PER_YEAR)
        const x = timeToX(Math.log10(gap))
        const name = MARKED_HEIGHTS.find((h) => h.metres === metres)?.name ?? ''
        const shown = metres === 1 ? stage >= 2 : stage >= 3
        return (
          <g key={metres}>
            <text x={20} y={y + 4} fill={metres === 1 ? LINE_COLOR : MUTED_COLOR} fontSize="11" fontWeight="bold">
              {name} higher
            </text>
            {shown && (
              <>
                <line x1={P2_LEFT} y1={y} x2={x} y2={y} stroke={LINE_COLOR} strokeWidth={2} />
                <circle cx={x} cy={y} r={5.5} fill={LINE_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
                <text x={x + 10} y={y + 4} fill={LINE_COLOR} fontSize="10" fontWeight="bold">
                  {timeShort(gap)}
                </text>
              </>
            )}
          </g>
        )
      })}
      {stage >= 2 && gapGuess !== null && (() => {
        const x = timeToX(Math.log10(gapGuessSeconds(gapGuess)))
        const boxX = Math.min(Math.max(x - 110, 10), VIEW_WIDTH - 230)
        return (
          <g>
            <text x={20} y={stripY - 16} fill={GUESS_COLOR} fontSize="11">
              Your guess for Prediction 1: the gap after a year for two clocks 1 metre apart (same scale as above)
            </text>
            <line x1={P2_LEFT} y1={stripY} x2={P2_RIGHT} y2={stripY} stroke={MUTED_COLOR} strokeWidth={1} />
            {TIME_TICKS.map(([exponent]) => (
              <line key={exponent} x1={timeToX(exponent)} y1={stripY - 3} x2={timeToX(exponent)} y2={stripY + 3} stroke={MUTED_COLOR} />
            ))}
            <polygon points={`${x},${stripY - 8} ${x + 8},${stripY} ${x},${stripY + 8} ${x - 8},${stripY}`} fill={GUESS_COLOR} />
            <line x1={x} y1={stripY + 8} x2={x} y2={stripY + 16} stroke={GUESS_COLOR} strokeWidth={2} />
            <rect x={boxX} y={stripY + 16} width={220} height={26} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
            <text x={boxX + 110} y={stripY + 33} fill={GUESS_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
              YOUR GUESS: {GAP_SHORT[gapGuess]}
            </text>
          </g>
        )
      })()}
      {yours !== null &&
        (() => {
          const y = P2_TOP + 30 + 4 * 52
          const gap = timeGap(yours.metres, yours.seconds)
          const x = timeToX(Math.log10(gap))
          return (
            <g>
              <SvgLines x={20} y={y - 2} lines={[`your height, ${lengthLabel(yours.metres)}`, `(${yours.durationName})`]} fill={YOURS_COLOR} bold />
              <line x1={P2_LEFT} y1={y} x2={x} y2={y} stroke={YOURS_COLOR} strokeWidth={2} />
              <circle cx={x} cy={y} r={6} fill="none" stroke={YOURS_COLOR} strokeWidth={2.5} />
              <text x={Math.min(x + 10, P2_RIGHT - 70)} y={y - 9} fill={YOURS_COLOR} fontSize="10" fontWeight="bold">
                {timeShort(gap)}
              </text>
            </g>
          )
        })()}
    </svg>
  )
}

// ---- Picture 3: how good must a clock be? Stage 4: three clocks; stage 5: the two measured heights ----
const P3_LEFT = 150
const P3_RIGHT = 520
const P3_TOP = 100
const MIN_LENGTH_EXPONENT = -6 // 1 micrometre
const MAX_LENGTH_EXPONENT = 2 // 100 m
const lengthToX = (e: number) => P3_LEFT + ((e - MIN_LENGTH_EXPONENT) / (MAX_LENGTH_EXPONENT - MIN_LENGTH_EXPONENT)) * (P3_RIGHT - P3_LEFT)
const LENGTH_TICKS: [number, string][] = [
  [-6, '1 µm'], [-5, '10 µm'], [-4, '0.1 mm'], [-3, '1 mm'], [-2, '1 cm'], [-1, '10 cm'], [0, '1 m'], [1, '10 m'], [2, '100 m'],
]
const CLOCKS: { precision: number; lines: string[]; color: string }[] = [
  { precision: 1e-16, lines: ['a clock good to', tenTo(-16)], color: '#fb923c' },
  { precision: 1e-18, lines: ['a clock good to', tenTo(-18)], color: '#fbbf24' },
  { precision: PREDICTION_PRECISION, lines: ['Prediction 2’s clock', `good to ${tenTo(-19)} (imagined)`], color: IMAGINED_COLOR },
  { precision: JILA_2022.precision, lines: ['the JILA clock of 2022:', `${sciText(JILA_2022.precision, 1)}`], color: CLOCK_COLOR },
]

function PictureThree({ stage, yourPrecision, heightGuess }: { stage: number; yourPrecision: number | null; heightGuess: LengthScale | null }) {
  const P3_AXIS_Y = yourPrecision !== null ? 385 : 330
  const P3_HEIGHT = (yourPrecision !== null ? 520 : 465) + 150 // room for the guess's own line under the axis
  const stripY = P3_AXIS_Y + 128
  return (
    <svg
      width={VIEW_WIDTH}
      height={P3_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${P3_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label="The smallest height difference that a clock can notice, on a logarithmic scale from 1 micrometre to 100 metres, for four clocks of better and better precision. From the fifth stage two dashed lines mark the heights that the JILA and Wisconsin teams measured"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: how good must a clock be?
      </text>
      <text x={20} y={40} fill={MUTED_COLOR} fontSize="10">
        The dot is the smallest height difference a clock can notice; the line shows the heights it can tell apart
      </text>
      <line x1={P3_LEFT} y1={P3_AXIS_Y} x2={P3_RIGHT} y2={P3_AXIS_Y} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {LENGTH_TICKS.map(([exponent, label]) => (
        <g key={exponent}>
          <line x1={lengthToX(exponent)} y1={P3_TOP} x2={lengthToX(exponent)} y2={P3_AXIS_Y} stroke={MUTED_COLOR} strokeWidth={0.5} strokeDasharray="2 4" />
          <line x1={lengthToX(exponent)} y1={P3_AXIS_Y} x2={lengthToX(exponent)} y2={P3_AXIS_Y + 5} stroke={TEXT_COLOR} />
          <text x={lengthToX(exponent)} y={P3_AXIS_Y + 18} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      <text x={P3_RIGHT} y={P3_AXIS_Y + 38} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        height difference between two clocks (each step to the right is 10 times higher)
      </text>
      {stage >= 4 &&
        CLOCKS.map((clock, i) => {
          const y = P3_TOP + 25 + i * 55
          const smallest = smallestHeight(clock.precision)
          const x = lengthToX(Math.log10(smallest))
          return (
            <g key={i}>
              <SvgLines x={20} y={y - 2} lines={clock.lines} fill={clock.color} bold />
              <line x1={x} y1={y} x2={P3_RIGHT} y2={y} stroke={clock.color} strokeWidth={2} opacity={0.55} />
              <circle cx={x} cy={y} r={5.5} fill={clock.color} stroke={TEXT_COLOR} strokeWidth={1} />
              <text x={x + 9} y={y - 8} fill={clock.color} fontSize="10" fontWeight="bold">
                {lengthText(smallest)}
              </text>
            </g>
          )
        })}
      {yourPrecision !== null &&
        (() => {
          const y = P3_TOP + 25 + 4 * 55
          const smallest = smallestHeight(yourPrecision)
          const x = lengthToX(Math.log10(smallest))
          return (
            <g>
              <SvgLines x={20} y={y - 2} lines={['your clock, good to', sciText(yourPrecision, 1)]} fill={YOURS_COLOR} bold />
              <line x1={x} y1={y} x2={P3_RIGHT} y2={y} stroke={YOURS_COLOR} strokeWidth={2} opacity={0.55} />
              <circle cx={x} cy={y} r={6} fill="none" stroke={YOURS_COLOR} strokeWidth={2.5} />
              <text x={Math.min(x + 9, P3_RIGHT - 60)} y={y - 8} fill={YOURS_COLOR} fontSize="10" fontWeight="bold">
                {lengthText(smallest)}
              </text>
            </g>
          )
        })()}
      {stage >= 4 && heightGuess !== null && (() => {
        const x = lengthToX(Math.log10(heightGuessMetres(heightGuess)))
        const boxX = Math.min(Math.max(x - 110, 10), VIEW_WIDTH - 230)
        return (
          <g>
            <text x={20} y={stripY - 16} fill={GUESS_COLOR} fontSize="11">
              Your guess for Prediction 2: the height a clock good to {tenTo(-19)} can notice (same scale as above)
            </text>
            <line x1={P3_LEFT} y1={stripY} x2={P3_RIGHT} y2={stripY} stroke={MUTED_COLOR} strokeWidth={1} />
            {LENGTH_TICKS.map(([exponent]) => (
              <line key={exponent} x1={lengthToX(exponent)} y1={stripY - 3} x2={lengthToX(exponent)} y2={stripY + 3} stroke={MUTED_COLOR} />
            ))}
            <polygon points={`${x},${stripY - 8} ${x + 8},${stripY} ${x},${stripY + 8} ${x - 8},${stripY}`} fill={GUESS_COLOR} />
            <line x1={x} y1={stripY + 8} x2={x} y2={stripY + 16} stroke={GUESS_COLOR} strokeWidth={2} />
            <rect x={boxX} y={stripY + 16} width={220} height={26} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
            <text x={boxX + 110} y={stripY + 33} fill={GUESS_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
              YOUR GUESS: {HEIGHT_SHORT[heightGuess]}
            </text>
          </g>
        )
      })()}
      {stage >= 5 && (
        <>
          <line x1={lengthToX(-3)} y1={P3_TOP - 12} x2={lengthToX(-3)} y2={P3_AXIS_Y} stroke={CLOCK_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
          <line x1={lengthToX(-2)} y1={P3_TOP - 12} x2={lengthToX(-2)} y2={P3_AXIS_Y} stroke={WISCONSIN_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
          <SvgLines x={lengthToX(-3) - 4} y={P3_TOP - 22} lines={['JILA 2022: a cloud', 'about 1 mm tall']} fill={CLOCK_COLOR} bold anchor="end" />
          <SvgLines x={lengthToX(-2) + 4} y={P3_TOP - 22} lines={['Wisconsin 2022-23:', '1 cm']} fill={WISCONSIN_COLOR} bold />
          <SvgLines
            x={20}
            y={P3_AXIS_Y + 58}
            lines={[
              `JILA: the effect across 1 mm is ${sciText(rateDifference(0.001), 2)}, which is ${signalToPrecision(0.001, JILA_2022.precision).toFixed(1)} times its precision.`,
              `Wisconsin: measured ${WISCONSIN_2023.measured} ± ${WISCONSIN_2023.statistical} ± ${WISCONSIN_2023.systematic} (units of ${tenTo(-19)} per cm), expected ${WISCONSIN_2023.expected}: ${sigmasFromExpected(WISCONSIN_2023.measured, WISCONSIN_2023.statistical, WISCONSIN_2023.systematic, WISCONSIN_2023.expected).toFixed(2)} sigma.`,
            ]}
            fill={MUTED_COLOR}
          />
        </>
      )}
    </svg>
  )
}

// The papers and the release behind the results, shown only after the run because their summaries state what the predictions ask (CLAUDE.md §12).
// Each address was fetched on 2026-10-21 (the arXiv pages for their abstracts, the NIST release through a summary).
const PAPER_LINKS: { href: string; label: string; what: string }[] = [
  {
    href: 'https://www.nist.gov/node/406641',
    label: 'NIST, 2010: your head is older than your feet',
    what: 'a plain account of an earlier test, with two clocks a foot apart in height, and of why the effect is far too small for people to notice.',
  },
  {
    href: 'https://euramet.org/publications-media-centre/news/news/optical-atomic-clock-used-to-measure-gravitation-for-the-first-time',
    label: 'Euramet, 2018: an optical clock used to measure gravity for the first time',
    what: 'the field test in which a transportable clock was compared with a clock about 1,000 metres different in height.',
  },
  {
    href: 'https://www.riken.jp/en/news_pubs/research_news/pr/2020/20200407_2',
    label: 'RIKEN, 2020: the Tokyo Skytree test',
    what: 'the test with one clock at the foot and one on the 450-metre observatory floor of Tokyo Skytree.',
  },
  {
    href: 'https://arxiv.org/abs/2109.12238',
    label: 'arXiv:2109.12238: the JILA paper (Nature, 2022)',
    what: 'Bothwell and colleagues, “Resolving the gravitational redshift within a millimeter atomic sample”: the original report of the precision of 7.6 × 10⁻²¹. It is written for scientists.',
  },
  {
    href: 'https://www.nist.gov/node/1693351',
    label: 'NIST and JILA, 16 February 2022: the release on the JILA clock',
    what: 'the laboratories’ own plain-language account: the clock of about 100,000 strontium atoms, the size of the effect, and what it might be used for.',
  },
  {
    href: 'https://arxiv.org/abs/2207.07145',
    label: 'arXiv:2207.07145: the Wisconsin paper (Nature Communications, 2023)',
    what: 'Zheng and colleagues, “A lab-based test of the gravitational redshift with a miniature clock network”: five clouds of atoms spanning 1 centimetre, with the measured gradient and its give-or-takes.',
  },
]

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const GAP_CHOICES: ReadonlyArray<{ value: TimeScale; label: string }> = [
  { value: 'microsecond', label: 'About 3 microseconds (millionths of a second)' },
  { value: 'nanosecond', label: 'About 3 nanoseconds (billionths of a second)' },
  { value: 'picosecond', label: 'About 3 picoseconds (trillionths of a second)' },
]
const HEIGHT_CHOICES: ReadonlyArray<{ value: LengthScale; label: string }> = [
  { value: 'metre', label: 'About 1 metre' },
  { value: 'centimetre', label: 'About 1 centimetre' },
  { value: 'millimetre', label: 'About 1 millimetre' },
]

// ---- Part 2's drawing: your numbers beside the reference values (the learner's own choice, pink; the reference marks, yellow) ----
const DA_LEFT = 40
const DA_RIGHT = 520
const DA_ROW_TOP = 56
const DA_ROW_STEP = 82
const DA_HEIGHT = DA_ROW_TOP + 3 * DA_ROW_STEP
const REF_COLOR = '#fde047' // yellow: a reference value

function YourClockDrawing({ heightM, seconds, precision }: { heightM: number; seconds: number; precision: number }) {
  const mine = clockHeightDrawingValues(heightM, seconds, precision)
  const ref = clockHeightDrawingReference()
  const sc = DRAWING_SCALES
  const logX = (v: number, r: { min: number; max: number }) => DA_LEFT + (Math.log(v / r.min) / Math.log(r.max / r.min)) * (DA_RIGHT - DA_LEFT)
  const lengthTick = (exponent: number) => ({ '-6': '1 µm', '-3': '1 mm', '0': '1 m', '3': '1 km', '5': '100 km' } as Record<string, string>)[String(exponent)]
  const rows = [
    {
      key: 'rate', title: 'How much faster the higher clock ticks (a logarithmic scale)', x: (v: number) => logX(v, sc.rate), mine: mine.rate, ref: ref.rate,
      ticks: [-19, -17, -15, -13, -11], tickLabel: (e: number) => tenTo(e), valueText: (v: number) => sciText(v, 2), refName: 'a height of 1 metre',
    },
    {
      key: 'gap', title: 'How far ahead it is after your time (a logarithmic scale)', x: (v: number) => logX(v, sc.gapSeconds), mine: mine.gapSeconds, ref: ref.gapSeconds,
      ticks: [-15, -12, -9, -6, -3], tickLabel: (e: number) => ({ '-15': '1 fs', '-12': '1 ps', '-9': '1 ns', '-6': '1 µs', '-3': '1 ms' } as Record<string, string>)[String(e)], valueText: (v: number) => timeText(v), refName: '1 metre for a year',
    },
    {
      key: 'smallest', title: 'The smallest height your clock can notice (a logarithmic scale)', x: (v: number) => logX(v, sc.smallestM), mine: mine.smallestM, ref: ref.smallestM,
      ticks: [-6, -3, 0, 3, 5], tickLabel: (e: number) => lengthTick(e), valueText: (v: number) => lengthText(v), refName: 'the JILA clock of 2022',
    },
  ]
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <svg
        width={VIEW_WIDTH}
        height={DA_HEIGHT}
        viewBox={`0 0 ${VIEW_WIDTH} ${DA_HEIGHT}`}
        style={svgStyle}
        role="img"
        aria-label="Three short logarithmic scales for your own numbers: how much faster a clock at your height ticks, how far ahead it is after your time, and the smallest height that your clock can notice, each with a reference value and your value marked"
      >
        <text x={DA_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
          Drawing A: your numbers beside the real ones
        </text>
        <text x={DA_LEFT} y={40} fill={MUTED_COLOR} fontSize="10">
          Each scale has a yellow line for a reference value and a pink dot for your own choice.
        </text>
        {rows.map((row, i) => {
          const y0 = DA_ROW_TOP + i * DA_ROW_STEP
          return (
            <g key={row.key}>
              <text x={DA_LEFT} y={y0} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
                {row.title}
              </text>
              <rect x={DA_LEFT} y={y0 + 8} width={DA_RIGHT - DA_LEFT} height={14} fill={MUTED_COLOR} opacity={0.3} />
              <line x1={row.x(row.ref)} y1={y0 + 4} x2={row.x(row.ref)} y2={y0 + 26} stroke={REF_COLOR} strokeWidth={2.5} />
              <circle cx={row.x(row.mine)} cy={y0 + 15} r={5.5} fill={YOURS_COLOR} />
              {row.ticks.map((t) => (
                <g key={t}>
                  <line x1={row.x(10 ** t)} y1={y0 + 24} x2={row.x(10 ** t)} y2={y0 + 29} stroke={TEXT_COLOR} />
                  <text x={row.x(10 ** t)} y={y0 + 40} fill={TEXT_COLOR} fontSize="9" textAnchor="middle">
                    {row.tickLabel(t)}
                  </text>
                </g>
              ))}
              <text x={DA_LEFT} y={y0 + 56} fill={MUTED_COLOR} fontSize="10">
                <tspan fill={YOURS_COLOR}>pink: yours, {row.valueText(row.mine)}</tspan>
                <tspan> · </tspan>
                <tspan fill={REF_COLOR}>yellow: {row.refName}, {row.valueText(row.ref)}</tspan>
              </text>
            </g>
          )
        })}
      </svg>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
        <p style={paragraph}>
          <strong>How to read Drawing A.</strong> It puts the numbers of your three choices in one place, each on its own short scale, with a yellow line for a real value to compare them with. Every scale is logarithmic: each step to the right is ten times the one before. It follows the controls above, so it changes when you change them.
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The first scale</strong> is the fraction by which a clock at your height ticks faster; the <span style={{ color: REF_COLOR }}>yellow line</span> is the fraction for 1 metre. <strong>The second scale</strong> is how far ahead that clock is after your time; the yellow line is
            1 metre for a year. <strong>The third scale</strong> is the smallest height your clock can notice; the yellow line is the JILA clock of 2022. A dot <strong>further right</strong> means a bigger fraction, a bigger gap or a coarser clock.
          </li>
          <li>
            <strong>The pink dot</strong> on each scale is your own choice. <strong>At the starting settings</strong> (1 metre, 1 year) the first two dots sit on their yellow lines; change a control to see them part.
          </li>
        </ul>
        <p style={paragraph}>
          <strong>A worked moment.</strong> For 1 metre, {G_EARTH} × 1 ÷ {sciText(SPEED_OF_LIGHT * SPEED_OF_LIGHT, 3)} = {sciText(ref.rate, 2)}; over a year ({SECONDS_PER_YEAR.toLocaleString('en-US')} s) that gives {timeText(ref.gapSeconds)}. A clock good to {tenTo(-18)} notices {lengthText(smallestHeight(1e-18))}, while JILA’s notices {lengthText(ref.smallestM)}.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
          <strong>What to look for.</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Look at</strong> the pink dot on the first scale, against the yellow line. <strong>What it means:</strong> a clock {lengthLabel(heightM)} higher ticks faster by {sciText(mine.rate, 2)}, {mine.rate > ref.rate ? 'more' : mine.rate < ref.rate ? 'less' : 'the same'} than the {sciText(ref.rate, 2)} for 1 metre.{' '}
            <strong>Why it matters:</strong> the fraction is proportional to the height, so ten times the height moves the dot one step to the right.
          </li>
          <li>
            <strong>Look at</strong> the pink dot on the second scale. <strong>What it means:</strong> after {seconds === SECONDS_PER_YEAR ? '1 year' : `${seconds.toLocaleString('en-US')} s`} the clocks are {timeText(mine.gapSeconds)} apart, against {timeText(ref.gapSeconds)} for 1 metre and a year.{' '}
            <strong>Why it matters:</strong> a small fraction adds up with time, so a longer comparison makes a tiny effect bigger.
          </li>
          <li>
            <strong>Look at</strong> the pink dot on the third scale. <strong>What it means:</strong> a clock good to {sciText(precision, 1)} notices {lengthText(mine.smallestM)}, {mine.smallestM > ref.smallestM ? 'coarser' : mine.smallestM < ref.smallestM ? 'finer' : 'the same as'} than JILA’s {lengthText(ref.smallestM)}.{' '}
            <strong>Why it matters:</strong> a better clock notices a smaller height, so the dot moves left as the precision improves.
          </li>
        </ul>
        <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.75rem' }}>
          <strong>Where the real picture comes from.</strong> <em>Measured:</em> JILA’s precision, {sciText(JILA_2022.precision, 1)} (Bothwell et al., Nature 602, 2022). <em>Calculated here:</em> the fraction, the gap and the smallest height, from g × h ÷ c², times the time, and the precision ÷ (g ÷ c²).{' '}
          <em>Imagined for the question:</em> your height, your time and your clock. The pink dots are your own choice; the yellow lines are real or published values.
        </p>
      </div>
    </div>
  )
}

export function ClockHeightExperiment({ onComplete, onTutorComplete }: ClockHeightExperimentProps) {
  const [gapPrediction, setGapPrediction] = useState<TimeScale | null>(null)
  const [heightPrediction, setHeightPrediction] = useState<LengthScale | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  // The controls that appear after the run (the specification's "Learner Controls"). They start at the pictures' own values: 1 metre, one year and 10^-18.
  const [heightExp, setHeightExp] = useState(0) // the slider holds the power of ten of the height in metres
  const [durationName, setDurationName] = useState<DurationName>('1 year')
  const [precisionExp, setPrecisionExp] = useState(-18) // the slider holds the power of ten of the precision
  const hasRun = status !== 'idle'
  const bothPredicted = gapPrediction !== null && heightPrediction !== null

  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) {
        setStage(stage + 1)
      } else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  function startOver() {
    setGapPrediction(null)
    setHeightPrediction(null)
    setStatus('idle')
    setStage(0)
    setHeightExp(0)
    setDurationName('1 year')
    setPrecisionExp(-18)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }
  const oneMetre = { rate: rateDifference(1), gap: timeGap(1, SECONDS_PER_YEAR) }
  const billionYears = yearsToDrift(1e-19) / 1e9
  const done = status === 'complete'
  const yourHeight = Number((10 ** heightExp).toPrecision(2)) // two figures, so that the arithmetic is easy to follow
  const yourPrecision = Number((10 ** precisionExp).toPrecision(2))
  const yourDuration = DURATIONS.find((d) => d.name === durationName) as { name: DurationName; seconds: number }
  const mine = runClockHeight(yourHeight, yourDuration.seconds, yourPrecision)
  const cSquared = SPEED_OF_LIGHT * SPEED_OF_LIGHT
  const wisconsinSigmas = sigmasFromExpected(WISCONSIN_2023.measured, WISCONSIN_2023.statistical, WISCONSIN_2023.systematic, WISCONSIN_2023.expected)
  const wisconsinCombined = Math.sqrt(WISCONSIN_2023.statistical ** 2 + WISCONSIN_2023.systematic ** 2)
  // Formulas with worked examples: shown in the panel only after the run (the specification's "Results"). Every number is from the module.
  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'Rate difference (formula)',
      meaning: `fraction = g × h ÷ c², where g = ${G_EARTH} m/s², h is the height difference in metres and c = ${SPEED_OF_LIGHT.toLocaleString('en-US')} m/s. Example, h = 1 metre: ${G_EARTH} × 1 ÷ (${sciText(cSquared, 3)}) = ${sciText(oneMetre.rate, 2)}. Ten times the height gives ten times the fraction. It holds for heights up to a few kilometres, with one constant g.`,
    },
    {
      term: 'Gap after a time (formula)',
      meaning: `gap = fraction × time. Example, 1 metre for one year (${SECONDS_PER_YEAR.toLocaleString('en-US')} seconds): ${sciText(oneMetre.rate, 2)} × ${SECONDS_PER_YEAR.toLocaleString('en-US')} = ${timeText(oneMetre.gap)}. Twice the time gives twice the gap.`,
    },
    {
      term: 'Smallest height (formula)',
      meaning: `smallest height = precision ÷ (g ÷ c²). Example, a clock good to ${tenTo(-18)}: ${tenTo(-18)} ÷ ${sciText(oneMetre.rate, 2)} = ${lengthText(smallestHeight(1e-18))}. A clock ten times better notices a height ten times smaller.`,
    },
    {
      term: 'Signal against precision (formula)',
      meaning: `signal ÷ precision, where the signal is the fraction for the height. Example, JILA’s 1 millimetre: ${sciText(rateDifference(0.001), 2)} ÷ ${sciText(JILA_2022.precision, 1)} = ${signalToPrecision(0.001, JILA_2022.precision).toFixed(1)}, so the effect was about ${signalToPrecision(0.001, JILA_2022.precision).toFixed(0)} times larger than the precision.`,
    },
    {
      term: 'Sigma from the expected value (formula)',
      meaning: `sigma = |measured − expected| ÷ √(statistical² + systematic²), the two give-or-takes combined as if independent (this experiment’s simplification). Example, the Wisconsin result: |${WISCONSIN_2023.measured} − ${WISCONSIN_2023.expected}| ÷ √(${WISCONSIN_2023.statistical}² + ${WISCONSIN_2023.systematic}²) = ${(WISCONSIN_2023.measured - WISCONSIN_2023.expected).toFixed(1)} ÷ ${wisconsinCombined.toFixed(2)} = ${wisconsinSigmas.toFixed(2)}. Below 2 sigma is usually called compatible with the expected value.`,
    },
    {
      term: 'Years to drift by a second',
      meaning: `years = 1 ÷ (fraction × ${SECONDS_PER_YEAR.toLocaleString('en-US')}). Example, a clock wrong by one part in ${tenTo(19)}: ${billionYears.toFixed(0)} billion years to be wrong by one second.`,
    },
  ]
  const timesAgeOfUniverse = billionYears / 13.8
  const checkUp = clockHeightCheckUp()
  const caseGap = predictionGapSeconds()
  const caseHeight = predictionHeightMetres()
  const nanosecondCentimetres = SPEED_OF_LIGHT * 1e-9 * 100
  return (
    <div>
      <h2>Experiment 9 — Can a Clock Tell How High It Is?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): laboratories have measured the effect that this experiment is about, with optical lattice clocks, and clocks
            have also been carried out of the laboratory for field tests. The full status, with what was found, is shown after you press Run, so that you can guess first.
          </strong>{' '}
          Clocks like these are also part of a plan to redefine the second.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> A clock sits on the floor, and an identical clock sits on a shelf a metre above it. Do they tick at exactly the same
            rate? In everyday life, yes. But in Gravity Experiment 2 you saw that gravity changes the rate of a clock: a clock where gravity is weaker ticks a
            little faster. Gravity is a little weaker the farther you are from the centre of the Earth, so a clock higher up should tick a little faster than
            one lower down. If so, the rate of a clock could tell you how high it is. This experiment asks: <strong>how small a difference in height can the
            best clocks in the world now tell apart?</strong>
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Gravity Experiment 1 you met the equivalence principle, which says that everything falls alike. In Gravity
            Experiment 2 you saw that a clock higher up ticks a little faster than one lower down, and in Gravity Experiment 9 that the effect is big enough to
            matter for GPS satellites, whose clocks are 20,000 kilometres up. In Experiments 1, 2 and 8 of this group you met <strong>sigma</strong>, a way of
            saying how sure a result is.
          </p>

          <p style={paragraph}>
            <strong>What an atomic clock is.</strong> Every clock counts something that repeats at a steady rate: the swings of a pendulum, the vibrations of a
            quartz crystal. An <strong>atomic clock</strong> counts something inside atoms. Atoms of one kind absorb and give out light at a
            predictable frequency (a <strong>frequency</strong> is how many times something vibrates in one second), and the clock counts those vibrations. The
            second is defined today by caesium atoms, whose clocks count microwaves. An <strong>optical</strong> clock counts light itself. NIST says that
            optical clocks use light at frequencies tens of thousands of times higher than the microwaves of caesium clocks, so they divide time into much finer
            pieces. Think of measuring a table with a ruler marked in millimetres, instead of one marked only in metres.
          </p>

          <p style={paragraph}>
            An <strong>optical lattice clock</strong> holds thousands of <strong>ultracold</strong> atoms, such as strontium, in a pattern of laser light (the{' '}
            <strong>optical lattice</strong>). Ultracold means cooled until the atoms almost stop moving. NIST compares the pattern of light to eggs resting in an
            egg carton. In 2022 a team at JILA, a research institute in Boulder, Colorado, built such a clock with about 100,000 strontium atoms.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <ClockDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is a sketch of the idea, not a picture of the real equipment, and it is not to scale. You are
              looking at the clock from the side.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The four red layers</strong> are thin sheets of laser light that hold the atoms. <strong>The yellow dots</strong> are strontium atoms,
                one row to a layer (about 100,000 in reality, a few here).
              </li>
              <li>
                <strong>The purple arrows</strong> mark the upper edge and the lower edge of the cloud of atoms. The cloud has a top and a bottom, and the top is
                a little higher.
              </li>
              <li>
                <strong>The teal dashed line</strong> is the light from the atoms, which goes to the <strong>counter</strong>. The clock counts the
                vibrations of that light, and each vibration is a tick.
              </li>
              <li>
                <strong>The blue arrow</strong> on the right shows that gravity pulls down.
              </li>
            </ul>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForClock} />
          </div>

          <p style={paragraph}>
            <strong>Writing very small numbers.</strong> Differences between clock rates are tiny, so they are written as <strong>powers of ten</strong>. {tenTo(-3)} means
            1 ÷ 1,000 (one part in a thousand), {tenTo(-6)} means one part in a million, and {tenTo(-19)} means one part in 10 followed by 18 zeros, ten million
            trillion. To picture {tenTo(-19)}: a clock that was wrong by one part in {tenTo(19)} would be wrong by one second in about {billionYears.toFixed(0)} billion
            years, about {timesAgeOfUniverse.toFixed(0)} times the age of the universe (13.8 billion years). That is only a way to picture the size of the number. Times
            are written with the prefixes <strong>millisecond</strong>, <strong>microsecond</strong>, <strong>nanosecond</strong> and <strong>picosecond</strong>: a
            thousandth, a millionth, a billionth and a trillionth of a second. In a nanosecond, light travels about {nanosecondCentimetres.toFixed(0)} centimetres.
          </p>

          <p style={paragraph}>
            <strong>The effect.</strong> A clock that is higher ticks a little faster than one lower down, and the higher it is, the bigger the difference. The
            difference is tiny. How tiny, and what a tiny fraction adds up to over a year, are what the two predictions below ask, so the numbers are shown after the
            run.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> Two laboratories have measured the effect with optical lattice clocks: the JILA team in
            2022 and a team at the University of Wisconsin–Madison, in a paper published in 2023. What they found, and over what height, are shown after the run.
            Clocks have also been carried out of the laboratory. In 2018 a transportable clock was compared with a clock that was about 1,000 metres different in
            height, and the result agreed with measurements by conventional methods: a proof of principle, and not yet routine. In 2020 two clocks were compared
            between the foot of Tokyo Skytree and its 450-metre observatory floor. NIST says that ultraprecise clocks could also help to measure the shape and gravity
            of the Earth. Optical clocks are also candidates for a new definition of the second, and that is a plan, not a result. The BIPM’s member states, at
            their 28th general conference on 13 to 15 October 2026, did not adopt a new definition. They asked the committee that prepares their work to work
            toward a proposal, with a date, to be presented in 2030, and noted that they had not reached a consensus on which atom, or atoms, to use.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Atomic clock</strong>, <strong>optical clock</strong>, <strong>optical lattice clock</strong>, <strong>strontium</strong>,{' '}
                <strong>ultracold</strong> and <strong>frequency</strong>: how the best clocks work, in outline.
              </li>
              <li>
                <strong>Fractional rate difference</strong>, <strong>power of ten</strong>, and the units from <strong>millisecond</strong> to{' '}
                <strong>picosecond</strong>: how to write and picture tiny differences.
              </li>
              <li>
                <strong>Precision</strong> and <strong>height difference</strong>: the smallest difference a clock can notice, and the height between two
                clocks.
              </li>
              <li>
                <strong>Geodesy</strong>, <strong>the second</strong>, and <strong>BIPM, CGPM and CIPM</strong>: what clocks might be used for, and who looks
                after the units.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other
            heights, other durations and other clock precisions of your own. Nothing here is graded. Your predictions never change the real pictures or tables. They are drawn on Pictures 2 and 3 in white, in a box marked YOUR GUESS, so you can compare them with what was calculated, and they are listed again beside the results. In Part 2 you can try other heights, durations and clock precisions. Those choices are pink: they add a pink mark to each picture and fill a drawing in Part 2 and Table 4, but they never change the real marks, the published results or your guesses.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It does not model how an optical lattice clock works inside, and it does not analyse
            the data of any laboratory: it uses the published numbers as the papers state them. It uses one constant value of g, 9.81 metres per second per second,
            and ignores the Earth’s real gravity field and shape; that is a good approximation for heights of a few kilometres, and the experiment goes no higher than
            10 kilometres. It treats the two clocks as identical, at rest and compared exactly. Real comparisons need links between the clocks and corrections that
            are not modelled here. It does not claim that the second will be redefined.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links to the original scientific papers and to the laboratory’s own release
            appear below the results, after you press Run, because their summaries state what the predictions ask, and you should get to guess first. Links open
            in a new tab. This page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://www.nist.gov/si-redefinition/second-future">NIST: Second, the future</ExternalLink>: what optical lattice clocks are,
              how much more finely they divide time than caesium clocks, and what they could do for measuring the Earth’s shape and gravity, in plain words.
            </li>
            <li>
              <ExternalLink href="https://www.nist.gov/si-redefinition/second">NIST: The second</ExternalLink>: what the second is and how it is measured
              today.
            </li>
            <li>
              <ExternalLink href="https://www.bipm.org/faq-redefinition-second">BIPM: Questions and answers on the redefinition of the second</ExternalLink>:
              why the second may be redefined, which clocks are candidates, and the timeline, from the body that looks after the units.
            </li>
            <li>
              <ExternalLink href="https://www.bipm.org/en/cgpm-2026/resolution-4">BIPM: Resolution 4 of the 28th CGPM (2026)</ExternalLink>: what the general
              conference decided in October 2026 about the future definition of the second.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={done ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          We are about to make two predictions, then watch three pictures build up, one stage at a time: how much faster a higher clock ticks, how big the gap between two clocks gets after a year, and how good a clock must be to notice a small height. Nothing here tells you the answers. When the pictures are drawn, your guesses appear on them in white.
        </PartHeader>

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says
            which answer is right, gives the rate per metre, or gives an answer in another unit. */}
        {(
          [
            {
              title: 'Prediction 1: how far apart after a year?',
              text: (
                <>
                  Two identical clocks, perfect in every way, are set side by side. Then one of them is lifted <strong>1 metre</strong> above the other, so that it
                  is slightly farther from the centre of the Earth. After <strong>one year</strong>, how far apart would their readings be?
                </>
              ),
              choices: GAP_CHOICES,
              value: gapPrediction,
              set: (v: TimeScale) => setGapPrediction(v),
            },
            {
              title: 'Prediction 2: what height is one part in 10¹⁹?',
              text: (
                <>
                  Today’s best clocks can notice a difference in rate of about <strong>one part in 10¹⁹</strong> (a clock that ticks faster than another by that
                  fraction). What height difference between two clocks does that much difference in rate go with?
                </>
              ),
              choices: HEIGHT_CHOICES,
              value: heightPrediction,
              set: (v: LengthScale) => setHeightPrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              {question.text} You are not graded, and a guess is fine.
            </p>
            <div>
              {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => (question.set as (v: never) => void)(choice.value as never)}
                  disabled={hasRun}
                  className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
              {question.value !== null
                ? `Your prediction: ${(question.choices as ReadonlyArray<{ value: string; label: string }>).find((c) => c.value === question.value)?.label.toLowerCase()}.`
                : 'Choose an option to continue'}
            </p>
          </div>
        ))}

        <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || hasRun} style={{ padding: '0.6rem 1.5rem' }}>
          Run
        </button>
        {hasRun && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && !hasRun && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}
        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}`}</strong>
              {status === 'complete' && (
                <span style={{ color: 'var(--text-muted)' }}>
                  {' '}
                  (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.
                </span>
              )}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 &&
              `Picture 1 now shows by what fraction a higher clock ticks faster, for every height from 1 millimetre to 10 kilometres. It is a straight line on this kind of picture. The dot marks a height of 1 metre: ${sciText(oneMetre.rate, 2)}.`}
            {stage === 2 &&
              `Picture 2 appears below Picture 1. It shows how far ahead the higher clock is after one year (${SECONDS_PER_YEAR.toLocaleString('en-US')} seconds). For the clock that is 1 metre higher the gap is ${timeText(oneMetre.gap)}.`}
            {stage === 3 &&
              `Pictures 1 and 2 now also show the heights of 1 millimetre, 1 centimetre and 1 kilometre. From 1 millimetre to 1 kilometre is a factor of a million in height, and the rate difference grows by the same factor.`}
            {stage === 4 &&
              `Picture 3 appears below Picture 2. It turns the question round: for a clock of a given precision, what is the smallest height difference that it can notice? It shows four clocks: one good to ${tenTo(-16)}, one good to ${tenTo(-18)}, and the JILA clock of 2022 (${sciText(JILA_2022.precision, 1)}).`}
            {stage === 5 &&
              `Picture 3 now marks two heights that were measured: the JILA team’s (a cloud of atoms about a millimetre tall) and the Wisconsin team’s (1 centimetre). Look at where each lies compared with the dots.`}
          </p>
        )}

        {/* Picture 1: the axes before the run, the line and the 1 m point from stage 1, the other marked heights from stage 3. */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
          <PictureOne stage={stage} yourHeight={done ? yourHeight : null} />
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>How to read Picture 1.</strong> This picture shows how much faster a higher clock ticks, for different heights. Both axes are marked
            on a <strong>logarithmic</strong> scale: each step to the right, or up, multiplies the number by 10 instead of adding to it, so that a very wide range
            fits in one picture. (Every step is the same distance on the picture, but it stands for ten times more.)
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The horizontal line</strong> is the <strong>height difference</strong> between the two clocks, from 1 millimetre to 10 kilometres. One
              step to the right is ten times the height: from 1 millimetre to 1 centimetre, to 10 centimetres, to 1 metre, and so on. (A millimetre is about the
              width of a pencil tip, and a kilometre is a thousand metres.)
            </li>
            <li>
              <strong>The vertical line</strong> is the <strong>fractional rate difference</strong>: by what fraction the higher clock ticks faster than the
              lower one. Each step up is ten times bigger: {tenTo(-20)}, {tenTo(-18)}, {tenTo(-16)}, {tenTo(-14)} and {tenTo(-12)}, as labelled. A bigger
              number means a bigger difference.
            </li>
            {stage === 0 && (
              <li>
                <strong>Nothing else is drawn yet.</strong> After you press Run, the picture adds the line that shows the rate difference for every height, with a
                few heights marked on it.
              </li>
            )}
            {done && (
              <li>
                <strong>The pink ring</strong> is your own height, from control 1 below the pictures. It starts at 1 metre, on top of the 1 metre dot, and moves along
                the line when you change the height. Its label gives the height and the rate difference.
              </li>
            )}
            {stage >= 1 && (
              <li>
                <strong>The amber line</strong> shows the rate difference at every height from 1 millimetre to 10 kilometres. <strong>The amber dots</strong> mark
                particular heights, each labelled with its height and its rate difference. At first there is one dot, for 1 metre.
              </li>
            )}
          </ul>
          {stage >= 1 && (
            <p style={paragraph}>
              <strong>A worked moment.</strong> The fraction is g × h ÷ c², where g is the pull of gravity ({G_EARTH} m/s²), h the height difference and c the speed of
              light ({SPEED_OF_LIGHT.toLocaleString('en-US')} metres per second). For h = 1 metre: {G_EARTH} × 1 ÷ ({SPEED_OF_LIGHT.toLocaleString('en-US')})² ={' '}
              {sciText(oneMetre.rate, 2)}. That is one part in about {(1 / oneMetre.rate / 1e15).toFixed(1)} thousand trillion.
              {stage >= 3 && (
                <>
                  {' '}
                  For 1 millimetre, a thousand times less: {sciText(rateDifference(0.001), 2)}. For 1 kilometre, a thousand times more:{' '}
                  {sciText(rateDifference(1000), 2)}.
                </>
              )}
            </p>
          )}
          {stage >= 1 && (
            <>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'the amber line, and how it slopes.',
                    means: `it is a straight line: ten times the height gives ten times the fraction. At 1 metre the fraction is ${sciText(oneMetre.rate, 2)}, and at 10 metres it is ${sciText(rateDifference(10), 2)}.`,
                    matters: 'every height follows one simple rule, the fraction = g × h ÷ c². That is why the rate of a clock can stand for its height: if you know the rate, you can work out the height.',
                  },
                  ...(stage >= 3
                    ? [
                        {
                          look: 'the four amber dots, from 1 millimetre to 1 kilometre, and the numbers beside them.',
                          means: `going from 1 millimetre to 1 kilometre is a step of a million in height, and the fraction grows by a million too, from ${sciText(rateDifference(0.001), 2)} to ${sciText(rateDifference(1000), 2)}. Even at 1 kilometre it is only one part in about ${(1 / rateDifference(1000) / 1e12).toFixed(1)} trillion.`,
                          matters: 'every one of these fractions is tiny. To notice the difference for a small height, a clock must be good to a part of that size. That is the question of Picture 3.',
                        },
                      ]
                    : []),
                ]}
              />
              <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
                <strong>Where the real picture comes from.</strong> <em>Measured:</em> nothing in this picture is a measurement; g = {G_EARTH} m/s² and the speed of light are constants. <em>Calculated here:</em> every dot and the amber line, from the rule
                that a higher clock ticks faster by g × h ÷ c² (the rule of Gravity Experiments 2 and 9). <em>Imagined for the question:</em> nothing; after the run, your own height. The pink ring is your own height. This picture carries no
                guess mark: neither prediction is about it.
              </p>
            </>
          )}
        </div>

        {/* Picture 2: the 1 m dot from stage 2, the other heights from stage 3. */}
        {stage >= 2 && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <PictureTwo gapGuess={gapPrediction} stage={stage} yours={done ? { metres: yourHeight, seconds: yourDuration.seconds, durationName } : null} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>How to read Picture 2.</strong> This picture shows how far ahead the higher clock is after one year, for different heights. The two clocks
                start together. Because the higher one ticks a tiny bit faster, it gradually gets ahead, and the gap grows with time. The horizontal line shows the
                gap, on a <strong>logarithmic</strong> scale again: each step to the right is ten times bigger. The units are <strong>picoseconds</strong> (ps, a
                trillionth of a second), <strong>nanoseconds</strong> (ns, a billionth) and <strong>microseconds</strong> (µs, a millionth).
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Each row</strong> is one height difference, named on the left (“1 m higher” means that the upper clock is 1 metre above the lower one).
                </li>
                <li>
                  <strong>Each amber dot</strong> is the gap after one year for that height, and its line runs back to the left edge. The number beside the dot is
                  the gap.
                </li>
                <li>
                  <strong>The dotted vertical lines</strong> are only a ruler: each one is ten times the one before.
                </li>
                {stage >= 2 && (
                  <li>
                    <strong>The thin line under the axis, with the white diamond and the YOUR GUESS box,</strong> is your guess for Prediction 1: the gap after a year for two clocks 1 metre apart, on the same scale as the rows above. It is only
                    where you guessed, not a result, and it does not move when you change anything in Part 2. Compare it with the amber dot in the row “1 m higher”.
                  </li>
                )}
                {done && (
                  <li>
                    <strong>The pink ring on the last row</strong> is your own height and your own time (controls 1 and 2). For the smallest heights over an hour the
                    gap is only a fraction of a picosecond, so the scale also has <strong>femtoseconds</strong> (fs, a thousandth of a picosecond, a
                    quadrillionth of a second).
                  </li>
                )}
              </ul>
              <p style={paragraph}>
                <strong>A worked moment.</strong> The gap is the fraction multiplied by the time. For 1 metre over a year: {sciText(oneMetre.rate, 2)} ×{' '}
                {SECONDS_PER_YEAR.toLocaleString('en-US')} seconds = {timeText(oneMetre.gap)}.
                {stage >= 3 && (
                  <>
                    {' '}
                    For 1 millimetre it is a thousand times less, {timeText(timeGap(0.001, SECONDS_PER_YEAR))}, and for 1 kilometre a thousand times more,{' '}
                    {timeText(timeGap(1000, SECONDS_PER_YEAR))}.
                  </>
                )}
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'the dot in the row “1 m higher”.',
                    means: `after a whole year the higher clock is ahead by only ${timeText(oneMetre.gap)}. That is billionths of a second, far too small to see with any everyday clock.`,
                    matters: 'the effect is real but tiny, and it adds up steadily: the gap after two years would be twice as big. So the longer clocks are compared, the easier the difference is to see.',
                  },
                  {
                    look: 'the white diamond under the axis, beside the amber dot in the row “1 m higher”.',
                    means: `the amber dot is the real gap for 1 metre, ${timeText(caseGap)}; your guess was ${gapPrediction !== null ? GAP_SHORT[gapPrediction] : ''}, at ${gapPrediction !== null ? timeText(gapGuessSeconds(gapPrediction)) : ''}.`,
                    matters: 'the three possible answers are a thousand times apart, so the scale shows at once how far a guess is from the number: a wrong order of magnitude is a long way along the line.',
                  },
                  ...(stage >= 3
                    ? [
                        {
                          look: 'the four dots, from “1 mm higher” to “1 km higher”.',
                          means: `the gaps are ${timeText(timeGap(0.001, SECONDS_PER_YEAR))}, ${timeText(timeGap(0.01, SECONDS_PER_YEAR))}, ${timeText(oneMetre.gap)} and ${timeText(timeGap(1000, SECONDS_PER_YEAR))}. Each is bigger than the one before in the same proportion as the heights.`,
                          matters: 'for the smallest heights the gap after a year is only trillionths of a second. To notice such a difference, a clock has to keep time more steadily than any clock could a few decades ago.',
                        },
                      ]
                    : []),
                ]}
              />
              <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
                <strong>Where the real picture comes from.</strong> <em>Measured:</em> nothing in this picture is a measurement. <em>Calculated here:</em> every gap, from g × h ÷ c² times the time. <em>Imagined for the question:</em> nothing, except the
                pink ring (your own height and time, after the run). The pink ring is your own choice; the white diamond is your guess.
              </p>
            </div>
          </>
        )}

        {/* Picture 3: the three clocks from stage 4, the two measured heights from stage 5. */}
        {stage >= 4 && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <PictureThree stage={stage} yourPrecision={done ? yourPrecision : null} heightGuess={heightPrediction} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>How to read Picture 3.</strong> This picture turns the question round: given how good a clock is, what is the smallest height difference
                that it can notice? A clock’s <strong>precision</strong> is the smallest difference in rate that it can notice. The horizontal line is the height
                difference between two clocks, from 1 micrometre (a thousandth of a millimetre) to 100 metres, on a logarithmic scale. A note on words: this is not the
                same as a clock’s <strong>accuracy</strong> (how close its ticks come to the true second). The first two clocks are examples, chosen by this
                experiment, of the smallest difference that a clock can notice, and the JILA number is a measurement uncertainty from hours of data on one cloud of
                atoms, not the accuracy of the clock.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Each row</strong> is a clock, named on the left by its precision: one good to {tenTo(-16)}, one good to {tenTo(-18)} (these two are
                  example precisions chosen by this experiment), <strong>the violet row</strong> for a clock good to {tenTo(-19)}, the clock of Prediction 2 (imagined), and the JILA clock of 2022, whose published precision is {sciText(JILA_2022.precision, 1)}.
                </li>
                <li>
                  <strong>The dot</strong> in a row is the smallest height difference that the clock can notice. <strong>The line</strong> to the right of the dot
                  shows all the larger heights that the clock can tell apart. A smaller height, to the left of the dot, gives a difference that the clock cannot
                  see.
                </li>
                <li>
                  <strong>The thin line under the axis, with the white diamond and the YOUR GUESS box,</strong> is your guess for Prediction 2: the height that a clock good to {tenTo(-19)} can notice, on the same scale as the rows above. It is only where
                  you guessed, not a result, and it does not move when you change anything in Part 2. Compare it with the dot on the violet row.
                </li>
                {done && (
                  <li>
                    <strong>The pink ring on the last row</strong> is your own clock, from control 3 below the pictures. It starts at {tenTo(-18)}, on top of the second
                    row’s dot, and moves left as you make the clock more precise.
                  </li>
                )}
                {stage >= 5 && (
                  <>
                    <li>
                      <strong>The two dashed vertical lines</strong> mark the heights that two teams measured. The <strong>teal</strong> line is the JILA team’s
                      cloud of atoms, about 1 millimetre tall. The <strong>lime</strong> line is the Wisconsin team’s array of atom clouds, which spanned 1
                      centimetre.
                    </li>
                    <li>
                      <strong>The two lines of text at the foot</strong> give the numbers: how many times JILA’s effect was larger than its precision, and how far
                      the Wisconsin measurement was from the expected value, in <strong>sigma</strong>.
                    </li>
                  </>
                )}
              </ul>
              <p style={paragraph}>
                <strong>A worked moment.</strong> The smallest height is the precision divided by {sciText(rateDifference(1), 2)} (the fraction for each metre). For a
                clock good to {tenTo(-18)}: {tenTo(-18)} ÷ {sciText(rateDifference(1), 2)} = {lengthText(smallestHeight(1e-18))}. A clock 100 times better, good to{' '}
                {tenTo(-20)}, would notice {lengthText(smallestHeight(1e-20))}.
                {stage >= 5 && (
                  <>
                    {' '}
                    For JILA’s {sciText(JILA_2022.precision, 1)}: {sciText(JILA_2022.precision, 1)} ÷ {sciText(rateDifference(1), 2)} ={' '}
                    {lengthText(smallestHeight(JILA_2022.precision))}, which is {(0.001 / smallestHeight(JILA_2022.precision)).toFixed(1)} times smaller than the
                    millimetre that it measured.
                  </>
                )}
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'the dots of the first two clocks and of the JILA clock.',
                    means: `a clock good to ${tenTo(-16)} can notice ${lengthText(smallestHeight(1e-16))}, one good to ${tenTo(-18)} can notice ${lengthText(smallestHeight(1e-18))}, and the JILA clock could notice ${lengthText(smallestHeight(JILA_2022.precision))}.`,
                    matters: 'a hundred times better precision lets a clock notice a height a hundred times smaller. This is how a clock can be used to tell how high it is: the better the clock, the finer the height.',
                  },
                  {
                    look: 'the violet row and the white diamond under the axis.',
                    means: `a clock good to ${tenTo(-19)} can notice ${lengthText(caseHeight)}; your guess was ${heightPrediction !== null ? HEIGHT_SHORT[heightPrediction] : ''}, at ${heightPrediction !== null ? lengthText(heightGuessMetres(heightPrediction)) : ''}.`,
                    matters: 'the violet row sits between the clock good to 10⁻¹⁸ and the JILA clock: a ten times better clock notices a height ten times smaller, so the answer is a tenth of the 10⁻¹⁸ clock’s.',
                  },
                  ...(stage >= 5
                    ? [
                        {
                          look: 'the two dashed lines, compared with the dots.',
                          means: `JILA’s millimetre lies to the right of its dot (${lengthText(smallestHeight(JILA_2022.precision))}), so the effect across it was larger than its precision, ${signalToPrecision(0.001, JILA_2022.precision).toFixed(1)} times larger. The Wisconsin team measured a gradient of ${WISCONSIN_2023.measured} ± ${WISCONSIN_2023.statistical} ± ${WISCONSIN_2023.systematic} (in units of ${tenTo(-19)} per centimetre) against an expected ${WISCONSIN_2023.expected}, which is ${sigmasFromExpected(WISCONSIN_2023.measured, WISCONSIN_2023.statistical, WISCONSIN_2023.systematic, WISCONSIN_2023.expected).toFixed(2)} sigma away (this experiment combines the two give-or-takes in the simplest way, as if independent).`,
                          matters: 'two laboratories, using different clocks, found a rate difference over a very small height that agrees with what g × h ÷ c² says. The tutor explains what that shows.',
                        },
                      ]
                    : []),
                ]}
              />
              <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
                <strong>Where the real picture comes from.</strong> <em>Measured:</em> JILA’s precision of {sciText(JILA_2022.precision, 1)} (Bothwell et al., Nature 602, 2022) and the Wisconsin gradient (Zheng et al., Nature Communications 14, 2023), as their
                abstracts state them. <em>Calculated here:</em> every dot, from the smallest height = precision ÷ (g ÷ c²). <em>Imagined for the question:</em> the clocks good to {tenTo(-16)} and {tenTo(-18)} (examples), the violet clock good to {tenTo(-19)}
                and, after the run, your own clock. The pink ring is your own clock; the white diamond is your guess.
              </p>
            </div>
          </>
        )}

        {/* The three controls (after the run): the specification's "Learner Controls". */}
        {done && (
          <PartHeader color="#be185d" title="Part 2: Now try it yourself">
            We are about to try other numbers of our own: another height difference, another length of time and another clock precision. Your choices add a pink mark to each picture, fill the drawing in this part and Table 4. They never change the real marks, the published results or your guesses.
          </PartHeader>
        )}
        {done && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Try your own numbers</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
              <strong>Your guesses do not change the drawings or tables. These settings do.</strong> The height, the time and the clock precision below are trial values of your own, not measurements. Controls 1 and 2 add a pink ring to Picture 1 and to the last row of Picture 2 and move the first two scales of Drawing A; control 3 adds a pink ring to the last row of Picture 3 and moves the third scale. All three fill in Table 4. None of them changes the amber and teal marks, the violet row, Tables 1 to 3 or your guesses. The “Start over” button puts everything back.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.25rem' }}>1. How high is the upper clock?</p>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Height difference: <strong>{lengthLabel(yourHeight)}</strong> (1 millimetre to 10 kilometres; each step on the slider multiplies by about 1.1)
              <input
                type="range"
                min={-3}
                max={4}
                step={0.05}
                value={heightExp}
                onChange={(e) => setHeightExp(Number(e.target.value))}
                style={{ display: 'block', width: '100%', maxWidth: '420px' }}
              />
            </label>
            <div style={{ marginBottom: '0.5rem' }}>
              {HEIGHT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setHeightExp(preset.exponent)}
                  className={`toggle-button${heightExp === preset.exponent ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.875rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <p style={{ fontWeight: 'bold', marginTop: '0.75rem', marginBottom: '0.25rem' }}>2. For how long?</p>
            <div style={{ marginBottom: '0.5rem' }}>
              {DURATIONS.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setDurationName(d.name)}
                  className={`toggle-button${durationName === d.name ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.875rem' }}
                >
                  {d.name}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1.25rem' }}>
              A clock <strong>{lengthLabel(yourHeight)}</strong> higher ticks faster by <strong>{sciText(mine.rateDifference, 2)}</strong>. After{' '}
              <strong>{durationName}</strong> ({yourDuration.seconds.toLocaleString('en-US')} seconds) it is ahead by <strong>{timeText(mine.timeGap)}</strong>.{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                ({G_EARTH} × {yourHeight} ÷ ({sciText(cSquared, 3)}) = {sciText(mine.rateDifference, 2)}; {sciText(mine.rateDifference, 2)} ×{' '}
                {yourDuration.seconds.toLocaleString('en-US')} s = {timeText(mine.timeGap)}. Picture 1 shows your height as a pink ring on the line, and Picture 2
                shows the gap as a pink ring on its last row. A month here is a twelfth of a year of 365.25 days.)
              </span>
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.25rem' }}>3. How good is the clock?</p>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Clock precision: <strong>{sciText(yourPrecision, 1)}</strong> (from {tenTo(-14)} to {tenTo(-21)}; JILA’s was {sciText(JILA_2022.precision, 1)})
              <input
                type="range"
                min={-21}
                max={-14}
                step={0.1}
                value={precisionExp}
                onChange={(e) => setPrecisionExp(Number(e.target.value))}
                style={{ display: 'block', width: '100%', maxWidth: '420px' }}
              />
            </label>
            <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: 0 }}>
              A clock good to <strong>{sciText(yourPrecision, 1)}</strong> can notice a height difference down to <strong>{lengthText(mine.smallestHeight)}</strong>.{' '}
              {mine.canResolve ? (
                <>It <strong>can</strong> notice your height of {lengthLabel(yourHeight)}: the effect is {mine.signalToPrecision.toFixed(1)} times its precision.</>
              ) : (
                <>It <strong>cannot</strong> notice your height of {lengthLabel(yourHeight)}: the effect is only {mine.signalToPrecision.toFixed(2)} of its precision.</>
              )}{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                ({sciText(yourPrecision, 1)} ÷ {sciText(oneMetre.rate, 2)} = {lengthText(mine.smallestHeight)}. Picture 3 shows it as a pink ring on its last row.)
              </span>
            </p>
          </div>
        )}

        {done && <YourClockDrawing heightM={yourHeight} seconds={yourDuration.seconds} precision={yourPrecision} />}

        {done && (
          <PartHeader color="#0f766e" title="Part 3: The results">
            We are about to read the numbers: first a check-up of three published numbers against what the same rule gives, then four tables. A guess never changes them. The choices you made in Part 2 change Table 4, and the page says which.
          </PartHeader>
        )}

        {/* The results (after the run): the status label, three tables, and the links kept back until now (CLAUDE.md §12). The tables only report
            numbers; the explanation is the tutor's. */}
        {done && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Results</p>
            <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '0.75rem' }}>
              <strong>
                Where this stands (as of October 2026): Settled: a higher clock ticks faster, and laboratories have seen it across about a millimetre, a
                centimetre and, in field tests, hundreds of metres to a kilometre. Demonstrated in principle, not yet routine: measuring heights with clocks.
                Planned: redefining the second (the 28th CGPM of October 2026 asked for a proposal in 2030).
              </strong>
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
              These tables only report numbers, step by step. Table 1 repeats the four heights of Pictures 1 and 2. Table 2 is Picture 3’s clocks. Table 3 lists the
              published results and plans that this experiment uses, as the sources state them. Table 4 follows the three controls above. Your predictions are not marked here.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>The check-up: what we would expect beside what was found</p>
            <ResultsTable
              minWidth={620}
              head={['What was checked', 'What we would expect', 'What was found', 'Reading']}
              rows={[
                [
                  checkUp[0].label,
                  `${checkUp[0].expected} (units of ${tenTo(-19)} per cm), the expected gradient`,
                  `${checkUp[0].found} ± ${WISCONSIN_2023.statistical} ± ${WISCONSIN_2023.systematic}, which is ${(checkUp[0].sigmas as number).toFixed(1)} sigma from the expected`,
                  <strong key="w">{checkUp[0].reading}</strong>,
                ],
                [
                  checkUp[1].label,
                  `at least ${sciText(checkUp[1].expected, 1)}, the clock’s precision`,
                  `${sciText(checkUp[1].found, 2)}, which is ${(checkUp[1].found / checkUp[1].expected).toFixed(1)} times the precision`,
                  <strong key="j">{checkUp[1].reading}</strong>,
                ],
                [
                  checkUp[2].label,
                  `about ${(checkUp[2].expected * 1e9).toFixed(0)} billionths of a second`,
                  `${(checkUp[2].found * 1e9).toFixed(1)} billionths of a second`,
                  <strong key="n">{checkUp[2].reading}</strong>,
                ],
              ]}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 0 0.75rem' }}>
              The check-up does not follow the choices you made in Part 2 or your guesses. “More” and “less” compare the found number with the expected one; no cut-off is invented. The sigma combines the two give-or-takes as if they were independent, which is this experiment’s simplification.
            </p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Wisconsin.</strong> <em>What it is:</em> the measured gradient of the clock rate over 1 centimetre beside the one the rule gives. <em>What it means:</em> {checkUp[0].found} is {(checkUp[0].found - checkUp[0].expected).toFixed(1)} above {checkUp[0].expected}, which is {(checkUp[0].sigmas as number).toFixed(1)} sigma, well inside the give or take of about ±{wisconsinCombined.toFixed(1)}.{' '}
                  <em>Why it matters:</em> a laboratory saw the effect of height on a clock across a single centimetre and it agrees with the rule. The weak link is the systematic give or take (±{WISCONSIN_2023.systematic}), larger than the statistical one (±{WISCONSIN_2023.statistical}).
                </li>
                <li>
                  <strong>JILA.</strong> <em>What it is:</em> the effect across a millimetre beside the smallest rate difference that JILA’s clock could notice. <em>What it means:</em> the effect, {sciText(checkUp[1].found, 2)}, is {(checkUp[1].found / checkUp[1].expected).toFixed(1)} times the {sciText(checkUp[1].expected, 1)} precision.{' '}
                  <em>Why it matters:</em> the clock was good enough to notice the effect across the height of its own cloud of atoms. The precision is an uncertainty from hours of data on one cloud, not the accuracy of the clock.
                </li>
                <li>
                  <strong>NIST 2010.</strong> <em>What it is:</em> this experiment’s arithmetic for two clocks 33 centimetres apart over 79 years, beside NIST’s own figure. <em>What it means:</em> {(checkUp[2].found * 1e9).toFixed(1)} against about {(checkUp[2].expected * 1e9).toFixed(0)} billionths of a second: the small gap is NIST rounding to “about 90”.{' '}
                  <em>Why it matters:</em> the same rule that fits the laboratory results also reproduces an older, plainer test, and the effect is far too small for people to notice in a lifetime.
                </li>
              </ul>
            </div>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Your guesses, beside the results</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 0, marginBottom: '0.5rem' }}>
              Your guesses are shown here as you made them, with the place where each one’s number appears. They are not marked here, and they never change a picture or a table.
            </p>
            <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <li>
                <strong>Prediction 1, the gap after a year:</strong> {gapPrediction !== null ? GAP_CHOICES.find((c) => c.value === gapPrediction)?.label.toLowerCase() : ''}. The question was for two clocks 1 metre apart. Its number is in Picture 2 (the amber dot in the row “1 m higher”) and in Table 1 (the row for 1 metre).
              </li>
              <li>
                <strong>Prediction 2, the height for one part in {tenTo(19)}:</strong> {heightPrediction !== null ? HEIGHT_CHOICES.find((c) => c.value === heightPrediction)?.label.toLowerCase() : ''}. Its number is in Picture 3 (the violet row) and in Table 2 (the row for {tenTo(-19)}).
              </li>
            </ul>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 1: the rate difference and the gap after a year</p>
            <ResultsTable
              minWidth={640}
              head={['Height difference', 'Rate difference', 'Gap after one year', 'How it is worked out']}
              rows={[0.001, 0.01, 1, 1000].map((metres) => {
                const rate = rateDifference(metres)
                const name = MARKED_HEIGHTS.find((h) => h.metres === metres)?.name ?? ''
                return [
                  <>
                    {name}
                    {metres === 1 && <PredictionTag n={1} />}
                  </>,
                  sciText(rate, 2),
                  timeText(timeGap(metres, SECONDS_PER_YEAR)),
                  `${G_EARTH} × ${metres} ÷ (${sciText(cSquared, 3)}) = ${sciText(rate, 2)}; ${sciText(rate, 2)} × ${SECONDS_PER_YEAR.toLocaleString('en-US')} s = ${timeText(timeGap(metres, SECONDS_PER_YEAR))}`,
                ]
              })}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              The rate difference is the fraction by which the higher clock ticks faster. It uses one constant g, which is a good approximation for heights of a few
              kilometres.
            </p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is.</strong> The four heights of Pictures 1 and 2, with the fraction by which the higher clock ticks faster and the gap that builds up in a year, and the working in the last column.
                </li>
                <li>
                  <strong>What it means.</strong> For 1 metre the fraction is {sciText(oneMetre.rate, 2)}, one part in about {(1 / oneMetre.rate / 1e15).toFixed(1)} thousand trillion, and after a year the higher clock is ahead by {timeText(oneMetre.gap)}. Ten times the height gives ten times the gap. A daily-life comparison: a clock that gains a few billionths of a second a year would take about {(1 / oneMetre.gap / 1e6).toFixed(0)} million years to gain a second.
                </li>
                <li>
                  <strong>Why it matters.</strong> The effect is real and exactly proportional to the height, but tiny: only a clock that can notice a difference this small can use it to tell how high it is.
                </li>
              </ul>
            </div>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 2: the smallest height that a clock can notice</p>
            <ResultsTable
              minWidth={560}
              head={['Clock precision', 'Smallest height', 'How it is worked out']}
              rows={[1e-16, 1e-18, 1e-19, JILA_2022.precision].map((precision) => [
                <>
                  {precision === JILA_2022.precision ? `${sciText(precision, 1)} (the JILA clock of 2022)` : tenTo(Math.round(Math.log10(precision)))}
                  {precision === PREDICTION_PRECISION && <PredictionTag n={2} />}
                </>,
                lengthText(smallestHeight(precision)),
                `${precision === JILA_2022.precision ? sciText(precision, 1) : tenTo(Math.round(Math.log10(precision)))} ÷ ${sciText(oneMetre.rate, 2)} = ${lengthText(smallestHeight(precision))}`,
              ])}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              “Precision” is the smallest difference in rate that a clock can notice. The two clocks of {tenTo(-16)} and {tenTo(-18)} are examples chosen by this
              experiment, not real clocks. The row for {tenTo(-19)} is the precision that Prediction 2 asked about.
            </p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is.</strong> For each clock precision, the smallest height difference the clock can notice: the precision divided by {sciText(oneMetre.rate, 2)}.
                </li>
                <li>
                  <strong>What it means.</strong> A clock good to {tenTo(-16)} notices {lengthText(smallestHeight(1e-16))}, one good to {tenTo(-18)} notices {lengthText(smallestHeight(1e-18))}, one good to {tenTo(-19)} notices {lengthText(caseHeight)} and the JILA clock, at {sciText(JILA_2022.precision, 1)}, notices {lengthText(smallestHeight(JILA_2022.precision))}. A daily-life comparison: a ruler marked in millimetres can see a millimetre, and one marked in tenths of a millimetre sees a tenth.
                </li>
                <li>
                  <strong>Why it matters.</strong> A hundred times better precision notices a height a hundred times smaller, which is how a clock becomes a height gauge. The two example clocks are chosen by this experiment; only the JILA row is a published precision.
                </li>
              </ul>
            </div>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 3: the published results and plans</p>
            <ResultsTable
              minWidth={700}
              head={['Item', 'What the source says', 'Source']}
              rows={[
                [
                  'JILA, 2022: a strontium lattice clock',
                  `a linear frequency gradient “consistent with the gravitational redshift within a single millimeter scale sample”, with a fractional frequency measurement uncertainty of ${sciText(JILA_2022.precision, 1)}. About 100,000 ultracold strontium atoms in an optical lattice. 90 hours of data gave a precision “50 times better than in any previous clock comparison”, and the difference was resolved “in about 30 minutes of averaging data”. This page quotes the paper’s abstract and the release, and does not give the gradient that the paper measured.`,
                  'Nature 602, 420-424 (2022); NIST and JILA release, 16 February 2022',
                ],
                [
                  'Wisconsin, 2022 to 2023: five clouds of atoms spanning 1 centimetre',
                  `a measured gradient of (−${WISCONSIN_2023.measured} ± ${WISCONSIN_2023.statistical} (statistical) ± ${WISCONSIN_2023.systematic} (systematic)) × ${tenTo(-19)} per centimetre, against an expected −${WISCONSIN_2023.expected} × ${tenTo(-19)} per centimetre (the minus sign only says which way the height is counted). This experiment’s own arithmetic: the combined give or take is √(${WISCONSIN_2023.statistical}² + ${WISCONSIN_2023.systematic}²) = ${wisconsinCombined.toFixed(2)}, the gap is ${(WISCONSIN_2023.measured - WISCONSIN_2023.expected).toFixed(1)}, so the result is ${wisconsinSigmas.toFixed(2)} sigma from the expected value, which is compatible. The expected value agrees with Table 1: ${sciText(rateDifference(0.01), 2)} per centimetre.`,
                  'Nature Communications 14 (2023)',
                ],
                [
                  'NIST, 2010: two aluminium atomic clocks, one 33 centimetres (about a foot) higher',
                  'the higher clock ticked faster, as the rule says; NIST’s release gives the size of the effect over a lifetime of 79 years as about 90 billionths of a second.',
                  'NIST release, September 2010',
                ],
                [
                  'Field test, 2018: Modane and Turin',
                  'a transportable strontium clock was carried to the Modane laboratory and compared with a clock at INRIM in Turin, about 1,000 metres different in height. The difference in gravity that the clocks gave was consistent with the one found by conventional methods. Euramet calls it a proof-of-principle experiment and says that the technique has the potential to resolve height differences as small as 1 centimetre.',
                  'Nature Physics (2018), through Euramet’s release of 16 October 2018',
                ],
                [
                  'Field test, 2020: Tokyo Skytree',
                  `two transportable optical lattice clocks, one at the base and one on the 450-metre observatory floor of Tokyo Skytree, gave “another validation of Einstein’s theory” (RIKEN). This experiment’s own arithmetic for 450 metres: ${G_EARTH} × 450 ÷ (${sciText(cSquared, 3)}) = ${sciText(rateDifference(450), 2)}, and ${sciText(rateDifference(450), 2)} × 86,400 s = ${timeText(timeGap(450, 86_400))} a day.`,
                  'Nature Photonics (2020), through RIKEN’s release of 9 April 2020',
                ],
                [
                  'The redefinition of the second: the 28th CGPM, 13 to 15 October 2026',
                  'its Resolution 4 does not adopt a new definition. It asks the CIPM to work toward a proposal for a new definition, and the date it would take effect, to be presented to the 29th CGPM in 2030. It says that no consensus has been reached on a single species or an ensemble of species, and that some mandatory criteria are not yet met. It notes that the top optical frequency standards surpass the current realization “by a factor of up to 100”.',
                  'BIPM, Resolution 4 of the 28th CGPM (2026)',
                ],
                [
                  'Optical clocks against caesium clocks',
                  'the BIPM describes optical clocks as “10 to 100 times more accurate” than microwave clocks. NIST says that optical clocks emit light at frequencies “tens of thousands of times higher” than the microwaves of caesium, and that ultraprecise clocks could help “more precisely measure the shape and gravity of the Earth”.',
                  'BIPM, FAQ on the redefinition of the second; NIST, “Second, the future” (updated 25 September 2023)',
                ],
              ]}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              The numbers are quoted as the sources state them. This experiment does not analyse any laboratory’s data and does not claim that the second will be
              redefined.
            </p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is.</strong> What the sources say, as they say it: the JILA and Wisconsin laboratory results, the older NIST test, two field tests with carried clocks and the plan to redefine the second.
                </li>
                <li>
                  <strong>What it means.</strong> The effect has been seen across about a millimetre, a centimetre, hundreds of metres and about a kilometre, each time as the rule says. The second has not been redefined; the 2026 resolution only asks for a proposal in 2030.
                </li>
                <li>
                  <strong>Why it matters.</strong> It shows how far the idea has moved from a laboratory curiosity towards a tool, and where it still is a plan. The numbers are quoted from abstracts and releases, so they are as sure as those sources.
                </li>
              </ul>
            </div>

            <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Table 4: your own numbers</p>
            <ResultsTable
              minWidth={560}
              head={['Quantity', 'Value', 'How it is worked out']}
              rows={[
                ['Height difference', lengthLabel(yourHeight), 'your choice (control 1)'],
                ['Rate difference', sciText(mine.rateDifference, 2), `${G_EARTH} × ${yourHeight} ÷ (${sciText(cSquared, 3)})`],
                ['Time', `${yourDuration.name} (${yourDuration.seconds.toLocaleString('en-US')} s)`, 'your choice (control 2)'],
                ['Gap after that time', timeText(mine.timeGap), `${sciText(mine.rateDifference, 2)} × ${yourDuration.seconds.toLocaleString('en-US')} s`],
                ['Clock precision', sciText(yourPrecision, 1), 'your choice (control 3)'],
                ['Smallest height the clock can notice', lengthText(mine.smallestHeight), `${sciText(yourPrecision, 1)} ÷ ${sciText(oneMetre.rate, 2)}`],
                [
                  'Can it notice your height?',
                  mine.canResolve ? 'yes' : 'no',
                  `${sciText(mine.rateDifference, 2)} ÷ ${sciText(yourPrecision, 1)} = ${mine.signalToPrecision.toFixed(2)} (yes when this is at least 1)`,
                ],
              ]}
            />

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.75rem 0 1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is.</strong> The numbers of your own choice: the rate difference for your height, the gap after your time and the smallest height your clock can notice, with the working.
                </li>
                <li>
                  <strong>What it means.</strong> A clock {lengthLabel(yourHeight)} higher ticks faster by {sciText(mine.rateDifference, 2)} and is ahead by {timeText(mine.timeGap)} after {durationName}. A clock good to {sciText(yourPrecision, 1)} notices {lengthText(mine.smallestHeight)}, so it {mine.canResolve ? 'can' : 'cannot'} notice your height.
                </li>
                <li>
                  <strong>Why it matters.</strong> The last row is the test: the effect must be at least the clock’s precision for the clock to notice it. Change a control in Part 2 to see which side of that line your numbers fall.
                </li>
              </ul>
            </div>

            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Want to know more?</strong> The papers and the release behind these numbers are listed here now, because their summaries state what the
              predictions asked. Links open in a new tab.
            </p>
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
              {PAPER_LINKS.map((paper) => (
                <li key={paper.href}>
                  <ExternalLink href={paper.href}>{paper.label}</ExternalLink>: {paper.what}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The chapter summary below the experiment
            (in App) is shown only once the learner reaches the explanation. */}
        {done && (
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            We are about to talk through your two predictions with the tutor, who will compare them with the results. Three short questions, one at a time. Nothing is graded.
          </PartHeader>
        )}
        {done && gapPrediction !== null && heightPrediction !== null && (
          <ClockHeightTutor gapPrediction={gapPrediction} heightPrediction={heightPrediction} onExplained={() => onTutorComplete?.()} />
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem', marginBottom: 0 }}>
          A year is {SECONDS_PER_YEAR.toLocaleString('en-US')} seconds in this experiment (365.25 days).
        </p>
      </div>
    </div>
  )
}
