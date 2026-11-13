import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ALTITUDE_MAX_KM,
  ALTITUDE_MIN_KM,
  ALTITUDE_STEP_KM,
  DEFAULT_ALTITUDE_KM,
  ORBIT_PRESETS_KM,
  orbitSummary,
} from '../physics/gpsTimeDilationExperiment'
import type { MoreLessSameChoice, YesNoChoice } from '../physics/gpsTimeDilationExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import {
  EffectGraph,
  ORBIT_ALTITUDE,
  ORBIT_KEYS,
  OrbitDrawing,
  Part1DrawingCaption,
  Part1GraphCaption,
  Part2DrawingCaption,
  Part2GraphCaption,
  signed,
} from './GpsTimeDilationPictures'
import type { OrbitKey } from './GpsTimeDilationPictures'
import { GpsTimeDilationResults } from './GpsTimeDilationResults'
import { GpsTimeDilationTutor } from './GpsTimeDilationTutor'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 9, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/09-draft-wording.md,
// approved by the owner on 2026-11-13). Every number comes from the physics module; this file only draws and words it. The closing
// synthesis at the bottom is unchanged except for its cross-references (draft, section 9).

interface GpsTimeDilationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const PART1_BUTTONS: Record<OrbitKey, string> = {
  iss: 'A low orbit (the International Space Station, about 400 km)',
  gps: 'A GPS orbit (about 20,200 km)',
  geostationary: 'A very high orbit (geostationary, about 35,786 km)',
}
const SHORT_NAME: Record<OrbitKey, string> = { iss: 'ISS orbit', gps: 'GPS orbit', geostationary: 'Geostationary orbit' }

// One run is a fixed real duration (the satellite goes once round its ring); it does not change any number (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 1800

const fmtKm = (km: number) => `${Math.round(km).toLocaleString('en-US')} km`

// ---- the introduction (no answers: §12) ----
function Intro() {
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>The question.</strong> A GPS satellite carries a very accurate clock. A tiny error in that clock turns into a real error in where your phone thinks you are. Earlier you met two things that change how fast a clock ticks. In &ldquo;Relativity of Time and
        Motion&rdquo; (Experiments 3 and 4), moving changed a clock&rsquo;s rate. In this group&rsquo;s Experiment 2, height in a gravitational field changed it. A satellite is moving <em>and</em> high up at the same time. So what happens to its clock, compared with a clock on the
        ground?
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>A daily-life picture.</strong> Think of a bank account where a deposit and a withdrawal both happen on the same day. The balance at the end of the day depends on how big each one is, not on the fact that there were two. A satellite&rsquo;s clock has two changes happening at
        once, and what we want to know is how big each one is, and what they add up to.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>What happens.</strong> You will guess three things. Then you will see three real satellite orbits (a low one, a GPS one and a very high one), and a graph will fill in. For each orbit we calculate the satellite&rsquo;s real speed, as in this group&rsquo;s Experiment 6, and
        from it two effects on its clock, using real numbers for Earth. Then you can choose an altitude of your own.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>Your job.</strong> Guess first. Then watch the three orbits, and see what the graph shows. Then try an altitude of your own and compare.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or the numbers. They are drawn on the pictures in white, in a box marked YOUR GUESS, and shown again beside the results. The altitude you choose in Part 2 does change the
        drawing and the graph, because it is a real setting. Your guesses do not.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Words first.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li><strong>Altitude</strong>: how high above Earth&rsquo;s surface the satellite is, in kilometres (km).</li>
        <li><strong>Orbital speed</strong>: how fast the satellite moves along its orbit. It is found from the altitude, as in this group&rsquo;s Experiment 6.</li>
        <li><strong>A microsecond (µs)</strong>: one millionth of a second. 38 µs is 38 millionths of a second.</li>
        <li>
          <strong>µs/day</strong>: how many microseconds a clock gains or loses in one day compared with a ground clock. A plus sign means it gains (runs fast); a minus sign means it loses (runs slow).
        </li>
        <li>
          <strong>Geostationary orbit</strong>: an orbit so high that the satellite goes round Earth once in about one day, the same time Earth takes to spin once. The two keep pace, so to someone on the ground the satellite looks fixed in the sky, above the same spot on the
          equator.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>Both effects use the same simple first-order formulas as in the earlier experiments: accurate to very high precision for a real satellite, but not the full general relativity formula.</li>
        <li>
          The orbit is treated as exactly circular and Earth as a perfect, non-spinning ball, and the ground clock sits on Earth&rsquo;s surface at its average radius. A few smaller real GPS corrections (Earth&rsquo;s spin, the orbit&rsquo;s slight oval shape and others) are left out.
        </li>
        <li>The numbers are real, not made-up: Earth&rsquo;s real mass and size and the real speed of light.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each term with a short meaning.
      </p>
    </div>
  )
}

// ---- the words box ----
function referenceEntries(firstDone: boolean, explained: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Altitude', meaning: 'height above Earth’s surface, in km.' },
    {
      term: 'Orbit and satellite',
      meaning: 'an orbit is the path a satellite follows around Earth. It keeps falling toward Earth but moves sideways fast enough never to hit it (NASA Space Place).',
    },
    { term: 'Orbital speed', meaning: 'how fast the satellite moves along its orbit.' },
    { term: 'Microsecond (µs)', meaning: 'one millionth of a second.' },
    { term: 'µs/day', meaning: 'microseconds gained (+) or lost (−) by the satellite’s clock in one day, compared with a ground clock.' },
    {
      term: 'Geostationary orbit',
      meaning: 'an orbit at about 35,786 km where a satellite goes round Earth once in about one day, the same time Earth takes to spin once. The two keep pace, so to someone on the ground the satellite looks fixed in the sky, above the same spot on the equator.',
    },
    {
      term: 'GPS',
      meaning: 'the Global Positioning System: a set of satellites with accurate clocks, orbiting at about 20,200 km, used to find positions on the ground.',
    },
    {
      term: 'Weak-field, first-order formulas',
      meaning: 'simple formulas that are accurate when the effect is tiny, as it is for a real satellite.',
    },
  ]
  if (firstDone) {
    entries.push({
      term: 'Orbital speed formula',
      meaning:
        'v = √(GM ÷ r), where GM is Earth’s gravitational parameter (3.986 × 10¹⁴ m³/s²) and r is the distance from Earth’s centre. At the GPS orbit r = 6,371 km + 20,200 km = 26,571 km, so v = √(3.986 × 10¹⁴ ÷ 2.6571 × 10⁷) = 3,873 m/s = 3.873 km/s (about 13,900 km/h).',
    })
  } else {
    entries.push({
      term: 'More words',
      meaning: 'the orbital speed formula appears here after your first run. More terms and formulas appear after the tutor’s explanation, because they would give away what you are about to guess.',
    })
  }
  if (explained) {
    entries.push(
      {
        term: 'Speed effect (formula)',
        meaning:
          '≈ −v² ÷ (2c²), where c is the speed of light. At the GPS orbit: v = 3,873 m/s and c = 299,792,458 m/s, so v² ÷ 2c² = 1.50 × 10⁷ ÷ 1.797 × 10¹⁷ = 8.35 × 10⁻¹¹, which is −8.35 × 10⁻¹¹ × 86,400 s × 10⁶ = −7.21 µs per day.',
      },
      {
        term: 'Height effect (formula)',
        meaning:
          '≈ GM × (1/R − 1/r) ÷ c², where R is Earth’s radius and r the orbit’s radius. At the GPS orbit: R = 6,371 km, r = 26,571 km, GM ÷ c² = 4.435 × 10⁻³ m and (1/R − 1/r) = 1.1932 × 10⁻⁷ per metre, so the product is 5.29 × 10⁻¹⁰, which is +45.72 µs per day.',
      },
      { term: 'Net', meaning: 'the two added: −7.21 + 45.72 = +38.51 µs per day at the GPS orbit.' },
      {
        term: 'Balance altitude',
        meaning: 'the height where the speed effect and the gravity effect cancel. It is 1.5 Earth radii from Earth’s centre, an exact result of these two formulas: 1.5 × 6,371 km = 9,557 km, which is about 3,186 km above the surface.',
      }
    )
  }
  return entries
}

const START_NOTE =
  'One plain page is listed here: NASA Space Place, “What Is an Orbit?”. More pages, including the original scientific review, are listed after the tutor, because they say how the two effects add up, which is what you are about to guess.'

const LINKS: Array<{ href: string; label: string; what: string }> = [
  {
    href: 'https://spaceplace.nasa.gov/time-travel/en/',
    label: 'NASA Space Place: "Is Time Travel Possible?"',
    what: 'a plain explanation of how speed slows a clock, how weaker gravity high up speeds it up, and why GPS satellites’ clocks need correcting. It says the errors would "add up to a few miles each day". It gives no microsecond figures. (NASA Space Place; article last updated 30 April 2020.)',
  },
  {
    href: 'https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits',
    label: 'ESA: "Types of orbits"',
    what: 'low, medium and geostationary orbits, with real speeds (about 7.8 km/s in low orbit, about 3 km/s at 35,786 km). It does not name GPS. (European Space Agency; archive content, 30 March 2020.)',
  },
  {
    href: 'https://www.maths.tcd.ie/EMIS/journals/LRG/Articles/lrr-2003-1/',
    label: 'Neil Ashby, "Relativity in the Global Positioning System", Living Reviews in Relativity 6 (2003), 1',
    what: 'the original scientific review: the net rate offset of a GPS clock, the balance orbit, and how the satellite clocks are set to correct for it. It is a long review for physicists, not a short plain page. (doi 10.12942/lrr-2003-1; revised 2007. The link opens the copy on the EMIS mirror, the page that was read.)',
  },
]

// ---- the "run all three" notice: bold, above the Run button, so a learner does not forget the later orbits ----
export function OrbitRunNotice({ done, selected, isRunning }: { done: OrbitKey[]; selected: OrbitKey; isRunning: boolean }) {
  const count = done.length
  const finished = count === 3
  const accent = finished ? '#15803d' : '#d97706'
  const left = 3 - count
  const heading = finished ? 'All 3 orbits are done' : count === 0 ? 'Run all three orbits' : `${count} of 3 orbits done. ${left} more to run`
  return (
    <div
      role="status"
      style={{
        marginTop: '0.75rem',
        marginBottom: '0.75rem',
        padding: '0.4rem 0.7rem',
        border: `1px solid ${accent}`,
        borderRadius: '8px',
        backgroundColor: finished ? '#f0fdf4' : '#fffbeb',
        color: '#1f2937',
      }}
    >
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 'bold', color: accent }}>
        {finished ? '✓ ' : '⚠ '}
        {heading}
      </p>
      <p style={{ margin: '0 0 0.35rem', fontSize: '0.75rem' }}>
        {finished ? (
          <>The graph is complete, your white marks are drawn, and the tutor is open in Part 4.</>
        ) : (
          <>
            <strong>Press Run {count === 0 ? 'three times' : 'again'}, once for each orbit.</strong> Run the other {count === 0 ? 'two after the first' : left === 1 ? 'one' : 'two'} to complete the graph. The Run button moves to the next orbit by itself. You need all three: the
            curves, your first two white marks and the tutor only appear when all three orbits have run.
          </>
        )}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {ORBIT_KEYS.map((key, i) => {
          const isDone = done.includes(key)
          const isNext = !isDone && key === selected
          return (
            <span
              key={key}
              style={{
                padding: '0.1rem 0.5rem',
                borderRadius: '999px',
                fontSize: '0.6875rem',
                fontWeight: 'bold',
                border: `2px solid ${isDone ? '#15803d' : '#d97706'}`,
                backgroundColor: isDone ? '#15803d' : isNext ? '#fde68a' : '#ffffff',
                color: isDone ? '#ffffff' : '#7c2d12',
              }}
            >
              {isDone ? '✓ ' : `${i + 1}. `}
              {SHORT_NAME[key]}
              {isNext ? (isRunning ? ' (running)' : ' (next)') : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ---- the questions ----
function ChoiceButtons<T extends string>({
  options,
  selected,
  disabled,
  onSelect,
}: {
  options: Array<{ value: T; label: string }>
  selected: T | null
  disabled: boolean
  onSelect: (value: T) => void
}) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {options.map((choice) => (
        <button
          key={choice.value}
          onClick={() => onSelect(choice.value)}
          disabled={disabled}
          className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
          style={{
            marginRight: '0.5rem',
            marginBottom: '0.5rem',
            padding: '0.5rem 1rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
}

function Question({ prompt, guessText, children }: { prompt: string; guessText: string | null; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      {children}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{guessText ? `Your guess: ${guessText}` : 'Choose an option to continue'}</p>
    </div>
  )
}

const speedOptions: Array<{ value: MoreLessSameChoice; label: string }> = [
  { value: 'more', label: 'A bigger slowing' },
  { value: 'less', label: 'A smaller slowing' },
  { value: 'same', label: 'About the same slowing' },
]
const balanceOptions: Array<{ value: YesNoChoice; label: string }> = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]
const gpsOptions: Array<{ value: MoreLessSameChoice; label: string }> = [
  { value: 'more', label: 'Faster' },
  { value: 'less', label: 'Slower' },
  { value: 'same', label: 'Same rate' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

interface ActiveRun {
  key: OrbitKey | 'part2'
  km?: number
}
type RunStatus = 'idle' | 'running' | 'complete'

export function GpsTimeDilationExperiment({ onComplete, onTutorComplete }: GpsTimeDilationExperimentProps) {
  const [speedGuess, setSpeedGuess] = useState<MoreLessSameChoice | null>(null)
  const [balanceGuess, setBalanceGuess] = useState<YesNoChoice | null>(null)
  const [gpsGuess, setGpsGuess] = useState<MoreLessSameChoice | null>(null)
  const [submitted, setSubmitted] = useState<{ speed: MoreLessSameChoice; balance: YesNoChoice; gps: MoreLessSameChoice } | null>(null)

  const [selected, setSelected] = useState<OrbitKey>('iss')
  const [done, setDone] = useState<OrbitKey[]>([])
  const [active, setActive] = useState<ActiveRun | null>(null)
  const [shownKey, setShownKey] = useState<OrbitKey | null>(null)
  const [progress, setProgress] = useState(1)
  const [status, setStatus] = useState<RunStatus>('idle')
  const [sliderKm, setSliderKm] = useState(DEFAULT_ALTITUDE_KM)
  const [part2Runs, setPart2Runs] = useState<number[]>([])
  const [explained, setExplained] = useState(false)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const isRunning = status === 'running'
  const allThree = done.length === 3
  const firstDone = done.length >= 1
  const hasAllGuesses = speedGuess !== null && balanceGuess !== null && gpsGuess !== null
  const locked = submitted !== null
  const shownSpeed = submitted?.speed ?? speedGuess
  const shownBalance = submitted?.balance ?? balanceGuess
  const shownGps = submitted?.gps ?? gpsGuess

  // One animation per run: a fixed real duration, whatever the orbit (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running' || !active) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(p)
      if (p >= 1) {
        setStatus('complete')
        const key = active.key
        if (key === 'part2') {
          if (active.km !== undefined) setPart2Runs((list) => [...list, active.km!])
        } else {
          setDone((list) => {
            const next = list.includes(key) ? list : [...list, key]
            const nextUnrun = ORBIT_KEYS.find((k) => !next.includes(k))
            if (nextUnrun) setSelected(nextUnrun)
            return next
          })
        }
        onCompleteRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, active])

  const handleRun = () => {
    if (!hasAllGuesses || isRunning || done.includes(selected)) return
    if (!submitted) setSubmitted({ speed: speedGuess!, balance: balanceGuess!, gps: gpsGuess! })
    setActive({ key: selected })
    setShownKey(selected)
    setProgress(0)
    setStatus('running')
  }

  const handleRunPart2 = () => {
    if (isRunning) return
    setActive({ key: 'part2', km: sliderKm })
    setProgress(0)
    setStatus('running')
  }

  // Start over: clears the guesses, the runs and the results, and returns the page to its first state.
  const handleStartOver = () => {
    setSpeedGuess(null)
    setBalanceGuess(null)
    setGpsGuess(null)
    setSubmitted(null)
    setSelected('iss')
    setDone([])
    setActive(null)
    setShownKey(null)
    setProgress(1)
    setStatus('idle')
    setSliderKm(DEFAULT_ALTITUDE_KM)
    setPart2Runs([])
    setExplained(false)
  }

  const hasAnythingToClear = speedGuess !== null || balanceGuess !== null || gpsGuess !== null || locked || done.length > 0 || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || isRunning

  const part1Progress = status === 'running' && active && active.key !== 'part2' ? progress : 1
  const part2Playing = status === 'running' && active?.key === 'part2' ? active : null
  const lastPart2Km = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const part2Km = part2Playing?.km ?? lastPart2Km

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Gravity and Curved Spacetime 9: Real Clocks in Orbit</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />

        <ReferencePanel entries={referenceEntries(firstDone, explained)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0 }}>
            <strong>Want to know more?</strong> {START_NOTE}
          </p>
          <ul style={{ ...listStyle, marginTop: '0.5rem' }}>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/orbits/en/">NASA Space Place: &ldquo;What Is an Orbit?&rdquo;</ExternalLink>: a plain explanation of what an orbit is and why a satellite does not fall. It gives no speeds and says nothing about clocks. (NASA Space Place;
              article last updated 29 September 2023.)
            </li>
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will guess three things about a satellite&rsquo;s clock. Then you will watch three real orbits, and a graph will fill in. Nothing you guess changes what the numbers are.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="A satellite's speed slows its clock down. As the satellite's orbit gets higher, does that slowing get bigger, get smaller, or stay about the same?"
            guessText={optionText(speedOptions, shownSpeed)}
          >
            <ChoiceButtons options={speedOptions} selected={shownSpeed} disabled={locked || isRunning} onSelect={setSpeedGuess} />
          </Question>
          <Question
            prompt="Do you think there's a specific altitude where the speed effect and the gravity effect exactly cancel, so the satellite clock matches a ground clock?"
            guessText={optionText(balanceOptions, shownBalance)}
          >
            <ChoiceButtons options={balanceOptions} selected={shownBalance} disabled={locked || isRunning} onSelect={setBalanceGuess} />
          </Question>
          <Question
            prompt="At GPS altitude (about 20,200 km), do you think the satellite's clock ends up running faster than a ground clock, slower, or at the same rate?"
            guessText={optionText(gpsOptions, shownGps)}
          >
            <ChoiceButtons options={gpsOptions} selected={shownGps} disabled={locked || isRunning} onSelect={setGpsGuess} />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your predictions are locked while you try other settings. To change them, press Start over.
            </p>
          )}
        </div>

        <OrbitRunNotice done={done} selected={selected} isRunning={isRunning} />

        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Choose an orbit to watch</p>
        <ChoiceButtons
          options={ORBIT_KEYS.map((key) => ({ value: key, label: PART1_BUTTONS[key] + (done.includes(key) ? ' ✓' : '') }))}
          selected={selected}
          disabled={isRunning}
          onSelect={setSelected}
        />
        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasAllGuesses || isRunning || done.includes(selected) || allThree}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {isRunning ? 'Running...' : 'Run'}
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
        {!hasAllGuesses && !locked && <p style={smallNote}>Answer all three questions above to run the orbits.</p>}

        <Block>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 320px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The orbit (view from above)</p>
              <OrbitDrawing
                done={done.filter((k) => k !== shownKey)}
                current={shownKey}
                progress={part1Progress}
                showBalance={allThree}
                yoursKm={null}
              />
              {shownKey && (
                <p style={{ ...smallNote, marginTop: '0.5rem' }}>
                  {SHORT_NAME[shownKey]}, altitude <strong>{fmtKm(ORBIT_ALTITUDE[shownKey])}</strong>:{' '}
                  {part1Progress >= 1 ? `the satellite moves at ${orbitSummary(ORBIT_ALTITUDE[shownKey]).speedKmPerSecond.toFixed(3)} km/s.` : 'the satellite is going round its orbit.'}
                </p>
              )}
              {firstDone && <Part1DrawingCaption done={done} />}
            </div>
            <div style={{ flex: '2 1 420px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Effect on the satellite&rsquo;s clock, for each altitude</p>
              <EffectGraph done={done} curvesDone={allThree} guesses={submitted} />
              {firstDone && <Part1GraphCaption done={done} />}
            </div>
          </div>
        </Block>

        {firstDone ? (
          <Block>
            <WhereFrom>
              <strong>Calculated here:</strong> every number, from Earth&rsquo;s real mass, radius and the real speed of light, using the same simple formulas as the earlier experiments, for a circular orbit and a non-spinning Earth. <strong>Measured:</strong> nothing is drawn
              from a measurement. The scientific review listed after the tutor (Ashby, 2003) works out the same kind of effects for real GPS satellites and reports that they have been confirmed with real clocks, but this page does not draw them. <strong>Imagined for the
              question:</strong> nothing; every orbit shown is a real kind of orbit. White is only ever your guess.
            </WhereFrom>
          </Block>
        ) : (
          <p style={smallNote}>After you press Run, a satellite goes round its orbit in the drawing and the graph starts to fill in. Watch all three orbits to see the full picture.</p>
        )}

        {/* ===== Part 2 ===== */}
        {firstDone && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              You will choose an altitude of your own and see what happens to a satellite&rsquo;s clock there. You will get three numbers, in microseconds per day: the slowing from the satellite&rsquo;s speed, the speeding up from its height, and the net of the two. Your satellite is drawn in pink, and three pink dots land on the graph, one for each number, each outlined in the colour of its curve.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="gps-altitude" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Orbital altitude: {fmtKm(sliderKm)}
              </label>
              <input
                id="gps-altitude"
                type="range"
                min={ALTITUDE_MIN_KM}
                max={ALTITUDE_MAX_KM}
                step={ALTITUDE_STEP_KM}
                value={sliderKm}
                disabled={isRunning}
                onChange={(event) => setSliderKm(Number(event.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                {ORBIT_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    disabled={isRunning}
                    onClick={() => setSliderKm(ORBIT_PRESETS_KM[key])}
                    className={`toggle-button${sliderKm === ORBIT_PRESETS_KM[key] ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem', cursor: isRunning ? 'not-allowed' : 'pointer' }}
                  >
                    {key === 'iss' ? 'ISS (~400 km)' : key === 'gps' ? 'GPS (~20,200 km)' : 'Geostationary (~35,786 km)'}
                  </button>
                ))}
              </div>
              <p style={smallNote}>
                Your guesses do not change the drawings or the numbers, but this setting does. Press Start over to change a guess.
              </p>
              <button type="button" className="action-button" onClick={handleRunPart2} disabled={isRunning} style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}>
                {part2Playing ? 'Running...' : 'Show my altitude'}
              </button>
              {!allThree && (
                <p style={smallNote}>
                  Part 1 orbits watched: {done.length} of 3. Watch the rest in Part 1 to fill in the curves and the balance ring below.
                </p>
              )}
            </div>
            <Block>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 320px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your satellite (view from above)</p>
                  <OrbitDrawing done={done} current={null} progress={1} showBalance={allThree} yoursKm={part2Km} yoursProgress={part2Playing ? progress : 1} />
                  <Part2DrawingCaption yours={part2Runs} curvesDone={allThree} />
                </div>
                <div style={{ flex: '2 1 420px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Effect on the satellite&rsquo;s clock, for each altitude</p>
                  <EffectGraph done={done} curvesDone={allThree} guesses={null} yours={part2Runs} />
                  <Part2GraphCaption yours={part2Runs} curvesDone={allThree} />
                </div>
              </div>
            </Block>
            {part2Runs.length === 0 && <p style={smallNote}>Choose an altitude and press &ldquo;Show my altitude&rdquo;. Your satellite is drawn in pink, and three pink dots appear on the graph.</p>}
            {part2Runs.length > 0 && (
              <Block>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Runs so far</p>
                <ul style={listStyle}>
                  {part2Runs.map((km, i) => {
                    const r = orbitSummary(km)
                    return (
                      <li key={i} style={{ fontSize: '0.875rem' }}>
                        Altitude <strong>{fmtKm(km)}</strong>: speed {signed(r.speedEffectMicrosecondsPerDay)} µs/day, gravity {signed(r.gravityEffectMicrosecondsPerDay)}, net {signed(r.netMicrosecondsPerDay)}.
                      </li>
                    )
                  })}
                </ul>
              </Block>
            )}
            <Block>
              <WhereFrom>
                <strong>Calculated here:</strong> your satellite and your three dots on the graph, in the same way as Part 1&rsquo;s. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the altitude you choose. Pink is only ever your own altitude; the
                faint grey rings are Part 1&rsquo;s.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              You will read the numbers behind the three orbits and a check-up of the page&rsquo;s numbers against a scientific review. The tables never change with your guesses or with the altitude you choose in Part 2. Only the pink line at the bottom follows your latest
              altitude.
            </PartHeader>
            <GpsTimeDilationResults done={done} guesses={submitted} yours={part2Runs} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              You will talk over what you saw and why. The tutor points to your three white marks and the three curves, then explains.
            </PartHeader>
            {allThree && submitted ? (
              <GpsTimeDilationTutor
                speedGuess={submitted.speed}
                balanceGuess={submitted.balance}
                gpsGuess={submitted.gps}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            ) : (
              <p style={smallNote}>
                <strong>What to do next:</strong> the tutor starts when all three orbits in Part 1 have run, because its questions are about all three orbits and your three guesses. Orbits watched: {done.length} of 3.
              </p>
            )}
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
                <p style={{ ...smallNote, marginTop: 0 }}>
                  Each link opens in a new tab. They are listed here, after the tutor, because they say how the two effects add up. They were read through summaries on 2026-11-13 (the Ashby review in part), so a quotation on this page should be checked against the live page. No
                  plain page from GPS.gov or NASA that gives the microseconds per day was found, and the split of the net into a speed part and a height part is not given in the sources read, so this page shows its own split as calculated here.
                </p>
                <ul style={listStyle}>
                  {LINKS.map((l) => (
                    <li key={l.href} style={{ marginBottom: '0.5rem' }}>
                      <ExternalLink href={l.href}>{l.label}</ExternalLink>: {l.what}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {explained && (
        <div
          className="exp-card"
          style={{ marginTop: '2rem', padding: '1.5rem', fontSize: '0.9375rem', lineHeight: 1.6 }}
        >
          <h2 style={{ marginTop: 0 }}>Putting It All Together: What Is Relativity?</h2>
          <p>
            You've now run every experiment in &ldquo;Relativity of Time and Motion&rdquo; and &ldquo;Gravity and Curved Spacetime&rdquo;. Everything you've seen is part of two
            theories, both created by Albert Einstein: <strong>special relativity</strong> (1905) and{' '}
            <strong>general relativity</strong> (1915). You may have met their names before, in the optional guide on
            the Welcome page or in passing along the way. But the experiments let you experience what these
            theories predict first, and only now do we set out what each one actually claims.
          </p>

          <h3>Special Relativity</h3>
          <p>
            Special relativity rests on exactly two starting assumptions. Everything in &ldquo;Relativity of Time and Motion&rdquo; (Experiments 1–11) follows logically from just these two — none of it is a separate, extra
            rule.
          </p>
          <p>
            <strong>1. The Principle of Relativity.</strong> The laws of physics work exactly the same for
            everyone moving at a constant speed in a straight line. There's no experiment you can run inside a
            sealed, smoothly-moving box that tells you whether you're "moving" or "standing still."
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            <em>A daily-life picture:</em> sit in a train with the curtains drawn, on perfectly smooth track,
            moving at a steady 200 km/h. Pour a cup of coffee. It pours exactly as it would if the train were
            parked at the station — nothing about the physics gives away that you're moving. This is the
            "reference frame" idea from Experiment 2 of &ldquo;Relativity of Time and Motion&rdquo;.
          </p>
          <p>
            <strong>2. The speed of light is the same for everyone.</strong> Light in a vacuum travels at the
            same speed — about 300,000 km/s — no matter how fast its source is moving, and no matter how fast
            the person measuring it is moving. This breaks the everyday rule that speeds add together. You saw this rule directly in Experiment 5 of &ldquo;Relativity of Time and Motion&rdquo;, comparing the everyday "speeds add" rule against light's
            actual behavior.
          </p>
          <p>
            <strong>Why these two are enough:</strong> if light's speed must come out the same for every
            observer (rule 2), but different observers can be moving relative to each other (which rule 1
            allows), then something else has to give — and what gives is time and space themselves. Time
            dilation (Experiments 3–4), length contraction (Experiment 6), the relativity of simultaneity
            (Experiment 7), and the twin paradox's asymmetry (Experiment 10), all in &ldquo;Relativity of Time and Motion&rdquo;, aren't independent rules you had
            to take on faith — they're the unavoidable consequence of holding both of the above at once.
            Experiment 11 of that group, the Lorentz transformation, is the exact mathematical machine that turns these two
            rules into every one of those specific effects.
          </p>

          <h3>General Relativity</h3>
          <p>
            General relativity rests on two core ideas: one is a foundational assumption, the other is the
            theory's central claim.
          </p>
          <p>
            <strong>1. The Equivalence Principle.</strong> Being in a gravitational field and being in an
            accelerating rocket are locally indistinguishable — no experiment done inside a small, sealed
            cabin can tell the two apart. This is exactly the result of Experiment 1 of &ldquo;Gravity and Curved Spacetime&rdquo;: a dropped ball behaves
            identically in both cabins.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            <em>A daily-life picture:</em> if the cable holding an elevator snapped, everyone inside would
            float — weightless — for the few seconds before it hit the ground. That's not gravity switching
            off. It's the same physics as coasting in a spaceship far from any planet, engine off. Free fall
            <em> is</em> weightlessness, exactly, because gravity and acceleration are the same thing locally.
          </p>
          <p>
            <strong>2. Gravity is the curvature of spacetime, not a force pulling things together.</strong>{' '}
            Massive objects bend the shape of spacetime around them, and everything — including light — simply
            follows the straightest possible path through that curved shape (a "geodesic"). What looks like an
            attractive force is really geometry.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            <em>How you built this up, piece by piece, in &ldquo;Gravity and Curved Spacetime&rdquo;:</em> Experiment 1 established the equivalence
            principle. Experiment 3 showed gravity isn't exactly like acceleration — real gravity has a
            center, so it pulls things together, which a uniformly accelerating rocket can never reproduce.
            Experiment 4 showed what "curvature" concretely means: parallel paths that converge. Experiment 5
            showed what determines how much curvature there is: mass and distance. Experiments 6–8 showed the
            consequences of that curvature — orbits, black holes, and light bending. This experiment (Gravity and Curved Spacetime 9)
            showed that gravitational time dilation isn't a rare, exotic effect confined to thought
            experiments — it's a real correction in a real, working system.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            <em>The same simple math, reused:</em> the acceleration × height / c²-style formulas used throughout this group (Experiments 2 and 9) are the simplified, weak-field version of general
            relativity's curvature effect — not a separate rule invented for this project, but the real theory
            scaled down to something calculable by hand.
          </p>

          <h3>Why the full explanation comes now</h3>
          <p style={{ marginBottom: 0 }}>
            The Welcome page has a short, optional guide to these two theories, for anyone who likes to see the
            map first. But the experiments themselves were built the other way round. Asking you to accept
            abstract statements before you had any reason to believe them would not have taught much. Instead, every one of the twenty experiments you ran was one small, concrete piece of evidence — and only now, with all of it in hand, do the two
            abstract-sounding theories turn into: "oh, that's just describing what I already watched happen."
          </p>
        </div>
      )}
    </div>
  )
}
