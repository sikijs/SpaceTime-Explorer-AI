# Gravity and Curved Spacetime — Experiment 4: Curved Spacetime — Why Parallel Paths Don't Stay Parallel

**Status: built, complete-flow tested, and reviewed against this specification (`CLAUDE.md` §21 Steps 9–10, 2026-09-26).** Physics model, tests, interface, prediction, results panel, and AI tutor are built and wired into the guided journey (`src/physics/curvedSpacetimeExperiment.ts`, `src/physics/curvedSpacetimeExperiment.test.ts`, `src/components/CurvedSpacetimeExperiment.tsx`, `src/components/CurvedSpacetimeTutor.tsx`, `src/App.tsx`). The tutor follows the predict → observe → explain pattern used throughout the app. See "Implementation Notes" below for what the review found and fixed. The owner's line-by-line wording approval (`CLAUDE.md` §28.1) is complete (2026-09-26); two lines were revised during that review (see "Implementation Notes").

This specification was drafted per `CLAUDE.md` §23 Stage 3, following the proposal Claude Code made in conversation on 2026-09-26, in response to the milestone set after Experiment 3 (tidal effects) was completed. Experiment 3's own "Relationship to Later Experiments" section named this direction: an experiment that names and explains curved spacetime itself, building on its tidal-convergence result. All eight items in "Decisions Needing Human Review" below were confirmed by the owner (2026-09-26).

## Implementation Notes

The final review against this specification (§21 Step 10) found and fixed one gap:

1. **The curved scene did not visually show curvature.** This specification's Physical Situation section requires the curved scene be "viewed from an angle that shows its curvature (or an equivalent clear 3D-on-2D rendering)," but the original implementation rendered both the flat and curved scenes as identical plain boxes, distinguished only by the numeric separation readout — nothing in the visual itself showed a sphere or curvature. Fixed: `Scene` in `CurvedSpacetimeExperiment.tsx` now draws each traveler's full guide path as an SVG curve (straight and parallel for the flat surface; bending together toward a single labeled point, "the pole," for the curved surface), with the curved scene additionally framed inside an ellipse suggestive of a globe viewed at an angle. Verified in the browser: the flat surface's two dashed guide lines stay parallel and its dots stay level, while the curved surface's guide lines visibly curve inward and its dots converge and meet exactly at "the pole" by the end of the run.

No other gaps were found. The separation-vs-distance graph (added during the tutor step, since the tutor's observation question refers to it) was cross-checked against the Experiment Behavior section's requirement for "a live-updating graph plots separation vs. distance traveled" and matches.

The owner's line-by-line wording approval (§28.1) is complete (2026-09-26). Two lines were revised during that review, both in `CurvedSpacetimeExperiment.tsx`:

1. **"What happens"** was rewritten for clarity, from "Two travelers start a fixed small distance apart and both walk dead straight ahead — never turning — at the same speed. We try this on a flat surface, and on a curved surface (a sphere, like the Earth)." to "Picture two travelers standing side by side, a fixed small distance apart, both facing the same direction. Each one walks straight ahead — never turning, always at the same walking speed — and we watch how far apart they end up. We run this twice: once on a flat surface, and once on a curved surface (a sphere, like the Earth)."
2. **"Your job"** was reworded to lead with "distance apart," from "Watch both surfaces and compare whether the two travelers' distance apart changes on each one." to "Watch both surfaces and compare whether the distance apart between the two travelers changes on each one."

All other learner-facing text (the remaining introduction bullets, prediction prompts, results panel, and all four tutor steps including the five-point explanation and the analogy note) was approved as drafted, with no changes.

## Overview

Experiment 3 showed that two balls dropped side by side in a real planet's gravity drift together (a **tidal effect**), while two balls in an accelerating rocket cabin never do — because a rocket's push has no center to pull toward, but a planet's gravity does. That experiment stopped short of naming why: it held back the words "curvature" and "curved spacetime" deliberately.

This experiment picks that up. It uses a different, purely geometric situation — not gravity, not a falling ball — to give the learner direct, hands-on experience of the same underlying pattern: two paths that start out exactly parallel, moving as "straight" as each can, either stay parallel forever, or drift together, depending only on the shape of the surface they move on.

The situation: two travelers start at two nearby points on a surface, a fixed small distance apart, and both walk "straight ahead" (as straight as they can — never turning) at the same constant speed. On a **flat surface** (a plane), they stay exactly the same distance apart forever. On a **curved surface** (a sphere, like the Earth), walking "straight ahead" means following a great circle, and two great circles that start parallel are not actually parallel — they converge, and if extended far enough, cross.

The experiment then draws the connection explicitly: Experiment 3's converging balls are doing the same kind of thing as the two travelers on the sphere. Their paths are each "as straight as possible" given the physics involved (free-fall, in Experiment 3's case), and they still converge — not because anything is pulling them sideways, but because the space (in that case, spacetime) they are moving through is curved. This is what physicists mean by **curved spacetime**: gravity's tidal pulling-together is not evidence of an extra sideways force, but evidence that spacetime itself is shaped like the sphere in this experiment, not the flat plane.

This experiment uses ordinary, well-established spherical geometry as an explicit **analogy** for spacetime curvature, not a claim about the literal shape of spacetime. Actual spacetime curvature is four-dimensional and its precise geometry (general relativity's field equations) is out of scope; the specification says so plainly to the learner and the tutor, per `CLAUDE.md` §8 (do not invent physics) and the project's practice of flagging simplified/abstracted models explicitly.

---

## Learning Objective

After this experiment, the learner should understand:

1. Two paths that start out exactly parallel, and each stay "as straight as possible," can still converge or diverge — but only if the surface (or spacetime) they move through is curved. On a flat surface this never happens.
2. Experiment 3's tidal effect (two falling balls drifting together) is an example of exactly this: the balls' paths are each "as straight as possible" under gravity, and they converge — which is only possible because spacetime itself is curved near a planet, not flat.
3. This is what "curved spacetime" means: not a mysterious extra force, but a geometric fact about the space (or spacetime) two free-falling paths move through.
4. A uniformly accelerating rocket cabin (flat spacetime) can never reproduce this convergence, no matter how it accelerates — matching Experiment 3's finding, now explained geometrically rather than merely observed.
5. This experiment uses an ordinary curved surface (a sphere) purely as an analogy for spacetime curvature — real spacetime curvature is four-dimensional and more complex, and this experiment does not attempt to model it exactly.

---

## Physical Situation

Two scenes, shown one at a time or side by side (interface decision, see below):

- **Flat scene:** an infinite flat plane, viewed from above. Two travelers start at two points a fixed small distance apart, both facing the same direction, and both move forward at the same constant speed, never turning.
- **Curved scene:** the surface of a sphere, viewed from an angle that shows its curvature (or an equivalent clear 3D-on-2D rendering). Two travelers start at two nearby points on a reference circle (analogous to the equator), both facing "north" (perpendicular to the reference circle), and both move forward along a great circle at the same constant speed, never turning.

Both travelers, in both scenes, are moving "as straight as possible" given the surface they are on — this is the plain-language definition of a **geodesic**, introduced here for the first time.

---

## Physics Model

This is spatial (2D-surface) geometry, not spacetime physics — a deliberate simplification, stated explicitly to the learner (see Learning Objective #5).

- **Flat plane:** two parallel lines. Separation between the two travelers is constant for all traveled distance `d`, equal to the fixed `initialSeparation`.
- **Sphere:** two great circles beginning parallel at the reference circle, separated by a small initial angular separation `θ₀ = initialSeparation / R`, where `R` is the sphere's radius (the learner-facing **curvature strength** control, inversely — a smaller `R` means a more sharply curved sphere and faster convergence). Using standard spherical geometry, the angular separation between the two travelers after each has traveled arc-distance `d` (measured from the reference circle) is:

  `θ(d) = θ₀ · cos(d / R)`

  (This is the standard result for the separation of two geodesics that start parallel on a sphere of radius `R`, an application of the Jacobi equation / geodesic deviation for constant positive curvature `1/R²` — well-established differential geometry, not a new derivation.)

  Linear separation is `R · θ(d)`, which starts at `initialSeparation`, shrinks to zero when `d = πR/2` (the travelers meet at the "pole"), and would formally go negative (paths crossing) beyond that — the experiment should stop the run at or before that point.

- **Shared control:** `curvatureStrength`, an abstracted dimensionless learner control (like Experiment 2's `strength` and Experiment 3's `convergenceStrength`) standing in for `1/R` (a smaller sphere / larger `curvatureStrength` converges faster). Exact mapping to be finalized during implementation, following the precedent of the other abstracted controls.

---

## Initial Conditions

- `initialSeparation`: a fixed small value (not a learner control), consistent with Experiment 3's fixed 1-meter separation, for direct visual comparability.
- Both travelers start facing the same direction, at the same constant traveling speed.
- `curvatureStrength`: a learner control (see below); flat scene has no curvature and needs no control.

---

## Learner Controls

- A toggle or selector: **flat surface** / **curved surface**.
- On the curved surface only: a **curvature strength** slider or preset choices (mirroring Experiment 2/3's abstracted-control pattern).
- A **run** control, enabled only after both predictions (see below) are entered.

---

## Prediction Activity

Before running, for both scenes:

1. "Two travelers start the same fixed distance apart, both walking dead straight ahead, on a **flat surface**. After they've walked a long way, are they closer together, farther apart, or the same distance apart as when they started?"
2. "Now the same two travelers walk dead straight ahead, the same fixed starting distance apart, but on a **curved surface** (a sphere). After they've walked a long way, are they closer together, farther apart, or the same distance apart as when they started?"

The learner is not told the sphere answer will differ from the flat answer before predicting.

---

## Experiment Behavior

The learner selects a scene and (for the curved scene) a curvature strength, then runs it. The two travelers' paths animate progressively (their separation is what's measured — a top-down/exterior view rather than each traveler's own point of view, consistent with Experiment 3's external framing). A live-updating graph plots separation vs. distance traveled, matching Experiment 3's separation-graph pattern. Playback speed must not change the physical result (`CLAUDE.md` §11), consistent with every other experiment.

The learner should be able to run both scenes (flat and curved) and compare, similar to how Experiment 3 shows both cabins.

---

## Expected Observations

- Flat scene: the graph is a flat horizontal line at `initialSeparation` — never changes.
- Curved scene: the graph decreases monotonically from `initialSeparation`, faster for higher curvature strength, and would reach zero if the run continued far enough (the run should stop at or before that point, per the Physics Model section).

---

## Expected Learner Understanding

The learner should be able to state, in their own words:

- Parallel, dead-straight paths only ever stay parallel on a flat surface.
- On a curved surface, dead-straight (geodesic) paths that start parallel can still converge — not because anything pushes them sideways, but because the surface itself is curved.
- Experiment 3's converging balls are the same phenomenon: their free-fall paths are "as straight as possible" given gravity, and they converge because spacetime near a planet is curved, not flat — this is what "curved spacetime" means.
- A rocket's uniform acceleration cannot reproduce this because flat spacetime cannot produce path convergence, no matter how it accelerates.

---

## New Concepts Being Introduced

- **Curved spacetime** — named explicitly for the first time in this phase (Experiments 1–3 avoided the word by design).
- **Geodesic** — a path that is "as straight as possible" given the surface (or spacetime) it moves through; introduced here as plain language, without requiring the learner to understand curvature mathematically.

---

## Relationship to Previous Experiments

- Directly answers the question Experiment 3's specification raised in its own "Relationship to Later Experiments" section.
- Reuses Experiment 3's tidal-convergence result by direct reference (no recomputation) — the tutor should point back at Experiment 3's actual observed graphs rather than re-deriving the claim.
- Reuses the abstracted-control pattern (`strength`, `convergenceStrength`, now `curvatureStrength`) established in Experiments 2 and 3, for the same stated reason: real curvature effects are unobservably subtle at everyday scales, or in this case, the connection between 2D-surface geometry and 4D-spacetime geometry is illustrative rather than literal.
- Does not reuse Experiment 1's rocket/cabin visual scene — this experiment's situation (travelers on a surface) is deliberately a different, more abstract register, since the point being taught is about geometry itself, not about a specific physical setup.

## Relationship to Later Experiments

None approved. This experiment's analogy (curved surfaces, geodesics) could motivate a later experiment that returns to an explicit relativistic setting — for example, showing how a massive body's presence is what makes nearby spacetime curved (linking back to Experiment 2's gravitational time dilation and Experiment 3's tidal effect as two more consequences of the same curvature) — but that is not proposed or approved here.

---

## Required Physics Tests

1. Flat-plane separation is exactly `initialSeparation` for every traveled distance `d`.
2. Sphere separation strictly decreases as `d` increases, for every `curvatureStrength > 0`, up to the point the paths meet.
3. Sphere separation, for a fixed `d`, strictly decreases as `curvatureStrength` increases (a smaller effective radius converges faster).
4. Sphere separation matches the closed-form `R · θ₀ · cos(d/R)` (or the implementation's exact mapping from `curvatureStrength` to `R`) to floating-point precision.
5. `curvatureStrength <= 0` is rejected or defined as an explicit edge case (matching Experiment 3's precedent for its own abstracted control).
6. The run stops at or before the travelers meet (`d = πR/2`), not after — behavior beyond that point is undefined and must not be computed or displayed.
7. Deterministic across repeated calls; independent of any UI or animation state.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of every prior experiment:

- **Before the run:** helps the learner form both predictions (flat and curved); does not reveal the answer.
- **During the run:** silent.
- **After the run:**
  1. Observation: "Look at both graphs. On which surface did the distance between the travelers change?"
  2. Prediction comparison: the learner's predicted outcomes beside the actual ones, for both surfaces.
  3. Conceptual question: "Neither traveler ever turned — both walked as straight as they possibly could. What does it mean that they still ended up closer together?"
  4. Explanation:
     - On a flat surface, dead-straight paths that start parallel always stay parallel — this matches everyday intuition.
     - On a curved surface, dead-straight (geodesic) paths that start parallel can still converge, purely because the surface itself is curved — nothing pushed them sideways.
     - Recall Experiment 3: two falling balls, each moving as straight as gravity allows, also converged — for the same reason: the spacetime they move through is curved, not flat.
     - This is what physicists mean by **curved spacetime**: gravity's pulling-together isn't a sideways force bending the balls' paths — it's evidence that the space (spacetime) itself is shaped like the sphere in this experiment, not the flat plane.
     - A rocket's uniform acceleration, however hard it pushes, moves through flat spacetime, and flat spacetime can never make dead-straight paths converge — which is exactly why Experiment 3's rocket balls never drifted together.
  - The tutor should explicitly flag that the sphere is an analogy, not a literal claim about spacetime's shape — real spacetime curvature is four-dimensional and this experiment does not attempt to model it exactly.

---

## Decisions Needing Human Review

1. **Direction** — using ordinary spherical geometry (geodesic convergence) as the analogy for spacetime curvature, rather than some other approach. **Confirmed by the owner (2026-09-26).**
2. **Title** — "Curved Spacetime: Why Parallel Paths Don't Stay Parallel" (working title). **Confirmed as-is by the owner (2026-09-26).**
3. **Visual situation** — "two travelers on a surface" (abstract, geometric) rather than reusing the rocket-cabin visual language of Experiments 1–3. **Confirmed by the owner (2026-09-26).**
4. **Physics model** — the closed-form `R · θ₀ · cos(d/R)` sphere-geodesic-separation formula, with a single abstracted `curvatureStrength` control standing in for `1/R`. **Confirmed by the owner (2026-09-26)** — the exact closed form, not a first-order approximation.
5. **Run stopping point** — stopping the animation at or before the travelers meet (`d = πR/2`), rather than continuing further (which would require defining crossed-path behavior, out of scope). **Confirmed by the owner (2026-09-26).**
6. **Sequencing** — proposed as Experiment 4 of "Gravity and Curved Spacetime," immediately following Experiment 3 (tidal effects). **Confirmed by the owner (2026-09-26).**
7. **Scope of "spacetime" vs. "space"** — this experiment's analogy uses ordinary 2D spatial curvature (a sphere), while real spacetime curvature involves time as well as space. **Confirmed by the owner (2026-09-26)** — the one explicit caveat in the tutor explanation is sufficient.
8. **New terms** — introducing "geodesic" as a named term (defined in plain language) versus only using descriptive phrasing ("as straight as possible") without ever naming it. **Confirmed by the owner (2026-09-26)** — introduce "geodesic" as a named term.

---

## Success Criteria

1. The physics model uses real, verifiable spherical geometry for the curved scene and simple constant-separation geometry for the flat scene — no invented physics.
2. The learner predicts before running, for both scenes.
3. The results make visible, numerically and visually, that separation is constant on the flat surface and shrinks on the curved surface.
4. The learner can state, in their own words, that curved spacetime means free-falling ("as straight as possible") paths that start parallel can converge, and that this is why Experiment 3's balls drifted together.
5. The tutor explicitly names the sphere as an analogy, not a literal model of spacetime's shape.
6. No general-relativistic field equations, tensors, or exact 4D curvature mathematics — this experiment only builds geometric intuition for what "curved" means.
