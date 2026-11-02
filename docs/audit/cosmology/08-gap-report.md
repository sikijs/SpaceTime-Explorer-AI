# Gap report: Cosmology Experiment 8 (How far can we see? The observable universe)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/08-observable-universe.md | Components: src/components/ObservableUniverseExperiment.tsx, ObservableUniverseTutor.tsx | Physics module: src/physics/observableUniverseExperiment.ts (+ .test.ts, 17 tests) | Status: read-only, nothing changed

## Summary
Two pictures (Picture 1: three horizontal bars on a true-scale axis for one chosen source; Picture 2: a log-redshift graph with three curves), a source control (presets and a redshift slider), two predictions whose answers are distances, Results with a three-row table, a worked "times 1 + z" calculation, a "How close is this model to the real values?" box. Good natural homes for guess marks: both predicted quantities are distances on Picture 1's true axis. Gaps: no marks, no "Where the real picture comes from", no "What this table tells us", no three-part look-for items, verdicts in Results, and the caption reveals both answers before the run. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | A galaxy's light has been travelling for 10 billion years. How far away is that galaxy today? (ObservableUniverseExperiment.tsx:~296-300, choices :34-38; ACTUAL = 'more', :49) | Less than / About / More than 10 billion light-years | Picture 1's gold bar and its axis (:438-503), at redshift 2 (`tenBillionYearExample`, :133) |
| 2 | The oldest light left its source when the universe was very young. How far away was that source when the light left? (:~305-308, choices :41-45; ACTUAL = 'closer', :50) | About 13 billion light-years / A few billion light-years / Far closer, under 100 million light-years | Picture 1's green bar for the oldest light (redshift 1089.8, `oldestLight`, :134) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result = runObservableUniverseExperiment(redshift)` takes only the chosen redshift (:128); prediction checks use fixed runs at redshift 2 and 1089.8 (:133-134); predictions feed text only (:728-746) and tutor props (:821-826) | none |
| A2 | Not met | No guess element in either SVG (:438-583) | White "YOUR GUESS" marks on Picture 1's distance axis: a mark at 10 billion light-years (Prediction 1: less / about / more as a marker on the axis or a bar of a guessed length); a mark for the guessed emission distance (Prediction 2) |
| A3 | Not met | | Predictions are three bands: markers (a band on the axis), caption to say marker only; they are tied to specific sources (redshift 2, 1089.8), not the source the learner chose |
| A4 | Not met | Bars grow during Run (:~636-641) | Draw marks after the bars have grown, and only for the matching source (redshift 2 or the oldest light), which may not be the chosen source; a small extra panel or a labelled fixed row would be needed |
| A5 | Partly | The predicted quantities exist in Picture 1, but only for whichever source is chosen | A fixed reference row for "redshift 2" and "oldest light" on Picture 1 or in Picture 2 (dots at those redshifts) |
| A6 | Not met | no "Where the real picture comes from" line | Needed: distances calculated here from the Experiment 5/6 model (flat, 70% dark energy, H0 70, no radiation); real reference 45.7 billion light-years for the oldest light's source today and 46.5 for the observable universe's edge (module :25-26, given, measured by others); the 'closer' answer is calculated here, not measured |
| A7 | Not met | Intro (:217-300) and the source control (:~360-418) say nothing about guesses never changing the pictures or tables | Add sentences; note beside the controls |
| A8 | Partly met | Distances come from the module; the prediction answers are constants in the component (:49-50) and the choice of examples is in the component (:131-137); `modelBelowRealPercent` is computed in the component (:136-137) | Module functions for the guess marks and the comparison with 45.7 billion, with tests (the module has tests on the 44.6 billion and the 41 million; test :70) |
| A9 | Not met | Tutor compare prompt (ObservableUniverseTutor.tsx:79-80) restates the guesses and names no mark; verdicts in Results (Experiment.tsx:735, :745) | Prompts to name marks; verdict placement is the owner's decision |
| A10 | Not found | The code comment says "Choices are not scored" (:28-29) but the learner-facing text has no "predictions do not change the results" sentence | Absent for the learner despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:702-815): a 3-row table (light travelled; source today; source when light left); a "times as far today" sentence; two "Checking your ... prediction" paragraphs with right/off; "Why the distances differ" (ant on a rubber band comparison); "A simple calculation" (distance x (1 + z)); "Nothing travelled faster than light"; a box "How close is this model to the real values?" (model about N% below the real figure for the oldest light's source); "What this model simplifies".
- B1: Partly met. The "How close is this model to the real values?" box is a real check-up in prose: model vs 45 to 46 billion (measured/derived by astronomers) and 46.5 for the edge; a table with a reading column is missing, and the percentage is computed in the component.
- B2: Not met. No "What this table tells us" under the three-row table.
- B3: Partly met: the table follows the source control; the reference only exists for the oldest light, not for other redshifts; a "Published value / How yours compares" column is not warranted for other sources.
- B4: Partly met (guess in prose with verdict; no row tag).
- B5: Partly met (module distances tested; the percentage below the real value is not a module function).

## Rule C
- C1: Mostly met. Picture 1: "Earth", row labels for each bar, "The source" dot, axis title (:451-500); Picture 2: title, axes and ticks, curve labels, "Your chosen source" (:518-583). Not confirmed: whether the dashed line below Earth carries a label (named only in the caption).
- C2: Met. Bars and dots change with the source (caption :~630-690; "The motion is drawn to help you notice").
- C3: Met in form. "How to read these diagrams" (:587) beneath both pictures, but pictures and caption appear only after predictions are submitted (:~435).
- C4: Mostly met. Two units defined first with worked redshift examples (:~597-604), every bar and curve with its colour, axis ticks (log scale explained, :~668-672), what is animated. Bulleted. Terms "light-year" and "redshift" defined in the caption.
- C5: Partly met. A worked moment with numbers appears at :644-650 ("Try it with the source on the screen now ... the light travelled X, the source is Y away") and in the redshift 0.5/2/10 examples, but it is live numbers for the chosen source, not a fixed worked example.
- C6: Not met. Items are descriptive; the final "ask" bullets (:684-686) are not Look at / Means / Matters.
- C7: Not met. The caption says the green bar "for the oldest sources is so short at this scale that you can hardly see it" (:635) which answers Prediction 2 (far closer); the "Try it with the source on the screen now" item (:644-650) prints the three distances for the chosen source, which shows the today-vs-travelled comparison of Prediction 1; and the item "the gold bar and the dot grow as the source goes from where it was when the light left to where it is today" (:~637-640) states the expansion.
- C8: Mostly met. Light-year, observable universe, redshift, "today" distance defined before use (:219-230); "Mpc" and "flat" appear in assumptions with a gloss (:~256-262).

## Other findings
- O1: None found against the specification in what was read.
- O2: Prediction 1 asks about "10 billion years" of light travel but the real answer shown is for redshift 2 (`tenBillionYearExample = runObservableUniverseExperiment(2)`, :133); its light-travel time was not checked to be 10 billion years. The Results line "the light from the redshift 2 galaxy travelled ..." depends on that. Unsourced: the firework comparison, "about 9.5 million million kilometers" (standard). Real figures 45.7 and 46.5 billion are in the module (:25-26) without a cited source in the text read. No links list.

## What an update would touch, and its size
ObservableUniverseExperiment.tsx, ObservableUniverseTutor.tsx, src/physics/observableUniverseExperiment.ts and test, specification 08-observable-universe.md. Size **M**: guess marks on Picture 1 (with a fixed reference source), module functions, check-up table and "What this table tells us", caption rewrite (three reveals to remove).

## Not checked
Browser rendering; whether redshift 2's travel time is about 10 billion years; the tutor's explanation text; control block line numbers (approximate); the specification's decisions table.
