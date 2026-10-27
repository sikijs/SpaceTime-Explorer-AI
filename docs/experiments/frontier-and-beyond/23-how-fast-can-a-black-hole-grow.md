# Experiment 23 (Frontier and Beyond): How Fast Can a Black Hole Grow? (The "Little Red Dots")

**Status: PROPOSED by Claude on 2026-10-27 per `CLAUDE.md` §23 Stages 1 to 3, as the twenty-third experiment of the group (`00-group-proposal.md`, Part D, entry 23, marked ◇). Specification APPROVED by the owner on 2026-10-27 ("approve as is", read as all thirteen decisions on their defaults). Step 1 BUILT on 2026-10-27: the physics model and its tests (`src/physics/blackHoleGrowth.ts` and `.test.ts`, 24 tests, checked by ten deliberate breaks; one survived, a linear instead of a log nearest-button comparison, so a test and an export were added). Step 2 BUILT on 2026-10-27: the interface skeleton and introduction (`src/components/BlackHoleGrowthExperiment.tsx`, wired into `src/App.tsx` with a placeholder summary); its wording was APPROVED by the owner on 2026-10-27 ("approved"), after five rounds of changes (see the Implementation Notes, Step 2). Step 3 BUILT on 2026-10-27: the two predictions (Part 1 of `BlackHoleGrowthExperiment.tsx`; Run only records them); its wording was APPROVED by the owner on 2026-10-27 ("approve"). Step 4 BUILT on 2026-10-27: the run (five stages), Picture 1 and Picture 2 with the white guess marks and their captions (`src/components/BlackHoleGrowthPictures.tsx`, and `pictureOne()` and `pictureTwo()` added to the physics module, 30 tests); its wording and the five differences listed in its Implementation Notes were APPROVED by the owner on 2026-10-27 ("approve"). Step 5 BUILT on 2026-10-27: Part 2, "Now try it yourself" (two controls and Drawing A); its wording and the four differences listed in its Implementation Notes were APPROVED by the owner on 2026-10-27 ("approved"). Step 6 BUILT on 2026-10-27: Part 3, the results (`src/components/BlackHoleGrowthResults.tsx`, and `resultsCheckUp()`, `exampleSteps()` and `settingsGrid()` in the physics module, 41 tests); its wording was not approved line by line: the owner replied "commit and go to step 7", which Claude read as approval to commit and move on; the wording and the four differences listed in its Implementation Notes stay open for the owner's confirmation. Nothing else is built. Every fact below came from web search results and summaries on 2026-10-27 and was NOT read in its original paper; each must be checked at its source before the wording is approved (§29).**

> **Two changes to the group proposal's entry 23, for the owner's decision (Decisions 1 and 2).** (a) The proposal's example prediction ("10 Suns to 100 million Suns in 700 million years?") is a coin toss with the proposal's own numbers (16.1 growth times of 45 million years is 0.72 billion years, against 0.70), so it would teach nothing. The prediction below uses a real object instead. (b) The proposal says the black holes of little red dots "look surprisingly large". A 2025 *Nature* paper (Rusakov and others) argues the masses may be **about 100 times smaller** than first estimated, which would shrink the problem. The experiment therefore teaches the growth limit itself, which is settled physics, and says plainly that whether little red dots are a problem is **Open**.

## Overview

In Black Holes Experiment 1 the learner saw that a black hole's size follows its mass, and in Experiment 8 that matter falling in releases energy as light. Those two ideas combine into a speed limit. A black hole that feeds gets hot gas swirling around it that shines brightly, and that light pushes outward on the gas still trying to fall in. When the push equals the pull, the black hole cannot feed any faster. This is the **Eddington limit**. It has a surprising consequence: a black hole growing at its limit **doubles in a fixed time**, however heavy it is, so growth is exponential, and a light seed needs a minimum number of doublings to become heavy.

The James Webb Space Telescope (JWST) found, in the first billion years of the universe, many compact, very red sources, the "little red dots", and some show the signs of a growing black hole. One, CAPERS-LRD-z9, is seen as it was at redshift 9.288, when the universe was about half a billion years old, with a black hole estimated at about 38 million Suns (a range of 4.5 to 316 million). The experiment asks three questions:

1. **How fast can a black hole grow at most?** The learner finds the growth time at the limit (tens of millions of years) and sees that mass multiplies by the same factor in each equal span of time.
2. **Is there enough time?** The learner counts the doublings from a seed to 38 million Suns and compares the time they take with the time the universe had.
3. **What does that tell us, and what not?** A seed of ordinary stellar size has too little time at the limit; a heavier seed, a higher efficiency or growth faster than the limit each fixes it, and the sources do not agree which happened. The experiment does not choose.

The model is **the Eddington growth formula and the age of the universe, calculated here, set beside the published object**. It does not model the gas, the cocoon, how seeds form, or mergers.

## Learning Objective

By the end the learner can say, in their own words:

1. Light from the gas falling into a black hole pushes outward on that gas, which caps how fast a black hole can feed (the Eddington limit). The cap grows in step with the mass, so the mass grows by the same factor in each equal span of time (exponential growth).
2. The growth time is set by the share of the fallen mass that is turned into light (the efficiency, from Black Holes 8): a more efficient black hole shines more, pushes harder and grows more slowly.
3. A seed of 10 Suns growing at the limit needs about 15 growth times to reach 38 million Suns, about 0.76 billion years, longer than the half a billion years the universe had at redshift 9.3; a seed of 100,000 Suns needs about 6, about 0.30 billion years.
4. Little red dots are a population found by JWST whose nature is still debated: a growing black hole inside a dense cocoon of gas is one leading reading, and their black hole masses may be much lower than first estimated. A mass from a spectrum has a wide give-or-take.
5. What this shows and what not: the limit is physics; whether any real black hole beat it, or began heavy, is not settled.

## Physical Situation

JWST's spectra of a few little red dots show broad lines of hydrogen, the sign of gas moving fast near a black hole, but the lines' width may come from gas moving fast or from light scattering off electrons in a thick cocoon; the two readings give masses a factor of about 100 apart. CAPERS-LRD-z9 is the most distant of these at z = 9.288.

## Physics Model (`src/physics/blackHoleGrowth.ts`, to be written)

| Part | What it computes | Source |
|---|---|---|
| **Eddington growth time** | t_Edd = σ_T c ÷ (4π G m_p) ≈ 0.45 billion years; mass grows as M(t) = M₀ exp[(1 − ε) ÷ ε × t ÷ t_Edd], so one e-folding takes t_growth = ε ÷ (1 − ε) × t_Edd: **50 million years at ε = 0.10** (45 million if the (1 − ε) is dropped; see Decision 3) | textbook; worked by hand 2026-10-27, **to be checked** |
| **Efficiency** | ε = share of the fallen mass-energy radiated; Black Holes 8 gives about 5.7 percent for a non-spinning and up to about 42 percent for a maximally spinning black hole (reused) | Black Holes 8 |
| **Time to grow** | t = t_growth × ln(M_final ÷ M_seed): from 10 Suns to 38 million, ln(3.8 × 10⁶) = 15.1, so 0.76 billion years at ε = 0.1; from 10⁵ Suns, ln(380) = 5.9, so 0.30 billion years | arithmetic; by hand |
| **Age of the universe at redshift z** | reused from Frontier and Beyond 5's `ageAfterBigBangYears` (Planck values): about 0.52 billion years at z = 9.288 | Experiment 5's module |
| **Mass reached** | M = M₀ exp(t ÷ t_growth) for a seed that starts feeding at a chosen age | arithmetic |
| **Real object** | CAPERS-LRD-z9: z = 9.288; log(M ÷ M☉) = 7.58 ± 0.15 (about 38 million), range 4.5 to 316 million. Held as data | arXiv:2505.04609 abstract and summaries |
| **Answers** | the predictions' answers, nearest-button helpers and the tutor's marks | arithmetic |

The module invents no new physics. **Not modelled** (the page must say so): the gas and the cocoon, how the light is trapped, super-Eddington feeding (stated as a possibility), how seeds form (direct collapse, dense clusters, early stars), mergers of black holes (Experiments 18 to 20), the black hole's spin changing ε as it grows, and the mass uncertainty's origin. **Assumed and unsourced:** that a seed begins feeding at a given age (the controls expose it); this is a choice, not a measurement.

## Learner Controls ("Now try it yourself", trial values)

1. **Seed mass** (four buttons: 10, 1,000, 100,000 and 1 million Suns). The seeds are trial values, not claims about real seeds.
2. **Efficiency** (three buttons: 5.7 percent, 10 percent and 40 percent, from Black Holes 8's range).

Drawing A shows the trial seed's mass on a log ruler as it grows to the mass of CAPERS-LRD-z9, with the time it takes beside the time the universe had. It says its numbers are trial values.

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **A black hole of 10 Suns feeds at the Eddington limit, all the time, with 10 percent efficiency. How long does it take to reach 38 million Suns?** Five buttons on a log scale: about 3 million years, about 30 million, about 300 million, about 800 million, about 8 billion. Answer: about 760 million years (the calculation gives 0.76 billion; the buttons are balanced so the nearest is "about 800 million"). Drawn as a white mark on a log ruler of times, beside the age of the universe at z = 9.288 (Picture 1).
2. **What is the smallest seed, in Suns, that could reach 38 million Suns in the time the universe had if it started feeding when the universe was 100 million years old?** Five buttons on a log scale: about 10, 1,000, 30,000, 1 million, 10 million. Answer: about 8,300 Suns (the module's figure; the first draft's "about 40,000" was wrong). The buttons were rebalanced in Step 1 to about 10, 300, 10,000, 300,000 and 10 million Suns, so that the answer, "about 10,000", sits in the middle. Drawn as a white mark on a log ruler of seed masses (Picture 2).

The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only (§12, §13). 

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)
Outline: Black Holes 1 and 8 recalled; light pushing on gas, with a daily-life comparison (a crowd pushing through a door while someone pushes back: the harder it shines, the harder it is to feed); what exponential growth is (a bacterium dividing at fixed intervals; money with compound interest); what JWST found, and what a little red dot is; what redshift means for time (Frontier and Beyond 5); the learner's job; that the predictions never change the real pictures; the assumptions. Terms defined before use: *Eddington limit*, *efficiency*, *seed*, *e-folding / growth time*, *little red dot*, *cocoon*, *broad line*, *redshift*. Held back until after the run: both predictions' answers (§12). A "Want to know more?" list (§29): plain official pages (NASA or ESA or STScI on JWST and black holes), the discovery papers after the run.

### Display
1. **Picture 1, the clock for growth:** a log ruler of times from a million years to ten billion years, with the growth time, the time to reach 38 million Suns from 10 Suns, and the age of the universe at z = 9.288, and Prediction 1's white mark.
2. **Picture 2, the seed ruler:** a log ruler of masses from 1 Sun to 316 million Suns with the seed sizes, CAPERS-LRD-z9's mass and its published range, and Prediction 2's white mark.
3. **Drawing A (follows the controls):** the trial seed's growth, time taken and the verdict "fits / does not fit the time the universe had".
Each picture has a "How to read this diagram" caption with look-at / what-it-means / why-it-matters items (§14, §29) and a "Where the real picture comes from" line.

### Run
Five stages: the black hole and the push of light; the doubling time; the count of doublings; the clock of the universe; the real object. Guesses appear once the feature beside them is drawn.

### Results (neutral, then explained by the tutor)
A check-up table (growth time and time to 38 million Suns against the universe's age; the object's mass against its published range), then two more tables (steps from the limit to the time; what other efficiencies and seeds would give), each with a "What this table tells us" note (§14). The predictions beside the results, tagged on the row. No "right" or "wrong".

### Tutor (Part 4)
Predict, observe, compare, explain (§13): why light caps feeding; why the cap grows with mass; why doublings are the unit; what a heavier seed, a higher efficiency or faster-than-limit feeding would each change; why a mass from a spectrum can be off by a factor of 100; what is not settled.

## Expected Observations
t_growth about 50 million years at 10 percent; 10 Suns to 38 million Suns takes about 0.76 billion years against the universe's 0.52 billion at z = 9.288; a seed of 100,000 Suns takes about 0.30 billion.

## Expected Learner Understanding
That a speed limit on feeding turns "how heavy" into "how many doublings, and how long"; that tension appears only if the seed is light and the black hole is heavy; and that a fast-growth claim rests on a mass estimate with a large give-or-take.

## New Concepts Introduced
Eddington limit, accretion efficiency, growth (e-folding) time, black hole seed, little red dot.

## Relationship to Previous Experiments
Black Holes 1 (size and mass), 8 (energy released, efficiency), 9 (a star's end, one route to a seed); Cosmology 6 and this group's Experiment 5 (the age of the universe, redshift, the earliest galaxies); Experiments 18 to 20 (mergers, a rival way to grow); Experiment 1 (give-or-take).

## Relationship to Later Experiments
Experiment 24 is unrelated (an orbit); this is the last of the group's black hole experiments.

## Required Physics Tests (each must fail when the module is deliberately broken)
1. t_Edd = 0.45 billion years (± 0.01), worked separately in SI units from σ_T, c, G and m_p.
2. t_growth at ε = 0.10 is 50 million years (± 1); at 5.7 percent it is shorter, and at 40 percent longer (ε ÷ (1 − ε) is rising in ε).
3. Time to grow from 10 to 38 million Suns is 0.76 billion years (± 0.02); from 10⁵ Suns it is 0.30 billion years (± 0.01).
4. Doubling the seed removes exactly one ln 2 growth time; the mass multiplies by the same factor in equal spans of time.
5. The age of the universe at z = 9.288 matches Experiment 5's module (about 0.52 billion years).
6. The smallest seed that fits is the inverse of the growth formula (a round trip: grow it for the time and get 38 million).
7. The nearest-answer helpers pick the closest button on a log scale.
8. The published object is held as listed (z = 9.288; log M = 7.58 ± 0.15; range 4.5 to 316 million).
9. The verdict "fits / does not fit" changes at the boundary seed and not before.
10. The module does not change when predictions change (separation, §9, §14).

## Sources (checked 2026-10-27, search results and summaries only; none read in full)
| Source | What it was used for | Status |
|---|---|---|
| CAPERS-LRD-z9, arXiv:2505.04609 | z = 9.288; broad Hβ; log M = 7.58 ± 0.15; range 4.5 to 316 million | abstract through summaries |
| "Little red dots as young supermassive black holes in dense ionized cocoons", *Nature* (s41586-025-09900-4) | electron-scattered broad lines; masses of 10⁵ to 10⁷ Suns, about 100 times lower than earlier estimates | summary |
| "Overmassive black holes and little red dots naturally form in simulations", *Nature* 2026 (s41586-026-10985-8); ScienceDaily, September 2026 ("growing at incredible speeds") | a rival reading: fast growth from heavy seeds | titles and summaries only |
| "Little Red Dots: The Assembly of Early Supermassive Black Holes in the JWST Era" (arXiv:2601.00089); "The Little Red Dots Are Direct Collapse Black Holes" (arXiv:2601.14368) | the debate | titles and summaries only |
| Scientific American "black hole stars" | the "black hole star" reading | title and summary |
| NASA, ESA and STScI plain pages on the Eddington limit, JWST and black holes | the "Want to know more?" list | **not yet found or fetched** |

## Facts that may change (§29)
| Fact | Why it may change |
|---|---|
| CAPERS-LRD-z9's mass and range | later spectra may revise it, and the cocoon reading may lower it |
| "little red dots' nature is debated" | a consensus may form |
| "the most distant broad-line object" | a more distant one may be found |
| the efficiency and Eddington time | textbook values, to be checked |

## Open items
a. No paper was read in full; all numbers come from summaries.
b. The 0.45 billion years, the (1 − ε) factor, the efficiency range, and the seed-start age are textbook or chosen values with no source read.
c. The 2026 *Nature* simulation and the September 2026 report were seen only by title and summary and may bear on the status label.
d. Plain official pages for the Eddington limit and for little red dots are to be found and fetched (§29 rule 3).
e. The mass of CAPERS-LRD-z9 depends on the reading of its lines; the page must say that "the mass is the reading under one assumption".

## Decisions for the owner (each with a default)
1. **Anchor and status label.** Keep the physics of the growth limit as the core, use CAPERS-LRD-z9 as the real object, and label the experiment: Settled (the Eddington limit and exponential growth); Strong evidence (JWST sees growing black holes very early); Open (whether any broke the limit or started heavy, and what little red dots are). Default: as stated.
2. **Change the proposal's prediction** (10 to 100 million Suns in 700 million years, a toss-up) to the two predictions above. Default: yes.
3. **Growth time:** use ε ÷ (1 − ε) × 0.45 billion years (50 million years at 10 percent) and say that some texts quote 45 million. Default: yes.
4. **Controls:** seed mass and efficiency, as trial values; no control for super-Eddington feeding. Default: yes.
5. **Two predictions** with five buttons each, balanced on a log scale. Default: yes.
6. **Pictures:** two pictures and one drawing. Default: yes.
7. **Results:** a check-up and two more tables; no table of trial values. Default: yes.
8. **Seed-start age** of 100 million years, stated as a choice and not a measurement. Default: yes.
9. **A 2026 search** for newer results is repeated before the wording is approved. Default: yes.
10. **Tutor:** the standard four-step sequence. Default: yes.
11. **Introduction length and links:** long and detailed, to §29. Default: yes.
12. **Title** "How fast can a black hole grow?" (does not give away either prediction). Default: keep.
13. **Whether to build it at all.** The group proposal marked this ◇ (drop first), and the "little red dots" nature is still debated. Default: build it, with the status label above.

## Implementation Notes (Step 1, 2026-10-27)

The physics model is built (`src/physics/blackHoleGrowth.ts`, 24 tests). Differences from the specification, for the owner's approval:

1. **Prediction 2's buttons** are 10, 300, 10,000, 300,000 and 10 million Suns (the draft had 10, 1,000, 30,000, 1 million and 10 million, which put the answer off-centre). Its answer is 8,284 Suns, button "about 10,000".
2. **The 40 percent efficiency** is held as a trial value; Black Holes 8's own function is reused only for the non-spinning 5.7 percent. The limit for a black hole spinning as fast as possible, 1 − 1/√3 = 42.3 percent, is a hand value (to be checked), and Black Holes 8's slider stops at spin 0.99, which gives less.
3. **A finding the specification did not have.** The universe's age at z = 9.288 is 0.522 billion years, so a seed that starts feeding at 100 million years has 0.422 billion years. At **5.7 percent efficiency a 10-Sun seed does fit (414 million years needed)**, by a margin of 2 percent; at 10 percent it needs 758 million years (does not fit), and at 40 percent even a million-Sun seed does not fit (1.09 billion years). Drawing A will show this, and the tutor must not say that a stellar seed "cannot" reach the mass. This is a model result (the efficiency of a non-spinning black hole, no mergers, constant feeding at the limit), not a measurement.
4. **Prediction 1's answer** is 0.758 billion years, button "about 800 million".
5. The module's age of the universe is Experiment 5's function, so it is the Planck-value age (0.522 billion years), not the 0.5 the introduction may round to.

## Implementation Notes (Step 2, 2026-10-27)

Built: the title, the status line, the introduction (question, how a black hole feeds, the speed limit with a crowd-at-a-doorway comparison, exponential growth with a bacterium comparison, seeds, what JWST found, what is debated, the learner's job, "What your guesses do" per §14, and what is and is not modelled), a collapsed "Words and formulas" panel of twelve entries, and a "Want to know more?" list with two links. No predictions, run, pictures, controls, results, tutor or summary yet.

1. **Held back until after the run (§12):** NASA's Chandra page on a black hole growing faster than the limit (it gives a plain definition of the Eddington limit, but also says a conventional seed is "less than a hundred Suns", which hints at Prediction 2), and all papers. A `?` for the owner: the Chandra page could instead be listed before the run for its plain definition of the limit.
2. **Pre-run links (fetched 2026-10-27):** NASA's "Black Holes" page (loads; says nothing about how black holes grow, so it serves only as general background) and NASA's January 2025 "Newfound galaxy class may indicate early black hole growth, Webb finds" (loads; what little red dots look like, and that some show signs of growing black holes).
3. **Source status of the introduction's claims:** the Eddington limit's plain description agrees with the NASA Chandra page; the light-pushes, crowd and bacterium comparisons, the disc of swirling gas, the infrared and look-back-time sentences, and "seeds from a massive star's collapse would be tens of Suns" have no source read; JWST's launch month (December 2021) and "first observing in 2022" are from memory and a search summary; "masses could be much smaller" is from the Nature 2025 title and summary only.
4. **Checked:** the type check and all 1,679 tests pass; the page renders in Chrome at the local address; the pre-run text does not contain either answer (0.76, 760, 8,300, 50 million were searched for). Not checked: narrow widths, other browsers, keyboard, a real learner.

**Changes made to the Step 2 wording at the owner's request (2026-10-27), all approved:**
5. "Feed" is defined in the first paragraph (taking in gas, called accretion), and the status line says "take in gas, and so grow".
6. "Light pushes" no longer says the Sun's push can be felt on the skin (it cannot; one feels warmth): light carries a small push, too small to feel from the Sun, but enough to drive a spacecraft with a mirror sail.
7. The speed-limit passage was rewritten twice: five numbered steps (the pull stays the same; more gas, a brighter glow; a brighter glow, a bigger push; the push grows with the gas supply and the pull does not; beyond that the push wins), then the doorway comparison and the Eddington limit's name, stressing that what is limited is how brightly the gas can shine before it pushes the rest away.
8. A new "Efficiency" paragraph with a made-up worked example (a cap of 10 kg's worth of light a year: 10 percent efficiency lets 100 kg in and keeps 90; 50 percent lets 20 kg in and keeps 10) and a fire comparison.
9. "Nothing is burning" (no surface, no fusion; the gas glows because falling in heats it, like a meteor) was added to the first paragraph and to the Words panel's "Accretion" entry, and the lead-in notes that the hot gas has its own pressure but the limit is about the light's push.
Still without a source: the light-pushes, solar-sail, doorway, fire and meteor comparisons, the made-up example, and the claim that the limit counts only the light's push (NASA's Chandra page says "radiation pressure balances the black hole's gravity").

## Implementation Notes (Step 3, 2026-10-27)

Built: Part 1 with the two predictions (five buttons each, from the module's `TIME_CHOICES` and `SEED_CHOICES`), a "What we are about to do" lead, and Run, which only records the guesses (no run, pictures or white marks yet; those are Step 4).

1. **Wording of Prediction 1:** a black hole of 10 Suns feeds at the Eddington limit all the time, at 10 percent efficiency; how long to reach about 38 million Suns, the estimated mass of CAPERS-LRD-z9?
2. **Wording of Prediction 2:** a seed begins to feed when the universe is 100 million years old, at the limit, at 10 percent; CAPERS-LRD-z9 is seen when the universe was about 520 million years old, so it has about 420 million years; about how small can the seed be? The three numbers (100, 520 and 420 million years, and 38 million Suns) come from the module and are rounded for display. The 520 million and 420 million were not in the specification's wording (the introduction says "about half a billion"); they are needed to pose the question.
3. **Neither prediction's wording gives an answer.** Searched for 758, 8,284, 8,300, 0.76 and "doublings" on the page: none found. The "50 million" growth time is not on the page either.
4. **Checked:** the type check is clean; in Chrome the Run button is disabled until both are chosen, a chosen button is marked, Run records them and Start over clears them. Not checked: narrow widths, other browsers, keyboard.

**Change made to the wording at the owner's request after Step 3 (2026-10-27), approved:** "turned into light" was replaced everywhere (the Efficiency paragraph of the introduction, the Words panel's "Efficiency" entry and Prediction 1). The gas is not converted into light: it is swallowed, and on the way in it gives out some of its stored energy (E = mc²), because falling makes it speed up, rubbing heats it, and hot gas glows; efficiency is how much of that stored energy is given out as light. The worked example says "light that carries the energy of 10 kilograms". Without a source read: the rubbing-heats-the-gas and hot-gas-glows explanations.

## Implementation Notes (Step 4, 2026-10-27)

Built: the Run button starts a five-stage run (stage timer 2,600 ms, presentation only); Picture 1 (panel A: a sketch of a black hole with a glowing gas disc, a violet arrow for gravity and a yellow arrow for the light's push, and from stage 2 a staircase of bars for the mass after 0 to 5 growth times; panel B, from stage 3: a log ruler of times with one growth time, the time needed, the universe's age at the object, the imagined start of feeding and the time available, and the white "YOUR GUESS" for Prediction 1); Picture 2 (stage 5: a log ruler of masses with the object's estimated mass and range, the smallest seed, a 10-Sun seed and the white "YOUR GUESS" for Prediction 2); a "How to read" caption under each, with a worked moment, "Look at / What it means / Why it matters" items and a "Where the real picture comes from" line. The module gained `pictureOne()`, `pictureTwo()` and ruler ticks (6 tests, five deliberate breaks all caught). The experiment now takes `onComplete`.

Differences from the specification, for the owner's approval:
1. **The staircase** (panel A of Picture 1) was not in the specification, which had only the time ruler; it was added to show "the same factor each time" before the ruler is used.
2. **Picture 1 has a sketch panel A and a ruler panel B, and Picture 2 is a ruler only**, as the specification said; the specification's "Drawing A" is still to come (Step 5).
3. **The pale cyan band** (the time available, 422 million years) is calculated from the 100-million-year start, which is imagined for the question and drawn in pink.
4. **Stage names:** 1 A black hole feeds; 2 Growth that multiplies; 3 How long to reach the mass; 4 The clock of the universe; 5 The black hole of CAPERS-LRD-z9 and the smallest seed.
5. **Not yet built:** the "Now try it yourself" part, the results, the tutor, the post-run links (including NASA's Chandra page, held back since Step 2) and the chapter summary.

**What was checked.** In Chrome: all five stages draw in order; the white marker moved with the guess (3 million years against 8 billion years, 10 Suns against 10 million Suns) and every real dot stayed in the same place; the YOUR GUESS box shows each guess; Start over clears the pictures. The type check is clean and all tests pass. Two layout faults found in the browser were fixed (a clipped "1,484 Suns" and the stair-step title, and labels that the lines crossed on the time ruler). **Not checked:** narrow widths, other browsers, keyboard use, a real learner, and the captions read line by line by the owner.

**Unsourced:** the 450-million-year Eddington time and the formula behind it (textbook), the 10 percent efficiency (a choice), and the claim that the black hole's range of 4.5 to 316 million Suns comes from one reading of a spectral line.

## Implementation Notes (Step 5, 2026-10-27)

Built: Part 2, shown once the run is complete: a lead paragraph (what the learner does, and that the real pictures do not change and the two guesses do not change this drawing, only the two settings do, §14), a paragraph saying these are trial values (pink, imagined), two controls (seed: 10, 1,000, 100,000 and 1 million Suns; efficiency: 5.7, 10 and 40 percent, each with a short label) and Drawing A with its caption. The module's `trialPicture` gained the age at which the trial seed reaches the object's mass, its position, the fixed marks, and how late or early it is (4 new tests, four deliberate breaks all caught). Both controls start on Picture 1's own values, so the pink dot starts on the dashed line.

Differences from the specification, for the owner's approval:
1. **Drawing A is a ruler of the age of the universe**, with the age at which the trial seed reaches the mass (pink dot), the age at which CAPERS-LRD-z9's light left (solid cyan line), the imagined start (pink line), the time available (pale band) and Picture 1's black hole (dashed cyan line). The specification described the trial seed's mass on a log ruler growing to the object's mass, with the time taken beside the time the universe had. The age ruler shows "in time or too late" at a glance and reuses Picture 1's time ruler.
2. **Four text lines under the ruler** give the seed, the efficiency, one growth time, the growth times and doublings, the time needed against the time available, and a verdict ("in time" or "too late", with how many years before or after). The verdict states a fact of the model and is not a conclusion about real black holes.
3. **Efficiency labels:** 5.7 percent "(a black hole that is not spinning)", 10 percent "(the value used above)", 40 percent "(near the most that a spinning black hole can give)", pointing back to Black Holes Experiment 8, which defines spin; this page does not define "spinning" itself.
4. **A finding to bring to the tutor:** at 5.7 percent a 10-Sun seed does reach the mass in time (514 million years, against the object's 522), and at 10 percent it is too late (858 million); at 40 percent nothing in the control fits. The page states the numbers and not a conclusion; the tutor will have to say that a stellar seed is not ruled out by this model.

**What was checked.** In Chrome: Part 2 appears only after the run; all 12 control settings (4 seeds by 3 efficiencies) gave the age shown in the pink box and the verdict ("in time" or "too late") that a separate calculation in the page gives, with the Eddington time computed from the constants; Drawing A read cleanly after two layout fixes (a clipped verdict line, an axis note over the band). The type check is clean and all tests pass. **Not checked:** narrow widths, other browsers, keyboard use, a real learner, and the owner's reading of the wording.

## Implementation Notes (Step 6, 2026-10-27)

Built: Part 3, shown once the run is complete: a lead paragraph ("These tables never change with your guesses or settings"); a "Where this stands" card (Settled, Strong evidence, Open); a block that shows each guess again with the table rows where its number is, not marked; a "How to read these results" paragraph; and three tables, each with a "What this table tells us" note (what it is, what it means with the real numbers, why it matters, how sure the numbers are). **Table 1, the check-up,** has six rows: the time for 10 Suns against the time available (More: 1.8 times); the age of the universe at the object against "about half a billion years" (The same, to the nearest 100 million years); the smallest seed against the 10-Sun seed (More: about 828 times heavier); the Eddington time against "about 450 million years" (The same, to the nearest 10 million years); the object's mass against the authors' range (Inside the range); and the time for 10 Suns to reach the two ends of that range (More at both ends: 1.5 to 2.0 times). **Table 2** gives the steps from the Eddington time to the time needed for Picture 1's black hole. **Table 3** gives the time for every seed and efficiency of the control, with "in time" or "too late". The guesses are tagged on the rows (Prediction 1 on Table 1 row 1, Table 2 "Time needed" and Table 3's 10-Suns row; Prediction 2 on Table 1 row 3). There is no table of the learner's own settings (Decision 7).

The module gained `compareToReference` (says "the same" only when the value rounds to the reference at the reference's own precision, so no cut-off is invented, §14) and `placeInRange`, with 7 new tests (five deliberate breaks, all caught).

Differences from the specification, for the owner's approval:
1. **Table 1 has six rows,** not the two groups the specification named; the last two rows (the object's mass against its range, and the time for 10 Suns at the two ends of the range) were added because the range is the weak link and the learner should see that the comparison with the time available holds over the whole range.
2. **Table 3 is a fixed grid** of every seed against every efficiency of the control (the specification said "what other efficiencies and seeds would give"). It does not follow the learner's settings.
3. **Two references are from search summaries,** not pages read: "about 450 million years" for the Eddington time, and "about half a billion years" for the age of the universe at the object. Both are stated as such in the table.
4. **No verdict.** The notes state numbers and comparisons; why a higher efficiency makes growth slower, what a heavy seed or faster feeding would change, and what the table does and does not say about real black holes, are left to the tutor.

**What was checked.** In Chrome: Part 3 appears only after the run; all three tables show the expected numbers (Table 1's six rows, Table 2's thirteen steps, Table 3's twelve cells agree with Drawing A's separate calculation of Step 5); the guesses are tagged on the right rows; the type check is clean and all tests pass. **Not checked:** narrow widths (the tables scroll sideways), other browsers, keyboard use, a real learner, and the owner's reading of the wording.
