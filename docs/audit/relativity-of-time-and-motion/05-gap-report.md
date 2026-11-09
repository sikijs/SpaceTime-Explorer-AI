# Gap report: Relativity of Time and Motion Experiment 5 (Why Can't Light Go Faster?)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/05-invariant-light-speed.md | Components: src/components/Experiment5.tsx, Experiment5Tutor.tsx | Physics module: src/physics/invariantLightSpeedExperiment.ts (+ test, 21 tests; reuses lightClockExperiment.ts) | Status: read-only, nothing changed

## Summary
Three light-clock panels (rest, moving under an "everyday rule", moving under light's actual rule). One prediction in three parts: which rule gives the longer tick (three buttons) and two tick durations (numbers). Older rule: no guess marks, one-line captions only, no "Where the real picture comes from", no reading guide. The "everyday rule" panel is a hypothetical but is drawn in the same colours and with the same caption as the real one. Size: **L** (three guesses, three panels, imagined-versus-real distinction, a full caption).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1a | Which rule makes the moving tick longer? (Experiment5.tsx:451-465) | Buttons: everyday / actual / both the same; `choice` (:217) | The two moving panels (their path lengths and tick times); a choice has no position, so a marker is needed |
| 1b | Ticks under the everyday rule (:466-481) | Number; `everydayInput` (:218) | The everyday-rule panel's tick |
| 1c | Ticks under light's actual rule (:483-495) | Number; `actualInput` (:219) | The actual-rule panel's tick |
All three are bundled into one `Prediction` object (:14-18, :233-240), saved at :250.

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `runInvariantLightSpeedExperiment(selectedVelocity)` (:244, :255); prediction not read | None |
| A2 | Not met | Guess text only (:616-624) | White marks with "YOUR GUESS" on each moving panel |
| A3 | Not met | None | Numbers follow their tick; the choice (1a) is a marker only, and the caption would say so |
| A4 | N/A | No marks; panels build up during the run | Marks only after both ticks are drawn |
| A5 | Partly met | No time scale on the panels | Add a tick-time strip under the three panels on one scale, with white marks |
| A6 | Not met | No line | Needs: the actual-rule panel is calculated here; the everyday-rule panel is imagined (a "what if") and must be named so and drawn in another colour |
| A7 | Not met | Intro (:304-392) has no statement; speed control note units only (:398-401) | Add intro sentence and note |
| A8 | Not met | Module exports run and state functions (invariantLightSpeedExperiment.ts:24, :62-80) | Add tested guess-mark helpers; the tutor does arithmetic in the UI (Experiment5Tutor.tsx:146-153) |
| A9 | Partly met | Compare prompt restates the choice and both guesses beside the real values (Experiment5Tutor.tsx:82); the explanation (:124-177) does not mark the guess | Prompts would name the marks |
| A10 | Not met as such | "A wrong guess is fine. Guesses are not scored." (:360). Nothing says predictions do not change the results | Current state |

## Rule B
| Item | Result | Evidence | Gap |
|---|---|---|---|
| B0 | | Results lists: rest clock, two rule blocks, "Your prediction" (:579-625). No tables | |
| B1 | Partly met | The actual rule matches Experiments 3 and 4 by the same physics (module test :52-70); the spec avoids experimental evidence on purpose (spec Decision 6, 05-invariant-light-speed.md:305) | No external reference allowed by the spec; leave as is unless owner decides |
| B2 | Not met | No notes (values only by design, :192) | Notes could point to the 1.000c versus above-c light speed rows |
| B3 | Optional | Speed control | Owner's choice |
| B4 | Partly met | Guess vs real lines (:616-624), no tags | Tags on the tick rows |
| B5 | Partly met | Numbers from the module | Covered by A8 |

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Not met | The SVG has only "start" labels (:170-175); mirrors, pulse and path have none; panel titles are HTML (:155-157) | Label on the canvas |
| C2 | Partly met | The rest and the actual-rule panels differ in path. The two moving panels differ only in sideways reach: everyday rule v × 1 s versus actual rule v × γ s (module tests :29-46, :52), so at 0.1c they look almost the same. The everyday panel uses the same colours and caption as the real one (:553, :563) | A visible "imagined" distinction is missing (CLAUDE.md §14 item 2) |
| C3 | Partly met | One-line captions: "At rest in the lab"; the identical sentence under both moving panels (:542, :553, :563) | Full caption missing |
| C4, C5, C6 | Not met | As C3 | Name three panels, define lab seconds and light speed above c, worked moment (0.6c) and three-part look-for items |
| C7 | Partly met | The intro does not state the answer, but the intro says light "gets the lamp's speed added" and that this is "only a 'what if'" (:339-340), which tells the learner which rule is real before the prediction (the spec states the same at 05-invariant-light-speed.md:42, :167) | Report only: the real rule is announced before the learner predicts; the owner decides |
| C8 | Met | Tick, light-second, lab seconds, reference frame, c defined before use (:309-321, :359-360, :370-373) | |

## Rule D
Not applicable.

## Other findings
- O1: None found against the spec. The spec's open items are recorded resolved (05-invariant-light-speed.md:310-316).
- O2: "Einstein's postulate" is stated as the rule used in the course (:346-347); no source is given for the postulate, and the spec says evidence is left out on purpose. The tutor's "ball thrown from a train" daily-life example (Experiment5Tutor.tsx:135-136) fits §15. Same inline colours as Experiments 3, 4 and 6 for the buttons.

## What an update would touch, and its size (O3, O4)
Experiment5.tsx (panels, tick-time strip, imagined colouring, caption, intro, notes), Experiment5Tutor.tsx, invariantLightSpeedExperiment.ts and test, the specification. Size: **Large**.

## Not checked
Browser appearance, narrow widths, dark mode, wide layout above 0.93c. Code and text read only.

---

# Re-read, 2026-11-09: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `Experiment5.tsx` (647 lines), `Experiment5Tutor.tsx` (181 lines), `invariantLightSpeedExperiment.ts` (111 lines) and the specification `05-invariant-light-speed.md`. Nothing changed. Rules A to C above stand as written; this section adds what they did not cover, and sharpens them with what Relativity 3 and 4 settled (`03-` and `04-draft-wording.md`), so the owner's earlier answers can carry over. Experiment 5 differs from Experiment 4 in five ways: it has **three guesses** (a choice and two tick lengths), it shows **three clocks** (rest, everyday rule, light's actual rule), **one of them is imagined** (the everyday rule is a "what if", not nature), it has **one control** (the speed, no duration), and the specification **forbids evidence and new physics** (Decisions 1, 2 and 6).

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card, one column: introduction, speed buttons, the prediction (a choice and two numbers), START, the three clocks (under START), then, after the run, Results and the tutor (`Experiment5.tsx:294-644`) | Part 1 (the guesses, START, the three clocks, the new tick bars), Part 2 (the speed and Drawing A), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours (amber, pink, teal, blue). Part 1's lead must not say which rule gives the longer tick |
| E3 | Partly met | The introduction, with its assumptions list, sits above the controls; no links list, no words box | See "Links" and "Words" below |
| E5 | N/A | One experiment, one part | |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
**Met already for the results and the tutor** (both render only when `status === 'complete'`, `:579` and `:629`). **Not met for the control**: the speed buttons (`:394-442`) sit above START all the time. Moving them into Part 2 means Part 2 appears after the first Run, with a "Not run yet" note. One run is enough here (one speed, three clocks in one run), so no "run both to compare" note is needed.

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. Background ideas the introduction explains: a light clock and its tick, the light-second, the speed of light and the "c" note, "speeds add" (the ball thrown from a train), light's constant speed as Einstein's postulate, reference frame and lab time, and time dilation (named in the results and the tutor). **Not searched or read yet**; the search and the fetch belong to the draft step. What was found for Relativity 3 and 4 carries over: NASA Science, "How Big is Space?" (speed of light, fetched and read) and Einstein Online, "From light clocks to time dilation" (the light clock and the postulate; read through a helper, 2026-11-08); **no plain official page for "light-second" or "reference frame"** (§29 rule 3(c)).
- **A difference from Experiments 3 and 4.** The page names its own question as "what if light's speed just added to the lamp's?", so a page that says light's speed is the same for everyone gives away the **real rule**. The introduction already states light's actual rule up front (specification, Introductory text), so a link on it gives nothing the page has not said. A page that works out the **tick lengths under either rule** would give away the prediction; it must be read for that before it is linked.
- **"Speeds add" has no source on the page.** The ball-and-train idea is the page's own daily-life example. A plain official page on adding speeds (for example, a NASA or university page on relative velocity), if one exists, could be linked; if none, record it under §29 rule 3(c) and under "Open". **Not searched.**
- **Einstein's postulate has no source on the page** (the same gap as Experiment 4: "it is Einstein's postulate, as in Experiment 4", `Experiment5.tsx:346-347`; the tutor, `Experiment5Tutor.tsx:174`). The original source is Einstein's 1905 paper. The specification leaves out experimental evidence on purpose (Decision 6, "unless the owner approves it"). **Needs the owner's decision:** link the 1905 paper as the origin of the postulate (no claim of evidence), or record a gap.
- **Real results.** The page uses none: every number comes from the geometry the specification gives, not from a measurement, so there is no paper to link for a result.
- **"Words and formulas": Not met.** None exists. Terms: light clock, tick, mirror, light source, light-second, c, lab seconds, lab time, reference frame, at rest and moving, everyday rule, light's actual rule, "what if" (hypothetical), time dilation factor, postulate. **Formulas on the page:** the results line "light's speed in the lab = distance ÷ time" and the tutor's worked numbers (`Experiment5Tutor.tsx:143-154`). The specification gives algebra for the everyday rule (light speed √(1 + v²), path √(1 + v²) light-seconds), which the page does not show, and showing it before the run would give away the prediction. **Recommend** one entry, "Speed = distance ÷ time", with an example from the page's own numbers (1 light-second in 1 second is 1c), and no square-root formula. **Needs the owner's decision.**

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** There is no "Start over" and no "Change prediction". After a run `handleStart` clears the three guess inputs (`:248-259`) and the learner can pick another speed and predict again, so a changed guess can sit beside results made at another speed. Needed: an always-visible "Start over", greyed until there is a guess or a run and while a run plays; a line saying the guess is locked after START; START replaced after the first run by "Run your speed" in Part 2 (a Part 2 run does not need a new guess).

## Rule A to C: what the re-read sharpens
- **Three guesses, three kinds of mark.** The prediction is one object (`:14-18`): `choice` (which rule gives the longer tick), `everydayTick` and `actualTick`. The two numbers are positions on a time scale, so they get **two white marks, one on each moving clock's bar**. The choice has no size or position, so it gets **a white marker only** (a white "YOUR GUESS: the everyday rule" or "...the actual rule" or "...both the same" tag on the bar pair, joined by a line to the bar or bars named), and the caption says it is only a marker (Rule A3). **Needs the owner's decision on where the marker sits** (default: beside the two moving bars, pointing at the bar the learner chose; for "both the same", a bracket over both).
- **The scale and the bars.** A new panel of **three time bars on one scale** under the three clocks: "Rest clock, one tick" (1.000 s), "Moving clock, everyday rule (imagined), one tick, on the lab's clocks" (1.000 s) and "Moving clock, light's actual rule, one tick, on the lab's clocks" (1.155 s at 0.5c). Part 1 is fixed at 0.5c, so a scale of 0 to 2 s (twice the rest tick) fits, with an edge arrow for a guess outside it. In Part 2 the scale runs from 0 to twice the actual-rule tick (as in Relativity 4), with a note that it changes (1.005 s at 0.1c, 1.667 s at 0.8c, 7.089 s at 0.99c). **Needs the owner's decision.**
- **The imagined rule needs its own colour and name** (Rule A2, and CLAUDE.md §14 item 2). Today the everyday-rule panel uses the same colours and the same caption as the real moving clock (`:553`, `:563`) and its title is plain text, so a learner can take the "what if" for something measured. Needed: a different colour for the everyday rule, the word "imagined" on the canvas in the panel's title and on its bar, and a "Where the real picture comes from" line that says the rest clock and the actual-rule clock are calculated here from the light-clock geometry (no instrument measured them; the clock is a giant imagined one), and the everyday-rule clock is imagined for the question. **Colours:** white is the guess, amber stays for the actual-rule (moving) clock as in Relativity 4, so the imagined rule needs a third colour (suggest violet). **Needs the owner's decision.**
- **The "same tick" case looks like a tie.** Under the everyday rule the tick is exactly the rest tick at every speed (module test 2), so the everyday bar ends where the rest bar ends. That is the result, but it also means the two bars look identical; the caption must say that this is the result and not a drawing mistake, in words that do not state it before the run (§12). **A wording point for the draft.**
- **A5, the strip is the new panel.** The current panels have no time scale, so there is no picture where the two tick guesses live. The three bars are that picture, in the same section as the clocks, not a separate figure (Rule A5).
- **One control.** The speed (0.1c, 0.3c, 0.5c, 0.8c and "Other" 0.01c to 0.99c; `:394-442`) moves to Part 2, which opens at 0.8c, with Part 1 fixed at 0.5c (the page's current default). Relativity 4's answer carries over. The specification's Learner Controls line lists the speed on the page, so moving it **needs the owner's decision**.
- **Part 2 drawing (Drawing A).** The three clocks and the three bars for the learner's speed, the imagined bar and the actual bar keeping their colours, the learner's speed shown in pink as the setting, no white marks (the guesses were for the Part 1 run), and a "Runs so far" list (for example "0.8c: everyday rule 1.000 s, light's actual rule 1.667 s, light speed 1.281c against 1.000c"). The learner sees the actual tick lengthen with speed while the everyday tick stays at 1.000 s, which is Expected Observations 1 and 4.
- **C1, labels on the canvas.** The panels' SVG has only two "start" labels (`:166-177`) and the panel titles are HTML above the picture. Label on the canvas: "Top mirror", "Bottom mirror", "Light pulse" (the yellow dot), "Path of the light" (the yellow line), "Where the mirrors started" (the dashed lines, now just "start"), and each panel's title and its rule inside the picture. At the high speeds the panels are stacked and the drawing is 720 units wide (`WIDE_THRESHOLD_LS`, above about 0.93c, Part 2 only), so labels must still fit; the title of a light-path drawing was clipped in Relativity 4 (fixed there by splitting at the colon), so check the same here. **Not checked by eye.**
- **C3 to C6, captions.** Full captions for the three clocks and for the tick bars: name each clock and each element (yellow dot, line, black bars, dashed marks, readouts, the lab seconds), define "lab seconds" and "light's speed seen from the lab", say what a longer path or a longer bar means, a worked moment (for example 0.6c with its numbers from the module), and three-part look-for items. The existing one-line captions ("At rest in the lab" and the sentence repeated under both moving panels) become part of these. The captions must not say which rule is the real one's *result* (the tick lengths) before the guess; they may repeat what the introduction already says (Light's actual rule is the course's rule).
- **C7, the real rule is announced before the learner predicts.** Report only, unchanged: the specification asks for it (Introductory text), so the introduction stays; the learner's prediction is about the consequences. **No action unless the owner decides otherwise.**
- **A8, arithmetic and fixed numbers in the tutor.** `Experiment5Tutor.tsx:128-131` writes "one tick lasts 1 second" and "showed 1.0 second", and `:144-153` halves the sideways distance and the path in the component. Both belong in the module (§9): the clock's own tick (the rest tick, from the module) and the everyday-rule half-trip numbers (rise, sideways, diagonal), as `halfTripNumbers` does for Experiment 4. The module has no function that takes the guesses; it needs one for each white mark (the guess's position on the bars and its gap from the real tick) and the tutor's marking. **Recommend** small tested functions. The numbers do not change.
- **A9, the tutor.** The compare prompt quotes the choice and both guesses beside the real values (`Experiment5Tutor.tsx:82`) but not the marks, and the explanation never says how the guess compared. Unlike Experiment 3 there is no margin to confirm. The tutor would say where each guess lies compared with the real tick (more, less, the same, no score, as in Relativity 4) and name the white marks; for the choice it would say which rule gave the longer tick and which the learner chose, **without "right" or "wrong"** (§12, §13). **Needs the owner's confirmation of that.**
- **Wording that overlaps or points to old numbers.** The introduction says "Experiment 4" and "Experiment 2" (`:305`, `:347`, `:371`), and the tutor says "Experiments 3 and 4" (`:164`, `:174`). **Recommend** the chapters' titles, as in Relativity 4. The "A quick reminder: the light clock" and "How far apart are the mirrors?" paragraphs repeat Experiment 4's introduction on purpose (this chapter can be opened on its own); keep, but shorten.
- **A10, the introduction's statement.** "A wrong guess is fine. Guesses are not scored." (`:360`) stays. Add: the predictions never change the pictures or tables, the guesses are drawn on the bars in white and shown again beside the results, and the speed (Part 2) changes the drawings.
- **B1 to B3, recommendation as in Relativity 1 to 4.** The page computes everything from the same geometry a check would use, so a check-up would be circular, and the control only moves marks and numbers. The one real reference, light's speed (c), is the rule's own input under the actual rule and the thing the everyday rule is shown to exceed, so a row "light's speed in the lab: expected 1.000c, found 1.000c" would only repeat the model. **No check-up and no setting-following table;** keep the plain results lines, add the guess tags on the two moving tick lines (B4, guess only), and add a short note under each results block (B2: the path, the tick and the light's speed, what each is, what it means with the real numbers, why it matters), without the mechanism (the tutor's). **Needs the owner's decision.**
- **The run's animation guard.** Already present (progress clamped at 0, `:271-272`), so the blank-page bug found in Relativity 3 does not apply. The clamped value is not re-checked for the stacked wide layout.
- **Page width.** Already 900 px (the outer div, `:291`), so no change.
- **Buttons.** `Experiment5.tsx` has no `toggle-button` class; it uses inline `optionButtonStyle`. **Recommend** the shared class, as for Relativity 3 and 4.
- **Scroll on START.** START scrolls the clocks into view (`displayRef.current?.scrollIntoView`, `:258`); with the Parts layout the clocks stay in Part 1, so the scroll still makes sense; to be re-checked in the browser.
- **The "everyday rule" is the page's own label** (specification Decision 3). It stays; the new "imagined" tag is added to it, not substituted.
- **Out of scope here, but noticed.** The specification's chapter-summary note (item 9, "says these are all the experiments for now") is out of date, since the group has eleven experiments; and `src/App.tsx` summaries for Experiments 3 to 5 say "Experiment 3" and "Experiment 4" (learner-facing numbers). Reported only; not changed.

## Updated size
**Large** (unchanged): the Parts layout; labels on the canvas for three clocks; a three-bar panel with two white tick marks and a choice marker; the imagined colour and "Where the real picture comes from"; a pink version for Part 2 with "Runs so far"; three captions (the three clocks, the bars, Drawing A); words box; links (search and fetch); Start over; the tutor's marking; the specification update; and tested module functions (each guess's position on the bars, the choice marker's place, the tutor's marking, the rest tick, the everyday half-trip numbers). Files: `Experiment5.tsx`, `Experiment5Tutor.tsx`, `invariantLightSpeedExperiment.ts` and its test, the specification, `docs/DEVELOPMENT-STATE.md`. The most likely time sink is the three-clock layout at narrow widths and in the stacked wide layout.

## Questions for the owner before drafting (suggested defaults follow the answers given for Relativity 1 to 4)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Settings:** Part 1 fixed at 0.5c; the speed (0.1c, 0.3c, 0.5c, 0.8c, "Other") moves to Part 2, which opens at 0.8c? Default: yes.
3. **Bars:** three time bars (rest tick, everyday-rule tick, actual-rule tick) under the three clocks, two white tick marks, an edge arrow; Part 1's scale 0 to 2 s, Drawing A's scale 0 to twice the actual-rule tick? Default: yes.
4. **The choice marker:** a white marker tag beside the two moving bars, joined by a line to the chosen bar (a bracket over both for "both the same"), and the caption says it is only a marker? Default: yes.
5. **Imagined rule:** the everyday-rule clock and bar in a third colour (violet), labelled "imagined" on the canvas, with a "Where the real picture comes from" line? Default: yes.
6. **Part 2 drawing:** the three clocks and bars for the learner's speed, no white marks, the speed in pink, "Runs so far"? Default: yes.
7. **Tutor marking:** the explanation marks each guess with no score (more, less or the same as the real tick; for the choice, which rule gave the longer tick and which the learner chose, with no "right" or "wrong"), and the tick of 1 second and the half-trip arithmetic move into the module with tests? Default: yes.
8. **Introduction:** keep the specification's order and the statement of light's actual rule before the prediction; use the chapters' titles; add the statement about predictions and the controls? Default: yes.
9. **Reading guide:** no check-up or setting-following table; guess tags on the two moving tick lines and a note under each results block? Default: yes.
10. **Links:** search for plain official pages on adding speeds and on the light clock, reuse the NASA and Einstein Online pages, record gaps under §29 rule 3(c) where none exists; and **for Einstein's postulate, link the 1905 paper as its origin (with no claim of experimental evidence), or record a gap?** Default: record a gap unless you want the paper linked.
11. **Words box:** terms, and one formula entry ("speed = distance ÷ time", worked from the page's numbers), no square-root formula (it would give away the prediction)? Default: yes.
12. **Buttons:** switch to the shared `toggle-button` class? Default: yes.
13. **Size:** accept Large? Default: yes.

## Not checked (re-read)
The page was not run in a browser; narrow widths and the stacked wide layout (above about 0.93c) were not looked at; no source page was searched or fetched for the links list, and the NASA and Einstein Online pages were reused from Relativity 4 without being fetched again. The tick values quoted (1.005 s at 0.1c, 1.667 s at 0.8c, 7.089 s at 0.99c) come from the module's formula and the specification's table, not from running the page.
