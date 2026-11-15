import { useState } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  OLDEST_STARS_AGE_YEARS,
  PUBLISHED_PLANCK,
  markDarkEnergyGuess,
  markMatterOnlyGuess,
  matterOnlyExample,
  universeAgeYears,
} from '../physics/universeAgeExperiment'
import type { DarkEnergyGuess, MatterOnlyGuess } from '../physics/universeAgeExperiment'

// Cosmology, Experiment 6, Part 4: the tutor (docs/audit/cosmology/06-draft-wording.md, section 6).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every "matches" comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface UniverseAgeTutorProps {
  predictedMatterOnly: MatterOnlyGuess
  predictedDarkEnergy: DarkEnergyGuess
  onExplained?: () => void
}

const matterOnlyLabels: Record<MatterOnlyGuess, string> = {
  longer: 'be older than',
  shorter: 'be younger than',
  same: 'be the same age as',
}
const darkEnergyLabels: Record<DarkEnergyGuess, string> = {
  older: 'make the universe older',
  younger: 'make the universe younger',
  same: 'leave the universe the same age',
}
const matterOnlyMarks: Record<MatterOnlyGuess, string> = {
  shorter: 'white arrow pointing left from the purple dot',
  longer: 'white arrow pointing right from the purple dot',
  same: 'white ring round the purple dot',
}
const darkEnergyMarks: Record<DarkEnergyGuess, string> = {
  older: 'white arrow pointing right from the blue dot',
  younger: 'white arrow pointing left from the blue dot',
  same: 'white ring round the blue dot',
}

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const indented = { margin: '0 0 1rem 1.25rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const billions = (years: number) => (years / 1e9).toFixed(2)

// The question for each step before the explanation. None of them states an outcome or a verdict (§12, §13).
export function tutorPrompt(step: 'observe' | 'compare' | 'conceptual', matterOnly: MatterOnlyGuess, darkEnergy: DarkEnergyGuess): string {
  if (step === 'observe')
    return 'Look at where each line reaches size 1 on the graph. What do you notice about the blue line (matter only), the purple dashed line (the constant-speed picture) and the green line (astronomers’ best fit)? Look at the white marks too: where did each one sit against its dot?'
  if (step === 'compare')
    return `You guessed that a matter-only universe would ${matterOnlyLabels[matterOnly]} Cosmology 2’s constant-speed estimate (your ${matterOnlyMarks[matterOnly]}), and that adding dark energy would ${darkEnergyLabels[darkEnergy]} (your ${darkEnergyMarks[darkEnergy]}). What do you notice when you compare each white mark with the real dots?`
  return 'Cosmology 2’s straight-line estimate came out close to the real age, even though the real expansion rate has changed. Why might it have turned out so close?'
}

export function UniverseAgeTutor({ predictedMatterOnly, predictedDarkEnergy, onExplained }: UniverseAgeTutorProps) {
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
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>{tutorPrompt(tutorStep, predictedMatterOnly, predictedDarkEnergy)}</p>
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

      {tutorStep === 'explained' && <UniverseAgeExplanation predictedMatterOnly={predictedMatterOnly} predictedDarkEnergy={predictedDarkEnergy} />}
    </div>
  )
}

// The explanation, as its own piece so that its marking can be checked for every pair of guesses.
export function UniverseAgeExplanation({ predictedMatterOnly, predictedDarkEnergy }: { predictedMatterOnly: MatterOnlyGuess; predictedDarkEnergy: DarkEnergyGuess }) {
  const first = markMatterOnlyGuess(predictedMatterOnly)
  const second = markDarkEnergyGuess(predictedDarkEnergy)
  const matter = matterOnlyExample()
  const hubbleTimeBillions = billions(matter.hubbleTimeYears)
  const bestAge = universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION)
  return (
    <div>
      <p style={paragraph}>
        <strong>1. The age depends on the whole expansion history, not only today&rsquo;s rate.</strong> Like the bathtub: knowing today&rsquo;s flow is not enough if the tap was turned up or down along the way.
      </p>
      <p style={paragraph}>
        <strong>2. With matter only, the universe comes out young.</strong> You guessed that a matter-only universe would {matterOnlyLabels[predictedMatterOnly]} Cosmology 2&rsquo;s estimate (the {matterOnlyMarks[predictedMatterOnly]}). The graph shows the blue dot at {billions(first.ageYears)}, {first.actual === 'shorter' ? 'left of' : 'not left of'} the purple dot at {billions(first.referenceAgeYears)}.{' '}
        <strong>{first.matches ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong> The &ldquo;age&rdquo; is simply how long it took the universe to grow from nothing to its size today. To find it, you need to know how fast it was growing at every moment along the way.
      </p>
      <p style={indented}>
        <em>Why the speed changes.</em> Matter pulls on other matter with gravity, and that pull works against the expansion, like a ball thrown upward that slows as it rises. So in a matter-only universe the expansion has been slowing down all along. Run the film backward and the same thing means that long ago the universe was expanding <em>faster</em> than it is today.
      </p>
      <p style={indented}>
        <em>Why that makes it young.</em> Cosmology 2&rsquo;s Hubble time (about {hubbleTimeBillions} billion years) pretends the universe always grew at today&rsquo;s speed. But it actually grew faster at the start, so it covered the distance in less time. The exact answer for a matter-only universe is two thirds of the Hubble time: (2 ÷ 3) × {hubbleTimeBillions} ≈ {billions(matter.ageYears)} billion years.
      </p>
      <p style={indented}>
        <em>A car trip.</em> Suppose you must drive 100 km, and your speed at the end of the trip is 50 km/h. If you had driven at that speed the whole way, the trip would take 2 hours. But suppose you drove the first 50 km at 100 km/h and then slowed to 50 km/h for the second half. That takes 0.5 hours plus 1 hour, so 1.5 hours, which is less than 2. Driving faster early on made the trip shorter than &ldquo;distance ÷ today&rsquo;s speed&rdquo; suggests. That is the matter-only universe.
      </p>
      <p style={paragraph}>
        <strong>3. Adding dark energy gives an older universe.</strong> You guessed that adding dark energy would {darkEnergyLabels[predictedDarkEnergy]} (the {darkEnergyMarks[predictedDarkEnergy]}). The green dot is at {billions(second.ageYears)}, {second.actual === 'older' ? 'right of' : 'not right of'} the blue dot at {billions(second.referenceAgeYears)}. <strong>{second.matches ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong> To be clear about the words: there is only one real universe, and we are not changing it. We are comparing two possible universes that have the same expansion rate today, one with matter only and one with matter plus dark energy, and asking how long each would have needed to reach today&rsquo;s size. &ldquo;Older&rdquo; means the longer time. Dark energy works the other way from matter: it pushes the expansion to speed up. It has had its greatest effect in recent times, because as space expands, matter thins out and its slowing pull weakens, while dark energy does not thin out.
      </p>
      <p style={indented}>
        <em>What that does to the past.</em> We keep today&rsquo;s expansion speed the same in every version, because we can measure it. If the expansion has been speeding up toward today, then to arrive at that same speed it must have been <em>slower</em> in the past than the matter-only universe was. A slower early expansion means more time was needed to reach today&rsquo;s size. So the universe is older.
      </p>
      <p style={indented}>
        <em>The same car trip, the other way.</em> Again the trip is 100 km and your speed at the end is 50 km/h. This time you start slowly and speed up: the first 50 km at 25 km/h takes 2 hours, and the second 50 km at 50 km/h takes 1 hour. That is 3 hours, longer than the 2 hours of driving at 50 km/h the whole way. Starting slowly made the trip longer. Adding dark energy does the same to the universe, so more dark energy means an older universe.
      </p>
      <p style={indented}>
        <em>The real universe is a mixture.</em> It was fast at first, slowing under gravity, and then began speeding up. The early quickness shortens the trip and the later speeding up lengthens it, and the two largely offset each other. With about {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}% dark energy the result is about {billions(bestAge)} billion years, close to the Hubble time of about {hubbleTimeBillions}. Point 5 returns to this.
      </p>
      <p style={paragraph}>
        <strong>4. The real answer matches the measurements.</strong> With about {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}% dark energy, this model gives about {billions(bestAge)} billion years. With the slightly lower Hubble constant (about 67.4) and dark energy share (about 68.5%) that the real fit uses, it gives about 13.8 billion years, matching the measured age (Planck 2018: {(PUBLISHED_PLANCK.ageYears / 1e9).toFixed(3)} ± {(PUBLISHED_PLANCK.ageUncertaintyYears / 1e9).toFixed(3)}).
      </p>
      <p style={paragraph}>
        <strong>5. Cosmology 2&rsquo;s estimate was close by coincidence.</strong> The early slowdown makes the age shorter than the Hubble time, and the later speed-up makes it longer again. The two effects roughly cancel. It was a useful estimate, not the real method.
      </p>
      <p style={paragraph}>
        <strong>6. The universe cannot be younger than the oldest things in it.</strong> That is how a matter-only universe, only about 9 billion years old, is ruled out: it would be younger than the oldest known star clusters (older than about {(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)} billion years, from a 2023 study), so it cannot be the real one.
      </p>
      <p style={{ ...paragraph, marginBottom: 0 }}>
        <strong>7. Not covered here:</strong> radiation and inflation&rsquo;s effect on the age, curved universes, and how star ages are measured. Remember too that this experiment used a flat universe with only matter and a constant dark energy, and an illustrative Hubble constant.
      </p>
    </div>
  )
}
