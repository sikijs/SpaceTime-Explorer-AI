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
