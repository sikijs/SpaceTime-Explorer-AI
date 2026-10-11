# Black Holes and Strong Gravity — Experiment 4: Light Near a Black Hole — Can Light Be Trapped?

**Status: APPROVED by the owner on 2026-10-11, with all thirteen "Decisions Needing Human Review" items taken as Claude's recommended defaults. Proposed by Claude per `CLAUDE.md` §23 Stages 1–2 and drafted as a specification per Stage 3 on 2026-10-11, as the fourth of the five experiments planned for this group (see the group list in Experiment 1's specification). To be built one step at a time (§6); nothing is implemented yet. Learner-facing wording (introduction, prediction questions, captions, Results, tutor) is still subject to the owner's line-by-line review when it is drafted (§28.1).**

---

## Overview

Gravity and Curved Spacetime Experiment 8 showed that gravity bends light that passes near a mass, and gave a simple formula for how much, for the weak gravity of a star: the real universe bends light by `2 r_s ÷ b`, where `r_s` is the horizon radius and `b` is how far from the center the light was aimed to pass (its **aim distance**). That formula is small and gentle: far from the mass, a small bend.

Experiment 3 of this group asked what strong gravity does to **orbits**, and found a last safe circular orbit at 3 horizon radii. Its specification named this experiment as the place where **light itself** meets the same strong gravity.

This experiment asks: **how much does a black hole bend light that passes close by, and can light that is aimed to miss the black hole still be trapped?**

The new idea is one thing: **in the exact theory of gravity, light aimed close to a black hole is bent far more than the simple formula says, and there is a critical aim distance, `3√3 ÷ 2` ≈ 2.6 horizon radii. Light aimed closer than that is captured, even though it was aimed to miss the horizon. Light aimed just outside it swings around the black hole, once or more, before escaping. This is because light itself can circle at exactly 1.5 horizon radii, on an orbit that is balanced like Experiment 3's marble on top of a bowl.**

The learner picks a black hole and an aim distance, and watches a beam of light come in from far away along a straight line aimed to miss the black hole, and bend. A faint straight reference line shows where the light would have gone with no gravity. A second picture, a graph of the total bend against the aim distance, shows the exact answer and the simple formula from Experiment 8 agreeing far away and parting company close in.

The experiment is a **thought experiment** about a thin beam of light in a flat plane around a non-rotating black hole. It does not model what the light does after it is captured, what a camera would see, or what is inside the horizon.

---

## Learning Objective

After this experiment, the learner should understand:

1. Light passing a black hole is bent, by an amount that grows as it is aimed closer, as in Gravity Experiment 8.
2. The simple formula from Gravity Experiment 8 (bend = `2 r_s ÷ b`) works well far from the black hole and fails close in, where the real bend is much larger. At an aim distance of 3 horizon radii the real bend is about 98.5 degrees, against about 38.2 degrees from the simple formula.
3. There is a **critical aim distance** of about 2.6 horizon radii (`3√3 ÷ 2`, exactly 2.598). Light aimed closer than this is captured, even though its aim was outside the horizon. The black hole therefore catches light over a wider circle than its own edge.
4. Light aimed just outside the critical distance swings around the black hole, by more than a full turn if it is aimed close enough, before leaving. The closer to the critical distance, the more it winds.
5. Light itself can circle a black hole at exactly 1.5 horizon radii (the **photon sphere**), on an orbit that does not last, for the same reason as the unsafe orbits of Experiment 3: the slightest push either way sends the light inward or outward. This is the 1.5 horizon radii limit named in Experiment 3.
6. The critical aim distance is the same number of horizon radii for every black hole, as in Experiments 2 and 3: about 77 km for the 10-Sun black hole, about 33 million km for Sagittarius A* and about 50 billion km for M87*.
7. What the experiment does not say: what a camera would see, what happens after capture, what a spinning black hole does, and anything inside the horizon.

---

## Physical Situation

A black hole of known mass and a thin beam of light, so faint that its own gravity can be ignored. The light moves in a flat plane, seen from above. It comes in from very far away along a straight line that, if gravity did nothing, would pass the black hole's center at a distance `b` (the aim distance). The light is followed until it has either left again (far from the black hole) or reached the horizon.

Light always travels at the speed of light. Unlike Experiment 3's probes, there is no launch speed to choose: the only controls are the black hole and the aim distance. The light's path is computed in the exact theory of gravity (given below); the picture also draws, as a faint dashed line, the straight path the light would take with no gravity.

### The equation (given, not derived)

For light passing a black hole that does not spin and has no electric charge, using `u = 1 ÷ r` (r in horizon radii) and the angle `φ` swept around the black hole:

```
d²u/dφ² = −u + 1.5 u²
```

with the light starting at `u = 0` (very far away) with `du/dφ = 1 ÷ b`. This is the standard general-relativity equation for a light ray around a non-rotating black hole, in the same form as Experiment 3's equation for a probe (without the nudge or a launch speed). It is **given, not derived**, as in Experiment 3. The total bend is `φ` swept between leaving and arriving at `u = 0`, minus half a turn (180 degrees).

### Facts the model reproduces (computed, not looked up; the tests check them)

- **The circular light orbit** is at `u = 2/3`, that is, `r = 1.5` horizon radii (`3GM/c²`). It is unstable.
- **The critical aim distance** is `b_crit = 3√3 ÷ 2` ≈ 2.598 horizon radii.
- **The weak-field formula** from Gravity Experiment 8, written in horizon radii, is `bend = 2 ÷ b` (in radians). It is the first term of the exact result for large `b`.

### Illustrative results (computed in a feasibility check on 2026-10-11; the tests will check them)

| Aim distance (horizon radii) | Result | Total bend (exact) | Simple formula `2 ÷ b` | Closest approach (horizon radii) |
|---|---|---|---|---|
| 100 | escapes | 1.16° | 1.15° | 99.5 |
| 20 | escapes | 6.19° | 5.73° | 19.5 |
| 10 | escapes | 13.5° | 11.5° | 9.46 |
| 5 | escapes | 33.8° | 22.9° | 4.39 |
| 3.5 | escapes | 64.6° | 32.7° | 2.81 |
| 3 | escapes | 98.5° | 38.2° | 2.23 |
| 2.7 | escapes | 167° | 42.4° | 1.80 |
| 2.62 | escapes | 252° | 43.7° | 1.62 |
| 2.6 | escapes, after more than one full turn | 390° | 44.1° | 1.53 |
| 2.598 and below | **captured** | | | |

At 20 horizon radii (the most distant aim the controls allow) the simple formula is still about 8% low; it is within about 1.4% only at 100 horizon radii, beyond the controls. The Results say so.

### The black holes

Reused unchanged from Experiment 1: the stellar black hole (10 Suns, horizon radius about 29.5 km), Sagittarius A* (about 4.3 million Suns, horizon radius about 12.7 million km) and M87* (about 6.5 billion Suns, horizon radius about 19 billion km). The critical aim distance is about 76.7 km, about 33 million km (about 0.22 AU) and about 50 billion km (about 330 AU) from their centers.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **A thought experiment about a thin beam of light.** The light's own gravity does not matter. How the light got there is not described.
- **The exact equation is for a non-rotating, uncharged black hole,** given and not derived. Real black holes usually spin, which changes where light is captured.
- **The light moves in a flat plane,** seen from above, and nothing else (no gas, no dust, no other star) is in the way.
- **"Captured" means the light reaches the horizon.** Nothing past that is modeled.
- **The aim distance is measured as in Experiment 1** (circumference divided by 2π), and is the distance the light would pass at if gravity did nothing, as in Gravity Experiment 8.
- **The simple formula is shown only as a comparison** from the earlier experiment: it is for weak gravity, and it is not an approximation made by this experiment's model.

### Not introduced

Black hole images and the "shadow" as an observed picture (what a telescope or camera would show), Einstein rings and multiple images (Cosmology Experiment 7 covers lensing by a mass, not near a horizon), the full list of light orbits for many aim distances at once, spinning (Kerr) black holes, gravitational redshift of the light, light's color or polarization, and anything inside the horizon. All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16). The tutor may name a few of these in one sentence each as things the model does not cover.

---

## Physics Model

One new, self-contained module, in the style of Experiment 3's. It **reuses** earlier code unchanged (imported, not redefined): `horizonRadiusKm` and `OBJECT_PRESETS` from Experiment 1 of this group (`blackHoleSizeExperiment.ts`), for the kilometer distances. It does **not** import Gravity Experiment 8's module (which works in made-up dimensionless units), Gravity Experiment 7's made-up units, or Experiment 3's module, and a regression test checks this. It restates the equation of motion in one line, in the same units as Experiment 3.

The path is computed by stepping the equation for `u(φ)` above in small, equal steps of the angle (720 steps per turn) with a fourth-order Runge-Kutta method, so the same calculation produces a small bend, a swing around and a capture.

```typescript
// src/physics/lightNearBlackHoleExperiment.ts

export const STEPS_PER_TURN = 720
export const MIN_AIM_IN_HORIZON_RADII = 1        // aimed at the horizon's edge
export const MAX_AIM_IN_HORIZON_RADII = 20
export const PHOTON_SPHERE_IN_HORIZON_RADII = 1.5            // 3GM/c^2, given
export const CRITICAL_AIM_IN_HORIZON_RADII = (3 * Math.sqrt(3)) / 2   // given

export const BLACK_HOLE_PRESETS: ObjectPreset[]  // the three black holes of Experiment 1

export interface LightPoint { phi: number; distanceInHorizonRadii: number; x: number; y: number }   // x, y in horizon radii

export type LightOutcome = 'escapes' | 'captured'

export interface LightPath {
  outcome: LightOutcome
  bendRadians: number | null            // total bend if it escapes; null if captured
  turnsAround: number                   // turns swept around the black hole (more than 0.5 if it swings)
  closestInHorizonRadii: number         // closest approach, or 1 if captured
  points: LightPoint[]                  // starts far away; the picture draws the part within its view
}

// The simple formula of Gravity Experiment 8 in horizon radii: 2 / aim, in radians.
export function weakFieldBendRadians(aimInHorizonRadii: number): number

export interface LightNearBlackHoleResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  aimInHorizonRadii: number
  aimKm: number
  criticalAimKm: number
  photonSphereKm: number
  path: LightPath
  weakFieldBendRadians: number
}

export function runLightNearBlackHoleExperiment(
  presetId: ObjectPreset['id'],
  aimInHorizonRadii: number
): LightNearBlackHoleResult

// For the graph and the Results: the exact bend at many aim distances, from the same calculation.
export function bendCurve(): Array<{ aim: number; bendRadians: number }>
```

Structured independently of the UI (`CLAUDE.md` §9): pure functions, testable with no browser. The playback speed (a fixed real duration, independent of the result) does not change any result (`CLAUDE.md` §11).

---

## Learner Controls

- **The black hole:** a stellar black hole (10 Suns), Sagittarius A*, or M87*.
- **The aim distance,** in horizon radii: a logarithmic slider from 20 down to 1, with presets **20 ("far")**, **10**, **5**, **3.5**, **3**, **2.7**, **2.6**, **2.5** and **1.5**. The distance in kilometers (and AU where that is more natural) is shown beside it.
- **Run,** which plays the light's path over a fixed real duration independent of the physics (`CLAUDE.md` §11).

---

## Prediction Activity

Before the controls and results are shown, the learner answers three questions in sequence (not scored):

1. "A beam of light is aimed to pass a black hole at 5 horizon radii from its center, well outside the edge. What happens to its path?" (It goes straight on, barely changed / It is bent noticeably and then escapes / It is captured.) The model's answer is the second.
2. "How close to a black hole's center must light be aimed to be captured?" (Only if aimed at the horizon itself, 1 horizon radius / About 2.6 horizon radii / About 10 horizon radii.) The model's answer is the second.
3. "Light is aimed only a tiny bit farther out than the capture distance. What happens?" (It passes with only a small bend / It swings around the black hole, more than half a turn, and then escapes / It is captured anyway.) The model's answer is the second.

The controls are disabled until all three predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the choices. The pictures, caption, Results and tutor appear only after predictions are locked in (`CLAUDE.md` §12). The choices need the owner's wording review (see Decision 8).

---

## Experiment Behavior

### Display

Two pictures, one above the other (side by side on a wide screen is not needed):

- **Picture 1, "The path of the light" (top-down).** The black hole as a dark disk with its horizon ring (rose), labeled "horizon"; a dashed ring at 1.5 horizon radii labeled "light can circle here" (the photon sphere, in a second color); a dashed ring at the critical aim distance labeled "critical aim" (a third color); the light's incoming straight line (a faint white dashed line, labeled "path with no gravity"), and the light's actual path as a bright trail with a moving dot, labeled "light". A small "aim" marker shows the aim distance `b` between the incoming line and the center. A captured beam ends at the horizon with the label "captured". The picture is zoomed to the aim distance (view reaching 1.25 times the larger of the aim distance and the critical aim distance, at least 4 horizon radii), with a labeled scale bar, as in Experiment 3. Live: the angle swept so far, and the closest approach so far.
- **Picture 2, "The total bend against the aim distance" (a graph).** Horizontal: aim distance in horizon radii (log scale, 1 to 20). Vertical: total bend in degrees (0 to 400). A blue curve for the exact answer (rising steeply as the aim approaches 2.6, ending there) and a gold curve for the simple formula `2 ÷ b` from Gravity Experiment 8. A dot marks the aim chosen; a vertical dashed line marks the critical aim, labeled. Both curves are visible together so the learner can see them agree on the right and part company on the left (`CLAUDE.md` §14.2).
- Each picture has its own **"How to read this picture" caption** directly under it, shown after predictions are locked in, in the step-by-step style of the earlier experiments. The caption must say what each drawn thing is, what the dashed straight line is (where the light would go with no gravity), what the total bend is and how it is measured (the angle between the light's original direction and its final direction), what the two rings mean, what the two curves are, and that the experiment follows a thin beam of light in a flat plane, not a camera view.
- **Live readout:** the black hole, the aim distance (horizon radii and kilometers), the critical aim distance in kilometers, and the light's outcome so far.

### Results

States the black hole and aim distance, whether the light escaped or was captured, the total bend in degrees (and the number of turns the light swung around, if it swung), the closest approach, the simple formula's value beside it and how far off it is as a percentage, the critical aim distance in horizon radii and kilometers for the chosen black hole; compares all three predictions with the model; includes simple math per `CLAUDE.md` §15, for example the critical aim distance worked as `3√3 ÷ 2 = 5.196 ÷ 2 = 2.598 horizon radii`, and `2.598 × 29.5 km` for 76.7 km for the 10-Sun black hole, and the simple formula's value worked at the chosen aim (`2 ÷ b`, in radians, converted to degrees); includes a daily-life comparison; and states the model's limits in a prominent bordered box (`CLAUDE.md` §28.1 pattern).

The daily-life comparison (to be confirmed, kept out of the introduction so it does not reveal the answers): a ball rolling across a hillside toward a deep funnel. A ball that passes the funnel far away is only slightly deflected; a ball that passes close swings right around the funnel's rim before rolling off; a ball that passes closer than a certain distance drops in even though it was not rolled straight at the hole. It is an analogy for "the capture circle is wider than the hole itself", not for how gravity works.

### Introductory text

To be drafted during implementation, covering the question (how much does a black hole bend light, and can light be trapped even if aimed to miss?), what happens (step by step, as in Experiment 3), the learner's job, what to look for, new terms defined in plain language before use (**aim distance**, **bend**, **captured**, with **horizon** and **horizon radius** recalled from Experiment 1, the **astronomical unit**, and the **exact theory of gravity**), what it builds on (Gravity Experiment 8's bending, Experiment 1's horizon radius, Experiment 2's strong-gravity effects and Experiment 3's orbits), a "Why even ask this" paragraph, and the assumptions above. The introduction says plainly that the equation is given and not derived, and that it is for a non-rotating black hole. Any statement that gives away the prediction answers (the critical aim of 2.6, the swinging around, that the bend near the black hole is much larger than the simple formula says) is kept out of the introduction (`CLAUDE.md` §12). Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **After "Run" completes:**
  1. Observation: "Look at the path. How does the light's real path differ from the faint straight line? Now try other aim distances, including one very close in and one far out. Where does the light stop escaping?"
  2. Prediction comparison: the learner's three predicted answers beside what the model gave.
  3. Conceptual question: "Light has no mass, yet gravity bends it, and a black hole can even trap it. If you aim light so that it just misses the horizon, why do you think it can still be caught?" — intended to let the learner reach "the light is bent inward on its way, so it ends up closer than its aim".
  4. Explanation: (1) the bend grows as the aim gets closer, as in Gravity Experiment 8; (2) the simple formula `2 ÷ b` is for weak gravity: it agrees far away (an aim of 20 gives 6.2 degrees exact against 5.7 simple) and fails close in (an aim of 3 gives 98.5 degrees against 38.2); (3) the critical aim distance, `3√3 ÷ 2` ≈ 2.6 horizon radii: closer than that, the light is captured, even though it was aimed to miss the horizon, with the kilometers for the three black holes; (4) why: the black hole bends the light inward as it comes in, so its closest approach is smaller than its aim (an aim of 3 comes in to 2.23); (5) just outside the critical aim the light swings around the black hole, at an aim of 2.6 by 390 degrees, more than a full turn, because it comes in close to 1.5 horizon radii, where light can circle; (6) light can circle at exactly 1.5 horizon radii, like Experiment 3's marble on top of an upside-down bowl: any push inward sends it in and any push outward sends it out, and this is the 1.5 limit named in Experiment 3; (7) the critical aim, like Experiments 2 and 3, is the same number of horizon radii for every black hole; (8) what real astronomers do with this, in one plain sentence clearly marked as outside what the experiment shows (see Decision 9); (9) honest limits: a thought experiment about a thin beam, non-rotating and uncharged, the equation given and not derived, a spinning black hole captures light in a different circle, and nothing inside the horizon is modeled.

---

## Required Physics Tests

1. `weakFieldBendRadians(b)` equals `2 ÷ b` at several `b` and throws a `RangeError` for `b` at or below 0.
2. `CRITICAL_AIM_IN_HORIZON_RADII` equals `3√3 ÷ 2` (2.598…), and `PHOTON_SPHERE_IN_HORIZON_RADII` equals 1.5.
3. The **circular light orbit is found independently:** at `u = 2/3` the right-hand side of the equation, `−u + 1.5u²`, is zero (checked in the test file by the standard effective-potential condition, written separately), and it is a maximum of the light's effective potential (unstable).
4. The **critical aim distance is found independently of the module's classification:** the light's effective potential `u²(1 − u)` has its maximum, 4/27, at `u = 2/3`, so `1 ÷ b_crit² = 4/27` and `b_crit = 3√3 ÷ 2` (written separately in the test file), and the integrated outcome is captured at 2.55, 2.58 and 2.59 and escapes at 2.61, 2.65 and 3.
5. **Far away the exact bend approaches the simple formula:** at an aim of 100 the ratio exact ÷ simple is within 2% (the module's own units, though the controls stop at 20), and the exact bend is **greater** than the simple formula at every aim tested from 100 down to 2.62.
6. **The bend grows as the aim shrinks** at every aim tested from 20 down to 2.62, and grows without bound approaching the critical aim: the bend at 2.6 is more than 360 degrees, and at 2.61 is smaller than at 2.6.
7. **Illustrative-table values** (aims of 20, 10, 5, 3, 2.7 and 2.6) match the table above to within 0.5 degrees.
8. **The closest approach is smaller than the aim** at every aim that escapes (the light is bent inward as it comes in), and approaches 1.5 horizon radii (from above) as the aim approaches the critical distance (about 1.53 at 2.6).
9. **Conservation check:** the integrated path satisfies `(du/dφ)² + u²(1 − u) = 1 ÷ b²` (the equation's first integral, written separately in the test file) at every step to within a small tolerance.
10. **A captured path ends at the horizon** (distance 1 horizon radius), and an escaping path ends far away (`u` back at 0).
11. **Light has no mass:** the path depends only on the aim in horizon radii, not on the black hole chosen; the kilometer figures scale with the mass (the three presets give the same bend at the same aim, and critical aim distances in km of the right size).
12. **Reuse:** the module imports `horizonRadiusKm` and `OBJECT_PRESETS` from `blackHoleSizeExperiment` and does not import `lightBendingExperiment`, `orbitsNearBlackHoleExperiment`, `blackHoleExperiment` or `orbitExperiment` (a regression test, as in Experiment 3's).
13. **Determinism:** the same inputs give the same path.
14. **Validation:** an aim at or below 0, or not finite, throws a `RangeError`; the module does not clamp, and the slider's range (1 to 20) is the interface's responsibility.
15. **Playback speed does not change the result** (`CLAUDE.md` §11): the path is computed from the aim alone, with no wall-clock input.

---

## Decisions Needing Human Review

Each shows Claude's recommended default as used above.

1. **Title and the one new idea.** Default: "Light Near a Black Hole: Can Light Be Trapped?", with the critical aim distance (about 2.6 horizon radii) as the single idea, and the circular light orbit at 1.5 horizon radii as its explanation. Other ideas that belong near it are named but not taught: the black hole's shadow in a picture, Einstein rings, and spinning black holes. Alternative: a narrower idea, only "the bend is much bigger than the simple formula says" (without capture), or only the photon sphere.
2. **A simulation of the exact equation.** Default: numerical stepping of the equation for `u(φ)`, as in Experiment 3, so that a small bend, a swing around and a capture all come out of the same calculation. Alternative: only the closed-form critical distance and a static picture (simpler, less convincing).
3. **The same machinery as Experiment 3, restated in this module.** Default: yes, a new module with the one-line equation restated in the same units, and a regression test that neither module imports the other. Alternative: share the integration code (less repeated code, but ties two experiments' modules together, which `CLAUDE.md` §24 asks to avoid unless a real need appears).
4. **Aim distance range and presets.** Default: 20 down to 1 horizon radii, presets 20, 10, 5, 3.5, 3, 2.7, 2.6, 2.5 and 1.5. The range includes aims inside the critical distance (to show capture) and at the horizon's edge. Zoom to the larger of the aim and the critical aim, with a scale bar, as in Experiment 3. Alternative: limit to 20 down to 2 (fewer capture examples).
5. **The simple formula's role.** Default: only the gold curve for `2 ÷ b` (Gravity Experiment 8's real-universe weak-field formula) in the graph, and its value beside the exact bend in the Results. Gravity Experiment 8's other, "ordinary-gravity" formula, half as large (`1 ÷ b`), is not shown, to keep the contrast to one comparison. Alternative: show both curves, so the learner can see the "factor of two" of Experiment 8 and the strong-gravity growth together (more complete, more cluttered).
6. **Two pictures, not three.** Default: the path and the graph. Alternative: add a picture of many rays at once (a "fan" of aims), a good way to see the capture circle but it needs more drawing and more to explain; kept out of scope.
7. **The black hole control.** Default: keep the three black holes, though the bend depends only on the aim in horizon radii, as in Experiments 2 and 3. Alternative: a single black hole.
8. **The three predictions and their choices.** Default as above; the wording, especially Prediction 3 (the swing around), needs the owner's review.
9. **A real-world sentence** (the black hole images made by the Event Horizon Telescope, of M87* and Sagittarius A*, show a dark central region whose radius is generally described as the critical aim distance, about 2.6 horizon radii, so about 5.2 horizon radii across). Default: one sentence in the tutor, marked as outside what the experiment shows and **not checked against a primary source**. Alternative: leave it out, so as to add no claim the experiment does not demonstrate.
10. **The daily-life comparison** (a ball rolling past a funnel). Default: in the Results and the tutor, labeled as an analogy for "the capture circle is wider than the hole", not for how gravity works. Alternative: a different comparison, or none.
11. **The term "photon sphere".** Default: name it once, in the tutor, as the standard name for the sphere of light circles at 1.5 horizon radii, and use "where light can circle" in the pictures. Alternative: do not name it at all.
12. **Spin and other limits.** Default: named in the assumptions and the tutor's limits (a spinning black hole's capture distance is different, with no numbers).
13. **Not checked against a primary source:** the light equation, the circular-light-orbit radius (1.5 horizon radii), the critical aim (`3√3 ÷ 2`) and the weak-field first term (`2 ÷ b`) are standard general relativity and were stated from general knowledge. Claude checked them on 2026-10-11 only against each other (the integrated outcomes agree with the closed-form values; see "Implementation Notes"). The Event Horizon Telescope sentence in Decision 9 is general knowledge.

---

## Relationship to Previous Experiments

- **Gravity and Curved Spacetime Experiment 8 (light bending):** this experiment's weak-field curve is that experiment's real-universe formula restated in horizon radii; the idea of an aim distance is reused. This experiment adds what happens close in.
- **Black Holes and Strong Gravity Experiment 1:** the horizon radius and the three black holes.
- **Black Holes and Strong Gravity Experiment 2:** the strong-gravity effects near a horizon, and the fact that results depend only on the number of horizon radii.
- **Black Holes and Strong Gravity Experiment 3:** the exact equation's form, the 1.5 limit named there, and the marble comparison. The 1.5 horizon radii circle for light is where Experiment 3's circular orbits stop existing for anything slower than light.
- **Cosmology Experiment 7 (gravitational lensing):** a different regime (weak bending by a mass over cosmic distances); this experiment does not change it.

## Relationship to Later Experiments

- **Experiment 5, falling in** (planned, not approved): the capture shown here is where a falling traveler's story starts, from the traveler's side instead of the light's.

---

## Success Criteria

1. The learner makes all three predictions before the pictures, caption and Results are shown.
2. The path picture is zoomed to the aim and critical aim with a labeled scale bar, so choosing a different aim visibly changes the picture, and the bent path visibly differs from the straight dashed line near the black hole and looks almost the same far away.
3. Both pictures label every drawn component (the black hole, the horizon, the two rings, the straight reference line, the light, the aim marker, both curves, the critical aim line), visually distinguish the exact result from the simple formula, and carry their own "How to read this picture" caption (`CLAUDE.md` §14).
4. The light escapes for aims of 2.6 horizon radii or more and is captured below 2.598, as the model computes.
5. The Results correctly state the outcome, the bend, the simple formula's value and error, the critical aim in kilometers, compare all three predictions with the model, and include the worked calculation and the daily-life comparison.
6. The experiment states plainly that it is a thought experiment about a thin beam of light, that the exact equation is for a non-rotating, uncharged black hole and is given, not derived, and that nothing inside the horizon and no camera view is modeled.
7. The experiment connects back to Gravity Experiment 8, Experiments 1, 2 and 3 of this group, and does not recompute or modify any earlier experiment's physics.
8. Every specialized term is defined in plain language at first use (`CLAUDE.md` §15).

---

## Implementation Notes

Nothing has been built. A feasibility check was run in a scratch script outside the project on 2026-10-11 (not part of the application): stepping `d²u/dφ² = −u + 1.5u²` with a fourth-order Runge-Kutta method reproduced the table above, the critical aim at 2.598, and a closest approach of about 1.53 at an aim of 2.6. The weak-field first term (`2 ÷ b`) is approached from above as the aim grows (1.16° against 1.15° at 100).

- **Approval (2026-10-11):** the owner approved this specification, taking all thirteen "Decisions Needing Human Review" items as Claude's recommended defaults. Next step, when authorized: the physics model and its tests (§21 Steps 2 and 3).
