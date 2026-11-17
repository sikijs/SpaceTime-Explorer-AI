import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  BLACK_HOLE_PRESETS,
  COMPARISON_DISTANCE_IN_HORIZON_RADII,
  FAR_CLOCK_RUN_SECONDS,
  PART_ONE_DISTANCE_IN_HORIZON_RADII,
  SECONDS_PER_YEAR,
  approximationGuessIsModelAnswer,
  exactSlowingFactor,
  firstOrderSlowingFactor,
  guessHeightForJustOutside,
  justOutsideGuessIsModelAnswer,
  massGuessIsModelAnswer,
  simpleAgainstExactRows,
  surfaceSlowing,
  twoHolesAtTwoRadii,
} from '../physics/timeNearBlackHoleExperiment'
import type { ApproximationGuess, JustOutsideGuess, MassGuess } from '../physics/timeNearBlackHoleExperiment'
import { formatDuration, formatNumber } from './TimeNearBlackHolePictures'

// Black Holes, Experiment 2 (audit update): the tutor. It follows the specification's order: an observation question, a comparison with the
// learner's three guesses, a conceptual question, then the explanation, which marks each guess (CLAUDE.md §12, §13). The tutor invents no
// physics: every number comes from the physics module, and the explanation keeps the specification's seven points.

type JustOutsideChoice = JustOutsideGuess
type MassChoice = MassGuess
type ApproximationChoice = ApproximationGuess
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface TimeNearBlackHoleTutorProps {
  predictedJustOutside: JustOutsideChoice
  predictedMass: MassChoice
  predictedApproximation: ApproximationChoice
  onExplained?: () => void
}

const justOutsideClauses: Record<JustOutsideChoice, string> = {
  same: 'a clock hovering 1% beyond the horizon would tick at about the same rate as the far-away one',
  half: 'a clock hovering 1% beyond the horizon would tick about half as fast as the far-away one',
  tenth: 'a clock hovering 1% beyond the horizon would tick about one tenth as fast as the far-away one',
  stopped: 'a clock hovering 1% beyond the horizon would have stopped',
}

const massClauses: Record<MassChoice, string> = {
  small: 'the clock near the small black hole would tick more slowly',
  giant: 'the clock near the giant black hole would tick more slowly',
  same: 'the two clocks would tick at the same relative rate',
}

const approximationClauses: Record<ApproximationChoice, string> = {
  'still-accurate': 'the simple formula would still be about as accurate',
  'worse-closer': 'the simple formula would be accurate far from the horizon but get worse closer in',
  'never-accurate': 'the simple formula would be wrong everywhere near a black hole',
}

// Four significant figures, with no trailing zeros ("0.5", "0.0995").
function fmt(value: number): string {
  return String(Number(value.toPrecision(4)))
}

// Two significant figures, for percentages ("0.14", "6.1").
function fmt2(value: number): string {
  return String(Number(value.toPrecision(2)))
}

// How many times heavier the giant black hole (M87*) is than the small one, in millions; from the presets.
const MASS_RATIO_MILLIONS = Math.round(
  BLACK_HOLE_PRESETS[BLACK_HOLE_PRESETS.length - 1].massSolarMasses / BLACK_HOLE_PRESETS[0].massSolarMasses / 1e6,
)

// The distances shown in the explanation's table of how the factor falls.
const FALL_DISTANCES = [100, 10, 3, 2, 1.5, 1.1, 1.01, 1.001]

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const smallStyle = { marginBottom: '1rem', fontSize: '0.875rem', color: '#444', lineHeight: '1.55' } as const
const listStyle = { margin: '0 0 1rem', paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#333', lineHeight: '1.55' } as const
const headStyle = { margin: '1.25rem 0 0.5rem', fontSize: '1rem', color: '#0066cc' } as const
const cellStyle = { padding: '0.25rem 1rem 0.25rem 0', verticalAlign: 'top', fontSize: '0.85rem', color: '#333' } as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 style={headStyle}>{title}</h3>
      {children}
    </div>
  )
}

export function TimeNearBlackHoleTutor({
  predictedJustOutside,
  predictedMass,
  predictedApproximation,
  onExplained,
}: TimeNearBlackHoleTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return

    if (tutorStep === 'observe') {
      setTutorStep('compare')
    } else if (tutorStep === 'compare') {
      setTutorStep('conceptual')
    } else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }

  const isResponseEmpty = responseInput.trim() === ''

  const guessHeight = guessHeightForJustOutside(predictedJustOutside)
  const questionNumber = tutorStep === 'observe' ? 1 : tutorStep === 'compare' ? 2 : 3

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #d9e8f5',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>

      {tutorStep !== 'explained' && (
        <p style={{ ...smallStyle, marginBottom: '1rem' }}>
          There are three questions, one at a time, and then an explanation. Answer each in a sentence or two, in your own words, to go on. Your answers
          are not marked: they are for you to put your thinking into words before the explanation.
        </p>
      )}

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ ...smallStyle, marginBottom: '0.5rem', fontWeight: 'bold', color: '#0066cc' }}>Question {questionNumber} of 3</p>

          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Look at the two clocks in Picture 1 and at the white YOUR GUESS marks on Picture 2 and Picture 2b. Which clock is behind, and by how much?
                Now go to Part 2 and try a different distance, and then a different black hole at the same distance in horizon radii. What changed, and
                what stayed the same?
              </p>
              <p style={{ ...smallStyle, marginBottom: '0.25rem' }}>Some things to look at as you answer:</p>
              <ul style={listStyle}>
                <li>The two numbers under the dials in Picture 1 after a run, and the two hands.</li>
                <li>Where the blue dot sits in Picture 2, compared with your white ring.</li>
                <li>In Part 2: the clocks’ readings and the dots in Picture 5 when you move the distance, and the kilometers under the ruler when you change the black hole.</li>
              </ul>
            </>
          )}

          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>
                You predicted that {justOutsideClauses[predictedJustOutside]}; that {massClauses[predictedMass]}; and that{' '}
                {approximationClauses[predictedApproximation]}. Compare the white YOUR GUESS marks on Picture 2 and Picture 2b with the solid blue line, the
                dashed orange line and the two bars. What do you notice?
              </p>
              <p style={{ ...smallStyle, marginBottom: '0.25rem' }}>One guess at a time:</p>
              <ul style={listStyle}>
                <li>
                  <strong>Guess 1.</strong> In Picture 2, your white ring sits at {fmt(guessHeight)}. Where is the blue dot, and how far apart are they?
                </li>
                <li>
                  <strong>Guess 2.</strong> In Picture 2b, look at your white ring or rings and at the heights of the two bars. What do you see about the bars?
                </li>
                <li>
                  <strong>Guess 3.</strong> In Picture 2, follow the solid and dashed lines from the right side to the left. Where are they close together, and
                  where do they pull apart?
                </li>
              </ul>
            </>
          )}

          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                A clock at {COMPARISON_DISTANCE_IN_HORIZON_RADII} horizon radii from a small black hole and one at {COMPARISON_DISTANCE_IN_HORIZON_RADII}{' '}
                horizon radii from a giant one tick at the same relative rate, even though the giant one is {MASS_RATIO_MILLIONS} million times heavier. What
                do the two situations have in common?
              </p>
              <p style={{ ...smallStyle, marginBottom: '0.25rem' }}>You may find it helps to look at Table 3 and ask:</p>
              <ul style={listStyle}>
                <li>What is different about the two black holes and about the clocks’ distances in kilometers?</li>
                <li>What is the same about the way each clock is placed?</li>
              </ul>
            </>
          )}

          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />

          <button
            onClick={handleContinue}
            disabled={isResponseEmpty}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backgroundColor: isResponseEmpty ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isResponseEmpty ? 'not-allowed' : 'pointer',
              opacity: isResponseEmpty ? 0.6 : 1,
            }}
          >
            Continue
          </button>
        </div>
      )}

      {tutorStep === 'explained' && (
        <TimeNearBlackHoleExplanation
          predictedJustOutside={predictedJustOutside}
          predictedMass={predictedMass}
          predictedApproximation={predictedApproximation}
        />
      )}
    </div>
  )
}

// The explanation: it marks each guess with the real numbers, then goes through the seven points. Exported so that it can be rendered on its own.
export function TimeNearBlackHoleExplanation({
  predictedJustOutside,
  predictedMass,
  predictedApproximation,
}: Omit<TimeNearBlackHoleTutorProps, 'onExplained'>) {
  // Numbers for the explanation come from the experiment's own model, never typed in by hand.
  const d1 = PART_ONE_DISTANCE_IN_HORIZON_RADII
  const factorAtTwo = exactSlowingFactor(COMPARISON_DISTANCE_IN_HORIZON_RADII)
  const factorAtOnePercent = exactSlowingFactor(d1)
  const simpleAtOnePercent = firstOrderSlowingFactor(d1)
  const holes = twoHolesAtTwoRadii()
  const rows = simpleAgainstExactRows()
  const ten = rows[0]
  const two = rows[1]
  const near = rows[2]
  const earth = surfaceSlowing('earth')
  const sun = surfaceSlowing('sun')
  const neutronStar = surfaceSlowing('neutron-star')
  const justOutsideMatch = justOutsideGuessIsModelAnswer(predictedJustOutside)
  const massMatch = massGuessIsModelAnswer(predictedMass)
  const approximationMatch = approximationGuessIsModelAnswer(predictedApproximation)
  const guessHeight = guessHeightForJustOutside(predictedJustOutside)

  return (
    <div>
          <Section title="Your three guesses">
            <p style={paragraphStyle}>
              <em>First guess:</em> you guessed that {justOutsideClauses[predictedJustOutside]}.
              {justOutsideMatch
                ? ` That matches what the model gives: the exact factor at ${fmt(d1)} horizon radii is ${fmt(factorAtOnePercent)}, about one tenth.`
                : ` That is not what the model gives: the exact factor at ${fmt(d1)} horizon radii is ${fmt(factorAtOnePercent)}, about one tenth. ${
                    predictedJustOutside === 'stopped'
                      ? 'The clock is slowed a great deal, but it has not stopped. The factor reaches zero only at the horizon itself.'
                      : predictedJustOutside === 'half'
                        ? `Half as fast is what the simple formula from the earlier experiments gives here (${fmt(simpleAtOnePercent)}), but the exact answer is far smaller.`
                        : 'The slowing is large this close to the horizon.'
                  }`}{' '}
              In Picture 2 your white ring sat at {fmt(guessHeight)} and the blue dot at {fmt(factorAtOnePercent)}.
            </p>
            <p style={paragraphStyle}>
              <em>Second guess:</em> you guessed that {massClauses[predictedMass]}.
              {massMatch
                ? ` That matches: at ${COMPARISON_DISTANCE_IN_HORIZON_RADII} horizon radii the factor is ${fmt(holes.small.factor)} near the 10-Sun black hole and ${fmt(holes.giant.factor)} near M87*.`
                : ` That is not what the model gives: at ${COMPARISON_DISTANCE_IN_HORIZON_RADII} horizon radii the factor is ${fmt(holes.small.factor)} near the 10-Sun black hole and ${fmt(holes.giant.factor)} near M87*, the same, even though M87* is ${MASS_RATIO_MILLIONS} million times as heavy. The factor depends only on how many horizon radii away the clock is, not on the mass.`}{' '}
              In Picture 2b the two bars had the same height.
            </p>
            <p style={paragraphStyle}>
              <em>Third guess:</em> you guessed that {approximationClauses[predictedApproximation]}.
              {approximationMatch
                ? ` That matches: at 10 horizon radii the simple formula is ${formatNumber(ten.percentMore)}% too high, and at ${fmt(d1)} it gives ${fmt(simpleAtOnePercent)} against the exact ${fmt(factorAtOnePercent)}.`
                : ` That is not what the model gives: at 10 horizon radii the simple formula is ${formatNumber(ten.percentMore)}% too high, and at ${fmt(d1)} it gives ${fmt(simpleAtOnePercent)} against the exact ${fmt(factorAtOnePercent)}. ${
                    predictedApproximation === 'still-accurate'
                      ? 'The simple formula is a weak-gravity approximation, and near the horizon gravity is not weak.'
                      : 'Far from the horizon the simple formula is accurate, which is why it worked for Earth and for GPS satellites.'
                  }`}{' '}
              In Picture 2 the solid and dashed lines lie almost on top of each other on the right and pull apart toward the horizon.
            </p>
          </Section>

          <Section title="1. The slowing factor depends only on how many horizon radii away the clock is">
            <p style={paragraphStyle}>
              The factor is <strong>√(1 − r_s ÷ r)</strong>, where r_s is the horizon radius and r is the clock’s distance from the center. This formula comes
              from general relativity, the exact theory of gravity, for a black hole that does not spin and has no electric charge. It is given here, not
              derived.
            </p>
            <p style={paragraphStyle}>
              <strong>A worked example at {COMPARISON_DISTANCE_IN_HORIZON_RADII} horizon radii.</strong> Then r_s ÷ r = 1 ÷ {COMPARISON_DISTANCE_IN_HORIZON_RADII} ={' '}
              {fmt(1 / COMPARISON_DISTANCE_IN_HORIZON_RADII)}, and 1 − {fmt(1 / COMPARISON_DISTANCE_IN_HORIZON_RADII)} ={' '}
              {fmt(1 - 1 / COMPARISON_DISTANCE_IN_HORIZON_RADII)}, and the square root of {fmt(1 - 1 / COMPARISON_DISTANCE_IN_HORIZON_RADII)} is{' '}
              {fmt(factorAtTwo)}. So in {FAR_CLOCK_RUN_SECONDS} seconds on the far-away clock, the hovering clock registers about{' '}
              {(factorAtTwo * FAR_CLOCK_RUN_SECONDS).toFixed(2)} seconds.
            </p>
            <p style={paragraphStyle}>
              <strong>Checking it against Table 3.</strong> The mass appears in the formula only inside r_s, which is {`2GM ÷ c²`} (Black Holes 1). A heavier
              black hole has a bigger r_s, and the formula sees only the ratio r ÷ r_s. For the small black hole the clock is {formatNumber(holes.small.distanceKm)} km
              out and r_s is {formatNumber(holes.small.horizonRadiusKm)} km, so r ÷ r_s = {formatNumber(holes.small.distanceKm)} ÷{' '}
              {formatNumber(holes.small.horizonRadiusKm)} = {formatNumber(holes.small.distanceKm / holes.small.horizonRadiusKm)}. For M87* the clock is{' '}
              {formatNumber(holes.giant.distanceKm / 1e9)} billion km out and r_s is {formatNumber(holes.giant.horizonRadiusKm / 1e9)} billion km, so r ÷ r_s ={' '}
              {formatNumber(holes.giant.distanceKm / holes.giant.horizonRadiusKm)} too. The same ratio gives the same factor.
            </p>
            <p style={paragraphStyle}>
              <strong>A comparison from daily life.</strong> A hiker who is halfway up a small hill and a hiker who is halfway up a huge mountain have each
              climbed the same fraction of their own slope, although one has climbed far more meters. When what matters is the fraction, size drops out. This is
              an analogy for the ratio, not a statement about time. It is what the two situations in the last question had in common: each clock was the same
              fraction of the way to its own black hole’s edge.
            </p>
          </Section>

          <Section title="2. The factor falls toward zero at the horizon">
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
                <thead>
                  <tr>
                    {['Distance, in horizon radii', 'Slowing factor', 'The hovering clock ticks once for every …'].map((h) => (
                      <th key={h} style={{ ...cellStyle, textAlign: 'left', fontWeight: 'bold', borderBottom: '1px solid #b8cfe6' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FALL_DISTANCES.map((d) => {
                    const f = exactSlowingFactor(d)
                    return (
                      <tr key={d}>
                        <td style={cellStyle}>{d}</td>
                        <td style={cellStyle}>{f.toFixed(4)}</td>
                        <td style={cellStyle}>{formatNumber(1 / f)} ticks of yours</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p style={paragraphStyle}>
              At {fmt(d1)} horizon radii the factor is {fmt(factorAtOnePercent)}, about one tick for every {Math.round(1 / factorAtOnePercent)} of yours. At 1.001 it
              is {fmt(exactSlowingFactor(1.001))}, about one tick for every {Math.round(1 / exactSlowingFactor(1.001))}. The closer the clock is held to the
              horizon, the more slowly it ticks, without limit, as seen from far away. The formula gives exactly zero at the horizon itself, but that does not mean
              a clock can sit there: the push needed to hold it still grows without limit too. So the answer to the title question is that the clock never quite
              stops at any distance where it can be held, and it slows more and more the closer it gets.
            </p>
          </Section>

          <Section title="3. Why this happens">
            <p style={paragraphStyle}>
              It is the same effect as in Gravity and Curved Spacetime, Experiment 2: a clock lower down in a gravity field ticks more slowly than one higher
              up. Here is a way to picture it. Suppose the hovering clock sends a flash of light at each tick, and the observer far away counts the flashes. The
              flashes reach the observer stretched out in time, spaced farther apart than they were sent: this stretching is called a <strong>redshift</strong>.
              At {fmt(d1)} horizon radii each flash is spaced 1 ÷ {fmt(factorAtOnePercent)} = {(1 / factorAtOnePercent).toFixed(2)} times farther apart than it was
              sent, and that is the slowing you saw. The same stretching shows up in the light itself, which arrives at longer wavelengths and so looks redder. ESO’s
              2018 measurement of light from the star S2, as it passed our galaxy’s black hole, found that the black hole’s gravity stretched the light in
              this way, though the star was much farther from the horizon than the clock in Part 1.
            </p>
            <p style={paragraphStyle}>
              Notice that this is a different cause from Relativity of Time and Motion, Experiments 3 and 4. Neither clock is moving here. Both are held still,
              and the difference comes from where they are in the gravity field. Here the effect is at full strength.
            </p>
          </Section>

          <Section title="4. The simple formula from the earlier experiments is only an approximation">
            <p style={paragraphStyle}>
              In Gravity and Curved Spacetime, Experiments 2 and 9, the factor was taken to be 1 − r_s ÷ (2r), a weak-gravity approximation. Here is how it
              compares with the exact one:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
                <thead>
                  <tr>
                    {['Distance, in horizon radii', 'Exact', 'Simple formula', 'The simple formula is'].map((h) => (
                      <th key={h} style={{ ...cellStyle, textAlign: 'left', fontWeight: 'bold', borderBottom: '1px solid #b8cfe6' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[ten, two, near].map((r) => (
                    <tr key={r.distanceInHorizonRadii}>
                      <td style={cellStyle}>{r.distanceInHorizonRadii}</td>
                      <td style={cellStyle}>{r.exact.toFixed(4)}</td>
                      <td style={cellStyle}>{r.simple.toFixed(4)}</td>
                      <td style={cellStyle}>{formatNumber(r.percentMore)}% too high</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={cellStyle}>1 (the horizon)</td>
                    <td style={cellStyle}>{exactSlowingFactor(1).toFixed(4)}</td>
                    <td style={cellStyle}>{firstOrderSlowingFactor(1).toFixed(4)}</td>
                    <td style={cellStyle}>still {firstOrderSlowingFactor(1).toFixed(1)}, where the exact answer is {exactSlowingFactor(1).toFixed(0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={paragraphStyle}>
              Far from the horizon it is very good: at 10 horizon radii it is {formatNumber(ten.percentMore)}% too high. At 2 horizon radii it is {formatNumber(two.percentMore)}% too
              high. At the horizon it still says 0.5, while the exact answer is 0. That is why the earlier results for Earth and GPS satellites were accurate:
              Earth’s surface is about {formatNumber(1 / earth.rsOverR / 1e6)} million horizon radii from its center, far inside the range where the simple formula
              is excellent. Like a rule of thumb for a walk, it is accurate where it was made to be used.
            </p>
          </Section>

          <Section title="5. Real objects, for scale">
            <p style={paragraphStyle}>
              The same formula says that a clock on Earth’s surface runs slower than one far away by about {fmt2(earth.fractionSlower * 1e9)} billionths of a second
              every second, which adds up to about {formatDuration(earth.fractionSlower * SECONDS_PER_YEAR)} a year. On the Sun’s surface it is about{' '}
              {fmt2(sun.fractionSlower * 1e6)} millionths of a second every second, or about {formatDuration(sun.fractionSlower * SECONDS_PER_YEAR)} a year. On the
              surface of a neutron star it is about {Math.round(neutronStar.fractionSlower * 100)}%, which would put a clock there about{' '}
              {formatDuration(neutronStar.fractionSlower * SECONDS_PER_YEAR)} behind after one year. A neutron star’s surface is only about{' '}
              {formatNumber(1 / neutronStar.rsOverR)} horizon radii from its center, so the slowing is no longer tiny. (These are the numbers in Table 5.)
            </p>
          </Section>

          <Section title="6. What this does and does not say">
            <p style={paragraphStyle}>
              This compares two clocks that are each held at rest. It does not describe what a traveler who falls toward the black hole experiences. That is
              different, and Black Holes 5, “Falling in”, takes it up, so this experiment should not be read as saying that time stops for someone falling in.
            </p>
          </Section>

          <Section title="7. The honest limits">
            <ul style={listStyle}>
              <li>This was a thought experiment. It did not say how the hovering clock is held in place, and it says nothing about what is inside the horizon.</li>
              <li>The formula was given, not derived, and it is for a black hole that does not spin and has no electric charge. Real black holes usually spin, and that changes the picture.</li>
              <li>The far-away clock was treated as so far that gravity does not affect it.</li>
              <li>The neutron star’s size is a rounded value, and the stellar black hole’s mass of 10 Suns is an illustrative round value.</li>
              <li>The exact formula has been tested by clocks on Earth and by light from a star near our galaxy’s black hole, but not at a horizon.</li>
            </ul>
          </Section>

          <Section title="What to take away">
            <ul style={listStyle}>
              <li>A clock held near a black hole ticks slower than a far-away one by a factor that depends only on its distance in horizon radii.</li>
              <li>The closer to the horizon, the slower it ticks, without limit; it never quite stops at a distance where it can be held.</li>
              <li>The simple formula from the earlier experiments is accurate far from the horizon and poor close to it.</li>
            </ul>
          </Section>

          <Section title="To check this for yourself">
            <ul style={listStyle}>
              <li>Go back to Part 2 and run the same distance around the stellar black hole, Sagittarius A* and M87*. Compare the factors.</li>
              <li>Run one black hole at 100, 10, 3, 1.5, 1.1, 1.01 and 1.001 horizon radii, and watch the dots slide along the lines in Picture 5.</li>
              <li>At each distance, compare the blue dot with the orange ring. Where are they nearly the same, and where are they far apart?</li>
            </ul>
          </Section>
    </div>
  )
}
