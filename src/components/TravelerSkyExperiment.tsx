import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { runSky } from '../physics/aberration'
import { DEFAULT_SOURCE_NM } from '../physics/dopplerShift'
import { runTravelerSky } from '../physics/travelerSky'
import { TravelerSkyTutor } from './TravelerSkyTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Step 4 of docs/experiments/spacetime-geometry/09-the-travelers-whole-sky.md (the basic interface): the introduction, the "Words and
// formulas" panel, the speed control, the lab's sky (24 stars, each with the lab's one color and one brightness, the direction of
// travel, the labeled stars and the wedges), a place held for the traveler's sky, the brightness bar with the lab's mark, and the "How
// to read this diagram" caption (CLAUDE.md §14).
// Step 5 and 6 (learner interaction): the two predictions, Run (off until both are made), and the staged run that builds the traveler's
// sky in three layers (direction, then color, then brightness), then adds the numbers on the labeled stars, the bar's marks, the wedge
// counts and the crossing lines.
// The results, the tutor, and the formula with its worked example are later steps. They are left out on purpose: the formula and any
// worked example of it show which way the brightness changes, which is what the predictions ask (§12). Positions come from `runSky`,
// and colors and brightness from `runTravelerSky` (CLAUDE.md §9).
// Wording here is draft for the owner's review (CLAUDE.md §28.1).

// Terms the introduction defines, repeated in the "Words and formulas" panel with no new claims. The formula for the brightness factor is
// added to this panel after the run (a later step).
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Lab observer and traveler', meaning: 'the lab observer is at rest relative to the stars, sitting at the centre of the ring. The traveler flies through the middle of the ring at a steady speed.' },
  { term: 'Direction of travel and the angle θ', meaning: 'the direction of travel is the way the traveler is moving, drawn as an arrow. θ (the Greek letter “theta”) is how far a star is from straight ahead, in degrees: 0° is straight ahead, 90° is exactly sideways, 180° is straight behind. (As in Experiment 7.)' },
  { term: 'Speed written as 0.6c', meaning: 'a fraction of the speed of light, c. 0.6c is six tenths of the speed of light.' },
  { term: 'Frequency, wavelength and color', meaning: 'frequency is how many wave crests pass you each second, and wavelength is the distance between two crests, written in nanometres (nm). A higher frequency means a shorter wavelength and a bluer color. The eye sees about 400 nm to 700 nm; shorter is ultraviolet (UV) and longer is infrared (IR). (As in Experiment 8.)' },
  { term: 'The shift factor f′ ÷ f', meaning: 'the frequency the traveler measures divided by the frequency the lab measures for the same light. 2.00 means twice the frequency, and 0.50 means half. (As in Experiment 8.)' },
  { term: 'Photon', meaning: 'a tiny packet of light. Light from a star reaches you as a stream of photons. The photons of a bluer light carry more energy each than the photons of a redder light.' },
  { term: 'Brightness', meaning: 'how much energy the light from a star brings to a surface facing the star each second. A brighter star brings more. It is the number of photons arriving each second multiplied by the energy of each. Here it means what an instrument facing the star measures, not what an eye reports.' },
  { term: 'The brightness factor B′ ÷ B', meaning: 'the brightness the traveler measures divided by the brightness the lab measures for the same star. 2.00 means twice as bright, and 0.50 means half as bright.' },
  { term: 'The three layers', meaning: 'when you run the experiment, the traveler’s sky is built in three layers: first where each star is (the direction), then its color, then its brightness.' },
]

const SPEED_PRESETS = [0.3, 0.6, 0.9, 0.99]

// Added to the panel only after the run: the formula and its worked example show which way a brightness changes, which the predictions
// ask (§12).
const FORMULA_ENTRIES: { term: string; meaning: string }[] = [
  {
    term: 'The brightness factor formula',
    meaning:
      'B′ ÷ B = (f′ ÷ f)² = ((1 + β cos θ) ÷ D)², where θ is the lab’s angle for the star, β is the traveler’s speed as a fraction of c, cos is a number between 1 (straight ahead) and −1 (straight behind), and D = √(1 − β²) is the time dilation factor of Experiment 3. The factor is squared because two things change at once: the photons arrive f′ ÷ f times as often, and each carries f′ ÷ f times the energy. Example: β = 0.6, so D = 0.8. For the star the lab sees sideways, cos 90° = 0, so f′ ÷ f = 1 ÷ 0.8 = 1.25 and B′ ÷ B = 1.25 × 1.25 = 1.56. The stars have not changed; each observer measures the light that reaches them.',
  },
]

const RESULT_LAB_ANGLES = [0, 30, 60, 90, 120, 150, 180]
const RANGE_LABEL = { ultraviolet: 'ultraviolet (UV)', visible: 'visible', infrared: 'infrared (IR)' } as const

function formatNm(nm: number): string {
  return nm >= 100 ? String(Math.round(nm)) : String(Number(nm.toPrecision(2)))
}

// Two decimals, or three for a factor below 0.1 (so that 0.005 does not show as 0.01).
function formatFactor(factor: number): string {
  return factor >= 0.1 ? factor.toFixed(2) : factor.toFixed(3)
}

type Prediction = 'brighter' | 'same' | 'dimmer'

// The answers to both questions in the specification's "Prediction Activity" section (draft wording, §28.1).
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'brighter', label: 'Brighter' },
  { value: 'same', label: 'The same brightness' },
  { value: 'dimmer', label: 'Dimmer' },
]

const ANIMATION_DURATION_MS = 12000
// The run's three layers, as fractions of the animation: direction (stars appear), color, then brightness; the rest shows the end marks.
const DIRECTION_DONE_AT = 0.35
const COLOR_DONE_AT = 0.6
const BRIGHTNESS_DONE_AT = 0.85
// Each layer is built in 13 steps: the star the lab sees at 15k degrees and its mirror image below the line of travel.
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
  // drawn in that color (and each star has a glow scaled by its brightness factor); a star with no fill is outside the visible range and is drawn as a hollow marker with its letters.
  stars: ({ angle: number; fill: string | null; range: 'ultraviolet' | 'visible' | 'infrared'; brightness: number } | null)[] | null
  showWedges: boolean
  followAngle: number // where the star we follow is drawn (90 for the lab; the traveler's angle for the traveler)
  crossingAngle?: number | null // the traveler's angle where the factor is 1 (blue turns to red, brighter turns to dimmer); drawn only when given
  numbers?: { ahead: number; follow: number; behind: number } | null // the brightness factors written on the labeled stars, when given
  layerLabel?: string | null // which layer of the run is being shown
  frontCount: number | null
  backCount: number | null
  idSuffix: string
}

// One picture of the sky: the ring, the traveler at the centre with the direction of travel, and (once there are stars to draw) the
// stars in their colors, the labeled ones, the star we follow and the two shaded wedges with their counts.
function SkyPicture({ title, color, stars, showWedges, followAngle, crossingAngle, numbers, layerLabel, frontCount, backCount, idSuffix }: SkyPictureProps) {
  const frontPattern = `tsky-front-${idSuffix}`
  const backPattern = `tsky-back-${idSuffix}`
  const arrowHead = `tsky-arrow-${idSuffix}`
  const glowFilter = `tsky-glow-${idSuffix}`
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
        <filter id={glowFilter} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
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
          const glow = (
            <circle cx={x} cy={y} r={glowRadius(star.brightness)} fill={star.fill ?? TEXT_COLOR} fillOpacity={glowOpacity(star.brightness)} filter={`url(#${glowFilter})`} />
          )
          if (star.fill !== null)
            return (
              <g key={index}>
                {glow}
                <circle cx={x} cy={y} r={r} fill={star.fill} stroke="#0b1020" strokeWidth="1.5" />
              </g>
            )
          // Outside the visible range: a hollow marker (solid outline for ultraviolet, dashed for infrared) with its letters just inside
          // the ring, so the picture never shows a color the eye cannot see and never relies on color alone.
          const letters = pointAt(star.angle, RADIUS - 24)
          return (
            <g key={index}>
              {glow}
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
              {numbers && (
                <text x={VIEW_WIDTH - 12} y="88" fill={FOLLOW_COLOR} fontSize="20" fontWeight="bold" textAnchor="end" style={HALO}>
                  ×{formatFactor(numbers.follow)}
                </text>
              )}
            </>
          )}

          <text x={CENTER_X + RADIUS + 22} y={CENTER_Y - 8} fill={TEXT_COLOR} fontSize="20" style={HALO}>
            straight ahead
          </text>
          <text x={CENTER_X + RADIUS + 22} y={CENTER_Y + 16} fill={TEXT_COLOR} fontSize="20" style={HALO}>
            (0°)
          </text>
          {numbers && (
            <text x={CENTER_X + RADIUS + 22} y={CENTER_Y - 34} fill={TEXT_COLOR} fontSize="20" fontWeight="bold" style={HALO}>
              ×{formatFactor(numbers.ahead)}
            </text>
          )}
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
          {numbers && (
            <text x={CENTER_X - RADIUS - 22} y={CENTER_Y - 34} fill={TEXT_COLOR} fontSize="20" fontWeight="bold" textAnchor="end" style={HALO}>
              ×{formatFactor(numbers.behind)}
            </text>
          )}
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

      {layerLabel && (
        <text x="14" y="58" fill={color} fontSize="20" fontWeight="bold" style={HALO}>
          {layerLabel}
        </text>
      )}

      {!filled && (
        <text x={CENTER_X} y={CENTER_Y - RADIUS - 36} fill={MUTED_COLOR} fontSize="20" textAnchor="middle" style={HALO}>
          The stars appear here after the run.
        </text>
      )}
    </svg>
  )
}


// Brightness is drawn as a soft glow around each star. The factor runs from about 0.005 to 199 across the speeds, so the glow uses a
// compressed (logarithmic) scale: a factor of 1 gives a middling glow, ten times the factor adds a fixed step, and a tenth takes one
// away. The number is always written on the labeled stars as well, so the picture never has to be read by eye alone (CLAUDE.md §14).
function glowRadius(factor: number): number {
  return Math.min(Math.max(STAR_RADIUS + 7 + 5 * Math.log10(factor), STAR_RADIUS + 1), STAR_RADIUS + 26)
}
function glowOpacity(factor: number): number {
  return Math.min(Math.max(0.3 + 0.2 * Math.log10(factor), 0.1), 0.85)
}

// The brightness bar: the brightness factor B′ ÷ B on a logarithmic scale from 0.1 to 100. Each step of the scale multiplies the number by
// ten, so equal distances along the bar are equal ratios. A mark for the lab (always 1) stands on it, and the traveler's marks are added
// in a later step.
const BAR_MIN = 0.1
const BAR_MAX = 100
const BAR_LEFT = 40
const BAR_RIGHT = 610
const BAR_TOP = 60
const BAR_HEIGHT = 40

function barX(factor: number): number {
  const fraction = (Math.log10(factor) - Math.log10(BAR_MIN)) / (Math.log10(BAR_MAX) - Math.log10(BAR_MIN))
  return BAR_LEFT + fraction * (BAR_RIGHT - BAR_LEFT)
}

interface BarMark {
  label: string
  factor: number
  color: string
  dash?: string
}

// Marks for the traveler's stars, each on its own row under the bar, so they never cover each other. A factor past either end of the bar
// is drawn at that end and says so.
function BrightnessBar({ marks }: { marks: BarMark[] }) {
  const rowTop = BAR_TOP + BAR_HEIGHT + 86
  const height = marks.length > 0 ? rowTop + marks.length * 26 + 44 : 215
  return (
    <svg
      viewBox={`0 0 650 ${height}`}
      style={SVG_STYLE}
      role="img"
      aria-label={`A bar of brightness factors on a scale that multiplies by ten at each step, from ${BAR_MIN} to ${BAR_MAX}. Factors below 1 mean dimmer than the lab sees the star, and factors above 1 mean brighter. The lab sees every star at 1.`}
    >
      <defs>
        <linearGradient id="tsky-bar" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="1" stopColor="#f8fafc" />
        </linearGradient>
      </defs>
      <text x="14" y="30" fill={TEXT_COLOR} fontSize="20" fontWeight="bold" style={HALO}>
        The brightness bar: B′ ÷ B (the lab’s brightness is 1)
      </text>
      <rect x={BAR_LEFT} y={BAR_TOP} width={BAR_RIGHT - BAR_LEFT} height={BAR_HEIGHT} fill="url(#tsky-bar)" stroke={MUTED_COLOR} strokeWidth="1.5" />
      <text x={BAR_LEFT} y={BAR_TOP - 8} fill={TEXT_COLOR} fontSize="16" style={HALO}>
        dimmer than the lab sees it
      </text>
      <text x={BAR_RIGHT} y={BAR_TOP - 8} fill={TEXT_COLOR} fontSize="16" textAnchor="end" style={HALO}>
        brighter than the lab sees it
      </text>
      {/* The lab's mark stops at the bar, and a short line below the tick numbers leads to its label, so it never covers the "1". */}
      <line x1={barX(1)} y1={BAR_TOP - 4} x2={barX(1)} y2={BAR_TOP + BAR_HEIGHT} stroke={LAB_COLOR} strokeWidth="3" />
      <line x1={barX(1)} y1={BAR_TOP + BAR_HEIGHT + 36} x2={barX(1)} y2={BAR_TOP + BAR_HEIGHT + 48} stroke={LAB_COLOR} strokeWidth="3" />
      <text x={barX(1)} y={BAR_TOP + BAR_HEIGHT + 64} fill={LAB_COLOR} fontSize="18" textAnchor="middle" style={HALO}>
        lab: 1 (every star)
      </text>
      {marks.map((mark, index) => {
        const off = mark.factor < BAR_MIN ? 'left' : mark.factor > BAR_MAX ? 'right' : null
        // A mark past either end is drawn a few pixels inside that end, so its line does not run through the end's tick number.
        const x = Math.min(Math.max(barX(mark.factor), BAR_LEFT + 10), BAR_RIGHT - 10)
        const y = rowTop + index * 26
        const anchor = x < 220 ? 'start' : x > 430 ? 'end' : 'middle'
        return (
          <g key={mark.label}>
            <line x1={x} y1={BAR_TOP + BAR_HEIGHT} x2={x} y2={y - 6} stroke={mark.color} strokeWidth="2.5" strokeDasharray={mark.dash} />
            <circle cx={x} cy={y - 6} r="4" fill={mark.color} />
            <text x={anchor === 'start' ? x + 8 : anchor === 'end' ? x - 8 : x} y={y + 14} fill={mark.color} fontSize="16" textAnchor={anchor} style={HALO}>
              {mark.label}: ×{formatFactor(mark.factor)}
              {off ? ` (off the ${off} end of the bar)` : ''}
            </text>
          </g>
        )
      })}
      {/* The tick numbers are drawn after the marks, so their outline keeps a mark's line from running through them. */}
      {[0.1, 1, 10, 100].map((value) => (
        <g key={value}>
          <line x1={barX(value)} y1={BAR_TOP + BAR_HEIGHT} x2={barX(value)} y2={BAR_TOP + BAR_HEIGHT + 8} stroke={MUTED_COLOR} />
          <text x={barX(value)} y={BAR_TOP + BAR_HEIGHT + 26} fill={MUTED_COLOR} fontSize="16" textAnchor="middle" style={HALO}>
            {value}
          </text>
        </g>
      ))}
      <text x="14" y={height - 15} fill={MUTED_COLOR} fontSize="16" style={HALO}>
        Each step along the bar multiplies the number by 10. The bar is cut off at 0.1 and 100.
      </text>
    </svg>
  )
}

interface TravelerSkyExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// The completion mark is called when the run ends, and the explained mark when the learner reaches the tutor's explanation.
export function TravelerSkyExperiment({ onComplete, onTutorComplete }: TravelerSkyExperimentProps) {
  // Counts the runs so the tutor starts again at its first question after each run.
  const [runCount, setRunCount] = useState(0)
  const [speed, setSpeed] = useState(SPEED_PRESETS[1])
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  // Both questions name the speed, so changing the speed clears both predictions.
  const [predictionAhead, setPredictionAhead] = useState<Prediction | null>(null)
  const [predictionSideways, setPredictionSideways] = useState<Prediction | null>(null)
  const sky = runSky(speed)
  const traveler = runTravelerSky(speed)
  const labColor = colorOfWavelength(DEFAULT_SOURCE_NM)
  const labStars = sky.stars.map((star) => ({ angle: star.labAngle, fill: labColor, range: 'visible' as const, brightness: 1 }))
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

  // The traveler's sky is built in three layers, one after another (the physics result does not depend on this pace, CLAUDE.md §11).
  // In each layer a step k covers the star the lab sees at 15k degrees and its mirror image below the line of travel, from straight ahead
  // around to straight behind. Layer 1 puts the stars at the traveler's directions, in the lab's color and glow. Layer 2 gives each its
  // measured color (or UV or IR marker). Layer 3 gives each its measured brightness. Then the end marks appear.
  const idle = status === 'idle'
  const stepsDone = (from: number, to: number) => (idle || progress < from ? 0 : progress >= to ? STEP_COUNT : Math.min(STEP_COUNT, Math.floor(((progress - from) / (to - from)) * STEP_COUNT) + 1))
  const directionSteps = stepsDone(0, DIRECTION_DONE_AT)
  const colorSteps = stepsDone(DIRECTION_DONE_AT, COLOR_DONE_AT)
  const brightnessSteps = stepsDone(COLOR_DONE_AT, BRIGHTNESS_DONE_AT)
  const stepOf = (index: number) => Math.min(index, STARS_ON_RING - index)
  const showMarks = status === 'complete' || progress >= BRIGHTNESS_DONE_AT
  const travelerStars = idle
    ? null
    : traveler.stars.map((star, index) => {
        if (stepOf(index) >= directionSteps) return null
        const colored = stepOf(index) < colorSteps
        const bright = stepOf(index) < brightnessSteps
        return {
          angle: star.travelerAngle,
          fill: !colored ? labColor : star.range === 'visible' ? colorOfWavelength(star.wavelengthNm) : null,
          range: colored ? star.range : ('visible' as const),
          brightness: bright ? star.brightnessFactor : 1,
        }
      })
  const layerLabel = idle
    ? null
    : showMarks
      ? 'All three layers on'
      : brightnessSteps > 0
        ? 'Layer 3: brightness'
        : colorSteps > 0
          ? 'Layer 2: color'
          : 'Layer 1: direction'
  const numbers = showMarks
    ? { ahead: traveler.stars[0].brightnessFactor, follow: traveler.stars[6].brightnessFactor, behind: traveler.stars[12].brightnessFactor }
    : null
  const barMarks: BarMark[] = numbers
    ? [
        { label: 'straight ahead', factor: numbers.ahead, color: TEXT_COLOR, dash: '4 3' },
        { label: 'the star we follow', factor: numbers.follow, color: FOLLOW_COLOR },
        { label: 'straight behind', factor: numbers.behind, color: TRAVELER_COLOR },
      ]
    : []
  const bothPredicted = predictionAhead !== null && predictionSideways !== null

  return (
    <div>
      <h2>Experiment 9 — The Traveler’s Whole Sky: Direction, Color and Brightness Together</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Introduction". It does not say
            whether, or which way, a brightness changes (that is what the predictions ask, §12), so the formula and its worked example
            are left for after the run. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 7 we saw that a traveler and the lab see the same stars in different directions. In
            Experiment 8 we saw that the colors can differ too. Does the <em>brightness</em> of a star differ as well? And what would the
            traveler’s sky look like with all three differences at once?
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some words.</strong> Most of these you have already met. The new ones are brightness, photon and the brightness factor.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Frequency, wavelength and color</strong> (from Experiment 8): frequency is how many wave crests pass you each second,
                and wavelength is the distance between two crests, written in nanometres (nm). A higher frequency is a bluer color. The eye
                sees about 400 nm to 700 nm. Shorter is ultraviolet (UV) and longer is infrared (IR), and the pictures mark those with the
                letters UV and IR.
              </li>
              <li>
                <strong>The shift factor</strong> (written f′ ÷ f, from Experiment 8): the frequency the traveler measures divided by the
                frequency the lab measures for the same light. A factor of 2.00 means twice the frequency, and 0.50 means half.
              </li>
              <li>
                <strong>Photon:</strong> a tiny packet of light. The light from a star reaches you as a stream of photons. The photons of a
                bluer light carry more energy each than the photons of a redder light.
              </li>
              <li>
                <strong>Brightness:</strong> how much energy the light from a star brings to a surface that faces the star, each second. A
                brighter star brings more. It depends on how many photons arrive each second and how much energy each one carries. Here,
                brightness means what an instrument facing the star measures. It is not what an eye would report.
              </li>
              <li>
                <strong>The brightness factor</strong> (written B′ ÷ B): the brightness the traveler measures divided by the brightness the
                lab measures for the same star. A factor of 2.00 means twice as bright, and 0.50 means half as bright.
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
            <strong>An everyday example.</strong> How hard it rains on you can depend on whether you stand still, run into the rain or run
            away from it. The rain has not changed. What reaches you has.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A ring of 24 stars surrounds the lab, as in Experiments 7 and 8. They are all very far away and at
            rest relative to the lab, and they are spaced evenly, one every 15 degrees. Every star sends out the same single color of
            light, a yellow-green of {DEFAULT_SOURCE_NM} nm, and for the lab every star has the same brightness. When you press Run, the
            traveler’s sky is built in three layers. First, where each star is (the direction, as in Experiment 7). Second, the color of
            each star (as in Experiment 8). Third, how bright each star is. When all three layers are on, you are looking at the
            traveler’s whole sky.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose the traveler’s speed. Then predict the brightness of two stars as the traveler sees them: the
            star straight ahead, and the star the lab observer sees exactly sideways. Press Run. You are not graded while you predict. The
            tutor will compare your predictions with the result afterwards. The Run button stays off until you have made both predictions.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What we assume.</strong> Every star is a single point sending out one pure color. Real stars send out a mixture of
            colors, so the real sky would change in a more complicated way. The stars are very far away and at rest in the lab. The
            traveler moves at a steady speed, and we look only at the moment the traveler is at the middle of the ring. We show a flat slice
            of the sky, the ring along the line of travel. Brightness is what an instrument facing the star measures, not what an eye
            reports, and we show each star’s own brightness, not the glow of the whole sky.
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
                  Every star has the same brightness for the lab. The traveler flies through the middle of the ring at <strong>{speed}c</strong>.
                  The star straight ahead of the traveler is the one the traveler is flying toward. Compared with the lab’s view of that star,
                  does the traveler see it brighter, the same brightness, or dimmer?
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
                  traveler see it brighter, the same brightness, or dimmer than the lab sees it?
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
              crossingAngle={showMarks ? traveler.travelerCrossingAngle : null}
              numbers={numbers}
              layerLabel={layerLabel}
              frontCount={sky.countsTraveler.within30OfAhead}
              backCount={sky.countsTraveler.within30OfBehind}
              idSuffix="traveler"
            />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <BrightnessBar marks={barMarks} />
        </div>

        {/* "How to read this diagram" (CLAUDE.md §14): draft wording for the owner's review (§28.1), written picture by picture in simple
            words, in the style the owner asked for on Experiment 8. Before the run it says only what each thing is, never which way a
            brightness changes (§12). */}
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> There are three pictures: two round pictures of the sky, and a bar under them. Read
            them in this order: the lab’s sky, the traveler’s sky, then the bar.
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>The idea behind them.</strong> Imagine standing at the centre of a huge ring of 24 stars and looking outward at them. The
            round pictures show that ring from above, like a clock face with you in the middle. Every star sends out the same single color
            of light, a yellow-green, and for the lab every star has the same brightness. The question is whether the traveler, who is
            flying, measures that same brightness.
          </p>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Picture 1: The lab’s sky (sky blue title, on the left)</strong>
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            This is what the lab observer measures. Picture the lab observer sitting at the centre of the ring, looking out at the stars.
            The stars are not moving, and neither is this observer: the distance and direction to each star stay the same. “At rest” in
            this experiment just means “not moving relative to the stars.” The traveler is the one who moves, flying through the centre of
            the ring.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>The big circle is the ring of stars, and each dot on it is one star. There are 24 stars, one every 15 degrees.</li>
            <li>Every dot is the same yellow-green, because this is the one color every star sends out.</li>
            <li>
              The soft glow around each dot shows its brightness. Every star has the same glow here, because for the lab every star has the
              same brightness. A bigger and stronger glow means a brighter star. The glow is only a picture of brightness, so the numbers
              (written on the labeled stars after the run) are the exact answer.
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
            This is the same sky, as measured by someone else: the traveler. It stays empty until you press Run, so that you make your
            predictions first.
          </p>
          <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Who the traveler is.</strong> The traveler is in a spaceship, flying in a straight line at a steady speed, the speed
              you chose. The lab observer sits still. The traveler does not.
            </li>
            <li>
              <strong>“At the moment it flies through the centre of the ring.”</strong> The ring of stars stays where it is, and the traveler
              moves through it. We do not follow the whole trip. We freeze one instant: the instant the traveler passes exactly through the
              centre, the same spot where the lab observer is sitting. At that instant the two are at the same place, so both are receiving
              the same light from the same stars. The only difference between them is that one is moving.
            </li>
            <li>
              <strong>“Measures.”</strong> The traveler has its own instruments. For each star it measures three things about the light that
              arrives right then: the direction the light comes from (the angle, as in Experiment 7), its color (the wavelength, as in
              Experiment 8), and its brightness. The traveler’s measurements are just as valid as the lab’s. This picture does not say the
              lab is wrong.
            </li>
            <li>
              <strong>“The same stars.”</strong> It uses the same 24 stars as Picture 1, so every star here is the partner of one in the
              lab’s picture. If you find a star in one picture, you can look for the same star in the other and compare what each observer
              measures for it. The stars themselves have not changed.
            </li>
          </ul>
          <p style={{ margin: '0 0 0.25rem' }}>After you press Run, the picture is built in three layers, one after another. A label in the picture tells you which layer is being shown.</p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Layer 1, direction.</strong> The stars are drawn a pair at a time (one above the line of travel and its mirror image
              below), starting straight ahead and going around to straight behind. They are at the places the traveler measures, in the
              lab’s color and with the lab’s glow.
            </li>
            <li>
              <strong>Layer 2, color.</strong> Each star takes the color the traveler measures. A star whose color is outside what the eye
              can see is drawn as a hollow circle with the letters UV (ultraviolet, a wavelength shorter than 400 nm) or a dashed hollow
              circle with the letters IR (infrared, longer than 700 nm). We do not invent a color for these.
            </li>
            <li>
              <strong>Layer 3, brightness.</strong> Each star’s glow changes to the brightness the traveler measures. The same glow scale
              is used in both pictures, so you can compare any two stars. The labeled stars also get a number, such as “×4.00”, which means
              the traveler measures four times the lab’s brightness for that star.
            </li>
            <li>
              When the last layer is drawn, the two wedges and their star counts appear, and so do two lines: the dashed yellow lines mark
              where the traveler’s measured frequency is exactly the same as the lab’s (“blue turns to red here”), and the dotted vertical
              line is the exactly sideways (90°) line, drawn so you can compare them.
            </li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Picture 3: The brightness bar</strong>
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            A ruler for brightness. It shows the brightness factor B′ ÷ B: the brightness the traveler measures divided by the brightness the
            lab measures for the same star.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>The blue line at 1 is the lab. The lab’s brightness is the starting point, so it is 1 for every star.</li>
            <li>
              A star the traveler measures as brighter than the lab does would be to the right of the blue line. A star the traveler
              measures as dimmer would be to the left. How far it is from the line tells you how much.
            </li>
            <li>
              The numbers under the bar (0.1, 1, 10, 100) are not evenly spaced values. Each step to the right multiplies the number by 10.
              That is called a logarithmic scale, and it lets one bar hold very small and very large numbers. For example, 0.5 is between
              0.1 and 1, and 5 is between 1 and 10. If a number is past either end, its mark is drawn at that end and the text says so.
            </li>
            <li>After the run, three more marks hang under the bar, one for each labeled star, each with its number.</li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Words used in the drawing</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              A <em>degree</em> measures angle: a full circle is 360 degrees and a quarter circle is 90.
            </li>
            <li>
              <em>c</em> is the speed of light, so 0.6c is six tenths of it.
            </li>
            <li>
              A <em>nanometre</em> (nm) is one billionth of a metre. <em>UV</em> means ultraviolet and <em>IR</em> means infrared.
            </li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>A worked moment</strong> (reading the bar, before you run). The lab’s brightness is 1 on the bar. Ten times as bright
            would be at 10, which is one step to the right of the blue line, and a tenth as bright would be at 0.1, one step to the left. A
            star at 100 would be one hundred times as bright as the lab sees it.
          </p>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <em>What to look for</em> (once the traveler’s sky is drawn):
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>Which stars have a bigger glow than in the lab’s picture, and which have a smaller one?</li>
            <li>What is the number on the star straight ahead, and on the star we follow?</li>
            <li>Where on the brightness bar do the traveler’s marks fall, compared with the lab’s blue line?</li>
            <li>Do the stars with a bigger glow have anything in common with their colors?</li>
          </ul>
        </div>

        {status === 'complete' && predictionAhead !== null && predictionSideways !== null && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            {/* Neutral (CLAUDE.md §12): numbers only, the predictions recorded and not marked here (the tutor's explanation compares them with
                the result). Draft wording for the owner's review (§28.1). */}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>What you ran.</strong> A traveler flew through the middle of the ring of 24 stars at {speed}c. Every star sends out
              the same {DEFAULT_SOURCE_NM} nm light with the same brightness for the lab, and the traveler measured each star’s direction,
              color and brightness. <strong>Your predictions were:</strong> the star straight ahead,{' '}
              {PREDICTION_CHOICES.find((c) => c.value === predictionAhead)?.label.toLowerCase()}; the star the lab sees sideways,{' '}
              {PREDICTION_CHOICES.find((c) => c.value === predictionSideways)?.label.toLowerCase()}. They are only recorded here. The tutor’s
              explanation, further down, compares them with the result.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>The seven stars.</strong> Seven stars from the upper half of the ring, by the angle the lab sees them at. “Color shift
              factor” is the frequency the traveler measures divided by the frequency the lab measures for the same light, and the wavelength
              and range follow from it (the lab measures {DEFAULT_SOURCE_NM} nm for every star). “Brightness factor” is the brightness the
              traveler measures divided by the brightness the lab measures for the same star.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['Lab’s angle θ', 'Traveler’s angle θ′', 'Color shift factor f′ ÷ f', 'Wavelength', 'Range', 'Brightness factor B′ ÷ B'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESULT_LAB_ANGLES.map((labAngle) => {
                    const star = traveler.stars[labAngle / 15]
                    return (
                      <tr key={labAngle}>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{labAngle}°</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{star.travelerAngle.toFixed(1)}°</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{star.factor.toFixed(2)}</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{formatNm(star.wavelengthNm)} nm</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{RANGE_LABEL[star.range]}</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{formatFactor(star.brightnessFactor)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <ul style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>The counts.</strong> Of the 24 stars, {traveler.brighterCount} have a brightness factor above 1 (brighter than the lab
                measures) and {traveler.dimmerCount} have one below 1 (dimmer). Of the same 24 stars, {traveler.towardBlueCount} have a color
                shift factor above 1 and {traveler.towardRedCount} have one below 1.
              </li>
              <li>
                <strong>Where both factors are exactly 1.</strong> In the traveler’s sky, at {traveler.travelerCrossingAngle?.toFixed(1)}° from
                straight ahead (the dashed yellow line in the picture). In the lab’s sky, the same stars are at{' '}
                {traveler.labCrossingAngle?.toFixed(1)}°.
              </li>
              <li>
                <strong>The number D.</strong> At {speed}c, D = √(1 − {speed}²) = {traveler.timeDilationFactor.toFixed(3)}, the same factor
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
        <TravelerSkyTutor
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
