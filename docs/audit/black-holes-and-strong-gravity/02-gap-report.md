# Gap report: Black Holes and Strong Gravity Experiment 2 (Time Near a Black Hole: Does a Clock Ever Stop?)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/02-time-near-a-black-hole.md | Components: src/components/TimeNearBlackHoleExperiment.tsx, TimeNearBlackHoleTutor.tsx | Physics module: src/physics/timeNearBlackHoleExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, three pictures (two clocks and ruler; rate against distance with exact and simple-formula lines; readings over time), a Results part with 3 tables, text-only prediction checks and a tutor. Pictures and captions are labelled and clear. Gaps: no guess marks, no "Where the real picture comes from", no check-up or per-table notes, no three-part "what to look for", Picture 3 caption has one item only. Size: **Medium** (Picture 2 can carry all three guesses on its existing axes; Results needs a reading guide).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Clock hovering 1% outside the horizon: how fast does it tick? (TimeNearBlackHoleExperiment.tsx:420) | same / half / one tenth / stopped (:63-68); `justOutsidePrediction`, locked into `submittedJustOutside` at first Run (:229-233) | Picture 2, height of the line at distance 1.01 (real value about 0.0995) |
| 2 | Two clocks at 2 horizon radii, near a 10-Sun and an M87* hole: which ticks more slowly? (:440) | small / giant / same rate (:70-75); `massPrediction` | Picture 2 at distance 2 (one line serves every mass); also the "all three black holes" table (:1022) |
| 3 | Will the simple formula still be accurate next to a horizon? (:460) | 3 buttons (:77-82); `approximationPrediction` | Picture 2: the gap between the solid and dashed lines |

## Rule A
| Item | Result | Evidence | Gap / what is needed |
|---|---|---|---|
| A0 | Met | :202-204 | Listed |
| A1 | Met | results come from `runTimeNearBlackHoleExperiment`, `exactSlowingFactor`, `firstOrderSlowingFactor`; no real value reads prediction state (:303, :925-1000 only choose the sentence to show) | None |
| A2 | Not met | no marks in Pictures 1-3 | P1: white YOUR GUESS mark at heights 1 / 0.5 / 0.1 / 0 above x = 1.01 on Picture 2. P2 and P3: markers (no size of their own) |
| A3 | Not met | | P1 follows the guess; P2 and P3 are marker-only, caption must say so |
| A4 | Not met | Picture 2 is drawn in full as soon as pictures appear (:693-768) | Marks can all appear with the picture; P3's mark should wait until the dashed line is drawn (it is drawn at once) |
| A5 | Partly | P2's answer has no picture of two black holes side by side | Add a small panel in Picture 2 (or beside it) showing the factor at 2 radii for the 10-Sun hole and for M87*, on the same scale |
| A6 | Not met | no source line under pictures (:832-920) | Needed: exact formula calculated here; masses are the rounded values from Experiment 1; Picture 3 is a calculation of two clocks, not a measurement |
| A7 | Not met | intro (:324-410) has no statement about predictions not changing pictures, white marks, or controls | Add; add a note beside the black-hole and distance controls (:515-590) |
| A8 | Not met | Module has `exactSlowingFactor`, `firstOrderSlowingFactor`, `runTimeNearBlackHoleExperiment`, `clockReadingsAt`, `surfaceSlowing`, curve | Missing: guess to height / marker mapping, tested |
| A9 | Partly met | Tutor "observe" (TimeNearBlackHoleTutor.tsx:112) points to "the two clocks", not to marks; "compare" (:115) restates the guesses; the explained step does not mark them (the marks of right/wrong are in the Results, below) | Tutor must name the marks and mark each prediction |
| A10 | Not met as such | no "predictions do not change" sentence found by search; "Your predictions are locked in above" (:497) | Nothing to quote |

## Rule B
- B0 tables today: Results table of 4 rows (:932-955); "Here are all three at your distance" table (:1024); "same effect on real objects" table (:1060); worked math list (:1000-1020); prediction checks (:957-996); a "model can and cannot tell you" box (:1096).
- B1 Not met. A real reference exists: the exact formula versus the simple formula of Gravity Exp 2 and 9, and the test that the simple formula matches Gravity Exp 9's GPS figure within 1% (module test :99). The Results row 4 already gives "x% too high". A check-up table could set "simple formula" beside "exact" at 10, 2, 1.01 radii. No measured value near a black hole exists (stated in the spec as a thought experiment).
- B2 Not met: no per-table "What this table tells us"; the paragraph after the real-object table (:1076) is partial.
- B3 N/A: controls select a distance and a hole; no published value to compare.
- B4 Partly: guesses shown in text (:957-996) with "right / off this time" verdicts (:964, :979, :991); no tag on a table row; not drawn on a picture.
- B5 Partly: all table numbers come from the module. UI has local arithmetic (`percentTooHigh`, `holesAtTwo`, "Math.round(1 / surfaces[0].rsOverR / 1e7) * 10" in the Results, :1076), and tutor calculates "tooHighAt..." percentages (Tutor:77-78) outside the module.

## Rule C
- C1 Met: clocks, horizon, ruler, dot, graph lines and legend are labelled in the SVG (:593-768, text at the lines found).
- C2 Met: the hands drift apart; blue and orange lines differ; changing distance moves the dot and both clock readings.
- C3 Met: "How to read these diagrams" (:833).
- C4 Mostly met: Picture 1 has 7 items (:844-885), Picture 2 has 3 (:892-907), Picture 3 has 1 (:914-919). Units: horizon radii, AU defined in intro (:352-362). Picture 3's axes and the "dots" get one short item; no mention of the 60 s run.
- C5 Not met: no worked moment with real numbers inside the caption (the Results math has one, :998-1020).
- C6 Not met: "What to look for" is only in the intro (:380) and a loose sentence in Picture 2 item 3 ("Look at where the two lines...", :903); not Look at / Means / Why.
- C7 Partly: Picture 2's caption (:903-906) directs the learner to where the formulas "pull apart" and "what each says at the horizon", which edges toward Prediction 3. The code comment (:326-329) deliberately keeps the intro clean; the picture only appears after lock-in.
- C8 Mostly met: far-away clock, hovering clock, horizon, horizon radius, AU defined before use (:352-362). "Logarithmic" is explained in the caption (:861).

## Other findings
- O1: none against the spec found in the parts read.
- O2: Results verdicts "So your prediction was right / off this time" are the older-rule form; new rule leaves verdicts to the tutor.
- O2: the "swimmer above a waterfall" comparison (:1081) is flagged in its own text as an analogy for the push, not for time slowing. Unsourced.

## What an update would touch, and its size (O3, O4)
TimeNearBlackHoleExperiment.tsx (marks on Picture 2, small panel for P2, source lines, check-up, notes, caption items, intro and control notes), TimeNearBlackHoleTutor.tsx, physics/timeNearBlackHoleExperiment.ts and .test.ts, specification. Size: **Medium**.

## Not checked
Not run in a browser. SVG text was read from grep of the text elements, not every attribute. Tutor "explained" step read only by search for prediction wording. Links: none on this page.

---

# Re-read of 2026-11-16 (against Rule E, the 2026-11-07 rules, and the owner's request for rich Black Holes pages)
Status: read-only, nothing in the app, tests or specification changed. The findings above still stand; the new findings are below. Line numbers are from `TimeNearBlackHoleExperiment.tsx` as read today (1,134 lines; tutor 223 lines; module 106 lines).

## Rule E (the page in four Parts): not met
| Item | Result | Evidence | Gap |
|---|---|---|---|
| E1 | Not met | One long card: introduction (:324-410), predictions (:420-500), controls and Run (:515-590), pictures (:593-920), Results (:924-1120), tutor (:1123) | Split into Part 1 (predict, then watch), Part 2 (black-hole and distance controls and any drawing that follows them), Part 3 (results), Part 4 (tutor) |
| E2 | Not met | No Part headings, colours or leads | Four leads to draft; Part 1's lead gives no answers |
| E3 | Not met | No "Want to know more?" list and no "Words and formulas" box (the first gap report found no links on this page) | Both go above Part 1 with no heading |
| E4, E5 | n/a yet | | Leads to be drafted; one experiment, no sub-parts |

## The 2026-11-07 rules
- **Parts 2, 3 and 4 appear after the first Run has finished: partly met.** Results and tutor wait for `status === 'complete'` (:303, :1123), but the black-hole buttons, distance buttons and slider (Part 2 content) are on screen from the start, disabled until all three guesses exist (:523-581). They must move below the first Run.
- **Start over, not Change prediction: not met.** The button is "Change predictions" (:511), shown only after the first Run, and it keeps the chosen hole and distance. Replace it with an always-visible "Start over" (greyed until there is a guess or a run, and while a run plays), and say the guess is locked after Run.
- **Run must not need a choice that belongs to Part 2:** the Run today uses the hole and distance the learner picked. Part 1 therefore needs a fixed run (question 1).
- **Several guesses, one Run:** the three guesses are all asked before the first Run, and Run is the only step, so the "several runs" trap of Gravitational Waves 4 does not arise. Part 3's "all three black holes" table and the real-surfaces table need no extra run.
- **Links and words: not met** (see E3).

## Content for a favourite topic (all of it is the owner's to approve, §28.1)
What exists today: a long text-only introduction (about 90 lines), no pictures other than the three drawn graphs, no links. The project holds seven licensed images in `public/images/black-holes/` (M87* and Sgr A* by the EHT, S2's orbit, Gaia BH3, the Crab Nebula, M77 and a labelled NASA visualisation; all added for Black Holes 1) and an image component with credit line, alt text and size, so no new framework is needed.

Proposed, as a menu to accept or cut:
1. **A fuller introduction with sub-headings** that fully explains the subject without giving the three answers: what "time runs at different rates" means (a clock on a mountain against one at sea level, Gravity 2 and 9); why a black hole is the strongest test; what "hovering" means and why it is a thought experiment; a pointer back to Black Holes 1 for the horizon radius.
2. **Real-world grounding (new, was "none" in the specification, decision 10):** real measurements of gravity slowing clocks (for example optical-clock height comparisons and GPS, each only if a source is read); the "Interstellar" film question is **not** raised unless you ask. Only facts from read pages.
3. **Images:** reuse the M87* and Sgr A* pictures (already in the project) to show the three real black holes the page uses; an own labelled drawing of two clocks at different heights; a NASA or ESA visualisation of light climbing out of a black hole's gravity only if its licence and wording are read. Nothing about the fall of a traveller (Black Holes 5's job).
4. **A "Recent news" block** of dated facts, only from read pages, as for Black Holes 1.
5. **A "Want to know more?" list** of official pages and papers (for gravitational time dilation: NASA, NIST or an observatory page on optical clocks and height; for black holes: the pages already read for Black Holes 1), each fetched and read first; gaps recorded under §29 rule 3(c) practice.
6. **A "Words and formulas" box** (collapsed): far-away clock, hovering clock, horizon, horizon radius, slowing factor, first-order formula, logarithmic scale, astronomical unit; the formula √(1 − r_s / r) with the worked 2-radii example, **shown only after the first Run** because the example gives Prediction 2's answer.
7. **Held back until after the first Run (§12):** the factor at the horizon (zero), the independence of mass, and where the simple formula fails; the "swimmer above a waterfall" comparison stays in the Results.

## What to draw for the predictions (Rule A, planned)
- **Prediction 1** (clock at 1.01 radii): white mark on Picture 2 at the guessed height (1, 0.5, 0.1 or 0) above x = 1.01, in a YOUR GUESS box.
- **Prediction 2** (small against giant black hole at 2 radii): a new panel in Picture 2's frame on its own scale, "the same distance in radii around two black holes": two real bars (10-Sun hole and M87*, both from the module at 2 radii) with a white marker for the guess ("small ticks slower", "giant ticks slower", "same"). The marker has no size of its own, so the caption says it is only a marker.
- **Prediction 3** (is the simple formula still accurate?): white marker beside the gap between the solid and dashed lines (drawn once the dashed line is drawn), caption says it is only a marker.
- **Part 1 fixed run:** the 10-Sun black hole with the hovering clock at **1.01 horizon radii** (so the first Run itself shows Prediction 1's feature), 60 s of far-away time; Picture 2 is drawn in full with the three marks; Picture 3 fills in during the run. The Part 2 controls then let the learner pick another hole and distance.

## Updated list of what an update would touch
TimeNearBlackHoleExperiment.tsx (four Parts, Start over, marks and the Prediction 2 panel, source lines, check-up and notes, three-part "what to look for", extended introduction, links, words box, fixed Part 1 run), a new render test file, TimeNearBlackHoleTutor.tsx (name the marks; mark each guess; move the percentage arithmetic into the module), physics/timeNearBlackHoleExperiment.ts and .test.ts (guess-to-height, marker mapping, the two-hole panel values, check-up numbers, the percent-too-high and surface comparisons now in the interface), `public/images/black-holes/` (new images only after licences are read), the specification, DEVELOPMENT-STATE.md and the tracker.

## Updated size
**Medium to Large** (Medium before): the four-Part rebuild, the illustrated introduction, links and words box, and the reading guide on top of the marks. Smaller than Black Holes 1 because the three guesses sit on the existing axes.

## Questions for the owner, each with a suggested default
1. **Part 1 fixed run:** the 10-Sun black hole, the hovering clock at 1.01 horizon radii, 60 s of far-away time; hole and distance choices move to Part 2. *Default: yes.*
2. **Prediction 1 mark:** white mark on Picture 2 at the guessed height above x = 1.01. *Default: yes.*
3. **Prediction 2 panel:** a two-bar panel (10-Sun hole and M87* at 2 radii) with a white marker, on its own scale. *Default: yes.*
4. **Prediction 3 marker:** a white marker at the gap between the lines, drawn once the dashed line is drawn. *Default: yes.*
5. **Colours:** white only for the guess; the exact line stays blue, the simple formula orange, the horizon red, the far-away clock gold. *Default: yes.*
6. **Verdicts:** "your prediction was right / off this time" (:964, :979, :991) moves to the tutor; Results show each guess only, with a tag on its row. *Default: yes.*
7. **Check-up (Rule B1):** the exact formula against the simple formula at 10, 2 and 1.01 radii, and the simple formula against Gravity 9's GPS figure (the existing test, within 1%), each with a plain reading ("the same", "6% too high", "5 times too high"). No published value near a black hole exists, so no "published" column. *Default: yes.*
8. **Real-world grounding:** add one or two real measurements of gravity slowing clocks (only from pages read in the draft step), in the introduction's "why ask this" and in Part 3. *Default: yes, from official pages only; none raised if none can be read.*
9. **Images and extras:** reuse the M87*, Sgr A* and NASA images already in the project; own drawing of two clocks at different heights; a "Recent news" block; no strip of objects (Black Holes 1 has it). *Default: yes.*
10. **Reading guide for the learner's own run:** the table that follows the controls is optional (§14); the pictures already show the controls' effect. *Default: leave it out.*
11. **Heading:** "Experiment 2 — ..." becomes "Black Holes 2: Time Near a Black Hole: Does a Clock Ever Stop?". Cross-references use the sidebar's names. *Default: yes.*
12. **Sources:** an official-source search and fetch (with licence reading for each image) is run in the draft-wording step, before any wording is shown; nothing is linked or embedded until read. *Default: yes.*

## Not checked (re-read)
Not run in a browser; nothing fetched (no link, licence or fact has been verified here; the candidates above are proposals); the tutor was read only by search for prediction wording; the module's tests were not re-run; the intro and caption text were mapped by line, not re-read word by word.
