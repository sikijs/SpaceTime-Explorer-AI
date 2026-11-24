import type { CSSProperties } from 'react'
import { VISIBLE_MAX_NM, VISIBLE_MIN_NM, factorCurve, frequencyFactorOf, guessMarkWavelength, labCrossingAngle } from '../physics/dopplerShift'
import type { ColorSide, DopplerStar } from '../physics/dopplerShift'

// Spacetime Geometry 8, the pictures: the two skies, the spectrum bar and the graph of the factor around the ring. Rebuilt in the audit of 2026-11-23 from
// docs/audit/spacetime-geometry/08-draft-wording.md (approved by the owner on 2026-11-23, §28.1). White means only the learner's guess (CLAUDE.md §14): the star straight
// ahead is ringed in orange, the star we follow in yellow. Every position and number comes from the physics module (`runDoppler`, `guessMarkWavelength`, `factorCurve`, §9).

export const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}
export const TEXT_COLOR = '#e2e8f0'
export const MUTED_COLOR = '#94a3b8'
export const LAB_COLOR = '#38bdf8'
export const TRAVELER_COLOR = '#c4b5fd'
export const FOLLOW_COLOR = '#facc15'
export const AHEAD_COLOR = '#fb923c'
export const GUESS_COLOR = '#ffffff'
export const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

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
export function colorOfWavelength(nm: number): string {
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

export interface SkyPictureProps {
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
export function SkyPicture({ title, color, stars, showWedges, followAngle, crossingAngle, frontCount, backCount, idSuffix }: SkyPictureProps) {
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
          {stars[0] !== null && <circle cx={ahead.x} cy={ahead.y} r="14" fill="none" stroke={AHEAD_COLOR} strokeWidth="2.5" strokeDasharray="3 3" />}
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

export interface BarMark {
  label: string
  star: DopplerStar
  color: string
  dash?: string
}

// Marks for the traveler's colors, each on its own row under the bar, so they never cover each other. A wavelength off either end of the
// bar is drawn at that end and says so.
export interface BarGuess {
  label: string // for example 'YOUR GUESS 1: the star straight ahead'
  side: ColorSide
}
const GUESS_ROW_STEP = 62

export function SpectrumBar({ labNm, marks, guesses = [] }: { labNm: number; marks: BarMark[]; guesses?: BarGuess[] }) {
  const rowTop = BAR_TOP + BAR_HEIGHT + 86
  const guessTop = rowTop + marks.length * 26 + 14
  const height = marks.length > 0 ? guessTop + guesses.length * GUESS_ROW_STEP + 44 : 215
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
        <marker id="doppler-guess-arrow" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" refX="12" refY="8" orient="auto">
          <path d="M 0 0 L 16 8 L 0 16 Z" fill={GUESS_COLOR} />
        </marker>
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
      {guesses.length > 0 && <line x1={barX(labNm)} y1={BAR_TOP + BAR_HEIGHT + 40} x2={barX(labNm)} y2={guessTop + (guesses.length - 1) * GUESS_ROW_STEP} stroke={LAB_COLOR} strokeWidth="1.5" strokeDasharray="3 4" />}
      {guesses.map((guess, index) => {
        // The learner's guess, in white: a box labelled YOUR GUESS joined by a line to a white ring on the lab's line ("the same colour") or a white arrow from the lab's line
        // toward the violet end ("bluer") or the red end ("redder"). The arrow has a fixed length from the physics module: it shows a direction only.
        const y = guessTop + index * GUESS_ROW_STEP
        const x0 = barX(labNm)
        const x1 = barX(guessMarkWavelength(guess.side, labNm))
        return (
          <g key={guess.label}>
            {guess.side === 'same' ? (
              <circle cx={x0} cy={y} r="11" fill="none" stroke={GUESS_COLOR} strokeWidth="3.5" />
            ) : (
              <line x1={x0} y1={y} x2={x1} y2={y} stroke={GUESS_COLOR} strokeWidth="5" markerEnd="url(#doppler-guess-arrow)" />
            )}
            <line x1={(x0 + x1) / 2} y1={y + (guess.side === 'same' ? 11 : 3)} x2={(x0 + x1) / 2} y2={y + 14} stroke={GUESS_COLOR} strokeWidth="1.5" />
            <rect x="30" y={y + 14} width="590" height="28" rx="4" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="2.5" />
            <text x="325" y={y + 33} fill={GUESS_COLOR} fontSize="16" fontWeight="bold" textAnchor="middle">
              {guess.label}: {guess.side === 'same' ? 'the same color' : guess.side}
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

// ---- The graph of the factor around the ring (Part 3). Horizontal: the lab's angle, 0 (straight ahead) to 180 degrees (straight behind). Vertical: f' ÷ f.
const G_LEFT = 64
const G_RIGHT = 620
const G_TOP = 40
const G_BOTTOM = 270
const G_ANGLES = [0, 30, 60, 90, 120, 150, 180]

export interface GraphGuess {
  angle: number // the column the guess is about: 0 or 90
  label: string
  side: ColorSide
}

export function FactorGraph({ speed, guesses = [] }: { speed: number; guesses?: GraphGuess[] }) {
  const curve = factorCurve(speed, 90)
  const top = Math.ceil(Math.max(...curve.map((p) => p.factor)) * 5) / 5 + 0.2
  const gx = (angle: number) => G_LEFT + (angle / 180) * (G_RIGHT - G_LEFT)
  const gy = (factor: number) => G_BOTTOM - (factor / top) * (G_BOTTOM - G_TOP)
  const cross = labCrossingAngle(speed)
  const boxTop = G_BOTTOM + 52
  const height = guesses.length > 0 ? boxTop + guesses.length * 36 + 12 : G_BOTTOM + 52
  const yTicks = Array.from({ length: Math.floor(top / 0.5) + 1 }, (_, i) => i * 0.5)
  return (
    <svg
      viewBox={`0 0 650 ${height}`}
      style={SVG_STYLE}
      role="img"
      aria-label={`The shift factor around the ring at ${speed}c. The factor is ${frequencyFactorOf(0, speed).toFixed(2)} straight ahead, ${frequencyFactorOf(90, speed).toFixed(2)} at 90 degrees and ${frequencyFactorOf(180, speed).toFixed(2)} straight behind.`}
    >
      <defs>
        <marker id="doppler-graph-guess-arrow" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" refX="12" refY="8" orient="auto">
          <path d="M 0 0 L 16 8 L 0 16 Z" fill={GUESS_COLOR} />
        </marker>
      </defs>
      <text x="14" y="24" fill={TEXT_COLOR} fontSize="18" fontWeight="bold" style={HALO}>
        The factor around the ring: f′ ÷ f for the star at each lab angle
      </text>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={G_LEFT - 5} y1={gy(t)} x2={G_LEFT} y2={gy(t)} stroke={MUTED_COLOR} />
          <text x={G_LEFT - 9} y={gy(t) + 5} fill={MUTED_COLOR} fontSize="14" textAnchor="end" style={HALO}>
            {t.toFixed(1)}
          </text>
        </g>
      ))}
      <line x1={G_LEFT} y1={G_TOP} x2={G_LEFT} y2={G_BOTTOM} stroke={MUTED_COLOR} strokeWidth="1.5" />
      <line x1={G_LEFT} y1={G_BOTTOM} x2={G_RIGHT} y2={G_BOTTOM} stroke={MUTED_COLOR} strokeWidth="1.5" />
      {G_ANGLES.map((a) => (
        <g key={a}>
          <line x1={gx(a)} y1={G_BOTTOM} x2={gx(a)} y2={G_BOTTOM + 6} stroke={MUTED_COLOR} />
          <text x={gx(a)} y={G_BOTTOM + 22} fill={MUTED_COLOR} fontSize="14" textAnchor="middle" style={HALO}>
            {a}°
          </text>
        </g>
      ))}
      <text x={(G_LEFT + G_RIGHT) / 2} y={G_BOTTOM + 40} fill={MUTED_COLOR} fontSize="14" textAnchor="middle" style={HALO}>
        the lab’s angle θ (0° straight ahead, 90° sideways, 180° straight behind)
      </text>
      <line x1={G_LEFT} y1={gy(1)} x2={G_RIGHT} y2={gy(1)} stroke={LAB_COLOR} strokeWidth="2" strokeDasharray="6 4" />
      <text x={G_RIGHT - 4} y={gy(1) - 6} fill={LAB_COLOR} fontSize="14" textAnchor="end" style={HALO}>
        the lab’s color (factor 1)
      </text>
      <line x1={gx(90)} y1={G_TOP} x2={gx(90)} y2={G_BOTTOM} stroke={MUTED_COLOR} strokeWidth="1.5" strokeDasharray="2 4" />
      <text x={gx(90) + 5} y={G_TOP + 12} fill={MUTED_COLOR} fontSize="14" style={HALO}>
        sideways (90°)
      </text>
      {cross !== null && (
        <>
          <line x1={gx(cross)} y1={G_TOP} x2={gx(cross)} y2={G_BOTTOM} stroke={FOLLOW_COLOR} strokeWidth="2" strokeDasharray="7 4" />
          <text x={gx(cross) + 5} y={G_BOTTOM - 8} fill={FOLLOW_COLOR} fontSize="14" style={HALO}>
            factor is 1 here ({cross.toFixed(1)}°)
          </text>
        </>
      )}
      <polyline points={curve.map((p) => `${gx(p.labAngle)},${gy(p.factor)}`).join(' ')} fill="none" stroke={TRAVELER_COLOR} strokeWidth="3" />
      {G_ANGLES.map((a) => (
        <circle key={a} cx={gx(a)} cy={gy(frequencyFactorOf(a, speed))} r="5" fill={TRAVELER_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      ))}
      <text x={gx(0) + 8} y={gy(frequencyFactorOf(0, speed)) + 18} fill={TRAVELER_COLOR} fontSize="14" style={HALO}>
        {frequencyFactorOf(0, speed).toFixed(2)}
      </text>
      <text x={gx(180) - 8} y={gy(frequencyFactorOf(180, speed)) - 10} fill={TRAVELER_COLOR} fontSize="14" textAnchor="end" style={HALO}>
        {frequencyFactorOf(180, speed).toFixed(2)}
      </text>
      <text x={gx(90) + 8} y={gy(frequencyFactorOf(90, speed)) - 8} fill={TRAVELER_COLOR} fontSize="14" style={HALO}>
        {frequencyFactorOf(90, speed).toFixed(2)}
      </text>
      {guesses.map((guess, index) => (
        <line
          key={guess.label}
          x1={gx(guess.angle)}
          y1={gy(1) + (guess.side === 'same' ? 10 : guess.side === 'redder' ? 34 : 0)}
          x2={gx(guess.angle)}
          y2={boxTop + index * 36}
          stroke={GUESS_COLOR}
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />
      ))}
      {guesses.map((guess, index) => {
        // The learner's guess in white: a ring on the lab's-color line ("the same color"), an arrow above it pointing up ("bluer", a higher factor) or below it pointing down
        // ("redder", a lower factor). Fixed length: a direction only. The box sits under the graph, joined to the mark by a line.
        const x = gx(guess.angle)
        const y1 = gy(1)
        const y = boxTop + index * 36
        const arrowEnd = guess.side === 'bluer' ? y1 - 34 : y1 + 34
        return (
          <g key={guess.label}>
            {guess.side === 'same' ? (
              <circle cx={x} cy={y1} r="10" fill="none" stroke={GUESS_COLOR} strokeWidth="3.5" />
            ) : (
              <line x1={x} y1={y1} x2={x} y2={arrowEnd} stroke={GUESS_COLOR} strokeWidth="5" markerEnd="url(#doppler-graph-guess-arrow)" />
            )}
            <rect x="30" y={y} width="590" height="28" rx="4" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="2.5" />
            <text x="325" y={y + 19} fill={GUESS_COLOR} fontSize="15" fontWeight="bold" textAnchor="middle">
              {guess.label}: {guess.side === 'same' ? 'the same color' : guess.side}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
