# Experiment 12 (Frontier and Beyond): A Star Near the End of Its Life: What Is Betelgeuse, and Does It Have a Companion?

**Status: Specification APPROVED by the owner on 2026-10-22 ("approved", read as all twelve decisions on their defaults). Proposed by Claude on 2026-10-22 per `CLAUDE.md` §23 Stages 1 to 3, as the twelfth experiment of the group (`00-group-proposal.md`, Part C, "how stars live and die", added and approved 2026-10-22). BUILT (physics model and 44 tests in `src/physics/betelgeuseCompanion.ts` and `betelgeuseCompanion.test.ts`, checked by deliberate breaks; interface, two predictions, a five-stage run, three pictures, three controls, four tables, a "Words and formulas" panel, tutor and chapter summary in `BetelgeuseCompanionExperiment.tsx` and `BetelgeuseCompanionTutor.tsx`), complete-flow tested in Chrome (all nine prediction pairs and 298 control checks against a separate calculation) and finally reviewed on 2026-10-22. The owner approved the wording of each step as it was built (interface, predictions, run, results, controls, tutor, 2026-10-22) and all the review's fixes ("fix all", 2026-10-22), which included bringing this text in line with the build. This text now describes what is built; the Implementation Notes keep the step-by-step history and the differences from the first draft. The title was changed on 2026-10-22 from "The star that may be about to explode" to the present one, because the sources say a supernova is not likely for about another 100,000 years. Committed (see the Implementation Notes).**

**Sources read on 2026-10-22 (all through fetch summaries or search results; no paper was read in full):**

| Source | What was read | Read how |
|---|---|---|
| Howell and others, *The Probable Direct-imaging Detection of the Stellar Companion to Betelgeuse*, ApJ Letters 988, L47 (2025), arXiv:2507.15749 | Separation 52 mas at 115°, "detected at ∼1.5σ with a S/N∼1.6", 168 pc, Betelgeuse ∼17.5 or ∼20 solar masses, angular diameter 40 ± 1.4 mas (2020) and 41 ± 1.2 mas (2024), the model orbit of 1850 solar radii (2.43 Betelgeuse radii) from Goldberg and others, observations on 2020 Feb 17 and 2024 Dec 9, the five predictions that matched, greatest elongations 2024 Dec 6, 2027 Nov 26, 2030 Nov 15, 2033 Nov 4, companion 1.4 to 2.0 solar masses (likeliest 1.6, assuming 10 million years), about six magnitudes fainter | The arXiv HTML version, through a fetch summary; the IOP page, through a summary (its "0.31 AU" for 52 mas is wrong, see "Conflicts") |
| NASA JPL, "NASA Scientist Finds Predicted Companion Star to Betelgeuse" (23 July 2025) | Gemini North and the 'Alopeke speckle imager; "closest red supergiant"; name Siwarha ("her bracelet"); next best view November 2027 | Fetched |
| AAS Nova, 23 July 2025 | "tentative detection — at the level of 1.5σ"; 1.4 to 2.0 solar masses, likeliest 1.6; "orbits at just 4 au" (which the paper does not support, see "Conflicts") | Fetched |
| Goldberg, Joyce and Molnár (2024), *A Buddy for Betelgeuse*, arXiv:2408.09089 | "M sin i = 1.17±0.7 M☉ and an orbital separation of 1850±70 R☉" (the abstract's own digits); it explains a 2170-day long secondary period, about five times the star's 416-day fundamental mode; the authors "discuss what would be required to confirm" the companion. A later paper and a search result give the mass uncertainty as ±0.07, which disagrees with the abstract | The arXiv abstract and HTML page, through a fetch summary |
| Goldberg and others (2025), *Betel-buddy? Constraints from HST*, arXiv:2505.18375 | Far-ultraviolet non-detection; "exclude masses above ≳1.5 M☉" | Abstract fetched |
| O'Grady and others (2025), *Betelgeuse's Buddy: X-Ray Constraints*, arXiv:2505.18376 | X-ray non-detection "robustly exclude[s] an accreting compact object"; the companion is "likely a low-mass YSO" (a young star) | Abstract fetched |
| Dupree and others (2026), *Betelgeuse: Detection of the Expanding Wake of the Companion Star*, arXiv:2601.00470 | A "~2000-day period"; companion at "2.3 stellar radii"; spectral lines that vary with the orbit; "a trailing and expanding wake" | Abstract fetched |
| Center for Astrophysics | Harvard & Smithsonian release (5 January 2026) | Hubble and two ground observatories over nearly eight years; "a trail of denser material, or wake" every 2,100 days; "direct evidence"; new observations planned for 2027 | Fetched |
| Matthews, Dupree, Richards and Dent (2026), *New Spatially Resolved Observations of Betelgeuse from the VLA and ALMA*, arXiv:2608.02847 (3 August 2026) | A correlation between Betelgeuse's radio ellipticity and the companion's orbital phase, "consistent with periodic perturbations of the atmosphere by the companion" | Abstract fetched |
| Joyce and others (2020), ApJ 902, 63, arXiv:2006.09837 | Radius 764 (+116, −62) solar radii; distance 168 (+27, −15) pc; mass 16.5 to 19 solar masses; "core helium-burning phase near the base of the red supergiant branch" | Abstract fetched |
| NASA, "What Is Betelgeuse? Inside the Strange, Volatile Star" (page dated 9 March 2026) | "around 700 light-years away"; "about 700 times the size of the Sun"; "if we replaced our Sun with Betelgeuse, it would stretch past Jupiter's orbit"; "around 15 times more massive"; "a 400-day cycle as well as a longer cycle that stretches about 5 years"; the 2019 outburst; supernova "not likely to happen for about another 100,000 years"; the page does not mention the companion | Fetched |
| NASA, "Aging Into Gianthood" (Life and Death of Stars, chapter 6) | The core contracts and heats, helium fusion starts, hydrogen fuses in a shell, "extra heat... causes its outer layer of gas to puff up"; the Sun "some 6 billion years from now"; "I am confident that the Sun will swallow Mercury and Venus, and not Mars. But the fate of the Earth... is less clear" | Fetched |
| NASA, "Stars" (science.nasa.gov/universe/stars/) | Mass decides how fast a star uses its fuel; "a subgiant or giant star" | Fetched |
| Montargès and others (2021), Nature 594, 365, the Great Dimming | A dust clump formed near the star after a cool patch appeared on its surface; dimming Nov 2019 to Mar 2020 | Search result only |
| ESO release eso2109, "Mystery of Betelgeuse's dip in brightness solved" (16 June 2021); the NOIRLab release noirlab2523 | — | **Not read.** ESO returned 503 (twice) and NOIRLab 403 or blank on 2026-10-22 (the id eso2107, tried first, was wrong); both are left off the links list |
| NASA StarChild, "What makes stars shine" (September 1999) | In a star's core protons "stick together to form a helium nucleus" and give off energy | Fetched 2026-10-22 |
| ESA, "Parallax" (Gaia) | Distances to stars from the shift in a star's position as the Earth goes round the Sun, "using simple trigonometry" | Fetched 2026-10-22 |
| ESA/Hubble, "Betelgeuse's Dust Cloud (Artist's Impression)" (13 August 2020) | The dimming was "most likely caused by" ejected hot material that formed a dust cloud | Fetched 2026-10-22 |

(The NASA JPL page also explains speckle imaging: "many thousands of short exposures" to measure and remove the air's blurring. Fetched 2026-10-22. No plain official page was found for angular size; the introduction explains it with its own illustration.)

---

## Overview

The previous experiments of this group used the project's physics to test a result. This experiment opens a new part, **how stars live and die**, and starts with a star near the end of its life that is also an example of how a claim is built up from weak, independent signs.

**Betelgeuse** is the bright orange-red star at the shoulder of Orion. It is a **red supergiant**: a very large, cool star that has used up the hydrogen in its core and swelled. In 2019 and 2020 it faded sharply (the "Great Dimming"), and for years astronomers have also known that it has a slow, regular brightness cycle of about six years that its own pulsations cannot explain. One idea is a hidden **companion star**, orbiting inside the swollen star's outer atmosphere. In **July 2025** a NASA-led team using the Gemini North telescope reported a faint spot at the predicted place and time, at only about **1.5 sigma**. In **2026** other teams reported independent signs: a "wake" in Betelgeuse's gas that repeats every 2,100 days (Hubble and ground telescopes) and a radio-shape variation that follows the orbit. The next best chance for a direct look is **26 November 2027**.

The learner rebuilds three ideas:

1. **How big a red supergiant is.** From its measured angular size (about 41 thousandths of an arcsecond) and its distance (168 parsecs), Betelgeuse's radius is about **3.5 astronomical units** (759 solar radii): if it took the Sun's place, its surface would reach **beyond Mars's orbit (1.52) but not to Jupiter's (5.20)**, and this holds across the range of distances the paper allows (3.2 to 4.1 AU). Computed.
2. **What a 6-year orbit inside a supergiant looks like.** The model orbit is 1850 solar radii (8.60 AU, **2.43 Betelgeuse radii**), and Kepler's third law with Betelgeuse at 17.5 and the companion at 1.6 solar masses gives a period of **5.77 years (2,109 days)**, matching the 2,100-day cycle; the 52 milliarcseconds the team measured is 8.7 AU at 168 parsecs, the same distance seen from Earth. The period barely depends on the companion's mass (5.43 to 5.93 years across the masses in the papers), so the orbit alone cannot weigh the companion. Computed.
3. **How weak signs add up.** A 1.5 sigma spot, taken alone, happens by chance about **1 time in 15** (counting one direction, the convention of Experiment 1 of this group); the usual bar of 5 sigma is about 1 in 3.5 million. What makes the claim stronger is that the spot was **predicted in advance in five ways** (appearance, separation, angle, brightness and mass), and that **other teams, using other kinds of data, found signs that follow the same period**. What the learner should not conclude: that the companion's *mass* is known (estimates run from about 1.2 to 1.6 solar masses, and one analysis excludes more than about 1.5), or that nobody doubts it.

It says plainly what it does **not** do: it does not model the star's inside, its pulsations or the Great Dimming; it does not combine the evidence into one number (the papers give no such number, and one invented here would be false precision); and it does not say when Betelgeuse will explode (Experiment 13 of this group is about a supernova).

New ideas: (1) **what a red giant or supergiant is**; (2) **angular size and distance give a real size**; (3) **a hint with a prediction behind it** versus a hint found by looking everywhere.

---

## Learning Objective

After this experiment, the learner should understand:

1. A red giant or supergiant is a star whose core has used up its hydrogen and whose outer layers have puffed out, so it is huge, cool and red (NASA's wording of the process, not derived here).
2. Radius = ½ × angular size × distance, giving about 3.5 AU for Betelgeuse (computed), past Mars and short of Jupiter, and why the answer is still the same when the distance is uncertain.
3. A star's period of orbit comes from Kepler's third law (period² = separation³ ÷ total mass, in years, AU and solar masses), and the period fixes the **total** mass far better than the companion's mass.
4. What sigma means for a single detection (the chance that noise alone makes a spot this strong or stronger: 1.5 sigma, about 1 in 15), and why 1.5 sigma alone is a hint, not a discovery.
5. Why a hint found in a place and time **predicted beforehand**, and supported by **independent kinds of evidence with the same period**, is stronger than the sigma alone suggests, and why that is still not a confirmation (no direct image yet; mass uncertain).
6. Settled, strong and open, as of October 2026.

---

## Physical Situation

**Reused:** Experiment 1 of this group (sigma, the "give or take"); Kepler's third law and orbits (Gravity 6); the idea that a star ends its life in a way that depends on its mass (Black Holes 9).

**Simplifying assumptions (stated to the learner in plain language):**
- Betelgeuse is a **sphere** with a sharp edge (its real edge is fuzzy, it pulsates, and its size changes with time and with the wavelength used to look).
- Its size comes from one angular diameter (**41 mas**, the paper's 2024 measurement; its 2020 value is 40 ± 1.4 and its model value about 42) and a distance of **168 parsecs** (Joyce and others 2020), with the range 153 to 195 pc from the same paper's uncertainty.
- The companion moves on a **circular orbit** of **1850 solar radii** (8.60 AU), the value the Howell paper takes from Goldberg and others; masses are 17.5 (Betelgeuse, the Howell paper's adopted value) and 1.6 solar masses (companion).
- The orbit is seen from the side, as the paper says ("nearly edge-on"); the picture shows it face-on, from above, so the learner can see its size.
- Planets' orbits are circles at 0.387, 0.723, 1.000, 1.524 and 5.203 AU (standard values, **not read from a source for this page**).

**Not introduced:** the Great Dimming's cause (named in one line only, with its source), the star's inside, Betelgeuse's pulsations, how long until it explodes beyond one sourced sentence, the companion's origin, orbital eccentricity.

---

## Physics Model (`src/physics/betelgeuseCompanion.ts`, imports nothing)

| Item | Value (computed 2026-10-22) |
|---|---|
| Radius from angular diameter and distance | `R = ½ θ d`: 41 mas at 168 pc gives 3.444 AU (740 solar radii); 42 mas gives 3.528 AU (759 solar radii, the Joyce 764 within 1 percent); the range 153 to 195 pc with 40 to 42 mas gives 3.06 to 4.10 AU |
| Which planets are inside | At 3.44 AU: Mercury, Venus, Earth and Mars (1.52); not Jupiter (5.20). The answer does not change across the range above |
| Separation from the angle | 52 mas at 168 pc = 8.74 AU = 1,879 solar radii = 2.48 Betelgeuse radii (at 3.53 AU) |
| Separation from the model orbit | 1850 solar radii = 8.60 AU = 2.43 Betelgeuse radii (2.5 in Goldberg and others) |
| Kepler's third law | `P = √(a³ ÷ (M₁ + M₂))`: a = 8.60 AU, M₁ = 17.5, M₂ = 1.6 gives **5.774 years = 2,109 days**; M₂ = 1.17 gives 5.84 years (2,133 days); M₁ = 16.5 gives 5.93 years; M₁ = 20 gives 5.43 years (1,983 days) |
| Observed period | quoted, not computed: about 2,000 days (Dupree and others 2026), about 2,100 (the CfA release), 2,170 (Goldberg and others 2024), "about 6 years" (Howell and others); the module keeps the range 2,000 to 2,170. The model period is within 6 percent of every one of these |
| Sigma and chance | One-sided chance of a result at least `z` sigma by noise alone: 1 sigma 0.159 (1 in 6.3), **1.5 sigma 0.0668 (1 in 15.0)**, 2 sigma 0.0228 (1 in 44), 3 sigma 0.00135 (1 in 741), 5 sigma 2.87 × 10⁻⁷ (1 in 3.49 million); the same convention as Experiment 1's tutor |

Functions (as built): `radiusAU(diameterMas, distancePc)`, `radiusSolarRadii`, `radiusRangeAU`, `widthAU`, `planetsInside(radius)`, `reachOf(radius)`, `separationAU(separationMas, distancePc)`, `modelSeparationAU`, `separationInRadii`, `separationMismatchPercent(distancePc)`, `matchingDistancePc`, `parsecsFromLightYears`, `keplerPeriodYears(aAU, m1, m2)`, `periodDays`, `keplerWorking`, `periodSwingPercent`, `periodAgreementPercent(days)`, `chanceOfSigma(z)` (one-sided, with its own complementary error function so the module imports nothing), `chancePercent`, `oneInChance(z)`, `headsInARow(z)`, `brightnessRatio(magnitudes)`, `sizeAnswer()`, `sigmaAnswer()` and `runBetelgeuseCompanion(...)`. Out-of-range inputs throw `RangeError`.

---

## Learner Controls

1. **Run:** gated on both predictions.
2. **After the run only, "How far away is Betelgeuse?":** three buttons, 153, 168 (the paper's value) and 195 parsecs (Joyce and others' range). Picture 1's disc and the readout follow; the page says the planets inside do not change.
3. **After the run only, "How heavy is Betelgeuse?" and "How heavy is the companion?" (two rows of buttons):** Betelgeuse 16.5, 17.5 or 19 solar masses; companion 1.17 (Goldberg and others, 2024), 1.4, 1.6 (Howell and others) or 2.0 solar masses. Picture 2's white block and a readout show the time for one orbit. It does not choose among them.
4. **After the run only, "How strong is the spot?":** 1.5 (as reported), 2, 3 or 5 sigma, showing the chance of noise alone and Picture 3's white marker. A trial value, not a claim about the real detection.
5. **The controls appear above the results**, so that the pictures change as the learner chooses; each adds a white mark to the pictures (Picture 1 and Picture 2 a dashed white outline of the star at the chosen distance, Picture 2 a white block of text for the masses, Picture 3 a white marker) and fills **Table 4**.
6. **A "Start over" button** resets the predictions, the run and all the controls.

---

## Prediction Activity

Two questions, both answered before Run is enabled. Not scored while the learner is predicting; the tutor marks each as matched or not matched in its explanation (the group's pattern). Each ends "You are not graded, and a guess is fine."

> **Prediction 1: how big?** Betelgeuse is a red supergiant. Imagine it replaced the Sun, with its center where the Sun is. Mercury, Venus, Earth, Mars and Jupiter would be at their usual distances. How far out would its surface reach? Buttons: **Inside Earth's orbit**, **Past Mars but not as far as Jupiter**, **Past Jupiter's orbit**.
>
> **Prediction 2: how strong is the hint?** The team's picture shows a faint spot, at the place and time where a companion was predicted, that is **1.5 sigma**. Here is what that means. Even where there is nothing to see, a picture is never perfectly smooth: its brightness wobbles a little from place to place, at random. That random wobble is the **background noise** (it comes from things like the blurring air, the detector and the star's glare, not from a companion). The "give-or-take" is how big a typical wobble is. "1.5 sigma" says the spot is 1.5 of those typical wobbles brighter than the average background. For example (made-up units, only to show the idea): if a typical wobble is 10 units, a spot 15 units above the average is 15 ÷ 10 = 1.5 sigma. The "Sigma and noise" entry under "Some new words" explains this in more detail. If there were really nothing there, and noise alone were responsible, how often would noise make a spot at least this strong in that place? Count only spots that are too strong, not too weak, as in Experiment 1. Buttons: **About 1 time in 2**, **About 1 time in 15**, **About 1 time in 3.5 million**.

Right answers: Prediction 1 **past Mars but not as far as Jupiter** (3.4 AU; the natural wrong answers: "past Jupiter's orbit", which is also what NASA's own page says in a loose way, see "Conflicts", and "inside Earth's orbit", from the Sun's own future of swallowing only the inner planets). Prediction 2 **about 1 time in 15** (the natural wrong answers: "1 in 3.5 million", from 5 sigma; "1 in 2", for no feeling for sigma). The introduction defines sigma and states the one-direction convention so that Prediction 2 can be reasoned from; neither introduction nor prediction gives either answer (§12).

---

## Experiment Behavior

### Introduction (an outline of the built text; the owner approved the wording on 2026-10-22; the full text is in `BetelgeuseCompanionExperiment.tsx`)

The status line; the question; where we left off (Experiment 1's sigma; Black Holes 9 on how a star's end depends on its mass); **what a star is doing for most of its life, and what changes at the end** (NASA's account of the core contracting, helium fusing, hydrogen fusing in a shell around it and the outer layers puffing up; a daily-life example is chosen when the wording is drafted); the Sun's own future (NASA: about 6 billion years; Mercury and Venus swallowed, Earth unclear, Mars not) without a size; **Betelgeuse** (where it is, what it looks like, that it is roughly 700 light-years away, a variable star); **the 6-year cycle and why a companion was suggested** (stated as an idea, not a result); **what the team did in 2024** (speckle imaging: many very short photographs that freeze out the blurring by the air) and **what "1.5 sigma" means**, with the one-direction convention; what other teams reported in 2026; where the question stands (October 2026); new words (red giant or supergiant, companion, angular size and milliarcsecond, parsec and astronomical unit, sigma, elongation); what the learner does; what we assume; and the "Want to know more?" list. It does not give the star's size, the period's agreement or the chance.

The introduction explains one more background idea (the Great Dimming) in one sentence, from the sources, as background only.

**"Want to know more?" links, visible from the start** (each to be fetched again before the wording is approved):

| Link | What the learner finds | Status 2026-10-22 |
|---|---|---|
| NASA, "NASA Scientist Finds Predicted Companion Star to Betelgeuse" (jpl.nasa.gov) | The 2025 announcement in plain words | Fetched |
| NASA, "What Is Betelgeuse? Inside the Strange, Volatile Star" (science.nasa.gov) | A plain account of the star | Fetched |
| NASA, "Aging Into Gianthood" (science.nasa.gov) | How a star becomes a red giant, including the Sun's future | Fetched |
| NASA, "Stars" (science.nasa.gov/universe/stars/) | How mass decides a star's life | Fetched |
| NASA StarChild, "What makes stars shine" | A plain account of nuclear fusion in a star's core (added after the final review) | Fetched |
| ESA, "Parallax" | How astronomers measure how far away a star is (added after the final review) | Fetched |
| ESA/Hubble, "Betelgeuse's Dust Cloud" | ESA's and NASA's account of the 2019 to 2020 dimming (added after the final review; replaces the unreadable ESO release) | Fetched |
| Center for Astrophysics, "CfA Scientists Detect 'Wake' of Betelgeuse's Elusive Companion Star" | The 2026 evidence in plain words | Fetched |
| NOIRLab, "Gemini North Discovers Long-Predicted Stellar Companion of Betelgeuse" | The 2025 announcement from the observatory | **Not yet fetched** |

**Kept back until after the run** (they reveal Prediction 2's answer or the paper's own wording of the result): the Howell and others paper (arXiv:2507.15749 and the IOP page), the Dupree and others and Matthews and others papers, and the Goldberg and others and O'Grady and others constraints.

### Display

Three pictures, each with every component labelled on the canvas (§14) and a guide beneath it (what is drawn, units defined, a worked moment with real numbers, and "Look at / What it means / Why it matters" items shown only once the feature is drawn):

- **Picture 1: "Betelgeuse next to the Solar System."** To scale (a linear scale out to about 6 AU): the Sun as a tiny dot, the five orbits as labelled rings, Betelgeuse as a large orange disc centred on the Sun, and a paler band for the range of radius from the paper's distance uncertainty (3.1 to 4.1 AU). Planets inside the disc are marked. After the run, the chosen distance's disc is added.
- **Picture 2: "The companion's orbit."** The orbit seen from above (labelled "seen from above for clarity; from Earth it is nearly edge-on"), to scale, the orbit's circle at 2.43 Betelgeuse radii, Betelgeuse's disc, the companion as a small dot, and a ring of the time marked in years with the greatest elongations (6 Dec 2024, 26 Nov 2027, 15 Nov 2030, 4 Nov 2033, quoted from the paper). The model period appears as a number beside the orbit.
- **Picture 3: "How strong is the hint?"** A bell curve with the 1.5 sigma mark and the tail beyond it filled (the chance by noise alone, 1 in 15), the 5 sigma mark for comparison, and below it a row of **five boxes**, one for each prediction the paper says the detection matched (appearing at the predicted time, separation, direction, brightness, mass), each shown only after the stage that explains it. After the run, the control's sigma is marked.

### Run

Five named stages of 2.6 seconds each: (1) "Betelgeuse in the Solar System" (Picture 1: the disc), (2) "How sure is the size?" (the band for the uncertainty), (3) "The companion's orbit" (Picture 2), (4) "How strong is the hint?" (Picture 3: the curve), (5) "Predicted in advance" (the five boxes). Playback speed changes no number (§11). At the end the run calls `onComplete`.

### Results (neutral, then explained by the tutor)

Shown only after the run completes: the status label, then four tables and the formulas. **Table 1:** the size (angular diameter, distance, radius in AU and solar radii) and which planets lie inside, at the chosen distance. **Table 2:** the companion's orbit (separation from the angle and from the model, period from Kepler's third law, against the quoted values of the long cycle, 2,000 to 2,170 days, and the three estimates of the companion's mass side by side). **Table 3:** the evidence so far, one row per source (what it measured, what it found, its own wording of confidence, its date): Howell and others 2025 (1.5σ, probable), Goldberg and others 2024 (the period and velocities, 1.17 solar masses), Goldberg and others and O'Grady and others 2025 (non-detections that exclude more than about 1.5 solar masses and a compact object), Dupree and others 2026 (the wake), Matthews and others 2026 (radio shape follows the orbit). **Table 4:** "your own numbers, checked against the published ones" (five columns: your value, the published value, how yours compares, how it was worked out; the rows are distance, radius, planets inside, the separation from the angle and from the model and how they compare, the orbit radius in Betelgeuse radii, the masses, the time for one orbit, the strength of the spot and its chance). A "Words and formulas" panel (fusion, core and shell, red giant, supergiant, companion, angular size and the milliarcsecond, radian, parsec, astronomical unit, light-year, solar mass and radius, noise and background, sigma and noise, speckle imaging, elongation, orbital period, Kepler's third law), which gains five worked formula entries after the run (size from angle and distance, a separation from an angle, Kepler's third law, the chance of noise alone, magnitudes). The seven held-back paper links follow, then the tutor.

### Results reading guide (built 2026-10-22, the owner's rule of that date, CLAUDE.md §14 "Reading the Results"; the full approved wording is in `BetelgeuseCompanionExperiment.tsx`)

The Results open like a doctor explaining test results, in simple terms and with the real numbers. Every number comes from the module, and the guide gives no verdict between competing explanations (that stays with the tutor, §12, §13).

1. **"Your predictions, beside the results."** Each of the learner's two guesses (the button text), the question it was about, and where its number is: Prediction 1 in Table 1's "Radius" and "Planets inside the star" rows, Prediction 2 in the check-up's "How clear the faint spot is" row and in Picture 3. Each of those rows carries a tag, "(the row for Prediction 1)" or "(the row for Prediction 2)". It shows the guess only, never "matched" or "right" (the tutor's job, as in Experiments 8 and 9 of the Spacetime Geometry group).
2. **"How to read these results"** (a lead-in: the tables are test results, each number is one clue, and the question is whether the clues agree and how strong each one is).
3. **The check-up table** (expected, found, what this tells us), four rows: the orbit time (5.77 years, 2,109 days, against the observed 2,000 to 2,170 days: within 6 percent of every value quoted), the size of the orbit (8.60 AU from the model, 8.74 AU from the angle: 1.5 percent apart), the faint spot (1.5 sigma, noise alone makes one 1 time in 15: weak on its own) and the companion's mass (three estimates, not reconciled), then a line tying the rows to the status label.
4. **A note under each of Tables 1 to 3, headed "What this table tells us"**: Table 1 (the size from an angle and a distance, with 41 milliarcseconds compared to a human hair seen from about 350 metres, about 740 solar radii, planets inside, and the distance as the weakest number: a radius of about 3.1 to 4.1 AU across the allowed range), Table 2 (two routes to one length, what the orbit time means with a pendulum-clock comparison, why a match is a reason and not a proof, and the three masses as a real open question) and Table 3 (one row per team, the rows do not all say the same thing, and the case rests on several kinds of clue pointing the same way).
5. **Table 4** is renamed "Table 4: your own numbers, checked against the published ones", with a "Published value" column and a "How yours compares" column (the distance and the orbit time are read against a real range: the distances the papers allow, 153 to 195 parsecs, and the observed cycle, 2,000 to 2,170 days; the other rows are read as the same, more or less than the published value, with no cut-off), and a note ("What this table tells us") that asks which findings still hold when an input changes.
6. **"What your numbers show"**, a paragraph that updates with the controls: the published values give one sentence ("Your settings are the published values..."); a changed distance gives the radius and the separation compared with the published values and with the model (at 195 parsecs: 4.00 AU, 16 percent bigger; 10.14 AU, 18 percent longer than the model's 8.60 AU; the two routes agree less well, 18 percent apart against 1.5); changed masses give the orbit time against the published value and the observed range; a changed spot strength gives the chance of noise alone against 1 in 15; and a closing line that these are trial values.
7. **Renames:** "what if" no longer appears (the owner found it confusing): the controls are "trial values", the sigma control reads "How strong is the spot? (sigma)", and Picture 3's marker is "your setting".

**Module (additions):** `distanceToLookThisWideMetres` with `HAIR_WIDTH_MM` (0.07 mm), and `compareWithPublished` (signed percent differences from the published values, whether the planets are the same, which side of the published mass, whether the orbit time is inside the observed range and by how many days it is outside, and whether the spot strength is the published one), with six more tests (50 in all). No cut-off such as "close enough" is applied anywhere.

**Open items for the guide:** the hair's width (0.07 mm) and the football-pitch comparison are general knowledge with no source read; the pendulum-clock comparison is Claude's own; the planets row reads "Planets inside the star (centre at the Sun) (the row for Prediction 1)", with two parentheses in a row, as the owner approved the tag; it has been checked in Chrome only at 195 parsecs with the published masses and spot strength, and at the published settings, and the 153-parsec, mass and spot-strength settings are covered by tests only; it has not been checked at narrow widths, in other browsers, by keyboard or with a real learner.

**Status label (as built):** "Settled: Betelgeuse is a red supergiant, near the end of its life. Strong evidence: it has a companion (several independent signs agree with a 6-year orbit), but no clear direct image has confirmed it. Open: the companion's mass (estimates run from about 1.2 to 1.6 solar masses, and one analysis excludes more than about 1.5) and its exact nature. The next good chance to see it directly is 26 November 2027." (Decision 2.)

---

## Expected Observations

- Betelgeuse's surface reaches 3.4 to 3.5 AU: past Mars (1.52), short of Jupiter (5.20), at every distance in the range 153 to 195 pc (3.1 to 4.1 AU).
- The companion's orbit is 8.6 AU across its radius, 2.4 to 2.5 times Betelgeuse's radius; the model orbit's period is 5.8 years (2,109 days), within 1 percent of the 2,100 days observed, and changes by only a few percent across the masses in the papers.
- 1.5 sigma by chance alone: about 1 in 15. 5 sigma: about 1 in 3.5 million.
- Five independent lines of evidence in Table 3, with the confidence each paper states.

## Expected Learner Understanding

The learner should leave able to say, in their own words: what a red supergiant is and roughly how big; that a size comes from an angle and a distance; why the period of an orbit says little about the smaller star's mass; what 1.5 sigma does and does not mean; and why a prediction made in advance plus independent evidence is worth more than one weak sigma, while still not being a confirmation.

## New Concepts Introduced

Red giant and supergiant; angular size; the companion of a star; Kepler's third law in AU, years and solar masses; a one-spot sigma; predicted in advance.

## Relationship to Previous Experiments

Builds on Experiment 1 (sigma, the give or take), Gravity 6 (orbits), Black Holes 9 (the end of a star's life depends on mass).

## Relationship to Later Experiments

Experiment 13 (SN 2023ixf) is about a red supergiant that exploded; this experiment ends by saying that Betelgeuse will, one day, but not when (NASA: "not likely for about another 100,000 years", from its page of 9 March 2026). Experiment 17 (a star that vanished) and Experiment 20 (the heaviest merger) rely on what happens to massive stars. The closing recap of the group sorts all twenty-four results by status label.

---

## Required Physics Tests (as built: 44 tests; each fails when the module is deliberately broken)

1. Radius from angular size and distance: 41 mas at 168 pc is 3.444 AU and 42 mas gives 3.528; proportional to each input; the parsec and solar radii per AU are right. 2. The planets inside at 3.44 AU are Mercury, Venus, Earth and Mars, not Jupiter, at all of 153, 168 and 195 pc and 40 to 42 mas; the range of radius is 3.06 to 4.10 AU; `reachOf` puts a star in the right class. 3. The separation from 52 mas at 168 pc is 8.736 AU; the model separation is 8.603 AU, 2.44 radii of a 42 mas star, within 2 percent of the angle's. 4. Kepler's third law: 8.60 AU with 17.5 and 1.6 gives 5.774 years (2,109 days); doubling the separation multiplies the period by 2√2, quadrupling the total mass halves it; the Earth's orbit takes one year. 5. Changing the companion's mass from 1.17 to 2.0 changes the period by less than 5 percent, and Betelgeuse's own mass changes it more; every choice of masses is within 6 percent of the observed 2,100 days. 6. The chance of a result at least `z` sigma matches the standard tables at 1, 1.5, 2, 3 and 5 sigma and a separate Simpson's-rule integral, is one half at zero and falls steadily. 7. `oneInChance(1.5)` is 15.0 and `oneInChance(5)` is 3.49 million. 8. The published data equal the module's constants. 9. Out-of-range inputs throw `RangeError`. 10. The module imports nothing. 11. The predictions' answers (`sizeAnswer()` is "past Mars", `sigmaAnswer()` is "1 in 15"), `runBetelgeuseCompanion` and its controls. 12. The brightness scale (5 magnitudes is 100 times, 6 about 251). 13. The model period against the quoted range of the long cycle (2,000 to 2,170 days): within 6 percent, worst case the 2,000. 14. The angle-based separation against the model at a chosen distance (+1.5, −7.5 and +17.9 percent at 168, 153 and 195 pc; zero at 165.45 pc). 15. The helpers for the worked moments (the width across, light-years to parsecs, the step-by-step Kepler working, the period swings, the percent and the coin heads).

---

## AI Tutor Behavior (as built)

The group's pattern (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next (Continue enabled only after a reply). Conceptual question: "A team looked at the place and time where a companion was predicted, and saw a faint spot at 1.5 sigma. Other teams, using other kinds of data, found signs that follow the same cycle of about six years. What would make you trust the claim more, and what would make you wait?" The predictions are marked as matched or not matched in the explanation only, with a note for each natural wrong answer ("past Jupiter": NASA's "would stretch past Jupiter's orbit" fits the width across, 6.9 AU, not the radius; "inside Earth's orbit"; "1 in 3.5 million": the 5 sigma figure; "1 in 2": the chance at 0 sigma). The explanation has eight parts, each with a daily-life example or a short calculation: (1) why a star swells (NASA's words; a marshmallow over a fire; iron glowing red, orange, white); (2) how big, from an angle and a distance (a coin; 41 × 168 × 0.001); (3) why the answer is firm although the size is not (the range, NASA's 700 light-years, the 165-parsec agreement of the angle and the model orbit, which depends on the faint spot); (4) Kepler's third law and why the period weighs the pair and not the companion (a see-saw; the period swings by about 2 percent for the companion and about 6 percent for Betelgeuse; the idea was built to explain this cycle, so the match is not an independent test); (5) sigma (four heads in a row against 22); (6) why a spot found where it was predicted counts for more (a friend at gate 4), without a number; (7) independent signs and what each can and cannot show, with the three estimates of the companion's mass side by side and not reconciled; (8) what would settle it (26 November 2027), what was shown and what was not. It does not say that the companion is confirmed, and does not say when Betelgeuse will explode.

### Chapter summary (as built; wording approved 2026-10-22; it is in `src/App.tsx`)

"What you learned" and "What's next", shown only after the tutor's explanation. "What's next" names no experiment, because Experiment 13 has no approved specification. Experiment 11's "What's next" still names no experiment (Decision 11).

---

## Conflicts between sources, and how this specification handles them

| What | Conflict | Handling |
|---|---|---|
| The companion's separation | AAS Nova says it "orbits at just 4 au". The paper says 1850 solar radii (8.60 AU, 2.43 Betelgeuse radii), and 52 mas at 168 pc is 8.74 AU; 4 AU would be only 24 mas | Use the paper (8.60 AU), the angle (8.74 AU) and Dupree's "2.3 stellar radii". The 4 AU is not used; the IOP page summary's "0.31 AU" is also not used |
| Betelgeuse's size | NASA's page says "about 700 times the size of the Sun" and "it would stretch past Jupiter's orbit"; its own diameter (about 7 AU) is bigger than Jupiter's orbital radius (5.2 AU) but its radius (about 3.4 AU) is not | The radius is used (Joyce 764 solar radii; computed 740 to 759), and Prediction 1 asks about the surface "from the center", which is unambiguous. The tutor says plainly that a statement like NASA's can mislead if "size" means the diameter |
| Betelgeuse's mass | NASA: "around 15 times"; Joyce: 16.5 to 19; Howell: about 17.5 (and "about 20" elsewhere in the paper) | 17.5 (Howell's adopted value) in the model; the controls show 16.5, 17.5 and 19; the facts table lists all |
| The companion's mass | Howell: 1.4 to 2.0, likeliest 1.6 (assuming 10 million years); Goldberg: 1.17 (an M sin i, the least the mass can be) with an uncertainty printed as ± 0.7 in the paper's abstract and as ± 0.07 in a later paper and a search result; HST: excludes above about 1.5 | Show all three (the abstract's figure is used), unreconciled, with the one-line reason each estimate differs (the method), and say the mass is open |
| Betelgeuse's angular size | Howell and others quote 40 ± 1.4 mas (2020) and 41 ± 1.2 mas (2024) | The 2024 value, 41, is used (the draft wrongly called it "the mean", which would be 40.5) |
| The distance | Joyce and others: 168 (+27, −15) pc, about 548 light-years; NASA's page: about 700 light-years (about 215 pc) | Joyce's range (153 to 195 pc) is used for the controls (owner's choice); the introduction says estimates differ, and the tutor shows that 215 pc gives 4.4 AU, which still stops short of Jupiter |
| Whether it is "confirmed" | CfA (January 2026): "direct evidence", "firm evidence"; Howell (2025): "probable", 1.5 sigma; Matthews (2026): "consistent with" | The status label says "strong evidence", not "confirmed", and Table 3 quotes each source's own wording |
| The orbit's period | "about 6 years" (Howell, AAS Nova), "~2000 days" (Dupree), "about 2,100 days" (the CfA release), 2,170 days (Goldberg's abstract), NASA's page "about 5 years", the JPL release's "three years" (which seems to describe the gap between good viewing windows) | The model gives 2,109 days; the quoted values (2,000 to 2,170) are shown as quoted and the model is described as within 6 percent of every one; the "three years" is not used |

---

## Facts that may change (re-check by the dates shown)

| Fact | Source | Checked | Why it may change |
|---|---|---|---|
| The companion has been detected only at about 1.5 sigma in direct images | Howell and others 2025 | 2026-10-22 | The next best direct-imaging chance is **26 November 2027**; a clear detection or a non-detection would change the label |
| A wake and a radio-shape variation follow the orbit | Dupree and others 2026; Matthews and others 2026 (3 August 2026) | 2026-10-22 | New papers; the radio paper is two months old |
| Companion mass 1.17 ± 0.7 (the abstract's digits; ± 0.07 elsewhere; RV) vs 1.6 (isochrones) vs "below about 1.5" (HST) | Goldberg and others 2024; Howell 2025; Goldberg and others 2025 | 2026-10-22 | These will be reconciled or not as data come in |
| Betelgeuse's radius 764 (+116, −62) solar radii; distance 168 (+27, −15) pc | Joyce and others 2020 | 2026-10-22 | Other distance estimates exist (not read); a newer one would change the band in Picture 1 |
| Supernova "not likely... for about another 100,000 years" | NASA's page dated 9 March 2026 | 2026-10-22 | Other estimates (a few thousand years, 1.5 million years) appeared in search results and were not read |
| The Sun's red-giant phase "some 6 billion years from now" | NASA, "Aging Into Gianthood" | 2026-10-22 | Other pages say about 5 billion; the page's own wording is used |

## Open items

No paper was read in full. The Howell paper's numbers are from its arXiv HTML through a fetch summary; the IOP page's "0.31 AU" for 52 mas is wrong and unexplained. Table 3's quotes come from abstracts, release pages and fetch summaries. The "as predicted" next to the companion's mass (and to each of the five boxes in Picture 3) rests on a summary of the paper's list of five predictions. Goldberg's mass uncertainty is ± 0.7 in the abstract and ± 0.07 elsewhere. The two quoted elongation dates imply a period of about 5.9 years, not the model's 5.77. The orientation of the orbit in Picture 2 (which side is 2024 and which 2027) is a drawing choice. "A nearly edge-on orbit" is quoted from AAS Nova only. The Great Dimming rests on the ESA/Hubble page (the ESO release could not be read); Montargès (2021) was seen only in a search result. The ESO and NOIRLab releases were not read. No plain official page was found for angular size. The planets' orbits (0.387 to 5.203 AU), the unit constants (1 AU = 215.03 solar radii, 1 pc = 206,265 AU = 3.26 light-years), "orange-red" for the star's colour, "cooler surfaces glow redder" (iron in a forge), and the fusion paragraph beyond what the NASA StarChild page says have no source read for this page. The introduction's and the tutor's examples (the balloon, the marshmallow, the coin, the see-saw, the coin flips, the friend at a gate) are the project's own. The 165-parsec agreement in the tutor is derived here and depends on the faint spot. Betelgeuse's "400-day cycle" on NASA's page is not used. It has not been checked in other browsers, by keyboard, with a screen reader or with a real learner; at narrow widths the pictures scale down and their labels become small (the same limit as the group's other experiments).

---

## Decisions for the owner (all twelve settled on their defaults, 2026-10-22)

1. **Anchor and scope.** Default: Betelgeuse and its companion; the Great Dimming only as one background sentence; the Sun's future only qualitatively (NASA's words, no size). Alternative: make the Great Dimming the experiment (more dramatic, but its cause is a story with its own debate and would need its own model).
2. **The status label.** Default: the label above, "Settled / Strong evidence / Open", which **changes the proposal's "Open (the companion)"** because the 2026 papers give independent evidence. Alternative: keep "Open" for the companion, on the grounds that no clear direct image exists.
3. **Prediction 1** (how big, with five planets). Default as written. Alternative: ask only "Earth or Jupiter".
4. **Prediction 2** (how often would noise make a spot this strong). Default: numeric, in the one-direction convention of Experiment 1. Alternative: a plain "Does a 1.5 sigma spot count as a discovery? Yes / A hint / Probably noise".
5. **The size model.** Default: angular diameter × distance, which uses numbers the papers give, instead of the proposal's luminosity and temperature (the paper summaries read give no luminosity or temperature). Alternative: add the Stefan-Boltzmann relation once those two numbers are read.
6. **The three controls** (distance, masses, sigma). Default: all three. Alternative: drop the sigma control (Picture 3 already shows 1.5 and 5).
7. **Three estimates of the companion's mass.** Default: show 1.17, 1.6 and "below about 1.5" side by side without choosing. Alternative: show only the paper the experiment is anchored on (Howell, 1.6).
8. **The five-box "predicted in advance" row** in Picture 3 and no combined probability. Default as written. Alternative: leave out the row and cover it only in the tutor.
9. **The links list.** Default: the five fetched links now, and the ESO and NOIRLab releases only after they can be fetched. Alternative: drop the ESO release and the Great Dimming background altogether.
10. **The Sun's end.** Default: a short qualitative paragraph using NASA's wording ("some 6 billion years from now", Mercury and Venus swallowed, Earth unclear). Alternative: leave out.
11. **Experiment 11's "What's next".** Default: leave it naming no experiment now; decide after this one is built. Alternative: point it here now.
12. **Order of the next steps.** After approval, build in the §21 order, one step at a time, stopping after each: physics model and tests, then the interface, predictions, run, results and controls, the tutor and chapter summary, a complete-flow test in Chrome, and a final review.

---

## Implementation Notes

**Step 1 (physics model and tests), 2026-10-22.** `src/physics/betelgeuseCompanion.ts` with 31 tests, checked by nineteen deliberate breaks (two were first missed: a flipped sign on the period difference, caught after a test for the sign was added, and a stray import, caught after the break was made to a module that resolves). The three-way answer to Prediction 1 has a fourth class, "past Earth", with no button, so that `reachOf` is defined for any size.

**Step 4 (interface skeleton), 2026-10-22.** The introduction, the illustration "how an angle and a distance give a size" with its guide, the "Words and formulas" panel and the links; committed (`b276a39`). The owner asked for "fuse" to be explained, which added the fusion, core and shell paragraphs and panel entries.

**Step 5 (predictions), 2026-10-22.** Two questions with Run gated on both; Prediction 2 gained the sentence "Count only spots that are too strong, not too weak, as in Experiment 1" (`f04751e`).

**Step 6 (the run and three pictures), 2026-10-22.** Five stages; Pictures 1, 2 and 3 with guides; `brightnessRatio` added to the module (`b863b1a`).

**Step 7 (results), 2026-10-22.** Status label, Tables 1 to 3, five formula entries, seven held-back paper links; `observedPeriodRangeDays` and `periodAgreementPercent` added after the fetch of Goldberg and others showed a 2,170-day cycle (`6330cd6`).

**Step 8 (controls), 2026-10-22.** Three controls and Table 4; `separationMismatchPercent` and `LIGHT_YEARS_PER_PARSEC` added (`c462a53`).

**Step 9 (tutor and chapter summary), 2026-10-22.** `BetelgeuseCompanionTutor.tsx`; `matchingDistancePc` added (`ee7ef25`).

**Results reading guide, 2026-10-22 (after the final review, at the owner's request).** The check-up, the notes under each table, Table 4 renamed and compared with the published values, the updating paragraph and the predictions beside the results, as described under "Results reading guide" above; wording approved step by step by the owner, and the owner added the hair example and the comparison with the published values; committed (`b708678`). The owner's rule that every experiment has such a guide is in `CLAUDE.md` §14, `AGENTS.md` and `docs/PROJECT.md`.

**Complete-flow test (Step 10), 2026-10-22.** In Chrome, with the page's stage timer shortened for speed (no code changed): all nine prediction pairs (Run gating, the run, four tables, the controls, locked buttons, each tutor step gated, eight parts, the right marks and the right wrong-answer notes and no other), 298 control checks (36 combinations of distance and masses and the four sigma values, plus Tables 1 and 2) against a separate calculation written in the page, the summary absent until the third tutor answer, the completion mark in the sidebar, no console errors, and no horizontal scroll at 480 px (labels small).

**Final review (Step 11), 2026-10-22.** Nine findings; the owner chose all of them ("fix all"):
- **The "mean"** of 40 and 41 is 40.5, and the value used is the 2024 one: Table 1 and this text now say so.
- **Two claims stronger than the source** (that the team "picked the date" for its pictures; that the pictures were taken when the orbit said the companion would be farthest) now say the pictures were taken within days of that date.
- **Links (§29 rule 3):** NASA StarChild (fusion), ESA "Parallax" (distance) and ESA/Hubble "Betelgeuse's Dust Cloud" (the dimming) were fetched and added; the JPL link's description now says it explains speckle imaging; the ESO release (eso2109, not eso2107) and the NOIRLab release could not be read and are left out; no plain official page was found for angular size.
- **`AGENTS.md` and `docs/PROJECT.md`** said "all nineteen" and now say "all twenty-four".
- **This specification** was brought in line with the build (the list of differences below).
- **Arithmetic in the interface (§9)** moved into the module: `widthAU`, `parsecsFromLightYears`, `keplerWorking`, `periodSwingPercent`, `chancePercent`, `headsInARow`, with five more tests (44 in all).
- **The title** now reads "A star near the end of its life: what is Betelgeuse, and does it have a companion?" (Decision for the owner, taken by "fix all").
- **Source discrepancies** are listed above and in "Conflicts"; **narrow widths** are the group's known limit.

**Differences from the first draft of this specification (approved by "fix all", 2026-10-22):**
1. Prediction 2 gained the one-direction sentence. 2. The observed period is the range 2,000 to 2,170 days, and the model is "within 6 percent of every value quoted", not 0.4 percent of 2,100. 3. Goldberg's mass uncertainty is ± 0.7 as printed in the paper's abstract (the draft's ± 0.07 came from a search result). 4. The angular size is the 2024 value, not "the mean". 5. The controls are as built (two rows of mass buttons; sigma 1.5, 2, 3 and 5; the controls above the results; a white mark in each picture). 6. The introduction gained the fusion, core and shell paragraphs, the coin worked example, and entries for radian, light-year and fusion in the panel. 7. The introduction's links list has eight links (the draft's five plus StarChild, ESA Parallax and ESA/Hubble), and the draft's ESO and NOIRLab rows are unread. 8. Table 2 includes the three mass estimates; Table 4 has a row comparing the angle-based and model separations. 9. Five worked formula entries were added to the panel after the run. 10. The tutor's part 3 notes the 165-parsec agreement of the angle and the model orbit. 11. `brightnessRatio`, `separationMismatchPercent`, `matchingDistancePc`, `observedPeriodRangeDays`, and the helpers of the review were added to the module. 12. The title changed.

**Later wording change (2026-10-23, approved by the owner; committed `7fed6ea`):** Prediction 2 now explains "background noise" and "give-or-take" with a made-up worked example (a typical wobble of 10 units, a spot 15 units above the average, 15 ÷ 10 = 1.5 sigma), and the panel entry "Sigma and noise" was rewritten at more length (a dark patch of sky, a radio between stations, the same worked example, 5 sigma as 50 units). The sources of noise named ("the blurring air, the detector and the star's glare") are Claude's general description, not taken from the Howell paper, and have no source check.

**Later wording change (2026-10-23, approved by the owner):** the "Words and formulas" panel gained a separate entry, "Noise and background", placed just before "Sigma and noise". It defines noise (the random, unwanted wobble in a measurement, which can be made smaller but never removed completely) and background (the ordinary level of the picture where there is nothing to find), with the example of hearing a whisper in a room with a fan running, and says a faint spot must always be compared with the noise around it. Its general statements (such as "never removed completely") have no source check. The two entries overlap a little; "Sigma and noise" was left as it was.

**Correction (2026-10-23, wording approved by the owner):** Picture 2's "What it means" line said the companion goes round "well inside the distance of Jupiter from the Sun". That was wrong: the orbit's radius (8.6 AU) is farther out than Jupiter's orbit (5.203 AU), about 1.65 times as far. It now says the companion goes round outside the star's surface and is also farther from the centre than Jupiter is from the Sun (5.203 AU), so Jupiter's dashed circle lies inside the cyan orbit. The specification had not quoted the wrong sentence.

**Review wording changes (2026-10-23, approved by the owner):** (1) the introduction no longer says "NASA calls it the closest red supergiant to the Earth"; it says "one of the best-known stars in the sky". The first row of the source table above lists "closest red supergiant" as a phrase of the NASA JPL release (fetched), so the claim may be sourced there; it was removed because the NASA Science page the page links as "What is Betelgeuse?" does not say it. (2) Table 1's "Why it matters" now says the 2.5-radius orbit is outside the surface of the simple ball but within a real supergiant's extended outer atmosphere (it said "in the thin outer layers"). (3) Picture 2's "What it means" for the four places no longer says the position "is why the 2020 pictures showed nothing"; it says the 2020 pictures were taken when the companion was predicted to be behind the star, and showed no spot, "which fits that".
