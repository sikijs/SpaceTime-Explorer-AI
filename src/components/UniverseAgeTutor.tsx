import { useState } from 'react'
import { hubbleTimeYears } from '../physics/bigBangExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION } from '../physics/darkEnergyExperiment'

type MatterOnlyAgeChoice = 'longer' | 'shorter' | 'same'
type DarkEnergyAgeChoice = 'older' | 'younger' | 'same'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface UniverseAgeTutorProps {
  predictedMatterOnly: MatterOnlyAgeChoice
  predictedDarkEnergy: DarkEnergyAgeChoice
  onExplained?: () => void
}

const matterOnlyLabels: Record<MatterOnlyAgeChoice, string> = {
  longer: 'be older than',
  shorter: 'be younger than',
  same: 'be the same age as',
}

const darkEnergyLabels: Record<DarkEnergyAgeChoice, string> = {
  older: 'make the universe older',
  younger: 'make the universe younger',
  same: 'leave the universe the same age',
}

export function UniverseAgeTutor({ predictedMatterOnly, predictedDarkEnergy, onExplained }: UniverseAgeTutorProps) {
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
  const hubbleTimeBillions = (hubbleTimeYears() / 1e9).toFixed(2)

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
              'Compare where each line reaches size 1. What do you notice about the matter-only line (blue), the straight line (purple), and the line with your chosen dark energy (gold)?'}
            {tutorStep === 'compare' &&
              `You predicted that a matter-only universe would ${matterOnlyLabels[predictedMatterOnly]} Experiment 2's constant-speed estimate, and that adding dark energy would ${darkEnergyLabels[predictedDarkEnergy]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              "Experiment 2's straight-line estimate came out close to the real age, even though the real expansion rate has changed. Why might it have turned out so close?"}
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
            <strong>1. The age depends on the whole expansion history, not only today's rate.</strong> Like
            the bathtub: knowing today's flow is not enough if the tap was turned up or down along the way.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. With matter only, the universe comes out young.</strong> The "age" is simply how long
            it took the universe to grow from nothing to its size today. To find it, you need to know how
            fast it was growing at every moment along the way.
          </p>
          <p style={{ margin: '0 0 1rem 1.25rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <em>Why the speed changes.</em> Matter pulls on other matter with gravity, and that pull works
            against the expansion, like a ball thrown upward that slows as it rises. So in a matter-only
            universe the expansion has been slowing down all along. Run the film backward and the same
            thing means that long ago the universe was expanding <em>faster</em> than it is today.
          </p>
          <p style={{ margin: '0 0 1rem 1.25rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <em>Why that makes it young.</em> Experiment 2's Hubble time (about {hubbleTimeBillions} billion years)
            pretends the universe always grew at today's speed. But it actually grew faster at the start,
            so it covered the distance in less time. The exact answer for a matter-only universe is two
            thirds of the Hubble time: (2 ÷ 3) × {hubbleTimeBillions} ≈ 9.3 billion years.
          </p>
          <p style={{ margin: '0 0 1rem 1.25rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <em>A car trip.</em> Suppose you must drive 100 km, and your speed at the end of the trip is 50
            km/h. If you had driven at that speed the whole way, the trip would take 2 hours. But suppose you
            drove the first 50 km at 100 km/h and then slowed to 50 km/h for the second half. That takes 0.5
            hours plus 1 hour, so 1.5 hours, which is less than 2. Driving faster early on made the trip
            shorter than "distance ÷ today's speed" suggests. That is the matter-only universe.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Adding dark energy gives an older universe.</strong> To be clear about the words:
            there is only one real universe, and we are not changing it. We are comparing two possible
            universes that have the same expansion rate today, one with matter only and one with matter plus
            dark energy, and asking how long each would have needed to reach today's size. "Older" means the
            longer time. Dark energy works the other way from matter: it
            pushes the expansion to speed up. It has had its greatest effect in recent times, because as
            space expands, matter thins out and its slowing pull weakens, while dark energy does not thin
            out.
          </p>
          <p style={{ margin: '0 0 1rem 1.25rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <em>What that does to the past.</em> We keep today's expansion speed the same in every version,
            because we can measure it. If the expansion has been speeding up toward today, then to arrive at
            that same speed it must have been <em>slower</em> in the past than the matter-only universe was.
            A slower early expansion means more time was needed to reach today's size. So the universe is
            older.
          </p>
          <p style={{ margin: '0 0 1rem 1.25rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <em>The same car trip, the other way.</em> Again the trip is 100 km and your speed at the end is
            50 km/h. This time you start slowly and speed up: the first 50 km at 25 km/h takes 2 hours, and
            the second 50 km at 50 km/h takes 1 hour. That is 3 hours, longer than the 2 hours of driving at
            50 km/h the whole way. Starting slowly made the trip longer. Adding dark energy does the same
            to the universe, so more dark energy means an older universe.
          </p>
          <p style={{ margin: '0 0 1rem 1.25rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <em>The real universe is a mixture.</em> It was fast at first, slowing under gravity, and then
            began speeding up. The early quickness shortens the trip and the later speeding up lengthens it,
            and the two largely offset each other. With about 70% dark energy the result is about 13.5
            billion years, close to the Hubble time of about 14. Point 5 returns to this.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The real answer matches the measurements.</strong> With about{' '}
            {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}% dark energy, this model gives about 13.5
            billion years. With the slightly lower Hubble constant (about 67.4) and dark energy share (about
            68.5%) that the real fit uses, it gives about 13.8 billion years, matching the measured age.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Experiment 2's estimate was close by coincidence.</strong> The early slowdown makes the
            age shorter than the Hubble time, and the later speed-up makes it longer again. The two effects
            roughly cancel. It was a useful estimate, not the real method.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. The universe cannot be younger than the oldest things in it.</strong> That is how a
            matter-only universe, only about 9 billion years old, was ruled out: it would be younger than the
            oldest known star clusters.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>7. Not covered here:</strong> radiation and inflation's effect on the age, curved
            universes, and how star ages are measured. Remember too that this experiment used a flat universe
            with only matter and a constant dark energy, and an illustrative Hubble constant.
          </p>
        </div>
      )}
    </div>
  )
}
