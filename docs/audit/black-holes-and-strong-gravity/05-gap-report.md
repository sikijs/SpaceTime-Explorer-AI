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
