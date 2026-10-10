# Black Holes and Strong Gravity — Experiment 2: Time Near a Black Hole — Does a Clock Ever Stop?

**Status: APPROVED by the owner on 2026-10-10, with all eleven "Decisions Needing Human Review" items taken as Claude's recommended defaults. Proposed by Claude per `CLAUDE.md` §23 Stages 1–2 and drafted as a specification per Stage 3 on 2026-10-10, as the second of the five experiments planned for this group (see the group list in Experiment 1's specification). Being built one step at a time (§6); see "Implementation Notes" for progress.**

---

## Overview

Gravity and Curved Spacetime Experiment 2 showed that a clock higher up in a gravitational field ticks faster than a clock lower down, using an exaggerated, first-order "strength" control. Experiment 9 (GPS) then used the same first-order idea with real Earth numbers, where the effect is tiny. Both said plainly that the exact theory is different and was left out.

Experiment 1 of this group found the **horizon radius**, `r_s = 2GM/c²`, and showed that real objects sit enormously far outside it (the Sun by about 236,000 times, Earth by about 720 million times). This experiment asks the question those two results lead to: **how much does gravity slow a clock when you get close to a horizon, where gravity is as strong as it ever gets?**

The new idea is one thing: **a clock that hovers at rest at a distance `r` from a black hole ticks more slowly than a clock far away, by the exact factor `√(1 − r_s / r)`.** This factor depends only on the ratio `r ÷ r_s` (how many horizon radii away the clock is), not on the black hole's mass. Far away it is almost exactly 1 (no slowing). It shrinks as the clock gets closer, and it reaches zero at the horizon: to a far-away observer, a clock hovering ever closer to the horizon ticks ever more slowly, without limit.

The learner picks a black hole and a hovering distance, runs a far-away clock and the hovering clock side by side, and sees the two readings drift apart. A second picture compares the exact factor with the simple first-order one from Experiments 2 and 9 of the Gravity chapter, so the learner sees where that earlier approximation was good (far from the horizon, including everywhere in the Gravity chapter) and where it fails badly (close to it).

The experiment is a **thought experiment** about two clocks held at rest. It says nothing about what a traveler who falls toward the black hole experiences; that is Experiment 5 of this group (planned, not approved), and the specification says so plainly so that the learner does not leave thinking "time stops at the horizon" describes a falling traveler.

---

## Learning Objective

After this experiment, the learner should understand:

1. A clock that hovers near a black hole ticks more slowly than an identical clock far away. This is gravitational time dilation, the same effect as Gravity Experiments 2 and 9, now at full strength.
2. The slowing factor is `√(1 − r_s / r)`. It depends only on how many horizon radii away the clock is. A clock hovering at 2 horizon radii from a 10-Sun black hole and one at 2 horizon radii from M87* (650 million times heavier) tick at exactly the same relative rate, about 0.71 of the far-away rate.
3. The factor falls toward zero as the clock approaches the horizon. At 1.01 horizon radii it is about 0.10, so the hovering clock registers about one second for every ten on the far-away clock. At the horizon itself the formula gives zero.
4. The simple first-order formula used in Gravity Experiments 2 and 9 is an accurate approximation far from the horizon (within about 0.14% at 10 horizon radii), which is why it served for Earth and GPS. It is a poor one near the horizon (at the horizon it gives 0.5, where the exact answer is 0).
5. Real objects show the same effect at very different sizes: about 0.7 billionths of a second per second at Earth's surface, about 2 millionths at the Sun's surface, and about 19% slower at a neutron star's surface.
6. What the experiment does not say: what a falling traveler experiences, what happens inside the horizon, how a clock could be held in place, and what a spinning black hole does.

---

## Physical Situation

A black hole of known mass, and two identical clocks:

- a **far-away clock**, so far from the black hole that gravity has no effect on it (the reference);
- a **hovering clock**, held at rest at a chosen distance `r` from the black hole's center, outside its horizon.

Both clocks start together. The far-away clock runs for a fixed span of its own time. The quantity followed is the reading of the hovering clock at the end of that span, and the ratio of the two readings, which is the slowing factor.

### The formula (given, not derived)

`factor = √(1 − r_s / r)`

where `r_s = 2GM/c²` is the horizon radius from Experiment 1 and `r` is the distance from the center, in the same units. The factor is the hovering clock's rate divided by the far-away clock's rate. It is exact in general relativity for a **non-rotating, uncharged** black hole and for a clock at rest at radius `r`. It is stated and used here, not derived: deriving it needs Einstein's equations, which are outside this project (as with `r_s` itself in Experiment 1).

The same factor applies to light signals. If the hovering clock sends a pulse at each of its ticks, the pulses reach the far-away observer spaced by `1 ÷ factor` of the hovering clock's tick time, which is the redshift of Gravity Experiment 2 at full strength. (The signals' travel time is the same for every pulse from a clock at rest, so it does not change the spacing.)

### The first-order version (for comparison only)

`factor (first order) = 1 − r_s / (2r)`

This is the weak-gravity formula behind Gravity Experiments 2 and 9, written in real units (`1 − GM / (r c²)`). It is shown only to be compared with the exact one. It is always above the exact factor, and the two agree closely only when `r` is many horizon radii.

### The black holes

Reused unchanged from Experiment 1: the stellar black hole (10 Suns, horizon radius about 29.5 km), Sagittarius A* (about 4.3 million Suns, about 12.7 million km, about 0.085 AU), and M87* (about 6.5 billion Suns, about 19 billion km, about 128 AU). The factor is identical for all three at the same `r ÷ r_s`; only the distances in kilometers differ. For example, 2 horizon radii is about 59 km from the stellar black hole, about 25 million km from Sagittarius A*, and about 38 billion km (about 257 AU) from M87*.

### Illustrative numbers (computed from the formula; the specification's tests check them)

| Distance | Exact factor | First-order factor | Hovering clock reads, when far-away clock reads 60 s |
|---|---|---|---|
| 100 horizon radii | 0.9950 | 0.9950 | 59.70 s |
| 10 | 0.9487 | 0.9500 | 56.92 s |
| 3 | 0.8165 | 0.8333 | 48.99 s |
| 2 | 0.7071 | 0.7500 | 42.43 s |
| 1.5 | 0.5774 | 0.6667 | 34.64 s |
| 1.1 | 0.3015 | 0.5455 | 18.09 s |
| 1.01 | 0.0995 | 0.5050 | 5.97 s |
| 1.001 | 0.0316 | 0.5005 | 1.90 s |

### Real surfaces, for scale (from Experiment 1's real objects, same formula)

| Object (surface) | `r_s ÷ r` | Slowing compared with far away |
|---|---|---|
| Earth | about 1.4 × 10⁻⁹ | about 0.7 billionths of a second lost per second (about 60 millionths of a second per day) |
| The Sun | about 4.2 × 10⁻⁶ | about 2.1 millionths of a second per second (about 0.18 second per day) |
| A neutron star | about 0.34 | about 19% slower |

(Neutron star: the 12 km radius is the round value from Experiment 1, inside an observed range. The formula applies outside the object's surface, which is where these clocks sit.)

### Simplifying assumptions (must be stated to the learner, in plain language)

- **A thought experiment.** The hovering clock is held at rest by something the experiment does not describe. In real life that would take engines whose push must grow larger and larger the closer the clock is to the horizon, without limit. This is not modeled.
- **Only the comparison of two clocks at rest is shown.** It says nothing about a clock that is falling, orbiting, or moving.
- **The black hole is non-rotating and uncharged,** the simplest case. A spinning black hole is different and more complicated.
- **The far-away clock is treated as infinitely far, so gravity does not affect it at all.** In practice, "far" means many horizon radii away.
- **The formula is the exact one for this simplest case, given and not derived.** The first-order formula shown beside it is an approximation, labeled as such.
- **"Distance" is the radius as used in Experiment 1** (the circumference divided by 2π). The difference between that and a distance measured inward is not discussed.
- **What happens inside the horizon is not modeled.** The formula applies only outside it. A clock cannot hover inside, so the experiment's story stops at the horizon.

### Not introduced

What a clock falling in experiences (Experiment 5 of this group), orbits (Experiment 3), light bending (Experiment 4), tidal forces, the photon sphere, redshift as a color seen by a telescope, the Schwarzschild metric as a named object, spinning (Kerr) black holes, anything inside the horizon, Hawking radiation, and how a clock could be held in place. Time dilation from motion (Relativity of Time and Motion Experiments 3 and 4) is not part of this experiment: the hovering clock is at rest. All out of scope, consistent with a single new idea (`CLAUDE.md` §16). The tutor may name a few of these in one sentence each as things the model does not cover.

---

## Physics Model

One new, self-contained module. It **reuses** earlier code unchanged (imported, not redefined):

- `horizonRadiusKm`, `radiusInHorizonRadii` and `OBJECT_PRESETS` from Experiment 1 of this group (`blackHoleSizeExperiment.ts`), which already import the real constants from Cosmology Experiments 1 and 4.

It does **not** import Gravity Experiment 7's made-up units (`blackHoleExperiment.ts`), and it does **not** import any Gravity-chapter module's physics (the first-order formula here is one line, restated, and a test checks it against Experiment 9's own number). This is checked by a regression test (see "Required Physics Tests").

```typescript
// src/physics/timeNearBlackHoleExperiment.ts

export const FAR_CLOCK_RUN_SECONDS = 60          // simulated time on the far-away clock; presentation only
export const MIN_DISTANCE_IN_HORIZON_RADII = 1.001
export const MAX_DISTANCE_IN_HORIZON_RADII = 100

// The three black holes only (Experiment 1's presets that have no real radius).
export const BLACK_HOLE_PRESETS: ObjectPreset[]

// The exact factor, sqrt(1 - r_s / r), as a function of distance in horizon radii.
// Defined for distance >= 1: returns 0 at exactly 1. Throws RangeError for distance < 1
// (a clock cannot hover inside the horizon).
export function exactSlowingFactor(distanceInHorizonRadii: number): number

// The first-order factor, 1 - r_s / (2 r), for comparison only.
export function firstOrderSlowingFactor(distanceInHorizonRadii: number): number

export interface TimeNearBlackHoleResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  distanceInHorizonRadii: number
  distanceKm: number
  exactFactor: number
  firstOrderFactor: number
  farClockReadingSeconds: number          // FAR_CLOCK_RUN_SECONDS
  hoveringClockReadingSeconds: number     // exactFactor x far-clock reading
  curve: Array<{ distanceInHorizonRadii: number; exact: number; firstOrder: number }>   // log-spaced, 1.001 to 100
}

export function runTimeNearBlackHoleExperiment(
  presetId: ObjectPreset['id'],
  distanceInHorizonRadii: number
): TimeNearBlackHoleResult

// The two clocks' readings at an elapsed far-away time, for the animation and the graph.
export function clockReadingsAt(
  result: TimeNearBlackHoleResult,
  farElapsedSeconds: number
): { far: number; hovering: number }

// Real surfaces for scale: for 'earth' | 'sun' | 'neutron-star', the factor at the object's real radius.
export function surfaceSlowing(presetId: 'earth' | 'sun' | 'neutron-star'): {
  rsOverR: number
  exactFactor: number
  fractionSlower: number                 // 1 - exactFactor
}
```

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser. One shared formula produces the hovering clock's reading and the curve, the same "one shared formula" pattern as Gravity Experiment 2. The animation's playback speed is set by the interface and does not change any result (`CLAUDE.md` §11).

---

## Learner Controls

- **The black hole:** a stellar black hole (10 Suns), Sagittarius A*, or M87*.
- **The hovering distance,** in horizon radii: a logarithmic slider from 100 down to 1.001, with presets **100 ("far")**, **10**, **3**, **1.5**, **1.1** and **1.01**. The distance in kilometers (and in AU where that is a more natural unit) is shown beside the horizon-radius value.
- **Run,** which plays both clocks over `FAR_CLOCK_RUN_SECONDS` of far-away time, at a fixed real playback duration independent of the physics result (`CLAUDE.md` §11).

---

## Prediction Activity

Before the controls and results are shown, the learner answers three questions in sequence (not scored):

1. "A clock hovers just outside a black hole's horizon, only 1% farther from the center than the horizon is. You watch it from far away. How fast does it tick compared with an identical clock next to you?" (About the same / about half as fast / about one tenth as fast / it has stopped.) The model's answer is the third (0.0995, about one tenth).
2. "Two clocks each hover at twice the horizon radius: one near a small black hole (10 Suns), one near a giant one (M87*, 650 million times as heavy). Which one ticks more slowly, compared with a clock far away?" (The one near the small black hole / the one near the giant black hole / the same.) The model's answer is the third (both about 0.71).
3. "In Experiments 2 and 9, we used a simple formula for how gravity slows clocks, and it worked well. Will that same simple formula still be accurate right next to a black hole's horizon?" (Yes, about as accurate / more or less accurate close in, but it fails badly right at the horizon / no, never accurate near a black hole.) The model's answer is the second: accurate far away, increasingly wrong close in. (The choices will be refined with the owner so that none is a trick; see Decision 7.)

The controls are disabled until all three predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the choices (the established pattern). The pictures, caption, Results and tutor appear only after predictions are locked in (`CLAUDE.md` §12).

---

## Experiment Behavior

### Display

Two pictures, then a live readout and caption, all hidden until predictions are locked in.

- **Picture 1, the two clocks.** A labeled layout with a **far-away clock** (gold) on the left and a **hovering clock** (a distinct color) beside a dark disk labeled "black hole" (its edge labeled "horizon") on the right. A distance ruler in horizon radii (logarithmic) shows where the hovering clock sits and where the horizon is. Each clock has a face with a seconds hand and a digital reading; during the run, both hands sweep, and the hovering clock's visibly lags. A small label gives the hovering distance in horizon radii and in kilometers (or AU) for the chosen black hole. The picture changes with the black hole (its distance labels, in kilometers, change by many orders of magnitude) while the two clocks' relative readings do not; the caption says so deliberately, since that is the point of the second prediction (`CLAUDE.md` §14).
- **Picture 2, the slowing factor against distance.** A graph with distance in horizon radii on a logarithmic axis (100 on the left down to 1 on the right, or the other way, chosen at build time) and the factor from 0 to 1 on the vertical axis. Two labeled lines: the **exact** factor (solid) and the **first-order** factor (dashed, labeled "the simple formula from Experiments 2 and 9"). A marker shows the chosen distance on the exact line. The gap between the two lines is the visual contrast between the two quantities the learner is meant to compare (`CLAUDE.md` §14.2). The horizon is drawn as a labeled vertical line where the exact line reaches zero and the dashed line is still at 0.5.
- **A second small graph (or the same panel as Picture 1) of the clocks' readings against far-away time,** as in Gravity Experiment 2's tick-count graph: a straight line for the far-away clock and a shallower straight line for the hovering clock, drawn progressively as the run plays. (Whether this is separate or part of Picture 1 is decided at build time.)
- **Live readout:** the black hole, the distance (horizon radii, and kilometers), both clocks' current readings, and the factor.
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are locked in, in the step-by-step style of the Cosmology experiments. It must say what each clock is, why the hovering clock lags, what the dashed line is, that the pictures are drawn to a logarithmic scale, and that the experiment compares two clocks at rest, not a falling traveler.

### Results

States the black hole and distance, the exact factor, and both clocks' readings at the end of the run ("the far-away clock read 60 s; the hovering clock read 5.97 s"); compares all three predictions with what the model gave; includes simple math per `CLAUDE.md` §15 worked through step by step (for example at 2 horizon radii: `r_s ÷ r = 0.5`, so `1 − 0.5 = 0.5`, and `√0.5 ≈ 0.71`, so in 60 seconds the hovering clock registers about 42 seconds); shows the exact and first-order factors side by side with their difference; shows, for the same ratio, the factor for the other two black holes ("the same, because only the ratio matters"); shows the short "real surfaces" table above (Earth, the Sun, a neutron star) for scale; includes a daily-life comparison; and states the model's limits in a prominent bordered box (`CLAUDE.md` §28.1 pattern).

The daily-life comparison (to be confirmed, kept out of the introduction so it does not reveal the answers): a swimmer holding position in a river just above a waterfall, who must paddle harder the nearer they are to the edge. It is an analogy for why holding a clock still near a horizon takes more and more push, and must say that it is **not** an analogy for the time slowing itself.

### Introductory text

To be drafted during implementation, covering the question (does gravity slow a clock enough to stop it?), what happens, the learner's job, what to look for, new terms defined in plain language before use (**hovering clock**, **far-away clock**), reuse of Experiment 1 of this group (the horizon radius) and Gravity Experiments 2 and 9 (gravity slows clocks, first order), a "Why even ask this" paragraph, and the assumptions above. The introduction says plainly that this experiment uses the exact formula where the earlier ones used a simple one, and that it is for two clocks at rest. Any statement that gives away the prediction answers (the zero at the horizon, the independence of mass) is kept out of the introduction (`CLAUDE.md` §12). Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form the three predictions; does not reveal any answer.
- **After "Run" completes:**
  1. Observation: "Look at the two clocks. Which one is behind, and by how much? Now try a different distance, and then a different black hole at the same distance in horizon radii. What changed, and what stayed the same?"
  2. Prediction comparison: the learner's three predicted answers beside what the model gave.
  3. Conceptual question: "A clock at 2 horizon radii from a small black hole and from a giant one ticks at the same relative rate, even though the giant one is 650 million times heavier. What do the two situations have in common?" — intended to let the learner reach "each clock is the same fraction of the way to its own horizon".
  4. Explanation: (1) the factor `√(1 − r_s / r)`, given from general relativity for a non-rotating, uncharged black hole, depends only on `r ÷ r_s`, with the worked 2-horizon-radii example; (2) it falls toward zero at the horizon, so a far-away observer sees a hovering clock tick ever more slowly the closer it is, and the formula gives exactly zero at the horizon, though no clock can actually hover there; (3) why: the same cause as Gravity Experiment 2 (clocks lower down in a gravitational field tick slower, and a light signal sent upward is stretched, i.e. redshifted); the exact version simply keeps the effect at full strength, where the first-order formula used in Experiments 2 and 9 is no longer accurate; (4) the first-order formula against the exact one, with real numbers: within 0.14% at 10 horizon radii, 6% too high at 2, and 0.5 against 0 at the horizon; this is why Experiments 2 and 9 were accurate (Earth sits about 700 million horizon radii out); (5) real surfaces: Earth, the Sun, a neutron star; (6) a plain statement that this compares two clocks at rest, and that what a traveler falling into a black hole experiences is not the same and is the subject of a later experiment (planned, not approved); (7) honest limits: a thought experiment, non-rotating and uncharged, the formula given and not derived, and nothing inside the horizon is modeled.

---

## Required Physics Tests

1. `exactSlowingFactor(x)` equals `√(1 − 1/x)` at several `x` (for example 4 gives `√0.75`, 2 gives about 0.7071).
2. `exactSlowingFactor(1)` is exactly 0; `exactSlowingFactor(x)` for `x < 1` throws a `RangeError`.
3. `exactSlowingFactor` is strictly increasing in `x` and approaches 1 for large `x` (above 0.999999 at 10⁶ horizon radii).
4. For all three black holes, `runTimeNearBlackHoleExperiment` gives the same `exactFactor` at the same `distanceInHorizonRadii`, while `distanceKm` differs in proportion to the horizon radius (the factor depends only on the ratio).
5. `distanceKm` equals `distanceInHorizonRadii × horizonRadiusKm(mass)`, and `radiusInHorizonRadii(distanceKm, mass)` (Experiment 1's function) returns the distance in horizon radii.
6. `firstOrderSlowingFactor(x)` equals `1 − 1/(2x)`; it is greater than `exactSlowingFactor(x)` for every `x > 1`; the two agree within 0.2% at `x = 10` and within 0.01% at `x = 100`; at `x = 1` it equals 0.5 while the exact factor is 0.
7. The first-order formula matches the Gravity chapter: for Earth's mass and radius and the GPS orbital radius, the difference between the first-order factors at the satellite and at the ground matches `runGpsTimeDilationExperiment(...).gravityEffectFraction` within 1% (this checks the one-line restatement against Experiment 9's own number; the module itself does not import Experiment 9's code).
8. `hoveringClockReadingSeconds` equals `exactFactor × farClockReadingSeconds`; `clockReadingsAt` is linear in far-away time, gives `{ far: t, hovering: factor × t }`, and is 0 at `t = 0`.
9. Checked values from the table above: the exact factors at 100, 10, 3, 2, 1.5, 1.1, 1.01 and 1.001 horizon radii each match to four decimal places.
10. `surfaceSlowing`: Earth's `fractionSlower` is about 6.95 × 10⁻¹⁰, the Sun's about 2.12 × 10⁻⁶, and a neutron star's about 0.190, each within 1%.
11. The `curve` is log-spaced from 1.001 to 100, the exact values are monotonic and below the first-order values at every point.
12. The module imports `horizonRadiusKm`, `radiusInHorizonRadii` and `OBJECT_PRESETS` from `blackHoleSizeExperiment`, and does not import from `blackHoleExperiment` — a regression check (`CLAUDE.md` §8).
13. Deterministic across repeated calls, independent of any UI or animation state.

---

## Decisions Needing Human Review

Each shows Claude's recommended default as used above.

1. **Title.** Default: "Time Near a Black Hole: Does a Clock Ever Stop?" Alternatives: "Time Near a Black Hole" alone, or "How Slowly Can a Clock Tick?".
2. **The hovering-clock framing.** Default: a clock held at rest at distance `r`, compared with a far-away clock, with an explicit caveat that holding it there takes ever more push and is not modeled. Alternative: describe only signals sent from near the black hole to far away (no "hovering"). The hovering framing is simpler to picture; the signals framing avoids having to say anything about holding a clock in place.
3. **Including the first-order comparison (Picture 2, Prediction 3, tutor points 3 and 4).** Default: include, since it closes the caveat Gravity Experiments 2 and 9 left open ("the exact theory is different") and uses the same idea at a larger scale. Alternative: leave the comparison out, shortening the experiment to the exact formula only. Including it adds a second quantity for the learner to compare, which `CLAUDE.md` §14 asks to be visually contrasted (done by the two lines in Picture 2).
4. **Which black holes, and the "real surfaces" table.** Default: the three black holes from Experiment 1 (the factor is the same for all, which is the point of Prediction 2), plus a small table in the Results for Earth, the Sun and a neutron star computed from the same formula and Experiment 1's real radii, to connect back to the earlier chapters. Alternative: a single black hole with no object choice, or all six objects as selectable (the last needs hovering distances in the millions of horizon radii for Earth and the Sun, which would complicate the slider).
5. **Closest hovering distance.** Default: 1.001 horizon radii, so the learner cannot place a clock exactly at the horizon. The tutor states that the formula gives zero there and that no clock can hover there. Alternative: add an "exactly at the horizon" preset that shows zero. Claude leans against it, since it suggests a clock sits at the horizon.
6. **Run length.** Default: 60 seconds of far-away time (`FAR_CLOCK_RUN_SECONDS`), played at a fixed real duration. A presentation constant, not physics.
7. **Three predictions or two,** and the exact choices for Prediction 3. Default: three. Alternative: drop Prediction 3 and keep the first-order comparison as a Results and tutor point only. The wording of Prediction 3's choices needs the owner's review, since none should read as a trick.
8. **How much to say about "time stops at the horizon".** Default: say plainly that this is a far-away observer's comparison of two clocks at rest, that the formula gives zero at the horizon, and that a falling traveler's experience is different and is the subject of a later experiment. This guards against a well-known misunderstanding without teaching the answer here (Experiment 5's job).
9. **The daily-life comparison** (a swimmer above a waterfall, for the push needed to hover). Default as above, kept out of the introduction, and labeled as an analogy for the push, not for the time slowing. The owner may prefer a different comparison or none.
10. **Real-world grounding.** Default: none beyond the real black-hole masses (from Experiment 1) and the real-surface table. Claude did not add a mention of any film or of laboratory measurements of the height effect, since these are not in the project so far and would need checking against sources.
11. **Not checked against a primary source:** the formula `√(1 − r_s / r)` for a static clock is standard general relativity, but was stated here from general knowledge, as was the use of the neutron star's round 12 km radius. The illustrative numbers were computed, not looked up.

---

## Relationship to Previous Experiments

- **Black Holes and Strong Gravity Experiment 1:** reuses its horizon radius, its three black holes and its real-object radii, and its ratio `radius ÷ r_s` becomes this experiment's main quantity. That specification already named this experiment as the one that "uses this experiment's ratio ... in the exact formula `√(1 − r_s / radius)`".
- **Gravity and Curved Spacetime Experiments 2 and 9:** the same effect, first at an exaggerated strength and then at real Earth strength. This experiment gives the exact version and shows where the first-order one stops being accurate.
- **Gravity and Curved Spacetime Experiment 7:** introduced the event horizon with ordinary gravity; this experiment does not change it.
- **Relativity of Time and Motion Experiments 3 and 4:** a different cause of slowed clocks (relative motion), which the tutor may distinguish in a sentence, as Gravity Experiment 2's tutor did.

## Relationship to Later Experiments

- **Experiment 3 (orbits), Experiment 4 (light bending), Experiment 5 (falling in):** planned, not approved, each needing its own Stage 1–2 proposal and approved specification. Experiment 5 in particular will show what a falling traveler experiences, which this experiment deliberately does not.

---

## Success Criteria

1. The learner makes all three predictions before the pictures, caption and Results are shown.
2. Choosing a different distance visibly changes both pictures: the hovering clock's hand lags by a different amount and the marker moves along the factor curve. Choosing a different black hole visibly changes the distance labels in kilometers, and the Results state plainly that the factor did not change.
3. Both pictures label every drawn component, visually distinguish the far-away and hovering clocks and the exact and first-order lines, and carry the "How to read this diagram" caption (`CLAUDE.md` §14).
4. The Results correctly state the exact factor and both clock readings, compare all three predictions with the model, and include the worked calculation, the exact-versus-first-order comparison, and the real-surfaces table.
5. The experiment states plainly that it is a thought experiment about two clocks at rest, that the formula is for a non-rotating, uncharged black hole and is given, not derived, and that nothing inside the horizon is modeled.
6. The introduction, Results and tutor say that a falling traveler's experience is different and is the subject of a later experiment, so that "time stops at the horizon" is not left as a statement about a traveler.
7. The experiment connects back to Gravity Experiments 2 and 9 and to Experiment 1 of this group, and does not recompute or modify any earlier experiment's physics.
8. Every specialized term is defined in plain language at first use (`CLAUDE.md` §15).

---

## Implementation Notes

- **Approval (2026-10-10):** the owner approved this specification, taking all eleven "Decisions Needing Human Review" items as Claude's recommended defaults.
- **Step 1, physics model and physics tests (2026-10-10):** built `src/physics/timeNearBlackHoleExperiment.ts` and `src/physics/timeNearBlackHoleExperiment.test.ts` (20 tests covering all 13 "Required Physics Tests"). Full suite 461/461 passing. Not built yet: the interface, predictions, results panel, tutor, wiring into `src/App.tsx`, complete-flow test and final review. One test needed a fix while writing (an absolute tolerance on a ratio of about 650 million; changed to a relative check). `tsc -b` reports one error in the new test file, `Cannot find name 'node:fs/promises'`, the same error 11 older physics test files already have for the same import-regression pattern; it is not new.

- **Step 3, basic interface (2026-10-10):** built `src/components/TimeNearBlackHoleExperiment.tsx` and wired it into `src/App.tsx` as chapter 2 of the "Black Holes and Strong Gravity" group. It has the black-hole buttons (the three from Experiment 1), the distance presets (100, 10, 3, 1.5, 1.1, 1.01) and a continuous logarithmic slider from 1.001 to 100 horizon radii, Run (10 seconds of real playback for 60 seconds of far-away-clock time, independent of the result), a live readout, and Picture 1 (two labeled dials, gold far-away and blue hovering, a distance ruler with the horizon and the black hole's inside shaded, and a "How to read this diagram" caption). The ruler runs with the black hole on the left and distance increasing to the right, the same direction as the slider. **Not built yet, by design:** the factor-against-distance graph (Picture 2) and the readings-against-time graph (they depend on the predictions, since Picture 2 would reveal Prediction 3's answer), the three predictions and their gating, the introduction, the Results panel and the tutor. The readout and caption currently show without prediction gating, as in earlier experiments' basic-UI steps. Two changes outside the new files: Experiment 1's chapter summary "what's next" line now points to this experiment (draft wording, not yet approved by the owner), and a placeholder summary was added for this chapter (not shown to learners until the tutor exists).
- **Browser check (2026-10-10, headless Chromium via Playwright, `http://localhost:5173/`; the Claude in Chrome extension was not connected):** with the stellar black hole, M87* and each distance preset, and the slider's two ends. Readings matched the specification table (1.01 horizon radii: 5.97 s; 1.001: 1.90 s; factors 0.0995 and 0.0316). Found and fixed three things: the ruler ran opposite to the slider (flipped); the slider's minimum was labeled "1 horizon radii" because of rounding (now "1.001"); and the hovering label touched the horizon line near the edge (moved). No console errors except a 404 for a missing favicon, which is not from this change. **Not checked:** a 390-pixel window, keyboard use, and any browser other than headless Chromium.

- **Step 5, learner prediction interaction (2026-10-10):** added the three prediction questions from "Prediction Activity" to `src/components/TimeNearBlackHoleExperiment.tsx`. Until all three are answered, the black-hole buttons, distance buttons, slider and Run are disabled. The first Run locks the predictions in; "Change predictions" reopens all three without resetting the chosen black hole or distance, and hides the pictures again. The readout, Picture 1 and the caption appear only after the first Run (`CLAUDE.md` §12). Prediction 3's choices were refined as the specification asked: "Yes, it will still be about as accurate" / "It will be accurate far from the horizon, but get worse the closer you get" / "No, it will be wrong everywhere near a black hole, even far from the horizon". **For the owner's wording review.** The model's answers are the third choice of Prediction 1 ("about one tenth as fast"), the third of Prediction 2 ("the same relative rate"), and the second of Prediction 3. They are not marked yet (that is the Results step). **Still not built:** Picture 2 (the exact against first-order graph), the readings-against-time graph, the introduction, the Results panel and the tutor.
- **Browser check of Step 5 (2026-10-10, headless Chromium):** fresh load: no picture, caption or readout, and controls and Run disabled; with two answers they stay disabled; with three they enable but still no picture; after Run the picture, caption and readout appear, the prediction buttons are disabled and "Change predictions" shows; clicking it hides them again and keeps the choices, the chosen black hole and the distance. No console errors (apart from the favicon 404). Not checked: a 390-pixel window and keyboard use.

- **Step 5b, the two graphs (2026-10-10):** added to `src/components/TimeNearBlackHoleExperiment.tsx`, shown only after predictions are locked in (`CLAUDE.md` §12): **Picture 2**, the slowing factor against distance (log axis, horizon on the left, the same direction as the ruler), with the exact factor as a solid blue line, the simple formula from Gravity Experiments 2 and 9 as a dashed orange line, a red horizon line, dots at the chosen distance on both lines, and a legend that gives both values at that distance; and **Picture 3**, each clock's reading against the far-away clock's reading, drawn progressively as the run plays (gold far-away line, blue hovering line). Both use the physics module's own functions and curve. The caption now covers all three pictures; it describes what the lines are and tells the learner what to look at, without stating where the lines agree or differ. Two display problems were found in the browser and fixed (a legend cut off at the right edge, and a cryptic "s" axis label). **Still not built:** the introduction, the Results panel and the tutor. **Checked:** in headless Chromium, all three pictures appear only after the first Run, Picture 3 draws during the run, and Picture 2 shows the right values at 1.01 and at 10 (0.0995 against 0.5050, and 0.9487 against 0.95); no console errors. **Not checked:** a 390-pixel window and keyboard use. Picture 3's drawing is a direct plot of the model's two readings, so the run's playback speed does not change what it shows.

- **Step 6, Results panel (2026-10-10):** added to `src/components/TimeNearBlackHoleExperiment.tsx`, shown only after a run completes (not before, not during, and hidden again when the distance or black hole is changed). It contains: a table of the far-away reading, the hovering reading, the factor and the simple formula's value (with how far too high it is); the three prediction checks, each marked "right" or "off this time" with a specific explanation (Prediction 1 is compared with the factor at 1.01 horizon radii whatever distance was chosen; Prediction 2 with the factors at 2 horizon radii near the 10-Sun black hole and M87*; Prediction 3 with exact against simple at 10 horizon radii, 1.01 and the horizon); the worked calculation at the learner's own distance (r_s ÷ r, then 1 minus that, then the square root, then the reading); a table of all three black holes at that distance showing the same factor; the real-surfaces table for Earth, the Sun and a neutron star, with a sentence tying back to GPS; the swimmer-above-a-waterfall comparison, labeled as an analogy for the push needed to hover and not for the slowing; and the amber limits box (thought experiment, no mechanism for hovering, two clocks at rest and not a falling traveler, nothing inside the horizon, non-rotating and uncharged, formula given and not derived, the simple formula is an approximation, rounded values). **All of this wording is a draft for the owner's line-by-line review (`CLAUDE.md` §28.1).** **Checked** in headless Chromium: with deliberately wrong predictions all three were marked off and the explanations were the right ones; with right predictions all three were marked right; at 100 horizon radii the worked numbers were 0.01, 0.99 and 0.9950; the surfaces table gave about 0.7 billionths of a second per second for Earth, 2.1 millionths for the Sun and 19% for the neutron star; no console errors. A grammar slip ("near A stellar black hole") was found and fixed. **Not checked:** a 390-pixel window and keyboard use. **Still not built:** the introduction and the tutor.
