# Experiment 1 (Frontier and Beyond): Two Measurements of the Expansion Rate — Why Don't They Agree?

**Status: Specification APPROVED by the owner on 2026-10-17 ("Approved, all 10 decisions on defaults", in answer to a direct question), proposed by Claude on 2026-10-16 per `CLAUDE.md` §23 Stages 1 to 3, as the first experiment of the group approved on 2026-10-16 (`00-group-proposal.md`, "list of 19 approved"). Step 1 (the physics model and its tests) was built and tested on 2026-10-17; the approval covers the specification, not the learner-facing wording. The owner approved the introduction and Picture 1's guide on 2026-10-17 ("wording approved", after four rounds of rewriting to the standard of `CLAUDE.md` §29, which the owner set the same day for the whole group); the owner then approved the Step 3 wording on 2026-10-17 ("wording approved": the two predictions, the three pictures' guides including the longer "what to look for, and what it would mean" lists, and the run's stage names); the owner then approved the results step's wording on 2026-10-17 ("approved": the results tables, the stretch control, the "How to read these results" guide and the "Words and formulas" panel); the owner approved the tutor's wording and the chapter summary on 2026-10-17 ("wording approved", read as covering the summary shown after the tutor). All the learner-facing wording is therefore approved. Steps 1 to 5 (the physics model and tests; the basic interface; the predictions, Run and Pictures 1 to 3; the results; the tutor and chapter summary) are built. The complete-flow test was done on 2026-10-17 (§21 Step 9, see Implementation Notes); the final review (§21 Step 10) was done the same day (see Implementation Notes). All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1), except the parts marked approved, which is all of it as of 2026-10-17. Every number marked "computed" was computed by script on 2026-10-16 and must be re-checked by the physics tests before the build is approved. The published numbers were checked against the original papers' arXiv abstracts on 2026-10-16 (see "Real-World Facts Used, and Source Status"); the full papers were not read.**

**Group:** "Frontier and Beyond" (Part A: the expanding universe and what fills it). The group is the project's last, and its experiments each start from a result of 2022 to 2026. **Status label shown to the learner: Contested (as of October 2026).**

---

## Overview

Cosmology Experiment 1 showed that distant galaxies recede faster the farther they are (Hubble's law), with a speed of about 70 kilometres per second for each megaparsec of distance. That number, the **Hubble constant**, written H₀, tells how fast the universe is expanding today. It is also one of the most carefully measured numbers in science, and it has two kinds of measurement that **do not agree**:

- **Measured from the early universe.** The cosmic microwave background (the afterglow of Cosmology Experiment 3), read with the standard model of the universe, gives H₀ = 67.4 ± 0.5 (Planck satellite, 2018).
- **Measured from the nearby universe.** Stepping outward from stars whose distances we know, one rung at a time (the "distance ladder"), gives about 73. The SH0ES team's 2022 value is 73.04 ± 1.04, and a 2026 community report that combined many methods gives 73.50 ± 0.81.

The gap is about **5 sigma** in the first comparison, and about 6 in the second (computed here). In science, 5 sigma is the usual standard for calling a difference real and not chance. So either one of the measurements has a hidden error, or the standard model of the universe is missing something. **Nobody knows which**, and one more team, using a different method, gets a value in between (about 70), with an uncertainty large enough to overlap both. That is why this experiment's status is **Contested**.

The learner picks one of the nearby-universe measurements, predicts how many sigma it lies from the early-universe value and whether sharper telescope images (JWST, 2024) changed the nearby-universe value, and runs the experiment. The pictures place the measurements on one number line with their error bars, show how little the two bell-shaped uncertainties overlap, and show what the gap would mean for the age of the universe.

The one new idea is **sigma**: how many "error bars" apart two measurements are. It is the project's first statistical idea and it is used again in the group's later experiments (the next ones ask "how big a hint is a 3 sigma?").

No new physics is used. The expansion rate is Cosmology Experiment 1's. The age estimate, 1 ÷ H₀, is Cosmology Experiment 2's "Hubble time". The experiment says honestly what it does not show: **the cause of the disagreement is not known, and this experiment cannot find it.**

---

## Learning Objective

After this experiment, the learner should understand:

1. **A measurement is a number with an uncertainty** (an "error bar"). Two measurements "agree" if the gap between them is small compared with their error bars together.
2. **Sigma is the gap divided by the combined uncertainty.** A gap of 1 sigma happens often by chance. A gap of 5 sigma is very unlikely to be chance alone.
3. **The early-universe and nearby-universe values of the expansion rate disagree** by about 5 to 6 sigma (computed from published numbers), and **the disagreement is real and not understood.**
4. **JWST's sharper images of the same Cepheid stars did not close the gap.** They agreed with the Hubble Space Telescope's, and rejected one proposed cause (blurring of crowded stars) at 8.2 sigma.
5. **A third method gives a value in between,** with an uncertainty that overlaps both, and its authors conclude there is no real tension. Experts disagree. A good scientist keeps all of this in view and does not pick a side because it is the newest.
6. **The gap matters:** a simple estimate of the universe's age (1 ÷ H₀) would be 14.5 billion years for one value and about 13.3 for the other.
7. (A short remark.) **A tension is not a discovery.** Cosmology has seen tensions disappear when measurements improved (Experiment 3 of this group). So far, this one has not.

---

## Physical Situation

### Reused
- **Hubble's law and the Hubble constant** (Cosmology Experiment 1): recession speed = H₀ × distance.
- **The Hubble time** (Cosmology Experiment 2): 1 ÷ H₀, a rough age if the expansion had always gone at today's rate.
- **The cosmic microwave background** (Cosmology Experiment 3), as the early-universe source of one measurement.

### What is new
- **A set of published measurements,** each a value with an uncertainty and a name: the early-universe value, and several nearby-universe values.
- **Uncertainty** (error bar), and the idea that different parts of an error can be combined.
- **Sigma** as the gap in units of the combined uncertainty.
- **The distance ladder** in one plain paragraph (parallax, then Cepheid stars, then supernovae), with no calculation of the ladder itself.

### Simplifying assumptions (all stated to the learner in plain language)
- Each published uncertainty is treated as a symmetric bell-shaped "error bar", and two measurements' errors are treated as independent, so the combined uncertainty is √(σ₁² + σ₂²). The papers' own statistics are more careful. (The SH0ES paper reports 5 sigma for its comparison with Planck; this experiment's simple arithmetic gives 4.9.)
- The Hubble time is a rough estimate, not the real age (which is about 13.8 billion years from the full model of Cosmology Experiments 2 and 6).
- The experiment uses a few published measurements, chosen to show the range of results. It does not claim to be a complete list.

### Not introduced
How the distance ladder works in detail, the physics of Cepheid stars, supernovae, the red-giant-branch method, any proposed explanation of the tension (a new kind of early dark energy, new particles, a local void), the statistics of how the papers combine data, and the name "H₀ tension" being solved by any idea.

---

## Physics Model

### The numbers (published values, checked against the arXiv abstracts on 2026-10-16)

All in kilometres per second per megaparsec (km/s/Mpc). The uncertainty is the total published uncertainty, with several parts combined in quadrature where a paper gives them separately (computed).

| Measurement | Side | Value | Total uncertainty | Source |
|---|---|---|---|---|
| Planck 2018 (microwave background, standard model) | early | 67.4 | 0.5 | Planck Collaboration, arXiv:1807.06209 |
| SH0ES 2022 (Cepheids and supernovae) | late | 73.04 | 1.04 | Riess et al., arXiv:2112.04510 |
| H0DN 2026 (Local Distance Network, many methods) | late | 73.50 | 0.81 | H0DN Collaboration, arXiv:2510.23823 (A&A 708, A166, 2026) |
| CCHP 2024 (red-giant-branch stars, HST and JWST) | late | 70.39 | 1.94 | Freedman et al., arXiv:2408.06153 (1.22 statistical, 1.33 systematic, 0.70 from supernovae, in quadrature) |

(Two more JWST-only values from the same CCHP paper, 68.81 with 2.22 and 67.80 with 2.72, may be added as extra rows in the results. They are not offered as the learner's choice, so the choice stays among the three nearby-universe measurements that bracket the debate: Decision 3.)

### The rules

- **Combined uncertainty** of two measurements: `σ = √(σ₁² + σ₂²)`.
- **Tension in sigma:** `n = |H₁ − H₂| ÷ σ`.
- **Stretching the error bars** by a factor `k` (what if every uncertainty had been underestimated `k` times): `n(k) = n ÷ k`.
- **The stretch needed** for a target tension `n_target`: `k = n ÷ n_target`.
- **Hubble time:** `T = 1 ÷ H₀`, converted to billions of years (977.8 ÷ H₀ in these units).

### Numbers (computed 2026-10-16; the tests recompute them)

Compared with Planck (67.4 ± 0.5):

| Measurement | Gap (km/s/Mpc) | Combined uncertainty | Tension (sigma) | Hubble time (billion years) |
|---|---|---|---|---|
| SH0ES 2022 | 5.64 | 1.15 | **4.89** | 13.39 |
| H0DN 2026 | 6.10 | 0.95 | **6.41** | 13.30 |
| CCHP 2024 | 2.99 | 2.00 | **1.50** | 13.89 |
| Planck 2018 itself | 0 | | | 14.51 |

CCHP against the others: 1.21 sigma from SH0ES and 1.48 from H0DN. **The stretch needed** to bring SH0ES against Planck down to 3 sigma is 1.63 times, to 2 sigma 2.44 times, to 1 sigma 4.89 times; for H0DN, to 3 sigma 2.14 times and to 2 sigma 3.20 times.

### New: a small independent physics module

```typescript
// src/physics/hubbleTension.ts (proposed)
export interface HubbleMeasurement { name: string; side: 'early' | 'late'; value: number; uncertainty: number; source: string }
export const MEASUREMENTS: HubbleMeasurement[]   // the table above, with the sources
export function combinedUncertainty(a: number, b: number): number
export function tensionSigma(a: HubbleMeasurement, b: HubbleMeasurement, stretch = 1): number
export function stretchNeeded(a: HubbleMeasurement, b: HubbleMeasurement, targetSigma: number): number
export function hubbleTimeBillionYears(hubbleConstant: number): number
export function runTensionExperiment(late: HubbleMeasurement, stretch?: number): TensionExperimentResult
// the early value, the chosen late value, the gap, the combined uncertainty, the tension, both Hubble times, and the same tension for every
// other late measurement, so the results can show them all
```

Out-of-range inputs throw `RangeError` (a non-positive uncertainty, a non-positive Hubble constant, a stretch below 1 or a target sigma that is not positive). The module imports the unit constants of Cosmology Experiment 1 and 2 where they exist, and invents no new physical assumption. (`hubbleTimeYears` in `bigBangExperiment.ts` is fixed at 70 km/s/Mpc, so the new function takes H₀ as an input and uses the same unit conversions.)

---

## Learner Controls

1. **The nearby-universe measurement to test:** three presets, SH0ES 2022, H0DN 2026 and CCHP 2024, each compared with Planck 2018.
2. **Run:** gated on both predictions.
3. **After the run only, "What if the error bars were bigger?":** five presets, ×1, ×1.5, ×2, ×3 and ×5, which stretch both uncertainties and update the results table's tension (Decision 4). It does not clear the predictions, because it is exploration of the result.

Changing the nearby-universe measurement clears the predictions (Prediction 1 names it). The predictions are locked while the run is going and after it. **A "Start over" button** (added in the build, see "Implementation Notes") clears the predictions and the pictures so the learner can predict again.

---

## Prediction Activity

Wording approved by the owner on 2026-10-17, as built. Two questions, both answered before Run is enabled. Not scored while the learner is predicting; the tutor's explanation marks each as matched or not matched (the pattern the owner chose for Experiment 8 of Spacetime Geometry). Each ends "You are not graded, and a guess is fine." and, below the buttons, "Your prediction: …" (or "Choose an option to continue").

> **Prediction 1: how many sigma apart?** The early-universe value is 67.4 ± 0.5, and the measurement you chose, from the nearby universe, is **[name: value ± uncertainty]** (both shown above). The gap between two measurements, divided by their combined give-or-take, is the number of **sigma** they are apart. About how many sigma apart do you think these two are? Buttons: **Less than 2**, **Between 2 and 4**, **Between 4 and 6**, **More than 6**.
>
> **Prediction 2: what did the Webb telescope change?** In 2024, the James Webb Space Telescope looked again at the same Cepheid stars that the Hubble Space Telescope had used, with much sharper images. Compared with the Hubble value, did the Webb measurements make the nearby-universe expansion rate **lower** (closer to the early-universe value), leave it **about the same**, or make it **higher**? Buttons: **Lower (closer to the early-universe value)**, **About the same**, **Higher**.

Right answers: Prediction 1 depends on the choice (SH0ES 4.89, **between 4 and 6**; H0DN 6.41, **more than 6**; CCHP 1.50, **less than 2**), computed by the module. Prediction 2: **about the same** (the difference was −0.01 ± 0.03 magnitudes). The natural wrong answer to Prediction 2 is "lower", from the idea that the high value came from blurred images; the specification's point is that this natural idea was tested and rejected. Neither prediction asks the learner to calculate.

---

## Experiment Behavior

### Introduction (wording approved by the owner on 2026-10-17, as built in `HubbleTensionExperiment.tsx`; written to the standard of `CLAUDE.md` §29)

The rules are those of the project's earlier experiments (`CLAUDE.md` §15, §12) and of §29: every term defined in plain language before it is used, a concept before its formula, an everyday example for each idea that is not obvious, nothing the learner is asked to predict revealed in advance (the introduction does not say whether, or by how much, the measurements differ, and does not say what the James Webb Space Telescope found), links for further reading, and a collapsed "Words and formulas" panel that gains the formulas only after the run (the panel is built in a later step). The wording below is the approved wording; the owner approved the introduction and Picture 1's guide only, not the rest of the experiment's wording.

- **The status label, first.** "**Where this stands (as of October 2026): Contested.** The measurements below are real and published. What they mean is not agreed."
- **The question.** In Cosmology Experiment 1 we saw that the universe is expanding: the farther away a galaxy is, the faster it is moving away from us. The number that says *how fast* is called the **Hubble constant**, written **H₀**. It is about 70 kilometres per second for each **megaparsec** of distance. (A megaparsec, Mpc, is a very large distance, about 3.3 million light-years.) So a galaxy 100 megaparsecs away is moving off at about 100 × 70 = 7,000 kilometres per second, and one twice as far at about twice that.

  This one number matters a great deal. It sets the size and the age of the universe: the faster the expansion, the less time it took to get this big. So astronomers have worked hard to measure it as carefully as they can, in more than one way. The question of this experiment is simple: **when two careful ways of measuring H₀ are compared, do they give the same answer?**
- **Why use more than one way?** Think of finding how fast a car is going. You could read the speedometer, or you could time it between two mile markers. If the two methods agree, you trust the result. If they do not, something is wrong: one of the methods has a hidden fault, or the car is not behaving the way you assumed. Scientists check an important number the same way.
- **New words, each with an example.**
  - **Measurement, uncertainty and error bar:** no measurement is exact. Suppose you measure a table five times with a tape measure and get 120.4, 119.6, 120.3, 119.7 and 120.0 centimetres. The readings are all a little different, because your eye and the tape are not perfect. So you would not say "exactly 120". You would say "**about 120, give or take 0.5**", which means the true length is probably somewhere between 119.5 and 120.5. Scientists write that as **120.0 ± 0.5**. The first number is the **best value**. The "give or take" part is the **uncertainty**: the smaller it is, the more precise the measurement. An **error bar** is just that "give or take" drawn as a picture: a dot at the best value, and a line that reaches as far to the left, and as far to the right, as the uncertainty. (Here "error" does not mean a mistake. It means the small unavoidable imprecision of any measurement.) The introduction draws the tape measure result that way (a small picture: a dot at 120.0 and a bar from 119.5 to 120.5, on a line marked 119, 120 and 121 cm). A bathroom scale that says "70 kg, give or take 1" is another example: it is probably right to within a kilogram, but you should not trust it to the gram.
  - **Early-universe measurement:** one made from the very old light called the cosmic microwave background, the afterglow of the Big Bang (Cosmology Experiment 3). The satellite that mapped it most precisely was **Planck**. Planck does not watch galaxies move. Instead, scientists take the patterns in that old light, assume the standard model of the universe (the one built in the Cosmology experiments, with ordinary matter, dark matter and dark energy), and work out what H₀ must be *today* for that model to fit the patterns. So this value depends on the standard model being right.
  - **Nearby-universe measurement:** one made the direct way, as in Cosmology Experiment 1: find how far away galaxies are, find how fast they are moving away, and divide. The hard part is the distances. Astronomers get them one step at a time, like climbing a ladder, so it is called the **distance ladder**:
    - *First rung: nearby stars.* A nearby star seems to shift a tiny amount against the far background as the Earth goes round the Sun. Hold up a thumb and close one eye, then the other: your thumb seems to jump. The size of the jump tells you how close it is.
    - *Second rung: Cepheid stars.* These stars brighten and dim in a steady rhythm, and the slower the rhythm, the more light the star really gives off. So its rhythm tells you how bright it truly is. Compare that with how bright it looks, and you know how far away it is, as you would judge how far away a lamp is if you knew its wattage and could see how dim it looks.
    - *Third rung: supernovae.* Some exploding stars reach nearly the same true brightness every time, and they are so bright that we see them in very distant galaxies. Cepheids in nearby galaxies that also host such a supernova are used to find how bright these explosions really are, and then the explosions give distances far beyond the Cepheids' reach.
  - **Hubble Space Telescope and James Webb Space Telescope:** the two big space telescopes used to look at the Cepheids. The Webb telescope is newer and sees finer detail. Astronomers worried that, in a crowded patch of sky, the Hubble telescope's pictures might blur a Cepheid together with its neighbours and spoil its distance. Looking again with the Webb telescope is one way to test that worry.
  - **Sigma:** the way scientists say how big a disagreement between two measurements is. It answers the question "**how many 'give or takes' fit inside the gap?**" (the example below works one out step by step). If the gap is only about 1 sigma, it is no bigger than the give-or-take, and you would expect that by chance quite often. The bigger the number of sigma, the less likely it is that chance alone explains the gap. In many sciences, 5 sigma is the usual bar for calling a difference real. (No probability is quoted: Decision 9's alternative.)
  - **Tension:** a disagreement between two measurements that is too large to be put down to chance. It is a puzzle, not yet a discovery: it could mean one measurement has an error nobody has found, or that our model is missing something.
- **An everyday example of sigma, step by step.** You and a friend each measure the same table, and you want to know whether your two results really disagree. There are three steps.
  - **Step 1: find the gap.** You get 120.0 cm. Your friend gets 121.0 cm. The gap is 121.0 − 120.0 = 1.0 cm.
  - **Step 2: find how much that gap could be wrong by.** Each of you says "give or take 0.5 cm". Both numbers can be off, so the *gap* between them is uncertain too. It is tempting to add the two (0.5 + 0.5 = 1.0), but that is too much. Sometimes you are both off in the same direction (both a bit high), and then the gap hardly changes. Sometimes you are off in opposite directions, and then the gap changes a lot. On average the two give-or-takes combine into something a little bigger than one of them, but smaller than their plain sum. Scientists use this recipe: (1) multiply each give-or-take by itself: 0.5 × 0.5 = 0.25, and again 0.5 × 0.5 = 0.25; (2) add the two answers: 0.25 + 0.25 = 0.50; (3) find the number that, multiplied by itself, gives that: 0.7, because 0.7 × 0.7 = 0.49, which is very close to 0.50 (this is called the square root). So the **combined give-or-take is about 0.7 cm**. You do not need to remember the recipe. It is only here so that you can see where 0.7 comes from. Between the two numbers, it is the size of the doubt about the gap.
  - **Step 3: divide.** Ask: how many of those 0.7 cm doubts fit inside the 1.0 cm gap? 1.0 ÷ 0.7 is about 1.4. So the gap is **about 1.4 sigma**. That is only a little more than the doubt itself, so you would shrug: ordinary differences like this happen all the time.
  - **Now imagine a second, different story.** You still get 120.0 cm and your friend still gets 121.0 cm, so the gap is still 1.0 cm: it is just the difference between the two readings, and the readings have not changed. But this time you each used a much better tape and measured many times, so you can each say "give or take 0.1 cm" instead of 0.5. Only the uncertainty is different. The recipe now gives 0.1 × 0.1 = 0.01, then 0.01 + 0.01 = 0.02, then the square root of 0.02, which is about 0.14. So the combined give-or-take is 0.14 cm, and 1.0 ÷ 0.14 is about 7. The gap is **about 7 sigma**: seven of those doubts fit inside it. Chance alone almost certainly cannot explain that, so you would go looking for a cause. One of you may have made a mistake, or you were not measuring the same thing.
  - The gap was 1 cm in both stories because the two readings were the same. What changed was the doubt, and so how big the gap is *compared with the doubt*. That comparison is what sigma is. In this experiment, the two "people" are two teams of astronomers, and the "table" is the expansion rate of the universe.
- **What happens.** The experiment shows real published measurements of H₀ as points on one line, each with its error bar. You pick one nearby-universe measurement. The experiment places it next to the early-universe value, shows how far apart they are in sigma, and shows what the gap would mean for the age of the universe.
- **Your job.** Choose a nearby-universe measurement. Predict how many sigma apart it is from the early-universe value, and what happened when the Webb telescope re-measured the same Cepheid stars. Press Run. You are not graded while you predict. The tutor will compare your predictions with the result afterwards.
- **What we assume.** Each uncertainty is treated as a simple, symmetric "give or take", and two measurements' errors as independent of each other. The scientists' own papers use more careful statistics, so their quoted sigma can differ a little from the one here. The age estimate 1 ÷ H₀ is rough: it is the age the universe would have if it had always expanded at today's rate (Cosmology Experiment 2), not the real age. We show a few of the published measurements, not all of them. And this experiment cannot tell you which measurement, if either, is wrong.
- **Want to know more?** These are the original scientific papers (their summary pages, which are written for scientists and use technical words). They open on arxiv.org, the free site where scientists post their papers. The numbers on this page were checked against their summary pages on 16 October 2026. Links (each opens in a new tab): Planck 2018 results VI (arXiv:1807.06209), the early-universe value, 67.4 ± 0.5; Riess et al. 2022, the SH0ES team (arXiv:2112.04510), the distance ladder with Cepheids and supernovae; Riess et al. 2024 (arXiv:2401.04773), the Webb telescope's second look at the Cepheids; Freedman et al. 2024, the Chicago-Carnegie program (arXiv:2408.06153), a third method, using a different kind of star; the Local Distance Network, 2025 (arXiv:2510.23823), a community report that combines many methods. Each is `https://arxiv.org/abs/<number>`.

### Display

Three pictures on the dark-canvas style of earlier experiments, each labeled directly on the canvas (§14), stacked on a narrow window. Pictures 2 and 3 appear, with their guides, when the learner presses Run (before that, a line says so).

1. **The measurements on one number line (sky blue and orange).** A horizontal axis of H₀ from 64 to 78 km/s/Mpc with tick marks and the label "Expansion rate, H₀ (km/s/Mpc)". Each measurement is a dot with a horizontal bar showing its uncertainty and its name and value written above it, one row per measurement so no label sits on another; the early-universe value in sky blue, nearby-universe values in orange. Planck's dot, bar and vertical dashed line to the axis are drawn from the start. At stage 2 the chosen measurement appears in its own row; at stage 3 a "gap = …" bracket (a line with a tick at each end and the number under it) is drawn just under that row; at stage 7 the other nearby-universe measurements appear in rows below, a little fainter.
2. **How much do the two uncertainties overlap? (sky blue and orange hills, purple overlap).** Two bell-shaped curves, one centred on the early-universe value (sky blue, labeled "Planck 2018") and one on the chosen measurement (orange, labeled with its name), each as wide as its uncertainty, on the same axis as Picture 1. The shaded overlap (the lower of the two curves at each point) is purple. Below the axis, from stage 4: a "gap = …" bracket and a short purple bar labeled "one combined give-or-take = …". From stage 5: numbered tick marks lay that one-doubt length end to end along the gap (1, 2, 3 … for each full one), and the line "sigma = gap ÷ combined = …" is written under them.
3. **What the gap means for age (sky blue and orange bars, yellow line).** From stage 6: two horizontal bars on an axis of 0 to 16 billion years, the Hubble time (1 ÷ H₀) for the early-universe value (sky blue) and for the chosen measurement (orange), each labeled with its name and its length in billions of years, and a yellow dashed line labeled "real age, about 13.8 (full model)".

A **"How to read this diagram"** guide under each picture, to the standards of `CLAUDE.md` §14 and §29 (simple terms, every drawn element named, every unit defined, a worked moment with real numbers, a "what to look for, and what it would mean" list, no reveal of the result before the learner has predicted, §12). **The owner approved all three guides on 2026-10-17** (Picture 1's first five bullets on 2026-10-17 earlier, in the first pass; the rest, with the longer "what to look for" lists, in the second pass). As built:

#### Picture 1's guide

- **How to read this diagram.** This picture is a **number line**, like the marks on a ruler. It is made to compare measurements of one thing, the expansion rate H₀. Each measurement is drawn as a dot with a bar through it, and where the dot sits on the line is the value that measurement found. The further right a dot sits, the faster that measurement says the universe is expanding today.
- **The line and its numbers (64 to 78):** values of H₀ in **km/s/Mpc**, which means "kilometres per second, for each megaparsec of distance". For example, 67.4 means that a galaxy one megaparsec away (about 3.3 million light-years) is moving away at 67.4 kilometres per second, and one 100 megaparsecs away at 100 × 67.4 = 6,740 kilometres per second. Notice that the line starts at 64, not at 0. We zoom in on the narrow range where all the measurements fall, so that we can see them separately. That zoom makes small differences look big, so read the numbers, not just the gaps.
- **A dot:** one measurement's best value, where it sits on the line. The name beside it says whose measurement it is and which kind.
- **The thick bar through a dot:** that measurement's error bar, the range its "give or take" covers. The bar reaches as far left and as far right of the dot as the uncertainty. A longer bar means a less certain measurement, like a bathroom scale that jumps around more. The tape measure drawing in the introduction is a small example: "120.0, give or take 0.5" is a dot at 120.0 with a bar from 119.5 to 120.5.
- **The sky blue dot, bar and dashed line:** the early-universe measurement, from the Planck satellite, 67.4 ± 0.5. Its bar runs from 66.9 (that is, 67.4 − 0.5) to 67.9 (67.4 + 0.5), so it is short: this is a very precise measurement. The dashed line runs straight down from the dot to the number line. It is a ruler you can hold against any other point, to see at once whether that point is to the left, to the right or on top of it.
- **Orange dots and bars (they appear when you press Run):** the nearby-universe measurements, made with the distance ladder or other methods. Blue always means the early-universe kind and orange the nearby-universe kind. The one you chose appears first, in its own row. The other nearby-universe measurements appear last, in rows below it, a little fainter, so that you can compare all of them at the end.
- **The "gap" bracket (it appears in the third stage):** a short horizontal line with a tick at each end, just under the orange row you chose. It spans from the blue dot's value to the orange dot's value, and the number written under it, in km/s/Mpc, is the distance between those two best values: the bigger value minus the smaller. In the table example, the gap between 120.0 and 121.0 would be 1.0.
- **What to look for, and what it would mean.** Look at the picture once the other measurements have appeared. Here are three things to look at, and what each one would tell you.
  - **Where each orange dot sits compared with the dashed line.** The dashed line is the early-universe value. An orange dot to the *right* of it is a measurement that found a faster expansion than the early-universe value. A dot on or very near the line found nearly the same value. A dot to the *left* found a slower expansion. The distance from the line tells you how big the difference is, in km/s/Mpc. But the distance alone does not yet tell you whether the difference matters. That needs the next two things.
  - **Whether an orange bar and the blue bar touch or overlap.** If the bars overlap, there are values that both measurements say are plausible, so the two could easily be measuring the same true value, and the difference between their best values may be only chance. If there is a clear empty space between the bars, then even the "give or take" of each cannot close the gap, and the difference is harder to put down to chance. That empty space is the idea that sigma turns into a number.
  - **Which bars are long and which are short.** A short bar is a precise measurement, and a long bar is a less certain one. This changes how to read the distance from the line. A dot that is far from the line but has a very long bar can still be consistent with the line, because it is uncertain. A dot that is just as far away but has a short bar is a bigger puzzle, because the measurement was precise and still landed there. This is why we compare the gap with the "give or take", and do not look at the gap alone.

#### Picture 2's guide

- **How to read this diagram.** Picture 1 drew each measurement as a dot with an error bar. Picture 2 draws the same two measurements again, but shows the uncertainty in a richer way, as a **bell curve**, and then uses it to find sigma. It appears in the fourth and fifth stages of the run.
- **A bell curve:** a hill that is highest in the middle and falls away on both sides. Here, the middle is a measurement's best value, and the height of the hill at any point shows how plausible it is that the true value is there. The true value is most likely close to the best value, and less and less likely the further you go from it. (Think of throwing darts at a target: most land near the middle, a few land far out.) The "give or take" sets how wide the hill is. A very precise measurement is a tall, narrow hill. A less precise one is a lower, wider hill.
- **The sky blue hill:** the early-universe measurement, Planck. **The orange hill:** the nearby-universe measurement you chose. Each is labeled with its name. The line along the bottom is the same number line as Picture 1, in km/s/Mpc.
- **The purple shaded area:** the part where the two hills overlap, that is, the values that *both* measurements consider plausible. A large purple area means the two could easily be measuring the same true value. A small or missing purple area means there are hardly any values that both would accept.
- **The "gap" bracket** under the line: the same gap as in Picture 1, the distance between the two best values.
- **The short purple bar, "one combined give-or-take":** the combined doubt about the gap, worked out as in the introduction (multiply each give-or-take by itself, add, take the square root). Its length on the line is the length of one "doubt".
- **The numbered ticks along the gap (they appear in the fifth stage):** they lay that one-doubt length end to end along the gap, and number each full one, 1, 2, 3 and so on. The count of full doubts that fit, plus the leftover piece, is **sigma**, and it is written underneath as the gap divided by the combined give-or-take. In the table example, a gap of 1.0 and a doubt of 0.7 would show one full segment and a bit more, which is 1.4 sigma.
- **What to look for, and what it would mean.** Here are three things to look at, and what each one would tell you.
  - **How wide each hill is.** A narrow, tall hill is a precise measurement: the true value is probably very close to its best value. A wide, low hill is a less precise one. So two narrow hills that sit far apart are a stronger disagreement than two wide hills the same distance apart, because the wide ones could each easily be off by that much.
  - **How much purple there is.** Purple is the set of values that both measurements accept. A lot of purple means the two measurements agree about many possible true values, so there is no real conflict. A thin sliver of purple, or none at all, means there are almost no values that both would accept, so the two measurements are hard to reconcile.
  - **How many numbered ticks fit along the gap.** Each tick is one combined give-or-take. If only one or two fit, the gap is about the size of the doubt itself, and chance can easily explain it. The more that fit, the less likely it is that chance alone explains the gap. As the introduction said, 5 or more is the usual bar in science for calling a difference real rather than chance. The last, partly filled piece counts too, which is why sigma is not always a whole number.

#### Picture 3's guide

- **How to read this diagram.** The expansion rate is a speed, so it can be run backwards in time. If galaxies have always moved apart at today's rate, then earlier they were closer, and long enough ago everything was in one place. How long ago is the **Hubble time**, which is 1 ÷ H₀ (Cosmology Experiment 2). It is a rough age of the universe: the age it would have if the expansion had never sped up or slowed down. Picture 3 shows that rough age for each of the two values. It appears in the sixth stage of the run.
- **The line along the bottom (0 to 16):** time, in billions of years. One billion is a thousand million.
- **The sky blue bar:** the Hubble time that the early-universe value (Planck) gives. **The orange bar:** the Hubble time that the measurement you chose gives. The number on each bar is its length, in billions of years. A longer bar means a longer time since everything was together.
- **Why a faster expansion gives a shorter bar:** a faster expansion would have taken less time to spread everything out to its present size, as a faster car takes less time to cover the same road. For example, H₀ = 70 gives about 14.0 billion years (977.8 ÷ 70), and H₀ = 73 gives about 13.4 (977.8 ÷ 73).
- **The yellow dashed line, "real age, about 13.8":** the age of the universe from the full model that you met in Cosmology Experiment 6, which does not assume the expansion rate was always the same. The bars are rougher than this line. They are drawn so you can compare the two values with each other, not so that either has to land on the line.
- **What to look for, and what it would mean.** Here are two things to look at, and what each one would tell you.
  - **How much longer one bar is than the other, in billions of years.** This is what the gap between the two expansion rates would mean for the age of the universe. A small difference between the bars means the two values would give nearly the same age. A large difference means they would give noticeably different ages, so the disagreement matters for more than one number: it changes the story of how old the universe is. Read the difference from the numbers written on the bars, not only from how the bars look.
  - **Where each bar ends compared with the yellow line.** A bar that ends to the right of the yellow line gives a rough age older than the full model's 13.8. A bar that ends to the left gives a younger one. Because the bars use a rough rule, a small gap to the line is not a problem in itself. They are not meant to land on it. What matters is the size of the difference between the bars.

### Run

Staged, at a pace the learner can follow (the result does not depend on playback speed, §11):

1. **The early-universe measurement** appears on the line (Planck 2018).
2. **The nearby-universe measurement** the learner chose appears.
3. **The gap** between the two dots is marked, with its size.
4. **The two uncertainties** appear as bell curves (Picture 2) and the combined uncertainty is marked.
5. **The sigma** is written: the gap divided by the combined uncertainty.
6. **The age consequence** (Picture 3): the two Hubble times.
7. **The other nearby-universe measurements** appear on the line (including the third method, which falls between).
8. The results table, and then the tutor.

**As built (Step 3):** stages 1 to 7 run at 2.6 seconds each (presentation only; the numbers come from the physics module and do not depend on the timer). A line above the pictures names the stage ("Stage N of 7: …"), and after stage 7 says the run is complete and that the predictions are recorded and not marked. Planck's dot, bar and dashed line are already drawn before the run (as Picture 1's approved guide says), so stage 1 is the start of the run, not the first appearance. The results table (stage 8) is the next build step.

### Results (neutral, then explained by the tutor after the learner has responded)

**Wording approved by the owner on 2026-10-17, as built.** Shown only after the run, below Picture 3's guide. It says: "Results. These are the numbers behind the three pictures, for [chosen] compared with Planck 2018. They only report what was measured and calculated. They do not say why the numbers are what they are." Then:

- **Table 1** (name and value, two decimals): Planck 2018 (early universe) 67.4 ± 0.5 km/s/Mpc; the chosen measurement (nearby universe) with its value and uncertainty; the gap between the best values; the combined give-or-take; sigma; the Hubble time from each value, in billions of years. When the error bars are stretched, the combined give-or-take and sigma are labeled "(error bars ×k)".
- **Table 2:** every nearby-universe measurement (name, published value ± uncertainty, sigma from Planck 2018, at the current stretch), with the chosen one in bold and marked "(the one you chose)".
- **"What if the error bars were bigger?":** buttons ×1, ×1.5, ×2, ×3 and ×5. "Pretend that every 'give or take' above, in every row, were this many times larger. The tables update. The three pictures stay as they were, drawn with the published error bars." It does not clear the predictions. Start over, and choosing another measurement, return it to ×1.
- **Your predictions (recorded, not marked here):** the learner's two answers, listed as chosen.
- **"How to read these results"** (plain words): the gap (the bigger best value minus the smaller, the same as in Pictures 1 and 2); the combined give-or-take (the doubt about the gap, worked out as in the introduction); sigma (the gap divided by the combined give-or-take; about 1 is ordinary, 5 or more is the usual bar for calling a difference real; the papers' own statistics are more careful, so a sigma they quote can differ a little); the Hubble time (1 ÷ H₀ in billions of years, a rough age, not the real one); the second table (every nearby-universe measurement compared with Planck in exactly the same way, the chosen one in bold); and the stretch control (every give-or-take ×1.5, ×2, ×3 or ×5 larger; the gaps stay the same and the combined give-or-take grows by the same factor, so every sigma is divided by it; for example 4.0 sigma becomes 2.0 with error bars twice as large; only a what-if, not a claim that anyone's error bars are wrong; ×1 returns to the published ones).

**"Words and formulas" panel** (the project's collapsed quick-reference panel, placed above the measurement choice; wording approved with the results): before the run it lists the terms the introduction and guides define (the Hubble constant and the megaparsec; measurement, best value and uncertainty; error bar; early- and nearby-universe measurements; the distance ladder; sigma; tension; the Hubble time). After the run it gains three entries, written with the learner's own numbers: the sigma formula (sigma = gap ÷ √(u₁² + u₂²), worked as 73.04 − 67.4 = 5.64, √(0.5² + 1.04²) = 1.15, 5.64 ÷ 1.15 = 4.89 for SH0ES), the Hubble time formula (977.8 ÷ H₀, worked for Planck as 14.51), and the stretching rule (sigma ÷ k). The formulas wait until after the run because the worked example shows the sigma that Prediction 1 asks about (§12).

Nothing in the results says why the two values differ.

---

## Expected Observations

- SH0ES against Planck is **4.9 sigma**, H0DN against Planck **6.4**, CCHP against Planck **1.5** (computed).
- The nearby-universe values from SH0ES and H0DN are about 73 and 73.5, with small error bars that **do not overlap** Planck's.
- The CCHP value (70.4) sits **between**, with error bars that overlap both.
- The Hubble times are about 14.5 billion years (Planck) and about 13.3 to 13.4 (SH0ES and H0DN), a difference of about 1.1 to 1.2 billion years.
- Stretching the error bars by about 2.4 (SH0ES) or 3.2 (H0DN) is needed to bring the tension down to 2 sigma.

## Expected Learner Understanding

The learner should be able to say that sigma measures how many error bars apart two measurements are; that the early-universe and nearby-universe expansion rates are about 5 to 6 sigma apart and nobody knows why; that JWST's sharper images did not change the nearby value; that a third method gives something in between and its team sees no tension; and that a tension is a puzzle and not yet a discovery. They should not leave thinking that the standard model of the universe has been disproved, that one of the measurements is known to be wrong, or that this experiment explains the cause.

---

## New Concepts Introduced

**Uncertainty (error bar), sigma, tension, early-universe and nearby-universe measurements, the distance ladder** (in one paragraph).

## Relationship to Previous Experiments

- **Cosmology 1 (Hubble's law):** the Hubble constant is the slope of that experiment's speed-against-distance line.
- **Cosmology 2 and 6 (the Big Bang, the age of the universe):** the Hubble time and the age estimates.
- **Cosmology 3 (the microwave background):** the early-universe measurement's source.
- **Cosmology 4 and 7 (dark matter, lensing):** the standard model whose assumptions the early-universe value depends on.

## Relationship to Later Experiments

- **Frontier and Beyond 2 (dark energy), 3 (lumpiness), 4 (the neutrino) and 6 (dark matter searches)** use sigma and the idea of a tension. Experiment 3 shows a tension that went away.
- **The group's closing recap** lists this experiment's status label, Contested, with the others.

---

## Required Physics Tests

(For `src/physics/hubbleTension.test.ts`; the numbers are recomputed in the tests, with the specification's table written out by hand.)

1. **Table values:** the tension of each late measurement against Planck, to 2 decimals: 4.89, 6.41, 1.50; and the Hubble times 14.51, 13.39, 13.30, 13.89 billion years.
2. **Combined uncertainty:** `√(σ₁² + σ₂²)`: 0.5 and 1.04 gives 1.154; and the CCHP total of 1.22, 1.33 and 0.70 in quadrature gives 1.94.
3. **Symmetry:** the tension of A against B equals B against A.
4. **Zero:** a measurement against itself gives 0 sigma.
5. **Stretching:** the tension at stretch `k` equals the tension divided by `k`, for every measurement and for several `k`.
6. **Stretch needed:** applying `stretchNeeded` for a target `n_target` and then `tensionSigma` at that stretch returns `n_target`.
7. **Monotonic:** a larger gap at the same uncertainties gives a larger tension; larger uncertainties at the same gap give a smaller one.
8. **Hubble time:** it falls as H₀ rises; at H₀ = 70 it equals Cosmology Experiment 2's `hubbleTimeYears()` (the same unit conversions).
9. **The module's data:** `MEASUREMENTS` has exactly one early measurement (Planck) and the late measurements listed, with positive uncertainties.
10. **The between result:** CCHP's tension against SH0ES and against H0DN are each below 2 sigma (computed 1.21 and 1.48).
11. **Result record:** `runTensionExperiment` returns the early value, the chosen value, the gap, the combined uncertainty, the tension and both Hubble times, and the tension of each other late measurement, all equal to the functions above.
12. `RangeError` for a non-positive uncertainty, a non-positive Hubble constant, a stretch below 1 and a non-positive target sigma.
13. **The prediction answers (added with the tutor):** `sigmaRange` puts SH0ES in "between 4 and 6", H0DN in "more than 6" and CCHP in "less than 2"; 2, 4 and 6 belong to the lower range of each pair, so every tension falls in exactly one range; a negative tension throws `RangeError`.
14. **The Webb result:** `WEBB_CEPHEID_RESULT` holds −0.01, 0.03 and 8.2 as the source states, and `webbEffect()` gives "about the same" because the difference is smaller than its own uncertainty.

---

## AI Tutor Behavior

**Wording approved by the owner on 2026-10-17, as built** in `HubbleTensionTutor.tsx` (shown after the results, once the run is complete). The same pattern as the project's earlier experiments (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, after the learner has responded to each (a reply must be typed before Continue is enabled). The tutor does not invent physics and reports only what the physics module produced and what the cited papers state. Every number is read from `hubbleTension.ts`. The predictions are marked as matched or not matched in the explanation only. The answer to Prediction 1 is `sigmaRange(tension)`, and the answer to Prediction 2 is `webbEffect()` (about the same: the −0.01 difference is smaller than its own ± 0.03).

1. **Observe.** "Look at the three pictures and the tables. What do you notice about where the early-universe value and your nearby-universe measurement sit on the line, and about how their error bars overlap?"
2. **Compare with the predictions.** "You predicted that the two would be [range] sigma apart, and that the Webb telescope's new measurements would make the nearby-universe value [lower (closer to the early-universe value) / about the same / higher]. In this run the gap was [gap] km/s/Mpc and the distance in sigma was [sigma]. Comparing that with your predictions, what do you notice?"
3. **Conceptual question.** "Two careful teams measure the same thing, and get values that their error bars say should not happen by chance. What could explain it? And what would you want to check before deciding?"
4. **Explanation**, after the learner has responded. As built (nine parts after the marking), with the learner's numbers where shown in brackets:
   - **Your predictions.** "Now that you have thought about it, here is how each one compared with the result. You predicted that [late] and Planck 2018 would be [range] sigma apart. They were [sigma] sigma apart, which is [actual range]. [Your prediction matched. / Your prediction did not match.] You predicted that the Webb telescope's second look at the Cepheid stars would make the nearby-universe value [choice]. It left it about the same (the details are in part 5 below). [matched / did not match] Either way, the parts below explain why."
   - **1. What the results show, in your own numbers.** The early-universe value, the chosen measurement, the gap, the combined give-or-take ("the doubt about the gap"), the sigma, and the two rough ages.
   - **2. An everyday example: two people measuring a table.** The introduction's table (120.0 cm and 121.0 cm, a gap of 1.0 cm) written with the rule: with "give or take 0.5" each, the combined give-or-take is √(0.5² + 0.5²) = 0.71 cm and 1.0 ÷ 0.71 = 1.4 sigma, an ordinary difference; with "give or take 0.1" each, √(0.1² + 0.1²) = 0.14 cm and 1.0 ÷ 0.14 = 7.1 sigma, so you would look for a mistake. "Same gap, different sigma. What matters is the gap measured in units of the doubt."
   - **3. The counting, with simple math.** Sigma is the gap divided by the combined give-or-take, worked with the learner's numbers (for SH0ES: 73.04 − 67.4 = 5.64; √(0.5² + 1.04²) = 1.15; 5.64 ÷ 1.15 = 4.89). In Picture 2 it is the number of tick marks that fit along the gap. The papers' statistics are more careful, so their quoted sigma can differ a little.
   - **4. What 5 sigma means.** "Suppose there were no real difference, and the two measurements wobbled only by chance. How often would chance alone make them differ by 5 sigma or more? About once in 3.5 million times, counting only differences in one direction. That is roughly like flipping a coin and getting heads 22 times in a row. This is why 5 sigma is the usual bar in many sciences for calling a difference real. (At 1 sigma, chance alone makes a difference at least that big, in one direction, roughly one time in six, which is why 1 sigma is nothing to worry about.) Notice what 5 sigma does not tell you. It says that chance is an unlikely explanation. It does not say what the real explanation is, and it can only count random wobble. A mistake that affects a whole measurement in the same way would not show up in sigma at all."
   - **5. What was ruled out.** The crowding worry (in a crowded patch of sky, the Hubble telescope's pictures might blur a Cepheid together with its neighbours and spoil its distance). In 2024 the James Webb Space Telescope looked again at more than a thousand of the same Cepheids; its measurements differed from the Hubble telescope's by −0.01 ± 0.03 magnitudes (the astronomers' scale of brightness), a difference smaller than its own give-or-take, so the two agreed and the nearby-universe value stayed about the same. The authors report that this rejects unrecognized crowding as the explanation, at 8.2 sigma. Like retaking a blurry photograph with a sharper camera and getting the same answer.
   - **6. A third method.** The Chicago-Carnegie program, with red giant stars, finds 70.39 ± 1.94: 1.50 sigma from Planck and 1.21 from SH0ES. Its error bar is long, so it overlaps both. "The authors state that their results are consistent with the current standard model of the universe." The SH0ES team and the 2026 community report (H0DN, 73.5 ± 0.81, many methods) find the higher value. "This is why the status is Contested: careful teams, real data, and results that point in different directions."
   - **7. What it could be, and what it is not.** One possibility: one or more measurements has an error nobody has found. The other: the standard model, which the early-universe value depends on, is missing something. Neither has been shown. Another microwave-background telescope, ACT, reported in 2025 that models designed to raise the early-universe value are not favoured by its data. The experiment cannot decide between the two possibilities.
   - **8. What it means for the age.** With the learner's numbers, the simple age 1 ÷ H₀ from each value and the difference in billions of years; a rough estimate, not the real age (about 13.8, Cosmology Experiment 6). A disagreement about the expansion rate today is also a disagreement about how long the universe has been expanding.
   - **9. What was shown, and what was not.** A few published measurements, simple error bars, a rough age. "A tension is a puzzle, not yet a discovery, and cosmology has seen tensions disappear when measurements improved. This one has not so far." Not shown: how any measurement is made in detail, or why they differ. "As of October 2026, it is still an open question."

**Differences from the earlier draft of this section:** (1) part 6 follows the Chicago-Carnegie abstract's wording ("consistent with the current standard model") instead of "they conclude there is no real tension", which the abstract does not say; (2) part 4 adds the heads-in-a-row comparison, the one-sixth figure for 1 sigma and the note that sigma counts only random wobble; (3) part 5 does not convert the magnitude difference to a percentage (no source check); (4) part 9 says the tension-disappearing remark generally, without referring to Experiment 3 of this group (not built).

### Chapter summary (wording approved by the owner on 2026-10-17, read as covered by "wording approved" after the tutor)

Shown below the experiment only after the tutor's explanation. "What you learned": two kinds of measurement of how fast the universe is expanding disagree. The microwave background gives 67.4 ± 0.5, and the distance ladder gives about 73 (73.04 ± 1.04 in 2022, 73.50 ± 0.81 in 2026), which is about 5 to 6 sigma apart, where sigma is the gap divided by the combined uncertainty. JWST's sharper images did not change the nearby-universe value, and a third method gives about 70, in between. Nobody knows whether a hidden error or new physics is behind it. "What's next": the next experiment asks whether dark energy, the other big unknown of the expansion, changes over time. (The "What's next" sentence points to Frontier and Beyond Experiment 2, which has no specification yet.)

---

## Real-World Facts Used, and Source Status

All statements checked on 2026-10-16 against the arXiv abstract pages of the original papers (the full papers were not read), except where marked.

| Statement | Source | Status |
|---|---|---|
| Planck 2018 gives H₀ = 67.4 ± 0.5 km/s/Mpc, and Ωm = 0.315 ± 0.007, in the six-parameter ΛCDM model | Planck Collaboration, arXiv:1807.06209 | Checked (abstract) |
| SH0ES 2022 gives H₀ = 73.04 ± 1.04, and reports a 5-sigma difference from Planck + ΛCDM; "the source of this now long-standing discrepancy... remains unknown" | Riess et al., arXiv:2112.04510 | Checked (abstract) |
| CCHP 2024: TRGB with HST + JWST gives 70.39 ± 1.22 (statistical) ± 1.33 (systematic) ± 0.70 (supernova); JWST-only TRGB 68.81 ± 1.79 ± 1.32 and JAGB 67.80 ± 2.17 ± 1.64; the authors state their results "are consistent with the current standard ΛCDM model" | Freedman et al., arXiv:2408.06153 | Checked (abstract) |
| JWST observations of over 1,000 Cepheids differ from HST's by −0.01 ± 0.03 mag, and "unrecognized crowding" as the cause of the tension is rejected at 8.2 sigma | Riess et al., arXiv:2401.04773 | Checked (abstract) |
| The Local Distance Network (H0DN) community report gives H₀ = 73.50 ± 0.81 (1.1 percent), published in Astronomy & Astrophysics 708, A166 (2026) | H0DN Collaboration, arXiv:2510.23823 | Checked (abstract; the journal reference from the page) |
| ACT DR6: "models introduced to increase the Hubble constant... are not favored by our data" | ACT Collaboration, arXiv:2503.14454 | Checked (abstract); no H₀ number taken from it |
| The introduction's explanations of how parallax, Cepheids (rhythm tells true brightness) and supernovae (nearly constant brightness, calibrated by Cepheids in their host galaxies) give distances, that the Planck value is worked out by assuming the standard model, that "in many sciences, 5 sigma is the usual bar for calling a difference real", and that a megaparsec is about 3.3 million light-years | General knowledge | **Not source-checked in this project** (approved by the owner as wording on 2026-10-17; to be checked against the papers or a textbook) |
| The links in the introduction's "Want to know more?" list: arxiv.org/abs/1807.06209, 2112.04510, 2401.04773, 2408.06153, 2510.23823 | The pages themselves | Fetched on 2026-10-17: all five load and their titles match the papers named. The page text says the numbers were checked against the summary pages on 2026-10-16 |
| "5 sigma: about once in 3.5 million times by chance alone, counting one direction; roughly 22 heads in a row; 1 sigma roughly one time in six, one direction" | Standard statistics, **computed by script on 2026-10-17** from the normal distribution (one-sided 5 sigma = 2.87 × 10⁻⁷, which is 1 in 3.49 million, or 21.7 coin flips; one-sided 1 sigma = 0.159) | Computed, not from a source text; the owner approved the wording |
| "Sigma counts only random wobble; a mistake affecting a whole measurement in the same way would not show up in sigma" | General statistics (systematic against random error) | Not source-checked in this project |
| "Cosmology has seen tensions disappear when measurements improved" (tutor, part 9) | General science history; the specification's Experiment 3 of this group (KiDS-Legacy, not built) would give an example | Not source-checked in this project |
| The Chicago-Carnegie authors state their results are "consistent with the current standard ΛCDM model"; tutor part 6 uses this wording | Freedman et al., arXiv:2408.06153, abstract | Checked (abstract) on 2026-10-16 |
| The sigma rule `|ΔH| ÷ √(σ₁² + σ₂²)` for two independent measurements | Standard statistics | Standard; the papers' own tension figures use fuller statistics (stated to the learner) |
| The Hubble time `1 ÷ H₀` as a rough age | Cosmology Experiment 2 | Already in the project |
| "The tension... remains unresolved as of October 2026" | The decade review (arXiv:2606.20434, abstract: the tension "remains regardless of whether the early-Universe observations depend on Planck CMB or not and the late-Universe measurements depend on distance ladders at all"), the H0DN report | Checked against abstracts; **must be re-checked** (see below) |

**Facts that may change (re-check list):** the tutor's "as of October 2026, it is still an open question", and the ACT remark (arXiv:2503.14454, 2025); the five links in the introduction (do they still load, and is there a newer paper by the same team); any new SH0ES, CCHP or H0DN value; any new early-universe value from the microwave background (ACT, South Pole Telescope, Planck re-analyses); any claim that the tension is resolved or explained; the status label "Contested". Last checked 2026-10-16.

---

## Decisions Needing Human Review

Each has a default; the owner may change any of them.

1. **Which measurements.** Default: Planck 2018 (early) and three nearby-universe values, SH0ES 2022, H0DN 2026 and CCHP 2024. Alternatives: add the JWST-only CCHP values as choices, or add a second early-universe value (ACT or SPT) after checking its number.
2. **Predictions.** Default: two (the sigma range, then what JWST did). Alternative: one (the sigma range only).
3. **JWST-only CCHP rows.** Default: shown in the results table only, not offered as a choice. Alternative: offered as choices.
4. **The error-bar stretch.** Default: an after-run exploration control (×1 to ×5) that updates the tensions and does not clear the predictions. Alternative: no stretch control, or a stretch before the run.
5. **The bell-curve picture.** Default: included, as Picture 2, because it shows the overlap that sigma measures. Alternative: only the number line and the table.
6. **The age consequence.** Default: included, using the simple 1 ÷ H₀, with a note that the true age is about 13.8. Alternative: leave it out, to avoid confusion with Cosmology Experiment 6.
7. **The status label placement.** Default: a line at the top, before the question, in plain words. Alternative: a badge in the chapter title area.
8. **How to name the two sides.** Default: "early-universe" and "nearby-universe" measurements. Alternative: "microwave background" and "distance ladder".
9. **A "5 sigma" explanation.** Default: "about one in a few million", marked as needing a source check. Alternative: say only that 5 sigma is the usual bar and give no probability. **As built:** the approved introduction takes the alternative (no probability). Whether the tutor's explanation (item 4) quotes "about one in a few million" is still to be decided when the tutor's wording is drafted.
10. **The sidebar.** Default: a new group heading "Frontier and Beyond", after "Spacetime Geometry: What Is Real, What Is Seen", with this as its first chapter.

---

## Success Criteria

1. The physics module gives, for each nearby-universe measurement, the gap, the combined uncertainty, the tension in sigma and both Hubble times, and the numbers agree with the table above (to a stated tolerance).
2. The learner predicts both questions before the run; Run requires both.
3. The pictures are labeled directly on the canvas (every dot, bar, line, curve, bracket, unit and colour), and each picture has its own guide under it in simple words.
4. The pictures show the contrast between the two kinds of measurement, and between a large and a small overlap.
5. The run shows its stages in order and names each.
6. The results are neutral; the explanation comes only after the learner has responded; the predictions are marked only in the explanation.
7. The introduction and caption define every term and formula, with a worked example, and neither says whether the chosen measurement agrees with Planck before the learner has predicted and observed.
8. The experiment never says that the standard model is wrong, that a measurement is known to be wrong or that the experiment explains the cause, and says plainly that experts disagree, with the status label and date visible.
9. The "Words and formulas" panel lists every term and formula (the formulas after the run).
10. Every published number matches the checked source, and the "facts that may change" list is in the specification.
11. Nothing contradicts Cosmology Experiments 1 to 10 or the earlier groups; in particular, the Hubble time at 70 km/s/Mpc equals Cosmology Experiment 2's.

---

## Implementation Notes

**Built so far (2026-10-17):**

- **Step 1, physics model and tests:** `src/physics/hubbleTension.ts` and `hubbleTension.test.ts` (24 tests covering the 12 required tests, checked by four deliberate breaks of the module). The full suite passed (899 tests).
- **Step 2, basic interface:** `src/components/HubbleTensionExperiment.tsx` (the status line, the introduction, the measurement choice and Picture 1 with its guide) and, in `src/App.tsx`, the new "Frontier and Beyond" group heading and this chapter with its draft chapter summary. Checked in headless Chrome at the local address; not checked at narrow widths or in other browsers. The introduction and Picture 1's guide were rewritten at the owner's request to the standard of `CLAUDE.md` §29 (longer, with everyday examples, an error-bar drawing, a step-by-step sigma example and links) and approved.
- **Step 3, predictions, Run and Pictures 1 to 3 (2026-10-17):** in `HubbleTensionExperiment.tsx`. The two predictions gate Run; the run has seven named stages; Picture 1 gains the chosen measurement, the gap bracket and the other measurements; Picture 2 (bell curves, overlap, combined give-or-take, numbered ticks, the sigma line) and Picture 3 (the two Hubble times and the 13.8 line) appear on Run, each with its guide. Run through all seven stages in headless Chrome with SH0ES and H0DN (CCHP not run); full suite 899 tests passed; `tsc` clean for the new files. Wording approved 2026-10-17. **Differences from this specification, for the owner's approval:** (1) Picture 3's bars are sky blue and orange (matching the two kinds of measurement) with only the real-age line yellow, where the specification says "(yellow)"; (2) Picture 2 has numbered tick marks along the gap showing how many combined give-or-takes fit, which the specification does not list; (3) Picture 1's guide gained a "gap" bracket bullet and a sentence on the chosen row appearing first, lost the placeholder "in a later step", and its "what to look for" list is longer; (4) a "Start over" button and the lock on the predictions during and after the run are not in the specification; (5) each stage lasts 2.6 seconds; (6) the prediction buttons' second question labels the first choice "Lower (closer to the early-universe value)". Not checked: the sidebar check mark on completion, CCHP's run, narrow widths, other browsers, a learner.
- **Step 4, results (2026-10-17):** in `HubbleTensionExperiment.tsx`. The neutral results (two tables and the learner's recorded predictions), the "What if the error bars were bigger?" control (×1 to ×5, which updates both tables and not the pictures) and the "Words and formulas" panel (formulas added after the run) are built. Run through to the results with CCHP (×2 checked: combined give-or-take 2.00 to 4.00) and SH0ES (the panel and both tables checked against this specification's numbers: gap 5.64, combined 1.15, sigma 4.89, Hubble times 14.51 and 13.39, and 6.41 and 1.50 for H0DN and CCHP). `tsc` clean; the physics module is unchanged. Wording approved 2026-10-17. **Differences from this specification, for the owner's approval:** (1) the stretch control leaves the three pictures at the published error bars and updates only the tables; (2) the tables show values to two decimals ("2.00", "1.50"), where the specification's table rounds; (3) the panel's formula entries are shown only after the run. Not checked: H0DN's stretch values, the sidebar check mark on completion, narrow widths, other browsers, a learner.
- **Step 5, the tutor (2026-10-17):** `src/components/HubbleTensionTutor.tsx`, shown below the results after the run; `HubbleTensionExperiment.tsx` passes the tutor the chosen measurement and both predictions and calls `onTutorComplete` when the learner reaches the explanation, which shows the chapter summary and saves the "explained" mark. The physics module gained `sigmaRange`, `WEBB_CEPHEID_RESULT` and `webbEffect` with four tests (28 tests in the file). Run through the whole flow in Chrome with H0DN (Prediction 1 matched, Prediction 2 not matched, all three tutor steps, the explanation, the chapter summary, and the sidebar check mark, which was previously unchecked). Full suite 903 tests passed; `tsc` clean for the new files. Wording approved 2026-10-17. **Differences from this specification, for the owner's approval:** the four listed under "AI Tutor Behavior" above.
- **Step 9, complete-flow test (2026-10-17):** a script drove the page in Chrome through all 36 combinations (3 measurements × 4 answers to Prediction 1 × 3 answers to Prediction 2), each a full run of about 18 seconds. Checked on every run: Run disabled until both predictions are made, enabled after both, and not after only one; the measurement and prediction buttons disabled during the run; all seven stages seen in order; the gap, combined give-or-take, sigma, both Hubble times and the second table's three sigmas against independent calculations (to two decimals); the predictions recorded; the stretch control (all five settings on the first pair of each measurement, ×5 and ×1 on the others: sigma divided by the factor, combined give-or-take multiplied, gap and ages unchanged, predictions kept); the tutor's three steps (Continue disabled until a reply is typed), the marking of both predictions as matched or not matched against the independent expectation, the learner's sigma in the explanation, no NaN, undefined or Infinity anywhere on the page; and Start over (results and tutor gone, Run disabled). **All 36 runs passed.** A separate check with cleared saved progress confirmed: the chapter summary is hidden until the tutor's explanation (after the run, and after tutor steps 1 and 2), is shown after it, the completion mark is saved when the run ends, and the explained mark only after the explanation. (The first version of the script reported "summary visible before the tutor's explanation" on all 36 runs. That was the saved explained mark from earlier manual runs, which the application keeps by design, and a second bug in the script's number parsing was fixed; neither was an application fault.) Console: no errors or warnings, only Vite and React development messages. Not covered by this test: narrow widths, other browsers, keyboard use, leaving the chapter during a run, and a real learner.
- **Step 10, final review (2026-10-17):** compared with `docs/PROJECT.md` (§9, §15, §16), `AGENTS.md`, `CLAUDE.md` §12, §14, §15, §28 and §29, this specification's eleven success criteria, and the original papers.
  - **Source check, repeated:** the arXiv abstracts of Planck (67.4 ± 0.5, "assuming the base-ΛCDM cosmology"), SH0ES (73.04 ± 1.04), Chicago-Carnegie (70.39 with 1.22, 1.33 and 0.70; "consistent with the current standard ΛCDM model"), the Webb Cepheid paper (more than 1000 Cepheids, −0.01 ± 0.03 mag, crowding rejected) and the Local Distance Network (1.1 percent) were re-read and agree with every number and quotation on the page. The intro's remark that Webb's finer detail removes crowding noise is supported by the same abstract.
  - **Success criteria:** all eleven met. Criterion 3 (every drawn component labeled on the canvas) was **not met at first**: Picture 2's purple overlap had no label on the picture. Fixed in the review (see below).
  - **Fixes made in the review, for the owner's approval of the new wording:** (1) Picture 2 now carries an on-canvas label, "purple area: the values both measurements accept (the overlap)"; (2) the numbers written on the pictures now show two decimals everywhere ("gap = 2.99", "one combined give-or-take = 2.00", "sigma = 2.99 ÷ 2.00 = 1.50"; before, "2" and "1.5" appeared), matching the results tables; (3) `webbEffect()` no longer guesses "lower" for a difference larger than its uncertainty: that case throws, because no rule maps it to lower or higher; (4) the Picture 3 real-age line takes its position from `REAL_UNIVERSE_AGE_YEARS` (Cosmology Experiment 2) instead of a typed 13.8; (5) one shared type, `SigmaRange`, for the Prediction 1 choices.
  - **Findings left for the owner:** (a) the "Words and formulas" panel does not define "gap", "combined give-or-take" or "bell curve", although the specification's criterion 9 says it lists every term (the introduction defines the first two and Picture 2's guide the third); adding them is new approved-wording territory. (b) At narrow widths (checked at 380 pixels) nothing overflows, but the three pictures scale down with the window to about half size, so the text drawn inside them is about 6 pixels high; `CLAUDE.md` §27 already records this limit for the earlier experiments. A fix such as a minimum picture width with sideways scrolling is the owner's decision. (c) A few general statements have no source check (listed in the source table): how parallax, Cepheids and supernovae give distances; "the satellite that mapped it most precisely was Planck"; "5 sigma is the usual bar"; "tensions have disappeared before". (d) No ESLint configuration exists in the project, so lint was not run. (e) `npm run build` is not run here; `tsc` shows no errors in this experiment's files (23 errors elsewhere are recorded in `CLAUDE.md` §27).
  - **Not checked:** other browsers, keyboard use, a screen reader, leaving the chapter during a run, whether the facts changed after 2026-10-16, and a real learner.
  - **Differences from the specification, for the owner's approval, all together:** those listed under Steps 3, 4 and 5 above.
- **Still to do:** none required by §21. Open: the owner's approvals above; the group-overview sentence for this group (`groupOverviews` in `src/App.tsx`) has not been drafted; a check with a real learner and in other browsers.
