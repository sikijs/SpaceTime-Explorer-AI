# Gap report: Gravity and Curved Spacetime Experiment 5 (What curves spacetime? Mass and distance)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/05-what-curves-spacetime.md | Components: src/components/SpacetimeCurvatureSourceExperiment.tsx, SpacetimeCurvatureSourceTutor.tsx (re-uses `RocketCabinClocks` from Experiment 2 and `Cabin` from Experiment 3) | Physics module: src/physics/spacetimeCurvatureSourceExperiment.ts (+ .test.ts, 9 cases) | Status: read-only, nothing changed

## Summary
Four predictions (each stronger / weaker / same), two controls (mass, distance, relative presets), two re-used panels (Experiment 2 clocks and Experiment 3 cabins) and a Results block listing derived strengths, tick counts and separations. Biggest gaps: no guess marks; the predicted quantities (the strengths) have no picture of their own; no caption beneath the re-used panels; the introduction states the answer to all four predictions before they are asked; and the "always stronger" claim is false where the model clamps (see O2). Size: **L** (the guesses are about how a strength changes with mass and distance, which has no picture today, so a new panel would be needed, per A5).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Closer mass: does the time-dilation effect get stronger, weaker or stay the same? (`SpacetimeCurvatureSourceExperiment.tsx:104-109`) | "Get stronger" / "Get weaker" / "Stay the same" (`:26-30`); `predictions` record, copied to `submittedPredictions` on Continue (`:145-154, :171-174`) | No picture of strength versus distance. Nearest: Experiment 2's clock panel (`:443-450`), which shows one setting only. |
| 2 | Closer mass: does the tidal effect get stronger, weaker or stay the same? (`:110-115`) | same | Experiment 3's cabins panel (`:452-462`), one setting only. |
| 3 | Bigger mass, time dilation (`:116-120`) | same | as 1 |
| 4 | Bigger mass, tidal effect (`:121-126`) | same | as 2 |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | Four predictions, asked together before the controls appear (`:339-340`). |
| A1 | Met | the controls are hidden until predictions are submitted; the result uses `selectedMass`/`selectedDistance` only (`:185-210`) | |
| A2 | Not met | no white mark anywhere | |
| A3 | Not met | | Guesses are a direction of change, so markers only. |
| A4 | Not met | | |
| A5 | Not met (needed) | the strengths are shown as numbers only (`:431-440`) | A new panel on the nearest picture (the two re-used panels), on its own scale: "strength against mass" and "strength against distance", with the real curve from the module and a white marker per guess. This is the Large part. |
| A6 | Not met | no picture notes at all | "Where the real picture comes from": calculated here from relative presets (not real kilograms or metres, `:296`) by the module's scalings; constants K_DILATION 0.3 and K_TIDAL 1.2 are chosen, not measured (`spacetimeCurvatureSourceExperiment.ts:10-11`). |
| A7 | Not met | intro `:268-308` and control area `:310-440` silent | Add both. |
| A8 | Not met | Module exports `SpacetimeCurvatureStrengths` and `strengthsForMassAndDistance` only (`:23, :32`). `actualOutcome()` hard-coded `'stronger'` in the component (`:40-42`); final separations computed in the component (`:218-225`) | Outcome function, curve sampler and guess-marker data with tests missing. |
| A9 | Partly met | Tutor compare step lists all four guesses with "it actually did stronger" (`SpacetimeCurvatureSourceTutor.tsx:66-76`) before the explanation | |
| A10 | Not met (no statement) | Results `:499-507` repeat guess and outcome | |

## Rule B
- B0. One Results block (`:474-517`): mass and distance labels, derived strengths, final tick counts, final separations, four prediction lines, one sentence. No tables.
- B1. Not met. Real reference: none from observation (the presets are relative); the module's own relations (strength grows as mass ÷ distance for clocks, mass ÷ distance³ for tides) could give "expected vs found" rows, but they are the module's own model, so no independent check-up exists.
- B2. Not met.
- B3. Partly relevant: the whole Results panel already follows the controls; a comparison "mass doubled / distance halved" would show the clamps, but the specification's real references are not given (not checked).
- B4. Partly met: text only (`:500-506`), the guess shown beside "it actually did stronger".
- B5. Partly met: strengths from the module; tick counts and separations come from Experiments 2 and 3's modules via the component; final separation arithmetic in the component (`:218-225`).

## Rule C
- C1. Partly met: panel titles "Experiment 2's rocket cabin ..." and "Experiment 3's cabins ..." (`:446, :455`); the re-used `RocketCabinClocks` has "Ceiling clock"/"Floor clock" (Experiment 2 `:47, :53`) and `Cabin` "Planet"/"Rocket"; no drawing of the mass or its distance exists at all.
- C2. Partly met: strengths follow mass/distance, but the panels are numeric; no drawing of the mass moving closer.
- C3. Not met: no "How to read this diagram" caption beneath the panels.
- C4. Not met.
- C5. Not met (numbers only appear in the tutor, `Tutor.tsx` explanation 1).
- C6. Not met.
- C7. Not met: intro `:297-301` says "Moving closer or using a bigger mass always makes both effects stronger, but the tidal effect ... grows faster", which answers all four predictions before they are asked (§12).
- C8. Partly met: "strength" and "convergence strength" are not re-defined here, only pointed to Experiments 2 and 3 (`:270-273`); "spacetime" and "first-order approximation" are not defined in plain words; "Small/Medium/Large" are relative presets (explained `:296`).

## Other findings
- O1. None against the specification found (not compared line by line).
- O2. (a) The intro and tutor say "always" stronger (`:298`, `Tutor.tsx` explanation 1) but the module clamps strengths to 0.05 to 0.9 and 0.02 to 0.9 (`spacetimeCurvatureSourceExperiment.ts:17-20, 40-50`). Example from the module's constants: Large mass (4) at Close (1) gives 1.2 and 4.8, both clamped (0.9 and 0.9), so "closer" changes nothing there; Small mass (1) at Far (4) gives tidal 1.2/64 = 0.019, clamped to 0.02. The learner can meet a "stay the same" result that the page says cannot happen. Report only. (b) The scalings (mass ÷ distance, mass ÷ distance³) and K constants have no source in the text read; the intro calls them "first-order" (`:302`). (c) The intro's trampoline picture (`:276-281`) says closer makes the dip "deeper", which is the answer to prediction 1 (hint). (d) The explanation point 3 ("same underlying curvature") is a conclusion in the tutor; fine for the tutor. (e) The cross-references "Experiment 2/3/4" lack the chapter name.

## What an update would touch, and its size (O3, O4)
SpacetimeCurvatureSourceExperiment.tsx (new strength panel with guess marks, caption, intro hint removal if the owner agrees, notes), SpacetimeCurvatureSourceTutor.tsx, physics module + test (curve sampler, outcome, markers), specification; Experiments 2 and 3 components are re-used, so changes there ripple. **Size: L.**

## Not checked
No browser view; tutor read in part (compare and explanation steps); specification not compared line by line; Rule D N/A.

---

# Re-read, 2026-11-12: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `SpacetimeCurvatureSourceExperiment.tsx` (535 lines), `SpacetimeCurvatureSourceTutor.tsx` (156), `spacetimeCurvatureSourceExperiment.ts` (52, 9 tests) and the specification `05-what-curves-spacetime.md`, and of the Gravity 2, 3 and 4 audits it follows (`02-` to `04-draft-wording.md`, as built and approved on 2026-11-12). Nothing changed. Rules A to C above stand as written; this section adds what they did not cover, carries over what Gravity 1 to 4 settled, and corrects one point of the first report (O2a is worse than reported).

## The most important finding: the answer key is wrong where the page caps its numbers
The page says, and the tutor says, that a closer or bigger mass **always** makes both effects stronger (`Experiment.tsx:40-42`, `:297-301`; `Tutor.tsx` point 1). The module caps the two strengths at 0.9 (time dilation 0.05 to 0.9, tidal 0.02 to 0.9). With the page's own presets (mass 1, 2, 4; distance 1, 2, 4; Close = 1, Medium = 2, Far = 4), this is what the module returns:

| Mass | Distance | Time-dilation strength (0.3 × mass ÷ distance) | Tidal strength (1.2 × mass ÷ distance³) |
|---|---|---|---|
| Small (1) | Close (1) | 0.300 | 1.2 → **0.900 (capped)** |
| Medium (2) | Close (1) | 0.600 | 2.4 → **0.900 (capped)** |
| Large (4) | Close (1) | 1.2 → **0.900 (capped)** | 4.8 → **0.900 (capped)** |
| Small (1) | Medium (2) | 0.150 | 0.150 |
| Medium (2) | Medium (2) | 0.300 | 0.300 |
| Large (4) | Medium (2) | 0.600 | 0.600 |
| Small (1) | Far (4) | 0.075 | 0.01875 → **0.020 (capped)** |
| Medium (2) | Far (4) | 0.150 | 0.0375 |
| Large (4) | Far (4) | 0.300 | 0.075 |

So **at Close distance the tidal strength is 0.900 for every mass**: a learner who keeps the distance at Close and changes the mass from Small to Large sees the tidal effect **stay the same**, while the page told them it always gets stronger (prediction 4's key). Likewise Medium to Close at Medium mass gives 0.300 → 0.900 for the tidal effect, but the uncapped formula would give 2.4, so the "tidal effect grows much faster" lesson is understated exactly where it should be largest. Also, at Far distance and Small mass the tidal strength is 0.020, where the formula gives 0.01875. The first report listed this as O2a; this table shows it affects the **presets**, not only "Other" values. It needs an owner decision (question 2 below).

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds everything: introduction, four predictions, "Continue", the mass and distance buttons, the derived-strength box, the two re-used panels, Run, Results, tutor (`:262-534`) | Part 1 (the four predictions, Run and the new strength graphs), Part 2 (mass and distance and the two re-used panels), Part 3 (results), Part 4 (tutor). |
| E2, E4 | Not met | No Part headings, lines or leads | Four leads in the shared colours, drafted for approval. Part 1's lead gives no answer (§12). |
| E3 | Not met | No links list, no words box | See "Links and Words". |

## Parts 2 to 4 appear after the first Run
**Not met as built.** The controls appear after "Continue" (`:335-339, :349`), before any run; the Results and tutor appear after the first Run (`:474-517`). Under the Parts layout the controls and the re-used panels move into Part 2 and appear after Part 1's Run, with a note saying what to do next. **The rule needs a Part 1 Run that means something:** today the only run uses the controls, so the question is what Part 1 shows (question 1).

## Predictions and where their answers live (A5, sharpened)
The four guesses are about **how a strength changes** as the mass moves closer or gets bigger. No picture shows a strength against mass or distance. The two re-used panels show one setting at a time, so a guess cannot be drawn on them. The planned remedy under A5 is a new panel with its own scale and title: **two small graphs**, "Strength against distance (mass Medium)" and "Strength against mass (distance Medium)", each with two lines (time-dilation strength: solid indigo; tidal strength: dashed amber) computed by a new module function over the preset range (distance 1 to 4, mass 1 to 4), and the vertical axis 0 to 1 (a cap line at 0.9). The four guesses then sit on the four lines: "closer, time dilation" and "closer, tidal" at the Close end of the distance graph; "bigger, time dilation" and "bigger, tidal" at the Large end of the mass graph. Each guess is a direction (stronger, weaker, same) with no size, so each mark is a white ring at that end of its line with an arrow (up, none, down) and a YOUR GUESS box, only a marker, and the caption says so, as in Gravity 3 and 4. The lines draw themselves as a point moves along them (Far to Close, Small to Large), so nothing is drawn before the run.

## Links and Words
- **"Want to know more?": Not met. Not searched or read yet.** The page uses no measured result, so there is no paper for the page itself. Background ideas: that gravity depends on mass and distance, time dilation (from Gravity 2) and tides (from Gravity 3). Candidates already read in this audit: NASA Space Place, "What Is Gravity?" (read 2026-11-12: more mass gives more gravity, and gravity weakens with distance, so it **answers predictions 1 to 4 and is held back until after the tutor**); NIST, "Putting Einstein to the Test" (Gravity 2's held-back link); NOAA, "What Causes Tides?" (Gravity 3's held-back link, which explains that the pull differs from place to place). I have not searched for a neutral page to link from the start, and nothing is linked until it is read (§29 rule 3(c)).
- **"Words and formulas" box: Not met.** Terms on the page: mass, distance (both relative, not kilograms or metres), Close/Medium/Far and Small/Medium/Large, time-dilation strength, tidal strength (called "convergence strength" now, which gives the answer to Experiment 3's question), capped, first-order, spacetime, ticks, separation, the two panels. Formulas, with the page's own numbers: time-dilation strength = 0.3 × mass ÷ distance (Medium and Medium: 0.3 × 2 ÷ 2 = 0.300); tidal strength = 1.2 × mass ÷ distance³ (1.2 × 2 ÷ 8 = 0.300). **Held back from the box until the Part 1 caption**: both formulas show the answer to the predictions (more mass gives more, more distance gives less) and the "different rates".

## Start over, not Change prediction
**Not met.** Predictions lock on "Continue" (`:170-173`); the only reset is "Run Again" (`:446-448`), which clears only the run, not the predictions, so the guesses stay locked for good. Needed: an always-visible "Start over", greyed until a guess or run exists and while running, which clears the guesses, the runs, the results and the tutor; a line saying the guesses are locked after the Run; "Continue" and "Run Again" replaced.

## Items the re-read changes or sharpens
- **The page's own wording answers the predictions (C7, sharpened).** The assumptions bullet ("Moving closer or using a bigger mass always makes both effects stronger, but the tidal effect ... grows faster", `:297-301`) answers all four guesses and the tutor's observe question; the trampoline picture ("swap it for a much heavier weight, or push the same ball closer ... the dip gets noticeably deeper", `:276-281`) answers them again. Suggested: drop the bullet and keep a trampoline picture that does not say which way the dip goes (for example, only that a bowling ball dents a trampoline and a feather does not), or drop it. The tutor carries the finding.
- **"Convergence strength" (introduction `:272`, labels `:437, :449`).** Gravity 3's page now says "strength", because "convergence" gives its answer away; this page still says "convergence strength", which would clash. Suggested: "Experiment 2's strength" and "Experiment 3's strength", or "time-dilation strength" and "tidal strength" (the tutor names "tidal effect" only after the Gravity 3 run, so it is already known by this chapter).
- **What the controls change (§14 rule 2).** Both controls change the derived strengths, which change the clocks and the cabins, so the panels do follow them (a visible change, for example the end separation 0.900 against 0.020). What is missing is a picture of the **strength** itself, which is the quantity the page is about. Suggested for Part 2: a pink dot on each graph at the chosen mass and distance, and the two re-used panels beside them.
- **Labels (C1).** The re-used `RocketCabinClocks` has "Ceiling clock" and "Floor clock", and `Cabin` shows "Planet" and "Rocket" with a "Separation" readout, but nothing says what the balls are (teal and red) or what the arrows mean. Suggested: re-use `LabelledCabin` (Gravity 3's labelled cabin, already exported) with its floor, left/right ball key and arrows. The two panel titles ("Experiment 2's rocket cabin, at this mass and distance") would also say the cabin is a stand-in: nothing about a mass is drawn in them. A small **sketch of the mass at its distance** (a circle, sized by mass, with a distance line to the cabins) would make "mass" and "distance" visible, but the specification gives no scene for it, so it is a question for you (question 4).
- **Captions (C3, C4, C5, C6).** Two captions are needed: the graphs (Part 1) and the pink dots with the two re-used panels (Part 2), each in the three-part "what to look for" form with worked numbers (Medium to Far at Medium mass: time-dilation 0.300 → 0.150, tidal 0.300 → 0.0375, with the Close cap explained).
- **Results (§12, B4).** Results prints "you predicted ... it actually did stronger" four times (`:499-507`) and a closing sentence that gives the conclusion (`:509-512`); the tutor's compare step prints all four (`Tutor.tsx` compare). Suggested, as in Gravity 3 and 4: Results keeps the mass and distance, both strengths, the tick counts and the separations, each strength line tagged "your guess" for the guesses that live on it, and loses the pairs and the closing sentence; the tutor's observe step points to the four white marks, compare asks without stating, and the explanation marks all four guesses.
- **Tutor (explanation and claims).** Point 1 ("always makes both numbers grow") is false at Close (table above); point 2 ("the tidal effect ... is more sensitive to distance") is true of the page's 1 ÷ distance³ against 1 ÷ distance scalings and could be shown with unclamped numbers (Medium to Far at Medium mass: time-dilation ÷2, tidal ÷8); point 3 ("both are consequences of one thing: how curved spacetime is") is the tutor's conclusion, fine for the tutor; point 4 refers to "Experiment 4" and lacks the chapter name ("Experiment 4, curved spacetime"). **Claims with no source:** the 1 ÷ distance and 1 ÷ distance³ scalings and the constants 0.3 and 1.2 (chosen so that Medium and Medium give 0.3, matching Experiments 2 and 3; not measured, no source read; the module's comment calls them "first-order" scalings) and point 3. Reported; kept as approved unless you choose.
- **Honesty line (§8).** All the pictures come from the module's two formulas and the two existing experiments' functions: nothing is measured. "Calculated here" is the mapping from mass and distance to the strengths, the clocks and the cabins; "imagined for the question" is the nearby body and the two cabins. The constants are chosen, not measured, and the strengths are capped at 0.9. No real value is quoted.
- **The re-used panels.** `RocketCabinClocks` (Gravity 2) and `Cabin` (Gravity 3) are used unchanged, and the specification says to leave Experiments 2 and 3 untouched. Gravity 2 and 3's audits kept both components' behaviour, so this page still works; I checked the build and the full suite on 2026-11-12 (2,835 tests pass), but not Gravity 5 by eye since those audits.
- **Cross-references.** "Experiment 2", "Experiment 3" and "Experiment 4" lack the chapter name throughout (suggest "Experiment 2, does gravity change time?" and so on).
- **Page width:** already 900 px. **Tutor colours:** fixed light colours as in earlier tutors; dark mode not checked. Reported, not changed.

## B1 to B3, recommendation
Every number on the page comes from the module's two formulas. There is no independent reference, and a "your value against the same formula" table would compare the model with itself. Recommend **no check-up table and no setting-following table**; the new graphs, with a pink dot, give the comparison.

## Updated size
**Large.** One new picture family (two graphs with four marks, a dot for the learner's setting, two captions), a rebuilt page around two re-used components, a changed prediction flow, the module (a curve sampler, the outcome, markers, tutor marking, worked numbers) and its tests, the tutor, the specification. Possibly a change to the module's constants or presets if you choose to fix the cap (question 2), which would change approved numbers.

## Questions for the owner before drafting
1. **What does Part 1 show?** Suggested default: Part 1's Run draws the two strength graphs (strength against distance at Medium mass, strength against mass at Medium distance) with the four white marks; the mass and distance controls and the two re-used panels move to Part 2 and follow the controls. (The alternative is a Part 1 Run that plays the two re-used panels at fixed settings, which cannot show a guess about "moving closer".)
2. **The cap at 0.9 (the table above).** The page says "always stronger", but at Close distance the tidal strength is capped at 0.900 for every mass, so changing the mass there shows "the same". Options: **(a)** keep the constants and presets, draw the 0.9 cap on the graphs, say in the page and tutor that "within the range this page can draw, the strength grows with mass and shrinks with distance, until it reaches the cap of 0.9" and show the cap as part of the lesson (suggested: it keeps the approved numbers and is honest); **(b)** change the presets or the constants so that no preset reaches the cap (for example a larger Close distance or a smaller K), which changes numbers the owner approved on 2026-09-27 and needs a new specification decision; **(c)** leave it as built (not recommended, because the page would tell the learner something their own run contradicts).
3. **The marks:** four white rings with direction arrows and YOUR GUESS boxes (stronger: up; same: a flat bar; weaker: down) at the Close end of the distance graph and the Large end of the mass graph, each only a marker, and the vertical axis 0 to 1 with the cap line at 0.9? Suggested default: yes.
4. **A sketch of the mass at its distance** (a circle sized by the mass, a line to the cabins), so that "mass" and "distance" can be seen? The specification gives no scene for it. Suggested default: no, keep to the two graphs and the re-used panels; say "relative presets" in words.
5. **Names:** "time-dilation strength" and "tidal strength" on the page, in place of "strength (Experiment 2)" and "convergence strength (Experiment 3)"? Suggested default: yes.
6. **Introduction:** reword the question, drop the "always stronger" bullet and the "dip gets deeper" trampoline sentence, add the Parts paragraph, the guess paragraph and the "Some new words" line? Suggested default: yes.
7. **Tutor and Results:** observe points to the four white marks, compare asks without stating, the explanation marks all four guesses and says "grows with mass and shrinks with distance, until it reaches the cap"; Results keeps the numbers with guess tags and loses the "You predicted / What actually happened" pairs and the closing sentence? Suggested default: yes.
8. **Tables:** no check-up and no setting-following table? Suggested default: yes.
9. **Labels:** re-use Gravity 3's `LabelledCabin` (floor, left/right ball, arrows) in Part 2, with the two panel titles saying that the cabins are stand-ins? Suggested default: yes.
10. **Honesty line:** "calculated here, not measured; the constants 0.3 and 1.2 are chosen so that Medium and Medium give 0.3; the strengths are capped at 0.9"? Suggested default: yes.
11. **Links:** search for a neutral plain official page for the start, hold the gravity and tides pages until after the tutor, and link only what is read? Suggested default: yes.

## Not checked (re-read)
Not run in a browser; dark mode and narrow widths not looked at; no source page searched or fetched in this re-read; the specification's "Expected Learner Understanding" and "Relationship to Later Experiments" not compared line by line; the nine-row table above was computed with a short script that copies the module's constants and formulas (0.3, 1.2, the clamps), not by calling the module's function, and is not yet in a test.
