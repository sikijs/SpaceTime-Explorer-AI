import type { ReactNode } from 'react'
import {
  guessedFarSpeedKmPerS,
  redshiftGuessMarkerRow,
  runHubblePair,
  speedPanelMaxKmPerS,
  workedExample,
} from '../physics/hubblesLawExperiment'
import type { HubblePair, RedshiftGuess, SpeedGuess } from '../physics/hubblesLawExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 1, audited to the newer rules (docs/audit/cosmology/01-draft-wording.md, approved by the owner on 2026-11-14).
// The two pictures: a pair of galaxies (B nearer, A exactly twice as far) with their light travelling to Earth, and a "Recession speed"
// panel under it. Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The white marks are
// only ever the learner's guess (CLAUDE.md §14) and are drawn only once the light has arrived and the speed bars are drawn (§12).

export const GUESS_COLOR = '#ffffff'
const B_COLOR = '#a78bfa' // violet: Galaxy B's row and speed bar (Part 1)
const A_COLOR = '#22d3ee' // cyan: Galaxy A's row and speed bar (Part 1)
const YOURS_A_COLOR = '#f9a8d4' // light pink: Galaxy A in Part 2 (B is YOURS_COLOR)
const EARTH_COLOR = '#38bdf8'

const VIEW_WIDTH = 660
const VIEW_HEIGHT = 330
const EARTH_X = 500
const ROW_B_Y = 62
const ROW_A_Y = 142
const GALAXY_NEAREST_X = 440
const GALAXY_FARTHEST_X = 78
const MAX_DRAWN_DISTANCE_MPC = 200 // the farthest galaxy Part 2 can draw (A at twice a B of 100 Mpc)
const BAR_X0 = 120
const BAR_X1 = 520

// ---- the light's display (exaggerated; CLAUDE.md §11) ----
// The real stretch (at most a few percent here) would be invisible, so redshift is mapped onto the full pale-to-red range relative to
// VISUAL_REFERENCE_REDSHIFT (on a square-root scale, see visualFraction), and the drawn wave widens to VISUAL_MAX_WAVELENGTH_STRETCH times
// its starting wavelength at that value.
// The exact numbers are always in the Part 3 table.
export const VISUAL_REFERENCE_REDSHIFT = 0.05
const VISUAL_MAX_WAVELENGTH_STRETCH = 3
const WAVE_BASE_WAVELENGTH_PX = 20
const WAVE_AMPLITUDE_PX = 8

// A square-root curve, so that small redshifts (the Part 1 pair, z of about 0.004 and 0.008) still look clearly different from each other,
// while the largest the page can draw (about 0.047) stays just short of fully red. It is a fixed display scale: it never depends on the
// guesses, and a bigger z always looks redder and wider.
function visualFraction(z: number): number {
  return Math.sqrt(Math.max(0, Math.min(1, z / VISUAL_REFERENCE_REDSHIFT)))
}

export function colorForRedshift(z: number): string {
  const fraction = visualFraction(z)
  const r = Math.round(230 + fraction * (239 - 230))
  const g = Math.round(240 - fraction * (240 - 68))
  const b = Math.round(255 - fraction * (255 - 68))
  return `rgb(${r}, ${g}, ${b})`
}

// A point at fraction u of the way from the galaxy to Earth has been in transit for fraction u of the trip, so it has collected
// fraction u of the trip's redshift. Sampling the wavelength by position draws one continuous shape: tight and pale near the galaxy,
// widening and reddening toward the leading edge.
export function waveTrailPoints(galaxyX: number, earthX: number, frontX: number, y: number, totalRedshift: number): string {
  const totalDistance = earthX - galaxyX
  if (totalDistance <= 0 || frontX <= galaxyX) return ''
  const samples = 120
  let phase = 0
  let prevX = galaxyX
  const points: string[] = []
  for (let i = 0; i <= samples; i++) {
    const x = galaxyX + (i / samples) * (frontX - galaxyX)
    const u = (x - galaxyX) / totalDistance
    const localFraction = visualFraction(u * totalRedshift)
    const localWavelengthPx = WAVE_BASE_WAVELENGTH_PX * (1 + localFraction * (VISUAL_MAX_WAVELENGTH_STRETCH - 1))
    phase += (2 * Math.PI * (x - prevX)) / localWavelengthPx
    points.push(`${x.toFixed(2)},${(y + WAVE_AMPLITUDE_PX * Math.sin(phase)).toFixed(2)}`)
    prevX = x
  }
  return points.join(' ')
}

export const galaxyX = (distanceMpc: number) =>
  GALAXY_NEAREST_X - (Math.min(distanceMpc, MAX_DRAWN_DISTANCE_MPC) / MAX_DRAWN_DISTANCE_MPC) * (GALAXY_NEAREST_X - GALAXY_FARTHEST_X)

export const fmtNumber = (v: number) => Math.round(v).toLocaleString('en-US')
const fmtMpc = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(1))))

export interface PairGuesses {
  speed: SpeedGuess
  redshift: RedshiftGuess
}

const SPEED_GUESS_LINE: Record<SpeedGuess, string> = { twice: "A's speed = 2 × B's", same: "A's speed = B's", half: "A's speed = ½ of B's" }
const REDSHIFT_GUESS_LINE: Record<RedshiftGuess, string> = { nearer: 'B looks redder', farther: 'A looks redder', same: 'no difference' }

function GuessBox({ x, y, line }: { x: number; y: number; line: string }) {
  return (
    <g>
      <rect x={x} y={y} width={100} height={30} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
      <text x={x + 50} y={y + 13} fill={GUESS_COLOR} fontSize="10" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + 50} y={y + 25} fill={GUESS_COLOR} fontSize="9" textAnchor="middle">
        {line}
      </text>
    </g>
  )
}

export interface PairPictureProps {
  pair: HubblePair
  // 0 before the light leaves, 1 once it has arrived. Both lights are drawn arriving together (a display choice, not real travel time).
  progress: number
  started: boolean
  // The learner's guesses (Part 1 only). Drawn only once the light has arrived.
  guesses: PairGuesses | null
  yours?: boolean
  // Keeps the two pictures' SVG ids apart.
  idPrefix: string
}

export function PairPicture({ pair, progress, started, guesses, yours = false, idPrefix }: PairPictureProps) {
  const arrived = started && progress >= 1
  const nearColor = yours ? YOURS_COLOR : B_COLOR
  const farColor = yours ? YOURS_A_COLOR : A_COLOR
  const rows = [
    { key: 'near' as const, name: 'B', y: ROW_B_Y, result: pair.near, color: nearColor },
    { key: 'far' as const, name: 'A', y: ROW_A_Y, result: pair.far, color: farColor },
  ]
  const max = speedPanelMaxKmPerS(pair, guesses?.speed ?? 'twice')
  const barX = (km: number) => BAR_X0 + (km / max) * (BAR_X1 - BAR_X0)
  const showGuesses = arrived && guesses !== null
  const guessedKm = guesses ? guessedFarSpeedKmPerS(guesses.speed, pair.near.distanceMpc) : 0
  const markerRow = guesses ? redshiftGuessMarkerRow(guesses.redshift) : null

  return (
    <svg
      width={VIEW_WIDTH}
      height={VIEW_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label={yours ? 'Your own pair of galaxies, their light, and their recession speeds' : 'A pair of galaxies, their light travelling to Earth, and their recession speeds'}
    >
      <defs>
        {rows.map((row) => {
          const gx = galaxyX(row.result.distanceMpc)
          const frontX = gx + progress * (EARTH_X - gx)
          return (
            <linearGradient key={row.key} id={`${idPrefix}-wave-${row.key}`} gradientUnits="userSpaceOnUse" x1={gx} y1={row.y} x2={frontX} y2={row.y}>
              <stop offset="0%" stopColor={colorForRedshift(0)} />
              <stop offset="100%" stopColor={colorForRedshift(progress * row.result.redshift)} />
            </linearGradient>
          )
        })}
      </defs>

      {rows.map((row) => {
        const gx = galaxyX(row.result.distanceMpc)
        const frontX = gx + progress * (EARTH_X - gx)
        const ringColor = arrived ? colorForRedshift(row.result.redshift) : '#334155'
        const points = started ? waveTrailPoints(gx, EARTH_X, frontX, row.y, row.result.redshift) : ''
        return (
          <g key={row.key}>
            <text x={gx} y={row.y - 24} fill={row.color} fontSize="11" fontWeight="bold" textAnchor="middle">
              {`Galaxy ${row.name} (${fmtMpc(row.result.distanceMpc)} Mpc)`}
            </text>
            <circle cx={gx} cy={row.y} r={12} fill={colorForRedshift(0)} />
            <line x1={gx} y1={row.y} x2={EARTH_X} y2={row.y} stroke="#334155" strokeWidth={1} strokeDasharray="4 4" />
            {started && points && <polyline points={points} fill="none" stroke={`url(#${idPrefix}-wave-${row.key})`} strokeWidth={2} strokeLinecap="round" />}
            {started && !arrived && <circle cx={frontX} cy={row.y} r={4} fill={colorForRedshift(progress * row.result.redshift)} />}
            <circle cx={EARTH_X} cy={row.y} r={12} fill={EARTH_COLOR} />
            <circle cx={EARTH_X} cy={row.y} r={19} fill="none" stroke={ringColor} strokeWidth={3} opacity={arrived ? 1 : 0.6} />
            <text x={EARTH_X} y={row.y + 42} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
              Earth
            </text>
          </g>
        )
      })}
      <text x={20} y={20} fill={MUTED_COLOR} fontSize="10">
        light path (dashed) · light wave (wavy) · ring round Earth = colour of the light on arrival
      </text>
      {!started && (
        <text x={190} y={106} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
          not run yet
        </text>
      )}

      {/* Guess 2: only a marker, drawn on B's Earth ring, on A's, or between them, once the light has arrived. */}
      {showGuesses && guesses && markerRow && (
        <g>
          {markerRow === 'between' ? (
            <>
              <path d={`M ${EARTH_X + 30} ${ROW_B_Y} H ${EARTH_X + 40} V ${ROW_A_Y} H ${EARTH_X + 30}`} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
              <line x1={EARTH_X + 40} y1={(ROW_B_Y + ROW_A_Y) / 2} x2={EARTH_X + 50} y2={(ROW_B_Y + ROW_A_Y) / 2} stroke={GUESS_COLOR} strokeWidth={2} />
              <GuessBox x={VIEW_WIDTH - 108} y={(ROW_B_Y + ROW_A_Y) / 2 - 15} line={REDSHIFT_GUESS_LINE.same} />
            </>
          ) : (
            <>
              <circle cx={EARTH_X} cy={markerRow === 'near' ? ROW_B_Y : ROW_A_Y} r={26} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
              <line
                x1={EARTH_X + 26}
                y1={markerRow === 'near' ? ROW_B_Y : ROW_A_Y}
                x2={VIEW_WIDTH - 108}
                y2={markerRow === 'near' ? ROW_B_Y : ROW_A_Y}
                stroke={GUESS_COLOR}
                strokeWidth={2}
              />
              <GuessBox x={VIEW_WIDTH - 108} y={(markerRow === 'near' ? ROW_B_Y : ROW_A_Y) - 15} line={REDSHIFT_GUESS_LINE[guesses.redshift]} />
            </>
          )}
        </g>
      )}

      {/* The speed panel: its own title and scale, in the same picture. */}
      <line x1={20} y1={196} x2={VIEW_WIDTH - 20} y2={196} stroke="#334155" />
      <text x={20} y={212} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
        Recession speed (km/s)
      </text>
      {[
        { name: 'B', y: 224, km: pair.near.recessionSpeedKmPerS, color: nearColor },
        { name: 'A', y: 248, km: pair.far.recessionSpeedKmPerS, color: farColor },
      ].map((bar) => (
        <g key={bar.name}>
          <text x={BAR_X0 - 8} y={bar.y + 11} fill={bar.color} fontSize="11" fontWeight="bold" textAnchor="end">
            {`Galaxy ${bar.name}`}
          </text>
          {arrived ? (
            <>
              <rect x={BAR_X0} y={bar.y} width={Math.max(1, barX(bar.km) - BAR_X0)} height={14} fill={bar.color} />
              <text x={barX(bar.km) + 6} y={bar.y + 11} fill={TEXT_COLOR} fontSize="10">
                {`${fmtNumber(bar.km)} km/s`}
              </text>
            </>
          ) : (
            <text x={BAR_X0} y={bar.y + 11} fill={MUTED_COLOR} fontSize="10" fontStyle="italic">
              not run yet
            </text>
          )}
        </g>
      ))}
      {showGuesses && guesses && (
        <g>
          <text x={BAR_X0 - 8} y={283} fill={GUESS_COLOR} fontSize="11" fontWeight="bold" textAnchor="end">
            Your guess
          </text>
          <rect x={BAR_X0} y={272} width={Math.max(1, barX(guessedKm) - BAR_X0)} height={14} fill="none" stroke={GUESS_COLOR} strokeWidth={2.5} strokeDasharray="5 3" />
          <line x1={barX(guessedKm)} y1={279} x2={VIEW_WIDTH - 112} y2={279} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={VIEW_WIDTH - 112} y={264} line={SPEED_GUESS_LINE[guesses.speed]} />
        </g>
      )}
      <line x1={BAR_X0} y1={296} x2={BAR_X1} y2={296} stroke={MUTED_COLOR} />
      <text x={BAR_X0} y={310} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
        0
      </text>
      {arrived && (
        <text x={BAR_X1} y={310} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
          {`${fmtNumber(max)} km/s`}
        </text>
      )}
      <text x={(BAR_X0 + BAR_X1) / 2} y={324} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
        {arrived ? 'scale: 0 to the longest bar' : 'the bars are drawn when the light arrives'}
      </text>
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
  const near = runHubblePair(16.5)
  const ex = workedExample(near.near.distanceMpc)
  const far = near.far
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> The picture shows two galaxies and the light that travels from each to Earth. Under it, a panel shows how fast each galaxy is moving away.
      </p>
      <Section title="What is drawn.">
        <ul style={listStyle}>
          <li>
            <strong>Two rows.</strong> The top row is Galaxy B and the bottom row is Galaxy A. Each has a galaxy on the left, its own copy of Earth on the right, a dashed line for the path of the light, and a wavy line for the light itself. The farther a galaxy is from
            Earth, the farther left it is drawn. Galaxy A is exactly twice as far as Galaxy B. &ldquo;Mpc&rdquo; is a megaparsec, about 3.3 million light-years.
          </li>
          <li>
            <strong>The light wave and its dot.</strong> The wavy line is the light, and the small dot is its leading edge. It starts pale blue-white, the light&rsquo;s colour when it left the galaxy. The colour and the spacing between the wave&rsquo;s peaks show how
            much it has been stretched so far.
          </li>
          <li>
            <strong>The ring round Earth.</strong> Its colour shows how stretched the light was when it arrived. Grey means it has not arrived yet.
          </li>
          <li>
            <strong>The Recession speed panel.</strong> One horizontal bar for each galaxy. A longer bar means a faster galaxy; &ldquo;not run yet&rdquo; means no bar has been drawn. The scale is in km/s (kilometres per second) and runs from 0 to the longest bar.
          </li>
          <li>
            <strong>White marks (your guesses).</strong> Drawn only after the light has arrived. The white dashed bar is the length Galaxy A&rsquo;s bar would have if your guess about speed were right. The white ring is on the Earth whose light you guessed would look
            redder, or a white bracket joins both for &ldquo;no difference&rdquo;. The ring and bracket are only markers, with no size of their own. <strong>They show your guess. They do not say whether it is right.</strong>
          </li>
        </ul>
      </Section>
      <Section title="What appears when.">
        <ol style={listStyle}>
          <li>Before Run: the galaxies, Earth and the labels.</li>
          <li>After Run: the light wave travels from each galaxy to Earth and changes colour on the way. Both lights are drawn arriving together; that is a display choice, not the real travel time.</li>
          <li>When the light arrives: the rings round Earth, the speed bars and your white marks.</li>
        </ol>
      </Section>
      {arrived && (
      <Section title="A worked moment.">
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          Galaxy B is {fmtMpc(ex.distanceMpc)} Mpc away. Its speed is 70 × {fmtMpc(ex.distanceMpc)} = {fmtNumber(ex.speedKmPerS)} km/s. Its redshift is {fmtNumber(ex.speedKmPerS)} ÷ 299,792 = {ex.redshift.toFixed(5)}, so a {ex.startWavelengthNm} nm wavelength arrives
          as about {ex.arrivalWavelengthNm.toFixed(1)} nm. Galaxy A is {fmtMpc(far.distanceMpc)} Mpc away. Its speed is 70 × {fmtMpc(far.distanceMpc)} = {fmtNumber(far.recessionSpeedKmPerS)} km/s and its redshift is {far.redshift.toFixed(5)}.
        </p>
      </Section>
      )}
      {!arrived && (
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>After Run,</strong> a worked example with real numbers and a short list of what to look at appear here. They wait until the light has arrived so that they do not give away what you are guessing.
        </p>
      )}
      {arrived && (
        <>
          <LookFor
            items={[
              {
                look: 'The two speed bars.',
                means: `Galaxy B's bar ends at ${fmtNumber(near.near.recessionSpeedKmPerS)} km/s and Galaxy A's at ${fmtNumber(near.far.recessionSpeedKmPerS)} km/s. They are the speeds worked out for those two distances.`,
                matters: 'It is the number your first guess was about, so you can compare your white dashed bar with the real one.',
              },
              {
                look: 'The two rings round Earth.',
                means: `Each ring's colour is how stretched that galaxy's light was on arrival (z = ${near.near.redshift.toFixed(5)} for B, ${near.far.redshift.toFixed(5)} for A).`,
                matters: 'It is what your second guess was about, so you can compare your white ring or bracket with the real rings.',
              },
              {
                look: 'The spacing between the peaks of each light wave, near the galaxy and near Earth.',
                means: 'The peaks start close together and spread out on the journey. The stretching builds up during the trip, not at the start.',
                matters: 'It shows the stretching happens to the light while it travels. The full reason is for the tutor.',
              },
            ]}
          />
        </>
      )}
      <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
        The colour and the width of the wave are drawn much stronger than the real stretch, so that you can see them. The exact numbers are in the table in Part 3.
      </p>
    </CaptionBox>
  )
}

export function Part2Caption({ ran }: { ran: boolean }) {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this drawing.</strong> It is the same drawing as in Part 1, at the distances you chose. Pink is your own numbers: Galaxy B and its speed bar in pink, Galaxy A in a lighter pink. Galaxy A is always twice as far as Galaxy B. There are no white
        marks here; they stay on Part 1.
      </p>
      {ran ? (
        <>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What to look for.</strong> Look at the two speed bars and the two rings again, at the new distances. The numbers are in the Part 3 table. These are trial values: they are your own numbers, and they do not say the real galaxies are like that.
          </p>
        </>
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>Choose a distance and press &ldquo;Show my pair&rdquo; to see it drawn.</p>
      )}
    </CaptionBox>
  )
}
