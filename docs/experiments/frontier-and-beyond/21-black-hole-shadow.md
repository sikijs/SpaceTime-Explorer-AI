# Experiment 21 (Frontier and Beyond): Can We Photograph a Black Hole's Shadow? (Event Horizon Telescope)

**Status: Specification APPROVED by the owner on 2026-10-26 ("approved", read as all twelve decisions on their defaults). PROPOSED by Claude per `CLAUDE.md` §23 Stages 1 to 3, as the twenty-first experiment of the group (`00-group-proposal.md`, Part D, entry 21). Step 1 BUILT on 2026-10-26: the physics model and its tests (`src/physics/blackHoleShadow.ts` and `.test.ts`). Step 2 BUILT on 2026-10-26: the interface skeleton and introduction (`src/components/BlackHoleShadowExperiment.tsx`, wired into `src/App.tsx`), introduction wording approved by the owner on 2026-10-26 (after rewrites of the gas, the dark patch and the ring-and-shadow paragraphs; the horizon-size comparison is kept out of the introduction because it is Prediction 2's answer); Step 4 BUILT on 2026-10-26: the two predictions (Part 1) and a "What you will do" paragraph in the introduction, wording approved by the owner on 2026-10-26 ("approved"); Step 5a BUILT on 2026-10-26: the run (five stages) and Picture 1 with its caption and Prediction 1's white guess on a ratio ruler (panel B), wording approved by the owner ("wording approved"), M87*'s ring drawn at 42 ± 3 µas with 43.9 ± 0.6 left for the results table (Claude's choice, delegated by the owner); Step 5b BUILT on 2026-10-26: the run goes to eight stages and Picture 2 (beams of light past one black hole, the capture limit and Prediction 2's white guess circle on a fixed scale that fits a guess of 10 times) with its caption (plan approved by the owner; wording of the caption approved by the owner on 2026-10-27 ("wording approved"); the real circle's "about 2.6" is written in the picture and caption, as drafted); Picture 1's colours were changed at the owner's request to violet (edge), cyan dashed (shadow, calculated) and orange (ring, measured); nothing else. Step 6 BUILT on 2026-10-27: Part 2, "Now try it yourself" (two button controls, mass 4 million, 100 million, 1 billion or 6.5 billion Suns and distance 8.15 kpc, 100 kpc, 1 Mpc or 16.8 Mpc, and Drawing A, a log ruler of angles from 0.01 to 100,000 µas with the trial's shadow in pink, its horizon in violet and the two real shadows as cyan lines), with `trialPicture` and 7 more tests in the module; the button values, the colour pink and the Part 2 wording (both paragraphs, the button labels, the words on Drawing A and its caption; the first paragraph reworded to name "Picture 1 of Part 1") were approved by the owner on 2026-10-27 ("approved", then "wording approved"); the pink colour and the button values were shown with it and not objected to. Step 7 BUILT on 2026-10-27: Part 3, the results (a check-up with the three ring comparisons and the size ratio; Table 2, mass and distance to an angle; Table 3, the calculated shadow's own give-or-take from the published mass and distance ranges; a "Where this stands" box; the learner's predictions beside the results, with tags on the rows). The design and the wording were approved by the owner on 2026-10-27 ("approved, go ahead", "wording approved"). Module: `checkUpRows`, `readingOf`, `ratioRow`, `fromMassRows`, `shadowRange`, `rangeContains`, `rangeRows`, `predictionsBeside`, 8 more tests (48 in all), checked by eight deliberate breaks. Finding for the page: against the later M87* ring (43.9 ± 0.6) the calculated 39.7 is 7.0 give-or-takes below, but inside the calculated shadow's own range (33.8 to 45.9). Table 3's ranges are simple low-to-high ends of the published give-or-takes, not a statistical combination. Step 8 BUILT on 2026-10-27: Part 4, the tutor (`src/components/BlackHoleShadowTutor.tsx`, wired into `BlackHoleShadowExperiment.tsx`): observe, compare with the predictions, one conceptual question (two trees, then the two black holes) and a seven-part explanation, with the predictions marked as matched or not matched in the explanation only; every number comes from the module except the two everyday trees; the tutor wording was approved by the owner on 2026-10-27 ("wording approved"), from the summary shown in conversation and without a line-by-line reading of all seven explanation parts on screen. Step 9 BUILT on 2026-10-27: the chapter summary (`blackHoleShadowSummary()` in `src/App.tsx`, every number read from the module, shown after the tutor's explanation and saved as explained in the existing progress entry); its wording was approved by the owner on 2026-10-27 ("wording approved"); its "What's next" names no experiment, because Experiment 22 has no approved specification, and Experiment 20's "What's next" already points here. The module gives 50.35 µas for Sgr A\*, so "about 50.3" replaces the hand estimate "50.4" throughout. Decisions for the owner are at the end; each has a default. Every number below comes from an abstract or a search summary on 2026-10-26 (see "Sources read"); no EHT paper was read in full.**

**Checks against the group proposal.**

1. **The ring is not exactly the shadow.** The proposal says the ring is "the shadow". The EHT paper calls it a bright ring of glowing gas *around* the shadow, and calibrates how the ring's size relates to the shadow's. The page must say the ring is made by hot gas, and that the dark middle is the shadow's neighbourhood; the model's ideal shadow is a calculation, set beside the measured ring, not equal to it.
2. **The mass ratio.** The proposal says "about 1,500 times the mass". With 6.5 × 10⁹ and 4.0 × 10⁶ Suns the ratio is **1,625**. The distance ratio with 16.8 Mpc and 8.15 kpc is **2,061**. The page will use these figures, and say "about 1,600 times" and "about 2,100 times".
3. **Sizes by hand** (my arithmetic, `G`, `c`, Sun's mass, parsec as in Black Holes 1): M87\* gives **about 39.7 µas** (ideal shadow, 6.5 × 10⁹ Suns, 16.8 Mpc) against the measured ring 42 ± 3 (2019) and 43.9 ± 0.6 (2017 to 2021); Sgr A\* gives **about 50.3 µas** (4.0 × 10⁶, 8.15 kpc) against the measured ring 51.8 ± 2.3. The proposal's "about 54" for Sgr A\* used a different mass or distance; the page must use the figures above, with the masses' own give-or-take (M87\* ± 0.7 × 10⁹, Sgr A\* +1.1, −0.6 × 10⁶).
4. **The sky sizes come out nearly equal** (39.7 against 50.3, M87\* about 0.79 of Sgr A\*; the measured rings 43.9 against 51.8, about 0.85). That is the surprise the prediction is built on: a black hole 1,625 times heavier is not 1,625 times bigger in the sky.
5. **Year-to-year change.** The A&A 2025 variability paper (arXiv:2509.24593, abstract read) says the ring's size stays at 43.9 ± 0.6 µas across 2017, 2018 and 2021 while the brightness around the ring and the polarization change, as expected for a churning flow.

**Status label proposed for the learner (as of October 2026):** *Strong evidence* that the ring sizes of M87\* and Sgr A\* match what general relativity gives for their masses, to the precision of the measurements (about 5 percent for Sgr A\*, with the mass itself uncertain); *Open* how precisely this tests gravity, because the masses and the ring-to-shadow relation carry their own uncertainty.

---

## Overview

Black Holes Experiment 4 showed that light aimed closer than 3√3 ÷ 2 (about 2.6) horizon radii is captured, so a black hole looks like a dark disc about 2.6 times the width of its horizon, ringed by light that just escapes. In 2019 and 2022 the Event Horizon Telescope, a network of radio dishes acting as one Earth-sized telescope, made the first pictures of such rings around two black holes of very different size.

The experiment asks three questions:

1. **How big should the shadow look in the sky?** The learner sees that its angular size is mass ÷ distance (times a number), so a heavier black hole that is farther away can look almost the same size as a lighter nearer one.
2. **Do the measurements match?** The learner compares the calculated ideal shadows with the measured ring sizes.
3. **What does a picture like this show, and what not?** The ring is glowing gas, its brightness pattern changes from year to year, but its size does not.

The model is **one formula, calculated here, set beside measured sizes**. It does not simulate the gas, the telescope, or the image-making.

## Learning Objective

By the end the learner can say, in their own words:

1. Light that passes a black hole closer than about 2.6 horizon radii is captured, so the dark shadow is about 2.6 times as wide as the horizon (Black Holes 4).
2. The shadow's size in the sky (an angle, in millionths of an arcsecond) is 2√27 × GM ÷ c² ÷ distance: it rises with mass and falls with distance.
3. M87\* is about 1,600 times heavier than Sgr A\* but about 2,100 times farther, so its shadow looks a little smaller, not far bigger.
4. The measured ring sizes (about 44 and 52 µas) are close to the calculated shadows (about 40 and 50 µas), and this holds for two black holes whose masses differ by a factor of 1,600.
5. The ring's size stays the same from year to year; the bright patches on it move.

## Physical Situation

An observer on Earth with a radio telescope the size of the Earth (wavelength 1.3 mm, from a search summary, **to be checked**) looks at the centre of M87 (16.8 Mpc away) and at the centre of the Milky Way (8.15 kpc away). Gas near each black hole is hot and glows; light from it is bent by the black hole's gravity; the picture is a bright ring around a dark middle.

## Physics Model (`src/physics/blackHoleShadow.ts`)

| Part | What it computes | Source |
|---|---|---|
| **The real black holes** | M87\*: 6.5 × 10⁹ Suns (± 0.7), 16.8 Mpc (+0.8, −0.7), ring 42 ± 3 µas (2019), 43.9 ± 0.6 (2017 to 2021). Sgr A\*: 4.0 × 10⁶ Suns (+1.1, −0.6), 8.15 ± 0.15 kpc, ring 51.8 ± 2.3 µas. Held as data. | EHT abstracts and search summaries |
| **Shadow size** | `shadowDiameterKm(M)` = 2 × (3√3 ÷ 2) × horizon radius = 6√3 GM ÷ c², reusing Black Holes 4's `CRITICAL_AIM_IN_HORIZON_RADII` and Black Holes 1's horizon radius. | Black Holes 1 and 4 (tested) |
| **Angle in the sky** | `angularSizeMicroarcsec(diameterKm, distanceKm)` = diameter ÷ distance, in radians then µas. | arithmetic |
| **Ratios** | mass ratio, distance ratio, size ratio of the two black holes. | arithmetic |
| **Check against the measurement** | `compareWithMeasured(calculated, measured, ±)` gives the difference in µas, as a percent, and in "give-or-takes", with the range stated and no cut-off invented. | arithmetic |
| **Answers** | the predictions' answers and nearest-answer helpers, and the tutor's marks. | arithmetic |
| **Pictures** | `sizeComparison()`, `skyPicture()` and the trial values for the drawing. | arithmetic |

The module invents no new physics. **Not modelled** (the page must say so): the gas and its glow, the bending of light by the spin (the shadow of a spinning black hole is slightly smaller and not quite round; the ideal formula is for no spin), the calibration the EHT uses between ring and shadow, and the telescope.

## Learner Controls ("Now try it yourself", trial values)

1. **Mass of a trial black hole** (for example 4 million, 100 million, 6.5 billion Suns).
2. **Distance to it** (for example 8 kiloparsecs, 100 parsecs-to-megaparsecs steps up to 16.8 Mpc).
The drawing says its numbers are trial values, not real black holes (§14).

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **M87\* is about 1,600 times heavier than Sgr A\* but about 2,100 times farther. Would its shadow look bigger, smaller or about the same in the sky?** Buttons: much bigger, a little bigger, about the same, a little smaller, much smaller. Answer: a little smaller (calculated 39.7 against 50.3 µas, ratio 0.79). Drawn as a white mark on the size scale of Picture 1 beside the real result.
2. **How much bigger than the black hole's own horizon should the shadow be?** Six buttons balanced about 2.6 (for example 1, 1.5, 2, 3, 5, 10 times). Drawn as a white circle beside the real shadow in Picture 2 (Black Holes 4's critical aim).
The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only (§12, §13).

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)
Outline: what a shadow is (light bent into the hole, a reminder of Black Holes 4); what an angle in the sky is and why millionths of an arcsecond (the size of a doughnut on the Moon is a daily-life comparison, **to be checked**); why an Earth-sized telescope is needed (a dish's sharpness depends on its width ÷ the wavelength, with a simple worked number); the two black holes; the learner's job; that the predictions never change the real pictures; the assumptions. Terms defined before use: *microarcsecond*, *angular size*, *shadow*, *horizon*, *radio telescope*, *give-or-take*. Held back until after the run: any wording that reveals the answer to Prediction 1 (§12). A "Want to know more?" list (§29): the EHT's own pages and the 2019 and 2022 papers, a NASA or ESO plain page (each fetched and recorded below before wording is approved).

### Display (each picture with a "How to read this diagram" caption, a worked moment and a "Where the real picture comes from" line)
1. **Picture 1, two black holes on one scale:** the horizon, the shadow (2.6 times wider) and the measured ring of each, M87\* and Sgr A\*, drawn at the same angular scale so the near equality shows, with the mass and distance beside each. Prediction 1's white mark.
2. **Picture 2, light near one black hole:** paths of light, captured inside 2.6 horizon radii and escaping outside, as in Black Holes 4, with the shadow's width marked against the horizon's. Prediction 2's white circle.
3. **Drawing A (follows the controls):** a trial black hole's shadow in the sky on a scale in µas, with the calculated size.

### Run
Five stages: the two black holes; the horizons; the shadows (calculated); the measured rings; the comparison. The guesses appear once the feature beside them is drawn (§14).

### Results (neutral, then explained by the tutor)
A check-up table (calculated shadow against measured ring for each; the ring across years; the size ratio), then two more tables, each with a "What this table tells us" note (§14). The predictions beside the results. No "right" or "wrong". The optional table of trial values is left out unless the owner asks.

### Tutor (Part 4)
Predict, observe, compare, explain (§13): why a heavy, far black hole and a light, near one look about equally big; why the shadow is 2.6 times the horizon; what the ring is (glowing gas) and what changes year to year; what is and is not tested (the sizes match, to a few percent, for these masses; the masses themselves carry uncertainty).

## Expected Observations
M87\*'s ideal shadow is about 39.7 µas and Sgr A\*'s about 50.3; the measured rings are about 43.9 and 51.8; the ratio is below 1 in both the calculation and the measurement.

## Expected Learner Understanding
That a black hole's apparent size depends on mass **and** distance; that the dark region is about 2.6 times the horizon; and that matching sizes across a factor of 1,600 in mass is a real test of general relativity, but with stated give-or-take.

## New Concepts Introduced
Angular size, microarcsecond, shadow of a black hole, the ring (glowing gas), baseline of a telescope array.

## Relationship to Previous Experiments
Black Holes 1 (horizon radius) and 4 (critical aim and capture), Gravity 8 (light bending), Cosmology 7 (lensing), Experiment 19 (a test of general relativity with its own give-or-take).

## Relationship to Later Experiments
Experiment 22 (pulsar timing arrays) and Experiment 23 (how black holes grow) use black holes at other scales.

## Required Physics Tests (each must fail when the module is deliberately broken)
1. `shadowDiameterKm` equals 6√3 GM ÷ c² and 2.598 times the horizon diameter for any mass.
2. M87\* ideal shadow is 39.7 µas (± 0.1) and Sgr A\* 50.3 µas (± 0.1) for the stated masses and distances.
3. The angle is proportional to mass and inversely proportional to distance (doubling each).
4. The mass ratio is 1,625 and the distance ratio 2,061; the size ratio is about 0.79.
5. `compareWithMeasured` gives the difference in µas, percent and give-or-takes, and is symmetric in sign handling.
6. The measured rings are held as published (42 ± 3, 43.9 ± 0.6, 51.8 ± 2.3).
7. A prediction's answer helper returns "a little smaller" for the real black holes and "about 2.6" for the horizon ratio.
8. Trial values: a shadow calculated for the real mass and distance reproduces the real shadow.
9. The module does not change when predictions change (separation, §9, §14).

## Sources read (2026-10-26)
| Source | What was read | Status |
|---|---|---|
| EHT M87\* paper I (arXiv:1906.11238) | abstract: ring 42 ± 3 µas, mass 6.5 ± 0.7 × 10⁹, consistent with a Kerr shadow | abstract only |
| EHT Sgr A\* paper I (arXiv:2311.09479 as fetched; the paper is published in ApJ Letters, 2022) | abstract: ring about 50 µas, 4 × 10⁶ Suns, 8 kpc | abstract only |
| search summary of EHT papers | 16.8 (+0.8, −0.7) Mpc, 8.15 ± 0.15 kpc, 51.8 ± 2.3 µas, 4.0 (+1.1, −0.6) × 10⁶ | summary only |
| A&A 2025 variability paper (arXiv:2509.24593) | abstract: 43.9 ± 0.6 µas persistent; brightness and polarization change | abstract only |
| A&A 2025 "persistent shadow II" | HTTP 403, not read | not read |

## Open items
a. No paper was read in full; the ring-to-shadow calibration is unread.
b. The wavelength (1.3 mm), Earth-sized baseline and the doughnut-on-the-Moon comparison have no source read.
c. Whether any 2026 EHT result (new images, a movie, Sgr A\* polarization or a higher-frequency run) changes the numbers has not been searched thoroughly; to be checked at the next step if approved.
d. The effect of spin on the shadow's size is mentioned but not modelled.

## Decisions for the owner (each with a default)
1. **Status label:** Strong evidence (sizes match to the stated precision); Open (how tightly this tests gravity). Default: as above.
2. **Model:** the non-spinning formula, with spin named as not modelled. Default: yes.
3. **Mass and distance values:** the EHT's own (listed above). Default: yes.
4. **Prediction 1** with five buttons; **Prediction 2** with six balanced about 2.6. Default: yes.
5. **Number of pictures:** two pictures and one drawing that follows the controls. Default: yes.
6. **Controls:** mass and distance of a trial black hole. Default: yes.
7. **Results:** a check-up and two more tables; no table of trial values. Default: yes.
8. **Year-to-year change** is mentioned in the results and tutor but not modelled. Default: yes.
9. **A 2026 search** for newer EHT results is done before the wording is drafted. Default: yes.
10. **Tutor:** the standard four-step sequence. Default: yes.
11. **Introduction length and links:** long and detailed, to §29. Default: yes.
12. **Title** "Can we photograph a black hole's shadow?" (it does not give away either prediction). Default: keep.
