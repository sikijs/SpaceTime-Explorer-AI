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
5. **The heavier the core, the closer it gets to its own horizon.** Compare the held-up core's radius with its horizon radius: for a 0.6-Sun white dwarf, about 5,100 times as wide; for a 1.4-Sun neutron star, about 2.9 times (as in Experiment 1); for a neutron star of 3 Suns, if one can exist, only about 1.35 times. A black hole is what is left when that ratio reaches below 1.
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
- **The white dwarf's radius:** `R = 0.0131 R☉ × (M ÷ M☉)^(−1/3) × √(1 − (M ÷ 1.44 M☉)^(4/3))`, where `R☉` is the Sun's radius, 695,700 km. The shape is the white dwarf's: the radius *falls as the mass rises* (a source gives `R ≈ 0.012 R☉ × M^(−1/3)` for light white dwarfs), and it falls to zero at the limit, where the electrons move at close to the speed of light (a source says the radius becomes zero at the limit). **How the coefficient was found (Decision 4, 2026-10-12, Step 1):** the closed form was not found in a source. Claude integrated the equations of a white dwarf built from the standard degenerate-electron equation of state (Chandrasekhar's, two nucleons per electron) separately, in the test file, which reaches a largest mass of 1.456 Suns (the analytic value is 1.4575) and so checks itself, and fitted the coefficient to it: **0.0131**, which matches the integration within about 3% up to 1.2 Suns and within 7% up to 1.35. The coefficient first written here, 0.012 (from the source's light-white-dwarf form), is 6 to 15% too small against the integration. This is Claude's own check, not a textbook or paper, and the closed form is an approximation.
- **The neutron star's radius:** a round **12 km** for every neutron star, as in Experiment 1 (measured values are about 12 to 13 km, with an uncertainty of about 1 km). Real radii change a little with mass; the model ignores this.
- **The neutron star's largest mass (the TOV limit):** not known exactly. The heaviest neutron star measured reliably is about 2.08 Suns. Theory puts the limit between about 2.2 and 2.9 Suns, up to about 3. The model uses **about 2 Suns** as the top of the sure zone, **about 3 Suns** as the bottom of the sure black hole zone, and shows what lies between as uncertain (Decision 3).
- **The horizon radius:** `r_s = 2GM/c²`, about 2.953 km per Sun, **reused from Experiment 1**.

### Illustrative results (computed in a feasibility check on 2026-10-12, in a scratch script outside the project; the tests will check them)

| Core mass | Result | Horizon radius | Radius of the held-up core | Core radius ÷ horizon radius |
|---|---|---|---|---|
| 0.6 | white dwarf | 1.77 km | about 9,000 km | about 5,100 |
| 1.0 | white dwarf | 2.95 km | about 5,650 km | about 1,900 |
| 1.4 | white dwarf (just under the limit) | 4.13 km | about 1,560 km | about 380 |
| 1.6 | neutron star | 4.73 km | 12 km | 2.54 |
| 2.0 | neutron star | 5.91 km | 12 km | 2.03 |
| 2.5 | uncertain | 7.38 km | 12 km if it holds | 1.63 |
| 3.0 | uncertain (top of the range) | 8.86 km | 12 km if it holds | 1.35 |
| 3.5 | black hole | 10.3 km | none: nothing holds it | — |
| 5 | black hole | 14.8 km | none | — |
| 10 | black hole | 29.5 km | none | — |

(Heavier white dwarfs are smaller: 9,000 km at 0.6 Suns, 5,650 at 1.0, 1,560 at 1.4.) The mass at which a 12 km ball would be exactly as wide as its horizon is about 4.1 Suns, which is not the limit: nothing holds a core up long before it gets that close (the limit is about 3), which the experiment says plainly.

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
   3. A heavier white dwarf is smaller because more mass squeezes the electrons tighter before their push matches gravity (about 9,000 km at 0.6 Suns, about 1,560 km at 1.4).
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
2. `whiteDwarfRadiusKm` equals `0.0131 R☉ M^(−1/3) √(1 − (M/1.44)^(4/3))`, written separately in the test file, at several masses; it **falls as the mass rises** (checked over a fine grid); it is about 8,970 km at 0.6, 5,650 km at 1.0 and 1,560 km at 1.4 (within 1%); and it throws a `RangeError` at or above 1.44.
3. **Against an independent integration:** `whiteDwarfRadiusKm` matches, within 3.5% up to 1.2 Suns and within 8% up to 1.35, a white dwarf integrated in the test file from the standard degenerate-electron equation of state (whose own largest mass is first checked against the analytic 1.4575 Suns); and for light white dwarfs (0.1 to 0.3 Suns), `R M^(1/3)` is within 10% of the source's `0.012 R☉` and within 3.5% of the integration's value.
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
4. **The white dwarf's size formula.** **Agreed (2026-10-12): use the joined form, and check it before the physics step. Checked in Step 1: no textbook or paper formula was found, so the check was an independent numerical integration; the form stands and the coefficient is 0.0131, not 0.012 (see "The statements the model uses"). For the owner's approval.** The part for light white dwarfs, and the fact that the radius falls to zero at the limit, were checked in a source. The exact way the two are joined (the factor `√(1 − (M/1.44)^(4/3))`) is the standard approximate form as Claude remembers it, and was **not** found in a source. Default: use it, and check it against a textbook or paper before the physics step. Alternative: show only the light-mass formula and the statement that the radius falls to zero, with no value near the limit.
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

- **Step 1, the check of the white dwarf's size formula, and the physics model and tests (2026-10-12):** built `src/physics/blackHoleFormationExperiment.ts` and `src/physics/blackHoleFormationExperiment.test.ts` (25 tests covering all 12 "Required Physics Tests"). Only `horizonRadiusKm` is imported (from Experiment 1). **The check Decision 4 asked for:** a search for the closed form (Wikipedia's white dwarf, Chandrasekhar limit and Chandrasekhar's white dwarf equation pages, and an arXiv paper on the radius near the limit) found the light-white-dwarf form `R ≈ 0.012 R☉ M^(−1/3)`, the statement that the radius falls to zero at the limit, and the limit's value, but not the closed form near the limit. So Claude integrated a white dwarf from the standard degenerate-electron equation of state (separately, in the test file; its own largest mass, 1.456 Suns against the analytic 1.4575, shows the integration is sound) and compared. The remembered coefficient, 0.012, came out **6 to 15% too small**; the same shape with **0.0131** matches within 2.6% up to 1.2 Suns and within 7% up to 1.35. The module uses 0.0131. This is Claude's own check, not a textbook or paper. **Checked that the tests are not vacuous:** ten deliberate changes to the module (the coefficient set back to 0.012, the two exponents, the limit, the two edges of the uncertain zone, the neutron star's radius, an edge's inequality, an inverted ratio, and a black hole keeping a radius) each failed 1 to 7 tests. **Differences from this specification, for the owner:** (1) the coefficient is 0.0131, not 0.012, and the white dwarf radii and ratios in the specification's table and text were updated to match (9,000, 5,650 and 1,560 km at 0.6, 1.0 and 1.4 Suns; ratios 5,100, 1,900 and 380); (2) Required Test 3 now compares with the independent integration (and with the source's 0.012 within 10%), where it compared with 0.012 within 5%; (3) `coreOutcome` calls a core of exactly 1.44 Suns a neutron star (a white dwarf's radius is zero there), and the module exports `LADDER`, `LadderZone` and `CurvePoint`, and carries the ladder in the result; (4) `curve` runs from 0.3 to 10 Suns (the module's smallest mass), so Picture 3's white dwarf curve will start at 0.3, where "Display" says 0; (5) `whiteDwarfRadiusKm` and `coreOutcome` throw a `RangeError` for a non-positive or non-finite mass. Full Vitest run: 652 passed (627 before). No type errors in the new files. **Not built yet:** the interface, predictions, introduction, Results, tutor and wiring into `src/App.tsx`.

- **Step 1 approved (2026-10-12):** the owner approved Step 1 as built, including the five differences listed in the Step 1 note above (the coefficient 0.0131, the changed Required Test 3, a core of exactly 1.44 Suns counting as a neutron star, the curve starting at 0.3 Suns, and the errors and exports).

- **Step 2, basic interface (2026-10-12):** built `src/components/BlackHoleFormationExperiment.tsx` and wired it into `src/App.tsx` as chapter 9 of the "Black Holes and Strong Gravity" group. It has the seven mass presets (0.6, 1.0, 1.4, 1.8, 2.5, 3.5, 10 Suns, with the horizon radius beside them), Run (10 seconds of real playback, independent of the result: the core's "squeeze" is presentation only), a readout, and three pictures, each with a "How to read this picture" caption (**draft wording, for the owner's review**) with a detailed "How the picture shows it" list ending in an "In this run" line. **Picture 1, the ladder:** a log scale of mass from 0.3 to 10 Suns in four labeled zones (white dwarf, neutron star, a hatched "not known" zone, black hole), the three edges (limit 1.44, about 2, about 3), a marker for the chosen core, and a key under the bar saying what each zone means. **Picture 2, the size ruler:** a log ruler from 0.1 km to 100,000 km with a white ring for the horizon radius, a ball for the core that shrinks from the right during the run (stopping at the white dwarf's or the neutron star's radius, or, for a black hole, passing the ring into a black area labeled "smaller than the horizon radius: a black hole"), and the horizon radius, the core's radius and the ratio written under it. **Picture 3, heavier is smaller:** the white dwarf's radius against its mass (the blue curve, falling to zero at 1.44), the limit as a dashed line, the neutron star's 12 km as a dashed violet line, and a white dot for the chosen core if it is a white dwarf (and a line of text saying so when it is not). Every drawn part is labeled on the canvas. The pictures and readout appear only after Run. Predictions, the introduction, Results and the tutor are not built yet, so Run is enabled from the start (as in the earlier experiments at this step). **Differences from this specification, for the owner:** (1) Picture 3's horizontal axis runs from 0.3 to 2.0 Suns (the module's smallest mass to a little above the neutron star's range), so the white dwarf curve starts at 0.3 and the neutron star's line is drawn to 2.0; the curve is drawn to zero at 1.44 as the formula says; (2) Picture 2 is a log ruler with a ring and a ball as markers, not circles drawn to scale, because 12 km and 9,000 km cannot share one to-scale drawing; (3) the squeeze starts from an arbitrary 50,000 km, and for a black hole ends at 0.3 of the horizon radius, both for the picture only; (4) the zone names sit inside the bar, and the four-line key under it carries the longer meanings; (5) the default core is 1.4 Suns; (6) Experiment 8's chapter summary "what's next" line now points to this experiment (draft wording, as Experiment 7's did for Experiment 8), and a placeholder summary was added for this chapter (not shown to learners until the tutor exists). **Checked** in headless Chromium at 1200 and 390 pixels (scripted, 105 checks per width, all passed; screenshots of three masses viewed at 1200): nothing shows before Run; for every one of the seven presets, the horizon radius beside the buttons, the outcome sentence, the held-up radius and the ratio (against numbers worked out inside the script from the formulas, not from the application's module), the ladder marker and edges, the ruler's numbers and the graph's text are right; mid-run the pictures show with Run reading "Running..." and the buttons disabled; changing the mass hides the pictures; all three captions are present; no NaN; no Results or tutor yet; no console errors; no sideways scroll. Two problems found at the first look and fixed: Picture 3's neutron star label ran across the end of the curve, and Picture 2's readout repeated "12 km" for the uncertain zone. Two faults in my first check script (a wait on a button named "Run" while it read "Running...", and a lowercase search for a label written "Not known") were corrected, not the application. The full Vitest run passed. **Not checked:** a screen reader, other browsers. At 390 pixels the pictures are small and their labels very small (the app-wide column width). **Not built yet, by design:** the three predictions and their gating, the introduction, the Results panel and the tutor.

- **Step 2 approved (2026-10-12):** the owner approved Step 2 as built, including the six differences listed above. The wording of the captions and of Experiment 8's changed "what's next" line is still the owner's line-by-line review (§28.1).

- **Step 3, learner prediction interaction (2026-10-12):** added the three prediction questions from "Prediction Activity" to `src/components/BlackHoleFormationExperiment.tsx`, above the controls. Until all three are answered, the mass buttons and Run are disabled. The first Run locks the predictions in; "Change predictions" reopens all three without resetting the chosen core mass, and hides the pictures again. The readout and all three pictures appear only after the first Run (§12). The choices are not marked yet (that is the Results step). **Wording, for the owner's review:** the three questions and their choices are exactly as in the specification, with nothing added: (1) "A white dwarf is a dead star held up by the push of its electrons. If you add more mass to a white dwarf, what do you think happens to its size?" (It gets bigger / It stays the same size / It gets smaller); (2) "If you keep adding mass to a dead star's core, can something always hold it up?" (Yes, something always can / No, past some mass nothing known can / Only up to a limit that depends on the star's size); (3) "A neutron star is held up by neutrons instead of electrons. Do you think the largest mass a neutron star can have is higher than, the same as, or lower than a white dwarf's?" (Higher / The same / Lower). **Note for the owner:** the questions use "white dwarf", "neutron star" and "neutrons" before the introduction (Step 4) defines them; the introduction will sit above the questions, as in Experiments 6 to 8. **Browser check** (headless Chromium, scripted, 1200 and 390 pixels, 32 checks per width, all passed; the layout was also looked at): the three questions appear with no picture and nothing given away; the controls and Run are disabled at the start and with two answers; the third answer (chosen from the keyboard) enables them; no picture until Run; during the run Run reads "Running..." and the prediction and mass buttons are disabled; after the run "Change predictions" appears and the prediction buttons stay locked; changing the mass hides the pictures and a new Run shows them again; "Change predictions" hides them, keeps the choices and the chosen mass, and re-enables Run; no Results or tutor; no sideways scroll; no console errors. Full Vitest run: 652 passed. No type errors in the new code. **Not checked:** a screen reader, other browsers. **Still not built:** the introduction, the Results panel and the tutor.

- **Step 3 approved (2026-10-12):** the owner approved Step 3 as built. The wording of the three questions is still the owner's line-by-line review (§28.1).

- **Step 4, introduction (2026-10-12):** drafted in `BlackHoleFormationExperiment.tsx`, above the predictions, in the structure of Experiments 6 to 8 (the question, why even ask this, what happens, words, what it builds on, your job, what to look for, assumptions). **Draft wording, for the owner's review (§28.1).** It defines the dead star's core, the white dwarf (roughly the size of the Earth), the neutron star (about 12 km across, defined where it is first used, in "the question"), electron, neutron, degeneracy pressure (with the theatre-seats comparison: one person per seat, no two in the same seat, however hard you push, called only a picture) and the Sun as the unit of mass, and recalls the horizon radius from Experiment 1. **Differences from this specification, for the owner:** (1) the specification says the introduction defines the **Chandrasekhar limit**, but the name tells the learner that a white dwarf has a limit, which is what Prediction 2 asks, so the introduction does not use the word "limit" at all, and the name is introduced instead in the first picture's caption, after the run ("called the Chandrasekhar limit, after the physicist who worked it out in the 1930s"); (2) the specification's assumption that "nothing known holds a heavier core up" is not in the introduction, for the same reason (it is Prediction 2's answer); the introduction's assumption is the general "the numbers are standard results, given and not derived, and some are not known exactly", and the plain statement is in the captions and will be in the Results' limits box; (3) the theatre-seats comparison in the introduction goes only as far as defining the push; the fuller version (farther rows mean more energy) is left for the tutor. **For the owner:** (a) "The Sun will never become a black hole. Some stars do." and "a star's fuel is what makes it push outward against its own gravity" are general knowledge, not checked against a primary source; (b) an electron "moves around the outside of an atom" and a neutron "sits in the middle of an atom, in its nucleus" are the usual simple pictures; (c) the name and the date for Chandrasekhar's work (the 1930s) are general knowledge and were not checked. A first draft said "the answer is not how big the star was", which was wrong (a star's starting mass does matter for which stars end as black holes, as the sources say); it was removed on rereading. **Checked** in headless Chromium (scripted, 1200 and 390 pixels, 39 checks per width, all passed; the text was also read in a screenshot): all eight parts are present; every new term is defined in the words paragraph or where it is first used; none of fourteen phrases that would give away an answer ("limit", "Chandrasekhar", "smaller", "heavier", "1.44", "nothing known", "higher", "largest mass" and others) appears; the introduction is above the first question; no picture, and Run still disabled; the caption names the Chandrasekhar limit after a run; no console errors; no sideways scroll. Two problems were found by rereading and fixed: "when does nothing stop it?" hinted at Prediction 2, and "neutron star" was used before it was defined. The Step 3 checks (32) and the full Vitest run (652) were not affected. **Not checked:** a screen reader, other browsers. **Still not built:** the Results panel and the tutor.

- **Step 4 approved (2026-10-12):** the owner approved Step 4 as built, including the three differences listed in the Step 4 note above (the Chandrasekhar name moved to the first picture's caption, the nothing-known assumption moved out of the introduction, and the short theatre-seats comparison). The wording is still the owner's line-by-line review (§28.1).

- **Step 5, Results (2026-10-12):** added the Results panel to `src/components/BlackHoleFormationExperiment.tsx`, shown only when the run has ended and the predictions are locked in (**draft wording, for the owner's review, §28.1**): a table (what the core is, its horizon radius, the radius of what holds it up, and that radius over the horizon radius, or that it ends smaller than its horizon); the three prediction checks, each marked "right" or "off this time" with a one-sentence correction; the simple math for the horizon (2.953 km × the mass) and the ratio; the white dwarf's radius worked step by step from its formula (at the chosen mass if it is a white dwarf, and at 1 Sun, said plainly, if it is not); a table of the seven preset masses; a daily-life comparison (people being squeezed into a lift, said to be only a comparison that does not explain why the pushes give out where they do); and the amber limits box. `whiteDwarfRadiusSteps` and `HORIZON_KM_PER_SOLAR_MASS` were added to the physics module so the interface does no physics (§9), and `whiteDwarfRadiusKm` now uses the steps; four tests were added (29 in all). **Checked that the new tests are not vacuous:** five deliberate changes (the two exponents, the sign of the squeeze factor, a missing factor in the radius, and a wrong horizon per Sun) each failed 1 to 8 of them. **Differences from this specification, for the owner:** (1) the Results' limits box is where the plain statement "nothing known holds a heavier core up" now is (with the remark that a form of matter that could has been suggested but none seen, Decision 9), since the introduction cannot say it (§12); (2) the correction for the second prediction's choice "only up to a limit that depends on the star's size" says "in this model it depends on the core's mass: past about 3 Suns, nothing known can hold the core up", and does not claim anything about the star's size, which the model does not include; (3) the Results add a table of the seven preset masses, which the specification's Results list names; (4) the wrong-answer sentences state outright what the model gives, as in Experiments 6 to 8, so the answers are revealed in Results, after the learner has run it and before the tutor; (5) the daily-life comparison is the lift one (Decision 5's default) and is plain about being only a comparison. **Checked** in headless Chromium (scripted, 1200 and 390 pixels, 131 checks per width, all passed): nothing shows before the end of a run; for every one of the seven masses, the table (the outcome, the horizon radius, the held-up radius with "if it holds" in the uncertain zone, the ratio, or "none: nothing known holds it"), the horizon and ratio lines, the first prediction's three radii, the worked white dwarf steps (against numbers worked out inside the script, not from the application's module), the example note only for a core that is not a white dwarf, the seven-row table, the daily-life paragraph and the limits box are right; all three right predictions are marked right; an all-wrong set and a set of "same" answers are marked wrong three times each with the right corrections; changing the mass hides the Results; no tutor yet; no NaN; no console errors; no sideways scroll. The full Vitest run passed (656). **Not checked:** a screen reader, other browsers. **Still not built:** the tutor (and the chapter summary's final wording).

- **Step 5 approved (2026-10-12):** the owner approved Step 5 as built, including the differences listed above. The wording of the Results is still the owner's line-by-line review (§28.1).

- **Step 6, tutor and chapter summary (2026-10-12):** `src/components/BlackHoleFormationTutor.tsx`, the sequence in "AI Tutor Behavior" (observe, compare with the three predictions, the conceptual question "A heavier white dwarf is smaller, not bigger. Why might adding mass make it shrink?", the eight-point explanation), with every number from the physics module. It is shown after the Results, and restarts on each run. `onTutorComplete` marks the chapter explained. The "compare" step uses the same right/"off this time" verdicts as the Results (worked out once, in the experiment, and passed down). The explanation: (1) a dead core has only a push from squeezing particles together left; (2) electrons cannot all be in the same state (stated, not derived), with the theatre-seats comparison taken further than in the introduction (the farther back, the more energy, motion and push) and called only a comparison; (3) a heavier white dwarf is smaller (9,000 km at 0.6 Suns, 1,560 km at 1.4); (4) near 1.44 Suns the electrons are forced to move at close to the speed of light and cannot push harder, which is the Chandrasekhar limit (stated, not derived; the speed-of-light fact is Relativity of Time and Motion, Experiment 5); (5) neutrons take over, about 12 km across, with a limit that is not known exactly, about 2 to 3 Suns; (6) beyond that nothing known holds the core up, with the ratios of core radius to horizon radius (2.9 for a neutron star of 1.4 Suns, as in Experiment 1; 2.54 for 1.6; 1.35 for 3 "if it could exist"), the 10-Sun horizon of 29.5 km, and the remark that a form of matter that could hold up a heavier core has been suggested but none seen (Decision 9); (7) what is settled and what is not, with the one sentence on which stars end as black holes (generally at least about 20 to 25 times the Sun's mass at birth, a boundary that is not sharp; Decision 8); (8) the honest limits, with the one sentence that a real core collapses in a fraction of a second and the 10-second squeeze was only a way of showing the result (Decision 6). The chapter summary in `src/App.tsx` was written (**draft wording**); its "next" line still says this is the last experiment. **For the owner (draft wording, §28.1):** (a) the explanations in points 2, 4 and 5 (electrons pushed to close to the speed of light cause the limit; electrons and protons pushed together into neutrons; "farther back means more energy") are the usual simple accounts, stated and not derived, and were not checked against a primary source; (b) "a real core collapses in a fraction of a second" and "stars with at least about 20 to 25 times the Sun's mass at birth generally end as black holes" are general knowledge (the second matches the search results, with a boundary they call uncertain), not checked against a primary source; (c) point 6's ratio for 1.4 Suns is for a neutron star of that mass, as in Experiment 1, although the experiment itself calls a core of 1.4 Suns a white dwarf (a neutron star starts at 1.44), and the tutor says so by saying "a neutron star of 1.4 Suns". **Checked** in headless Chromium (scripted, 1200 and 390 pixels, 28 checks per width, all passed): no tutor before the Results or mid-run; nothing of the explanation (the speed of light, neutrons taking over, degeneracy, the theatre, the Chandrasekhar limit) before the explanation step; Continue is disabled when the box is empty; the compare step names the three verdicts for the learner's own answers; the conceptual question is right; the summary is hidden until the explanation and then shown; all eight points appear with the numbers worked out inside the script; `explained` is saved and the chapter shows a check mark; a new run restarts the tutor at the observe step; changing the mass hides the tutor; no console errors; no sideways scroll. The full Vitest run passed (656). **Not checked:** a screen reader, other browsers. **Still to do:** the complete-flow test (§21 Step 9, across the masses) and the final review (Step 10).

- **Step 6 approved (2026-10-12):** the owner approved Step 6 as built, including the three points listed for the owner in the Step 6 note above. The wording of the tutor and the chapter summary is still the owner's line-by-line review (§28.1).
