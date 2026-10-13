# Black Holes and Strong Gravity — Experiment 5: Falling In — What Does the Traveler Experience?

**Status: APPROVED by the owner on 2026-10-11. Proposed by Claude per `CLAUDE.md` §23 Stages 1–2 and drafted as a specification per Stage 3 on 2026-10-11, as the fifth and last of the five experiments originally planned for this group (see the group list in Experiment 1's specification: "5. Falling in (tidal forces at the horizon)"; the group later grew to ten). Built one step at a time (§6), complete-flow tested and finally reviewed (2026-10-11); the owner's line-by-line wording approval (§28.1) is complete (2026-10-11). This experiment is complete; see "Implementation Notes".**

---

## Overview

Experiment 2 of this group compared two clocks at rest, one far from a black hole and one hovering close to it, and found that the hovering clock ticks more and more slowly the closer it is, with the formula giving zero at the horizon. That experiment said plainly that this is a comparison between two clocks held at rest, and that it says nothing about a traveler who **falls in**. Experiments 3 and 4 then showed where orbits and light stop being safe: orbits plunge inside 3 horizon radii, and light aimed closer than 2.598 horizon radii is captured. Both of those specifications named this experiment as where "the plunge" and "the capture" are followed from the traveler's side.

This experiment asks: **what does a traveler who falls straight into a black hole experience, and how does it compare with what a far-away observer says?**

The new idea is one theme with two measurements, taken on the same fall:

1. **The traveler's own clock reaches the horizon after a finite, ordinary-looking time,** while a far-away clock's reading for the same trip grows without limit as the traveler nears the horizon. Both statements are true, because they are two different clocks. "Time stops at the horizon" (Experiment 2) was always a statement about the far-away comparison, not about what the traveler's own watch does.
2. **What the traveler feels is the stretching** (the difference in gravity's pull between head and feet), **and it depends on the size of the black hole.** At the horizon of a 10-Sun black hole the stretch across a 2-meter body is about 21 million times Earth's gravity. At the horizon of Sagittarius A* it is about a ten-thousandth of Earth's gravity, and at M87*'s about a hundred-billionth. So crossing the horizon of a giant black hole is, locally, unremarkable, while a small one tears apart anything long before the horizon.

The learner picks a black hole and a starting distance, releases the traveler from rest, and watches the fall with two clocks, the traveler's own and a far-away one, and a live stretch readout. A graph of distance against time shows the same fall against each clock (one reaches the horizon, the other approaches it forever), and a second graph shows the stretch against distance for all three black holes.

The experiment is a **thought experiment** about a small traveler falling straight in, in the exact theory of gravity, for a black hole that does not spin and has no electric charge. It stops at the horizon. It does not model anything inside it, what the traveler would see, or what happens next.

---

## Learning Objective

After this experiment, the learner should understand:

1. A traveler who falls straight toward a black hole reaches the horizon after a **finite time on their own clock**. For a fall from rest at 10 horizon radii it takes about 49 "horizon light-times" (the time light takes to cross one horizon radius, see below): about 4.8 thousandths of a second for a 10-Sun black hole, about 35 minutes for Sagittarius A*, and about 36 days for M87*.
2. The same fall, timed on a **far-away clock** (the time shown on a clock at rest far from the black hole when the traveler passes each distance), takes longer and **grows without limit** as the traveler nears the horizon: it keeps rising, by the same amount for each tenfold closing of the gap (about 2.3 horizon light-times), and never settles. The traveler's own clock settles. This resolves the idea left open in Experiment 2: the far-away clock never shows the traveler reaching the horizon, yet the traveler's own clock shows an ordinary, finite trip.
3. These two statements do not contradict each other. They describe different clocks, as in Experiment 2, and neither is "the real time".
4. What the traveler feels is the **stretching**: gravity pulls the feet (nearer the black hole) slightly harder than the head. The stretch is `2GM × length ÷ r³`: it grows very fast as the traveler gets nearer (eight times larger at half the distance) and it is proportional to the mass. In terms of the horizon radius it is `1 ÷ (mass)²` times as large at the same number of horizon radii: a bigger black hole has a gentler stretch at its own horizon.
5. Therefore the stretch at the horizon is enormous for a small black hole and tiny for a giant one, even though the fall looks the same in horizon radii. Nothing special is felt locally at a giant black hole's horizon.
6. What the experiment does not say: what is inside the horizon, what the traveler sees (the sky, light from outside, redshift), what happens after the horizon is crossed, falls with sideways motion, or what a spinning black hole does.

---

## Physical Situation

A black hole of known mass and a small traveler, 2 meters long, released **from rest** at a chosen distance and falling **straight toward the center**, with nothing else acting on them (no rockets, no sideways motion, no gas). The fall is followed from release to the horizon. Two clocks are kept: the traveler's own (called the **traveler's clock**) and one at rest far from the black hole (called the **far-away clock**), which was started at the moment of release.

### The equations (given, not derived)

With `r` in horizon radii (`r_s = 1`), time in units of **one horizon light-time** (`r_s ÷ c`, the time light takes to cross one horizon radius), and `r0` the release distance, for a non-rotating, uncharged black hole, from standard general relativity:

```
traveler's clock:      dτ/dr = −1 ÷ √(1/r − 1/r0)
far-away clock:        dt/dr = −√(1 − 1/r0) ÷ [(1 − 1/r) × √(1/r − 1/r0)]
```

The first gives a closed form: `τ = ½ r0^1.5 (η + sin η)`, where `cos η = 2r/r0 − 1`; the traveler's clock at the horizon (`r = 1`) reads `τ_h = ½ r0^1.5 (η_h + sin η_h)`, with `cos η_h = 2/r0 − 1`. The second has no simple closed form in terms of `r` that the learner needs, and is **stepped numerically** (fourth-order Runge-Kutta), as in Experiments 3 and 4. It grows without limit as `r → 1`. The factor `1 − 1/r` in the denominator is the same factor as Experiment 2's clock-rate factor, squared.

The **stretch** (the difference in the pull on the two ends of a length `h` along the line to the center) is

```
stretch = 2 G M h ÷ r_km³        (in m/s²; divided by 9.80665 for "g", Earth's gravity at the surface)
```

at distance `r_km` from the center. This is the standard radial tidal term, **the same as Newton's** for this case, and is given, not derived. It is the same kind of effect as Gravity and Curved Spacetime Experiment 3's tidal convergence, now along the line to the center rather than sideways.

### Facts the model reproduces (computed, not looked up; the tests check them)

- The traveler's clock to the horizon from rest at `r0` has a closed form, and equals the integral of `dτ/dr`.
- The far-away clock exceeds the traveler's clock at every distance, and each tenfold closing of the gap to the horizon adds `ln 10 ≈ 2.303` horizon light-times to it.
- The stretch at the horizon over 2 meters, from the standard formula: 2.06 × 10⁸ m/s² (about 2.1 × 10⁷ g) for 10 Suns, 1.1 × 10⁻³ m/s² (about 1.14 × 10⁻⁴ g) for Sagittarius A*, 4.9 × 10⁻¹⁰ m/s² (about 5.0 × 10⁻¹¹ g) for M87*.

### Illustrative results (computed in a feasibility check on 2026-10-11, in a scratch script outside the project; the tests will check them)

Fall from rest at 10 horizon radii, times in horizon light-times:

| Distance | Traveler's clock | Far-away clock |
|---|---|---|
| 3 | 45.8 | 50.5 |
| 2 | 47.7 | 53.4 |
| 1.5 | 48.4 | 55.1 |
| 1.1 | 48.88 | 57.4 |
| 1.01 | 48.975 | 59.8 |
| 1.001 | 48.984 | 62.1 |
| 1.0001 | 48.985 | 64.4 |
| 1 (the horizon) | **48.985** | no limit |

Traveler's clock to the horizon for other release distances: 1570 (from 100), 140 (from 20), 16.85 (from 5), in horizon light-times.

In seconds: one horizon light-time is about 0.0000985 s (10 Suns), 42.4 s (Sagittarius A*) and 64,000 s (about 17.8 hours, M87*). So from 10 horizon radii the traveler's trip takes about 4.8 thousandths of a second, about 35 minutes and about 36 days.

Stretch across a 2-meter body, in g (Earth's gravity):

| Distance | 10 Suns | Sagittarius A* | M87* |
|---|---|---|---|
| 100 | 21 | 1.1 × 10⁻¹⁰ | 5.0 × 10⁻¹⁷ |
| 10 | 2.1 × 10⁴ | 1.1 × 10⁻⁷ | 5.0 × 10⁻¹⁴ |
| 3 | 7.8 × 10⁵ | 4.2 × 10⁻⁶ | 1.8 × 10⁻¹² |
| 1 (the horizon) | 2.1 × 10⁷ | 1.14 × 10⁻⁴ | 5.0 × 10⁻¹¹ |

For the 10-Sun black hole the stretch across 2 meters is already 1 g at about 276 horizon radii (about 8,100 km from the center), far outside the horizon. For the other two it would reach 1 g only deep inside the horizon, which this experiment does not model.

### The black holes

Reused unchanged from Experiment 1: the stellar black hole (10 Suns, horizon radius about 29.5 km), Sagittarius A* (about 4.3 million Suns, about 12.7 million km) and M87* (about 6.5 billion Suns, about 19 billion km).

### Simplifying assumptions (must be stated to the learner, in plain language)

- **A thought experiment about a small traveler** who is dropped from rest and falls straight in, with nothing else acting on them. How they got to the starting point is not described. Their own gravity and mass do not matter.
- **The equations are for a black hole that does not spin and has no electric charge,** given and not derived. Real black holes usually spin, which changes the details.
- **The "far-away clock" shows the time on a clock at rest far from the black hole when the traveler passes each distance.** It is not the time at which a far-away observer would *see* the traveler arrive; light from near the horizon takes ever longer to get out, which would make the far-away observer's picture of the fall even slower. The experiment compares clocks, not pictures.
- **The traveler is 2 meters long** (a fixed round number, not a control), and the stretch is the difference in pull between the two ends.
- **The fall stops at the horizon.** Nothing inside it is modeled.
- **The fall is straight in,** as in Experiments 2 and 3's radial setting, not in an orbit.

### Not introduced

What is inside a black hole and any "singularity" at the center; what the traveler would see on the way in (the sky, the black hole's own image, redshift, light still reaching them); falls with sideways motion, or starting with a speed; spinning (Kerr) or charged black holes; a hovering or rocket-driven approach; Hawking radiation; the Schwarzschild metric as a named object; "spaghettification" as a named term (see Decision 8). All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16). The tutor may name a few of these in one sentence each as things the model does not cover.

---

## Physics Model

One new, self-contained module, in the style of Experiments 2, 3 and 4. It **reuses** earlier code unchanged (imported, not redefined): `horizonRadiusKm` and `OBJECT_PRESETS` from Experiment 1 of this group (`blackHoleSizeExperiment.ts`), for the kilometer distances. It does **not** import Experiment 2's, 3's or 4's modules, Gravity Experiment 3's module, or any other experiment's, and a regression test checks this. The "light-time" in seconds is `horizon radius ÷ speed of light`, with the speed of light as the same constant the project already uses (to be checked against the existing code when implemented).

```typescript
// src/physics/fallingInExperiment.ts

export const MIN_START_IN_HORIZON_RADII = 2    // the lowest release distance the controls allow
export const MAX_START_IN_HORIZON_RADII = 100
export const BODY_LENGTH_METERS = 2
export const GRAVITY_AT_EARTH_SURFACE = 9.80665                // for "in g"
export const FAR_CLOCK_CUTOFF_IN_HORIZON_RADII = 1.0001        // how close to the horizon the far-away clock is followed

export const BLACK_HOLE_PRESETS: ObjectPreset[]  // the three black holes of Experiment 1

// The traveler's clock at a distance r (horizon radii), falling from rest at r0, in horizon light-times. Closed form.
export function travelerClock(startInHorizonRadii: number, rInHorizonRadii: number): number
// The far-away clock at the same moment, stepped numerically. Requires r strictly greater than 1.
export function farAwayClock(startInHorizonRadii: number, rInHorizonRadii: number): number

// The stretch across the body at a distance, in g, for a black hole of the given mass, from 2GM h / r³.
export function stretchInG(massSolarMasses: number, rInHorizonRadii: number): number

export interface FallPoint { r: number; travelerClock: number; farAwayClock: number | null }  // null at r = 1

export interface FallingInResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startInHorizonRadii: number
  lightTimeSeconds: number                // horizon radius ÷ c
  travelerClockAtHorizon: number          // in horizon light-times
  travelerSecondsAtHorizon: number
  farAwayClockAtCutoff: number            // reading at 1.0001 horizon radii, in horizon light-times
  stretchAtStartInG: number
  stretchAtHorizonInG: number
  stretchOneGRadiusInHorizonRadii: number | null   // where the stretch reaches 1 g, if outside the horizon; null otherwise
  points: FallPoint[]                     // from release to the cutoff, for the pictures
}

export function runFallingInExperiment(
  presetId: ObjectPreset['id'],
  startInHorizonRadii: number
): FallingInResult

// For the stretch graph: the stretch in g for each black hole, from the horizon out to 100 horizon radii.
export function stretchCurve(presetId: ObjectPreset['id']): Array<{ r: number; stretchInG: number }>
```

Structured independently of the UI (`CLAUDE.md` §9): pure functions, testable with no browser. The playback speed (a fixed real duration, independent of the result) does not change any result (`CLAUDE.md` §11).

---

## Learner Controls

- **The black hole:** a stellar black hole (10 Suns), Sagittarius A*, or M87*.
- **The release distance,** in horizon radii: presets **100, 20, 10, 5, 2** (the traveler is released from rest there). The distance in kilometers (and AU where that is more natural) is shown beside it.
- **Run,** which plays the fall over a fixed real duration independent of the physics (`CLAUDE.md` §11).

---

## Prediction Activity

Before the controls and results are shown, the learner answers three questions in sequence (not scored):

1. "A traveler is dropped from rest near a black hole and falls straight toward it. On the traveler's own watch, how long does it take to reach the horizon?" (A finite time: they get there / It never finishes: they never get there / It depends on how big the black hole is.) The model's answer is the first. The third is partly true in kilometers and seconds, so the question must say "does the trip end", not "how many seconds"; the wording needs the owner's review (see Decision 7).
2. "A clock sits at rest far away and keeps time for the whole fall. As the traveler nears the horizon, what does that far-away clock read?" (It reads about the same as the traveler's watch / It reads somewhat more, then settles / It keeps reading later and later, without limit, as the traveler nears the horizon.) The model's answer is the third.
3. "At the moment a traveler reaches the horizon, how does the stretching (the difference in pull between head and feet) compare between a small black hole (10 Suns) and a giant one (Sagittarius A*)?" (Much stronger at the small one / About the same / Much stronger at the giant one.) The model's answer is the first.

The controls are disabled until all three predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the choices. The pictures, captions, Results and tutor appear only after predictions are locked in (`CLAUDE.md` §12). The choices need the owner's wording review (see Decision 7).

---

## Experiment Behavior

### Display

Three pictures, one above the other:

- **Picture 1, "The fall" (a straight drop).** A side view: the black hole as a dark disk at the bottom with its horizon ring (rose), labeled "horizon"; the traveler as a bright dot, labeled "traveler", starting at the release distance and falling straight in, with the release point labeled "released here (at rest)"; a faint line along the path. The view is zoomed to the release distance, with a labeled scale bar, as in Experiments 3 and 4. Beside it, two clocks as large readouts: **"traveler's clock"** (blue) and **"far-away clock"** (orange), in horizon light-times and in seconds, both starting at zero at the release. Under the traveler, a live "stretch across a 2-meter body" readout, in g, with Earth's 1 g beside it for comparison. When the traveler reaches the horizon, the picture says so, and the far-away clock shows how far it has got (to the cutoff) and says "still rising, no limit".
- **Picture 2, "How far has the traveler fallen, on each clock" (a graph).** Horizontal: time, in horizon light-times. Vertical: distance from the center, in horizon radii (from the release distance down to the horizon). A blue curve for the traveler's clock (reaching the horizon at the finite time) and an orange curve for the far-away clock (bending over and creeping toward the horizon, drawn to the cutoff, and marked "keeps going"). A dot on each curve at the current position during playback. Both curves visible together, so the learner can see where they part company (`CLAUDE.md` §14.2).
- **Picture 3, "The stretch against distance" (a graph).** Horizontal: distance from the center, in horizon radii (log scale, 1 to 100). Vertical: stretch across 2 meters, in g (log scale). Three curves, one for each black hole, each labeled, with a dashed line at 1 g ("Earth's gravity at the surface"); a dot on the chosen black hole's curve at the traveler's current distance, moving as the fall plays; the horizon line at 1 labeled "horizon". Showing all three at once is the contrast (`CLAUDE.md` §14.2): the same distances, very different stretch.
- Each picture has its own **"How to read this picture" caption** directly under it, shown after predictions are locked in, in the step-by-step style of the earlier experiments. The captions must say what each drawn thing is, what the two clocks are (the traveler's own, and one at rest far away), what a horizon light-time is, what "stretch" is and why head and feet feel different pulls, why the picture is zoomed (scale bar), and that the experiment follows a small traveler straight down, not a camera view.
- **Live readout:** the black hole, the release distance (horizon radii and kilometers), the traveler's distance now, both clocks, and the stretch in g.

### Results

States the black hole and release distance, the traveler's clock at the horizon (in horizon light-times and in seconds, minutes, hours or days, whichever is natural), the far-away clock's reading at the cutoff and that it has no limit, the stretch at the release distance and at the horizon (in g), where the stretch reaches 1 g (if outside the horizon); compares all three predictions with the model; includes simple math per `CLAUDE.md` §15, for example the traveler's clock for a fall from 10 horizon radii worked from the closed form to 48.99 light-times and then to seconds for the chosen black hole, and the stretch worked at the horizon for a 2-meter body (`2GM × 2 ÷ r³` in numbers) and its comparison with Earth's gravity; includes a daily-life comparison; and states the model's limits in a prominent bordered box (`CLAUDE.md` §28.1 pattern).

The daily-life comparison (to be confirmed, kept out of the introduction so it does not reveal the answers): a long rubber band with one end pulled harder than the other stretches, which is an analogy for the stretch a body feels when gravity pulls its near end harder than its far end. It is labeled as an analogy for "pulled harder at one end", not for how gravity works. There is **no daily-life comparison for the two clocks**: no everyday situation shares the mechanism of two clocks disagreeing without relying on relativity itself, and a comparison based on "what a far-away observer sees" would give a wrong picture, because the experiment compares clocks, not pictures (see Decision 9).

### Introductory text

To be drafted during implementation, covering the question (what does a traveler experience falling into a black hole, and does it agree with what a far-away observer says?), what happens (step by step, as in Experiments 3 and 4), the learner's job, what to look for, new terms defined in plain language before use (**the traveler's clock**, **the far-away clock**, **horizon light-time**, **stretch** and why it happens, with **horizon** and **horizon radius** recalled from Experiment 1, the **astronomical unit**, and the **exact theory of gravity**), what it builds on (Experiment 2's clocks, Experiment 3's plunge and Experiment 4's capture, and Gravity Experiment 3's tidal effect), a "Why even ask this" paragraph (Experiment 2 left a question open: if time stops at the horizon for a far-away observer, what does the traveler experience?), and the assumptions above. The introduction says plainly that the equations are given and not derived, and that they are for a non-rotating black hole. Any statement that gives away the prediction answers (that the traveler's own clock finishes, that the far-away clock never does, that the stretch depends on the black hole's size) is kept out of the introduction (`CLAUDE.md` §12). Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **After "Run" completes:**
  1. Observation: "Look at the two clocks and the graph. When the traveler reaches the horizon, what does the traveler's clock read, and what is the far-away clock doing? Now try a different black hole and compare the stretch."
  2. Prediction comparison: the learner's three predicted answers beside what the model gave.
  3. Conceptual question: "Experiment 2 said a clock hovering near the horizon ticks more and more slowly, as seen from far away. Yet this traveler's own clock reaches the horizon in an ordinary time. How can both be true?" — intended to let the learner reach "they are different clocks, each right about its own readings".
  4. Explanation: (1) the traveler's clock reaches the horizon in a finite time, with the worked example (from 10 horizon radii, 48.99 light-times), and the seconds for the three black holes; (2) the far-away clock keeps rising, by about 2.3 light-times for each tenfold closing of the gap, and never settles, so it never shows the traveler reaching the horizon; (3) both are true because they are different clocks, as in Experiment 2: "time stops at the horizon" was always about far-away comparisons, and the traveler's watch just keeps ticking at its normal rate in the traveler's own experience; (4) what the traveler feels is the stretching, explained with the rubber-band picture and `2GM × length ÷ r³`, which grows fast as the traveler gets nearer (eight times larger at half the distance); (5) the same fall in horizon radii gives very different stretch because the horizon of a bigger black hole is much farther from its center: 2.1 × 10⁷ g at the 10-Sun black hole's horizon against 1.1 × 10⁻⁴ g at Sagittarius A*'s and 5.0 × 10⁻¹¹ g at M87*'s, so crossing a giant black hole's horizon is, locally, unremarkable; (6) for the 10-Sun black hole the stretch passes 1 g at about 276 horizon radii, far outside the horizon, so a traveler there would be stretched apart long before reaching it (see Decision 8); (7) what the experiment does not cover: it stops at the horizon (what is inside is not modeled), it does not show what the traveler would see, it assumes a straight fall from rest, and it is for a non-rotating, uncharged black hole, with the equations given and not derived; (8) how this ties back: Experiment 2's "time stops" was a statement about far-away clocks, Experiment 3's plunge and Experiment 4's capture are the same fall from the traveler's side.

---

## Required Physics Tests

1. `travelerClock(r0, r0)` is 0, and `travelerClock(r0, 1)` equals the closed form `½ r0^1.5 (η + sin η)` with `cos η = 2/r0 − 1`; checked at `r0` of 2, 5, 10, 20 and 100.
2. **The closed form is checked independently of the module:** the test file integrates `dτ/dr = −1 ÷ √(1/r − 1/r0)` numerically (written separately, with a small substitution to handle the end-point singularity) and agrees with `travelerClock` to within 1e-4 relative at several `r`.
3. The values in the illustrative table match to within 0.1 horizon light-times: 48.985 at the horizon for `r0 = 10`, 1570 for 100, 140 for 20, 16.85 for 5.
4. **The far-away clock exceeds the traveler's clock** at every distance from the release point to the cutoff, and both start at 0.
5. **The far-away clock has no limit:** each tenfold closing of the gap to the horizon adds `ln 10 ≈ 2.303` to it, to within 0.02, between 1.01 and 1.0001; it is monotonically increasing as `r` falls; and `farAwayClock` at `r = 1` (or below) throws a `RangeError`.
6. **The far-away clock is found independently:** the test file computes the same quantity from the equation `dt/dτ = √(1 − 1/r0) ÷ (1 − 1/r)` (the standard ratio of clock rates) by integrating it against the closed-form `τ(r)` (written separately), and agrees with `farAwayClock` to within 1e-3 relative at `r` of 3, 2, 1.5 and 1.1.
7. **The traveler's clock settles:** from `r = 1.01` to `r = 1.0001` it changes by less than 0.01 horizon light-times, while the far-away clock changes by more than 4.
8. **Stretch:** `stretchInG` follows `2GM h ÷ r³` computed in the test file from `G`, the mass in kilograms and the body length, at several distances; it is eight times larger at half the distance (to within 1e-9 relative); and it is proportional to the mass at a given kilometer distance.
9. **The stretch at the horizon** matches the illustrative table for the three black holes: about 2.1 × 10⁷ g, 1.14 × 10⁻⁴ g and 5.0 × 10⁻¹¹ g, each to within 2% (the exact figures depend on the mass and constants used).
10. **Bigger black hole, gentler stretch:** at the same number of horizon radii, the stretch decreases as the mass increases, in proportion to `1 ÷ mass²` (checked across the three black holes to within 1e-6 relative).
11. **The one-g distance:** for the 10-Sun black hole it is about 276 horizon radii (to within 1%); for the other two the module reports `null` (it would be inside the horizon).
12. **Seconds scale with the mass:** `lightTimeSeconds` is `horizonRadiusKm ÷ speed of light` for each black hole, and the traveler's clock in seconds from 10 horizon radii is about 4.8 × 10⁻³ s, 2,075 s and 3.14 × 10⁶ s for the three black holes (each to within 1%).
13. **Reuse:** the module imports `horizonRadiusKm` and `OBJECT_PRESETS` from `blackHoleSizeExperiment` and does not import `timeNearBlackHoleExperiment`, `orbitsNearBlackHoleExperiment`, `lightNearBlackHoleExperiment`, `blackHoleExperiment`, `tidalEffectExperiment` or `orbitExperiment` (a regression test, as in Experiments 3 and 4).
14. **Determinism:** the same inputs give the same points.
15. **Validation:** a release distance not finite, below 1 (not outside the horizon) or, in the experiment function, outside 2 to 100, throws a `RangeError`; the module does not clamp, and the slider or preset range is the interface's responsibility.
16. **Playback speed does not change the result** (`CLAUDE.md` §11): the points are computed from the black hole and release distance alone, with no wall-clock input.

---

## Decisions Needing Human Review

Each shows Claude's recommended default as used above.

1. **Title and the one new idea.** Default: "Falling In: What Does the Traveler Experience?", one theme with two measurements: the traveler's clock reaches the horizon in finite time while the far-away clock does not, and the stretch at the horizon depends on the black hole's size. Both belong to "what falling in is like" and complete the group's plan ("falling in (tidal forces at the horizon)"). Alternative: only the clocks (the finite-time idea) and leave the stretch as a separate, sixth experiment; or only the stretch. The group would then have six experiments rather than five.
2. **Release from rest, straight in.** Default: the simplest fall, with a closed form for the traveler's clock and one number to compare. Alternative: allow a starting speed or an inward-moving start (more cases, more to explain; not needed for the idea).
3. **The meaning of "far-away clock".** Default: the time on a clock at rest far away when the traveler passes each distance, with the assumptions saying plainly that this is a comparison of clocks, not what a far-away observer *sees* (light from near the horizon takes longer to arrive, which would only make the far-away picture slower). Alternative: model the arrival time of the light, which is more realistic and more complicated, and is closer to a camera-view idea that the group excludes.
4. **The unit of time.** Default: **horizon light-time** (`r_s ÷ c`) in the graph, with seconds, minutes, hours or days shown beside it for the chosen black hole. Alternative: seconds only (the three black holes then differ by a factor of a billion and need a log axis), or a fraction of the trip (hides the scale).
5. **The body length and the unit of stretch.** Default: a 2-meter traveler (a round number, not a control) and the stretch in g (Earth's gravity at the surface), with a 1 g line on the graph. Alternative: a control for the length, or the stretch in m/s² (harder to picture).
6. **Three pictures.** Default: the fall, the distance-against-time graph and the stretch graph. Alternative: fold the stretch graph into a table in the Results (less to draw, loses the three-curve contrast), or drop the fall picture and keep only the two graphs.
7. **The three predictions and their choices.** Default as above; the wording, especially Prediction 1 (it must be clear it asks whether the trip ends, not how many seconds) and Prediction 2, needs the owner's review.
8. **How much to say about "being torn apart".** Default: give the numbers in g and compare them with Earth's gravity; say plainly in the tutor that for the 10-Sun black hole the stretch across 2 meters is already 1 g at about 276 horizon radii and about 21 million g at the horizon, "far more than any body could survive" (general knowledge, **not checked against a primary source**), and do not use the term "spaghettification". Alternative: name it once, as the popular term, in the tutor; or say nothing about survival and let the numbers stand.
9. **The daily-life comparison.** Default: only the rubber band pulled harder at one end, for the stretch, labeled as an analogy; none for the clocks, because there is no everyday situation for "two clocks disagreeing" that does not rely on relativity itself (`CLAUDE.md` §15). Alternative: add a comparison for the clocks anyway (see the risk described in the Results section).
10. **Where the fall stops.** Default: at the horizon, with the far-away clock followed to 1.0001 horizon radii and labeled "keeps going". Say plainly that the model does not describe the inside and that the traveler's clock does not stop there. Alternative: follow the traveler's clock into the horizon and show the rest of the trip (closed form exists for the whole fall to the center), which would add a topic (what is inside) that the group deliberately excludes.
11. **Closing the group.** Default: this is the last of the five planned experiments, so its chapter summary says no further experiment is planned in this group. Alternative: leave the "what's next" line open until the owner decides.
12. **Not checked against a primary source:** the free-fall equations (including the closed form for the traveler's clock), the far-away clock's rate, the standard tidal term `2GM h ÷ r³` and its use as the stretch in this setting, and the "far more than any body could survive" sentence are standard general relativity and general knowledge, stated from general knowledge. Claude checked them on 2026-10-11 only against each other (the closed form against numerical integration, and the logarithmic growth near the horizon against `ln 10`; see the feasibility check above). The stretch is, in this setting, the same number as Newton's for the same distance.

---

## Relationship to Previous Experiments

- **Black Holes and Strong Gravity Experiment 2 (time near a black hole):** this experiment's far-away clock is that experiment's far-away view, now for a traveler who is falling instead of hovering. It resolves the question that experiment left open ("time stops at the horizon" was a far-away comparison).
- **Black Holes and Strong Gravity Experiment 3 (orbits):** the plunge inside 3 horizon radii ends in a fall like this one, though with sideways motion that this experiment leaves out.
- **Black Holes and Strong Gravity Experiment 4 (light near a black hole):** light captured inside 2.598 horizon radii is, from the light's side, the same one-way trip.
- **Black Holes and Strong Gravity Experiment 1:** the horizon radius and the three black holes.
- **Gravity and Curved Spacetime Experiment 3 (tidal effects):** the same kind of effect, a difference in gravity's pull from place to place, now along the line to the center instead of sideways.
- **Gravity and Curved Spacetime Experiment 2 (gravitational time dilation):** the same kind of clock comparison, now for a moving clock.

## Relationship to Later Experiments

- This is planned as the last experiment of this group. No further experiment is planned or approved. The topics this one deliberately leaves out (the inside of a black hole, what the traveler sees, spinning black holes, Hawking radiation) are the natural candidates, but none is proposed.

---

## Success Criteria

1. The learner makes all three predictions before the pictures, captions and Results are shown.
2. The fall picture is zoomed to the release distance with a labeled scale bar, shows both clocks and the live stretch, and says plainly when the traveler reaches the horizon.
3. All three pictures label every drawn component (the black hole, the horizon, the traveler, the release point, both clocks, both curves, the three black holes' curves, the 1 g line, the horizon line), visually distinguish the traveler's clock from the far-away clock, and carry their own "How to read this picture" caption (`CLAUDE.md` §14).
4. The traveler's clock reaches the horizon at the finite time the model computes, and the far-away clock's reading keeps rising without limit toward it.
5. The Results correctly state the clocks, the stretch at the release distance and at the horizon, compare all three predictions with the model, and include the worked calculations and the rubber-band comparison.
6. The experiment states plainly that it is a thought experiment about a small traveler falling straight in, that the equations are for a non-rotating, uncharged black hole and are given, not derived, that the fall stops at the horizon, and that it does not show what the traveler sees.
7. The experiment connects back to Experiments 2, 3 and 4 of this group and to Gravity Experiment 3, and does not recompute or modify any earlier experiment's physics.
8. Every specialized term is defined in plain language at first use (`CLAUDE.md` §15).

---

## Implementation Notes

Nothing has been built. A feasibility check was run in a scratch script outside the project on 2026-10-11 (not part of the application): the closed form for the traveler's clock (48.985 horizon light-times from rest at 10 horizon radii), the far-away clock stepped numerically (64.4 at 1.0001 horizon radii, rising by 2.30 per tenfold closing of the gap), and the stretch across 2 meters at the horizon (2.1 × 10⁷, 1.1 × 10⁻⁴ and 5.0 × 10⁻¹¹ g) reproduced the tables above.

- **Approval (2026-10-11):** the owner approved this specification.

- **Step 1, physics model and physics tests (2026-10-11):** built `src/physics/fallingInExperiment.ts` and `src/physics/fallingInExperiment.test.ts` (26 tests covering all 16 "Required Physics Tests"). The traveler's clock is the closed form; the far-away clock is stepped numerically (Simpson's rule, evenly spaced in the logarithm of the distance of the cycloid parameter from its value at the horizon, where the integrand blows up). The stretch is computed as `c² h ÷ (r_s² r³)`, which equals `2GM h ÷ r³` but needs no separate value of G (it reuses `horizonRadiusKm`). **Differences from this specification, for the owner:** (1) the speed of light is imported from `hubblesLawExperiment` (`REAL_SPEED_OF_LIGHT_KM_PER_S`, the same constant `blackHoleSizeExperiment` itself uses), since `blackHoleSizeExperiment` does not export it; the regression test still forbids every other experiment's module listed in Test 13; (2) the specification said the traveler's clock changes by "less than 0.01" between 1.01 and 1.0001 horizon radii; the exact change is 0.0105, so the test bound is 0.02 and the specification's wording was corrected to "about 0.01"; (3) the "each tenfold closing adds ln 10" check is made from 1.001 onward (to within 0.02), because at 1.1 to 1.01 the step is 2.4, not yet in the asymptotic range; (4) `points` has 301 points spaced geometrically toward the horizon, then the horizon itself (far-away clock `null`). **Independent checks in the test file:** the traveler's clock against a numerical integration of `dτ/dr` with the substitution `r = r0 − s²`; the far-away clock against an integration of the ratio of clock rates `E ÷ (1 − 1/r)` against the closed-form traveler's clock; the stretch against `2GM h ÷ r³` written out in SI units from G and the solar mass. **Checked that the tests are not vacuous:** changing the closed form's `sin η` term failed 5 of 26, and changing the far-away integrand's `1 − 1/x` factor failed 4 of 26. Full Vitest run: 538 passed (512 before). No type errors in the new files. **Not built yet:** the interface, predictions, introduction, Results, tutor and wiring into `src/App.tsx`.

- **Step 2, basic interface (2026-10-11):** built `src/components/FallingInExperiment.tsx` and wired it into `src/App.tsx` as chapter 5 of the "Black Holes and Strong Gravity" group. It has the black-hole buttons, the release presets (100, 20, 10, 5, 2), Run (8 seconds of real playback, steady in the traveler's own time, independent of the result), a readout, and three pictures, each with a "How to read this picture" caption (**draft wording, for the owner's review**). **Picture 1, the fall (side view):** the black hole and its rose horizon ring, the traveler's dot falling from the release bar along a dashed path, a scale bar, and live readouts of the traveler's clock (blue), the far-away clock (orange) and the stretch in g; when the traveler reaches the horizon the picture says so and the far-away clock reads "more than X ... and still rising". **Picture 2, how near the horizon on each clock (graph):** blue and orange curves with a dot on each for the traveler's current position. **Picture 3, the stretch against distance (graph):** the three black holes' curves on log-log axes, the chosen one thick, a 1 g line, the horizon line and a white dot for the traveler that moves during the fall. Every drawn part is labeled on the canvas. **Deviation from this specification, for the owner:** Picture 2's vertical axis is the **gap above the horizon on a log scale**, not the distance from the center on a linear scale as "Display" says. On a linear scale the far-away curve ends at 1.0001 horizon radii, which looks exactly like reaching the horizon, so the two curves would look alike and hide the point of the picture. On the log scale the traveler's curve plunges off the bottom (a gap of zero, shown as a rose strip) while the far-away curve is a straight line that keeps heading down. The caption explains this. It is a small change to put back if the owner prefers the specification's version. Other changes outside the new files: Experiment 4's chapter summary "what's next" line now points to this experiment (draft wording), and a placeholder summary was added for this chapter (not shown to learners until the tutor exists). **Checked** in headless Chromium at 1200 and 390 pixels (scripted, with screenshots viewed at 1200): release distances 10, 2 and 100 across the three black holes, mid-run and at the end; the pictures are absent until Run; the readouts read 48.985 light-times (4.83 thousandths of a second) and a far-away clock of 64.5 at the cutoff for the 10-Sun black hole from 10 horizon radii, and a stretch of 2.1 × 10⁷ g at the horizon; labels were repositioned after the first look (the far-away clock's line was cut off, two graph labels were clipped or overlapping); no console errors; no sideways scroll at 390 pixels (where the pictures are small and the labels very small, the app-wide limit seen in earlier experiments). The full Vitest run passed (538). **Not built yet, by design:** the three predictions and their gating (so the pictures show after Run without them, as in Experiments 3 and 4 at this step), the introduction, the Results panel and the tutor. **Not checked:** a screen reader, other browsers, the 390-pixel appearance beyond the absence of sideways scroll.

- **Step 3, learner prediction interaction (2026-10-11):** added the three prediction questions from "Prediction Activity" to `src/components/FallingInExperiment.tsx`. Until all three are answered, the black-hole buttons, release buttons and Run are disabled. The first Run locks the predictions in; "Change predictions" reopens all three without resetting the chosen black hole or release distance, and hides the pictures again. The readout and all three pictures appear only after the first Run (§12). The choices are not marked yet (that is the Results step). **Wording, for the owner's review:** Prediction 1 is asked as "On the traveler's own watch, does the trip to the horizon come to an end?" with the choices "Yes: it takes a finite time, and they get there", "No: it never finishes, and they never get there" and "It ends for some black holes and not for others". The specification's own draft ("how long does it take to reach the horizon?") contradicts its note that the question must ask whether the trip ends, not how many seconds, so I followed the note; this also changes the third choice from "It depends on how big the black hole is". Predictions 2 and 3 are as in the specification, except that Prediction 3 spells out "(the difference in pull between their head and their feet)" because "stretching" is not defined until the introduction, which is not written yet. **Browser check** (headless Chromium, 1200 and 390 pixels, scripted, 20 checks per width, all passed): fresh load shows the three questions and no picture, with the controls and Run disabled; two answers keep Run disabled; three (the last chosen from the keyboard) enable it; no picture until Run; during the run Run reads "Running..." and the prediction buttons are disabled; after the run "Change predictions" appears and the prediction buttons stay disabled; changing the black hole hides the pictures and a new Run shows them again; "Change predictions" hides them, keeps the choices and the chosen black hole, and re-enables Run; no sideways scroll; no console errors. Full Vitest run: 538 passed. **Not checked:** a screen reader, other browsers. **Still not built:** the introduction, the Results panel and the tutor.

- **Introduction (2026-10-11, draft wording, awaiting the owner's line-by-line review):** added to `src/components/FallingInExperiment.tsx` above the predictions, in the structure of Experiment 4's introduction: the question; why even ask this (in everyday life everyone agrees how long a fall takes, but two clocks in Experiment 2 did not agree about how fast they tick); what happens, as six numbered steps; some words we will use (the traveler's clock; the far-away clock, read at the moment the traveler passes each distance and stated to be a comparison of two clocks, not a picture; the horizon and horizon radius, recalled; the **horizon light-time**, with a worked example, 30 ÷ 300,000 = 0.0001 seconds for the 10-Sun black hole; the **stretch**, explained as feet nearer than head and measured in g, linked to Gravity Experiment 3's tidal effect; the astronomical unit; the exact theory of gravity); the black holes; what this builds on; your job; what to look for; and the assumptions (a thought experiment about a small, 2-meter traveler released from rest and falling straight in; the equations given, not derived, for a non-rotating, uncharged black hole; the far-away clock is compared with the traveler's clock, not a picture; the experiment ends at the horizon and is not a camera view). It uses only claims already in the specification. **It does not give away any prediction answer** (checked by searching its text for "finite", "never", "forever", "without limit", "no limit", "settles", "torn", "survive", "giant" and "much stronger"; none appears). **For the owner:** the question says the hovering clock "ticks differently", not "more slowly", to avoid hinting at the far-away clock's answer; step 5 says only that the experiment "ends at the horizon" (a modeling limit), though that does mildly suggest the traveler gets there; the spec's daily-life comparison (the rubber band) is kept for the Results, as it says. **Revised at the owner's request (2026-10-11):** the "Why even ask this" paragraph was made longer and more vivid: it now puts the learner in the traveler's place (let go, nothing holding you back, no way back once the horizon is crossed, a friend far away watching with a clock while you wear a watch) before asking whether the two would tell the same story of the fall, "how long it lasts, and what you feel on the way down". It still gives away no prediction answer (it says nothing about whether the trip ends, what the far-away clock does, or how the stretch depends on the black hole), and "the pull on you growing stronger at every step" is the ordinary fact that gravity is stronger nearer a mass, not a result of this experiment. **Picture 1's caption was rewritten at the owner's request (2026-10-11)** because it was not clear: it is now six numbered, short steps (what you are looking at; where the fall starts; the two clocks, with blue for the traveler's watch and orange for the far-away clock, and the light-time explained; the stretch, with an example, "3 g" means the feet are pulled harder than the head by as much as three times Earth's gravity; the scale bar; what to watch) and the limit, in the order a learner meets the things in the picture, and with each name matching the label on the canvas. It still says nothing about what the clocks or the stretch will do. **The stretch readout's label on the canvas** was also reworded at the owner's request, from "stretch across a 2-meter body (Earth's surface gravity is 1 g)" to "stretch: the difference in pull from head to feet (2-meter body)", with "(1 g = Earth's gravity at its surface)" beside the number; the picture is 8 pixels taller to fit it. **Checked** in headless Chromium at 1200 and 390 pixels (scripted, 26 checks per width: every section heading present, none of the listed give-away words, no picture yet, no sideways scroll, no console errors; the page was viewed at 1200) and the full Vitest run (538 passed). Not checked: a screen reader, other browsers. **Still not built:** the Results panel and the tutor.

- **Results panel (2026-10-11, draft wording, awaiting the owner's line-by-line review):** added to `src/components/FallingInExperiment.tsx`, shown only when the run has finished and the predictions are locked in. It has: a table for the chosen run (the traveler's clock at the horizon, in light-times and ordinary units; the far-away clock at 0.0001 horizon radii from the horizon, "and still rising: it has no limit"; the stretch at the release distance and at the horizon; where the stretch reaches 1 g, or "only inside the horizon, which this experiment does not model"); the three prediction checks, each computed from the physics module (the first uses the trip's length for all three black holes at the chosen release distance, to show that it ends for all of them and only the ordinary time differs; the second the far-away clock and the traveler's clock at 0.01, 0.001 and 0.0001 horizon radii from the horizon, to show that each tenfold closing adds about 2.3 and the traveler's watch hardly changes; the third the stretch at the horizon of the 10-Sun black hole against Sagittarius A*, about 1.8 × 10¹¹ times); the simple math, worked for the chosen release distance and black hole (the traveler's clock from `½ r0^1.5 (η + sin η)` through to ordinary time, and the stretch from `2GM × h ÷ r³` through to g, ending with why it grows as the cube of the distance: 1,000 times from 10 horizon radii to 1); a table of all three black holes; the rubber-band comparison, labeled as an analogy for "the two ends are pulled by different amounts"; and the bordered "What this model can and cannot tell you" box. **For the owner:** (1) the spec's worked example is for a fall from 10 horizon radii; the panel works the chosen release distance instead, so the example always matches the run; (2) there is no daily-life comparison for the clocks, as Decision 9 says; (3) one small addition outside the Results: `stretchInMetersPerSecondSquared` in the physics module (so the worked stretch can show a figure in m/s² before the division by 9.81), with one new test (27 tests in the file); `stretchInG` now divides it by 9.80665. **Checked** in headless Chromium at 1200 and 390 pixels (scripted, 26 checks per width, all passed; the page was viewed at 1200): no Results before or during the run; present after it, with 49 light-times (4.83 thousandths of a second), the stretch of 2.1 × 10⁷ g at the horizon, the 1 g distance of 276 horizon radii, the worked steps (η = 2.498 radians, sin η = 0.6), all three predictions marked right for the right choices and all three "off this time" for wrong choices; M87* at 100 horizon radii gives the trip in years and "only inside the horizon" for the 1 g distance; no sideways scroll; no console errors; the panel was viewed on screen. **Not checked:** 390 pixels beyond the absence of sideways scroll, a screen reader, other browsers, and every combination of the 27 prediction choices (only the right combination and the all-wrong combination were exercised). **Still not built:** the tutor and the final chapter summary.

- **Tutor and chapter summary (2026-10-11, draft wording, awaiting the owner's line-by-line review):** built `src/components/FallingInTutor.tsx` and wired it below the experiment (shown after the run finishes with predictions locked in; it restarts on each Run, as in Experiments 2 to 4). Three questions in sequence, each needing a typed answer, then the explanation: (1) the observation question from "AI Tutor Behavior"; (2) the learner's own three predictions restated, asking what they notice (the Results panel already marks them); (3) the conceptual question, "Experiment 2 said a clock hovering near the horizon ticks more and more slowly ... Yet this traveler's own clock reaches the horizon in an ordinary time. How can both be true?". The explanation has the eight points of the specification: the traveler's clock reaches the horizon in a finite time (49 light-times from 10 horizon radii, with the ordinary time for the three black holes); the far-away clock keeps rising (about 2.3 light-times for each tenfold closing of the gap) and never shows the traveler arriving; both are true because they are different clocks, and "time stops at the horizon" was always about the far-away comparison; the stretching, with the rubber band and `2GM × h ÷ r³` (8 times larger at half the distance); the same fall gives a very different stretch (2.1 × 10⁷ g, 1.1 × 10⁻⁴ g, 5 × 10⁻¹¹ g) so crossing a giant black hole's horizon is locally unremarkable; for the 10-Sun black hole the stretch passes 1 g at about 276 horizon radii, "far more than any body could survive" (**general knowledge, not checked against a primary source**, Decision 8); the honest limits; and the ties back to Experiments 2, 3 and 4. Every number is computed from the physics module. The placeholder chapter summary in `src/App.tsx` was replaced by a **draft** "what you learned" paragraph; its "what's next" line says no further experiment is planned in this chapter (Decision 11). **Checked** in headless Chromium at 1200 and 390 pixels (scripted, 36 checks per width, all passed): the tutor is absent before and during the run and present after; it will not continue on an empty answer; the three steps appear in order with no explanation early; all eight points appear with the right numbers; the chapter is saved as completed at the end of the run and as explained only after the explanation, and the summary shows then and not before; changing the black hole hides the Results and tutor; a new run gets a fresh tutor at step 1; "Change predictions" hides it; no sideways scroll; no console errors. Full Vitest run: 539 passed. **Not checked:** a screen reader, other browsers. **Still to do:** the complete-flow test (§21 Step 9) and the final review (Step 10).

- **Complete-flow test (2026-10-11, headless Chromium, scripted, at 1200 and 390 pixels wide; §21 Step 9):** the whole learner journey, 135 checks per width, all passed. Fresh load: the introduction is shown with every section and contains none of the prediction answers (checked by searching for "finite", "forever", "without limit", "no limit", "never", "settles", "torn", "survive" and "much stronger"); nothing is revealed before the run (no pictures, captions, readout, Results, tutor or summary); Run, the black-hole buttons and the release buttons are disabled until all three predictions are answered, and stay disabled with two. After the first Run (stellar black hole from 10 horizon radii): all three pictures and captions appear; **during the run Run reads "Running...", and the controls and prediction buttons are disabled**; there are no Results and no tutor until the run ends; the playback moves inward (the distance falls between two samples) and the far-away clock reads more than the traveler's; every part of the three pictures is labeled on the canvas (the fall: release point, traveler, horizon, black hole, scale, both clocks, the stretch label; the time graph: both curves, the horizon strip, the "keeps going, with no limit" label, the dots; the stretch graph: the three black holes, the 1 g line, the horizon, the traveler's dot). After the run: Results with 49 light-times (4.83 thousandths of a second), the far-away clock at 64.5 and still rising, the stretch of 2.1 × 10⁴ g at the release and 2.1 × 10⁷ g at the horizon, the 1 g distance of 276 horizon radii, 34.6 minutes and 36.3 days for the other two black holes, and all three predictions marked right; the tutor then appears with the summary withheld; it will not continue on an empty answer; it shows its three questions in order with no explanation early, then all eight points with the right numbers; saved progress changes from "completed" to "completed and explained" at that point and not before, and the summary and the "no further experiment is planned" line then show. Other runs: Sagittarius A* from 2 (3.64 light-times, 2.57 minutes, 1.1 × 10⁻⁴ g, the 1 g distance "only inside the horizon"), M87* from 100 (1,570 light-times, years, 5 × 10⁻¹¹ g) and the stellar black hole from 5 (16.9 light-times, 1.7 × 10⁵ g); each change of black hole hides the Results, tutor and pictures, and each new run gets a fresh tutor at step 1. Wrong and mixed predictions: all wrong gives three "off this time" with their own messages; a second combination (depends, settles, same) gives its three different messages; a right, wrong, right combination gives two right and one off. "Change predictions" hides the pictures, Results and tutor, keeps the choices and the chosen black hole, and re-enables Run. Previous goes to Experiment 4 and Next returns to a reset Experiment 5; Next is disabled on this last chapter. Reload keeps the saved progress and chapter. No sideways scroll and no console errors. **One check failed on the first pass and was my own error, not the application's:** I had written the expected stretch for the stellar black hole from 5 horizon radii as 3.3 × 10⁶ g; the correct value is 2.1 × 10⁷ ÷ 5³ = 1.7 × 10⁵ g, and the application showed that. **Not checked:** a screen reader, any browser other than headless Chromium, and every combination of the 27 prediction choices (only the right, all-wrong and two mixed combinations were exercised). **Still to do:** the final review against `docs/PROJECT.md`, `AGENTS.md` and this specification (§21 Step 10).

- **Final review (2026-10-11; §21 Step 10):** compared against `docs/PROJECT.md`, `AGENTS.md` and this specification. Full Vitest run 540 passed; no type errors in the Experiment 5 files (older files have unrelated ones). Every required physics test, success criterion, label and caption is in place; nothing is revealed before the run (§12); playback speed cannot change a result (§11); every term is defined before it is used (§15). **Three gaps found and fixed:** (1) the Results' worked example repeated the closed form's steps (`r0^1.5`, `η`, `sin η`) in the interface, against §9; they now come from a new `travelerClockSteps` in the physics module, with a test, and the "10³ = 1,000 times larger" figure is read from the module's two stretches; (2) the trip-time test for the 10-Sun black hole allowed 5% (`toBeCloseTo(1, 1)`) where this specification says 1%; it now checks 1%; (3) this specification's illustrative stretch for Sagittarius A* was rounded to 1.1 × 10⁻⁴ g, which is 3.3% below the exact 1.137 × 10⁻⁴ g, so Required Test 9's "within 2%" could not hold; the table, the "Facts the model reproduces" line and Test 9 now say 1.14 × 10⁻⁴ g, and the test checks all three black holes to within 2%. The learner-facing text still shows "1.1 × 10⁻⁴ g" (two figures), which is correct. The feasibility note above keeps the rounded figure as history. **Deviations from this specification that stand, for the owner:** Picture 2's vertical axis is the log-scale gap above the horizon, not the distance from the center on a linear scale (the linear version makes the far-away curve look as if it reaches the horizon); the speed of light is imported from `hubblesLawExperiment` as well as the two names from `blackHoleSizeExperiment`; the Results' worked example uses the chosen release distance, not a fixed 10; the "each tenfold closing adds ln 10" check starts at 1.001, and the traveler's clock changes by "about 0.01", not "less than 0.01", between 1.01 and 1.0001; Prediction 1 asks "does the trip come to an end?"; and Prediction 3 spells out "the difference in pull between their head and their feet" because "stretching" is defined only in the introduction. **Still open:** the owner's line-by-line wording review (§28.1) of the introduction, predictions, captions, Results, tutor and summary; the tutor's "far more than any body could survive" sentence is general knowledge and **not checked against a primary source** (Decision 8); at 390 pixels the pictures' labels are very small (the app-wide limit seen in earlier experiments); a screen reader and browsers other than headless Chromium were never checked. **Re-checked after the fixes:** the Results script in headless Chromium at 1200 pixels (26 checks, all passed, including the worked steps and the 1,000-times figure). The full 135-check complete-flow test was not re-run, because only the source of the worked numbers changed.

- **Wording approved (2026-10-11):** the owner's line-by-line wording approval (§28.1) is complete, covering the introduction, prediction questions, captions (including the rewritten caption and stretch label of Picture 1), Results, tutor and chapter summary, as they stand after the final review. The "draft" markers in the code were updated. The tutor's "far more than any body could survive" sentence is still general knowledge **not checked against a primary source** (Decision 8), and the log-scale axis of Picture 2 stands as a recorded deviation. This experiment is complete.
