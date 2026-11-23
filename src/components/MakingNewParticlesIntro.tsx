import type { CSSProperties, ReactNode } from 'react'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'

// Spacetime Geometry 6, Section A (making a new particle): the introduction, its own drawing, the links and the "Words and formulas" entries.
// Audit update of 2026-11-22 (wording in docs/audit/spacetime-geometry/06-draft-wording.md, approved by the owner on 2026-11-22). Wording here is draft for the
// owner's review (CLAUDE.md §28.1). The introduction does not say which setup leaves more usable energy, and it gives no number for either setup (that is the
// prediction, §12). The tutor's explanation carries what the introduction leaves out.

const SECTION_NOTE: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)' }
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const LAB_COLOR = '#38bdf8'
const NEW_COLOR = '#4ade80'
const FLASH_COLOR = '#facc15'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

// Experiment 6's own list for the "Words and formulas" box (audit finding 9): reminders it really needs, and its own words. No entry names an Experiment 5 section,
// picture or guess tick.
export const SECTION_A_REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Particle', meaning: 'a very small piece of matter, such as an electron or a proton, treated here as a single point.' },
  { term: 'Observer', meaning: 'someone who measures where things are, how fast they move and how much energy they have, with their own ruler and clocks.' },
  { term: 'c', meaning: 'the speed of light, about 300,000 kilometers per second. 0.6c is 60 percent of it.' },
  {
    term: 'Rest energy and mass',
    meaning:
      'the energy a particle has when it is not moving. It is stored in its mass (E = mc²). Here the rest energy of one colliding particle is the unit of energy, written 1, so its mass is also 1. For example, an electron’s rest energy is 0.511 MeV and a proton’s is about 938 MeV; K = 5 would mean five times the rest energy of one colliding particle.',
  },
  { term: 'Kinetic energy', meaning: 'energy of motion. At everyday speeds it is ½ × mass × speed². A moving particle’s total energy is its rest energy plus its energy of motion: for example, a particle at rest has an energy of 1, and with an energy of motion of 3 its total energy is 1 + 3 = 4.' },
  {
    term: 'Accelerator',
    meaning:
      'a machine that pushes particles faster and faster. Its main parts are a source of particles, a pipe with almost nothing in it (a vacuum), cavities in which electric fields push the particles, and magnets that steer them.',
  },
  {
    term: 'Electric field and voltage',
    meaning:
      'an electric field pushes on electric charge, as gravity pulls on a mass. The voltage is like the height of a slope: the more volts a charged particle crosses, the more energy it gains.',
  },
  {
    term: 'Bunch',
    meaning: 'a small group of particles that travel together in an accelerator, timed to arrive at a cavity when its electric field points forward.',
  },
  {
    term: 'MeV and electron-volt',
    meaning:
      'an electron-volt (eV) is the energy a particle with one electron’s charge gains when it crosses 1 volt. An MeV is a million of them. Crossing 16 million volts gives about 16 MeV.',
  },
  { term: 'System', meaning: 'the whole group of particles taken together, as if they were one thing.' },
  {
    term: 'The mass of a system: M = √(E_total² − (P_total c)²)',
    meaning:
      'add up the energies of all the particles, and add up their momenta × c (a particle moving left counts as negative). Then square the total energy, square the total momentum × c, and subtract. For example, a set with a total energy of 5 and a total momentum × c of 3 has M = √(25 − 9) = √16 = 4. It is not the sum of the particles’ separate masses, and every observer agrees on it.',
  },
  { term: 'Threshold', meaning: 'the least energy at which something can happen. For a new particle of mass X it is a system’s mass of 2 + X.' },
  {
    term: 'Beam, target, stationary target',
    meaning: 'a beam is a stream of particles moving the same way. The target is what it hits. A stationary target is at rest in the lab.',
  },
  { term: 'Collider', meaning: 'a machine in which two beams are sent toward each other and meet head-on.' },
  {
    term: 'Energy of motion supplied, K',
    meaning: 'the total kinetic energy of all the moving particles in the lab, in rest energies of one colliding particle. K = 3 is three times that rest energy.',
  },
  {
    term: 'New particle, mass X',
    meaning: 'a particle that was not there before the collision. Here it is made up and neutral, and X is its mass in masses of one colliding particle.',
  },
  {
    term: 'Price of a particle',
    meaning: 'the energy that must be paid to make it, equal to its mass in rest energies. A new particle of mass X costs X.',
  },
  {
    term: 'The system’s own observer',
    meaning: 'an observer for whom the total momentum of the system is zero. They travel along with the system as a whole.',
  },
  {
    term: 'Usable energy, U = M − 2',
    meaning:
      'the system’s mass minus the rest masses of the two colliding particles. It is the part of the energy of motion that can become the mass of new particles. For example, a system with M = 4 has U = 2.',
  },
  {
    term: 'Locked-in energy, L = K − U',
    meaning: 'the part of the energy of motion tied up in the motion of the whole system, which cannot become mass. For example, if K = 3 and U = 2, then L = 1.',
  },
  {
    term: 'Threshold for a new particle: M ≥ 2 + X',
    meaning: 'a new particle of mass X can be made only if the system’s mass is at least the two colliding particles’ masses plus X. For example, X = 1 needs M ≥ 3.',
  },
]

// Our own neutral drawing: energy can become mass. It shows no setup, no number of K and no comparison, so it reveals nothing about the prediction (§12).
export function EnergyBecomesMassPicture() {
  return (
    <svg
      viewBox="0 0 520 250"
      role="img"
      aria-label="A drawing of the idea. On the left, two particles move toward each other. In the middle a flash marks the collision. On the right there are the same two particles and a third, larger one that was not there before, which is the new particle. A label says that a particle of mass X costs X rest energies."
      style={{ display: 'block', width: '100%', height: 'auto', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', backgroundColor: '#0b1020' }}
    >
      <defs>
        <marker id="intro-arrow-lab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LAB_COLOR} />
        </marker>
        <marker id="intro-arrow-flash" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={FLASH_COLOR} />
        </marker>
      </defs>
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Energy can become mass
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        An illustration of the idea. It has no numbers.
      </text>

      <text x="95" y="70" fontSize="11" fontWeight="bold" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        Before
      </text>
      <text x="95" y="84" fontSize="10" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        two particles with energy of motion
      </text>
      <line x1="20" y1="118" x2="100" y2="118" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#intro-arrow-lab)" />
      <circle cx="40" cy="118" r="14" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <line x1="170" y1="118" x2="110" y2="118" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#intro-arrow-lab)" />
      <circle cx="150" cy="118" r="14" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />

      <circle cx="260" cy="118" r="26" fill="none" stroke={FLASH_COLOR} strokeWidth="3" />
      <circle cx="260" cy="118" r="14" fill="none" stroke={FLASH_COLOR} strokeWidth="2" opacity="0.6" />
      <text x="260" y="70" fontSize="11" fontWeight="bold" textAnchor="middle" fill={FLASH_COLOR} style={HALO}>
        The collision
      </text>
      <line x1="215" y1="170" x2="305" y2="170" stroke={FLASH_COLOR} strokeWidth="2.5" markerEnd="url(#intro-arrow-flash)" />
      <text x="260" y="190" fontSize="10" textAnchor="middle" fill={FLASH_COLOR} style={HALO}>
        some of the energy of motion
      </text>
      <text x="260" y="203" fontSize="10" textAnchor="middle" fill={FLASH_COLOR} style={HALO}>
        becomes mass
      </text>

      <text x="410" y="70" fontSize="11" fontWeight="bold" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        After
      </text>
      <circle cx="350" cy="118" r="14" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <circle cx="388" cy="118" r="14" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <text x="369" y="150" fontSize="10" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        the same two particles
      </text>
      <circle cx="458" cy="118" r="26" fill={NEW_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <text x="458" y="122" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0b1020">
        new
      </text>
      <text x="458" y="164" fontSize="10" textAnchor="middle" fill={NEW_COLOR} style={HALO}>
        a new particle that
      </text>
      <text x="458" y="177" fontSize="10" textAnchor="middle" fill={NEW_COLOR} style={HALO}>
        was not there before
      </text>
      <rect x="336" y="206" width="176" height="36" rx="6" fill="#0b1020" stroke={NEW_COLOR} strokeWidth="2" />
      <text x="424" y="221" fontSize="10" fontWeight="bold" textAnchor="middle" fill={NEW_COLOR}>
        price tag: a particle of
      </text>
      <text x="424" y="234" fontSize="10" fontWeight="bold" textAnchor="middle" fill={NEW_COLOR}>
        mass X costs X rest energies
      </text>
    </svg>
  )
}

export function EnergyBecomesMassCaption() {
  return (
    <div style={{ ...SECTION_NOTE, marginTop: '1rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this drawing.</strong> It is an illustration of one idea, so it has no numbers and shows no setup. It reads from left to right, as a story.
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The two sky-blue circles on the left, with arrows.</strong> Two particles before the collision. Each arrow shows which way its particle moves, and a longer arrow
          would mean a faster particle.
        </li>
        <li>
          <strong>The yellow rings, "The collision".</strong> The moment when the two particles meet.
        </li>
        <li>
          <strong>The yellow arrow, "some of the energy of motion becomes mass".</strong> The idea of this whole section: energy of motion can change form into mass.
        </li>
        <li>
          <strong>The two sky-blue circles on the right.</strong> The same two particles, still there afterward.
        </li>
        <li>
          <strong>The larger green circle, "new".</strong> A new particle, one that was not there before the collision. Green means "made from energy that could be used". It is drawn
          larger because it is heavier.
        </li>
        <li>
          <strong>The price tag.</strong> A new particle of mass X costs X rest energies. <em>Rest energy</em> is the energy a particle has when it is not moving, and in this
          experiment the rest energy of one colliding particle is the unit, written 1.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          {
            look: 'the two circles on the left and the three circles on the right',
            means: 'after the collision there is one more circle than before: the particles that were there at the start are still there, and a new one has appeared',
            matters: 'the new particle was not hiding inside the others. It is made in the collision, so its mass has to be paid for by something, and the only thing available is the energy of motion',
          },
          {
            look: 'the price tag beside the green circle',
            means: 'making a particle of mass X costs X rest energies of energy, the same amount as its rest energy',
            matters: 'it tells you what the energy of motion has to pay for, which is what the questions of this section are about',
          },
        ]}
      />
      <WhereFrom>
        <strong>Calculated here:</strong> nothing. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the whole picture. It illustrates an idea and shows no real
        or calculated numbers.
      </WhereFrom>
    </div>
  )
}

// Our own simplified sketch of an accelerator, laid out as an assembly line, left to right, with the stations numbered as in the text. It shows no setup, no K and no
// comparison, so it reveals nothing about the prediction (§12). A real machine is far larger and has many cavities and magnets.
const PUSH_COLOR = '#f87171'
const HARDWARE_COLOR = '#94a3b8'

export function AcceleratorPicture() {
  const pipeY = 150
  const centerY = pipeY + 16
  const particle = (x: number, arrow: number, direction: 1 | -1 = 1) => (
    <g key={`${x}-${direction}`}>
      <line
        x1={x + direction * 14}
        y1={centerY}
        x2={x + direction * (14 + arrow)}
        y2={centerY}
        stroke={LAB_COLOR}
        strokeWidth="2.5"
        markerEnd="url(#acc-arrow-lab)"
      />
      <circle cx={x} cy={centerY} r="9" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
    </g>
  )
  const circled = (x: number, y: number, n: number) => (
    <g>
      <circle cx={x} cy={y} r="9" fill="#0b1020" stroke={TEXT_COLOR} strokeWidth="1.5" />
      <text x={x} y={y + 4} fontSize="11" fontWeight="bold" textAnchor="middle" fill={TEXT_COLOR}>
        {n}
      </text>
    </g>
  )
  return (
    <svg
      viewBox="0 0 520 345"
      role="img"
      aria-label="A simplified sketch of a particle accelerator, from left to right. One: a bottle of hydrogen gas, the source of the particles. Two: a pipe with almost no air inside. Three: a cavity in which an electric field pushes the particles forward, so the arrows on the particles after it are longer than before it. Four: magnets above and below the pipe that bend the path, and a lens that squeezes the beam. Five: the collision, where a second beam coming from the other side meets the first head-on. A dashed arrow underneath shows that in a ring the particles come back to the cavity and are pushed again, lap after lap."
      style={{ display: 'block', width: '100%', height: 'auto', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', backgroundColor: '#0b1020' }}
    >
      <defs>
        <marker id="acc-arrow-lab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LAB_COLOR} />
        </marker>
        <marker id="acc-arrow-push" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={PUSH_COLOR} />
        </marker>
        <marker id="acc-arrow-grey" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={HARDWARE_COLOR} />
        </marker>
      </defs>
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Inside a particle accelerator (a simplified sketch)
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        Read it from left to right. The numbers match the numbered parts in the text.
      </text>

      {/* 1: the source */}
      <rect x="44" y="122" width="14" height="14" fill="none" stroke={HARDWARE_COLOR} strokeWidth="2" />
      <rect x="22" y="136" width="58" height="66" rx="10" fill="#111827" stroke={HARDWARE_COLOR} strokeWidth="2" />
      <text x="51" y="174" fontSize="13" fontWeight="bold" textAnchor="middle" fill={TEXT_COLOR}>
        H₂
      </text>
      <line x1="82" y1={centerY} x2="96" y2={centerY} stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#acc-arrow-lab)" />
      {circled(51, 108, 1)}

      {/* 2: the pipe */}
      <rect x="96" y={pipeY} width="410" height="32" rx="6" fill="#111827" stroke={HARDWARE_COLOR} strokeWidth="2" />
      {circled(112, 108, 2)}
      <text x="126" y="112" fontSize="10" fill={MUTED_COLOR}>
        pipe
      </text>
      <text x="134" y="204" fontSize="10" textAnchor="middle" fill={MUTED_COLOR}>
        almost no air
      </text>
      <text x="134" y="216" fontSize="10" textAnchor="middle" fill={MUTED_COLOR}>
        inside
      </text>

      {/* particles: slow before the cavity, fast after it, a head-on pair at the end */}
      {particle(112, 10)}
      {particle(148, 10)}
      {particle(205, 26)}
      {particle(262, 40)}
      {particle(398, 22)}
      {particle(478, 22, -1)}

      {/* 3: the cavity */}
      <rect x="176" y="122" width="62" height="92" rx="8" fill="none" stroke={TEXT_COLOR} strokeWidth="2" />
      <line x1="184" y1="132" x2="230" y2="132" stroke={PUSH_COLOR} strokeWidth="2.5" markerEnd="url(#acc-arrow-push)" />
      <line x1="184" y1="204" x2="230" y2="204" stroke={PUSH_COLOR} strokeWidth="2.5" markerEnd="url(#acc-arrow-push)" />
      {circled(207, 108, 3)}

      {/* 4: magnets (above and below the pipe) and a lens that squeezes the beam */}
      <rect x="268" y="116" width="52" height="30" rx="3" fill="#1f2937" stroke={HARDWARE_COLOR} strokeWidth="2" />
      <text x="294" y="136" fontSize="11" fontWeight="bold" textAnchor="middle" fill={TEXT_COLOR}>
        N
      </text>
      <rect x="268" y="186" width="52" height="30" rx="3" fill="#1f2937" stroke={HARDWARE_COLOR} strokeWidth="2" />
      <text x="294" y="206" fontSize="11" fontWeight="bold" textAnchor="middle" fill={TEXT_COLOR}>
        S
      </text>
      <path d="M 340 150 L 362 160 L 362 172 L 340 182 Z" fill="#1f2937" stroke={HARDWARE_COLOR} strokeWidth="2" />
      <path d="M 384 150 L 362 160 L 362 172 L 384 182 Z" fill="#1f2937" stroke={HARDWARE_COLOR} strokeWidth="2" />
      {circled(330, 108, 4)}

      {/* 5: the collision */}
      <circle cx="438" cy={centerY} r="24" fill="none" stroke={FLASH_COLOR} strokeWidth="3" />
      <circle cx="438" cy={centerY} r="12" fill="none" stroke={FLASH_COLOR} strokeWidth="2" opacity="0.6" />
      {circled(438, 108, 5)}

      {/* labels under the parts */}
      <text x="51" y="228" fontSize="11" fontWeight="bold" textAnchor="middle" fill={TEXT_COLOR}>
        Source
      </text>
      <text x="51" y="242" fontSize="10" textAnchor="middle" fill={MUTED_COLOR}>
        a bottle of
      </text>
      <text x="51" y="255" fontSize="10" textAnchor="middle" fill={MUTED_COLOR}>
        hydrogen gas
      </text>
      <text x="207" y="232" fontSize="11" fontWeight="bold" textAnchor="middle" fill={PUSH_COLOR} style={HALO}>
        Cavity
      </text>
      <text x="207" y="246" fontSize="10" textAnchor="middle" fill={PUSH_COLOR} style={HALO}>
        an electric field
      </text>
      <text x="207" y="259" fontSize="10" textAnchor="middle" fill={PUSH_COLOR} style={HALO}>
        pushes the particles
      </text>
      <text x="330" y="232" fontSize="11" fontWeight="bold" textAnchor="middle" fill={TEXT_COLOR}>
        Magnets and lens
      </text>
      <text x="330" y="246" fontSize="10" textAnchor="middle" fill={MUTED_COLOR}>
        steer and
      </text>
      <text x="330" y="259" fontSize="10" textAnchor="middle" fill={MUTED_COLOR}>
        squeeze the beam
      </text>
      <text x="446" y="232" fontSize="11" fontWeight="bold" textAnchor="middle" fill={FLASH_COLOR} style={HALO}>
        Collision
      </text>
      <text x="446" y="246" fontSize="10" textAnchor="middle" fill={FLASH_COLOR} style={HALO}>
        two beams meet
      </text>
      <text x="446" y="259" fontSize="10" textAnchor="middle" fill={FLASH_COLOR} style={HALO}>
        head-on
      </text>

      {/* the return path of a ring */}
      <path d="M 300 276 Q 210 316 126 280" fill="none" stroke={HARDWARE_COLOR} strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#acc-arrow-grey)" />
      <text x="214" y="306" fontSize="10" textAnchor="middle" fill={MUTED_COLOR} style={HALO}>
        in a ring the particles come back and are pushed again, lap after lap
      </text>
      <text x="12" y="331" fontSize="10" fill={MUTED_COLOR}>
        Sky-blue circles: particles. A longer arrow means a faster particle.
      </text>
      <text x="12" y="343" fontSize="10" fill={MUTED_COLOR}>
        Red arrows: the push of the electric field. A real machine is far larger.
      </text>
    </svg>
  )
}

export function AcceleratorCaption() {
  return (
    <div style={{ ...SECTION_NOTE, marginTop: '1rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this drawing.</strong> It is a simplified sketch of the machine described above, laid out like an assembly line from left to right. A real accelerator is far larger, and
        it has many cavities and many magnets, but the order of the parts is the same.
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>1, the bottle of "H₂".</strong> The source of the particles: hydrogen gas, from which the protons are taken.
        </li>
        <li>
          <strong>2, the dark pipe.</strong> The pipe the particles fly in, with almost no air inside.
        </li>
        <li>
          <strong>The sky-blue circles and their arrows.</strong> The particles. An arrow shows which way a particle moves, and a longer arrow means a faster particle.
        </li>
        <li>
          <strong>3, the box with the red arrows.</strong> A cavity. The red arrows are the push of its electric field, which points forward when the particles arrive.
        </li>
        <li>
          <strong>4, the grey blocks marked N and S, and the two grey wedges.</strong> The blocks are a magnet above and a magnet below the pipe: they bend the particles' path. The two wedges are a
          lens made of magnets: it squeezes the beam into a narrower stream.
        </li>
        <li>
          <strong>5, the yellow rings.</strong> The collision, where a second beam arriving from the other side meets the first head-on.
        </li>
        <li>
          <strong>The dashed grey arrow underneath.</strong> In a ring, the particles do not stop. They come back round to the cavity and are pushed again, lap after lap.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          {
            look: 'the short arrows on the particles to the left of the box with the red arrows, and the long arrows on the particles to the right of it',
            means: 'the particles move faster after the cavity than before it: the electric field has pushed them and handed them energy of motion',
            matters: 'this is where the energy of motion K comes from. Each push is small, which is why the particles go round the ring again and again',
          },
          {
            look: 'the two grey wedges just before the yellow rings',
            means: 'the beam is squeezed into a narrower stream before the collision',
            matters: 'particles are tiny, so a narrower beam makes it far more likely that two of them actually hit each other',
          },
          {
            look: 'the two beams that meet at the yellow rings, one coming from each side',
            means: 'two beams travelling in opposite directions meet head-on. That is one of the two ways of arranging a collision. The other is to fire one beam at a target that is sitting still',
            matters: 'those two arrangements are the two setups this section compares',
          },
        ]}
      />
      <WhereFrom>
        <strong>Calculated here:</strong> nothing. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the whole picture, a simplified sketch. The facts it stands for (the source,
        the cavities, the magnets, the vacuum, head-on beams) are described on the CERN pages linked below.
      </WhereFrom>
    </div>
  )
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

const linkItem: CSSProperties = { marginBottom: '0.4rem' }

// "Want to know more?" (draft section 7). Every page was fetched and read on 2026-11-22 before it was linked.
export function MakingNewParticlesLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/accelerators">CERN, "Accelerators"</Ext> (plain language; page read on 22 November 2026, no date shown): colliders make head-on collisions, and the
          collision energy is higher because the energies of the two particles are added. When the particles are energetic enough, the energy becomes new particles (E = mc²). It also
          gives the Large Hadron Collider's energies and compares 6.5 TeV with a falling safety pin. It does not compare a beam on a fixed target with head-on beams.
        </li>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/physics/12-steps-idea-discovery/">CERN, "12 steps: from idea to discovery"</Ext> (a mix of plain and technical; page read on 22 November 2026, no date
          shown): step 1 says that new particles can appear only when enough energy is packed into a very small region, and that the energy then changes into mass. The later steps follow
          a discovery at the Large Hadron Collider and get harder.
        </li>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/accelerators/large-hadron-collider/">CERN, "The Large Hadron Collider"</Ext> (mixed level; page read on 22 November 2026, no date shown): how the two
          beams run in opposite directions and are made to collide, and a table of key figures. It gives 6.8 TeV per beam and 13.6 TeV now, and says 13 TeV was reached in 2015. This
          page's 6.5 TeV and 13 TeV are those 2015 to 2018 values.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>How the machines work</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/accelerators/how-accelerator-works/">CERN, "How an accelerator works"</Ext> (plain language; page read on 22 November 2026, no date shown): a short page on the
          parts of an accelerator: the electric fields in the cavities that speed particles up, the dipole magnets that bend their path, the quadrupole magnets that squeeze the beam, the vacuum
          pipe, and the bottle of hydrogen that is the source of the Large Hadron Collider's protons.
        </li>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/engineering/accelerating-radiofrequency-cavities/">CERN, "Accelerating: Radiofrequency cavities"</Ext> (a little technical; page read on 22 November 2026, no
          date shown): how the cavities push the particles, why the timing matters, and the figures behind this page's numbers: 16 cavities, 400 million oscillations a second, 450 GeV to 6.5 TeV,
          and more than 10 million passes in about 20 minutes.
        </li>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/engineering/pulling-together-superconducting-electromagnets/">CERN, "Pulling together: Superconducting electromagnets"</Ext> (technical in places; page read on
          22 November 2026, no date shown): what the dipole and quadrupole magnets do, why the coils are superconducting, and why ordinary magnets would need a ring about 120 kilometers around.
        </li>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/engineering/vacuum-empty-interstellar-space/">CERN, "A vacuum as empty as interstellar space"</Ext> (a little technical; page read on 22 November 2026, no
          date shown): why the beams travel in a vacuum, how empty it is, and how it is made.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        No plain-language page from CERN, Fermilab, SLAC or another official source was found, and read, that compares a beam on a fixed target with head-on beams (searched 22 November 2026; the
        results were research papers and lecture notes, which are not plain pages and were not linked), so this page explains it in its own words. A Fermilab page on E = mc² and a CERN news page
        on the first collisions at 13 TeV could not be read (an error, and a page that had moved), and a SLAC article was a scan with no readable text, so none of them is linked. The formulas
        used here are the ones of Experiment 5.
      </p>
    </div>
  )
}

const P: CSSProperties = { marginTop: 0, marginBottom: '0.75rem' }

// The introduction's prose (draft sections 1a to 1e). `partOneK` and `partOneX` are Part 1's fixed values (K = 5, X = 2).
export function SectionAIntroduction({ partOneK, partOneX }: { partOneK: number; partOneX: number }) {
  return (
    <div style={{ marginBottom: '2rem', ...SECTION_NOTE }}>
      <p style={P}>
        <strong>The question.</strong> In Experiment 5 we found that when several particles are taken together, the whole set has a mass of its own, the system's mass. You work it out from the
        total energy and total momentum, and every observer agrees on it. We also saw that energy of motion can change form: when two lumps of clay hit and stick, their energy of motion
        became internal energy, and that made the lump heavier.
      </p>
      <p style={P}>
        Particle physicists use this idea on purpose. They smash particles together to make a particle that was not there before, and the mass of the new particle has to come from the
        energy of the collision. This section explains what that sentence means, and then asks a practical question about it.
      </p>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>Making a new particle: what it means.</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>A particle that was not there before.</strong> We do not mean a particle that was hiding inside the others and got shaken loose. We mean one that did not exist until the
            collision. Before it there were, say, two particles. Afterward there are those two and a third. Think of a clap. The sound was not hiding inside your hands, waiting to get out. It did not
            exist until your hands met, and it was made from the energy of their motion. A new particle is made in a similar way: it did not exist before the collision, and it is made from the energy
            of motion of the particles that collided. (The comparison only goes so far, because a particle is a piece of matter with a mass, and a sound is not. The next point explains how energy can
            become something with a mass.)
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>What rest energy is.</strong> Every particle, even one sitting perfectly still, has energy just because it exists. That energy is stored in its mass, which is what Experiment 5's
            rule <em>E = mc²</em> says: <em>E</em> is the energy, <em>m</em> is the mass, and <em>c²</em> is a fixed, enormous number (the speed of light multiplied by itself). This stored energy is
            called the <em>rest energy</em>, because it is the energy a particle has when it is <em>at rest</em>. Think of a battery in a drawer. It is not doing anything, but it has energy stored
            inside it. A particle's rest energy is a store like that, except that the store is its mass itself. A particle that is moving has more energy than that: its rest energy <em>plus</em> its
            energy of motion (the next point explains where that extra comes from). To feel how big c² is, take a paper clip of about 1 gram. Its rest energy is about 90 trillion joules, enough to keep
            a 100-watt light bulb shining for about 28,000 years (worked out here from E = mc²; that energy is locked inside the clip and cannot simply be got out). For a single electron the rest
            energy is 0.511 MeV, and for a proton it is about 938 MeV (an MeV is a million electron-volts, a tiny unit of energy used for particles).
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>How motion adds energy, and where K comes from.</strong> Energy never appears from nowhere. It is always moved from somewhere else. To make something move, you have to push it, and
            the push hands it energy. Take a shopping cart. Standing still, it has only the energy stored in it. Push it and it rolls: it now has <em>energy of motion</em> as well, and that energy came
            from you, from the food your muscles burned. The faster you make it go, the more energy of motion it has, and the more you had to give. A particle is the same, except that the push is far
            bigger. In a real machine, electric forces push the particles again and again along their path, each push adding a little more energy of motion, and the energy comes from the electricity
            that runs the machine (the next point shows how such a machine works). So a particle's total energy is its rest energy plus the energy of motion it was given: <em>total energy = rest energy + energy of motion</em>. In our unit
            (explained next), a particle at rest has an energy of 1. Give it an energy of motion of 3, and its total energy is 1 + 3 = 4.
            <br />
            <strong>Where does K come from?</strong> K is the energy of motion that has been given to the particles that are about to collide, added up for all of them. In the real world it comes from
            the machine that pushed them. In this experiment you decide it: K is a setting, like a dial. It is the money in your wallet for the price tag below, and a bigger K means a bigger machine.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>The machine: how an accelerator gives particles their energy of motion.</strong> An accelerator is a machine that pushes particles faster and faster, until they carry a lot of
            energy of motion. CERN's accelerators, which feed the Large Hadron Collider, show how the parts fit together. Everything below about CERN's machines is from CERN's own pages; the
            comparisons to a swing and to a battery are ours.
            <ol style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>A source of particles.</strong> For protons, the source is a bottle of hydrogen gas. A hydrogen atom is one proton with one electron, and an electric field strips the electrons
                off, leaving the protons. CERN says one bottle lasts for months: it is replaced only twice a year.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>A pipe with almost nothing in it.</strong> The particles fly inside a metal pipe from which nearly all the air has been pumped out. CERN says the vacuum is as empty as
                interstellar space. If the pipe held air, the particles would keep crashing into air molecules and lose their energy.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Cavities that push.</strong> Along the way there are metal chambers called radio-frequency cavities. Inside each one an electric field pushes the particles forward. Each time
                a group of particles passes, some of the energy of the radio waves in the cavity is handed to them. The field flips between "forward" and "backward" very fast (400 million times a
                second in the Large Hadron Collider), and it is timed so that the particles always arrive when it points forward. It is like pushing a child on a swing: a push at the right moment
                adds energy, and a push at the wrong moment would take some away. Each push is small. CERN says the Large Hadron Collider's cavities add up to at most 16 million volts per lap for a
                beam. A particle with the charge of a proton gains 1 electron-volt for each volt it crosses, so that is at most about 16 MeV per lap (worked out here from CERN's figure). The final
                energy is 6.5 million MeV. So the particles go round and round: 11,245 laps every second, and more than 10 million passes through the cavities in about 20 minutes.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Magnets that steer.</strong> With nothing to steer them, the particles would fly off in a straight line. Dipole magnets bend their path so that they curve round the ring, and
                the more energy the particles have, the stronger the magnets must be. Quadrupole magnets work like lenses: they squeeze the beam into a narrow stream. At the Large Hadron Collider
                the beam is squeezed from 0.2 millimeters to 16 micrometers just before the collision, so the particles are far more likely to hit each other. A magnet changes which way the particles
                go, but it does not speed them up. That is the cavities' job. CERN's magnets are superconducting: their coils are cooled to 1.9 kelvin (−271.3 °C), so cold that electricity flows
                through them with no resistance. CERN says that with ordinary magnets the ring would have to be about 120 kilometers around instead of 27.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>A chain of machines, in two layouts.</strong> One machine cannot do everything. CERN joins accelerators in a chain, each handing its beam on to the next, bigger one, and the
                Large Hadron Collider is fed by a chain of four. The beam enters it at 450 GeV, and the cavities raise it to 6.5 TeV, which CERN says is more than 14 times as much. The layouts are
                these. In a <em>linear</em> accelerator the beam goes from one end to the other, with a single pass of pushes, so more energy means a longer machine. In a <em>circular</em> accelerator
                the same particles go round and round and get a boost at every lap, and the limit is how strong the magnets are. Last, the particles are brought together. In a collider, two beams
                travel in opposite directions and meet head-on. In the other arrangement, one beam is fired at a target that is sitting still. Those are the two setups this section compares.
              </li>
            </ol>
            All of those pushes, added up, are what we call K, the energy of motion supplied. The machine's job is to pay in K. The collision's job is to spend it.
          </li>
          <li style={{ listStyle: 'none', marginBottom: '0.75rem' }}>
            <AcceleratorPicture />
            <AcceleratorCaption />
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>The principles behind the machine.</strong> Four ideas make it work. The first three come from textbook physics, and the facts about CERN's machines are from CERN's pages.
            <ol style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>An electric field pushes on electric charge.</strong> Gravity pulls on a ball and makes it roll down a slope. An electric field pushes on a charged particle in the same way. The
                "height of the slope" is called the voltage: the more volts a particle crosses, the more energy it gains. A particle with the charge of a proton or an electron gains 1 electron-volt for
                each volt, so crossing 16 million volts gives 16 MeV. A particle with no charge feels no push at all, which is why accelerators use charged particles such as protons and electrons.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>The push has to arrive at the right time.</strong> The field in a cavity flips between forward and backward. If the particles arrived while it pointed backward, they would be
                slowed down. So the particles travel in small groups called bunches, timed to arrive when the field points forward. CERN also says that a particle
                that is a little early or a little late is sped up or slowed a little, and that this is what sorts the beam into bunches.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>A magnet steers a moving charge, but does not speed it up.</strong> A magnet pushes a moving charged particle sideways, at a right angle to the way it is going. Think of a ball
                on a string that you swing round in a circle: the string pulls the ball sideways, and the ball's path curves, but the string does not make the ball go faster. The same is true of the
                magnets here. They bend the path into a ring. They do not add energy. CERN says that the more energy the particles carry, the stronger the magnets must be, so the higher the energy, the
                stronger the magnets or the larger the ring.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Close to the speed of light, pushes add energy but hardly any speed.</strong> Nothing with mass can reach the speed of light (Experiment 5). As the particles get close to it, each
                push still adds energy of motion, but the particles speed up less and less. CERN says only that the particles move "close to the speed of light". So the energy can be enormous: a 6.5 TeV
                proton has about 6,930 times its own rest energy (worked out here from 6.5 TeV and a proton's 938 MeV). In our unit, a K of several thousand is possible, even though the speed hardly
                changes.
              </li>
            </ol>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>How a run goes, step by step.</strong> Here is what happens in a machine like the Large Hadron Collider, from CERN's pages.
            <ol style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Fill.</strong> Protons from the bottle of hydrogen go through the chain of four smaller accelerators, which also divide them into bunches. Each beam is made of about 2,500
                bunches, and each bunch starts with about 160 billion protons.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Injection.</strong> The beams enter the big ring at 450 GeV. There are two beams, in two separate pipes, and they travel in opposite directions.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Acceleration.</strong> The cavities push the bunches round and round, 11,245 laps every second. It takes more than 10 million passes, about 20 minutes, to reach 6.5 TeV. The
                magnets have to get stronger as the energy rises.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Squeezing.</strong> Just before the beams meet, the lens magnets squeeze them to a very narrow stream. CERN compares aiming them to firing two needles from 10 kilometers apart so
                that they meet halfway.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>Collision.</strong> The two beams cross at four places, where four large detectors record what comes out. CERN's key figures give about 1.5 billion collisions every second in two of
                them, the ones called ATLAS and CMS.
              </li>
              <li style={{ marginBottom: '0.4rem' }}>
                <strong>The end of a run.</strong> When a run is over, special magnets steer the beams away to a place called the dump.
              </li>
            </ol>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Counting in rest energies, and the price tag.</strong> In this section we do not use joules or MeV. We use the rest energy of one colliding particle as our unit, and call it 1. It
            is like measuring a room in "paces" instead of meters. If your pace is 0.75 meters, a room that is 6 paces long is 4.5 meters long: only the ruler changed, and the room did not. Here is
            what "1" means for two real particles.
            <br />
            If the colliding particles were electrons, then 1 would be 0.511 MeV, 2 would be 1.022 MeV and 5 would be 2.555 MeV. If they were protons, then 1 would be 938 MeV and 5 would be about
            4,690 MeV. The pattern of the numbers is the same for both, which is why one unit is enough.
            <br />
            In this unit, <em>a mass and an energy are the same number</em>, because rest energy is stored mass. One colliding particle has a rest energy of 1 and a mass of 1. A new particle of mass
            X, counted in masses of one colliding particle, has a rest energy of X. For example, a new particle with X = 2 is twice as heavy as a colliding particle, so its rest energy is 2. And K = 5
            means that the energy of motion you supply is five times the rest energy of one colliding particle.
            <br />
            Now the <em>price tag</em>. To make a new particle of mass X, <em>X rest energies of energy must be paid</em>. It is like paying at a till. A loaf costs 2 coins: with 1 coin in your hand you
            get nothing, not half a loaf, and with enough coins you get the whole loaf. In the same way, a new particle with X = 2 costs 2. If the energy you are able to pay with is less than 2,
            nothing new appears, and if it is 2 or more, the particle can be made. The two colliding particles are <em>not</em> paid for again: they are still there afterward, each with its own rest
            energy of 1. Only the new particle has to be bought. So the books look like this. Before the collision there is 2 (the two particles) plus K. Afterward there is 2 (the same two particles)
            plus X (the new one) plus whatever energy of motion is still left over. The payment is made once, when the particle is created, and afterward the particle carries that energy in its mass.
            How much of K can really be spent on the price is the question this section is about.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Why it has to come from the collision.</strong> Energy cannot appear from nowhere. The total is the same before and after, like money moved between bank accounts. Before
            the collision there are two particles (2 rest energies of mass) and some energy of motion, K. After it, the two particles are still there (2 again), and the new particle adds X
            more. So the energy of motion is the only thing that can pay for the new particle. If it pays enough, the new particle is made. If it does not pay enough, nothing new appears and
            the particles just bounce on.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>A comparison from daily life.</strong> Rub your hands together and they get warm: energy of motion has become heat. Drop a clay ball and it lands with a thud, flattened and
            slightly warmer. A collision between particles does the same kind of thing, except that, when there is enough energy, some of the energy of motion becomes <em>new mass</em> instead
            of heat.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Why it needs so much energy.</strong> Because c² is huge, even a light particle costs a lot of energy. The energy also has to be packed into a very small space at one
            moment: CERN describes it as packing enough energy into a tiny region so that the energy can become mass. CERN's Large Hadron Collider does it with beams of protons at 6.5 TeV each
            (its 2015 to 2018 running; CERN now gives 6.8 TeV). In everyday terms that is tiny, about as much energy as a falling safety pin carries (CERN's comparison), but it is squeezed
            into a space far smaller than the head of the pin.
          </li>
        </ul>
        <EnergyBecomesMassPicture />
        <EnergyBecomesMassCaption />
      </div>

      <p style={P}>
        <strong>The practical question.</strong> You choose how much energy of motion to give the colliding particles. That amount is K. Some of it may be able to change form into the mass of a
        new particle. How much? Is it all of K, or only part of it? And does it depend on how you arrange the collision? You could fire one particle at another that is sitting still, or you
        could fire two particles at each other. In both cases the particles are given the same K. This section lets you compare the two, and you will be asked to predict which one lets more of
        K become the mass of a new particle.
      </p>
      <p style={P}>
        <strong>A few reminders from Experiment 5.</strong> A particle's rest energy, the energy it has when it is not moving, is our unit, written as 1. The mass of a system is M = √(E_total² −
        (P_total c)²), worked out from its total energy and total momentum. And a reaction can make new pieces only if the system's mass is at least the total rest mass of everything that comes
        out. That least value is called the threshold. All three are also in the "Words and formulas" panel below.
      </p>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>Some new words.</strong> Here is each one in plain language.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>Beam:</strong> a stream of particles moving the same way. <strong>Target:</strong> what the beam hits. <strong>Stationary target:</strong> a target that is at rest in the
            lab. For example, a billiard ball rolling along (the beam) hits a ball that is sitting still (the target).
          </li>
          <li>
            <strong>Collider:</strong> a machine in which two beams are sent toward each other and meet head-on.
          </li>
          <li>
            <strong>The energy of motion supplied, K:</strong> the total kinetic energy of all the moving particles in the lab, in rest energies of one colliding particle. For example, K = 3
            means the energy of motion is three times the rest energy of one particle.
          </li>
          <li>
            <strong>New particle:</strong> a particle that was not there before the collision. Here we use a made-up neutral particle of mass X, measured in masses of one colliding particle.
            The colliding particles survive unchanged.
          </li>
          <li>
            <strong>Price of a particle:</strong> the energy that must be paid to make it, equal to its mass in rest energies. A new particle of mass X costs X.
          </li>
          <li>
            <strong>The system's own observer:</strong> an observer for whom the total momentum of the system is zero. They travel along with the system as a whole, as the particle's own
            observer in Experiment 5 travelled along with a particle.
          </li>
          <li>
            <strong>Usable energy:</strong> the part of the energy of motion that can become the mass of new particles. <strong>Locked-in energy:</strong> the part tied up in the motion of the
            whole system, which cannot.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>The formulas we need.</strong> Each comes in words, with a worked example.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>The system's mass again.</strong> A particle at rest has energy 1. If it also has an energy of motion K, its total energy is 1 + K, and its momentum × c is √((1 + K)² − 1),
            because for one particle E² − (pc)² is its mass squared, which is 1. For example, take a single particle with K = 3: its energy is 4, and its momentum × c is √15 = 3.873. For a whole
            set of particles, add up the energies and the momenta (a piece moving left counts as negative), and then M = √(E_total² − (P_total c)²). For example, a set with a total energy of 5
            and a total momentum × c of 3 has M = √(25 − 9) = √16 = 4. <em>What it does not mean:</em> M is not the sum of the particles' separate masses.
          </li>
          <li>
            <strong>Usable energy:</strong> U = M − 2. In words: "the system's mass, minus the rest masses of the two colliding particles." For example, a system with M = 4 has U = 2.{' '}
            <em>What it does not mean:</em> it is not the energy of motion measured in the lab.
          </li>
          <li>
            <strong>Locked-in energy:</strong> L = K − U. In words: "what is left of the energy supplied." For example, if K = 3 and U = 2, then L = 1.
          </li>
          <li>
            <strong>The threshold:</strong> a new particle of mass X can be made only if M ≥ 2 + X. For example, a new particle of mass X = 1 needs M ≥ 3.
          </li>
        </ul>
      </div>

      <p style={P}>
        <strong>What happens.</strong> Two collisions are set up with the same energy of motion, K. In Setup A, a beam particle hits a particle that is at rest in the lab. In Setup B, two
        particles of the same kind move toward each other and meet head-on. When you press Run, the pictures play in stages:
      </p>
      <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>The lab's pictures of the two setups play together (Picture 1). The particles move toward the dashed line where they meet, and a ring flashes at the moment of the collision.</li>
        <li>
          Under each picture, the whole system (all the pieces taken together) is shown afterward as one dashed circle. If the system as a whole is moving, it has an arrow, and if it is not
          moving, it does not.
        </li>
        <li>
          Setup A is replayed, in purple, as the system's own observer sees it (Picture 2). That observer travels along with the system, so for them the total momentum is zero.
        </li>
        <li>A lower panel under Picture 2 works out the system's mass for that observer, next to the lab's, as two bars on their own scale.</li>
        <li>
          Bars then fill in. The first pair splits the energy of motion you supplied into a usable part and a locked-in part. The second pair shows each setup's system's mass next to the
          mass that a new particle of your chosen X would need.
        </li>
        <li>Finally, a table of the numbers appears, with a line for each setup saying whether the new particle can be made. After that come a few questions for you to think about.</li>
      </ol>
      <p style={P}>
        <strong>Your job.</strong> Predict first. Part 1 uses K = {partOneK} and a new particle of mass X = {partOneX}. You make two predictions: one about which setup leaves more usable
        energy, and one about what the system's own observer finds. Both must be chosen before you can press Run. You are not graded.{' '}
        <strong>Your predictions never change the pictures or the tables.</strong> They come from the physics. Your first guess is drawn on the bars in white, and your second on the system's
        own observer's picture, each with a box labelled YOUR GUESS, and both are shown again beside the results. After your first run, Part 2 lets you choose other values of K and X. Those
        choices <em>do</em> change the drawings, but not your predictions. If you want to change your predictions, press Start over.
      </p>
      <p style={{ margin: 0 }}>
        <strong>What we assume.</strong> Everything moves along one line. The two colliding particles are identical and survive unchanged. The new particle is neutral. Only energy and momentum
        are tracked, and whether a possible reaction actually happens is not modeled.
      </p>
    </div>
  )
}
