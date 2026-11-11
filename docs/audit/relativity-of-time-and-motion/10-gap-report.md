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

---

# Re-read, 2026-11-11: Rule E and the owner's rules of 2026-11-02 to 2026-11-10
Read-only. Re-read of `Experiment10.tsx` (293 lines), `Experiment10Tutor.tsx` (152 lines), `twinParadoxExperiment.ts` (36 lines) and its 6 tests, `Experiment10.test.ts` and the specification `10-twin-paradox.md`. Nothing changed. Rules A to C above stand, with these updates: **the wrong-outcome fault (O1/O2 above) was fixed on 2026-11-02 (`9c3e0d2`)**, so the results and the tutor now say "the Earth twin is older". This section adds Rule E and the rules set while Relativity 1 to 9 were audited, so the owner's earlier answers carry over (`03-` to `09-draft-wording.md`). **Relativity 10 differs from 3 to 9 in four ways:** it has **no picture at all** (so the whole picture, its labels, caption and guess mark are new); its guess is a **who-is-older ordering**, not a number or a shape; its answer **does not depend on the speed** (the traveling twin is younger at every speed above 0); and its "run" is an **instant CALCULATE**, so there is nothing yet to wait for or replay.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One grey card, one column: introduction, speed buttons, the guess, CALCULATE, Results, tutor (`Experiment10.tsx:77-290`) | Part 1 (the guess, Run, the picture at 0.5c), Part 2 (the speed, and a picture that follows it), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours. Part 1's lead must not say who is older |
| E3 | Partly met | Introduction and assumptions sit above the controls (`:86-142`); no links list, no words box | See "Links" and "Words" below |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
- **Today:** the Results and the tutor appear the moment CALCULATE is pressed (`:232`, `:283`), so they already appear after the first run. That part of the rule is met. **But** there is no run to watch: the answer is on screen at once, so nothing is built up and the learner never sees the two clocks diverge.
- **The speed buttons** (`:144-182`) sit above the guess all the time and the guess question names the chosen speed (`:189-190`). They move into Part 2.

## The speed has to leave the prediction
Here the speed does **not** change who is older, so a changed guess cannot "stand beside another speed's answer" in the way it could in Relativity 9. It still changes the numbers the guess is compared with, and today a learner can pick 0.8c, guess, run, change to 0.1c and guess again (`handleReveal` clears the guess, `:67-68`). **Recommend, as in Relativity 3 to 9:** Part 1 fixed at 0.5c; the speeds (0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c; there is still **no 0c**, see the specification) move to Part 2, which opens at 0.8c. **Needs the owner's decision.**

## Rule A to C: what the re-read sharpens
- **The picture (A5, C1 to C6; needs the owner's decision).** The specification says "numeric only" and keeps a spacetime diagram of the V-shaped trip as a "candidate, not approved" for a later chapter (`10-twin-paradox.md:121`, `:171`). The Predictions rule says that if the predicted quantity has no picture, it goes in the nearest picture as its own panel, not a new picture; here there is no picture to join. Two options:
  1. **Two time bars, recommended.** The same picture as Relativity 3: two bars on one scale, "The Earth twin's clock" and "The traveling twin's clock", growing together over a playback while the trip runs, then stopping at the real totals (at 0.5c: 8.000 s and 6.928 s, a gap of 1.072 s; the module's numbers). Playback speed changes only how fast the bars grow, never the totals (§11). A white mark with a YOUR GUESS box sits beside the bars. It stays inside the spec's "numeric, no diagram of the journey" and adds no new physics.
  2. **The V-shaped worldline diagram** (Earth twin's vertical line, traveler's V, the turnaround as the bend). It is the strongest picture of the idea, and Relativity 8 and 9's diagram code could be reused, but the owner has already put it outside this chapter's scope. **Not recommended unless you want to bring it in now;** it would also need a second ruler for the clocks.
- **The guess marker (A2 to A4; needs the owner's decision).** "Same age", "Earth twin older" and "traveling twin older" have no size, so the marker is only a marker, as in Relativity 7 to 9. **Recommend** a white pointer between or beside the two bars: level (equal) for "same age", leaning to the Earth bar for "Earth twin older", leaning to the traveling bar for "traveling twin older", in a YOUR GUESS box. It appears with the bars (A4). The caption says it is only a marker and that its size is **not** the real gap. No "right" or "wrong" (§12, §13).
- **A6, "Where the real picture comes from."** None. Needs: calculated here from Relativity 3's time dilation applied to a round trip of 2 light-seconds each way; nothing measured; the trip imagined. (Real clocks on fast journeys have shown the same effect, which Relativity 3 may already cite; that stays with the links step.)
- **A7 and A10, the introduction's statement.** No sentence about predictions, and no "not scored" (`:120-125`; the spec says "Not scored", `:95`). Add the statement that the guess never changes the pictures or tables, is drawn in white and shown again beside the results, and that the speed in Part 2 changes the drawings.
- **A8, the module.** `runTwinParadoxExperiment` returns the times and the gap (`:17-35`). Missing, and added with tests (§9): **which twin is older** (derived from the gap), the marker's position for each guess, and the bars' lengths over playback time (so the UI does not compute them). `actualOutcome()` still lives in `Experiment10.tsx:22-24` and is tested only in `Experiment10.test.ts`, outside the physics module; move it into the module (§9) with the test.
- **A9, the tutor.** Observe says "Look at the two ages" and the compare step states the guess and the real outcome before the explanation (`Experiment10Tutor.tsx:58-61`). Needed: observe and compare name the white marker and the two bars; the explanation marks the guess with no score. The conceptual step (`:63`) stays. The "two friends" paragraph stays. **Needs the owner's confirmation.**
- **Results (`:242-279`).** The "Your prediction" block says "You guessed X. It is actually Y." (`:272-276`), which compares them. **Recommend**, as in Relativity 3 to 9: the guess as a tag, no "It is actually" line. The Earth and traveling twins' totals and the gap are already shown and move under the bars. "Time dilation factor" (`:263`) is shown with no meaning; add a note ("Experiment 3's factor: 0.866 at 0.5c; the traveling twin's clock ticks that fraction as fast as the Earth twin's"; the first sentence would use the Experiment 3's title). Numbers at the five speeds, by hand from the module's formulas: 0.1c: 40.000 s, 39.799 s, gap 0.201 s; 0.3c: 13.333 s, 12.719 s, gap 0.614 s; 0.5c: 8.000 s, 6.928 s, gap 1.072 s; 0.8c: 5.000 s, 3.000 s, gap 2.000 s.
- **B1 to B3.** The real reference is Relativity 3's formula (test 1); a check-up that compares the chapter's number with its own formula would be circular. **Recommend no check-up and no setting-following table**, as in Relativity 7 to 9. Notes under the results table are still needed (what it is, what it means with real numbers, why it matters).
- **C7, an early reveal in the introduction (needs the owner's decision).** The introduction's second paragraph says "the traveling twin's clock is the one that's moving, so they come back younger" and then argues the opposite is just as fair (`:93-103`). That states one candidate answer before the guess, and the third paragraph tells the learner that "who changes direction" settles the question (`:105-109`). The specification approved this text (`:105-109`), and it frames the paradox rather than answering it, but it does give the learner the tie-breaker before they predict (§12). **Recommend** keeping the paradox and moving the last sentence of "What breaks the tie" ("who changes direction") to the tutor. **Needs the owner's decision;** it changes approved wording.
- **Old chapter numbers in wording.** "Experiment 3" and "Experiments 3–9" (`:95`, `:130`), the tutor's "Experiment 3" (`Experiment10Tutor.tsx:145`) and the spec. **Recommend** the chapters' titles ("The moving clock").
- **C8, terms.** "Acceleration" is defined (`:110-114`); "time dilation factor" (`:263`), "light-second" (`:150`, `:248`) and "reference frame" ideas are used without a definition here. Define where first needed and list in the words box. "Paradox", "turnaround", "elapsed time" and "age" are plain.
- **Page width and buttons.** 900 px already; the page uses inline colours and `optionButtonStyle`. **Recommend** the shared classes.
- **"CALCULATE" and no "Start over".** The button says CALCULATE and there is no "Start over"; `handleReveal` clears the guess (`:68`). Needed: **Run** as in the other chapters, an always-visible "Start over", greyed until there is a guess or a run and while the bars are playing, and a locked-guess line. Replay is optional (the owner decides).
- **O1 (spec, stale).** The specification header says the owner's wording approval "has not yet been done" (`:5`), while CLAUDE.md records all wording as approved, and it says "no gaps found" before the wrong-outcome fault was fixed (`9c3e0d2`). The header needs correcting with the update. **Needs the owner's confirmation** that the wording is approved.
- **O2.** The speed cap of 0.9c (`MAX_SPEED`) and the 2-light-second distance are fixed by the spec. **Recommend keeping both.** The turnaround is instantaneous (a stated assumption); nothing about the turnaround is drawn beyond the bars' naming of it in the caption.

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. Background ideas the introduction explains: the twin paradox itself, time dilation (from Relativity 3), acceleration, and why turning around breaks the symmetry. **Not searched or read yet** (the search and fetch belong to the draft step). Pages that state the answer ("the traveler is younger") are held back until after the tutor, as for Relativity 3.
- **Real results.** Experimental checks of the effect (fast-moving particles, atomic clocks on aircraft; the 1971 Hafele-Keating flights) are real results this chapter's idea rests on. **Needs the owner's decision:** link the original paper (Hafele and Keating, *Science*, 1972) if it can be fetched, otherwise record a gap (§29 rule 3(c) as extended by the 2026-11-07 rule). Default: try the search, then record a gap.
- **"Words and formulas": Not met.** None exists. Terms: twin paradox, elapsed time, age, Earth twin, traveling twin, constant speed, turnaround, acceleration, time dilation factor, light-second, c, one-way distance, round trip. **Formulas with a worked example from the page's own numbers:** lab time = 2 × distance ÷ speed (2 × 2 ÷ 0.5 = 8 s), traveler's time = lab time × √(1 − v²) (8 × 0.866 = 6.928 s). Withhold the traveler's time and the gap at 0.5c until after the run (they are the answer to the guess).

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** Neither button exists (see above). Needed: as described.

## Updated size
**Large** (unchanged). A new picture (two time bars with a playback), a white marker and its box, labels and key, "Where the real picture comes from", a caption with a worked moment, Parts 1 to 4, a Run with a playback in place of an instant CALCULATE, results with notes and a tag, the words box, links (search and fetch), Start over, the tutor's marking, a physics addition (which twin is older, marker position, bars' lengths) with tests, the specification update. Files: `Experiment10.tsx`, `Experiment10Tutor.tsx`, a new `Experiment10Pictures.tsx`, `twinParadoxExperiment.ts` and `.test.ts`, `Experiment10.test.ts` (folded into the module tests), the specification and `DEVELOPMENT-STATE.md`. The draft wording would live in `10-draft-wording.md`.

## Questions for the owner before drafting (suggested defaults follow the answers given for Relativity 3 to 9)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Settings:** Part 1 fixed at 0.5c; the speeds (0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c, no 0c) in Part 2, which opens at 0.8c? Default: yes.
3. **The picture:** two time bars (option 1) as the chapter's first picture, keeping the V-shaped worldline diagram for a later chapter as the specification says? Default: yes.
4. **The guess marker:** a white pointer (level, leaning to the Earth bar, leaning to the traveling bar) in a YOUR GUESS box, shown with the bars, and the caption saying it is only a marker? Default: yes.
5. **A Run with a playback** (the two bars grow together over a few seconds, playback speed never changes the totals) in place of the instant CALCULATE? Default: yes.
6. **Parts 2 to 4 appear when the Part 1 bars have finished growing,** and `onComplete` fires then? Default: yes.
7. **Caption:** "How to read this diagram" in sections, a worked moment at 0.5c (8.000 s against 6.928 s, a gap of 1.072 s), and three-part look-fors? Default: yes.
8. **Results:** the guess as a tag with no "It is actually" line, a note on the "time dilation factor", and a note under each block? Default: yes.
9. **Tutor:** names the white marker and the bars and marks the guess with no score? Default: yes.
10. **Introduction:** the chapters' titles in place of numbers, the terms defined where first needed, the statement about the guess, **and the "who changes direction" tie-breaker line moved to the tutor** (it changes approved wording)? Default: yes to all but the last; the last is your call.
11. **Reading guide:** no check-up or setting-following table? Default: yes.
12. **Links:** search for plain official pages on the twin paradox and time dilation, hold back any that state the answer, and try the Hafele-Keating paper, recording a gap if it cannot be fetched? Default: yes.
13. **Words box:** the terms above and two formula entries, with the 0.5c answers withheld until after the run? Default: yes.
14. **Buttons and card:** the shared classes; **Run** in place of CALCULATE; "Start over" always visible? Default: yes.
15. **Specification:** correct the stale header and record the audit update? Default: yes.
16. **Size:** accept Large? Default: yes.

## Not checked (re-read)
The page was not run in a browser; narrow widths were not looked at; no source page was searched or fetched for the links list, and the Hafele-Keating paper was named from memory and has not been read. The numbers quoted (8.000 s, 6.928 s, 1.072 s at 0.5c; the other speeds' times) come from the module's formulas by hand, not from running the page. Line numbers are from the files as read on 2026-11-11.
