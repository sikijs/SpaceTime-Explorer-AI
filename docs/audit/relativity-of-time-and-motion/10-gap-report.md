# Gap report: Relativity of Time and Motion Experiment 10 (The Twin Paradox)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/10-twin-paradox.md | Components: src/components/Experiment10.tsx, Experiment10Tutor.tsx | Physics module: src/physics/twinParadoxExperiment.ts (+ .test.ts, 6 tests) | Status: read-only, nothing changed

## Summary
No picture at all: a text introduction, speed buttons, one prediction, a CALCULATE button, a plain results list and a tutor. Older rule. **Most serious finding of the group: the results and tutor state the wrong actual outcome (see O2).** Other gaps: no diagram (so nothing to carry a guess or labels), no reading guide, no caption. Size: **Large** (a new picture or panel is needed for the guess; plus the fault fix).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | When reunited: same age, Earth twin older, or traveling twin older? (Experiment10.tsx:187-212) | sameAge / earthOlder / travelerOlder; `predictionOutcome` -> `submittedOutcome` (:53-54,:66) | No picture exists. Nearest: add a panel comparing the two clock readings (Earth twin's and traveler's elapsed time) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Partly met | Numbers come from `runTwinParadoxExperiment` (:70). But the "actual outcome" does not: `actualOutcome()` is hard-coded (:21-23) and ignores the result | See O2 |
| A2 | Not met | No picture | New panel: two bars (Earth twin / traveling twin) on one scale from the module's elapsed times, white marker at the guessed ordering with a "YOUR GUESS" box |
| A3 | Not met | n/a | "Same age" and "older/younger" have no size; marker only, caption must say so |
| A4 | Not met | n/a | Mark only after the bars are drawn |
| A5 | Not met (needed) | Predicted quantity (who is older) has no picture | Add the two-bar panel as its own half with its own title; do not add a separate picture |
| A6 | Not met | no picture | "Where the real picture comes from": calculated here from Experiment 3's time dilation; imagined trip; nothing measured |
| A7 | Not met | Introduction (:121-123) says only to predict; no statement about marks or results | New sentences; speed control note (:155-190) |
| A8 | Not met | Module returns lab and traveler elapsed times and ageDifference; missing: which twin is older (derived), guess-bar positions, and tests that cover the outcome shown to the learner | Add + tests |
| A9 | Partly met | Compare step states guess and actual (Experiment10Tutor.tsx:61) before the explanation; contradicts the explanation (O2) | Point to marks; mark in the explanation only |
| A10 | Not met | No "not scored" or "do not change the results" sentence anywhere in Experiment10.tsx or its tutor | Record as current state |

## Rule B
- B0: Results (:241-285): speed, one-way distance, Earth twin's elapsed time, traveling twin's elapsed time, age difference, time dilation factor, "Your prediction" (guess and "It is actually").
- B1: Not met. Real reference: the elapsed times follow Experiment 3's formula (`travelerElapsedTime` test :9). Internal only; no published value.
- B2: Not met. No notes; "Time dilation factor" (:262) is shown with no definition here (defined in Experiment 3 as "how much slower the moving clock runs", Experiment3.tsx:465).
- B3: N/A.
- B4: Partly met (:268-280): text only.
- B5: Not met.

## Rule C
- C1/C2/C3/C4/C5/C6: **N/A / Not met** because there is no diagram or caption. Whether a picture is to be added is the owner's decision; the specification lists a spacetime-diagram companion as a "candidate, not approved" (10-twin-paradox.md:171).
- C7: Partly met. The introduction says "the traveling twin's clock is the one that's moving, so they come back younger" (Experiment10.tsx:95-96) before the prediction, which states the answer, then argues against it (§12 concern, report only).
- C8: Partly met. "Acceleration" is defined (:104-110); "time dilation factor" and "light-seconds" (:155-158,:253) rely on earlier experiments; "Earth twin" and "turnaround" are plain.

## Other findings
- **O1/O2 (serious): wrong actual outcome shown.** `actualOutcome()` returns `'travelerOlder'` (Experiment10.tsx:22). The label for that choice is "The traveling twin is older" (:16). The results panel therefore says "It is actually: the traveling twin is older" (:272-276) and the tutor's compare step says "It is actually the traveling twin is older" (Experiment10Tutor.tsx:61), while the physics (`ageDifference = lab - traveler > 0`, test "the traveling twin is always younger", twinParadoxExperiment.test.ts:27) and the tutor's own explanation ("The traveling twin really is younger", Experiment10Tutor.tsx step 1) say the opposite. The comment at :19 says the traveler is younger, so the intended value was probably `'earthOlder'`. Present since the first commit (ddb678c). No test covers it. Report only; the owner decides.
- O1: Specification header says the owner's wording approval "has not yet been done" (10-twin-paradox.md:5); CLAUDE.md says approved 2026-10-13. Spec header looks stale.
- O2: The 'outcome' helper bypasses the physics module (§9); the "CALCULATE" is instant, with no run and no picture. The introduction's turnaround is "instantaneous"; the learner is not told that the Earth twin's speed is zero in frame terms beyond the tutor.

## What an update would touch
Experiment10.tsx, Experiment10Tutor.tsx, twinParadoxExperiment.ts and .test.ts, the specification (and any new picture file). **Large**.

## Not checked
Rendering; browser behaviour; sources (the physics is the Experiment 3 formula; the spec makes no source claims).
