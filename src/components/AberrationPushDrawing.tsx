import type { CSSProperties } from 'react'
import { runSky, sidewaysRayPush } from '../physics/aberration'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'

// Spacetime Geometry 7, the drawing inside item 5 of the tutor's explanation: the same ray of starlight (from the star the lab sees exactly sideways) as the lab and as the traveler
// measure its push. Audit update of 2026-11-23 (wording in docs/audit/spacetime-geometry/07-draft-wording-cause.md, section 2, approved by the owner on 2026-11-23, CLAUDE.md §28.1).
// It is shown only in the explanation, after the learner has predicted and responded (§12). Every number comes from `sidewaysRayPush` and `runSky` (CLAUDE.md §9). It uses no white,
// because white always means the learner's guess.

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const LAB_COLOR = '#38bdf8'
const TRAVELER_COLOR = '#c4b5fd'
const FOLLOW_COLOR = '#facc15'
const NEW_COLOR = '#fb7185' // the new push the traveler finds along the line of travel
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }
const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}

const PANEL_WIDTH = 325
const HEIGHT = 330
const CENTER_Y = 160
const MAX_UNIT = 70 // pixels for one unit of push
const MAX_SIDE = 130 // the longest the horizontal parts may be, in pixels

const one = (value: number) => value.toFixed(1)
const three = (value: number) => value.toFixed(3)

function Panel({
  offsetX,
  title,
  color,
  unit,
  backward,
  angle,
  idSuffix,
  new_,
}: {
  offsetX: number
  title: string
  color: string
  unit: number
  backward: number // the push toward the back, in units (0 for the lab)
  angle: number // the angle from straight ahead at which the star is seen, in degrees
  idSuffix: string
  new_: boolean
}) {
  const cx = offsetX + PANEL_WIDTH / 2
  const cy = CENTER_Y
  const down = unit // the push across, 1 unit
  const left = backward * unit
  const headId = `push-head-${idSuffix}`
  const newHeadId = `push-new-head-${idSuffix}`
  const starX = cx + left
  const starY = cy - down
  const arcRadius = 46
  const arcRad = (angle * Math.PI) / 180
  const arcEndX = cx + arcRadius * Math.cos(arcRad)
  const arcEndY = cy - arcRadius * Math.sin(arcRad)
  return (
    <g>
      <defs>
        <marker id={headId} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M 0 0 L 9 4.5 L 0 9 Z" fill={color} />
        </marker>
        <marker id={newHeadId} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M 0 0 L 9 4.5 L 0 9 Z" fill={NEW_COLOR} />
        </marker>
      </defs>
      <text x={offsetX + 12} y="26" fill={color} fontSize="18" fontWeight="bold" style={HALO}>
        {title}
      </text>

      {/* The line of travel, with the direction of travel pointing right. */}
      <line x1={offsetX + 16} y1={cy} x2={offsetX + PANEL_WIDTH - 16} y2={cy} stroke={MUTED_COLOR} strokeWidth="1.5" strokeDasharray="5 4" />
      <text x={offsetX + PANEL_WIDTH - 18} y={cy + 18} fill={MUTED_COLOR} fontSize="13" textAnchor="end" style={HALO}>
        direction of travel →
      </text>
      <circle cx={cx} cy={cy} r="4" fill={TEXT_COLOR} />

      {/* The ray's push: the part across the line of travel (unchanged), the part along it (new for the traveler), and the whole push. */}
      <line x1={cx} y1={cy} x2={cx} y2={cy + down} stroke={color} strokeWidth="3" strokeDasharray={new_ ? '6 4' : undefined} markerEnd={new_ ? undefined : `url(#${headId})`} />
      {new_ && (
        <>
          <line x1={cx} y1={cy} x2={cx - left} y2={cy} stroke={NEW_COLOR} strokeWidth="4" markerEnd={`url(#${newHeadId})`} />
          <line x1={cx} y1={cy} x2={cx - left} y2={cy + down} stroke={color} strokeWidth="3.5" markerEnd={`url(#${headId})`} />
          <text x={Math.max(cx - left - 6, offsetX + 108)} y={cy - 10} fill={NEW_COLOR} fontSize="14" textAnchor="end" style={HALO}>
            along: {three(backward)}
          </text>
          <text x={Math.max(cx - left - 6, offsetX + 108)} y={cy - 26} fill={NEW_COLOR} fontSize="13" textAnchor="end" style={HALO}>
            toward the back (new)
          </text>
        </>
      )}
      <text x={cx + 8} y={cy + down / 2 + 5} fill={color} fontSize="14" style={HALO}>
        across: 1
      </text>
      {new_ && (
        <text x={cx + 8} y={cy + down / 2 + 22} fill={color} fontSize="13" style={HALO}>
          (unchanged)
        </text>
      )}
      <text x={cx - left} y={cy + down + 18} fill={color} fontSize="14" textAnchor="middle" style={HALO}>
        {new_ ? 'the ray’s push, as measured' : 'the ray’s push'}
      </text>

      {/* The direction toward the star: opposite to the push. The yellow ring is the star we follow. */}
      <line x1={cx} y1={cy} x2={starX} y2={starY} stroke={FOLLOW_COLOR} strokeWidth="2.5" strokeDasharray="6 4" />
      <circle cx={starX} cy={starY} r="11" fill="none" stroke={FOLLOW_COLOR} strokeWidth="2.5" />
      <text x={starX} y={starY - 18} fill={FOLLOW_COLOR} fontSize="14" textAnchor="middle" style={HALO}>
        toward the star
      </text>

      {/* The angle of the star from straight ahead (the direction of travel). */}
      <path d={`M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 0 ${arcEndX} ${arcEndY}`} fill="none" stroke={FOLLOW_COLOR} strokeWidth="2" />
      <text x={cx + (arcRadius + 16) * Math.cos(arcRad / 2)} y={cy - (arcRadius + 16) * Math.sin(arcRad / 2)} fill={FOLLOW_COLOR} fontSize="15" fontWeight="bold" style={HALO}>
        {one(angle)}°
      </text>
    </g>
  )
}

export function RayPushDrawing({ speed }: { speed: number }) {
  const push = sidewaysRayPush(speed)
  const sky = runSky(speed)
  const unit = Math.min(MAX_UNIT, MAX_SIDE / Math.max(push.travelerPushBackward, 1))
  return (
    <div style={{ margin: '0 0 1rem' }}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold', fontSize: '0.95rem' }}>The same ray of starlight, as the lab and as the traveler measure its push</p>
      <svg
        viewBox={`0 0 ${PANEL_WIDTH * 2} ${HEIGHT}`}
        style={SVG_STYLE}
        role="img"
        aria-label={`Two panels drawn on the same scale, showing the ray of starlight from the star we follow. For the lab, the ray’s push is 1 straight across the line of travel and the star is seen at 90 degrees. For the traveler at ${speed}c, the push across is still 1, and a new push of ${three(push.travelerPushBackward)} toward the back appears, so the star is seen at ${one(sky.sidewaysStarTravelerAngle)} degrees from straight ahead.`}
      >
        <Panel offsetX={0} title="The lab’s measurement" color={LAB_COLOR} unit={unit} backward={0} angle={90} idSuffix="lab" new_={false} />
        <Panel offsetX={PANEL_WIDTH} title={`The traveler’s measurement at ${speed}c`} color={TRAVELER_COLOR} unit={unit} backward={push.travelerPushBackward} angle={push.starAngle} idSuffix="traveler" new_ />
        <line x1={PANEL_WIDTH} y1="8" x2={PANEL_WIDTH} y2={HEIGHT - 8} stroke={MUTED_COLOR} strokeWidth="1" />
      </svg>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>How to read this drawing.</strong> Each panel shows one ray of starlight, the ray from the star we follow, as one observer measures it. The solid arrows are the ray’s push: they
          point the way the light is travelling. The dashed yellow line points the opposite way, which is the direction in which that observer sees the star, and the yellow ring is the star. The
          dashed grey horizontal line is the line of travel, with “direction of travel” pointing right. The pink arrow, in the traveler’s panel only, is a push that the lab did not find. Both panels
          use the same scale, so a longer arrow means a bigger push. The numbers are in units where the lab’s push across the line of travel is 1.
        </p>
        <LookForList
          items={[
            {
              look: 'the downward part of the push in both panels, marked “across: 1”.',
              means: 'its length is 1 in both: the push across the line of travel does not change.',
              matters: 'only the other part of the push changes, so only one thing needs explaining.',
            },
            {
              look: `the pink arrow toward the back in the traveler’s panel (${three(push.travelerPushBackward)} at ${speed}c).`,
              means: 'the lab found no push along the line of travel. The traveler finds one, because the traveler is flying into the light.',
              matters: 'this new push is what tilts the direction of the star toward the front.',
            },
            {
              look: 'the angle between the dashed yellow line and the line of travel in each panel.',
              means: `90° for the lab, ${one(push.starAngle)}° for the traveler.`,
              matters: 'it is the number from the table “The angles”, the row for 90°, so the drawing and the table agree.',
            },
          ]}
        />
        <WhereFrom>
          <strong>Calculated here:</strong> the numbers (the push across, the push along, the energy) come from the energy-and-momentum rule of Experiment 5 and the page’s physics, and the
          angles are the page’s own. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the ray from a star seen exactly sideways by the lab, and a traveler at exactly{' '}
          {speed}c.
        </WhereFrom>
      </div>
    </div>
  )
}
