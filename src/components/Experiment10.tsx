import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { runTwinParadoxExperiment, twinWorkedNumbers } from '../physics/twinParadoxExperiment'
import type { TwinOutcome, TwinParadoxResult } from '../physics/twinParadoxExperiment'
import { Experiment10Tutor } from './Experiment10Tutor'
import {
  Block,
  GuessTag,
  TwinBars,
  TwinBarsCaption,
  WhereFrom,
  outcomeLabels,
  paragraph,
  smallNote,
} from './Experiment10Pictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'

// Relativity of Time and Motion, Experiment 10 (the twin paradox), audited to the newer rules
// (docs/audit/relativity-of-time-and-motion/10-draft-wording.md, approved by the owner on 2026-11-11): the page in four Parts,
// two clock bars that grow during a Run with a white YOUR GUESS marker, Part 2 for the learner's own speed (pink), captions, a
// words box, links held until after the tutor, Start over and a tutor that marks the guess. Every number comes from the
// physics module (src/physics/twinParadoxExperiment.ts; CLAUDE.md §9). The wording is the owner's to approve line by line
// (CLAUDE.md §28.1).

// Part 1 uses these fixed settings; Part 2 lets the learner choose another speed.
export const PART1_VELOCITY = 0.5
export const DISTANCE_LIGHT_SECONDS = 2
const SPEED_PRESETS = [0.1, 0.3, 0.5, 0.8] as const
const MIN_CUSTOM_SPEED = 0.01
const MAX_SPEED = 0.9
const ANIMATION_MS = 4000

type SpeedOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

const choices: TwinOutcome[] = ['sameAge', 'earthOlder', 'travelerOlder']

// The trip's playback: only presentation. The result comes from the physics module and never depends on this.
function useTripRunner(onFinish?: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [fraction, setFraction] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // A frame's timestamp can be a hair earlier than the moment the run began, so progress is never allowed below 0.
      const progress = Math.min(Math.max((now - startTime) / ANIMATION_MS, 0), 1)
      setFraction(progress)
      if (progress >= 1) {
        setStatus('complete')
        finishRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status])

  const start = useCallback(() => {
    setFraction(0)
    setStatus('running')
  }, [])
  const reset = useCallback(() => {
    setStatus('idle')
    setFraction(0)
  }, [])
  return { status, fraction, start, reset }
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages fetched on 11 November 2026 through helper agents (see the audit's draft wording, section 10). Every page states which
// twin is younger, so the list carries a spoiler warning; the owner chose on 2026-11-11 to show them from the start (CLAUDE.md
// §12, §29 rule 3). No plain official page was found for
// "light-second"; the Fermilab pages and the Hafele and Keating papers could not be read (HTTP 403) and are not linked
// (CLAUDE.md §29 rule 3(c)).
const LINKS = [
  {
    href: 'https://www.einstein-online.info/en/spotlight/twins/',
    label: 'Einstein Online: "The case of the travelling twins"',
    what: 'why the traveling twin is younger and why that is not really a paradox, in plain words with no equations. (Markus Pössel, Max Planck Institute for Gravitational Physics, 2010.)',
  },
  {
    href: 'https://www.einstein-online.info/en/spotlight/twinsroad/',
    label: 'Einstein Online: "Twins on the road"',
    what: 'a walking-trip comparison that shows why the traveling twin’s turnaround does not itself slow time. (Same author and publisher, 2010.)',
  },
]

const round3 = (n: number) => parseFloat(n.toFixed(3))

// The "Words and formulas" box. The examples use 0.4c and 0.6c, never the Part 1 speed, so the box gives no answer to the
// guess (CLAUDE.md §12). Numbers come from the physics module (CLAUDE.md §9).
function referenceEntries(): { term: string; meaning: string }[] {
  const a = twinWorkedNumbers(DISTANCE_LIGHT_SECONDS, 0.4)
  const b = twinWorkedNumbers(DISTANCE_LIGHT_SECONDS, 0.6)
  const half = twinWorkedNumbers(DISTANCE_LIGHT_SECONDS, PART1_VELOCITY)
  return [
    { term: 'Twin paradox', meaning: 'the puzzle that arises when you use “a moving clock runs slow” for both twins at once.' },
    { term: 'Elapsed time / age', meaning: 'how much time a clock, or a person, has lived through since the start.' },
    { term: 'Earth twin / traveling twin', meaning: 'the twin who stays home, and the twin who goes away and comes back.' },
    { term: 'Round trip', meaning: `out to a point ${DISTANCE_LIGHT_SECONDS} light-seconds away and back.` },
    { term: 'Turnaround', meaning: 'the moment the traveling twin reverses direction. Here it is treated as instant.' },
    { term: 'Constant speed', meaning: 'not speeding up or slowing down.' },
    { term: 'Acceleration', meaning: 'any change of speed or direction. You feel it as a push, like a car braking.' },
    { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 km.' },
    { term: 'c', meaning: 'the speed of light, about 300,000 km every second. 0.5c is half of that.' },
    {
      term: 'Time dilation factor',
      meaning: `how much slower a moving clock ticks than the lab’s, as a fraction (from “The moving clock”). At ${PART1_VELOCITY}c it is ${half.factor.toFixed(3)}, so the moving clock ticks ${half.factor.toFixed(3)} as fast.`,
    },
    {
      term: 'Formula 1: the Earth twin’s trip time',
      meaning: `2 × distance ÷ speed. Example (distance ${DISTANCE_LIGHT_SECONDS} light-seconds, speed 0.4c): 2 × ${DISTANCE_LIGHT_SECONDS} ÷ 0.4 = ${round3(a.roundTripLabTime)} s.`,
    },
    {
      term: 'Formula 2: the traveling twin’s time',
      meaning: `the Earth twin’s time × √(1 − speed²). Example at 0.6c: 1 − 0.6² = ${round3(b.oneMinusVSquared)}, √${round3(b.oneMinusVSquared)} = ${b.factor.toFixed(1)}, so a ${round3(b.roundTripLabTime)} s trip reads ${round3(b.roundTripLabTime)} × ${b.factor.toFixed(1)} = ${round3(b.travelerElapsedTime)} s.`,
    },
  ]
}

interface Experiment10Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment10({ onComplete, onTutorComplete }: Experiment10Props) {
  const [predictionOutcome, setPredictionOutcome] = useState<TwinOutcome | null>(null)
  const [submitted, setSubmitted] = useState<TwinOutcome | null>(null)
  const [velocity, setVelocity] = useState<SpeedOption>(0.8)
  const [customVelocity, setCustomVelocity] = useState('')
  const [part2Runs, setPart2Runs] = useState<TwinParadoxResult[]>([])
  const [part2Result, setPart2Result] = useState<TwinParadoxResult | null>(null)
  const part1 = useTripRunner(onComplete)
  const part2 = useTripRunner()

  const part1Result = runTwinParadoxExperiment(DISTANCE_LIGHT_SECONDS, PART1_VELOCITY)
  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const locked = submitted !== null

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) : velocity
  const speedValid = isFinite(selectedVelocity) && selectedVelocity >= MIN_CUSTOM_SPEED && selectedVelocity <= MAX_SPEED
  const speedText = speedValid ? `${selectedVelocity}c` : '—'

  const hasAnythingToClear = predictionOutcome !== null || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleRun = () => {
    if (predictionOutcome === null || locked) return
    setSubmitted(predictionOutcome)
    part1.start()
  }

  const handleRunPart2 = () => {
    if (!speedValid || part1Running || part2Running) return
    setPart2Result(runTwinParadoxExperiment(DISTANCE_LIGHT_SECONDS, selectedVelocity))
    part2.start()
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done && part2Result) {
      setPart2Runs((runs) => [...runs, part2Result])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPredictionOutcome(null)
    setSubmitted(null)
    setVelocity(0.8)
    setCustomVelocity('')
    setPart2Runs([])
    setPart2Result(null)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const choiceText = (c: TwinOutcome) => outcomeLabels[c].toLowerCase()

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 10 — The Twin Paradox</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Imagine two twins, the same age. One of them boards a spaceship and travels away from Earth
            at a very high speed, turns around, and comes back. The other twin just stays home. When the traveling twin gets back,
            are they still the same age?
          </p>
          <p style={paragraph}>
            <strong>Why this seems like it shouldn&rsquo;t matter.</strong> You already know, from &ldquo;The moving clock&rdquo;,
            that a moving clock ticks slower than a clock that isn&rsquo;t moving. So it seems easy: the traveling twin&rsquo;s clock
            is the one that&rsquo;s moving, so they come back younger. But here&rsquo;s the catch — motion is relative. While the
            ship is cruising at a constant speed, the twin on the ship could just as fairly say <em>they&rsquo;re</em> holding still
            and it&rsquo;s the Earth twin who is moving away and coming back. By that reasoning, the Earth twin should be the younger
            one instead. Both arguments can&rsquo;t be right at the same time. This is called <strong>the twin paradox</strong>, and
            it isn&rsquo;t really a paradox — it&rsquo;s a puzzle with a definite answer, and this chapter shows you why.
          </p>
          <p style={paragraph}>
            <strong>What breaks the tie.</strong> There&rsquo;s one thing that isn&rsquo;t the same for both twins: only the traveling
            twin turns around. The Earth twin stays put the whole time. That difference — not just &ldquo;who is moving,&rdquo; but
            who changes direction — is what settles the question, and you&rsquo;re about to see it happen.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>A daily-life picture: what you can feel, and what you can&rsquo;t.</strong>
          </p>
          <p style={paragraph}>
            <strong>Steady motion can&rsquo;t be felt.</strong> Think of a smooth train or a plane cruising at a steady speed. With
            your eyes closed you feel nothing. A cup of coffee sits still on the table. You couldn&rsquo;t say whether you are moving
            at 500 miles an hour or parked. That is why either twin can fairly say &ldquo;I&rsquo;m the one standing still&rdquo;:
            while a twin moves at a steady speed, nothing in their body can tell them otherwise.
          </p>
          <p style={paragraph}>
            <strong>A change of speed or direction can be felt.</strong> Now think of a car. When it brakes hard, you are thrown
            forward. When it speeds up, you are pushed back into your seat. When it takes a sharp turn, you are pushed sideways. The
            coffee cup slides. You feel all of this with your eyes closed, and so does everyone else in the car. Any change of speed
            or direction is called <strong>acceleration</strong>, and the push you feel is what acceleration feels like.
          </p>
          <p style={paragraph}>
            <strong>Now the twins.</strong> The traveling twin reaches the far point and turns around. A turnaround is a change of
            direction, so the traveling twin feels exactly that kind of push. The twin who stays home never feels anything like it,
            the whole trip. (We treat the turnaround as instant. A real one would be a strong push, and nobody would miss it.)
          </p>
          <p style={paragraph}>
            <strong>Why this matters.</strong> &ldquo;Who is moving?&rdquo; can be answered either way, depending on whom you pick as
            the one standing still. &ldquo;Who felt a push?&rdquo; has only one answer: the traveling twin. Both twins agree on it,
            and so does everyone watching. That felt push is a real, physical mark that the two twins&rsquo; paths are not the same.
            It isn&rsquo;t just a matter of whichever twin you personally choose to call &ldquo;moving.&rdquo;
          </p>
          <p style={paragraph}>
            <strong>A familiar version.</strong> Two friends start at the same corner. One stands there all day. The other walks to
            the store and back. Both can say &ldquo;I was moving at some point,&rdquo; but only one of them turned around and came
            back, and everyone agrees on that.
          </p>
          <p style={paragraph}>
            <strong>What the push is not.</strong> The push is not what makes a clock run slow. It is a sign that the two twins&rsquo;
            situations differ. What that difference does to their ages is what you are about to find out. The tutor explains how, after your run.
          </p>
          <p style={paragraph}>
            <strong>Distances and speeds.</strong> Distances here are in <strong>light-seconds</strong>. A light-second is how far
            light travels in one second, about 300,000 km. The trip goes {DISTANCE_LIGHT_SECONDS} light-seconds out and{' '}
            {DISTANCE_LIGHT_SECONDS} back. <strong>c</strong> is the speed of light, so 0.5c is half of it.
          </p>
          <p style={paragraph}>
            <strong>What you&rsquo;re about to do.</strong> Before the trip, make one guess: when the twins are back together, will
            they be the same age, will the Earth twin be older, or will the traveling twin be older? Guesses are not scored. Press{' '}
            <strong>Run</strong> and two bars grow, one for each twin&rsquo;s clock, until the trip ends. Your guess is then shown
            beside them in white. Then you can try other speeds in Part 2 and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real picture.</strong> Your guess never changes the real bars or the numbers: they come from a
            calculation that knows nothing about what you guessed. Your guess has no size (it is only &ldquo;same&rdquo;, &ldquo;Earth
            older&rdquo; or &ldquo;traveling older&rdquo;), so it is drawn as a white <strong>marker</strong> in a box labelled YOUR
            GUESS: a level mark for &ldquo;same&rdquo;, or an arrow pointing at the older twin&rsquo;s bar. The marker is only a
            marker, not the size of the real gap. It is shown again beside the results. In Part 2 the speed does change the drawings,
            and your speed is written in pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one: twin paradox, elapsed time,
            age, Earth twin, traveling twin, round trip, constant speed, turnaround, acceleration, time dilation factor, light-second,
            c, and two formulas.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: '0.25rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There&rsquo;s no gravity involved — just steady motion (same as &ldquo;The moving clock&rdquo; and the chapters after it).</li>
            <li>The ship travels at a constant speed on the way out, and the same constant speed on the way back.</li>
            <li>
              We treat the ship&rsquo;s turnaround as instantaneous — happening all at once, rather than gradually slowing down and
              speeding back up. What actually happens during that quick turnaround isn&rsquo;t part of this experiment; we only look
              at before and after it.
            </li>
            <li>Both twins start at exactly the same age when the ship departs.</li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plain-language pages from an official source. Checked on 11 November 2026. Links open
            in a new tab. <strong>Spoiler warning:</strong> both pages give the answer to the question in Part 1, so read them after
            you have made your guess.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you make one guess about the twins&rsquo; ages when they meet again, for a trip at {PART1_VELOCITY}c. Then you press
          Run and watch the two clocks grow. Your guess is shown beside them in white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Two twins start at the same age. One stays on Earth. The other travels away at {PART1_VELOCITY}c, turns around, and comes
            back at the same speed. When they&rsquo;re back together, comparing the same two clocks: are they the same age, is the
            Earth twin older, or is the traveling twin older?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => setPredictionOutcome(choice)}
                disabled={locked}
                className={`toggle-button${predictionOutcome === choice ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: locked ? 0.6 : 1 }}
              >
                {outcomeLabels[choice]}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {locked
              ? `Your prediction: ${choiceText(submitted as TwinOutcome)}. Your prediction is locked while you try other settings. To change it, press Start over.`
              : predictionOutcome !== null
                ? `Your prediction: ${choiceText(predictionOutcome)}.`
                : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={part1Running || part2Running || locked || predictionOutcome === null}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Running...' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{
            marginLeft: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            cursor: startOverDisabled ? 'not-allowed' : 'pointer',
            opacity: startOverDisabled ? 0.5 : 1,
          }}
        >
          Start over
        </button>
        {predictionOutcome === null && !locked && <p style={smallNote}>Choose a prediction above to press Run.</p>}

        <Block>
          <TwinBars
            result={part1Result}
            fraction={part1.fraction}
            guess={submitted}
            pink={false}
            label={`The two clocks during the trip at ${PART1_VELOCITY}c: the Earth twin's clock in blue and the traveling twin's clock in purple, growing together${part1Done ? ', with the gap between their readings shown and your guess marked in white' : ''}.`}
          />
          <p style={{ ...smallNote, textAlign: 'center' }}>
            {part1Running
              ? 'The trip is running... the bars grow together.'
              : part1Done
                ? 'Playback time: the trip is played much faster than real time. Playback speed never changes the numbers.'
                : 'The bars grow when you press Run.'}
          </p>
          <WhereFrom>
            <strong>Measured:</strong> nothing on this page. <strong>Calculated here:</strong> both bars, from the speed of light, a
            trip of {DISTANCE_LIGHT_SECONDS} light-seconds each way, and the moving-clock rule of &ldquo;The moving clock&rdquo;.{' '}
            <strong>Imagined for the question:</strong> the journey itself; nobody has made it. The white marker is only your guess.
          </WhereFrom>
          <TwinBarsCaption name="this diagram" result={part1Result} stage={part1Done ? 'done' : 'before'} guesses pink={false} />
        </Block>

        {!part1Done && (
          <p style={smallNote}>
            {part1Running
              ? 'The trip is running... Parts 2, 3 and 4 appear when the bars have stopped.'
              : 'Parts 2, 3 and 4 appear below when the first trip has finished.'}
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a speed from 0.1c to 0.9c and run the trip again. Your speed changes the drawing in this Part, written in
              pink. It does not change Part 1, the results in Part 3, or your guess.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Traveler&rsquo;s speed</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Speeds are given as a fraction of <strong>c</strong>, the speed of light. The one-way distance is fixed at{' '}
                {DISTANCE_LIGHT_SECONDS} light-seconds. There is no 0c choice: a twin at rest would never reach the far point, so the
                round trip would never end.
              </p>
              <div style={{ marginBottom: '0.75rem' }}>
                {SPEED_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setVelocity(preset)}
                    disabled={part2Running}
                    className={`toggle-button${velocity === preset ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {preset}c
                  </button>
                ))}
                <button
                  onClick={() => setVelocity('other')}
                  disabled={part2Running}
                  className={`toggle-button${velocity === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {velocity === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min={MIN_CUSTOM_SPEED}
                    max={MAX_SPEED}
                    step="0.01"
                    value={customVelocity}
                    onChange={(e) => setCustomVelocity(e.target.value)}
                    disabled={part2Running}
                    placeholder={`Fraction of c (${MIN_CUSTOM_SPEED}-${MAX_SPEED})`}
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected speed: <strong>{speedText}</strong>
              </p>
              <p style={smallNote}>Your guess does not change the drawing or the tables, but this speed does.</p>
              <button
                type="button"
                onClick={handleRunPart2}
                disabled={!speedValid || part2Running || part1Running}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Running...' : 'Run your speed'}
              </button>
            </div>

            {part2Running && part2Result && (
              <Block>
                <TwinBars
                  result={part2Result}
                  fraction={part2.fraction}
                  guess={null}
                  pink
                  label={`The two clocks at your speed, ${part2Result.velocity}c, growing together.`}
                />
              </Block>
            )}

            {lastPart2 && !part2Running ? (
              <Block>
                <TwinBars
                  result={lastPart2}
                  fraction={1}
                  guess={null}
                  pink
                  label={`The two clocks at your speed, ${lastPart2.velocity}c: the Earth twin's clock read ${lastPart2.labElapsedTime.toFixed(3)} seconds and the traveling twin's ${lastPart2.travelerElapsedTime.toFixed(3)} seconds.`}
                />
                <WhereFrom>
                  <strong>Measured:</strong> nothing on this page. <strong>Calculated here:</strong> both bars, from the speed you
                  chose. <strong>Imagined for the question:</strong> the journey itself. At low speeds the gap is a thin sliver of the
                  bar, so read its number, not its length.
                </WhereFrom>
                <TwinBarsCaption name="the diagram at your speed" result={lastPart2} stage="done" guesses={false} pink />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.velocity}c: Earth twin {run.labElapsedTime.toFixed(3)} s, traveling twin {run.travelerElapsedTime.toFixed(3)} s,
                      gap {run.ageDifference.toFixed(3)} s
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              !part2Running && (
                <p style={smallNote}>
                  Not run yet. Choose a speed and press Run your speed; the drawing for it will appear here.
                </p>
              )
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the two clock readings and the gap from the Part 1 run, with your guess beside them. Nothing here changes with
              your guess or with the speed in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Traveler&rsquo;s speed:</strong> {part1Result.velocity}c
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>One-way distance:</strong> {part1Result.distance} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                <em>What this table tells us.</em> These set up the trip. The distance is fixed so that only the speed changes.
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Earth twin&rsquo;s elapsed time:</strong> {part1Result.labElapsedTime.toFixed(3)} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Traveling twin&rsquo;s elapsed time:</strong> {part1Result.travelerElapsedTime.toFixed(3)} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>The gap (Earth twin&rsquo;s time minus traveling twin&rsquo;s):</strong> {part1Result.ageDifference.toFixed(3)}{' '}
                seconds
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess is drawn on Part 1&rsquo;s bars as the white marker.
                </span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Time dilation factor:</strong> {part1Result.timeDilationFactor.toFixed(3)}
              </p>
            </div>

            <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You guessed:</strong> {choiceText(submitted)}.
              </p>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>What these results tell us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The two clocks.</strong> These are the two bar ends: {part1Result.labElapsedTime.toFixed(3)} s and{' '}
                  {part1Result.travelerElapsedTime.toFixed(3)} s, what each clock counted over the whole trip.{' '}
                  <em>Why it matters:</em> both twins can read them when they meet again.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The gap.</strong> A gap above zero means the two clocks differ. {part1Result.ageDifference.toFixed(3)} s is
                  small, but it grows with speed: {runTwinParadoxExperiment(DISTANCE_LIGHT_SECONDS, 0.8).ageDifference.toFixed(3)} s at
                  0.8c. <em>Why it matters:</em> it is the size of the effect, and Part 2 lets you see it change.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The time dilation factor.</strong> {part1Result.timeDilationFactor.toFixed(3)} means the traveling
                  twin&rsquo;s clock counted {part1Result.timeDilationFactor.toFixed(3)} of every second the Earth twin&rsquo;s clock
                  counted: {part1Result.labElapsedTime.toFixed(3)} × {part1Result.timeDilationFactor.toFixed(3)} ={' '}
                  {part1Result.travelerElapsedTime.toFixed(3)}. It is the factor from &ldquo;The moving clock&rdquo;.{' '}
                  <em>Why it matters:</em> the whole result is this one factor applied over the trip.
                </li>
              </ul>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the speed and the trip&rsquo;s length (see the caption under
              the bars). Nothing here changes with your guess or with the speed in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your white marker and the two bars, then explains.
            </PartHeader>
            <Experiment10Tutor
              key={`${PART1_VELOCITY}-${submitted}`}
              result={part1Result}
              guess={submitted}
              onExplained={onTutorComplete}
            />
          </>
        )}
      </div>
    </div>
  )
}
