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

---

# Re-read, 2026-11-15 (against Rule E and the 2026-11-07 rules)
Status: read-only. Nothing in the app, the specification or the tests was changed. The numbers below were worked with a scratch script that imports the module (kept outside the repo) and are not yet in a test.

## What the module returns (hand-checked; Hubble constant 70, dark energy 70%, no radiation)
| Redshift | Light travelled (billion ly) | Source today | Source when the light left | Today ÷ travelled | Recession speed today |
|---|---|---|---|---|---|
| 0.5 | 5.041 | 6.160 | 4.107 | 1.22 | 0.44 c |
| 1.856 (light travelled exactly 10.000) | 10.000 | 16.191 | 5.670 | 1.62 | not run |
| 2 | 10.240 | 16.894 | 5.631 | 1.65 | 1.21 c |
| 10 | 13.001 | 30.790 | 2.799 | 2.37 | 2.20 c |
| 1089.8 (oldest light) | 13.467 | 44.611 | 0.041 (40.9 million ly) | 3.31 | 3.19 c |

1. **Guess 1 is asked about light that travelled for 10 billion years, but the page checks it against redshift 2, whose light travelled 10.24 billion** (`ObservableUniverseExperiment.tsx:133`). The answer ("more than 10 billion light-years") is the same for both (16.19 against 16.89), but the page says "10 billion" in the question and shows 10.24 in Results. A module function could give the exact 10.000 case (redshift 1.856).
2. **The oldest light's source was 40.9 million light-years away when the light left**, so guess 2's third answer ("far closer, under 100 million") is true, and the module's 41 million matches the specification.
3. **The model is 2.38 percent below 45.7 billion light-years and 4.06 percent below 46.5** (44.611 against each). The page's "about 2.4 percent" is right. The percentage is computed in the component (`:136-137`), not the module.
4. **The model puts the oldest light's departure at 471,932 years after the Big Bang**, which the page rounds to 472,000, against Experiment 3's 380,000.
5. **The recession speed today for the oldest light is 3.19 times the speed of light**, so the tutor's "about 3.2 times" matches.
6. **The distance when the light left peaks near redshift 1.63 at 5.70 billion light-years**, so the graph's green curve rises and then falls (specification test 8).
7. **Scale problem found:** on the 0 to 50 billion light-year axis, 41 million light-years is 0.08 percent of the axis, 0.4 of a pixel. The picture draws the green bar at a forced 3-pixel minimum (`MIN_VISIBLE_BAR_PX`, `:67`). **A guess of "under 100 million" or "a few billion" cannot be told apart from zero on that axis**, so guess 2 needs its own zoomed panel (Rule A, item 5).

## Corrections to the 2026-11-02 report
- **Pictures appear on the first Run, and the first Run is the oldest light.** The default source is the last preset, the oldest light (`:111`), so the first run shows the oldest light's three distances. The learner's chosen source and the two fixed questions are tangled together: Guess 1's answer (redshift 2) is on no picture unless the learner happens to pick redshift 2.
- **The live readout under Run gives answers away.** It prints "Light travelled", "Source today" and "Source when the light left" with numbers (`:422-433`), which is the answer to both guesses for the oldest light.
- **C7 and the caption.** Beyond the three items in the old report: "the oldest sources ... so short at this scale that you can hardly see it" (`:634-635`); the redshift examples list the light-travel times (`:597-604`), which includes 10.2 billion years for redshift 2; and the item "Try it with the source on the screen now" prints the three distances (`:643-650`).
- **Results gives verdicts.** "so your prediction was right / off this time" for both (`:734-736`, `:744-746`), and the Results text answers the tutor's conceptual question first: "Why the distances differ" gives the rubber-band explanation, "Nothing travelled faster than light" gives the answer to the tutor's question 3, and "A simple calculation" gives the 1 + z rule, all before the tutor asks (`:748-769`; tutor `:80-81`).
- **Parts 2 to 4 vanish when the source changes.** `handlePresetChange`, `handleCustom` and the slider call `setStatus('idle')` (`:142`, `:147`, `:395`), which hides Results and unmounts the tutor, and each Run remounts the tutor from its first question (`key={runCount}`, `:822`).
- **"Change predictions" appears only after the guesses are locked** (`:333-352`) and reopens both questions without clearing the source or the results. The standing rule replaces it with an always-visible "Start over".
- **The prediction text repeats the guesses under the buttons** ("Your predictions: ...", `:324-330`); not a fault, kept in some form.
- **No render test exists** for this experiment (`src/components` has `ObservableUniverseExperiment.tsx` and `ObservableUniverseTutor.tsx`, no `.test.tsx`; Cosmology 1 to 7 each have one).
- **Heading** "Experiment 8 — How Far Can We See? The Observable Universe" (`:212`) has no group name; it would read **Cosmology 8: ...**. Cross-references say "Experiment 3", "Experiment 1", "Experiments 5 and 6" with no group name, and the preset label says "the source in Experiment 7" (`observableUniverseExperiment.ts:37`): to be checked against the sidebar's names.
- **Date.** Nothing says "as of" any date, and the introduction does not say that the universe's age is about 13.8 billion years in real measurements while the model gives 13.47 (the page says "about 13.5 billion years in this model").
- **The firework picture** in the introduction (`:233-237`) is neutral about the guesses and is kept in spirit. The rubber-band picture is correctly kept out of the introduction (specification).

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, both guesses, the source buttons, Run, the readout, both pictures, the caption and Results (`:214-818`); the tutor is a second card | Part 1 (guesses, Run, the pictures of the fixed sources), Part 2 (the source control and its drawing), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answers (§12) |
| E3 | Not met | No links list, no words box | See "Links and Words" |

## Parts 2 to 4 appear after the first Run; Start over
Parts 2 to 4 appear only while `status === 'complete'` and vanish when the source changes: **partly met**, the same defect as Cosmology 1, 2, 4, 5, 6 and 7. Suggested fix as before: after the first Run, Parts 2 to 4 stay; a changed source changes only Part 2's drawing until its own Run; the tutor is not remounted. **"Start over" replaces "Change predictions"** (always visible, greyed out until a guess or a run exists and while a run plays; it clears everything).

## Predictions and where their answers live (A5, sharpened)
Both answers are distances, but both are about **fixed** sources (redshift 2 and the oldest light), not the source the learner picks. In the same way as Cosmology 7, Part 1 should be fixed on those two sources, and the learner's own source belongs to Part 2.
- **Guess 1 (less than, about, or more than 10 billion light-years):** the real answer is the gold bar for the redshift-2 source on a true 0 to 50 scale (16.9). The three answers carry no size of their own, so a white **marker**: a white line at 10 billion on the gold bar's row with an arrow pointing left ("less"), a ring on the line ("about"), or an arrow pointing right ("more"), in a YOUR GUESS box. The caption says it is only a marker. The blue bar (10.24) sits beside it as the light's own journey.
- **Guess 2 (about 13 billion, a few billion, under 100 million):** the real answer is a green bar of 41 million, invisible on the 0 to 50 scale. Suggested: a **zoomed panel** on its own scale (0 to 100 million light-years) in the same picture, with its own title, showing the green bar (41 million), a white marker at the guess, and the label "the 100 million line". The first answer's mark (13 billion) is far off the panel's end and would be drawn as an edge arrow ("off the scale: about 13 billion"); "a few billion" likewise. **"A few billion" has no exact size**, so the mark is a white arrow at the panel's edge labelled "a few billion (about 2 to 5), off the scale"; "under 100 million" is a white bracket from 0 to 100 million.
- **Where the real picture comes from.** *Calculated here:* every bar, curve and distance (a flat universe with 70% dark energy and a Hubble constant of 70, without radiation, from Experiments 1, 2, 5 and 6; the formulas in the module). *Measured by others (given, not worked out here):* the real figures 45.7 and 46.5 billion light-years (Planck results; the specification says they came from a general web search of 2026-10-08, not a primary source), and the redshift 1089.8 (Planck, via Experiment 3). *Imagined for the question:* none unless the owner chooses to draw the "10 billion" line as imagined; the redshift-2 source stands in for "a galaxy whose light travelled about 10 billion years".

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: observable universe, light-year, redshift, cosmic microwave background, light travel time (look-back time), distance today (comoving distance), distance when the light left (proper distance then), stretching factor (1 + z), recession speed, megaparsec, Hubble constant, dark energy, flat universe, radiation (as the model's omission), particle horizon, Hubble tension, "billion" (a thousand million). Formulas with worked examples from the page's own numbers: distance today ÷ (1 + z) = distance when the light left (44.6 billion ÷ 1090.8 = 41 million); distance travelled = travel time × speed of light (13.47 billion years → 13.47 billion light-years); recession speed = H0 × distance (70 × 13,680 Mpc ≈ 957,000 km/s ≈ 3.2 c). **Held back until after the run (§12):** the 1 + z rule's worked example and the recession speed.
- **"Want to know more?" links (new).** None exists. Needed: the Planck 2018 cosmological parameters paper (Aghanim and others) for the oldest light's source distance and redshift; an official page (NASA, ESA) that says what the observable universe is and why it is about 46 billion light-years in radius; an official page on expansion as stretching of space and recession faster than light. **Sources read 2026-11-15 (helper agent, model summaries; see `08-draft-wording.md`):** the 45.7 and 46.5 figures are Wikipedia's (citing Gott and others 2005), not Planck 2018's; the helper's own integration with Planck 2018's numbers gives about 45.2 to 45.3 and 46.1 to 46.2 (calculated, not fetched). Planck 2018: age 13.787 billion years, redshift 1089.80. No plain official page gives the observable universe's radius (§29 rule 3(c) gap). Nothing is linked until the owner approves.

## Wording and claims to check (new and restated)
- **"About 45.7 and 46.5 billion light-years"** (module `REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS`, `REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS`, and the Results box "45 to 46"). From a web search of 2026-10-08, not a primary source (specification, item 8). The Results box says "about 45 to 46" for the oldest light while the module's constant is 45.7: two ways of saying one number.
- **"About 13.5 billion years old in this model."** The model's 13.47 against a published age of about 13.8 billion; the page never says the real age (the model's Hubble constant and the missing radiation shift it).
- **"Nothing here says how large the whole universe is"** (kept; a plain official page that says the universe may be larger than the observable part is part of the source search).
- **The recession speed "about 3.2 times the speed of light"** (tutor `:153`): follows from Hubble's Law applied to the distance today; the claim that this "does not break relativity because it is not a speed through space" is Claude's wording and has no source read.
- **The firework and ant-on-a-rubber-band pictures** are Claude's own pictures with no source. The ant picture is "not exact" (the page says so), and a rubber band's ends move apart uniformly, which fits the model; the picture does not show that the ant's own speed is fixed relative to the band under it.
- **"The farthest from which any signal could have reached us by now"** (Results, tutor): a definition of the particle horizon in Claude's wording.
- **`onComplete` fires on every Run;** not harmful.

## B1 to B3, recommendation
Suggested **check-up table** (rows that do not depend on the learner's source):
- (a) **The oldest light's source today:** this model 44.61 against the real about 45.7 billion light-years. Reading: "less, by 1.09 billion (2.4 percent)", with the cause (radiation left out).
- (b) **The edge of the observable universe:** this model's oldest-light distance 44.61 against the real about 46.5. Reading: "less, by 1.89 billion (4.1 percent)"; the model does not compute the edge itself, so this row says that the real edge is farther than the oldest light's source by about 0.8 billion, which is the 4.1 percent less the 2.4 percent.
- (c) **The oldest light's departure time:** this model 472,000 years after the Big Bang against 380,000 (Experiment 3). Reading: "more, by about 92,000 years (24 percent)".
- (d) **The age of the universe:** this model 13.47 against the real age. Reading: "less" (the real figure to be read).
"What this table tells us" under each. **Setting-following table (item 3):** the existing three-row table (for the learner's source) has no real figure except for the oldest light, so the optional "Published value / How yours compares" columns are **not warranted** for other sources; recommended **no** (as for Experiment 14's removed Table 4), with the three-row table kept and a short "What your numbers show" note updated per source. **The learner's guesses** shown beside the results with a tag on the row (guess 1 at the redshift-2 row, guess 2 at the oldest light's "when the light left" row). This needs the table to hold the two fixed sources' rows as well as the learner's source.

## Updated size
**Medium to Large** (was Medium). Part 1 rebuilt on two fixed sources with a zoomed panel for guess 2, white marks, a module with new tested functions (the exact 10.000 case, the guess marks, the percentage below the real value, the zoomed-panel positions), the page in four Parts with Part 2's pink drawing, a check-up with a reading column, a words box, links, a tutor that marks both guesses, a new render test file. **No change to approved physics.**

## Questions for the owner, each with a suggested default
1. **Part 1 fixed on two sources** (the redshift-2 galaxy and the oldest light, drawn together in one run), with the source control and the learner's own drawing in Part 2. *Default: yes.*
2. **Guess 1 mark:** a white line at 10 billion with an arrow (less, more) or a ring (about); marker only. *Default: yes.*
3. **Guess 2:** a **zoomed panel** (0 to 100 million light-years) added to Picture 1 with its own title, showing the green bar (41 million) and the white mark; "13 billion" and "a few billion" drawn as edge arrows ("off the scale"), "under 100 million" as a bracket from 0 to 100 million. *Default: yes.*
4. **"A few billion":** draw it as "about 2 to 5 billion" (a range the page does not otherwise state), or do not give it a size and say only "off the scale to the right". *Default: the second (no invented range).*
5. **Guess 1's example:** keep redshift 2 (light travelled 10.24) and say so, or add a module function for the exact 10.000 case (redshift 1.856, 16.19 billion today) and draw that source. *Default: keep redshift 2, and say "about 10 billion" with the 10.24 shown.*
6. **Hold back until after the run (§12):** the live readout's numbers, the redshift examples' travel times, "Try it with the source on the screen now", the 1 + z rule, the rubber band and "nothing travelled faster than light", all moved to the tutor. *Default: yes.*
7. **Results:** verdicts ("right / off") moved to the tutor; keep the tables; show both guesses with tags. *Default: yes.*
8. **Check-up rows (a), (b), (c), (d)** as above; row (d) only if the real age is read from a source. *Default: yes.*
9. **No setting-following comparison columns** (the real figures exist only for the oldest light); keep a "What your numbers show" note per source. *Default: yes.*
10. **The real figures 45.7 and 46.5:** keep the constants, read Planck 2018 and say "published values, about 45.7 and 46.5"; if the paper differs, report before changing the constant (a physics decision). *Default: keep.*
11. **Links and words** as above; link only what is read; record the gaps. *Default: yes.*
12. **"Change predictions" replaced by "Start over"** and the heading changed to "Cosmology 8: ..." with the sidebar's names in cross-references. *Default: yes.*
13. **Introduction:** a longer, more detailed and up-to-date introduction (the owner asked for this on Cosmology 7), with "as of November 2026"; the real age 13.8 billion stated beside the model's 13.47. *Default: yes.*

## Not checked (re-read)
Not run in a browser; narrow widths and dark mode not looked at; the helper's sources were read through model summaries and are to be spot-checked in a browser; the specification was read in full but not compared line by line with the page; line numbers are from the files as read today; the module's 17 tests were counted from the report and not re-run.
