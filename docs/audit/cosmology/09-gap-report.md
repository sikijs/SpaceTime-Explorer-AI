# Gap report: Cosmology Experiment 9 (How did galaxies form? Structure formation)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/09-structure-formation.md | Components: src/components/StructureFormationExperiment.tsx (1,160 lines), StructureFormationTutor.tsx | Physics module: src/physics/structureFormationExperiment.ts (+ .test.ts, 17 tests) | Status: read-only, nothing changed

## Summary
Four pictures (a strip of dots, a growth-against-time graph, a density-excess graph for the chosen ripple, a "how big must a ripple start" scale), two controls (kind of matter, starting size), two predictions, Results with a six-row table, a worked calculation, a daily-life comparison and a "what this model can and cannot tell you" box, a 3-prompt tutor. Biggest gaps: no guess marks (and Prediction 1's answer, a growth factor, has a clear home on Picture 2), no "Where the real picture comes from", no check-up with a reference, no "What this table tells us", and the caption prints the real growth numbers and the head-start factor before the run, which answers both predictions. The right/wrong logic is hard-coded in the component. Size: **M** to **L** (four pictures, but only one or two need marks).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | From the oldest light's release to today, about how many times denser than average will a slightly denser region become (relative to its start)? (StructureFormationExperiment.tsx:369-372; choices :34-38) | About 10 times / About 1,000 times / About a million times | Picture 2's amber line at "today" (growth graph, :643-735); the same value is in Results (:1066-1072) |
| 2 | If the region could start gathering matter earlier, would that change the answer? (:389-391; choices :41-45) | No difference / A small difference / It would decide the outcome | Picture 2's violet line against the amber line (the head start, :713-716); Picture 4's two dots (:817-855) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result`, `ordinaryResult`, `darkResult` come from `runStructureFormationExperiment` with kind and start size only (module :146); the predictions feed text only (:1066-1095) and tutor props (:1151-1156) | none |
| A2 | Not met | No guess element in the four SVGs (:544-855) | Prediction 1: a white "YOUR GUESS" mark on Picture 2's growth axis at 10 / 1,000 / 1,000,000 with a line to the "today" end; Prediction 2: a marker between the two lines at today |
| A3 | Partly | Prediction 1 has a size (10, 1,000, 1,000,000 are positions on the log axis, a mark can follow the guess); Prediction 2 is a three-way choice (marker, caption must say marker only) | |
| A4 | Not met | Lines draw during the 9-second Run (caption :~1000) | Draw marks when the lines reach "today" |
| A5 | Met (picture exists) | Picture 2 carries both | none |
| A6 | Not met | no "Where the real picture comes from" line | Needed: growth factors calculated here from the simplified model (flat, 70% dark energy, H0 70, no radiation); the dark matter start at redshift about 3,400 is "a given real value" (Results :1128-1131); the recombination redshift 1089.8 is measured by others; the strip's glow is an illustration; the learner's starting size is "your own illustrative choice" |
| A7 | Not met | Intro (:291-336) and the controls (:~440-524) say nothing about guesses never changing the pictures or tables | Add sentences; note by the controls |
| A8 | Partly met | Growth, excess and required start values come from the module; the correctness tests are hard-coded in the component: `submittedGrowthPrediction === 'thousand'` (:~1073) and `=== 'none'` (:~1090); `HEAD_START_EXAMPLE_DELTA = 1e-3` is a component constant (:48); the example runs and the ratio dark/ordinary are computed in the component | Module functions for the guess marks and the verdicts' inputs, with tests |
| A9 | Not met | Tutor compare prompt (StructureFormationTutor.tsx:88-89) restates the guesses and names no mark; verdicts in Results (Experiment.tsx:1074-1095) | Prompts to name marks; verdict placement is the owner's decision |
| A10 | Not found | no "predictions do not change the results" sentence in the experiment or tutor | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:1020-1145): a table of up to six rows (start redshift; growth by today; density excess today; redshift of clump if any; starting size needed, this kind; starting size needed, the other kind); "A simple calculation"; two "Checking your ... prediction" paragraphs with right/off (and "partly right"); "A comparison from daily life" (savings account); a box "What this model can and cannot tell you"; "What this model simplifies".
- B1: Not met as a check-up. A real reference exists only partially: the oldest light's 1 part in 100,000 is a temperature ripple (the page itself says it is not the same as a density excess), and the recombination redshift 1089.8; no accepted value for the growth factor or the needed starting size exists in the page, so a check-up must not invent one.
- B2: Not met. No "What this table tells us"; the "simple calculation" and "can and cannot tell" box carry meaning in prose.
- B3: N/A / optional. The table follows the controls, but no real reference exists for the learner's own starting size; the page already says so.
- B4: Partly met (guess in prose with verdict; no row tag).
- B5: Partly met (numbers from the module with tests; the dark/ordinary ratio in the text is computed in the component).

## Rule C
- C1: Mostly met. Titles and axis labels on all four pictures (:557, :608-637, :656-720, :749-801, :830-851); line labels "ordinary", "dark" and "no dark energy" at the right edge (:713-719); the clump threshold labelled (:792). Not confirmed: the moving dot (explained only in the caption) and the strip's "stretched N times" label is present (:626-637).
- C2: Met. Chosen kind and start size change the strip, lines, Picture 3 and Picture 4's green dot.
- C3: Met in form. "How to read these diagrams" (:859) beneath all four, appearing only once predictions are submitted (the pictures are inside the `hasSubmittedPrediction` block, not re-checked at line level).
- C4: Mostly met. Per-picture sections with "What is drawn / What it shows" items, axes and log ticks explained, colours, the "Running it" paragraph. Defines density excess and growth with a numeric example (:866-872). Terms "redshift" and "recombination" are used by reference to earlier experiments.
- C5: Met. A worked example appears in the caption (1 part in 1,000 times 100 gives 1 part in 10, :869-872) and Picture 4 (1 ÷ growth, :~976-983).
- C6: Partly met. Two items are headed "What to look for" (:926, :963) with a Look-at-and-meaning flavour but no explicit "Look at / What it means / Why it matters" parts; other pictures have none.
- C7: Not met. The Picture 2 "What to look for" item prints the real growth numbers "By today, the amber line has grown about N times and the violet line about M times, so the head start is worth a factor of about X" (:926-931), the dashed line item prints the no-dark-energy comparison (:~935-940), and Picture 4 gives the required starting sizes (:~976-983). These give Prediction 1's value and Prediction 2's outcome before the run (the caption is shown after predictions are locked but numbers are live even before Run).
- C8: Mostly met. Density excess, growth, clump and redshift are defined before use (:304-312); "megaparsec" and "flat" are glossed in the assumptions (:~336-340).

## Other findings
- O1: None found against the specification in what was read.
- O2: Prediction 2's verdict says "partly right" for both 'small' and 'decides' (:~1090-1093), so the two non-"No difference" answers are not told apart; Prediction 1 is checked with the ordinary matter growth at about 1,000 times "for any starting size" but the table above shows the learner's chosen kind (which may be dark matter, about a different growth). The page says the dark matter start (redshift about 3,400) is a "given real value" with no source cited in the text. The savings-account comparison is flagged as inexact. Strip dots are drawn "at the model's true density excess" so a tiny ripple looks smooth: stated in the caption. No links list.

## What an update would touch, and its size
StructureFormationExperiment.tsx, StructureFormationTutor.tsx, src/physics/structureFormationExperiment.ts and test, specification 09-structure-formation.md. Size **M** to **L**: marks on Picture 2 (and optionally Picture 4), the verdict logic moved into the module, caption rewrite on a four-picture caption (remove the live numbers that reveal both answers), "What this table tells us" for a six-row table, tags on rows.

## Not checked
Browser rendering; whether the caption is hidden before predictions (read from the structure, not run); the tutor's explanation text; control block line numbers (approximate); the specification's decisions table.
