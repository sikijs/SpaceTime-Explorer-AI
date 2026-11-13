import type { ReactNode } from 'react'
import {
  aimSweep,
  flybySummary,
  PART_ONE_AIMS,
  pageRatioCheck,
  publishedSunRatio,
  stepCheckRows,
  sunRatioCheck,
  SUN_PUBLISHED,
} from '../physics/lightBendingExperiment'
import type { BendChoice, MoreLessSameChoice } from '../physics/lightBendingExperiment'
import { YOURS_COLOR } from './GravitationalWaveExperiment'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 8, Part 3: the results (docs/audit/gravity-and-curved-spacetime/08-draft-wording.md, section 5,
// approved by the owner on 2026-11-13). Every number comes from the physics module. The guesses are shown only as guesses: the tutor
// marks them, not this page (CLAUDE.md §12, §13).

export interface Part3Props {
  farDone: boolean
  closeDone: boolean
  sweepDone: boolean
  guesses: { bent: BendChoice; closer: MoreLessSameChoice; real: MoreLessSameChoice } | null
  // The learner's own aims in Part 2, oldest first.
  yours: number[]
}

const deg = (v: number | null, digits = 2) => (v === null ? 'n/a' : `${v.toFixed(digits)}°`)

const th = { textAlign: 'left', borderBottom: '2px solid var(--border-color, #ccc)', padding: '0.35rem 0.45rem', fontSize: '0.8125rem' } as const
const cell = { padding: '0.35rem 0.45rem', borderBottom: '1px solid var(--border-color, #ccc)', verticalAlign: 'top', fontSize: '0.8125rem' } as const

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

const BENT_TEXT: Record<BendChoice, string> = { yes: 'Yes, it bends', no: 'No, it stays straight' }
const CLOSER_TEXT: Record<MoreLessSameChoice, string> = { more: 'closer bends more', less: 'closer bends less', same: 'closer bends about the same' }
const REAL_TEXT: Record<MoreLessSameChoice, string> = { more: 'real bends more', less: 'real bends less', same: 'real bends exactly the same' }

export function LightBendingResults({ farDone, closeDone, sweepDone, guesses, yours }: Part3Props) {
  const far = flybySummary(PART_ONE_AIMS.far)
  const close = flybySummary(PART_ONE_AIMS.close)
  const sweep = aimSweep()
  const sweepFirst = sweep[0]
  const sweepLast = sweep[sweep.length - 1]
  const steps = stepCheckRows()
  const page = pageRatioCheck()
  const sun = sunRatioCheck()
  const latest = yours.length > 0 ? yours[yours.length - 1] : null
  const latestSummary = latest !== null ? flybySummary(latest) : null
  const anyRun = farDone || closeDone || sweepDone
  const stepDone = [farDone, closeDone, sweepDone]

  return (
    <div style={{ marginTop: '1rem' }}>
      {!anyRun && <p style={smallNote}>Run a pass in Part 1 to fill in these tables.</p>}
      {anyRun && !(farDone && closeDone && sweepDone) && (
        <p style={smallNote}>
          <strong>What to do next:</strong> some rows below say &ldquo;not run yet&rdquo;. Run the other passes in Part 1 to fill them in. A number for a pass you have not
          run is not shown.
        </p>
      )}

      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Table 1: the passes you watched</p>
      <Table heads={['Aim', 'Outcome', 'Simulated', 'Ordinary formula', 'Real formula', 'Your guess']}>
        <tr>
          <td style={cell}>{PART_ONE_AIMS.far.toFixed(1)}</td>
          <td style={cell}>{farDone ? 'passes by' : notRun}</td>
          <td style={cell}>{farDone ? deg(far.simulatedDegrees) : notRun}</td>
          <td style={cell}>{farDone ? deg(far.ordinaryFormulaDegrees) : notRun}</td>
          <td style={cell}>{farDone ? deg(far.realFormulaDegrees) : notRun}</td>
          <td style={cell}>{guesses && farDone ? <>
            {BENT_TEXT[guesses.bent]}
            <GuessTag />
          </> : ''}</td>
        </tr>
        <tr>
          <td style={cell}>{PART_ONE_AIMS.close.toFixed(1)}</td>
          <td style={cell}>{closeDone ? 'passes by' : notRun}</td>
          <td style={cell}>{closeDone ? deg(close.simulatedDegrees) : notRun}</td>
          <td style={cell}>{closeDone ? deg(close.ordinaryFormulaDegrees) : notRun}</td>
          <td style={cell}>{closeDone ? deg(close.realFormulaDegrees) : notRun}</td>
          <td style={cell} />
        </tr>
        <tr>
          <td style={cell}>
            sweep {sweepFirst.aim.toFixed(1)} to {sweepLast.aim.toFixed(1)}
          </td>
          <td style={cell}>{sweepDone ? 'passes by at every aim' : notRun}</td>
          <td style={cell}>{sweepDone ? `${deg(sweepFirst.simulatedDegrees)} to ${deg(sweepLast.simulatedDegrees)}` : notRun}</td>
          <td style={cell}>{sweepDone ? `${deg(sweepFirst.ordinaryFormulaDegrees)} to ${deg(sweepLast.ordinaryFormulaDegrees)}` : notRun}</td>
          <td style={cell}>{sweepDone ? `${deg(sweepFirst.realFormulaDegrees)} to ${deg(sweepLast.realFormulaDegrees)}` : notRun}</td>
          <td style={cell}>
            {guesses && sweepDone ? (
              <>
                {CLOSER_TEXT[guesses.closer]}
                <GuessTag />
                <br />
                {REAL_TEXT[guesses.real]}
                <GuessTag />
              </>
            ) : (
              ''
            )}
          </td>
        </tr>
      </Table>

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> Each row is one pass. &ldquo;Simulated&rdquo; is the angle found by stepping ordinary gravity forward. &ldquo;Ordinary-gravity formula&rdquo; is
          the textbook short-cut for the same angle. &ldquo;Real-universe formula&rdquo; is the general relativity formula for the real universe. The white tags show where your
          guesses live; they show the guess only.
        </li>
        <li>
          <strong>What it means.</strong>{' '}
          {farDone && closeDone ? (
            <>
              At aim 3.0 the stepped path turns by {deg(far.simulatedDegrees)} and the ordinary formula gives {deg(far.ordinaryFormulaDegrees)}. The real-universe formula gives{' '}
              {deg(far.realFormulaDegrees)}, which is the ordinary value times 2. At aim 1.0 they are {deg(close.simulatedDegrees)}, {deg(close.ordinaryFormulaDegrees)} and{' '}
              {deg(close.realFormulaDegrees)}.
            </>
          ) : (
            'The numbers for this note appear after you have run the aim 3.0 and aim 1.0 passes.'
          )}
        </li>
        <li>
          <strong>Why it matters.</strong> The first two columns agree, so the animation is doing what the textbook formula says. The third is a different number from a different
          theory. The angles are on this page&rsquo;s made-up scale, so compare them with each other, not with real starlight.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.5rem' }}>Table 2, check-up: do the numbers agree?</p>
      <Table heads={['What we check', 'Expected', 'Found', 'Reading']}>
        {steps.map((r, i) => (
          <tr key={r.aim}>
            <td style={cell}>Stepping against the ordinary formula, aim {r.aim.toFixed(1)}</td>
            <td style={cell}>{stepDone[[0, 1, 2][i]] ? deg(r.expectedDegrees) : notRun}</td>
            <td style={cell}>{stepDone[[0, 1, 2][i]] ? deg(r.foundDegrees) : notRun}</td>
            <td style={cell}>{stepDone[[0, 1, 2][i]] ? `the stepping is ${r.percentUnder.toFixed(1)} percent under` : notRun}</td>
          </tr>
        ))}
        <tr>
          <td style={cell}>Real ÷ ordinary, from the page&rsquo;s two formulas</td>
          <td style={cell}>{sweepDone ? page.expected.toFixed(2) : notRun}</td>
          <td style={cell}>{sweepDone ? page.found.toFixed(2) : notRun}</td>
          <td style={cell}>{sweepDone ? 'the same' : notRun}</td>
        </tr>
        <tr>
          <td style={cell}>
            Real ÷ ordinary for the Sun&rsquo;s edge, published ({SUN_PUBLISHED.realArcseconds}″ ÷ {SUN_PUBLISHED.ordinaryArcseconds}″)
          </td>
          <td style={cell}>{sweepDone ? publishedSunRatio().toFixed(2) : notRun}</td>
          <td style={cell}>{sweepDone ? sun.found.toFixed(2) : notRun}</td>
          <td style={cell}>{sweepDone ? `the same, within ${Math.max(sun.percentDifference, 0.1).toFixed(1)} percent` : notRun}</td>
        </tr>
      </Table>

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> The first three rows compare the animation with its own textbook formula. The last two compare how much bigger the real angle is than the
          ordinary one.
        </li>
        <li>
          <strong>What it means.</strong>{' '}
          {farDone && sweepDone ? (
            <>
              The animation falls a little short of the formula because it stops measuring a little after the light has passed the mass, and the bending has not quite finished by then. That shortfall is{' '}
              {steps[0].percentUnder.toFixed(1)} percent at aim 3.0 and {steps[2].percentUnder.toFixed(1)} percent at aim 4.0. The ratio of 2 is the same on this page and in the published Sun
              values: {SUN_PUBLISHED.realArcseconds} ÷ {SUN_PUBLISHED.ordinaryArcseconds} is about {publishedSunRatio().toFixed(1)}.
            </>
          ) : (
            'The numbers for this note appear after you have run the aim 3.0 pass and the sweep.'
          )}
        </li>
        <li>
          <strong>Why it matters.</strong> The first rows show the animation can be trusted for the ordinary-gravity answer. The last two show the page&rsquo;s real-universe angle has
          the right size <em>relative to</em> the ordinary one. They do not check the size of the angle itself, because this page&rsquo;s units are made up.
        </li>
        <li>
          <strong>How sure.</strong> The Sun&rsquo;s values come from one published article (Physics Today, Kennefick, 1 March 2009), read through a summary on 2026-11-13. They are
          not a measurement made here.
        </li>
      </Note>

      {guesses && anyRun && (
        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Your guesses, beside the results</p>
          <ul style={listStyle}>
            <li>
              Does it bend at all: <strong>{BENT_TEXT[guesses.bent]}</strong> (the pass at aim 3.0, row 1 of Table 1).
            </li>
            <li>
              Aiming closer: <strong>{CLOSER_TEXT[guesses.closer]}</strong> (the sweep row of Table 1).
            </li>
            <li>
              The real universe against ordinary gravity: <strong>{REAL_TEXT[guesses.real]}</strong> (the real-universe column of the sweep row).
            </li>
          </ul>
          <p style={{ ...smallNote, marginTop: '0.25rem' }}>Your guesses never change these tables. The tutor marks them.</p>
        </div>
      )}

      {latest !== null && latestSummary && (
        <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: YOURS_COLOR }}>
          <strong>Your latest aim, {latest.toFixed(1)}:</strong>{' '}
          {latestSummary.simulatedDegrees === null
            ? 'the light falls into the mass, so there is no angle to measure.'
            : `simulated ${deg(latestSummary.simulatedDegrees)}, ordinary-gravity formula ${deg(latestSummary.ordinaryFormulaDegrees)}, real-universe formula ${deg(latestSummary.realFormulaDegrees)}.`}{' '}
          These are trial values of your own; they do not say the real system is like that.
        </p>
      )}
    </div>
  )
}
