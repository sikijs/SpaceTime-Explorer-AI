# Experiment 7 (Frontier and Beyond): Do We Need Dark Matter, or Does Gravity Change? Wide Binary Stars

**Status: Specification APPROVED by the owner on 2026-10-20 ("approved defaults", read as approving all fourteen decisions on their defaults, including the two corrections to the group proposal in decision 1; Claude should say so if the owner meant otherwise), proposed by Claude on 2026-10-20 per `CLAUDE.md` §23 Stages 1 to 3, as the seventh experiment of the group approved on 2026-10-16 (`00-group-proposal.md`, item 7). The approval covers the specification, not the learner-facing wording. Steps 1 to 10 are built, tested, complete-flow tested and finally reviewed (2026-10-21); see "Implementation Notes". All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1), written to the standard of `CLAUDE.md` §29. Every published number was checked on 2026-10-20 against an arXiv abstract page (read through a fetch summary of the page, not the full paper; see "Real-World Facts Used, and Source Status"). Every number marked "computed" was computed on 2026-10-20 with a throw-away script and is re-checked by the physics tests.**

**Two corrections to the group proposal, for the owner (decision 1):** the proposal says that MOND would make the stars' *speeds* "about 40 percent higher". The papers read say the *gravity* is about 1.4 times stronger and the *speed* about 20 percent higher (the speed goes as the square root of the gravity: √1.4 = 1.18). And the proposal's "10 sigma" for the side that sees a boost is, in the papers read, a statement about the acceleration at one range of separations (Chae 2023), and the same author's paper on 2,463 binaries (first posted September 2023) gives about 5 sigma. His 2026 paper (36 binaries) gives a gravity boost γ = 1.60 (+0.24, −0.14) and, in the abstract read, no significance in sigma (see the final review, 2026-10-21).

---

## Overview

Cosmology Experiment 4 showed that galaxies spin too fast for the matter we can see, and the usual answer is **dark matter**. Experiment 6 of this group looked for dark-matter *particles*. A different answer is that the law of gravity itself changes when gravity is very weak. The best-known version is **MOND** ("Modified Newtonian Dynamics"). It says that below a certain small acceleration (called a₀, about 1.2 × 10⁻¹⁰ metres per second per second) gravity pulls somewhat harder than Newton's law says.

A clean test comes from **wide binary stars**: two stars far apart (thousands of times the Earth-Sun distance) that orbit each other very slowly. Their gravity is very weak, so a change of law would show as the stars moving faster than Newton predicts. And **dark matter hardly matters for two stars**: the amount of dark matter inside a region the size of the pair is tiny next to the stars' own mass (a rough number is given below, with its source status). The question is therefore about gravity, not about hidden mass.

The data come from **Gaia**, ESA's space observatory, which measured the positions and motions of about two billion stars. Teams have analysed the same kind of Gaia data and **disagree**: Banik and colleagues (2024) report that Newton's law is preferred at **19 sigma**; Chae and colleagues report a boost (about 5 sigma in a paper on 2,463 binaries, September 2023, and 10 sigma for a larger sample in May 2023), and in 2026 a gravity boost of γ = 1.60 (+0.24, −0.14) from 36 binaries with three-dimensional velocities. A March 2026 re-analysis of those 36 binaries by Saad and Ting finds no boost (γ = 1.00), and a February 2026 paper by Cookson and colleagues says Newton's law is up to 1,500 times more likely than MOND for their cleanest sample. **The status is Contested.**

This experiment lets the learner rebuild three ideas:

1. **How fast two stars orbit, and why wide pairs are slow and gravity there is weak.** Newton's law gives the speed from the total mass and the separation.
2. **What "modified gravity" would look like as a number.** A stronger pull of 1.4 times means speeds 1.18 times higher (about 20 percent), not 40 percent. This is a small effect, and it is hard to measure.
3. **Why two careful analyses of one kind of data can still disagree.** The effect is only about 20 percent. If a fraction of the "pairs" in a sample are really three stars, they move faster and can fake a boost. The experiment shows how much a hidden fraction can fake, and what the teams found.

It says honestly what it does **not** do: it does **not** analyse any Gaia data, it does **not** decide between the teams, and it does **not** say whether gravity changes or dark matter exists in some other form.

The new ideas are (1) **orbital speed from mass and separation**, (2) **a gravity boost factor and the square-root link to speed** and (3) **hidden companions can fake a signal**. Sigma, hint versus discovery, and "look in many places" are reused from Experiments 1 and 2, and dark matter's evidence from Cosmology 4 and 7 and Experiment 6.

---

## Learning Objective

After this experiment, the learner should understand:

1. **Two stars orbit their common centre, and the speed of the orbit is `v = √(G × M ÷ s)`** for a circular orbit, where M is the total mass and s the separation. A wider pair is slower and its gravity is weaker.
2. **Gravity is much weaker in a wide pair.** For a pair of total mass 1.5 Suns at 10,000 times the Earth-Sun distance, the pull is about 8.9 × 10⁻¹¹ m/s² (computed), a hundred billion times weaker than the pull of the Earth on us.
3. **A modified-gravity law such as MOND says that, below a₀, the pull is stronger than Newton's.** If the pull is `γ` times Newton's, the speed is `√γ` times Newton's. The papers' prediction for wide binaries in the Galaxy is `γ ≈ 1.4` and so a speed about 18 to 20 percent higher.
4. **A 20 percent effect is small against messy data.** Stars can be hidden (a close companion that cannot be resolved), orbits are seen at an angle, and distances and masses have errors. A fraction `f` of pairs that really move `k` times faster raises the average by `f × (k − 1)`, which can be the size of the signal.
5. **What the teams found**, as published (see the table): some report a boost, some report none, and the same 36 binaries gave γ = 1.60 in one analysis and γ = 1.00 in another. That is the meaning of Contested.
6. **What would settle it**: purer samples, three-dimensional velocities for more binaries (for example with the radial velocities that Gaia lacks for faint stars), a clear treatment of hidden companions, and the Galaxy's own pull on the pair (the "external field effect").

---

## Physical Situation

### Reused
- **Dark matter and the evidence for it** (Cosmology Experiments 4 and 7; this group's Experiment 6).
- **Sigma, hint and discovery, and "look in many places"** (Experiments 1 and 2).
- **Neutrinos and the idea of a floor of background** only in passing (Experiments 4 and 6).

### What is new
- **A binary star**: two stars bound by gravity, orbiting each other. A **wide binary** has a separation of thousands of **astronomical units** (an AU is the Earth-Sun distance, about 150 million km).
- **Orbital speed from `v = √(GM ÷ s)`** and the acceleration `g = GM ÷ s²`, in SI units (the constants G and the solar mass and AU are listed in the module).
- **MOND**, **a₀**, and the **gravity boost factor γ**. The experiment does not derive MOND. It uses the published statement that MOND predicts a boost `γ ≈ 1.4` for wide binaries in the Galaxy's field.
- **The external field effect (EFE)**: the Galaxy's own pull on the pair is comparable to a₀, and in MOND it reduces the boost that the pair would otherwise show (so the boost saturates at about 1.4 and not higher). Named and described in one paragraph; not modelled.
- **A hidden companion** and a **contaminated sample**.
- **Gaia** (what it measured).

### Simplifying assumptions (all stated to the learner in plain language)
- **Circular orbits, random orientation.** Real orbits are ellipses. The experiment compares speeds through the ratio to Newton's speed, which does not depend on this.
- **The boost is the single published number `γ ≈ 1.4`**, taken from the papers (Chae 2023: g_obs ÷ g_pred = 1.43 ± 0.06; Banik 2024: "about 20 percent" velocity boost) and not derived. The experiment does not draw how the boost switches on with separation (the papers disagree about that and about where it starts, and no source was read that gives a plain, agreed shape).
- **The contamination model is a toy**: a chosen fraction `f` of pairs move `k` times faster (hidden companions), the rest move as Newton says. It is not any team's model.
- **Published numbers are quoted as the papers state them**, and are not directly comparable (different samples, different parameters).

### Not introduced
How MOND is derived, interpolating functions, AQUAL and other MOND theories, the Bayesian and likelihood methods the teams use, orbital eccentricity distributions, how Gaia measures a star's distance and motion, galaxy rotation curves under MOND (named in one sentence), the other tests of MOND (galaxy clusters, the cosmic microwave background), and any claim about whether gravity changes.

---

## Physics Model

### The numbers (published values; checked on 2026-10-20 through arXiv abstract pages, see the source table)

| Item | Value |
|---|---|
| Banik et al. 2024 (arXiv:2311.03436, MNRAS 527, 4573): 8,611 wide binaries within 250 pc, separations 2 to 30 kAU | the interpolating parameter α_grav = −0.021 (+0.065, −0.045), where 0 is Newton and 1 is MOND; "Newtonian dynamics is preferred at 19σ confidence" |
| Chae 2023 (arXiv:2305.04613, ApJ 952, 128): 26,615 wide binaries within 200 pc | at g_N ≈ 10⁻¹⁰·¹⁵ m/s², g_obs ÷ g_pred = 1.43 ± 0.06; "10σ significance" for the deviation |
| Chae 2024 (arXiv:2309.10404, ApJ): 2,463 "statistically pure" binaries | g_obs ÷ g_pred = 1.49 (+0.21, −0.19) at accelerations at or below 10⁻¹⁰ m/s²; velocity boost 1.20 ± 0.06 (stat) ± 0.05 (sys) for separations at or above 5 kAU; "about 5.0σ" |
| Chae 2025 (arXiv:2502.09373): 312 binaries with three-dimensional velocities | a gravitational anomaly at accelerations below 10⁻⁹ m/s² that "aligns with MOND" |
| Saglia et al. 2025 (arXiv:2506.05049): 32 usable binaries with HARPS radial velocities | "consistent with Newtonian dynamics"; sample "limited" |
| Pittordis et al. 2025 (arXiv:2504.07569) | "Newtonian models provide a significantly better fit than MOND", with the caveat that the triple population needs better understanding |
| Chae et al. 2026 (arXiv:2601.21728, 36 binaries with accurate 3D velocities; v1 29 January 2026, v3 19 September 2026) | gravity boost γ = 1.60 (+0.24, −0.14) in v3 (+0.17, −0.14 as quoted by Saad and Ting from an earlier version); "dominated by two systems" with relative speeds above their Newtonian escape speeds |
| Saad and Ting 2026 (arXiv:2603.11015, 11 March 2026): the same 36 binaries | forward-modelled 3D orbits: γ = 1.00 (+0.24, −0.19); a geometric de-projection of the separation gives γ = 1.56 (+0.21, −0.18) |
| Cookson et al. 2026 (arXiv:2602.24035, 27 February 2026): 130 pc sample, 1 to 30 kAU | "does not exhibit the 20% enhancement expected from MOND"; "Newtonian gravity is up to 1500x more likely than MOND for our cleanest sample" |
| Computed: 1.5 Suns total, separation 10,000 AU | Newton speed **365 m/s** (0.365 km/s); pull **8.9 × 10⁻¹¹ m/s²** (0.74 a₀) |
| Computed: speed boost | `√1.4 = 1.183` (18.3 percent); `√1.43 = 1.196`; `√1.6 = 1.265`; `1.2² = 1.44` |
| Computed: contamination | `(1 − f) + f × k`: f = 0.2 and k = 2 give 1.20; f = 0.1 and k = 2 give 1.10 |

### The rules

- **Orbital speed:** `v = √(G × M ÷ s)` (circular orbit; M in kilograms, s in metres).
- **Pull:** `g = G × M ÷ s²`; compared with a₀ as `g ÷ a₀` (a₀ = 1.2 × 10⁻¹⁰ m/s², a value from the MOND literature, its source status below).
- **Boost to speed:** `v_modified = v_Newton × √γ`; the percent increase is `(√γ − 1) × 100`.
- **Hidden companions (toy):** the average speed relative to Newton's is `(1 − f) + f × k`; the fake boost in percent is `f × (k − 1) × 100`; the fraction needed to fake a boost `b` is `b ÷ (k − 1)`.
- **Dark matter inside the pair (a rough size, for one sentence only):** the mass of dark matter in a sphere of radius `s` is the local density times the volume; at a density of 0.01 solar masses per cubic parsec (a widely quoted order of magnitude, not read at a source) and a radius of 30,000 AU (0.145 pc), that is about 1.3 × 10⁻⁴ solar masses (computed), against 1.5 solar masses of stars. Whether to include this is decision 6.

### New: a small independent physics module

```typescript
// src/physics/wideBinaries.ts (proposed)
export const G, SOLAR_MASS_KG, AU_M, A0 = 1.2e-10                          // with sources
export const GAMMA_MOND_WIDE_BINARY = 1.4                                  // the published boost, not derived
export const PUBLISHED_RESULTS: { name, year, binaries, quantity, value, low, high, source }[]  // the table above
export function orbitalSpeed(totalMassSuns: number, separationAu: number): number     // m/s, sqrt(GM/s)
export function pullOnPair(totalMassSuns: number, separationAu: number): number        // m/s^2, GM/s^2
export function pullInA0(totalMassSuns: number, separationAu: number): number          // g / a0
export function speedBoost(gamma: number): number                                       // sqrt(gamma)
export function speedBoostPercent(gamma: number): number                                // (sqrt(gamma) - 1) * 100
export function boostRange(percent: number): BoostRange                                 // the answer to Prediction 1
export function contaminatedRatio(fraction: number, factor: number): number             // (1 - f) + f k
export function fakeBoostPercent(fraction: number, factor: number): number              // f (k - 1) * 100
export function fractionToFake(boostPercent: number, factor: number): number            // b / (k - 1) / 100
export function contaminationRange(fraction: number, factor: number): ContaminationRange // the answer to Prediction 2
export function darkMatterInsideSolarMasses(separationAu: number): number               // only if decision 6 is yes
export function runWideBinaries(totalMassSuns, separationAu, gamma, fraction, factor): WideBinariesResult
```

Out-of-range inputs throw `RangeError` (a non-positive mass or separation, `γ < 1`, a fraction outside 0 to 1, a factor below 1). The module reuses nothing from Experiments 1 to 6 except, in the interface, the sigma wording.

---

## Learner Controls

1. **Run:** gated on both predictions.
2. **After the run only, "Choose a pair":** a total-mass slider (0.5 to 3 solar masses, 1.5 to start) and a separation slider (500 to 30,000 AU, on a logarithmic scale, 10,000 AU to start). Shows the speed, the pull, the pull in units of a₀, and the Newtonian and boosted speeds.
3. **After the run only, "How many pairs are really triples?":** a fraction slider (0 to 50 percent, 20 percent to start) and a factor slider (how many times faster a hidden-companion pair moves: 1 to 3, 2 to start). Shows the fake boost and, beside it, the boost the papers expect (about 18 percent).
4. **A "Start over" button.**

---

## Prediction Activity

Two questions, both answered before Run is enabled. Not scored while the learner is predicting; the tutor marks each as matched or not matched in its explanation (the group's pattern). Each ends "You are not graded, and a guess is fine."

> **Prediction 1: how much faster?** Two stars, 10,000 times the Earth-Sun distance apart, orbit each other so slowly that their gravity is very weak. Suppose a modified law of gravity made the pull between them **1.4 times stronger** than Newton's law says. How much faster would they orbit than Newton's law says? Buttons: **No noticeable difference**, **About 20 percent faster**, **About 40 percent faster**, **About twice as fast**.
>
> **Prediction 2: how much can hidden stars fake?** In a study of wide pairs, suppose **1 pair in every 5** is secretly a triple star, and its hidden third star makes it move **twice as fast** as a true pair. The other 4 in 5 are true pairs that move as Newton's law says. How much faster is the **average** speed than Newton's law says? Buttons: **About 2 percent**, **About 20 percent**, **About 100 percent**.

Right answers: Prediction 1 is **about 20 percent faster** (`√1.4 = 1.18`; `boostRange(speedBoostPercent(1.4))`). The natural wrong answer is **about 40 percent**, because the pull is 40 percent stronger. Prediction 2 is **about 20 percent** (`0.8 × 1 + 0.2 × 2 = 1.2`; `contaminationRange(0.2, 2)`), the same size as the signal that is being looked for. The natural wrong answers: "about 2 percent" (a minority matters little) and "about 100 percent" (the hidden pairs are twice as fast).

The prediction texts do not give the 20 percent, the square-root rule or the sizes of the published signals. Prediction 1's text gives the boost of 1.4, which is stated by the papers.

---

## Experiment Behavior

### Introduction (draft contents, to the standard of `CLAUDE.md` §29; the owner approves the wording line by line)

1. **The question.** "Galaxies spin too fast for the matter we can see. Is the answer hidden matter, or does gravity itself change when it is very weak? Two stars orbiting very far apart are a clean test. So why do the scientists who study them not agree?"
2. **Where we left off.** Cosmology 4 and 7, and Experiment 6 (dark matter particles have not been found).
3. **What a binary star is, and how fast it orbits.** Two stars bound by gravity; the Earth-Sun distance (1 AU); Newton's speed formula with a worked example (a pair with the mass of 1.5 Suns at 1,000 AU and at 10,000 AU); everyday comparison: a ball on a string, or a car driving round a bend. Wider is slower.
4. **Weak gravity.** The pull at 10,000 AU is about 9 × 10⁻¹¹ m/s², a hundred billion times weaker than the pull of the Earth on us (a comparison to be computed and checked). MOND says that below about a₀ = 1.2 × 10⁻¹⁰ m/s² the pull is a little stronger than Newton's.
5. **A modified law as a number.** The boost factor γ; the papers' prediction for wide binaries in the Galaxy, about 1.4; the speed goes as the square root. (This is Prediction 1's topic: the introduction gives γ and the idea of a "stronger pull" and not the answer.)
6. **Why wide binaries are a clean test.** Dark matter adds almost nothing inside a region the size of the pair (if decision 6 is yes), so a boost would point to the law and not to hidden mass. Gaia: what it measured (ESA's page).
7. **Why it is hard.** The effect is small (the introduction does not give the size, because that is what Prediction 1 asks; the tutor and the captions after the run do). A close companion that cannot be seen makes a pair look faster. Pairs are seen at an angle. Everyday comparison: a poll that asks 1,000 people and finds 52 percent: a few wrong answers change it. (This sets up Prediction 2 without giving its answer.)
8. **The state of the question, as of October 2026.** One sentence for each side with its number and date: the 19 sigma for Newton, the 5 sigma and later the γ = 1.60 for a boost, the March 2026 re-analysis that finds no boost, and the February 2026 paper. The status label is **Contested**.
9. **Some new words:** binary star, wide binary, AU, orbital speed, MOND, gravity boost factor, external field effect, hidden companion, contamination, systematic error.
10. **What the learner does.** Two predictions, Run, then choose a pair and change the hidden fraction. Nothing is graded.
11. **Assumptions** (the list above, in plain language).
12. **"Want to know more?" links** (§29 rule 3). **Candidates visible from the start:** ESA's Gaia page (read, 2026-10-20), a plain-language page on binary stars from NASA (the address tried returned HTTP 404; one is still to be found), and a plain-language page on dark matter (CERN, as in Experiment 6). **Kept back until after the run, because they state what the predictions ask (§12):** the nine papers of the table above (each by arXiv number). **Background ideas without a plain official link yet:** MOND, the external field effect, orbital speed.
13. **Date.** "As of October 2026."

The introduction must **not** say that a 1.4 boost gives a 20 percent speed boost, or that a 1-in-5 contamination fakes a 20 percent boost.

### Display

Three pictures, each with every component labelled on the canvas (§14) and a guide beneath it (§14 and §29), plus a small drawing in the introduction of two stars orbiting (an illustration).

- **Picture 1: "How fast do two stars orbit?"** Orbital speed against separation (500 to 30,000 AU, logarithmic) for the learner's total mass, with the Newtonian curve, the learner's chosen separation marked, and, after the run, the curve boosted by `√1.4` (labelled "if gravity were 1.4 times stronger, as the MOND papers predict for wide binaries in the Galaxy") and the pull marked on a second axis in units of a₀. The boosted line is **parallel to the Newton line at a fixed ratio**; the picture does not draw how a boost switches on.
- **Picture 2: "How hidden stars fake a boost."** The average speed relative to Newton's against the fraction of hidden triples (0 to 50 percent) for the learner's factor `k`, with a horizontal line at the boost the papers expect (1.18) and the learner's point; the fraction that matches the expected boost is marked.
- **Picture 3: "What the teams found."** The gravity boost γ with its published range for the papers that give one (Chae 2023, 2024 and 2026; Saad and Ting's two values), a line at γ = 1 (Newton) and one at γ = 1.4 (the MOND prediction), each bar labelled with the paper, its year and the number of binaries. The papers that report other quantities (Banik 2024, Cookson 2026, Saglia 2025, Pittordis 2025) are in the results table, not drawn, because the numbers are not comparable.

The guides must name every picture, define every term, list every drawn element, give a worked moment with real numbers (for example: `√(G × 1.5 solar masses ÷ 10,000 AU) = 365 m/s`; `√1.4 = 1.183`; `0.8 × 1 + 0.2 × 2 = 1.2`) and give a "what to look for, and what it would mean" list, without revealing what the learner predicted before the run.

### Run

Five named stages of 2.6 seconds each: (1) "How fast two stars orbit" (Picture 1's Newtonian curve), (2) "How weak the pull is" (the pull axis against a₀), (3) "A stronger pull" (the boosted line), (4) "Hidden stars can fake a boost" (Picture 2), (5) "What the teams found" (Picture 3). Playback speed does not change any number (§11).

### Results (neutral, then explained by the tutor)

Shown only after the run. Two tables: (1) for the learner's own pair: mass, separation, Newtonian speed, pull, pull in units of a₀, the boosted speed and the percent difference, with the arithmetic step by step; and for the contamination: the fake boost and the fraction needed to fake the expected boost; (2) every published result with its year, the number of binaries, the quantity, the value and the source. A "Words and formulas" panel (collapsed from the start) lists every term; formulas and worked examples appear only after the run (§12). The links kept back until now are listed here.

---

## Expected Observations

- Newton's speed for a pair of 1.5 Suns falls from about 1,150 m/s at 1,000 AU to about 365 m/s at 10,000 AU and about 210 m/s at 30,000 AU; the pull falls from about 74 a₀ to 0.74 a₀ to about 0.08 a₀ (computed).
- A boost of 1.4 in the pull is a boost of 1.18 in the speed.
- A hidden fraction of 20 percent whose speed is doubled fakes a 20 percent boost; to fake the expected 18 percent with a factor of 2 needs about 18 percent of pairs.
- The published results do not agree: γ from 1.00 to 1.60 for the same 36 binaries, and a 19 sigma preference for Newton in another sample.

## Expected Learner Understanding

The learner should leave able to say, in their own words: why wide binaries have weak gravity and slow orbits; why a stronger pull of 1.4 makes the speeds only about 20 percent higher; why a small share of hidden stars can fake a signal of that size; why two teams can use the same kind of data and disagree; and that this experiment did not analyse any data or decide the question.

## New Concepts Introduced

Binary stars and orbital speed, weak gravity and a₀, MOND as a boost factor, the square-root link between pull and speed, hidden companions and contamination, systematic error and the external field effect.

## Relationship to Previous Experiments

Builds on Cosmology 4 and 7 and Experiment 6 (dark matter), Experiments 1 and 2 (sigma, and the idea that results can disagree), and Spacetime Geometry Experiments 5 and 6 only in passing (units).

## Relationship to Later Experiments

Experiment 8 of the group is the next result of the nineteen. The closing recap sorts all nineteen results by status label.

---

## Required Physics Tests

1. `orbitalSpeed(1.5, 10000)` is 364.8 m/s and `orbitalSpeed(1.5, 1000)` is 1153.7 m/s (to four significant figures, worked out by hand with G = 6.674 × 10⁻¹¹, one solar mass 1.989 × 10³⁰ kg and one AU 1.496 × 10¹¹ m); the speed falls as `1 ÷ √separation` (a hundred times the separation gives a tenth of the speed) and rises as `√mass`.
2. `pullOnPair(1.5, 10000)` is 8.90 × 10⁻¹¹ m/s²; it falls as `1 ÷ separation²`; `pullInA0(1.5, 10000)` is 0.74; `pullOnPair` equals `orbitalSpeed² ÷ separation` for every input (a consistency test).
3. `speedBoost(1.4)` is 1.1832; `speedBoostPercent(1.4)` is 18.3; `speedBoost(1)` is 1 (no boost); `speedBoost(γ)²` equals `γ` for every γ ≥ 1; the boost is increasing in γ.
4. `boostRange(18.3)` is `'about20'` (the edges are the middles of the answers on a scale, my choice, in decision 9), and `boostRange(0)` is `'none'`, `boostRange(40)` is `'about40'`, `boostRange(100)` is `'about100'`.
5. `contaminatedRatio(0.2, 2)` is 1.2; `contaminatedRatio(0, k)` and `contaminatedRatio(f, 1)` are 1; the ratio rises with the fraction and with the factor.
6. `fakeBoostPercent(0.2, 2)` is 20; `fakeBoostPercent(0.1, 2)` is 10; `fractionToFake(18.3, 2)` is 0.183; and `fakeBoostPercent(fractionToFake(b, k), k)` is `b` (the inverse is the inverse).
7. `contaminationRange(0.2, 2)` is `'about20'`; `contaminationRange(0.02, 2)` is `'about2'`; `contaminationRange(1, 2)` is `'about100'`.
8. The published table's values equal the module's data (a data test that catches a typing error): the sample sizes (8,611; 26,615; 2,463; 312; 36), the sigma values (19, 5.0, 10), γ = 1.43, 1.49, 1.60 and their ranges, 1.00 and 1.56, and the sources.
9. The ladder is in the order the picture draws it, and every bar has a range with the low below the value and the value below the high.
10. If decision 6 is yes, `darkMatterInsideSolarMasses(30000)` is 1.3 × 10⁻⁴ (to two figures, worked out by hand), and is much less than one.
11. Out-of-range inputs throw `RangeError`.

Each test must fail when the module is deliberately broken (several deliberate breaks, as in Experiments 1 to 6).

---

## AI Tutor Behavior

The same pattern as the earlier experiments (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next (Continue enabled only after a reply). The tutor does not invent physics; every number comes from `wideBinaries.ts` or the cited papers. The predictions are marked as matched or not matched in the explanation only.

1. **Observe.** "Look at Pictures 1 and 3. How much higher is the boosted line than the Newton line, and how do the published results compare with the Newton line (γ = 1) and the MOND prediction (γ = 1.4)?"
2. **Compare.** The two predictions, without marking.
3. **Conceptual question.** "Two teams look at the same kind of Gaia data and get different answers. What could make that happen, and what would you want to check before you believed either?" (The tutor does not answer it for the learner.)
4. **Explanation**, in simple words, with everyday examples, after a paragraph that marks the two predictions: (1) the learner's own pair, with the arithmetic; (2) why speed goes as the square root of the pull (a car on a bend: a stronger grip lets it go faster, but only by the square root; the formula `v² = G M ÷ s`), so that a pull of 1.4 gives 1.18; (3) why wide binaries are a clean test and what dark matter would and would not do inside a pair; (4) why a few hidden stars matter, with the 1-in-5 example; (5) what the teams found, one sentence each, and that the same 36 binaries gave γ = 1.60 and γ = 1.00 depending on how the orbits were modelled; (6) why that does not make either team dishonest (the effect is small and the data are hard); (7) what would settle it (cleaner samples, more three-dimensional velocities, a shared treatment of hidden companions and of the Galaxy's pull); (8) what was shown and what was not. **The tutor does not say that gravity changes, and does not say that it does not.**

### Chapter summary (draft)

"What you learned" and "What's next", shown only after the tutor's explanation. Drafted after the owner approves the experiment, and then approved line by line. "What's next" points to Experiment 8 only once it has an approved specification.

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| Banik et al. 2024: 8,611 wide binaries within 250 pc, 2 to 30 kAU; α_grav = −0.021 (+0.065, −0.045); Newton preferred at 19σ; "MOND must be substantially modified on small scales" | arXiv:2311.03436, MNRAS 527, 4573 (published 2024); abstract via a fetch summary | **Checked (abstract, through a summary) on 2026-10-20** |
| Chae 2023: 26,615 binaries within 200 pc; g_obs ÷ g_pred = 1.43 ± 0.06; "10σ significance" | arXiv:2305.04613 (ApJ 952, 128); abstract via a fetch summary | **Checked (abstract, through a summary) on 2026-10-20** |
| Chae 2024: 2,463 pure binaries; γ_g = 1.49 (+0.21, −0.19); velocity boost 1.20 ± 0.06 ± 0.05 beyond 5 kAU; about 5.0σ | arXiv:2309.10404; abstract via a fetch summary | **Checked (abstract, through a summary) on 2026-10-20** |
| Chae 2025: 312 binaries with 3D velocities | arXiv:2502.09373; abstract via a fetch summary | **Checked (abstract, through a summary) on 2026-10-20** |
| Saglia et al. 2025: 44 pairs, 32 usable; consistent with Newton | arXiv:2506.05049; abstract via a fetch summary | **Checked on 2026-10-20** |
| Pittordis et al. 2025 | arXiv:2504.07569 (v2 31 July 2025); abstract via a fetch summary | **Checked on 2026-10-20** |
| Chae et al. 2026: 36 binaries; γ = 1.60 (+0.24, −0.14); "dominated by two systems" | arXiv:2601.21728 (v1 29 January 2026, v3 19 September 2026); abstract via a fetch summary of v3; the earlier error bar (+0.17) is as quoted by Saad and Ting | **Checked on 2026-10-20**; **whether v3 answers Saad and Ting was not read** |
| Saad and Ting 2026: γ = 1.00 (+0.24, −0.19) and 1.56 (+0.21, −0.18) | arXiv:2603.11015 (11 March 2026); abstract via a fetch summary | **Checked on 2026-10-20** |
| Cookson et al. 2026: no 20 percent enhancement; Newton up to 1500 times more likely | arXiv:2602.24035 (27 February 2026); abstract via a fetch summary | **Checked on 2026-10-20** |
| The MOND acceleration a₀ ≈ 1.2 × 10⁻¹⁰ m/s² | a search summary quoting "(1.2 ± 0.2) × 10⁻⁸ cm/s²" (arXiv:astro-ph/0104435 and others); Famaey and McGaugh's review (arXiv:1112.3960) did not state a value in its abstract | **Partly checked (a search summary)**; the full review was not read |
| A boost of about 1.4 in the pull, about 20 percent in the speed, for wide binaries in the Galaxy's field | Banik 2024 and Cookson 2026 abstracts ("20%"), Chae 2023 ("the boost factor that the AQUAL theory predicts ... under the Galactic external field", 1.43), a search summary of Physics World ("a factor of 1.4") | **Checked (abstracts)**; the derivation was not read |
| Gaia: "more than three trillion observations of two billion stars and other objects"; measured positions and motions in three dimensions | ESA, esa.int/Science_Exploration/Space_Science/Gaia | **Fetched on 2026-10-20 (through a fetch summary)** |
| The local dark-matter density, about 0.01 solar masses per cubic parsec | General knowledge | **Not checked at a source**; used only if decision 6 is yes |
| Constants: G, the solar mass, the AU | CODATA and IAU values | **Not checked in this session** |
| A plain-language page on binary stars | NASA, science.nasa.gov/universe/stars/multiple-star-systems/ (replaces the address that returned HTTP 404, `science.nasa.gov/universe/stars/types-of-stars/`) | **Read on 2026-10-20** ("more than half of all stars in the sky have one or more partners"), through a fetch summary |
| The nine arXiv addresses of the paper links (2305.04613, 2309.10404, 2311.03436, 2502.09373, 2504.07569, 2506.05049, 2601.21728, 2602.24035, 2603.11015) | arxiv.org/abs/<number> | **Each returned HTTP 200 on 2026-10-21**; the abstracts were read through fetch summaries on 2026-10-20 |
| Chae et al. 2026 states no significance in sigma in its abstract (the 2026 result is quoted as γ = 1.60 (+0.24, −0.14)) | arXiv:2601.21728 (v1 29 January 2026, v3 19 September 2026), abstract via a fetch summary | **Checked on 2026-10-21**: no sigma is stated (an earlier "3 sigma" in the introduction had no source and was removed) |
| Chae 2024 (2,463 binaries) was first submitted on 19 September 2023 and accepted by the Astrophysical Journal; the interface calls it "2024" | arXiv:2309.10404, abstract via a fetch summary | **Submission date checked on 2026-10-21**; the publication year was not read (the interface uses 2024 throughout, as the physics module does) |
| That dark energy makes the expansion of the universe accelerate and dark matter holds galaxies together (the introduction's paragraph on the difference) | CERN, home.cern/science/physics/dark-matter | **Read on 2026-10-21** through a fetch summary ("dark energy ... appears to be associated with the vacuum in space"; it causes the expansion to accelerate); the "pulls" and "pushes" wording is Claude's paraphrase |
| A car going round a bend needs four times the grip to go twice as fast; v² = G M ÷ s | General physics | **Not checked at a source** |

### Facts that may change (re-check list, as of October 2026)

- **New analyses or replies**: Chae et al. 2026 was revised on 19 September 2026; replies to Saad and Ting, Cookson and others may exist (the search was not exhaustive).
- **Gaia DR4** (a larger data release) and any new radial-velocity surveys of wide binaries.
- **Any agreed treatment** of hidden companions and the external field effect.

---

## Decisions Needing Human Review

Defaults are what I will use unless you say otherwise.

1. **The two corrections to the proposal.** Default: say "the pull is about 1.4 times stronger and the speed about 20 percent higher" (the papers' numbers), and use "about 5 sigma (2,463 binaries) and γ = 1.60 (+0.24, −0.14) (2026)" for the boost side in place of "10 sigma" (changed on 2026-10-21: the abstract of the 2026 paper states no sigma). Alternative: keep the proposal's "40 percent faster" wording (which the papers read do not support).
2. **The status label.** Default: **Contested**, as the proposal says. Alternative: "Open".
3. **The boost model.** Default: one published number, `γ = 1.4`, with the speed boost `√γ`; the picture draws a boosted line parallel to the Newton line and says it does not show how a boost switches on. Alternative: a full MOND law with an interpolating function (isolated and with the external field), which would need a formula the project has not checked and would show a boost that differs from the papers' 20 percent (an isolated pair at 10,000 AU would show about 33 percent, computed with the "simple" function).
4. **The contamination toy.** Default: a fraction `f` of pairs move `k` times faster, with sliders, labelled a toy, not any team's model. Alternative: leave out the contamination and show only the published results table (simpler, but less teaching of why the teams disagree).
5. **The total mass and range of separations.** Default: 1.5 solar masses (adjustable from 0.5 to 3) and 500 to 30,000 AU. These are the experiment's own choices, and the 1.5 is not a published value (the papers use measured masses for each pair).
6. **Whether to include the "dark matter hardly matters for two stars" estimate.** Default: yes, as one sentence with the 0.01 solar masses per cubic parsec order of magnitude marked as unchecked until a source is read. Alternative: say it in words with no number.
7. **Two predictions.** Default: Prediction 1 (the speed boost for γ = 1.4, with the natural wrong answer 40 percent) and Prediction 2 (a 1-in-5 contamination). Alternative: replace Prediction 2 with a question about the teams' results.
8. **Picture 3.** Default: draw only the results that report γ (Chae 2023, 2024 and 2026 and Saad and Ting's two values), and put the others in the table. Alternative: draw all nine on a normalised "preference for MOND" scale (not possible without inventing a mapping).
9. **The answer edges.** Default: Prediction 1's answers are "none" (below 5 percent), "about 20" (5 to 30 percent), "about 40" (30 to 70 percent) and "about twice" (above 70 percent); Prediction 2's are about 2 (below 8 percent), about 20 (8 to 50 percent), about 100 (above 50 percent). These edges are my choice.
10. **Naming the teams.** Default: name them (Banik and colleagues; Chae and colleagues; Saad and Ting; Cookson and colleagues) with their dates, so the disagreement is traceable. Alternative: say "one team" and "another team".
11. **Links kept back.** Default: the nine papers are shown after the run (§12); the start has ESA's Gaia page, a CERN dark-matter page and a NASA binary-star page (still to be found). Alternative: show all from the start (against §12).
12. **The title.** Default: "Do we need dark matter, or does gravity change? Wide binary stars". Alternative: "Two stars far apart: a clean test of gravity".
13. **How far to explain MOND.** Default: one paragraph, as a statement of the papers' prediction, with no derivation. Alternative: a fuller account (longer, and more claims to check).
14. **The external field effect.** Default: named and explained in one paragraph as the reason the boost is about 1.4 and not larger, not modelled. Alternative: leave it out (simpler, but the 1.4 then looks arbitrary).

---

## Success Criteria

1. The learner can say in plain words why wide binaries are slow and weakly pulled, and what a stronger pull would do to the speed (the square root).
2. The learner sees that a pull 1.4 times stronger gives a speed about 18 percent higher, and that a hidden fraction of 18 to 20 percent can fake that size.
3. The learner sees the published results on one picture, with the Newton and MOND lines, and that the same 36 binaries gave two answers.
4. Every drawn component is labelled on the canvas, and each picture's guide follows `CLAUDE.md` §14 and §29.
5. The status label is shown, dated October 2026.
6. Neither the introduction nor the captions reveal the answers to the predictions before the learner has predicted (§12).
7. The physics tests above pass and fail under deliberate breaks.
8. The experiment says that it does not analyse Gaia data and does not decide the question, and the tutor neither says that gravity changes nor that it does not.
9. The "Words and formulas" panel lists every term and formula (formulas after the run), and every term is defined before it is first used (§15).
10. Every published number matches the checked source, the "facts that may change" list is in the specification, and the links list includes the original papers and official pages (§29 rule 3), each fetched **and read**.
11. Nothing contradicts Cosmology 4 and 7 or Experiments 1, 2 and 6 of this group.

---

## Implementation Notes

The specification is approved (2026-10-20). **Built so far (2026-10-20):**

- **Step 1, physics model and tests:** `src/physics/wideBinaries.ts` and `wideBinaries.test.ts` (25 tests covering the 11 required tests). The expected values are worked out by hand (G = 6.674e-11, one solar mass 1.989e30 kg, one AU 1.496e11 m; for example 1.5 Suns at 10,000 AU: GM = 1.9911e20, GM/s = 1.3310e5, speed 364.8 m/s, pull 8.897e-11 m/s²), not by calling the module. **Checked by fifteen deliberate breaks of the module** (the speed without its square root, with the separation in AU and not metres; the pull falling as 1/s; the speed boost equal to the pull boost; each of the two answer edges moved; the contaminated average wrong, without its minus 1, and the fraction needed divided by the factor and not by the factor minus one; the dark-matter radius squared and not cubed; a published value mistyped, a gamma result's year changed so the ladder order breaks, a₀ and G changed, and the check that gamma is at least 1 removed), each of which made at least one test fail (1 to 5 failures); none survived. **Differences from this specification, for the owner's approval:** (1) `PUBLISHED_RESULTS` has, for each paper, the fields `kind` ('gamma' or 'other'), `errorPlus`, `errorMinus`, `sigma` (the significance an abstract states) and `note`; the five gamma results come first, in Picture 3's order (Chae 2023, Chae 2024, Chae and colleagues 2026, and Saad and Ting's two values), and the other six (Banik 2024, Chae 2025, Pittordis 2025, Saglia 2025, Cookson 2026) are table rows; the sample size is `null` for Pittordis and Cookson, whose abstracts read give none; (2) `fractionToFake` throws `RangeError` when the factor is 1 or below (no fraction could fake a boost) and can return a value above 1 (which means that none could); `runWideBinaries` gives `null` for the fraction needed when the factor is 1; (3) the edges of the answers are 5, 30 and 70 percent for Prediction 1 and 8 and 50 percent for Prediction 2 (decision 9's defaults); (4) the module also exports `PARSEC_IN_AU` (206,264.8) and `LOCAL_DARK_MATTER_SOLAR_MASSES_PER_PC3` (0.01); (5) a test checks that the module imports nothing (the specification says it reuses nothing from Experiments 1 to 6). **Not checked:** the module's physics beyond its tests (the local dark-matter density, a₀ and the constants have no source read, and the specification says so); the source figures themselves, which are from fetch summaries of abstracts; nothing in the interface (not built).
- **Step 2, basic interface (2026-10-20):** `src/components/WideBinariesExperiment.tsx` (the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of two stars orbiting with a "How to read this drawing" guide, the collapsed "Words and formulas" panel with 16 entries, and the skeleton of Picture 1 with its guide) and, in `src/App.tsx`, the new chapter (sidebar entry "Do we need dark matter, or does gravity change?", last in Frontier and Beyond) with a **placeholder** chapter summary (never shown, because the summary appears only after the tutor's explanation). Checked in Chrome at the local address: the page loads, the heading and three links render (each in a new tab), both drawings render, no NaN, undefined or Infinity in the text, and none of the answers to the predictions ("18.3", "about 20 percent", "1.18") appears. Three layout faults were found and fixed in the browser: the orbit drawing's separation label overlapped its scale note, the label "centre they orbit" touched star A, and Picture 1's curve ran off the top of its axis (the axis now goes to 1,800 m/s). The full suite passed (1,081 tests) and `tsc --noEmit -p tsconfig.app.json` printed no errors. All wording is draft for the owner's approval. **Differences from this specification, for the owner's approval:** (1) the three visible links are NASA's "Multiple star systems" page (read on 2026-10-20: "more than half of all stars in the sky have one or more partners"; the earlier-tried "types of stars" address returned HTTP 404), ESA's Gaia page (read) and CERN's dark-matter page (read for Experiment 6); (2) the introduction gives the pull's numbers from the physics module (365 m/s at 10,000 AU, a pull of about 8.9 × 10⁻¹¹ m/s², which is about 110 billion times weaker than the Earth's pull of 9.8 m/s², and 0.74 a₀) and the dark matter inside 30,000 AU (about 1.3 × 10⁻⁴ of a Sun); (3) it states γ = 1.4 as the papers' prediction without saying what it does to the speed (Prediction 1's topic); (4) "What we assume" is one paragraph, not a list; (5) the drawing's star A is drawn larger and called "the heavier one here", an illustration only; (6) the panel has 16 entries (the formulas and worked examples come after the run). **Unchecked claims in the text:** that a satellite high above the Earth moves more slowly than a low one (standard); that the Earth's pull at its surface is 9.8 m/s² (standard); that one metre per second is a walking pace (standard); the dark-matter density near the Sun (about 0.01 of a Sun per cubic parsec, no source read, as in the source table); and "the heavier one here" for the drawing. Not checked: narrow widths, other browsers, keyboard use, a screen reader, a real learner, and the predictions, Run, Pictures 2 and 3, the results, the controls, the tutor and the summary (not built).
- **Step 3, the predictions (2026-10-20):** the two questions with the specification's wording, their answer buttons (Prediction 1: no noticeable difference, about 20 percent faster, about 40 percent faster, about twice as fast; Prediction 2: about 2, 20 and 100 percent), Run disabled until both are answered, and Start over (shown after the run). Run only locks the predictions in for now: the five-stage run, Pictures 2 and 3, the results, the controls, the tutor and the summary are not built. Checked in Chrome: Run is disabled with none or one answer and enabled with two, the choices lock after Run, Start over clears both and disables Run again, and no NaN or undefined. The full suite passed (1,081 tests) and `tsc --noEmit -p tsconfig.app.json` printed no errors. **Difference from this specification, for the owner's approval:** none beyond wording; the "1.4 times stronger" in Prediction 1 is read from the physics module's constant (`GAMMA_MOND_WIDE_BINARY`). Not checked: narrow widths, other browsers, keyboard use.

- **Step 4, the five-stage run and Pictures 2 and 3 (2026-10-21):** a five-stage run (2.6 s each; the timer only paces the display, §11) with Picture 1 filling over stages 1 to 3 (Newton's curve and a marked pair; a row of the pull in units of a₀, amber below a₀; the stronger-pull line), Picture 2 in stage 4 and Picture 3 in stage 5, each with a guide with a worked moment and "what to look for" items that each say what to look at, what it means and why it matters (the owner's rule of 2026-10-21, now in `CLAUDE.md` §14). **Differences from this specification, for the owner's approval:** (1) Picture 1's vertical axis goes to 2,000 m/s (it grows to 3,000 with the mass); (2) the pair's speeds are written in a line under Picture 1 and not labelled on the plot; (3) Picture 3 draws the five γ results with a bracket round the three that use the same 36 binaries; (4) the colours: rose for the stronger pull, purple for hidden triples, teal for published results, amber for a pull below a₀.
- **Step 5, the results (2026-10-21):** Table 1a (the pair, step by step) and Table 1b (the hidden triples), Table 2 (every published result, with the module's shorthand rewritten in plain words in `TABLE_TEXT`), five formula entries with worked examples in the panel after the run, and the nine paper links (kept back until after the run, §12), each with a plain description. **Differences:** Table 1 is split in two; Table 2's wording and the nine link descriptions are new draft wording.
- **Step 6, the controls (2026-10-21):** "Choose a pair" (mass 0.5 to 3 Suns in steps of 0.1; separation 500 to 30,000 AU on a logarithmic slider, rounded to the nearest 50 AU, the last step counting as 30,000) and "How many pairs are really triples?" (share 0 to 50 percent; factor 1 to 3 in steps of 0.1). They drive Pictures 1 and 2, Tables 1a and 1b, the panel's examples and the "what to look for" items. Picture 2's vertical axis rescales above a factor of 2, and the picture says so when no crossing is possible (factor 1, or more than 50 percent needed). The controls start at Picture 1's pair and Prediction 2's example.
- **Step 7, the tutor (2026-10-21):** `src/components/WideBinariesTutor.tsx`: observe, compare, the conceptual question, then the explanation with eight parts as in the specification. The predictions are marked only in the explanation. **Differences:** the explanation adds a delivery-trips comparison, a dark-matter-inside-the-pair paragraph and a car-on-a-bend comparison (see the source table).
- **Step 8, the chapter summary (2026-10-21):** the draft "What you learned" in `src/App.tsx`, shown after the tutor's explanation; "What's next" is the group's generic line because Experiment 8 has no approved specification.
- **Added at the owner's request (2026-10-21):** a paragraph in the introduction on the difference between dark matter and dark energy (wording approved by the owner), and the CERN link's description now mentions dark energy.
- **Step 9, the complete-flow test (2026-10-21, Chrome):** all 12 prediction pairs (4 × 3), start to finish, with the stage timer shortened to 40 ms inside the page (pacing only): nothing from the results, controls, tutor or summary shows before Run; the explanation does not show before the three replies and the summary not before the explanation (checked on the first run, before saved progress makes the summary persistent); both predictions are marked correctly; no NaN or undefined; Start over clears the results. And 75 control settings (3 masses × 5 separations × 5 share-and-factor pairs) checked against a separate calculation written in the test: speed, pull in a₀, boosted speed, percent difference, average ratio, fake boost, the share needed, and the lines under Pictures 1 and 2, with no differences. **One fault found and fixed:** the separation slider's last step gave 29,950 AU; it now counts as 30,000.
- **Step 10, the final review (2026-10-21):** four findings in learner-facing text, all fixed with the owner's approval on 2026-10-21: (1) the introduction said that the effect is "about a fifth in the speed", which gives Prediction 1's answer away (the specification's introduction item 7 had said so and contradicted its own rule; item 7 is corrected); (2) the introduction's "3 sigma" for the 2026 paper had no source (the abstract states none) and now reads γ = 1.60 (+0.24, −0.14); (3) the 2,463-binary paper was "2023" in the introduction and "2024" elsewhere, now "2024" throughout (first posted September 2023); (4) "1154" now reads "1,154". **Wording approved:** the owner approved all learner-facing wording (§28.1) on 2026-10-21 ("wording approved for experiment 7"), read as covering the introduction, captions, predictions, results, panel, links, tutor and chapter summary. **Open:** the owner has not yet approved the differences listed above; MOND, the external field effect and orbital speed have no plain official link; the dark-matter density, a₀, the constants and the car comparison have no source read; the tutor's "radial velocities for the stars where Gaia has none" and "a shared way of treating hidden companions" are from this specification and not from a paper; Experiment 6's "What's next" does not point to this experiment; the experiment has not been checked at narrow widths, in other browsers, with a keyboard, with a screen reader or with a real learner; the project has no ESLint configuration, so no lint was run.
