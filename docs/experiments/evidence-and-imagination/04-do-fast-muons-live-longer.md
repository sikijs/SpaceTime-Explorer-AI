# Experiment 4 (Evidence and Imagination): How Long Does a Muon Live?

**Status: specification APPROVED by the owner on 2026-10-31 ("approved, all defaults": all twelve decisions on their defaults, including the title "How long does a muon live?"). Built, tested and finally reviewed on 2026-10-31 (see "Implementation Notes").** Proposed by Claude on 2026-10-31 per `CLAUDE.md` §23 Stages 2 and 3, as Experiment 4 of the group (`00-group-proposal.md`, approved as a direction on 2026-10-29). Sources read are listed under "Sources" (searched 2026-10-31); no paper was read in full. The file name `04-do-fast-muons-live-longer.md` is kept.

> **Four things for the owner's attention (decisions 1, 3, 7 and 8).**
> (a) **Title.** The group's working title, "Do fast muons live longer?", gives away Prediction 2's answer ("yes"). Six neutral candidates are in Decision 1, with a default.
> (b) **Which tests.** The experiment models two real tests: Frisch and Smith's 1962 count of muons on a mountain and at sea level, and the 1977 CERN storage-ring lifetimes. Rossi and Hall's 1941 test is named, not modelled (Decision 3).
> (c) **The Frisch and Smith numbers are second-hand.** The paper's page returned 403 on 2026-10-31, so its counts (563 and 412 muons an hour, a factor of 8.8 ± 0.8) come only from Wikipedia's account of it. The CERN ring figures come from the paper's own abstract (read). Decision 7 asks how to show the second-hand figures.
> (d) **The model is simple on purpose.** One speed, one straight fall, no energy loss. The real mountain test accounted for the muons slowing down, so the page's 74.7 percent is a rough model of a result that the paper worked out more carefully. The page says so (Decision 4).

## Overview

A muon is a particle like a heavy electron. At rest it does not last: on average it falls apart after about **2.197 millionths of a second** (2.197 µs). In that time even light goes only 659 m. Yet muons made about 15 km up in the air by cosmic rays reach the ground in large numbers. And in a ring at CERN, muons going round at 0.9994 c lasted about **64.4 µs**, 29 times longer than at rest.

1. **The clock at rest.** A muon's decay is a clock: each muon has the same chance of falling apart in each moment. After one average lifetime, about 37 in 100 are left; after three, about 5 in 100. This is the reference.
2. **Test 1: a mountain and the sea (Frisch and Smith, 1962, published 1963).** Muons moving at about 0.995 c were counted on top of Mount Washington (1,917 m) and again at sea level. The fall takes about 6.4 µs, nearly three lifetimes at rest, so about 5 in 100 should remain if a muon's lifetime did not change. Wikipedia's account of the paper gives 563 muons an hour on the mountain and 412 at sea level (73 in 100), which the paper reads as a lifetime stretched by a factor of 8.8 ± 0.8.
3. **Test 2: a ring (Bailey and others, CERN, 1977).** Muons stored in a ring at γ = 29.33 (speed 0.99942 c) lasted τ⁺ = 64.419 ± 0.058 µs and τ⁻ = 64.368 ± 0.029 µs. Special relativity's prediction from the rest lifetime is 29.33 × 2.1970 = 64.44 µs. The paper states that the time-dilation factor agrees with experiment to a fractional error of 2 × 10⁻³ at 95 percent confidence.
4. **Two ways to say the same thing.** The muon's own view: the 1,917 m of air is squeezed (Relativity 6) to 191.5 m at 0.995 c, so its trip takes only 0.64 µs of its own time. The ground's view: the trip takes 6.43 µs, but the muon's clock runs slow (Relativity 3 and 4). Both give the same share still alive, 74.7 percent in this model.

The status is **Settled**: muon lifetimes have been measured in flight in the atmosphere (1941, 1962) and in a ring (1977), and special relativity predicts them. The experiment claims no new result, and the page says the tests are old.

## Learning Objective

By the end the learner can say, in their own words:

1. A muon's decay works like a clock, with an average lifetime of about 2.2 µs at rest, and the share left falls the same way each lifetime.
2. At rest or without time dilation, almost no muons made high up would reach the ground (about 5 in 100 over 1,917 m at 0.995 c, and about 1 in 10 billion over 15 km).
3. In flight, muons last much longer as the lab measures it: by a factor of about 10 at 0.995 c, and 29 at 0.99942 c, which was measured to about 0.2 percent.
4. The ground and the muon describe the trip differently (a slow clock, a short road) but agree on how many muons arrive.
5. The tests agree with the prediction; the model is simple and the real tests were more careful.

## Physical Situation

A muon made high above the ground, falling straight down at a steady speed v toward a detector at height H above sea level. The question: what share of such muons are still alive when they get there? The same model gives the average lifetime in a ring. Everything uses the lab's frame (the ground) and the muon's frame (moving with it), as in Relativity 2 to 6.

## Physics Model (`src/physics/muonLifetime.ts`, to be written; may import nothing)

| Part | What it computes | Source |
|---|---|---|
| **The rest lifetime** | τ₀ = 2.1969811 µs (the average life of a muon at rest) | PDG, `pdglive.lbl.gov/view/S004T`, read 2026-10-31 (value 2.1969811 ± 0.0000022 × 10⁻⁶ s, mostly the MuLan experiment, 2013) |
| **The factor** | γ = 1 ÷ √(1 − β²), β = v ÷ c; and β from γ | standard special relativity (Relativity 3 and 4) |
| **Share alive, everyday** | exp(−t ÷ τ₀), t = H ÷ (β c) | the exponential law of decay (a Words entry; the law itself has no official page read) |
| **Share alive, with the slow clock** | exp(−t ÷ (γ τ₀)) | special relativity; the same law with the slowed lifetime |
| **The muon's view** | road length H ÷ γ, trip time t ÷ γ in muon time, in units of τ₀, and the share exp(−(t ÷ γ) ÷ τ₀), equal to the line above | Relativity 4 and 6 |
| **Ring lifetime** | lab lifetime γ τ₀; compared with 64.419 ± 0.058 µs (μ⁺) and 64.368 ± 0.029 µs (μ⁻) | Bailey and others 1977, abstract (read) |
| **Frisch and Smith** | H = 1,917 m, β = 0.995 (and 0.9954 as the upper end), the counts 563 and 412, the factors 8.8 ± 0.8, 10.2 at the top, 6.8 at the bottom and 8.4 ± 2 on average | Wikipedia's "Experimental testing of time dilation", read 2026-10-31; **the paper was not read** |
| **Comparison helpers** | difference, percent difference, "within the quoted give-or-take" | arithmetic |
| **Answers** | each prediction's answer and a nearest-button helper | arithmetic |

**Numbers the model gives (computed 2026-10-31, to be tested):** at 0.995 c, γ = 10.013; the fall over 1,917 m takes 6.427 µs (2.925 lifetimes); share alive 5.37 percent without the slow clock and 74.67 percent with it; the road in the muon's view is 191.5 m and the trip 0.642 µs (0.292 lifetimes). At 0.99942 c (γ = 29.33), γ τ₀ = 64.44 µs; the measured τ⁺ is 0.018 µs below it, inside its ± 0.058, and the measured τ⁻ is 0.069 µs (0.11 percent) below it, which is 2.4 times its ± 0.029, though the paper's own rest value for μ⁻ (2.1948 µs) differs from the PDG's by 0.10 percent and the paper's limit is 0.2 percent (see Open item c).

**Not modelled (and the page says so):** the muons slowing down on the way (Frisch and Smith corrected for it, and the page's constant-speed 74.7 percent is rougher than their factor of 8.4 ± 2); the spread of birth heights and speeds (the model uses a chosen height); how cosmic rays make pions and muons (named in a sentence); which way the muon's decay products fly; the difference between μ⁺ and μ⁻ (CPT, named at most); the effect of acceleration around the ring (Wikipedia says about 10¹⁸ g and no effect; the abstract does not, so it is not on the page); gravity's tiny effect on the muon's clock.

## Learner Controls ("Now try it yourself", trial values)

1. **Speed** (buttons 0.5 c, 0.9 c, 0.995 c, 0.99942 c (the ring), 0.99999 c).
2. **Height at the start** (buttons 1.917 km (Mount Washington), 5 km, 10 km, 15 km (a typical birth height)).

Drawing A shows, for the chosen pair, the trip time, the share alive without and with the slow clock, and the muon's road and clock time, on a share ruler. These are trial values, not new measurements; the real pictures do not change with them. The grid (computed 2026-10-31): share alive with the slow clock at 1.917 km runs from 0.65 percent (0.5 c) to 74.7 percent (0.995 c) and 98.7 percent (0.99999 c); at 15 km it is 10.2 percent at 0.995 c and 46.0 percent at 0.99942 c (the speed with γ = 29.33).

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **Muons moving at 0.995 c fall from the top of Mount Washington (1,917 m) to sea level. A muon lasts 2.2 millionths of a second on average when it is at rest. Out of every 100 muons that pass the mountain top, about how many are still alive at sea level?** Five buttons: about 5, about 25, about 50, about 75, about 95. Answer: **about 75** (74.7 in the model). Drawn as a white mark on a share ruler beside the real result.
2. **Muons are stored in a ring at CERN and go round at 0.99942 c. At rest they last 2.2 millionths of a second on average. How long do they last on average, as the lab's clocks measure it?** Five buttons: about 2.2 µs, about 7 µs, about 20 µs, about 65 µs, about 200 µs. Answer: **about 65 µs** (64.4). Drawn as a white mark on a log ruler of lifetimes, beside the real result.

The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only. The questions never say "time dilation", "slow clock" or give the factor (§12).

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)

Outline: what a muon is (a heavy cousin of the electron, made when cosmic rays hit the air; "cosmic ray" defined in plain words); what "decay" and "average lifetime" mean, and what "share still alive" means with a worked example (after one lifetime 37 in 100, after two 14, after three 5); that light goes only about 660 m in one lifetime, so a muon should barely reach the ground from 15 km; what the learner will do; that the predictions never change the real pictures; assumptions (steady speed, straight line, no energy loss). Terms defined before use: *muon*, *cosmic ray*, *decay*, *average lifetime*, *share*, *relative to the lab* (a reminder of Relativity 2), *storage ring* (only where it appears, after Prediction 1). **Held back until after the run:** both predictions' answers, the factor γ and any statement that a moving muon lasts longer (§12). The "Want to know more?" list gives the original papers after the run and background pages before; where no plain official page exists, §29 rule 3(c) applies (see Sources).

### Display

1. **Picture 1, the mountain and the sea (calculated here, with Frisch and Smith's counts as measured):** a mountain 1,917 m above a sea-level detector, the muon's fall at 0.995 c; a share ruler from 0 to 100 percent with two calculated marks (without and with the slow clock) and the measured 73 percent (412 of 563, as Wikipedia summarises the paper); the white guess for Prediction 1.
2. **Picture 2, the ring (measured, CERN 1977; calculated here):** a log ruler of average lifetimes in µs with the rest value (2.197), the calculated lab value (64.44) and the two measured values with their give-or-takes; the white guess for Prediction 2.
3. **Picture 3, the muon's view (calculated here, imagined for the question):** the same fall as the muon sees it: the air column squeezed to 191.5 m and a trip of 0.64 µs, in units of the rest lifetime, with the same share alive; labelled as a way of describing, not a separate measurement.
4. **Drawing A (follows the controls).**
Each has a "How to read this diagram" caption (§14, §29) with look-at, what-it-means and why-it-matters items and a "Where the real picture comes from" line separating **measured** (Frisch and Smith, Bailey and others, MuLan), **calculated here** (the shares, γ and the contracted road) and **imagined for the question** (the steady fall, a muon with a clock and a ruler of its own).

### Run

Five stages: the clock at rest (the share left after one, two and three lifetimes); the fall with no change to the lifetime (Picture 1, the everyday share); the count at the two stations (the measured mark); the ring (Picture 2); the same fall in the muon's view (Picture 3). Guesses appear once the feature beside them is drawn.

### Results (neutral, then explained by the tutor)

A check-up (the share by the model against the counted share and the paper's factors; the ring's predicted lifetime against its two measured lifetimes and the paper's 2 × 10⁻³ at 95 percent; the rest lifetime and how sure it is), a steps table (the same numbers for both predictions), and a table of what has been tested, each with a "What this table tells us" note (§14). The predictions beside the results, tagged on the row, with no "right" or "wrong". Words such as "close" are used only where a published reference or the paper's own give-or-take supports them; where the model is rougher than the paper (Frisch and Smith's 74.7 against 73.2 percent), the page says the model is simple and gives no verdict.

### Tutor (Part 4)

Predict, observe, compare, explain (§13): what the learner expected from the clock at rest; what the counts and the ring show; why the ground says "slow clock" and the muon says "short road" and both give the same share (a worked 191.5 m and 0.64 µs against 1,917 m and 6.43 µs); why this is the same slowing as Relativity 3 and 4 (a moving clock runs slow), now with a decay as the clock; that the factor depends only on speed (0.995 c gives about 10, 0.99942 c about 29). Daily-life example for the exponential share: to be drafted for approval. The tutor must not claim more than the tests show, must not give a verdict beyond special relativity, and says plainly that the page's model is simpler than the real tests.

## Expected Observations

Clock at rest: 36.8 percent after one lifetime, 13.5 after two, 5.0 after three. Mountain trip: 5.4 percent without the slow clock, 74.7 with it, 73.2 counted. Ring: 2.197 µs at rest, 64.44 µs predicted, 64.419 ± 0.058 and 64.368 ± 0.029 measured. Muon's view: 191.5 m, 0.642 µs, 74.7 percent.

## Expected Learner Understanding

That decay can be used as a clock; that a fast muon's clock runs slow as the lab measures it, by a factor that has been tested; and that the lab and the muon each give a different but consistent account.

## New Concepts Introduced

Decay as a clock (an average lifetime and a share left), a particle that falls apart, the muon, cosmic rays (in a sentence), a storage ring (in a sentence), a test of time dilation with particles in flight.

## Relationship to Previous Experiments

Relativity 2 to 6 (frames, the slow moving clock, the light clock, length contraction), Relativity 10 (the twin paradox, clocks that go and return: the ring is a muon going round), Gravity 9 (GPS, a clock test with real clocks), Spacetime Geometry 6 (decay), Evidence and Imagination 3 (speed rules tested at 0.99975 c).

## Relationship to Later Experiments

Experiment 7 (the microwave dipole) uses speeds relative to the sky; the group's recap sorts this group's results by status.

## Required Physics Tests (each must fail when the module is deliberately broken)

1. The factor: γ(0.995) = 10.013, γ(0.9) = 2.294, γ(0.5) = 1.155; β from γ = 29.33 is 0.99942.
2. Rest lifetime: τ₀ = 2.1969811 µs; the share after 1, 2 and 3 lifetimes is 36.8, 13.5 and 5.0 percent.
3. Mountain trip at 0.995 c, H = 1,917 m: t = 6.427 µs (2.925 lifetimes); everyday share 5.37 percent; with the slow clock 74.67 percent.
4. The muon's view: road 191.5 m, trip 0.6419 µs, 0.292 lifetimes, share equal to test 3's slow-clock share to better than 1 part in 10⁹, for every speed and height of the control grid.
5. The slow-clock share rises with speed and falls with height; the everyday share is nearly the same for all speeds above 0.99 c.
6. Ring: γ τ₀ = 64.44 µs for γ = 29.33; the difference from τ⁺ (−0.018 µs) is inside ± 0.058 and the difference from τ⁻ is −0.11 percent.
7. The 15 km grid: 10.17 percent at 0.995 c, 90.3 percent at 0.99999 c, and essentially none (below 10⁻⁶) at 0.5 c and 0.9 c.
8. The counted share is 412 ÷ 563 = 73.2 percent; the paper's factors are 8.8 ± 0.8 against 8.4 ± 2 (the quoted values are stored, not recomputed).
9. The comparison helpers: "the same", "more", "less" and "inside the give-or-take" behave as stated; a tenfold wider tolerance fails a test (as in Experiment 3's review).
10. The nearest-answer helper picks the closest button; Prediction 1's answer is 75; Prediction 2's is 65 µs.
11. The module does not change when predictions change.

## Sources (searched 2026-10-31)

| Source | What it was used for | Status |
|---|---|---|
| J. Bailey and others, "Measurements of relativistic time dilatation for positive and negative muons in a circular orbit", *Nature* 268, 301 (28 July 1977) (`nature.com/articles/268301a0`) | the ring lifetimes, γ = 29.33, the factor's agreement to 2 × 10⁻³ at 95 percent | **abstract page fetched and read 2026-10-31 (HTTP 200)**: τ⁺ = 64.419 (58) µs, τ⁻ = 64.368 (29) µs, τ₀⁻ = 2.1948 (10) µs "assuming special relativity"; the rest of the paper is behind a subscription and was **not read**. The PDF link returned an HTML preview, not the paper |
| D. H. Frisch and J. H. Smith, "Measurement of the Relativistic Time Dilation Using μ-Mesons", *American Journal of Physics* 31, 342 (1963), doi 10.1119/1.1969508 | the mountain test | **not read**: `doi.org/10.1119/1.1969508` redirected to `pubs.aip.org` and returned **HTTP 403** on 2026-10-31 (again at Step 8, the same day); a search for a readable copy found only lecture-lab pages and a blog post, none the paper. **Not linked on the page**, which gives its title and says the counts come from Wikipedia's account. Figures come only from Wikipedia (below) |
| "Experimental testing of time dilation", Wikipedia (`en.wikipedia.org/wiki/Experimental_testing_of_time_dilation`) | Frisch and Smith's 1917 m, 0.995 to 0.9954 c, 563 and 412 muons an hour, 27 expected without dilation, factors 8.8 ± 0.8, 10.2, 6.8 and 8.4 ± 2; Rossi and Hall (Echo Lake 3,240 m and Denver 1,616 m, above 0.99 c, about 2.4 µs, "qualitative"); the 10¹⁸ g acceleration remark; the reference list | **fetched and read 2026-10-31 (HTTP 200)**; not an official page and not the papers. Its own 27 muons without dilation (4.8 percent) differs from the model's 5.4 percent, probably because it allows for more detail |
| Particle Data Group, "μ mean life τ" (`pdglive.lbl.gov/view/S004T`) | τ₀ = 2.1969811 ± 0.0000022 × 10⁻⁶ s | **fetched and read 2026-10-31 (HTTP 200)**; the 2026 release; the listing's first entry is TISHCHENKO 2013 (2.1969803 ± 0.0000021 ± 0.0000007, surface μ⁺ at PSI) |
| MuLan, "a part-per-million measurement of the muon lifetime…" (`arxiv.org/abs/2108.09182`) | the rest lifetime's measurement | **abstract fetched and read 2026-10-31 (HTTP 200)**: 2 196 980.3 (2.2) ps (1.0 ppm); the paper was not read |
| Fermilab, "Muons" (`fnal.gov/pub/science/particle-physics/experiments/muons.html`) | a plain official page on what a muon is, for the list before the run | **fetched and read 2026-10-31 (HTTP 200)**; last modified 23 April 2026; calls muons "heavy, ephemeral cousins of the electron, living for two millionths of a second before decaying"; it says nothing about time dilation or cosmic rays, so it is safe before the run (§12) |
| "Atmospheric Muons", HyperPhysics, Georgia State University (`hyperphysics.gsu.edu/hbase/Particles/muonatm.html`) | a flux of about 1 muon per cm² per minute, mean energy at sea level about 4 GeV, "most muons are thought to be created at altitudes of about 15000 meters" | **fetched and read 2026-10-31 (HTTP 200)**; an educational page, **not an official source**, so the 15 km control is labelled "typical"; the page's 4 GeV and γ = 38.8 are not used (kinetic or total energy is not stated) |
| PDG, "Cosmic rays" review (`pdg.lbl.gov/2018/reviews/rpp2018-rev-cosmic-rays.pdf`) | the same height and flux, from an official review | **downloaded 2026-10-31 (HTTP 200, 1.4 MB); its text could not be extracted** beyond the first page, so the "typically 15 km" statement is **from a search summary only, not read** |
| Rossi and Hall, *Physical Review* 59, 223 (1941); Rossi and Nereson (1942, 1943) | the first test | **cited from Wikipedia's reference list; not fetched**: `doi.org/10.1103/PhysRev.59.223` returned HTTP 403 (a bot check) on 2026-10-31 |
| "The interpretations by experimenters of experiments on 'time dilation': 1940–1970 circa" (`arxiv.org/abs/physics/0008012`) | background on the early tests | **fetched and not used**: the abstract says the paper "has been withdrawn by the authors due to wrong treatments of some topics" |
| Mount Washington Observatory, "Special Relativity and Mount Washington" (`mountwashington.org/special-relativity-and-mount-washington`) | an account of the experiment | **fetched and not used**: a summer intern's blog post (2018) that says muons come "from the sun" and treats "half-life" and "lifetime" loosely |
| A. Lobo and others, "Experimental Bounds on Deformed Muon Lifetime Dilation", *Physics Letters B* 866, 139511 (2025) (`arxiv.org/abs/2406.05150`) | a recent use of the ring data to test whether time dilation is modified at very high energy | **abstract fetched 2026-10-31 (HTTP 200)**; the paper was not read; **not on the page** unless the owner wants a "tests continue" sentence |
| A plain official page on **time dilation with muons or decay as a clock** | the "Want to know more?" list (§29 rule 3(b)) | **no plain official page found on 2026-10-31**: Symmetry magazine's "The muon" and "Through a muon's eyes" returned **HTTP 403**; the Mount Washington page is unsuitable (above); the AIP page returned 403. To be recorded under §29 rule 3(c) |
| A plain official page on **cosmic rays making muons high in the air** | the same | **none found and read**: one search limited to NASA, CERN, Fermilab, ESA, DOE and PDG returned only PDG's review PDFs and arXiv papers; the PDG review could not be read. To be recorded under §29 rule 3(c); **recorded under §29 rule 3(c) (2026-10-31)**: the introduction's paragraph "How a muon is made" (cosmic ray hits an air molecule, a shower of particles, some of them unstable and falling apart into muons, a snooker comparison) is in the page's own words with no official page behind it. "Most muons are made high up, typically 15 km" rests on HyperPhysics (an educational page, read) and a search summary of the PDG review; "a cosmic ray usually hits something soon after it reaches the top of the air" has **no source read**. The paragraph does not name the unstable particle (a pion) |
| Muon g-2 final result (published 3 June 2025; 127 parts per billion) and the Fermilab storage ring's 64.4 µs boosted lifetime | a modern example of the same effect | **search summaries only; not read; not on the page** |

## Facts that may change (§29)

| Fact | Why it may change |
|---|---|
| The tests are old and settled (1941, 1962, 1977) | none expected; tighter or higher-energy tests may be added |
| The page's links for the papers and for a plain explainer | blocked pages (AIP, APS, Symmetry) may become reachable, or an official page may appear |
| The rest lifetime 2.1969811 µs | the PDG average is updated when new measurements arrive (the 2026 release was read) |

## Open items (as proposed on 2026-10-31; the wording was approved step by step, and what remains open is listed in "Implementation Notes")

a. **The Frisch and Smith numbers are second-hand** (Wikipedia). Read the paper's page or an official page before the wording is approved; until then the page labels them "as summarised by Wikipedia" or leaves the measured bar out (Decision 7). Wikipedia dates the experiment 1962 and the paper 1963.
b. **The 15 km birth height** is from HyperPhysics and a search summary of the PDG review, not read at the review. The control is labelled "a typical birth height"; real muons are born over a range.
c. **The ring's μ⁻ result** is 0.11 percent below the PDG-based prediction, 2.4 times its quoted ±. The paper's own rest value for μ⁻ (2.1948 µs) is 0.10 percent below the PDG's, and its stated agreement is 0.2 percent at 95 percent. The page quotes the paper's figure and shows both measured values with their ± without a verdict; this comparison was not made by the paper's abstract and is the page's own.
d. **The model is rougher than the real mountain test** (constant speed against their slowing muons; 74.7 against 73.2 percent). The page says so; no verdict.
e. **"The exponential law of decay"** and **"the muon's clock"** (a decay as a clock) have no official page read; the introduction defines them in plain words.
f. **No plain official page** for time dilation with muons or for cosmic rays making muons (see Sources; §29 rule 3(c)).
g. **Rossi and Hall (1941)** is named only, from Wikipedia; no paper read.

## Decisions for the owner (each with a default)

1. **Title.** Candidates: (a) "How long does a muon live?" (default, neutral); (b) "A particle that should not reach the ground"; (c) "Does a muon's clock run slow?"; (d) "Can a muon cross the sky?"; (e) "Muons: a clock in the sky"; (f) "Do fast muons live longer?" (the working title; gives away Prediction 2). The file name `04-do-fast-muons-live-longer.md` is kept either way. **Chosen by the owner on 2026-10-31: (a), "How long does a muon live?" (all twelve decisions approved on their defaults).**
2. **Status label.** Settled (muon lifetimes measured in flight, in the air and in a ring, agree with special relativity), "old tests, not a new result" said plainly. Default: as stated.
3. **The tests modelled:** Frisch and Smith 1962 and Bailey and others 1977; Rossi and Hall named only. Default: yes. Alternative: only the ring (all figures from a read source).
4. **Scope:** steady speed, one straight fall, no energy loss, no spread of birth heights; the page says the real tests were more careful. Default: yes.
5. **Two predictions** (the mountain share, five buttons; the ring lifetime, five buttons). Default: yes.
6. **Controls:** speed (five buttons) and height (four buttons) with Drawing A. Default: yes.
7. **Frisch and Smith figures:** show them labelled "as summarised by Wikipedia; the paper itself was not read". Alternative: show only the calculated bars in Picture 1 and the check-up until the paper is read. Default: show them, labelled.
8. **The 15 km height** shown as "a typical birth height (from an educational page and a summary of the PDG review)". Default: yes.
9. **Introduction length and links:** long and detailed, to §29; rule 3(c) recorded for time dilation with muons and for cosmic rays if no official page is found after a further search; Fermilab's "Muons" is linked from the start. Default: yes.
10. **Tutor:** the standard four-step sequence, with the muon's view (the short road) as the explanation's second half. Default: yes.
11. **Terms defined in plain words where they appear:** muon, cosmic ray, decay, average lifetime, share, storage ring. Default: yes.
12. **Pictures label every shape on the canvas and say plainly which are measured, calculated and imagined** (§14, "Predictions and the Real Results" point 6). Default: yes.

## Implementation Notes (2026-10-31, in progress)

**Built so far:** the physics model and tests (`a7e3557`, `src/physics/muonLifetime.ts` and `muonLifetime.test.ts`, 35 tests) and the interface, the two predictions, the run and Pictures 1 to 3 with their captions (`10269f4`, `MuonLifetimeExperiment.tsx`, `MuonLifetimePictures.tsx`, `App.tsx`). Not built yet: Drawing A and its controls, the results, the tutor, the papers list, the chapter summary and "What's next" (empty in `App.tsx`). Not viewed in a browser at narrow widths or in other browsers.

**The three captions (wording approved by the owner on 2026-10-31, after two rounds of simplifying at the owner's request).** The first draft was found confusing, so the captions were rewritten in plainer words. What the owner asked for, and what the built captions now do:

1. **Each "What to look for" item is one feature, in three parts:** Look at (the feature, named as drawn), What it means (in plain words, with the real numbers) and Why it matters. Items appear only once their feature is drawn (Picture 1's Part B items from stage 2, the green and second cyan items from stage 3).
2. **Every bar, mark and ruler is explained with numbers, step by step.** Picture 1, Part A: each bar is a moment in time (0, 2.2, 4.4 and 6.6 µs after the start) and the number at its end is how many of the 100 muons are alive then (100.0, 36.8, 13.5 and 5.0). Part B's ruler has an example (a mark at 25 means 25 of 100 arrive). The green item shows 412 ÷ 563 = 0.73. Picture 2 explains why the ruler's spacing is uneven (1 to 10 is as wide as 10 to 100) and reads the marks from left to right with numbers (2.20 µs, then about 64 µs, a jump of about 29 times). Picture 3's worked moment begins with trip time = road ÷ speed in each row.
3. **Terms are explained where they first appear:** muon, average lifetime (with a party comparison: each hour the same fraction of guests go home), µs, c, the storage ring.
4. **Nothing gives away the reason for the differences** (§12): no caption names the factor by which a moving muon's lifetime is longer, or the ratio of the two roads in Picture 3. The tutor does that.

**Differences from this specification (all three approved by the owner on 2026-10-31):**
1. Picture 1 has a Part A (a muon at rest: four bars for 0, 1, 2 and 3 average lifetimes) above the mountain; the specification's Display lists only the mountain and the ruler.
2. Picture 3 draws road bars (in metres) and time bars (in µs, the trip and the lifetime) for each row, with the share alive written under each; the specification said "in units of the rest lifetime".
3. The captions are longer than the specification implies, to meet §29 and the owner's request for simpler, more detailed wording.

**Open:** the captions' source notes repeat the Open items above (the Frisch and Smith figures come from a published account, not the paper; the ring figures from the paper's abstract).

**Part 2 and Drawing A (2026-10-31; built, checked in Chrome at three settings, wording approved by the owner on 2026-10-31):**
1. **Part 2, "Now try it yourself"**, shown after the run: two button controls from the module, speed (0.5 c, 0.9 c, 0.995 c, 0.99942 c (the ring), 0.99999 c) and height (1.917 km, 5 km, 10 km, 15 km), preset to 0.995 c and 1.917 km. It says that the guesses never change the drawing and that these settings do, and that they are trial values, not measurements.
2. **Drawing A**: a 0 to 100 share ruler with two cyan bars (the lifetime unchanged, and the lifetime as special relativity gives it); the ground's trip in numbers; and, in pink (imagined for the question), the muon's road and clock, with a road bar for each description on one scale. Every number is read from `trialTrip`. A share under 0.01 in every 100 is written "less than 0.01", so at some settings (for example 0.5 c from 15 km) neither bar is visible. The caption follows the approved simple style (intro, bullets, four worked steps, three look-at items, "Where the real picture comes from"); it does not say why the lifetime is longer (§12).
3. **The height control's wording and the introduction**: at the owner's questions, the control says that muons can be made at any height, most high up, with 15 km typical; and the introduction gained the paragraph "How a muon is made" after "The question", with the "Cosmic ray" entry shortened to point to it. These are wording changes approved by the owner on 2026-10-31.
4. **Checked:** all tests pass (1,931). The drawing's numbers at three settings (0.995 c at 1.917 km; 0.5 c at 15 km; 0.99999 c at 5 km) were checked by hand against the formulas. **Not checked:** the other settings, narrow widths, other browsers, keyboard use.

**Differences from this specification (both approved by the owner on 2026-10-31):** (a) the height control's description and the "How a muon is made" paragraph are additions the specification's introduction outline did not list; (b) Drawing A's share ruler shows "less than 0.01" without a visible bar at the slowest, highest settings.

**Step 6, the results (2026-10-31; built, checked in Chrome with two prediction pairs, committed `d61051e` and `3c0da90`; wording approved by the owner on 2026-10-31):**
1. **Module:** `resultsCheckUp()`, `stepsTable()` and the `TESTED` list in `src/physics/muonLifetime.ts`, with 8 more tests (43 in the file, 1,939 in the project), checked by five deliberate breaks, all caught. A first expected value in a test (the μ⁻ difference, −0.107 percent) was a slip of the hand calculation; the module's −0.1078 was right and the test was corrected.
2. **Part 3 (`MuonLifetimeResults.tsx`), shown after Part 2:** a "Where this stands" card (Settled; what was read; what was not checked); the predictions beside the results (each guess and the Table 1 rows where its answer lives, with a tag on the row and no verdict); a reading guide; **Table 1**, the check-up (seven rows: the mountain shares against the counted 73.2 of every 100; the paper's factors 8.8 ± 0.8 and 8.4 ± 2, whose ranges overlap; the ring's calculated 64.44 µs against the two measurements, with the paper's own 0.2 percent limit; the paper's rest value for μ⁻ against the Particle Data Group's); **Table 2**, from the speed to the answer (both predictions side by side); **Table 3**, what has been tested (five rows with plain labels). Each table has a "What this table tells us" note (what it is, what it means, why it matters, how sure the numbers are). Nothing says why a moving muon lasts longer; that is the tutor's (§12, §13).
3. **Checked:** across two different prediction pairs the three tables were identical apart from the guess tags, and each tag sat on the right row; the numbers (13.6 times, 1.5 of every 100, 0.4, 10.01, 29.33) match a separate hand calculation. **Not checked:** narrow widths, other browsers, keyboard use. The paper's mountain factors (8.8, 8.4) are from Wikipedia's account and their meaning ("how much longer a moving muon lasts") was not confirmed against the paper; the statement that the paper's rest value for μ⁻ is "worked out from the ring data" rests on the abstract's "assuming special relativity".
4. **Left out:** the optional table for the learner's settings (§14), because Part 2's controls only move marks in a drawing. The papers list comes in a later step.

**Differences from this specification (all three approved by the owner on 2026-10-31):** (a) Table 1 has seven rows and Table 2 eight rows (the specification says only "a check-up", "a steps table" and "a table of what has been tested"); (b) Table 2 shows "how many times longer the average lifetime is" (10.01 and 29.33) without saying where it comes from, which the tutor explains; (c) Table 1 gives the ring's μ⁻ difference with the paper's own 0.2 percent limit and says "the page gives no further verdict", as Open item c requires.

**Step 7, the tutor as Part 4 (2026-10-31; built, checked in Chrome with two prediction pairs, committed `ef84d9c` and `2bfa19a`; wording approved by the owner on 2026-10-31):**
1. **Module:** `shareGuessResult`, `lifetimeGuessResult`, `factorWorked` and `tutorFigures` in `src/physics/muonLifetime.ts`, with 3 more tests (46 in the file, 1,942 in the project), checked by six deliberate breaks, all caught.
2. **Sequence (`MuonLifetimeTutor.tsx`, shown after the results):** observe (Pictures 1 to 3); compare (the white guess marks in Pictures 1 and 2 and the Table 1 rows, with no verdict); one question (two groups fall the same 1,917 m, at 0.5 c and at 0.995 c, and which has more alive at sea level and why); then the explanation, where both predictions are marked as matched or not matched and nowhere earlier (§12, §13).
3. **The explanation's seven items:** why so many muons arrived (5.4 of every 100 with the lifetime unchanged, against 73.2 counted and 74.7 calculated with 22.0 µs, tied to a moving clock running slow in Experiments 3 and 4 of the first chapter); where 10.01 comes from, worked in steps (0.990025, 0.009975, 0.0999, 10.01) with the factor at 0.5 c (1.15) and at the ring's speed (29.33); the muon's own description (1,917 m ÷ 10.01 = 191.5 m, 0.64 µs, 0.29 of a lifetime, 0.368 to the power 0.29 = 0.747); the ring (29.33 × 2.197 = 64.44 µs against 64.419 and 64.368, within 0.11 percent, the paper's own limit 0.2 percent); how good the page's model is (a factor of 10.01 for one steady speed; the paper's own 8.4 ± 2 and 8.8 ± 0.8 overlap); the answer to the question (0.65 and 74.7 of every 100; a trip 2.0 times shorter and a lifetime 8.7 times longer; the longer lifetime does more); what is settled and what the tests do not show.
4. **Two claims corrected at the author's own review:** item 1 first said the calculation was "close to the count" (a verdict Table 1 declines to give), and item 7 first said the tests agree "to within the give-or-takes quoted" (untrue for μ⁻, 2.4 give-or-takes off, though inside the paper's 0.2 percent limit). Both were reworded.
5. **Checked:** nothing is marked before the explanation; Continue stays disabled until a reply is typed; the matched and not-matched marks are right for the pairs (75 and 65 µs) and (5 and 200 µs). **Not checked:** narrow widths, other browsers, keyboard use, and the chapter summary appearing after the tutor (it is still an empty placeholder).

**Unsourced in the tutor:** the remark that in the ring "the muons were timed as a lifetime, not counted at two heights" is the author's own reading of the experiment; the daily-life comparison in the explanation has no source read.

**Differences from this specification (all three approved by the owner on 2026-10-31):** (a) the conceptual question (0.5 c against 0.995 c) is the author's choice; the specification does not name one; (b) the explanation has seven items where the specification lists five themes, and it omits the specification's "daily-life example for the exponential share", which the introduction already gives (the coin-flipping crowd); (c) the worked factor is shown with a formula, 1 ÷ √(1 − β²), taken from the first chapter and not derived.

**Step 8, the papers list (2026-10-31; built, checked in Chrome, committed `6f21f80`; wording approved by the owner on 2026-10-31):**
1. **Where:** at the end of Part 3 (`MuonLifetimeResults.tsx`), shown only after the run completes, because the papers give away the predictions' answers (§12, §29). Each link opens in a new tab with `noopener noreferrer`.
2. **The list:** Bailey, Borer, Combley and others, *Nature* 268, 301 (1977), linked to the publisher's abstract page; the Particle Data Group's listing for the muon's mean life (2.1970 µs); the MuLan collaboration's arXiv abstract (2021); HyperPhysics' "Atmospheric Muons", labelled "an educational page, not an official source", behind the 15 km figure; and a "Not linked" entry for Frisch and Smith (1963), whose page was refused, with the counts 563 and 412 said to come from Wikipedia's account.
3. **Link check, 2026-10-31:** `nature.com/articles/268301a0` HTTP 200 (with a cookie-notice redirect), `arxiv.org/abs/2108.09182` 200, `pdglive.lbl.gov/view/S004T` 200, `hyperphysics.gsu.edu/hbase/Particles/muonatm.html` 200; `doi.org/10.1119/1.1969508` 403. The titles of the Nature and MuLan papers were taken from their own pages. `fnal.gov/pub/science/particle-physics/experiments/muons.html` (the introduction's link) returned 403 to `curl` at Step 8 but 200 through the normal fetch earlier the same day; it was not re-opened in a browser and is assumed to be a bot block.
4. **Checked in Chrome:** the list is absent before and during the run and appears when the run completes; the four hrefs and the new-tab settings are right. **Not checked:** narrow widths, other browsers. The statement that each PDG entry names the experiment it comes from rests on the first entry read (Tishchenko 2013).

**Differences from this specification (both approved by the owner on 2026-10-31):** (a) the list has four links where the specification only says "the original papers after the run" (Frisch and Smith cannot be linked; the MuLan abstract and the PDG listing were added as the sources of the lifetime at rest); (b) HyperPhysics, an educational page, is listed after the run, though the specification names it only as the source of the 15 km height.

**Step 9, the chapter summary and "What's next" (2026-10-31; built, checked in Chrome, committed `ade4ec6`; wording approved by the owner on 2026-10-31):**
1. **Where:** `muonLifetimeSummary()` and the chapter entry in `src/App.tsx`. Every number in the summary is read from the physics module (`resultsCheckUp`, `tutorFigures`, `lightDistanceInOneLifetimeM`), so the text cannot drift from the page.
2. **The summary says:** a muon's falling apart can be used as a clock; at rest it lasts 2.197 µs, so light goes only about 659 m in that time, yet muons made around 15 km up reach the ground; on the mountain, 5.4 of every 100 would arrive with the lifetime unchanged, the 1962 count was 73.2 of every 100 and a lifetime 10.01 times longer (22.0 µs) gives 74.7; in the ring in 1977 the measured 64.419 and 64.368 µs sit against a calculated 64.44 µs, 29.33 times the lifetime at rest, to within 0.11 percent; the muon's own description gives the same count (a road of 191.5 m, 0.29 of a lifetime); that a moving clock runs slow by a factor that depends only on speed is settled and the tests are old; the page's model is simpler than the real tests (10.01 for one steady speed against the mountain paper's own 8.4 ± 2 and 8.8 ± 0.8); and where the numbers come from, with no paper read in full.
3. **"What's next":** "The next experiment in this group turns from motion to gravity: whether a radio signal that passes close to the Sun arrives late, and by how much." This is a planned direction only; Experiment 5 has no specification yet. Experiment 3's "What's next" already points to muons without giving away a prediction's answer and was left unchanged.
4. **Checked in Chrome:** the summary and "What's next" are hidden before the run, after the run and after the tutor's first two replies (a hint line shows instead), appear after its last reply, and the saved progress records the chapter as completed and explained. The first check was too loose (it matched the hint's words "What you learned" and progress left over from an earlier test run); it was redone with the summary's own sentence after removing only this chapter's entry from the saved progress. **Not checked:** narrow widths, other browsers.

**Differences from this specification (approved by the owner on 2026-10-31):** none beyond "What's next" naming Experiment 5 in plain words (the specification's "Relationship to Later Experiments" names Experiment 7, the microwave dipole, not Experiment 5); the specification's outline of the summary was not otherwise specified.

**Build status:** Steps 1 to 9 of §23 Stage 5 are built and committed (the physics model and tests; the introduction and links; the predictions; the run with Pictures 1 to 3; Part 2 with Drawing A; the results; the tutor; the papers list; the chapter summary). The complete-flow test (§21 Step 9) and the final review (§21 Step 10) are recorded below.

**Complete-flow test (Chrome, 2026-10-31; the page's 2.6-second stage timer was shortened to 120 ms by wrapping `setTimeout` in the page, with no source change, which changes only how fast the stages play):**
1. **All 25 prediction pairs (5 buttons for Prediction 1 by 5 for Prediction 2) passed:** for each, Picture 1's white mark at the right position for the guess (x = 290 + 4.1 × value) with the right box text; Picture 2's white mark at the right position on the log ruler (x = 60 + 640 × log₁₀(value) ÷ log₁₀(300)) with the right box text; no white mark on Picture 3; the real pictures (their drawing code with the white elements removed) and the three tables identical across all 25 pairs apart from the guess tags; exactly two guess tags in Table 1, each on its own row; nothing marked before the tutor's explanation; the tutor's marks right for both predictions (matched only for "About 75" and "About 65 µs"); the chapter summary hidden before the first run and shown after the tutor's last reply.
2. **All 20 control settings (5 speeds by 4 heights) passed** against a separate calculation written in the test: the two share labels, the trip text, the "of the 2.2 µs average lifetime" and "with the lifetime … instead" lines, both road labels, the muon's own trip line, the "same as the darker bar" line, the four bar widths and the caption's worked steps; and the own-view share agreed with the ground's share to better than 1 part in 10⁹ at every setting. Pictures 1 to 3 were unchanged by all 20 settings.
3. **The five stages in order:** stage 1 draws Part A only; stage 2 adds Part B; stage 3 adds the second cyan mark and the green mark; stage 4 adds Picture 2; stage 5 adds Picture 3; on completion Parts 2, 3 and 4 appear and not before.
4. **A negative control** confirmed that a deliberately wrong expected string is reported as a failure.
5. **Not checked:** the separate calculation does not cover Pictures 1 to 3's own numbers or the tutor's numbers (they come from the module's 46 tests and the hand checks recorded above), and it shares the browser's number formatting; narrow widths, other browsers, keyboard use, a real learner. The test marked Experiment 4 completed and explained in that browser's saved progress (`localhost:5173`); the chapter's entry was removed once before the run to test the summary's first appearance, and no other chapter's entry was changed.

**Final review (2026-10-31):** against `docs/PROJECT.md`, `AGENTS.md`, this specification and `CLAUDE.md` §9, §12, §14, §15, §28 and §29.
1. **Checked and fine:** `tsc --noEmit -p tsconfig.app.json` clean; `npm run build` succeeds (with the build's existing chunk-size warning); all 1,942 tests pass; all 11 required test groups of this specification exist; no console errors or warnings during a full run in Chrome; §14's "Predictions and the Real Results" (guesses drawn in white on the real pictures, never changing them; a "Where the real picture comes from" line under each picture carrying a guess; the introduction's and Part 2's notes; the tutor pointing to the marks by name and marking nothing early); §29 (rule 3(a) papers listed after the run, rule 3(b) the Fermilab link, rule 3(c) recorded for cosmic rays and decay as a clock); the Fermilab link, which returned 403 to `curl` but opens and matches the record in a real browser (2026-10-31), so that was a bot block.
2. **Found and fixed, at the owner's delegation ("do what is best"); the wording was approved by the owner on 2026-10-31:**
   a. **§12:** the introduction's step 3 gave away part of Prediction 1. The candle comparison said the candle "still arrives alight", and the step said "yet many are still detected at the ground" and "the large number detected". It now says what you would expect (most should have fallen apart), asks "So how many are still alive when they get down? That is what you will be asked to predict.", and ends its note on "average" with "lasting 23 times the average is extremely rare."
   b. **§15:** "give-or-take" was used in Picture 2 before it was defined (its only definition was in Part 3's reading guide). Picture 2's bullet on the green marks now defines it, with the 64.419 µs, give-or-take 0.058 example.
   c. **§15:** "special relativity" first appeared in Picture 1's stage 3 labels with no definition. Picture 1's stage 3 bullet now says the longer lifetime "is taken from special relativity, the theory explained in the first chapter of this site". It is deliberately not defined in the introduction, which would hint that motion affects clocks (§12).
   d. **Wording:** Picture 1's look-for line "Every time 2.2 µs pass, only about 36.8 of every 100 muons are left" could be read as 36.8 of the original 100 each time. It now says "Each time 2.2 µs pass, about 36.8 of every 100 of the muons still alive at that moment are left."
   e. **§9:** constants typed into learner text now come from the module or one named constant: Picture 3's footer ("1 917 m" from `MOUNT_HEIGHT_M`, "25 µs" from `P3_TIME_SCALE_US`), Drawing A's "15 000 m" (the largest of `HEIGHT_CHOICES`), and the tutor's "0.5 c" (a new `TUTOR_COMPARE_BETA` in the module, used by `tutorFigures`). Checked in Chrome: the new and changed texts show and the old ones are gone.
3. **Found and not changed (unsourced daily-life comparisons, §15 allows them, recorded for the owner):** "roughly 7 football pitches laid end to end" (the introduction, from 659 m) and "about as high as a jet airliner flies, or a little higher" have no source read.
4. **Documents brought in line (2026-10-31):** this specification's header and Open items heading; `CLAUDE.md` §27 (table row 4, the group paragraph, the guided-journey line, "What Remains", the test count 1,942); `docs/STATUS.md` (a new Experiment 4 entry); the "built so far" lists in `AGENTS.md` and `docs/PROJECT.md`, which named only Experiment 1 of this group and now name Experiments 1 to 4.
5. **Not checked:** narrow widths (the drawings' text is small, as in the group's other experiments), other browsers, keyboard use, a real learner; nothing was linted because the project has no ESLint configuration.

