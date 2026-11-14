import { useState } from 'react'
import {
  MARKER_STAR_RADII_KPC,
  MAX_RADIUS_KPC,
  MIN_RADIUS_KPC,
  OBSERVED_SPEED_KM_PER_S,
  measuredGuessMatches,
  rotationCurve,
  speedGuessMatches,
} from '../physics/darkMatterExperiment'
import type { MeasuredGuess, SpeedGuess } from '../physics/darkMatterExperiment'

// Cosmology, Experiment 4, Part 4: the tutor (docs/audit/cosmology/04-draft-wording.md, section 6).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every "matches" comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface DarkMatterTutorProps {
  predictedSpeed: SpeedGuess
  predictedMeasured: MeasuredGuess
  onExplained?: () => void
}

const speedLabels: Record<SpeedGuess, string> = { faster: 'faster than', same: 'about the same speed as', slower: 'slower than' }
const measuredLabels: Record<MeasuredGuess, string> = { match: 'match', faster: 'be faster than', slower: 'be slower than' }
const speedMarks: Record<SpeedGuess, string> = { faster: 'rising', same: 'level', slower: 'falling' }
const measuredMarks: Record<MeasuredGuess, string> = { match: 'equals sign', faster: 'arrow pointing up', slower: 'arrow pointing down' }

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The question for each step before the explanation. None of them states an outcome or a verdict (§12, §13).
export function tutorPrompt(step: 'observe' | 'compare' | 'conceptual', speed: SpeedGuess, measured: MeasuredGuess): string {
  if (step === 'observe') return 'Look at the blue line (visible matter only) and the green dashed line (measured speed). What do you notice, especially far from the centre?'
  if (step === 'compare')
    return `Your white marks show your two guesses: that, with only visible matter, a far star would orbit ${speedLabels[speed]} a near one (your ${speedMarks[speed]} white line), and that the measured speeds would ${measuredLabels[measured]} the visible-matter line (your white ${measuredMarks[measured]} at 30 kpc). Look at the white marks beside the blue and green lines. What do you notice?`
  return 'If the stars far from the centre move faster than the matter we can see can explain, what might be going on?'
}

// Computed from the physics model, so the numbers quoted below can never drift from it.
const [innerPoint, outerPoint] = rotationCurve(0, [MIN_RADIUS_KPC, MAX_RADIUS_KPC])

export function DarkMatterTutor({ predictedSpeed, predictedMeasured, onExplained }: DarkMatterTutorProps) {
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
  const speedOk = speedGuessMatches(predictedSpeed)
  const measuredOk = measuredGuessMatches(predictedMeasured)
  const [sun] = rotationCurve(0, [MARKER_STAR_RADII_KPC[0]])

  return (
    <div style={{ marginTop: '1rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let&rsquo;s reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorPrompt(tutorStep, predictedSpeed, predictedMeasured)}
          </p>
          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{ width: '100%', minHeight: '100px', padding: '0.75rem', fontSize: '0.875rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', resize: 'vertical' }}
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
            <strong>1. Orbit speed depends on the mass inside the orbit.</strong> A star circling a galaxy moves at <code>v = √(G × M / r)</code>, where <code>M</code> is the mass inside its orbit and <code>r</code> is its distance from the centre, the same idea behind the &ldquo;just
            right&rdquo; speed in the Orbits experiment. So measuring how fast stars orbit at different distances is a way to weigh a galaxy.
          </p>
          <p style={paragraph}>
            <strong>2. If the visible matter were all the mass</strong>, nearly all of it would sit near the centre, so stars farther out should orbit more slowly, just as Neptune (about 5.4 km/s) moves much more slowly than Earth (about 29.8 km/s) around the Sun (NASA Planetary Fact Sheet).
            In this model the blue line falls from about {innerPoint.visibleOnlySpeedKmPerS.toFixed(0)} km/s at {MIN_RADIUS_KPC} kpc to about {outerPoint.visibleOnlySpeedKmPerS.toFixed(0)} km/s at {MAX_RADIUS_KPC} kpc, so a far star is <strong>slower</strong>.{' '}
            <strong>Your first guess</strong> was a far star {speedLabels[predictedSpeed]} a near one (your {speedMarks[predictedSpeed]} white line).{' '}
            {speedOk ? 'That matches what the calculation gives.' : 'That is not what the calculation gives.'}
          </p>
          <p style={paragraph}>
            <strong>3. Real galaxies do not behave that way.</strong> Measured speeds stay high, roughly {OBSERVED_SPEED_KM_PER_S} km/s in the Milky Way near the Sun, far from the centre. Vera Rubin looked at the stars on the outer edges of spiral galaxies, and found that, to explain why they
            moved as fast as they did without flying off, there had to be a large amount of matter holding them in (NASA). The measured speed is higher than the blue line at every distance, so the measured speeds are <strong>faster than predicted</strong>.{' '}
            <strong>Your second guess</strong> was that they would {measuredLabels[predictedMeasured]} the visible-matter line (your white {measuredMarks[predictedMeasured]}). {measuredOk ? 'That matches what was measured.' : 'That is not what was measured.'} Back to the sealed box
            from the introduction: the scale read far more than the contents you could see should weigh, and that is what the green line and the blue line show. The window is the light; the scale is gravity.
          </p>
          <p style={paragraph}>
            <strong>4. The simplest explanation is unseen mass: dark matter.</strong> It pulls with gravity but gives off no light, so we mostly know it is there from its gravitational pull on visible matter (NASA Space Place). NASA reports that ordinary matter makes up about 5 percent of the
            universe and dark matter about 27 percent, which is about five times as much; that figure is for the whole universe, not for the inside of 30 kpc. This kind of reasoning has worked before. In 1846, because Uranus did not travel exactly as astronomers expected, Urbain Le Verrier
            worked out where an unknown planet should be, and Johann Galle found Neptune on his first night of searching (NASA). The difference is that nobody has yet found what dark matter is made of: NASA calls it a &ldquo;mysterious substance&rdquo;. This is the position as of November 2026.
          </p>
          <p style={paragraph}>
            <strong>5. Keep in mind</strong> that this experiment used ordinary Newtonian gravity, which is fine at these speeds, and a simple teaching model of the galaxy&rsquo;s mass, not a fit to a real galaxy. The measured speed was a rounded reference value; published values for the Sun are
            a little higher (229 and 240 km/s in two papers), and one of them finds the real curve gently declining beyond the inner galaxy. At 8 kpc the visible matter alone gives {sun.visibleOnlySpeedKmPerS.toFixed(0)} km/s in this model.
          </p>
          <p style={{ ...paragraph, marginBottom: '0' }}>
            <strong>6. Not covered here:</strong> what dark matter is made of, gravitational lensing and galaxy clusters as further evidence, and the tiny ripples in the cosmic microwave background (Cosmology 3 showed the light itself). Dark energy, met in the Big Bang experiment, is a different
            idea.
          </p>
        </div>
      )}
    </div>
  )
}
