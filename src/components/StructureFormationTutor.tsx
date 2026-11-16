import { useState } from 'react'
import {
  MATTER_RADIATION_EQUALITY_REDSHIFT,
  RECOMBINATION_REDSHIFT,
  TEXTBOOK_LINEAR_COLLAPSE_THRESHOLD,
  captionNumbers,
  dragRedshiftNote,
  markGrowthGuess,
  markHeadStartGuess,
  startFacts,
} from '../physics/structureFormationExperiment'
import type { GrowthGuess, HeadStartGuess } from '../physics/structureFormationExperiment'
import { partsInLabel } from './StructureFormationPictures'

// Cosmology, Experiment 9, Part 4: the tutor (docs/audit/cosmology/09-draft-wording.md, section 6, approved by the owner on 2026-11-15).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every marking comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface StructureFormationTutorProps {
  predictedGrowth: GrowthGuess
  predictedHeadStart: HeadStartGuess
  onExplained?: () => void
}

const growthLabels: Record<GrowthGuess, string> = {
  ten: 'about 10 times',
  thousand: 'about 1,000 times',
  million: 'about a million times',
}
const headStartLabels: Record<HeadStartGuess, string> = {
  none: 'would make no difference',
  small: 'would make a small difference',
  decides: 'would decide the outcome',
}
const growthMarks: Record<GrowthGuess, string> = {
  ten: 'white tick at 10 on the growth graph',
  thousand: 'white tick at 1,000 on the growth graph',
  million: 'white arrow at the top edge of the growth graph',
}
const headStartMarks: Record<HeadStartGuess, string> = {
  none: 'white ring on the end of the amber line',
  small: 'short white arrow from the end of the amber line',
  decides: 'longer white arrow from the end of the amber line',
}

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const whole = (n: number) => Math.round(n).toLocaleString('en-US')

// The question for each step before the explanation. None of them states an outcome or a verdict (§12, §13).
export function tutorPrompt(step: 'observe' | 'compare' | 'conceptual', growth: GrowthGuess, headStart: HeadStartGuess): string {
  if (step === 'observe')
    return 'Look at the two lines on the growth graph and at your own ripple in Part 2. How many times did the ripple grow? Did the starting size you chose become a clump? Look at your white marks too: where did each one sit against the real lines?'
  if (step === 'compare')
    return `You guessed that a slightly denser region would become ${growthLabels[growth]} denser between the oldest light's release and today (your ${growthMarks[growth]}), and that starting earlier ${headStartLabels[headStart]} (your ${headStartMarks[headStart]}). What do you notice when you compare each white mark with the real lines?`
  return 'Gravity pulls extra matter into a denser region, and the extra matter makes it pull harder. So why does the ripple not grow explosively?'
}

export function StructureFormationTutor({ predictedGrowth, predictedHeadStart, onExplained }: StructureFormationTutorProps) {
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
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>{tutorPrompt(tutorStep, predictedGrowth, predictedHeadStart)}</p>
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

      {tutorStep === 'explained' && <StructureFormationExplanation predictedGrowth={predictedGrowth} predictedHeadStart={predictedHeadStart} />}
    </div>
  )
}

// The explanation, as its own piece so that its marking can be checked for every pair of guesses.
export function StructureFormationExplanation({ predictedGrowth, predictedHeadStart }: { predictedGrowth: GrowthGuess; predictedHeadStart: HeadStartGuess }) {
  const first = markGrowthGuess(predictedGrowth)
  const second = markHeadStartGuess(predictedHeadStart)
  const o = startFacts('ordinary')
  const d = startFacts('ordinary-plus-dark')
  const n = captionNumbers()
  const drag = dragRedshiftNote()
  const sizeRatio = 1 + RECOMBINATION_REDSHIFT
  const ex = second.example
  const secondSentence =
    second.marking === 'partly'
      ? 'That is partly what you guessed: the head start is worth a factor of about 3, and for some starting sizes that factor decides whether a clump forms.'
      : 'That is not what you guessed: the head start does change the result.'
  return (
    <div>
      <p style={paragraph}>
        <strong>1. A small excess pulls in more matter, and so grows.</strong> A region that is slightly denser than average has slightly more gravity, so it draws in matter from around it. With more matter in it, it is denser still.
      </p>
      <p style={paragraph}>
        <strong>2. The expansion works against it.</strong> While this goes on, space is stretching, which spreads matter apart. Working out the two effects together, the result, while matter dominates, is that a ripple grows only in step with the size of the universe: if the universe doubles in size, the ripple doubles. That is why it does not grow explosively. A comparison: a savings account that earns a small interest rate. In any one year the balance barely changes, but over many years it has grown many times over; a ripple does not suddenly explode, it grows steadily, and what matters is how long it has to grow. Like any comparison it is not exact: a ripple&rsquo;s growth is set by how much the universe has expanded, not by a fixed rate.
      </p>
      <p style={paragraph}>
        <strong>3. So the total growth is limited.</strong> You guessed that a region would become {growthLabels[predictedGrowth]} denser (the {growthMarks[predictedGrowth]}). From the oldest light&rsquo;s release to today the universe grew about {whole(sizeRatio)} times in size, so a ripple could grow by at most that factor. With dark energy it grows about {whole(first.ordinaryGrowth)} times, about {Math.round(n.lostToDarkEnergyPercent)}% less, which is nearest to &ldquo;about 1,000 times&rdquo; on a graph where each tick is ten times the one before.{' '}
        <strong>{first.matches ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong> For example, a region that starts at {partsInLabel(ex.startDelta)} (a density excess of {ex.startDelta}) ends at about {ex.startDelta} × {whole(first.ordinaryGrowth)} ≈ {ex.ordinaryExcessToday.toFixed(2)}, which is a little short of the density excess of 1 that counts as a clump.
      </p>
      <p style={paragraph}>
        <strong>4. Dark matter can start gathering earlier.</strong> You guessed that starting earlier {headStartLabels[predictedHeadStart]} (the {headStartMarks[predictedHeadStart]}). NASA/JPL (26 January 2026) says: &ldquo;Scientists think dark matter began to clump together first and that those dark matter clumps then pulled together regular matter.&rdquo; In this model the reason is an assumption: ordinary matter is held smooth by light until the oldest light is released (Cosmology 3), and dark matter (Cosmology 4) does not interact with light, so it can start growing earlier, at redshift about {whole(MATTER_RADIATION_EQUALITY_REDSHIFT)} instead of {RECOMBINATION_REDSHIFT}. That gives it a head start of a factor of about {second.headStartFactor.toFixed(1)} in growth: about {whole(second.darkGrowth)} times against about {whole(second.ordinaryGrowth)}. The same region, starting at {partsInLabel(ex.startDelta)}, would reach about {ex.darkExcessToday.toFixed(2)}: {ex.darkBecameClump ? 'a clump' : 'not a clump'}.{' '}
        <strong>{secondSentence}</strong>
      </p>
      <p style={paragraph}>
        <strong>5. Dark energy slows the growth late on.</strong> As the expansion speeds up (Cosmology 5), it becomes harder for gravity to gather matter, so the growth slows. You can see this as the small gap between each dashed line and its solid line at the end of the growth graph: with no dark energy the growth would be {whole(o.growthWithoutDarkEnergy)} and {whole(d.growthWithoutDarkEnergy)}. We will come back to this in the next experiment.
      </p>
      <p style={paragraph}>
        <strong>6. How big a ripple must start.</strong> Working backward from the growth, a region must start about {partsInLabel(o.requiredStartDelta)} denser to become a clump with ordinary matter, and about {partsInLabel(d.requiredStartDelta)} denser with the head start. The oldest light&rsquo;s ripple is about 1 part in 100,000, but that is a difference in <em>temperature</em>, not in how much denser a region of matter is, and how the two are related depends on the size of the region. No official page read for this experiment says how they differ. So this model does not say whether the real universe had enough, and the real, more detailed story needs physics this experiment does not model.
      </p>
      <p style={paragraph}>
        <strong>7. The honest limits.</strong> This is a simplified picture of one region that is still only slightly denser than average (only the first, simple stage of growth). The starting size is your own illustrative choice, and the dark matter head start is a given real value (Planck 2018 gives 3,387 to 3,407), not something the model works out. The model counts a density excess of 1 as a clump; the usual textbook figure for the linear value at which a region collapses is about {TEXTBOOK_LINEAR_COLLAPSE_THRESHOLD} (for a universe with matter only), so the clump times are approximate. Ordinary matter is released from the light a little later than the oldest light&rsquo;s release (the baryon drag redshift of about {whole(drag.dragRedshift)}, Planck 2018); starting there would trim the growth by about {Math.round(drag.percentLess)} percent. The model also leaves out radiation, as in Cosmology 5, 6 and 8.
      </p>
      <p style={{ ...paragraph, marginBottom: 0 }}>
        <strong>8. Not covered here:</strong> the real shape of the early ripples, how a clump collapses into a galaxy, how galaxies merge into larger groups, and the web-like pattern the galaxies make across the universe.
      </p>
    </div>
  )
}
