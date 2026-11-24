import type { CSSProperties, ReactNode } from 'react'
import { DEFAULT_SOURCE_NM, dopplerCheckUpRows, runDoppler } from '../physics/dopplerShift'
import type { ColorSide } from '../physics/dopplerShift'
import { FactorGraph } from './DopplerShiftPictures'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'

// Spacetime Geometry 8, Part 3 (the results of Part 1's run) and the two tables that Part 2 shows for the learner's own speed. Audit update of 2026-11-23: the reading guide of
// CLAUDE.md §14 ("Reading the Results"): a check-up, a "What this table tells us" note under each table, a graph with the guesses drawn on it, and the guesses beside the results (guess
// only, never marked). Wording in docs/audit/spacetime-geometry/08-draft-wording.md, section 5 (approved by the owner on 2026-11-23, §28.1). Every number comes from `runDoppler`,
// `dopplerCheckUpRows` and `factorCurve`.

const CELL: CSSProperties = { padding: '0.3rem 1rem 0.3rem 0' }
const NOTE: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)' }
const RESULT_LAB_ANGLES = [0, 30, 60, 90, 120, 150, 180]
const RANGE_LABEL = { ultraviolet: 'ultraviolet (UV)', visible: 'visible', infrared: 'infrared (IR)' } as const

export const SIDE_WORDS: Record<ColorSide, string> = { bluer: 'bluer', same: 'the same color', redder: 'redder' }

function formatNm(nm: number): string {
  return nm >= 100 ? String(Math.round(nm)) : String(Number(nm.toPrecision(2)))
}

function GuessTag({ n, side }: { n: 1 | 2; side: ColorSide }) {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.6875rem',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#0b1020',
        border: '1px solid #fff',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      YOUR GUESS {n}: {SIDE_WORDS[side]}
    </span>
  )
}

function Table({ head, rows, tags }: { head: string[]; rows: ReactNode[][]; tags?: Record<number, ReactNode> }) {
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ ...CELL, textAlign: 'left' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} style={CELL}>
                  {cell}
                  {i === 0 && tags?.[r]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div style={{ ...NOTE, marginBottom: '1.5rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>What this table tells us</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{children}</ul>
    </div>
  )
}

// The seven stars: lab angle, traveler's angle, factor, wavelength and range. `guesses` tags the 0° and 90° rows (Part 3 only).
export function SevenStarTable({ speed, guesses }: { speed: number; guesses?: { ahead: ColorSide; sideways: ColorSide } }) {
  const doppler = runDoppler(speed)
  return (
    <Table
      head={['Lab’s angle θ', 'Traveler’s angle θ′', 'Shift factor f′ ÷ f', 'Wavelength', 'Range']}
      rows={RESULT_LAB_ANGLES.map((labAngle) => {
        const star = doppler.stars[labAngle / 15]
        return [`${labAngle}°`, `${star.travelerAngle.toFixed(1)}°`, star.factor.toFixed(2), `${formatNm(star.wavelengthNm)} nm`, RANGE_LABEL[star.range]]
      })}
      tags={guesses ? { 0: <GuessTag n={1} side={guesses.ahead} />, 3: <GuessTag n={2} side={guesses.sideways} /> } : undefined}
    />
  )
}

// The counts, the crossing and D.
export function CountsTable({ speed }: { speed: number }) {
  const doppler = runDoppler(speed)
  const crossing = doppler.travelerCrossingAngle
  const labCrossing = doppler.labCrossingAngle
  return (
    <Table
      head={['', 'Value']}
      rows={[
        ['Stars shifted toward blue (factor above 1), of the 24', String(doppler.towardBlueCount)],
        ['Stars shifted toward red (factor below 1), of the 24', String(doppler.towardRedCount)],
        ['Where the factor is exactly 1, in the traveler’s sky', crossing === null ? 'none' : `${crossing.toFixed(1)}° from straight ahead`],
        ['Where the factor is exactly 1, in the lab’s sky', labCrossing === null ? 'none' : `${labCrossing.toFixed(1)}° from straight ahead`],
        ['The number D', doppler.timeDilationFactor.toFixed(3)],
      ]}
    />
  )
}

interface DopplerShiftResultsProps {
  speed: number
  predictedAhead: ColorSide
  predictedSideways: ColorSide
}

export function DopplerShiftResults({ speed, predictedAhead, predictedSideways }: DopplerShiftResultsProps) {
  const doppler = runDoppler(speed)
  const D = doppler.timeDilationFactor
  const [ahead, , , sideways, , , behind] = RESULT_LAB_ANGLES.map((a) => doppler.stars[a / 15])
  const rows = dopplerCheckUpRows(speed)
  const crossing = doppler.travelerCrossingAngle ?? 0
  const labCrossing = doppler.labCrossingAngle ?? 0
  const checkRows = rows.map((row, i) => [
    row.check,
    i < 3 ? 'a difference of 0' : row.expected.toFixed(3),
    i < 3 ? `largest difference ${row.found.toFixed(3)}` : row.found.toFixed(3),
    row.agrees ? row.reading : 'not the same',
  ])
  const nm = DEFAULT_SOURCE_NM
  return (
    <div>
      <p style={{ ...NOTE, marginTop: 0 }}>
        <strong>What you ran.</strong> A traveler flew through the middle of the ring of 24 stars at {speed}c. Every star sends out the same {nm} nm light, and the traveler measured each star’s
        light. <strong>Your guesses</strong> are shown below, next to the rows they were about. <strong>They do not change anything on this page.</strong>
      </p>

      <h4 style={{ margin: '1rem 0 0.25rem' }}>The check-up: does this page agree with its own physics, and with Einstein’s formula?</h4>
      <Table head={['Check', 'What we expected', 'What was found', 'Reading']} rows={checkRows} />
      <Note>
        <li>
          <strong>What it is:</strong> six checks the page makes on its own numbers. Five compare one route with another route inside the page. One compares the page with a formula published in
          1905, in section 7 of Einstein’s paper. It is not a test of a real experiment.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> three routes (the lab’s angle, the traveler’s angle, and the energy of a ray) give the same shift factor for every star, and so does
          the formula as Einstein printed it. At {speed}c the star straight behind has a factor of {behind.factor.toFixed(3)}, the same as the receding source of Experiment 5 of Gravitational
          Waves. <strong>A check you can do:</strong> Einstein writes the angle φ between the line “source–observer” and the observer’s motion. For a star straight ahead (θ = 0°), the line from the
          source to the observer points the other way, so φ = 180° and cos φ = −1, giving ν′ ÷ ν = (1 + {speed}) ÷ {D.toFixed(3)} = {ahead.factor.toFixed(2)}.
        </li>
        <li>
          <strong>Why it matters:</strong> if the page’s numbers disagreed with themselves, or with the published formula, nothing else on the page could be trusted. They agree, so the tables
          below are consistent with the physics. That the numbers are consistent does not show that the real sky behaves like this. For a real measurement, see the links.
        </li>
      </Note>

      <h4 style={{ margin: '1rem 0 0.25rem' }}>Table 1: the seven stars</h4>
      <p style={NOTE}>
        Seven stars from the upper half of the ring, by the angle the lab sees them at. “Shift factor” is the frequency the traveler measures divided by the frequency the lab measures for the
        same light. “Wavelength” is what the traveler measures, and the lab measures {nm} nm for every star. Your guesses were about the 0° and 90° rows.
      </p>
      <SevenStarTable speed={speed} guesses={{ ahead: predictedAhead, sideways: predictedSideways }} />
      <Note>
        <li>
          <strong>What it is:</strong> for seven stars in the upper half of the ring, the angle the lab measures, the angle the traveler measures, and how the traveler’s measurement of the light
          compares with the lab’s. The shift factor is the traveler’s frequency divided by the lab’s. The wavelength is what the traveler measures (the lab measures {nm} nm for all).
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> at {speed}c the star straight ahead (0°) has a factor of {ahead.factor.toFixed(2)} and a wavelength of {formatNm(ahead.wavelengthNm)}{' '}
          nm: {RANGE_LABEL[ahead.range]}. The star at 90° has {sideways.factor.toFixed(2)} and {formatNm(sideways.wavelengthNm)} nm: {RANGE_LABEL[sideways.range]}. The star at 180° has{' '}
          {behind.factor.toFixed(2)} and {formatNm(behind.wavelengthNm)} nm: {RANGE_LABEL[behind.range]}. A factor above 1 means a higher frequency than the lab measures, and below 1 means
          lower. <strong>A worked check:</strong> for the 90° star, cos 90° = 0, so the factor is (1 + 0) ÷ {D.toFixed(3)} = {sideways.factor.toFixed(2)}, and {nm} ÷ {sideways.factor.toFixed(2)} ={' '}
          {formatNm(sideways.wavelengthNm)} nm.
        </li>
        <li>
          <strong>Why it matters:</strong> the column of factors is the whole effect in one list. It starts at its largest straight ahead and falls steadily to its smallest straight behind, and it
          passes through 1 between the 90° and 120° rows (their factors are {sideways.factor.toFixed(2)} and {doppler.stars[8].factor.toFixed(3)}). The mechanism, and why 90° is not the “no
          change” row, are for the tutor.
        </li>
      </Note>

      <h4 style={{ margin: '1rem 0 0.25rem' }}>Table 2: the counts and the crossing</h4>
      <p style={NOTE}>How the 24 stars divide between a higher and a lower frequency than the lab measures, and where the dividing line is.</p>
      <CountsTable speed={speed} />
      <Note>
        <li>
          <strong>What it is:</strong> how the 24 stars divide between “higher frequency than the lab measures” and “lower”, where the dividing line is in each picture, and the time dilation factor D
          from Experiment 3.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> at {speed}c, {doppler.towardBlueCount} stars are shifted toward blue and {doppler.towardRedCount} toward red. The dividing line is at{' '}
          {crossing.toFixed(1)}° from straight ahead in the traveler’s sky, and at {labCrossing.toFixed(1)}° in the lab’s sky. If nothing extra were going on, we would expect the line at exactly 90°.
          D = √(1 − {speed}²) = {D.toFixed(3)}.
        </li>
        <li>
          <strong>Why it matters:</strong> more than half the sky is shifted toward blue, and the dividing line is ahead of sideways. Both facts depend on D, which comes from the traveler’s clock
          running slow. The tutor shows how.
        </li>
      </Note>

      <h4 style={{ margin: '1rem 0 0.25rem' }}>The factor around the ring</h4>
      <FactorGraph
        speed={speed}
        guesses={[
          { angle: 0, label: 'YOUR GUESS 1: the star straight ahead', side: predictedAhead },
          { angle: 90, label: 'YOUR GUESS 2: the star we follow', side: predictedSideways },
        ]}
      />
      <div style={{ ...NOTE, marginTop: '0.5rem' }}>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>How to read this graph.</strong> The curve shows what the traveler measures for every star around the ring, from straight ahead on the left to straight behind on the right. The
          height is the shift factor. The dashed blue line at 1 is “same color as the lab”. Where the curve is above that line, the traveler measures a higher frequency than the lab; below it,
          lower. The purple dots are the seven rows of Table 1. The white marks are your guesses: a white ring on the line means you guessed “the same color”, a white arrow pointing up means “bluer”
          (a higher factor) and one pointing down means “redder” (a lower factor). <strong>The arrows only show a direction. Your guess had no number, so how long an arrow is means nothing.</strong>
        </p>
        <LookForList
          items={[
            {
              look: 'the left end of the curve.',
              means: `straight ahead, the factor is ${ahead.factor.toFixed(2)} at ${speed}c.`,
              matters: 'it is the highest point, the star the traveler flies toward.',
            },
            {
              look: 'where the curve crosses the dashed blue line, and the dotted line at 90°.',
              means: `at ${labCrossing.toFixed(1)}° in the lab’s sky the factor is exactly 1. The sideways star’s dot, at 90°, is above the dashed line, at ${sideways.factor.toFixed(2)}.`,
              matters: 'the crossing is not at 90°, so the stars on the 90° line are not the “no change” stars.',
            },
            {
              look: 'the right end of the curve.',
              means: `straight behind the factor is ${behind.factor.toFixed(2)}, the lowest point.`,
              matters: 'the curve is smooth, with no jump, so the shift changes steadily with direction.',
            },
          ]}
        />
        <WhereFrom>
          <em>Calculated here:</em> every point is worked out by the page with the formula f′ ÷ f = (1 + β cos θ) ÷ D. <em>Measured:</em> nothing. <em>Imagined for the question:</em> the ring of
          very distant stars, each sending out one pure color, and the traveler at {speed}c. Your white marks are your guesses, not calculations.
        </WhereFrom>
      </div>

      <div style={{ ...NOTE, border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', padding: '0.75rem', marginTop: '1rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Your guesses, beside the results</p>
        <p style={{ margin: 0 }}>
          You guessed: the star straight ahead, <strong>{SIDE_WORDS[predictedAhead]}</strong>; the star the lab sees sideways, <strong>{SIDE_WORDS[predictedSideways]}</strong>. Question 1 was about
          the star straight ahead; its numbers are in Table 1, in the row for 0°, and in the orange row of the bar. Question 2 was about the star the lab sees sideways; its numbers are in the row
          for 90° and in the yellow row of the bar. A small tag marks each row. This block shows your guesses only. The tutor compares them with the results, below. Your guesses never change any
          number on this page.
        </p>
      </div>
    </div>
  )
}
