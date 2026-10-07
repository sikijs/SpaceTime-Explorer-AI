# Cosmology — Experiment 6: How Old Is the Universe? (Putting the Expansion History Together)

**Status: APPROVED by the owner on 2026-10-07 (proposed by Claude per `CLAUDE.md` §23 Stages 1–3 on 2026-10-06, following the completion of Cosmology Experiment 5). The topic itself was chosen by the owner from three options (the age of the universe over gravitational lensing and the CMB's ripples). All eight "Decisions Needing Human Review" items are confirmed as proposed, with item 5 reworded (see "Decisions Confirmed"). Nothing is implemented.**

This is the sixth experiment of the "Cosmology" chapter.

---

## Overview

Experiment 2 ran Hubble's Law backward at a constant speed and got a "Hubble time" of about 14 billion years, remarkably close to the real age of the universe (about 13.8 billion). Its results panel and tutor were careful to say that this closeness is informative but is **not** the real derivation, because the real expansion rate has changed over cosmic history. Experiment 5 then showed that the expansion has slowed down and later sped up. This experiment puts the two together and answers the question Experiment 2 left open: **what age do we get when we use the real expansion history?**

The learner changes the share of dark energy (the same control as Experiment 5) and sees how the universe's size has grown over time, from the Big Bang to today, in three versions: Experiment 2's constant-speed picture, a universe containing only matter, and a universe containing matter plus the chosen dark energy. Each curve reaches "today" (the universe's size today, defined as 1) at a different moment, which is that version's age. With matter only, the age comes out far too young (about 9.3 billion years). With about 70% dark energy, it comes out at about 13.5 billion years (13.8 with the slightly lower Hubble constant and dark energy share that more precise measurements favor), matching the real value.

This closes the chapter's central thread: the Big Bang's constant-speed estimate was close, but only because two opposite effects, an early slowdown and a later speed-up, happen to roughly cancel.

This uses real physics in its exact form (no approximation beyond the same flat, matter-plus-dark-energy model as Experiment 5).

---

## Learning Objective

After this experiment, the learner should understand:

1. To find a universe's age, you need its whole expansion history, not just today's expansion rate.
2. With only matter, gravity slows the expansion throughout, so the universe would have expanded faster in the past, reached today's size sooner, and be much younger than Experiment 2's constant-speed estimate (about two thirds of it).
3. Adding dark energy, which speeds the expansion up in recent times, makes the universe older, because the expansion was slower for longer in the past.
4. With the dark energy that observations favor (about 70%), the real expansion history gives an age close to the measured 13.8 billion years.
5. Experiment 2's constant-speed estimate came out close to the real age only because the early slowdown and the later speed-up roughly cancel. It was a useful estimate, not the real method.
6. A universe must be at least as old as the oldest things in it, which is how a matter-only universe was ruled out as too young.

---

## Physical Situation

A flat universe containing matter and dark energy (the same model as Experiment 5), described by its relative size over time. The learner chooses the dark energy share, and the experiment computes the age and draws the universe's size from the Big Bang to today.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **The same model as Experiment 5:** a flat universe with only matter and a constant dark energy, matter's share being 100% minus dark energy's. Radiation, which matters only in the very early universe, is left out; for the age this is a good approximation, but it is an approximation.
- **The Hubble constant is the same illustrative value as Experiment 1** (70 km/s/Mpc), with the same real caveat (the Hubble tension, 67–73). The measured age (13.8 billion years) is a real value that comes from a slightly lower Hubble constant (about 67.4) and a slightly lower dark energy share (about 68.5%), which the experiment shows.
- **"Size" means the distances between galaxies, relative to today.** Today's value is defined as 1. This is not the size of a physical object, and says nothing about whether the universe is finite.
- **The Big Bang is an idealized starting moment (size 0),** as in Experiment 2. What happened at or before it, including cosmic inflation, is not modeled.
- **Experiment 2's constant-speed curve is a simplified model, not a rival theory.** It is shown only for comparison.
- **The real measured age is a given value, not derived here,** and no claim is made about what dark energy is.

### Not introduced

Radiation and the early universe in detail, inflation's effect on the age, curved universes, the precise value of the Hubble constant, and how ages of stars are measured. All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16).

---

## Physics Model

One new, self-contained module. It deliberately **reuses** earlier experiments' code unchanged (imported, not redefined): Experiment 1's Hubble constant, Experiment 2's Hubble time and real universe age, and Experiment 5's expansion-rate function and best-fit dark energy share.

For a flat universe with matter share `1 − Λ` and dark energy share `Λ`, the age is `t0 = (1 / H0) × ∫ from 0 to ∞ of dz / ((1 + z) × E(z))`, with `E(z)` as in Experiment 5. This integral has a standard exact closed form:

- With no dark energy: `t0 = 2 / (3 × H0)`, exactly two thirds of the Hubble time.
- With dark energy: `t0 = (2 / (3 × H0 × sqrt(Λ))) × asinh( sqrt(Λ / (1 − Λ)) )`.

The universe's relative size `a` at time `t` after the Big Bang also has a standard exact closed form:

- With no dark energy: `a(t) = ( (3/2) × H0 × t )^(2/3)`.
- With dark energy: `a(t) = ((1 − Λ) / Λ)^(1/3) × sinh( (3/2) × sqrt(Λ) × H0 × t )^(2/3)`.

At `t = t0`, both give `a = 1` ("today"). Experiment 2's constant-speed picture is `a(t) = t / (Hubble time)`.

```typescript
// src/physics/universeAgeExperiment.ts

// Reused unchanged (imported, not redefined):
//   hubblesLawExperiment.ts: HUBBLE_CONSTANT_KM_PER_S_PER_MPC
//   bigBangExperiment.ts: hubbleTimeYears, REAL_UNIVERSE_AGE_YEARS, MPC_TO_KM, SECONDS_PER_YEAR (if exported)
//   darkEnergyExperiment.ts: BEST_FIT_DARK_ENERGY_FRACTION, MAX_DARK_ENERGY_FRACTION

// A given, rounded real-world reference (about the age of the oldest known star clusters); see "Decisions
// Needing Human Review" item 2. Used only as a comparison marker.
export const OLDEST_STARS_AGE_YEARS = 12.5e9

// Age of the universe in years for a flat universe with dark energy share L (closed forms above). The
// optional second argument lets the tests (and the Hubble-tension tie-in) use a different Hubble constant;
// it defaults to Experiment 1's value.
export function universeAgeYears(
  darkEnergyFraction: number,
  hubbleConstantKmPerSPerMpc: number = HUBBLE_CONSTANT_KM_PER_S_PER_MPC
): number

// Relative size of the universe (today = 1) a given time after the Big Bang, for dark energy share L.
export function relativeSizeAtTime(yearsAfterBigBang: number, darkEnergyFraction: number): number

// Experiment 2's constant-speed picture: size grows in a straight line, reaching 1 at the Hubble time.
export function constantSpeedRelativeSize(yearsAfterBigBang: number): number

export interface UniverseAgeResult {
  darkEnergyFraction: number
  ageYears: number
  matterOnlyAgeYears: number
  hubbleTimeYears: number
  realAgeYears: number
  ageOverHubbleTime: number
  isOlderThanOldestStars: boolean
  curves: Array<{
    yearsAfterBigBang: number
    matterOnlySize: number
    chosenSize: number
    constantSpeedSize: number
  }>
}

export function runUniverseAgeExperiment(darkEnergyFraction: number): UniverseAgeResult
```

Values worked out from this model at H0 = 70 km/s/Mpc, for the specification and the tests:

| Dark energy share | Age (billions of years) | Age ÷ Hubble time (13.97) |
|---|---|---|
| 0% (matter only) | 9.31 | 0.67 |
| 50% | 11.61 | 0.83 |
| 70% | 13.47 | 0.96 |
| 90% | 17.85 | 1.28 |

With the Planck-like values (`H0 = 67.4`, 68.5% dark energy), the same formula gives 13.80 billion years, matching the real measured age. The numerical integral and both closed forms agree (checked independently).

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser.

---

## Learner Controls

- **Dark energy share**, the same control as Experiment 5: a slider from 0% ("none, matter only") to 90%, with presets "None (matter only)" and "The best fit to observations (about 70%)" (matching this chapter's presets-plus-continuous-control pattern), labeled in plain language as the share of the universe's total energy.
- **Run**, which draws the curves from the Big Bang to today over a fixed duration (independent of the physics result, per `CLAUDE.md` §11).

---

## Prediction Activity

Before the control and results are shown, the learner answers two questions in sequence (not scored):

1. "If the universe contained only matter, so gravity has been slowing the expansion all along, would its age be longer than, shorter than, or the same as Experiment 2's constant-speed estimate (about 14 billion years)?" (Longer / Shorter / The same)
2. "Dark energy speeds the expansion up in recent times. Compared with a matter-only universe, would adding dark energy make the universe older, younger, or the same age?" (Older / Younger / The same)

The control is disabled until both predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the chosen share.

---

## Experiment Behavior

### Display

- **Size-versus-time graph (labeled):** the universe's relative size (vertical, today = 1) against time since the Big Bang in billions of years (horizontal). Three visually distinct lines, all starting at size 0 at the Big Bang: **Experiment 2's constant-speed picture** (a straight line), the **matter-only universe**, and the **universe with the chosen dark energy**. Each line ends at a marker where it reaches size 1, labeled with that version's age. A faint "oldest known star clusters" marker on the time axis (see "Decisions Needing Human Review" item 2). Axis labels with units; a legend.
- **Live readout:** the chosen share and its age, the matter-only age, the Hubble time from Experiment 2, and the real measured age, in billions of years, plus whether the chosen age is older than the oldest star clusters.
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are submitted, written in the same detailed, step-by-step style as Experiment 5's.
- The graph and caption appear only after predictions are locked in, so they do not give away either prediction (`CLAUDE.md` §12).

### Results

States the chosen share and its age; compares it with the matter-only age, the Hubble time, and the real measured age; says whether it is older than the oldest known star clusters and what that means; compares both of the learner's predictions to what the model gives; shows that with the Planck-like Hubble constant the best-fit model gives about 13.8 billion years, tying the small gap at 70 km/s/Mpc to the Hubble tension from Experiment 1; explains why Experiment 2's constant-speed estimate came out close (the early slowdown and later speed-up roughly cancel); includes real-world grounding (the measured age, and the 1990s puzzle in which matter-only universes were younger than the oldest star clusters, helping motivate dark energy before the supernova results); and restates the model caveats. Includes simple math, per `CLAUDE.md` §15: with no dark energy the age is two thirds of the Hubble time, so `(2/3) × 13.97 ≈ 9.3` billion years.

### Introductory text

To be drafted during implementation, covering: the question (how old is the universe, and was Experiment 2's estimate really right?), what happens, the learner's job (both predictions), what to look for, new terms defined in plain language before use (**the universe's relative size**, using "distances between galaxies compared with today"), reuse of "dark energy", "redshift", "Hubble time" and "Big Bang" from earlier experiments without redefining them, a daily-life picture (working out how long a bathtub has been filling from its water level now, which needs to know whether the tap's flow ever changed; it deliberately does not hint at which direction a change would push the answer), and the assumptions above. Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "Compare where each line reaches size 1. What do you notice about the matter-only line, the straight line, and the line with your chosen dark energy?"
  2. Prediction comparison: the learner's two predicted answers beside what the model gave.
  3. Conceptual question: "Experiment 2's straight-line estimate came out close to the real age, even though the real expansion rate has changed. Why might it have turned out so close?" — intended to let the learner reason toward the cancellation without the tutor stating it outright.
  4. Explanation: (1) the age depends on the whole expansion history, not only today's rate; (2) with matter only, gravity slows the expansion, so in the past it was faster and the universe reached today's size sooner: its age is only two thirds of the Hubble time, a car-trip picture (if you were driving faster earlier and slowed down, the trip took less time than today's speed alone would suggest); (3) dark energy speeds the expansion up recently, so the expansion was slower for longer, and the age is older; (4) at about 70% dark energy the model gives about 13.5 billion years, and about 13.8 with the slightly lower Hubble constant (about 67.4) and dark energy share (about 68.5%) that the real fit uses, matching the measured age; (5) the straight-line estimate came out close because the early slowdown and the later speed-up roughly cancel, a happy coincidence, not a method; (6) the universe cannot be younger than the oldest things in it, which is how matter-only universes were ruled out as too young; (7) not covered: radiation and inflation's effect on the age, curved universes, and how star ages are measured.

---

## Required Physics Tests

1. With no dark energy, `universeAgeYears(0)` equals exactly two thirds of `hubbleTimeYears()` (reused from Experiment 2).
2. The closed-form `universeAgeYears(L)` matches a direct numerical integral of `dz / ((1 + z) × E(z))`, using Experiment 5's `expansionRateRatio`, to a tight relative tolerance, for several values of `L`.
3. `universeAgeYears` is strictly increasing with the dark energy share across 0 to `MAX_DARK_ENERGY_FRACTION`.
4. At the best-fit share (0.7), the age is within 2% of 13.47 billion years and within 3% of the real measured age (13.8 billion years) — and, with a Hubble constant of 67.4 km/s/Mpc and a share of 0.685, the same formula is within 1% of 13.8 billion years (the Hubble-tension tie-in).
5. `relativeSizeAtTime(universeAgeYears(L), L)` equals 1 for several values of `L`, including 0.
6. `relativeSizeAtTime` is strictly increasing in time and 0 at time 0.
7. Consistency with Experiment 5: the sign of the universe's acceleration today (the second difference of `relativeSizeAtTime` around the age) is negative for a share below 1/3, and positive above it, matching `decelerationParameter` from Experiment 5.
8. `constantSpeedRelativeSize(hubbleTimeYears())` equals 1.
9. The matter-only age is shorter than `OLDEST_STARS_AGE_YEARS`, and the 70% age is longer (the premise of the "older than the oldest stars" comparison).
10. The module imports `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` from `hubblesLawExperiment`, `hubbleTimeYears` from `bigBangExperiment`, and the dark energy constants from `darkEnergyExperiment` rather than redefining them, and does not import from `darkMatterExperiment` or `cosmicMicrowaveBackgroundExperiment` — a regression check (`CLAUDE.md` §8).

---

## Decisions Confirmed

Confirmed by the owner via question on 2026-10-06, before this draft:

1. **Topic:** the age of the universe, putting the expansion history together, over gravitational lensing and the CMB's ripples.

---

## Decisions Confirmed (2026-10-07)

All eight items below were confirmed as proposed, except item 5, which was reworded as shown. Item 8 (closing synthesis) is left out.

## Decisions Needing Human Review (original proposals)

1. **Title and placement.** Proposed: "How Old Is the Universe? Putting the Expansion History Together" as Cosmology Experiment 6.
2. **The oldest-star-clusters comparison.** It makes the "a matter-only universe is too young" argument concrete, but it needs a real number. I propose a rounded "about 12 to 13 billion years" (constant `OLDEST_STARS_AGE_YEARS = 12.5e9`) and a light-touch mention of the 1990s puzzle. I have not checked either against a source. The alternative is to drop the comparison and the puzzle, which keeps the experiment simpler but loses the "why dark energy was needed" thread.
3. **The graph design.** Proposed: relative size against time with three lines (Experiment 2's straight line, matter-only, chosen), each ending at its age. The alternative is a simple bar chart of the ages, which is easier to read but hides why the ages differ.
4. **Closed forms rather than numerical integration.** The age and size both have standard exact closed forms, which the tests check against a direct numerical integral and against each other. I propose using the closed forms in the model. The alternative is numerical integration only.
5. **The Hubble-tension tie-in.** At 70 km/s/Mpc and 70% dark energy the model gives 13.5 billion years rather than 13.8. **Reworded at the owner's approval:** the gap is explained as the real fit using a slightly lower Hubble constant (about 67.4) *and* a slightly lower dark energy share (about 68.5%) together; a lower Hubble constant alone (67 with 70%) would give about 14.1, not 13.8. No second control is added; the Planck-like result is shown as a fixed comparison.
6. **Defining "relative size".** Proposed: "the distances between galaxies compared with today, with today set to 1", labeled as not a physical object's size. Please review the wording when the introduction is drafted.
7. **The daily-life picture.** Proposed: the bathtub (how long it has been filling depends on whether the tap's flow changed). The car-trip picture is held for the tutor, because it hints at the first prediction's answer. Please confirm or suggest another.
8. **Optional closing synthesis (not included by default).** After this experiment the chapter could end with a short "Putting It All Together" section, as Gravity and Curved Spacetime's Experiment 9 did, naming the standard model of cosmology (ordinary matter, cold dark matter, and dark energy) for the first time and tying each part to the experiment that showed it. It is a second new element, so I propose leaving it out unless you want it.

---

## Relationship to Previous Experiments

- **Cosmology Experiment 2 (the Big Bang):** this is the direct follow-up. It reuses the Hubble time and the real age, and explains why the constant-speed estimate came out close.
- **Cosmology Experiment 5 (dark energy):** this reuses its model, expansion-rate function, best-fit share, and slider.
- **Cosmology Experiment 1 (Hubble's Law):** it reuses the Hubble constant and its caveat.
- **Cosmology Experiment 4 (dark matter):** the matter share in this model includes dark matter, which this experiment does not separate out.

## Relationship to Later Experiments

Possible further directions (none proposed here; each needs its own Stage 1–2 proposal): gravitational lensing as a further line of evidence for dark matter, the CMB's tiny ripples and structure formation, or whether dark energy changes over time.

---

## Success Criteria

1. The learner makes both predictions before the graph and the control are shown.
2. Moving the dark energy share visibly changes the chosen line and its end marker's age, not just a number.
3. With no dark energy, the universe is clearly younger than Experiment 2's straight-line estimate; with about 70%, it is close to it and close to the real measured age.
4. The three lines, their end markers, and the oldest-star marker are visually distinct, labeled, and explained in the caption.
5. The Results panel correctly compares both of the learner's predictions to what the model gives.
6. The model caveats (flat, matter plus constant dark energy only, no radiation, illustrative Hubble constant) are stated in the introduction, Results, and tutor.
7. The experiment states plainly why Experiment 2's estimate came out close, and that it was not the real method.
8. "Relative size of the universe" is defined in plain language at first use; "dark energy", "redshift", "Hubble time" and "Big Bang" are reused, not redefined (`CLAUDE.md` §15).
9. The Hubble-tension tie-in is shown, not only stated.
10. No existing experiment's physics is modified or recomputed.

---

## Implementation Notes

Built one step at a time on 2026-10-07: physics model and tests (`src/physics/universeAgeExperiment.ts`, 14 tests, all of Required Physics Tests 1–10), basic UI, introduction and predictions, results panel, and tutor (`src/components/UniverseAgeExperiment.tsx`, `src/components/UniverseAgeTutor.tsx`), wired into `src/App.tsx` under "Cosmology".

- **Hubble-tension wording (item 5):** at `H0 = 67.4` with 70% dark energy the age is about 13.99 billion years, not 13.8; only the pair (67.4 and 68.5%) gives 13.80. The test asserts the pair is more than twice as close to 13.8 as the lower Hubble constant alone. The Results panel shows all three numbers.
- **Presentation choices made by Claude, not in the specification:** a fixed 0–20 billion year time axis (so the graph does not rescale as the slider moves); each line is drawn only up to the moment it reaches size 1; end labels are staggered in height and carry "billion years"; the playback duration is 9 seconds at the owner's request (slowed from 5); the oldest-star label sits beside its vertical line with a pointer, after the owner found a bottom-of-axis label confusing; the caption was lengthened at the owner's request and gained a "Why it is there" point explaining the oldest-star line.
- **Final review (§21 Step 10, 2026-10-07), run in a headless browser:** the complete flow (predictions gate the control, graph hidden until Run, results, three tutor steps and explanation, `localStorage` records both `completed` and `explained`) worked, with no horizontal overflow at 390 px wide and no console errors other than a 404 for a missing static file. Two presentation gaps found and fixed: end-label leader lines ran through other labels (fixed with a dark outline behind label text), and at 90% dark energy the "today's size" label collided with the gold end dot (moved to the left end of the line; the graph also gained headroom under the legend). All ten Success Criteria were checked and met. One note, not changed: the introduction says it reuses "redshift", which the experiment does not otherwise use; the specification lists it, so it was left.
- **Checked against sources (2026-10-07, web search):** the oldest star clusters' age is about 12 to 13 billion years today (the method's maximum is about 13.3, ± 2), so 12.5 is a fair rounded figure. The 1990s age problem was real: early-1990s cluster ages of 16–20 billion years conflicted with a flat matter-only universe, and the Hipparcos distances of 1995 revised them down to about 12–13. The learner text says "about 16 to 20 billion years" for the early-1990s estimates, matching the sources. Sources: Wikipedia "Cosmic age problem"; arXiv astro-ph/9706227 and astro-ph/9907308; Universe Today and Science News articles on globular cluster ages.
- **Later additions at the owner's request:** a "What 'older' and 'younger' mean here" introduction paragraph (and matching clarifications in the Results panel and tutor point 3), explaining that nothing changes a real universe and that universes with the same expansion rate today are being compared; tutor points 2 and 3 rewritten in detail with simple math and two car-trip examples (a fast start, then slowing, gives 1.5 hours against 2; a slow start, then speeding up, gives 3 hours); and a note that 1990s cluster-age estimates ran higher than today's, in the Results panel and caption.
- **Owner's line-by-line wording approval (§28.1):** complete (2026-10-07), approved as written, covering the introduction, predictions, caption, results panel, tutor, and the chapter-summary text in `src/App.tsx`.
