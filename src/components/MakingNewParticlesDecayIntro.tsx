import type { CSSProperties, ReactNode } from 'react'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'

// Spacetime Geometry 6, Section B (decay): the introduction, its two drawings, the links and the "Words and formulas" entries.
// Audit update of 2026-11-23 (wording in docs/audit/spacetime-geometry/06-draft-wording-section-b.md, approved by the owner on 2026-11-23: "all defaults"). The introduction does not
// say how the pieces' masses compare with the parent's, and the real examples (the pion, uranium-238) are in the tutor (§12). The facts about lifetimes concern when a particle
// decays, not how heavy its pieces are.

const SECTION_NOTE: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)' }
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const LAB_COLOR = '#38bdf8'
const FLASH_COLOR = '#facc15'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }
const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  backgroundColor: '#0b1020',
}

// Section B's own list for the "Words and formulas" box. No entry names a Section A picture, guess or setup.
export const SECTION_B_REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Decay', meaning: 'a particle turning into other particles on its own, with nothing hitting it.' },
  { term: 'Parent, pieces', meaning: 'the parent is the particle before it decays. The pieces (physicists say "decay products") are what it turns into.' },
  {
    term: 'Half-life',
    meaning:
      'the time after which about half of a large number of identical particles have decayed. It cannot tell you when one particular particle will decay, only the chance. Like popcorn in a hot pan: you cannot say which kernel pops next, but you can say when about half have popped.',
  },
  { term: 'Particle', meaning: 'a very small piece of matter, such as an electron or a proton, treated here as a single point.' },
  { term: 'Observer', meaning: 'someone who measures where things are, how fast they move and how much energy they have, with their own ruler and clocks.' },
  { term: 'c', meaning: 'the speed of light, about 300,000 kilometers per second. 0.3c is 30 percent of it.' },
  {
    term: 'Rest energy and rest mass',
    meaning:
      'the energy a particle has when it is not moving. It is stored in its mass (E = mc²). Here the parent’s rest energy is the unit of energy, written 1, and each piece’s mass is a fraction r of the parent’s mass. A pulse of light has no rest mass.',
  },
  {
    term: 'Momentum',
    meaning:
      'the "amount of motion" of something. It has a direction, so a piece moving left counts as negative. In this experiment it is shown as momentum × c, which is in the same unit as energy.',
  },
  {
    term: 'Conservation of energy and momentum',
    meaning:
      'in every process the total energy after equals the total energy before, and so does the total momentum. Like a bank that moves your money from one account into two: the total stays the same.',
  },
  { term: 'Photon, pulse of light', meaning: 'a particle of light. It has no rest mass and always moves at the speed of light.' },
  {
    term: 'Alpha particle',
    meaning: 'two protons and two neutrons bound together, given off by some radioactive nuclei when they decay. (A helium nucleus is the same thing.)',
  },
  {
    term: 'Mass given up: 1 − 2r',
    meaning: 'the parent’s mass minus the sum of the pieces’ rest masses. For example, if the parent has mass 1 and the pieces’ rest masses add up to 0.8, the mass given up is 0.2.',
  },
  {
    term: 'Pieces of a decay at rest: E = ½ each, pc = √(¼ − r²)',
    meaning:
      'the parent is at rest, so the total momentum is zero, and the two equal pieces move apart with equal energies, each half the parent’s energy. For a piece, E² − (pc)² is its mass squared, r². Worked example (r = 0.3, which is not one of the buttons): pc = √(0.25 − 0.09) = 0.4, so the piece’s speed is pc ÷ E = 0.4 ÷ 0.5 = 0.8c.',
  },
  {
    term: "The system's mass: M = √(E_total² − (P_total c)²)",
    meaning:
      'worked out from the total energy and total momentum of all the particles taken together, with the same formula as in Experiment 5. Worked example: a total energy of 5 and a total momentum × c of 3 give M = √(25 − 9) = √16 = 4.',
  },
  {
    term: 'Threshold',
    meaning: 'a reaction can happen only if the system’s mass is at least the total rest mass of everything that comes out.',
  },
  { term: 'Passing observer', meaning: 'an observer who moves along the same line as the decay at a steady speed, and measures everything with their own ruler and clocks.' },
]

const P: CSSProperties = { marginTop: 0, marginBottom: '0.75rem' }

// The introduction's prose (draft sections 1a to 1d).
export function SectionBIntroduction() {
  return (
    <div style={{ marginBottom: '1.5rem', ...SECTION_NOTE }}>
      <p style={P}>
        <strong>The question.</strong> In Section A we made a new particle by smashing particles together, and we asked how much of the collision's energy could be spent. Now we run the idea
        backward. Can a particle turn into other particles on its own, with nothing hitting it? If it can, what has to stay the same, what is allowed to change, and what must the pieces be like?
      </p>
      <p style={P}>
        <strong>A particle that comes apart.</strong> Some particles do not last. After a while, with nothing touching them, they turn into other particles. This is called <em>decay</em>. The
        particle before is the <em>parent</em>, and what it turns into are the <em>pieces</em> (physicists say "decay products"). A decay is not a collision: nothing hits the parent. Think of a
        soap bubble that pops. Nothing hit it, and the pieces were not separate things waiting inside; the one thing became several. (The comparison only goes so far. A real parent is not a bag
        with a skin, and its pieces did not exist as pieces beforehand.)
      </p>
      <p style={P}>
        <strong>Decay is happening all around us.</strong> Radioactive atoms in rock, in bananas (which contain a little radioactive potassium) and in the Earth's interior are decaying all the
        time. Particle accelerators make unstable particles too, as the next paragraph explains. <strong>Different particles last for very different
        times.</strong> The Particle Data Group, the international group that collects measurements of particles, lists the neutral pion as lasting about 8.4 × 10⁻¹⁷ seconds on average. The evaluated
        nuclear data for uranium-238 give a half-life of about 4.47 billion years. Those two times differ by about 33 factors of ten, but both are decays of one thing into pieces. (Both
        figures were read on 23 November 2026 on the pages linked below.)
      </p>
      <p style={P}>
        <strong>How an accelerator makes unstable particles.</strong> The Large Hadron Collider here is the same machine that Section A described: the one with a source of protons, a pipe with almost
        nothing in it, cavities that push, magnets that steer, and two beams that meet head-on. Section A's idea is what makes it a particle factory. When two particles collide with enough energy of
        motion, some of that energy can become the mass of new particles that were not there before. CERN's "Accelerators" page says that when the particles are energetic enough, the energy becomes new
        particles (E = mc²). CERN's page on the Large Hadron Collider says that the two beams cross at four places, where four large detectors record what comes out, and its key figures give about 1.5 billion
        collisions a second in two of them (both pages read on 22 November 2026, linked below). Many of the new particles are unstable. They last only a tiny moment and then decay, with nothing hitting
        them. (That the new particles are mostly unstable is general physics, not a line on the CERN pages.) A particle that lasts a tiny fraction of a second decays long before it could reach any
        instrument, so a detector does not record the particle itself. It records the pieces that fly out. Physicists then add up the energy and momentum of the pieces they recorded, which is the
        bookkeeping of this section, to work out what came apart. Every decay in this section is one of those pieces-of-a-new-particle stories, run on its own.
      </p>
      <p style={P}>
        <strong>Why we cannot say when a single particle will decay.</strong> Each particle decays at a random moment. Think of popcorn in a hot pan: you cannot say which kernel will pop next,
        but you can say that about half will have popped after some time. For a large number of identical particles, the <em>half-life</em> is the time after which about half of them have decayed.
        For one particle, only a chance can be given. <strong>This page does not model when a decay happens, only what a decay must be like if it does.</strong>
      </p>
      <p style={P}>
        <strong>What must stay the same.</strong> Experiment 5 gave two rules that hold for every process, and decay is no exception. (1) <em>Total energy is conserved</em>: the total before equals
        the total after. (2) <em>Total momentum is conserved</em>: the total before equals the total after. Momentum is the "amount of motion" of something, and it has a direction. If the parent
        sits still, its momentum is zero, so the pieces' momenta must also add up to zero. Two ice skaters standing still back to back and pushing off each other show it: they glide in opposite
        directions, and the "oomph" of one cancels the other's. In a decay at rest, two equal pieces move apart in opposite directions, with equal energies. As in Experiment 5, we call each piece's
        energy E and its momentum multiplied by c "pc".
      </p>
      <p style={P}>
        <strong>Our unit.</strong> In this section the parent's rest energy is 1. Each piece's mass, <em>r</em>, is a fraction of the parent's mass. For example, r = 0.25 means each piece has a
        quarter of the parent's mass. The case r = 0 means two pulses of light, which have no mass.
      </p>
      <p style={P}>
        <strong>Why this is worth doing.</strong> Decay is how nature reads the bookkeeping rules of Experiment 5. It tells which changes can happen and which cannot, and the same bookkeeping is
        how physicists identify particles in a detector: they add up the energy and momentum of the pieces and work out the system's mass.
      </p>
    </div>
  )
}

// The formulas, "What happens", "Your job" and "What we assume" (draft sections 1c and 1d). Shown below the pictures of the introduction.
export function SectionBFormulasAndJob() {
  return (
    <div style={{ marginBottom: '2rem', ...SECTION_NOTE }}>
      <div style={P}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>The formulas we need.</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>The pieces' energy.</strong> The parent has a total energy of 1 and a total momentum of 0. Two equal pieces that move apart in opposite directions must share the energy
            equally, so each has E = ½.
          </li>
          <li>
            <strong>The pieces' momentum.</strong> For one piece, E² − (pc)² is its mass squared, r² (Experiment 5). With E = ½ this gives pc = √(¼ − r²). A piece's speed is pc ÷ E. <em>What it does
            not mean:</em> it does not say that a decay will happen, only what the pieces would be like if it did.
          </li>
          <li>
            <strong>Mass given up:</strong> the parent's mass minus the sum of the pieces' rest masses, 1 − 2r.
          </li>
          <li>
            <strong>The system's mass of the pieces:</strong> M = √(E_total² − (P_total c)²), as in Experiment 5.
          </li>
        </ul>
      </div>
      <p style={P}>
        <strong>What happens.</strong> A parent particle sits at rest in the lab, and then it decays into two equal pieces. When you press Run, the pictures play in stages: (1) the lab's view,
        where the parent splits and the pieces move apart, each labelled with its energy, its momentum × c and its rest mass; (2) the same decay as a passing observer measures it, an observer who
        moves along the same line at +0.3c; (3) the mass ledger, a set of bars that compares the masses. A decay is shown only if energy and momentum allow it.
      </p>
      <p style={P}>
        <strong>Your job.</strong> Predict first. Part 1 uses r = 0.25 and a passing observer at +0.3c. You make two predictions: how the masses of the two pieces added up compare with the
        parent's mass, and whether the passing observer finds the same system's mass of the pieces as the lab. Both must be chosen before you can press Run. You are not graded.{' '}
        <strong>Your predictions never change the pictures or the tables.</strong> They come from the physics. Your first guess is drawn on the ledger's grey bar in white and your second on the
        passing observer's bar, each with a box labelled YOUR GUESS, and both are shown again beside the results. After your first run, Part 2 lets you choose other values of r and other
        speeds. Those choices <em>do</em> change the drawings, but not your predictions. If you want to change your predictions, press Start over.
      </p>
      <p style={{ margin: 0 }}>
        <strong>What we assume.</strong> Everything moves along one line. The parent decays into exactly two equal pieces. Only energy and momentum are tracked, and whether and when a decay
        happens is not modeled.
      </p>
    </div>
  )
}

// ---- Picture B1: our own drawing. It shows no masses and no comparison: every circle has the same size, which means nothing here.
export function DecayBookkeepingPicture() {
  return (
    <svg
      viewBox="0 0 520 330"
      role="img"
      aria-label="A drawing of the bookkeeping of a decay. On the left a parent at rest, with a total momentum of zero. In the middle a yellow ring marks the decay, which nothing hit. On the right two pieces of the same drawn size move apart, one with momentum minus p and one with plus p. Underneath, two bars of equal length show a total energy of 1 before and 1 after, and a line says that the total momentum after is plus p minus p, which is 0."
      style={SVG_STYLE}
    >
      <defs>
        <marker id="decay-intro-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LAB_COLOR} />
        </marker>
      </defs>
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        A decay: nothing hits the parent
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        An illustration of the bookkeeping. The sizes of the circles mean nothing here.
      </text>

      <text x="70" y="72" fontSize="11" fontWeight="bold" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        Before
      </text>
      <circle cx="70" cy="118" r="20" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <text x="70" y="156" fontSize="10" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        the parent, at rest
      </text>
      <text x="70" y="169" fontSize="10" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        total momentum: 0
      </text>

      <circle cx="240" cy="118" r="26" fill="none" stroke={FLASH_COLOR} strokeWidth="3" />
      <circle cx="240" cy="118" r="14" fill="none" stroke={FLASH_COLOR} strokeWidth="2" opacity="0.6" />
      <text x="240" y="72" fontSize="11" fontWeight="bold" textAnchor="middle" fill={FLASH_COLOR} style={HALO}>
        The decay
      </text>
      <text x="240" y="166" fontSize="10" textAnchor="middle" fill={FLASH_COLOR} style={HALO}>
        (nothing hit it)
      </text>

      <text x="410" y="72" fontSize="11" fontWeight="bold" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        After
      </text>
      <line x1="360" y1="118" x2="320" y2="118" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#decay-intro-arrow)" />
      <circle cx="378" cy="118" r="20" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <circle cx="446" cy="118" r="20" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <line x1="466" y1="118" x2="506" y2="118" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#decay-intro-arrow)" />
      <text x="360" y="156" fontSize="10" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        a piece: −p
      </text>
      <text x="466" y="156" fontSize="10" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        a piece: +p
      </text>

      <text x="12" y="204" fontSize="11" fontWeight="bold" fill={TEXT_COLOR}>
        The books
      </text>
      <text x="12" y="226" fontSize="10" fill={MUTED_COLOR}>
        total energy before: 1
      </text>
      <rect x="160" y="216" width="200" height="12" fill={LAB_COLOR} />
      <text x="12" y="250" fontSize="10" fill={MUTED_COLOR}>
        total energy after: 1
      </text>
      <rect x="160" y="240" width="200" height="12" fill={LAB_COLOR} />
      <text x="12" y="278" fontSize="10" fill={MUTED_COLOR}>
        total momentum after:
      </text>
      <line x1="236" y1="274" x2="196" y2="274" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#decay-intro-arrow)" />
      <line x1="238" y1="274" x2="278" y2="274" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#decay-intro-arrow)" />
      <text x="292" y="278" fontSize="10" fill={MUTED_COLOR}>
        +p − p = 0, the same as before
      </text>
      <text x="12" y="312" fontSize="10" fill={MUTED_COLOR}>
        Both bars have the same length: whatever the pieces are like, the totals must match.
      </text>
    </svg>
  )
}

export function DecayBookkeepingLead() {
  return (
    <p style={{ ...SECTION_NOTE, marginTop: 0, marginBottom: '0.75rem' }}>
      <strong>About the next drawing: "A decay: nothing hits the parent".</strong> It shows the two rules that every decay must obey, the ones of the paragraph "What must stay the same" above. In the top
      half you will see, from left to right, a parent at rest, the moment it decays and two pieces moving apart. In the bottom half, under the heading "The books", you will see two bars for the total
      energy before and after, and a line for the total momentum after. It is a sketch with no real numbers, and the circles are all drawn the same size on purpose, so the sizes tell you nothing. A caption
      under it names every shape and says what to look for.
    </p>
  )
}

export function DecayBookkeepingCaption() {
  return (
    <div style={{ ...SECTION_NOTE, marginTop: '1rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this drawing.</strong> It is an illustration of the rules a decay must obey, so it has no real numbers and shows no setup. The top half reads from left to right as a
        story. The bottom half is the bookkeeping.
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The sky-blue circle on the left</strong> is the parent, before it decays. It has no arrow because it is at rest, so its total momentum is 0.
        </li>
        <li>
          <strong>The yellow rings, "The decay".</strong> The moment the parent comes apart. Nothing arrives from outside: it is not a collision.
        </li>
        <li>
          <strong>The two sky-blue circles on the right</strong> are the pieces. An arrow shows which way a piece moves, and a longer arrow would mean a faster piece. "−p" is a momentum to the
          left and "+p" a momentum to the right. <em>The circles are all drawn the same size, and that size means nothing</em>: the drawing says nothing about how heavy the pieces are.
        </li>
        <li>
          <strong>The two bars "total energy before" and "total energy after".</strong> Their length is the total energy. Both are 1, in the parent's rest energies (our unit).
        </li>
        <li>
          <strong>The two small arrows under "total momentum after".</strong> The pieces' momenta, equal and opposite.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          {
            look: 'the two bars of equal length',
            means: 'the total energy is 1 before the decay and 1 after it',
            matters: 'every decay must obey this rule, so it is the first check on whatever the pieces turn out to be like',
          },
          {
            look: 'the "−p" and "+p" arrows',
            means: 'the two momenta are equal and opposite, so they add up to 0',
            matters: 'the parent had no momentum, so the pieces must have none between them, just as two skaters who push off from rest move apart in opposite directions',
          },
          {
            look: 'the yellow ring',
            means: 'nothing comes in from outside to cause the decay',
            matters: 'a decay is not a collision, which is why the energy that the pieces have must have been in the parent all along',
          },
        ]}
      />
      <WhereFrom>
        <strong>Calculated here:</strong> nothing. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the whole sketch. It illustrates the rules and shows no real or
        calculated numbers.
      </WhereFrom>
    </div>
  )
}

// A short lead-in above a drawing, so the learner knows what to expect from it (added 2026-11-23 at the owner's request). It names the drawing, says what will be seen in order and what
// the drawing is for, and gives no answer to the predictions (§12).
export function CollisionToDecayLead() {
  return (
    <p style={{ ...SECTION_NOTE, marginTop: 0, marginBottom: '0.75rem' }}>
      <strong>About the next drawing: "From a collision to a decay".</strong> It follows one unstable particle from the moment it is made to the moment a detector records its pieces, which is the story of the
      paragraph "How an accelerator makes unstable particles" above. You will see three steps from top to bottom: two beams meeting head-on, a new particle appearing, and that particle decaying
      into pieces that fly out to the detector. It is a sketch with no numbers, so it shows the order of events and not sizes or speeds. A caption under it names every shape and says what to look for.
    </p>
  )
}

export function LastingTimesLead() {
  return (
    <p style={{ ...SECTION_NOTE, marginTop: 0, marginBottom: '0.75rem' }}>
      <strong>About the next drawing: "How long do particles last?"</strong> Different particles last for very different times, and this drawing puts two of them on one ruler so that you can see how different.
      You will see a ruler of times in seconds, with a mark for the neutral pion on the left, one year in the middle and uranium-238 on the right. Each step to the right on the ruler is ten times longer than
      the one before, so a single ruler can hold a tiny fraction of a second and billions of years together. The two marks come from published measurements, and their positions are calculated here. The drawing
      is about <em>when</em> particles decay, not about what they decay into. A caption under it explains the ruler and says what to look for.
    </p>
  )
}

// ---- Picture B1b: from a collision to a decay. Our own drawing of how an accelerator makes an unstable particle and how a detector sees its pieces. It shows no masses and no
// comparison: every circle has a size that means nothing, and no number appears (§12).
const NEW_COLOR = '#4ade80'
const DETECTOR_COLOR = '#94a3b8'

export function CollisionToDecayPicture() {
  return (
    <svg
      viewBox="0 0 520 330"
      role="img"
      aria-label="A drawing of how an accelerator makes an unstable particle. Inside a dashed box that stands for the detector, two beam particles meet head-on and a yellow ring marks the collision. Below, a new unstable particle appears, then decays, and its two pieces fly out to the grey bars of the detector, which records them. A line underneath says that physicists add up the energy and momentum of the recorded pieces."
      style={SVG_STYLE}
    >
      <defs>
        <marker id="collision-decay-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LAB_COLOR} />
        </marker>
      </defs>
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        From a collision to a decay
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        An illustration. It has no numbers, and the circles' sizes mean nothing.
      </text>

      <rect x="64" y="50" width="392" height="236" rx="12" fill="none" stroke={DETECTOR_COLOR} strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="74" y="66" fontSize="10" fill={DETECTOR_COLOR}>
        The detector surrounds the collision point
      </text>

      <text x="260" y="88" fontSize="11" fontWeight="bold" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        1. Two beams meet head-on
      </text>
      <circle cx="40" cy="120" r="12" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <line x1="56" y1="120" x2="214" y2="120" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#collision-decay-arrow)" />
      <circle cx="480" cy="120" r="12" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <line x1="464" y1="120" x2="306" y2="120" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#collision-decay-arrow)" />
      <circle cx="260" cy="120" r="24" fill="none" stroke={FLASH_COLOR} strokeWidth="3" />
      <circle cx="260" cy="120" r="13" fill="none" stroke={FLASH_COLOR} strokeWidth="2" opacity="0.6" />
      <text x="260" y="162" fontSize="10" textAnchor="middle" fill={FLASH_COLOR} style={HALO}>
        the collision: some energy of motion becomes mass
      </text>

      <text x="260" y="196" fontSize="11" fontWeight="bold" textAnchor="middle" fill={NEW_COLOR} style={HALO}>
        2. A new, unstable particle appears and lasts a tiny moment
      </text>
      <circle cx="260" cy="228" r="16" fill={NEW_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <circle cx="260" cy="228" r="26" fill="none" stroke={FLASH_COLOR} strokeWidth="2" strokeDasharray="4 3" />
      <line x1="236" y1="228" x2="176" y2="228" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#collision-decay-arrow)" />
      <circle cx="160" cy="228" r="9" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <line x1="284" y1="228" x2="344" y2="228" stroke={LAB_COLOR} strokeWidth="2.5" markerEnd="url(#collision-decay-arrow)" />
      <circle cx="360" cy="228" r="9" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <line x1="76" y1="210" x2="76" y2="246" stroke={DETECTOR_COLOR} strokeWidth="5" />
      <line x1="444" y1="210" x2="444" y2="246" stroke={DETECTOR_COLOR} strokeWidth="5" />
      <text x="260" y="266" fontSize="10" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        3. It decays, and its pieces fly out and are recorded by the detector
      </text>

      <text x="12" y="310" fontSize="10" fill={MUTED_COLOR}>
        Physicists add up the energy and momentum of the recorded pieces: the bookkeeping of this section.
      </text>
    </svg>
  )
}

export function CollisionToDecayCaption() {
  return (
    <div style={{ ...SECTION_NOTE, marginTop: '1rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this drawing.</strong> It is an illustration of how an accelerator such as the Large Hadron Collider, the machine of Section A, makes an unstable particle and how a detector
        sees it. It reads from the top to the bottom, in three steps. It has no real numbers, and the circles' sizes mean nothing.
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The dashed box, "The detector".</strong> A detector is a large instrument built around the place where the beams collide, to record what comes out of the collision. In the real
          machine it is made of many layers, which this sketch shows as one box.
        </li>
        <li>
          <strong>The two sky-blue circles with long arrows (step 1).</strong> The two beams, coming from opposite sides, as in Section A. An arrow shows which way a particle moves.
        </li>
        <li>
          <strong>The yellow rings in the middle (step 1).</strong> The collision.
        </li>
        <li>
          <strong>The green circle (step 2).</strong> A new particle, made in the collision from some of its energy of motion, as in Section A. Green means "new". Its dashed yellow ring shows that it
          is about to decay: it lasts only a tiny moment.
        </li>
        <li>
          <strong>The two small sky-blue circles with arrows pointing away from the green one (step 3).</strong> The pieces of the decay.
        </li>
        <li>
          <strong>The two grey bars at the edge of the box.</strong> Parts of the detector, which record the pieces when they arrive. The detector does not record the green particle: it decays too
          soon to get there.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          {
            look: 'the yellow rings where the two beams meet',
            means: 'a collision of two particles with enough energy of motion can make a new particle, one that was not there before',
            matters: 'this is how accelerators can produce particles that do not exist in everyday matter, which is the idea of Section A',
          },
          {
            look: 'the green circle and its dashed ring',
            means: 'the new particle is unstable: it lasts a tiny moment, and then it decays with nothing hitting it',
            matters: 'it is the decay that this section is about, and it is what makes the next point necessary',
          },
          {
            look: 'the grey bars on the two sides',
            means: 'the detector records the pieces that fly out, not the particle that decayed',
            matters: 'so physicists learn about the decayed particle from the energy and momentum of its pieces, which is why the bookkeeping of this section is how particles are identified',
          },
        ]}
      />
      <WhereFrom>
        <strong>Calculated here:</strong> nothing. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the whole sketch. The facts it illustrates (energy becoming new
        particles, the four detectors) are on the CERN pages linked below. A real detector is far larger and has many layers.
      </WhereFrom>
    </div>
  )
}

// ---- Picture B2: how long particles last, on a ruler where each step to the right is ten times longer. The two marks are the two published figures; the positions are
// calculated here from them.
const LOG_MIN = -17.2
const LOG_MAX = 17.4
const RULER_LEFT = 40
const RULER_RIGHT = 480
function rulerX(log10Seconds: number): number {
  return RULER_LEFT + ((log10Seconds - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (RULER_RIGHT - RULER_LEFT)
}
const PION_MEAN_LIFE_SECONDS = 8.43e-17 // Particle Data Group listing, read 2026-11-23
const SECONDS_PER_YEAR = 365.25 * 24 * 3600
const URANIUM_238_HALF_LIFE_YEARS = 4.468e9 // NNDC (Browne and Tuli, 2007), read 2026-11-23

export function LastingTimesPicture() {
  const pionX = rulerX(Math.log10(PION_MEAN_LIFE_SECONDS))
  const uraniumX = rulerX(Math.log10(URANIUM_238_HALF_LIFE_YEARS * SECONDS_PER_YEAR))
  const yearX = rulerX(Math.log10(SECONDS_PER_YEAR))
  const ticks = [-15, -10, -5, 0, 5, 10, 15]
  return (
    <svg
      viewBox="0 0 520 250"
      role="img"
      aria-label="A ruler of times in seconds, where each step to the right is ten times longer. A mark on the far left is the neutral pion, which lasts about 8.4 times 10 to the minus 17 seconds on average. A mark in the middle is one year. A mark at the far right is uranium-238, with a half-life of about 4.47 billion years."
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        How long do particles last?
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        A ruler of times in seconds. Each step to the right is 10 times longer than the one before.
      </text>
      <line x1={RULER_LEFT} y1="130" x2={RULER_RIGHT} y2="130" stroke={MUTED_COLOR} strokeWidth="2" />
      {ticks.map((k) => (
        <g key={k}>
          <line x1={rulerX(k)} y1="124" x2={rulerX(k)} y2="136" stroke={MUTED_COLOR} strokeWidth="1.5" />
          <text x={rulerX(k)} y="152" fontSize="9" textAnchor="middle" fill={MUTED_COLOR}>
            {k === 0 ? '1 s' : `10^${k} s`}
          </text>
        </g>
      ))}

      <circle cx={pionX} cy="130" r="7" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <line x1={pionX} y1="123" x2={pionX} y2="92" stroke={LAB_COLOR} strokeWidth="1.5" />
      <text x={pionX - 4} y="78" fontSize="11" fontWeight="bold" fill={LAB_COLOR} style={HALO}>
        The neutral pion
      </text>
      <text x={pionX - 4} y="90" fontSize="10" fill={LAB_COLOR} style={HALO}>
        mean life 8.43 × 10^−17 s
      </text>

      <circle cx={yearX} cy="130" r="5" fill="#cbd5e1" stroke="#0b1020" strokeWidth="1.5" />
      <line x1={yearX} y1="137" x2={yearX} y2="180" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x={yearX} y="194" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#cbd5e1" style={HALO}>
        one year
      </text>

      <circle cx={uraniumX} cy="130" r="7" fill={FLASH_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <line x1={uraniumX} y1="123" x2={uraniumX} y2="92" stroke={FLASH_COLOR} strokeWidth="1.5" />
      <text x={uraniumX + 4} y="78" fontSize="11" fontWeight="bold" textAnchor="end" fill={FLASH_COLOR} style={HALO}>
        Uranium-238
      </text>
      <text x={uraniumX + 4} y="90" fontSize="10" textAnchor="end" fill={FLASH_COLOR} style={HALO}>
        half-life 4.47 billion years
      </text>

      <text x="12" y="232" fontSize="10" fill={MUTED_COLOR}>
        From the left mark to the right mark is about 33 steps of ten.
      </text>
    </svg>
  )
}

export function LastingTimesCaption() {
  return (
    <div style={{ ...SECTION_NOTE, marginTop: '1rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this drawing.</strong> It is a ruler of times, in seconds. A ruler like this is called a <em>log ruler</em>: instead of equal steps of one second, each step to the right
        is ten times longer than the one before. That is the only way to show very short and very long times together. "10^−15 s" means 0.000000000000001 seconds, "1 s" is one second, and "10^15
        s" means 1 followed by 15 zeros of seconds.
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The sky-blue dot on the far left, "The neutral pion".</strong> A particle made in collisions. Its <em>mean life</em>, the average time it lasts, is 8.43 × 10^−17 seconds
          (Particle Data Group listing, read on 23 November 2026).
        </li>
        <li>
          <strong>The grey dot, "one year".</strong> About 31.6 million seconds, shown so that you can find your way on the ruler.
        </li>
        <li>
          <strong>The yellow dot on the far right, "Uranium-238".</strong> A nucleus found in rock. Its <em>half-life</em>, the time for half of a large number of identical nuclei to decay, is
          4.468 billion years (the nuclear data evaluation of Browne and Tuli, 2007, on the NNDC site, read on 23 November 2026).
        </li>
        <li>
          <strong>A mean life and a half-life</strong> are two slightly different ways of saying "how long" (a half-life is the mean life times 0.693). They differ by less than a factor of two,
          which is invisible on this ruler.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          {
            look: 'the gap between the sky-blue dot and the yellow dot',
            means: 'about 33 steps of ten: a pion lasts an unimaginably short time, and a uranium-238 nucleus lasts billions of years, roughly 10^33 times longer',
            matters: 'different particles decay at very different speeds, but the rules of this section (energy and momentum conserved) apply to both',
          },
          {
            look: 'the words "mean life" and "half-life"',
            means: 'a decay time is an average or a half, not a promise for one particle',
            matters: 'a single particle decays at a random moment, which is why this page does not model when a decay happens, only what a decay must be like if it does',
          },
        ]}
      />
      <WhereFrom>
        <strong>Measured:</strong> the pion's mean life (Particle Data Group) and uranium-238's half-life (NNDC). <strong>Calculated here:</strong> the positions on the ruler and the number of
        steps between the dots. <strong>Imagined for the question:</strong> nothing.
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

// "Want to know more?" above Part 1 (draft section 7). Every page was fetched and read on 2026-11-23, through a summary of the page, before it was linked. The two Particle Adventure
// pages and the CERN antimatter page are in the tutor's explanation instead (they state the answer to the first prediction).
export function MakingNewParticlesDecayLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.epa.gov/radiation/radiation-basics">US EPA, "Radiation Basics"</Ext> (plain language; page read on 23 November 2026, "last updated September 2, 2026"): a short overview of alpha,
          beta and gamma radiation. It says an alpha particle is made of two protons and two neutrons from the atom's nucleus. It does not describe a nucleus turning into a lighter nucleus.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.nrc.gov/reading-rm/basic-ref/students/science-101/what-are-different-types-of-radiation.html">US NRC, "What are the different types of radiation?"</Ext> (a student page; read
          on 23 November 2026, dated September 8, 2026): alpha particles are the heaviest radiation particles, and they do not pass through skin. It gives no energies or decay equations.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.nrc.gov/about-nrc/radiation/health-effects/radiation-basics.html">US NRC, "Radiation Basics"</Ext> (plain language; read on 23 November 2026, no date shown): what radiation is and
          the main types, and that alpha particles come from uranium, thorium and radium.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>The machine that makes unstable particles (the one of Section A)</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/accelerators">CERN, "Accelerators"</Ext> (plain language; page read on 22 November 2026, no date shown): when the particles are energetic enough, the energy
          becomes new particles (E = mc²), and colliders make head-on collisions.
        </li>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/accelerators/large-hadron-collider/">CERN, "The Large Hadron Collider"</Ext> (mixed level; page read on 22 November 2026, no date shown): how the two beams
          are made to collide, and the four large detectors that record what comes out. Its key figures include about 1.5 billion collisions a second in two of them.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>The measurements behind this page's real figures</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://pdglive.lbl.gov/Particle.action?node=S009">Particle Data Group, the neutral pion</Ext> (a data listing, technical; read through a summary on 23 November 2026, shown as the "2026
          Release"): the measured mass, mean life and ways of decaying of this particle.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.nndc.bnl.gov/nudat3/decaysearchdirect.jsp?nuc=238U&unc=nds">NNDC (Brookhaven National Laboratory), NuDat 3: the decay of uranium-238</Ext> (technical; read through a
          summary on 23 November 2026; based on the evaluation by Browne and Tuli, Nuclear Data Sheets, 2007): the measured half-life and decay energies of this nucleus.
        </li>
        <li style={linkItem}>
          <Ext href="https://se.copernicus.org/articles/1/5/2010/">Davies and Davies (2010), "Earth's surface heat flux", Solid Earth 1, 5–24</Ext> (the paper; technical; abstract read on 23 November 2026): how
          much heat the Earth gives off in total, 47 ± 2 trillion watts, from 38,347 measurements.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/1909.02257">Borexino collaboration (2020), "Comprehensive geoneutrino analysis with Borexino", Physical Review D 101, 012009</Ext> (the paper; technical; the first third
          read on 23 November 2026): an estimate of how much of that heat comes from radioactive decay inside the Earth. It depends on models, and the paper says so.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        No plain-language page from CERN, Fermilab, NASA or another official source was found, and read, that explains what a decay is without also giving away the answer to the first prediction, so
        this page explains it in its own words, and the plainest pages found are in the tutor's explanation (searched 23 November 2026). No plain official page on E = mc², on the neutral pion's decay,
        on how an alpha particle's energy turns into heat, or on how much of the Earth's heat is radioactive was found and read either. Pages that could not be read (an error, a login, or a file
        that gave no text) are not linked: the KamLAND paper in Nature Geoscience, the NRC glossary entry on alpha particles and the IAEA chart of nuclides. The formulas used here are the ones of
        Experiment 5.
      </p>
    </div>
  )
}

// Links shown in the tutor's explanation, after the learner has predicted and seen the run.
export function MakingNewParticlesDecayTutorLinks() {
  return (
    <div style={{ fontSize: '0.875rem', color: '#333', marginTop: '0.5rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Want to know more?</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://particleadventure.org/weak.html">The Particle Adventure, "Weak"</Ext> (plain to mixed; read through a summary on 23 November 2026, no date shown; the page does not state its
          publisher): why heavy particles decay into lighter ones, with no collision.
        </li>
        <li style={linkItem}>
          <Ext href="https://particleadventure.org/mm.html">The Particle Adventure, "Missing mass"</Ext> (plain to mixed; read through a summary on 23 November 2026, no date shown; same note about the
          publisher): Einstein's mass-energy idea applied to a uranium decay.
        </li>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/physics/antimatter">CERN, "Antimatter"</Ext> (mixed level; read through a summary on 23 November 2026; 2026 copyright, no article date): what happens when antimatter
          meets matter, and mass becomes photons. It does not write out E = mc².
        </li>
      </ul>
    </div>
  )
}
