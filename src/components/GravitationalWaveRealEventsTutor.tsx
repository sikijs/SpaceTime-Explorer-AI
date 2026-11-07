import { useEffect, useState } from 'react'
import { eventComparison, louderOutcome } from '../physics/gravitationalWaveRealEventsExperiment'
import type { LouderChoice } from '../physics/gravitationalWaveRealEventsExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveRealEventsTutorProps {
  louderPrediction: LouderChoice
  // "Matched" is computed by the physics module (louderGuessMatches), never typed here (CLAUDE.md §9).
  matched: boolean
  // The comparison needs both events to have run; until then the tutor waits after its first question.
  bothDone: boolean
  onExplained?: () => void
}

const louderLabels: Record<LouderChoice, string> = {
  'black-holes': 'the black holes',
  'neutron-stars': 'the neutron stars',
  same: 'that the two would be the same',
}

const outcomeLabels: Record<LouderChoice, string> = {
  'black-holes': 'the black holes (GW150914)',
  'neutron-stars': 'the neutron stars (GW170817)',
  same: 'neither: they came out the same',
}

// Gravitational Waves, Experiment 4's tutor (Part 4), audited to the newer rules
// (docs/audit/gravitational-waves/04-draft-wording.md, section 8). The prompts point to the white YOUR GUESS mark by name and give
// no verdict; the explanation marks the guess, with every number and the "matched" taken from the physics module (CLAUDE.md §9).
// The wording is the owner's, approved on 2026-11-07 as drafted (CLAUDE.md §28.1).
export function GravitationalWaveRealEventsTutor({ louderPrediction, matched, bothDone, onExplained }: GravitationalWaveRealEventsTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')
  const { blackHoles: bh, neutronStars: ns, ratios } = eventComparison()
  const f3 = (value: number) => value.toFixed(3)

  const handleContinue = () => {
    if (responseInput.trim() === '') return

    if (tutorStep === 'observe') {
      setTutorStep('compare')
    } else if (tutorStep === 'compare') {
      setTutorStep('conceptual')
    } else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
    }
    setResponseInput('')
  }

  // The explanation compares the two events, so it is given (and the tutor counts as finished) only once both have run.
  useEffect(() => {
    if (tutorStep === 'explained' && bothDone) onExplained?.()
  }, [tutorStep, bothDone, onExplained])

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

      {tutorStep === 'explained' && !bothDone && (
        <p style={{ marginBottom: 0, fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
          Thank you. The tutor&rsquo;s explanation compares the two events, so it needs both of them. The second event is still playing in Part 1. The
          explanation appears here as soon as it has finished.
        </p>
      )}

      {tutorStep !== 'explained' && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' &&
              "What did you notice about this chirp compared to the ones you ran in the last two experiments?"}
            {tutorStep === 'compare' &&
              `On Picture 2, the white box marked YOUR GUESS shows that you predicted ${louderLabels[louderPrediction]}. Look at the white mark, at Panel A and Panel B, and at the rows "Final loudness" and "Time to reach the final pitch" in Table 1 in Part 3.${bothDone ? '' : ' So far only one event has run, so only one bar is drawn; the second is still playing in Part 1.'} If you have run other masses in Part 2, your guess is drawn on Drawing B too. What do you notice when you put your guess next to the real bars?`}
            {tutorStep === 'conceptual' &&
              'Why would the black holes and the neutron stars produce such different chirps?'}
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

      {tutorStep === 'explained' && bothDone && (
        <div>
          <p style={paragraphStyle}>
            <strong>1. Your guess, marked.</strong> You guessed {louderLabels[louderPrediction]}. Here is what the two runs gave. GW150914 (the black holes, toy mass {bh.mass.toFixed(1)}) reached a final
            loudness of {f3(bh.finalLoudness)} after a run of {f3(bh.runTime)}. GW170817 (the neutron stars, toy mass {ns.mass.toFixed(1)}) reached {f3(ns.finalLoudness)} after a run of {f3(ns.runTime)}. So the
            louder, faster-rising chirp came from {outcomeLabels[louderOutcome()]}, and your guess {matched ? 'matched' : 'did not match'}.{' '}
            {louderPrediction === 'same' &&
              'You guessed that the two would come out the same. In one way they did: both end at the same pitch (see point 3). But the loudness and the time they take are very different, so on the question you were asked they did not come out the same.'}
            {louderPrediction === 'neutron-stars' &&
              'You guessed the neutron stars. It is a natural thought that the lighter, smaller objects might make the sharper chirp, but on this page the bigger mass is what makes the chirp louder and quicker.'}
            {louderPrediction === 'black-holes' &&
              'You guessed the black holes. The reason is the mass: the black holes in this page are far heavier than the neutron stars, and mass is the only thing that differs between the two runs.'}{' '}
            You can see the same comparison on Picture 2 and Table 1, rows &ldquo;Final loudness&rdquo; and &ldquo;Time to reach the final pitch&rdquo;.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why the bigger mass gives a louder, quicker chirp, with the numbers.</strong> This page uses one simple rule for both events. The loudness at the final moment is proportional to
            the mass, and the run lasts 0.9 ÷ the mass. Check it: {bh.mass.toFixed(1)} ÷ {ns.mass.toFixed(1)} = {ratios.mass.toFixed(1)}, so GW150914&rsquo;s loudness should be {ratios.mass.toFixed(1)} times
            GW170817&rsquo;s: {f3(bh.finalLoudness)} ÷ {f3(ns.finalLoudness)} = {ratios.finalLoudness.toFixed(1)}. The run goes the other way: {f3(ns.runTime)} ÷ {f3(bh.runTime)} = {ratios.runTime.toFixed(1)}, so
            GW170817&rsquo;s run lasts about {Math.round(ratios.runTime)} times as long. A daily-life comparison: two swings pushed the same way, one carrying a heavy adult and one a small child. The heavy swing
            carries far more energy, so its effect is bigger, and in this toy model it also finishes its run sooner. (The real signals are different in detail. This page keeps only the rough direction.)
          </p>
          <p style={paragraphStyle}>
            <strong>3. What stayed the same.</strong> Both chirps climb in pitch from {f3(bh.startPitch)} to {f3(bh.finalPitch)}. Both give out the same share of their orbital energy by the final moment: GW150914
            started with {f3(bh.startEnergy)}, had {f3(bh.finalEnergyLeft)} left and radiated {f3(bh.finalEnergyRadiated)}; GW170817 started with {f3(ns.startEnergy)}, had {f3(ns.finalEnergyLeft)} left and radiated{' '}
            {f3(ns.finalEnergyRadiated)}. A tenth is left in both. So the heavier pair does not behave in a different way. It does the same thing, bigger and quicker.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Multi-messenger astronomy.</strong> A gravitational wave is one way to learn about an event. Light is another. GW170817 was seen both ways: a burst of gamma rays reached telescopes about
            1.7 seconds after the wave. A merger of two neutron stars throws out hot, glowing debris (NASA). NASA says merging black holes very likely swallow any matter around them long before they crash, so a
            similar light show is not expected. For GW150914 a faint flash was reported by Fermi, but it was never confirmed, so this page says &ldquo;no confirmed light&rdquo;. Daily-life comparison: hearing a
            thunderclap tells you a storm happened; seeing the lightning too tells you where.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What the light added.</strong> The light let telescopes find the galaxy, NGC 4993, within about half a day. It gave scientists a way to measure the event&rsquo;s distance and its place in the sky that
            the gravitational wave alone could not. That is why seeing one event two ways tells us more than either way alone.
          </p>
          <p style={paragraphStyle}>
            <strong>6. What the pink row in Part 2 showed.</strong> When you ran your own mass, its bars fell between the two real events&rsquo; bars, or beyond them, in the same order as the mass. That is the same rule
            as in point 2, applied to a mass of your choice. The pink row was a trial value. It does not say that a real system has that mass.
          </p>
          <p style={paragraphStyle}>
            <strong>7. What this toy model is, and is not.</strong> It is a simplified stand-in, not a faithful reconstruction of either real signal. The factor of {ratios.mass.toFixed(1)} is the ratio of two made-up
            masses, not a measurement. The real masses are in Table 2 and in the papers linked at the top of the page.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What you learned.</strong> (a) Putting two real events side by side with the same model shows how mass alone changes a chirp&rsquo;s loudness and speed. (b) Both events end at the same pitch and give
            out the same share of their energy, so mass changes the size and the timing, not the kind of chirp. (c) Light and gravitational waves together tell us more about an event than either alone, and only
            some kinds of event give both.
          </p>
        </div>
      )}
    </div>
  )
}
