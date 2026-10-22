import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BETELGEUSE,
  brightnessRatio,
  chanceOfSigma,
  COMPANION,
  oneInChance,
  periodAgreementPercent,
  PLANETS,
  radiusRangeAU,
  runBetelgeuseCompanion,
  SOLAR_RADII_PER_AU,
} from '../physics/betelgeuseCompanion'
import type { Reach, SigmaAnswer } from '../physics/betelgeuseCompanion'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 12 (docs/experiments/frontier-and-beyond/12-betelgeuse-and-its-companion.md).
// Step 6 builds the five-stage run: Picture 1 fills in at stages 1 and 2, Picture 2 at stage 3 and Picture 3 at stages 4 and 5, each with a guide. The results, the
// controls, the tutor and the chapter summary are later steps.
// Step 5 builds the two predictions (their answer buttons, Run gated on both, and Start over); Run only records the predictions, because the run is a later step.
// Step 4 (the interface skeleton) builds the page's skeleton: the status line, the introduction with its new-word list, its assumptions and its "Want to know more?"
// links, one illustration (how an angle and a distance give a size) with its guide, and the collapsed "Words and formulas" panel. The two predictions, the run, the
// three pictures, the controls, the results and the tutor are later steps. All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1), written to the
// standard of §29. The introduction does not give the star's size, the period, or the chance of 1.5 sigma (those are what the predictions and the run show, §12). The
// interface only displays numbers from src/physics (CLAUDE.md §9); this step shows none of the results.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const STAR_COLOR = '#fb923c' // orange: the star
const YOU_COLOR = '#38bdf8' // sky blue: you, the observer
const ANGLE_COLOR = '#fde047' // yellow: the angle
const SIZE_COLOR = '#4ade80' // green: the star's real size
const DISTANCE_COLOR = '#c084fc' // purple: the distance
const COMPANION_COLOR = '#22d3ee' // cyan: the companion and its orbit
const BAND_COLOR = '#fdba74' // pale orange: the range of sizes the papers allow
const NOISE_COLOR = '#a5b4fc' // lavender: the noise curve
const TAIL_COLOR = '#fde047' // yellow: the tail (the chance of noise alone)
const PLANET_COLORS: Record<string, string> = { Mercury: '#d4d4d8', Venus: '#fcd34d', Earth: '#38bdf8', Mars: '#f87171', Jupiter: '#fdba74' }

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

// ---- Illustration: how an angle and a distance give a size (not to scale; it shows the idea, not Betelgeuse) ----
function AngleDrawing() {
  const height = 340
  const eyeX = 70
  const eyeY = 190
  const starX = 430
  const radius = 80
  // The two lines run from the eye to the top and bottom edges of the star; the arc between them is the angle.
  const half = Math.atan2(radius, starX - eyeX)
  const arcR = 70
  const ax = eyeX + arcR * Math.cos(half)
  const ay = (sign: number) => eyeY + sign * arcR * Math.sin(half)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale: an observer on the left looks at a round star on the right. Two yellow lines run from the observer to the top and the bottom edge of the star, and the angle between them is marked. A green bracket beside the star marks its real size across, and a purple arrow underneath marks the distance from the observer to the star"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: how an angle and a distance give a size
      </text>

      {/* The star: a round ball seen from far away. */}
      <circle cx={starX} cy={eyeY} r={radius} fill={STAR_COLOR} fillOpacity={0.85} stroke={STAR_COLOR} strokeWidth={2} />
      <SvgLines x={starX} y={eyeY + 4} lines={['a star (a round', 'ball, seen from', 'far away)']} fill="#0b1020" bold anchor="middle" />

      {/* You: the observer. */}
      <circle cx={eyeX - 8} cy={eyeY} r={8} fill={YOU_COLOR} />
      <SvgLines x={eyeX - 8} y={eyeY + 28} lines={['you, looking', 'through a telescope']} fill={YOU_COLOR} bold anchor="middle" />

      {/* The two lines of sight, and the angle between them. */}
      <line x1={eyeX} y1={eyeY} x2={starX} y2={eyeY - radius} stroke={ANGLE_COLOR} strokeWidth={2} />
      <line x1={eyeX} y1={eyeY} x2={starX} y2={eyeY + radius} stroke={ANGLE_COLOR} strokeWidth={2} />
      <path d={`M ${ax} ${ay(-1)} A ${arcR} ${arcR} 0 0 1 ${ax} ${ay(1)}`} fill="none" stroke={ANGLE_COLOR} strokeWidth={3} />
      <SvgLines x={eyeX + 6} y={eyeY - 104} lines={['the angle between the two lines', 'is the star’s “angular size”']} fill={ANGLE_COLOR} bold />
      <line x1={eyeX + 40} y1={eyeY - 76} x2={ax + 2} y2={eyeY - 2} stroke={ANGLE_COLOR} strokeWidth={1} strokeDasharray="2 3" />

      {/* The star's real size across, beside the star. */}
      <line x1={532} y1={eyeY - radius} x2={532} y2={eyeY + radius} stroke={SIZE_COLOR} strokeWidth={2.5} />
      <line x1={526} y1={eyeY - radius} x2={538} y2={eyeY - radius} stroke={SIZE_COLOR} strokeWidth={2.5} />
      <line x1={526} y1={eyeY + radius} x2={538} y2={eyeY + radius} stroke={SIZE_COLOR} strokeWidth={2.5} />
      <SvgLines x={548} y={eyeY - radius - 32} lines={['the star’s real size', 'across (what we want', 'to find out)']} fill={SIZE_COLOR} bold anchor="end" />

      {/* The distance from you to the star. */}
      <line x1={eyeX - 8} y1={304} x2={starX} y2={304} stroke={DISTANCE_COLOR} strokeWidth={2.5} />
      <line x1={eyeX - 8} y1={298} x2={eyeX - 8} y2={310} stroke={DISTANCE_COLOR} strokeWidth={2.5} />
      <line x1={starX} y1={298} x2={starX} y2={310} stroke={DISTANCE_COLOR} strokeWidth={2.5} />
      <SvgLines x={(eyeX + starX) / 2} y={296} lines={['the distance from you to the star']} fill={DISTANCE_COLOR} bold anchor="middle" />

      <SvgLines x={20} y={height - 6} lines={['Not to scale. A real star is so far away that the angle is far too small to draw.']} fill={MUTED_COLOR} />
    </svg>
  )
}

const lookForDrawing: LookFor[] = [
  {
    look: 'the two yellow lines from you to the top and the bottom of the star, and the arc between them.',
    means: 'the arc is the angle the star takes up in your view, its angular size. A bigger star, or a nearer one, takes up a bigger angle.',
    matters: 'an angle is something a telescope can measure, even when the star is far too far away for anyone to measure its size directly. It is the first of the two things we need.',
  },
  {
    look: 'the purple arrow underneath, from you to the star.',
    means: 'the distance to the star. For the same angle, a star twice as far away must be twice as big across.',
    matters: 'an angle alone does not give a size. We also need the distance, and that is harder to measure, so the size is only as sure as the distance is.',
  },
  {
    look: 'the green bracket beside the star.',
    means: 'the star’s real size across, which no telescope can see directly. It is worked out from the angle and the distance.',
    matters: 'this is how astronomers can say how big a star is, and it is why you will be asked, in a moment, to guess how big Betelgeuse is before you are shown.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Fusion', meaning: 'the way a star makes its energy. Inside a star it is so hot, and the weight pressing in is so great, that the centres of atoms (nuclei) are squeezed together until they stick and make one bigger nucleus. Each joining gives off energy as heat and light. In most of a star’s life, hydrogen nuclei fuse into helium. Later, helium nuclei can fuse into heavier ones, such as carbon, nitrogen and oxygen.' },
  { term: 'Core and shell', meaning: 'the core is a star’s very centre, the hottest, densest part, where fusion starts. A shell is a layer of the star’s material that lies round the core, like the flesh of a peach round its stone. When the core runs out of hydrogen, hydrogen in the shell round it can fuse instead.' },
  { term: 'Red giant', meaning: 'a star that has used up the hydrogen in its core and has swollen to many times its old size. NASA describes how: the core shrinks and heats up, helium starts to fuse there, hydrogen fuses in a shell around it, and the extra heat makes the star’s outer layer of gas puff up. Its surface is cooler than before, so it looks redder. The Sun will become one, NASA says some 6 billion years from now.' },
  { term: 'Red supergiant', meaning: 'the same kind of swelling in a star much heavier than the Sun. It ends up far larger than a red giant. Betelgeuse is one.' },
  { term: 'Companion star', meaning: 'a second star that goes round a first one, the two held together by gravity. The pair orbit their common centre. A companion much smaller than the star it orbits is hard to see in its glare.' },
  { term: 'Angular size, and the milliarcsecond', meaning: 'how much of your view an object takes up, measured as an angle. A circle is 360 degrees; one degree is 60 arcminutes; one arcminute is 60 arcseconds; so one degree is 3,600 arcseconds. A milliarcsecond (mas) is a thousandth of an arcsecond, which is a very small angle indeed: the smallest details telescopes can pick out.' },
  { term: 'Radian', meaning: 'another unit for angles. One radian is about 57.3 degrees. It has a useful property: for a small angle in radians, the size of an object is its distance times the angle (size = angle × distance), as in the worked moment under the illustration.' },
  { term: 'Parsec (pc)', meaning: 'a unit of distance used by astronomers: about 3.26 light-years, or about 206,265 times the Earth’s distance from the Sun. It is defined so that one thousandth of an arcsecond (one milliarcsecond) at one parsec is a size of one thousandth of an astronomical unit.' },
  { term: 'Astronomical unit (AU)', meaning: 'the average distance from the Earth to the Sun, about 150 million kilometres. It is a handy ruler for sizes and distances in the solar system: Mars is about 1.5 AU from the Sun and Jupiter about 5.2.' },
  { term: 'Light-year', meaning: 'the distance light travels in a year, about 9.5 million million kilometres.' },
  { term: 'Solar mass and solar radius', meaning: 'the Sun’s mass and the Sun’s radius, used as rulers for other stars. “17.5 solar masses” means 17.5 times as heavy as the Sun.' },
  { term: 'Sigma and noise', meaning: 'every measurement has some random “noise”, a give-or-take that comes from the instrument and the conditions, not from the thing being measured. Sigma counts how many give-or-takes bigger a signal is than that noise, as in Experiment 1 of this group. The bigger the number, the less likely it is that noise alone made the signal. In many sciences, 5 sigma is the usual bar for calling something a discovery.' },
  { term: 'Speckle imaging', meaning: 'a way to take sharper pictures from the ground. The air blurs a star’s image and keeps changing, so the team takes many thousands of extremely short exposures, each too quick to be blurred, and combines them with careful processing.' },
  { term: 'Elongation', meaning: 'how far apart two objects look in the sky. A companion’s “greatest elongation” is the moment in its orbit when it looks farthest from the star it orbits, which makes it the easiest time to see.' },
  { term: 'Orbital period', meaning: 'the time an object takes to go once round its orbit.' },
  { term: 'Kepler’s third law', meaning: 'the rule that links an orbit’s size, its period and the masses of the two bodies: the farther apart they are, the longer the orbit takes; the heavier they are, the shorter. The experiment shows it with numbers after the run.' },
]


// ---- Number formats (every value comes from the physics module) ----
const millionsText = (value: number) => `${(value / 1e6).toFixed(2)} million`
// A small number in the form 2.87 × 10⁻⁷.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
function sciTextShort(value: number): string {
  const [mantissa, exponent] = value.toExponential(2).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'Betelgeuse in the Solar System', 'How sure is the size?', 'The companion’s orbit', 'How strong is the hint?', 'Predicted in advance']

// ---- Picture 1: Betelgeuse next to the Solar System (drawn to scale). Stage 1: the star and the orbits; stage 2: the range the papers allow ----
const P1_PX_PER_AU = 40
const P1_X = 280
const P1_Y = 284

function PictureOne({ stage }: { stage: number }) {
  const height = 546
  const result = runBetelgeuseCompanion()
  const range = radiusRangeAU()
  const px = (au: number) => au * P1_PX_PER_AU
  const labelY = [192, 218, 244, 270] // the left-hand labels of Mercury, Venus, Earth and Mars
  const inner = PLANETS.slice(0, 4)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1, to scale: the Sun at the centre with the orbits of Mercury, Venus, Earth, Mars and Jupiter as circles round it. A large orange disc, Betelgeuse's surface if its centre were at the Sun, covers the orbits of Mercury, Venus, Earth and Mars and stops short of Jupiter's orbit. Its radius is ${result.radiusAU.toFixed(2)} astronomical units${stage >= 2 ? `, and a paler band marks the range of radius the papers allow, ${range.min.toFixed(1)} to ${range.max.toFixed(1)} astronomical units, which also stops short of Jupiter's orbit` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: Betelgeuse next to the Solar System
      </text>
      <SvgLines x={20} y={38} lines={['If Betelgeuse took the Sun’s place, seen from above, to scale']} fill={MUTED_COLOR} />

      {/* Stage 2: the range of radius the papers allow, as a paler band (drawn first, under the star). */}
      {stage >= 2 && (
        <g>
          <circle cx={P1_X} cy={P1_Y} r={px(range.max)} fill={BAND_COLOR} fillOpacity={0.22} stroke={BAND_COLOR} strokeWidth={1.2} strokeDasharray="4 3" />
          <circle cx={P1_X} cy={P1_Y} r={px(range.min)} fill="#0b1020" fillOpacity={0.0} stroke={BAND_COLOR} strokeWidth={1.2} strokeDasharray="4 3" />
          <SvgLines x={P1_X} y={P1_Y + px(range.max) + 14} lines={['the paler band: the range of radius', `the papers allow (${range.min.toFixed(1)} to ${range.max.toFixed(1)} AU)`]} fill={BAND_COLOR} bold anchor="middle" size={9} />
        </g>
      )}

      {/* Stage 1: Betelgeuse's surface, a large orange disc centred on the Sun. */}
      {stage >= 1 && (
        <g>
          <circle cx={P1_X} cy={P1_Y} r={px(result.radiusAU)} fill={STAR_COLOR} fillOpacity={0.55} stroke={STAR_COLOR} strokeWidth={2.5} />
          <line x1={P1_X} y1={P1_Y} x2={P1_X + px(result.radiusAU)} y2={P1_Y} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <SvgLines x={P1_X + 70} y={P1_Y - 8} lines={[`radius ${result.radiusAU.toFixed(2)} AU`, `(${Math.round(result.radiusSolarRadii)} solar radii)`]} fill={TEXT_COLOR} bold anchor="start" size={10} />
          <SvgLines x={P1_X} y={P1_Y + px(result.radiusAU) - 34} lines={['Betelgeuse’s surface, if its', 'centre were where the Sun is']} fill={TEXT_COLOR} bold anchor="middle" size={10} />
        </g>
      )}

      {/* The five orbits (rings), and the planets on them. */}
      {PLANETS.map((planet) => (
        <circle key={planet.name} cx={P1_X} cy={P1_Y} r={px(planet.orbitAU)} fill="none" stroke={PLANET_COLORS[planet.name]} strokeWidth={1.2} strokeDasharray={planet.name === 'Jupiter' ? '' : '3 3'} />
      ))}
      <SvgLines x={P1_X} y={P1_Y - px(PLANETS[4].orbitAU) - 6} lines={[`Jupiter’s orbit (${PLANETS[4].orbitAU} AU)`]} fill={PLANET_COLORS.Jupiter} bold anchor="middle" />
      {inner.map((planet, i) => {
        const dotX = P1_X - px(planet.orbitAU)
        return (
          <g key={planet.name}>
            <circle cx={dotX} cy={P1_Y} r={3.5} fill={PLANET_COLORS[planet.name]} stroke="#0b1020" strokeWidth={1} />
            <line x1={118} y1={labelY[i] - 4} x2={dotX} y2={P1_Y} stroke={PLANET_COLORS[planet.name]} strokeWidth={0.8} />
            <SvgLines x={116} y={labelY[i]} lines={[`${planet.name} (${planet.orbitAU} AU)`]} fill={PLANET_COLORS[planet.name]} bold anchor="end" size={10} />
          </g>
        )
      })}
      <circle cx={P1_X + px(PLANETS[4].orbitAU)} cy={P1_Y} r={4} fill={PLANET_COLORS.Jupiter} stroke="#0b1020" strokeWidth={1} />
      <SvgLines x={P1_X + px(PLANETS[4].orbitAU) + 7} y={P1_Y + 4} lines={['Jupiter']} fill={PLANET_COLORS.Jupiter} bold anchor="start" size={10} />

      {/* The Sun, at the centre, drawn larger than it is. */}
      <circle cx={P1_X} cy={P1_Y} r={3} fill="#fbbf24" />
      <SvgLines x={P1_X + 6} y={P1_Y + 14} lines={['Sun']} fill="#fbbf24" bold anchor="start" size={10} />

      {/* The scale bar. */}
      <line x1={20} y1={height - 24} x2={20 + P1_PX_PER_AU} y2={height - 24} stroke={TEXT_COLOR} strokeWidth={2} />
      <SvgLines x={20 + P1_PX_PER_AU + 8} y={height - 20} lines={['= 1 AU, the Earth’s distance from the Sun (about 150 million km)']} fill={MUTED_COLOR} />
    </svg>
  )
}

// ---- Picture 2: the companion's orbit (drawn to scale, seen from above for clarity) ----
const P2_PX_PER_AU = 21
const P2_X = 280
const P2_Y = 300

function PictureTwo() {
  const height = 566
  const result = runBetelgeuseCompanion()
  const px = (au: number) => au * P2_PX_PER_AU
  const orbit = px(result.modelSeparationAU)
  const disc = px(result.radiusAU)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 2, to scale, seen from above: Betelgeuse as an orange disc at the centre, a cyan circle round it for the companion's orbit, ${result.modelSeparationAU.toFixed(1)} astronomical units in radius, which is ${result.separationInBetelgeuseRadii.toFixed(1)} times the star's radius, and a dashed grey circle for Jupiter's orbit for comparison. The companion is marked at four places: behind the star, in front of it, and at its two farthest points to the sides, on 6 December 2024 and on 26 November 2027. An arrow at the bottom shows the direction of the Earth`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: the companion’s orbit
      </text>
      <SvgLines x={20} y={38} lines={['Seen from above, to scale (from the Earth the orbit is seen nearly edge-on)']} fill={MUTED_COLOR} />

      <circle cx={P2_X} cy={P2_Y} r={px(PLANETS[4].orbitAU)} fill="none" stroke={PLANET_COLORS.Jupiter} strokeWidth={1.2} strokeDasharray="4 4" />
      <SvgLines x={P2_X} y={P2_Y + px(PLANETS[4].orbitAU) + 14} lines={[`Jupiter’s orbit, for comparison (${PLANETS[4].orbitAU} AU)`]} fill={PLANET_COLORS.Jupiter} bold anchor="middle" size={9} />

      <circle cx={P2_X} cy={P2_Y} r={disc} fill={STAR_COLOR} fillOpacity={0.6} stroke={STAR_COLOR} strokeWidth={2.5} />
      <SvgLines x={P2_X} y={P2_Y - 4} lines={['Betelgeuse', `(radius ${result.radiusAU.toFixed(2)} AU)`]} fill={TEXT_COLOR} bold anchor="middle" size={10} />

      <circle cx={P2_X} cy={P2_Y} r={orbit} fill="none" stroke={COMPANION_COLOR} strokeWidth={2.5} />
      <SvgLines x={548} y={74} lines={[`the companion’s orbit: radius ${result.modelSeparationAU.toFixed(1)} AU,`, `${result.separationInBetelgeuseRadii.toFixed(1)} times Betelgeuse’s radius`]} fill={COMPANION_COLOR} bold anchor="end" size={10} />
      <line x1={470} y1={98} x2={P2_X + orbit * 0.71} y2={P2_Y - orbit * 0.71} stroke={COMPANION_COLOR} strokeWidth={1} strokeDasharray="2 3" />

      {/* Four places on the orbit. The top is behind the star, the bottom in front, the two sides are the points of greatest elongation. */}
      <circle cx={P2_X} cy={P2_Y - orbit} r={5} fill={COMPANION_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={P2_X + 12} y={P2_Y - orbit + 36} lines={['behind Betelgeuse:', 'the 2020 pictures,', 'no spot (as predicted)']} fill={TEXT_COLOR} anchor="start" size={9} />
      <circle cx={P2_X} cy={P2_Y + orbit} r={5} fill={COMPANION_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={P2_X + 12} y={P2_Y + orbit + 18} lines={['in front of Betelgeuse:', 'crossing its face']} fill={TEXT_COLOR} anchor="start" size={9} />
      <circle cx={P2_X + orbit} cy={P2_Y} r={5} fill={COMPANION_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={P2_X + orbit + 8} y={P2_Y + 20} lines={['greatest', 'elongation,', 'one side:', '6 Dec 2024 (the', '2024 pictures:', 'a faint spot)']} fill={TEXT_COLOR} anchor="start" size={9} />
      <circle cx={P2_X - orbit} cy={P2_Y} r={5} fill={COMPANION_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={8} y={P2_Y + 20} lines={['greatest', 'elongation,', 'other side:', '26 Nov 2027', '(the next', 'good chance)']} fill={TEXT_COLOR} anchor="start" size={9} />

      {/* The direction of the Earth. */}
      <line x1={P2_X} y1={height - 8} x2={P2_X} y2={height - 44} stroke={YOU_COLOR} strokeWidth={2} />
      <path d={`M ${P2_X - 6} ${height - 38} L ${P2_X} ${height - 48} L ${P2_X + 6} ${height - 38}`} fill="none" stroke={YOU_COLOR} strokeWidth={2} />
      <SvgLines x={P2_X + 12} y={height - 24} lines={['toward the Earth (where we look from)']} fill={YOU_COLOR} bold anchor="start" size={10} />

      {/* The period. */}
      <SvgLines
        x={12}
        y={62}
        lines={[`Time for one orbit, from Kepler’s third law`, `(Betelgeuse ${BETELGEUSE.massSolar} and the companion ${COMPANION.massSolar} solar masses):`, `${result.periodYears.toFixed(2)} years = ${Math.round(result.periodDays).toLocaleString('en-US')} days`, `The long cycle that was observed: ${COMPANION.observedPeriodRangeDays[0].toLocaleString('en-US')} to ${COMPANION.observedPeriodRangeDays[1].toLocaleString('en-US')} days, depending on the paper`]}
        fill={TEXT_COLOR}
        bold
        size={10}
      />
    </svg>
  )
}

// ---- Picture 3: how strong is the hint? Stage 4: the noise curve and its tail; stage 5: the five predictions that matched ----
const P3_LEFT = 40
const P3_PX_PER_SIGMA = 480 / 9
const P3_BASE = 232
const P3_PEAK = 150 // the height of the curve's peak
const sigmaToX = (z: number) => P3_LEFT + (z + 3.5) * P3_PX_PER_SIGMA
const bell = (z: number) => Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)
const sigmaToY = (z: number) => P3_BASE - (bell(z) / bell(0)) * P3_PEAK

const FIVE_MATCHES: { name: string; found: string }[] = [
  { name: '1. When it appears', found: 'no spot in the 2020 pictures, when the companion was predicted to be behind Betelgeuse, and a faint spot in December 2024, at its greatest elongation' },
  { name: '2. Separation', found: `${COMPANION.separationMas} milliarcseconds, as predicted` },
  { name: '3. Direction', found: `${COMPANION.positionAngleDegrees}° east of north, as predicted` },
  { name: '4. Brightness', found: `about ${COMPANION.magnitudeDifference} magnitudes fainter than Betelgeuse (about ${Math.round(brightnessRatio(COMPANION.magnitudeDifference))} times fainter), as predicted` },
  { name: '5. Mass', found: 'between 1.4 and 2.0 solar masses, likeliest 1.6, as predicted' },
]

// Breaks a sentence into lines of at most `width` characters, at spaces (for text inside a drawing).
function wrapText(text: string, width: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines
}

function PictureThree({ stage }: { stage: number }) {
  const height = stage >= 5 ? 566 : 300
  const z = COMPANION.reportedSigma
  const points: string[] = []
  for (let i = 0; i <= 180; i++) {
    const v = -3.5 + (i * 9) / 180
    points.push(`${sigmaToX(v).toFixed(1)},${sigmaToY(v).toFixed(1)}`)
  }
  const tail: string[] = [`${sigmaToX(z).toFixed(1)},${P3_BASE}`]
  for (let i = 0; i <= 80; i++) {
    const v = z + (i * (5.5 - z)) / 80
    tail.push(`${sigmaToX(v).toFixed(1)},${sigmaToY(v).toFixed(1)}`)
  }
  tail.push(`${sigmaToX(5.5).toFixed(1)},${P3_BASE}`)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 3: a bell curve showing how large a spot random noise alone makes, measured in sigma, with the middle most common. The part of the curve beyond ${z} sigma is shaded yellow: noise alone makes a spot at least that strong about 1 time in ${Math.round(oneInChance(z))}. A marker at 5 sigma shows the usual bar for a discovery, about 1 time in ${millionsText(oneInChance(5))}${stage >= 5 ? '. Below the curve, five boxes list the five things the team predicted in advance and found: when the companion appears, its distance from Betelgeuse, its direction, its brightness and its mass' : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: how strong is the hint?
      </text>
      <SvgLines x={20} y={38} lines={['The curve: how big a spot random noise alone would make, with no companion at all']} fill={MUTED_COLOR} />

      {/* Stage 4: the curve (noise alone), the tail beyond the reported spot and the 5 sigma marker. */}
      {stage >= 4 && (
        <g>
          <polygon points={tail.join(' ')} fill={TAIL_COLOR} fillOpacity={0.75} />
          <polyline points={points.join(' ')} fill="none" stroke={NOISE_COLOR} strokeWidth={2.5} />
          <line x1={P3_LEFT} y1={P3_BASE} x2={P3_LEFT + 480} y2={P3_BASE} stroke={MUTED_COLOR} />
          {[-3, -2, -1, 0, 1, 2, 3, 4, 5].map((t) => (
            <g key={t}>
              <line x1={sigmaToX(t)} y1={P3_BASE} x2={sigmaToX(t)} y2={P3_BASE + 5} stroke={MUTED_COLOR} />
              <text x={sigmaToX(t)} y={P3_BASE + 17} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                {t < 0 ? `−${-t}` : t}
              </text>
            </g>
          ))}
          <SvgLines x={sigmaToX(1)} y={P3_BASE + 32} lines={['size of the spot, in sigma (give-or-takes above the average noise)']} fill={MUTED_COLOR} anchor="middle" />
          <SvgLines x={sigmaToX(-3.5) + 10} y={78} lines={['noise alone makes spots', 'of all sizes. The middle', '(0) is the most common']} fill={NOISE_COLOR} bold size={10} />
          <line x1={sigmaToX(z)} y1={P3_BASE} x2={sigmaToX(z)} y2={sigmaToY(z) - 28} stroke={TAIL_COLOR} strokeWidth={2} />
          <SvgLines x={sigmaToX(z) + 8} y={92} lines={[`the reported spot: ${z} sigma`, `shaded: the chance that noise alone makes`, `a spot at least this strong, 1 time in ${Math.round(oneInChance(z))}`]} fill={TAIL_COLOR} bold size={10} />
          <line x1={sigmaToX(z) + 6} y1={118} x2={sigmaToX(z) + 14} y2={sigmaToY(z) + 10} stroke={TAIL_COLOR} strokeWidth={1} strokeDasharray="2 3" />
          <line x1={sigmaToX(5)} y1={P3_BASE} x2={sigmaToX(5)} y2={P3_BASE - 36} stroke={TEXT_COLOR} strokeWidth={2} />
          <SvgLines x={548} y={P3_BASE - 66} lines={['5 sigma, the usual bar for a', `discovery: 1 time in ${millionsText(oneInChance(5))}`]} fill={TEXT_COLOR} bold anchor="end" size={10} />
        </g>
      )}

      {/* Stage 5: the five things the paper says the team predicted, and found. */}
      {stage >= 5 && (
        <g>
          <line x1={20} y1={286} x2={540} y2={286} stroke={MUTED_COLOR} strokeWidth={0.5} />
          <SvgLines x={20} y={306} lines={['Predicted in advance, and found, in the 2024 pictures (the paper lists these five)']} fill={TEXT_COLOR} bold size={11} />
          {FIVE_MATCHES.map((row, i) => (
            <g key={row.name}>
              <rect x={20} y={320 + i * 46} width={520} height={40} rx={4} fill="none" stroke={COMPANION_COLOR} strokeWidth={1.2} />
              <SvgLines x={28} y={344 + i * 46} lines={[row.name]} fill={COMPANION_COLOR} bold size={10} />
              <SvgLines x={150} y={337 + i * 46} lines={wrapText(row.found, 80)} fill={TEXT_COLOR} size={9} />
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right. The first question has three buttons
// (the physics module's `Reach` also has "past Earth", which has no button).
const REACH_CHOICES: ReadonlyArray<{ value: Reach; label: string }> = [
  { value: 'inside Earth', label: 'Inside Earth’s orbit' },
  { value: 'past Mars', label: 'Past Mars but not as far as Jupiter' },
  { value: 'past Jupiter', label: 'Past Jupiter’s orbit' },
]
const SIGMA_CHOICES: ReadonlyArray<{ value: SigmaAnswer; label: string }> = [
  { value: '1 in 2', label: 'About 1 time in 2' },
  { value: '1 in 15', label: 'About 1 time in 15' },
  { value: '1 in 3.5 million', label: 'About 1 time in 3.5 million' },
]

interface BetelgeuseCompanionExperimentProps {
  onComplete?: () => void
}

export function BetelgeuseCompanionExperiment({ onComplete }: BetelgeuseCompanionExperimentProps) {
  const [reachPrediction, setReachPrediction] = useState<Reach | null>(null)
  const [sigmaPrediction, setSigmaPrediction] = useState<SigmaAnswer | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const hasRun = status !== 'idle'
  const bothPredicted = reachPrediction !== null && sigmaPrediction !== null

  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
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
    setReachPrediction(null)
    setSigmaPrediction(null)
    setStatus('idle')
    setStage(0)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }

  // Every number below comes from the physics module (CLAUDE.md §9).
  const result = runBetelgeuseCompanion()
  const range = radiusRangeAU()
  const sigma = COMPANION.reportedSigma
  const lookForPictureOne: LookFor[] = [
    {
      look: 'the large orange disc, and the five rings (the orbits of Mercury, Venus, Earth, Mars and Jupiter), with Jupiter’s ring outside the disc.',
      means: `Betelgeuse’s surface would be ${result.radiusAU.toFixed(2)} AU from its centre, which is ${Math.round(result.radiusSolarRadii)} times the Sun’s radius. The orbits of ${result.planetsInside.slice(0, -1).join(', ')} and ${result.planetsInside[result.planetsInside.length - 1]} all lie inside it, and Jupiter’s (${PLANETS[4].orbitAU} AU) lies outside it.`,
      matters: 'a red supergiant is not just a bigger star. If Betelgeuse were at the centre of our Solar System, the Earth and Mars would be inside it. This is what “red supergiant” means in kilometres.',
    },
    {
      look: 'the white line from the centre to the edge of the disc, and its label.',
      means: `the radius, ${result.radiusAU.toFixed(2)} AU, comes from the star’s angular size (${BETELGEUSE.angularDiameterMas} milliarcseconds) and its distance (${BETELGEUSE.distancePc} parsecs), as in the illustration above: radius = ½ × angle × distance.`,
      matters: 'nobody can measure the star’s size directly. The size is only as sure as the angle and the distance are, and the paler band, which appears in stage 2, shows how much that matters.',
    },
    {
      look: 'the paler orange band round the disc’s edge, and the dashed rings that mark its inner and outer edges.',
      means: `the papers allow a distance from about ${BETELGEUSE.distanceRangePc[0]} to ${BETELGEUSE.distanceRangePc[1]} parsecs and an angular size from ${BETELGEUSE.angularDiameterRangeMas[0]} to ${BETELGEUSE.angularDiameterRangeMas[1]} milliarcseconds, so the radius could be anywhere from ${range.min.toFixed(1)} to ${range.max.toFixed(1)} AU.`,
      matters: `even at the largest size the papers allow, Betelgeuse’s surface stops short of Jupiter’s orbit (${PLANETS[4].orbitAU} AU), and even at the smallest it reaches past Mars (${PLANETS[3].orbitAU} AU). The answer to the question “how far out would it reach?” is firm, even though the exact size is not.`,
    },
  ]
  const lookForPictureTwo: LookFor[] = [
    {
      look: 'the cyan circle, the companion’s orbit, compared with the orange disc and with Jupiter’s dashed orbit.',
      means: `the orbit’s radius is ${result.modelSeparationAU.toFixed(1)} AU, which is ${result.separationInBetelgeuseRadii.toFixed(1)} times Betelgeuse’s radius. The companion goes round outside the star’s surface but well inside the distance of Jupiter from the Sun.`,
      matters: 'a companion this close must move through the thin outer gas of the swollen star, which is why astronomers talk about its “wake”, and it is why the star’s glare makes it so hard to see.',
    },
    {
      look: 'the four marked places on the orbit: behind, in front, and the two greatest-elongation points on the sides.',
      means: 'when the companion is behind Betelgeuse, or in front of it, we cannot tell it apart from the star, which is why the 2020 pictures showed nothing. When it is at the side, as in December 2024, it is as far from the star on the sky as it ever gets, and the next time is 26 November 2027.',
      matters: 'the team picked the date for its 2024 pictures because the orbit said that was the best time to look, so the spot, if real, had to be at a certain place on a certain date. That is what makes the test fair (Picture 3).',
    },
    {
      look: 'the two numbers at the top left: the time for one orbit worked out with Kepler’s third law, and the long cycle that was observed.',
      means: `the orbit of radius ${result.modelSeparationAU.toFixed(1)} AU, with the two stars’ masses, takes ${result.periodYears.toFixed(2)} years, or ${Math.round(result.periodDays).toLocaleString('en-US')} days; the long cycle measured in Betelgeuse’s light is quoted as ${COMPANION.observedPeriodRangeDays[0].toLocaleString('en-US')} to ${COMPANION.observedPeriodRangeDays[1].toLocaleString('en-US')} days, depending on the paper. The orbit time is within about ${Math.ceil(periodAgreementPercent(result.periodDays))} percent of every one of those values.`,
      matters: 'if the companion is real and has this orbit, its orbit time should match the star’s long cycle, and it is close. This is a reason to take the idea seriously, but it is not a detection of the companion, because the idea was built to explain that cycle.',
    },
  ]
  const lookForPictureThree: LookFor[] = [
    {
      look: 'the yellow shaded tail beyond the 1.5 mark.',
      means: `noise alone, with no companion at all, would make a spot at least ${sigma} sigma strong about ${(chanceOfSigma(sigma) * 100).toFixed(1)} percent of the time, which is 1 time in ${Math.round(oneInChance(sigma))}, counting only spots that are too strong, not too weak.`,
      matters: 'a result that noise makes 1 time in 15 is not rare. By itself this spot cannot be called a discovery, and the team calls it a probable detection.',
    },
    {
      look: 'the white marker at 5 sigma, far out on the right of the curve.',
      means: `5 sigma is the usual bar for calling something a discovery. Noise alone makes a spot that strong only 1 time in ${millionsText(oneInChance(5))}. The tail beyond it is far too thin to see on the curve.`,
      matters: 'the reported spot is a long way from that bar, which is why the next step in the picture matters: what else points the same way.',
    },
    {
      look: 'the five boxes below the curve.',
      means: 'the paper lists five things that were worked out before looking at the pictures, and found: when the companion appears, how far from Betelgeuse, in which direction, how bright and how heavy.',
      matters: 'a spot found where it was predicted, on the predicted date, is much less likely to be a trick of the noise than a spot found by searching the whole picture. The paper does not combine these into one number, and neither does this experiment; they are a reason to wait for more evidence, not a confirmation.',
    },
  ]
  const done = status === 'complete'
  const widthAU = BETELGEUSE.angularDiameterMas * BETELGEUSE.distancePc * 0.001
  const cubed = result.modelSeparationAU ** 3
  const totalMass = BETELGEUSE.massSolar + COMPANION.massSolar
  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'The size of a star from its angle and distance (formula)',
      meaning: `radius = ½ × angular size × distance, with the angle in radians. In the units astronomers use, one milliarcsecond at one parsec is 0.001 AU, so the width in AU is the angle in milliarcseconds times the distance in parsecs times 0.001. Betelgeuse: ${BETELGEUSE.angularDiameterMas} × ${BETELGEUSE.distancePc} × 0.001 = ${widthAU.toFixed(2)} AU across, so the radius is ${result.radiusAU.toFixed(2)} AU, which is ${result.radiusAU.toFixed(2)} × ${SOLAR_RADII_PER_AU.toFixed(1)} = ${Math.round(result.radiusSolarRadii)} solar radii.`,
    },
    {
      term: 'A separation from an angle (formula)',
      meaning: `the same working turns the companion’s separation on the sky into a length: ${COMPANION.separationMas} milliarcseconds × ${BETELGEUSE.distancePc} parsecs × 0.001 = ${result.separationFromAngleAU.toFixed(2)} AU. The model orbit’s separation, ${COMPANION.modelSeparationSolarRadii} solar radii, is ${result.modelSeparationAU.toFixed(2)} AU. The two agree to within ${((Math.abs(result.separationFromAngleAU - result.modelSeparationAU) / result.modelSeparationAU) * 100).toFixed(1)} percent.`,
    },
    {
      term: 'Kepler’s third law (formula)',
      meaning: `(time for one orbit in years)² = (distance in AU)³ ÷ (the two masses added, in solar masses). Here ${result.modelSeparationAU.toFixed(2)}³ ÷ (${BETELGEUSE.massSolar} + ${COMPANION.massSolar}) = ${cubed.toFixed(1)} ÷ ${totalMass.toFixed(1)} = ${(cubed / totalMass).toFixed(2)}, and the square root is ${result.periodYears.toFixed(2)} years, which is ${Math.round(result.periodDays).toLocaleString('en-US')} days (one year taken as ${365.25} days). Because Betelgeuse’s mass is so much larger than the companion’s, the sum hardly changes when the companion’s mass changes, so the period cannot weigh the companion.`,
    },
    {
      term: 'The chance of noise alone (formula)',
      meaning: `for a result of z sigma, the chance that noise alone makes a result at least that strong, counting only one direction, is the area of the bell curve beyond z. For z = ${sigma} it is ${chanceOfSigma(sigma).toFixed(4)}, so 1 ÷ ${chanceOfSigma(sigma).toFixed(4)} = ${oneInChance(sigma).toFixed(1)}: about 1 time in ${Math.round(oneInChance(sigma))}. For z = 5 it is ${sciTextShort(chanceOfSigma(5))}, which is 1 time in ${millionsText(oneInChance(5))}.`,
    },
    {
      term: 'Magnitudes (formula)',
      meaning: `a difference of m magnitudes is a brightness ratio of 10 raised to the power of 0.4 × m. Five magnitudes is exactly 100 times; ${COMPANION.magnitudeDifference} magnitudes is 10^(0.4 × ${COMPANION.magnitudeDifference}) = ${brightnessRatio(COMPANION.magnitudeDifference).toFixed(0)} times. A larger magnitude means a fainter object.`,
    },
  ]
  return (
    <div>
      <h2>Experiment 12 — The Star That May Be About to Explode: What Is Betelgeuse, and Does It Have a Companion?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): Betelgeuse is a red supergiant, near the end of its life. Whether it has a companion star is still being tested, with
            reports in 2025 and 2026 and the next good chance for a direct look on 26 November 2027. What the evidence adds up to is shown after you press Run, so that
            you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Betelgeuse is one of the brightest stars in the winter sky, an orange-red star at the shoulder of the constellation Orion. It is
            a very large star, near the end of its life. Two questions come up about it. How big is it, really, compared with our own solar system? And does it have a smaller star
            circling it, hidden in its glare, as some astronomers have suspected for years?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Experiment 1 of this group you learned what “sigma” means, how many give-or-takes bigger than the noise a result is. In
            Gravity Experiment 6 you saw how orbits work, and in Black Holes Experiment 9 you saw that what happens at the end of a star’s life depends on how heavy it
            is. This experiment starts a new part of the group, on how stars live and die, with a star near the end of its life.
          </p>

          <p style={paragraph}>
            <strong>What a star does for most of its life.</strong> A star shines because of <strong>fusion</strong>. Deep inside, the star is crushed by its own
            weight and is extremely hot. The tiny particles there, the centres of atoms (called nuclei), are squeezed together so hard that they stick and join into one
            bigger nucleus, a bit like two small drops of water running together into one bigger drop. Each joining gives off energy as heat and light, and that energy
            is what makes the star shine. For most of a star’s life, the nuclei of hydrogen, the lightest atom, fuse together into helium, the next lightest. This
            happens in the star’s <strong>core</strong>, its very centre. A star’s mass decides how fast it uses up its fuel, and the heavier a star is, the faster it
            goes through it (NASA’s page on stars says so).
          </p>

          <p style={paragraph}>
            <strong>What changes at the end.</strong> Think of a peach: the hard stone in the middle is the core, and the soft flesh round it is a <strong>shell</strong>{' '}
            of the star’s material. When the core has used up its hydrogen, NASA explains, it shrinks and heats up, until it is hot enough for the helium nuclei to
            fuse together as well, into heavier ones such as carbon, nitrogen and oxygen. Meanwhile the hydrogen that is left in the shell round the core gets hot
            enough to fuse too. All this extra heat makes the star’s outer layer of gas <strong>puff up</strong>, a little as warming the air in a balloon makes it
            swell. The star becomes far larger, and its surface cooler and redder. A star like the Sun becomes a <strong>red giant</strong>; a much heavier star becomes a{' '}
            <strong>red supergiant</strong>. NASA writes that the Sun will do this some 6 billion years from now, and that it is confident the Sun will swallow Mercury
            and Venus, and not Mars, while the Earth’s fate is less clear.
          </p>

          <p style={paragraph}>
            <strong>Betelgeuse.</strong> Betelgeuse is a red supergiant, and NASA calls it the closest red supergiant to the Earth. Its distance is not known very
            exactly: estimates run from about 550 light-years to about 700. It is not steady. NASA says it has a cycle of about 400 days and a longer one of about 5
            years (the team that looked for a companion says about 6), and in 2019 and early 2020 it dimmed sharply, which NASA describes as the star blowing off a giant
            piece of its surface into space. It will eventually explode as a supernova, but NASA says that is not likely for about another 100,000 years, and this
            experiment is not about when. (Experiment 13 of this group is about a supernova.)
          </p>

          <p style={paragraph}>
            <strong>Why a companion was suggested.</strong> Betelgeuse’s long cycle of about six years is the puzzle. A team writing in 2025 says it cannot be explained
            by the star’s own pulsations (its regular swelling and shrinking). One explanation is a <strong>companion star</strong>: a smaller star going round Betelgeuse,
            so close that it moves through the supergiant’s outer atmosphere. In the glare of such a huge, bright star, a small star would be extremely hard to see.
          </p>

          <p style={paragraph}>
            <strong>What was found.</strong> In July 2025 a team led by NASA’s Steve Howell, using the Gemini North telescope in Hawai‘i, reported a faint spot beside
            Betelgeuse in pictures taken in December 2024, at the place and time where a companion was predicted to appear. They took the pictures with{' '}
            <strong>speckle imaging</strong>, which freezes out the blurring caused by the air. Pictures taken in 2020, when the companion was predicted to be behind
            Betelgeuse, showed no spot. The spot is only about <strong>1.5 sigma</strong>, which the team calls a probable detection. In 2026 other teams reported
            other signs that follow the same cycle: a trail of denser gas in Betelgeuse’s atmosphere, seen with the Hubble Space Telescope and ground telescopes, and a
            slight change in Betelgeuse’s shape in radio waves. The next time the companion is expected to look farthest from Betelgeuse, and so easiest to see, is 26
            November 2027.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <AngleDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It shows the idea behind the first question, how big Betelgeuse is. It is a sketch of any round object seen
              from far away, not of Betelgeuse itself, and it is not to scale.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The orange ball</strong> on the right is a star.
              </li>
              <li>
                <strong>The blue dot</strong> on the left is you, looking at it through a telescope.
              </li>
              <li>
                <strong>The two yellow lines</strong> run from you to the top and bottom of the star. <strong>The yellow arc</strong> between them is the angle the star
                takes up in your view, its <strong>angular size</strong>.
              </li>
              <li>
                <strong>The purple arrow</strong> is the distance from you to the star.
              </li>
              <li>
                <strong>The green bracket</strong> is the star’s real size across, the thing we want to find out.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with a coin.</strong> Hold up a coin 2.4 metres away and it takes up an angle of about 0.01 radians (about half a degree): its
              width, 0.024 metres, divided by the distance, 2.4 metres, gives 0.01. Turn it round: if you know the angle (0.01 radians) and the distance (2.4 metres),
              the width is the angle times the distance, 0.01 × 2.4 = 0.024 metres, about 2.4 centimetres. This works for any small angle, the “radian” in the box
              below. Astronomers do exactly this with a star, with the angle measured in thousandths of an arcsecond and the distance in parsecs.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForDrawing} />
          </div>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> That Betelgeuse is a red supergiant near the end of its life is well established. Whether it has a
            companion is not yet settled, and how the evidence stands, and how heavy the companion would be, is shown after the run, with each source’s own words.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Fusion</strong>, <strong>core</strong> and <strong>shell</strong>: how a star makes its energy, its centre, and the layer round the centre.
              </li>
              <li>
                <strong>Red giant</strong> and <strong>red supergiant</strong>: a star that has used up its core’s hydrogen and swollen, and the much heavier kind.
              </li>
              <li>
                <strong>Companion star</strong>: a second star that goes round a first.
              </li>
              <li>
                <strong>Angular size</strong>, <strong>milliarcsecond</strong> and <strong>radian</strong>: how much of your view something takes up, and two units for it.
              </li>
              <li>
                <strong>Parsec</strong> and <strong>astronomical unit</strong>: two rulers for distances in space.
              </li>
              <li>
                <strong>Sigma</strong>: how many give-or-takes bigger than the noise a signal is.
              </li>
              <li>
                <strong>Speckle imaging</strong> and <strong>elongation</strong>: how the team took the pictures, and when a companion looks farthest from its star.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values
            for the distance, the masses and the strength of the signal. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It treats Betelgeuse as a perfect ball with a sharp edge (the real star has a fuzzy edge,
            pulsates and changes size), uses published values for its angle and distance, and draws the companion’s orbit as a circle. It does not model the inside of
            the star, its pulsations or the 2019 dimming, and it does not combine the different lines of evidence into one number, because the papers give none.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://jpl.nasa.gov/news/nasa-scientist-finds-predicted-companion-star-to-betelgeuse/">
                NASA: NASA scientist finds predicted companion star to Betelgeuse
              </ExternalLink>
              : NASA’s account of the July 2025 announcement.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/what-is-betelgeuse-inside-the-strange-volatile-star">
                NASA: What is Betelgeuse? Inside the strange, volatile star
              </ExternalLink>
              : a plain account of the star, its size, its dimming and its future.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/exoplanets/resources/life-and-death/chapter-6/">NASA: Aging into gianthood</ExternalLink>: how a star becomes a red giant,
              including the Sun’s future.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/stars/">NASA: Stars</ExternalLink>: how a star’s mass decides how it lives and ends.
            </li>
            <li>
              <ExternalLink href="https://www.cfa.harvard.edu/news/cfa-scientists-detect-wake-betelgeuses-elusive-companion-star">
                Center for Astrophysics | Harvard &amp; Smithsonian: scientists detect the “wake” of Betelgeuse’s elusive companion
              </ExternalLink>
              : the January 2026 report of the trail of denser gas.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={done ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is
            right, and neither gives the star's size or the chance. */}
        {(
          [
            {
              title: 'Prediction 1: how big?',
              text: (
                <>
                  Betelgeuse is a red supergiant. Imagine it replaced the Sun, with its centre where the Sun is. Mercury, Venus, Earth, Mars and Jupiter would be at their
                  usual distances. How far out would its surface reach?
                </>
              ),
              choices: REACH_CHOICES,
              value: reachPrediction,
              set: (v: Reach) => setReachPrediction(v),
            },
            {
              title: 'Prediction 2: how strong is the hint?',
              text: (
                <>
                  The team’s picture shows a faint spot, at the place and time where a companion was predicted, that is <strong>1.5 sigma</strong> (the spot is 1.5
                  “give-or-takes” stronger than the background noise). If there were really nothing there, and noise alone were responsible, how often would noise make
                  a spot at least this strong in that place? Count only spots that are too strong, not too weak, as in Experiment 1.
                </>
              ),
              choices: SIGMA_CHOICES,
              value: sigmaPrediction,
              set: (v: SigmaAnswer) => setSigmaPrediction(v),
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

        <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || hasRun} style={{ padding: '0.6rem 1.5rem' }}>
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
        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}`}</strong>
              {status === 'complete' && (
                <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>
              )}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 && `Picture 1 shows Betelgeuse’s surface, as if its centre were where the Sun is, with the orbits of the planets drawn to the same scale. Its radius, worked out from its angle and distance, is ${result.radiusAU.toFixed(2)} AU.`}
            {stage === 2 && `A paler band is added: the range of radius the papers allow, from ${range.min.toFixed(1)} to ${range.max.toFixed(1)} AU, because the distance and the angle are not known exactly.`}
            {stage === 3 && `Picture 2 appears below Picture 1. It shows the companion’s orbit, ${result.modelSeparationAU.toFixed(1)} AU in radius, and the time one orbit takes, ${result.periodYears.toFixed(2)} years.`}
            {stage === 4 && `Picture 3 appears below Picture 2. It shows how often noise alone would make a spot as strong as the reported ${sigma} sigma: 1 time in ${Math.round(oneInChance(sigma))}.`}
            {stage === 5 && 'Five boxes are added to Picture 3: the five things that were predicted in advance and found.'}
          </p>
        )}

        {/* Picture 1: the star and the orbits from stage 1, the range from stage 2. */}
        {hasRun && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureOne stage={stage} />
          </div>
        )}
        {hasRun && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 1.</strong> You are looking down on the Solar System from above, and everything is drawn to the same scale: the bar at the
              bottom left is 1 AU. The tiny amber dot in the middle is the Sun. The five rings are the orbits of Mercury, Venus, Earth, Mars and Jupiter, each with a
              dot for the planet and its distance from the Sun in AU. The large orange disc is Betelgeuse’s surface, drawn as if the star’s centre were at the Sun’s
              place, as in Prediction 1.
            </p>
            {stage >= 2 && (
              <p style={paragraph}>
                <strong>The paler band</strong> (stage 2) is the range of radius that the papers’ uncertainty allows: its inner dashed ring is the smallest radius, {range.min.toFixed(1)}{' '}
                AU, and its outer ring the largest, {range.max.toFixed(1)} AU.
              </p>
            )}
            <p style={paragraph}>
              <strong>A worked moment.</strong> The star’s angle is {BETELGEUSE.angularDiameterMas} milliarcseconds across, and it is {BETELGEUSE.distancePc} parsecs away. One milliarcsecond at one
              parsec is 0.001 AU, so the width is {BETELGEUSE.angularDiameterMas} × {BETELGEUSE.distancePc} × 0.001 = {(BETELGEUSE.angularDiameterMas * BETELGEUSE.distancePc * 0.001).toFixed(2)} AU, and the radius, half of
              that, is {result.radiusAU.toFixed(2)} AU. One AU is {SOLAR_RADII_PER_AU.toFixed(0)} solar radii, so that is {Math.round(result.radiusSolarRadii)} solar radii.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureOne.slice(0, stage >= 2 ? 3 : 2)} />
          </div>
        )}

        {stage >= 3 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureTwo />
          </div>
        )}
        {stage >= 3 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 2.</strong> The orange disc is Betelgeuse, the cyan circle is the companion’s orbit and the cyan dots are the companion at four
              places on it; the companion itself is far too small to draw to scale. The picture looks down on the orbit from above, to the same scale as Picture 1 (the
              grey dashed circle is Jupiter’s orbit again, for comparison). From the Earth, shown by the blue arrow, the orbit is seen nearly edge-on, so the
              companion looks as if it moves from one side of the star to the other and back, passing behind and in front of it. <strong>Elongation</strong> is how far
              apart the two look on the sky, and it is greatest when the companion is at the side.
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> Kepler’s third law: the time for one orbit in years squared equals the distance in AU cubed, divided by the two masses added
              together in solar masses. Here {result.modelSeparationAU.toFixed(2)}³ ÷ ({BETELGEUSE.massSolar} + {COMPANION.massSolar}) = {(result.modelSeparationAU ** 3 / (BETELGEUSE.massSolar + COMPANION.massSolar)).toFixed(2)}, and the square root
              of that is {result.periodYears.toFixed(2)} years, which is {Math.round(result.periodDays).toLocaleString('en-US')} days.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureTwo} />
          </div>
        )}

        {stage >= 4 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureThree stage={stage} />
          </div>
        )}
        {stage >= 4 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 3.</strong> The <strong>lavender curve</strong> shows what noise alone does when there is nothing there to find: spots of many
              sizes, the small ones most often and the big ones rarely. The scale along the bottom is in <strong>sigma</strong>, how many give-or-takes bigger than the
              average noise a spot is. The <strong>yellow shaded tail</strong> is all the spots at least as strong as the reported one ({sigma} sigma), and its size
              compared with the whole curve is the chance that noise alone makes one: {(chanceOfSigma(sigma) * 100).toFixed(1)} percent, 1 time in {Math.round(oneInChance(sigma))}. This counts only spots that are too strong, not too weak, as in
              Experiment 1. The <strong>white marker</strong> at 5 sigma is the usual bar for a discovery.
            </p>
            {stage >= 5 && (
              <p style={paragraph}>
                <strong>The five boxes</strong> (stage 5) are the five things the paper says were worked out beforehand and then found in the 2024 pictures. The{' '}
                <strong>brightness</strong> is given in <strong>magnitudes</strong>, the astronomers’ scale: five magnitudes fainter is exactly 100 times fainter, so {COMPANION.magnitudeDifference} magnitudes is about{' '}
                {Math.round(brightnessRatio(COMPANION.magnitudeDifference))} times fainter, the {Math.round(brightnessRatio(COMPANION.magnitudeDifference))} coming from 10 raised to the power of 0.4 × {COMPANION.magnitudeDifference}. A
                <strong> milliarcsecond</strong> is a thousandth of an arcsecond; 52 of them is the angle between the star and the companion on the sky.
              </p>
            )}
            <p style={paragraph}>
              <strong>A worked moment.</strong> The reported spot is {sigma} sigma. The chance of noise alone making a spot at least that strong is the area of the shaded
              tail, {chanceOfSigma(sigma).toFixed(4)}, and 1 ÷ {chanceOfSigma(sigma).toFixed(4)} = {oneInChance(sigma).toFixed(1)}, so about 1 time in {Math.round(oneInChance(sigma))}. At 5 sigma the same working gives 1 time in {millionsText(oneInChance(5))}.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureThree.slice(0, stage >= 5 ? 3 : 2)} />
          </div>
        )}

        {/* The results, shown only after the run completes: the status label, three tables, and the links kept back until now. Table 4, the learner's own what-ifs, comes
            with the controls, a later step. */}
        {done && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p style={{ ...paragraph, padding: '0.75rem 1rem', border: '2px solid var(--border-color, #ccc)', borderRadius: '8px', fontSize: '0.875rem' }}>
              <strong>Where this stands (as of October 2026).</strong> <strong>Settled:</strong> Betelgeuse is a red supergiant, near the end of its life.{' '}
              <strong>Strong evidence:</strong> it has a companion (several independent signs agree with an orbit of about 6 years), but no clear direct image has
              confirmed it. <strong>Open:</strong> the companion’s mass (estimates run from about 1.2 to 1.6 solar masses, and one analysis excludes more than about
              1.5) and its exact nature. The next good chance to see it directly is 26 November 2027.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>How to read these results.</strong> Table 1 is the size: it comes from an angle and a distance, and it holds across the range the papers allow.
              Table 2 is the orbit: the separation from the angle on the sky and from the model, and the time one orbit takes with Kepler’s third law, set beside the long
              cycle that was observed, plus the three different estimates of the companion’s mass, which have not been reconciled. Table 3 is the evidence so far, one
              row for each source, in the sources’ own cautious words. Nothing here is a confirmation: the experiment explains each number and leaves the weighing of the
              evidence to the tutor. The “Words and formulas” box now has the formulas worked with these numbers.
            </p>

            <p style={{ marginBottom: '0.25rem' }}>
              <strong>Table 1: how big is Betelgeuse?</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={560}
              rows={[
                ['Angular size across', `${BETELGEUSE.angularDiameterMas} milliarcseconds`, 'Howell and others 2025: 40 ± 1.4 (2020) and 41 ± 1.2 (2024); the mean is used'],
                ['Distance', `${BETELGEUSE.distancePc} parsecs (about 548 light-years)`, `Joyce and others 2020: 168 (+27, −15); the range ${BETELGEUSE.distanceRangePc[0]} to ${BETELGEUSE.distanceRangePc[1]} parsecs is used. NASA’s page says about 700 light-years, so estimates differ`],
                ['Radius', `${result.radiusAU.toFixed(2)} AU = ${Math.round(result.radiusSolarRadii)} solar radii`, 'worked out here: ½ × angle × distance'],
                ['Joyce and others’ own radius', `${BETELGEUSE.joyceRadiusSolarRadii} solar radii (+116, −62)`, 'Joyce and others 2020, for comparison'],
                ['Range of radius the papers allow', `${range.min.toFixed(2)} to ${range.max.toFixed(2)} AU`, 'smallest angle at the smallest distance to largest angle at the largest'],
                ['Planets inside the star (centre at the Sun)', result.planetsInside.join(', '), `Jupiter’s orbit (${PLANETS[4].orbitAU} AU) is outside it, even at the largest radius`],
              ]}
            />

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 2: the companion’s orbit.</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={560}
              rows={[
                ['Separation from the angle', `${COMPANION.separationMas} milliarcseconds = ${result.separationFromAngleAU.toFixed(2)} AU`, 'Howell and others 2025 (angle), worked out here (× distance)'],
                ['Model separation', `${COMPANION.modelSeparationSolarRadii} solar radii = ${result.modelSeparationAU.toFixed(2)} AU = ${result.separationInBetelgeuseRadii.toFixed(2)} Betelgeuse radii`, 'Goldberg and others 2024: 1850 ± 70 solar radii; Dupree and others 2026: 2.3 radii'],
                ['Time for one orbit (Kepler)', `${result.periodYears.toFixed(2)} years = ${Math.round(result.periodDays).toLocaleString('en-US')} days`, `worked out here with Betelgeuse ${BETELGEUSE.massSolar} and the companion ${COMPANION.massSolar} solar masses`],
                ['The long cycle that was observed', `${COMPANION.observedPeriodRangeDays[0].toLocaleString('en-US')} to ${COMPANION.observedPeriodRangeDays[1].toLocaleString('en-US')} days (about 6 years)`, 'about 2,000 (Dupree and others 2026), about 2,100 (the CfA release), 2,170 (Goldberg and others 2024), “about 6 years” (Howell and others 2025)'],
                ['Orbit time against the observed cycle', `within ${Math.ceil(periodAgreementPercent(result.periodDays))} percent of every value quoted`, 'worked out here'],
                ['Companion mass, estimate 1', '1.17 solar masses (M sin i), with an uncertainty of ± 0.7', 'Goldberg and others 2024, from the long cycle and the star’s velocities (M sin i is the mass times the sine of the tilt of the orbit; it is the least the mass can be)'],
                ['Companion mass, estimate 2', `between 1.4 and 2.0, likeliest ${COMPANION.massSolar} solar masses`, 'Howell and others 2025, from a star-model (isochrone) analysis, assuming a 10-million-year age'],
                ['Companion mass, a limit', 'masses above about 1.5 solar masses excluded', 'Goldberg and others 2025, far-ultraviolet Hubble spectra'],
              ]}
            />

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 3: the evidence so far.</strong> Each source’s own words are in quotation marks.
            </p>
            <ResultsTable
              head={['Source', 'What was looked at', 'What was found (the source’s words)', 'Date']}
              minWidth={640}
              rows={[
                ['Goldberg and others', 'Betelgeuse’s long cycle in its brightness and its velocities', 'a companion of about 1.17 solar masses at about 1850 solar radii explains the 2,170-day cycle; the authors discuss “what would be required to confirm” it', 'August 2024'],
                ['Howell and others', 'speckle pictures, 2020 and 2024', '“probable” detection; the spot is about 1.5 sigma', 'July 2025'],
                ['Goldberg and others; O’Grady and others', 'far-ultraviolet and X-ray light from the companion’s place', 'no companion light seen; “exclude masses above ≳1.5 M☉”; an accreting compact object excluded; “likely a low-mass YSO” (a young star)', 'May 2025 (revised September 2025)'],
                ['Dupree and others', 'spectra of Betelgeuse’s atmosphere (the CfA release: Hubble and two ground observatories, nearly eight years)', '“a trailing and expanding wake”, repeating with the cycle; the CfA release calls it “direct evidence”', 'January 2026'],
                ['Matthews and others', 'Betelgeuse’s shape in radio waves (VLA and ALMA)', 'a link between the star’s shape and the orbit, “consistent with” the companion disturbing the atmosphere', 'August 2026'],
              ]}
            />

            <p style={{ margin: '1.5rem 0 0.5rem' }}>
              <strong>The papers behind these results.</strong> Kept until now, so that they did not give away the predictions. Links open in a new tab.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2507.15749">Howell and others, “The probable direct-imaging detection of the stellar companion to Betelgeuse”</ExternalLink>{' '}
                (The Astrophysical Journal Letters, 2025): the speckle pictures. Also <ExternalLink href="https://iopscience.iop.org/article/10.3847/2041-8213/adeaaf">the journal’s page</ExternalLink>.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2408.09089">Goldberg, Joyce and Molnár, “A buddy for Betelgeuse”</ExternalLink> (2024): the long cycle as the sign of a companion.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2505.18375">Goldberg and others, “Betelgeuse, Betelgeuse, Betelgeuse, Betel-buddy?”</ExternalLink> (2025): the Hubble ultraviolet limits.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2505.18376">O’Grady and others, “Betelgeuse’s buddy: X-ray constraints”</ExternalLink> (2025): the X-ray limits.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2601.00470">Dupree and others, “Betelgeuse: detection of the expanding wake of the companion star”</ExternalLink> (2026): the wake.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2608.02847">Matthews and others, “New spatially resolved observations of Betelgeuse from the VLA and ALMA”</ExternalLink> (2026): the radio shape.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2006.09837">Joyce and others, “Standing on the shoulders of giants”</ExternalLink> (The Astrophysical Journal, 2020): Betelgeuse’s distance, radius and mass.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
