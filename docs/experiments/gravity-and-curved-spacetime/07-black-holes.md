# Gravity and Curved Spacetime — Experiment 7: What Is a Black Hole?

**Status: approved (2026-09-27).** This specification was drafted per `CLAUDE.md` §23 Stage 3, following the proposal Claude Code made in conversation on 2026-09-27, in response to the milestone set after Experiment 6 (why do planets orbit instead of falling in?) was completed. Experiment 6's own "Relationship to Later Experiments" section named two candidate directions — light bending, and black holes — without approving either. Claude recommended black holes over light bending, and the owner confirmed it, because it builds directly on Experiment 6's own escape-speed machinery without requiring a new photon-trajectory physics model. All "Decisions Needing Human Review" items are confirmed (2026-09-27); see each item's resolution below. Not yet implemented.

## Overview

Experiment 6 showed that a fast enough sideways launch lets an object escape a mass forever, and defined the escape speed for a given mass and distance. This experiment asks: what if the mass were so concentrated that the escape speed at some distance reached the speed of light itself? Since nothing can travel faster than light ("Relativity of Time and Motion," Experiment 5), the answer is that nothing — not even light — could escape from within that distance. That boundary is called the **event horizon**, and the object inside it is a **black hole**.

The learner watches a probe launched straight outward (not sideways, unlike Experiment 6) from a fixed distance, at the fastest speed anything can ever travel — the speed of light — as the mass is increased. At small mass, the probe escapes easily. Past a specific mass, even a probe moving at the speed of light no longer has enough energy to escape, and falls back — meaning nothing, not even light, could get out from there. That is the event horizon.

This is not a new physical idea layered on top of Experiment 6 — it is the same escape-speed formula, asked what happens as it is pushed toward its known physical limit, `c`. This experiment reuses Experiment 6's escape-speed relationship directly, adds one new fixed reference quantity (the speed of light, in the same dimensionless units already used throughout this chapter), and adds one new small trajectory calculation for purely radial (straight-line) motion, alongside — not replacing — Experiment 6's own sideways-launch trajectory calculation.

---

## Learning Objective

After this experiment, the learner should understand:

1. A black hole is not a mysterious, qualitatively different kind of object — it is what a large enough mass, packed closely enough, becomes once its escape speed would need to exceed the speed of light.
2. Since nothing can exceed the speed of light, once escape speed reaches `c` at some distance, nothing — not even light — can escape from within that distance. That boundary is the event horizon.
3. This is the exact same escape-speed idea from Experiment 6, pushed to its physical limit — not a new kind of physics.
4. This reasoning — ordinary gravity's escape speed reaching the speed of light — is genuinely how astronomers first imagined objects like this in the 1700s (John Michell, 1783), long before Einstein's general relativity gave the full, correct picture.

---

## Physical Situation

Reuses Experiment 6's central mass and fixed launch point, but launches the probe straight outward (radially) instead of sideways, always at the same maximum speed: the speed of light. The learner adjusts the mass; each launch attempt at that mass either escapes (drifting away, slowing but never turning back) or falls back (rising, slowing, stopping, and falling back down toward the mass) — exactly as Experiment 1's dropped ball falls, just run in reverse for the "rising" part. The event horizon — the boundary distance at which even a light-speed launch can no longer escape — is shown alongside each attempt.

### Simplifying assumptions (must be stated to the learner, in plain language)

- This experiment uses the same ordinary (first-order, Newtonian) gravity as Experiments 2, 3, 5, and 6 — not the exact general-relativistic treatment. The real, exact description of a black hole requires general relativity; this experiment only shows why the idea of "nothing can escape past some boundary" arises naturally, using the tools already built in this chapter.
- The mass, distance, and speed-of-light value here are relative, made-up quantities in the same units as Experiment 6, not real kilograms, meters, or the real speed of light.
- The probe is launched straight outward, not sideways — this experiment does not show orbits (Experiment 6 already covered that); it only asks whether something can escape at all.
- The central mass does not move.

### Not introduced

The exact general-relativistic description of a black hole (the Schwarzschild metric, spacetime diagrams near a horizon), what actually happens to an object that falls past the horizon, orbital motion, and light bending remain out of scope — candidates for later experiments, not this one.

**Revised 2026-09-27, at the owner's request:** real black holes, the Event Horizon Telescope's images, and light-touch mentions of singularities and Hawking radiation are now referenced by name, as real ideas beyond this simple model — but always as named, verifiable facts (who imaged what, and when), never as invented numbers, and never derived, computed, or presented as something this experiment's physics actually models.

---

## Physics Model

This experiment adds one small derivation in front of the same escape-speed relationship Experiment 6 already defines and tests (`escapeSpeed = sqrt(2 * gravitationalParameter / distance)`), plus one new fixed reference constant for the speed of light, plus one new trajectory calculation for purely radial (straight-line) motion — a genuinely new addition, since Experiment 6's `runOrbitExperiment` only ever launches sideways and cannot represent a radial launch.

```typescript
// src/physics/blackHoleExperiment.ts
export const SPEED_OF_LIGHT = 2 // dimensionless, in Experiment 6's own units — see "Decisions Needing Human Review" item 3

export interface BlackHoleResult {
  gravitationalParameter: number
  distance: number
  escapeSpeed: number
  escapeSpeedFractionOfC: number
  eventHorizonRadius: number
  isInsideHorizon: boolean
}

export function evaluateBlackHole(
  gravitationalParameter: number,
  distance: number
): BlackHoleResult

export interface RadialLaunchPoint {
  t: number
  distance: number
}

export type RadialLaunchOutcome = 'escapes' | 'falls-back'

export interface RadialLaunchResult {
  outcome: RadialLaunchOutcome
  trajectory: RadialLaunchPoint[]
}

// Launches a probe straight outward from startDistance at exactly SPEED_OF_LIGHT — the fastest
// speed anything can ever travel — and reports whether it escapes or falls back.
export function runRadialLightSpeedLaunch(
  gravitationalParameter: number,
  startDistance: number
): RadialLaunchResult
```

- `escapeSpeed = sqrt(2 * gravitationalParameter / distance)` — the exact same formula Experiment 6 already defines and tests, evaluated at the given distance rather than as part of a simulated launch.
- `escapeSpeedFractionOfC = escapeSpeed / SPEED_OF_LIGHT`.
- `eventHorizonRadius = 2 * gravitationalParameter / SPEED_OF_LIGHT ** 2` — the distance at which `escapeSpeed` exactly equals `SPEED_OF_LIGHT`, found by solving `escapeSpeed = c` for distance. (This happens to be numerically identical in form to the real Schwarzschild radius formula, `r_s = 2GM/c²` — confirmed to mention, framed as a curious historical fact, not a derivation; see "Decisions Needing Human Review" item 2.)
- `isInsideHorizon = distance <= eventHorizonRadius` (equivalently, `escapeSpeedFractionOfC >= 1`).
- `runRadialLightSpeedLaunch` integrates one-dimensional radial motion under the same inverse-square law as `orbitExperiment.ts` (`d²r/dt² = -gravitationalParameter / r²`), starting at `startDistance` with outward velocity exactly `SPEED_OF_LIGHT`, using the same fixed-step symplectic integration approach as `orbitExperiment.ts`, for the same reason (energy accuracy over many steps). Because the launch is purely radial (zero sideways component), the probe can only ever move directly away or directly back — there is no possibility of an orbit forming, which is what makes this launch a safe way to test "can anything escape from here," without the Newtonian toy model's usual risk of implying a stable orbit could exist inside a real event horizon (a real one cannot; see "Decisions Needing Human Review" item 5).
  - The simulation classifies `escapes` once distance is increasing and comfortably larger than the start distance (confirming a positive-energy, truly unbound trajectory rather than a large but still-bound excursion), and `falls-back` once distance returns to (or below) the original `startDistance`, whichever happens first, up to a fixed maximum simulated time.
  - This outcome is fully determined by `isInsideHorizon` for the same `(gravitationalParameter, startDistance)` (escapes if `false`, falls back if `true`) — the simulation isn't guessing; it is expected to always agree, and a physics test verifies this agreement directly, providing a second, independent confirmation of the same physical conclusion Experiment 6's escape-speed formula already gives.
- Both inputs to each function must be strictly greater than 0, matching the validation pattern in `orbitExperiment.ts`; otherwise the function throws `RangeError`.
- Deterministic, and performs no clamping — the calling component is responsible for the learner-facing mass range (see "Learner Controls").

---

## Learner Controls

- **Mass**: a single slider, matching Experiment 6's one-control-at-a-time pattern. The launch distance is held fixed at Experiment 6's own `INITIAL_DISTANCE` reference value, so the mass slider alone carries the entire experiment. The launch speed is always exactly `SPEED_OF_LIGHT` — not a learner control — since the entire point is testing the one speed nothing can exceed.
- A **Launch** control, matching Experiment 6's Run button, re-runs the radial launch at the currently chosen mass.

---

## Prediction Activity

Before revealing the interactive mass control, the learner is asked (draft wording, pending owner review, §28.1), mirroring Experiment 6's three-question structure:

1. "If the mass is very small, what do you expect the escape speed to be, compared to the speed of light: much slower, faster, or about the same?"
2. "If the mass is very large instead, what do you expect: much slower than light, faster than light, or that nothing can escape at all?"
3. "Is there a mass in between where something special happens?" (Yes / No)

Choices for questions 1–2: "Much slower than light" / "Faster than light" / "Nothing can escape at all". Not scored.

---

## Experiment Behavior

### Introductory text (draft — pending owner review, §28.1)

> **The question.** Could a mass ever be packed so densely — so concentrated — into a small space that nothing, not even light, could escape it? ("Concentrated" just means how much mass is squeezed into a given amount of space: a golf-ball-sized lump of lead is far more concentrated than a foam ball the same size, because it has much more mass packed into the same volume.)
>
> **What happens.** You'll adjust how massive a central object is. Each time, a probe launches straight outward from the same starting point near it — always the same distance away, so only the mass changes — at the fastest speed anything can ever travel: the speed of light. You'll watch whether it escapes or falls back.
>
> **Your job.** Try small and large masses, and see what happens to the launch.
>
> **Real black holes.** These aren't just a thought experiment — astronomers have directly imaged the glowing region around two real black holes, using a global network of radio telescopes called the Event Horizon Telescope: one at the center of the galaxy M87 (2019), and Sagittarius A*, the black hole at the center of our own Milky Way (2022). This experiment uses a simplified version of the reasoning that first predicted such objects could exist.
>
> **What we assume.**
> - This uses the same ordinary gravity as Experiments 2, 3, 5, and 6, not the exact general relativity a real black hole needs.
> - The mass, distance, and speed of light here are relative, made-up amounts, not real numbers.
> - The probe is launched straight outward, not sideways — this isn't about orbits, which Experiment 6 already covered.
> - The central mass doesn't move.

### Display

The central mass at a fixed point, the probe's launch point marked at a fixed distance from it, and the event horizon (a boundary circle) shown at its current size for the chosen mass, each identified by a labeled legend below the drawing (since the event horizon can grow to overlap or exceed the other markers, on-drawing labels aren't reliable at every mass). The probe's position along the straight outward line is animated as it rises and either keeps going or slows, stops, and falls back. While the probe is moving, a live readout below the drawing states its current distance from the mass and whether it is currently moving away or falling back, updated as the animation plays — not only after it finishes.

### Run

Answering all three predictions reveals the mass slider and the Launch control. Clicking Launch animates the probe's radial path over a fixed real-world duration, regardless of how much simulated time it represents (`CLAUDE.md` §11 — playback speed must not change the physical result); the learner can change the mass and launch again to explore.

---

## Results Display

- The chosen mass, the resulting escape speed as a percentage of the speed of light, and the event horizon's size compared to the fixed launch distance.
- Whether the launch point is currently inside or outside the horizon, stated in plain language.
- The launch outcome (escaped / fell back), stated in plain language.
- A single sentence noting that a real black hole's event horizon is defined exactly this way — the boundary where escape speed would equal the speed of light — though the real calculation needs general relativity, not this simplified version.
- The learner's three predictions, shown beside what's actually true.

---

## Expected Observations

1. A small mass gives an escape speed well below the speed of light, and the light-speed launch escapes easily.
2. As mass increases, escape speed rises toward the speed of light, and the launch's escape becomes more gradual (slowing more before it gets away).
3. Past a specific mass, escape speed would need to exceed the speed of light — which is impossible — so instead, the light-speed launch falls back. That mass (equivalently, that distance) is the event horizon.
4. Once the launch point is inside the horizon (mass large enough that the horizon has grown past it), even the fastest possible launch falls back — nothing, not even light, could escape from there.

---

## Expected Learner Understanding

The learner should be able to say: "A black hole isn't some totally different kind of object — it's just what happens when a mass is packed closely enough that its escape speed would need to be faster than light. Since nothing can go faster than light, nothing can escape from inside that boundary — the event horizon. It's the same escape-speed idea from Experiment 6, taken to its limit."

---

## New Concepts Introduced

- **Black hole** — a mass concentrated enough that its escape speed at some distance reaches the speed of light.
- **Event horizon** — the boundary distance at which escape speed exactly equals the speed of light; nothing inside it can escape.

---

## Relationship to Previous Experiments

- Directly reuses Experiment 6's escape-speed formula and validated physics, unchanged.
- Adds a new radial-launch trajectory calculation, using the same inverse-square gravity law and the same integration approach as Experiment 6's `orbitExperiment.ts`, but for straight-line motion, which Experiment 6 itself cannot represent (its launches are always sideways).
- Reuses "Relativity of Time and Motion" Experiment 5's invariant speed of light — the reason exceeding `c` is impossible, rather than merely difficult — as the key fact that turns "very high escape speed" into "nothing can escape."
- Does not reuse Experiment 4's or Experiment 5's (this chapter's) curvature/mass-distance code directly; the event horizon here is derived purely from Experiment 6's escape-speed relationship.

## Relationship to Later Experiments

None approved. This could motivate a later experiment on light bending (a geodesic followed by something with no mass) or on what a spacetime diagram looks like near an event horizon — not proposed or approved here. This may also be a reasonable closing point for the "Gravity and Curved Spacetime" chapter if the owner prefers not to continue further.

---

## Required Physics Tests

1. At the mass where `escapeSpeed` exactly equals `SPEED_OF_LIGHT` for the fixed launch distance, `escapeSpeedFractionOfC` is `1` (within a small numerical tolerance) and `isInsideHorizon` is `false` just below that mass and `true` just above it.
2. `escapeSpeedFractionOfC` strictly increases as `gravitationalParameter` increases, distance held fixed.
3. `eventHorizonRadius` strictly increases as `gravitationalParameter` increases.
4. `eventHorizonRadius` matches the closed-form `2 * gravitationalParameter / SPEED_OF_LIGHT ** 2` for several `gravitationalParameter` values.
5. `escapeSpeed` matches the same `sqrt(2 * gravitationalParameter / distance)` formula Experiment 6's own tests already verify, for several `(gravitationalParameter, distance)` pairs — a direct consistency check between the two experiments.
6. `isInsideHorizon` is `true` exactly when `distance <= eventHorizonRadius`, equivalently exactly when `escapeSpeedFractionOfC >= 1`, for several combinations.
7. `runRadialLightSpeedLaunch` returns `outcome: 'escapes'` whenever `evaluateBlackHole(gravitationalParameter, startDistance).isInsideHorizon` is `false`, and `outcome: 'falls-back'` whenever it is `true`, for several `(gravitationalParameter, startDistance)` pairs — confirming the two independent calculations (closed-form energy criterion and numerically integrated trajectory) always agree.
8. In the `falls-back` case, the trajectory's distance strictly increases at first, reaches a maximum, then strictly decreases back toward `startDistance` (a genuine rise-and-fall, not an immediate turnaround or a stall).
9. In the `escapes` case, the trajectory's distance is still strictly increasing at the last recorded point (confirming it is a genuine, ongoing escape, not a coincidental snapshot mid-turnaround).
10. Both functions are deterministic across repeated calls for the same inputs.
11. Invalid inputs (`gravitationalParameter <= 0`, `distance <= 0` or `startDistance <= 0`) throw for both functions, matching the validation pattern in `orbitExperiment.ts`.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiments 1–6 in this phase:

- **Before the run:** helps the learner form all three predictions; does not reveal the answer.
- **During the launch animation:** silent.
- **After the launch:**
  1. Observation: "What happened to the probe this time — did it escape, or fall back?"
  2. Prediction comparison: the learner's three predicted outcomes beside what actually happens as mass increases.
  3. Conceptual question: "The escape-speed formula says a big enough mass would need an escape speed faster than light. But nothing can go faster than light. So what actually happens instead?"
  4. Explanation: (1) escape speed grows with mass, exactly as in Experiment 6; (2) past some mass, the formula would require exceeding the speed of light, which Experiment 5 (in "Relativity of Time and Motion") already showed is impossible; (3) so instead, nothing — not even light — can escape from within the corresponding distance; that boundary is the event horizon, and the object inside it is a black hole; (4) this is not new physics — it's Experiment 6's escape speed, taken to its limit; (5) a historical note that this reasoning is genuinely how an 18th-century astronomer, John Michell, first imagined such objects in 1783, long before general relativity gave the correct full picture; (6) this used ordinary, first-order gravity, not the exact general-relativistic treatment a real black hole requires; (7) real black holes are real, and astronomers have directly imaged the region around two of them (M87's black hole in 2019, and Sagittarius A* in 2022, both via the Event Horizon Telescope); (8) this simple model stops well short of the real thing — real event horizons are described exactly by general relativity, and physicists also study a black hole's singularity (its very center) and a real but astronomically tiny effect called Hawking radiation, none of which this experiment's escape-speed picture covers.
  - The tutor may name real black holes, the Event Horizon Telescope, singularities, and Hawking radiation as real ideas beyond this model (point 7–8 above), but only as named facts, never as something this experiment's physics derives or computes. The exact general-relativistic description of a black hole, what happens after falling past the horizon, orbital motion, and light bending remain out of scope for this experiment.

---

## Decisions Needing Human Review

All items below were confirmed by the owner (2026-09-27).

1. **Choice of black holes over light bending.** Confirmed, on Claude's recommendation: it keeps the chapter's momentum most directly, reusing Experiment 6's own escape-speed machinery rather than requiring a new photon-trajectory physics model, which light bending would need.
2. **The Schwarzschild-radius "coincidence."** Confirmed to mention it — explicitly framed as a curious fact and a piece of real history (Michell's 1783 "dark star" reasoning), not as a proof or a claim that this experiment is deriving the real thing.
3. **Introducing a fixed numeric "speed of light" (`SPEED_OF_LIGHT = 2`) into Experiment 6's dimensionless units.** Confirmed. The exact placeholder value will be finalized at implementation time so the event horizon crosses the fixed launch distance within a reasonable, learner-explorable mass range, following the pattern already used for Experiment 5's and Experiment 6's own constants.
4. **Animated launch, not an instant readout.** Confirmed. Revised from the original instant-readout draft: the learner now watches an animated radial (straight-outward) launch at light speed, reusing Experiment 6's animated-playback pattern (`CLAUDE.md` §11), rather than a live, instantly-recalculated display. See "Physics Model" and "Experiment Behavior" above for the resulting design.
5. **Scope: no "launch from inside the horizon" demonstration using a sideways (orbital) launch.** Resolved by Claude, as invited by the owner: rather than omitting a launch demonstration entirely, the launch is restricted to purely radial (straight-outward) motion, which can never form an orbit — it can only escape or fall back — so the "stable orbit inside a real horizon" misconception this chapter must avoid never arises, while still giving the learner a real, animated, physically accurate demonstration of "even light-speed can't get out from here."
6. **Title** — "What Is a Black Hole?" — confirmed as final.

None of the learner-facing introduction, prediction, results, or tutor wording above has been reviewed yet (`CLAUDE.md` §28.1); all of it is draft, subject to revision.

---

## Success Criteria

1. The physics model reuses Experiment 6's escape-speed formula exactly, unchanged, adding only the event-horizon derivation, the fixed speed-of-light constant, and the new purely-radial trajectory calculation.
2. The learner predicts before the mass control and Launch button are revealed.
3. The launch is animated (`CLAUDE.md` §11), and its outcome always agrees with the closed-form `isInsideHorizon` result for the same mass.
4. The learner can, after the experiment, correctly explain that a black hole is what happens when escape speed would need to exceed the speed of light, and that this is why nothing — not even a light-speed launch — can escape past the event horizon.
5. The introduction and tutor state plainly that this uses the same first-order Newtonian gravity as Experiments 2, 3, 5, and 6, not the exact general-relativistic treatment a real black hole requires.
6. Real-world grounding is limited to named, verifiable facts (the Event Horizon Telescope's images of M87's black hole and Sagittarius A*, and light-touch, clearly-flagged mentions of singularities and Hawking radiation as real ideas this simple model does not attempt to model) — never invented numbers, and never presented as something this experiment's physics derives or computes. The exact general-relativistic description of a black hole, what happens after falling past the horizon, orbital motion, and light bending do not appear.

---

## Implementation Notes

Implemented per this specification: physics model and tests (`src/physics/blackHoleExperiment.ts`, `src/physics/blackHoleExperiment.test.ts`), interface, prediction, results panel, and tutor (`src/components/BlackHoleExperiment.tsx`, `src/components/BlackHoleTutor.tsx`), wired into the guided journey. Complete-flow tested in a browser for both outcomes (a small mass escaping and a large mass — inside the event horizon — falling back).

Final review against this specification (§21 Step 10) found one gap, fixed before completion: the tutor's explanation did not state the first-order-Newtonian-gravity caveat that Success Criterion 5 requires (the introduction had it; the tutor did not) — the same category of gap found and fixed in Experiment 6's own review. Fixed by adding a sixth explanation point to `BlackHoleTutor.tsx` stating this uses ordinary, first-order gravity, not the exact general-relativistic treatment a real black hole requires.

The owner's line-by-line wording approval (§28.1) is complete (2026-09-27). Two lines were revised early in the review (the introduction's "The question" now defines "concentrated" with a lead-vs-foam-ball example, and "What happens" now explains that the probe always launches from the same fixed point). The owner then asked, mid-review, for real-world grounding to be added throughout, "as much detail as possible," including real black-hole facts — a scope change from this specification's original "Not introduced" list, addressed above and reflected in the "Not introduced," Display, Results Display, AI Tutor Behavior, and Success Criteria sections. Implemented: a "Real black holes" paragraph in the introduction (the Event Horizon Telescope's 2019 and 2022 images), a real-world-grounding sentence in the results panel, tutor explanation points 7–8 (the same facts, plus a light-touch, clearly-flagged mention of singularities and Hawking radiation as real ideas beyond this model), a labeled legend plus a live distance/direction readout under the animation (the on-canvas approach from the original "Display" text was dropped in favor of a legend, since the event horizon circle can grow to overlap or exceed the other markers at high mass, making fixed on-drawing label positions unreliable), and a matching real-world sentence added to the chapter summary in `src/App.tsx`. Re-verified in a browser after these additions. The remainder of the review (predictions, remaining results/tutor wording, and the chapter summary) was then approved as written, with no further changes requested.
