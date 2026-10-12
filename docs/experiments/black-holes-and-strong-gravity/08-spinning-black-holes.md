# Black Holes and Strong Gravity — Experiment 8: Spinning Black Holes — Does Spin Change Where Orbits Are Safe?

**Status: APPROVED by the owner on 2026-10-12, with Decisions 6 to 9 taken as Claude's recommended defaults (Decision 9: the formulas are still not checked against a primary source, and a textbook check is recommended before the physics step). Proposed by Claude on 2026-10-12 per `CLAUDE.md` §23 Stages 1–3, as the eighth experiment of this group. Nothing is implemented yet; to be built one step at a time (§6). On 2026-10-12 the owner answered Decisions 1 to 5 (1: Claude's choice, the map, chosen; 2, 3 and 5: agreed; 4: the energy released is added as a second idea) and this specification was updated to match; Decisions 6 to 9 are still open. Nothing is implemented. The topic (spinning black holes, then Hawking radiation as Experiment 9) is the owner's recollection of the four experiments originally asked for; it is not recorded elsewhere in the project (Experiment 6's notes say only that the owner asked for four more and chose to have them proposed one at a time). The owner must review this specification and answer "Decisions Needing Human Review" before any code is written (§23 Stage 4). Learner-facing wording is subject to the owner's line-by-line review when it is drafted (§28.1).**

---

## Overview

Experiments 1 to 7 treated a black hole that does not spin. Experiment 3 found that such a black hole has a **last safe circular orbit** at 3 horizon radii (6GM/c²): outside it a circling probe that is nudged merely wobbles, at or inside it any nudge sends the probe spiraling in. Experiment 3 and every experiment since said the same thing about what they left out: **real black holes usually spin.**

This experiment asks the obvious next question: **if the black hole spins, does the last safe orbit move?**

There are two linked new ideas. The first: **spin moves the last safe orbit, and it moves it in opposite directions depending on which way the probe circles. A probe circling the same way as the spin can stay safely in orbit much closer to the black hole. A probe circling against the spin must stay much farther out. At no spin both are at 3 horizon radii (Experiment 3). As the spin grows toward its largest possible value, the "with the spin" edge falls toward about 0.5 and the "against the spin" edge rises toward 4.5 (in the units explained below).** The black hole's own horizon also shrinks a little as it spins.** The second: **the closer in the last safe orbit is, the more energy a probe can give up on the way down to it. A probe that slowly spirals in to the last safe orbit gives up about 5.7% of its rest-mass energy with no spin, about 15.6% at spin 0.9 circling with the spin, and about 3.9% circling against it.

The learner picks a black hole and a spin, runs the experiment, and watches a top-down map and a pair of energy bars in which the horizon and two rings (the last safe orbit for a probe circling with the spin, and the last safe orbit for a probe circling against it) move as the black hole is "spun up". A fixed dashed ring shows Experiment 3's 3 horizon radii for comparison.

The experiment is a **thought experiment** about a small probe in a flat sheet around a spinning black hole (the sheet that cuts through the black hole's equator). It does not follow the probe's path. It uses given formulas to place the horizon and the last safe orbits and to find the energy given up on the way to each (Decision 1).

---

## Learning Objective

After this experiment, the learner should understand:

1. **A black hole can spin,** and how fast is described by one number, the **spin**, from 0 (not spinning, as in Experiments 1 to 7) up toward 1 (the fastest a black hole can spin; the experiment explains that 1 is a limit, not a value a black hole reaches).
2. **Space near a spinning black hole is dragged around with it** (a stated fact, not derived; called **frame dragging**). This is why direction matters: a probe circling with the dragging is helped by it, a probe circling against it is hindered by it.
3. **The last safe orbit moves with spin, and the direction of the circling decides which way.** With the spin it moves inward. Against the spin it moves outward. Illustrative values (computed in a feasibility check on 2026-10-12):

   | Spin | Horizon | Last safe orbit, with the spin | Last safe orbit, against the spin |
   |---|---|---|---|
   | 0 | 1.000 | 3.000 | 3.000 |
   | 0.5 | 0.933 | 2.117 | 3.777 |
   | 0.9 | 0.718 | 1.160 | 4.359 |
   | 0.99 | 0.571 | 0.727 | 4.486 |
   | 0.9999 | 0.507 | 0.539 | 4.500 |

   (All in "reference radii", Decision 2: 1 reference radius is the horizon radius the same black hole would have if it did not spin. In kilometers, one reference radius is 29.5 km for the 10-Sun black hole, about 12.7 million km for Sagittarius A*, and about 19 billion km for M87*, as in Experiment 1.)
4. **The last safe orbit can be inside the old horizon radius.** At spin 0.99 the with-spin edge is at 0.727 reference radii, closer in than the horizon of a non-spinning black hole of the same mass. This is not a contradiction: a spinning black hole's horizon is smaller (0.571 at spin 0.99), and the last safe orbit stays outside it at every spin.
5. **The effect is not small.** At spin 0.9 the with-spin orbit is 1.160 reference radii and the against-spin orbit is 4.359: the two are about 3.8 times apart in distance, for the same black hole.
6. **It does not depend on the black hole's mass.** In reference radii the numbers are the same for all three black holes, as in Experiments 2 to 7. Only the distances in kilometers change.
7. **Closer in means more energy released.** A probe that slowly spirals down through safe circular orbits to the last safe one gives up a fraction of its rest-mass energy (the energy `E = mc²` that its mass is worth). Illustrative values (computed on 2026-10-12): about 5.7% with no spin; 8.2% with the spin and 4.5% against it at spin 0.5; 15.6% and 3.9% at spin 0.9; 26.4% and 3.8% at spin 0.99. With the spin the fraction rises toward 42.3% as the spin approaches 1; against the spin it falls toward 3.8%. The experiment says where this energy could go only in a stated sentence (Decision 4); it does not model it.
8. What the experiment does not say: the probe's actual path, how a probe could be put into such an orbit, what happens at the edge of the region where nothing can stand still (the **ergosphere**, named by the tutor only), tilted orbits, what happens inside the horizon, brightness or what a telescope would show, and how real black holes' spins are measured (the tutor may name the idea, Decision 6).

---

## Physical Situation

A black hole of known mass and a chosen spin, and a small probe, so light that its own gravity can be ignored. The probe circles in the flat sheet through the black hole's equator, either **with the spin** (the same way the black hole turns) or **against the spin**. The experiment places three things on a top-down map, all measured from the black hole's center:

- the **horizon**, the point of no return (Experiment 1), whose radius depends on the spin;
- the **last safe orbit for a probe circling with the spin**;
- the **last safe orbit for a probe circling against the spin**.

A fixed dashed ring at 3 reference radii shows where the last safe orbit would be with no spin (Experiment 3), so the learner always sees the contrast between the new edges and the old one.

### The equations (given, not derived)

Let `M` stand for `GM/c²` (units where `G = c = 1`), so the horizon radius of a black hole that does not spin is `r_s = 2M`, which is the **reference radius**. Let `a*` be the **spin**, between 0 and 1 (not including 1), where 0 means no spin and values near 1 mean the fastest possible spin. For a spinning, uncharged black hole, from standard general relativity (the Kerr solution), in the equatorial plane:

```
horizon:                 r_h  = M (1 + √(1 − a*²))

last safe orbit:         Z1 = 1 + (1 − a*²)^(1/3) × [(1 + a*)^(1/3) + (1 − a*)^(1/3)]
                         Z2 = √(3 a*² + Z1²)
                         r_isco = M × [3 + Z2 ∓ √((3 − Z1)(3 + Z1 + 2 Z2))]
                         (minus sign for a probe circling with the spin, plus sign for against)
```

**Energy released** (Decision 4). For a circular orbit at radius `r` (in units of `M`) the energy per unit rest-mass energy is

```
E = (1 − 2/r ± a*/r^(3/2)) ÷ √(1 − 3/r ± 2 a*/r^(3/2))        (+ with the spin, − against)
energy released = 1 − E, evaluated at the last safe orbit
```

It is the fraction of its rest-mass energy that a probe gives up if it descends gradually, through safe circular orbits, from far away to the last safe one (a stated assumption, not derived). Where that energy goes (for example, heat and light in a gas that spirals in) is not modeled.

Dividing by `r_s = 2M` turns every distance into reference radii. These formulas are standard and are stated here, not derived, because deriving them needs Einstein's equations for a spinning mass, which are outside this project (as in Experiment 3). They were **not checked against a primary source**; Claude checked them only against known limits (see "Required Physics Tests").

### Facts the model reproduces (computed, not looked up; the tests check them)

- At spin 0, the horizon is 1 reference radius and both last safe orbits are at 3 (Experiments 1 and 3).
- As the spin approaches 1, the horizon approaches 0.5 reference radii (`M`), the with-spin edge approaches `M`, which is 0.5 reference radii, and the against-spin edge approaches `9M`, which is 4.5 reference radii.
- At spin 0 the energy released is `1 − √(8/9)`, about 5.72%. As the spin approaches 1 it approaches `1 − 1/√3`, about 42.3%, with the spin, and `1 − √(25/27)`, about 3.77%, against it. With the spin it only rises as the spin grows; against the spin it only falls.
- For every spin, the with-spin edge is closer in than the against-spin edge, and both are outside the horizon.
- As the spin grows, the with-spin edge only moves inward, the against-spin edge only moves outward, and the horizon only shrinks (monotonic).
- In reference radii, all of this is the same for all three black holes.

### The black holes

Reused unchanged from Experiment 1: the stellar black hole (10 Suns), Sagittarius A* (about 4.3 million Suns) and M87* (about 6.5 billion Suns). Results depend only on the spin; only the distances in kilometers change with the black hole.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **A thought experiment about a small probe** circling in the sheet through the black hole's equator. The probe's own gravity does not matter.
- **The formulas are given, not derived,** for a spinning black hole with no electric charge.
- **The spin is limited to below 1,** because the formulas describe black holes up to, but not including, the fastest possible spin. (The experiment does not say what happens at exactly 1.)
- **The last safe orbit is defined as in Experiment 3:** the innermost circular orbit that survives a tiny nudge. The experiment does not follow the probe's path to show this; it places the edges using the given formulas.
- **Spin does not change the black hole's mass** in this experiment. The same black hole is compared at different spins, which is why distances are given in reference radii.
- **The experiment stops at the horizon.** Nothing inside it is modeled.

### Not introduced

The probe's actual path in a spinning black hole's gravity, tilted orbits, the ergosphere as a drawn region (named in one sentence by the tutor only), the energy that can be extracted from the black hole's spin itself, where the released energy goes and how a gas disk turns it into light, brightness, what the traveler sees, charged black holes, Hawking radiation (the next planned experiment), and anything inside the horizon. All explicitly out of scope (`CLAUDE.md` §16). The tutor may name a few of them in one sentence each as things the model does not cover.

---

## Physics Model

One new, self-contained module, in the style of Experiments 2 to 7. It **reuses** earlier code unchanged (imported, not redefined): `horizonRadiusKm` and `OBJECT_PRESETS` from Experiment 1 of this group (`blackHoleSizeExperiment.ts`). It **restates** the Kerr formulas above in its own file. A regression test checks that the module does not import any other experiment's module (Decision 2 of Experiment 7's precedent).

```typescript
// src/physics/spinningBlackHoleExperiment.ts

export const MIN_SPIN = 0
export const MAX_SPIN = 0.99                    // the largest spin the learner can choose (Decision 3)
export const BLACK_HOLE_PRESETS: ObjectPreset[]

export type Direction = 'with' | 'against'

// All radii below are in reference radii (r_s = 2GM/c^2 of the same black hole with no spin).
export function horizonRadius(spin: number): number
export function lastSafeOrbitRadius(spin: number, direction: Direction): number
// 1 - E, where E is the energy per unit rest-mass energy of a circular orbit at the last safe orbit.
export function energyReleasedFraction(spin: number, direction: Direction): number

export interface SpinningBlackHoleResult {
  preset: ObjectPreset
  referenceRadiusKm: number          // Experiment 1's horizon radius for this black hole
  spin: number
  horizon: number
  lastSafeWith: number
  lastSafeAgainst: number
  noSpinLastSafe: 3                  // Experiment 3's value, for the dashed reference ring
  energyReleasedWith: number         // fraction of rest-mass energy given up on the way down to the last safe orbit, with the spin
  energyReleasedAgainst: number      // the same, against the spin
  curve: Array<{ spin: number; horizon: number; lastSafeWith: number; lastSafeAgainst: number; energyReleasedWith: number; energyReleasedAgainst: number }> // spin 0 to the chosen spin, for the animation and the graph
}

export function runSpinningBlackHoleExperiment(presetId: ObjectPreset['id'], spin: number): SpinningBlackHoleResult
```

Structured independently of the UI (`CLAUDE.md` §9): pure functions, testable with no browser. The playback speed (a fixed real duration, independent of the result) does not change any result (`CLAUDE.md` §11). Both functions throw a `RangeError` for a spin below 0 or at or above 1.

---

## Learner Controls

- **The black hole:** a stellar black hole (10 Suns), Sagittarius A*, or M87*.
- **The spin:** presets **0, 0.5, 0.9, 0.99** (Decision 3). The distances in reference radii and in kilometers are shown beside the result.
- **Run,** which "spins the black hole up" from 0 to the chosen spin over a fixed real duration (10 seconds) independent of the physics (`CLAUDE.md` §11), moving the three markers along the computed curve.

There is no control for the probe's direction: both directions are always shown, side by side, so the learner sees the contrast (`CLAUDE.md` §14.2). A spin of 0 simply shows the three markers coinciding with Experiment 3's picture.

---

## Prediction Activity

Before running, the learner answers four questions, all required before Run is enabled (the same gating as Experiments 5 to 7). Wording below is a draft for the owner's review (§28.1):

1. "Suppose the black hole spins and a probe circles **the same way** as the spin. Compared with a black hole that does not spin (3 horizon radii), where do you think the last safe orbit is?" (Closer to the black hole / The same place / Farther from the black hole.) The model's answer is the first.
2. "Now the probe circles **against** the spin. Where do you think the last safe orbit is, compared with no spin?" (Closer / The same place / Farther.) The model's answer is the third.
3. "As the black hole spins faster, does its horizon (the point of no return) get bigger, stay the same size, or get smaller?" (Bigger / The same size / Smaller.) The model's answer is the third.

Nothing about the answers is shown before Run (§12). Wording avoids the word "dragging", which would give away Questions 1 and 2.
4. "A probe slowly spirals down to its last safe orbit, giving up some of its energy on the way. Which probe do you think gives up more, when the black hole spins fast?" (The one circling with the spin / The one circling against the spin / They give up the same.) The model's answer is the first. (Added with Decision 4; wording for the owner's review.)

---

## Experiment Behavior

1. The learner answers the four predictions. Run is disabled until all four are answered.
2. The learner picks a black hole and a spin, and presses Run. The first Run locks the predictions in.
3. The black hole is "spun up" from 0 to the chosen spin over 10 seconds of playback. The horizon shrinks, the with-spin ring moves inward and the against-spin ring moves outward.
4. The pictures and the Results appear (Results only when the run has ended).
5. Changing the black hole or the spin hides the pictures again. "Change predictions" reopens the predictions without resetting the choices, as in Experiments 5 to 7.

### Display

- **Picture 1, "The map: where the safe orbits are" (a top-down map).** The black hole at the center, with a black disk for the horizon (labeled "horizon"), a dashed grey ring at 3 reference radii (labeled "last safe orbit with no spin (Experiment 3)"), a **green ring** for "last safe orbit, circling with the spin" and a **rose ring** for "last safe orbit, circling against the spin". A curved arrow around the center shows which way the black hole turns, labeled "spin", and each ring carries a small arrow showing its circling direction, labeled "with the spin" or "against the spin". Distances are drawn to scale, with a scale bar in reference radii. During playback the rings and the horizon move. A readout gives the spin and each edge's distance in reference radii and in kilometers.
- **Picture 3, "Energy released on the way down" (two bars and a graph).** Two bars, "circling with the spin" (green) and "circling against the spin" (rose), for the chosen spin, with the no-spin value (5.7%) as a dashed grey line; the bars grow during playback. Beside them, a graph of the energy released against the spin, one green and one rose curve, with a dot on each for the current spin. Labeled on the canvas, with its own caption.
- **Picture 2, "How the edges move as the spin grows" (a graph).** Horizontal: the spin, from 0 to the chosen value. Vertical: distance from the center in reference radii. Three curves: the horizon (black), the with-spin edge (green) and the against-spin edge (rose), with the dashed grey line at 3 and a dot on each curve for the current spin during playback.
- Each picture has a **"How to read this picture" caption** directly under it, including "What is really happening" and "How the picture shows it", as in Experiments 6 and 7 (draft wording, for the owner). Each caption defines "reference radius" and says that distances are measured from the center.
- Every drawn part is labeled directly on the canvas; the with-spin and against-spin rings are in different colors and also differ in the label and the arrow, so the contrast does not rely on color alone (`CLAUDE.md` §14).
- The pictures and the readout appear only after the first Run (§12).

### Results

Shown only when the run has ended and the predictions are locked in. States the black hole and spin; the horizon, the with-spin edge and the against-spin edge in reference radii and in kilometers; gives the energy released in each direction and for no spin; compares all four predictions with the model; includes simple math per `CLAUDE.md` §15 (for example, the energy released `1 − E` worked at spin 0.9 with the spin: `E ≈ 0.844`, so `1 − 0.844 ≈ 15.6%`, about 2.7 times the no-spin 5.7%; and,  at spin 0.9: the with-spin edge 1.160 and the against-spin edge 4.359 reference radii, so the ratio `4.359 ÷ 1.160 ≈ 3.8`, and in kilometers for the 10-Sun black hole `1.160 × 29.5 ≈ 34 km` and `4.359 × 29.5 ≈ 129 km`); a daily-life comparison (Decision 5); and the model's limits in a prominent bordered box (§28.1 pattern).

### Introductory text

To be drafted during implementation, covering the question, what happens (step by step), the learner's job, what to look for, new terms defined in plain language before use (**spin** with its everyday meaning, **circling with the spin / against the spin**, **reference radius**, with **horizon**, **last safe orbit** and **horizon radius** recalled from Experiments 1 and 3), what it builds on (Experiment 3's last safe orbit), a "Why even ask this" paragraph following Experiments 5 to 7 (put the learner in the position of someone planning to orbit a real black hole, which usually spins, and ask whether the safe distance is the same as for the one they already studied), and the assumptions. It must not contain the prediction answers or the word "frame dragging" (§12, §15).

---

## AI Tutor Behavior

Follows the sequence of Experiments 5 to 7 (draft; wording for the owner's review):

1. **Observation:** "Look at the map and the graph. What happens to the green ring and the rose ring as the black hole spins up? Which way does each move?"
2. **Compare with predictions:** the tutor says whether each of the four predictions matches the model, from the physics module's numbers.
3. **Conceptual question:** "At spin 0.9 the green ring is closer in than 3 horizon radii and the rose ring is farther out. The black hole is the same, and so is the mass. Why might the direction of the probe's circling matter?" Intended to let the learner reason before the explanation.
4. **Explanation:**
   1. A black hole can spin, described by one number from 0 to just under 1.
   2. Space near a spinning black hole is dragged around with it, called frame dragging (stated, not derived), like honey being dragged around by a spinning spoon, with the caution that it is only a comparison.
   3. A probe circling with the drag is carried along by it and stays in orbit closer in; a probe circling against it must fight it and needs more room.
   4. The numbers: with the spin the edge goes from 3 to 1.16 at spin 0.9; against it goes from 3 to 4.36.
   5. The horizon shrinks as the spin grows (1 to 0.718 at spin 0.9).
   5a. Closer in means more energy given up: 5.7% of rest-mass energy with no spin, 15.6% with the spin at spin 0.9, 3.9% against it (a probe giving up energy on a gradual descent; where it goes is not modeled).
   6. The result is the same for all three black holes in reference radii.
   7. What the model does not cover: the probe's path, the ergosphere (named in one sentence), and how real black holes' spins are measured (Decision 6).
5. The tutor may only state results from the physics module; it never invents physics (§13).

---

## Required Physics Tests

(Tests verify physical behavior, `CLAUDE.md` §10.)

1. `horizonRadius(0)` is 1; `horizonRadius` equals `(1 + √(1 − a²)) ÷ 2` at several spins, written independently in the test file; it throws a `RangeError` for a spin below 0 or at or above 1.
2. `lastSafeOrbitRadius(0, 'with')` and `(0, 'against')` are both 3 (Experiment 3), within 1e-9.
3. At spin 0.5, 0.9 and 0.99 the with-spin and against-spin edges match the table above (2.117, 3.777; 1.160, 4.359; 0.727, 4.486) to the digits shown.
4. As the spin approaches 1 (0.9999 and 0.999999), the with-spin edge approaches 0.5 and the against-spin edge approaches 4.5.
5. **Independent check of the formula:** the edge for a probe circling with the spin satisfies the condition that the energy per unit mass of a circular orbit is lowest there (the orbit's energy, written independently in the test file from the standard equatorial circular-orbit energy, has its minimum at the computed radius, found by stepping the radius, within 0.1%). The same for the against-spin edge.
6. For every spin from 0 to 0.99, the with-spin edge is smaller than the against-spin edge, and both are larger than the horizon.
7. Monotonic: as the spin increases, the horizon and the with-spin edge never increase, and the against-spin edge never decreases (checked over a fine grid).
8. The result is identical for all three black holes in reference radii; only `referenceRadiusKm` differs, matching Experiment 1's horizon radii (29.5 km, about 12.7 million km, about 19 billion km).
9. The `curve` starts at spin 0 with the Experiment 3 values (1, 3, 3), ends at the chosen spin, and is monotonic.
10. Out-of-range spins (below 0, at 1, above 1, NaN) throw a `RangeError`.
11. Determinism: the same inputs give the same result.
12. **Energy released:** `energyReleasedFraction(0, ·)` equals `1 − √(8/9)` (5.72%); at spins 0.5, 0.9 and 0.99 it matches the values above (8.21% and 4.51%; 15.58% and 3.90%; 26.4% and 3.79%); at spin 0.999999999999 it is within 0.1% of `1 − 1/√3` (with) and `1 − √(25/27)` (against); the circular-orbit energy is written independently in the test file from the formula above; with the spin it rises with spin and against it falls (fine grid).
13. A regression test: the module imports no other experiment's module other than Experiment 1's `blackHoleSizeExperiment`.

The tests will also be checked for vacuity (deliberately changing a sign, a constant and a root and confirming a test fails), as in Experiments 6 and 7.

---

## Decisions Needing Human Review

Each has Claude's recommended default; the owner may change any.

1. **Show a map of edges, or simulate the probe's path?** **Decided (2026-10-12, owner: "choose what is best"): the map.** It is the best fit because the path needs the full equations of motion in a spinning black hole's gravity, a lot of new physics and testing, and the map shows the contrast directly. Default: a map of the horizon and the two last-safe-orbit edges from the given formulas, with a "spin up" playback (§11: playback is presentation only). Alternative: integrate the probe's path in the spinning black hole's gravity (nudged orbits that circle or plunge), as Experiment 3 did for the non-spinning case. This needs the full equations of motion in a spinning black hole's gravity, a significant amount of new physics and testing, and is recommended as a possible later experiment.
2. **Units: "reference radius".** **Agreed (2026-10-12).** Default: all distances in reference radii (the horizon radius the same black hole would have with no spin), so the same black hole at different spins can be compared and the numbers match Experiments 1 to 7. Alternative: use the spinning black hole's own horizon radius as the unit, which makes the unit shrink as the spin grows and hides the effect.
3. **Spin presets and the largest spin.** **Agreed (2026-10-12).** Default: 0, 0.5, 0.9, 0.99, with 0.99 the largest. Alternative: add 0.998 (a value often quoted as a practical upper limit for real black holes, not checked against a source here). The experiment must explain that 1 is a limit.
4. **The energy released.** **Decided (2026-10-12): added as a second idea.** The text below is the earlier default and alternative, kept for the record. Default: the horizon's shrinking is shown but treated as secondary, and frame dragging is introduced only in the tutor's explanation. Alternative: also include how much energy a probe loses as it spirals in from the last safe orbit (about 5.7% of its rest-mass energy with no spin, about 15.6% at spin 0.9 with the spin, computed in the feasibility check; not checked against a source), which would add a second idea.
5. **Daily-life example for frame dragging.** **Agreed (2026-10-12): honey around a spinning spoon; its wording still needs the owner's line-by-line approval (§28.1).** Default: honey around a spinning spoon, with the caution that it is only a comparison. To be confirmed by the owner (§15, §28.1). Alternative: a boat in a whirlpool, with or against the current.
6. **Real-world grounding.** Default: the tutor may say in one sentence that astronomers estimate real black holes' spins, and that most real black holes are thought to spin, as named, unchecked general knowledge (marked "not checked against a primary source"). Alternative: omit.
7. **Prediction 3 (the horizon's size).** Default: included. It is the least guessable of the three. Alternative: replace it with "does a with-spin probe's edge ever reach the horizon?".
8. **Spin limited below 1.** Default: yes, stated to the learner. Alternative: allow 1 (the formulas still give values, but the horizon and the edges coincide, which the model would need to explain).
9. **Not checked against a primary source:** the Kerr horizon and last-safe-orbit formulas, the circular-orbit energy formula, the frame-dragging statement and the energy figures are standard general relativity stated from general knowledge. Claude checked them only against the known limits (1 and 3 at spin 0; about 0.5 and 4.5 reference radii as the spin approaches 1; a minimum-energy check in the tests) and against values Claude recalled (2.32 and 8.72 `M` at spin 0.9). A check against a textbook or paper before approval is recommended.

---

## Relationship to Previous Experiments

- **Black Holes Experiment 3 (orbits near a black hole):** the last safe orbit at 3 horizon radii is this experiment's starting point (spin 0) and its dashed reference ring.
- **Black Holes Experiment 1 (how small a black hole):** the horizon radius and the three black holes.
- **Black Holes Experiments 2, 5, 6 and 7:** this experiment shares their habit of stating results in horizon radii (here, reference radii) so that they do not depend on the mass.
- **Gravity and Curved Spacetime Experiment 6 (orbits):** the idea of an orbit as sideways motion that keeps missing.

## Relationship to Later Experiments

- **Hawking radiation (planned as Experiment 9, per the owner's recollection):** the next and last experiment of the four asked for. It is not proposed here.
- No further experiment is planned or approved.

---

## Success Criteria

The experiment is complete when:

1. The learner can choose a black hole and a spin, and run the "spin up".
2. Picture 1 shows the horizon, the dashed no-spin ring and the two last-safe-orbit rings, to scale, each labeled on the canvas, with the with-spin and against-spin rings visually distinct. Picture 3 shows the energy released in each direction against the no-spin value.
3. All three pictures label every drawn component and carry their own "How to read this picture" caption (`CLAUDE.md` §14).
4. All four predictions are required before Run, and nothing is revealed before the run (§12).
5. Results compare each prediction with the model and include the simple math.
6. The tutor follows the sequence above and states only results from the physics module.
7. Every specialized term is defined before it is used, and "frame dragging" is introduced only at the tutor's explanation (§15).
8. All required physics tests pass and none is vacuous; the physics is separate from the interface (§9); playback speed cannot change a result (§11).
9. The complete flow is tested in a browser at 1200 and 390 pixels, and the final review against `docs/PROJECT.md`, `AGENTS.md` and this specification is recorded.

---

## Implementation Notes

- **Drafted (2026-10-12):** this specification only. Nothing is implemented. The feasibility numbers above were computed in a scratch script outside the project on 2026-10-12 (the formulas as written above; at spin 0 they give 1, 3 and 3; at spin 0.9 they give 1.436 M, 2.321 M and 8.717 M, which are 0.718, 1.160 and 4.359 reference radii; the energy figures for Decision 4 come from the standard circular-orbit energy, also computed there). They have not been checked against a primary source.

- **Step 1, physics model and physics tests (2026-10-12):** built `src/physics/spinningBlackHoleExperiment.ts` and `src/physics/spinningBlackHoleExperiment.test.ts` (25 tests covering all 13 "Required Physics Tests"). Only `horizonRadiusKm` and `OBJECT_PRESETS` are imported (from Experiment 1); the Kerr formulas are restated in the module. **Source check (Decision 9):** the last-safe-orbit formula (Bardeen, Press and Teukolsky, 1972) and the circular-orbit energy formula were compared with a web search that quotes them (the Wikipedia article on the innermost stable circular orbit and papers on arXiv); they match this specification. The 1972 paper itself was not read, and the horizon formula was not searched (it is the standard Kerr horizon). **Independent checks in the test file:** the circular-orbit energy written separately from the module, with the last safe orbit found as the radius of lowest energy by stepping the radius (within 0.1%, both directions, four spins); the limits at spin 0 (3 and 3; 5.72%) and as the spin approaches 1 (0.5 and 4.5 reference radii; 42.3% and 3.77%); the values in this specification's tables. **Checked that the tests are not vacuous:** nine deliberate changes to the module (the sign in the horizon, the two directions swapped, a constant in Z1, the sign of the spin term in the energy, its denominator, returning E instead of 1 − E, dropping the division by 2, the end of the curve, and the largest spin) each failed 2 to 15 tests. **Differences from the interface in this specification, for the owner:** (1) `energyReleasedFraction` and the `CurvePoint` type are exported, and `noSpinLastSafe` is typed `number`, not the literal `3`; (2) the result also carries `noSpinEnergyReleased` (5.72%), for Picture 3's dashed reference line, which "Display" describes but the interface did not list; (3) the curve has 101 evenly spaced spins; (4) `runSpinningBlackHoleExperiment` throws a `RangeError` for a spin above 0.99 (the largest the learner can choose), while the three formula functions accept spins up to, not including, 1; (5) the circular-orbit energy and the last-safe-orbit radius are kept private (in units of M) and only the reference-radius versions are exported. Full Vitest run: 621 passed (596 before). No type errors in the new files (the type checker reports errors in other, older files, which this step did not touch). **Not built yet:** the interface, predictions, introduction, Results, tutor and wiring into `src/App.tsx`.

- **Step 1 differences approved (2026-10-12):** the owner approved the five differences listed in the Step 1 note above; the interface listing in "Physics Model" above is superseded by the built module where they differ.
