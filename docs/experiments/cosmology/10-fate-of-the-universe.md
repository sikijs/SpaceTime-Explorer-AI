# Cosmology — Experiment 10: The Fate of the Universe — Does the Expansion Ever Stop?

**Status: APPROVED by the owner on 2026-10-09 (proposed by Claude per `CLAUDE.md` §23 Stages 1–3 on 2026-10-09, following the completion of Cosmology Experiment 9. The owner decided earlier that "The Fate of the Universe" would be this chapter's closing experiment). Built one step at a time (physics model and tests, interface, prediction interaction, introduction, Results panel, caption, tutor), complete-flow tested in a headless browser and finally reviewed against this specification, `docs/PROJECT.md` and `AGENTS.md` (§21 Steps 9 and 10, 2026-10-09; three gaps found and fixed). The owner's line-by-line wording approval (`CLAUDE.md` §28.1) is complete (2026-10-09), approved as written, covering the introduction (including the "flat" explanation and the constant-dark-energy assumption), the caption, the prediction prompts, the Results panel (including the galaxy-speed example, the "why the expansion rate is what it is" section and the dark-energy-sources wording), and the tutor. See "Implementation Notes".**

This is the tenth and closing experiment of the "Cosmology" chapter.

---

## Overview

Experiments 5 and 6 showed that the universe's expansion is speeding up, because of dark energy, and that this changes how old the universe is. Those experiments looked backward and at the present. This experiment follows the same model **forward in time** and asks: what happens next? Does the expansion keep going? Does it slow down and stop? Does it turn around?

The new idea is one thing: **how the universe's size grows in the future depends on the dark energy share. With no dark energy, the expansion slows down forever but never stops. With any dark energy, each doubling of the universe's size takes about the same time as the one before, so the growth becomes steady and endless.**

Everything else is reused. The size of the universe at any time comes from Experiment 6's exact formula, the time at which a given size is reached comes from Experiment 8's exact formula, and whether the expansion is speeding up today comes from Experiment 5. The experiment does not need any new calculation method.

The experiment's **headline result is the doubling time**: how long the universe takes to double in size, first from today's size to twice today's, then from twice to four times, then from four to eight times. It is exact in this model, it needs no measured data, and it separates the cases cleanly:

- With no dark energy, the doublings take about 17, 48 and 136 billion years: each one takes about 2.8 times longer than the one before.
- With the real dark energy share (70%), they take about 10.7, 11.4 and 11.6 billion years, settling toward a fixed value of about 11.6 billion years.

---

## Learning Objective

After this experiment, the learner should understand:

1. The expansion of the universe is not a one-time event that has finished. It continues, and what it does next depends on what is in the universe.
2. With only matter, gravity pulls everything together, so the expansion slows down. In this model (a flat universe), the slowing never quite brings the expansion to a stop and never reverses it: the universe expands forever, ever more slowly. This is the same idea as an object launched at exactly escape speed (Gravity and Curved Spacetime, Experiment 6).
3. With dark energy, the story changes. The expansion speeds up, and each doubling of the universe's size takes about the same time as the one before. The universe's size then grows steadily and endlessly, in the same way that a bank balance with a fixed interest rate doubles every fixed number of years.
4. Today's universe has both: the expansion slowed down while matter dominated (early on), then began speeding up when dark energy took over. The switch happened roughly 6 billion years ago for the real share, a result the learner can see in the model (the point where the expansion starts to speed up).
5. The weakest-dark-energy universes also eventually speed up. Any dark energy at all will eventually win, because matter thins out as the universe grows and dark energy does not (in this model), so the learner sees that the question is "when", not "whether".
6. What "the fate of the universe" does and does not mean here: this experiment describes **how the size of the universe changes**. It does not describe stars burning out, black holes, or the universe getting cold and dark, and it does not say what dark energy actually is, so it cannot say whether the real future matches the model.

---

## Physical Situation

The same simplified universe as Experiments 5, 6, 8 and 9: **flat, matter plus a constant dark energy,** with today's expansion rate (the Hubble constant) 70 km/s/Mpc. The learner chooses the **dark energy share** `L`, from 0% to 90% (the range used in Experiments 5 and 6), and the matter share is `1 − L`.

Each universe is compared on the same footing as in Experiment 6: **all have the same expansion rate and the same size today**, and the experiment asks how each one continues. "Today" is size 1 and "years from now" is time after today. (Because different universes need different times to reach today's size, a universe with no dark energy is 9.3 billion years old today in this comparison, and one with 70% is 13.5 billion. This is a property of the comparison, as in Experiment 6.)

### The two exact results

The size of the universe at a time `t` after the Big Bang (Experiment 6's closed forms, reused unchanged):

- `L = 0`: `a = ((3/2) × H0 × t)^(2/3)`
- `L > 0`: `a = ((1 − L) / L)^(1/3) × sinh((3/2) × sqrt(L) × H0 × t)^(2/3)`

Two limits follow from these formulas and make the long-term behavior testable:

- **With no dark energy,** `a` grows as `t^(2/3)`. The expansion rate (the Hubble constant's value at that time, `H`) falls as `1 / t` toward zero but never reaches it, and `a` grows without limit.
- **With dark energy,** `sinh` grows like an exponential, so at late times `a` grows by the same factor in every equal stretch of time. The expansion rate `H` settles to a fixed value `H0 × sqrt(L)` (about 58.6 km/s/Mpc for `L = 0.7`), and the **doubling time** settles to `ln 2 / (H0 × sqrt(L))` (about 11.6 billion years for `L = 0.7`).

### When the expansion starts speeding up

The expansion starts to speed up when the universe reaches the size `a_switch = ((1 − L) / (2 L))^(1/3)`. For `L = 0.7` this is `a_switch = 0.598`, which is redshift 0.67 and about 6 billion years ago (the model gives a switch at about 7.3 billion years after the Big Bang, against 13.5 for today). For `L = 1/3` the switch happens exactly today (`a_switch = 1`), which agrees with Experiment 5's result that the expansion today speeds up only when `L` exceeds 1/3. For `L` below 1/3 the switch is still in the future, and for `L = 0` there is no switch.

### What the numbers look like (worked out for this specification: Hubble constant 70)

**Size of the universe, in units of today's size, after a given time from now:**

| Dark energy share `L` | +10 billion years | +20 billion years | +50 billion years | +100 billion years |
|---|---|---|---|---|
| 0% | 1.6 | 2.1 | 3.4 | 5.2 |
| 30% | 1.8 | 2.7 | 8.9 | 64 |
| 70% (real best fit) | 1.9 | 3.5 | 21 | 425 |
| 90% | 2.0 | 4.0 | 30 | 906 |

**Time for each successive doubling, in billion years:**

| Dark energy share `L` | Size 1 → 2 | 2 → 4 | 4 → 8 | Settles to |
|---|---|---|---|---|
| 0% | 17.0 | 48.2 | 136.2 | keeps growing (about 2.8 times longer each time) |
| 30% | 12.9 | 16.7 | 17.5 | 17.7 |
| 70% (real best fit) | 10.7 | 11.4 | 11.6 | 11.57 |
| 90% | 10.0 | 10.2 | 10.2 | 10.2 |

(The "settles to" column is `ln 2 / (H0 × sqrt(L))`; its 30% and 90% entries are computed from that formula and should be checked by the tests below.)

### Simplifying assumptions (must be stated to the learner, in plain language)

- **Same simplified universe as Experiments 5, 6, 8 and 9:** flat, matter plus constant dark energy, Hubble constant 70. Radiation (light and other very fast particles) is left out. It matters only in the very early universe, so it makes no practical difference to the future.
- **The dark energy is assumed to be a constant that never changes.** This is the simplest possibility and agrees with the measurements so far, but nobody yet knows what dark energy is. If it changed with time, the future could be very different. This is the largest uncertainty in the experiment, so it is stated in the introduction, Results and tutor, and it is shown prominently in a bordered caveat box (`CLAUDE.md` §28.1 pattern).
- **"Flat" is assumed, not derived** (as in Experiments 5, 6 and 8). A universe that is not flat could in principle turn around and collapse even without a negative dark energy; this experiment does not cover that.
- **Only the expansion is modelled.** The experiment says how the size of the universe changes. It does not model stars running out of fuel, black holes, or the universe becoming cold and dark, though these are the processes most people think of as "the end of the universe".
- **Things held together by their own gravity do not expand** (a galaxy, the Milky Way and its neighbors, the Solar System, you). Only the space between such groups stretches. Experiment 9's "clumps" are such objects. This is stated, not modelled.
- **Each universe's "today" is matched to the real one** (same expansion rate and same size), as in Experiment 6.

### Not introduced

Negative dark energy (a "Big Crunch" in a flat universe), dark energy that changes with time (the "Big Rip" and other possibilities), a curved universe, the cosmic event horizon (the distance beyond which light will never reach us), the future of stars and black holes, the heat death and entropy, and vacuum decay. All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16). The tutor may name a few of these, in a single sentence, as things the model cannot say anything about (see Decision 3).

---

## Physics Model

One new, self-contained module. It deliberately **reuses** earlier experiments' code unchanged (imported, not redefined):

- `relativeSizeAtTime`, `universeAgeYears` from Experiment 6 (`universeAgeExperiment.ts`),
- `timeAfterBigBangYears` from Experiment 8 (`observableUniverseExperiment.ts`), which gives the time at which a given size is reached,
- `expansionRateRatio`, `decelerationParameter`, `BEST_FIT_DARK_ENERGY_FRACTION` and `MAX_DARK_ENERGY_FRACTION` from Experiment 5 (`darkEnergyExperiment.ts`),
- `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` from Experiment 1 (`hubblesLawExperiment.ts`).

The new calculations are small and exact: the size at a time from now, the doubling times (differences between two reused time calculations), the long-term limits above, and the switch size.

```typescript
// src/physics/fateOfTheUniverseExperiment.ts

export const FUTURE_GRAPH_MAX_YEARS = 100e9     // fixed axis so the graph does not jump (see Decision 5)
export const NUMBER_OF_DOUBLINGS_SHOWN = 4      // sizes 1→2, 2→4, 4→8, 8→16

// Size of the universe (today = 1) a given number of years from now.
export function futureRelativeSize(yearsFromNow: number, darkEnergyFraction: number): number

// Years for the universe to grow from one size to another (difference of two timeAfterBigBangYears values).
export function yearsToGrow(fromSize: number, toSize: number, darkEnergyFraction: number): number

// The expansion rate (the Hubble constant's value at that time), in km/s/Mpc, when the universe has
// the given relative size: H0 × expansionRateRatio(1/size - 1, darkEnergyFraction).
export function expansionRateAtSize(relativeSize: number, darkEnergyFraction: number): number

// The value the expansion rate settles to, H0 × sqrt(L). Zero when L = 0 (it falls toward zero).
export function longTermExpansionRate(darkEnergyFraction: number): number

// The doubling time the universe settles to, ln 2 / (H0 × sqrt(L)), in years. Infinity when L = 0.
export function longTermDoublingTimeYears(darkEnergyFraction: number): number

// The size at which the expansion starts to speed up, ((1 - L) / (2 L))^(1/3). Infinity when L = 0.
export function speedUpSize(darkEnergyFraction: number): number

export interface FateResult {
  darkEnergyFraction: number
  accelerationToday: boolean                 // from Experiment 5's decelerationParameter (< 0)
  speedUpSize: number                        // Infinity if it never happens
  speedUpYearsFromNow: number | null         // negative = in the past; null if it never happens
  doublings: Array<{ fromSize: number; toSize: number; years: number }>  // NUMBER_OF_DOUBLINGS_SHOWN entries
  doublingTimeRatios: number[]               // each doubling's years divided by the one before
  longTermDoublingTimeYears: number          // Infinity when L = 0
  expansionRateToday: number                 // always the Hubble constant (70)
  expansionRateAtEnd: number                 // at FUTURE_GRAPH_MAX_YEARS
  longTermExpansionRate: number
  sizeAtEnd: number                          // size at FUTURE_GRAPH_MAX_YEARS from now
  curve: Array<{ yearsFromNow: number; relativeSize: number }>   // from -pastYears to +FUTURE_GRAPH_MAX_YEARS
  fate: 'slows-forever' | 'steady-growth'    // L = 0, or L > 0
}

export function runFateOfTheUniverseExperiment(darkEnergyFraction: number): FateResult
```

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser.

---

## Learner Controls

- **How much dark energy:** presets "None (0%)", "Weaker (30%)", "The real best fit (70%)" and "Stronger (90%)", plus a custom slider from 0% to 90% (the range used in Experiments 5 and 6). The presets are chosen so that the picture differs clearly: 0% (the expansion slows forever), 30% (it slows now, then speeds up in the future), 70% (the real case, already speeding up) and 90% (a quick speed-up). 30% is the case that shows the "when, not whether" idea (Objective 5).
- **Run**, which plays the universe's growth from today to 100 billion years from now over a fixed duration, independent of the physics result (`CLAUDE.md` §11).

---

## Prediction Activity

Before the controls and results are shown, the learner answers two questions in sequence (not scored), about the **real** universe (the 70% best fit):

1. "The universe is expanding today. What do you think the far future looks like?" (The expansion slows down and stops / The expansion keeps going, but ever more slowly / The expansion keeps speeding up and never stops)
2. "Suppose the universe takes about 11 billion years to double in size from today. How long will the next doubling take, from twice today's size to four times?" (Shorter, about 5 billion years / About the same, about 11 billion years / Much longer, about 30 billion years)

Both are marked against the real 70% case, whatever the learner later chooses on the slider, and the Results panel says so plainly. For prediction 1 the model's answer is the third option (the size grows ever faster, because the expansion is already speeding up today); the second option ("keeps going, but ever more slowly") is what the model gives for no dark energy, so the learner can reach it by moving the slider. For prediction 2 the answer is the middle option (about 11.4 billion years).

The controls are disabled until both predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the choices. The graph, doubling bars and caption appear only after predictions are locked in (`CLAUDE.md` §12).

---

## Experiment Behavior

### Display

- **A size-versus-time graph (labeled), the main picture:** the universe's size against time, from now to 100 billion years from now, on a **logarithmic vertical axis** (so a steady doubling shows as a straight line, which is the point of the picture). Today is marked, and the learner's chosen dark energy share is drawn as a thick line. The no-dark-energy curve is drawn as a thin reference line, so the contrast is visible whichever share is chosen (when "None" is chosen, the reference line is drawn under the main line and the label says so). A marker shows where the expansion starts to speed up if that falls inside the plotted range (a small, labeled dot; it is before today for the real case, and the graph's axis starts a little before today so that this dot is visible).
- **A "doubling times" picture (labeled), the headline picture:** four horizontal bars, one for each successive doubling (1 → 2, 2 → 4, 4 → 8, 8 → 16), with the time each takes written on or beside it, drawn to a true scale. When dark energy is present the bars become equal in length; with none they grow longer and longer. A thin marker shows the settled value. The 8 → 16 bar for 0% is about 380 billion years, so the picture uses a fixed, labeled scale with a break mark on bars that run past the edge (see Decision 5).
- **A "galaxies spreading out" strip (schematic, labeled):** a row of galaxies with a cluster (Milky Way with its neighbors) at one end, shown at today, and then as the run plays, with the spaces between them stretching in step with the model's size, while the cluster itself stays the same size. It is drawn schematically (not to scale, no real galaxies) and labeled so. It is there to show Objective 6's point that only the space between groups stretches. The strip is not an extra calculation: it is drawn from the same size value as the graph.
- **Live readout:** years from now, size relative to today, the expansion rate, and the current doubling time (the time for the next doubling).
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are submitted, in the same step-by-step style as Experiments 5 to 9.

### Results

States, for the chosen share: the size at 50 and 100 billion years from now, the four doubling times and whether they settle, whether the expansion is speeding up today and when it started or will start, and the expansion rate today and at the end of the run (with its long-term limit); compares both predictions with what the model gave for the real case; includes simple math per `CLAUDE.md` §15, for example, "the first doubling takes 10.7 billion years and the next takes 11.4, so it is not slowing down much" and "if the size doubles every 11.6 billion years, then in 50 billion years it doubles about 4.3 times: 2 × 2 × 2 × 2 × 1.2 or about 20"; includes a daily-life comparison, a savings account at a fixed interest rate, which doubles every fixed number of years however large it gets (and, for the no-dark-energy case, the escape-speed comparison from Gravity and Curved Spacetime, Experiment 6, a ball thrown fast enough that it slows down forever but never comes back); and states the model's limits and caveats in a prominent bordered box (`CLAUDE.md` §28.1 pattern), above all that the dark energy is assumed constant, and that nobody yet knows what it is.

### Introductory text

To be drafted during implementation, covering the question (what happens to the universe next?), what happens, the learner's job, what to look for, new terms defined in plain language before use (**doubling time**, **expansion rate**), reuse of Experiments 1, 2, 5 and 6, a "Why even ask this" paragraph, and the assumptions above. Any daily-life picture that gives away the answer to the predictions (the savings account, the escape-speed analogy) is kept out of the introduction (§12). Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "Look at the doubling times. Do they get longer, shorter, or stay about the same? What changed when you added dark energy?"
  2. Prediction comparison: the learner's two predicted answers beside what the model gave.
  3. Conceptual question: "With only matter, gravity pulls everything toward everything else. So why does the universe not simply fall back together?" — intended to let the learner reach "the expansion started with a huge push, so the pull only slows it down."
  4. Explanation: (1) with only matter the pull of gravity slows the expansion, but in this model it never quite stops it, like a ball thrown at exactly escape speed; (2) dark energy does not thin out as the universe grows, while matter does, so as the universe grows, matter's pull weakens and dark energy's push wins, whatever the starting shares; (3) the result is a steady doubling time, which is exactly what a fixed rate of growth does (the savings account); (4) the real switch from slowing to speeding up happened about 6 billion years ago; (5) things held together by their own gravity (galaxies, clusters like Experiment 9's) do not expand, so what grows is the space between them; (6) honest limits: the model assumes the dark energy never changes, which nobody knows, it covers only the expansion and not the lives of stars, it assumes a flat universe, and it leaves out other possibilities (a recollapse or a runaway "Big Rip" if dark energy changed), which this experiment cannot say anything about; (7) not covered: what happens to stars, black holes and matter in the far future.

---

## Required Physics Tests

1. `futureRelativeSize(0, L)` equals 1 for every `L` (today is size 1), and it increases with time for every `L`.
2. `futureRelativeSize` agrees with Experiment 6's `relativeSizeAtTime` evaluated at `universeAgeYears(L) + yearsFromNow`, and the table values (for example, about 21 at +50 billion years for `L = 0.7`, and about 3.4 for `L = 0`) agree to within 1%.
3. `yearsToGrow(1, 2, 0)` is about 17.0 billion years. With `L = 0`, `yearsToGrow(s, 2s, 0)` equals `(2/3) × Hubble time × s^(3/2) × (2^(3/2) − 1)`, so each doubling takes `2^(3/2)` (about 2.83) times as long as the one before, checked at several sizes.
4. For `L = 0.7`, successive doubling times match the table values (10.7, 11.4, 11.6) to within 1%, and the ratio of consecutive doubling times approaches 1.
5. For every `L > 0`, the doubling time at large sizes approaches `longTermDoublingTimeYears(L)` to within 0.1% (checked at size 1,000 for several `L`), and `longTermDoublingTimeYears(0.7)` is about 11.57 billion years.
6. `longTermDoublingTimeYears(0)` is `Infinity`, and with `L = 0` the doubling times grow without limit (each larger than the last).
7. `expansionRateAtSize(1, L)` equals the Hubble constant (70) for every `L`; for `L > 0` it decreases with size toward `longTermExpansionRate(L)` and stays above it; for `L = 0` it decreases with size toward zero and is below any given positive value at a large enough size.
8. `longTermExpansionRate(0.7)` is about 58.6 km/s/Mpc.
9. `speedUpSize(1/3)` equals 1 (agreeing with Experiment 5's threshold, `decelerationParameter(1/3) = 0`), `speedUpSize(L) < 1` if and only if `decelerationParameter(L) < 0`, `speedUpSize(0.7)` is about 0.598, and `speedUpSize(0)` is `Infinity`. At the size `speedUpSize(L)`, the expansion's speeding-up changes sign (checked by a small numerical difference in `sizeSpeed = a × H`).
10. For `L = 0.7`, `speedUpYearsFromNow` is negative (in the past, about −6 billion years), and for `L = 0.3` it is positive (in the future).
11. `runFateOfTheUniverseExperiment` returns `fate = 'slows-forever'` if and only if `L = 0`, returns exactly `NUMBER_OF_DOUBLINGS_SHOWN` doublings, and the curve is increasing and ends at `FUTURE_GRAPH_MAX_YEARS`.
12. The module imports its functions from `universeAgeExperiment`, `observableUniverseExperiment`, `darkEnergyExperiment` and `hubblesLawExperiment` rather than redefining them — a regression check (`CLAUDE.md` §8).

---

## Decisions Needing Human Review

1. **Title and placement.** Proposed: "The Fate of the Universe — Does the Expansion Ever Stop?" as Cosmology Experiment 10 and the chapter's closer, per the owner's earlier decision. Alternative titles: "What Happens Next?" or "The Far Future".
2. **The headline result is the doubling time.** Proposed, because it is exact, needs no measured data, separates the cases cleanly, and gives the learner one simple thing to look at and predict. The alternatives are the expansion rate (which is also shown, as a readout) or the size at a chosen time (shown in the table and the graph). The doubling time is also the idea most likely to feel new, so please confirm.
3. **How much to say about other fates.** Proposed: include only the cases the model supports (no dark energy, and constant dark energy), and name the others (a recollapse, the "Big Rip", the heat death) in a single sentence each as things the experiment cannot say anything about, without any numbers. Alternatives: leave them out completely, or add a negative-dark-energy slider so a recollapse can actually be shown. The negative slider is a real extension (Experiment 6's formula would need a `sin` form for `L < 0`, which no earlier experiment has) and a second new idea, so I recommend against it for this experiment, but it would be a natural separate experiment if the owner wants it.
4. **Dark energy assumed constant.** Proposed: yes, as in Experiments 5, 6, 8 and 9, but it is stated prominently, because here it is the whole question. Originally flagged: "I believe the real evidence still allows some change with time, but I have not checked." **Checked against sources on 2026-10-09 at the owner's request; see "Implementation Notes", "Sources checked: is dark energy constant?"** The finding is that it is an open, actively tested question, so the wording was changed from "fits the measurements so far" to say that many measurements fit it but some recent results hint at weakening. Still for the owner's approval.
5. **Fixed axes.** Proposed: a fixed 100-billion-year range for the size graph (large enough to show the contrast; the sizes at the end run from 5 for `L = 0` to about 900 for `L = 0.9`) and a fixed, labeled scale with break marks for the doubling bars (the no-dark-energy bars would otherwise be hundreds of billions of years long). 100 billion years is only an axis choice, not a prediction of any real event, and the caption says so.
6. **The prediction questions.** Proposed: prediction 1 asks for the fate (three options), prediction 2 asks for the next doubling time, both about the real case. The ordering is chosen so that prediction 1 comes from everyday intuition ("things slow down") and prediction 2 is the one the learner can most easily see wrong. Please confirm, especially the prediction 2 numbers (5, 11, 30 billion years) used for the options.
7. **The daily-life comparisons.** Proposed: a savings account at a fixed interest rate for the doubling time (also used in Experiment 9's Results panel, so the learner already knows it), and the escape-speed ball for the no-dark-energy case (from Gravity and Curved Spacetime, Experiment 6). Both are kept out of the introduction so they do not reveal the answer. The escape-speed analogy is a real feature of the flat model (it is exactly the borderline case), not just an illustration, but I have not worked out how far to take it in the explanation.
8. **"Galaxies spreading out" strip.** Proposed: a schematic drawing so the learner sees that bound groups stay the same size and only the space between them stretches. It is the one part of the picture that goes beyond a graph of the model, so it is labeled schematic and not to scale (`docs/PROJECT.md` §9: an animation must not imply an effect that is not in the model). The owner should review it in the browser.
9. **What is stated about the far future of stars and matter.** Proposed: only that the experiment does not cover it. I have not researched those timescales and the specification contains no numbers about them. If the owner wants real-world grounding there (as was added to the Black Hole experiment), it needs a source check first.
10. **The term "expansion rate".** Proposed: use "expansion rate" for the Hubble constant's value at a given time, and say once, in plain language, that "constant" in "Hubble constant" means constant across space at one time, not constant in time. Experiment 1 introduced the name, so this experiment clarifies it rather than renaming it.
11. **Matching "today" across universes.** Proposed: as in Experiment 6, every universe has the same expansion rate and size today, so a universe with no dark energy is 9.3 billion years old today. This is stated, not hidden.

---

## Relationship to Previous Experiments

- **Cosmology Experiments 5 and 6 (dark energy, the age of the universe):** this experiment uses their exact size formula and their dark energy range, but runs it forward instead of backward. Experiment 5's "expansion is speeding up" is the starting fact; Experiment 6's age comparison is the matching convention.
- **Cosmology Experiment 8 (the observable universe):** its time-at-a-given-size formula gives the doubling times.
- **Cosmology Experiment 9 (structure formation):** it ended with dark energy slowing the growth of clumps and named this as the next topic. Its bound clumps are the things that do not expand here.
- **Cosmology Experiments 1 and 2 (Hubble's Law, the Big Bang):** the expansion rate and the idea that the expansion has a history.
- **Gravity and Curved Spacetime, Experiment 6 (orbits) and Experiment 7 (black holes):** the escape-speed picture for the no-dark-energy case.

## Relationship to Later Experiments

This is the planned closing experiment of the "Cosmology" chapter. A recollapsing universe (negative dark energy), dark energy that changes with time, the cosmic event horizon, and the far future of stars and black holes are each natural candidates for a later experiment, but none is proposed or approved here.

---

## Success Criteria

1. The learner makes both predictions before the graph, the doubling bars and the caption are shown.
2. Choosing a different dark energy share visibly changes the graph and the doubling bars, not just a number: with no dark energy the bars grow longer and the curve bends away from a straight line; with dark energy the bars become equal and the curve is straight on the log axis.
3. The size graph shows the chosen share and the no-dark-energy reference, with labeled axes and units, and marks today. The doubling picture is drawn to a true, labeled scale, with clearly marked break marks where a bar runs off it.
4. The Results panel correctly compares both predictions with what the model gives for the real case, with the worked numbers.
5. The experiment states plainly that, with only matter, the expansion slows forever without stopping in this model, and that with dark energy the doubling time becomes steady.
6. The experiment states plainly that the speed-up is a property of the dark energy assumed constant, and that nobody yet knows what dark energy is, in the introduction, Results (in the prominent bordered box) and tutor.
7. The model's limits (flat, constant dark energy, expansion only, no stars or black holes, bound objects not expanding) are stated in the introduction, Results and tutor, and the experiment does not claim to predict how the real universe ends.
8. "Doubling time" and "expansion rate" are defined in plain language at first use (`CLAUDE.md` §15).
9. The "galaxies spreading out" strip is labeled schematic and shows the bound group staying the same size.
10. No existing experiment's physics is modified or recomputed.

---

## Implementation Notes

Built one step at a time per `CLAUDE.md` §6.

**Step 1 — physics model and tests (2026-10-09):** `src/physics/fateOfTheUniverseExperiment.ts` and `src/physics/fateOfTheUniverseExperiment.test.ts` (23 tests, covering all 12 of "Required Physics Tests"). No UI, prediction, results, tutor, introduction, or `App.tsx` wiring yet. Nothing from an earlier experiment was modified.

Differences from the text above:

- The module also imports `hubbleTimeYears` from `bigBangExperiment` (for the settled doubling time), which the "Physics Model" import list does not name. It is a reuse, not a new calculation.
- The curve starts `PAST_GRAPH_YEARS` (10 billion years) before today so the real case's speed-up point (about 6 billion years ago) is visible, as the "Display" section requires. For no dark energy, today is only 9.3 billion years after the Big Bang, so the earliest samples have size 0 and the curve is non-decreasing there, not strictly increasing. The UI will need to skip those points on a logarithmic axis.
- The specification's "settles to" figures for 30% and 90% were checked against the formula: 17.7 and 10.2 (the table's 90% entry was corrected from 10.1 to 10.2 before approval).
- Test 9's "the speed-up changes sign" is checked as: the speed at which the universe grows (size times expansion rate) is lowest at the switch size.

**Step 2 — basic interface (2026-10-09):** `src/components/FateOfTheUniverseExperiment.tsx`, wired into `src/App.tsx` as "The Fate of the Universe" under "Cosmology" (Experiment 9's "next" line now points here; the new chapter's summary text is a draft placeholder, and the chapter never shows it until the tutor exists). It has the dark energy control (four presets and a custom slider), Run (a fixed 10-second playback of 0 to 100 billion years from now, separate from the physics, `CLAUDE.md` §11), a live readout, the three labeled pictures (the log-axis size graph, the doubling bars, the schematic strip) and a "How to read this diagram" caption. It deliberately has no introduction, prediction gating, results panel, or tutor yet, so the pictures and caption are shown from the start; the "hidden until predictions are locked in" rule (`CLAUDE.md` §12) is for the prediction step to add.

Checked in a headless browser (`http://localhost:5173/`, chapter 36): the real case ends at 425 times today's size with the doublings 10.7, 11.4, 11.6, 11.6 billion years and the speed-up dot in the past; no dark energy ends at 5.2 times with doublings 17.0, 48.2, 136.2 and 385.3 (the last two cut with break marks); 30% shows the speed-up dot just after today. All numbers match the model, and no console errors. Fixed after viewing: the off-scale bars' labels ran off the picture (now inside the bar), the legend listed a hidden reference line when no dark energy is chosen (now says "the same as your choice"), and bar labels are outlined so the dashed "settles to" line does not hide them. Left as is: at 30% the dashed line still crosses the first bar's label, which stays readable. The strip's spacing is a schematic mapping (each doubling adds the same step), stated on the picture. Not checked: a 390-pixel window, the Custom slider, and any browser other than headless Chrome.

**Step 3 — learner prediction interaction (2026-10-09):** in `src/components/FateOfTheUniverseExperiment.tsx`. The two questions from "Prediction Activity" gate the dark energy control and Run until both are answered; the first Run locks them in; a "Change predictions" control reopens both without resetting the chosen share; and the three pictures and the caption are hidden until predictions are locked in (`CLAUDE.md` §12). The wording and options are exactly those in "Prediction Activity" (the second option of question 1 is "The expansion keeps going, but ever more slowly"). Choices are stored but not marked yet; marking against the real best fit (question 1: "keeps speeding up", question 2: "about the same") is for the Results step. The live readout appears only once a run has started, so it also appears only after predictions are locked in.

Checked in a headless browser (chapter 36): at the start the share buttons and Run are disabled, no picture or caption is shown, and a hint says to answer first; after both answers the controls unlock; Run locks the predictions and shows the three pictures, the caption and "Change predictions"; "Change predictions" hides the pictures again, keeps the earlier answers and the chosen share (checked with "None (0%)"), and a changed answer then shows in "Your predictions" after the next Run; saved progress records the chapter as completed after a run. No console errors. Full suite 426/426 and no type errors in the component. Not checked: keyboard use, a 390-pixel window.

**Step 4 — introduction and Results panel (2026-10-09):** in `src/components/FateOfTheUniverseExperiment.tsx`. The introduction (above the predictions) has the question, what happens, the new terms (size, doubling time, expansion rate, megaparsec) with the "constant" in "Hubble constant" clarified (Decision 10), a "Why even ask this" paragraph, the job, what to look for, and six assumptions (the same simple universe and Hubble tension caveat; constant dark energy as the biggest uncertainty; flat assumed; only the expansion modeled; bound objects do not expand; every universe matched to the real one today). It contains no daily-life picture and gives away neither prediction's answer (§12). The Results panel appears when a run completes. It has a table (size at 50 and 100 billion years, the four doublings and whether they settle, whether and when the expansion speeds up, the expansion rate today, after 100 billion years and its long-term value), a worked calculation (for no dark energy, 2.83 times longer each doubling; otherwise 50 billion years as about 4.3 doublings of the settled time, giving about 20 against the model's 21.3), a worked galaxy-speed example, both predictions marked against the real best fit, the savings-account comparison (and, for no dark energy only, the escape-speed ball), the prominent bordered caveat box, and a short list of simplifications.

Decisions made in the build: (1) the galaxy-speed example (a galaxy 100 megaparsecs away: 7,000 km/s today, about 124,500 km/s after 50 billion years for the real case, but falling to about 3,800 for no dark energy) was added because the expansion rate falls from 70 to 58.6 while the expansion speeds up, which a learner would otherwise find contradictory; it is not in the specification above and is for the owner to approve or remove. (2) Prediction 1 is marked right only for "keeps speeding up and never stops"; the other two get "off this time" with an explanation (the second is what the model gives with no dark energy; the first is not what any share in this model gives). (3) Prediction 2 is marked right only for "about the same". (4) The Big Crunch and Big Rip are named, once each, in the caveat box as things the model cannot speak to (Decision 3); heat death is left to the tutor.

**Wording drafted by Claude that the specification does not contain** (not yet approved by the owner, `CLAUDE.md` §28.1): the whole introduction, including the "Why even ask this" paragraph's claims; the whole Results panel text; the galaxy-speed example; and the "falls by more than the distance grows" explanation for no dark energy.

Checked in a headless browser (chapter 36): every table value matches the model for 70% and for 0% (21.3 and 425 times; 10.7, 11.4, 11.6, 11.6 billion years; 6.1 billion years ago; 3.44 and 5.17 times; 17.0, 48.2, 136.2, 385.3); wrong predictions are marked off honestly and right ones right; the escape-speed paragraph appears only for 0%. Fixed after reading the output: the galaxy-speed paragraph's heading and closing sentences were wrong for no dark energy (the speed goes down there), and its aside about speeds above light speed was not true of the numbers shown, so it now says "far enough away". Not checked: the introduction's appearance at a 390-pixel window, keyboard use, and the Results table at narrow widths. The doubling-time figures for 30% and 90% were not read back from the browser (only the model tests cover them).

**Caption rewrite (2026-10-09, at the owner's request, before the tutor):** the "How to read this diagram" caption in `src/components/FateOfTheUniverseExperiment.tsx` was rewritten as a step-by-step explanation in the style of Experiments 5 to 9: an overview, then one section per picture (the graph: both axes, why the vertical axis goes up by 10 each step and how to read a straight, flattening or upward-bending line, the gold and blue lines, the white and pink dots; the bars: what each bar is with an example, why doublings, the fixed scale and the break mark, comparing bar to bar, the pink dashed line and the white outline; the strip: what is drawn, what it shows with a rubber-sheet comparison, and why it is not to scale), and an explanation of each item in the line of numbers above the pictures. It states how to read the pictures without giving the results away. The rubber-sheet comparison and the whole rewrite are wording drafted by Claude for the owner's approval.

**Step 5 — AI tutor (2026-10-09):** `src/components/FateOfTheUniverseTutor.tsx`, rendered by the experiment after a completed run (once predictions are locked in), reporting completion through `onTutorComplete` so `src/App.tsx` shows the chapter summary. It follows the specification's "AI Tutor Behavior": the observation question about the doubling bars, a comparison with the learner's two predictions, the conceptual question ("with only matter, why does the universe not simply fall back together?"), then a seven-point explanation: (1) matter only slows the expansion forever without stopping it (with the 2.83-times-longer worked numbers and the escape-speed ball), (2) dark energy does not thin out while matter does (with the one-eighth density example, matter's contribution falling from 0.30 to about 0.00003 by 50 billion years, and that even a 10% share wins eventually, "when, not whether"), (3) steady doubling with dark energy (the savings account, and the "rule of 70" worked: about 6.0% growth per billion years gives about 11.7 against the exact 11.6), (4) the real switch about 6.1 billion years ago at size 0.60, (5) bound objects do not expand, (6) the honest limits (constant dark energy, flat, expansion only; the Big Crunch and Big Rip named once, as things the model cannot speak to), (7) not covered (stars, black holes, the universe growing cold and dark, what dark energy is). All numbers come from the model. Decision made in the build: the specification's point (3), a savings account, was extended with the "rule of 70" arithmetic to make the doubling time concrete; it is a rough rule and the text says it is not exact.

**Wording drafted by Claude that the specification does not contain** (for the owner's approval, `CLAUDE.md` §28.1), in addition to the earlier list: the tutor's three questions' wording, all seven explanation points, and the rule-of-70 and one-eighth-density examples. Point 2's statement that dark energy "is a property of space itself, so more space means more of it" is a simplification of the constant-dark-energy assumption.

Checked in a headless browser (chapter 36): the three reflection steps advance only with a typed answer; the explanation appears after the third; saved progress records both `completed` and `explained`; the chapter summary then appears; no console errors. A first test run hit a transient Vite hot-reload error right after a file edit and a flaw in my test script (not in the page); both were fixed and the run repeated cleanly. Not checked: the tutor and caption at a 390-pixel window, keyboard use. The chapter summary text in `src/App.tsx` is still a draft placeholder, and its "next" line says this is the last experiment (accurate for now, since no further experiment is approved).

**Complete-flow test (2026-10-09, §21 Step 9) and final review (§21 Step 10), in a headless browser** (`http://localhost:5173/`) from a cleared `localStorage`, against this specification, `docs/PROJECT.md` and `AGENTS.md`. The flow: expand the sidebar's Cosmology group and open the chapter; the introduction shows all its parts; both predictions gate the controls and Run; the pictures and caption stay hidden until the first Run locks the predictions; a mid-run frame shows the white dot, readout and strip advancing together; "Change predictions" mid-run stops the animation and keeps the answers and share; Results appear only when a run completes; the tutor's three steps and seven-point explanation work; saved progress records both `completed` and `explained`; and the chapter summary then appears. Checked the four presets and the Custom slider at 1%, 5%, 33% and 90% (the extremes of the model's behavior), a 390-pixel window, and console warnings and errors (none). All ten Success Criteria and all twelve Required Physics Tests are met (23 tests; full suite 426/426), and no earlier experiment's physics or components changed (only `src/App.tsx` was edited, 10 lines for this chapter).

Gaps found and fixed in the review:

- **The Results' simple calculation was wrong for small dark energy shares.** At 1%, the text said the doubling time "barely changes" and "differs a little", while the doublings are 16.8, 42.4, 76.7, 93.2 billion years and the steady-doubling estimate was off by 60%. It now uses the steady-doubling arithmetic only when the first doubling is already at least 70% of the settled time (it then states the real percentage difference, for example 19% at 33% and 6% at 70%), and otherwise says the doublings are still lengthening and the simple rule does not describe the early part of the run. The table's "Do the doublings settle?" row also says "not there yet" if the fourth doubling is not within 5% of the settled value.
- **Labels were cut off at the right edge of the bars picture** at small shares: the "Settles to" label (the settled value, such as 96.8 billion years, is past the 80-billion-year scale) and a bar of 76.7 billion years. Long bars now carry their label inside the bar, and the "Settles to" label moves to the left of its marker and says "(off the scale)" when it is.
- **The tutor said "early on, matter dominated"**, which is not strictly true of the first tens of thousands of years, when light dominated. It now says "for most of its history". The model leaves radiation out, as the introduction states.

Differences from the text above, and decisions made:

- The preset label is "The best fit to observations (about 70%)" (the wording Experiment 6 uses) and not "The real best fit (70%)".
- The strip's spacing is a schematic mapping (the same step for each doubling), stated on the picture, so that it fits at every size; the exact spacing is written above it. The specification said only that the drawing follows the model's size.
- "Heading toward X, but not there yet" and the 70% and 5% thresholds above are presentation choices made in the review, not in the specification.

**Addition after the review: why the expansion rate is what it is (2026-10-09, at the owner's request).** The owner asked where the reason for the differing expansion rates was explained, and it was not: the introduction and caption define the expansion rate, the table shows its values, and tutor point 2 gave matter's falling contribution, but nothing connected the two or explained the settled value. Claude drafted the explanation, the owner reviewed it in conversation (approving the formula as drafted, defining "contribution" in the introduction, and asking whether dark energy changes), and it was added:

- **Introduction:** the terms paragraph now says the matter and the dark energy each add a part to the expansion rate, calls each one's part its "contribution", and says the two add up to 1 today (0.30 and 0.70 for the real universe).
- **Results:** a new "Why the expansion rate is what it is" section, placed before the prediction checks, with the formula (expansion rate = today's rate × the square root of (matter's contribution + dark energy's contribution)), the worked numbers for the chosen share (today, after 50 billion years, and the settled value, for example 70 × √0.70 ≈ 58.6), the settled values for 90%, 70% and 33% and the no-dark-energy case, a "Does dark energy change?" paragraph (in this model no: it is assumed constant, which is an assumption and not a certainty; the measurements so far fit it, nobody knows what dark energy is, and if it changed the rate would settle elsewhere), and a two-taps comparison (one tap turning itself down, one steady) with a note that it is not exact because of the square root.
- **Tutor point 3:** one added sentence saying the expansion rate settles because matter's contribution has faded, leaving only dark energy's.

The formula is exact in the model (it is Experiment 5's `expansionRateRatio`, squared), not a new calculation, and the "contribution" wording is new learner-facing text. This wording is drafted by Claude and still needs the owner's approval as written; the owner has not yet reviewed the final text in the interface. Checked in a headless browser for 70%, no dark energy and 33%: all numbers match the model, and the "bath" paragraph and the no-dark-energy variant read correctly. Not checked: this section at a 390-pixel window.

**Sources checked: is dark energy constant? (2026-10-09, web search and the pages below, at the owner's request).** Summary, as of October 2026: it is an open question. A constant dark energy (the model's assumption) remains the standard simplest model and fits many measurements, but since 2025 there have been hints that it may be weakening, which are neither confirmed nor dismissed.

- **DESI, March 2025 (first three years of data, "DR2")**: combining DESI's galaxy-map ("BAO") measurements with the cosmic microwave background gives a 3.1-sigma preference for dark energy that changes with time over a constant one, and adding supernova samples gives 2.8 to 4.2 sigma depending on the sample (sigma is a measure of how unlikely the result would be by chance; 5 sigma is the usual discovery threshold). The DESI paper says the standard model "is being challenged" and that changing dark energy "offers a possible solution." A university summary of the same release says the preference has "not risen to 5 sigma" and quotes the collaboration that "many 3-sigma events in physics have faded away with more data." The pattern reported is dark energy weakening over time. ([DESI DR2 paper abstract](https://arxiv.org/abs/2503.14738); [UC Santa Cruz summary](https://news.ucsc.edu/2025/03/desi-dark-energy-evolve/))
- **Supernova systematics as an alternative explanation**: one paper argues that errors of the size possible in the Dark Energy Survey's supernova sample can bring it into agreement with the standard constant model. ([arXiv 2408.07175](https://arxiv.org/abs/2408.07175))
- **Dark Energy Survey, January 2026**: its new analysis matched the standard constant model, with the evolving model fitting equally well but no better; Fermilab's summary says the gap "widened, but not yet to the point of certainty." ([Fermilab](https://news.fnal.gov/2026/01/dark-energy-survey-scientists-release-new-analysis-of-how-the-universe-expands/))
- **DESI, 30 July 2026 (Lyman-alpha forest)**: the new, more precise measurement agrees with the standard model, with its central value shifting toward it. DESI says this "could indicate that the current hints of evolving dark energy may fade away, or alternatively, that a more complex model may be needed." ([DESI](https://www.desi.lbl.gov/2026/07/30/new-desi-dr2-lyman-alpha-results-shed-light-on-dark-energy/))
- **Combined supernova catalogue, September 2026 ("Supernovae Unite", Pantheon+ and DES-SN5YR)**: a preference for evolving dark energy of 3.3 (3.1) sigma by one statistical method, but only a weak preference by another (Bayesian). ([arXiv 2609.05053](https://arxiv.org/abs/2609.05053))

Limits of this check: it relied on search results and short summaries of each page (the NOIRLab and PNAS pages could not be read: one returned nothing, the other was refused), the paper details beyond the abstracts were not read, and the September 2026 paper is a recent arXiv submission that may not have been peer reviewed. The numbers are quoted from abstracts and press summaries and not verified against the papers' tables.

**Resulting wording changes (for the owner's approval, `CLAUDE.md` §28.1):** the introduction's second assumption, the Results' "Does dark energy change?" paragraph (now several sentences, in plain language and without the word "sigma": hints in 2025, not strong enough to count as a discovery, possible supernova errors, mixed 2026 results, still open "at the time of writing (October 2026)"), and the caveat box in the Results panel. Tutor point 6 already says nobody knows and was not changed. The dated sentence will go out of date and should be reviewed if this chapter is kept.

**Addition: what "flat" means (2026-10-09, at the owner's request).** The owner asked what "the universe is assumed to be flat" means and how that can be. Experiment 5 had defined "flat" briefly (tied to the sphere of Gravity and Curved Spacetime Experiment 4), but this introduction only repeated a clause, and never separated it from the curved spacetime around a mass. Claude drafted a fuller explanation, the owner reviewed it in conversation and approved it as drafted (2026-10-09), and it was added to the introduction as four short paragraphs after "Some words we will use": what flat means (parallel lines stay parallel, a triangle's angles add to 180°), the sphere from Gravity Experiment 4 as the curved alternative, how it differs from spacetime curved near a star and that a flat universe can still expand (with the Earth-and-tabletop comparison), and that measurements find space flat to within less than half a percent while this experiment assumes exactly flat, so matter's and dark energy's contributions add to exactly 1. The first "What we assume" bullet now says "flat (explained above)" and the flat bullet was reworded (a non-flat universe would add a third contribution and could behave differently in the far future). By the owner's decision, the intro does not say that a flat universe with matter and constant dark energy never collapses back, because that is part of what the first prediction asks (`CLAUDE.md` §12). Earlier experiments' wording was not changed (§16, §17).

Source for the measurement: Planck 2018 combined with baryon acoustic oscillation data gives a curvature of 0.0007 ± 0.0019 (68% confidence; about 0.4% at 95%), so flat to within about 0.2% ([Planck 2018 results VI](https://arxiv.org/pdf/1807.06209)). Some analyses of the Planck data alone lean slightly toward a curved universe, which is debated ([Efstathiou and Gratton](https://arxiv.org/pdf/2002.06892)); the learner text uses the combined result and says "less than half a percent". Checked from search-result summaries, not from the papers' tables.

Not changed or not checked:

- At a 390-pixel window the three pictures shrink to about 176 pixels and their labels become very small (the same app-wide layout matter as in Experiments 4, 7, 8 and 9). Left for the owner. There is no horizontal scrolling.
- The chapter summary text in `src/App.tsx` is a draft placeholder.
- Not checked: keyboard use, any browser other than headless Chrome, screen readers (the pictures have no text alternative, as in the earlier experiments), and the Results table at widths between 390 and 1,200 pixels.
- The tutor's and the introduction's factual statements were written from the model and general knowledge, not from a source: that radiation is negligible for the future, that a flat matter-only universe is the escape-speed borderline case, and the "rule of 70". These are standard, but I did not check them against a reference.

Not checked: the `tsc -b` type check reports one error in the new test file (`node:fs/promises` has no type definitions), the same error nine existing test files already have; it was left alone.
