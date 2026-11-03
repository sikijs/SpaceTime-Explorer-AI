import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { RECOMBINATION_REDSHIFT, RECOMBINATION_YEARS_AFTER_BIG_BANG, CMB_TEMPERATURE_TODAY_KELVIN } from '../physics/cosmicMicrowaveBackgroundExperiment'
import {
  CEILINGS,
  DESI_JULY_2026,
  MASS_SQUARED_GAPS,
  MAX_TOTAL_MASS_EV,
  NEUTRINO_TEMPERATURE_TODAY_KELVIN,
  neutrinoCheckUp,
  oscillationFloor,
  roomGuessBand,
  runNeutrinoMass,
  clumpSmoothing,
  BOUNDS,
  TYPICAL_ENERGY_TODAY_EV,
  BOLTZMANN_EV_PER_KELVIN,
  energyDensityShare,
  EV_FOR_ONE_OMEGA_H_SQUARED,
  HUBBLE_PARAMETER_H,
  MEAN_ENERGY_IN_KT,
  OMEGA_MATTER,
  PREDICTION_TOTAL_MASS_EV,
  SMOOTHING_FACTOR,
  timingGuessSide,
} from '../physics/neutrinoMass'
import type { HeavyTiming, Room, RoomRange } from '../physics/neutrinoMass'
import { formatTotal, NeutrinoMassTutor } from './NeutrinoMassTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Cosmic Horizons, Experiment 4 (docs/experiments/cosmic-horizons/04-can-the-universe-weigh-a-neutrino.md).
// Step 2 built the status label, the introduction with its new-word list and its "Want to know more?" links, a drawing of the relic neutrino
// sea, and the skeleton of Picture 1 with its guide. Step 3 added the two predictions, Run, the staged run, the neutrinos' turning point on
// Picture 1, and Pictures 2 and 3 with their guides. Step 4 added the "Try a different total mass" control, the neutral results tables and their
// guide, the formulas in the "Words and formulas" panel and the links kept back until the results (all shown after the run). Step 5 adds the
// tutor (NeutrinoMassTutor.tsx) and the chapter summary (in App.tsx). The owner approved all the wording of this page on 2026-10-19 (CLAUDE.md §28.1: "wording approved"); the
// owner also approved the differences from the specification, listed in its Implementation Notes, on 2026-10-19 (CLAUDE.md §28.1), written to the standard of §29. The interface only
// displays numbers from src/physics (CLAUDE.md §9); the only calculation
// here is where a point is drawn.

interface NeutrinoMassExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14, "Predictions and the Real Results")
const TRIAL_COLOR = '#f472b6' // pink: the total mass the learner chose in Part 2 (it starts at DESI's limit)
const LIGHT_COLOR = '#38bdf8' // sky blue: the microwave background (light), as in Experiment 3
const NEUTRINO_COLOR = '#a78bfa' // violet: neutrinos

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

// The four Parts of the page (CLAUDE.md §14, "The Page in Four Parts"): a thick coloured line, a coloured heading and a short lead.
function PartHeader({ color, title, children }: { color: string; title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${color}` }}>
      <h3 style={{ margin: '0 0 0.5rem', color }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
        <strong>What we are about to do.</strong> {children}
      </p>
    </div>
  )
}
const TIMING_SHORT = { before: 'before the release', after: 'after the release' } as const
const ROOM_SHORT = { plenty: 'plenty of room', veryLittle: 'very little room', none: 'no room' } as const
const GUESS_PANEL1_H = 76
const GUESS_PANEL3_H = 116

// ---- The relic sea (an illustration, not data) ----
// A seeded random-number generator, so the drawing is the same every time.
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const SEA_W = 250
const SEA_H = 118
const SEA_TOP = 44
const SEA_X = [20, 290]
const PHOTONS = (() => {
  const rand = seeded(11)
  return Array.from({ length: 46 }, () => ({ x: 6 + rand() * (SEA_W - 12), y: 6 + rand() * (SEA_H - 12) }))
})()
const NEUTRINOS = (() => {
  const rand = seeded(29)
  return Array.from({ length: 46 }, () => ({ x: 6 + rand() * (SEA_W - 12), y: 6 + rand() * (SEA_H - 12) }))
})()

function RelicSeaDrawing() {
  const height = SEA_TOP + SEA_H + 62
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Two patches of space side by side, one filled with light left over from the Big Bang and one with neutrinos left over from the Big Bang"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: two leftovers from the Big Bang
      </text>
      {[
        { x: SEA_X[0], color: LIGHT_COLOR, dots: PHOTONS, title: 'Leftover light (the microwave background)', temp: `${CMB_TEMPERATURE_TODAY_KELVIN} K` },
        { x: SEA_X[1], color: NEUTRINO_COLOR, dots: NEUTRINOS, title: 'Leftover neutrinos (the “neutrino sea”)', temp: `about ${NEUTRINO_TEMPERATURE_TODAY_KELVIN.toFixed(2)} K (colder)` },
      ].map((panel) => (
        <g key={panel.title}>
          <text x={panel.x} y={SEA_TOP - 8} fill={panel.color} fontSize="11" fontWeight="bold">
            {panel.title}
          </text>
          <rect x={panel.x} y={SEA_TOP} width={SEA_W} height={SEA_H} fill="none" stroke={MUTED_COLOR} strokeDasharray="4 3" rx={6} />
          {panel.dots.map((d, i) => (
            <circle key={i} cx={panel.x + d.x} cy={SEA_TOP + d.y} r={panel.color === NEUTRINO_COLOR ? 3.2 : 2.2} fill={panel.color} opacity={0.9} />
          ))}
          <text x={panel.x} y={SEA_TOP + SEA_H + 18} fill={TEXT_COLOR} fontSize="11">
            Temperature today:
          </text>
          <text x={panel.x} y={SEA_TOP + SEA_H + 34} fill={panel.color} fontSize="12" fontWeight="bold">
            {panel.temp}
          </text>
        </g>
      ))}
      <text x={20} y={SEA_TOP + SEA_H + 56} fill={MUTED_COLOR} fontSize="10">
        A thimble-sized patch of empty space, magnified. The number of dots is for illustration only.
      </text>
    </svg>
  )
}

// ---- Picture 1: when do the neutrinos turn heavy? (Step 2: the timeline and the microwave background's release) ----
const AXIS_LEFT = 40
const AXIS_RIGHT = 520
const AXIS_MAX_Z = 1100
const AXIS_Y = 166
const TICK_REDSHIFTS = [0, 10, 100, 1000]
// The line is not even: it spaces 1 + z (how much the universe has stretched), not z, so that early times are not squeezed into a speck.
const STAGE_MS = 2600
const STAGES = [
  'The cold sea of neutrinos',
  'When they turn heavy',
  'How much matter they make up',
  'What they do to small clumps',
  'The floor and the ceilings',
]
const LAST_STAGE = STAGES.length
// The run uses DESI's July 2026 limit as the total (the default of the later "Try a different total mass" control). The predictions use 0.06 eV.
const RUN_TOTAL_MASS_EV = DESI_JULY_2026.value

// "Try a different total mass": the totals offered after the run (the default is DESI's July 2026 limit).
const TOTAL_PRESETS: ReadonlyArray<{ value: number; label: string }> = [
  { value: RUN_TOTAL_MASS_EV, label: `${RUN_TOTAL_MASS_EV} eV (DESI, July 2026 upper limit)` },
  { value: 0.1, label: '0.10 eV (about the inverted-ordering floor)' },
  { value: 0.12, label: '0.12 eV (Planck 2018 upper limit)' },
  { value: 0.3, label: '0.30 eV' },
  { value: MAX_TOTAL_MASS_EV, label: '0.50 eV (the most this model handles)' },
]

const TIMING_CHOICES: ReadonlyArray<{ value: HeavyTiming; label: string }> = [
  { value: 'before', label: 'Before the microwave background was released' },
  { value: 'after', label: 'After the microwave background was released' },
]
const ROOM_CHOICES: ReadonlyArray<{ value: RoomRange; label: string }> = [
  { value: 'plenty', label: 'Plenty of room (the maximum is more than 20 percent above the minimum)' },
  { value: 'veryLittle', label: 'Very little room (the maximum is at most 20 percent above the minimum)' },
  { value: 'none', label: 'No room (the maximum is below the minimum)' },
]

const FLOOR_COLOR = '#34d399' // green: the laboratory floors
const CEILING_COLOR = '#fb923c' // orange: the sky's ceilings
const PALE_CEILING_COLOR = '#fdba74' // paler orange: the ceiling that assumes an evolving dark energy
const HEAVY_COLOR = TRIAL_COLOR // pink: the turning point for the total the learner chose

const xOfZ = (z: number) => AXIS_RIGHT - (Math.log10(1 + z) / Math.log10(1 + AXIS_MAX_Z)) * (AXIS_RIGHT - AXIS_LEFT)

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Neutrino', meaning: 'a particle with no electric charge that hardly ever interacts with anything, so it passes through ordinary matter almost untouched. It comes in three kinds (electron, muon and tau), and it has a very small mass.' },
  { term: 'Electron-volt (eV)', meaning: 'a tiny unit of energy. Because mass and energy are linked (E = mc², Spacetime Geometry Experiment 5), it is also used for mass: an electron weighs about 511,000 eV, and a neutrino less than 0.1 eV.' },
  { term: 'The neutrino sea (cosmic neutrino background)', meaning: 'the neutrinos left over from the first second of the Big Bang. They fill all of space, like the microwave background, which is leftover light. They have been flying freely ever since, so they are colder than the light.' },
  { term: 'Light-like and matter-like', meaning: 'a particle that carries far more energy than its own mass energy (E = mc²) moves almost at the speed of light and acts like light. When it has cooled so that its energy is below its mass energy it moves slowly and acts like matter. The same neutrino is light-like when the universe is hot and matter-like when it is cool.' },
  { term: 'Redshift (z)', meaning: 'a way of saying how long ago, from Cosmology Experiments 1 and 3. z = 0 is today. The larger z is, the longer ago, and 1 + z is how many times smaller the universe was then. A redshift of 1,089.8 means the universe was 1,090.8 times smaller.' },
  { term: 'Oscillation', meaning: 'the way a neutrino of one kind turns into another kind as it flies. This can only happen if the kinds have different masses, so seeing it proves that neutrinos have mass. It tells us how far apart the masses are, not how big they are.' },
  { term: 'Floor and ceiling', meaning: 'two limits on the sum of the three neutrino masses. The floor is a minimum, from oscillation experiments: the masses cannot add up to less. The ceiling is a maximum: they cannot add up to more.' },
  { term: 'Normal and inverted ordering', meaning: 'two possible patterns for the three masses. In the normal ordering one neutrino is much heavier than the other two, and the floor is about 0.059 eV. In the inverted ordering two are heavy and close together, and the floor is about 0.10 eV. Experiments have not yet decided which is true.' },
  { term: 'Upper limit (95 percent)', meaning: 'a statement of the kind “I am 95 percent sure the parcel weighs less than this”. It is not a measurement of the weight. It says how big the quantity could be and still agree with the data.' },
  { term: 'DESI (the Dark Energy Spectroscopic Instrument)', meaning: 'a survey that uses a large telescope in Arizona to split the light of millions of galaxies and quasars into colours, measure how much each is redshifted, and so map their distances in three dimensions. Its second data release, DR2, covers more than 14 million of them (Experiment 2).' },
  { term: 'Quasar', meaning: 'a very bright, very distant galaxy centre. Quasars can be seen from billions of light-years away, so they are useful markers for mapping the distant universe.' },
  { term: 'BAO, CMB and DR2 (in the names of Picture 3’s bars)', meaning: 'BAO is baryon acoustic oscillations, a pattern in how galaxies are spread across the sky that works as a ruler for measuring distances (Experiment 2). CMB is the cosmic microwave background. DR2 is the second data release of DESI, the survey of Experiment 2.' },
  { term: 'Planck', meaning: 'the European Space Agency’s Planck satellite, which mapped the microwave background in detail. Its final results (2018) give the matter share and expansion rate used here, and a limit on the neutrino masses (Cosmology Experiment 3, and Experiments 1 and 3 of this group).' },
  { term: 'Sigma', meaning: 'as in Experiment 1: the size of a gap between two values, counted in units of their combined “give or take”. About 1 sigma is ordinary, and 5 sigma is the usual bar in many sciences for calling a difference real.' },
  { term: 'Tension', meaning: 'as in Experiments 1 to 3 of this group, a disagreement between two measurements that is too big to put down to chance. It is a puzzle, not yet a discovery.' },
  { term: 'Standard model of the universe', meaning: 'the model built in the Cosmology experiments, with ordinary matter, dark matter and dark energy. The cosmic limits on neutrino mass assume it.' },
  { term: 'arXiv', meaning: 'the free website where scientists post their papers. Links to “arxiv.org” on this page lead to the original papers, which use technical words.' },
]

export function NeutrinoMassExperiment({ onComplete, onTutorComplete }: NeutrinoMassExperimentProps) {
  const [timingPrediction, setTimingPrediction] = useState<HeavyTiming | null>(null)
  const [roomPrediction, setRoomPrediction] = useState<RoomRange | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const [totalMass, setTotalMass] = useState(RUN_TOTAL_MASS_EV)

  // Every number comes from the physics module. The run starts with DESI's July 2026 limit as the total; the control after the run changes it.
  const result = runNeutrinoMass(totalMass)
  const bothPredicted = timingPrediction !== null && roomPrediction !== null
  const eachEv = result.massEachEv
  const floorNormal = oscillationFloor('normal')
  const floorInverted = oscillationFloor('inverted')
  const sci = (value: number) => {
    const exponent = Math.floor(Math.log10(Math.abs(value)))
    return `${(value / 10 ** exponent).toFixed(2)} × 10${exponent < 0 ? '⁻' : ''}${String(Math.abs(exponent)).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])}`
  }
  const millions = (years: number) => Math.round(years / 1e6).toLocaleString('en-US')

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

  const startOver = () => {
    setTimingPrediction(null)
    setRoomPrediction(null)
    setStatus('idle')
    setStage(0)
    setTotalMass(RUN_TOTAL_MASS_EV)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }

  const releaseX = xOfZ(RECOMBINATION_REDSHIFT)
  const heavyX = xOfZ(result.heavyRedshift)
  const oneX = xOfZ(result.heavyRedshiftOneNeutrino)
  const p1Base = AXIS_Y + 88
  const p1Height = stage >= 2 && timingPrediction !== null ? p1Base + GUESS_PANEL1_H : p1Base
  const checkUp = neutrinoCheckUp()
  const desiRun = runNeutrinoMass(RUN_TOTAL_MASS_EV)
  const roomOf = (name: string) => result.rooms.find((r) => r.bound.name === name)!
  const desi2026 = roomOf('DESI DR2 + CMB (July 2026)')
  const desi2025 = roomOf('DESI DR2 + CMB (March 2025)')
  const planckBao = roomOf('Planck 2018 + BAO')

  // Picture 2 (the matter share and the smoothing)
  const P2_LEFT = 40
  const P2_RIGHT = 520
  const ZOOM_TOP = 126
  const P2_PLOT_LEFT = 76
  const P2_PLOT_TOP = 232
  const P2_PLOT_BOTTOM = 336
  const smoothingMax = 0.3
  const massX = (total: number) => P2_PLOT_LEFT + (total / MAX_TOTAL_MASS_EV) * (P2_RIGHT - P2_PLOT_LEFT)
  const smoothY = (fraction: number) => P2_PLOT_BOTTOM - (fraction / smoothingMax) * (P2_PLOT_BOTTOM - P2_PLOT_TOP)
  const SMOOTH_PRESETS = TOTAL_PRESETS.map((preset) => preset.value)
  const keyOrder = [totalMass, ...SMOOTH_PRESETS.filter((m) => m !== totalMass)]
  // The zoom bar shows the first zoomPercent percent of the matter bar, magnified 100 ÷ zoomPercent times: 1 percent unless the share is bigger.
  const zoomPercent = [1, 2, 5, 10].find((pct) => result.share * 100 <= pct) ?? 10
  const zoomTimes = 100 / zoomPercent
  const zoomShareX = P2_LEFT + ((result.share * 100) / zoomPercent) * (P2_RIGHT - P2_LEFT)

  // Picture 3 (the floors and the ceilings)
  const P3_LEFT = 40
  const P3_RIGHT = 520
  const P3_MAX = 0.2
  const P3_TICKS = [0, 0.05, 0.1, 0.15, 0.2]
  const ROW_TOP = 74
  const ROW_STEP = 46
  const eV = (value: number) => P3_LEFT + (value / P3_MAX) * (P3_RIGHT - P3_LEFT)
  const drawnCeilings = CEILINGS.filter((b) => b.drawn).sort((a, b) => a.year - b.year || a.value - b.value)
  const p3AxisY = ROW_TOP + drawnCeilings.length * ROW_STEP + 8
  const p3Base = p3AxisY + 100
  const p3Height = roomPrediction !== null ? p3Base + GUESS_PANEL3_H : p3Base

  // After the run: the formulas, each with a worked example from the learner's chosen total (the formulas wait until now, §12).
  const heavyOverTypical = eachEv / TYPICAL_ENERGY_TODAY_EV
  const h = HUBBLE_PARAMETER_H
  const omegaMatter = OMEGA_MATTER
  const energyShare = energyDensityShare(result.totalMassEv)
  const hundredK = (BOLTZMANN_EV_PER_KELVIN * 1e5).toFixed(3)
  const omegaUnit = EV_FOR_ONE_OMEGA_H_SQUARED
  const gaps = MASS_SQUARED_GAPS
  const roomText = (room: Room) =>
    room.difference >= 0
      ? `${room.ratio.toFixed(3)} times the floor (${room.difference.toFixed(4)} eV above it)`
      : `below the floor, by ${Math.abs(room.difference).toFixed(4)} eV (${room.ratio.toFixed(2)} times it)`
  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'The neutrino temperature (formula)',
      meaning: `T(neutrinos) = (4/11)^(1/3) × T(light). Example: (4/11)^(1/3) = ${Math.cbrt(4 / 11).toFixed(4)}, so ${Math.cbrt(4 / 11).toFixed(4)} × ${CMB_TEMPERATURE_TODAY_KELVIN} K = ${result.neutrinoTemperatureKelvin.toFixed(3)} K.`,
    },
    {
      term: 'When the neutrinos turn heavy (formula)',
      meaning: `A typical neutrino’s energy is ${MEAN_ENERGY_IN_KT} × k × T, with k = ${hundredK} × 10⁻⁵ eV per kelvin. Today that is ${MEAN_ENERGY_IN_KT} × ${hundredK} × 10⁻⁵ × ${result.neutrinoTemperatureKelvin.toFixed(3)} = ${result.typicalEnergyTodayEv.toFixed(6)} eV. In the past it was 1 + z times bigger. The neutrinos turn heavy when this equals their mass, so 1 + z = (mass of one neutrino) ÷ ${result.typicalEnergyTodayEv.toFixed(6)}. Example, with your total of ${formatTotal(result.totalMassEv)} eV: each is ${formatTotal(result.totalMassEv)} ÷ 3 = ${eachEv.toFixed(4)} eV, so 1 + z = ${eachEv.toFixed(4)} ÷ ${result.typicalEnergyTodayEv.toFixed(6)} = ${heavyOverTypical.toFixed(1)}, and z = ${result.heavyRedshift.toFixed(1)}. This is a rule of thumb, not a sharp switch.`,
    },
    {
      term: 'The neutrinos’ share of the matter (formula)',
      meaning: `Ων × h² = (total mass) ÷ ${omegaUnit} eV, so share of the matter = (total ÷ ${omegaUnit}) ÷ h² ÷ Ωm, with h = ${h} and Ωm = ${omegaMatter}. Example, with ${formatTotal(result.totalMassEv)} eV: ${formatTotal(result.totalMassEv)} ÷ ${omegaUnit} = ${(result.totalMassEv / omegaUnit).toFixed(6)}; ÷ ${(h * h).toFixed(3)} = ${energyShare.toFixed(5)}; ÷ ${omegaMatter} = ${result.share.toFixed(5)}, which is ${(result.share * 100).toFixed(2)} percent.`,
    },
    {
      term: 'The smoothing of small clumps (formula)',
      meaning: `smoothing ≈ ${SMOOTHING_FACTOR} × (the neutrinos’ share of the matter), for a small share. Example: ${SMOOTHING_FACTOR} × ${result.share.toFixed(5)} = ${result.smoothing.toFixed(4)}, which is ${(result.smoothing * 100).toFixed(2)} percent. This model uses the rule only up to ${MAX_TOTAL_MASS_EV} eV.`,
    },
    {
      term: 'The two floors (formulas)',
      meaning: `Normal ordering, with the lightest neutrino massless: floor = √(Δm²₂₁) + √(Δm²₃₁) = √${gaps.solar} + √${gaps.atmosphericNormal} = ${Math.sqrt(gaps.solar).toFixed(4)} + ${Math.sqrt(gaps.atmosphericNormal).toFixed(4)} = ${floorNormal.toFixed(4)} eV. Inverted ordering: floor = √|Δm²₃₁| + √(|Δm²₃₁| + Δm²₂₁) = √${gaps.atmosphericInverted} + √${(gaps.atmosphericInverted + gaps.solar).toFixed(6)} = ${Math.sqrt(gaps.atmosphericInverted).toFixed(4)} + ${Math.sqrt(gaps.atmosphericInverted + gaps.solar).toFixed(4)} = ${floorInverted.toFixed(4)} eV. (Δm² are the measured gaps between the squares of the masses, in eV².)`,
    },
    {
      term: 'Room under a ceiling (formula)',
      meaning: `ratio = ceiling ÷ floor, and difference = ceiling − floor (negative when the ceiling is below the floor). Example, DESI July 2026 against the normal floor: ${DESI_JULY_2026.value} ÷ ${floorNormal.toFixed(4)} = ${(DESI_JULY_2026.value / floorNormal).toFixed(3)}, and ${DESI_JULY_2026.value} − ${floorNormal.toFixed(4)} = ${(DESI_JULY_2026.value - floorNormal).toFixed(4)} eV. Against the inverted floor: ${DESI_JULY_2026.value} − ${floorInverted.toFixed(4)} = ${(DESI_JULY_2026.value - floorInverted).toFixed(4)} eV, which is below it.`,
    },
  ]

  return (
    <div>
      <h2>Experiment 4 — Can the Universe Weigh a Neutrino?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Where this stands (as of October 2026): Contested.</strong> The limits below are real and published. What they mean is not
          settled.
        </p>

        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), written to the standard of CLAUDE.md §29. It does not give
            DESI's limit, how it compares with the laboratory floor, that the two nearly meet, or that the statistics lean toward a negative
            mass (that is what the predictions ask, §12). It leaves out the number of neutrinos per cubic centimetre and the number passing
            through a hand each second, which have no source check (Decision 14). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Can the whole universe, by the way it expands and clumps, tell us how much a neutrino weighs? And does
            that agree with what laboratories find?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Experiment 1 two ways of measuring the expansion rate disagreed. In Experiment 2 a survey hinted
            that dark energy might change. In Experiment 3 a disagreement between surveys shrank in one survey and not in another. This experiment
            has a tension of a different kind, because the two sides are measuring the <em>same particle</em> in completely different ways: one in
            a laboratory, the other in the sky.
          </p>

          <p style={paragraph}>
            <strong>What is a neutrino?</strong> A neutrino is a particle with no electric charge that hardly ever interacts with anything. Think
            of how a wall stops a thrown ball but not a radio wave: a neutrino passes through a wall, through a planet, and through you almost
            untouched. There are three kinds, called electron, muon and tau neutrinos. Apart from light, which has no mass at all, neutrinos are the
            lightest particles known to have any mass. But they do have a mass, small as it is.
          </p>

          <p style={paragraph}>
            <strong>How small?</strong> Physicists measure the mass of tiny particles in <strong>electron-volts</strong> (written <strong>eV</strong>).
            An electron-volt is a very small amount of energy. Energy and mass are linked (E = mc², Spacetime Geometry Experiment 5), so a mass can
            be quoted in eV too. An electron weighs about 511,000 eV. A neutrino weighs less than 0.1 eV, which is millions of times lighter than
            an electron.
          </p>

          <p style={paragraph}>
            <strong>Why weigh a neutrino?</strong> It sounds like a very small thing to care about, but there are three good reasons.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>A mass is a clue that something is missing from physics.</strong> The Standard Model of particle physics is the list of
              the known particles and how they behave (see the CERN page below). In its simplest form, neutrinos have <em>no</em> mass at all. So
              the fact that they have some means the list is incomplete, and the size of the mass is a clue to what is missing. It is like a
              recipe that says “no salt”, when you can taste salt: something else must be in the dish, and how salty it is tells you something
              about what.
            </li>
            <li>
              <strong>We know how far apart the masses are, but not how big they are.</strong> As you will see, experiments that watch
              neutrinos change kind give the <em>gaps</em> between the three masses, and not the masses themselves. The team behind the KATRIN
              experiment, which weighs neutrinos directly, calls the actual scale of neutrino masses “the most important open issue in
              neutrino physics”. The total also bears on which of two possible patterns the masses follow (the normal and inverted
              ordering, explained below).
            </li>
            <li>
              <strong>The sky depends on it, and the sky can check it.</strong> Neutrinos are so numerous that even tiny masses add up to a
              measurable effect on how the universe expanded and how matter clumped into galaxies (the ideas of Cosmology Experiment 9 and of
              Experiment 3 of this group). That means the sky is a second, completely different way of weighing them. If the model of
              the universe is complete, a laboratory and the sky should give the same answer. If they do not, either one has a mistake in it,
              or the model of the universe is missing something too. That is why comparing them is such a good test.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>The cold sea of neutrinos left from the Big Bang.</strong> In the first second after the Big Bang the universe was so hot and
            dense that neutrinos kept colliding with other particles. Then it thinned out enough that they stopped colliding and flew off freely.
            They have been flying ever since, filling all of space. Think of the cosmic microwave background (Cosmology Experiment 3), the
            leftover light of the Big Bang: this is a leftover <em>sea of neutrinos</em>, from an even earlier time. The neutrino sea is a little
            colder than the leftover light. Its temperature today is about {NEUTRINO_TEMPERATURE_TODAY_KELVIN.toFixed(2)} K, against{' '}
            {CMB_TEMPERATURE_TODAY_KELVIN} K for the light, because the light was warmed a little afterwards, when electrons and their
            antimatter partners (positrons) annihilated into light, and the neutrinos, flying freely, were not.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <RelicSeaDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is an illustration of the idea, not data. Each box is the same small patch of empty
              space, magnified. The sky-blue dots stand for the particles of the leftover light, and the violet dots for the leftover neutrinos.
              The point of the picture is that <strong>both fill all of space</strong>, everywhere, left over from the Big Bang, and that the
              neutrinos are the colder of the two. The number of dots in each box, and their sizes, are for illustration only and do not show
              how many there really are.
            </p>
          </div>

          <p style={paragraph}>
            <strong>“Light-like” and “matter-like”.</strong> A particle behaves like light or like matter depending on how its energy compares
            with its mass. Think of the same ball thrown hard at a wall and rolled gently along the floor. Thrown hard, its energy of motion
            far exceeds anything else about it, and it behaves like a bullet. Rolled gently it is an ordinary slow object. In the same way a
            neutrino has two kinds of energy, the energy of its motion and the energy of its mass (E = mc²). When the universe was young and hot,
            the energy of motion was far bigger, so the neutrinos moved almost at the speed of light and acted like <strong>light</strong>. As
            the universe expanded the sea cooled and the energy of motion fell. Once it fell below the energy of the neutrino’s mass, the
            neutrinos moved slowly and acted like <strong>matter</strong>. Today they act like matter. This switch is one reason a tiny mass
            can leave a mark on the sky.
          </p>

          <p style={paragraph}>
            <strong>Three ways to weigh a neutrino.</strong>
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Watching neutrinos change kind (oscillations).</strong> A neutrino of one kind can turn into another as it flies. That is only
              possible if the kinds have <em>different masses</em>, so seeing it proves that neutrinos have mass. It tells us how far apart the
              masses are, but not how big they are. From the gaps we can work out a <strong>floor</strong>: the three masses together cannot
              add up to less than a certain amount. There are two possible patterns, called the <strong>normal</strong> and the{' '}
              <strong>inverted ordering</strong>, and they have different floors: about 0.059 eV for the normal pattern (one neutrino much heavier
              than the other two) and about 0.10 eV for the inverted one (two heavy ones close together). Think of three people whose weights add
              up to at least some amount, because you know how much heavier one is than another, even though you have not put anyone on the
              scale.
            </li>
            <li>
              <strong>Weighing one directly (the KATRIN experiment).</strong> When a kind of hydrogen called tritium decays, it gives out an
              electron and a neutrino (strictly its antimatter partner, an antineutrino) and shares the energy between them. If the neutrino has mass, a tiny bit of the energy is spent on it,
              and the electrons’ top energy falls just short of what it would be otherwise. KATRIN measures that shortfall very carefully. It has
              not yet seen one, so it gives a <strong>ceiling</strong> on a single neutrino’s mass, a ceiling much higher than the floor.
            </li>
            <li>
              <strong>Weighing the whole sea at once, using the sky.</strong> Even a tiny mass changes how the universe expanded and how matter
              clumped, and surveys of the sky can measure those. This also gives a ceiling, on the three masses added together. DESI, the survey
              of Experiment 2 (described just below), combined with the microwave background, sets such a ceiling.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>What is DESI?</strong> DESI stands for the <strong>Dark Energy Spectroscopic Instrument</strong>. It is a survey that uses a
            large telescope in Arizona (the Mayall telescope at Kitt Peak) to make a three-dimensional map of the universe. It was built mainly to study dark
            energy (Experiment 2), but the same map says something about neutrinos too. The word “spectroscopic” means that DESI splits the light
            of each object into its colours. As the universe expands, the light of a distant galaxy is stretched toward the red, and how much it
            is stretched (its redshift, Cosmology Experiment 1) tells how far away the galaxy is. Do that for millions of galaxies and{' '}
            <strong>quasars</strong> (very bright, very distant galaxy centres) and you have a map. DESI’s second data release, called{' '}
            <strong>DR2</strong>, covers more than 14 million of them. (DESI’s own home page says that the survey has now
            observed more than 47 million galaxies and quasars in all.)
          </p>
          <p style={paragraph}>
            <strong>What DESI measures, and how that weighs a neutrino.</strong> In the map, galaxies are not scattered completely at random.
            There is a preferred spacing between them, left over from sound waves in the early universe, called <strong>BAO</strong> (baryon
            acoustic oscillations, explained in Experiment 2). Its true size is known, so how big it <em>looks</em> in the sky tells how far
            away it is, like judging how far away a telegraph pole is from how small it looks. Measured at many distances, this gives the history
            of how fast the universe expanded. Neutrino mass changes that history a little, because neutrinos switch from acting like light to
            acting like matter. DESI does <strong>not</strong> weigh neutrinos directly. Scientists compare DESI’s map, together with the
            microwave background, with what the standard model of the universe predicts for different neutrino masses, and find the masses that
            agree with the map. The ones that do not agree are ruled out, and that gives the ceiling.
          </p>

          <p style={paragraph}>
            <strong>How the sky can weigh them.</strong> This experiment builds three simple reasons a tiny mass leaves a mark. First, <em>when</em>{' '}
            the neutrinos change from light-like to matter-like. Second, <em>how much</em> of the universe’s matter they make up. Third, how much
            they <em>smooth out small clumps</em> of matter (Cosmology Experiment 9 showed how ripples grow into clumps). Think of fine sand mixed
            into a snowdrift: a little extra stuff that will not settle softens the edges of the drifts. One thing to know in advance: these three
            are <strong>not the whole story</strong>. DESI’s limit also depends on how neutrino mass changes the way the universe expanded, and on
            how the microwave background’s light was bent on its way to us, and it comes from a computer fit of everything at once. So this
            experiment cannot reproduce DESI’s number. It shows why the number is possible.
          </p>

          <p style={paragraph}>
            <strong>Not a measurement but a limit.</strong> The sky has so far given a <em>maximum</em>, which scientists call an{' '}
            <strong>upper limit</strong>, and not a value. A “95 percent upper limit” means: “we are 95 percent sure the total mass is below
            this”, in the way you might say you are 95 percent sure a parcel weighs less than a kilogram after lifting it, without knowing
            exactly what it weighs. A limit says how big the quantity could be and still agree with the data.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box above the predictions has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Redshift</strong> (reminder from Cosmology Experiments 1 and 3): a way to say how long ago. Today is redshift 0. The
                bigger the number, the longer ago, and a redshift <em>z</em> means the universe was 1 + <em>z</em> times smaller than it is now.
                The microwave background was released at a redshift of {RECOMBINATION_REDSHIFT}.
              </li>
              <li>
                <strong>Floor</strong> and <strong>ceiling</strong>: a minimum and a maximum for the three masses added together.
              </li>
              <li>
                <strong>Tension</strong> (reminder from Experiments 1 to 3): a disagreement between two measurements that is too big to put down
                to chance. A tension is a puzzle, not yet a discovery.
              </li>
              <li>
                <strong>Sigma</strong> (reminder from Experiment 1): the size of a gap between two values, counted in units of their combined
                “give or take”. About 1 sigma is an ordinary difference. The bigger the number, the harder the gap is to put down to chance, and
                5 sigma is the usual bar in many sciences for calling a difference real.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and
            then try a different total mass. Nothing here is graded. Your predictions never change the real pictures or tables. They are drawn on the pictures in
            white, in a box marked YOUR GUESS, so you can compare them with what was measured and calculated, and they are listed again beside the results. In Part 2
            you can try a different total for the three neutrino masses. That choice is pink: it moves the pink marks in Pictures 1 and 2 and fills a drawing in Part 2
            and the first table, but it never changes the floors and ceilings in Picture 3, the second table or your guesses.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> The total mass is shared <strong>equally</strong> among the three kinds of neutrino (the real masses
            are not equal, but this is the assumption in the papers behind the sky’s limit). A neutrino counts as “matter-like” when the typical
            energy of its motion equals its mass energy, which is a rule of thumb, not a sharp switch. The rest of the universe is taken from
            the measurements of the microwave background made by the Planck satellite (a European Space Agency mission, described in the ESA link below). The limits are quoted as the papers state them. And this experiment cannot say
            whether the disagreement it shows is real.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links to the original scientific papers and to DESI’s own
            pages appear below the results, after you press Run, because their summaries state what the predictions ask, and you should get to
            guess first. Links open in a new tab. This page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://neutrinos.fnal.gov/whats-a-neutrino/">Fermilab: What’s a neutrino?</ExternalLink>: a plain introduction
              to what neutrinos are, where they come from and why they are hard to catch, including that they have some mass, but not much.
            </li>
            <li>
              <ExternalLink href="https://neutrinos.fnal.gov/faq/what-are-neutrino-oscillations/">Fermilab: What are neutrino oscillations?</ExternalLink>: how
              neutrinos change from one kind to another as they travel, and why that shows that they have mass.
            </li>
            <li>
              <ExternalLink href="https://neutrinos.fnal.gov/mysteries/mass-ordering/">Fermilab: Which neutrino is the lightest?</ExternalLink>: the normal
              and inverted mass orderings, and what experiments have not yet settled about them.
            </li>
            <li>
              <ExternalLink href="https://home.cern/science/physics/standard-model">CERN: The Standard Model</ExternalLink>: the family of known
              particles, where neutrinos sit next to the electron and its heavier cousins, and what the model cannot yet explain.
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background">
                ESA: Planck and the cosmic microwave background
              </ExternalLink>
              : how the Planck satellite mapped the leftover light of the Big Bang, which is where this experiment’s cosmic picture starts.
            </li>
            <li>
              <ExternalLink href="https://sci.esa.int/web/euclid/-/46681-baryonic-acoustic-oscillations-bao">ESA: Baryonic acoustic oscillations (BAO)</ExternalLink>
              : the pattern in how galaxies are spread across the sky, which is used as a standard ruler. (ESA’s science pages carry a notice
              that they are under review and not being updated.)
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-quasars/">NASA: Hubble quasars</ExternalLink>
              : what quasars are and why they shine so brightly.
            </li>
            <li>
              <ExternalLink href="https://www.desi.lbl.gov/">DESI: the Dark Energy Spectroscopic Instrument</ExternalLink>: the survey’s own home
              page, from the team that runs it, on what DESI is and what it maps.
            </li>
            <li>
              <ExternalLink href="https://www.katrin.kit.edu/">KATRIN: the Karlsruhe Tritium Neutrino experiment</ExternalLink>: the laboratory
              experiment that weighs the neutrino directly, with its set-up, its physics and its latest results.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={status === 'complete' ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither
            says which answer is right, and neither gives DESI's limit. */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          We are about to make two predictions, then watch three pictures build up, one stage at a time: when the neutrinos turn heavy, how much of the matter they make up and what they do to small clumps, and the
          floor and the ceilings for their total mass. Nothing here tells you the answers. When the pictures are drawn, your guesses appear on them in white.
        </PartHeader>

        {(
          [
            {
              title: 'Prediction 1: when do the neutrinos turn heavy?',
              text: (
                <>
                  Suppose the three kinds of neutrino weigh <strong>{PREDICTION_TOTAL_MASS_EV} eV</strong> all together, shared equally. When the universe was young
                  and hot, neutrinos moved almost as fast as light, so they acted like light. As the universe cooled they slowed, and today they
                  act like matter. The microwave background was released about {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years
                  after the Big Bang. Did the neutrinos turn from “light-like” to “matter-like” <strong>before</strong> that, or{' '}
                  <strong>after</strong> it?
                </>
              ),
              choices: TIMING_CHOICES,
              value: timingPrediction,
              set: (v: HeavyTiming) => setTimingPrediction(v),
            },
            {
              title: 'Prediction 2: how much room is there?',
              text: (
                <>
                  Experiments that watch neutrinos change kind set a <strong>minimum</strong> for the three masses together (about 0.059 eV if
                  the heaviest neutrino is much heavier than the other two). In 2026, DESI combined with the microwave background set a{' '}
                  <strong>maximum</strong> (a 95 percent upper limit), assuming the standard model of the universe. How far above the minimum
                  is that maximum?
                </>
              ),
              choices: ROOM_CHOICES,
              value: roomPrediction,
              set: (v: RoomRange) => setRoomPrediction(v),
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
                  disabled={status !== 'idle'}
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

        <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || status !== 'idle'} style={{ padding: '0.6rem 1.5rem' }}>
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {status === 'complete' && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && status === 'idle' && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}

        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}`}</strong>
              {status === 'running' && <>: {STAGES[stage - 1]}</>}
              {status === 'complete' && <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>}
            </>
          )}
        </p>

        {/* Stage 1: the neutrino sea's temperature and typical energy, from the module. */}
        {stage >= 1 && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color, #ccc)',
              borderRadius: '8px',
            }}
          >
            <strong>Stage 1: the cold sea of neutrinos.</strong> The neutrino sea’s temperature today is (4/11)^(1/3) × {CMB_TEMPERATURE_TODAY_KELVIN} K ={' '}
            <strong>{result.neutrinoTemperatureKelvin.toFixed(3)} K</strong>. A typical neutrino in it carries an energy of about{' '}
            <strong>{result.typicalEnergyTodayEv.toFixed(6)} eV</strong> ({sci(result.typicalEnergyTodayEv)} eV) today. That is the number the
            neutrinos’ mass will be compared with. For this run the three masses add up to <strong>{formatTotal(result.totalMassEv)} eV</strong> ({result.totalMassEv === RUN_TOTAL_MASS_EV ? 'DESI’s July 2026 upper limit' : 'the total you chose below'}; after the run you can try other totals), shared equally, so each neutrino weighs{' '}
            <strong>{formatTotal(result.totalMassEv)} ÷ 3 = {eachEv.toFixed(4)} eV</strong>.
          </div>
        )}

        {/* Picture 1: the timeline. The microwave background's release is always drawn; the neutrinos' turning point and the bands appear at stage 2. */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={p1Height}
            viewBox={`0 0 ${VIEW_WIDTH} ${p1Height}`}
            style={svgStyle}
            role="img"
            aria-label="Timeline of the universe by redshift, with the release of the microwave background and the redshift at which the neutrinos turn from light-like to matter-like"
          >
            <text x={AXIS_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 1: when do the neutrinos turn heavy?
            </text>
            {stage < 2 && (
              <text x={AXIS_LEFT} y={AXIS_Y - 110} fill={MUTED_COLOR} fontSize="11">
                The neutrinos’ turning point is drawn here when you press Run.
              </text>
            )}

            {/* The two stretches of history (stage 2): before the turning point the neutrinos act like light, after it like matter. */}
            {stage >= 2 && (
              <g>
                <rect x={AXIS_LEFT} y={AXIS_Y - 30} width={heavyX - AXIS_LEFT} height={30} fill={HEAVY_COLOR} opacity={0.22} />
                <rect x={heavyX} y={AXIS_Y - 30} width={AXIS_RIGHT - heavyX} height={30} fill={CEILING_COLOR} opacity={0.22} />
                <text x={(AXIS_LEFT + heavyX) / 2} y={AXIS_Y - 11} fill={HEAVY_COLOR} fontSize="11" textAnchor="middle">
                  {heavyX - AXIS_LEFT >= 170 ? 'the neutrinos act like light' : 'light-like'}
                </text>
                <text x={(heavyX + AXIS_RIGHT) / 2} y={AXIS_Y - 11} fill={CEILING_COLOR} fontSize="11" textAnchor="middle">
                  {AXIS_RIGHT - heavyX >= 170 ? 'the neutrinos act like matter' : 'matter-like'}
                </text>
              </g>
            )}

            {/* The timeline */}
            <line x1={AXIS_LEFT} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} stroke={MUTED_COLOR} strokeWidth={1.5} />
            {TICK_REDSHIFTS.map((z) => (
              <g key={z}>
                <line x1={xOfZ(z)} y1={AXIS_Y - 4} x2={xOfZ(z)} y2={AXIS_Y + 4} stroke={MUTED_COLOR} />
                <text x={xOfZ(z)} y={AXIS_Y + 18} fill={MUTED_COLOR} fontSize="11" textAnchor={z === 0 ? 'end' : 'middle'}>
                  {z === 0 ? '0 (today)' : z.toLocaleString('en-US')}
                </text>
              </g>
            ))}
            <text x={(AXIS_LEFT + AXIS_RIGHT) / 2} y={AXIS_Y + 40} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
              Redshift z (how long ago: bigger means earlier). Not an even scale.
            </text>
            <text x={AXIS_LEFT} y={AXIS_Y + 58} fill={MUTED_COLOR} fontSize="10">
              ← earlier (hotter, smaller universe)
            </text>
            <text x={AXIS_RIGHT} y={AXIS_Y + 58} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
              later (cooler, bigger universe) →
            </text>

            {/* The release of the microwave background */}
            <line x1={releaseX} y1={AXIS_Y - 100} x2={releaseX} y2={AXIS_Y} stroke={LIGHT_COLOR} strokeWidth={2} strokeDasharray="5 3" />
            <circle cx={releaseX} cy={AXIS_Y} r={5} fill={LIGHT_COLOR} />
            <text x={releaseX + 8} y={AXIS_Y - 84} fill={LIGHT_COLOR} fontSize="12">
              The microwave background is released
            </text>
            <text x={releaseX + 8} y={AXIS_Y - 68} fill={LIGHT_COLOR} fontSize="11">
              z = {RECOMBINATION_REDSHIFT}, about {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after the Big Bang
            </text>

            {/* The neutrinos' turning point (stage 2), and the turning point if one neutrino carried the whole total (a fainter marker) */}
            {stage >= 2 && (
              <g>
                <line x1={heavyX} y1={AXIS_Y - 62} x2={heavyX} y2={AXIS_Y} stroke={HEAVY_COLOR} strokeWidth={2} strokeDasharray="5 3" />
                <circle cx={heavyX} cy={AXIS_Y} r={5} fill={HEAVY_COLOR} />
                <text x={heavyX + 8} y={AXIS_Y - 50} fill={HEAVY_COLOR} fontSize="12">
                  Neutrinos turn heavy: z = {result.heavyRedshift.toFixed(1)}
                </text>
                <text x={heavyX + 8} y={AXIS_Y - 35} fill={HEAVY_COLOR} fontSize="11">
                  about {millions(result.heavyTimeYears)} million years after the Big Bang
                </text>
                <line x1={oneX} y1={AXIS_Y - 30} x2={oneX} y2={AXIS_Y} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="2 3" />
                <circle cx={oneX} cy={AXIS_Y} r={3} fill="none" stroke={MUTED_COLOR} strokeWidth={1.5} />
                <circle cx={AXIS_LEFT + 4} cy={AXIS_Y + 78} r={3} fill="none" stroke={MUTED_COLOR} strokeWidth={1.5} />
                <text x={AXIS_LEFT + 14} y={AXIS_Y + 81} fill={MUTED_COLOR} fontSize="10">
                  grey circle: where it would turn heavy if one neutrino carried the whole {formatTotal(result.totalMassEv)} eV (z = {Math.round(result.heavyRedshiftOneNeutrino)})
                </text>
              </g>
            )}

            {/* Your guess for Prediction 1 (stage 2): only a side of the release marker, for a total of 0.06 eV. It never moves with the control. */}
            {stage >= 2 &&
              timingPrediction !== null &&
              (() => {
                const oy = p1Base
                const side = timingGuessSide(timingPrediction)
                const ay = oy + 44
                const tip = releaseX + (side === -1 ? -28 : 60)
                return (
                  <g>
                    <line x1={AXIS_LEFT} y1={oy} x2={AXIS_RIGHT} y2={oy} stroke={MUTED_COLOR} strokeDasharray="2 4" />
                    <text x={AXIS_LEFT} y={oy + 20} fill={GUESS_COLOR} fontSize="12">
                      Your guess for Prediction 1 (a marker only, for a total of {PREDICTION_TOTAL_MASS_EV} eV)
                    </text>
                    <line x1={releaseX} y1={ay - 8} x2={releaseX} y2={ay + 8} stroke={LIGHT_COLOR} strokeWidth={2} />
                    <text x={releaseX} y={ay + 22} fill={LIGHT_COLOR} fontSize="10">
                      release
                    </text>
                    <line x1={releaseX} y1={ay} x2={tip - side * 8} y2={ay} stroke={GUESS_COLOR} strokeWidth={4} />
                    <polygon points={`${tip},${ay} ${tip - side * 14},${ay - 7} ${tip - side * 14},${ay + 7}`} fill={GUESS_COLOR} />
                    <line x1={releaseX} y1={ay} x2={112} y2={ay} stroke={GUESS_COLOR} strokeWidth={2} />
                    <rect x={112} y={ay - 14} width={290} height={28} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
                    <text x={257} y={ay + 5} fill={GUESS_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
                      YOUR GUESS: {TIMING_SHORT[timingPrediction]} (for {PREDICTION_TOTAL_MASS_EV} eV)
                    </text>
                  </g>
                )
              })()}
          </svg>
        </div>

        {/* Picture 1's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). The first bullets are the Step 2 wording;
            the bullets about the violet marker and the bands replace the placeholder "what will appear when Run is built". It does not
            say what the learner predicted. */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <p style={paragraph}>
            <strong>How to read this diagram.</strong> This picture is a <strong>timeline of the universe</strong>, laid out like a ruler. It shows{' '}
            <em>when</em>, in the history of the universe, the neutrinos change from acting like light to acting like matter. Time is shown by{' '}
            <strong>redshift</strong>, the number <em>z</em> from Cosmology Experiments 1 and 3: <em>z</em> = 0 is today, a bigger <em>z</em> is longer
            ago, and a redshift <em>z</em> means the universe was 1 + <em>z</em> times smaller then than it is now.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The line and its numbers (0 to 1,000 and a little beyond):</strong> the history of the universe, with today at the right
              end and earlier times to the left. <strong>The scale is not even.</strong> From 10 to 100 to 1,000 each step multiplies the stretching
              (1 + <em>z</em>) by about ten, and each step takes up about the same width on the line, so the early times are not squashed into a
              speck. Between 0 and 10 the step is shorter. Do not read distances along the line as equal stretches of time.
            </li>
            <li>
              <strong>“Earlier” and “later” labels:</strong> the left end is the early, hot, small universe, and the right end is today’s cool,
              big one.
            </li>
            <li>
              <strong>The sky-blue dashed line and dot:</strong> the moment the microwave background (the leftover light of the Big Bang) was
              released, at a redshift of {RECOMBINATION_REDSHIFT}, about {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after
              the Big Bang. At that time the universe was {(RECOMBINATION_REDSHIFT + 1).toLocaleString('en-US', { maximumFractionDigits: 1 })}{' '}
              times smaller than it is now. It is the one fixed marker that the neutrinos’ turning point is compared with.
            </li>
            {stage >= 2 && (
              <>
            <li>
              <strong>The pink dashed line and dot</strong> (they appear at stage 2, and they start at DESI’s limit): the redshift at which the three equal neutrinos, of{' '}
              {eachEv.toFixed(4)} eV each, change from light-like to matter-like. It is labelled with its redshift and the age of the universe
              then.
            </li>
            <li>
              <strong>The two shaded stretches</strong> (stage 2): before the pink marker (to its left) the neutrinos act like light; after it
              (to its right) they act like matter. When a stretch is too narrow for the whole sentence it is labelled “light-like” or
              “matter-like”.
            </li>
            <li>
              <strong>The small grey hollow circle and dotted line</strong> (stage 2): where the turning point would be if the whole total were
              carried by <em>one</em> neutrino, not shared. It is there to show that the shape of the answer does not depend on how the mass is
              shared out.
            </li>
              </>
            )}
          </ul>
          {stage >= 2 && (
          <p style={paragraph}>
            <strong>A worked moment.</strong> The three masses add up to {formatTotal(result.totalMassEv)} eV, so each is {formatTotal(result.totalMassEv)} ÷ 3 ={' '}
            {eachEv.toFixed(4)} eV. A typical neutrino’s energy today is {result.typicalEnergyTodayEv.toFixed(6)} eV, and in the past it was
            larger by a factor of 1 + <em>z</em>, because the universe was that many times smaller and everything was squeezed and hotter. It
            reaches {eachEv.toFixed(4)} eV when 1 + <em>z</em> = {eachEv.toFixed(4)} ÷ {result.typicalEnergyTodayEv.toFixed(6)} ={' '}
            {(result.heavyRedshift + 1).toFixed(1)}, so <em>z</em> = {result.heavyRedshift.toFixed(1)}. That is about{' '}
            {millions(result.heavyTimeYears)} million years after the Big Bang.
          </p>
          )}
          {stage >= 2 && (
            <>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white arrow and the YOUR GUESS box, in the strip below the timeline:</strong> your guess for Prediction 1, for a total of {PREDICTION_TOTAL_MASS_EV} eV. The arrow points left of the
                  release marker if you guessed that the neutrinos turn heavy before the release, and right if after. It is only a marker, so its length means nothing, and it does not move when you
                  change the total in Part 2.
                </li>
              </ul>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong> Here are four things to look at, what each one means, and why it matters.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Look at</strong> where the pink marker sits, to the left or to the right of the sky-blue release marker. <strong>What it means:</strong> for your total ({formatTotal(result.totalMassEv)} eV; it
                  starts at DESI’s limit) it is {result.heavyTiming === 'after' ? 'to the right' : 'to the left'}: z = {result.heavyRedshift.toFixed(1)}, about {millions(result.heavyTimeYears)} million years after the Big Bang, against about{' '}
                  {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years for the release. <strong>Why it matters:</strong> it says whether the neutrinos were still light-like or already matter-like when the light of the
                  microwave background was set free.
                </li>
                <li>
                  <strong>Look at</strong> how far apart the two markers are. <strong>What it means:</strong> the turning point comes about {Math.round(result.timesLaterThanRelease)} times later than the release.{' '}
                  <strong>Why it matters:</strong> the neutrinos acted like light for a long time, which is why the microwave background and the later pictures see them differently.
                </li>
                <li>
                  <strong>Look at</strong> the small grey circle. <strong>What it means:</strong> if one neutrino carried the whole total it would turn heavy at z = {Math.round(result.heavyRedshiftOneNeutrino)}, much earlier, but still on the same side of
                  the release, for the totals this page offers. <strong>Why it matters:</strong> the answer to “before or after” does not depend on how the mass is shared.
                </li>
                <li>
                  <strong>Look at</strong> the white arrow. <strong>What it means:</strong> it stays where you guessed, whatever total you choose. <strong>Why it matters:</strong> it keeps your guess for {PREDICTION_TOTAL_MASS_EV} eV apart from the pink marks
                  for your own total.
                </li>
              </ul>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>Where the real picture comes from.</strong> <em>Measured:</em> the microwave background’s temperature and the time of its release, from earlier experiments. <em>Calculated here:</em> the redshift and the time when the
                neutrinos turn heavy, from the rule that their typical energy equals their mass. <em>Imagined for the question:</em> the three equal masses of the total, and the grey circle for one neutrino carrying all of it. The pink marks are
                your own total (they start at DESI’s limit). The white arrow is your guess.
              </p>
            </>
          )}
        </div>

        {/* Picture 2: how much of the matter the neutrinos are (stage 3) and how much they smooth the small clumps (stage 4). */}
        {stage >= 3 && (
          <div style={{ marginBottom: '1rem' }}>
            <svg
              width={VIEW_WIDTH}
              height={P2_PLOT_BOTTOM + 52}
              viewBox={`0 0 ${VIEW_WIDTH} ${P2_PLOT_BOTTOM + 52}`}
              style={svgStyle}
              role="img"
              aria-label="Picture 2: the neutrinos' share of the matter, zoomed in a hundred times, and how much they smooth the smallest clumps for different total masses"
            >
              <text x={P2_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                Picture 2: how much of the matter, and how much smoothing?
              </text>
              <text x={P2_LEFT} y={46} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
                A: the neutrinos’ share of all the matter
              </text>

              {/* The whole of the matter, and the neutrinos' sliver at its left end */}
              <rect x={P2_LEFT} y={56} width={P2_RIGHT - P2_LEFT} height={20} fill="#475569" />
              <text x={P2_RIGHT - 6} y={70} fill={TEXT_COLOR} fontSize="11" textAnchor="end">
                all the matter in the universe (100 percent)
              </text>
              <rect x={P2_LEFT} y={56} width={Math.max(2, (result.share) * (P2_RIGHT - P2_LEFT))} height={20} fill={TRIAL_COLOR} />
              <text x={P2_LEFT + Math.max(2, result.share * (P2_RIGHT - P2_LEFT)) + 6} y={70} fill={TRIAL_COLOR} fontSize="10" fontWeight="bold">
                ← neutrinos (the pink part)
              </text>

              {/* The zoom: the first zoomPercent percent of that bar, magnified 100 ÷ zoomPercent times */}
              <line x1={P2_LEFT} y1={78} x2={P2_LEFT} y2={ZOOM_TOP - 2} stroke={MUTED_COLOR} strokeDasharray="3 3" />
              <line x1={P2_LEFT + (zoomPercent / 100) * (P2_RIGHT - P2_LEFT)} y1={78} x2={P2_RIGHT} y2={ZOOM_TOP - 2} stroke={MUTED_COLOR} strokeDasharray="3 3" />
              <text x={P2_LEFT + 6} y={ZOOM_TOP - 8} fill={MUTED_COLOR} fontSize="10">
                zoom: the first {zoomPercent} percent, magnified {zoomTimes} times
              </text>
              <rect x={P2_LEFT} y={ZOOM_TOP} width={P2_RIGHT - P2_LEFT} height={22} fill="#475569" />
              <rect x={P2_LEFT} y={ZOOM_TOP} width={zoomShareX - P2_LEFT} height={22} fill={TRIAL_COLOR} />
              <text x={P2_LEFT + 8} y={ZOOM_TOP + 15} fill="#0b1020" fontSize="11" fontWeight="bold">
                neutrinos: {(result.share * 100).toFixed(2)} percent
              </text>
              <text x={P2_RIGHT - 6} y={ZOOM_TOP + 15} fill={TEXT_COLOR} fontSize="11" textAnchor="end">
                other matter
              </text>
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                <g key={fraction}>
                  <line x1={P2_LEFT + fraction * (P2_RIGHT - P2_LEFT)} y1={ZOOM_TOP + 22} x2={P2_LEFT + fraction * (P2_RIGHT - P2_LEFT)} y2={ZOOM_TOP + 27} stroke={MUTED_COLOR} />
                  <text x={P2_LEFT + fraction * (P2_RIGHT - P2_LEFT)} y={ZOOM_TOP + 40} fill={MUTED_COLOR} fontSize="10" textAnchor={fraction === 1 ? 'end' : fraction === 0 ? 'start' : 'middle'}>
                    {+(fraction * zoomPercent).toFixed(2)}%
                  </text>
                </g>
              ))}

              {/* Panel B (stage 4): the smoothing against the total mass */}
              {stage >= 4 && (
                <g>
                  <text x={P2_LEFT} y={P2_PLOT_TOP - 16} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
                    B: how much the smallest clumps are smoothed, for different total masses
                  </text>
                  <line x1={P2_PLOT_LEFT} y1={P2_PLOT_BOTTOM} x2={P2_RIGHT} y2={P2_PLOT_BOTTOM} stroke={MUTED_COLOR} />
                  <line x1={P2_PLOT_LEFT} y1={P2_PLOT_TOP} x2={P2_PLOT_LEFT} y2={P2_PLOT_BOTTOM} stroke={MUTED_COLOR} />
                  {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((m) => (
                    <g key={m}>
                      <line x1={massX(m)} y1={P2_PLOT_BOTTOM} x2={massX(m)} y2={P2_PLOT_BOTTOM + 4} stroke={MUTED_COLOR} />
                      <text x={massX(m)} y={P2_PLOT_BOTTOM + 17} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                        {m}
                      </text>
                    </g>
                  ))}
                  <text x={(P2_PLOT_LEFT + P2_RIGHT) / 2} y={P2_PLOT_BOTTOM + 34} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
                    total of the three neutrino masses (eV)
                  </text>
                  {[0, 0.1, 0.2, 0.3].map((f) => (
                    <g key={f}>
                      <line x1={P2_PLOT_LEFT - 4} y1={smoothY(f)} x2={P2_PLOT_LEFT} y2={smoothY(f)} stroke={MUTED_COLOR} />
                      <text x={P2_PLOT_LEFT - 8} y={smoothY(f) + 3} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
                        {Math.round(f * 100)}%
                      </text>
                    </g>
                  ))}
                  <text x={14} y={(P2_PLOT_TOP + P2_PLOT_BOTTOM) / 2} fill={TEXT_COLOR} fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${(P2_PLOT_TOP + P2_PLOT_BOTTOM) / 2})`}>
                    smoothing of small clumps
                  </text>
                  <line x1={massX(0)} y1={smoothY(0)} x2={massX(MAX_TOTAL_MASS_EV)} y2={smoothY(clumpSmoothing(MAX_TOTAL_MASS_EV))} stroke={NEUTRINO_COLOR} strokeWidth={2} />
                  {SMOOTH_PRESETS.map((m) => (
                    <circle key={m} cx={massX(m)} cy={smoothY(clumpSmoothing(m))} r={m === totalMass ? 5.5 : 3.5} fill={m === totalMass ? TRIAL_COLOR : NEUTRINO_COLOR} stroke="#0b1020" />
                  ))}
                  {/* A key for the dots, in the empty corner above the line */}
                  {keyOrder.map((m, i) => (
                    <g key={`key-${m}`}>
                      <circle cx={P2_PLOT_LEFT + 14} cy={P2_PLOT_TOP + 4 + i * 13} r={i === 0 ? 4.5 : 3} fill={i === 0 ? TRIAL_COLOR : NEUTRINO_COLOR} />
                      <text x={P2_PLOT_LEFT + 24} y={P2_PLOT_TOP + 8 + i * 13} fill={i === 0 ? TRIAL_COLOR : TEXT_COLOR} fontSize="10">
                        {i === 0 ? `this run: ${formatTotal(m)} eV smooths them by ${(clumpSmoothing(m) * 100).toFixed(2)} percent` : `${formatTotal(m)} eV: ${(clumpSmoothing(m) * 100).toFixed(1)} percent`}
                      </text>
                    </g>
                  ))}
                </g>
              )}
            </svg>
          </div>
        )}

        {/* Picture 2's guide: draft wording (CLAUDE.md §14 and §29). The worked moments use this run's numbers. */}
        {stage >= 3 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            <p style={paragraph}>
              <strong>How to read this diagram.</strong> Picture 2 has two parts. Part A (stage 3) shows <strong>how much of the universe’s
              matter</strong> the neutrinos make up. Part B (stage 4) shows <strong>how much they smooth out the smallest clumps</strong> of
              matter, for different total masses. Both use the sky’s ordinary measurements of the universe from Planck (the share of the universe’s
              energy that is matter, {omegaMatter}, and the expansion rate, {(h * 100).toFixed(1)} km/s/Mpc, used in Experiments 1 and 3 of this group).
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>Part A, the long grey bar:</strong> all the matter in the universe, ordinary and dark together, counted as 100 percent.
                The pink part at its left end is the neutrinos’ share. For small totals it is a very thin sliver that you can hardly see.
              </li>
              <li>
                <strong>Part A, the second bar (the “zoom”):</strong> the first {zoomPercent} percent of the bar above, <em>magnified {zoomTimes} times</em> so that
                the pink part becomes easy to see. (The zoom is the first 1 percent unless the neutrinos’ share is bigger than that, and then it
                is the first 2, 5 or 10 percent, so that the pink part always fits.) The dashed lines show where it comes from. The pink part of
                the zoom is the neutrinos, and its length on the 0 to {zoomPercent} percent scale is their share: {(result.share * 100).toFixed(2)}{' '}
                percent of the matter. The grey rest is ordinary matter and dark matter.
              </li>
              <li>
                <strong>Part B, the line:</strong> a straight violet line from the bottom left. The further right you go (a larger total
                neutrino mass), the more the smallest clumps are smoothed out (the higher the line). The up axis is the percent by which the
                smallest clumps are smoothed.
              </li>
              <li>
                <strong>Part B, the dots and the key:</strong> the pink dot is the total you chose ({formatTotal(result.totalMassEv)} eV; it starts at DESI’s limit), the violet dots are
                other totals (the key at the top left lists their values). The line is only used up to {MAX_TOTAL_MASS_EV} eV. For larger
                masses the neutrinos’ share is not small, and the simple rule behind the line stops being a good estimate.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment.</strong> The total mass of {formatTotal(result.totalMassEv)} eV, divided by {omegaUnit} eV, gives{' '}
              {(result.totalMassEv / omegaUnit).toFixed(6)}. Astronomers have worked out that this number equals the neutrinos’ share of the universe’s energy
              multiplied by {h} × {h} = {(h * h).toFixed(3)}, where {h} is the expansion rate in units of 100 km/s/Mpc. So the neutrinos’ share of the
              universe’s energy is {(result.totalMassEv / omegaUnit).toFixed(6)} ÷ {(h * h).toFixed(3)} = {energyShare.toFixed(5)}. The matter is {omegaMatter} of the universe’s energy, so the neutrinos’ share <em>of the matter</em> is{' '}
              {energyShare.toFixed(5)} ÷ {omegaMatter} = {result.share.toFixed(5)}, which is{' '}
              {(result.share * 100).toFixed(2)} percent. The smoothing of the smallest clumps is about {SMOOTHING_FACTOR} times that share: {SMOOTHING_FACTOR} × {result.share.toFixed(5)}
              = {result.smoothing.toFixed(4)}, or {(result.smoothing * 100).toFixed(2)} percent. In everyday terms, it is as if fine sand were
              mixed into a snowdrift, a few percent of extra stuff that will not settle softens its edges by a few percent.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong> Here are three things to look at, what each one means, and why it matters.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Look at</strong> how thin the neutrinos’ pink sliver is. <strong>What it means:</strong> for your total ({formatTotal(result.totalMassEv)} eV) it is {(result.share * 100).toFixed(2)} percent of the matter.{' '}
                <strong>Why it matters:</strong> a small share can still change the smallest clumps, which is the effect that surveys of the sky can measure.
              </li>
              <li>
                <strong>Look at</strong> where the pink dot sits on the violet line (it appears at stage 4). <strong>What it means:</strong> {(result.smoothing * 100).toFixed(2)} percent smoothing for your total, about {SMOOTHING_FACTOR} times the share.{' '}
                <strong>Why it matters:</strong> this is the size of the effect that gives the sky a way to weigh the neutrinos.
              </li>
              <li>
                <strong>Look at</strong> what a larger total does (try it in Part 2). <strong>What it means:</strong> at {MAX_TOTAL_MASS_EV} eV the share is {(runNeutrinoMass(MAX_TOTAL_MASS_EV).share * 100).toFixed(2)} percent and the smoothing{' '}
                {(runNeutrinoMass(MAX_TOTAL_MASS_EV).smoothing * 100).toFixed(1)} percent. <strong>Why it matters:</strong> a larger total gives a larger share and a larger effect, so a heavier total would be easier to see, and a limit on the effect is a limit on the total.
              </li>
            </ul>
          </div>
        )}

        {/* Picture 3: the floors and the ceilings (stage 5). */}
        {stage >= 5 && (
          <div style={{ marginBottom: '1rem' }}>
            <svg
              width={VIEW_WIDTH}
              height={p3Height}
              viewBox={`0 0 ${VIEW_WIDTH} ${p3Height}`}
              style={svgStyle}
              role="img"
              aria-label="Picture 3: the minimum total neutrino mass from oscillation experiments and the maximum from the sky, on one number line"
            >
              <defs>
                <pattern id="nm-below-floor" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill="#1e293b" />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#64748b" strokeWidth="2" />
                </pattern>
                <pattern id="nm-gap-to-floor" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                  <rect width="6" height="6" fill="#1e293b" />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#f87171" strokeWidth="2" />
                </pattern>
              </defs>
              <text x={P3_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                Picture 3: the floors and the ceilings
              </text>

              {/* The two floors, as vertical lines (green), labelled above */}
              {([
                { value: floorNormal, label: `normal-ordering floor ${floorNormal.toFixed(4)}`, anchor: 'end' as const, dx: -5 },
                { value: floorInverted, label: `inverted-ordering floor ${floorInverted.toFixed(4)}`, anchor: 'start' as const, dx: 5 },
              ]).map((floor) => (
                <g key={floor.label}>
                  <line x1={eV(floor.value)} y1={44} x2={eV(floor.value)} y2={p3AxisY} stroke={FLOOR_COLOR} strokeWidth={2} strokeDasharray="6 3" />
                  <text x={eV(floor.value) + floor.dx} y={52} fill={FLOOR_COLOR} fontSize="11" textAnchor={floor.anchor}>
                    {floor.label}
                  </text>
                </g>
              ))}

              {/* The ceilings, one per row, in date order; each bar runs from 0 up to its ceiling */}
              {drawnCeilings.map((bound, i) => {
                const y = ROW_TOP + i * ROW_STEP
                const color = bound.value === 0.163 ? PALE_CEILING_COLOR : CEILING_COLOR
                const x0 = eV(0)
                const xc = eV(bound.value)
                const xn = eV(floorNormal)
                const xi = eV(floorInverted)
                return (
                  <g key={bound.name} opacity={0}>
                    <animate attributeName="opacity" from="0" to="1" begin={`${0.3 + i * 0.45}s`} dur="0.4s" fill="freeze" />
                    <text x={P3_LEFT} y={y - 4} fill={color} fontSize="11" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
                      {bound.name}: below {bound.value} eV
                    </text>
                    {/* below the normal floor: not allowed by the oscillation experiments */}
                    <rect x={x0} y={y} width={Math.min(xc, xn) - x0} height={16} fill="url(#nm-below-floor)" />
                    {/* from the normal floor up to the ceiling: the room that is left under the normal ordering */}
                    {xc > xn && <rect x={xn} y={y} width={xc - xn} height={16} fill={color} />}
                    {/* between the ceiling and the inverted floor, where the ceiling is below it: no room under the inverted ordering */}
                    {xc < xi && <rect x={xc} y={y} width={xi - xc} height={16} fill="url(#nm-gap-to-floor)" />}
                    <line x1={xc} y1={y - 2} x2={xc} y2={y + 18} stroke={color} strokeWidth={3} />
                  </g>
                )
              })}

              {/* The axis */}
              <line x1={P3_LEFT} y1={p3AxisY} x2={P3_RIGHT} y2={p3AxisY} stroke={MUTED_COLOR} strokeWidth={1.5} />
              {P3_TICKS.map((t) => (
                <g key={t}>
                  <line x1={eV(t)} y1={p3AxisY - 4} x2={eV(t)} y2={p3AxisY + 4} stroke={MUTED_COLOR} />
                  <text x={eV(t)} y={p3AxisY + 18} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
                    {t.toFixed(2)}
                  </text>
                </g>
              ))}
              <text x={(P3_LEFT + P3_RIGHT) / 2} y={p3AxisY + 38} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
                the three neutrino masses added together (eV)
              </text>

              {/* A key to the three patterns of the bars */}
              {[
                { fill: 'url(#nm-below-floor)', text: 'grey stripes: below the normal-ordering floor, ruled out by the oscillation experiments' },
                { fill: CEILING_COLOR, text: 'solid orange: from the normal-ordering floor up to the ceiling, the room left under that ordering' },
                { fill: 'url(#nm-gap-to-floor)', text: 'red stripes: from a ceiling up to the inverted-ordering floor, where the ceiling is below the floor' },
              ].map((item, i) => (
                <g key={item.text}>
                  <rect x={P3_LEFT} y={p3AxisY + 52 + i * 15} width={16} height={9} fill={item.fill} stroke={MUTED_COLOR} strokeWidth={0.5} />
                  <text x={P3_LEFT + 24} y={p3AxisY + 60 + i * 15} fill={MUTED_COLOR} fontSize="10">
                    {item.text}
                  </text>
                </g>
              ))}

              {/* Your guess for Prediction 2: where you guessed the ceiling lies, on the same eV scale (the first green line is the normal-ordering floor). */}
              {roomPrediction !== null &&
                (() => {
                  const oy = p3Base
                  const band = roomGuessBand(roomPrediction, 'normal')
                  const x1 = eV(band.lo)
                  const x2 = eV(Math.min(band.hi ?? P3_MAX, P3_MAX))
                  const mid = (x1 + x2) / 2
                  const lineY = oy + 56
                  return (
                    <g>
                      <line x1={P3_LEFT} y1={oy} x2={P3_RIGHT} y2={oy} stroke={MUTED_COLOR} strokeDasharray="2 4" />
                      <text x={P3_LEFT} y={oy + 20} fill={GUESS_COLOR} fontSize="12">
                        Your guess for Prediction 2: where the ceiling lies (same scale as above)
                      </text>
                      <line x1={P3_LEFT} y1={lineY} x2={P3_RIGHT} y2={lineY} stroke={MUTED_COLOR} strokeWidth={1.5} />
                      {P3_TICKS.map((t) => (
                        <g key={t}>
                          <line x1={eV(t)} y1={lineY - 3} x2={eV(t)} y2={lineY + 3} stroke={MUTED_COLOR} />
                          <text x={eV(t)} y={lineY + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                            {t.toFixed(2)}
                          </text>
                        </g>
                      ))}
                      <line x1={eV(floorNormal)} y1={lineY - 16} x2={eV(floorNormal)} y2={lineY} stroke={FLOOR_COLOR} strokeWidth={2} />
                      <text x={eV(floorNormal) - 4} y={lineY - 20} fill={FLOOR_COLOR} fontSize="9" textAnchor="end">
                        normal floor
                      </text>
                      <line x1={eV(floorInverted)} y1={lineY - 16} x2={eV(floorInverted)} y2={lineY} stroke={FLOOR_COLOR} strokeWidth={2} />
                      <text x={eV(floorInverted) + 4} y={lineY - 20} fill={FLOOR_COLOR} fontSize="9">
                        inverted floor
                      </text>
                      <rect x={x1} y={lineY - 5} width={Math.max(x2 - x1, 0)} height={10} fill={GUESS_COLOR} opacity={0.9} />
                      {band.hi === null && <polygon points={`${x2},${lineY - 9} ${x2 + 12},${lineY} ${x2},${lineY + 9}`} fill={GUESS_COLOR} />}
                      <line x1={mid} y1={lineY + 5} x2={mid} y2={oy + 84} stroke={GUESS_COLOR} strokeWidth={2} />
                      <rect x={Math.min(Math.max(mid - 110, 10), VIEW_WIDTH - 230)} y={oy + 84} width={220} height={26} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
                      <text x={Math.min(Math.max(mid - 110, 10), VIEW_WIDTH - 230) + 110} y={oy + 101} fill={GUESS_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
                        YOUR GUESS: {ROOM_SHORT[roomPrediction]}
                      </text>
                    </g>
                  )
                })()}
            </svg>
          </div>
        )}

        {/* Picture 3's guide: draft wording (CLAUDE.md §14 and §29). It explains every element and gives a worked moment with this run's numbers. */}
        {stage >= 5 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <p style={paragraph}>
              <strong>How to read this diagram.</strong> This picture is a <strong>number line</strong>, like the marks on a ruler, for the three
              neutrino masses <em>added together</em>, in eV. It puts the two kinds of limit on one line: the <strong>floors</strong> from
              laboratory experiments (the smallest the total can be) and the <strong>ceilings</strong> from the sky (the largest it can be).
              Both sides squeeze the same number.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The line and its numbers (0 to 0.20 eV):</strong> the total mass. KATRIN’s laboratory limit (0.45 eV for one kind of neutrino) is off
                the right-hand end of this line and is not drawn.
              </li>
              <li>
                <strong>The two green dashed lines (floors):</strong> the least the total can be, according to experiments that watch neutrinos
                change kind. There are two possible patterns of masses, so two floors: the <em>normal ordering</em> (one neutrino much heavier than
                the other two), at {floorNormal.toFixed(4)} eV, and the <em>inverted ordering</em> (two heavy ones close together), at{' '}
                {floorInverted.toFixed(4)} eV. Experiments have not yet said which pattern is true.
              </li>
              <li>
                <strong>The orange bars (ceilings), one per row, in the order they were published:</strong> each bar ends at an upper limit (95
                percent) on the total, and the thick vertical mark at its end is the limit. “Below 0.12 eV” means the total is believed to be less
                than 0.12. The names use three short forms: BAO (baryon acoustic oscillations, a pattern in how galaxies are spread that works as a ruler for distances, as in Experiment 2), CMB (the cosmic microwave background) and DR2 (DESI’s second data release). The bars are Planck with other measurements (2018), DESI with the microwave background (March 2025), the same DESI data
                if dark energy is allowed to change (March 2025, paler orange, from Experiment 2’s idea), and DESI with the microwave background
                and new data on the light of distant quasars (July 2026).
              </li>
              <li>
                <strong>The grey striped part of each bar:</strong> totals below the normal-ordering floor, which the oscillation experiments
                have ruled out. <strong>The solid orange part:</strong> the totals between the normal-ordering floor and the ceiling, which are the
                room that is left under the normal ordering. <strong>The red striped part</strong> (where there is one): the stretch between the
                ceiling and the inverted-ordering floor, where the ceiling is below the floor, so the inverted ordering would have no room.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment.</strong> The normal-ordering floor comes from two measured gaps between the squares of the masses,{' '}
              {MASS_SQUARED_GAPS.solar} and {MASS_SQUARED_GAPS.atmosphericNormal} eV². Taking the lightest neutrino as massless, the other two
              weigh √{MASS_SQUARED_GAPS.solar} = {Math.sqrt(MASS_SQUARED_GAPS.solar).toFixed(4)} eV and √{MASS_SQUARED_GAPS.atmosphericNormal} ={' '}
              {Math.sqrt(MASS_SQUARED_GAPS.atmosphericNormal).toFixed(4)} eV, so the total is at least{' '}
              {Math.sqrt(MASS_SQUARED_GAPS.solar).toFixed(4)} + {Math.sqrt(MASS_SQUARED_GAPS.atmosphericNormal).toFixed(4)} ={' '}
              {floorNormal.toFixed(4)} eV. The July 2026 DESI ceiling, {DESI_JULY_2026.value} eV, is {(DESI_JULY_2026.value - floorNormal).toFixed(4)} eV
              above that floor, which is {DESI_JULY_2026.value} ÷ {floorNormal.toFixed(4)} = {(DESI_JULY_2026.value / floorNormal).toFixed(3)} times
              the floor.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The strip at the bottom, with the white band and the YOUR GUESS box:</strong> your guess for Prediction 2, on the same eV scale as the bars above, with the two floors repeated as green marks. “No room”
                covers 0 up to the normal-ordering floor, “very little room” covers the floor up to 1.2 times it, and “plenty of room” everything above that, ending in an arrow. It is only where you guessed, not a result.
              </li>
            </ul>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong> Here are four things to look at, what each one means, and why it matters.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Look at</strong> how far each orange bar reaches to the right of the first green line. <strong>What it means:</strong> the March 2025 ceiling is {desi2025.normal.ratio.toFixed(3)} times the floor, and the July 2026 ceiling{' '}
                {desi2026.normal.ratio.toFixed(3)} times it. <strong>Why it matters:</strong> it is the room left for the normal ordering, and it has nearly closed.
              </li>
              <li>
                <strong>Look at</strong> how that distance changed from the top bar to the bottom bar. <strong>What it means:</strong> the ceilings come down from Planck’s {planckBao.bound.value} to DESI’s {desi2026.bound.value}.{' '}
                <strong>Why it matters:</strong> the limits from the sky have come down toward the floor that the laboratory sets.
              </li>
              <li>
                <strong>Look at</strong> where each orange bar ends compared with the second green line. <strong>What it means:</strong> the 2025 and 2026 ceilings end before it, {desi2025.bound.value} and {desi2026.bound.value} against {floorInverted.toFixed(4)}.{' '}
                <strong>Why it matters:</strong> if the inverted ordering were true, the total would have to be at least {floorInverted.toFixed(4)} eV, so these ceilings leave it no room.
              </li>
              <li>
                <strong>Look at</strong> the white band. <strong>What it means:</strong> where you guessed the ceiling lies. <strong>Why it matters:</strong> it puts your guess on the same scale as the real bars.
              </li>
            </ul>
            <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
              <strong>Where the real picture comes from.</strong> <em>Measured:</em> the oscillation experiments’ mass gaps and every ceiling, by the teams named in the second table. <em>Calculated here:</em> the two floors, from the gaps.{' '}
              <em>Imagined for the question:</em> nothing. The white band is your guess.
            </p>
          </div>
        )}

        {/* After the run: the "Try a different total mass" control, the neutral results, the guide to them and the links kept back until now.
            Draft wording for the owner's review (CLAUDE.md §28.1, §29). The results only report; they do not say why. */}
        {status === 'complete' && (
          <div style={{ marginTop: '0.5rem' }}>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              We are about to try a different total for the three neutrino masses and see what it does. Your total moves the pink marks in Pictures 1 and 2, fills the drawing in this part and the first
              table. It never changes the floors and ceilings in Picture 3, the second table or your guesses.
            </PartHeader>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              Your guesses do not change the drawings or tables. This setting does. The total you choose is a trial value, not a measurement. It moves the pink marks in Pictures 1 and 2, fills the drawing below
              and the first table. It does not change Picture 3 or the second table, because the floors and ceilings are published numbers.
            </p>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Try a different total mass</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              Choose a total for the three neutrino masses added together (shared equally among the three). The worked examples in the “Words and formulas” box change with it too.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              {TOTAL_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setTotalMass(preset.value)}
                  className={`toggle-button${totalMass === preset.value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Drawing A: the total the learner chose (pink), beside the floors and ceilings (on a 0 to 0.5 eV scale), and what it does to three numbers. */}
            {(() => {
              const evX = (value: number) => 40 + (value / MAX_TOTAL_MASS_EV) * 480
              const axisY = 150
              const ceilingsDrawn = CEILINGS.filter((b) => b.drawn).sort((a, b) => a.value - b.value)
              const rows = [
                { title: 'When the neutrinos turn heavy (redshift z)', max: 350, real: desiRun.heavyRedshift, mine: result.heavyRedshift, text: `z = ${result.heavyRedshift.toFixed(1)}`, y: 280 },
                { title: 'Their share of all the matter (percent)', max: 4, real: desiRun.share * 100, mine: result.share * 100, text: `${(result.share * 100).toFixed(2)} percent`, y: 350 },
                { title: 'Smoothing of the smallest clumps (percent)', max: 30, real: desiRun.smoothing * 100, mine: result.smoothing * 100, text: `${(result.smoothing * 100).toFixed(2)} percent`, y: 420 },
              ] as const
              const rowX = (value: number, max: number) => 40 + (value / max) * 480
              return (
                <svg width={VIEW_WIDTH} height={470} viewBox={`0 0 ${VIEW_WIDTH} 470`} style={svgStyle} role="img" aria-label={`The total you chose, ${formatTotal(totalMass)} eV, beside the floors and ceilings, and what it does to three numbers`}>
                  <text x={40} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                    Drawing A: your total beside the floors and ceilings
                  </text>
                  <line x1={40} y1={axisY} x2={520} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1.5} />
                  {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((t) => (
                    <g key={t}>
                      <line x1={evX(t)} y1={axisY - 4} x2={evX(t)} y2={axisY + 4} stroke={MUTED_COLOR} />
                      <text x={evX(t)} y={axisY + 18} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                        {t.toFixed(1)}
                      </text>
                    </g>
                  ))}
                  <text x={280} y={axisY + 34} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
                    the three neutrino masses added together (eV)
                  </text>
                  {[floorNormal, floorInverted].map((f) => (
                    <line key={f} x1={evX(f)} y1={64} x2={evX(f)} y2={axisY} stroke={FLOOR_COLOR} strokeWidth={2} strokeDasharray="5 3" />
                  ))}
                  {ceilingsDrawn.map((b) => (
                    <polygon key={b.name} points={`${evX(b.value) - 5},${axisY - 18} ${evX(b.value) + 5},${axisY - 18} ${evX(b.value)},${axisY - 4}`} fill={CEILING_COLOR} />
                  ))}
                  <line x1={evX(totalMass)} y1={44} x2={evX(totalMass)} y2={axisY} stroke={TRIAL_COLOR} strokeWidth={3} />
                  <circle cx={evX(totalMass)} cy={axisY} r={6} fill={TRIAL_COLOR} stroke={TEXT_COLOR} />
                  <text x={Math.min(evX(totalMass) + 8, 400)} y={50} fill={TRIAL_COLOR} fontSize="12" fontWeight="bold">
                    your total: {formatTotal(totalMass)} eV
                  </text>
                  <text x={40} y={206} fill={FLOOR_COLOR} fontSize="10">
                    green dashed lines: the two floors ({floorNormal.toFixed(4)} and {floorInverted.toFixed(4)})
                  </text>
                  <text x={40} y={220} fill={CEILING_COLOR} fontSize="10">
                    orange triangles: the ceilings ({ceilingsDrawn.map((b) => b.value).join(', ')})
                  </text>
                  {rows.map((row) => (
                    <g key={row.title}>
                      <text x={40} y={row.y - 30} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
                        {row.title}
                      </text>
                      <line x1={40} y1={row.y} x2={520} y2={row.y} stroke={MUTED_COLOR} strokeWidth={1.5} />
                      <text x={40} y={row.y + 16} fill={MUTED_COLOR} fontSize="9">
                        0
                      </text>
                      <text x={520} y={row.y + 16} fill={MUTED_COLOR} fontSize="9" textAnchor="end">
                        {row.max}
                      </text>
                      <line x1={rowX(row.real, row.max)} y1={row.y - 11} x2={rowX(row.real, row.max)} y2={row.y + 11} stroke={MUTED_COLOR} strokeWidth={3} />
                      <text x={rowX(row.real, row.max)} y={row.y - 14} fill={MUTED_COLOR} fontSize="9" textAnchor={row.real / row.max > 0.8 ? 'end' : 'start'}>
                        {row.real / row.max > 0.8 ? '' : ' '}DESI’s limit
                      </text>
                      <line x1={40} y1={row.y} x2={rowX(row.mine, row.max)} y2={row.y} stroke={TRIAL_COLOR} strokeWidth={3} />
                      <circle cx={rowX(row.mine, row.max)} cy={row.y} r={6} fill={TRIAL_COLOR} stroke={TEXT_COLOR} />
                      <text x={Math.min(rowX(row.mine, row.max) + 10, 430)} y={row.y + 28} fill={TRIAL_COLOR} fontSize="11">
                        your total: {row.text}
                      </text>
                    </g>
                  ))}
                </svg>
              )
            })()}

            <div style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={paragraph}>
                <strong>How to read this drawing.</strong> It shows the total you chose beside the published floors and ceilings, and what that total does to three numbers. The first line is a total-mass line from 0 to {MAX_TOTAL_MASS_EV} eV, so
                it is longer than Picture 3’s, which stops at 0.2 eV.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The green dashed lines:</strong> the two floors, the least the total can be according to the oscillation experiments: {floorNormal.toFixed(4)} eV (normal ordering) and {floorInverted.toFixed(4)} eV (inverted ordering).
                </li>
                <li>
                  <strong>The orange triangles:</strong> the four ceilings drawn in Picture 3, the most the total can be according to the sky: {CEILINGS.filter((b) => b.drawn)
                    .sort((a, b) => a.value - b.value)
                    .map((b) => b.value)
                    .join(', ')}{' '}
                  eV. Several sit close together, on top of one another.
                </li>
                <li>
                  <strong>The pink line and dot:</strong> your total, {formatTotal(totalMass)} eV. Pink always means the total you chose. It starts at DESI’s limit.
                </li>
                <li>
                  <strong>The three rows below:</strong> what your total does to the redshift at which the neutrinos turn heavy, their share of the matter and the smoothing of small clumps. Each row has its own scale, from 0 to the number at its right end. The
                  grey tick is the value for DESI’s limit ({formatTotal(RUN_TOTAL_MASS_EV)} eV), the real run. The pink dot is your total.
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment, with your numbers.</strong> For {formatTotal(totalMass)} eV shared equally, each neutrino weighs {formatTotal(totalMass)} ÷ 3 = {eachEv.toFixed(4)} eV. They turn heavy at z = {result.heavyRedshift.toFixed(1)} (for DESI’s limit,
                z = {desiRun.heavyRedshift.toFixed(1)}), make up {(result.share * 100).toFixed(2)} percent of the matter (DESI’s limit: {(desiRun.share * 100).toFixed(2)} percent), and smooth the smallest clumps by {(result.smoothing * 100).toFixed(2)} percent
                (DESI’s limit: {(desiRun.smoothing * 100).toFixed(2)} percent).
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong> Here are three things to look at, what each one means, and why it matters.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Look at</strong> where the pink line sits among the green lines and the orange triangles. <strong>What it means:</strong> {formatTotal(totalMass)} eV is{' '}
                  {totalMass < floorNormal ? 'below both floors' : totalMass < floorInverted ? 'above the normal floor but below the inverted one' : 'above both floors'}, and {totalMass > desi2026.bound.value ? 'above' : 'at or below'} DESI’s July 2026 ceiling of{' '}
                  {desi2026.bound.value} eV. <strong>Why it matters:</strong> a total below a floor is ruled out by the oscillation experiments, and one above a ceiling is ruled out by the sky, in the standard model.
                </li>
                <li>
                  <strong>Look at</strong> how the three rows change as you choose a larger total. <strong>What it means:</strong> all three pink dots move right together. <strong>Why it matters:</strong> a heavier total makes the neutrinos turn heavy earlier, make up more of the matter and smooth clumps more.
                </li>
                <li>
                  <strong>Look at</strong> the pink marks in Pictures 1 and 2 above. <strong>What it means:</strong> they are your total, the same as here. The white marks never move. <strong>Why it matters:</strong> it keeps what you chose to look at apart from what you guessed.
                </li>
              </ul>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>Where the real picture comes from.</strong> <em>Measured:</em> the oscillation experiments’ mass gaps (the floors come from them) and the ceilings, by the teams named in the second table. <em>Calculated here:</em> the three rows, from the total.{' '}
                <em>Imagined for the question:</em> the total you chose, and its equal split into three. The pink marks are your own choice. Your guesses are not drawn here, because they never change a picture.
              </p>
            </div>

            <PartHeader color="#0f766e" title="Part 3: The results">
              We are about to read the numbers: first a check-up of the ceilings against the floors, then the tables. A guess never changes them. The total you chose in Part 2 changes the first table, and the page says which one is on.
            </PartHeader>

            <div style={{ border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', padding: '1rem', fontSize: '0.875rem' }}>
              <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                <strong>Results.</strong> These are the numbers behind the three pictures. They only report what was published and what was calculated.
                They do not say why the numbers are what they are.
              </p>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The check-up: each ceiling against the floor</p>
              <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>What was checked</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>What we would expect</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>What was found</th>
                    <th style={{ padding: '0.4rem 0' }}>Reading</th>
                  </tr>
                </thead>
                <tbody>
                  {checkUp.map((row, i) => (
                    <tr key={row.label} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                      <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>
                        {row.label}
                        {i === 0 ? ' (the row for Prediction 2)' : ''}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>at least {row.floor.toFixed(4)} eV (the {row.floorName})</td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        {row.ceiling} eV ({row.ratio.toFixed(3)} times the floor)
                      </td>
                      <td style={{ padding: '0.4rem 0', fontWeight: 'bold' }}>
                        {row.reading}
                        {row.reading === 'less' ? ' (below the floor)' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
                The check-up does not follow the total you chose in Part 2 or your guesses.
              </p>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>DESI 2026 against the normal floor.</strong> The ceiling is only {(checkUp[0].ceiling - checkUp[0].floor).toFixed(4)} eV above the floor, which is {checkUp[0].ratio.toFixed(3)} times it. It matters because there is almost no room left for the
                    normal ordering in the standard model.
                  </li>
                  <li>
                    <strong>Against the inverted floor.</strong> The ceiling is below it by {(checkUp[1].floor - checkUp[1].ceiling).toFixed(4)} eV. It matters because the inverted ordering would have no room at all in the standard model. The page does not say which ordering is true.
                  </li>
                  <li>
                    <strong>DESI 2025.</strong> {checkUp[2].ratio.toFixed(3)} times the floor. It matters because it shows the ceiling came down toward the floor from March 2025 to July 2026.
                  </li>
                  <li>
                    <strong>Planck 2018 + BAO.</strong> {checkUp[3].ratio.toFixed(3)} times the floor, about twice. It matters because it was the loose limit before DESI.
                  </li>
                  <li>
                    <strong>How sure the floors are.</strong> They come from two mass gaps whose numbers were taken from a search result, not read at the paper’s table, so treat them as approximate.
                  </li>
                </ul>
              </div>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your guesses, beside the results</p>
              <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                Your guesses are shown here as you made them, with the place where each one’s number appears. They are not marked here, and they never change a picture or a table.
              </p>
              <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
                <li>
                  <strong>Prediction 1, when the neutrinos turn heavy:</strong> {timingPrediction !== null ? TIMING_CHOICES.find((c) => c.value === timingPrediction)?.label.toLowerCase() : ''}. The question was for a total of {PREDICTION_TOTAL_MASS_EV} eV. Its numbers are in Table 1
                  (the rows “Redshift at which they turn heavy” and “How many times later than the release”, for the total you chose in Part 2; DESI’s limit, {formatTotal(RUN_TOTAL_MASS_EV)} eV, is close to {PREDICTION_TOTAL_MASS_EV} eV) and in Picture 1.
                </li>
                <li>
                  <strong>Prediction 2, how much room there is:</strong> {roomPrediction !== null ? ROOM_CHOICES.find((c) => c.value === roomPrediction)?.label.toLowerCase() : ''}. Its numbers are in the check-up (the first row), in Table 2 (the July 2026 DESI row, against the normal
                  floor) and in Picture 3.
                </li>
              </ul>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>For a total of {formatTotal(result.totalMassEv)} eV, shared equally</p>
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
                        ['Each of the three masses', `${eachEv.toFixed(4)} eV`, `${formatTotal(result.totalMassEv)} ÷ 3`],
                        ['A typical neutrino’s energy today', `${result.typicalEnergyTodayEv.toFixed(6)} eV`, `${MEAN_ENERGY_IN_KT} × k × ${result.neutrinoTemperatureKelvin.toFixed(3)} K`],
                        ['Redshift at which they turn heavy (a row for Prediction 1)', `z = ${result.heavyRedshift.toFixed(1)}`, `(${eachEv.toFixed(4)} ÷ ${result.typicalEnergyTodayEv.toFixed(6)}) − 1`],
                        ['Age of the universe then', `about ${millions(result.heavyTimeYears)} million years`, 'the age function of Cosmology Experiment 6, at Planck’s expansion rate'],
                        ['The microwave background’s release', `z = ${RECOMBINATION_REDSHIFT}, ${RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years`, 'Cosmology Experiment 3'],
                        ['How many times later than the release (a row for Prediction 1)', `${result.timesLaterThanRelease.toFixed(0)} times`, `${Math.round(result.heavyTimeYears).toLocaleString('en-US')} ÷ ${RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')}`],
                        ['Redshift if one neutrino carried the whole total', `z = ${result.heavyRedshiftOneNeutrino.toFixed(1)}`, `(${formatTotal(result.totalMassEv)} ÷ ${result.typicalEnergyTodayEv.toFixed(6)}) − 1`],
                        ['The neutrinos’ share of all the matter', `${(result.share * 100).toFixed(2)} percent`, `${formatTotal(result.totalMassEv)} ÷ ${omegaUnit} ÷ ${(h * h).toFixed(3)} ÷ ${omegaMatter}`],
                        ['Smoothing of the smallest clumps', `${(result.smoothing * 100).toFixed(2)} percent`, `${SMOOTHING_FACTOR} × ${result.share.toFixed(5)}`],
                      ] as const
                    ).map(([label, value, how]) => (
                      <tr key={label} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                        <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>{label}</td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{value}</td>
                        <td style={{ padding: '0.4rem 0 0.4rem 0.5rem', color: 'var(--text-muted)' }}>{how}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Each of the three masses.</strong> {formatTotal(result.totalMassEv)} ÷ 3 = {eachEv.toFixed(4)} eV. It matters because the turning point depends on the mass of one neutrino, not on the total.
                  </li>
                  <li>
                    <strong>The redshift and the age when they turn heavy.</strong> z = {result.heavyRedshift.toFixed(1)}, about {millions(result.heavyTimeYears)} million years after the Big Bang. It matters because it says when the neutrinos stopped acting like light, and it is the number for Prediction 1.
                  </li>
                  <li>
                    <strong>How many times later than the release.</strong> About {result.timesLaterThanRelease.toFixed(0)} times later than the microwave background’s release, which was {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after the Big Bang. It matters because it
                    says the light of the microwave background was released while the neutrinos still acted like light.
                  </li>
                  <li>
                    <strong>The redshift if one neutrino carried the whole total.</strong> z = {result.heavyRedshiftOneNeutrino.toFixed(1)}, the grey circle on Picture 1. It matters because it shows that the answer does not depend on how the mass is shared.
                  </li>
                  <li>
                    <strong>The share of the matter and the smoothing.</strong> {(result.share * 100).toFixed(2)} percent of the matter, smoothing the smallest clumps by {(result.smoothing * 100).toFixed(2)} percent, which is {SMOOTHING_FACTOR} times the share. It matters because a small share can
                    still be measured by the surveys, which is how the sky puts a limit on the total.
                  </li>
                </ul>
              </div>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Every floor, ceiling and limit</p>
              <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '560px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>Name</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Year</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Kind</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>Value (eV)</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Against the normal floor</th>
                      <th style={{ padding: '0.4rem 0 0.4rem 0.5rem' }}>Against the inverted floor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BOUNDS.map((bound) => {
                      const room = result.rooms.find((r) => r.bound === bound)
                      return (
                        <tr key={bound.name} style={{ borderBottom: '1px solid var(--border-color, #ccc)', verticalAlign: 'top' }}>
                          <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>
                            {bound.name}
                            {bound.name === 'DESI DR2 + CMB (July 2026)' ? ' (the row for Prediction 2)' : ''}
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bound.source}</div>
                          </td>
                          <td style={{ padding: '0.4rem 0.5rem' }}>{bound.year}</td>
                          <td style={{ padding: '0.4rem 0.5rem' }}>
                            {bound.kind === 'floor' ? 'floor (oscillations)' : bound.kind === 'direct' ? 'ceiling, one kind (KATRIN)' : `ceiling (${bound.confidence})`}
                          </td>
                          <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{bound.kind === 'floor' ? bound.value.toFixed(4) : bound.value}</td>
                          <td style={{ padding: '0.4rem 0.5rem' }}>{room ? roomText(room.normal) : '—'}</td>
                          <td style={{ padding: '0.4rem 0 0.4rem 0.5rem' }}>{room ? roomText(room.inverted) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Floors and ceilings.</strong> A floor is a minimum from oscillation experiments, computed here from their measured gaps. A ceiling is a 95 percent upper limit from the sky. It matters because the total has to lie between the two.
                  </li>
                  <li>
                    <strong>KATRIN.</strong> Its limit (90 percent) is for one kind of neutrino, not the sum, so it is not compared with the floors.
                  </li>
                  <li>
                    <strong>The last two columns.</strong> Each ceiling divided by a floor, and how far above it. “Below the floor” means the ceiling is lower than the floor, by the amount shown. The row for Prediction 2 is the July 2026 DESI ceiling against the normal floor:{' '}
                    {desi2026.normal.ratio.toFixed(3)} times it. It matters because it is the room that is left.
                  </li>
                  <li>
                    <strong>Not changed by your total.</strong> This table and Picture 3 use published numbers, so they never follow the control.
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>More to read, now that you have seen the results.</strong> These are the papers and DESI’s own guide, whose summaries state
                what the predictions ask, so they were kept back until now. They open in a new tab. Most of the papers use technical words.
              </p>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2607.27410">
                    DESI DR2 Results IV: Alcock-Paczyński measurements from the Lyman-alpha forest and cosmological constraints (2026)
                  </ExternalLink>
                  : the paper with DESI’s newest neutrino-mass limits, in its section on neutrino masses. It opens on arxiv.org, the free site where
                  scientists post their papers.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2503.14744">Constraints on neutrino physics from DESI DR2 BAO and DR1 full shape (Elbers et al., 2025)</ExternalLink>
                  : the paper behind the March 2025 limit, including the assumption of three equal neutrino masses.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2503.14738">DESI DR2 Results II: baryon acoustic oscillations and cosmological constraints (2025)</ExternalLink>
                  : DESI’s main paper for the March 2025 release, with its neutrino-mass limits for the standard model and for a changing dark energy.
                </li>
                <li>
                  <ExternalLink href="https://www.desi.lbl.gov/2025/03/19/desi-dr2-results-march-19-guide/">DESI: DR2 Results, March 19 guide</ExternalLink>
                  : DESI’s own plainer guide to its March 2025 results, from the team that ran the survey.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2410.05380">NuFit-6.0: updated global analysis of three-flavor neutrino oscillations (2024)</ExternalLink>
                  : the global fit of oscillation experiments from which the two floors are worked out.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2406.13516">Direct neutrino-mass measurement based on 259 days of KATRIN data (2024)</ExternalLink>
                  : the paper behind KATRIN’s laboratory limit of 0.45 eV.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/1807.06209">Planck 2018 results VI: cosmological parameters</ExternalLink>: the paper behind the
                  2018 limit of 0.12 eV and the matter share of {omegaMatter} used here.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2406.14554">Neutrino mass bounds from DESI 2024 are relaxed by Planck PR4 and cosmological supernovae (Allali and Notari)</ExternalLink>
                  : shows how a different choice of microwave-background data loosens an earlier DESI limit.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2605.21456">Negative neutrino mass or negative dark energy? (Kıbrıs et al., 2026)</ExternalLink>
                  : a 2026 paper on the mismatch between the sky’s limit and the oscillation floor, and one way out of it.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The summary below the experiment (in
            App) is shown only once the learner reaches the explanation. */}
        {status === 'complete' && (
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            We are about to talk through your two predictions with the tutor, who will compare them with the results. Three short questions, one at a time. Nothing is graded.
          </PartHeader>
        )}
        {status === 'complete' && timingPrediction !== null && roomPrediction !== null && (
          <NeutrinoMassTutor
            totalMassEv={totalMass}
            timingPrediction={timingPrediction}
            roomPrediction={roomPrediction}
            onExplained={() => onTutorComplete?.()}
          />
        )}
      </div>
    </div>
  )
}
