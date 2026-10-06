# Cosmology — Experiment 4: Dark Matter (Why Do Galaxies Spin Too Fast?)

**Status: approved (2026-10-06), per `CLAUDE.md` §23 Stages 1–4, proposed by Claude following the completion of Cosmology Experiment 3. The owner approved the specification as drafted; all six former "Decisions Needing Human Review" items are confirmed as proposed (see "Decisions Confirmed"). Not yet implemented.**

This is the fourth experiment of the "Cosmology" chapter.

---

## Overview

Every earlier experiment in this chapter looked at the universe as a whole: its expansion (Experiments 1–2) and its oldest light (Experiment 3). This experiment looks at a single galaxy and asks a different question: **is the matter we can see all the matter there is?**

The idea is a direct extension of Gravity and Curved Spacetime's Experiment 6 (Orbits). There, the speed needed to circle a mass depends on how much mass is inside the orbit: `v = sqrt(G × M / r)`. If most of a galaxy's mass is concentrated in its bright central region, stars far from the center should orbit more slowly than stars nearer in, exactly as Neptune orbits the Sun more slowly than Earth does. The measured speeds do not do this. Stars far from the center orbit about as fast as stars much closer in. The simplest explanation is extra mass that gives off no light, spread out well beyond the visible stars: **dark matter**.

The learner sees this as a contrast on one graph: the speed predicted from visible matter alone (falling with distance), the speed actually observed (roughly flat), and a **dark matter amount** control that adds invisible mass until the predicted curve rises to meet the observation.

This is Newtonian gravity, which is appropriate here: the speeds involved (about 220 km/s) are under 0.1% of the speed of light. The same Newtonian-approximation caveat used in Gravity and Curved Spacetime's Experiments 6–7 is stated.

---

## Learning Objective

After this experiment, the learner should understand:

1. How fast a star orbits depends on how much mass is **inside** its orbit (`v = sqrt(G × M / r)`, the relation from Experiment 6 of the Gravity chapter), so measuring orbital speeds at different distances is a way to **weigh** a galaxy.
2. If the visible matter (stars and gas) were all the mass, stars far from the center would orbit more slowly than stars near it.
3. Real measurements show far-out stars orbiting about as fast as nearer ones (a "flat rotation curve"), so there must be more mass than we can see, spread out around the galaxy.
4. That unseen mass is called **dark matter**: it exerts gravity but gives off no light we can detect. It is inferred from its gravitational effects; its true nature is still unknown.
5. Dark matter is the leading explanation, supported by several independent kinds of evidence, not a settled picture of what the material actually is.

---

## Physical Situation

A single, simplified, Milky Way-like galaxy viewed from above. Three marker stars orbit the center at different distances. The learner changes the amount of invisible (dark) matter surrounding the galaxy and sees how the predicted orbital speed at each distance responds, compared with a reference line for the typical speed actually observed.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **Newtonian gravity only.** Orbital speeds here are tiny compared with light, so general relativity is not needed (consistent with Gravity chapter Experiments 6–7).
- **Circular orbits, spherically symmetric mass.** Each star is treated as moving in a circle, with gravity set only by the mass inside its orbit. Real galaxies are mostly flattened disks, so this is a simplification; it gives the right qualitative result.
- **The mass model is illustrative, not a fit to one real galaxy.** The visible-matter and dark-matter shapes are simple formulas whose constants were chosen so the numbers land near the Milky Way's real values (about 220 km/s). The visible-only curve is therefore a teaching model, not a measurement.
- **The "observed" speed is a given, real-world value, not derived here.** A flat reference line at about 220 km/s stands for what is typically measured (the Milky Way near the Sun, and many other galaxies). Real curves are not perfectly flat.
- **Only the outer galaxy is shown (5 to 30 kiloparsecs from the center).** The crowded inner region needs a more detailed model and is not covered.
- **No claim is made about what dark matter is.** The halo is only a shape that supplies the missing mass.

### Not introduced

What dark matter is made of, direct-detection experiments, gravitational lensing and galaxy-cluster evidence (named only in a single flagged sentence, not shown), the CMB's tiny ripples (a later topic named in Experiment 3), dark energy (a different, unrelated idea, named only to say it is not this), and how galaxies form. All out of scope, consistent with a single new idea (`CLAUDE.md` §16).

---

## Physics Model

One new self-contained module. It reuses the **relation** `v = sqrt(G × M / r)` already established in Gravity chapter Experiment 6 (`src/physics/orbitExperiment.ts`), but does not import it, because that module works in dimensionless units and this experiment needs real units (kiloparsecs, km/s, solar masses). See "Decisions Needing Human Review" item 4.

```typescript
// src/physics/darkMatterExperiment.ts

// Real, standard value of Newton's constant in galactic units:
// kiloparsecs x (km/s)^2 per solar mass.
export const GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS = 4.30091e-6

// Illustrative visible-matter model: the enclosed visible mass rises with radius and levels off,
// M_visible(r) = VISIBLE_MASS * r / (r + VISIBLE_SCALE_RADIUS), so almost all of it lies within a few
// scale radii of the center, like the bright part of a real galaxy.
export const VISIBLE_MASS_SOLAR_MASSES = 8e10
export const VISIBLE_SCALE_RADIUS_KPC = 4

// Illustrative dark-matter halo (a "pseudo-isothermal" shape, a standard simple choice):
// M_halo(r) = amount * HALO_MASS_PER_KPC * (r - HALO_CORE_RADIUS * atan(r / HALO_CORE_RADIUS)),
// whose enclosed mass keeps growing roughly in proportion to r, so it dominates far from the center.
// `amount` is the learner's control: 0 = no dark matter, 1 = the amount that matches the observed
// speed, 2 = twice that amount.
export const HALO_MASS_PER_KPC_SOLAR_MASSES = 1.2e10
export const HALO_CORE_RADIUS_KPC = 5

// A real, given, rounded value (Milky Way near the Sun) used only as a comparison line.
export const OBSERVED_SPEED_KM_PER_S = 220

export const MIN_RADIUS_KPC = 5
export const MAX_RADIUS_KPC = 30
export const MAX_DARK_MATTER_AMOUNT = 2

export function visibleEnclosedMass(radiusKpc: number): number
export function haloEnclosedMass(radiusKpc: number, amount: number): number
// v = sqrt(G * M_enclosed / r): the Experiment 6 relation, in real units.
export function circularSpeedKmPerS(radiusKpc: number, enclosedMassSolarMasses: number): number

export interface RotationCurvePoint {
  radiusKpc: number
  visibleOnlySpeedKmPerS: number
  withDarkMatterSpeedKmPerS: number
}
export function rotationCurve(amount: number, radiiKpc: number[]): RotationCurvePoint[]

// Time for one lap, in years (2 * pi * r / v, converting kpc to km).
export function orbitalPeriodYears(radiusKpc: number, speedKmPerS: number): number

export interface DarkMatterResult {
  amount: number
  curve: RotationCurvePoint[]
}
export function runDarkMatterExperiment(amount: number): DarkMatterResult
```

Values worked out from these constants, for the specification and the tests (visible only / with dark matter at amount = 1, km/s):

| Radius (kpc) | Visible only | Amount = 1 |
|---|---|---|
| 5 | 196 | 222 |
| 8 | 169 | 218 |
| 12 | 147 | 219 |
| 20 | 120 | 221 |
| 30 | 101 | 223 |

At 8 kpc (about the Sun's distance) the model gives a period of about 225 million years at amount = 1, close to the Sun's real lap of roughly 230 million years. At that radius the model's dark matter is about 40% of the mass inside the orbit, in the range astronomers estimate near the Sun, though not claimed as a precise value.

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser.

---

## Learner Controls

- **Dark matter amount**, a slider from `0` ("none, visible matter only") to `MAX_DARK_MATTER_AMOUNT` (2), with two one-click presets, "None" and "The amount that matches observations" (matching this chapter's presets-plus-continuous-control pattern). Labeled in plain language, with the value shown as a multiple of the matching amount.
- **Run**, which plays the star animation and draws the curves (fixed real-world duration, independent of the physics result, per `CLAUDE.md` §11).

---

## Prediction Activity

Before the control and results are shown, the learner answers two questions in sequence (not scored):

1. "If the stars and gas we can see were all the mass in the galaxy, how would the orbital speed of a star far from the center compare with a star nearer the center?" (Faster / Slower / About the same)
2. "Astronomers measure the real speed of far-out stars. Do you think the measured speeds will match what the visible matter predicts?" (Match / Faster than predicted / Slower than predicted)

The control is disabled until both predictions are entered, consistent with the rest of the project. The first Run locks them in; "Change predictions" reopens them without resetting the chosen amount.

---

## Experiment Behavior

### Display

- **Galaxy view (labeled):** the visible disk drawn as bright stars at the center, three marker stars (at 8, 16 and 30 kpc) orbiting, and a faint translucent halo whose strength follows the chosen dark matter amount, so the control visibly changes the picture. Each marker star's orbit speed follows the currently chosen model. A live readout lists each star's radius and speed.
- **Speed-versus-distance graph (labeled):** speed on the vertical axis, distance from the center on the horizontal axis. Three visually distinct lines: the **predicted speed from visible matter only** (falls with distance), the **predicted speed with the chosen dark matter** (moves with the control), and the **observed speed** (flat reference line at about 220 km/s). Axis labels with units; a legend.
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are submitted, explaining the galaxy view, the three lines, and what to look for.
- The graph and caption appear only after predictions are locked in, so the graph does not give away prediction 1 (`CLAUDE.md` §12).

### Results

States the chosen amount; the speed predicted at several radii with and without dark matter; whether the chosen amount makes the curve match the observed line (within a stated tolerance, e.g. 5%), and what too little or too much does; and compares both predictions to what happens (visible-only speed falls with distance; measured speed is much higher than the visible-only prediction). Includes real-world grounding (Vera Rubin and Kent Ford's 1970s measurements of stars orbiting in galaxies, including the Andromeda galaxy) and restates the illustrative-model caveat. Includes simple math, per `CLAUDE.md` §15: for example, at 8 kpc, `v = sqrt(4.3×10⁻⁶ × 5.3×10¹⁰ / 8) ≈ 169 km/s` from the visible mass alone.

### Introductory text

To be drafted during implementation, covering: the question (is the matter we can see all the matter there is?), what happens, the learner's job (both predictions), what to look for, new terms defined in plain language before use (**kiloparsec**, **solar mass**, **rotation curve**, **dark matter**), reuse of the circular-orbit idea from the Orbits experiment without re-deriving it, and the assumptions above. A daily-life picture is to be chosen with care: the solar-system comparison (Earth moves about 30 km/s, Neptune about 5.4 km/s) is the natural one, but it reveals the answer to prediction 1, so it belongs in the Results and tutor, not the introduction. Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "Compare the line for visible matter only with the observed line. What do you notice, especially far from the center?"
  2. Prediction comparison: the learner's two predicted answers beside what actually happened.
  3. Conceptual question: "If the stars far from the center move faster than the matter we can see can explain, what might be going on?" — intended to let the learner reason toward unseen mass without the tutor stating it outright.
  4. Explanation: (1) orbit speed depends on the mass inside the orbit, `v = sqrt(G × M / r)`; (2) with visible mass only, outer stars should be slower, like Neptune compared with Earth; (3) real galaxies show roughly flat curves; (4) the simplest explanation is unseen mass: **dark matter**, which exerts gravity but gives off no light, and which astronomers estimate is about five times as much as ordinary matter; (5) one flagged sentence on alternatives: dark matter is the leading explanation, supported by several independent kinds of evidence, but its nature is unknown and it has never been directly detected; modified-gravity ideas such as MOND exist and fit galaxy rotation curves well, but have a harder time with other observations such as galaxy clusters and the CMB; (6) not covered: what dark matter is made of, lensing, and the CMB's ripples (a later topic); and that **dark energy**, mentioned in Experiment 2, is a different idea.

---

## Required Physics Tests

1. With `amount = 0`, `withDarkMatterSpeedKmPerS` equals `visibleOnlySpeedKmPerS` at every radius.
2. The visible-only speed is strictly decreasing with radius across `MIN_RADIUS_KPC` to `MAX_RADIUS_KPC` (the premise of prediction 1).
3. At `amount = 1`, the speed is within 5% of `OBSERVED_SPEED_KM_PER_S` at every radius in range (the "matching" claim shown to the learner).
4. At each radius, a larger `amount` gives a strictly higher speed.
5. Consistency check: `speed² × radius / G` equals the enclosed mass used (confirms the relation is applied correctly in real units).
6. `haloEnclosedMass` is 0 at `amount = 0`, grows with radius, and is never negative.
7. `orbitalPeriodYears(8, speed at amount 1)` is within 10% of 230 million years (the sanity check on the real-world comparison stated to the learner).
8. The visible-only speed at 8 kpc is below the observed 220 km/s by a margin large enough to be clearly visible in the display (the premise of prediction 2).
9. The module does not import from `hubblesLawExperiment`, `bigBangExperiment`, or `cosmicMicrowaveBackgroundExperiment` — a regression check that this experiment's galactic-scale physics stays independent of the expansion physics (`CLAUDE.md` §8).

---

## Decisions Confirmed

Confirmed by the owner via question on 2026-10-06, before this draft:

1. **Learner control:** a dark-matter-amount slider, watching the predicted curve rise to meet the observed one (over a two-fixed-views or choose-a-galaxy design).
2. **Units:** real-flavored, Milky Way-like (kpc, km/s, solar masses), clearly labeled as illustrative, consistent with the Hubble's Law and GPS experiments (over dimensionless units).
3. **Alternative explanations:** one honest, flagged sentence in the tutor (over omitting it or a full section), as inflation was treated in Experiment 2.

---

## Further Decisions Confirmed

Confirmed by the owner on 2026-10-06, approving the specification as drafted. Each item below is confirmed as proposed.

1. **Title and placement.** Proposed: "Dark Matter: Why Do Galaxies Spin Too Fast?" as Cosmology Experiment 4. "Spin too fast" is plain-language shorthand; an alternative is "Dark Matter: The Missing Mass."
2. **Mass-model constants were chosen by Claude.** I tuned `VISIBLE_MASS`, `VISIBLE_SCALE_RADIUS`, `HALO_MASS_PER_KPC` and `HALO_CORE_RADIUS` numerically so the matching curve is flat to within about 2% and the visible-only speed at the Sun's distance is plausible. They are not taken from a published fit. I propose labeling them illustrative (as drafted); the alternative is to adopt a published Milky Way mass model, which would be more defensible but more complex.
3. **Slider range and labeling.** Proposed: 0 to 2 times "the amount that matches observations", with a preset at the matching amount. The preset reveals the answer to the control, but not to the predictions. The alternative is an unlabeled amount in solar masses, which is harder for a first-time learner.
4. **Reusing Experiment 6's relation without importing it.** Proposed: re-state `v = sqrt(G M / r)` in real units in the new module, because the Orbits module is dimensionless. The alternative is extracting a shared helper, which touches an existing, approved experiment.
5. **The "observed" line is a flat 220 km/s.** The Milky Way's real curve is not perfectly flat, and recent measurements suggest a slight decline at large radius. I propose the flat line as a clearly stated simplification. The alternative is drawing a few illustrative data points with scatter.
6. **Real-world grounding scope.** Proposed: Rubin and Ford's 1970s measurements in the results panel, and the "about five times as much as ordinary matter" figure in the tutor. Zwicky's 1933 galaxy-cluster observation is not mentioned. Please confirm, or ask for it to be included.

---

## Relationship to Previous Experiments

- **Gravity chapter, Experiment 6 (Orbits):** the speed-versus-enclosed-mass idea is applied to a whole galaxy.
- **Cosmology Experiments 1–3:** these were about the whole universe; this one turns to a single galaxy, and the tutor's closing line previews that dark matter also shapes the early universe (the CMB's ripples, a later topic).
- **Cosmology Experiment 2 (Big Bang):** its tutor already mentions "dark energy" in passing; this experiment states dark matter is a different thing.

## Relationship to Later Experiments

Possible further directions (none proposed here; each needs its own Stage 1–2 proposal): gravitational lensing as a second, independent line of evidence for dark matter, the CMB's tiny ripples and structure formation, or dark energy and the accelerating expansion.

---

## Success Criteria

1. The learner makes both predictions before the graph and control are shown.
2. Moving the dark matter amount visibly changes both the graph (the predicted curve moves) and the galaxy view (the halo strength), not just a number.
3. With no dark matter, the predicted speed visibly falls with distance; with the matching amount, it is visibly flat and close to the observed line.
4. All three lines on the graph are visually distinct, labeled, and explained in the caption.
5. The Results panel correctly compares both of the learner's predictions to what happens.
6. The Newtonian-approximation caveat and the illustrative-model caveat are stated in the introduction, the Results panel, and the tutor.
7. The experiment states plainly that dark matter is inferred from its gravity, that its nature is unknown, and that alternatives exist, in the single flagged tutor sentence (no more than one).
8. "Kiloparsec," "solar mass," "rotation curve," and "dark matter" are each defined in plain language at first use (`CLAUDE.md` §15).
9. No existing experiment's physics is modified or recomputed.

---

## Implementation Notes

Not yet implemented. The specification is approved. Per `CLAUDE.md` §23 Stage 5 and §6, implementation proceeds one step at a time, starting with the physics model and its tests.
