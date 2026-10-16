import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { runSky } from '../physics/aberration'
import { DEFAULT_SOURCE_NM, VISIBLE_MAX_NM, VISIBLE_MIN_NM, runDoppler } from '../physics/dopplerShift'
import type { DopplerStar } from '../physics/dopplerShift'
import { DopplerShiftTutor } from './DopplerShiftTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Step 4 of docs/experiments/spacetime-geometry/08-doppler-shift.md (the basic interface): the introduction, the "Words and formulas"
// panel, the speed control, the lab's sky (24 stars, all in the one color the lab measures, with the direction of travel, the labeled
// stars and the wedges), a place held for the traveler's sky, the spectrum bar with the lab's color marked, and the "How to read this
// diagram" caption (CLAUDE.md §14).
// Step 5 and 6 (learner interaction): the two predictions, Run (off until both are made), and the staged run that builds the traveler's
// sky a pair of stars at a time in the colors the traveler measures (UV and IR markers outside the visible range), then adds the
// spectrum bar's marks and the wedge counts.
// The results, the tutor, the crossing line and the formula with its worked example are later steps. They are left out on purpose: the
// formula and any worked example of it show which way the colors shift, which is what the predictions ask (§12). Positions, factors
// and wavelengths come from `runSky` and `runDoppler` (CLAUDE.md §9).
// Wording here is draft for the owner's review (CLAUDE.md §28.1).

// Terms the introduction defines, repeated in the "Words and formulas" panel with no new claims. The formula for the shift factor is
// added to this panel after the run (a later step).
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Lab observer and traveler', meaning: 'the lab observer is at rest relative to the stars. The traveler flies through the middle of the ring of stars at a steady speed.' },
  { term: 'Direction of travel and the angle θ', meaning: 'the direction of travel is the way the traveler is moving, drawn as an arrow. θ (the Greek letter “theta”) is how far a star is from straight ahead, in degrees: 0° is straight ahead, 90° is exactly sideways, 180° is straight behind. (As in Experiment 7.)' },
  { term: 'Speed written as 0.6c', meaning: 'a fraction of the speed of light, c. 0.6c is six tenths of the speed of light.' },
  { term: 'Frequency', meaning: 'how many wave crests pass you each second. A siren of high pitch has a high frequency. For light, a higher frequency is a bluer color and a lower frequency is a redder one.' },
  {
    term: 'Wavelength and nanometres',
    meaning:
      'the distance between two crests of a wave. A higher frequency means a shorter wavelength. Wavelengths of light are written in nanometres (nm), where one nanometre is one billionth of a metre.',
  },
  {
    term: 'Visible, ultraviolet and infrared',
    meaning:
      'the colors the eye can see run from about 400 nm (violet) to about 700 nm (red). Light with a wavelength shorter than that is called ultraviolet, and longer is called infrared. The eye cannot see either, so the pictures mark them with the letters UV and IR instead of a color.',
  },
  {
    term: 'Shifted toward blue, shifted toward red',
    meaning: 'a measured light has a higher frequency than before (shifted toward blue, also called blueshift) or a lower frequency than before (shifted toward red, also called redshift). Redshift is the word used in Experiment 2 of Gravity and Curved Spacetime and in Experiment 5 of Gravitational Waves.',
  },
  { term: 'The shift factor f′ ÷ f', meaning: 'the frequency the traveler measures divided by the frequency the lab measures for the same light. 2.00 means twice the frequency, and 0.50 means half.' },
]

const SPEED_PRESETS = [0.3, 0.6, 0.9, 0.99]

// Added to the panel only after the run: the formula and its worked example show which way a color shifts, which the predictions ask (§12).
const FORMULA_ENTRIES: { term: string; meaning: string }[] = [
  {
    term: 'The shift factor formula',
    meaning:
      'f′ ÷ f = (1 + β cos θ) ÷ D, where θ is the lab’s angle for the star, β is the traveler’s speed as a fraction of c, cos is a number between 1 (straight ahead) and −1 (straight behind), and D = √(1 − β²) is the time dilation factor of Experiment 3. Example: β = 0.6, so D = 0.8. For the star the lab sees sideways, cos 90° = 0, so f′ ÷ f = 1 ÷ 0.8 = 1.25, and its wavelength is 550 ÷ 1.25 = 440 nm. The stars have not changed color; each observer measures the light that reaches them.',
  },
]

const RESULT_LAB_ANGLES = [0, 30, 60, 90, 120, 150, 180]
const RANGE_LABEL = { ultraviolet: 'ultraviolet (UV)', visible: 'visible', infrared: 'infrared (IR)' } as const

function formatNm(nm: number): string {
  return nm >= 100 ? String(Math.round(nm)) : String(Number(nm.toPrecision(2)))
}

type Prediction = 'bluer' | 'same' | 'redder'

// The answers to both questions in the specification's "Prediction Activity" section (draft wording, §28.1). Not scored.
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'bluer', label: 'Bluer' },
  { value: 'same', label: 'The same color' },
  { value: 'redder', label: 'Redder' },
]

const ANIMATION_DURATION_MS = 9000
const STARS_DONE_AT = 0.85
// The traveler's sky is built in 13 steps: the star the lab sees at 15k degrees and its mirror image below the line of travel.
const STEP_COUNT = 13

const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const LAB_COLOR = '#38bdf8'
const TRAVELER_COLOR = '#c4b5fd'
const FOLLOW_COLOR = '#facc15'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

const VIEW_WIDTH = 650
const VIEW_HEIGHT = 480
const CENTER_X = 325
const CENTER_Y = 250
const RADIUS = 150
const STAR_RADIUS = 6
const KEY_STAR_RADIUS = 8
const WEDGE_HALF_ANGLE = 30
const STARS_ON_RING = 24

// A color for a wavelength in the visible range (400 to 700 nm), by the usual piecewise approximation of the spectrum. This is only for
// drawing; the physics gives the wavelength. Outside the visible range it is not used: those stars are drawn as UV or IR markers.
function colorOfWavelength(nm: number): string {
  let r = 0
  let g = 0
  let b = 0
  if (nm < 440) {
    r = -(nm - 440) / 60
    b = 1
  } else if (nm < 490) {
    g = (nm - 440) / 50
    b = 1
  } else if (nm < 510) {
    g = 1
    b = -(nm - 510) / 20
  } else if (nm < 580) {
    r = (nm - 510) / 70
    g = 1
  } else if (nm < 645) {
    r = 1
    g = -(nm - 645) / 65
  } else {
    r = 1
  }
  const edge = nm < 420 ? 0.3 + (0.7 * (nm - 400)) / 20 : nm > 680 ? 0.3 + (0.7 * (700 - nm)) / 20 : 1
  const channel = (value: number) => Math.round(255 * Math.pow(value * edge, 0.8))
  return `rgb(${channel(r)}, ${channel(g)}, ${channel(b)})`
}

// Where a star at `angle` degrees from straight ahead is drawn. Straight ahead is to the right; angles above the line of travel go up.
function pointAt(angle: number, radius: number): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180
  return { x: CENTER_X + radius * Math.cos(radians), y: CENTER_Y - radius * Math.sin(radians) }
}

// A pie-shaped wedge of the ring, within WEDGE_HALF_ANGLE degrees of the line of travel, on the front (right) or back (left) side.
function wedgePath(front: boolean): string {
  const sign = front ? 1 : -1
  const half = (WEDGE_HALF_ANGLE * Math.PI) / 180
  const x = CENTER_X + sign * RADIUS * Math.cos(half)
  const top = CENTER_Y - RADIUS * Math.sin(half)
  const bottom = CENTER_Y + RADIUS * Math.sin(half)
  return front
    ? `M ${CENTER_X} ${CENTER_Y} L ${x} ${top} A ${RADIUS} ${RADIUS} 0 0 1 ${x} ${bottom} Z`
    : `M ${CENTER_X} ${CENTER_Y} L ${x} ${bottom} A ${RADIUS} ${RADIUS} 0 0 1 ${x} ${top} Z`
}

interface SkyPictureProps {
  title: string
  color: string // the outline color of the picture (sky blue for the lab, purple for the traveler)
  // The stars to draw, or null while the picture waits for the run. An entry is null until its star has been built. A star with a fill is
  // drawn in that color; a star with no fill is outside the visible range and is drawn as a hollow marker with its letters.
  stars: ({ angle: number; fill: string | null; range: 'ultraviolet' | 'visible' | 'infrared' } | null)[] | null
  showWedges: boolean
  followAngle: number // where the star we follow is drawn (90 for the lab; the traveler's angle for the traveler)
  crossingAngle?: number | null // the traveler's angle where the shift is 1 (blue turns to red); drawn only when given
  frontCount: number | null
  backCount: number | null
  idSuffix: string
}

// One picture of the sky: the ring, the traveler at the centre with the direction of travel, and (once there are stars to draw) the
// stars in their colors, the labeled ones, the star we follow and the two shaded wedges with their counts.
function SkyPicture({ title, color, stars, showWedges, followAngle, crossingAngle, frontCount, backCount, idSuffix }: SkyPictureProps) {
  const frontPattern = `doppler-front-${idSuffix}`
  const backPattern = `doppler-back-${idSuffix}`
  const arrowHead = `doppler-arrow-${idSuffix}`
  const filled = stars !== null
  const follow = pointAt(followAngle, RADIUS)
  const ahead = pointAt(0, RADIUS)
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      style={SVG_STYLE}
      role="img"
      aria-label={`${title}. A ring of stars around a traveler at the centre, with the direction of travel pointing right. ${
        filled ? `${stars.filter((star) => star !== null).length} stars are drawn${showWedges ? `, ${frontCount} within 30 degrees of straight ahead and ${backCount} within 30 degrees of straight behind` : ''}.` : 'The stars appear here after the run.'
      }`}
    >
      <defs>
        <marker id={arrowHead} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 Z" fill={TEXT_COLOR} />
        </marker>
        {/* Forward wedge: diagonal stripes. Backward wedge: dots. Two different fill patterns, so the wedges do not rely on colour alone. */}
        <pattern id={frontPattern} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill={color} fillOpacity="0.1" />
          <line x1="0" y1="0" x2="0" y2="8" stroke={color} strokeWidth="3" strokeOpacity="0.55" />
        </pattern>
        <pattern id={backPattern} width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill={color} fillOpacity="0.1" />
          <circle cx="4.5" cy="4.5" r="1.8" fill={color} fillOpacity="0.6" />
        </pattern>
      </defs>

      <text x="14" y="30" fill={color} fontSize="24" fontWeight="bold" style={HALO}>
        {title}
      </text>

      {showWedges && <path d={wedgePath(true)} fill={`url(#${frontPattern})`} stroke={color} strokeOpacity="0.5" strokeDasharray="4 3" />}
      {showWedges && <path d={wedgePath(false)} fill={`url(#${backPattern})`} stroke={color} strokeOpacity="0.5" strokeDasharray="4 3" />}
      <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="none" stroke={MUTED_COLOR} strokeWidth="1.5" strokeDasharray={filled ? undefined : '6 5'} />

      {/* The traveler at the centre, drawn as a small spaceship pointing along the direction of travel, and the arrow. */}
      <polygon points={`${CENTER_X + 14},${CENTER_Y} ${CENTER_X - 9},${CENTER_Y - 8} ${CENTER_X - 9},${CENTER_Y + 8}`} fill={TEXT_COLOR} />
      <text x={CENTER_X} y={CENTER_Y + 34} fill={TEXT_COLOR} fontSize="20" textAnchor="middle" style={HALO}>
        traveler
      </text>
      <line x1={CENTER_X + 22} y1={CENTER_Y} x2={CENTER_X + 82} y2={CENTER_Y} stroke={TEXT_COLOR} strokeWidth="2.5" markerEnd={`url(#${arrowHead})`} />
      <text x={CENTER_X + 56} y={CENTER_Y - 12} fill={TEXT_COLOR} fontSize="18" textAnchor="middle" style={HALO}>
        direction of travel
      </text>

      {crossingAngle != null && (
        <>
          {/* After the run: the line where blue turns to red (dashed, drawn above and below the line of travel) and, for comparison, the
              line at exactly 90 degrees (dotted). */}
          <line x1={CENTER_X} y1={CENTER_Y - RADIUS - 4} x2={CENTER_X} y2={CENTER_Y + RADIUS + 4} stroke={MUTED_COLOR} strokeWidth="1.5" strokeDasharray="2 4" />
          {[1, -1].map((side) => {
            const end = pointAt(side * crossingAngle, RADIUS)
            return <line key={side} x1={CENTER_X} y1={CENTER_Y} x2={end.x} y2={end.y} stroke={FOLLOW_COLOR} strokeWidth="2" strokeDasharray="7 4" />
          })}
          <text x={Math.min(Math.max(pointAt(-crossingAngle, RADIUS).x, 150), 500)} y={CENTER_Y + RADIUS + 34} fill={FOLLOW_COLOR} fontSize="18" textAnchor="middle" style={HALO}>
            blue turns to red here ({crossingAngle.toFixed(1)}°)
          </text>
          <text x={CENTER_X} y={CENTER_Y + RADIUS + 60} fill={MUTED_COLOR} fontSize="18" textAnchor="middle" style={HALO}>
            dotted line: 90°
          </text>
        </>
      )}

      {stars &&
        stars.map((star, index) => {
          if (star === null) return null
          const { x, y } = pointAt(star.angle, RADIUS)
          // The four labeled stars are the ones the lab sees at 0, 90, 180 and 270 degrees (every sixth star of the ring).
          const isKey = index % (STARS_ON_RING / 4) === 0
          const r = isKey ? KEY_STAR_RADIUS : STAR_RADIUS
          if (star.fill !== null) return <circle key={index} cx={x} cy={y} r={r} fill={star.fill} stroke="#0b1020" strokeWidth="1.5" />
          // Outside the visible range: a hollow marker (solid outline for ultraviolet, dashed for infrared) with its letters just inside
          // the ring, so the picture never shows a color the eye cannot see and never relies on color alone.
          const letters = pointAt(star.angle, RADIUS - 24)
          return (
            <g key={index}>
              <circle cx={x} cy={y} r={r} fill="none" stroke={TEXT_COLOR} strokeWidth="2" strokeDasharray={star.range === 'infrared' ? '3 2' : undefined} />
              <text x={letters.x} y={letters.y + 5} fill={TEXT_COLOR} fontSize="14" fontWeight="bold" textAnchor="middle" style={HALO}>
                {star.range === 'ultraviolet' ? 'UV' : 'IR'}
              </text>
            </g>
          )
        })}

      {filled && (
        <>
          {/* Two stars the predictions ask about: the one straight ahead and the one the lab sees exactly sideways (the star we follow,
              drawn with a yellow ring). Labels sit in the corners with lines to the stars, so they can be found wherever the stars are. */}
          {stars[0] !== null && <circle cx={ahead.x} cy={ahead.y} r="14" fill="none" stroke={TEXT_COLOR} strokeWidth="2" strokeDasharray="3 3" />}
          {stars[6] !== null && <circle cx={follow.x} cy={follow.y} r="14" fill="none" stroke={FOLLOW_COLOR} strokeWidth="2.5" />}
          {stars[6] !== null && <line x1={follow.x} y1={follow.y - 14} x2="480" y2="72" stroke={FOLLOW_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />}
          {stars[6] !== null && (
            <>
              <text x={VIEW_WIDTH - 12} y="44" fill={FOLLOW_COLOR} fontSize="18" textAnchor="end" style={HALO}>
                the star we follow
              </text>
              <text x={VIEW_WIDTH - 12} y="66" fill={TEXT_COLOR} fontSize="18" textAnchor="end" style={HALO}>
                sideways (90°) in the lab’s sky
              </text>
            </>
          )}

          <text x={CENTER_X + RADIUS + 22} y={CENTER_Y - 8} fill={TEXT_COLOR} fontSize="20" style={HALO}>
            straight ahead
          </text>
          <text x={CENTER_X + RADIUS + 22} y={CENTER_Y + 16} fill={TEXT_COLOR} fontSize="20" style={HALO}>
            (0°)
          </text>
          {showWedges && (
            <>
              <text x={CENTER_X + RADIUS + 22} y={CENTER_Y + 38} fill={color} fontSize="18" style={HALO}>
                {frontCount} in the striped
              </text>
              <text x={CENTER_X + RADIUS + 22} y={CENTER_Y + 56} fill={color} fontSize="18" style={HALO}>
                wedge
              </text>
            </>
          )}

          <text x={CENTER_X - RADIUS - 22} y={CENTER_Y - 8} fill={TEXT_COLOR} fontSize="20" textAnchor="end" style={HALO}>
            straight behind
          </text>
          <text x={CENTER_X - RADIUS - 22} y={CENTER_Y + 16} fill={TEXT_COLOR} fontSize="20" textAnchor="end" style={HALO}>
            (180°)
          </text>
          {showWedges && (
            <>
              <text x={CENTER_X - RADIUS - 22} y={CENTER_Y + 38} fill={color} fontSize="18" textAnchor="end" style={HALO}>
                {backCount} in the dotted
              </text>
              <text x={CENTER_X - RADIUS - 22} y={CENTER_Y + 56} fill={color} fontSize="18" textAnchor="end" style={HALO}>
                wedge
              </text>
            </>
          )}
        </>
      )}

      {!filled && (
        <text x={CENTER_X} y={CENTER_Y - RADIUS - 36} fill={MUTED_COLOR} fontSize="20" textAnchor="middle" style={HALO}>
          The stars appear here after the run.
        </text>
      )}
    </svg>
  )
}

// The spectrum bar: wavelengths from 300 to 800 nm on one scale, with the visible range (400 to 700 nm) in its colors and the
// ultraviolet and infrared regions on its two sides, patterned and not colored. Marks for the lab's color (and, in a later step, the
// traveler's) stand on it.
const BAR_MIN_NM = 300
const BAR_MAX_NM = 800
const BAR_LEFT = 40
const BAR_RIGHT = 610
const BAR_TOP = 60
const BAR_HEIGHT = 40

function barX(nm: number): number {
  return BAR_LEFT + ((nm - BAR_MIN_NM) / (BAR_MAX_NM - BAR_MIN_NM)) * (BAR_RIGHT - BAR_LEFT)
}

interface BarMark {
  label: string
  star: DopplerStar
  color: string
  dash?: string
}

// Marks for the traveler's colors, each on its own row under the bar, so they never cover each other. A wavelength off either end of the
// bar is drawn at that end and says so.
function SpectrumBar({ labNm, marks }: { labNm: number; marks: BarMark[] }) {
  const rowTop = BAR_TOP + BAR_HEIGHT + 86
  const height = marks.length > 0 ? rowTop + marks.length * 26 + 44 : 215
  const slices = []
  for (let nm = VISIBLE_MIN_NM; nm < VISIBLE_MAX_NM; nm += 2) {
    slices.push(<rect key={nm} x={barX(nm)} y={BAR_TOP} width={barX(nm + 2) - barX(nm) + 0.5} height={BAR_HEIGHT} fill={colorOfWavelength(nm + 1)} />)
  }
  return (
    <svg
      viewBox={`0 0 650 ${height}`}
      style={SVG_STYLE}
      role="img"
      aria-label={`A bar of wavelengths from ${BAR_MIN_NM} to ${BAR_MAX_NM} nanometres. The visible colors run from ${VISIBLE_MIN_NM} to ${VISIBLE_MAX_NM} nanometres, with ultraviolet to the left and infrared to the right. The lab sees every star at ${labNm} nanometres.`}
    >
      <defs>
        <pattern id="doppler-uv" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#1e1b4b" />
          <line x1="0" y1="0" x2="0" y2="8" stroke={MUTED_COLOR} strokeWidth="2" strokeOpacity="0.7" />
        </pattern>
        <pattern id="doppler-ir" width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill="#2a1414" />
          <circle cx="4.5" cy="4.5" r="1.8" fill={MUTED_COLOR} fillOpacity="0.8" />
        </pattern>
      </defs>
      <text x="14" y="30" fill={TEXT_COLOR} fontSize="20" fontWeight="bold" style={HALO}>
        The spectrum bar: wavelength of light, in nanometres (nm)
      </text>
      <rect x={BAR_LEFT} y={BAR_TOP} width={barX(VISIBLE_MIN_NM) - BAR_LEFT} height={BAR_HEIGHT} fill="url(#doppler-uv)" />
      {slices}
      <rect x={barX(VISIBLE_MAX_NM)} y={BAR_TOP} width={BAR_RIGHT - barX(VISIBLE_MAX_NM)} height={BAR_HEIGHT} fill="url(#doppler-ir)" />
      <rect x={BAR_LEFT} y={BAR_TOP} width={BAR_RIGHT - BAR_LEFT} height={BAR_HEIGHT} fill="none" stroke={MUTED_COLOR} strokeWidth="1.5" />
      {[VISIBLE_MIN_NM, 500, 600, VISIBLE_MAX_NM].map((nm) => (
        <g key={nm}>
          <line x1={barX(nm)} y1={BAR_TOP + BAR_HEIGHT} x2={barX(nm)} y2={BAR_TOP + BAR_HEIGHT + 8} stroke={MUTED_COLOR} />
          <text x={barX(nm)} y={BAR_TOP + BAR_HEIGHT + 26} fill={MUTED_COLOR} fontSize="16" textAnchor="middle" style={HALO}>
            {nm}
          </text>
        </g>
      ))}
      <text x={(BAR_LEFT + barX(VISIBLE_MIN_NM)) / 2} y={BAR_TOP + BAR_HEIGHT / 2 + 6} fill={TEXT_COLOR} fontSize="18" fontWeight="bold" textAnchor="middle" style={HALO}>
        UV
      </text>
      <text x={(barX(VISIBLE_MAX_NM) + BAR_RIGHT) / 2} y={BAR_TOP + BAR_HEIGHT / 2 + 6} fill={TEXT_COLOR} fontSize="18" fontWeight="bold" textAnchor="middle" style={HALO}>
        IR
      </text>
      <text x={(barX(VISIBLE_MIN_NM) + barX(VISIBLE_MAX_NM)) / 2} y={BAR_TOP - 8} fill={TEXT_COLOR} fontSize="16" textAnchor="middle" style={HALO}>
        visible (400 to 700 nm)
      </text>
      {/* The lab's mark: every star is this one color for the lab. */}
      <line x1={barX(labNm)} y1={BAR_TOP - 4} x2={barX(labNm)} y2={BAR_TOP + BAR_HEIGHT + 40} stroke={LAB_COLOR} strokeWidth="3" />
      <text x={barX(labNm)} y={BAR_TOP + BAR_HEIGHT + 64} fill={LAB_COLOR} fontSize="18" textAnchor="middle" style={HALO}>
        lab: {labNm} nm
      </text>
      {marks.map((mark, index) => {
        const nm = mark.star.wavelengthNm
        const off = nm < BAR_MIN_NM ? 'left' : nm > BAR_MAX_NM ? 'right' : null
        const x = barX(Math.min(Math.max(nm, BAR_MIN_NM), BAR_MAX_NM))
        const y = rowTop + index * 26
        const anchor = x < 220 ? 'start' : x > 430 ? 'end' : 'middle'
        const shown = nm >= 100 ? Math.round(nm) : Number(nm.toPrecision(2))
        return (
          <g key={mark.label}>
            <line x1={x} y1={BAR_TOP + BAR_HEIGHT} x2={x} y2={y - 6} stroke={mark.color} strokeWidth="2.5" strokeDasharray={mark.dash} />
            <circle cx={x} cy={y - 6} r="4" fill={mark.color} />
            <text x={anchor === 'start' ? x + 8 : anchor === 'end' ? x - 8 : x} y={y + 14} fill={mark.color} fontSize="16" textAnchor={anchor} style={HALO}>
              {mark.label}: {shown} nm, factor {mark.star.factor.toFixed(2)}
              {off ? ` (off the ${off} end of the bar)` : ''}
            </text>
          </g>
        )
      })}
      <text x="14" y={height - 15} fill={MUTED_COLOR} fontSize="16" style={HALO}>
        UV: ultraviolet, shorter than 400 nm.  IR: infrared, longer than 700 nm.
      </text>
    </svg>
  )
}

interface DopplerShiftExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// The completion mark is called when the run ends, and the explained mark when the learner reaches the tutor's explanation.
export function DopplerShiftExperiment({ onComplete, onTutorComplete }: DopplerShiftExperimentProps) {
  // Counts the runs so the tutor starts again at its first question after each run.
  const [runCount, setRunCount] = useState(0)
  const [speed, setSpeed] = useState(SPEED_PRESETS[1])
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  // Both questions name the speed, so changing the speed clears both predictions.
  const [predictionAhead, setPredictionAhead] = useState<Prediction | null>(null)
  const [predictionSideways, setPredictionSideways] = useState<Prediction | null>(null)
  const sky = runSky(speed)
  const doppler = runDoppler(speed)
  const labColor = colorOfWavelength(DEFAULT_SOURCE_NM)
  const labStars = sky.stars.map((star) => ({ angle: star.labAngle, fill: labColor, range: 'visible' as const }))
  const returnToIdle = () => {
    setStatus('idle')
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

  // The traveler's sky is built one step at a time (step k is the star the lab sees at 15k degrees and its mirror image below the line
  // of travel), from straight ahead around to straight behind. Then the bar's marks and the wedge counts appear. The physics result does
  // not depend on this pace (CLAUDE.md §11).
  const idle = status === 'idle'
  const stepsShown = idle ? 0 : Math.min(STEP_COUNT, Math.floor((progress / STARS_DONE_AT) * STEP_COUNT) + 1)
  const stepOf = (index: number) => Math.min(index, STARS_ON_RING - index)
  const showMarks = status === 'complete' || progress >= STARS_DONE_AT
  const travelerStars = idle
    ? null
    : doppler.stars.map((star, index) =>
        stepOf(index) < stepsShown
          ? { angle: star.travelerAngle, fill: star.range === 'visible' ? colorOfWavelength(star.wavelengthNm) : null, range: star.range }
          : null,
      )
  const barMarks: BarMark[] = showMarks
    ? [
        { label: 'straight ahead', star: doppler.stars[0], color: TEXT_COLOR, dash: '4 3' },
        { label: 'the star we follow', star: doppler.stars[6], color: FOLLOW_COLOR },
        { label: 'straight behind', star: doppler.stars[12], color: TRAVELER_COLOR },
      ]
    : []
  const bothPredicted = predictionAhead !== null && predictionSideways !== null

  return (
    <div>
      <h2>Experiment 8 — The Doppler Effect: Why a Fast Traveler Sees the Colors of the Sky Shift</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Introduction". It does not say
            whether, or which way, a color shifts (that is what the predictions ask, §12), so the formula and its worked example are left
            for after the run. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 7 we saw that a traveler and the lab see the same stars in different directions.
            Does the <em>color</em> of the light change too? Light is a wave, and the color we see depends on how close together its
            crests are. Does the traveler’s own motion change what color the light has?
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> Here is each one in plain language.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Frequency:</strong> how many wave crests pass you each second. A siren of high pitch has a high frequency. For
                light, a higher frequency is a bluer color, and a lower frequency is a redder one.
              </li>
              <li>
                <strong>Wavelength:</strong> the distance between two crests. A higher frequency means a shorter wavelength. Wavelengths of
                light are written in <strong>nanometres</strong> (nm), and one nanometre is one billionth of a metre. The colors the eye can
                see run from about 400 nm (violet) to about 700 nm (red). Light with a shorter wavelength than that is called{' '}
                <strong>ultraviolet</strong>, and light with a longer wavelength is called <strong>infrared</strong>. The eye cannot see
                either, so the pictures mark them with the letters UV and IR, and do not invent a color for them.
              </li>
              <li>
                <strong>Shifted toward blue, shifted toward red:</strong> a light that is measured at a higher frequency than before is
                shifted toward blue (a <strong>blueshift</strong>), and one measured at a lower frequency is shifted toward red (a{' '}
                <strong>redshift</strong>). Redshift is the word used in Experiment 2 of Gravity and Curved Spacetime and in Experiment 5
                of Gravitational Waves.
              </li>
              <li>
                <strong>The shift factor</strong> (written f′ ÷ f): the frequency the traveler measures divided by the frequency the lab
                measures for the same light. A factor of 2.00 means twice the frequency, and 0.50 means half.
              </li>
              <li>
                <strong>The angle θ and the direction of travel:</strong> as in Experiment 7, θ is how far a star is from straight ahead,
                measured from the direction the traveler is moving. 0 degrees is straight ahead, 90 degrees is exactly sideways, and 180
                degrees is straight behind.
              </li>
              <li>
                <strong>Speed written as 0.6c:</strong> a fraction of the speed of light, <em>c</em>. So 0.6c is six tenths of the speed
                of light, and 0.9c is nine tenths.
              </li>
            </ul>
          </div>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>An everyday example.</strong> The pitch of a siren depends on how the ambulance and the listener are moving. The siren
            has not changed. It is the sound that reaches the listener that is different.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A ring of 24 stars surrounds the lab, as in Experiment 7. They are all very far away and at rest
            relative to the lab, and they are spaced evenly, one every 15 degrees. Every star sends out the same single color of light, a
            yellow-green of {DEFAULT_SOURCE_NM} nm. When you press Run, the picture plays in stages: first the sky as the lab observer sees
            it, then the same stars as the traveler sees them, one at a time, each with the color the traveler measures.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose the traveler’s speed. Then predict the color of two stars as the traveler sees them: the star
            straight ahead, and the star the lab observer sees exactly sideways. Press Run. You are not graded. The Run button stays off
            until you have made both predictions.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What we assume.</strong> Every star sends out one pure color. Real stars send out a mixture of colors, so the real sky
            would change in a more complicated way. The stars are very far away and at rest in the lab. The traveler moves at a steady
            speed, and we look only at the moment the traveler is at the middle of the ring. We show a flat slice of the sky, the ring along
            the line of travel, and we show only the color of each star, not its brightness.
          </p>
        </div>

        <ReferencePanel entries={status === 'complete' ? [...REFERENCE_ENTRIES, ...FORMULA_ENTRIES] : REFERENCE_ENTRIES} />

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The traveler’s speed</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            As a fraction of the speed of light, c. For example, 0.9c is nine tenths of the speed of light.
          </p>
          <div>
            {SPEED_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setSpeed(value)
                  setPredictionAhead(null)
                  setPredictionSideways(null)
                  returnToIdle()
                }}
                className={`toggle-button${speed === value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {value}c
              </button>
            ))}
          </div>
        </div>

        {/* The two predictions (draft wording, §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        {(
          [
            {
              title: 'Prediction 1: the star straight ahead',
              text: (
                <>
                  Every star sends out the same color of light. The traveler flies through the middle of the ring at <strong>{speed}c</strong>.
                  The star straight ahead of the traveler is the one the traveler is flying toward. Compared with the lab’s view of that star,
                  does the traveler see its light bluer, the same color, or redder?
                </>
              ),
              value: predictionAhead,
              set: setPredictionAhead,
            },
            {
              title: 'Prediction 2: the star the lab sees sideways',
              text: (
                <>
                  Now take the star that the lab sees exactly sideways: it is neither ahead of the traveler’s path nor behind it. Does the
                  traveler see its light bluer, the same color, or redder than the lab sees it?
                </>
              ),
              value: predictionSideways,
              set: setPredictionSideways,
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              {question.text} You are not graded, and a guess is fine.
            </p>
            <div>
              {PREDICTION_CHOICES.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => {
                    question.set(choice.value)
                    returnToIdle()
                  }}
                  className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
              {question.value !== null ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === question.value)?.label.toLowerCase()}.` : 'Choose an option to continue'}
            </p>
          </div>
        ))}

        <button
          type="button"
          className="action-button"
          onClick={() => {
            setProgress(0)
            setRunCount((n) => n + 1)
            setStatus('running')
          }}
          disabled={!bothPredicted || status === 'running'}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {!bothPredicted && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '1.5rem 0 0.75rem' }}>
          The traveler’s speed is {speed}c. Both pictures are drawn on the same scale.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <SkyPicture
              title="The lab’s sky"
              color={LAB_COLOR}
              stars={labStars}
              showWedges
              followAngle={90}
              frontCount={sky.countsLab.within30OfAhead}
              backCount={sky.countsLab.within30OfBehind}
              idSuffix="lab"
            />
          </div>
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <SkyPicture
              title="The traveler’s sky"
              color={TRAVELER_COLOR}
              stars={travelerStars}
              showWedges={showMarks}
              followAngle={sky.sidewaysStarTravelerAngle}
              crossingAngle={showMarks ? doppler.travelerCrossingAngle : null}
              frontCount={sky.countsTraveler.within30OfAhead}
              backCount={sky.countsTraveler.within30OfBehind}
              idSuffix="traveler"
            />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <SpectrumBar labNm={DEFAULT_SOURCE_NM} marks={barMarks} />
        </div>

        {/* "How to read this diagram" (CLAUDE.md §14): draft wording for the owner's review (§28.1), written picture by picture. Before the
            run it says only what each thing is, never which way a color shifts (§12). After the run it adds a section that reads the
            learner's own run, which is allowed because the learner has by then predicted and observed. */}
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> There are three pictures: two round pictures of the sky, and a bar of colors under
            them. Read them in this order: the lab’s sky, the traveler’s sky, then the bar.
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>The idea behind them.</strong> Imagine standing at the centre of a huge ring of 24 stars and looking outward at them. The
            round pictures show that ring from above, like a clock face with you in the middle. Every star sends out the same single color of
            light, a yellow-green. The question is whether the traveler, who is flying, measures that same color.
          </p>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Picture 1: The lab’s sky (sky blue title, on the left)</strong>
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            This is what the lab observer measures. Picture the lab observer sitting at the centre of the ring, looking out at the stars. The
            stars are not moving, and neither is this observer: the distance and direction to each star stay the same. “At rest” in this
            experiment just means “not moving relative to the stars.” The traveler is the one who moves, flying through the centre of the
            ring, and the next picture shows what the traveler measures instead.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>The big circle is the ring of stars, and each dot on it is one star. There are 24 stars, one every 15 degrees.</li>
            <li>
              Every dot is the same yellow-green, because this is the one color every star sends out. It is shown from the start and does
              not change during the run.
            </li>
            <li>
              The little spaceship in the middle is the traveler, and the arrow marked “direction of travel” shows which way it is flying:
              to the right.
            </li>
            <li>
              The star on the right edge is labeled “straight ahead (0°)”. The star on the left edge is “straight behind (180°)”. The
              stars at the very top and bottom are exactly sideways (90°) to the line of travel.
            </li>
            <li>The yellow ring on the top star marks “the star we follow”: the star the lab sees exactly sideways. Your second prediction is about it.</li>
            <li>The dashed white ring on the right-hand star marks the star straight ahead. Your first prediction is about it.</li>
            <li>
              The two shaded slices are wedges. The striped one covers every direction within 30 degrees of straight ahead, and the dotted
              one covers every direction within 30 degrees of straight behind. The number beside each says how many stars are inside it.
            </li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Picture 2: The traveler’s sky (purple title, on the right)</strong>
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            This is the same sky, as measured by someone else: the traveler. Here is what that means, step by step.
          </p>
          <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Who the traveler is.</strong> The traveler is in a spaceship, flying in a straight line at a steady speed, the speed
              you chose. The lab observer sits still. The traveler does not.
            </li>
            <li>
              <strong>“At the moment it flies through the centre of the ring.”</strong> The ring of stars stays where it is, and the
              traveler moves through it. We do not follow the whole trip. We freeze one instant: the instant the traveler passes exactly
              through the centre, the same spot where the lab observer is sitting. At that instant the traveler and the lab observer are at the
              same place, so both are receiving the same light from the same stars. The only difference between them is that one is moving.
            </li>
            <li>
              <strong>“Measures.”</strong> The traveler has its own instruments. For each star it measures two things about the light that
              arrives right then: the direction the light comes from (the angle, as in Experiment 7) and its color (the wavelength). The
              traveler’s measurements are just as valid as the lab’s. This picture does not say the lab is wrong.
            </li>
            <li>
              <strong>“The same stars.”</strong> It uses the same 24 stars as Picture 1, so every star here is the partner of one in the
              lab’s picture. If you find a star in one picture, you can look for the same star in the other and compare what each observer
              measures for it. The stars themselves have not changed. What can differ is how each observer measures the light that reaches them.
            </li>
            <li>
              <strong>Why it starts empty.</strong> This picture stays empty until you press Run, so that you make your predictions first.
            </li>
          </ul>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              After you press Run, the stars are drawn a pair at a time (one above the line of travel and its mirror image below), starting
              straight ahead and going around to straight behind.
            </li>
            <li>
              A <strong>colored dot</strong> is a star whose measured color is one the eye can see. The dot is drawn in that color.
            </li>
            <li>
              A <strong>hollow circle with the letters UV</strong> is a star whose light the traveler measures as ultraviolet: a wavelength
              shorter than 400 nm, too short for the eye to see. A <strong>hollow circle with a dashed outline and the letters IR</strong>{' '}
              is infrared: longer than 700 nm, too long for the eye to see. We do not invent a color for these, so they are drawn as
              markers. The letters sit just inside the ring, next to their circle.
            </li>
            <li>
              The stars can be at different places than in the lab’s picture. That is the effect of Experiment 7: the traveler measures a
              different direction for the same star. The yellow ring and the dashed white ring follow the same two stars as before, to wherever
              they now are.
            </li>
            <li>When the last pair is drawn, the two wedges and their star counts appear, as in the lab’s picture.</li>
            <li>
              When the last pair is drawn, two lines also appear in this picture. The <strong>dashed yellow lines</strong> run from the
              centre to the ring, one above and one below the line of travel, and they mark where the traveler’s measured frequency is exactly
              the same as the lab’s ({'“'}blue turns to red here{'”'}, with its angle). The <strong>dotted vertical line</strong> is the exactly sideways
              (90°) line, drawn so you can compare where that line is with where the dashed ones are.
            </li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Picture 3: The spectrum bar</strong>
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            A ruler for light. Each color of light has a wavelength, the distance between two crests of its wave, and the bar puts colors in
            order of wavelength, in nanometres (nm). A nanometre is one billionth of a metre.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>The numbers under the bar (400, 500, 600, 700) are wavelengths in nm. The bar runs from 300 nm on the left to 800 nm on the right.</li>
            <li>The rainbow part in the middle, from 400 nm to 700 nm, is the visible range: the colors the eye can see, from violet to red.</li>
            <li>The patterned part on the left, marked UV, is ultraviolet. The dotted part on the right, marked IR, is infrared. Neither can be seen.</li>
            <li>
              The blue line is the lab’s color for every star, {DEFAULT_SOURCE_NM} nm. It sits exactly in the middle of the visible range:
              150 nm from 400 and 150 nm from 700.
            </li>
            <li>
              After the run, three more marks hang under the bar, each on its own row: the star straight ahead (white, dashed line), the
              star we follow (yellow line) and the star straight behind (purple line). Where a line meets the bar is the wavelength the
              traveler measures for that star, and the text gives the number. The text also gives the <em>shift factor</em>: the
              traveler’s frequency divided by the lab’s frequency for the same light, so 2.00 means twice the frequency and 0.50 means
              half. If a wavelength is off the end of the bar, its line is drawn at that end and the text says so.
            </li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Words used in the drawing</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              A <em>degree</em> measures angle: a full circle is 360 degrees and a quarter circle is 90.
            </li>
            <li>
              <em>Frequency</em> is how many wave crests pass each second. A shorter wavelength means a higher frequency.
            </li>
            <li>
              <em>c</em> is the speed of light, so 0.6c is six tenths of it.
            </li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>A worked moment</strong> (reading the bar, before you run). The lab’s color is {DEFAULT_SOURCE_NM} nm. The visible range
            runs from 400 nm to 700 nm, so {DEFAULT_SOURCE_NM} nm is halfway along it, the yellow-green in the middle. A star drawn as UV would
            have a wavelength below 400 nm, off the left end of the visible part.
          </p>

          {status === 'complete' && (
            <>
              <p style={{ margin: '1rem 0 0.25rem' }}>
                <strong>Reading your run, at {speed}c</strong> (now that you have predicted and watched)
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {[
                  { name: 'The star straight ahead', star: doppler.stars[0] },
                  { name: 'The star we follow (the lab sees it sideways)', star: doppler.stars[6] },
                  { name: 'The star straight behind', star: doppler.stars[12] },
                ].map(({ name, star }) => (
                  <li key={name}>
                    <strong>{name}:</strong> the lab measures {DEFAULT_SOURCE_NM} nm. The traveler measures a frequency {star.factor.toFixed(2)} times
                    the lab’s, which is a wavelength of {DEFAULT_SOURCE_NM} ÷ {star.factor.toFixed(2)} ={' '}
                    {star.wavelengthNm >= 100 ? Math.round(star.wavelengthNm) : Number(star.wavelengthNm.toPrecision(2))} nm (
                    {star.range === 'visible'
                      ? 'visible, so its dot is colored'
                      : star.range === 'ultraviolet'
                        ? 'ultraviolet, so it is a UV marker'
                        : 'infrared, so it is an IR marker'}
                    ).
                  </li>
                ))}
              </ul>
            </>
          )}

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <em>What to look for</em> (once the traveler’s sky is drawn):
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>Are all the stars the same color in the two pictures, or not?</li>
            <li>What color is the star straight ahead, and what color is the star we follow, in each picture?</li>
            <li>Which stars, if any, are drawn as UV or IR markers?</li>
            <li>Where on the spectrum bar do the traveler’s marks fall, compared with the lab’s blue line?</li>
          </ul>
        </div>

        {status === 'complete' && predictionAhead !== null && predictionSideways !== null && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            {/* Neutral (CLAUDE.md §12): numbers only, the predictions recorded and not marked. Draft wording for the owner's review (§28.1). */}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>What you ran.</strong> A traveler flew through the middle of the ring of 24 stars at {speed}c. Every star sends out
              the same {DEFAULT_SOURCE_NM} nm light, and the traveler measured each star’s light. <strong>Your predictions were:</strong> the
              star straight ahead,{' '}
              {PREDICTION_CHOICES.find((c) => c.value === predictionAhead)?.label.toLowerCase()}; the star the lab sees sideways,{' '}
              {PREDICTION_CHOICES.find((c) => c.value === predictionSideways)?.label.toLowerCase()}. They are only recorded here. The tutor’s
              explanation, further down, compares them with the result.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>The seven stars.</strong> Seven stars from the upper half of the ring, by the angle the lab sees them at. “Shift factor”
              is the frequency the traveler measures divided by the frequency the lab measures for the same light. “Wavelength” is what the
              traveler measures, and the lab measures {DEFAULT_SOURCE_NM} nm for every star.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['Lab’s angle θ', 'Traveler’s angle θ′', 'Shift factor f′ ÷ f', 'Wavelength', 'Range'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESULT_LAB_ANGLES.map((labAngle) => {
                    const star = doppler.stars[labAngle / 15]
                    return (
                      <tr key={labAngle}>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{labAngle}°</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{star.travelerAngle.toFixed(1)}°</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{star.factor.toFixed(2)}</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{formatNm(star.wavelengthNm)} nm</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{RANGE_LABEL[star.range]}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <ul style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>The counts.</strong> Of the 24 stars, {doppler.towardBlueCount} have a shift factor above 1 (a higher frequency than the
                lab measures) and {doppler.towardRedCount} have one below 1 (a lower frequency).
              </li>
              <li>
                <strong>Where the factor is exactly 1.</strong> In the traveler’s sky, at {doppler.travelerCrossingAngle?.toFixed(1)}° from
                straight ahead (the dashed yellow line in the picture). In the lab’s sky, the same stars are at {doppler.labCrossingAngle?.toFixed(1)}°.
              </li>
              <li>
                <strong>The number D.</strong> At {speed}c, D = √(1 − {speed}²) = {doppler.timeDilationFactor.toFixed(3)}, the same factor
                that the moving clock of Experiment 3 used.
              </li>
            </ul>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1rem', marginBottom: 0 }}>
              Choose another speed, make both predictions and run it again to see which numbers change.
            </p>
          </div>
        )}
      </div>

      {status === 'complete' && predictionAhead !== null && predictionSideways !== null && (
        <DopplerShiftTutor
          key={runCount}
          speed={speed}
          predictedAhead={predictionAhead}
          predictedSideways={predictionSideways}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
