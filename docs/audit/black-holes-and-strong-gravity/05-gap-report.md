# Gap report: Black Holes and Strong Gravity Experiment 5 (Falling In: What Does the Traveler Experience?)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/05-falling-in.md | Components: src/components/FallingInExperiment.tsx, FallingInTutor.tsx | Physics module: src/physics/fallingInExperiment.ts (+ .test.ts, 28 cases) | Status: read-only, nothing changed

## Summary
Three predictions, three pictures (a side view of the fall with two clocks and the stretch; a graph of the gap against each clock; a graph of the stretch against distance for all three black holes), each with a numbered "How to read" caption; a Results part with a main table, a three-hole table, three text prediction checks and two worked calculations; a tutor. Gaps: no guess marks, no source lines, no check-up or table notes, no three-part "what to look for" (item 6 "What to watch" is one sentence). Both graphs can carry the guesses. Size: **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Does the trip to the horizon come to an end on the traveler's own watch? (FallingInExperiment.tsx:~800-830) | finite / never / depends on the black hole (:62-67); `endPrediction` locked as `submittedEnd` (:630-634) | TimeGraph: the blue curve reaching the rose strip (the horizon); the clock readout under the fall picture |
| 2 | What does the far-away clock read as the traveler nears the horizon? | about the same / somewhat more then settles / later and later without limit (:69-74); `farClockPrediction` | TimeGraph: the orange curve (it keeps running to the cutoff 0.0001 radii) |
| 3 | How does the stretching at the horizon compare between a 10-Sun hole and Sagittarius A*? | much stronger at the small one / about the same / much stronger at the giant one (:76-81); `stretchPrediction` | StretchGraph: the curves of the three holes at the left edge (horizon) |

## Rule A
| Item | Result | Evidence | Gap / what is needed |
|---|---|---|---|
| A0 | Met | :589-591 | Listed |
| A1 | Met | `runFallingInExperiment`, `stretchCurve`; prediction state only picks wording in :1106-1150 | None |
| A2 | Not met | no mark in FallPanel (:191), TimeGraph (:356) or StretchGraph (:480) | White YOUR GUESS marks: P3 at the horizon end of the stretch curves (small vs giant); P1 and P2 on TimeGraph |
| A3 | Not met | | P3 has a position (which curve is higher); P1 (yes/no) and P2 (3 shapes) are markers, caption must say so |
| A4 | Not met | both graphs are drawn from the first frame (TimeGraph's orange curve is drawn as the run plays) | The mark for P2 should wait for the orange curve to be drawn |
| A5 | Met in principle | all three answers have a picture | None |
| A6 | Not met | no source line under any picture (:964-1060) | Needed: worked out here from the exact-theory equations; the stretch uses the weak-field formula 2GMh/r³ stated as given (:1176); nothing measured |
| A7 | Not met | intro (:686-800) says nothing of predictions not changing pictures, white marks or controls | Add; add a note by the black hole and release-distance controls |
| A8 | Not met | module has `travelerClock`, `travelerClockSteps`, `farAwayClock`, `stretchInG`, `stretchInMetersPerSecondSquared`, `runFallingInExperiment`, `stretchCurve` | Missing: guess to graph position mapping and tests |
| A9 | Partly | Tutor observe/compare (FallingInTutor.tsx:~114-117): observe points to the clocks; compare restates guesses; explained step does not mark them | Tutor must name marks and mark each prediction |
| A10 | Not met as such | no "predictions do not change" sentence found; "locked in" wording only | n/a |

## Rule B
- B0 tables today: main Results table of 5 rows (:1072-1100): traveler's clock at the horizon, far-away clock near the horizon, stretch at release, stretch at horizon, where the stretch reaches 1 g; "three black holes" table (:1203); three prediction checks (:1106-1150); two worked calculations (:1152-1200); rubber-band comparison (:1231); "can and cannot tell you" box (:1248).
- B1 Not met. Reference: same-theory checks only (the traveler's trip is a finite and the same number of light-times for every black hole; the weak-field stretch formula). No measurement of a fall exists. A check-up could set "traveler's clock: finite" against "far-away clock: no limit" as two readings of one fall.
- B2 Not met: no "What this table tells us"; the prose after the check paragraphs partly explains.
- B3 N/A: the controls pick a hole and release distance.
- B4 Partly: guesses repeated in text with verdicts ("So your prediction was right / off this time", :1117-1149); no tag on rows; not drawn.
- B5 Partly: table numbers come from the module. UI literals: "it reads about 2.3 light-times more" (:1129) is typed text; `formatBig(holes[0]... / holes[1]...)` and `stretchGrowth` (start^3) are computed in the UI.

## Rule C
- C1 Met (read): the fall picture labels the black hole, horizon, release bar ("released here (at rest)"), the traveler dot, two clocks, stretch and scale; TimeGraph and StretchGraph have labelled axes and curves.
- C2 Met: blue versus orange clock; curves differ per black hole; thick curve for the chosen one.
- C3 Met: three captions (:969, :1015, :1042).
- C4 Mostly met: numbered items with every element, units g and light-time defined (intro :733-757 and caption items 3 and 4, with "3 g" example), log scales explained. No ordering description of the 8-second run.
- C5 Partly: one worked unit (the "3 g" example, :993) and the horizon light-time example in the intro (30 km ÷ 300,000 km/s); no run-based worked moment in captions.
- C6 Not met: caption item 6 "What to watch" (:998) is one sentence; the two graph captions have none; no Look at / Means / Why.
- C7 Partly: the intro says "The experiment ends at the horizon" (:~712) and the graph caption says "A curve that reaches the strip has reached the horizon" (:1029), which sit close to Prediction 1's answer (finite). The intro's "with the pull on you growing stronger at every step" (:~703) hints at the stretch. The captions only show after lock-in; the intro is read before.
- C8 Met: horizon radius, horizon light-time, stretch, g, far-away clock and AU are defined in the word list before use (:733-757).

## Other findings
- O1: none against the spec found in the parts read.
- O2: verdict sentences in the Results are the older-rule form.
- O2: the intro hint noted under C7 (possible §12 point; for the owner).
- O2: the rubber-band comparison (:1231) is labelled as an analogy; no source. The stretch for the "2-meter body" uses a weak-field formula ("given, not derived", :1176), labelled.

## What an update would touch, and its size (O3, O4)
FallingInExperiment.tsx (marks in TimeGraph and StretchGraph, source lines, check-up, notes, caption look-for items, intro and control notes), FallingInTutor.tsx, physics/fallingInExperiment.ts and .test.ts, specification. Size: **Medium**.

## Not checked
Not run in a browser; the three SVG components were read by their labels and captions, not every drawing attribute. Tutor's explained step not read line by line. Intro lines quoted at "~" were located by reading, line numbers approximate. Links: none on this page.

---

# Re-read of 2026-11-17 (against Rule E, the 2026-11-07 rules, and the owner's request for rich Black Holes pages)
Status: read-only; nothing in the app, tests or specification changed. The findings above still stand; the new findings are below. Line numbers are from `FallingInExperiment.tsx` as read today (1,277 lines; tutor 220; module 200; 317 test lines, 28 tests, run today: all pass). The page was not opened in a browser for this re-read. Four later modules (Seeing the Fall, Spinning, Colour of the Fall, Formation) are mentioned by this module's test file or import from it in tests, so existing exports and values must not change (new functions only).

## Rule E (the page in four Parts): not met
| Item | Result | Evidence | Gap |
|---|---|---|---|
| E1 | Not met | One long card: introduction (:686-799), three predictions (:802-867), controls and Run (:891-943), three pictures with captions (:946-1059), Results (:1061-1260), tutor (:1266) | Split into Part 1 (predict, then watch), Part 2 (black-hole and release-distance controls and the drawings that follow them), Part 3 (results), Part 4 (tutor) |
| E2 | Not met | No Part headings, colours or leads | Four leads to draft; Part 1's gives no answers |
| E3 | Not met | No "Want to know more?" list, no "Words and formulas" box (the words are a paragraph, :732-757) | Both go above Part 1 with no heading |
| E4, E5 | n/a yet | | One experiment, no sub-parts |

## The 2026-11-07 rules
- **Parts 2, 3 and 4 appear after the first Run: not met in a way that matters.** The controls are on screen from the start, disabled (:898, :916, :933). Worse, every control change calls `setStatus('idle')` (:617-627), and the Results and tutor need `status === 'complete'` (:600). So **trying a second black hole or release distance hides the Results and the tutor**, and the tutor is keyed to `runCount` (:1268), so every Run restarts it. Under the new rule Parts 3 and 4 stay once the first Run has finished.
- **Start over, not Change prediction: not met.** "Change predictions" (:875-887) keeps the chosen hole and release distance, reopens the guesses, and appears only after the first Run. Replace with an always-visible "Start over".
- **Links and words: not met** (E3). No link on the page.
- **A Run must not need a choice that belongs to Part 2: a milder form of the Black Holes 3 and 4 problem.** Today's Run uses whatever hole and release distance the learner picked (default 10-Sun, 10 radii). Guesses 1 and 2 are about a fall (the same in horizon radii for every hole; only the seconds differ). Guess 3 compares the 10-Sun hole with Sagittarius A*, which needs two holes on one picture. **Picture 3 already draws all three holes' stretch curves**, so one fixed Part 1 fall on the 10-Sun hole is enough, with no second picture pair. See question 1.

## Findings that are new
- **A white dot that is not a guess (Rule A, §14):** Picture 3 draws "the traveler, now" as a **white** dot (:570-573). White always means the learner's guess, so the dot changes colour (cyan, the traveler's colour, as in Picture 1) before any white guess mark is added.
- **Verdicts before the tutor (§12, §13):** the Results end three paragraphs with "So your prediction was right" or "off this time" (:1115-1149). They move into the tutor's explanation, as in Black Holes 1 to 4.
- **Early hints in the introduction (the first report's C7, re-read):** "with the pull on you growing stronger at every step" (:702-703) points at the stretching, which guess 3 is about; step 5 says "The experiment ends at the horizon" (:722), beside guess 1's question "does the trip to the horizon come to an end". The second is part of the setup (the model stops at the horizon) and the question names the horizon itself, so I treat it as setup; the first is a hint and is a decision for the owner (question 5).
- **Callouts drawn from the first frame:** Picture 2's labels "traveler's clock: reaches the horizon here" and "far-away clock: keeps going, with no limit" (:437-453) and the whole orange curve are drawn as soon as the run starts (the guesses are already locked then). The white marks wait until the run has finished, and each caption's look-for item for a feature appears only once it is drawn.
- **The introduction and Results state two things without a source (the specification's Decision 8 and 12):** "far more than any body could survive" (tutor point 6, :188-190) and "far more" survival claims are general knowledge, not read from a page; "about 276 horizon radii" is the module's number and is fine. A gap for Step 2.
- **UI arithmetic that moves into the module (§9):** `stretchGrowth = horizon ÷ start` and `formatBig(holes[0] ÷ holes[1])` (:606, :1142), `nearHorizon` clock readings (:607-610, from module functions but assembled in the UI), "about 2.3 light-times" typed in the Results (:1127) and the tutor, and the worked-math literal "9.81" (:1191).

## What to draw for the guesses (Rule A, planned)
- **Guess 1 (does the trip end on the traveler's own watch: finite / never / depends):** an outcome, so a marker. On Picture 2 (the gap against time), a white YOUR GUESS box joined to the blue curve at its end on the rose strip ("finite: reaches the horizon"), an arrow pointing past the right-hand edge of the graph for "never", and a box beside the strip for "depends". The caption says it is a marker only.
- **Guess 2 (what the far-away clock reads: about the same / somewhat more then settles / later and later without limit):** a marker box joined to the orange curve's end ("without limit"), or to the gap between the blue and orange curves ("about the same", "settles"). The real orange curve and its callout stay as they are. I do not draw a guessed curve, because its length would need a number the learner did not give (question 3).
- **Guess 3 (stretching at the horizon: stronger at the 10-Sun hole / about the same / stronger at Sagittarius A*):** a position on Picture 3. A white pointer at the left (horizon) edge to the 10-Sun curve, to the Sagittarius A* curve, or a bracket joining both with "≈". The real curves are 11 powers of ten apart there (2.1 × 10⁷ g and 1.1 × 10⁻⁴ g), so the pointer follows the guess and the gap speaks for itself.
- **Marks wait for their features:** drawn only once the run has finished and the curves and callouts are drawn.

## Rule B, re-read
- Today's Results: one run table of 5 rows, three verdict paragraphs, two worked calculations, a three-hole table, the rubber-band comparison, the "can and cannot tell you" box. No check-up, no "What this table tells us".
- **Real references that exist (all from the same theory, tested):** the traveler's clock at the horizon against its closed form ½ r0^1.5 (η + sin η) (the test file integrates the equation separately); the far-away clock's growth of ln 10 ≈ 2.303 light-times for each tenfold closing of the gap (module test 5); the stretch 2GMh ÷ r³ written from G and M against the module's c²-form; the ratio of the stretch between two holes against (mass ratio)². **No measurement of a fall exists to compare with.** Whether a real measurement of tidal stretching near a black hole can be read from an official page (a tidal disruption event) is for Step 2.
- No settings table (the controls only move marks and the kilometers and seconds).

## What an update would touch
`FallingInExperiment.tsx` split into `...Intro.tsx`, `...Pictures.tsx`, `...Results.tsx` (as for Black Holes 1 to 4) plus the tutor; the module and its tests (guess marks and their marking, the fixed Part 1 run, the check-up rows, the comparisons now done in the UI); new render tests; the specification's Audit Update; `DEVELOPMENT-STATE.md`; `docs/audit/PROGRESS.md`. Existing exports and values must not change. Size: **Medium to Large** (Medium by the first report; Large for the four Parts and the rich content below).

## Content for a favourite topic (all of it is the owner's to approve, §28.1)
What exists today: a long text-only introduction (about 110 lines), three drawn pictures, no images, no links, no real-world grounding at all (the specification's Decision 9 allowed none). Proposed as a menu to accept or cut (each fact only if a page is read; nothing is read yet for this experiment):
1. **A fuller introduction with sub-headings and two drawings made for the page:** (a) "two watches", the traveler's wrist watch and a friend's clock far away (no answer drawn); (b) "why the feet are pulled harder than the head" (two arrows of different length on a body falling feet first, not to scale, no black-hole numbers). Held back until after the first Run (§12): that the far-away clock never settles, the size of the stretch and that it depends on the hole.
2. **Real-world grounding, only from pages read:** real things pulled apart and swallowed by black holes: a star torn apart by a supermassive black hole (a tidal disruption event; NASA and ESA pages), and a gas cloud's passage close to Sagittarius A* (ESO). Marked as outside what this experiment models (it stops at the horizon and follows one small traveler). Because these describe being stretched, they appear **after the first Run**.
3. **Images:** only a real image whose licence is read (as ESA/Hubble's was for Black Holes 4); the EHT pictures are already in the project and add nothing to this topic.
4. **A "Recent news" block** only from read pages, otherwise a dated block and a recorded gap.
5. **A "Want to know more?" list:** NASA, ESA and ESO plain pages on event horizons, tides and tidal disruption events; the original papers where read; gaps recorded under §29 rule 3(c).
6. **A "Words and formulas" box (collapsed):** traveler's clock, far-away clock, horizon light-time, stretch, g, horizon, horizon radius, exact theory, astronomical unit, the stretch formula 2GMh ÷ r³ with a worked example, and (after the first Run only) the closed form for the traveler's clock and ln 10 per tenfold gap, which give guesses 1 and 2 away.

## Questions for the owner (default first)
1. **What does Part 1 show?** Default: **one Run, one fall**: the 10-Sun black hole, released from rest at 10 horizon radii (the specification's reference fall, 49 light-times, 4.8 thousandths of a second), 8 seconds, with Picture 1 (the fall, two clocks and the stretch), Picture 2 (the gap against each clock) and Picture 3 (the stretch against distance for all three holes, which carries guess 3). Part 2 then lets the learner pick any hole and release distance (100, 20, 10, 5, 2). Alternatives: (a) Sagittarius A* in Part 1 (a 35-minute fall); (b) two falls in Part 1.
2. **Verdicts out of the Results:** the three "right / off this time" paragraphs move to the tutor's explanation; the Results only tag rows. Default: yes.
3. **How the guesses are drawn.** Default: markers in white YOUR GUESS boxes: guess 1 at the blue curve's end, guess 2 at the orange curve's end, guess 3 a pointer at the horizon edge of Picture 3; no guessed curves are drawn. Alternative: for guess 2, draw a white dashed curve for each choice (which would need a length for "somewhat more, then settles" that the learner did not give).
4. **The white "traveler, now" dot in Picture 3** changes to the traveler's cyan, because white is reserved for guesses. Default: yes.
5. **The intro's "with the pull on you growing stronger at every step".** Default: remove it (it points at the stretching); keep step 5 "The experiment ends at the horizon" as setup. Alternative: remove both.
6. **Real-world grounding, images and recent news.** Default: tidal disruption events and Sagittarius A*'s gas cloud, only from pages read in Step 2, after the first Run, each marked as outside the model; the survival claim "far more than any body could survive" is dropped or sourced; "spaghettification" is named once in the real-world block only if a page I read uses it; no new image unless its licence is read.
7. **Two drawings for the introduction** ("two watches" and "why the feet are pulled harder"). Default: yes.
8. **A check-up** of the traveler's clock against its closed form, the far-away clock's growth against ln 10, the stretch against G·M, and the stretch ratio against (mass ratio)². Default: yes, in the words "the same" with the gap; no measured numbers.
9. **The three-hole table** stays as an ordinary Results table fixed at the Part 1 release distance (10 radii), with a note; no settings table. Default: yes.
10. **The rubber-band comparison.** Default: keep it in the Results and the tutor after the first Run, labelled an analogy (specification Decision 9); the "no comparison for the clocks" decision stands.
11. **"Black Holes 5" heading and cross-references;** the three guess wordings stay exactly as approved (2026-10-11). Default: yes.
12. **The "What you learned" box staying after Start over for a chapter already completed** (open since Black Holes 2). Default: leave as the app's existing behaviour; decide once for all chapters.
13. **Seeing the fall (Black Holes 6) is next.** Default: this page does not say what an observer sees (the specification already excludes it) and the real-world block does not preview it.

## Not checked in this re-read
Not run in a browser. The physics test file was run (28 pass) but not read line by line today. No link was fetched and no source read for any real-world claim. The captions and the Results wording were judged from the text. The tutor was read; the first report's remark that its explanation does not mark the guesses stands.
