# Cosmology — Experiment 2: The Big Bang (Running Expansion Backward in Time)

**Status: approved (2026-10-05), per `CLAUDE.md` §23 Stages 1–4, following the completion of Cosmology Experiment 1 (Hubble's Law). All five "Decisions Confirmed" items were confirmed by the owner in conversation. Implemented (2026-10); audited and rebuilt 2026-11-14, see "Audit Update (2026-11-14)" at the end.**

**Audit update, 2026-11-14 (built; see "Audit Update (2026-11-14)" at the end).** The page is rebuilt to the newer rules: four Parts; the existing time ruler and galaxy row plus two new panels ("Time to reach Earth" and a zoom strip comparing this page's answer with the measured age); white guess markers; one caption; your own galaxy in Part 2; two Results tables with a check-up against published values; a words box; nine links; Start over; a rewritten, fuller introduction (what the Big Bang was not, and the matching-sky puzzle in plain steps); and a tutor that marks both guesses in its explanation. Where the Audit Update and the older sections (Learner Controls, Prediction Activity, Experiment Behavior, Results, AI Tutor Behavior, "Decisions Confirmed", "Implementation Notes") differ, **the Audit Update wins**. The physics (`1 / H0` at H0 = 70, the unit conversions, the constant-speed backward run) is unchanged; the module gains functions (see below).

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

Fully implemented (October 2026; rebuilt 2026-11-14, see "Audit Update (2026-11-14)" below, which supersedes the interface described here): physics model and tests, UI, prediction/results flow, tutor, diagram (wave→ruler→pulse iterations, plus the later "Play forward" control), complete-flow test, final review, and the owner's line-by-line wording approval are all done — see `CLAUDE.md` §27 for the full history.

**2026-10-06, owner request:** added the horizon problem and cosmic inflation as a light-touch, clearly-flagged real-world extension — see the "Not introduced" section's exception above for the exact scope and wording constraints. Added: a new introduction paragraph ("A real puzzle this simple picture runs into," with a bedsheet-stretching daily-life picture and an explicit "still debated" caveat) and a new tutor explanation point 5 (replacing the old point 4's blanket "not covered here: ...cosmic inflation..." dismissal, which now reads without "cosmic inflation" since it is covered). No new formula, control, or physics computation was introduced; this is text-only, added after the experiment's existing wording approval, so it is approved separately rather than reopening the whole pass.

---

## Audit Update (2026-11-14)

Built to `docs/audit/cosmology/02-draft-wording.md` ("all defaults" from the owner on 2026-11-14 to the ten questions of `docs/audit/cosmology/02-gap-report.md`, "approved" to the draft wording, "go" for the build, and "all defaults, apply it" to the reinstated introduction), plus the owner's request during the review, listed below. Commits: `d23f761` (physics), `8f81273` (interface) and `9cc9dcc` (documents). The physics (`1 / H0` at H0 = 70 km/s per Mpc, the standard unit conversions, the constant-speed backward run) does not change.

**What changed.**
- **Layout.** A neutral introduction, a collapsed "Words and formulas" box, and a "Want to know more?" list of nine links, all above Part 1 with no Part heading; then Part 1 "Predict, then watch" (amber), Part 2 "Now try it yourself" (pink), Part 3 "The results" (teal), Part 4 "The tutor" (blue). Parts 2 to 4 appear after the first Run and stay (changing a setting no longer hides the results or restarts the tutor).
- **Introduction (owner's request, 2026-11-14).** The question; "What happens" (running Hubble's Law backward, the Big Bang, the Hubble time, the singularity); **"What the Big Bang was not"** (not an explosion in one place, no centre, space itself stretching; NASA's John Mather); **"A puzzle the Big Bang has to answer: why does the whole sky match?"** in seven steps (the glow, why that is strange with two cups of tea, the catch at 380,000 years, two strangers in the same outfit and the horizon problem, cosmic inflation with the wrinkled bedsheet and the football field, how sure we are, why it is here); a candle picture; "Your job"; the guesses paragraph; plain words (recession speed, megaparsec, billion years, constant speed); assumptions; "Some new words". The old "A simple example" (the division) and "What to look for" are removed from the introduction because they gave guess 1 away (§12).
- **Part 1.** Guess 1: a farther galaxy's time back to zero distance, longer, shorter or the same. Guess 2: this page's answer against the real age measured by others (about 13.8 billion years), much longer, much shorter or close but not exact. An always-visible **Start over** replaces "Change predictions". One backward **Run** draws the three presets (Virgo highlighted); **Play forward** replays the same calculation from the singularity outward.
- **The picture.** The time ruler (ten blocks, a gold pointer) and the galaxy row as before, with Earth and the galaxies labelled, and two new panels: **"Time to reach Earth (billion years)"**, a bar for each galaxy on a 0 to 16 scale; and **"Zoom: this page's answer against the measured age"**, a strip from 12 to 16 billion years with an amber tick for this page's calculated 13.97 and a green tick for the age measured by others (NASA). **White marks, drawn only once the backward run has finished:** guess 1 as a marker beside the farthest galaxy's bar (an arrow past the bar's end for "longer", an arrow that stops short for "shorter", a tick at the end for "the same"); guess 2 as a marker on the strip (to the right of the amber tick for "much longer", to the left of the green tick for "much shorter", between them for "close"). Both are markers only: how far they are drawn from the ticks (a quarter of the strip's width) is a display choice with no scientific meaning, and the caption says so. **The ruler's left-end number and the pointer's count are not printed until Run is pressed** (the number is this page's answer, which guess 2 compares with 13.8).
- **Caption and "Where the real picture comes from".** One caption: what is drawn, what appears when, and, **only once the run has finished**, a worked moment (Virgo: 16.5 Mpc = 5.09 × 10²⁰ km; 1,155 km/s; 4.408 × 10¹⁷ s = 13.97 billion years; Coma: 7,000 km/s, 13.97 billion years again) and three "Look at / What it means / Why it matters" items. The "Where the real picture comes from" line also appears only after the run.
- **Part 2.** A galaxy of your own at 1 to 200 Mpc, drawn in pink with its own bar, and the choice of which preset is highlighted; "Show my galaxy" plays its own backward run; no white marks and no zoom strip; its own short caption and "Where this picture comes from".
- **Results (Part 3).** Table 1: each galaxy's distance, recession speed and time back to zero distance (13.97 billion years for every one, including yours), with "your guess" tags on the last column and no verdict. Table 2, a check-up: this page's answer against the measured age (**more, by about 1.2 percent, 0.17 billion years**); the Hubble constant used (70, **between** the published 73.04 ± 1.04 and 67.4 ± 0.5); this page's answer at those two values (13.39 and 14.51 billion years; **the measured age lies between them, not an independent check**, because the measured age is not found from 1 divided by the Hubble constant); each galaxy's time (**no published reference**). Each table has a "What this table tells us" note; a "Your guesses" block gives the guesses only; the amber "this is not how astronomers measure the universe's age" box is kept, trimmed to the facts NASA's page supports (the expansion slowed as matter pulled on itself and has been speeding up because of dark energy).
- **Tutor (Part 4).** Observe ("Look at the three galaxies, the ruler and the three bars...") and compare (the two guesses and "your white markers beside the real bars and the zoom strip") state no outcome and no verdict; the conceptual question is unchanged; the explanation marks each guess (read from the module) and adds why the time comes out the same (twice as far, twice as fast) with a balloon being let down; points 3 and 4 are as before (point 3 now quotes Mather); **point 5 is a short pointer** to the matching-sky puzzle in the introduction.
- **Words box and links.** Plain meanings for the Big Bang, the Hubble time, the singularity, recession speed, megaparsec, billion years, constant speed, Hubble's Law and the Hubble constant, inflation and the horizon problem; the formula with a worked example appears after the first Run. Links: NASA, "Big Bang" (Hubble); NASA, "Webb Telescope and the Big Bang" (John Mather); NASA, "Cosmic History"; NASA, "What Can We Learn from the Universe's Baby Picture?" (read in part); NASA, "Hubble Cosmological Redshift"; NASA, "The Hubble Constant and the Hubble Tension"; Hubble 1929 (PNAS, the PMC page; text not read); Riess and others 2022 (arXiv 2112.04510); Planck 2018 VI (arXiv 1807.06209).

**Owner's request during the review** (applied): the earlier introduction's horizon-problem material, which question 5's default had removed, was reinstated in a fuller, simpler and more exciting form, with "What the Big Bang was not" before it and the tutor's point 5 shortened to a pointer.

**Deviations from the approved draft** (a result of tests and the browser check; the wording is otherwise unchanged): the "0.17 billion years apart" figure in the caption, and this page's answer in the ruler's left-end label and the pointer, wait until the run has begun or finished, because they gave guess 2's answer before the guess; the introduction's assumption 2 no longer says "every other galaxy ... pointing back to the same moment" (it gave guess 1 away; the tutor says it after the run); the introduction's "billion years" example is 5, not 13.97 (13.97 is this page's answer); on Part 2's picture the axis moved below the fourth bar. **Open for the owner:** the links are above Part 1 as drafted; NASA's Webb Q&A is described there as "it happened everywhere at once", a mild hint toward guess 1.

**Physics module (new, with tests; `bigBangExperiment.ts`).** `BACKWARD_RUN_PRESETS`, `MIN_OWN_GALAXY_DISTANCE_MPC`, `MAX_OWN_GALAXY_DISTANCE_MPC`, `timeBackToZeroYears`, `galaxyTimeRow`, `hubbleTimeYearsForH0`, `TIME_PANEL_MAX_YEARS`, `AGE_STRIP_MIN_YEARS`, `AGE_STRIP_MAX_YEARS`, `timeBarFraction`, `ageStripFraction`, `timeGuessMarker`, `AGE_GUESS_OFFSET_FRACTION`, `ageGuessMarkerYears`, `actualTimeAnswer`, `timeGuessMatches`, `CLOSE_RELATIVE_GAP`, `relativeGapToMeasuredAge`, `actualAgeAnswer`, `ageGuessMatches`, `ageReading`, `bigBangCheckUp`, `bigBangWorkedExample`. The existing functions are unchanged; the only edit to existing code is the comment on `REAL_UNIVERSE_AGE_YEARS`, which now cites NASA instead of "Planck-era ΛCDM" (the Planck 2018 abstract read gives no age). **A rule to note:** the tutor marks the second guess with the page's own test threshold, within 10 percent of the measured age is "close" (`CLOSE_RELATIVE_GAP`); it is a code threshold, not a published one, and the Results never present it as one (they show the numbers and the 1.2 percent). 22 new physics tests (30 in the file; the 8 existing are unchanged) and 18 render tests (`BigBangExperiment.test.tsx`); six deliberate breaks of the module and eight of the interface were each caught. The whole suite, `tsc --noEmit -p tsconfig.app.json` and `npm run build` pass.

**Sources (read 2026-11-14 through helper agents whose fetch tool returns short quotes, so each quotation and figure should be checked against the live page).**
| Item | Source | Status |
|---|---|---|
| Age about 13.8 billion years; the Big Bang | NASA, Big Bang (Hubble), 22 Oct 2024; NASA, Cosmic History, 12 Aug 2026; NASA, baby picture | First two read in full; third read in part (39,354 of 47,688 characters) |
| Not an explosion; no centre; everywhere at once | NASA, Webb Telescope and the Big Bang (Mather Q&A), 20 Feb 2026 | Read in full |
| Inflation is a current theory; trigger unknown; evidence still sought | NASA, Cosmic History; NASA, baby picture | Cosmic History in full; baby picture in part |
| The glow, 380,000 years, "very uniform", "slight variations" | NASA, baby picture | Read in part |
| Expansion slowed, then sped up (matter, dark energy) | NASA, Big Bang (Hubble) | Read in full |
| H0 = 73.04 ± 1.04 | Riess and others 2022, arXiv 2112.04510 | Abstract only |
| H0 = 67.4 ± 0.5 (and **no age** in the abstract) | Planck 2018 VI, arXiv 1807.06209 | Abstract only |
| Hubble 1929 | PNAS 15(3):168–173, PMC522427 | Record read; text is page images; linked at the owner's decision |
| Plain official page: the Hubble time (1/H0) | none found | Gap (§29 rule 3(c)) |
| Plain official page: the horizon problem | none found | Gap (§29 rule 3(c)) |
| Age 13.787 ± 0.020 (Planck 2018) | seen in a search summary only | Not read, not used |

**Open.**
- No plain official page defines the Hubble time or the horizon problem (§29 rule 3(c)); the introduction's matching-sky steps (the two cups of tea, the two strangers, "thousands of separate patches", the horizon as "the farthest it could have heard from") are my own wording and an estimate with no source read, and need the owner's continued approval. The physics is standard; no page read says it in these words.
- NASA's baby-picture page was read in part; Riess, Planck and Mei-style sources were read as abstracts only; Hubble 1929 as a record only. The 13.8 billion years has no uncertainty on the pages read.
- The balloon, the two cups of tea, the two strangers, the candle and the bedsheet pictures are mine and unsourced; NASA's two Big Bang pages differ in framing (one calls the start a point that surged outward, the other says it was not an explosion with a centre), and the page follows Mather.
- The chapter summary in `src/App.tsx` for this chapter was not changed and has not been re-read against the new page.
- **Not checked:** the other guess combinations by eye (the arrow past the bar's end, the tick at its end, the markers for "much shorter" and "close"), the tutor's shortened point 5 and the ruler's left-edge label fix in a browser, narrow widths (at 600 px the picture scales to about 70 percent and its small text gets small), dark mode, other browsers, keyboard use, a real learner.
