# Experiment 22 (Frontier and Beyond): Does the Universe Hum? (Pulsar Timing Arrays)

**Status: PROPOSED by Claude on 2026-10-27 per `CLAUDE.md` §23 Stages 1 to 3, as the twenty-second experiment of the group (`00-group-proposal.md`, Part D, entry 22). The order (22 before 23) was decided by the owner on 2026-10-27. Specification APPROVED by the owner on 2026-10-27 ("approved", read as all twelve decisions on their defaults). Step 1 BUILT on 2026-10-27: the physics model and its tests (`src/physics/pulsarTimingBackground.ts` and `.test.ts`, 25 tests, checked by twelve deliberate breaks); it imports nothing, and the ruler for timing shifts runs from 0.01 nanoseconds so that the smallest button can be drawn. The LIGO reference (GW150914 from about 35 Hz to about 250 Hz) and the 1-millisecond example pulse period are held as data with no source read (to be checked). Step 2 BUILT on 2026-10-27: the interface skeleton and introduction (`src/components/PulsarTimingBackgroundExperiment.tsx`, wired into `src/App.tsx` with a placeholder summary): the status line, an introduction (the question, much heavier black holes, what a pulsar is, why pulsars make good clocks, how a wave could change the pulses, a hum and not a single voice, how sure the result is, what is and is not modelled), eleven defined terms in the collapsed "Words and formulas" panel and a "Want to know more?" list of two NASA pages; the wording was approved by the owner on 2026-10-27 ("wording approved"). Held back until after the run: Prediction 1's and 2's answers, the word "nanohertz" and "strain", and the Hellings-Downs pattern; NANOGrav's own pages (they say "years to decades", which gives away Prediction 1) and the IPTA page are listed after the run, with the papers. Step 3 BUILT on 2026-10-27: the two predictions (Part 1: six buttons for the length of one wave cycle, about a minute to about a century; five buttons for the shift in a pulse's arrival time, 0.1 to 1,000 nanoseconds), a "What you will do" paragraph in the introduction, "Parsec" and "Nanosecond" entries in the Words panel, and a Run that only records the guesses; the wording was approved by the owner on 2026-10-27 ("wording approved"). Prediction 2 gives the learner the published strain (about 2.4 parts in a million billion) and no cycle length, because giving the cycle length would reveal Prediction 1's answer. Step 4 BUILT on 2026-10-27: the run (five stages so far: the pair; its orbit and wave; one wave cycle on a ruler; LIGO's waves; what 15 years of timing can pick out) and Picture 1 (panel A, a sketch of the pair with its orbit and wave, and panel B, a log ruler of the length of one wave cycle from 1 millisecond to 100 years, with the pair's cycle in cyan, LIGO's first event in orange, the band that 15 years can pick out in cyan fading to the left, and Prediction 1's guess as a white marker and box), with `pictureOne()` and 6 more tests in the module (31 in all, checked by seven deliberate breaks); the LIGO range (35 to 250 Hz) is now sourced to the abstract of the discovery paper (Phys. Rev. Lett. 116, 061102, read 2026-10-27); the caption wording and the picture were approved by the owner on 2026-10-27 ("wording approved"). The fade on the left of the band is a fixed drawing choice, because the shortest cycle that can be picked out (set by how often the pulsars are timed) is not modelled. Step 5 BUILT on 2026-10-27: Picture 2 (stage 6 of the run, now six stages): panel A, a sketch of a pulsar, the Earth and the pulse's path with and without a wave (the stretch hugely exaggerated), and panel B, a log ruler of the shift in arrival time from 0.01 nanoseconds to 10 milliseconds, with the calculated shift (12.1 ns) in cyan with a pale band for the published strain's give-or-take (9.0 to 15.6 ns), an example pulse every millisecond in pink (imagined, as it has no source) and Prediction 2's guess as a white marker and box; `pictureTwo()` and 4 more tests in the module (35 in all, checked by seven more deliberate breaks); the caption wording and the picture were approved by the owner on 2026-10-27 ("Picture 2 wording approved"). The caption's worked moment shows the rough estimate h ÷ (2 pi f) with its numbers and says it is a rough standard estimate, not a result from a paper. Step 6 BUILT on 2026-10-27: the "Now try it yourself" controls (Part 2): two sets of buttons (the mass of each black hole, 100 million, 1 billion or 10 billion Suns; the separation, 0.003, 0.01, 0.03 or 0.1 parsecs, each labelled with its size in Earth–Sun distances from `separationAu()`, with 2 more tests, 37 in all) and Drawing A, a log ruler of the trial pair's wave frequency (0.1 to 10,000 nanohertz) against the band that 15 years can pick out (cyan) and Picture 1's pair (cyan dashed), with the trial pair in pink as imagined, a readout of its cycle length and cycles in 15 years, and a caption with a worked moment, two "what to look for" items and a "Where the real picture comes from" line; checked in Chrome at three settings (the default, 100 million Suns at 0.1 parsecs, 10 billion Suns at 0.003 parsecs); the wording was approved by the owner on 2026-10-27 ("wording approved", after the cyan band and dashed-line bullets were rewritten more plainly). Step 7 BUILT on 2026-10-27: the results (Part 3): a "Where this stands" card, the predictions beside the results (guesses only, never marked, tagged on the Table 1 and Table 2 rows), a "How to read these results" paragraph, Table 1 (a check-up: the example pair's cycle, frequency and timing shift beside the published strain and the rough rule for the lowest frequency, with the four arrays' reported significance in the last rows), Table 2 (the steps from masses and separation to the wave) and Table 3 (the Hellings–Downs values at several angles, with the lowest point), each with a "What this table tells us" note, and a list of papers and pages after the run; the numbers come from `resultsCheckUp()`, `exampleSteps()` and `hellingsDownsRows()` in the module (42 tests, 5 more, checked by eight deliberate breaks); checked in Chrome with one pair of guesses; the wording was approved by the owner on 2026-10-27 ("approved"). Differences from this specification: the check-up holds four arrays' significance (NANOGrav, EPTA with InPTA, PPTA, CPTA; the specification said five, but MeerKAT has no value held), the significance rows sit inside Table 1 and not in a table of their own, and the Prediction 1 tag is on Table 2 as well as Table 1. Step 8 BUILT on 2026-10-27: the tutor (Part 4, `src/components/PulsarTimingBackgroundTutor.tsx`, wired into the experiment page with the `onComplete` and `onTutorComplete` props that the other experiments have, which this page lacked until now): a Part 4 lead of three bullets, then three questions (what you see in Pictures 1 and 2, compare your guesses with the real results, and how a wave could be told from a pulsar's own drift) and an eight-part explanation (your predictions marked as matched or not matched, why the wave is slow, why a cycle is half an orbit, how a 12 ns shift can be seen, why many pulsars and the Hellings–Downs pattern, why this is evidence and not a discovery, what the background is and is not known to be, how sure we are, what was and was not shown); every number comes from the module (`pictureOne`, `pictureTwo`, `resultsCheckUp`, `exampleSteps`, `trialPicture`, `hellingsDownsRows` and the guess helpers), with no new function; checked in Chrome with one pair of guesses (both matched) through all three questions to the explanation; the wording was approved by the owner on 2026-10-27 ("approved"). Tutor claims with no source read: the Earth's and Neptune's years, the dumbbell explanation of why a cycle is half an orbit, the clock that gains a second a day (86,400 seconds), averaging cancelling each pulse's wobble, that a wave shifts all the pulsars "in a shared way", and LIGO's black holes being "a few tens of Suns". Step 9 BUILT on 2026-10-27: the chapter summary (`pulsarTimingBackgroundSummary()` in `src/App.tsx`, every number read from the module, shown after the tutor's explanation, with this experiment's "What's next" kept as "None yet, because Experiment 23 has no approved specification"), and Experiment 21's "What's next" changed to point here without giving away Prediction 1's answer; checked in Chrome for this experiment's summary (Experiment 21's changed line is checked by the type check only); both texts were approved by the owner on 2026-10-27 ("approved"). Step 10 DONE on 2026-10-27: complete-flow tested in Chrome (all 30 prediction pairs and all 12 control settings against a separate calculation) and finally reviewed; the review's fixes are committed (`d8b2c15`) and its differences from this specification are listed under "Implementation Notes" below and were approved by the owner on 2026-10-27 ("approved"). Every number below that is marked "to be checked" has no source read. The facts about the published results come from search results and abstracts read on 2026-10-27 (see "Sources read"); no paper was read in full.**

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
| NASA "Pulsars" (science.nasa.gov/mission/hubble/.../hubble-pulsars/) | page loads; pulsars are spinning neutron stars whose beams sweep like a lighthouse; the fastest, spinning hundreds of times a second, are millisecond pulsars | read in summary; linked before the run |
| NASA "Pulsars" (re-fetched 2026-10-27 for how beams are made) | "A pulsar's beams emanate from its magnetic poles, which may form randomly and independently of the rotational poles"; the field "channels and accelerates charged particles until they are moving at close to the speed of light", streaming along field lines; "A pulsar dies out when its electric fields are no longer strong enough to generate beams" | read in summary; linked before the run |
| NRAO "Pulsars" (public.nrao.edu/radio-astronomy/pulsars/, 2026-10-27) | page loads; the collapsing star's "magnetic field bunches up and becomes super concentrated, super strong"; the magnetic poles "act like fountains" for charged particles; the fountains turn with the star "like an interstellar lighthouse beam"; we see a pulse as the beam sweeps past | read in summary; linked before the run |
| "How the particles make radio waves is not fully understood" (intro) | only supported by the titles of arXiv papers proposing candidate mechanisms for coherent radio emission (search results, 2026-10-27); neither page above says it | not source-checked |
| Electric force "near the surface" and the "torch" comparison (intro) | general explanation; neither page gives it in these words | not source-checked |
| NASA "Black Holes" (science.nasa.gov/universe/black-holes/) | page loads; most Milky Way-sized galaxies have monster black holes at their centres, ours Sagittarius A* at 4 million Suns | read in summary; linked before the run |
| NANOGrav 15-year paper (arXiv:2306.16213, re-fetched 2026-10-27) | the abstract: "approx. 3.5 - 4σ", strain 2.4 (+0.7, −0.6) × 10⁻¹⁵, 67 pulsars, and "The correlations follow the Hellings-Downs pattern expected for a stochastic gravitational-wave background" (used in Table 3's note) | abstract only; linked after the run |
| Yu and Allen (arXiv:2512.08666, re-fetched 2026-10-27) | 121 pulsars from five arrays; significance "remains below the conventional 5σ threshold" | abstract only; linked after the run |
| nanograv.org/science/topics/low-frequency-gravitational-waves, /science/topics/pulsars-cosmic-clocks and /15yr/Summary; ipta4gw.org (2026-10-27) | the three NANOGrav URLs read from the Science page's links; ipta4gw.org is titled "A Global, Galactic-Scale Gravitational Wave Detector", names five member arrays (APT, EPTA, NANOGrav, InPTA, PPTA) and mentions DR2 as the latest release | linked after the run; the NANOGrav pages were not individually re-read |
| NANOGrav "Science", "Low-Frequency Gravitational Waves", "Pulsars as Cosmic Clocks" and "15-Year Publications' Summaries" (nanograv.org) | all four load; pulsar timing looks for changes in light travel time from space being stretched and squeezed; the background is from supermassive black hole pairs at the cores of merged galaxies; waves with periods of years to decades; millisecond pulsars approach the stability of the best atomic clocks; the 15-year result is evidence | read in summary; to be linked after the run |
| IPTA home page (ipta4gw.org) | page loads; five arrays combined; DR2 is the most recent release mentioned, with no news of DR3 | read in summary; to be linked after the run |
| 1 to 10 ms as the period of a millisecond pulsar | from a search summary only, not a page | not used on the page |

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

## Implementation Notes (final review, 2026-10-27)

The experiment is built as four parts: the introduction and Part 1 (two predictions, a six-stage run, Pictures 1 and 2), Part 2 (Now try it yourself, Drawing A), Part 3 (the results) and Part 4 (the tutor), with a chapter summary. Differences from the specification above, for the owner's approval (approved 2026-10-27, "approved"):

1. **Two panels in each picture.** Picture 1 and Picture 2 each have a panel A (a sketch: the pair with its orbit and wave; the pulsar, the Earth and the path with and without a wave) and a panel B (the log ruler). The specification described only the rulers. The sketches are not to scale, and say so.
2. **Picture 2's ruler** runs from 0.01 nanoseconds to 10 milliseconds, not "a tenth of a nanosecond to a millisecond", so that the smallest button and the example pulse can both be drawn (decided in Step 1).
3. **The fade on Picture 1's band.** The left edge of the cyan band fades out to a fixed place, because the shortest cycle that can be picked out depends on how often the pulsars are timed and is not modelled.
4. **The example pulse every millisecond** (the pink line in Picture 2) is imagined for the question and has no source; it is labelled so.
5. **Results.** Four arrays' significance, not five (NANOGrav, EPTA with InPTA, PPTA, CPTA; MeerKAT has no value held), in rows at the end of Table 1 and not in a table of their own; Prediction 1's tag is on Table 2 as well as Table 1; and a "Where this stands" card was added at the top.
6. **Two paragraphs added to the introduction at the owner's request (2026-10-27):** why a neutron star beams (strong magnetic field, tilted axes, particles streaming from the magnetic poles; sourced to NASA and NRAO, with the radio-emission step marked as not fully understood and not source-checked) and why pulses must be timed for years. An NRAO link was added to "Want to know more?", and a sentence to Prediction 2 saying the choices are sizes of the shift, early or late.
7. **The Words panel** has thirteen entries, not eleven ("Parsec" and "Nanosecond" were added in Step 3).
8. **Links after the run:** the NANOGrav 15-year paper, Yu and Allen's five-array search, three NANOGrav pages and the IPTA home page. The EPTA, PPTA and CPTA papers are not linked, because none was read; the March 2026 review (arXiv:2603.13643) is not linked, because it was read only in its abstract.
9. **Tutor.** The playground swing in the specification's outline was replaced by the Earth and Neptune for "wider means slower"; a dumbbell and a two-bladed fan were added for "a cycle is half an orbit"; a clock that gains a second a day was added for the size of the shift. The tutor marks each prediction as matched or not matched in its explanation only. Its explanation has eight parts, and it does not give the cause of the background as settled.
10. **Progress props.** The experiment now takes `onComplete` and `onTutorComplete`, like the others, which Step 2 had not included.
11. **Chapter summary and "What's next".** The summary is one paragraph, read from the module. Experiment 21's "What's next" now points here (without giving away Prediction 1's answer); this experiment's "What's next" stays "None yet, because Experiment 23 has no approved specification".
12. **Review fixes (2026-10-27, `d8b2c15`).** Drawing A's "one cycle every 31.7 years" is now computed by `nanohertzCycleYears()` in the module (it was typed); the Words entry for a pulsar says "near its magnetic poles", as the introduction does; a trial pair's cycle under 10 years is shown to two decimals so that it agrees with the tables.

**What was checked.** All 30 prediction pairs (six cycle buttons by five shift buttons) ran to the end with Parts 2, 3 and 4 shown; the tables were identical for every pair apart from the tags; each guess moved its white marker; the tutor's matched or not matched marks agreed with a separate calculation in every pair (only "about a year" with "about 10 nanoseconds" matched both); all 12 control settings of Drawing A (frequency, cycle length, cycles in 15 years and the can-or-cannot-be-picked-out verdict) agreed with a separate Kepler calculation to the precision shown; all nine links load (HTTP 200); no pre-run text gives away either answer. The stage timer was shortened to 60 ms for the test and restored to 2,600 ms.

**What was not checked.** Narrow widths (the browser window would not resize, so no width below about 1,290 px was seen); other browsers; keyboard use; a real learner; the "did not match" wording in the tutor was exercised in the test but not read by eye in every case.

**A search repeated on 2026-10-27** (decision 9): no 5 sigma announcement, no IPTA DR3 result and no NANOGrav 20-year result were found; a comparison paper puts the 2023 results at "2σ to 4σ, depending on the dataset", which agrees with the page. The CPTA's 4.6 sigma, the EPTA's 3 and the PPTA's 2 remain from a search summary, not a paper.

**Open items added by the review.** The tutor's unsourced comparisons (the Earth's and Neptune's years, the dumbbell explanation, the clock gaining a second a day, averaging cancelling each pulse's wobble, a wave shifting all the pulsars "in a shared way", LIGO's black holes being "a few tens of Suns"); the Words panel's reference values (a parsec is about 3.26 light-years, light travels about 30 centimetres in a nanosecond) are typed, not computed; and the sidebar numbers this chapter "21" because Experiment 16 was dropped (the page itself says Experiment 22).
