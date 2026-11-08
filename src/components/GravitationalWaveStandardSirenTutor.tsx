import { useState } from 'react'
import {
  FAR_DISTANCE_MPC,
  NEARBY_DISTANCE_MPC,
  PUBLISHED_HUBBLE,
  SIREN_PART1_DISTANCE_MPC,
  SIREN_PART1_EVENT,
  publishedBestHubble,
  sameDetectedStories,
  sirenRunSummary,
} from '../physics/standardSirenExperiment'
import type { DistanceKnowChoice, NearFarChoice } from '../physics/standardSirenExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveStandardSirenTutorProps {
  predictedNearFar: NearFarChoice
  predictedDistanceKnow: DistanceKnowChoice
  // "Matched" is computed by the physics module (nearFarGuessMatches, distanceKnowGuessMatches), never typed here (CLAUDE.md §9).
  nearFarMatched: boolean
  distanceKnowMatched: boolean
  onExplained?: () => void
}

const nearFarLabels: Record<NearFarChoice, string> = {
  'nearby-louder': 'the nearby one',
  'far-louder': 'the far one',
  same: 'no difference between them',
}

const distanceKnowLabels: Record<DistanceKnowChoice, string> = {
  yes: 'the distance could be found from the detected amplitude alone',
  no: 'the distance could not be found from the detected amplitude alone',
}

const amp = (value: number) => (value >= 0.01 ? value.toFixed(4) : value.toExponential(3))

// Gravitational Waves, Experiment 7's tutor (Part 4), audited to the newer rules
// (docs/audit/gravitational-waves/07-draft-wording.md, section 7). The prompts point to the white YOUR GUESS marks by name and give no
// verdict; the explanation marks both guesses, with every number and each "matched" taken from the physics module (CLAUDE.md §9).
// The wording is the owner's, approved on 2026-11-07 as drafted, "approve with defaults" (CLAUDE.md §28.1).
export function GravitationalWaveStandardSirenTutor({
  predictedNearFar,
  predictedDistanceKnow,
  nearFarMatched,
  distanceKnowMatched,
  onExplained,
}: GravitationalWaveStandardSirenTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')
  const run = sirenRunSummary(SIREN_PART1_EVENT, SIREN_PART1_DISTANCE_MPC)
  const stories = sameDetectedStories(run.detectedAmplitude)
  const f1 = (value: number) => value.toFixed(1)

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
  const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

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

      {tutorStep !== 'explained' && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' && 'What did you notice about the true amplitude compared to the detected amplitude?'}
            {tutorStep === 'compare' &&
              `On the picture, the white mark on Panel B shows that you predicted ${nearFarLabels[predictedNearFar]} would look stronger. The white box on Panel C shows that you predicted ${distanceKnowLabels[predictedDistanceKnow]}. Look at the three bars in Panel B, at the sources in Panel C and at the check-up in Part 3. If you have run another event or distance in Part 2, your guesses are drawn on Drawing B and Drawing C too. What do you notice when you put your guesses next to the real picture?`}
            {tutorStep === 'conceptual' && 'If the detector only gave you the detected amplitude, what else would you need to know to find the distance, and where could that come from?'}
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
          <p style={paragraphStyle}>
            <strong>0. Your guesses, marked.</strong> You guessed {nearFarLabels[predictedNearFar]} and that {distanceKnowLabels[predictedDistanceKnow]}. In the run, a nearby merger ({NEARBY_DISTANCE_MPC} Mpc) arrived with a
            detected amplitude of {amp(run.detectedAtNearby)} against {amp(run.detectedAtFar)} for a far one ({FAR_DISTANCE_MPC.toLocaleString('en-US')} Mpc), {Math.round(run.nearFarRatio)} times weaker; and the same
            detected amplitude, {amp(run.detectedAmplitude)}, fits sources at {stories[0].distanceMpc}, {stories[1].distanceMpc} and {stories[2].distanceMpc} Mpc with true amplitudes of {amp(stories[0].trueAmplitude)},{' '}
            {amp(stories[1].trueAmplitude)} and {amp(stories[2].trueAmplitude)}. Your first guess {nearFarMatched ? 'matched' : 'did not match'} and your second {distanceKnowMatched ? 'matched' : 'did not match'}.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Amplitude weakens with distance</strong>, the same way a sound or a light grows fainter the farther away it is: in this page&rsquo;s model, double the distance and the detected amplitude halves.
          </p>
          <p style={paragraphStyle}>
            <strong>2. The chirp&rsquo;s own shape reveals the true amplitude</strong>, because how quickly its frequency rises depends only on the masses involved, not on how far away it travelled. So a detector can know how
            strong the wave was at the source, even without knowing the distance.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Comparing the true amplitude with the weaker detected one gives the distance directly:</strong> {amp(run.trueAmplitude)} ÷ {amp(run.detectedAmplitude)} = {f1(run.recoveredDistanceMpc)} Mpc. This is a{' '}
            <strong>standard siren</strong>, the gravitational-wave version of a <strong>standard candle</strong>: an object whose true brightness is known, so that how dim it looks tells you how far away it is. A daily-life
            comparison: a 100-watt bulb always gives the same light, so a bulb that looks very dim must be a long way off.
          </p>
          <p style={paragraphStyle}>
            <strong>4. The distance this page recovered, {f1(run.recoveredDistanceMpc)} Mpc, is the one it started from.</strong> In a real detection nature chooses the distance and the detector hands you only the detected
            amplitude; here the page chose it, made the detected amplitude, and then undid it. So this is a check that the method is consistent, not a measurement.
          </p>
          <p style={paragraphStyle}>
            <strong>5. The Hubble constant.</strong> Pairing that distance with the host galaxy&rsquo;s Hubble-flow velocity, {PUBLISHED_HUBBLE.velocityKmPerS.toLocaleString('en-US')} km/s (the paper&rsquo;s own corrected figure),
            gives {PUBLISHED_HUBBLE.velocityKmPerS.toLocaleString('en-US')} ÷ {f1(run.recoveredDistanceMpc)} = {f1(run.hubbleConstant ?? 0)} km/s/Mpc. The real 2017 measurement gave {f1(PUBLISHED_HUBBLE.value)} (+
            {f1(PUBLISHED_HUBBLE.plus)}, −{f1(PUBLISHED_HUBBLE.minus)}) km/s/Mpc, a range of {PUBLISHED_HUBBLE.low} to {PUBLISHED_HUBBLE.high}; this page&rsquo;s single number only shows the method. (With the paper&rsquo;s own best
            distance of {PUBLISHED_HUBBLE.bestDistanceMpc} Mpc the same velocity gives {f1(publishedBestHubble())}.)
          </p>
          <p style={paragraphStyle}>
            <strong>6. GW150914 could not be used this way:</strong> it had no light counterpart, so no host galaxy and no recession velocity.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. This toy model is a simplified stand-in:</strong> an exact inverse-distance falloff, a true amplitude read straight from the chirp, and arms drawn as a compressed picture.
          </p>
        </div>
      )}
    </div>
  )
}
