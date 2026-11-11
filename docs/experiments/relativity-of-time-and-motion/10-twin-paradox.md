# Experiment 10: The Twin Paradox

**Status: APPROVED by the project owner.** All items under "Decisions Needing Human Review" are resolved. The title is final, not a working title — "the twin paradox" is the term's actual, standard name in physics.

**Implementation: complete.** Physics/simulation function (`runTwinParadoxExperiment` in `src/physics/twinParadoxExperiment.ts`) and its tests, interface (`src/components/Experiment10.tsx`), prediction, results panel, and tutor (`src/components/Experiment10Tutor.tsx`) are in place, following the design below, and wired into the guided journey (`src/App.tsx`, chapter 10). Complete-flow test done in a browser (intro → prediction → CALCULATE → results → all three tutor steps → chapter summary). Final review against this specification (§21 Step 10) is done — no gaps found; the implementation matches the spec exactly, including the intro and tutor wording, the physics interface and formulas, all five Required Physics Tests, the controls (no "0c" preset), and the exclusion list (no acceleration, general relativity, Doppler shift, or "radar time" reasoning anywhere in the component or tutor). The owner approved the wording on 2026-10-13 (recorded in `CLAUDE.md` §27 and `docs/DEVELOPMENT-STATE.md`; this header said "not yet done" until 2026-11-11, which was stale). A fault found later in the audit, the results and tutor naming the wrong twin as older, was fixed on 2026-11-02 (`9c3e0d2`); the review's "no gaps found" above predates it. The page was rebuilt in the audit of 2026-11-11: see "Audit Update (2026-11-11)" at the end, which wins where it differs from the text above.

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

Choices: "Same age" / "The Earth twin is older" / "The traveling twin is older". Not scored. START (or the equivalent reveal control) is disabled until a prediction is entered, matching Experiments 1–9. (From 2026-11-11 the control is called Run and the guess is drawn on the picture; see the Audit Update.)

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

A short, direct results panel (numeric, like Experiment 3 — no diagram in this experiment; a visual of the traveling twin's journey is a candidate for a later, separate experiment, see below). **Superseded on 2026-11-11 by the owner's approval of a two-bar picture of the two clocks (see "Audit Update (2026-11-11)"); the worldline diagram below is still a candidate for a later experiment.**

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

### Implementation notes (tutor)

- **Daily-life example (added 2026-09-26, at the owner's request, per `CLAUDE.md` §15).** A "A familiar version of this" paragraph was inserted into step 2, after the sentence stating the traveling twin changes direction and the Earth twin doesn't. It compares the asymmetry to two friends starting at the same corner — one stays put, the other walks to a store and back — illustrating only the "who turned around" fact, not any physics of aging, Doppler shift, or acceleration. This stays within the spec's exclusion list. The tutor already substituted real numbers throughout step 1, so no further math addition was needed, consistent with the spec's note that "no mathematics beyond what Experiment 3 already introduced" belongs here.

---

## Success Criteria

1. The traveling twin's elapsed time is computed entirely by calling Experiment 3's existing physics function on a round-trip lab duration — no independently recomputed relativistic value.
2. The learner predicts before seeing the result; the reveal control requires a prediction.
3. The results make visible, without inventing any new physics, that the traveling twin is unambiguously younger for any `v > 0`.
4. The tutor resolves the apparent paradox by pointing to the broken symmetry (the turnaround), not by asserting the answer without explanation.
5. The learner can describe, in their own words, why the two twins' situations aren't actually symmetric, and why that resolves the paradox.
6. No acceleration physics, general relativity, Doppler shift, or "radar time" reasoning is introduced.

---

## Audit Update (2026-11-11)

Built to `docs/audit/relativity-of-time-and-motion/10-draft-wording.md` (approved by the owner on 2026-11-11, "all defaults" to the sixteen questions in `10-gap-report.md`, with the owner's own decisions below). This section records what the page now does; where it differs from the text above, this section wins.

**Owner's decisions of 2026-11-11 beyond the defaults**
- "What breaks the tie" stays in the introduction as approved, and the daily-life paragraph is **expanded** (what steady motion feels like, what a change of speed or direction feels like, what the push is and is not), and ends with a pointer to the tutor.
- The links are **shown from the start with a spoiler warning**, because every page found says which twin is younger. The earlier default (hold them until after the tutor) was replaced at the owner's request.
- The tutor gains three steps explaining **how a turnaround leads to an age gap** (a clock counts its own path; why the Earth twin's view is the simple one; why the traveling twin cannot claim to be at rest). The optional "2.000 s jump" check (the "radar time" bookkeeping) was **left out**, so the exclusion list above still holds.

**What the page now does**
- **The page in four Parts.** Part 1 (amber): the one guess, **Run** (replacing CALCULATE) and the picture, fixed at 0.5c. Part 2 (pink): the speed (0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c, opening at 0.8c; still **no 0c**) and a picture that follows it, with "Runs so far". Part 3 (teal): the results, with a note under each block. Part 4 (blue): the tutor. The introduction, a collapsed "Words and formulas" box and the "Want to know more?" list sit above Part 1.
- **Parts 2, 3 and 4 appear when the Part 1 bars have stopped**, and `onComplete` fires then.
- **The picture (added; the specification above said "numeric only").** Two bars on one dark scale: "The Earth twin's clock (stays home)" in blue and "The traveling twin's clock (goes and returns)" in purple, growing together over a 4-second playback and stopping at the Earth twin's total. When they stop, a bracket "The gap" joins the bar ends, with its number. Playback speed never changes the totals. Part 2's picture uses pink for the learner's speed. The worldline diagram stays a candidate for a later experiment.
- **The guess marker (Predictions and the Real Results).** The guess has no size, so it is a white marker in a YOUR GUESS box joined by a dashed line: a level mark for "same age", an arrow up at the Earth twin's bar for "the Earth twin is older", an arrow down at the traveling twin's bar for "the traveling twin is older". The caption says it is only a marker. It appears with the bracket, never moves a bar, and is shown again beside the results as a tag. Part 2 has no marker.
- **Where the real picture comes from** is written under each picture: nothing measured; both bars calculated here from the speed of light, a 2 light-second trip each way and the moving-clock rule of "The moving clock"; the journey imagined.
- **Start over, not Change prediction.** "Start over" is always visible and greyed until there is something to clear and while a trip plays; the guess is locked after Run.
- **Results.** Speed, one-way distance, the two clock readings, the gap (with a "your guess" tag), the time dilation factor and the guess, with a "What these results tell us" note under each block. The old "It is actually..." line is gone. No check-up table and no setting-following table (the only reference is the formula itself).
- **Tutor.** Observe ("Look at the two bars..."), compare (names the white marker and gives the bar ends and the gap), conceptual (unchanged), then the explanation: 1 the traveling twin really is younger, 2 the twins are not in the same kind of situation (with the two friends), **3 a clock counts its own path (two drivers, 6 km and 10 km, and the twist that the detour gives the smaller clock reading), 4 why the Earth twin's view is the simple one (4 s out, 4 s back, 8.000 s; 8.000 × 0.866 = 6.928 s; no acceleration in the arithmetic), 5 why the traveling twin cannot claim to be at rest (their point of view changes at the turn; what counts as "the same moment" depends on who is moving)**, 6 that is what resolves the paradox, 7 nothing new happened, 8 your guess, marked (no score), 9 try it in Part 2 (0.1c and 0.8c gaps from the module). The tutor still never models acceleration, general relativity, Doppler shift or radar time.
- **Chapter titles replace chapter numbers** ("The moving clock"), and "light-second", "c" and "acceleration" are explained where first needed.
- **Words and formulas** (collapsed): twin paradox, elapsed time, age, Earth twin, traveling twin, round trip, turnaround, constant speed, acceleration, light-second, c, time dilation factor, and two formulas with worked examples at 0.4c and 0.6c, so the box gives no answer to the guess.
- **Links** (checked 2026-11-11 through helper agents, who returned the text of the Einstein Online pages but not their pictures): Einstein Online, "The case of the travelling twins" and "Twins on the road" (Markus Pössel, Max Planck Institute for Gravitational Physics, 2010), both under a spoiler warning. Gaps recorded (§29 rule 3(c)): the Fermilab twin-paradox pages and the Hafele and Keating papers (*Science* 177, 1972) returned HTTP 403 and were not read, so they are not linked; a NIST page on aluminum atomic clocks (2010) was found but not fetched; no plain official page found for the light-second; a NASA Goddard "Ask an Astrophysicist" answer was read but not linked (a long page of unrelated questions, loosely worded); the experiment has no real result of its own, so no paper is linked.
- **Physics module** (`src/physics/twinParadoxExperiment.ts`, tested): the model is unchanged; added `olderTwin` (moved from the component's fixed `actualOutcome`, which is gone), `twinClocksAt` (both clocks at a fraction of the trip, for the playback), `twinBarScaleEnd`, `guessMarkerFor`, `markTwinGuess` and `twinWorkedNumbers`. The file has 17 tests (6 original plus 11 new). Components: `Experiment10.tsx`, `Experiment10Pictures.tsx` (the bars and captions), `Experiment10Tutor.tsx` (with the exported `Experiment10Explanation`); `Experiment10.test.tsx` has 12 render tests (it replaces `Experiment10.test.ts`).

**Not checked.** Narrow widths, other browsers, keyboard use and a real learner; the tutor's steps 4 to 9 were not viewed in the browser, only the start of the explanation; the helpers' summaries of the Einstein Online pages were not compared with the pages by the agent.
