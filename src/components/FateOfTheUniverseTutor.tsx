import { useState } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  FUTURE_GRAPH_MAX_YEARS,
  futureRelativeSize,
  runFateOfTheUniverseExperiment,
  speedUpSize,
} from '../physics/fateOfTheUniverseExperiment'
import { hubbleTimeYears } from '../physics/bigBangExperiment'

type FarFutureChoice = 'stops' | 'slower' | 'faster'
type NextDoublingChoice = 'shorter' | 'same' | 'longer'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface FateOfTheUniverseTutorProps {
  predictedFarFuture: FarFutureChoice
  predictedNextDoubling: NextDoublingChoice
  onExplained?: () => void
}

const farFutureLabels: Record<FarFutureChoice, string> = {
  stops: 'slow down and stop',
  slower: 'keep going, but ever more slowly',
  faster: 'keep speeding up and never stop',
}

const nextDoublingLabels: Record<NextDoublingChoice, string> = {
  shorter: 'be shorter, about 5 billion years',
  same: 'be about the same, about 11 billion years',
  longer: 'be much longer, about 30 billion years',
}

// A dark energy share much smaller than the real one, used to show that even a little dark energy
// eventually wins ("when, not whether").
const SMALL_SHARE = 0.1

const billions = (years: number, digits = 1) => (years / 1e9).toFixed(digits)

export function FateOfTheUniverseTutor({
  predictedFarFuture,
  predictedNextDoubling,
  onExplained,
}: FateOfTheUniverseTutorProps) {
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

  // Numbers for the explanation come from the experiment's own model, never typed in by hand.
  const L = BEST_FIT_DARK_ENERGY_FRACTION
  const real = runFateOfTheUniverseExperiment(L)
  const matterOnly = runFateOfTheUniverseExperiment(0)
  const small = runFateOfTheUniverseExperiment(SMALL_SHARE)

  const noDarkRatio = matterOnly.doublings[1].years / matterOnly.doublings[0].years
  const sizeIn50 = futureRelativeSize(50e9, L)
  // Matter's and dark energy's parts of the expansion rate (squared), when the universe has grown 50 billion years.
  const matterPartToday = 1 - L
  const matterPartLater = (1 - L) / Math.pow(sizeIn50, 3)
  // Growth per billion years at the settled expansion rate: rate / (H0 x Hubble time), as a percentage.
  const settledGrowthPercentPerBillion =
    (real.longTermExpansionRate / real.expansionRateToday / (hubbleTimeYears() / 1e9)) * 100
  const ruleOf70Years = (70 / settledGrowthPercentPerBillion) * 1e9

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
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' &&
              'Look at the bars showing how long each doubling takes. Do they get longer, shorter, or stay about the same? What changed when you added dark energy?'}
            {tutorStep === 'compare' &&
              `You predicted that the far future would ${farFutureLabels[predictedFarFuture]}, and that the next doubling of the universe's size would ${nextDoublingLabels[predictedNextDoubling]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'With only matter, gravity pulls everything toward everything else. So why does the universe not simply fall back together?'}
          </p>

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
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. With only matter, the expansion slows down forever but never quite stops.</strong>{' '}
            The expansion began with an enormous push (the Big Bang, Experiment 2), and gravity's pull has
            only been slowing it down since. With no dark energy, the pull is never quite strong enough to
            stop it, and never lets it reverse. Each doubling takes about {noDarkRatio.toFixed(2)} times as
            long as the one before (that number is 2 × the square root of 2): {billions(matterOnly.doublings[0].years)}{' '}
            billion years, then about {billions(matterOnly.doublings[0].years)} × {noDarkRatio.toFixed(2)} ≈{' '}
            {billions(matterOnly.doublings[1].years, 0)}, then about{' '}
            {billions(matterOnly.doublings[2].years, 0)}. This is the same idea as a ball thrown at exactly
            escape speed (the Orbits experiment in the Gravity chapter): it slows down all the way out, but
            never stops and never falls back.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. Dark energy does not thin out as the universe grows, but matter does.</strong> When the
            universe doubles in size, matter is spread through twice the length, twice the width and twice the
            height, so 2 × 2 × 2 = 8 times the volume, and it becomes one eighth as dense. In this model, dark
            energy is a property of space itself, so more space means more of it, and its density stays the
            same. In the model, matter's contribution to the expansion starts at {matterPartToday.toFixed(2)} and
            dark energy's at {L.toFixed(2)}. By 50 billion years from now, the universe has grown about{' '}
            {sizeIn50.toFixed(1)} times, so matter's contribution has shrunk to about{' '}
            {matterPartLater.toFixed(5)}, while dark energy's is still {L.toFixed(2)}. So whatever the
            starting shares, as long as there is any dark energy, matter's pull eventually becomes negligible
            and dark energy wins. The question is not whether, but when. Even with only{' '}
            {Math.round(SMALL_SHARE * 100)}% dark energy, the model says the speed-up begins when the universe
            is about {speedUpSize(SMALL_SHARE).toFixed(2)} times today's size, about{' '}
            {billions(small.speedUpYearsFromNow ?? 0)} billion years from now.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. With dark energy, each doubling takes about the same time.</strong> The doublings take{' '}
            {real.doublings.map((d) => billions(d.years)).join(', ')} billion years, settling toward{' '}
            {billions(real.longTermDoublingTimeYears)}. Think of the savings account again: with a fixed interest
            rate, the balance doubles in the same number of years however large it gets. The expansion
            rate settles because matter's contribution has faded to almost nothing, leaving only dark energy's
            (which this model assumes never changes): {real.expansionRateToday.toFixed(0)} × √{L.toFixed(2)} ≈{' '}
            {real.longTermExpansionRate.toFixed(1)} kilometers per second per megaparsec, as the Results explain.
            That settled rate works out to growth of about {settledGrowthPercentPerBillion.toFixed(1)}% of the universe's size every billion
            years. A rough rule for savings accounts says the doubling time is about 70 divided by the percent
            growth: 70 ÷ {settledGrowthPercentPerBillion.toFixed(1)} ≈ {billions(ruleOf70Years)} billion
            years, close to the exact {billions(real.longTermDoublingTimeYears)}. Like any comparison, this one
            is not exact: the early doublings are a little shorter, because matter's pull has not quite faded
            yet.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The real universe has already been through both stages.</strong> For most of its history,
            matter dominated and the expansion was slowing down. Then, as matter thinned out, dark energy took over. In
            this model the switch happened about {billions(-(real.speedUpYearsFromNow ?? 0))} billion years
            ago, when the universe was about {real.speedUpSize.toFixed(2)} times its present size. That speed-up
            is what the supernovae in Experiment 5 revealed.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. What grows is the space between groups.</strong> Things held together by their own
            gravity, such as our galaxy and its neighbors, the Solar System, and you, do not expand. As the
            space between groups of galaxies stretches, the groups themselves stay the same size, as in the
            drawing. What keeps growing is the distance between faraway galaxies and us.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. The honest limits.</strong> Everything here depends on dark energy being a constant that
            never changes, which nobody yet knows, so this is what the model gives, not a prediction of how
            the real universe will end. It also assumes a flat universe, and it covers only how the size of the
            universe changes. Other endings, such as a collapse back together or a runaway stretching that
            tears everything apart, are possible if dark energy changed or the universe were not flat, and this
            model cannot say anything about them. The graph stops at {billions(FUTURE_GRAPH_MAX_YEARS, 0)} billion
            years only because that is the range of its axis, not because anything is predicted to happen then.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>7. Not covered here:</strong> what happens to stars, black holes and matter in the far
            future, including the universe growing cold and dark, and what dark energy actually is.
          </p>
        </div>
      )}
    </div>
  )
}
