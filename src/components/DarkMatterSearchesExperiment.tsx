import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  chanceOfNoEvents,
  EXPECTED_AT_LIMIT,
  limitAfter,
  limitAtLiveDays,
  LZ230616,
  LZ_DECEMBER_2025,
  LZ_LIMIT_2025,
  MAX_TRIES,
  MIN_TRIES,
  OTHER_BORON8_SIGMAS,
  runDarkMatterSearches,
  SIGMA_LADDER,
  TRIES_FOR_LZ_GLOBAL,
  XENONNT_LIMIT,
  ZERO_EVENT_CHANCE,
} from '../physics/darkMatterSearches'
import { oneSidedChance } from '../physics/evolvingDarkEnergy'
import type { Background, CountRange, GlobalEffect } from '../physics/darkMatterSearches'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { DarkMatterSearchesTutor } from './DarkMatterSearchesTutor'

// Frontier and Beyond, Experiment 6 (docs/experiments/frontier-and-beyond/06-where-is-the-dark-matter.md).
// Step 2 builds the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of a detector (an
// illustration, not data), the collapsed "Words and formulas" panel and the skeleton of Picture 1 with its guide. The predictions, Run, the
// other two pictures, the results, the controls, the tutor and the chapter summary come in later steps. All wording is draft for the owner's
// line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. The introduction does not give the 2026 event's energy, exposure
// or significance, or say how the global significance compares with the local one (that is what Prediction 2 asks, §12). The interface only
// displays numbers from src/physics (CLAUDE.md §9); the only calculation here is where a point is drawn.

interface DarkMatterSearchesExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const PARTICLE_COLOR = '#a78bfa' // violet: the dark-matter particle
const XENON_COLOR = '#38bdf8' // sky blue: the liquid xenon
const FLASH_COLOR = '#fde047' // yellow: the flash of light
const ELECTRON_COLOR = '#4ade80' // green: the freed electrons
const ROCK_COLOR = '#475569'
const CURVE_COLOR = '#fb923c' // orange: the chance of seeing nothing

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

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const COUNT_CHOICES: ReadonlyArray<{ value: CountRange; label: string }> = [
  { value: 'point23', label: 'About 0.23' },
  { value: 'twoPoint3', label: 'About 2.3' },
  { value: 'twentyThree', label: 'About 23' },
]
const EFFECT_CHOICES: ReadonlyArray<{ value: GlobalEffect; label: string }> = [
  { value: 'lower', label: 'Lower than 3.4 sigma' },
  { value: 'same', label: 'The same, 3.4 sigma' },
  { value: 'higher', label: 'Higher than 3.4 sigma' },
]

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

// ---- The detector (an illustration, not data) ----
function DetectorDrawing() {
  const height = 330
  const tankX = 110
  const tankY = 150
  const tankW = 200
  const tankH = 130
  const bumpX = 214
  const bumpY = tankY + 66
  const labelX = tankX + tankW + 14
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="A tank of liquid xenon deep underground: a dark-matter particle passes into the tank, bumps a xenon nucleus, and sensors above and below pick up a flash of light and a few freed electrons"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: a dark-matter detector
      </text>

      {/* The surface and the rock. */}
      <line x1={20} y1={44} x2={540} y2={44} stroke={TEXT_COLOR} strokeWidth={2} />
      <text x={28} y={38} fill={TEXT_COLOR} fontSize="11">
        The Earth’s surface
      </text>
      <rect x={20} y={46} width={520} height={height - 70} fill={ROCK_COLOR} opacity={0.25} />
      <text x={labelX} y={72} fill={MUTED_COLOR} fontSize="11">
        solid rock
      </text>
      <text x={labelX} y={88} fill={MUTED_COLOR} fontSize="10">
        (blocks most cosmic rays)
      </text>

      {/* The depth. */}
      <line x1={38} y1={56} x2={38} y2={tankY - 12} stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
      <polygon points="34,58 38,48 42,58" fill={TEXT_COLOR} />
      <polygon points={`34,${tankY - 14} 38,${tankY - 4} 42,${tankY - 14}`} fill={TEXT_COLOR} />
      <text x={48} y={100} fill={TEXT_COLOR} fontSize="11">
        nearly a mile
      </text>
      <text x={48} y={114} fill={TEXT_COLOR} fontSize="11">
        down
      </text>

      {/* The tank. */}
      <rect x={tankX} y={tankY} width={tankW} height={tankH} fill={XENON_COLOR} opacity={0.18} stroke={XENON_COLOR} strokeWidth={2} rx={6} />
      <text x={tankX + 10} y={tankY + tankH - 10} fill={XENON_COLOR} fontSize="12" fontWeight="bold">
        liquid xenon
      </text>
      {/* The light sensors, above and below. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={tankX + 10 + i * 38} y={tankY - 14} width={28} height={10} fill={TEXT_COLOR} opacity={0.8} />
          <rect x={tankX + 10 + i * 38} y={tankY + tankH + 4} width={28} height={10} fill={TEXT_COLOR} opacity={0.8} />
        </g>
      ))}
      <text x={labelX} y={tankY - 6} fill={TEXT_COLOR} fontSize="11">
        light sensors (above and below)
      </text>

      {/* The particle, the bump, the flash and the electrons. */}
      <line x1={186} y1={tankY - 40} x2={bumpX - 4} y2={bumpY - 10} stroke={PARTICLE_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
      <polygon points={`${bumpX - 10},${bumpY - 14} ${bumpX - 2},${bumpY - 8} ${bumpX - 14},${bumpY - 4}`} fill={PARTICLE_COLOR} />
      <text x={labelX} y={tankY - 38} fill={PARTICLE_COLOR} fontSize="11" fontWeight="bold">
        a dark-matter particle
      </text>
      <text x={labelX} y={tankY - 24} fill={PARTICLE_COLOR} fontSize="10">
        (almost always passes straight through)
      </text>
      <polygon
        points="0,-22 6,-8 22,-8 9,2 14,18 0,8 -14,18 -9,2 -22,-8 -6,-8"
        fill={FLASH_COLOR}
        opacity={0.85}
        transform={`translate(${bumpX}, ${bumpY})`}
      />
      <circle cx={bumpX} cy={bumpY} r={5} fill={TEXT_COLOR} />
      <text x={labelX} y={tankY + 34} fill={FLASH_COLOR} fontSize="11" fontWeight="bold">
        a flash of light
      </text>
      <text x={labelX} y={tankY + 66} fill={TEXT_COLOR} fontSize="11">
        a xenon nucleus is bumped (a recoil)
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={bumpX + 12 + i * 9} cy={bumpY + 26 - i * 3} r={2.4} fill={ELECTRON_COLOR} />
      ))}
      <text x={labelX} y={tankY + 98} fill={ELECTRON_COLOR} fontSize="11" fontWeight="bold">
        a few freed electrons
      </text>

      <text x={20} y={height - 8} fill={MUTED_COLOR} fontSize="10">
        Not to scale, and most particles do not bump anything.
      </text>
    </svg>
  )
}

// ---- Picture 1: what does seeing nothing rule out? (Step 2: the axes and the curve) ----
const P1_LEFT = 70
const P1_RIGHT = 520
const P1_TOP = 56
const P1_BOTTOM = 210
const P1_MAX_N = 6
const P1_HEIGHT = 290
const nToX = (n: number) => P1_LEFT + (n / P1_MAX_N) * (P1_RIGHT - P1_LEFT)
const chanceToY = (chance: number) => P1_BOTTOM - chance * (P1_BOTTOM - P1_TOP)

const CURVE_POINTS = (() => {
  const points: string[] = []
  const steps = 120
  for (let i = 0; i <= steps; i++) {
    const n = (P1_MAX_N * i) / steps
    points.push(`${i === 0 ? 'M' : 'L'}${nToX(n).toFixed(1)},${chanceToY(chanceOfNoEvents(n)).toFixed(1)}`)
  }
  return points.join(' ')
})()

// The run: five named stages (the specification's "Run"). The timer only paces the display; no number depends on it (CLAUDE.md §11).
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = [
  '',
  'What the detector counts',
  'What seeing nothing rules out',
  'More data',
  'Neutrinos from the Sun',
  'One unexpected event',
]
const NO_BACKGROUND_COLOR = '#4ade80' // green: the limit when there is no background
const GROWS_COLOR = '#f472b6' // pink: the limit when a background grows with the data
const RULED_OUT_COLOR = '#f87171' // red: strengths that seeing nothing rules out
const NOT_RULED_OUT_COLOR = '#64748b' // grey: strengths that it does not rule out

// ---- Picture 2: more data, weaker interactions (log-log, both lines from the physics module) ----
const P2_LEFT = 80
const P2_RIGHT = 430
const P2_TOP = 76
const P2_BOTTOM = 220
const P2_HEIGHT = 300
const P2_MIN_DAYS = LZ_LIMIT_2025.liveDays
const P2_MAX_DAYS = 1000
const P2_MIN_Y = 4e-49
const P2_MAX_Y = 2.5e-48
const daysToX = (days: number) => P2_LEFT + (Math.log(days / P2_MIN_DAYS) / Math.log(P2_MAX_DAYS / P2_MIN_DAYS)) * (P2_RIGHT - P2_LEFT)
const limitToY = (cm2: number) => P2_BOTTOM - (Math.log(cm2 / P2_MIN_Y) / Math.log(P2_MAX_Y / P2_MIN_Y)) * (P2_BOTTOM - P2_TOP)
const limitPath = (background: 'none' | 'grows') => {
  const points: string[] = []
  const steps = 60
  for (let i = 0; i <= steps; i++) {
    const days = P2_MIN_DAYS * Math.pow(P2_MAX_DAYS / P2_MIN_DAYS, i / steps)
    points.push(`${i === 0 ? 'M' : 'L'}${daysToX(days).toFixed(1)},${limitToY(limitAtLiveDays(days, background)).toFixed(1)}`)
  }
  return points.join(' ')
}
// "6.2 × 10⁻⁴⁹ cm²" from a number of cm².
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const formatCm2 = (value: number, digits = 2) => {
  const [mantissa, exponent] = value.toExponential(digits - 1).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')} cm²`
}

// ---- Picture 3: how sure? A ladder of sigma ----
const P3_LEFT = 215
const P3_RIGHT = 480
const P3_TOP = 70
const P3_ROW = 34
const P3_HEIGHT = 295
const sigmaToX = (sigma: number) => P3_LEFT + (sigma / 5) * (P3_RIGHT - P3_LEFT)

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Dark matter', meaning: 'the unseen material that supplies extra gravity in galaxies and galaxy clusters (Cosmology Experiments 4 and 7). Its gravity is measured. What it is made of is not known.' },
  { term: 'WIMP', meaning: 'a “weakly interacting massive particle”: the kind of particle that many dark-matter searches look for. Weakly interacting means that it almost never touches ordinary matter, and massive means that it has a mass, probably far more than a neutrino’s.' },
  { term: 'GeV/c²', meaning: 'a unit of mass used for particles. A proton weighs about 1 GeV/c², so a particle of “3 to 9 GeV/c²” weighs about three to nine times a proton.' },
  { term: 'Liquid xenon detector', meaning: 'a tank of xenon, a very heavy gas, made ultrapure and cooled until it is a liquid. When a dark-matter particle bumps a xenon nucleus (the tiny, heavy centre of an atom), the atom gives out a flash of light and some electrons, and sensors count both (see the Imperial College link below).' },
  { term: 'Nuclear recoil, and keV', meaning: 'a nuclear recoil is what happens when something bumps the nucleus at the centre of an atom, and the nucleus is knocked back. Its energy is measured in keV (kilo-electron-volts, thousands of electron-volts, a unit of energy used for particles: Spacetime Geometry Experiment 5). A bigger number means a harder bump.' },
  { term: 'Cross-section', meaning: 'how strongly a particle interacts, pictured as the size of the target it sees: a bigger target is bumped more often. It is written as an area, in square centimetres (cm²). A smaller number means a weaker interaction.' },
  { term: 'Exposure, tonne-year and live day', meaning: 'how much chance a detector has had to catch something: the mass of the target times the time it has been watching. A tonne-year is one tonne of target watched for one year. A live day is a day when the detector was working and taking good data, which is not every day.' },
  { term: 'Expected events', meaning: 'the average number of bumps you would count if a particle of a given strength were really there. It is bigger for a stronger interaction and for a bigger exposure. You can expect 0.1 events and see none, or expect 5 and see none. The second is much more surprising.' },
  { term: 'Limit (90 percent)', meaning: 'a statement of the kind “particles stronger than this are ruled out”. It is not a measurement of the particle. It is drawn where seeing nothing would be a 1-in-10 accident, so a 90 percent limit means that we are 90 percent sure that nothing stronger is out there.' },
  { term: 'Background', meaning: 'anything that makes the same kind of flash as a dark-matter particle but is not one, such as a trace of radioactivity in the materials, or particles from space. Searches try to make the background as close to zero as they can.' },
  { term: 'Neutrino', meaning: 'a particle with no electric charge that almost never touches anything, so it passes through ordinary matter almost untouched (Experiment 4 of this group). Neutrinos come from many places, including the Sun’s core.' },
  { term: 'Boron-8 neutrinos, and CEvNS', meaning: 'boron-8 neutrinos are a rare kind made in the Sun’s fusion. CEvNS is the long name, “coherent elastic neutrino-nucleus scattering”, for what happens when a neutrino bumps a whole atomic nucleus at once instead of its parts. It gives the same kind of flash as a light dark-matter particle.' },
  { term: 'Neutrino fog', meaning: 'the name for the point where neutrinos from the Sun and the atmosphere make the same flashes as dark matter would. They are a real signal that is worth detecting, and they are also a background for the search. LZ’s new view of boron-8 neutrinos, at 4.5 sigma, shows it is reaching the fog.' },
  { term: 'Sigma', meaning: 'a way of saying how sure a measurement or detection is (Experiment 1 of this group): the size of a result counted in units of its own “give or take”. The bigger the number, the less likely it is just chance. About 1 sigma is ordinary, and 5 sigma is the usual bar in many sciences for calling something real.' },
  { term: 'Hint, evidence and discovery', meaning: 'the three names used in this group (Experiment 2): below about 3 sigma is a hint, from about 3 sigma it is often called evidence, and about 5 sigma is the usual bar for a discovery.' },
]

export function DarkMatterSearchesExperiment({ onComplete, onTutorComplete }: DarkMatterSearchesExperimentProps) {
  const chanceAt1 = chanceOfNoEvents(1)
  const chanceAt5 = chanceOfNoEvents(5)
  const [countPrediction, setCountPrediction] = useState<CountRange | null>(null)
  const [effectPrediction, setEffectPrediction] = useState<GlobalEffect | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  // The controls that appear after the run. The sliders hold the power of ten of the value, so that each step multiplies it.
  const [strengthPower, setStrengthPower] = useState(0) // strength: 10^p times today's limit, p from -1 to 1
  const [exposurePower, setExposurePower] = useState(0) // exposure: 10^p times the reference exposure, p from 0 to 3
  const [background, setBackground] = useState<Background>('none')
  const [tries, setTries] = useState(14)
  const bothPredicted = countPrediction !== null && effectPrediction !== null
  const hasRun = status !== 'idle'
  // The learner's own search. Every number comes from the physics module; rounded to two figures so the sliders give tidy values.
  const strength = Number(Math.pow(10, strengthPower).toPrecision(2))
  const exposure = Number(Math.pow(10, exposurePower).toPrecision(2))
  const mine = runDarkMatterSearches(strength, exposure, background, tries)
  const done = status === 'complete'
  const fix = (value: number) => (value < 0.01 ? value.toExponential(2) : value.toFixed(3))
  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'Local and global significance',
      meaning: `local significance counts the chance of an excess like the one seen only at the place where it appeared. Global significance asks a fairer question: how likely is it that an excess this strong turns up at least once anywhere in all the places that were searched? Because every extra place is another chance for a fluke, the chance rises, and so the sigma goes down. Everyday comparison: any one lottery ticket almost never wins, but someone among a million tickets usually does.`,
    },
    {
      term: 'Expected events (formula)',
      meaning: `expected events N = ${EXPECTED_AT_LIMIT.toFixed(4)} × strength × exposure, with the strength in units of today’s limit and the exposure in units of the reference exposure. Example, for your search: ${EXPECTED_AT_LIMIT.toFixed(4)} × ${strength} × ${exposure} = ${mine.expected.toFixed(3)}.`,
    },
    {
      term: 'Chance of seeing none (formula)',
      meaning: `chance of seeing none = e^(−N), the rule for counting rare random events (called a Poisson count). Example: e^(−${mine.expected.toFixed(3)}) = ${(mine.chanceOfNoEvents * 100).toFixed(1)} percent. The chance of seeing at least one is 1 minus that: ${(mine.chanceOfAtLeastOneEvent * 100).toFixed(1)} percent.`,
    },
    {
      term: 'The limit after more data (formulas)',
      meaning: `with no background, the limit is today’s limit ÷ exposure. With a background that grows with the data, it is today’s limit ÷ √exposure. Example, for exposure ${exposure}: ${fix(limitAfter(exposure, 'none'))} (no background) and ${fix(limitAfter(exposure, 'grows'))} (growing background) times today’s limit of ${formatCm2(LZ_LIMIT_2025.crossSectionCm2)}. These are idealised rules of thumb, not LZ’s forecast.`,
    },
    {
      term: 'Places looked, and global chance (formula)',
      meaning: `chance of at least one excess in T independent places = 1 − (1 − p)^T, where p is the local chance. Example: p = ${mine.localChance.toExponential(2)} (3.4 sigma) and T = ${tries} gives ${mine.globalChance.toFixed(4)}, which is ${mine.globalSigma.toFixed(2)} sigma. About ${TRIES_FOR_LZ_GLOBAL.toFixed(1)} independent places would turn 3.4 sigma into LZ’s published 2.6 sigma; this is an illustration, not how LZ worked out its number.`,
    },
  ]
  const exposureInRange = exposure <= P2_MAX_DAYS / P2_MIN_DAYS
  const p1Limit = stage >= 2
  const p2Shown = stage >= 3
  const noneAt = limitAtLiveDays(P2_MAX_DAYS, 'none')
  const growsAt = limitAtLiveDays(P2_MAX_DAYS, 'grows')
  const daysRatio = P2_MAX_DAYS / P2_MIN_DAYS

  // Presentation only: advances one stage at a time. The result does not depend on this timer.
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) {
        setStage(stage + 1)
      } else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  function startOver() {
    setCountPrediction(null)
    setEffectPrediction(null)
    setStatus('idle')
    setStage(0)
    setStrengthPower(0)
    setExposurePower(0)
    setBackground('none')
    setTries(14)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }

  return (
    <div>
      <h2>Experiment 6 — Where Is the Dark Matter?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): Strong evidence about what dark matter is not; Open: what it is, and what one unexplained event
            means.
          </strong>{' '}
          Searches have ruled out some kinds of dark-matter particle. No search has found one.
        </p>

        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), written to the standard of CLAUDE.md §29. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> If dark-matter particles are passing through the Earth all the time, why has no one caught one? And what
            does it mean when a search finds nothing, or finds a single odd event?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Cosmology Experiments 4 and 7 you saw that galaxies spin too fast to be held together by the matter
            we can see, and that light is bent by more mass than we can see. Something unseen supplies the extra gravity, and we call it{' '}
            <strong>dark matter</strong>. NASA calls it “the invisible glue that holds the universe together”. In Experiments 1 to 5 of this group you
            met sigma, the difference between a hint and a discovery, and what happens when a new telescope looks further than any before it. This
            experiment is about a different kind of search: not looking at the sky, but waiting, deep underground, for a single particle to bump a
            single atom.
          </p>

          <p style={paragraph}>
            <strong>What would a dark-matter particle do?</strong> The gravity of dark matter is measured, but what it is made of is not known. One
            leading idea is that it is a particle that has mass and almost never touches anything else. As CERN puts it, dark matter “does not absorb,
            reflect or emit light”, which is why it is so hard to spot. Think of a ghost that walks through walls: it is there, but it almost never
            touches anything. If it is a particle, then nearly all of them pass through the Earth, and through you, without a trace. Once in a very
            great while, one might bump the nucleus of an atom.
          </p>

          <p style={paragraph}>
            <strong>How to catch one.</strong> One of the leading experiments of this kind is <strong>LZ</strong> (LUX-ZEPLIN), in South Dakota, which in December 2025 reported the largest dataset ever collected by a dark-matter detector. At its heart is a
            tank of liquid xenon: 10 tonnes in all, of which, LZ’s own site says, seven active tonnes act as the target. Xenon is a very heavy gas, made
            ultrapure and cooled until it is a liquid. The tank is kept nearly a mile underground, at the Sanford Underground Research Facility, so
            that the rock shields it from cosmic rays (fast particles from space) and other interference. If a <strong>dark-matter particle</strong> bumps a xenon nucleus (the tiny, heavy centre of a xenon atom), the atom
            gives out <strong>a flash of light and some electrons</strong>, and very sensitive sensors count both. Think of a single billiard ball
            hitting one ball in a huge, dark room: you never see the first ball, only the second one moving and the flash it makes. Other particles,
            such as ones given off by natural radioactivity, can bump a xenon nucleus too. That is one reason the tank is shielded by rock and
            built from very clean materials, and why the team must work out which bumps could not have come from dark matter. A bump is called a <strong>recoil</strong>, because the nucleus is knocked back.
          </p>

          <div style={{ marginBottom: '0.75rem', outline: stage === 1 ? `3px solid ${FLASH_COLOR}` : 'none', outlineOffset: '3px', borderRadius: '8px' }}>
            <DetectorDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is an illustration of the idea, not a plan of the real detector. The thick line at the top is
              the Earth’s surface. Below it is solid rock, and the vertical arrow shows that the tank is{' '}
              <strong>nearly a mile down</strong> (LZ’s own site gives its depth as the 4,850-foot level of the mine). The blue box is the tank of{' '}
              <strong>liquid xenon</strong>. The white blocks above and below it are the <strong>light sensors</strong>. The violet dashed arrow is a{' '}
              <strong>dark-matter particle</strong>, drawn as if one were passing through: nearly all would pass straight through without touching
              anything. The white dot is a xenon nucleus that has been <strong>bumped</strong>. The yellow star is the <strong>flash of light</strong> that
              this gives, and the green dots are the <strong>freed electrons</strong>. Both are what the sensors count. The point of the picture is that
              the experiment does not see the particle itself. It sees the flash and the electrons that a bump leaves behind. The sizes and the
              position of the bump are for illustration only.
            </p>
          </div>

          <p style={paragraph}>
            <strong>Strength, in plain words.</strong> How often a particle bumps something depends on how strongly it interacts. Physicists describe
            that as a <strong>cross-section</strong>, which you can picture as the size of the target the particle sees: a bigger target is bumped more
            often. It is written as an area, in square centimetres. A smaller number means a weaker interaction, and so fewer bumps.
          </p>

          <p style={paragraph}>
            <strong>How many bumps to expect.</strong> Think of rain on a roof. A bigger roof and a longer storm both mean more raindrops. In the same way
            the number of bumps you <em>expect</em> depends on how strong the interaction is, and on the <strong>exposure</strong>: how much xenon you
            have and how long you have watched it. Exposure is measured in <strong>tonne-years</strong>, and the days when the detector is taking good
            data are called <strong>live days</strong>. If the strength doubles, you expect twice as many bumps. If the exposure doubles, you also expect
            twice as many.
          </p>

          <p style={paragraph}>
            <strong>Counting, and what seeing nothing means.</strong> Expecting 5 bumps and seeing none would be very surprising. Expecting a tenth of
            a bump and seeing none would not be. So when a search sees nothing, it can rule out the strengths for which it would have expected to see
            something, and say nothing about weaker ones. A <strong>limit</strong> is where that line is drawn: the strength at which the experiment
            would have expected about {EXPECTED_AT_LIMIT.toFixed(1)} bumps, so that seeing none would happen about 1 time in 10. A limit is a statement
            about what the data allow. It is not a measurement of the particle.
          </p>

          <p style={paragraph}>
            <strong>The neutrino fog.</strong> A tank that sensitive picks up more than dark matter. Neutrinos (Experiment 4) come from the Sun’s core
            too, and a rare kind, called boron-8 neutrinos, sometimes bump a whole xenon nucleus at once. That gives the same kind of flash as a light
            dark-matter particle would. These neutrinos are a real signal, and they are also a background: the more sensitive the detector, the more
            they get in the way. This is called the <strong>neutrino fog</strong>. In December 2025 LZ saw the boron-8 neutrinos at{' '}
            {LZ_DECEMBER_2025.boron8Sigma} sigma, which its team calls strong evidence.
          </p>

          <p style={paragraph}>
            <strong>What LZ found.</strong> In December 2025 LZ reported that {LZ_DECEMBER_2025.liveDays} live days of data (March 2023 to April 2025)
            showed no sign of dark-matter particles of 3 to 9 times a proton’s mass, and the strongest limits yet above 5 times a proton’s mass. That
            narrows what dark matter can be: the simplest kinds of particle are ruled out at those masses and strengths. It does <em>not</em> show that
            dark matter does not exist, because its gravity is measured. In 2026 the experiment also looked at a wider range of recoil energies, up
            to much harder bumps, and found one event at a very high energy. What that event is, and how sure we can be that it means anything, is the other half of this
            experiment.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>WIMP</strong>: a “weakly interacting massive particle”, the kind of particle that many searches look for.
              </li>
              <li>
                <strong>Recoil</strong> and <strong>keV</strong>: a bump of a nucleus, and the unit, thousands of electron-volts, that measures how hard it
                was.
              </li>
              <li>
                <strong>Cross-section</strong>: the strength of an interaction, pictured as the size of a target. A smaller number is a weaker interaction.
              </li>
              <li>
                <strong>Exposure</strong>, <strong>tonne-year</strong> and <strong>live day</strong>: how much chance a detector has had to catch
                something.
              </li>
              <li>
                <strong>Limit</strong>: the strength at which you would expect about {EXPECTED_AT_LIMIT.toFixed(1)} bumps, so that seeing none is a 1-in-10
                accident.
              </li>
              <li>
                <strong>Background</strong> and <strong>neutrino fog</strong>: flashes that look like dark matter but are not, and the point where
                neutrinos from the Sun become one.
              </li>
              <li>
                <strong>Sigma</strong> (reminder from Experiments 1 and 2): how sure a result is. About 3 sigma is often called evidence, and 5 sigma is the
                usual bar for a discovery.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try a
            search of your own and change how many places were looked. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a counting model, and it is simpler than the real analysis. It treats the number of
            bumps you expect as proportional to the strength and to the exposure. It treats a limit as the strength at which you would expect about{' '}
            {EXPECTED_AT_LIMIT.toFixed(1)} bumps, as an illustration: LZ’s own limits come from a more detailed statistical method. Where it shows how
            a limit improves with more data, it uses two idealised cases, and these are not LZ’s own forecast. Where it asks how many places were
            looked, it treats them as separate tries with equal chance, which is not how LZ worked out its own number. And all the published numbers are
            quoted as the papers state them. This experiment cannot reproduce LZ’s limits, and it cannot say what the unusual event is.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links to the original scientific papers appear below the results,
            after you press Run, because their summaries state what the predictions ask, and you should get to guess first. Links open in a new tab. This
            page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://home.cern/science/physics/dark-matter">CERN: Dark matter</ExternalLink>: what dark matter is, why galaxies need
              it, and how physicists look for it, in plain words.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/dark-matter/">NASA: Dark matter</ExternalLink>: how dark matter was first suspected, how much
              of the universe it makes up, and how astronomers map it by the way its gravity bends light.
            </li>
            <li>
              <ExternalLink href="https://lz.lbl.gov/">LZ: the LUX-ZEPLIN experiment</ExternalLink>: the experiment’s own site, from the team that runs it,
              on what it is, how its detector is built and where it is.
            </li>
            <li>
              <ExternalLink href="https://www6.slac.stanford.edu/news/2025-12-08-lz-sets-worlds-best-hunt-galactic-dark-matter-and-gets-new-look-neutrinos-suns-core">
                SLAC: LZ sets a world’s best in the hunt for galactic dark matter (8 December 2025)
              </ExternalLink>
              : the announcement of the December 2025 results, with the live days, the masses searched and the solar neutrinos.
            </li>
            <li>
              <ExternalLink href="https://www.imperial.ac.uk/news/articles/natural-sciences/physics/2025/dark-matter-search-sets-new-limits-and-achieves-neutrino-breakthrough/">
                Imperial College London: Dark matter search sets new limits and achieves neutrino breakthrough (8 December 2025)
              </ExternalLink>
              : the same results explained in plain words, including how the detector turns a bump into a flash and electrons.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={done ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither
            says which answer is right, gives the 2.6 sigma, the number of places looked, or the 4.5 sigma of the solar neutrinos. */}
        {(
          [
            {
              title: 'Prediction 1: how many events?',
              text: (
                <>
                  An experiment’s best <strong>limit</strong> is the interaction strength at which it would expect to see about{' '}
                  {EXPECTED_AT_LIMIT.toFixed(1)} events, so that seeing none is a 1-in-10 accident. Suppose a particle’s interaction is{' '}
                  <strong>ten times weaker</strong> than that limit, and the experiment is run <strong>ten times longer</strong>, with no background.
                  How many events would it expect to see?
                </>
              ),
              choices: COUNT_CHOICES,
              value: countPrediction,
              set: (v: CountRange) => setCountPrediction(v),
            },
            {
              title: 'Prediction 2: how sure?',
              text: (
                <>
                  In 2026 the LZ experiment found one unexpected event. Counting only the place where the event appeared, the chance that chance
                  alone gives so strong an excess is that of a <strong>3.4 sigma</strong> result. But the search looked at many energies and many
                  kinds of signal, so some excess was likely to turn up somewhere. Taking that into account, is the significance:
                </>
              ),
              choices: EFFECT_CHOICES,
              value: effectPrediction,
              set: (v: GlobalEffect) => setEffectPrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginBottom: '2rem' }}>
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

        <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || hasRun} style={{ padding: '0.6rem 1.5rem' }}>
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {status === 'complete' && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && !hasRun && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}
        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}`}</strong>
              {status === 'complete' && <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>}
            </>
          )}
        </p>
        {stage === 1 && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            The detector counts flashes and electrons. The reference exposure here is the one behind LZ’s limit: {LZ_LIMIT_2025.exposureTonneYears}{' '}
            tonne-years, from {LZ_LIMIT_2025.liveDays} live days. The drawing from the introduction is outlined in yellow above, and shown again
            here.
          </p>
        )}
        {stage === 1 && (
          <div style={{ marginBottom: '1rem' }}>
            <DetectorDrawing />
          </div>
        )}

        {/* Picture 1 (Step 2: the skeleton). The curve is drawn; the limit, the shaded regions and the learner's own search come with Run. */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={P1_HEIGHT}
            viewBox={`0 0 ${VIEW_WIDTH} ${P1_HEIGHT}`}
            style={svgStyle}
            role="img"
            aria-label="A curve of the chance of seeing no events against the number of events expected, falling from 1 when none are expected toward 0"
          >
            <text x={P1_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 1: what does seeing nothing rule out?
            </text>

            {/* The axes and ticks. */}
            <line x1={P1_LEFT} y1={P1_BOTTOM} x2={P1_RIGHT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
            <line x1={P1_LEFT} y1={P1_TOP} x2={P1_LEFT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <g key={n}>
                <line x1={nToX(n)} y1={P1_BOTTOM} x2={nToX(n)} y2={P1_BOTTOM + 6} stroke={TEXT_COLOR} />
                <text x={nToX(n)} y={P1_BOTTOM + 20} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
                  {n}
                </text>
              </g>
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map((chance) => (
              <g key={chance}>
                <line x1={P1_LEFT - 6} y1={chanceToY(chance)} x2={P1_LEFT} y2={chanceToY(chance)} stroke={TEXT_COLOR} />
                <text x={P1_LEFT - 10} y={chanceToY(chance) + 3} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
                  {Math.round(chance * 100)}%
                </text>
              </g>
            ))}
            <text x={(P1_LEFT + P1_RIGHT) / 2} y={P1_BOTTOM + 40} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
              the number of events expected, if a particle of that strength were really there
            </text>
            <text x={P1_LEFT} y={P1_TOP - 8} fill={MUTED_COLOR} fontSize="10">
              the chance of seeing none
            </text>

            {/* The curve: the chance of seeing no events when N are expected (from the physics module). */}
            <path d={CURVE_POINTS} fill="none" stroke={CURVE_COLOR} strokeWidth={2.5} />
            <text x={nToX(0.2)} y={chanceToY(chanceOfNoEvents(0.2)) - 8} fill={CURVE_COLOR} fontSize="11" fontWeight="bold">
              chance of seeing none
            </text>

            {!p1Limit && (
              <text x={P1_LEFT} y={P1_HEIGHT - 12} fill={MUTED_COLOR} fontSize="11">
                Today’s limit, and the regions it rules out, are drawn here when you press Run.
              </text>
            )}
            {p1Limit && (
              <g>
                <rect x={P1_LEFT} y={P1_TOP} width={nToX(EXPECTED_AT_LIMIT) - P1_LEFT} height={P1_BOTTOM - P1_TOP} fill={NOT_RULED_OUT_COLOR} opacity={0.18} />
                <rect x={nToX(EXPECTED_AT_LIMIT)} y={P1_TOP} width={P1_RIGHT - nToX(EXPECTED_AT_LIMIT)} height={P1_BOTTOM - P1_TOP} fill={RULED_OUT_COLOR} opacity={0.18} />
                <line x1={P1_LEFT} y1={chanceToY(ZERO_EVENT_CHANCE)} x2={P1_RIGHT} y2={chanceToY(ZERO_EVENT_CHANCE)} stroke={MUTED_COLOR} strokeDasharray="4 4" />
                <text x={P1_RIGHT} y={chanceToY(ZERO_EVENT_CHANCE) - 5} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
                  10 percent: 1 time in 10
                </text>
                <line x1={nToX(EXPECTED_AT_LIMIT)} y1={P1_TOP} x2={nToX(EXPECTED_AT_LIMIT)} y2={P1_BOTTOM} stroke={FLASH_COLOR} strokeWidth={2} />
                <circle cx={nToX(EXPECTED_AT_LIMIT)} cy={chanceToY(ZERO_EVENT_CHANCE)} r={5} fill={FLASH_COLOR} />
                <text x={nToX(EXPECTED_AT_LIMIT)} y={P1_TOP - 8} fill={FLASH_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
                  today’s limit: {EXPECTED_AT_LIMIT.toFixed(2)} events
                </text>
                {done && mine.expected <= P1_MAX_N && (
                  <g>
                    <circle cx={nToX(mine.expected)} cy={chanceToY(mine.chanceOfNoEvents)} r={6} fill="none" stroke={ELECTRON_COLOR} strokeWidth={2.5} />
                    <text x={nToX(mine.expected)} y={chanceToY(mine.chanceOfNoEvents) - 12} fill={ELECTRON_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
                      your search: {mine.expected.toFixed(2)}
                    </text>
                  </g>
                )}
                <text x={(P1_LEFT + nToX(EXPECTED_AT_LIMIT)) / 2} y={P1_BOTTOM - 10} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
                  not ruled out
                </text>
                <text x={(nToX(EXPECTED_AT_LIMIT) + P1_RIGHT) / 2} y={P1_BOTTOM - 10} fill={RULED_OUT_COLOR} fontSize="11" textAnchor="middle">
                  ruled out
                </text>
              </g>
            )}
          </svg>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>How to read Picture 1.</strong> This picture is about a search that sees <em>nothing</em>. The horizontal line is the number of events
            the experiment would <strong>expect</strong> to count if a particle of some given strength were really there. Further to the right means a
            stronger interaction (or more exposure). The vertical line is the <strong>chance of seeing none</strong>, from 0 percent to 100 percent.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The orange curve</strong> gives that chance for every expected number. At the far left, nothing is expected, so seeing none is
              certain (100 percent). As the expected number grows, seeing none becomes less and less likely. <strong>A curve that falls faster</strong>{' '}
              would mean that seeing nothing rules out more.
            </li>
            <li>
              <strong>The yellow line and dot</strong> (after you press Run) mark <strong>today’s limit</strong>: the expected number of events,{' '}
              {EXPECTED_AT_LIMIT.toFixed(2)}, at which the chance of seeing none is 10 percent, shown by the dashed grey line.
            </li>
            <li>
              <strong>The green ring</strong> (after the run, once you try your own search below) is your own search: where it sits on the curve.
              If it is far to the right, seeing nothing would rule out a particle like yours. If it is to the left, it would not. A ring beyond the
              right edge, at more than 6 events, is not drawn.
            </li>
            <li>
              <strong>The red shading</strong> to the right is <strong>ruled out</strong>: for those strengths, seeing nothing would have been a
              less-than-1-in-10 accident. <strong>The grey shading</strong> to the left is <strong>not ruled out</strong>: seeing nothing is quite
              likely there, so it tells you little.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> Suppose the experiment expects 1 event. The curve says the chance of seeing none is{' '}
            {(chanceAt1 * 100).toFixed(1)} percent, which is not unusual: seeing nothing would tell you little. Suppose it expects 5 events. Then the
            chance of seeing none is only {(chanceAt5 * 100).toFixed(1)} percent, so if nothing is seen, a particle that strong is very unlikely to be
            there.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What to look for.</strong> How quickly the curve falls, and where it crosses the 10 percent line. Everything to the right of that
            crossing is ruled out by seeing nothing. Everything to the left is not.
          </p>
        </div>

        {/* Picture 2: more data, weaker interactions. Both lines are the physics module's idealised rules, not LZ's projection. */}
        <div style={{ margin: '1.5rem 0 1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={P2_HEIGHT}
            viewBox={`0 0 ${VIEW_WIDTH} ${P2_HEIGHT}`}
            style={svgStyle}
            role="img"
            aria-label="Two lines showing how the limit on the interaction strength falls as the live days grow from 280 to 1,000, one with no background and one with a background that grows"
          >
            <text x={P2_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 2: more data, weaker interactions
            </text>
            <line x1={P2_LEFT} y1={P2_BOTTOM} x2={P2_RIGHT} y2={P2_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
            <line x1={P2_LEFT} y1={P2_TOP} x2={P2_LEFT} y2={P2_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
            {[280, 400, 600, 800, 1000].map((days) => (
              <g key={days}>
                <line x1={daysToX(days)} y1={P2_BOTTOM} x2={daysToX(days)} y2={P2_BOTTOM + 6} stroke={TEXT_COLOR} />
                <text x={daysToX(days)} y={P2_BOTTOM + 20} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
                  {days}
                </text>
              </g>
            ))}
            {[5e-49, 1e-48, 2e-48].map((value) => (
              <g key={value}>
                <line x1={P2_LEFT - 6} y1={limitToY(value)} x2={P2_LEFT} y2={limitToY(value)} stroke={TEXT_COLOR} />
                <text x={P2_LEFT - 10} y={limitToY(value) + 3} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
                  {formatCm2(value, 1).replace(' cm²', '')}
                </text>
              </g>
            ))}
            <text x={(P2_LEFT + P2_RIGHT) / 2} y={P2_BOTTOM + 40} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
              live days of data (a logarithmic scale)
            </text>
            <text x={P2_LEFT} y={44} fill={MUTED_COLOR} fontSize="10">
              the limit on the strength, in cm² (weaker is lower)
            </text>
            {!p2Shown && (
              <text x={P2_LEFT} y={P2_HEIGHT - 12} fill={MUTED_COLOR} fontSize="11">
                The two lines are drawn here when you press Run.
              </text>
            )}
            {done && !exposureInRange && (
              <text x={P2_LEFT} y={P2_HEIGHT - 12} fill={ELECTRON_COLOR} fontSize="11">
                Your exposure ({Math.round(P2_MIN_DAYS * exposure).toLocaleString('en-US')} live days) is beyond the right edge of this picture.
              </text>
            )}
            {p2Shown && (
              <g>
                <path d={limitPath('grows')} fill="none" stroke={GROWS_COLOR} strokeWidth={2.5} />
                <path d={limitPath('none')} fill="none" stroke={NO_BACKGROUND_COLOR} strokeWidth={2.5} />
                {done && exposureInRange && (
                  <g>
                    <line x1={daysToX(P2_MIN_DAYS * exposure)} y1={P2_TOP} x2={daysToX(P2_MIN_DAYS * exposure)} y2={P2_BOTTOM} stroke={ELECTRON_COLOR} strokeDasharray="3 3" />
                    <circle cx={daysToX(P2_MIN_DAYS * exposure)} cy={limitToY(LZ_LIMIT_2025.crossSectionCm2 * mine.limitFactor)} r={5} fill="none" stroke={ELECTRON_COLOR} strokeWidth={2.5} />
                    <text x={daysToX(P2_MIN_DAYS * exposure) + 6} y={P2_BOTTOM - 6} fill={ELECTRON_COLOR} fontSize="10">
                      your exposure
                    </text>
                  </g>
                )}
                <circle cx={daysToX(P2_MIN_DAYS)} cy={limitToY(LZ_LIMIT_2025.crossSectionCm2)} r={5} fill={FLASH_COLOR} />
                <text x={daysToX(P2_MIN_DAYS) + 8} y={limitToY(LZ_LIMIT_2025.crossSectionCm2) - 9} fill={FLASH_COLOR} fontSize="11" fontWeight="bold">
                  LZ’s limit now: {formatCm2(LZ_LIMIT_2025.crossSectionCm2)}
                </text>
                <circle cx={daysToX(P2_MAX_DAYS)} cy={limitToY(growsAt)} r={4} fill={GROWS_COLOR} />
                <text x={daysToX(P2_MAX_DAYS) + 8} y={limitToY(growsAt) + 4} fill={GROWS_COLOR} fontSize="10">
                  {formatCm2(growsAt)}
                </text>
                <circle cx={daysToX(P2_MAX_DAYS)} cy={limitToY(noneAt)} r={4} fill={NO_BACKGROUND_COLOR} />
                <text x={daysToX(P2_MAX_DAYS) + 8} y={limitToY(noneAt) + 4} fill={NO_BACKGROUND_COLOR} fontSize="10">
                  {formatCm2(noneAt)}
                </text>
                <text x={daysToX(560)} y={limitToY(limitAtLiveDays(560, 'grows')) - 10} fill={GROWS_COLOR} fontSize="11" fontWeight="bold">
                  a background that grows with the data
                </text>
                <text x={daysToX(420)} y={limitToY(limitAtLiveDays(420, 'none')) + 34} fill={NO_BACKGROUND_COLOR} fontSize="11" fontWeight="bold">
                  no background
                </text>
              </g>
            )}
          </svg>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>How to read Picture 2.</strong> This picture asks what happens to a limit when the detector keeps running and still sees nothing. Remember that a limit
            is the weakest strength that seeing nothing rules out. A detector that runs longer has more exposure, so for any given strength it expects
            more bumps. A strength that was too weak to expect a bump after one year may be strong enough to expect one after four. If the detector
            still sees none, even those weaker strengths are now ruled out, so <strong>the limit moves down to weaker and weaker interactions</strong>.
            Everyday comparison: if you listen for a very faint sound for one minute and hear nothing, you can only say it is not loud. If you listen
            for an hour and still hear nothing, you can say it is not even faint. The picture shows how fast that happens. It is an{' '}
            <strong>illustration with two idealised cases, not LZ’s own forecast</strong>. The horizontal line is the number of <strong>live days</strong>{' '}
            (days of good data), from {LZ_LIMIT_2025.liveDays} today to 1,000, which LZ plans to reach by 2028. The vertical line is the{' '}
            <strong>limit</strong>, the weakest strength that seeing nothing rules out, in cm². <strong>Both scales are logarithmic</strong>: each step along
            a line multiplies the value, instead of adding to it, so numbers that differ a lot fit in one picture.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The yellow dot</strong> is LZ’s limit now: {formatCm2(LZ_LIMIT_2025.crossSectionCm2)} after {LZ_LIMIT_2025.liveDays} live days.
            </li>
            <li>
              <strong>The green line</strong> is the limit if there is <strong>no background</strong>. Twice the data then rules out interactions twice as
              weak.
            </li>
            <li>
              <strong>The pink line</strong> is the limit if <strong>a background grows in step with the data</strong>. Extra flashes that are not dark
              matter get in the way, so twice the data improves the limit only by about 1.4 times (the square root of 2).
            </li>
            <li>
              <strong>The green ring and dashed line</strong> (after the run, once you try your own search below) mark your own exposure, on the
              line you chose. They are not drawn if your exposure is beyond 1,000 live days, the right edge.
            </li>
            <li>
              <strong>A lower line means a better search</strong>: it rules out weaker interactions. The real limit would lie between the two lines.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> From {LZ_LIMIT_2025.liveDays} to 1,000 live days is {daysRatio.toFixed(3)} times as much data (1,000 ÷{' '}
            {LZ_LIMIT_2025.liveDays}). With no background, the limit falls by that factor: {formatCm2(LZ_LIMIT_2025.crossSectionCm2)} ÷{' '}
            {daysRatio.toFixed(3)} = {formatCm2(noneAt)}. With a growing background it falls only by the square root of {daysRatio.toFixed(3)}, which is{' '}
            {Math.sqrt(daysRatio).toFixed(2)}: {formatCm2(LZ_LIMIT_2025.crossSectionCm2)} ÷ {Math.sqrt(daysRatio).toFixed(2)} = {formatCm2(growsAt)}.
            Everyday comparison: a flashlight in a dark room finds a faint object faster with a longer look, but in a room full of mist, a longer look
            helps much less.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What to look for.</strong> How far apart the two lines are by 1,000 live days, and what that gap says about how much a background
            can slow the progress of a search. The neutrino fog is not drawn: how high it is depends on the particle’s mass.
          </p>
        </div>

        {/* Picture 3: a ladder of sigma. The first three bars come in stage 4, the last two in stage 5. */}
        <div style={{ margin: '1.5rem 0 1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={P3_HEIGHT}
            viewBox={`0 0 ${VIEW_WIDTH} ${P3_HEIGHT}`}
            style={svgStyle}
            role="img"
            aria-label="Bars of how many sigma each result reaches: three detections of boron-8 solar neutrinos, then the 2026 event counted two ways, against lines at 3 sigma and 5 sigma"
          >
            <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 3: how sure? A ladder of sigma
            </text>
            {[0, 1, 2, 3, 4, 5].map((sigma) => (
              <g key={sigma}>
                <line x1={sigmaToX(sigma)} y1={P3_TOP - 6} x2={sigmaToX(sigma)} y2={P3_TOP + 5 * P3_ROW} stroke={MUTED_COLOR} strokeWidth={0.5} opacity={0.5} />
                <text x={sigmaToX(sigma)} y={P3_TOP + 5 * P3_ROW + 16} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
                  {sigma}
                </text>
              </g>
            ))}
            <text x={(P3_LEFT + P3_RIGHT) / 2} y={P3_TOP + 5 * P3_ROW + 34} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
              sigma: how sure the result is (a longer bar is more sure)
            </text>
            <line x1={sigmaToX(3)} y1={P3_TOP - 14} x2={sigmaToX(3)} y2={P3_TOP + 5 * P3_ROW} stroke={FLASH_COLOR} strokeDasharray="4 4" />
            <text x={sigmaToX(3) + 30} y={P3_TOP - 18} fill={FLASH_COLOR} fontSize="10" textAnchor="end">
              3 sigma: evidence
            </text>
            <line x1={sigmaToX(5)} y1={P3_TOP - 14} x2={sigmaToX(5)} y2={P3_TOP + 5 * P3_ROW} stroke={ELECTRON_COLOR} strokeDasharray="4 4" />
            <text x={sigmaToX(5) - 20} y={P3_TOP - 18} fill={ELECTRON_COLOR} fontSize="10" textAnchor="start">
              5 sigma: discovery
            </text>
            {stage < 4 && (
              <text x={20} y={P3_HEIGHT - 12} fill={MUTED_COLOR} fontSize="11">
                The bars are drawn here when you press Run.
              </text>
            )}
            {SIGMA_LADDER.map((rung, i) => {
              if (stage < (rung.kind === 'detection' ? 4 : 5)) return null
              const y = P3_TOP + i * P3_ROW + 4
              const color = rung.kind === 'detection' ? XENON_COLOR : FLASH_COLOR
              return (
                <g key={rung.name}>
                  <text x={P3_LEFT - 8} y={y + 14} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
                    {i === 3 ? 'LZ 2026 event, at its own place' : i === 4 ? (done ? `LZ 2026 event, ${tries} places counted` : 'LZ 2026 event, all places counted') : rung.name}
                  </text>
                  <rect x={P3_LEFT} y={y} width={sigmaToX(i === 4 ? mine.globalSigma : rung.sigma) - P3_LEFT} height={22} fill={color} opacity={0.85} />
                  <text x={sigmaToX(i === 4 ? mine.globalSigma : rung.sigma) + 6} y={y + 15} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
                    {i === 4 ? mine.globalSigma.toFixed(1) : rung.sigma} sigma
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <p style={paragraph}>
            <strong>How to read Picture 3.</strong> <strong>Sigma</strong> says how sure a result is (Experiments 1 and 2 of this group): the bigger it
            is, the less likely the result is just chance. Each bar is one published result, and a longer bar means a more sure result. The dashed
            yellow line at 3 sigma is where a result is often called <strong>evidence</strong>, and the dashed green line at 5 sigma is the usual bar
            for a <strong>discovery</strong>.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The first three, blue bars</strong> (they appear in stage 4) are three detections of <strong>boron-8 neutrinos</strong> from the
              Sun, by PandaX-4T, XENONnT and LZ. They are real signals that a dark-matter detector can see, not dark matter.
            </li>
            <li>
              <strong>The last two, yellow bars</strong> (they appear in stage 5) are LZ’s one unexpected event of 2026, counted in two ways: first
              only at the one place where it appeared, and then with all the places the search looked counted. The results explain how the second
              number is worked out after the run.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> LZ’s detection of the solar neutrinos is at {LZ_DECEMBER_2025.boron8Sigma} sigma, which is past the 3 sigma
            line and not yet at the 5 sigma line: strong evidence, and not yet a discovery by that bar. At 3 sigma, the chance that chance alone gives
            so strong a result is about 1 in {Math.round(1 / oneSidedChance(3)).toLocaleString('en-US')} (counting one direction only).
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What to look for.</strong> Which bars cross the 3 sigma line, which reach the 5 sigma line, and how the two yellow bars compare with
            each other and with the blue ones.
          </p>
        </div>

        {/* After the run: the two controls, the neutral results and the links kept back until now. Draft wording for the owner's review
            (CLAUDE.md §28.1, §29). The results only report; they do not say why (the tutor explains). */}
        {done && (
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Try your own search</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              Choose how strong a particle’s interaction is and how long the detector runs, and see what a search would expect to count. The strength
              is in units of today’s limit (1 is the limit, 0.1 is ten times weaker), and the exposure is in units of the reference exposure (1 is{' '}
              {LZ_LIMIT_2025.exposureTonneYears} tonne-years, 10 is ten times as much). Picture 1’s green ring, Picture 2’s green marker and the first
              table change with your choice. Your predictions stay as they are.
            </p>
            <div style={{ marginBottom: '0.75rem' }}>
              <label htmlFor="search-strength" style={{ display: 'block', marginBottom: '0.25rem' }}>
                Strength: <strong>{strength}</strong> times today’s limit
              </label>
              <input id="search-strength" type="range" min={-1} max={1} step={0.05} value={strengthPower} onChange={(e) => setStrengthPower(Number(e.target.value))} style={{ width: '100%', maxWidth: '420px' }} />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label htmlFor="search-exposure" style={{ display: 'block', marginBottom: '0.25rem' }}>
                Exposure: <strong>{exposure}</strong> times the reference exposure
              </label>
              <input id="search-exposure" type="range" min={0} max={3} step={0.05} value={exposurePower} onChange={(e) => setExposurePower(Number(e.target.value))} style={{ width: '100%', maxWidth: '420px' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              {(
                [
                  { value: 'none', label: 'No background' },
                  { value: 'grows', label: 'A background that grows with the data' },
                ] as const
              ).map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => setBackground(choice.value)}
                  className={`toggle-button${background === choice.value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {choice.label}
                </button>
              ))}
            </div>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>How many places did you look?</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              The 2026 search looked at many energies and kinds of signal. Choose how many separate places it looked, and see what the strength of the
              event becomes when all of them are counted. About {TRIES_FOR_LZ_GLOBAL.toFixed(0)} places give the published number, in this simple
              illustration. Picture 3’s last bar and the second table change with your choice.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="search-tries" style={{ display: 'block', marginBottom: '0.25rem' }}>
                Places looked: <strong>{tries}</strong>
              </label>
              <input id="search-tries" type="range" min={MIN_TRIES} max={MAX_TRIES} step={1} value={tries} onChange={(e) => setTries(Number(e.target.value))} style={{ width: '100%', maxWidth: '420px' }} />
            </div>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 1: your own search</p>
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '420px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>Quantity</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>Value</th>
                    <th style={{ padding: '0.4rem 0 0.4rem 0.5rem' }}>How it is worked out</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['Strength', `${strength} × today’s limit`, 'the value you chose'],
                      ['Exposure', `${exposure} × the reference`, `the value you chose (the reference is ${LZ_LIMIT_2025.exposureTonneYears} tonne-years)`],
                      ['Expected events', mine.expected.toFixed(3), `${EXPECTED_AT_LIMIT.toFixed(4)} × ${strength} × ${exposure}`],
                      ['Chance of seeing none', `${(mine.chanceOfNoEvents * 100).toFixed(1)} percent`, `e^(−${mine.expected.toFixed(3)})`],
                      ['Chance of seeing at least one', `${(mine.chanceOfAtLeastOneEvent * 100).toFixed(1)} percent`, `1 − ${mine.chanceOfNoEvents.toFixed(4)}`],
                      ['Limit after this exposure, no background', formatCm2(limitAtLiveDays(LZ_LIMIT_2025.liveDays * exposure, 'none')), `${formatCm2(LZ_LIMIT_2025.crossSectionCm2)} ÷ ${exposure}`],
                      [
                        'Limit after this exposure, growing background',
                        formatCm2(limitAtLiveDays(LZ_LIMIT_2025.liveDays * exposure, 'grows')),
                        `${formatCm2(LZ_LIMIT_2025.crossSectionCm2)} ÷ √${exposure} (√${exposure} = ${Math.sqrt(exposure).toFixed(2)})`,
                      ],
                    ] as const
                  ).map(([quantity, value, how]) => (
                    <tr key={quantity} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                      <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>{quantity}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', whiteSpace: 'nowrap' }}>{value}</td>
                      <td style={{ padding: '0.4rem 0 0.4rem 0.5rem', color: 'var(--text-muted)' }}>{how}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
                The “background” rows are the experiment’s own idealised rules, not LZ’s forecast. The background you chose above ({background === 'none' ? 'none' : 'growing'}) is the one used in the Picture 2 marker.
              </p>
            </div>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 2: the published results</p>
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '560px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>Result</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>Year</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>Value</th>
                    <th style={{ padding: '0.4rem 0 0.4rem 0.5rem' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['LZ: limit on the strength (40 GeV/c²)', '2025', `${formatCm2(LZ_LIMIT_2025.crossSectionCm2)} after ${LZ_LIMIT_2025.exposureTonneYears} tonne-years`, LZ_LIMIT_2025.source],
                      ['XENONnT: limit on the strength (30 GeV/c²)', '2025', `${formatCm2(XENONNT_LIMIT.crossSectionCm2)} after ${XENONNT_LIMIT.exposureTonneYears} tonne-years`, XENONNT_LIMIT.source],
                      ['LZ: boron-8 solar neutrinos', '2025', `${LZ_DECEMBER_2025.boron8Sigma} sigma, from ${LZ_DECEMBER_2025.liveDays} live days`, LZ_DECEMBER_2025.source],
                      ['XENONnT: boron-8 solar neutrinos', 'earlier', `${OTHER_BORON8_SIGMAS.xenonNT} sigma`, 'as stated in the SLAC release'],
                      ['PandaX-4T: boron-8 solar neutrinos', 'earlier', `${OTHER_BORON8_SIGMAS.pandaX4T} sigma`, 'as stated in the SLAC release'],
                      ['LZ: the unexpected event, at its own place (the largest local significance across the models tested)', '2026', `${LZ230616.localSigma} sigma, at ${LZ230616.energyKeV} keV (give or take ${LZ230616.statisticalKeV} statistical and ${LZ230616.systematicKeV} systematic), after ${LZ230616.exposureTonneYears} tonne-years: a chance of ${mine.localChance.toExponential(2)} (about 1 in ${Math.round(1 / mine.localChance).toLocaleString('en-US')})`, LZ230616.source],
                      ['LZ: the unexpected event, all places looked counted (global significance)', '2026', `${LZ230616.globalSigma} sigma as published`, LZ230616.source],
                    ] as const
                  ).map(([result, year, value, source]) => (
                    <tr key={result} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                      <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>{result}</td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>{year}</td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>{value}</td>
                      <td style={{ padding: '0.4rem 0 0.4rem 0.5rem', color: 'var(--text-muted)' }}>{source}</td>
                    </tr>
                  ))}
                  <tr style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                    <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>For {tries} places looked (your choice)</td>
                    <td style={{ padding: '0.4rem 0.5rem' }}>2026</td>
                    <td style={{ padding: '0.4rem 0.5rem' }}>
                      chance {mine.globalChance.toFixed(4)} (about 1 in {Math.round(1 / mine.globalChance).toLocaleString('en-US')}), which is {mine.globalSigma.toFixed(2)} sigma
                    </td>
                    <td style={{ padding: '0.4rem 0 0.4rem 0.5rem', color: 'var(--text-muted)' }}>this experiment’s simple illustration, from the local 3.4 sigma</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Want to know more?</strong> The scientific papers behind these numbers are listed here now, because their summaries state what the
              predictions asked. They are written for scientists. Links open in a new tab.
            </p>
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2609.02823">LZ Collaboration, September 2026 (arXiv:2609.02823)</ExternalLink>: the search that
                found the unexpected event, over an extended range of recoil energies.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2609.08893">Yuan and colleagues, September 2026 (arXiv:2609.08893)</ExternalLink>: one theory
                idea for what the event could be: a heavier kind of dark-matter particle that bumps a nucleus and changes in the process.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2609.10504">Chattaraj and colleagues, September 2026 (arXiv:2609.10504)</ExternalLink>: a check of
                whether neutrinos bumping a nucleus could account for the event.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2410.17036">LZ Collaboration, 2025 (arXiv:2410.17036)</ExternalLink>: the limit of{' '}
                {formatCm2(LZ_LIMIT_2025.crossSectionCm2)} from {LZ_LIMIT_2025.exposureTonneYears} tonne-years of data.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2502.18005">XENONnT Collaboration, 2025 (arXiv:2502.18005)</ExternalLink>: the rival experiment’s
                search with {XENONNT_LIMIT.exposureTonneYears} tonne-years of data.
              </li>
            </ul>
          </div>
        )}

        {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The summary below the experiment
            (in App) is shown only once the learner reaches the explanation. */}
        {done && countPrediction !== null && effectPrediction !== null && (
          <DarkMatterSearchesTutor
            strength={strength}
            exposure={exposure}
            background={background}
            tries={tries}
            countPrediction={countPrediction}
            effectPrediction={effectPrediction}
            onExplained={() => onTutorComplete?.()}
          />
        )}
      </div>
    </div>
  )
}
