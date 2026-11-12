import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PREDICTION_KEYS,
  STRENGTH_AXIS_TOP,
  STRENGTH_CAP,
  endStrengths,
  formatStrength,
  guessMarkerFor,
  isCapped,
  predictionSetup,
  rawStrength,
  strengthLine,
  strengthOf,
  strengthsForMassAndDistance,
  sweepRange,
  workedNumbers,
  refresherNumbers,
  part2Examples,
  MEDIUM_DISTANCE,
  MEDIUM_MASS,
} from '../physics/spacetimeCurvatureSourceExperiment'
import type { Effect, PredictionChoice, PredictionKey } from '../physics/spacetimeCurvatureSourceExperiment'
import { runGravitationalTimeDilationExperiment, tickCountAt } from '../physics/gravitationalTimeDilationExperiment'
import { runTidalEffectExperiment, EARTH_GRAVITY, finalSeparationMeters } from '../physics/tidalEffectExperiment'
import { RocketCabinClocks, RUN_DURATION_FLOOR_SECONDS } from './GravitationalTimeDilationExperiment'
import { INITIAL_HEIGHT_METERS, INITIAL_SEPARATION_METERS, LabelledCabin, Block, CaptionBox, ExternalLink, GuessArrow, GuessTag, LookFor, WhereFrom, listStyle, paragraph, smallNote } from './TidalEffectExperiment'
import { SpacetimeCurvatureSourceTutor } from './SpacetimeCurvatureSourceTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'

// Gravity and Curved Spacetime, Experiment 5, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/05-draft-wording.md,
// approved by the owner on 2026-11-12 "all approved"): the page in four Parts, four small strength graphs with four white ring
// markers for the four guesses, the mass and distance controls and Experiment 2's clocks and Experiment 3's cabins moved to Part 2,
// a words box, links, Start over and a tutor that marks all four guesses. Every number drawn comes from the physics module
// (src/physics/spacetimeCurvatureSourceExperiment.ts; CLAUDE.md §9). Experiments 2 and 3 are used unchanged.

// Both Part 2 panels animate over this same real-world duration when the learner clicks Run (CLAUDE.md §11: playback speed must
// not change the physical result, only how long the learner waits to see it).
const ANIMATION_DURATION_MS = 2500
// Before the learner runs Part 2, the panels show a fixed illustrative moment rather than animating.
const CLOCK_SNAPSHOT_FLOOR_SECONDS = 5
const TIDAL_SNAPSHOT_FALL_FRACTION = 0.6

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const DILATION_COLOR = '#818cf8' // indigo: the time-dilation strength (solid)
const TIDAL_COLOR = '#f59e0b' // amber: the tidal strength (dashed)
const YOURS_LIGHT_COLOR = '#f9a8d4' // light pink: the tidal strength in Part 2's own mass and distance (dashed)
const REFERENCE_COLOR = '#9ca3af' // grey: Part 1's line, for comparison

type MassPreset = 1 | 2 | 4 | 'other'
type DistancePreset = 1 | 2 | 4 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

export type { PredictionChoice, PredictionKey }

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'stronger', label: 'Get stronger' },
  { value: 'weaker', label: 'Get weaker' },
  { value: 'same', label: 'Stay the same' },
]

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

const MASS_PRESETS: Array<{ value: 1 | 2 | 4; label: string }> = [
  { value: 1, label: 'Small' },
  { value: 2, label: 'Medium' },
  { value: 4, label: 'Large' },
]

const DISTANCE_PRESETS: Array<{ value: 1 | 2 | 4; label: string }> = [
  { value: 1, label: 'Close' },
  { value: 2, label: 'Medium' },
  { value: 4, label: 'Far' },
]

function labelForPreset(preset: 1 | 2 | 4 | 'other', presets: Array<{ value: 1 | 2 | 4; label: string }>, customValue: number): string {
  return preset === 'other' ? `custom (${customValue})` : presets.find((p) => p.value === preset)!.label
}

export const predictionQuestions: Array<{ key: PredictionKey; label: string; prompt: string }> = [
  {
    key: 'closerDilation',
    label: 'Closer mass, time dilation',
    prompt:
      'If you moved the mass closer, would the ceiling-clock time-dilation effect from Experiment 2 get stronger, weaker, or stay the same?',
  },
  {
    key: 'closerTidal',
    label: 'Closer mass, tidal effect',
    prompt:
      'If you moved the mass closer, would the tidal drifting-together effect from Experiment 3 get stronger, weaker, or stay the same?',
  },
  {
    key: 'biggerDilation',
    label: 'Bigger mass, time dilation',
    prompt: 'If you used a bigger mass instead, would the time-dilation effect get stronger, weaker, or stay the same?',
  },
  {
    key: 'biggerTidal',
    label: 'Bigger mass, tidal effect',
    prompt:
      'If you used a bigger mass instead, would the tidal effect (the two balls drifting together) get stronger, weaker, or stay the same?',
  },
]

// Pages fetched on 12 November 2026 (see the audit's draft wording, section 2). The first is neutral and linked from the start. The
// other three say what the experiment is about, so they appear only after the tutor's explanation (§12).
const START_LINKS = [
  {
    href: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/free-fall-without-air-resistance/',
    label: 'NASA Glenn: "Free Fall without Air Resistance"',
    what: 'a plain explanation of g: with no air, every object falls with the same acceleration, 9.8 metres per second every second at Earth’s surface. (NASA Glenn Research Center, Beginner’s Guide to Aeronautics; page dated 18 July 2024.)',
  },
]

const AFTER_LINKS = [
  {
    href: 'https://spaceplace.nasa.gov/what-is-gravity/en/',
    label: 'NASA Space Place: "What Is Gravity?"',
    what: 'a short page for kids on gravity: more mass gives more gravity, and gravity weakens with distance. It also shows Einstein’s picture of gravity as a curve in space. (NASA Science for Kids; article last updated 17 December 2020.)',
  },
  {
    href: 'https://www.nesdis.noaa.gov/about/k-12-education/oceans-coasts/what-causes-tides',
    label: 'NOAA NESDIS: "What Causes Tides?"',
    what: 'a short, plain page on how the Moon’s pull on the Earth differs from place to place, which links to the tidal drifting-together of Experiment 3. (NOAA’s K-12 education pages, made with NASA’s Space Place team at JPL; 2 September 2025; for grades 5 to 8.)',
  },
  {
    href: 'https://www.nist.gov/atomic-clocks/a-powerful-tool-for-science/putting-einstein-test',
    label: 'NIST: "Putting Einstein to the Test"',
    what: 'how clocks at different heights tick at slightly different rates, and why GPS clocks need correcting. It names the size of the GPS correction: about 38 millionths of a second per day. (NIST; created 3 April 2025, updated 17 April 2025.)',
  },
]

// The "Words and formulas" box. Its numbers come from the physics module (CLAUDE.md §9). The two formulas are not in it: they would
// show the answer to the predictions (§12), so they appear in the Part 1 caption after the run.
function referenceEntries(): { term: string; meaning: string }[] {
  return [
    {
      term: 'Mass (relative)',
      meaning: 'how much stuff a body is made of. Here it is a plain number, Small (1), Medium (2) or Large (4), not kilograms.',
    },
    {
      term: 'Distance (relative)',
      meaning: 'how far away the body is. Here it is a plain number, Close (1), Medium (2) or Far (4), not metres.',
    },
    {
      term: 'Relative preset',
      meaning: 'a plain number that stands in for a real measurement, so that the effects are easy to see.',
    },
    {
      term: 'Time-dilation strength',
      meaning:
        'the number from Experiment 2 that sets how much faster the ceiling clock ticks than the floor clock. No unit, between 0.05 and 0.9 here.',
    },
    {
      term: 'Tidal strength',
      meaning:
        'the number from Experiment 3 (called “strength” there) that sets how much the two balls drift together. No unit, between 0.02 and 0.9 here.',
    },
    {
      term: 'Cap',
      meaning:
        'the biggest value the page lets a strength reach, 0.9. If a calculation comes out bigger, the page uses 0.9 instead, because Experiments 2 and 3 cannot accept more.',
    },
    {
      term: 'First-order',
      meaning: 'a simplified version of the real physics that keeps the biggest effect and ignores tiny corrections.',
    },
    { term: 'Spacetime', meaning: 'space and time taken together, as one thing.' },
    { term: 'Tick', meaning: 'one beat of a clock. Experiment 2’s two clocks are compared by counting their ticks.' },
    { term: 'Separation', meaning: 'the distance between the two balls, in metres. It starts at 1 m.' },
    {
      term: 'Graph (line)',
      meaning: 'a picture of how one number changes as another does. Here each line shows a strength at each mass or each distance.',
    },
  ]
}

// ---- one strength graph ----
// Each graph is 420 wide. The top strip holds the white YOUR GUESS box (Part 1), joined to its ring by a thin line; the ring and its
// arrow sit at the right-hand end of the line, so the right margin leaves room for the arrow.
const GW = 420
const GH = 320
const G = { left: 56, right: 48, top: 92, bottom: 66 }
const SAMPLES = 30

const EFFECT_NAME: Record<Effect, string> = { dilation: 'Time-dilation strength', tidal: 'Tidal strength' }

interface LineStyle {
  color: string
  dashed?: boolean
  thin?: boolean
}

interface GraphLine {
  fixedValue: number
  range: { start: number; end: number }
  style: LineStyle
}

// The graph's own x scale: the sweep's start sits at the left edge and its end at the right edge.
function xScale(range: { start: number; end: number }) {
  const plotW = GW - G.left - G.right
  return (v: number) => G.left + ((v - range.start) / (range.end - range.start)) * plotW
}
const yFor = (strength: number) => G.top + (1 - strength / STRENGTH_AXIS_TOP) * (GH - G.top - G.bottom)

export function StrengthGraph({
  effect,
  variable,
  line,
  reference,
  reveal,
  dot,
  guess,
  yourDot,
}: {
  effect: Effect
  variable: 'distance' | 'mass'
  // The line to draw, its mass or distance held fixed, and the sweep that sets the axis.
  line: GraphLine
  // Part 1's line, kept in grey in Part 2.
  reference?: { fixedValue: number; range: { start: number; end: number } }
  // 0 to 1: how much of the line is drawn (the Run plays it).
  reveal: number
  // The learner's chosen value of the swept variable, drawn as a dot once the line is complete (Part 2).
  dot?: number | null
  // The learner's guess, drawn as a white ring only once the line is complete (Part 1).
  guess?: { key: PredictionKey; choice: PredictionChoice } | null
  yourDot?: boolean
}) {
  const range = line.range
  const xFor = xScale(range)
  const complete = reveal >= 1
  const count = Math.max(1, Math.round(SAMPLES * Math.min(Math.max(reveal, 0), 1)))
  const sweep = (r: { start: number; end: number }, fixed: number, fraction: number) =>
    strengthLine(effect, variable, fixed, { start: r.start, end: r.start + (r.end - r.start) * fraction }, count)
  const pathFrom = (pts: Array<{ x: number; strength: number }>) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.x).toFixed(1)} ${yFor(p.strength).toFixed(1)}`).join(' ')

  const shownFraction = Math.min(Math.max(reveal, 0), 1)
  const pts = sweep(range, line.fixedValue, shownFraction)
  const head = pts[pts.length - 1]
  const refPts = reference ? strengthLine(effect, variable, reference.fixedValue, reference.range, SAMPLES) : null

  const startLabel = variable === 'distance' ? 'Far' : 'Small'
  const endLabel = variable === 'distance' ? 'Close' : 'Large'
  const presetTicks = (variable === 'distance' ? [4, 2, 1] : [1, 2, 4]).filter(
    (v) => v >= Math.min(range.start, range.end) - 1e-9 && v <= Math.max(range.start, range.end) + 1e-9
  )
  const tickName = (v: number) =>
    variable === 'distance' ? (v === 4 ? 'Far' : v === 2 ? 'Medium' : 'Close') : v === 1 ? 'Small' : v === 2 ? 'Medium' : 'Large'

  const plotRight = GW - G.right
  const marker = guess ? guessMarkerFor(guess.key, guess.choice) : null
  const ringY = marker ? yFor(marker.strength) : 0
  const color = line.style.color

  return (
    <svg
      className="narrow-scroll"
      viewBox={`0 0 ${GW} ${GH}`}
      role="img"
      aria-label={`Graph of the ${EFFECT_NAME[effect].toLowerCase()} against the ${variable} of the mass, from ${startLabel} to ${endLabel}.`}
      style={{ ...svgStyle, width: '100%', maxWidth: `${GW}px`, margin: '0 auto' }}
    >
      {/* axes */}
      <line x1={G.left} y1={G.top} x2={G.left} y2={GH - G.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={G.left} y1={GH - G.bottom} x2={plotRight} y2={GH - G.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 0.5, 1].map((v) => (
        <text key={v} x={G.left - 8} y={yFor(v) + 4} fontSize="12" fill={MUTED_COLOR} textAnchor="end">
          {v}
        </text>
      ))}
      {/* the cap */}
      <line x1={G.left} y1={yFor(STRENGTH_CAP)} x2={plotRight} y2={yFor(STRENGTH_CAP)} stroke={MUTED_COLOR} strokeWidth={0.9} strokeDasharray="3 4" />
      <text x={G.left + 6} y={yFor(STRENGTH_CAP) - 5} fontSize="10" fill={MUTED_COLOR}>
        cap: {STRENGTH_CAP}, the most this page can use
      </text>
      {presetTicks.map((v) => (
        <g key={v}>
          <line x1={xFor(v)} y1={GH - G.bottom} x2={xFor(v)} y2={GH - G.bottom + 5} stroke={MUTED_COLOR} />
          <text x={xFor(v)} y={GH - G.bottom + 20} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
            {tickName(v)} ({v})
          </text>
        </g>
      ))}
      <text x={(G.left + plotRight) / 2} y={GH - 8} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        {variable === 'distance' ? 'Distance of the mass' : 'Mass'}
      </text>
      <text x={14} y={(G.top + GH - G.bottom) / 2} fontSize="12" fill={TEXT_COLOR} textAnchor="middle" transform={`rotate(-90 14 ${(G.top + GH - G.bottom) / 2})`}>
        {EFFECT_NAME[effect]}
      </text>

      {refPts && (
        <path d={pathFrom(refPts)} fill="none" stroke={REFERENCE_COLOR} strokeWidth={1.5} strokeLinecap="round" />
      )}
      <path
        d={pathFrom(pts)}
        fill="none"
        stroke={color}
        strokeWidth={line.style.thin ? 1.5 : line.style.dashed ? 2 : 3}
        strokeDasharray={line.style.dashed ? '6 4' : undefined}
        strokeLinecap="round"
      />
      {!complete && <circle cx={xFor(head.x)} cy={yFor(head.strength)} r={5} fill={color} stroke="#0b1020" strokeWidth={1.5} />}

      {/* the strength at each end of the line, written under the axis once the line is complete (so that nothing covers the line or the ring) */}
      {complete &&
        (() => {
          const ends = strengthLine(effect, variable, line.fixedValue, range, 1)
          return ends.map((p, i) => (
            <text key={i} x={xFor(p.x)} y={GH - G.bottom + 36} fontSize="12" fontWeight="bold" fill={color} textAnchor="middle">
              strength {formatStrength(p.strength)}
            </text>
          ))
        })()}

      {/* the learner's chosen value: a dot on the line (Part 2) */}
      {complete && yourDot && dot != null && (
        <circle
          cx={xFor(dot)}
          cy={yFor(variable === 'distance' ? strengthOf(effect, line.fixedValue, dot) : strengthOf(effect, dot, line.fixedValue))}
          r={6}
          fill={YOURS_COLOR}
          stroke="#0b1020"
          strokeWidth={2}
        />
      )}

      {/* the white mark, once the line is complete */}
      {complete && marker && guess && (
        <g>
          {(() => {
            const [head1, tail] = marker.boxText.split(': ')
            const [line1, rest] = head1.split(' (')
            const boxX = 16
            const boxW = GW - 32
            const boxH = 52
            const boxY = 10
            return (
              <>
                <line x1={plotRight} y1={ringY - 11} x2={plotRight} y2={boxY + boxH} stroke={GUESS_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
                <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
                <text x={boxX + 10} y={boxY + 16} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
                  {line1}
                </text>
                <text x={boxX + 10} y={boxY + 31} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
                  ({rest}:
                </text>
                <text x={boxX + 10} y={boxY + 46} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
                  {tail}
                </text>
                <circle cx={plotRight} cy={ringY} r={11} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
                <GuessArrow x={plotRight + 26} y={ringY} arrow={marker.arrow === 'up' ? 'up' : marker.arrow === 'down' ? 'down' : 'none'} />
              </>
            )
          })()}
        </g>
      )}
    </svg>
  )
}

const KEY_TITLE: Record<PredictionKey, string> = {
  closerDilation: 'Time-dilation strength as the mass moves closer (Medium mass)',
  closerTidal: 'Tidal strength as the mass moves closer (Medium mass)',
  biggerDilation: 'Time-dilation strength as the mass gets bigger (Medium distance)',
  biggerTidal: 'Tidal strength as the mass gets bigger (Medium distance)',
}

const PART1_STYLE: Record<Effect, LineStyle> = {
  dilation: { color: DILATION_COLOR },
  tidal: { color: TIDAL_COLOR, dashed: true },
}
const PART2_STYLE: Record<Effect, LineStyle> = {
  dilation: { color: YOURS_COLOR },
  tidal: { color: YOURS_LIGHT_COLOR, dashed: true },
}

// Part 1: the four graphs in a 2 x 2 grid. The two upper graphs sweep the distance at Medium mass; the two lower sweep the mass at
// Medium distance. A white ring marks each guess at the right-hand end of its line, once its line is drawn.
export function Part1Graphs({
  reveal,
  guesses,
}: {
  reveal: number
  guesses: Record<PredictionKey, PredictionChoice | null> | null
}) {
  const order: PredictionKey[] = ['closerDilation', 'closerTidal', 'biggerDilation', 'biggerTidal']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
      {order.map((key) => {
        const setup = predictionSetup(key)
        const choice = guesses?.[key] ?? null
        return (
          <div key={key}>
            <p style={{ fontWeight: 'bold', fontSize: '0.875rem', margin: '0 0 0.35rem' }}>{KEY_TITLE[key]}</p>
            <StrengthGraph
              effect={setup.effect}
              variable={setup.variable}
              line={{ fixedValue: setup.fixedValue, range: { start: setup.from, end: setup.to }, style: PART1_STYLE[setup.effect] }}
              reveal={reveal}
              guess={choice ? { key, choice } : null}
            />
          </div>
        )
      })}
    </div>
  )
}

// Part 2: the same four graphs for the learner's mass and distance, with a pink dot, and Part 1's line in grey.
export function Part2Graphs({ mass, distance, reveal }: { mass: number; distance: number; reveal: number }) {
  const rows: Array<{ key: PredictionKey; title: string }> = [
    { key: 'closerDilation', title: `Time-dilation strength against distance (your mass, ${+mass.toFixed(3)})` },
    { key: 'closerTidal', title: `Tidal strength against distance (your mass, ${+mass.toFixed(3)})` },
    { key: 'biggerDilation', title: `Time-dilation strength against mass (your distance, ${+distance.toFixed(3)})` },
    { key: 'biggerTidal', title: `Tidal strength against mass (your distance, ${+distance.toFixed(3)})` },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
      {rows.map(({ key, title }) => {
        const setup = predictionSetup(key)
        const range = sweepRange(setup.variable, setup.variable === 'distance' ? distance : mass)
        const fixed = setup.variable === 'distance' ? mass : distance
        return (
          <div key={key}>
            <p style={{ fontWeight: 'bold', fontSize: '0.875rem', margin: '0 0 0.35rem' }}>{title}</p>
            <StrengthGraph
              effect={setup.effect}
              variable={setup.variable}
              line={{ fixedValue: fixed, range, style: PART2_STYLE[setup.effect] }}
              reference={{ fixedValue: setup.fixedValue, range: { start: setup.from, end: setup.to } }}
              reveal={reveal}
              dot={setup.variable === 'distance' ? distance : mass}
              yourDot
            />
          </div>
        )
      })}
    </div>
  )
}

// ---- captions ----
export function Part1Caption() {
  const w = workedNumbers()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong>
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What you see.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>Four graphs</strong> answer your four guesses, one each. Each draws one strength as a line. The{' '}
          <strong>indigo solid line</strong> is the time-dilation strength (the number from Experiment 2) and the{' '}
          <strong>amber dashed line</strong> is the tidal strength (the number from Experiment 3).
        </li>
        <li>
          <strong>Up the side</strong> is the strength, from 0 to {STRENGTH_AXIS_TOP} (no unit). <strong>Along the bottom</strong> is the
          distance of the mass, from Far to Close, in the two upper graphs, and the mass, from Small to Large, in the two lower graphs.
          Mass and distance are relative presets: Small, Medium and Large are 1, 2 and 4; Close, Medium and Far are 1, 2 and 4.
        </li>
        <li>
          <strong>The dotted line at {STRENGTH_CAP}</strong> is the cap: the most that this page lets a strength reach, because
          Experiments 2 and 3 cannot accept more. Where a line meets the cap it goes flat, even if the formula would give more.
        </li>
        <li>
          <strong>The four white rings, arrows and YOUR GUESS boxes</strong> are your four guesses, drawn once the lines are drawn. A ring
          is in the same place whatever you guessed. Its arrow shows only the direction you guessed (up: stronger; flat bar: the same;
          down: weaker), and its length means nothing. They are markers only, and none moves a line.
        </li>
        <li>
          <strong>The formulas used:</strong> time-dilation strength = 0.3 × mass ÷ distance, and tidal strength = 1.2 × mass ÷ distance
          cubed (distance × distance × distance), each kept between its smallest value and {STRENGTH_CAP}.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At Medium mass (2) and Medium distance (2), time-dilation strength = 0.3 × 2 ÷ 2 ={' '}
        {formatStrength(w.mediumDilation)} and tidal strength = 1.2 × 2 ÷ (2 × 2 × 2) = 2.4 ÷ 8 = {formatStrength(w.mediumTidal)}: the
        same, as in Experiments 2 and 3. Move the mass out to Far (4): the time-dilation strength becomes 0.3 × 2 ÷ 4 ={' '}
        {formatStrength(w.farDilation)}, and the tidal strength becomes 2.4 ÷ 64 = {formatStrength(w.farTidal)}. Move it in to Close
        (1): the time-dilation strength becomes 0.3 × 2 ÷ 1 = {formatStrength(w.closeDilation)}, but the tidal strength would be 2.4 ÷ 1 ={' '}
        {w.closeTidalFormula.toFixed(1)}, which is over the cap, so the page uses {formatStrength(w.closeTidal)}.
      </p>
      <LookFor
        items={[
          {
            look: 'the four lines, from their left ends to their right ends.',
            means: `each shows one strength at every mass or distance in its range: the time-dilation line goes from ${formatStrength(w.farDilation)} at Far to ${formatStrength(w.closeDilation)} at Close, the tidal line from ${formatStrength(w.farTidal)} to ${formatStrength(w.closeTidal)}, and the two mass lines from 0.150 at Small to 0.600 at Large.`,
            matters: 'it shows how each strength responds to the mass and to the distance, instead of only reading one number.',
          },
          {
            look: 'the tidal line in the upper right as it reaches the dotted 0.9 line.',
            means: `the tidal strength stops rising at ${STRENGTH_CAP}, from a distance of about ${w.tidalCapDistanceAtMediumMass.toFixed(1)} inwards, because the page cannot use more: the formula would give ${w.closeTidalFormula.toFixed(1)} at Close.`,
            matters: 'it shows where this page’s numbers stop following the formula, so a flat part of a line means “capped” and not “no effect”.',
          },
          {
            look: 'the four white rings and your four YOUR GUESS boxes.',
            means: 'each marks the place on its graph where the answer to that guess can be read: the right-hand end of its line.',
            matters: 'it shows where to look to compare what you expected with what was drawn.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export function Part2Caption() {
  const w = workedNumbers()
  const [mediumMedium, largeMedium, largeClose] = part2Examples()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read Part 2&rsquo;s pictures.</strong> Everything here is for the mass and distance <em>you</em> chose in the
        controls. The first two pictures are Experiments 2 and 3 running with your choice. The four graphs underneath show where your
        choice sits among all the possible masses and distances.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What you see.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>Experiment 2&rsquo;s clocks (above the graphs).</strong> The ceiling clock and the floor clock count ticks. The
          floor clock counts 10 ticks over the run. The more the ceiling clock is ahead, the bigger the time-dilation strength.
        </li>
        <li>
          <strong>Experiment 3&rsquo;s cabins (above the graphs).</strong> The planet cabin drops two balls that start 1 metre apart,
          and the number under the cabin is how far apart they are right now. The closer together they land, the bigger the tidal
          strength. The rocket cabin is there for comparison and does not change.
        </li>
        <li>
          <strong>The two upper graphs (strength against distance).</strong> Along the bottom is the distance of the mass, from Far (4)
          to Close (1). Up the side is the strength, from 0 to {STRENGTH_AXIS_TOP}. <strong>Your mass is held fixed</strong> (it is
          written in each title), so the line shows what the strength would be if that mass were Far, Medium or Close. The left graph is
          the time-dilation strength and the right graph is the tidal strength.
        </li>
        <li>
          <strong>The two lower graphs (strength against mass).</strong> Along the bottom is the mass, from Small (1) to Large (4).{' '}
          <strong>Your distance is held fixed</strong> (it is written in each title), so the line shows what the strength would be if
          the mass were Small, Medium or Large.
        </li>
        <li>
          <strong>The pink line</strong> is your line: solid pink for the time-dilation strength and dashed light pink for the tidal
          strength. <strong>The pink dot</strong> sits on it at the distance (upper graphs) or the mass (lower graphs) you chose. Its
          height is the strength that the clocks and the cabins above are using right now. <strong>The thin grey line</strong> is Part 1&rsquo;s
          line (Medium mass in the upper graphs, Medium distance in the lower ones), kept so that you can see how your choice moved the
          whole line.
        </li>
        <li>
          <strong>The dotted line at {STRENGTH_CAP}</strong> is the cap: the most that this page lets a strength reach. The numbers under
          the ends of each line are the strength at that end. If you choose an &ldquo;Other&rdquo; value outside Close to Far or Small to
          Large, the bottom scale stretches to include it.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Worked moments.</strong> Each shows the dot&rsquo;s height and what the clocks and cabins then do. A strength of{' '}
        <em>s</em> gives the ceiling clock 1 ÷ (1 − <em>s</em>) ticks for every floor tick, and lands the two balls (1 − <em>s</em>) × 1 metre
        apart.
      </p>
      <ul style={listStyle}>
        {[mediumMedium, largeMedium, largeClose].map((e) => (
          <li key={`${e.massLabel}-${e.distanceLabel}`}>
            <strong>
              {e.massLabel} mass, {e.distanceLabel.toLowerCase()} distance:
            </strong>{' '}
            time-dilation strength {formatStrength(e.dilationStrength)}
            {e.dilationCapped ? ' (the formula gives more, so the cap is used)' : ''} and tidal strength {formatStrength(e.tidalStrength)}
            {e.tidalCapped ? ' (the cap again)' : ''}. The ceiling clock ticks 1 ÷ (1 − {formatStrength(e.dilationStrength)}) ={' '}
            {e.ceilingTicksPerFloorTick.toFixed(2)} times for every floor tick, so after the run it shows {e.ceilingTicksAfterRun.toFixed(2)}{' '}
            ticks against the floor clock&rsquo;s 10.00. The planet cabin&rsquo;s balls land (1 − {formatStrength(e.tidalStrength)}) × 1 ={' '}
            {e.planetLandingSeparation.toFixed(3)} m apart.
          </li>
        ))}
        <li>
          <strong>Small mass, Far distance:</strong> the formulas give {formatStrength(w.smallFarDilation)} and{' '}
          {w.smallFarTidalFormula.toFixed(5)}, and the page lifts the second to the smallest value it accepts,{' '}
          {formatStrength(w.smallFarTidal)}.
        </li>
      </ul>
      <LookFor
        items={[
          {
            look: 'the pink dot on each graph, and the clocks and cabins above.',
            means: `the dot’s height is the strength those two pictures are using. For example, at Large mass and Medium distance both dots are at ${formatStrength(largeMedium.dilationStrength)}, the ceiling clock is at ${largeMedium.ceilingTicksAfterRun.toFixed(2)} ticks against 10.00, and the balls land ${largeMedium.planetLandingSeparation.toFixed(3)} m apart.`,
            matters: 'it joins the graphs to the clocks and cabins, so a number on a graph is something you can see happening.',
          },
          {
            look: 'the gap between the pink line and the grey line.',
            means: 'a pink line above the grey one means your choice gives a bigger strength at every point along it; below means smaller; on top of the grey one means your choice is the same as Part 1’s.',
            matters: 'it shows how much your own mass (upper graphs) or distance (lower graphs) moves a whole line, not just one number.',
          },
          {
            look: 'where a pink line meets the dotted 0.9 line, or runs along the bottom.',
            means: `a pink line that is flat at ${STRENGTH_CAP} has reached the cap, so the clocks and cabins are running at the largest strength they can (at Large mass and Close distance the ceiling clock ticks ${largeClose.ceilingTicksPerFloorTick.toFixed(2)} times for every floor tick). A line flat at the bottom has reached the smallest strength the page accepts.`,
            matters: 'it shows when changing a setting changes nothing on this page, because of the cap and not because the effect has stopped.',
          },
        ]}
      />
    </CaptionBox>
  )
}

// A run's playback: only presentation. The result comes from the physics module and never depends on this.
function useRun(onFinish?: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [progress, setProgress] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // Clamped on both sides: a first animation frame can report a time slightly before startTime.
      const p = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(p)
      if (p >= 1) {
        setStatus('complete')
        finishRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status])

  const start = useCallback(() => {
    setProgress(0)
    setStatus('running')
  }, [])
  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
  }, [])
  return { status, progress, start, reset }
}

function PredictionQuestion({
  prompt,
  selected,
  onSelect,
  disabled,
}: {
  prompt: string
  selected: PredictionChoice | null
  onSelect: (choice: PredictionChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {predictionChoices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected ? `Your prediction: ${labelFor(selected)}` : 'Choose an option to continue'}
      </p>
    </div>
  )
}

interface SpacetimeCurvatureSourceExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

interface PartTwoRun {
  massLabel: string
  distanceLabel: string
  dilationStrength: number
  tidalStrength: number
  dilationCapped: boolean
  tidalCapped: boolean
  ceilingTicks: number
  floorTicks: number
  planetSeparation: number
  rocketSeparation: number
}

type Guesses = Record<PredictionKey, PredictionChoice | null>
const NO_GUESSES: Guesses = { closerDilation: null, closerTidal: null, biggerDilation: null, biggerTidal: null }

export function SpacetimeCurvatureSourceExperiment({ onComplete, onTutorComplete }: SpacetimeCurvatureSourceExperimentProps) {
  const refresh = refresherNumbers()
  const [predictions, setPredictions] = useState<Guesses>(NO_GUESSES)
  const [submitted, setSubmitted] = useState<Record<PredictionKey, PredictionChoice> | null>(null)
  const [massPreset, setMassPreset] = useState<MassPreset>(4)
  const [customMass, setCustomMass] = useState('')
  const [distancePreset, setDistancePreset] = useState<DistancePreset>(1)
  const [customDistance, setCustomDistance] = useState('')
  const [part2Runs, setPart2Runs] = useState<PartTwoRun[]>([])
  // The mass and distance the Part 2 run was started with (the controls may be changed afterwards).
  const [runSetting, setRunSetting] = useState<{ mass: number; distance: number } | null>(null)
  const [explained, setExplained] = useState(false)

  // The completion mark is saved when Part 1's run ends. Part 2 does not call it.
  const part1 = useRun(() => onComplete?.())
  const part2 = useRun()

  const locked = submitted !== null
  const part1Running = part1.status === 'running'
  const part2Running = part2.status === 'running'
  const part1Done = part1.status === 'complete'

  const hasAllPredictions = PREDICTION_KEYS.every((k) => predictions[k] !== null)
  const hasAnythingToClear = PREDICTION_KEYS.some((k) => predictions[k] !== null) || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const selectedMass = massPreset === 'other' ? parseFloat(customMass) || 0 : massPreset
  const selectedDistance = distancePreset === 'other' ? parseFloat(customDistance) || 0 : distancePreset
  const isValidMass = selectedMass > 0
  const isValidDistance = selectedDistance > 0
  const canRunPart2 = isValidMass && isValidDistance && !part1Running && !part2Running

  // Memoized so that their identity only changes when the mass and distance change.
  const shownMass = part2.status === 'idle' || !runSetting ? selectedMass : runSetting.mass
  const shownDistance = part2.status === 'idle' || !runSetting ? selectedDistance : runSetting.distance
  const strengths = useMemo(
    () => (shownMass > 0 && shownDistance > 0 ? strengthsForMassAndDistance(shownMass, shownDistance) : null),
    [shownMass, shownDistance]
  )
  const dilationResult = useMemo(
    () => (strengths ? runGravitationalTimeDilationExperiment(strengths.timeDilationStrength) : null),
    [strengths]
  )
  const tidalResult = useMemo(
    () =>
      strengths
        ? runTidalEffectExperiment(EARTH_GRAVITY, INITIAL_HEIGHT_METERS, INITIAL_SEPARATION_METERS, strengths.convergenceStrength)
        : null,
    [strengths]
  )

  const floorSecondsShown =
    part2.status === 'running'
      ? part2.progress * RUN_DURATION_FLOOR_SECONDS
      : part2.status === 'complete'
        ? RUN_DURATION_FLOOR_SECONDS
        : CLOCK_SNAPSHOT_FLOOR_SECONDS
  const fallSecondsShown = tidalResult
    ? part2.status === 'running'
      ? part2.progress * tidalResult.timeToFloorSeconds
      : part2.status === 'complete'
        ? tidalResult.timeToFloorSeconds
        : tidalResult.timeToFloorSeconds * TIDAL_SNAPSHOT_FALL_FRACTION
    : 0
  const ceilingTicks = dilationResult ? tickCountAt(dilationResult, floorSecondsShown, 'ceiling') : 0
  const floorTicks = dilationResult ? tickCountAt(dilationResult, floorSecondsShown, 'floor') : 0

  const handleRun1 = () => {
    if (!hasAllPredictions || locked) return
    setSubmitted(predictions as Record<PredictionKey, PredictionChoice>)
    setPredictions(NO_GUESSES)
    part1.start()
  }

  const handleRun2 = () => {
    if (!canRunPart2) return
    setRunSetting({ mass: selectedMass, distance: selectedDistance })
    part2.start()
  }

  // The Part 2 run is recorded when it ends, from the strengths and Experiments 2 and 3's own functions.
  const recordedRef = useRef(false)
  useEffect(() => {
    if (part2.status === 'running') recordedRef.current = false
    if (part2.status !== 'complete' || recordedRef.current || !runSetting || !dilationResult || !tidalResult || !strengths) return
    recordedRef.current = true
    setPart2Runs((runs) => [
      ...runs,
      {
        massLabel: labelForPreset(massPreset, MASS_PRESETS, runSetting.mass),
        distanceLabel: labelForPreset(distancePreset, DISTANCE_PRESETS, runSetting.distance),
        dilationStrength: strengths.timeDilationStrength,
        tidalStrength: strengths.convergenceStrength,
        dilationCapped: isCapped('dilation', runSetting.mass, runSetting.distance),
        tidalCapped: isCapped('tidal', runSetting.mass, runSetting.distance),
        ceilingTicks: tickCountAt(dilationResult, RUN_DURATION_FLOOR_SECONDS, 'ceiling'),
        floorTicks: tickCountAt(dilationResult, RUN_DURATION_FLOOR_SECONDS, 'floor'),
        planetSeparation: finalSeparationMeters(tidalResult, 'planet'),
        rocketSeparation: finalSeparationMeters(tidalResult, 'rocket'),
      },
    ])
  }, [part2.status, runSetting, dilationResult, tidalResult, strengths, massPreset, distancePreset])

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPredictions(NO_GUESSES)
    setSubmitted(null)
    setMassPreset(4)
    setCustomMass('')
    setDistancePreset(1)
    setCustomDistance('')
    setPart2Runs([])
    setRunSetting(null)
    setExplained(false)
  }

  const shownGuesses: Guesses = submitted ?? predictions
  const pinkLine =
    strengths && shownMass > 0 && shownDistance > 0
      ? `Time-dilation strength ${formatStrength(strengths.timeDilationStrength)}${isCapped('dilation', shownMass, shownDistance) ? ` (held at the limit; the formula gives ${formatStrength(rawStrength('dilation', shownMass, shownDistance))})` : ''}, tidal strength ${formatStrength(strengths.convergenceStrength)}${isCapped('tidal', shownMass, shownDistance) ? ` (held at the limit; the formula gives ${formatStrength(rawStrength('tidal', shownMass, shownDistance))})` : ''}`
      : null
  const part2Reveal = part2.status === 'complete' ? 1 : part2.status === 'running' ? part2.progress : 0

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — What Curves Spacetime? Mass and Distance</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In Experiment 2 (does gravity change time?), a &ldquo;strength&rdquo; number controlled how much
            faster the ceiling clock ticked. In Experiment 3 (tidal effects), a &ldquo;strength&rdquo; number controlled how much the two
            balls drifted together. Where do those two numbers actually come from?
          </p>
          <p style={paragraph}>
            <strong>A daily-life picture.</strong> Think of a trampoline. A bowling ball set in the middle makes a dent in it, and a feather
            does not. In this experiment a nearby body plays the part of the bowling ball, and two things about it matter: how much stuff it
            is made of (its mass), and how far away you are standing (its distance).
          </p>
          <p style={paragraph}>
            <strong>How this page is laid out.</strong> Below this introduction the page is in four sections, called Parts, each with a
            coloured heading. In Part 1 you make guesses and watch the experiment. In Part 2 you try it with a mass and a distance of your
            own. Part 3 shows the results, and Part 4 is the tutor, who talks it over with you.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> Two numbers follow from a body&rsquo;s mass and its distance: a <strong>time-dilation
            strength</strong>, which sets how much faster Experiment 2&rsquo;s ceiling clock ticks, and a <strong>tidal strength</strong>,
            which sets how much Experiment 3&rsquo;s two balls drift together. In Part 1 you guess how each of those two numbers changes
            when the mass or the distance changes, and watch four graphs draw the answer. In Part 2 you choose a mass and a distance
            yourself, and watch Experiment 2&rsquo;s clocks and Experiment 3&rsquo;s balls respond together, both driven by the same two
            choices.
          </p>
          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>A quick reminder of the two strengths.</strong> You met both in earlier experiments:
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Time-dilation strength (Experiment 2).</strong> It sets how much faster the ceiling clock ticks than the floor clock.
              A strength of 0 would mean the two clocks tick together. At strength 0.3 the ceiling clock ticks{' '}
              {refresh.ceilingTicksPerFloorTickAt0p3.toFixed(2)} times for every 1 tick of the floor clock, and at 0.6 it ticks{' '}
              {refresh.ceilingTicksPerFloorTickAt0p6.toFixed(2)} times. A bigger number means a bigger gap between the two clocks.
            </li>
            <li>
              <strong>Tidal strength (Experiment 3, where it was just called &ldquo;strength&rdquo;).</strong> It sets how much the two
              falling balls in the planet cabin drift together. A strength of 0 would mean they stay the same distance apart. At strength
              0.3, two balls that start 1 metre apart land {refresh.planetLandingSeparationAt0p3.toFixed(3)} metres apart, and at 0.6 they
              land {refresh.planetLandingSeparationAt0p6.toFixed(3)} metres apart. A bigger number means the balls land closer together.
            </li>
          </ul>
          <p style={paragraph}>
            Both are plain numbers between 0 and 1 with no unit. In Experiments 2 and 3 you chose them yourself. Here they follow from a
            mass and a distance.
          </p>
          <p style={paragraph}>
            <strong>What &ldquo;mass&rdquo;, &ldquo;distance&rdquo; and &ldquo;strength&rdquo; mean here.</strong> Mass and distance here
            are relative presets, not real kilograms or metres. Mass can be Small (1), Medium (2) or Large (4), and distance can be Close
            (1), Medium (2) or Far (4). They are plain numbers with no unit. The two strengths are the same ones as in Experiments 2 and 3,
            now worked out from the mass and distance. Each strength is kept at or below {STRENGTH_CAP}, the biggest value Experiments 2 and 3
            accept, so the page can never hand them a number they cannot use.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press the button, guess how each effect changes if the mass moves closer, and how each
            changes if the mass is bigger. Then watch the four graphs draw the answer, try your own mass and distance in Part 2, and talk it
            over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or the numbers: they come from
            a calculation that knows nothing about what you guessed. Your four guesses are drawn on the four graphs in white, each in a box
            labelled YOUR GUESS, and they are shown again beside the results. In Part 2 the mass and distance you choose do change the
            graphs, the clocks and the balls, and the lines they move are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one with a short plain meaning: mass,
            distance, relative preset, time-dilation strength, tidal strength, cap, first-order, spacetime, tick, separation, graph.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Mass and distance here are relative presets, not real kilograms or metres.</li>
            <li>This uses the same simplified, first-order approximation as Experiments 2 and 3.</li>
            <li>
              The step from a mass and a distance to the two strengths is itself a further simplification. It is chosen to show the
              pattern, not to give realistic numbers: with a real star at a real distance, both effects are far too small to see.
            </li>
            <li>
              This experiment doesn&rsquo;t use anything about light, moving clocks, or speeds close to light &mdash; it&rsquo;s about
              ordinary gravity, like Experiments 2 and 3.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> A plain-language page from an official source is listed here. Checked on 12 November 2026.
            The link opens in a new tab. Three more pages, about gravity, tides and clocks, are held back because they say what the
            experiment is about. They appear below the tutor&rsquo;s explanation. This page uses no measured result, so there is no
            research paper to cite for it.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            {START_LINKS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you guess how two numbers change: the time-dilation strength of Experiment 2 and the tidal strength of Experiment 3, when a
          nearby mass moves closer, and when it is bigger. Then you press &ldquo;Run&rdquo; and watch four graphs draw the answer, with
          your four guesses marked on them in white.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Make your predictions</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Four questions. In each one, &ldquo;stronger&rdquo; means a bigger strength number. The first two use a Medium-mass body and ask
            what happens when it moves from Far to Close. The last two use a body at Medium distance and ask what happens when the mass
            goes from Small to Large.
          </p>
          {predictionQuestions.map((question) => (
            <PredictionQuestion
              key={question.key}
              prompt={question.prompt}
              selected={shownGuesses[question.key]}
              onSelect={(choice) => setPredictions((p) => ({ ...p, [question.key]: choice }))}
              disabled={locked || part1Running}
            />
          ))}
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your predictions are locked while you try other settings. To change them, press Start over.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleRun1}
          disabled={part1Running || part2Running || locked || !hasAllPredictions}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Running...' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{
            marginLeft: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            cursor: startOverDisabled ? 'not-allowed' : 'pointer',
            opacity: startOverDisabled ? 0.5 : 1,
          }}
        >
          Start over
        </button>
        {!hasAllPredictions && !locked && <p style={smallNote}>Choose an option for all four questions above to press &ldquo;Run&rdquo;.</p>}

        {part1.status !== 'idle' ? (
          <Block>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>How the two strengths change</p>
            <Part1Graphs reveal={part1Done ? 1 : part1.progress} guesses={submitted} />
            {part1Done ? (
              <>
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> each strength, from the two formulas in the caption
                  below, for the mass and distance shown, and kept at or below the cap of {STRENGTH_CAP}. The constants in the formulas are
                  chosen so that Medium mass and Medium distance give 0.3 for both strengths, as in Experiments 2 and 3; they are not
                  measured. The mass and distance are relative presets, not real kilograms or metres. <strong>Imagined for the
                  question:</strong> the nearby body. The white rings and arrows are only your guesses.
                </WhereFrom>
                <Part1Caption />
              </>
            ) : (
              <p style={smallNote}>The graphs draw themselves as the mass moves. Your guesses will be marked on them when the lines are drawn.</p>
            )}
          </Block>
        ) : (
          <p style={smallNote}>
            After you press &ldquo;Run&rdquo;, four graphs of the two strengths will draw themselves here as the mass moves closer and gets
            bigger.
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a mass and a distance and run again. The mass and distance you choose change the four graphs and the two
              panels from Experiments 2 and 3 in this Part, with your lines in pink. They do not change Part 1&rsquo;s graphs, the
              results in Part 3, or your guesses.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mass</label>
              <div style={{ marginBottom: '0.75rem' }}>
                {MASS_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setMassPreset(preset.value)}
                    disabled={part2Running}
                    className={`toggle-button${massPreset === preset.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => setMassPreset('other')}
                  disabled={part2Running}
                  className={`toggle-button${massPreset === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {massPreset === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customMass}
                    onChange={(e) => setCustomMass(e.target.value)}
                    disabled={part2Running}
                    placeholder="Enter a relative mass (> 0)"
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '220px' }}
                  />
                </div>
              )}

              <label style={{ display: 'block', margin: '1rem 0 0.5rem', fontWeight: 'bold' }}>Distance</label>
              <div style={{ marginBottom: '0.75rem' }}>
                {DISTANCE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setDistancePreset(preset.value)}
                    disabled={part2Running}
                    className={`toggle-button${distancePreset === preset.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => setDistancePreset('other')}
                  disabled={part2Running}
                  className={`toggle-button${distancePreset === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {distancePreset === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customDistance}
                    onChange={(e) => setCustomDistance(e.target.value)}
                    disabled={part2Running}
                    placeholder="Enter a relative distance (> 0)"
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '220px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected: <strong>mass {isValidMass ? labelForPreset(massPreset, MASS_PRESETS, selectedMass) : '—'}</strong>,{' '}
                <strong>distance {isValidDistance ? labelForPreset(distancePreset, DISTANCE_PRESETS, selectedDistance) : '—'}</strong>
              </p>
              {pinkLine && <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: YOURS_COLOR, marginTop: 0 }}>{pinkLine}</p>}
              <p style={smallNote}>Your guesses do not change these drawings, but the mass and distance you choose do.</p>
              <button
                type="button"
                onClick={handleRun2}
                disabled={!canRunPart2}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Running...' : 'Run with your mass and distance'}
              </button>
            </div>

            <Block>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {dilationResult && (
                  <div style={{ maxWidth: '280px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
                      Experiment 2&rsquo;s clocks, at this mass and distance
                    </p>
                    <RocketCabinClocks ceilingTicks={ceilingTicks} floorTicks={floorTicks} />
                  </div>
                )}
                {tidalResult && (
                  <div style={{ maxWidth: '520px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem', textAlign: 'center' }}>
                      Experiment 3&rsquo;s cabins, at this mass and distance
                    </p>
                    <p style={{ ...smallNote, textAlign: 'center', marginTop: 0 }}>
                      These cabins stand in for a place near the body; nothing about the body is drawn.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <LabelledCabin label="Planet cabin" result={tidalResult} scene="planet" elapsedSeconds={fallSecondsShown} strengthG={1} />
                      <LabelledCabin label="Rocket cabin" result={tidalResult} scene="rocket" elapsedSeconds={fallSecondsShown} strengthG={1} />
                    </div>
                  </div>
                )}
              </div>
              <p style={{ ...smallNote, textAlign: 'center' }}>
                Both panels use the two strengths that your mass and distance give. Before a run they show a fixed moment; during a run
                they play.
              </p>
            </Block>

            {part2.status !== 'idle' && runSetting ? (
              <Block>
                <Part2Graphs mass={runSetting.mass} distance={runSetting.distance} reveal={part2Reveal} />
              </Block>
            ) : (
              <p style={smallNote}>
                Not run yet. Choose a mass and a distance and press &ldquo;Run with your mass and distance&rdquo;; your pink lines and the
                two panels will respond here.
              </p>
            )}


            {part2.status === 'complete' && part2Runs.length > 0 && (
              <Block>
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> each strength, from the same formulas as in Part 1,
                  for the mass and distance you chose, kept at or below the cap of {STRENGTH_CAP}; and the clocks and the balls, from
                  Experiments 2 and 3, run with those strengths. <strong>Imagined for the question:</strong> the nearby body, and the two
                  cabins as stand-ins for a place near it. The grey line is Part 1&rsquo;s calculation, kept for comparison.
                </WhereFrom>
                <Part2Caption />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((r, i) => (
                    <li key={i}>
                      Mass {r.massLabel}, distance {r.distanceLabel}: time-dilation strength {formatStrength(r.dilationStrength)}
                      {r.dilationCapped ? ' (held at the limit)' : ''}, tidal strength {formatStrength(r.tidalStrength)}
                      {r.tidalCapped ? ' (held at the limit)' : ''}; final tick counts: ceiling {r.ceilingTicks.toFixed(2)}, floor{' '}
                      {r.floorTicks.toFixed(2)}; final separations: planet cabin {r.planetSeparation.toFixed(3)} m, rocket cabin{' '}
                      {r.rocketSeparation.toFixed(3)} m
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && submitted && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the strength numbers from the Part 1 graphs, with your guesses marked beside them. Nothing in this Part changes with
              your guesses or with the mass and distance you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Mass and distance:</strong> Medium mass for the two distance graphs, Medium distance for the two mass graphs
                (relative presets).
              </p>
              {(
                [
                  ['closerDilation', 'Time-dilation strength, mass moving from Far to Close', 'the closer-mass time-dilation effect', 'the top left graph'],
                  ['closerTidal', 'Tidal strength, mass moving from Far to Close', 'the closer-mass tidal effect', 'the top right graph'],
                  ['biggerDilation', 'Time-dilation strength, mass from Small to Large', 'the bigger-mass time-dilation effect', 'the bottom left graph'],
                  ['biggerTidal', 'Tidal strength, mass from Small to Large', 'the bigger-mass tidal effect', 'the bottom right graph'],
                ] as Array<[PredictionKey, string, string, string]>
              ).map(([key, title, what, where]) => {
                const setup = predictionSetup(key)
                const values = (setup.variable === 'distance' ? [4, 2, 1] : [1, 2, 4]).map((v) =>
                  setup.variable === 'distance' ? strengthOf(setup.effect, MEDIUM_MASS, v) : strengthOf(setup.effect, v, MEDIUM_DISTANCE)
                )
                const names = setup.variable === 'distance' ? ['Far', 'Medium', 'Close'] : ['Small', 'Medium', 'Large']
                const endCapped = endStrengths(key).endCapped
                const raw =
                  setup.variable === 'distance'
                    ? rawStrength(setup.effect, MEDIUM_MASS, setup.to)
                    : rawStrength(setup.effect, setup.to, MEDIUM_DISTANCE)
                return (
                  <p key={key} style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                    <strong>{title}:</strong> {names.map((n, i) => `${formatStrength(values[i])} at ${n}`).join(', ')}
                    {endCapped ? ` (held at the cap; the formula gives ${formatStrength(raw)} at ${names[2]})` : ''}
                    <GuessTag />
                    <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Your guess for {what} is drawn on {where} as a white mark.
                    </span>
                  </p>
                )
              })}
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the formulas in the caption, with constants chosen, not
              measured, and with each strength capped at {STRENGTH_CAP}. Nothing here changes with your guesses or with the mass and distance
              you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your four white marks on the graphs, then explains.
            </PartHeader>
            <SpacetimeCurvatureSourceTutor
              predictions={submitted}
              onExplained={() => {
                setExplained(true)
                onTutorComplete?.()
              }}
            />
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  <strong>More to read, now that you have the explanation.</strong> These pages say how gravity depends on mass and
                  distance, why the pull differs from place to place, and how it changes clock rates, so they were held back until now.
                  Checked on 12 November 2026. Each link opens in a new tab.
                </p>
                <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
                  {AFTER_LINKS.map((link) => (
                    <li key={link.href}>
                      <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
