# Black Holes and Strong Gravity — Experiment 3: Orbits Near a Black Hole — Is There a Point of No Safe Orbit?

**Status: APPROVED by the owner on 2026-10-10, with all twelve "Decisions Needing Human Review" items taken as Claude's recommended defaults. Proposed by Claude per `CLAUDE.md` §23 Stages 1–2 and drafted as a specification per Stage 3 on 2026-10-10, as the third of the five experiments planned for this group (see the group list in Experiment 1's specification). Being built one step at a time (§6); see "Implementation Notes" for progress.**

---

## Overview

Gravity and Curved Spacetime Experiment 6 showed that a planet orbits because of sideways motion: launched at the right speed, an object keeps missing the mass it falls toward. In ordinary gravity that works at **every** distance. Whatever the distance, there is a sideways speed that gives a circular orbit, and if the object is nudged a little, it simply wobbles into a slightly different orbit and keeps going.

Experiment 1 of this group found the horizon radius, and Experiment 2 showed that gravity near it is strong enough to slow clocks to a crawl. This experiment asks what that strong gravity does to **orbits**: **is it still safe to circle a black hole at any distance outside its horizon?**

The new idea is one thing: **in the exact theory of gravity, close to a black hole there is a last safe circular orbit, at 3 horizon radii (6GM/c²). Outside it, a circular orbit that is nudged merely wobbles, as in ordinary gravity. At or inside it, a circular orbit cannot last: the tiniest nudge inward sends the object spiraling into the black hole.** Ordinary gravity has no such edge.

The learner picks a black hole and a starting distance, and watches two probes side by side, each launched at the sideways speed that gives a circular orbit **by its own rules** (ordinary gravity for the left one, the exact theory for the right one), and each given the same tiny inward nudge. Far away the two orbits look the same. Near the black hole, one keeps circling and the other plunges in.

The experiment is a **thought experiment** about a small probe. It does not say how the probe got there, what could push it, or what happens after it crosses the horizon; those are stated, not modeled.

---

## Learning Objective

After this experiment, the learner should understand:

1. In ordinary gravity (Gravity Experiment 6), an object can circle a mass safely at any distance, with the right sideways speed.
2. Near a black hole, the exact theory differs: there is a **last safe circular orbit** at 3 horizon radii. Circular orbits outside it survive a small nudge. At or inside it, a small nudge sends the object spiraling in.
3. This edge is at the same number of horizon radii for every black hole, as with the slowing in Experiment 2: the 10-Sun black hole's edge is about 89 km from its center, Sagittarius A*'s is about 38 million km, and M87*'s is about 58 billion km.
4. Between 1.5 and 3 horizon radii a circular orbit still exists on paper, but it is balanced like a marble on top of a hill: any nudge ends it. Inside 1.5 horizon radii, no circular orbit exists at all for anything slower than light.
5. Far from the black hole (20 horizon radii in this experiment), the exact theory and ordinary gravity give nearly identical orbits. This is why ordinary gravity worked for planets, satellites and GPS in the earlier chapters.
6. What the experiment does not say: how a probe could be put into such an orbit, what happens after it crosses the horizon, what spinning black holes do, and what real orbits near black holes lose to gravitational waves.

---

## Physical Situation

A black hole of known mass and a small probe, so light that its own gravity can be ignored. The probe moves in a flat sheet (the plane of its orbit), seen from above. It starts at a chosen distance `r0` from the black hole's center, moving sideways at the speed that would give an exactly circular orbit there, and is then given a tiny inward nudge. The experiment follows the probe for up to 10 turns around the black hole, or until it crosses the horizon.

Two probes are shown, in two panels, sharing the same black hole, the same starting distance and the same nudge:

- the **ordinary-gravity probe**, using the Newtonian inverse-square law of Gravity Experiment 6, launched at ordinary gravity's circular-orbit speed;
- the **exact-theory probe**, using the exact equation of motion for a small object near a non-rotating, uncharged black hole, launched at the exact theory's circular-orbit speed.

Each probe is launched at *its own* circular-orbit speed. This is deliberate: it asks the same question of both, "if this were a perfect circular orbit by your rules, and then a hair of inward push were added, does it last?"

### The equations (given, not derived)

Let `M` stand for `GM/c²` (in units where `G = c = 1`), so that the horizon radius is `r_s = 2M`, and let `L` be the probe's angular momentum per unit mass. Write `u = 1/r` and let `φ` be the angle swept around the black hole. The path of the probe obeys:

- **ordinary gravity:** `d²u/dφ² = −u + M/L²`
- **exact theory:** `d²u/dφ² = −u + M/L² + 3M·u²`

The only difference is the last term, `3M·u²`: **an extra pull toward the black hole that exact theory has and ordinary gravity does not**, and that grows quickly as the probe gets closer (as the square of `1/r`). Far away it is negligible. Close in, it is strong. The exact-theory equation is standard general relativity for a small object near a non-rotating, uncharged black hole; it is stated and used here, not derived, since deriving it needs Einstein's equations, which are outside this project.

**Circular orbits.** A circular orbit needs `d²u/dφ² = 0` with `u = 1/r`, which gives:

- ordinary gravity: `L² = M·r`, for every `r`;
- exact theory: `L² = M·r² / (r − 3M)`, which exists only for `r > 3M`, that is, for `r` greater than **1.5 horizon radii**.

**The last safe orbit.** In the exact theory, a circular orbit survives a small nudge only if `r ≥ 6M`, which is **3 horizon radii**. At and inside it, any nudge inward ends the orbit. This value is standard and is stated here, not derived. (The model also checks it: see "Required Physics Tests".)

**The launch speed,** as measured by someone hovering at that distance (the hovering observers of Experiment 2), as a fraction of the speed of light:

- ordinary gravity: `√(r_s / (2r))`;
- exact theory: `√(r_s / (2(r − r_s)))`, which reaches 1 (the speed of light) at 1.5 horizon radii.

### The nudge

At the start, the probe's distance is made to shrink at a rate of `0.001` of its distance for each radian (about 57 degrees) it sweeps around the black hole: `d(r)/dφ = −0.001 × r0`. Plainly: **an inward nudge so small that, if nothing else acted, it would carry the probe in by about 0.6% of its distance over one full turn.** It stands in for any tiny disturbance a real orbit would have, such as a passing grain of dust.

The nudge is small but not zero. Because of this, in the model the edge between "keeps circling" and "plunges" lies at about **3.03** horizon radii, not exactly 3: very close to the last safe orbit, even a tiny nudge is enough to push an orbit over the edge. The exact theory's edge, for a nudge that is vanishingly small, is exactly 3. The Results state both numbers, with the first one computed (see "Physics Model").

### Illustrative results (computed, not looked up; the specification's tests check them)

Both probes nudged by `0.001`, followed for up to 10 turns. Distances in horizon radii.

| Start distance | Ordinary gravity | Exact theory | Launch speed, exact (ordinary), as a fraction of light speed |
|---|---|---|---|
| 20 | keeps circling | keeps circling | 0.162 (0.158) |
| 10 | keeps circling | keeps circling | 0.236 (0.224) |
| 6 | keeps circling | keeps circling | 0.316 (0.289) |
| 4 | keeps circling | keeps circling | 0.408 (0.354) |
| 3.1 | keeps circling | keeps circling, wobbling more | 0.488 (0.402) |
| 3 | keeps circling | **plunges after about 6.0 turns** | 0.500 (0.408) |
| 2.5 | keeps circling | **plunges after about 2.3 turns** | 0.577 (0.447) |
| 2 | keeps circling | **plunges after about 1.6 turns** | 0.707 (0.500) |
| 1.6 | keeps circling | **plunges after about 1.2 turns** | 0.913 (0.559) |

(Ordinary gravity "keeps circling" even at 1.6 horizon radii. That is not a prediction of real physics there; it shows ordinary gravity has no edge, and it is outside the range where ordinary gravity applies. The experiment says so.)

### The black holes

Reused unchanged from Experiment 1: the stellar black hole (10 Suns, horizon radius about 29.5 km), Sagittarius A* (about 4.3 million Suns, horizon radius about 12.7 million km) and M87* (about 6.5 billion Suns, horizon radius about 19 billion km). The last safe orbit, at 3 horizon radii, is about 88.6 km, about 38.1 million km (about 0.25 AU) and about 57.6 billion km (about 385 AU) from their centers.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **A thought experiment about a small probe.** The probe is so light that its own gravity does not matter. How it got into orbit is not modeled.
- **The exact equation is for a non-rotating, uncharged black hole,** given and not derived. Real black holes usually spin, which moves the last safe orbit.
- **The orbit is in a flat plane,** seen from above, and the probe does not lose any energy as it goes. In real life, an orbit near a black hole loses energy to gravitational waves (Gravitational Waves chapter), which this experiment leaves out.
- **The tiny nudge is the same for both probes and is small but not zero.** It is why the model's edge is at about 3.03, not exactly 3.
- **"Plunges" means the probe's distance reaches the horizon.** Nothing past that is modeled. The time shown is the probe's own time; how a far-away observer would see the plunge (Experiment 2) is not shown.
- **The ordinary-gravity probe is shown at distances where ordinary gravity is not a good description,** only so that the two rules can be compared.
- **Distance is measured as in Experiment 1** (the circumference divided by 2π).
- **No circular orbit exists inside 1.5 horizon radii,** so the distance control stops at 1.6.

### Not introduced

The photon sphere as a named object (light itself can circle at exactly 1.5 horizon radii; that belongs to Experiment 4, how a black hole bends light), the turning of an elongated orbit's long axis from one lap to the next (a small effect that appears in real orbits near a mass, seen here only as a slight lopsidedness of the wobbling), elliptical and escaping orbits near a black hole, spinning (Kerr) black holes, gravitational-wave energy loss, accretion disks as a subject, what falling in feels like (Experiment 5), and anything inside the horizon. All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16). The tutor may name a few of these in one sentence each as things the model does not cover.

---

## Physics Model

One new, self-contained module. It **reuses** earlier code unchanged (imported, not redefined): `horizonRadiusKm` and `OBJECT_PRESETS` from Experiment 1 of this group (`blackHoleSizeExperiment.ts`), for the kilometer distances. It does **not** import Gravity Experiment 6's module (`orbitExperiment.ts`, which works in made-up dimensionless units) or Gravity Experiment 7's made-up units, and a regression test checks this. Instead it restates the ordinary-gravity equation in one line, in the same units as the exact one, so that the two probes are driven by two lines of the same equation and the difference is the one extra term. A test checks that the ordinary-gravity launch speed agrees with Experiment 6's relation (`v² = GM/r`).

The paths are computed by numerically stepping the equations for `u(φ)` above in small, equal steps of the angle (720 steps per turn) with a fourth-order Runge-Kutta method, so the resolution is the same at every distance. This is a numerical calculation, not a shortcut formula, so that "keeps circling" and "plunges" both come out of the same calculation.

```typescript
// src/physics/orbitsNearBlackHoleExperiment.ts

export const NUDGE = 0.001                    // d(r)/d(phi) = -NUDGE * r0 at the start
export const MAX_TURNS = 10
export const STEPS_PER_TURN = 720
export const MIN_START_IN_HORIZON_RADII = 1.6
export const MAX_START_IN_HORIZON_RADII = 20
export const LAST_SAFE_ORBIT_IN_HORIZON_RADII = 3      // 6GM/c^2, given

export const BLACK_HOLE_PRESETS: ObjectPreset[]        // the three black holes of Experiment 1

// Circular-orbit launch speed as seen by someone hovering at that distance, as a fraction of the speed of light.
export function exactCircularSpeedFractionOfLight(startInHorizonRadii: number): number   // throws below 1.5
export function ordinaryCircularSpeedFractionOfLight(startInHorizonRadii: number): number

export interface OrbitPoint { turns: number; distanceInHorizonRadii: number; x: number; y: number }   // x, y in horizon radii

export type Outcome = 'keeps-circling' | 'plunges'

export interface OrbitPath {
  rule: 'ordinary' | 'exact'
  outcome: Outcome
  turnsCompleted: number            // turns swept when the path ended (MAX_TURNS, or fewer if it plunged)
  closestInHorizonRadii: number
  farthestInHorizonRadii: number
  points: OrbitPoint[]
}

export interface OrbitsNearBlackHoleResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startInHorizonRadii: number
  startKm: number
  lastSafeOrbitKm: number           // 3 horizon radii, in km, for this black hole
  exactSpeedFractionOfLight: number
  ordinarySpeedFractionOfLight: number
  ordinary: OrbitPath
  exact: OrbitPath
}

export function runOrbitsNearBlackHoleExperiment(
  presetId: ObjectPreset['id'],
  startInHorizonRadii: number
): OrbitsNearBlackHoleResult

// For the Results: the smallest starting distance (in horizon radii) at which the exact-theory probe
// keeps circling for MAX_TURNS with this nudge, found by bisection on the same calculation.
export function modelEdgeInHorizonRadii(): number
```

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser. The playback speed (set by the interface, at a fixed real duration, independent of the result) does not change any result (`CLAUDE.md` §11).

---

## Learner Controls

- **The black hole:** a stellar black hole (10 Suns), Sagittarius A*, or M87*.
- **The starting distance,** in horizon radii: a logarithmic slider from 20 down to 1.6, with presets **20 ("far")**, **6**, **3.5**, **3**, **2.5** and **1.6**. The distance in kilometers (and AU where that is more natural) is shown beside it.
- **Run,** which plays both probes' paths over a fixed real duration independent of the physics (`CLAUDE.md` §11).

---

## Prediction Activity

Before the controls and results are shown, the learner answers three questions in sequence (not scored):

1. "A probe is circling a black hole at 2 horizon radii, at exactly the speed that gives a circular orbit there. Then it gets a tiny nudge inward. What happens?" (It wobbles a little and keeps circling / it spirals in and crosses the horizon / it flies off.) The model's answer is the second.
2. "In ordinary gravity, a planet can circle at any distance. Close to a black hole, where is the last safe place to circle?" (Anywhere outside the horizon / about 3 horizon radii from the center / about 10 horizon radii from the center.) The model's answer is the second.
3. "Far from the black hole, at 20 horizon radii, will the exact theory's orbit look different from ordinary gravity's?" (Very different / nearly the same.) The model's answer is the second.

The controls are disabled until all three predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the choices. The pictures, caption, Results and tutor appear only after predictions are locked in (`CLAUDE.md` §12). The choices need the owner's wording review (see Decision 8).

---

## Experiment Behavior

### Display

Two top-down pictures side by side (stacked on narrow screens), drawn at **one scale shared by both panels, zoomed to the start**: the view reaches 1.25 times the starting distance (and never less than 4 horizon radii, so the ring at 3 always fits), with a labeled scale bar giving the length of a round number of horizon radii (so that changing the starting distance visibly changes the picture, `CLAUDE.md` §14.2; changed from a fixed scale at the owner's direction on 2026-10-10, see "Implementation Notes"):

- **Panel 1, "Ordinary gravity (Gravity Experiment 6)".** The black hole as a dark disk with its horizon ring (rose) labeled "horizon", the starting distance as a dashed circle labeled "start", the probe as a moving dot (gold) and its path as a trail.
- **Panel 2, "The exact theory".** The same picture, plus a dashed ring at 3 horizon radii labeled "last safe orbit" (a second visual contrast), with the probe drawn in a distinct color (blue). When the probe's distance reaches the horizon, its trail ends there and a label says "crossed the horizon: plunged".
- Both panels show the probe's turns completed and its distance in horizon radii, live.
- A **"How to read these diagrams"** caption (`CLAUDE.md` §14), shown after predictions are locked in, in the step-by-step style of the earlier experiments. It must say what each drawn thing is, what the two probes' launch speeds mean, what the nudge is, why the left probe is shown at distances where ordinary gravity does not apply, what the dashed ring marks, and that the experiment follows a small probe in a flat plane, not a falling traveler.
- **Live readout:** the black hole, the starting distance (horizon radii and kilometers), each probe's launch speed as a fraction of the speed of light, and each probe's outcome so far.

(A graph of distance against turns, for both probes, is also proposed as a third picture, since it makes "a small wobble" against "a steady drop" readable when the orbit itself looks nearly circular; see Decision 6.)

### Results

States the black hole and starting distance, each probe's outcome (and, for a plunge, after how many turns), each probe's launch speed as a fraction of the speed of light (and the difference between them), and the model's edge (`modelEdgeInHorizonRadii()`, about 3.03) beside the exact theory's last safe orbit, 3 horizon radii, in kilometers for the chosen black hole; compares all three predictions with what the model gave; includes simple math per `CLAUDE.md` §15, for example `6GM/c²` worked as "about 2.95 km per solar mass for `r_s`, so 3 × 2.95 km, about 8.9 km, for each solar mass; 10 solar masses gives about 89 km"; includes a daily-life comparison; and states the model's limits in a prominent bordered box (`CLAUDE.md` §28.1 pattern).

The daily-life comparison (to be confirmed, kept out of the introduction so it does not reveal the answers): a marble at the bottom of a bowl, which returns to the bottom after a nudge, and a marble balanced on top of an upside-down bowl, which rolls off after the slightest nudge. A stable circular orbit is like the first, and an orbit at or inside the last safe orbit is like the second. It is an analogy for "survives a nudge or does not", not for how gravity works.

### Introductory text

To be drafted during implementation, covering the question (is it safe to circle a black hole at any distance?), what happens, the learner's job, what to look for, new terms defined in plain language before use (**circular orbit**, **nudge**, **plunge**, with **horizon** and **horizon radius** recalled from Experiment 1, and the **astronomical unit**), what it builds on (Gravity Experiment 6's orbits, Experiment 1's horizon radius and Experiment 2's strong-gravity effects), a "Why even ask this" paragraph, and the assumptions above. The introduction says plainly that this experiment uses the exact theory's equation for one of the two probes and ordinary gravity's for the other, that the equation is given and not derived, and that it is for a non-rotating black hole. Any statement that gives away the prediction answers (the edge at 3 horizon radii, that far orbits look the same) is kept out of the introduction (`CLAUDE.md` §12). Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form the three predictions; does not reveal any answer.
- **After "Run" completes:**
  1. Observation: "Look at the two paths. What does each probe do? Now try other starting distances, including one very close in and one far out. Where does the exact-theory probe stop plunging?"
  2. Prediction comparison: the learner's three predicted answers beside what the model gave.
  3. Conceptual question: "In ordinary gravity, a nudged circular orbit always survives. Near a black hole, it does not. What do you think is different about gravity close in?" — intended to let the learner reach "gravity is stronger close in than ordinary gravity says".
  4. Explanation: (1) ordinary gravity has no edge: a nudged circular orbit at any distance only wobbles; (2) in the exact theory there is a last safe circular orbit at `6GM/c²`, 3 horizon radii, with the marble-on-a-bowl picture for stable and unstable orbits; (3) why: the exact theory adds an extra pull toward the black hole that grows quickly as the probe gets closer; far away it is negligible, close in it overwhelms the sideways motion's hold on the orbit; (4) circular orbits exist between 1.5 and 3 horizon radii on paper but do not last, and inside 1.5 no circular orbit exists for anything slower than light (light itself can circle at exactly 1.5, which a later experiment takes up); (5) far away, at 20 horizon radii, the two rules agree, which is why ordinary gravity served for planets, satellites and GPS; (6) the model's edge is at about 3.03 because the nudge is not zero, and the exact theory's edge, for a vanishing nudge, is exactly 3; (7) what real matter does near a black hole (gas spiraling in is generally described as forming a disk whose inner edge is near this last safe orbit), stated in one plain sentence and clearly marked as outside what this experiment shows; (8) honest limits: a thought experiment about a small probe, non-rotating and uncharged, the equation given and not derived, no energy lost to gravitational waves, a spinning black hole's last safe orbit is elsewhere, and nothing inside the horizon is modeled.

---

## Required Physics Tests

1. `exactCircularSpeedFractionOfLight(x)` equals `√(1 / (2(x − 1)))` at several `x`, equals 0.5 at 3 horizon radii, reaches 1 as `x` approaches 1.5, and throws a `RangeError` at or below 1.5; the ordinary-gravity speed equals `√(1 / (2x))`.
2. Far away, the two speeds agree: the ratio exact ÷ ordinary is within 1% at 100 horizon radii (checked in the module's own units, though the controls stop at 20) and is above 1 at every `x`, growing as `x` falls.
3. The ordinary-gravity speed agrees with Gravity Experiment 6's circular-speed relation: `v² × r` is the same constant (`GM`) at every distance.
4. The **last safe orbit** is found independently of the module's classification: for the exact-theory circular-orbit angular momentum at each `r`, the second derivative of the effective potential (written separately, as the standard `(1 − 2M/r)(1 + L²/r²)`) is positive (stable) for `r > 3` horizon radii, negative (unstable) for `r` between 1.5 and 3, and zero at 3.
5. The integrated outcome agrees with the effective-potential criterion (the probe plunges if its energy exceeds the potential at every point between the horizon and its start): for starting distances away from the model's edge (at 1.6, 2, 2.5, 3, 3.5, 4, 6, 10, 20).
6. For starting distances of 3 horizon radii or less, the exact-theory probe plunges within `MAX_TURNS`, its path ends at the horizon, and the number of turns before the plunge grows as the start approaches 3 (checked at 1.6, 2, 2.5 and 3; about 1.2, 1.6, 2.3 and 6.0 turns).
7. For starting distances of 3.5 horizon radii or more, the exact-theory probe keeps circling for `MAX_TURNS`, and its distance stays within 1% of its start (checked at 3.5, 4, 6, 10 and 20).
8. The ordinary-gravity probe never plunges at any allowed start, and its distance stays within 2 × `NUDGE` × start of its start (0.2%), checked across the whole range.
9. Conserved quantities: for a keeps-circling exact-theory run, the energy computed from the state is constant to within 10⁻⁶ across the path; the angular momentum is exact by construction.
10. At 20 horizon radii the two paths agree closely: the largest difference in distance between the two, as a fraction of the start, is under 0.5%. At 3.1 horizon radii the exact-theory probe wobbles at least twice as much as the ordinary-gravity probe.
11. `modelEdgeInHorizonRadii()` is above 3 and below 3.05, and approaches 3 as the nudge falls (checked at nudges of 0.01, 0.005, 0.001 and 0.0002 by the underlying function with the nudge as a parameter).
12. Each path starts at its starting distance and angle 0, ends at the horizon (for a plunge) or after `MAX_TURNS`, is evenly spaced in angle, and has `x`, `y` consistent with the distance and angle.
13. `lastSafeOrbitKm` is 3 × `horizonRadiusKm(mass)` for each black hole, and the starting distance in kilometers is the starting distance in horizon radii times `horizonRadiusKm(mass)` (the outcome is the same for all three black holes at the same distance in horizon radii).
14. The module imports `horizonRadiusKm` and `OBJECT_PRESETS` from `blackHoleSizeExperiment`, and does not import from `blackHoleExperiment` (Gravity Experiment 7) or `orbitExperiment` — a regression check (`CLAUDE.md` §8).
15. Deterministic across repeated calls, independent of any UI or animation state.

---

## Decisions Needing Human Review

Each shows Claude's recommended default as used above.

1. **Title and the one new idea.** Default: "Orbits Near a Black Hole: Is There a Point of No Safe Orbit?", with the last safe circular orbit as the single idea. Other ideas that belong near it are named but not taught: the photon sphere (Experiment 4, light bending), the turning of an elongated orbit (named only as a slight lopsidedness), and falling in (Experiment 5).
2. **A simulation of the exact equation, not only a diagram.** Default: two probes, integrated numerically, so the plunge comes out of the calculation rather than being drawn by hand, as in Gravity Experiment 6. Alternative: a static picture of stable and unstable orbits from the closed-form criterion only (simpler, less convincing, nothing to watch).
3. **The nudge.** Default: `d(r)/dφ = −0.001 × r0`, small enough that the edge in the model is about 3.03 and every stable orbit looks almost circular. The learner is told plainly that the model's edge is slightly above the exact theory's 3, and why. Alternatives: a bigger nudge (the edge moves to about 3.1 or 3.2 and orbits wobble visibly) or a smaller one (the edge approaches 3 but plunges near the edge take many more turns).
4. **Both probes launched at their own circular-orbit speed.** Default: yes (each is "a circular orbit by its own rules"), and the two launch speeds are shown in the Results as one extra row. This adds a second quantity (the speeds) that the experiment does not otherwise need. Alternative: launch both at the same speed (loses the clean question) or leave the speeds out.
5. **Distance range and presets.** Default: 20 down to 1.6 horizon radii. 1.6 is the closest allowed because circular orbits do not exist at or inside 1.5 horizon radii; at 1.6 the launch speed is already about 0.91 of the speed of light. **Revised 2026-10-10 at the owner's direction:** the drawing was first specified at a fixed scale (the full width equal to 20 horizon radii), but in the first build the interesting starts (1.6 to 3.5) filled only about a fifth of each panel, so each run is now zoomed to its start (view reaching 1.25 times the start, at least 4 horizon radii) with a scale bar.
6. **A third picture (distance against turns).** Default: include it, to make the wobble against the steady drop readable. Alternative: two panels only (shorter, but the stable orbits all look like perfect circles).
7. **The black hole control.** Default: keep the three black holes, though the outcome depends only on distance in horizon radii (kilometer labels and the last safe orbit's distance differ), as in Experiment 2. Alternative: a single black hole.
8. **The three predictions and their choices.** Default as above; the wording, especially Prediction 3 ("nearly the same" is the model's answer), needs the owner's review.
9. **The marble comparison** (a bowl against an upside-down bowl). Default: in the Results and the tutor, labeled as an analogy for "survives a nudge or not", not for gravity itself. Alternative: a different comparison, or none.
10. **A real-world sentence** (matter spiraling into a black hole is generally described as forming a disk whose inner edge sits near the last safe orbit). Default: one sentence in the tutor, marked as outside what the experiment shows. Alternative: leave it out, so as to add no claim the experiment does not demonstrate.
11. **Gravitational-wave energy loss and spin.** Default: both named in the assumptions and the tutor's limits (an orbit really loses energy to gravitational waves; a spinning black hole's last safe orbit is elsewhere, with no numbers).
12. **Not checked against a primary source:** the exact-theory equation, the circular-orbit formulas and the 3-horizon-radii value are standard general relativity and were stated from general knowledge. Claude checked them on 2026-10-10 only against each other: the equation follows from the standard effective-potential form, the circular-orbit and last-safe-orbit conditions follow from it, and the numerical stepping reproduced them (see "Implementation Notes"). The disk sentence in Decision 10 is general knowledge.

---

## Relationship to Previous Experiments

- **Gravity and Curved Spacetime Experiment 6 (orbits):** the ordinary-gravity probe is that experiment's physics restated in this experiment's units; the sideways-speed idea and the "falling around the mass" picture are reused. This experiment adds what changes near a black hole.
- **Black Holes and Strong Gravity Experiment 1:** the horizon radius, the three black holes and the real kilometer scale.
- **Black Holes and Strong Gravity Experiment 2:** the strong-gravity effects near a horizon, and the fact that results depend only on the number of horizon radii. Its hovering observers are the reference for the launch speeds.
- **Gravity and Curved Spacetime Experiment 7:** the ordinary-gravity black hole; this experiment does not change it.
- **Gravitational Waves Experiments 1–3:** orbits near black holes lose energy to gravitational waves, which this experiment leaves out.

## Relationship to Later Experiments

- **Experiment 4, how a black hole bends light** (planned, not approved): the exact theory's circular orbit at 1.5 horizon radii, which this experiment only mentions, is where light itself can circle.
- **Experiment 5, falling in** (planned, not approved): the plunge shown here is where that experiment starts.

---

## Success Criteria

1. The learner makes all three predictions before the pictures, caption and Results are shown.
2. Both panels use one scale, zoomed to the start with a labeled scale bar, so choosing a different starting distance visibly changes the picture (the black hole is drawn larger for a close start and smaller for a far one), and the two probes' paths visibly differ near the black hole and look nearly the same at 20 horizon radii.
3. Both panels label every drawn component (the black hole, the horizon, the start, each probe, and the ring at 3 horizon radii in the exact-theory panel), visually distinguish the two probes, and carry the "How to read these diagrams" caption (`CLAUDE.md` §14).
4. The exact-theory probe keeps circling for starting distances of 3.5 horizon radii or more and plunges at 3 or less, and the ordinary-gravity probe never plunges, as the model computes.
5. The Results correctly state each outcome, the launch speeds, the model's edge beside the exact theory's last safe orbit in kilometers, compare all three predictions with the model, and include the worked calculation and the daily-life comparison.
6. The experiment states plainly that it is a thought experiment about a small probe, that the exact equation is for a non-rotating, uncharged black hole and is given, not derived, that the nudge is small but not zero (which is why the model's edge is slightly above 3), and that nothing inside the horizon and no gravitational-wave energy loss is modeled.
7. The experiment connects back to Gravity Experiment 6, Experiment 1 and Experiment 2 of this group, and does not recompute or modify any earlier experiment's physics.
8. Every specialized term is defined in plain language at first use (`CLAUDE.md` §15).

---

## Implementation Notes

Nothing has been built. A feasibility check was run in a scratch script outside the project on 2026-10-10 (not part of the application): integrating the equation of motion in two forms (in proper time, and in the angle swept) gave the same results, and the integrated outcome agreed with the effective-potential criterion at every distance tested away from the edge. It confirmed the table above (plunge after about 6.0, 2.3, 1.6 and 1.2 turns at 3, 2.5, 2 and 1.6 horizon radii for a nudge of 0.001; the edge at about 3.03; all stable orbits staying within about 1% of their starting distance, the closest ones wobbling most). It also showed that the nudge size sets where the edge falls (about 3.13 for a nudge of 0.01, 3.08 for 0.005, 3.03 for 0.001, and 3.00 for 0.0002), which is why Decision 3 asks for the owner's choice.

- **Approval (2026-10-10):** the owner approved this specification, taking all twelve "Decisions Needing Human Review" items as Claude's recommended defaults.
- **Step 1, physics model and physics tests (2026-10-10):** built `src/physics/orbitsNearBlackHoleExperiment.ts` and `src/physics/orbitsNearBlackHoleExperiment.test.ts` (21 tests covering all 15 "Required Physics Tests"). The paths are computed by stepping the equation for `u(φ)` in equal steps of the angle (720 per turn, fourth-order Runge-Kutta); a plunging path ends exactly at the horizon by interpolating the last step. Two small additions to the interface in this specification: `orbitPath(rule, start, nudge)` is exported (the nudge is a parameter so the edge can be tested at several nudges, and `modelEdgeInHorizonRadii(nudge)` takes it too), and each `OrbitPoint` carries a `duDphi` field so the conserved energy can be checked in a test; the interface will not show it. The effective-potential criterion and the stability test are written independently in the test file. **Checked that the tests are not vacuous:** with the extra exact-theory term temporarily removed, 7 of the 21 failed. Results match the feasibility check: the exact-theory probe plunges after about 1.2, 1.6, 2.3 and 6.0 turns at 1.6, 2, 2.5 and 3 horizon radii and keeps circling from 3.5 up; the model's edge is about 3.025. Not built yet: the interface, predictions, results, tutor, introduction, wiring into `src/App.tsx`, complete-flow test and final review.

- **Step 3, basic interface (2026-10-10):** built `src/components/OrbitsNearBlackHoleExperiment.tsx` and wired it into `src/App.tsx` as chapter 3 of the "Black Holes and Strong Gravity" group. It has the black-hole buttons (the three from Experiment 1), the start-distance presets (20, 6, 3.5, 3, 2.5, 1.6) and a continuous logarithmic slider from 1.6 to 20 horizon radii, Run (12 seconds of real playback for 10 turns, independent of the result), a live readout (the black hole, the start in horizon radii and kilometers, the last safe orbit in kilometers, both launch speeds as fractions of the speed of light, and each probe's state), and the two labeled orbit panels at one fixed scale (the full width is 20 horizon radii): the gold ordinary-gravity probe on the left and the blue exact-theory probe on the right, each with the black hole and its rose horizon ring, a dashed ring for the start, on-canvas "start", "probe" and (exact panel only) "last safe orbit" labels, a legend strip, and live turns and distance; the exact panel also has a dashed purple ring at 3 horizon radii. A plunging probe's trail ends at the horizon and the panel says "Crossed the horizon: plunged". A "How to read these diagrams" caption covers both. The panels are stacked on a narrow screen. Two changes outside the new files: Experiment 2's chapter summary "what's next" line now points to this experiment (draft wording, not yet approved by the owner), and a placeholder summary was added for this chapter (not shown to learners until the tutor exists). **Not built yet, by design:** the distance-against-turns graph (Decision 6), the three predictions and their gating, the introduction, the Results panel and the tutor. The readout, pictures and caption currently show without prediction gating, as in earlier experiments' basic-UI steps.
- **Browser check of Step 3 (headless Chromium, `http://localhost:5173/`):** the stellar black hole at 2.5 horizon radii (exact probe plunged after 2.28 turns, ordinary probe kept circling), Sagittarius A* at 20 (both kept circling) and M87* at 3.5 (both kept circling), each mid-run and at the end; the readout numbers matched the physics module (launch speeds 0.447 and 0.577 at 2.5; 0.158 and 0.162 at 20; kilometer figures correct); saved progress recorded the chapter as completed; the slider responds to the arrow keys; at 390 pixels the page does not scroll sideways (the two panels stack and shrink to about 174 pixels wide, the same app-wide narrow content column noted for earlier experiments); no console errors. Layout problems found and fixed: the start label collided with the header text at a start of 20, the ring labels crowded each other near the black hole, and the "probe" label was cut off at the right edge. **A legibility problem with the approved fixed scale (Decision 5), for the owner:** because the full width is 20 horizon radii, the interesting cases (starts of 1.6 to 3.5) occupy only about a fifth of each panel's width (a circle about 50 pixels across at a start of 3), so the plunge is small. Claude built the approved design and did not change it. Proposed alternative, for the owner's decision: zoom each run to the start (view radius about 1.25 times the start, at least 4 horizon radii), shared by both panels, with a labeled scale bar, so the plunge fills the picture. The cost is that the black hole's drawn size then changes with the start instead of the start ring's. Not checked: a screen reader and any browser other than headless Chromium.

- **Zoom (2026-10-10, at the owner's direction, after the Step 3 commit):** replaced the fixed scale by a scale shared by both panels and zoomed to the start (view radius 1.25 times the start, at least 4 horizon radii) with a scale bar (1, 2, 5, 10 or 20 horizon radii, the longest that fits). The specification's Display section, Decision 5 and Success Criterion 2 were updated to match, and the caption now explains the zoom and tells the learner to compare starts by the scale bar and the readout, not by the sizes of the drawings.
- **Browser check of the zoom (2026-10-10, headless Chromium):** at a start of 2.5 the exact-theory probe's plunge now fills the panel (the black hole about 40 pixels in radius, the scale bar reading "1 horizon radius"); at 3.5 the ring at 3 and the start ring are both clearly visible; at 20 the orbit fills the panel (scale bar "10 horizon radii") and the black hole is small but visible. The readout numbers are unchanged. One label problem found and fixed: the "last safe orbit" label was cut off at the left edge when the ring was large (it now sits at the bottom of the ring, inside it when the ring is large and below it when small). At 390 pixels the page still does not scroll sideways; the slider still responds to the arrow keys; no console errors.
