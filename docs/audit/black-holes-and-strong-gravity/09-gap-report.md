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
