# Experiment 2 (Evidence and Imagination): Can You Travel Back in Time?

**Status: specification approved by the owner on 2026-10-30 ("approved", read as all twelve decisions on their defaults, including the wormhole model in place of Gödel's tilting cones). BUILT in nine steps and finally reviewed on 2026-10-30 (see "Implementation Notes" below); the wording of each step, the review's wording fixes and all the differences from this specification were approved by the owner on 2026-10-30.** Proposed by Claude on 2026-10-30 per `CLAUDE.md` §23 Stages 2 and 3, as Experiment 2 of the group (`00-group-proposal.md`, approved as a direction on 2026-10-29). The abstracts of six papers and NASA's Space Place and Cosmicopia pages were read on 2026-10-30; no paper was read in full, and each number must be checked at its source before it is relied on (§29, §28.6).

> **Four things for the owner's attention (decisions 2, 3, 4 and 6).**
> (a) **The model differs from the group proposal's one-line description.** The proposal said "cones that tilt round a loop". This draft uses the **wormhole time machine** of Morris, Thorne and Yurtsever (1988) instead, because Experiment 1's specification promised that this experiment "uses the wormhole as one way to make a closed path in time", because it needs only arithmetic the learner already has (the twins of Relativity 10 and the light cones of Spacetime Geometry 2), and because the sources say the condition in one line: a closed path forms once the clock offset exceeds the light-travel time outside. Gödel's rotating universe (the "tilting cones" model) is **named only** (Decision 2).
> (b) **The model is an idealisation of an idealisation.** Wormhole mouths are treated as points joined by a tunnel of zero length. No wormhole is known to exist (Experiment 1), so every step of the picture rests on mathematics, not on any observation. The page must say so on every picture (`PROJECT.md` §9).
> (c) **Two statuses on one page.** Travel to the future is **Settled** (clocks have shown it); travel to the past is **Open** (the equations of general relativity allow it in some models; a 1992 conjecture says nature forbids it; nobody has proved it either way). The page must keep these two apart and must not say "possible" or "impossible" about the past.
> (d) **"Chronology protection"** is a conjecture, not a law. The tutor must say so and must not use it to close the question.

## Overview

Travelling to the **future** is easy and has been measured: a clock that moves fast, or sits deep in gravity, ticks slowly, so its owner arrives in the future of everyone who stayed behind (the twins, Relativity 10; GPS, Gravity 9). Travelling to the **past** is a different question. General relativity has no rule that forbids a path through spacetime that returns to its own starting point in time (a **closed timelike curve**), and it has mathematical models that contain such paths. This experiment shows the simplest way to make one in a model, and why that is not the same as being able to do it:

1. **Forward is settled.** A mouth of a tunnel sent out and back at 0.8 of the speed of light for 10 years (as the stay-at-home mouth counts them) comes back with a clock that has counted only 6 years: a **4-year offset**, by the same arithmetic as the twins.
2. **Backward needs a tunnel.** If a wormhole joins the two mouths, going in at the younger mouth leads out of the older mouth **4 years earlier**. If the mouths are only 1 light-year apart outside, a traveller can go through, then run outside to the other mouth, and arrive **before they left**. A closed path in time exists in the model once the offset is larger than the outside light-travel time.
3. **Whether nature allows it is open.** Making the tunnel needs negative energy (Experiment 1). In 1992 Hawking argued that the build-up of energy at the edge of the time machine would stop it forming ("chronology protection"), but this is a conjecture, tested in some models and not proved in general. No closed timelike curve has ever been seen.

The model is the mathematics, drawn to scale; the status is **Settled** for the future, **Open** for the past. The experiment does not say that time travel to the past is possible and does not say it is impossible.

## Learning Objective

By the end the learner can say, in their own words:

1. Travel to the future is real and measured: a fast or deep-in-gravity clock runs slow, so it ends up behind a stay-at-home clock (Relativity 10, Gravity 9).
2. A **closed timelike curve** is a path through spacetime that always moves forward in the traveller's own time and yet returns to an earlier moment at its own starting place.
3. In the wormhole model, a time machine is made by letting one mouth's clock fall behind the other's (the twins again) and then bringing the mouths close together. A path through the tunnel and back outside is closed in time when the offset between the mouths' clocks is **larger than the light-travel time outside** between the mouths.
4. A time machine of this kind only reaches back to the moment it was made, never earlier.
5. The model needs a traversable wormhole, which needs negative energy (Experiment 1), so it is an idea from the mathematics, not a design.
6. As of October 2026 no closed timelike curve has been observed; "chronology protection" is a conjecture that nature forbids them; the question is open.

## Physical Situation

Two mouths of a wormhole, A and B, start side by side and joined by a tunnel of length zero (the idealisation), with their clocks set equal. Mouth A stays put. Mouth B is sent away at a steady speed and comes back to rest at a distance d from A, after T years by A's clock. B's clock, like the travelling twin's, has counted fewer years. The tunnel joins A's clock readings to B's clock readings **equal for equal**, so after the trip it joins events that are **Δ years apart** in the common frame. The experiment draws that on a spacetime diagram (Spacetime Geometry 2's light cones) and asks whether a path exists that ends before it starts.

## Physics Model (`src/physics/timeTravel.ts`, to be written; may import Relativity 10's twin function and Experiment 1's nothing)

| Part | What it computes | Source |
|---|---|---|
| **Travel to the future** | for a mouth moving at β = v/c for T years in the stay-at-home frame, its clock counts τ = T √(1 − β²); the offset Δ = T (1 − √(1 − β²)) | the twin paradox formula already built (Relativity 10); special relativity, to be checked against a source |
| **The tunnel link** | entering B when A's frame-time is t exits A at frame-time t − Δ (the clock readings match; B's clock is behind by Δ); entering A exits B at t + Δ (forward) | Morris, Thorne and Yurtsever 1988 (through summaries: "mouth A is at rest, mouth B ... returns to its starting point"); the sign bookkeeping is **derived here, to be checked at the paper** |
| **The closed path** | leave B at t, emerge from A at t − Δ, run outside at speed w < c to B (distance d): arrival at t − Δ + d ÷ w. This is before t exactly when Δ > d ÷ w; as w → c, when Δ > d ÷ c. The time gained is Δ − d ÷ c at best | a search summary: "once the distance L between the mouths is less than the time shift T, a closed timelike curve forms"; the arithmetic is worked here |
| **Light cones** | the cone drawn from the exit event, and whether the entry event lies inside it (reuses Spacetime Geometry 2's `classifyEventPair`) | Spacetime Geometry 2 |
| **How fast is fast enough** | the smallest β for a given T and d: Δ(β) > d ÷ c, solved from 1 − √(1 − β²) > d ÷ (c T) | worked here |
| **What has been looked for** | none computed; a table of the sources' statuses is data | see Sources |
| **Answers** | each prediction's answer, the nearest-button helper, the tutor's marks | arithmetic |

**Not modelled (and the page says so):** the acceleration and turning of mouth B (the offset is taken from the steady-speed legs only; the difference is stated, not drawn); the tunnel's length (zero) and stability; how the wormhole is made (negative energy, Experiment 1); gravity of the mouths; quantum effects; any paradox or its resolution (the grandfather paradox is **named only**, with the plain statement that the model has no rule about it); the Gödel rotating universe and other closed-timelike-curve models (named only); the chronology horizon's exact time (stated in words, not computed).

## Learner Controls ("Now try it yourself", trial values)

1. **Speed of the moving mouth** (buttons: 0.1c, 0.5c, 0.8c, 0.9c, 0.99c). The drawing shows the clock offset Δ after a 10-year trip and whether a closed path exists for the chosen separation.
2. **Separation of the mouths outside** (buttons: 1 light-day, 1 light-year, 3 light-years, 5 light-years). The drawing shows d ÷ c against Δ and how much earlier the arrival is (or that there is no arrival before departure).

These are trial values, not new measurements, and the real pictures do not change with them. At 0.1c, Δ = 0.05 years (about 18 days).

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **Mouth B is sent out and back at 0.8c for 10 years of A's time, then parked 1 light-year from A. By B's own clock, how many years went by?** Five buttons (10, 8, 6, 4, 2 years). Answer: **6 years** (the offset is 4). Drawn as a white mark on B's clock scale beside A's 10 years (Picture 1). The prediction is deliberately about the settled forward case, so the learner has the offset before the backward question.
2. **A traveller goes into the tunnel at B, comes out of A, and runs outside back to B at nearly the speed of light. Do they get back before they left?** Two buttons (yes, no). Answer: **yes, about 3 years before** (offset 4 years; outside trip a little over 1 year). A yes or no has no size of its own, so a marker is drawn, and the caption says so.

The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only. **Title kept neutral:** "Can you travel back in time?" gives away neither answer.

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)

Outline: what "forward" and "backward" in time mean for a clock (a clock only ever ticks forward along its own path); a reminder of the twins and the light cone ("which events can reach which", Spacetime Geometry 2); what a wormhole is (Experiment 1, in two sentences, and that none has been seen); why the two mouths' clocks could differ; what the learner does; that the predictions never change the real pictures; assumptions (point mouths, a zero-length tunnel, steady speed, no acceleration; a toy from the mathematics). Terms defined before use: *closed timelike curve* (a path that always goes forward in your own time and still returns to an earlier moment), *time machine* (used only in this narrow sense), *offset*, *light-travel time*, *chronology protection* (named only, after the run). **Held back until after the run:** both predictions' answers and Hawking's conjecture (§12). The "Want to know more?" list gives the original papers after the run (they contain the answers) and background pages before, and records any missing official page under §29 rule 3(c).

### Display

1. **Picture 1, forward in time (settled):** two clock faces, A's and B's, after the 10-year trip, with B's offset drawn and labelled; the white guess on B's scale. A short table of real forward-time measurements (see Sources).
2. **Picture 2, the spacetime diagram of the tunnel:** space across, time up, A's and B's worldlines, the tunnel link drawn as a jump from one mouth's event to the other mouth's event Δ earlier, the light cone from the exit event, the closed path (tunnel then outside) in a distinct colour, labelled "imagined: needs a wormhole"; Prediction 2's white marker.
3. **Picture 3, how much earlier:** a bar of Δ against d ÷ c for the chosen settings (a closed path appears only when Δ is the longer bar).
4. **Drawing A (follows the controls):** the chosen speed and separation, Δ, d ÷ c, the time gained, and the smallest speed that would give a closed path.
Each has a "How to read this diagram" caption (§14, §29), with look-at, what-it-means and why-it-matters items, and a "Where the real picture comes from" line separating the **measured** (the forward clock offsets; the absence of any closed path ever seen), the **calculated here** (the offset, the link, the closed path) and the **imagined** (the wormhole itself).

### Run

Five stages: a clock only goes forward (the twins, recalled); mouth B's trip and its offset; the tunnel link; the closed path and the light cone; what has been looked for. Guesses appear once the feature beside them is drawn.

### Results (neutral, then explained by the tutor)

A check-up (the offset by the twin formula against the offset in the diagram; Δ against d ÷ c; the real forward measurements), a steps table, and a table of what has been tested, each with a "What this table tells us" note (§14). The predictions beside the results, tagged on the row. No "right" or "wrong".

### Tutor (Part 4)

Predict, observe, compare, explain (§13): why B's clock falls behind (the twins); why the tunnel turns the offset into a path back in time (a daily-life comparison: a staircase joining two floors whose clocks differ by a few years, like a time-zone border but much larger; to be checked for relativity content); why the path closes only when Δ exceeds d ÷ c; why it cannot go back before the machine existed; what the grandfather paradox is, said plainly as an unresolved puzzle the model does not answer; what chronology protection is and is not (a conjecture, supported in some models, open in general); what has and has not been tested. The tutor must not say that time travel to the past is possible or that it is impossible.

## Expected Observations

After a 10-year trip at 0.8c, B's clock reads 6 years: offset 4 years. With the mouths 1 light-year apart, a closed path exists and gains 3 years at best (4 − 1). At 0.1c the offset is 0.05 years (about 18 days): a separation of 1 light-day (0.0027 years) gives a closed path, but 1 light-year does not. At 0.99c the 10-year offset is 8.6 years.

## Expected Learner Understanding

That "forward in time" and "backward in time" are not the same kind of claim: one is measured, the other lives only in the mathematics of some models; that a closed path needs two things at once (an offset and a short outside distance); and how to read a headline about "time travel".

## New Concepts Introduced

Closed timelike curve, the clock offset between two joined mouths, the tunnel link, the chronology horizon (named only), chronology protection (named only), the grandfather paradox (named only).

## Relationship to Previous Experiments

Relativity 10 (twins), Spacetime Geometry 2 and 3 (light cones, cause before effect), Gravity 9 (clocks in orbit), Evidence and Imagination 1 (wormholes), Frontier 9 and 10 (clock offsets measured).

## Relationship to Later Experiments

Experiment 3 of the group (adding speeds) and Experiment 4 (muons) are settled tests of the same special relativity.

## Required Physics Tests (each must fail when the module is deliberately broken)

1. The offset Δ = T (1 − √(1 − β²)): 4.000 years for β = 0.8, T = 10; 8.589 years for β = 0.99; 0.0501 years for β = 0.1.
2. B's clock reads T √(1 − β²): 6.000 years for β = 0.8.
3. Δ = 0 at β = 0, and Δ increases with β for a fixed T.
4. The closed-path condition Δ > d ÷ c: true for (0.8c, 10 years, 1 light-year); false for (0.1c, 10 years, 1 light-year); the boundary case Δ = d ÷ c is **not** closed (a light ray only).
5. The time gained, Δ − d ÷ c, is 3.000 years for (0.8c, 10 years, 1 light-year).
6. The smallest speed for a closed path at (10 years, 1 light-year) satisfies Δ(β) = 0.1 years: β = 0.4359 (1 − √(1 − β²) = 0.1 gives √(1−β²) = 0.9, β = √0.19 = 0.4359).
7. The exit event from A at t − Δ lies on the **past** side of the entry event, and the entry event is inside the light cone of the exit event when Δ > d ÷ c (reuses Spacetime Geometry 2's classification).
8. The closed path never reaches before the first moment Δ exceeds d ÷ c (stated as a property of the model; the test checks the arithmetic on the offset's build-up only).
9. The nearest-answer helper picks the closest button; Prediction 1's answer is "6 years".
10. The module does not change when predictions change.

## Sources (searched 2026-10-30 by search results and search summaries; none fetched or read)

| Source | What it was used for | Status |
|---|---|---|
| Morris, Thorne and Yurtsever, "Wormholes, Time Machines, and the Weak Energy Condition", *Physical Review Letters* 61, 1446 (1988) (`link.aps.org/doi/10.1103/PhysRevLett.61.1446`; also `authors.library.caltech.edu/9262/`) | a traversable wormhole can be turned into a time machine by moving one mouth; the energy-condition issues | **abstract read on 2026-10-30** (CaltechAUTHORS record, HTTP 200; the `link.aps.org` page returned 403): a wormhole that could be made and kept open "can be converted into a time machine"; the abstract does not mention moving a mouth or use the phrase "closed timelike curves"; full paper not read |
| Search-result summary of the mouth-moving setup (a mouth at rest, the other sent out at high speed and returned; "once the distance L between the mouths is less than the time shift T, a closed timelike curve forms") | the closed-path condition used in the model | search summary only; the exact statement is **to be checked at the paper or a textbook** |
| Hawking, "Chronology protection conjecture", *Physical Review D* 46, 603 (1992) (`journals.aps.org/prd/abstract/10.1103/PhysRevD.46.603`). **Correction (2026-10-30): arXiv:hep-th/9202090, which appeared in the search, is not Hawking's paper. It is Visser, "From wormhole to time machine: comments on Hawking's Chronology Protection Conjecture", *Phys. Rev. D* 47, 554 (1993).** | back-reaction of quantum fields would become very large as closed curves form; the conjecture that the laws of physics do not allow closed timelike curves | Hawking's paper: **not fetched (the APS page returned 403 on 2026-10-30)**, so the page does not link it. Visser's commentary: abstract read 2026-10-30 (HTTP 200); it argues that Casimir effects, wormhole disruption and back reaction work against time machines and, in its model problems, supports Hawking's conjecture |
| Gödel, 1949, a rotating universe with closed timelike curves; the critical radius sinh r = 1 | named only | search summaries only; and only a search summary for limits on the universe's rotation (several orders of magnitude, depending on assumptions) |
| Closed Timelike Curves, Singularities and Causality: A Survey from Gödel to Chronological Protection (arXiv:2101.08592) | a survey of the field | **abstract read 2026-10-30** (HTTP 200): Luminet, *Universe* 7, 12 (2021); a historical survey from Gödel's 1949 universe; it says no chronological-protection mechanism is currently known |
| Chronology Protection of Rotating Black Holes in a Viable Lorentz-Violating Gravity (arXiv:2509.19744, revised November 2025) | a recent paper on chronology protection in one model | **abstract read 2026-10-30** (HTTP 200): Park and Maeda, first submitted 24 Sep 2025, revised 25 Nov 2025, "Accepted in PLB"; chronology is still protected because a torus-shaped singularity hides the region with closed curves |
| Revisiting Chronology Protection Conjecture in The Dyonic Kerr-Sen Black Hole Spacetime (arXiv:2408.06023, revised February 2025) | a model where the conjecture holds | **abstract read 2026-10-30** (HTTP 200): Bunyaratavej, Burikham and Senjaya, first submitted 12 Aug 2024, revised 11 Feb 2025; the authors say back-reaction in this spacetime supports Hawking's conjecture |
| arXiv:2607.27473, "Closed Timelike Curve Decoding on Quantum Hardware" (July 2026) | quantum-computer simulations of Deutsch's model of closed curves simulate the mathematics, not time travel | **abstract read 2026-10-30** (HTTP 200): Morapakula and Ikeda, submitted 29 Jul 2026, revised 12 Aug 2026; a circuit model of Deutsch's closed-curve consistency loop, run in Qiskit simulation and on IBM hardware for single-qubit cases; the date is confirmed |
| NASA Space Place, "Is Time Travel Possible?" (`spaceplace.nasa.gov/time-travel/en/`) | a plain official page: "traveling to the future" by time dilation; the ISS astronauts' 0.007 s after six months (a search summary's number) | **fetched and read on 2026-10-30** (HTTP 200): it says clocks on airplanes and satellites run at a different speed from clocks on Earth, that an airplane clock flown round the world came back slightly behind, that GPS relies on this, and that humans cannot hop into a time machine and go back in time; the ISS figure (0.007 s) was not on the part read and is not used |
| NASA Cosmicopia, "Wormholes, Time Travel, and Faster-Than-Speed-of-Light Theories" (`science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sp_sl.html`) | a plain official page: wormholes are allowed in the mathematics of general relativity, no one knows how they would be made and there is no evidence for one; general relativity "does seem to allow some paths through space-time that may indicate a possibility for time travel", far beyond what can be tested, and there is no known way to travel in time; a wormhole "is not really a means of going back in time, it's a shortcut" | **fetched and read on 2026-10-30 (HTTP 200)** during the final review; modification date October 14, 2005 (read in Experiment 1's specification), now kept in NASA's archive. It does not explain closed timelike curves or a wormhole used as a time machine, so rule 3(c) still applies to those two ideas |
| Real forward-time measurements: Hafele–Keating's aircraft clocks (1971, a search summary), GPS (Gravity 9), the ISS astronauts' 0.007 s | the "settled" side of the page | search summaries only; the figures are **to be sourced** before use |
| A plain official page for **closed timelike curves**, the **wormhole time machine** and **chronology protection** | the "Want to know more?" list (§29 rule 3(b)) | **no plain official page found in two searches on 2026-10-30** (they returned arXiv papers, reviews and blogs); to be recorded under §29 rule 3(c) if none is found after a further search |

## Facts that may change (§29)

| Fact | Why it may change |
|---|---|
| No closed timelike curve has been observed | a new observation (none is expected) |
| Chronology protection remains a conjecture | a proof or a counterexample in a model |
| Recent papers (2025 and 2026) on chronology protection in particular models | newer analyses |
| The quantum-hardware papers on simulated closed curves | later results or a changed reading |
| NASA's Space Place page and its numbers | NASA may update or move it |

## Open items (to settle before wording is approved)

a. **Partly settled 2026-10-30:** the NASA page was read in full and the abstracts of six papers were read (see Sources). Still open: no paper was read in full; Hawking's 1992 paper and the APS pages could not be fetched (403); the 1988 abstract does not mention moving a mouth, so **the closed-path condition (the offset must beat the light-travel time) still rests on a search summary** and must be checked at the paper or a textbook.
b. The tunnel-link sign bookkeeping (entering B exits A earlier) is derived here and must be checked.
c. The offset ignores acceleration and the difference between a symmetric out-and-back and one that ends 1 light-year away; at constant speed throughout, the offset is the same, and the turn-around's effect is stated, not computed (**to be checked**).
d. The time-zone comparison (the tutor's second explanation) and "the earliest moment is when the machine was made" (the tutor's fifth explanation, which says it is this page's own reading) have no source. The staircase comparison was not used.
e. Observational limits on the universe's rotation are named in search summaries as ranging over many orders of magnitude; no number will be given until read at a source.
f. No plain official page for closed timelike curves, the wormhole time machine or chronology protection has been found (§29 rule 3(c)); NASA's Cosmicopia page touches on time travel and wormholes but does not explain them, and the page says so.
g. **Added by the final review (2026-10-30):** the two control buttons are independent, but a trip of 10 years at speed v can leave the mouths no more than 10 × v light-years apart. So 0.1 c with 3 or 5 light-years asks for more than the trip allows, and 0.1 c with 1 light-year and 0.5 c with 5 light-years need a one-way trip. Decision 5 (independent controls) did not notice this. Part 2 now says the settings are independent and gives the limit (option (a) of the review); the other options were to disable those buttons or to leave it as it was.

## Decisions for the owner (each with a default)

1. **Status label.** Settled (travel to the future: clocks show it); Open (travel to the past: the equations allow closed paths in some models; none has been seen; whether nature forbids them is unproved). Default: as stated.
2. **The model:** the wormhole time machine (a clock offset and a short outside distance), as Experiment 1 promised, instead of the proposal's "tilting light cones" (Gödel), which is **named only**. Default: the wormhole model. Alternative: Gödel's cones, with the critical radius at sinh r = 1, but it needs a rotating universe, no one has observed rotation of that size, and its drawing needs a coordinate choice that the sources do not fix.
3. **Idealisations:** point mouths, zero tunnel length, steady speed, no acceleration; stated on every picture. Default: yes.
4. **Two predictions** (B's clock after the trip, five buttons; "do they get back before they left?", yes/no), with Prediction 1 on the settled forward case. Default: yes. Alternative: make Prediction 1 about the offset needed and keep it as the backward question.
5. **Controls:** speed (five buttons) and separation (four buttons), as trial values. Default: yes. (The review found that some pairs are more than a 10-year trip allows; see Open item g.)
6. **Chronology protection:** named after the run only, described as a 1992 conjecture, with the recent model-specific papers listed as data. The tutor says it is not proved. Default: yes.
7. **The grandfather paradox:** named and described as an unresolved puzzle; no resolution (many-worlds, self-consistency) is taught. Default: yes. Alternative: leave it out.
8. **Safeguard:** every picture says it is a toy from the mathematics; no drawing of a traveller meeting themselves, a machine or a "portal". Default: yes (`PROJECT.md` §9).
9. **Tutor:** the standard four-step sequence; it never says that time travel to the past is possible or that it is impossible. Default: yes.
10. **Introduction length and links:** long and detailed, to §29; no plain official page for closed timelike curves, time machines or chronology protection is recorded under rule 3(c) if none is found after a further search. Default: yes.
11. **Title** "Can you travel back in time?" (gives away neither prediction). Default: keep.
12. **Forward-time measurements:** a short table of real measurements (aircraft clocks, GPS, ISS) in Picture 1's results, each sourced before use. Default: include, only with figures read at a source; otherwise state them in words.

## Implementation Notes (2026-10-30)

**Built in nine steps, each its own commit:** the specification (`a25ee8f`); Step 1, the physics model and tests (`dc55f55`); Step 2, the introduction and links (`287d11a`); Step 3, the two predictions and the Run button (`f16c55a`); Step 4, the five-stage run with Pictures 1 to 3 (`093429b`); Step 5, "Now try it yourself" with Drawing A (`87d7c18`); Step 6, the results (`b8c4f49`); Step 8, the papers list (`cd9e664`), then the source corrections (`c60fd25`, `48705a8`); Step 7, the tutor as Part 4 (`b4e3d73`); Step 9, the chapter summary and "What's next" (`85dd812`). The final review's fixes follow in later commits.

**Complete-flow test (Chrome, 2026-10-30; the page's timers were sped up, which changes only how fast the stages play):** all 10 prediction pairs (the guess drawn on Pictures 1 and 2; the guess tags in Table 1 and the predictions block; the real pictures and tables identical across all 10 once the guess marks are removed; no verdict during the run, in the results or before the explanation; the tutor's marks, which match only "6 years" and "Yes"; the summary hidden until the explanation) and all 20 control settings (Drawing A's clock counts, offset, light-travel time, closed or not, time gained, ratio and smallest speed, against a separate calculation). Saved progress (check mark after the run, "explained" after the tutor) was also checked. The test first reported failures that were faults in the test (a rounding tolerance, the guess arrow's "before" or "after" label, saved progress, a regular expression); each was confirmed by inspection and the test was corrected. The test cleared the saved progress in the owner's Chrome profile for localhost:5173.

**Final review (2026-10-30):** twelve deliberate breaks of the module; eleven were caught at once, and the twelfth (the days-per-year constant in `friendlyDuration`) was not, so a test was added and the break is now caught. All links returned HTTP 200. Found and fixed: the Hawking paper in the source table was Visser's commentary; Table 3's "2024 to 2026" (now "2024 and 2025"); the NASA Cosmicopia link described only wormholes although the page covers time travel, and the sentence on missing pages was too strong (both reworded); the independent-controls gap (Open item g, with a note in Part 2 and `largestSeparationLy` in the module).

**Differences from this specification (all approved by the owner on 2026-10-30):**
1. Picture 1 draws two bars (A's clock and B's clock) on a ruler, not "two clock faces".
2. The "short table of real forward-time measurements" in Picture 1's results became the first row of Table 3 and one row of Table 1, with no figures: the aircraft-clock and ISS figures were not read at a source (Decision 12's alternative, stated in words).
3. Drawing A uses a log ruler of durations (a few days and nearly nine years on one line).
4. Prediction 2's text states the tunnel's rule as a premise, and the tutor's last question adds a slower-mouth case (0.1 c with 1 light-year or 1 light-day) taken from "Expected Observations".
5. The tutor's explanation has eight items; the "no gap before the trip" argument (item 5) and the time-zone comparison (item 2) are the page's own and are marked so; the staircase comparison was not used.
6. The papers list comes after the run and links the Caltech record of the 1988 paper, Visser's 1992 commentary, Luminet's 2021 survey, the two recent chronology papers and the 2026 quantum-hardware paper; Hawking's own paper and the publisher's page are listed as not linked (HTTP 403).
7. Part 2 gained a note that the speed and separation buttons are independent and that a 10-year trip leaves the mouths at most 10 × speed light-years apart (review finding).
8. Learning Objective 1 mentions a clock "deep in gravity"; the page speaks only of speed (the gravity case is in Gravity 2 and 9).
