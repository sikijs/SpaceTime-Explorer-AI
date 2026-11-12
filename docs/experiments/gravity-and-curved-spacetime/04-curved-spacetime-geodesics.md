# Gravity and Curved Spacetime — Experiment 4: Curved Spacetime — Why Parallel Paths Don't Stay Parallel

**Status: built, complete-flow tested, and reviewed against this specification (`CLAUDE.md` §21 Steps 9–10, 2026-09-26).** Physics model, tests, interface, prediction, results panel, and AI tutor are built and wired into the guided journey (`src/physics/curvedSpacetimeExperiment.ts`, `src/physics/curvedSpacetimeExperiment.test.ts`, `src/components/CurvedSpacetimeExperiment.tsx`, `src/components/CurvedSpacetimeTutor.tsx`, `src/App.tsx`). The tutor follows the predict → observe → explain pattern used throughout the app. See "Implementation Notes" below for what the review found and fixed. The owner's line-by-line wording approval (`CLAUDE.md` §28.1) is complete (2026-09-26); two lines were revised during that review (see "Implementation Notes").
**Audit update, 2026-11-12 (built; see "Audit Update (2026-11-12)" at the end).** The page is rebuilt to the newer rules: four Parts, Part 1 fixed at curvature strength 0.5 with the strength control in Part 2, two white guess marks with arrows, Start over, a words box, links and a tutor that marks both guesses. Where the Audit Update and the older sections (Learner Controls, Prediction Activity, Experiment Behavior, Results Display, AI Tutor Behavior) differ, **the Audit Update wins**. The physics model is unchanged.


This specification was drafted per `CLAUDE.md` §23 Stage 3, following the proposal Claude Code made in conversation on 2026-09-26, in response to the milestone set after Experiment 3 (tidal effects) was completed. Experiment 3's own "Relationship to Later Experiments" section named this direction: an experiment that names and explains curved spacetime itself, building on its tidal-convergence result. All eight items in "Decisions Needing Human Review" below were confirmed by the owner (2026-09-26).

## Implementation Notes

The final review against this specification (§21 Step 10) found and fixed one gap:

1. **The curved scene did not visually show curvature.** This specification's Physical Situation section requires the curved scene be "viewed from an angle that shows its curvature (or an equivalent clear 3D-on-2D rendering)," but the original implementation rendered both the flat and curved scenes as identical plain boxes, distinguished only by the numeric separation readout — nothing in the visual itself showed a sphere or curvature. Fixed: `Scene` in `CurvedSpacetimeExperiment.tsx` now draws each traveler's full guide path as an SVG curve (straight and parallel for the flat surface; bending together toward a single labeled point, "the pole," for the curved surface), with the curved scene additionally framed inside an ellipse suggestive of a globe viewed at an angle. Verified in the browser: the flat surface's two dashed guide lines stay parallel and its dots stay level, while the curved surface's guide lines visibly curve inward and its dots converge and meet exactly at "the pole" by the end of the run.

No other gaps were found. The separation-vs-distance graph (added during the tutor step, since the tutor's observation question refers to it) was cross-checked against the Experiment Behavior section's requirement for "a live-updating graph plots separation vs. distance traveled" and matches.

The owner's line-by-line wording approval (§28.1) is complete (2026-09-26). Two lines were revised during that review, both in `CurvedSpacetimeExperiment.tsx`:

1. **"What happens"** was rewritten for clarity, from "Two travelers start a fixed small distance apart and both walk dead straight ahead — never turning — at the same speed. We try this on a flat surface, and on a curved surface (a sphere, like the Earth)." to "Picture two travelers standing side by side, a fixed small distance apart, both facing the same direction. Each one walks straight ahead — never turning, always at the same walking speed — and we watch how far apart they end up. We run this twice: once on a flat surface, and once on a curved surface (a sphere, like the Earth)."
2. **"Your job"** was reworded to lead with "distance apart," from "Watch both surfaces and compare whether the two travelers' distance apart changes on each one." to "Watch both surfaces and compare whether the distance apart between the two travelers changes on each one."

All other learner-facing text (the remaining introduction bullets, prediction prompts, results panel, and all four tutor steps including the five-point explanation and the analogy note) was approved as drafted, with no changes.

A later, project-wide request (2026-09-29): a "Why even ask this" paragraph was added to the introduction (`src/components/CurvedSpacetimeExperiment.tsx`), framing the experiment's geometric question — deliberately without describing how the two travelers actually behave on the sphere, to avoid spoiling the prediction. Approved by the owner as written (`CLAUDE.md` §28.1, 2026-09-29).

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

---

## Audit Update (2026-11-12)

Built to `docs/audit/gravity-and-curved-spacetime/04-draft-wording.md` ("all defaults" from the owner on 2026-11-12 to the eleven questions of `04-gap-report.md`, and "all approved" to the draft's eleven questions). The physics model and its approved numbers do not change. After the owner's review of the built page, three changes were made at the owner's request (see "After the owner's review").

**What changed.**
- **Layout.** Introduction, "Want to know more?", a collapsed "Words and formulas" box; then Part 1 "Predict, then watch" (amber), Part 2 "Now try it yourself" (pink), Part 3 "The results" (teal) and Part 4 "The tutor" (blue), each with a "What we are about to do" lead. Parts 2 to 4 appear after Part 1's run has finished.
- **Part 1** is fixed at curvature strength 0.5 (a sphere of radius 20 m, the pole 31.4 m away). The strength control (0.2, 0.5, 0.8, Other 0.01 to 0.99) moved to Part 2, which opens on 0.8. There is no flat/curved selector: both surfaces are always shown.
- **Surfaces.** Each is labelled ("left traveler", "right traveler", "start", "the pole", "sphere (outline)") and a note says they are simple sketches, not to scale. The sphere sketch is described as "drawn as they would look from outside" (the owner approved the draft wording; I could not confirm the intended view from the code). The sketch is the same size for every strength, so each sphere shows "The pole is X m from the start (radius R m)".
- **Graph.** A legend (curved surface: solid indigo; flat surface: dashed amber), axis titles ("Separation between the travelers (m)", "Distance each traveler has walked (m)"), end labels, and a vertical axis from 0 to 1.2 m with a dotted line at the 1 m start (a change of scale only).
- **The guess marks.** After both lines are drawn, a white ring at the end of each line, each joined to its own white "YOUR GUESS, flat surface (or curved surface) (a marker only): ..." box, with a short direction arrow (down for "closer together", a flat bar for "the same distance", up for "farther apart"). The ring is in the same place for any guess and the arrow has no length of its own; the caption says so.
- **Drawing A (Part 2).** The graph on a fixed 0 to 80 m distance scale (the pole is 78.5 m away at strength 0.2), growing in steps of 20 m for a smaller "Other" strength: the learner's curved line pink, the flat line light pink and dashed, Part 1's curved line thin grey; "Runs so far"; its own caption and "Where the real picture comes from" line. Before this change the strength control altered only two numbers and left both pictures identical (both axes were stretched to each run's own length).
- **Captions** for the Part 1 graph and Drawing A each have the formulas, a worked moment (0.878 m after 10 m and 0.707 m halfway at strength 0.5, with a globe-and-longitude picture; 0.980, 0.878 and 0.697 m after 10 m at strengths 0.2, 0.5 and 0.8), "what to look for" items in three parts (Look at, What it means, Why it matters) and a "Where the real picture comes from" line (measured: nothing; calculated here; imagined for the question).
- **Results (Part 3)** show the strength and radius, the distance walked (to the pole), and both final separations (1.000 m and 0.000 m, "the two travelers have met at the pole") with a "your guess" tag on each. Removed: the "You predicted / What actually happened" pairs. No check-up table and no setting-following table (the flat row compares a number with itself and the curved row with its own formula).
- **Start over** is always visible, greyed out until there is a guess or a run and while the travelers walk. It replaces "Walk Again", clears both guesses, and the page says the guesses are locked once the run starts.
- **Introduction.** The question is reworded ("Does the distance between them change?") and the "walking as straight as you possibly can" hint and "that convergence" are gone. New paragraphs: how the page is laid out, what "curvature strength" means, and "Your guesses and the real pictures"; plus a "Some new words" line and an added assumption (both travelers start side by side, 1 m apart, at the same steady speed).
- **Tutor.** The observe step points to the graph and the white marks; the compare step no longer states the outcomes; the explanation opens with "Your guesses, marked." for both surfaces, adds the worked 1 × cos(10 ÷ 20) = 0.878 m and the globe picture to point 2, says "Experiment 3 (tidal effects)", and ends with a line pointing to Part 2. The conceptual question is unchanged and, as approved, states that the travelers "ended up closer together" (after the learner has seen the graph and written two answers).

**After the owner's review (2026-11-12).**
- **"Curvature strength" paragraph rewritten.** The first version ("a strength of 0.5 means a sphere with a radius of 20 metres (the radius is 10 metres divided by the strength); ...") was confusing. It now opens with a basketball and the Earth, says a bigger number means a smaller, more sharply curved sphere, lists the three radii (50, 20 and 12.5 m), and compares with the Earth: radius about 6,371,000 m, more than 300,000 times Part 1's 20 m, and "on this page's scale" a curvature strength of about 0.0000016, far below the smallest value that can be chosen (0.01). The 10 ÷ strength rule is not in the introduction; it is in the words box, labelled "only a size picked so that you can watch a sphere this small, not a real value". The 10 m is `REFERENCE_RADIUS_METERS`, an implementation choice of the original build (this specification left the "exact mapping" to implementation).
- **Links from the start.** The owner asked for resource links in the introduction as well. Two neutral pages were added (below).

**Physics module (new, with tests; `curvedSpacetimeExperiment.ts`).** `actualOutcomeFor` and `PredictionChoice` (moved in from the component), `finalSeparationMeters` (moved out of the tutor), `guessMarkerFor`, `markGuess`, `SEPARATION_AXIS_TOP_METERS` (1.2), `FIXED_DISTANCE_AXIS_METERS` and `distanceAxisEndMeters`, `workedNumbers` (including the Earth comparison), `EARTH_RADIUS_METERS` and `SMALLEST_CHOOSABLE_STRENGTH`: 7 new tests (21 in the file). The page also has 14 render tests (`CurvedSpacetimeExperiment.test.tsx`). The full suite is 2,835 tests. Nothing else imports this component or module (checked), but `TidalEffectExperiment.tsx` now exports several of its helpers (blocks, caption box, legend, guess arrow) for this page; their behaviour is unchanged.

**Links (read 2026-11-12 through helpers' summaries, which could quote only short passages, not line by line; spot-check them in a browser).** Linked from the start (neutral; neither says anything about paths coming together or about curved spacetime): NASA Science, "Facts About Earth" (page last updated 5 December 2025; it gives an equatorial diameter of 12,756 km, a radius of about 6,378 km, and no mean radius, so the introduction's 6,371 km is a standard value within about 0.1%) and USGS, "Great Circle" (an image page dated about 2021, with one sentence of text). Held back until after the tutor's explanation (it names geodesics and curved spacetime): ESA, "Measuring spacetime curvature" (7 September 2015).

| Idea | Source | Status |
|---|---|---|
| The Earth's size | NASA Science, "Facts About Earth" | Linked from the start. The page gives a diameter, not the mean radius used here |
| Shortest path on a sphere is a great circle | USGS, "Great Circle" (image page, one sentence) | Linked from the start |
| Geodesics; curved spacetime | ESA, "Measuring spacetime curvature" | Linked after the tutor |
| Straight paths on a sphere that start side by side meet at a pole (the experiment's result) | **No plain official page found** | Open (§29 rule 3(c)): a NASA eclipse page on great circles redirected (HTTP 302) to a general page and could not be read; searched 2026-11-12 on nasa.gov, esa.int, noaa.gov and usgs.gov |
| Other candidates | NOAA, "What is Geodesy?" (read, neutral, not about shortest paths, and "geodesy" could be mistaken for "geodesic"); NASA Space Place, "What Is Gravity?" (calls gravity a force, no geodesic, spacetime, straight or parallel); NASA Goddard "Ask an Astrophysicist: Relativity" (calls free fall "the shortest path in curved spacetime", garbled statements) | Not linked |

**Open.**
- No plain official page for the experiment's own result (above).
- Tutor points 3 and 5 ("for the same reason: the spacetime they move through is curved"; "a rocket's uniform acceleration moves through flat spacetime ...") come from the approved specification and have no linked source.
- The sphere sketch's description ("drawn as they would look from outside") was drafted from the code, not confirmed against the intended view.
- The 10 m reference radius and the three presets (0.2, 0.5, 0.8) are choices of the original build, with no physical meaning.
- Not checked: narrow widths, dark mode, other browsers, the introduction's words box, the Part 1 captions and Part 3 by eye, a strength other than 0.5 and 0.8, a real learner.
