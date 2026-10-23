import { useState } from 'react'
import type { ReactNode } from 'react'
import { LIGHT_YEARS_PER_PARSEC } from '../physics/whiteDwarfExplosion'
import type { SizeAnswer, SpeedAnswer } from '../physics/whiteDwarfExplosion'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 14 (docs/experiments/frontier-and-beyond/14-what-makes-a-white-dwarf-explode.md).
// Step 3 builds the two predictions (their answer buttons, Run gated on both, and Start over); Run only records the predictions, because the run is a later step.
// Step 2 (the interface skeleton) builds the page's skeleton: the status line, the introduction with its new-word list, its assumptions and its "Want to know more?" links,
// one illustration (a white dwarf and a close pair) with its guide, and the collapsed "Words and formulas" panel. The two predictions, the run, the three pictures, the
// controls, the results and the tutor are later steps. All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. The
// introduction does not give the white dwarf's mass in the remnant, the shells' radii or their speed (those are what the predictions and the run show, §12). The interface only
// displays numbers from src/physics (CLAUDE.md §9); this step shows none of the results.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CORE_COLOR = '#93c5fd' // light blue: the carbon-oxygen core of the white dwarf
const HELIUM_COLOR = '#fcd34d' // yellow: the helium layer
const PARTNER_COLOR = '#fb923c' // orange: the partner star
const GAS_COLOR = '#c084fc' // purple: gas flowing from the partner to the white dwarf

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <>
      {lines.map((line, i) => (
        <text key={i} x={x} y={y + i * (size + 2)} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor} stroke={fill === '#0b1020' ? 'none' : '#0b1020'} strokeWidth={3} paintOrder="stroke">
          {line}
        </text>
      ))}
    </>
  )
}

// A short arrow from (x1, y1) to (x2, y2), with a small head at the end.
function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 6
  const a1 = angle + Math.PI - 0.45
  const a2 = angle + Math.PI + 0.45
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} />
      <path d={`M ${x2} ${y2} L ${x2 + head * Math.cos(a1)} ${y2 + head * Math.sin(a1)} L ${x2 + head * Math.cos(a2)} ${y2 + head * Math.sin(a2)} Z`} fill={color} />
    </g>
  )
}

// ---- Illustration: a white dwarf, and a white dwarf in a close pair (not to scale; it shows the idea, not SNR 0509-67.5) ----
function WhiteDwarfDrawing() {
  const height = 300
  const cy = 140
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale, in two panels. Panel 1, a white dwarf: a ball drawn as a light blue core with a thin yellow layer round the outside, labelled carbon-oxygen core and helium layer. Panel 2, a white dwarf in a close pair: a small white dwarf on the right, a larger orange partner star on the left, and a purple arrow showing gas flowing from the partner star onto the white dwarf."
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: a white dwarf, and a white dwarf in a close pair
      </text>

      {/* Panel 1: a white dwarf. */}
      <SvgLines x={140} y={48} lines={['1. A white dwarf']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={140} cy={cy} r={68} fill={HELIUM_COLOR} fillOpacity={0.9} stroke={HELIUM_COLOR} strokeWidth={2} />
      <circle cx={140} cy={cy} r={58} fill={CORE_COLOR} stroke={CORE_COLOR} strokeWidth={2} />
      <SvgLines x={140} y={cy - 2} lines={['carbon-oxygen', 'core']} fill="#0b1020" bold anchor="middle" />
      <SvgLines x={205} y={cy - 78} lines={['helium layer']} fill={HELIUM_COLOR} bold />
      <line x1={203} y1={cy - 80} x2={176} y2={cy - 62} stroke={HELIUM_COLOR} strokeWidth={1.5} />
      <SvgLines x={140} y={cy + 100} lines={['the small, dense ball left by a star', 'like the Sun, with a thin helium layer outside']} fill={MUTED_COLOR} anchor="middle" />

      {/* Panel 2: a close pair. */}
      <SvgLines x={400} y={48} lines={['2. A white dwarf in a close pair']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={340} cy={cy} r={52} fill={PARTNER_COLOR} fillOpacity={0.85} stroke={PARTNER_COLOR} strokeWidth={2} />
      <SvgLines x={340} y={cy + 4} lines={['partner star']} fill="#0b1020" bold anchor="middle" />
      <circle cx={470} cy={cy} r={22} fill={CORE_COLOR} stroke={HELIUM_COLOR} strokeWidth={4} />
      <SvgLines x={470} y={cy + 40} lines={['white dwarf']} fill={CORE_COLOR} bold anchor="middle" />
      <Arrow x1={398} y1={cy - 6} x2={440} y2={cy - 6} color={GAS_COLOR} />
      <SvgLines x={418} y={cy - 38} lines={['gas flows', 'across']} fill={GAS_COLOR} bold anchor="middle" />
      <SvgLines x={400} y={cy + 100} lines={['the white dwarf can take gas from its partner']} fill={GAS_COLOR} bold anchor="middle" />

      <SvgLines x={20} y={height - 8} lines={['Not to scale: a white dwarf is far smaller than the star beside it, and the layers are only a sketch.']} fill={MUTED_COLOR} />
    </svg>
  )
}

const lookForDrawing: LookFor[] = [
  {
    look: 'panel 1: the light blue ball and the thin yellow layer round it.',
    means: 'a white dwarf is mostly a ball of carbon and oxygen. Outside it can be a thin layer of helium, a different gas that the white dwarf has gathered or kept.',
    matters: 'the two layers are what the two routes to an explosion will turn on: one route lights the centre, and the other lights this outer layer first.',
  },
  {
    look: 'panel 2: the small white dwarf, the larger orange star and the purple arrow between them.',
    means: 'a white dwarf can have a partner star close by. Gas from the partner can flow across to the white dwarf and pile up on it.',
    matters: 'this is how a white dwarf can gain weight, or collect the helium layer, so a close partner is part of every story about why one explodes.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'White dwarf', meaning: 'the small, dense, slowly cooling ball left when a star like the Sun has used up its fuel. NASA: “A typical white dwarf is half as massive as the Sun, yet only slightly bigger than Earth.” (Black Holes Experiment 9 explains what holds it up.)' },
  { term: 'Electron degeneracy pressure', meaning: 'the resistance of electrons to being crowded together, because no two can be in exactly the same state (like one person to a theatre seat). It is what holds a white dwarf up against its own weight. Chandra: “The complete collapse of the white dwarf is prevented because it is held in equilibrium with gravity by electron degeneracy pressure.”' },
  { term: 'Chandrasekhar limit', meaning: 'the most mass a white dwarf can have before electron degeneracy pressure can no longer hold it up. NASA and Chandra give it as 1.4 times the mass of the Sun; the model of Black Holes Experiment 9, which this experiment reuses, uses 1.44. The two figures are the same limit worked out to different accuracy.' },
  { term: 'Solar mass', meaning: 'a unit for how heavy stars are. One solar mass is the mass of the Sun, so “1.4 solar masses” means 1.4 times as heavy as the Sun.' },
  { term: 'Type Ia supernova', meaning: 'the explosion of a white dwarf. NASA: when the white dwarf nears 1.4 times the mass of the Sun, “the pressure at the center will exceed the threshold for the carbon and oxygen nuclei to start to fuse uncontrollably.” Astronomers use these explosions as “standard candles” to measure distances. (The other kind of supernova, a massive star’s core collapsing, is Experiment 13.)' },
  { term: 'Standard candle', meaning: 'an object whose true brightness is known, so that how faint it looks tells us how far away it is, like judging how far away a street lamp is from how dim it appears. NASA: “Since Type Ia supernovae release the same amount of energy every time, astronomers use them as ‘standard candles’ to determine distance.”' },
  { term: 'Helium layer', meaning: 'a thin layer of helium, a light gas, on the outside of a white dwarf, round its carbon-oxygen core.' },
  { term: 'Double detonation', meaning: 'one proposed way for a white dwarf to explode, in two steps: the helium layer on its surface ignites first, and the shock from that explosion runs inward and sets off the carbon-oxygen core. ESO’s release describes the 2025 finding as a “double-detonation” mechanism.' },
  { term: 'Supernova remnant', meaning: 'the cloud of gas thrown out by a supernova, which keeps glowing for centuries as it spreads through the space around it. SNR 0509-67.5 is one: “SNR” stands for “supernova remnant”.' },
  { term: 'Calcium shell', meaning: 'a ring-shaped layer of calcium gas in a remnant. Calcium glows at particular colours when the gas is hot, so a telescope that splits light into its colours can show where the calcium is. (The 2025 team found two such shells, one outside the other.)' },
  { term: 'Large Magellanic Cloud', meaning: 'a small galaxy that orbits ours, in the southern sky, about 150,000 to 160,000 light-years away. ESA/Hubble calls it “a dwarf irregular galaxy”. SNR 0509-67.5 lies in it.' },
  { term: 'Parsec', meaning: 'a unit of distance used by astronomers, about 3.26 light-years. A light-year is how far light travels in a year.' },
]

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const SIZE_CHOICES: ReadonlyArray<{ value: SizeAnswer; label: string }> = [
  { value: 'about 0.5 Suns', label: 'About 0.5 Suns' },
  { value: 'about 1.0 Sun', label: 'About 1.0 Sun' },
  { value: 'about 1.4 Suns', label: 'About 1.4 Suns (the limit)' },
]
const SPEED_CHOICES: ReadonlyArray<{ value: SpeedAnswer; label: string }> = [
  { value: 'about 50 km/s', label: 'About 50 kilometres a second' },
  { value: 'about 5,000 km/s', label: 'About 5,000 kilometres a second' },
  { value: 'about 300,000 km/s', label: 'About 300,000 kilometres a second (the speed of light)' },
]

export function WhiteDwarfExplosionExperiment() {
  const [sizePrediction, setSizePrediction] = useState<SizeAnswer | null>(null)
  const [speedPrediction, setSpeedPrediction] = useState<SpeedAnswer | null>(null)
  // Run only records the predictions for now: the run itself, and the pictures, are the next step.
  const [hasRun, setHasRun] = useState(false)
  const bothPredicted = sizePrediction !== null && speedPrediction !== null

  function startOver() {
    setSizePrediction(null)
    setSpeedPrediction(null)
    setHasRun(false)
  }

  return (
    <div>
      <h2>Experiment 14 — What Makes a White Dwarf Explode? (the double-detonation remnant SNR 0509-67.5)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): in 2025 astronomers found a pattern in the remains of one supernova that fits a white dwarf exploding in two steps. That is
            strong evidence for that one remnant. Some scientists read the pattern another way, and how many white dwarfs explode like this is not known. What the evidence
            adds up to is shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> A star like the Sun ends its life as a small, dense, slowly cooling ball called a white dwarf. Most white dwarfs fade quietly for
            ever. But some explode, in an event called a Type Ia supernova, and these explosions are so alike that astronomers use them to measure distances across the
            universe. What makes a white dwarf explode? Does it have to reach a certain weight first? One supernova remnant, studied in 2025, gives some of the best evidence yet.
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Black Holes Experiment 9 you saw what holds up a dead star’s core, and that a white dwarf has a limit to its weight. In
            Experiments 1 and 2 of this group, distances measured with Type Ia supernovae were at the centre of the Hubble tension and the question of whether dark energy
            changes. In Experiment 13 you met the other kind of supernova, a massive star’s core collapsing, and worked with distance ÷ speed. This experiment is about the
            kind that those distances rest on.
          </p>

          <p style={paragraph}>
            <strong>What a white dwarf is.</strong> NASA says that “a typical white dwarf is half as massive as the Sun, yet only slightly bigger than Earth”. A white dwarf
            is not making energy any more. What holds it up against its own weight is a rule of nature about electrons: no two of them can be in exactly the same state, so
            when they are squeezed together they push back, a bit like a theatre where every seat holds one person, however hard you push. This is called{' '}
            <strong>electron degeneracy pressure</strong>. But it can hold up only so much weight. Chandra gives the limit: “the mass limit for a white dwarf to remain in
            equilibrium between gravity and electron degeneracy pressure is 1.4 solar masses”. It is named the Chandrasekhar limit, after the scientist who found it.
          </p>

          <p style={paragraph}>
            <strong>Two ways it might explode.</strong> The first idea is the older one. A white dwarf in a close pair takes gas from its partner, and its weight creeps up.
            NASA describes what happens as it nears the limit: “the pressure at the center will exceed the threshold for the carbon and oxygen nuclei to start to fuse
            uncontrollably”, and the white dwarf explodes. Because every white dwarf that explodes this way would start from nearly the same weight, the explosions would
            look much alike, and that is why NASA says astronomers use them as “standard candles”: if you know how bright something really is, how faint it looks tells you how
            far away it is, as a street lamp looks dimmer the farther away it is. The second idea is newer. A white dwarf can also collect a thin layer of helium on its
            surface. If that layer ignites, the explosion runs through it (a detonation: a burning front that races through the material faster than sound), and the shock
            runs inward and can set off the carbon-oxygen core. That would be a <strong>double detonation</strong>: two explosions, one after the other.
          </p>

          <p style={paragraph}>
            <strong>What was found.</strong> In July 2025 a team led by Priyam Das and Ivo Seitenzahl used MUSE, an instrument on the European Southern Observatory’s Very
            Large Telescope that splits the light at every point of a picture into its colours, to look at a supernova remnant called SNR 0509-67.5. A remnant is the cloud of gas
            thrown out by a supernova. This one is in the Large Magellanic Cloud, a small galaxy next to ours about 150,000 to 160,000 light-years away, and it is only about
            300 to 350 years old. The team found calcium gas arranged in two separate shells, one outside the other. Simulations of a double detonation predict two shells like
            that, and ESO’s release says it is a clear sign that this kind of explosion happens. The illustration below shows the parts of a white dwarf and a close pair.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <WhiteDwarfDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It shows the parts that the two ideas turn on. It is a sketch of any white dwarf of this kind, not of the one in
              SNR 0509-67.5, and it is not to scale.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The two panels</strong> show two things: 1, a white dwarf on its own; 2, a white dwarf with a partner star close by.
              </li>
              <li>
                <strong>The light blue ball</strong> in panel 1 is the carbon-oxygen core, which is most of the white dwarf. <strong>The thin yellow layer</strong> round it is
                the helium layer.
              </li>
              <li>
                <strong>The orange circle</strong> in panel 2 is the partner star. It is drawn bigger than the white dwarf because a white dwarf is only about the size
                of the Earth. <strong>The purple arrow</strong> shows gas flowing from the partner to the white dwarf.
              </li>
              <li>
                <strong>The small blue and yellow circle</strong> in panel 2 is the white dwarf, drawn with its helium layer round it.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with a street lamp.</strong> Picture two lamps of exactly the same brightness. You see one close by and it looks bright. You see the
              other far down the road and it looks dim. Because you know both are the same lamp, the dimness tells you the distance. Type Ia supernovae are used the same way,
              as lamps in distant galaxies. It only works if the lamps really are alike, and that is why it matters what makes a white dwarf explode.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForDrawing} />
          </div>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> That this one remnant fits a double detonation is strong evidence. Another reading of the same two shells
            has been published, so it is not settled that nothing else could make them. How many white dwarfs explode this way is still open. What the evidence adds up to is
            shown after the run, with each number’s source.
          </p>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>White dwarf</strong>, <strong>electron degeneracy pressure</strong>, <strong>Chandrasekhar limit</strong> and <strong>solar mass</strong>: the dead
                star, what holds it up, how much it can weigh, and the unit for star weights.
              </li>
              <li>
                <strong>Type Ia supernova</strong> and <strong>standard candle</strong>: the explosion of a white dwarf, and why its brightness can measure a distance.
              </li>
              <li>
                <strong>Helium layer</strong> and <strong>double detonation</strong>: the thin outer layer, and the two-step explosion it can start.
              </li>
              <li>
                <strong>Supernova remnant</strong> and <strong>calcium shell</strong>: the cloud a supernova leaves, and a ring of calcium gas in it.
              </li>
              <li>
                <strong>Large Magellanic Cloud</strong> and <strong>parsec</strong>: the small galaxy where the remnant is, and a unit of distance.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values for the
            white dwarf’s weight, the remnant’s age and a difference in brightness. Nothing here is graded. Your predictions are your own guesses, made before you see
            anything: they do not change the pictures or the tables, which come from the physics and the published numbers. They are shown again beside the results so you can
            compare. What does change the pictures and Table 4 is the “Now try it yourself” controls, which appear after the run finishes.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It uses the size of a white dwarf and its limit from Black Holes Experiment 9, published
            masses and radii for the remnant, and the plain rule that a speed is a distance divided by a time. It does not simulate either kind of explosion, does not work
            out how bright a supernova is, and does not decide between the double detonation and another reading of the remnant.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the
            numbers are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://eso.org/public/news/eso2511/">ESO: Double detonation, new image shows remains of a star destroyed by a pair of explosions</ExternalLink>: the
              2025 finding in the observatory’s own words.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-stellar-explosions/">NASA Hubble: Stellar explosions</ExternalLink>: what a
              Type Ia supernova is, and how astronomers use it as a “standard candle” to find distances.
            </li>
            <li>
              <ExternalLink href="https://imagine.gsfc.nasa.gov/science/objects/supernovae1.html">NASA Imagine the Universe: Supernovae</ExternalLink>: how a white dwarf near the
              limit explodes, and how that differs from a massive star’s collapse.
            </li>
            <li>
              <ExternalLink href="https://imagine.gsfc.nasa.gov/science/objects/dwarfs2.html">NASA Imagine the Universe: White dwarf stars</ExternalLink>: how heavy and how big a
              white dwarf is, and what the 1.4-Sun limit means.
            </li>
            <li>
              <ExternalLink href="https://chandra.harvard.edu/edu/formal/stellar_ev/story/index7.html">Chandra X-ray Observatory: Stellar evolution, white dwarfs</ExternalLink>:
              electron degeneracy pressure and the Chandrasekhar limit.
            </li>
            <li>
              <ExternalLink href="https://esahubble.org/images/heic0411d/">ESA/Hubble: The Large Magellanic Cloud</ExternalLink>: the small galaxy beside ours where the remnant is.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is
            right, and neither gives the white dwarf's mass in the remnant or the shells' speed. */}
        {(
          [
            {
              title: 'Prediction 1: how heavy was the white dwarf?',
              text: (
                <>
                  A white dwarf cannot be heavier than about 1.4 Suns. In the remnant we study, a white dwarf exploded as a Type Ia supernova. About how heavy was it?
                </>
              ),
              choices: SIZE_CHOICES,
              value: sizePrediction,
              set: (v: SizeAnswer) => setSizePrediction(v),
            },
            {
              title: 'Prediction 2: how fast is the debris?',
              text: (
                <>
                  The remnant is about 300 years old, and its outer shell of calcium is about 2 parsecs from the centre, which is about {(2 * LIGHT_YEARS_PER_PARSEC).toFixed(1)} light-years. About
                  how fast has that outer shell moved, on average?
                </>
              ),
              choices: SPEED_CHOICES,
              value: speedPrediction,
              set: (v: SpeedAnswer) => setSpeedPrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              {question.text} You are not graded, and a guess is fine.
            </p>
            <div>
              {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => (question.set as (v: never) => void)(choice.value as never)}
                  disabled={hasRun}
                  className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
              {question.value !== null
                ? `Your prediction: ${(question.choices as ReadonlyArray<{ value: string; label: string }>).find((c) => c.value === question.value)?.label.toLowerCase()}.`
                : 'Choose an option to continue'}
            </p>
          </div>
        ))}

        <button type="button" className="action-button" onClick={() => setHasRun(true)} disabled={!bothPredicted || hasRun} style={{ padding: '0.6rem 1.5rem' }}>
          Run
        </button>
        {hasRun && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && !hasRun && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0', color: 'var(--text-muted)' }}>
          {hasRun ? 'Your predictions are recorded and not marked here. The pictures and the results will appear here.' : 'The pictures fill in, one stage at a time, after you press Run.'}
        </p>
      </div>
    </div>
  )
}
