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
export function tensionSigma(a: S8Measurement, b: S8Measurement): number         // side-facing rule; symmetric in its arguments; reuses combinedUncertainty
export function uncertaintiesFacing(a: S8Measurement, b: S8Measurement): { first: number; second: number }  // the two uncertainties tensionSigma uses (added in Step 4)
export function curveFor(m: S8Measurement): CurvePoint[]   // the equal-S8 curve at Omega_m 0.20 to 0.40 in steps of 0.01 (added in Step 1)
export const EARLY_MEASUREMENT, LATE_MEASUREMENTS, PLANCK_OWN   // added in Step 1
export function shift(from: S8Measurement, to: S8Measurement): number   // signed: to minus from
export function runLumpiness(focus: S8Measurement): LumpinessResult
// the early value, the chosen late value, the gap, the two uncertainties used and their combination, the tension, the paper's own figure, the same
// for every other late measurement, the KiDS shift and its direction, the equal-S8 curves, and Planck's own point, so the results can show them all
export type TensionRange = 'under1' | 'oneToTwoAndAHalf' | 'over2AndAHalf'
export function tensionRange(sigma: number): TensionRange   // the answer to Prediction 2
export type ShiftDirection = 'lower' | 'same' | 'higher'
export function kidsShift(): ShiftDirection                 // the answer to Prediction 1
```

Out-of-range inputs throw `RangeError` (a non-positive uncertainty or S₈, a negative σ₈, an Ωm outside 0 to 1). `kidsShift` says "same" only if the two values differ by less than the smaller of their uncertainties' quoted precision (0.001), and otherwise says the direction. The module invents no new physics.

---

## Learner Controls

1. **Run:** gated on both predictions.
2. **After the run only, "Look closer at":** three presets, KiDS-1000, KiDS-Legacy (the default) and DES Year 6, which shows both of its versions (NLA and TATT) side by side. It changes the first results table, which curve Picture 2 draws bold, and the worked examples in the "Words and formulas" panel. It does not clear the predictions.

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
4. **How lumpiness is measured: weak lensing** (as built, 2026-10-19, in four steps after the owner found the single bumpy-glass paragraph unclear). Matter bends light (Cosmology Experiment 7), and each distant galaxy's image is stretched by a very small amount in a direction set by the matter it passed (weak lensing, or cosmic shear). Step 1: galaxies come in all shapes, so one galaxy's stretching cannot be seen. Step 2: ovals under glass: flat glass (the ovals still point every which way), bumpy glass (each oval near a bump squashed a little, which cannot be told from any one oval), one small patch averaged (the random leanings cancel, the squashing adds up), patch by patch makes a map; followed by **a three-panel drawing** (A: ovals as they are; B: the same ovals through a bump; C: the average lean in each of twelve patches, orange with the bump and grey without it) and its "How to read this drawing" guide. Step 3: why many galaxies matter, with the coin comparison worked in numbers (a million flips, a spread of about 500, 510,000 heads is 20 spreads). Step 4: what the map tells you.
5. **Some new words, and two ingredients, one number.** Ωm (how much of the universe's energy is matter), σ₈ (how big the ripples in the matter are today; "sigma-eight", not the sigma of uncertainty: Decision 7), S₈ = σ₈ × √(Ωm ÷ 0.3) with the worked example from Planck's own numbers (0.811 and 0.315 give 0.831, and the page uses 0.834), tension and sigma, and calibration. (The S₈ entry names "the Planck satellite" and "the Kilo-Degree Survey team" with "(described below)", because the section that describes them follows.)
6. **Why distances matter,** then **"The measurements you will meet"** (added 2026-10-19 after the owner found that KiDS was never explained): Planck Legacy (the ESA satellite, its final 2018 results, a prediction and not a lensing measurement); KiDS (the Kilo-Degree Survey, an ESO survey imaging a patch of sky in nine colours; KiDS-1000, 2020, is the first analysis; KiDS-Legacy, 2025, covers the complete survey, 1,347 square degrees or about 3 percent of the sky, with more sky and improved calibration and image processing); DES (a different survey; Year 6, 2026, six years and about 140 million galaxies; NLA and TATT as two ways of treating one nuisance effect); and why the surveys are compared. (A first draft said KiDS-Legacy was "the same survey, analysed twice"; the final review found that wrong, because it uses more data, and it was corrected.)
7. **Sigma, again** (a short reminder of Experiment 1), and "5 sigma is the usual bar".
8. **What the learner does.** Make two predictions, press Run, then look closer at one survey.
9. **Assumptions** (the list above in plain language).
10. **"Want to know more?" links** (`CLAUDE.md` §29 rule 3). **As built, after the final review (2026-10-19):** before the run, only ESA's "Weak gravitational lensing" page for the idea, with a note that links to the papers and the surveys' own pages appear below the results after the run, because their summaries state what the predictions ask (§12). After the run: the KiDS-Legacy paper (arXiv:2503.19441), the KiDS-1000 paper (arXiv:2007.15633), the KiDS website, the DES Year 6 cosmic-shear paper (arXiv:2602.10065), the DES Year 6 results page, the Planck 2018 parameters paper (arXiv:1807.06209) and the 2026 review (arXiv:2602.12238). This departs from §29 rule 3's "visible from the start" to keep §12 (as in Experiment 2). Each link is fetched and recorded in the source table before the wording is approved.
11. **Date.** "As of October 2026."

The introduction must **not** say what KiDS-Legacy found, that its S₈ rose, or what DES Year 6 found. It may say that the KiDS-1000 result of 2020 was lower than the microwave-background prediction (Prediction 1 states it).

### Display

Three pictures, each with every component labelled on the canvas (§14) and a guide beneath it (§14 and §29).

- **Picture 1: "The measurements of S₈ on one number line."** S₈ from 0.70 to 0.88, Planck (sky blue, with its ± bar) and each survey as a dot with an asymmetric error bar (orange; KiDS-1000, KiDS-Legacy, DES Y6 NLA, with DES Y6 TATT paler). **As built:** Planck only is drawn before the run; the four survey dots appear together at stage 2, and at stage 3 each gets a white bracket to Planck's value with "gap … = … sigma" (for every survey, not only a chosen one).
- **Picture 2: "Why lensing measures a combination."** The σ₈ – Ωm plane (Ωm 0.2 to 0.4, σ₈ 0.6 to 1.05) with the curve of equal S₈ for Planck (sky blue) and for each survey (orange; after the run, the looked-at survey bold and the others fainter), labelled in a column at the right with short leader lines. A dashed line at Ωm = 0.3 where σ₈ equals S₈. Planck's own point (0.315, 0.811) as a dot on its curve. Labels: "Ωm: how much of the universe is matter", "σ₈: how big the ripples are", "each curve: every pair (Ωm, σ₈) that gives one value of S₈". Appears at stage 4.
- **Picture 3: "How the values changed over time."** Time (2019 to 2028 on the axis, by the year each paper was posted on arXiv) against S₈, Planck as a horizontal sky-blue band, KiDS-1000, KiDS-Legacy and DES Y6 (NLA and TATT, offset a fraction of a year either side of 2026) as dots with error bars, KiDS's two dots joined by a dashed arrow labelled with the shift (+0.056). Appears at stage 5.

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
13. `uncertaintiesFacing` gives, in the order of the arguments, the uncertainty on the side facing the other value (KiDS-1000 against Planck: 0.024 and 0.016; the other order: 0.016 and 0.024; a constructed survey above Planck: its downward uncertainty and Planck's upward one) (added in Step 4).
14. The result's reported uncertainties are what the combined uncertainty is made of, and the gap divided by the combined uncertainty is the tension (added in Step 4).

Each test must fail when the module is deliberately broken (several deliberate breaks, as in Experiments 1 and 2).

---

## AI Tutor Behavior

The same pattern as the earlier experiments (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next (Continue enabled only after a reply). The tutor does not invent physics; every number comes from `lumpiness.ts` or the cited papers. The predictions are marked as matched or not matched in the explanation only.

1. **Observe.** "What do you notice about where KiDS-1000, KiDS-Legacy and DES sit compared with Planck's band in Picture 1 and Picture 3?"
2. **Compare.** The two predictions, without marking.
3. **Conceptual question.** "KiDS's value rose when the team improved how it worked out the distances of the galaxies. What would you want to check before deciding the old value was wrong, or the new one was?"
4. **Explanation**, in simple words, with everyday examples, after a paragraph that marks the two predictions: (1) the learner's own numbers, for the survey looked at, with the paper's own figure beside it; (2) what S₈ combines, with a rectangle-area comparison (24 as 2 by 12, 3 by 8 or 4 by 6) and the two matching σ₈ values at Ωm = 0.25 and 0.35 on Planck's curve; (3) what changed in KiDS, in the authors' own words, with a ruler-in-a-photo example; (4) a plain statement that this is the authors' account and not an established cause, and that a wrong distance could push the answer either way (the specification's earlier "why a better calibration could raise S₈" is not written as a mechanism, because the project has no relation between calibration error and S₈: §8); (5) that the tension went away in KiDS; (6) that DES Year 6 still lies below Planck (the paper's own comparison, 2.0 and 2.3 sigma) and what the 2026 review concludes (none of its sigma values); (7) why this is **Contested**; (8) what was shown and what was not, with a sentence that other surveys and methods exist.

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
11. **The links kept back until the results.** Default: the KiDS-1000 paper, the Planck paper and the 2026 review. **Changed at the final review (2026-10-19), by the owner's approval:** the KiDS-Legacy paper, the KiDS website, the DES Year 6 paper and the DES results page are kept back too, because their summaries state what the predictions ask; only ESA's weak-lensing page is shown before the run.
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
- **Step 3, predictions, Run and Pictures 1 to 3 (2026-10-19):** in `LumpinessExperiment.tsx`. The two predictions gate Run; the run has five named stages of 2.6 seconds; Picture 1 gains the four survey dots with their asymmetric error bars (stage 2) and, for each, a white bracket with "gap … = … sigma" (stage 3); Picture 2 (the σ₈–Ωm plane with one curve of equal S₈ for each measurement, a dashed line at Ωm = 0.3 and Planck's own point) appears at stage 4 and Picture 3 (S₈ against the year, with Planck's band, the four survey points and a dashed arrow with the KiDS shift) at stage 5, each with its guide (what is drawn, a worked moment with real numbers, what to look for). Picture 1's guide gained bullets for the orange dots and the brackets (replacing the placeholder about Run) and a worked moment for KiDS-1000 (gap 0.075, combined 0.0288, 2.60 sigma). Run through all five stages in headless Chrome: Run disabled until both predictions are made, the stages and the pictures appear in order (two pictures until stage 4, then three, then four counting the introduction's drawing), no NaN, undefined or Infinity. Layout was corrected in the browser (gap text touching the next row's label; a text label on the axis in Picture 2; a label on the dashed line in Picture 3). Full suite 960 tests passed; `tsc --noEmit -p tsconfig.app.json` shows no errors in the new file (the project's 26 errors in other files are unchanged). **Draft wording for the owner's approval:** the two predictions (the specification's wording, with the 2020 value filled in from the module), the stage names, and the three guides and on-canvas labels. **Differences from this specification, for the owner's approval:** (1) all four survey dots appear together at stage 2, not one at a time; (2) stage 3 draws the gap and its sigma for **every** survey, not only for a chosen one (the "Look closer at" control is the results step); (3) Picture 2 draws the curves for all four surveys and Planck without a bold "looked-at" survey for now, labels them in a column at the right with short leader lines, and adds the dashed line at Ωm = 0.3 where σ₈ equals S₈; (4) Picture 3's DES points are offset by a fraction of a year either side of 2026 so that the two do not overlap; (5) the prediction buttons carry the spec's plain-language glosses ("Within 1 sigma (it agrees)", and so on); (6) a "Start over" button and the lock on the predictions during and after the run (the same additions as Experiments 1 and 2). **Unchecked:** that the "KiDS change is about 3.5 times the width of the band on one side" worked sentence in Picture 3's guide agrees with the paper (it is arithmetic from 0.056 and 0.016); the pictures at narrow widths and in other browsers; the guides were read through only once by their author.
- **A gap in the introduction fixed (2026-10-19, found by the owner):** the introduction never said what KiDS, DES or "Planck Legacy" are, though the predictions and pictures use the names (`CLAUDE.md` §15). A section "The measurements you will meet" was added to the introduction before "What you will do": Planck Legacy (the satellite, its final 2018 results, and that 0.834 ± 0.016 is a prediction, not a lensing measurement); KiDS (the Kilo-Degree Survey, an ESO survey that images a large patch of sky in nine colours; KiDS-1000 is the first analysis, 2020, and KiDS-Legacy the complete survey, 2025, with 1,347 square degrees, about 3 percent of the sky; both are the same survey analysed twice); DES (a different survey, Year 6, 2026, six years and about 140 million galaxies; NLA and TATT as two ways of treating one nuisance effect); and why the surveys are compared. Two pointers ("described in the introduction above") were added to Picture 1's guide. **Draft wording for the owner's approval.** Checked in Chrome: the section and both guide pointers render. **Unchecked:** that KiDS uses an ESO telescope (the KiDS page calls it an ESO survey); that Planck's "Legacy" means its final 2018 results; that the two surveys use different telescopes and teams; "a square degree is about five times the area of the full Moon" and "about 3 percent of the sky" are arithmetic (0.5° across gives 0.196 square degrees; 1,347 ÷ 41,253).
- **Step 3 approved by the owner on 2026-10-19:** "approved" (the two predictions, the stage names, Pictures 1 to 3 with their guides, the added introduction section "The measurements you will meet", and the six differences listed under Step 3).
- **Step 4, results, the "Look closer at" control, the "Words and formulas" panel and the links kept back (2026-10-19):** in `LumpinessExperiment.tsx`, with one new physics function, `uncertaintiesFacing`, and two new fields in the result (the uncertainties used, with 2 more tests: 25 in the file, 962 in the suite). After the run: the "Look closer at" control (KiDS-1000, KiDS-Legacy and DES Year 6, which shows both of its versions), which changes the first table, the bold curve in Picture 2 and the worked examples in the panel, and does not clear the predictions; two neutral tables (the chosen survey's sigma step by step, with the paper's own figure beside the computed one, and every measurement side by side) and the KiDS change; a "How to read these results" guide; and the links kept back until now (the KiDS-1000 paper, the Planck paper and the 2026 review). The collapsed "Words and formulas" panel is above the predictions from the start with 17 entries, and gains three formula entries after the run, each worked with the learner's chosen survey (the curve of equal S₈, sigma with unequal error bars, and the change between two analyses). Run in headless Chrome: the control is absent until the run ends; each survey's table matches independent values (KiDS-1000: gap 0.075, combined 0.0288, 2.60, "about 3"; KiDS-Legacy: 0.019, 0.0226, 0.84, "0.73"; DES: 0.036, 0.0213, 1.69 and 0.051, 0.0248, 2.05); one curve is bold for KiDS and two for DES; three formula entries after the run and none before; the three links; no NaN, undefined or Infinity. Full suite 962 tests passed; `tsc --noEmit -p tsconfig.app.json` shows no errors in the new files. **Draft wording for the owner's approval:** the control's explanation, the results text and its guide, the 17 panel entries and three formula entries, and the three links' descriptions. **Differences from this specification, for the owner's approval:** (1) the default survey looked at is KiDS-Legacy, and DES Year 6 shows both versions side by side in the first table; (2) the first table also lists the two uncertainties that face each other, so the learner can follow the sigma step by step; (3) the second table has the paper's own figures in a column; (4) the panel's "Gap", "Combined give-or-take" and "Sigma" entries are merged into two; (5) the "Planck Legacy" panel entry and the introduction's number are filled in from the module's data, but the "1,347 square degrees" and "about 3 percent" figures are typed text (from the paper and arithmetic). Not checked: narrow widths, other browsers, keyboard use, a learner; the three tables at narrow widths (both have a minimum width and scroll sideways).
- **Step 4 approved by the owner on 2026-10-19:** "wording approved, differences approved" (the control, the results and their guide, the panel entries, the links, and the five differences listed under Step 4).
- **Step 5, the tutor and the chapter summary (2026-10-19):** `src/components/LumpinessTutor.tsx`, shown below the results after the run, with the sequence in "AI Tutor Behavior" (observe, compare with the two predictions, the conceptual question "what would you want to check before deciding that the old value was wrong, or that the new one was?", then an explanation of eight parts after a paragraph that marks the predictions); `onTutorComplete` marks the chapter explained. The physics module is unchanged (its `kidsShift` and `tensionRange` already give the answers). The draft chapter summary replaces the placeholder in `src/App.tsx`; "What's next" says nothing about Experiment 4 (Decision 13). Run in headless Chrome twice, once with both predictions matching ("Higher", "Between 1 and 2.5 sigma") and once with neither ("Lower", "Within 1 sigma"): Continue is disabled until a reply is typed at each of the three steps; neither prediction is marked before the explanation; both are marked correctly in it; the summary is hidden until the explanation and shown after it; the progress marks are saved (completed after the run, explained after the explanation); no NaN, undefined or Infinity. Full suite 962 tests passed; `tsc --noEmit -p tsconfig.app.json` shows no errors in the new files. **Draft wording for the owner's approval:** the three tutor questions, the marking paragraph, the eight explanation parts and the chapter summary. **Differences from this specification, for the owner's approval:** (1) the explanation's parts 3 and 4 differ from the specification's: part 3 gives what changed in KiDS in the authors' own words, with a ruler-in-a-photo example, and part 4 says plainly that this is the authors' account and not an established cause, and that a wrong distance could push the answer either way (the specification's part 4, \"why a better calibration could raise S₈\", is not written as a mechanism because the project has no relation between calibration error and S₈, §8); (2) the first part uses the survey the learner looked at (with the paper's own figure beside it); (3) part 2 uses a rectangle-area comparison (24 as 2 by 12, 3 by 8 or 4 by 6) for why lensing fixes a combination, and the two matching σ₈ values at Ωm = 0.25 and 0.35 for the microwave-background curve; (4) the paper's own sigma figures are read from the module's strings, so the DES sentence reads \"2.0 (against Planck + ACT + SPT) and 2.3 (against Planck + ACT + SPT)\", which repeats itself and could be tidied; (5) the 2026 review is described by its conclusion only, with none of its sigma values (Decision 12) and without naming its authors in the sentence. **Unchecked:** the review's conclusion is read from its abstract only; \"other surveys and other methods (such as counting clusters of galaxies)\" is from the abstract's list of probes; the tutor wording \"a wrong distance could push the answer either way\" is a general statement, not a source claim; narrow widths, other browsers, keyboard use, a learner.
- **Step 5 approved by the owner on 2026-10-19:** "approved" (the three tutor questions, the marking paragraph, the eight explanation parts, the chapter summary, and the five differences listed under Step 5).
- **Step 9, complete-flow test (2026-10-19):** a script drove the page in Chrome through all 9 combinations of the two predictions (3 answers to Prediction 1 × 3 to Prediction 2), each a full run, then every "Look closer at" choice, then the tutor. **For speed, the script shortened only the page's 2.6-second stage timer to 60 milliseconds**; the real timing was watched in Step 3 and is not re-timed here. Checked on every run: Run disabled until both predictions are made (Prediction 2 first on a third of the runs) and not after only one; no tables, two pictures (the introduction's drawing and Picture 1) and 17 panel entries before the run; the "Look closer at" control absent until the run ends; the five stages seen in order, with 2, 2, 2, 3 and 4 pictures at stages 1 to 5; the prediction buttons disabled during the run; both predictions recorded; for each of KiDS-1000, KiDS-Legacy and DES Year 6, the first table checked against independent values (gap, combined give-or-take, sigma and the paper's own figure; both versions for DES), one bold curve in Picture 2 (two for DES), three formula entries with the right sigma in the worked example, and the predictions kept; the second table's four sigma values and the KiDS change (+0.056); the three kept-back links; 20 panel entries after the run; the tutor's three steps (Continue disabled while empty), neither prediction marked before the explanation, both marked correctly in it (Prediction 1 matched only for "Higher", Prediction 2 only for "Between 1 and 2.5 sigma"); no NaN, undefined or Infinity; the chapter summary hidden at each tutor step and shown after the explanation (checked on the first run only, since the saved explained mark keeps the summary visible on later runs by design); Start over (tutor and tables gone, Run disabled, the control gone). The completion mark was saved when the run ended and the explained mark only after the explanation. **All 9 runs passed with no failures on the first pass.** As a check that the script can fail, it was re-run with one expected value deliberately wrong (2.60 changed to 9.99): it reported the missing value on all 9 runs, plus 3 reports of the summary being visible early on a repeat run, which is the saved explained mark again, not an application fault. Console: not read separately. Not checked: other browsers, keyboard use, a screen reader, leaving the chapter during a run, narrow widths, a real learner.
- **Step 10, final review (2026-10-19):** compared with `docs/PROJECT.md`, `AGENTS.md`, `CLAUDE.md` §12, §14, §15, §28 and §29, this specification's ten success criteria, and the original papers.
  - **Source check:** the abstracts of KiDS-Legacy, KiDS-1000, DES Year 6, Planck 2018 and the 2026 review were read on 2026-10-19 while drafting this specification, and agree with every number and quotation on the page; they were **not re-fetched** at the final review. A search for newer results found nothing after the DES Year 6 paper, but found three things that are not on the page and bear on the story, from search summaries only (not read at a primary source): (a) a recalibration of the Hyper Suprime-Cam Year 3 result with DESI clustering redshifts, said to make it consistent with Planck, with the earlier tension attributed "primarily to photometric redshift calibration" (arXiv:2511.18134); (b) a statement that analysis choices can shift S₈ by about 0.03 to 0.05, comparable to the DES–KiDS difference; (c) a KiDS-Legacy follow-up using third-order shear (arXiv:2606.12389), which says the combined KiDS-Legacy result is consistent within 1 sigma with KiDS-1000 and DES. All three are candidates for the "facts that may change" list and for the tutor; the owner decides whether any is added.
  - **Success criteria:** 1 (S₈ and why lensing measures a combination), 2 (KiDS's rise from 0.759 to 0.815 and DES still below), 3 (every drawn component labelled, with guides, including the weak-lensing drawing), 4 (the label is Contested, dated October 2026, and the papers' own sigma values sit next to the computed ones), 6 (the module's tests failed under each of thirteen deliberate breaks), 7 (the tutor says it does not show which survey is right or what made KiDS's value rise), 9 (every number matches the checked source and the links include the original papers and official pages) and 10 (nothing contradicts Cosmology 3, 4, 7 and 9 or Experiments 1 and 2) are met. **Criterion 5 is not met:** see finding (a). **Criterion 8 is not fully met:** see finding (c).
  - **Findings left for the owner (changes to approved wording or to the specification, so not made):**
    - **(a) §12: links that reveal the answers.** Four links are visible from the start whose pages state what the predictions ask: the KiDS-Legacy paper (its abstract gives S₈ = 0.815, "in agreement" with Planck, and that the rise comes from the improved calibration: Prediction 1), the KiDS website (its title says the full-survey results are "in full agreement" with the microwave background), the DES Year 6 paper (its abstract gives the S₈ values and the sigma: Prediction 2) and the DES results page. The specification's item 10 lists them as visible from the start; Decision 11 keeps back only the KiDS-1000 paper, the Planck paper and the review. A learner can open them before predicting. **Proposed:** show only ESA's weak-lensing page before the run, and move the other four to the "More to read" list shown after the run (as was done for Experiment 2's DES and Lyman-alpha links).
    - **(b) Accuracy: "the same survey, analysed twice".** The introduction's "measurements you will meet" section and the panel's KiDS entry say KiDS-1000 and KiDS-Legacy are "the same survey, analysed twice". The KiDS-Legacy abstract says its footprint grew to 1,347 square degrees with additional calibration data, so it is not the same data re-analysed. The prediction and the tutor say this correctly (more sky, a better way of working out distances, improved image processing). **Proposed:** "Both are the same survey: KiDS-Legacy uses its complete data, with more sky and improved calibration and image processing."
    - **(c) §15: names used before they are defined.** In "Some new words", the S₈ entry mentions "the Planck satellite" and "the Kilo-Degree Survey team" before "The measurements you will meet" (a later paragraph) defines them. **Proposed:** move "The measurements you will meet" before "Some new words", or write "the Planck satellite (described below)" and "the Kilo-Degree Survey (described below)". The panel also has no entry for "arXiv" (it is explained in the links paragraph and Picture 3's guide); **proposed:** one entry.
    - **(d) The title hints at Prediction 1** (\"A Tension That Went Away\"): flagged at Step 2, kept as approved.
    - **(e) The specification's own text differs from the built experiment** and should be brought in line, with the owner's approval (§28.2): item 10 of the introduction (see (a)); the introduction's contents (a four-step weak-lensing explanation with a three-panel drawing, and a section on the measurements); the Display (survey dots appear together; every survey's gap and sigma at stage 3; Picture 2's leader labels, the Ωm = 0.3 line and bold curve; Picture 3's DES offset); the control (default KiDS-Legacy; DES Year 6 shows both versions); the tutor (parts 3 and 4); the module's exports (`uncertaintiesFacing`, `curveFor`, the result's extra fields; `tensionSigma` symmetric) and a list of tests 13 and 14 for `uncertaintiesFacing`; and the panel's 17 entries.
    - **(f)** `CLAUDE.md` §27 does not yet list Experiment 3; **(g)** no ESLint configuration exists, so lint was not run.
  - **Not checked:** other browsers, keyboard use, a screen reader, leaving the chapter during a run, the sidebar at narrow widths, and a real learner.
  - **Narrow width (emulated, 2026-10-19):** the experiment's container was narrowed to 340 pixels. Nothing overflowed, and the pictures scale to about half size, so the 11-pixel text in them is about 5 pixels high: the same limit as the earlier experiments (`CLAUDE.md` §27). Both results tables have a minimum width and scroll sideways.
- **The five approved fixes from the final review built (2026-10-19):** the owner approved all five ("approve all five and do them"): (1) four links that reveal the answers (the KiDS-Legacy paper, the KiDS website, the DES Year 6 paper and the DES results page) moved from the introduction to the "More to read" list after the run, leaving only ESA's page before it, with a sentence saying why; (2) "the same survey, analysed twice" corrected in the introduction and the panel to "the same survey: KiDS-Legacy uses its complete data, with more sky and improved calibration and image processing"; (3) the S₈ entry now says "the Planck satellite (described below)" and "the Kilo-Degree Survey team (described below)", and the panel gained an "arXiv" entry (18 entries before the run, 21 after); (4) this specification was brought in line with the built experiment (items 4, 5, 6 and 10 of the introduction, the Display, Learner Controls, the module's exports, tests 13 and 14, the tutor, Decision 11); (5) `CLAUDE.md` §27 now lists Experiment 3. Checked in Chrome: before the run, one link (ESA's); after it, eight (ESA's and the seven kept back); the panel has 18 entries before the run and 21 after, the arXiv entry is present, and the corrected sentence and the "(described below)" wording render. The complete-flow script of Step 9 was not re-run after these edits (its counts of 17 and 20 panel entries and three kept-back links are now 18, 21 and seven), so this is a spot check of one full run, not 9. **Wording for the owner's approval:** the new sentence about the links, the corrected KiDS sentence, the "(described below)" wording and the arXiv entry.
- **"What's next" now points to Experiment 4 (2026-10-19, at the owner's request after Frontier and Beyond Experiment 4 was built and reviewed):** the chapter summary's "What's next" in `src/App.tsx` was "This is the last experiment of the group built so far. The next ones will appear here once they have an approved specification." (Decision 13 had kept it silent about Experiment 4 until it was specified). It now reads "The next experiment asks whether the universe, by the way it expands and clumps, can weigh a neutrino, and whether that agrees with what laboratories find." An edit to wording the owner had approved; the owner approved the new sentence on 2026-10-19 ("wording approved", given for the Experiment 4 review's fixes, which include it).
