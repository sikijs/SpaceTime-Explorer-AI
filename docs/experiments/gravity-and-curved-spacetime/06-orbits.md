# Gravity and Curved Spacetime — Experiment 6: Why Do Planets Orbit Instead of Falling In?

**Status: built, complete-flow tested in a browser, finally reviewed against this specification, and line-by-line wording approved (`CLAUDE.md` §21 Steps 9–10, §28.1; 2026-09-27).** This specification was drafted per `CLAUDE.md` §23 Stage 3, following the proposal Claude Code made in conversation on 2026-09-27, in response to the milestone set after Experiment 5 (what curves spacetime? mass and distance) was completed. Experiment 5's own "Relationship to Later Experiments" section named two candidate directions — orbits, and light bending — without approving either. Claude chose orbits (see the conversation) as the more direct extension of Experiment 4's geodesic idea. All "Decisions Needing Human Review" items were confirmed by the owner (2026-09-27). Physics model (`src/physics/orbitExperiment.ts`), interface, prediction, results panel, and tutor (`src/components/OrbitExperiment.tsx`, `src/components/OrbitTutor.tsx`) are built and wired into the guided journey. Full suite: 218/218 passing. See "Implementation Notes" below for the correctness refinement, the two gaps found and fixed during the final review, and the one addition made during wording review.

## Implementation Notes

While implementing the physics model, a correctness issue was found with the escape-detection approach as originally drafted below (a fixed large-radius threshold): a real, bound elliptical orbit can have a farthest point (apoapsis) that exceeds almost any fixed radius multiple while still eventually turning back, so a naive radius threshold can misclassify a genuinely bound orbit as an escape. Fixed by classifying using the body's specific orbital energy (`E = ½v² − GM/r`), the actual conserved physical quantity that determines bound vs. unbound in real two-body gravity, together with the collision-radius check for falling in. The trajectory itself is still fully numerically integrated, exactly as drafted below — this changes only the decision rule applied to it, from an arbitrary distance threshold to the correct physical criterion. The Physics Model section below reflects this.

The final review against this specification (§21 Step 10) found and fixed two gaps, both cases where this specification's own draft text (copied into the implementation) fell short of a firmer requirement stated elsewhere in this same specification:

1. **The introduction stated only 3 of the 5 assumptions the "Physical Situation" section requires to be told to the learner.** The draft introductory text below only ever had 3 bullets; the "no friction, air resistance, or other body nearby" and "mass and distance are relative, made-up quantities, not real kilograms or meters" assumptions were missing from it. Fixed by adding both bullets to the introduction (and to the draft text below, to keep this specification in sync per `CLAUDE.md` §28.2).
2. **Success Criterion 4 requires both the introduction and the tutor to state plainly that this experiment uses first-order Newtonian gravity, not the exact general-relativistic treatment — but the "AI Tutor Behavior" section's four-point explanation draft never did.** Fixed by adding a fifth explanation point to the tutor (and to the draft text below) stating this directly.

No other gaps were found against `docs/PROJECT.md`, `AGENTS.md`, or this specification.

During the owner's line-by-line wording review (§28.1), the owner asked for the tutor's explanation point 3 (too little/too much/just right sideways motion) to be supported with a daily-life analogy, per `CLAUDE.md` §15. Added: a Newton's-cannonball-style example (throwing a ball harder and harder off a cliff; thrown hard enough, it keeps falling while the ground curves away beneath it just as fast, so it never lands). All other wording was approved as drafted, with no further changes requested.

**Revised 2026-09-27, after the owner returned to ask what "sideways speed" means:** the introduction's "What happens" line first tried a geometric definition alongside a daily-life example (a right angle to the line toward the mass, "like tossing a ball to the side"), which the owner found confusing — two descriptions competing rather than one clear picture. Replaced with a single consistent image: watching from directly above, like two marbles on a table, with "sideways" meaning a push that sends the object passing by the mass rather than toward or away from it. Per `CLAUDE.md` §15.

**Further revised 2026-09-27**, after the owner asked whether the sideways push can be at an angle: confirmed it is always exactly perpendicular to the line toward the mass — `runOrbitExperiment` always launches in the fixed +y direction (see its own comment above `OrbitPoint`); the learner's slider changes only the push's speed, never its direction. Added a new assumption bullet to the introduction (and here) stating this explicitly, since it was previously implicit in the physics model but never told to the learner.

**Further revised 2026-09-27**, after the owner said the word "sideways" itself was confusing throughout, independent of any one explanation of it: replaced it everywhere in learner-facing text with a concrete, indexical description tied to the fixed on-screen picture — the object always starts to the right of the mass and receives one push straight up on the screen at the very start, after which gravity alone acts on it. Learner-facing language now speaks of a "push" and its "strength" (weak/strong) rather than "sideways speed" or "sideways motion," in the introduction, predictions, results panel, slider label, tutor, and the chapter summary (`src/components/OrbitExperiment.tsx`, `src/components/OrbitTutor.tsx`, `src/App.tsx`). Internal, non-learner-facing physics/architecture language in this specification (e.g. "Required Physics Tests," "Relationship to Previous Experiments") still uses "sideways" as an accurate technical description of the launch direction and was left unchanged. Re-verified in a browser.

**Bug found and fixed 2026-09-27**, while re-verifying the animation after the wording pass above: the owner reported the small orbiting object wasn't visible in the animation. The object's marker in `OrbitExperiment.tsx` was gated on `isRunning`, so it vanished the instant the animation finished, leaving only the central mass and the traced path — the object was correctly drawn during playback but disappeared right when the learner would look at the final result. Fixed by rendering the marker whenever a result exists (`result && currentPosition`), regardless of running/complete status, matching the pattern already used for `BlackHoleExperiment.tsx`'s probe marker. Re-verified in a browser.

**Further bug found and fixed 2026-09-27**: the owner then noted the object still wasn't visible *before* Run is clicked — the marker was still gated on a `result` existing at all, so only the central mass showed in the idle state. Fixed by giving `currentPosition` a default value of the fixed launch point (`INITIAL_DISTANCE, 0`) when no result exists yet, and always rendering the marker (no longer conditional on `result`), so the object is visible at its starting point from the moment the scene loads, exactly as `BlackHoleExperiment.tsx`'s launch-point marker already is. Re-verified in a browser.

**Further bug found and fixed 2026-09-27**: the owner reported the Run button "always stays grey even when all predictions are made." The button was a plain `<button>` with no `className`, so it never picked up this project's `.action-button` styling (the colored, disabled-vs-enabled pill style every other experiment's run/launch button uses) — it always rendered as an unstyled default button regardless of its actual `disabled` state, which looked grey either way. Fixed by adding `className="action-button"` to `OrbitExperiment.tsx`'s Run button. The same missing class was found and fixed in `BlackHoleExperiment.tsx`'s Launch button while checking for the same bug elsewhere. Re-verified in a browser: both buttons now show the disabled grey pill before predictions are complete and the active colored pill after.

## Overview

Experiment 4 showed that a geodesic — a path that is "as straight as possible" — can converge with a nearby geodesic purely because the surface it is drawn on is curved, with nothing pushing either path sideways. This experiment shows the other half of that same idea: a geodesic can also curve *around* a mass instead of falling straight into it, if it starts out moving sideways. There is no new force at work and nothing pushes the orbiting body sideways to keep it up — its path is still "as straight as spacetime allows," exactly like Experiment 4's two travelers, only now traced out by one object with sideways motion near a mass instead of two travelers on a sphere.

The learner launches a small object near a fixed central mass with some sideways speed, and watches what happens: falling straight in, flying off and never coming back, or curving around and returning — all from the same mass, the same starting distance, and only the sideways speed changed.

This experiment uses ordinary first-order (Newtonian) gravity, not the exact general-relativistic treatment, exactly as Experiments 2, 3, and 5 already do, and says so plainly.

---

## Learning Objective

After this experiment, the learner should understand:

1. An orbit is not the result of a special "centrifugal" force balancing gravity — it is a single geodesic, curving under gravity alone, that happens not to fall in or escape.
2. The same starting distance and the same mass can produce three completely different outcomes — falling in, escaping, or orbiting — depending only on how fast the object is moving sideways when it starts.
3. "Falling in a curve" and "falling straight down" (Experiment 1) are the same kind of motion; an orbit is what falling looks like when there is also sideways motion to begin with.
4. This connects back to Experiment 4: the orbiting object's path is a geodesic, curving because spacetime near the mass is curved (Experiment 4), and how strongly it is curved depends on the mass and distance (Experiment 5).

---

## Physical Situation

A single fixed central mass, drawn at the center of the scene. A small orbiting body starts at a fixed distance from the mass, moving directly sideways (perpendicular to the line joining it to the mass) at a learner-chosen speed. The learner watches the body's path unfold over time in a 2D top-down view — the first experiment in this project to show motion in two dimensions at once, rather than a single line or a fixed 1D separation.

### Simplifying assumptions (must be stated to the learner, in plain language)

- This experiment uses ordinary Newtonian gravity (the same inverse-square law used to predict real satellite and planetary motion to good accuracy), not the exact general-relativistic treatment — consistent with Experiments 2, 3, and 5's own first-order approximations.
- The central mass does not move (it is far heavier than the orbiting body, so its own motion can be ignored, as is standard for e.g. a planet orbiting the Sun).
- There is no friction, air resistance, or other body nearby — only the one mass and the one orbiting object.
- Mass and distance are relative, dimensionless quantities, as in Experiment 5, not real kilograms or meters.
- This experiment is non-relativistic in the same sense as Experiments 2, 3, and 5: nothing here moves close to `c`.

### Not introduced

Real astronomical values, elliptical-orbit geometry beyond what the simulation shows directly, orbital energy/angular-momentum formalism, general-relativistic orbital effects (e.g. perihelion precession), light bending — candidates for later experiments, not this one.

---

## Physics Model

Ordinary Newtonian gravity in two dimensions: the orbiting body accelerates toward the central mass with a magnitude proportional to the mass and inversely proportional to the square of the distance (the inverse-square law), computed by direct numerical integration of the equations of motion — not a shortcut formula, so that falling-in, escaping, and orbiting all fall out of the same single calculation rather than being special-cased.

```typescript
// src/physics/orbitExperiment.ts
export interface OrbitPoint {
  t: number
  x: number
  y: number
}

export type OrbitOutcome = 'falls-in' | 'escapes' | 'orbits'

export interface OrbitExperimentResult {
  gravitationalParameter: number   // GM, dimensionless ("how strongly the mass pulls")
  initialDistance: number          // dimensionless
  initialSpeed: number             // dimensionless, sideways
  circularSpeed: number            // sqrt(GM / initialDistance) — the exact speed for a circular orbit
  escapeSpeed: number              // sqrt(2 * GM / initialDistance)
  outcome: OrbitOutcome
  trajectory: OrbitPoint[]
}

export function runOrbitExperiment(
  gravitationalParameter: number,
  initialDistance: number,
  initialSpeed: number
): OrbitExperimentResult
```

- The body starts at `(initialDistance, 0)` moving in the `+y` direction at `initialSpeed`.
- Acceleration at position `(x, y)`: `a = -gravitationalParameter * (x, y) / r³`, where `r = sqrt(x² + y²)`.
- Integrated with a fixed-step symplectic (leapfrog / semi-implicit Euler) method, chosen because it conserves orbital energy far better than plain Euler over many steps — a plain Euler integrator would make circular orbits visibly spiral due to integration error alone, which is not a real physical effect and would misrepresent the physics.
- The simulation stops and classifies the outcome as soon as one of these is true, whichever comes first:
  - `r <= collisionRadius` (a small fixed fraction of `initialDistance`) → **`falls-in`**.
  - The body's specific orbital energy `E = ½(vx² + vy²) - gravitationalParameter / r` is positive (beyond a small numerical tolerance) **and** the body's radial velocity is outward → **`escapes`**. Energy, not a distance threshold, is what actually separates a bound orbit from an unbound one in real two-body gravity: a highly eccentric but still-bound orbit can travel arbitrarily far from the mass before turning back, so a fixed "far enough away" radius could otherwise misclassify a genuinely bound orbit as an escape.
  - A fixed maximum simulated time (`8` circular orbital periods) is reached without either → **`orbits`** (bounded — either it never satisfied the escape condition, or it did turn back before the check, and Experiment 6's own tests confirm this holds for the presets actually offered).
- `circularSpeed` and `escapeSpeed` are computed directly from the standard formulas (not simulated) and used only for the Results Display and physics tests, never revealed to the learner as an equation before they predict.
- `gravitationalParameter` and `initialDistance` are fixed per run by the learner's chosen presets (see "Learner Controls"); the physics function itself takes them as plain arguments and performs no clamping — control-level clamping, if any, happens in the calling component, matching Experiment 5's pattern of keeping arguments validated at the boundary and the physics function focused on the calculation.

---

## Learner Controls

- **Push strength**: a single slider or preset control — the strength of the one push the object gets at the start, always in the same fixed direction — expressed relative to the circular-orbit speed at the fixed starting distance and mass (e.g. "0% to 200% of circular speed"), so the same control sensibly spans all three outcomes regardless of the chosen mass/distance. This is the experiment's one primary control, matching Experiment 3's pattern of one focused variable per scene.
- Mass and starting distance are held fixed at reasonable constants for this experiment (not reusing Experiment 5's mass/distance presets as learner controls — see "Decisions Needing Human Review" item 1), so the learner's attention stays on the one variable that actually determines the outcome.

---

## Prediction Activity

Before running, the learner is asked (draft wording, pending owner review, §28.1):

1. "If the starting push is very weak, what do you think happens: does it fall into the mass, fly away and never come back, or curve around and come back to where it started?"
2. "If the starting push is very strong instead, which of those three do you expect?"
3. "Is there a push strength in between where something different happens?"

Each with the same three choices ("Falls in" / "Flies away and never returns" / "Curves around and comes back"). Not scored.

---

## Experiment Behavior

### Introductory text (draft — pending owner review, §28.1)

> **The question.** Why do planets go around the Sun instead of falling straight into it, or flying off into space?
>
> **What happens.** You'll watch this from directly above, like looking down at two marbles on a table. A small object starts to the right of a fixed mass, and you'll give it a single push — straight up on the screen — at the very start. After that, gravity is the only thing acting on it, constantly pulling it back toward the mass on the left. You choose how strong that starting push is, then watch what path the object follows.
>
> **Your job.** Try a weak push and a strong push, and see what happens to the path.
>
> **What we assume.**
> - This uses ordinary gravity (the same rule used to predict real satellites and planets), not the exact general relativity from Experiment 4's curved-spacetime picture — a simplification also used in Experiments 2, 3, and 5.
> - The central mass doesn't move; only the small object does.
> - The push always points the same way — straight up on the screen. Only how strong it is changes; its direction never does.
> - There's no friction, no air resistance, and no other mass nearby — just this one mass and the orbiting object.
> - The mass and distance here are relative, made-up amounts, not real kilograms or meters.
> - Nothing here moves anywhere close to the speed of light.

### Display

A top-down 2D view: the central mass at a fixed point, and the orbiting body's path traced out as it moves, in real time as the simulation runs.

### Run

The path animates over a fixed real-world duration regardless of how much simulated time it represents (`CLAUDE.md` §11 — playback speed must not change the physical result); if the outcome is reached (collision or escape) before the animation's nominal duration, the animation stops there rather than continuing to draw nothing.

---

## Results Display

- The chosen push strength, and how it compares to the circular and escape speeds at the fixed mass and distance (e.g. "you launched at 65% of circular speed").
- The final outcome (fell in / escaped / orbited), stated in plain language.
- The full traced path, left on screen after the run.
- The learner's three predictions, shown beside what actually happened.

---

## Expected Observations

1. A very weak push (well below circular speed) results in falling in.
2. A very strong push (well above escape speed) results in escaping.
3. Speeds at or near the circular speed result in a closed orbit (circular or elliptical) that returns to its starting point.
4. Exactly at the circular speed, the path is a circle at constant distance from the mass.

---

## Expected Learner Understanding

The learner should be able to say: "An orbit isn't a special force holding something up — it's just falling, curved by the one push it got at the start. The same mass and the same starting distance can make an object fall in, fly away, or orbit forever, depending only on how strong that starting push was."

---

## New Concepts Introduced

- **Orbit** as a geodesic under gravity alone, not a balance of forces.
- The idea that a single starting condition (the strength of the initial push) determines which of three qualitatively different outcomes occurs.

---

## Relationship to Previous Experiments

- Directly extends Experiment 4's geodesic idea: the orbiting body's curving path is a geodesic, just as the two travelers' converging paths were.
- Uses Experiment 5's mass/distance-drives-curvature idea conceptually (a stronger, closer mass curves spacetime more, which is why the required sideways speed to orbit depends on both), though this experiment does not reuse Experiment 5's code directly — it computes Newtonian gravity, a distinct (if related) first-order model, not a call into `strengthsForMassAndDistance`.
- First experiment requiring genuine 2D motion and a numerical trajectory simulation, rather than a 1D drop, a fixed geometric relationship, or a closed-form time-dilation factor — a real architectural step beyond Experiments 1–5, flagged for review below.

## Relationship to Later Experiments

None approved. Escape speed and orbital shape here could motivate a later experiment on light bending (the same geodesic idea, but for something that cannot fall in or slow down) or on black holes (what happens when `collisionRadius` cannot be escaped from at any speed) — not proposed or approved here.

---

## Required Physics Tests

1. At `initialSpeed = 0`, the body falls straight toward the mass along the line to it (no sideways deviation) and the outcome is `falls-in`.
2. At `initialSpeed = circularSpeed`, the distance from the mass stays within a small numerical tolerance of `initialDistance` for the full simulated duration, and the outcome is `orbits`.
3. At `initialSpeed` well above `escapeSpeed`, the outcome is `escapes`.
4. At `initialSpeed` well below `circularSpeed` but greater than 0, the outcome is `falls-in`.
5. `circularSpeed` and `escapeSpeed` match the standard closed-form formulas (`sqrt(GM/r)`, `sqrt(2GM/r)`) for several `(gravitationalParameter, initialDistance)` pairs.
6. The simulation conserves total orbital energy to within a small numerical tolerance over one full orbit at `circularSpeed` (verifying the integrator is accurate enough not to misrepresent the physics as spiraling).
7. Deterministic across repeated calls for the same inputs; independent of any UI or animation state.
8. Invalid inputs (`gravitationalParameter <= 0`, `initialDistance <= 0`, `initialSpeed < 0`) throw, matching the validation pattern in `gravitationalTimeDilationExperiment.ts` and `tidalEffectExperiment.ts`.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiments 1–5 in this phase:

- **Before the run:** helps the learner form all three predictions; does not reveal the answer.
- **During the run:** silent.
- **After the run:**
  1. Observation: "What happened to the path this time — did it fall in, fly away, or come back around?"
  2. Prediction comparison: the learner's three predicted outcomes beside what the simulation actually showed for their chosen push strength.
  3. Conceptual question: "The mass and the starting distance were the same the whole time. What was the only thing that changed between falling in, escaping, and orbiting?"
  4. Explanation: (1) the object is always just falling under gravity, exactly like Experiment 1's dropped ball — the only push it ever got was the one at the very start; (2) the only difference is how strong that starting push was; (3) too weak a push and it falls in before it can "miss" the mass; too strong and it flies past and never comes back; just the right strength and it keeps "missing" the mass forever, which is what an orbit is — illustrated with a daily-life analogy (throwing a ball harder and harder off the edge of a cliff: thrown hard enough, it keeps falling while the ground curves away beneath it just as fast, so it never lands); (4) this is the same idea as Experiment 4's geodesics — the path is as straight as spacetime allows, and it curves because spacetime near the mass is curved (Experiment 4), by an amount that depends on the mass and distance (Experiment 5); (5) this used ordinary, first-order gravity — the same rule used to predict real satellites and planets — not the exact general-relativistic calculation, the same simplification Experiments 2, 3, and 5 use.
  - The tutor must not introduce real astronomical values, elliptical-orbit mechanics beyond what the learner directly observed, light bending, black holes, or general-relativistic orbital effects — out of scope for this experiment.

---

## Decisions Needing Human Review

1. **Newtonian approximation, explicitly caveated.** Proposed: state plainly, in the introduction and tutor, that this uses ordinary (first-order) gravity, not the exact general-relativistic orbit calculation — matching Experiments 2, 3, and 5's own precedent of naming their approximation rather than presenting it as exact. Needs confirmation.
2. **2D motion and a numerical trajectory simulation are new to the project's architecture** (every prior physics model is 1D or a closed-form relationship; this one integrates equations of motion step by step). Needs confirmation that this added complexity is acceptable for this experiment.
3. **Fixed mass and distance, single learner control.** Proposed: hold mass and starting distance fixed constants and let the learner vary only sideways speed (expressed relative to circular speed), rather than reusing Experiment 5's mass/distance presets as additional controls, to keep the one variable that determines the outcome unambiguous. Needs confirmation, or a preference for also varying mass/distance.
4. **Title** — "Why Do Planets Orbit Instead of Falling In?" — working title, needs confirmation or an alternative.
5. **Exact numeric constants** (the gravitational parameter, starting distance, collision/escape radius thresholds, maximum simulated time, integrator step size) are not yet chosen. Claude proposes to pick reasonable defaults reproducing the "Expected Observations" above and present them for confirmation once implementation begins, following the pattern used for Experiment 5's constants — needs confirmation that this deferred-numeric-choice approach is acceptable, or a preference to fix them here in the specification instead.

None of the learner-facing introduction, prediction, results, or tutor wording above has been reviewed yet (`CLAUDE.md` §28.1); all of it is draft, subject to revision.

---

## Success Criteria

1. The physics model computes falling-in, escaping, and orbiting from one single simulation (no special-casing per outcome), using a real, unmodified inverse-square gravity law.
2. The learner predicts before running, for at least the slow and fast sideways-speed cases.
3. The learner can, after the experiment, correctly identify sideways speed as the one thing that turns the same fall into falling-in, escaping, or orbiting.
4. The introduction and tutor state plainly that this experiment uses first-order Newtonian gravity, not the exact general-relativistic treatment.
5. No real astronomical values, elliptical-orbit formalism beyond direct observation, light bending, black holes, or general-relativistic orbital effects appear.
