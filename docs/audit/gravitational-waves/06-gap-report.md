# Gap report: Gravitational Waves Experiment 6 (Triangulation)
Date: 2026-11-02 | Specification: docs/experiments/gravitational-waves/06-triangulation.md | Components: src/components/GravitationalWaveTriangulationExperiment.tsx, GravitationalWaveTriangulationTutor.tsx | Physics module: src/physics/gravitationalWaveTriangulationExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three detectors on a schematic map light up in order of arrival for one of three directions; two illustrative wedges sweep in afterwards. Two predictions (first detector; same instant or different). It has the best caption in the group ("How to read this diagram", :487-517) but no worked moment, no look-for items in three parts, no reading guide, no marks. The first prediction is asked before the direction is chosen, so it cannot be answered from the drawing. Results and the checks say "right" / "off this time". Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Which detector will the wave reach first? (:291-293) | Hanford / Livingston / Virgo (:50-51); `firstDetectorPrediction`, `submittedFirstDetectorPrediction` (:71-75) | The three detector dots and their flash order (:419-436). The answer depends on the Direction A/B/C chosen **afterwards** (:359-372), so the guess has no direction to be judged against |
| 2 | Same instant or measurably different times? (:308-311) | same / different (:53-57); `timingPrediction` (:72,:75) | The size of the gaps between flashes; gaps are only in a text list in Results (:537-545). Nearest picture: the map; add a timeline panel with three ticks on a millisecond scale |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | None |
| A1 | Met | `arrivalOrderFor(preset.directionDegrees)` (:81); predictions only used for text (:527-528) | None |
| A2 | Not met | No white mark or "YOUR GUESS" box (:389-485) | Q1: a white ring on the guessed detector; Q2: a marker on a new timeline |
| A3 | Partly | Q1 follows the guess (it picks one of three dots); Q2 is a marker | Caption note for Q2 |
| A4 | Not met | n/a | Q1 mark can show at once; Q2 mark only once the timeline exists |
| A5 | Not met for Q2 | See table | New timeline panel in the same picture |
| A6 | Not met | No source line. The page says positions are "schematic" (:283-285) and the wedges "sketches, not exact calculations" (:501-502), but no line separates calculated (arrival times) from imagined (wedges) | Add the three-part line |
| A7 | Not met | Intro (:230-288) has no mention of guess marks | New text; a note beside the Direction buttons |
| A8 | Partly met | Module has `arrivalTimeSeconds`, `arrivalOrderFor`, `DETECTORS`, `DIRECTION_PRESETS` with 6 tests. The truth is computed in the component: `actualTiming = maxGapMs < 0.01 ? 'same' : 'different'` (:526) and `firstDetectorMatched` (:527-528) | Module function for the first detector and timing class, with tests |
| A9 | Not met | Tutor compare states the actual first detector and the gap (GravitationalWaveTriangulationTutor.tsx:66); Results says "so your prediction was right / off this time" (:559-572) | Newer rule: verdicts only in the tutor explanation |
| A10 | Not met | No sentence says guesses do not change results; "Change predictions" (:337-357) | Report only |

## Rule B
- B0: One Results block (:519-582): list of arrival gaps (ms), a "What this means" paragraph, two "Checking your prediction" paragraphs, and a closing note. No tables (an ordered list only).
- B1: Real reference: Hanford to Livingston about 3,000 km, so a maximum gap of about 10 ms (:257-261); the Hanford/Livingston/Virgo geometry is schematic. A check-up comparing each gap with the pair's separation / c is possible, but its reference is a bound, not a measured gap.
- B2: Partly met. "What this means" (:546-554) says what the order tells us, but with no tie to real numbers beyond the gap.
- B3: N/A (direction presets only move the drawing).
- B4: Partly met. Guess beside the real result with a verdict ("right", "off").
- B5: Not met. `maxGapMs`, `lastDetector` computed in the component (:523-525).

## Rule C
- C1: Partly met. Detectors named, arrow labelled "wave arrives from here", wedges labelled "possible directions (A)/(B)" after the reveal (:415,:431-433,:470-480). The wedges have no on-canvas ms label.
- C2: Met. Directions change the arrow, order and gaps.
- C3: Met. "How to read this diagram" (:487-517).
- C4: Partly met. Covers dots, arrow, wedges, overlap. Does not explain the dot colour change in terms of the time order, nor the 5-second slow-down (:36-41, a note only in assumptions :286).
- C5: Partly met. A worked example (3,000 km / 300,000 km/s = 10 ms) is in the intro (:257-262), not under the picture.
- C6: Not met. No Look at / What it means / Why it matters list.
- C7: Partly met. Intro "What happens here" says the wave reaches the closest detector first, and says gaps are "only a few milliseconds" (:254-262): this gives Prediction 2's answer ("measurably different") and the principle behind Prediction 1 before the learner predicts (§12).
- C8: Mostly met. The shout analogy and "milliseconds" are explained; "wavefront" is used (:281) and "triangulation" is named in the title with no plain definition before the question.

## Other findings
- O1: The specification's header says the full wording approval is "not yet done" (docs/experiments/gravitational-waves/06-triangulation.md:3); `CLAUDE.md` lists it as approved 2026-10-13. Spec header looks stale.
- O2: (a) Prediction 1 is asked before direction is picked (see A0). (b) The wedges are hand-offset around the known answer (Component :200-207), so they are an illustration; the page says so. (c) Virgo's schematic position (4740, 7295.4 km, physics file) gives a larger spread than the real network; the page says positions are approximate. (d) "Hanford and Livingston are about 3,000 km apart" has no source link. (e) The tutor's reference to "invariant c" (Tutor:115) uses an Experiment 5 (Relativity) term in this chapter.

## What an update would touch, and its size
Component, tutor, module (+ tests), spec. **Size: M** (timeline panel for Q2; a white ring on a detector for Q1; the prediction ordering needs an owner decision).

## Not checked
Not run in a browser. PROJECT.md/AGENTS.md not read in detail. Detector separations not checked against a source.

## Step 1 re-read and additions (2026-11-07)
Re-read of the component (`GravitationalWaveTriangulationExperiment.tsx`, 597 lines), the tutor (135 lines), the module (77 lines: three schematic detectors, three direction presets, `arrivalTimeSeconds`, `arrivalOrderFor`; 6 tests) and the specification against Rule E, the rules the owner added to `CLAUDE.md` on 2026-11-07 and the first report, using the Gravitational Waves 1 to 5 audits as the pattern. Nothing was run in a browser; nothing was changed in the app. Numbers below come from a one-line script that imports the module (not read off the page).

- **E1 to E3 Not met.** One `exp-card` holds the introduction, both predictions, the three direction buttons, Run, the map, the caption, the Results and the "Change predictions" button; the tutor is a second card. There are no Parts, no coloured lines or leads, no "Words and formulas" box and no links.
- **E4 n/a until built.** Part 1's lead must not give the answers; the introduction currently does (first report, C7).
- **E5.** One control (three direction buttons, A, B and C) and one Run. How they map onto the four Parts is the owner's decision (question 2 below).
- **New rule, "Parts 2, 3 and 4 appear after the first Run".** The Results and the tutor already appear after the first run, so that part is met. A Part 2 does not exist yet.
- **New rule, "Links and Words".** Not met. The page needs plain official pages for how a network of detectors finds a direction (and the 3,000 km Hanford to Livingston figure) and for GW170817's sky position, and words for "triangulation", "wavefront", "arrival-time gap" and "millisecond". Step 2 searches for them and fetches each page before any wording is approved; where none is found, §29 rule 3(c) applies.
- **New rule, "Start over, not Change prediction".** Not met: "Change predictions" (:337-357) appears only after a run. It becomes an always-visible "Start over".
- **A0 refined: Prediction 1 cannot be judged against a direction the learner has not chosen.** The question asks "which detector will the wave reach first?" before any direction exists, and the answer depends on the button pressed afterwards. For the three presets the first detector is different each time: Direction A, Virgo (arrivals Virgo 0.00 ms, Livingston 5.80 ms, Hanford 15.81 ms); Direction B, Hanford (0.00, Livingston 3.42, Virgo 28.27); Direction C, Livingston (0.00, Hanford 1.74, Virgo 22.96). Part 1 needs one fixed direction so the guess is about one real run (question 2).
- **A0 refined: Prediction 2 has the same answer for every preset.** The three detectors never register the wave "at essentially the same instant" for any of the three presets (the smallest largest-gap is 15.81 ms, Direction A). So "different" is the answer whichever button is pressed; "same" only occurs for the special case of a direction exactly perpendicular to every pair, which the page does not offer. The guess therefore has a fixed answer, which is fine, but its picture has to show the size of the gaps (a new timeline panel).
- **A5 refined.** The gaps are already computed by `arrivalOrderFor`, so a timeline can be drawn without a run (question 3). Neither guess has a size of its own: Q1 is a choice of one of three dots (a white ring follows the choice, so it is more than a marker); Q2 is a marker only.
- **A8 refined.** The module lacks the first detector and the timing class (`actualTiming = maxGapMs < 0.01 ? 'same' : 'different'` is decided in the component, :526), and the largest gap and its pair; the component computes `maxGapMs` and `lastDetector` itself (:523-525).
- **B1 refined: a real reference exists, but it is a limit, not a prediction.** Every gap is at most the pair's separation divided by c (the module's own Required Physics Test 5): Hanford to Livingston 3,000 km gives 10.01 ms, Hanford to Virgo 8,700 km gives 29.02 ms, Livingston to Virgo 7,500 km gives 25.02 ms. A check-up of three rows ("limit" beside "found, in Part 1's direction") has a real reference. Direction B's Hanford to Virgo gap, 28.27 ms, is within 3 percent of its limit.
- **New finding O8, the separations are the specification's own, unsourced.** "Hanford-Livingston about 3,000 km" is the only separation the first report flagged as unlinked; the other two (8,700 and 7,500 km) have no source on the page either, and they are schematic positions chosen to approximate real ones (the module's header). Step 2 looks for a plain official page that gives them; none is assumed.
- **New finding O9, a phrase belongs to an earlier chapter.** The tutor uses "invariant c" (first report, O2e). It is a Relativity of Time and Motion term and needs a plain meaning here ("the same speed for everyone").
- **New finding O10, the page asks the learner to watch a slowed-down run.** The 5-second playback (:36-41) stretches a 15.81 ms difference over 5 seconds; this is a presentation choice (§11) that the first report found only in the assumptions. The caption should say so once, with the real numbers.
- **New finding O11, the wedges are hand-offset around the known answer.** The two "possible directions" wedges (:200-207) are centred near the chosen direction and offset from it, not computed. The page already calls them an illustration. Under rule 6 of the new standard ("Where the real picture comes from") they are "imagined for the question", separate from the calculated arrival times. They are drawn only after the run, so they do not reveal the first guess's answer early.

### Questions for the owner (before wording is drafted)
1. **Which gaps to fix?** All of the first report's (marks for both guesses, a timeline panel, a source line separating calculated from imagined, the introduction and control notes, a real caption with a worked moment and Look at / What it means / Why it matters, module functions for the first detector and the timing class, the tutor and Results no longer giving verdicts, the answers removed from the introduction) and, from this re-read, the four Parts, the links and words box and Start over. The agent suggests all.
2. **Part 1's fixed direction, and Part 2.** Part 1 is one Run at one fixed direction, so both guesses are about one real run; Part 2 has the three direction buttons (A, B and C), with the learner's choice marked in pink. The agent suggests **Direction A** for Part 1 (the current default: Virgo first, gaps 5.80 and 15.81 ms), because it is the one where a learner who expects "Hanford, the first one in the list" is wrong. Which direction?
3. **The second picture.** A new timeline panel under the map in the same picture, on its own fixed scale of 0 to 30 ms (the largest gap among the three directions is 28.27 ms), with three ticks, one per detector, drawn when the run has finished. The guess marks: for Q1 a white ring round the guessed detector on the map (drawn from the start, since the detectors are always drawn), with a box "YOUR GUESS: Hanford first"; for Q2 a white box "YOUR GUESS: all at the same instant" (or "at different times") joined by a line to the timeline's label, a marker only (it carries no size, so the caption says so). OK?
4. **Check-up and table for the learner's direction.** The agent suggests a three-row check-up (the limit, separation ÷ c, beside the gap found in Part 1's direction, with a plain reading such as "less than the limit") and one table for Part 2's direction (the three gaps, the order, beside Part 1's, with "How yours compares" saying only "the same", "more" or "less"), because the gaps differ a lot between directions and the picture alone shows them only as dots. Include both?
5. **The wedges.** Keep them as a clearly labelled illustration ("imagined for the question", not computed), with the caption saying so and showing no numbers on them. The agent suggests keeping them as they are, since replacing them with a computed region would be new physics outside this audit. OK?
6. **Answers in the introduction and the Results.** Remove the lines that give the principle behind Prediction 1 and the size of the gaps ("only a few milliseconds"; the 3,000 km ÷ c = 10 ms worked example) from the introduction and move the worked example under the picture, shown after the run; Results lose "right / off this time". Same rule as Gravitational Waves 1 to 5. OK?

## Not checked (this re-read)
Not run in a browser. The arrival times and separations quoted are from a script that imports the module, not read off the page. No source page has been searched or fetched yet; the three separations are not checked against any source.
