import type { ReactNode } from 'react'
import {
  REAL_UNIVERSE_AGE_YEARS,
  TIME_PANEL_MAX_YEARS,
  ageGuessMarkerYears,
  ageStripFraction,
  bigBangWorkedExample,
  distanceAtPastTimeMpc,
  hubbleTimeYears,
  timeBarFraction,
  timeBackToZeroYears,
  timeGuessMarker,
} from '../physics/bigBangExperiment'
import type { AgeGuess, TimeGuess } from '../physics/bigBangExperiment'
import { MAX_CUSTOM_DISTANCE_MPC } from '../physics/hubblesLawExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 2, audited to the newer rules (docs/audit/cosmology/02-draft-wording.md, approved by the owner on 2026-11-14).
// One picture: the time ruler, the row of galaxies and Earth, and two new panels under them ("Time to reach Earth" and a zoom strip
// comparing this page's answer with the measured age). Every number comes from the physics module; this file only draws and words it
// (CLAUDE.md §9). The white marks are only ever the learner's guess (§14) and are drawn only once the backward run has finished (§12).

export const GUESS_COLOR = '#ffffff'
const GOLD = '#facc15' // the highlighted galaxy and the ruler's pointer
const OTHER_GALAXY = '#e2e8f0'
const AMBER = '#f59e0b' // this page's calculated answer (a fixed reference)
const GREEN = '#4ade80' // the age measured by others
const EARTH_COLOR = '#38bdf8'

const VIEW_WIDTH = 660
const EARTH_X = 560
const GALAXY_MIN_X = 110
const EARTH_Y = 150
const SCALE_AXIS_Y = 28
const SCALE_TICK_COUNT = 10

const BAR_X0 = 150
const BAR_X1 = 530
const PANEL_Y = 238
const BAR_ROW_Y0 = 266
const BAR_ROW_STEP = 22
const STRIP_Y = 384

export const fmtBillions = (years: number) => (years / 1e9).toFixed(2)
const fmtMpc = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(1))))
const fmtNumber = (v: number) => Math.round(v).toLocaleString('en-US')

// Maps a distance to a horizontal position, with 0 distance landing exactly on Earth's own position, so a galaxy visibly merges with
// Earth once its backward-extrapolated distance reaches zero. The spacing is illustrative, not to scale.
export function positionXForDistance(distanceMpc: number): number {
  const clamped = Math.max(0, Math.min(MAX_CUSTOM_DISTANCE_MPC, distanceMpc))
  return EARTH_X - (clamped / MAX_CUSTOM_DISTANCE_MPC) * (EARTH_X - GALAXY_MIN_X)
}

export interface PictureGalaxy {
  key: string
  label: string
  shortLabel: string
  distanceMpc: number
  highlighted: boolean
  labelYOffset: number
  yours?: boolean
}

export interface PictureGuesses {
  time: TimeGuess
  age: AgeGuess
}

export interface BigBangPictureProps {
  galaxies: PictureGalaxy[]
  // 'idle': nothing has run (galaxies at their present positions). 'backward': the run back toward the singularity, at `progress`
  // (0 to 1). 'forward': the replay from the singularity outward, at `progress`.
  mode: 'idle' | 'backward' | 'forward'
  progress: number
  // True once the backward run has finished: the bars, the zoom strip and the white marks are drawn only then (§12).
  arrived: boolean
  // The learner's guesses (Part 1 only), drawn on the bars and the zoom strip once arrived.
  guesses: PictureGuesses | null
  // Part 1 shows the zoom strip; Part 2 does not.
  showZoom: boolean
}

function GuessBox({ x, y, line }: { x: number; y: number; line: string }) {
  return (
    <g>
      <rect x={x} y={y} width={104} height={30} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
      <text x={x + 52} y={y + 13} fill={GUESS_COLOR} fontSize="10" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + 52} y={y + 25} fill={GUESS_COLOR} fontSize="9" textAnchor="middle">
        {line}
      </text>
    </g>
  )
}

const TIME_GUESS_LINE: Record<TimeGuess, string> = { longer: 'farther: longer', shorter: 'farther: shorter', same: 'farther: the same' }
const AGE_GUESS_LINE: Record<AgeGuess, string> = { muchLonger: 'much longer', muchShorter: 'much shorter', close: 'close, not exact' }

export function BigBangPicture({ galaxies, mode, progress, arrived, guesses, showZoom }: BigBangPictureProps) {
  const total = hubbleTimeYears()
  const yearsAgo = mode === 'backward' ? progress * total : mode === 'forward' ? total * (1 - progress) : 0
  const remaining = total * (1 - (mode === 'backward' ? progress : 0))
  const sinceBang = mode === 'forward' ? total * progress : 0
  const pointerX = mode === 'forward' ? EARTH_X - progress * (EARTH_X - GALAXY_MIN_X) : GALAXY_MIN_X + (mode === 'backward' ? progress : 0) * (EARTH_X - GALAXY_MIN_X)
  const active = mode !== 'idle'
  const presets = galaxies.filter((g) => !g.yours)
  const far = presets.length > 0 ? presets[presets.length - 1] : null
  const bars = galaxies
  const barY = (i: number) => BAR_ROW_Y0 + i * BAR_ROW_STEP
  // The axis sits just below the last bar, so a fourth bar (the learner's own galaxy) never crosses it.
  const axisY = barY(galaxies.length) + 4
  const height = showZoom ? 480 : axisY + 36
  const barXEnd = (years: number) => BAR_X0 + timeBarFraction(years) * (BAR_X1 - BAR_X0)
  const showMarks = arrived && guesses !== null

  const stripX = (years: number) => BAR_X0 + ageStripFraction(years) * (BAR_X1 - BAR_X0)
  const stripAxisY = STRIP_Y + 48
  const ageMarkerX = guesses ? stripX(ageGuessMarkerYears(guesses.age)) : 0

  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="A time ruler counting down to the singularity, a row of galaxies sliding to Earth, and panels for the time each one takes"
    >
      {/* The time ruler: ten equal blocks, 13.97 billion years ago at the left and 0 (the singularity) at the right. */}
      {Array.from({ length: SCALE_TICK_COUNT }).map((_, i) => {
        const xStart = GALAXY_MIN_X + (i / SCALE_TICK_COUNT) * (EARTH_X - GALAXY_MIN_X)
        const xEnd = GALAXY_MIN_X + ((i + 1) / SCALE_TICK_COUNT) * (EARTH_X - GALAXY_MIN_X)
        return <rect key={i} x={xStart} y={SCALE_AXIS_Y - 3} width={xEnd - xStart} height={6} fill={i % 2 === 0 ? '#475569' : '#334155'} />
      })}
      {Array.from({ length: SCALE_TICK_COUNT + 1 }).map((_, i) => {
        const x = GALAXY_MIN_X + (i / SCALE_TICK_COUNT) * (EARTH_X - GALAXY_MIN_X)
        const half = i % 5 === 0 ? 9 : 5
        return <line key={i} x1={x} y1={SCALE_AXIS_Y - half} x2={x} y2={SCALE_AXIS_Y + half} stroke="#94a3b8" strokeWidth={1} />
      })}
      <text x={GALAXY_MIN_X} y={SCALE_AXIS_Y - 14} fill={TEXT_COLOR} fontSize="10" textAnchor="start">
        {active ? `${fmtBillions(total)} billion years ago` : 'billion years ago (the number appears when you press Run)'}
      </text>
      <text x={EARTH_X} y={SCALE_AXIS_Y - 14} fill="#f87171" fontSize="10" textAnchor="end">
        0: the singularity
      </text>
      <line x1={pointerX} y1={SCALE_AXIS_Y - 14} x2={pointerX} y2={SCALE_AXIS_Y + 14} stroke={GOLD} strokeWidth={2} />
      <text x={active ? pointerX : pointerX - 4} y={SCALE_AXIS_Y + 28} fill={GOLD} fontSize="10" textAnchor={active ? 'middle' : 'start'}>
        {!active ? 'the pointer counts the years once you press Run' : mode === 'forward' ? `${fmtBillions(sinceBang)} billion years since the Big Bang` : `${fmtBillions(remaining)} billion years left to go`}
      </text>
      <text x={20} y={78} fill={MUTED_COLOR} fontSize="10">
        the ruler (top) · the galaxies and Earth (middle) · the time each takes (below)
      </text>

      {/* Earth and the galaxies. */}
      <circle cx={EARTH_X} cy={EARTH_Y} r={14} fill={EARTH_COLOR} />
      <text x={EARTH_X} y={EARTH_Y - 24} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        Earth
      </text>
      {galaxies.map((galaxy) => {
        const current = active ? distanceAtPastTimeMpc(galaxy.distanceMpc, yearsAgo) : galaxy.distanceMpc
        const x = positionXForDistance(current)
        const trailAnchorX = mode === 'forward' ? EARTH_X : positionXForDistance(galaxy.distanceMpc)
        const colour = galaxy.yours ? YOURS_COLOR : galaxy.highlighted ? GOLD : OTHER_GALAXY
        return (
          <g key={galaxy.key}>
            {(galaxy.highlighted || galaxy.yours) && active && (
              <line x1={trailAnchorX} y1={EARTH_Y} x2={x} y2={EARTH_Y} stroke={colour} strokeWidth={3} opacity={0.35} />
            )}
            <circle cx={x} cy={EARTH_Y} r={galaxy.highlighted || galaxy.yours ? 10 : 7} fill={colour}>
              {(galaxy.highlighted || galaxy.yours) && <animate attributeName="r" values="10;14;10" dur="1.2s" repeatCount="indefinite" />}
            </circle>
            <text x={x} y={EARTH_Y + galaxy.labelYOffset} fill={colour} fontSize="10" textAnchor="middle">
              {galaxy.label}
            </text>
          </g>
        )
      })}
      {!active && (
        <text x={GALAXY_MIN_X + 150} y={EARTH_Y + 52} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
          not run yet
        </text>
      )}

      {/* New panel: Time to reach Earth. Drawn when the backward run has finished. */}
      <line x1={20} y1={PANEL_Y - 6} x2={VIEW_WIDTH - 20} y2={PANEL_Y - 6} stroke="#334155" />
      <text x={20} y={PANEL_Y + 10} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
        Time to reach Earth (billion years)
      </text>
      {bars.map((galaxy, i) => {
        const colour = galaxy.yours ? YOURS_COLOR : galaxy.highlighted ? GOLD : OTHER_GALAXY
        const years = timeBackToZeroYears(galaxy.distanceMpc)
        return (
          <g key={galaxy.key}>
            <text x={BAR_X0 - 8} y={barY(i) + 11} fill={colour} fontSize="10" fontWeight="bold" textAnchor="end">
              {galaxy.shortLabel}
            </text>
            {arrived ? (
              <>
                <rect x={BAR_X0} y={barY(i)} width={Math.max(1, barXEnd(years) - BAR_X0)} height={14} fill={colour} />
                <text x={barXEnd(years) + 6} y={barY(i) + 11} fill={TEXT_COLOR} fontSize="10">
                  {`${fmtBillions(years)}`}
                </text>
              </>
            ) : (
              <text x={BAR_X0} y={barY(i) + 11} fill={MUTED_COLOR} fontSize="10" fontStyle="italic">
                not run yet
              </text>
            )}
          </g>
        )
      })}
      <line x1={BAR_X0} y1={axisY} x2={BAR_X1} y2={axisY} stroke={MUTED_COLOR} />
      <text x={BAR_X0} y={axisY + 13} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
        0
      </text>
      {arrived && (
        <text x={BAR_X1} y={axisY + 13} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
          {fmtBillions(TIME_PANEL_MAX_YEARS)}
        </text>
      )}
      <text x={(BAR_X0 + BAR_X1) / 2} y={axisY + 13} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
        {arrived ? 'scale: 0 to 16 billion years' : 'the bars are drawn when the run has finished'}
      </text>

      {/* Guess 1: only a marker beside the farthest preset's bar. */}
      {showMarks && guesses && far && (() => {
        const i = galaxies.indexOf(far)
        const y = barY(i) + 7
        const end = barXEnd(timeBackToZeroYears(far.distanceMpc))
        const kind = timeGuessMarker(guesses.time)
        return (
          <g>
            {kind === 'past-end' && (
              <>
                <line x1={end + 4} y1={y} x2={end + 30} y2={y} stroke={GUESS_COLOR} strokeWidth={3} />
                <path d={`M ${end + 30} ${y - 6} L ${end + 40} ${y} L ${end + 30} ${y + 6} Z`} fill={GUESS_COLOR} />
              </>
            )}
            {kind === 'short-of-end' && (
              <>
                <line x1={end - 56} y1={y} x2={end - 16} y2={y} stroke={GUESS_COLOR} strokeWidth={3} />
                <path d={`M ${end - 16} ${y - 6} L ${end - 6} ${y} L ${end - 16} ${y + 6} Z`} fill={GUESS_COLOR} />
              </>
            )}
            {kind === 'at-end' && <line x1={end} y1={y - 11} x2={end} y2={y + 11} stroke={GUESS_COLOR} strokeWidth={4} />}
            <line x1={end + 44} y1={y} x2={VIEW_WIDTH - 112} y2={y} stroke={GUESS_COLOR} strokeWidth={2} />
            <GuessBox x={VIEW_WIDTH - 112} y={y - 15} line={TIME_GUESS_LINE[guesses.time]} />
          </g>
        )
      })()}

      {/* New panel: the zoom strip, this page's answer against the measured age. Drawn when the backward run has finished. */}
      {showZoom && (
        <g>
          <line x1={20} y1={STRIP_Y - 8} x2={VIEW_WIDTH - 20} y2={STRIP_Y - 8} stroke="#334155" />
          <text x={20} y={STRIP_Y + 8} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
            Zoom: this page&rsquo;s answer against the measured age (billion years)
          </text>
          {arrived ? (
            <>
              <line x1={BAR_X0} y1={stripAxisY} x2={BAR_X1} y2={stripAxisY} stroke={MUTED_COLOR} strokeWidth={2} />
              {[12, 13, 14, 15, 16].map((b) => (
                <g key={b}>
                  <line x1={stripX(b * 1e9)} y1={stripAxisY - 4} x2={stripX(b * 1e9)} y2={stripAxisY + 4} stroke={MUTED_COLOR} />
                  <text x={stripX(b * 1e9)} y={stripAxisY + 17} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
                    {b}
                  </text>
                </g>
              ))}
              <line x1={stripX(total)} y1={stripAxisY - 8} x2={stripX(total)} y2={stripAxisY + 10} stroke={AMBER} strokeWidth={3} />
              <text x={stripX(total) + 6} y={STRIP_Y + 24} fill={AMBER} fontSize="10" textAnchor="start">
                {`this page's answer (calculated): ${fmtBillions(total)}`}
              </text>
              <line x1={stripX(REAL_UNIVERSE_AGE_YEARS)} y1={stripAxisY - 10} x2={stripX(REAL_UNIVERSE_AGE_YEARS)} y2={stripAxisY + 10} stroke={GREEN} strokeWidth={3} />
              <text x={stripX(REAL_UNIVERSE_AGE_YEARS) - 6} y={stripAxisY + 32} fill={GREEN} fontSize="10" textAnchor="end">
                {`measured by others (NASA): ${(REAL_UNIVERSE_AGE_YEARS / 1e9).toFixed(1)}`}
              </text>
              {showMarks && guesses && (
                <g>
                  <path d={`M ${ageMarkerX - 7} ${stripAxisY - 20} L ${ageMarkerX + 7} ${stripAxisY - 20} L ${ageMarkerX} ${stripAxisY - 9} Z`} fill={GUESS_COLOR} />
                  <line x1={ageMarkerX} y1={stripAxisY - 20} x2={ageMarkerX} y2={STRIP_Y + 32} stroke={GUESS_COLOR} strokeWidth={2} />
                  <line x1={ageMarkerX} y1={STRIP_Y + 32} x2={VIEW_WIDTH - 112} y2={STRIP_Y + 32} stroke={GUESS_COLOR} strokeWidth={2} />
                  <GuessBox x={VIEW_WIDTH - 112} y={STRIP_Y + 17} line={AGE_GUESS_LINE[guesses.age]} />
                </g>
              )}
            </>
          ) : (
            <text x={BAR_X0} y={stripAxisY + 4} fill={MUTED_COLOR} fontSize="10" fontStyle="italic">
              the strip is drawn when the run has finished
            </text>
          )}
        </g>
      )}
    </svg>
  )
}

// ---- captions ----
const p0 = { marginTop: 0, marginBottom: '0.25rem' } as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <p style={p0}>
        <strong>{title}</strong>
      </p>
      {children}
    </>
  )
}

export function Part1Caption({ arrived }: { arrived: boolean }) {
  const virgo = bigBangWorkedExample(16.5)
  const coma = bigBangWorkedExample(100)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> The picture shows a ruler for time, three galaxies sliding back toward Earth, and, once the run has finished, two panels that show how long that takes.
      </p>
      <Section title="What is drawn.">
        <ul style={listStyle}>
          <li>
            <strong>The time ruler</strong> (top): a ruler divided into ten equal blocks. Its left end is how long ago the backward run starts (the number appears when you press Run) and its right end is 0, the <strong>singularity</strong>. The gold line is the pointer: during the backward run
            it moves from the left end to the right end, and the number under it counts the billions of years still to go.
          </li>
          <li>
            <strong>The galaxy row</strong> (middle): Earth on the right in blue, and the three galaxies as dots, placed by how far they are from Earth today (the farther, the farther left). Virgo is gold and pulses so that your eye can follow it; every galaxy actually moves in
            the same way. The spacing is illustrative, not to scale. &ldquo;Mpc&rdquo; is a megaparsec, about 3.3 million light-years. A gold trail grows behind the highlighted galaxy as it moves.
          </li>
          <li>
            <strong>&ldquo;Time to reach Earth&rdquo;</strong> (drawn when the run has finished): one bar for each galaxy. A longer bar means more time. &ldquo;Not run yet&rdquo; means no bar has been drawn. The scale is in billions of years, from 0 to 16.
          </li>
          <li>
            <strong>The zoom strip</strong> (drawn when the run has finished): a close-up from 12 to 16 billion years. The <strong>amber</strong> tick is this page&rsquo;s calculated answer. The <strong>green</strong> tick is the age measured by others. The strip is zoomed in
            because the two ticks are very close together, too close to tell apart on the ruler above.{arrived ? ' They are only about 0.17 billion years apart, which would be about 3 pixels on the ruler.' : ''}
          </li>
          <li>
            <strong>White marks (your guesses):</strong> drawn only after the run has finished. They are <strong>only markers</strong>: on the bars, an arrow past the end of the farthest bar means you guessed longer, an arrow that stops short means shorter, and a tick at the
            end means the same; on the strip, a marker to the right of the amber tick means &ldquo;much longer&rdquo;, to the left of the green tick &ldquo;much shorter&rdquo;, and between the two ticks &ldquo;close&rdquo;. How far away they are drawn has no scientific meaning.{' '}
            <strong>They show your guess. They do not say whether it is right.</strong>
          </li>
        </ul>
      </Section>
      <Section title="What appears when.">
        <ol style={listStyle}>
          <li>Before Run: the ruler, Earth, the galaxies and the labels.</li>
          <li>After Run: the dots slide toward Earth and the pointer moves along the ruler.</li>
          <li>When the run has finished: the two new panels and your white marks.</li>
          <li>After the run, &ldquo;Play forward&rdquo; replays the same calculation from the singularity outward.</li>
        </ol>
      </Section>
      {!arrived && (
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>After Run,</strong> a worked example with real numbers and a short list of what to look at appear here. They wait until the run has finished so that they do not give away what you are guessing.
        </p>
      )}
      {arrived && (
        <>
          <Section title="A worked moment.">
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              Take the Virgo Cluster. It is {fmtMpc(virgo.distanceMpc)} Mpc away, which is {(virgo.distanceKm / 1e20).toFixed(2)} × 10²⁰ km. Its speed is 70 × {fmtMpc(virgo.distanceMpc)} = {fmtNumber(virgo.speedKmPerS)} km/s. Dividing the distance by the speed gives{' '}
              {(virgo.seconds / 1e17).toFixed(3)} × 10¹⁷ seconds, which is {fmtBillions(virgo.years)} billion years. The Coma Cluster is {fmtMpc(coma.distanceMpc)} Mpc away and moves at {fmtNumber(coma.speedKmPerS)} km/s. Dividing gives {fmtBillions(coma.years)} billion
              years again.
            </p>
          </Section>
          <LookFor
            items={[
              {
                look: 'The three bars on "Time to reach Earth".',
                means: `Virgo, Coma and the 200 Mpc galaxy each take ${fmtBillions(hubbleTimeYears())} billion years to reach zero distance.`,
                matters: 'It is the number your first guess was about, so you can compare your white marker with the real bars.',
              },
              {
                look: 'The amber and green ticks on the zoom strip.',
                means: `This page's ${fmtBillions(hubbleTimeYears())} is about 0.17 billion years, or 1.2 percent, more than the 13.8 measured by others.`,
                matters: 'It is what your second guess was about, so you can compare your white marker with the real gap.',
              },
              {
                look: 'Where each dot is when the pointer reaches the right end of the ruler.',
                means: 'All the dots reach Earth at that same moment.',
                matters: 'It shows that, in this simplified model, every galaxy points back to the same starting moment. The full reason is for the tutor.',
              },
            ]}
          />
        </>
      )}
      <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>The galaxies&rsquo; spacing is not to scale. The numbers are in the table in Part 3.</p>
    </CaptionBox>
  )
}

export function Part2Caption({ ran }: { ran: boolean }) {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this drawing.</strong> It is the same ruler, galaxies and &ldquo;Time to reach Earth&rdquo; bars as in Part 1, with a <strong style={{ color: YOURS_COLOR }}>pink</strong> galaxy at the distance you chose. The galaxy you highlighted is gold. There are no white
        marks and no zoom strip here; they stay in Part 1.
      </p>
      {ran ? (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for.</strong> Look at the pink bar next to the others, and at when the pink dot reaches Earth. These are trial values: your own numbers, not a claim about a real galaxy. The numbers are in the Part 3 table.
        </p>
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>Choose a distance and press &ldquo;Show my galaxy&rdquo; to see the run.</p>
      )}
    </CaptionBox>
  )
}
