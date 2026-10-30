import type { ReactNode } from 'react'
import { beforeGuessMarker, clockGuessYears, pictureOne, pictureThree, pictureTwo } from '../physics/timeTravel'
import { CaptionBlock } from './BlackHoleGrowthPictures'
import type { LookFor } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 2: Picture 1 (the trip and the two clocks), Picture 2 (the spacetime diagram of the tunnel and the closed path) and Picture 3 (the two numbers that decide
// it), with their captions. The wording is approved by the owner (2026-10-30, CLAUDE.md §28.1). Every number drawn or written here is read from the physics module
// (CLAUDE.md §9); this file only draws it. Colours: cyan is calculated here, pink is imagined for the question (the mouths, the trip, the tunnel, the traveller's loop), yellow is light (the
// outside run and the light cone), and white is always the learner's guess (CLAUDE.md §14). Nothing here shows a traveller, a machine or a portal (PROJECT.md §9).

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CYAN = '#22d3ee'
const PINK = '#f472b6'
const YELLOW = '#facc15'
const YOURS_COLOR = '#ffffff'

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const n1 = (x: number) => x.toFixed(1)
const num = (x: number) => String(Number(x.toFixed(3)))

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor} stroke="#0b1020" strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size + 3}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

// The white box that holds the learner's guess, joined to the guess mark by a line (CLAUDE.md §14).
function GuessBox({ x, y, w, lines, fromX, fromY }: { x: number; y: number; w: number; lines: string[]; fromX: number; fromY: number }) {
  const h = 14 + lines.length * 13
  return (
    <g>
      <line x1={fromX} y1={fromY} x2={x + w / 2} y2={fromY < y ? y : y + h} stroke={YOURS_COLOR} strokeWidth={2} />
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
      <SvgLines x={x + w / 2} y={y + 16} lines={lines} fill={YOURS_COLOR} bold size={10} anchor="middle" />
    </g>
  )
}

function Arrowheads({ id }: { id: string }) {
  return (
    <defs>
      <marker id={`${id}-pink`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill={PINK} />
      </marker>
      <marker id={`${id}-yellow`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill={YELLOW} />
      </marker>
      <marker id={`${id}-white`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill={YOURS_COLOR} />
      </marker>
    </defs>
  )
}

// ---- Picture 1: the trip and the two clocks ----
const P1_W = 760
const P1_H = 450

export function PictureOne({ stage, clockGuess }: { stage: number; clockGuess: string | null }) {
  const pic = pictureOne()
  // Panel A: distance along a line, 120 px per light-year, A at x = 60.
  const ax = (ly: number) => 60 + 120 * ly
  // Panel B: years counted, 55 px per year, from x = 100.
  const by = (years: number) => 100 + 55 * years
  const guessYears = clockGuess === null ? null : clockGuessYears(clockGuess)
  const guessX = guessYears === null ? 0 : by(guessYears)
  const boxW = 190
  const boxX = Math.min(Math.max(guessX - boxW / 2, 20), P1_W - boxW - 20)
  return (
    <svg viewBox={`0 0 ${P1_W} ${P1_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 1: two wormhole mouths, one sent out and back, and the years each clock counted">
      <Arrowheads id="t1" />
      <SvgLines x={20} y={24} lines={['A. Where the two mouths are (distance in light-years)']} fill={TEXT_COLOR} size={12} bold />

      {/* the ruler of distance */}
      <line x1={ax(0)} y1={150} x2={ax(5)} y2={150} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4, 5].map((ly) => (
        <g key={ly}>
          <line x1={ax(ly)} y1={145} x2={ax(ly)} y2={155} stroke={MUTED_COLOR} />
          <SvgLines x={ax(ly)} y={168} lines={[String(ly)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={ax(5) + 14} y={154} lines={['light-years']} fill={MUTED_COLOR} size={10} />

      {/* mouth A, and mouth B as it starts: side by side, with their clocks equal */}
      <circle cx={ax(0)} cy={100} r={12} fill={PINK} fillOpacity={0.3} stroke={PINK} strokeWidth={2} />
      <SvgLines x={ax(0)} y={78} lines={['A']} fill={PINK} size={12} bold anchor="middle" />
      {stage < 2 ? (
        <>
          <circle cx={ax(0)} cy={100} r={21} fill="none" stroke={PINK} strokeWidth={1.5} strokeDasharray="4 3" />
          <SvgLines x={ax(0) + 34} y={92} lines={['B starts here too: the mouths begin side by side']} fill={PINK} size={10} />
          <SvgLines x={ax(0) + 34} y={110} lines={['Both clocks read 0 years. Each one only ever ticks forward.']} fill={TEXT_COLOR} size={10} />
        </>
      ) : (
        <>
          {/* the trip: out, turn round, back, stop */}
          <line x1={ax(0) + 14} y1={92} x2={ax(pic.farthestLy)} y2={92} stroke={PINK} strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#t1-pink)" />
          <line x1={ax(pic.farthestLy)} y1={108} x2={ax(pic.separationLy) + 14} y2={108} stroke={PINK} strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#t1-pink)" />
          <SvgLines x={(ax(0) + ax(pic.farthestLy)) / 2} y={60} lines={[`out at ${pic.speed} c: ${n1(pic.outYears)} years`]} fill={PINK} size={10} anchor="middle" />
          <SvgLines x={ax(pic.farthestLy) + 12} y={100} lines={[`turns round at ${n1(pic.farthestLy)} light-years`]} fill={PINK} size={10} />
          <SvgLines x={(ax(pic.separationLy) + ax(pic.farthestLy)) / 2} y={128} lines={[`back: ${n1(pic.tripYears - pic.outYears)} years`]} fill={PINK} size={10} anchor="middle" />
          <circle cx={ax(pic.separationLy)} cy={100} r={12} fill={PINK} fillOpacity={0.3} stroke={PINK} strokeWidth={2} />
          <SvgLines x={ax(pic.separationLy)} y={78} lines={['B']} fill={PINK} size={12} bold anchor="middle" />
          <line x1={ax(pic.separationLy)} y1={112} x2={ax(pic.separationLy)} y2={145} stroke={PINK} strokeWidth={1} strokeDasharray="2 3" />
          <SvgLines x={ax(pic.separationLy) + 6} y={185} lines={[`B stops ${pic.separationLy} light-year from A`]} fill={PINK} size={10} />
        </>
      )}

      {/* panel B: the years each clock counted */}
      {stage >= 2 && (
        <g>
          <line x1={20} y1={205} x2={P1_W - 20} y2={205} stroke="#334155" />
          <SvgLines x={20} y={228} lines={['B. What each clock counted (years)']} fill={TEXT_COLOR} size={12} bold />
          <rect x={by(0)} y={248} width={by(pic.stayAtHomeYears) - by(0)} height={28} fill={CYAN} fillOpacity={0.35} stroke={CYAN} strokeWidth={1.5} />
          <SvgLines x={by(0) + 8} y={267} lines={[`A’s clock: ${num(pic.stayAtHomeYears)} years (it stayed put)`]} fill={TEXT_COLOR} size={11} bold />
          <rect x={by(0)} y={296} width={by(pic.movingYears) - by(0)} height={28} fill={CYAN} fillOpacity={0.35} stroke={CYAN} strokeWidth={1.5} />
          <SvgLines x={by(0) + 8} y={315} lines={[`B’s clock: ${num(pic.movingYears)} years (it made the trip)`]} fill={TEXT_COLOR} size={11} bold />
          <rect x={by(pic.movingYears)} y={296} width={by(pic.stayAtHomeYears) - by(pic.movingYears)} height={28} fill="none" stroke={CYAN} strokeWidth={1.5} strokeDasharray="5 4" />
          <SvgLines x={(by(pic.movingYears) + by(pic.stayAtHomeYears)) / 2} y={315} lines={[`offset: ${num(pic.offsetYears)} years`]} fill={CYAN} size={11} bold anchor="middle" />
          <line x1={by(0)} y1={338} x2={by(10)} y2={338} stroke={MUTED_COLOR} strokeWidth={1.5} />
          {[0, 2, 4, 6, 8, 10].map((y) => (
            <g key={y}>
              <line x1={by(y)} y1={333} x2={by(y)} y2={343} stroke={MUTED_COLOR} />
              <SvgLines x={by(y)} y={357} lines={[String(y)]} fill={MUTED_COLOR} size={10} anchor="middle" />
            </g>
          ))}
          <SvgLines x={by(10) + 14} y={342} lines={['years']} fill={MUTED_COLOR} size={10} />
          {guessYears !== null && (
            <g>
              <line x1={guessX} y1={290} x2={guessX} y2={330} stroke={YOURS_COLOR} strokeWidth={4} />
              <GuessBox x={boxX} y={372} w={boxW} lines={['YOUR GUESS (Prediction 1):', `B’s clock says ${guessYears} years`]} fromX={guessX} fromY={330} />
            </g>
          )}
        </g>
      )}
    </svg>
  )
}

export function pictureOneCaption(stage: number): ReactNode {
  const pic = pictureOne()
  const k = pic.movingYears / pic.tripYears
  const lookFor: LookFor[] =
    stage >= 2
      ? [
          {
            look: 'the two cyan bars in panel B, and the dashed gap between their ends.',
            means: `mouth B’s own clock counted ${num(pic.movingYears)} years while mouth A’s counted ${num(pic.stayAtHomeYears)}. The gap, ${num(pic.offsetYears)} years, is the offset between the two clocks.`,
            matters: 'a clock that moved fast counted less time. This is the same arithmetic as the twin paradox (Experiment 10 of the first chapter), and the same kind of difference that real clocks on aircraft and satellites show. The two mouths’ clocks no longer agree, and the rest of the experiment depends on that.',
          },
          {
            look: 'the pink dashed arrows in panel A, and where mouth B stops.',
            means: `B travelled out to ${n1(pic.farthestLy)} light-years and back, yet it stops only ${pic.separationLy} light-year from A.`,
            matters: `the long trip is what built up the offset, but the mouths end up close together outside the tunnel. How close they are compared with the offset is what Pictures 2 and 3 are about.`,
          },
        ]
      : []
  return (
    <CaptionBlock
      title="Picture 1"
      intro="Panel A is a map of where the two mouths are along a line, with distance in light-years (a light-year is the distance light travels in one year, so light takes one year to cross it). It is not drawn to show the tunnel. Panel B, which appears at stage 2, shows how many years each mouth’s own clock counted."
      bullets={[
        <>
          <strong>The pink circles</strong> are the two mouths of a wormhole, A and B. Pink means imagined for the question: no wormhole has been seen. At the start the mouths are side by side and their clocks both read 0 years.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>The pink dashed arrows</strong> are the trip of mouth B. It goes out, turns round and comes back, at {pic.speed} c the whole way (that is {pic.speed * 100} percent of light’s speed). By A’s clock the trip takes {pic.tripYears} years. The turning round
                itself is left out of the model.
              </>,
              <>
                <strong>The cyan bars</strong> in panel B are the years counted by each clock. The top bar is A’s clock and the bottom bar is B’s. <strong>The dashed outline</strong> is the part of A’s count that B’s clock did not reach: the offset. A longer bar means a
                clock that counted more years.
              </>,
              <>
                <strong>The white mark and box</strong> are your Prediction 1 guess: the white line stands on B’s bar at the number of years you chose. It shows your guess only; it does not change the bars.
              </>,
            ]
          : []),
      ]}
      worked={
        stage >= 2 ? (
          <>
            At {pic.speed} c, the factor k = √(1 − {pic.speed}²) = √{num(1 - pic.speed * pic.speed)} = {num(k)}. While A’s clock counts {pic.tripYears} years, B’s counts {pic.tripYears} × {num(k)} = {num(pic.movingYears)} years. The offset is {pic.tripYears} − {num(pic.movingYears)} = {num(pic.offsetYears)} years.
          </>
        ) : null
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> the general fact that a moving clock counts less time, which has been seen with real clocks flown on aircraft and carried on satellites (NASA Space Place). <strong>Calculated here:</strong> the years each clock counts and the offset, from the
          twin arithmetic of Experiment 10. <strong>Imagined for the question:</strong> the wormhole mouths and the trip of mouth B; no wormhole has been seen.
        </>
      }
    />
  )
}

// ---- Picture 2: the spacetime diagram of the tunnel and the closed path ----
const P2_W = 760
const P2_H = 630
const P2_S = 90 // px per light-year across and per year up, the same, so that light is at 45 degrees
const P2_X0 = 300 // position 0 (mouth A)
const P2_Y0 = 575 // time 0

export function PictureTwo({ stage, beforeGuess }: { stage: number; beforeGuess: string | null }) {
  const pic = pictureTwo()
  const px = (ly: number) => P2_X0 + P2_S * ly
  const py = (years: number) => P2_Y0 - P2_S * years
  const guess = beforeGuess === null ? null : beforeGuessMarker(beforeGuess)
  const topY = py(6)
  const coneTop = 6
  const guessArrowX = 530
  return (
    <svg viewBox={`0 0 ${P2_W} ${P2_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 2: a spacetime diagram of the two mouths, the tunnel link and the path outside">
      <Arrowheads id="t2" />
      <defs>
        <clipPath id="t2-clip">
          <rect x={72} y={topY - 12} width={P2_W - 80} height={P2_Y0 - topY + 12} />
        </clipPath>
      </defs>
      {/* the axes */}
      <line x1={72} y1={P2_Y0} x2={P2_W - 10} y2={P2_Y0} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={72} y1={topY - 12} x2={72} y2={P2_Y0} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4, 5, 6].map((t) => (
        <g key={t}>
          <line x1={68} y1={py(t)} x2={76} y2={py(t)} stroke={MUTED_COLOR} />
          <line x1={76} y1={py(t)} x2={P2_W - 10} y2={py(t)} stroke="#1e293b" />
          <SvgLines x={62} y={py(t) + 4} lines={[String(t)]} fill={MUTED_COLOR} size={10} anchor="end" />
        </g>
      ))}
      {[-2, -1, 0, 1, 2, 3, 4].map((ly) => (
        <g key={ly}>
          <line x1={px(ly)} y1={P2_Y0 - 4} x2={px(ly)} y2={P2_Y0 + 4} stroke={MUTED_COLOR} />
          <SvgLines x={px(ly)} y={P2_Y0 + 18} lines={[String(ly)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={P2_W - 12} y={P2_Y0 + 18} lines={['position (light-years)']} fill={MUTED_COLOR} size={10} anchor="end" />
      <SvgLines x={14} y={topY - 20} lines={['time (years on A’s clock)']} fill={MUTED_COLOR} size={10} />

      <g clipPath="url(#t2-clip)">
        {/* the light cone of the exit event, drawn only once the path is drawn (stage 4) */}
        {stage >= 4 && (
          <g>
            <polygon points={`${px(0)},${py(pic.exit.time)} ${px(-(coneTop - pic.exit.time))},${py(coneTop)} ${px(coneTop - pic.exit.time)},${py(coneTop)}`} fill={YELLOW} fillOpacity={0.09} />
            <line x1={px(0)} y1={py(pic.exit.time)} x2={px(-(coneTop - pic.exit.time))} y2={py(coneTop)} stroke={YELLOW} strokeWidth={1.2} strokeDasharray="6 4" />
            <line x1={px(0)} y1={py(pic.exit.time)} x2={px(coneTop - pic.exit.time)} y2={py(coneTop)} stroke={YELLOW} strokeWidth={1.2} strokeDasharray="6 4" />
          </g>
        )}
        {/* the two mouths, each at rest: a vertical line */}
        <line x1={px(0)} y1={P2_Y0} x2={px(0)} y2={topY} stroke={CYAN} strokeWidth={3} />
        <line x1={px(pic.separationLy)} y1={P2_Y0} x2={px(pic.separationLy)} y2={topY} stroke={CYAN} strokeWidth={3} />
        {/* the traveller's loop (stage 4): wait at B from the arrival to the entry */}
        {stage >= 4 && <line x1={px(pic.separationLy)} y1={py(pic.arrival.time)} x2={px(pic.separationLy)} y2={py(pic.entry.time)} stroke={PINK} strokeWidth={6} strokeOpacity={0.8} />}
        {/* the tunnel link: from the entry at B to the exit at A */}
        <line x1={px(pic.entry.position)} y1={py(pic.entry.time)} x2={px(pic.exit.position) + 6} y2={py(pic.exit.time) - 8} stroke={PINK} strokeWidth={2.5} strokeDasharray="7 5" markerEnd="url(#t2-pink)" />
        {/* the run outside at the speed of light, from the exit to B */}
        {stage >= 4 && <line x1={px(pic.exit.position)} y1={py(pic.exit.time)} x2={px(pic.arrival.position) - 6} y2={py(pic.arrival.time) + 6} stroke={YELLOW} strokeWidth={3} markerEnd="url(#t2-yellow)" />}
      </g>

      <SvgLines x={px(0)} y={topY - 16} lines={['mouth A']} fill={CYAN} size={12} bold anchor="middle" />
      <SvgLines x={px(pic.separationLy)} y={topY - 16} lines={['mouth B']} fill={CYAN} size={12} bold anchor="middle" />

      {/* the events */}
      <circle cx={px(pic.entry.position)} cy={py(pic.entry.time)} r={6} fill={PINK} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={px(pic.entry.position) + 12} y={py(pic.entry.time) - 8} lines={[`entry: steps into B (A’s clock: ${num(pic.entry.time)} years)`]} fill={PINK} size={10} bold />
      <circle cx={px(pic.exit.position)} cy={py(pic.exit.time)} r={6} fill={PINK} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={px(pic.exit.position) - 12} y={py(pic.exit.time) + 16} lines={[`exit: steps out of A (A’s clock: ${num(pic.exit.time)} year)`]} fill={PINK} size={10} bold anchor="end" />
      <SvgLines x={190} y={py((pic.entry.time + pic.exit.time) / 2) - 6} lines={['the tunnel link: it joins equal clock readings,', `so it comes out ${num(pic.offsetYears)} years earlier`]} fill={PINK} size={10} anchor="middle" />
      <line x1={250} y1={py((pic.entry.time + pic.exit.time) / 2) + 18} x2={px(0.5) - 4} y2={py((pic.entry.time + pic.exit.time) / 2)} stroke={PINK} strokeWidth={1} strokeDasharray="2 3" />

      {stage >= 4 && (
        <g>
          <circle cx={px(pic.arrival.position)} cy={py(pic.arrival.time)} r={6} fill={YELLOW} stroke="#0b1020" strokeWidth={1.5} />
          <SvgLines x={px(pic.arrival.position) + 12} y={py(pic.arrival.time) + 18} lines={[`arrival: back at B (A’s clock: ${num(pic.arrival.time)} years)`]} fill={YELLOW} size={10} bold />
          <SvgLines x={px(0.5)} y={py((pic.exit.time + pic.arrival.time) / 2) + 24} lines={['outside, at the speed of light']} fill={YELLOW} size={10} anchor="middle" />
          {/* the time between the arrival and the entry */}
          <line x1={px(pic.separationLy) + 30} y1={py(pic.entry.time) + 4} x2={px(pic.separationLy) + 30} y2={py(pic.arrival.time) - 4} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <line x1={px(pic.separationLy) + 25} y1={py(pic.entry.time) + 4} x2={px(pic.separationLy) + 35} y2={py(pic.entry.time) + 4} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <line x1={px(pic.separationLy) + 25} y1={py(pic.arrival.time) - 4} x2={px(pic.separationLy) + 35} y2={py(pic.arrival.time) - 4} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <SvgLines x={px(pic.separationLy) + 42} y={py((pic.entry.time + pic.arrival.time) / 2)} lines={[`${num(pic.timeGainedYears)} years between`, 'the arrival and the entry']} fill={TEXT_COLOR} size={10} />
          <SvgLines x={px(-1.2)} y={py(5.6)} lines={['pale yellow: the light cone of the exit', '(where light or slower could reach)']} fill={YELLOW} size={10} anchor="middle" />
          <SvgLines x={px(pic.separationLy) - 8} y={py(3.2)} lines={['wait at B']} fill={PINK} size={10} anchor="end" />
        </g>
      )}

      {/* the guess: a marker only (a yes or no has no size), once the entry and the arrival are drawn */}
      {stage >= 4 && guess !== null && (
        <g>
          <line x1={guessArrowX} y1={py(pic.entry.time) + (guess.before ? 14 : 60)} x2={guessArrowX} y2={py(pic.entry.time) + (guess.before ? 60 : 14)} stroke={YOURS_COLOR} strokeWidth={5} markerEnd="url(#t2-white)" />
          <SvgLines x={guessArrowX - 26} y={py(pic.entry.time) + 42} lines={[guess.before ? 'before' : 'after']} fill={YOURS_COLOR} size={11} bold anchor="end" />
          <GuessBox
            x={560}
            y={py(pic.entry.time) + 76}
            w={190}
            lines={['YOUR GUESS (Prediction 2):', guess.before ? 'they get back BEFORE' : 'they get back AFTER', 'they left (a marker only)']}
            fromX={guessArrowX}
            fromY={py(pic.entry.time) + 60}
          />
        </g>
      )}
    </svg>
  )
}

export function pictureTwoCaption(stage: number): ReactNode {
  const pic = pictureTwo()
  const exitClockB = pic.entry.time - pic.offsetYears
  const lookFor: LookFor[] = [
    {
      look: 'the pink dashed arrow that goes down from the entry dot on mouth B to the exit dot on mouth A.',
      means: `stepping into B when A’s clock reads ${num(pic.entry.time)} years leads out of A when A’s clock reads ${num(pic.exit.time)} year: ${num(pic.offsetYears)} years earlier, the size of the offset in Picture 1.`,
      matters: 'ordinary travel always goes upward in this diagram. The tunnel is the only thing here that goes downward, and it does so because the two mouths’ clocks differ.',
    },
    ...(stage >= 4
      ? [
          {
            look: `the two dots on mouth B’s line: the entry (${num(pic.entry.time)} years) and the arrival (${num(pic.arrival.time)} years).`,
            means: `the traveller gets back to mouth B when A’s clock reads ${num(pic.arrival.time)} years, which is ${num(pic.timeGainedYears)} years before they stepped in at ${num(pic.entry.time)} years.`,
            matters: 'a path that returns to its own starting place at an earlier moment is a closed timelike curve. In this model one exists. It would need a wormhole, which no one has seen.',
          },
          {
            look: 'the entry dot inside the pale yellow cone.',
            means: 'the entry is in the future of the exit, so reaching it from the exit needs nothing faster than light: the traveller only has to wait at B.',
            matters: 'the loop is made only of steps that go forward in the traveller’s own time (the run outside, the wait at B) and one jump through the tunnel. No step breaks the speed limit.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBlock
      title="Picture 2"
      intro="This is a spacetime diagram, a map of places and moments together (you met it in the Spacetime Geometry chapter). Along the bottom is position, in light-years. Up the side is time, in years on A’s clock. Both mouths are now at rest, so each is a straight vertical line: it stays in one place while time goes up. One light-year across and one year up are drawn the same length, so light is a line at 45 degrees."
      bullets={[
        <>
          <strong>The two cyan vertical lines</strong> are mouth A (at position 0) and mouth B (at 1 light-year). Two dots at the same height are at the same moment on A’s clock.
        </>,
        <>
          <strong>The pink dashed arrow</strong> is the tunnel. It joins moments at which the two mouths’ own clocks show the same reading. B’s clock is behind A’s by the offset of {num(pic.offsetYears)} years, so when A’s clock reads {num(pic.entry.time)} years, B’s reads {num(pic.entry.time)} −{' '}
          {num(pic.offsetYears)} = {num(exitClockB)} year. The tunnel therefore joins the entry at B (A’s clock {num(pic.entry.time)}) to the exit at A (A’s clock {num(pic.exit.time)}).
        </>,
        ...(stage >= 4
          ? [
              <>
                <strong>The yellow line</strong> is a run outside the tunnel, from the exit at A to mouth B, at the speed of light (the fastest possible). It crosses {pic.separationLy} light-year, so it takes {pic.separationLy} year. <strong>The thick pink bar</strong> on mouth B is the traveller waiting there. Together with
                the tunnel, these make a loop.
              </>,
              <>
                <strong>The pale yellow triangle</strong> is the future light cone of the exit event: every event that light, or anything slower, could reach from there. Its dashed edges are light going left and right.
              </>,
              <>
                <strong>The white arrow and box</strong> are your Prediction 2 guess. A yes or no has no size, so this is only a marker: the arrow points down for “before” and up for “after”, and its length means nothing.
              </>,
            ]
          : []),
      ]}
      worked={
        stage >= 4 ? (
          <>
            Step into B when A’s clock reads {num(pic.entry.time)} years. The tunnel puts you out of A when it reads {num(pic.entry.time)} − {num(pic.offsetYears)} = {num(pic.exit.time)} year. Run outside at the speed of light for {pic.separationLy} light-year: {num(pic.exit.time)} + {pic.separationLy} = {num(pic.arrival.time)} years on A’s
            clock. That is {num(pic.entry.time)} − {num(pic.arrival.time)} = {num(pic.timeGainedYears)} years before you stepped in. At best, since you cannot run faster than light.
          </>
        ) : null
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> nothing here. No wormhole and no closed path in time have ever been seen. <strong>Calculated here:</strong> the moments of the entry, the exit and the arrival, from the offset, the separation and the rule that the tunnel joins equal clock readings, and the light cone, from Spacetime Geometry 2.
          <strong> Imagined for the question:</strong> the wormhole, the tunnel and the traveller’s loop. The tunnel’s rule is a model from the mathematics, not an observation.
        </>
      }
    />
  )
}

// ---- Picture 3: the two numbers that decide it ----
const P3_W = 760
const P3_H = 310

export function PictureThree() {
  const pic = pictureThree()
  const x = (years: number) => 130 + 100 * years
  return (
    <svg viewBox={`0 0 ${P3_W} ${P3_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 3: the offset between the clocks against the light-travel time outside">
      <SvgLines x={20} y={24} lines={['The two numbers that decide it (years)']} fill={TEXT_COLOR} size={12} bold />
      <rect x={x(0)} y={52} width={x(pic.offsetYears) - x(0)} height={34} fill={CYAN} fillOpacity={0.35} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={x(0) + 8} y={74} lines={[`gap between the clocks (offset): ${num(pic.offsetYears)} years`]} fill={TEXT_COLOR} size={11} bold />
      <rect x={x(0)} y={108} width={x(pic.lightTravelYears) - x(0)} height={34} fill={YELLOW} fillOpacity={0.3} stroke={YELLOW} strokeWidth={1.5} />
      <SvgLines x={x(pic.lightTravelYears) + 10} y={130} lines={[`light-travel time outside: ${num(pic.lightTravelYears)} year`]} fill={TEXT_COLOR} size={11} bold />
      {pic.closed && (
        <g>
          <line x1={x(pic.lightTravelYears)} y1={150} x2={x(pic.lightTravelYears)} y2={182} stroke={CYAN} strokeDasharray="3 3" />
          <line x1={x(pic.offsetYears)} y1={90} x2={x(pic.offsetYears)} y2={182} stroke={CYAN} strokeDasharray="3 3" />
          <line x1={x(pic.lightTravelYears)} y1={178} x2={x(pic.offsetYears)} y2={178} stroke={CYAN} strokeWidth={2.5} />
          <SvgLines x={(x(pic.lightTravelYears) + x(pic.offsetYears)) / 2} y={198} lines={[`the offset is longer by ${num(pic.timeGainedYears)} years`]} fill={CYAN} size={11} bold anchor="middle" />
        </g>
      )}
      <line x1={x(0)} y1={235} x2={x(5)} y2={235} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4, 5].map((y) => (
        <g key={y}>
          <line x1={x(y)} y1={230} x2={x(y)} y2={240} stroke={MUTED_COLOR} />
          <SvgLines x={x(y)} y={254} lines={[String(y)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={x(5) + 14} y={239} lines={['years']} fill={MUTED_COLOR} size={10} />
    </svg>
  )
}

export function pictureThreeCaption(): ReactNode {
  const pic = pictureThree()
  const lookFor: LookFor[] = [
    {
      look: 'the cyan bar and the yellow bar, and which one is longer.',
      means: `the gap between the clocks, ${num(pic.offsetYears)} years, is longer than the time light needs to cross between the mouths outside, ${num(pic.lightTravelYears)} year, by ${num(pic.timeGainedYears)} years.`,
      matters: 'in this model, a closed path exists exactly when the cyan bar is longer than the yellow one. Under “Now try it yourself” you can change the speed and the separation and watch the two bars change.',
    },
  ]
  return (
    <CaptionBlock
      title="Picture 3"
      intro="Two bars compare the two numbers on which Picture 2 depends. Both are in years, on the same ruler."
      bullets={[
        <>
          <strong>The cyan bar</strong> is the offset between the two mouths’ clocks, from Picture 1. <strong>The yellow bar</strong> is the light-travel time between the mouths outside the tunnel: how long light takes to cross the {pic.lightTravelYears} light-year between them.
        </>,
        <>
          <strong>The cyan bracket</strong> is how much longer the offset is than the light-travel time. It is the time gained: how many years before the entry the traveller arrives, at best.
        </>,
      ]}
      worked={
        <>
          The offset is {num(pic.offsetYears)} years. Light needs {num(pic.lightTravelYears)} year to cross. {num(pic.offsetYears)} − {num(pic.lightTravelYears)} = {num(pic.timeGainedYears)} years: the traveller arrives {num(pic.timeGainedYears)} years before stepping in, as in Picture 2.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> nothing here. <strong>Calculated here:</strong> both bars and the bracket, from Picture 1 and the separation. <strong>Imagined for the question:</strong> the wormhole; the comparison only means something if a tunnel like this could exist, and none has been seen.
        </>
      }
    />
  )
}
