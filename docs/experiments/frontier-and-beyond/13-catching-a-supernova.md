# Experiment 13 (Frontier and Beyond): Catching a Supernova in the Act: What Exploded, and Where Did the Energy Go? (SN 2023ixf)

**Status: Specification APPROVED by the owner on 2026-10-23 ("approved with all decisions on their defaults", read as all twelve decisions on their defaults). Proposed by Claude on 2026-10-23 per `CLAUDE.md` §23 Stages 1 to 3, as the thirteenth experiment of the group (`00-group-proposal.md`, Part C, "how stars live and die", entry 13). Implementation starts with Step 1 (physics model and tests) and proceeds one step at a time (§6). Every number below was taken from search results or fetched abstracts on 2026-10-23; no paper was read in full (see "Sources read"). The decisions at the end are the owner's.**

**Status label proposed for the learner (as of October 2026):** *Strong evidence* that a red supergiant exploded (the star was photographed before it blew up, and the explosion's light and gas fit one); *Strong evidence from theory and from one earlier supernova (1987A)* that almost all the energy leaves as neutrinos, although **no neutrinos were detected from SN 2023ixf itself**; *Contested*: how heavy the star was (estimates run from about 8 to about 20 times the Sun, and a 2026 paper says its dust may have fooled the low ones); *Open*: why the star shed so much gas in its last years.

---

## Overview

On 19 May 2023 the amateur astronomer Kōichi Itagaki found a new star in the Pinwheel Galaxy (M101): the supernova **SN 2023ixf**, the closest supernova of its kind in about a decade (Jacobson-Galán's 2025 review, "the closest supernova in the last decade"). Because M101 had been photographed many times, astronomers could look back at the pictures and see the star *before* it exploded: a cool, dusty red supergiant, the kind of star Experiment 12 introduced. Within hours of the explosion, spectra showed gas packed close to the star, gas the star must have thrown off in its last few years. Few explosions are caught like this, with the "before" picture, the first hours and years of later follow-up.

This experiment asks three questions, one for each thing the learner can check:

1. **Where did the energy go?** A star's core collapsing into a neutron star frees an enormous amount of energy, about 4 × 10⁴⁶ joules by a simple estimate. Almost all of it leaves as **neutrinos** (nearly massless particles that pass through almost everything). A smaller share, about 0.2 percent, is the *motion* of the blown-off gas, and the part that reaches us as visible light, the flash we photograph, is about 1 part in 4,000 to 1 part in 40,000. The learner predicts the visible share, then sees it.
2. **When did it really happen?** M101 is about 22 million light-years away, so the light seen in May 2023 left the star about 22 million years ago. (This reuses Spacetime Geometry 4, "what you see is the past".)
3. **What was the star, and what had it been doing?** Photographed before the explosion: a red supergiant. How heavy? Seven published estimates run from about 8 to about 20 solar masses, and they do not all overlap. What had it done? The gas close to it, from the first spectra, is gas it shed in its last 3 to 6 years (when the paper's assumed speed of 50 km/s is used). The learner sees how a *distance* and a *speed* give *how long ago*.

No new physics is introduced: energy as GM²/R (Black Holes 9 and Spacetime Geometry 5), light-travel time (Spacetime Geometry 4), distance ÷ speed, and the comparison of a measurement's range (as in Experiment 1).

## Learning Objective

By the end the learner can say, in their own words:

1. What a **core-collapse supernova** is: a massive star's iron core, held up only by electron degeneracy pressure, grows too heavy; it collapses to a neutron star, and the outer layers are blown away. The centre stiffens at nuclear density and rebounds a little (it does not return to its old size), the gas still falling in hits it and a shock wave runs outward, the shock stalls, and heating by neutrinos is thought to revive it. (NASA: "The core collapses and then rebounds... creating a shock wave"; "The remnant core is a superdense neutron star.")
2. That the collapse frees far more energy than the explosion's light, motion or even the Sun's whole lifetime of shining: **a neutron star's collapse is about 360 times the Sun's whole-life output; the blown-off gas carries about as much as the Sun's whole life; the visible light carries about one hundredth to one tenth of that** (the numbers are computed in the physics module; the Sun's lifetime figure is one of the source checks).
3. That almost all of the energy leaves as neutrinos, which pass through the star and the Earth, and why that matters for what we can and cannot see. (And that no neutrinos were reported from SN 2023ixf: it was too far; the only supernova with detected neutrinos so far is SN 1987A, much nearer.)
4. That the light from a distant explosion left long ago, and how to compute how long: distance ÷ the speed of light.
5. That seeing the star *before* it exploded is rare and valuable, and that estimates of its mass **disagree**, which is why the label for its mass is *Contested*, not *Settled*. What kinds of method give different answers (brightness, dust, the stars around it, the way it pulsed, the way the explosion faded), without taking a side.
6. How a **distance and a speed give a time**: the gas the star shed, seen at 33 to 67 astronomical units and moving at 50 km/s, was thrown out 3 to 6 years before the explosion.

## Physical Situation

A **red supergiant** (Experiment 12) lives out its life, fusing heavier and heavier elements. At the end its core is mostly iron, which cannot make energy, so the core is held up only by **electron degeneracy pressure** (Black Holes 9: what holds up a dead star's core). Past a limit of roughly 1.4 Suns' worth of material that is not enough. The core collapses, in a fraction of a second: electrons are pushed into protons, making neutrons and neutrinos, which removes the electrons' push and speeds the fall, until the centre reaches about the density of an atomic nucleus. There neutron degeneracy pressure and the short-range repulsion of the nuclear force make it suddenly very stiff, and it rebounds a little. What stays is a **neutron star**: an object of about 1.4 Suns packed into a ball about 12 kilometres across. Gas still falling in crashes into the stiff centre and a shock wave runs outward. The shock stalls (at about 100 to 200 km, from neutrino losses and the breaking up of infalling nuclei), and the heating by neutrinos from the new neutron star (the stiff centre of the collapsed core, extremely hot because the energy of the fall has to go somewhere) is thought to revive it and drive it outward through the star's gas; this mechanism is still being studied; the shock reaches the surface and the star brightens, the "shock breakout", and then fades over months. The star had also thrown off dusty gas in its final years, so the first light of the explosion lit that gas up (the "flash") before the blast ran through and past it. We see the whole thing in M101, 22 million light-years away.

## Physics Model (`src/physics/catchingASupernova.ts`, to import nothing)

No new physics. Four small calculations, all in the module, all tested.

| Part | What it computes | Source of the numbers |
|---|---|---|
| **Energy of the collapse** | `E = G M² / R` for a neutron star of mass M and radius R (a simple "gravitational energy" estimate, as in Black Holes 9 and Spacetime Geometry 5). 1.4 solar masses, 12 km gives **4.3 × 10⁴⁶ J = 4.3 × 10⁵³ erg**. | The textbook estimate. The literature gives the total energy carried by neutrinos as (3–5) × 10⁵³ erg (arXiv:0804.4350 as seen in a search summary) and, for SN 1987A, about 2–3 × 10⁵³ erg (arXiv:hep-ph/9707501). **GM²/R is only an order-of-magnitude estimate**: a uniform ball would give 3/5 of it (2.6 × 10⁴⁶ J), and the real binding energy needs general relativity. See decision 4. |
| **The three shares** | The collapse's energy `E`, the energy of the blown-off gas `K`, and the energy radiated as light `L`; the shares `K/E` and `L/E`, and "1 time in N" `E/K`, `E/L`. `K` = 1 × 10⁵¹ erg (the literature range is (0.5–2) × 10⁵¹ erg; SN 2023ixf analyses give explosion energies of about (0.7–1.2) × 10⁵¹ erg (one analysis) and (1.0–5.7) × 10⁵¹ erg (another)); `L` = (1–10) × 10⁴⁹ erg (the literature range for radiated light; SN 2023ixf's own value is **not** yet read). | Search results, 2026-10-23; the numbers for SN 2023ixf's radiated energy must be read at the paper (open item). |
| **The Sun's whole-life yardstick** | `L_sun × 10 billion years`, as a comparison for the energies: 1.2 × 10⁴⁴ J = 1.2 × 10⁵¹ erg. So `E` is about **360 Sun-lifetimes**, `K` about **0.8** and `L` about **0.008 to 0.08**. | The Sun's luminosity (3.83 × 10²⁶ W) and a 10-billion-year lifetime are standard values, **not yet read at a source** (open item). |
| **Light-travel time** | `distance ÷ c`, or in light-years, the distance in parsecs × 3.2616. M101 at 6.85 Mpc (Riess and others 2022, from Cepheid stars; 6.85 ± 0.15) is **22.3 million light-years**. ESA and other pages say "21 million light-years"; the difference is from the choice of distance (decision 5). | Cited as "6.85 ± 0.15 Mpc" in a search summary of a 2025 paper. |
| **Distance ÷ speed of the shed gas** | `time = radius ÷ speed`. Jacobson-Galán and others (2023): dense gas out to (0.5–1) × 10¹⁵ cm, with an assumed speed of 50 km/s: **3.2 to 6.3 years** before the explosion ("about 3 to 6 years" in the abstract). 0.5 × 10¹⁵ cm is 33 astronomical units (just past Neptune at 30), 1 × 10¹⁵ cm is 67 AU. | The paper's abstract, fetched 2026-10-23. The speed is **assumed** by the authors, not measured. |
| **The mass estimates** | A list of published estimates of the progenitor's initial mass, each with its range, and a function that says which two overlap (no verdict). Estimates (initial mass, solar masses): Pledger and Shara (2023) ~8–10; Kilpatrick and others (2023) 11 ± 2 (about 12, +2 −1); Van Dyk and others (2024) 12–14; Niu and others (2023) 16.2–17.4 (and 17–19 from the surrounding stars); Jencson and others (2023) 17 ± 4; Qin and others (2023) 18.1; Soraisam and others (2023) 20 ± 4; Singh and others (A&A 2026): light-curve modelling 5.5–14 and nebular spectra 17–19, with dust able to bias the low ones by about 9. | Search summaries and abstracts, 2026-10-23; **the Kilpatrick, Van Dyk, Jencson and Qin values are from a search summary of a third paper**, not read at their own papers (open item). |

Functions (proposed): `collapseEnergyJ(massSolar, radiusKm)`, `ergFromJoules`, `sunLifetimeEnergyJ()`, `sharesOfEnergy(...)`, `oneInN(...)`, `lightTravelYears(distanceMpc)`, `timeBeforeExplosionYears(radiusCm, speedKmS)`, `cmToAU`, `massEstimates()`, `overlaps(a, b)`, `visibleShareAnswer()` (for Prediction 1) and `lightTravelAnswer()` (for Prediction 2), and `runCatchingASupernova(settings)` returning all the learner's numbers at once. Out-of-range inputs throw `RangeError`. The module imports nothing.

**What the model does not do:** it does not model the core collapse, the neutrinos' transport, the shock or the light curve; it uses published energies. It does not weigh the mass estimates against each other, or say which is right, or say the star's mass. It does not model the dust, the pre-explosion pulsations or the 2026 "red supergiant problem" argument beyond quoting them.

## Learner Controls

Two controls, shown after the run (as in Experiments 11 and 12). A third control, for the distance to M101, was dropped at the owner's request on 2026-10-23: it moved the light-travel time only from about 22 to 23 million years, which taught little. The distance stays fixed at the published 6.85 Mpc. Each is a **trial value**, not a claim about the real star. Each moves a white marker in a picture and a row of the results table.

1. **"How big and how heavy is the collapsing core?"** neutron-star mass 1.2, 1.4 (the usual figure), 2.0 solar masses × radius 10, 12, 14 km (nine settings). Moves the total energy `E` and so the share of light.
2. **"How fast was the gas moving?"** 25, 50 (the paper's assumed value), 100 km/s. Moves the time before the explosion at which the gas was shed: at 25 km/s the same gas was shed 6 to 13 years before; at 100 km/s 1.6 to 3 years.

A control for the **light share** (`L`) is **not** proposed, because the paper's `L` is not yet read; see decision 3.

## Prediction Activity

Two predictions, made before pressing Run. The page tells the learner (the owner's rule of 2026-10-23) that predictions are guesses and do not change the pictures or tables. Neither the introduction nor a button gives either answer (§12).

**Prediction 1: how much of the energy is visible light?** *"A massive star's core collapses to a neutron star and the star explodes. The collapse frees a huge amount of energy. About how much of it comes out as the visible light that telescopes photograph?"* Buttons: **About half**, **About 1 part in 10 (10 percent)**, **About 1 part in 100 (1 percent)**, **About 1 part in 10,000 (0.01 percent)**. Right answer (log-nearest, as in Experiment 12): **1 part in 10,000** (the model gives 1 in 4,300 to 1 in 43,000). The natural wrong answers: "about half" (an explosion looks like a flash of light, so light feels like the main thing) and "1 in 100" (the share of the gas's *motion*, 0.2 percent, rounds to it, which the tutor can use, without turning the tutor into a lecture).

**Prediction 2: when did it really happen?** *"The explosion was first seen from Earth in May 2023, in a galaxy a long way off. About how long before May 2023 did the star really explode? (Light takes time to cross space.)"* Buttons: **A few months**, **About 20 thousand years**, **About 20 million years**. Right answer: **about 20 million years** (22). A learner who guesses "a few months" has forgotten that light takes time to cross space, or has taken the delay to be small; the tutor links it to Spacetime Geometry 4.

## Experiment Behavior

### Introduction (to be drafted to §29 and §14 once approved, for the owner's line-by-line approval)

Outline (everything below is in plain words with real-life examples; the full text is drafted after approval):

1. **Status line** and **the question.**
2. **Where we left off:** Experiment 12 (a red supergiant near the end of its life, sigma); Black Holes 9 (what holds up a dead star's core); Spacetime Geometry 4 (what we see is the past) and 5 (energy).
3. **What a supernova is**, in plain words: the star's core collapses and the rest of the star is blown out. A neutron star is left. Why the core collapses (the iron core, held up only by electron degeneracy pressure, grows past a limit of roughly 1.4 Suns' worth of material), why the fall stops and rebounds (the centre becomes suddenly stiff at nuclear density; it does not return to its old size), why the shock stalls and how neutrino heating is thought to revive it (still being studied) are explained, as built, in the introduction, the "Words and formulas" panel and the tutor's part 1 (owner approved 2026-10-23). Daily-life pictures: a ball hitting a hard floor for the bounce, and a motorway pile-up for the shock wave (the earlier "falling bricks" idea was not used).
4. **What the star did in its last years**, stated as an idea: the gas close to the star (not yet the number).
5. **What was found** in 2023: Itagaki, the discovery of 19 May 2023; M101 (without giving the distance, which is Prediction 2's answer); the pre-explosion pictures from Hubble and Spitzer; the first spectra, within hours.
6. **Where the question stands (October 2026):** the status line's four parts.
7. **New words:** supernova, core collapse, neutron star, progenitor, neutrino, circumstellar gas ("gas round the star"), flash spectroscopy, spectrum, light-year, joule, erg, solar mass (reused), initial mass, the "red supergiant problem" (only if used).
8. **What you will do**, with the sentence that predictions are guesses and do not change the pictures or tables, and which controls do.
9. **What we assume.**
10. **"Want to know more?"** (§29 rule 3): the original papers (held back where they give away the answers: the paper that gives the energy numbers goes after the run) and a plain NASA page on supernovae and neutron stars (fetched: NASA "Star Types", on core collapse, a "huge explosion called a supernova", "the remnant core is a superdense neutron star"), the NASA/ESA pages on light-years and on the Pinwheel Galaxy (to be found), ESA/Hubble's page on SN 2023ixf if any, and an official page on neutrinos and on SN 1987A (to be found).

The introduction does not give: the distance to M101 or the age of the light, or the share of the energy that is light, or the mass of the star, or the time before the explosion that the gas was shed.

### Display (three pictures; each with a caption to the §14 standard and a three-part "What to look for")

- **Picture 1: "The star before it exploded" (stage 1 and 2).** The seven published estimates of the star's initial mass, drawn as bars (range) on a scale from about 4 to 26 solar masses, labelled with the team and the method (the stars around it; the star's brightness; its pulsations; the dust), with each method's colour. Stage 2 adds the 2026 result: the light-curve modelling range (5.5–14) and the spectroscopic (17–19) as two wide bands, and the sentence that dust could hide about 9 solar masses (A&A 2026). No verdict. After the run, the learner's choices in the controls do not move this picture (the controls act on Pictures 2 and 3), so the control-box text must say which picture each control moves (the owner's rule, 2026-10-23).
- **Picture 2: "The gas it shed in its last years" (stage 3).** Seen from above, to scale in astronomical units: the star at the centre (tiny), the planets' orbits out to Neptune (30 AU) as a ring for scale (reuses Experiment 12's scale), and the shell of gas from 33 AU (0.5 × 10¹⁵ cm) to 67 AU (1 × 10¹⁵ cm). A time axis below turns radius into "years before the explosion" at the chosen speed (3.2 to 6.3 years at 50 km/s). The learner's chosen speed is a second set of marks.
- **Picture 3: "Where did the energy go?" (stage 4 and 5).** A bar chart on a **log scale**: the energy of the collapse (4.3 × 10⁵³ erg), the motion of the gas (1 × 10⁵¹ erg), and the visible light (about 1 × 10⁴⁹ erg, with the range 1–10 shown as a bar's width); beside them, a marker for **the Sun's whole-life output** (1.2 × 10⁵¹ erg), as a ruler everyone can hold. The log scale is explained in the caption (each step up is 100 times more). The chosen core (control 1) adds a white marker. A strip beneath shows the light-travel time: "explosion → light sets out → arrives May 2023" at the published distance of 6.85 Mpc, in stage 5 (it has no white mark, because the distance control was dropped).

### Run

Five stages, paced by a timer that only paces the display (§11): 1 the star before (Picture 1); 2 how sure of its mass (Picture 1, the 2026 bands); 3 the gas it shed (Picture 2); 4 where the energy went (Picture 3); 5 how long ago (the strip of Picture 3). A short plain line under the picture says what is now added.

### Results (neutral, then explained by the tutor)

Shown only after the run completes: the status label (the four parts above, each with its date); then the **reading guide** of §14 ("Reading the Results"); the controls; then the tutor. All numbers come from the physics module (§9).

**Results reading guide (CLAUDE.md §14, "Reading the Results"; to be drafted and approved):**

1. **The check-up table** (what we would expect, what was found, what this tells us). Proposed rows, each with a real reference:
   - **Energy released by the collapse:** 4.3 × 10⁵³ erg from GM²/R against the published (3–5) × 10⁵³ erg for neutrinos and about 2–3 × 10⁵³ erg for SN 1987A: "close" (a factor of 2 at most). *This is only an order of magnitude estimate.*
   - **Energy of the gas's motion:** 1 × 10⁵¹ erg against 0.7–1.2 × 10⁵¹ erg for SN 2023ixf from one analysis, and up to 5.7 × 10⁵¹ from another: "in range, but the analyses differ".
   - **How long before the explosion the gas was shed:** 3.2 to 6.3 years from radius ÷ speed against the paper's "3 to 6 years": "the same" (it is the paper's own calculation; the speed is assumed).
   - **Mass of the star:** "not settled": estimates from about 8 to about 20 do not all overlap.
   - **Neutrinos detected from SN 2023ixf:** expected: some, if close enough; found: none reported (Super-Kamiokande: below its threshold; IceCube: consistent with background). "As expected for this distance": needs a source check on how many neutrinos would reach us.
2. **A note under each table** ("What this table tells us": what it is, what it means with the real numbers, why it matters).
3. **For the table that follows the controls** (Table 4): "Your value / Published value / How yours compares / How it was worked out", a "What your numbers show" paragraph, and "trial values" wording.
4. **The learner's predictions beside the results**, with the table row for each (Prediction 1: Table 1's "share of the light"; Prediction 2: the "light-travel time" row), and no "matched" or "right" (the tutor's job).

Tables (proposed): **Table 1: the energy budget** (the collapse, the neutrinos' share, the gas's motion, the light, each as joules, erg, a share and "1 time in N", and as Sun-lifetimes; the Prediction 1 row). **Table 2: when and where** (distance in Mpc and light-years, the light-travel time, the date of the explosion's start in years before May 2023, the gas's radius in cm and AU, the speed, the years before the explosion; the Prediction 2 row). **Table 3: the seven mass estimates side by side**, each with its method, its range and its date, and which others it overlaps; no verdict. **Table 4: your own numbers, checked against the published ones.** A "Words and formulas" panel (supernova, core collapse, neutron star, neutrino, progenitor, circumstellar gas, flash spectroscopy, spectrum, light-year, joule, erg, solar mass, initial mass, log scale) gains worked formula entries after the run (`E = GM²/R`, shares, distance ÷ speed, light-travel time). The held-back paper links follow, then the tutor.

## Expected Observations

- The collapse frees about 4.3 × 10⁵³ erg (4.3 × 10⁴⁶ J), about 360 Sun-lifetimes of shining.
- The gas's motion carries 1 × 10⁵¹ erg, about one Sun-lifetime, about 0.2 percent of the collapse.
- The visible light carries about 1 × 10⁴⁹ erg (the range 1–10 × 10⁴⁹): about 1 part in 4,300 to 1 part in 43,000 of the collapse.
- M101 is 6.85 Mpc away, 22.3 million light-years, so the light left 22.3 million years ago.
- The gas close to the star was shed 3.2 to 6.3 years before the explosion (at the paper's assumed 50 km/s).
- The seven earlier mass estimates run from about 8 to about 20 solar masses; they do not all overlap.

## Expected Learner Understanding

The learner leaves able to say: that a supernova is a star's core collapsing and its outer layers being blown away; that the visible flash is a tiny fraction of the energy, and where the rest goes; that what we see in a distant galaxy happened long ago; that astronomers can learn what a star did in its last years from the gas round it; and why an estimate of the star's mass is *contested* and what the disagreement is about.

## New Concepts Introduced

Core-collapse supernova; neutron star (as the remnant, not its structure, which Experiment 15 covers); neutrino (as a particle that carries energy away and passes through matter); progenitor; the energy budget of an explosion (neutrinos, motion, light); circumstellar gas; flash spectroscopy; the idea that a mass estimate has a method behind it and that methods can disagree; log scale.

## Relationship to Previous Experiments

Builds on Experiment 12 (red supergiant; this is what such a star does at the end), Black Holes 9 (what holds up a dead star's core, here the collapse), Spacetime Geometry 4 (what we see is the past, here 22 million years), Spacetime Geometry 5 (energy), Frontier and Beyond Experiment 1 (error bars and sigma: here the mass estimates' ranges), and Experiment 8 (the idea of a particle that barely interacts, antimatter and neutrinos).

## Relationship to Later Experiments

Experiment 14 (a white dwarf and a Type Ia supernova: the other kind of supernova, a different mechanism) and Experiment 15 (the neutron star left behind) and Experiment 16 (where the heavy elements come from, including those made in supernovae) and Experiment 17 (a star that vanished, the case where there is no visible explosion). Black Holes 1 and 9.

## Required Physics Tests (proposed; each must fail when the module is deliberately broken)

1. `collapseEnergyJ(1.4, 12)` is 4.31 × 10⁴⁶ J, matching a separate calculation; proportional to M², inversely proportional to R.
2. The joule-to-erg factor is 10⁷; the Sun's whole-life energy is 1.21 × 10⁴⁴ J.
3. The shares: `E/K` is about 431, `E/L` about 4,312 to 43,125 for `L` of 10 to 1 × 10⁴⁹ erg; the three shares sum correctly.
4. `visibleShareAnswer()` is "1 part in 10,000" (log-nearest to 4,312 to 43,125); the four buttons are ordered by size.
5. `lightTravelYears(6.85)` is 22.34 million years; `lightTravelAnswer()` is "about 20 million years"; the three buttons are ordered.
6. The time before the explosion for the gas: (0.5, 1.0) × 10¹⁵ cm at 50 km/s gives 3.17 and 6.34 years, the paper's "3 to 6"; halving the speed doubles the time; 33.4 AU and 66.8 AU for the two radii.
7. `overlaps` is symmetric, true for the 16.2–17.4 and 17 ± 4 estimates, false for 8–10 and 17 ± 4, and has no verdict.
8. The published data equal the module's constants.
9. Out-of-range inputs (zero or negative) throw `RangeError`.
10. The module imports nothing.
11. `runCatchingASupernova` returns the values for the defaults and for each control setting.
12. The control settings: nine core settings and three speeds, each against a separate calculation.

## AI Tutor Behavior (to be drafted once approved)

The group's pattern (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next. The predictions are marked as matched or not matched in the explanation only. Conceptual question (draft): *"The star was photographed before it exploded, and seven teams worked out its mass from those pictures and others. They did not all agree. What would you want to know about each method before deciding which to trust?"* Explanation parts (each with a daily-life example or short calculation, drafted to §15): (1) what a core-collapse supernova is (the falling bricks); (2) where the energy goes, with `GM²/R` worked with real numbers and the Sun-lifetime yardstick; (3) why almost all of it leaves as neutrinos and why none were seen from SN 2023ixf (a source check is needed); (4) why the flash is such a tiny share of the energy yet so bright (the Sun's whole-life output is not a small number); (5) light-travel time (the time-lag of a thunderstorm, then the 22 million years); (6) distance ÷ speed, and why the gas tells us what the star did in its last years, with the warning that the speed was *assumed*; (7) the seven mass estimates and why they differ (a method for each: brightness, the stars around, pulsation, light curve, the dust), without choosing; (8) what would settle it and what was shown and not shown. It does not give the mass of the star, does not say which method is right and does not say what the neutron star is doing now.

### Chapter summary (to be drafted once approved)

"What you learned / What's next": the three questions' results in plain words, and what Experiment 14 does next (the other kind of supernova).

---

## Sources read (2026-10-23; none in full)

| Source | What was read | Read how |
|---|---|---|
| Jacobson-Galán and others (2023), *SN 2023ixf in Messier 101: Photo-ionization of Dense, Close-in Circumstellar Material in a Nearby Type II Supernova*, ApJL, arXiv:2306.04721 | Flash lines of H I, He I/II, C IV, N III/IV/V; mass-loss rate "10⁻² M☉ yr⁻¹"; gas out to (0.5–1) × 10¹⁵ cm; an assumed wind speed of 50 km/s; mass loss "3–6 years" before the explosion; the supernova "~2 mag brighter than typical" | The arXiv abstract page, fetched. (A search summary printed the rate as "10²", a typo; the abstract says 10⁻².) |
| Jacobson-Galán (2025), *SN 2023ixf: The Closest Supernova of the Decade*, arXiv:2507.08078 | A review of more than 80 studies; explosion on 18 May 2023; "approximately 6.85 megaparsecs"; "the closest supernova in the last decade"; open questions: the physics of type II explosions and red supergiant mass loss | The arXiv abstract page, fetched |
| Pledger and Shara (2023), arXiv:2305.14447 | Hubble pre-explosion image; M(F814W) = −5.11; a red supergiant; "~8–10 M☉"; "likely a lot of dust" | The abstract, fetched |
| Niu and others (2023), arXiv:2308.04677 | Hubble and Spitzer; "a relatively massive red supergiant surrounded by C-rich dust"; 16.2–17.4 M☉ (SED), 17–19 M☉ (the star formation history); mass loss about 2 × 10⁻⁴ M☉ per year about 3 years before | The abstract, fetched |
| Soraisam and others (2023), *The SN 2023ixf Progenitor in M101: I. Infrared Variability*, arXiv:2306.10783 | A period of 1091 ± 71 days; M_K = −11.58; "20 ± 4 M☉"; "one of the most massive progenitors for a Type II SN detected to-date" | The abstract, fetched |
| Kilpatrick and others (2023), arXiv:2306.04722; Van Dyk and others (2024); Jencson and others (2023); Qin and others (2023) | Values of 12 (+2, −1) or 11 ± 2, 12–14, 17 ± 4, 18.1 M☉ | **A search summary of another paper only**; not read |
| Singh and others (2026), *Unveiling the progenitor of SN 2023ixf: Circumstellar dust and its implications for the red supergiant problem*, A&A 706 (February 2026) | Light-curve modelling 5.5–14 M☉ and nebular spectra 17–19 M☉; dust "bias[es] luminosity-based masses downwards by ~9 M☉"; "shock interaction with circumstellar material shells ejected centuries before explosion" | A search result's abstract; the journal page returned **403**; author names not confirmed |
| Late-time HST ultraviolet spectra of SN 2023ixf and SN 2024ggi (ApJ 2026) | Mass-loss rates from 4 × 10⁻⁵ M☉/yr (600 years before) to 2 × 10⁻² M☉/yr (15 years before) | A search result's summary only |
| Energy budget: Physics of Supernovae (arXiv:0804.4350); Supernova 1987A, Ten Years After (hep-ph/9707501); a 2026 review (arXiv:2605.25879) | "≳99%" in neutrinos; neutrinos (3–5) × 10⁵³ erg; explosion (0.5–2) × 10⁵¹ erg; radiated light (1–10) × 10⁴⁹ erg; SN 1987A total 2–3 × 10⁵³ erg | **Search results' excerpts only**; none opened |
| SN 2023ixf neutrinos: IceCube follow-up (arXiv:2507.07097); Super-Kamiokande (an ATel and a Low- and High-energy neutrinos paper, arXiv:2306.14717) | IceCube: consistent with background (p = 0.18); Super-Kamiokande: sub-threshold | Search result summaries only |
| NASA, "Star Types" (science.nasa.gov/universe/stars/types/) | "The core collapses and then rebounds back to its original size, creating a shock wave"; "a huge explosion called a supernova"; "the remnant core is a superdense neutron star"; stars of 8 to 20 solar masses | Fetched 2026-10-23 |
| NASA Imagine the Universe, "Supernovae" (imagine.gsfc.nasa.gov/science/objects/supernovae1.html) | "When the core contains essentially just iron, it has nothing left to fuse"; "fusing iron does not result in a net yield of energy". It gives 1.4 solar masses only as the white dwarf (Chandrasekhar) limit, says nothing on what holds up a massive star's iron core, and nothing on the stall or neutrino heating | Fetched 2026-10-23 |
| NASA HEASARC, supernova remnants (heasarc.gsfc.nasa.gov/docs/objects/snrs/snrstext.html) | "electrons and protons are pushed so close together that they merge to become neutrons, releasing energy in the form of neutrinos". Says nothing on the stall or neutrino heating | Fetched 2026-10-23 |
| Burrows and Vartanyan (2021), *Core-Collapse Supernova Explosion Theory*, Nature 589, 29, arXiv:2009.14157 | The core "implodes within less than a second to neutron-star densities, at which point it rebounds like a spherical piston, generating a shock wave"; "The stalled shock radius initially hovers around 100-200 km", from neutrino losses and the breaking up of infalling nuclei; neutrino heating in the "gain region" behind the shock; abstract: "The delayed neutrino-heating mechanism is emerging as a robust solution, but there remain many issues to address" | Abstract fetched; body text read through an HTML copy (ar5iv), first 100,000 characters (not the last 278); the PDF could not be converted to text |
| Janka and others (2007), *Theory of Core-Collapse Supernovae*, Phys. Rep. 442, 38, arXiv:astro-ph/0612072 | Abstract only: "the prompt bounce-shock mechanism is not the driver of supernova explosions"; "the delayed neutrino-heating mechanism can produce explosions…" in some stars; for more massive progenitors "still a puzzle" (2006, so older than the Burrows review) | Abstract fetched; the PDF could not be converted to text |
| NASA Space Place, "What is a light-year?" (spaceplace.nasa.gov/light-year/en/) | "A light-year is the distance light travels in one Earth year."; "When we use powerful telescopes to look at distant objects in space, we are actually looking back in time." | Fetched 2026-10-23 (the page returned 200) |
| CERN, Science in School, "Neutrinos, an introduction" (scienceinschool.web.cern.ch/article/2011/neutrinos) | "These tiny elementary particles travel through space at close to the speed of light and have no charge."; "It is neutrinos' weak interaction with matter that makes them almost impossible to detect"; "Supernova neutrinos are the result of the violent end of some stars, which explode and produce even more neutrinos than photons" | Fetched 2026-10-23 |
| NASA's own page on the stalled shock or neutrino heating | — | **None found** (three NASA pages fetched; none mention them). The claims rest on the two research reviews above |
| Chandra X-ray Observatory, Educational Materials, "Stellar Evolution", the death of a massive star (chandra.harvard.edu/edu/formal/stellar_ev/story/index11.html) | "The mass of the star's iron core approaches 1.4 solar masses - the Chandrasekhar Limit"; the core collapses "in less than a second" from about 8,000 km to about 19 km across, and a shock wave runs outward. It says **radiation pressure** can no longer support the core, not electron degeneracy pressure | Fetched 2026-10-23 (read through a summarising fetch, not verbatim) |
| Chandra, "Investigating Supernova Remnants", background (chandra.harvard.edu/edu/formal/snr/bg2.html) | "The mass limit for a white dwarf to remain in equilibrium between gravity and electron degeneracy pressure is 1.4 solar masses - the Chandrasekhar limit"; describes the shock wave. Does not say that an iron core is held up by electron degeneracy pressure, and does not describe electrons and protons combining | Fetched 2026-10-23 (read through a summarising fetch) |
| What holds up a massive star's iron core: electron degeneracy pressure | Two research-paper summaries seen in a search result (not opened) say the iron core is "mostly supported by electron degeneracy pressure" and that electron captures then reduce it. Chandra's two pages give the 1.4 Suns limit for the iron core and define that limit as the electron-degeneracy limit, but neither page says in one sentence that the iron core is held up by electron degeneracy pressure | **Partly sourced**: the 1.4 Suns limit for the iron core is backed by Chandra (the page text says "approaches"); the electron degeneracy wording rests on the pair of Chandra pages and on search summaries |
| Riess and others (2022), the Cepheid distance to M101: 6.85 ± 0.15 Mpc | Quoted in a search summary of a 2025 paper | **Not read** |
| ESA/Hubble and NASA pages on SN 2023ixf, a plain NASA page on neutrinos, SN 1987A's neutrino count | — | **Not found or not read** |

## Conflicts between sources, and how this specification handles them

| Conflict | Sources | Handling |
|---|---|---|
| **The proposal said a supernova "releases about as much energy as the Sun will in its whole life, but almost all of it leaves as neutrinos".** That is wrong by a large factor. The collapse frees about 360 Sun-lifetimes (4.3 × 10⁵³ erg against 1.2 × 10⁵¹); it is the *motion of the gas* that equals about one Sun-lifetime, and the *light* about one hundredth to one tenth. | The group proposal's Experiment 13 entry; the arithmetic of this specification | The objective is rewritten above. `00-group-proposal.md` is **not** edited without the owner's approval (§28.2); decision 2 asks. |
| **The star's mass.** About 8–10, 11–12, 12–14, 16–19 and 20 ± 4 solar masses. The 2026 A&A paper says dust can hide about 9 solar masses, which favours the higher end, but that is one paper's reading. | See the table | The page shows all estimates, with methods, without choosing (the status label says *Contested*). The tutor does not say which is right. |
| **The distance to M101.** 6.85 ± 0.15 Mpc (22.3 million light-years) against "21 million light-years" in ESA-related pages and reports. | Riess; ESA | The page uses 6.85 Mpc and says, in a note, that some pages round to 21 million (decision 5). |
| **The speed of the gas.** The paper *assumes* 50 km/s. | Jacobson-Galán 2023 | The page says "assumed", and the control varies it. |
| **Supernova type.** One search result calls it a "type II-L", other pages "type II", and the 2025 review "Type II". | Several | The page says "a Type II supernova" only (a star that kept its hydrogen); decision 7. |

## Facts that may change (re-check by the dates shown)

| Fact | Source | Checked | Why it may change |
|---|---|---|---|
| The star's mass estimates | the papers above | 2026-10-23 | New work (JWST late-time observations; a search for the star's disappearance) may narrow it |
| Whether the progenitor has been seen to be gone (the proof that it was the star that exploded) | Not found in this session's searches | **not checked** | A late-time "disappearance" paper would be strong evidence; it was not found and must be checked |
| No neutrinos reported from SN 2023ixf | IceCube and Super-Kamiokande summaries | 2026-10-23 | A reanalysis could change this |
| Energy estimates | (see above) | 2026-10-23 | New light-curve papers |

## Open items

- What holds up a massive star's iron core is only partly sourced (see the Sources table): Chandra gives the 1.4 Suns limit for the iron core but its page names radiation pressure, and no page read says "electron degeneracy pressure" for the iron core in one sentence; the wording on the page follows the standard account. The stall and neutrino heating rest on Burrows and Vartanyan (2021, read through an HTML copy) and Janka and others (abstract only), not on a NASA page.
- The SN 2023ixf radiated energy `L` is **not** read; the literature range (1–10) × 10⁴⁹ erg is generic.
- The Sun's whole-life energy (a 10-billion-year lifetime) and `L_sun` have no source read.
- The Riess distance, and the Kilpatrick, Van Dyk, Jencson and Qin mass values, were seen only in summaries.
- The 2026 A&A paper's authors, and whether other 2026 papers (the late-time Hubble paper, the JWST papers) change the picture, were not read.
- No plain NASA or ESA page was found for SN 2023ixf itself, for neutrinos or for SN 1987A's neutrinos.
- Whether the progenitor has been confirmed gone is unchecked.
- The claim that "no neutrinos were expected to be detected at this distance" has no source read.
- It has been checked in Chrome only (2026-10-23, see "Implementation Notes"); not in other browsers, at narrow widths, by keyboard or with a real learner.

## Decisions for the owner (each on a default; change any you like)

1. **The title.** Default: "Catching a supernova in the act: what exploded, and where did the energy go? (SN 2023ixf)". Alternative: the group proposal's "Catching a supernova in the act (SN 2023ixf)", shorter. (Neither title gives Prediction 1's answer.)
2. **The group proposal's wrong sentence.** Default: leave `00-group-proposal.md` as it is for now and correct it only when you approve (the proposal's "about as much energy as the Sun will in its whole life" would be changed to the numbers above).
3. **Radiated light.** Default: use the literature range (1–10) × 10⁴⁹ erg, with no control for it, until SN 2023ixf's own value is read. Alternative: read it at the paper before approving.
4. **The collapse energy formula.** Default: `GM²/R` (4.3 × 10⁴⁶ J), flagged as an order-of-magnitude estimate, as the group proposal's text says. Alternative: 3/5 GM²/R (2.6 × 10⁴⁶ J), which is closer to SN 1987A's measured 2–3 × 10⁵³ erg, but needs a justification (a uniform ball) that the learner does not have.
5. **The distance.** Default: 6.85 Mpc (22.3 million light-years) with a note that some pages say 21. Alternative: use 21 million light-years.
6. **The two predictions.** Default: P1 the visible share (four buttons), P2 the light-travel time (three buttons). Alternative for P2: the mass of the star (a range), or the gas's age.
7. **Whether to say "Type II".** Default: "a Type II supernova (a star that still had its hydrogen)" only, with no mention of II-L.
8. **The number of pictures and stages.** Default: three pictures, five stages. Alternative: split the energy picture into two.
9. **The mass-estimate picture.** Default: the seven earlier estimates and the 2026 paper's two ranges, with their methods, no verdict. Alternative: show only the two 2026 bands.
10. **Neutrinos.** Default: say that none were reported from SN 2023ixf and explain why, after a source check. Alternative: leave neutrinos as "a particle that carries energy away" and say nothing about detection.
11. **How many tutor parts.** Default: eight, as above.
12. **The status label.** Default: the four-part label above. Alternative: a shorter two-part label ("Strong evidence: a red supergiant exploded. Contested: its mass").

## Implementation Notes

**Built (2026-10-23):** physics model and tests (`src/physics/catchingASupernova.ts`, 41 tests), interface, two predictions, a five-stage run, three pictures, two controls, results with the reading guide, a "Words and formulas" panel, tutor (`CatchingASupernovaTutor.tsx`) and chapter summary. The group's rules of §29 (introduction, captions, "Want to know more?" links) are followed.

**Differences from this specification (approved by the owner on 2026-10-23, read from "approved" after they were listed; the owner has not yet said whether to keep or soften the iron-core wording, see the source table):**

1. **Two controls, not three.** The distance control was dropped at the owner's request on 2026-10-23. Table 4 has no distance rows and Picture 3's strip has no white mark. The module no longer has `distanceChoicesMpc` or the distance comparison fields.
2. **A fuller account of the explosion in the introduction**, as the owner asked on 2026-10-23: the iron core held up by electron degeneracy pressure, the collapse, the bounce, the stalled shock and the revival by neutrino heating, in three paragraphs, with a new "Electron degeneracy pressure" entry in the Words panel and the same account in the tutor's part 1. The ball-on-a-floor picture is kept for the bounce, and a motorway pile-up is used for the shock wave (the specification's "falling bricks" was not used).
3. **Extra links in "Want to know more?":** NASA Imagine the Universe, NASA HEASARC, the Chandra X-ray Observatory's stellar evolution page, and Burrows and Vartanyan (2021, a research review).

A full line-by-line comparison against this specification is part of the final review (§21 Step 10), which has not been done.

**Complete-flow test in Chrome (2026-10-23, in the Chrome browser, against the dev server):** all 12 prediction pairs (4 answers for the share of light by 3 for the light-travel time) were run to the end: the Run button was enabled once both were chosen, all five stages completed, the results and "Now try it yourself" appeared, the tutor asked its three questions (Continue stayed disabled until text was typed), the eight explanation parts appeared, each prediction was marked "matched" or "did not match" correctly for its own answer (only "About 1 part in 10,000" matches for Prediction 1 and only "About 20 million years" for Prediction 2), the two extra remarks for "A few months" and "About 20 thousand years" appeared only with those answers, and no script errors were logged. The chapter summary did not appear before the explanation (checked with saved progress cleared) and appeared after it, and the saved progress recorded the chapter as explained. All 27 control settings (3 core masses by 3 radii by 3 speeds) were set in turn and Table 4 was compared with a separate calculation: the energy (to the 2 significant figures shown), the light's share (within 0.05 percent), the two gas times (within 0.06 year) and the setting labels all agreed; with the settings back on the published values every row said "the same". The new introduction paragraphs rendered correctly in a screenshot.

**Final review (§21 Step 10, 2026-10-23).** Checked against `AGENTS.md`, the rules of `CLAUDE.md` and this specification:

- *Passed:* the introduction gives none of the answers to the predictions (no distance, age, share, mass or gas time); it says that predictions do not change the pictures or tables, and the controls box says so again; the results have the check-up, a note under each of the four tables, Table 4 with the published value and "how yours compares" columns, "trial values" wording and the predictions beside the results; the tutor follows observe, compare, conceptual question, explanation and marks the predictions only in the explanation; the three pictures have look-for lists of three parts; the status label has its four parts; all 15 links on the page return a page (the A&A link returns 403 to a script and has not been opened in a browser); `tsc` with `noUnusedLocals` and all 1,267 tests pass.
- *Physics tests:* sixteen deliberate breaks of the module (the energy formula, its radius unit, the erg factor, the Sun's lifetime, an inverted share, light-years per parsec, the gas-time formula, the km-to-cm factor, strict and one-sided overlap, a swapped range verdict, the Prediction 1 answer table, zero accepted as positive, a 365-day year, G): fifteen fail the tests, as they should. One survives: replacing the log distance in `nearestLog` by a plain distance gives the same answer for every input the experiment uses (43,104 is nearest to 10,000 either way), so no test could catch it and it does not change what the learner sees.
- *Findings (not yet fixed; each needs the owner's decision):* (1) Display arithmetic sits in the interface files, against §9 and the tutor file's own comment: the 3/5 factor for a uniform ball (`× 0.6`), `lightTravelYears / 2e4`, `× 100` for a percentage, the ±0.15 Mpc edges and its percentage, `outerCm / speedCmS` in the worked example, `massKg`, the Sun's power typed as 3.828e26 and `365.25 * 86400` (both already constants in the module), and `Math.round(.../1000) * 1000`. Experiment 12's review moved the same kind of arithmetic into the module. (2) This specification still says the estimates run "from about 8 to about 20 solar masses" (Overview, status label, Physical Situation, Expected Observations), while the page and the tests say 8 to 24 (Soraisam and others, 20 ± 4, reaches 24); the specification should be brought in line, with the owner's approval. (3) The Words panel has no entry for "solar mass" (the specification's list has it; "Initial mass" explains it in passing). (4) The module's `nearestLog` has no test that separates a log from a linear distance. (5) The iron-core source conflict (above) is open. (6) `CLAUDE.md` §27's table and "What Remains" do not yet list Experiment 13 as built.

**Review findings 1, 3 and 4 fixed (2026-10-23, at the owner's request):** (1) The display arithmetic moved into the physics module, with tests (`collapseWorkedExample`, `gasTimeWorkedExample`, `distanceRangeMpc`, `distanceUncertaintyPercent`, `lightTravelTimesLongerThan`, `lightOneInRangeOverCores`, and `SUPERNOVA.distanceUncertaintyMpc`); the interface and tutor now display those values, and the Sun's power and the year come from the module's own constants. Conversions of a share to a percentage and rounding for display (`toFixed`, nearest hundred or thousand) stay in the interface as formatting. (3) The Words panel has a "Solar mass" entry (new learner-facing wording, for the owner's approval). (4) `nearestLog` is exported and tested: 3,000 is nearest to 10,000 by powers of ten although a plain distance would choose 100, and the order of the answers does not matter. The module's tests are now 49 (all 1,275 pass); ten deliberate breaks of the new and changed functions, including the log-versus-linear one that survived before, are all caught. Checked in Chrome: the page loads, and the worked moment, the formula entries, the distance range, the nine-core range and the tutor's worked numbers show the same values as before. Findings 2, 5 and 6 are still open.

**Not checked:** other browsers, narrow widths, keyboard use, or a real learner; the text of the Table 1 to 3 notes and Pictures 1 and 3 against a separate calculation (the test covered Table 4 and the tutor flow); and the comparison with this specification (above).
