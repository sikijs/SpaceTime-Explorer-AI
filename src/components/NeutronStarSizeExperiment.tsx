import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  blackHoleRadiusFraction,
  blackHoleRadiusKm,
  clockWorkedExample,
  EARTH_MASS_SOLAR,
  EARTH_RADIUS_KM,
  giveOrTakeInterval,
  ladderEntries,
  guessCircleRadiusKm,
  guessGravityInEarths,
  logScalePosition,
  predictionOneReal,
  predictionTwoReal,
  NEUTRON_STAR_DATA,
  NEUTRON_STAR_RADIUS_KM,
  rangeCheck,
  ratioRange,
  runCheckUp,
  runNeutronStarSize,
  SUN_RADIUS_KM,
  sugarCubeMillionTonnes,
  sunRadiiOverStarRadius,
  surfaceMinutesPerDistantHour,
} from '../physics/neutronStarSize'
import type { LadderEntry, NeutronStarResult } from '../physics/neutronStarSize'
import type { GravityAnswer, SizeAnswer } from '../physics/neutronStarSize'
import { NeutronStarSizeTutor } from './NeutronStarSizeTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 15 (docs/experiments/frontier-and-beyond/15-how-big-is-a-neutron-star.md).
// The page has an introduction and four parts. The introduction has the question, the new-word list, the assumptions, the "Want to know more?" links, an illustration of a pulsar and
// the collapsed "Words and formulas" panel. Part 1 (predict, then watch) has the two predictions, a five-stage run and three pictures, each with a guide; the learner's guesses are
// drawn on Pictures 1 and 2 beside the real results (the owner's pilot of 2026-10-24), and the real pictures never change. Part 2 (now try it yourself) has two controls, the star's
// radius and weight, which change two drawings of the learner's own sphere. Part 3 (the results) has the reading guide: the status label, the predictions beside the results (guess
// only), the check-up table and three tables each with a note. Part 4 is the tutor (NeutronStarSizeTutor.tsx). There is no table that follows the controls (specification
// decision 8). The timer only paces the display (CLAUDE.md §11). Every number comes from src/physics/neutronStarSize.ts (CLAUDE.md §9). All wording is the owner's to approve
// line by line (CLAUDE.md §28.1) and is written to the standard of §29. Neither a question's text nor a button gives its answer (CLAUDE.md §12).

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const STAR_COLOR = '#c4b5fd' // light violet: the neutron star
const SPOT_COLOR = '#fb923c' // orange: a hot spot, and the X-ray beam from it
const AXIS_COLOR = '#94a3b8' // grey: the spin axis
const TELESCOPE_COLOR = '#34d399' // green: NICER
const PULSE_COLOR = '#fde047' // yellow: the X-ray pulses seen by NICER

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

// A small side-by-side table for the "how to tell them apart" section: the first column names the row, and the other columns are the three kinds of object.
function CompareTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '820px', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
            {head.map((heading) => (
              <th key={heading} style={{ padding: '0.4rem 0.75rem 0.4rem 0' }}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} style={{ borderBottom: '1px solid var(--border-color, #ccc)', verticalAlign: 'top' }}>
              {row.map((cell, i) => (
                <td key={i} style={{ padding: '0.4rem 0.75rem 0.4rem 0', fontWeight: i === 0 ? 'bold' : 'normal' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// The comparison table's content. Every figure is NASA's (the "Types of stars" page and Imagine the Universe's "White dwarfs" and "Neutron stars" pages, read 2026-10-24) or a
// plain rewording of what earlier experiments already say. Draft wording for the owner's approval.
// A black hole of 3 Suns (the module's black-hole radius, 2.95 km for each Sun), the lightest the project's Black Holes Experiment 9 treats as sure to be a black hole.
const BLACK_HOLE_THREE_SUNS_KM = blackHoleRadiusKm(3)
const COMPARE_HEAD = ['', 'Red giant', 'White dwarf', 'Neutron star', 'Black hole']
const COMPARE_ROWS: string[][] = [
  [
    'What it is',
    'A star that is still shining, at a late stage of its life, swollen up and redder than before.',
    'The dead core left behind by a light or medium star, after it has shed its outer layers.',
    'The dead core left behind by a heavy star, after its core has collapsed in a supernova.',
    'What is left when a core is so heavy that nothing can hold it up. NASA: gravity is so strong that “nothing – not even light – can escape”.',
  ],
  [
    'How it forms',
    'The hydrogen in the star’s centre runs short. The centre shrinks and heats up, and the outer layers puff up. Nothing is thrown away yet: the star changes shape and keeps shining.',
    'A light or medium star finishes fusing in its centre. Its outer layers are shed and drift away into space, and the bare core is left.',
    'A heavy star’s core can no longer hold itself up. It collapses in on itself, the outer layers are blown away in a supernova, and neutrons made in the collapse stop the squeeze.',
    'The same start as a neutron star: a very heavy star’s core collapses. But the core is so heavy that nothing known can stop the squeeze (Black Holes Experiment 9), so it falls in until it is inside its own black-hole radius.',
  ],
  [
    'What happened to its outer layers?',
    'They are still there, puffed up to a huge size. Later, NASA says, the dying star “throws out material from its outer layers in intense episodic bursts”.',
    'They have gone: shed into space. What is left is the core, sometimes with a thin skin of gas on top (see the next row).',
    'They have gone: blown away by the supernova (Experiment 13).',
    'In the supernova NASA describes (“massive stars run out of fuel and explode”), the outer layers are blown away.',
  ],
  [
    'Its core and layers',
    'Three parts. A small, hot core that fuses helium into heavier elements such as carbon, nitrogen and oxygen; a shell round the core where hydrogen fuses; and a huge outer layer of gas (NASA).',
    'Mostly carbon and oxygen. NASA: some have “almost pure hydrogen or helium atmospheres”, a thin skin of the lightest gases.',
    'Layered (NASA): a thin atmosphere of hydrogen or helium atoms on a solid crust of heavier atoms; below that, an outer core where the nuclei break into neutrons and protons; and deeper, a sea of mostly neutrons. What the innermost core is like is not known.',
    'Not layers like the others. NASA: the event horizon “isn’t a surface like Earth’s or even the Sun’s. It’s a boundary that contains all the matter that makes up the black hole.”',
  ],
  [
    'Is it still making energy by fusion?',
    'Yes. NASA: “our red giant Sun will still be eating up helium and cranking out carbon.”',
    'No. NASA: it “produces no new heat of its own, so it gradually cools over billions of years.”',
    'No. It is held up by neutrons, not by fusion (Black Holes Experiment 9).',
    'No.',
  ],
  [
    'What holds it up against its own weight?',
    'The pressure of its hot gas.',
    'Electrons pushing back when they are squeezed together (electron degeneracy pressure), up to about 1.4 Suns.',
    'Neutrons pushing back in the same way, up to a limit that is still being worked out.',
    'Nothing known. Above about 3 Suns no known push can hold a core up (Black Holes Experiment 9).',
  ],
  [
    'How big is it?',
    'Huge. NASA says the Sun’s radius, as a red giant, “will become larger than Earth’s orbit”.',
    'About the size of the Earth. NASA: “usually Earth-size but hundreds of thousands of times more massive.”',
    'About 20 kilometres across, “similar in size to Manhattan Island” (NASA).',
    `Tiny for its weight, and set by the weight alone if it is not spinning: a radius of only 2.95 km for each Sun, so about ${BLACK_HOLE_THREE_SUNS_KM.toFixed(1)} km for 3 Suns (Black Holes Experiment 1).`,
  ],
  [
    'Where we meet it in this project',
    'The Sun in about 6 billion years (NASA). Betelgeuse is a red supergiant, the heavy-star version (Experiment 12).',
    'The star that explodes in Experiment 14.',
    'PSR J0437−4715, measured by NICER in this experiment.',
    'The whole Black Holes and Strong Gravity group.',
  ],
]

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

// ---- Illustration: a pulsar, and NICER watching its pulses (not to scale; it shows the idea, not PSR J0437-4715) ----
function PulsarDrawing() {
  const height = 320
  const cy = 150
  // Panel 1: the star at (140, cy). Its two hot spots sit near the top left and the bottom right of its edge, and a beam leaves each one.
  const spots = [
    { x: 140 - 24, y: cy - 24, bx: 140 - 70, by: cy - 70 },
    { x: 140 + 24, y: cy + 24, bx: 140 + 70, by: cy + 70 },
  ]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale, in two panels. Panel 1, a pulsar: a light violet sphere, the neutron star, with a dashed grey line through it for its spin axis, and two orange hot spots on its surface, each with an orange beam of X-rays leaving it. Panel 2, how it is seen: a green box labelled NICER on the International Space Station on the right, an orange beam sweeping towards it from the star on the left, and below them a line with yellow spikes, the X-ray pulses NICER records, one each time the beam sweeps past."
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: a pulsar, and how NICER sees it
      </text>

      {/* Panel 1: a pulsar. */}
      <SvgLines x={140} y={48} lines={['1. A pulsar: a spinning neutron star']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <line x1={140 + 30} y1={cy - 58} x2={140 - 30} y2={cy + 58} stroke={AXIS_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      <SvgLines x={140 + 36} y={cy - 62} lines={['spin axis']} fill={AXIS_COLOR} />
      {spots.map((s, i) => (
        <g key={i}>
          <Arrow x1={s.x} y1={s.y} x2={s.bx} y2={s.by} color={SPOT_COLOR} />
        </g>
      ))}
      <circle cx={140} cy={cy} r={34} fill={STAR_COLOR} stroke={STAR_COLOR} strokeWidth={2} />
      {spots.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={6} fill={SPOT_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      ))}
      <SvgLines x={140} y={cy + 4} lines={['neutron', 'star']} fill="#0b1020" bold anchor="middle" size={9} />
      <SvgLines x={204} y={cy + 24} lines={['hot spot', 'and its beam', 'of X-rays']} fill={SPOT_COLOR} bold />
      <SvgLines x={140} y={cy + 106} lines={['it spins, so the beams sweep round', 'like the light of a lighthouse']} fill={MUTED_COLOR} anchor="middle" />

      {/* Panel 2: how it is seen. */}
      <SvgLines x={410} y={48} lines={['2. How NICER sees it']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={330} cy={cy} r={22} fill={STAR_COLOR} stroke={STAR_COLOR} strokeWidth={2} />
      <circle cx={347} cy={cy - 4} r={5} fill={SPOT_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={330} y={cy + 40} lines={['the pulsar']} fill={STAR_COLOR} bold anchor="middle" />
      <Arrow x1={354} y1={cy - 5} x2={462} y2={cy - 5} color={SPOT_COLOR} />
      <SvgLines x={408} y={cy - 22} lines={['X-ray beam']} fill={SPOT_COLOR} bold anchor="middle" />
      <rect x={466} y={cy - 24} width={64} height={38} rx={5} fill={TELESCOPE_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={498} y={cy - 8} lines={['NICER']} fill="#0b1020" bold anchor="middle" size={11} />
      <SvgLines x={498} y={cy + 34} lines={['on the Space Station']} fill={TELESCOPE_COLOR} bold anchor="middle" />

      {/* The pulses NICER records: one spike each time a beam sweeps past. */}
      <line x1={310} y1={cy + 100} x2={540} y2={cy + 100} stroke={MUTED_COLOR} strokeWidth={1} />
      {[340, 400, 460, 520].map((px) => (
        <polyline key={px} points={`${px - 6},${cy + 100} ${px},${cy + 70} ${px + 6},${cy + 100}`} fill="none" stroke={PULSE_COLOR} strokeWidth={2.5} />
      ))}
      <SvgLines x={425} y={cy + 118} lines={['X-ray pulses recorded:', 'one each time a beam sweeps past']} fill={PULSE_COLOR} bold anchor="middle" />

      <SvgLines x={20} y={height - 8} lines={['Not to scale: the star is tiny compared with the distances, and the beams and spots are only a sketch.']} fill={MUTED_COLOR} />
    </svg>
  )
}

// ---- Illustration: the three roads a star can take (a fork, not a chain). The weights are NASA's rough figures (Types of stars; Imagine the Universe, White dwarfs). ----
const FORK_SWELL_COLOR = '#fb923c' // orange: the swollen late stage
const FORK_STEP_COLOR = '#64748b' // grey: what happens (shedding, or collapse and supernova)
const FORK_WHITE_DWARF_COLOR = '#93c5fd'
const FORK_NEUTRON_STAR_COLOR = '#c4b5fd'
const FORK_BLACK_HOLE_COLOR = '#f87171'
function ForkBox({ x, y, w, h = 40, fill, lines, dark = true }: { x: number; y: number; w: number; h?: number; fill: string; lines: string[]; dark?: boolean }) {
  return (
    <g>
      <rect x={x} y={y - h / 2} width={w} height={h} rx={6} fill={fill} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={x + w / 2} y={y - ((lines.length - 1) * 12) / 2 + 3} lines={lines} fill={dark ? '#0b1020' : TEXT_COLOR} bold anchor="middle" size={10} />
    </g>
  )
}
function ForkDrawing() {
  const height = 366
  const lanes = [
    { y: 105, weight: 'Road 1: a star under about 8 Suns at the start', a: ['red giant'], b: ['outer layers shed;', 'the core is left'], c: ['WHITE DWARF'], cFill: FORK_WHITE_DWARF_COLOR, note: ['ends here:', 'it only fades'] },
    { y: 195, weight: 'Road 2: a star of about 8 to 20 Suns', a: ['red supergiant'], b: ['core collapses:', 'supernova'], c: ['NEUTRON STAR'], cFill: FORK_NEUTRON_STAR_COLOR, note: ['skips the', 'white dwarf'] },
    { y: 285, weight: 'Road 3: a heavier star still', a: ['late stage of a', 'very heavy star'], b: ['core collapses:', 'supernova'], c: ['BLACK HOLE'], cFill: FORK_BLACK_HOLE_COLOR, note: ['skips the', 'neutron star'] },
  ]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Diagram, not to scale: the three roads a star can take, as three rows that all start at the same box on the left, a living star. Road 1, a star under about 8 Suns: red giant, then outer layers shed and the core left, then a white dwarf, where it ends and only fades. Road 2, a star of about 8 to 20 Suns: red supergiant, then the core collapses in a supernova, then a neutron star, skipping the white dwarf. Road 3, a heavier star still: the late stage of a very heavy star, then the core collapses in a supernova, then a black hole, skipping the neutron star."
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Diagram: which road does a star take? (a fork, not a chain)
      </text>
      <ForkBox x={14} y={195} w={96} h={56} fill="#fde68a" lines={['a living', 'star']} />
      {lanes.map((l) => (
        <g key={l.y}>
          <SvgLines x={150} y={l.y - 30} lines={[l.weight]} fill={MUTED_COLOR} bold />
          <Arrow x1={112} y1={195} x2={146} y2={l.y} color={MUTED_COLOR} />
          <ForkBox x={150} y={l.y} w={100} fill={FORK_SWELL_COLOR} lines={l.a} />
          <Arrow x1={252} y1={l.y} x2={286} y2={l.y} color={MUTED_COLOR} />
          <ForkBox x={290} y={l.y} w={100} fill={FORK_STEP_COLOR} lines={l.b} dark={false} />
          <Arrow x1={392} y1={l.y} x2={426} y2={l.y} color={MUTED_COLOR} />
          <ForkBox x={430} y={l.y} w={120} fill={l.cFill} lines={l.c} />
          <SvgLines x={490} y={l.y + 36} lines={l.note} fill={MUTED_COLOR} anchor="middle" size={9} />
        </g>
      ))}
      <SvgLines x={20} y={height - 8} lines={['A sketch, not to scale. The weights are NASA’s rough figures; they are not sharp edges.']} fill={MUTED_COLOR} />
    </svg>
  )
}

const lookForFork: LookFor[] = [
  {
    look: 'the three rows, side by side, all starting from the same box on the left.',
    means: 'a star takes only one of the three roads. Which one depends mainly on how heavy the star was at the start: under about 8 Suns, about 8 to 20 Suns, or heavier.',
    matters: 'a white dwarf, a neutron star and a black hole are not three stages of one star. No star passes through all three, so the picture is a fork, not a ladder.',
  },
  {
    look: 'the coloured box at the right end of each row, and the small note under it.',
    means: 'the top road never has a supernova and ends as a white dwarf. The middle road skips the white dwarf and ends as a neutron star. The bottom road skips the neutron star and ends as a black hole.',
    matters: 'the “missing” stages are real: a heavy star never has a white dwarf stage, and a very heavy star’s core never settles as a neutron star, because nothing known can stop its squeeze.',
  },
  {
    look: 'the grey boxes in the middle of each row.',
    means: 'on the top road the star sheds its outer layers and the core is left. On the other two roads the core collapses and the star explodes in a supernova.',
    matters: 'this is the fork itself. A star that sheds its layers keeps a core held up by electrons. One that collapses can end with a core held up by neutrons, or with nothing to hold it up.',
  },
]

const lookForDrawing: LookFor[] = [
  {
    look: 'panel 1: the light violet sphere, the two orange spots and the orange arrows leaving them.',
    means: 'a neutron star is a very small, very dense sphere. Two hot spots on its surface shine X-rays in narrow beams, and because the star spins, the beams sweep round the sky.',
    matters: 'the beams are what let us see a star that is far too small to make out in a picture: we do not look at its shape, we watch how its light flickers as it turns.',
  },
  {
    look: 'panel 2: the green box labelled NICER, and the yellow spikes below it.',
    means: 'NICER is an X-ray telescope on the International Space Station. Each yellow spike is one pulse: a moment when a beam pointed our way. The star is a steady source of pulses, one per turn.',
    matters: 'the exact shape of each pulse depends on how big the star is, because the star’s gravity bends the light that leaves it. That is how a pulse can tell us a size.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Black hole', meaning: 'what is left when the core of a very heavy star is so heavy that nothing known can hold it up, so that it falls in until gravity at its edge is too strong for anything to escape. NASA: “nothing – not even light – can escape.” (Black Holes Experiments 1 and 9.)' },
  { term: 'Event horizon', meaning: 'the edge of a black hole: the boundary beyond which nothing can come back out. NASA: it “isn’t a surface like Earth’s or even the Sun’s. It’s a boundary that contains all the matter that makes up the black hole.”' },
  { term: 'Degeneracy pressure', meaning: 'the push that electrons, or neutrons, give back when they are squeezed together, because no two of them can be in exactly the same state. Like a theatre where each seat holds one person: crowd them into less room and more of them must take the “far seats”, which means more energy and faster motion, and so a stronger push. It does not need heat. Electron degeneracy pressure holds up a white dwarf, and neutron degeneracy pressure holds up a neutron star.' },
  { term: 'Dead core', meaning: 'the core of a star that has used up its fuel, so that fusion there has stopped and it makes no new energy of its own. It is not gone: it is held up by a different push (electrons in a white dwarf, neutrons in a neutron star) and it slowly cools.' },
  { term: 'Core', meaning: 'the central part of a star, where it is hottest and most squeezed. Fusion happens there. When a star dies, the core is what can be left behind as a white dwarf or a neutron star.' },
  { term: 'Outer layers', meaning: 'the gas that surrounds a star’s core. In a red giant they puff up to a huge size. When a light or medium star dies they are shed into space, and when a heavy star dies they are blown away by a supernova.' },
  { term: 'Crust', meaning: 'a solid skin. NASA describes a neutron star as having “a solid crust of heavier atoms” under a thin atmosphere of hydrogen or helium atoms.' },
  { term: 'Fusion', meaning: 'joining small atoms into bigger ones, which gives off energy. It is what makes a star shine. A star like the Sun spends most of its life joining hydrogen into helium.' },
  { term: 'Red giant', meaning: 'a star that has used up the hydrogen in its centre and has swollen up, with a cooler, redder surface. It is still making energy by fusion. It is a stage in a star’s life, not what is left after it. NASA says the Sun will become one, and that its radius “will become larger than Earth’s orbit”.' },
  { term: 'Red supergiant', meaning: 'the same kind of swelling in a star much heavier than the Sun, which ends up far larger than a red giant. Betelgeuse is one (Experiment 12).' },
  { term: 'White dwarf', meaning: 'the dead core of a light or medium star, left when the star has blown off its outer layers. NASA: “usually Earth-size but hundreds of thousands of times more massive” than the Earth. It makes no new energy, and electrons hold it up (Experiment 14).' },
  { term: 'Neutron star', meaning: 'the very small, very dense sphere left when the core of a massive star collapses (Experiment 13). NASA: “the mass of a sun squished down to the size of a city”, and neutron stars are “formed when a massive star runs out of fuel and collapses”. Neutrons, not electrons, hold it up (Black Holes Experiment 9).' },
  { term: 'Pulsar', meaning: 'a neutron star that gives off a beam of radiation as it spins, so that we see a regular pulse, like a lighthouse. NASA: “Pulsars are rotating neutron stars observed to have pulses of radiation at very regular intervals that typically range from milliseconds to seconds.”' },
  { term: 'Millisecond pulsar', meaning: 'a pulsar that spins so fast that its pulses come only milliseconds apart. (A millisecond is a thousandth of a second.) PSR J0437−4715 is one, and it is the nearest and brightest known.' },
  { term: 'NICER', meaning: 'NASA’s Neutron star Interior Composition Explorer, an X-ray telescope on the International Space Station that studies neutron stars. NASA describes it as “an X-ray telescope that studies neutron stars, black holes, and other phenomena”.' },
  { term: 'The NICER star', meaning: 'the real neutron star PSR J0437−4715, whose size and weight were measured by NASA’s NICER telescope: a radius of 11.36 km and a weight of 1.418 Suns (Choudhury and others, 2024). It is the star drawn in Picture 1. When this page says “the NICER star”, it means this one, and not the imagined stars in the two predictions.' },
  { term: 'Hot spot', meaning: 'a place on a neutron star’s surface, thought to lie near a magnetic pole, that is heated to millions of degrees and shines X-rays. As the star spins, a hot spot comes into view and goes out of view, which makes the pulses NICER records.' },
  { term: 'Radius', meaning: 'the distance from the centre of a sphere to its surface; the width of the sphere is twice that. A neutron star is not quite round when it spins, so NICER measures its equatorial radius, the distance from its centre to its surface along the middle, at right angles to the spin axis.' },
  { term: 'Black-hole radius', meaning: 'the radius a sphere of a given mass would have to be squeezed to in order to be a black hole (Black Holes Experiment 1). It is 2GM ÷ c², about 2.95 kilometres for each solar mass.' },
  { term: 'Compactness', meaning: 'how tightly a sphere’s mass is squeezed, compared with how tight a black hole would be. A black hole has the greatest compactness there can be for a sphere; an ordinary star has a tiny one. (The formula and the numbers come after the run.)' },
  { term: 'Surface gravity', meaning: 'how strongly gravity pulls on something at the surface of a sphere. On the Earth it makes a falling stone speed up by about 10 metres a second every second.' },
  { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “11 ± 1” or, when the uncertainty is bigger on one side than the other, with two numbers. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
  { term: 'Mass gap', meaning: 'a range of masses in which few compact objects (neutron stars or black holes) have been found, or are expected. The LIGO collaboration describes “a lower mass gap … between 3 and 5 solar masses”.' },
  { term: 'Solar mass', meaning: 'a unit for how heavy stars are. One solar mass is the mass of the Sun, so “1.4 solar masses” means 1.4 times as heavy as the Sun.' },
]

// ---- Number formats (display only) ----
const SUPERSCRIPT: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
function sci(x: number): string {
  const exponent = Math.floor(Math.log10(x))
  const mantissa = x / 10 ** exponent
  return `${mantissa.toFixed(1)} × 10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
function thousands(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'How big is a neutron star?', 'Its own black hole', 'How close to a black hole?', 'Where do neutron stars end?', 'What did GW230529 find?']

const BLACK_HOLE_COLOR = '#f87171' // red: a black hole's radius
const ESTIMATE_COLOR = '#fde047' // yellow: a published estimate of the most a neutron star can weigh
const GAP_COLOR = '#94a3b8' // grey: the mass gap
const HEAVY_COLOR = '#fb923c' // orange: GW230529's heavier object
const LIGHT_COLOR = '#34d399' // green: GW230529's lighter object

// ---- Picture 1: the neutron star, drawn to scale, and (from stage 2) the size of a black hole of the same mass ----
const PICTURE_ONE_PX_PER_KM = 10
const YOURS_COLOR = '#ffffff' // white: the learner's own trial value
const QUESTION_STAR_COLOR = '#22d3ee' // cyan: the imagined star of Prediction 1 (the learner's guess about it is white)
function PictureOne({ stage, guess }: { stage: number; guess: SizeAnswer | null }) {
  const r = runNeutronStarSize()
  const j = NEUTRON_STAR_DATA.j0437
  const q = predictionOneReal()
  const height = 372
  const cx = 190
  const cy = 165
  const starPx = r.radiusKm * PICTURE_ONE_PX_PER_KM
  const questionPx = q.radiusKm * PICTURE_ONE_PX_PER_KM
  const holePx = r.blackHoleRadiusKm * PICTURE_ONE_PX_PER_KM
  const barPx = 10 * PICTURE_ONE_PX_PER_KM
  const edgeX = cx + holePx * Math.cos(Math.PI / 4)
  const edgeY = cy + holePx * Math.sin(Math.PI / 4)
  const qEdgeX = cx + questionPx * Math.cos(Math.PI / 3)
  const qEdgeY = cy + questionPx * Math.sin(Math.PI / 3)
  const showQuestionStar = stage >= 2 && guess !== null
  const guessBoxX = cx + starPx + 12
  const guessBoxY = 40
  const guessBoxW = 226
  const guessBoxH = 82
  const guessPx = guess === null ? 0 : guessCircleRadiusKm(guess) * PICTURE_ONE_PX_PER_KM + (guess === 'no' ? 6 : 0)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1, drawn to scale. A light violet disc, the neutron star, with a radius of ${r.radiusKm} kilometres. From stage 2, a smaller dashed red circle at its centre, the radius of a black hole of the same mass, ${r.blackHoleRadiusKm.toFixed(2)} kilometres, with the ratio ${r.ratio.toFixed(2)} written beside it.${showQuestionStar ? ` A cyan dashed circle, the imagined star of Prediction 1, with a radius of ${q.radiusKm} kilometres, drawn at the same centre, with its ratio to its own black-hole radius of ${q.blackHoleRadiusKm.toFixed(2)} kilometres, ${q.ratio.toFixed(2)}, and your guess for it, drawn as a white dashed circle joined by a line to a white box, ${guess === 'yes' ? 'yes, it would be a black hole' : 'no, it would still be bigger than a black hole'}.` : ''} A scale bar under the star is 10 kilometres long.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: a neutron star next to its own black hole (to scale)
      </text>
      <circle cx={cx} cy={cy} r={starPx} fill={STAR_COLOR} fillOpacity={0.9} stroke={STAR_COLOR} strokeWidth={2} />
      <SvgLines x={cx} y={cy - starPx - 8} lines={['the neutron star']} fill={STAR_COLOR} bold anchor="middle" size={11} />
      <line x1={cx} y1={cy} x2={cx + starPx} y2={cy} stroke="#0b1020" strokeWidth={1.5} strokeDasharray="4 3" />
      <SvgLines x={cx + starPx + 8} y={cy - 18} lines={[`radius ${r.radiusKm} km`, `(${(2 * r.radiusKm).toFixed(1)} km across)`]} fill={STAR_COLOR} bold />
      <SvgLines x={cx + starPx + 8} y={cy + 8} lines={[`NICER’s give-or-take:`, `+${j.radiusPlusKm}, −${j.radiusMinusKm} km`]} fill={MUTED_COLOR} />
      {showQuestionStar && (
        // The learner's guess, drawn first so that the red black-hole circle (4.19 km) rides on top of a "yes" guess (4.13 km): a wide white ring with red dashes on it, not a muddle of dots.
        <circle cx={cx} cy={cy} r={guessPx} fill="none" stroke={YOURS_COLOR} strokeWidth={guess === 'yes' ? 8 : 3} strokeDasharray={guess === 'yes' ? undefined : '3 3'} />
      )}
      {stage >= 2 && (
        <g>
          <circle cx={cx} cy={cy} r={holePx} fill="#0b1020" fillOpacity={0.55} stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
          <line x1={edgeX} y1={edgeY} x2={cx + starPx + 8} y2={cy + 52} stroke={BLACK_HOLE_COLOR} strokeWidth={1.5} />
          <SvgLines x={cx + starPx + 12} y={cy + 56} lines={[`a black hole of the same mass:`, `radius only ${r.blackHoleRadiusKm.toFixed(2)} km`]} fill={BLACK_HOLE_COLOR} bold />
          <SvgLines x={cx + starPx + 12} y={cy + 92} lines={[`radius ÷ black-hole radius`, `= ${r.ratio.toFixed(2)}`]} fill={PULSE_COLOR} bold />
        </g>
      )}
      {showQuestionStar && (
        <g>
          <circle cx={cx} cy={cy} r={questionPx} fill={QUESTION_STAR_COLOR} fillOpacity={0.2} stroke={QUESTION_STAR_COLOR} strokeWidth={4} strokeDasharray="8 4" />
          <line x1={cx + guessPx * Math.cos(-Math.PI / 4)} y1={cy + guessPx * Math.sin(-Math.PI / 4)} x2={guessBoxX} y2={guessBoxY + 30} stroke={YOURS_COLOR} strokeWidth={2} />
          <rect x={guessBoxX} y={guessBoxY} width={guessBoxW} height={guessBoxH} rx={6} fill={YOURS_COLOR} stroke={MUTED_COLOR} strokeWidth={2} />
          <text x={guessBoxX + 10} y={guessBoxY + 20} fill="#0b1020" fontSize="13" fontWeight="bold">YOUR GUESS</text>
          <text x={guessBoxX + 10} y={guessBoxY + 38} fill="#0b1020" fontSize="11" fontWeight="bold">for the 6 km star (cyan circle):</text>
          <text x={guessBoxX + 10} y={guessBoxY + 55} fill="#0b1020" fontSize="11" fontWeight="bold">{guess === 'yes' ? 'yes, it would be a black hole' : 'no, still bigger than a black hole'}</text>
          <text x={guessBoxX + 10} y={guessBoxY + 72} fill="#0b1020" fontSize="11" fontWeight="bold">{guess === 'yes' ? '(white circle: black-hole size)' : '(white ring: outside black-hole size)'}</text>
          <line x1={qEdgeX} y1={qEdgeY} x2={cx + starPx + 8} y2={cy + 128} stroke={QUESTION_STAR_COLOR} strokeWidth={1.5} />
          <SvgLines x={cx + starPx + 12} y={cy + 134} lines={['the star in your question (imagined):', `radius ${q.radiusKm} km, squeezed from 12 km`, `${q.radiusKm} ÷ ${q.blackHoleRadiusKm.toFixed(2)} = ${q.ratio.toFixed(2)}`]} fill={QUESTION_STAR_COLOR} bold />
        </g>
      )}
      <line x1={cx - barPx / 2} y1={cy + starPx + 22} x2={cx + barPx / 2} y2={cy + starPx + 22} stroke={TEXT_COLOR} strokeWidth={2.5} />
      <line x1={cx - barPx / 2} y1={cy + starPx + 17} x2={cx - barPx / 2} y2={cy + starPx + 27} stroke={TEXT_COLOR} strokeWidth={2} />
      <line x1={cx + barPx / 2} y1={cy + starPx + 17} x2={cx + barPx / 2} y2={cy + starPx + 27} stroke={TEXT_COLOR} strokeWidth={2} />
      <SvgLines x={cx} y={cy + starPx + 42} lines={['scale bar: 10 km']} fill={TEXT_COLOR} anchor="middle" />
    </svg>
  )
}

// ---- Drawing A (Part 2): the learner's trial sphere, to the scale of Picture 1, with its own black-hole radius and the NICER star as a grey reference ring ----
function TrialStarDrawing({ yours }: { yours: NeutronStarResult }) {
  const j = NEUTRON_STAR_DATA.j0437
  const height = 350
  const cx = 190
  const cy = 168
  const px = PICTURE_ONE_PX_PER_KM
  const refPx = j.radiusKm * px
  const starPx = yours.radiusKm * px
  const holePx = yours.blackHoleRadiusKm * px
  const barPx = 10 * px
  const barY = cy + Math.max(refPx, starPx, holePx) + 22
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Drawing A, drawn to scale. A violet disc with a white outline, your trial sphere, of radius ${yours.radiusKm} kilometres; a dashed red circle, the black-hole radius for ${yours.massSolar} Suns, ${yours.blackHoleRadiusKm.toFixed(2)} kilometres; and a dashed grey ring, the NICER star, ${j.radiusKm} kilometres, for reference. ${yours.insideHorizon ? 'The sphere is inside its own black-hole radius, so it would be a black hole.' : `The sphere is ${yours.ratio.toFixed(2)} times wider than a black hole of its weight.`}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing A: your trial sphere next to its own black hole (to scale)
      </text>
      <circle cx={cx} cy={cy} r={refPx} fill="none" stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      <circle cx={cx} cy={cy} r={starPx} fill={STAR_COLOR} fillOpacity={0.35} stroke={YOURS_COLOR} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={holePx} fill="#0b1020" fillOpacity={0.55} stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
      <SvgLines x={335} y={cy - 78} lines={['your sphere (white outline):', `${yours.massSolar} Suns, radius ${yours.radiusKm} km`]} fill={YOURS_COLOR} bold />
      <SvgLines x={335} y={cy - 40} lines={['its black-hole radius (red):', `${yours.blackHoleRadiusKm.toFixed(2)} km`]} fill={BLACK_HOLE_COLOR} bold />
      <SvgLines
        x={335}
        y={cy - 2}
        lines={yours.insideHorizon ? ['inside its own black-hole', 'radius: it would be a black hole'] : ['radius ÷ black-hole radius', `= ${yours.ratio.toFixed(2)}`]}
        fill={PULSE_COLOR}
        bold
      />
      <SvgLines x={335} y={cy + 36} lines={['grey dashed ring: the NICER', `star, ${j.radiusKm} km, for reference`]} fill={MUTED_COLOR} />
      <line x1={cx - barPx / 2} y1={barY} x2={cx + barPx / 2} y2={barY} stroke={TEXT_COLOR} strokeWidth={2.5} />
      <line x1={cx - barPx / 2} y1={barY - 5} x2={cx - barPx / 2} y2={barY + 5} stroke={TEXT_COLOR} strokeWidth={2} />
      <line x1={cx + barPx / 2} y1={barY - 5} x2={cx + barPx / 2} y2={barY + 5} stroke={TEXT_COLOR} strokeWidth={2} />
      <SvgLines x={cx} y={barY + 20} lines={['scale bar: 10 km']} fill={TEXT_COLOR} anchor="middle" />
    </svg>
  )
}

// ---- Picture 2: how close to a black hole: radius ÷ black-hole radius on a log scale ----
const LADDER_COLORS: Record<LadderEntry['id'], string> = { earth: '#38bdf8', sun: '#fbbf24', 'white-dwarf': '#93c5fd', 'neutron-star': STAR_COLOR, 'black-hole': BLACK_HOLE_COLOR }
const LADDER_DECADES = 9
const PICTURE_TWO_LADDER_HEIGHT = 360
const PICTURE_TWO_GRAVITY_HEIGHT = 290
function PictureTwo({ gravityGuess }: { gravityGuess: GravityAnswer | null }) {
  const entries = ladderEntries()
  const height = PICTURE_TWO_LADDER_HEIGHT + PICTURE_TWO_GRAVITY_HEIGHT
  const x0 = 235
  const pxPerDecade = 290 / LADDER_DECADES
  const top = 62
  const rowH = 46
  const axisY = top + entries.length * rowH + 8
  const ticks = [
    { decade: 0, label: '1' },
    { decade: 3, label: '1,000' },
    { decade: 6, label: '1 million' },
    { decade: 9, label: '1 billion' },
  ]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 2. Five horizontal bars on a scale that grows by a factor of ten at each step, showing how many times wider than its own black-hole radius each object is: the Earth ${sci(entries[0].ratio)}, the Sun ${sci(entries[1].ratio)}, a white dwarf of 1 Sun ${sci(entries[2].ratio)}, the neutron star ${entries[3].ratio.toFixed(2)}, and a black hole 1. Below them, a second logarithmic line from 1 to 1 trillion, showing how many times stronger gravity is on the surface of the star in Prediction 2 than on the Earth: a yellow marker for the real value, ${sci(predictionTwoReal().gravityInEarths)}, calculated here, and, if you guessed, a white marker and box for your guess.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: how close to being a black hole?
      </text>
      <SvgLines x={20} y={42} lines={['radius ÷ black-hole radius (each tick is 1,000 times more)']} fill={MUTED_COLOR} />
      {ticks.map((t) => (
        <g key={t.decade}>
          <line x1={x0 + t.decade * pxPerDecade} y1={top - 6} x2={x0 + t.decade * pxPerDecade} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="2 4" />
          <SvgLines x={x0 + t.decade * pxPerDecade} y={axisY + 16} lines={[t.label]} fill={MUTED_COLOR} anchor="middle" />
        </g>
      ))}
      {entries.map((e, i) => {
        const y = top + i * rowH + rowH / 2
        const len = Math.log10(e.ratio) * pxPerDecade
        const color = LADDER_COLORS[e.id]
        return (
          <g key={e.id}>
            <SvgLines x={20} y={y - 3} lines={[e.label]} fill={color} bold />
            <SvgLines x={20} y={y + 11} lines={[e.id === 'black-hole' ? 'ratio exactly 1' : `ratio ${e.ratio < 100 ? e.ratio.toFixed(2) : sci(e.ratio)}`]} fill={MUTED_COLOR} />
            {e.id === 'black-hole' ? (
              <polygon points={`${x0},${y - 9} ${x0 + 9},${y} ${x0},${y + 9} ${x0 - 9},${y}`} fill={color} stroke="#0b1020" strokeWidth={1.5} />
            ) : (
              <rect x={x0} y={y - 9} width={Math.max(len, 3)} height={18} rx={2} fill={color} />
            )}
          </g>
        )
      })}
      <SvgLines x={20} y={PICTURE_TWO_LADDER_HEIGHT - 8} lines={['Only how many times wider, not an area or a volume. The scale is logarithmic.']} fill={MUTED_COLOR} />
      <GravityPanel guess={gravityGuess} top={PICTURE_TWO_LADDER_HEIGHT} />
    </svg>
  )
}

// ---- Picture 2, second panel: how strong is gravity on the surface? The real value of Prediction 2's star and the learner's guess, on one log scale ----
const GRAVITY_SCALE_POWER = 12
const REAL_VALUE_COLOR = '#fde047' // yellow: the real, calculated value
function GravityPanel({ guess, top }: { guess: GravityAnswer | null; top: number }) {
  const real = predictionTwoReal()
  const x0 = 40
  const width = 480
  const axisY = 170
  const xAt = (value: number) => x0 + width * logScalePosition(value, 0, GRAVITY_SCALE_POWER)
  const ticks = [
    { power: 0, label: '1 (the Earth)' },
    { power: 3, label: '1,000' },
    { power: 6, label: '1 million' },
    { power: 9, label: '1 billion' },
    { power: 12, label: '1 trillion' },
  ]
  const guessValue = guess === null ? null : guessGravityInEarths(guess)
  const guessX = guessValue === null ? 0 : xAt(guessValue)
  const boxW = 210
  const boxX = Math.min(Math.max(guessX - boxW / 2, 20), VIEW_WIDTH - boxW - 20)
  const realX = xAt(real.gravityInEarths)
  const guessLabel = guess === null ? '' : guess
  return (
    <g transform={`translate(0, ${top})`}>
      <line x1={0} y1={0} x2={VIEW_WIDTH} y2={0} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="4 4" />
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Lower half of Picture 2: how strong is gravity on the surface?
      </text>
      <SvgLines x={20} y={40} lines={[`for the star in Prediction 2 (${real.massSolar} Suns, ${real.radiusKm} km radius): times the Earth’s surface gravity`]} fill={MUTED_COLOR} />
      <line x1={x0} y1={axisY} x2={x0 + width} y2={axisY} stroke={TEXT_COLOR} strokeWidth={2} />
      {ticks.map((t) => (
        <g key={t.power}>
          <line x1={xAt(10 ** t.power)} y1={axisY - 6} x2={xAt(10 ** t.power)} y2={axisY + 6} stroke={TEXT_COLOR} strokeWidth={2} />
          <SvgLines x={xAt(10 ** t.power)} y={axisY + 22} lines={[t.label]} fill={MUTED_COLOR} anchor={t.power === 0 ? 'start' : t.power === GRAVITY_SCALE_POWER ? 'end' : 'middle'} />
        </g>
      ))}
      {guess !== null && (
        <g>
          <polygon points={`${guessX - 9},${axisY - 26} ${guessX + 9},${axisY - 26} ${guessX},${axisY - 8}`} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <line x1={guessX} y1={axisY - 26} x2={guessX} y2={axisY - 40} stroke={YOURS_COLOR} strokeWidth={2} />
          <rect x={boxX} y={axisY - 100} width={boxW} height={60} rx={6} fill={YOURS_COLOR} stroke={MUTED_COLOR} strokeWidth={2} />
          <text x={boxX + 10} y={axisY - 80} fill="#0b1020" fontSize="13" fontWeight="bold">YOUR GUESS</text>
          <text x={boxX + 10} y={axisY - 62} fill="#0b1020" fontSize="11" fontWeight="bold">{guessLabel}</text>
          <text x={boxX + 10} y={axisY - 48} fill="#0b1020" fontSize="11" fontWeight="bold">(the white triangle)</text>
        </g>
      )}
      <polygon points={`${realX - 9},${axisY + 58} ${realX + 9},${axisY + 58} ${realX},${axisY + 40}`} fill={REAL_VALUE_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={x0 + width} y={axisY + 76} lines={[`the real value: ${sci(real.gravityInEarths)} times the Earth’s`, 'calculated here from the mass and radius (not measured)']} fill={REAL_VALUE_COLOR} bold anchor="end" />
    </g>
  )
}

// ---- Picture 3: where neutron stars end: only published masses, with no zones ----
const PICTURE_THREE_PX_PER_SUN = 96
const PICTURE_THREE_X0 = 40
function PictureThree({ stage, yoursMass, name = 'Picture 3', title = 'Picture 3: where do neutron stars end? (published masses only)' }: { stage: number; yoursMass: number | null; name?: string; title?: string }) {
  const d = NEUTRON_STAR_DATA
  const height = 360
  const mx = (m: number) => PICTURE_THREE_X0 + m * PICTURE_THREE_PX_PER_SUN
  const axisY = 306
  const [gapLo, gapHi] = d.gapRangeSolar
  const [estLo, estHi] = d.maximumMassEstimateRangeSolar
  const [massLo, massHi] = giveOrTakeInterval(d.j0437.massSolar, d.j0437.massUncertaintySolar, d.j0437.massUncertaintySolar)
  const pLo = d.gw230529Primary.lowSolar
  const pHi = d.gw230529Primary.highSolar
  const sLo = d.gw230529Secondary.lowSolar
  const sHi = d.gw230529Secondary.highSolar
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`${name}. A scale of mass in Suns from 0 to 5. A grey band from ${gapLo} to ${gapHi} Suns is the mass gap. A violet marker at ${d.j0437.massSolar} Suns is the NICER star. A yellow block from ${estLo} to ${estHi} Suns is one team's estimate of the most a neutron star can weigh.${stage >= 5 ? ` From stage 5, an orange bar from ${pLo.toFixed(1)} to ${pHi.toFixed(1)} Suns is the heavier object of the event GW230529, and a green bar from ${sLo.toFixed(1)} to ${sHi.toFixed(1)} Suns is the lighter one.` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        {title}
      </text>
      <rect x={mx(gapLo)} y={52} width={mx(gapHi) - mx(gapLo)} height={axisY - 52} fill={GAP_COLOR} fillOpacity={0.22} />
      <SvgLines x={(mx(gapLo) + mx(gapHi)) / 2} y={68} lines={[`the mass gap (LIGO):`, `${gapLo} to ${gapHi} Suns`]} fill={GAP_COLOR} bold anchor="middle" />
      <line x1={mx(0)} y1={axisY} x2={mx(5)} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4, 5].map((m) => (
        <g key={m}>
          <line x1={mx(m)} y1={axisY - 4} x2={mx(m)} y2={axisY + 4} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <SvgLines x={mx(m)} y={axisY + 18} lines={[String(m)]} fill={MUTED_COLOR} anchor="middle" />
        </g>
      ))}
      <SvgLines x={mx(2.5)} y={axisY + 36} lines={['mass in Suns (1 Sun = the mass of the Sun)']} fill={MUTED_COLOR} anchor="middle" />

      {/* The NICER star. */}
      <SvgLines x={mx(0)} y={96} lines={[`PSR J0437−4715 (NICER): ${d.j0437.massSolar} ± ${d.j0437.massUncertaintySolar} Suns`]} fill={STAR_COLOR} bold />
      <line x1={mx(massLo)} y1={112} x2={mx(massHi)} y2={112} stroke={STAR_COLOR} strokeWidth={3} />
      <circle cx={mx(d.j0437.massSolar)} cy={112} r={6} fill={STAR_COLOR} stroke="#0b1020" strokeWidth={1.5} />

      {/* One team's estimate of the most a neutron star can weigh. */}
      <SvgLines x={mx(0)} y={150} lines={['one team’s 2026 estimate of the most a neutron star', `can weigh: ${estLo} to ${estHi} Suns (it depends on assumptions)`]} fill={ESTIMATE_COLOR} bold />
      <rect x={mx(estLo)} y={176} width={mx(estHi) - mx(estLo)} height={16} fill={ESTIMATE_COLOR} stroke="#0b1020" strokeWidth={1} />

      {stage >= 5 && (
        <g>
          <SvgLines x={mx(0)} y={220} lines={[`GW230529, heavier object: about ${d.gw230529Primary.massSolar} Suns (90% range ${pLo.toFixed(1)} to ${pHi.toFixed(1)})`]} fill={HEAVY_COLOR} bold />
          <rect x={mx(pLo)} y={228} width={mx(pHi) - mx(pLo)} height={12} rx={2} fill={HEAVY_COLOR} fillOpacity={0.55} stroke={HEAVY_COLOR} strokeWidth={1.5} />
          <line x1={mx(d.gw230529Primary.massSolar)} y1={223} x2={mx(d.gw230529Primary.massSolar)} y2={245} stroke={HEAVY_COLOR} strokeWidth={3} />
          <SvgLines x={mx(0)} y={268} lines={[`GW230529, lighter object: 90% range ${sLo.toFixed(1)} to ${sHi.toFixed(1)} Suns`]} fill={LIGHT_COLOR} bold />
          <rect x={mx(sLo)} y={276} width={mx(sHi) - mx(sLo)} height={12} rx={2} fill={LIGHT_COLOR} fillOpacity={0.55} stroke={LIGHT_COLOR} strokeWidth={1.5} />
        </g>
      )}
      {yoursMass !== null && (
        <g>
          <line x1={mx(yoursMass)} y1={56} x2={mx(yoursMass)} y2={axisY} stroke={YOURS_COLOR} strokeWidth={2} strokeDasharray="4 3" />
          <SvgLines x={mx(yoursMass)} y={48} lines={[`your trial mass: ${yoursMass} Suns`]} fill={YOURS_COLOR} bold anchor="middle" />
        </g>
      )}
    </svg>
  )
}

// A labelled part of the page, so that the experiment, the workshop, the results and (later) the tutor are never mistaken for one connected thing. Each part has a step label, a
// title and a short paragraph that says what the learner is about to do and what it is, and is not, connected to.
const PART_ONE_COLOR = '#2563eb'
const PART_TWO_COLOR = '#7c3aed'
const PART_THREE_COLOR = '#0f766e'
const PART_FOUR_COLOR = '#b45309'
function StepHeader({ step, title, accent, lead }: { step: string; title: string; accent: string; lead: ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.08em', textTransform: 'uppercase', color: accent }}>{step}</p>
      <h3 style={{ margin: '0.25rem 0 0.75rem' }}>{title}</h3>
      <div style={{ padding: '0.75rem 1rem', borderLeft: `4px solid ${accent}`, background: 'rgba(100, 116, 139, 0.10)', fontSize: '0.875rem', borderRadius: '0 8px 8px 0' }}>{lead}</div>
    </div>
  )
}
function PageSection({ step, title, accent, lead, children }: { step: string; title: string; accent: string; lead: ReactNode; children: ReactNode }) {
  return (
    <section className="exp-card" style={{ marginTop: '2.5rem', padding: '1.5rem', borderTop: `6px solid ${accent}` }}>
      <StepHeader step={step} title={title} accent={accent} lead={lead} />
      {children}
    </section>
  )
}

function ChoiceButtons({ options, value, onChange, format }: { options: ReadonlyArray<number>; value: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <div>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`toggle-button${value === option ? ' is-selected' : ''}`}
          style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          {format(option)}
        </button>
      ))}
    </div>
  )
}

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const SIZE_CHOICES: ReadonlyArray<{ value: SizeAnswer; label: string }> = [
  { value: 'yes', label: 'Yes, it would be a black hole' },
  { value: 'no', label: 'No, it would still be bigger than a black hole of its mass' },
]
const GRAVITY_CHOICES: ReadonlyArray<{ value: GravityAnswer; label: string }> = [
  { value: 'about 10 times', label: 'About 10 times' },
  { value: 'about a thousand times', label: 'About a thousand times (10³)' },
  { value: 'about 100 billion times', label: 'About 100 billion times (10¹¹)' },
]

interface NeutronStarSizeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function NeutronStarSizeExperiment({ onComplete, onTutorComplete }: NeutronStarSizeExperimentProps) {
  const [sizePrediction, setSizePrediction] = useState<SizeAnswer | null>(null)
  const [gravityPrediction, setGravityPrediction] = useState<GravityAnswer | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  // The controls that appear after the run: the star's radius and weight. They start at NICER's values for PSR J0437-4715.
  const [radiusChoice, setRadiusChoice] = useState<number>(NEUTRON_STAR_DATA.j0437.radiusKm)
  const [massChoice, setMassChoice] = useState<number>(NEUTRON_STAR_DATA.j0437.massSolar)
  const hasRun = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = sizePrediction !== null && gravityPrediction !== null

  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) setStage(stage + 1)
      else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  function startOver() {
    setSizePrediction(null)
    setGravityPrediction(null)
    setStatus('idle')
    setStage(0)
    setRadiusChoice(NEUTRON_STAR_DATA.j0437.radiusKm)
    setMassChoice(NEUTRON_STAR_DATA.j0437.massSolar)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }

  // Every number in the questions comes from the physics module (CLAUDE.md §9).
  const d = NEUTRON_STAR_DATA
  const blackHoleKm = blackHoleRadiusKm(d.predictionMassSolar)
  const result = runNeutronStarSize()
  const j = d.j0437
  const mine = runNeutronStarSize({ massSolar: massChoice, radiusKm: radiusChoice })
  const check = runCheckUp()
  const real2 = predictionTwoReal()
  const q1 = predictionOneReal()
  const p1 = runNeutronStarSize({ massSolar: d.predictionMassSolar, radiusKm: d.predictionSqueezedRadiusKm })
  const p2 = runNeutronStarSize({ massSolar: d.predictionMassSolar, radiusKm: d.predictionGravityRadiusKm })
  const clockEx = clockWorkedExample(result.massSolar, result.radiusKm)
  const [nicerLo, nicerHi] = giveOrTakeInterval(j.radiusKm, j.radiusPlusKm, j.radiusMinusKm)
  const [ratioLow, ratioHigh] = ratioRange(result.massSolar, nicerLo, nicerHi)
  const blackHolePercentOfRadius = blackHoleRadiusFraction(result.massSolar, result.radiusKm) * 100
  const minutesPerHour = surfaceMinutesPerDistantHour(result.massSolar, result.radiusKm)!
  const sizeLabel = SIZE_CHOICES.find((c) => c.value === sizePrediction)?.label.toLowerCase() ?? ''
  const gravityLabel = GRAVITY_CHOICES.find((c) => c.value === gravityPrediction)?.label.toLowerCase() ?? ''
  const formulaEntries: { term: string; meaning: string }[] = [
    { term: 'Black-hole radius, worked', meaning: `r_s = 2GM ÷ c², which is ${blackHoleRadiusKm(1).toFixed(3)} km for each Sun. For ${result.massSolar} Suns: ${blackHoleRadiusKm(1).toFixed(3)} × ${result.massSolar} = ${result.blackHoleRadiusKm.toFixed(2)} km.` },
    { term: 'Compactness, worked', meaning: `compactness = r_s ÷ (2R) = GM ÷ (Rc²). For the NICER star: ${result.blackHoleRadiusKm.toFixed(2)} ÷ (2 × ${result.radiusKm}) = ${result.compactness.toFixed(3)}. A black hole’s compactness is 0.5, so the star is about ${blackHolePercentOfRadius.toFixed(0)} percent of the way there.` },
    { term: 'Surface gravity, worked', meaning: `g = GM ÷ R² (Newton’s value, only a guide at this strength). For the NICER star: ${sci(result.surfaceGravityMS2)} m/s², which is ${sci(result.gravityInEarths)} times the Earth’s 9.81 m/s².` },
    ...(clockEx
      ? [{ term: 'Clock rate, worked', meaning: `rate = √(1 − r_s ÷ R). For the NICER star: r_s ÷ R = ${clockEx.blackHoleOverRadius.toFixed(3)}, so 1 − ${clockEx.blackHoleOverRadius.toFixed(3)} = ${clockEx.oneMinus.toFixed(3)}, and √${clockEx.oneMinus.toFixed(3)} = ${clockEx.rate.toFixed(3)}. In an hour by a distant clock, a clock on the surface counts ${minutesPerHour.toFixed(1)} minutes.` }]
      : []),
  ]
  const ladder = ladderEntries()
  const earthRow = ladder[0]
  const earthHoleMm = blackHoleRadiusKm(EARTH_MASS_SOLAR) * 1e6 // kilometres to millimetres
  const whiteDwarfRow = ladder[2]
  const primaryLo = d.gw230529Primary.lowSolar
  const primaryHi = d.gw230529Primary.highSolar
  const [estimateLo, estimateHi] = d.maximumMassEstimateRangeSolar
  const lookForPictureOne: LookFor[] = [
    {
      look: 'the light violet disc and the scale bar under it.',
      means: `the star’s radius is ${result.radiusKm} km, which makes it ${(2 * result.radiusKm).toFixed(1)} km across, about the size of a city. NICER’s give-or-take is +${d.j0437.radiusPlusKm} and −${d.j0437.radiusMinusKm} km, so the range that covers about two chances in three is ${(result.radiusKm - d.j0437.radiusMinusKm).toFixed(1)} to ${(result.radiusKm + d.j0437.radiusPlusKm).toFixed(1)} km (a 68 percent range).`,
      matters: `this star weighs ${d.j0437.massSolar} Suns yet fits inside a city. The Sun’s radius is ${thousands(SUN_RADIUS_KM)} km, so the Sun is about ${thousands(sunRadiiOverStarRadius(result.radiusKm))} times wider across than this star.`,
    },
    {
      look: 'the dashed red circle at the centre of the star, and the ratio written beside it.',
      means: `a black hole with the same mass as this star would have a radius of only ${result.blackHoleRadiusKm.toFixed(2)} km. The star’s radius is ${result.ratio.toFixed(2)} times that.`,
      matters: 'the star is bigger than a black hole of its mass, so it is not a black hole. But the red circle is not far inside it, and how near ordinary objects come to this size is what Picture 2 compares.',
    },
  ]
  const lookForPictureTwo: LookFor[] = [
    {
      look: 'the bars for the Earth and the Sun, at the top.',
      means: `the Earth’s radius is ${sci(earthRow.ratio)} times its own black-hole radius, and the Sun’s is ${sci(ladder[1].ratio)} times. Ordinary bodies are enormously wider than a black hole of the same mass.`,
      matters: `it shows how extreme it is to squeeze a body down to a black hole’s size: the Earth would have to be squeezed until its radius was only about ${earthHoleMm.toFixed(0)} millimetres, roughly the size of a marble.`,
    },
    {
      look: 'the bar for the white dwarf of 1 Sun.',
      means: `its radius is ${sci(whiteDwarfRow.ratio)} times its black-hole radius. A white dwarf is a dead core that is already about as small as the Earth.`,
      matters: 'even a dead star as dense as a white dwarf is thousands of times wider than a black hole of its own mass.',
    },
    {
      look: 'the neutron star’s bar, almost at the left, and the red diamond for a black hole at 1.',
      means: `the neutron star’s radius is only ${result.ratio.toFixed(2)} times its black-hole radius. That is the shortest bar of the four objects that are not black holes.`,
      matters: 'of these four, the neutron star is the closest to being a black hole, and it still is not one. That is why the question of how heavy one can get before it collapses matters.',
    },
  ]
  const massVersusEstimate = rangeCheck(mine.massSolar, estimateLo, estimateHi)
  const massVersusGap = rangeCheck(mine.massSolar, d.gapRangeSolar[0], d.gapRangeSolar[1])
  const lookForDrawingA: LookFor[] = [
    {
      look: 'the white-outlined disc and the red dashed circle.',
      means: mine.insideHorizon
        ? `the red circle (${mine.blackHoleRadiusKm.toFixed(2)} km) is as big as or bigger than the disc (${mine.radiusKm} km), so the sphere has been squeezed inside its own black-hole radius.`
        : `the disc (${mine.radiusKm} km) is ${mine.ratio.toFixed(2)} times wider than the red circle (${mine.blackHoleRadiusKm.toFixed(2)} km), so the sphere is bigger than a black hole of its weight.`,
      matters: 'a sphere becomes a black hole when it is squeezed until its disc is no wider than the red circle. How near the disc is to the red circle shows how near the sphere is to that.',
    },
    {
      look: 'the red circle, when you change the weight but not the radius.',
      means: `the red circle grows by ${blackHoleRadiusKm(1).toFixed(3)} km for each Sun: it is ${blackHoleRadiusKm(d.massChoicesSolar[0]).toFixed(2)} km for ${d.massChoicesSolar[0]} Suns and ${blackHoleRadiusKm(d.massChoicesSolar[d.massChoicesSolar.length - 1]).toFixed(2)} km for ${d.massChoicesSolar[d.massChoicesSolar.length - 1]} Suns.`,
      matters: 'at the same radius, a heavier sphere is closer to being a black hole, because its black-hole radius is bigger.',
    },
  ]
  const lookForDrawingB: LookFor[] = [
    {
      look: 'the white dashed line, against the yellow block and the grey band.',
      means: `your weight of ${mine.massSolar} Suns is ${massVersusEstimate.verdict === 'inside' ? 'inside' : `${massVersusEstimate.distance.toFixed(2)} Suns ${massVersusEstimate.verdict}`} the estimate of ${estimateLo} to ${estimateHi} Suns, and ${massVersusGap.distance.toFixed(2)} Suns ${massVersusGap.verdict} the mass gap, which starts at ${d.gapRangeSolar[0]} Suns.`,
      matters: 'the yellow block and the grey band are where published results put the edge of what is known. Your line shows which side of them a trial weight falls on, and nothing more: the estimate depends on assumptions.',
    },
  ]
  const lookForPictureThree: LookFor[] = [
    {
      look: 'the violet marker at 1.418 Suns, with its short bar.',
      means: `NICER’s neutron star weighs ${d.j0437.massSolar} Suns, give or take ${d.j0437.massUncertaintySolar}. The bar is so short that you can hardly see it: the mass is known very well.`,
      matters: 'this one star sits well below the heavy end of the scale, so it says nothing about where neutron stars end. That part of the picture comes from the next two items.',
    },
    {
      look: 'the yellow block between 2.2 and 2.3 Suns, and the grey band labelled “the mass gap”.',
      means: `the yellow block is one team’s 2026 estimate of the most a neutron star can weigh, ${estimateLo} to ${estimateHi} Suns, and it depends on assumptions about how matter behaves at such a density. The grey band is the range, ${d.gapRangeSolar[0]} to ${d.gapRangeSolar[1]} Suns, where the LIGO collaboration says few compact objects are expected.`,
      matters: 'both mark the edge of what is known. Above the estimate, neutrons may no longer be able to hold a core up, and in the gap it is not clear what a compact object is.',
    },
    {
      look: 'the orange bar and the green bar, added at stage 5.',
      means: `these are the two objects in the gravitational-wave event GW230529. The heavier is about ${d.gw230529Primary.massSolar} Suns, and its 90 percent range runs from ${primaryLo.toFixed(1)} to ${primaryHi.toFixed(1)}, partly inside the mass gap. The lighter has a 90 percent range of ${d.gw230529Secondary.lowSolar.toFixed(1)} to ${d.gw230529Secondary.highSolar.toFixed(1)} Suns.`,
      matters: 'the picture shows only how heavy they are, not what they are. That is why the collaboration calls the heavier one an “unknown compact object”.',
    },
  ]

  return (
    <div>
      <h2>Experiment 15 — How Big Is a Neutron Star, and Where Do They End? (NICER and GW230529)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): space-telescope measurements of the size of a neutron star agree to about a kilometre, and that is strong evidence. How heavy
            a neutron star can be, and what the heavier object in one 2023 gravitational-wave event is, are still open. What the measurements add up to is shown after you press
            Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> A neutron star is what is left when a massive star explodes: more matter than the Sun squeezed into a sphere about as wide as a city. How
            do we know how big it is, when it is far too small and far away to see as a disc? And how close is it to being a black hole? Recent measurements give a size to within
            about a kilometre, and one gravitational-wave event may have found something just heavier than any neutron star.
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Experiment 13 you saw a massive star’s core collapse and leave a neutron star behind. In Black Holes Experiment 9 you saw that
            neutrons hold such a core up, but only up to a limit, and that a white dwarf (Experiment 14) is held up by electrons instead. In Black Holes Experiment 1 you met the
            black-hole radius: the size a sphere of a given mass would have to shrink to in order to become a black hole. Here you will use all three ideas.
          </p>

          <p style={paragraph}>
            <strong>Red giant, white dwarf, neutron star, black hole: how to tell them apart, and where a star’s story ends.</strong> These four names are easy to mix up, because all
            four belong to the story of a star growing old. The key is that they are not four kinds of star sitting side by side. A <strong>red giant</strong> is a late stage in the
            life of a star that is still shining. A <strong>white dwarf</strong>, a <strong>neutron star</strong> and a <strong>black hole</strong> are what can be left afterwards,
            when a star has stopped making energy by fusion. Which of the three is left depends mainly on how heavy the star was. A black hole is the furthest a star’s story can go,
            and only the heaviest stars end that way. The next paragraph says what “stopped” means, and then the story is told in order.
          </p>
          <p style={paragraph}>
            <strong>What “stopped” means.</strong> A star shines because fusion in its centre makes heat and light. Fusion needs fuel: hydrogen first, and in a red giant helium
            as well. When the fuel in the centre is used up, fusion there stops and the core makes no new energy. This is what is meant by a <strong>dead core</strong>: not that
            the star has vanished, but that it has stopped making its own energy, like a fire that has burnt all its wood.
          </p>
          <p style={paragraph}>
            <strong>Why a dead core does not just fall apart.</strong> Fusion does a second job, too. Its heat makes the gas
            push outwards, and that push holds the star up against its own weight. A star is a balance between gravity pulling in and that push pushing out. When fusion stops, the
            core loses the heat that was holding it up, so gravity squeezes it smaller and denser. It keeps shrinking until something else pushes back that does not need heat. In
            a white dwarf that something is electrons, and in a neutron star it is neutrons. That is why a dead core can sit there for ever without making any energy: it is held up
            by a different kind of push, and it only slowly cools. Think of a hot-air balloon. While the burner runs, the hot air holds the balloon up. Switch the burner off and
            the balloon sinks until it rests on something solid. For a dead core, the “something solid” is the push of electrons or of neutrons. (This is an everyday comparison,
            not a model of a star.) The next three paragraphs explain how electrons and neutrons can push back.
          </p>
          <p style={paragraph}>
            <strong>How can electrons and neutrons push back?</strong> Electrons and neutrons are particles that follow a strict rule of nature: no two of them can be in
            exactly the same state. A particle’s “state” includes where it is and how it is moving, so two electrons cannot be in the same place moving in the same way. Neutrons
            follow the same rule. Physicists state this rule; this project does not work it out. The picture used elsewhere in this project (Black Holes Experiment 9, and
            Experiment 14) is a theatre where every seat holds one person. The best seats, at the front, are the easiest to take. For a particle they are the states with the least
            energy and the slowest motion. Once the front seats are full, the next people have to take seats farther back, and for a particle “farther back” means more energy
            and faster motion.
          </p>
          <p style={paragraph}>
            Now squeeze. Crowding particles into less room is like shrinking the theatre: there are fewer good seats, so more particles have to take the far ones, and they are
            forced to move faster. Particles that move faster hit whatever is around them harder, and that is a push. You know the same thing from a bicycle pump: squeeze the air
            and it pushes back on your thumb. The big difference is where the speed comes from. In the pump, hotter air moves faster and pushes harder. In a dead core the fast
            motion is forced by the crowding rule, not by heat, so the push is still there when the core has cooled. That is why a white dwarf can cool for billions of years
            without falling in.
          </p>
          <p style={paragraph}>
            <strong>A toy example, with made-up numbers</strong> (only to show the idea). Suppose a theatre has a first row of 2 seats and a second row of 4, and six people fill
            it: 2 in row 1 and 4 in row 2. Count each person’s effort as the number of their row: 2 × 1 + 4 × 2 = 10. Now shrink the theatre so that row 1 has 1 seat, row 2 has 2
            and row 3 has 3. The same six people fill three rows, and the effort is 1 × 1 + 2 × 2 + 3 × 3 = 14. The same people in less room take more effort. For particles,
            “more effort” is more energy and faster motion, and so a stronger push. This is why squeezing a core harder makes the push harder, until it matches gravity.
          </p>
          <p style={paragraph}>
            <strong>Electrons first, then neutrons.</strong> In a white dwarf it is the electrons that push back. If the core is heavy enough, gravity squeezes the electrons so
            hard that they are forced to move at close to the speed of light, and nothing can move faster than that, so they cannot push back any harder (this happens near 1.4
            Suns, as Black Holes Experiment 9 states). Squeezed harder still, electrons and protons are pushed together into neutrons. NASA describes the pressure as crushing
            “together protons and electrons to form a sea of mostly neutrons”. Neutrons follow the same rule, so they push back in the same way, and they can hold up a much
            smaller, denser core: a neutron star. Their push has a limit too, which is still being worked out (the limit is the subject of the last part of this experiment). If the core is heavier than neutrons
            can hold up (about 3 Suns or more, as Black Holes Experiment 9 states), nothing known is left to push back. The squeeze goes on, and the core falls in until it is
            inside its own black-hole radius: a black hole.
          </p>
          <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.5rem' }}>
            <li>
              <strong>A living star</strong>, such as the Sun, shines because its centre is hot and squeezed enough to join small atoms into bigger ones. This is called{' '}
              <strong>fusion</strong>, and it gives off energy. For most of its life the star joins hydrogen atoms into helium.
            </li>
            <li>
              <strong>A red giant.</strong> When the hydrogen in the centre runs short, the star swells up, and its surface cools and turns redder. It is still making energy: NASA
              says that “our red giant Sun will still be eating up helium and cranking out carbon.” It is also enormous: NASA says the Sun’s radius “will become larger than
              Earth’s orbit”. A much heavier star swells even more and is called a <strong>red supergiant</strong> (Betelgeuse, in Experiment 12).
            </li>
            <li>
              <strong>A white dwarf</strong>, if the star was light or medium. NASA gives the dividing line as a star with “less than about 8 times the mass of our Sun”. Such a star
              blows its outer layers off into space, and what is left is its bare core. It is not making new energy, so it slowly cools, like the embers of a fire that has no more
              wood.
            </li>
            <li>
              <strong>A neutron star</strong>, if the star was much heavier. NASA’s “Types of stars” page gives about 8 to 20 times the Sun’s mass for the star at the start. Its core
              collapses in a supernova (Experiment 13). NASA says that if what is left is “between about 1 and 3 solar masses”, the neutrons that are made can stop the collapse, and
              the result is a neutron star.
            </li>
            <li>
              <strong>A black hole</strong>, if the star was heavier still. The same page says “heavier stars produce stellar-mass black holes”, and NASA’s page on black holes says
              that “one type of black hole is born when massive stars run out of fuel and explode in supernovae”. Here the core left behind is so heavy that nothing known can stop
              the squeeze (Black Holes Experiment 9). It shrinks until it is inside its own black-hole radius, and from then on, NASA says, “nothing – not even light – can escape”
              from it.
            </li>
          </ol>
          <p style={paragraph}>
            <strong>These steps are not a ladder.</strong> No star climbs from a red giant to a white dwarf, then to a neutron star, then to a black hole. A star takes one road,
            and the next picture shows the three roads.
          </p>
          <div style={{ marginBottom: '0.75rem' }}>
            <ForkDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this diagram.</strong> It is a sketch of the usual roads, not to scale. Each <strong>row</strong> is one road, and all three start at the same{' '}
              <strong>yellow box</strong> on the left, a living star. The words above each row give the star’s weight at the start, in <strong>Suns</strong> (1 Sun is the mass of the
              Sun); these are NASA’s rough figures, not sharp edges. Read each row from left to right, following the grey arrows. The <strong>orange box</strong> is the swollen late
              stage of the star. The <strong>grey box</strong> is what happens next: the star sheds its outer layers, or its core collapses and the star explodes in a{' '}
              <strong>supernova</strong> (the explosion of a dying star, Experiment 13). The <strong>coloured box at the right end</strong> is what is left: light blue for a white
              dwarf, violet for a neutron star and red for a black hole. The small grey note under it says which stage that road skips. The late stage of the very heaviest stars
              varies, and this page does not go into it, so that box is labelled in general words.
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> The Sun weighs 1 Sun, which is under about 8, so it takes Road 1. NASA says it will become a red giant in about 6 billion years, and
              after that it will shed its outer layers and leave a white dwarf. It never reaches the other two boxes. A star of 12 Suns is in the range of about 8 to 20, so it takes
              Road 2, and a star much heavier than 20 Suns takes Road 3.
            </p>
            <p style={paragraph}>
              <strong>The roads can change.</strong> The diagram shows the usual roads. A white dwarf in a close pair that takes gas from its partner can explode as a Type Ia
              supernova (Experiment 14), and then no white dwarf is left at all. Some very heavy stars may collapse without a bright supernova, which Experiment 17 looks at and which
              is still an open question.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForFork} />
          </div>
          <p style={paragraph}>
            <strong>Two different weights.</strong> The weight that decides the route is the weight of the whole star at the start: under about 8 Suns leaves a white dwarf, about 8
            to 20 leaves a neutron star, and heavier stars leave black holes (NASA). The weight of the core that is left is a different number. For a neutron star it is about 1 to 3
            Suns, so the core is much lighter than the star was.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The four side by side.</strong> Read across a row to compare them on one thing.
          </p>
          <CompareTable head={COMPARE_HEAD} rows={COMPARE_ROWS} />
          <p style={paragraph}>
            <strong>Why the two leftovers differ.</strong> The difference starts with how hard the core is squeezed, which depends on how heavy the star was. In a light or medium
            star the squeeze stops when electrons push back, and the core settles as a white dwarf. In a heavy star the squeeze is much stronger, and the electrons give way. NASA
            describes the pressure as crushing “together protons and electrons to form a sea of mostly neutrons”, and it is the neutrons that then push back and hold the star up.
            Think of a pile of books on a springy mattress. A small pile is held up by the springs (the electrons). Add enough weight and the springs flatten completely, and the
            hard floor underneath (the neutrons) has to take the load. Squeeze harder than the neutrons can resist, and there is no floor left: that is a black hole. The red giant is different
            in kind: nothing has collapsed in it. It is a living star in the middle of changing shape.
          </p>
          <p style={paragraph}>
            <strong>Is a black hole the last state of a star?</strong> For the heaviest stars, yes: it is the furthest a star’s story can go. Once a core has fallen inside its
            black-hole radius, NASA says nothing, not even light, can escape from it, so no later stage brings it back out. But it is the end for only some stars. A light or
            medium star ends as a white dwarf, which simply fades, and a star of middle weight ends as a neutron star. The Sun will never become a black hole (Black Holes
            Experiment 9). The word “last” needs one caution: whether even a black hole lasts for ever is a separate question, and Black Holes Experiment 10 asks it.
          </p>
          <p style={paragraph}>
            <strong>A quick test.</strong> Ask three questions. First: is it still shining by fusion? If it is, and it is huge and red, it is a red giant. If not, it is a dead
            core. Second: how big is it? A dead core about as wide as the Earth is a white dwarf. A dead core about as wide as a city is a neutron star. Third: is it so dense that
            not even light can escape from it? Then it is a black hole.
          </p>
          <p style={paragraph}>
            <strong>Where the lines are blurred.</strong> Three things make these hard to keep apart, and it helps to know them. First, the dividing lines are rough. NASA’s
            “about 8 Suns” and “about 1 to 3 Suns” are approximate figures, not sharp edges. Second, weight alone does not tell a white dwarf from a neutron star. A white dwarf can
            weigh up to about 1.4 Suns, and the neutron star that NICER measured weighs about 1.4 Suns too. What tells them apart is their size, how they formed, what they are made of and what holds them up: electrons in
            a white dwarf, neutrons in a neutron star. Also, “dwarf” is about size, not weight: NASA says a white dwarf is “usually Earth-size but hundreds of thousands of times more
            massive” than the Earth. Third, and least certain of all, is the line between a neutron star and a black hole: how heavy a neutron star can be before nothing can hold it
            up is still being worked out (Picture 3 looks at this).
          </p>
          <p style={paragraph}>
            <strong>A short calculation.</strong> A white dwarf is about as wide as the Earth, which is about 12,700 kilometres. A neutron star is about 20 kilometres across.
            12,700 ÷ 20 is about 640, so a neutron star is some 600 times narrower than a white dwarf, even though NASA says it holds more than the Sun’s mass, where a typical white
            dwarf holds about half the Sun’s. The weight is squeezed into a far smaller sphere. For comparison, a black hole of 3 Suns would have a radius of only about {BLACK_HOLE_THREE_SUNS_KM.toFixed(1)} km (2.95
            km for each Sun), so about {(2 * BLACK_HOLE_THREE_SUNS_KM).toFixed(0)} km across, a little narrower still than a neutron star, though much heavier.
          </p>

          <p style={paragraph}>
            <strong>What a neutron star is.</strong> NASA describes a neutron star as “the mass of a sun squished down to the size of a city”: about 20 kilometres across, “similar
            in size to Manhattan Island”. It is so dense that, in NASA’s words, “one sugar cube of neutron star material would weigh about 1 trillion kilograms … about as much as
            a mountain”. It forms when the core of a massive star collapses and the neutrons that are made can stop the collapse. The rest of the star is blown away.
          </p>

          <p style={paragraph}>
            <strong>How its size is measured.</strong> A neutron star is far too small to see as a disc, even in the best telescope. But some neutron stars are pulsars. A pulsar
            has hot spots on its surface that shine in narrow beams, and as it spins, the beams sweep round the sky like the light of a lighthouse. A telescope that sees a beam
            sweep past records a short pulse. NICER, an X-ray telescope on the International Space Station, records these pulses very precisely. NASA explains that the shape of the
            pulse depends on where the hot spots are and on the star’s strong gravity, which bends the light, so that, once both are allowed for, the pulse can be used to work out
            the star’s radius. The illustration below shows the idea.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <PulsarDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It shows how a spinning neutron star makes pulses, and how a telescope sees them. It is a sketch of a pulsar in
              general, not of the particular one NICER measured, and it is not to scale.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The two panels</strong> show two things: 1, a pulsar, which is a spinning neutron star with beams; 2, a telescope seeing its pulses.
              </li>
              <li>
                <strong>The light violet sphere</strong> is the neutron star. <strong>The dashed grey line</strong> is its spin axis, the line it turns round.
              </li>
              <li>
                <strong>The orange dots and arrows</strong> are the hot spots and the beams of X-rays leaving them. A longer arrow would mean nothing here: the arrows only show the
                direction of the beams.
              </li>
              <li>
                <strong>The green box</strong> is NICER, on the International Space Station. <strong>The orange arrow</strong> between the pulsar and NICER is a beam that
                happens to point at it.
              </li>
              <li>
                <strong>The yellow spikes</strong> in the lower right are the pulses NICER records, one each time a beam sweeps across our line of sight. The gaps between spikes
                are the time the star takes to turn once.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with a lighthouse.</strong> Stand on a dark shore and watch a lighthouse. The lamp inside shines all the time, but you see a bright flash
              only when its beam points at you, say once every 10 seconds. From the flashes alone you can tell how fast the lamp turns, even though you cannot see the lamp itself.
              A pulsar works the same way. Its beams sweep past us once each turn, and a millisecond pulsar turns so fast that its flashes come only a few milliseconds apart
              (a millisecond is a thousandth of a second).
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForDrawing} />
          </div>

          <p style={paragraph}>
            <strong>What was found.</strong> In 2024 a team using NICER measured a millisecond pulsar called PSR J0437−4715, the nearest and brightest known, and gave a radius of
            about 11 kilometres, with a give-or-take of about one kilometre. A September 2026 analysis of another pulsar, PSR J0614−3329, gives a range that overlaps it. At the
            heavy end, one team’s 2026 estimate puts the most a neutron star can weigh at about 2.2 to 2.3 times the Sun, though that depends on assumptions about how matter behaves
            at such a density. And in 2023 the gravitational-wave event GW230529 was the merger of a neutron star with an object of about 3.6 Suns, in the range, called the mass
            gap, where it is not clear whether such an object is a neutron star or a black hole.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> That a neutron star of about 1.4 Suns is about 11 to 12 kilometres in radius, to within about a kilometre, is
            strong evidence. How heavy a neutron star can be, and what GW230529’s heavier object is, are open. What the measurements add up to is shown after the run, with each
            number’s source.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Core</strong>, <strong>dead core</strong>, <strong>outer layers</strong> and <strong>crust</strong>: the centre of a star, a centre that has stopped
                making energy, the gas around it, and a solid skin.
              </li>
              <li>
                <strong>Black hole</strong> and <strong>event horizon</strong>: what is left when a core is too heavy for anything to hold up, and its edge.
              </li>
              <li>
                <strong>Degeneracy pressure</strong>: the push that electrons or neutrons give back when they are squeezed together.
              </li>
              <li>
                <strong>Fusion</strong>, <strong>red giant</strong>, <strong>red supergiant</strong> and <strong>white dwarf</strong>: what makes a star shine, the swollen late
                stage, its heavy-star version, and the dead core of a light or medium star.
              </li>
              <li>
                <strong>Neutron star</strong>, <strong>pulsar</strong> and <strong>millisecond pulsar</strong>: the dense sphere, a neutron star that gives pulses, and one that
                spins very fast.
              </li>
              <li>
                <strong>NICER</strong> and <strong>hot spot</strong>: the X-ray telescope, and the place on the star that its pulses come from.
              </li>
              <li>
                <strong>Radius</strong>, <strong>black-hole radius</strong> and <strong>compactness</strong>: how big the star is, how big a black hole of the same weight would be,
                and how tightly the weight is squeezed.
              </li>
              <li>
                <strong>Surface gravity</strong> and <strong>give-or-take</strong>: how hard gravity pulls at the surface, and the uncertainty of a measurement.
              </li>
              <li>
                <strong>Mass gap</strong> and <strong>solar mass</strong>: the range of weights where few such objects are found, and the unit for star weights.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values for the
            star’s radius and weight. Nothing here is graded. Your predictions are your own guesses, made before you see anything.{' '}
            They never change the real pictures or the tables, which come from the physics and the published numbers. Your guesses are drawn on top of the real pictures, in white, so
            you can compare each guess with the real result. They are shown again beside the results too. The page has three parts: first you predict and watch the pictures, then, in a part of its own called “Now
            try it yourself”, you can choose a radius and a weight for an imaginary sphere and watch two drawings of your own follow your choices, and last come the results. {' '}
            The real pictures and the results tables never change. Your white guess marks appear on Pictures 1 and 2, and the two drawings in “Now try it yourself” follow your choices.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It treats a neutron star as a smooth sphere that is not spinning, and it takes the star’s radius as a
            number that is given, not worked out from what the matter inside is made of. It uses the black-hole radius of Black Holes Experiment 1 and the clock slowing of Black
            Holes Experiment 2. It does not simulate how NICER makes its measurement, does not work out the most a neutron star can weigh, and does not decide what the heavier
            object in GW230529 is.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the
            numbers are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/stars/types/">NASA: Types of stars</ExternalLink>: red giants, white dwarfs and neutron stars described side by
              side, and which stars leave which.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA: Black holes</ExternalLink>: what a black hole is, how one forms from a massive star, and what
              the event horizon is.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/exoplanets/resources/life-and-death/chapter-6/">NASA: Aging into gianthood</ExternalLink>: what a red giant is made of, with
              its core, its fusing shell and its puffed-up outer layer.
            </li>
            <li>
              <ExternalLink href="https://svs.gsfc.nasa.gov/13832">NASA: NICER tests matter’s limits</ExternalLink>: the layers inside a neutron star, and what is still not known
              about its centre.
            </li>
            <li>
              <ExternalLink href="https://chandra.harvard.edu/xray_sources/white_dwarfs.html">NASA’s Chandra X-ray Observatory: White dwarfs</ExternalLink>: how a star like the Sun swells
              into a red giant and leaves a white dwarf.
            </li>
            <li>
              <ExternalLink href="https://chandra.harvard.edu/xray_sources/neutron_stars.html">NASA’s Chandra X-ray Observatory: Neutron stars</ExternalLink>: how a neutron star
              forms when the centre of a massive star collapses, and why a spinning one gives regular pulses, like a rotating lighthouse beam.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/nicer/">NASA: NICER</ExternalLink>: what the X-ray telescope on the Space Station is, and what it has found
              about neutron stars.
            </li>
            <li>
              <ExternalLink href="https://ligo.org/science-summaries/GW230529/">LIGO: GW230529, the merger of a neutron star and an unknown compact object</ExternalLink>: the
              2023 event and the mass gap, in the collaboration’s own words.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={done ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${PART_ONE_COLOR}` }}>
          <StepHeader
            step="Part 1"
            title="Predict, then watch"
            accent={PART_ONE_COLOR}
            lead={
              <>
                <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions, press Run, and watch three pictures build up one stage at a
                time. The pictures show fixed things: the real neutron star that NASA’s NICER X-ray telescope measured, other objects it is compared with (the Earth, the Sun and a white dwarf), and the
                masses scientists have published for neutron stars. They are the same for everyone. When the run reaches stage 2, your guesses are drawn on them in white, so you can see how each guess compares with the real result. The real
                pictures stay the same whatever you guess.
              </>
            }
          />
        </div>

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        {(
          [
            {
              title: 'Prediction 1: would it become a black hole?',
              text: (
                <>
                  A neutron star has about {d.predictionMassSolar} times the Sun’s mass and a radius of about {NEUTRON_STAR_RADIUS_KM} km. A black hole of {d.predictionMassSolar} Suns has a radius of
                  about {blackHoleKm.toFixed(1)} km. If this star were squeezed to a radius of {d.predictionSqueezedRadiusKm} km, would it be a black hole?
                </>
              ),
              choices: SIZE_CHOICES,
              value: sizePrediction,
              set: (v: SizeAnswer) => setSizePrediction(v),
            },
            {
              title: 'Prediction 2: how strong is gravity on its surface?',
              text: (
                <>
                  On the Earth’s surface, gravity makes things fall faster by about 10 metres per second every second. On the surface of a neutron star of {d.predictionMassSolar} Suns and{' '}
                  {d.predictionGravityRadiusKm} km radius, about how many times stronger is gravity?
                </>
              ),
              choices: GRAVITY_CHOICES,
              value: gravityPrediction,
              set: (v: GravityAnswer) => setGravityPrediction(v),
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
              {status === 'complete' && <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 && 'Picture 1 shows the NICER star, drawn to scale.'}
            {stage === 2 && 'A dashed red circle is added to Picture 1: the size a black hole of the same mass would have.'}
            {stage === 3 && 'Picture 2 appears below Picture 1. It compares how close five objects are to being a black hole.'}
            {stage === 4 && 'Picture 3 appears below Picture 2. It is a scale of mass, with the published masses marked on it.'}
            {stage === 5 && 'The two objects of the gravitational-wave event GW230529 are added to Picture 3.'}
          </p>
        )}

        {/* Picture 1 (stage 1 on; the black-hole circle from stage 2). */}
        {hasRun && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureOne stage={stage} guess={sizePrediction} />
          </div>
        )}
        {hasRun && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>Where the real picture comes from.</strong> The <strong>violet star</strong>, which this page calls <strong>“the NICER star”</strong>, its radius ({j.radiusKm} km, give or take +{j.radiusPlusKm} and −{j.radiusMinusKm}) and its
              mass ({j.massSolar} Suns, give or take {j.massUncertaintySolar}) were <strong>measured</strong> for the real star PSR J0437−4715 by NASA’s NICER X-ray telescope (Choudhury and
              others, 2024; see the links under “Want to know more?”).
              {stage >= 2 && (
                <>
                  {' '}
                  The <strong>red black-hole circle is calculated here</strong>, not measured: it is the size a black hole of the same mass would have. The <strong>cyan dashed circle is not a real
                  star</strong>. It is the imagined star from Prediction 1, squeezed to {NEUTRON_STAR_DATA.predictionSqueezedRadiusKm} km, and its black-hole radius is also calculated.
                </>
              )}
            </p>
            <p style={paragraph}>
              <strong>How to read Picture 1.</strong> It shows the NICER star (PSR J0437−4715), <strong>drawn to scale</strong>: every {PICTURE_ONE_PX_PER_KM} pixels across is 1
              kilometre (km). The <strong>light violet disc</strong> is the star, and the <strong>dashed line</strong> from its centre to its edge is its <strong>radius</strong>, the
              distance from the centre to the surface. The <strong>white bar</strong> at the bottom is a scale bar 10 km long, so you can compare the star with a distance you know.
              {stage >= 2 && (
                <>
                  {' '}
                  The <strong>dashed red circle</strong> (stage 2) is the <strong>black-hole radius</strong> for the same mass: the radius a sphere of {result.massSolar} Suns would have if it were squeezed until it
                  became a black hole (Black Holes Experiment 1). The <strong>yellow numbers</strong> beside it are the star’s radius divided by that black-hole radius. The <strong>cyan dashed circle</strong> is
                  the imagined star of Prediction 1, drawn to the same scale and at the same centre, with the same sum written beside it, and the <strong>white box</strong> at the top right repeats your guess. Your guess is drawn as a <strong>white dashed circle</strong>, joined to that box by a line: if you guessed “yes”, it is at the black-hole size ({q1.blackHoleRadiusKm.toFixed(2)} km), the biggest the star could be and still be a black hole; if you guessed “no”, it is a ring just outside the {q1.radiusKm} km circle, outside the black-hole size. A “no” has no size of its own, so that ring only marks where you think the star lies.
                  Nothing here says whether the guess was right.
                </>
              )}
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> The star’s radius is {result.radiusKm} km, so it is {(2 * result.radiusKm).toFixed(1)} km across.
              {stage >= 2 && (
                <>
                  {' '}
                  A black hole of {result.massSolar} Suns has a radius of {result.blackHoleRadiusKm.toFixed(2)} km (2.95 km for each Sun, times {result.massSolar}). So {result.radiusKm} ÷ {result.blackHoleRadiusKm.toFixed(2)} ={' '}
                  {result.ratio.toFixed(2)}: the star is a little under three times wider than a black hole of its mass would be.
                </>
              )}{' '}
              For size, the Sun’s radius is {thousands(SUN_RADIUS_KM)} km, and {thousands(SUN_RADIUS_KM)} ÷ {result.radiusKm} = about {thousands(sunRadiiOverStarRadius(result.radiusKm))}.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureOne.slice(0, stage >= 2 ? 2 : 1)} />
          </div>
        )}

        {/* Picture 2 (stage 3 on). */}
        {stage >= 3 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureTwo gravityGuess={gravityPrediction} />
          </div>
        )}
        {stage >= 3 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 2.</strong> Each of the four <strong>coloured bars</strong> is one object, and its length says how many times wider the object is than a black hole of its own
              mass would be (its radius ÷ its black-hole radius). A ratio of 1 would mean the object is exactly as small as a black hole. The scale is <strong>logarithmic</strong>:
              each of the dotted ticks (1, 1,000, 1 million, 1 billion) is 1,000 times more than the one before, so a short bar can hide a huge difference. The <strong>red diamond</strong> is a
              black hole itself, at exactly 1. The objects are the Earth, the Sun, a white dwarf of 1 Sun (its size from Black Holes Experiment 9), the neutron star from Picture 1,
              and the black hole.
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> The Earth’s radius is {thousands(EARTH_RADIUS_KM)} km. A black hole with the Earth’s mass would have a radius of only about {earthHoleMm.toFixed(1)} millimetres. {thousands(EARTH_RADIUS_KM)} km is{' '}
              {thousands(EARTH_RADIUS_KM * 1e6)} millimetres, and {thousands(EARTH_RADIUS_KM * 1e6)} ÷ {earthHoleMm.toFixed(1)} = about {sci(earthRow.ratio)}. For the neutron star the same sum is {result.radiusKm} ÷ {result.blackHoleRadiusKm.toFixed(2)} ={' '}
              {result.ratio.toFixed(2)}.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureTwo} />
            <p style={paragraph}>
              <strong>The lower half of Picture 2: how strong is gravity on the surface?</strong> The line is on a <strong>logarithmic scale</strong> like the one above: each tick is 1,000 times more than the one
              before, and <strong>1</strong> is the gravity at the Earth’s surface. The <strong>yellow triangle</strong> below the line is the real value for the star in Prediction 2 ({real2.massSolar} Suns,{' '}
              {real2.radiusKm} km radius): about {sci(real2.gravityInEarths)} times the Earth’s. The <strong>white triangle and box</strong> above the line repeat your guess. Nothing here says whether
              the guess was right.
            </p>
            <p style={paragraph}>
              <strong>Where the real value comes from.</strong> It is <strong>calculated here</strong>, not measured: g = GM ÷ R² (Newton’s value, only a guide at this strength) for an{' '}
              <strong>imagined star</strong> of {real2.massSolar} Suns and {real2.radiusKm} km radius, divided by the Earth’s 9.81 m/s². No measurement of the surface gravity of a real neutron
              star was read for this page.
            </p>
          </div>
        )}

        {/* Picture 3 (stage 4 on; GW230529 from stage 5). */}
        {stage >= 4 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureThree stage={stage} yoursMass={null} />
          </div>
        )}
        {stage >= 4 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 3.</strong> Along the bottom is a scale of <strong>mass in Suns</strong> (1 Sun is the mass of the Sun), from 0 to 5, with {PICTURE_THREE_PX_PER_SUN} pixels for each Sun. The{' '}
              <strong>violet marker and short bar</strong> is the NICER star. The <strong>yellow block</strong> is one team’s 2026 estimate of the most a neutron star can weigh. The{' '}
              <strong>grey band</strong> is the <strong>mass gap</strong>, the range of masses where the LIGO collaboration says few compact objects are expected. Nothing here is a
              zone that says what an object <em>is</em>: the picture only marks published masses.
              {stage >= 5 && (
                <>
                  {' '}
                  The <strong>orange bar</strong> and the <strong>green bar</strong> (stage 5) are the two objects in GW230529. Each bar is a <strong>90 percent range</strong> from the paper: there is a 90 percent chance that the
                  true mass lies somewhere along it. The thick line inside the orange bar marks the heavier object’s most likely value; the green bar shows a range only. A longer bar means
                  less is known.
                </>
              )}
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> NICER’s mass, {d.j0437.massSolar} ± {d.j0437.massUncertaintySolar}, means the star weighs between {(d.j0437.massSolar - d.j0437.massUncertaintySolar).toFixed(3)} and{' '}
              {(d.j0437.massSolar + d.j0437.massUncertaintySolar).toFixed(3)} Suns.
              {stage >= 5 && (
                <>
                  {' '}
                  GW230529’s heavier object is “about {d.gw230529Primary.massSolar}”, and the paper gives its mass at the 90 percent level as {primaryLo.toFixed(1)} to {primaryHi.toFixed(1)} Suns. That range is{' '}
                  {primaryHi.toFixed(1)} − {primaryLo.toFixed(1)} = {(primaryHi - primaryLo).toFixed(1)} Suns wide.
                </>
              )}
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureThree.slice(0, stage >= 5 ? 3 : 2)} />
          </div>
        )}

      </div>

        {/* Part 2, a section of its own (after the run): the learner's trial sphere. Its two drawings follow the controls; nothing in Part 1 does. There is no table that follows the controls
            (specification decision 8). */}
        {done && (
          <PageSection
            step="Part 2"
            title="Now try it yourself"
            accent={PART_TWO_COLOR}
            lead={
              <>
                <strong>What we are about to do.</strong> The experiment above is finished, and its pictures are fixed. This part is separate from it: a small workshop where you choose a radius and a
                weight for an imaginary sphere, and two drawings of your own follow your choices. It has no connection to your predictions (they were guesses about the two stars in the
                questions, and your guess marks do not appear here), and it does not change the pictures above or the results below. The one thing to explore is how a sphere’s size and weight decide
                how close it is to being a black hole.
              </>
            }
          >
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>Your guesses from Part 1 have no effect here.</strong> They do not change these drawings or the results tables. Only the two settings below change the drawings.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>These are your own trial numbers, not real measurements.</strong> For example, you could choose a radius of 6 km and a weight of 2 Suns, and the drawings will show what
              that sphere would look like next to its own black hole. That does not mean a real neutron star is like that.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>One thing to know.</strong> Here you pick the radius and the weight separately, so you can mix any pair. In real stars the two are linked: a star’s weight helps decide how
              wide it is. This experiment does not model that link, so a pair you pick may not be one that a real star could have.
            </p>
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How wide is the sphere? (radius, km) It changes the white-outlined disc in Drawing A.</p>
            <ChoiceButtons
              options={d.radiusChoicesKm}
              value={radiusChoice}
              onChange={setRadiusChoice}
              format={(v) => `${v} km${v === j.radiusKm ? ' (NICER’s value for J0437)' : v === d.j0614RadiusRangeKm[1] ? ' (the top of J0614’s range)' : ''}`}
            />
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How heavy is the sphere? (Suns) It changes the red circle in Drawing A and the white line in Drawing B.</p>
            <ChoiceButtons options={d.massChoicesSolar} value={massChoice} onChange={setMassChoice} format={(v) => `${v} Suns${v === j.massSolar ? ' (J0437)' : ''}`} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: 0 }}>
              {mine.insideHorizon
                ? `A sphere of ${mine.massSolar} Suns squeezed to a radius of ${mine.radiusKm} km would be inside its own black-hole radius of ${mine.blackHoleRadiusKm.toFixed(2)} km. It would be a black hole, with no surface where a clock could sit. These are trial values.`
                : `A sphere of ${mine.massSolar} Suns and a radius of ${mine.radiusKm} km has a black-hole radius of ${mine.blackHoleRadiusKm.toFixed(2)} km, so it is ${mine.ratio.toFixed(2)} times wider than a black hole of its mass. Gravity at its surface would be ${sci(mine.gravityInEarths)} times the Earth’s (Newton’s value, only a guide), and a clock there would tick at ${mine.clockRate!.toFixed(3)} of the rate of a distant clock, ${mine.clockSlowerPercent!.toFixed(1)} percent slower. These are trial values, not measurements.`}
            </p>

            <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              <TrialStarDrawing yours={mine} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>How to read Drawing A.</strong> It is drawn to the same scale as Picture 1 (every {PICTURE_ONE_PX_PER_KM} pixels is 1 kilometre), but it shows your sphere and not NICER’s star. The{' '}
                <strong>violet disc with a white outline</strong> is a sphere with the radius you chose. The <strong>red dashed circle</strong> is the black-hole radius for the weight you
                chose, which is {blackHoleRadiusKm(1).toFixed(3)} km for each Sun. The <strong>grey dashed ring</strong> is the NICER star’s radius, {j.radiusKm} km, kept for reference. The <strong>white bar</strong> is 10 km long. The{' '}
                <strong>yellow numbers</strong> are your sphere’s radius divided by its black-hole radius.
              </p>
              <p style={paragraph}>
                <strong>A worked moment.</strong> With {mine.massSolar} Suns, the black-hole radius is {blackHoleRadiusKm(1).toFixed(3)} × {mine.massSolar} = {mine.blackHoleRadiusKm.toFixed(2)} km. Your sphere’s radius is {mine.radiusKm} km, so {mine.radiusKm} ÷{' '}
                {mine.blackHoleRadiusKm.toFixed(2)} = {mine.ratio.toFixed(2)}
                {mine.insideHorizon ? ', which is 1 or less, so this sphere would be a black hole.' : ', which is more than 1, so this sphere would not be a black hole.'}
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList items={lookForDrawingA} />
            </div>

            <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              <PictureThree stage={4} yoursMass={mine.massSolar} name="Drawing B" title="Drawing B: your trial weight on the mass scale" />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={paragraph}>
                <strong>How to read Drawing B.</strong> It is the mass scale of Picture 3, from 0 to 5 Suns, without GW230529. The <strong>white dashed line</strong> is the weight you chose. The other marks are the
                published ones from Picture 3, kept here for reference: the <strong>violet marker</strong> is the NICER star, the <strong>yellow block</strong> is one team’s 2026 estimate of the most a neutron star
                can weigh, and the <strong>grey band</strong> is the mass gap.
              </p>
              <p style={paragraph}>
                <strong>A worked moment.</strong> Your weight is {mine.massSolar} Suns. The estimate runs from {estimateLo} to {estimateHi} Suns, so your weight is{' '}
                {massVersusEstimate.verdict === 'inside'
                  ? 'inside it'
                  : `${massVersusEstimate.distance.toFixed(2)} Suns ${massVersusEstimate.verdict} the ${massVersusEstimate.verdict === 'below' ? 'bottom' : 'top'} of it`}
                . The mass gap starts at {d.gapRangeSolar[0]} Suns, so your weight is {massVersusGap.distance.toFixed(2)} Suns {massVersusGap.verdict} it.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList items={lookForDrawingB} />
            </div>
          </PageSection>
        )}

        {/* Part 3, a section of its own (after the run): the results. Its numbers are fixed: they do not follow the predictions or Part 2's settings. */}
        {done && (
          <PageSection
            step="Part 3"
            title="The results"
            accent={PART_THREE_COLOR}
            lead={
              <>
                <strong>What we are about to do.</strong> In Part 1 you made two predictions at the start: Prediction 1 (would the 6 km star be a black hole?) and Prediction 2 (how strong is
                gravity on the surface of the 1.4-Sun, 12 km star?). Here are the real numbers, in three tables, so you can compare your guesses with them.
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Table 1</strong> is about the real neutron star that NASA’s NICER telescope measured (“the NICER star”, the star in Picture 1).
                  </li>
                  <li>
                    <strong>Table 2</strong> is about the two imagined stars in your predictions. The answers to Prediction 1 and Prediction 2 are in this table.
                  </li>
                  <li>
                    <strong>Table 3</strong> is the published measurements from scientists, such as the heaviest weight a neutron star may have.
                  </li>
                </ul>
                None of these tables changes with your guesses, or with the settings you chose in Part 2. Before the tables, you will first see where things stand today, then a short check-up.
              </>
            }
          >
            <p style={{ ...paragraph, padding: '0.75rem 1rem', border: '2px solid var(--border-color, #ccc)', borderRadius: '8px', fontSize: '0.875rem' }}>
              <strong>Where this stands (as of October 2026).</strong> <strong>Strong evidence:</strong> a neutron star of about 1.4 Suns is about 11 to 12 km in radius, to within about a
              kilometre (NICER measured one, and a second pulsar’s range overlaps it). <strong>Open:</strong> how heavy a neutron star can be before nothing can hold it up (one 2026
              estimate is {estimateLo} to {estimateHi} Suns, and it depends on assumptions), and what the heavier object in GW230529 is (the paper says that gravitational-wave data alone
              cannot say whether it is a neutron star or a black hole).
            </p>
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Your predictions, beside the results.</strong> Before the run you made two predictions. Here they are again, each with the place on this page where its number
                appears. Compare them yourself. The tutor will go through them with you after the tables.
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Prediction 1: would it become a black hole?</strong> You predicted: <strong>{sizeLabel}</strong>. Its number is in Table 2, in the row “Its radius ÷ black-hole
                radius”.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Prediction 2: how strong is gravity on its surface?</strong> You predicted: <strong>{gravityLabel}</strong>. Its number is in Table 2, in the row “Gravity at its
                surface”.
              </p>
            </div>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>How to read these results.</strong> Think of these tables as a set of test results, and this section as the doctor explaining them. A neutron star cannot be
              measured with a ruler: its size comes from the shape of the X-ray pulses it sends out, and how heavy a neutron star can get comes from setting theory against a few
              measured stars. So what we know arrives as numbers from several sources, each with its own give-or-take. The question to keep in mind is:{' '}
              <strong>do the numbers agree with each other, and how strong is each one?</strong>
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              First comes a short check-up that sets what we would expect beside what was found. Then each table has a plain-words note under it. The experiment explains what each number
              means. It does not decide for you what the evidence adds up to. The tutor will help you with that, after the tables. The “Words and formulas” box now has the formulas worked
              with these numbers.
            </p>
            <p style={{ marginBottom: '0.25rem' }}>
              <strong>The check-up: what we would expect, and what was found</strong>
            </p>
            <ResultsTable
              head={['What was checked', 'What we would expect', 'What was found', 'What this tells us']}
              minWidth={760}
              rows={[
                [
                  'The size of the NICER star',
                  `NASA: “about 20 kilometers across”, a radius of about ${check.nasaRadiusKm} km. Black Holes Experiment 1’s round figure: ${NEUTRON_STAR_RADIUS_KM} km`,
                  `${j.radiusKm} km (+${j.radiusPlusKm}, −${j.radiusMinusKm}), a 68 percent range of ${nicerLo.toFixed(2)} to ${nicerHi.toFixed(2)} km`,
                  `NASA’s figure is ${check.nasaRadiusVersusNicer.distance.toFixed(2)} km below the bottom of NICER’s range, and ${NEUTRON_STAR_RADIUS_KM} km lies inside it. Both are round figures, and both are within about 1.4 km of NICER’s value.`,
                ],
                [
                  'The same measurement on another star',
                  `PSR J0614−3329: a radius of ${d.j0614RadiusRangeKm[0]} to ${d.j0614RadiusRangeKm[1]} km (a 68 percent range, September 2026)`,
                  `${j.radiusKm} km for J0437`,
                  'Inside that range. These are two different stars, so this is a check that the two results are of a similar size, not a repeat of the same measurement. The J0614 abstract also says that its NICER and XMM-Newton data do not fit together perfectly under standard assumptions about the background.',
                ],
                [
                  'The ratio to the black-hole radius',
                  'A ratio of 1 or less would mean the sphere is a black hole',
                  `${result.ratio.toFixed(2)}`,
                  `Above 1: the star is ${result.ratio.toFixed(2)} times wider than a black hole of its mass would be, so it is not one. A ratio of exactly 1 is the black hole itself.`,
                ],
                [
                  'Gravity at the surface',
                  'No published value was read for comparison',
                  `${sci(result.surfaceGravityMS2)} m/s², which is ${sci(result.gravityInEarths)} times the Earth’s`,
                  'Newton’s value, which is only a guide at this strength: the true value differs because space is curved. It is worked out here, not measured.',
                ],
                [
                  'A clock on the surface',
                  '1 for a clock far from the star',
                  `${result.clockRate!.toFixed(3)}, which is ${result.clockSlowerPercent!.toFixed(1)} percent slower`,
                  'Less than 1: a clock on the surface ticks slower than a distant one, as Black Holes Experiment 2’s formula says. No published measurement is used for comparison.',
                ],
                [
                  'The density',
                  'NASA: a sugar cube of neutron star material “about 1 trillion kilograms”',
                  `${sci(check.density.ourKg)} kg for a sugar cube (1 cubic centimetre) of the NICER star`,
                  `NASA’s figure is ${check.density.nasaOverOurs.toFixed(1)} times ours: the same order of size. NASA’s is a round figure, and ours uses this star’s weight and radius.`,
                ],
                [
                  'The star’s weight against the most a neutron star can weigh',
                  `One 2026 estimate of the most a neutron star can weigh: ${estimateLo} to ${estimateHi} Suns (it depends on assumptions)`,
                  `${j.massSolar} Suns for J0437`,
                  `Below the estimate by ${check.massVersusEstimate.distance.toFixed(2)} Suns. This star is far from the heavy end.`,
                ],
                [
                  'GW230529’s heavier object against the mass gap',
                  `The mass gap: ${d.gapRangeSolar[0]} to ${d.gapRangeSolar[1]} Suns (LIGO)`,
                  `The object’s 90 percent range: ${check.gwHeavierInterval[0].toFixed(1)} to ${check.gwHeavierInterval[1].toFixed(1)} Suns`,
                  `${(check.gwHeavierVersusGap.fraction * 100).toFixed(0)} percent of its range (${check.gwHeavierVersusGap.overlap.toFixed(1)} of ${check.gwHeavierVersusGap.width.toFixed(1)} Suns) lies inside the gap.`,
                ],
                [
                  'GW230529’s heavier object against the weight estimate',
                  `${estimateLo} to ${estimateHi} Suns`,
                  `${check.gwHeavierInterval[0].toFixed(1)} to ${check.gwHeavierInterval[1].toFixed(1)} Suns`,
                  `The whole range lies above the estimate, the lowest value by ${check.gwHeavierVersusEstimate.distance.toFixed(1)} Suns. But the estimate depends on assumptions, and the paper says the data alone cannot say whether either object is a neutron star or a black hole. So the numbers do not settle what the object is.`,
                ],
              ]}
            />
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              A doctor reads each result against a reference. Rows 1, 2, 3 and 6 are set against a published figure or against the meaning of a black hole. Rows 4 and 5 have no published
              value, so they are plain results of the formulas. Rows 7 to 9 set published results against each other and do not decide what any object is. That is why the status label
              says “Strong evidence” for the size and “Open” for the heaviest weight and for the heavier object in GW230529.
            </p>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 1: the NICER star</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={560}
              rows={[
                ['Weight', `${j.massSolar} ± ${j.massUncertaintySolar} Suns`, 'Choudhury and others (2024), abstract; the weight is largely from radio timing'],
                ['Radius', `${j.radiusKm} km (+${j.radiusPlusKm}, −${j.radiusMinusKm}), so ${result.diameterKm.toFixed(1)} km across`, 'Choudhury and others (2024); NASA: “5-8% uncertainties”'],
                ['Its black-hole radius', `${result.blackHoleRadiusKm.toFixed(2)} km`, `worked out here: 2GM ÷ c², ${blackHoleRadiusKm(1).toFixed(3)} km for each Sun (Black Holes Experiment 1)`],
                ['Radius ÷ black-hole radius', `${result.ratio.toFixed(2)}`, `worked out here: ${result.radiusKm} ÷ ${result.blackHoleRadiusKm.toFixed(2)}`],
                ['Compactness', `${result.compactness.toFixed(3)} (a black hole’s is 0.5)`, 'worked out here: r_s ÷ (2R)'],
                ['Gravity at the surface', `${sci(result.surfaceGravityMS2)} m/s², which is ${sci(result.gravityInEarths)} times the Earth’s`, 'worked out here: GM ÷ R² (Newton’s value, only a guide at this strength)'],
                ['A clock on the surface', `${result.clockRate!.toFixed(3)} of the rate of a distant clock, ${result.clockSlowerPercent!.toFixed(1)} percent slower`, 'worked out here: √(1 − r_s ÷ R) (Black Holes Experiment 2)'],
                ['Average density', `${sci(result.densityKgM3)} kg per cubic metre`, 'worked out here: weight ÷ volume of a sphere'],
                ['A sugar cube of it', `${sci(result.sugarCubeKg)} kg; NASA says “about 1 trillion kilograms”`, 'worked out here: density × 1 cubic centimetre; NASA Imagine the Universe'],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>The size and the black-hole radius.</strong> What it is: how wide NICER found the star to be, and how wide a black hole of the same weight would be. What it means:{' '}
                {result.radiusKm} km against {result.blackHoleRadiusKm.toFixed(2)} km, a ratio of {result.ratio.toFixed(2)}. For example, if you squeezed the star to {blackHolePercentOfRadius.toFixed(0)} percent of its present radius, it would be at its black-hole
                radius. Why it matters: a neutron star is not far from being a black hole. Even allowing for NICER’s give-or-take (radii from {nicerLo.toFixed(2)} to {nicerHi.toFixed(2)} km), the ratio stays between about {ratioLow.toFixed(1)} and{' '}
                {ratioHigh.toFixed(1)}, so the star is clearly bigger than a black hole of its weight, but not by much.
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Gravity and the clock.</strong> What it is: how hard gravity pulls at the surface, and how slowly a clock there ticks. What it means: {sci(result.gravityInEarths)} times the Earth’s gravity, and a clock
                that counts {minutesPerHour.toFixed(1)} minutes while a distant clock counts 60 (60 × {result.clockRate!.toFixed(3)}). Why it matters: gravity this strong changes how clocks run, which is why Newton’s
                law is only a guide here and general relativity is needed. The gravity figure is Newton’s value, so it is the less certain of the two.
              </p>
              <p style={{ margin: 0 }}>
                <strong>The density.</strong> What it is: the weight divided by the volume. What it means: a sugar cube of this material would weigh about {sugarCubeMillionTonnes(result.massSolar, result.radiusKm).toFixed(0)} million tonnes, in the
                same range as NASA’s “about 1 trillion kilograms”. Why it matters: it shows how much matter is packed into so small a sphere.
              </p>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 2: the two stars in your predictions</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={560}
              rows={[
                ['Prediction 1’s star', `${p1.massSolar} Suns, squeezed to a radius of ${p1.radiusKm} km`, 'the question’s own numbers'],
                ['Its black-hole radius', `${p1.blackHoleRadiusKm.toFixed(2)} km`, 'worked out here: 2GM ÷ c² (Black Holes Experiment 1)'],
                [
                  'Its radius ÷ black-hole radius (the row for Prediction 1)',
                  `${p1.ratio.toFixed(2)}; a sphere with a ratio of 1 or less is a black hole`,
                  `worked out here: ${p1.radiusKm} ÷ ${p1.blackHoleRadiusKm.toFixed(2)}. You predicted: ${sizeLabel}`,
                ],
                ['Prediction 2’s star', `${p2.massSolar} Suns, radius ${p2.radiusKm} km`, 'the question’s own numbers'],
                [
                  'Gravity at its surface (the row for Prediction 2)',
                  `${sci(p2.surfaceGravityMS2)} m/s², which is ${sci(p2.gravityInEarths)} times the Earth’s`,
                  `worked out here: GM ÷ R² (Newton’s value). You predicted: ${gravityLabel}`,
                ],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: 0 }}>
                <strong>What this table tells us.</strong> What it is: the two stars that the predictions asked about, each worked out with the same formulas as Table 1. What it means: squeezed to {p1.radiusKm} km, a
                sphere of {p1.massSolar} Suns has a radius {p1.ratio.toFixed(2)} times its black-hole radius of {p1.blackHoleRadiusKm.toFixed(2)} km; and on the surface of a sphere of {p2.massSolar} Suns and {p2.radiusKm} km, gravity is {sci(p2.gravityInEarths)} times the
                Earth’s. Why it matters: the first shows where the line for becoming a black hole lies for this weight, and the second shows how extreme a neutron star’s gravity is. The tutor will go through your
                guesses with you.
              </p>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 3: the published measurements</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={600}
              rows={[
                ['Weight of PSR J0437−4715', `${j.massSolar} ± ${j.massUncertaintySolar} Suns`, 'Choudhury and others (2024), abstract'],
                ['Radius of PSR J0437−4715', `${j.radiusKm} (+${j.radiusPlusKm}, −${j.radiusMinusKm}) km, so ${nicerLo.toFixed(2)} to ${nicerHi.toFixed(2)} km (a 68 percent range)`, 'Choudhury and others (2024); NASA’s science note'],
                ['Radius of PSR J0614−3329', `${d.j0614RadiusRangeKm[0]} to ${d.j0614RadiusRangeKm[1]} km (a 68 percent range)`, 'Miller and others (September 2026), abstract only; a preprint'],
                ['The most a neutron star can weigh (one estimate)', `${estimateLo} to ${estimateHi} Suns, depending on assumptions about dense matter`, 'Kasza and Wolf (2026 preprint), abstract; one team’s estimate'],
                ['GW230529: the heavier object', `about ${d.gw230529Primary.massSolar} Suns; a 90 percent range of ${primaryLo.toFixed(1)} to ${primaryHi.toFixed(1)} Suns`, 'LIGO-Virgo-KAGRA paper (2024), abstract; “about 3.6” from the LIGO summary'],
                ['GW230529: the lighter object', `a 90 percent range of ${d.gw230529Secondary.lowSolar.toFixed(1)} to ${d.gw230529Secondary.highSolar.toFixed(1)} Suns`, 'the same paper’s abstract, and the LIGO summary'],
                ['The mass gap', `${d.gapRangeSolar[0]} to ${d.gapRangeSolar[1]} Suns`, 'LIGO summary: “a lower mass gap … between 3 M☉ and 5 M☉”'],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>The measurements.</strong> What it is: the published results this experiment rests on, each with the range it came with. What it means: two NICER radii of about 11 to 12 km that overlap, the
                heavier object of GW230529 somewhere from {primaryLo.toFixed(1)} to {primaryHi.toFixed(1)} Suns, and its lighter partner from {d.gw230529Secondary.lowSolar.toFixed(1)} to {d.gw230529Secondary.highSolar.toFixed(1)}. A 68 percent range means about two chances in three that the true value lies inside it, and a 90 percent range means nine in
                ten. Why it matters: the size is known to within about a kilometre, but the heavy end is not: the estimate is one team’s, and it is a preprint.
              </p>
              <p style={{ margin: 0 }}>
                <strong>How strong each one is.</strong> The two NICER results and the LIGO paper are measurements. The {estimateLo} to {estimateHi} Suns is an estimate that depends on what is assumed about matter at such a
                density, so it is a weaker kind of number. The mass gap is a range where few objects are expected, not a measured wall. The experiment does not pick between a neutron star and a black hole for
                GW230529’s heavier object: the paper itself says the data alone cannot.
              </p>
            </div>

            <p style={{ margin: '1.5rem 0 0.5rem' }}>
              <strong>The papers behind these results.</strong> Kept until now, so that they did not give away the predictions. Links open in a new tab.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2407.06789">Choudhury, Salmi, Vinciguerra, Riley, Kini, Watts and others, “A NICER View of the Nearest and Brightest Millisecond Pulsar: PSR J0437−4715”</ExternalLink>{' '}
                (Astrophysical Journal Letters, 2024): the weight and the radius of J0437.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2609.00965">Miller and others, “The Radius of the Neutron Star PSR J0614−3329 from NICER Data”</ExternalLink> (September 2026, a preprint): the second pulsar’s
                radius.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2605.00437">Kasza and Wolf, “Maximal mass of neutron stars constrained by neutron star observations”</ExternalLink> (2026, a preprint): the estimate of the most a neutron
                star can weigh.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2404.04248">LIGO Scientific, Virgo and KAGRA Collaborations, “Observation of Gravitational Waves from the Coalescence of a 2.5–4.5 M☉ Compact Object and a Neutron Star”</ExternalLink>{' '}
                (2024): GW230529 and its two masses.
              </li>
            </ul>
          </PageSection>
        )}

        {/* Part 4, the tutor (after the results): observe, compare with the predictions, a conceptual question, then the explanation. */}
        {done && sizePrediction !== null && gravityPrediction !== null && (
          <PageSection
            step="Part 4"
            title="The tutor"
            accent={PART_FOUR_COLOR}
            lead={
              <>
                <strong>What we are about to do.</strong> You have now seen the pictures and the tables. This last part is a short conversation with a tutor, to help you make sense of them.
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Three questions, one at a time.</strong> First, the tutor asks what you see in Pictures 1 and 2. Second, it asks you to compare your own guesses (the white marks) with the
                    real results. Third, it asks one bigger question, about the heavier object in the gravitational-wave event GW230529. Type a few words for each. Nothing is graded, and a short
                    answer is fine.
                  </li>
                  <li>
                    <strong>No verdict until you have replied.</strong> The tutor will not say whether your guesses were right until you have answered all three, so you can think it through first.
                  </li>
                  <li>
                    <strong>Then the explanation.</strong> The tutor marks each of your two predictions as matched or not matched, and then goes through what lies behind the numbers in seven short
                    parts: what holds a neutron star up, how its size was measured, how close it is to a black hole, how strong its gravity is, why there is a heaviest neutron star, and what GW230529
                    is. Some parts use a worked sum or an everyday comparison.
                  </li>
                  <li>
                    <strong>After the explanation,</strong> a short summary of what you learned appears below.
                  </li>
                </ul>
              </>
            }
          >
            <NeutronStarSizeTutor sizePrediction={sizePrediction} gravityPrediction={gravityPrediction} onExplained={onTutorComplete} />
          </PageSection>
        )}
    </div>
  )
}
