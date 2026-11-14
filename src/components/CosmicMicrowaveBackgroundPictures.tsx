import type { ReactNode } from 'react'
import {
  CMB_TEMPERATURE_TODAY_KELVIN,
  MEASURED_SPREAD_FRACTION,
  RECOMBINATION_REDSHIFT,
  RECOMBINATION_YEARS_AFTER_BIG_BANG,
  cmbTemperatureKelvin,
  cmbWorkedExample,
  skyGuessStripFraction,
  spreadKelvin,
  spreadScaleFraction,
  temperatureGuessMarker,
  temperatureScaleFraction,
} from '../physics/cosmicMicrowaveBackgroundExperiment'
import type { SkyGuess, TemperatureGuess } from '../physics/cosmicMicrowaveBackgroundExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 3, audited to the newer rules (docs/audit/cosmology/03-draft-wording.md, sections 5 and 6).
// One picture in up to four pieces: the journey bar, the temperature panel (a tenfold scale), and, once the run has finished, the sky
// circles and the "how much directions differ" strip. Every position of a real value or a guess comes from the physics module; this
// file only draws and words it (CLAUDE.md §9). White is only ever the learner's guess (§14). Nothing that answers a guess is drawn
// before the run has finished (§12): before then the bar is plain grey with names only, with no "hot", no "cold" and no gradient.

export const GUESS_COLOR = '#ffffff'
const AMBER = '#f59e0b' // calculated here
const GREEN = '#4ade80' // measured by others

const VIEW_WIDTH = 660
const X0 = 70
const X1 = 590
const BAR_Y = 78
const BAR_H = 22

const TEMP_TOP = 140
const TEMP_AXIS_Y = 216
const SKY_TOP = 292
const STRIP_TOP = 380
const STRIP_AXIS_Y = 490

const HEIGHT_SHORT = 285
const HEIGHT_FULL = 535

const TEMP_TICKS: Array<{ kelvin: number; label: string }> = [
  { kelvin: 1, label: '1 K' },
  { kelvin: 10, label: '10 K' },
  { kelvin: 100, label: '100 K' },
  { kelvin: 1000, label: '1,000 K' },
  { kelvin: 10000, label: '10,000 K' },
]
const SPREAD_TICKS: Array<{ fraction: number; label: string }> = [
  { fraction: 1e-1, label: '1 in 10' },
  { fraction: 1e-2, label: '1 in 100' },
  { fraction: 1e-3, label: '1 in 1,000' },
  { fraction: 1e-4, label: '1 in 10,000' },
  { fraction: 1e-5, label: '1 in 100,000' },
  { fraction: 1e-6, label: '1 in 1,000,000' },
]

// Display-only colour mapping (CLAUDE.md §11): from a hot white-orange at recombination to a deep microwave violet today, linear in the
// fraction of the way back to recombination. The exact temperature is always printed beside it.
const COLD_RGB = [76, 29, 149]
const HOT_RGB = [255, 214, 153]
export function colorForRedshift(z: number): string {
  const f = Math.max(0, Math.min(1, z / RECOMBINATION_REDSHIFT))
  const [r, g, b] = COLD_RGB.map((cold, i) => Math.round(cold + f * (HOT_RGB[i] - cold)))
  return `rgb(${r}, ${g}, ${b})`
}

// The bar runs from Recombination (left) to Today (right). A plain linear map of redshift onto the bar, for display.
export function barXForRedshift(z: number): number {
  const f = Math.max(0, Math.min(1, z / RECOMBINATION_REDSHIFT))
  return X1 - f * (X1 - X0)
}

export const fmtKelvin = (kelvin: number) => (kelvin < 100 ? kelvin.toFixed(3) : Math.round(kelvin).toLocaleString('en-US'))
const fmtZ = (z: number) => (Number.isInteger(z) ? String(z) : z.toFixed(1))

const xTemp = (kelvin: number) => X0 + temperatureScaleFraction(kelvin) * (X1 - X0)
const xSpread = (fraction: number) => X0 + spreadScaleFraction(fraction) * (X1 - X0)

export interface CmbGuesses {
  temperature: TemperatureGuess
  sky: SkyGuess
}

export interface CmbPictureProps {
  // 'part1': the learner's run, today back to recombination. 'part2': the learner's own moment, a pink marker.
  mode: 'part1' | 'part2'
  // The light's redshift while Part 1's run plays (0 at the start, the recombination redshift at the end).
  redshift: number
  // True once the run has finished: the colours, the temperature marks, the sky, the strip and the white marks are drawn only then (§12).
  arrived: boolean
  // The learner's guesses, drawn in white once arrived (Part 1 only).
  guesses: CmbGuesses | null
  // Part 2's pink moment.
  yourRedshift?: number
}

function GuessBox({ x, y, width, line }: { x: number; y: number; width: number; line: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={30} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
      <text x={x + width / 2} y={y + 13} fill={GUESS_COLOR} fontSize="10" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + width / 2} y={y + 25} fill={GUESS_COLOR} fontSize="9" textAnchor="middle">
        {line}
      </text>
    </g>
  )
}

const TEMPERATURE_GUESS_LINE: Record<TemperatureGuess, string> = {
  higher: 'hotter at recombination',
  lower: 'cooler at recombination',
  same: 'the same as today',
}
const SKY_GUESS_LINE: Record<SkyGuess, string> = {
  uniform: 'about the same in every direction',
  varies: 'varies a lot',
}

const clampX = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

export function CmbPicture({ mode, redshift, arrived, guesses, yourRedshift }: CmbPictureProps) {
  const part1 = mode === 'part1'
  const showSky = part1 && arrived
  const height = showSky ? HEIGHT_FULL : HEIGHT_SHORT
  const markerX = barXForRedshift(redshift)
  const markerColor = arrived ? colorForRedshift(redshift) : '#cbd5e1'
  const releaseKelvin = cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)
  const todayX = xTemp(CMB_TEMPERATURE_TODAY_KELVIN)
  const releaseX = xTemp(releaseKelvin)
  const showGuessOne = part1 && arrived && guesses !== null
  const showGuessTwo = showSky && guesses !== null
  const marker = guesses ? temperatureGuessMarker(guesses.temperature) : null
  const arrowY = TEMP_AXIS_Y - 14
  const markX = marker === 'arrow-hotter' ? todayX + 28 : marker === 'arrow-cooler' ? todayX - 28 : todayX
  const boxOneX = clampX(markX - 80, 4, VIEW_WIDTH - 160 - 4)
  const stripMeasuredX = xSpread(MEASURED_SPREAD_FRACTION)
  const skyEndX = guesses ? X0 + skyGuessStripFraction(guesses.sky) * (X1 - X0) : 0
  const yourK = yourRedshift !== undefined ? cmbTemperatureKelvin(yourRedshift) : null

  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="The light's journey from today back to recombination, a panel with the temperature at each end, and the sky in every direction"
    >
      <defs>
        <linearGradient id="cmb-journey-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colorForRedshift(RECOMBINATION_REDSHIFT)} />
          <stop offset="100%" stopColor={colorForRedshift(0)} />
        </linearGradient>
      </defs>

      {/* The journey bar. Plain grey with names only until the run has finished. */}
      <text x={VIEW_WIDTH / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        The light&rsquo;s journey, from today back to recombination
      </text>
      <rect x={X0} y={BAR_Y} width={X1 - X0} height={BAR_H} rx={4} fill={arrived ? 'url(#cmb-journey-gradient)' : '#475569'} />
      <text x={X0} y={BAR_Y + BAR_H + 16} fill={TEXT_COLOR} fontSize="11" textAnchor="start">
        Recombination
      </text>
      <text x={X0} y={BAR_Y + BAR_H + 29} fill={MUTED_COLOR} fontSize="10" textAnchor="start">
        {arrived ? `z ≈ ${RECOMBINATION_REDSHIFT}, ` : ''}about {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after the Big Bang
      </text>
      <text x={X1} y={BAR_Y + BAR_H + 16} fill={TEXT_COLOR} fontSize="11" textAnchor="end">
        Today (Earth)
      </text>
      {arrived && (
        <text x={X1} y={BAR_Y + BAR_H + 29} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
          z = 0
        </text>
      )}
      {part1 ? (
        <g>
          <line x1={markerX} y1={BAR_Y - 12} x2={markerX} y2={BAR_Y + BAR_H + 4} stroke="#f8fafc" strokeWidth={2} />
          <circle cx={markerX} cy={BAR_Y - 20} r={8} fill={markerColor} stroke="#f8fafc" strokeWidth={2} />
          <text x={clampX(markerX, 90, VIEW_WIDTH - 90)} y={BAR_Y - 34} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            the light&rsquo;s position in time
          </text>
        </g>
      ) : (
        yourRedshift !== undefined && (
          <g>
            <line x1={barXForRedshift(yourRedshift)} y1={BAR_Y - 12} x2={barXForRedshift(yourRedshift)} y2={BAR_Y + BAR_H + 4} stroke={YOURS_COLOR} strokeWidth={3} />
            <circle cx={barXForRedshift(yourRedshift)} cy={BAR_Y - 20} r={8} fill={YOURS_COLOR} stroke="#f8fafc" strokeWidth={2} />
            <text x={clampX(barXForRedshift(yourRedshift), 90, VIEW_WIDTH - 90)} y={BAR_Y - 34} fill={YOURS_COLOR} fontSize="10" textAnchor="middle">
              your moment: z = {fmtZ(yourRedshift)}
            </text>
          </g>
        )
      )}

      {/* The temperature panel: a tenfold scale, 1 K to 10,000 K. */}
      <line x1={20} y1={TEMP_TOP} x2={VIEW_WIDTH - 20} y2={TEMP_TOP} stroke="#334155" />
      <text x={20} y={TEMP_TOP + 16} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
        Temperature at each end, on a tenfold scale (kelvin)
      </text>
      <line x1={X0} y1={TEMP_AXIS_Y} x2={X1} y2={TEMP_AXIS_Y} stroke={MUTED_COLOR} strokeWidth={2} />
      {TEMP_TICKS.map((t) => (
        <g key={t.kelvin}>
          <line x1={xTemp(t.kelvin)} y1={TEMP_AXIS_Y - 4} x2={xTemp(t.kelvin)} y2={TEMP_AXIS_Y + 4} stroke={MUTED_COLOR} />
          <text x={xTemp(t.kelvin)} y={TEMP_AXIS_Y + 17} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
            {t.label}
          </text>
        </g>
      ))}
      {arrived ? (
        <g>
          <line x1={todayX} y1={TEMP_AXIS_Y - 30} x2={todayX} y2={TEMP_AXIS_Y + 6} stroke={GREEN} strokeWidth={3} />
          <text x={todayX - 4} y={TEMP_AXIS_Y - 36} fill={GREEN} fontSize="10" textAnchor="start">
            Today: {fmtKelvin(CMB_TEMPERATURE_TODAY_KELVIN)} K (measured)
          </text>
          <line x1={releaseX} y1={TEMP_AXIS_Y - 30} x2={releaseX} y2={TEMP_AXIS_Y + 6} stroke={AMBER} strokeWidth={3} />
          <text x={releaseX + 40} y={TEMP_AXIS_Y - 36} fill={AMBER} fontSize="10" textAnchor="end">
            Recombination: {fmtKelvin(releaseKelvin)} K (calculated here)
          </text>
        </g>
      ) : (
        <text x={(X0 + X1) / 2} y={TEMP_AXIS_Y - 20} fill={MUTED_COLOR} fontSize="10" fontStyle="italic" textAnchor="middle">
          {part1 ? 'the two marks are drawn when the run has finished' : 'the two marks are drawn once Part 1 has run'}
        </text>
      )}

      {/* Part 2: the learner's own moment, in pink, on the same scale. */}
      {!part1 && yourK !== null && (
        <g>
          <line x1={xTemp(yourK)} y1={TEMP_AXIS_Y - 14} x2={xTemp(yourK)} y2={TEMP_AXIS_Y + 6} stroke={YOURS_COLOR} strokeWidth={3} />
          <line x1={xTemp(yourK)} y1={TEMP_AXIS_Y + 24} x2={xTemp(yourK)} y2={TEMP_AXIS_Y + 36} stroke={YOURS_COLOR} strokeWidth={1.5} />
          <text x={clampX(xTemp(yourK), 130, VIEW_WIDTH - 130)} y={TEMP_AXIS_Y + 48} fill={YOURS_COLOR} fontSize="10" textAnchor="middle">
            your moment: z = {fmtZ(yourRedshift!)}, {fmtKelvin(yourK)} K (calculated)
          </text>
        </g>
      )}

      {/* Guess 1: only a marker (an arrow from today's mark toward hotter or cooler, or a tick on it). Drawn once the run has finished. */}
      {showGuessOne && guesses && marker && (
        <g>
          {marker === 'arrow-hotter' && (
            <>
              <line x1={todayX + 8} y1={arrowY} x2={todayX + 40} y2={arrowY} stroke={GUESS_COLOR} strokeWidth={3} />
              <path d={`M ${todayX + 40} ${arrowY - 6} L ${todayX + 50} ${arrowY} L ${todayX + 40} ${arrowY + 6} Z`} fill={GUESS_COLOR} />
            </>
          )}
          {marker === 'arrow-cooler' && (
            <>
              <line x1={todayX - 8} y1={arrowY} x2={todayX - 40} y2={arrowY} stroke={GUESS_COLOR} strokeWidth={3} />
              <path d={`M ${todayX - 40} ${arrowY - 6} L ${todayX - 50} ${arrowY} L ${todayX - 40} ${arrowY + 6} Z`} fill={GUESS_COLOR} />
            </>
          )}
          {marker === 'tick-same' && <line x1={todayX} y1={arrowY - 11} x2={todayX} y2={arrowY + 11} stroke={GUESS_COLOR} strokeWidth={4} />}
          <line x1={markX} y1={arrowY + 8} x2={markX} y2={TEMP_AXIS_Y + 40} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={boxOneX} y={TEMP_AXIS_Y + 40} width={160} line={TEMPERATURE_GUESS_LINE[guesses.temperature]} />
        </g>
      )}

      {/* The sky and the strip (Part 1, after the run). */}
      {showSky && (
        <g>
          <line x1={20} y1={SKY_TOP} x2={VIEW_WIDTH - 20} y2={SKY_TOP} stroke="#334155" />
          <text x={20} y={SKY_TOP + 16} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
            The sky in every direction, as seen today (illustrative)
          </text>
          {Array.from({ length: 7 }).map((_, i) => {
            const cx = X0 + 40 + i * ((X1 - X0 - 80) / 6)
            return (
              <g key={i}>
                <circle cx={cx} cy={SKY_TOP + 48} r={14} fill={colorForRedshift(0)} stroke="#475569" strokeWidth={1} />
                <text x={cx} y={SKY_TOP + 76} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
                  about {fmtKelvin(CMB_TEMPERATURE_TODAY_KELVIN)} K
                </text>
              </g>
            )
          })}
          <text x={VIEW_WIDTH - 20} y={SKY_TOP + 16} fill={MUTED_COLOR} fontSize="9" textAnchor="end">
            each circle = one direction in the sky
          </text>

          <line x1={20} y1={STRIP_TOP} x2={VIEW_WIDTH - 20} y2={STRIP_TOP} stroke="#334155" />
          <text x={20} y={STRIP_TOP + 16} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
            How much do directions differ? (as a share of the temperature, tenfold scale)
          </text>
          <line x1={X0} y1={STRIP_AXIS_Y} x2={X1} y2={STRIP_AXIS_Y} stroke={MUTED_COLOR} strokeWidth={2} />
          {SPREAD_TICKS.map((t) => (
            <g key={t.label}>
              <line x1={xSpread(t.fraction)} y1={STRIP_AXIS_Y - 4} x2={xSpread(t.fraction)} y2={STRIP_AXIS_Y + 4} stroke={MUTED_COLOR} />
              <text x={xSpread(t.fraction)} y={STRIP_AXIS_Y + 17} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
                {t.label}
              </text>
            </g>
          ))}
          <text x={X0} y={STRIP_AXIS_Y + 30} fill={MUTED_COLOR} fontSize="9" textAnchor="start">
            bigger difference
          </text>
          <text x={X1} y={STRIP_AXIS_Y + 30} fill={MUTED_COLOR} fontSize="9" textAnchor="end">
            smaller difference
          </text>
          <line x1={stripMeasuredX} y1={STRIP_AXIS_Y - 12} x2={stripMeasuredX} y2={STRIP_AXIS_Y + 8} stroke={GREEN} strokeWidth={3} />
          <text x={stripMeasuredX + 30} y={STRIP_AXIS_Y - 18} fill={GREEN} fontSize="10" textAnchor="end">
            Measured: about 1 in 100,000 (about {spreadKelvin().toFixed(6)} K)
          </text>

          {/* Guess 2: only a marker, a box joined to the end of the strip that the guess means. */}
          {showGuessTwo && guesses && (
            <g>
              <path d={`M ${skyEndX - 6} ${STRIP_AXIS_Y - 14} L ${skyEndX + 6} ${STRIP_AXIS_Y - 14} L ${skyEndX} ${STRIP_AXIS_Y - 4} Z`} fill={GUESS_COLOR} />
              <line x1={skyEndX} y1={STRIP_AXIS_Y - 14} x2={skyEndX} y2={STRIP_AXIS_Y - 54} stroke={GUESS_COLOR} strokeWidth={2} />
              <GuessBox
                x={guesses.sky === 'uniform' ? X1 - 190 : X0}
                y={STRIP_AXIS_Y - 84}
                width={190}
                line={SKY_GUESS_LINE[guesses.sky]}
              />
            </g>
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
  const w = cmbWorkedExample()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> The picture follows the oldest light from today back to the moment it was released. It has up to four pieces, and they appear in order as the run finishes.
      </p>
      <Section title="What is drawn.">
        <ul style={listStyle}>
          <li>
            <strong>The journey bar</strong> (top): the light&rsquo;s journey through time, from <strong>Recombination</strong> (left) to <strong>Today</strong> (right, at Earth). The marker travels from Today back to Recombination as the run plays. <strong>z</strong> (redshift) tells how
            much the light has been stretched on its way to us: z = 0 means no stretching, and a larger z means more. <strong>Kelvin (K)</strong> is a temperature scale that starts at 0 K, the coldest possible; room temperature is about 293 K. Until the run has finished the bar is plain grey; the colours
            and the z numbers appear when it has.
          </li>
          <li>
            <strong>The temperature panel</strong> (drawn when the run has finished): two marks on a <strong>tenfold scale</strong>, where each tick is ten times the one before it (1, 10, 100, 1,000, 10,000 K).{' '}
            {arrived ? 'A tenfold scale is used because on an ordinary scale the smaller of the two marks would be a line about one third of a pixel wide. ' : ''}
            The <strong style={{ color: GREEN }}>green</strong> mark was measured by others. The <strong style={{ color: AMBER }}>amber</strong> mark was calculated here.
          </li>
          <li>
            <strong>The sky circles and the strip</strong> (drawn after the temperature panel): seven circles, each one direction in the sky. They are an illustration, not a map. Below them, the strip shows <strong>how much directions differ</strong>, as a share of the temperature, on a tenfold scale:
            to the left is a bigger difference and to the right a smaller one. The <strong style={{ color: GREEN }}>green</strong> mark on it was measured by others.
          </li>
          <li>
            <strong>White marks (your guesses):</strong> drawn only after the run has finished, and <strong>only markers</strong>. On the temperature panel, an arrow starting at Today&rsquo;s mark shows which way you guessed (to the right for hotter, to the left for cooler), and a tick on it means
            &ldquo;the same&rdquo;; the arrow&rsquo;s length means nothing. On the strip, a box joined to the right-hand end means &ldquo;about the same in every direction&rdquo;, and a box joined to the left-hand end means &ldquo;varies a lot&rdquo;; it says which end you meant, not a size.{' '}
            <strong>They show your guess. They do not say whether it is right.</strong>
          </li>
        </ul>
      </Section>
      <Section title="What appears when.">
        <ol style={listStyle}>
          <li>Before Run: the grey bar with its two names, and the empty temperature scale.</li>
          <li>While Run plays: the marker travels along the bar, and the redshift and temperature are counted in the line above the picture.</li>
          <li>When the run has finished: the colours on the bar, the two marks on the temperature panel and your first white mark.</li>
          <li>Then the sky circles, the strip and your second white mark.</li>
        </ol>
      </Section>
      {!arrived && (
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>After Run,</strong> a worked moment with real numbers and a short list of what to look at appear here. They wait until the run has finished so that they do not give away what you are guessing.
        </p>
      )}
      {arrived && (
        <>
          <Section title="A worked moment.">
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              The temperature at Recombination is {w.todayKelvin} × (1 + {RECOMBINATION_REDSHIFT}) = {w.todayKelvin} × {w.factor.toFixed(1)} ≈ {fmtKelvin(w.temperatureKelvin)} K. Today it is {w.todayKelvin} K. The first is about{' '}
              {Math.round(w.timesToday).toLocaleString('en-US')} times the second. For the sky: 1 part in 100,000 of {w.todayKelvin} K is {w.todayKelvin} ÷ 100,000 ≈ {w.spreadKelvin.toFixed(6)} K.
            </p>
          </Section>
          <LookFor
            items={[
              {
                look: 'The green and amber marks on the temperature panel.',
                means: `The light was about ${fmtKelvin(w.temperatureKelvin)} K at recombination and is ${w.todayKelvin} K today, a drop to about 1 part in ${Math.round(w.timesToday).toLocaleString('en-US')} of the first.`,
                matters: 'It shows that the light’s temperature changed enormously on its journey, and by how much. Why it changed is for the tutor.',
              },
              {
                look: 'Your white arrow (or tick) beside Today’s mark.',
                means: 'It shows which way you guessed, starting from today’s temperature.',
                matters: 'You can compare your direction with where the amber mark really lies.',
              },
              {
                look: 'The seven circles and the green mark on the strip.',
                means: `The real difference between directions is about 1 part in 100,000, which is about ${w.spreadKelvin.toFixed(6)} K on ${w.todayKelvin} K.`,
                matters: 'It tells you how big the real differences are, so you can see whether “about the same” or “a lot” fits them.',
              },
              {
                look: 'Your white box on the strip.',
                means: 'It shows which end of the strip you meant.',
                matters: 'You can see how far that end is from the real green mark.',
              },
            ]}
          />
        </>
      )}
      <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>The seven circles are an illustration and not a map of the sky. The numbers are in the tables in Part 3.</p>
    </CaptionBox>
  )
}

export function Part2Caption({ chosen }: { chosen: boolean }) {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this drawing.</strong> It is the same journey bar and temperature scale as in Part 1, with a <strong style={{ color: YOURS_COLOR }}>pink</strong> marker at the moment you chose. The pink marker sits where the light&rsquo;s temperature at that moment would be, found
        by today&rsquo;s temperature × (1 + z). It is a calculation, not a measurement. The green and amber marks do not move. There are no white marks here; they stay in Part 1.
      </p>
      {chosen ? (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for.</strong> Slide the moment and watch the pink marker move along the tenfold scale. These are trial values: your own numbers, not a claim about a real moment beyond the rule itself. The numbers are in Part 3.
        </p>
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>Choose a moment to see the pink marker.</p>
      )}
    </CaptionBox>
  )
}
