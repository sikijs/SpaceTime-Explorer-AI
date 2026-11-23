import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { guessMarkFor, runSky } from '../physics/aberration'
import type { SidewaysGuess } from '../physics/aberration'
import { AberrationTutor } from './AberrationTutor'
import { AberrationIntroduction, AberrationLinks, FORMULA_ENTRIES, PART_ONE_SPEED, REFERENCE_ENTRIES } from './AberrationIntro'
import { AberrationResults, AngleTable, CountTable } from './AberrationResults'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'

// Spacetime Geometry 7, rebuilt on 2026-11-23 in the four Parts (CLAUDE.md §14 "The Page in Four Parts"), from the audit wording in
// docs/audit/spacetime-geometry/07-draft-wording.md (approved by the owner on 2026-11-23, §28.1). Part 1 is fixed on 0.6c: the learner's guess about the star the lab sees
// sideways is drawn in white on the traveler's sky, beside the real star (a yellow ring). The guess locks at Run; Start over clears it. Parts 2 to 4 appear when the first run
// has finished: Part 2 holds the speed buttons (they change the drawings, not the guess), Part 3 the results and Part 4 the tutor. Every number shown comes from the physics
// module (`runSky`, `guessMarkFor`, `aberrationCheckUp`, CLAUDE.md §9); the pictures are built in stages and the playback speed does not change any result (§11).

const SPEED_PRESETS = [0.3, 0.6, 0.9, 0.99]

const GUESS_CHOICES: { value: SidewaysGuess; label: string }[] = [
  { value: 'same', label: 'Exactly sideways, the same as the lab' },
  { value: 'ahead', label: 'Ahead of sideways, nearer the direction of travel' },
  { value: 'behind', label: 'Behind sideways, further from the direction of travel' },
]
const GUESS_BOX_TEXT: Record<SidewaysGuess, string> = { same: 'exactly sideways', ahead: 'ahead of sideways', behind: 'behind sideways' }

// The run's stages as fractions of its length (the physics result does not depend on them, CLAUDE.md §11): the traveler flies in to
// the centre, then the traveler's sky is built from straight ahead around to straight behind, then the wedge counts appear.
const ANIMATION_DURATION_MS = 9000
const SHIP_ARRIVES_AT = 0.15
const STARS_DONE_AT = 0.85
// The ring has 24 stars: straight ahead, straight behind, and eleven pairs (one above the line of travel, one below), so 13 steps.
const STEP_COUNT = 13
const STARS_ON_RING = 24
const SHIP_START_OFFSET = -110
// The star the lab sees exactly sideways is the 7th star of the ring (index 6), drawn at step 7.
const FOLLOW_INDEX = 6
const FOLLOW_STEP = 7

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
const GUESS_COLOR = '#ffffff'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

const PART_ONE_COLOR = '#d97706'
const PART_TWO_COLOR = '#be185d'
const PART_THREE_COLOR = '#0f766e'
const PART_FOUR_COLOR = '#0066cc'

const VIEW_WIDTH = 650
const VIEW_HEIGHT = 480
const CENTER_X = 325
const CENTER_Y = 250
const RADIUS = 150
const GUESS_ARROW_RADIUS = 170
const STAR_RADIUS = 6
const KEY_STAR_RADIUS = 8
const WEDGE_HALF_ANGLE = 30

const smallNote: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }
const hint: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }
const buttonStyle: CSSProperties = { marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }
const pictureTitle: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', margin: '1.5rem 0 0.75rem' }

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
  color: string
  stars: (number | null)[] | null // each star's angle to draw (null: not drawn yet), or null while the picture waits for the run
  showWedges: boolean
  frontCount: number | null
  backCount: number | null
  followAngle: number // where the star we follow is in this picture
  rays: { angle: number; follow: boolean }[] // short rays from stars to the centre, drawn during the run
  shipOffset: number // how far left of the centre the traveler's icon is (0 once it is at the centre)
  idSuffix: string
  guess?: SidewaysGuess | null // the learner's guess, drawn in white once the star we follow is drawn (the traveler's sky of Part 1 only)
  labObserver?: boolean // the lab's sky only: draws the lab observer, at rest at the centre, so the traveler's icon and arrow are not mistaken for the lab's motion
}

// A short ray from a star in towards the observer at the centre, with an arrowhead at the centre end: the starlight, travelling
// from the star to the observer.
function Ray({ angle, color, markerId }: { angle: number; color: string; markerId: string }) {
  const from = pointAt(angle, RADIUS - STAR_RADIUS - 3)
  const to = pointAt(angle, RADIUS - 62)
  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth="2.5" markerEnd={`url(#${markerId})`} />
}

// The learner's guess in white: a box labelled YOUR GUESS joined by a line to a white ring at the sideways position ("same") or a white arrow along the ring from the sideways
// position toward straight ahead or straight behind. It shows a direction only; its length means nothing. The angles come from `guessMarkFor` in the physics module.
function GuessMark({ guess, headId }: { guess: SidewaysGuess; headId: string }) {
  const mark = guessMarkFor(guess)
  const start = pointAt(mark.startAngle, GUESS_ARROW_RADIUS)
  const end = pointAt(mark.endAngle, GUESS_ARROW_RADIUS)
  const attach = mark.hasArrow ? start : pointAt(mark.startAngle, RADIUS + 24)
  return (
    <g>
      {mark.hasArrow ? (
        <path
          d={`M ${start.x} ${start.y} A ${GUESS_ARROW_RADIUS} ${GUESS_ARROW_RADIUS} 0 0 ${mark.endAngle < mark.startAngle ? 1 : 0} ${end.x} ${end.y}`}
          fill="none"
          stroke={GUESS_COLOR}
          strokeWidth="5"
          markerEnd={`url(#${headId})`}
        />
      ) : (
        <circle cx={pointAt(mark.startAngle, RADIUS).x} cy={pointAt(mark.startAngle, RADIUS).y} r="24" fill="none" stroke={GUESS_COLOR} strokeWidth="4" />
      )}
      <line x1="214" y1="68" x2={attach.x} y2={attach.y} stroke={GUESS_COLOR} strokeWidth="2" />
      <rect x="14" y="44" width="200" height="48" rx="6" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="3" />
      <text x="114" y="64" textAnchor="middle" fontSize="16" fontWeight="bold" fill={GUESS_COLOR}>
        YOUR GUESS
      </text>
      <text x="114" y="83" textAnchor="middle" fontSize="13" fill={GUESS_COLOR}>
        {GUESS_BOX_TEXT[guess]}
      </text>
    </g>
  )
}

// One picture of the sky: the ring, the traveler at the centre with the direction of travel, and (once there are stars to draw) the
// stars, the labeled ones, the star we follow (once it is drawn), any rays, and the two shaded wedges with their counts.
export function SkyPicture({ title, color, stars, showWedges, frontCount, backCount, followAngle, rays, shipOffset, idSuffix, guess = null, labObserver = false }: SkyPictureProps) {
  const frontPattern = `aberration-front-${idSuffix}`
  const backPattern = `aberration-back-${idSuffix}`
  const arrowHead = `aberration-arrow-${idSuffix}`
  const rayHead = `aberration-ray-${idSuffix}`
  const followHead = `aberration-follow-${idSuffix}`
  const guessHead = `aberration-guess-${idSuffix}`
  const filled = stars !== null
  // The star we follow, and the ring, label and white mark beside it, appear when the star itself is drawn.
  const followDrawn = stars !== null && stars[FOLLOW_INDEX] !== null
  const follow = pointAt(followAngle, RADIUS)
  const other = pointAt(360 - followAngle, RADIUS)
  const shipX = CENTER_X + shipOffset
  const guessShown = guess !== null && followDrawn
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      style={SVG_STYLE}
      role="img"
      aria-label={`${title}. A ring of stars around ${labObserver ? 'the lab observer, at rest at the centre, with the traveler passing through' : 'a traveler at the centre'}, with the direction of travel pointing right. ${
        filled
          ? `${stars.filter((angle) => angle !== null).length} of ${STARS_ON_RING} stars are drawn.${showWedges ? ` ${frontCount} are within 30 degrees of straight ahead and ${backCount} within 30 degrees of straight behind.` : ''}`
          : 'The stars appear here after the run.'
      }${guessShown ? ` A white box marked YOUR GUESS shows your guess: ${GUESS_BOX_TEXT[guess]}. It shows a direction only.` : ''}`}
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
        <marker id={guessHead} markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" refX="12" refY="8" orient="auto">
          <path d="M 0 0 L 16 8 L 0 16 Z" fill={GUESS_COLOR} />
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

      {/* The lab's sky only: the lab observer, at rest at the centre of the ring (a ring with a dot), labelled, so that the traveler's icon and arrow are not mistaken for the lab's own motion. */}
      {labObserver && (
        <>
          <circle cx={CENTER_X} cy={CENTER_Y} r="11" fill="none" stroke={color} strokeWidth="3" />
          <circle cx={CENTER_X} cy={CENTER_Y} r="3.5" fill={color} />
          <text x={CENTER_X} y={CENTER_Y + 66} fill={color} fontSize="17" fontWeight="bold" textAnchor="middle" style={HALO}>
            lab observer (at rest)
          </text>
        </>
      )}

      {/* The traveler at the centre, drawn as a small spaceship pointing along the direction of travel, and the arrow. */}
      <polygon points={`${shipX + 14},${CENTER_Y} ${shipX - 9},${CENTER_Y - 8} ${shipX - 9},${CENTER_Y + 8}`} fill={TEXT_COLOR} />
      <text x={shipX} y={CENTER_Y + 34} fill={TEXT_COLOR} fontSize={labObserver ? 18 : 20} textAnchor="middle" style={HALO}>
        {labObserver ? (shipOffset < 0 ? 'traveler (flying in)' : 'traveler (passing)') : 'traveler'}
      </text>
      <line x1={shipX + 22} y1={CENTER_Y} x2={shipX + 82} y2={CENTER_Y} stroke={TEXT_COLOR} strokeWidth="2.5" markerEnd={`url(#${arrowHead})`} />
      <text x={shipX + 56} y={CENTER_Y - 12} fill={TEXT_COLOR} fontSize={labObserver ? 15 : 18} textAnchor="middle" style={HALO}>
        {labObserver ? 'traveler’s direction of travel' : 'direction of travel'}
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

      {followDrawn && (
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
        </>
      )}

      {filled && (
        <>
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

      {guessShown && <GuessMark guess={guess} headId={guessHead} />}

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

const COUNT_ROWS: { key: 'aheadOfSideways' | 'within30OfAhead' | 'within30OfBehind'; label: string; short: string; detail: string }[] = [
  { key: 'aheadOfSideways', label: 'Stars seen less than 90° from straight ahead', short: 'Stars less than 90°', detail: 'from straight ahead' },
  { key: 'within30OfAhead', label: 'Stars in the striped wedge (within 30° of straight ahead)', short: 'Stars in the striped wedge', detail: '(within 30° of straight ahead)' },
  { key: 'within30OfBehind', label: 'Stars in the dotted wedge (within 30° of straight behind)', short: 'Stars in the dotted wedge', detail: '(within 30° of straight behind)' },
]

// A pair of bars for each count, lab against traveler, on one scale from 0 to 24 stars. The lab's bars are solid and the traveler's are
// outlined with a diagonal fill, so they differ by more than colour. Every number comes from `runSky` (CLAUDE.md §9).
export function CountBars({ lab, traveler }: { lab: Record<string, number>; traveler: Record<string, number> }) {
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

type PlayStatus = 'idle' | 'running' | 'complete'

// Runs one playback of the staged pictures: progress goes from 0 to 1 over a fixed real time (the physics does not depend on it). `onFinish` is called once at the end.
function usePlayback(status: PlayStatus, setStatus: (s: PlayStatus) => void, setProgress: (p: number) => void, onFinish?: () => void) {
  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)
      if (fraction >= 1) {
        setStatus('complete')
        onFinish?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])
}

// What the pictures show at one moment of a run: where the ship is, how many of the 13 build-up steps are drawn, and whether the wedge counts are shown.
export function stageOf(status: PlayStatus, progress: number) {
  const idle = status === 'idle'
  const shipOffset = idle || progress >= SHIP_ARRIVES_AT ? 0 : SHIP_START_OFFSET * (1 - progress / SHIP_ARRIVES_AT)
  const stepsShown =
    idle || progress < SHIP_ARRIVES_AT
      ? 0
      : Math.min(STEP_COUNT, Math.floor(((progress - SHIP_ARRIVES_AT) / (STARS_DONE_AT - SHIP_ARRIVES_AT)) * STEP_COUNT) + 1)
  const showCounts = status === 'complete' || progress >= STARS_DONE_AT
  return { idle, shipOffset, stepsShown, showCounts }
}

// "How to read this diagram" (CLAUDE.md §14), approved wording of 2026-10-16 with the audit changes of 2026-11-23: the white mark bullet, the three-part look-for items (each shown
// only once its feature is drawn) and a worked moment once the star we follow is drawn. Nothing here says which way the stars shift before the learner has seen them (§12).
export function SkyCaption({ speed, stepsShown, showCounts, guess, own = false }: { speed: number; stepsShown: number; showCounts: boolean; guess: SidewaysGuess | null; own?: boolean }) {
  const sky = runSky(speed)
  const followed = sky.sidewaysStarTravelerAngle
  const starDrawn = stepsShown >= FOLLOW_STEP
  const markDrawn = !own && guess !== null && starDrawn
  const lookFor: { look: string; means: string; matters: string }[] = []
  if (stepsShown >= 1) {
    lookFor.push({
      look: 'the dots in the two pictures.',
      means: 'both rings hold the same 24 stars, 15° apart in the lab’s sky.',
      matters: 'it is the same stars and the same starlight in both pictures, so any difference comes from who is looking.',
    })
  }
  if (starDrawn) {
    lookFor.push({
      look: 'the yellow ring in each picture.',
      means: `in the lab’s sky it sits at the top, at 90°. In the traveler’s sky it is drawn at the angle the traveler measures: ${followed.toFixed(1)}° from straight ahead at ${speed}c.`,
      matters: 'this is the one number the question was about.',
    })
    if (markDrawn) {
      lookFor.push({
        look: 'your white mark and the yellow ring in the traveler’s sky.',
        means: 'the mark shows which side of sideways you guessed; the ring shows where the star is. The mark is only a marker, with no angle.',
        matters: 'the two can be compared at a glance.',
      })
    }
  }
  if (stepsShown >= STEP_COUNT) {
    lookFor.push({
      look: 'the two stars straight ahead (0°) and straight behind (180°).',
      means: 'compare each with its partner in the other picture.',
      matters: 'these two lie on the line of travel, so they show whether a star on that line behaves like the others.',
    })
  }
  if (showCounts) {
    lookFor.push({
      look: 'the numbers beside the striped and dotted wedges, in each picture.',
      means: `at ${speed}c the lab counts ${sky.countsLab.within30OfAhead} and ${sky.countsLab.within30OfBehind}, and the traveler counts ${sky.countsTraveler.within30OfAhead} and ${sky.countsTraveler.within30OfBehind}.`,
      matters: 'the counts say how the 24 stars are spread around each observer’s sky, in numbers instead of dots.',
    })
  }
  return (
    <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> The diagram shows the sky around an observer. You can imagine the observer at the centre of the ring, looking outward at the stars. It is a
        flat slice of the sky: the ring is the sky cut along the line the traveler is flying along. There are two pictures, drawn on the same scale.
      </p>

      <p style={{ margin: '0.75rem 0 0.25rem' }}>
        <strong>The two pictures</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The lab’s sky (sky blue).</strong> The 24 stars as the lab observer sees them. The lab observer is at rest relative to the stars. This picture is shown from the start.
        </li>
        <li>
          <strong>The traveler’s sky (purple).</strong> The same 24 stars as the traveler sees them at the moment the traveler flies through the centre of the ring. It is empty until you press
          Run. Then its stars are drawn a pair at a time, from straight ahead around to straight behind.
        </li>
      </ul>

      <p style={{ margin: '0.75rem 0 0.25rem' }}>
        <strong>What is drawn in each picture</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>The ring is the sky around the observer. Each dot on it is one star. There are 24 stars, and each is 15 degrees from the next one.</li>
        <li>
          The small spaceship at the centre is the traveler. The arrow from it, “direction of travel”, points the way the traveler is moving. It points to the right in both pictures, and every
          angle in both pictures is measured from it.
        </li>
        <li>
          In the lab’s sky (blue), the <strong>lab observer is at rest</strong>. The lab observer is the small ring at the centre, marked “lab observer (at rest)”. The spaceship and the arrow in
          that picture are <strong>not</strong> the lab observer: they show the traveler, who flies in during the run, and the way the traveler flies. The arrow is there because the angles are
          measured from the direction the traveler flies. In the traveler’s sky (purple), the observer at the centre is the traveler.
        </li>
        <li>
          Four stars are labeled: “straight ahead” (0 degrees), the two sideways stars (90 degrees, one on each side of the line of travel), and “straight behind” (180 degrees). The larger dots
          are these four. “Sideways” always means sideways in the lab’s sky, so in the traveler’s sky the labels follow the same stars to wherever they are drawn.
        </li>
        <li>
          The yellow ring marks “the star we follow”. Both pictures show the same 24 stars, so a star in one picture has a partner in the other. “Following” a star means picking one star and
          looking for it in both pictures, to see whether it is drawn in the same place. We follow the star that the lab sees exactly sideways (90 degrees), because it is the star your
          prediction is about. It carries the yellow ring in both pictures, so you can find it in each without guessing which dot is which. The other stars are the same stars in both pictures
          too; this one is just marked so you can track it.
        </li>
        <li>
          The short arrows pointing in towards the centre are rays of starlight, travelling from a star to the observer. During the run, the ray from each star appears in both pictures at the
          same time, so you can compare the angle in the two. The ray from the star we follow is yellow, and it stays on after the run.
        </li>
        <li>
          The shaded wedges are two slices of the sky. The striped wedge is every direction within 30 degrees of straight ahead. The dotted wedge is every direction within 30 degrees of
          straight behind. The number beside each wedge is how many stars fall inside it. The two wedges use different fill patterns, so you can tell them apart without relying on colour.
        </li>
        {markDrawn && (
          <li>
            <strong>The white mark and the YOUR GUESS box</strong> in the traveler’s sky are your guess. The line joins the box to the place the guess is about: the sideways (90°) position, which
            is where the lab sees the star we follow. A white ring means you guessed “exactly sideways”. A white arrow means you guessed ahead of sideways (the arrow points toward straight ahead)
            or behind sideways (it points toward straight behind).{' '}
            <strong>The arrow only shows a direction. Your guess had no angle, so the arrow’s length means nothing.</strong> It does not change any star.
          </li>
        )}
      </ul>

      <p style={{ margin: '0.75rem 0 0.25rem' }}>
        <strong>What appears when you press Run</strong>
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>The traveler’s icon flies in from the left of the lab’s picture and stops at the centre of the ring.</li>
        <li>
          The traveler’s sky is built, a pair of stars at a time, with the ray from each star drawn in both pictures. The yellow ring appears when its star is drawn
          {own ? '.' : ', and your white mark appears with it.'}
        </li>
        <li>The shaded wedges and their counts appear in the traveler’s sky, so the two pictures can be compared.</li>
      </ol>

      <p style={{ margin: '0.75rem 0 0.25rem' }}>
        <strong>Words used in the drawing</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          A <em>degree</em> is a unit of angle. A full circle is 360 degrees, and a quarter of a circle, from straight ahead to sideways, is 90 degrees.
        </li>
        <li>
          <em>θ</em> is a star’s angle from straight ahead, measured from the direction of travel. <em>c</em> is the speed of light, so 0.6c is six tenths of the speed of light.
        </li>
      </ul>

      <p style={{ margin: '0.75rem 0 0.25rem' }}>
        <strong>A worked moment</strong> (reading an angle). In the lab’s sky, the star at 45 degrees lies halfway between the star straight ahead (0 degrees) and the star sideways (90 degrees).
        The stars are 15 degrees apart, so it is the third star counting around from straight ahead: 0, 15, 30, 45.
      </p>
      {starDrawn && (
        <p style={{ margin: '0.75rem 0 0.25rem' }}>
          <strong>A worked moment with the star we follow.</strong> At {speed}c the traveler’s angle for the star we follow is {followed.toFixed(1)}°. In the lab’s sky the same star is at 90°.{' '}
          {followed.toFixed(1)}° is {(90 - followed).toFixed(1)}° less than 90°. The yellow ring in the traveler’s sky is drawn at {followed.toFixed(1)}° from straight ahead.
        </p>
      )}

      {lookFor.length > 0 && (
        <>
          <p style={{ margin: '0.75rem 0 0.25rem' }}>
            <em>What to look for</em> (each item appears once the thing it names is drawn):
          </p>
          <LookForList items={lookFor} />
        </>
      )}
      {lookFor.length === 0 && (
        <p style={{ margin: '0.75rem 0 0.25rem', fontWeight: 'bold' }}>The “what to look for” items appear here as the traveler’s sky is drawn.</p>
      )}

      <WhereFrom>
        <strong>Measured:</strong> nothing in these pictures. No one has measured a traveler at {speed}c. <strong>Calculated here:</strong> every angle in the traveler’s sky, and the wedge counts,
        are worked out by the page from the lab’s angles and the speed, using the aberration formula. The page checks it a second way, from the energy and momentum of each ray of light
        (Experiment 5), and both give the same angle. <strong>Imagined for the question:</strong> the ring of 24 evenly spaced, very distant stars, the lab observer, and a traveler flying at
        exactly {speed}c.{!own && ' Your white mark is your guess, not a calculation.'}
      </WhereFrom>
    </div>
  )
}

interface SkyPairProps {
  speed: number
  status: PlayStatus
  progress: number
  guess: SidewaysGuess | null
  own?: boolean
}

// The lab's sky and the traveler's sky for one run, built in stages, with the rays, and the caption under them.
export function SkyPair({ speed, status, progress, guess, own = false }: SkyPairProps) {
  const sky = runSky(speed)
  const labAngles = sky.stars.map((star) => star.labAngle)
  const travelerAngles = sky.stars.map((star) => star.travelerAngle)
  const { idle, shipOffset, stepsShown, showCounts } = stageOf(status, progress)
  const stepOf = (index: number) => Math.min(index, STARS_ON_RING - index)
  const travelerStars = idle ? null : travelerAngles.map((angle, index) => (stepOf(index) < stepsShown ? angle : null))
  // The ray being drawn now (while the traveler's sky is being built) is the newest step's two stars; once the run has ended, only the
  // star we follow keeps its ray, so the same ray can be found at its two angles.
  const currentStep = stepsShown - 1
  const raysFor = (angles: number[]) => {
    if (idle || stepsShown === 0) return []
    if (status === 'complete' || progress >= STARS_DONE_AT) return [{ angle: angles[FOLLOW_INDEX], follow: true }]
    return angles.map((angle, index) => ({ angle, follow: index === FOLLOW_INDEX, index })).filter((ray) => stepOf(ray.index) === currentStep)
  }
  const prefix = own ? 'own-' : ''
  const speedWords = own ? ` at ${speed}c` : ''
  return (
    <>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>The traveler’s speed is {speed}c. Both pictures are drawn on the same scale.</p>
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
            idSuffix={`${prefix}lab`}
            labObserver
          />
        </div>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <SkyPicture
            title={`The traveler’s sky${speedWords}`}
            color={TRAVELER_COLOR}
            stars={travelerStars}
            showWedges={showCounts}
            frontCount={sky.countsTraveler.within30OfAhead}
            backCount={sky.countsTraveler.within30OfBehind}
            followAngle={sky.sidewaysStarTravelerAngle}
            rays={raysFor(travelerAngles)}
            shipOffset={0}
            idSuffix={`${prefix}traveler`}
            guess={own ? null : guess}
          />
        </div>
      </div>
      <SkyCaption speed={speed} stepsShown={stepsShown} showCounts={showCounts} guess={guess} own={own} />
    </>
  )
}

function BarsWithCaption({ speed }: { speed: number }) {
  const sky = runSky(speed)
  return (
    <div style={{ margin: '1rem 0' }}>
      <CountBars lab={sky.countsLab} traveler={sky.countsTraveler} />
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        <p style={{ margin: 0 }}>
          <strong>How to read these bars.</strong> Each group of two bars is one count from the table. The solid sky-blue bar is the lab’s count. The purple bar with diagonal stripes is the
          traveler’s count. A longer bar means more of the 24 stars. All the bars use the same scale, so you can compare any two of them. The number beside each bar says the same thing. At{' '}
          {speed}c the lab’s striped-wedge bar is {sky.countsLab.within30OfAhead} and the traveler’s is {sky.countsTraveler.within30OfAhead}: that is the second pair of bars.
        </p>
      </div>
    </div>
  )
}

interface AberrationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function AberrationExperiment({ onComplete, onTutorComplete }: AberrationExperimentProps) {
  // ---- Part 1: one guess, one fixed run (0.6c) ----
  const [guess, setGuess] = useState<SidewaysGuess | null>(null)
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState<PlayStatus>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the Start overs, so the tutor starts again at its first question.
  const [resetCount, setResetCount] = useState(0)
  // ---- Part 2: the learner's own speed ----
  const [ownSpeed, setOwnSpeed] = useState(PART_ONE_SPEED)
  const [shownSpeed, setShownSpeed] = useState<number | null>(null)
  const [ownStatus, setOwnStatus] = useState<PlayStatus>('idle')
  const [ownProgress, setOwnProgress] = useState(0)

  usePlayback(status, setStatus, setProgress, onComplete)
  usePlayback(ownStatus, setOwnStatus, setOwnProgress)

  const partOneDone = status === 'complete'
  const playing = status === 'running' || ownStatus === 'running'
  const startOverDisabled = (guess === null && status === 'idle' && shownSpeed === null) || playing

  const handleRun = () => {
    if (guess === null || locked) return
    setLocked(true)
    setProgress(0)
    setStatus('running')
  }
  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    if (playing) return
    setGuess(null)
    setLocked(false)
    setStatus('idle')
    setProgress(0)
    setOwnSpeed(PART_ONE_SPEED)
    setShownSpeed(null)
    setOwnStatus('idle')
    setOwnProgress(0)
    setResetCount((n) => n + 1)
  }
  const chooseOwnSpeed = (value: number) => {
    setOwnSpeed(value)
    setOwnStatus('idle')
    setOwnProgress(0)
  }
  const handleRunOwn = () => {
    setShownSpeed(ownSpeed)
    setOwnProgress(0)
    setOwnStatus('running')
  }
  const pinkFrame = { borderLeft: `4px solid ${PART_TWO_COLOR}`, paddingLeft: '0.75rem' } as const
  const guessLabel = GUESS_CHOICES.find((c) => c.value === guess)?.label ?? ''

  return (
    <div>
      <h2>Experiment 7 — Does Your Motion Change Where a Star Appears?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <AberrationIntroduction />

        <ReferencePanel entries={partOneDone ? [...REFERENCE_ENTRIES, ...FORMULA_ENTRIES] : REFERENCE_ENTRIES} />

        <AberrationLinks />

        {/* ===== Part 1: predict, then watch ===== */}
        <PartHeader color={PART_ONE_COLOR} title="Part 1: Predict, then watch">
          You will predict where a traveler flying at 0.6c sees one particular star, press Run, and watch two pictures of the sky being drawn. Your guess is drawn on the real picture in white. It
          never changes the picture.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction</p>
          <p style={hint}>
            One star lies exactly sideways from the lab observer’s point of view: neither ahead of the traveler’s path nor behind it. The traveler flies through the middle of the ring at{' '}
            <strong>{PART_ONE_SPEED}c</strong>. Where does the traveler see that star? You are not graded, and a guess is fine.
          </p>
          <div>
            {GUESS_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                disabled={locked}
                onClick={() => setGuess(choice.value)}
                className={`toggle-button${guess === choice.value ? ' is-selected' : ''}`}
                style={buttonStyle}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={smallNote}>
            {guess === null
              ? 'Choose an option to continue'
              : locked
                ? 'Your prediction is locked while you try other settings. To change it, press Start over.'
                : `Your prediction: ${guessLabel.toLowerCase()}. You can still change it until you press Run.`}
          </p>
        </div>

        <button type="button" className="action-button" onClick={handleRun} disabled={guess === null || locked} style={{ padding: '0.6rem 1.5rem' }}>
          {status === 'running' ? 'Running...' : locked ? 'Run (done)' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{ marginLeft: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: startOverDisabled ? 'not-allowed' : 'pointer', opacity: startOverDisabled ? 0.5 : 1 }}
        >
          Start over
        </button>
        {guess === null && <p style={smallNote}>Choose a prediction above to run the experiment.</p>}

        <p style={pictureTitle}>The lab’s sky and the traveler’s sky, for a traveler flying at {PART_ONE_SPEED}c</p>
        <SkyPair speed={PART_ONE_SPEED} status={status} progress={progress} guess={guess} />
        {status === 'idle' && (
          <p style={{ ...smallNote, fontWeight: 'bold' }}>Your white guess mark appears in the traveler’s sky, beside the star we follow, when that star is drawn.</p>
        )}

        {/* ===== Parts 2 to 4: appear when the first Run has finished ===== */}
        {partOneDone && (
          <>
            <PartHeader color={PART_TWO_COLOR} title="Part 2: Now try it yourself">
              You choose how fast the traveler flies and press Run these settings. These choices change the drawings. Your guess does not, and it stays locked while you try other speeds. They are
              trial values for an imagined traveler. They do not say that any real spaceship can fly like that.
            </PartHeader>
            <div style={{ ...pinkFrame, marginBottom: '1rem' }}>
              <p style={{ ...hint, marginBottom: '0.5rem' }}>
                These buttons change the drawings and the tables below. Your guess does not. It is locked, and it is drawn on Part 1’s picture only. These speeds are trial values for an imagined
                traveler, and they do not say that a real spaceship can fly like that.
              </p>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The traveler’s speed</label>
              <p style={hint}>As a fraction of the speed of light, c. For example, 0.9c is nine tenths of the speed of light.</p>
              <div>
                {SPEED_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={ownStatus === 'running'}
                    onClick={() => chooseOwnSpeed(value)}
                    className={`toggle-button${ownSpeed === value ? ' is-selected' : ''}`}
                    style={buttonStyle}
                  >
                    {value}c
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="action-button" onClick={handleRunOwn} disabled={ownStatus === 'running'} style={{ padding: '0.6rem 1.5rem' }}>
              {ownStatus === 'running' ? 'Running...' : 'Run these settings'}
            </button>
            {(ownStatus === 'idle' || shownSpeed === null) && (
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.75rem' }}>
                Choose a speed, then press Run these settings. The two pictures and the tables for your speed appear here.
              </p>
            )}
            {shownSpeed !== null && ownStatus !== 'idle' && (
              <div style={{ ...pinkFrame, marginTop: '1rem' }}>
                <p style={pictureTitle}>Your own speed: the lab’s sky and the traveler’s sky at {shownSpeed}c</p>
                <SkyPair speed={shownSpeed} status={ownStatus} progress={ownProgress} guess={null} own />
                {ownStatus === 'complete' && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>The angles at {shownSpeed}c</p>
                    <AngleTable speed={shownSpeed} />
                    <p style={{ margin: '0.5rem 0 0.25rem', fontWeight: 'bold' }}>The counts at {shownSpeed}c</p>
                    <CountTable speed={shownSpeed} />
                    <p style={smallNote}>
                      These numbers are for your own speed. They are trial values for an imagined traveler, and they do not say that a real spaceship can fly like that. They do not change Part 3’s
                      tables, which are for Part 1’s run at {PART_ONE_SPEED}c.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ===== Part 3: the results of Part 1's run ===== */}
            <PartHeader color={PART_THREE_COLOR} title="Part 3: The results">
              Here are the numbers behind Part 1’s pictures, a check-up of this page against its own physics, and your guess beside the real results. The tables never change with your guess or with
              the speeds you tried in Part 2.
            </PartHeader>
            {guess !== null && <AberrationResults speed={PART_ONE_SPEED} guess={guess} bars={<BarsWithCaption speed={PART_ONE_SPEED} />} />}

            {/* ===== Part 4: the tutor ===== */}
            <PartHeader color={PART_FOUR_COLOR} title="Part 4: The tutor">
              The tutor asks you three questions, one at a time, about what you saw and how your guess compares with the pictures, then goes through the explanation. The tutor’s questions are not
              marked.
            </PartHeader>
            {guess !== null && <AberrationTutor key={resetCount} speed={PART_ONE_SPEED} predicted={guess} onExplained={() => onTutorComplete?.()} />}
          </>
        )}
      </div>
    </div>
  )
}
