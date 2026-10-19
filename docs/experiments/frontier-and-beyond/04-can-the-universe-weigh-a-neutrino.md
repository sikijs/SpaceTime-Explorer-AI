# Experiment 4 (Frontier and Beyond): Can the Universe Weigh a Neutrino?

**Status: Specification APPROVED by the owner on 2026-10-19 ("approved, all defaults", read as approving all fourteen decisions on their defaults, including the label Contested, the two predictions and the three-effect model; Claude should say so if the owner meant otherwise), proposed by Claude on 2026-10-19 per `CLAUDE.md` §23 Stages 1 to 3, as the fourth experiment of the group approved on 2026-10-16 (`00-group-proposal.md`, "list of 19 approved"). Nothing is built. The approval covers the specification, not the learner-facing wording. All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1), written to the standard of `CLAUDE.md` §29. Every published number was checked on 2026-10-19 against an arXiv abstract, an arXiv HTML page or an official page (see "Real-World Facts Used, and Source Status"); the full papers were not read. Every number marked "computed" was computed by script on 2026-10-19 and must be re-checked by the physics tests.**

**This specification departs from the group proposal in three places, each listed as a decision below (Decisions 1, 2 and 3).**

1. **The anchor has moved.** The proposal (written 2026-10-16 from search summaries) used the March 2025 DESI result, an upper limit of **0.064 eV** and a "2.5 to 5 sigma" tension. On 2026-10-19 a check found that DESI's own July 2026 paper (DESI DR2 Results IV, arXiv:2607.27410, section VI.4.2) gives a **tighter limit of 0.0592 eV (95 percent)** when Lyman-alpha data are added (0.0565 eV without the Lyman-alpha full-shape part), which **equals the oscillation floor of 0.059 eV**, says the inverted ordering is excluded at more than 3 sigma, and says "most of the posterior volume is inconsistent with both mass orderings". The March 2025 paper's own tension figure is **3 sigma**. This specification uses both DESI numbers, so the learner sees the ceiling move.
2. **The proposal's "110" is for one neutrino carrying the whole 0.06 eV.** If the total is split equally among three, each weighs 0.02 eV and the neutrinos turn "heavy" at a redshift of about **37**, not 110 (computed below). The prediction is reworded so that its answer does not depend on the split.
3. **Two predictions, and a model of three simple effects, not of DESI's full analysis.** See Decisions 3 and 5.

**Group:** "Frontier and Beyond" (Part A: the expanding universe and what fills it). **Status label shown to the learner (proposed): Contested (as of October 2026).** The proposal's label stands: the cosmological limit is real data from several teams, but experts disagree about whether it is a measurement problem or new physics.

---

## Overview

Neutrinos are among the most abundant particles in the universe and the lightest particles known to have mass. About a second after the Big Bang they stopped bumping into other particles and have been flying freely ever since, a cold "sea" of them left over from that time, like the cosmic microwave background (Cosmology Experiment 3) but made of neutrinos. A teaspoon-sized volume of space holds hundreds of them, yet they are almost impossible to catch in a laboratory.

There are three ways to learn what they weigh, and this experiment is about how they meet:

- **Oscillation experiments** watch neutrinos change from one type to another. This is only possible if they have mass, and it gives a **floor**: the three masses together cannot be less than about **0.059 eV** (if the heaviest is much heavier than the other two, the "normal ordering") or about **0.10 eV** (if the two heavy ones are close together, the "inverted ordering").
- **Direct experiments** weigh the neutrino by watching a radioactive decay (KATRIN). They give a **ceiling**, today **below 0.45 eV** for one neutrino type, far above the floor.
- **Cosmology** can "weigh" the whole sea at once, because even a tiny mass changes how the universe expanded and how matter clumped. Planck (microwave background) with baryon acoustic oscillations gave a ceiling of **0.12 eV** in 2018. DESI (the survey of Experiment 2), combined with the microwave background, gave **0.0642 eV** in March 2025 and **0.0592 eV** in July 2026.

The last number is almost exactly the floor from the laboratory. If the true total is just above 0.059 eV, cosmology has barely left room for it; if cosmology's analysis is right and complete, the ceiling is *below* the inverted ordering's floor, and the statistics lean toward a total that is **impossibly negative** unless the data or the standard model are changed. That is why the status is **Contested**: some teams say a measurement problem, some say the standard model's dark energy is wrong (which relaxes the limit to 0.163 eV, see Experiment 2), some say neutrinos decay. Nobody yet agrees.

The experiment lets the learner rebuild three simple reasons a tiny mass shows up in the sky (when the neutrinos turn heavy, how much of the matter they make up, and how much they smooth out small clumps), then place the three kinds of measurement on one line. It says honestly what it does not do: **it does not reproduce DESI's number** (that comes from a full computer fit that combines these effects with many others), and **it does not say whether the tension is real.**

The new ideas are (1) **a particle can be "hot" and act like light or "cold" and act like matter, depending on how its energy compares to its mass**, (2) **a measurement can be an upper limit, not a value**, and (3) **two kinds of measurement can squeeze a quantity from both sides until the two nearly touch**. Sigma and tension are reused from Experiment 1.

---

## Learning Objective

After this experiment, the learner should understand:

1. **Neutrinos are very light and very numerous.** The sea left from the Big Bang has a temperature of about 1.95 K, colder than the microwave background's 2.725 K, and hundreds of neutrinos per cubic centimetre.
2. **A mass is measured in electron-volts here, and a neutrino's is under a millionth of an electron's.**
3. **A neutrino moves like light while it is hot and like matter once the universe has cooled enough** (the mean energy falls below its rest energy). For a total of 0.06 eV shared equally, that happens long after the microwave background was released (the microwave background was released at a redshift of about 1,090; the neutrinos turn heavy at about 37).
4. **The neutrinos' share of the universe's matter is small (under 1 percent for these masses) but not nothing**, and it smooths out small clumps by about eight times that share (about 3.5 percent for 0.059 eV). Surveys can look for that.
5. **Oscillation experiments set a floor on the total (about 0.059 eV, or 0.10 eV for the inverted ordering) and cosmology sets a ceiling** (0.12 eV in 2018, 0.0642 in March 2025, 0.0592 in July 2026). A 95 percent upper limit is a statement about what the data allow, not a measurement.
6. **The ceiling has come down to the floor.** Under the normal ordering there is almost no room left in the standard model. Under the inverted ordering there is none.
7. **A tension is not a discovery** (Experiments 1 and 3), and here several explanations are on the table: an analysis or data problem, a different dark energy (Experiment 2), or new neutrino physics.

---

## Physical Situation

### Reused
- **The cosmic microwave background** (Cosmology Experiment 3): its temperature (2.725 K, already in `cosmicMicrowaveBackgroundExperiment.ts`) and the redshift of its release (1,089.8, also there).
- **Redshift and the age of the universe** (Cosmology Experiments 1, 6 and 8): `timeAfterBigBangYears` in `observableUniverseExperiment.ts` converts a redshift to a time.
- **Dark energy, DESI and baryon acoustic oscillations** (Frontier and Beyond Experiment 2), **sigma and tension** (Experiments 1 and 3), **how ripples grow into clumps** (Cosmology Experiment 9), and **energy and mass** (Spacetime Geometry Experiments 5 and 6: a mass of 0.02 eV is a rest energy of 0.02 eV).

### What is new
- **Neutrinos and their three kinds** (named, in plain words, with the idea that they change kind as they fly), and **the relic neutrino sea** (its temperature and its number).
- **The electron-volt as a unit of mass** (via E = mc², so that a mass can be quoted in eV).
- **"Hot" and "cold" for a particle**: a particle whose typical energy is far above its rest energy acts like light; once the universe has cooled so its typical energy is below that, it acts like matter. The "turning heavy" redshift.
- **The neutrinos' share of the matter** (Ων) and **the smoothing of small clumps**.
- **Two masses, one number each**: the oscillation floor from the two measured mass-squared gaps, and the cosmological ceiling.
- **A 95 percent upper limit**, and why the analyses allowed a negative mass in the arithmetic.
- **Five published numbers** (the floor, the lab ceiling, three cosmology ceilings).

### Simplifying assumptions (all stated to the learner in plain language)
- **The total mass is shared equally among the three kinds** ("three degenerate neutrinos"). This is the DESI paper's own assumption for the 0.0642 figure (Elbers et al.: "three degenerate neutrino states"). The real masses are unequal; the floor calculation shows how.
- **The neutrinos' typical energy is taken as 3.15 times k·T** (the average of the Fermi-Dirac spread), and "turning heavy" is when that equals the mass: `1 + z = m ÷ (3.151 k T_ν0)`. A rule of thumb, not a sharp switch (Decision 4).
- **The standard values for the rest of the universe**: the matter fraction 0.315 and h = 0.674 (Planck's), the same as Experiment 3's and Experiment 1's.
- **The smoothing of small clumps is the textbook estimate `8 × share`**, valid for a small share (the module refuses totals above 0.5 eV, where it begins to fail).
- **The ceilings are stated as the papers state them** (95 percent), not recomputed.

### Not introduced
How the limits are computed (Boltzmann codes, Markov chains, Bayesian or frequentist statistics, the Feldman-Cousins method), the full effect of neutrino mass on the expansion history and the CMB lensing (named as one sentence only: this is where most of DESI's number comes from, Decision 5), unequal masses beyond the floor, the mass ordering as a fitted quantity, the cosmological effective number of neutrino species (N_eff), sterile neutrinos, the beta-decay physics of KATRIN beyond one plain paragraph, neutrino decay and the other proposed explanations beyond naming them, and the Majorana-versus-Dirac question.

---

## Physics Model

### The numbers (published values; checked against the abstracts or pages on 2026-10-19)

| Quantity | Value | Source |
|---|---|---|
| Mass-squared gaps (NuFIT 6.0, data to September 2024) | Δm²₂₁ = 74.9 meV² = 7.49 × 10⁻⁵ eV²; Δm²₃₁ = 2513 meV² (normal) or −2484 meV² (inverted) | Esteban et al., arXiv:2410.05380, as reported in a search result; the abstract gives only the precisions (15 percent and 6 percent at 3 sigma) |
| Floor from oscillations, normal ordering | Σm ≥ √Δm²₂₁ + √Δm²₃₁ = 0.0588 eV (computed; DESI's papers say 0.059) | computed from the gaps; DESI DR2 Results IV, section VI.4.2: "∑mν > 0.059 eV" |
| Floor from oscillations, inverted ordering | Σm ≥ √\|Δm²₃₁\| + √(\|Δm²₃₁\| + Δm²₂₁) = 0.1004 eV (computed; DESI's papers say 0.10) | computed; the 2025 DESI neutrino paper |
| Direct limit (KATRIN, 259 days, effective electron antineutrino mass) | m < 0.45 eV (90 percent) | Aker et al., arXiv:2406.13516 (Science 388, 180, 2025), abstract |
| Planck 2018 with baryon acoustic oscillations | Σm < 0.12 eV (95 percent) | Planck Collaboration, arXiv:1807.06209, abstract |
| DESI DR2 BAO + CMB, standard model (March 2025) | Σm < 0.0642 eV (95 percent); marginalised error 0.020 eV; the paper reports a 3 sigma tension with the oscillation floor | Elbers et al., arXiv:2503.14744, abstract |
| The same, with evolving dark energy (w₀wₐCDM) | Σm < 0.163 eV (95 percent) | the same abstract; DESI DR2 Results II (arXiv:2503.14738) says 0.16 |
| DESI DR2 BAO + CMB, with and without Lyman-alpha (July 2026) | Σm < 0.0565 eV without the Lyman-alpha full-shape part; Σm < 0.0592 eV with it (95 percent); inverted ordering excluded at more than 3 sigma; a modest preference for normal ordering (Δχ² = −5.2) that "should not be interpreted as strong evidence", since "most of the posterior volume is inconsistent with both mass orderings" | DESI Collaboration, arXiv:2607.27410, section VI.4.2 (arXiv HTML page) |
| Relaxation by another choice of CMB data (Planck PR4) | Σm < 0.1 eV with DESI 2024, or about 0.12 eV with a supernova set | Allali and Notari, arXiv:2406.14554, abstract |

### The rules

- **Neutrino temperature:** `T_ν = (4/11)^(1/3) × T_γ` = **1.945 K** for T_γ = 2.725 K (computed).
- **Typical energy:** `E = 3.151 × k × T_ν`; `k T_ν0 = 1.676 × 10⁻⁴ eV`, so `E₀ = 5.28 × 10⁻⁴ eV` today.
- **Turning heavy:** `1 + z_heavy = m ÷ E₀` ≈ **1,893 × (m in eV)** (computed). With three equal masses, `m = Σm ÷ 3`.
- **Time of turning heavy:** `timeAfterBigBangYears(1 ÷ (1 + z_heavy), 0.685)` (reuse; the module's dark energy fraction 0.685 is the Planck-like value in `universeAgeExperiment.ts`).
- **Mass density:** `Ω_ν h² = Σm ÷ 93.14 eV`; `Ω_ν = Ω_ν h² ÷ h²`; **share of the matter** `f_ν = Ω_ν ÷ Ω_m` with Ω_m = 0.315 and h = 0.674.
- **Smoothing of small clumps:** `ΔP ÷ P ≈ −8 f_ν`, for a small f_ν.
- **Floors:** `normal = √Δm²₂₁ + √Δm²₃₁`; `inverted = √|Δm²₃₁| + √(|Δm²₃₁| + Δm²₂₁)`.
- **Room under a ceiling:** `ceiling ÷ floor` (and the difference, ceiling − floor, negative when the ceiling is below the floor).

### Numbers (computed 2026-10-19; the tests recompute them)

| Σm (eV) | Each of three | 1 + z (turns heavy) | Age then (million years) | Share of matter | Small clumps smoothed |
|---|---|---|---|---|---|
| 0.0588 (normal floor) | 0.0196 | 37.1 | 76 | 0.44 % | 3.5 % |
| 0.0592 (DESI, July 2026) | 0.0197 | 37.4 | 75 | 0.44 % | 3.6 % |
| 0.0642 (DESI, March 2025) | 0.0214 | 40.5 | 67 | 0.48 % | 3.9 % |
| 0.10 (inverted floor) | 0.0333 | 63.1 | 34 | 0.75 % | 6.0 % |
| 0.12 (Planck 2018 ceiling) | 0.040 | 75.7 | 26 | 0.90 % | 7.2 % |
| 0.30 | 0.100 | 189 | 6.6 | 2.25 % | 18 % |
| 0.50 | 0.167 | 316 | 3.1 | 3.75 % | 30 % |

For the microwave background, `z = 1,089.8` and its age 380,000 years (the existing constant). **A neutrino would have turned heavy before the microwave background was released only if each of the three weighed more than 0.576 eV** (computed: `1,090.8 × E₀`), a total above about 1.7 eV, which is already ruled out. **The ceilings' ratios to the normal floor** (computed): 0.0642 gives 1.09, 0.0592 gives 1.007, 0.0565 gives 0.96 (below the floor), 0.12 gives 2.04, 0.163 gives 2.77. **The ceiling is below the inverted floor** by 0.064 ÷ 0.1004 = 0.64 and 0.0592 ÷ 0.1004 = 0.59.

### New: a small independent physics module

```typescript
// src/physics/neutrinoMass.ts (proposed)
export interface NeutrinoBound { name: string; kind: 'floor' | 'ceiling'; value: number; confidence: string; year: number; source: string }
export const BOUNDS: NeutrinoBound[]   // the table above (floors, KATRIN, Planck, three DESI values), with sources
export const MASS_SQUARED_GAPS         // Δm²₂₁ and Δm²₃₁ (normal, inverted), NuFIT 6.0
export function neutrinoTemperatureKelvin(photonTemperatureKelvin: number): number      // (4/11)^(1/3) T
export function typicalEnergyEv(temperatureKelvin: number): number                      // 3.151 k T
export function heavyRedshift(massEachEv: number): number                               // m / E0 - 1
export function heavyTimeYears(massEachEv: number): number                              // via timeAfterBigBangYears
export function matterShare(totalMassEv: number): number                                // f_nu = Sum m / 93.14 / h^2 / Omega_m
export function clumpSmoothing(totalMassEv: number): number                             // 8 f_nu, RangeError above 0.5 eV
export function oscillationFloor(ordering: 'normal' | 'inverted'): number
export function roomUnder(ceiling: number, ordering: 'normal' | 'inverted'): { ratio: number; difference: number }
export function runNeutrinoMass(totalMassEv: number): NeutrinoMassResult   // everything the results show, for the chosen total
export type HeavyTiming = 'before' | 'after'
export function heavyBeforeRelease(totalMassEv: number): HeavyTiming       // the answer to Prediction 1
export type RoomRange = 'plenty' | 'veryLittle' | 'none'
export function roomRange(ceiling: number, ordering: 'normal' | 'inverted'): RoomRange   // the answer to Prediction 2
```

Out-of-range inputs throw `RangeError` (a negative or zero mass; a total above 0.5 eV for `clumpSmoothing`; an unknown ordering). `roomRange` is `'none'` if the ceiling is below the floor, `'veryLittle'` if the ceiling is at most 20 percent above the floor, and `'plenty'` otherwise (Decision 6). The module invents no new physics: it reuses the project's microwave-background temperature, the recombination redshift and the age function, and adds standard textbook relations whose sources are listed as unchecked below.

---

## Learner Controls

1. **Run:** gated on both predictions.
2. **After the run only, "Try a different total mass":** presets 0.0592 eV (DESI, July 2026; the default), 0.10 eV (the inverted floor), 0.12 eV (the 2018 ceiling), 0.30 eV and 0.50 eV. It changes the table, the timeline's marker, the share bar and the worked examples in the "Words and formulas" panel. It does not clear the predictions. (The predictions themselves use a total of 0.06 eV, so that the answers do not depend on a control.)
3. **A "Start over" button** clears the predictions and the pictures (as in Experiments 1 to 3).

---

## Prediction Activity

Two questions, both answered before Run is enabled. Not scored while the learner is predicting; the tutor marks each as matched or not matched in its explanation (the group's pattern). Each ends "You are not graded, and a guess is fine."

> **Prediction 1: when do the neutrinos turn heavy?** Suppose the three kinds of neutrino weigh 0.06 eV all together, shared equally. When the universe was young and hot, neutrinos moved almost as fast as light, so they acted like light. As the universe cooled they slowed, and today they act like matter. The microwave background was released about 380,000 years after the Big Bang. Did the neutrinos turn from "light-like" to "matter-like" **before** that, or **after** it?
>
> **Prediction 2: how much room is there?** Experiments that watch neutrinos change kind set a **minimum** for the three masses together (about 0.059 eV if the heaviest neutrino is much heavier than the other two). In 2026, DESI combined with the microwave background set a **maximum** (a 95 percent upper limit), assuming the standard model of the universe. How far above the minimum is that maximum? Buttons: **Plenty of room (the maximum is more than twice the minimum)**, **Very little room (the maximum is at most 20 percent above the minimum)**, **No room (the maximum is below the minimum)**.

Right answers: Prediction 1 is **after** (about 75 million years, against 380,000 years), by `heavyBeforeRelease(0.06)`. Prediction 2 is **very little room** (0.0592 ÷ 0.0588 = 1.007, and 1.09 for the 2025 limit), by `roomRange(0.0592, 'normal')`. The natural wrong answers: "before" for Prediction 1 (because neutrinos are "born" in the first second), and "plenty of room" for Prediction 2 (a limit sounds loose). "No room" is a reasonable guess, and the tutor says why it is nearly right (the 2025 paper's frequentist limit of 0.053 eV and its 3 sigma tension).

The prediction texts do not give the DESI numbers or say what the neutrino masses must be.

---

## Experiment Behavior

### Introduction (draft contents, to the standard of `CLAUDE.md` §29; the owner approves the wording line by line)

1. **The question.** "Can the whole universe, by the way it clumps and expands, tell us how much a neutrino weighs, and does that agree with what laboratories find?"
2. **Where we left off.** Experiments 1 to 3 of this group: measurements that disagree (Experiment 1), a dark energy that might change (Experiment 2), a tension that went away in one survey (Experiment 3). This one is about a tension of a different kind, because the two sides of it measure the *same particle* in utterly different ways.
3. **What is a neutrino?** A particle with no electric charge that barely interacts with anything. Everyday comparison: most of what you meet in daily life is stopped by a wall, but a neutrino passes through a light-year of lead; a vast number go through your hand each second (to be checked, see the source table). Three kinds (electron, muon, tau). A mass far smaller than any other particle with mass: **an electron-volt (eV)** is a tiny amount of energy; by E = mc² it is also a mass; an electron weighs 511,000 eV, a neutrino under 0.1 eV, millions of times less (arithmetic).
4. **The cold sea of neutrinos left from the Big Bang.** About one second after the Big Bang the universe was thin enough that neutrinos stopped colliding and flew free; today they number hundreds per cubic centimetre and have a temperature of about 1.95 K, slightly colder than the microwave background because the light was warmed afterwards when electrons and their antimatter partners annihilated (a plain-words account; the 4/11 factor is in the panel only). Everyday comparison: the steam and the water in a closed kettle, then the steam cooling when the lid is lifted. (Wording to be chosen with the owner.)
5. **"Hot" and "cold" particles.** A particle whose typical energy far exceeds its mass energy behaves like light; once it has cooled below that, like matter (a gas of slow, heavy-ish particles). Everyday comparison: a ball thrown hard against a wall versus a ball rolled gently, with the same ball. This is the new idea (Learning Objective 3).
6. **Three ways to weigh a neutrino** (the three bullets of the overview, without any DESI number, so as not to reveal Prediction 2): oscillation experiments (a floor, with the note that a change of kind is only possible if the masses differ), direct experiments (KATRIN, one paragraph on weighing an electron's energy shortfall in a decay), and the sky. The floor value and the two orderings are explained here, with an everyday comparison for "at least": "three people whose weights add up to at least ... because two of them differ by a known amount".
7. **How the sky can weigh them.** Three effects, in the model's order: when they turn heavy, how much matter they make up, how much they smooth out small clumps (Cosmology Experiment 9's ripples, with the sand-in-flour comparison: a little extra fine sand makes the drifts less sharp). One sentence says what is *not* modelled: DESI's limit also depends on how neutrino mass changes the expansion history and the lensing of the microwave background, and comes from a computer fit of everything at once.
8. **Some new words:** electron-volt, neutrino, relic neutrino sea, oscillation, normal and inverted ordering, floor and ceiling, upper limit ("I am 95 percent sure the parcel weighs less than ..."), tension (reused), "effective negative mass" (introduced after the run only, to avoid revealing Prediction 2).
9. **What the learner does.** Two predictions, press Run, then try a different total mass.
10. **Assumptions** (the list above in plain language).
11. **"Want to know more?" links** (`CLAUDE.md` §29 rule 3). **Visible from the start:** Fermilab's "What's a neutrino?", CERN's Standard Model page (neutrinos "have very little mass"), ESA's Planck and the cosmic microwave background page, KATRIN's website (what the experiment does) and the NASA/DESI background pages already used in Experiment 2 (the DESI March 2025 guide is **kept back until the run**, see below). **Shown only after the run, because their summaries state what the predictions ask (§12, as in Experiments 2 and 3):** DESI DR2 Results IV (arXiv:2607.27410), the 2025 DESI neutrino paper (arXiv:2503.14744), DESI DR2 Results II (arXiv:2503.14738), the DESI March 2025 guide, the NuFIT 6.0 paper (arXiv:2410.05380), the KATRIN paper (arXiv:2406.13516), Planck 2018 (arXiv:1807.06209), the Planck PR4 paper (arXiv:2406.14554) and the "negative neutrino mass or negative dark energy?" paper (arXiv:2605.21456). Each link is fetched and recorded in the source table before the wording is approved.
12. **Date.** "As of October 2026."

The introduction must **not** say what DESI's limit is, how it compares with the floor, that the two nearly meet, or that the statistics prefer a negative mass. It may say that oscillation experiments set a floor and that the sky sets a ceiling.

### Display

Three pictures, each with every component labelled on the canvas (§14) and a guide beneath it (§14 and §29), plus a small drawing in the introduction of the relic neutrino sea (an illustration, not a model).

- **Picture 1: "When do the neutrinos turn heavy?"** A timeline (a log scale of redshift from 1,100 down to 0, with the age of the universe beneath) with a marker for the microwave background's release (z = 1,089.8, 380,000 years), a marker for **where a neutrino of the chosen mass turns heavy** (with the learner's own total, shared equally), and a shaded band before it labelled "the neutrinos act like light", a band after labelled "the neutrinos act like matter". A faint marker shows the turning point of a single neutrino carrying the whole total (z about 113 for 0.06 eV), to show that the answer does not depend on the split. Appears at stage 2.
- **Picture 2: "How much of the matter, and how much smoothing?"** A stacked bar of the matter budget (the neutrinos' share against the whole), drawn magnified with a clearly labelled scale break so a 0.44 percent share is visible, and next to it a small curve of how much the smallest clumps are smoothed against the neutrinos' total (the line `8 f_ν`, marked at the chosen total, with the 0.06, 0.10, 0.12 and 0.50 eV presets). Appears at stage 3 and 4.
- **Picture 3: "The floor and the ceilings."** A number line of the total mass (0 to 0.2 eV, a break at the right for KATRIN's 1.35 eV equivalent if shown, Decision 7), with the two **floors** (normal 0.0588, inverted 0.1004, sky-blue) and the **ceilings** (Planck 2018, 0.12; DESI March 2025, 0.0642; DESI July 2026, 0.0592; the w₀wₐ case, 0.163, paler), each labelled with its year. The room under each ceiling is shaded (a negative room, shown in a different pattern, where the ceiling is below the floor). Appears at stage 5, with the ceilings arriving in date order.

The guides must name every picture, define every term (including eV, floor, ceiling, upper limit, normal and inverted ordering, redshift), list every drawn element, give a worked moment with real numbers (for example: 0.0592 ÷ 3 = 0.0197 eV each; 0.0197 ÷ 0.000528 = 37.4, so 1 + z = 37.4), and give a "what to look for, and what it would mean" list, without revealing what the learner predicted before the run.

### Run

Five named stages of 2.6 seconds each: (1) "The cold sea of neutrinos", (2) "When they turn heavy", (3) "How much matter they make up", (4) "What they do to small clumps", (5) "The floor and the ceilings". Playback speed does not change any number (§11).

### Results (neutral, then explained by the tutor)

Shown only after the run. Two tables: (1) for the chosen total: each mass, the redshift and age when they turn heavy, the share of the matter, the smoothing, step by step with the formulas' numbers; (2) every bound (floor, laboratory, cosmology) with its year, value and source, and the room under each ceiling. A "Words and formulas" panel (collapsed from the start) lists every term; formulas and worked examples with the learner's numbers appear only after the run (§12). The links kept back until now are listed here.

---

## Expected Observations

- For a total of 0.06 eV the neutrinos turn heavy about 75 million years after the Big Bang, about 200 times later than the microwave background's release.
- They are well under 1 percent of the matter and smooth the small clumps by a few percent, a small effect that a large survey could see.
- The two floors sit at 0.059 and 0.10; the 2018 ceiling is above both; the 2025 ceiling is just above the first floor and below the second; the 2026 ceiling is level with the first floor.

## Expected Learner Understanding

The learner should leave able to say, in their own words: why a particle that weighs almost nothing still matters to the sky; why a limit from the sky and a floor from the laboratory can be compared; that the two have come to within a hair of each other; that this is why the answer is still open; and that the experiment did not compute DESI's limit.

## New Concepts Introduced

Neutrinos and the relic neutrino sea, the electron-volt, hot and cold particles, the share of matter and the smoothing of small clumps, the oscillation floor and the cosmological ceiling, upper limits, and a tension in which two measurements squeeze one quantity.

## Relationship to Previous Experiments

Builds on Cosmology 1 to 3, 6, 8 and 9, Spacetime Geometry 5 and 6 (mass and energy), and this group's Experiments 1 to 3 (sigma, tension; DESI and an evolving dark energy). It is the first experiment of the group that mixes particle physics with cosmology.

## Relationship to Later Experiments

Experiment 5 of the group is about the earliest galaxies; Experiment 6 about dark matter searches (neutrinos mimic dark matter in a detector's "fog", and hot dark matter was once proposed to be neutrinos: stated only if the owner wishes). The closing recap sorts all nineteen results by status label.

---

## Required Physics Tests

1. `neutrinoTemperatureKelvin(2.725)` is 1.945 K to three decimals, and the ratio to the photon temperature is `(4/11)^(1/3)` (0.714).
2. `typicalEnergyEv` at that temperature is 5.28 × 10⁻⁴ eV to three significant figures, written out by hand.
3. `heavyRedshift`: for a mass of 0.0197 eV it is 36.4 (1 + z = 37.4), for 0.0333 eV 62.1, for 1 eV 1,892; it is strictly increasing with mass.
4. A mass of 0.576 eV turns heavy at the microwave background's redshift (1,089.8 ± 1); masses below it turn heavy later (a lower redshift) and above it earlier.
5. `heavyTimeYears` for 0.0197 eV is about 75 million years (to within 2 percent) and is strictly decreasing with mass.
6. `matterShare(0.0592)` is 0.44 percent, `matterShare(0.12)` 0.90 percent, and the share is proportional to the total mass.
7. `clumpSmoothing` equals eight times the share (3.55 percent at 0.0592 eV) and throws `RangeError` above 0.5 eV.
8. `oscillationFloor('normal')` is 0.0588 and `('inverted')` 0.1004 to four decimals, the inverted is larger than the normal, and each is within 0.001 of the value the DESI papers quote (0.059 and 0.10).
9. `roomUnder(0.0592, 'normal')` has ratio 1.007; `roomUnder(0.0642, 'normal')` ratio 1.09; `roomUnder(0.0565, 'normal')` has a negative difference; `roomUnder(0.0642, 'inverted')` has a negative difference.
10. `roomRange`: 0.0592 and 0.0642 against the normal floor are `'veryLittle'`, 0.0565 is `'none'`, 0.12 and 0.163 are `'plenty'`, the edge at 1.2 times the floor as documented; any of the DESI ceilings against the inverted floor is `'none'`.
11. `heavyBeforeRelease(0.06)` is `'after'`, `heavyBeforeRelease(2)` is `'before'`, and the answer does not change if the total is shared among three or carried by one neutrino (for 0.06 eV).
12. The published values in the table equal the module's data (a data test that catches a typing error), including the years and the sources.
13. The floors from the module equal the floors computed from the gaps (a test that the two mass-squared gaps are the only inputs).
14. Ceilings in date order: 0.12 (2018) > 0.0642 (2025) > 0.0592 (2026) > the normal floor 0.0588 (a test that the story the pictures tell is the data's).
15. Out-of-range inputs throw `RangeError`.

Each test must fail when the module is deliberately broken (several deliberate breaks, as in Experiments 1 to 3).

---

## AI Tutor Behavior

The same pattern as the earlier experiments (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next (Continue enabled only after a reply). The tutor does not invent physics; every number comes from `neutrinoMass.ts` or the cited papers. The predictions are marked as matched or not matched in the explanation only.

1. **Observe.** "What do you notice about where the neutrinos turn heavy compared with the release of the microwave background in Picture 1, and about the floors and the ceilings in Picture 3?"
2. **Compare.** The two predictions, without marking.
3. **Conceptual question.** "Two quite different methods, one watching neutrinos change kind and one watching the sky, have squeezed the same number from two sides until they nearly touch. What are the different things that could explain that?" (The tutor does not answer it for the learner.)
4. **Explanation**, in simple words, with everyday examples, after a paragraph that marks the two predictions: (1) the learner's own numbers, with the formulas worked step by step; (2) why a hot particle acts like light and a cool one like matter (the thrown ball and the rolled ball), and why the turning-heavy time is so much later than the microwave background's release; (3) how small the share is and what it does to small clumps (the sand in flour), with the 3.5 percent figure; (4) how the floor is built from two measured gaps (a plain statement, with the numbers 8.65 × 10⁻³ eV and 5.01 × 10⁻² eV for the two heavier masses of the normal case); (5) how the ceiling moved from 0.12 to 0.0642 to 0.0592, what a 95 percent upper limit means, and what it means that analyses allowed an "effective negative mass" in the arithmetic (it is not a negative mass; it shows which way the data lean); (6) why this is **Contested**, with the possible explanations named as possibilities and not as findings: a data or analysis choice (the Planck PR4 relaxation to 0.1 to 0.12 eV), a different dark energy (0.163 eV, Experiment 2), or new neutrino physics (decays, named only); (7) what was shown and what was not, with a sentence that this model does not reproduce DESI's number and that the DESI team's own paper cautions that the normal-ordering preference "should not be interpreted as strong evidence".

### Chapter summary (draft)

"What you learned" and "What's next", shown only after the tutor's explanation. Drafted after the owner approves the experiment, and then approved line by line. "What's next" points to Experiment 5 (the earliest galaxies) only once it has an approved specification.

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| DESI DR2 BAO + CMB: Σmν < 0.0642 eV (95 percent), marginalised error 0.020 eV, "3σ tension" with the oscillation floor, 0.053 eV from a frequentist method, N_eff = 3.23 (+0.35, −0.34), and Σmν < 0.163 eV with evolving dark energy; "three degenerate neutrino states" | Elbers et al., arXiv:2503.14744, abstract (submitted 18 March 2025, v3 7 October 2025) | **Checked (abstract) on 2026-10-19** |
| DESI DR2 Results II: Σmν < 0.064 eV (ΛCDM) and < 0.16 eV (w₀wₐ), both 95 percent | DESI Collaboration, arXiv:2503.14738, abstract | **Checked (abstract) on 2026-10-19** |
| DESI DR2 Results IV (July 2026): Σmν < 0.0565 eV (BAO + CMB), < 0.0592 eV (with the Lyman-alpha full-shape data), a "2σ upper limit nearly identical to the lower limit from neutrino oscillations under the normal mass ordering, Σmν > 0.059 eV", "inverted ordering is excluded at more than 3σ", "modest Δχ²MAP = −5.2 in favor of the normal ordering", "most of the posterior volume is inconsistent with both mass orderings" | DESI Collaboration, arXiv:2607.27410 (submitted 29 July 2026, revised 4 August 2026), section VI.4.2 | **Checked on 2026-10-19 (the arXiv HTML page, characters 100,000 to 200,000 of 269,842)**; not the printed paper; the abstract itself quotes no neutrino number |
| DESI's March 2025 guide: "the combined mass of all three neutrino types is less than 0.0642 electron volts—a value that creates tension with the lower limit of 0.059 eV established by laboratory experiments"; "Statistical methods surprisingly indicated physically impossible negative masses, pushing the tension to a significance of 3σ"; "When allowing for evolving dark energy, the tension disappeared with a revised upper limit of 0.163 eV—potentially signaling new physics" | `www.desi.lbl.gov/2025/03/19/desi-dr2-results-march-19-guide/` | **Fetched on 2026-10-19** (the page loads with the "www."; without it the server returns 404, which is how the links in Experiment 2 are written) |
| KATRIN: m < 0.45 eV (90 percent), effective electron antineutrino mass, 259 days; Science 388, 180 (2025) | Aker et al., arXiv:2406.13516, abstract | **Checked (abstract) on 2026-10-19** |
| Planck 2018: Σm < 0.12 eV (95 percent, with BAO) | Planck Collaboration, arXiv:1807.06209, abstract | **Checked (abstract) on 2026-10-19** |
| NuFIT 6.0: Δm²₂₁ = 74.9 meV², Δm²₃₁ = 2513 meV² (normal) and −2484 meV² (inverted) | Esteban et al., arXiv:2410.05380; the numbers from a search result, the abstract gives only the precisions (15 and 6 percent at 3σ) | **Partly checked**: the numbers are **not** read at a primary source; a re-read of the paper's table is needed before the wording is approved |
| Planck PR4 relaxes DESI 2024's limit to about 0.1 eV (0.12 with a supernova set), keeping both orderings viable | Allali and Notari, arXiv:2406.14554, abstract | **Checked (abstract) on 2026-10-19** |
| "Negative neutrino mass or negative dark energy?": DESI DR2 BAO + CMB + supernovae give an effective Σmν = −0.075 (+0.039, −0.053) eV (68 percent) in ΛCDM, and 0.055 ± 0.050 eV in a "sign-switching" dark energy model | Kıbrıs, Elbers, Akarsu and Di Valentino, arXiv:2605.21456 (20 May 2026), abstract | **Checked (abstract) on 2026-10-19**; not used for a number on the page unless the owner wishes |
| The tension relaxed by neutrino decays (Σmν up to 0.23 eV) | A search summary of arXiv:2601.04312 and a Physics (APS) synopsis | **Not checked**: the APS synopsis returned 403; not used as a number |
| `T_ν = (4/11)^(1/3) T_γ`, 1.95 K today, decoupling about one second after the Big Bang | A search summary of the literature (arXiv:2203.17223, arXiv:1412.5948 mention 1.95 K and one second) | **Partly checked** (the 1.95 K and the one second appear in search summaries); the formula is a standard textbook result, **not read at a primary source** |
| 336 relic neutrinos (all kinds) per cubic centimetre, 112 per kind (computed from 3/11 of 411 photons per cm³) | General cosmology | **Not checked** |
| Typical energy 3.151 k T and `1 + z ≈ 1,890 × (m in eV)` | General cosmology (Lesgourgues and Pastor, Phys. Rep. 2006; the PDF would not convert) | **Not checked** (computed here to 1,893, consistent with a remembered 1,890) |
| `Ω_ν h² = Σm ÷ 93.14 eV` | General cosmology | **Not checked at a primary source** (a search listing for Lesgourgues and Pastor, arXiv:1212.6154, contains the relation, its abstract does not) |
| `ΔP ÷ P ≈ −8 f_ν` at small scales | A search summary of arXiv:1006.0689 and the Lesgourgues and Pastor review: "a constant amplitude ΔP(k)/P(k) ≈ −8f_ν" | **Partly checked** (a search summary, not the paper); simulations quoted there give a 3.5 percent suppression at 0.05 eV |
| "Neutrinos have some mass, but not much. They are the lightest of all the subatomic particles that have mass." | Fermilab, neutrinos.fnal.gov/whats-a-neutrino/ | **Fetched on 2026-10-19** |
| "The electron, the muon and the tau all have an electric charge and a sizeable mass, whereas the neutrinos are electrically neutral and have very little mass." | CERN, home.cern/science/physics/standard-model | **Fetched on 2026-10-19** |
| An electron's mass is 511,000 eV; the ratio to 0.0197 eV | Arithmetic (0.511 MeV) | **Not looked up**, a standard constant |
| "A neutrino could pass through a light-year of lead", "over a trillion from the Sun through your hand each second" | A search summary of a physics-education page | **Not checked**: not used unless confirmed at a primary source |
| Links: arxiv.org/abs/2607.27410, 2503.14744, 2503.14738, 2410.05380, 2406.13516, 1807.06209, 2406.14554, 2605.21456; www.desi.lbl.gov/2025/03/19/desi-dr2-results-march-19-guide/; neutrinos.fnal.gov/whats-a-neutrino/; home.cern/science/physics/standard-model; www.esa.int/.../Planck_and_the_cosmic_microwave_background; www.katrin.kit.edu | The pages themselves | **Fetched on 2026-10-19: all load** (the arXiv pages through the page-reading tool, not a browser) |

### Facts that may change (re-check list, as of October 2026)

- **DESI's next releases** (the third data release, full-shape and bispectrum analyses, lensing): each could move the ceiling. The search results seen on 2026-10-19 named a DR3 release for 2027 only in a news summary, which is **not checked** and not on the page.
- **KATRIN's final result** (the 259-day limit used here is from about a quarter of its planned data) and other direct experiments.
- **Oscillation experiments**: the gaps and the mass ordering (JUNO and the long-baseline experiments), which would move the floors; the page uses NuFIT 6.0.
- **Other analyses** that relax the limit (a different CMB data set, evolving dark energy, neutrino decays), and any resolution of the "negative mass" lean.
- **Whether the DESI July 2026 paper's figures changed in a later version** (it was already revised once, on 4 August 2026).

---

## Decisions Needing Human Review

Defaults are what I will use unless you say otherwise.

1. **The anchor.** Default: use both DESI numbers, March 2025 (0.0642 eV) and July 2026 (0.0592 eV), with the floor and the 2018 Planck ceiling, so that the learner sees the ceiling move. Alternative: use only the newest value (a simpler picture, but it hides how fast it moved).
2. **The status label.** Default: **Contested**, as in the group proposal. Alternative: "Strong evidence (that the neutrino mass is small); Contested (what the tension means)", which is more exact but longer.
3. **A model of three simple effects, not DESI's analysis.** Default: the experiment models (a) when neutrinos turn heavy, (b) their share of the matter and (c) the smoothing of small clumps, and says in words that DESI's limit comes from a fuller fit that also includes the expansion history and the lensing of the microwave background. Alternative: add a fourth effect, how the neutrino mass changes the distance to the microwave background (which is where most of DESI's constraint comes from), which needs an expansion-history integral with a neutrino species that is partly like light and partly like matter, a heavier piece of physics than the project has (Decision 5 of this group's proposal flagged this as the "most complex of Part A").
4. **"Turning heavy" as a rule of thumb.** Default: the redshift at which the typical energy equals the mass (3.151 k T), stated as a rule of thumb, not a sharp switch. Alternative: the redshift at which the neutrino energy density is half way between the light-like and matter-like values (needs a Fermi-Dirac integral).
5. **Two predictions.** Default: Prediction 1 (before or after the microwave background) and Prediction 2 (how much room under the ceiling), both with fixed values (0.06 eV and the 2026 ceiling) so the answers do not depend on any control. Alternative: swap Prediction 1 for "how much of the matter do the neutrinos make up: under 1 percent, about 5 percent or about a third?" (answer: under 1 percent), which is probably the more surprising result for a learner; or use three predictions (a break from the group's pattern).
6. **The room thresholds.** Default: "plenty" is a ceiling more than twice the floor, "very little" is a ceiling within 20 percent above the floor, "no room" is a ceiling below it. The 20 percent is my choice; the answer is "very little" for the 2026 ceiling (0.7 percent above the floor) with any threshold above 0.7 percent, and for the 2025 ceiling (9 percent above) with any threshold above 9 percent, so the owner may set a tighter one. Alternative: express the choices in eV instead of percent.
7. **The laboratory ceiling in Picture 3.** Default: KATRIN's 0.45 eV is named in the text and the table but **not drawn** (it would crush the other values; it limits one neutrino kind, so its equivalent for a total is about three times larger, a conversion this specification has not checked). Alternative: a scale break showing 0.45 as an arrow at the right.
8. **Which cosmology ceilings are drawn.** Default: Planck 2018 (0.12), DESI March 2025 (0.0642), DESI July 2026 (0.0592) and the evolving-dark-energy case (0.163, paler). The Planck PR4 relaxation (0.1 to 0.12) and the 0.0565 limit appear in the table and tutor only. Alternative: draw them too.
9. **The floors' source.** Default: compute the floors from NuFIT 6.0's gaps, once the numbers have been read at the paper (a pending check, see the source table). Alternative: use the DESI papers' rounded 0.059 and 0.10 as the data and show the computation only as an illustration.
10. **The "effective negative mass" idea.** Default: explained in the tutor only (after the run), in plain words, as a way the analyses show which way the data lean. Alternative: leave it out entirely (the 3 sigma is then stated without its cause).
11. **Neutrino decay and other explanations.** Default: named as possibilities in one sentence each, with no number and no source beyond the abstracts above. Alternative: leave out decays, because the only source seen is a search summary.
12. **Links kept back until the run.** Default: the DESI papers, the DESI guide, NuFIT, KATRIN's paper, Planck's paper, PR4 and the negative-mass paper are shown after the run (§12); the start has the Fermilab, CERN, ESA and KATRIN pages. Alternative: show all from the start (against §12).
13. **A mention of Experiment 2 and Experiment 3.** Default: the tutor names Experiment 2 for "a different dark energy" in one sentence and does not mention Experiment 3. "What's next" says nothing about Experiment 5 until it has a specification.
14. **The 336 and 112 per cubic centimetre and the "trillion through your hand" figures.** Default: left out of the learner text until read at a source (the source table marks them unchecked). Alternative: include with a "to be checked" note for the owner.

---

## Success Criteria

1. The learner can say in plain words why a tiny mass matters to the sky, and what the three effects are.
2. The learner sees that a neutrino of 0.02 eV turns heavy about 75 million years after the Big Bang, long after the microwave background was released, and that the neutrinos are under 1 percent of the matter.
3. The learner sees the floors and the ceilings on one line, the ceiling coming down to the floor, and that the answer is contested.
4. Every drawn component is labelled on the canvas, and each picture's guide follows `CLAUDE.md` §14 and §29.
5. The status label reads **Contested** (or what the owner chooses), dated October 2026.
6. Neither the introduction nor the captions reveal the answers to the predictions before the learner has predicted (§12).
7. The physics tests above pass and fail under deliberate breaks.
8. The experiment says it does not reproduce DESI's limit and does not say whether the tension is real.
9. The "Words and formulas" panel lists every term and formula (formulas after the run), and every term is defined before it is first used (§15), including eV, neutrino, ordering, floor, ceiling, upper limit and redshift.
10. Every published number matches the checked source, the "facts that may change" list is in the specification, and the links list includes the original papers and official pages (§29 rule 3).
11. Nothing contradicts Cosmology 3, 6, 8 and 9 or Experiments 1 to 3.

---

## Implementation Notes

Not started. The specification is approved (2026-10-19). **Before the wording is approved, still to do:** read NuFIT 6.0's table of mass-squared gaps at the paper (Decision 9), and read the three textbook relations at a source. The work follows `CLAUDE.md` §6 and §21 one step at a time, starting with the physics model and its tests (the real `tsc` check is `tsc --noEmit -p tsconfig.app.json`, now at 0 errors).

**Built so far (2026-10-19):**

- **Step 1, physics model and tests:** `src/physics/neutrinoMass.ts` and `neutrinoMass.test.ts` (28 tests covering the 15 required tests, checked by nineteen deliberate breaks of the module, each of which made at least one test fail; two breaks first survived, one because no test could tell the equal split of three from one neutrino carrying the whole total, which a new test with a total of 1 eV now catches, and one because the break edited a comment, redone on the code line). The full suite passed (990 tests, 61 files); `tsc --noEmit -p tsconfig.app.json` shows 0 errors. The module reuses the microwave-background temperature and release redshift and time, `timeAfterBigBangYears`, the Planck-like dark energy fraction, Planck's matter fraction (`PLANCK_OWN`) and h (from Experiment 1's Planck value). **Differences from this specification, for the owner's approval:** (1) the age at which the neutrinos turn heavy is `timeAfterBigBangYears` **rescaled by 70 ÷ 67.4**, because that function uses the project's illustrative Hubble constant of 70 and this experiment uses Planck's 67.4 for the matter share (time scales exactly as 1 ÷ H₀; without the rescaling the age for 0.0592 eV is 72.6 million years, not the specification's 75); (2) `BOUNDS` also carries the KATRIN limit, the Planck PR4 limit and the 0.0565 limit with a `drawn` flag (Decision 8's drawn and table-only ceilings), and a `kind` of `'direct'` for KATRIN; (3) the module exports `CEILINGS`, `DESI_JULY_2026`, `MASS_SQUARED_GAPS`, the constants it uses, and `runNeutrinoMass` returns, besides the specification's fields, the rooms under every ceiling for both orderings, the number of times later than the release (about 198 for 0.0592 eV) and the turning-heavy redshift for one neutrino carrying the whole total; (4) `heavyTimeYears` throws `RangeError` for a mass below today's typical energy (5.28 × 10⁻⁴ eV), where the neutrino is still light-like. **Not checked:** the mass-squared gaps are the NuFIT 6.0 numbers from a search result, not read at the paper's table; the three textbook relations (93.14 eV, 8 × share, 3.151 k T) are unchecked at a primary source; nothing in the interface (not built). Two hand-worked values in the tests were first mistyped (5.2823 × 10⁻⁴ and 630.7) and were corrected after re-doing the arithmetic; the module was right in both cases.
