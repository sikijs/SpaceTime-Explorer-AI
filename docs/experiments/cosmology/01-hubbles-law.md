# Cosmology — Experiment 1: Hubble's Law (The Farther, The Faster)

**Status: approved (2026-10-05), per `CLAUDE.md` §23 Stages 1–4, following the closure of the "Gravitational Waves" chapter. All five "Decisions Needing Human Review" items were confirmed by the owner in conversation; see "Decisions Confirmed." Not yet implemented.**

This is the first experiment of a new "Cosmology" chapter/group, opened after the owner closed the "Gravitational Waves" chapter at Experiment 7 (`CLAUDE.md` §27).

---

## Overview

Gravitational Waves Experiment 5 showed that a *moving* source's light or waves arrive stretched to a lower frequency — redshifted — and Experiment 7 showed that a wave's weakened amplitude can reveal its *distance*. Both experiments explicitly flagged, as something they deliberately did not model, a bigger idea sitting behind them: distant galaxies are *all* receding, and the farther away one is, the faster it recedes. That empirical pattern is **Hubble's Law**, discovered by Edwin Hubble in 1929, and it is the founding observation of modern cosmology — the study of the universe's overall structure and history.

This experiment reuses the "Mpc" (megaparsec) distance unit already defined in Gravitational Waves Experiment 7, and finally introduces the mechanism those two experiments deliberately held back: **cosmological redshift**, caused by space itself expanding while light travels, not by a galaxy moving through space the way Experiment 5's gravitational-wave source did. This is a genuinely different idea from the velocity-based Doppler effect already built, not a reuse of it — see "Physics Model" for why.

---

## Learning Objective

After this experiment, the learner should understand:

1. Essentially every distant galaxy's light is redshifted, and the farther away a galaxy is, the more redshifted its light is, and the faster it is said to be "receding." This is Hubble's Law: recession speed is directly proportional to distance (`v = H0 × d`).
2. The cause is **not** a galaxy moving through space the way a car or a gravitational-wave source moves (Gravitational Waves Experiment 5). It is space itself expanding while the light is in transit, stretching the light's wavelength along with it. This is a genuinely different mechanism from velocity-based Doppler redshift, even though the two produce similar-looking numbers for nearby galaxies.
3. The constant of proportionality, the **Hubble constant** (`H0`), was already named by Gravitational Waves Experiment 7 as something a standard siren can help measure. This experiment shows what that constant actually describes: how fast the redshift-implied "recession speed" grows with distance.
4. This experiment uses the simplest real relationship between distance and redshift, valid only for relatively nearby galaxies (where the universe hasn't expanded by much since the light was emitted). It explicitly does not model how that relationship changes at very large distances, or the universe's expansion history — later topics, not developed here.

---

## Physical Situation

A small number of galaxies at different distances from an observer (Earth), each already known (from prior real measurement, not derived here) to be part of the general cosmic recession. The learner chooses a galaxy — by distance — and the experiment computes the redshift Hubble's Law implies for it, using a new, self-contained, low-redshift relationship (see "Physics Model") that is explicitly framed as caused by the expansion of space, not by motion through it.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **The Hubble constant is treated as a single fixed real number** (a round, commonly cited illustrative value, e.g. ≈70 km/s per megaparsec), even though its precisely measured value is still debated among astronomers (the real "Hubble tension," between roughly 67 and 73 km/s/Mpc depending on measurement method) — the real published range should be stated as a caveat, not hidden.
- **This experiment deliberately does not reuse Gravitational Waves Experiment 5's velocity-based Doppler formula.** That formula models a source physically moving through space — the right model for Experiment 5's gravitational-wave source, but the wrong model for cosmological recession, where space itself is expanding and carrying galaxies apart. Using the motion-based formula here, even with a caveat, would teach a mechanism that is not actually happening. Instead, this experiment uses the real, low-redshift relationship astronomers actually use for relatively nearby galaxies: `z ≈ H0 × d / c`, where `z` is the fractional stretching of the light's wavelength.
- **This low-redshift relationship is itself an approximation**, valid only while the universe hasn't expanded by much since the light was emitted (small `z`). At very large distances, the real relationship between distance and redshift curves away from this simple proportionality, depending on the universe's full expansion history — not modeled here.
- **Only galaxies whose light is redshifted (receding) are shown** — no blueshifted (approaching) galaxies. (A small number of genuinely nearby galaxies, such as Andromeda, are in fact approaching due to local gravity overcoming the general expansion; this experiment does not model that exception.)
- **The galaxies themselves are not physically simulated** — no orbits, structure, or individual physics; each is simply a labeled distance and the redshift Hubble's Law implies for it.

### Not introduced

The full general-relativistic treatment of redshift at large distances (where the simple `z ≈ H0 × d / c` relationship breaks down), the Big Bang or "running expansion backward in time," the scale factor of the universe, dark energy, the cosmic microwave background, and any resolution of the real Hubble-tension debate — all explicitly out of scope, consistent with keeping this experiment to a single new idea (`CLAUDE.md` §16). The Big Bang implication is a natural next step and may be proposed as a later experiment, but is not part of this one.

---

## Physics Model

This experiment deliberately does **not** reuse Gravitational Waves Experiment 5's `dopplerFactorFor`. That function models a source kinematically moving through space — correct for Experiment 5's gravitational-wave source, but the wrong mechanism for cosmological recession, where the redshift comes from space itself expanding while light is in transit. Reusing it, even with a caveat, would teach the misconception that cosmic recession is just very fast motion through a fixed background of space — a conflation that working cosmologists are explicit about avoiding, not a harmless simplification like truncating a more precise formula for the *same* effect.

Instead, this experiment introduces one new, small, self-contained formula: the real low-redshift relationship between distance and redshift, `z ≈ H0 × d / c`, where `z` is the fractional amount the light's wavelength has stretched by the time it arrives. This is simpler to compute than the reused Doppler path would have been, and it is framed correctly from the first time the learner sees it.

```typescript
// src/physics/hubblesLawExperiment.ts

// Real-unit constants, in the same style as gpsTimeDilationExperiment.ts's real-Earth-unit
// constants — this experiment uses real units throughout, not an abstracted control, following
// that same precedent (Gravity and Curved Spacetime Experiment 9).
export const REAL_SPEED_OF_LIGHT_KM_PER_S = 299_792.458 // km/s
export const HUBBLE_CONSTANT_KM_PER_S_PER_MPC = 70 // an illustrative round value; see assumptions
export const HUBBLE_TENSION_RANGE_KM_PER_S_PER_MPC: [number, number] = [67, 73] // real published range

export interface GalaxyPreset {
  label: string
  distanceMpc: number
}

export const GALAXY_PRESETS: GalaxyPreset[] // e.g. Virgo Cluster (~16.5 Mpc), Coma Cluster (~100 Mpc)

// Hubble's Law, expressed as recession speed (the traditional way it's usually stated) —
// used for the learner-facing "how fast is it receding" figure, not for the redshift itself.
export function recessionSpeedKmPerS(distanceMpc: number): number {
  return HUBBLE_CONSTANT_KM_PER_S_PER_MPC * distanceMpc
}

// The one genuinely new physical idea: the real, low-redshift relationship between distance and
// cosmological redshift, z ≈ H0 * d / c — framed as space expanding while light travels, not as
// motion through space. Valid only while z is small (nearby galaxies); see "Simplifying
// assumptions."
export function cosmologicalRedshift(distanceMpc: number): number {
  return (HUBBLE_CONSTANT_KM_PER_S_PER_MPC * distanceMpc) / REAL_SPEED_OF_LIGHT_KM_PER_S
}

// The resulting stretching factor applied to the light's wavelength (1 + z) — the number the
// diagram's color shift and the Results panel both read directly, so the displayed redshift and
// the underlying physics always agree.
export function wavelengthStretchFactor(distanceMpc: number): number {
  return 1 + cosmologicalRedshift(distanceMpc)
}

export interface HubblesLawResult {
  distanceMpc: number
  recessionSpeedKmPerS: number
  redshift: number // z, from cosmologicalRedshift
  wavelengthStretchFactor: number // 1 + z
}

export function runHubblesLawExperiment(distanceMpc: number): HubblesLawResult
```

The maximum distance this experiment allows the learner to choose (see "Learner Controls") must keep `z` small enough that the low-redshift approximation stated in "Simplifying assumptions" remains reasonable to present as accurate (see "Decisions Confirmed" item 4 for the chosen ceiling).

Structured independently of the UI, per `CLAUDE.md` §9 — pure functions of distance, testable with no browser.

---

## Learner Controls

- **Galaxy**, a choice of distance:
  1. A small number of real, named presets at increasing distance (e.g. the Virgo Cluster, the Coma Cluster, and one schematic "very distant" preset), following the same "real presets + schematic + custom" pattern Gravitational Waves Experiment 7 established.
  2. A free custom distance slider, range and maximum per "Decisions Confirmed" item 4 (bounded so `z` stays small, keeping the low-redshift approximation honest).
- **Run**, showing the chosen galaxy's light leaving it at its true color and arriving at an "Earth" detector visibly stretched toward red, by the `wavelengthStretchFactor` computed for its distance — reusing this chapter's established visual language (a labeled source, a labeled detector, a visible color/wavelength change), but showing the stretch happening gradually across the light's journey (not already present at emission), since the cause here is space expanding during transit, not something happening at the source.

---

## Prediction Activity

Before the control and results are shown, the learner is asked two questions in sequence:

1. "If Galaxy A is twice as far away as Galaxy B, how do you think Galaxy A's recession speed compares to Galaxy B's?" (Twice as fast / The same / Half as fast)
2. "Which galaxy's light do you think will look more shifted toward red — the nearer one or the farther one?" (The nearer one / The farther one / No difference)

Choices are not scored. The control is disabled until both predictions are entered, consistent with the rest of the project.

---

## Experiment Behavior

### Display

- A labeled diagram showing the chosen galaxy and "Earth" (the detector), with the light's color gradually shifting toward red as it travels between them, reaching the `wavelengthStretchFactor` computed for that distance by the time it arrives — reusing this chapter's established pattern of a labeled source, a labeled detector, and a visible distinguishing cue between different inputs (`CLAUDE.md` §14), while keeping the visual honest about *when* the stretching happens (during the journey, not at emission — see "Learner Controls").
- A live readout of distance, recession speed (in km/s), redshift (`z`), and the wavelength stretch factor.

### Results

States the chosen distance, the computed recession speed, and the resulting redshift (`z` and the wavelength stretch factor), then compares both of the learner's predictions to what actually happened — the exact proportionality of speed to distance, and the farther galaxy's light being more redshifted. States the Hubble constant value used and, prominently (matching Gravitational Waves Experiment 7's precedent for a real-value uncertainty caveat), the real Hubble-tension range it does not resolve.

### Introductory text

To be drafted during implementation, covering: the question (does a galaxy's distance affect how fast it's moving away, and can we tell from its light alone?), what happens, the learner's job (both predictions), what to look for, the new terms ("Hubble's Law," "Hubble constant," "cosmology") defined in plain language, and the assumptions above — subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "What did you notice about the color of the light compared to the galaxy's distance?"
  2. Prediction comparison: the learner's two predicted answers beside what actually happened.
  3. Conceptual question: "If every direction we look, distant galaxies' light is stretched toward red, and the farther ones are stretched more, what might that suggest about the universe as a whole?" — intended to let the learner start reasoning toward expansion/the Big Bang without the tutor stating it outright.
  4. Explanation: (1) Hubble's Law — redshift (and the recession speed it implies) is directly proportional to distance; (2) the cause is space itself expanding while the light travels, stretching its wavelength along with it — not a galaxy moving through space the way Gravitational Waves Experiment 5's source did; (3) this is why the Hubble constant (first named in Gravitational Waves Experiment 7) is worth measuring: it's the rate space is expanding at; (4) the real Hubble constant's precise value is still actively debated by astronomers (the "Hubble tension"); (5) this experiment's formula is only accurate for relatively nearby galaxies — at very large distances the real relationship is more complicated, a later topic.

---

## Required Physics Tests

1. `recessionSpeedKmPerS` is exactly proportional to distance (doubling distance exactly doubles recession speed).
2. `cosmologicalRedshift` is exactly proportional to distance (doubling distance exactly doubles `z`), and matches `HUBBLE_CONSTANT_KM_PER_S_PER_MPC * distanceMpc / REAL_SPEED_OF_LIGHT_KM_PER_S` for at least two representative distances (direct formula sanity-check).
3. `wavelengthStretchFactor` equals exactly `1 + cosmologicalRedshift(distanceMpc)` for the same representative distances (confirms the two functions agree, since the UI reads both).
4. For two distances, the farther one produces a strictly larger `cosmologicalRedshift`/`wavelengthStretchFactor` (more redshifted) than the nearer one — confirms the premise the second prediction question depends on.
5. `cosmologicalRedshift`/`wavelengthStretchFactor` do not import or call `dopplerFactorFor` or any other function from `gravitationalWaveRedshiftExperiment.ts` — a regression check confirming this experiment does not reuse the velocity-based Doppler formula (`CLAUDE.md` §8).
6. The maximum distance offered by any learner control (preset or custom-slider ceiling) keeps `z` within the range stated as the low-redshift approximation's reasonable validity in "Simplifying assumptions."

---

## Decisions Confirmed

Confirmed by the owner in conversation on 2026-10-05:

1. **Title accepted as proposed:** "Hubble's Law: The Farther, The Faster," in a new "Cosmology" chapter/group (added to the sidebar's `groupOrder`, after "Gravitational Waves").
2. **Revised after owner pushback on the first proposal.** The initial draft proposed reusing Gravitational Waves Experiment 5's velocity-based `dopplerFactorFor`, caveated as a simplification. On reconsideration, that was the *easy* choice, not the *best* one: that formula models a source kinematically moving through space, which is not what causes cosmological redshift (space itself expanding while light travels) — a difference in mechanism, not just precision, and one both Experiment 5 and Experiment 7 already told the learner would be addressed separately. Reusing it, even caveated, would teach the actual misconception professional cosmologists are explicit about avoiding. **Decision: do not reuse `dopplerFactorFor`.** Instead, introduce one new, small, self-contained formula — the real low-redshift relationship `z ≈ H0 × d / c` — framed from the start as caused by expansion, not motion. This is also simpler to implement than converting through the relativistic Doppler machinery. See the revised "Physics Model."
3. **The Hubble constant's illustrative value (70 km/s/Mpc) and the real Hubble-tension range (67–73 km/s/Mpc) are accepted as proposed.**
4. **Distance presets and range are accepted as proposed:** Virgo Cluster (≈16.5 Mpc), Coma Cluster (≈100 Mpc), a schematic "very distant" preset, and a custom slider — now capped by keeping `z` small (per the revised item 2), rather than by keeping speed below `c`. Exact slider ceiling left to implementation judgment, consistent with this project's convention for similar presentational constants, but must stay low enough (`z` on the order of a few percent at most) that presenting the low-redshift approximation as accurate remains honest.
5. **A forward-looking hint toward a Big Bang experiment is approved**, on Claude's recommendation (see "Relationship to Later Experiments" below) — placed only in the chapter summary's "What's next" line (`CLAUDE.md`'s guided-journey pattern), shown only after the tutor's explanation, never inside this experiment's own introduction or tutor, per `CLAUDE.md` §12.

---

## Relationship to Later Experiments

Running Hubble's Law backward in time — if everything is receding from everything else today, then everything must have been closer together in the past, converging toward a single moment — is the single most direct, well-motivated next step this experiment points to. It requires no new physics beyond what this experiment already establishes (the same `v = H0 × d` relationship, just read in the other direction), and it is the question most learners will already be forming after seeing this experiment's result. Claude recommends it as the next proposed experiment once this one is complete, to be proposed formally per `CLAUDE.md` §23 Stage 1–2 at that time (not pre-approved here). No other direction was judged a comparably strong fit for "the next logical step after Hubble's Law."

---

## Success Criteria

1. No existing experiment's physics is modified or recomputed; this experiment's only new formulas are Hubble's Law (`recessionSpeedKmPerS`) and the low-redshift relationship (`cosmologicalRedshift`/`wavelengthStretchFactor`). Gravitational Waves Experiment 5's velocity-based `dopplerFactorFor` is **not** used anywhere in this experiment (see "Decisions Confirmed" item 2).
2. The learner makes both predictions before the control and results are shown.
3. Choosing a farther vs. a nearer galaxy produces a visibly, clearly different redshift (color shift) in the diagram, not just in the numbers.
4. The Results panel correctly compares both of the learner's predictions to the exact proportionality Hubble's Law guarantees.
5. The real Hubble-tension caveat is stated prominently, not as an inline aside, matching Gravitational Waves Experiment 7's precedent.
6. The experiment states plainly, in the introduction, Results panel, and tutor, that the redshift is caused by space itself expanding during the light's journey — not by a galaxy moving through space the way Gravitational Waves Experiment 5's source did — and that the formula used is only valid for relatively nearby galaxies (small `z`).
7. The learner can, after the tutor conversation, state in their own words that redshift (and the recession speed it implies) is proportional to distance, and that the cause is space expanding, not galaxies moving through it.
8. "Redshift" is reused consistently from its existing definition (Gravity and Curved Spacetime, Experiment 2) rather than redefined; "Doppler effect" (Gravitational Waves Experiment 5) is explicitly named as a *different* mechanism, not conflated with this experiment's cosmological redshift; "Hubble's Law," "Hubble constant," and "cosmology" are each defined in plain language at first use, consistent with `CLAUDE.md` §15.

---

## Implementation Notes

Not yet implemented. Per `CLAUDE.md` §23 Stage 5 and §6, implementation proceeds one step at a time, starting with the physics model and its tests.
