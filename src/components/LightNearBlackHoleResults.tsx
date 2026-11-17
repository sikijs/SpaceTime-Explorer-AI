import type { ReactNode } from 'react'
import {
  PHOTON_SPHERE_IN_HORIZON_RADII,
  beamRow,
  checkUpRows,
  criticalAimRows,
  criticalAimWorked,
  partOneRows,
  weakFieldWorked,
} from '../physics/lightNearBlackHoleExperiment'
import type { BendChoice, CaptureChoice, JustOutsideChoice, LightNearBlackHoleResult } from '../physics/lightNearBlackHoleExperiment'
import { LightNearBlackHoleHeldBackLinks, RealPictures } from './LightNearBlackHoleIntro'
import {
  CRITICAL_AIM_TEXT,
  bendLabel,
  captureLabel,
  formatDistance,
  formatLarger,
  formatMass,
  formatNumber,
  formatRadii,
  justOutsideLabel,
} from './LightNearBlackHolePictures'
import { GuessTag, listStyle } from './TidalEffectExperiment'

// Black Holes, Experiment 4 (audit update): Part 3, the results. Nothing here changes with a guess. The guesses are shown beside the results, never
// marked right or wrong (that is the tutor's job, CLAUDE.md §12, §13). Every number comes from the physics module; the interface only shows it. The
// three "your prediction was right / off this time" paragraphs of the earlier page are removed (they move into the tutor's explanation).

const cell = { padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' } as const
const headCell = { ...cell, textAlign: 'left', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-color, #ccc)' } as const
const tableStyle = { fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' } as const
const tableLead = { fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' } as const

function Note({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
        <strong>What this table tells us</strong>
      </p>
      {children}
    </div>
  )
}

function Scroll({ children }: { children: ReactNode }) {
  return <div style={{ overflowX: 'auto', maxWidth: '100%' }}>{children}</div>
}

export interface LightNearBlackHoleResultsProps {
  bendGuess: BendChoice
  captureGuess: CaptureChoice
  justOutsideGuess: JustOutsideChoice
  partTwo: LightNearBlackHoleResult | null
}

export function LightNearBlackHoleResults({ bendGuess, captureGuess, justOutsideGuess, partTwo }: LightNearBlackHoleResultsProps) {
  const checkUp = checkUpRows()
  const [five, near] = partOneRows()
  const holes = criticalAimRows()
  const own = partTwo ?? null
  const ownRow = own ? beamRow(own) : null
  const ownHole = own ? own.preset.label.replace(/^A /, 'a ') : ''
  const aimForMath = own ? own.aimInHorizonRadii : five.aimInHorizonRadii
  const simple = weakFieldWorked(aimForMath)
  const worked = criticalAimWorked()
  const mathHole = own ? holes.find((h) => h.preset.id === own.preset.id)! : holes[0]
  const mathHoleName = mathHole.preset.label.replace(/^A /, 'a ')

  return (
    <div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>How to read these tables.</strong> A table of science numbers is a bit like a blood test: the numbers mean little until someone says what each one is. So under every table there is a note called “What this table tells us”. It says{' '}
          <strong>what it is</strong>, <strong>what it means</strong> with the real numbers, and <strong>why it matters</strong>, and, where it is the weak link, <strong>how sure we are</strong>.
        </p>
        <ul style={listStyle}>
          <li>
            <strong>Table 1</strong> checks this page’s calculation against the formulas it is built from.
          </li>
          <li>
            <strong>Table 2</strong> gives the numbers behind the two beams you watched in Part 1.
          </li>
          <li>
            <strong>Table 3</strong> gives the numbers for your own beam from Part 2.
          </li>
          <li>
            <strong>Table 4</strong> shows the critical aim for the three black holes, in kilometers.
          </li>
        </ul>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The words “the same”, “more” and “less” are this page’s own, not an official scale. The numbers beside them say how much. Nothing here is a measurement of light near a black hole: every number is calculated from the equation given on this page.
        </p>
      </div>

      <div
        style={{
          margin: '0 0 1.25rem',
          padding: '0.75rem 1rem',
          border: '1px solid #ffffff',
          borderRadius: '8px',
          backgroundColor: '#0b1020',
          color: '#e2e8f0',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Your guesses, beside the results.</strong> They are shown as you made them, and nothing here says whether they are right. The tutor does that. To compare, find the row with the white “your guess” tag and look at its numbers.
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Guess 1:</strong> {bendLabel(bendGuess)}. The question was: what happens to a beam aimed to pass {five.aimInHorizonRadii} horizon radii out? Its numbers are the first row of Table 2. <GuessTag />
          </li>
          <li>
            <strong>Guess 2:</strong> {captureLabel(captureGuess)}. The question was: how close to the center must light be aimed to be captured? Its number is the critical aim, in Table 1 and Table 4. <GuessTag />
          </li>
          <li>
            <strong>Guess 3:</strong> {justOutsideLabel(justOutsideGuess)}. The question was: what happens to light aimed only a tiny bit farther out than the capture distance? Its numbers are the second row of Table 2. <GuessTag />
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: A check-up on the calculation</h4>
      <p style={tableLead}>Each row sets what we expect (a formula the calculation is built from or must agree with) beside what the calculation gives, with a plain reading.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>What we compared</th>
              <th style={headCell}>Expected</th>
              <th style={headCell}>This calculation gives</th>
              <th style={headCell}>Reading</th>
            </tr>
          </thead>
          <tbody>
            {checkUp.map((row, i) => (
              <tr key={row.what}>
                <td style={cell}>
                  {row.what} {i === 1 && <GuessTag />}
                </td>
                <td style={cell}>
                  {row.expected.toFixed(3)} {row.unit}
                </td>
                <td style={cell}>
                  <strong>{row.found.toFixed(3)}</strong> {row.unit}
                </td>
                <td style={cell}>
                  <strong>{row.reading}</strong>
                  {row.reading !== 'the same' && <>: by {formatNumber(Math.abs(row.percentAbove))}%</>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> A comparison of the calculation with the formulas it is built from. It is not a measurement of light near a black hole.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> Row 1: far out, at an aim of 100 horizon radii, the simple formula and the exact calculation nearly agree: the exact bend is {formatNumber(checkUp[0].percentAbove)}% more. The slider stops at 20, where the exact bend is about 8% more. Row 2: the
          calculation changes from “escapes” to “captured” at {checkUp[1].found.toFixed(3)} horizon radii, the same as the formula 3√3 ÷ 2 = {CRITICAL_AIM_TEXT}. Row 3: the closest a beam aimed at 2.6 comes is {checkUp[2].found.toFixed(2)} horizon radii, {formatNumber(checkUp[2].percentAbove)}% more than the {PHOTON_SPHERE_IN_HORIZON_RADII} horizon
          radii where light can circle.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> It tells you which numbers are the formulas’ own values and which come from stepping the equation in small angles. The simple formula is only the first step of the exact answer, which is why the two agree far away and part company close in.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> The equation is standard general relativity for a black hole that does not spin and has no electric charge, given here and not derived. The formulas come from the same theory, so this is a check on the calculation, not on nature. Row 3 is
          a little above {PHOTON_SPHERE_IN_HORIZON_RADII} because a beam aimed at 2.6 does not quite reach the circle.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: The two beams of Part 1</h4>
      <p style={tableLead}>The black hole is the 10-Sun one (its horizon radius is {formatDistance(holes[0].horizonRadiusKm)}).</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>Beam</th>
              <th style={headCell}>What happened</th>
              <th style={headCell}>Bend, exact theory</th>
              <th style={headCell}>Simple formula</th>
              <th style={headCell}>Exact against simple</th>
              <th style={headCell}>Turns round the center</th>
              <th style={headCell}>Closest approach</th>
            </tr>
          </thead>
          <tbody>
            {[
              { row: five, tag: 'guess 1' },
              { row: near, tag: 'guess 3' },
            ].map(({ row, tag }) => (
              <tr key={tag}>
                <td style={cell}>
                  Aimed at {formatRadii(row.aimInHorizonRadii)} horizon radii ({formatDistance(row.aimKm)}) <GuessTag />
                </td>
                <td style={cell}>{row.outcome === 'escapes' ? 'It escaped.' : 'It was captured.'}</td>
                <td style={cell}>
                  <strong>{row.bendDegrees === null ? 'none to measure' : `${formatNumber(row.bendDegrees)}°`}</strong>
                </td>
                <td style={cell}>{formatNumber(row.simpleDegrees)}°</td>
                <td style={cell}>{row.larger === null ? '—' : formatLarger(row.larger)}</td>
                <td style={cell}>{formatNumber(row.turnsAround)}</td>
                <td style={cell}>{formatNumber(row.closestInHorizonRadii)} horizon radii</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> What each beam did in the run you watched, and the numbers the pictures were drawn from.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> The beam aimed at {five.aimInHorizonRadii} horizon radii was turned by {formatNumber(five.bendDegrees as number)}°, {five.larger ? formatLarger(five.larger) : ''} than the simple formula’s {formatNumber(five.simpleDegrees)}°, and came
          within {formatNumber(five.closestInHorizonRadii)} horizon radii. The beam aimed at {near.aimInHorizonRadii} was turned by {formatNumber(near.bendDegrees as number)}°, {near.larger ? formatLarger(near.larger) : ''} than the simple formula’s {formatNumber(near.simpleDegrees)}°, and swept{' '}
          {formatNumber(near.turnsAround)} turns round the center (a beam that is not bent at all sweeps half a turn as it goes past).
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> The closer the aim, the more the exact bend outruns the simple formula. The tutor goes through how your guesses compare.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> These paths are calculated here by stepping the equation in small, equal angles (720 steps per turn). They are not observations.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: Your own beam</h4>
      {own && ownRow ? (
        <>
          <p style={tableLead}>
            You aimed a beam to pass <strong>{formatRadii(own.aimInHorizonRadii)} horizon radii</strong> ({formatDistance(own.aimKm)}) from the center of <strong>{ownHole}</strong> ({formatMass(own.preset.massSolarMasses)}).
          </p>
          <Scroll>
            <table style={tableStyle}>
              <tbody>
                {(
                  [
                    ['What happened to the light', ownRow.outcome === 'escapes' ? 'It escaped.' : 'It was captured: it reached the horizon.'],
                    ['The bend (exact theory)', ownRow.bendDegrees === null ? 'None to measure: the light did not get away.' : `${formatNumber(ownRow.bendDegrees)}°`],
                    [
                      'The simple formula (Gravity Experiment 8) gives',
                      `${formatNumber(ownRow.simpleDegrees)}°${ownRow.larger ? `, so the exact bend is ${formatLarger(ownRow.larger)}` : ', and had no way to say the light is captured'}`,
                    ],
                    ...(ownRow.outcome === 'escapes'
                      ? [
                          ['How far round the black hole it swept', `${formatNumber(ownRow.turnsAround)} turns around the center before it left (a beam that is not bent at all sweeps half a turn as it goes past)`],
                          ['Closest the light came to the center', `${formatNumber(ownRow.closestInHorizonRadii)} horizon radii, nearer than the aim of ${formatRadii(own.aimInHorizonRadii)}`],
                        ]
                      : []),
                    ['The critical aim', `${CRITICAL_AIM_TEXT} horizon radii, which is ${formatDistance(own.criticalAimKm)} from the center of ${ownHole}`],
                    ['Where light can circle', `${PHOTON_SPHERE_IN_HORIZON_RADII} horizon radii, which is ${formatDistance(own.photonSphereKm)} from the center`],
                  ] as Array<[string, string]>
                ).map(([label, value]) => (
                  <tr key={label}>
                    <td style={cell}>{label}</td>
                    <td style={cell}>
                      <strong>{value}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>
        </>
      ) : (
        <p style={{ ...tableLead, fontWeight: 'bold' }}>Not run yet. Choose a black hole and an aim in Part 2 and press Run your choice; this table follows your last completed run.</p>
      )}
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> The same kinds of number as Table 2, for the black hole and the aim you chose.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> Change the black hole and keep the aim: the kilometers change a great deal, but the bend does not, because the path in horizon radii is the same for every black hole. Change the aim and keep the black hole: the bend changes, and somewhere
          near {CRITICAL_AIM_TEXT} horizon radii the light stops getting away.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> It lets you test the edge for yourself, from the same calculation, at any aim.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> These are trial values: your own numbers, from this calculation. They do not say the real system is like that. There is no published value to compare them with.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 4: The critical aim for the three black holes</h4>
      <p style={tableLead}>Calculated here. The critical aim is {CRITICAL_AIM_TEXT} horizon radii for every black hole; only the kilometers change.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>Black hole</th>
              <th style={headCell}>Horizon radius</th>
              <th style={headCell}>Critical aim</th>
            </tr>
          </thead>
          <tbody>
            {holes.map((r) => (
              <tr key={r.preset.id}>
                <td style={cell}>
                  {r.preset.label} <GuessTag />
                </td>
                <td style={cell}>{formatDistance(r.horizonRadiusKm)}</td>
                <td style={cell}>
                  <strong>{formatDistance(r.criticalAimKm)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> How far from the center of each black hole a beam must be aimed to just get away, in kilometers and astronomical units.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> The same {CRITICAL_AIM_TEXT} horizon radii is {formatDistance(holes[0].criticalAimKm)} for the 10-Sun black hole, {formatDistance(holes[1].criticalAimKm)} for Sagittarius A* and {formatDistance(holes[2].criticalAimKm)} for M87*.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> As in Black Holes 2 and 3, what happens depends only on the number of horizon radii, so the same lesson holds for the smallest and the biggest black holes.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> The kilometers rest on the masses used in Black Holes 1 (the 10 Suns is a round, typical size). The {CRITICAL_AIM_TEXT} comes from a formula given by general relativity for a black hole that does not spin.
        </p>
      </Note>

      <RealPictures />

      <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
        <strong>The simple math.</strong> The critical aim is <strong>3√3 ÷ 2</strong> horizon radii, which in other units is 3√3 GM/c² (G is the strength of gravity, M the black hole’s mass and c the speed of light). This is given, not derived. Worked out:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
        <li>√3 is about {formatNumber(worked.sqrt3)}.</li>
        <li>
          3 × {formatNumber(worked.sqrt3)} = {formatNumber(worked.threeSqrt3)}.
        </li>
        <li>
          {formatNumber(worked.threeSqrt3)} ÷ 2 = {CRITICAL_AIM_TEXT} horizon radii.
        </li>
        <li>
          One horizon radius for {mathHoleName} is {formatDistance(mathHole.horizonRadiusKm)}, so the critical aim is {CRITICAL_AIM_TEXT} × {formatDistance(mathHole.horizonRadiusKm)} = {formatDistance(mathHole.criticalAimKm)}.
        </li>
      </ol>
      <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
        The simple formula from Experiment 8, written in horizon radii, gives a first approximation of <strong>2 ÷ b</strong> for the bend, in radians, where b is the aim distance. For {own ? 'your aim' : 'the beam aimed at 5'}, b = {formatRadii(aimForMath)}:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
        <li>
          2 ÷ {formatRadii(aimForMath)} = {formatNumber(simple.radians)} radians.
        </li>
        <li>
          A radian is about {formatNumber(simple.degreesPerRadian)}°, so that is {formatNumber(simple.radians)} × {formatNumber(simple.degreesPerRadian)} = {formatNumber(simple.degrees)}°.
        </li>
        <li>
          {ownRow
            ? ownRow.bendDegrees !== null
              ? `The exact theory gives ${formatNumber(ownRow.bendDegrees)}° for this aim.`
              : 'The exact theory says that, at this aim, the light is captured.'
            : `The exact theory gives ${formatNumber(five.bendDegrees as number)}° for this aim.`}
        </li>
      </ol>
      <p style={{ fontSize: '0.875rem' }}>
        The simple formula is only the first step of the exact answer. Far from the black hole the two agree closely. Closer in, the exact bend grows much faster, without limit as the aim approaches the critical aim.
      </p>

      <p style={{ fontSize: '0.875rem' }}>
        <strong>A comparison from daily life.</strong> Picture a ball rolling across a hillside toward a deep funnel. A ball that passes the funnel far away is only slightly turned aside. A ball that passes close swings right round the funnel’s rim before rolling off. And a ball that
        passes closer than a certain distance drops in, even though it was not rolled straight at the hole. This is an analogy for “the circle the black hole captures is wider than the hole itself”, not for how gravity works.
      </p>

      <div
        style={{
          margin: '0.75rem 0',
          padding: '0.75rem 1rem',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What this model can and cannot tell you.</strong> This is a thought experiment about a thin beam of light. It does not say how the light got there. It follows the beam in a flat plane until it has gone past the black hole and is far away again, or has reached the
          horizon. Nothing inside the horizon is modeled, and this is not the picture a camera or telescope would make.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The exact equation is given, not derived, and is for a black hole that does not spin and has no electric charge. This page does not model a spinning black hole. The simple formula is for weak gravity and is shown only for comparison. The stellar black hole’s mass of 10 Suns
          is an illustrative round value.
        </p>
      </div>

      <LightNearBlackHoleHeldBackLinks />
    </div>
  )
}
