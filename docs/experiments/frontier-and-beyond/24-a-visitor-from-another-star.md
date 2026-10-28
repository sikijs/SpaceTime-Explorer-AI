# Experiment 24 (Frontier and Beyond): A Visitor From Another Star (How Far Does the Sun Bend Its Path?)

**Status: PROPOSED by Claude on 2026-10-28 per `CLAUDE.md` §23 Stages 1 to 3, as the twenty-fourth experiment of the group (`00-group-proposal.md`, Part E, entry 24). Specification APPROVED by the owner on 2026-10-28 ("approved as is", read as all thirteen decisions on their defaults, including Decision 12: nothing about Experiment 25 is changed in the project documents until it has its own proposal and approval). Step 1 BUILT on 2026-10-28: the physics model and its tests (`src/physics/interstellarVisitor.ts` and `.test.ts`, 23 tests, checked by fifteen deliberate breaks; see the Implementation Notes, Step 1). Step 2 BUILT on 2026-10-28: the interface skeleton and introduction (`src/components/InterstellarVisitorExperiment.tsx`, wired into `src/App.tsx` with a placeholder summary); its wording was APPROVED by the owner on 2026-10-28 ("wording approved", after the changes listed under "Changes made to the Step 2 wording at the owner's request" in the Implementation Notes, Step 2); the owner has not yet said whether the three differences listed there are approved. Not yet done: Steps 3 to 10. The owner decided on 2026-10-28 that this experiment is built first and that an Experiment 25 about galaxies, with 2026 studies, follows it (see Decision 12). Every fact below came from an arXiv abstract fetched on 2026-10-28, from search results and summaries, and from the first 100,000 characters of the Wikipedia page on 3I/ATLAS; none was read in a full paper, and each must be checked at its source before the wording is approved (§29).**

> **Three changes to the group proposal's entry 24, for the owner's decision (Decisions 1, 2 and 3).** (a) The proposal's numbers are now checked against the discovery paper's abstract and the orbit tables, and they hold: the eccentricity is 6.14, the closest approach 1.356 times the Earth-Sun distance, the speed far from the Sun 58 km/s, the speed at closest approach 68.3 km/s (the proposal said "about 68") and the total bend **18.7 degrees** (the proposal said "about 19, to be checked"). (b) The proposal's prediction ("more than 90 degrees, about 20, or hardly at all") has only one sensible answer for most learners, so it is replaced by two predictions below, one about the bend and one about the speed at closest approach. (c) The model holds the published eccentricity and closest approach as data and **derives** the speed far from the Sun from them (58.0 km/s, which agrees with the published 58), because the published eccentricity is known to five decimal places and the published speed to two figures.

## Overview

The Sun's gravity pulls on everything that passes it. Some objects are caught and go round and round (closed paths, ellipses). Others are going too fast to be caught and sweep past on an open path (a hyperbola), bent a little by the pull, and never come back. Objects that come from another star are always of the second kind, because nothing slows them to a stop in our neighbourhood. Only three have ever been seen: 1I/ʻOumuamua (2017), 2I/Borisov (2019) and, on July 1, 2025, **3I/ATLAS**, found by the ATLAS survey. It came in at about 58 kilometres per second, passed the Sun on October 29, 2025 at 1.356 times the Earth-Sun distance (between the orbits of Earth and Mars), passed Jupiter at about 0.36 times the Earth-Sun distance on March 16, 2026, and is now on its way out for good.

The experiment asks three questions, all about the path and none about what the object is made of:

1. **Why is its path open, not closed?** The learner meets the **escape speed** (the speed at which a path no longer closes) and sees that 3I/ATLAS was going 1.6 times faster than it, even far away.
2. **Does the Sun speed it up as it falls in, and by how much?** At closest approach it is going 68.3 km/s, not the 58 it had far away.
3. **How much does the Sun bend its path?** About 18.7 degrees in all, from the way it came in to the way it goes out. A slower visitor would be bent far more: ʻOumuamua, at 26 km/s, about 113 degrees.

The model is **the Sun's pull alone, calculated here, set beside the published orbit**. It does not model the planets, the comet's own gas, or what the object is.

## Learning Objective

By the end the learner can say, in their own words:

1. A path round the Sun is closed (an ellipse) if the object is slower than the escape speed at that distance, and open (a hyperbola) if it is faster. At the distance of 3I/ATLAS's closest approach the escape speed is 36.2 km/s; the object was going 68.3 km/s there.
2. An object falling towards the Sun speeds up, and one flying away slows down, but a fast visitor keeps most of its speed: 58 km/s far away becomes 68.3 km/s at closest approach and returns to 58.
3. The faster the visitor, the less its path is bent: the total bend is 2 arcsin(1 ÷ e), where e is the eccentricity (a number that says how open the path is). For 3I/ATLAS, e = 6.14, so the bend is 18.7 degrees; for ʻOumuamua (e = 1.2) it is about 113 degrees; for Borisov (e = 3.4), about 34 degrees.
4. The path of 3I/ATLAS is known very precisely and is settled; this experiment does not say anything about what the object is made of or how old it is, which are separate and partly debated questions.
5. What the model leaves out: the other planets' pulls (small here), and the object's own gas pushing on it (the reported push is about 0.06 percent of the Sun's pull at closest approach, a rough comparison, to be checked).

## Physical Situation

A comet (a small body of ice and rock that grows a cloud of gas and dust near the Sun) comes in from outside the solar system at about 58 km/s relative to the Sun. Its orbit is tilted 175 degrees to the planets', so it goes round the Sun the opposite way to them. It passes the Sun at 1.356 AU and leaves. Counted from the Sun, its path sweeps through 198.7 degrees, which is 180 degrees plus the 18.7 degrees by which the direction it leaves in differs from the direction it came in from.

## Physics Model (`src/physics/interstellarVisitor.ts`, to be written)

| Part | What it computes | Source |
|---|---|---|
| **Constants** | the Sun's gravitational parameter GM = 1.32712440018 × 10²⁰ m³/s² and the astronomical unit (AU) 1.495978707 × 10¹¹ m (reused from Experiment 11's module, `fastestSpacecraft.ts`) | IAU |
| **Real object** | 3I/ATLAS: eccentricity 6.14135, closest approach 1.35645 AU, inclination 175.12 degrees; also the published speed far away, "about 58 km/s". Held as data. | arXiv:2507.02757 (abstract: e ~ 6.1, q ~ 1.36, V∞ ~ 58) and the Wikipedia page (6.14135 ± 0.00002; 1.35645 AU) |
| **Speed far away** | v∞ = √[(e − 1) GM ÷ q] (from the eccentricity and the closest approach): 58.0 km/s | derived here; agrees with the published 58 |
| **Speed at any distance** | v(r) = √(v∞² + 2GM ÷ r): 68.3 km/s at 1.356 AU, 71.7 at 1 AU, 61.0 at 5 AU, 58.1 at 100 AU | energy conservation; by hand 2026-10-28, **to be checked** |
| **Escape speed** | v_esc(r) = √(2GM ÷ r): 36.2 km/s at 1.356 AU; 42.1 km/s at 1 AU. The object is 1.89 times it at closest approach | arithmetic |
| **Eccentricity from the trial values** | e = 1 + q v∞² ÷ GM | standard two-body result |
| **Total bend** | 2 arcsin(1 ÷ e): 18.7 degrees for 3I/ATLAS | standard two-body result; by hand, **to be checked** |
| **Path** | the hyperbola r(θ) = q (1 + e) ÷ (1 + e cos θ), drawn from the Sun at one focus | standard two-body result |
| **Comparison objects** | 1I/ʻOumuamua: e = 1.2, v∞ = 26 km/s; 2I/Borisov: e = 3.4, v∞ = 32 km/s (rounded values from the Wikipedia page); bends 112.9 and 34.2 degrees | Wikipedia (secondary); the primary sources are not read |
| **Answers** | the predictions' answers, nearest-button helpers and the tutor's marks | arithmetic |

The module invents no new physics. It uses only the Sun's gravity, with the object treated as a point (the two-body problem). **Not modelled** (the page must say so): the planets' pulls (a hand estimate for Jupiter's flyby at 0.358 AU is about 0.08 degrees of extra bend, using a rough quick-pass approximation, **to be checked**), the push of the comet's own gas (the reported peak non-gravitational acceleration, 8.9 × 10⁻⁸ AU/day², is 0.056 percent of the Sun's pull at 1.356 AU, **to be checked**), relativistic effects (negligible at these speeds), and the object's size, shape, age and composition. **Assumed:** that the published eccentricity and closest approach describe the path round the Sun; some of the fit may include the object's own gas push (not read).

## Learner Controls ("Now try it yourself", trial values)

1. **Speed far from the Sun** (four buttons: 5, 26, 58 and 100 km/s; 26 is about ʻOumuamua's, 58 is 3I/ATLAS's). Trial values, not real objects.
2. **Closest approach** (three buttons: 0.3, 1.356 and 3 times the Earth-Sun distance). Trial values.

Drawing A shows the trial path (from the Sun's point of view), the trial's eccentricity, the speed at closest approach against the escape speed there, the total bend, and the verdict "open path". Every setting gives an open path, because the controls are speeds far away and those are always above zero. The page says in a note, not a control, that a visitor with no speed at all far away would just barely fail to escape. It says its numbers are trial values.

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **The Sun's pull bends the path of 3I/ATLAS. From the direction it came in to the direction it goes out, about how much is the path bent in all?** Five buttons on a log scale: about 2 degrees, about 6 degrees, about 20 degrees, about 60 degrees and about 150 degrees. Answer: **18.7 degrees**, button "about 20 degrees". Drawn as a white straight line leaving the Sun's side of Picture 1 at the guessed bend, beside the real path (Picture 1).
2. **3I/ATLAS was going 58 kilometres per second when it was far from the Sun. About how fast was it going at its closest approach, 1.356 times the Earth-Sun distance from the Sun?** Five buttons: slower, about 40 km/s; the same, about 58 km/s; a little faster, about 70 km/s; about twice as fast, about 115 km/s; about four times as fast, about 230 km/s. Answer: **68.3 km/s**, button "about 70". Drawn as a white mark on Picture 2's speed ruler at the closest approach.

The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only (§12, §13).

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)
Outline: Experiment 11 and Gravity 6 recalled (an orbit is a path under gravity; the escape speed); what an interstellar object is, with the three known and the dates; the question of why some paths close and others do not, with a daily-life comparison (a ball thrown up from the ground: slower than a certain speed it comes back, faster than it, it does not, and a faster one is deflected less); what "bend" and "eccentricity" mean (the eccentricity says how open the path is: 0 is a circle, between 0 and 1 an ellipse, above 1 a hyperbola, and the higher it is, the straighter the path); what 3I/ATLAS did (found July 1, 2025; closest to the Sun October 29, 2025; past Jupiter March 16, 2026; leaving); the learner's job; that the predictions never change the real pictures; the assumptions. Terms defined before use: *interstellar*, *comet*, *orbit*, *ellipse*, *hyperbola*, *eccentricity*, *escape speed*, *closest approach (perihelion)*, *speed far away (v∞)*, *AU*, *bend*. Held back until after the run: both predictions' answers (§12), and the page does not say how large or small the bend is.

### Display
1. **Picture 1, the path from above the Sun:** the Sun at the centre, the orbits of Earth, Mars and Jupiter as faint circles for scale, the real hyperbola of 3I/ATLAS with the closest approach and the date marked, the two directions far away (the straight lines the path leans towards) with the bend angle between them drawn, and Prediction 1's white mark (a straight line leaving at the guessed bend).
2. **Picture 2, speed against distance:** the speed of 3I/ATLAS along its path and the escape speed at each distance, from 0.3 to 100 times the Earth-Sun distance on a log ruler, with the speed far away (58 km/s) and Prediction 2's white mark at the closest approach.
3. **Drawing A (follows the controls):** the trial path, its eccentricity, its bend, its speed at closest approach against the escape speed, and the verdict "open path".
Each picture has a "How to read this diagram" caption with look-at / what-it-means / why-it-matters items (§14, §29) and a "Where the real picture comes from" line.

### Run
Five stages: the Sun and the planets for scale; the object's path coming in; the closest approach and the speed there; the path going out; the bend and the two directions. Guesses appear once the feature beside them is drawn.

### Results (neutral, then explained by the tutor)
A check-up table (eccentricity, closest approach, speed far away, speed at closest approach, escape speed there, and the bend, each beside the published value where one exists, or the comparison the page sets), a second table of steps from the eccentricity to the bend, and a third table of the three known interstellar objects (eccentricity, speed far away, and the calculated bend), each with a "What this table tells us" note (§14). The predictions beside the results, tagged on the row. No "right" or "wrong".

### Tutor (Part 4)
Predict, observe, compare, explain (§13): why speed above escape speed means an open path; why an object speeds up as it falls in and slows as it leaves, and what stays the same; why a faster visitor is bent less, with the bend formula worked in numbers for the three known objects; what the model leaves out, and that the rest of what is known about 3I/ATLAS (its gas, its age) is a separate question.

## Expected Observations
Speed far away 58.0 km/s; closest approach 1.356 AU; speed there 68.3 km/s against an escape speed of 36.2 km/s (1.89 times); eccentricity 6.14; bend 18.7 degrees. For comparison, ʻOumuamua 113 degrees and Borisov 34 degrees.

## Expected Learner Understanding
That an orbit's shape is decided by speed compared with escape speed; that gravity bends a fast path only a little; and that a few numbers (here two, the speed far away and the closest approach) are enough to give the whole path.

## New Concepts Introduced
Hyperbolic orbit, eccentricity, escape speed (met in Gravity 6, here extended past it), speed far away (v∞), bend angle, interstellar object.

## Relationship to Previous Experiments
Gravity 6 (orbits, escape speed), Black Holes 3 (orbits near a black hole), Frontier and Beyond 11 (the Sun's gravity and a spacecraft's speed at closest approach; the module's constants), and Experiments 18 and 21 (a path bent by gravity, which is the idea behind lensing in Cosmology 7 and Gravity 8).

## Relationship to Later Experiments
Experiment 25 (galaxies; see Decision 12) is unrelated. This is the last experiment of Part E, "our neighbourhood".

## Required Physics Tests (each must fail when the module is deliberately broken)
1. The speed far away, derived from e = 6.14135 and q = 1.35645 AU, is 58.0 km/s (± 0.1), worked separately in SI units, and agrees with the published 58.
2. The speed at closest approach is 68.3 km/s (± 0.1), and the escape speed there is 36.2 km/s (± 0.1).
3. The eccentricity from a speed far away and a closest approach is 1 + q v∞² ÷ GM, and reproduces 6.14 when given 58 km/s and 1.356 AU (to within the rounding of 58).
4. The total bend is 2 arcsin(1 ÷ e): 18.7 degrees (± 0.1) for 3I/ATLAS, 112.9 for e = 1.2 and 34.2 for e = 3.4; and it rises as e falls.
5. The speed at any distance obeys energy conservation: v² ÷ 2 − GM ÷ r is the same at every distance on the path (round trip between two distances).
6. The path r(θ) puts the closest approach at θ = 0, goes to infinity at the angle ± arccos(−1 ÷ e), and the angle between the two directions far away, measured from the Sun, is 180 degrees plus the bend.
7. A speed far away above zero gives an open path (e > 1) at every closest approach; the speed at closest approach is always above the escape speed there.
8. The nearest-answer helpers pick the closest button on a log scale, and each guess's marker position is distinct and in order.
9. The published object is held as listed (e = 6.14135, q = 1.35645 AU, inclination 175.12 degrees).
10. The module does not change when predictions change (separation, §9, §14).

## Sources (checked 2026-10-28 only by search results, one arXiv abstract and the first 100,000 characters of a Wikipedia page; none read in full)
| Source | What it was used for | Status |
|---|---|---|
| "Discovery and Preliminary Characterization of a Third Interstellar Object: 3I/ATLAS" (Seligman and others, arXiv:2507.02757, accepted in *ApJL*) | discovery on July 1, 2025; e ~ 6.1, q ~ 1.36 AU, inclination ~ 175 degrees, V∞ ~ 58 km/s | abstract fetched 2026-10-28; paper not read |
| Wikipedia, "3I/ATLAS" | e = 6.14135 ± 0.00002, q = 1.35645 AU, perihelion October 29, 2025 at 11:45 UT, v∞ = 58 km/s, inclination 175.12 degrees; closest to Earth December 19, 2025 at 1.798 AU; Jupiter March 16, 2026 at 0.358 AU; non-gravitational acceleration peak (89.3 ± 4.6) × 10⁻⁹ AU/day²; the eccentricities and speeds of ʻOumuamua and Borisov | secondary; first 100,000 of 263,396 characters; the primary orbit solution (JPL Small-Body Database) not read |
| NASA, ESA and NOIRLab plain pages on interstellar objects and 3I/ATLAS | the "Want to know more?" list | **not yet found or fetched** |
| Search summaries (JUICE observations released April 2026; ALMA methanol-to-HCN ratio; "7 billion years old"; "about 130,000 mph") | context only, not used in the physics; the age and composition claims are not part of the experiment | summaries only |

## Facts that may change (§29)
| Fact | Why it may change |
|---|---|
| the orbit's numbers (e, q) | later fits may include more observations or the non-gravitational push |
| the comet's later path and any later observations | it is leaving; new papers continue to appear |
| the count "three known interstellar objects" | another may be found (a fourth, and its discovery, would be announced as news) |
| the speeds and eccentricities of ʻOumuamua and Borisov | rounded from a secondary page; to be checked at the JPL database |

## Open items
a. No paper was read in full; the orbit numbers come from an abstract and a secondary page.
b. The bend formula, the speed formula, the Jupiter and non-gravitational comparisons were worked by hand and are to be checked.
c. Plain official pages (NASA, ESA, NOIRLab) for interstellar objects and for 3I/ATLAS are to be found and fetched (§29 rule 3).
d. A search for 2026 results about the orbit (for example, a later fit or a Jupiter-flyby measurement) was made only in summary; a fuller search is to be repeated before the wording is approved (Decision 9).
e. Whether the published eccentricity and closest approach already include the comet's gas push is not known.

## Decisions for the owner (each with a default)
1. **Anchor and status label.** Keep the Sun's pull and the path as the core, use 3I/ATLAS as the real object, and label the experiment: Settled (that it is interstellar, and its path round the Sun, to the precision given); not part of the experiment (its age, its composition and its gas, which have their own open questions). Default: as stated.
2. **Replace the proposal's prediction** (more than 90 degrees, about 20, or hardly at all) with the two predictions above. Default: yes.
3. **Derive the speed far away** (58.0 km/s) from the published eccentricity and closest approach, and check it against the published 58. Default: yes.
4. **Controls:** two controls, speed far away (5, 26, 58, 100 km/s) and closest approach (0.3, 1.356, 3 AU), as trial values. Default: yes.
5. **Prediction 2's buttons:** 40, 58, 70, 115 and 230 km/s, balanced on a log scale, with the nearest to the answer, "about 70". Default: yes.
6. **Pictures:** two pictures and one drawing. Default: yes.
7. **Results:** a check-up, a steps table and a table of the three known objects; no table of trial values. Default: yes.
8. **The comparison objects** ʻOumuamua and Borisov are shown from the rounded values on the Wikipedia page, with a note that the primary values were not read. Default: yes, until the JPL values are fetched.
9. **A 2026 search** for newer results is repeated before the wording is approved. Default: yes.
10. **Tutor:** the standard four-step sequence. Default: yes.
11. **Introduction length and links:** long and detailed, to §29. Default: yes.
12. **Experiment 24 is no longer the group's last experiment.** On 2026-10-28 the owner decided to add an Experiment 25 about galaxies, with 2026 studies, after this one. If approved, the group's count, `00-group-proposal.md`, `PROJECT.md`, `AGENTS.md` and `CLAUDE.md` change from twenty-four to twenty-five, and the closing recap of the group (proposed in `00-group-proposal.md`) would follow Experiment 25, not this one. Default: yes, but nothing is changed until Experiment 25 has its own proposal and approval.
13. **Title** "A visitor from another star" (does not give away either prediction). Default: keep.

## Implementation Notes (Step 1, 2026-10-28)

The physics model is built (`src/physics/interstellarVisitor.ts`, 23 tests in `interstellarVisitor.test.ts`; it imports only the constants `SUN.gm` and `ASTRONOMICAL_UNIT` from Experiment 11's module). It holds 3I/ATLAS (e = 6.14135, q = 1.35645 AU, inclination 175.12 degrees), the rounded values for ʻOumuamua and Borisov, and the formulas for the speed far away, the speed at any distance, the escape speed, the eccentricity, the total bend, the path and its asymptote angle. It also holds the trial-orbit function for Step 5's controls (`trialOrbit`) and both predictions' buttons, answers, tutor marks and markers. The required tests 1 to 10 are all covered.

Numbers the module gives, each matching an independent script written outside the module on 2026-10-28: speed far away 57.99 km/s; speed at closest approach 68.34 km/s; escape speed there 36.17 km/s (1.89 times); eccentricity 6.14135; total bend 18.74 degrees (112.9 for e = 1.2, 34.2 for e = 3.4); the path sweeps 198.74 degrees; the asymptote is at 99.37 degrees either side of closest approach.

Differences from the specification, for the owner's approval:
1. **Prediction 2's button labels** are written out in full ("slower, about 40 km/s", "the same, about 58 km/s", "a little faster, about 70 km/s", "about twice as fast, about 115 km/s", "about four times as fast, about 230 km/s"). The values are the specification's.
2. **Prediction 1's marker** is held as the guessed bend in degrees (the white line's angle), and Prediction 2's as the guessed speed in km/s. The rulers' positions (Picture 2's speed ruler and the drawings' scales) are not in the module yet; they come with Step 4, as the earlier experiments' did.
3. **The comparison objects** ʻOumuamua and Borisov are held as eccentricity and speed far away only (the rounded Wikipedia values); their closest approaches are not held, because the specification does not need them.

**Deliberate breaks:** fifteen changes to the module were each caught by at least one test (the escape speed's 2, the speed formula's 2GM/r, the bend's factor 2 and its arcsin, the eccentricity formula, the speed-far-away formula's e − 1, the path's sign, the asymptote's sign, the log nearest-button comparison, the published eccentricity, the astronomical unit, the Sun's GM, the 70 km/s button, the 20 degree button, and the tutor's mark). Two of the first set survived and were fixed: a changed 70 km/s button and a changed 20 degree button (a new test fixes the buttons' values and labels); a third break, of the astronomical unit, was mistakenly made on the import line and was re-done on the exported constant.

**Not checked:** the formulas were worked by hand and by a separate script only; they are standard two-body results but no source was read (Open item b).

## Implementation Notes (Step 2, 2026-10-28)

Built: the title, the status line, the introduction (the question, a visitor from another star, why some paths close and others do not with a ball-thrown-up-from-the-ground comparison, the two numbers that describe the path, the learner's job, "What your guesses do" per §14, and what is and is not modelled), a collapsed "Words and formulas" panel of twelve terms, and a "Want to know more?" list with two links. No predictions, run, pictures, controls, results, tutor or summary yet. The introduction has no computed number in it. Checked in Chrome: the page renders, the panel is closed at first, both links open in a new tab, and none of the predictions' answers (18.7, 68.3, 6.14, 58, 36.2, 198, "about 20", "70 km") appears anywhere on the page.

Differences from the specification, for the owner's approval:
1. **Only two links are shown before the run** (NASA: Comets; the Smithsonian page on escape speed). NASA's and ESA's pages on 3I/ATLAS both give its speed at closest approach (NASA: about 153,000 miles an hour, 246,000 km/h, which is 68.3 km/s; ESA: roughly 250,000 km/h), which is Prediction 2's answer, so they are listed after the run (Step 8), as Experiment 23 did with a page that gave its answer away. The papers are listed after the run too.
2. **The "Words and formulas" panel has no formulas yet.** The bend formula and the speed formulas would let a learner work out both answers, so they are shown in Part 3, after the run (§12). The panel's "give-or-take" entry from earlier groups was left out, because this page does not use it.
3. **The date of closest approach is "the end of October 2025"** in the introduction. ESA and Wikipedia give October 29, 2025 (11:45 UT); NASA's page gives October 30. The exact date is not needed by the learner, so the sources' disagreement is avoided and noted here for the results step.

**Source status of the introduction's claims** (fetched 2026-10-28): NASA's facts page says 3I/ATLAS was reported on July 1, 2025, came from the general direction of Sagittarius, passed closest to the Sun at about 1.4 AU, came no closer to Earth than 1.8 AU, moved on a hyperbolic path too fast to be bound by the Sun, and has left; ESA's FAQ confirms the discovery, the comet's nature (an icy object with gas, dust and tails), Mars (October 3, 2025, 29 million km), Earth (December 19, 2025, about 270 million km) and the Sun (October 29, 2025, 203 million km, which is 1.357 AU); the Smithsonian page gives the Earth's escape speed as about 11 km/s; NASA's comets page says a comet is a snowball of frozen gases, rock and dust, and names ʻOumuamua and Borisov as visitors from beyond the solar system. **No source read** for: Jupiter's flyby on March 16, 2026 (Wikipedia only); "NASA-funded telescope in Chile" (a search summary of NASA's page); the ball-thrown-up comparison; Mars about 1.5 AU and Jupiter about 5 AU; the Earth's orbital speed of about 30 km/s (from Experiment 11's module); the comet sizes in the "Comet" entry ("a few hundred metres to several kilometres"; NASA's page gives 440 metres to 3.5 miles for 3I/ATLAS's nucleus); "the Sun alone could not hold on to it" as stated physics (a standard two-body result). A NASA statement that the speed of 3I/ATLAS at closest approach is about 153,000 miles an hour agrees with this experiment's model (68.3 km/s) and is the first independent check of it; it is not shown on the page before the run.

**Changes made to the Step 2 wording at the owner's request (2026-10-28), all approved:**
4. The first line now defines 3I/ATLAS (a comet, found in July 2025, that came from outside the solar system) before using the name.
5. The ball is thrown "from the ground" (and the air is ignored), not "from a hill".
6. The escape-speed explanation was rewritten (a deep hole to climb out of; the Earth's escape speed about 42 km/s and Jupiter's distance about 19, from the module) and an example was added: the Earth moves at about 30 km/s, less than the 42 km/s escape speed at its distance, so the Sun holds it (the owner asked for this example; the 30 is Experiment 11's module value, a mean orbital speed).
7. The "bend" explanation was rewritten around the direction of travel before and after the Sun, with a car turning a corner at a crossroads (90 degrees) or driving straight on (0 degrees); the words "a little" and "slightly" were removed so that nothing hints at the size of the bend.
8. A read-through fixed: the escape-speed Words entry ("the gravity of the body it is leaving"), "none had been confirmed" before 2017, the wording about the name "3I/ATLAS", and the comet's gas push ("astronomers have measured a tiny push of this kind", from Wikipedia's note on the non-gravitational acceleration).
