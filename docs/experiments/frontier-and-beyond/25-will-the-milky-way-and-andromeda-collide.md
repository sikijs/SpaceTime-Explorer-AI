# Experiment 25 (Frontier and Beyond): Will the Milky Way and Andromeda Collide? (Two Studies, Two Answers)

**Status: PROPOSED by Claude on 2026-10-28 per `CLAUDE.md` §23 Stages 1 to 3, as a twenty-fifth experiment of the group, at the owner's request (2026-10-28: "lets do exp 24 first and then add exp 25 about galaxies with 2026 studies"). Specification APPROVED by the owner on 2026-10-28 ("approved as is", all thirteen decisions on their defaults, including Decision 11: the group's count became twenty-four experiments, numbered 1 to 15 and 17 to 25, in `00-group-proposal.md` and `CLAUDE.md`; `PROJECT.md` and `AGENTS.md` already say "any added later"). Step 1 BUILT on 2026-10-28: the physics model and its tests (`src/physics/localGroupCollision.ts` and `.test.ts`, 18 tests, checked by twenty-five deliberate breaks; see the Implementation Notes, Step 1). Not yet done: Steps 2 to 10. Every fact below came from search results, from the abstracts of two papers and from summarising fetches of their full text and of two web pages, all on 2026-10-28; none was read in a paper by Claude, and each number must be checked at its paper before the wording is approved (§29).**

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
Outline: Gravity Experiment 6 and Frontier and Beyond 24 recalled (orbits; open and closed paths); what a galaxy is, the Milky Way, Andromeda, the Local Group and the dark matter halos (Experiments 6 and 7); what a collision of galaxies means (almost no stars hit each other: the galaxies' gravity pulls them together and they become one galaxy over billions of years), with a daily-life comparison; the old textbook answer and the two new studies, with dates; what "sideways motion" and "approach speed" are and why one is measured with a spectrum (a Doppler shift, Cosmology 1) and the other with years of images (a millionth of an arcsecond a year); what the learner will do; that the predictions never change the real pictures; the assumptions. Terms defined before use: *galaxy*, *Local Group*, *halo*, *kiloparsec*, *billion years*, *approach speed*, *sideways speed (proper motion)*, *Gaia*, *dynamical friction*, *merger*, *Monte Carlo*, *give-or-take*. Held back until after the run: both predictions' answers (§12), and the published probabilities may be stated before the run (they are not the answers) but not the first-pass distance.

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
Gravity 6 and Frontier and Beyond 24 (orbits; Experiment 24's module is not reused, since the units and the closed orbit differ), Frontier and Beyond 6 and 7 and Cosmology 4 (dark matter halos), Cosmology 1 (Doppler shifts, the approach speed) and 9 (how galaxies grow by merging), Frontier and Beyond 1, 2 and 3 (two studies that disagree, and give-or-take).

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
| Sawala and others, "Apocalypse When? No Certainty of a Milky Way — Andromeda Collision", *Nature Astronomy*, June 2, 2025 (arXiv:2408.00064; DOI 10.1038/s41550-025-02563-1) | about 50 percent chance of no merger in 10 billion years; about 2 percent chance of a head-on collision in 4 to 5 billion years; M33 raises and the Large Magellanic Cloud lowers the chance; 100,000 trial runs; the sideways speed of about 76 km/s (from Gaia DR3, Salomon and others 2021); halo masses (Milky Way 1.0 ± 0.2, M31 1.3 ± 0.4, M33 0.3 ± 0.1, LMC 0.15 ± 0.05 × 10¹² Suns); a merger when two galaxies come within 20 kpc; two-body, with M33, with the LMC and four-body probabilities of about 44, 63, 37 and 54 percent | abstract read; the rest through a summarising fetch of the arXiv page's text (the proper-motion units printed as "mas/yr" are very probably μas/yr, to be checked) |
| ESA/Hubble release heic2508 (June 2025) | a plain account of the same study: 50-50 chance in 10 billion years, about 2 percent head-on in 4 to 5 billion; M33 and the LMC; more than a decade of Hubble data plus Gaia; 100,000 Monte Carlo trials | read |
| Wu, Huang, Zhang, Sun and Shao, "The Fate of the Milky Way–Andromeda System: To Merge or Not?" (arXiv:2603.22863, March 24, 2026; accepted by *ApJL*) | about 90 percent merger probability (range about 64.7 to 100 percent over the two-sigma region of M31's motion, from a secondary report), a median merger time of 6.5 (+1.3, −1.5) billion years; newer Gaia proper motions for M31 and M33 corrected for Gaia's systematic offsets; M31's sideways speed 46.7 ± 24.0 km/s, its proper motion (45.9 ± 8.1, −20.5 ± 6.6 μas/yr), the same halo masses; "a more radially dominated" orbit and the LMC effect reversed | abstract read; the rest through a summarising fetch of the arXiv page's text |
| Wikipedia, "Andromeda–Milky Way collision" | an approach speed of about 110 km/s; the 2012 expectation of a merger in about 5 billion years | read in part |
| Gaia Data Release 4 | planned for December 2, 2026 (five and a half years of data), from a search summary of ESA's pages | search summary only; to be checked at ESA's page |
| NASA, ESA, STScI plain pages on the Local Group, Andromeda and galaxy collisions | the "Want to know more?" list | **not yet found or fetched** |
| Van der Marel and others 2012, Salomon and others 2021 (M31's motion) | the earlier measurements behind both studies | not read |

## Facts that may change (§29)
| Fact | Why it may change |
|---|---|
| the probabilities of a merger (50 and 90 percent) | a new analysis, or Gaia DR4 (planned for December 2, 2026), may change the sideways speed |
| M31's sideways speed (about 76 and 46.7 ± 24.0 km/s) | later measurements; Gaia DR4 should reduce the give-or-take |
| the LMC's effect (suppresses in the 2025 study, reversed in the 2026 one) | it is the main thing the two studies disagree on besides the speed |
| the halo masses | later estimates |

## Open items
a. No paper was read directly: all numbers from the papers come from abstracts and summarising fetches and must be checked at the papers (especially the 76 km/s, the proper-motion units, the 46.7 ± 24.0 km/s and which frame each sideways speed is given in).
b. The approach speed, the Sun's-motion correction behind the 109 km/s and the distance are rounded or derived values and are to be checked; 109 km/s is from the 2012 literature through Wikipedia ("about 110").
c. The two-body orbit, Kepler's equation and the radial-fall time were worked by hand and by a separate script only, and must be checked at a source.
d. No plain official page for the Local Group, Andromeda's motion or galaxy collisions has been found (§29 rule 3(b)).
e. The statement that the 2026 study's differences come mainly from the sideways speed and the LMC's effect rests on its own summary; the 2026 paper itself should be read to say what else differs.
g. The statement that a first pass at 66 kiloparsecs lies well inside the halos' reach, the 64.7 to 100 percent range and the "about 2.5 million light-years" distance have no source read beyond summaries.
f. Whether the 2026 study's M31 sideways speed (46.7 ± 24.0 km/s) is in the Milky Way's frame (as the 2025 study's 76 km/s is described) is not confirmed.

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

**What the check of the papers found (2026-10-28, summarising fetches of their full text, not a reading by Claude):**
* The 2025 paper (arXiv:2408.00064) gives M31's proper motion as 48.9 ± 10.5 and −36.9 ± 8.1 (printed as "mas/yr", which cannot be right: arithmetic with the distance gives about 220 km/s for 48.9 and 36.9 microarcseconds a year and about 220,000 km/s for milliarcseconds, so they are very probably μas/yr), from Gaia DR3 (Salomon and others 2021); M31's line-of-sight velocity −301 ± 1 km/s (heliocentric). **The 76 km/s was not found as a sentence in the paper's text**; it came from the first summarising fetch ("tangential velocity ~76 km/s relative to MW") and remains unconfirmed.
* The 2026 paper (arXiv:2603.22863) gives "M31 transverse velocity, 46.7 ± 24.0 km/s", and a summary says its table gives velocities in the heliocentric frame. **That does not fit the arithmetic**: its proper motion (45.9 ± 8.1, −20.5 ± 6.6 μas/yr) at 761 kpc is about 181 km/s relative to the Sun, so 46.7 km/s is very probably the sideways speed relative to the Milky Way (after the Sun's motion is removed); the frame is therefore still unconfirmed, and the page must say "the sideways speed the study found (the frame to be checked)" until the paper is read.
* The 2026 paper says that "the updated M31 PM implies a more radially dominated MW–M31 orbit than found by [Sawala et al.], leading to a higher merger probability", and that the LMC's effect is "reversed relative to the result" of the 2025 paper.
These are open items a, e and f above, now narrower; the owner should say whether to read the two papers before the wording of Step 2 is approved.

**Not checked:** the formulas against a source (standard two-body results, checked by hand, by an independent stepped integration and by the tests); the 109 km/s at a source; the papers themselves.
