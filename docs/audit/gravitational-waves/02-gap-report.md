# Gap report: Gravitational Waves Experiment 2 (The Chirp: A Wave That Builds)
Date: 2026-11-02 | Specification: docs/experiments/gravitational-waves/02-the-chirp.md | Components: src/components/GravitationalWaveChirpExperiment.tsx, GravitationalWaveChirpTutor.tsx | Physics module: src/physics/gravitationalWaveChirpExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Same two-arm drawing, now driven by a rising chirp; one mass slider (0.2 to 6); three predictions; Results with an optional "Comparing your two runs" paragraph; 4-step tutor. Gaps: no caption, unlabelled drawing, no reading guide, no guess marks. The timing question compares two masses, but only one mass is on screen at a time. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Does the pitch speed up, slow down or stay the same? (:311) | pitchChoices (:80-84); `pitchPrediction` / `submittedPitchPrediction` (:154,:157) | Arm graph (:411-446): spacing of the oscillations along the time axis |
| 2 | Does the wave get stronger, weaker, same? (:319) | loudnessChoices (:86-90) | Arm graph: height of the oscillations |
| 3 | Small-mass or large-mass pair reaches its final moment sooner? (:327) | timingChoices (:92-96) | **No picture holds both masses.** Only one run's end time is drawn (graph x-axis = that run's cutoff) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | None |
| A1 | Met | Run values come from `chirpRunFor`/`chirpStateAt` (:165-167); prediction state never feeds them | None |
| A2 | Not met | No white mark or "YOUR GUESS" box (:398-446) | Q1/Q2: marks on the arm graph. Q3: a second run-length bar |
| A3 | Not met | Not drawn; Q1 to Q3 are choices (markers only) | Say "only a marker" in the caption |
| A4 | Not met | n/a; the graph appears once the run starts (:411) | Marks only once the trace has been drawn |
| A5 | Not met for Q3 | The end time of the other mass is not drawn at all. Nearest picture: the arm graph; add a small "time to the final moment" bar panel for small vs large mass with its own scale | New panel in the graph area |
| A6 | Not met | No source line under the drawing or graph | Add "calculated here (a simplified stand-in, not LIGO's equations)" |
| A7 | Not met | Intro (:260-308) has no mention of predictions never changing pictures, or white marks. A note at :336-341 says the learner can "change predictions" | New intro text; note beside the mass slider |
| A8 | Not met | Module exports `chirpRunFor`, `chirpStateAt` only. Truth constants live in the component (`ACTUAL_PITCH`, `ACTUAL_LOUDNESS`, `ACTUAL_TIMING`, :28-30) | Module functions for mark positions and real values, with tests |
| A9 | Not met | Tutor compare step states every answer (GravitationalWaveChirpTutor.tsx:77-78); Results does too (:501-515). No marks to point to | As Experiment 1 |
| A10 | Not met | No sentence says guesses do not change results. The only related text says guesses are "locked in", and offers a **"Change predictions"** button after the run (:335-356) | Report only: the button lets a learner change guesses after seeing results, which the newer rule may want reconsidered |

## Rule B
- B0: One Results block (:448-525): a numbers paragraph (frequency and amplitude start and end, cutoff time, strain), arm ranges, an optional "Comparing your two runs" paragraph (:479-500), three prediction lines, and a "A real chirp" note. No tables.
- B1: Real reference: GW150914 rose from about 35 Hz to about 250 Hz over about 0.2 s (:517-523). The toy numbers (1 to about 4) are not on that scale, so a check-up would be "not comparable". Likely N/A.
- B2: Not met.
- B3: Partly met. The "Comparing your two runs" paragraph (:479-500) follows the slider, but it is not a table and has no reference.
- B4: Partly met. Guess beside "In fact" lines, no tag on a row, with a verdict.
- B5: Not met. "x louder" ratio and "strain x 50 %" are computed in the component (:461,:468), not in the module. The `* 50` factor is unexplained.

## Rule C
- C1: Not met. Arms and dots have no text (:404-408); the source is not drawn.
- C2: Partly met. Mass changes the run time and amplitude, but the picture of arms looks alike at start. The two masses are never on screen together.
- C3: Not met. Only a one-line graph legend (:441-445).
- C4 to C6: Not met (no caption, no worked moment, no look-for list).
- C7: Partly met. Intro "What happens" says pitch and loudness "build" (:276-280), and the coin analogy says "speeds up and gets louder" (:268-273): this gives Prediction 1 and 2's answers before the learner predicts (§12). The graph legend says "notice the oscillations getting faster and bigger" (:443-444).
- C8: Partly met. "Chirp" and "strain" are defined in passing; "amplitude" and "frequency" are never defined in the intro. "Mass" scale is "made-up" (:304).

## Other findings
- O1: Spec status says wording approved 2026-09-30; no conflict found.
- O2: (a) Intro gives answers to predictions 1 and 2 (see C7). (b) The "Orbit experiment" (Tutor:129) is a cross-reference by name to a different chapter. (c) "Twin Paradox's turnaround" (Tutor:139) likewise. (d) GW150914 figures (:517-523) have no link.

## What an update would touch, and its size
Component, tutor, physics module (+ tests), spec. **Size: M to L** (Q3 needs a new panel for two masses; the other two marks sit on the existing graph).

## Not checked
Not run in a browser. PROJECT.md/AGENTS.md not read in detail. Real-figure sources not opened.

## Step 1 re-read and additions (2026-11-04)
Re-read of the component, tutor, module and specification against Rule E and against the first report, using the Gravitational Waves 1 audit as the pattern. Nothing was run in a browser; nothing was changed in the app.

- **Corrections to the first report.** The rise is a factor of about **3.16** for every mass (1 ÷ √0.1), not "1 to about 4". The Results sentence "a strain of X means they were off by about |X| × 50 %" is half the strain as a percentage (the arms move by strain ÷ 2); it is correct but unexplained, and it contradicts the Results' own definition ("strain is just how much the arms' length changed, as a fraction of their rest length"), because the arms change by *half* the strain. Experiment 1's audit defined strain as "how strongly the wave is acting on space at one instant"; this page should use the same definition.
- **New finding: the chirp is hard to see on the existing graph (O2).** The module's time scale is 1 ÷ mass and the base frequency is 1, so the number of swings in a run falls as the mass rises. Computed from the module's formulas:

| Mass | Time to the final moment | Swings in the run | Arm swing at the end (from 1.000) |
|---|---|---|---|
| 0.2 | 4.500 | 6.8 | ± 0.009 |
| 0.3 | 3.000 | 4.6 | ± 0.014 |
| 0.5 | 1.800 | 2.7 | ± 0.024 |
| 1.0 (the slider's start) | 0.900 | 1.4 | ± 0.047 |
| 2.0 | 0.450 | 0.7 | ± 0.095 |
| 6.0 | 0.150 | 0.2 | ± 0.285 |

  At mass 1.0 the run has only about one and a half swings, so "the pitch speeds up" can hardly be seen. At masses above about 2 it is less than one swing. At small masses there are enough swings, but the graph's fixed vertical range (0.5 to 1.5) makes the arms' swing of about 0.01 a nearly flat line. This is the existing, approved physics and graph; the audit would not change the physics, but the pictures and the choice of Part 1's mass are the owner's decisions below.
- **E1 to E3 Not met.** One card holds the introduction, three predictions, the mass slider, Run, the arms picture, the graph and the Results; no Parts, coloured lines or leads.
- **E5, a structural question for the owner (as in Experiment 1).** The mass slider is used **before** Run and sets what the run shows. Prediction 3 compares two masses (a small-mass pair and a large-mass pair), but only one mass is ever on screen.
- **A5 refined.** Prediction 3 needs a picture that holds two masses together. Because the module gives the time to the final moment directly (0.9 ÷ mass), a small third picture of two bars can be drawn from calculation, without playing a second run.
- **A10 refined.** The "Change predictions" button after the run reopens the guesses while the results are on screen. In Experiment 1 this role is played by a "Start over" button that clears everything.
- **B5 refined.** The "× louder" ratio and the "× 50 %" strain sentence are computed in the component and need module functions.
- **O2 additions.** (e) The graph legend, shown only after the run starts, says "notice the oscillations getting faster and bigger", which gives Predictions 1 and 2 away if read before the learner has looked for themselves; the introduction's coin picture says it "speeds up and gets louder", and "What happens" says "pitch and loudness both build". (f) The tutor's cross-references "the Orbit experiment" and "the Twin Paradox's turnaround" do not name their chapters. (g) The GW150914 figures (35 Hz to 250 Hz over about 0.2 s) were checked on 2026-11-04: the discovery paper's abstract (arXiv 1602.03837) says the signal "sweeps upwards in frequency from 35 to 250 Hz" and LIGO Lab's "Sources and Types of Gravitational Waves" page calls the first black-hole merger signal "just two-tenths of a second long". The paper's full text could not be read (the PDF was unreadable), so the "about eight cycles" is not used.

### Decisions for the owner before Step 2 (wording)
1. **Page layout (E5).** Same as Experiment 1: Part 1 runs a fixed wave and shows the pictures with the guesses; Part 2 holds the mass slider, "Run your mass" and its own drawings. *Recommended: yes.*
2. **Which mass Part 1 uses.** *Recommended: 0.3* (4.6 swings, so the rise in pitch can be seen), not the slider's current 1.0 (1.4 swings).
3. **The graph's vertical scale.** *Recommended:* choose the range from the run (a round number just above the final swing, written on the axis), so the swing is visible at any mass. The alternative is to keep 0.5 to 1.5, which hides the chirp at small masses. This changes the picture, not the physics.
4. **Prediction 3's picture.** A new "Picture 3: the time to the final moment" with two bars, a small-mass pair and a large-mass pair, drawn from the module, with the white guess mark beside the bars. *Recommended reference masses: 0.3 (the pair in Part 1) and 3.0 (a pair ten times heavier),* giving 3.000 and 0.300.
5. **Predictions 1 and 2.** White markers on the graph (as in Experiment 1: a marker for each choice, with a YOUR GUESS box). The exact marker designs come in Step 2's draft.
6. **"Change predictions" button.** Replace with "Start over", as in Experiment 1. *Recommended: yes.*
7. **Introduction.** Rewrite "A daily-life picture" (the coin) and "What happens" so they do not give Predictions 1 and 2; keep a daily-life picture that does not give the answer away. *Recommended: yes.*
8. **Strain.** Use Experiment 1's definition and explain the "× 50 %" (the arms move by half the strain). *Recommended: yes.*
9. **Results.** Replace the paragraphs with a small table (start and end frequency and amplitude, the rise, the time to the final moment, the arms' ranges), with a "What this table tells us" note; keep "Comparing your two runs" in Part 2. No check-up (GW150914's 35 to 250 Hz in 0.2 s is a rise of about 7 times, against 3.16 here, so there is no like-for-like reference). *Recommended: yes.*
10. **Introduction aids and links.** "Some new words", "Words and formulas" (formulas that would reveal an answer held back until after the run) and "Want to know more?" as in Experiment 1, with fresh links to be fetched in Step 2. Cross-references to be named. *Recommended: yes.*

### Correction (2026-11-06)
The column "Arm swing at the end (from 1.000)" in the table above is the wave's size at the final moment (half the amplitude), not where the arms are when the run stops. The run ends part-way through a swing, so the arms are usually not at that extreme (mass 0.3: Arm X is 0.995 at the final moment, and its longest length in the run is 1.012, not 1.014). The "swings in the run" column is unchanged. See `02-draft-wording.md`, "Revision of 2026-11-06".

## Outcome (2026-11-06)
How the ten decisions were resolved (the owner said "all defaults" on 2026-11-04; detail in `02-draft-wording.md` and the specification's last Implementation Note):
1. **Layout:** as Experiment 1 (four Parts; Part 2 after the Part 1 run). Done.
2. **Part 1's mass:** 0.3. Done. (Part 2's slider starts at 0.5, not 1.0: at 1.0 the run has only 1.4 swings.)
3. **Graph range:** chosen from the run (the largest distance from 1.000 either arm reaches, rounded up to the next 0.01). Done.
4. **Prediction 3's picture:** Picture 3 (bars for 0.3 and 3.0) in Part 1, and Drawing C (the Part 1 pair and your pair) in Part 2, each with the white guess diamond. Done.
5. **Predictions 1 and 2:** white brackets and arrows on Picture 2, and on Drawing B where a full first swing and two peaks exist. Done.
6. **"Change predictions":** replaced by "Start over". Done.
7. **Introduction:** the coin and the give-away lines replaced; four explanatory paragraphs added. Done.
8. **Strain:** Experiment 1's definition; "× 50 %" replaced by "each arm moves by half the strain". Done.
9. **Results:** Tables 1 to 3 with notes and a check-up (a check-up was judged "likely not applicable" in the first report; it was built against GW150914 with three rows, one of them "not comparable"). Done.
10. **Aids and links:** "Some new words", "Words and formulas", "Want to know more?" (five plain pages and the paper). Done.
Corrections found while building: the first report's "arm swing at the end" column is the wave's size at the final moment, not where the arms end (see the correction above); the sentence "mass changes only how long the chirp takes" is false in the module and was replaced; the early draft's pink lines and the mass 6 worked moment were wrong and were fixed before building. Rule E (the four Parts): met. The owner approved the finished page on 2026-11-06. Still open: the agent's own browser check and the checks listed in `docs/audit/PROGRESS.md`, and the source gap for "orbit" and "spiral".

