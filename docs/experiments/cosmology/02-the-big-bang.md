# Cosmology — Experiment 2: The Big Bang (Running Expansion Backward in Time)

**Status: approved (2026-10-05), per `CLAUDE.md` §23 Stages 1–4, following the completion of Cosmology Experiment 1 (Hubble's Law). All five "Decisions Confirmed" items were confirmed by the owner in conversation. Not yet implemented.**

This is the second experiment of the "Cosmology" chapter, continuing directly from Experiment 1 (Hubble's Law), per that experiment's own "Relationship to Later Experiments" section and the owner's confirmation in conversation.

---

## Overview

Cosmology Experiment 1 showed that every distant galaxy's recession speed is proportional to its distance: `v = H0 × d` (Hubble's Law). This experiment asks the question most learners will already be forming after seeing that result: *if everything is moving apart now, what happens if we run time backward?*

Running `v = H0 × d` backward at each galaxy's own (assumed constant) recession speed, the time it would take any galaxy to reach zero distance from us is `d / v = d / (H0 × d) = 1 / H0` — a number that does not depend on distance at all. Every galaxy, however far away, points back to the *same* moment. That moment is popularly called **the Big Bang**, and `1 / H0` is called the **Hubble time**.

This experiment introduces no new formula beyond simple backward kinematics (distance = speed × time, solved for time) applied to Experiment 1's own, unmodified `recessionSpeedKmPerS`. It reuses `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` and the exact same galaxy presets without redefining either.

---

## Learning Objective

After this experiment, the learner should understand:

1. Running Hubble's Law backward in time, every galaxy's distance from us would have been zero at the same time in the past — the Hubble time, `1 / H0` — regardless of how far away that galaxy is today. This is a direct, surprising consequence of `v = H0 × d` being a straight-line proportionality, not a new physical law.
2. This naive, constant-speed extrapolation gives a number close to the real, independently measured age of the universe (≈13.8 billion years) — a genuinely informative fact, not a coincidence to wave away, but also **not** how astronomers actually determine the universe's age. The real expansion rate has sped up and slowed down across cosmic history (due to matter, radiation, and dark energy's differing effects over time), so naively running today's rate backward does not perfectly retrace the real history.
3. "The Big Bang" does not mean every galaxy rushing away from one special point in a pre-existing, empty space — including, specifically, not rushing away from *us*. The same pattern would be seen by an observer on any other galaxy: every other galaxy (including the Milky Way) would appear to recede from *them*, pointing back to the same shared moment. Earth is used here only as this experiment's (and Experiment 1's) reference point for measuring distance, not because it is special or central.
4. This experiment explicitly does not model the real expanding-universe theory (general relativity's FLRW cosmology), the universe's true expansion history, inflation, dark energy, or the cosmic microwave background — later topics, not developed here.

---

## Physical Situation

The same small number of galaxies from Experiment 1, at the same distances, now all shown at once on the same diagram — each already known (from Experiment 1) to be receding at a speed exactly proportional to its distance. Running time backward at each galaxy's own current recession speed (held constant, a deliberate simplification — see assumptions), every galaxy's distance from Earth shrinks to zero at exactly the same moment in the past.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **Each galaxy's recession speed is treated as having stayed exactly constant throughout its whole history**, so that running it backward in a straight line is valid. In reality, the universe's expansion rate has changed over time (it is not constant), so this straight-line extrapolation is a simplification, not the real expansion history.
- **This experiment only shows each galaxy's distance *from Earth* shrinking to zero** — not that *every* galaxy's distance from *every other* galaxy is shrinking in the same way. The real picture is symmetric: an observer on any other galaxy would see exactly the same pattern, with every other galaxy (including ours) receding from *them* and pointing back to the same moment. Earth is used here only as a reference point, for consistency with Experiment 1's diagram — not because the Milky Way is special or central, and not because the Big Bang happened "at" our location.
- **The real age of the universe (≈13.8 billion years) is stated as an independently measured comparison value, not derived here.** This experiment's own calculation (the Hubble time) comes out close to that real value, which is a genuinely informative fact worth noticing — but the closeness is not proof that this simplified, constant-speed method is the real one astronomers use.
- **No orbits, structure, or individual galaxy physics are modeled** — each galaxy remains simply a labeled distance, exactly as in Experiment 1.

### Not introduced

The real general-relativistic (FLRW) cosmological model, the scale factor of the universe, how the expansion rate has actually changed across cosmic history, dark energy, and any claim about what (if anything) came "before" this moment, or what caused it — all explicitly out of scope, consistent with keeping this experiment to a single new idea (`CLAUDE.md` §16).

**Exception, added by owner request (2026-10-06):** the cosmic microwave background's uniformity across the sky, the resulting **horizon problem** (why the universe looks the same in every direction when distant regions were never in causal contact), and **cosmic inflation** as the leading, still-debated explanation are introduced as a light-touch, clearly-flagged real-world extension — matching the precedent set by the Black Hole experiment's singularity/Hawking-radiation mention. This is a deliberate, narrow exception to the exclusion above, not a retraction of it: no new formula, control, or computation is added: both are learner-facing text only, in the introduction and the tutor's explanation, stated with an explicit "still debated, not settled fact" caveat.

---

## Physics Model

This experiment introduces one new, small, self-contained idea: running Experiment 1's own Hubble's Law relationship backward in time. It reuses `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` from `hubblesLawExperiment.ts` unchanged — imported, not redefined — so a future change to that constant propagates automatically.

```typescript
// src/physics/bigBangExperiment.ts

import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'

// Real, standard unit-conversion constant (kilometers per megaparsec), not an invented value.
export const MPC_TO_KM = 3.0856775814913673e19

// A Julian year in seconds (365.25 days) - the standard astronomical convention for year-scale
// conversions.
export const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60

// A real, independently measured comparison value (Planck-era ΛCDM estimate), stated as a
// real-world comparison - not derived by this experiment.
export const REAL_UNIVERSE_AGE_YEARS = 13.8e9

// The one genuinely new physical idea: running v = H0 * d backward. Since d / v = d / (H0 * d) =
// 1 / H0, the time for ANY galaxy to reach zero distance from us (at today's constant recession
// speed) is the same number regardless of distance - the "Hubble time." Takes no argument because
// it does not depend on distance; this independence from distance is the whole point.
export function hubbleTimeYears(): number {
  const hubbleConstantPerSecond = HUBBLE_CONSTANT_KM_PER_S_PER_MPC / MPC_TO_KM
  const hubbleTimeSeconds = 1 / hubbleConstantPerSecond
  return hubbleTimeSeconds / SECONDS_PER_YEAR
}

// Linear backward extrapolation of a galaxy's distance from Earth, assuming its current recession
// speed has stayed constant throughout (see "Simplifying assumptions"). Reaches exactly 0 at
// yearsAgo = hubbleTimeYears(), for every distanceMpc - confirming the premise above directly in
// the position function the diagram animates. Not valid for yearsAgo beyond hubbleTimeYears()
// (would imply negative distance); callers must clamp.
export function distanceAtPastTimeMpc(distanceMpc: number, yearsAgo: number): number {
  const fraction = 1 - yearsAgo / hubbleTimeYears()
  return distanceMpc * Math.max(0, fraction)
}

export interface BigBangResult {
  distanceMpc: number
  hubbleTimeYears: number
  realUniverseAgeYears: number
}

// distanceMpc is echoed back for display and for driving the diagram's animation - the result
// itself (hubbleTimeYears) does not depend on it.
export function runBigBangExperiment(distanceMpc: number): BigBangResult
```

Structured independently of the UI, per `CLAUDE.md` §9 — pure functions, testable with no browser.

---

## Learner Controls

- **Galaxy**, the same choice of distance as Experiment 1 (Virgo Cluster, Coma Cluster, "a very distant galaxy," and a custom slider) — reused, not reinvented. Unlike Experiment 1, the diagram always shows all three presets at once (see "Experiment Behavior"); the learner's choice selects which galaxy's own numbers are read out and highlighted, and sets the custom marker's position when "Custom" is chosen.
- **Run**, playing a single backward-time animation: every visible galaxy's marker slides from its present-day position toward Earth, all converging together as the readout counts "years ago" up toward the Hubble time — reusing the project's established fixed real-world playback duration, independent of distance (`CLAUDE.md` §11).

---

## Prediction Activity

Before the control and results are shown, the learner is asked two questions in sequence:

1. "If you picked a farther galaxy instead of a nearer one, do you think the time since it was at zero distance from us would be longer, shorter, or the same?" (Longer / Shorter / The same)
2. "How do you think this experiment's answer will compare to the universe's real, independently measured age (about 13.8 billion years)?" (Much longer / Much shorter / Close, but not exact)

Choices are not scored. The control is disabled until both predictions are entered, consistent with the rest of the project.

---

## Experiment Behavior

### Display

- A labeled diagram showing Earth (the reference point) and all three preset galaxies at once, each individually labeled and positioned by its present-day distance. Running the experiment animates every galaxy's marker sliding toward Earth together, all reaching it at exactly the same moment — directly visualizing "every galaxy points back to the same moment," not just stating it in numbers (`CLAUDE.md` §14). A live "years ago" counter runs alongside the animation.
- A live readout of the chosen galaxy's distance, its current recession speed (from Experiment 1's own formula), and the Hubble time once the experiment has run.

### Results

States the computed Hubble time (in billions of years), explicitly notes that this number does not depend on which galaxy was chosen (contrasting it with the learner's first prediction), and compares it to the real universe age in a visually prominent bordered box (matching Experiment 1's and Gravitational Waves Experiment 7's precedent for a real-value caveat) — stating plainly that the closeness is a genuinely informative fact but not proof that this simplified method is the real one astronomers use, since the real expansion rate has changed throughout cosmic history.

### Introductory text

To be drafted during implementation, covering: the question (if everything is moving apart, what does running that backward in time imply?), what happens, the learner's job (both predictions), what to look for, the new terms ("the Big Bang," "the Hubble time") defined in plain language, and the assumptions above — subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "What did you notice about where the three galaxies' markers ended up, and when, as the animation played?"
  2. Prediction comparison: the learner's two predicted answers beside what actually happened.
  3. Conceptual question: "If every galaxy, no matter how far away, points back to the same moment, what might that suggest about the universe's whole history?" — intended to let the learner start reasoning toward "a single starting moment" without the tutor stating it outright.
  4. Explanation: (1) running `v = H0 × d` backward, the time to zero distance is `1 / H0` for every galaxy — the Hubble time, independent of distance; (2) this naive, constant-speed number comes out close to the real, independently measured age of the universe (≈13.8 billion years) — informative, but not the real derivation, since the real expansion rate has changed across cosmic history (matter, radiation, dark energy); (3) this shared moment is popularly called "the Big Bang" — but it is not an explosion happening at one special point in a pre-existing space, and specifically not centered on Earth or the Milky Way: an observer on any other galaxy would see exactly the same pattern, with every other galaxy (including ours) pointing back to the same moment; (4) explicitly not covered here: the real expanding-universe model, how the expansion rate has actually changed over time, inflation, dark energy, and the cosmic microwave background — later topics.

---

## Required Physics Tests

1. `hubbleTimeYears()` does not depend on distance: `runBigBangExperiment` called with two different distances produces the same `hubbleTimeYears` value (confirms the premise the first prediction question depends on).
2. `hubbleTimeYears()` matches a direct, independently computed unit conversion of `1 / H0` (seconds, then years) for the illustrative `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` value.
3. `hubbleTimeYears()` is within about 10% of `REAL_UNIVERSE_AGE_YEARS` — guards against a unit-conversion error silently breaking the pedagogical point that this naive number comes out close to the real value.
4. `distanceAtPastTimeMpc(d, 0)` equals `d` exactly, for several representative distances (no extrapolation at the present moment).
5. `distanceAtPastTimeMpc(d, hubbleTimeYears())` equals exactly `0`, for several different values of `d` (confirms "every galaxy reaches zero at the same moment," directly in the function the diagram animates).
6. `distanceAtPastTimeMpc(d, t) / d` is independent of `d` for a fixed `t` strictly between `0` and `hubbleTimeYears()` (confirms the backward extrapolation follows the same fractional law regardless of distance, not just at the two endpoints already checked above).
7. `bigBangExperiment.ts` imports `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` from `hubblesLawExperiment.ts` rather than redefining it — a regression check (source-text import check, matching Experiment 1's own `dopplerFactorFor` regression-test pattern) confirming this experiment does not silently drift from Experiment 1's own value.

---

## Decisions Confirmed

Confirmed by the owner in conversation on 2026-10-05:

1. **Diagram approach:** show all three preset galaxies converging together on one diagram (not one galaxy at a time, as Experiment 1 does), so the "every galaxy points to the same moment" result is directly visible rather than something the learner has to notice across several separate runs.
2. **Caveat prominence:** the "this isn't the real derivation" comparison to the universe's real age is shown in a visually prominent bordered box, matching Experiment 1's and Gravitational Waves Experiment 7's precedent for a real-value caveat, rather than an inline sentence.

3. **Title accepted as proposed:** "The Big Bang: Running Expansion Backward in Time."
4. **The custom-slider distance range is reused unchanged from Experiment 1** (`MAX_CUSTOM_DISTANCE_MPC = 200`), since the Hubble time this experiment computes does not depend on distance at all — there is no new honesty concern analogous to Experiment 1's low-redshift-approximation ceiling.
5. **"Custom" is included as a fourth marker** on the multi-galaxy convergence diagram, alongside the three presets, when selected — for visual consistency with Experiment 1's control.

---

## Relationship to Later Experiments

This experiment is a natural, well-motivated closing point for a short "Cosmology" chapter arc (Hubble's Law → the Big Bang), similar in spirit to how the "Gravitational Waves" and "Gravity and Curved Spacetime" chapters each closed after a small number of experiments. No further Cosmology experiment is proposed or implied by this one; a future direction (the real expanding-universe model, dark energy, or the cosmic microwave background) would be a substantially larger undertaking and is explicitly out of scope for now, consistent with `CLAUDE.md` §16's "do not invent future experiments merely to fill out a roadmap."

---

## Success Criteria

1. No existing experiment's physics is modified or recomputed; this experiment's only new formulas are `hubbleTimeYears` and `distanceAtPastTimeMpc`. `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` is imported from `hubblesLawExperiment.ts` unchanged, never redefined (see "Decisions Confirmed" and the regression test).
2. The learner makes both predictions before the control and results are shown.
3. Running the experiment visibly shows all three galaxies' markers converging together at the same moment, not just stating the result in numbers.
4. The Results panel correctly states the Hubble time is the same regardless of which galaxy was chosen, directly checked against the learner's first prediction.
5. The comparison to the real universe age is stated prominently, with an explicit statement that the closeness is informative but not proof of the real derivation method.
6. The experiment states plainly, in the introduction, Results panel, and tutor, that this calculation does not imply Earth or the Milky Way is special or central — any other galaxy's observer would see the same pattern.
7. The learner can, after the tutor conversation, state in their own words that every galaxy's distance, run backward at today's rate, implies the same shared moment in the past — and that this is informative but not the real, detailed expansion history.
8. "Hubble's Law," "Hubble constant," and "recession speed" are reused consistently from Experiment 1's own definitions rather than redefined; "the Big Bang" and "the Hubble time" are each defined in plain language at first use, consistent with `CLAUDE.md` §15.

---

## Implementation Notes

Fully implemented: physics model and tests, UI, prediction/results flow, tutor, diagram (wave→ruler→pulse iterations, plus the later "Play forward" control), complete-flow test, final review, and the owner's line-by-line wording approval are all done — see `CLAUDE.md` §27 for the full history.

**2026-10-06, owner request:** added the horizon problem and cosmic inflation as a light-touch, clearly-flagged real-world extension — see the "Not introduced" section's exception above for the exact scope and wording constraints. Added: a new introduction paragraph ("A real puzzle this simple picture runs into," with a bedsheet-stretching daily-life picture and an explicit "still debated" caveat) and a new tutor explanation point 5 (replacing the old point 4's blanket "not covered here: ...cosmic inflation..." dismissal, which now reads without "cosmic inflation" since it is covered). No new formula, control, or physics computation was introduced; this is text-only, added after the experiment's existing wording approval, so it is approved separately rather than reopening the whole pass.
