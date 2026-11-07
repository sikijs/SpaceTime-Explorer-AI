# Gravitational Waves — Experiment 5: Stretched by Motion (Redshift of a Receding Source)

**Status: approved (2026-10-04), per `CLAUDE.md` §23 Stages 1–4 following the milestone after Experiment 4. The owner confirmed the direction and all four "Decisions Needing Human Review" items, then approved this specification as written (this experiment was already named as the planned next step in Experiment 4's own specification, "Decisions Confirmed" item 2). Physics model, physics tests, UI, prediction interaction, results panel, AI tutor, and introductory text are built and wired into the guided journey; see "Implementation Notes." Its complete-flow test is done, re-run after the beacon/trace/counter visual work above (2026-10-04, no gaps found either pass). Its final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` (CLAUDE.md §21 Step 10) is complete (2026-10-04; no gaps found). The owner's line-by-line wording approval (§28.1) is complete (2026-10-04), approved as written with no changes requested.**

This specification was drafted per `CLAUDE.md` §23 Stage 3, following the proposal Claude Code made in conversation on 2026-10-04, in direct response to Experiment 4's own specification naming this as the next experiment.

---

## Overview

Experiments 2–4 built a complete toy model of an inspiraling pair's chirp, driven entirely by the source's own mass. None of them asked what happens if the source itself is moving relative to the detector.

This experiment reuses Experiment 2's exact chirp physics unchanged, and adds one new idea: if the source is receding from the detector, the detector receives the wave stretched out — lower in frequency than it was emitted at. This is the same **Doppler effect** already familiar from an ambulance siren dropping in pitch as it drives away, now shown for a gravitational wave. It also reveals a twist: the real stretching is slightly *more* than the familiar sound/light Doppler effect alone would predict, because of **time dilation** — the Relativity of Time and Motion chapter's own effect, reused directly here, not reintroduced.

**Redshift**, the general term for a wave arriving stretched to a lower frequency than it was sent at, is already defined for the learner (Gravity and Curved Spacetime, Experiment 2) and is reused here unchanged, not redefined. "Doppler effect" gets its first plain-language definition in this experiment.

---

## Learning Objective

After this experiment, the learner should understand:

1. A moving source changes the frequency an observer detects — the Doppler effect — the same basic effect already familiar from sound (a passing ambulance's siren).
2. For a source moving *away* from the detector, the detected frequency is lower than the emitted frequency: it is redshifted.
3. The real amount of stretching is somewhat more than the classical (sound-like) Doppler guess, because relativistic time dilation (already taught in the Relativity of Time and Motion chapter) adds an extra stretch on top of it.
4. This velocity-based redshift is only one contributor to a real detected gravitational wave's total redshift. For very distant real sources, the dominant contributor is the cosmological expansion of space itself while the wave travels — a separate effect this experiment does not model.

---

## Physical Situation

The same single L-shaped detector and chirp process as Experiment 2, now explicitly observed from a detector that the source is receding from at a controllable speed, along the line directly connecting them (no sideways motion). Only one wave pattern is shown, exaggerated, exactly as in Experiments 1–4.

### Simplifying assumptions (must be stated to the learner, in plain language)

- Everything Experiments 1–4 already state still applies here unchanged: the effect is hugely exaggerated, only one wave pattern is shown, no real detection hardware is modeled, the merger itself is not modeled, and the chirp/energy formulas are simplified stand-ins, not the real post-Newtonian equations.
- **The source moves directly away from the detector only** — no sideways motion, and no approaching ("blueshifted") case. This keeps the experiment to the simplest version of the effect.
- **This experiment models only the velocity-based (Doppler) part of redshift.** Cosmological redshift — the stretching caused by space itself expanding while the wave travels across billions of light-years — is a separate, typically much larger effect for real detected events, and is not modeled here.
- **The source's own mass is fixed at one default value**, not a learner control, so the experiment isolates the one new idea (motion-based stretching) without re-mixing in the mass-based loudness/duration idea Experiments 2–4 already taught.

### Not introduced

Blueshift (an approaching source), transverse Doppler (sideways motion), cosmological/expansion redshift, and any new mass-based control — all explicitly out of scope, consistent with keeping this experiment to a single new idea (`CLAUDE.md` §16).

---

## Physics Model

Reuses Experiment 2's `chirpStateAt`/`chirpRunFor` exactly, imported and not recomputed, for everything about the chirp itself (frequency, amplitude, strain, arm lengths) as it unfolds at the source. Reuses the Relativity of Time and Motion chapter's own `timeDilationFactorFor` (`src/physics/movingClockExperiment.ts`) exactly, imported and not recomputed.

The only new code is two small, explicitly-labeled functions:

```typescript
// src/physics/gravitationalWaveRedshiftExperiment.ts

import { timeDilationFactorFor } from './movingClockExperiment'

// Units match movingClockExperiment.ts: speed is a fraction of c (c = 1).

// The classical (non-relativistic) Doppler stretching factor for a source receding directly
// along the line of sight — the same relationship a receding sound or light source already
// follows. Not a new physical idea; a direct restatement of the everyday Doppler effect.
export function classicalDopplerFactorFor(speed: number): number

// The full relativistic Doppler factor: the classical stretching above, combined with this
// project's own time dilation factor (reused unchanged, not reintroduced). This is the exact
// relativistic Doppler formula, built from two pieces the learner already has rather than
// presented as one new, unexplained equation.
export function dopplerFactorFor(speed: number): number // = classicalDopplerFactorFor(speed) * timeDilationFactorFor(speed)
```

**How the animation is driven (no change to `chirpStateAt` itself):** the UI advances its own fixed-length "observer elapsed time" window each run, exactly as Experiments 2–4 advance `displayedTime` today. Before passing that time into `chirpStateAt`, it is scaled by `dopplerFactorFor(speed)`:

```
sourceProperTime = observerElapsedTime * dopplerFactorFor(speed)
chirpState = chirpStateAt(sourceProperTime, mass, baseFrequency, baseAmplitude)
```

Because `dopplerFactorFor(speed) < 1` for any receding speed, the same fixed real-world viewing window now advances the source's own chirp process more slowly — so the arms visibly pulse less often per second of real time as speed increases. This is not a cosmetic "slow motion" toggle (`CLAUDE.md` §11): the stretching is driven entirely by the physical `dopplerFactorFor(speed)` value, the same quantity the live readout displays, so the animation and the numbers always agree.

The live readout shows both:
- **Frequency as emitted** — `chirpState.frequency` directly (the source's own instantaneous frequency, unaffected by its motion).
- **Frequency as detected** — `chirpState.frequency * dopplerFactorFor(speed)` (what the detector's instrument actually measures).

At `speed = 0`, `dopplerFactorFor(0) = 1`, so emitted and detected frequencies match exactly and the animation behaves exactly as Experiment 2's does today.

Structured independently of the UI, per `CLAUDE.md` §9. `CLAUDE.md` §11 holds as explained above — the fixed observer-time window itself never depends on speed; only the physically-driven `dopplerFactorFor` does.

---

## Learner Controls

- **Recession speed**, a single new slider, range 0–0.9c, matching the range already used elsewhere in the Relativity of Time and Motion chapter. Disabled until the prediction is entered, matching the rest of the project.
- **Run**, identical in behavior to Experiments 2–4: plays forward across the fixed observer-time window, driving the live readout and the arm diagram.
- No mass control in this experiment (see "Simplifying assumptions").

---

## Prediction Activity

Before the control and results are shown, the learner is asked two questions in sequence:

1. "If a gravitational wave's source is moving away from the detector, will the detected frequency be higher, lower, or the same as the frequency at the source?" (Higher / Lower / The same) — inviting the learner to apply the everyday Doppler intuition (an ambulance siren dropping in pitch as it leaves) to a new case.
2. "You're about to compare the detected frequency to what you'd expect from an everyday Doppler effect alone (like sound). Do you think the real detected frequency will be stretched by exactly that much, by more, or by less?" (Exactly that much / More / Less) — set up to reveal that relativistic time dilation adds extra stretching beyond the classical guess.

Choices are not scored. The control is disabled until both predictions are entered.

---

## Experiment Behavior

### Display

- The same live readout and L-shaped arm diagram as Experiments 2–4, with two frequency values shown instead of one (as emitted / as detected), and a recession-speed readout.
- The arm diagram's pulsing rate is driven by the scaled (`dopplerFactorFor`-adjusted) time directly, so the stretching is visible in the animation itself, not only in the numbers.

### Results

States the chosen speed, the final "as emitted" and "as detected" frequency figures, and the measured `dopplerFactorFor(speed)` value. Compares that measured value to `classicalDopplerFactorFor(speed)` (the everyday-Doppler-alone prediction) explicitly, naming the gap as the time-dilation contribution, and compares both of the learner's predictions (direction, then magnitude) to what actually happened.

### Introductory text

Drafted and built (`src/components/GravitationalWaveRedshiftExperiment.tsx`), covering the question, the Doppler effect (new term, anchored in the ambulance-siren daily-life example, and tied back to the already-defined "redshift" term from Gravity and Curved Spacetime Experiment 2), what happens, the learner's job (both predictions), what to look for, and the assumptions — not yet given the owner's line-by-line review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "What did you notice about how the animation itself behaved as you increased the speed?"
  2. Prediction comparison: the learner's two predicted answers beside what actually happened.
  3. Conceptual question: "The everyday Doppler effect alone would predict one amount of stretching. Why is the real amount slightly more than that?" — intended to have the learner connect this back to time dilation in their own words.
  4. Explanation: (1) this reuses Experiment 2's exact chirp model and the Relativity chapter's exact time dilation factor — nothing new was calculated about the chirp itself; (2) a receding source's wave is stretched to a lower frequency, the Doppler effect, the same basic effect as a receding ambulance's siren; (3) the real stretching is the classical Doppler factor *times* the time dilation factor, so it is always somewhat more than the classical guess alone; (4) this is why detected real gravitational waves need a velocity correction; (5) this experiment isolates only the velocity-based part — a real distant source's total redshift is usually dominated by the separate, larger cosmological-expansion effect, not modeled here.

---

## Required Physics Tests

Because this experiment reuses Experiment 2's and the Relativity chapter's physics unchanged, no new tests of `chirpStateAt`/`timeDilationFactorFor` are required. The following test the two new functions only:

1. `dopplerFactorFor(0)` equals exactly `1` (no motion, no shift).
2. `dopplerFactorFor(speed)` is strictly less than `1` for any `speed` strictly between `0` and `0.9` (a receding source is always redshifted in this experiment).
3. `dopplerFactorFor` is strictly decreasing as `speed` increases, checked across several representative values (faster recession stretches the wave more).
4. `dopplerFactorFor(speed)` is strictly less than `classicalDopplerFactorFor(speed)` for any `speed` strictly greater than `0` (confirms the relativistic correction always adds extra stretching beyond the classical-alone guess — the core result the second prediction question is built around).
5. `classicalDopplerFactorFor(speed)` matches `1 / (1 + speed)` exactly for at least two representative values (direct formula sanity-check).

---

## Decisions Confirmed

All items were confirmed by the owner in conversation on 2026-10-04, approving the proposal as drafted.

1. **This is the next experiment to build**, already named as the planned direction in Experiment 4's own specification ("Decisions Confirmed" item 2).
2. **The animation itself visibly slows** as recession speed increases, not just the readout numbers — achieved by scaling the time fed into `chirpStateAt` by `dopplerFactorFor(speed)`, so the slowdown is physically driven rather than a cosmetic toggle.
3. **Recession speed range is 0–0.9c**, matching the range already used elsewhere in the Relativity of Time and Motion chapter.
4. **The mass control is fixed at a single default value**, not re-exposed as a learner control, to keep this experiment to one new idea.
5. **Title accepted as proposed:** "Stretched by Motion: Redshift of a Receding Source."

---

## Decisions Needing Human Review

None open. All items from the proposal were confirmed at approval (2026-10-04); see "Decisions Confirmed." Exact numeric constants not called out above (the fixed default mass value, the observer-time window length, slider step size) are left to implementation judgment, following this project's existing conventions for similar presentational constants in Experiments 2–4.

---

## Success Criteria

1. No physics formula beyond the two new, explicitly-labeled Doppler functions is introduced; Experiment 2's `chirpStateAt`/`chirpRunFor` and the Relativity chapter's `timeDilationFactorFor` are reused exactly, imported and not recomputed.
2. The learner makes both predictions (direction, then magnitude) before the control and results are shown.
3. Increasing recession speed visibly lengthens the real-world time between pulses in the arm animation itself, driven physically by `dopplerFactorFor(speed)`, not a separate cosmetic slow-motion control.
4. The "frequency as emitted" and "frequency as detected" numbers are both shown and visibly diverge as speed increases, with detected strictly less than emitted for any speed greater than 0.
5. The learner can, after the tutor conversation, state in their own words that the real stretching is somewhat more than the classical (everyday) Doppler guess, because of time dilation added on top.
6. The introduction, results panel, and tutor each state plainly that this experiment models only the velocity-based part of redshift, and that cosmological expansion is a separate, typically larger effect for real distant sources, not modeled here.
7. "Redshift" is reused consistently from its existing definition (Gravity and Curved Spacetime, Experiment 2) rather than redefined; "Doppler effect" is defined in plain language, anchored to a daily-life example (a receding ambulance's siren), at the point it is first introduced, consistent with `CLAUDE.md` §15.
8. `CLAUDE.md` §11 holds: the fixed real-world viewing window never itself depends on the chosen speed; only the physically-meaningful `dopplerFactorFor(speed)` drives how much of the chirp plays out within it.

---

## Implementation Notes

Implemented so far, per `CLAUDE.md` §21/§23 Stage 5 and §6 (one-step-at-a-time): the physics model and its tests (`src/physics/gravitationalWaveRedshiftExperiment.ts`, `src/physics/gravitationalWaveRedshiftExperiment.test.ts`); `classicalDopplerFactorFor`/`dopplerFactorFor` as drafted, reusing `timeDilationFactorFor` from `movingClockExperiment.ts` unchanged. All 5 required physics tests pass.

Basic UI is also built (`src/components/GravitationalWaveRedshiftExperiment.tsx`): the recession-speed slider (0–0.9c), Run, a live readout (frequency as emitted/as detected, the measured Doppler factor, strain), and the arm diagram reusing Experiment 4's visual approach (labeled arms, a signed wavy strain overlay). Wired into the guided journey (`src/App.tsx`, as "Experiment 5 — Stretched by Motion" under the "Gravitational Waves" group). This step deliberately has no prediction gating, results panel, or tutor yet; mass is fixed at `FIXED_MASS = 2` (an implementation-judgment constant, not called out in the specification as needing separate approval).

The time-reparametrization approach (scaling the time fed into `chirpStateAt` by `dopplerFactorFor(speed)`) works as designed: verified in a browser at speed 0.00c (Doppler factor exactly 1.000, "as emitted" and "as detected" frequencies match exactly — confirms this experiment's baseline behaves identically to Experiment 2's own) and at 0.50c (Doppler factor 0.577, matching `classicalDopplerFactorFor(0.5) × timeDilationFactorFor(0.5) = 0.667 × 0.866`; the arm animation visibly ran through fewer cycles in the same real-world window, confirming the stretching is visible in the animation itself, not just the numbers). The full suite (288/288) and `tsc --noEmit` are clean; no console errors.

The learner prediction interaction is also built: both required questions (per "Prediction Activity") gate the speed slider and Run button until answered, matching the project's established pattern — predictions lock in on first "Run" and a "Change predictions" control reopens both without resetting the chosen speed. Verified in a browser: Run is disabled before either question is answered, still disabled after only one is answered, and enabled once both are answered; running locks both predictions in and shows "Your predictions are locked in above..."; "Change predictions" correctly reopens both questions while preserving the chosen speed (0.5 before and after). No console errors. Full suite (288/288) and `tsc --noEmit` clean.

The Results panel is also built, per the specification's "Results" section: states the run speed, final "as emitted"/"as detected" frequencies, the measured `dopplerFactorFor`, and compares it explicitly to `classicalDopplerFactorFor` (the everyday-Doppler-alone prediction), then compares both of the learner's predictions to what actually happened. Matches Experiment 4's own precedent of clearing stale results when the speed changes after a completed run. A real bug was found and fixed during verification: at speed 0, both Doppler factors equal exactly 1.000, but the panel's comparison sentence unconditionally claimed "the real, measured factor is smaller than that," which is false when they're equal — fixed with a speed-0 branch stating they match exactly, since there's no motion to add stretching. Verified in a browser: ran at 0.50c (factor 0.577 vs. classical 0.667, correct "more than" wording) and at 0.00c (factor 1.000 vs. classical 1.000, correct "matches exactly" wording, after the fix); stale results correctly clear when the speed slider is moved after a completed run. No console errors. Full suite (288/288) and `tsc --noEmit` clean.

The AI tutor is also built (`src/components/GravitationalWaveRedshiftTutor.tsx`), following the predict → observe → explain pattern of the prior experiments exactly as specified: an observation question, a prediction-comparison step, a conceptual question, then the five-point explanation from "AI Tutor Behavior" (reuse of Experiment 2/time dilation, the Doppler effect named via the siren analogy, the classical-times-time-dilation combination, the real-detection implication, and the cosmological-redshift caveat). Wired with `onExplained`/`onTutorComplete` exactly as Experiment 4's tutor is. Verified in a browser: completed all three reflection steps after a 0.50c run; the five-point explanation displayed correctly; the App-level "What you learned" summary and sidebar checkmark appeared immediately after, confirming `onTutorComplete` fires correctly; `localStorage` progress recorded correctly (`completed`/`explained` both set). No console errors. Full suite (288/288) and `tsc --noEmit` clean.

Its complete-flow test (2026-10-04) covered the full learner path in one session, from a fresh (cleared) progress state: sidebar navigation into the chapter (only the active group expanded, matching the established pattern), the full introduction, both prediction questions (deliberately answered incorrectly — "Higher"/"Less" — to verify the mismatch-handling wording paths), a 0.70c run (measured Doppler factor 0.420 vs. classical 0.588, matching hand calculation), the Results panel correctly stating the actual outcome against the wrong predictions, all three tutor reflection steps (each correctly reflecting the submitted predictions), the five-point explanation, and the App-level "What you learned" summary and sidebar checkmark appearing immediately after. Also verified in the same session: "Change predictions" correctly clears the Results panel and tutor and reopens both questions while preserving the chosen speed (0.7 before and after). No console errors throughout; `localStorage` progress recorded correctly. Full suite (288/288) and `tsc --noEmit` clean. No gaps found.

After the complete-flow test, the owner asked for the stretching to be made more visually prominent — it was previously only visible as a slower overall pulsing rate, with no direct point of comparison. Added two pulsing beacons to the diagram, "Emitted" and "Detected," both using the exact same strain-to-radius formula so the only difference between them is their underlying rate: "Emitted" is driven by `chirpStateAt` fed directly with the unscaled observer time (what the run would look like at zero speed), "Detected" is the same `chirpState` already driving the arms. No new physics — both beacons reuse `chirpStateAt` with time arguments already computed elsewhere in the component. The "What to look for" introduction paragraph was updated to describe the comparison. Verified in a browser: both beacons render correctly, clearly labeled, positioned clear of the arms and wave overlay. No console errors. Full suite (288/288) and `tsc --noEmit` clean.

The owner then asked to push the beacon comparison further: bigger beacons, plus a running numeric counter. Both beacons were enlarged (base/max radius roughly doubled, using their own dedicated radius variables rather than reusing the small corner-pulse radius, so the arm diagram's own corner indicator is unaffected) and repositioned with more spacing to fit. The counter ("N.N cycles behind") required exposing `phase` from `gravitationalWaveChirpExperiment.ts`'s `ChirpState` — a purely additive field (the value was already computed internally by `chirpStateAt`, just not returned), confirmed not to break the "is deterministic" `toEqual` test or any other existing test. The counter itself is `(referenceChirpState.phase - chirpState.phase) / (2π)`, a direct reading of that one already-computed value — not a new formula. Verified in a browser: beacons render larger and clearly, the counter starts at 0.0 and grows over the run (0.0 → 0.5 cycles behind on a 0.70c run). No console errors. Full suite (288/288) and `tsc --noEmit` clean.

A caption beneath the diagram was then added explaining what each beacon's size means (its strain at that instant — the same loudness the chirp is always building toward) and why "Detected" is always smaller than "Emitted," never bigger, in this experiment: the detected process is delayed, so by any given moment it hasn't built up as far through the chirp. It also notes, briefly, that an approaching source would show the opposite (detected ahead and louder) — explicitly flagged as not modeled here, consistent with the specification's "Not introduced" exclusion of the blueshift case. Verified in a browser: caption renders correctly. No console errors. Full suite (288/288) and `tsc --noEmit` clean.

The owner then reported the counter was effectively invisible — it had been a tiny (10px), low-contrast gray caption squeezed at the very bottom edge of the diagram box. Rewritten as a prominent badge: a bordered background rect with bold 16px high-contrast text ("N.N behind"), repositioned below Arm X's own line (with margin clear of the wavy strain overlay's glow) so it never overlaps the diagram. The stale "Two small beacons" introduction wording was also corrected to "Two beacons," since they're no longer small. Verified in a browser at 0.8c: the badge is now clearly legible. No console errors. Full suite (288/288) and `tsc --noEmit` clean.

The owner then asked whether a horizontal wave trace running under each beacon — rather than replacing the beacons — would make the delay even easier to see. Added: a wave trace strip under each beacon, generalizing the arm overlay's existing `armWavePoints` helper (renamed `wavePoints`) to take an explicit cycle count instead of a fixed constant, so each trace's wavelength is directly proportional to its own frequency (`referenceChirpState.frequency` for "Emitted," `detectedFrequency` for "Detected" — both values already computed elsewhere, no new physics). The result shows the stretching as a shape (a visibly longer, flatter wave under "Detected") in addition to the beacons' pulse-rate and the "cycles behind" counter. The "What to look for" introduction paragraph was updated to describe it. Verified in a browser: at 0.70c the two traces are visibly different wavelengths; at 0.00c they match exactly (both tight, "0.0 behind"). No overlap with the arms, labels, or the "cycles behind" badge. No console errors. Full suite (288/288) and `tsc --noEmit` clean.

A real bug was found and fixed: the trace strips' traveling-wave phase was `displayedObserverTime * frequency * 2`, but over this experiment's short observer window (well under a second of simulated time) that only advances a small fraction of one cycle across the entire 7-second playback — effectively invisible, especially for the low "Detected" frequency. Fixed by adding a `TRACE_SCROLL_BOOST` multiplier (10×), applied equally to both traces' phase so the actual relative comparison (how much more slowly "Detected" scrolls than "Emitted") is unchanged — only their shared absolute pace is sped up for visibility, consistent with this experiment's own "hugely exaggerated" assumption already in its introduction. "Detected" was also switched from reusing the arm overlay's own (unboosted) `wavePhase` to its own boosted computation, so the arm overlay's ripple speed is unaffected. Verified in a browser by comparing the four polylines' (two arm overlays, two trace strips) raw SVG `points` attributes between two screenshots taken mid-run: all four changed, confirming continuous animation (the initial report of "no animation" was reproduced with a flawed check — polling via JavaScript alone, with no intervening screenshot/render call, hits this project's known `requestAnimationFrame` throttling in the backgrounded automation tab; interleaving screenshots, as used elsewhere in this project's testing, forces real frames and showed the fix working). No console errors. Full suite (288/288) and `tsc --noEmit` clean.

The complete-flow test was then re-run end-to-end from a fully fresh state (cleared `localStorage`, sidebar navigation only) to cover all the animation work above together: full introduction, both predictions answered correctly this time (direction "Lower", magnitude "More"), a 0.60c run (measured Doppler factor 0.500, matching `classicalDopplerFactorFor(0.6) × timeDilationFactorFor(0.6) = 0.625 × 0.8` exactly), the Results panel correctly confirming the matching predictions, all three tutor reflection steps, the five-point explanation, the App-level "What you learned" summary and sidebar checkmark, and "Change predictions" again correctly clearing the Results/tutor while preserving the chosen speed. No console errors throughout. Full suite (288/288) and `tsc --noEmit` clean. No gaps found.

The final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-04) checked the implementation line by line against all 8 Success Criteria, the Physics Model section (confirmed `classicalDopplerFactorFor`/`dopplerFactorFor` match exactly as specified, both prediction questions match the specification's quoted wording verbatim), the Learner Controls, the Results section's required content, and the AI Tutor's five-point explanation — no gaps found. Also spot-checked numerically outside the browser: `dopplerFactorFor(speed)` is strictly less than `classicalDopplerFactorFor(speed)` and strictly less than 1 across the full 0–0.9c range including both edge values, confirming Success Criteria 4 and 8 hold with no edge-case gaps. The owner's line-by-line wording approval (§28.1) is complete (2026-10-04), approved as written with no changes requested.

### Audit update (2026-11-07)

Brought to the newer rules of CLAUDE.md §14 and §28 (`docs/AUDIT-PLAN.md`, Rule E). The owner answered "all defaults" to the six questions of `docs/audit/gravitational-waves/05-gap-report.md` and "approve with defaults" to the wording in `docs/audit/gravitational-waves/05-draft-wording.md` (2026-11-07). The earlier text of this specification stands except where this note says otherwise. In particular, the "Prediction Activity" and "Learner Controls" sections are replaced by items 1 and 2 below, and "slightly more" no longer appears anywhere on the page.

  1. **The page in four Parts.** Part 1 "Predict, then watch" (the two predictions, one Run at a fixed speed of 0.5c, one picture), Part 2 "Now try it yourself" (the speed slider, 0 to 0.9c in steps of 0.05, "Run at your speed", Drawing A and Drawing B with pink marks for the learner's speed), Part 3 "The results" and Part 4 "The tutor". Parts 2 to 4 appear after the Part 1 run has finished. A "Start over" button, always visible and greyed out until there is something to clear, replaces "Change predictions"; once Run is pressed the guesses are locked until Start over. There is no mass control (unchanged).
  2. **The two predictions.** Both now state the speed (0.5c): (1) will the detected frequency be higher, lower or the same; (2) "above, an everyday Doppler effect alone gave a stretch of 1.5 at 0.5c": will the real stretch be exactly that, more or less. At 0.5c the answers are "lower" and "more" (computed by the module, never typed in the component).
  3. **Stretch.** The new unit is the stretch, 1 ÷ the Doppler factor (how many times longer each wave is on arrival than at sending). At 0.5c the everyday stretch is 1.50 (1 + the speed in c) and the real stretch 1.73 (1 ÷ 0.577), about 15 percent more; at 0.3c, 1.30 against 1.36; at 0.9c, 1.90 against 4.36, 2.29 times the everyday one. The introduction works the everyday stretch out with a lamp flashing once a second and moving away (the agent's own derivation).
  4. **The picture.** One picture, two panels, on a dark background. Panel A: the two arms, the detector, the Emitted and Detected beacons and waves, the "cycles behind" counter, and a text note of the source's speed and direction (the source itself is not drawn). Panel B: two bars, the everyday stretch (amber, a fixed reference) and the real stretch (pale cyan), on a fixed scale of 0 to 4.5, drawn when the run has finished. **"Emitted" now means the pitch the source sent at the moment whose signal is arriving** (1.443 at the final moment at 0.5c); the Emitted wave and beacon are drawn at that pitch, so that the two waves differ by exactly the Doppler factor. The earlier build drew "Emitted" from a no-motion run (3.162 at the final moment), which made the gap between the two traces a stretch of 3.8, not the 1.73 the page reported (owner's choice, option (a)).
  5. **The guess marks.** White, markers only. Guess 1 (higher, lower, the same): a box "YOUR GUESS: ..." joined to a thick outline round the Detected wave and an arrow beside it (down, up or an equals sign), drawn when the waves are drawn. Guess 2 (exactly, more, less): a box joined to a thick outline round the amber bar, with an arrow past its tip (more), back inside it (less), or none (exactly), drawn when the bars are drawn. A different guess gives a different mark; none carries a size, and none changes a wave or a bar. Guess 1 is also drawn on Drawing A, labelled "for 0.5c", and guess 2 on Drawing B beside the pink bars (the guess on Drawing A goes beyond the approved draft, which left Drawing A without it).
  6. **Part 2.** Drawing A is Panel A at the learner's speed (a pink "YOUR SPEED" tag); Drawing B is Panel B with two pink bars, the everyday and real stretch at the learner's speed. A note says that the guesses do not change the drawings or the tables but the slider does, and that Table 2 says "the same" while the slider is on 0.50c.
  7. **Captions and sources.** Every picture has labels on the canvas and a full caption: how to read it, what you see and when, a worked moment, "What to look for" as Look at / What it means / Why it matters (shown once the feature is drawn), and "Where the real picture comes from". The introduction gains "How much stretch? An everyday example", "A word before you run: Doppler factor", "Your predictions and the real pictures" and "Some new words"; a "Words and formulas" box (the formula for the real factor is held back until after the run) and a "Want to know more?" list (checked 7 November 2026): NASA Goddard "Doppler Shift" and "The Farthest Visible Reaches of Space", NASA Science "Hubble Cosmological Redshift" and "What Is Cosmological Redshift?", the LIGO Scientific Collaboration science summary on cosmic expansion, and the GW150914 paper (arXiv 1602.03837, for z = 0.09). The pages were read by a helper through a summariser, not by the agent. No plain official page was found for GW150914's detector-frame masses (§29 rule 3(c)); the page does not use them.
  8. **Part 3.** "Your guesses, beside the results" (no verdict), "How to read these results", a two-row check-up (stretch 1.50 expected, 1.73 found, "more", about 15 percent; Doppler factor 0.667 expected, 0.577 found, "lower"), Table 1 (the Part 1 run, with tags on the rows each guess relates to), Table 2 (the learner's speed beside 0.50c, with "How yours compares" saying only "the same", "more" or "less", and "What your numbers show" that updates with the slider), each with "What this table tells us", and "What about a real source?" (the larger part of a distant source's redshift is the expansion of space; GW150914's z = 0.09).
  9. **Tutor.** Three questions available after the run: what did you notice about the two waves; compare, naming the white marks, Panel B and the check-up; why is the real amount different. Then an eight-point explanation: your guesses marked (from the module), the reuse of the chirp and time dilation, the Doppler effect with the 1.5, the real stretch as the everyday factor times the time dilation factor (0.667 × 0.866 = 0.577, with a film-reel comparison that is the agent's own), the velocity correction, why the pitch sent and received both end lower than in a run with no motion, the isolation from cosmological redshift, and the toy-model caveat.
  10. **Physics module.** New tested functions and constants: `REDSHIFT_PART1_SPEED`, `REDSHIFT_MAX_SPEED`, `REDSHIFT_STRETCH_SCALE_MAX`, `stretchFor`, `classicalStretchFor`, `realStretchFor`, `redshiftRunSummary`, `directionOutcome`, `magnitudeOutcome`, the two `...GuessMatches`, `directionGuessMarker`, `magnitudeGuessMarker`, `compareWord` and `yourSpeedComparison`, with 18 new physics tests and 9 render tests. The two Doppler functions are unchanged.
  11. **Chapter summary.** The "What you learned" text in `src/App.tsx` now says the real stretch is always more than the everyday one and gives the numbers at 0.3c and 0.9c.
  12. **Browser check (agent, 2026-11-07).** Covered the guesses "Lower" and "Less", the picture mid-run and finished, Part 2 at 0.9c, Table 2 and the tutor's questions and explanation. Commits `18d5f0a`, `9567a46`, `cdc52ab`.
  13. **Not done, and open.** The owner has not reviewed the finished page, and the two choices beyond the approved draft (guess 1 on Drawing A; "cycles behind" counted against the Emitted wave) are not confirmed. A small label nudge, a wider Panel B margin and a tutor phrasing fix were made after the browser check and not viewed again. Not viewed: Drawing A by eye, the other guess answers, speeds 0 and 0.3c, "Run again", Start over, narrow widths, other browsers, keyboard use, a real learner. The speeds up to 0.9c are a toy range with no source (stated on the page).

