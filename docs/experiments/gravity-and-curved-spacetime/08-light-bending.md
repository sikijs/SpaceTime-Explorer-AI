# Gravity and Curved Spacetime — Experiment 8: Does Gravity Bend Light?

**Status: approved (2026-09-28).** This specification was drafted per `CLAUDE.md` §23 Stage 3, following the proposal Claude Code made in conversation on 2026-09-28, in response to Experiment 7's own "Relationship to Later Experiments," which named light bending and a near-horizon spacetime diagram as candidates without approving either. Claude recommended light bending over a near-horizon diagram, because it reuses this chapter's own tested trajectory-integration machinery (Experiment 6's `orbitExperiment.ts` pattern, Experiment 7's `SPEED_OF_LIGHT` constant) rather than requiring new diagram machinery this project hasn't built, and because a near-horizon spacetime diagram would need genuine general-relativistic geometry that this chapter's "ordinary gravity" scope deliberately avoids. All "Decisions Needing Human Review" items are confirmed (2026-09-28); see each item's resolution below. Not yet implemented.

## Overview

Experiment 7 showed that a probe launched straight outward at light speed can fail to escape a mass entirely. This experiment asks a different question: what happens to light that isn't launched straight at (or away from) the mass, but passes *near* it? Real light doesn't need to be aimed directly at something to be affected by its gravity — it can be bent off a straight line while continuing past.

The learner watches a light-speed probe launched on a path that would, without gravity, travel in a straight line past the central mass, offset sideways by a chosen distance (its "aim" — how close it would have come to the mass if gravity didn't act at all). Gravity bends the path toward the mass as the probe passes. The learner adjusts how close the aim is and observes how much the path bends.

Unlike Experiment 7 (which used the escape-speed formula, pushed to its limit), this experiment goes one step further than the rest of this chapter: it doesn't just simulate the ordinary-gravity picture and note that it's an approximation — it also states, by name and by formula, what the real, modern, general-relativistic answer is, and shows that the two differ by an exact factor of two. This is a deliberate scope decision (see "Decisions Needing Human Review" item 1): where Experiments 1–7 in this chapter kept the real theory mostly out of scope beyond a caveat sentence, this experiment's whole point is the historical gap between the Newtonian-era prediction and the correct one, and how that gap was actually measured.

---

## Learning Objective

After this experiment, the learner should understand:

1. Gravity bends the path of light passing near a mass, even though light has no mass to be "pulled" in the usual sense — bending is a property of the path itself, not of what's moving along it.
2. The amount of ordinary gravity — treating light as a fast-moving particle under Newtonian gravity — predicts a specific, calculable bending angle, which grows as the light passes closer to the mass.
3. The real universe bends light **exactly twice as much** as this ordinary-gravity calculation predicts, because real gravity (general relativity) doesn't just pull light off a straight path — it also curves space itself, and light's path must follow that curved space too. This experiment's simulation only reproduces the first, smaller effect.
4. This doubling is not a minor historical footnote: it is the single measurement — the 1919 solar eclipse expedition led by Arthur Eddington — that first confirmed general relativity over Newtonian gravity, made Einstein a household name, and remains one of the most famous results in the history of physics.
5. Light bending by mass (gravitational lensing) is a routine, actively used tool in modern astronomy.

---

## Physical Situation

Reuses the same central, fixed mass as Experiments 6 and 7. The probe starts far from the mass, moving in a straight line (as if the mass weren't there) that would pass the mass at a fixed perpendicular offset — the **aim distance** — always at exactly `SPEED_OF_LIGHT`. The learner adjusts the aim distance; each launch shows the probe's path curving as it passes the mass, continuing on a new straight line offset from its original direction, unless the aim distance is small enough that the probe instead falls into the mass (reusing the same collision-radius idea Experiment 6's orbit simulation already uses, sized from Experiment 7's event horizon — see "Decisions Needing Human Review" item 3). Because gravity bends the path itself, the actual falls-in/deflects boundary in aim-distance space sits somewhat farther out than the event horizon radius (the bend pulls the closest approach inward — a real effect, sometimes called gravitational focusing), not exactly at it.

### Simplifying assumptions (must be stated to the learner, in plain language)

- The simulated path itself is still calculated with the same ordinary (first-order, Newtonian) gravity as the rest of this chapter — treating light as an ordinary fast-moving particle, not the exact general-relativistic treatment. This is different from every other experiment in this chapter, which only used ordinary gravity: here, the real general-relativistic answer is also shown, by name and by formula, specifically to contrast with the simulated one (see "Overview").
- The mass, distance, and speed-of-light value here are relative, made-up quantities in the same units as Experiments 6 and 7, not real kilograms, meters, or the real speed of light. The bending angles shown are calculated from those made-up quantities; they are not the real bending angle of real starlight past a real Sun.
- The "doubling" fact and the 1919 eclipse result are real, verifiable history and real, modern physics, stated as named facts — not derived, computed, or produced by this experiment's own simulation, which only ever computes the smaller, ordinary-gravity value.
- The central mass does not move, and there is only one mass in the scene.

### Not introduced

The exact general-relativistic derivation of the doubled bending angle (this requires the full Schwarzschild metric and null-geodesic equations, well beyond this project's ordinary-gravity engine), gravitational redshift of light passing near a mass, black hole "photon spheres," and multiple-image or ring-shaped lensing (Einstein rings) remain out of scope — named only as real, modern ideas the learner may encounter elsewhere, never modeled.

---

## Physics Model

This experiment adds one new 2D trajectory calculation, reusing the exact same inverse-square gravity law and fixed-step symplectic (velocity Verlet) integration as `orbitExperiment.ts`, but with different initial conditions (a straight-line approach with a sideways offset, rather than a sideways launch from a fixed radius), plus one new closed-form pair of formulas for the two bending angles.

```typescript
// src/physics/lightBendingExperiment.ts
import { SPEED_OF_LIGHT } from './blackHoleExperiment'

export interface LightBendingPoint {
  t: number
  x: number
  y: number
}

export type LightBendingOutcome = 'deflects' | 'falls-in'

export interface LightBendingResult {
  gravitationalParameter: number
  aimDistance: number
  newtonianDeflectionAngle: number // radians; the weak-field closed-form estimate
  generalRelativisticDeflectionAngle: number // radians; exactly double the above
  outcome: LightBendingOutcome
  trajectory: LightBendingPoint[]
  simulatedDeflectionAngle: number | null // radians; measured from the integrated trajectory, null if falls-in
}

export function runLightBendingExperiment(
  gravitationalParameter: number,
  aimDistance: number
): LightBendingResult
```

- The probe starts far to one side (at a fixed large `x`, negative, matching `orbitExperiment.ts`'s scale conventions) moving in the `+x` direction at exactly `SPEED_OF_LIGHT`, offset by `aimDistance` in `y`. Its trajectory is integrated exactly as `orbitExperiment.ts` integrates `runOrbitExperiment`, under `d²r/dt² = -gravitationalParameter · r̂ / r²`, until it has traveled far past the mass (mirroring the "escapes" far-field check already used there) or falls within the same collision-radius rule Experiment 6 already uses (see "Decisions Needing Human Review" item 3) — reusing, not re-deriving, that pattern.
- `simulatedDeflectionAngle` is measured directly from the integrated trajectory: the angle between the probe's initial direction of travel and its direction once it is again far from the mass. This is the number the animation actually shows happening, and it is expected to closely match `newtonianDeflectionAngle` in the weak-field regime (large `aimDistance` relative to the event-horizon scale) — a physics test verifies this agreement, the same pattern Experiment 7 uses to cross-check its closed-form and integrated results.
- `newtonianDeflectionAngle = 2 * gravitationalParameter / (SPEED_OF_LIGHT ** 2 * aimDistance)` — the standard weak-field (small-angle) formula for a fast particle's deflection under ordinary gravity, valid when `aimDistance` is large compared to the event horizon scale from Experiment 7. This is a known, textbook formula (not invented here), and it is the "obvious" Newtonian-particle answer — historically, it is also what Einstein's first (1911), equivalence-principle-only attempt at general relativity predicted, before his complete 1915 theory corrected it.
- `generalRelativisticDeflectionAngle = 2 * newtonianDeflectionAngle` — the real, modern, general-relativistic weak-field deflection formula (`4 · gravitationalParameter / (c² · aimDistance)`), doubled for the reason stated in "Overview": real gravity also curves space itself, which this experiment's engine does not model. This is a known, textbook formula (Einstein, 1915), not invented or derived here — it is stated and used, exactly as Experiment 7 stated the real Schwarzschild-radius formula's numerical coincidence with its own Newtonian escape-speed result, without claiming to derive it.
- Both `newtonianDeflectionAngle` and `generalRelativisticDeflectionAngle` are weak-field approximations; they are not meaningful once `aimDistance` approaches the event-horizon scale, where the small-angle assumption behind them breaks down. The learner-facing aim-distance range must stay safely within the regime where this approximation and the simulated trajectory agree (see "Decisions Needing Human Review" item 4).
- Inputs must be strictly greater than 0, matching the validation pattern in `orbitExperiment.ts` and `blackHoleExperiment.ts`; otherwise the function throws `RangeError`.
- Deterministic, and performs no clamping — the calling component is responsible for the learner-facing aim-distance range.

---

## Learner Controls

- **Aim distance**: a single slider (closer aim → more bending), matching the one-control-at-a-time pattern of Experiments 6 and 7. The central mass is held fixed at the same `GRAVITATIONAL_PARAMETER` reference value Experiment 6 already uses, so the aim-distance slider alone carries the entire experiment.
- A **Launch** control, matching Experiments 6 and 7's Run/Launch button, re-runs the light-speed flyby at the currently chosen aim distance.

---

## Prediction Activity

Before revealing the interactive aim-distance control, the learner is asked (draft wording, pending owner review, §28.1), mirroring Experiments 6–7's prediction structure:

1. "Does light aimed to pass near the mass, but not directly at it, get bent from a straight line at all?" (Yes / No)
2. "Does aiming closer to the mass bend the light more, less, or about the same amount?" (More / Less / About the same)
3. "Compared to what ordinary gravity alone would predict, do you think the real universe bends starlight by more, less, or exactly the same amount?" (More / Less / Exactly the same)

Not scored.

---

## Experiment Behavior

### Introductory text (draft — pending owner review, §28.1)

> **The question.** Experiment 7 showed that light aimed straight at a massive enough object can't escape it. But what about light that isn't aimed at the mass at all — light that just happens to pass nearby? Does gravity do anything to it?
>
> **What happens.** You'll choose how closely a beam of light passes by a fixed mass — its "aim," how close it would come if gravity didn't act at all. You'll watch its path bend as it passes, then continue on a new straight line.
>
> **Your job.** Try aiming closer and farther, and see how the amount of bending changes.
>
> **Real light bending.** This isn't just a thought experiment — it's how general relativity was first confirmed. In 1919, the astronomer Arthur Eddington led an expedition to photograph stars near the Sun during a total solar eclipse, and measured that their light was bent by exactly the amount Einstein's 1915 theory predicted — not the smaller amount ordinary gravity alone would give. Today, astronomers routinely use this same bending — called gravitational lensing — to map matter that can't be seen directly and to find distant galaxies too faint to see any other way.
>
> **What we assume.**
> - This experiment's animation uses the same ordinary gravity as the rest of this chapter, not the exact general relativity a real light beam needs — but unlike earlier experiments, we'll also tell you what the real, correct answer is, and by how much it differs.
> - The mass, distance, and speed of light here are relative, made-up amounts, not real numbers, so the bending angles shown are not the real bending angle of real starlight.
> - There's only one mass in the scene, and it doesn't move.

### Display

The central mass at a fixed point, and the probe's straight-line un-bent path shown as a faint reference line, so the learner can see how far the actual path departs from it. The probe's position is animated along its actual (bent) path as it approaches, passes, and moves away from the mass. While the probe is moving, a live readout states its current position and, once it has passed the mass and moved far away, the measured bending angle.

### Run

Answering all three predictions reveals the aim-distance slider and the Launch control. Clicking Launch animates the probe's path over a fixed real-world duration, regardless of how much simulated time it represents (`CLAUDE.md` §11); the learner can change the aim distance and launch again to explore.

---

## Results Display

- The chosen aim distance, and the **simulated** bending angle measured from the animation.
- The **ordinary-gravity (Newtonian) formula's** predicted bending angle, side by side with the simulated one, confirming they agree.
- The **real, general-relativistic bending angle** — stated explicitly as exactly double the simulated/Newtonian one, with the plain-language reason (gravity also curves space itself, which this simulation's engine doesn't model).
- The 1919 Eddington eclipse expedition, named as the historical confirmation of the doubled value over the smaller one, and modern gravitational lensing, named as an active astronomical tool — both as real-world grounding, not computed by this experiment.
- The learner's three predictions, shown beside what's actually true.

---

## Expected Observations

1. Light aimed to pass near, but not at, the mass is bent from a straight line — it does not need to be aimed directly at the mass to be affected.
2. Aiming closer to the mass produces more bending; aiming farther away produces less.
3. The simulated bending angle matches the ordinary-gravity (Newtonian) formula closely, at aim distances well outside the event-horizon scale.
4. The real, general-relativistic bending angle is always exactly double the simulated one, regardless of aim distance.
5. If the aim distance is made small enough (comparable to, though somewhat larger than, Experiment 7's event horizon — see "Physical Situation"), the probe instead falls into the mass rather than passing by, echoing Experiment 7's own boundary without matching it exactly (see "Decisions Needing Human Review" item 3).

---

## Expected Learner Understanding

The learner should be able to say: "Gravity bends light's path even when the light only passes nearby, not straight at the mass — and it bends more the closer the light passes. The ordinary-gravity calculation this experiment simulates gives one answer, but the real universe bends light exactly twice as much, because real gravity curves space itself. That difference is exactly what the 1919 eclipse expedition measured, and it's what first proved general relativity right."

---

## New Concepts Introduced

- **Aim distance (impact parameter)** — how close a straight-line path would have passed the mass, if gravity didn't act.
- **Light bending / gravitational lensing** — the deflection of light's path by a mass, and its use as a real astronomical tool.
- **The Newtonian-vs-general-relativistic doubling** — the specific, named historical and physical fact that ordinary gravity under-predicts real light bending by exactly a factor of two.

---

## Relationship to Previous Experiments

- Reuses Experiment 6's (`orbitExperiment.ts`) inverse-square gravity law and fixed-step symplectic integration approach directly, adapted to a straight-line-with-offset initial condition instead of a circular-orbit-style launch.
- Reuses Experiment 7's `SPEED_OF_LIGHT` constant directly, and its event-horizon scale as the boundary below which the "falls-in" outcome applies (see "Decisions Needing Human Review" item 3).
- Extends this chapter's Experiment 4 (curved-spacetime geodesics) idea of an "as straight as possible" path to a massless particle for the first time in this project.
- Reuses "Relativity of Time and Motion" Experiment 5's invariant speed of light as the reason the probe's speed is fixed at `SPEED_OF_LIGHT` and never treated as reducible.
- Unlike every other experiment in this chapter, this is the first to explicitly compute and display a real general-relativistic quantity (the doubled deflection angle) rather than keeping the real theory strictly out of scope beyond a caveat sentence — a deliberate, owner-confirmed exception (see "Decisions Needing Human Review" item 1).

## Relationship to Later Experiments

None proposed. This is a plausible closing point for the "Gravity and Curved Spacetime" chapter, same as Experiment 7 was.

---

## Required Physics Tests

1. `newtonianDeflectionAngle` matches the closed-form `2 * gravitationalParameter / (SPEED_OF_LIGHT ** 2 * aimDistance)` for several `(gravitationalParameter, aimDistance)` pairs.
2. `generalRelativisticDeflectionAngle` is exactly `2 * newtonianDeflectionAngle` for several values (an exact relationship, not an approximation, so this should hold to floating-point precision).
3. `newtonianDeflectionAngle` (and therefore `generalRelativisticDeflectionAngle`) strictly decreases as `aimDistance` increases, gravitational parameter held fixed.
4. `newtonianDeflectionAngle` strictly increases as `gravitationalParameter` increases, aim distance held fixed.
5. For aim distances well outside the event-horizon scale (reusing Experiment 7's `evaluateBlackHole` to establish that scale), `simulatedDeflectionAngle` agrees with `newtonianDeflectionAngle` within a small numerical tolerance, for several `(gravitationalParameter, aimDistance)` pairs — the same cross-check pattern Experiment 7 uses between its closed-form and integrated results.
6. `outcome` is `'falls-in'` for an aim distance well inside the event-horizon scale from "Decisions Needing Human Review" item 3, and `'deflects'` for one well outside it — not an exact cutoff at the horizon radius itself, since gravitational bending pulls the trajectory's closest approach inward (see "Physical Situation").
7. In the `'falls-in'` case, `simulatedDeflectionAngle` is `null` (no far-field deflection angle exists for a trajectory that never leaves the mass's vicinity).
8. In the `'deflects'` case, the trajectory's `x` position is monotonically increasing once the probe is far past the mass (confirming a genuine flyby, not a coincidental snapshot mid-approach).
9. The function is deterministic across repeated calls for the same inputs.
10. Invalid inputs (`gravitationalParameter <= 0`, `aimDistance <= 0`) throw, matching the validation pattern in `orbitExperiment.ts` and `blackHoleExperiment.ts`.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiments 1–7 in this phase:

- **Before the run:** helps the learner form all three predictions; does not reveal the answer.
- **During the flyby animation:** silent.
- **After the flyby:**
  1. Observation: "What happened to the light's path as it passed the mass — did it stay straight, or bend?"
  2. Prediction comparison: the learner's three predicted answers beside what actually happens.
  3. Conceptual question: "This simulation calculated one bending angle using ordinary gravity. Do you think that's the same amount the real universe bends light by?"
  4. Explanation: (1) light passing near a mass is bent from a straight line, more so the closer it passes — connecting to Experiment 4's "as straight as possible path" (geodesic) idea, now applied to something with no mass at all; (2) this experiment's simulation calculates that bending using the same ordinary, first-order gravity as the rest of this chapter, treating light as a fast-moving particle; (3) the real universe bends light **exactly twice as much**, because real gravity (general relativity) doesn't just pull light off a straight path — it also curves space itself, and light's path has to follow that curved space too, an effect this simulation's engine doesn't include; (4) this doubling is not a minor detail — it is exactly what a 1919 solar eclipse expedition, led by the astronomer Arthur Eddington, measured: starlight passing near the eclipsed Sun bent by the larger, doubled amount, not the smaller, ordinary-gravity amount, which is what first convinced the world that Einstein's general relativity, not Newton's gravity, was correct; (5) light bending by mass, called gravitational lensing, is now a routine, actively used astronomical tool — for example, to map matter that can't be seen directly and to find distant galaxies too faint to see any other way.
  - The tutor may name the 1919 Eddington expedition, gravitational lensing, and its modern astronomical uses as real, verifiable facts (points 4–5 above), but only as named facts about the real universe — the exact general-relativistic derivation of the doubled angle, gravitational redshift, photon spheres, and multiple-image ("Einstein ring") lensing remain out of scope for this experiment.

---

## Decisions Needing Human Review

All items were confirmed by the owner in conversation on 2026-09-28.

1. **Showing the real general-relativistic deflection angle, not just the ordinary-gravity approximation.** Confirmed (2026-09-28), at the owner's request: rather than only stating the Newtonian-vs-real gap as a caveat sentence (as Experiments 1–7 generally do), this experiment explicitly computes and displays the real, modern formula (`4 · gravitationalParameter / (c² · aimDistance)`), states plainly that it is exactly double the simulated value, and grounds this in named, verifiable history (Einstein's 1911 vs. 1915 predictions, the 1919 Eddington expedition) and modern practice (gravitational lensing). This is a deliberate exception to this chapter's usual "state the real theory only as a caveat" pattern, made because the *comparison itself* — not just the simulated bending — is the entire educational point of this experiment.
2. **Real-world grounding.** Confirmed (2026-09-28): the introduction, results panel, and tutor all name the 1919 Eddington eclipse expedition and modern gravitational lensing as real, verifiable facts, following the pattern Experiment 7 established for the Event Horizon Telescope.
3. **Whether an aim distance small enough should produce a `'falls-in'` outcome, sizing the collision radius from Experiment 7's event horizon.** Confirmed: reuses `evaluateBlackHole` from Experiment 7 to size the collision radius, rather than inventing a new capture rule — but the resulting falls-in/deflects boundary in aim-distance space is not identical to that radius (see "Physical Situation" and "Implementation Notes"): gravitational bending pulls the trajectory's closest approach inward, so the true boundary sits somewhat farther out than the event-horizon radius itself.
4. **The exact learner-facing aim-distance range**, chosen so the weak-field approximation (`newtonianDeflectionAngle`/`generalRelativisticDeflectionAngle`) stays valid and close to the simulated trajectory across the whole range, while still producing a visually clear range of bending angles. Confirmed to be finalized at implementation time, following the pattern already used for Experiment 7's `SPEED_OF_LIGHT` value (item 3 in that specification's own "Decisions Needing Human Review"). Finalized as 0.3–4.0 (default 2.0): the simulation's fixed-size integration domain (`START_X`/`FAR_FIELD_X` = ±15, chosen for a visually legible drawing) loses accuracy once `aimDistance` is a large fraction of that domain, growing from about 2% agreement error at `aimDistance` = 4 to over 10% at `aimDistance` = 8 — a finite-domain numerical artifact, not a real physical effect — so the range was capped at 4.0 to keep the simulated and Newtonian-formula angles in close agreement throughout, as Success Criterion 3 requires. See "Implementation Notes."
5. **Units for displaying the bending angle to the learner.** Confirmed: degrees, not radians. The real 1919 measurement is traditionally quoted in arcseconds; that unit is not used here, since this experiment's dimensionless quantities don't correspond to real arcseconds, and mixing the two could mislead the learner into thinking the simulated angle is the real one.

None of the learner-facing introduction, prediction, results, or tutor wording above has been reviewed yet (`CLAUDE.md` §28.1); all of it is draft, subject to revision.

---

## Success Criteria

1. The physics model reuses Experiment 6's trajectory-integration approach and Experiment 7's `SPEED_OF_LIGHT` constant directly, adding only the new straight-line-with-offset initial condition and the two closed-form deflection-angle formulas.
2. The learner predicts before the aim-distance control and Launch button are revealed.
3. The flyby is animated (`CLAUDE.md` §11), and the simulated deflection angle agrees with the closed-form Newtonian formula within tolerance, across the approved aim-distance range.
4. The learner can, after the experiment, correctly explain that light passing near a mass is bent, that ordinary gravity predicts one (smaller) amount, and that the real universe bends light exactly twice as much — and can name the 1919 Eddington eclipse expedition as the reason this is known.
5. The introduction, results panel, and tutor all state plainly which angle is simulated (ordinary gravity) and which is real (general relativity), and never present the real value as something this experiment's own physics derives or computes.
6. Real-world grounding is limited to named, verifiable facts (Einstein's 1911/1915 predictions, the 1919 Eddington eclipse expedition, and gravitational lensing's modern astronomical uses) — never invented numbers, and never presented as something this experiment's physics derives. The exact general-relativistic derivation, gravitational redshift, photon spheres, and Einstein-ring lensing do not appear.

---

## Implementation Notes

Implemented per this specification: physics model and tests (`src/physics/lightBendingExperiment.ts`, `src/physics/lightBendingExperiment.test.ts`), interface, prediction, results panel, and tutor (`src/components/LightBendingExperiment.tsx`, `src/components/LightBendingTutor.tsx`), wired into the guided journey (`src/App.tsx`), including an updated "What's next" summary for Experiment 7 pointing to this experiment. Complete-flow tested in a browser across every step (predictions, a deflecting launch, a falls-in launch, the full results panel, all three tutor reflection steps, and guided-journey navigation).

Final review against this specification (§21 Step 10) found three gaps, fixed before completion:

1. **The falls-in/deflects boundary does not sit exactly at the event-horizon radius.** The specification's original "Physical Situation," Required Physics Test 6, Expected Observation 5, and "Decisions Needing Human Review" item 3 all described the falls-in boundary as coinciding with Experiment 7's event horizon. Numerically probing the implementation showed this is inaccurate: because gravity bends the path itself, the trajectory's closest approach is pulled inward of the aim distance (gravitational focusing), so the true boundary sits noticeably farther out — for `gravitationalParameter = 1` (event horizon 0.5), falls-in persists up to roughly `aimDistance` ≈ 0.7, not 0.5. This is real, physically expected behavior of the simulation (not a bug), but the specification and the results-panel wording overclaimed an exact match. Fixed by revising the specification text in the four places above, revising the physics test's title and comment to stop asserting an exact cutoff, and rewording the results panel's falls-in message to say "similar to" Experiment 7's boundary rather than "the same boundary."
2. **The live position readout omitted the measured bending angle**, which the specification's "Display" section requires ("once it has passed the mass and moved far away, the measured bending angle"). Fixed by adding the simulated angle (in degrees) to the live readout once the outcome is known, alongside the existing full breakdown in the Results panel below.
3. **The simulated deflection angle diverged from the Newtonian formula by over 10% at the top of the original 0.3–8 learner-facing aim-distance range**, growing from about 2% at `aimDistance` = 4 — a finite-integration-domain numerical artifact (the fixed ±15 domain isn't "far enough" once `aimDistance` is a large fraction of it), not a real physical inaccuracy. This contradicted the results panel's claim that the simulated and formula angles "agree," and Success Criterion 3. Fixed by capping the learner-facing range at 0.3–4.0 (default 2.0), where the two stay within about 2–3% agreement throughout; see "Decisions Needing Human Review" item 4.

The owner's line-by-line wording approval (§28.1) has not yet been done — this includes the three passages revised during this review (the falls-in message, and the two spec-only changes don't require it, but the results-panel wording change does).
