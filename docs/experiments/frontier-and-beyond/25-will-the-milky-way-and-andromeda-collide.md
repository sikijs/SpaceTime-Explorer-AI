# Experiment 25 (Cosmic Horizons): Will the Milky Way and Andromeda Collide? (Two Studies, Two Answers)

**Status: PROPOSED by Claude on 2026-10-28 per `CLAUDE.md` §23 Stages 1 to 3, as a twenty-fifth experiment of the group, at the owner's request (2026-10-28: "lets do exp 24 first and then add exp 25 about galaxies with 2026 studies"). Specification APPROVED by the owner on 2026-10-28 ("approved as is", all thirteen decisions on their defaults, including Decision 11: the group's count became twenty-four experiments, numbered 1 to 15 and 17 to 25, in `00-group-proposal.md` and `CLAUDE.md`; `PROJECT.md` and `AGENTS.md` already say "any added later"). BUILT (physics model and tests, interface, predictions, five-stage run, controls, results, tutor and chapter summary; see the Implementation Notes), complete-flow tested in Chrome (all 25 prediction pairs and all 15 control settings against a separate calculation, 2026-10-29) and finally reviewed 2026-10-29. The owner approved the wording of the steps as they were built, including the tutor, the chapter summary and the review's fixes on 2026-10-29; the owner approved all the differences from the specification listed in the Implementation Notes for Steps 5 to 10 on 2026-10-29. Every fact below came from search results, from the abstracts of two papers and from summarising fetches of their full text and of two web pages, all on 2026-10-28; none was read in a paper by Claude, and each number must be checked at its paper before the wording is approved (§29).**

> **What the owner asked for, and what the research found.** The group has no experiment about galaxies as such. The owner wanted one built on 2026 studies. The best fit found is the fate of our own galaxy: for years the textbook answer was that the Milky Way and the Andromeda galaxy will certainly collide in about 4 to 5 billion years. In June 2025 a team led by Till Sawala (*Nature Astronomy*) found only about a 50 percent chance of a merger within 10 billion years. In March 2026 a team led by Hao Wu (accepted by *The Astrophysical Journal Letters*) re-did the analysis with newer Gaia measurements of Andromeda's sideways motion and found about 90 percent. The two studies use the same kind of method and mostly the same masses; the main thing that changed is one number that is hard to measure, **how fast Andromeda is moving sideways** (about 76 km/s in the 2025 study, 46.7 ± 24.0 km/s in the 2026 one). That is a result with a clear label (Contested), a computable core (the shape of a two-galaxy orbit) and a clear lesson (a small, hard-to-measure quantity decides the outcome), and it does not repeat the dark-matter experiments (Experiments 6 and 7, Cosmology 4 and 9). The 2026 study is the "2026 study" the owner asked for.

## Overview

The Milky Way and the Andromeda galaxy (M31) are the two biggest galaxies of the Local Group. M31 is about 760 kiloparsecs away (about 2.5 million light-years) and is **coming towards us** at about 109 km/s. If that were its only motion, the two would fall straight together and meet in about 3.8 billion years (a number this experiment calculates). But M31 also has a **sideways** motion across the sky, and any sideways motion makes the path a long loop that misses a head-on meeting. The sideways motion is tiny and very hard to measure: Andromeda's position on the sky changes by tens of millionths of an arcsecond a year. Two careful studies, a year apart, put it at about 76 km/s and at 46.7 ± 24.0 km/s, and one finds about a 50 percent chance of a merger in 10 billion years and the other about 90 percent.

The experiment asks three questions:

1. **How long would the fall take if there were no sideways motion at all?** The learner meets the point that a falling galaxy speeds up as it comes closer, so the time is much shorter than "distance divided by speed" (about 3.8 billion years, not 6.8).
2. **How close is the first pass for the sideways speed measured in 2026?** About 66 kiloparsecs, far closer than the 760 it started from, but not head-on, and very sensitive: the sideways speed's own give-or-take (± 24 km/s) moves the first pass from about 15 to about 158 kiloparsecs.
3. **Why do two studies disagree?** The experiment's own model has only the two big galaxies, so it cannot say who is right. It shows how much one measured number matters, and it sets the two published answers side by side.

The model is **the two-body orbit of the Milky Way and Andromeda as point masses, calculated here, set beside the published numbers**. It does not model the other galaxies the studies include (the Large Magellanic Cloud and M33), the halos' size, or dynamical friction, which is what finally makes galaxies merge. **It does not calculate a probability of a merger**; the page gives the two studies' probabilities as published, and says that this model cannot reproduce them.

## Learning Objective

By the end the learner can say, in their own words:

1. Two galaxies approaching each other speed up as they fall, so the time to meet is shorter than the distance divided by the speed they have now (3.8 billion years for a straight fall from the present state, against 6.8 for a constant speed).
2. A sideways motion turns a straight fall into a loop: the bigger the sideways speed, the farther the first pass. For the Milky Way and Andromeda, a sideways speed of about 26 km/s gives a first pass of 20 kiloparsecs (the distance the studies call a merger), 46.7 km/s gives about 66 and 76 km/s about 183.
3. A close first pass is not yet a merger: with only gravity of two points the galaxies would swing apart again for tens of billions of years; the studies add dynamical friction (the drag that a galaxy's halo feels as it moves through another), which draws them together.
4. The sideways speed of Andromeda is the number that is hardest to measure, and it is the main thing that changed between the two studies (76 km/s in 2025, 46.7 ± 24.0 km/s in 2026), together with the sign of the effect of the Large Magellanic Cloud (the 2026 paper says it is reversed). That is why the published chance of a merger went from about 50 to about 90 percent, and why a result of this kind is labelled Contested.
5. What this model leaves out, and that a new Gaia data release planned for December 2, 2026 may change the answer again.

## Physical Situation

The Milky Way and Andromeda are each a few hundred billion stars inside a much bigger halo of dark matter (Experiments 6 and 7 and Cosmology 4). The halo's mass is what matters for the orbit: the studies use about 1.0 × 10¹² Suns for the Milky Way and 1.3 × 10¹² for Andromeda (the mass inside the radius where the halo's density is 200 times the average, "M200"). Andromeda is about 761 kiloparsecs away (from a distance modulus of 24.407) and is approaching at about 109 km/s relative to the Milky Way (the measured −301 km/s along our line of sight, corrected for the Sun's own motion round the Galaxy). Its sideways speed is the number that has to be inferred from how its position changes on the sky.

## Physics Model (`src/physics/localGroupCollision.ts`, to be written)

| Part | What it computes | Source |
|---|---|---|
| **The state now** | separation r₀ = 761 kpc (from a distance modulus of 24.407), approach speed v_r = 109 km/s (a rounded value; to be checked at the papers), sideways speed v_t (the control or one of the two published values), total mass M = 2.3 × 10¹² Suns (the sum of the two studies' halo masses) | Sawala and others 2025; Wu and others 2026 (through summaries) |
| **The orbit** | two point masses under Newtonian gravity: μ = G M; the energy E = ½(v_r² + v_t²) − μ/r₀; the angular momentum L = r₀ v_t; the shape p = L²/μ and e = √(1 + 2 E L²/μ²); the first pass r_p = p/(1 + e); the farthest point and the period from the semi-major axis a = p/(1 − e²) | standard two-body results; worked by hand and by a separate script 2026-10-28, **to be checked** |
| **Time to the first pass** | from Kepler's equation for an orbit with e < 1 (or the radial-fall formula for v_t = 0): 3.81 billion years for v_t = 0, 4.20 for 46.7 km/s, 4.66 for 76 km/s | standard; worked by hand and by script, **to be checked** |
| **Sideways speed for a given first pass** | the v_t that gives r_p = 20 kpc (the distance both studies use to call a merger): 26.0 km/s, found by solving | derived here |
| **Real values** | the two studies' sideways speeds (76 km/s; 46.7 ± 24.0 km/s), masses, distance and probabilities, held as data | arXiv:2408.00064 and arXiv:2603.22863, through summaries |
| **Answers** | the predictions' answers, nearest-button helpers and the tutor's marks | arithmetic |

The module invents no new physics. **Not modelled** (the page must say so): the Large Magellanic Cloud and M33, the size of the halos (a first pass at 66 kiloparsecs is well inside the halos' reach), dynamical friction, the growth of the Local Group's mass, the expansion of the universe (small here), and the many measurement errors that the studies draw at random in 100,000 trial runs. **Assumed:** that the pair can be treated as two points; this is an approximation, and it fails at a small first pass.

## Learner Controls ("Now try it yourself", trial values)

1. **Sideways speed** (five buttons: 0, 23, 47, 76 and 100 km/s; 47 and 76 are the 2026 and 2025 studies' values, 23 is about one give-or-take below the 2026 value). Trial values, not new measurements.
2. **Total mass** (three buttons: 1.8, 2.3 and 2.8 × 10¹² Suns; 2.3 is the sum of the studies' halo masses, the others about one give-or-take either side). Trial values.

Drawing A shows the orbit of the trial pair (from the Milky Way's point of view, the first pass and the loop), the first-pass distance and time, the period, and whether the first pass is closer than the 20 kpc ring that the studies use to call a merger (drawn only as a ring, not as a verdict). It says its numbers are trial values.

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **If Andromeda had no sideways motion at all, and fell straight towards the Milky Way from where it is now, about how long would it take to reach it?** Five buttons on a log scale: about 1 billion years, about 2 billion, about 4 billion, about 7 billion, about 14 billion. Answer: **3.81 billion years**, button "about 4 billion". (The naive answer, distance divided by speed, is 6.8 billion years, button "about 7 billion".) Drawn as a white mark on a log ruler of times (Picture 1).
2. **With the sideways speed found in the 2026 study, 46.7 kilometres a second, how close would the two galaxies pass at their first closest approach?** Five buttons on a log scale: about 7 kiloparsecs, about 20, about 70, about 250, about 900. Answer: **66.5 kiloparsecs**, button "about 70". Drawn as a white mark on the orbit picture (Picture 2) beside the 20 kpc ring.

The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only (§12, §13).

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)
Outline: Gravity Experiment 6 and Cosmic Horizons 24 recalled (orbits; open and closed paths); what a galaxy is, the Milky Way, Andromeda, the Local Group and the dark matter halos (Experiments 6 and 7); what a collision of galaxies means (almost no stars hit each other: the galaxies' gravity pulls them together and they become one galaxy over billions of years), with a daily-life comparison; the old textbook answer and the two new studies, with dates; what "sideways motion" and "approach speed" are and why one is measured with a spectrum (a Doppler shift, Cosmology 1) and the other with years of images (a millionth of an arcsecond a year); what the learner will do; that the predictions never change the real pictures; the assumptions. Terms defined before use: *galaxy*, *Local Group*, *halo*, *kiloparsec*, *billion years*, *approach speed*, *sideways speed (proper motion)*, *Gaia*, *dynamical friction*, *merger*, *Monte Carlo*, *give-or-take*. Held back until after the run: both predictions' answers (§12), and the published probabilities may be stated before the run (they are not the answers) but not the first-pass distance.

### Display
1. **Picture 1, the fall:** a log ruler of times from 0.3 to 30 billion years with the time for a straight fall (3.81), the naive distance-over-speed time (6.8) beside it, and Prediction 1's white mark.
2. **Picture 2, the first pass:** the orbit of Andromeda about the Milky Way, seen from above, for the 2026 sideways speed (46.7 km/s), the 2025 one (76 km/s) and the straight fall, with the 20 kpc ring, the first-pass distance of each and Prediction 2's white mark; and, as its own panel on its own scale, the first-pass distance against the sideways speed, with the two studies' values and the ± 24 km/s band of the 2026 value marked.
3. **Drawing A (follows the controls):** the trial pair's orbit and numbers.
Each picture has a "How to read this diagram" caption with look-at / what-it-means / why-it-matters items (§14, §29) and a "Where the real picture comes from" line.

### Run
Five stages: the Milky Way and Andromeda and their distance; the approach speed; the fall with no sideways motion (Picture 1); the sideways speed and the loop (Picture 2); the two studies' values and the 20 kpc ring. Guesses appear once the feature beside them is drawn.

### Results (neutral, then explained by the tutor)
A check-up table (the fall time against distance ÷ speed; the first pass and the time to it for the 2026 speed against the 2026 study's median merger time of 6.5 billion years, said to be later because a merger needs friction; the first-pass distances against the 20 kpc the studies use), a steps table (from the state now to the first pass) and a table of the two studies side by side (sideways speed, masses, merger probability, median merger time, what changed), each with a "What this table tells us" note (§14). The predictions beside the results, tagged on the row. No "right" or "wrong".

### Tutor (Part 4)
Predict, observe, compare, explain (§13): why a falling galaxy speeds up and so the straight fall is shorter than distance ÷ speed; why a sideways speed makes a loop and what sets how far the first pass is (angular momentum, with a skater pulling in her arms or a ball swung on a string); why a close first pass is not yet a merger (friction, the halos' size); why the two studies differ and how little their model difference is (one number and the effect of the Large Magellanic Cloud); what is not settled, and the planned Gaia release.

## Expected Observations
Straight fall 3.81 billion years (6.83 for a constant speed); first pass for 46.7 km/s at 66.5 kpc after 4.20 billion years (an orbit with a period of about 47 billion years without friction); for 76 km/s, 183 kpc after 4.66; the sideways speed for a 20 kpc pass 26.0 km/s; the 1σ range of the 2026 value (22.7 to 70.7 km/s) giving first passes of 15 to 158 kpc.

## Expected Learner Understanding
That the fate of two galaxies hangs on a sideways speed that is hard to measure; that a result with a large give-or-take can come out as 50 percent in one study and 90 percent in the next without either being careless; and that a simple model can show why a quantity matters without deciding the question.

## New Concepts Introduced
Proper motion (sideways speed on the sky), the Local Group, a galaxy's halo and M200, dynamical friction (named, not modelled), a merger (defined as the studies do, within 20 kpc), Monte Carlo trial runs (named).

## Relationship to Previous Experiments
Gravity 6 and Cosmic Horizons 24 (orbits; Experiment 24's module is not reused, since the units and the closed orbit differ), Cosmic Horizons 6 and 7 and Cosmology 4 (dark matter halos), Cosmology 1 (Doppler shifts, the approach speed) and 9 (how galaxies grow by merging), Cosmic Horizons 1, 2 and 3 (two studies that disagree, and give-or-take).

## Relationship to Later Experiments
This would be the last experiment of the group, and the group's closing recap (proposed in `00-group-proposal.md`) would follow it.

## Required Physics Tests (each must fail when the module is deliberately broken)
1. The time of a straight fall from 761 kpc at 109 km/s with M = 2.3 × 10¹² Suns is 3.81 billion years (± 0.02), worked separately with Kepler's radial-fall formula; the constant-speed time is 6.83 (± 0.01) and is longer.
2. The first pass for v_t = 46.7 km/s is 66.5 kpc (± 0.5) after 4.20 billion years (± 0.02); for 76 km/s, 183 kpc (± 1) after 4.66; for 22.7 and 70.7 km/s, 15.2 and 157.8 kpc (± 0.5).
3. The sideways speed that gives a first pass of 20 kpc is 26.0 km/s (± 0.1), and a first pass rises with the sideways speed (monotonic) up to the speed at which the orbit is no longer bound.
4. The energy and angular momentum are conserved along the orbit (a round trip between two distances); the orbit's first pass r_p = p ÷ (1 + e) agrees with the energy equation at r_p.
5. The speed at which the pair is just unbound is √(2 G M ÷ r₀ − v_r²) = 118.8 km/s, and a sideways speed above it gives an open orbit with no first pass (the module says so and does not compute one).
6. A heavier pair falls faster: 1.8, 2.3 and 2.8 × 10¹² Suns give straight falls of 4.05, 3.81 and 3.62 billion years, and first passes (at 46.7 km/s) of 84.5, 66.5 and 54.6 kpc.
7. The nearest-answer helpers pick the closest button on a log scale.
8. The published values are held as listed (76 km/s, 46.7 ± 24.0 km/s, masses, distance modulus 24.407, the merger probabilities of the two studies and the 20 kpc definition).
9. The distance modulus 24.407 gives 761 kpc (± 1).
10. The module does not change when predictions change (separation, §9, §14).

## Sources (checked 2026-10-28 by search results, two abstracts and summarising fetches; none read in a paper)
| Source | What it was used for | Status |
|---|---|---|
| Sawala and others, "Apocalypse When? No Certainty of a Milky Way — Andromeda Collision", *Nature Astronomy*, June 2, 2025 (arXiv:2408.00064; DOI 10.1038/s41550-025-02563-1) | about 50 percent chance of no merger in 10 billion years; about 2 percent chance of a head-on collision in 4 to 5 billion years; M33 raises and the Large Magellanic Cloud lowers the chance; 100,000 trial runs; the sideways speed of about 76 km/s (from Gaia DR3, Salomon and others 2021); halo masses (Milky Way 1.0 ± 0.2, M31 1.3 ± 0.4, M33 0.3 ± 0.1, LMC 0.15 ± 0.05 × 10¹² Suns); a merger when two galaxies come within 20 kpc; two-body, with M33, with the LMC and four-body probabilities of about 44, 63, 37 and 54 percent | arXiv full text (HTML copy) read on 2026-10-28: the 76 km/s, the 20 kpc rule, the 44, 63 and 37 percent and "only slightly more than half" for the four-body model are in the text; the proper-motion units printed as "mas/yr" are a typo for μas/yr (arithmetic); the 2 percent head-on figure and the 54 percent were not located by a search of the text; the Nature Astronomy version was not read |
| ESA/Hubble release heic2508 (June 2025) | a plain account of the same study: 50-50 chance in 10 billion years, about 2 percent head-on in 4 to 5 billion; M33 and the LMC; more than a decade of Hubble data plus Gaia; 100,000 Monte Carlo trials | read |
| Wu, Huang, Zhang, Sun and Shao, "The Fate of the Milky Way–Andromeda System: To Merge or Not?" (arXiv:2603.22863, March 24, 2026; accepted by *ApJL*) | about 90 percent merger probability (range about 64.7 to 100 percent over the two-sigma region of M31's motion, from a secondary report), a median merger time of 6.5 (+1.3, −1.5) billion years; newer Gaia proper motions for M31 and M33 corrected for Gaia's systematic offsets; M31's sideways speed 46.7 ± 24.0 km/s, its proper motion (45.9 ± 8.1, −20.5 ± 6.6 μas/yr), the same halo masses; "a more radially dominated" orbit and the LMC effect reversed | arXiv full text (HTML copy) read on 2026-10-28: the 90 percent, the 6.5 (+1.3, −1.5) Gyr, the 64.7 to 100 percent, the 46.7 ± 24.0 km/s (from the authors' earlier paper, Wu and others 2025, ref. 42, which was not read), the proper motions, the distance modulus 24.407 ± 0.032 and the halo masses 10.0 ± 2.0 and 13.0 ± 4.0 × 10¹¹ Suns are in the text; the frame of the 46.7 km/s is not stated in its sentence; the ApJL version was not read |
| Wikipedia, "Andromeda–Milky Way collision" | an approach speed of about 110 km/s; the 2012 expectation of a merger in about 5 billion years | read in part |
| Gaia Data Release 4 | planned for December 2, 2026 (five and a half years of data) | fetched 2026-10-29: ESA's Gaia page says "expected December 2026" and ESA Cosmos's data release page says "2 December 2026" |
| NASA, ESA, STScI plain pages on the Local Group, Andromeda and galaxy collisions | the "Want to know more?" list | fetched and listed on the page (see the Step 2 notes) |
| Dynamical friction | a plain official page for the idea the introduction explains (§29 rule 3(b)) | **no plain official page found** (rule 3(c), searched 2026-10-29: NASA, ESA, Hubble and Chandra queries returned only research papers). The Swinburne COSMOS glossary entry (`astronomy.swinburne.edu.au/cosmos/D/Dynamical+Friction`) was found by search but **not fetched**: the server refused connections on 2026-10-29 (the university's main site loaded). The Paris Observatory dictionary page returned 404. Nothing linked; the Swinburne entry may be added later if it loads and the owner approves the link. |
| Monte Carlo | a plain official page for the idea the introduction explains (§29 rule 3(b)) | **no plain official page found** (rule 3(c), searched 2026-10-29: NASA, ESA and NIST queries). `nasa.gov/?p=97653` returned 404 and the NASA reports found are technical. ESA/Hubble `heic2508` uses the phrase but explains nothing and links an IBM page. Nothing linked. |
| Van der Marel and others 2012, Salomon and others 2021 (M31's motion) | the earlier measurements behind both studies | not read |

## Facts that may change (§29)
| Fact | Why it may change |
|---|---|
| the probabilities of a merger (50 and 90 percent) | a new analysis, or Gaia DR4 (planned for December 2, 2026), may change the sideways speed |
| M31's sideways speed (about 76 and 46.7 ± 24.0 km/s) | later measurements; Gaia DR4 should reduce the give-or-take |
| the LMC's effect (suppresses in the 2025 study, reversed in the 2026 one) | it is the main thing the two studies disagree on besides the speed |
| the halo masses | later estimates |

## Open items
a. Both papers' arXiv full texts were read on 2026-10-28 (see the Implementation Notes). Still unread: the published journal versions, Wu and others' earlier paper (the source of 46.7 ± 24.0 km/s) and Salomon and others 2021; the frame of each sideways speed is not stated in the sentence that gives it.
b. The approach speed is not given by either paper (both give only the heliocentric −301 ± 1 km/s). 109 km/s is from the 2012 literature through Wikipedia ("about 110"); a conversion with the 2026 paper's own solar motion gives about 114 km/s. The owner decided on 2026-10-28 to keep 109 km/s (see the Implementation Notes).
c. The two-body orbit, Kepler's equation and the radial-fall time were worked by hand and by a separate script only, and must be checked at a source.
d. No plain official page was found for dynamical friction or Monte Carlo; recorded under CLAUDE.md §29 rule 3(c) (see the sources table). Plain pages for the Local Group, Andromeda and galaxy collisions are listed on the page.
e. The statement that the 2026 study's differences come mainly from the sideways speed and the LMC's effect rests on its own summary; the 2026 paper itself should be read to say what else differs.
g. The statement that a first pass at 66 kiloparsecs lies well inside the halos' reach, the 64.7 to 100 percent range and the "about 2.5 million light-years" distance have no source read beyond summaries.
f. Whether the 2026 study's M31 sideways speed (46.7 ± 24.0 km/s) is in the Milky Way's frame is not stated by the paper. A calculation from its inputs gives a sideways speed relative to the Milky Way of about 26 km/s from the central values, with a median of about 38 and a range of about 20 to 61 over the proper-motion errors: the same size as 46.7, not an exact match. It is far too small to be a speed relative to the Sun (about 181 km/s from the proper motion alone).

## Decisions for the owner (each with a default)
1. **Anchor and status label.** Use the Milky Way and Andromeda, built on the 2025 and 2026 studies (the owner's "2026 studies"), and label the experiment: Strong evidence (that Andromeda is approaching and the galaxies will interact in some way); Contested (whether they merge within 10 billion years: about 50 percent in 2025, about 90 percent in 2026); Open (what the sideways motion really is, until Gaia's next release). Default: as stated.
2. **The model:** a two-body orbit of two points, with a clear page that it leaves out the LMC, M33, the halos' size and dynamical friction, and that it does **not** compute a probability. Default: yes. (The alternative, reproducing the studies' semi-analytic method, is a large model of its own and could not be checked here.)
3. **The learner's number:** the sideways speed, with the 2025 value (76) and the 2026 value (46.7 ± 24.0) from the papers, held as published. Default: yes, subject to checking at the papers.
4. **Two predictions** (the straight-fall time; the first-pass distance at 46.7 km/s) with five buttons each, balanced on a log scale. The straight-fall question tests a point that a naive guess gets wrong (6.8 against 3.8 billion years). Default: yes.
5. **Controls:** the sideways speed and the total mass, as trial values. Default: yes.
6. **Pictures:** two pictures (the second with two panels) and one drawing. Default: yes.
7. **Results:** a check-up, a steps table and a side-by-side table of the two studies; no table of trial values. Default: yes.
8. **The 20 kpc merger definition** is shown only as a ring and as the studies' words, not as this model's verdict. Default: yes.
9. **A 2026 search** for newer results (and a look at Gaia DR4's date) is repeated before the wording is approved. Default: yes.
10. **Tutor:** the standard four-step sequence. Default: yes.
11. **The group's count.** On approval, the group's count in `PROJECT.md`, `AGENTS.md`, `00-group-proposal.md` and `CLAUDE.md` changes from twenty-four to twenty-five, the group proposal gets an entry 25, and the closing recap of the group (which the proposal puts after the last experiment) would follow this experiment. Nothing is changed until the owner approves. Default: yes.
12. **Introduction length and links:** long and detailed, to §29. Default: yes.
13. **Title** "Will the Milky Way and Andromeda collide?" (does not give away either prediction, and the two studies are named in the subtitle). Default: keep.

## Implementation Notes (Step 1, 2026-10-28)

The physics model is built (`src/physics/localGroupCollision.ts`, 18 tests in `localGroupCollision.test.ts`; it imports only the Sun's GM from Experiment 11's module, to derive G in kiloparsecs). It holds the studies' numbers (distance modulus 24.407, approach speed 109 km/s, halo masses 1.0 and 1.3 × 10¹² Suns, sideways speeds 76 and 46.7 ± 24.0 km/s, the 20 kpc merger distance, and the two studies' merger probabilities and median merger time), the two-body orbit (`orbit()`: the energy, angular momentum, eccentricity, first pass and its time, farthest point and period, with the straight fall handled by the radial-fall formula), `straightFallGyr()`, `constantSpeedGyr()`, `unboundSidewaysKmS()`, `sidewaysForFirstPass()` (bisection), and both predictions' buttons, answers, tutor marks and markers, and the controls' trial values. Required tests 1 to 10 are covered.

Numbers the module gives, each checked against a separate step-by-step integration of the motion written in the test file (leapfrog, in SI-derived units, independent of the Kepler formulas): a straight fall of 3.81 billion years (6.83 for a constant speed; 4.05, 3.81 and 3.62 for 1.8, 2.3 and 2.8 × 10¹² Suns); a first pass of 66.5 kpc after 4.20 Gyr at 46.7 km/s, 183.2 kpc after 4.66 Gyr at 76 km/s, 15.2 and 157.8 kpc at 22.7 and 70.7 km/s; 84.5 and 54.6 kpc at 46.7 km/s for the lighter and heavier pair; an orbit period of 46.6 Gyr at 46.7 km/s; the sideways speed for a 20 kpc pass 25.96 km/s; the unbound speed 118.8 km/s; and 761.03 kpc for the distance.

Differences from the specification, for the owner's approval:
1. **An unbound orbit still has a closest pass.** The specification (test 5) says that above 118.8 km/s the module gives "no first pass". A path that is not bound still has a closest point, so `orbit()` returns that distance, says `bound: false` and gives no time, period or farthest point (the time for an open orbit is not computed). The page can say that such an orbit never returns.
2. **The module holds a straight fall as eccentricity 1 with a first pass of 0**, by the radial-fall formula, rather than as a limit of the general formula (which divides by zero).
3. **The tests include an independent step-by-step integration**, so test 1's "worked separately with Kepler's radial-fall formula" is done by stepping the motion instead (a different method).

**What the reading of the papers found (2026-10-28; the arXiv full texts, as HTML copies, read by Claude with text search; the figures marked "calculated" are Claude's own, from the papers' inputs, and are not in the papers):**
* **76 km/s is in the 2025 paper** (arXiv:2408.00064): "the transverse velocity measured using Gaia DR3 (most likely value of v_t = 76 km s⁻¹)", placed beside a cosmological-simulation prior of 75 (+65, −40) km/s for the "present-day MW-M31 transverse velocity". It names no frame in that sentence. Calculated: the paper's proper motion (48.9 ± 10.5, −36.9 ± 8.1, in μas/yr; the paper prints "mas/yr", a typo, as its own radial-orbit values 38.03 and −21.37 would otherwise be 1,000 times too large) gives a median sideways speed relative to the Milky Way of 75.7 km/s (16th to 84th percentile 47 to 106), which matches "most likely 76".
* **46.7 ± 24.0 km/s is in the 2026 paper** (arXiv:2603.22863): "The derived M31 transverse velocity, 46.7 ± 24.0 km s⁻¹", from the authors' earlier Gaia paper (ref. 42, not read), where it is said to be smaller than Salomon and others' values. It names no frame in that sentence, and the paper's Table 1 note says that the distance moduli and velocities in the table are in the heliocentric frame (the table lists the proper motions and line-of-sight speeds, not 46.7). Calculated with the paper's own inputs and solar motion: the proper motion (45.9 ± 8.1, −20.5 ± 6.6 μas/yr) is about 181 km/s relative to the Sun, and about 26 km/s sideways relative to the Milky Way from the central values (median 38, range 20 to 61). So 46.7 is the same size as a Milky-Way-frame sideways speed but is not reproduced exactly; the page must say "the sideways speed the study found" and must not say which frame until Wu and others' earlier paper is read.
* **The 2025 paper's other numbers:** a merger is counted when two galaxies come within 20 kpc (and it says the results are not sensitive to this choice); 44, 63 and 37 percent of orbits merge within 10 Gyr for the two-body, M33 and LMC models (40, 56 and 34 percent with the HST plus Gaia DR2 motions); and "only slightly more than half" of the four-body orbits merge within 10 Gyr. The 2 percent head-on figure and the 54 percent were not located in the text by a search; they remain from the abstract and the ESA release.
* **The 2026 paper's other numbers:** the abstract's 90 percent, 6.5 (+1.3, −1.5) Gyr and 64.7 to 100 percent across the 2σ region; M31's distance modulus 24.407 ± 0.032 and line-of-sight speed −301.0 ± 1.0 km/s; halo masses (10¹¹ Suns) 10.0 ± 2.0 for the Milky Way and 13.0 ± 4.0 for M31; HST's 17 ± 17 km/s (van der Marel and others) and Salomon and others' "exceeding 80 km/s" for the best-matching Gaia sample. It says the 2025 study's LMC effect (reducing the merger chance) is reversed with the updated motions, and that the updated motion gives "a more radially dominated" orbit. It says future motions good to about 2 μas/yr are needed to settle the probability.
* **The approach speed.** Neither paper gives the speed at which M31 approaches the Milky Way; both give the heliocentric −301 ± 1 km/s. Calculated with the 2026 paper's solar motion (Galactocentric distance 8.122 kpc, solar velocity (12.9, 245.6, 7.78) km/s) the speed towards the Milky Way is 114.4 km/s, against the module's 109 (the Wikipedia value, "about 110").

**The test of 114 km/s (2026-10-28; a separate calculation, outside the module, of the same formulas; the module is unchanged):**

| | 109 km/s (the module) | 114 km/s |
|---|---|---|
| Straight fall | 3.81 Gyr | 3.73 Gyr |
| Time at a constant speed | 6.83 Gyr | 6.53 Gyr |
| First pass at 46.7 km/s | 66.5 kpc after 4.20 Gyr | 66.2 kpc after 4.10 Gyr |
| First pass at 76 km/s | 183.2 kpc after 4.66 Gyr | 181.1 kpc after 4.54 Gyr |
| Sideways speed for a 20 kpc first pass | 25.96 km/s | 25.97 km/s |
| Sideways speed at which the pair is just unbound | 118.8 km/s | 114.0 km/s |

Neither prediction's answer changes ("about 4 billion years", "about 70 kiloparsecs"), and the balance of both sets of buttons is unaffected. What would change: the fall times by about 0.1 to 0.3 Gyr, the unbound speed by 5 km/s (the 100 km/s trial value would stay bound, but the page's "118.8" would become "114.0", and the test that 118 km/s is still bound would have to change), and the required-test values in this specification and in the test file. **Decision (owner, 2026-10-28): keep 109 km/s** (a rounded literature value, no paper behind it) rather than 114 km/s (calculated from the 2026 paper's own inputs, but not stated by either paper). The module and tests are unchanged. The page must say that the approach speed is a rounded value and that a conversion of the 2026 paper's own inputs gives about 114 km/s, which would shorten the fall by about 0.1 Gyr.

**Not checked:** the formulas against a source (standard two-body results, checked by hand, by an independent stepped integration and by the tests); the journal versions of the papers; Wu and others' earlier paper; Salomon and others 2021; the 2 percent and 54 percent figures in the text.

## Implementation Notes (Steps 2 to 4, 2026-10-28)

**Step 2 (committed `de1aed4`, `189a386`): the introduction.** `LocalGroupCollisionExperiment.tsx` has the title, the status line, the introduction (the question, a "Words you will need" list, what a collision means, what the two studies did, what the learner will do, the note that predictions never change the real pictures, the assumptions) and six background links (NASA Space Place on galaxies, NASA Hubble on the Local Group, on dark matter and on galaxy collisions (a 1993 release), ESA on proper motion and on Gaia), each fetched on 2026-10-28. The papers and the NASA and ESA pages on the two studies are not yet listed: they are for after the run (they give "four billion", "4.5 billion" or "4 to 5 billion years", which would hint at Prediction 1) and come with the results step. Differences from the specification, for the owner's approval:
1. The introduction gives no date for the old textbook collision and no "3.8" (§12), although the specification's outline mentions the old textbook answer.
2. The proper-motion sentence says "tens of millionths of an arcsecond a year" and "tens of millions of times smaller than the Moon's width" (the first draft's "46 millionths" was wrong: 45.9 is one component of the proper motion).
3. The status line adds "'Contested' means that careful studies disagree."
4. Three values were added to the module for the introduction: `sidewaysRange2026()` (22.7 to 70.7), `APPROACH_SPEED_ALTERNATIVE_KM_S` (114) and `MONTE_CARLO_TRIALS_2025` (100,000).
5. There is no plain official page for dynamical friction or Monte Carlo (a §29 rule 3(b) gap, since recorded under rule 3(c) on 2026-10-29). Experiment 24's "What's next" still says "None yet" and is to be changed with the chapter summary.
6. The 30 km grain-of-sand comparison and the Moon's 1,800 arcseconds are calculated from standard values; no source was read.

**Step 3 (committed `c74a72e`): the two predictions.** Part 1 has both questions with the buttons from the module. Prediction 2's text gives the 20 kpc merger distance "for scale" (it is also a button value; the owner approved it). The guesses can be changed until Run is pressed, and are then locked.

**Step 4 (committed `5d9c668`, `45ab621`): the run.** Five stages with Picture 1 (a sketch of the two galaxies, and a log ruler of times from 0.3 to 30 billion years with the straight fall, the constant-speed time and the white guess) and Picture 2 (panel A, the orbit seen from above to scale in a box 1,600 kpc across; panel B, the first pass against the sideways speed on a log distance axis, with the 2026 give-or-take band, the 20 kpc line and the white guess). The module gained `orbitTrack`, `firstPassCurve`, `pictureOne`, `pictureTwo` and the two rulers (7 tests, checked by eleven deliberate breaks and against the stepped motion, including the position of the closest point). Differences from the specification:
1. **Prediction 2's guess is drawn only in panel B** (as a white line across the graph), not on the orbit picture beside the ring, because the ring and the first pass are only a few pixels wide in panel A.
2. The straight fall is pink and the constant-speed time violet (both imagined); the 2026 orbit is cyan and the 2025 orbit orange (calculated here from the studies' sideways speeds).
3. Panel A's middle is small; the caption says so. A zoomed close-up was not built.
4. The captions' "What to look for" items were rewritten at the owner's request in a longer, plainer form, with sums and a daily-life comparison, and "no sideways motion" is explained in both captions.
5. "Start over" was added after the run, as in Experiment 24.

## Implementation Notes (Steps 5 to 10, 2026-10-29)

**Step 5 (committed `25cb9b2`): Part 2 controls and Drawing A.** Differences from the specification (approved by the owner on 2026-10-29):
1. Drawing A keeps the 2026 study's orbit as a faint cyan reference, and its caption has a "worked moment".
2. **For an unbound pair the drawing shows the closest approach and no time.** The specification's test 5 said the module computes no first pass for an unbound orbit. For a sideways speed of 100 km/s with 1.8 trillion Suns (limit 92.0 km/s) the page shows 361.1 kpc, which an independent hyperbola calculation also gives (361.12), and says the pair "passes once and does not return".
3. The 0 km/s case reads "A straight fall: it ends at the Milky Way".

**Step 6 (committed `6ae13ff`): the results.**
1. Table 1 is the check-up, Table 2 the steps from the state now to the first pass, and Table 3 the two studies side by side. Each has a "What this table tells us" note, and the predictions are shown beside the results with a small tag on each row (the guess only, no verdict).
2. The papers and pages list is shown after the run, in the results.
3. The trial counts are 100,000 for the 2025 study (ESA's figure) and 10,000 in each set-up of the 2026 study.

**Step 7 (committed `efa7430`): the tutor.**
1. It follows the four-step sequence. The conceptual question, which the specification did not set, is whether doubling the sideways speed would double the first pass; the answer is "more than twice" (23.35 to 46.7 km/s gives 16.1 to 66.5 kpc, about 4.1 times).
2. `tutorFigures()` was added to the module (the turning amount, the speed at the first pass, the first passes for the trial speeds and for the ends of the 2026 range, the doubling), with a test checked by six deliberate breaks (five were caught at once; the sixth, the half-speed figure, led to an added assertion, committed `de836a8`).
3. The 47 km/s trial button is labelled in the tutor as "the button's rounded value of 46.7".

**Step 8 (committed `939797a`): the chapter summary.** Every number is read from the module. "What's next" says "None yet: this is the last experiment of the group". The Gaia DR4 date in it was confirmed on 2026-10-29 (see the sources table).

**Step 9: complete-flow test in Chrome (2026-10-29).** All 25 prediction pairs: the stages ran in order 1 to 5; the white marks appeared at stage 3 (Picture 1) and stage 4 (Picture 2) and carried the guess's own label; the tables were identical across pairs apart from the guess tags; the tutor's marks were correct in all 25; the summary appeared only after the tutor's explanation. All 15 control settings: first pass, time, period and straight fall agreed with a separate calculation (an RK4 integration of the orbit, a quadrature for the fall and Kepler's third law, with G taken from a standard constant). Not checked: the marks' pixel positions, other browsers, keyboard use and a real learner. At 420 px wide (checked in an iframe, because the window would not resize) the tables scroll sideways in a wrapper, and the drawings' text renders at only about 4 to 5 px, as in the group's other experiments.

**Step 10: final review (2026-10-29).** Fixed at the owner's request (committed `0c9707e`): "bound" is now defined in the introduction's words (it was first used in Picture 2's label and caption), and two tutor causes were softened ("may be part of why the median merger time is later", "may be one reason" for 50 against 90 percent). Still open: the ± 24.0 km/s is treated as one give-or-take range without reading the sentence that says so; there is no plain official page for dynamical friction or Monte Carlo (recorded under CLAUDE.md §29 rule 3(c), 2026-10-29); the skater, ball-on-a-string and ball-from-a-tower comparisons have no source; the journal versions of both papers were not read.
