# Experiment 8 (Frontier and Beyond): Does Antimatter Fall Down? ALPHA-g

**Status: Specification APPROVED by the owner on 2026-10-21 ("approved, go with the defaults", read as approving all thirteen decisions on their defaults; Claude should say so if the owner meant otherwise), proposed by Claude on 2026-10-21 per `CLAUDE.md` §23 Stages 1 to 3, as the eighth experiment of the group approved on 2026-10-16 (`00-group-proposal.md`, item 8, "Part B: testing gravity and time"). The approval covers the specification, not the learner-facing wording. Step 1 (the physics model and its tests) is built; see "Implementation Notes". All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1), written to the standard of `CLAUDE.md` §29. Every published number was read on 2026-10-21 in the Nature paper's open-access copy (PubMed Central, PMC10533407; the first 100,000 of its 151,653 characters were read) or in the abstract-level summaries named in "Real-World Facts Used, and Source Status". Every number marked "computed" was computed on 2026-10-21 with a throw-away script and is to be re-checked by the physics tests.**

**One correction to the group proposal, for the owner (decision 1):** the proposal says "the ratio of antimatter's gravitational acceleration to ordinary matter's was 0.75 with an uncertainty of about 0.2". The paper gives two uncertainties, **±0.13** (statistical and systematic together) and **±0.16** (from the computer simulation that links the counts to the acceleration). Combined in quadrature they give 0.206, "about 0.2", but the combination is this experiment's own simplification (it assumes the two are independent), and the learner is shown both numbers.

---

## Overview

Gravity Experiment 1 showed that, in free fall, everything falls alike: a heavy ball and a light ball, a stone and a feather in a vacuum. Physicists call this the **weak equivalence principle**. It has been tested with great care on ordinary matter. But **antimatter**, the mirror-image kind of matter (same mass, opposite electric charge), is so hard to make and keep that nobody had measured how it falls. Does an antimatter atom fall down, as an ordinary atom does? Does it fall at some other rate? Or does it fall *up*?

In 2023 the **ALPHA collaboration** at CERN trapped about 100 atoms of **antihydrogen** (an antiproton and a positron, the antimatter version of a hydrogen atom) in a vertical magnetic bottle 25.6 centimetres tall, let them out slowly through the top and the bottom, and counted where they annihilated. The result, written as a ratio to the acceleration of ordinary matter (g = 9.81 metres per second per second), was **0.75 ± 0.13 ± 0.16**. A ratio of 1 means "falls exactly like matter", 0 means "no gravity at all", and −1 means "falls up as hard as matter falls down". The paper concludes that antihydrogen behaves in a way consistent with gravitational attraction to the Earth, and that repulsive gravity of the same size is ruled out. The collaboration repeated the measurement in 2024 and reports that it was reproduced. As of October 2026 the precision is about 20 percent, and the collaboration expects 1 percent or better to be possible in the existing machine.

This experiment lets the learner rebuild three ideas:

1. **What a ratio of 0.75, 1 and −1 would mean for a falling atom.** A ratio multiplies the acceleration: the distance fallen in a time is `½ × ratio × g × t²`, and a negative ratio means the atom rises.
2. **How to read a measurement with an error bar.** 0.75 is not "antimatter falls 25 percent more slowly". The error bar (about 0.21) is as big as the gap to 1, so the measurement cannot tell 0.75 from 1. It is 1.2 sigma from "falls like matter", 3.6 sigma from "no gravity" and 8.5 sigma from "falls up as hard as matter falls down" (computed).
3. **How precise a test must be to see a small difference.** To tell a difference of 1 percent at 3 sigma, the error bar must be below about 0.0033.

It says honestly what it does **not** do: it does **not** re-analyse ALPHA's data, it does **not** show how the experiment turns counts into an acceleration (that needs a detailed simulation), it does **not** say that antimatter falls *exactly* like matter (the measurement allows about 20 percent either way), and it does **not** claim a new law of gravity.

The new ideas are (1) **antimatter and antihydrogen**, (2) **the weak equivalence principle as a thing that can be tested**, (3) **a ratio measured with two kinds of uncertainty, and how to combine them**, (4) **how many sigma a measurement is from a possibility**, and (5) **what precision is needed**. Sigma, "hint" and "discovery" are reused from Experiments 1 and 2, and "everything falls alike" from Gravity Experiment 1.

---

## Learning Objective

After this experiment, the learner should understand:

1. **A ratio of acceleration is compared with ordinary matter's.** Ratio 1 falls like matter, 0 does not fall, and a negative ratio rises. In one second, with g = 9.81 m/s², a ratio of 1 falls 4.9 m, 0.75 falls 3.7 m, 0 falls 0 m, and −1 rises 4.9 m (computed).
2. **ALPHA's 2023 result is 0.75 with two uncertainties, 0.13 and 0.16**, which combine (as a simplification of this experiment) to 0.21.
3. **The result excludes some possibilities and not others.** In sigma it is 8.5 from −1 (excluded, far beyond the 5 sigma "discovery" bar), 3.6 from 0 (a "hint" level, between 3 and 5 sigma), and 1.2 from 1 (compatible).
4. **A central value alone says little.** The same 0.75 with an error bar of 0.10 would be 2.5 sigma from 1. A measurement means its value *and* its error bar.
5. **What the result does not show**: that antimatter falls *exactly* as matter does. Today's precision is about 20 percent; the aim is 1 percent or better.
6. **What would settle it**: more precise measurements (ALPHA-g's planned improvements, and other experiments at CERN such as AEgIS and GBAR, which aim for the same question by different methods).

---

## Physical Situation

### Reused
- **Everything falls alike (the equivalence principle)** from Gravity Experiment 1.
- **Sigma, hint and discovery** from Experiments 1 and 2 of this group (3 sigma is a hint, 5 sigma is the usual bar for a discovery).
- **Free fall**: distance = ½ × acceleration × time², a textbook formula.

### What is new
- **Antimatter and antihydrogen**; **annihilation** (when antimatter meets matter, both turn into energy).
- **The weak equivalence principle** as an experimentally testable statement.
- **A ratio to g**, and what negative and zero values mean.
- **Statistical, systematic and simulation uncertainty**, and combining independent uncertainties in quadrature (`√(a² + b²)`).
- **"Compatible with"**: a possibility is compatible with a measurement if it lies within about 2 sigma of it.

### Simplifying assumptions (all stated to the learner in plain language)
- **The experiment is described, not simulated.** The learner sees a drawing of the vertical trap and a short account of how counts of escaping atoms give an acceleration, but the experiment does not model the magnetic trap, the atoms' energies or ALPHA's simulation. The only numbers used are the published ones.
- **The two uncertainties are combined in quadrature, as if independent.** This is the experiment's own simplification, labelled as such. The paper states the two numbers separately.
- **Distance of fall is the textbook `½ r g t²`** for a constant acceleration; the 25.6 cm trap length is used only to give the fall a concrete size ("the time to fall the length of the trap"), and is *not* how ALPHA-g measures (it counts where atoms escape).
- **Published numbers are quoted as the papers state them.**

### Not introduced
How antiproton and positron beams are made and slowed, how the magnetic trap works, laser cooling, the simulation that links counts to acceleration, matter-wave interferometry, other tests of antimatter gravity (indirect arguments from kaons or from the Standard Model), theories in which antimatter would fall differently, and any claim about whether the equivalence principle can fail.

---

## Physics Model

### The numbers (published values; checked on 2026-10-21, see the source table)

| Item | Value |
|---|---|
| ALPHA 2023 (Nature 621, 716-722; published 27 September 2023): the acceleration of antihydrogen | `a = (0.75 ± 0.13 ± 0.16) g`, where 0.13 is the statistical and systematic uncertainty together, 0.16 is from the simulation, and g = 9.81 m/s² |
| The trap | 25.6 cm long (between the mirror coils A and G), 4.4 cm across; about 100 antihydrogen atoms stacked over 50 cycles |
| Statistical test in the paper | "no gravity" (ratio 0) at probability 2.9 × 10⁻⁴; repulsive gravity of magnitude 1 g "ruled out" with probability below 10⁻¹⁵ |
| Computed: combined uncertainty | `√(0.13² + 0.16²) = 0.206` |
| Computed: sigma from each possibility, for 0.75 ± 0.206 | from 1: **1.21**; from 0: **3.64**; from −1: **8.49** (the matching two-sided chances, from a bell curve, are 0.23, 2.7 × 10⁻⁴ and 2.1 × 10⁻¹⁷; the paper's own 2.9 × 10⁻⁴ for ratio 0 is from its own method and agrees closely) |
| Computed: with a smaller error bar of 0.10 | from 1: **2.5** sigma |
| Computed: fall | in 1 s: ratio 1 → 4.905 m; 0.75 → 3.679 m; 0 → 0 m; −1 → −4.905 m (rises). The time to fall the 25.6 cm trap length: ratio 1 → 0.2285 s; 0.75 → 0.2638 s |
| Computed: precision needed | to see a difference of 1 percent (0.01) at 3 sigma: error bar `0.01 ÷ 3 = 0.0033` |
| Status (as of October 2026) | The 2023 result was reproduced in 2024 ("already reproduced in our run of 2024"); "a precision of 1% or better is possible in the existing machine"; upgrades planned for after Long Shutdown 3 will extract antihydrogen from the trap and use atomic interferometry (arXiv:2503.22471v2, 24 August 2026) |

### The rules

- **Fall:** `distance = ½ × ratio × g × t²` (downward positive); a negative ratio rises. **Time to fall a height h:** `t = √(2h ÷ (ratio × g))`, and there is none when the ratio is zero or negative.
- **Combined uncertainty:** `σ = √(σ₁² + σ₂²)`.
- **Sigma from a possibility:** `z = |measured − possibility| ÷ σ`.
- **Compatibility edges (the experiment's own choice, reused from Experiments 1 and 2):** `z < 2` compatible; `2 ≤ z < 3` borderline; `3 ≤ z < 5` disfavoured (a "hint" that it is wrong); `z ≥ 5` ruled out.
- **Precision needed:** `σ needed = difference ÷ n`, for a test at `n` sigma.

### New: a small independent physics module

```typescript
// src/physics/antimatterGravity.ts (proposed)
export const G_EARTH = 9.81, TRAP_LENGTH_M = 0.256                                   // with sources
export const ALPHA_2023 = { ratio: 0.75, statSys: 0.13, simulation: 0.16, source }   // the published result
export function combinedUncertainty(a: number, b: number): number                    // sqrt(a^2 + b^2)
export function fallDistance(ratio: number, seconds: number): number                 // 1/2 ratio g t^2 (negative: rises)
export function timeToFall(ratio: number, heightM: number): number | null            // null when ratio <= 0
export function sigmasFrom(measured: number, sigma: number, possibility: number): number
export function compatibility(sigmas: number): 'compatible' | 'borderline' | 'disfavoured' | 'ruledOut'
export function sigmaNeeded(difference: number, sigmas: number): number              // difference / sigmas
export function upOrDown(ratio: number): 'down' | 'stays' | 'up'
export function runAntimatterGravity(ratio, sigma, difference): AntimatterGravityResult
```

Out-of-range inputs throw `RangeError` (a non-positive uncertainty, time or height, a non-positive `sigmas` or `difference`). The module imports nothing.

---

## Learner Controls

1. **Run:** gated on both predictions.
2. **After the run only, "What if antimatter fell with a ratio of…?":** a slider for the ratio (−1.5 to 2, steps of 0.05, starting at 0.75). Shows the distance fallen in one second, and the time to fall the length of the trap or "it rises". Picture 1 changes.
3. **After the run only, "What if the error bar were…?":** a slider for the uncertainty (0.01 to 0.5, starting at 0.206) and three buttons for the possibility to test (−1, 0, 1; starting at 1). The measured 0.75 stays fixed. Shows the sigma and the verdict. Picture 2 changes.
4. **After the run only, "How small a difference could we see?":** a slider for the difference (1 to 50 percent, starting at 20) and for the number of sigma (3 or 5). Shows the error bar needed. Picture 3 changes.
5. **A "Start over" button.**

---

## Prediction Activity

Two questions, both answered before Run is enabled. Not scored while the learner is predicting; the tutor marks each as matched or not matched in its explanation (the group's pattern). Each ends "You are not graded, and a guess is fine."

> **Prediction 1: could antimatter fall up?** The ALPHA team measured the acceleration of antihydrogen as a ratio to the acceleration of ordinary matter: **0.75, give or take about 0.2**. A ratio of 1 means "falls like matter" and **−1 means "falls up as hard as matter falls down"**. Is the measurement compatible with antimatter falling up? Buttons: **Yes, it is compatible**, **It is borderline**, **No, it is ruled out**.
>
> **Prediction 2: what does 0.75 tell us?** Does a measurement of **0.75, give or take about 0.2**, show that antimatter falls more slowly than ordinary matter? Buttons: **Yes, about 25 percent more slowly**, **No: the gap to 1 is smaller than the give or take, so it cannot tell**, **No: it shows that it falls exactly like matter**.

Right answers: Prediction 1 is **No, it is ruled out** (8.5 sigma; `compatibility(sigmasFrom(0.75, 0.206, -1))`). The natural wrong answer is "borderline", because the measurement is only "about 20 percent precise". Prediction 2 is **the second answer** (1 is 1.2 sigma from 0.75, so the measurement is compatible with 1, and equally with values a little below it). The natural wrong answers: "about 25 percent more slowly" (reading a value without its error bar) and "exactly like matter" (reading 'compatible' as 'shown').

The prediction texts do not give the sigma values, the two uncertainties' sizes beyond "about 0.2", or the verdict.

---

## Experiment Behavior

### Introduction (draft contents, to the standard of `CLAUDE.md` §29; the owner approves the wording line by line)

1. **The question.** "Drop a ball and it falls. Drop a feather in a vacuum and it falls the same way. Physicists believe that *everything* falls alike. But what about antimatter, the mirror image of matter? Does it fall down? Faster, or slower? Or does it fall up?"
2. **Where we left off.** Gravity Experiment 1 (everything falls alike), and Experiments 1 and 2 of this group (sigma).
3. **What antimatter is.** Same mass as ordinary matter, opposite electric charge; an antielectron is a positron. When matter and antimatter meet they annihilate. Antihydrogen: an antiproton with a positron. Why it is hard to hold (it annihilates on contact with ordinary matter, so it has to be kept in a magnetic bottle in a vacuum). Everyday comparison: a soap bubble that pops the moment it touches anything.
4. **Why ask?** The weak equivalence principle has been tested on ordinary matter to great precision, but until 2023 nobody had measured the fall of antimatter directly (this sentence needs a source check, see the source table).
5. **How the measurement works (a drawing, not a model).** A vertical bottle 25.6 cm tall holds about 100 antihydrogen atoms. The top and bottom barriers are lowered slowly. Atoms that escape annihilate on the wall, and detectors count where. If gravity pulls an atom down, more should leave through the bottom than the top. The team compares the counts with a computer simulation to find the acceleration. (Everyday comparison: opening the top and bottom doors of a tall lift shaft and counting who falls out of which door.)
6. **The ratio.** The result is written as a ratio to g: 1 falls like matter, 0 means no gravity, −1 means falls up.
7. **Uncertainty.** Every measurement has a give or take. ALPHA quotes two: one from counting and the equipment, one from the simulation. The introduction does not say the size of either beyond "about a fifth of g" if that does not give a prediction away (decision 4); the numbers appear after the run.
8. **The state of the question, as of October 2026.** The 2023 result and the 2024 repeat, and the plan to reach 1 percent. The status label is **Strong evidence that antihydrogen is attracted to the Earth (to within about 20 percent); Open: whether it falls *exactly* as matter does**.
9. **Some new words:** antimatter, positron, antihydrogen, annihilation, weak equivalence principle, ratio, statistical uncertainty, systematic uncertainty, simulation uncertainty, compatible.
10. **What the learner does.** Two predictions, Run, then try other ratios, error bars and differences. Nothing is graded.
11. **Assumptions** (the list above, in plain language).
12. **"Want to know more?" links** (§29 rule 3). **Visible from the start:** CERN's antimatter page (read, 2026-10-21), a plain-language page on the equivalence principle from an official source (to be found), and a plain-language page on ALPHA from CERN (the ALPHA experiment page was read on 2026-10-21; it does not mention ALPHA-g, so a better page is to be found). **Kept back until after the run, because they state what the predictions ask (§12):** the Nature paper (PMC10533407, Nature 621, 716-722) and arXiv:2503.22471 (the status). **Background ideas without a plain official link yet:** the weak equivalence principle, annihilation, antihydrogen.
13. **Date.** "As of October 2026."

The introduction must **not** say that the result is 8.5 sigma from −1, that it is compatible with 1, or that 0.75 does not show a slower fall.

### Display

Three pictures, each with every component labelled on the canvas (§14) and a guide beneath it with a "what it means, why it matters" for every "what to look for" item (§14 and §29), plus a drawing in the introduction of the vertical trap (an illustration).

- **Picture 1: "How far does it fall?"** Distance fallen (or risen) against time, 0 to 0.5 s, for ordinary matter (ratio 1, blue), for ALPHA's value (0.75, teal), and for the learner's ratio (rose); a horizontal line at the 25.6 cm trap length, and the time at which each curve crosses it. A ratio of 0 is a flat line, and a negative ratio goes up.
- **Picture 2: "What was measured."** A number line for the ratio, from −2 to 3, with the measured 0.75 as a dot, the 0.13 range (teal), the 0.16 range (amber) and the combined 0.21 range (white), and three markers: −1 "falls up as hard as matter falls down", 0 "no gravity", 1 "falls like matter", each labelled with its sigma and verdict. After the controls, the error bar and the possibility follow the learner's choice.
- **Picture 3: "How precise must a test be?"** Horizontal bars whose widths are error bars: ALPHA's 2023 ±0.21, the planned "1 percent or better" (±0.01) and the learner's error bar needed for the difference they chose, with a note that a bar must be narrower than a third of the difference to see it at 3 sigma.

The guides must name every picture, define every term, list every drawn element, give a worked moment with real numbers (for example: `½ × 0.75 × 9.81 × 1² = 3.7 m`; `√(0.13² + 0.16²) = 0.206`; `(1 − 0.75) ÷ 0.206 = 1.2`) and give a "what to look for, what it means, why it matters" list, without revealing what the learner predicted before the run.

### Run

Five named stages of 2.6 seconds each: (1) "What a ratio means" (Picture 1), (2) "What ALPHA measured" (Picture 2: the dot and its ranges), (3) "How far from each possibility" (the sigma at −1, 0 and 1), (4) "A smaller error bar" (the same 0.75 with an error bar shrinking to 0.10, so that its distance from 1 grows to 2.5 sigma), (5) "How precise a test must be" (Picture 3). Playback speed does not change any number (§11).

### Results (neutral, then explained by the tutor)

Shown only after the run. Three tables: (1) the fall for the learner's ratio (distance in one second, the time to fall the trap's length, up or down) with the arithmetic; (2) the measurement against −1, 0 and 1 (the difference, the sigma, the chance from a bell curve and the verdict), with the combined uncertainty's arithmetic; (3) the published results: the 2023 Nature numbers, the 2024 repeat, the plans to reach 1 percent, and the other experiments' aims, each with its source. A "Words and formulas" panel (collapsed from the start) lists every term; formulas and worked examples appear only after the run (§12). The links kept back until now are listed here.

---

## Expected Observations

- A ratio of 1 falls 4.9 m in one second and takes 0.23 s to fall the trap's length; 0.75 falls 3.7 m and takes 0.26 s; a ratio of 0 does not fall; a ratio of −1 rises 4.9 m.
- The measured 0.75 ± 0.21 is 1.2 sigma from 1, 3.6 sigma from 0 and 8.5 sigma from −1.
- The same 0.75 with ±0.10 would be 2.5 sigma from 1; to see a 1 percent difference at 3 sigma needs ±0.0033.
- Today's best antimatter fall measurement is about 20 percent precise; a 1 percent precision is the stated aim.

## Expected Learner Understanding

The learner should leave able to say, in their own words: what a ratio of 1, 0 and −1 would mean; why 0.75 does not mean "falls more slowly"; what sigma away from a possibility tells; what the measurement has and has not shown (antimatter is attracted to the Earth, and a fall of about the same size is expected but not yet shown to 1 percent); and that this experiment did not re-analyse ALPHA's data.

## New Concepts Introduced

Antimatter and antihydrogen, annihilation, the weak equivalence principle as a testable statement, a ratio to g, combining two uncertainties, sigma away from a possibility, "compatible", and the precision a test needs.

## Relationship to Previous Experiments

Builds on Gravity Experiment 1 (the equivalence principle) and on Experiments 1 and 2 of this group (sigma, hint, discovery). Uses antiparticles only in passing from Spacetime Geometry Experiments 5 and 6.

## Relationship to Later Experiments

Experiment 9 of the group (a clock that can tell its height) is the next result of the nineteen; it also tests gravity, with time and not with falling. The closing recap sorts all nineteen results by status label.

---

## Required Physics Tests

1. `fallDistance(1, 1)` is 4.905 m, `fallDistance(0.75, 1)` is 3.679 m, `fallDistance(0, 1)` is 0, and `fallDistance(-1, 1)` is −4.905 m (worked out by hand with g = 9.81); the distance grows as `t²` and is proportional to the ratio.
2. `timeToFall(1, 0.256)` is 0.2285 s and `timeToFall(0.75, 0.256)` is 0.2638 s; `timeToFall(0, h)` and `timeToFall(-1, h)` are `null`; the time falls as `1 ÷ √ratio`.
3. `combinedUncertainty(0.13, 0.16)` is 0.2062; it is at least the larger of the two; `combinedUncertainty(a, 0)` is `a`.
4. `sigmasFrom(0.75, 0.2062, 1)` is 1.21, `sigmasFrom(0.75, 0.2062, 0)` is 3.64, `sigmasFrom(0.75, 0.2062, -1)` is 8.49; it is symmetric (`sigmasFrom(m, s, p)` equals `sigmasFrom(p, s, m)`) and doubles when σ halves.
5. `sigmasFrom(0.75, 0.10, 1)` is 2.5.
6. `compatibility` is `'compatible'` below 2, `'borderline'` from 2 to below 3, `'disfavoured'` from 3 to below 5, and `'ruledOut'` from 5; the three Prediction values give `'compatible'`, `'disfavoured'` and `'ruledOut'`.
7. `sigmaNeeded(0.01, 3)` is 0.00333 and `sigmaNeeded(0.2, 5)` is 0.04; it is proportional to the difference and inversely proportional to the sigma.
8. `upOrDown(1)` is `'down'`, `upOrDown(0)` is `'stays'`, `upOrDown(-0.2)` is `'up'`.
9. The published data equal the module's constants (a data test that catches a typing error): 0.75, 0.13, 0.16, g = 9.81, the trap length 0.256, and the source.
10. Out-of-range inputs throw `RangeError`.
11. The module imports nothing.

Each test must fail when the module is deliberately broken (several deliberate breaks, as in Experiments 1 to 7).

---

## AI Tutor Behavior

The same pattern as the earlier experiments (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next (Continue enabled only after a reply). The tutor does not invent physics; every number comes from `antimatterGravity.ts` or the cited papers. The predictions are marked as matched or not matched in the explanation only.

1. **Observe.** "Look at Picture 2. Where do −1, 0 and 1 sit compared with the measured 0.75 and its ranges? Which of the three is the closest, and which the furthest?"
2. **Compare.** The two predictions, without marking.
3. **Conceptual question.** "The paper reports 0.75, yet the team does not say that antimatter falls more slowly than matter. Why not, and what would you need to see to say it?" (The tutor does not answer it for the learner.)
4. **Explanation**, in simple words, with everyday examples, after a paragraph that marks the two predictions: (1) what a ratio of 0.75, 1, 0 and −1 mean for a falling atom, with the numbers (4.9, 3.7, 0 and −4.9 m in one second); (2) what the two uncertainties are (counting and the equipment; the simulation) and what combining them means (this experiment's own simplification, 0.206); (3) the sigma from each possibility and what each means, with a comparison (how far a thrown dart lands from three targets, compared with how wide its scatter is); (4) what the measurement has shown (antihydrogen is attracted to the Earth, and falling up with the full strength of g is ruled out) and what it has not (that the ratio is exactly 1); (5) why a smaller error bar would change the reading (0.10 gives 2.5 sigma from 1), and how small a bar a 1 percent test needs; (6) what is planned (1 percent in the existing machine; extraction and interferometry after Long Shutdown 3; AEgIS and GBAR by different methods) and that none of those has a result yet as of the sources read; (7) what was shown and what was not. **The tutor does not say that antimatter falls exactly like matter, and does not say that it may not.**

### Chapter summary (draft)

"What you learned" and "What's next", shown only after the tutor's explanation. Drafted after the owner approves the experiment, and then approved line by line. "What's next" points to Experiment 9 only once it has an approved specification.

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| ALPHA 2023: `a = (0.75 ± 0.13 ± 0.16) g`; about 100 atoms stacked; trap 25.6 cm long and 4.4 cm across; "no gravity" at probability 2.9 × 10⁻⁴; repulsive gravity of 1 g ruled out below 10⁻¹⁵; received 6 May 2023, published 27 September 2023 | Nature 621, 716-722 (2023), open-access copy PMC10533407, first 100,000 of 151,653 characters, via a fetch summary | **Checked on 2026-10-21 (through a summary; the last third was not read)** |
| "A precision of about 20%"; "reproduced in our run of 2024"; "1% or better is possible in the existing machine"; upgrades after Long Shutdown 3 (extraction, atomic interferometry); GBAR aims for a precision "of order 10⁻⁵" and its anti-ion production is "demonstrated but not yet complete"; AEgIS plans a first measurement by the time of LS3 | arXiv:2503.22471v2 ("CERN AD/ELENA Antimatter Program", R. Caravita et al. on behalf of ADUC, 24 August 2026), HTML version, via a fetch summary | **Checked on 2026-10-21 (through a summary)** |
| The combined uncertainty 0.206, the sigma values 1.21, 3.64 and 8.49, and the chances 0.23, 2.7 × 10⁻⁴ and 2.1 × 10⁻¹⁷ | Computed with a throw-away script; a bell curve and independent uncertainties assumed | **Computed (to be re-checked by the tests)** |
| Antimatter has the same mass as matter and the opposite charge; annihilation | CERN, home.cern/science/physics/antimatter | **Read on 2026-10-21** through a fetch summary |
| The ALPHA experiment page does not mention ALPHA-g or gravity | CERN, home.cern/science/experiments/alpha | **Read on 2026-10-21**; a better page is to be found |
| That, until 2023, nobody had measured the fall of antimatter directly | Press coverage and the paper's introduction (not read) | **Not checked at a source** (to be checked before the wording is approved) |
| How ALPHA-g counts escaping atoms and what the magnetic bias is (the paper reports a field difference of 4.53 × 10⁻⁴ T between the mirrors that mimics Earth's gravity) | Nature paper, PMC10533407, via a fetch summary | **Partly checked**; the introduction describes it only in plain words and does not model it |
| That the paper's authors conclude "consistent with gravitational attraction" and that it supports the weak equivalence principle | Nature paper abstract, via a fetch summary and a search summary | **Checked on 2026-10-21** |
| A December 2025 paper argues that the ALPHA-g results are "inconclusive: repulsive gravity is still on the table" | ResearchGate listing seen in a search (not opened) | **Not read** (decision 7) |
| A plain-language page on the equivalence principle; a plain-language page on ALPHA-g | Official source (CERN, ESA or NASA) | **Not found yet** |

### Facts that may change (re-check list, as of October 2026)

- **New ALPHA-g results** (the 1 percent measurement, or the extraction and interferometry after Long Shutdown 3), and **first free-fall results from AEgIS and GBAR**.
- **Replies or critiques** of the 2023 result (for example the December 2025 paper above).
- The year of **Long Shutdown 3** and whether the upgrades are still planned.

---

## Decisions Needing Human Review

Defaults are what I will use unless you say otherwise.

1. **The uncertainty.** Default: show both published uncertainties (0.13 and 0.16) and combine them in quadrature to 0.206 as this experiment's own simplification (the proposal's "about 0.2"). Alternative: use "about 0.2" alone (simpler, but hides what the two are).
2. **The status label.** Default: **Strong evidence** (that antihydrogen is attracted to the Earth, to within about 20 percent) with **Open** (whether it falls exactly as matter does). Alternative: "Strong evidence" alone.
3. **The two predictions.** Default: Prediction 1 (could antimatter fall up? from the proposal) and a new Prediction 2 (does 0.75 show a slower fall?). Alternative: only Prediction 1.
4. **The introduction's mention of the size.** Default: the introduction does not give the size of either uncertainty, and says only that "the team's result has a give or take of about a fifth of g" if that does not give Prediction 1 away; the numbers come after the run. Alternative: give none at all in the introduction.
5. **How ALPHA-g works.** Default: a drawing and one plain paragraph, with the 25.6 cm trap and about 100 atoms, no model of the trap, and a short caution that the experiment counts atoms and does not time a fall. Alternative: leave the apparatus out and keep only the ratio and the error bar (simpler, but the result then looks abstract).
6. **The fall time of 0.23 s.** Default: show it as a concrete size for the fall, with the caution above. Alternative: show only the distance in one second.
7. **The 2025 "inconclusive" paper.** Default: leave it out of the learner-facing text (not read), and list it as a fact to check. Alternative: add one neutral sentence that some authors argue the result leaves room.
8. **The compatibility edges.** Default: below 2 compatible, 2 to 3 borderline, 3 to 5 disfavoured, 5 or more ruled out (reusing the 3 and 5 of Experiments 1 and 2, and 2 as a common rule of thumb). Alternative: only "hint" (3) and "discovery" (5).
9. **The controls.** Default: three controls (the ratio; the error bar and the possibility; the difference to see). Alternative: drop the third.
10. **The other experiments.** Default: one sentence on AEgIS and GBAR (by different methods; no result yet), with the numbers from arXiv:2503.22471 only. Alternative: leave them out.
11. **The links.** Default: the Nature paper and arXiv:2503.22471 after the run (§12); CERN's antimatter page visible from the start, and plain pages on the equivalence principle and on ALPHA-g still to be found. Alternative: show all from the start (against §12).
12. **The title.** Default: "Does antimatter fall down? ALPHA-g". Alternative: "Does antimatter fall up?".
13. **The tutor's marks.** Default: marks in the explanation only, as in Experiments 5 to 7.

---

## Success Criteria

1. The learner can say in plain words what a ratio of 1, 0 and −1 would mean for a falling atom.
2. The learner sees that 0.75 ± 0.2 is compatible with 1, disfavours 0 and rules out −1, and that the same 0.75 with a smaller error bar would read differently.
3. The learner sees that today's precision is about 20 percent and what a 1 percent test needs.
4. Every drawn component is labelled on the canvas, and each picture's guide follows `CLAUDE.md` §14 and §29, with a "what it means, why it matters" for every "what to look for" item.
5. The status label is shown, dated October 2026.
6. Neither the introduction nor the captions reveal the answers to the predictions before the learner has predicted (§12).
7. The physics tests above pass and fail under deliberate breaks.
8. The experiment says that it does not re-analyse ALPHA's data and does not claim a new law of gravity, and the tutor neither says that antimatter falls exactly like matter nor that it may not.
9. The "Words and formulas" panel lists every term and formula (formulas after the run), and every term is defined before it is first used (§15).
10. Every published number matches the checked source, the "facts that may change" list is in the specification, and the links list includes the original paper and official pages (§29 rule 3), each fetched **and read**.
11. Nothing contradicts Gravity Experiment 1 or Experiments 1 and 2 of this group.

---

## Implementation Notes

The specification is approved (2026-10-21). **Built so far (2026-10-21):**

- **Step 1, physics model and tests:** `src/physics/antimatterGravity.ts` and `antimatterGravity.test.ts` (21 tests covering the 11 required tests and the two predictions' answers). The expected values are worked out by hand (g = 9.81; for example, in one second ratio 1 falls 4.905 m and 0.75 falls 3.67875 m; the time to fall 0.256 m is 0.22845 s at ratio 1 and 0.2638 s at 0.75; √(0.13² + 0.16²) = 0.20616; the sigma from 1, 0 and −1 are 1.2126, 3.638 and 8.488), not by calling the module. **Checked by nineteen deliberate breaks of the module** (the fall without its half or without its square, the fall time without its 2, a zero ratio no longer giving "does not fall", the quadrature replaced by a sum, the sigma without its absolute value or without the division, the compatibility edge at 2 and at 5 moved, the precision needed multiplied and not divided, up and down swapped, g, the trap length, the measured ratio and the simulation uncertainty mistyped, an import added, Prediction 1 asked about the wrong possibility, and two range checks removed), each of which made at least one test fail (1 to 7 failures); none survived. **Differences from this specification, for the owner's approval:** (1) the module also exports `fallsUpAnswer()` and `readingAnswer()` (the answers to the two predictions, computed from the module's own numbers), the types `Compatibility`, `UpOrDown`, `FallsUpAnswer` and `ReadingAnswer`, and `ALPHA_2023.source`; (2) `runAntimatterGravity(ratio, sigma, difference)` returns the distance in one second, the time to fall the trap, the direction, the three sigma values and verdicts (from 1, 0 and −1), and the precision needed at 3 and at 5 sigma; (3) `fallsUpAnswer()` maps "disfavoured" and "ruled out" both to the answer button "ruled out" (the three buttons are compatible, borderline and ruled out); (4) the time of fall and the distance accept any finite ratio, including negative ones, and the sigma functions reject a non-positive uncertainty. **Not checked:** the module's physics beyond its tests (the numbers are the published ones, read on 2026-10-21 through summaries, see the source table); nothing in the interface (not built).
