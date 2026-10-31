import type { ReactNode } from 'react'
import {
  MOUNT_BETA,
  MOUNT_COUNT_SEA_PER_HOUR,
  MOUNT_COUNT_TOP_PER_HOUR,
  MOUNT_HEIGHT_M,
  REST_LIFETIME_US,
  RING_MEASURED_TAU_MINUS_GIVE_OR_TAKE_US,
  RING_MEASURED_TAU_MINUS_US,
  RING_MEASURED_TAU_PLUS_GIVE_OR_TAKE_US,
  RING_MEASURED_TAU_PLUS_US,
  flightTimeInLifetimes,
  flightTimeUs,
  lifetimeGuessValueUs,
  mountCountedShare,
  mountModelEverydayShare,
  mountModelSlowClockShare,
  mountPictureThree,
  ringBeta,
  ringPredictedLifetimeUs,
  shareAfterLifetimes,
  shareGuessValue,
} from '../physics/muonLifetime'
import { CaptionBlock } from './BlackHoleGrowthPictures'
import type { LookFor } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 4: Picture 1 (the decay clock at rest, and the fall from Mount Washington), Picture 2 (the ring) and Picture 3 (the same fall as a muon would describe it),
// with their captions. The wording is Claude's DRAFT of 2026-10-31, for the owner's approval (CLAUDE.md §28.1). Every number drawn or written here is read from the physics module (CLAUDE.md §9);
// this file only draws it (the pixel positions on the rulers are the only arithmetic done here). Colours: cyan is calculated here, green is measured, pink is imagined for the question, and white is
// always the learner's guess (CLAUDE.md §14). Nothing here names the factor by which a moving muon's lifetime is lengthened, or says why the numbers differ (CLAUDE.md §12): that is the tutor's.

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CYAN = '#22d3ee'
const PINK = '#f472b6'
const GREEN = '#4ade80'
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
const n2 = (x: number) => x.toFixed(2)
const n3 = (x: number) => x.toFixed(3)
const pct1 = (share: number) => (share * 100).toFixed(1)
const spaced = (x: number) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

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

// ---- Picture 1: the decay clock at rest, and the fall from the mountain ----
const P1_W = 760
const P1_H = 450
const GROUND_LABEL = 'the ground'

export function PictureOne({ stage, shareGuessId }: { stage: number; shareGuessId: string | null }) {
  const lifetimes = [0, 1, 2, 3]
  const rowLabels = ['at the start', `after 1 lifetime (${n1(REST_LIFETIME_US)} µs)`, `after 2 lifetimes (${n1(REST_LIFETIME_US * 2)} µs)`, `after 3 lifetimes (${n1(REST_LIFETIME_US * 3)} µs)`]
  const ax = (share: number) => 250 + 380 * share
  const bx = (percent: number) => 290 + 4.1 * percent
  const everyday = mountModelEverydayShare()
  const slow = mountModelSlowClockShare()
  const counted = mountCountedShare()
  const guess = shareGuessId === null ? null : shareGuessValue(shareGuessId)
  const guessX = guess === null ? 0 : bx(guess)
  const boxW = 230
  const boxX = Math.min(Math.max(guessX - boxW / 2, 20), P1_W - boxW - 20)
  return (
    <svg viewBox={`0 0 ${P1_W} ${P1_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 1: the share of muons still alive as time passes, and the fall of muons from the top of Mount Washington to sea level">
      <SvgLines x={20} y={24} lines={['A. A muon at rest: the share still alive (out of every 100 that start together)']} fill={TEXT_COLOR} size={12} bold />
      {lifetimes.map((k, i) => {
        const share = shareAfterLifetimes(k)
        const y = 40 + i * 28
        return (
          <g key={k}>
            <SvgLines x={20} y={y + 16} lines={[rowLabels[i]]} fill={MUTED_COLOR} size={11} />
            <rect x={ax(0)} y={y} width={ax(share) - ax(0)} height={22} fill={CYAN} fillOpacity={0.4} stroke={CYAN} strokeWidth={1.5} />
            <SvgLines x={ax(share) + 8} y={y + 16} lines={[`${n1(share * 100)} of every 100`]} fill={TEXT_COLOR} size={11} bold />
          </g>
        )
      })}
      {stage >= 2 && (
        <g>
          <line x1={20} y1={166} x2={P1_W - 20} y2={166} stroke="#334155" />
          <SvgLines x={20} y={190} lines={['B. The fall from the top of Mount Washington to a detector at sea level']} fill={TEXT_COLOR} size={12} bold />
          {/* the mountain, the fall and the detector */}
          <polygon points="30,330 110,250 190,330" fill={MUTED_COLOR} fillOpacity={0.25} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <SvgLines x={20} y={212} lines={[`Mount Washington, top: ${spaced(MOUNT_HEIGHT_M)} m`, 'above the sea-level detector']} fill={TEXT_COLOR} size={10} bold />
          <line x1={110} y1={258} x2={110} y2={382} stroke={PINK} strokeWidth={3} />
          <polygon points="104,376 116,376 110,388" fill={PINK} />
          <SvgLines x={120} y={360} lines={['an imagined muon,', `falling at ${MOUNT_BETA} c`]} fill={PINK} size={10} bold />
          <rect x={20} y={390} width={200} height={10} fill={MUTED_COLOR} fillOpacity={0.5} />
          <SvgLines x={20} y={418} lines={['sea-level detector']} fill={TEXT_COLOR} size={10} bold />
          {/* the share ruler */}
          <SvgLines x={290} y={214} lines={['share still alive at sea level, out of every 100 muons that pass the top']} fill={MUTED_COLOR} size={10} />
          <line x1={bx(0)} y1={300} x2={bx(100)} y2={300} stroke={MUTED_COLOR} strokeWidth={1.5} />
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={bx(v)} y1={295} x2={bx(v)} y2={305} stroke={MUTED_COLOR} />
              <SvgLines x={bx(v)} y={318} lines={[String(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
            </g>
          ))}
          {guess !== null && <line x1={guessX} y1={262} x2={guessX} y2={338} stroke={YOURS_COLOR} strokeWidth={5} />}
          <line x1={bx(everyday * 100)} y1={282} x2={bx(everyday * 100)} y2={300} stroke={CYAN} strokeWidth={3} />
          <SvgLines x={bx(everyday * 100) - 4} y={264} lines={['calculated, lifetime unchanged:', `${n1(everyday * 100)} of every 100`]} fill={CYAN} size={10} bold />
          {stage >= 3 && (
            <g>
              <line x1={bx(slow * 100)} y1={238} x2={bx(slow * 100)} y2={300} stroke={CYAN} strokeWidth={3} />
              <SvgLines x={bx(slow * 100) + 4} y={228} lines={['calculated, lifetime as special', `relativity gives it: ${n1(slow * 100)} of every 100`]} fill={CYAN} size={10} bold anchor="end" />
              <line x1={bx(counted * 100)} y1={300} x2={bx(counted * 100)} y2={332} stroke={GREEN} strokeWidth={3} />
              <SvgLines x={bx(counted * 100) + 4} y={352} lines={['measured (Frisch and Smith, 1962):', `${MOUNT_COUNT_SEA_PER_HOUR} of ${MOUNT_COUNT_TOP_PER_HOUR} counted = ${n1(counted * 100)} of every 100`]} fill={GREEN} size={10} bold anchor="end" />
            </g>
          )}
          {guess !== null && <GuessBox x={boxX} y={392} w={boxW} lines={['YOUR GUESS (Prediction 1):', `${guess} of every 100 still alive`]} fromX={guessX} fromY={338} />}
        </g>
      )}
    </svg>
  )
}

export function pictureOneCaption(stage: number): ReactNode {
  const everyday = mountModelEverydayShare()
  const slow = mountModelSlowClockShare()
  const counted = mountCountedShare()
  const view = mountPictureThree()
  const fallLifetimes = flightTimeInLifetimes(MOUNT_HEIGHT_M, MOUNT_BETA)
  const lookFor: LookFor[] =
    stage >= 2
      ? [
          {
            look: 'the four cyan bars in Part A, from the top bar to the bottom bar.',
            means: `each bar is shorter than the one above it. Every time ${n1(REST_LIFETIME_US)} µs pass, only about ${n1(shareAfterLifetimes(1) * 100)} of every 100 muons are left. So 100 muons become ${n1(shareAfterLifetimes(1) * 100)}, then ${n1(shareAfterLifetimes(2) * 100)}, then ${n1(shareAfterLifetimes(3) * 100)}.`,
            matters: `muons disappear quickly. The fall from the mountain takes about ${n2(fallLifetimes)} of these ${n1(REST_LIFETIME_US)} µs steps, so you would expect very few muons to be left at the bottom. That is the cyan mark you will look at next.`,
          },
          {
            look: 'the cyan mark with the label “calculated, lifetime unchanged”, just above the ruler in Part B.',
            means: `this is the answer if every falling muon lasted only ${n1(REST_LIFETIME_US)} µs on average, just like a muon sitting still. The answer is about ${n1(everyday * 100)} muons out of every 100.`,
            matters: 'this is the “ordinary” expectation. It gives you something to compare the real count against.',
          },
          ...(stage >= 3
            ? [
                {
                  look: 'the green mark below the ruler, labelled “measured”.',
                  means: `Frisch and Smith counted ${MOUNT_COUNT_TOP_PER_HOUR} muons an hour on the mountain top and ${MOUNT_COUNT_SEA_PER_HOUR} an hour at sea level. That is ${MOUNT_COUNT_SEA_PER_HOUR} ÷ ${MOUNT_COUNT_TOP_PER_HOUR} = ${n2(counted)}, so about ${n1(counted * 100)} muons out of every 100.`,
                  matters: 'this is the only mark that comes from real counting. The cyan marks are calculations. The green mark tells you what nature actually did.',
                },
                {
                  look: 'the second cyan mark, higher up, labelled “lifetime as special relativity gives it”.',
                  means: `this calculation uses a longer average lifetime, ${n1(view.ground.lifetimeUs)} µs instead of ${n1(REST_LIFETIME_US)} µs. The answer is about ${n1(slow * 100)} muons out of every 100.`,
                  matters: 'now there are two calculated answers and one counted answer. The page does not say which calculation matches the count, or why. The tutor does that, after you have looked at all three pictures.',
                },
              ]
            : []),
          ...guessNote(),
        ]
      : []
  return (
    <CaptionBlock
      title="Picture 1"
      intro="This picture has two parts. Part A is about muons sitting still. Part B appears at stage 2 and is about muons falling from the top of a mountain to sea level. In both parts the idea is the same: we start with 100 muons, and a longer bar, or a mark further to the right, means more of them are still alive."
      bullets={[
        <>
          <strong>A muon</strong> is a tiny particle that falls apart after a short time. It does not last exactly the same time every time. It is a bit like a party where, every hour, the same fraction of the guests go home. So we talk about an <strong>average lifetime</strong>. For a muon sitting still, it is {n1(REST_LIFETIME_US)} µs. A µs (microsecond) is one millionth of a second.
        </>,
        <>
          <strong>Part A, the four cyan bars.</strong> Each bar is a moment in time, and the label on its left says which moment. The top bar is the start (0 µs): all 100 muons are alive. The second bar is {n1(REST_LIFETIME_US)} µs later, the third is {n1(REST_LIFETIME_US * 2)} µs later and the fourth is {n1(REST_LIFETIME_US * 3)} µs later. The number at the end of each bar says how many of the 100 are still alive at that moment: {n1(shareAfterLifetimes(0) * 100)}, then {n1(shareAfterLifetimes(1) * 100)}, then {n1(shareAfterLifetimes(2) * 100)}, then {n1(shareAfterLifetimes(3) * 100)}. Cyan means “calculated here”.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>Part B, the sketch on the left.</strong> The grey mountain is {spaced(MOUNT_HEIGHT_M)} metres high. The grey bar at the bottom is the detector at sea level. The pink arrow is an imagined muon falling straight down at {MOUNT_BETA} c. Here c is the speed of light, so {MOUNT_BETA} c is {n1(MOUNT_BETA * 100)} percent of the speed of light. The sketch is not to scale. Pink means “imagined for the question”.
              </>,
              <>
                <strong>Part B, the ruler.</strong> It goes from 0 to 100 and shows how many muons, out of every 100 that pass the mountain top, are still alive when they reach sea level. A mark further to the right means more muons arrive. For example, a mark at 25 means 25 of the 100 muons arrive alive, and a mark at 75 means 75 of the 100 arrive alive.
              </>,
              <>
                <strong>The white mark and box.</strong> This is your Prediction 1 guess, drawn on the same ruler. It shows only your guess. It does not change anything else in the picture.
              </>,
            ]
          : []),
        ...(stage >= 3
          ? [
              <>
                <strong>The green mark</strong> is a real count. Green means “measured”. <strong>The second cyan mark</strong> is another calculation, like the first one but with a longer average lifetime.
              </>,
            ]
          : []),
      ]}
      worked={
        stage >= 2 ? (
          <>
            <strong>Step 1: how long is the fall?</strong> The mountain is {spaced(MOUNT_HEIGHT_M)} m high and the muon moves at {MOUNT_BETA} × 299 792 458 m/s. Distance ÷ speed gives {n2(flightTimeUs(MOUNT_HEIGHT_M, MOUNT_BETA))} µs.
            <br />
            <strong>Step 2: how many lifetimes is that?</strong> {n2(flightTimeUs(MOUNT_HEIGHT_M, MOUNT_BETA))} ÷ {n1(REST_LIFETIME_US)} = {n2(fallLifetimes)} lifetimes.
            <br />
            <strong>Step 3: how many are left?</strong> Each lifetime keeps {n3(shareAfterLifetimes(1))} of the muons. After {n2(fallLifetimes)} lifetimes, {n3(shareAfterLifetimes(1))} to the power {n2(fallLifetimes)} = {n3(everyday)}. That is {n1(everyday * 100)} of every 100. This is the first cyan mark.
            {stage >= 3 && (
              <>
                <br />
                <strong>Step 4: try the longer lifetime.</strong> With {n1(view.ground.lifetimeUs)} µs, the same fall is {n2(flightTimeUs(MOUNT_HEIGHT_M, MOUNT_BETA))} ÷ {n1(view.ground.lifetimeUs)} = {n2(flightTimeUs(MOUNT_HEIGHT_M, MOUNT_BETA) / view.ground.lifetimeUs)} lifetimes, and {n1(slow * 100)} of every 100 are left. This is the second cyan mark.
              </>
            )}
          </>
        ) : null
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> the bars in Part A, and the cyan marks in Part B. The calculation is simple: one muon falling at one steady speed, with the same chance of falling apart in every moment. Real muons are made at different heights, move at different speeds and slow down on the way.
          {stage >= 3 && (
            <>
              {' '}
              <strong>Measured:</strong> the counts of {MOUNT_COUNT_TOP_PER_HOUR} and {MOUNT_COUNT_SEA_PER_HOUR} muons an hour, by Frisch and Smith in 1962. The page has these figures from a published account of the paper, not from the paper itself. <strong>Imagined for the question:</strong> the steady fall of one muon at {MOUNT_BETA} c.
            </>
          )}
          {stage < 3 && (
            <>
              {' '}
              <strong>Imagined for the question:</strong> the steady fall of one muon at {MOUNT_BETA} c. <strong>Measured:</strong> nothing yet; the count comes at stage 3.
            </>
          )}
        </>
      }
    />
  )
}

// The "your guess" look-for item, shown once the ruler is drawn (every stage from 2).
function guessNote(): LookFor[] {
  return [
    {
      look: 'the white mark and the box labelled YOUR GUESS.',
      means: 'it is where your Prediction 1 guess sits on the same ruler as the real marks.',
      matters: 'seeing your guess on the ruler, beside the others, is the easiest way to compare it. The page does not mark it right or wrong; the tutor goes through each prediction later.',
    },
  ]
}

// ---- Picture 2: the ring ----
const P2_W = 760
const P2_H = 330

export function PictureTwo({ lifetimeGuessId }: { lifetimeGuessId: string | null }) {
  const calculated = ringPredictedLifetimeUs()
  const guess = lifetimeGuessId === null ? null : lifetimeGuessValueUs(lifetimeGuessId)
  const lx = (us: number) => 60 + (640 * Math.log10(us)) / Math.log10(300)
  const guessX = guess === null ? 0 : lx(guess)
  const boxW = 250
  const boxX = Math.min(Math.max(guessX - boxW / 2, 20), P2_W - boxW - 20)
  return (
    <svg viewBox={`0 0 ${P2_W} ${P2_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 2: the average lifetime of muons at rest and in the storage ring, on a ruler where each step multiplies the value">
      <SvgLines x={20} y={24} lines={['The average lifetime of a muon, in millionths of a second (µs), on a ruler where each step multiplies the value']} fill={TEXT_COLOR} size={12} bold />
      <line x1={lx(1)} y1={170} x2={lx(300)} y2={170} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[1, 2, 5, 10, 20, 50, 100, 200].map((v) => (
        <g key={v}>
          <line x1={lx(v)} y1={165} x2={lx(v)} y2={175} stroke={MUTED_COLOR} />
          <SvgLines x={lx(v)} y={189} lines={[String(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      {guess !== null && <line x1={guessX} y1={110} x2={guessX} y2={206} stroke={YOURS_COLOR} strokeWidth={6} />}
      <line x1={lx(REST_LIFETIME_US)} y1={130} x2={lx(REST_LIFETIME_US)} y2={170} stroke={GREEN} strokeWidth={3} />
      <SvgLines x={lx(REST_LIFETIME_US) - 4} y={96} lines={['at rest (measured, MuLan):', `${n2(REST_LIFETIME_US)} µs`]} fill={GREEN} size={10} bold />
      <line x1={lx(calculated)} y1={130} x2={lx(calculated)} y2={170} stroke={CYAN} strokeWidth={3} />
      <SvgLines x={lx(calculated) - 8} y={96} lines={['in the ring, calculated here:', `${n1(calculated)} µs`]} fill={CYAN} size={10} bold anchor="end" />
      <line x1={lx(RING_MEASURED_TAU_PLUS_US)} y1={170} x2={lx(RING_MEASURED_TAU_PLUS_US)} y2={206} stroke={GREEN} strokeWidth={3} />
      <line x1={lx(RING_MEASURED_TAU_MINUS_US)} y1={170} x2={lx(RING_MEASURED_TAU_MINUS_US)} y2={206} stroke={GREEN} strokeWidth={3} />
      <SvgLines
        x={lx(RING_MEASURED_TAU_PLUS_US) - 8}
        y={224}
        lines={['in the ring, measured (CERN, 1977):', `positive muons ${n2(RING_MEASURED_TAU_PLUS_US)} µs, give or take ${n2(RING_MEASURED_TAU_PLUS_GIVE_OR_TAKE_US)}`, `negative muons ${n2(RING_MEASURED_TAU_MINUS_US)} µs, give or take ${n2(RING_MEASURED_TAU_MINUS_GIVE_OR_TAKE_US)}`]}
        fill={GREEN}
        size={10}
        bold
        anchor="end"
      />
      {guess !== null && <GuessBox x={boxX} y={264} w={boxW} lines={['YOUR GUESS (Prediction 2):', `the muons in the ring last ${guess} µs`]} fromX={guessX} fromY={206} />}
    </svg>
  )
}

export function pictureTwoCaption(): ReactNode {
  const calculated = ringPredictedLifetimeUs()
  const lookFor: LookFor[] = [
    {
      look: `the green mark on the left, at ${n2(REST_LIFETIME_US)} µs.`,
      means: `this is how long a muon lasts on average when it is sitting still: ${n2(REST_LIFETIME_US)} µs. It is a measurement.`,
      matters: 'this is your starting point. Every other mark on the picture can be compared with it.',
    },
    {
      look: `the two green marks on the right, near ${n1(RING_MEASURED_TAU_PLUS_US)} µs.`,
      means: `these are the average lifetimes measured for muons going round the ring: ${n2(RING_MEASURED_TAU_PLUS_US)} µs for positive muons and ${n2(RING_MEASURED_TAU_MINUS_US)} µs for negative muons. They are about ${n1(RING_MEASURED_TAU_PLUS_US / REST_LIFETIME_US)} times the sitting-still value.`,
      matters: 'these are real measurements of muons moving very fast. Compare how far right they are from the left mark. That gap is what the experiment is asking about.',
    },
    {
      look: 'the cyan mark, right next to the two green marks.',
      means: `this is a calculation for the ring: ${n1(calculated)} µs. The two measured marks sit almost exactly on top of it.`,
      matters: 'a calculation and two measurements land in nearly the same place. The page does not say here how the calculation was made, or how close is “close”. The results give the numbers and the tutor explains.',
    },
    {
      look: 'the white mark and the box labelled YOUR GUESS.',
      means: 'this is where your Prediction 2 guess sits on the same ruler as the real marks.',
      matters: 'you can compare your guess with the real marks by eye. The page does not mark it right or wrong. The tutor goes through each prediction later.',
    },
  ]
  return (
    <CaptionBlock
      title="Picture 2"
      intro="This picture is one long ruler of times. A mark further to the right means a longer average lifetime for a muon. There are only a few marks, so you can see them all at once."
      bullets={[
        <>
          <strong>The unit.</strong> A µs (microsecond) is one millionth of a second. The numbers under the ruler are in µs.
        </>,
        <>
          <strong>The ruler is stretched on the left.</strong> The numbers under it go 1, 2, 5, 10, 20, 50, 100, 200. They are not evenly spaced. The gap from 1 to 10 is as wide as the gap from 10 to 100, because each step multiplies the number by 10 instead of adding 9 or 90. This lets {n1(REST_LIFETIME_US)} µs and {n1(RING_MEASURED_TAU_PLUS_US)} µs both fit on one picture. So do not judge sizes by the width of a gap.
        </>,
        <>
          <strong>Reading the marks from left to right, with numbers.</strong> First, the green mark at {n2(REST_LIFETIME_US)} µs: a muon sitting still. Then, much further right, the cyan mark at {n1(calculated)} µs and the two green marks at {n2(RING_MEASURED_TAU_PLUS_US)} and {n2(RING_MEASURED_TAU_MINUS_US)} µs: muons in the ring. The distance from {n2(REST_LIFETIME_US)} to about {n1(calculated)} is a jump of about {n1(calculated / REST_LIFETIME_US)} times.
        </>,
        <>
          <strong>The storage ring.</strong> At CERN, the European particle-physics laboratory, muons were kept going round a circular track in 1977, held in place by magnets. This let the scientists time them for as long as they lasted. The muons went round at {ringBeta().toFixed(5)} c, which is {(ringBeta() * 100).toFixed(2)} percent of the speed of light.
        </>,
        <>
          <strong>The green marks.</strong> The one on the left is a muon sitting still. The two on the right are the ring’s measured lifetimes, one for positive and one for negative muons. Green means “measured”. Each measurement has a small give-or-take of a few hundredths of a µs, too small to see on this ruler.
        </>,
        <>
          <strong>The cyan mark</strong> is the average lifetime in the ring, calculated here. Cyan means “calculated here”.
        </>,
        <>
          <strong>The white mark and box</strong> are your Prediction 2 guess. They show only your guess. They do not change anything else in the picture.
        </>,
      ]}
      worked={
        <>
          <strong>Step 1: how much longer is the ring’s lifetime?</strong> {n1(calculated)} ÷ {n2(REST_LIFETIME_US)} = {n1(calculated / REST_LIFETIME_US)}. So the calculated lifetime in the ring is about {n1(calculated / REST_LIFETIME_US)} times the sitting-still lifetime.
          <br />
          <strong>Step 2: compare with the measurements.</strong> The measured ring lifetimes are {n2(RING_MEASURED_TAU_PLUS_US)} µs and {n2(RING_MEASURED_TAU_MINUS_US)} µs. The calculation used the ring’s speed. The tutor goes through how.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> the sitting-still lifetime (the Particle Data Group’s average, mostly from the MuLan experiment) and the two ring lifetimes (Bailey and others, CERN, 1977; the page has these figures from the paper’s abstract, not from the whole paper). <strong>Calculated here:</strong> the lifetime in the ring, from the ring’s speed. <strong>Imagined for the question:</strong> nothing in this picture.
        </>
      }
    />
  )
}

// ---- Picture 3: the same fall in the muon's own view ----
const P3_W = 760
const P3_H = 350

export function PictureThree() {
  const pic = mountPictureThree()
  const rx = (m: number) => (300 * m) / MOUNT_HEIGHT_M
  const tx = (us: number) => (300 * us) / 25
  const rows = [
    { key: 'ground', y: 56, color: CYAN, title: 'The ground’s description (calculated here)', data: pic.ground, lifetimeLabel: `the muon’s lifetime, by the ground’s clocks: ${n1(pic.ground.lifetimeUs)} µs`, tripLabel: 'the trip, by the ground’s clocks' },
    { key: 'muon', y: 194, color: PINK, title: 'A muon’s own description (imagined for the question)', data: pic.muon, lifetimeLabel: `the muon’s lifetime, by its own clock: ${n1(pic.muon.lifetimeUs)} µs`, tripLabel: 'the trip, by the muon’s own clock' },
  ]
  return (
    <svg viewBox={`0 0 ${P3_W} ${P3_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 3: the same fall from Mount Washington described by the ground and as a muon with its own ruler and clock would describe it">
      <SvgLines x={20} y={24} lines={['The same fall, described twice']} fill={TEXT_COLOR} size={12} bold />
      {rows.map((row) => (
        <g key={row.key}>
          <SvgLines x={20} y={row.y} lines={[row.title]} fill={row.color} size={11} bold />
          <SvgLines x={20} y={row.y + 22} lines={['the road the muon travels']} fill={MUTED_COLOR} size={10} />
          <rect x={20} y={row.y + 28} width={rx(row.data.roadM)} height={18} fill={row.color} fillOpacity={0.4} stroke={row.color} strokeWidth={1.5} />
          <SvgLines x={20 + rx(row.data.roadM) + 8} y={row.y + 42} lines={[`${row.key === 'ground' ? spaced(row.data.roadM) : n1(row.data.roadM)} m`]} fill={TEXT_COLOR} size={11} bold />
          <SvgLines x={400} y={row.y + 22} lines={[row.tripLabel]} fill={MUTED_COLOR} size={10} />
          <rect x={400} y={row.y + 28} width={tx(row.data.tripUs)} height={18} fill={row.color} fillOpacity={0.4} stroke={row.color} strokeWidth={1.5} />
          <SvgLines x={400 + tx(row.data.tripUs) + 8} y={row.y + 42} lines={[`${n2(row.data.tripUs)} µs`]} fill={TEXT_COLOR} size={11} bold />
          <SvgLines x={400} y={row.y + 62} lines={[row.lifetimeLabel]} fill={MUTED_COLOR} size={10} />
          <rect x={400} y={row.y + 68} width={tx(row.data.lifetimeUs)} height={18} fill={row.color} fillOpacity={0.7} stroke={row.color} strokeWidth={1.5} />
          <SvgLines x={20} y={row.y + 86} lines={[`share still alive at sea level: ${pct1(row.data.share)} of every 100`]} fill={TEXT_COLOR} size={11} bold />
        </g>
      ))}
      <SvgLines x={20} y={P3_H - 22} lines={['Road bars use one scale (the long road is 1 917 m); time bars use another (the longest bar is 25 µs). The two descriptions are not two measurements.']} fill={MUTED_COLOR} size={10} />
    </svg>
  )
}

export function pictureThreeCaption(): ReactNode {
  const pic = mountPictureThree()
  const lookFor: LookFor[] = [
    {
      look: 'the two long bars on the left, the cyan one on top and the pink one below.',
      means: `these are the length of the road the muon travels, from the mountain top to sea level. The cyan bar is the road as the ground measures it: ${spaced(pic.ground.roadM)} m. The pink bar is the road as the muon would measure it: ${n1(pic.muon.roadM)} m.`,
      matters: 'the two descriptions give different lengths for the same fall. The page does not say which is “right”. Each is a length measured by one observer with their own ruler. The tutor explains why they differ.',
    },
    {
      look: 'the two short bars on the right in each row: the trip, and the lifetime below it.',
      means: `in the cyan row, the trip takes ${n2(pic.ground.tripUs)} µs and the muon lasts ${n1(pic.ground.lifetimeUs)} µs. In the pink row, the trip takes ${n2(pic.muon.tripUs)} µs and the muon lasts ${n1(pic.muon.lifetimeUs)} µs.`,
      matters: `in both rows the lifetime bar is ${n1(pic.ground.lifetimeUs / pic.ground.tripUs)} times as long as the trip bar. The times differ between the rows, but the comparison of the trip with the lifetime is the same.`,
    },
    {
      look: 'the line “share still alive at sea level” at the bottom of each row.',
      means: `both rows give the same answer: ${pct1(pic.ground.share)} muons out of every 100.`,
      matters: 'the two descriptions disagree about the road and about the times, yet they agree about how many muons arrive. Counting muons does not depend on whose ruler or clock you use. Everyone must get the same count.',
    },
  ]
  return (
    <CaptionBlock
      title="Picture 3"
      intro="This picture shows the same fall from Picture 1 twice. The top row is how the ground describes it. The bottom row is how a muon would describe it, if the muon had its own ruler and its own clock. Nobody can ride along with a muon, so the bottom row is imagined for the question. It is a different way of describing the same fall, not a second measurement."
      bullets={[
        <>
          <strong>The cyan row</strong> is the ground’s description. By the ground’s ruler and clocks, the muon travels {spaced(pic.ground.roadM)} metres in {n2(pic.ground.tripUs)} µs, and its average lifetime is {n1(pic.ground.lifetimeUs)} µs. Cyan means “calculated here”.
        </>,
        <>
          <strong>The pink row</strong> is the muon’s own description. By its own ruler and clock, the road is {n1(pic.muon.roadM)} metres long, the trip takes {n2(pic.muon.tripUs)} µs, and its average lifetime is {n1(pic.muon.lifetimeUs)} µs, the same as a muon sitting still. Pink means “imagined for the question”.
        </>,
        <>
          <strong>Each row has three bars.</strong> The long bar on the left is the road, in metres. The two bars on the right are times, in µs: the trip, and then the lifetime.
        </>,
        <>
          <strong>Two different scales.</strong> The road bars use one scale and the time bars use another. Compare road with road and time with time. Do not compare a road bar with a time bar.
        </>,
        <>
          <strong>No white mark</strong> is drawn on this picture. Your two guesses are on Pictures 1 and 2.
        </>,
      ]}
      worked={
        <>
          <strong>Step 1: the trip time in each row.</strong> Trip time = road ÷ speed, and the speed is {MOUNT_BETA} × 299 792 458 m/s in both rows. Cyan row: {spaced(pic.ground.roadM)} m ÷ that speed = {n2(pic.ground.tripUs)} µs. Pink row: {n1(pic.muon.roadM)} m ÷ that speed = {n2(pic.muon.tripUs)} µs.
          <br />
          <strong>Step 2: the trip as a fraction of the lifetime, in the pink row.</strong> The trip is {n2(pic.muon.tripUs)} µs and the lifetime is {n2(pic.muon.lifetimeUs)} µs. {n2(pic.muon.tripUs)} ÷ {n2(pic.muon.lifetimeUs)} = {n2(pic.muon.tripUs / pic.muon.lifetimeUs)} of a lifetime.
          <br />
          <strong>Step 3: the same in the cyan row.</strong> The trip is {n2(pic.ground.tripUs)} µs and the lifetime is {n1(pic.ground.lifetimeUs)} µs. {n2(pic.ground.tripUs)} ÷ {n1(pic.ground.lifetimeUs)} = {n2(pic.ground.tripUs / pic.ground.lifetimeUs)} of a lifetime. This is the same fraction as in Step 2.
          <br />
          <strong>Step 4: how many muons are left.</strong> Each lifetime keeps {n3(shareAfterLifetimes(1))} of the muons. After {n2(pic.muon.tripUs / pic.muon.lifetimeUs)} of a lifetime, {n3(shareAfterLifetimes(1))} to the power {n2(pic.muon.tripUs / pic.muon.lifetimeUs)} = {n3(pic.muon.share)}. That is {pct1(pic.muon.share)} of every 100, in both rows.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> every number in both rows. <strong>Imagined for the question:</strong> the pink row, a muon with a ruler and a clock of its own, and {GROUND_LABEL}’s steady fall at {MOUNT_BETA} c. <strong>Measured:</strong> nothing in this picture. The counts are in Picture 1.
        </>
      }
    />
  )
}
