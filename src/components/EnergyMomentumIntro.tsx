import type { ReactNode } from 'react'
import { REFERENCE_ENTRIES } from './EnergyMomentumExperiment'

// Spacetime Geometry 5, Section A (energy and momentum seen by different observers), audit update of 2026-11-21. The wording is in
// docs/audit/spacetime-geometry/05-draft-wording.md (approved by the owner on 2026-11-21, "approved all defaults"). Lines that
// were approved on 2026-10-15 are reused; the two rules that gave away the prediction (the combination E² − (pc)², and the rule
// that turns the lab's numbers into the passing observer's) moved to `RulesAfterRun`, shown in Part 3 once the first run is over.

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function EnergyMomentumIntro() {
  return (
    <>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
        This chapter has three sections: <strong>A</strong> (energy and momentum seen by different observers), <strong>B</strong> (a
        collision) and <strong>C</strong> (reactions where the masses change). Section B opens when you finish A, and C when you finish
        B. If you already know a section, use its skip link.
      </p>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In earlier experiments, observers who move differently disagreed about the time and the
            distance between two events, but they all found the same value of time² − distance² (Experiment 1 of this group). This
            experiment asks the same kind of question about something else belonging to a moving thing: its <strong>energy</strong>{' '}
            and its <strong>momentum</strong>. Do observers who move differently agree on them? If not, is there something about
            them that the observers <em>do</em> agree on?
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Energy and momentum in everyday life.</strong> Before we ask whether observers agree on them, here is what the two
              words mean, using things you already know. We use slow, everyday speeds first. The experiment then shows what changes for
              very fast things.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Energy is "how much can this thing do?"</strong> A full battery can run a torch for hours, a hot cup of tea can warm
                your hands, and a rolling ball can knock over a stack of cups. Each has energy, stored in a different way: in chemicals,
                in heat, in motion. Energy is not used up. It only changes form. When you rub your hands together, the energy of your
                moving hands becomes warmth. When a car brakes, the energy of its motion becomes heat in the brakes.
              </li>
              <li>
                <strong>Momentum is "how hard is this thing to stop?"</strong> Imagine catching a rolling tennis ball. Easy. Now imagine
                catching a rolling bowling ball at the same speed. Much harder, because it has more mass. Now imagine catching that same
                tennis ball after a hard serve. Harder again, because it has more speed. Momentum grows with both. That is why a slow
                truck and a fast bicycle can both be dangerous in different ways.
              </li>
              <li>
                <strong>The two are not the same.</strong> Take a 1-kilogram ball moving at 4 meters per second. Its momentum is 1 × 4 =
                4 units. Its kinetic energy is ½ × 1 × 4² = 8 joules. Now double its speed to 8 meters per second. The momentum doubles to 8,
                but the energy grows four times, to ½ × 1 × 8² = 32 joules. So energy and momentum respond to speed in different ways, and
                that difference is what this experiment explores.
              </li>
              <li>
                <strong>Direction matters for momentum, not for energy.</strong> Two skaters of equal mass skate toward each other at the
                same speed and meet. Their momenta point in opposite directions, so they cancel and the pair ends up still. Their
                energies do not cancel: both were moving, so both had energy. Momentum has a direction. Energy does not.
              </li>
              <li>
                <strong>Both are "kept" in a collision.</strong> When two billiard balls hit, the total momentum of the two balls after the
                hit equals the total before. In the same way, the total energy is the same before and after, even if some of it turns into
                a little sound and heat.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some words we will use.</strong> Here is each one in plain language.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Particle:</strong> a very small piece of matter, such as an electron or a proton. Here we treat it as a
                single point, with no size.
              </li>
              <li>
                <strong>Observer:</strong> someone with their own ruler and synchronized clocks, as in the earlier experiments.{' '}
                <strong>The lab</strong> is at rest. <strong>A passing observer</strong> moves past the lab.{' '}
                <strong>The particle's own observer</strong> travels along with the particle, so the particle is at rest for them.
              </li>
              <li>
                <strong>The speed of light, c:</strong> about 300,000 kilometers per second. Speeds are given as a fraction of c: 0.6c
                is 60 percent of it.
              </li>
              <li>
                <strong>Time dilation factor:</strong> from Experiment 3 of the first chapter (Relativity of Time and Motion), the number √(1 − v²) that says how
                much a moving clock's ticking is slowed. For example, at 0.6c it is √(1 − 0.36) = √0.64 = 0.8, so a clock moving at
                0.6c ticks at 0.8 of the usual rate. We write D(v) for it. It is 1 for something at rest, and it gets smaller and
                smaller as the speed gets closer to c.
              </li>
              <li>
                <strong>Mass:</strong> how much matter a thing has, which you can also feel as how hard it is to get moving. A
                5-kilogram bag of sugar is harder to push than a 1-kilogram bag. In this experiment, the mass of a particle means
                the number you would find if the particle were sitting still beside you. (Some books use the word "mass"
                differently, for something that changes with speed. We do not.)
              </li>
              <li>
                <strong>Energy:</strong> the ability to make things happen, such as to heat water, to move something, or to make
                light. It comes in many forms. A moving car can dent a wall. Hot water can cook an egg. In everyday life energy is
                measured in <strong>joules</strong> (J).
              </li>
              <li>
                <strong>Kinetic energy:</strong> energy of motion. For everyday speeds it is ½ × mass × speed². For example, a
                1000-kilogram car at 20 meters per second has ½ × 1000 × 20² = 200,000 joules. This everyday formula is correct for
                slow things. The experiment shows how it changes for fast ones.
              </li>
              <li>
                <strong>Momentum:</strong> a measure of how hard a moving thing is to stop. For everyday speeds it is mass × speed.
                A 7-kilogram bowling ball rolling at 2 meters per second has 7 × 2 = 14 units; a 0.06-kilogram tennis ball flying at
                30 meters per second has 0.06 × 30 = 1.8. The heavy, slow ball is harder to stop, even though the light one moves
                faster.
              </li>
              <li>
                <strong>Rest energy:</strong> the energy a particle has when it is not moving at all, its own energy. We use it as
                our unit of energy, so a particle's rest energy is written as <strong>1</strong>. An energy of 2.5 means 2.5 times
                the particle's rest energy.
              </li>
              <li>
                <strong>Total energy:</strong> the rest energy plus the kinetic energy.
              </li>
              <li>
                <strong>A light pulse:</strong> a short flash of light. It carries energy and momentum, but it has no mass.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>The rules this experiment uses.</strong> We do not derive these here. They are the rules of special
              relativity, and the experiment lets you see what they predict. Each is read out in words, with a worked example. Two more rules are given after your first run, because they would give away what you are asked to predict.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Total energy:</strong> E = mc² ÷ D(v). In words: "the total energy is the rest energy mc² divided by the time
                dilation factor." In our units mc² = 1, so E = 1 ÷ D(v). As the speed rises, D shrinks, so the energy grows. For
                example, at 0.5c: D = √(1 − 0.25) = √0.75 = 0.866, so E = 1 ÷ 0.866 = 1.155 rest energies. At v = 0, D = 1, so E =
                mc², the rest energy. <em>What it does not mean:</em> it does not say that the particle's mass grows. The mass stays
                the number found at rest. What grows with speed is the energy.
              </li>
              <li>
                <strong>Momentum (times c):</strong> pc = (mc² ÷ D(v)) × v. In words: "the total energy multiplied by the speed." We
                multiply the momentum by c so that it has the same units as energy, and the two can be compared. In our units, pc =
                v ÷ D(v). For example, at 0.5c: pc = 0.5 ÷ 0.866 = 0.577. <em>What it does not mean:</em> it is not the everyday mass
                × speed, which is the slow-speed version of it. They agree at low speed and differ at high speed.
              </li>
              <li>
                <strong>What speed does another observer measure?</strong> v′ = (v − u) ÷ (1 − uv), where v is the particle's speed
                in the lab and u is the passing observer's speed (both fractions of c, in the same direction). In words: "it is almost
                the difference of the two speeds, but divided by a correction that keeps the result below c." For example, v = 0.6
                and u = 0.3: (0.6 − 0.3) ÷ (1 − 0.18) = 0.3 ÷ 0.82 = 0.366, not 0.3. If u = v, the result is 0: the particle's own
                observer finds it at rest. We do not derive this rule here. <em>What it does not mean:</em> it is not a plain
                subtraction, v − u, which would let speeds pass c.
              </li>
              <li>
                <strong>Light:</strong> for a light pulse, E = pc (the energy equals the momentum times c), and it always moves at c.{' '}
                <em>What it does not mean:</em> it does not mean that light has mass. For light, the combination E² − (pc)² is zero.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What happens.</strong> A particle (or, later, a light pulse) moves past the lab along a straight line. Three observers
              look at it: the lab, the particle's own observer, and a passing observer who moves along the same line. Each one measures
              the particle's energy and its momentum (times c), and the page shows those readings in three ways. Here is the order in which
              you will meet them.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Before you press Run.</strong> You see Picture 1, a map. Momentum (times c) runs across and energy runs up, so any
                reading is one point on it. Only the lab's own reading is on the map at first. Think of it like a map of a town: each
                observer's reading is a spot, and the map shows where the spots are. Your job is to choose a prediction.
              </li>
              <li>
                <strong>While it runs.</strong> The run lasts about 12 seconds. The passing observer starts at rest beside the lab and
                then speeds up smoothly to the speed Part 1 gives them (0.3c), as if a car were pulling away from a stop. The particle's
                own observer and the passing observer each add their reading to the map, and the passing observer's reading moves as
                their speed changes. The playback speed only controls how fast you watch. It does not change any number.
              </li>
              <li>
                <strong>When it has finished.</strong> Picture 2 appears. It shows the same numbers as bars, one set for each observer,
                with your guess drawn on them in white. A table then gives each number exactly. The map, the bars and the table all come
                from the same calculation, so they always agree with each other.
              </li>
              <li>
                <strong>Then it is your turn.</strong> In Part 2 you can run it again with a light pulse, or with a different speed for the
                particle or for the passing observer, and watch the readings change. In Part 3 the results are laid out with a guide to
                reading them. In Part 4 the tutor asks what you saw, goes back over your guess, and explains.
              </li>
            </ul>
          </div>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Predict first. Part 1 uses a particle moving at 0.6c in the lab, and a passing observer moving at 0.3c in
            the same direction. Choose one of the three answers, then press Run. You are not graded.{' '}
            <strong>Your prediction never changes the pictures or the tables.</strong> They come from the physics. Your guess is drawn on the
            bars in white, with a box labelled YOUR GUESS, and it is shown again beside the results. After your first run, Part 2 lets you
            choose a light pulse or another speed. Those choices <em>do</em> change the drawings, but not your prediction. If you want to
            change your prediction, press Start over.
          </p>
          <p style={{ margin: 0 }}>
            <strong>What we assume.</strong> Speeds are steady, there is no gravity, energy is in rest energies, and momentum is
            given as pc. For light, energy is in units of the lab's measurement of the pulse.
          </p>
        </div>
    </>
  )
}

// The two rules that left the introduction: shown in Part 3 after the first run (draft wording, section 6e).
export function RulesAfterRun() {
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>Now that you have run it.</strong> Two rules were left out of the introduction, because they would have given away what you
        were asked to predict. Here they are.
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>A combination of the two:</strong> E² − (pc)². In words: "square the energy, square the momentum times c, and
                subtract", the same "subtract the squares" move as in Experiment 1. For example, at 0.5c: 1.155² − 0.577² = 1.333 −
                0.333 = 1.000. The experiment asked you to predict what other observers would get. <em>What it does not mean:</em> it
                is not E² + (pc)². The minus sign matters, as it did in Experiment 1.
              </li>
              <li>
                <strong>Energy and momentum seen by a passing observer.</strong> The rule that turns the lab's times and positions
                into the passing observer's (Experiment 3 of the first chapter and Experiment 1 of this group) also turns the lab's
                energy and momentum into theirs, with energy playing the part of time, and pc the part of position. The experiment
                does this arithmetic for you and shows the result.
              </li>
      </ul>
    </div>
  )
}

export function EnergyMomentumLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/accelerators/large-hadron-collider/">CERN, "Large Hadron Collider"</Ext> (page read on 21 November
          2026; it shows no date): CERN's own page on the machine that pushes protons "to near the speed of light", with its current proton
          energy of 6.8 TeV per beam.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        The original paper behind this chapter's energy rule is at the end of Part 3, after your run. No plain-language page from NASA, ESA,
        CERN or Fermilab was found that explains energy and momentum for a general reader (searched 21 November 2026), so this page explains
        them in its own words.
      </p>
    </div>
  )
}

export function EnergyMomentumSources() {
  return (
    <div style={{ margin: '1.5rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more about where this comes from?</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.fourmilab.ch/etexts/einstein/E_mc2/www/">A. Einstein, "Does the Inertia of a Body Depend upon its Energy-Content?"</Ext>{' '}
          (1905, English text of the 1923 translation, hosted by Fourmilab, which says it is in the public domain): the original three-page paper.
          It contains the sentence "If a body gives off the energy L in the form of radiation, its mass diminishes by L/c²." It is written for
          physicists, so it is hard to read.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        This copy is not on an official host: the official Einstein Papers portal needs a subscription. The 1905 paper does not contain this
        page's pictures or its collision and reaction examples.
      </p>
    </div>
  )
}

// The collapsed "Words and formulas" box. The combination E² − (pc)² and the word "invariant" appear only after the first run, because
// they would give away the prediction.
export function energyMomentumWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const entries = REFERENCE_ENTRIES.filter((entry) => afterRun || entry.term !== 'E² − (pc)²')
  entries.push({
    term: 'Marker',
    meaning: 'a white outline (Section A) or a white tick (Section B) that stands for the answer you chose. It has no size of its own, and it does not change any bar.',
  })
  if (afterRun) {
    entries.push({
      term: 'Invariant',
      meaning: 'a number that every observer finds the same. Here, E² − (pc)² is one.',
    })
  }
  return entries
}
