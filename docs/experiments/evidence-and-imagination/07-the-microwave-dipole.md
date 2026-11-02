# Experiment 7 (Evidence and Imagination): Is the Microwave Sky Equally Warm in Every Direction?

**Status: specification APPROVED by the owner on 2026-11-02 (reply "approve", taken as all fifteen decisions on their defaults, including the neutral title "Is the microwave sky equally warm in every direction?" and "As of November 2026"). Proposed by Claude on 2026-11-02 per `CLAUDE.md` §23 Stages 1 to 3. Nothing is built.** Experiment 7 of the group (`00-group-proposal.md`, approved as a direction on 2026-10-29; working title "Are we moving through the universe?"). It is the last experiment of the group. Sources were searched and fetched on 2026-11-02; **no paper was read in full** (see "Sources"). Every number marked "indicative" is from Claude's calculation and must be tested before any wording is approved (§29).

> **Four things for the owner's attention (decisions 1, 3, 5 and 7).**
> (a) **The title.** The working title, "Are we moving through the universe?", suggests the answer is yes. Decision 1 offers a neutral default.
> (b) **The "moving through the universe" idea is a frame, not a place.** The microwave glow defines a frame in which it looks the same all round. Speed "through the universe" means speed relative to that frame. The page must say so plainly, because Relativity 2 and 3 taught that no frame is the true one. Decision 7.
> (c) **The quasar half rests on figures I could only partly read.** The 2021 paper's text gives an observed amplitude of 0.01554 and an expected "∼0.007" (rounded, both read through a converted web copy); the value of x (the slope of the source counts), which the formula needs, is **not in that text**. So the page quotes the paper's expected and observed values and does not calculate the expectation (Decision 5).
> (d) **No plain official page for the dipole was found** (NASA, ESA). Every page found either does not mention it or is a data table. Recorded under §29 rule 3(c); the "before the run" links list is empty.

## Overview

The microwave background (Cosmology 3) is the oldest light there is, and it looks almost the same temperature in every direction: **2.72548 K** on average. Look closer and one direction is warmer and the opposite one is cooler, by a little more than one part in a thousand. This pattern, the **dipole** ("two poles", one warm, one cool), is exactly what the Doppler effect (Spacetime Geometry 8) gives for an observer moving through the glow: the light we meet head-on is shifted to a higher frequency, so it looks warmer, and the light we run away from looks cooler.

1. **The glow is the same all round (on average).** One temperature, 2.72548 K (Colloquium paper, read verbatim).
2. **A moving observer sees it lopsided.** A blackbody's temperature scales with the frequency factor of Experiment 8: `T(θ) = T₀ · √(1 − β²) ÷ (1 − β cos θ)` (Colloquium paper, Eq. 13, read verbatim), where θ is the angle from the direction of motion and β = v ÷ c.
3. **The measurement.** Planck's HFI amplitude is 3362.08 ± 0.64 µK toward Galactic l = 264.02°, b = 48.253° (LAMBDA table, read). With T₀ = 2.72548 K that gives β = 1.2336 × 10⁻³ and **v = 369.8 km/s** (calculated here; the published 369.82 ± 0.11 km/s is the Colloquium's quote of Planck).
4. **A second test, still open.** If our motion alone made the CMB dipole, the sky's distant radio sources and quasars should show a dipole in their counts of the same direction and a predictable size (Ellis and Baldwin, 1984). CatWISE2020 quasars show the same direction (27.8° off) but an amplitude "over twice as large as expected" (0.01554 against about 0.007), at 4.9 sigma in 2021. A 2026 reanalysis lowers this to 3.27 to 3.63 sigma. A 2025 review says it "now exceeds 5 sigma". The page shows these as quoted and does not choose.

Status: **Settled** that the microwave dipole matches our motion relative to the microwave background's frame (a very old, very well measured result); **Contested** whether the sky's quasars agree with that motion. "As of November 2026." (The group's other dates say "October 2026"; Decision 12.)

## Learning Objective

By the end the learner can say, in their own words:

1. The microwave sky is almost, but not exactly, the same temperature in every direction.
2. One direction is warmer by about 3.4 mK than the average and the opposite one cooler by the same, a difference of about 6.7 mK between them. This is the dipole.
3. The Doppler effect, which also shifts the colours of stars (Experiment 8), explains it: it is what an observer moving at about 370 km/s through the glow would see.
4. "Moving through the universe" means moving relative to the glow's own frame, which is a convenient frame and not a special place.
5. The dipole is tiny: about 1 part in 800 of the temperature. The page's colour map exaggerates it, and says so.
6. A second, independent test (the count of faraway quasars) points the same way but looks too big, and that is still debated; so the first result is settled and the second is contested.
7. What the page leaves out and which numbers are calculated and which are quoted.

## Physical Situation

An observer (the Solar System) moving at speed v through a sea of microwave light that is, in its own frame, the same in every direction at T₀. The observer measures the temperature in each direction. Distances and speeds are in the glow's frame; angles are measured from the direction of travel (0° ahead, 90° sideways, 180° behind), as in Experiments 7 to 9 of Spacetime Geometry. The sources of the glow are everywhere and very far away; the observer's speed is much smaller than c (β about 1.2 × 10⁻³). The quasar half uses the quoted counts, not a model of their sky.

## Physics Model (`src/physics/microwaveDipole.ts`, to be written)

| Part | What it computes | Source |
|---|---|---|
| **Constants** | T₀ = 2.72548 K; Planck HFI amplitude 3362.08 ± 0.64 µK; direction l = 264.02°, b = 48.253°; published speed 369.82 ± 0.11 km/s; c = 299,792.458 km/s | T₀ and the speed: Colloquium paper, read verbatim; amplitude and direction: NASA LAMBDA table (the page's own figures, read); b = 48.253° on LAMBDA and in Secrest 2021, 48.243° in the Colloquium text (a typo in one: **recorded, 48.253 used**) |
| **β** | β = v ÷ c | arithmetic |
| **Temperature at an angle** | T(θ) = T₀ · D ÷ (1 − β cos θ), D = √(1 − β²); equal to T₀ times Experiment 8's `frequencyFactorFromTravelerAngle` | Colloquium Eq. 13 (verbatim) and Spacetime Geometry 8's tested function (Decision 3) |
| **Ahead, behind, sideways, difference** | T(0), T(180), T(90), T(0) − T(180) | calculated |
| **Dipole amplitude** | first order: A = β T₀ (the published amplitude is the first-order term) | the Colloquium's Eq. 14 (𝒟_CMB ≃ β, read) |
| **Speed from the amplitude** | v = c · A ÷ T₀ | arithmetic; gives 369.82 from 3362.08 µK |
| **Earth's orbit** | 29.78 km/s for comparison, read from Frontier 11's module if it holds it, else not shown (Decision 8) | Frontier 11 `EARTH.orbitalSpeed` |
| **Quasar figures** | observed D = 0.01554 (1,355,352 quasars); expected "∼0.007"; direction (l, b) = (238.2°, 28.8°), 27.8° from the CMB dipole; 4.9 sigma (p = 5 × 10⁻⁷) | Secrest and others 2021, arXiv:2009.14826, **read through a converted web copy (ar5iv), may not be the final version** |
| **Later quasar figures** | 3.63, 3.44 and 3.27 sigma (three assumptions about local clustering); "exceeds 5 sigma" (2025 review) | abstracts, read verbatim (Bashir and others, arXiv:2511.00822 v2, 26 Apr 2026, "accepted for publication in ApJ"; Secrest and others, *Rev. Mod. Phys.* 97, 041001) |
| **Ratio helper** | observed ÷ expected = 2.22 (0.01554 ÷ 0.007) | arithmetic; the paper says "over twice" |
| **Answers** | each prediction's answer and a nearest-button helper (log scale) | arithmetic |

**Indicative numbers (computed 2026-11-02 from the formula; to be tested):**

| Speed | β | Ahead | Behind | Sideways | Ahead − behind |
|---|---|---|---|---|---|
| 29.78 km/s (Earth round the Sun) | 9.93 × 10⁻⁵ | 2.725751 K | 2.725209 K | 2.725480 K | 0.54 mK |
| **369.82 km/s (the measured motion)** | **1.2336 × 10⁻³** | **2.728844 K** | **2.722120 K** | **2.725478 K** | **6.72 mK** |
| 1,000 km/s | 3.34 × 10⁻³ | 2.734586 K | 2.716404 K | 2.725465 K | 18.2 mK |
| 3,000 km/s | 1.00 × 10⁻² | 2.752892 K | 2.698341 K | 2.725344 K | 54.6 mK |
| 30,000 km/s | 0.100 | 3.013342 K | 2.465117 K | 2.711799 K | 548 mK |

Speed from the amplitude: 3362.08 µK → **369.82 km/s** (369.816 by this arithmetic); 3361.90 µK (SRoll2.2, LAMBDA) → 369.80 km/s. The ± 0.64 µK on the amplitude gives about ± 0.07 km/s, and the published ± 0.11 km/s is the quoted figure. **Not yet decided whether the page shows the ± from the amplitude or the published one: it shows the published.**

**Not modelled (and the page says so):** the microwave background's other pattern (the tiny ripples of Cosmology 3 and 4, about 1 part in 100,000); the change of the dipole over the year as the Earth goes round the Sun (not on the page: its size is from a search summary only); the second-order terms of the Doppler formula (the page uses the exact T(θ) for its drawings but the published amplitude is first order, so the two differ by about 2 µK, and the page says "to about 1 part in a thousand"); the number counts of quasars (the page quotes the paper's expected value and does not calculate it, because x is not given in the text read); the **speed of the Milky Way** and **the Local Group** (not sourced); what the motion is caused by (not covered).

## Learner Controls ("Now try it yourself", trial values)

1. **A trial speed** (buttons: 30 km/s, 370 km/s (the measured), 1,000 km/s, 3,000 km/s, 30,000 km/s). Changes Drawing A: the map's warm and cool poles and the ahead, behind and difference temperatures.
2. **A trial direction** (buttons: straight ahead, 45°, sideways, 135°, straight behind). Shows the temperature in that direction at the chosen speed.

These are trial values, not measurements; the real pictures and tables do not change with them. Where the controls change the numbers, "while every setting is on its published value the table says 'the same', so change a setting to see it move" (§14). **The comparison table for the controls is OPTIONAL (§14 rule 3); Claude proposes none**, since the controls only move the marks of Drawing A.

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **The microwave sky has an average temperature of 2.725 K. Compared with the sky straight ahead of the Solar System's motion (the direction it is travelling), how much cooler is the sky straight behind?** Five buttons, on a log scale: about 0.00007 K, about 0.0007 K, about 0.007 K, about 0.07 K, about 0.7 K. Answer: **about 0.007 K** (6.72 mK, 0.00672 K). Drawn as a white mark on a ruler of temperature difference (Picture 2), beside the real difference.
2. **How fast do you think the Solar System is moving relative to the microwave glow?** Five buttons: about 3 km/s, about 30 km/s, about 300 km/s, about 3,000 km/s, about 30,000 km/s. Answer: **about 300 km/s** (369.82 is nearest on a log scale). Drawn as a white mark on a ruler of speed with labelled reference marks (Picture 2).

The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only. **Neither question may say "370", "three tenths of a thousandth" or "Doppler".** Prediction 1's question gives only the average temperature. The learner has no way to calculate its answer before the run, so it is a feel for the size, and the buttons are decades apart so that a guess is meaningful.

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)

Outline: what the microwave background is and why it is the same everywhere to first look (a recap of Cosmology 3 without the answer to Prediction 1, only the average 2.725 K); what temperature means for light (a warm blackbody glows at a higher frequency, with a daily-life example, an oven or the colour of heated metal); the Doppler effect for light, as Experiment 8 introduced it; what a **dipole** is (two poles, one warm and one cool); what "at rest relative to the glow" means (a frame in which the glow looks the same all round; the same idea as a reference frame in Relativity 2); that **nothing about this picks a "true" frame**; what the learner will do; that the predictions never change the real pictures or tables; assumptions. Terms defined before use: *dipole*, *microwave background*, *kelvin* and *millikelvin*, *Doppler shift*, *rest frame of the glow*, *km/s*, *quasar* (Cosmology 5; not defined again unless needed), *significance and sigma* (Frontier 1). **Held back until after the run:** the size of the temperature difference, the speed, that the dipole comes from motion, the quasar tension and every number in Pictures 1 to 3 (§12). The "Want to know more?" list: **before the run, no link** (none found that does not state the answer; §29 rule 3(c)); **after the run:** the papers and the NASA LAMBDA page.

### Display

1. **Picture 1, the sky ahead and behind (calculated here):** two views of the same observer, one from the glow's frame, and one a map of the sky in the observer's frame, with the direction of travel marked, each pole labelled with its temperature, and a colour scale that is **exaggerated** and says so (the real difference is about 1 part in 800). Every shape labelled.
2. **Picture 2, how big is it? (calculated here, measured by Planck):** a ruler of temperature difference (ahead − behind) with the real value, the white guess and the other trial values; a second ruler of speed with the measured speed, Earth's orbit (if Decision 8 is kept), the white guess. Beside them the Planck figures as quoted.
3. **Picture 3, a second test (quoted, measured by others):** the quasar dipole's observed amplitude (0.01554) against the expected value (about 0.007) on one scale, the direction offset (27.8°) and the significance as quoted in 2021, 2025 and 2026, with no choice between them.
4. **Drawing A (follows the controls).**

Each has a "How to read this diagram" caption (§14, §29) with look-at, what-it-means and why-it-matters items and a "Where the real picture comes from" line separating **measured** (the temperature and its dipole by COBE, WMAP and Planck; the quasar counts by the WISE satellite team), **calculated here** (the temperature at each angle, the speed from the amplitude) and **imagined for the question** (the trial speeds and directions).

### Run

Five stages: the whole sky at one temperature (average); a moving observer meets the light (Picture 1, the Doppler picture); the warm and cool poles appear (the exaggerated map); the measurement (Picture 2, the real amplitude and speed); the quasars (Picture 3). Guesses appear once the feature beside them is drawn.

### Results (neutral, then explained by the tutor)

A check-up (§14): the model's amplitude and speed beside the Planck values (the same to the stated give-or-take; no verdict beyond "the same", "more" or "less"); the quoted quasar amplitude beside the expected value (more); then a steps table and a quasar table, each with a "What this table tells us" note. The learner's predictions beside the results, tagged on their rows, with no "right" or "wrong".

### Tutor (Part 4)

Predict, observe, compare, explain (§13): what the learner expected; what the difference and the speed are; why the Doppler effect makes the sky ahead warmer (a daily-life comparison: driving into rain, in which more drops meet the windscreen ahead; stated as an example and flagged as unsourced); a worked count (T = 2.72548 × (1 + 0.0012336) = 2.7288 K ahead); why the speed is relative to the glow and not absolute (a train platform comparison); the second test and why it matters (a second measurement of the same motion should agree); what has been tested (the microwave dipole, many times, by several missions) and what has not (the quasar result: contested, three analyses, three significances). The tutor must not claim more than the sources show and says plainly which numbers are calculated here and which are quoted.

## Expected Observations

Calculated: ahead 2.7288 K, behind 2.7221 K, sideways 2.7255 K (equal to the average to 4 figures), difference 6.72 mK, speed from the amplitude 369.8 km/s. Quoted: amplitude 3362.08 ± 0.64 µK, speed 369.82 ± 0.11 km/s; quasar dipole 0.01554 against "∼0.007", ratio about 2.2, 27.8° off the microwave direction, 4.9 sigma (2021), 3.27 to 3.63 sigma (2026), "exceeds 5 sigma" (2025).

## Expected Learner Understanding

That the microwave sky is lopsided by a tiny amount in exactly the way the Doppler effect gives for a speed of about 370 km/s, that "speed through the universe" is speed relative to the glow, and that a second check, with quasars, does not yet agree and is debated.

## New Concepts Introduced

The dipole (a two-pole pattern), the microwave background as a frame, and the idea that a result can be settled in one measurement and contested in a second that is meant to repeat it.

## Relationship to Previous Experiments

Spacetime Geometry 7 to 9 (aberration, the Doppler effect and the whole sky of a fast traveler, whose function is reused); Relativity 2 and 3 (reference frames); Cosmology 3 (the microwave background itself); Cosmic Horizons 1 and 2 (a tension, and sigma); Evidence and Imagination 3 to 6 (tested rules quoted with their give-or-takes).

## Relationship to Later Experiments

None: this is the last experiment of the group. The group's recap and the whole-project Conclusion page (not experiments) are proposed on their own (`00-group-proposal.md`).

## Required Physics Tests (each must fail when the module is deliberately broken)

1. Constants as stored: T₀ = 2.72548, c = 299,792.458, the Planck amplitude and its ±, the published speed and its ±.
2. T(θ) at θ = 90° is T₀ · D (not T₀); at 0° it is T₀ · D ÷ (1 − β); at 180° it is T₀ · D ÷ (1 + β).
3. The temperature at θ equals T₀ times Experiment 8's `frequencyFactorFromTravelerAngle(θ, β)` at every control setting (to 1 part in 10¹²).
4. Ahead is warmer than the average and behind is cooler, at every speed above 0; at speed 0 every direction equals T₀.
5. Ahead − behind: 6.7242 mK at 369.82 km/s; grows with speed; zero at speed 0.
6. First-order amplitude β T₀ = 3.3621 mK at 369.82 km/s; speed from 3362.08 µK is 369.82 km/s to 0.01 km/s, and from 3361.90 µK 369.80.
7. Sideways: the temperature differs from T₀ by D − 1 only (smaller than 10⁻⁶ of T₀ at 370 km/s).
8. The module agrees with a separate calculation written outside it at every control setting (to 1 part in a million).
9. Stored quasar and sigma figures as quoted (0.01554, 0.007, 1,355,352, 27.8°, 4.9, 3.63, 3.44, 3.27) and the ratio helper gives 2.22.
10. Comparison helpers: "the same" within a stated give-or-take; a tenfold wider tolerance fails a test (as in Experiments 3 to 6).
11. Nearest-answer helpers on a log scale: Prediction 1's answer is 0.007 K; Prediction 2's is 300 km/s; a linear-scale helper would fail a test.
12. The module does not change when predictions change.

## Sources (searched and fetched 2026-11-02)

| Source | What it was used for | Status |
|---|---|---|
| NASA LAMBDA, "CMB Solar Dipole Amplitude and Direction" (`lambda.gsfc.nasa.gov/education/lambda_graphics/cmb_dipole.html`) | the five measurements (COBE 1996, WMAP 2009, Planck 2016, Planck HFI 2020, SRoll2.2 2021), the attribution of the dipole to motion | **fetched and read 2026-11-02 (HTTP 200, read through a tool that paraphrases)**; **no date shown**; it gives **no velocity** and **no plain explanation** (only "the motion of the Solar system with respect to the rest frame of the CMB", "Doppler shifted CMB monopole radiation"); to be listed **after** the run |
| Secrest, von Hausegger, Rameez, Mohayaee and Sarkar, "Colloquium: The Cosmic Dipole Anomaly", arXiv:2505.23526 v2; *Rev. Mod. Phys.* 97 (2025) 041001 | Eq. 13 (T(θ)), Eq. 14, T₀ = 2.72548 ± 0.00057 K, v = 369.82 ± 0.11 km/s, the Ellis–Baldwin formula and the "exceeds 5σ" statement | **abstract and the first 39k of 186k characters read verbatim; the rest a tool summary** (the formula D = [2 + x(1+α)]β and the "∼4.6 × 10⁻³" expectation are from the summary and **not used**); the b = 48.243° in the text is **not used** (Decision above) |
| Secrest and others 2021, "A Test of the Cosmological Principle with Quasars", arXiv:2009.14826; *ApJ Letters* 908, L51 | observed D = 0.01554, expected "∼0.007", direction (238.2°, 28.8°), 27.8° offset, 4.9σ, 1,355,352 quasars, α = 1.26 | **abstract read verbatim; the numbers read through a converted web copy (ar5iv), which may not be the final version**; the arXiv PDF could not be read; **x is not in the text read** |
| Secrest and others 2022, "A Challenge to the Standard Cosmological Model", arXiv:2206.05624; *ApJ Letters* 937, L31 | the 5.1σ joint figure, radio and quasar dipoles consistent | **abstract read verbatim**; the page does **not** use the 5.1σ unless the owner asks |
| Bashir, Chingangbam and Appleby, arXiv:2511.00822 v2 (26 Apr 2026), "Accepted for publication in ApJ" | the reassessment: 3.63, 3.44, 3.27σ; "cannot be explained solely by the clustering dipole or mode coupling" | **abstract read verbatim** |
| Mittal and Lewis, arXiv:2605.27520 (26 May 2026), accepted by JCAP | newer method; no sigma in the abstract | **abstract read verbatim**; **not on the page unless the owner asks** |
| Planck 2018 results III, arXiv:1807.06207; *A&A* | the dipole's calibration; "direction … within one arc minute", "absolute uncertainty smaller than 0.35 µK" | **abstract read verbatim**; the abstract gives **no amplitude or speed**; the amplitude comes from LAMBDA |
| ESA, "Planck and the cosmic microwave background"; NASA WMAP overview; NASA COBE mission page; ESA Planck gallery; LAMBDA education index | a plain page for "before the run" | **all fetched 2026-11-02 (HTTP 200); none mentions the dipole**, the Solar System's speed or the warm and cool sides. The ESA page's "almost uniform" and "2.726 Kelvin … almost everywhere on the sky" would **hint** at Prediction 1 and is not linked before the run |
| A plain official page for **the dipole and our motion** | the "before the run" list (§29 rule 3(b)) | **none found on 2026-11-02**; tried: the pages above and domain-limited searches of nasa.gov, esa.int, lambda.gsfc.nasa.gov and sci.esa.int. Not fetched: NASA's COBE "science" sub-page (`science.nasa.gov/mission/cobe/science/`, the likeliest) and the Wayback copy of the old WMAP site (not an official host). To be recorded under §29 rule 3(c); **repeat the search before the wording is approved** |
| Earth's orbital speed (29.78 km/s) | the comparison mark | read from Frontier 11's module; **no source read for the page** |
| The Doppler analogy of driving into rain; the train platform; the oven or heated metal for temperature and frequency | the tutor and introduction | **no source read** |

## Facts that may change (§29)

| Fact | Why it may change |
|---|---|
| The quasar dipole significance (4.9σ in 2021, 3.27 to 3.63σ in 2026, "exceeds 5σ" in 2025) | new surveys (the 2026 paper says its method "has the potential to yield decisive results") and new analyses |
| The Planck dipole amplitude and speed | reanalysis (SRoll2.2 gives 3361.90 µK against 3362.08) |
| The status label's "Contested" | a larger survey could settle it either way |
| The page's links | a plain official page may appear |

## Open items

a. **No plain official page for the dipole** (§29 rule 3(c)); candidates not fetched are named above.
b. **No paper read in full.** The quasar figures are read through a web copy; the Planck amplitude is from a NASA table; x (the count slope) is unknown.
c. **The Colloquium's text has two different b values**; the page uses 48.253°.
d. **The expectation "∼0.007" is rounded by the paper** and depends on x and α; the page must say it is quoted.
e. **The quasar significance differs between 2021, 2025 and 2026** and between the 2026 paper's own three assumptions; the page shows all, chooses none.
f. **The comparisons** (driving into rain, a train platform, heated metal) **have no source**.
g. **Earth's orbital speed has no source read** for the page.
h. **The Milky Way's speed and the Local Group's motion are not covered** because no source was read; the page must not suggest 370 km/s is the speed of the galaxy or of the Local Group.
i. **Not checked** at narrow widths, in other browsers, by keyboard or with a real learner (to be recorded after the build).

## Decisions for the owner (each with a default)

1. **Title.** Candidates: (a) "Is the microwave sky equally warm in every direction?" (**default, neutral; gives away neither the size nor the motion**); (b) "Are we moving through the universe?" (the working title; suggests yes); (c) "How fast are we moving through the microwave glow?" (gives away that we move); (d) "The sky's warm side and cool side"; (e) "What does the microwave sky say about our motion?"; (f) "A tiny difference with a big meaning". The file name is kept either way.
2. **Status label.** Settled that the microwave dipole matches a motion of about 370 km/s relative to the glow's frame; Contested whether faraway quasars agree. Default: as stated.
3. **Reuse of Experiment 8's tested function** `frequencyFactorFromTravelerAngle` for the temperature at an angle, so that the page shows the same Doppler rule as before. Default: **yes** (the module then imports `dopplerShift.ts`, unlike most of this group's modules, which import nothing). Alternative: write the formula again with its own tests.
4. **Two predictions** (temperature difference on a log scale; speed on a log scale). Default: yes. Alternative: swap Prediction 2 for the quasar comparison (observed ÷ expected: about 0.3×, the same, about 2×, about 10×, about 100×; answer about 2×). It tests the contested part but needs the idea of an expected count before the run.
5. **Quasar half: quoted, not calculated.** Default: **quote** the paper's expected "∼0.007" and observed 0.01554 and show the ratio (2.22, "over twice"), and say plainly the page did not calculate the expectation. Alternative: calculate it from the Ellis–Baldwin formula with x taken from a source that must first be read.
6. **Controls.** A trial speed and a trial direction, with Drawing A, no comparison table. Default: yes.
7. **The idea of a frame.** The introduction and tutor say that the microwave glow gives a convenient frame; the Solar System's speed relative to it is a speed relative to something, not through a fixed space; the physics of Relativity 2 and 3 is unchanged. Default: yes, and the page does **not** say "we are moving through the universe" without that qualification.
8. **Earth's orbit mark** (29.78 km/s from Frontier 11's module) on the speed ruler, as a familiar reference. Default: yes, labelled "calculated here, no source for the page".
9. **Which quasar significances to show:** the 2021 figure (4.9σ), the 2025 review's "exceeds 5σ" and the 2026 reassessment's 3.27 to 3.63σ, each dated and attributed, none chosen; the 2022 joint 5.1σ and the 2026 flux-cut paper left out. Default: as stated.
10. **The colour map is exaggerated**, with a stated factor (the real difference is about 1 part in 800), and says so on the picture and in the caption. Default: yes.
11. **Introduction length and links:** long and detailed, to §29; no link before the run (rule 3(c) recorded); the papers and the LAMBDA page after the run, the LAMBDA page marked "no date shown". Default: yes.
12. **Date wording.** "As of November 2026" (today's date) in place of the group's "October 2026". Default: yes. Alternative: keep "October 2026" for consistency.
13. **Tutor:** the standard four-step sequence. Default: yes.
14. **Terms defined in plain words where they appear; pictures label every shape and say which parts are measured, calculated and imagined** (§14 point 6). Default: yes.
15. **Not included:** the yearly change of the dipole, the microwave background's ripples, the Milky Way's speed and any cause of our motion. Default: left out, and named in the "Not modelled" list.

## Implementation Notes

**Step 1, the physics model and tests (2026-11-02; built, not committed; no learner-facing wording yet):** `src/physics/microwaveDipole.ts` and `src/physics/microwaveDipole.test.ts` (31 tests; 2,087 in the project; `tsc --noEmit -p tsconfig.app.json` clean). All twelve required test groups are covered. The module imports Spacetime Geometry 8's `frequencyFactorFromTravelerAngle` (Decision 3) and Frontier 11's `EARTH` (Decision 8).

**Checked by deliberate breaks (17, each applied to the module and restored):** T₀ changed; c changed to 300,000; the published speed changed; the Planck amplitude changed; the angle reflected (180° − θ); the first-order amplitude without c; the speed-from-amplitude without T₀; the difference taken as ahead minus the average; the 370 button not mapped to 369.82; the quasar expected value changed; the quasar ratio inverted; each prediction's nearest button found on a linear scale (two breaks); Prediction 1's answer taken from a trial speed; a give-or-take ten times too loose; Earth's speed left in m/s; and the sideways temperature forced to T₀. **One break was missed at first** (the last: no test read the sideways figure from `dipole()` itself); a test was added and the break is now caught.

**Found while building, for the owner's attention:**
1. **The specification's illustrative table is reproduced** by the module (ahead 2.728844 K, behind 2.722120 K, difference 6.7242 mK at 369.82 km/s; 0.5415, 18.1825, 54.5501 and 548.2252 mK at the other speeds). Speed from 3362.08 µK is 369.82 km/s to 0.01 km/s, and from 3361.90 µK 369.80.
2. **The exact formula is not symmetric about the average:** at 369.82 km/s the sky ahead is 3.3642 mK warmer than the average and the sky behind is 3.3600 mK cooler. The published amplitude (3.3621 mK) is the first-order figure, between the two, as the specification says; the page must call the 6.72 mK a difference between ahead and behind and not "twice the amplitude" without saying so.
3. **A trial speed of 370 km/s is the measured 369.82:** `speedForChoice` maps the button, so the real settings show the published figure (the "same" row of the check-up needs this).
4. **The quasar significances are stored as each source states them** (4.9 for 2021; 3.63, 3.44 and 3.27 for 2026; "at least 5" for 2025); no choice is made between them.
5. **Not done:** no interface, introduction, predictions, pictures, results or tutor exist (Steps 2 to 9).
