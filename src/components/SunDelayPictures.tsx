import type { ReactNode } from 'react'
import {
  CASSINI_IMPROVEMENT_FACTOR_JPL,
  CLOSEST_CHOICES_RADII,
  EARTH_DISTANCE_AU,
  FARTHEST_CLOSEST_RADII,
  FULLER_TERM_RECALLED_US,
  PREDICTION_TWO_FAR_RADII,
  SHAPIRO_1964_DELAY_US,
  SHAPIRO_1964_EQUIVALENT_PATH_KM,
  SHAPIRO_1964_PRECISION_PERCENT_HIGH,
  SHAPIRO_1964_PRECISION_PERCENT_LOW,
  SPEED_OF_LIGHT_M_PER_S,
  SUN_RADIUS_M,
  TARGET_CHOICES,
  delayGuessValueUs,
  distanceGuessTimesSmaller,
  flatTripBreakdown,
  guessedFarDelayUs,
  lightDistanceInOneMicrosecondM,
  testPrecisionsPpm,
  trialDelay,
  tripWithAndWithoutSun,
} from '../physics/sunDelay'
import { CaptionBlock } from './BlackHoleGrowthPictures'
import type { LookFor } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 5: Picture 1 (the trip with no effect from the Sun, and the path past the Sun), Picture 2 (the extra time on a ruler of microseconds), Picture 3 (the extra time against the closest
// distance) and Picture 4 (how closely three tests pinned the delay down), with their captions. The wording is Claude's DRAFT of 2026-11-01, for the owner's approval (CLAUDE.md §28.1).
// Every number drawn or written here is read from the physics module (CLAUDE.md §9); this file only draws it (pixel positions on the rulers are the only arithmetic done here).
// Colours: cyan is calculated here, green is measured by others, pink is imagined for the question, amber is the Sun (a labelled sketch, not to scale) and white is always the learner's guess (CLAUDE.md §14).
// Nothing here says why the Sun delays a signal, or why the delay falls as it does with distance (CLAUDE.md §12): that is the tutor's.

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CYAN = '#22d3ee'
const PINK = '#f472b6'
const GREEN = '#4ade80'
const AMBER = '#fbbf24'
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
const commas = (x: number) => Math.round(x).toLocaleString('en-US')
const commas1 = (x: number) => x.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const millions = (m: number) => (m / 1e9).toFixed(1)

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

const VENUS = TARGET_CHOICES.find((t) => t.id === 'venus')!

// ---- Picture 1: the trip with no effect from the Sun, and the path past the Sun ----
const P1_W = 760
const P1_H = 470

export function PictureOne({ stage }: { stage: number }) {
  const trip = trialDelay('venus', 1)
  const b = flatTripBreakdown('venus', 1)
  const barX0 = 270
  const barW = 340
  const sunX = 380
  const sunY = 330
  const sunR = 56
  const pathY = sunY - sunR
  const earthX = 60
  const venusX = 700
  return (
    <svg viewBox={`0 0 ${P1_W} ${P1_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 1: the length of the round trip to Venus past the Sun with no effect from the Sun's gravity, and a sketch of the path past the Sun">
      <SvgLines x={20} y={24} lines={['A. The round trip from the Earth to Venus and back, with no effect from the Sun’s gravity']} fill={TEXT_COLOR} size={12} bold />
      <rect x={barX0} y={40} width={barW} height={26} fill={CYAN} fillOpacity={0.4} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={20} y={58} lines={['the whole round trip']} fill={MUTED_COLOR} size={11} />
      <SvgLines x={barX0 + barW + 8} y={51} lines={[`${n1(b.roundTripMinutes)} minutes`, `(${commas(b.roundTripSeconds)} seconds)`]} fill={TEXT_COLOR} size={11} bold />
      <SvgLines x={20} y={92} lines={[`One microsecond (1 µs) is only about 1 part in ${n1(trip.flatUs / 1e9)} billion of this bar, far too thin to draw.`]} fill={MUTED_COLOR} size={10} />
      {stage >= 2 && (
        <g>
          <line x1={20} y1={108} x2={P1_W - 20} y2={108} stroke="#334155" />
          <SvgLines x={20} y={130} lines={['B. A sketch of the path past the Sun (not to scale)']} fill={TEXT_COLOR} size={12} bold />
          {/* the Sun, the Earth and Venus */}
          <circle cx={sunX} cy={sunY} r={sunR} fill={AMBER} fillOpacity={0.3} stroke={AMBER} strokeWidth={2} />
          <SvgLines x={sunX} y={sunY + 36} lines={['the Sun']} fill={AMBER} size={11} bold anchor="middle" />
          <circle cx={earthX} cy={pathY} r={9} fill={MUTED_COLOR} fillOpacity={0.5} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <SvgLines x={earthX} y={pathY + 28} lines={['the Earth']} fill={TEXT_COLOR} size={10} bold anchor="middle" />
          <circle cx={venusX} cy={pathY} r={7} fill={MUTED_COLOR} fillOpacity={0.5} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <SvgLines x={venusX} y={pathY + 28} lines={['Venus']} fill={TEXT_COLOR} size={10} bold anchor="middle" />
          {/* the signal's path, there and back */}
          <line x1={earthX + 12} y1={pathY} x2={venusX - 10} y2={pathY} stroke={PINK} strokeWidth={3} />
          <polygon points={`${venusX - 18},${pathY - 6} ${venusX - 6},${pathY} ${venusX - 18},${pathY + 6}`} fill={PINK} />
          <polygon points={`${earthX + 20},${pathY - 6} ${earthX + 8},${pathY} ${earthX + 20},${pathY + 6}`} fill={PINK} />
          <SvgLines x={(earthX + sunX) / 2} y={pathY - 40} lines={['an imagined radio pulse, going there and back,', 'in a straight line past the Sun’s edge']} fill={PINK} size={10} bold anchor="middle" />
          {/* distances along the path */}
          <SvgLines x={(earthX + sunX) / 2} y={pathY + 116} lines={[`Earth to the Sun’s edge: about ${EARTH_DISTANCE_AU} AU`, `(${millions(b.earthLegM)} million km)`]} fill={TEXT_COLOR} size={10} anchor="middle" />
          <SvgLines x={(sunX + venusX) / 2 + 30} y={pathY + 116} lines={[`the Sun’s edge to Venus: about ${VENUS.distanceAu} AU`, `(${millions(b.targetLegM)} million km)`]} fill={TEXT_COLOR} size={10} anchor="middle" />
          {/* the closest distance */}
          <line x1={sunX} y1={sunY} x2={sunX} y2={pathY} stroke={MUTED_COLOR} strokeWidth={2} strokeDasharray="5 4" />
          <circle cx={sunX} cy={sunY} r={3.5} fill={AMBER} />
          <SvgLines x={sunX + sunR + 14} y={pathY + 16} lines={['The dashed line is the closest distance,', 'measured from the Sun’s centre:', `1 solar radius (${millions(b.closestM)} million km).`, 'The surface is also 1 solar radius', 'from the centre, so the path just', 'touches the surface.']} fill={TEXT_COLOR} size={10} bold />
        </g>
      )}
    </svg>
  )
}

export function pictureOneCaption(stage: number): ReactNode {
  const trip = trialDelay('venus', 1)
  const b = flatTripBreakdown('venus', 1)
  const lookFor: LookFor[] = [
    {
      look: 'the long cyan bar in Part A.',
      means: `it is the whole round trip to Venus and back, past the Sun’s edge, with no effect from the Sun’s gravity: ${n1(b.roundTripMinutes)} minutes, or ${commas(b.roundTripSeconds)} seconds. It is worked out from the distance and the speed of light.`,
      matters: 'this is the “normal” trip. The Sun’s gravity changes it by some amount. You will see that amount on the next picture, and it has to be measured against this very long bar.',
    },
    ...(stage >= 2
      ? [
          {
            look: 'the pink line in Part B, which goes from the Earth, past the edge of the Sun, to Venus.',
            means: `it is the path of an imagined radio pulse. It is a straight line that just touches the Sun’s surface, with no gap between them. The Sun’s surface is 1 solar radius (${millions(b.closestM)} million km) from the Sun’s centre, so this path is 1 solar radius from the centre.`,
            matters: 'this is the trip that Prediction 1 asks about: a signal that passes as close to the Sun as it can without going through it.',
          },
          {
            look: 'the dashed grey line from the middle of the Sun up to the pink line.',
            means: `it is the closest distance, and it is measured from the Sun’s centre, not from its surface. Here it is 1 solar radius, ${millions(b.closestM)} million km, which is the same as the Sun’s own radius. That is why the path touches the surface.`,
            matters: 'this one number, how near the path comes to the Sun, is the thing that Prediction 2 changes, and that you can change yourself under “Now try it yourself”.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBlock
      title="Picture 1"
      intro="This picture has two parts. Part A is about time and is drawn first. Part B appears at stage 2. It is a sketch of the path of the signal, and it is not drawn to scale: the Sun is shown far bigger than it should be, so that you can see it."
      bullets={[
        <>
          <strong>Part A, the cyan bar.</strong> Its length is the time of the whole round trip, there and back, if the Sun’s gravity had no effect on the signal. The label at its right gives the time in minutes and in seconds. Cyan means “calculated here”. The note underneath says how small a microsecond is
          against it. A <strong>microsecond (µs)</strong> is one millionth of a second.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>Part B, the circles.</strong> The big amber circle is the Sun. The two small grey circles are the Earth (on the left) and Venus (on the right). In this sketch, Venus is on the far side of the Sun from the Earth. Amber means “the Sun, a labelled sketch”.
              </>,
              <>
                <strong>Part B, the pink line.</strong> It is the path of a radio pulse, with an arrow at each end because the pulse goes there and then comes back. Pink means “imagined for the question”. The two labels under it say how far each half of the path is: about {EARTH_DISTANCE_AU} AU from the Earth to the
                Sun’s edge, and about {VENUS.distanceAu} AU from the Sun’s edge to Venus. An <strong>AU</strong> is the distance from the Earth to the Sun.
              </>,
              <>
                <strong>Part B, the dashed line.</strong> It goes from the centre of the Sun up to the pink line. Its length is the <strong>closest distance</strong>: how near the path comes to the Sun’s <em>centre</em>. It is measured from the centre, not from the surface. The Sun’s surface is 1 solar radius from its centre, so a path that just touches the surface is at a closest distance of 1 solar radius. In
                a path with a closest distance of {PREDICTION_TWO_FAR_RADII} solar radii, there would be {PREDICTION_TWO_FAR_RADII - 1} solar radii of space between the path and the Sun’s surface.
              </>,
            ]
          : []),
      ]}
      worked={
        <>
          <strong>Step 1: the Earth’s half.</strong> The path from the Earth to the Sun’s edge is about {millions(b.earthLegM)} million km.
          <br />
          <strong>Step 2: Venus’s half.</strong> From the Sun’s edge to Venus it is about {millions(b.targetLegM)} million km, which is {VENUS.distanceAu} AU (a round figure for Venus’s distance).
          <br />
          <strong>Step 3: one way.</strong> {millions(b.earthLegM)} + {millions(b.targetLegM)} = {millions(b.oneWayM)} million km. Light goes {commas(SPEED_OF_LIGHT_M_PER_S / 1000)} km every second, so one way takes {millions(b.oneWayM)} million km ÷{' '}
          {commas(SPEED_OF_LIGHT_M_PER_S / 1000)} km/s = about {commas(b.oneWaySeconds)} seconds.
          <br />
          <strong>Step 4: there and back.</strong> 2 × {commas(b.oneWaySeconds)} = {commas(b.roundTripSeconds)} seconds, which is {n1(b.roundTripMinutes)} minutes. In microseconds that is {commas(trip.flatUs)} µs.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> the trip time, from the two distances and the speed of light. <strong>Imagined for the question:</strong> the straight path, and Venus on the far side of the Sun from the Earth. The planets’ distances are round figures, and real orbits are not circles, so the Earth and Venus are
          not always on opposite sides. <strong>Measured:</strong> nothing in this picture.
        </>
      }
    />
  )
}

// ---- Picture 2: the extra time, on a ruler of microseconds ----
const P2_W = 760
const P2_H = 514

export function PictureTwo({ delayGuessId }: { delayGuessId: string | null }) {
  const trip = trialDelay('venus', 1)
  const both = tripWithAndWithoutSun('venus', 1)
  const calculated = trip.delayUs
  const guess = delayGuessId === null ? null : delayGuessValueUs(delayGuessId)
  const lx = (us: number) => 60 + (640 * Math.log10(us / 0.1)) / Math.log10(1e5)
  const guessX = guess === null ? 0 : lx(guess)
  const boxW = 250
  const boxX = Math.min(Math.max(guessX - boxW / 2, 20), P2_W - boxW - 20)
  return (
    <svg viewBox={`0 0 ${P2_W} ${P2_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 2: the round trip to Venus with and without the Sun's effect, and the extra time the Sun adds, in microseconds, on a ruler where each step multiplies the value by ten">
      <SvgLines x={20} y={24} lines={['A. The same round trip, with and without the Sun’s effect']} fill={TEXT_COLOR} size={12} bold />
      <SvgLines x={20} y={64} lines={['with no effect', 'from the Sun']} fill={MUTED_COLOR} size={11} />
      <rect x={270} y={46} width={380} height={24} fill={CYAN} fillOpacity={0.4} stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={270} y={88} lines={[`${commas1(both.withoutSunUs)} µs  (${commas(both.withoutSunSeconds)} seconds)`]} fill={TEXT_COLOR} size={11} bold />
      <SvgLines x={20} y={118} lines={['with the Sun’s', 'gravity acting']} fill={MUTED_COLOR} size={11} />
      <rect x={270} y={100} width={380} height={24} fill={CYAN} fillOpacity={0.4} stroke={CYAN} strokeWidth={1.5} />
      <rect x={650} y={100} width={16} height={24} fill="#67e8f9" stroke={CYAN} strokeWidth={1.5} />
      <SvgLines x={666} y={94} lines={[`the extra time: ${n1(both.extraUs)} µs`]} fill={CYAN} size={10} bold anchor="end" />
      <SvgLines x={270} y={142} lines={[`${commas1(both.withSunUs)} µs  =  ${commas1(both.withoutSunUs)} µs  +  ${n1(both.extraUs)} µs`]} fill={TEXT_COLOR} size={11} bold />
      <SvgLines x={20} y={162} lines={['The bright block is drawn far too big so that you can see it: on this scale the extra time would be much too thin to see.', 'The two bars are really almost exactly the same length.']} fill={MUTED_COLOR} size={10} />
      <line x1={20} y1={190} x2={P2_W - 20} y2={190} stroke="#334155" />
      <g transform="translate(0,184)">
      <SvgLines x={20} y={24} lines={['B. The extra time on a ruler, in µs (millionths of a second)']} fill={TEXT_COLOR} size={12} bold />
      <SvgLines x={20} y={40} lines={['each step on the ruler multiplies the value by ten']} fill={MUTED_COLOR} size={10} />
      <line x1={lx(0.1)} y1={170} x2={lx(10000)} y2={170} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0.1, 1, 10, 100, 1000, 10000].map((v) => (
        <g key={v}>
          <line x1={lx(v)} y1={165} x2={lx(v)} y2={175} stroke={MUTED_COLOR} />
          <SvgLines x={lx(v)} y={189} lines={[v >= 1000 ? commas(v) : String(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      {guess !== null && <line x1={guessX} y1={176} x2={guessX} y2={226} stroke={YOURS_COLOR} strokeWidth={6} />}
      <line x1={lx(calculated)} y1={130} x2={lx(calculated)} y2={170} stroke={CYAN} strokeWidth={3} />
      <SvgLines x={lx(calculated) + 8} y={86} lines={['calculated here:', `${n1(calculated)} µs`, `(${n1(trip.extraPathM / 1000)} km of extra path)`]} fill={CYAN} size={10} bold />
      <line x1={lx(SHAPIRO_1964_DELAY_US)} y1={130} x2={lx(SHAPIRO_1964_DELAY_US)} y2={170} stroke={CYAN} strokeWidth={3} strokeDasharray="4 3" />
      <SvgLines x={lx(SHAPIRO_1964_DELAY_US) - 8} y={112} lines={['estimated by Shapiro in 1964 (as quoted):', `about ${SHAPIRO_1964_DELAY_US} µs`]} fill={CYAN} size={10} bold anchor="end" />
      {guess !== null && <GuessBox x={boxX} y={262} w={boxW} lines={['YOUR GUESS (Prediction 1):', `about ${guess < 1 ? guess : commas(guess)} µs longer`]} fromX={guessX} fromY={226} />}
    </g>
    </svg>
  )
}

export function pictureTwoCaption(): ReactNode {
  const trip = trialDelay('venus', 1)
  const b = flatTripBreakdown('venus', 1)
  const both = tripWithAndWithoutSun('venus', 1)
  const lookFor: LookFor[] = [
    {
      look: 'the two bars in Part A, and the bright block at the end of the lower one.',
      means: `the top bar is the round trip with no effect from the Sun: ${commas1(both.withoutSunUs)} µs. The lower bar is the same trip with the Sun’s gravity acting on the signal: ${commas1(both.withSunUs)} µs. The lower trip takes ${n1(both.extraUs)} µs longer. That difference, the bright block, is the extra time.`,
      matters: 'the extra time is the Sun’s effect, taken as the difference between two trip times. This is how it is found in the real tests too: the real trip is timed, and compared with the time worked out for no effect from the Sun.',
    },
    {
      look: 'the solid cyan mark on the ruler in Part B, labelled “calculated here”.',
      means: `by this page’s calculation, the Sun’s gravity adds ${n1(trip.delayUs)} µs to the round trip. That is the same as about ${n1(trip.extraPathM / 1000)} km of extra path for the signal.`,
      matters: `this is the extra time that Prediction 1 asked about. Set against the whole trip of ${commas(b.roundTripSeconds)} seconds, it is a very small fraction, which is why it took careful measurement to find.`,
    },
    {
      look: 'the dashed cyan mark, labelled “estimated by Shapiro in 1964”.',
      means: `Irwin Shapiro estimated that the delay for a trip like this would be about ${SHAPIRO_1964_DELAY_US} µs, which he described as “equivalent to ${SHAPIRO_1964_EQUIVALENT_PATH_KM} km”. This number is quoted from a summary of his paper. The two numbers are different, and the page does not say which is better: the calculation here is simplified, and his figure is rounded.`,
      matters: 'it shows that the effect was worked out before anyone had measured it, and that two different ways of working it out give numbers of the same size: hundreds of microseconds, not milliseconds or nanoseconds.',
    },
    {
      look: 'the white mark and the box labelled YOUR GUESS.',
      means: 'it is where your Prediction 1 guess sits on the same ruler as the real marks.',
      matters: 'seeing your guess on the ruler, beside the others, is the easiest way to compare it. The page does not mark it right or wrong; the tutor goes through each prediction later.',
    },
  ]
  return (
    <CaptionBlock
      title="Picture 2"
      intro="This picture has two parts. Part A sets the round trip with no effect from the Sun against the same round trip with the Sun’s gravity acting on the signal, so that you can see what the extra time is. Part B puts that extra time on a ruler, in microseconds, where a mark further to the right means a longer extra time. The trip is the one in Picture 1."
      bullets={[
        <>
          <strong>Part A, the two bars.</strong> Both bars are a round trip from the Earth to Venus and back, past the Sun’s edge, as in Picture 1. The top bar is the time the trip would take with no effect from the Sun, the same number as in Picture 1. The lower bar is the time with the Sun’s gravity acting on the
          signal as it passes. The numbers under them are the times in µs. A <strong>microsecond (µs)</strong> is one millionth of a second. Cyan means “calculated here”.
        </>,
        <>
          <strong>Part A, the bright block.</strong> The lower trip is longer than the top one, and the bright block at the end of its bar stands for the difference: the <strong>extra time</strong>. It is drawn far too big, so that you can see it. At the true scale it would be much too thin to see, so the two bars really are almost exactly the same
          length. The Sun’s gravity acts on the signal as it goes past, and that makes the trip take longer than it would with no Sun. Why gravity does that is what the tutor explains, after you have seen all the pictures.
        </>,
        <>
          <strong>Part B, the ruler, is uneven on purpose.</strong> Each step from one number to the next marked one multiplies the value by ten: 1 to 10 is as wide as 10 to 100, and 100 to 1,000. This lets numbers from a tenth of a microsecond to ten thousand fit on one ruler. For example, 200 µs sits a little more than
          two steps to the right of 1 µs.
        </>,
        <>
          <strong>Part B, the solid cyan mark</strong> is the extra time, the same number as the bright block in Part A, worked out by this page’s calculation for the trip in Picture 1. Under its number is how much extra path that is: light goes about {Math.round(lightDistanceInOneMicrosecondM())} metres in 1 µs, so {n1(trip.delayUs)} µs is{' '}
          {n1(trip.extraPathM / 1000)} km. Cyan means “calculated here”.
        </>,
        <>
          <strong>Part B, the dashed cyan mark</strong> is Shapiro’s own estimate from 1964, as quoted. It is dashed to show that it is someone else’s calculation, quoted and not worked out here.
        </>,
        <>
          <strong>The white mark and box</strong> are your Prediction 1 guess, drawn on the same ruler. They show only your guess. They do not change anything else in the picture.
        </>,
      ]}
      worked={
        <>
          <strong>Step 1: the two trip times.</strong> With no effect from the Sun the round trip takes {commas1(both.withoutSunUs)} µs. With the Sun’s gravity acting it takes {commas1(both.withSunUs)} µs.
          <br />
          <strong>Step 2: the difference.</strong> {commas1(both.withSunUs)} − {commas1(both.withoutSunUs)} = {n1(both.extraUs)} µs, which is {(trip.delayUs / 1e6).toFixed(7)} of a second. This is the extra time.
          <br />
          <strong>Step 3: as extra path.</strong> Light goes {commas(SPEED_OF_LIGHT_M_PER_S / 1000)} km every second, so in {(trip.delayUs / 1e6).toFixed(7)} s it goes {n1(trip.extraPathM / 1000)} km.
          <br />
          <strong>Step 4: against the whole trip.</strong> {n1(trip.delayUs)} µs ÷ {commas(trip.flatUs)} µs = {(trip.delayOverFlat * 1e7).toFixed(1)} parts in ten million of the trip.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> the solid cyan mark, from a formula for the extra time. It is the main part of the formula, applied to a straight path. A fuller calculation adds another, smaller term, which this page leaves out; it is thought to add about {Math.round(FULLER_TERM_RECALLED_US)} µs for this trip, a figure remembered and not read from a
          source, so the page does not use it. The planets’ distances are round figures. <strong>Estimated by someone else, quoted here:</strong> the dashed mark (Shapiro, 1964, as summarised by Wikipedia; the paper was not read). <strong>Measured:</strong> nothing in this picture; the real tests are in Picture 4.{' '}
          <strong>Imagined for the question:</strong> the straight path and the planets’ positions, as in Picture 1.
        </>
      }
    />
  )
}

// ---- Picture 3: the extra time against the closest distance ----
const P3_W = 760
const P3_H = 400
const P3_MAX_US = 260

export function PictureThree({ distanceGuessId }: { distanceGuessId: string | null }) {
  const px = (radii: number) => 90 + (580 * Math.log10(radii)) / 2
  const py = (us: number) => 320 - (230 * us) / P3_MAX_US
  const curve = Array.from({ length: 41 }, (_, i) => {
    const radii = Math.pow(10, (2 * i) / 40)
    return `${px(radii).toFixed(1)},${py(trialDelay('venus', radii).delayUs).toFixed(1)}`
  }).join(' ')
  const marked = [...CLOSEST_CHOICES_RADII]
  const guess = distanceGuessId === null ? null : guessedFarDelayUs(distanceGuessId)
  const guessX = px(PREDICTION_TWO_FAR_RADII)
  const boxW = 290
  const boxX = 110
  // The box sits next to the guess bar: above it for a high bar, below it for a middle one, and above a bar that is near the bottom, so the joining line stays short and clear of the curve.
  const guessY = guess === null ? 0 : py(guess)
  const boxY = guess === null ? 0 : guessY < 170 ? Math.max(guessY - 80, 40) : guessY < 280 ? 250 : 215
  return (
    <svg viewBox={`0 0 ${P3_W} ${P3_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 3: the extra round-trip time to Venus against how close the signal passes to the Sun, from 1 to 100 solar radii">
      <SvgLines x={20} y={24} lines={['The extra round-trip time to Venus, against how close the signal passes to the Sun']} fill={TEXT_COLOR} size={12} bold />
      <line x1={px(1)} y1={py(0)} x2={px(100)} y2={py(0)} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={px(1)} y1={py(0)} x2={px(1)} y2={py(250)} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 50, 100, 150, 200, 250].map((v) => (
        <g key={v}>
          <line x1={px(1) - 5} y1={py(v)} x2={px(1)} y2={py(v)} stroke={MUTED_COLOR} />
          <SvgLines x={px(1) - 9} y={py(v) + 4} lines={[String(v)]} fill={MUTED_COLOR} size={10} anchor="end" />
        </g>
      ))}
      <SvgLines x={20} y={py(125)} lines={['extra', 'time', '(µs)']} fill={MUTED_COLOR} size={10} />
      {[1, 10, 100].map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={py(0)} x2={px(v)} y2={py(0) + 6} stroke={MUTED_COLOR} />
          <SvgLines x={px(v)} y={py(0) + 20} lines={[String(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={px(10)} y={py(0) + 38} lines={['closest distance to the Sun’s centre, in solar radii (each step multiplies by ten)']} fill={MUTED_COLOR} size={10} anchor="middle" />
      <polyline points={curve} fill="none" stroke={CYAN} strokeWidth={3} />
      <SvgLines x={px(20) + 12} y={py(trialDelay('venus', 20).delayUs) - 36} lines={['calculated here: the extra time', 'for every closest distance']} fill={CYAN} size={10} bold />
      {marked.map((v) => {
        const d = trialDelay('venus', v).delayUs
        return (
          <g key={v}>
            <circle cx={px(v)} cy={py(d)} r={5} fill={CYAN} />
            <SvgLines x={v === 1 ? px(v) + 10 : px(v)} y={v === 1 ? py(d) - 8 : py(d) - 10} lines={[`${n1(d)}`]} fill={CYAN} size={10} bold anchor={v === 1 ? 'start' : 'middle'} />
          </g>
        )
      })}
      {guess !== null && (
        <g>
          <line x1={guessX - 14} y1={py(guess)} x2={guessX + 14} y2={py(guess)} stroke={YOURS_COLOR} strokeWidth={6} />
          <GuessBox x={boxX} y={boxY} w={boxW} lines={['YOUR GUESS (Prediction 2):', `if the extra time at 1 radius became`, `${distanceGuessTimesSmaller(distanceGuessId!) === 1 ? 'the same' : `${distanceGuessTimesSmaller(distanceGuessId!)} times smaller`}, it would be ${n1(guess)} µs here`]} fromX={guessX} fromY={py(guess)} />
        </g>
      )}
    </svg>
  )
}

export function pictureThreeCaption(): ReactNode {
  const near = trialDelay('venus', 1)
  const far = trialDelay('venus', PREDICTION_TWO_FAR_RADII)
  const farthest = trialDelay('venus', FARTHEST_CLOSEST_RADII)
  const lookFor: LookFor[] = [
    {
      look: 'the cyan curve, from its left end to its right end.',
      means: `it goes down as the closest distance gets larger, but slowly. From 1 solar radius to ${PREDICTION_TWO_FAR_RADII}, which is ten times farther, the extra time goes from ${n1(near.delayUs)} µs to ${n1(far.delayUs)} µs. At ${FARTHEST_CLOSEST_RADII} solar radii it is still ${n1(farthest.delayUs)} µs.`,
      matters: 'a signal that passes far from the Sun is still delayed, by a smaller amount. The Sun’s gravity reaches a long way.',
    },
    {
      look: 'the two numbers at 1 and at 10 on the ruler along the bottom.',
      means: `${n1(near.delayUs)} ÷ ${n1(far.delayUs)} = ${(near.delayUs / far.delayUs).toFixed(2)}. Ten times farther out makes the extra time about ${(near.delayUs / far.delayUs).toFixed(2)} times smaller.`,
      matters: 'this is the comparison Prediction 2 asked about. It is much less than the factor of ten that the change in distance might make you expect.',
    },
    {
      look: 'the short white bar and the box labelled YOUR GUESS.',
      means: `it shows where the extra time at ${PREDICTION_TWO_FAR_RADII} solar radii would be if your guess were right. It is drawn from the real value at 1 solar radius, which is the cyan dot at the far left, divided by the number in your guess. It is only a marker for your guess.`,
      matters: 'the gap between the white bar and the cyan dot above it at 10 is how far your guess is from the calculation. The page does not mark it right or wrong; the tutor does that later.',
    },
  ]
  return (
    <CaptionBlock
      title="Picture 3"
      intro="This picture is a graph. It shows how the extra round-trip time changes when the signal passes the Sun at different distances. It is for the same trip as Picture 2, from the Earth to Venus and back."
      bullets={[
        <>
          <strong>The bottom ruler</strong> is the closest distance of the path to the Sun’s centre, in solar radii, from 1 (a path that just touches the Sun’s surface) to {FARTHEST_CLOSEST_RADII}. It is uneven on purpose: each step multiplies the value by ten, so 1 to 10 is as wide as 10 to 100. A <strong>solar radius</strong> is the distance from the Sun’s
          centre to its surface, about {commas(SUN_RADIUS_M / 1000)} km.
        </>,
        <>
          <strong>The left ruler</strong> is the extra round-trip time in microseconds, from 0 up. A higher point means a longer extra time. This ruler is even: each step is the same size.
        </>,
        <>
          <strong>The cyan curve and the cyan dots.</strong> Cyan means “calculated here”. The curve is the extra time for every closest distance from 1 to {FARTHEST_CLOSEST_RADII}. The {CLOSEST_CHOICES_RADII.length === 6 ? 'six' : CLOSEST_CHOICES_RADII.length} dots mark the distances you can choose under “Now try it yourself” ({CLOSEST_CHOICES_RADII.slice(0, -1).join(', ')} and {FARTHEST_CLOSEST_RADII} solar radii), with the extra time written above each.
        </>,
        <>
          <strong>The white bar and box</strong> are your Prediction 2 guess, drawn at {PREDICTION_TWO_FAR_RADII} solar radii. They show only your guess. They do not change anything else in the picture. Since your guess was a comparison and not a number, the bar is placed at the real value at 1 solar radius ({n1(near.delayUs)} µs) divided by what
          you chose (“2 times smaller” gives {n1(near.delayUs / 2)}). It is only a marker.
        </>,
      ]}
      worked={
        <>
          <strong>Step 1: close to the Sun.</strong> At 1 solar radius ({millions(SUN_RADIUS_M)} million km from the Sun’s centre) the extra time is {n1(near.delayUs)} µs.
          <br />
          <strong>Step 2: ten times farther out.</strong> At {PREDICTION_TWO_FAR_RADII} solar radii ({millions(SUN_RADIUS_M * PREDICTION_TWO_FAR_RADII)} million km) it is {n1(far.delayUs)} µs.
          <br />
          <strong>Step 3: compare them.</strong> {n1(near.delayUs)} ÷ {n1(far.delayUs)} = {(near.delayUs / far.delayUs).toFixed(2)}. So the extra time is about {(near.delayUs / far.delayUs).toFixed(1)} times smaller, not ten times smaller.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> the curve and the dots, from the same formula as Picture 2 (the main part of it, applied to a straight path), for the Earth at 1 AU and Venus at {VENUS.distanceAu} AU. <strong>Measured:</strong> nothing in this picture; the page does not claim that any test measured the delay at each of these distances. <strong>Imagined for the
          question:</strong> the straight path and the planets’ positions. The white bar is a marker for your guess and not a calculation.
        </>
      }
    />
  )
}

// ---- Picture 4: how closely three tests pinned the delay down ----
const P4_W = 760
const P4_H = 330

export function PictureFour() {
  const p = testPrecisionsPpm()
  const lx = (ppm: number) => 90 + (580 * Math.log10(ppm / 10)) / 5
  const rows = [
    { y: 100, label: ['Shapiro, 1964:', 'his estimate of what', 'a radar test could do'] },
    { y: 170, label: ['Viking landers on', 'Mars, 1979:', 'measured'] },
    { y: 240, label: ['Cassini spacecraft,', '2002: measured'] },
  ]
  return (
    <svg viewBox={`0 0 ${P4_W} ${P4_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 4: how closely three tests pinned down the size of the delay, in parts per million">
      <SvgLines x={20} y={24} lines={['How closely each test pinned the delay down, in parts per million (a smaller number is a closer fit)']} fill={TEXT_COLOR} size={12} bold />
      <line x1={lx(10)} y1={290} x2={lx(1e6)} y2={290} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[10, 100, 1000, 10000, 100000, 1000000].map((v) => (
        <g key={v}>
          <line x1={lx(v)} y1={285} x2={lx(v)} y2={295} stroke={MUTED_COLOR} />
          <SvgLines x={lx(v)} y={309} lines={[commas(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      {rows.map((r) => (
        <g key={r.y}>
          <SvgLines x={20} y={r.y - 8} lines={r.label} fill={MUTED_COLOR} size={10} />
          <line x1={lx(10)} y1={r.y + 20} x2={lx(1e6)} y2={r.y + 20} stroke="#334155" />
        </g>
      ))}
      <rect x={lx(p.shapiroEstimateLow)} y={rows[0].y + 8} width={lx(p.shapiroEstimateHigh) - lx(p.shapiroEstimateLow)} height={24} fill={CYAN} fillOpacity={0.4} stroke={CYAN} strokeWidth={2} strokeDasharray="4 3" />
      <SvgLines x={lx(p.shapiroEstimateLow) - 8} y={rows[0].y + 24} lines={[`${SHAPIRO_1964_PRECISION_PERCENT_LOW} to ${SHAPIRO_1964_PRECISION_PERCENT_HIGH} percent`]} fill={CYAN} size={10} bold anchor="end" />
      <line x1={lx(p.viking)} y1={rows[1].y + 6} x2={lx(p.viking)} y2={rows[1].y + 34} stroke={GREEN} strokeWidth={4} />
      <SvgLines x={lx(p.viking) + 10} y={rows[1].y + 24} lines={[`about 1 part in ${commas(1e6 / p.viking)} (${commas(p.viking)} ppm)`]} fill={GREEN} size={10} bold />
      <line x1={lx(p.cassini)} y1={rows[2].y + 6} x2={lx(p.cassini)} y2={rows[2].y + 34} stroke={GREEN} strokeWidth={4} />
      <SvgLines x={lx(p.cassini) + 10} y={rows[2].y + 24} lines={[`${p.cassini} parts per million`]} fill={GREEN} size={10} bold />
      <SvgLines x={20} y={326} lines={['parts per million (ppm): each step to the right multiplies the value by ten']} fill={MUTED_COLOR} size={10} />
    </svg>
  )
}

export function pictureFourCaption(): ReactNode {
  const p = testPrecisionsPpm()
  const lookFor: LookFor[] = [
    {
      look: 'the three marks, from the top row to the bottom row.',
      means: `each mark is further to the left than the one above it: Shapiro’s estimate of ${SHAPIRO_1964_PRECISION_PERCENT_LOW} to ${SHAPIRO_1964_PRECISION_PERCENT_HIGH} percent, then about 1 part in ${commas(1e6 / p.viking)} (${p.viking / 1e4} percent) for the Viking landers in 1979, then ${p.cassini} parts per million (${p.cassini / 1e4} percent) for Cassini in 2002. NASA’s release says the Cassini test was ${CASSINI_IMPROVEMENT_FACTOR_JPL} times closer than the earlier ones.`,
      matters: `the delay was first an idea, then it was checked roughly, and then it was checked very closely. A test that pins the delay down to ${p.cassini} parts per million leaves very little room for the true value to differ from the one the theory gives.`,
    },
    {
      look: 'the two green marks, and the cyan dashed bar above them.',
      means: 'the green marks are measured by others. The cyan dashed bar is not a measurement: it is how well Shapiro thought a radar test could do, before the first one was made.',
      matters: 'it keeps what was predicted separate from what was found, which is the whole point of a test.',
    },
  ]
  return (
    <CaptionBlock
      title="Picture 4"
      intro="This picture is about how well the delay has been tested in the real world, not about what this page calculated. It has one ruler, which shows how closely each test pinned down the size of the delay. A mark further to the left means a closer fit."
      bullets={[
        <>
          <strong>The ruler is in parts per million (ppm).</strong> “1 part per million” means 1 in every 1,000,000. So 1,000 ppm is 1 in 1,000, which is 0.1 percent, and 10,000 ppm is 1 percent. Each step to the right multiplies the value by ten, so the ruler can hold very different numbers.
        </>,
        <>
          <strong>The top row, the dashed cyan bar.</strong> In 1964 Shapiro estimated that a radar test could pin the delay down to about {SHAPIRO_1964_PRECISION_PERCENT_LOW} to {SHAPIRO_1964_PRECISION_PERCENT_HIGH} percent ({commas(p.shapiroEstimateLow)} to {commas(p.shapiroEstimateHigh)} ppm). It is a bar because he gave a range. It is an estimate made before any test, quoted here.
        </>,
        <>
          <strong>The middle row, the green mark.</strong> Radio tests with the Viking landers on Mars in 1979 pinned the delay down to about 1 part in {commas(1e6 / p.viking)}, which NASA’s release gives as the accuracy of earlier tests. Green means “measured by others”.
        </>,
        <>
          <strong>The bottom row, the green mark.</strong> The Cassini spacecraft, on its way to Saturn in 2002, was used in a test that NASA’s release says confirmed the prediction to {p.cassini} parts per million.
        </>,
      ]}
      worked={
        <>
          <strong>Step 1: Viking.</strong> 1 part in {commas(1e6 / p.viking)} is {commas(p.viking)} parts in 1,000,000, which is {p.viking / 1e4} percent.
          <br />
          <strong>Step 2: Cassini.</strong> {p.cassini} parts per million is {p.cassini} in 1,000,000, which is {p.cassini / 1e4} percent.
          <br />
          <strong>Step 3: compare.</strong> {commas(p.viking)} ÷ {p.cassini} = {p.vikingOverCassini}. The Cassini test was {p.vikingOverCassini} times closer than the Viking one, which matches NASA’s “{CASSINI_IMPROVEMENT_FACTOR_JPL} times greater”.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured by others, quoted here:</strong> the Viking figure and the Cassini figure, as they are stated in NASA’s release about the Cassini test. The papers behind them were not read in full. <strong>Estimated by someone else, quoted here:</strong> the dashed bar (Shapiro, 1964, as summarised by Wikipedia;
          the paper was not read). <strong>Calculated here:</strong> only the conversion into parts per million. <strong>Imagined for the question:</strong> nothing. Your guesses are not drawn on this picture.
        </>
      }
    />
  )
}
