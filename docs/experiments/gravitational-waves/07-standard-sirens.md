# Gravitational Waves — Experiment 7: Standard Sirens (How Far, How Fast)

**Status: implemented. Physics model, physics tests, interface, prediction interaction, results panel, and AI tutor are built and wired into the guided journey. It has had its complete-flow test and final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` (`CLAUDE.md` §21 Step 10; one gap found and fixed — a specialized unit, "Mpc," was used throughout without ever being defined in plain language — see "Implementation Notes"). The owner's line-by-line wording approval (`CLAUDE.md` §28.1) has not yet been done.**

---

## Overview

Experiments 1–6 modeled emission (Exp 1), the chirp's buildup (Exp 2), its energy source (Exp 3), two real named events (Exp 4), motion-based redshift (Exp 5), and localization by arrival timing (Exp 6). None of them asked the question that made GW170817 historically significant: *can a gravitational wave, on its own, tell you how far away its source is — and what is that good for?*

This experiment introduces one new, self-contained idea: a gravitational wave's amplitude weakens with distance, the same way sound or light does, but the chirp's own shape (how fast its frequency rises) depends only on the masses involved — not on distance. Comparing the two tells you the distance, without needing any other distance measurement. This is a **standard siren**, the gravitational-wave counterpart of a "standard candle" in ordinary astronomy. Combined with a source's recession velocity (how fast it is moving away, measured separately from its host galaxy's light), the inferred distance gives an estimate of the **Hubble constant** — how fast the universe is expanding.

No chirp, strain, energy-loss, Doppler, or arrival-time physics from Experiments 1–6 is modified. The only new formula is the distance-amplitude relationship below.

---

## Learning Objective

After this experiment, the learner should understand:

1. A gravitational wave's amplitude weakens with distance from its source, the same way a sound or a light gets fainter the farther away it is.
2. The chirp's shape — how quickly its frequency rises — depends only on the masses involved, not on distance. That means the *true* amplitude at the source can be worked out without already knowing how far away it is.
3. Comparing that true amplitude to the weaker amplitude actually detected lets you work out the distance to the source — a standard siren.
4. Pairing that distance with the source's recession velocity (measured independently, from its host galaxy's light) gives an estimate of the Hubble constant — without the traditional ladder of distance measurements astronomy otherwise depends on.
5. This is exactly what GW170817 (Experiment 4) let astronomers do in 2017 — the first-ever gravitational-wave "standard siren" measurement of cosmic expansion. GW150914 (also Experiment 4) could *not* be used this way, because it had no light counterpart and so no host-galaxy recession velocity was ever measured for it.

---

## Physical Situation

Reuses Experiment 2's chirp model exactly, for one of the two real event presets already established in Experiment 4 (GW150914, GW170817), each with the same `toyMass` values already defined there. The learner chooses a distance for the signal to travel before being "detected," and compares the resulting (weakened) detected amplitude to the true amplitude the chirp's own shape implies.

### Simplifying assumptions (must be stated to the learner, in plain language)

- Amplitude is modeled as falling off in exact inverse proportion to distance (a toy relationship, in schematic units) — not the precise general-relativistic luminosity-distance formula, which also depends on the universe's expansion history.
- The "true" amplitude is read directly from Experiment 2's existing chirp formula for the chosen mass — this experiment does not model the real, much harder problem of extracting mass purely from an observed waveform's shape; it assumes that step is already solved.
- Recession velocities are given, real, approximate published values for each event's host galaxy — not computed from this project's own Doppler model (Experiment 5), since in reality this number comes from the host galaxy's own light, not from the gravitational wave itself.
- GW150914 has no real recession velocity to give, because it had no light counterpart (Experiment 4) and so no host galaxy redshift was ever measured for it — the Hubble-constant step is only possible for GW170817, a real limitation, not a simplification.
- The real 2017 Hubble-constant measurement from GW170817 had substantial uncertainty (on the order of ±15%, roughly 62–170 km/s/Mpc in the original published range). This experiment's single toy number is illustrative only and must not be presented as matching the real value precisely.

### Not introduced

The real general-relativistic luminosity-distance formula, cosmological redshift from spacetime expansion itself (as opposed to a given recession velocity), statistical "dark siren" methods used when no host galaxy is known, and any change to this chapter's existing chirp/strain/energy/Doppler/arrival-time physics — all out of scope, consistent with keeping this experiment to one new idea (`CLAUDE.md` §16).

---

## Physics Model

New, self-contained, and reusing Experiment 2's existing chirp output unchanged (`CLAUDE.md` §9):

```typescript
// src/physics/standardSirenExperiment.ts

import { chirpStateAt, chirpRunFor } from './gravitationalWaveChirpExperiment'
import { REAL_EVENT_PRESETS, type RealEventPreset } from './gravitationalWaveRealEventsExperiment'

export interface DistancePreset {
  label: string
  distanceMpc: number
}

// Three ways to set distance, matching the owner's "all three" decision:
// 1. The event's own real distance (computed from the real light-year figures already stated
//    in gravitationalWaveRealEventsExperiment.ts's realDescription, converted to megaparsecs).
// 2. Schematic "Nearby" / "Far" presets, for visible contrast at a fixed mass.
// 3. A free, continuous custom distance (a slider), matching Experiment 4's own precedent.
export const REAL_EVENT_DISTANCES_MPC: Record<RealEventPreset['id'], number> // ≈400 (GW150914), ≈40 (GW170817)
export const SCHEMATIC_DISTANCE_PRESETS: DistancePreset[] // "Nearby" and "Far", exact values left to implementation

// Real, approximate published recession velocity for each event's host galaxy - not computed
// from this project's own Doppler model (Experiment 5). `null` where none exists in reality.
export const RECESSION_VELOCITY_KM_PER_S: Record<RealEventPreset['id'], number | null>
// { gw150914: null, gw170817: ≈3017 }

// The only new formula: a toy inverse-distance falloff (schematic units, not the precise
// general-relativistic relation - see "Simplifying assumptions").
export function detectedAmplitude(trueAmplitude: number, distanceMpc: number): number {
  return trueAmplitude / distanceMpc
}

// Inversion: recovers distance from a true amplitude (read from chirpStateAt) and a detected
// amplitude - the standard-siren step itself.
export function inferredDistanceMpc(trueAmplitude: number, detectedAmplitude: number): number {
  return trueAmplitude / detectedAmplitude
}

// Combines the inferred distance with a given recession velocity. Returns null if no velocity
// is available for the event (GW150914).
export function estimatedHubbleConstant(
  recessionVelocityKmPerS: number | null,
  distanceMpc: number
): number | null
```

`trueAmplitude` for a given run is simply `chirpStateAt(...).amplitude`, read at the same simulated time used for the run's display — no new formula, a direct reuse of Experiment 2's existing output.

Structured independently of the UI, per `CLAUDE.md` §9 — pure functions of amplitude and distance, testable with no browser.

---

## Learner Controls

- **Event**, a choice of the two real presets already defined in Experiment 4 (GW150914, GW170817) — no new mass control.
- **Distance**, per the owner's confirmed decision to include all three approaches:
  1. the event's own real distance (default),
  2. two schematic presets, "Nearby" and "Far," for visible side-by-side contrast,
  3. a free custom distance slider (matching Experiment 4's own free-slider precedent).
- **Run**, reusing the chirp/detector-arm animation style from Experiments 2, 4, and 5 (per the owner's confirmed decision), now also displaying the true and detected amplitude numbers side by side as the run plays.

---

## Prediction Activity

Before the control and results are shown, the learner is asked two questions in sequence:

1. "If the same kind of merger happened once nearby and once far away, which one would look stronger — bigger strain — by the time it reached Earth?" (Nearby louder / Far louder / No difference)
2. "If you only saw the weaker, detected amplitude, could you work out the distance without separately knowing how strong the wave truly was at the source?" (Yes / No)

Choices are not scored. The control is disabled until both predictions are entered, consistent with the rest of the project.

---

## Experiment Behavior

### Display

- Reuses the chirp/detector-arm visual style of Experiments 2, 4, and 5: the two detector arms stretching and squeezing as the chirp plays.
- A live readout of two numbers as the run plays: the true (source) amplitude, read directly from the chirp, and the detected (weakened) amplitude after the chosen distance's falloff is applied.

### Results

States the chosen event and distance, the true and detected amplitudes, and the distance recovered by comparing the two (`inferredDistanceMpc`) — demonstrating, as a round-trip check the learner can see work, that it matches the distance that was actually chosen. Then, only if a real recession velocity exists for the chosen event (GW170817 only):

- Shows the given recession velocity and the resulting estimated Hubble constant (`estimatedHubbleConstant`).
- Compares it to the real published value, with a **prominently and clearly flagged** caveat — set apart visually, not buried in a sentence — stating that the real 2017 measurement carried large uncertainty (roughly ±15%, a published range of about 62–170 km/s/Mpc) and that this experiment's single number is an illustration of the method, not a precise replica of the real result.

If GW150914 is chosen, the Results panel instead explains plainly why this step isn't possible for it: no light counterpart (Experiment 4) means no host-galaxy recession velocity was ever measured, so real scientists could not pair this event with a redshift either.

### Introductory text

To be drafted during implementation, covering: the question (can a gravitational wave alone tell you how far away it came from?), what happens, the learner's job (both predictions), what to look for, the new terms ("standard siren," "Hubble constant") defined in plain language, and the assumptions above — subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "What did you notice about the true amplitude compared to the detected amplitude?"
  2. Prediction comparison: the learner's two predicted answers beside what actually happened.
  3. Conceptual question: "If a gravitational wave's amplitude alone doesn't tell you the distance, what does, and why does the chirp's shape matter here?"
  4. Explanation: (1) amplitude weakens with distance, the same inverse relationship as sound or light; (2) the chirp's shape reveals the true, distance-independent amplitude, because it depends only on mass; (3) comparing the two gives distance directly — the standard-siren method; (4) pairing that distance with a separately measured recession velocity gives an estimate of the Hubble constant, exactly as done for GW170817 in 2017 — and explicitly why GW150914 could not be used the same way.

---

## Required Physics Tests

1. `detectedAmplitude` follows the exact inverse-distance law for sample values (doubling distance exactly halves detected amplitude).
2. `inferredDistanceMpc` exactly recovers a distance that was used to compute a `detectedAmplitude` from a given true amplitude (round-trip consistency).
3. For equal mass, a farther distance produces a strictly smaller detected amplitude than a nearer one (confirms the premise the first prediction depends on).
4. `estimatedHubbleConstant` returns `null` when given a `null` recession velocity (the GW150914 case), and otherwise returns the plain, correctly computed ratio of velocity to distance.
5. `chirpStateAt`'s amplitude output is read, not recomputed — a regression check confirming this experiment does not duplicate or modify Experiment 2's own formula.

---

## Decisions Confirmed

Confirmed by the owner in conversation on 2026-10-05:

1. **All three distance approaches are included**: the event's own real distance, schematic "Nearby"/"Far" presets, and a free custom slider.
2. **Recession velocity is given explicitly as a real, separately measured value**, with the data source (the host galaxy's own light, not the gravitational wave) stated plainly to the learner — not computed from Experiment 5's Doppler model.
3. **No black-hole-ringdown experiment for now.** Standard Sirens is this phase's next (and likely closing) experiment; ringdown/the final black hole remains a possible future idea, not pursued.
4. **Visualization reuses the existing chirp/detector-arm animation style** from Experiments 2, 4, and 5, rather than a new diagram type.
5. **The real-value comparison's uncertainty caveat must be much more prominent** than this project's usual inline caveat sentence — visually set apart, not just mentioned in passing.

---

## Decisions Needing Human Review

None open at the specification stage. Exact numeric constants not called out above (the "Nearby"/"Far" schematic distance values, the free slider's range, and the animation's playback timing) are left to implementation judgment, following this project's existing conventions for similar presentational constants in prior experiments.

---

## Success Criteria

1. No existing experiment's physics (chirp, strain, energy loss, Doppler, arrival-time) is modified or recomputed; this experiment's only new formulas are the distance-amplitude relationship and the Hubble-constant ratio.
2. The learner makes both predictions before the control and results are shown.
3. Choosing "Nearby" vs. "Far" at equal mass produces a visibly, clearly different detected amplitude.
4. The Results panel's recovered distance matches the distance the learner actually chose, demonstrating the standard-siren method as a round trip the learner can verify.
5. The Hubble-constant step is shown only for GW170817 and is explicitly explained as unavailable for GW150914, with the real reason stated (no light counterpart, Experiment 4).
6. The real-value comparison's uncertainty caveat is visually prominent, not an inline aside.
7. The learner can, after the tutor conversation, state in their own words why a wave's detected amplitude alone isn't enough to know its distance, and what additional piece of information (the chirp's own shape) supplies what's missing.
8. The introduction and tutor both tie this experiment back to Experiment 4's GW170817 example, without restating or recomputing that experiment's own physics.

---

## Implementation Notes

Approved by the owner (2026-10-05). Per `CLAUDE.md` §21/§23 Stage 5 and §6 (one step at a time), implementation has begun.

The physics model is built (`src/physics/standardSirenExperiment.ts`): `REAL_EVENT_DISTANCES_MPC` (each event's real distance, converted from the light-year figures already stated in `gravitationalWaveRealEventsExperiment.ts` — GW150914 ≈400 Mpc, GW170817 ≈40 Mpc), `SCHEMATIC_DISTANCE_PRESETS` ("Nearby" 10 Mpc, "Far" 1000 Mpc), `RECESSION_VELOCITY_KM_PER_S` (GW150914: `null`; GW170817: 3017 km/s, the real published value for its host galaxy NGC 4993), `detectedAmplitude`, `inferredDistanceMpc`, and `estimatedHubbleConstant`. All 5 of "Required Physics Tests" are covered in `src/physics/standardSirenExperiment.test.ts`: the exact inverse-distance law; round-trip distance recovery; farther-is-fainter monotonicity; `null`-velocity handling for GW150914; and a regression check confirming `chirpStateAt`'s amplitude is read, not recomputed. New suite: 7/7 passing. Full project suite: 301/301 passing. `tsc --noEmit` clean.

Basic UI is also built (`src/components/GravitationalWaveStandardSirenExperiment.tsx`): event toggle buttons (reusing Experiment 4's `REAL_EVENT_PRESETS`), a distance control offering all three of the owner's confirmed approaches (the event's own real distance, "Nearby"/"Far" schematic presets, and a free custom slider), "Run" (reusing Experiment 2's chirp/detector-arm animation style, per the owner's confirmed decision), and a live readout of true amplitude, detected amplitude, the distance recovered by comparing the two, and either the resulting estimated Hubble constant or — for GW150914 — a plain-language explanation of why that step isn't possible for it. Wired into the guided journey (`src/App.tsx`, as "Standard Sirens" under the "Gravitational Waves" group, with Experiment 6's "next" text updated to point to it). A draft introduction (question, what happens, what to look for, a new-term definition, and the assumptions) is included, not yet given the owner's line-by-line review per `CLAUDE.md` §28.1. This step deliberately has no prediction gating, results panel, or tutor yet.

Verified in a browser (`http://localhost:5173/`): GW170817 at its real distance (40 Mpc) correctly showed true amplitude 0.0285, detected amplitude 0.000712, a recovered distance of exactly 40.0 Mpc, and an estimated Hubble constant of 75.4 km/s/Mpc (matching 3017 ÷ 40 by hand). Switching to GW150914 at its real distance (400 Mpc) correctly showed true amplitude 0.5218, a recovered distance of exactly 400.0 Mpc, and the plain-language explanation of why no Hubble-constant estimate is possible for it. The "Custom" distance control correctly revealed a slider (defaulting to 100 Mpc) and reset the run state when selected. The detector arms animate and settle into their final stretched/squeezed position on completion, matching the existing chirp visual style. No console errors. Full suite (301/301) and `tsc --noEmit` remain clean.

The learner prediction interaction is also built: both required questions (per "Prediction Activity") gate the event, distance, and Run controls until answered, matching the project's established pattern — predictions lock in on first "Run" and a "Change predictions" control reopens both without resetting the chosen event or distance. The introduction's "Your job" paragraph, deliberately omitted in the basic-UI step, was added here. Verified in a browser: the Event and Distance controls and "Run" are disabled before both questions are answered; answering both ("The nearby one" / "Yes") unlocks them and shows "Your predictions: The nearby one, Yes"; running locks both predictions in and shows "Your predictions are locked in above..."; "Change predictions" correctly reopens both questions for editing (re-enabling their buttons) while leaving the chosen event and distance untouched and leaving `hasPrediction` true (so the controls and Run stay usable, consistent with the rest of the project's precedent). No console errors. Full suite (301/301) and `tsc --noEmit` remain clean.

The Results panel is also built, per the specification's "Results" section: states the chosen event and distance, the true and detected amplitudes, and the distance recovered by comparing the two — explicitly stating that it matches the distance actually chosen, as the round-trip check the learner can verify (Success Criterion 4). It also compares both submitted predictions to the actual outcome (not explicitly spelled out in the specification's "Results" section, but added as a direct application of the predict → observe → explain pattern every other experiment in this project follows): the near/far prediction against the guaranteed inverse-distance-law outcome (a nearby source is always stronger), and the "can detected amplitude alone reveal distance" prediction against the guaranteed "no" (the true amplitude is always needed too) — both guaranteed by the physics model itself, not dependent on the learner's chosen event or distance. For GW170817, it shows the recession velocity and resulting Hubble constant, followed by a visually distinct, bordered amber callout box (not an inline sentence) stating the real 2017 measurement's substantial uncertainty (≈62–170 km/s/Mpc) per the owner's explicit "much more prominently" instruction (Success Criterion 6). For GW150914, it explains in plain language why no Hubble-constant estimate is possible, naming the real reason (no light counterpart, Experiment 4) consistent with Success Criterion 5. Verified in a browser with deliberately wrong predictions ("The far one" / "Yes") on GW170817 at its real distance: the Results panel correctly showed the round-trip distance match (40.0 Mpc), correctly flagged both predictions as "off this time," showed the Hubble constant (75.4 km/s/Mpc) with the prominent amber caveat box, then correctly repeated the round-trip and prediction checks for a second run on GW150914, this time showing the plain-language no-recession-velocity explanation with no caveat box (correctly omitted, since there is no Hubble-constant number to caveat). No console errors. Full suite (301/301) and `tsc --noEmit` remain clean.

The AI tutor is also built (`src/components/GravitationalWaveStandardSirenTutor.tsx`), following the predict → observe → explain pattern of the prior experiments exactly as specified: an observation question comparing true and detected amplitude, a prediction-comparison step (restating both submitted predictions against the actual true/detected amplitudes and the recovered distance for the chosen event), a conceptual question about what the chirp's shape supplies that amplitude alone doesn't, then the four-point explanation from "AI Tutor Behavior" (the inverse-distance falloff; the chirp's shape as a distance-independent amplitude reference; the standard-siren inference itself; and the Hubble-constant tie-in, dynamically showing the actual computed value and its uncertainty caveat for GW170817, or the real reason no estimate is possible for GW150914). Wired with `onExplained`/`onTutorComplete` and a `key={runCount}` reset matching the rest of the project's precedent. Verified in a browser (`requestAnimationFrame` had to be patched to `setTimeout` for this automated session only, since the hidden/backgrounded automation tab fully suspends `rAF` rather than merely throttling it — a testing-environment limitation, not an application bug; the same run-completion code had already been confirmed working in prior, unpatched browser verification during Steps 2–4 of this experiment): completed all three reflection steps after a GW170817 run with predictions "The nearby one" (correct) and "No" (correct); each step showed correct, run-specific data; the four-point explanation displayed correctly, including the dynamic Hubble-constant figure (75.4 km/s/Mpc) and its uncertainty caveat in point 4; and the App-level "What you learned"/"What's next" chapter summary appeared immediately after, with `localStorage` confirming `{"completed":[25,26],"explained":[25,26]}`. No console errors. Full suite (301/301) and `tsc --noEmit` remain clean.

Per `CLAUDE.md` §21 Step 9, this completed the experiment's basic implementation (physics model, physics tests, UI, prediction interaction, results panel, AI tutor).

Its complete-flow test (2026-10-05) covered the full learner path in a fresh browser profile (`localStorage` cleared beforehand; confirmed `{"currentChapter":-1,"completed":[],"explained":[]}` before starting): sidebar navigation into the chapter (`Gravitational Waves` expanded, then "7. Standard Sirens" selected) reached the experiment from a cold start; the full introduction rendered; the Event, Distance, and Run controls were confirmed disabled before any prediction was entered. The "Custom" distance control was exercised through a full run for the first time (not covered in the step-by-step verification above): set to 777 Mpc on GW170817, it correctly produced a detected amplitude of 0.000037 and a recovered distance of exactly 777.0 Mpc, matching what was chosen. "Change predictions" was then exercised: it correctly reopened both questions while preserving the prior selections. A second run — switching to GW150914, "Nearby" (10 Mpc), and new predictions — produced a correct new Results panel (true amplitude 0.5218, recovered distance exactly 10.0 Mpc, both predictions correctly flagged) with no stale data from the first run, and correctly showed the GW150914 "no recession velocity" explanation with no Hubble-constant caveat box. The tutor's three reflection steps and four-point explanation completed correctly for this second run, with point 4 correctly selecting its GW150914-specific branch. `localStorage` confirmed `{"currentChapter":26,"completed":[26],"explained":[26]}` afterward. No console errors at any point (`requestAnimationFrame` patched to `setTimeout` for this automated session only, per the same testing-environment note as the AI-tutor verification above).

Its final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` (`CLAUDE.md` §21 Step 10, 2026-10-05) found one gap and fixed it: "Mpc" (megaparsec) appeared throughout the Distance control, live readout, and Results panel, but was never defined in plain language anywhere — a violation of `CLAUDE.md` §15 and `AGENTS.md`'s "define every specialized term before use" requirement, particularly significant for a project explicitly aimed at learners with only basic science knowledge. Fixed by adding a new "A note on units" paragraph to the introduction, placed immediately before "What to look for" (the controls' first use of the term), defining Mpc in plain language with a concrete light-year comparison and anchoring it to GW170817's own real distance. Re-verified in a browser: renders correctly, in the right place relative to the controls. Full suite (301/301) and `tsc --noEmit` remain clean. No further gaps found.

After that review, the owner reported the diagram itself was a real gap missed by the review: it showed only two bare lines with no labels, no source, and no caption, and — more substantively — it never visually distinguished the true amplitude from the detected amplitude at all, so switching between "Nearby" and "Far" produced an identical-looking animation even though the underlying numbers differ by orders of magnitude. This was a real omission, not just a polish request: every other experiment in this chapter (2, 4, 5, 6) has a labeled source/arms and a "How to read this diagram" caption, a pattern this experiment's basic-UI step never carried forward. Fixed:

- The arms are now driven by the DETECTED strain (distance-attenuated), not the true strain, so the diagram actually shows what a detector receives — matching the experiment's own point. The raw detected strain is always too small to see at any modeled distance, so it is scaled for display only (`CLAUDE.md` §11) by `sqrt(NEARBY_REFERENCE_MPC / distanceMpc)`, calibrated so the "Nearby" preset (10 Mpc) pulses at the same visual intensity this project's other chirp diagrams already use for the undivided true strain, fading visibly from there as distance grows — itself the correct lesson, since a genuinely distant source really is much harder to detect. A first attempt (dividing the raw strain by `sqrt(distanceMpc)` with no reference-distance calibration) was tried and found, by direct numeric sampling of the rendered SVG during a live run (not just a single static frame), to be far too faint at every distance to read (peak stroke width barely moved off its resting value even at "Nearby"); the recalibrated version was verified the same way to reach the full visual range at "Nearby" (peak stroke width hit its existing cap of 11, matching Experiments 2/4/5's own established ceiling) and a clearly reduced range at "Far" (peak stroke width ≈3.1, cleanly between resting and "Nearby"'s cap).
- Added a labeled "the source" — the merging pair driving the wave, reusing Experiment 4's illustrative orbiting-pair pattern, pulsing with the TRUE (distance-independent) strain, so the learner can see the source and the detector behave differently side by side.
- Added direct on-canvas labels to both arms ("Arm X (detected)" / "Arm Y (detected)").
- Added a "How to read this diagram" caption below the animation, explaining the source, the arms, and explicitly stating that the arms' motion is scaled for visibility only, with the exact numbers given above and in the Results panel.

Re-verified in a browser: the source pulses, the arms are labeled, the caption renders correctly below the diagram, and — confirmed by sampling the rendered SVG's `stroke-width` attribute across a live run rather than relying on a single screenshot — "Nearby" and "Far" now produce clearly, measurably different animations at equal mass, closing the gap between what the diagram shows and what the live readout and Results panel already stated in numbers. Full suite (301/301) and `tsc --noEmit` remain clean. No console errors.

The owner also asked whether this project's standing instructions (`CLAUDE.md`, `AGENTS.md`, `docs/PROJECT.md`) require this level of animation detail (labeled components, a live readout, a caption) for every experiment, so it isn't missed again in the future. They did not, at the time — this pattern had emerged only through iterative owner feedback on earlier experiments (Experiments 4, 5, 6 of this chapter each went through multiple post-hoc rounds of "add labels," "add a caption," "the diagram doesn't show X" before reaching their current form) and was never written forward as a requirement, which is exactly why this experiment's first pass missed it. A new "Animated Diagrams" subsection was added to `CLAUDE.md` §14 at the owner's request, requiring every future experiment's first UI pass to label every drawn component, visually distinguish any two compared quantities, and include a "How to read this diagram" caption — proactively, not retrofitted from feedback.

The owner then reported two further gaps in a single round of feedback: the live readout's font size should be smaller, and the arms' pulsing was barely noticeable. Both fixed:

- The live readout (`src/components/GravitationalWaveStandardSirenExperiment.tsx`) was reduced from `0.875rem` to `0.75rem` and given the muted text color already used for secondary captions elsewhere in this file, matching the "de-emphasized auxiliary info" treatment used throughout this project rather than the `0.875rem` primary-text size its two sibling experiments (Energy, RealEvents) use for their own live readouts — a deliberate exception for this experiment only, not a project-wide change.
- The arms' barely-visible pulsing was a real calibration problem, not just a polish request: the prior display scaling (`chirpState.strain * sqrt(NEARBY_REFERENCE_MPC / distanceMpc)`) only matched this project's established visual intensity at the single "Nearby" (10 Mpc) point; GW170817's own real distance (40 Mpc, the default view) produced a barely perceptible pulse (verified by directly sampling the rendered SVG during a live run: peak stroke width only 2.3, arm deviation only 1.3px). Replaced with a square-root compression of the raw physical ratio (`chirpState.strain / distanceMpc`) — the same principle behind a decibel scale, used here because the real quantity spans several orders of magnitude across this experiment's full mass and distance range and a single linear factor is either invisible at realistic distances or blown out at close ones — followed by a tuned visual gain and a magnitude cap to keep the arm geometry sane at the closest/loudest extreme. A glow effect (blurred duplicate lines behind the sharp arms, plus a pulsing box-shadow around the whole diagram) was also added, reusing Experiment 4's established glow pattern, to make the activity read more clearly. Re-verified by sampling the rendered SVG across live runs rather than relying on static screenshots: GW170817 at its own real distance now swings the arm by ≈21px (previously ≈1px); "Nearby" reaches ≈36px; "Far" (1000 Mpc) is modest but still clearly perceptible at ≈3.5px — a monotonic, now-visible progression at every distance this experiment offers, not just one calibration point. Full suite (301/301) and `tsc --noEmit` remain clean. No console errors.

The owner's line-by-line wording approval (`CLAUDE.md` §28.1) for this experiment as a whole has not yet been done.
