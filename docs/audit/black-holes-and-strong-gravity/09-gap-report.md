# Gap report: Black Holes and Strong Gravity Experiment 9 (How a black hole forms)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/09-how-a-black-hole-forms.md | Components: src/components/BlackHoleFormationExperiment.tsx, BlackHoleFormationTutor.tsx | Physics module: src/physics/blackHoleFormationExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, three pictures (the ladder, the size ruler, a white dwarf graph), two tables, two worked calculations, and a four-step tutor. Older rule: guesses are text only; Results and the tutor's compare step mark them. Biggest gaps: no guess marks (Prediction 2 is a numeric mass, 1 / 3 / 30 Suns, but 30 is off the 0.3 to 10 scale), no table notes, no three-part look-for items, and the right/off logic and the guess masses live in the component. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | What happens to a white dwarf's size as mass is added? (BlackHoleFormationExperiment.tsx:32-37, :645) | bigger / same / smaller | White dwarf graph: slope of the blue curve |
| 2 | At about what core mass does a core first become a black hole? (:39-45, :664) | about 1 / 3 / 30 Suns | Ladder: a position on the mass bar (`THRESHOLD_MASS`, :46); 30 is beyond the bar's right end (MAX_CORE_MASS 10, physics:20) |
| 3 | Is a neutron star's top mass higher, same or lower than a white dwarf's? (:48-53, :683) | higher / same / lower | Ladder: the edge between the violet and hatched zones against the 1.44 edge |
Stored in `submitted*` state; used in Results (:1002-1040) and the tutor props.

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `Ladder` (:136), `SizeRuler` (:253), `WhiteDwarfGraph` (:330) take only `result`; model answers are derived from the module (:446-456) | none |
| A2 | Not met | No white guess mark or "YOUR GUESS" box in the three SVGs | Marks on the graph (P1), ladder bar (P2, P3) |
| A3 | Not met | P2 has a position; P1 and P3 are categories | Marker for P1 and P3; a position for P2 (with the 30-Suns answer shown as "off the scale" with an arrow) |
| A4 | Not met | none | Mark only once the zone/curve beside it is drawn |
| A5 | Met (not needed) | Every answer has a picture | none |
| A6 | Not met | No source line under the pictures (:777-950). Real data appears only as given round numbers (1.44, 2, 3, 12 km, spec: not all checked at a primary source, 09-how-a-black-hole-forms.md:229) | Add: calculated here, with the formula for white dwarf size a fit by Claude; nothing measured |
| A7 | Not met | Introduction (:512-620) has nothing about guesses or white marks | Add (owner to approve) |
| A8 | Not met | Module exports `whiteDwarfRadiusSteps`, `whiteDwarfRadiusKm`, `coreOutcome`, `LADDER`, `runBlackHoleFormationExperiment`, constants (blackHoleFormationExperiment.ts:15-113). The guess masses `THRESHOLD_MASS` and the right/off logic are in the component (:46, :446-456, :971) | Move to the module; add guess-mark functions and tests |
| A9 | Partly met | Observe prompt names "the ladder and the size picture" (Tutor:102-103); compare recites guesses with verdicts (:104-105); Results marks them earlier | Prompts would name marks; verdict only in the tutor (owner's decision) |
| A10 | Not met | No sentence says predictions do not change the results | See O1 |

## Rule B
- B0: Results has a 4-row table (:~985-1000), three "Checking your Nth prediction" paragraphs (:1002-1040), a horizon/closeness calculation (:1042-1065), a white dwarf radius calculation (:1067-1091), a preset-mass table (:~1093-1110), a lift comparison (:~1112-1118) and a limits box.
- B1 Partly possible: real references exist in the spec's source list: the Chandrasekhar limit 1.44 Suns, neutron stars measured at about 2 Suns, neutron star radius about 12 to 13 km (spec :229 says these were not checked at a primary source). A check-up row "page value vs published" could use those, with the owner's approval. The white dwarf radius formula is the page's own fit and has no reference.
- B2 Not met: no "What this table tells us" notes.
- B3 N/A: the control (core mass) only moves marks.
- B4 Partly met: guesses shown with verdicts in Results; no tags on table rows.
- B5 Partly met: values from the module; verdicts in the component.

## Rule C
- C1 Met: ladder zones, marker, edge labels and key (:136-250); ruler ring, ball, labels and readout (:253-328); graph curve, limit line, neutron star line, dot (:330-417).
- C2 Met: blue / violet / amber / black zones; ring against ball shows the contrast.
- C3 Met: captions at :778, :844, :912.
- C4 Mostly met: each element, the log ruler, the ratio and the hatched "not known" zone are explained with bullets. The order of the 10-second squeeze is covered in the introduction (:~591-595), not in the caption.
- C5 Partly met: a worked example ("a ratio of 2.5...", :~875-880) and "In this run" lines with real numbers; no single worked moment.
- C6 Not met: "Try this" bullets (:~812, :~895, :~940) say what to run, not Look at / What it means / Why it matters.
- C7 Partly met: the ladder caption gives the limits and the "not known" zone after the run; it names the Chandrasekhar limit and 2 to 3 Suns, which are the answers to Predictions 2 and 3, only after the run. The introduction (:~545-575) says a neutron star is "held up by another, much more tightly squeezed" push and "the more mass a core has, the harder gravity pulls it in", which may lean toward Predictions 3 and 1 (owner to judge).
- C8 Met: core, white dwarf, neutron star, electron, neutron, degeneracy pressure, horizon radius are defined before use (:~590-618).

## Rule D
N/A.

## Other findings
- O1: CLAUDE.md §14 says older experiments state that predictions do not change the pictures; this one does not (A10).
- O2: White is already used for the chosen-mass marker and its text (Ladder, `fill="#ffffff"`, around :170-180), the horizon ring and the black zone (`BLACK_HOLE_COLOR`/`HORIZON_COLOR` #e2e8f0, :58-59), and the graph dot; a white guess mark would clash. The tutor's conceptual question (Tutor:106) restates the answer ("A heavier white dwarf is smaller, not bigger. Why...") and follows Results that already say it. A cosmetic typo: the setter is named `setThresthresholdPrediction` (:426).

## What an update would touch, and its size
BlackHoleFormationExperiment.tsx, BlackHoleFormationTutor.tsx, the module and its tests, the specification. Size: **M** (marks on the ladder and graph, new module functions, wording, notes under two tables, a recolour decision for the white elements).

## Not checked
Not run in a browser; tests not run; the SVG bodies of the ruler and graph and the tutor's explanation step were read only in part; line numbers marked "~" are approximate; "What's next" not read.


---

# Re-read (2026-11-18)
Re-read against the rules set after the first report: the four Parts and "Parts 2, 3 and 4 appear after the first Run" (2026-11-02, 2026-11-07), the links and words box on every page, "Start over, not Change prediction", predictions drawn on the real picture, and the owner's request for rich content on Black Holes pages (2026-11-16), repeated on 2026-11-18 with "the existing content in the intro is good. Keep it and augment, improve with more details if required. Add images from NASA etc wherever required". Read: the specification in full, the module in full, the introduction (`BlackHoleFormationExperiment.tsx:512-620`), the prediction block, the Results (:985-1173) and the tutor's first steps (`BlackHoleFormationTutor.tsx:95-110`). Nothing changed. `git status` was clean.

## What is still true from the first report
Everything above stands: no guess marks, no source lines, no table notes, no three-part look-fors, no check-up, the right/off logic and the guess masses live in the component, white is used for the chosen-mass marker and the horizon, and "Change predictions" is a button.

## New findings
| # | Finding | Evidence | What it needs |
|---|---|---|---|
| N1 | **No four Parts.** One long page; the controls stay disabled until all three predictions are entered. | :640-760 | Part 1 (predict, one Run, three pictures), Part 2 (core mass, with its own pictures), Part 3 (results), Part 4 (tutor); Parts 2 to 4 appear after the first Run. |
| N2 | **"Change predictions" button** reopens the guesses without resetting. | :~746 | Always-visible "Start over" with the lock sentence. |
| N3 | **No links and no "Words and formulas" box**; the words are one long paragraph. | :~590-618 | Both, above Part 1. |
| N4 | **Cross-references say "Experiment 1", "Experiment 5".** | intro, Results, tutor (Tutor:80, :169, :185) | "Black Holes 1" and so on; Relativity "Experiment 5" becomes the learner's chapter name. |
| N5 | **The introduction is a good base and has no pictures, no real stars and no real numbers.** The owner likes it and asks for more detail and NASA-type images. | :512-620 | Keep every part; add pictures and real examples without giving any answer (§12). |
| N6 | **White clash, confirmed:** the chosen-mass marker and its text, the horizon ring and the black-hole zone (`#e2e8f0`, :58-59), and the graph dot. Also the neutron-star zone is violet, so a violet horizon (as at Black Holes 8) would clash here. | :58-59 | Chosen mass and the graph dot to cyan; the horizon ring and the black-hole zone to rose. |
| N7 | **Prediction 2 is the one guess with a number of its own** (1, 3 or 30 Suns), but 30 is off the ladder's 0.3 to 10 scale. | :39-46 | A positional mark at 1 and at 3, and an arrow off the right end, labelled, for 30. |
| N8 | **The introduction leans toward answers in two sentences.** "The more mass a core has, the harder gravity pulls it in" and "held up by another, much more tightly squeezed" (the gap report's C7). They give nothing the guesses need, but the owner may wish to check. | :~545-575 | Left as approved; flagged. |
| N9 | **A fact has moved since the specification.** The specification says the heaviest well-measured neutron star is about 2.08 Suns and sets the "sure neutron star" edge at 2. Sources read today give **2.35 ± 0.17 Suns** (PSR J0952-0607, Romani et al. 2022) and **2.073 ± 0.069** (PSR J0740+6620, NICER 2024), and LVK GW230529 found a compact object of 2.5 to 4.5 Suns that gravitational waves alone cannot call a neutron star or a black hole. The 2-to-3 "not known" zone is therefore consistent with the sources, but "sure up to 2" is conservative. | draft wording, sources | The model's round edges are the owner's physics decision (CLAUDE.md §8): kept, with a plain note after the run (Question 6). |
| N10 | **Two statements in the specification now have a source.** NASA's neutron-star page says a collapsing core of "between about 1 and 3 solar masses" can be stopped by neutrons, and heavier cores go on to form black holes: the model's 3-Suns edge. NASA says the Chandrasekhar limit is "1.4 times the mass of the Sun" (the model uses 1.44). | sources | Used in the check-up and the real-world block. |
| N11 | **The white dwarf size formula is still the page's own fit** (Decision 4), but a real white dwarf can now be compared with it: Sirius B, 1.018 ± 0.011 Suns (Bond et al. 2017), is about 12,000 km across (ESA/Hubble). The page's formula gives a radius of 5,512 km at 1.018 Suns, which is about 8% less than the 6,000 km radius that 12,000 km gives. | sources | One row of the check-up, with the numbers. |

## Plan for Part 1 (as at Black Holes 5 to 8)
One Run, one fixed core. Three pictures with white YOUR GUESS marks: guess 1 on the white dwarf graph (a short arrow, up, flat or down, markers only); guess 2 on the ladder at its own mass (1 or 3 Suns, an arrow off the end for 30); guess 3 on the ladder against the 1.44 edge (an arrow to the right, a short bar, or an arrow to the left, markers only). Part 2 offers the seven preset masses with their own pictures. Part 3 has a check-up and notes under each table. Part 4 is the tutor, which marks each guess.

## Questions for the owner (default first)
Listed at the end of `09-draft-wording.md`.

## Not checked in this re-read
Not run in a browser; tests not run. The `Ladder`, `SizeRuler` and `WhiteDwarfGraph` SVG bodies (:136-417) and the tutor's explanation step were read only in part.
