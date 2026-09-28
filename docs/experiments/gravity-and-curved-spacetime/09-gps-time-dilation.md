# Gravity and Curved Spacetime — Experiment 9: Real Clocks in Orbit (GPS and the Balance of Two Effects)

**Status: built, complete-flow tested, and reviewed against this specification (`CLAUDE.md` §21 Steps 9–10; one gap found and fixed — see "Implementation Notes"). All "Decisions Needing Human Review" items confirmed — see "Decisions Confirmed" below. Confirmed by the owner (2026-09-28) as the closing experiment of the "Gravity and Curved Spacetime" chapter and of the project's current two-chapter arc as a whole, ending with the "Closing Synthesis" section below. Physics model, tests, interface, prediction, results panel, tutor, and the closing synthesis are implemented and wired into the guided journey (`src/physics/gpsTimeDilationExperiment.ts`, `src/physics/gpsTimeDilationExperiment.test.ts`, `src/components/GpsTimeDilationExperiment.tsx`, `src/components/GpsTimeDilationTutor.tsx`, `src/App.tsx`). The owner's line-by-line wording approval (`CLAUDE.md` §28.1) is complete (2026-09-28), approved as written with no changes requested, for both the "Closing Synthesis" and the rest of the introduction, predictions, results panel, and tutor wording. Not yet committed to git.**

---

## Overview

Every experiment in this project so far has used abstracted, dimensionless, deliberately exaggerated numbers — because the real relativistic effects are far too small to see at human scales (Experiment 2's own strength control, for instance, stands in for an effect around 1 part in 10 quadrillion for a real rocket).

This experiment is different: it uses real numbers, for a real, currently-operating piece of technology. A GPS satellite in orbit experiences two relativistic effects on its clock at once:

- **Special relativity (motion):** the satellite moves fast, so its clock runs *slower* than a clock on the ground — the same effect as Experiments 3–4, just too small to see there without exaggeration.
- **General relativity (gravity):** the satellite sits higher up, in a weaker gravitational field, so its clock runs *faster* than a clock on the ground — the same effect as Experiment 2, just too small to see there without exaggeration.

These two effects don't just both exist — they partly cancel, and which one wins depends on how high the orbit is. This experiment lets the learner adjust orbital altitude and watch both effects, computed from real physics, compete — including the specific altitude where they exactly cancel, and the real GPS altitude, where the gravitational effect wins by a real, measured amount: about 38 millionths of a second per day.

This is the first experiment in the project to compute a genuinely real physical quantity end to end, rather than an abstracted stand-in (see "Decisions Needing Human Review" item 1).

---

## Learning Objective

After this experiment, the learner should understand:

1. A satellite's clock is affected by two separate relativistic effects at once: it runs slower because it moves fast (Experiment 3/4's effect), and faster because it sits in a weaker gravitational field (Experiment 2's effect).
2. These two effects can partly or fully cancel, depending on the orbit's altitude — there is a specific altitude where a satellite clock would exactly match a ground clock.
3. Below that altitude, the speed effect wins (the satellite clock runs slow); above it, the gravity effect wins (the satellite clock runs fast).
4. At GPS altitude, the gravity effect wins, and the satellite clock runs fast by a real, measured amount — about 38 microseconds per day — which GPS receivers must correct for to give accurate positions.
5. This is not a thought experiment: it is a correction real engineers make in a real, working system every day.

---

## Physical Situation

A satellite orbits the Earth in a circular orbit at a learner-chosen altitude. Both relativistic effects are computed from that single altitude, using real Earth constants:

- **Speed effect:** a satellite in a circular orbit moves faster the lower its altitude (closer to Earth means stronger gravity means faster orbital speed, the same relationship Experiment 6 already established). That speed produces ordinary motion-based time dilation, exactly as in Experiment 3/4, just using the real, tiny speed instead of an exaggerated fraction of `c`.
- **Gravity effect:** the satellite sits at a different height in Earth's gravitational field than a ground clock. Using the same first-order reasoning as Experiment 2 (higher means a weaker field means a faster clock), but now with the real Newtonian gravitational potential rather than an abstract "strength" control.

Both effects are computed from the same one input — orbital altitude — because a circular orbit's speed is itself determined by its altitude (Experiment 6's `sqrt(GM / r)`). The learner does not set speed and altitude independently.

### Simplifying assumptions (must be stated to the learner, in plain language)

- Both effects use the same **first-order (weak-field) approximation** as Experiments 2 and 3/4 — accurate to extremely high precision for real Earth orbits, but not the exact general-relativistic (Schwarzschild) treatment.
- The ground clock is treated as sitting still at Earth's surface, ignoring Earth's own rotation (a real GPS correction also accounts for the ground receiver's motion from Earth spinning, which this experiment leaves out).
- Earth's gravitational field is treated as if Earth were a perfect, non-rotating sphere.
- The satellite's orbit is treated as exactly circular.
- Real GPS corrections also include several smaller effects (orbital eccentricity, atmospheric delay, and others) that are out of scope here entirely — this experiment reproduces only the two dominant relativistic effects.

### Not introduced

The exact Schwarzschild metric, Earth's rotation or oblateness, orbital eccentricity, atmospheric or hardware delays, how a GPS receiver actually uses timing signals to compute position, and curved-spacetime geometry itself (candidates for a possible later experiment, not this one).

---

## Physics Model

Reuses Experiment 6's orbital mechanics (`orbitalSpeedAt` style circular-orbit relation) and Experiment 3's exact time-dilation formula (`timeDilationFactorFor`) directly. Adds one new real-unit calculation for the gravitational effect, since Experiment 2's `strength` control has no real-unit meaning.

```typescript
// src/physics/gpsTimeDilationExperiment.ts
export const EARTH_GM = 3.986004418e14        // m^3 / s^2 (standard gravitational parameter, GM)
export const EARTH_RADIUS_METERS = 6.371e6    // m (mean Earth radius)
export const REAL_SPEED_OF_LIGHT = 299_792_458 // m / s

// The altitude, in meters, at which the two effects exactly cancel for a circular orbit
// under this first-order approximation: derivable in closed form as 1.5 * EARTH_RADIUS_METERS
// (see "Required Physics Tests" item 6).
export const CROSSOVER_ORBITAL_RADIUS_METERS = 1.5 * EARTH_RADIUS_METERS

export interface GpsTimeDilationResult {
  orbitalRadiusMeters: number
  orbitalSpeedMetersPerSecond: number
  speedEffectFraction: number          // negative: satellite clock runs slow from speed
  gravityEffectFraction: number        // positive: satellite clock runs fast from altitude
  netEffectFraction: number            // gravityEffectFraction + speedEffectFraction
  netMicrosecondsPerDay: number
}

export function runGpsTimeDilationExperiment(
  orbitalRadiusMeters: number   // must be > EARTH_RADIUS_METERS
): GpsTimeDilationResult
```

```
orbitalSpeed        = sqrt(EARTH_GM / orbitalRadiusMeters)                       // circular orbit, Experiment 6's relation
speedEffectFraction  = timeDilationFactorFor(orbitalSpeed / REAL_SPEED_OF_LIGHT) - 1   // Experiment 3's exact formula, reused directly
gravityEffectFraction
  = EARTH_GM * (1 / EARTH_RADIUS_METERS - 1 / orbitalRadiusMeters)
    / REAL_SPEED_OF_LIGHT^2                                                      // weak-field Newtonian-potential difference
netEffectFraction   = gravityEffectFraction + speedEffectFraction
netMicrosecondsPerDay = netEffectFraction * 86400 * 1_000_000
```

`speedEffectFraction` reuses Experiment 3's `timeDilationFactorFor` directly (confirmed, "Decisions Confirmed" item 2), evaluated at the real (tiny) `orbitalSpeed / REAL_SPEED_OF_LIGHT` ratio, rather than writing a separate weak-field approximation formula — `movingClockExperiment.ts`'s own `SPEED_OF_LIGHT = 1` is itself just a choice of units, so passing a real `v/c` ratio in its place is valid. `gravityEffectFraction` is a new formula — the real-unit counterpart to Experiment 2's abstracted `strength` — using the Newtonian gravitational potential `Φ(r) = -GM/r` directly rather than a stand-in control.

Structured independently of any UI, per `CLAUDE.md` §9. No animation loop is required — see "Display."

---

## Learner Controls

- **Orbital altitude**, via a slider in kilometers above Earth's surface, range **300 km** (just above the International Space Station's real altitude) to **36,000 km** (geostationary orbit), with three labeled preset buttons that set the slider directly: **ISS (~400 km)**, **GPS (~20,200 km)**, **Geostationary (~35,786 km)**. The default is GPS.

---

## Prediction Activity

Before the altitude control and results are shown, the learner is asked three questions, in order:

1. "A satellite orbiting higher up moves slower than one orbiting lower down (as in Experiment 6). As altitude increases, does the *speed-based* slowing effect on the satellite's clock get stronger, weaker, or stay the same?" (More / Less / About the same)
2. "Do you think there's a specific altitude where the speed effect and the gravity effect exactly cancel, so the satellite clock matches a ground clock?" (Yes / No)
3. "At GPS altitude (about 20,200 km), do you think the satellite's clock ends up running faster than a ground clock, slower, or at the same rate?" (Faster / Slower / Same rate)

Choices are not scored. The altitude control is disabled until all three predictions are entered, matching Experiments 1–8 in this phase.

---

## Experiment Behavior

### Introductory text (draft wording — pending the owner's line-by-line approval after implementation, `CLAUDE.md` §28.1, following the pattern used for every prior experiment in this phase)

> **The question.** A GPS satellite's clock has to be extremely accurate — a tiny error becomes a real position error on the ground. But a satellite's clock experiences relativity two ways at once: Experiments 3–4 showed that motion slows a clock down; Experiment 2 showed that being higher in a gravitational field speeds a clock up. Which one wins for a real satellite?
>
> **What happens.** You'll choose an orbital altitude. From that one number, we calculate the satellite's real orbital speed (as in Experiment 6), and from that, both relativistic effects on its clock — using real Earth numbers, not exaggerated ones.
>
> **Your job.** Try different altitudes — including the real GPS altitude — and see which effect wins, and by how much.
>
> **What we assume.** Both effects use the same first-order approximation as Experiments 2 and 3/4 — accurate to extremely high precision for a real satellite, but not the exact general-relativistic formula. The orbit is treated as exactly circular, Earth as a perfect non-rotating sphere, and a few smaller real GPS corrections (Earth's rotation, orbital eccentricity, and others) are left out entirely.
>
> **One more thing.** This is the last experiment in this two-chapter journey. Once you've run it, scroll down to "Putting It All Together" below — it steps back and explains, in full, what the two theories behind everything you've explored (special relativity and general relativity) actually claim, using only what you've already seen for yourself.

### Display

A simple orbital diagram: Earth as a circle, the satellite as a point at the chosen altitude on a circular path. No animation is required — this is a calculated comparison, not a run-to-completion process like Experiments 1–8 — but the satellite's position should visually update as the altitude slider moves, so the learner sees the orbit grow or shrink with altitude. Alongside it, a live numeric readout of orbital speed, the speed effect, the gravity effect, and the net effect, updating as the slider moves.

A labeled marker at `CROSSOVER_ORBITAL_RADIUS_METERS` (altitude ≈ 3,186 km) shows the learner where the two effects cancel.

### Run

There is no "Run" or "Launch" button — since nothing plays out over time, results update live as the learner moves the altitude slider, after all three predictions are answered. Reaching a "Results" state (for the check mark and tutor, per `App`'s `onComplete` convention) is triggered by the learner explicitly confirming a chosen altitude (a "Show results" button), so that a result and the tutor step, like every other experiment, follow an explicit learner action rather than firing on every slider tick.

---

## Results Display

- Chosen altitude and orbital radius; computed orbital speed.
- The speed effect and the gravity effect, each as a signed fraction and in human-readable microseconds/day, clearly labeled which direction each one pushes the clock.
- The net effect, in microseconds/day, with a plain-language statement of which effect wins at this altitude.
- The crossover altitude (≈ 3,186 km), named explicitly, with a note on whether the chosen altitude is above or below it.
- One paragraph of real-world grounding: GPS satellites (at ≈ 20,200 km) really do run fast by about 38 microseconds/day, and this is a correction real GPS receivers apply, not a hypothetical.
- The learner's three predictions, shown beside what's actually true at the chosen altitude.

---

## Expected Observations

1. Orbital speed decreases as altitude increases (reusing Experiment 6's own relationship).
2. The magnitude of the speed effect (clock-slowing) decreases as altitude increases.
3. The magnitude of the gravity effect (clock-speeding) increases as altitude increases.
4. Below the crossover altitude (≈ 3,186 km), the net effect is negative (satellite clock runs slow); above it, positive (satellite clock runs fast); at the ISS's real altitude (≈ 400 km), the net effect is negative — even real astronauts' clocks run very slightly slow compared to the ground.
5. At GPS altitude (≈ 20,200 km), the net effect is positive and close to the real, measured value of about +38 microseconds/day.

---

## Expected Learner Understanding

The learner should be able to say: "A satellite's clock is pulled two ways at once — its speed slows it down, the same effect as Experiments 3 and 4, and its altitude speeds it up, the same effect as Experiment 2. Which one wins depends on how high the orbit is: low orbits like the ISS lose the race to speed, and the clock runs slow; high orbits like GPS win it to altitude, and the clock runs fast. For real GPS satellites this isn't a small detail — their clocks really do run about 38 millionths of a second fast every day, and GPS receivers have to correct for exactly that, or their position calculations would drift by kilometers within a day."

---

## New Concepts Introduced

1. **Two relativistic effects acting on one clock at once, and partly cancelling** — the idea that Experiments 2 and 3/4's effects are not mutually exclusive; a single real clock can experience both simultaneously.
2. **The crossover altitude**, defined in plain language: the specific height where the two effects exactly balance.
3. A first genuinely real, non-abstracted numerical result in this project — explicitly named as a distinction from every gravity-chapter experiment before it.

---

## Relationship to Previous Experiments

- Reuses Experiment 6's circular-orbit speed relation (`sqrt(GM / r)`) directly, unchanged.
- Reuses Experiment 3's exact time-dilation reasoning (motion slows a clock), now evaluated at a real, tiny `v/c` rather than an exaggerated one.
- Reuses Experiment 2's core conclusion (altitude in a gravitational field changes clock rate) and its equivalence-principle grounding, now computed with the real Newtonian potential instead of an abstract `strength` control.
- Is the first experiment in either chapter to combine two previously-separate experiments' effects into a single computed result, rather than demonstrating one effect in isolation.

## Relationship to Later Experiments

**None. This experiment closes both the "Gravity and Curved Spacetime" chapter and the project's current two-chapter arc as a whole** (confirmed by the owner, 2026-09-28) — a capstone that shows the abstracted effects from earlier experiments are, in combination, a real correction in real use, followed immediately by the "Closing Synthesis" section below. A further chapter (e.g., gravitational waves, or a dedicated curved-spacetime geometry treatment) remains a candidate for a future milestone, but is not approved and not planned as a direct continuation of this arc.

---

## Required Physics Tests

1. `orbitalSpeedMetersPerSecond` equals `sqrt(EARTH_GM / orbitalRadiusMeters)` exactly, for several `orbitalRadiusMeters` values.
2. `orbitalSpeedMetersPerSecond` strictly decreases as `orbitalRadiusMeters` increases.
3. `speedEffectFraction` is strictly negative for every valid `orbitalRadiusMeters`, and its magnitude strictly decreases as `orbitalRadiusMeters` increases.
4. `gravityEffectFraction` is strictly positive for every valid `orbitalRadiusMeters` greater than `EARTH_RADIUS_METERS`, and strictly increases as `orbitalRadiusMeters` increases.
5. At `orbitalRadiusMeters = CROSSOVER_ORBITAL_RADIUS_METERS`, `netEffectFraction` is zero to within a small numerical tolerance.
6. `CROSSOVER_ORBITAL_RADIUS_METERS` equals `1.5 * EARTH_RADIUS_METERS` exactly — a closed-form consequence of this experiment's two formulas (confirms the derivation, not just a numerically-found value).
7. `netEffectFraction` is negative for `orbitalRadiusMeters` corresponding to the ISS's real altitude (≈ 400 km) and positive for GPS altitude (≈ 20,200 km).
8. At GPS altitude, `netMicrosecondsPerDay` is within a small tolerance of the real, published value of approximately +38 microseconds/day (decomposing to approximately −7.2 µs/day from speed and +45.7 µs/day from gravity).
9. `orbitalRadiusMeters <= EARTH_RADIUS_METERS` throws, matching the validation pattern in `orbitExperiment.ts` and `blackHoleExperiment.ts`.
10. The function is deterministic across repeated calls for the same input.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiments 1–8 in this phase:

- **Before results:** helps the learner form all three predictions; does not reveal the answer.
- **After "Show results":**
  1. Observation: "At the altitude you chose, which effect won — did the satellite's clock end up running fast, or slow, compared to the ground?"
  2. Prediction comparison: the learner's three predicted answers beside what's actually true at their chosen altitude.
  3. Conceptual question: "GPS satellites orbit much higher than the crossover altitude. Based on what you just saw, do you think that means their clocks run fast or slow — and does that match what real GPS systems have to correct for?"
  4. Explanation: (1) a satellite's clock is affected by both its speed (Experiment 3/4's effect, which slows it) and its altitude (Experiment 2's effect, which speeds it up) at the same time; (2) which one wins depends on orbital altitude, because a circular orbit's speed and altitude are linked — lower orbits move faster (Experiment 6); (3) there's a specific altitude, about 3,186 km, where the two effects exactly cancel; (4) real GPS satellites orbit far above that altitude, so the altitude effect wins, and their clocks really do run about 38 millionths of a second fast every day — a real, measured, and corrected-for effect, not a hypothetical; (5) this is the first calculation in the whole project using real numbers rather than an exaggerated stand-in, because this is the one place the effect is large enough, over a large enough distance and speed, to matter in something people actually use.
  - The tutor may name GPS's real correction and the ISS's real altitude as verifiable facts, but must not explain exactly how a GPS receiver computes position from corrected timing signals, Earth's rotation or oblateness, or orbital eccentricity — out of scope for this experiment.

---

## Closing Synthesis: "Putting It All Together"

A dedicated, non-interactive section on this same page, shown after the tutor's explanation completes (`tutorStep === 'explained'`), below it. It carries no prediction, no measurement, and no new physics — it only names and states, in full, the two theories whose effects the learner has already directly observed across both chapters, tying each claim back to the specific experiment that already demonstrated it. This is why it belongs at the very end of the journey rather than at the start of either chapter (`CLAUDE.md` §15: terms are defined once the learner needs them, after the intuition is built, not before).

The introduction's "One more thing" paragraph (above) points the learner to this section while they are still on this page, before they've necessarily reached the end.

### Wording (approved by the owner as written, `CLAUDE.md` §28.1, 2026-09-28)

> ## Putting It All Together: What Is Relativity?
>
> You've now run every experiment in this two-part journey. Everything you've seen is part of two theories, both created by Albert Einstein: **special relativity** (1905) and **general relativity** (1915). Neither name has come up until now, on purpose — first you experienced what they predict, and only now do we name what they actually claim.
>
> ### Special Relativity
>
> Special relativity rests on exactly two starting assumptions. Everything in the first part of this journey (Experiments 1–11) follows logically from just these two — none of it is a separate, extra rule.
>
> **1. The Principle of Relativity.** The laws of physics work exactly the same for everyone moving at a constant speed in a straight line. There's no experiment you can run inside a sealed, smoothly-moving box that tells you whether you're "moving" or "standing still."
>
> *A daily-life picture:* sit in a train with the curtains drawn, on perfectly smooth track, moving at a steady 200 km/h. Pour a cup of coffee. It pours exactly as it would if the train were parked at the station — nothing about the physics gives away that you're moving. This is the "reference frame" idea from Experiment 2.
>
> **2. The speed of light is the same for everyone.** Light in a vacuum travels at the same speed — about 300,000 km/s — no matter how fast its source is moving, and no matter how fast the person measuring it is moving. This breaks the everyday rule that speeds add together. You saw this rule directly in Experiment 5, comparing the everyday "speeds add" rule against light's actual behavior.
>
> **Why these two are enough:** if light's speed must come out the same for every observer (rule 2), but different observers can be moving relative to each other (which rule 1 allows), then something else has to give — and what gives is time and space themselves. Time dilation (Experiments 3–4), length contraction (Experiment 6), the relativity of simultaneity (Experiment 7), and the twin paradox's asymmetry (Experiment 10) aren't independent rules you had to take on faith — they're the unavoidable consequence of holding both of the above at once. Experiment 11's Lorentz transformation is the exact mathematical machine that turns these two rules into every one of those specific effects.
>
> ### General Relativity
>
> General relativity rests on two core ideas: one is a foundational assumption, the other is the theory's central claim.
>
> **1. The Equivalence Principle.** Being in a gravitational field and being in an accelerating rocket are locally indistinguishable — no experiment done inside a small, sealed cabin can tell the two apart. This is exactly Experiment 1's result: a dropped ball behaves identically in both cabins.
>
> *A daily-life picture:* if the cable holding an elevator snapped, everyone inside would float — weightless — for the few seconds before it hit the ground. That's not gravity switching off. It's the same physics as coasting in a spaceship far from any planet, engine off. Free fall *is* weightlessness, exactly, because gravity and acceleration are the same thing locally.
>
> **2. Gravity is the curvature of spacetime, not a force pulling things together.** Massive objects bend the shape of spacetime around them, and everything — including light — simply follows the straightest possible path through that curved shape (a "geodesic"). What looks like an attractive force is really geometry.
>
> *How you built this up, piece by piece:* Experiment 1 established the equivalence principle. Experiment 3 showed gravity isn't *exactly* like acceleration — real gravity has a center, so it pulls things together, which a uniformly accelerating rocket can never reproduce. Experiment 4 showed what "curvature" concretely means: parallel paths that converge. Experiment 5 showed what determines how much curvature there is: mass and distance. Experiments 6–8 showed the consequences of that curvature — orbits, black holes, and light bending. This experiment (9) showed that gravitational time dilation isn't a rare, exotic effect confined to thought experiments — it's a real correction in a real, working system.
>
> *The same simple math, reused:* the `acceleration × height / c²`-style formulas used throughout Chapter 2 (Experiments 2 and 9) are the simplified, weak-field version of general relativity's curvature effect — not a separate rule invented for this project, but the real theory scaled down to something calculable by hand.
>
> ### Why we waited until now to say this
>
> Naming these theories at the very start would have asked you to accept abstract statements before you had any reason to believe them. Instead, every one of the nine-plus-eleven experiments you ran was one small, concrete piece of evidence — and only now, with all of it in hand, do the two abstract-sounding theories turn into: "oh, that's just describing what I already watched happen."

### Display

Plain text, styled distinctly from the tutor's conversational Q&A panel above it (no text input, no "Continue" button) — this is a closing statement to read, not another round of the predict/observe/explain cycle. No `onComplete`-style callback; reaching it doesn't need to be separately tracked, since it only appears after the tutor step (already tracked via `onTutorComplete`) is reached.

---

## Decisions Confirmed

All items were confirmed by the owner in conversation on 2026-09-28.

1. **Using real SI units and real Earth constants for the first time in the project**, rather than the abstracted, exaggerated controls used by every experiment before it (Experiments 3–6's speed-as-fraction-of-`c`, Experiment 2's dimensionless `strength`, Experiments 6–8's made-up `gravitationalParameter`). Confirmed (Claude's recommendation, accepted): the introduction, results panel, and tutor must all say plainly to the learner that this is a deliberate departure from every earlier experiment's abstracted controls, since GPS is the one place in the curriculum so far where the real numbers are both checkable and large enough to matter.
2. **Reusing Experiment 3's exact `timeDilationFactorFor` formula directly** (with a real, tiny `v/c` input), rather than writing a separate weak-field approximation formula. Confirmed (Claude's recommendation, accepted) — see the updated "Physics Model" above.
3. **Requiring an explicit "Show results" confirmation step**, rather than showing fully live results as the learner drags the altitude slider. Confirmed (Claude's recommendation, accepted): the completion check mark and tutor step follow that one explicit action, consistent with every other experiment in the project.
4. **The altitude presets and slider range** (300 km–36,000 km, with ISS ~400 km / GPS ~20,200 km / Geostationary ~35,786 km presets, default GPS). Confirmed as drafted.
5. **Naming the ISS specifically** as the low-orbit example, rather than a generic "low Earth orbit" description. Confirmed (Claude's recommendation, accepted), following the real-world-grounding pattern set in Experiments 7 and 8.
6. **Title** — "Real Clocks in Orbit (GPS and the Balance of Two Effects)". Confirmed.

---

## Success Criteria

1. The physics model reuses Experiment 6's orbital-speed relation and Experiment 3's time-dilation reasoning without re-deriving either from scratch, adding only the new real-unit gravitational-potential formula.
2. The learner predicts before the altitude control and results are shown.
3. The results correctly show the crossover altitude and correctly identify, at GPS altitude, a net positive (fast-running) effect matching the real, published ≈ +38 microseconds/day figure within a small tolerance.
4. The learner can, after the tutor conversation, state that a satellite clock is affected by two competing relativistic effects, that altitude decides which one wins, and that GPS satellites really do have to correct for this.
5. The introduction, results panel, and tutor state plainly that this experiment (unlike every one before it in this project) uses real Earth numbers, not an abstracted or exaggerated stand-in — and state the specific simplifying assumptions still in play (circular orbit, non-rotating Earth, first-order approximation, and the smaller GPS corrections left out).
6. Real-world grounding is limited to named, verifiable facts (the ≈ 38 microseconds/day GPS correction, the ISS's real altitude) — never invented numbers presented as real, and never claiming this experiment reproduces every correction a real GPS system applies.
7. The introduction points the learner to the "Closing Synthesis" section while they are still on this page (before the tutor conversation), and that section appears after the tutor's explanation, naming special and general relativity's postulates/core ideas and tying each one back to the specific experiment that already demonstrated it, introducing no physics beyond what those experiments already established.

---

## Implementation Notes

Implemented per this specification: physics model and tests (`src/physics/gpsTimeDilationExperiment.ts`, `src/physics/gpsTimeDilationExperiment.test.ts`), interface, prediction, results panel, tutor, and the closing synthesis (`src/components/GpsTimeDilationExperiment.tsx`, `src/components/GpsTimeDilationTutor.tsx`), wired into the guided journey (`src/App.tsx`), including an updated "What's next" summary for Experiment 8 pointing to this experiment.

Complete-flow tested in a browser across every step (all three predictions, the live altitude slider and its three presets including the ISS and GPS sign flip, "Show results," all three tutor reflection steps, and the closing synthesis). One gap was found and fixed during that test:

1. **The third prediction question ("faster/slower/same rate") crashed the page.** It reused the generic `MoreLessSameQuestion` component (whose selectable values are hardcoded to `'more'`/`'less'`/`'same'`) but stored the learner's answer as `'faster'`/`'slower'`/`'same'` and passed it back in as `selected`, so the component's internal lookup (`choices.find(...)`) failed to match and threw when rendering the "Your prediction: ..." line. Fixed by storing the third prediction as a `MoreLessSameChoice` (`'more'`/`'less'`/`'same'`) throughout, like the first, and converting only at the point of display (a small `fasterSlowerSameLabel` helper), removing the mismatched-value bridging code entirely.

The live GPS-altitude readout was cross-checked against the physics tests during the browser session and matched exactly (orbital speed 3.873 km/s, speed effect −7.2 µs/day, gravity effect +45.7 µs/day, net +38.5 µs/day), and the ISS preset correctly showed a negative net effect (−24.7 µs/day).

The owner's line-by-line wording approval (§28.1) is complete (2026-09-28): the "Closing Synthesis" section (and its introduction pointer) was approved first, and the rest of the introduction, prediction prompts, results panel, and tutor wording was approved in a second pass — both approved as written, with no changes requested.

After that approval, the owner found and reported two further problems while running the experiment themselves, both fixed:

2. **The orbit diagram's satellite point ran off the top edge of its view box at high altitudes**, most visibly at the Geostationary preset (~35,786 km) — the diagram appeared to have no satellite at all, because `ORBIT_VIEW_SCALE` was sized against an arbitrary pixel budget (130px) rather than the view box's actual available radius (`VIEW_CENTER − EARTH_VIEW_RADIUS`, 110px), so the satellite point could land outside the visible 300×300 area. Fixed by deriving `ORBIT_VIEW_SCALE` from the view box's real available radius, minus the satellite dot's own size, so the point at `MAX_ALTITUDE_KM` always stays fully inside the box.
3. **After answering the predictions and clicking "Show results" once, the predictions (correctly) became locked, but nothing indicated that the altitude slider, presets, and "Show results" itself remained fully usable for further exploration** — read by the owner as the whole experiment having frozen. Fixed by adding a short line, shown once the predictions are locked, stating plainly that predictions are locked but altitude exploration continues: "Your predictions are locked in above. You can still try as many different altitudes as you like below — move the slider or a preset, then click 'Show results' again."

Both fixes re-verified in a browser (Geostationary now shows its satellite point inside the diagram; the new hint line appears immediately once predictions lock, and re-running "Show results" at a new altitude correctly updates the results panel). The added hint line's wording was reviewed separately and approved as written by the owner (§28.1, 2026-09-28).

After that, the owner asked to also be able to change their predictions before a further altitude exploration, not just re-explore altitude with the original predictions. Added a "Change predictions" control next to the hint line; clicking it clears the three submitted predictions (re-enabling the three prediction controls, with the learner's prior choices still shown selected) and clears the results/tutor, which are gated on the submitted predictions, without resetting the chosen altitude. Re-verified in a browser: the prediction buttons re-enable and remain editable, changing one updates it correctly, the previous results/tutor disappear, and "Show results" can be used again to produce fresh results and a fresh tutor conversation against the edited predictions.

The owner then reported that the first version of this control (an inline underlined text link within the hint paragraph) was too easy to miss. Restyled as a standalone button on its own line below the hint text, with the hint text split into its own line ending "Or, change your predictions and start over:" immediately above it. The owner then asked for it to stand out further, since a plain white `toggle-button` still blended into the page; restyled using the app's existing `secondary-button` style (purple outline and purple text). The owner reported this still read as a white button, since `secondary-button`'s background is the page's plain white surface color — only its border and text are purple. Fixed by giving the button a light purple fill (`rgba(124, 58, 237, 0.12)`, the same tint `clock-readout` elsewhere in the app uses) on top of the existing purple border and text, so the button itself is visibly colored, not just outlined. The owner then asked for the fill a little darker; increased to `rgba(124, 58, 237, 0.22)`. Re-verified in a browser (zoomed screenshot) after each change. This wording is approved by the owner as written (§28.1, 2026-09-28).
