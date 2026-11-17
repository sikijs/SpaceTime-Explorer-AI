# Gap report: Black Holes and Strong Gravity Experiment 6 (Seeing the fall from far away)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/06-seeing-the-fall.md | Components: src/components/SeeingTheFallExperiment.tsx, SeeingTheFallTutor.tsx | Physics module: src/physics/seeingTheFallExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, three pictures (the flash rows, the stretch-factor graph, the observer-clock graph), two tables and a worked calculation in Results, and a four-step tutor. It follows the older rule: guesses are text only, and the Results panel itself marks each guess "right" or "off". Biggest gaps: no guess marks on any picture, no reading-guide notes under the tables, no three-part "what to look for", and the verdicts are computed in the component, not the module. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | How do the flashes arrive as the traveler nears the horizon? (SeeingTheFallExperiment.tsx:39-44, state 550) | same / closer / further apart | Picture 1 bottom row (gaps as received) or Picture 2 (stretch factor against 1) |
| 2 | Does the observer ever receive the horizon flash? (:46-51, state 551) | soon / long wait / never | Picture 3 (the clock curve against the horizon line), Picture 1 (flash 20) |
| 3 | Which effect changes the spacing? (:53-58, state 552) | gravity / motion / both | Picture 2 curves (violet, green, amber) |
Answers are held in `submitted*` state (:553-555) and used only in Results (:1106-1144) and the tutor props (:1243-1248).

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | Pictures and tables read only `result`, `start`, `presetId` (:560, :624-631); prediction state is read only in the verdict text and tutor props | none |
| A2 | Not met | No white mark or "YOUR GUESS" box in `FlashRows` (:144), `StretchGraph` (:318), `ClockGraph` (:444) | P1: white guess row/line on Picture 1 or on the "1" line of Picture 2; P2: white marker for flash 20; P3: boxed pointer to a curve |
| A3 | Not met | No marks | All three answers are categories, so markers only, with a caption line saying so |
| A4 | Not met | Pictures draw features in stages (`q(k)`, :154), but no guess mark | Mark only once its feature is drawn (flash 20 only after the last slice) |
| A5 | Met (not needed) | Every answer has a picture | none |
| A6 | Not met | No "Where the real picture comes from" line under any picture (:901-1043) | Add a line to each picture: calculated here from the given formulas; nothing measured |
| A7 | Not met | Introduction (:644-739) and the pre-run text say nothing about guesses never changing the pictures or being drawn in white | Add the wording (owner to approve) |
| A8 | Not met | Module exports `gravityPart`, `motionPart`, `stretchFactor`, `stretchFactorSteps`, `travelerWatch`, `arrivalTime`, `runSeeingTheFallExperiment` (seeingTheFallExperiment.ts:47-191), all for real values. Nothing for a guess's position. The "right" test is in the component (:1112-1143) | Add guess-mark functions and tests; move verdict logic into the module |
| A9 | Partly met | Observe prompt points to "the two rows" (Tutor:~108); compare step lists the guesses without marking (:110); the tutor's explanation (:~140-205) never marks them. The Results panel marks them first (:1112-1143) | Prompts would name the marks; the verdict wording would move from Results to the tutor (owner's decision) |
| A10 | Not met | No sentence in the introduction, controls or Results says predictions do not change the results (searched and read :644-739, :741-900, :1045-1237) | See O1 |

## Rule B
- B0: Results has one 9-row table (:1063-1104), a worked calculation (:1146-1168), a near-horizon table of three gaps (:1173-1198), a daily-life comparison (:1204-1211) and a limits box (:1213-1234).
- B1 Not met / probably N/A: no measured reference. The spec says the arrival-time and stretch formulas were not checked against a primary source (06-seeing-the-fall.md:240). Only internal comparisons exist (as sent vs as received).
- B2 Not met: no "What this table tells us" under either table. Only one-line follow-ups ("Each row has a gap ten times smaller...", :1199-1202).
- B3 N/A: the two controls (black hole, release distance) only move marks in the pictures and there is no outside reference.
- B4 Partly met: guesses appear in Results (:1106-1144) as "Checking your Nth prediction", but they carry a verdict ("So your prediction was right/off") and no tag sits on a table row.
- B5 Partly met: table values come from the module (`stretchFactor`, `arrivalTime`, `nearHorizon`, :629); the verdicts are decided in the component.

## Rule C
- C1 Met: row titles, numbered flashes, legend (:160-185, :290-297); curve labels and legend on Picture 2 (:397-438); axis, dashed-line and horizon labels on Picture 3 (:511-538).
- C2 Met: sent (cyan) and received (orange) rows; gravity, motion and total curves differ in colour (:27-33).
- C3 Met: "How to read this picture/graph" under each (:903, :961, :1010).
- C4 Mostly met: pictures, rows, dots, lines, curves and units are named and the terms "horizon light-time", "stretch factor", "gap above the horizon" are defined. Gaps: the order in which the rows build up during the run is only implied.
- C5 Partly met: Picture 2 caption has numbers (2 x 3 = 6, "about 3.2 and about 10", :988-999); Picture 1 and Picture 3 captions have no worked moment with numbers.
- C6 Not met: "What to watch" is one sentence (:947-949). No Look at / What it means / Why it matters.
- C7 Partly met: the captions' "What is really happening" paragraphs (:932-937, :988-993, :1024-1029) give the full two-cause mechanism and the "no limit" conclusion before the tutor. The learner has already predicted, so §12 is not broken, but §14 leaves the mechanism to the tutor.
- C8 Met: terms are defined in the introduction (:689-699) before use.

## Rule D
N/A (not a Cosmic Horizons experiment). No external links exist on the page.

## Other findings
- O1: CLAUDE.md §14 says the older experiments "say that predictions do not change the pictures or tables". This experiment does not say it anywhere (A10). The Results panel marks each guess right or off, which the new rule gives to the tutor.
- O2: The tutor's conceptual question (Tutor:~112, "How can both be true?") follows a Results panel that already states the answer ("Never arrives"). White is already used on Picture 2 for "the flashes sent so far" (StretchGraph :416, caption :984), so a white guess mark would clash with it.

## What an update would touch, and its size
Components: SeeingTheFallExperiment.tsx, SeeingTheFallTutor.tsx; module seeingTheFallExperiment.ts and its test file; the specification (§28.2); possibly App.tsx "What's next" (not reviewed). Size: **M** (marker-only marks on three pictures, new module functions with tests, the A6/A7 wording, notes under two tables).

## Not checked
Not run in a browser; tests not run; the tutor's explanation (:140-205) read only in part for A9; spec sources not read beyond the headings; "What's next" text in App.tsx not read.


---

# Re-read of 2026-11-17 (against Rule E, the 2026-11-07 rules, and the owner's request for rich Black Holes pages)
Status: read-only; nothing in the app, tests or specification changed. The findings above still stand; the new findings are below. Line numbers are from `SeeingTheFallExperiment.tsx` as read today (1,253 lines; tutor 205; module 247; 317 test lines, 26 `it` blocks). The page was not opened in a browser and the tests were not run for this re-read. Later modules mention this module in tests or import from it, so existing exports and values must not change (new functions only).

## Rule E (the page in four Parts): not met
| Item | Result | Evidence | Gap |
|---|---|---|---|
| E1 | Not met | One long card: introduction (:646-737), three predictions, controls and Run (:835-880), three pictures with captions (:~885-1050), Results (:1056-1237), tutor (:1244) | Split into Part 1 (predict, then watch), Part 2 (black-hole and release-distance controls and the drawings that follow them), Part 3 (results), Part 4 (tutor) |
| E2 | Not met | No Part headings, colours or leads | Four leads to draft; Part 1's gives no answers |
| E3 | Not met | No "Want to know more?" list, no "Words and formulas" box (the words are a paragraph, :689-700) | Both go above Part 1 with no heading |
| E4, E5 | n/a yet | | One experiment, no sub-parts |

## The 2026-11-07 rules
- **Parts 2, 3 and 4 appear after the first Run: not met in a way that matters.** `handlePresetChange` and `handleStartChange` call `setStatus('idle')` (:562-571) and the Results and tutor need `status === 'complete'` (:620). So **choosing another black hole or release distance hides the Results and the tutor**, and the tutor is keyed to `runCount` (:1244), so every Run restarts it. Same fault as Black Holes 5.
- **Start over, not Change prediction: not met.** "Change predictions" (:825, handler :590-595) re-opens the guesses and keeps the chosen hole and distance, and appears only after the first Run. Replace with an always-visible "Start over".
- **Links and words: not met** (E3). No link on the page.
- **A Run must not need a choice that belongs to Part 2.** Today the learner picks a hole and a distance and then runs (default 10-Sun, 10 radii). The three guesses are about *a* fall: the same in horizon radii for every hole (only the seconds change), and all three answers live on pictures that any one fall draws. So **one fixed Part 1 fall is enough, with no second picture pair.** See question 1.

## Findings that are new
- **White is already used, twice, for things that are not guesses (Rule A, §14).** Picture 2's flash dots are white (:416, :435, caption :984), and the dashed reference lines use `REFERENCE_COLOR` `#e2e8f0` (:33), close to white. White must mean the learner's guess only, so the dots take another colour (the traveler's cyan is the natural one, since they are flashes sent from the traveler) and the reference lines a clearly grey. Decision for the owner (question 4).
- **Verdicts before the tutor (§12, §13):** the Results have three paragraphs, each ending in a verdict (:1107-1140). They move to the tutor's explanation, as in Black Holes 1 to 5. The tutor's explanation at present never marks the guesses (the first report's A9).
- **The caption gives the whole mechanism (the first report's C7, re-read):** "What is really happening" in each caption (:932-937, :988-994, :1024-1030) states the two causes and "the observer never sees the traveler cross". The learner has already guessed, so §12 is not broken, but §14 says the mechanism and any verdict belong to the tutor. Decision for the owner (question 5).
- **The conceptual tutor question follows a Results panel that has already answered it** ("How can both be true?", Tutor :112, after "In the model it never arrives", :1121). Once the verdicts move, the order works again.
- **Heading:** "Experiment 6 — Seeing the Fall From Far Away: Does Anyone See the Traveler Cross?" (:642). Black Holes 1 to 5 now read "Black Holes N: ...". The heading's question is guess 2's question in other words, but it asks and does not answer. Rename to "Black Holes 6: ...".
- **Early hints in the introduction: none found that answer a guess.** "What to look for" (:711) says "what happens to the last flash", which points at guess 2's object without saying what happens; "Why even ask this" (:653-658) asks "do you see it happen? And if you do, when?" and gives no answer. I treat both as setup (question 5).
- **UI arithmetic that moves into the module (§9):** the demo-distance rule and the near-horizon row assembly (:615-626), the "demoDistance = start > 2 ? 2 : 1.5" choice, the "4.6 light-times" and "ln 10" typed in the Results (:1125), and the verdict tests (:1107-1140).
- **Marks that already say the answer before the run ends:** Picture 1's flash-20 "never arrives" arrow, its legend (:216, :286) and Picture 2's legend (:537) are drawn while the run plays. The guesses are locked by then, so this is allowed (§12); the white marks wait until the feature beside them is drawn (Rule A4).

## What to draw for the guesses (Rule A, planned)
All three answers are categories, so each is a marker (white YOUR GUESS box joined by a line to a place on the real picture), with a caption line saying it is a marker only. No guessed curves are drawn, because a curve would need a number the learner did not give.
- **Guess 1 (how the flashes arrive: same spacing / closer together / further and further apart):** on **Picture 2**, at the right-hand end (the traveler nearest the horizon), on the vertical axis of the stretch factor: "same spacing" at the dashed "not stretched" line (1), "closer together" in the band below that line, "further apart" with an arrow towards the top edge. The real total curve ends far above (about 19,000). Drawn only once the curve has reached the right end.
- **Guess 2 (the flash sent at the horizon: soon / after a long wait / never):** on **Picture 3**, at the rose horizon line: "soon" at the point where the horizon line meets the dashed no-delay line, "long wait" at a finite height on the curve's end, "never" with an arrow running up the horizon line past the top edge. Drawn only once the curve is drawn to its end.
- **Guess 3 (which effect: only gravity / only motion / both):** on **Picture 2**, a pointer to the violet curve, the green curve, or a bracket on the amber total with "both, together". Drawn after the curves are drawn.
- Picture 1 carries no guess (it is the real two-row picture), and says so in its "Where the real picture comes from" line.

## Rule A6 line for each picture
Under each: **calculated here** (every flash time, the stretch factor and its two parts, from the formulas given in the specification, for a thin flash sent straight outward from a falling traveler); **measured**: nothing (no observation of a real fall exists; the specification says the arrival-time and stretch formulas were not checked against a primary source, :240 of the specification); **imagined for the question**: the traveler, the flashes and the far-away observer, and the white guess marks.

## Rule B, re-read
- Today's Results: one 9-row table (:1063-1104), three verdict paragraphs, a worked calculation, a near-horizon table of three gaps (:1173-1198), the toss-a-ball comparison (:1205-1211) and the limits box (:1213-1234). No check-up, no "What this table tells us".
- **Real references that exist (all from the same theory, tested):** the stretch factor equals gravity part × motion part by two routes (module test); at release the stretch is `1 ÷ √(1 − 1/r0)` with a motion part of exactly 1; near the horizon `(1 + z)(r − 1)` tends to `2E`, so each tenfold closing multiplies the stretch by 10; the arrival time grows by `2 ln 10 ≈ 4.605` light-times for each tenfold closing (twice Experiment 5's 2.303); the arrival time equals Experiment 5's far-away clock plus the delay `r0 + ln(r0 − 1) − r − ln(r − 1)`. **No measurement of a fall exists to compare with**, so the check-up reads "the same" with the gap, and there are no cut-offs.
- A settings table is not needed: the controls (hole, release distance) only move marks and the kilometers and seconds.
- The "Your guesses beside the results" block carries each guess as made, the question, and the table row where its number appears, with no verdict (verdicts go to the tutor).

## Content for a favourite topic (all of it is the owner's to approve, §28.1)
What exists today: a text-only introduction (about 90 lines), three drawn pictures, no images, no links, and no real-world grounding. Proposed as a menu to accept or cut, each fact only if a page is read in the next step (none is read yet for this experiment; the candidates below are leads, not sources):
1. **A fuller introduction with sub-headings and two drawings made for the page:** (a) "the observer's view", a far-away observer with a clock receiving flashes from a falling friend (no answer drawn: the flashes are equally spaced on the traveler's side); (b) "how light climbs out", a flash sent from near the horizon taking longer to reach the observer than a flash sent from far out (no numbers). Held back until after the first Run (§12): that the gaps grow without limit, that the last flash never arrives, and the stretch numbers.
2. **Real-world grounding, only from pages read, after the first Run, each marked as outside the model:** how real telescopes see matter near a black hole appear to dim and slow (for example, gas or flares near the horizon of Sagittarius A*, ESO's GRAVITY instrument), and why real black holes are still seen: matter and light from *outside* the horizon. Leads to search for in the next step: NASA Goddard, NASA Science, ESA, ESO (GRAVITY flares and orbits), Chandra.
3. **Images:** only a real image whose licence is read (as ESA/Hubble's was for Black Holes 4). The EHT images are already in the project and are not about this topic.
4. **A "Recent news" block** only from read pages, otherwise a dated block and a recorded gap (§29 rule 3(c)).
5. **A "Want to know more?" list:** official plain pages on the event horizon and on time near a black hole, with gaps recorded where none is found. Black Holes 5's held-back list already links NASA Goddard's "Anatomy of Black Holes", page 8 (an explorer falling in and two clocks that disagree): reuse only if its content fits what this page says.
6. **A "Words and formulas" box (collapsed):** flash, as sent, as received, observer, light travel time, stretch factor, horizon, horizon radius, horizon light-time, with the stretch formula `(1 + z) = [E + √(1/r − 1/r0)] ÷ (1 − 1/r)` as gravity part × motion part, with a worked example at 2 horizon radii (`1.414 × 2.236 = 3.162`); the formula's worked example and the "never arrives" arithmetic appear only after the first Run, because they give the answers away.

## Questions for the owner (default first)
1. **What does Part 1 show?** Default: **one Run, one fall**: the 10-Sun black hole, released from rest at 10 horizon radii (the specification's reference fall, 49 light-times on the traveler's watch, flashes arriving 2.6 apart at first and 5.0 apart by the nineteenth), 10 seconds, with Pictures 1, 2 and 3 as built. Part 2 then lets the learner pick any hole and release distance (100, 20, 10, 5, 2) with a second set of the same three pictures. Alternatives: (a) Sagittarius A* in Part 1 (flashes in minutes instead of fractions of a millisecond); (b) two falls in Part 1.
2. **Verdicts out of the Results:** the three verdict paragraphs move to the tutor's explanation, which marks each guess; the Results only tag rows. Default: yes.
3. **How the guesses are drawn.** Default: markers in white YOUR GUESS boxes as planned above (guesses 1 and 3 on Picture 2, guess 2 on Picture 3); Picture 1 carries none. Alternative: guess 2 on Picture 1 at flash 20's arrow instead of Picture 3.
4. **White in the real pictures changes:** Picture 2's flash dots become the traveler's cyan and the dashed reference lines a clear grey, so that white means only the learner's guess. Default: yes.
5. **The captions' "What is really happening" paragraphs** (the two-cause mechanism and "never sees the traveler cross"). Default: keep what each drawn thing is and give each caption a worked moment and three-part "what to look for"; move the mechanism and the verdict into the tutor's explanation. The introduction's "What to look for" and "Why even ask this" are kept as setup.
6. **Real-world grounding, images and recent news.** Default: sourced real observations of matter near a black hole's horizon (only from pages read in the next step), after the first Run, each marked as outside the model; no new image unless its licence is read; no "recent news" block if no page can be read.
7. **Two drawings for the introduction** ("the observer's view" and "how light climbs out"). Default: yes.
8. **A check-up** of the stretch (two routes), the release value `1 ÷ √(1 − 1/r0)`, the near-horizon tenfold rule (×10 stretch, +4.605 light-times arrival) and the arrival time against Experiment 5's far-away clock plus the delay. Default: yes, in the words "the same" with the gap; no measured numbers.
9. **The near-horizon table** (gap 0.01, 0.001, 0.0001) stays as an ordinary Results table fixed at the Part 1 release, with a note; no settings table. Default: yes.
10. **The toss-a-ball comparison** (the friend walking away, tossing a ball every second, for the motion part only). Default: keep it in the Results and the tutor after the first Run, labelled an analogy (specification Decision 9).
11. **Heading and cross-references:** "Black Holes 6: Seeing the Fall From Far Away", with the three guess wordings staying exactly as approved (2026-10-11). Default: yes.
12. **The "What you learned" box staying after Start over for a completed chapter** (open since Black Holes 2). Default: leave as the app's existing behaviour; decide once for all chapters.
13. **Colour of the fall (Black Holes 7) is next.** Default: this page does not say what colour the flashes turn or how bright they stay (the specification already excludes it) and the real-world block does not preview it.

## Not checked in this re-read
Not run in a browser. Tests not run. No link was fetched and no source read for any real-world claim. The tutor was read only to its first third (:1-80) and the Results and captions were judged from the line list; the tutor's explanation (:140-205) was read in part for the earlier finding. The specification was read to the start of the tutor section.
