import { useState } from 'react'
import {
  PLANCK_AGE_YEARS,
  checkUp,
  markLeftGuess,
  markTodayGuess,
  modelLightLeftYearsRounded,
  sourceB,
  workedExamples,
} from '../physics/observableUniverseExperiment'
import type { LeftGuess, TodayGuess } from '../physics/observableUniverseExperiment'

// Cosmology, Experiment 8, Part 4: the tutor (docs/audit/cosmology/08-draft-wording.md, section 6, approved by the owner on 2026-11-15).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every "matches" comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface ObservableUniverseTutorProps {
  predictedToday: TodayGuess
  predictedLeft: LeftGuess
  onExplained?: () => void
}

const todayLabels: Record<TodayGuess, string> = {
  less: 'less than 10 billion light-years away',
  about: 'about 10 billion light-years away',
  more: 'more than 10 billion light-years away',
}
const leftLabels: Record<LeftGuess, string> = {
  thirteen: 'about 13 billion light-years away',
  few: 'a few billion light-years away',
  closer: 'far closer than that, under 100 million light-years away',
}
const todayMarks: Record<TodayGuess, string> = {
  less: 'white arrow pointing left from the line at 10 billion',
  about: 'white ring on the line at 10 billion',
  more: 'white arrow pointing right from the line at 10 billion',
}
const leftMarks: Record<LeftGuess, string> = {
  thirteen: 'white line at 13 billion on Source B’s green row',
  few: 'white arrow at the right edge of the zoomed panel',
  closer: 'white bracket from 0 to 100 million in the zoomed panel',
}

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const bil = (lightYears: number, digits = 1) => (lightYears / 1e9).toFixed(digits)

// The question for each step before the explanation. None of them states an outcome or a verdict (§12, §13).
export function tutorPrompt(step: 'observe' | 'compare' | 'conceptual', today: TodayGuess, left: LeftGuess): string {
  const b = sourceB()
  if (step === 'observe')
    return 'Compare the three bars for Galaxy A and for Source B on the first picture, and the three curves on the graph. Look at your white marks too: where did each one sit against the real bars? What do you notice?'
  if (step === 'compare')
    return `You guessed that Galaxy A would be ${todayLabels[today]} today (your ${todayMarks[today]}), and that Source B was ${leftLabels[left]} when the light left (your ${leftMarks[left]}). What do you notice when you compare each white mark with the real bars?`
  return `The oldest light left its source only about ${bil(b.lightTravelYears)} billion years ago, but that source is now about ${bil(b.distanceTodayLightYears)} billion light-years away. How can that be, if nothing can travel faster than light?`
}

export function ObservableUniverseTutor({ predictedToday, predictedLeft, onExplained }: ObservableUniverseTutorProps) {
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
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>{tutorPrompt(tutorStep, predictedToday, predictedLeft)}</p>
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

      {tutorStep === 'explained' && <ObservableUniverseExplanation predictedToday={predictedToday} predictedLeft={predictedLeft} />}
    </div>
  )
}

// The explanation, as its own piece so that its marking can be checked for every pair of guesses.
export function ObservableUniverseExplanation({ predictedToday, predictedLeft }: { predictedToday: TodayGuess; predictedLeft: LeftGuess }) {
  const first = markTodayGuess(predictedToday)
  const second = markLeftGuess(predictedLeft)
  const w = workedExamples()
  const rows = Object.fromEntries(checkUp().map((r) => [r.id, r]))
  const cmbToday = bil(w.todayLightYears)
  const travelled = bil(w.travelLightYears)
  const leftMillions = Math.round(w.leftLightYears / 1e6)
  const speedKmPerS = (Math.round(w.recessionSpeedKmPerS / 1000) * 1000).toLocaleString('en-US')
  return (
    <div>
      <p style={paragraph}>
        <strong>1. The observable universe is the part whose light has reached us.</strong> It is not an edge of space, only a limit on what we can see, because light from farther away has not had time to arrive.
      </p>
      <p style={paragraph}>
        <strong>2. How far the light travelled is only its travel time multiplied by the speed of light.</strong> You guessed that Galaxy A would be {todayLabels[predictedToday]} today (the {todayMarks[predictedToday]}). Galaxy A&rsquo;s light has been travelling for about {bil(first.galaxyATravelledLightYears)} billion years, so it has covered about {bil(first.galaxyATravelledLightYears)} billion light-years (the blue bar). But the galaxy is {bil(first.galaxyATodayLightYears)} billion light-years away today (the gold bar), which is {bil(first.todayMinusTravelledLightYears)} billion farther than the light&rsquo;s journey, and {first.galaxyATodayLightYears > first.referenceLightYears ? 'more' : 'less'} than 10 billion.{' '}
        <strong>{first.matches ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong> For the oldest light the same sum gives {travelled} billion years × 1 light-year per year = {travelled} billion light-years (the blue bar for Source B).
      </p>
      <p style={paragraph}>
        <strong>3. While the light travelled, the space it crossed stretched.</strong> That carried the source away, so the source ended up much farther than the light&rsquo;s own journey. A comparison: an ant starts at one end of a rubber band and walks toward the other end at a steady pace while the band is stretched. When the ant arrives, the two ends of the band are much farther apart than the total length of the ant&rsquo;s steps. The light is the ant, your source is the end of the band the ant started from, and Earth is the end it walks toward. Like any comparison it is not exact, but it shows the idea. For the oldest light, the light&rsquo;s journey adds up to {travelled} billion light-years, while the distance between the source and Earth grew to {cmbToday} billion. That is {cmbToday} ÷ {travelled} ≈ {sourceB().todayOverTravelled.toFixed(2)} times as far.
      </p>
      <p style={paragraph}>
        <strong>4. The oldest light&rsquo;s source was very close when the light left.</strong> You guessed that Source B was {leftLabels[predictedLeft]} when the light left (the {leftMarks[predictedLeft]}). The model gives about {leftMillions} million light-years (the green bar in the zoomed panel).{' '}
        <strong>{second.matches ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong> Every distance grew by the same factor as the universe&rsquo;s size, which is 1 + the redshift: {leftMillions} million × {w.stretchingFactor.toFixed(1)} ≈ {cmbToday} billion.
      </p>
      <p style={paragraph}>
        <strong>5. This is not faster-than-light travel.</strong> The light always moved at the speed of light through the space around it. What grew was the space between us and the source. NASA&rsquo;s &ldquo;Ask an Astrophysicist&rdquo; page says the same: expansion is of space itself, and it &ldquo;is not in contradiction with the limit for zero mass particles, ultimate speed&rdquo;. Cosmology 1 gave Hubble&rsquo;s Law, which says the farther away a galaxy is, the faster the distance to it is growing. Today that growth rate is H0 × distance, which for the oldest light&rsquo;s source is {w.hubbleConstant} km/s per Mpc × about {Math.round(w.distanceTodayMpc).toLocaleString('en-US')} Mpc ≈ {speedKmPerS} km/s, about {w.recessionSpeedOverC.toFixed(1)} times the speed of light. That does not break relativity, because it is not a speed through space: nothing is moving through space that fast.
      </p>
      <p style={paragraph}>
        <strong>6. The answer depends on the whole expansion history, not only on the age.</strong> As in Cosmology 6, how fast the universe expanded at each moment matters. Each stretch of the light&rsquo;s journey was stretched further by all the expansion that happened after it, so the total depends on the full history. If space had not stretched at all, the distance today would simply equal the distance the light travelled. The factor of {sourceB().todayOverTravelled.toFixed(2)} for the oldest light is the whole history&rsquo;s effect.
      </p>
      <p style={paragraph}>
        <strong>7. The model is close to the published values, not exact.</strong> This model gives {cmbToday} billion light-years for the oldest light&rsquo;s source, against about 45.2 to 45.7 in the published figures read for this page (the edge of the observable universe is about 46.1 to 46.5). It puts the oldest light&rsquo;s departure about {modelLightLeftYearsRounded().toLocaleString('en-US')} years after the Big Bang, against 370,000 to 380,000, and the universe&rsquo;s age at {bil(rows.d.model, 2)} billion years, against {bil(PLANCK_AGE_YEARS, 2)}. The model is a little off because it leaves out radiation, which matters most at the earliest times, and uses a Hubble constant of 70. Remember too that this experiment used the oldest light as a stand-in for the farthest we can see with light; the true edge is slightly farther.
      </p>
      <p style={{ ...paragraph, marginBottom: 0 }}>
        <strong>8. Not covered here:</strong> the exact edge of the observable universe (the farthest distance from which any signal could have reached us by now), the limit on what we will ever be able to see, cosmic inflation, and how large the whole universe is. NASA and ESA say the universe may be larger than the part we can see, and that we cannot know. This experiment used a flat universe with only matter and a constant dark energy, and an illustrative Hubble constant.
      </p>
    </div>
  )
}
