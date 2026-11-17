# Gap report: Black Holes and Strong Gravity Experiment 4 (Light Near a Black Hole: Can Light Be Trapped?)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/04-light-near-a-black-hole.md | Components: src/components/LightNearBlackHoleExperiment.tsx, LightNearBlackHoleTutor.tsx | Physics module: src/physics/lightNearBlackHoleExperiment.ts (+ .test.ts, 30 cases) | Status: read-only, nothing changed

## Summary
Three predictions, a bird's-eye picture of the light's path and a graph of total bend against aim, each with a "How to read" caption; a Results part with a main table, a three-black-holes table, three text prediction checks and worked math; a tutor. Good structure. Gaps: no guess marks, no source lines, no check-up or table notes, "What to look for" is missing from the captions (only the intro has one). The graph is a natural home for all three guesses. Size: **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Beam aimed to pass 5 horizon radii out: what happens? (LightNearBlackHoleExperiment.tsx:~680-700) | straight on / bent then escapes / captured (:53-58); `bendPrediction` locked as `submittedBend` (:505-509) | Graph (BendGraph, :334): bend at aim 5 (real value is in `checks.five`) |
| 2 | How close to the center must light be aimed to be captured? (:699) | 1 horizon radius / about 2.6 / about 10 (:60-65); `capturePrediction` | Graph: the green critical-aim line (x = 2.598); path picture's green ring |
| 3 | Aimed only a little farther out than the capture distance: what happens? | small bend / swings round more than 180° and escapes / captured anyway (:67-72); `justOutsidePrediction` | Graph: bend just right of the green line (aim 2.6, over 360°, near the top where the axis stops at 400°) |

## Rule A
| Item | Result | Evidence | Gap / what is needed |
|---|---|---|---|
| A0 | Met | :459-461 | Listed |
| A1 | Met | `runLightNearBlackHoleExperiment`, `lightPath`, `bendCurve`; prediction state only picks wording at :995-1036 | None |
| A2 | Not met | no mark in the path picture (:221) or BendGraph (:345) | P2: white YOUR GUESS vertical line at x = 1 / 2.6 / 10; P1: white dot on the graph at x = 5 at the bend guessed (about 0° for "straight on", etc.) ; P3: white mark near the top right of the green line |
| A3 | Not met | | P2 follows the guess; P1 and P3 follow it partly (an outcome such as "captured" has no height, so a marker) |
| A4 | Not met | the graph's green line and curves appear at once | Marks appear with the picture |
| A5 | Met in principle | all three answers live on the graph, which exists | None needed beyond marks; P1 at x = 5 is a fixed aim, whatever aim the learner chose |
| A6 | Not met | no source line under either picture (:866-931) | Needed: paths and bends calculated here from the equation for light near a black hole; the orange simple formula is Gravity Exp 8's; nothing measured (the 3√3/2 critical aim is the same exact theory) |
| A7 | Not met | intro (:566-680) says nothing of predictions not changing pictures, white marks or controls | Add; add a note by the black hole and aim controls |
| A8 | Not met | module has `weakFieldBendRadians`, `lightPath`, `runLightNearBlackHoleExperiment`, `bendCurve`, constants `CRITICAL_AIM_IN_HORIZON_RADII`, `PHOTON_SPHERE_IN_HORIZON_RADII` | Missing: guess to graph position mapping and tests |
| A9 | Partly | Tutor observe/compare (LightNearBlackHoleTutor.tsx:~114-117): observe points to the path, compare restates guesses; explained step does not mark | Tutor must name marks and mark each prediction |
| A10 | Not met as such | no "predictions do not change" sentence found; "locked in" wording only | n/a |

## Rule B
- B0 tables today: main Results table, 5 to 7 rows depending on outcome (:942-990): what happened, bend, simple formula value, turns swept, closest approach, critical aim, where light can circle; "critical aims for all three black holes" table (:1078); three prediction checks (:995-1036); worked math (:1039-1075); daily-life comparison (ball and funnel, :1105); "can and cannot tell you" box (:1122).
- B1 Not met. Reference: the exact bend versus the simple formula 2/b (already row 3 "so the exact bend is N times larger"); the critical aim 3√3/2 is the same theory. No measurement of light near a black hole is cited in this experiment (the spec relates to later experiments).
- B2 Not met: no "What this table tells us"; the paragraph before the three-hole table (:1066-1070) is the nearest.
- B3 N/A: the controls pick a hole and an aim; nothing published to compare.
- B4 Partly: guesses are in text with verdicts ("So your prediction was right / off this time", :998-1036); no tag on a row; not drawn.
- B5 Partly: table numbers come from the module. The UI does arithmetic: `toDegrees`, `formatLarger`, and the "checks" calls (`checks.five`, `.two`, `.ten`, ...); worked math writes "√3 is about 1.732" and "A radian is about 57.3°" as literals (:1043-1060).

## Rule C
- C1 Met (read): the path picture has a header, a live readout, labelled rings, aim line and scale bar (:221-345); the graph has labelled axes, curves, green line, x mark (BendGraph).
- C2 Met: blue path versus dashed straight line; blue versus orange curve; rose capture area.
- C3 Met: two captions (:867, :908).
- C4 Mostly met: names the picture, each line, ring and bend with 180° example; scale bar; axes and limit (graph stops at 400°). No "when things appear" order for the run (the path is drawn as the run plays).
- C5 Not met: no worked moment with real numbers in the captions (the Results has worked math).
- C6 Not met: neither caption has "What to look for" (only the intro, :645); no Look at / Means / Why.
- C7 Partly: the path caption defines the "critical aim" and the green ring (:884-887) and the graph caption names the green line (:922), which is Prediction 2's answer (2.6). Both appear only after lock-in. The intro keeps clear of the answers (comment :561-565 not checked line by line).
- C8 Met: aim distance, bend, captured, horizon, horizon radius and AU are defined in the word list (:618-627); "critical aim" is defined in the caption at first drawing; "radian" is explained in the Results math (:1060).

## Other findings
- O1: none against the spec found in the parts read.
- O2: verdict sentences in the Results ("right", "off this time") are the older-rule form.
- O2: Results prediction check 2 contains a hard-coded list "aimed at 2.5 ... 2 ... 2.7 ... 10" computed in `checks` but written in the text; if checks change, the wording does not.
- O2: ball-and-funnel comparison (:1105) has no source (labelled an analogy).

## What an update would touch, and its size (O3, O4)
LightNearBlackHoleExperiment.tsx (marks in BendGraph and path picture, source lines, check-up, notes, caption look-for items, intro and control notes), LightNearBlackHoleTutor.tsx, physics/lightNearBlackHoleExperiment.ts and .test.ts, specification. Size: **Medium**.

## Not checked
Not run in a browser; BendGraph's SVG internals and the tutor's explained step were not read line by line. Intro comment at :561 and the "What we assume" list (:649-680) only skimmed. Links: none on this page.

---

# Re-read of 2026-11-17 (against Rule E, the 2026-11-07 rules, and the owner's request for rich Black Holes pages)
Status: read-only; nothing in the app, tests or specification changed. The findings above still stand; the new findings are below. Line numbers are from `LightNearBlackHoleExperiment.tsx` as read today (1,151 lines; tutor 224; module 177; 291 test lines, 30 tests, run today: all pass). The page was not opened in a browser for this re-read.

## Rule E (the page in four Parts): not met
| Item | Result | Evidence | Gap |
|---|---|---|---|
| E1 | Not met | One long card: introduction (:564-677), three predictions (:679-744), controls and Run (:768-834), two pictures with captions (:856-930), Results (:932-1135), tutor (:1140) | Split into Part 1 (predict, then watch), Part 2 (black-hole and aim controls and the drawings that follow them), Part 3 (results), Part 4 (tutor) |
| E2 | Not met | No Part headings, colours or leads | Four leads to draft; Part 1's gives no answers |
| E3 | Not met | No "Want to know more?" list, no "Words and formulas" box (the words are a paragraph, :617-627) | Both go above Part 1 with no heading |
| E4, E5 | n/a yet | | One experiment, no sub-parts |

## The 2026-11-07 rules
- **Parts 2, 3 and 4 appear after the first Run: not met in a way that matters.** The controls are on screen from the start, disabled (:775, :793, :811, :830). Worse, every control change calls `setStatus('idle')` (:492-502), and the Results and tutor need `status === 'complete'` (:470). So **trying a second aim hides the Results and the tutor** (and the tutor is keyed to `runCount`, :1142, so each Run restarts it). Under the new rule Parts 3 and 4 must stay once the first Run has finished, and a Part 2 run must not reset them.
- **Start over, not Change prediction: not met.** "Change predictions" (:752-764) keeps the chosen hole and aim and reopens the guesses; it appears only after the first Run. Replace with an always-visible "Start over" (greyed until there is something to clear and while a run plays) that clears guesses, runs, results and the tutor.
- **Links and words: not met** (E3). The page has no link at all.
- **A Run must not need a choice that belongs to Part 2: the main design problem, as in Black Holes 3.** Today's Run uses whatever hole and aim the learner picked (default aim 5). The three guesses are about **two different aims**: guess 1 is about a beam at **5** horizon radii; guess 3 is about a beam only a little outside the capture distance (**2.6**); guess 2 is about the capture distance itself (a ring and a graph line, not a beam). One path picture shows one aim. See question 1.

## Verdicts the page gives before the tutor (Rule A, §12)
- The Results contain three "Checking your first/second/third prediction" paragraphs ending "So your prediction was right" or "off this time" (:994-1036). That is the tutor's job (§12, §13); they move out, as in Black Holes 1 to 3, and the Results only tag rows.
- Nothing is drawn before the first Run, so the green critical-aim ring and line (guess 2's answer, 2.598) are not an early reveal today. They must still not appear in the introduction, and the guess marks must wait for the ring and line to be drawn (Rule A, item 4). The title "Can Light Be Trapped?" already hints at capture; it was approved (spec Decision 1).
- The spec's own Decision 9 sentence (the Event Horizon Telescope's dark region "generally described as matching this critical aim") is in the tutor (point 8, :208-212) and was **never checked against a primary source**. It must be read and sourced in Step 2 or dropped. The tutor also says "a spinning black hole captures light in a different circle" (:216), with no source.

## What to draw for the guesses (Rule A, planned)
All three answers live on **one picture, the graph of bend against aim** (Picture 2), and two live on the path picture.
- **Guess 1 (a beam at 5 radii: straight on / bent then escapes / captured):** the answer is the blue curve's height at x = 5 (33.8°). A white marker at x = 5 in a YOUR GUESS box, at a height that follows the answer: low (about 0°) for "straight on", a middle band for "bent", the rose area's edge or a "captured" box for "captured". "Bent noticeably" has no number, so the mark is a marker and the caption says so. On the path picture at aim 5, a white box beside the beam.
- **Guess 2 (how close to be captured: 1 / about 2.6 / about 10 radii):** this has a real position. A white vertical line on the graph at x = 1, 2.6 or 10, and a white ring at that distance on the path picture. The real thing is the green line and green ring. At 10 radii the ring lies outside the zoomed view of a path picture (the view reaches 6.25 radii at aim 5 and 4 radii at aim 2.6), so the page needs the same off-scale arrow used in Black Holes 3.
- **Guess 3 (just outside capture: small bend / swings by more than 180° / captured anyway):** a white marker at x = 2.6 on the graph, in the band that follows the guess: under 180° for "small bend", above 180° (near the top, where the axis stops at 400°) for "swings", inside the rose area for "captured anyway". Marker only. On the path picture at aim 2.6, a white box beside the beam.
- **Where each is drawn only once its feature is drawn:** the guess-2 ring waits for the green ring; the markers wait for the run to finish.

## Rule B, re-read
- Today's Results: one run table (5 to 7 rows), the three verdict paragraphs, worked math, a critical-aim table for the three holes (:1077-1102), the funnel comparison, the "can and cannot tell you" box. No check-up, no "What this table tells us".
- **Real references that exist for a check-up (from the same physics, all computed by the module and its tests):** the exact bend against the simple formula's first term (agreement to about 1.4% at an aim of 100; 8.1% off at 20); the critical aim 3√3 ÷ 2 against the integrated outcomes (captured at 2.598 and below, escaping at 2.61); the circle where light can circle (1.5) against the closest approach at an aim of 2.6 (about 1.53). **No measured value is used in this experiment.** A measured comparison exists in Cosmic Horizons 21 (the EHT ring sizes); it can be named and linked, not recomputed here.
- **UI arithmetic that moves into the module (§9):** `toDegrees`, `formatLarger`, the ratios, the "2.5 / 2 / 2.7 / 10" checks (`checks`, :475-485, with the aims typed again into the sentences at :1012-1016), and literals in the worked math ("√3 is about 1.732", "5.196", "57.3", :1044-1062).
- The "all three black holes" table does not follow the controls (it is the same number of radii for each hole); the controls change only the km in the readout and one table. See question 7 on a settings table.

## What an update would touch
`LightNearBlackHoleExperiment.tsx` split into `...Intro.tsx`, `...Pictures.tsx`, `...Results.tsx` (as for Black Holes 1 to 3) plus the tutor; the module and its tests (guess marks and their marking, the fixed Part 1 runs at aims 5 and 2.6, the check-up rows, comparisons now done in the UI); new render tests; the specification's Audit Update; `DEVELOPMENT-STATE.md`; `docs/audit/PROGRESS.md`. **A protection:** `blackHoleShadow.ts` (Cosmic Horizons 21) imports `CRITICAL_AIM_IN_HORIZON_RADII` from this module, and the Spinning, Seeing the Fall, Colour of the Fall, Falling In and Formation tests mention it, so the existing exports and values must not change (new functions only). Size: **Medium to Large** (Medium by the first report; Large for the four Parts, the two-panel Part 1 and the rich content below).

## Content for a favourite topic (all of it is the owner's to approve, §28.1)
What exists today: a long text-only introduction (about 110 lines), two drawn pictures, no images, no links, no real-world grounding beyond one unsourced tutor sentence. The project holds seven licensed images in `public/images/black-holes/`, including the EHT pictures of M87* and Sgr A* (`m87-eht-eso1907a.jpg`, `sgra-eht-eso2208.jpg`) and a labelled NASA visualisation (`nasa-black-hole-visualization-labeled.jpg`; I have not yet checked whether it shows the ring of circling light). Proposed as a menu to accept or cut (each fact only if a page is read; nothing is read yet for this experiment):
1. **A fuller introduction with sub-headings:** light and gravity in everyday words (the bending from Gravity 8), what an "aim distance" is (the ball and the post, kept), what a bend of 0° and 180° mean (kept). Held back until after the first Run (§12): the value 2.598, the 1.5 circle, "swings round", the capture circle being wider than the hole, and how much bigger the bend is than the simple formula says.
2. **Real-world grounding, only from pages read:** the Event Horizon Telescope pictures of M87* (2019) and Sagittarius A* (2022) and what their rings and dark middles are (this is the page's best link to the real sky). Cosmic Horizons 21 already works the sizes; the introduction would point to it by its learner number (21 in the spec numbering is the learner's 20, see CLAUDE.md §27: **to be checked before any text names it**). Marked as outside what the experiment models.
3. **Images:** the two EHT pictures from the project, and one own labelled drawing of "no gravity: a straight line; weak gravity: a small bend; very close: a swing round". No new official image unless a licence is read.
4. **A "Recent news" block** only from read pages (for example the EHT's newer M87* results), otherwise a dated "Real black-hole pictures" block and a recorded gap.
5. **A "Want to know more?" list:** NASA, ESA or ESO plain pages on gravitational lensing and on black hole images; the EHT's own release pages; original papers where read (EHT papers I and IV for the ring; for the light equation, a standard text only if it can be fetched). Each fetched and read first; gaps recorded under §29 rule 3(c) as "no plain official page found" with the date.
6. **A "Words and formulas" box (collapsed):** aim distance, bend, captured, horizon, horizon radius, astronomical unit, exact theory of gravity, radian, the simple formula 2 ÷ b with a worked example at aim 20, and (only after the first Run) the critical aim 3√3 ÷ 2 and the photon sphere.

## Questions for the owner (default first)
1. **One Run, three guesses about two different aims: what does Part 1 show?** Default: **one Run that plays two path pictures side by side**, a beam aimed at **5** radii (guess 1) and one aimed at **2.6** (guess 3), both on the 10-Sun black hole and the same scale rule as today, plus the graph with all three marks (guess 2's line and ring included). Part 2 then lets the learner try any hole and aim (any aim, including captured ones, in a third picture). Alternatives: (a) one path picture at 2.6 only, with guess 1 drawn on the graph at x = 5 and no beam shown; (b) two runs with choice buttons and one Run (the owner's rule for several runs), which lengthens Part 1.
2. **Which black hole does Part 1 use?** Default: the 10-Sun black hole (as in Black Holes 1 to 3). The path in horizon radii is identical for all three holes; only the kilometres change.
3. **Verdicts out of the Results:** the three "right / off this time" paragraphs move to the tutor's explanation; the Results only tag the rows. Default: yes.
4. **A guess that falls off the picture's scale** (guess 2 at 10 radii; the views reach 6.25 and 4 radii). Default: an arrow at the edge labelled "your guess: 10 radii, off this view" on the path pictures, and the line itself on the graph (whose axis reaches 20). Alternative: widen Part 1's views to 10 radii (which makes the paths small).
5. **How the outcome-type guesses (1 and 3) are drawn on the graph:** default: a white marker in a YOUR GUESS box at the guess's band (rows above), the caption saying it is only a marker. Alternative: a box beside the graph with no position.
6. **Real-world grounding, images and recent news.** Default: the EHT M87* and Sgr A* pictures from the project, only from pages read in Step 2, each marked as outside the model; the tutor's EHT sentence either sourced or removed; every gap recorded.
7. **A table that follows the controls.** The controls only move marks in the pictures and the km in the readout. Default: no settings table (as Experiment 14 did); keep the three-hole critical-aim table as an ordinary Results table.
8. **A check-up of the exact bend against 2 ÷ b, of the critical aim against the integrated outcomes, and of the closest approach against 1.5.** Default: yes, in the words "the same", "close" and "more" with no cut-offs; no measured numbers.
9. **The funnel comparison.** Default: keep it in the Results and the tutor only, after the first Run, labelled an analogy (spec Decision 10).
10. **"Black Holes 4" heading and cross-references.** Default: yes, as for Black Holes 1 to 3; the three guess wordings stay exactly as approved (2026-10-11).
11. **The "What you learned" box staying after Start over for a chapter already completed** (open since Black Holes 2). Default: leave as the app's existing behaviour; decide once for all chapters.

## Not checked in this re-read
Not run in a browser. The physics test file was run (30 pass) but not read line by line today. No link was fetched; no source was read for any real-world claim. The caption of Picture 2 and the Results' wording were judged from the text. Whether Cosmic Horizons 21's learner number is 20 was inferred from CLAUDE.md §27 and not looked up.
