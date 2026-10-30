import type { ReactNode } from 'react'
import { fizeauWorked, flashGuess, pionWorked, pictureOne, pictureThree, pictureTwo, speedGuessValue } from '../physics/addingSpeeds'
import type { TrialPicture } from '../physics/addingSpeeds'
import { CaptionBlock } from './BlackHoleGrowthPictures'
import type { LookFor } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 3: Picture 1 (the train, and the same two speeds near light), Picture 2 (light in moving water) and Picture 3 (the 1964 flash, and a flash sent from ships of
// different speeds), with their captions. The wording is Claude's DRAFT of 2026-10-30, for the owner's approval (CLAUDE.md §28.1). Every number drawn or written here is read from the physics module
// (CLAUDE.md §9); this file only draws it. Colours: cyan is calculated here (the everyday sum and the rule), pink is imagined for the question (the walker, the train, the spaceship and its probe,
// the ships of panel B), green is measured, yellow is light and the wall at c, and white is always the learner's guess (CLAUDE.md §14).

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CYAN = '#22d3ee'
const PINK = '#f472b6'
const GREEN = '#4ade80'
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
const n3 = (x: number) => x.toFixed(3)
const n5 = (x: number) => x.toFixed(5)
const num = (x: number) => String(Number(x.toFixed(3)))
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

// ---- Picture 1: the train, and the same two speeds near light ----
const P1_W = 760
const P1_H = 560

export function PictureOne({ stage, speedGuess }: { stage: number; speedGuess: string | null }) {
  const pic = pictureOne()
  // Panel A: metres per second, 26 px each, from x = 60.
  const ax = (v: number) => 60 + 26 * v
  // Panel B: speeds as a fraction of c, 520 px per c, from x = 100.
  const bx = (v: number) => 100 + 520 * v
  const guess = speedGuess === null ? null : speedGuessValue(speedGuess)
  const guessX = guess === null ? 0 : bx(guess)
  const boxW = 210
  const boxX = Math.min(Math.max(guessX - boxW / 2, 20), P1_W - boxW - 20)
  const t = pic.train
  return (
    <svg viewBox={`0 0 ${P1_W} ${P1_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 1: the everyday sum on a train, and the same kind of sum for a spaceship and its probe">
      <SvgLines x={20} y={24} lines={['A. A walker on a train (speeds in metres per second)']} fill={TEXT_COLOR} size={12} bold />
      <line x1={ax(0)} y1={150} x2={ax(25)} y2={150} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 5, 10, 15, 20, 25].map((v) => (
        <g key={v}>
          <line x1={ax(v)} y1={145} x2={ax(v)} y2={155} stroke={MUTED_COLOR} />
          <SvgLines x={ax(v)} y={168} lines={[String(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={ax(25) + 14} y={154} lines={['m/s']} fill={MUTED_COLOR} size={10} />
      <rect x={ax(0)} y={40} width={ax(t.walker) - ax(0)} height={22} fill={PINK} fillOpacity={0.35} stroke={PINK} strokeWidth={1.5} />
      <SvgLines x={ax(t.walker) + 8} y={56} lines={[`the walker, relative to the train: ${t.walker} m/s`]} fill={TEXT_COLOR} size={11} bold />
      <rect x={ax(0)} y={70} width={ax(t.train) - ax(0)} height={22} fill={PINK} fillOpacity={0.35} stroke={PINK} strokeWidth={1.5} />
      <SvgLines x={ax(0) + 8} y={86} lines={[`the train, relative to the platform: ${t.train} m/s`]} fill={TEXT_COLOR} size={11} bold />
      <rect x={ax(0)} y={100} width={ax(t.everyday) - ax(0)} height={22} fill={CYAN} fillOpacity={0.35} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={ax(0) + 8} y={116} lines={[`the everyday sum, the walker relative to the platform: ${t.everyday} m/s`]} fill={TEXT_COLOR} size={11} bold />
      <SvgLines x={20} y={192} lines={['The rule of this experiment gives the same 21 m/s here. It differs from the everyday sum by about 2 parts in 10 000 000 000 000 000.']} fill={CYAN} size={10} />

      {stage >= 2 && (
        <g>
          <line x1={20} y1={212} x2={P1_W - 20} y2={212} stroke="#334155" />
          <SvgLines x={20} y={236} lines={['B. The same kind of question near the speed of light (speeds as a fraction of c)']} fill={TEXT_COLOR} size={12} bold />
          {/* the wall at c */}
          <line x1={bx(1)} y1={252} x2={bx(1)} y2={430} stroke={YELLOW} strokeWidth={2} strokeDasharray="6 4" />
          <SvgLines x={bx(1) + 6} y={262} lines={['c', '(speed of light)']} fill={YELLOW} size={10} bold />
          {/* the spaceship, and the probe starting from the spaceship's speed */}
          <rect x={bx(0)} y={268} width={bx(pic.ship) - bx(0)} height={22} fill={PINK} fillOpacity={0.35} stroke={PINK} strokeWidth={1.5} />
          <SvgLines x={bx(0) + 8} y={284} lines={[`spaceship, relative to the lab: ${pic.ship} c`]} fill={TEXT_COLOR} size={11} bold />
          <rect x={bx(pic.ship)} y={298} width={bx(pic.ship + pic.probe) - bx(pic.ship)} height={22} fill={PINK} fillOpacity={0.35} stroke={PINK} strokeWidth={1.5} />
          <SvgLines x={bx(pic.ship) + 8} y={314} lines={[`probe, relative to the spaceship: ${pic.probe} c`]} fill={TEXT_COLOR} size={11} bold />
          {/* the everyday sum, and the rule */}
          <rect x={bx(0)} y={332} width={bx(pic.everyday) - bx(0)} height={22} fill={CYAN} fillOpacity={0.35} stroke={CYAN} strokeWidth={1.5} />
          <SvgLines x={bx(0) + 8} y={348} lines={[`the everyday sum: ${n1(pic.everyday)} c`]} fill={TEXT_COLOR} size={11} bold />
          <rect x={bx(0)} y={362} width={bx(pic.rule) - bx(0)} height={22} fill={CYAN} fillOpacity={0.55} stroke={CYAN} strokeWidth={1.5} />
          <SvgLines x={bx(0) + 8} y={378} lines={[`what the lab measures: ${n1(pic.rule)} c`]} fill={TEXT_COLOR} size={11} bold />
          <rect x={bx(pic.rule)} y={362} width={bx(pic.everyday) - bx(pic.rule)} height={22} fill="none" stroke={CYAN} strokeWidth={1.5} strokeDasharray="5 4" />
          <SvgLines x={(bx(pic.rule) + bx(pic.everyday)) / 2} y={400} lines={[`gap: ${n1(pic.gap)} c`]} fill={CYAN} size={11} bold anchor="middle" />
          {/* the ruler */}
          <line x1={bx(0)} y1={414} x2={bx(1.25)} y2={414} stroke={MUTED_COLOR} strokeWidth={1.5} />
          {[0, 0.25, 0.5, 0.75, 1, 1.25].map((v) => (
            <g key={v}>
              <line x1={bx(v)} y1={409} x2={bx(v)} y2={419} stroke={MUTED_COLOR} />
              <SvgLines x={bx(v)} y={432} lines={[String(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
            </g>
          ))}
          <SvgLines x={bx(1.25) + 10} y={418} lines={['c']} fill={MUTED_COLOR} size={10} />
          {guess !== null && (
            <g>
              <line x1={guessX} y1={356} x2={guessX} y2={392} stroke={YOURS_COLOR} strokeWidth={4} />
              <GuessBox x={boxX} y={448} w={boxW} lines={['YOUR GUESS (Prediction 1):', `the lab sees the probe at ${n1(guess)} c`]} fromX={guessX} fromY={392} />
            </g>
          )}
        </g>
      )}
    </svg>
  )
}

export function pictureOneCaption(stage: number): ReactNode {
  const pic = pictureOne()
  const t = pic.train
  const lookFor: LookFor[] =
    stage >= 2
      ? [
          {
            look: 'the two cyan bars in panel B: the long one (the everyday sum) and the shorter one (what the lab measures), and the dashed gap between their ends.',
            means: `adding ${pic.ship} c and ${pic.probe} c the everyday way gives ${n1(pic.everyday)} c, but the lab measures ${n1(pic.rule)} c, so the everyday sum overshoots by ${n1(pic.gap)} c.`,
            matters: 'in panel A the two ways agree to about 2 parts in 10 000 000 000 000 000. Near the speed of light they do not, and that difference is what this experiment is about.',
          },
          {
            look: 'the yellow dashed line at c and where the cyan bars end beside it.',
            means: `the everyday sum reaches the line exactly (${n1(pic.everyday)} c) with just two half-light speeds, while the measured result stops short of it at ${n1(pic.rule)} c.`,
            matters: 'it shows how quickly the everyday sum would take two ordinary-looking speeds up to the speed of light. Pictures 2 and 3 are about whether real measurements follow the everyday sum or the other result.',
          },
        ]
      : []
  return (
    <CaptionBlock
      title="Picture 1"
      intro="Panel A is the everyday example. Panel B, which appears at stage 2, is the same kind of question with a spaceship and its probe. In both panels a longer bar means a greater speed, and every bar starts from 0 on its own ruler (in panel B the rulers are marked in fractions of c, where c is the speed of light: 0.5 means half of c, 0.8 means eight-tenths of c, and 1 means c itself), except the probe’s bar in panel B, which starts where the spaceship’s ends so that you can see the speeds being added."
      bullets={[
        <>
          <strong>The pink bars in panel A</strong> are the walker’s speed relative to the train ({t.walker} metre per second) and the train’s speed relative to the platform ({t.train} metres per second). Pink means imagined for the question. <strong>The cyan bar</strong> is the
          everyday sum, {t.everyday} metres per second: the speed of the walker as the platform measures it.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>Panel B’s pink bars</strong> are the imagined spaceship (moving at {pic.ship} c relative to the lab, where c is the speed of light and {pic.ship} c is half of it) and its imagined probe, fired straight ahead at {pic.probe} c relative to the spaceship. The probe’s bar starts
                at the end of the spaceship’s bar because that is where the everyday sum puts it.
              </>,
              <>
                <strong>The two cyan bars</strong> are calculated here. The upper one is the everyday sum. The lower, darker one is what someone in the lab measures. <strong>The dashed outline</strong> is the part of the everyday sum that the measured speed does not reach: the gap.{' '}
                <strong>The yellow dashed line</strong> marks c.
              </>,
              <>
                <strong>The white mark and box</strong> are your Prediction 1 guess: the white line stands on the lab’s bar at the speed you chose. It shows your guess only; it does not change the bars.
              </>,
              <>
                <strong>Where the rule comes from.</strong> The rule, (a + b) ÷ (1 + a × b), where a is the spaceship’s speed and b is the probe’s speed relative to the spaceship (both as fractions of c), belongs to special relativity, the theory you have been following since the first chapter. That theory starts from two facts: the laws of physics are the same for everyone who moves at a steady speed, and
                the speed of light is the same for everyone (Experiment 5 of the first chapter). From them it follows that two observers who move relative to each other do not agree on how long a ruler is or how fast a clock ticks, and do not even agree on which
                events are at the same time (Experiments 3, 6 and 7 of that chapter). A speed is a distance measured with a ruler divided by a time measured with a clock. So to find the probe’s speed for the lab, you cannot use the spaceship’s rulers and clocks. You
                have to convert the spaceship’s measurement into the lab’s, allowing for that disagreement. The rule (a + b) ÷ (1 + a × b) is the result of that conversion: its top, a + b, is the everyday sum, and its bottom, 1 + a × b, is the correction that the disagreement about rulers and clocks makes. The everyday sum is what you would get if the two observers’ rulers and clocks agreed, which is a very good
                approximation at everyday speeds and a poor one near the speed of light. The rule was worked out from special relativity after Einstein published it in 1905, and Max von Laue used it in 1907 to explain Fizeau’s water experiment (Picture 2). This page gives the rule and
                tests it; it does not work the conversion out step by step.
              </>,
              <>
                <strong>A check you can do yourself.</strong> Suppose the probe is a flash of light, so b = 1 (a full c). The rule gives (a + 1) ÷ (1 + a × 1) = (a + 1) ÷ (a + 1) = 1, whatever a is. So for any spaceship speed, the lab measures the flash at exactly c. The
                rule is built so that the speed of light comes out the same for everyone. Picture 3 puts that to the test.
              </>,
            ]
          : []),
      ]}
      worked={
        stage >= 2 ? (
          <>
            <strong>Step 1.</strong> Write each speed as a fraction of c, that is, as a part of the speed of light (0.5 means half of c, and 1 means c itself). The spaceship is a = {pic.ship} (half of c) and the probe is b = {pic.probe} (half of c). Here “×” means multiplied by and “÷” means divided by.
            <br />
            <strong>Step 2.</strong> The top of the rule is a + b = {pic.ship} + {pic.probe} = {n1(pic.ship + pic.probe)}. This part is the everyday sum.
            <br />
            <strong>Step 3.</strong> The bottom of the rule is 1 + a × b = 1 + {pic.ship} × {pic.probe} = 1 + {num(pic.ship * pic.probe)} = {num(1 + pic.ship * pic.probe)}. This part is the correction. If it were exactly 1, the rule would give the everyday sum.
            <br />
            <strong>Step 4.</strong> Divide the top by the bottom: {n1(pic.ship + pic.probe)} ÷ {num(1 + pic.ship * pic.probe)} = {n1(pic.rule)}. So the lab measures the probe at {n1(pic.rule)} c. This is the lower cyan bar.
            <br />
            <strong>The train, in the same way.</strong> As fractions of c, the walker’s {t.walker} metre per second and the train’s {t.train} metres per second multiply to {t.walker} × {t.train} ÷ (299 792 458 × 299 792 458) = {(t.excess * 1e16).toFixed(1)} × 10⁻¹⁶, which is 0.00000000000000022 (fifteen
            zeros after the decimal point, then 22). So the bottom of the rule is 1.00000000000000022, which is the same as 1 for any measurement anyone could make. The rule and the everyday sum agree.
          </>
        ) : null
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> both sums, from the rule of this experiment. The rule itself comes from special relativity (see “Where the rule comes from” above). It has not been derived here, and its statement has been checked only against a short account of it in a Wikipedia article, not against a textbook. Pictures 2 and 3 show tests of it. <strong>Imagined for the question:</strong> the walker, the train, the spaceship and the probe. <strong>Measured:</strong> nothing in this picture; the tests are in Pictures 2 and 3.
        </>
      }
    />
  )
}

// ---- Picture 2: light in moving water (Fizeau) ----
const P2_W = 760
const P2_H = 400

export function PictureTwo() {
  const pic = pictureTwo()
  const sx = (share: number) => 120 + 480 * share
  return (
    <svg viewBox={`0 0 ${P2_W} ${P2_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 2: light in flowing water, and how much of the water's speed is added to the light">
      <defs>
        <marker id="a2-pink" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={PINK} />
        </marker>
        <marker id="a2-yellow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={YELLOW} />
        </marker>
      </defs>
      <SvgLines x={20} y={24} lines={['A. A tube of flowing water, with light sent through it along the flow (a sketch, not to scale)']} fill={TEXT_COLOR} size={12} bold />
      <rect x={120} y={50} width={480} height={52} rx={6} fill={PINK} fillOpacity={0.15} stroke={PINK} strokeWidth={1.5} />
      <line x1={140} y1={64} x2={580} y2={64} stroke={PINK} strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#a2-pink)" />
      <SvgLines x={360} y={80} lines={['the water flows this way, at speed v']} fill={PINK} size={10} anchor="middle" />
      <line x1={140} y1={90} x2={580} y2={90} stroke={YELLOW} strokeWidth={2.5} markerEnd="url(#a2-yellow)" />
      <SvgLines x={360} y={118} lines={['the light goes the same way through the water']} fill={YELLOW} size={10} anchor="middle" />

      <SvgLines x={20} y={156} lines={['B. How much of the water’s speed v is added to the light’s speed (as a fraction of v)']} fill={TEXT_COLOR} size={12} bold />
      <rect x={sx(0)} y={176} width={sx(pic.everydayShare) - sx(0)} height={26} fill={CYAN} fillOpacity={0.35} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={sx(0) + 8} y={194} lines={[`the everyday sum: all of it (${n3(pic.everydayShare)} of v)`]} fill={TEXT_COLOR} size={11} bold />
      <rect x={sx(0)} y={212} width={sx(pic.ruleShare) - sx(0)} height={26} fill={CYAN} fillOpacity={0.55} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={sx(0) + 8} y={230} lines={[`by the rule: ${n3(pic.ruleShare)} of v, which is 1 − 1 ÷ ${num(pic.n)}²`]} fill={TEXT_COLOR} size={11} bold />
      <rect x={sx(pic.ruleShare)} y={212} width={sx(pic.everydayShare) - sx(pic.ruleShare)} height={26} fill="none" stroke={CYAN} strokeWidth={1.5} strokeDasharray="5 4" />
      {/* the measurement: Michelson and Morley's 0.434, with their possible error of +/- 0.02 */}
      <line x1={sx(pic.measured - pic.measuredGiveOrTake)} y1={262} x2={sx(pic.measured + pic.measuredGiveOrTake)} y2={262} stroke={GREEN} strokeWidth={3} />
      <line x1={sx(pic.measured - pic.measuredGiveOrTake)} y1={255} x2={sx(pic.measured - pic.measuredGiveOrTake)} y2={269} stroke={GREEN} strokeWidth={3} />
      <line x1={sx(pic.measured + pic.measuredGiveOrTake)} y1={255} x2={sx(pic.measured + pic.measuredGiveOrTake)} y2={269} stroke={GREEN} strokeWidth={3} />
      <circle cx={sx(pic.measured)} cy={262} r={7} fill={GREEN} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={sx(pic.measured + pic.measuredGiveOrTake) + 14} y={266} lines={[`measured in 1886: ${n3(pic.measured)} of v, give-or-take ${num(pic.measuredGiveOrTake)}`]} fill={GREEN} size={11} bold />
      <line x1={sx(0)} y1={292} x2={sx(1)} y2={292} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 0.25, 0.5, 0.75, 1].map((s) => (
        <g key={s}>
          <line x1={sx(s)} y1={287} x2={sx(s)} y2={297} stroke={MUTED_COLOR} />
          <SvgLines x={sx(s)} y={311} lines={[String(s)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={sx(1) + 14} y={296} lines={['of v']} fill={MUTED_COLOR} size={10} />
      <rect x={120} y={328} width={480} height={52} rx={6} fill="none" stroke={GREEN} strokeWidth={2} />
      <SvgLines x={132} y={348} lines={['Fizeau first measured this in 1851: the light is dragged along by only a fraction', 'of the water’s speed, less than all of it. No number from his paper is drawn here.']} fill={GREEN} size={11} bold />
    </svg>
  )
}

export function pictureTwoCaption(): ReactNode {
  const pic = pictureTwo()
  const w = fizeauWorked()
  const lookFor: LookFor[] = [
    {
      look: 'the two cyan bars in panel B, and the dashed gap between their ends.',
      means: `if the everyday sum held, all of the water’s speed would be added to the light’s. The rule says only ${n3(pic.ruleShare)} of it is, so a little less than half.`,
      matters: 'the water is a small speed, so the difference is small, but it is a difference in kind that can be measured, and it separates the two ways of adding.',
    },
    {
      look: 'the green dot and the short green line through it, below the cyan bars.',
      means: `Michelson and Morley measured the fraction as ${n3(pic.measured)} of the water’s speed, with a possible error of ±${num(pic.measuredGiveOrTake)} (the ends of the green line, ${n3(pic.measured - pic.measuredGiveOrTake)} to ${n3(pic.measured + pic.measuredGiveOrTake)}). The rule’s ${n3(pic.ruleShare)} lies inside that range, and the everyday sum’s 1 lies far outside it.`,
      matters: 'this is a measurement made in 1886, long before the rule was in use, and it sides with the rule and not with the everyday sum. The tutor goes through why.',
    },
  ]
  return (
    <CaptionBlock
      title="Picture 2"
      intro={`Panel A is a sketch of Fizeau’s idea: light sent through a tube of flowing water, in the same direction as the water. Panel B compares two ways of working out how much the water’s flow changes the light’s speed, as a fraction of the water’s own speed v (its speed relative to the lab). A fraction of v means a part of v: 0.5 would be half of v, and 1 would be all of it. Water has a number called its refractive index, which says how much slower light goes in it than in empty space. For water it is about ${num(pic.n)} (Michelson and Morley used its square, 1.78), which means that light goes through still water at about 1 ÷ ${num(pic.n)} = ${n3(pic.stillWaterSpeed)} of its speed in empty space.`}
      bullets={[
        <>
          <strong>The pink tube and arrow</strong> are the flowing water, imagined for the question as a sketch. <strong>The yellow arrow</strong> is the light. The tube is not drawn to scale: the water’s speed v is very much smaller than the speed of light.
        </>,
        <>
          <strong>The two cyan bars</strong> are calculated here. The upper one is the everyday sum, which adds all of v to the light’s speed. The lower, darker one is the rule, which adds the fraction {n3(pic.ruleShare)} of v. For example, for water flowing at {w.exampleWaterMPerS} metres per second, the everyday sum adds all {w.exampleWaterMPerS} metres per second to the light’s speed, while the rule adds {n3(pic.ruleShare)} × {w.exampleWaterMPerS} = {(pic.ruleShare * w.exampleWaterMPerS).toFixed(2)} metres per second. <strong>The dashed outline</strong> is the part that the rule does not add.
        </>,
        <>
          <strong>The green dot and line</strong> are the measurement by Michelson and Morley in 1886: the dot is their value, {n3(pic.measured)} of v, and the short line is their “possible error”, ±{num(pic.measuredGiveOrTake)}, the range in which they thought the true value could lie. <strong>The green box</strong> is Fizeau’s first finding in 1851, in words only.
        </>,
      ]}
      worked={
        <>
          <strong>What the letters mean.</strong> <strong>v</strong> is the speed of the water relative to the lab (the speed of the flow in the tube). <strong>n</strong> is the refractive index of the water, the number that says how much slower light goes in water than in empty space. For water, n = {num(w.n)} (Michelson and Morley used n² = 1.78 for the water in their tubes, and {num(w.n)} is its square root).
          <br />
          <strong>Where the fraction comes from.</strong> It comes from the same rule as in Picture 1, (a + b) ÷ (1 + a × b), with speeds as fractions of c. Here the “spaceship” is the water, moving at a = v (as a fraction of c), and the “probe” is the light, which goes through still water at b = 1 ÷ n (as a
          fraction of c). The light goes in the same direction as the flow. The rule is the one that special relativity gives, and von Laue showed in 1907 that it explains Fizeau’s result.
          <br />
          <strong>Step 1.</strong> Light in still water goes at 1 ÷ n = 1 ÷ {num(w.n)} = {n3(w.stillWaterSpeed)} c.
          <br />
          <strong>Step 2.</strong> Apply the rule. Light in the moving water, as the lab measures it, goes at (v + 1 ÷ n) ÷ (1 + v ÷ n).
          <br />
          <strong>Step 3.</strong> Subtract the speed in still water, 1 ÷ n, to see how much the flow added. With a little algebra, (v + 1 ÷ n) ÷ (1 + v ÷ n) − 1 ÷ n = v × (1 − 1 ÷ n²) ÷ (1 + v ÷ n). So the flow adds v × (1 − 1 ÷ n²), divided by (1 + v ÷ n).
          <br />
          <strong>Step 4.</strong> The water’s speed is tiny compared with c, so v ÷ n is tiny and the bottom, 1 + v ÷ n, is 1 for all practical purposes. For example, for water flowing at {w.exampleWaterMPerS} metres per second, v = {w.exampleWaterMPerS} ÷ 299 792 458 = {(w.exampleWaterShareOfC * 1e8).toFixed(1)} × 10⁻⁸ c, so v ÷ n
          = {(w.exampleDenominatorExcess * 1e8).toFixed(1)} × 10⁻⁸ and the bottom is 1.000000025. (This example speed is this page’s own choice, not Fizeau’s.) So the flow adds the fraction 1 − 1 ÷ n² of v.
          <br />
          <strong>Step 5.</strong> With n = {num(w.n)}: n² = {n3(w.nSquared)}, 1 ÷ {n3(w.nSquared)} = {n3(w.oneOverNSquared)}, and 1 − {n3(w.oneOverNSquared)} = {n3(w.share)}. The everyday sum would add all of v, which is a fraction of 1.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> Michelson and Morley, 1886, measured the fraction as {n3(pic.measured)} of v with a possible error of ±{num(pic.measuredGiveOrTake)} (read in a typed copy of their paper, whose figures and typeset equations were not seen). Fizeau, 1851, first found that the drag is only a fraction (read in a Wikipedia account; his own paper was not opened). <strong>Calculated here:</strong> the fraction {n3(pic.ruleShare)} of v, from the rule, using n² = 1.78, the value Michelson and Morley used (they print Fresnel’s value as 0.437, a rounding that differs from this page’s {n3(pic.ruleShare)} by 0.001), and von Laue’s 1907 derivation of the same fraction from the rule. <strong>Imagined for the question:</strong> the tube and the arrows, as a sketch.
        </>
      }
    />
  )
}

// ---- Picture 3: the 1964 flash, and a flash sent from ships of different speeds ----
const P3_W = 760
const P3_H = 660

export function PictureThree({ stage, flashGuessId }: { stage: number; flashGuessId: string | null }) {
  const pic = pictureThree()
  const gx = (v: number) => 60 + 320 * v
  const guess = flashGuessId === null ? null : flashGuess(flashGuessId)
  const guessX = guess === null ? 0 : gx(guess.value)
  const boxW = 270
  const boxX = Math.min(Math.max(guessX - boxW / 2, 20), P3_W - boxW - 20)
  return (
    <svg viewBox={`0 0 ${P3_W} ${P3_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 3: the speed of a gamma ray sent forward from pions, and a flash sent from ships of different speeds">
      <SvgLines x={20} y={24} lines={[`A. A gamma ray sent forward from pions moving at ${pic.source} c (speeds as a fraction of c)`]} fill={TEXT_COLOR} size={12} bold />
      <line x1={gx(1)} y1={40} x2={gx(1)} y2={230} stroke={YELLOW} strokeWidth={2} strokeDasharray="6 4" />
      <SvgLines x={gx(1) + 6} y={38} lines={['c', '(speed of light)']} fill={YELLOW} size={10} bold />
      {guess !== null && <line x1={guessX} y1={58} x2={guessX} y2={186} stroke={YOURS_COLOR} strokeWidth={4} />}
      <rect x={gx(0)} y={64} width={gx(pic.everyday) - gx(0)} height={24} fill={CYAN} fillOpacity={0.35} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={gx(0) + 8} y={81} lines={[`the everyday sum: ${n5(pic.everyday)} c`]} fill={TEXT_COLOR} size={11} bold />
      <rect x={gx(0)} y={98} width={gx(pic.rule) - gx(0)} height={24} fill={CYAN} fillOpacity={0.55} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={gx(0) + 8} y={115} lines={[`by the rule: ${n5(pic.rule)} c`]} fill={TEXT_COLOR} size={11} bold />
      <circle cx={gx(pic.measured)} cy={152} r={7} fill={GREEN} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={gx(pic.measured) + 14} y={156} lines={[`measured in 1964: ${n5(pic.measured)} c`]} fill={GREEN} size={11} bold />
      <SvgLines x={gx(pic.measured) + 14} y={170} lines={[`give-or-take ${n5(pic.giveOrTake)} c: too small to draw`]} fill={GREEN} size={10} />
      <line x1={gx(0)} y1={196} x2={gx(2.1)} y2={196} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 0.5, 1, 1.5, 2].map((v) => (
        <g key={v}>
          <line x1={gx(v)} y1={191} x2={gx(v)} y2={201} stroke={MUTED_COLOR} />
          <SvgLines x={gx(v)} y={214} lines={[String(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={gx(2.1) + 10} y={200} lines={['c']} fill={MUTED_COLOR} size={10} />
      {guess !== null && (
        <g>
          <GuessBox
            x={boxX}
            y={234}
            w={boxW}
            lines={['YOUR GUESS (Prediction 2):', `the lab measures the gamma ray at ${guess.markerOnly ? 'less than c' : (guess.value === 1 ? 'about c' : `about ${guess.value} c`)}`, ...(guess.markerOnly ? ['(its position is only a marker)'] : [])]}
            fromX={guessX}
            fromY={186}
          />
        </g>
      )}

      {stage >= 5 && (
        <g>
          <line x1={20} y1={300} x2={P3_W - 20} y2={300} stroke="#334155" />
          <SvgLines x={20} y={324} lines={['B. A flash sent straight ahead from ships of different speeds (speeds as a fraction of c)']} fill={TEXT_COLOR} size={12} bold />
          <line x1={gx(1)} y1={338} x2={gx(1)} y2={P3_H - 20} stroke={YELLOW} strokeWidth={2} strokeDasharray="6 4" />
          {pic.flashFromShips.map((row, i) => {
            const y = 356 + i * 72
            return (
              <g key={row.ship}>
                <SvgLines x={gx(0)} y={y - 4} lines={[`a ship at ${row.ship} c sends a flash straight ahead`]} fill={PINK} size={11} bold />
                <rect x={gx(0)} y={y} width={gx(row.everyday) - gx(0)} height={22} fill={CYAN} fillOpacity={0.35} stroke={CYAN} strokeWidth={1.5} />
                <SvgLines x={gx(0) + 8} y={y + 16} lines={[`everyday sum: ${n5(row.everyday).replace(/0+$/, '').replace(/\.$/, '')} c`]} fill={TEXT_COLOR} size={10} bold />
                <rect x={gx(0)} y={y + 26} width={gx(row.rule) - gx(0)} height={22} fill={CYAN} fillOpacity={0.55} stroke={CYAN} strokeWidth={1.5} />
                <SvgLines x={gx(0) + 8} y={y + 42} lines={[`by the rule: ${n1(row.rule)} c`]} fill={TEXT_COLOR} size={10} bold />
              </g>
            )
          })}
        </g>
      )}
    </svg>
  )
}

export function pictureThreeCaption(stage: number): ReactNode {
  const pic = pictureThree()
  const w = pionWorked()
  const lookFor: LookFor[] = [
    {
      look: 'the three marks in panel A: the long cyan bar, the shorter cyan bar that stops at the yellow line, and the green dot.',
      means: `the everyday sum gives ${n5(pic.everyday)} c for the gamma ray. The rule gives ${n5(pic.rule)} c. The 1964 measurement came out at ${n5(pic.measured)} c, with a give-or-take of ${n5(pic.giveOrTake)} c, so it sits on the yellow line, not near the long bar.`,
      matters: `the pions were already moving at ${pic.source} c, and the gamma ray did not get that speed added to its own. This is a direct measurement of light from a source moving almost as fast as light, and it agrees with the rule.`,
    },
    ...(stage >= 5
      ? [
          {
            look: 'the pairs of bars in panel B: the everyday bar grows with the ship’s speed, but the darker bar is the same length every time.',
            means: `for a flash sent forward, the everyday sum would give ${num(pic.flashFromShips[0].everyday)} c from a ship at ${pic.flashFromShips[0].ship} c and ${num(pic.flashFromShips[3].everyday)} c from a ship at ${pic.flashFromShips[3].ship} c, while the rule gives c for every ship.`,
            matters: 'it shows that the 1964 result is not a special case. For light the rule gives the same speed whatever the speed of the source, and that is what the measurement found.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBlock
      title="Picture 3"
      intro={`Panel A shows the 1964 test at CERN. Neutral pions moving at ${pic.source} c fell apart and each sent a gamma ray straight ahead. Detectors a known distance apart timed the gamma rays. The panel compares three speeds for those gamma rays on one ruler, as a fraction of c, where c is the speed of light. Panel B, which appears at stage 5, asks what a flash would do if it was sent from ships of different speeds.`}
      bullets={[
        <>
          <strong>The long cyan bar and the shorter cyan bar</strong> are calculated here: the everyday sum, {n5(pic.everyday)} c, and the rule, {n5(pic.rule)} c. <strong>The yellow dashed line</strong> marks c.
        </>,
        <>
          <strong>The green dot</strong> is the measurement, {n5(pic.measured)} c. A measurement always has a <strong>give-or-take</strong>, the amount by which the true value could differ from it. Here it is {n5(pic.giveOrTake)} c, which at this scale is thinner than the dot, so it is not drawn.
        </>,
        <>
          <strong>The white mark and box</strong> are your Prediction 2 guess: the white line stands at the speed you chose. If you chose “Less than c”, the choice has no size of its own, and the white line is only a marker. It shows your guess only; it does not change the bars.
        </>,
        ...(stage >= 5
          ? [
              <>
                <strong>Panel B’s pink labels</strong> are imagined ships, at {pic.flashFromShips.map((r) => r.ship).join(', ')} c. Next to each is a pair of cyan bars: the everyday sum for a flash sent forward from that ship, and the rule’s result.
              </>,
            ]
          : []),
      ]}
      worked={
        <>
          <strong>Step 1.</strong> Write each speed as a fraction of c, that is, as a part of the speed of light (0.5 means half of c, and 1 means c itself). The pions are a = {w.a} (that is {(w.a * 100).toFixed(3)} percent of c). The gamma ray is light, so b = 1: this is the speed
          that special relativity says light has for whoever sends it out, here the pion. That claim is part of what the 1964 experiment tested.
          <br />
          <strong>Step 2.</strong> The top of the rule is a + b = {w.a} + 1 = {n5(w.top)}. This is the everyday sum: nearly twice c.
          <br />
          <strong>Step 3.</strong> The bottom of the rule is 1 + a × b = 1 + {w.a} × 1 = {n5(w.bottom)}. When b = 1, the bottom, 1 + a, is always the same number as the top, a + 1.
          <br />
          <strong>Step 4.</strong> Divide the top by the bottom: {n5(w.top)} ÷ {n5(w.bottom)} = {w.result}. So the rule says the lab measures the gamma ray at exactly 1 c, the speed of light. The pions’ own speed is not added on.
          <br />
          <strong>Step 5.</strong> Put the speeds in kilometres per second. In the paper, c is {spaced(w.lightKmPerS)} km/s, so the everyday sum would give about {spaced(w.everydayKmPerS)} km/s. The measurement was {spaced(w.measuredKmPerS)} km/s, with a give-or-take of {spaced(w.giveOrTakeKmPerS)} km/s
          (that is {w.giveOrTakePercentOfLight.toFixed(3)} percent of c). The measured speed differs from c by {spaced(w.differenceFromLightKmPerS)} km/s, which is less than the give-or-take, so it agrees with c. It is about {spaced(w.everydayKmPerS - w.measuredKmPerS)} km/s away from the everyday sum.
          {stage >= 5 && (
            <>
              <br />
              <strong>Panel B, in the same way.</strong> A ship at {pic.flashFromShips[1].ship} c sends a flash straight ahead, so a = {pic.flashFromShips[1].ship} and b = 1. The top is {pic.flashFromShips[1].ship} + 1 = {num(pic.flashFromShips[1].everyday)} and the bottom is 1 + {pic.flashFromShips[1].ship} × 1 ={' '}
          {num(1 + pic.flashFromShips[1].ship)}, so the result is {num(pic.flashFromShips[1].everyday)} ÷ {num(1 + pic.flashFromShips[1].ship)} = {num(pic.flashFromShips[1].rule)} c. The same happens for every ship speed, because the top and bottom are always equal when b = 1.
            </>
          )}
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> the green dot is from Alväger, Farley, Kjellman and Wallin, 1964 (a scan of the paper, machine-read: the figures are still to be checked against its pages). <strong>Calculated here:</strong> the two cyan bars in both panels. <strong>Imagined for the question:</strong> the ships of panel B.
        </>
      }
    />
  )
}

// ---- Drawing A: the learner's trial values (Part 2). No guess marks: the guesses never change it. ----
// A speed or gap written to as many decimals as it needs (up to five), without trailing zeros, so that 0.8 stays 0.8 and 0.99995 stays 0.99995.
const fmt = (x: number) => {
  const t = x.toFixed(5).replace(/0+$/, '')
  return t.endsWith('.') ? t + '0' : t
}
export const probeLabel = (b: number) => (b === 1 ? '1.0 c (light)' : `${b} c`)

const A_W = 760
const A_H = 440

export function TrialDrawing({ trial }: { trial: TrialPicture }) {
  const tx = (v: number) => 100 + 300 * v
  const showGap = trial.gap > 1e-9
  return (
    <svg viewBox={`0 0 ${A_W} ${A_H}`} width="100%" style={svgStyle} role="img" aria-label="Drawing A: the everyday sum and the measured result for your trial spaceship speed and probe speed">
      <SvgLines x={20} y={24} lines={['Drawing A. Your trial values (speeds as a fraction of c)']} fill={TEXT_COLOR} size={12} bold />
      <line x1={tx(1)} y1={34} x2={tx(1)} y2={190} stroke={YELLOW} strokeWidth={2} strokeDasharray="6 4" />
      <SvgLines x={tx(1) + 6} y={44} lines={['c', '(speed of light)']} fill={YELLOW} size={10} bold />
      <rect x={tx(0)} y={52} width={tx(trial.ship) - tx(0)} height={22} fill={PINK} fillOpacity={0.35} stroke={PINK} strokeWidth={1.5} />
      <SvgLines x={tx(0) + 8} y={68} lines={[`spaceship, relative to the lab: ${trial.ship} c`]} fill={TEXT_COLOR} size={11} bold />
      <rect x={tx(trial.ship)} y={82} width={tx(trial.ship + trial.probe) - tx(trial.ship)} height={22} fill={PINK} fillOpacity={0.35} stroke={PINK} strokeWidth={1.5} />
      <SvgLines x={tx(trial.ship) + 8} y={98} lines={[`${trial.probeIsLight ? 'flash of light' : 'probe'}, relative to the spaceship: ${probeLabel(trial.probe)}`]} fill={TEXT_COLOR} size={11} bold />
      <rect x={tx(0)} y={116} width={tx(trial.everyday) - tx(0)} height={22} fill={CYAN} fillOpacity={0.35} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={tx(0) + 8} y={132} lines={[`the everyday sum: ${fmt(trial.everyday)} c`]} fill={TEXT_COLOR} size={11} bold />
      <rect x={tx(0)} y={146} width={tx(trial.rule) - tx(0)} height={22} fill={CYAN} fillOpacity={0.55} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={tx(0) + 8} y={162} lines={[`what the lab measures: ${fmt(trial.rule)} c`]} fill={TEXT_COLOR} size={11} bold />
      {showGap && <rect x={tx(trial.rule)} y={146} width={tx(trial.everyday) - tx(trial.rule)} height={22} fill="none" stroke={CYAN} strokeWidth={1.5} strokeDasharray="5 4" />}
      <line x1={tx(0)} y1={186} x2={tx(2)} y2={186} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 0.5, 1, 1.5, 2].map((v) => (
        <g key={v}>
          <line x1={tx(v)} y1={181} x2={tx(v)} y2={191} stroke={MUTED_COLOR} />
          <SvgLines x={tx(v)} y={206} lines={[String(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={tx(2) + 10} y={190} lines={['c']} fill={MUTED_COLOR} size={10} />

      <line x1={20} y1={226} x2={A_W - 20} y2={226} stroke="#334155" />
      <SvgLines x={20} y={250} lines={['The rule worked out for your values']} fill={TEXT_COLOR} size={12} bold />
      <SvgLines x={20} y={276} lines={[`top: a + b = ${trial.ship} + ${trial.probe} = ${fmt(trial.top)}   (the everyday sum)`]} fill={CYAN} size={11} />
      <SvgLines x={20} y={296} lines={[`bottom: 1 + a × b = 1 + ${trial.ship} × ${trial.probe} = ${fmt(trial.bottom)}   (the correction)`]} fill={CYAN} size={11} />
      <SvgLines x={20} y={316} lines={[`result: top ÷ bottom = ${fmt(trial.top)} ÷ ${fmt(trial.bottom)} = ${fmt(trial.rule)} c, which is ${trial.rulePercentOfC.toFixed(3)} percent of c`]} fill={CYAN} size={11} bold />
      <SvgLines x={20} y={346} lines={[`The everyday sum is ${fmt(trial.gap)} c above what the lab measures.`]} fill={TEXT_COLOR} size={11} />
      <SvgLines
        x={20}
        y={366}
        lines={[trial.everydayPassesC ? `The everyday sum, ${fmt(trial.everyday)} c, is beyond c. What the lab measures is ${trial.probeIsLight ? 'exactly c' : `${fmt(trial.belowC)} c below c`}.` : `The everyday sum, ${fmt(trial.everyday)} c, is still below c. What the lab measures is ${fmt(trial.belowC)} c below c.`]}
        fill={TEXT_COLOR}
        size={11}
      />
      <SvgLines x={20} y={400} lines={['Pink: imagined for the question. Cyan: calculated here. Yellow: the speed of light. These are your trial values, not measurements.']} fill={MUTED_COLOR} size={10} />
    </svg>
  )
}

export function trialCaption(trial: TrialPicture): ReactNode {
  const lookFor: LookFor[] = [
    {
      look: 'the two cyan bars, and the dashed gap between their ends.',
      means: `for your values, the everyday sum is ${fmt(trial.everyday)} c and what the lab measures is ${fmt(trial.rule)} c. The gap is ${fmt(trial.gap)} c.`,
      matters: 'try 0.1 c with 0.1 c, and then 0.9 c with 0.9 c. The gap is tiny for slow speeds and large for fast ones. This is why the everyday rule works so well in daily life and fails near the speed of light.',
    },
    {
      look: 'the yellow dashed line at c, and where each cyan bar ends beside it.',
      means: trial.everydayPassesC
        ? `the everyday bar, ${fmt(trial.everyday)} c, goes past the line. The measured bar, ${fmt(trial.rule)} c, does not.`
        : `neither bar goes past the line for your values: the everyday bar ends at ${fmt(trial.everyday)} c and the measured bar at ${fmt(trial.rule)} c.`,
      matters: 'for every setting you can choose here, the measured bar ends at or before the line, while the everyday bar goes past it as soon as the two speeds add up to more than c. Experiment 5 of the first chapter asked why light cannot go faster, and this is one place where the same limit shows up.',
    },
    {
      look: 'the last button of the probe control, “1.0 c (light)”, with any spaceship speed.',
      means: 'the bottom of the rule, 1 + a × 1, is always the same number as the top, a + 1. The result is exactly 1 c.',
      matters: 'it is the check from Picture 1 and the test of Picture 3 in one place: whatever the spaceship’s speed, a flash of light is measured at c.',
    },
  ]
  return (
    <CaptionBlock
      title="Drawing A"
      intro="This drawing follows the two settings above it. Like Picture 1, it shows speeds as fractions of c, where c is the speed of light (0.5 means half of c, and 1 means c itself). A longer bar means a greater speed, and the probe’s pink bar starts where the spaceship’s ends so that you can see the speeds being added. Below the bars, the rule is worked out for your values."
      bullets={[
        <>
          <strong>The pink bars</strong> are your imagined spaceship (a, its speed relative to the lab) and its probe or flash (b, its speed relative to the spaceship). <strong>The upper cyan bar</strong> is the everyday sum, a + b. <strong>The lower, darker cyan bar</strong> is what the lab
          measures, from the rule (a + b) ÷ (1 + a × b). <strong>The dashed outline</strong> is the gap between them. <strong>The yellow dashed line</strong> marks c.
        </>,
        <>
          <strong>The lines under the bars</strong> are the three parts of the rule: the top (a + b), the bottom (1 + a × b) and the result (top ÷ bottom), with your numbers in them, as in the worked moments of Pictures 1 and 3.
        </>,
      ]}
      worked={
        <>
          <strong>The rule.</strong> This is the same rule as in Picture 1: (a + b) ÷ (1 + a × b), where a is the spaceship’s speed relative to the lab and b is the {trial.probeIsLight ? 'flash’s' : 'probe’s'} speed relative to the spaceship, both as fractions of c. Its top, a + b, is the everyday sum. Its
          bottom, 1 + a × b, is the correction that special relativity adds. Its result is the speed that the lab measures. Here it is worked out for your two numbers.
          <br />
          <strong>Step 1.</strong> Your spaceship is a = {trial.ship} and your {trial.probeIsLight ? 'flash of light' : 'probe'} is b = {trial.probe}, as fractions of c.
          <br />
          <strong>Step 2.</strong> The top of the rule is a + b = {trial.ship} + {trial.probe} = {fmt(trial.top)}. This is the everyday sum.
          <br />
          <strong>Step 3.</strong> The bottom of the rule is 1 + a × b = 1 + {trial.ship} × {trial.probe} = {fmt(trial.bottom)}. This is the correction.
          <br />
          <strong>Step 4.</strong> Divide the top by the bottom: {fmt(trial.top)} ÷ {fmt(trial.bottom)} = {fmt(trial.rule)}. So the lab measures {trial.probeIsLight ? 'the flash' : 'the probe'} at {fmt(trial.rule)} c.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> both cyan bars and every number in the drawing, from the rule that Picture 1 explains. <strong>Imagined for the question:</strong> your spaceship and probe. <strong>Measured:</strong> nothing in this drawing; the tests are in Pictures 2 and 3. These are your own trial values, not new
          measurements, and they do not say that a real spaceship could move like this.
        </>
      }
    />
  )
}
