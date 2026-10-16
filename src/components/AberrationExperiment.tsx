import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { runSky, travelerAngleOf } from '../physics/aberration'
import { AberrationTutor } from './AberrationTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Steps 4 to 6 of docs/experiments/spacetime-geometry/07-aberration.md: the introduction, the "Words and formulas" panel, the speed
// control, the lab's sky and the traveler's sky as labeled pictures (24 stars, the direction of travel, the wedges and their counts),
// the "How to read this diagram" caption (CLAUDE.md §14), the prediction that gates Run, and the staged run that builds the
// traveler's sky star by star, drawing the same ray at its two angles.
// The results, the tutor and the formula with its worked example are later steps. They are left out here on purpose: the formula and any worked example of it show which way a star's direction changes, which is what the
// prediction asks (§12), so they appear only after the learner has predicted and run. Every number shown comes from `runSky`
// (CLAUDE.md §9). Wording here is draft for the owner's review (CLAUDE.md §28.1).

// Terms the introduction defines, repeated in the "Words and formulas" panel with no new claims. The formula for the traveler's angle
// is added to this panel after the run (a later step).
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Lab observer and traveler', meaning: 'the lab observer is at rest relative to the stars. The traveler flies through the middle of the ring of stars at a steady speed.' },
  { term: 'Direction of travel', meaning: 'the way the traveler is moving, drawn as an arrow. Angles are measured from it.' },
  {
    term: 'The angle θ (the Greek letter "theta")',
    meaning:
      'how far a star is from straight ahead, measured around from the direction of travel, in degrees. 0° is straight ahead, 90° is exactly sideways (like 3 o’clock on a clock when you face 12), and 180° is straight behind. A full turn is 360°.',
  },
  { term: 'Speed written as 0.6c', meaning: 'a fraction of the speed of light, c. 0.6c is six tenths of the speed of light.' },
  {
    term: 'Aberration',
    meaning: 'the change, if there is one, in the direction in which a star is seen when the observer moves. This experiment shows how big it is and which way it goes.',
  },
]

// Added to the panel only once a run has ended, because the formula shows which way a star's direction changes (§12).
const FORMULA_ENTRIES: { term: string; meaning: string }[] = [
  {
    term: 'The traveler’s angle θ′ (“theta prime”)',
    meaning:
      'cos θ′ = (cos θ + β) ÷ (1 + β cos θ), where θ is the lab’s angle, β is the traveler’s speed as a fraction of c, and cos is a number between −1 and 1 that tells you how far ahead (1) or behind (−1) a direction is. Example: β = 0.6 and θ = 90° give cos θ′ = 0.6, so θ′ = 53.1°. The star has not moved; only the traveler’s measurement of its direction is different.',
  },
]

const SPEED_PRESETS = [0.3, 0.6, 0.9, 0.99]

type Prediction = 'same' | 'ahead' | 'behind'

// The three answers of the prediction in the specification's "Prediction Activity" section (draft wording, §28.1). Only the
// direction is asked, not an angle.
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'same', label: 'Exactly sideways, the same as the lab' },
  { value: 'ahead', label: 'Ahead of sideways, nearer the direction of travel' },
  { value: 'behind', label: 'Behind sideways, further from the direction of travel' },
]

// The run's stages as fractions of its length (the physics result does not depend on them, CLAUDE.md §11): the traveler flies in to
// the centre, then the traveler's sky is built from straight ahead around to straight behind, then the wedge counts appear.
const ANIMATION_DURATION_MS = 9000
const SHIP_ARRIVES_AT = 0.15
const STARS_DONE_AT = 0.85
// The ring has 24 stars: straight ahead, straight behind, and eleven pairs (one above the line of travel, one below), so 13 steps.
const STEP_COUNT = 13
const STARS_ON_RING = 24
const SHIP_START_OFFSET = -110

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
  color: string
  stars: (number | null)[] | null // each star's angle to draw (null: not drawn yet), or null while the picture waits for the run
  showWedges: boolean
  frontCount: number | null
  backCount: number | null
  followAngle: number // where the star we follow is in this picture
  rays: { angle: number; follow: boolean }[] // short rays from stars to the centre, drawn during the run
  shipOffset: number // how far left of the centre the traveler's icon is (0 once it is at the centre)
  idSuffix: string
}

// A short ray from a star in towards the observer at the centre, with an arrowhead at the centre end: the starlight, travelling
// from the star to the observer.
function Ray({ angle, color, markerId }: { angle: number; color: string; markerId: string }) {
  const from = pointAt(angle, RADIUS - STAR_RADIUS - 3)
  const to = pointAt(angle, RADIUS - 62)
  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth="2.5" markerEnd={`url(#${markerId})`} />
}

// One picture of the sky: the ring, the traveler at the centre with the direction of travel, and (once there are stars to draw) the
// stars, the labeled ones, the star we follow, any rays, and the two shaded wedges with their counts.
function SkyPicture({ title, color, stars, showWedges, frontCount, backCount, followAngle, rays, shipOffset, idSuffix }: SkyPictureProps) {
  const frontPattern = `aberration-front-${idSuffix}`
  const backPattern = `aberration-back-${idSuffix}`
  const arrowHead = `aberration-arrow-${idSuffix}`
  const rayHead = `aberration-ray-${idSuffix}`
  const followHead = `aberration-follow-${idSuffix}`
  const filled = stars !== null
  const follow = pointAt(followAngle, RADIUS)
  const other = pointAt(360 - followAngle, RADIUS)
  const shipX = CENTER_X + shipOffset
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      style={SVG_STYLE}
      role="img"
      aria-label={`${title}. A ring of stars around a traveler at the centre, with the direction of travel pointing right. ${
        filled
          ? `${stars.filter((angle) => angle !== null).length} of ${STARS_ON_RING} stars are drawn.${showWedges ? ` ${frontCount} are within 30 degrees of straight ahead and ${backCount} within 30 degrees of straight behind.` : ''}`
          : 'The stars appear here after the run.'
      }`}
    >
      <defs>
        <marker id={arrowHead} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 Z" fill={TEXT_COLOR} />
        </marker>
        <marker id={rayHead} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 Z" fill={color} />
        </marker>
        <marker id={followHead} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 Z" fill={FOLLOW_COLOR} />
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
      <polygon points={`${shipX + 14},${CENTER_Y} ${shipX - 9},${CENTER_Y - 8} ${shipX - 9},${CENTER_Y + 8}`} fill={TEXT_COLOR} />
      <text x={shipX} y={CENTER_Y + 34} fill={TEXT_COLOR} fontSize="20" textAnchor="middle" style={HALO}>
        traveler
      </text>
      <line x1={shipX + 22} y1={CENTER_Y} x2={shipX + 82} y2={CENTER_Y} stroke={TEXT_COLOR} strokeWidth="2.5" markerEnd={`url(#${arrowHead})`} />
      <text x={shipX + 56} y={CENTER_Y - 12} fill={TEXT_COLOR} fontSize="18" textAnchor="middle" style={HALO}>
        direction of travel
      </text>

      {rays.map((ray, index) => (
        <Ray key={index} angle={ray.angle} color={ray.follow ? FOLLOW_COLOR : color} markerId={ray.follow ? followHead : rayHead} />
      ))}

      {stars &&
        stars.map((angle, index) => {
          if (angle === null) return null
          const { x, y } = pointAt(angle, RADIUS)
          // The four labeled stars are the ones the lab sees at 0, 90, 180 and 270 degrees (every sixth star of the ring).
          const isKey = index % (STARS_ON_RING / 4) === 0
          return <circle key={index} cx={x} cy={y} r={isKey ? KEY_STAR_RADIUS : STAR_RADIUS} fill={color} stroke="#0b1020" strokeWidth="1.5" />
        })}

      {filled && (
        <>
          {/* The star we follow in both pictures: the one the lab sees exactly sideways, drawn with a yellow ring. Its label sits in the
              top right corner with a line to the star, so it can be found wherever the star is. */}
          <circle cx={follow.x} cy={follow.y} r="14" fill="none" stroke={FOLLOW_COLOR} strokeWidth="2.5" />
          <line x1={follow.x} y1={follow.y - 14} x2="480" y2="72" stroke={FOLLOW_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />
          <text x={VIEW_WIDTH - 12} y="44" fill={FOLLOW_COLOR} fontSize="18" textAnchor="end" style={HALO}>
            the star we follow
          </text>
          <text x={VIEW_WIDTH - 12} y="66" fill={TEXT_COLOR} fontSize="18" textAnchor="end" style={HALO}>
            sideways (90°) in the lab’s sky
          </text>

          <line x1={other.x} y1={other.y + 10} x2="500" y2={VIEW_HEIGHT - 34} stroke={MUTED_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />
          <text x={VIEW_WIDTH - 12} y={VIEW_HEIGHT - 14} fill={TEXT_COLOR} fontSize="18" textAnchor="end" style={HALO}>
            sideways, other side (270° in the lab’s sky)
          </text>

          <text x={CENTER_X + RADIUS + 22} y={CENTER_Y - 8} fill={TEXT_COLOR} fontSize="20" style={HALO}>
            straight ahead
          </text>
          <text x={CENTER_X + RADIUS + 22} y={CENTER_Y + 16} fill={TEXT_COLOR} fontSize="20" style={HALO}>
            (0°)
          </text>
          <text x={CENTER_X - RADIUS - 22} y={CENTER_Y - 8} fill={TEXT_COLOR} fontSize="20" textAnchor="end" style={HALO}>
            straight behind
          </text>
          <text x={CENTER_X - RADIUS - 22} y={CENTER_Y + 16} fill={TEXT_COLOR} fontSize="20" textAnchor="end" style={HALO}>
            (180°)
          </text>
        </>
      )}

      {rays.length > 0 && (
        <text x="14" y={VIEW_HEIGHT - 40} fill={MUTED_COLOR} fontSize="16" style={HALO}>
          arrows in: rays of starlight
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
          <text x={CENTER_X - RADIUS - 22} y={CENTER_Y + 38} fill={color} fontSize="18" textAnchor="end" style={HALO}>
            {backCount} in the dotted
          </text>
          <text x={CENTER_X - RADIUS - 22} y={CENTER_Y + 56} fill={color} fontSize="18" textAnchor="end" style={HALO}>
            wedge
          </text>
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

interface AberrationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const RESULT_LAB_ANGLES = [0, 30, 60, 90, 120, 150, 180]

const COUNT_ROWS: { key: 'aheadOfSideways' | 'within30OfAhead' | 'within30OfBehind'; label: string; short: string; detail: string }[] = [
  { key: 'aheadOfSideways', label: 'Stars seen less than 90° from straight ahead', short: 'Stars less than 90°', detail: 'from straight ahead' },
  { key: 'within30OfAhead', label: 'Stars in the striped wedge (within 30° of straight ahead)', short: 'Stars in the striped wedge', detail: '(within 30° of straight ahead)' },
  { key: 'within30OfBehind', label: 'Stars in the dotted wedge (within 30° of straight behind)', short: 'Stars in the dotted wedge', detail: '(within 30° of straight behind)' },
]

// A pair of bars for each count, lab against traveler, on one scale from 0 to 24 stars. The lab's bars are solid and the traveler's are
// outlined with a diagonal fill, so they differ by more than colour. Every number comes from `runSky` (CLAUDE.md §9).
function CountBars({ lab, traveler }: { lab: Record<string, number>; traveler: Record<string, number> }) {
  const left = 330
  const scale = 210 / STARS_ON_RING
  const rowHeight = 92
  const height = 20 + COUNT_ROWS.length * rowHeight
  return (
    <svg
      viewBox={`0 0 650 ${height}`}
      style={SVG_STYLE}
      role="img"
      aria-label={`Bars comparing star counts, lab against traveler. ${COUNT_ROWS.map((r) => `${r.label}: lab ${lab[r.key]}, traveler ${traveler[r.key]}.`).join(' ')}`}
    >
      <defs>
        <pattern id="aberration-bar-traveler" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill={TRAVELER_COLOR} fillOpacity="0.15" />
          <line x1="0" y1="0" x2="0" y2="8" stroke={TRAVELER_COLOR} strokeWidth="3" strokeOpacity="0.7" />
        </pattern>
      </defs>
      {COUNT_ROWS.map((row, index) => {
        const top = 14 + index * rowHeight
        return (
          <g key={row.key}>
            <text x="12" y={top + 30} fill={TEXT_COLOR} fontSize="16" style={HALO}>
              {row.short}
            </text>
            <text x="12" y={top + 52} fill={MUTED_COLOR} fontSize="14" style={HALO}>
              {row.detail}
            </text>
            <rect x={left} y={top + 6} width={lab[row.key] * scale} height="26" fill={LAB_COLOR} />
            <text x={left + lab[row.key] * scale + 8} y={top + 26} fill={LAB_COLOR} fontSize="18" style={HALO}>
              lab: {lab[row.key]}
            </text>
            <rect x={left} y={top + 40} width={traveler[row.key] * scale} height="26" fill="url(#aberration-bar-traveler)" stroke={TRAVELER_COLOR} strokeWidth="2" />
            <text x={left + traveler[row.key] * scale + 8} y={top + 60} fill={TRAVELER_COLOR} fontSize="18" style={HALO}>
              traveler: {traveler[row.key]}
            </text>
          </g>
        )
      })}
      <line x1={left} y1="8" x2={left} y2={height - 6} stroke={MUTED_COLOR} strokeWidth="1.5" />
    </svg>
  )
}

export function AberrationExperiment({ onComplete, onTutorComplete }: AberrationExperimentProps) {
  // Counts the runs so the tutor starts again at its first question after each run.
  const [runCount, setRunCount] = useState(0)
  const [speed, setSpeed] = useState(SPEED_PRESETS[1])
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  // The question names the speed, so changing the speed clears the prediction.
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const sky = runSky(speed)
  const labAngles = sky.stars.map((star) => star.labAngle)
  const travelerAngles = sky.stars.map((star) => star.travelerAngle)
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

  // Stage 2: the traveler's icon flies in to the centre of the lab's picture. Stage 3: the traveler's sky is built one step at a time
  // (step k is the star the lab sees at 15k degrees and its mirror image below the line of travel). Stage 4: the counts appear.
  const idle = status === 'idle'
  const shipOffset = idle || progress >= SHIP_ARRIVES_AT ? 0 : SHIP_START_OFFSET * (1 - progress / SHIP_ARRIVES_AT)
  const stepsShown =
    idle || progress < SHIP_ARRIVES_AT
      ? 0
      : Math.min(STEP_COUNT, Math.floor(((progress - SHIP_ARRIVES_AT) / (STARS_DONE_AT - SHIP_ARRIVES_AT)) * STEP_COUNT) + 1)
  const stepOf = (index: number) => Math.min(index, STARS_ON_RING - index)
  const showCounts = status === 'complete' || progress >= STARS_DONE_AT
  const travelerStars = idle ? null : travelerAngles.map((angle, index) => (stepOf(index) < stepsShown ? angle : null))
  // The ray being drawn now (while the traveler's sky is being built) is the newest step's two stars; once the run has ended, only the
  // star we follow keeps its ray, so the same ray can be found at its two angles.
  const currentStep = stepsShown - 1
  const raysFor = (angles: number[]) => {
    if (idle || stepsShown === 0) return []
    if (status === 'complete' || progress >= STARS_DONE_AT) return [{ angle: angles[6], follow: true }]
    return angles
      .map((angle, index) => ({ angle, follow: index === 6, index }))
      .filter((ray) => stepOf(ray.index) === currentStep)
  }
  const followTravelerAngle = sky.sidewaysStarTravelerAngle

  return (
    <div>
      <h2>Experiment 7 — Aberration: Why the Sky Bunches Up Ahead of a Fast Traveler</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Introduction". It does not say
            whether, or which way, a star's direction changes (that is the prediction, §12), so the formula and its worked example are
            left for after the run. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 4 we saw that what you see is not the same as what you measure, because light takes
            time to arrive. Here is a different question about seeing. A star is so far away that its light reaches us travelling along an
            almost perfectly straight line. Now imagine two observers who are moving relative to each other. Both look at the same star at
            the same moment. Do they see it in the same direction? Or does an observer’s own motion change the direction in which they see
            it, and if it does, which way?
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> Here is each one in plain language.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Direction of travel:</strong> the way the traveler is moving. It is drawn as an arrow, and every angle in this
                experiment is measured from it.
              </li>
              <li>
                <strong>The angle θ</strong> (the Greek letter “theta”)<strong>:</strong> how far a star is from straight ahead, measured
                around from the direction of travel, in degrees. 0 degrees is straight ahead. 90 degrees is exactly sideways, like 3
                o’clock on a clock when you face 12. 180 degrees is straight behind. A full turn all the way around is 360 degrees. For
                example, a star at 45 degrees is halfway between straight ahead and sideways.
              </li>
              <li>
                <strong>Speed written as 0.6c:</strong> a fraction of the speed of light, <em>c</em>. So 0.6c is six tenths of the speed
                of light, and 0.9c is nine tenths. (As in the earlier experiments.)
              </li>
              <li>
                <strong>Aberration:</strong> the change, if there is one, in the direction in which a star is seen when the observer
                moves. This experiment shows how big the change is, and which way it goes.
              </li>
            </ul>
          </div>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A ring of 24 stars surrounds the lab. They are all very far away and at rest relative to the lab,
            and they are spaced evenly, one every 15 degrees. A traveler flies through the middle of the ring at a steady speed that you
            choose. When you press Run, the picture plays in stages: first the sky as the lab observer sees it, then the same stars as
            the traveler sees them, one at a time.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose the traveler’s speed. Then predict where the traveler will see one particular star: the one
            the lab observer sees exactly sideways. Press Run. You are not graded. The Run button stays off until you choose a prediction.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What we assume.</strong> The stars are very far away and at rest in the lab. The traveler moves at a steady speed, and we
            look only at the moment the traveler is at the middle of the ring. We show a flat slice of the sky, the ring along the line of
            travel, and we show only the direction of each star, not its brightness or color.
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
                  setPrediction(null)
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

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            One star lies exactly sideways from the lab observer’s point of view: neither ahead of the traveler’s path nor behind it. The
            traveler flies through the middle of the ring at <strong>{speed}c</strong>. Where does the traveler see that star? You are not
            graded, and a guess is fine.
          </p>
          <div>
            {PREDICTION_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => {
                  setPrediction(choice.value)
                  returnToIdle()
                }}
                className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            {prediction !== null
              ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.toLowerCase()}.`
              : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={() => {
            setProgress(0)
            setRunCount((n) => n + 1)
            setStatus('running')
          }}
          disabled={prediction === null || status === 'running'}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {prediction === null && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Choose a prediction above to run the experiment.</p>
        )}

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '1.5rem 0 0.75rem' }}>
          The traveler’s speed is {speed}c. Both pictures are drawn on the same scale.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <SkyPicture
              title="The lab’s sky"
              color={LAB_COLOR}
              stars={labAngles}
              showWedges
              frontCount={sky.countsLab.within30OfAhead}
              backCount={sky.countsLab.within30OfBehind}
              followAngle={90}
              rays={raysFor(labAngles)}
              shipOffset={shipOffset}
              idSuffix="lab"
            />
          </div>
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <SkyPicture
              title="The traveler’s sky"
              color={TRAVELER_COLOR}
              stars={travelerStars}
              showWedges={showCounts}
              frontCount={sky.countsTraveler.within30OfAhead}
              backCount={sky.countsTraveler.within30OfBehind}
              followAngle={followTravelerAngle}
              rays={raysFor(travelerAngles)}
              shipOffset={0}
              idSuffix="traveler"
            />
          </div>
        </div>

        {/* "How to read this diagram" (CLAUDE.md §14): draft wording for the owner's review (§28.1). Before the run it names every picture
            and element, defines the terms, and gives a worked moment and questions that do not say which way the stars shift (§12). */}
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> The diagram shows the sky around an observer. You can imagine the observer at the
            centre of the ring, looking outward at the stars. It is a flat slice of the sky: the ring is the sky cut along the line the
            traveler is flying along. There are two pictures, drawn on the same scale.
          </p>

          <p style={{ margin: '0.75rem 0 0.25rem' }}>
            <strong>The two pictures</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>The lab’s sky (sky blue).</strong> The 24 stars as the lab observer sees them. The lab observer is at rest relative to the
              stars. This picture is shown from the start.
            </li>
            <li>
              <strong>The traveler’s sky (purple).</strong> The same 24 stars as the traveler sees them at the moment the traveler flies through
              the centre of the ring. It is empty until you press Run. Then its stars are drawn a pair at a time, from straight ahead
              around to straight behind.
            </li>
          </ul>

          <p style={{ margin: '0.75rem 0 0.25rem' }}>
            <strong>What is drawn in each picture</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>The ring is the sky around the observer. Each dot on it is one star. There are 24 stars, and each is 15 degrees from the next one.</li>
            <li>
              The small spaceship at the centre is the traveler. The arrow from it, “direction of travel”, points the way the traveler is
              moving. It points to the right in both pictures.
            </li>
            <li>
              Four stars are labeled: “straight ahead” (0 degrees), the two sideways stars (90 degrees, one on each side of the line of
              travel), and “straight behind” (180 degrees). The larger dots are these four. “Sideways” always means sideways in the
              lab’s sky, so in the traveler’s sky the labels follow the same stars to wherever they are drawn.
            </li>
            <li>
              The yellow ring marks “the star we follow”. Both pictures show the same 24 stars, so a star in one picture has a partner in the
              other. “Following” a star means picking one star and looking for it in both pictures, to see whether it is drawn in the same
              place. We follow the star that the lab sees exactly sideways (90 degrees), because it is the star your prediction is about. It
              carries the yellow ring in both pictures, so you can find it in each without guessing which dot is which. The other stars are
              the same stars in both pictures too; this one is just marked so you can track it.
            </li>
            <li>
              The short arrows pointing in towards the centre are rays of starlight, travelling from a star to the observer. During the run,
              the ray from each star appears in both pictures at the same time, so you can compare the angle in the two. The ray from the
              star we follow is yellow, and it stays on after the run.
            </li>
            <li>
              The shaded wedges are two slices of the sky. The striped wedge is every direction within 30 degrees of straight ahead. The
              dotted wedge is every direction within 30 degrees of straight behind. The number beside each wedge is how many stars fall
              inside it. The two wedges use different fill patterns, so you can tell them apart without relying on colour.
            </li>
          </ul>

          <p style={{ margin: '0.75rem 0 0.25rem' }}>
            <strong>What appears when you press Run</strong>
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>The traveler’s icon flies in from the left of the lab’s picture and stops at the centre of the ring.</li>
            <li>The traveler’s sky is built, a pair of stars at a time, with the ray from each star drawn in both pictures.</li>
            <li>The shaded wedges and their counts appear in the traveler’s sky, so the two pictures can be compared.</li>
          </ol>

          <p style={{ margin: '0.75rem 0 0.25rem' }}>
            <strong>Words used in the drawing</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              A <em>degree</em> is a unit of angle. A full circle is 360 degrees, and a quarter of a circle, from straight ahead to
              sideways, is 90 degrees.
            </li>
            <li>
              <em>θ</em> is a star’s angle from straight ahead, measured from the direction of travel. <em>c</em> is the speed of light, so 0.6c
              is six tenths of the speed of light.
            </li>
          </ul>

          <p style={{ margin: '0.75rem 0 0.25rem' }}>
            <strong>A worked moment</strong> (reading an angle, not one of the buttons). In the lab’s sky, the star at 45 degrees lies
            halfway between the star straight ahead (0 degrees) and the star sideways (90 degrees). The stars are 15 degrees apart, so it is
            the third star counting around from straight ahead: 0, 15, 30, 45.
          </p>

          <p style={{ margin: '0.75rem 0 0.25rem' }}>
            <em>What to look for</em> (once the traveler’s sky is drawn):
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>Is the pattern of dots the same in the two pictures, or different?</li>
            <li>Where is the star we follow, in each picture?</li>
            <li>Do any stars stay in the same place in both pictures?</li>
            <li>How many stars fall inside each shaded wedge, in each picture?</li>
          </ul>
        </div>

        {status === 'complete' && prediction !== null && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>What you ran.</strong> A traveler flew through the middle of the ring of 24 stars at {speed}c. The same rays of
              starlight were measured by the lab and by the traveler. <strong>Your prediction was:</strong>{' '}
              {PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.toLowerCase()}. It is only recorded here, not marked right
              or wrong.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>The star we follow.</strong> The lab sees it at 90°. The traveler sees it at {sky.sidewaysStarTravelerAngle.toFixed(1)}°.
            </p>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>The angles.</strong> Seven stars from the upper half of the ring. “Change” is the traveler’s angle minus the lab’s
              angle, in degrees.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['Lab’s angle θ', 'Traveler’s angle θ′', 'Change'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESULT_LAB_ANGLES.map((labAngle) => {
                    const travelerAngle = travelerAngleOf(labAngle, speed)
                    return (
                      <tr key={labAngle}>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{labAngle}°</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{travelerAngle.toFixed(1)}°</td>
                        <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{(travelerAngle - labAngle).toFixed(1)}°</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>The counts.</strong> How many of the 24 stars fall in each part of the sky, in each picture.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['', 'Lab', 'Traveler'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COUNT_ROWS.map((row) => (
                    <tr key={row.key}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{row.label}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{sky.countsLab[row.key]}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{sky.countsTraveler[row.key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <CountBars lab={sky.countsLab} traveler={sky.countsTraveler} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>How to read these bars.</strong> Each group of two bars is one count from the table. The solid sky-blue bar is the
                lab’s count. The purple bar with diagonal stripes is the traveler’s count. A longer bar means more of the 24 stars. All the
                bars use the same scale, so you can compare any two of them. The
                number beside each bar says the same thing.
              </p>
              <p style={{ margin: 0 }}>
                <strong>The number D.</strong> At {speed}c, D = √(1 − {speed}²) = {sky.timeDilationFactor.toFixed(3)}. It is the same
                factor that the moving clock of Experiment 3 used. It is listed here because the traveler’s angles are worked out with it.
              </p>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1rem', marginBottom: 0 }}>
              Choose another speed, make a prediction and run it again to see which numbers change.
            </p>
          </div>
        )}
      </div>

      {status === 'complete' && prediction !== null && (
        <AberrationTutor key={runCount} speed={speed} predicted={prediction} onExplained={() => onTutorComplete?.()} />
      )}
    </div>
  )
}
