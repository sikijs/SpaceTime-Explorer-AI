import { useState } from 'react'
import {
  PREDICTION_KEYS,
  STRENGTH_CAP,
  formatStrength,
  markGuess,
  strengthOf,
  workedNumbers,
  part2Examples,
  SMALL_MASS,
  LARGE_MASS,
  FAR_DISTANCE,
  MEDIUM_DISTANCE,
  MEDIUM_MASS,
} from '../physics/spacetimeCurvatureSourceExperiment'
import type { PredictionChoice, PredictionKey } from '../physics/spacetimeCurvatureSourceExperiment'

// Gravity and Curved Spacetime, Experiment 5's tutor (Part 4), audited to the newer rules (docs/audit/gravity-and-curved-spacetime/
// 05-draft-wording.md, section 9, approved by the owner on 2026-11-12 "all approved"). The prompts point to the four white marks on
// the graphs by name and give no verdict; the explanation marks all four guesses. Every number comes from the physics module
// (CLAUDE.md §9).

const CHOICE_PHRASE: Record<PredictionChoice, string> = {
  stronger: 'get stronger',
  weaker: 'get weaker',
  same: 'stay the same',
}

const pointStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface SpacetimeCurvatureSourceTutorProps {
  predictions: Record<PredictionKey, PredictionChoice>
  onExplained?: () => void
}

export function SpacetimeCurvatureSourceExplanation({ predictions }: { predictions: Record<PredictionKey, PredictionChoice> }) {
  const w = workedNumbers()
  const [mediumMedium, largeMedium, largeClose] = part2Examples()
  const mediumTidal = strengthOf('tidal', MEDIUM_MASS, MEDIUM_DISTANCE)
  const mediumDilation = strengthOf('dilation', MEDIUM_MASS, MEDIUM_DISTANCE)
  const farTidal = strengthOf('tidal', MEDIUM_MASS, FAR_DISTANCE)
  const farDilation = strengthOf('dilation', MEDIUM_MASS, FAR_DISTANCE)
  const massSteps = [SMALL_MASS, MEDIUM_MASS, LARGE_MASS].map((m) => formatStrength(strengthOf('dilation', m, MEDIUM_DISTANCE)))
  return (
    <div>
      <p style={pointStyle}>
        <strong>Your guesses, marked.</strong> {PREDICTION_KEYS.map((key) => markGuess(key, predictions[key]).text).join(' ')}
      </p>
      <p style={pointStyle}>
        <strong>1. Both strengths grow with more mass and less distance, up to the cap.</strong> At Medium mass, moving the mass from Far
        to Close takes the time-dilation strength from {formatStrength(w.farDilation)} to {formatStrength(w.closeDilation)}, and the tidal
        strength from {formatStrength(w.farTidal)} to {formatStrength(w.closeTidal)}. A bigger mass at Medium distance takes both from
        {' '}{massSteps[0]} to {massSteps[2]}. The page keeps every strength at or below {STRENGTH_CAP}, so a line goes flat where it
        reaches that cap, for example the tidal strength at Close distance, whatever the mass. Flat there means &ldquo;capped&rdquo;, not
        &ldquo;no effect&rdquo;.
      </p>
      <p style={pointStyle}>
        <strong>2. A bigger mass raises both strengths in the same proportion.</strong> At Medium distance, going from Small (1) to
        Medium (2) to Large (4) takes the time-dilation strength through {massSteps.join(', ')}, and the tidal strength through the very
        same three numbers: each time the mass doubles, each strength doubles. (That the two lines lie exactly on top of each other at
        Medium distance is because the page&rsquo;s constants were chosen so that Medium mass at Medium distance gives {formatStrength(mediumMedium.dilationStrength)}{' '}
        for both, as Experiments 2 and 3 each opened on.) Think of the trampoline: a bowling ball twice as heavy makes a dent twice as
        deep, and both the clocks and the balls feel the same deeper dent.
      </p>
      <p style={pointStyle}>
        <strong>3. Distance does not treat the two strengths alike.</strong> In this page&rsquo;s model, the time-dilation strength follows
        mass ÷ distance, and the tidal strength follows mass ÷ distance cubed, so the tidal effect is much more sensitive to distance. At
        Medium mass, going from Medium distance ({MEDIUM_DISTANCE}) to Far ({FAR_DISTANCE}) halves the time-dilation strength,{' '}
        {formatStrength(mediumDilation)} to {formatStrength(farDilation)}, but cuts the tidal strength by a factor of eight,{' '}
        {formatStrength(mediumTidal)} to {formatStrength(farTidal)}. A picture from everyday life: stand next to a loud speaker and the
        sound is much louder at your near ear than at your far ear; stand across the room and the two ears hear almost the same. The tidal
        effect is exactly that kind of <em>difference</em>, the difference in pull between the two balls&rsquo; places in Experiment 3,
        and a difference across a fixed gap shrinks away faster than the pull itself as you move off. Time dilation depends instead on
        how deep you sit in the dent, which fades more slowly with distance. Both always get stronger together as the mass moves in,
        but not in lockstep.
      </p>
      <p style={pointStyle}>
        <strong>4. The cap, and why it is there.</strong> Experiments 2 and 3 can only accept strengths between 0 and 1, and this page
        keeps them at or below {STRENGTH_CAP}. Where a formula would give more, the page uses {STRENGTH_CAP} instead. At Large mass and
        Close distance the formulas give {w.largeCloseDilationFormula.toFixed(1)} and {w.largeCloseTidalFormula.toFixed(1)}, but both
        strengths are held at {formatStrength(largeClose.dilationStrength)}: the ceiling clock then ticks{' '}
        {largeClose.ceilingTicksPerFloorTick.toFixed(2)} times for every floor tick, and the two balls land only{' '}
        {largeClose.planetLandingSeparation.toFixed(3)} m apart. At Close distance the tidal strength is {formatStrength(w.closeTidal)} for
        every mass, so changing the mass there shows no change in the tidal effect on this page: that is the cap, not the real effect
        stopping. At Medium mass and Medium distance nothing is capped, and the ceiling clock ticks{' '}
        {mediumMedium.ceilingTicksPerFloorTick.toFixed(2)} times per floor tick while the balls land {mediumMedium.planetLandingSeparation.toFixed(3)} m
        apart; at Large mass and Medium distance it is {largeMedium.ceilingTicksPerFloorTick.toFixed(2)} and{' '}
        {largeMedium.planetLandingSeparation.toFixed(3)} m.
      </p>
      <p style={pointStyle}>
        <strong>5. Both are consequences of one thing: how curved spacetime is at that location.</strong> Experiment 2&rsquo;s redshift
        and Experiment 3&rsquo;s tidal drift aren&rsquo;t two separate phenomena that happen to both involve gravity &mdash; they&rsquo;re
        two different things you can measure about the same underlying curvature. More mass curves spacetime more, and moving closer to
        the mass puts you where the curvature is stronger. Different measurements of that same curvature need not scale the same way with
        distance, which is exactly what point 3 showed.
      </p>
      <p style={pointStyle}>
        <strong>6. So where did the &ldquo;strength&rdquo; numbers of Experiments 2 and 3 come from?</strong> They were standing in for a
        mass at a distance all along. Both experiments opened on a strength of {formatStrength(mediumMedium.dilationStrength)}; here that
        is Medium mass at Medium distance. Choosing a different strength there was like choosing a different mass or a different
        distance here, and the clocks and balls responded exactly as they do in Part 2.
      </p>
      <p style={pointStyle}>
        <strong>7. This connects back to Experiment 4 (curved spacetime).</strong> The same curved spacetime that bent the two
        travelers&rsquo; paths together on the sphere is what&rsquo;s doing both jobs here: stretching light signals between the floor and
        ceiling clocks, and pulling the two falling balls together. Different symptoms, same underlying cause.
      </p>
      <p style={pointStyle}>
        <strong>A note on how real these numbers are.</strong> The step from a mass and a distance to the two strengths is a further
        simplification on top of Experiments 2 and 3: its constants (0.3 and 1.2) were chosen so that Medium and Medium match the earlier
        experiments, not measured, and the mass and distance are relative presets, not kilograms or metres. With a real star at a real
        distance, both effects are far too small to see. What this page does show correctly is the pattern: more mass and less distance
        mean more of both effects, and the tidal effect depends on distance much more strongly than time dilation does.
      </p>
      <p style={{ ...pointStyle, marginBottom: 0 }}>
        Try other masses and distances in Part 2 to see the same thing: whatever you choose, a bigger mass and a closer mass raise both
        strengths until they reach the cap of {STRENGTH_CAP}.
      </p>
    </div>
  )
}

export function SpacetimeCurvatureSourceTutor({ predictions, onExplained }: SpacetimeCurvatureSourceTutorProps) {
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
              'Look at the four graphs. Each has one line, a solid indigo one for the time-dilation strength and a dashed amber one for the tidal strength. When the mass moved closer, which strength changed more? Your four guesses are the white marks at the right-hand ends of the lines.'}
            {tutorStep === 'compare' &&
              `You guessed that moving the mass closer would make the time-dilation effect ${CHOICE_PHRASE[predictions.closerDilation]} and the tidal effect ${CHOICE_PHRASE[predictions.closerTidal]}, and that a bigger mass would make the time-dilation effect ${CHOICE_PHRASE[predictions.biggerDilation]} and the tidal effect ${CHOICE_PHRASE[predictions.biggerTidal]}. Those are the four white marks. Look at the graphs again: what do you notice when you compare what you expected with what was drawn?`}
            {tutorStep === 'conceptual' &&
              'Both effects come from the same mass at the same distance. Why might they not grow at exactly the same rate?'}
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

      {tutorStep === 'explained' && <SpacetimeCurvatureSourceExplanation predictions={predictions} />}
    </div>
  )
}
