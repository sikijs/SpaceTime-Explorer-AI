import { eventStripPositions, labViewStateAt, orderMarkerTarget, rodViewStateAt, runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { FrameAgreementChoice, OrderChoice, SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox } from './Experiment6Pictures'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 7: the pictures (the two labelled panels, the strip of event times and their captions),
// audited to the newer rules (docs/audit/relativity-of-time-and-motion/07-draft-wording.md, approved by the owner on 2026-11-10).
// Every number drawn comes from the physics module (src/physics/relativityOfSimultaneityExperiment.ts; CLAUDE.md §9). The wording is
// the owner's to approve line by line (CLAUDE.md §28.1).

export const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const BACK_COLOR = '#2563eb' // blue: the back end (on the light-blue panels)
const FRONT_COLOR = '#7c3aed' // purple: the front end (on the light-blue panels)
const BACK_LIGHT = '#60a5fa' // the same blue, lighter, for the dark strip
const FRONT_LIGHT = '#a78bfa' // the same purple, lighter, for the dark strip
const BACK_DARK = '#1d4ed8'
const FRONT_DARK = '#6d28d9'
const INK = '#1e293b'

const ORDER_TEXT: Record<OrderChoice, string> = {
  same: 'at the same time',
  back: 'the back end first',
  front: 'the front end first',
}

const AGREEMENT_TEXT: Record<FrameAgreementChoice, string> = {
  agree: 'the block’s own view would agree with the lab',
  disagree: 'the block’s own view would disagree with the lab',
}

// ---- The two panels ----
const VIEW_WIDTH = 720
const VIEW_HEIGHT = 152
const AXIS_Y = 70
const CENTER_X = VIEW_WIDTH / 2
const SIDE_MARGIN = 24
const MIRROR_HALF_HEIGHT = 24
const MAX_PX_PER_LS = 600

interface PanelProps {
  title: string
  scale: number
  state: ReturnType<typeof labViewStateAt>
  backEventTime: number
  frontEventTime: number
}

// Draws what the physics model reports at the current time; no physics is calculated here.
function Panel({ title, scale, state, backEventTime, frontEventTime }: PanelProps) {
  const x = (position: number) => CENTER_X + position * scale
  const mirrorTop = AXIS_Y - MIRROR_HALF_HEIGHT
  const centreX = (x(state.backMirrorPosition) + x(state.frontMirrorPosition)) / 2
  const mirror = (position: number, color: string) => (
    <line x1={x(position)} y1={mirrorTop} x2={x(position)} y2={AXIS_Y + MIRROR_HALF_HEIGHT} stroke={color} strokeWidth={6} />
  )
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: '0 0 170px' }}>
        <p style={{ fontSize: '0.8125rem', margin: '0 0 0.125rem' }}>
          <strong style={{ color: BACK_COLOR }}>Back end</strong> reached: {state.backEventFired ? `${backEventTime.toFixed(3)} s` : '—'}
        </p>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>
          <strong style={{ color: FRONT_COLOR }}>Front end</strong> reached: {state.frontEventFired ? `${frontEventTime.toFixed(3)} s` : '—'}
        </p>
      </div>
      <div style={{ flex: '1 1 320px', minWidth: 0, backgroundColor: '#d9ecff', borderRadius: '6px', padding: '0.25rem 0.5rem' }}>
        <svg className="narrow-scroll"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`${title}: a flash of light travelling from the block's centre to both ends`}
          style={{ width: '100%', height: 'auto' }}
        >
          <text x={8} y={18} fill={INK} fontSize="13" fontWeight="bold">
            {title}
          </text>
          <line x1={x(0)} y1={28} x2={x(0)} y2={VIEW_HEIGHT - 18} stroke="#64748b" strokeWidth={1} strokeDasharray="2 3" />
          <text x={x(0)} y={VIEW_HEIGHT - 5} fill="#475569" fontSize="11" textAnchor="middle">
            Flash released here (at the block’s centre at the start)
          </text>
          <rect
            x={x(state.backMirrorPosition)}
            y={mirrorTop}
            width={Math.max(0, x(state.frontMirrorPosition) - x(state.backMirrorPosition))}
            height={2 * MIRROR_HALF_HEIGHT}
            fill="#ffffff"
            fillOpacity={0.55}
          />
          <text x={centreX} y={mirrorTop + 11} fill={INK} fontSize="11" fontWeight="bold" textAnchor="middle">
            BLOCK
          </text>
          {/* the block's own centre: a small marker that moves with the block, so it can be compared with the release point */}
          <polygon
            points={`${centreX - 6},${AXIS_Y + MIRROR_HALF_HEIGHT + 9} ${centreX + 6},${AXIS_Y + MIRROR_HALF_HEIGHT + 9} ${centreX},${AXIS_Y + MIRROR_HALF_HEIGHT + 1}`}
            fill={INK}
          />
          <text x={centreX} y={AXIS_Y + MIRROR_HALF_HEIGHT + 22} fill={INK} fontSize="10" fontWeight="bold" textAnchor="middle">
            block’s centre
          </text>
          {mirror(state.backMirrorPosition, BACK_COLOR)}
          {mirror(state.frontMirrorPosition, FRONT_COLOR)}
          <text x={x(state.backMirrorPosition)} y={mirrorTop - 5} fill={BACK_DARK} fontSize="11" fontWeight="bold" textAnchor="middle">
            Back end
          </text>
          <text x={x(state.frontMirrorPosition)} y={mirrorTop - 5} fill={FRONT_DARK} fontSize="11" fontWeight="bold" textAnchor="middle">
            Front end
          </text>
          <circle cx={x(state.leftPulsePosition)} cy={AXIS_Y} r="7" stroke="#1e293b" strokeWidth={1.5} fill={state.backEventFired ? '#2e7d32' : '#e6a700'} />
          <circle cx={x(state.rightPulsePosition)} cy={AXIS_Y} r="7" stroke="#1e293b" strokeWidth={1.5} fill={state.frontEventFired ? '#2e7d32' : '#e6a700'} />
          <text x={x(state.leftPulsePosition) - 8} y={AXIS_Y + MIRROR_HALF_HEIGHT + 36} fill={state.backEventFired ? '#166534' : '#92400e'} fontSize="10" textAnchor="end">
            {state.backEventFired ? 'flash: reached' : 'flash'}
          </text>
          <text x={x(state.rightPulsePosition) + 8} y={AXIS_Y + MIRROR_HALF_HEIGHT + 36} fill={state.frontEventFired ? '#166534' : '#92400e'} fontSize="10" textAnchor="start">
            {state.frontEventFired ? 'flash: reached' : 'flash'}
          </text>
        </svg>
      </div>
    </div>
  )
}

// Both panels are drawn at ONE scale (pixels per light-second), so a difference in the length of the block between them is the real
// length contraction and not a difference in zoom. `scaleGeometry` is the run that sets the scale (the widest trip the pictures must
// hold); by default it is the run being drawn. Part 2 passes its fastest run, so the scale does not change with the speed chosen.
export function SimultaneityPanels({
  geometry,
  playTime,
  speedLabel,
  scaleGeometry = geometry,
}: {
  geometry: SimultaneityResult
  playTime: number
  speedLabel: string
  scaleGeometry?: SimultaneityResult
}) {
  const labState = labViewStateAt(geometry, playTime)
  const rodState = rodViewStateAt(geometry, playTime)
  const labExtent = scaleGeometry.labLength / 2 + scaleGeometry.velocity * scaleGeometry.frontEventLabTime
  const rodExtent = scaleGeometry.restLength / 2
  const scale = Math.min(MAX_PX_PER_LS, (CENTER_X - SIDE_MARGIN) / Math.max(labExtent, rodExtent))
  const labScale = scale
  const rodScale = scale
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Panel
        title="THE BLOCK’S OWN POINT OF VIEW (the block does not move)"
        scale={rodScale}
        state={rodState}
        backEventTime={geometry.rodFrameEventTime}
        frontEventTime={geometry.rodFrameEventTime}
      />
      <Panel
        title={`THE LAB’S POINT OF VIEW (the block moves →, ${speedLabel})`}
        scale={labScale}
        state={labState}
        backEventTime={geometry.backEventLabTime}
        frontEventTime={geometry.frontEventLabTime}
      />
    </div>
  )
}

// ---- The strip of event times (shown when the run ends) ----
const S = { width: 720, height: 338, left: 130, right: 700 }
const TITLE_Y = 18
const ORDER_BOX_Y = 28
const BRACKET_Y = 80
const GAP_TEXT_Y = 100
const GAP_LINE_Y = 108
const ROW_LAB = 134
const LAB_LABEL_Y = 160
const AGREE_BOX_Y = 176
const ROW_ROD = 242
const ROD_LABEL_Y = 268
const AXIS_BOTTOM = 298
const LABEL_WIDTH = 110

export interface StripGuesses {
  order: OrderChoice
  agreement: FrameAgreementChoice
}

export function EventStrip({
  result,
  scaleEnd,
  pinkSpeed,
  guesses,
  label,
}: {
  result: SimultaneityResult
  scaleEnd: number
  pinkSpeed: number | null // Part 2: the learner's own speed, written in pink
  guesses: StripGuesses | null // Part 1: the learner's two guesses, in white
  label: string
}) {
  const pos = eventStripPositions(result, scaleEnd)
  const px = (fraction: number) => S.left + fraction * (S.right - S.left)
  const backX = px(pos.labBack)
  const frontX = px(pos.labFront)
  const rodX = px(pos.rod)
  const overlap = Math.abs(frontX - backX) < 2
  const stroke = { stroke: '#0b1020', strokeWidth: 4, paintOrder: 'stroke' } as const
  const tickStep = scaleEnd <= 0.5 ? 0.1 : 0.2
  const ticks: number[] = []
  for (let t = 0; t <= scaleEnd + 1e-9; t += tickStep) ticks.push(parseFloat(t.toFixed(2)))

  const backAnchor = backX - 8 - LABEL_WIDTH >= 16 ? 'end' : 'start'
  const frontAnchor = frontX + 8 + LABEL_WIDTH <= S.width - 4 ? 'start' : 'end'

  // The order guess is a choice, so it is a marker only: a ring round the guessed end's dot, or a bracket joining both dots, with a
  // YOUR GUESS box joined to it by a line.
  const orderMarker = (choice: OrderChoice) => {
    const target = orderMarkerTarget(result, choice, scaleEnd)
    const xs = target.fractions.map(px)
    const midX = (Math.min(...xs) + Math.max(...xs)) / 2
    const text = `YOUR GUESS (a marker only): ${ORDER_TEXT[choice]}`
    const boxWidth = text.length * 7.4 + 16
    const boxX = Math.min(Math.max(midX - boxWidth / 2, 4), S.width - boxWidth - 4)
    const bracket = target.pointsAt === 'bothDots' && Math.abs(xs[1] - xs[0]) >= 2
    return (
      <g>
        {bracket ? (
          <>
            <line x1={xs[0]} y1={BRACKET_Y} x2={xs[1]} y2={BRACKET_Y} stroke={GUESS_COLOR} strokeWidth={2} />
            <line x1={xs[0]} y1={BRACKET_Y} x2={xs[0]} y2={BRACKET_Y + 8} stroke={GUESS_COLOR} strokeWidth={2} />
            <line x1={xs[1]} y1={BRACKET_Y} x2={xs[1]} y2={BRACKET_Y + 8} stroke={GUESS_COLOR} strokeWidth={2} />
            <line x1={midX} y1={ORDER_BOX_Y + 24} x2={midX} y2={BRACKET_Y} stroke={GUESS_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
          </>
        ) : (
          <>
            <circle cx={midX} cy={ROW_LAB} r={14} fill="none" stroke={GUESS_COLOR} strokeWidth={2} />
            <line x1={midX} y1={ORDER_BOX_Y + 24} x2={midX} y2={ROW_LAB - 14} stroke={GUESS_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
          </>
        )}
        <rect x={boxX} y={ORDER_BOX_Y} width={boxWidth} height={24} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
        <text x={boxX + 8} y={ORDER_BOX_Y + 16} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
          {text}
        </text>
      </g>
    )
  }

  // The agreement guess compares the two rows, so its marker sits between them and is joined to both by a white line down the left.
  const agreementMarker = (choice: FrameAgreementChoice) => {
    const text = `YOUR GUESS (a marker only): ${AGREEMENT_TEXT[choice]}`
    const boxWidth = text.length * 7.4 + 16
    const midY = AGREE_BOX_Y + 13
    return (
      <g>
        <line x1={6} y1={ROW_LAB} x2={6} y2={ROW_ROD} stroke={GUESS_COLOR} strokeWidth={2} />
        <line x1={6} y1={ROW_LAB} x2={18} y2={ROW_LAB} stroke={GUESS_COLOR} strokeWidth={2} />
        <line x1={6} y1={ROW_ROD} x2={18} y2={ROW_ROD} stroke={GUESS_COLOR} strokeWidth={2} />
        <line x1={6} y1={midY} x2={24} y2={midY} stroke={GUESS_COLOR} strokeWidth={2} />
        <rect x={24} y={AGREE_BOX_Y} width={boxWidth} height={26} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
        <text x={32} y={AGREE_BOX_Y + 17} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
          {text}
        </text>
      </g>
    )
  }

  return (
    <svg className="narrow-scroll" width={S.width} height={S.height} viewBox={`0 0 ${S.width} ${S.height}`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={TITLE_Y} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        When was each end reached?
      </text>
      {pinkSpeed !== null && (
        <text x={S.width - 14} y={TITLE_Y} fill={YOURS_COLOR} fontSize="13" fontWeight="bold" textAnchor="end">
          your speed: {pinkSpeed}c
        </text>
      )}

      {/* the moment the flash was released, the same event in both frames */}
      <line x1={px(0)} y1={ROW_LAB - 20} x2={px(0)} y2={AXIS_BOTTOM} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />

      {/* the lab's clocks */}
      <text x={22} y={ROW_LAB + 4} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        Lab’s clocks
      </text>
      <text x={22} y={ROW_LAB + 17} fill={MUTED_COLOR} fontSize="10">
        (lab seconds)
      </text>
      <line x1={px(0)} y1={ROW_LAB} x2={S.right} y2={ROW_LAB} stroke="#334155" strokeWidth={1.5} />
      {overlap ? (
        <>
          <circle cx={backX} cy={ROW_LAB} r={9} fill={BACK_LIGHT} stroke="#0b1020" strokeWidth={1.5} />
          <circle cx={frontX} cy={ROW_LAB} r={5} fill={FRONT_LIGHT} />
        </>
      ) : (
        <>
          <circle cx={backX} cy={ROW_LAB} r={8} fill={BACK_LIGHT} stroke="#0b1020" strokeWidth={1.5} />
          <circle cx={frontX} cy={ROW_LAB} r={8} fill={FRONT_LIGHT} stroke="#0b1020" strokeWidth={1.5} />
        </>
      )}
      <text x={backX + (backAnchor === 'end' ? -8 : 8)} y={LAB_LABEL_Y} fill={BACK_LIGHT} fontSize="12" fontWeight="bold" textAnchor={backAnchor} {...stroke}>
        back end {result.backEventLabTime.toFixed(3)} s
      </text>
      <text x={frontX + (frontAnchor === 'start' ? 8 : -8)} y={LAB_LABEL_Y} fill={FRONT_LIGHT} fontSize="12" fontWeight="bold" textAnchor={frontAnchor} {...stroke}>
        front end {result.frontEventLabTime.toFixed(3)} s
      </text>
      {/* the gap on the lab row: a dimension line between the two dots (the two dots on top of each other mean 0) */}
      {!overlap && (
        <>
          <line x1={backX} y1={GAP_LINE_Y} x2={frontX} y2={GAP_LINE_Y} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <line x1={backX} y1={GAP_LINE_Y - 4} x2={backX} y2={GAP_LINE_Y + 4} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <line x1={frontX} y1={GAP_LINE_Y - 4} x2={frontX} y2={GAP_LINE_Y + 4} stroke={TEXT_COLOR} strokeWidth={1.5} />
        </>
      )}
      <text x={(backX + frontX) / 2} y={GAP_TEXT_Y} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        gap {pos.labGap.toFixed(3)} s
      </text>

      {/* the block's own clocks: both ends together */}
      <text x={22} y={ROW_ROD + 4} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        Block’s own clocks
      </text>
      <text x={22} y={ROW_ROD + 17} fill={MUTED_COLOR} fontSize="10">
        (block’s own seconds)
      </text>
      <line x1={px(0)} y1={ROW_ROD} x2={S.right} y2={ROW_ROD} stroke="#334155" strokeWidth={1.5} />
      <circle cx={rodX} cy={ROW_ROD} r={9} fill={BACK_LIGHT} stroke="#0b1020" strokeWidth={1.5} />
      <circle cx={rodX} cy={ROW_ROD} r={5} fill={FRONT_LIGHT} />
      <text x={rodX} y={ROD_LABEL_Y} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        both ends {result.rodFrameEventTime.toFixed(3)} s
      </text>

      {/* the time axis */}
      <line x1={px(0)} y1={AXIS_BOTTOM} x2={S.right} y2={AXIS_BOTTOM} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={px(t / scaleEnd)} y1={AXIS_BOTTOM} x2={px(t / scaleEnd)} y2={AXIS_BOTTOM + 5} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <text x={px(t / scaleEnd)} y={AXIS_BOTTOM + 18} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
            {t.toFixed(1)} s
          </text>
        </g>
      ))}
      <text x={px(0)} y={S.height - 6} fill={MUTED_COLOR} fontSize="11">
        0 = the moment the flash was released
      </text>

      {guesses && orderMarker(guesses.order)}
      {guesses && agreementMarker(guesses.agreement)}
    </svg>
  )
}

// ---- Captions ----

// Shown from the start: only what is drawn before the run. No times and no answers (CLAUDE.md §12).
export function PanelsCaption() {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the two pictures.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>Two pictures.</strong> The top picture is the block&rsquo;s own point of view, and the bottom picture is the
          lab&rsquo;s point of view. Both show <strong>the same flash</strong>, released from the same place at the same moment, and
          the same two events: the flash reaching the back end and the flash reaching the front end. They run at the same time.
        </li>
        <li>
          <strong>The block</strong> is the pale, flat rectangle labelled BLOCK, one long body lying along the line. Its two ends are the
          two thick lines: the <strong>blue line</strong> is the back end and the <strong>purple line</strong> is the front end. They are
          the two ends of the same block, not two separate objects. In the top picture the block does not move. In the bottom picture it moves to the
          right at the speed written in its title. The <strong>dashed line</strong> marks the place where the flash was released, and
          it stays where it is in each picture.
        </li>
        <li>
          <strong>Same scale.</strong> Both pictures are drawn at the same scale: a light-second is the same length on the screen in
          each. So if the block looks shorter in the bottom picture, that is the real shortening that the lab measures (&ldquo;Does motion
          change length?&rdquo;), not a difference in zoom.
        </li>
        <li>
          <strong>The block&rsquo;s centre</strong> is the small dark triangle under the block, labelled &ldquo;block&rsquo;s centre&rdquo;. It
          moves with the block. The <strong>dashed line</strong> is the place where the flash was released. At the start the triangle sits
          on the dashed line, because the flash is released from the exact middle of the block. In the top picture the block does not move,
          so they stay together. In the bottom picture the block moves on, and the triangle leaves the dashed line.
        </li>
        <li>
          <strong>The flash</strong> is the two dots that start on the dashed line and move apart, one towards each end, at the speed
          of light. A dot is <strong>amber</strong> while it is on its way and turns <strong>green</strong> when it has reached its
          end. That moment is an event.
        </li>
        <li>
          <strong>The readouts</strong> beside each picture give the time at which each end was reached, in that picture&rsquo;s
          own clocks, once the dot has turned green. &ldquo;—&rdquo; means not reached yet.
        </li>
        <li>
          <strong>Playback time</strong> only runs the pictures. It is not a reading on any clock in the experiment, and each
          picture&rsquo;s own times are in its readouts.
        </li>
        <li>
          <strong>Light-seconds and c:</strong> a light-second is the distance light goes in one second (about 300,000 km), and 0.5c
          is half the speed of light.
        </li>
        <li>
          <strong>When the run ends:</strong> the run stops when the last dot has turned green.
        </li>
      </ul>
    </CaptionBox>
  )
}

const round3 = (n: number) => parseFloat(n.toFixed(3))

// Shown with the strip, after the run. Part 1 (guesses) and Part 2 (pink, no guesses) differ in the worked moment and the look-fors.
export function StripCaption({ result, guesses, pink }: { result: SimultaneityResult; guesses: boolean; pink: boolean }) {
  const r = result
  const v = r.velocity
  const halfRest = (r.restLength / 2).toFixed(2)
  const halfLab = (r.labLength / 2).toFixed(4)
  // At a very small speed the length rounds to the rest length at three decimals; show more decimals so "shorter" can be seen.
  const labLength = [3, 4, 5, 6].map((d) => r.labLength.toFixed(d)).find((text, i) => v === 0 || text !== r.restLength.toFixed(i + 3)) ?? r.labLength.toFixed(6)
  const pinkGaps = [0, 0.1, 0.3, 0.5, 0.8, 0.9].map((s) => ({ speed: s, gap: runSimultaneityExperiment(s).labTimeGap }))
  const items = pink
    ? [
        {
          look: 'the gap on the lab row in each run in “Runs so far”.',
          means: `The gap is ${pinkGaps.map((g) => `${g.gap.toFixed(3)} s at ${g.speed}c`).join(', ')}.`,
          matters: 'It shows how the lab’s gap grows with the speed of the block.',
        },
        {
          look: 'the block’s own row in each run.',
          means: `It stays at ${r.rodFrameEventTime.toFixed(3)} s, whatever the speed, with both ends together.`,
          matters: 'It shows that the block’s own clocks put the two ends together at every speed.',
        },
      ]
    : [
        {
          look: 'the two dots on the lab row.',
          means: `The lab’s clocks say the flash reached the back end at ${r.backEventLabTime.toFixed(3)} s and the front end at ${r.frontEventLabTime.toFixed(3)} s.`,
          matters: 'These are the lab’s times for the two events, the answer to your first guess.',
        },
        {
          look: 'the line with end caps on the lab row.',
          means: `The two arrivals are ${r.labTimeGap.toFixed(3)} s apart on the lab’s clocks.`,
          matters: 'It turns “at the same time or not” into a number you can see: 0 means together.',
        },
        {
          look: 'the pair of dots on the block’s own row.',
          means: `The block’s own clocks say both ends were reached at ${r.rodFrameEventTime.toFixed(3)} s, so the gap is 0.`,
          matters: 'This is the block’s answer, for you to compare with the lab’s.',
        },
        {
          look: 'the two rows together, and the same blue and purple dots in each.',
          means: `It is the same flash and the same two events. The lab row puts the dots ${r.labTimeGap.toFixed(3)} s apart; the block row puts them together.`,
          matters: 'It is exactly what your second guess asked about. The tutor will help you work out what to make of it.',
        },
        ...(guesses
          ? [
              {
                look: 'the white markers and the dots they point to.',
                means: 'Each marker shows the choice you made. They only show your guesses.',
                matters: 'They put what you expected next to what was found.',
              },
            ]
          : []),
      ]
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{pink ? 'How to read the two views at your speed.' : 'How to read the strip of event times.'}</strong>
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The strip</strong> is a time scale in seconds: further right means later. Time 0 is the moment the flash was
          released, the same event in both frames.{' '}
          {pink ? 'The scale runs to 1.2 s here (it ran to 0.5 s in Part 1) so that every speed fits.' : ''}
        </li>
        <li>
          <strong>The top row is the lab&rsquo;s clocks</strong> and <strong>the bottom row is the block&rsquo;s own clocks.</strong>{' '}
          Each dot is an event: the <strong>blue dot</strong> is the flash reaching the back end, and the{' '}
          <strong>purple dot</strong> is the flash reaching the front end. Where a dot sits is the time its clocks gave.
        </li>
        <li>
          <strong>The line with end caps</strong> between the two dots on the lab row is the <strong>gap</strong>: how much later one
          end was reached than the other, on the lab&rsquo;s clocks. Two dots on top of each other mean the gap is 0.
        </li>
        {pink ? (
          <li>
            <strong>The pink words</strong> give the speed you chose. They are the only pink on the drawing, and your guesses are not
            drawn here.
          </li>
        ) : (
          <li>
            <strong>The white markers</strong> are your guesses. They sit on the strip but do not move a dot. Each is only a marker: it
            has no size, it just points at the choice you made.
          </li>
        )}
      </ul>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>A worked moment, step by step</strong> (the block moving at {v}c, with the standing-still length{' '}
        {r.restLength.toFixed(3)} light-seconds).
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The block&rsquo;s own clocks.</strong> The flash starts in the middle, so each end is {halfRest} light-second away. The
          flash goes at c, so each end is reached at <strong>{`${halfRest} ÷ 1 = ${r.rodFrameEventTime.toFixed(3)} s`}</strong>.
        </li>
        {v === 0 ? (
          <li>
            <strong>The lab&rsquo;s clocks.</strong> The block is not moving, so the lab sees it at its rest length, {r.labLength.toFixed(3)}{' '}
            light-seconds, and each end is {halfLab} light-second from the middle. Neither end moves, so each end is reached at{' '}
            <strong>{`${halfLab} ÷ 1 = ${r.backEventLabTime.toFixed(3)} s`}</strong>, the same for both.
          </li>
        ) : (
          <>
            <li>
              <strong>The lab&rsquo;s clocks: the length.</strong> As seen from the lab the block is shorter, {labLength} light-seconds, so
              each end is {halfLab} light-second from the middle at the moment of the flash. But the ends are moving.
            </li>
            <li>
              <strong>The back end</strong> moves towards the flash, so the distance between them closes at c + {v}c = {round3(1 + v)}c:{' '}
              <strong>{`${halfLab} ÷ ${round3(1 + v)} = ${r.backEventLabTime.toFixed(3)} s`}</strong>.
            </li>
            <li>
              <strong>The front end</strong> runs away from the flash, so the distance closes at c − {v}c = {round3(1 - v)}c:{' '}
              <strong>{`${halfLab} ÷ ${round3(1 - v)} = ${r.frontEventLabTime.toFixed(3)} s`}</strong>.
            </li>
          </>
        )}
        <li>
          <strong>The gap.</strong> On the lab&rsquo;s clocks it is {r.frontEventLabTime.toFixed(3)} − {r.backEventLabTime.toFixed(3)} ={' '}
          <strong>{r.labTimeGap.toFixed(3)} s</strong>. On the block&rsquo;s own clocks it is 0.
        </li>
      </ol>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
    </CaptionBox>
  )
}
