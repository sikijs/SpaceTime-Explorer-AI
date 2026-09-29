# Gravitational Waves — Experiment 1: Ripples in Spacetime

**Status: approved specification (`CLAUDE.md` §23 Stage 4, approved by the owner as written, 2026-09-29). Not yet implemented.** Numbering restarts within this new phase, following the pattern already used when "Gravity and Curved Spacetime" began (`CLAUDE.md` §27).

This specification was drafted per `CLAUDE.md` §23 Stage 3, following the proposal Claude Code made in conversation on 2026-09-29, in response to the milestone set after Gravity and Curved Spacetime's Experiment 9 (the project's confirmed closing experiment of its current two-chapter arc). All items under "Decisions Confirmed" below were settled with the owner in that conversation, before this file was written.

---

## Overview

Experiment 4 (Curved Spacetime) showed that two paths, each "as straight as possible," can still converge if the space they move through is curved — and that a planet's real gravity does exactly this to falling objects (Experiment 3's tidal effect). Both of those experiments treated curvature as *static*: a fixed shape, present because a mass sits there.

This experiment shows that spacetime's curvature isn't always static. A sufficiently violent event — two black holes or two neutron stars spiraling into each other — sends a ripple of curvature outward through spacetime itself, at the speed of light. As that ripple passes any given point, it does the same kind of thing Experiment 4's curved surface did to the two travelers: it changes the distance between free-floating objects that aren't pushing on each other at all. The difference is that this time the effect oscillates — stretching one direction while squeezing the perpendicular direction, then swapping back — rather than pulling steadily toward a center.

This is not a thought experiment. On September 14, 2015, the LIGO detectors measured exactly this kind of ripple, arriving from two black holes that collided roughly 1.3 billion light-years away — the first direct detection of a gravitational wave, and one of the most demanding measurements ever made.

---

## Learning Objective

After this experiment, the learner should understand:

1. Spacetime curvature can travel — a violently accelerating mass sends a ripple of curvature outward at the speed of light, called a **gravitational wave**.
2. As a gravitational wave passes, it stretches space in one direction while squeezing it in the perpendicular direction, then reverses, over and over — changing the distance between free-floating objects with nothing pushing on them.
3. This is the same underlying idea as Experiment 4's converging travelers (paths that are each "as straight as possible" still moving relative to each other because the space itself is curved) — except the curvature here oscillates in time instead of staying fixed.
4. LIGO directly detected a real gravitational wave in 2015 (event GW150914, from two colliding black holes), confirming a 100-year-old prediction of general relativity, and has detected many more since, including from colliding neutron stars (GW170817).
5. Measuring this effect on Earth is extraordinarily hard, because the real stretching is unimaginably small — which is why LIGO's detectors use multi-kilometer arms and extremely precise instruments, and why this experiment must exaggerate the effect enormously to make it visible at all.

---

## Physical Situation

An L-shaped arrangement of free-floating test masses in otherwise empty, flat spacetime — deliberately mirroring the real shape of a LIGO detector: two perpendicular "arms," each starting at the same fixed rest length. Nothing is pushing or pulling the test masses directly; they simply sit still relative to each other, as in Experiment 4's flat surface, until a wave passes.

When a gravitational wave passes through (arriving face-on, the simplest case, matching a real "plus-polarized" wave), one arm's length oscillates slightly longer while the perpendicular arm oscillates slightly shorter, and then they swap — over and over, at the wave's frequency — before settling back to the original rest length once the wave has passed.

### Simplifying assumptions (must be stated to the learner, in plain language)

- The wave's effect is shown hugely exaggerated. A real gravitational wave from a real black-hole collision changes a distance by about 1 part in 10²¹ — for the ~4 km arms of a real LIGO detector, about one-thousandth the width of a proton. This experiment's control is a dimensionless, exaggerated stand-in, the same kind of abstraction used by Experiments 2, 3, and most of this project's controls (a deliberate departure from Experiment 9's real-number approach, appropriate here because the real values are not just small but genuinely unshowable at any visual scale).
- The wave arrives "face-on" to the detector arms (the simplest, most visible orientation) and at a single, constant frequency and amplitude for the whole run — real waves from a real spiraling collision actually grow in both frequency and amplitude right up until the moment of collision (called a "chirp"), which this experiment does not model.
- Only the simplest wave shape ("plus polarization," stretching along one arm while squeezing the perpendicular arm) is shown; a second, rotated pattern ("cross polarization") that also exists in general relativity is left out entirely.
- The two arms are treated as one-dimensional line segments with test masses at each end; no attempt is made to model an actual laser-interferometer measurement.

### Not introduced

The Einstein field equations, wave polarization beyond the single "plus" pattern, the chirp/inspiral waveform shape, how a real laser interferometer measures the length change, and the general concept of "energy carried away by radiation" (candidates for a possible later experiment, not this one).

---

## Physics Model

A new, self-contained oscillation model — this experiment does not reuse a previous experiment's core formula (unlike most of this phase), since no earlier experiment modeled a time-varying wave. It does reuse Experiment 4's underlying idea (geodesic deviation: free-floating separations changing because of curvature, not force) as its conceptual grounding, stated explicitly in the introduction and tutor text.

```typescript
// src/physics/gravitationalWaveExperiment.ts
export const BASE_ARM_LENGTH = 1 // dimensionless rest length, matches this project's other abstracted-unit experiments

export interface GravitationalWaveState {
  time: number
  strain: number             // dimensionless, oscillates between -amplitude and +amplitude
  armXLength: number
  armYLength: number
}

export function gravitationalWaveStateAt(
  time: number,               // >= 0
  amplitude: number,          // dimensionless strain amplitude, > 0
  frequency: number           // oscillations per unit time, > 0
): GravitationalWaveState
```

```
strain      = amplitude * sin(2 * PI * frequency * time)
armXLength  = BASE_ARM_LENGTH * (1 + strain / 2)
armYLength  = BASE_ARM_LENGTH * (1 - strain / 2)
```

Structured independently of any UI, per `CLAUDE.md` §9. An animation loop is required (see "Display") — this is the first experiment in the Gravity and Curved Spacetime lineage to show a periodic process over simulated time rather than a single run-to-completion or live-slider comparison, so `CLAUDE.md` §11 (simulation time separate from wall-clock time and playback speed) applies directly: playback speed must not change `frequency`, `amplitude`, or the resulting `strain` values, only how quickly simulated time advances on screen.

---

## Learner Controls

- **Wave amplitude**, a dimensionless slider (exaggerated, e.g. 0 to 0.4) controlling how strongly the arms stretch and squeeze.
- **Wave frequency**, a dimensionless slider controlling how fast the oscillation repeats.
- Three labeled source presets that set amplitude and frequency together, framed as relative comparisons (not real physical units, consistent with the "exaggerated, abstracted" decision above): **Distant / weak source**, **Typical detected event (e.g., GW150914-like)**, **Strong / nearby source** — giving the learner a felt sense that real events vary enormously in how strong a signal they produce, without claiming these are real numbers.
- **Run**, which plays the oscillation forward over a fixed number of cycles (e.g., 4–6) and then stops, matching the run-to-completion pattern used by Experiments 1–8 in the previous chapter (unlike Experiment 9's live-slider pattern, since this experiment's whole point is watching a *process over time*, not comparing static states).

The amplitude, frequency, and preset controls are disabled until all predictions are entered (see below), matching the rest of the project.

---

## Prediction Activity

Before the controls and results are shown, the learner is asked two questions, in order:

1. "When a gravitational wave passes through the two perpendicular arms, do you think both arms stretch and squeeze together (the same way, at the same time), or do they do opposite things?" (Same way / Opposite ways)
2. "After the wave has completely passed, do you think the arms end up longer than they started, shorter, or back to their original length?" (Longer / Shorter / Back to original)

Choices are not scored. The controls are disabled until both predictions are entered.

---

## Experiment Behavior

### Introductory text (draft wording — pending the owner's line-by-line approval after implementation, `CLAUDE.md` §28.1, following the pattern used throughout this project)

> **The question.** Experiment 4 showed that curved space can make two straight-as-possible paths drift together. But can spacetime's curvature itself move — can it travel somewhere, like a ripple on a pond? And if it did, could we ever actually detect it?
>
> **What happens.** You'll watch two perpendicular "arms" of free-floating points, set up the same way a real gravitational-wave detector is built. When a wave passes through, you'll see one arm stretch while the other squeezes, over and over, before both settle back to normal.
>
> **Your job.** Try different wave strengths and speeds — including a strength modeled on a real detected event — and watch what the two arms do, together and compared to each other.
>
> **What we assume.** The effect here is hugely exaggerated — a real gravitational wave changes a real detector's arms by about one-thousandth the width of a single proton, far too small to show at any visible scale. The wave here also arrives at one constant strength and speed for simplicity; real events (like two black holes spiraling together) actually build up in both strength and speed right until the moment of collision.
>
> **A real detection.** On September 14, 2015, two detectors called LIGO — built in the shape you're about to see, with arms 4 kilometers long — measured a real gravitational wave arriving from two black holes that had collided 1.3 billion light-years away. It was the first time anyone had directly detected one, confirming a prediction Einstein made a century earlier. LIGO has since detected dozens more, including one from two colliding neutron stars in 2017 that was also seen by ordinary telescopes moments later.

### Display

Two perpendicular line segments (the "arms"), drawn from a shared corner point, each with a marker at its far end showing its current length. As the wave passes (during "Run"), the two arm-length markers visibly move — one arm's marker moving outward as the other moves inward, then reversing — with a live numeric readout of both arm lengths and the current strain value. A graph plots both arm lengths against simulated time as the run plays.

### Run

Matches the run-to-completion pattern of Experiments 1–8 in the previous chapter: pressing "Run" (enabled only after both predictions are entered) plays the oscillation forward through several full cycles and stops, triggering the "Results" state (for the check mark and tutor, per `App`'s `onComplete` convention). The learner can press "Run" again, at a newly chosen amplitude/frequency, to see another run — matching the "explore further after results" pattern added to Experiment 9 (see its "Implementation Notes").

---

## Results Display

- The chosen amplitude and frequency (or preset name, if a preset was used).
- Both arms' minimum and maximum lengths during the run, and by how much each stretched/squeezed relative to the rest length.
- A plain-language statement confirming the two arms move in opposite ways (one stretches while the other squeezes) and that both return to their original length once the wave passes.
- One paragraph of real-world grounding: LIGO's 2015 detection (GW150914) and its real ~4 km arm length, with the real strain magnitude (~1 part in 10²¹) named explicitly and contrasted with this experiment's deliberately exaggerated version.
- The learner's two predictions, shown beside what actually happened in the run.

---

## Expected Observations

1. While the wave passes, one arm's length increases while the other's decreases, and they swap repeatedly — never both stretching or both squeezing at once.
2. The two arms' deviations from the rest length are equal and opposite at every moment (the same |strain|/2 deviation, opposite sign).
3. After the run completes, both arms return to exactly the original rest length.
4. A larger amplitude produces a bigger swing in both arms; a higher frequency produces faster swings, without changing how large the swings are.
5. The "typical detected event" preset produces a visibly noticeable effect in this exaggerated model, in clear contrast with the real-world-grounding paragraph's stated real magnitude, which is unshowably small.

---

## Expected Learner Understanding

The learner should be able to say: "A gravitational wave is a ripple of curvature traveling through spacetime itself, caused by a violently accelerating mass like two colliding black holes. As it passes a point, it stretches space one way while squeezing it the perpendicular way, then swaps back and forth, before things return to normal — the same kind of curvature effect as Experiment 4's converging travelers, just moving instead of fixed in place. This isn't hypothetical: LIGO actually detected one in 2015, using detectors built in exactly this L-shape, even though the real effect is almost unbelievably small — about a thousandth the width of a proton over a 4-kilometer arm."

---

## New Concepts Introduced

1. **Gravitational wave** — a traveling ripple of spacetime curvature, as opposed to the static curvature of Experiments 3–9.
2. **Strain** — the dimensionless fractional stretch/squeeze a gravitational wave produces, named explicitly as the same kind of quantity real detectors measure.
3. **LIGO and a real detected event (GW150914)** — the project's second use of real, named, verifiable facts (after Experiment 9), now for an event rather than a continuously operating system.

---

## Relationship to Previous Experiments

- Reuses Experiment 4's core idea (geodesic deviation: free-floating separations change because of curvature, not a force) directly, now applied to a curvature that changes over time instead of staying fixed.
- Reuses Experiment 3's "tidal effect" framing (things drift together or apart without anything touching them) as the intuition for why a wave passing through can change a distance with nothing pushing on it.
- Follows Experiment 9's real-world-grounding practice (a named, verifiable, real event and real numbers, clearly distinguished from the experiment's own exaggerated model) and its precedent for departing from earlier chapters' pure abstraction when a real detection is directly relevant and checkable.
- Is the first experiment in the project to model an oscillating process over simulated time in this phase, applying `CLAUDE.md` §11 (simulation time vs. wall-clock/playback speed) in a new way: playback speed must not change the frequency or amplitude of the physical oscillation itself.

## Relationship to Later Experiments

None currently proposed. This is the first (and, unless the owner asks otherwise, likely only) experiment in a new "Gravitational Waves" phase — plausible as a short, self-contained coda to the project's two existing chapters rather than the start of another multi-experiment build-up, matching the recommendation confirmed with the owner (2026-09-29). A deeper treatment (detection method, wave polarization, the chirp waveform, multiple real events in more depth) remains a candidate for a future milestone, not approved or planned here.

---

## Required Physics Tests

1. `strain` at `time = 0` is `0` for any valid `amplitude`/`frequency` (since `sin(0) = 0`).
2. `strain` oscillates strictly between `-amplitude` and `+amplitude` over a full period.
3. `armXLength` and `armYLength` deviate from `BASE_ARM_LENGTH` by exactly equal and opposite amounts at every `time` (`armXLength - BASE_ARM_LENGTH === -(armYLength - BASE_ARM_LENGTH)`, to within floating-point tolerance).
4. Doubling `frequency` exactly halves the oscillation's period (time to return to the same `strain` value moving in the same direction).
5. Scaling `amplitude` scales the peak deviation of both arm lengths proportionally.
6. At `amplitude = 0`, `armXLength` and `armYLength` equal `BASE_ARM_LENGTH` for all `time`.
7. At `time` equal to one full period (`1 / frequency`), `strain` returns to its `time = 0` value (periodicity), within a small numerical tolerance.
8. The function is deterministic across repeated calls for the same inputs.
9. `amplitude <= 0` or `frequency <= 0` throws, matching the validation pattern in `orbitExperiment.ts`, `blackHoleExperiment.ts`, and `gpsTimeDilationExperiment.ts`.
10. `time < 0` throws.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiments 1–9 in the previous chapter:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "What did you notice about the two arms while the wave was passing — did they do the same thing at the same time, or opposite things?"
  2. Prediction comparison: the learner's two predicted answers beside what actually happened.
  3. Conceptual question: "Experiment 4 showed that curvature can make straight-as-possible paths drift together, even with nothing pushing on them. How is what you just saw similar — and how is it different?"
  4. Explanation: (1) a gravitational wave is a ripple of spacetime curvature that travels, caused by a violently accelerating mass; (2) as it passes, it stretches one direction while squeezing the perpendicular direction, then swaps, because that's the specific shape ("polarization") this kind of curvature ripple takes; (3) this is the same underlying idea as Experiment 4's converging travelers — a changing separation between free-floating objects caused by curvature, not a force — except now the curvature itself is moving and oscillating rather than fixed; (4) this experiment exaggerates the effect enormously, because the real effect is astonishingly small — about a thousandth of a proton's width over a real 4-kilometer detector arm; (5) LIGO actually measured this in 2015, from two colliding black holes 1.3 billion light-years away, confirming a prediction Einstein made in 1916, and has detected many more collisions since, including one seen by ordinary telescopes at the same time.
  - The tutor may name LIGO, GW150914, and GW170817 as verifiable real facts, but must not explain the details of laser interferometry, wave polarization beyond the single pattern shown, or the chirp waveform shape — out of scope for this experiment.

---

## Decisions Confirmed

All items were confirmed by the owner in conversation on 2026-09-29.

1. **Using an abstracted, exaggerated dimensionless strain control**, rather than attempting to show real relative magnitudes even in a "zoomed in" view. Confirmed (Claude's recommendation, accepted): the real effect (~1 part in 10²¹) is not just small but genuinely unshowable at any visual scale, unlike Experiment 9's real-but-correctable GPS numbers — so this experiment returns to the project's more common abstracted-control pattern, with the exaggeration stated plainly to the learner.
2. **A constant-frequency, constant-amplitude wave for this first pass**, rather than modeling the "chirp" (frequency/amplitude increasing as an orbiting source spirals in). Confirmed (Claude's recommendation, accepted): keeps the physics model to one new oscillation formula; the chirp is mentioned to the learner as a stated real fact, not modeled.
3. **A new named phase, "Gravitational Waves,"** in the sidebar, rather than an addendum appended to the already-closed "Gravity and Curved Spacetime" chapter. Confirmed (Claude's recommendation, accepted): keeps Experiment 9's "Closing Synthesis" intact as that chapter's true ending, and matches how `CLAUDE.md` already refers to gravitational waves as a candidate "further chapter."
4. **Title** — "Ripples in Spacetime: Gravitational Waves". Confirmed.
5. **A deeper real-world-grounding treatment** than Experiments 7–9 used: naming LIGO's real ~4 km arm length, the real strain magnitude, and a second real event (GW170817, the neutron-star merger also seen by telescopes), rather than a single light-touch sentence. Confirmed (owner's explicit choice, overriding Claude's "moderate" recommendation).

---

## Success Criteria

1. The physics model is a new, self-contained oscillation formula (per "Physics Model" above), explicitly grounded in Experiment 4's geodesic-deviation idea in the learner-facing text, without re-deriving or duplicating Experiment 4's own geometry code.
2. The learner predicts before the controls and results are shown.
3. The results correctly show the two arms deviating equally and oppositely from the rest length, and returning to the rest length once the run completes.
4. The learner can, after the tutor conversation, state that a gravitational wave is a traveling ripple of spacetime curvature that stretches and squeezes free-floating separations, that this is the same underlying idea as Experiment 4 applied to a moving curvature, and that LIGO has really detected this.
5. The introduction, results panel, and tutor state plainly that this experiment's effect is deliberately, enormously exaggerated compared to the real value, and name the specific simplifying assumptions still in play (constant frequency/amplitude, single "plus" polarization, no real detection-hardware modeling).
6. Real-world grounding is limited to named, verifiable facts (LIGO's real arm length, the real strain magnitude, GW150914, GW170817) — never invented numbers presented as real.
7. `CLAUDE.md` §11 (simulation time vs. wall-clock/playback speed) holds: changing animation playback speed does not change `frequency`, `amplitude`, or any computed `strain`/arm-length value.

---

## Implementation Notes

Not yet implemented. To be filled in per `CLAUDE.md` §21 once physics, tests, interface, prediction, results, and tutor are built, and again after complete-flow testing and final review (§21 Step 10).
