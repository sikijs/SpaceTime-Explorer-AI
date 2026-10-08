# Cosmology — Experiment 7: Gravitational Lensing

**Status: APPROVED by the owner on 2026-10-07 (proposed by Claude per `CLAUDE.md` §23 Stages 1–3 on 2026-10-07, following the completion of Cosmology Experiment 6; the topic was chosen by the owner from three candidates named in Experiment 6's specification). All eight "Decisions Needing Human Review" items are confirmed as proposed. Built and finally reviewed (2026-10-08); the owner's line-by-line wording approval (`CLAUDE.md` §28.1) is pending. See "Implementation Notes".**

This is the seventh experiment of the "Cosmology" chapter.

---

## Overview

Experiment 4 (dark matter) found unseen mass by weighing a galaxy with the speeds of its stars. This experiment finds the same unseen mass in a completely different way, using only light.

A galaxy cluster is a huge group of galaxies held together by gravity. Suppose one sits almost exactly between us and a much more distant galaxy. The cluster's gravity bends the distant galaxy's light around it (Gravity and Curved Spacetime Experiment 8 showed that mass bends light), so instead of one dot we see a ring of light around the cluster, called an **Einstein ring**. The more mass the cluster has, the more it bends the light, and the larger the ring. So the size of the ring is a scale: it tells us the cluster's total mass, whatever that mass is made of.

The learner chooses the cluster's mass and sees the ring's size change. They then compare two rings: the one that the cluster's **visible** matter (stars and hot gas) alone would make, and the one that is **actually observed** for a real cluster. The observed ring is much larger, so the cluster must contain much more mass than we can see. That is dark matter again, found without measuring any star's speed.

This uses real physics: the real general-relativistic bending of light (twice the ordinary-gravity value, as Experiment 8 showed), in real units, with a standard textbook formula for the ring's size.

---

## Learning Objective

After this experiment, the learner should understand:

1. A mass between us and a distant light source bends the light, so we can see a distorted or ringed image of the source. This is called gravitational lensing.
2. When the source, the mass (the "lens") and we are lined up almost perfectly, the light forms a ring.
3. The ring's size depends on the lens's mass: more mass gives a bigger ring, but the ring's width grows only as the **square root** of the mass (four times the mass gives a ring twice as wide).
4. This turns a ring into a scale: measuring the ring's size gives the total mass inside it, whether or not that mass is visible.
5. For a real cluster, the ring is much bigger than visible matter could make, so most of the mass is unseen. This is a second, independent line of evidence for dark matter (after Experiment 4's rotation curves).
6. Lensing weighs mass through gravity alone. It does not say what dark matter is made of.

---

## Physical Situation

A schematic line-up: the Earth (observer), a galaxy cluster (the lens) in the middle, and a much more distant galaxy (the source) behind it, all almost exactly in a line. The learner chooses the cluster's total mass.

The experiment draws two pictures:

1. **The geometry (a side view, not to scale):** light rays leave the distant galaxy, pass on either side of the cluster, are bent toward it, and reach Earth.
2. **The sky as seen from Earth:** the lens at the center and the ring of the source's light around it, drawn at its computed angular size, with an arcsecond scale.

### Fixed illustrative distances

Three distances are fixed and given (not chosen by the learner and not recomputed here): from us to the cluster `D_l = 630 Mpc`, from us to the source `D_s = 1730 Mpc`, and from the cluster to the source `D_ls = 1480 Mpc`. They are the distances (angular diameter distances) for a cluster at redshift 0.18 and a source at redshift 2 in a flat universe with the Hubble constant of Experiment 1 and a matter share of 30%, computed once, which is roughly the real situation of the cluster Abell 1689. They are rounded.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **The lens is treated as round, with the source exactly behind its center.** Real clusters are lumpy and rarely line up perfectly, so real rings are usually broken into arcs and distorted images.
- **The mass we compute is the mass inside the ring.** This is exact for a round lens, and it is all the ring can tell us.
- **Small angles and a thin lens.** All the bending is treated as happening at one place, the cluster. This is a standard, very good approximation for clusters.
- **The three distances are fixed, rounded values** for one real situation (see above), with Experiment 1's illustrative Hubble constant and its caveat (the Hubble tension, 67–73).
- **The "observed" ring and the visible-matter share are given reference values, not derived here.** The observed ring (about 47 arcseconds) is the measured size for a real cluster, Abell 1689. The visible share (about 15% of the total, stars plus hot gas) is a rounded average for real clusters. Both are used only for comparison.
- **The real bending is used (twice the ordinary-gravity value).** The reason is the one given in Gravity and Curved Spacetime Experiment 8 and is not re-derived.
- **Nothing here claims to say what dark matter is.**

### Not introduced

Arcs and multiple images, weak lensing (small distortions of many galaxies), microlensing by single stars, lensing by a lumpy cluster (the Bullet Cluster), time delays, and using lensing to measure the Hubble constant. All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16).

---

## Physics Model

One new, self-contained module. It deliberately **reuses** earlier experiments' constants unchanged (imported, not redefined): the speed of light from Experiment 1, the megaparsec-to-kilometer conversion from Experiment 2, and the gravitational constant and kiloparsec-to-kilometer conversion from Experiment 4. It does not reuse Gravity and Curved Spacetime Experiment 8's code, which works in abstract units; it reuses that experiment's idea (the real bending angle is `4GM / (c² × b)`) in real units.

Define the length `GM/c²` for a mass `M` in solar masses (about 1.477 km per solar mass, derived from the reused constants). With the three distances above, the ring's angular radius (the **Einstein radius**) is:

`θ = sqrt( (4 G M / c²) × D_ls / (D_l × D_s) )`

This is a standard result (see "Decisions Needing Human Review" item 3 for its source), converted to arcseconds at the end (1 radian is about 206,265 arcseconds). Two consequences the tests check:

- `θ` grows as the square root of `M`.
- At the ring's edge, the real bending angle `α = 4GM / (c² × b)`, with `b = θ × D_l` the closest the light passes to the cluster's center, equals `θ × D_s / D_ls`. This is the geometry that makes a perfectly lined-up source appear as a ring (exact for a round lens), and it ties the formula to Experiment 8's bending angle.

```typescript
// src/physics/gravitationalLensingExperiment.ts

// Reused unchanged (imported, not redefined):
//   hubblesLawExperiment.ts: REAL_SPEED_OF_LIGHT_KM_PER_S
//   bigBangExperiment.ts: MPC_TO_KM
//   darkMatterExperiment.ts: GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS, KM_PER_KPC

// Given, rounded distances (Mpc) for one real situation (about the cluster Abell 1689); see
// "Physical Situation".
export const LENS_DISTANCE_MPC = 630
export const SOURCE_DISTANCE_MPC = 1730
export const LENS_TO_SOURCE_DISTANCE_MPC = 1480

// Given, rounded real-world reference values, used only for comparison; see "Decisions Needing
// Human Review" item 4.
export const OBSERVED_RING_ARCSECONDS = 47
export const VISIBLE_MASS_FRACTION = 0.15
export const OBSERVED_TOTAL_MASS_SOLAR_MASSES = 2.0e14

export const MIN_LENS_MASS_SOLAR_MASSES = 1e13
export const MAX_LENS_MASS_SOLAR_MASSES = 4e14

// GM/c^2 in kilometers for a mass in solar masses (derived from the reused constants).
export function gravitationalLengthKm(massSolarMasses: number): number

// Angular radius of the Einstein ring in arcseconds.
export function einsteinRingArcseconds(massSolarMasses: number): number

// The real bending angle (arcseconds) for light passing a mass at a given distance (km):
// 4GM / (c^2 b).
export function bendingAngleArcseconds(massSolarMasses: number, closestApproachKm: number): number

// The mass (solar masses) inside a ring of a given angular radius: the formula run backward.
export function massInsideRingSolarMasses(ringArcseconds: number): number

export interface GravitationalLensingResult {
  massSolarMasses: number
  ringArcseconds: number
  ringRadiusKm: number            // the closest approach b = theta x D_l
  bendingAngleArcseconds: number  // at the ring's edge
  visibleOnlyMassSolarMasses: number
  visibleOnlyRingArcseconds: number
  observedRingArcseconds: number
  observedMassSolarMasses: number
  ringOverVisibleOnlyRing: number
  curve: Array<{ massSolarMasses: number; ringArcseconds: number }>
}

export function runGravitationalLensingExperiment(massSolarMasses: number): GravitationalLensingResult
```

Values worked out from this model, for the specification and the tests:

| Cluster mass (solar masses) | Ring radius (arcseconds) |
|---|---|
| 1 × 10¹³ | 10.5 |
| 3 × 10¹³ (visible matter only, 15% of the total) | 18.2 |
| 1 × 10¹⁴ | 33.2 |
| 2 × 10¹⁴ (the observed total) | 47.0 |
| 4 × 10¹⁴ | 66.5 |

Running the formula backward, the observed 47-arcsecond ring corresponds to about 2.0 × 10¹⁴ solar masses inside the ring. The published value for Abell 1689 is about 1.9 × 10¹⁴ solar masses within roughly 45 arcseconds, so the rounded numbers agree.

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser.

---

## Learner Controls

- **Cluster mass:** a slider from 1 × 10¹³ to 4 × 10¹⁴ solar masses, with presets "Visible matter only (stars and hot gas, about 15% of the total)" and "Visible plus dark matter (the observed total)", plus "Custom".
- **Run**, which sends the light from the distant galaxy past the cluster to Earth and then shows the ring over a fixed duration (independent of the physics result, per `CLAUDE.md` §11).

---

## Prediction Activity

Before the control and results are shown, the learner answers two questions in sequence (not scored):

1. "If the cluster between us and a distant galaxy had more mass, would the ring of light we see be larger, the same size, or smaller?" (Larger / The same / Smaller)
2. "If the cluster had four times the mass, how wide would the ring be compared with before?" (Four times as wide / Twice as wide / About the same)

The control is disabled until both predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the chosen mass. The geometry picture and the sky picture appear only after predictions are locked in (`CLAUDE.md` §12).

---

## Experiment Behavior

### Display

- **The geometry picture (labeled):** Earth, the cluster (the lens), and the distant galaxy (the source), with light rays leaving the source, bending toward the cluster, and arriving at Earth. Marked "not to scale", and the bending is exaggerated for visibility (display only). The rays are drawn bending more for a larger mass.
- **The sky picture (labeled):** the cluster at the center, and the ring at its computed angular radius, with an arcsecond scale bar. Three rings are distinguished by color and style, and are labeled directly: **the ring for the chosen mass** (solid), **the ring that the visible matter alone would make** (dashed), and **the observed ring of the real cluster** (a faint reference circle). A control that changes a number must visibly change the picture (`CLAUDE.md` §14).
- **A ring-size-versus-mass graph (labeled):** ring radius (vertical, arcseconds) against cluster mass (horizontal), showing the square-root curve, with the chosen mass marked, the visible-only point marked, and the observed ring drawn as a horizontal reference line. Axis labels with units.
- **Live readout:** the chosen mass, the ring radius, and (after a run) the real bending angle at the ring's edge.
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are submitted, written in the same detailed, step-by-step style as Experiments 5 and 6.

### Results

States the chosen mass and its ring; compares the ring with the visible-only ring and the observed ring; shows the mass inside the observed ring running the formula backward, and what share of it the visible matter makes up (about 15%); checks both of the learner's predictions against the model (more mass gives a larger ring; four times the mass gives twice the width, since the ring grows as the square root); includes simple math, per `CLAUDE.md` §15: for example, from the table, `(2 × 10¹⁴) ÷ (3 × 10¹³) ≈ 6.7` times the mass gives a ring `√6.7 ≈ 2.6` times as wide, and `18.2 × 2.6 ≈ 47`; includes real-world grounding (real clusters produce rings and arcs like these, and astronomers use them routinely to weigh clusters; the cluster Abell 1689 is a well-known example); explains that this is a second, independent line of evidence for dark matter, reached without measuring any star's speed (Experiment 4); and restates the model caveats (round lens and perfect alignment, fixed rounded distances, given reference values).

### Introductory text

To be drafted during implementation, covering: the question (how do you weigh something as large as a galaxy cluster, and what does its light tell us?), what happens, the learner's job (both predictions), what to look for, new terms defined in plain language before use (**gravitational lensing**, **lens** and **source**, **Einstein ring**, **arcsecond** as one 3,600th of a degree, with an everyday size comparison), reuse of "dark matter" and "solar mass" from Experiment 4, a daily-life picture (looking at a distant light through the thick base of a drinking glass, which smears a point of light into a ring when it is lined up just right; it deliberately does not hint that bigger glass-thickness makes a bigger ring), a "Why even ask this" paragraph (we cannot put a cluster on a scale, but its gravity bends light whatever the mass is made of), and the assumptions above. Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "Compare the three rings: the one for your chosen mass, the dashed one from visible matter alone, and the observed one. What do you notice?"
  2. Prediction comparison: the learner's two predicted answers beside what the model gave.
  3. Conceptual question: "The ring of the real cluster is much bigger than the one its visible matter would make. What might explain the difference?" — intended to let the learner reach "unseen mass" without the tutor stating it.
  4. Explanation: (1) mass bends light, so a lined-up source appears as a ring (Experiment 8's idea); (2) the ring's width grows with the square root of the mass, with the worked numbers; (3) so measuring the ring weighs the cluster, whatever the mass is made of; (4) for the real cluster the ring is about 2.6 times as wide as visible matter alone allows, which needs about 6.7 times the mass, so most of the mass is unseen; (5) this is a second, independent line of evidence for dark matter (Experiment 4 used stars' speeds, this uses light), and the agreement of two methods is what makes the case strong; (6) lensing says how much mass there is and where, not what it is made of; (7) not covered: arcs and multiple images, weak lensing, microlensing, lumpy clusters such as the Bullet Cluster, and the model's simplifications.

---

## Required Physics Tests

1. `einsteinRingArcseconds` matches the formula computed independently for several masses, to a tight relative tolerance, and matches the table above.
2. The ring grows as the square root of the mass: multiplying the mass by 4 multiplies the radius by 2 (and by 9 multiplies it by 3), exactly.
3. The ring is strictly increasing in mass across the allowed range.
4. `gravitationalLengthKm(1)` is within 0.1% of the standard value of about 1.4766 km per solar mass (derived from the reused constants).
5. At the ring's edge, `bendingAngleArcseconds(M, θ × D_l)` equals `θ × D_s / D_ls` (the lens-equation identity), for several masses.
6. `massInsideRingSolarMasses(einsteinRingArcseconds(M))` returns `M`, and the observed 47-arcsecond ring gives a mass within 5% of 2.0 × 10¹⁴ solar masses.
7. The visible-only ring (15% of the observed total) is smaller than the observed ring, by a factor of the square root of the mass ratio (about 2.6).
8. A mass of 3 × 10¹³ gives a ring within 1% of 18.2 arcseconds, and 2 × 10¹⁴ gives within 1% of 47.0.
9. The module imports its constants from `hubblesLawExperiment`, `bigBangExperiment` and `darkMatterExperiment` rather than redefining them, and does not import from `lightBendingExperiment` (abstract units), `darkEnergyExperiment`, `universeAgeExperiment` or `cosmicMicrowaveBackgroundExperiment` — a regression check (`CLAUDE.md` §8).

---

## Decisions Confirmed (2026-10-07)

All eight items below were confirmed as proposed.

## Decisions Needing Human Review (original proposals)

1. **Title and placement.** Proposed: "Weighing a Galaxy Cluster with Light (Gravitational Lensing)" as Cosmology Experiment 7. **Changed by the owner (2026-10-07) to "Gravitational Lensing".**
2. **Fixed distances.** Proposed: three fixed, rounded distances for one real situation (Abell 1689-like), stated as given. The alternative is to compute them from chosen redshifts using Experiment 5's distance function, which is richer and ties lensing to the expanding universe, but it is a second new idea. I propose the fixed distances.
3. **The Einstein-radius formula and its source.** It is a standard textbook result, and I checked the identity with Experiment 8's bending angle and the real example's numbers (Abell 1689's mass inside about 45 arcseconds is about 1.9 × 10¹⁴ solar masses; my rounded numbers give about 2.0 × 10¹⁴ for 47 arcseconds). I have not checked the formula against a textbook, only against the real cluster's published values. The tests check the algebra, not the source.
4. **The two reference values.** Proposed: an "observed" ring of 47 arcseconds (a real cluster, Abell 1689, for a source at redshift 2; published value 47.0 ± 1.2) and a visible share of 15% (published cluster averages are about 14–17% for stars plus hot gas). Both were checked against web sources on 2026-10-07. A caution: the 15% is a cluster-wide average, applied here to the mass inside the ring, which is approximate; the introduction says so.
5. **Naming a real cluster.** Proposed: name Abell 1689 as the real-world grounding, but keep the numbers rounded and labeled as "a real cluster like". The alternative is a generic "a real cluster" with no name.
6. **Display design.** Proposed: a geometry picture plus a sky picture with three rings, plus a ring-versus-mass graph (the graph makes the square-root rule visible and was missing in earlier experiments' first builds). The alternative is the sky picture alone.
7. **The second prediction (the square-root rule).** Proposed, since it gives the learner something quantitative to predict and be surprised by. The alternative is a second qualitative question, such as how the observed ring compares with the visible-only ring.
8. **Scope.** Proposed: round lens, perfect alignment, a single ring only. Arcs, the Bullet Cluster, weak lensing and microlensing are named only in the tutor's "not covered" point. The Bullet Cluster is the classic stronger dark-matter evidence, and could be its own later experiment.

---

## Relationship to Previous Experiments

- **Gravity and Curved Spacetime Experiment 8 (does gravity bend light?):** this applies its real bending angle, `4GM / (c² × b)`, at cosmic scale.
- **Cosmology Experiment 4 (dark matter):** this is a second, independent line of evidence for the same unseen mass, using light instead of stars' speeds. It reuses that experiment's gravitational constant and conversion.
- **Cosmology Experiment 1 (Hubble's Law) and Experiment 2 (the Big Bang):** reused for the speed of light and the megaparsec unit.
- **Cosmology Experiments 5 and 6:** the fixed distances come from the same flat universe with Experiment 1's Hubble constant.

## Relationship to Later Experiments

Possible further directions (none proposed here; each needs its own Stage 1–2 proposal): the Bullet Cluster as stronger dark-matter evidence (visible matter and the mass found by lensing separated), the CMB's tiny ripples and how structure formed, or whether dark energy changes over time.

---

## Success Criteria

1. The learner makes both predictions before the pictures and the control are shown.
2. Moving the mass visibly changes the ring in the sky picture and the rays in the geometry picture, not just a number.
3. The three rings (chosen, visible-only, observed), the cluster, the source and Earth are visually distinct, labeled directly on the picture, and explained in the caption.
4. The ring-versus-mass graph shows the square-root curve, with the chosen mass and the observed ring marked.
5. The Results panel correctly compares both of the learner's predictions to what the model gives, including the "four times the mass gives twice the width" result with its worked numbers.
6. The experiment states that the observed ring needs about 6.7 times the visible mass, and presents this as independent evidence for dark matter alongside Experiment 4.
7. The model caveats (round lens, perfect alignment, fixed rounded distances, given reference values) are stated in the introduction, Results, and tutor.
8. "Gravitational lensing", "lens", "source", "Einstein ring" and "arcsecond" are defined in plain language at first use (`CLAUDE.md` §15).
9. The experiment says plainly that lensing weighs mass but does not say what dark matter is.
10. No existing experiment's physics is modified or recomputed.

---

## Implementation Notes

Built one step at a time per `CLAUDE.md` §6: physics model and tests (`src/physics/gravitationalLensingExperiment.ts`, `.test.ts`), basic UI, introduction and prediction interaction, results panel, and tutor (`src/components/GravitationalLensingExperiment.tsx`, `GravitationalLensingTutor.tsx`), wired into `src/App.tsx`. Nothing from an earlier experiment was modified (checked from the commit history: only this experiment's own files and `App.tsx` changed).

**Complete-flow test and final review (2026-10-08, §21 Step 10), in a headless browser from a fresh profile.** Checked the introduction, prediction gating, the three pictures (including a mid-animation frame), the results panel with right and wrong predictions, the tutor, saved progress, changing the mass after a run, the Custom slider at its maximum, "Change predictions", and phone width. Every Success Criterion and every Required Physics Test is covered. One gap was found and fixed:

- The unit "Mpc" (megaparsec) was used in the introduction and the Results panel without being defined (`CLAUDE.md` §15). Fixed by defining it in the introduction's distances bullet, in the same words earlier experiments use (about 3.3 million light-years).

Other findings, not changed:

- At a 390-pixel-wide window the whole app's content column is only about 230 pixels wide, so the three pictures shrink and their labels become very small. Experiment 4 (dark matter) measures the same, so this is an app-wide layout matter, not specific to this experiment. Left for the owner to decide.
- The tutor's point 4 reads "2.6 × 2.6 ≈ 6.7". That is true for the unrounded values (2.58²), but the rounded numbers multiply to 6.76.
- "Before results" in the tutor section is met by the prediction questions themselves, as in earlier experiments; the tutor conversation starts after a run.
- The chapter summary in `src/App.tsx` is still a draft, and its "next" line still says this is the last experiment.
- Wording drafted by Claude that the specification does not contain, for the owner to approve: the square-garden comparison (Results and tutor point 2), the shelf-sag comparison (tutor point 3), and the sentence explaining why more mass makes a larger ring (Results).
- The test file's `node:fs/promises` type error under `tsc -b` is the same as in six earlier experiments' tests.
