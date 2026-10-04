# Gravitational Waves — Experiment 4: Comparing Two Real Events

**Status: approved (2026-10-03), approved as written with one change — a free mass slider is added alongside the two presets (see "Decisions Needing Human Review" item 2, now resolved). Physics model, physics tests, UI, prediction interaction, results panel, and AI tutor are built and wired into the guided journey; see "Implementation Notes." Its complete-flow test and final review against this specification/PROJECT.md/AGENTS.md (CLAUDE.md §21 Step 10) are done (2026-10-04; one gap found and fixed there — see "Implementation Notes"). The owner's line-by-line wording approval (§28.1) has not yet been done.**

This specification was drafted per `CLAUDE.md` §23 Stage 3, following a proposal Claude Code made in conversation on 2026-10-03, in response to the milestone set after Gravitational Waves Experiment 3's wording approval. The owner chose this direction, together with a planned Experiment 5 ("Stretched by Motion: Redshift of a Receding Source") to follow it, from a list of several alternatives Claude proposed. The owner asked that this experiment (Experiment 4) be specified and approved first, with Experiment 5 to follow afterward, per the project's one-at-a-time workflow (`CLAUDE.md` §6).

---

## Overview

Experiments 2 and 3 built a complete toy model of an inspiraling pair: a chirp that rises in pitch and loudness, and the orbital energy loss that causes it. Both were driven by one abstract "mass" slider, with no connection yet to any specific, named, real event.

This experiment makes no changes to that physics. It applies the exact same, already-tested model to two real, named gravitational-wave detections — GW150914 (the first detection, 2015, two black holes) and GW170817 (2017, two neutron stars) — so the learner sees how mass alone changes the signal's pitch, loudness, and duration, using an idea they already understand rather than new mechanics. It also makes concrete a term Experiment 1's introduction already names but never develops: "multi-messenger astronomy."

This is not invented behavior: GW150914 and GW170817 are both real, published LIGO/Virgo detections, and the qualitative differences this experiment asks the learner to compare — a short, high-mass, black-hole chirp versus a longer, lower-mass, neutron-star chirp, with only the second one accompanied by light — are exactly as reported.

---

## Learning Objective

After this experiment, the learner should understand:

1. The same chirp-and-energy-loss model from Experiments 2 and 3 applies to any inspiraling pair — only the mass differs between a real black-hole merger and a real neutron-star merger.
2. A much larger mass (black holes, GW150914) produces a louder, faster-rising, shorter-duration chirp than a much smaller mass (neutron stars, GW170817) — reusing the mass relationships Experiments 2 and 3 already established, now anchored to two named, real events instead of an abstract slider.
3. GW170817, unlike GW150914, was also observed in light (a gamma-ray burst and a glowing afterglow seen by telescopes in the following days and weeks) — because neutron stars have surfaces and material that can radiate light when they collide, while merging black holes do not. This is why only one of the two events had a visible counterpart.
4. Seeing the same event in more than one way — gravitational waves and light — is called "multi-messenger astronomy," and it let scientists confirm GW170817's location, distance, and nature far more precisely than the gravitational-wave signal alone could.

---

## Physical Situation

The same L-shaped detector arms, live readout, and two graphs (arm length vs. time, orbital energy vs. time) as Experiments 2 and 3. No new animation or diagram is introduced. The only change is which mass drives the run: instead of a single free-ranging slider, the learner chooses between two named presets, each standing in for a real event.

### Simplifying assumptions (must be stated to the learner, in plain language)

- Everything Experiments 1–3 already state still applies here unchanged: the effect is hugely exaggerated, only one wave pattern is shown, no real detection hardware is modeled, the merger itself is not modeled, and the mass-to-chirp and mass-to-energy relationships are toy formulas, not the real post-Newtonian equations.
- **The two presets are a simplified stand-in for GW150914 and GW170817, not a faithful reconstruction of either signal.** The toy model is not capable of reproducing a real waveform; only the qualitative direction (bigger total mass → louder, faster, shorter chirp) is preserved.
- **The mapping from each event's real mass (in solar masses) onto this project's existing dimensionless toy mass scale (0.2–6, from the Black Hole experiment) is a presentation choice**, not a physical calculation — see "Decisions Needing Human Review."
- The light counterpart seen for GW170817 is stated as a real, independently-reported fact, not something this experiment's physics model computes.

### Not introduced

Any new physics formula (this experiment adds none), a real waveform reconstruction of either event, how scientists actually infer mass and distance from a real signal's exact shape (already excluded in Experiment 2), and any other real event (GW190521, GW170608, etc. — a candidate for a possible later experiment, not this one).

---

## Physics Model

No new physics. Reuses Experiment 2's `chirpRunFor`/`chirpStateAt` and Experiment 3's `orbitalEnergyStateAt` exactly, imported rather than modified or recomputed.

The only new code is a small, explicitly-labeled preset mapping from each named event to a toy `mass` value on the existing scale:

```typescript
// src/physics/gravitationalWaveRealEventsExperiment.ts

// No new physical formula. Maps two real, named events onto Experiment 2/3's existing
// dimensionless mass scale (0.2–6), as a presentation choice, not a physical calculation.
// Reuses gravitationalWaveChirpExperiment.ts's chirpRunFor/chirpStateAt and
// gravitationalWaveEnergyExperiment.ts's orbitalEnergyStateAt unchanged.

export interface RealEventPreset {
  id: 'gw150914' | 'gw170817'
  label: string             // e.g. "GW150914 (two black holes)"
  realDescription: string   // short, plain-language real-world description
  toyMass: number           // the mapped value on the existing 0.2–6 toy mass scale
  hadLightCounterpart: boolean
}

export const REAL_EVENT_PRESETS: RealEventPreset[]
```

Both presets' `toyMass` values are within the existing `[0.2, 6]` range already validated by `chirpRunFor`/`orbitalEnergyStateAt`; no change to either function's validation or formulas is required.

Structured independently of any UI, per `CLAUDE.md` §9. `CLAUDE.md` §11 applies exactly as in Experiments 1–3.

---

## Learner Controls

- **Event preset**, a choice between two labeled quick-select options: "GW150914 (two black holes)" and "GW170817 (two neutron stars)." Choosing a preset sets the mass slider (below) to that preset's mapped `toyMass`.
- **Mass**, the same free-ranging slider, range (0.2–6), and label as Experiments 2 and 3, reusing it directly rather than introducing a new control. The learner may drag it freely, including to values between or beyond the two presets' mapped values, exactly as in Experiments 2 and 3. Dragging the slider away from a preset's exact value is treated as a "custom" mass, not tied to either named event.
- **Run**, identical in behavior to Experiments 2 and 3: plays forward from `time = 0` to the current mass's `cutoffTime`, driving the live readout, arm diagram, and both graphs.

The preset control is disabled until the prediction is entered, matching the rest of the project.

---

## Prediction Activity

Before the control and results are shown, the learner is asked one question:

1. "GW150914 came from two black holes, each tens of times heavier than our Sun. GW170817 came from two neutron stars, each only a little heavier than our Sun. Which one do you think produced the louder, faster-rising chirp?" (The black holes / The neutron stars / They would be the same)

This is chosen to make the learner apply what Experiments 2 and 3 already taught about mass, to a new, concrete, real-world comparison, rather than scoring new content.

Choices are not scored. The control is disabled until the prediction is entered.

---

## Experiment Behavior

### Display

- The same live readout, L-shaped arm diagram, arm-length graph, and energy graph as Experiments 2 and 3, unchanged, driven by whichever mass (preset or custom slider value) is current.
- A short, fixed real-world description shown beside each preset choice (e.g., "Detected September 14, 2015 — the first gravitational wave ever observed" / "Detected August 17, 2017 — also seen in light by telescopes around the world").
- When the slider is moved away from a preset's exact value, the display indicates the mass is now a custom value, not tied to either named event.

### Results

States which mass was run (naming the preset if the slider is at an exact preset value, or stating "custom mass" otherwise), the resulting chirp duration and final loudness/energy-radiated figures (reusing Experiments 2 and 3's own result values), then compares the learner's prediction to what actually happened. If the learner has run both presets, an additional side-by-side comparison line states the ratio (e.g., "GW150914's chirp was both louder and faster than GW170817's"). The light-counterpart fact (GW170817 yes, GW150914 no) is stated only when a preset's exact value was run, since it is a fact about the two real events, not about an arbitrary custom mass.

### Introductory text

Drafted and built (`src/components/GravitationalWaveRealEventsExperiment.tsx`), covering the question, a plain-language definition of black holes/neutron stars, what happens, the learner's job, what to look for, the "multi-messenger astronomy" term, and the assumptions — not yet given the owner's line-by-line review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form their prediction; does not reveal the answer.
- **After "Run" completes (for whichever preset was run first):**
  1. Observation: "What did you notice about this chirp compared to the ones you've run before?"
  2. Prediction comparison: the learner's predicted answer beside what actually happened.
  3. Conceptual question: "Why would two black holes, so much heavier than two neutron stars, produce a louder and faster chirp?" — intended to have the learner restate Experiments 2 and 3's own mass relationship in their own words, applied to this new comparison.
  4. Explanation: (1) this reuses the exact same chirp and energy-loss model as Experiments 2 and 3 — only the mass differs; (2) GW150914's much larger total mass is why its chirp is louder and reaches its final moment faster; (3) names "multi-messenger astronomy": GW170817, from two neutron stars, was also seen in light (a gamma-ray burst and a glowing afterglow), because neutron stars have surfaces and material that can radiate light when they collide, while black holes do not; (4) this is why GW170817 could be pinned down to a specific galaxy and distance with far more precision than GW150914 could, directly from the added light observations; (5) this toy model is a simplified stand-in, not a faithful reconstruction of either real signal.

---

## Required Physics Tests

Because this experiment reuses Experiments 2 and 3's physics unchanged, no new physics tests of `chirpStateAt`/`orbitalEnergyStateAt` are required. The following test the new preset mapping only:

1. Both entries in `REAL_EVENT_PRESETS` have a `toyMass` strictly within `[0.2, 6]` (the existing validated range).
2. GW150914's preset has a strictly larger `toyMass` than GW170817's preset (confirms the mapping preserves the real, much larger black-hole mass as the larger toy value).
3. `REAL_EVENT_PRESETS` contains exactly the two specified `id` values, each with a non-empty `label` and `realDescription`.
4. Passing each preset's `toyMass` into `chirpRunFor`/`orbitalEnergyStateAt` does not throw, and produces a `cutoffTime` that is strictly shorter for GW150914 than for GW170817 (confirms the "larger mass reaches its final moment sooner" relationship, already proven generally in Experiment 2's own tests, holds for these two specific values).
5. `hadLightCounterpart` is `true` for GW170817's preset and `false` for GW150914's preset.

---

## Decisions Confirmed

All items were confirmed by the owner in conversation on 2026-10-03, approving the specification as written except where noted.

1. **This is the next experiment to build**, chosen by the owner from several alternatives Claude proposed (triangulation, noise/detection, ringdown, comparing real events, redshift from a receding source).
2. **Experiment 5 will be "Stretched by Motion: Redshift of a Receding Source,"** to follow this experiment once it is complete, per the project's one-at-a-time workflow (`CLAUDE.md` §6). That experiment is not specified here and requires its own proposal and approval.
3. **No new physics formula is introduced.** This experiment reuses Experiments 2 and 3's chirp and energy-loss models exactly, adding only a preset mapping and real-world narrative.
4. **Scope is limited to GW150914 and GW170817**, the two most widely known, well-documented real events (the first detection, and the first with a confirmed light counterpart). Other real events remain a candidate for a possible later experiment, not this one.
5. **A free mass slider is included alongside the two presets** (resolving former "Decisions Needing Human Review" item 2), rather than presets only as originally drafted — see "Learner Controls."
6. **`toyMass` values accepted as drafted:** GW170817 → `0.3`, GW150914 → `5.5` (former item 1).
7. **Real-world figures accepted as drafted** (former item 3): GW150914 (September 14, 2015; two black holes of roughly 36 and 29 solar masses, merging into a ~62-solar-mass black hole, about 1.3 billion light-years away); GW170817 (August 17, 2017; two neutron stars of roughly 1.4 solar masses each, about 130 million light-years away, with a gamma-ray burst detected 1.7 seconds after the gravitational-wave signal).
8. **Title accepted as drafted:** "Comparing Two Real Events" (former item 4).

---

## Decisions Needing Human Review

None open. All items from the original draft were resolved at approval (2026-10-03); see "Decisions Confirmed" items 5–8.

---

## Success Criteria

1. No new physics formula is introduced; Experiments 2 and 3's `chirpStateAt`/`orbitalEnergyStateAt` are reused exactly, imported and not recomputed.
2. The learner predicts the single question before the control and results are shown.
3. The two presets visibly produce different chirp durations and loudness/energy figures, consistent with Experiment 2 and 3's own mass relationships applied to the two mapped `toyMass` values.
4. The learner can, after the tutor conversation, state in their own words why GW150914's chirp is louder and faster (larger mass) and why only GW170817 had a light counterpart (neutron stars have radiating material; black holes do not).
5. The term "multi-messenger astronomy" is defined in plain language at the point it is introduced, consistent with `CLAUDE.md` §15.
6. Real-world grounding is limited to named, independently-verified facts about GW150914 and GW170817 — never invented or unverified numbers presented as real.
7. The introduction, results panel, and tutor each state plainly that the two presets are a simplified stand-in, not a faithful reconstruction of either real signal.
8. `CLAUDE.md` §11 holds: playback speed does not change `toyMass` or any computed value.

---

## Implementation Notes

Implemented so far, per `CLAUDE.md` §21/§23 Stage 5 and §6 (one-step-at-a-time): the physics model and its tests (`src/physics/gravitationalWaveRealEventsExperiment.ts`, `src/physics/gravitationalWaveRealEventsExperiment.test.ts`); no new physics formula, `REAL_EVENT_PRESETS` maps the two named events onto the existing mass scale as drafted. Basic UI is also built (`src/components/GravitationalWaveRealEventsExperiment.tsx`): preset buttons, the free mass slider, Run, a live readout, and the arm diagram, reusing Experiments 2 and 3's already-tested physics directly, and wired into the guided journey (`src/App.tsx`, as "Experiment 4 — Comparing Two Real Events" under the "Gravitational Waves" group). This step deliberately has no prediction gating, results panel, or tutor yet.

All 5 required physics tests pass; the full suite (283/283) and `tsc --noEmit` are clean. Verified in a browser: both preset buttons correctly set the mass slider (GW150914 → 5.5, GW170817 → 0.3) and show their real-world description; the free slider still moves independently; "Run" animates the arm diagram and live readout (frequency/amplitude rising, remaining orbital energy falling, e.g. 0.191 → 0.030 over a GW170817 run) and re-enables cleanly on completion; no console errors. Chapter navigation (expanding "Gravitational Waves," selecting "4. Comparing Two Real Events") works correctly.

The learner prediction interaction is also built: the single required question (per "Prediction Activity") gates the preset buttons, mass slider, and Run button until answered, matching the project's established pattern (e.g. Experiment 3) — the prediction locks in on first "Run" and a "Change prediction" control reopens it without resetting the chosen mass. Verified in a browser: controls are disabled before a prediction is made, selecting "The black holes" enables them, running locks the prediction in and shows the "Change prediction" control, and clicking it correctly reopens the question. No console errors.

The Results panel is also built, per the specification's "Results" section: states which mass was run (naming the preset, or "a custom mass" when the slider is off either preset value), the run's final frequency/amplitude and energy radiated (reusing Experiments 2 and 3's own result values), compares the learner's prediction to the actual answer (GW150914/black holes always wins, per the preset mapping), states the light-counterpart fact only when a preset's exact value was run, and — once both presets have been run — an added "Comparing your two runs" callout stating the actual measured ratio between them. Matches Experiment 3's own precedent of clearing stale results when the mass changes after a completed run. Verified in a browser: ran GW150914 (mass 5.5) — results showed cutoff time 0.164, frequency 3.162, amplitude 0.522, 4.950 of 5.500 energy units radiated, correct prediction comparison, and the "not seen in light" fact; then ran GW170817 (mass 0.3) — results updated correctly (cutoff 3.000, frequency 3.162, amplitude 0.028, 0.270 of 0.300 radiated, "also seen in light" fact), and the "Comparing your two runs" callout appeared with the correct numbers from both runs. No console errors.

The AI tutor is also built (`src/components/GravitationalWaveRealEventsTutor.tsx`), following the predict → observe → explain pattern of the prior experiments exactly as specified: an observation question, a prediction-comparison step, a conceptual question, then the five-point explanation from "AI Tutor Behavior" (reuse of Experiments 2/3's model, GW150914's mass advantage, multi-messenger astronomy, GW170817's precise localization, and the toy-model caveat). Wired with `onExplained`/`onTutorComplete` exactly as Experiment 3's tutor is. Verified in a browser: completed all three reflection steps after a GW150914 run; the five-point explanation displayed correctly; the App-level "What you learned" summary and sidebar checkmark appeared immediately after, confirming `onTutorComplete` fires correctly. No console errors.

Its detector-arm animation gained, after the physics/UI/tutor build above, a labeled strain-wave overlay on each arm, a caption explaining the arms/strain/source, and a slower (7000ms) playback speed — all requested and verified in a browser across several iterations; the caption was tightened twice in response to feedback that it was too cluttered/dense, settling on a short intro sentence plus three bullet points. During that work, a real bug was found and fixed: the overlay's two arms initially shared one unsigned amplitude, so the wavy pattern looked identical on both arms regardless of mass, contradicting both the actual physics (`armXLength`/`armYLength` move with opposite sign) and the caption's own claim that the arms move oppositely — fixed by giving the Y arm's wave amplitude the opposite sign (CLAUDE.md §9, §16: a visualization must not imply a physical relationship the underlying model doesn't have).

Its complete-flow test (2026-10-04) covered the full learner path in one session: sidebar navigation into the chapter, the full introduction, the prediction question, both named presets (GW150914: cutoff 0.164, frequency 3.162, amplitude 0.522, 4.950/5.500 energy radiated; GW170817: cutoff 3.000, frequency 3.162, amplitude 0.028, 0.270/0.300 radiated), the "Comparing your two runs" callout, a custom mass run (3.0, correctly labeled "not tied to either named event," light-counterpart fact correctly omitted), all three tutor reflection steps, the five-point explanation, and the App-level "What you learned" summary and sidebar checkmark appearing immediately after. No console errors throughout; `localStorage` progress recorded correctly (`completed`/`explained` both set for this chapter).

Its final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-04) found one gap, now fixed: the Results panel's light-counterpart sentence was hardcoded as `runSummary.presetId === 'gw170817'` instead of reading the `hadLightCounterpart` field `REAL_EVENT_PRESETS` already defines for exactly this purpose — a duplicated, UI-side re-derivation of a fact the physics/data model already states authoritatively (AGENTS.md "Physics Authority" / "Do not hide important physical calculations inside UI code"). Fixed to look up `hadLightCounterpart` from `REAL_EVENT_PRESETS` directly; re-verified in a browser that both presets' light-counterpart sentences still render correctly. No other gaps found: all 8 Success Criteria, all "What we assume" bullets, and the required physics tests were checked directly against the running application and the test suite (283/283 passing, `tsc --noEmit` clean).

Not yet done: the owner's line-by-line wording approval (§28.1) for the introduction, prediction prompt, results panel, and tutor text (all currently placeholder-free and verified correct, but not yet reviewed word-for-word by the owner).
