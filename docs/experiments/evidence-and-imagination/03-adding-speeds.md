# Experiment 3 (Evidence and Imagination): Can Speeds Simply Be Added?

**Status: specification approved by the owner on 2026-10-30 ("approved, all defaults", all twelve decisions on their defaults, with the title "Can speeds simply be added?"). Proposed by Claude on 2026-10-30 per `CLAUDE.md` §23 Stages 2 and 3, as Experiment 3 of the group (`00-group-proposal.md`, approved as a direction on 2026-10-29). Nothing is built yet.** Two sources were read on 2026-10-30 (the 1964 Alväger paper, through machine-read text of a scanned PDF, and the Wikipedia article on the Fizeau experiment); no plain official page for velocity addition was found. Every number must be checked at its source before it is relied on (§29, §28.6).

> **Four things for the owner's attention (decisions 1, 2, 4 and 8).**
> (a) **Title.** The proposal's working title, "why 0.5c + 0.5c is not c", gives away Prediction 1's answer. The owner chose the neutral title "Can speeds simply be added?" on 2026-10-30 (Decision 1).
> (b) **The tests are real but old.** The settled evidence is Fizeau's water experiment (1851, explained by von Laue in 1907) and the CERN test of 1964 (light from a source moving at 0.99975 c). Nothing in this experiment is new, and the page says so; the label is **Settled** (Decision 2).
> (c) **One formula, one dimension.** The model is the formula for two speeds along one straight line. Sideways motion, acceleration and "rapidity" are not taught (Decision 4).
> (d) **A figure with an unresolved reading.** The paper's own k value (−3 ± 13 × 10⁻⁵) and a value worked out from its rounded speeds differ slightly; the page will quote only the paper's (Open item c).

## Overview

Everyday life says speeds add. A passenger walks forward at 1 m/s on a train moving at 20 m/s: 21 m/s to someone on the platform. Special relativity says that is only almost right. For two speeds, v (a spaceship relative to the lab) and w (a probe fired forward, relative to the spaceship), the speed relative to the lab is

u = (v + w) ÷ (1 + v w ÷ c²)

For slow speeds the bottom is almost 1 and the everyday rule is excellent. Near the speed of light it is not: 0.5 c and 0.5 c give 0.8 c, not 1.0 c; and a flash of light, w = c, gives c for every v.

1. **The rule.** The learner meets the everyday sum and the relativistic result side by side, for the same two speeds, and sees how the gap grows with speed.
2. **Test 1: light in moving water (1851, Fizeau).** Light goes a little faster in water flowing with it, but only by a fraction, about 0.43 of the water's speed for ordinary water (1 − 1 ÷ n², n = 1.33 for water). The everyday sum would give the full water speed. Von Laue showed in 1907 that the relativistic rule gives the observed fraction.
3. **Test 2: a flash from a source at 0.99975 c (CERN, 1964).** Neutral pions moving at 0.99975 c (energy above 6 GeV) decayed into gamma rays. The gamma rays' speed, timed over 31.450 m, was (2.9977 ± 0.0004) × 10¹⁰ cm/s, against c = 2.9979 × 10¹⁰ cm/s. The everyday sum would give almost twice c.

The status is **Settled**: the rule has been tested in water, with fast particles and in every accelerator. The experiment does not claim a new result.

## Learning Objective

By the end the learner can say, in their own words:

1. Speeds that are small compared with light add as in everyday life, to a very good approximation; speeds near c do not.
2. Adding two speeds, each less than c, always gives less than c; adding c to anything gives c.
3. u = (v + w) ÷ (1 + v w ÷ c²), and that for 0.5 c and 0.5 c it gives 0.8 c.
4. Two real tests agree with the rule: the drag of light by moving water, and the speed of light from a source moving at 0.99975 c.
5. This is a consequence of the speed of light being the same for everyone (Relativity 5), not a separate law.

## Physical Situation

A lab, a spaceship moving along a straight line at v relative to the lab, and a probe (or a flash of light) fired forward from the spaceship at w relative to the spaceship. The question: how fast does the lab see the probe move? Everything is on one line, in one direction, with the speeds measured as the earlier experiments measured them (the lab's and the ship's reference frames, Relativity 2).

## Physics Model (`src/physics/addingSpeeds.ts`, to be written; may import nothing)

| Part | What it computes | Source |
|---|---|---|
| **The rule** | u = (v + w) ÷ (1 + v w ÷ c²), in units of c: u = (a + b) ÷ (1 + a b), with a = v ÷ c and b = w ÷ c | standard special relativity; checked against Wikipedia's "Velocity-addition formula" summary only, **to be checked at a textbook** |
| **The everyday sum** | u₀ = v + w | arithmetic |
| **The gap** | u₀ − u, and u as a share of c | arithmetic |
| **Always below c** | for 0 ≤ a, b < 1, u < 1; u = 1 when b = 1 | the formula |
| **The speed seen the other way** | (v − u) ÷ (1 − u v ÷ c²), the speed of the probe relative to a ship, consistent with Spacetime Geometry 5's display | Spacetime Geometry 5 |
| **Moving water (Fizeau)** | light speed in water c ÷ n; in water moving at v: (c ÷ n + v) ÷ (1 + v ÷ (n c)); the extra over c ÷ n, divided by v, is the drag coefficient, 1 − 1 ÷ n² for small v | von Laue 1907 as given by Wikipedia's Fizeau article (read 2026-10-30); n = 1.33 for water is **not yet sourced** |
| **The 1964 test** | the source speed β = 0.99975; the everyday sum with c, 1 + β = 1.99975 c; the measured c′ and its give-or-take; the share c′ ÷ c | Alväger and others 1964 (see Sources) |
| **Answers** | each prediction's answer and the nearest-button helper | arithmetic |

**Not modelled (and the page says so):** speeds that are not along one line (that needs aberration, Spacetime Geometry 7); acceleration; the Sagnac and Zeeman refinements; dispersion in the water; rapidity (named at most); how pions decay (named only: a particle that falls apart and sends out light, Spacetime Geometry 6).

## Learner Controls ("Now try it yourself", trial values)

1. **Ship speed v** (buttons 0.1 c, 0.5 c, 0.9 c, 0.99 c).
2. **Probe speed w, relative to the ship** (buttons 0.1 c, 0.5 c, 0.9 c, 1.0 c, the last being light).

Drawing A shows the everyday sum, the relativistic result, the gap and the share of c, on a speed ruler that stops at c. These are trial values, not new measurements; the real pictures do not change with them.

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **A spaceship moves at half the speed of light (0.5 c) relative to the lab and fires a probe forward at half the speed of light (0.5 c) relative to the ship. How fast does the lab see the probe move?** Five buttons: 1.0 c, 0.9 c, 0.8 c, 0.7 c, 0.5 c. Answer: **0.8 c**. Drawn as a white mark on a speed ruler beside the real result.
2. **A particle moves at 0.99975 c and sends out a flash of light straight ahead. How fast does the lab measure the flash to go?** Four buttons: about 2 c, about 1.5 c, about c, less than c. Answer: **about c** (to within about 0.013 percent). Drawn as a white mark on the same ruler.

The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only. The question wording never says "speed limit" or gives the formula (§12).

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)

Outline: what "adding speeds" means (a walk on a moving train); what a reference frame is (a reminder of Relativity 2) and that the speed of light is the same in every frame (Relativity 5, said briefly, without the answer to either prediction); what the learner does; that the predictions never change the real pictures; assumptions (one line, one direction). Terms defined before use: *relative to* (measured by someone moving with it), *the everyday sum*, *refractive index* (only after the run, where Fizeau is explained), *neutral pion* and *gamma ray* (in plain words, at the point they appear). **Held back until after the run:** both predictions' answers and the formula's result for 0.5 c (§12). The "Want to know more?" list gives the original papers after the run and background pages before; where no plain official page exists, §29 rule 3(c) applies (see Sources).

### Display

1. **Picture 1, the rule (calculated here):** a speed ruler from 0 to c; the everyday sum and the relativistic result for the chosen speeds as two bars of different colours; a wall at c; the white guess for Prediction 1.
2. **Picture 2, light in moving water (measured, Fizeau 1851; explained 1907):** two tubes of water flowing in opposite directions, the light's speeds with and against the flow drawn as arrows; the everyday arrow (full water speed added) beside the observed fraction; labelled "calculated here" where the figure is a calculation.
3. **Picture 3, the CERN test of 1964 (measured):** a source moving at 0.99975 c, a flash forward; a speed ruler with the everyday sum (1.99975 c), the relativistic value (c) and the measured value with its give-or-take; the white guess for Prediction 2.
4. **Drawing A (follows the controls).**
Each has a "How to read this diagram" caption (§14, §29) with look-at, what-it-means and why-it-matters items and a "Where the real picture comes from" line separating the **measured** (Fizeau, Michelson and Morley, the CERN experiment), the **calculated here** (the rule and its results) and the **imagined for the question** (the spaceship and probe).

### Run

Five stages: the everyday rule on a train; the same two speeds near light; Fizeau's water; the 1964 flash; what the rule does at c. Guesses appear once the feature beside them is drawn.

### Results (neutral, then explained by the tutor)

A check-up (the rule against the everyday sum for the prediction's numbers; the Fizeau fraction against 1 − 1 ÷ n²; the 1964 measured value against c and against the everyday sum), a steps table, and a table of what has been tested, each with a "What this table tells us" note (§14). The predictions beside the results, tagged on the row. No "right" or "wrong". Words such as "close" are used only where a published reference or the paper's own give-or-take supports them.

### Tutor (Part 4)

Predict, observe, compare, explain (§13): why the everyday sum works at walking speed (the denominator is 1.000000000000001 for a train); how the rule keeps results below c (a worked 0.9 c + 0.9 c = 0.994 c); why the speed of light is the same for everyone (a pointer back to Relativity 5; the rule is the consequence, not a new law); what Fizeau's fraction tells us and why it surprised people in 1851; what the 1964 test adds (a source almost as fast as its own light did not give the light a head start). The tutor must not say that a limit "cannot be broken" without the experiment's evidence, and must not give a verdict on theories beyond special relativity.

## Expected Observations

0.5 c + 0.5 c = 0.8 c; 0.9 c + 0.9 c = 0.994 c; 0.99 c + 0.99 c = 0.99995 c; 0.1 c + 0.1 c = 0.198 c; any v with w = 1.0 c gives 1.0 c. Water: coefficient 0.435 for n = 1.33. 1964: 1.99975 c everyday, c by the rule, (2.9977 ± 0.0004) × 10¹⁰ cm/s measured.

## Expected Learner Understanding

That the rule is one consequence of the constant speed of light; that it agrees with the everyday sum when speeds are small; and that it has been tested, not merely stated.

## New Concepts Introduced

Relative to a frame (extended), the relativistic velocity rule, the drag of light by moving water, a test of the second postulate with a fast source.

## Relationship to Previous Experiments

Relativity 2 and 5 (reference frames; constant light speed), Relativity 9 and 11 (speeds of frames), Spacetime Geometry 5 (the speed a passing observer measures), 6 (decay) and 8 (Doppler).

## Relationship to Later Experiments

Experiment 4 (muons) tests time dilation at similar speeds; Experiment 7 (the microwave dipole) uses speeds relative to the sky.

## Required Physics Tests (each must fail when the module is deliberately broken)

1. The rule: u = 0.8 for (0.5, 0.5); 0.99448 for (0.9, 0.9) (1.8 ÷ 1.81); 0.99995 for (0.99, 0.99) (1.98 ÷ 1.9801); 0.19802 for (0.1, 0.1).
2. u = 1 for any a with b = 1, and for any b with a = 1.
3. u < 1 whenever a < 1 and b < 1.
4. The rule is symmetric: u(a, b) = u(b, a); and with b = 0, u = a.
5. For small a and b, u is within 0.1 percent of a + b (a = b = 0.01).
6. The gap u₀ − u is 0.2 for (0.5, 0.5) and grows with a for a fixed b.
7. The reversed rule recovers the probe's speed: (u − a) ÷ (1 − u a) = b.
8. Fizeau: for n = 1.33 and v much smaller than c, the drag coefficient is 1 − 1 ÷ n² = 0.4347, and the exact rule agrees to within 0.1 percent at v = 10 m/s.
9. The 1964 numbers: the everyday sum is 1.99975 c; the measured c′ ÷ c = 2.9977 ÷ 2.9979 within the quoted give-or-take of 0.0004 ÷ 2.9979.
10. The nearest-answer helper picks the closest button; Prediction 1's answer is 0.8 c; Prediction 2's is "about c".
11. The module does not change when predictions change.

## Sources (searched 2026-10-30)

| Source | What it was used for | Status |
|---|---|---|
| T. Alväger, F. J. M. Farley, J. Kjellman and L. Wallin, "Test of the second postulate of special relativity in the GeV region", *Physics Letters* 12, 260 (1964) (copy at `docente.unife.it/guido.zavattini/allegati/alvaeger-pl1964.pdf`; also `link.aps.org/doi/10.1103/PhysRev.135.B1071` appeared in the search, a different, earlier paper, **not read**) | the 1964 test | **downloaded and text-extracted 2026-10-30 (HTTP 200)**; the PDF is a scan and the extracted text is machine-read and noisy. Read: neutral pions of energy above 6 GeV, source speed 0.99975 c "according to special relativity", the proton synchrotron at 19.2 GeV/c, gamma rays timed over S = 31.450 ± 0.0015 m, c′ = (2.9977 ± 0.0004) × 10¹⁰ cm/s, k = (−3 ± 13) × 10⁻⁵. **The figures must be confirmed against the page images before the wording is approved.** A fetch by the page-reading tool failed ("Duplicate Content-Length") |
| "Fizeau experiment", Wikipedia (`en.wikipedia.org/wiki/Fizeau_experiment`) | the 1851 setup, the drag coefficient, Michelson and Morley's 1886 confirmation, von Laue's 1907 derivation | **first ~39,000 of ~65,000 characters read 2026-10-30 (HTTP 200)**; not an official page and not the original papers; no water speed, tube length, refractive index or numerical results from the 1886 paper were on the part read |
| Fizeau, *Comptes Rendus* 33, 349 (1851); Michelson and Morley, *Am. J. Sci.* 31, 377 (1886); Zeeman, *Proc. Roy. Acad. Amsterdam* 17 and 18 (1914, 1915); von Laue, *Annalen der Physik* 328, 989 (1907) | the original papers | **citations only, from the unread tail of the Wikipedia article as summarised by a tool; not fetched** |
| Mattingly, "Modern Tests of Lorentz Invariance", *Living Reviews in Relativity* 8, 5 (2005) (`arxiv.org/abs/gr-qc/0502097`) | a review of tests of the same principles | **appeared in a search; not fetched, not read** |
| A plain official page for **velocity addition in special relativity** | the "Want to know more?" list (§29 rule 3(b)) | **no plain official page found in four searches on 2026-10-30** (they returned Wikipedia, university course pages and forum threads). Candidates: Fermilab's "Proving special relativity: episode 2" (`fnal.gov/pub/today/archive/archive_2014/today14-04-04_NutshellReadMore.html`) returned **HTTP 403**, so it cannot be linked; a CERN Accelerator School relativity lecture PDF was found, not read, and is a lecture, not a plain page. To be recorded under §29 rule 3(c) if none is found after a further search |
| Refractive index of water, 1.33 | Fizeau's coefficient | **not yet sourced**; to be found at an official page (for example NIST) before use |

## Facts that may change (§29)

| Fact | Why it may change |
|---|---|
| Both tests are old and settled | none expected; a newer, tighter test of the speed of light from moving sources could be added to the table |
| No official explainer page for velocity addition | a page may appear or a blocked page may become reachable |

## Open items (to settle before wording is approved)

a. Confirm the 1964 figures against the page images (the extracted text is machine-read).
b. Fizeau's measured coefficient, the water speed, the tube length and the refractive index have no source read; the page may state only the coefficient 1 − 1 ÷ n² as the relativistic and Fresnel result, and Fizeau's "a fraction of the water's speed" in words, until the original or an official page is read.
c. The paper's k = (−3 ± 13) × 10⁻⁵ differs from a value worked out from its rounded speeds ((2.9977 − 2.9979) ÷ 2.9979 ÷ 0.99975 = −6.7 × 10⁻⁵); the paper's own figure is quoted, and the discrepancy is attributed only to rounding of the quoted speeds, which is an unconfirmed guess.
d. The 1964 paper itself notes that the gamma rays passed through material and that an "extinction theorem" argument could undermine such tests; the paper concludes this is negligible for gamma rays above 6 GeV over its distances (about 5 km in air quoted as the limit). The page need not teach this, but must not claim the test is beyond all doubt; it is an old test.
e. The rule's one-line derivation (from the constancy of light's speed) is not given at a source; the page states the result and points back to Relativity 5, as Spacetime Geometry 5 did.
f. No plain official page for velocity addition (see Sources; §29 rule 3(c)).

## Decisions for the owner (each with a default)

1. **Title.** "Can speeds simply be added?" (neutral; the proposal's "why 0.5c + 0.5c is not c" gives away Prediction 1). **Chosen by the owner on 2026-10-30** from six candidates. The file name `03-adding-speeds.md` is kept.
2. **Status label.** Settled (the rule, tested in water and with a source at 0.99975 c). Default: as stated, with "old tests, not a new result" said plainly.
3. **The two tests:** Fizeau's water and the 1964 CERN flash (both read). Default: both. Alternative: only the 1964 test (cleaner numbers, and its figures are the only ones read in a primary source).
4. **Scope:** one dimension only; no derivation; no rapidity. Default: yes.
5. **Two predictions** (0.5 c + 0.5 c, five buttons; the 0.99975 c flash, four buttons). Default: yes.
6. **Controls:** v (four buttons) and w (five, including 1.0 c). Default: yes.
7. **Fizeau figures:** state only 1 − 1 ÷ n² and Fizeau's result "a fraction of the water's speed", with no measured number, until a source is read. Default: yes.
8. **The 1964 figures** are shown with the paper's own give-or-take, as "measured, to about 0.013 percent". Default: yes, once the page images have been checked.
9. **Introduction length and links:** long and detailed, to §29; rule 3(c) recorded for velocity addition if no official page is found. Default: yes.
10. **Tutor:** the standard four-step sequence; it does not claim more than the tests show. Default: yes.
11. **Neutral pion and gamma ray** are defined in plain words where they appear, with no further particle physics. Default: yes.
12. **Pictures label every shape on the canvas and say plainly which are measured, calculated and imagined** (§14, "Predictions and the Real Results" point 6). Default: yes.
