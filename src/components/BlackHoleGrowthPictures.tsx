import type { ReactNode } from 'react'
import {
  MASS_TICKS_SOLAR,
  eddingtonTimeYears,
  SEED_CHOICES,
  TIME_CHOICES,
  TIME_TICKS_YEARS,
  massRulerPosition,
  pictureOne,
  pictureTwo,
  seedGuessMarker,
  timeGuessMarker,
  timeRulerPosition,
} from '../physics/blackHoleGrowth'
import type { SeedChoiceId, TimeChoiceId, TrialPicture } from '../physics/blackHoleGrowth'
import { LookForList } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 23: Picture 1 (the clock for growth) and Picture 2 (the object's mass and the smallest seed), with their captions.
// Every number drawn or written here is read from the physics module (CLAUDE.md §9); this file only draws it. Colours: violet is a black hole, cyan is calculated here,
// orange is estimated from a measurement, pink is imagined for the question, yellow is light and glowing gas, and white is always the learner's guess (CLAUDE.md §14).

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const BLACK_HOLE_COLOR = '#a78bfa'
const CALC_COLOR = '#22d3ee'
const MEASURED_COLOR = '#fb923c'
const IMAGINED_COLOR = '#f472b6'
const LIGHT_COLOR = '#fde047'
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

const VIEW_WIDTH = 560

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size + 3}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

// ---- Number formats (display only) ----
export function n1(x: number): string {
  return x.toFixed(1)
}
export function commas(x: number): string {
  return Math.round(x).toLocaleString('en-US')
}
// A number of years as "758 million years" (a thousand million is a billion).
export function myr(years: number): string {
  return `${commas(years / 1e6)} million years`
}
function myrShort(years: number): string {
  return `${commas(years / 1e6)} Myr`
}
function solar(x: number): string {
  return `${commas(x)} Suns`
}

const TIME_TICK_LABELS: Record<number, string> = { 1e6: '1 Myr', 1e7: '10 Myr', 1e8: '100 Myr', 1e9: '1 Gyr', 1e10: '10 Gyr' }
const MASS_TICK_LABELS: Record<number, string> = { 1: '1', 10: '10', 100: '100', 1e3: '1,000', 1e4: '10,000', 1e5: '100,000', 1e6: '1 million', 1e7: '10 million', 1e8: '100 million', 1e9: '1 billion' }

function GuessMark({ x, rulerY, label, boxW }: { x: number; rulerY: number; label: string; boxW: number }) {
  const boxX = Math.min(540 - boxW, Math.max(20, x - boxW / 2))
  return (
    <g>
      <line x1={x} y1={rulerY} x2={x} y2={rulerY + 56} stroke={YOURS_COLOR} strokeWidth={4} />
      <polygon points={`${x},${rulerY} ${x - 7},${rulerY + 12} ${x + 7},${rulerY + 12}`} fill={YOURS_COLOR} />
      <rect x={boxX} y={rulerY + 56} width={boxW} height={28} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
      <SvgLines x={boxX + boxW / 2} y={rulerY + 74} lines={[label]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
    </g>
  )
}

// A labelled mark standing above a ruler: a line up to a label row.
function Flag({ x, rulerY, row, label, color, dashed = true, anchor = 'middle' }: { x: number; rulerY: number; row: number; label: string; color: string; dashed?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  const top = rulerY - 28 - row * 16
  return (
    <g>
      <line x1={x} y1={top + 4} x2={x} y2={rulerY} stroke={color} strokeWidth={2} strokeDasharray={dashed ? '5 3' : undefined} />
      <SvgLines x={x} y={top} lines={[label]} fill={color} bold size={10} anchor={anchor} />
    </g>
  )
}

// A list of legend entries, each of one or more lines, stacked from a starting height (SVG text does not wrap).
function Legend({ x, y, items, size = 10 }: { x: number; y: number; items: { lines: string[]; color: string }[]; size?: number }) {
  let at = y
  return (
    <g>
      {items.map((item, i) => {
        const here = at
        at += item.lines.length * (size + 3) + 5
        return <SvgLines key={i} x={x} y={here} lines={item.lines} fill={item.color} bold size={size} />
      })}
    </g>
  )
}

// ---- Picture 1 ----
export function PictureOne({ stage, timeGuess }: { stage: number; timeGuess: TimeChoiceId | null }) {
  const pic = pictureOne()
  const height = stage >= 3 ? 690 : 270
  const rulerY = 570
  const x0 = 40
  const x1 = 520
  const rx = (pos: number) => x0 + pos * (x1 - x0)
  const guess = timeGuess ? timeGuessMarker(timeGuess) : null
  const guessLabel = timeGuess ? TIME_CHOICES.find((c) => c.id === timeGuess)!.label : ''
  const stairX = 316
  const stairBarX = 410
  const stairScale = 24
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1. Panel A: a sketch, not to scale, of a black hole with a glowing disc of gas. Gas falls in, pulled by gravity, and the light of the glowing gas pushes it out. ${
        stage >= 2
          ? `A staircase of bars shows the mass of a black hole that began at ${pic.seedSolar} Suns after each growth time of ${myr(pic.growthTimeYears)}: ${pic.steps.map((s) => solar(s.massSolar)).join(', ')}. Each step multiplies the mass by the same factor, about 2.72. `
          : ''
      }${
        stage >= 3
          ? `Panel B: a ruler of times from 1 million years to 10 billion years, going up in steps of ten. A cyan dot marks one growth time, ${myr(pic.growthTimeYears)}. A cyan dot marks the time needed to grow from ${pic.seedSolar} Suns to ${commas(pic.targetSolar / 1e6)} million Suns, ${myr(pic.neededYears)}.${
              guess ? ` Your guess for Prediction 1 is a white marker at ${guessLabel}.` : ''
            } `
          : ''
      }${
        stage >= 4
          ? `A cyan dot marks the age of the universe when the light of CAPERS-LRD-z9 left it, ${myr(pic.ageYears)}. A pink line marks the time the seed starts to feed, ${myr(pic.startAgeYears)}, and a pale cyan band between them is the time available, ${myr(pic.availableYears)}.`
          : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: how long a black hole takes to grow
      </text>
      <SvgLines x={20} y={38} lines={['A. A sketch of a black hole feeding, not to scale.']} fill={MUTED_COLOR} />

      {/* The black hole, its disc of glowing gas, the gas falling in, the pull and the push */}
      <ellipse cx={230} cy={130} rx={46} ry={10} fill="none" stroke={LIGHT_COLOR} strokeWidth={2} />
      <circle cx={230} cy={130} r={15} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} />
      {[60, 85, 110, 135].map((x) => (
        <circle key={x} cx={x} cy={130} r={5} fill={LIGHT_COLOR} />
      ))}
      <line x1={50} y1={156} x2={170} y2={156} stroke={BLACK_HOLE_COLOR} strokeWidth={3} />
      <polygon points="180,156 168,150 168,162" fill={BLACK_HOLE_COLOR} />
      <SvgLines x={20} y={174} lines={['violet arrow: gravity pulls the gas in']} fill={BLACK_HOLE_COLOR} bold size={10} />
      <line x1={170} y1={104} x2={50} y2={104} stroke={LIGHT_COLOR} strokeWidth={3} />
      <polygon points="40,104 52,98 52,110" fill={LIGHT_COLOR} />
      <SvgLines x={20} y={90} lines={['yellow arrow: light pushes the gas out']} fill={LIGHT_COLOR} bold size={10} />
      <SvgLines x={20} y={204} lines={['yellow dots: gas falling in']} fill={LIGHT_COLOR} bold size={10} />
      <SvgLines x={20} y={219} lines={['yellow ring: the glowing disc of gas']} fill={LIGHT_COLOR} bold size={10} />
      <SvgLines x={20} y={234} lines={['violet circle: the black hole']} fill={BLACK_HOLE_COLOR} bold size={10} />

      {stage >= 2 && (
        <g>
          <line x1={300} y1={46} x2={300} y2={254} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="3 4" />
          <SvgLines x={stairX} y={60} lines={[`A black hole of ${pic.seedSolar} Suns feeding at the limit,`, `its mass after each growth time (${myr(pic.growthTimeYears)}):`]} fill={CALC_COLOR} bold size={9} />
          {pic.steps.map((s, i) => {
            const y = 96 + i * 26
            return (
              <g key={s.growthTimes}>
                <SvgLines x={stairX} y={y + 9} lines={[s.growthTimes === 0 ? 'at the start' : `after ${s.growthTimes} growth time${s.growthTimes > 1 ? 's' : ''}`]} fill={TEXT_COLOR} size={9} />
                <rect x={stairBarX} y={y} width={s.log10Mass * stairScale} height={14} fill={CALC_COLOR} fillOpacity={0.75} />
                <SvgLines x={stairBarX + s.log10Mass * stairScale + 4} y={y + 10} lines={[solar(s.massSolar)]} fill={CALC_COLOR} size={9} bold />
              </g>
            )
          })}
          <SvgLines x={stairX} y={96 + 6 * 26 + 6} lines={[`each step multiplies the mass by the same factor, ${(Math.E).toFixed(2)}`]} fill={MUTED_COLOR} size={9} />
        </g>
      )}

      {stage >= 3 && (
        <g>
          <line x1={20} y1={286} x2={540} y2={286} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="3 4" />
          <SvgLines x={20} y={308} lines={['B. The time a black hole needs, and the time the universe had']} fill={TEXT_COLOR} bold size={11} />
          <SvgLines x={20} y={324} lines={['A ruler of times, not of equal steps: each step to the right multiplies the time by ten.', 'Myr means million years and Gyr means billion years.']} fill={MUTED_COLOR} size={9} />
          <Legend
            x={20}
            y={358}
            items={[
              { lines: [`cyan dot, left: one growth time, ${myrShort(pic.growthTimeYears)}, calculated`], color: CALC_COLOR },
              {
                lines: [`cyan dot, right: the time for ${pic.seedSolar} Suns to grow to ${commas(pic.targetSolar / 1e6)} million Suns,`, `${n1(pic.growthTimesNeeded)} growth times, ${myrShort(pic.neededYears)}, calculated`],
                color: CALC_COLOR,
              },
              ...(stage >= 4
                ? [
                    { lines: [`cyan dot: the universe’s age when the light of CAPERS-LRD-z9`, `left it, ${myrShort(pic.ageYears)}, calculated`], color: CALC_COLOR },
                    { lines: [`pink line: when the seed starts to feed, ${myrShort(pic.startAgeYears)}, imagined for the question`], color: IMAGINED_COLOR },
                    { lines: [`pale cyan band: the time available, ${myrShort(pic.availableYears)}, calculated`], color: CALC_COLOR },
                  ]
                : []),
            ]}
          />

          <line x1={x0} y1={rulerY} x2={x1} y2={rulerY} stroke={MUTED_COLOR} strokeWidth={1} />
          {TIME_TICKS_YEARS.map((t) => (
            <g key={t}>
              <line x1={rx(timeRulerPosition(t))} y1={rulerY} x2={rx(timeRulerPosition(t))} y2={rulerY + 5} stroke={MUTED_COLOR} />
              <text x={rx(timeRulerPosition(t))} y={rulerY + 17} fill={MUTED_COLOR} fontSize={9} textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
                {TIME_TICK_LABELS[t]}
              </text>
            </g>
          ))}
          {stage >= 4 && <rect x={rx(pic.startPosition)} y={rulerY - 16} width={rx(pic.agePosition) - rx(pic.startPosition)} height={16} fill={CALC_COLOR} fillOpacity={0.3} />}
          {/* Labels end at their line and the lines get taller from left to right, so that no line crosses a label. */}
          <Flag x={rx(pic.growthTimePosition)} rulerY={rulerY} row={0} label="one growth time" color={CALC_COLOR} anchor="end" />
          {stage >= 4 && <Flag x={rx(pic.startPosition)} rulerY={rulerY} row={1} label="seed starts feeding" color={IMAGINED_COLOR} dashed={false} anchor="end" />}
          {stage >= 4 && <Flag x={rx(pic.agePosition)} rulerY={rulerY} row={2} label="age of the universe" color={CALC_COLOR} anchor="end" />}
          <Flag x={rx(pic.neededPosition)} rulerY={rulerY} row={3} label="time needed" color={CALC_COLOR} anchor="end" />
          <circle cx={rx(pic.growthTimePosition)} cy={rulerY} r={6} fill={CALC_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <circle cx={rx(pic.neededPosition)} cy={rulerY} r={6} fill={CALC_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          {stage >= 4 && <circle cx={rx(pic.agePosition)} cy={rulerY} r={6} fill={CALC_COLOR} stroke="#0b1020" strokeWidth={1.5} />}
          {guess && timeGuess && <GuessMark x={rx(guess.position)} rulerY={rulerY} label={`YOUR GUESS: ${guessLabel}`} boxW={330} />}
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2 ----
export function PictureTwo({ seedGuess }: { seedGuess: SeedChoiceId | null }) {
  const pic = pictureTwo()
  const rulerY = 205
  const x0 = 40
  const x1 = 520
  const rx = (pos: number) => x0 + pos * (x1 - x0)
  const guess = seedGuess ? seedGuessMarker(seedGuess) : null
  const guessLabel = seedGuess ? SEED_CHOICES.find((c) => c.id === seedGuess)!.label : ''
  return (
    <svg
      width={VIEW_WIDTH}
      height={300}
      viewBox="0 0 560 300"
      style={svgStyle}
      role="img"
      aria-label={`Picture 2. A ruler of black hole masses from 1 Sun to 1 billion Suns, going up in steps of ten. An orange dot marks the estimated mass of the black hole of CAPERS-LRD-z9, ${commas(pic.targetSolar / 1e6)} million Suns, and an orange band runs from ${commas(pic.lowSolar / 1e6)} million to ${commas(pic.highSolar / 1e6)} million Suns. A cyan dot marks the smallest seed that could grow to that mass in ${myr(pic.availableYears)}, ${solar(pic.smallestSeedSolar)}. A violet dot marks a black hole of ${pic.stellarSeedSolar} Suns.${
        guess ? ` Your guess for Prediction 2 is a white marker at ${guessLabel}.` : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: the black hole of CAPERS-LRD-z9 and the smallest seed
      </text>
      <SvgLines x={20} y={38} lines={['A ruler of masses, not of equal steps: each step to the right multiplies the mass by ten.']} fill={MUTED_COLOR} size={9} />
      <Legend
        x={20}
        y={62}
        items={[
          {
            lines: [`orange dot and band: the estimated mass of its black hole, ${commas(pic.targetSolar / 1e6)} million Suns`, `(range ${n1(pic.lowSolar / 1e6)} to ${commas(pic.highSolar / 1e6)} million), estimated from a measured spectrum`],
            color: MEASURED_COLOR,
          },
          {
            lines: [`cyan dot: the smallest seed that could grow to ${commas(pic.targetSolar / 1e6)} million Suns in`, `${myrShort(pic.availableYears)} at the limit, ${solar(pic.smallestSeedSolar)}, calculated (${n1(pic.growthTimesFromSmallest)} growth times)`],
            color: CALC_COLOR,
          },
          { lines: [`violet dot: a black hole of ${pic.stellarSeedSolar} Suns, the seed of Prediction 1, for comparison`], color: BLACK_HOLE_COLOR },
        ]}
      />

      <line x1={x0} y1={rulerY} x2={x1} y2={rulerY} stroke={MUTED_COLOR} strokeWidth={1} />
      {MASS_TICKS_SOLAR.map((m) => (
        <g key={m}>
          <line x1={rx(massRulerPosition(m))} y1={rulerY} x2={rx(massRulerPosition(m))} y2={rulerY + 5} stroke={MUTED_COLOR} />
          <text x={rx(massRulerPosition(m))} y={rulerY + 17} fill={MUTED_COLOR} fontSize={8} textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
            {MASS_TICK_LABELS[m]}
          </text>
        </g>
      ))}
      <rect x={rx(pic.lowPosition)} y={rulerY - 16} width={rx(pic.highPosition) - rx(pic.lowPosition)} height={16} fill={MEASURED_COLOR} fillOpacity={0.35} />
      <Flag x={rx(pic.stellarSeedPosition)} rulerY={rulerY} row={0} label={`${pic.stellarSeedSolar} Suns`} color={BLACK_HOLE_COLOR} />
      <Flag x={rx(pic.smallestSeedPosition)} rulerY={rulerY} row={0} label="smallest seed" color={CALC_COLOR} />
      <Flag x={rx(pic.targetPosition)} rulerY={rulerY} row={0} label="its estimated mass" color={MEASURED_COLOR} />
      <circle cx={rx(pic.stellarSeedPosition)} cy={rulerY} r={6} fill={BLACK_HOLE_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <circle cx={rx(pic.smallestSeedPosition)} cy={rulerY} r={6} fill={CALC_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <circle cx={rx(pic.targetPosition)} cy={rulerY} r={6} fill={MEASURED_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      {guess && seedGuess && <GuessMark x={rx(guess.position)} rulerY={rulerY} label={`YOUR GUESS: ${guessLabel}`} boxW={330} />}
    </svg>
  )
}

// ---- Captions ----
const captionParagraph = { marginTop: 0, marginBottom: '0.75rem' } as const

export function CaptionBlock({ title, intro, bullets, worked, lookFor, whereFrom }: { title: string; intro: ReactNode; bullets: ReactNode[]; worked: ReactNode | null; lookFor: LookFor[]; whereFrom: ReactNode }) {
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' }}>
      <p style={captionParagraph}>
        <strong>How to read {title}.</strong> {intro}
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {worked !== null && (
        <p style={captionParagraph}>
          <strong>A worked moment.</strong> {worked}
        </p>
      )}
      {lookFor.length > 0 && (
        <>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList items={lookFor} />
        </>
      )}
      <p style={{ ...captionParagraph, marginTop: '0.75rem' }}>
        <strong>Where the real picture comes from.</strong> {whereFrom}
      </p>
    </div>
  )
}

export function pictureOneCaption(stage: number): ReactNode {
  const pic = pictureOne()
  const e = Math.round(pic.efficiency * 100)
  return (
    <CaptionBlock
      title="Picture 1"
      intro="Panel A is a sketch of a black hole feeding, not drawn to scale. From stage 2 it also has a staircase of bars on its right. Panel B, which appears from stage 3, is a ruler of times, on a different scale from panel A."
      bullets={[
        <>
          <strong>The violet circle</strong> is the black hole, and <strong>the yellow ring</strong> round it is the disc of glowing gas that swirls round it before it is swallowed. <strong>The yellow dots</strong> are gas falling in.
        </>,
        <>
          <strong>The violet arrow</strong> is gravity pulling the gas in, and <strong>the yellow arrow</strong> is the push of the glowing gas’s light, pushing it out. A black hole that feeds as fast as it can is one where these two are equal.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>The cyan bars</strong> are the mass of a black hole that begins at {pic.seedSolar} Suns and feeds at the limit all the time, with an efficiency of {e} percent, after 0, 1, 2, 3, 4 and 5 <strong>growth times</strong>. One growth time is the time in which the mass is multiplied
                by {Math.E.toFixed(2)}. At this efficiency it is {myr(pic.growthTimeYears)}. A bar’s length shows how many times the mass has been multiplied by ten, starting from 1 Sun (10 Suns is one step, 100 is two, 1,000 is three), so a mass that is multiplied by the same factor at each step makes a bar that is longer by the same amount each time.
              </>,
            ]
          : []),
        ...(stage >= 3
          ? [
              <>
                <strong>Panel B</strong> is a ruler of times from 1 million years (1 Myr) to 10 billion years (10 Gyr). It goes up in steps of ten, so each step to the right multiplies the time by ten.
              </>,
              <>
                <strong>The two cyan dots on the left and the middle</strong> are one growth time ({myr(pic.growthTimeYears)}), and the time it takes a black hole of {pic.seedSolar} Suns to reach {commas(pic.targetSolar / 1e6)} million Suns, which takes {n1(pic.growthTimesNeeded)} growth times, so{' '}
                {myr(pic.neededYears)}.
              </>,
              <>
                <strong>The white marker, with the box “YOUR GUESS”,</strong> is your guess for Prediction 1. It sits at the time you guessed.
              </>,
            ]
          : []),
        ...(stage >= 4
          ? [
              <>
                <strong>The cyan dot labelled “age of the universe”</strong> is how old the universe was when the light of CAPERS-LRD-z9 left it, {myr(pic.ageYears)}. <strong>The pink line</strong> marks the moment a seed starts to feed, {myr(pic.startAgeYears)} after the Big Bang. This is
                imagined for the question. <strong>The pale cyan band</strong> between them is the time the seed has to grow, {myr(pic.availableYears)}.
              </>,
            ]
          : []),
      ]}
      worked={
        stage >= 3 ? (
          <>
            Growing from {pic.seedSolar} Suns to {commas(pic.targetSolar / 1e6)} million Suns is a factor of {commas(pic.targetSolar / pic.seedSolar)}. The number of growth times is how many times you must multiply by {Math.E.toFixed(2)} to make that factor, which is {n1(pic.growthTimesNeeded)}. At
            {' '}{myr(pic.growthTimeYears)} each, that is {n1(pic.growthTimesNeeded)} × {n1(pic.growthTimeYears / 1e6)} million years = {myr(pic.neededYears)}.
            {stage >= 4 ? <> The time available is {myr(pic.ageYears)} − {myr(pic.startAgeYears)} = {myr(pic.availableYears)}.</> : null}
          </>
        ) : null
      }
      lookFor={[
        ...(stage >= 2
          ? [
              {
                look: 'the staircase of cyan bars, and how much longer each one is than the one above it.',
                means: `each bar is longer than the last by the same length, because the mass is multiplied by the same factor, ${Math.E.toFixed(2)}, in each growth time of ${myr(pic.growthTimeYears)}. After 5 growth times, ${myr(pic.steps[5].years)}, the mass has grown from ${pic.seedSolar} to ${solar(pic.steps[5].massSolar)}.`,
                matters: 'growth at the limit is not a steady addition but a repeated multiplying, and the time a black hole needs depends on how many times it has to multiply.',
              },
            ]
          : []),
        ...(stage >= 3
          ? [
              {
                look: 'the cyan dot on the right of the first pair, against the white marker.',
                means: `the time a black hole of ${pic.seedSolar} Suns needs to reach ${commas(pic.targetSolar / 1e6)} million Suns is ${myr(pic.neededYears)}, and your guess sits at the white marker.`,
                matters: 'it shows at a glance how your guess compares with the calculated time. The tutor says what that means.',
              },
            ]
          : []),
        ...(stage >= 4
          ? [
              {
                look: 'the cyan dot for the time needed, and the end of the pale cyan band.',
                means: `the time needed, ${myr(pic.neededYears)}, is about ${pic.neededOverAvailable.toFixed(1)} times the time available, ${myr(pic.availableYears)}. It is ${myr(pic.shortfallYears)} longer.`,
                matters: 'the question of the experiment is whether there was enough time. This is the comparison that answers it for a seed of this size. The tutor explains what it does and does not show.',
              },
            ]
          : []),
      ]}
      whereFrom={
        <>
          <strong>Estimated from a measurement:</strong> the redshift of CAPERS-LRD-z9, 9.288, was measured from JWST’s spectrum (arXiv:2505.04609, read in its abstract through summaries). <strong>Calculated here:</strong> the growth time (from the Eddington limit, with a textbook
          value, {commas(eddingtonTimeYears() / 1e6)} million years, for the Eddington time, and {e} percent efficiency), the staircase, the time needed, and the age of the universe at that redshift (Experiment 5’s model, with the Planck satellite’s values). <strong>Imagined for the question:</strong> the
          seed of {pic.seedSolar} Suns, that it feeds at the limit all the time, the {e} percent efficiency and the start at {myr(pic.startAgeYears)}. Your guess is drawn in white and never changes the real picture.
        </>
      }
    />
  )
}

export function pictureTwoCaption(): ReactNode {
  const pic = pictureTwo()
  const p1 = pictureOne()
  const e = Math.round(p1.efficiency * 100)
  return (
    <CaptionBlock
      title="Picture 2"
      intro="This is a ruler of black hole masses, from 1 Sun to a billion Suns. It goes up in steps of ten, so each step to the right multiplies the mass by ten. It shows where the mass of the black hole of CAPERS-LRD-z9 lies, and how small a seed could grow to that mass."
      bullets={[
        <>
          <strong>The orange dot and the orange band</strong> are the estimated mass of the black hole of CAPERS-LRD-z9, {commas(pic.targetSolar / 1e6)} million Suns, and the range that its authors give, from {n1(pic.lowSolar / 1e6)} million to {commas(pic.highSolar / 1e6)} million Suns. The mass is
          worked out from the width of a line in a spectrum, so it has a wide give-or-take.
        </>,
        <>
          <strong>The cyan dot</strong> is the smallest seed that could reach {commas(pic.targetSolar / 1e6)} million Suns in the time available, {myr(pic.availableYears)}, feeding at the limit all the time at {e} percent efficiency: {solar(pic.smallestSeedSolar)}. It is calculated here.
        </>,
        <>
          <strong>The violet dot</strong> is a black hole of {pic.stellarSeedSolar} Suns, the seed of Prediction 1, drawn for comparison.
        </>,
        <>
          <strong>The white marker, with the box “YOUR GUESS”,</strong> is your guess for Prediction 2. It sits at the seed mass you guessed.
        </>,
      ]}
      worked={
        <>
          A seed of {solar(pic.smallestSeedSolar)} must be multiplied up to {commas(pic.targetSolar / 1e6)} million Suns, a factor of {commas(pic.objectOverSmallest)}. That takes {n1(pic.growthTimesFromSmallest)} growth times, and at {myr(p1.growthTimeYears)} each that is {n1(pic.growthTimesFromSmallest)} × {n1(p1.growthTimeYears / 1e6)} million
          years = {myr(pic.yearsFromSmallest)}, which is the time available. A smaller seed would need more time than that.
        </>
      }
      lookFor={[
        {
          look: 'the cyan dot, against the white marker.',
          means: `the smallest seed that fits in ${myr(pic.availableYears)} is ${solar(pic.smallestSeedSolar)}, and your guess sits at the white marker.`,
          matters: 'it shows at a glance how your guess compares with the calculated seed. The tutor says what that means.',
        },
        {
          look: 'the violet dot of 10 Suns, to the left of the cyan dot.',
          means: `the smallest seed that fits is about ${commas(pic.smallestOverStellar)} times heavier than ${pic.stellarSeedSolar} Suns.`,
          matters: 'it shows how far a seed of tens of Suns, the kind a single collapsing star would leave, is from the seed that this calculation needs. The tutor explains what that does and does not mean.',
        },
        {
          look: 'the orange band, and how wide it is.',
          means: `the estimated mass could be anywhere from ${n1(pic.lowSolar / 1e6)} million to ${commas(pic.highSolar / 1e6)} million Suns, a spread of a factor of about ${commas(pic.highSolar / pic.lowSolar)}.`,
          matters: 'the answer to the question depends on a mass that is not well known. A lower mass needs a smaller seed or less time.',
        },
      ]}
      whereFrom={
        <>
          <strong>Estimated from a measurement:</strong> the mass of the black hole of CAPERS-LRD-z9 and its range (arXiv:2505.04609, read in its abstract through summaries), worked out from a line in JWST’s spectrum under one reading of that line. <strong>Calculated here:</strong> the smallest
          seed, from the growth time and the time available. <strong>Imagined for the question:</strong> that the seed starts to feed at {myr(p1.startAgeYears)}, that it feeds at the limit all the time, and the {e} percent efficiency. Your guess is drawn in white and never changes the real picture.
        </>
      }
    />
  )
}

// ---- Drawing A (Part 2): the trial seed ----

export const TRIAL_SEED_LABELS: Record<number, string> = {
  10: '10 Suns (the seed of Prediction 1)',
  1e3: '1,000 Suns',
  1e5: '100,000 Suns',
  1e6: '1 million Suns',
}

// An efficiency (a fraction) as a number of percent, with one decimal only where it has one (5.7, 10, 40).
export function efficiencyPercent(fraction: number): string {
  const v = Math.round(fraction * 1000) / 10
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

export function TrialDrawing({ trial }: { trial: TrialPicture }) {
  const rulerY = 170
  const x0 = 40
  const x1 = 520
  const rx = (pos: number) => x0 + pos * (x1 - x0)
  const dotX = rx(trial.reachesAtAgePosition)
  const boxW = 330
  const boxX = Math.min(540 - boxW, Math.max(20, dotX - boxW / 2))
  const pct = efficiencyPercent(trial.efficiency)
  const verdict = trial.fits
    ? [`It reaches the mass in time: ${myr(-trial.lateByYears)} before the universe is as old`, 'as when the light of CAPERS-LRD-z9 left it.']
    : [`It reaches the mass too late: ${myr(trial.lateByYears)} after the universe is as old`, 'as when the light of CAPERS-LRD-z9 left it.']
  return (
    <svg
      width={VIEW_WIDTH}
      height={460}
      viewBox="0 0 560 460"
      style={svgStyle}
      role="img"
      aria-label={`Drawing A. A ruler of the age of the universe, from 1 million years to 10 billion years, going up in steps of ten. A pink dot, in a box labelled YOUR TRIAL SEED, marks the age at which a seed of ${TRIAL_SEED_LABELS[trial.seedSolar] ?? solar(trial.seedSolar)} with an efficiency of ${pct} percent would reach ${commas(trial.targetSolar / 1e6)} million Suns: ${myr(trial.reachesAtAgeYears)}. A cyan line marks ${myr(trial.objectAgeYears)}, the age of the universe when the light of CAPERS-LRD-z9 left it. A pink line marks ${myr(trial.startAgeYears)}, when the seed starts to feed, and a pale cyan band between them is the time available. A cyan dashed line marks ${myr(trial.pictureOneReachesAtAgeYears)}, where the black hole of Picture 1 reaches that mass. ${trial.fits ? 'The trial seed reaches the mass before the age of CAPERS-LRD-z9.' : 'The trial seed reaches the mass after the age of CAPERS-LRD-z9.'}`}
    >
      <SvgLines x={20} y={22} lines={['Drawing A. When your trial seed would reach the mass of CAPERS-LRD-z9’s black hole']} fill={TEXT_COLOR} bold size={11} />
      <SvgLines x={20} y={38} lines={['Trial values: imagined for the question, not a real seed. The ruler is the age of the universe.']} fill={IMAGINED_COLOR} size={9} />

      <rect x={rx(trial.startAgePosition)} y={rulerY - 38} width={rx(trial.objectAgePosition) - rx(trial.startAgePosition)} height={76} fill={CALC_COLOR} opacity={0.16} />
      <line x1={x0} y1={rulerY} x2={x1} y2={rulerY} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {TIME_TICKS_YEARS.map((t) => (
        <g key={t}>
          <line x1={rx(timeRulerPosition(t))} y1={rulerY - 4} x2={rx(timeRulerPosition(t))} y2={rulerY + 4} stroke={MUTED_COLOR} />
          <SvgLines x={rx(timeRulerPosition(t))} y={rulerY + 17} lines={[TIME_TICK_LABELS[t]]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <SvgLines x={x1} y={rulerY + 52} lines={['age of the universe; Myr = million years, Gyr = billion years']} fill={MUTED_COLOR} size={9} anchor="end" />

      <line x1={rx(trial.startAgePosition)} y1={rulerY - 38} x2={rx(trial.startAgePosition)} y2={rulerY + 38} stroke={IMAGINED_COLOR} strokeWidth={2} />
      <line x1={rx(trial.objectAgePosition)} y1={rulerY - 38} x2={rx(trial.objectAgePosition)} y2={rulerY + 38} stroke={CALC_COLOR} strokeWidth={2.5} />
      <line x1={rx(trial.pictureOneReachesAtAgePosition)} y1={rulerY - 34} x2={rx(trial.pictureOneReachesAtAgePosition)} y2={rulerY + 34} stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="5 4" />

      <line x1={dotX} y1={rulerY - 56} x2={dotX} y2={rulerY} stroke={IMAGINED_COLOR} strokeWidth={1.5} />
      <circle cx={dotX} cy={rulerY} r={7} fill={IMAGINED_COLOR} stroke="#ffffff" strokeWidth={1} />
      <rect x={boxX} y={rulerY - 92} width={boxW} height={36} rx={4} fill="#0b1020" stroke={IMAGINED_COLOR} strokeWidth={2} />
      <SvgLines x={boxX + boxW / 2} y={rulerY - 76} lines={['YOUR TRIAL SEED', `reaches ${commas(trial.targetSolar / 1e6)} million Suns when the universe is ${myrShort(trial.reachesAtAgeYears)} old`]} fill={IMAGINED_COLOR} bold size={10} anchor="middle" />

      <Legend
        x={20}
        y={rulerY + 78}
        items={[
          { lines: [`pale cyan band: the time available, ${myrShort(trial.yearsAvailable)}, calculated`], color: CALC_COLOR },
          { lines: [`solid cyan line: the universe’s age when the light of CAPERS-LRD-z9 left it, ${myrShort(trial.objectAgeYears)}, calculated`], color: CALC_COLOR },
          { lines: [`pink line: when the seed starts to feed, ${myrShort(trial.startAgeYears)}, imagined for the question`], color: IMAGINED_COLOR },
          { lines: [`dashed cyan line: where Picture 1’s black hole (10 Suns, 10 percent) reaches that mass, ${myrShort(trial.pictureOneReachesAtAgeYears)}, calculated`], color: CALC_COLOR },
        ]}
        size={9}
      />
      <SvgLines
        x={20}
        y={rulerY + 172}
        lines={[
          `Trial seed: ${TRIAL_SEED_LABELS[trial.seedSolar] ?? solar(trial.seedSolar)}, efficiency ${pct} percent.`,
          `One growth time is ${myr(trial.growthTimeYears)}. It needs ${n1(trial.growthTimes)} growth times (${n1(trial.doublings)} doublings),`,
          `so ${myr(trial.yearsNeeded)}, against ${myr(trial.yearsAvailable)} available.`,
          ...verdict,
        ]}
        fill={TEXT_COLOR}
        size={10}
      />
    </svg>
  )
}

export function trialCaption(trial: TrialPicture): ReactNode {
  const pct = efficiencyPercent(trial.efficiency)
  const seed = TRIAL_SEED_LABELS[trial.seedSolar] ?? solar(trial.seedSolar)
  const isPictureOne = Math.abs(trial.reachesAtAgeYears - trial.pictureOneReachesAtAgeYears) < 1
  return (
    <CaptionBlock
      title="Drawing A"
      intro="It shows when the black hole of your trial seed would reach the mass of the black hole of CAPERS-LRD-z9, as an age of the universe. The ruler is the age of the universe, from 1 million years to 10 billion years. It goes up in steps of ten, so that short and long times fit on one line."
      bullets={[
        <>
          <strong>The pink dot, in the box “YOUR TRIAL SEED”,</strong> is the age of the universe at which your trial seed, feeding at the limit all the time, would have grown to {commas(trial.targetSolar / 1e6)} million Suns. It is the start age plus the time it needs, and it is calculated here for a seed that is
          imagined for the question.
        </>,
        <>
          <strong>The solid cyan line</strong> is the age of the universe when the light of CAPERS-LRD-z9 left it, {myr(trial.objectAgeYears)}. A black hole that has reached that mass before this age is a black hole that could be the one we see. One that reaches it after this age could not have been.
        </>,
        <>
          <strong>The pink line</strong> is the moment the seed starts to feed, {myr(trial.startAgeYears)}. It is imagined for the question, the same for every trial. <strong>The pale cyan band</strong> between the two lines is the time available, {myr(trial.yearsAvailable)}.
        </>,
        <>
          <strong>The dashed cyan line</strong> is a fixed mark: the age at which the black hole of Picture 1 (10 Suns, at 10 percent) reaches that mass, {myr(trial.pictureOneReachesAtAgeYears)}. It stays where it is when you change a setting, so you can see how far the pink dot moves from it.
        </>,
        <>
          <strong>The four lines of text underneath</strong> give your trial’s numbers: the growth time, the number of growth times and doublings, the time needed and the time available, and whether the mass is reached before or after the age of CAPERS-LRD-z9.
        </>,
      ]}
      worked={
        <>
          You chose {seed} and an efficiency of {pct} percent. One growth time is {myr(trial.growthTimeYears)}. Growing from {solar(trial.seedSolar)} to {commas(trial.targetSolar / 1e6)} million Suns needs {n1(trial.growthTimes)} growth times, which is {n1(trial.doublings)} doublings. {n1(trial.growthTimes)} × {n1(trial.growthTimeYears / 1e6)} million
          years = {myr(trial.yearsNeeded)}. Starting at {myr(trial.startAgeYears)}, it reaches the mass when the universe is {myr(trial.reachesAtAgeYears)} old, which is {trial.fits ? `${myr(-trial.lateByYears)} before` : `${myr(trial.lateByYears)} after`} the age of CAPERS-LRD-z9.
          {isPictureOne ? ' These are the settings of Picture 1, so the pink dot sits on the dashed cyan line.' : ''}
        </>
      }
      lookFor={[
        {
          look: 'the pink dot, against the solid cyan line.',
          means: `your trial seed reaches ${commas(trial.targetSolar / 1e6)} million Suns when the universe is ${myr(trial.reachesAtAgeYears)} old, ${trial.fits ? 'to the left of' : 'to the right of'} the line at ${myr(trial.objectAgeYears)}.`,
          matters: 'the line is the latest age by which a black hole must have reached that mass to be the one we see. Left of it there is enough time in this model; right of it there is not.',
        },
        {
          look: 'the pink dot, beside the dashed cyan line.',
          means: `your trial reaches the mass ${trial.reachesAtAgeYears === trial.pictureOneReachesAtAgeYears ? 'at the same age as' : trial.reachesAtAgeYears < trial.pictureOneReachesAtAgeYears ? 'earlier than' : 'later than'} Picture 1’s black hole (${myr(trial.pictureOneReachesAtAgeYears)}).`,
          matters: 'a heavier seed saves growth times, and a lower efficiency makes each growth time shorter. Changing only one setting at a time shows what each does.',
        },
      ]}
      whereFrom={
        <>
          <strong>Estimated from a measurement:</strong> the age of the universe when CAPERS-LRD-z9’s light left it comes from its measured redshift, 9.288. <strong>Calculated here:</strong> the growth time, the time needed and the age at which the mass is reached, from the Eddington growth formula, and the age of the
          universe at the redshift (Experiment 5’s model). <strong>Imagined for the question:</strong> the trial seed and efficiency, in pink, which you chose, and the start at {myr(trial.startAgeYears)}. These are trial values and do not say that a real black hole is like that.
        </>
      }
    />
  )
}
