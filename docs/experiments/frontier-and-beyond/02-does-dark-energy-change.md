# Experiment 2 (Frontier and Beyond): Does Dark Energy Change?

**Status: Specification APPROVED by the owner on 2026-10-19 ("I approve all the decisions": all ten decisions on their defaults), proposed by Claude on 2026-10-19 per `CLAUDE.md` §23 Stages 1 to 3, as the second experiment of the group approved on 2026-10-16 (`00-group-proposal.md`, "list of 19 approved"). On approval the owner also asked for the introduction to explain what a supernova is (added below, item 3a). Nothing is built. The approval covers the specification, not the learner-facing wording. All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1), written to the standard of `CLAUDE.md` §29. Every published number was checked on 2026-10-19 against the arXiv abstract or the paper's own tables (see "Real-World Facts Used, and Source Status"); the full papers were not read. Every number marked "computed" was computed by script on 2026-10-19 and must be re-checked by the physics tests.**

**Group:** "Frontier and Beyond" (Part A: the expanding universe and what fills it). **Status label shown to the learner: Contested (as of October 2026).**

---

## Overview

Cosmology Experiment 5 showed that the expansion of the universe has been **speeding up**, and gave the name **dark energy** to whatever drives that. The simplest idea is that dark energy is a fixed property of empty space: the same strength at every time (the "cosmological constant", Λ). That idea sits inside the standard model, ΛCDM.

In March 2025 the **DESI** survey (the Dark Energy Spectroscopic Instrument, which measured the positions of more than 14 million galaxies and quasars) published its second data release. Combined with the cosmic microwave background and a collection of supernova measurements, it **prefers a dark energy that changes with time** over a constant one, by **2.8 to 4.2 sigma** depending on which supernova collection is used. Since then:

- the Dark Energy Survey recalibrated its supernovae (2025), and the preference with that collection fell from 4.2 to **3.2 sigma**; its authors call it "only a weak preference";
- in July 2026 DESI's new analysis of light from distant quasars (the Lyman-alpha forest) gave a result that **agrees with a constant dark energy**, so "the current hints of evolving dark energy may fade away", or "a more complex model may be needed to explain all of the results at once" (DESI's wording).

So this is **Contested**: real data, a hint that has moved up and down as the data improved, and no agreement on what it means.

The learner picks one of three supernova collections, predicts how big the difference would look in the distance to a galaxy and what the 2025 recalibration did to the preference, then runs the experiment. The pictures show how the dark energy's strength changes over cosmic time in the fitted model, how small the resulting change in distance is, and how the claimed sigma values compare with the usual labels (a hint, evidence, a discovery).

The new ideas are (1) **dark energy that changes with time**, described by two numbers, and (2) **how small an effect can be and still be argued about**. Sigma is reused from Experiment 1. The experiment says honestly what it does not show: **it cannot say whether dark energy changes.** It shows what a changing dark energy would mean and why the answer is still open.

---

## Learning Objective

After this experiment, the learner should understand:

1. **"Constant" dark energy means the same strength at all times.** A "changing" dark energy is one whose strength was different in the past. The simplest way to describe that is with two numbers, w₀ and wₐ (defined in the introduction in plain words).
2. **Changing dark energy changes how far away things look, but only slightly** (about 1 to 3 percent in distance at the middle of the range, for the published fits), which is why very large surveys are needed.
3. **DESI's result is a hint, not a discovery:** 2.8 to 4.2 sigma depending on the supernova collection, below the 5 sigma that Experiment 1 introduced as the usual bar for a discovery.
4. **The hint depends on the supernova collection, and on how the supernovae were calibrated:** the same DES supernovae, recalibrated, gave 3.2 sigma instead of 4.2.
5. **New data can pull the other way:** DESI's July 2026 Lyman-alpha result agrees with a constant dark energy.
6. **Why "contested" is the honest label:** the data are real, the experts disagree about their meaning, and the next data releases will decide.
7. (A short remark, as in Experiment 1.) **A hint is not a discovery**, and a good scientist keeps all the results in view.

---

## Physical Situation

### Reused
- **Dark energy and the distance a standard candle implies** (Cosmology Experiment 5): the luminosity distance, `d_L = (1 + z) × D(z)`.
- **Redshift** (Cosmology Experiments 1 and 5) and **the Hubble constant** (Experiment 1 of this group).
- **Sigma** (Experiment 1 of this group), including "5 sigma is the usual bar".
- **The cosmic microwave background** (Cosmology Experiment 3), as one of the datasets combined.

### What is new
- **Dark energy whose strength can change with time**, in the two-number description `w(a) = w₀ + wₐ(1 − a)`, where `a = 1 ÷ (1 + z)` is the size of the universe compared with today (a = 1 today, a = 0.5 when the universe was half its present size, z = 1).
- **Baryon acoustic oscillations (BAO)** as a "standard ruler", in one plain paragraph (a preferred spacing of about 500 million light-years in how galaxies are spread, left by sound waves in the early universe; compare the spacing's apparent size with its known true size to get a distance). No calculation of the ruler itself.
- **Several supernova collections** (Pantheon+, Union3, DES) and the fact that each combination of data gives a different sigma.

### Simplifying assumptions (all stated to the learner in plain language)
- A flat universe of matter and dark energy only. **Radiation is left out**, which is accurate to well under 1 percent in distance for redshifts up to about 2, and the experiment stays below z = 2. (Check: see "Decisions", item 5.)
- **Each model is compared with a constant dark energy that has the same matter fraction `Ωm`.** In the real analyses, each model is fitted separately and the best matter fraction differs, so the real comparison is subtler. This isolates the one thing the experiment is about (changing versus constant), and is said so.
- **Distances are compared at the same Hubble constant.** Supernovae alone cannot fix H₀, so the experiment also shows the distance difference with the nearby supernovae lined up (the "anchored" difference, in magnitudes), which is what a supernova survey can actually use.
- The experiment uses the **published best-fit values** of w₀, wₐ and Ωm for three supernova combinations. It does not redo any fit and does not claim to reproduce the sigma values (these are quoted, not computed).
- The two-number formula describes the data in the range where there are data (roughly z < 2). **Run far beyond that, it gives strange answers**; the experiment does not extend it, and says so.

### Not introduced
Any physical explanation of what dark energy is or why it might change (a rolling "quintessence" field, modified gravity, interaction with dark matter), the phantom divide, the full-shape and Lyman-alpha analyses beyond one plain sentence, how the fits are computed (Markov chains, Bayesian evidence), neutrino mass (Experiment 4 of this group), radiation, and any claim that dark energy does or does not change.

---

## Physics Model

### The numbers (published best-fit values, DESI Collaboration, arXiv:2503.14738, Table 5; checked 2026-10-19)

DESI BAO + CMB + a supernova collection, in the `w₀wₐCDM` model:

| Supernova collection | w₀ | wₐ | Ωm | Preference over a constant dark energy |
|---|---|---|---|---|
| Pantheon+ | −0.838 ± 0.055 | −0.62 (+0.22, −0.19) | 0.3114 ± 0.0057 | 2.8 sigma |
| Union3 | −0.667 ± 0.088 | −1.09 (+0.31, −0.27) | 0.3275 ± 0.0086 | 3.8 sigma |
| DES Y5 (original calibration) | −0.752 ± 0.057 | −0.86 (+0.23, −0.20) | 0.3191 ± 0.0056 | 4.2 sigma |

The model uses the central values. Other published values, shown as numbers in the results and not fed into the model: DESI BAO + CMB alone, **3.1 sigma**; DES Y5 recalibrated ("DES-Dovekie", arXiv:2511.07517), **3.2 sigma** (the paper's w₀ and wₐ for this combination were not read: Decision 3); DESI BAO alone is "in mild, 2.3 sigma tension" with the microwave-background value in a constant dark energy model (a different question, mentioned only if the owner wants it).

### The rules

- **Dark energy strength over time** (the ratio of its density at redshift z to its density today, from `ρ ∝ a^{−3(1 + w)}` with `w(a) = w₀ + wₐ(1 − a)`):
  `ρ_DE(z) ÷ ρ_DE(0) = (1 + z)^{3(1 + w₀ + wₐ)} × exp(−3 wₐ z ÷ (1 + z))`.
  For a constant dark energy (w₀ = −1, wₐ = 0) this is exactly 1.
- **Expansion rate** (flat, matter and dark energy):
  `E(z) = √( Ωm (1 + z)³ + (1 − Ωm) × ρ_DE(z) ÷ ρ_DE(0) )`.
- **Distance** (as in Cosmology Experiment 5): `D(z) = (c ÷ H₀) ∫₀ᶻ dz′ ÷ E(z′)` and `d_L = (1 + z) D(z)`, by Simpson's rule.
- **Distance difference** between the chosen model and a constant dark energy with the same Ωm: `ratio(z) = D_chosen(z) ÷ D_constant(z)`, shown as a percentage (it does not depend on H₀).
- **Anchored difference in magnitudes:** the brightness-based distance modulus is `μ = 5 log₁₀(d_L)` plus a constant; the anchored difference is `Δμ(z) = [μ_chosen(z) − μ_constant(z)] − [μ_chosen(0.05) − μ_constant(0.05)]`, which does not depend on H₀ either. A negative Δμ means the supernova looks brighter than the constant case.
- **w today and in the past:** `w(z) = w₀ + wₐ × z ÷ (1 + z)` (since `1 − a = z ÷ (1 + z)`).

### Numbers (computed 2026-10-19; the tests recompute them)

Distance difference `(ratio − 1)` and anchored magnitude difference, each model against a constant dark energy with the same Ωm:

| Collection | z = 0.3 | z = 0.5 | z = 1.0 | z = 2.0 |
|---|---|---|---|---|
| Pantheon+ | −1.27 % (−0.020 mag) | **−1.37 %** (−0.022 mag) | −1.00 % (−0.014 mag) | −0.38 % (0.000 mag) |
| Union3 | −2.71 % (−0.043 mag) | **−3.08 %** (−0.051 mag) | −2.61 % (−0.041 mag) | −1.53 % (−0.017 mag) |
| DES Y5 | −2.00 % (−0.032 mag) | **−2.24 %** (−0.037 mag) | −1.81 % (−0.027 mag) | −0.95 % (−0.008 mag) |

(For comparison only, not offered as a choice: the DESI BAO + CMB alone best fit, w₀ = −0.42, wₐ = −1.75, Ωm = 0.353, gives −5.40 % at z = 0.5. It is not used because it has no supernova collection and its uncertainties are very large.)

Dark energy density compared with today, `ρ_DE(z) ÷ ρ_DE(0)` (computed):

| Collection | z = 0.5 | z = 1.0 | z = 2.0 | w at z = 0 | w at z = 0.5 | w at z = 1 |
|---|---|---|---|---|---|---|
| Pantheon+ | 1.065 | 0.978 | 0.764 | −0.838 | −0.981 | −1.148 |
| Union3 | 1.184 | 1.063 | 0.730 | −0.667 | −0.919 | −1.212 |
| DES Y5 | 1.123 | 1.018 | 0.743 | −0.752 | −0.950 | −1.182 |

**Two honest points the specification draws from these numbers.** (a) The differences are **1 to 3 percent in distance** and **0.02 to 0.05 magnitudes** in brightness: small, which is why a hint needs a very large survey. (b) In this two-number description, dark energy was **stronger a few billion years ago and weaker much earlier** (the density at z = 2 is about 0.73 to 0.76 of today's, and above 1 near z = 0.5), and w drops below −1 in the past. Whether the real dark energy does this, or whether the two-number formula is just the simplest curve that fits the data, is **not known** (Decision 4).

### New: a small independent physics module

```typescript
// src/physics/evolvingDarkEnergy.ts (proposed)
export interface DarkEnergyFit { name: string; w0: number; wa: number; omegaMatter: number; sigma: number; source: string }
export const FITS: DarkEnergyFit[]   // the table above, with sources
export function darkEnergyDensityRatio(z: number, w0: number, wa: number): number
export function equationOfState(z: number, w0: number, wa: number): number
export function expansionRate(z: number, omegaMatter: number, w0: number, wa: number): number   // E(z)
export function comovingDistanceRatio(z: number, fit: DarkEnergyFit): number                    // evolving ÷ constant, same Ωm
export function anchoredMagnitudeDifference(z: number, fit: DarkEnergyFit, anchorZ = 0.05): number
export function runEvolvingDarkEnergy(fit: DarkEnergyFit, z: number): EvolvingDarkEnergyResult
// the chosen fit, w and density ratio today and at z, the distance ratio and anchored magnitude difference at z, and the distance ratio at the
// other three redshifts, so the results can show them all
export function sigmaLabel(sigma: number): 'below 3' | 'hint' | 'evidence' | 'discovery'   // thresholds: see Decision 6
```

Out-of-range inputs throw `RangeError` (z below 0 or above 2, Ωm outside 0 to 1). The module reuses the Simpson integration pattern and conventions of `darkEnergyExperiment.ts` (Cosmology Experiment 5) where it can, and invents no new physical assumption. With `w₀ = −1`, `wₐ = 0` it must reproduce Cosmology Experiment 5's matter-plus-Λ distance with `Λ = 1 − Ωm`.

---

## Learner Controls

1. **The supernova collection combined with DESI and the microwave background:** three presets, Pantheon+, Union3 and DES Y5.
2. **Run:** gated on both predictions.
3. **After the run only, "How far back?":** four presets, z = 0.3, 0.5, 1.0 and 2.0 (shown as "about 3.4, 5.2, 7.9 and 10.5 billion years ago" only if the owner approves those conversions; otherwise by redshift alone: Decision 7). It updates the results and Pictures 2 and 3's marker, and does not clear the predictions.

Changing the collection clears the predictions (Prediction 1 names it). The predictions are locked during and after the run. **A "Start over" button** clears the predictions and pictures (as in Experiment 1).

---

## Prediction Activity

Two questions, both answered before Run is enabled. Not scored while the learner is predicting; the tutor marks each as matched or not matched in its explanation (the pattern of Experiment 1 of this group). Each ends "You are not graded, and a guess is fine."

> **Prediction 1: how different would the distance look?** Suppose dark energy changed with time in the way the fit with **[collection]** describes. A galaxy whose light was emitted when the universe was about two-thirds of its present size (redshift 0.5) would be at a certain distance if dark energy were constant. How much different would its distance be if dark energy changed this way? Buttons: **Less than 0.5 percent**, **Between 0.5 and 2 percent**, **Between 2 and 5 percent**, **More than 5 percent**.
>
> **Prediction 2: what did the recalibration do?** The DES supernova collection gave a 4.2 sigma preference for changing dark energy. In 2025 the team improved how they calibrated the brightness of their supernovae. After that, did the preference become **weaker**, **stay about the same**, or **stronger**? Buttons: **Weaker**, **About the same**, **Stronger**.

Right answers: Prediction 1 depends on the choice (Pantheon+ 1.37 %, **between 0.5 and 2 percent**; Union3 3.08 %, **between 2 and 5 percent**; DES Y5 2.24 %, **between 2 and 5 percent**), computed by the module. Prediction 2: **weaker** (4.2 to 3.2 sigma). The natural wrong answers: "More than 5 percent" (because a "discovery" sounds big) for Prediction 1, and "stronger" for Prediction 2 (because new data usually sharpens a signal). Neither prediction asks the learner to calculate. Prediction 2 is not hidden by the introduction (the introduction states the original 4.2 and does not say what recalibration did).

---

## Experiment Behavior

### Introduction (draft wording, to the standard of `CLAUDE.md` §29; includes links to the original papers)

Contents (the owner approves the wording line by line):

1. **The question.** "Is dark energy always the same strength, or does it change as the universe ages?"
2. **Where we left off.** Experiment 5 of Cosmology: the expansion is speeding up; **dark energy** is the name for whatever drives it; the simplest idea is that it is a fixed property of empty space (a **constant**), the same strength at every time. A daily-life comparison: a constant dark energy is like a thermostat fixed at one setting; a changing one is a thermostat someone turns up and down slowly. (No physics beyond what is said.)
3. **Why anyone suspects it changes.** The **DESI** survey (a telescope in Arizona with 5,000 tiny robot-positioned fibres that measure many galaxies at once; check before use) measured the positions of more than 14 million galaxies and quasars. Galaxies are not spread completely at random: there is a preferred spacing of about 500 million light-years, left by sound waves in the early universe. Because its true size is known, how large it looks tells us how far away it is, like judging the distance of a telegraph pole from how big it looks, once you know the pole's real height. This **ruler** (called BAO) is combined with the microwave background and with **supernovae** (Experiment 5 of Cosmology: exploding stars of known brightness).
3a. **What a supernova is** (added at the owner's request on 2026-10-19, and made longer and more detailed at the owner's request the same day: "length is no issue, as long as the user clearly understands what a supernova is"; draft wording for approval). Shown as its own short section of the introduction, in small steps, each with a plain-language heading:
   - **A star is a fire that is slowly running out.** A star shines because, deep inside, it joins tiny particles together and gives off energy. The star stays the same size because that outward push balances gravity's inward pull, like a balloon that stays round because the air pushes out while the rubber pulls in. Daily-life comparison: a campfire that burns steadily as long as there is wood.
   - **What happens when the fuel runs out.** Eventually the fuel runs out and the push stops. A star like our Sun then shrinks into a **white dwarf**: a burnt-out core about the size of the Earth, yet with about as much material as the Sun. It is so dense that a teaspoonful would weigh several tonnes (check before use). It no longer makes new energy; it just slowly cools, like the embers when the campfire has died down. (Black Holes Experiment 9 of this project describes white dwarfs; this introduction says enough that the learner does not need to have read it.)
   - **A supernova is a star exploding.** A **supernova** (plural **supernovae**) is an explosion so powerful that it blows a whole star apart, and for a few weeks the exploding star shines as brightly as a whole galaxy of billions of stars. Daily-life comparison: a single match that for a few weeks shone as brightly as a whole city. This is why we can see supernovae in galaxies billions of light-years away.
   - **There are different kinds.** The very heaviest stars end their lives in a different kind of explosion. The kind used to measure distances is called **Type Ia** (said "type one-A"). It happens to a **white dwarf**.
   - **How a white dwarf explodes.** A white dwarf on its own just cools quietly. But if it has a companion, it can be pulled into an explosion: it can slowly drag gas off a nearby star, or merge with another white dwarf. Either way, it gets heavier until its inside becomes hot and dense enough that the carbon in it suddenly catches fire all at once, like a pile of dry paper that has been getting steadily hotter until it bursts into flame. The fire runs through the whole star within seconds and blows it apart. Astronomers are still working out how often each route happens (check before use). The explanation says so plainly and does not claim to know.
   - **Why Type Ia supernovae are useful: nearly the same brightness.** The explosions start from nearly the same conditions (a white dwarf near the same limiting mass, about one and a half times the Sun's mass; check before use), so their peak brightness is **nearly the same every time**. There is a small remaining difference: the brighter ones fade more slowly than the dimmer ones, so astronomers can correct for it by watching how fast each one fades (check before use).
   - **From brightness to distance.** Daily-life comparison: you see a street lamp far away in the dark. If you know all the lamps along the road have the same power, then the dimmer one is the farther one. A supernova of known true brightness works the same way: **the dimmer it looks, the farther away it is** (brightness falls with the square of the distance, as in Cosmology Experiment 5). Simple math: if one supernova looks 4 times dimmer than another of the same true brightness, it is 2 times as far away (since 2 × 2 = 4).
   - **Fixing the true brightness.** To use them, astronomers must first know the true brightness. They find it from supernovae in nearby galaxies whose distances are known another way, by the Cepheid stars of Experiment 1 of this group. That is the distance ladder of Experiment 1 again.
   - **Catching one.** A supernova shines for only a few weeks, and nobody knows in advance which star will explode. Astronomers photograph the same large patches of sky again and again and look for a new bright dot that was not there before, as you might spot a new light on a hillside you look at every night. Then they follow it as it brightens and fades.
   - **The two numbers each supernova gives.** (1) **How dim it looks**, which gives its distance. (2) Its **redshift**: the light of the galaxy it is in has been stretched on its way to us by the expansion of the universe, so the redshift says how much the universe has grown since the light set out (Cosmology Experiment 1). Together they say how far away something is *and* how much the universe has expanded in that time, which is exactly what is needed to ask how the expansion changed (Cosmology Experiment 5).
   - **What a "supernova collection" is.** A list of such measurements, gathered by different telescopes and calibrated in different ways. Different collections can give slightly different answers. **That is why this experiment lets the learner choose one.**
   - The wording must not say which collection leads to the largest or smallest effect (Prediction 1), or what the recalibration did (Prediction 2). Links for the learner who wants more on supernovae (fetched on 2026-10-19; both load; shown in the "Want to know more?" list and also placed after this section): **NASA Science, "Stellar Explosions"** (`https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-stellar-explosions/`: Type Ia supernovae, white dwarfs, the Chandrasekhar limit and standard candles), and **ESA/Hubble, "Supernova"** (`https://esahubble.org/wordbank/supernova/`: what a supernova is, Hubble's observations, standard candles and the accelerating expansion). Each opens in a new tab.
4. **The two-number description.** `w` says how a dark energy's density changes as the universe grows: `w = −1` means it stays the same; `w` above −1 means it thins out as space grows, like a gas; `w` below −1 means it grows. `w₀` is today's value and `wₐ` says how it changes with the universe's size. A constant dark energy is `w₀ = −1, wₐ = 0`. The learner does not need to remember the formula; the pictures show what it means.
5. **What "sigma" means here** (a short reminder of Experiment 1): how far a result is from a constant dark energy in units of the combined uncertainty; the learner will see 3 sigma is often called "evidence" and 5 "discovery" in some fields (Decision 6).
6. **What the learner does.** Pick a supernova collection, make two predictions, press Run.
7. **Assumptions** (the list above in plain language).
8. **"Want to know more?" links (a list visible from the start; `CLAUDE.md` §29 rule 3, added 2026-10-19).** For the results: the DESI DR2 paper (arXiv:2503.14738), the DESI Lyman-alpha paper (arXiv:2607.27410), the DES recalibration (arXiv:2511.07517), DESI's own pages (`desi.lbl.gov`). For the ideas explained: the NASA and ESA supernova pages of item 3a, and an official page on dark energy (NASA Science or ESA; to be found and fetched). Every link is fetched, and recorded in the source table, before the owner approves the wording.
9. **Date.** "As of October 2026."

The introduction must **not** say how small the distance difference is (Prediction 1) or what recalibration did (Prediction 2), and must not say whether the Lyman-alpha result changed the picture (it is in the results and the tutor).

### Display

A single canvas of three pictures, each with every component labelled on the canvas (§14) and a guide beneath it (§14 and §29). The guides, drafted at the same standard as Experiment 1's, must name every picture, define every term (including `w`, `redshift`, `magnitude`, `sigma`), list every drawn element, give a worked moment with the chosen collection's real numbers, and give a "what to look for, and what it would mean" list, without revealing what the learner predicted.

- **Picture 1: "How strong is dark energy, compared with today?"** A line chart over time, from "2 on the redshift scale (about 10 billion years ago)" on the left to "today" on the right. A flat grey line at 1 labelled "constant dark energy (the standard model)". The chosen collection's curve, in colour, labelled with its own w₀ and wₐ. A dot at today where both meet. Shown at once on selection; it does not depend on the run.
- **Picture 2: "How much farther or nearer would a galaxy look?"** The distance difference (percent) against redshift, from 0 to 2, with the zero line labelled "constant dark energy". The chosen curve, a marker at the "How far back?" redshift, with its percent printed next to it. On the right, a small second chart of the same effect in magnitudes (the "anchored" difference), because supernova surveys measure brightness. Appears on Run.
- **Picture 3: "How strong is the claimed hint?"** A bar chart of the published sigma values: DESI + CMB alone (3.1), with Pantheon+ (2.8), Union3 (3.8), DES Y5 original (4.2) and DES Y5 recalibrated (3.2), with a dashed line at 3 labelled "often called evidence" and one at 5 labelled "the usual bar for a discovery" (labels subject to Decision 6). The chosen collection's bar is highlighted. A final row, not a bar, reads "July 2026 DESI Lyman-alpha: agrees with a constant dark energy (no sigma value given for this)". Appears on Run.

### Run

Six named stages, each lasting a fixed time (2.6 seconds as in Experiment 1; Decision 8): (1) "Dark energy in the standard model: constant", (2) "The fit with [collection]: how w and the strength change", (3) "What that does to distances", (4) "The same thing in brightness", (5) "How strong is the hint?", (6) "Newer results". Playback speed does not change any number (§11).

### Results (neutral, then explained by the tutor)

Shown only after the run. Two tables: (1) the chosen collection's w₀, wₐ, Ωm; w and the density ratio today and at the chosen redshift; the distance difference and anchored magnitude difference at the four redshifts. (2) The five published sigma values. It reports what was published and calculated and does not say why. A "Words and formulas" panel (collapsed, from the start of the experiment) lists every term, and gains the formulas and a worked example with the learner's own numbers only after the run (§12).

---

## Expected Observations

- The chosen curve differs from the constant line by **tens of percent in the dark energy's density** but by **only 1 to 3 percent in distance**.
- The three collections give three different curves and three different sigma values.
- The sigma bars lie between the two reference lines, none reaches 5.
- Recalibration lowers DES's sigma. The newest result points back toward a constant dark energy.

## Expected Learner Understanding

The learner should leave able to say, in their own words: what a constant versus a changing dark energy means; that the effect on distance is small; that 3 to 4 sigma is a hint, not a discovery; that the hint depends on the supernova collection and on its calibration; and that later data can weaken it.

## New Concepts Introduced

Changing dark energy, w₀ and wₐ, BAO as a standard ruler, supernova collections, a "hint" versus "evidence" versus "discovery" (Decision 6).

## Relationship to Previous Experiments

Builds on Cosmology 5 (dark energy and supernova distances), 6 and 10 (age and fate depend on dark energy) and Experiment 1 of this group (sigma). It tells the learner that Cosmology 10's "fate of the universe" depends on whether dark energy is constant, which is still open.

## Relationship to Later Experiments

Experiment 3 (KiDS-Legacy) shows a tension that disappeared; Experiment 4 (the neutrino mass) uses the same DESI data and finds a related tension; the closing recap sorts all nineteen results by status label.

---

## Required Physics Tests

1. With `w₀ = −1, wₐ = 0`, `darkEnergyDensityRatio` is exactly 1 for every z, and `comovingDistanceRatio` is exactly 1.
2. With `w₀ = −1, wₐ = 0`, the module's distance equals `darkEnergyExperiment.ts`'s luminosity distance for `Λ = 1 − Ωm` (matching Cosmology Experiment 5).
3. `expansionRate(0, …) = 1` for every fit (today's expansion rate is H₀ by definition).
4. `equationOfState(0, w₀, wₐ) = w₀`, and `equationOfState(z → large) → w₀ + wₐ`.
5. `darkEnergyDensityRatio` agrees with a direct numerical integration of `ρ ∝ exp(3 ∫ (1 + w) d ln(1+z))` to a tight tolerance.
6. The tabulated values: distance differences, anchored magnitude differences and density ratios in the tables above, to the printed precision, for all three fits.
7. At a very small redshift (z = 0.01) every fit's distance ratio is within 0.2 % of 1 (nearby objects cannot tell the models apart, as in Experiments 1 and 5).
8. The anchored magnitude difference at the anchor redshift is exactly 0.
9. Convergence: doubling the number of integration steps changes the distance by a negligible relative amount.
10. `sigmaLabel` returns the label for each published sigma (2.8, 3.1, 3.2, 3.8, 4.2) and for 5 and above, per Decision 6.
11. Out-of-range inputs throw `RangeError`.
12. Each fit's `sigma` value equals the published value in the table (a data test that catches a typing error).

Each test must fail when the module is deliberately broken (as in Experiment 1: several deliberate breaks).

---

## AI Tutor Behavior

The same pattern as the project's earlier experiments (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next (Continue enabled only after a reply). The tutor does not invent physics; every number comes from `evolvingDarkEnergy.ts` or the cited papers. The predictions are marked as matched or not matched in the explanation only.

1. **Observe.** "What do you notice about how different the two curves in Picture 1 are, and how different the distances in Picture 2 are?"
2. **Compare.** Prediction 1 and 2 against the results.
3. **Conceptual question.** "If you were a scientist, what would you want before calling this a discovery?" (Open reply.)
4. **Explanation**, in simple words, with an everyday example for each mechanism: (1) why the differences are small: dark energy matters through a slight change in how fast the universe has grown, and a 2 percent change in distance is like two houses in a hundred at a slightly different distance (a daily comparison to be drafted); (2) why a hint is not a discovery, using Experiment 1's 5 sigma bar and the CERN statement that many 3 and 4 sigma effects have gone away; (3) why the collection matters (each supernova collection is calibrated differently); (4) the recalibration (4.2 to 3.2, "only a weak preference" in the authors' words); (5) the July 2026 Lyman-alpha result (DESI's wording); (6) that the data do not yet say which is right, and the status label: **Contested**; (7) what to watch next (future DESI releases, the Euclid and Rubin surveys; each to be source-checked before use: Decision 9).

### Chapter summary (draft)

"What you learned" and "What's next", shown only after the tutor's explanation, as in earlier experiments. The wording is drafted after the owner approves the experiment, and then approved line by line.

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| DESI DR2 BAO: more than 14 million galaxies and quasars; a preference for evolving dark energy with BAO + CMB of 3.1 sigma, and 2.8 to 4.2 sigma with supernovae; "a favored solution in the quadrant with w₀ > −1 and wₐ < 0"; the BAO preference for ΛCDM parameters is in "mild, 2.3 sigma tension" with the CMB | DESI Collaboration, arXiv:2503.14738, abstract | **Checked (abstract) on 2026-10-19** |
| The w₀, wₐ, Ωm and sigma values for Pantheon+, Union3 and DESY5 (table above) | arXiv:2503.14738, Table 5, read through a page-reading tool | **Checked on 2026-10-19 (read through a tool, not the printed paper)** |
| `w(a) = w₀ + wₐ(1 − a)`, "w evolves from a value ~(w₀ + wₐ) at high redshift to a present-day value of w₀" | arXiv:2503.14738 | **Checked on 2026-10-19** |
| DES-Dovekie: "Our results hold a significance of 3.2σ, reduced from 4.2σ for DES-SN5YR"; "only a weak preference for evolving dark energy" | DES Collaboration, arXiv:2511.07517, abstract | **Checked (abstract) on 2026-10-19**; the paper's w₀ and wₐ not read |
| DESI July 2026: the full-shape Lyman-alpha result "agrees with the standard model", which "could indicate that the current hints of evolving dark energy may fade away"; "a more complex model may be needed to explain all of the results at once"; key paper arXiv:2607.27410 | DESI release `desi.lbl.gov/2026/07/30/…` | **Checked (the release page) on 2026-10-19**; the paper itself not read, no sigma value taken |
| Supernova description in intro item 3a: a Type Ia is a white dwarf that explodes (by gaining mass from a companion or by a merger of two white dwarfs, route still debated); the explosion is a runaway fusion of carbon; the Chandrasekhar mass limit (about 1.44 Sun masses) explains why peak brightnesses are so alike; brighter ones fade more slowly (the Phillips relation); at its peak a Type Ia can outshine a whole galaxy; supernovae give distances out to several billion light-years | Search results of 2026-10-19: arXiv:2407.06859, arXiv:astro-ph/0609562, Sky & Telescope ("explaining supernova explosions"), Chandra/CfA 2011 release, AAVSO, arXiv:1712.10315 | **Checked on 2026-10-19 against search-result summaries only (not the original texts)**: all of the above. **Not checked:** the teaspoon-of-a-white-dwarf-weighs-several-tonnes figure, "about the size of the Earth", "as bright as billions of stars" as a number, the claim that heavier stars end in a different explosion (standard, not looked up), and the "Black Holes Experiment 9" cross-reference (to confirm what that experiment says about white dwarfs). No collection sizes are stated |
| Radiation is negligible below z ≈ 2 (under 1 percent in distance) | Standard cosmology | **Not checked**; to be tested by the module (Decision 5) |
| BAO's preferred spacing of "about 500 million light-years" | Standard cosmology (comoving sound horizon about 147 Mpc) | **Not checked** |
| DESI's instrument (Arizona telescope, 5,000 robotic fibres) | DESI's pages | **Not checked** |
| "3 sigma is often called evidence, 5 sigma discovery" | Particle-physics convention (CERN's "five sigma" FAQ checked in Experiment 1 for 5 sigma only) | **3 sigma label not checked** (Decision 6) |
| Density ratios, distance differences, magnitudes | Computed 2026-10-19 by script from the formulas above | Computed; the tests recompute them |
| The links in the introduction | The pages themselves | **Not fetched yet**; fetch each before the owner approves the wording (§29) |

### Facts that may change (re-check list, as of October 2026)

- DESI's further releases and the full-shape analyses; whether the Lyman-alpha result has been combined into a new overall sigma.
- New supernova collections (the ZTF, LSST/Rubin and Roman programmes) and further recalibrations; a w₀ and wₐ for DES-Dovekie.
- The Euclid survey's results.
- Any change to which collection gives which sigma.

---

## Decisions Needing Human Review

Defaults are what I will use unless you say otherwise.

1. **The choice.** Default: the three supernova collections (Pantheon+, Union3, DES Y5). Alternative: also DES-Dovekie, once its w₀ and wₐ are read.
2. **The question of what to compare.** Default: the model against a constant dark energy with the same Ωm. Alternative: each at its own fitted Ωm (closer to the papers, harder to explain).
3. **DES-Dovekie's w₀ and wₐ.** Default: shown only as a sigma value (3.2). Alternative: read them from arXiv:2511.07517 and add a fourth choice.
4. **The odd shape of the fitted dark energy** (stronger a few billion years ago, weaker earlier, w below −1 in the past). Default: shown honestly and labelled "the fit, not a known fact". Alternative: hide Picture 1 past z = 1.
5. **Radiation.** Default: left out, said to the learner, and the test shows its effect is small. Alternative: include it (more physics than the experiment is about).
6. **"Hint, evidence, discovery" labels.** Default: show only the 3 and 5 reference lines, labelled "often called evidence" and "the usual bar for a discovery", and mark the 3 label as needing a source check. Alternative: only the 5 sigma line, as Experiment 1 did.
7. **"How far back?" in years.** Default: by redshift only. Alternative: add lookback times in billions of years (about 3.4, 5.2, 7.9 and 10.5 for z = 0.3, 0.5, 1 and 2 in a Planck-like universe; these need to be computed and checked).
8. **Run timing.** Default: six stages of 2.6 seconds, as Experiment 1.
9. **"What to watch next" in the tutor.** Default: DESI's future releases only. Alternative: add Euclid, Rubin and Roman (each needs a source check).
10. **The Lyman-alpha result.** Default: stated in words only, with no sigma, because the release gives none. Alternative: read the paper (arXiv:2607.27410) and quote a number.

---

## Success Criteria

1. The learner can say what constant and changing dark energy mean.
2. The learner sees that the effect on distance is small (1 to 3 percent) while the density change is large.
3. Every drawn component is labelled on the canvas, and each picture's guide follows `CLAUDE.md` §14 and §29.
4. Sigma values appear as quoted, never as computed, and the status label reads **Contested**.
5. Neither the introduction nor the captions reveal the answers to the predictions before the learner has predicted (§12).
6. The physics tests above pass and fail under deliberate breaks.
7. With `w₀ = −1, wₐ = 0` the module reproduces Cosmology Experiment 5.
8. The experiment states it cannot say whether dark energy changes.
9. The "Words and formulas" panel lists every term and formula (formulas after the run).
10. Every published number matches the checked source, and the "facts that may change" list is in the specification.
11. Nothing contradicts Cosmology 5, 6 and 10 or Experiment 1.

---

## Implementation Notes

None yet. Nothing is built. After approval, the work follows `CLAUDE.md` §6 and §21 one step at a time, starting with the physics model and its tests.
