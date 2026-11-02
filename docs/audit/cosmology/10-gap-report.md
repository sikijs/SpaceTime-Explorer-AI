# Gap report: Cosmology Experiment 10 (The fate of the universe)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/10-fate-of-the-universe.md (and closing-synthesis.md, see Other findings) | Components: src/components/FateOfTheUniverseExperiment.tsx (1,199 lines), FateOfTheUniverseTutor.tsx, and the closing section src/components/CosmologySynthesis.tsx | Physics module: src/physics/fateOfTheUniverseExperiment.ts (+ .test.ts, 23 tests) | Status: read-only, nothing changed

## Summary
Three pictures (a size-against-time graph for the next 100 billion years with a no-dark-energy reference, four bars for the first four doublings, a strip of galaxies), a "share of dark energy" control, two predictions about the real best-fit universe, Results with an eight-row table, a worked calculation, an expansion-rate explanation with several examples, daily-life comparisons, and two "can and cannot tell you" boxes, a 3-prompt tutor, and the Cosmology closing synthesis below. Both predictions have natural homes: Prediction 1 on the graph (curve shape), Prediction 2 on the bars (the second doubling's length: 5, 11 or 30 billion years). Gaps: no marks, no "Where the real picture comes from", no check-up, no "What this table tells us", and a hard-coded verdict. Size: **L** (three pictures and an eight-row table need the work; the caption is the longest of the group).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | The universe is expanding today. What does the far future look like? (FateOfTheUniverseExperiment.tsx:382; choices :34-38) | Slows down and stops / Keeps going but ever more slowly / Keeps speeding up and never stops | Picture 1, the gold line's shape on the size graph (:531-620); the pink "speeding up" dot |
| 2 | If the universe takes about 11 billion years to double from today, how long will the next doubling take, from 2x to 4x? (:~398-402; choices :41-45) | Shorter (about 5 billion) / About the same (about 11 billion) / Much longer (about 30 billion) | Picture 2, the second bar's length against the first (:622-725) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result`, `realResult`, `noDarkEnergyResult` depend on the share only (module :97); predictions only feed text (:1088-1110) and tutor props (:1185+) | none |
| A2 | Not met | No guess element in the three SVGs (:531-770) | Prediction 1: a white guess curve (flattening to a stop / flattening slowly / curving up) on Picture 1 with a "YOUR GUESS" box; Prediction 2: a white bar of 5 / 11 / 30 billion years beside the second bar on Picture 2 |
| A3 | Not met | | Prediction 2 has a length (follows the guess); Prediction 1 is a three-way choice (a drawn curve per choice, caption says it is only a sketch) |
| A4 | Not met | The graph, bars and strip draw during the 10-second Run (:774-780) | Draw marks after the run reaches the relevant feature (end of the run for the graph, after the second bar for the bars) |
| A5 | Met (pictures exist) | graph and bars already carry both | none |
| A6 | Not met | no "Where the real picture comes from" line | Needed: the lines and bars are calculated here from the Experiment 5/6 model (flat, matter plus constant dark energy, H0 70, no radiation); today's 30/70 matter and dark energy split is the page's best-fit value; whether dark energy is constant is open (the page says so at :~1050-1060 and :1141-1146); the strip is not to scale |
| A7 | Not met | Intro (:264-340) and the control (:~455-514) say nothing about guesses never changing the pictures or tables | Add sentences; note beside the share control; also say the predictions are about the real best-fit universe whatever share is chosen |
| A8 | Partly met | Sizes, doubling times and rates come from the module; the guess verdicts are hard-coded strings in the component (`=== 'faster'` :1095, `=== 'same'` :1109) and the "real" examples are run in the component (`realResult`, `noDarkEnergyResult`); the 5/11/30-billion-year answer labels are typed into the labels (:41-45) | Module functions for the guess marks, with tests (the module already tests doubling times and settled values, 23 tests) |
| A9 | Not met | Tutor compare prompt (FateOfTheUniverseTutor.tsx:98-99) restates the guesses and names no mark; verdicts in Results (Experiment.tsx:1095-1110) | Prompts to name marks; verdict placement is the owner's decision |
| A10 | Not found | A code comment says "Choices are not scored here" (:31-32) but no learner-facing sentence says predictions do not change the results | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:922-1180): an 8-row table (size in 50 and 100 billion years; the first four doublings; do the doublings settle; speeding up today; when it starts speeding up; expansion rate today and after 100 billion years; the value it settles toward); "A simple calculation" (three branches by share); "What the expansion rate means for a galaxy's speed"; "Why the expansion rate is what it is" with a floor table for 90%, best fit and 33%; "Does dark energy change?" (DESI 2025, 2026 mixed); two daily-life comparisons (taps, savings account), a ball-throwing comparison for 0%; "What this model can and cannot tell you"; "What this model simplifies".
- B1: Not met as a check-up. No measured value exists for the future; the real references are today's expansion rate (70, illustrative) and the 0.30 / 0.70 split (the page's own). The page already marks everything as "what the model gives, not a prediction" (:1141-1146); a check-up would only be a "for the record" row set (e.g. DESI 2025 hint vs constant) and must say "not settled".
- B2: Not met. No "What this table tells us" under the eight-row table; the paragraphs that follow carry what/means/why but are not tied to rows.
- B3: Partly met. The table follows the control; there is no published reference for the future, so the "Published value / How yours compares" columns are not warranted (optional per §14).
- B4: Partly met (guess in prose with verdict; no row tag).
- B5: Partly met (numbers from the module with tests; the 50-year estimate comparison and floor values are computed from module functions in the component).

## Rule C
- C1: Mostly met. Graph axes, "today" line, legend, white dot and pink dot labels; bar rows with a time scale and "(off the scale)"; strip with galaxy labels A, B, C, "our cluster" and a spacing line (:~540-770, text elements listed at :557-801 area, per the caption's items). Individual labels not all re-read; the strip's real-spacing line of text is named in the caption.
- C2: Met. The gold line, bars, pink dashed line and strip all follow the share; the blue dashed line is the 0% reference.
- C3: Met in form. "How to read this diagram" (:774) beneath the three pictures (not checked whether it is hidden before predictions are locked).
- C4: Mostly met. Per-picture sections, axes and log ticks explained, every colour, dot and line, "off the scale" markers, the line of numbers above, short bullets. Units "x", "billions of years" and "kilometers per second per megaparsec" are explained.
- C5: Partly met. Worked numbers inside the caption are only generic ("if the first bar is 10 billion years long ..."); the fully worked numbers are in Results ("A simple calculation").
- C6: Not met. Items are descriptive; no "Look at / What it means / Why it matters" structure.
- C7: Not met (partly). The caption states how to read a straight / flattening / upward-bending line (:~800-805), says the pink dot is "the moment the expansion changes from slowing down to speeding up" and "with no dark energy it never appears" (:~813-817), that "the pink dashed line marks the value the doubling time settles toward" (:~843-846), and asks "Are they getting longer, staying about the same, or getting shorter?" (:~838-840), which restates Prediction 2's options. Together they point toward both answers (speeding up forever; the doubling time settling).
- C8: Mostly met. size, doubling time, expansion rate, megaparsec, contribution and "flat" are defined before use (:274-320); "Big Crunch" and "Big Rip" appear in a Results box without definitions beyond a bracket description.

## Other findings
- O1: The Cosmology closing synthesis (`closing-synthesis.md`; CosmologySynthesis.tsx, shown after the explanation, :1196) imports figures from the earlier experiments' physics modules (hubblesLawExperiment, bigBangExperiment, darkMatterExperiment, darkEnergyExperiment, universeAgeExperiment and others, CosmologySynthesis.tsx:5-27). Any update that renames or moves a module function would have to keep the synthesis in step. It has no prediction of its own. Not otherwise audited.
- O2: Date-bound claim in Results: "in 2025, results from the DESI survey ... hinted that dark energy may be weakening ... Newer results in 2026 have been mixed, and one of them moved back toward a constant dark energy. At the time of writing (October 2026), the question is still open" (:~1056-1062); no source is cited on this page (the specification may record one; not checked). The two predictions are about the real best-fit universe but the picture the learner sees follows the chosen share, so a learner on a different share sees a gold line that does not match the real-universe answer (the Results box does give the real universe's numbers). The Prediction 2 answer labels carry numbers (5, 11, 30 billion years) that the Results confirm; the first (11 billion years) presupposes the learner knows the real value. The 0.30/0.70 split and the "2 x sqrt 2 = 2.83" ratio are stated without a source in the text. The ball-throwing escape-speed comparison is labelled an analogy. No links list.

## What an update would touch, and its size
FateOfTheUniverseExperiment.tsx, FateOfTheUniverseTutor.tsx, src/physics/fateOfTheUniverseExperiment.ts and test, specification 10-fate-of-the-universe.md, and a consistency check of CosmologySynthesis.tsx and closing-synthesis.md. Size **L**: guess marks on two pictures, verdicts moved into the module, a reading guide for an eight-row table, a caption rewrite of the longest caption in the group (three reveals to remove).

## Not checked
Browser rendering; whether the pictures and caption are hidden until predictions are locked; the tutor's explanation text; the line numbers marked "~" (read from a filtered view); the specification's decisions table and any source it records for the DESI statements; CosmologySynthesis.tsx beyond its imports.
