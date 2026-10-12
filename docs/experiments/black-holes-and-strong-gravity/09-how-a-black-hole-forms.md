# Black Holes and Strong Gravity — Experiment 9: How a Black Hole Forms — What Can Hold Up a Dead Star's Core?

**Status: APPROVED by the owner on 2026-10-12, with Decisions 2, 5, 8 and 9 taken as Claude's recommended defaults, and Decision 10's recommended textbook check of the unchecked figures still to be done before the physics step (the white dwarf's size formula, Decision 4, in particular). Proposed by Claude on 2026-10-12 per `CLAUDE.md` §23 Stages 1–3. Nothing is implemented; to be built one step at a time (§6). On 2026-10-12 the owner chose to add "how a black hole forms" to this group as its own experiment (Option B), in birth-then-end order: this is Experiment 9, and Hawking radiation (not yet proposed) is planned as Experiment 10. The owner said a lot of theory is acceptable as long as it is "stated, not derived". On 2026-10-12 the owner agreed with Claude's recommended defaults for Decisions 1, 3, 4, 6 and 7 below (the five listed in Claude's summary message); Decisions 2, 5, 8, 9 and 10 are still on their defaults and not yet answered. The owner then approved the specification as a whole. Learner-facing wording is subject to the owner's line-by-line review when it is drafted (§28.1).**

---

## Overview

Experiment 1 asked how small an object must be squeezed to become a black hole, and answered with the horizon radius, `r_s = 2GM/c²`. It said plainly that it did not model what could do the squeezing, or what could stop it. Experiment 1 also noticed that a neutron star is only about 3 times too big to be a black hole. This experiment asks the question that follows: **in nature, what does the squeezing, and what can stop it?**

The setting is the dead core of a star. When a star runs out of fuel, nothing is left to push outward against its own gravity, so the core is squeezed. What can hold it up? The answer has three steps:

1. **Electrons.** Electrons cannot all be crowded into the same state, so squeezing them makes them push back. This holds up a **white dwarf**, a dead star about as wide as the Earth. But there is a largest mass this can hold up, about 1.4 Suns.
2. **Neutrons.** Beyond that, electrons and protons are squeezed together into neutrons, and neutrons push back in the same way. This holds up a **neutron star**, only about 12 km across. But it, too, has a largest mass, somewhere between about 2 and 3 Suns. Nobody knows it exactly.
3. **Nothing known.** Beyond that, no known pressure can hold the core up. It collapses until it is inside its own horizon: a **black hole**.

The new idea is one thing: **a dead star's core is held up only by pressures that run out at certain masses, about 1.4 Suns for electrons and about 2 to 3 Suns for neutrons, and above that nothing known stops the squeeze.**

The learner picks the mass of a dead core and runs the experiment. A ladder shows which of the three the core is, with the neutron star's limit drawn as an uncertain zone, since it is not settled. A second picture shows how big the held-up core is compared with its own horizon: a heavier white dwarf is *smaller*, a neutron star is only a few times wider than its horizon, and above the limit there is nothing left to hold it.

The experiment is a **thought experiment** about the end state of a dead core. It does not follow the star's life, the supernova explosion, or what happens inside the horizon; those are stated, not modeled.

---

## Learning Objective

After this experiment, the learner should understand:

1. **A dead star's core needs something to hold it up against its own gravity.** Once the fuel is gone, only a push that comes from squeezing particles together remains.
2. **Electrons hold up a white dwarf, and the push has a limit.** No two electrons can occupy the same state (stated, not derived), so crowding them forces them to move faster, and they push back (called degeneracy pressure). A white dwarf is about Earth-sized (several thousand kilometers). A heavier white dwarf is *smaller*, because more mass squeezes the electrons tighter before their push balances gravity. Its size shrinks toward zero as its mass approaches about 1.4 Suns, the **Chandrasekhar limit**. Beyond that, electrons cannot hold it.
3. **Neutrons hold up a neutron star, and its push has a limit too.** Squeezed harder still, electrons and protons merge into neutrons, which push back in the same way. A neutron star is about 12 km across (a round value; the real radius is not settled). Its largest mass is not known exactly: neutron stars of about 2.1 Suns are known, and the theory says the limit is about 3 Suns at most. The experiment shows this range as an uncertain zone.
4. **Above that, nothing known holds the core up.** It collapses until it is inside its own horizon, whose radius is `r_s = 2GM/c²` from Experiment 1: about 8.9 km for 3 Suns, 14.8 km for 5, and 29.5 km for 10. This is a black hole.
5. **The heavier the core, the closer it gets to its own horizon.** Compare the held-up core's radius with its horizon radius: for a 0.6-Sun white dwarf, about 4,600 times as wide; for a 1.4-Sun neutron star, about 2.9 times (as in Experiment 1); for a neutron star of 3 Suns, if one can exist, only about 1.35 times. A black hole is what is left when that ratio reaches below 1.
6. **What is settled and what is not.** The white dwarf's limit is well established. The neutron star's limit is a range, because the matter inside a neutron star is not fully understood. Which stars end up as which is also not settled (the experiment names this, and does not model it).
7. What the experiment does not say: how a star gets to the end of its life, the supernova explosion, what happens inside the horizon, black holes that form some other way (from mergers, or at the start of the universe), and what the final center of a black hole is.

---

## Physical Situation

A dead star's core of a chosen mass `M`, in solar masses, which has run out of fuel and has cooled. It is imagined at rest and not spinning, and the experiment asks what, if anything, can hold it up. The core is one of four things:

| Core mass | What holds it up | Result |
|---|---|---|
| below about 1.4 Suns | electrons (degeneracy pressure) | a **white dwarf** |
| from about 1.4 up to about 2 Suns | neutrons | a **neutron star** |
| from about 2 to about 3 Suns | not known: neutrons might hold it, or nothing might | **uncertain** (a neutron star or a black hole) |
| above about 3 Suns | no known pressure | a **black hole** |

### The statements the model uses (given, not derived)

All of these are standard results, stated here and not derived (deriving them needs quantum mechanics and general relativity). They were checked on 2026-10-12 against search results (Wikipedia and arXiv papers) and not against the original papers.

- **The Chandrasekhar limit:** about **1.44 Suns** (called 1.4 in the experiment). It depends slightly on what the white dwarf is made of, and 1.44 is for the usual case of about two nucleons per electron.
- **The white dwarf's radius:** the model's non-relativistic form is `R ≈ 0.012 R☉ × (M ÷ M☉)^(−1/3)`, from the white dwarf's electron gas (checked), so the radius *falls as the mass rises*. Near the limit the electrons move at close to the speed of light, and the radius falls to zero at the limit (checked in words; the exact formula was **not** found in a source). The experiment joins the two with `R = 0.012 R☉ × (M ÷ M☉)^(−1/3) × √(1 − (M ÷ 1.44 M☉)^(4/3))`, which is Claude's reading of the standard approximate form and **has not been checked against a source** (Decision 4). `R☉` is the Sun's radius, 695,700 km.
- **The neutron star's radius:** a round **12 km** for every neutron star, as in Experiment 1 (measured values are about 12 to 13 km, with an uncertainty of about 1 km). Real radii change a little with mass; the model ignores this.
- **The neutron star's largest mass (the TOV limit):** not known exactly. The heaviest neutron star measured reliably is about 2.08 Suns. Theory puts the limit between about 2.2 and 2.9 Suns, up to about 3. The model uses **about 2 Suns** as the top of the sure zone, **about 3 Suns** as the bottom of the sure black hole zone, and shows what lies between as uncertain (Decision 3).
- **The horizon radius:** `r_s = 2GM/c²`, about 2.953 km per Sun, **reused from Experiment 1**.

### Illustrative results (computed in a feasibility check on 2026-10-12, in a scratch script outside the project; the tests will check them)

| Core mass | Result | Horizon radius | Radius of the held-up core | Core radius ÷ horizon radius |
|---|---|---|---|---|
| 0.6 | white dwarf | 1.77 km | about 8,200 km | about 4,600 |
| 1.0 | white dwarf | 2.95 km | about 5,200 km | about 1,750 |
| 1.4 | white dwarf (just under the limit) | 4.13 km | about 1,400 km | about 350 |
| 1.6 | neutron star | 4.73 km | 12 km | 2.54 |
| 2.0 | neutron star | 5.91 km | 12 km | 2.03 |
| 2.5 | uncertain | 7.38 km | 12 km if it holds | 1.63 |
| 3.0 | uncertain (top of the range) | 8.86 km | 12 km if it holds | 1.35 |
| 3.5 | black hole | 10.3 km | none: nothing holds it | — |
| 5 | black hole | 14.8 km | none | — |
| 10 | black hole | 29.5 km | none | — |

(Heavier white dwarfs are smaller: 8,200 km at 0.6 Suns, 5,200 at 1.0, 1,400 at 1.4.) The mass at which a 12 km ball would be exactly as wide as its horizon is about 4.1 Suns, which is not the limit: nothing holds a core up long before it gets that close (the limit is about 3), which the experiment says plainly.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **A thought experiment about a dead core,** cooled, not spinning, and at rest. How the star got there is not modeled.
- **The limits are standard results, given and not derived.** The white dwarf's is well established. The neutron star's is a range, because the matter inside a neutron star is not fully understood.
- **Round numbers:** 1.4 Suns, about 2 Suns, about 3 Suns, 12 km for a neutron star, and a white dwarf's size from one formula. Real values vary.
- **Nothing known holds a heavier core up.** That is a statement about what is known. A form of matter that could do it has been suggested, but none has been observed, and the experiment does not model one.
- **The experiment stops at the horizon.** What is inside is not modeled.

### Not introduced

The star's life, its fuel, how a star becomes a dead core, the supernova explosion and which stars explode (stated in one sentence: the stars that end as black holes are generally those with at least about 20 to 25 times the Sun's mass at birth, a boundary that is not settled), the collapse time, rotation, black holes formed by mergers (Gravitational Waves chapter) or in the early universe, exotic matter, quark stars, and anything inside the horizon. All explicitly out of scope (`CLAUDE.md` §16).

---

## Physics Model

One new, self-contained module, in the style of Experiments 1 to 8. It **reuses** earlier code unchanged (imported, not redefined): `horizonRadiusKm` from Experiment 1 of this group (`blackHoleSizeExperiment.ts`). It adds the thresholds and the white dwarf's radius, restated in its own file. A regression test checks that it imports no other experiment's module.

```typescript
// src/physics/blackHoleFormationExperiment.ts

export const CHANDRASEKHAR_LIMIT_SOLAR_MASSES = 1.44
export const SURE_NEUTRON_STAR_TOP_SOLAR_MASSES = 2.0     // below this, neutrons hold it up (Decision 3)
export const SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES = 3.0    // above this, nothing known holds it up (Decision 3)
export const NEUTRON_STAR_RADIUS_KM = 12                  // as in Experiment 1
export const MIN_CORE_MASS = 0.3
export const MAX_CORE_MASS = 10

export type CoreOutcome = 'white-dwarf' | 'neutron-star' | 'uncertain' | 'black-hole'

export function whiteDwarfRadiusKm(coreMassSolarMasses: number): number   // throws for a mass at or above the limit

export function coreOutcome(coreMassSolarMasses: number): CoreOutcome

export interface CoreResult {
  coreMassSolarMasses: number
  outcome: CoreOutcome
  horizonRadiusKm: number                     // reused from Experiment 1
  heldUpRadiusKm: number | null               // the white dwarf's or the neutron star's radius; null for a black hole
  radiusOverHorizon: number | null            // heldUpRadiusKm / horizonRadiusKm; null for a black hole
  // for the ladder and the size picture, in order of mass:
  ladder: Array<{ outcome: CoreOutcome; fromSolarMasses: number; toSolarMasses: number }>
  curve: Array<{ coreMassSolarMasses: number; horizonRadiusKm: number; heldUpRadiusKm: number | null }>
}

export function runBlackHoleFormationExperiment(coreMassSolarMasses: number): CoreResult
```

Structured independently of the UI (`CLAUDE.md` §9): pure functions, testable with no browser. The playback of the collapse (a fixed real duration, independent of the result) does not change any result (`CLAUDE.md` §11). For a mass in the uncertain zone, `heldUpRadiusKm` is the neutron star's 12 km, and the interface says plainly that it is only if the core holds.

---

## Learner Controls

- **The core's mass:** presets **0.6, 1.0, 1.4, 1.8, 2.5, 3.5, 10** Suns (Decision 2), and the experiment shows what each is called in the ladder. Each value's horizon radius is shown beside it.
- **Run,** which plays a "squeeze" of the core from a large size down to what holds it up (or to nothing), over a fixed real duration independent of the physics (`CLAUDE.md` §11).

---

## Prediction Activity

Before running, the learner answers three questions, all required before Run is enabled (the same gating as Experiments 5 to 8). Wording is a draft for the owner's review (§28.1):

1. "A white dwarf is a dead star held up by the push of its electrons. If you add more mass to a white dwarf, what do you think happens to its size?" (It gets bigger / It stays the same size / It gets smaller.) The model's answer is the third.
2. "If you keep adding mass to a dead star's core, can something always hold it up?" (Yes, something always can / No, past some mass nothing known can / Only up to a limit that depends on the star's size.) The model's answer is the second. (The third choice is a plausible wrong answer.)
3. "A neutron star is held up by neutrons instead of electrons. Do you think the largest mass a neutron star can have is higher than, the same as, or lower than a white dwarf's?" (Higher / The same / Lower.) The model's answer is the first.

Nothing about the answers is shown before Run (§12).

---

## Experiment Behavior

1. The learner answers the three predictions. Run is disabled until all three are answered.
2. The learner picks a core mass and presses Run. The first Run locks the predictions in.
3. A "squeeze" plays over 10 seconds: a ball (the core) shrinks from a large size toward what holds it up, or past its horizon if nothing does. This is only how the result is shown, and it does not model the time a real collapse takes (Decision 6).
4. The pictures and the Results appear (Results only when the run has ended).
5. Changing the core mass hides the pictures again. "Change predictions" reopens the predictions without resetting the choices, as in Experiments 5 to 8.

### Display

- **Picture 1, "The ladder: what holds the core up" (a horizontal scale of mass).** Core mass in Suns from about 0.3 to 10 (log scale), with four colored zones labeled on the canvas: white dwarf (electrons, up to 1.4), neutron star (neutrons, 1.4 to about 2), a hatched **uncertain zone** (about 2 to about 3) labeled "not known: a neutron star or a black hole", and black hole (above about 3, "no known pressure"). A marker shows the chosen mass, with its name and its horizon radius.
- **Picture 2, "How wide is the core, compared with its own horizon?" (a log scale of size, in km).** A ruler from 1 km to 100,000 km (log). A **ball** for the held-up core (white dwarf: several thousand km; neutron star: 12 km; none for a black hole), a **ring** for the core's horizon (from Experiment 1), and a label for each. During the "squeeze" the ball shrinks from the top of the ruler to its final size; for a black hole it shrinks past the ring and stops being a ball, and is replaced by a black disk the size of the horizon. A line beside it gives the ratio of the ball's radius to the horizon's, and its name.
- **Picture 3, "Heavier is smaller" (a graph).** White dwarf radius against mass (0 to 1.44 Suns), falling to zero at the limit, with a dot for the chosen core if it is a white dwarf, and the neutron star's 12 km as a dashed line for masses above. Labeled on the canvas; this shows Prediction 1's answer after the run, not before.
- Each picture has a **"How to read this picture" caption** directly under it, shown after predictions are locked in, in the style of Experiments 6 to 8 (including "What is really happening" and a detailed "How the picture shows it"). Each defines "horizon radius" in a phrase.
- Every drawn part is labeled directly on the canvas. The zones are distinguished by color and label, and the uncertain zone also by hatching, so the contrast does not rely on color alone (`CLAUDE.md` §14).
- The pictures and the readout appear only after the first Run (§12).

### Results

Shown only when the run has ended and the predictions are locked in. States the core mass and what it is; the horizon radius; the held-up core's radius and the ratio of the two (or that nothing holds a black hole's core); compares all three predictions with the model; includes simple math per `CLAUDE.md` §15, for example the horizon radius worked as `2.953 km × 3 = 8.86 km` and the ratio worked as `12 ÷ 8.86 = 1.35`, and the white dwarf's radius worked from its formula at one mass; a table of the preset masses; a daily-life comparison (Decision 5); and the model's limits in a prominent bordered box (§28.1 pattern).

### Introductory text

To be drafted during implementation, covering the question (in nature, what squeezes a core, and what can stop it?), what happens (step by step), the learner's job, what to look for, new terms defined in plain language before use (**white dwarf**, **neutron star**, **dead star's core**, **degeneracy pressure** with its theatre-seats comparison, **Chandrasekhar limit**, **electron**, **neutron**, with **horizon radius** recalled from Experiment 1), what it builds on (Experiment 1's squeeze and its neutron star), a "Why even ask this" paragraph following Experiments 5 to 8 (the Sun will never become a black hole; what kind of star does, and why?), and the assumptions above. It must not contain the prediction answers (§12), and must say plainly that the limits are standard results that are stated here and not derived.

---

## AI Tutor Behavior

Follows the sequence of Experiments 5 to 8 (draft; wording for the owner's review):

1. **Observation:** "Look at the ladder and the size picture. Try a few masses. What changes in the picture as the core gets heavier, and where does the ball stop?"
2. **Compare with predictions:** the tutor says whether each of the three predictions matches the model, from the physics module's numbers.
3. **Conceptual question:** "A heavier white dwarf is smaller, not bigger. Why might adding mass make it shrink?" Intended to let the learner reason before the explanation.
4. **Explanation:**
   1. A dead core has nothing pushing outward except what comes from squeezing particles together.
   2. Electrons cannot all be in the same state (stated, not derived), so squeezing them makes them push back. Daily-life comparison: seats in a theatre, one person per seat. A small crowd sits in the best seats, and a bigger crowd must use seats farther back, which here means higher energy, more motion and more push. This is only a comparison.
   3. A heavier white dwarf is smaller because more mass squeezes the electrons tighter before their push matches gravity (about 8,200 km at 0.6 Suns, about 1,400 km at 1.4).
   4. Near 1.4 Suns the electrons move at close to the speed of light and cannot push harder, so the limit: the Chandrasekhar limit.
   5. Squeezed further, electrons and protons merge into neutrons, which push back in the same way; this holds up a neutron star about 12 km across (the numbers from the module), and it has a limit too, about 2 to 3 Suns, not known exactly, since the matter inside is not fully understood.
   6. Beyond that, no known pressure holds the core up, so it collapses until it is inside its horizon (the numbers for the chosen mass): a black hole. The ratio of core radius to horizon radius shows how close a neutron star gets: 2.9 for 1.4 Suns, 1.35 for 3.
   7. What is settled and what is not (the white dwarf's limit, against the neutron star's range), and which stars end as black holes (named in one sentence, not modeled).
   8. The honest limits: a thought experiment about a cooled, non-spinning, dead core; the explosion, the collapse time and the inside of the horizon were not modeled.
5. The tutor may only state results from the physics module; it never invents physics (§13).

---

## Required Physics Tests

(Tests verify physical behavior, `CLAUDE.md` §10.)

1. `coreOutcome` is `white-dwarf` below 1.44 (where the white dwarf's radius is still above zero), `neutron-star` from 1.44 up to and including 2, `uncertain` above 2 up to and including 3, and `black-hole` above 3 (the values just either side of each edge, including 1.44, 2 and 3).
2. `whiteDwarfRadiusKm` equals `0.012 R☉ M^(−1/3) √(1 − (M/1.44)^(4/3))`, written separately in the test file, at several masses; it **falls as the mass rises** (checked over a fine grid); it is about 8,200 km at 0.6 and 1,400 km at 1.4 (within 2%); and it throws a `RangeError` at or above 1.44.
3. For small masses (0.1 to 0.3), `whiteDwarfRadiusKm` is within 5% of the non-relativistic `0.012 R☉ M^(−1/3)` (the part checked against a source).
4. The horizon radius equals Experiment 1's `horizonRadiusKm` for the same mass (reuse, not a copy): 8.86 km at 3, 14.8 km at 5 and 29.5 km at 10.
5. `radiusOverHorizon` for a neutron star equals 12 ÷ the horizon radius: 2.90 at 1.4, 2.03 at 2 and 1.35 at 3 (within 1%).
6. For a black hole (above 3), `heldUpRadiusKm` and `radiusOverHorizon` are `null`.
7. The white dwarf's radius over the horizon radius is above 100 at every white dwarf mass below 1.43 and falls as the mass rises (checked over a fine grid).
8. The mass at which a 12 km ball would be exactly as wide as its horizon (about 4.06 Suns) is above the experiment's black hole edge (3), which is stated, not assumed.
9. The ladder's zones cover the whole range of masses with no gaps and no overlap, in order, with the edges at 1.44, 2 and 3.
10. Out-of-range masses (below the smallest, above the largest, NaN) throw a `RangeError`.
11. Determinism: the same inputs give the same result.
12. A regression test: the module imports no other experiment's module other than Experiment 1's `blackHoleSizeExperiment`.

The tests will also be checked for vacuity (deliberately changing an edge, an exponent and a constant and confirming a test fails), as in Experiments 6 to 8.

---

## Decisions Needing Human Review

Each has Claude's recommended default; the owner may change any.

1. **One idea, and the order.** **Agreed (2026-10-12).** Default: Experiment 9 is "how a black hole forms" (what can hold up a dead core), and Hawking radiation follows as Experiment 10. The group then has ten experiments, and the notes that say "planned as five" will be updated when this is approved. Alternative: Hawking radiation first.
2. **The mass presets.** Default: 0.6, 1.0, 1.4, 1.8, 2.5, 3.5 and 10 Suns, so that every zone and the uncertain zone are reached, and 10 Suns matches Experiment 1's stellar black hole. Alternative: a custom slider as well (as in Cosmology Experiment 8).
3. **The two edges of the neutron star's range.** **Agreed (2026-10-12).** Default: "sure neutron star" up to about **2** Suns (just under the heaviest measured, about 2.08) and "sure black hole" above about **3** (the top of the theory's range), with the 2 to 3 zone drawn as uncertain. Alternative: use a single central value of about 2.2 to 2.3, which would look more precise than the physics allows.
4. **The white dwarf's size formula (not yet verified).** **Agreed (2026-10-12): use the joined form, and check it against a textbook or paper before the physics step.** The part for light white dwarfs, and the fact that the radius falls to zero at the limit, were checked in a source. The exact way the two are joined (the factor `√(1 − (M/1.44)^(4/3))`) is the standard approximate form as Claude remembers it, and was **not** found in a source. Default: use it, and check it against a textbook or paper before the physics step. Alternative: show only the light-mass formula and the statement that the radius falls to zero, with no value near the limit.
5. **Daily-life comparisons.** Default: seats in a theatre for the electrons' push (in the tutor), and a crowded bus or lift for "squeezing" in the Results, to be confirmed by the owner (§15, §28.1). Alternative: an elastic ball that is squeezed.
6. **The collapse "squeeze" animation.** **Agreed (2026-10-12): presentation only, no collapse time.** Default: a ball shrinking over 10 seconds, stated as presentation only and not as the real collapse time. A real core collapses in a fraction of a second, which the tutor may say in one sentence (not checked against a source). Alternative: add the collapse time from Experiment 5's falling-in formula as a second idea, as the energy was in Experiment 8.
7. **A second, optional fact: no static star can be smaller than 9/8 of its horizon radius (Buchdahl's bound).** **Agreed (2026-10-12): leave it out.** It was checked in a source (the bound is `R ≥ 9GM/(4c²)`), and it would explain, with the ratio picture, why the squeeze cannot stop just outside the horizon. For a 12 km ball it gives about 3.6 Suns, consistent with the 2 to 3 range. Default: leave it out (a second idea). Alternative: name it in the tutor as a one-sentence extra.
8. **How much to say about which stars become black holes.** Default: one sentence (generally those with at least about 20 to 25 times the Sun's mass at birth, a boundary that is not settled), marked as not modeled. Alternative: leave it out.
9. **Nothing-known statement.** Default: say plainly that a form of matter that could hold up a heavier core has been suggested but none has been seen. Alternative: omit.
10. **Not checked against a primary source:** the Chandrasekhar limit (1.44), the neutron stars' measured mass (about 2.08) and radius (about 12 to 13 km) and the 2.2 to 2.9 range of the theory limit were checked on 2026-10-12 only against search results (Wikipedia and arXiv papers); the white dwarf's size formula is partly unchecked (Decision 4); "about Earth-sized" is general knowledge; the 20 to 25 Suns figure for stars is uncertain, as the sources say. Claude recommends a check against a textbook before approval.

---

## Relationship to Previous Experiments

- **Black Holes Experiment 1 (how small a black hole):** the horizon radius and the squeeze. That experiment said what could squeeze an object, and what would stop it, was not modeled; this one is the answer, and it reuses Experiment 1's horizon radius and its 12 km neutron star.
- **Gravity and Curved Spacetime Experiment 7 (what is a black hole?):** where the idea of a black hole first appears.
- **Gravity and Curved Spacetime Experiment 6 and Black Holes Experiment 3 (orbits):** a held-up core is supported against gravity by pressure, where an orbit is supported by motion.

## Relationship to Later Experiments

- **Hawking radiation (planned as Experiment 10):** the end of the story, which begins with this experiment's black hole. It is not proposed here.
- No further experiment is planned or approved.

---

## Success Criteria

The experiment is complete when:

1. The learner can choose a core mass and run the "squeeze".
2. Picture 1 shows the four zones with the neutron star's limit as an uncertain zone, each labeled on the canvas and visually distinct; Picture 2 shows the held-up core and the horizon to scale on one ruler; Picture 3 shows the white dwarf getting smaller as its mass rises.
3. All three pictures label every drawn component and carry their own "How to read this picture" caption (`CLAUDE.md` §14).
4. All three predictions are required before Run, and nothing is revealed before the run (§12).
5. Results compare each prediction with the model and include the simple math.
6. The tutor follows the sequence above and states only results from the physics module.
7. Every specialized term is defined before it is used, and the introduction says the limits are stated and not derived (§15). The uncertain zone is shown as uncertain, and nothing is stated with more precision than the sources give.
8. All required physics tests pass and none is vacuous; the physics is separate from the interface (§9); playback speed cannot change a result (§11).
9. The complete flow is tested in a browser at 1200 and 390 pixels, and the final review against `docs/PROJECT.md`, `AGENTS.md` and this specification is recorded.

---

## Implementation Notes

- **Drafted (2026-10-12):** this specification only. Nothing is implemented. The feasibility numbers above were computed in a scratch script outside the project on 2026-10-12 (the horizon radius from Experiment 1's formula, the neutron star's ratio from a round 12 km, and the white dwarf's radius from the formula in Decision 4, which is not checked against a source). The limits and the neutron star data were checked against search results only.
