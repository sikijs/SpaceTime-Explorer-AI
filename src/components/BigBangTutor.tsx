import { useState } from 'react'
import { ageGuessMatches, relativeGapToMeasuredAge, hubbleTimeYears, timeGuessMatches } from '../physics/bigBangExperiment'
import type { AgeGuess, GalaxyTimeRow, TimeGuess } from '../physics/bigBangExperiment'
import { fmtBillions } from './BigBangPictures'

// Cosmology, Experiment 2, Part 4: the tutor (docs/audit/cosmology/02-draft-wording.md, section 7, approved by the owner on 2026-11-14).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every "matches" comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BigBangTutorProps {
  timeGuess: TimeGuess
  ageGuess: AgeGuess
  // The presets' rows: the ones the white marks are drawn against.
  rows: GalaxyTimeRow[]
  onExplained?: () => void
}

const timeLabels: Record<TimeGuess, string> = { longer: 'longer', shorter: 'shorter', same: 'the same' }
const ageLabels: Record<AgeGuess, string> = { muchLonger: 'much longer', muchShorter: 'much shorter', close: 'close, but not exact' }

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function BigBangTutor({ timeGuess, ageGuess, rows, onExplained }: BigBangTutorProps) {
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
  const timeMatches = timeGuessMatches(timeGuess, rows)
  const ageMatches = ageGuessMatches(ageGuess)
  const gapPercent = (relativeGapToMeasuredAge() * 100).toFixed(1)


  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1.5rem',
        border: '1px solid #d9e8f5',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let&rsquo;s reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraph}>
            {tutorStep === 'observe' && 'Look at the three galaxies, the ruler and the three bars. What do you notice about where the galaxies ended up, and when?'}
            {tutorStep === 'compare' &&
              `You guessed that a farther galaxy's time would be ${timeLabels[timeGuess]}, and that this page's answer would come out ${ageLabels[ageGuess]}. Look at your white markers beside the real bars and the zoom strip. What do you notice?`}
            {tutorStep === 'conceptual' && 'If every galaxy, no matter how far away, points back to the same moment, what might that suggest about the universe’s whole history?'}
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
          <p style={paragraph}>
            <strong>1. Running Hubble&rsquo;s Law backward.</strong> The time for any galaxy to reach zero distance from us is 1 divided by the Hubble constant, the same number whatever its distance: the <strong>Hubble time</strong>. Here that is {fmtBillions(hubbleTimeYears())} billion
            years for every galaxy. <strong>Your first guess</strong> was {timeLabels[timeGuess]}. {timeMatches ? 'That matches the real bars.' : 'That does not match the real bars.'}
          </p>
          <p style={paragraph}>
            Here is why it comes out the same: a galaxy twice as far moves twice as fast, so it covers twice the distance in the same time, and the time back to zero cancels. Picture dots on a balloon being let down: every dot gets closer to every other dot, and they all meet at the
            same moment.
          </p>
          <p style={paragraph}>
            <strong>2. Close to the measured age, but not the real derivation.</strong> This page&rsquo;s answer is {fmtBillions(hubbleTimeYears())} billion years, about {gapPercent} percent more than the age of about 13.8 billion years measured by others.{' '}
            <strong>Your second guess</strong> was {ageLabels[ageGuess]}. {ageMatches ? 'That matches the real gap.' : 'That does not match the real gap.'} This is informative, but it is not how the age is found: the real expansion has changed over time (matter slowed it; dark
            energy has been speeding it up), so today&rsquo;s rate run backward does not retrace the real history.
          </p>
          <p style={paragraph}>
            <strong>3. This shared moment is popularly called &ldquo;the Big Bang&rdquo;.</strong> It was not an explosion in one place with a centre, and it was not centred on Earth or the Milky Way. NASA&rsquo;s John Mather says the universe has no centre and the Big Bang happened
            everywhere at once, &ldquo;a process happening in time, not a point in time&rdquo; (see the links). An observer on any other galaxy would see the same pattern.
          </p>
          <p style={paragraph}>
            <strong>4. Not covered here:</strong> the real expanding-universe model (general relativity&rsquo;s cosmology), how the expansion rate has actually changed, and dark energy: later topics.
          </p>
          <p style={{ ...paragraph, marginBottom: 0 }}>
            <strong>5. The puzzle from the introduction.</strong> Remember the matching sky? That is the <strong>horizon problem</strong>, and <strong>cosmic inflation</strong> is one proposed answer. It is a current theory, not a settled fact: NASA&rsquo;s pages say we do not know what
            triggered it, and that scientists are still looking for signs of it.
          </p>
        </div>
      )}
    </div>
  )
}
