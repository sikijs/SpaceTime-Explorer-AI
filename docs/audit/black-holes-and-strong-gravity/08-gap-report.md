# Gap report: Black Holes and Strong Gravity Experiment 8 (Spinning black holes)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/08-spinning-black-holes.md | Components: src/components/SpinningBlackHoleExperiment.tsx, SpinningBlackHoleTutor.tsx | Physics module: src/physics/spinningBlackHoleExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Four predictions, three pictures (the map, the edges graph, the energy picture), a main table, a spin table and two worked calculations, and a four-step tutor. Older rule: guesses are text only; Results and the tutor's compare step both mark each guess. Biggest gaps: no guess marks, a colour clash (the horizon and the "now" dots are already near-white), no table notes, no three-part look-for items, and the four right/off decisions are made in the component. Size: **L** (four predictions across three pictures, plus a recolour).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Last safe orbit circling with the spin, against no spin (SpinningBlackHoleExperiment.tsx:31-36, :685) | closer / same / farther | Map: the green ring against the dashed ring; Edges graph: green line against the dashed line |
| 2 | Same, circling against the spin (:703) | closer / same / farther | Map: the rose ring; Edges graph: rose line |
| 3 | What happens to the horizon as the spin grows? (:38-43, :722) | bigger / same / smaller | Map: the black disk against the dotted no-spin ring; Edges graph: horizon line |
| 4 | Which probe gives up more energy? (:45-50, :741) | with / against / same | Energy picture: the two bars |
Stored in `submitted*` state; used in Results (:1085-1118) and the tutor props (:1259-1268).

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `SafeOrbitMap` (:165), `EdgesGraph` (:277), `EnergyPicture` (:355) read only `result`/`progress`; `compare` (:468-469) reads spin and preset | none |
| A2 | Not met | No white guess mark or "YOUR GUESS" box in any of the three SVGs | Markers at each answer's place on the map, graph and bars, with a boxed label |
| A3 | Not met | All answers are directions, so markers only, with a caption line saying so | New |
| A4 | Not met | Pictures build with `progress` (:121) but carry no guess marks | Mark after the ring/bar is drawn |
| A5 | Met (not needed) | Each answer has a picture | none |
| A6 | Not met | No source line under the pictures (:855-1030) | Add: calculated here from the given spinning-black-hole formulas (spec Decision 9 says they were not checked at a primary source) |
| A7 | Not met | Introduction (:540-680) has no statement about guesses or white marks | Add (owner to approve) |
| A8 | Not met | Module exports `horizonRadius`, `lastSafeOrbitRadius`, `energyReleasedSteps`, `energyReleasedFraction`, `runSpinningBlackHoleExperiment` (spinningBlackHoleExperiment.ts:47-118). The right/off logic is in the component (`modelWith` etc. :475-478, verdicts :1033-1118) | Guess-mark functions and tests; move model-answer logic into the module |
| A9 | Partly met | Observe prompt names "the green ring and the rose ring" and "the map and the graph" (Tutor:108-109); the compare step recites the guesses with verdicts (:110-111). Results marks them earlier too | Prompts would name the marks; Results would drop the verdict (owner's decision) |
| A10 | Not met | No such sentence anywhere in the introduction, controls or Results | See O1 |

## Rule B
- B0: Results has a 4-row table (:1055-1086), a spin-0 notice (:1078-1082), four "Checking your Nth prediction" paragraphs (:1084-1121), two worked calculations (edges, :1123-1137; energy, :1139-1183), a 5-column spin table (:1185-1210), a ball-on-a-hill comparison (:1212-1219) and a limits box (:1221-1237).
- B1 Not met / probably N/A: no external measured value; the spec says the Kerr horizon and last-safe-orbit formulas, the circular-orbit energy formula and the frame-dragging statement were not checked at a primary source (08-spinning-black-holes.md:251). A spin of 0 reproducing Experiment 3's 3 horizon radii is an internal check the page already makes.
- B2 Not met: no "What this table tells us" under either table.
- B3 N/A: the controls only move marks in the pictures.
- B4 Partly met: guesses appear with a verdict; no tag on a table row.
- B5 Partly met: numbers from the module; verdicts in the component.

## Rule C
- C1 Met: map rings have labels with lines (:171-236), arrows are explained in a note (:238-241), the scale bar is labelled (:243-250); the graphs have named lines and end labels (:287-337, :365-432).
- C2 Met: green (with), rose (against), grey dashed (no spin) against the fixed reference ring; with-spin and against-spin differ.
- C3 Met: captions at :855, :924, :978.
- C4 Mostly met: every ring, arrow, line, dot, bar, the reference radius and the percentage scale are named, with bullet lists and an "In this run" line with real numbers. Gap: the order of what appears during the 10-second run is explained only in the introduction (:581-585).
- C5 Partly met: the "In this run" bullets (:~905-912, :~960-965, :~1013-1018) give real numbers for the chosen settings, which acts as a worked moment; no fixed worked example with numbers in the caption.
- C6 Not met: the bullet lists mix looking and meaning but do not use Look at / What it means / Why it matters; the "What to look for" intro paragraph is one sentence (:643-645).
- C7 Partly met: the graph caption states the outcomes ("The green line bends down... the horizon gets smaller", :~950-955) and the energy caption says "the green curve rises" (:~1003-1006), all after the run. The learner has predicted, so §12 holds, but §14 asks that verdicts between results stay with the tutor.
- C8 Met: spin, reference radius, rest-mass energy, AU, with/against the spin are defined (:604-618).

## Rule D
N/A.

## Other findings
- O1: CLAUDE.md §14 says the older experiments state that predictions do not change the pictures. This one does not (A10). Results and the tutor both give "right/off" verdicts.
- O2: White is already used by the horizon (`HORIZON_COLOR` #e2e8f0, :22, caption calls it "the white line") and by the "now" dots (:323-325, :417-420), which clashes with the new rule that white means the learner's guess. The ball-on-a-hill comparison says energy "turns into speed and heat" (not sourced; spec says where the energy goes is not modeled).

## What an update would touch, and its size
SpinningBlackHoleExperiment.tsx, SpinningBlackHoleTutor.tsx, the module and its tests, the specification. Size: **L**: four prediction marks on three pictures, a recolour of the horizon and dots, new module functions, A6/A7 wording and notes under both tables.

## Not checked
Not run in a browser; tests not run; the tutor's explanation step and `pointAt`/layout code read only in part; "What's next" not read.


---

# Re-read (2026-11-18)
Re-read against the rules set after the first report: the four Parts and "Parts 2, 3 and 4 appear after the first Run" (2026-11-02, 2026-11-07), the links and words box on every page, "Start over, not Change prediction", predictions drawn on the real picture, and the owner's request for rich content on Black Holes pages (2026-11-16), repeated on 2026-11-18 with "add more details, elaborate and make it better", NASA/Hubble images and the latest resource links, "you decide". Read: the specification in full, the module in full, the introduction (`SpinningBlackHoleExperiment.tsx:540-680`), the prediction block (:683-760), the controls and the three captions (:760-1030), the Results (:1033-1237) and the tutor (`SpinningBlackHoleTutor.tsx:60-221`). Nothing changed. `git status` was clean.

## What is still true from the first report
Everything above stands: no guess marks, no source lines, no table notes, no three-part look-fors, no check-up, the right/off logic is in the component, white is used by the horizon and the "now" dots, and the Observe prompt does not name marks.

## New findings
| # | Finding | Evidence | What it needs |
|---|---|---|---|
| N1 | **No four Parts.** One long page; the controls stay disabled until all four predictions are entered; Parts 2 to 4 do not exist. | :683-760, :763-800 | Part 1 (predict, one Run, three pictures), Part 2 (black hole and spin choices, with their own pictures), Part 3 (results), Part 4 (tutor); Parts 2 to 4 appear after the first Run. |
| N2 | **"Change predictions" button** reopens the guess without resetting. | :746-760 | Always-visible "Start over" with the lock sentence. |
| N3 | **No links and no "Words and formulas" box**, though the intro defines the words in one long paragraph (:604-625). | :540-680 | Both, above Part 1. |
| N4 | **Cross-references say "Experiment 3", "Experiments 1 to 7", "Experiment 1".** | intro, captions, tutor | "Black Holes 3", "Black Holes 1 to 7", and so on. |
| N5 | **The intro is a good base but has no pictures at all**, none from a real observation, and no real black hole is named. The owner likes it and asks for more detail. | :540-680 | Keep every part the owner liked; add pictures (NASA, ESA/Hubble, EHT, plus drawings made for the page) and real examples (below), without giving any of the four answers (§12). |
| N6 | **White clash, confirmed:** horizon colour `#e2e8f0` (:22) called "the white line/disk edge", and the "now" dots. | :22, :323-325, :417-420 | Horizon to violet, "now" dots to cyan; white then means only a guess. |
| N7 | **Two unsourced or loose statements.** The intro and Results say rest-mass energy "turns into speed and heat" (:621-624, :1212-1219), which the specification says is not modeled. The intro says "most are thought to spin" with no source. | | Reword to "gives up"; the spin statement is covered by the sources below (Reynolds 2021; LVK GW231123 spins) or softened. |
| N8 | **Captions give outcomes** ("the green line bends down... the horizon gets smaller", "the green curve rises") and the tutor's compare step gives right/off before the explanation. | :~940-960, :~1003, Tutor:110-111 | Captions keep what each thing is; outcomes and verdicts move to the tutor (as Black Holes 5 to 7). |
| N9 | **The Results mark guesses first** ("So your prediction was right/off"). | :1084-1121 | Results only tag rows; the tutor marks. |
| N10 | **Dead hosts.** The project already removed `heasarc.gsfc.nasa.gov` links on 2025-10-25 (CLAUDE.md status); NASA's "Frame Dragging Around a Rotating Black Hole" page lives there, so it is not offered here. | | Not linked. |
| N11 | **Source gap for the formulas.** The specification (Decision 9) says the formulas were never checked at a primary source. Today's search could not read Bardeen, Press and Teukolsky 1972 (ADS returned 405) or any page quoting the ISCO values. The values were recomputed independently (Python in the research agent, and Node by me) and match the module. | draft wording, sources | Keep "given, not derived"; cite BPT 1972 as the origin only as a citation, not as a page I read; record §29 rule 3(c) gaps. |

## Plan for Part 1 (as at Black Holes 5 to 7)
One Run, one fixed black hole: the 10-Sun black hole spun up from 0 to 0.9 (the specification's reference case), over 10 seconds. Three pictures with white YOUR GUESS markers (markers only, since every answer is a direction): guesses 1 and 2 on the map and the edges graph (a marker inside, on or outside the dashed no-spin ring), guess 3 on the map (the dotted no-spin ring against the black disk) and the graph's horizon line, guess 4 over the bars of the energy picture. Part 2 offers the three black holes and spins 0, 0.5, 0.9, 0.99 with their own set of pictures. Part 3 has a check-up and notes under each table. Part 4 is the tutor, which marks each guess.

## Questions for the owner (default first)
Listed at the end of `08-draft-wording.md`.

## Not checked in this re-read
Not run in a browser; tests not run. `SafeOrbitMap`, `EdgesGraph` and `EnergyPicture` SVG bodies and the Results' two worked calculations (:1139-1183) were read only in part; the Tutor's `edgeClauses` constants were not read.
