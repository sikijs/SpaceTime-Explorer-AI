# Experiment 22 (Frontier and Beyond): Does the Universe Hum? (Pulsar Timing Arrays)

**Status: PROPOSED by Claude on 2026-10-27 per `CLAUDE.md` §23 Stages 1 to 3, as the twenty-second experiment of the group (`00-group-proposal.md`, Part D, entry 22). The order (22 before 23) was decided by the owner on 2026-10-27. Specification APPROVED by the owner on 2026-10-27 ("approved", read as all twelve decisions on their defaults). Step 1 BUILT on 2026-10-27: the physics model and its tests (`src/physics/pulsarTimingBackground.ts` and `.test.ts`, 25 tests, checked by twelve deliberate breaks); it imports nothing, and the ruler for timing shifts runs from 0.01 nanoseconds so that the smallest button can be drawn. The LIGO reference (GW150914 from about 35 Hz to about 250 Hz) and the 1-millisecond example pulse period are held as data with no source read (to be checked). Not yet built: the interface, predictions, run, pictures, controls, results, tutor and chapter summary. Every number below that is marked "to be checked" has no source read. The facts about the published results come from search results and abstracts read on 2026-10-27 (see "Sources read"); no paper was read in full.**

## Overview

In Gravitational Waves Experiments 1 and 2 the learner saw that two orbiting black holes send out ripples in spacetime, and that the ripples get higher in pitch as the pair spirals in. LIGO hears pairs of black holes of a few tens of Suns, whose waves last a fraction of a second. But the universe also holds black holes a *billion* times heavier, in the centres of galaxies. When two such galaxies merge, their black holes can end up orbiting each other, very slowly, and the waves they send out have cycles that last *years*.

In 2023, teams that time radio pulses from spinning stars called pulsars reported evidence for exactly this: a faint, steady "hum" of very slow gravitational waves, probably from many pairs of supermassive black holes added together. The experiment asks three questions:

1. **How slow is the hum?** The learner works out how long one wave cycle lasts for a pair of billion-Sun black holes, and sees that it is about a year, millions of times slower than LIGO's.
2. **How can a wave that slow be seen?** The learner sees that a passing wave very slightly stretches and squeezes the space between us and a pulsar, so that its pulses arrive a few billionths of a second early or late, and that watching many pulsars for many years is the way to see it.
3. **What do the results show, and what not?** The evidence is at about 3 to 4 "sigma" (a measure of how sure a result is), not yet 5; it points to a background of waves rather than one pair; and what makes it is probably, but not certainly, supermassive black holes.

The model is **Kepler's law and two short formulas, calculated here, set beside the published results**. It does not model the pulsars' noise, the data analysis, or the black hole population.

## Learning Objective

By the end the learner can say, in their own words:

1. A pair of black holes in orbit sends out gravitational waves whose frequency is twice the orbital frequency, so one wave cycle lasts half an orbit (Gravitational Waves 1 and 2).
2. Wider orbits and heavier black holes mean slower orbits (Kepler's law, Gravity 6), so supermassive pairs far apart give waves of about a year per cycle, against LIGO's fraction of a second.
3. A pulsar is a spinning neutron star (Frontier and Beyond 15) whose pulses arrive with extraordinary regularity, so it works like a clock; a gravitational wave changes the length of the path from the pulsar, and so shifts the arrival times, by about ten billionths of a second.
4. A single pulsar cannot show this alone. The wave's signature is a pattern shared between pulsars that depends on the angle between them in the sky (the Hellings–Downs pattern).
5. The reported evidence is at about 3 to 4 sigma for the NANOGrav 15-year data, and has not been announced at 5 sigma; the combined analysis of all the arrays (IPTA DR3) is in preparation. This is evidence for a background, not a confirmed discovery, and its source is not yet settled.

## Physical Situation

Radio telescopes on Earth time the pulses of dozens of millisecond pulsars (pulsars that spin hundreds of times a second) for 15 years or more, each pulse's arrival time compared with a model of when it should come. Several teams do this (NANOGrav, EPTA with InPTA, PPTA, CPTA, MeerKAT) and they are now combining their data (IPTA). If a slow gravitational wave passes through the space between us and the pulsars, the arrival times drift in a way that is shared, in a particular pattern, between pulsars.

## Physics Model (`src/physics/pulsarTimingBackground.ts`, to be written)

| Part | What it computes | Source |
|---|---|---|
| **Kepler's law** | orbital period T = 2π √(a³ ÷ G(M₁ + M₂)) for two masses at separation a. By hand: two 10⁹-Sun black holes 0.01 pc apart give T = 2.09 years. | textbook; checked by hand 2026-10-27 |
| **Wave frequency** | f_GW = 2 ÷ T, so one wave cycle lasts T ÷ 2 (1.05 years, 30.3 nanohertz, for the example). | Gravitational Waves 1 and 2 (to be reused) |
| **The observing span** | the lowest frequency that a data set of length T_obs can pick out is about 1 ÷ T_obs (2.1 nanohertz for 15 years). A wave with less than one cycle in the span can appear only as a slow drift. | textbook; **to be checked** against the papers' own lowest frequency |
| **Size of the timing shift** | a rough estimate δt ≈ h ÷ (2π f), with the published strain h = 2.4 × 10⁻¹⁵ at f = 1 per year (NANOGrav 15-year): about 12 nanoseconds. | rough standard estimate, **to be checked** at a source |
| **Hellings–Downs pattern** | Γ(θ) = (3 ÷ 2) x ln x − x ÷ 4 + 1 ÷ 2, with x = (1 − cos θ) ÷ 2, the expected correlation between two pulsars an angle θ apart. | standard formula, **to be checked** at the papers |
| **Real results** | NANOGrav 15-year: about 3.5 to 4 sigma, strain 2.4 (+0.7, −0.6) × 10⁻¹⁵ at 1 per year, 67 pulsars; EPTA with InPTA about 3 sigma; PPTA about 2 sigma; CPTA about 4.6 sigma. Held as data. | abstracts and search summaries |
| **Trial values** | a trial pair's period, wave cycle and frequency from its masses and separation, and whether the cycle fits in 15 years. | arithmetic |
| **Answers** | the predictions' answers and nearest-answer helpers, and the tutor's marks. | arithmetic |

The module invents no new physics. **Not modelled** (the page must say so): the pulsars' own noise and the data analysis, how many pairs make the background and how they add, the black holes' masses and how they come to be so close, gravitational waves that carry away energy as the orbit shrinks (the orbit is treated as fixed over the 15 years, which is a fair approximation at these separations, **to be checked**), and the other explanations proposed for the signal (new physics in the early universe is named in the NANOGrav abstract).

## Learner Controls ("Now try it yourself", trial values)

1. **Mass of each black hole in the pair** (three buttons, for example 100 million, 1 billion and 10 billion Suns).
2. **Separation** (four buttons, for example 0.003, 0.01, 0.03 and 0.1 parsecs).

The drawing says its numbers are trial values, not real pairs (§14), and a pair's wave frequency is shown on a log ruler against the lowest frequency that 15 years can pick out.

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **Two black holes of a billion Suns each orbit 0.01 parsecs apart (about 2,000 times the Earth–Sun distance, to be checked). How long does one cycle of their gravitational wave last?** Six buttons balanced about 1 year on a log scale: about a minute, about a day, about a month, about a year, about a decade, about a century. Answer: about a year (1.05). Drawn as a white mark on a log ruler of cycle lengths, beside LIGO's and the pulsar-timing band (Picture 1).
2. **How much earlier or later does a pulse arrive because of the wave?** Five buttons on a log scale in billionths of a second (nanoseconds): about 0.1, 1, 10, 100, 1,000 (a millionth of a second). Answer: about 10 (12). Drawn as a white mark on a log ruler of timing shifts beside one pulse period (Picture 2).

The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only (§12, §13).

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)
Outline: what a gravitational wave is (a reminder of Gravitational Waves 1); what LIGO hears and why it hears only fast waves; where much heavier black holes sit and why two of them might orbit slowly; what a pulsar is (a spinning neutron star, from Frontier and Beyond 15, with a lighthouse comparison), why millisecond pulsars are such good clocks, and how a passing wave would shift their pulses; what "sigma" means (Frontier and Beyond 1); the learner's job; that the predictions never change the real pictures; the assumptions. Terms defined before use: *pulsar*, *millisecond pulsar*, *hertz and nanohertz*, *supermassive black hole*, *background*, *sigma*, *give-or-take*. Held back until after the run: Prediction 1's answer (about a year) and Prediction 2's (about ten billionths of a second) (§12). A "Want to know more?" list (§29): plain official pages (NANOGrav, NASA or ESA, the IPTA), each fetched and recorded below before wording is approved; the papers are listed after the run.

### Display (each picture with a "How to read this diagram" caption, a worked moment and a "Where the real picture comes from" line)
1. **Picture 1, the whole range of gravitational-wave cycles:** a log ruler of cycle length from a thousandth of a second to many years, with LIGO's black holes, the pulsar-timing band (from 1 ÷ 15 years up) and the example pair of billion-Sun black holes marked, and Prediction 1's white mark.
2. **Picture 2, a pulse and the wave:** a pulsar, the Earth and the path between them, with a wave stretching the path (exaggerated, and said to be), and a log ruler of timing shifts from a tenth of a nanosecond to a millisecond, with the calculated shift, one pulse period and Prediction 2's white mark.
3. **Drawing A (follows the controls):** the trial pair's wave frequency on a log ruler beside the lowest frequency 15 years can pick out, with its cycle length and the number of cycles in 15 years.

### Run
Six stages: the pair; its orbit and wave; the cycle length; LIGO's band; the pulsar-timing band; the pulse and its shift. The guesses appear once the feature beside them is drawn (§14).

### Results (neutral, then explained by the tutor)
A check-up table (the calculated cycle and frequency for the example pair beside the published pulsar-timing band, and the calculated timing shift beside the published strain; the five arrays' reported significance), then two more tables (the steps from masses and separation to frequency; the Hellings–Downs values at several angles), each with a "What this table tells us" note (§14). The predictions beside the results, with a tag on the row. No "right" or "wrong". The optional table of trial values is left out unless the owner asks.

### Tutor (Part 4)
Predict, observe, compare, explain (§13): why heavier, wider pairs give slower waves (a playground swing: longer chains swing more slowly); why the wave cycle is half an orbit; how a shift of ten billionths of a second can be seen by watching for years; why it takes many pulsars (a crowd's murmur compared with one voice) and what the Hellings–Downs pattern adds; why this is evidence and not yet a discovery; what is and is not shown (the source is likely, not proven, to be supermassive black holes).

## Expected Observations
The example pair's wave cycle lasts about 1.05 years (30 nanohertz); a 15-year data set can pick out waves down to about 2.1 nanohertz; the timing shift is about 12 nanoseconds; NANOGrav's evidence is about 3.5 to 4 sigma and no array has announced 5.

## Expected Learner Understanding
That gravitational waves come in a huge range of pitches, set by the size and mass of the orbit; that pulsars can act as a galaxy-sized detector for the slowest ones; and that a "hum" is evidence from many sources and many pulsars together, with its own give-or-take, not a single clear signal like LIGO's.

## New Concepts Introduced
Pulsar, millisecond pulsar, pulsar timing, nanohertz, supermassive black hole binary, gravitational-wave background, the Hellings–Downs pattern.

## Relationship to Previous Experiments
Gravitational Waves 1, 2 and 4 (waves, the chirp, real events), Gravity 6 (orbits and Kepler's law), Frontier and Beyond 15 (neutron stars, which are what pulsars are), Frontier and Beyond 1 (sigma and give-or-take), Frontier and Beyond 21 (black holes at other scales).

## Relationship to Later Experiments
Experiment 23 (how fast a black hole can grow) asks how black holes become so heavy so early; this experiment is where the learner meets pairs of heavy black holes.

## Required Physics Tests (each must fail when the module is deliberately broken)
1. The orbital period of two 10⁹-Sun black holes 0.01 pc apart is 2.09 years (± 0.01), worked separately in SI units.
2. The period rises as the separation to the power 3 ÷ 2 and falls as the square root of the total mass (doubling each).
3. The wave frequency is twice the orbital frequency, and a wave cycle is half an orbit: 1.05 years and 30.3 nanohertz for the example.
4. The lowest frequency a span can pick out is 1 ÷ span: 2.1 nanohertz for 15 years.
5. The estimated timing shift is about 12 nanoseconds for 2.4 × 10⁻¹⁵ at 1 per year, and rises in step with the strain.
6. The Hellings–Downs function is 0.5 at 0 degrees, its lowest value (about −0.152, worked by hand on 2026-10-27) at about 82.5 degrees and 0.25 at 180 degrees, **to be checked** against the published curve.
7. A prediction's answer helper returns "about a year" and "about 10 nanoseconds"; the nearest-answer helpers pick the closest button on the log scale.
8. Trial values: a pair with the example's masses and separation reproduces the example's results, and a wave with less than one cycle in 15 years is flagged.
9. The published results are held as listed (3.5 to 4, about 3, about 2, about 4.6 sigma; 2.4 × 10⁻¹⁵).
10. The module does not change when predictions change (separation, §9, §14).

## Sources read (2026-10-27)
| Source | What was read | Status |
|---|---|---|
| NANOGrav 15-year "Evidence for a Gravitational-Wave Background" (arXiv:2306.16213) | abstract: about 3.5 to 4 sigma, strain 2.4 (+0.7, −0.6) × 10⁻¹⁵ at 1 per year, 67 pulsars, Bayesian evidence above 10¹⁴, consistent with supermassive black hole binaries or new early-universe physics | abstract only |
| Yu and Allen, five-array search (arXiv:2512.08666, submitted December 2025, revised April 2026) | abstract: 121 pulsars from five arrays; significance "remains below the conventional 5σ threshold"; consistent with a nonzero background; not the IPTA DR3 | abstract only |
| "Pulsar timing arrays: the emerging gravitational-wave landscape" (arXiv:2603.13643, March 2026) | abstract: "evidence for a nanoHertz gravitational wave background"; does not mention IPTA DR3 | abstract only |
| NANOGrav "Piecewise power-law reconstruction" (arXiv:2601.09481, January 2026) | abstract: still the 15-year data | abstract only |
| search summary of a comparison of the arrays' results | NANOGrav 3 to 4, EPTA with InPTA about 3, PPTA about 2, CPTA about 4.6 sigma | summary only |
| search summaries of IPTA DR3 pages | IPTA DR3 is "in preparation" (121 pulsars from five arrays, with CHIME, LOFAR, NenuFAR) and is "expected to" give the first definitive detection; no 5-sigma announcement was found | search summary only; not exhaustive |
| NANOGrav 20-year data set | a search found no result | not found |

## Facts that may change (§29)
| Fact | Why it may change |
|---|---|
| "no array has announced 5 sigma" | IPTA DR3 may be released at any time; repeat the search just before the wording is approved |
| the sigma values of each array | a later analysis may revise them |
| "no NANOGrav 20-year result" | a search found none; it may exist |

## Open items
a. No paper was read in full; the numbers come from abstracts and summaries.
b. The formula for the timing shift, the Hellings–Downs formula, the 1 ÷ span lowest frequency and the "orbit fixed over 15 years" approximation have no source read.
c. The 0.01 parsec example separation and the claim that it is about 2,000 Earth–Sun distances are arithmetic, not sourced; whether real pairs sit at such separations is not claimed.
d. A plain official page for each background idea (pulsar, pulsar timing, supermassive black holes) is to be found and fetched before the wording is approved (§29 rule 3).
e. The proposed 2026 IPTA DR3 check is repeated before the wording is approved.

## Decisions for the owner (each with a default)
1. **Status label:** Strong evidence (a background of slow gravitational waves, at about 3 to 4 sigma, not yet 5); Open (what makes it, probably supermassive black holes). Default: as above.
2. **Model:** Kepler's law, the frequency doubling, a rough timing-shift estimate and the Hellings–Downs formula, with the data analysis and the black hole population not modelled. Default: yes.
3. **Two predictions** (how long one wave cycle lasts; the size of the timing shift) with six and five buttons. Default: yes.
4. **Number of pictures:** two pictures and one drawing that follows the controls. Default: yes.
5. **Controls:** the mass of each black hole and the separation. Default: yes.
6. **Results:** a check-up and two more tables (steps to frequency; Hellings–Downs values); no table of trial values. Default: yes.
7. **Hellings–Downs** appears only in the results and the tutor, as a table and an explanation, not as a picture. Default: yes.
8. **The timing-shift estimate** (about 12 nanoseconds) is used, labelled as a rough estimate, until a source is found. Default: yes.
9. **A 2026 search** for newer results (IPTA DR3, NANOGrav 20-year) is done now (2026-10-27, above) and repeated before the wording is approved. Default: yes.
10. **Tutor:** the standard four-step sequence. Default: yes.
11. **Introduction length and links:** long and detailed, to §29. Default: yes.
12. **Title** "Does the universe hum?" (it does not give away either prediction). Default: keep.
