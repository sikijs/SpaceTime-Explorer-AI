# Experiment 20 (Frontier and Beyond): Black Holes That Should Not Exist: The Heaviest Merger (GW231123)

**Status: Specification APPROVED by the owner on 2026-10-26 ("approve as is", read as all twelve decisions on their defaults). PROPOSED by Claude on 2026-10-26 per `CLAUDE.md` §23 Stages 1 to 3, as the twentieth experiment of the group (`00-group-proposal.md`, Part D, entry 20). Nothing is implemented, and no code or learner-facing wording has been written. Every number below comes from an abstract, a search summary or a partial fetch on 2026-10-26 (see "Sources read"); the discovery paper (arXiv:2507.08219) could not be read: its HTML copy opened with about 100,000 characters of author affiliations and the PDF could not be converted here. Decisions for the owner are at the end; each has a default.**

**Corrections and checks against the group proposal.**

1. **The masses.** The proposal says "about 100 and 140". LIGO's detection page says the same, and LIGO's science summary says "approximately 137 and 103", with a total "likely between 190 and 265" and a final mass "likely between 182 and 251". A search summary of the paper's abstract gives **137 (+22, −17) and 103 (+20, −52) Suns** (90% ranges), so the lighter hole's range is wide and runs down to 51. The page will use **137 and 103**, say they are source-frame values with wide ranges, and call "about 100 and 140" the rounded form.
2. **"Both lie in the mass gap."** Not quite as the proposal puts it: LIGO's summary says the **lighter one has an 83 percent chance** of lying in the gap. The page must say "very probably the heavier one, and probably the lighter one".
3. **The gap itself.** LIGO's summary quotes "approximately 60 and 130 solar masses". The same collaboration's 2025 catalogue analysis (GWTC-4.0, through search summaries only) puts the gap's **lower edge at about 44 Suns (+5, −4)**, and a Monash University article (2 April 2026) says black holes above about 45 Suns are "unexpectedly rare". These do not conflict (one is a prediction from theory, one a measurement), but the page must not draw the gap at one fixed pair of numbers without saying so. See "Conflicts between sources".
4. **"The spins".** The paper's spins are **0.90 (+0.10, −0.19)** and **0.80 (+0.20, −0.51)** (search summary). The lower range reaches 0.29, so "both spinning near the limit" is the best-fit reading, not a certainty. LIGO's summary says "almost as fast as black holes can theoretically spin".
5. **"A simple merger's remnant spins about 0.69".** The proposal flagged "to be checked". A search summary says that numerical relativity gives a maximum spin parameter of about **0.686** for two equal, non-spinning black holes (a result near gr-qc/0701164, **not read**). GW250114's remnant (Experiment 18) spun at 0.68, with initial spins at most about 0.25, which is consistent. The page must say the 0.69 is a published numerical result, not one derived here.
6. **The origin is not settled, and the 2026 papers disagree.** See "What the sources say about its origin".

**Status label proposed for the learner (as of October 2026):** *Strong evidence* that GW231123 is the heaviest merger seen in gravitational waves, with black holes much heavier and faster-spinning than usual (the numbers have wide ranges, and the heaviest mass depends on the analysis); *Open* what made them. Not *Settled* and not *Contested* alone: the measurement is firm for a gravitational-wave event of this kind, but at least four explanations are alive (earlier mergers, a primordial origin, a lensing reading that lowers the mass, and two overlapping signals), and the papers disagree about how likely each is.

---

## Overview

Black Holes Experiment 9 explained how a star's core becomes a black hole, and Experiment 17 of this group showed that some stars may become black holes without a bright explosion. This experiment asks about the **other end of the scale**: black holes that are too heavy to have come from a single star. Theory says stars between a certain core mass and a larger one blow themselves apart completely, leaving nothing, so black holes in a "gap" of masses should be rare or absent. GW231123 (detected 23 November 2023, announced 14 July 2025) is a merger of two black holes of about 137 and 103 Suns that made one of more than 225, and both were probably spinning very fast.

The experiment asks three questions:

1. **Can the arithmetic of merging explain a gap black hole?** Two black holes that are each below the gap merge into one that is inside it: the learner adds, takes off the energy sent out as waves, and sees which zone the result lands in.
2. **What does the spin say?** A merger of two non-spinning black holes of equal mass leaves a remnant spinning at about 0.69. The measured spins, 0.90 and 0.80, are faster, so a simple merger history is not the whole story.
3. **What is known and what is not?** What was measured (masses, spins, with their give-or-take), what was calculated here (merger arithmetic), and what is only proposed (four explanations), so that the learner does not mistake a proposal for an observation.

The model is **simple arithmetic and one published spin figure, calculated here, set beside the measured values**. It does not simulate the stars, the clusters or the waveform, and it does not decide between the explanations.

## Learning Objective

By the end the learner can say, in their own words:

1. A star that is massive enough can explode so completely (a pair-instability supernova) that it leaves no black hole, so black holes in a range of masses (the "gap", roughly 44 to 130 Suns depending on the source) are not expected to form from single stars.
2. GW231123's black holes, about 137 and 103 Suns, are in or above that range, so they probably did not come straight from single stars.
3. Merging adds masses minus a few percent sent out as gravitational waves, so two black holes below the gap can make one inside it, and repeating this climbs through the gap and out the other side.
4. A merger of two non-spinning black holes leaves a remnant spinning at about 0.69; GW231123's best-fit spins of 0.90 and 0.80 are higher, which is a clue and a puzzle for the "earlier mergers" explanation, not a proof of any one explanation.
5. The origin of GW231123 is **open**: earlier mergers, primordial black holes, lensing and overlapping signals have each been proposed, and the sources disagree on how likely each is.

## Physical Situation

Two black holes, about 137 and 103 Suns (source frame, wide ranges), spinning fast, merge at a redshift of about 0.39 (+0.27, −0.24), so a distance known only roughly (0.7 to 4.1 gigaparsecs, from a search summary; see open item a). The detectors see a short, loud signal (signal-to-noise about 22.5) lasting about 0.1 s, from a merger so heavy that the detectors catch mostly the last few cycles. The result is a black hole of more than 225 Suns.

## Physics Model (`src/physics/heaviestMerger.ts`, proposed)

| Part | What it computes | Source |
|---|---|---|
| **The real event** | the published masses 137 and 103, the total range 190 to 265, the final range 182 to 251 (best fit more than 225), the spins 0.90 and 0.80 with their ranges, the redshift 0.39 (+0.27, −0.24), the signal-to-noise ratio of about 22.5, the dates, and the 83 percent figure. Held as data. | search summaries of the paper's abstract and LIGO's summary and detection pages |
| **The gap** | `zoneOf(mass)`: below the gap, in the gap or above it, for a gap of 60 to 130 Suns (the theory edges LIGO's summary quotes), and the lower-edge measurement 44 Suns (+5, −4) held as a second marker. | LIGO summary (read); GWTC-4.0 catalogue figures (search summaries) |
| **Merging** | `merge(m1, m2, share)`: `m1 + m2 − share × (m1 + m2)` with `share` = 5 percent of the total, taken from the equal-mass non-spinning case. For example 40 + 40 gives 76. | arithmetic; the 5 percent is **assumed from GW250114's 4.7 percent (Experiment 18)** and must be checked |
| **Climbing** | `ladder(m, generations)`: the mass after 1, 2, 3 generations of equal mergers (30 gives 30, 57, 108.3, 205.8; 20 gives 20, 38, 72.2, 137.2, 260.7), and how many original black holes this took (2^n). | arithmetic |
| **Remnant spin** | 0.686 for two equal non-spinning black holes, held as published data, and the gap to the measured spins (0.90 − 0.69 = 0.21; 0.80 − 0.69 = 0.11). | numerical relativity (search summary only; **to be read**) |
| **Trial values** | the learner's mass (each of two equal black holes) and number of generations give the mass and the zone by the formulas above. | same |
| **Answers** | the predictions' answers and nearest-answer helpers. | arithmetic |

The module invents no new physics. It imports the speed of light or solar units from earlier modules only where needed. How fast the real remnant spin changes for unequal masses or for spinning black holes is **not modelled** and the page must say so.

## Learner Controls ("Now try it yourself", trial values)

1. **Mass of each of the two black holes before the merger** (for example 20, 30, 40, 50 Suns, all below the gap).
2. **How many rounds of merging** (1, 2, 3, 4; each round merges equal black holes made in the round before).
The drawing that follows the controls says its numbers are trial values and not what GW231123 did (§14).

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **Can two black holes that each formed from a single star and sit below the gap merge into one inside the gap?** Buttons: no, yes, not sure (a marker only, as yes or no has no size). Answer: yes (for example two black holes of 40 Suns make about 76). Drawn as a white marker on the mass ruler (Picture 1).
2. **If two black holes of equal mass that are not spinning merge, how fast does the new black hole spin?** Six buttons balanced about the answer, **about 0.69** (for example 0.1, 0.3, 0.5, 0.7, 0.9, 0.99). Drawn as a white mark on the spin scale (Picture 2) beside GW231123's measured spins.
The guesses are drawn in white on the real pictures and never change them; the tutor marks each one in its explanation only (§12, §13).

## Experiment Behavior

### Introduction (to be drafted to §29 and §14 once approved)
Outline: what the "gap" is and why (a pair-instability supernova, with a plain comparison such as a pot that boils over and blows its own lid off, to be checked for fit); that most stars leave a black hole and the very heaviest stars leave nothing; Experiments 9 and 17 as the background; what the detectors measured on 23 November 2023 and that the masses and spins have wide ranges; the learner's job; that predictions never change the real pictures, that the guesses are drawn in white and shown again beside the results, and which controls change which drawings. Terms defined before use: *solar mass* (Suns), *the mass gap*, *pair-instability supernova*, *spin* (a reminder of Black Holes 8), *source frame*, *give-or-take (the range)*, *hierarchical merger*, *primordial black hole*, *gravitational lensing* (a reminder of Cosmology 7).

### Display (three pictures, each with a "How to read this diagram" caption to §14 and §29 and a "Where the real picture comes from" line)
1. **The mass ruler:** a scale from 0 to 300 Suns with three zones (below the gap, in it, above it), marking the real black holes (137 and 103, with their ranges), the final black hole, the two gap edges (theory, 60 to 130; measured lower edge, 44) and the guess marker.
2. **The spin scale:** 0 to 1, with a mark at 0.69 (the published simple-merger result), the measured 0.90 and 0.80 with their ranges, and the guess.
3. **The climb (follows the controls):** blocks showing the trial black holes, round by round, with the mass after each merger and its zone.
Plus a labelled illustration of a pot or a star ending in a blast and in a black hole (not to scale).

### Run
Five stages (the event, the masses, the gap, the spins, the explanations), as in earlier experiments; the pictures build up and the guesses appear once the feature beside them is drawn (§14).

### Results (neutral, then explained by the tutor)
A check-up table (calculated against measured where a reference exists: the merger arithmetic against the paper's total and final ranges, and the 0.69 against the measured spins), a note under each table, the predictions beside the results, and a table of the trial values. No "right" or "wrong" (§14), and no verdict between the four explanations.

## What the sources say about its origin (for the tutor and the page; wording owner-approved before use)

| Explanation | What was read | Status |
|---|---|---|
| **Earlier mergers** (hierarchical) | one analysis finds a merger of two second-generation black holes favoured over other generations and counts about 6 and 4 first-generation black holes behind the two (search summary); another (arXiv:2510.14363, abstract read through a summary) finds it "possible (p about 5 percent)" that a cluster would make a binary with such spins; a 2026 study (arXiv:2604.18709, summary) favours successive mergers in dense clusters over single-star routes | the spins are the weak point |
| **Primordial** | arXiv:2508.09965, title only | proposed |
| **Lensing** | a published 2026 analysis (ApJ Letters, 25 August 2026) finds a lensed reading favoured with a false-alarm probability under 1 percent (about 2.6 sigma), and a total mass of 100 to 180 under it; another paper asks "How significant is the lensing interpretation?" | one candidate, not confirmed |
| **Two overlapping signals** | arXiv:2512.17550, title only: favoured over one signal with Bayes factors of about 100 to 10,000 | proposed |

The page states that these are explanations, that the sources disagree, and that it does not choose.

## Expected Observations
Two black holes below the gap merge into one in it (40 + 40 gives 76); another round puts it above the gap; the remnant of a simple merger spins at 0.69, below the measured 0.90 and 0.80; GW231123's own masses are at or above the gap.

## Expected Learner Understanding
That "black holes that should not exist" is a statement about single stars, that merging can fill the gap, that the spins are the clue and the puzzle, and that the true origin of this event is open.

## New Concepts Introduced
Mass gap, pair-instability supernova, hierarchical merger, primordial black hole, generations of black holes, source frame.

## Relationship to Previous Experiments
Black Holes 8 (spin) and 9 (how a black hole forms), Gravitational Waves 1 to 4, Cosmology 7 (lensing), Experiments 17 (failed supernova) and 18 (the same style of mass arithmetic, with the radiated share), and 19 (the ringdown; a search summary says an independent ringdown analysis supports a massive remnant for this event, which is not used here).

## Relationship to Later Experiments
Experiment 21 (the shadow of a black hole) and Experiment 23 (how fast black holes grow) deal with black holes at other scales and other ways of growing.

## Required Physics Tests (proposed; each must fail when the module is deliberately broken)
1. `merge(40, 40)` is 76 (± 0.1) with a share of 5 percent, and is smaller than the sum.
2. `zoneOf` returns below, in or above for 30, 76, 137 and 206 Suns, and is exact at the edges (a stated rule for 60 and 130).
3. `ladder(30, 3)` is 30, 57, 108.3, 205.8, and the count of original black holes is 1, 2, 4, 8.
4. `ladder(20, 3)` ends at 137.2 and `ladder` is increasing, and doubling the starting mass doubles every later step.
5. The real event's stored values (137, 103, 0.90, 0.80, 0.39, 83 percent) and the summed range (190 to 265).
6. The spin gaps (0.21 and 0.11) and the 0.69 figure.
7. The trial values for the control settings listed above.
8. The prediction answers, the nearest-answer helpers and the guess markers follow the guess (§14 rule 3), and the guesses never change any real value.

## AI Tutor Behavior (to be drafted once approved)
Predict, observe, compare, explain, per §12 and §13. It marks each prediction only in its explanation, uses a daily-life comparison and a worked calculation (40 + 40 − 5 percent = 76), points to the white marks by name, states the explanations as proposals only, and leaves out the stellar physics beyond the single sentence on pair instability.

### Chapter summary (to be drafted once approved)

## Links ("Want to know more?", §29 rule 3; none yet fetched for this page)
To fetch before approval and record in the table below. Candidates found on 2026-10-26: [LIGO's GW231123 detection page](https://ligo.org/detections/gw231123/) (read); [LIGO's science summary](https://ligo.org/science-summaries/gw231123/) (read); the discovery paper [arXiv:2507.08219](https://arxiv.org/abs/2507.08219) (title and authors only); the [Monash article on the forbidden gap](https://lens.monash.edu/a-forbidden-gap-what-missing-black-holes-reveal-about-exploding-stars/) (read); the lensing paper (ApJ Letters 2026, [doi](https://iopscience.iop.org/article/10.3847/2041-8213/ae93b1); abstract read); [arXiv:2510.14363](https://arxiv.org/abs/2510.14363) (abstract read). A plain official page on the gap or on pair instability has not been found; one from NASA, ESA or the LIGO site is still needed. Links that would give away the predictions (the spin result) go after the run, as in Experiments 17 to 19.

## Sources read (2026-10-26; none in full)
| Source | What was read | What it gave |
|---|---|---|
| LIGO science summary, ligo.org/science-summaries/gw231123 (fetched) | page | masses 137 and 103, total 190 to 265, final 182 to 251, 83 percent, the gap 60 to 130 |
| LIGO detection page, ligo.org/detections/gw231123 (fetched) | page | about 100 and 140, final above 225, 23 November 2023, announced 14 July 2025 |
| arXiv:2507.08219 (abstract page, HTML and PDF) | **not read**: the text begins with author affiliations and the PDF could not be converted here | numbers came from a search summary of the abstract: 137 (+22, −17), 103 (+20, −52), spins 0.90 and 0.80, redshift 0.39 (+0.27, −0.24), distance 0.7 to 4.1 Gpc, signal-to-noise about 22.5 |
| arXiv:2510.14363 (abstract page) | abstract summary | hierarchical assembly "possible (p about 5 percent)" |
| arXiv:2604.18709 (abstract page) | abstract summary | binary evolution fails; successive cluster mergers favoured |
| IOP ApJ Letters ae93b1 (fetched) | abstract summary | lensing favoured, false-alarm probability under 1 percent, 100 to 180 Suns under it |
| Monash "forbidden gap" article (fetched) | page | the mechanism in plain words; black holes above about 45 Suns unexpectedly rare; dated 2 April 2026 |
| GWTC-4.0 gap edge 44 (+5, −4) (search summaries only) | summary | the lower edge as a measurement |
| 0.686 equal-mass remnant spin (search summary only) | summary | not located at a paper |
| arXiv:2508.09965, 2512.17550, 2512.19118 | titles and search summaries | primordial, overlapping, lensing significance |

## Conflicts between sources, and how this specification handles them
- **The gap's range:** 60 to 130 (LIGO's summary, theory), about 44 to 45 as the lower edge (catalogue measurement and Monash). The page draws both and says which is which.
- **The masses:** about 100 and 140 (LIGO's page), 137 and 103 (LIGO's summary and the abstract). The page uses 137 and 103 with their ranges and says the others are rounded.
- **The total mass if the signal is lensed:** 100 to 180 (lensing paper) against 190 to 265 (discovery paper). The page gives both and says the first applies only if the lensing reading is right.
- **The hierarchical explanation's likelihood:** favoured in some analyses, "about 5 percent" in another. The page states the range of views and chooses none.

## Facts that may change (re-check by the dates shown)
| Fact | Source | Checked |
|---|---|---|
| Masses, spins, redshift | arXiv:2507.08219 (search summary of abstract only) | 2026-10-26 |
| The gap edges | LIGO summary; GWTC-4.0 summaries | 2026-10-26 |
| Whether GW231123 has been confirmed as lensed or as overlapping signals | 2026 papers (abstracts only) | 2026-10-26 |
| Whether a heavier merger has been announced since | not searched | not checked |

## Open items (known before approval)
(a) The discovery paper was not read; its masses, spins, redshift and distance come from search summaries (the distance range 0.7 to 4.1 "Gpc" and the redshift are the least certain and are not on the page until read). (b) The 5 percent share is assumed from GW250114's 4.7 percent; the real GW231123 radiated share is not read (the totals suggest about 15 Suns, from 240 minus about 225, which is a rough subtraction of best-fit values, not a measurement). (c) The 0.686 remnant spin has no paper read. (d) No plain official page on pair instability has been found. (e) The pot comparison for pair instability is unchecked. (f) Newer results are not searched. (g) The proposal's phrase "the spins give a clue" must be worded so that it states no more than the sources: the 5 percent figure is one cluster model's probability, not a verdict.

## Decisions for the owner (each on a default; change any you like)
1. **Status label:** *Strong evidence* (what was seen) and *Open* (what made it), as above. Default: yes.
2. **Model:** arithmetic only (merge, climb, zones) with the published 0.69 as data, no waveform and no cluster model. Default: yes.
3. **The gap in the pictures:** drawn as 60 to 130 (theory, LIGO's summary) with the measured lower edge of 44 as a second marker. Default: yes.
4. **Prediction 1:** can two black holes below the gap merge into one inside it (no, yes, not sure; the marker only). Default: yes.
5. **Prediction 2:** the spin of a merger of two equal non-spinning black holes, six balanced buttons about 0.69. Default: yes.
6. **Controls:** the mass of each of two equal black holes (20, 30, 40, 50) and the number of rounds (1 to 4). Default: yes.
7. **Radiated share:** 5 percent assumed (from GW250114), flagged on the page as an assumption. Default: yes.
8. **The four explanations** are shown in the tutor and the results as proposals, with no ranking. Default: yes.
9. **Spin ranges** are drawn as bars so that the wide ranges (0.29 to 1.0 for the lighter black hole) are visible. Default: yes.
10. **Links:** LIGO pages, the Monash article and the papers, after fetching; a plain official page on pair instability is still wanted. Default: yes.
11. **Not modelled:** the lensing reading's lower mass is described but not drawn. Default: yes.
12. **Where it stops:** no simulation of clusters, stars or the waveform, and no ranking of explanations. Default: yes.


## Implementation Notes

**Step 1 done (2026-10-26): the physics model and tests** (`src/physics/heaviestMerger.ts`, 31 tests in `heaviestMerger.test.ts`, checked by nine deliberate breaks; committed `fb3de56`). The specification's rounded figures are 137.2 (exactly 137.18) for 20 Suns after three rounds and 205.8 (exactly 205.77) for 30 Suns after three rounds; the tests use the exact values. The radiated share (5 percent) and the remnant spin (0.686) are held as constants and are still unsourced (open items b and c).

**Step 2 done (2026-10-26): the interface skeleton and the introduction** (`src/components/HeaviestMergerExperiment.tsx`, wired into `src/App.tsx` with a placeholder summary). **Wording approved by the owner on 2026-10-26 ("wording approved")**, covering the status line, the introduction, the "two ways a very heavy star can end" illustration and its guide, the new-word list, the Words panel and the two links (NASA's black holes page and NASA Space Place's gravitational waves page, fetched 2026-10-26). Changes made at the owner's questions during review: (1) "The question" now explains in steps what "leave a black hole" means and what happens to the heaviest stars; (2) the section on why a very heavy star can leave nothing now names gas pressure and light pressure, says light's share grows with temperature to the fourth power (doubling the temperature makes its push 16 times larger, the gas's push twice as large), and says pair production uses up light's energy, with two added Words entries.

**Differences from this specification (for the owner's approval):** (1) the introduction gives the gap as 60 to 130 Suns in theory and a 2025 study's lower edge of 44 Suns, and the illustration carries no numbers; (2) the introduction gives no spins, no merging arithmetic and no 0.69 (§12), and the status line leaves out the spins for the same reason; (3) the Monash article, LIGO's science summary and the papers are held back until after the run, because the Monash article says that smaller black holes merging build bigger ones, which is Prediction 1's answer; (4) the introduction explains gas pressure and light pressure and the tent comparison (a comparison of Claude's, unsourced; the mechanism is from the Monash article and a search summary); (5) the worked moment in the illustration guide uses made-up counts (5, 45 and 100 Suns), labelled as not real; (6) the Words panel has 15 entries and no entry for "no-hair" or the other earlier experiments' terms beyond those listed.

**Not checked:** other browsers, narrow widths, keyboard use, a real learner. Unsourced in the page: that light carries a small push, that the gas does almost all of the holding up in a star like the Sun, and the comparison of gas pressure to the air in a tyre.

**Step 3 done (2026-10-26): the two predictions** (in `src/components/HeaviestMergerExperiment.tsx`; Run only records the answers and locks the buttons; the run and pictures are Step 4). **Wording approved by the owner on 2026-10-26 ("wording approved")**, covering both predictions, the Part 1 lead paragraph and the "What you will do" paragraph. Change made at the owner's question during review: Prediction 1 now says "two black holes, each made when one star died, so that each black hole came from its own star" (the earlier "each came from a single star" could be read as both from one star).

**Differences from this specification (for the owner's approval), added at Step 3:** (7) Prediction 1's text says "a little of the mass leaves as gravitational waves, so the new black hole is a bit lighter than the two together" and gives no masses (the specification's example of 40 Suns is not shown before the answer); (8) Prediction 2's text does not give 0.69 or any real spin, and says the two black holes were "circling each other"; its six buttons are labelled About 0.1 (hardly turning), 0.3, 0.5 (half-way), 0.7, 0.9 (very fast) and 0.99 (almost as fast as is possible); (9) the "What you will do" paragraph is added to the introduction and describes the four parts of the page, of which only Part 1 exists at this step.

**Step 4 done (2026-10-26): the run and Picture 1** (in `src/components/HeaviestMergerExperiment.tsx`; `exampleMerger()` added to the physics module, 33 tests in all). **Wording and the picture approved by the owner on 2026-10-26 ("approved")**, covering the four stage names and lines, Picture 1 (panel A the real merger on a ruler of masses, panel B a check by hand), its caption with a worked moment and "What to look for" items, and the "Where the real picture comes from" line. Prediction 1's guess is drawn in white in panel B as a tick, a cross or a question mark (a marker only). Complete-flow check in Chrome: all four stages, the three guesses, real elements unchanged by the guess, no sideways scroll, no clipped text. Not checked: other browsers, narrow widths, keyboard use, a real learner.

**Differences from this specification (for the owner's approval), added at Step 4:** (10) panel B, a check by hand with two imagined black holes of 40 Suns (40 + 40 = 80, minus 5 percent, 76), is added to Picture 1 so that Prediction 1's guess is drawn beside the result it is about (§14); the specification's Picture 1 had only the real black holes, the gap and the guess marker; (11) the run has four stages ("The two black holes that merged", "The black hole they made", "The gap", "A check by hand") in place of the specification's five, because the stage on the spins belongs to Picture 2 (Step 5) and the explanations are given by the results and the tutor; (12) imagined values are drawn in teal and the gap in pink; (13) Picture 1's caption states the example's result (76, inside the band) and says that a black hole in the gap does not by itself show that a single star made it, with no verdict between the explanations; (14) the caption gives the rough 6.3 percent radiated share implied for GW231123 (240 minus about 225), labelled as a subtraction of best estimates and not a measurement.

**Step 5 done (2026-10-26): Picture 2, the spins** (in `src/components/HeaviestMergerExperiment.tsx`; `spinPicture()` and `SPIN_AXIS_MAX` added to the physics module, 36 tests in all; committed with Step 5). **Wording and the picture approved by the owner on 2026-10-26 ("wording approved")**, covering the two added stage lines, Picture 2 (the measured spins with their give-or-takes, the published 0.69 as a dashed blue line, amber arrows to the measured spins, and Prediction 2's guess in white), its caption with a worked moment and "What to look for" items, and the "Where the real picture comes from" line. Complete-flow check in Chrome: all six stages, guesses of 0.1, 0.5 and 0.99 (the white mark moves, every real element stays the same), no sideways scroll, no clipped or overlapping text. Not checked: other browsers, narrow widths, keyboard use, a real learner.

**Differences from this specification (for the owner's approval), added at Step 5:** (15) the run has six stages, not the specification's five: stage 5 ("The spins") draws the measured spins and stage 6 ("What a simple merger gives") draws the published 0.69 and the guess, so the guess appears only once the feature beside it is drawn (§14); (16) the amber arrows show how much higher each measured spin is than 0.69 (0.21 and 0.11), and the caption says that the heavier black hole's range (from 0.71) does not reach down to the line and the lighter one's (from 0.29) does, with no verdict; (17) the 0.69 is drawn in blue as a published result that the page uses but did not calculate; the specification said the module holds it as data.

**Step 6 done (2026-10-26): Part 2, "Now try it yourself"** (in `src/components/HeaviestMergerExperiment.tsx`; `logPosition()`, `trialPicture()` and the log scale added to the physics module, 44 tests in all). **Wording and the drawing approved by the owner on 2026-10-26 ("approved")**, covering the Part 2 lead and trial-values paragraphs, the two controls, Drawing A (the teal climb on a ruler going up in steps of ten, with the pink band and the green ticks) and its caption with a worked moment, "What to look for" items and a "Where the real picture comes from" line. Complete-flow check in Chrome: all 16 control settings (no overlapping or clipped text; the aria-labels match the module). Not checked: other browsers, narrow widths, keyboard use, a real learner.

**Differences from this specification (for the owner's approval), added at Step 6:** (18) the specification's third picture ("the climb") is Drawing A in Part 2, on a log scale from 10 to 1,000 Suns, not a picture drawn by the run; (19) Drawing A shows the real black holes of GW231123 as green ticks and the gap as a pink band, which do not change with the settings; (20) the first control's 40-Sun button is labelled "(as in Picture 1)" and is the default, with one round; (21) the specification's table lists 260.7 for 20 Suns after four rounds, but the exact value is 260.64 (the page shows 260.6); (22) the page says that the same 5 percent is used for every round and that real black holes would rarely meet in such an orderly way.

**Step 7 done (2026-10-26): Part 3, the results** (in `src/components/HeaviestMergerExperiment.tsx`; `gapPosition()`, `rangeOverlapsGap()`, `massGapRows()`, `shareComparison()` and `ORIGIN_FIGURES` added to the physics module, 50 tests in all). **Wording approved by the owner on 2026-10-26 ("wordings approved")**, covering the "Where this stands" box, the predictions beside the results, the reading guide, five tables (Table 1 the check-up with seven rows, Table 2 the three black holes against the gap, Table 3 the spins, Table 4 merging by hand, Table 5 the four proposed explanations), the note under each, and the list of papers and pages. Check in Chrome: all five tables read against the module's numbers; no sideways scroll; no answers on the page before the run. Table 3's last cell first compared the guess with 0.69 ("your guess is 0.19 below it") and was changed to show the guess only. Not checked: other browsers, narrow widths, keyboard use, a real learner.

**Differences from this specification (for the owner's approval), added at Step 7:** (23) the results have five tables (the check-up, the gap, the spins, merging by hand and the proposed explanations) and not the specification's check-up and trial-value table; the trial-value table is left out because §14 makes it optional and Drawing A shows those numbers; (24) the check-up has seven rows, with no verdict words ("inside the published range", "0.21 higher", "1.25 percentage points apart"); (25) Table 5, the four proposed explanations with the figure each paper reports, is in the results and not only in the tutor; (26) the list of papers and pages is at the end of Part 3 (after the run), with seven links; (27) "Where this stands" in Part 3 names the status as strong evidence for the merger and open for its origin.

**Step 8 done (2026-10-26): Part 4, the tutor** (`src/components/HeaviestMergerTutor.tsx`, wired into the experiment; `possibleGuessResult()`, `spinGuessResult()` and `climbFacts()` added to the physics module, 55 tests in all). Three questions (what you see in Pictures 1 and 2; compare your white marks with Tables 4 and 3; a forest where a tree is taller than it should be, then the black holes in the gap), then an explanation that marks each prediction as matched or not matched, and goes through seven parts: why single stars should not leave these black holes, why merging can fill the gap (each equal merger multiplies the mass by 1.90, less than the band's 2.17, so a climb from below must land in it), what it would take, the spin clue, the four proposals (no ranking), how sure we are, and what was and was not shown. Complete-flow check in Chrome: nothing marked before the explanation; both a matching pair and a non-matching pair of guesses read correctly. **The owner asked for Steps 7 and 8 to be committed on 2026-10-26 ("commit 7,8") and did not give a separate approval line for the tutor's wording; it is recorded here as read through and committed, and still to be confirmed by the owner.** Unsourced in the page: that the orbit's turning ends up as the new black hole's spin, and the inference that black holes made by earlier mergers might be expected to spin nearer 0.69 (the 5 percent figure is the paper's). **Differences from this specification (for the owner's approval):** (28) the tutor's explanation has seven parts, with the stepping-stones comparison and the 1.90 against 2.17 argument, which the specification did not include; (29) the third question is a forest comparison and then an open "what would you suggest?", not the specification's "predict, observe, compare" only.

**Step 9 done (2026-10-26): the chapter summary and its wiring** (`heaviestMergerSummary()` in `src/App.tsx`, every number read from the physics module; Experiment 19's "What's next" now points to this experiment; this experiment's "What's next" names no experiment because Experiment 21 has no approved specification). **Wording approved by the owner on 2026-10-26 ("wording approved")**, covering the summary and Experiment 19's changed "What's next". Check in Chrome from a cleared state: no summary before the tutor's explanation, "completed" set when the run ends, "explained" set after the explanation. Two fixes at review: "the band" (which only makes sense beside the pictures) became "the gap", and "anything from 51 to 123" became "only known to lie between about 51 and 123, with a 90 percent chance".

**Step 10 done (2026-10-26): the complete-flow test.** Run in Chrome with the stage timer shortened to 120 ms (restored to 2,600 ms afterwards; `git status` shows no change to that constant). From a cleared state: all 18 prediction pairs (3 guesses for Prediction 1 by 6 for Prediction 2), each from "Start over" through the predictions, the run, Parts 2 to 4, the three tutor questions and the explanation, and all 16 control settings of Part 2 (4 starting masses by 4 numbers of rounds) compared with a separate calculation (the ladder written out in the script: each round is twice the mass less 5 percent; the dots' positions on the log scale; the zone of each round; the number of starting black holes; the worked sums; the green ticks). Checks per pair: the white mark and box on Picture 1 and Picture 2 follow the guess (the Picture 2 mark at x = 60 + spin × 460); every real element of both pictures, all five tables and Drawing A is identical across guesses; the predictions beside the results show the guesses; nothing is marked and no summary shows before the tutor's last reply; the tutor marks Prediction 1 as matched only for "yes" (and "neither matched nor missed" for "not sure") and Prediction 2 as matched only for 0.7; the summary appears after the explanation. Also: no answer on the page before the run; spot checks of 13 table strings; "Start over" resets the page. **Result: 0 failures.** A first attempt failed 36 checks, all the same one (a summary visible before the tutor), because the page still held the saved "explained" progress of an earlier run in the same tab; after a reload from a cleared state the whole test passed. **Not checked:** narrow widths (the browser window could not be made narrower than about 1,400 px in this session; the pictures are 562 px wide and the tables sit in horizontally scrolling boxes), other browsers, keyboard use, a real learner.
