import { useState } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  FUTURE_GRAPH_MAX_YEARS,
  futureRelativeSize,
  farFutureMatches,
  matterContributionAtSize,
  nextDoublingMatches,
  noDarkEnergyUniverse,
  realUniverse,
  ruleOfSeventy,
  runFateOfTheUniverseExperiment,
  speedUpSize,
  steadyDoublingEstimate,
} from '../physics/fateOfTheUniverseExperiment'
import type { FarFutureGuess, NextDoublingGuess } from '../physics/fateOfTheUniverseExperiment'
import { FAR_FUTURE_TEXT } from './FateOfTheUniversePictures'

// Cosmology, Experiment 10, Part 4: the tutor (docs/audit/cosmology/10-draft-wording.md, section 6, approved by the owner on 2026-11-16).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every marking comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface FateOfTheUniverseTutorProps {
  predictedFarFuture: FarFutureGuess
  predictedNextDoubling: NextDoublingGuess
  onExplained?: () => void
}

const farFutureLabels: Record<FarFutureGuess, string> = {
  stops: 'slow down and stop',
  slower: 'keep going, but ever more slowly',
  faster: 'keep speeding up and never stop',
}
const nextDoublingLabels: Record<NextDoublingGuess, string> = {
  shorter: 'be shorter, about 5 billion years',
  same: 'be about the same, about 11 billion years',
  longer: 'be much longer, about 30 billion years',
}
const nextDoublingYearsText: Record<NextDoublingGuess, string> = { shorter: '5', same: '11', longer: '30' }

// A dark energy share much smaller than the real one, used to show that even a little dark energy eventually wins ("when, not whether").
const SMALL_SHARE = 0.1

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
// Sizes are printed to one decimal place, as in the approved draft (21.3, 424.8).
const formatSize = (size: number) => size.toFixed(1)
const billions = (years: number, digits = 1) => (years / 1e9).toFixed(digits)

// The question for each step before the explanation. None of them states an outcome or a verdict (§12, §13).
export function tutorPrompt(step: 'observe' | 'compare' | 'conceptual', farFuture: FarFutureGuess, nextDoubling: NextDoublingGuess): string {
  if (step === 'observe')
    return 'Look at the bars showing how long each doubling takes, in Picture 2 for the real universe and in Picture 4 for your own. Do they get longer, shorter, or stay about the same? What changed when you added dark energy? Look at your white marks too: where did each one sit against the real line and the real bar?'
  if (step === 'compare')
    return `You guessed that the far future would ${farFutureLabels[farFuture]} (your white curve), and that the next doubling of the universe's size would ${nextDoublingLabels[nextDoubling]} (your white bar). What do you notice when you compare each white mark with the real line and the real second bar?`
  return 'With only matter, gravity pulls everything toward everything else. So why does the universe not simply fall back together?'
}

export function FateOfTheUniverseTutor({ predictedFarFuture, predictedNextDoubling, onExplained }: FateOfTheUniverseTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return
    if (tutorStep === 'observe') setTutorStep('compare')
    else if (tutorStep === 'compare') setTutorStep('conceptual')
    else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }

  const isResponseEmpty = responseInput.trim() === ''

  return (
    <div style={{ marginTop: '1rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let&rsquo;s reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>{tutorPrompt(tutorStep, predictedFarFuture, predictedNextDoubling)}</p>
          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{ width: '100%', minHeight: '100px', padding: '0.75rem', fontSize: '0.875rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <button
            type="button"
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

      {tutorStep === 'explained' && <FateOfTheUniverseExplanation predictedFarFuture={predictedFarFuture} predictedNextDoubling={predictedNextDoubling} />}
    </div>
  )
}

// The explanation, as its own piece so that its marking can be checked for every pair of guesses.
export function FateOfTheUniverseExplanation({ predictedFarFuture, predictedNextDoubling }: { predictedFarFuture: FarFutureGuess; predictedNextDoubling: NextDoublingGuess }) {
  const L = BEST_FIT_DARK_ENERGY_FRACTION
  const real = realUniverse()
  const matterOnly = noDarkEnergyUniverse()
  const small = runFateOfTheUniverseExperiment(SMALL_SHARE)
  const rule = ruleOfSeventy(L)
  const steady = steadyDoublingEstimate(L, 50e9)

  const noDarkRatio = matterOnly.doublings[1].years / matterOnly.doublings[0].years
  const sizeIn50 = futureRelativeSize(50e9, L)
  const matterPartToday = 1 - L
  const matterPartLater = matterContributionAtSize(sizeIn50, L)

  const firstRight = farFutureMatches(predictedFarFuture)
  const secondRight = nextDoublingMatches(predictedNextDoubling)

  return (
    <div>
      <p style={paragraph}>
        <strong>Your first guess.</strong> You guessed that {FAR_FUTURE_TEXT[predictedFarFuture]} (the white curve). For the real universe the model gives a universe that is {formatSize(sizeIn50)} times its size in 50 billion years and {formatSize(real.sizeAtEnd)} times in 100 billion years, and the expansion keeps speeding up and never stops.{' '}
        <strong>{firstRight ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong>{' '}
        {predictedFarFuture === 'slower'
          ? '“Going on, but ever more slowly” is what the model gives with no dark energy: try 0% in Part 2 and compare.'
          : predictedFarFuture === 'stops'
            ? 'In this model the expansion does not stop, even with no dark energy: with only matter, it slows down forever without quite stopping.'
            : ''}
      </p>
      <p style={paragraph}>
        <strong>Your second guess.</strong> You guessed that the next doubling would take about {nextDoublingYearsText[predictedNextDoubling]} billion years (the white bar). For the real universe the first doubling takes {billions(real.doublings[0].years)} billion years and the next takes {billions(real.doublings[1].years)}, about the same, and the doublings settle toward {billions(real.longTermDoublingTimeYears)}. With no dark energy the next one would take {billions(matterOnly.doublings[1].years, 0)}.{' '}
        <strong>{secondRight ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong>
      </p>

      <p style={paragraph}>
        <strong>1. With only matter, the expansion slows down forever but never quite stops.</strong> The expansion began with an enormous push (the Big Bang, Cosmology 2), and gravity&rsquo;s pull has only been slowing it down since. With no dark energy, the pull is never quite strong enough to stop it, and never lets it reverse. Each doubling takes about {noDarkRatio.toFixed(2)} times as long as the one before (that number is 2 × the square root of 2): {billions(matterOnly.doublings[0].years)} billion years, then about {billions(matterOnly.doublings[0].years)} × {noDarkRatio.toFixed(2)} ≈ {billions(matterOnly.doublings[1].years, 0)}, then about {billions(matterOnly.doublings[2].years, 0)}. This is the same idea as a ball thrown at exactly escape speed (Why Do Planets Orbit Instead of Falling In?, in the Gravity chapter): it slows down all the way out, but never stops and never falls back.
      </p>
      <p style={paragraph}>
        <strong>2. Dark energy does not thin out as the universe grows, but matter does.</strong> When the universe doubles in size, matter is spread through twice the length, twice the width and twice the height, so 2 × 2 × 2 = 8 times the volume, and it becomes one eighth as dense. In this model, dark energy is a property of space itself, so more space means more of it, and its density stays the same. In the model, matter&rsquo;s contribution to the expansion starts at {matterPartToday.toFixed(2)} and dark energy&rsquo;s at {L.toFixed(2)}. By 50 billion years from now, the universe has grown about {sizeIn50.toFixed(1)} times, so matter&rsquo;s contribution has shrunk to about {matterPartLater.toFixed(5)}, while dark energy&rsquo;s is still {L.toFixed(2)}. So whatever the starting shares, as long as there is any dark energy, matter&rsquo;s pull eventually becomes negligible and dark energy wins. The question is not whether, but when. Even with only {Math.round(SMALL_SHARE * 100)}% dark energy, the model says the speed-up begins when the universe is about {speedUpSize(SMALL_SHARE).toFixed(2)} times today&rsquo;s size, about {billions(small.speedUpYearsFromNow ?? 0)} billion years from now.
      </p>
      <p style={paragraph}>
        A comparison: picture a bath fed by two taps. One tap slowly turns itself down as time passes (matter). The other keeps running at the same rate (dark energy, in this model). The total flow falls at first, then levels off at what the steady tap supplies. A bigger steady tap means a higher level, and with no steady tap the flow dwindles toward nothing. Like any comparison, it is not exact: the model combines the two contributions with a square root, not by simply adding two flows.
      </p>
      <p style={paragraph}>
        <strong>3. With dark energy, each doubling takes about the same time.</strong> The doublings take {real.doublings.map((d) => billions(d.years)).join(', ')} billion years, settling toward {billions(real.longTermDoublingTimeYears)}. Think of a savings account that earns a fixed interest rate. It takes the same number of years to double from 100 dollars to 200 as from 1,000 to 2,000, however large the balance gets, because the interest is always the same fraction of what is there. With dark energy, the universe behaves like that: its growth becomes a fixed percentage over each stretch of time, so each doubling takes the same time. The expansion rate settles because matter&rsquo;s contribution has faded to almost nothing, leaving only dark energy&rsquo;s (which this model assumes never changes): {real.expansionRateToday.toFixed(0)} × √{L.toFixed(2)} ≈ {real.longTermExpansionRate.toFixed(1)} kilometers per second per megaparsec, as the Results explain. That settled rate works out to growth of about {rule.percentGrowthPerBillionYears.toFixed(1)}% of the universe&rsquo;s size every billion years. A rough rule for savings accounts says the doubling time is about 70 divided by the percent growth: 70 ÷ {rule.percentGrowthPerBillionYears.toFixed(1)} ≈ {billions(rule.doublingTimeYears)} billion years, close to the exact {billions(real.longTermDoublingTimeYears)}.
      </p>
      <p style={paragraph}>
        <strong>A simple calculation.</strong> If every doubling took the settled {billions(real.longTermDoublingTimeYears)} billion years, then 50 billion years would be 50 ÷ {billions(real.longTermDoublingTimeYears)} ≈ {steady.doublings.toFixed(1)} doublings, and the size would grow by 2 multiplied by itself {steady.doublings.toFixed(1)} times, which is about {formatSize(steady.estimate)}. The model&rsquo;s own value is {formatSize(steady.modelSize)}, about {steady.gapPercent.toFixed(0)}% {steady.modelIsHigher ? 'higher' : 'lower'}, because the earliest doublings are shorter than the settled time: matter&rsquo;s pull has not yet faded. Like any comparison, the savings account is not exact: the universe&rsquo;s early doublings are not quite equal.
      </p>
      <p style={paragraph}>
        <strong>4. The real universe has already been through both stages.</strong> For most of its history, matter dominated and the expansion was slowing down. Then, as matter thinned out, dark energy took over. In this model the switch happened about {billions(-(real.speedUpYearsFromNow ?? 0))} billion years ago, when the universe was about {real.speedUpSize.toFixed(2)} times its present size. NASA&rsquo;s pages give figures that differ, from about 5 to 7.5 billion years ago. That speed-up is what the supernovae in Cosmology 5 revealed.
      </p>
      <p style={paragraph}>
        <strong>5. What grows is the space between groups.</strong> Things held together by their own gravity, such as our galaxy and its neighbors, the Solar System, and you, do not expand. As the space between groups of galaxies stretches, the groups themselves stay the same size, as in the drawing. What keeps growing is the distance between faraway galaxies and us.
      </p>
      <p style={paragraph}>
        <strong>6. The honest limits.</strong> Everything here depends on dark energy being a constant that never changes, which nobody yet knows, so this is what the model gives, not a prediction of how the real universe will end. As of November 2026 the question of whether dark energy changes is still open: in March 2025 DESI&rsquo;s data, combined with the oldest light, favoured a changing dark energy at 3.1σ, and the 2026 results (the Dark Energy Survey in January, DESI&rsquo;s Lyman-alpha measurements in July) have neither confirmed nor ruled it out. The model also assumes a flat universe, which Planck&rsquo;s 2018 curvature, 0.001 ± 0.002, is consistent with, and it covers only how the size of the universe changes. Other endings, such as a collapse back together or a runaway stretching that tears everything apart, are possible if dark energy changed or the universe were not flat, and this model cannot say anything about them. The graph stops at {billions(FUTURE_GRAPH_MAX_YEARS, 0)} billion years only because that is the range of its axis, not because anything is predicted to happen then.
      </p>
      <p style={{ ...paragraph, marginBottom: 0 }}>
        <strong>7. Not covered here:</strong> what happens to stars, black holes and matter in the far future, including the universe growing cold and dark, and what dark energy actually is.
      </p>
    </div>
  )
}
