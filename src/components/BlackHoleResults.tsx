import type { ReactNode } from 'react'
import {
  horizonCheckUp,
  LAUNCH_DISTANCE,
  launchPointPosition,
  launchSummary,
  outcomeCheckUp,
  resultsTable,
  SPEED_OF_LIGHT,
} from '../physics/blackHoleExperiment'
import type { LaunchPointPosition, ResultsRow, SpeedCompareChoice, YesNo } from '../physics/blackHoleExperiment'
import { YOURS_COLOR } from './GravitationalWaveExperiment'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 7, Part 3: the results (docs/audit/gravity-and-curved-spacetime/07-draft-wording.md, section 8,
// approved by the owner on 2026-11-13). Every number comes from the physics module. The guesses are shown only as guesses: the tutor
// marks them, not this page (CLAUDE.md §12, §13).

export interface Part3Props {
  lightDone: boolean
  heavyDone: boolean
  sweepDone: boolean
  guesses: { light: SpeedCompareChoice; heavy: SpeedCompareChoice; inBetween: YesNo } | null
  // The learner's own launches in Part 2, oldest first.
  yours: number[]
}

const percent = (fraction: number) => Math.round(fraction * 100)

const GUESS_TEXT: Record<SpeedCompareChoice, string> = {
  'much-slower': 'much slower than light',
  faster: 'faster than light',
  'cannot-escape': 'nothing can escape at all',
}

const POSITION_TEXT: Record<LaunchPointPosition, string> = {
  outside: 'outside the horizon',
  inside: 'inside the horizon',
  on: 'exactly on the horizon',
}

const th = { textAlign: 'left', borderBottom: '2px solid var(--border-color, #ccc)', padding: '0.4rem 0.6rem' } as const
const cell = { padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color, #ccc)', verticalAlign: 'top' } as const

function Table({ heads, children }: { heads: string[]; children: ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem', width: '100%' }}>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{title}</strong>
      </p>
      <ul style={{ marginTop: 0, paddingLeft: '1.25rem' }}>{children}</ul>
    </div>
  )
}

const notRun = <span style={{ fontStyle: 'italic' }}>not run yet</span>

export function Part3Results({ lightDone, heavyDone, sweepDone, guesses, yours }: Part3Props) {
  const rows = resultsTable()
  const doneFor = (key: ResultsRow['key']) => (key === 'light' ? lightDone : key === 'heavy' ? heavyDone : sweepDone)
  const allDone = lightDone && heavyDone && sweepDone
  const guessFor = (key: ResultsRow['key']): string | null => {
    if (!guesses) return null
    if (key === 'light') return GUESS_TEXT[guesses.light]
    if (key === 'heavy') return GUESS_TEXT[guesses.heavy]
    return guesses.inBetween === 'yes' ? 'yes, something special happens in between' : 'no, nothing special happens in between'
  }
  const rowName: Record<ResultsRow['key'], string> = {
    light: 'A very light mass',
    heavy: 'A very heavy mass',
    sweep: 'In between: the slow raise',
  }
  const light = rows[0]
  const heavy = rows[1]
  const special = rows[2]
  const checkMasses = [
    ...(lightDone ? [light.mass] : []),
    ...(heavyDone ? [heavy.mass] : []),
    ...(sweepDone ? [special.mass] : []),
  ]
  const latest = yours.length > 0 ? yours[yours.length - 1] : null
  const latestSummary = latest !== null ? launchSummary(latest) : null

  return (
    <>
      {guesses && (
        <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Your guesses, beside the results</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            These are your guesses only. The tutor marks them in Part 4, not here. Each one is tagged on the table row where its number
            appears.
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Very light mass:</strong> you guessed &ldquo;{GUESS_TEXT[guesses.light]}&rdquo;. Its number is in the first row.
            </li>
            <li>
              <strong>Very heavy mass:</strong> you guessed &ldquo;{GUESS_TEXT[guesses.heavy]}&rdquo;. Its number is in the second row.
            </li>
            <li>
              <strong>Something special in between?</strong> you guessed &ldquo;{guesses.inBetween === 'yes' ? 'yes' : 'no'}&rdquo;. Its number is
              in the third row.
            </li>
          </ul>
        </div>
      )}

      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Table 1: the launches you watched</p>
      <Table
        heads={[
          'Launch',
          'Escape speed needed (% of light speed)',
          'Event horizon radius',
          `Launch point (distance ${LAUNCH_DISTANCE}) is…`,
          'What happens',
          'Your guess',
        ]}
      >
        {rows.map((r) => {
          const done = doneFor(r.key)
          const tag = guessFor(r.key)
          return (
            <tr key={r.key}>
              <td style={cell}>
                {rowName[r.key]}
                {r.key === 'light' && ` (mass ${r.mass.toFixed(1)})`}
                {r.key === 'heavy' && ` (mass ${r.mass.toFixed(1)})`}
                {r.key === 'sweep' && done && ` (changes at mass ${r.mass.toFixed(1)})`}
              </td>
              <td style={cell}>{done ? `${percent(r.escapeSpeedFractionOfC)}%` : notRun}</td>
              <td style={cell}>{done ? r.eventHorizonRadius.toFixed(2) : notRun}</td>
              <td style={cell}>{done ? POSITION_TEXT[r.launchPoint] : notRun}</td>
              <td style={cell}>
                {done
                  ? r.outcome === 'switches'
                    ? 'below this mass the probe gets away; above it, it falls back'
                    : r.outcome === 'escapes'
                      ? 'the probe gets away'
                      : 'the probe falls back'
                  : notRun}
              </td>
              <td style={cell}>
                {tag && (
                  <>
                    <GuessTag />
                    <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tag}</span>
                  </>
                )}
              </td>
            </tr>
          )
        })}
      </Table>
      {!allDone && (
        <p style={smallNote}>
          <strong>What to do next:</strong> run the other launches in Part 1 to fill in the rest of this table and the check-up below. A number is
          shown only for a launch you have watched.
        </p>
      )}
      <p style={smallNote}>
        <strong>Where this comes from:</strong> calculated here from ordinary gravity in relative units, not measured. The mass, distance and
        speed of light ({SPEED_OF_LIGHT}) are made-up amounts, so only the comparisons mean anything.
      </p>

      {lightDone || heavyDone || sweepDone ? (
        <Note title="What this table tells us.">
          {(lightDone || heavyDone) && (
            <li>
              <strong>The escape-speed column.</strong> <em>What it is:</em> the speed needed to leave the launch point for good, written as a
              percentage of the speed of light. <em>What it means:</em>{' '}
              {lightDone && <>for the very light mass it is {percent(light.escapeSpeedFractionOfC)} percent</>}
              {lightDone && heavyDone && ', and '}
              {heavyDone && <>for the very heavy mass it is {percent(heavy.escapeSpeedFractionOfC)} percent</>}. The probe is always launched
              at 100 percent. Think of a jumper who can clear a wall of some greatest height, and no higher. A wall lower than that is
              easy. A wall higher than that is out of reach, however hard they try. The probe launched at 100 percent is the jumper at
              their best, and the escape speed is the height of the wall.{' '}
              {lightDone && <>For the light mass the wall is only {percent(light.escapeSpeedFractionOfC)} percent of that height. </>}
              {heavyDone && <>For the heavy mass the wall is {percent(heavy.escapeSpeedFractionOfC)} percent of it, taller than the jumper can clear. </>}
              <em>Why it matters:</em> the column shows how the mass decides whether
              the best possible launch is enough.
            </li>
          )}
          {(lightDone || heavyDone) && (
            <li>
              <strong>The horizon column.</strong> <em>What it is:</em> the radius of the dashed circle in the drawing, found from the mass
              (the mass divided by 2, with the speed of light set to 2).{' '}
              <em>What it means:</em>{' '}
              {lightDone && <>{light.eventHorizonRadius.toFixed(2)} for the light mass is far smaller than the launch distance of {LAUNCH_DISTANCE}</>}
              {lightDone && heavyDone && ', and '}
              {heavyDone && <>{heavy.eventHorizonRadius.toFixed(2)} for the heavy mass is bigger than it, so the launch point sits inside the circle</>}.{' '}
              <em>Why it matters:</em> the circle and the escape-speed column are two views of one fact, and the &ldquo;launch point&rdquo;
              column puts them side by side.
            </li>
          )}
          {sweepDone && (
            <li>
              <strong>The third row.</strong> <em>What it is:</em> the mass where the slow raise changes what happens. <em>What it means:</em>{' '}
              at mass {special.mass.toFixed(1)} the escape speed is the square root of (2 × {special.mass.toFixed(1)} ÷ {LAUNCH_DISTANCE}), which
              is the square root of {((2 * special.mass) / LAUNCH_DISTANCE).toFixed(1)}, which is{' '}
              {Math.sqrt((2 * special.mass) / LAUNCH_DISTANCE).toFixed(1)}. That is exactly the speed of light ({SPEED_OF_LIGHT}), so 100
              percent. The horizon radius is {special.mass.toFixed(1)} ÷ 2 = {special.eventHorizonRadius.toFixed(2)}, exactly the launch
              distance, so the circle just reaches the launch point. <em>Why it matters:</em> this is the mass that answers
              &ldquo;is there something special in between?&rdquo;. Below it the best possible launch is enough, and above it the launch is
              not.
            </li>
          )}
          <li>
            <strong>How sure is it?</strong> These numbers are exact for this page&rsquo;s model: they come from a formula and from a
            step-by-step calculation that agree (see the check-up). They are not measurements of a real black hole, and a real one needs
            Einstein&rsquo;s general relativity.
          </li>
        </Note>
      ) : null}

      {checkMasses.length > 0 && (
        <>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.25rem' }}>Table 2, check-up: does the page agree with itself?</p>
          <Table heads={['What we check', 'Mass', 'What we expect', 'What we found', 'Reading']}>
            {checkMasses.map((m) => {
              const row = horizonCheckUp(m)
              return (
                <tr key={`h${m}`}>
                  <td style={cell}>The escape speed at the event horizon (radius {row.horizonRadius.toFixed(2)})</td>
                  <td style={cell}>{m.toFixed(1)}</td>
                  <td style={cell}>{percent(row.expectedFraction)}% of the speed of light</td>
                  <td style={cell}>{percent(row.foundFraction)}%</td>
                  <td style={cell}>{row.same ? 'the same' : 'different'}</td>
                </tr>
              )
            })}
            {[...(lightDone ? [light.mass] : []), ...(heavyDone ? [heavy.mass] : [])].map((m) => {
              const row = outcomeCheckUp(m)
              const word = (o: string) => (o === 'escapes' ? 'the probe gets away' : 'the probe falls back')
              return (
                <tr key={`o${m}`}>
                  <td style={cell}>The formula against the step-by-step launch</td>
                  <td style={cell}>{m.toFixed(1)}</td>
                  <td style={cell}>formula: {word(row.formula)}</td>
                  <td style={cell}>step-by-step launch: {word(row.simulation)}</td>
                  <td style={cell}>{row.same ? 'the same' : 'different'}</td>
                </tr>
              )
            })}
          </Table>
          <Note title="What this table tells us.">
            <li>
              <strong>The first kind of row.</strong> <em>What it is:</em> the dashed circle is defined as the place where the escape speed
              reaches the speed of light. This row asks the computer for the escape speed at the circle and checks that it is 100 percent.{' '}
              <em>What it means:</em> every row says 100 percent, the same as expected, so the circle in the drawing is in the right place.{' '}
              <em>Why it matters:</em> the drawing and the graph are made by different parts of the program, so this is a check that they
              agree. The &ldquo;expected&rdquo; value here is the page&rsquo;s own rule, not a measurement of anything real.
            </li>
            <li>
              <strong>The second kind of row.</strong> <em>What it is:</em> two ways of finding what happens. One is a rule: the probe gets
              away only for masses below a certain mass{sweepDone ? <>, {special.mass.toFixed(1)}</> : null}. The other is the step-by-step launch the page actually plays, which
              moves the probe forward in tiny time steps. <em>What it means:</em> they give the same result for each launch you have
              watched. <em>Why it matters:</em> the pictures come from the step-by-step launch, so agreeing with an independent rule is a
              check that it is not making the result up.
            </li>
          </Note>
        </>
      )}

      {latestSummary && latest !== null && (
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', borderLeft: `4px solid ${YOURS_COLOR}`, paddingLeft: '0.75rem' }}>
          <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold', color: YOURS_COLOR }}>
            Your own launch in Part 2 (this line changes with your latest launch)
          </p>
          <p style={{ margin: 0 }}>
            Mass {latest.toFixed(1)}: escape speed {percent(latestSummary.escapeSpeedFractionOfC)} percent of the speed of light; horizon radius{' '}
            {latestSummary.eventHorizonRadius.toFixed(2)}; the launch point is {POSITION_TEXT[launchPointPosition(latest)]}; the probe{' '}
            {latestSummary.outcome === 'escapes' ? 'gets away' : 'falls back'}.
          </p>
          <p style={{ ...smallNote, marginBottom: 0 }}>
            These are your own numbers. They are trial values from the same model and do not say that a real black hole is like that.
          </p>
        </div>
      )}
    </>
  )
}
