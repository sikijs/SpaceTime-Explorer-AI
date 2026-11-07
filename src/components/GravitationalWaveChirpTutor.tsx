import { useState } from 'react'
import {
  PART1_MASS,
  REAL_CHIRP,
  REFERENCE_PAIRS,
  chirpCheckUp,
  chirpRunSummary,
  firstAndLastSwing,
  loudnessGuessMatches,
  pitchGuessMatches,
  timingGuessMatches,
} from '../physics/gravitationalWaveChirpExperiment'
import type { LoudnessChoice, PitchChoice, TimingChoice } from '../physics/gravitationalWaveChirpExperiment'

// Gravitational Waves, Experiment 2's tutor (Part 4), audited to the newer rules
// (docs/audit/gravitational-waves/02-draft-wording.md, section 8). The prompts point to the white YOUR GUESS marks by name and
// give no verdict; the explanation marks each guess, with every number and every "matched" taken from the physics module
// (CLAUDE.md §9). All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveChirpTutorProps {
  pitchPrediction: PitchChoice
  loudnessPrediction: LoudnessChoice
  timingPrediction: TimingChoice
  onExplained?: () => void
}

const pitchLabels: Record<PitchChoice, string> = {
  'speeds-up': 'speeds up',
  'slows-down': 'slows down',
  'stays-the-same': 'stays the same',
}

const loudnessLabels: Record<LoudnessChoice, string> = {
  stronger: 'gets stronger (louder)',
  weaker: 'gets weaker',
  'stays-the-same': 'stays the same strength',
}

const timingLabels: Record<TimingChoice, string> = {
  'small-mass': 'the small-mass pair reaches its final moment sooner',
  'large-mass': 'the large-mass pair reaches its final moment sooner',
  'same-time': 'they take the same time',
}

export function GravitationalWaveChirpTutor({
  pitchPrediction,
  loudnessPrediction,
  timingPrediction,
  onExplained,
}: GravitationalWaveChirpTutorProps) {
  const light = chirpRunSummary(PART1_MASS)
  const heavy = chirpRunSummary(REFERENCE_PAIRS[1])
  const swing = firstAndLastSwing(PART1_MASS)
  const checkUp = chirpCheckUp()
  // The same rounded peak sizes as the captions show (four places), so that the ratio agrees with them.
  const r4 = (value: number) => Math.round(value * 1e4) / 1e4
  const peakRatio = swing.firstPeak && swing.lastPeak ? r4(swing.lastPeak.armMove) / r4(swing.firstPeak.armMove) : null
  const f3 = (value: number) => value.toFixed(3)
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
              'Look at the two lines on the graph (Picture 2), at the arms in Picture 1 and at the two bars in Picture 3. What did you notice about how fast the arms wiggled, and how far, as the run went on?'}
            {tutorStep === 'compare' &&
              `On the pictures, the white boxes marked YOUR GUESS 1, 2 and 3 show what you predicted: that the pitch ${pitchLabels[pitchPrediction]}, that the wave ${loudnessLabels[loudnessPrediction]}, and that ${timingLabels[timingPrediction]}. Look at the swings beside marks 1 and 2 on Picture 2, at the bars beside mark 3 on Picture 3, and at Tables 1 to 3 in Part 3. If you have run other masses in Part 2, your guesses are drawn on Drawing B and Drawing C too. What do you notice when you put your guesses next to the real pictures?`}
            {tutorStep === 'conceptual' &&
              'Why would two objects spiraling closer and closer together make the wave both faster and stronger, right up until they meet?'}
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
            <strong>0. Your guesses, marked.</strong> Guess 1 said the pitch {pitchLabels[pitchPrediction]}. In Picture 2 the first swing
            takes about {swing.firstSwingLength.toFixed(2)} time units and one swing at the final moment only about{' '}
            {swing.lastSwingLength.toFixed(2)}, and the frequency in Table 1 goes from {f3(light.startFrequency)} to {f3(light.endFrequency)}, so
            your guess {pitchGuessMatches(pitchPrediction) ? 'matched' : 'did not match'}. Guess 2 said the wave {loudnessLabels[loudnessPrediction]}.
            The amplitude goes from {f3(light.startAmplitude)} to {f3(light.endAmplitude)}
            {peakRatio !== null ? `, and the last peak on the graph is about ${peakRatio.toFixed(1)} times as far from the rest line as the first` : ''}
            , so your guess {loudnessGuessMatches(loudnessPrediction) ? 'matched' : 'did not match'}. Guess 3 said {timingLabels[timingPrediction]}. In
            Picture 3 and Table 3 the heavier pair, mass {REFERENCE_PAIRS[1].toFixed(1)}, reaches its final moment at {f3(heavy.cutoffTime)} against{' '}
            {f3(light.cutoffTime)} for the light pair, mass {PART1_MASS.toFixed(1)}, so your guess{' '}
            {timingGuessMatches(timingPrediction) ? 'matched' : 'did not match'}.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. A real gravitational wave from an inspiraling pair "chirps"</strong> — its
            pitch and loudness both rise as the two objects spiral closer together, right up to
            the final moment, instead of arriving at one steady note.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. This happens because the pair orbits faster as it gets closer
            together</strong> — the same "closer and faster" relationship the Orbits experiment (in
            the Gravity and Curved Spacetime chapter) already showed — and a faster orbit produces a
            faster-oscillating, stronger wave.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. A bigger mass pair follows this same pattern on a shorter timescale</strong>,
            which is why it reaches its final moment sooner than a smaller mass pair. It is also louder
            overall: at its final moment the heavier pair's amplitude is {f3(heavy.endAmplitude)}, against{' '}
            {f3(light.endAmplitude)} for the light pair, while the rise inside each run is the same, {light.rise.toFixed(2)} times.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The exact final moment — the merger — and everything after it aren't
            modeled here</strong>, an idealized cutoff, the same simplification this project
            already gives the turnaround in the twin paradox experiment (in the Relativity of Time and
            Motion chapter). And the mass-to-chirp relationship you
            just saw is a simplified, explicitly-labeled stand-in for the real physics, not the
            actual equations that govern a real inspiral.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. A real chirp's rising shape is exactly how LIGO works out how massive and
            how far away a real source was</strong> — GW150914's real signal rose in frequency
            from {REAL_CHIRP.startHz} hertz to {REAL_CHIRP.endHz} hertz, about {checkUp.realRise.toFixed(0)} times higher, over about two-tenths of a
            second before merging, the same kind of rising "whoop" this experiment models in miniature,
            where the rise is {checkUp.toyRise.toFixed(2)} times.
          </p>
        </div>
      )}
    </div>
  )
}
