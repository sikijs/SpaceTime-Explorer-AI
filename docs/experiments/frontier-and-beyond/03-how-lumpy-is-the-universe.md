# Experiment 3 (Frontier and Beyond): How Lumpy Is the Universe? A Tension That Went Away, in One Survey

**Status: Specification APPROVED by the owner on 2026-10-19 ("approved", read as approving all thirteen decisions on their defaults, including the label Contested, the title with "in one survey", and Planck's S₈ of 0.834 ± 0.016; Claude should say so if the owner meant otherwise), proposed by Claude on 2026-10-19 per `CLAUDE.md` §23 Stages 1 to 3, as the third experiment of the group approved on 2026-10-16 (`00-group-proposal.md`, "list of 19 approved"). Nothing is built. The approval covers the specification, not the learner-facing wording. All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1), written to the standard of `CLAUDE.md` §29. Every published number was checked on 2026-10-19 against the arXiv abstract or the paper's own text (see "Real-World Facts Used, and Source Status"); the full papers were not read. Every number marked "computed" was computed by script on 2026-10-19 and must be re-checked by the physics tests.**

**This specification departs from the group proposal in two places, settled by the owner's approval on 2026-10-19 (Decisions 1 and 2): the proposal labelled this experiment "Strong evidence" and described the tension as having gone away. Since then (February 2026) the Dark Energy Survey published its six-year result, which is still below the microwave-background value by 2.0 to 2.3 sigma in the paper's own comparison. The honest label is therefore Contested, and the title says "in one survey".**

**Group:** "Frontier and Beyond" (Part A: the expanding universe and what fills it). **Status label shown to the learner (proposed): Contested (as of October 2026).**

---

## Overview

Cosmology Experiment 9 showed how tiny ripples in the early universe grew into galaxies and clusters. How *lumpy* matter is today (how much its density differs from place to place) is a number the standard model predicts from the microwave background (Cosmology Experiment 3). Astronomers can also measure it directly, through **weak gravitational lensing**: the matter between us and distant galaxies bends their light by a tiny amount, so the shapes of millions of galaxies are very slightly stretched in a pattern that follows the matter (Cosmology Experiment 7 showed the strong version of lensing).

The lumpiness is summarised in one number, **S₈**. From 2020 the KiDS survey measured a lumpiness about **3 sigma** below the microwave-background prediction: a **tension**, like the Hubble tension of Experiment 1, but for a different quantity. Then:

- In March 2025 the KiDS team published a re-analysis of its complete data (**KiDS-Legacy**): S₈ = 0.815, now **in agreement (0.73 sigma, in the paper's own comparison)** with the microwave background. The authors say the rise comes mainly from "improved redshift distribution estimation and calibration" (working out how far away the lensed galaxies are), plus new survey area and improved image processing.
- In February 2026 the **Dark Energy Survey** published its six-year (Year 6) cosmic-shear result: S₈ = 0.798 or 0.783, depending on how one nuisance effect is modelled, which is **2.0 to 2.3 sigma** below the combined microwave-background value in the paper's own comparison.
- A February 2026 review (Pantos and Perivolaropoulos) concludes that "survey-specific systematic effects contribute substantially" to the disagreements, while "physics beyond the standard Lambda-CDM model remains possible".

So the tension **went away in one survey and did not in another**, and no one yet agrees on why. That is why the proposed status is **Contested**.

The learner predicts whether the KiDS value rose, fell or stayed the same when the team improved its calibration, and whether the Dark Energy Survey's newer result now agrees with Planck, then runs the experiment. The pictures place the measurements on one line with their error bars, show why lensing measures a *combination* of two quantities, and show how the values changed over time.

The new ideas are (1) **lumpiness and S₈**, and (2) **a tension can disappear when a measurement is improved, and a second survey can still disagree**. Sigma is reused from Experiment 1. The experiment says honestly what it does not show: **it does not say which survey is right, and it does not say what made KiDS's value rise.** It reports what the KiDS authors say.

---

## Learning Objective

After this experiment, the learner should understand:

1. **S₈ is a number for how lumpy matter is today**, combined from two quantities (how much matter there is, Ωm, and how big the ripples in it are, σ₈): S₈ = σ₈ × √(Ωm ÷ 0.3). Lensing is especially sensitive to this combination.
2. **Weak lensing measures lumpiness by the tiny stretching of the shapes of distant galaxies** by the matter in between, and the result depends on knowing how far away those galaxies are.
3. **The microwave background predicts a value (about 0.83 with an uncertainty of about 0.016)** and **KiDS's first full analysis (2020) was about 2.6 to 3 sigma below it** (computed here; 3 sigma in the paper's words).
4. **KiDS's improved analysis (2025) raised S₈ from 0.759 to 0.815**, bringing it within about 0.8 sigma of the microwave-background value (0.73 in the paper's words). The authors give improved redshift calibration as the main reason.
5. **A tension can disappear when a measurement is improved.** This is why Experiment 1's tension is not yet a discovery.
6. **But not every survey agrees.** The Dark Energy Survey's 2026 result is still lower than the microwave background by about 1.7 to 2.1 sigma (computed here; 2.0 to 2.3 in the paper's words).
7. **Surveys use different data and methods, so a disagreement between surveys may be a measurement problem or something new, and a review in 2026 says systematic effects contribute substantially.** Nobody can yet say.
8. (A short remark.) **A tension is not a discovery, and one resolved tension does not settle the others.**

---

## Physical Situation

### Reused
- **Sigma** (Experiment 1 of this group): the gap between two values divided by their combined uncertainty. The module reuses `combinedUncertainty` from `hubbleTension.ts`.
- **Gravitational lensing** (Cosmology Experiment 7): matter bends light; here the bending is tiny and applies to millions of galaxies.
- **How ripples grow into clumps** (Cosmology Experiment 9): the reason matter today is lumpy.
- **The cosmic microwave background** (Cosmology Experiment 3), as the source of the predicted value, and **the standard model** with its Ωm.
- **Dark matter** (Cosmology Experiment 4): most of the matter that lenses is dark.

### What is new
- **S₈ and its two ingredients**, Ωm (how much of the universe's energy is matter) and σ₈ (how big the ripples in the matter are today), in plain language.
- **Cosmic shear**: the tiny pattern of stretched shapes, in one plain paragraph and one everyday comparison.
- **Calibrating the distances of the lensed galaxies** (their "redshift distribution"), as the thing the KiDS authors say changed. Explained only to the level of the authors' own words, with no calculation.
- **Three published measurements** of S₈ and the microwave-background value.

### Simplifying assumptions (all stated to the learner in plain language)
- Each published uncertainty is treated as a symmetric error bar, and two measurements as independent, so the combined uncertainty is √(σ₁² + σ₂²), as in Experiment 1. The survey values are published with different upward and downward uncertainties; **the simple sigma here uses the uncertainty on the side facing the other value** (Decision 4). The papers' own sigma values use fuller statistics, and **differ from the ones computed here** (the learner is shown both).
- The microwave-background comparison value is the one KiDS-Legacy itself quotes (Decision 3). Other published values depend on which Planck data are used.
- A few published measurements, chosen to show the story, are shown. They are not all the measurements of S₈ (Decision 8).

### Not introduced
How shapes are measured, how the redshift distribution is estimated, intrinsic galaxy alignments (the two DES analysis choices are named only as "two ways of treating one nuisance effect"), photometric redshifts, the statistics the papers use (Hellinger distance), cluster counts and other probes, eROSITA and SPT, early dark energy or any proposed explanation of a real tension, and the third-order shear analysis.

---

## Physics Model

### The numbers (published values; checked against the abstracts or text on 2026-10-19)

S₈ ≡ σ₈ √(Ωm ÷ 0.3).

| Measurement | Side | S₈ | Upward / downward uncertainty | Source |
|---|---|---|---|---|
| Planck Legacy (microwave background), as quoted by KiDS-Legacy | early | 0.834 | ± 0.016 | Wright et al., arXiv:2503.19441 (text, read through a page-reading tool) |
| KiDS-1000 cosmic shear (arXiv, July 2020) | late | 0.759 | +0.024 / −0.021 | Asgari et al., arXiv:2007.15633, abstract |
| KiDS-Legacy cosmic shear (arXiv, March 2025) | late | 0.815 | +0.016 / −0.021 | Wright et al., arXiv:2503.19441, abstract |
| DES Year 6 cosmic shear, one way of modelling the nuisance effect ("NLA", arXiv, February 2026) | late | 0.798 | +0.014 / −0.015 | DES Collaboration, arXiv:2602.10065, abstract |
| DES Year 6 cosmic shear, the other way ("TATT") | late | 0.783 | +0.019 / −0.015 | the same, abstract |

Planck's own abstract (arXiv:1807.06209) gives Ωm = 0.315 ± 0.007 and σ₈ = 0.811 ± 0.006, which make S₈ = 0.811 × √(0.315 ÷ 0.3) = **0.831** (computed). Its S₈ uncertainty needs the two values' correlation and is not in the abstract; another value in the literature is 0.832 ± 0.013 (a search summary, not checked at a primary source: Decision 3).

The papers' own comparisons with the microwave background, from the abstracts: KiDS-1000, "approximately 3 sigma"; KiDS-Legacy, "in agreement (0.73 sigma)" (the text gives 0.76 sigma for a Hellinger-distance comparison and 1.01 for a second statistic); DES Year 6, "2.0σ (2.3σ)" in S₈ for NLA (TATT), compared with a combination of Planck, ACT and SPT, and 1.1σ (1.7σ) in the full parameter space.

### The rules

- **S₈** from its parts: `S₈ = σ₈ × √(Ωm ÷ 0.3)`.
- **The curve of equal S₈** in the σ₈ – Ωm plane: `σ₈(Ωm) = S₈ ÷ √(Ωm ÷ 0.3)`. A measurement of S₈ fixes this curve, not a point on it (lensing measures the combination).
- **Combined uncertainty:** `√(σ₁² + σ₂²)` (Experiment 1).
- **Tension in sigma:** `|S₈(survey) − S₈(Planck)| ÷ combined uncertainty`, using for the survey the uncertainty on the side facing Planck (a lower survey value uses its upward uncertainty) and Planck's ± value for Planck.
- **The shift** between two measurements of one survey: the difference of the two S₈ values.

### Numbers (computed 2026-10-19; the tests recompute them)

| Measurement | Gap from Planck (0.834) | Uncertainty used (survey, Planck) | Combined | Tension (sigma, computed here) | The paper's own figure |
|---|---|---|---|---|---|
| KiDS-1000 | 0.075 | +0.024, 0.016 | 0.0288 | **2.60** | about 3 |
| KiDS-Legacy | 0.019 | +0.016, 0.016 | 0.0226 | **0.84** | 0.73 |
| DES Y6 (NLA) | 0.036 | +0.014, 0.016 | 0.0213 | **1.69** | 2.0 (against Planck + ACT + SPT) |
| DES Y6 (TATT) | 0.051 | +0.019, 0.016 | 0.0248 | **2.05** | 2.3 (the same) |

The shift from KiDS-1000 to KiDS-Legacy is **+0.056**. Equal-S₈ curve points (σ₈ at Ωm = 0.25 / 0.30 / 0.35 / 0.40, computed):

| S₈ | Ωm = 0.25 | 0.30 | 0.35 | 0.40 |
|---|---|---|---|---|
| 0.759 (KiDS-1000) | 0.831 | 0.759 | 0.703 | 0.657 |
| 0.815 (KiDS-Legacy) | 0.893 | 0.815 | 0.755 | 0.706 |
| 0.798 (DES Y6, NLA) | 0.874 | 0.798 | 0.739 | 0.691 |
| 0.834 (Planck) | 0.914 | 0.834 | 0.772 | 0.722 |

Planck's own σ₈ and Ωm (0.811 and 0.315) put its point on the curve for S₈ = 0.831 (computed).

### New: a small independent physics module

```typescript
// src/physics/lumpiness.ts (proposed)
export interface S8Measurement { name: string; side: 'early' | 'late'; year: number; value: number; up: number; down: number; paperSigma: string; source: string }
export const MEASUREMENTS: S8Measurement[]   // the table above, with the sources
export function s8(sigma8: number, omegaMatter: number): number                  // sigma8 x sqrt(Omega_m / 0.3)
export function sigma8OnCurve(s8Value: number, omegaMatter: number): number      // s8 / sqrt(Omega_m / 0.3)
export function tensionSigma(late: S8Measurement, early: S8Measurement): number  // side-facing rule; reuses combinedUncertainty
export function shift(a: S8Measurement, b: S8Measurement): number
export function runLumpiness(focus: S8Measurement): LumpinessResult
// the early value, the chosen late value, the gap, the combined uncertainty, the tension, the paper's own figure, the same for every other
// late measurement, the KiDS shift, and the equal-S8 curves, so the results can show them all
export type TensionRange = 'under1' | 'oneToTwoAndAHalf' | 'over2AndAHalf'
export function tensionRange(sigma: number): TensionRange   // the answer to Prediction 2
export type ShiftDirection = 'lower' | 'same' | 'higher'
export function kidsShift(): ShiftDirection                 // the answer to Prediction 1
```

Out-of-range inputs throw `RangeError` (a non-positive uncertainty or S₈, a negative σ₈, an Ωm outside 0 to 1). `kidsShift` says "same" only if the two values differ by less than the smaller of their uncertainties' quoted precision (0.001), and otherwise says the direction. The module invents no new physics.

---

## Learner Controls

1. **Run:** gated on both predictions.
2. **After the run only, "Look closer at":** three presets, KiDS-1000, KiDS-Legacy and DES Year 6. It changes the first results table and which curve Picture 2 highlights. It does not clear the predictions.

There is no control on the measurements themselves (Decision 6): the specification does not model what changed in KiDS's calibration, because the authors' own words are all this project has on it. **A "Start over" button** clears the predictions and the pictures (as in Experiments 1 and 2).

---

## Prediction Activity

Two questions, both answered before Run is enabled. Not scored while the learner is predicting; the tutor marks each as matched or not matched in its explanation (the group's pattern). Each ends "You are not graded, and a guess is fine."

> **Prediction 1: what did the better calibration do?** In 2020, the Kilo-Degree Survey (KiDS) measured S₈ = 0.759, which was about 3 sigma **below** the value predicted from the microwave background. In 2025 the team re-analysed its complete data with a better way of working out how far away the lensed galaxies are, more sky and improved image processing. Did S₈ come out **lower**, **about the same** or **higher** than in 2020?
>
> **Prediction 2: do the other surveys now agree?** In 2026 the Dark Energy Survey (DES), a different survey with a different telescope, published its own six-year result. Compared with the microwave-background value, how far below or above it is DES's S₈, in sigma? Buttons: **Within 1 sigma** (it agrees), **Between 1 and 2.5 sigma** (partly), **More than 2.5 sigma** (clearly different).

Right answers: Prediction 1 is **higher** (0.815 against 0.759), by `kidsShift()`. Prediction 2 is **between 1 and 2.5 sigma** (computed 1.69 for NLA, 2.05 for TATT), by `tensionRange`. The natural wrong answers: "about the same" for Prediction 1 (calibration sounds small) and "within 1 sigma" for Prediction 2 (from the idea that the KiDS fix settled it). The prediction texts do not say what KiDS found in 2025 or what DES found.

---

## Experiment Behavior

### Introduction (draft contents, to the standard of `CLAUDE.md` §29; the owner approves the wording line by line)

1. **The question.** "How lumpy is the universe today, and do the different ways of measuring it agree?"
2. **Where we left off.** Experiment 9 of Cosmology: gravity turned ripples in the early universe into galaxies. Everyday comparison: a field after a snowfall, smooth at first, then wind and time making drifts and bare patches. Lumpiness is how much the drifts differ from the bare patches.
3. **Why it matters, and how it is predicted.** The standard model, with the microwave background (Cosmology Experiment 3) as its starting point, predicts how lumpy matter should be today. If the real universe were smoother or lumpier, the model would be missing something. (This is the same kind of check as Experiment 1's.)
4. **How lumpiness is measured: weak lensing.** Matter bends light (Cosmology Experiment 7). Far from any single cluster the bending is tiny, but every distant galaxy's light has passed through a lot of matter, so each galaxy's shape is stretched by a tiny amount, in a pattern that follows the matter. One galaxy tells nothing, because galaxies are not round to begin with. But with millions, the average pattern shows the matter. Everyday comparison: looking at a printed pattern of ovals through a sheet of slightly bumpy glass: each oval alone could be oval for any reason, but if the shapes all lean the same way near a bump, you can map the bump.
5. **Two ingredients, one number.** **Ωm**: how much of the universe's energy is matter (dark matter and ordinary matter). **σ₈** ("sigma-eight", unrelated to sigma of uncertainty; Decision 7 for how to say the name): how big the ripples in the matter are today, measured in regions of one standard size. Lensing measures mostly the combination **S₈ = σ₈ × √(Ωm ÷ 0.3)**, which is why scientists quote it. A daily-life comparison and the worked example with Planck's own numbers (0.811 and 0.315 give 0.831).
6. **Why distances matter.** To turn the stretching into S₈ one must know how far away the lensed galaxies are: a galaxy farther away has had more matter in its path. The distances come from colours, not from measuring each galaxy individually, and getting this right is a hard part (stated in the authors' words, with no more detail).
7. **Sigma, again** (a short reminder of Experiment 1), and "5 sigma is the usual bar".
8. **What the learner does.** Make two predictions, press Run, then look closer at one survey.
9. **Assumptions** (the list above in plain language).
10. **"Want to know more?" links** (visible from the start; `CLAUDE.md` §29 rule 3): the KiDS-Legacy paper (arXiv:2503.19441) and the KiDS survey page; the DES Year 6 cosmic-shear paper (arXiv:2602.10065) and the DES Year 6 results page; ESA's "Weak gravitational lensing" page for the idea; the earlier KiDS-1000 paper (arXiv:2007.15633) and the Planck 2018 parameters paper (arXiv:1807.06209) only **after the run**, with the 2026 review (arXiv:2602.12238), because the abstracts of the KiDS-1000 and review papers state what the predictions ask or the tutor explains (§12). Each is fetched and recorded in the source table before the wording is approved.
11. **Date.** "As of October 2026."

The introduction must **not** say what KiDS-Legacy found, that its S₈ rose, or what DES Year 6 found. It may say that the KiDS-1000 result of 2020 was lower than the microwave-background prediction (Prediction 1 states it).

### Display

Three pictures, each with every component labelled on the canvas (§14) and a guide beneath it (§14 and §29).

- **Picture 1: "The measurements of S₈ on one number line."** S₈ from 0.70 to 0.88, Planck (sky blue, with its ± bar) and each survey as a dot with an asymmetric error bar (orange; KiDS-1000, KiDS-Legacy, DES Y6 NLA, with DES Y6 TATT paler, labelled "the other way of modelling"). The gap to Planck for the chosen survey, drawn as in Experiment 1. At stage 2 the survey values appear one at a time.
- **Picture 2: "Why lensing measures a combination."** The σ₈ – Ωm plane (Ωm 0.2 to 0.4, σ₈ 0.6 to 1.0) with the curve of equal S₈ for Planck (sky blue) and for each survey (orange; the looked-at survey bold). Planck's own point (0.315, 0.811) as a dot on its curve. Labels: "Ωm: how much matter", "σ₈: how big the ripples are", "each curve: all the pairs that give one S₈". Appears at stage 4.
- **Picture 3: "How the values changed over time."** Time (2020 to 2026, by the year each paper was posted on arXiv) against S₈, Planck as a horizontal sky-blue band, KiDS-1000, KiDS-Legacy and DES Y6 as dots with error bars, KiDS's two dots joined by an arrow labelled with the shift. Appears at stage 5.

The guides must name every picture, define every term (including "S₈", "σ₈", "Ωm", "tension", "calibration"), list every drawn element, give a worked moment with the chosen survey's real numbers, and give a "what to look for, and what it would mean" list, without revealing what the learner predicted before the run.

### Run

Five named stages of 2.6 seconds each: (1) "The microwave-background prediction", (2) "The surveys' measurements", (3) "The gap in sigma", (4) "Why lensing measures a combination", (5) "How the values changed". Playback speed does not change any number (§11).

### Results (neutral, then explained by the tutor)

Shown only after the run. Two tables: (1) for the survey looked at: its S₈ with up and down uncertainties, the gap from Planck, the combined uncertainty, the sigma computed here and **the paper's own figure side by side**; (2) every measurement with its year, S₈ and both sigma values; and the KiDS shift. A "Words and formulas" panel (collapsed from the start) lists every term, and gains the formulas and a worked example with the learner's numbers only after the run (§12). The links kept back until now (KiDS-1000, Planck, the 2026 review) are listed here.

---

## Expected Observations

- KiDS-1000 lies well below Planck's band, KiDS-Legacy lies inside it, and the two DES points lie in between, below it by less than KiDS-1000 did.
- The three curves in Picture 2 are close to each other and to Planck's: lensing measures the combination, so a difference of a few hundredths in S₈ is a small shift of the whole curve.
- The arrow in Picture 3 points up for KiDS, from the lower to the upper side of the band.

## Expected Learner Understanding

The learner should leave able to say, in their own words: what lumpiness and S₈ are; that lensing measures a combination; that KiDS's value rose with a better calibration and now agrees with Planck; that DES's newer result still lies below it; and that this is why the answer is still open.

## New Concepts Introduced

Lumpiness and S₈ (with σ₈ and Ωm), cosmic shear, calibration of galaxy distances, and a tension that disappears in one survey but not another.

## Relationship to Previous Experiments

Builds on Cosmology 3 (the microwave background), 7 (lensing) and 9 (growth of ripples), and Experiment 1 of this group (sigma, "a tension is not a discovery"). It supplies the example Experiment 1 mentions ("cosmology has seen tensions disappear"). It does not depend on Experiment 2.

## Relationship to Later Experiments

Experiment 4 (neutrino mass) is another quantity that depends on lumpiness (neutrinos smooth out clumps; stated only if the owner wishes); Experiment 7 of the group asks whether the standard model is missing something (wide binaries). The closing recap sorts all nineteen results by status label.

---

## Required Physics Tests

1. `s8(0.811, 0.315)` is 0.8310 to four decimals (Planck's abstract values), and `s8` for any σ₈ and Ωm = 0.3 equals σ₈ exactly.
2. `sigma8OnCurve(s8, Ωm)` inverts `s8`: `s8(sigma8OnCurve(S, Ωm), Ωm) = S` for several values.
3. The equal-S₈ curve values in the table above, to three decimals, for all four S₈ values and four Ωm.
4. Larger Ωm gives smaller σ₈ on a curve of fixed S₈ (the curve falls), strictly.
5. `tensionSigma` for each late measurement against Planck: 2.60, 0.84, 1.69 and 2.05, to two decimals, written out by hand.
6. The side-facing rule: for a survey below Planck the combined uncertainty uses the survey's upward uncertainty; for a survey above Planck it would use the downward one (a constructed case); swapping which is early gives the same sigma.
7. The shift from KiDS-1000 to KiDS-Legacy is +0.056 and `kidsShift()` is "higher".
8. `tensionRange`: 0.84 is "under1", 1.69 and 2.05 are "oneToTwoAndAHalf", 2.6 is "over2AndAHalf", with the edges at 1 and 2.5 as documented; DES Y6 (NLA and TATT) are "oneToTwoAndAHalf".
9. KiDS-Legacy is closer to Planck than KiDS-1000 (smaller sigma), and DES Y6 is further from Planck than KiDS-Legacy.
10. Planck's own S₈ from its abstract (0.831) is within 0.01 of the value used (0.834).
11. The published values in the table equal the module's data (a data test that catches a typing error), including the up and down uncertainties and the years.
12. Out-of-range inputs throw `RangeError`.

Each test must fail when the module is deliberately broken (several deliberate breaks, as in Experiments 1 and 2).

---

## AI Tutor Behavior

The same pattern as the earlier experiments (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next (Continue enabled only after a reply). The tutor does not invent physics; every number comes from `lumpiness.ts` or the cited papers. The predictions are marked as matched or not matched in the explanation only.

1. **Observe.** "What do you notice about where KiDS-1000, KiDS-Legacy and DES sit compared with Planck's band in Picture 1 and Picture 3?"
2. **Compare.** The two predictions, without marking.
3. **Conceptual question.** "KiDS's value rose when the team improved how it worked out the distances of the galaxies. What would you want to check before deciding the old value was wrong, or the new one was?"
4. **Explanation**, in simple words, with everyday examples: (1) the learner's own numbers; (2) what S₈ combines, with the equal-curve picture and a daily comparison (several pairs of numbers that give the same product); (3) what changed in KiDS (the authors' words only), with a daily example of a mistaken distance (a measuring tape stretched or a map scale wrong by a little changes every answer the same way); (4) why a better calibration could raise S₈, **in the authors' words, not as an established cause**; (5) that the tension went away in KiDS; (6) that DES Year 6 still lies below Planck (the paper's 2.0 to 2.3 sigma), and what the 2026 review says; (7) why this is **Contested**: two careful surveys, different results; (8) what was shown and what was not (it did not show which is right).

### Chapter summary (draft)

"What you learned" and "What's next", shown only after the tutor's explanation. Drafted after the owner approves the experiment, and then approved line by line. "What's next" points to Experiment 4 (the neutrino mass) only once it has an approved specification.

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| KiDS-Legacy: S₈ = 0.815 (+0.016, −0.021), "in agreement (0.73σ) with results from the Planck Legacy" experiment; about 32 percent more constraining power; the rise "primarily results from improved redshift distribution estimation and calibration, as well as new survey area and improved image reduction"; 1,347 square degrees | Wright et al., arXiv:2503.19441, abstract | **Checked (abstract) on 2026-10-19** |
| Planck Legacy S₈ = 0.834 ± 0.016, "full agreement (Hellinger distance of 0.76σ)"; "a decrease in the marginal Hellinger tension with Planck of 2.2σ for Σ₈ (1.65σ for S₈)" compared with KiDS-1000 | Wright et al., arXiv:2503.19441, text | **Checked on 2026-10-19 (read through a page-reading tool, from a page of 290,000 characters, in two places)**; not the printed paper |
| KiDS-1000: S₈ = 0.759 (+0.024, −0.021), approximately 3 sigma from Planck | Asgari et al., arXiv:2007.15633, abstract | **Checked (abstract) on 2026-10-19** |
| DES Year 6 cosmic shear: S₈ = 0.798 (+0.014, −0.015) NLA and 0.783 (+0.019, −0.015) TATT; consistent with Planck + ACT + SPT at 1.1σ (1.7σ) in the full space, and "2.0σ (2.3σ)" in S₈; about 140 million galaxies | DES Collaboration, arXiv:2602.10065, abstract (submitted 10 February 2026) | **Checked (abstract) on 2026-10-19** |
| Planck 2018: Ωm = 0.315 ± 0.007, σ₈ = 0.811 ± 0.006 | Planck Collaboration, arXiv:1807.06209, abstract | **Checked (abstract) on 2026-10-19**; the abstract gives no S₈ |
| "S₈ ≡ σ₈ √(Ωm ÷ 0.3)" | The KiDS-Legacy abstract | **Checked (abstract)** |
| The 2026 review: DES Y6 2.4σ to 2.7σ in S₈, KiDS-Legacy under 1σ; "survey-specific systematic effects contribute substantially to observed discrepancies"; "physics beyond the standard Lambda-CDM model remains possible" | Pantos and Perivolaropoulos, arXiv:2602.12238 (submitted 12 February 2026), abstract | **Checked (abstract) on 2026-10-19**; its sigma values differ from the DES paper's because it compares against a combination of CMB data (the learner is not given them: Decision 12) |
| Weak lensing, in one paragraph: tiny coherent distortions of the shapes of distant galaxies, a direct measure of the matter, sensitive to all matter | ESA Euclid page "Weak gravitational lensing" (search summary of the paper and page) | **Partly checked**: the ESA page loads; the explanation was not read in full |
| Planck S₈ = 0.832 ± 0.013 (an alternative value) | A search summary of the literature | **Not checked at a primary source**; not used (Decision 3) |
| σ₈ as "how big the ripples are, in regions of one standard size" (the standard definition is the rms density fluctuation in spheres of radius 8 h⁻¹ Mpc) | General cosmology | **Not checked** |
| "Galaxies are not round to begin with", and distances come from colours (photometric redshifts) | General astronomy | **Not checked** |
| Links: arxiv.org/abs/2503.19441, kids.strw.leidenuniv.nl, arxiv.org/abs/2602.10065, darkenergysurvey.org/des-y6-cosmology-results-papers/, sci.esa.int/web/euclid/-/46680-weak-gravitational-lensing, arxiv.org/abs/2007.15633, arxiv.org/abs/1807.06209, arxiv.org/abs/2602.12238 | The pages themselves | **Fetched on 2026-10-19: all eight load.** The KiDS page's title is "KiDS-DR5 and first cosmic shear results from the full survey: KiDS-Legacy" and it says the clustering is "in full agreement with the best-fit LCDM cosmology fit to the CMB"; the ESA page carries a notice that sci.esa.int is under review and not actively updated; the DES page gives a 3×2pt S₈ of 0.789 (+0.012, −0.012) with a 1.8σ full-space difference from the CMB (not used) |
| The group proposal's earlier figures for this experiment ("a 2.3 sigma tension", "S₈ = 0.815... after better calibration", "Strong evidence") | `00-group-proposal.md` (search summaries) | **Superseded**: KiDS-1000's tension is about 3 sigma in its abstract and 2.6 computed here; the label changes (Decision 1) |

### Facts that may change (re-check list, as of October 2026)

- New weak-lensing results (the full DES Y6 analyses, HSC, Euclid's first cosmology release) and re-analyses of any survey.
- Follow-ups to KiDS-Legacy, such as the third-order shear analysis (arXiv:2606.12389), which "helps disentangle whether the S₈ tension originates from σ₈ or from Ωm" (a search summary, not checked).
- Whether the journal versions of the papers changed any number.
- Whether the Planck comparison value should be updated if a combined CMB value (Planck + ACT + SPT) becomes the standard.

---

## Decisions Needing Human Review

Defaults are what I will use unless you say otherwise.

1. **The status label.** Default: **Contested** (not the proposal's Strong evidence), because the KiDS tension went away but the DES Year 6 result (February 2026) is still below the microwave background by 2.0 to 2.3 sigma in its own paper and a 2026 review finds systematic effects contribute. Alternative: "Strong evidence (that KiDS's tension was a measurement problem); Contested (whether others are)".
2. **The title.** Default: "How lumpy is the universe? A tension that went away, in one survey". Alternative: the group proposal's "How lumpy is the universe? A tension that went away", which would be misleading now.
3. **The Planck comparison value.** Default: S₈ = 0.834 ± 0.016, the value KiDS-Legacy itself quotes. Alternatives: 0.832 ± 0.013 (a search summary) or 0.831 from Planck's abstract (no uncertainty given). Which to use matters for the sigma values by a few tenths.
4. **The rule for asymmetric uncertainties.** Default: use the uncertainty on the side facing the other value, as stated to the learner. Alternative: use the average of the up and down values.
5. **The surveys offered.** Default: KiDS-1000, KiDS-Legacy and DES Year 6 (NLA as the main value; TATT shown as a second row with a plain-language note). Alternatives: add HSC Year 3 and DES Year 3 (each needs its own source check), or leave out TATT.
6. **No control on the measurements.** Default: none, because the specification has only the authors' own words on what changed in KiDS's calibration. Alternative: a "what if the calibration were off by x percent" control, which would need a relation between calibration error and S₈ that this project does not have (§8).
7. **How to say "σ₈".** Default: "sigma-eight", with a warning that it is not the sigma of uncertainty. Alternative: call it "the ripple size" in the text, keeping σ₈ only in the formula.
8. **Other surveys and probes.** Default: only the three; the tutor says in one sentence that other surveys and other methods exist (cluster counts, eROSITA, SPT) with the 2026 review as the source, and names no values. Alternative: add a short table from the review.
9. **Picture 2 (the σ₈ – Ωm plane).** Default: include it, with the exact equal-S₈ curves. Alternative: omit it and explain S₈ in words only.
10. **Picture 3's years.** Default: the year each paper was posted on arXiv (2020, 2025, 2026). Alternative: the journal years, which need to be fetched.
11. **The links kept back until the results.** Default: the KiDS-1000 paper, the Planck paper and the 2026 review (their abstracts give the answers to Prediction 1, Planck's values, and the review's conclusion). Alternative: show all from the start.
12. **The sigma values from the papers.** Default: show the papers' own figures next to the computed ones (about 3, 0.73, 2.0 and 2.3), and not the review's 2.4 to 2.7. Alternative: show the review's too.
13. **The mention of Experiment 4.** Default: the tutor does not mention neutrinos, and "What's next" says nothing about Experiment 4 until it is specified.

---

## Success Criteria

1. The learner can say what S₈ is in plain words and why lensing measures a combination.
2. The learner sees that KiDS's S₈ rose from 0.759 to 0.815 and now agrees with Planck, and that DES Year 6 still lies below it.
3. Every drawn component is labelled on the canvas, and each picture's guide follows `CLAUDE.md` §14 and §29.
4. The status label reads **Contested** (or what the owner chooses), dated October 2026, and the papers' own sigma values are shown next to the computed ones.
5. Neither the introduction nor the captions reveal the answers to the predictions before the learner has predicted (§12).
6. The physics tests above pass and fail under deliberate breaks.
7. The experiment says it does not show which survey is right or what made KiDS's value rise.
8. The "Words and formulas" panel lists every term and formula (formulas after the run), and every term is defined before it is first used (§15), including CMB, Ωm, σ₈, S₈, lensing, calibration and redshift distribution.
9. Every published number matches the checked source, the "facts that may change" list is in the specification, and the links list includes the original papers and official pages (§29 rule 3).
10. Nothing contradicts Cosmology 3, 4, 7 and 9 or Experiments 1 and 2.

---

## Implementation Notes

The work follows `CLAUDE.md` §6 and §21 one step at a time (the real `tsc` check is `tsc --noEmit -p tsconfig.app.json`).

**Built so far (2026-10-19):**

- **Step 1, physics model and tests:** `src/physics/lumpiness.ts` and `lumpiness.test.ts` (23 tests covering the 12 required tests, checked by thirteen deliberate breaks of the module, each of which made at least one test fail). The full suite passed (960 tests); `tsc --noEmit -p tsconfig.app.json` shows no errors in the new files (the project's 26 errors in other files are unchanged). The module reuses `combinedUncertainty` from `hubbleTension.ts`. **Differences from this specification, for the owner's approval:** (1) `tensionSigma(a, b)` is symmetric in its two arguments (the lower value uses its upward uncertainty and the higher its downward one) instead of taking `(late, early)`, so the order cannot matter; (2) `shift(from, to)` is signed (`to − from`, so KiDS-1000 to KiDS-Legacy is +0.056); (3) the module also exports `curveFor` (the equal-S₈ curve at Ωm 0.20 to 0.40 in steps of 0.01, 21 points), `LATE_MEASUREMENTS`, `EARLY_MEASUREMENT`, `PLANCK_OWN` (Planck's own σ₈ and Ωm from its abstract) and `CURVE_OMEGA_MIN` and `_MAX`, and its result carries the curves, the other tensions, the KiDS shift and its direction, and Planck's own point, so the interface reads every number from the module (§9); (4) the Planck entry is named "Planck Legacy" with the year 2018 (the Planck paper's year, not an arXiv year of the S₈ value, which the KiDS-Legacy text quotes); (5) `s8` accepts Ωm up to and including 1, and throws for 0 or below and for more than 1. Not checked: anything in the interface (not built).
- **Step 1 approved by the owner on 2026-10-19:** "approved" (the five differences listed under Step 1).
- **Step 2, basic interface (2026-10-19):** `src/components/LumpinessExperiment.tsx` (the status line, the introduction with its new-word list and its "Want to know more?" links, and Picture 1 with its guide) and, in `src/App.tsx`, the new chapter with a **placeholder** chapter summary (the real one is drafted with the tutor). Checked in Chrome at the local address: the page loads, the five links have `target="_blank"`, the chapter appears in the sidebar as "3. How lumpy is the universe?", the group overview shows, and Picture 1 draws Planck's dot, bar and dashed line without overlap. The full suite passed (960 tests); `tsc --noEmit -p tsconfig.app.json` shows no errors in the new files. All wording is draft for the owner's approval. **Differences from this specification, for the owner's approval:** (1) Picture 1 shows only Planck at this step, with the grey words "the surveys' values appear here when Run is built (a later step)" (the survey values are added at Run, and the words go when Run is built, as in Experiment 1); (2) the "Planck's own published ingredients" worked example (0.811 and 0.315 give 0.831) is in the introduction's S₈ entry, with a note that analyses of the same data differ in the third decimal and this page uses 0.834; (3) the "Where we left off" paragraph and the snowfall and bumpy-glass comparisons are new wording, as are the entries for Ωm, σ₈, S₈, tension and calibration; (4) the four links shown from the start are KiDS-Legacy's paper and website, DES Year 6's paper and results page, plus ESA's weak-lensing page; the KiDS-1000 paper, the Planck paper and the 2026 review are kept back for the results (Decision 11); (5) the "Words and formulas" panel, the survey choice and the "Look closer at" control are not built yet (the control is shown after the run, Step 4). **Unchecked claims in the introduction and guide:** that galaxies are not perfectly round to begin with; that distances come from colours in many filters; σ₈ as "how big the ripples are, measured in regions of one standard size"; the ESA page's explanation (the page loads, its text was read only in summary). **A point for the owner (§12):** the approved title says "A Tension That Went Away, in One Survey", which hints at Prediction 1's answer (that KiDS's value moved toward Planck's) before the learner predicts, as the group proposal's own title did; the earlier Black Holes Experiment 10 kept such a title as it stood. Not checked: narrow widths, other browsers, keyboard use, a learner.
- **The weak-lensing explanation rewritten, with a drawing (2026-10-19, at the owner's request):** the owner found the single bumpy-glass paragraph unclear; a longer explanation was drafted and approved ("wording approved, add the drawing"). In `LumpinessExperiment.tsx` the introduction's weak-lensing text is now four steps: (1) galaxies come in all shapes, so one galaxy's stretching cannot be seen; (2) the ovals-under-glass comparison in four bullets (flat glass; bumpy glass; one patch averaged; patch by patch makes a map); (3) why many galaxies matter, with the coin comparison worked in numbers (a million flips, a spread of about 500, 510,000 heads is 20 spreads); (4) what the map tells you. **The drawing (new, with a "How to read this drawing" guide, wording for the owner's approval):** three panels, drawn by a seeded generator so it is the same every time: A, 30 ovals as they are; B, the same ovals seen through a bump (each squashed along the circle round the bump, more near it); C, twelve patches, each the average of 250 hidden galaxies, with grey ticks (the average without the bump, tiny) and orange ticks (with the bump, running round it). The squashing is exaggerated, which the guide says; the drawing is labelled "an illustration". **Differences from this specification, for the owner's approval:** the drawing and its guide are not in the specification; the stretching in the drawing is a simple tangential pattern with a strength of 0.3 near the bump falling off over about 55 drawing units (an illustration, not a model of real lensing); the averages in panel C are computed in the drawing code from random numbers (arithmetic for illustration, with fixed seeds), not from the physics module. Checked in Chrome: the three panels draw without overlapping text after three layout fixes (a clipped title, a clipped subtitle, and a bump label that sat on an oval), and the orange ticks run round the bump. `tsc --noEmit -p tsconfig.app.json` shows no errors in the new file; the suite passes. **Unchecked:** that lensing's stretching is much smaller than the natural differences between galaxies (standard, not looked up); narrow widths and other browsers for the drawing.
- **Step 2 approved by the owner on 2026-10-19:** "wording approved" (the introduction, the longer weak-lensing explanation, the drawing and its guide, Picture 1 and its guide, and the links), read as also accepting the differences listed under Step 2 and under the drawing; Claude should say so if the owner meant otherwise.
