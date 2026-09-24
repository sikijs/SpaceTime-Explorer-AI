# Experiment 10: The Twin Paradox

**Status: APPROVED by the project owner.** All items under "Decisions Needing Human Review" are resolved. The title is final, not a working title — "the twin paradox" is the term's actual, standard name in physics.

**Implementation: complete.** Physics/simulation function (`runTwinParadoxExperiment` in `src/physics/twinParadoxExperiment.ts`) and its tests, interface (`src/components/Experiment10.tsx`), prediction, results panel, and tutor (`src/components/Experiment10Tutor.tsx`) are in place, following the design below, and wired into the guided journey (`src/App.tsx`, chapter 10). Complete-flow test done in a browser (intro → prediction → CALCULATE → results → all three tutor steps → chapter summary). Final review against this specification (§21 Step 10) is done — no gaps found; the implementation matches the spec exactly, including the intro and tutor wording, the physics interface and formulas, all five Required Physics Tests, the controls (no "0c" preset), and the exclusion list (no acceleration, general relativity, Doppler shift, or "radar time" reasoning anywhere in the component or tutor). The owner's line-by-line wording approval (§28.1) has not yet been done — the learner-facing text is still a first draft.

## Overview

Experiment 3 taught the learner a single fact: a clock moving relative to an observer ticks slower than the observer's own clock. Experiment 10 takes that same fact and applies it to a complete round trip, using it to resolve a famous apparent contradiction — the "twin paradox."

Two twins start the same age. One (call them the Traveler) boards a ship and travels at a constant, very high speed to a distant point, then turns around and comes back at the same speed. The other (the Earthbound twin) never moves from the lab. When the Traveler returns, the two compare ages.

Here is the apparent contradiction: from the Earthbound twin's point of view, the Traveler's clock is moving, so it runs slow — the Traveler should be younger when they return. But relative motion goes both ways: from the Traveler's point of view (while cruising at constant speed), it's the Earthbound twin who is moving, so *that* clock should run slow instead. Both twins seem to have an equally good argument that the *other* one aged less. They cannot both be right. Something has to break the symmetry — and the experiment's job is to show the learner what, and why the Traveler is unambiguously the one who ages less.

This experiment introduces no new relativistic calculation. It reuses Experiment 3's exact time-dilation function, applied to a round-trip lab duration instead of a single tick.

---

## Learning Objective

After this experiment, the learner should understand:

1. The situation is *not* actually symmetric, even though it can look that way at first: the Traveler changes direction partway through the trip, and the Earthbound twin never does.
2. Because of that asymmetry, the Traveler's total elapsed time over the whole round trip is genuinely less than the Earthbound twin's — not a difference of opinion or point of view, but something both twins agree on when they're back together in the same place, at the same time, comparing the same two clocks.
3. This isn't a new physical effect. It's the same time dilation from Experiment 3, just added up over an entire journey instead of a single tick.
4. The "paradox" is only a paradox if you (incorrectly) assume both twins are in an equally valid, unchanging point of view the whole time. They aren't.

---

## Physical Situation

### Reused from Experiment 3

The exact time-dilation relationship from Experiment 3 (`runMovingClockExperiment` in `src/physics/movingClockExperiment.ts`): a clock moving at speed `v`, for a given lab-frame duration, reads a shorter elapsed time by the factor `√(1 − v²/c²)`. Nothing about that relationship is changed or recomputed here.

### What is new

A *simulation*-layer setup (not a new physics formula — see `AGENTS.md`, "Separation of Responsibilities") that describes a round trip: the Traveler moves away from Earth at speed `v`, covers a fixed one-way distance, turns around, and returns at the same speed. This determines a lab-frame duration for the whole trip, which is then handed directly to Experiment 3's own function to find the Traveler's elapsed time.

### Simplifying assumptions (all must be stated to the learner, in plain language)

- Flat spacetime: no gravity (same as Experiments 3–9).
- The Traveler moves at a constant speed `v` on the way out and the same constant speed `v` on the way back — no gradual speeding up or slowing down.
- **The turnaround itself is treated as instantaneous, and what physically happens during it is not modeled here.** This is a deliberate simplification: real acceleration and deceleration would take time and involve physics beyond this app's scope (and beyond special relativity's flat-spacetime, constant-velocity assumptions used everywhere else in this app). Because the turnaround can be made arbitrarily brief without changing the two constant-speed legs before and after it, treating it as an instant is a standard, well-accepted simplification, not a new physical claim.
- Both twins are the same age when the Traveler departs.
- The one-way distance to the far point is fixed for this experiment (see Learner Controls).

### Not introduced

Acceleration as a modeled physical process, general relativity, any description of what either twin *sees* (visually, via Doppler-shifted light) during the trip, the "radar time" method some textbooks use to resolve the paradox in more detail, and any scenario beyond this single there-and-back journey.

---

## Physics Model

No new relativistic calculation. A new *simulation* function sets up the round trip and hands off to Experiment 3's existing physics:

```typescript
export interface TwinParadoxResult {
  distance: number // light-seconds, one-way
  velocity: number // fraction of c
  labElapsedTime: number // total round-trip time for the Earthbound twin
  travelerElapsedTime: number // total elapsed time for the Traveler
  ageDifference: number // labElapsedTime - travelerElapsedTime
  timeDilationFactor: number // reused from Experiment 3's runMovingClockExperiment
}

export function runTwinParadoxExperiment(distance: number, velocity: number): TwinParadoxResult
```

```
oneWayLabTime   = distance / velocity
labElapsedTime  = 2 * oneWayLabTime
travelerElapsedTime = runMovingClockExperiment(labElapsedTime, velocity).movingClockElapsedTime
ageDifference   = labElapsedTime - travelerElapsedTime
```

`runTwinParadoxExperiment` performs no relativistic calculation of its own — the only new arithmetic is `distance / velocity` and doubling it to get a lab duration; the actual time-dilation result comes directly from calling `runMovingClockExperiment`, unmodified.

---

## Learner Controls

- **Speed of the Traveler:** 0.1c, 0.3c, 0.5c, 0.8c, or Other from 0.01c to 0.9c. **No "0c (at rest)" preset** — unlike prior experiments, `v = 0` would mean the Traveler never reaches the far point, so the round trip never completes. This is a necessary difference from the control pattern used in Experiments 3–9, not an oversight.
- **One-way distance:** fixed at **2 light-seconds** (proposed default — the owner may adjust this). Not a learner control, matching the pattern of fixing one quantity (Experiment 3's tick length, Experiments 6–9's rod length) and varying only speed.

---

## Prediction Activity

Before the result is revealed, the learner is shown the setup (both twins starting at the same age, the Traveler's speed they chose) and asked:

> Two twins start at the same age. One stays on Earth. The other travels away at [chosen speed]c, turns around, and comes back at the same speed. When they're back together, comparing the same two clocks: are they the same age, is the Earth twin older, or is the traveling twin older?

Choices: "Same age" / "The Earth twin is older" / "The traveling twin is older". Not scored. START (or the equivalent reveal control) is disabled until a prediction is entered, matching Experiments 1–9.

---

## Experiment Behavior

### Introductory text (plain-language draft — for the owner's approval, `CLAUDE.md` §28.1)

Drafted at a true-layman reading level: short sentences, one idea per sentence, anchored to what the learner already knows from Experiment 3, with a concrete example, no unexplained terms.

> **The question.** Imagine two twins, the same age. One of them boards a spaceship and travels away from Earth at a very high speed, turns around, and comes back. The other twin just stays home. When the traveling twin gets back, are they still the same age?
>
> **Why this seems like it shouldn't matter.** You already know, from Experiment 3, that a moving clock ticks slower than a clock that isn't moving. So it seems easy: the traveling twin's clock is the one that's moving, so they come back younger. But here's the catch — motion is relative. While the ship is cruising at a constant speed, the twin on the ship could just as fairly say *they're* holding still and it's the Earth twin who is moving away and coming back. By that reasoning, the Earth twin should be the younger one instead. Both arguments can't be right at the same time. This is called **the twin paradox**, and it isn't really a paradox — it's a puzzle with a definite answer, and this chapter shows you why.
>
> **What breaks the tie.** There's one thing that isn't the same for both twins: only the traveling twin turns around. The Earth twin stays put the whole time. That difference — not just "who is moving," but who changes direction — is what settles the question, and you're about to see it happen.
>
> **What you're about to do.** Choose a speed for the traveling twin's trip. Before we calculate the result, make a prediction: when the twins are reunited, will they be the same age, will the Earth twin be older, or will the traveling twin be older?
>
> **What we assume.**
> - There's no gravity involved — just steady motion (same as Experiments 3–9).
> - The ship travels at a constant speed on the way out, and the same constant speed on the way back.
> - We treat the ship's turnaround as instantaneous — happening all at once, rather than gradually slowing down and speeding back up. What actually happens during that quick turnaround isn't part of this experiment; we only look at before and after it.
> - Both twins start at exactly the same age when the ship departs.

### Display

A short, direct results panel (numeric, like Experiment 3 — no diagram in this experiment; a visual of the traveling twin's journey is a candidate for a later, separate experiment, see below).

### Run

Static, like Experiment 3: pressing the reveal control computes and displays the full result at once. No animation needed — there's no visual scene to play out, only two ages to compare.

---

## Results Display

- Chosen speed.
- One-way distance (2 light-seconds, so the learner sees the fixed value being used).
- Earth twin's elapsed time (the round-trip lab duration).
- Traveling twin's elapsed time.
- Age difference (Earth twin's time − traveling twin's time).
- The time dilation factor (already introduced in Experiment 3's results, reused here).
- The learner's prediction, shown beside the actual outcome.

---

## Expected Observations

1. At every tested speed `v > 0`, the traveling twin's elapsed time is less than the Earth twin's — the traveling twin is always the younger one upon return.
2. The age difference grows as speed increases.
3. The relationship matches Experiment 3 exactly: the traveling twin's elapsed time equals the round-trip lab duration multiplied by the same `√(1 − v²/c²)` factor from Experiment 3.

---

## Expected Learner Understanding

The learner should be able to say: "It looks like a contradiction at first, because motion is relative and each twin could say the other one is moving. But the two twins aren't actually in the same situation: only the traveling twin turns around. That difference breaks the symmetry, and it's why, when they're back together comparing the same two clocks, they both agree the traveling twin aged less. It's not a matter of opinion — it's the same time dilation from Experiment 3, just added up over the whole trip."

---

## New Concepts Introduced

1. **The twin paradox** as a named idea: the apparent (but resolvable) contradiction that arises from applying time dilation to a round trip.
2. The general idea that changing direction (needing to turn around) breaks the symmetry between two observers who would otherwise each have an equally valid claim that the other's clock runs slow. This is explained conceptually, without naming or modeling acceleration as a physical process.

No mathematics beyond what Experiment 3 already introduced (the time dilation factor) is required.

---

## Relationship to Previous Experiments

- **Experiment 3 (moving clock):** this experiment's entire physics result is Experiment 3's `runMovingClockExperiment`, applied to a round-trip lab duration instead of a single tick. No new relativistic formula.
- **Experiment 2 (two clocks at rest):** the Earth twin's own reference frame (never changing) is what Experiment 2 already established as the baseline "at rest" case.

## Relationship to Later Experiments

None approved. A visual companion piece — a spacetime diagram (reusing Experiments 8/9's diagram infrastructure) showing the Earth twin's straight vertical worldline against the Traveler's V-shaped one, with the turnaround as the bend in the V — is a natural, visually compelling candidate for a later experiment, but is explicitly not part of this proposal, to keep this experiment's scope small and numeric, matching Experiment 3's own style.

---

## Required Physics Tests

1. `runTwinParadoxExperiment` performs no independent relativistic calculation: `travelerElapsedTime` for a given `(distance, velocity)` is exactly `runMovingClockExperiment(2 * distance / velocity, velocity).movingClockElapsedTime` — cross-checked directly against Experiment 3's own function, not a duplicated formula.
2. `labElapsedTime` equals `2 * distance / velocity` exactly, for every tested speed and the fixed distance.
3. For every tested `v > 0` (matching Experiments 3, 6–9's discrete speed-array test pattern): `ageDifference > 0`, and `ageDifference` strictly increases as `v` increases, for the fixed distance.
4. Invalid inputs are rejected consistently with Experiment 3's own guard clauses (`distance > 0`; `0 < velocity < c` — note `velocity = 0` is invalid here, unlike Experiment 3, since the trip would never complete).
5. Deterministic across repeated calls; independent of any UI or animation state.

---

## AI Tutor Behavior

Follows the pattern of Experiments 3–9: no pre-run step beyond helping with the prediction, each step after the reveal needs a typed answer, plain language throughout.

- **After the result is revealed:**
  1. Observation: "Look at the two ages. Is the traveling twin younger, older, or the same age as the Earth twin?"
  2. Prediction comparison: the learner's predicted outcome beside the actual one.
  3. Conceptual question: "Both twins could argue the other one's clock should run slow, since motion is relative. But only one of them turns around. Why do you think that difference matters?"
  4. Explanation, tied to what's on screen: (1) the traveling twin is younger — genuinely, not just from one point of view; (2) the two twins are not actually in symmetric situations: the Earth twin never changes direction, the traveling twin does; (3) that asymmetry is what allows both twins to agree, once reunited, on who aged less — there's no contradiction, because the "each one thinks the other is moving" reasoning only holds while both stay at constant velocity, and the Traveler doesn't; (4) the numbers themselves are nothing new — it's Experiment 3's time dilation, applied to the whole round trip.
  - The tutor must not introduce acceleration as a modeled physical process, general relativity, Doppler shift, or the "radar time" method; those are outside this specification.

---

## Decisions Needing Human Review

Resolved by the project owner during Stage 1/2 of this proposal (see `CLAUDE.md` §23):

1. **Turnaround handling — resolved.** Idealized, instantaneous turnaround, explicitly stated as an assumption. No acceleration is modeled.
2. **Prediction style — resolved.** Three choices ("same age" / "Earth twin older" / "traveling twin older"), to surface both the naive-symmetry misconception and its reverse.
3. **Diagram vs. numeric — resolved.** Numeric only, matching Experiment 3's style. A spacetime-diagram companion piece is left as a candidate for a separate, later experiment.
4. **One-way distance — resolved.** Fixed at 2 light-seconds, as proposed.
5. **Preset speed range — resolved.** 0.1c, 0.3c, 0.5c, 0.8c, Other (0.01c–0.9c), matching Experiments 6–9's range, minus the "0c (at rest)" option (see Learner Controls).
6. **Title — resolved (final).** "The Twin Paradox" — not a working title, since it's the term's actual, standard name in physics.

---

## Success Criteria

1. The traveling twin's elapsed time is computed entirely by calling Experiment 3's existing physics function on a round-trip lab duration — no independently recomputed relativistic value.
2. The learner predicts before seeing the result; the reveal control requires a prediction.
3. The results make visible, without inventing any new physics, that the traveling twin is unambiguously younger for any `v > 0`.
4. The tutor resolves the apparent paradox by pointing to the broken symmetry (the turnaround), not by asserting the answer without explanation.
5. The learner can describe, in their own words, why the two twins' situations aren't actually symmetric, and why that resolves the paradox.
6. No acceleration physics, general relativity, Doppler shift, or "radar time" reasoning is introduced.
