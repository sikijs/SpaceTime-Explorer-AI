# Experiment 6 (Spacetime Geometry): Making New Particles, How Much Energy Does It Take? (with Decay)

**Status: APPROVED by the owner on 2026-10-15 ("approved"), with all seventeen "Decisions Needing Human Review" taken on their defaults. The physics model and its tests are built (Steps 2 and 3 of `CLAUDE.md` §21); the interface is not.** Proposed by Claude per `CLAUDE.md` §23 Stages 1 to 3 on 2026-10-15, at the owner's request ("develop option E into a proposal with decay"). All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1). Every number marked "computed" was computed by script on 2026-10-15 and must be re-checked by the physics tests before approval of the build.

**Group:** "Spacetime Geometry: What Is Real, What Is Seen". This experiment is **not on the first specification's roadmap** (aberration, the Doppler effect, a fast object looking rotated). It is proposed because it is the practical payoff of Experiment 5: the system's mass, the invariant that Experiment 5 introduced, turns out to decide what can be made in a collision. It belongs to the "what is real" half of the group's title: the system's mass is what every observer agrees on. The roadmap items remain available as later proposals.

---

## Overview

Experiment 5 showed that the mass of a whole system, worked out from its total energy and total momentum, is the same for every observer, and that a reaction can happen only if the system's mass is at least the total mass of what comes out (the threshold, Part 3). This experiment puts that to work on a question that decides how particle accelerators are built:

> **If you supply a fixed amount of energy of motion, how much of it can be used to make a new particle?**

The answer is a surprise. It depends on **how** you collide the particles:

- **A beam hits a stationary target.** The pieces after the collision must keep moving, because the total momentum is not zero. That energy of motion is **locked in the motion of the system as a whole**, and cannot become mass. Only the rest is usable.
- **Two beams meet head-on.** The total momentum is zero, so the system ends at rest, and **all** the energy of motion is usable.

Both are the same collision seen by different observers. The observer who rides along with the stationary-target system (the **system's own observer**, like the particle's own observer in Experiment 5) sees two particles approaching each other with equal speeds, a head-on collision with *less* energy of motion than the lab supplied. Both observers agree on the system's mass. That is the whole idea of the experiment: the usable energy is the system's mass minus the masses of the parts, and the system's mass is the invariant.

The experiment has **two parts** (the owner asked for decay to be included):

- **Part 1: Making a new particle.** A stationary target versus two head-on beams, for the same energy of motion. Usable energy, locked-in energy, and the threshold for making a new particle of a chosen mass.
- **Part 2: Decay.** A particle at rest splits into two lighter pieces. It is the reverse of Part 1: the parent's mass is the system's mass, the difference between it and the pieces' masses becomes their energy of motion, and a particle cannot decay into pieces that are heavier in total.

Honest limits, stated to the learner and not hidden: **the experiment shows only what conservation of energy and momentum allows.** It does not say how often a possible reaction happens (in reality, reactions and decays are matters of probability and time), it does not show how the leftover energy is shared among the pieces after a reaction (conservation alone does not fix that), and real reactions also obey other rules (such as conservation of electric charge) that are not modeled. The formulas are used, not derived (as in Experiment 5).

---

## Learning Objective

After this experiment, the learner should understand:

1. To make a new particle, the **system's mass** (worked out from the total energy and total momentum) must be at least the total rest mass of everything that comes out. This is the threshold of Experiment 5 (Part 3), now applied to a collision of two moving particles.
2. For the same energy of motion supplied, **two beams meeting head-on give a larger system's mass than a beam hitting a stationary target**, for every amount of energy.
3. In the stationary-target case, part of the energy of motion is **locked in the motion of the system as a whole** (the total energy minus the system's mass), because the total momentum is not zero. That part cannot be turned into the mass of new particles. In the head-on case, none is locked.
4. The two cases are the **same kind of collision seen by different observers**: the system's own observer sees the stationary-target collision as a head-on one. Both agree on the system's mass.
5. The least energy of motion that makes a new particle of mass `X` (from two colliding particles of mass 1) is `X` for head-on beams and `2X + X²/2` for a beam on a stationary target. The second grows much faster as `X` grows.
6. In **decay**, a particle at rest turns into lighter pieces. The pieces' rest masses add up to **less** than the parent's, and the difference becomes their energy of motion. The pieces fly apart with equal energies, because the total momentum stays zero.
7. A particle **cannot** decay into pieces whose masses add up to **more** than its own (a threshold again). Decay is the reverse of making a particle at the threshold.
8. For a moving parent, observers disagree on the pieces' energies and momenta, but agree on the system's mass, which is the parent's mass.
9. (A short remark.) That a reaction or decay is **allowed** does not mean it **will** happen. The model says only what is allowed.

---

## Physical Situation

### Reused

- Flat spacetime, no gravity, constant velocities, one dimension of space.
- Units: `c = 1`. Energy in **rest energies**, momentum as `pc` (as in Experiment 5).
- From `src/physics/energyMomentum.ts` (Experiment 5): `particleReading`, `leftMovingParticleReading`, `readingFor` (the same transformation as for time and position), `systemMassOf`, `totalsOf`, and `speedFromEnergy`. The new module imports them, and does not recompute them.
- The idea of the **system's own observer** (Experiment 5, Part 1's "particle's own observer", extended to a system), the **threshold** (Part 3), and the **system's mass** (Part 2).
- The dark-canvas diagram style, the introduction/prediction/run/results/tutor structure, the "Words and formulas" panel, and the skip and back links between parts (owner's requests for Experiment 5, taken as the default here, Decision 14).

### What is new

- **Part 1:** two identical **colliding particles** (mass 1) that can make a **new particle** of mass `X` (a chosen multiple of the colliding particles' mass; a generic neutral particle, Decision 5). Two **setups** for the same energy of motion `K`: a **stationary target** (one particle at rest, one beam particle moving) and **head-on beams** (two particles moving toward each other with equal energies). The **usable energy** and the **locked-in energy**.
- **Part 2:** a **parent** particle at rest that **decays** into two equal **pieces** (or into two light pulses).

### Simplifying assumptions (all stated to the learner in plain language)

- One line: everything moves along the same line.
- Part 1: the two colliding particles are identical and survive the reaction unchanged; the new particle has no electric charge. Only energy and momentum are tracked. A reaction that is allowed is shown as allowed; how the leftover energy is shared among the pieces is not shown.
- Part 2: the parent decays into exactly two equal pieces, or two equal pulses of light, at rest in the lab. Only energy and momentum are tracked.
- Whether and when a possible reaction or decay happens is not modeled.
- Nothing else enters or leaves. Speeds are steady before and after. No forces or accelerations are modeled.

### Not introduced

Probability and rates of reactions (cross-sections), lifetimes, more than two pieces after a decay, unequal pieces (decision 9), how energy is shared among three or more pieces, conservation laws other than energy and momentum (electric charge is mentioned only as an unmodeled rule), baryon number and the production of antiprotons, neutrinos and the weak force, forces and acceleration, the structure of protons, and the design of real accelerators beyond the one comparison. Real-world numbers (the neutral pion's mass, the pion-production threshold, the LHC) appear only in the tutors, as stated facts with sources (Decision 11).

---

## Physics Model

Standard textbook special relativity, as in Experiment 5. Units: `c = 1`; energy in rest energies of one colliding particle (Part 1) or of the parent (Part 2).

### Part 1: two setups with the same energy of motion `K`

`K` is the **total energy of motion (kinetic energy) supplied in the lab**, in rest energies of one colliding particle. For one moving particle, `E = 1 + K` and `pc = √(E² − 1)`.

**Stationary target.** The beam particle has `E_b = 1 + K` and `p_b c = √(K² + 2K)`. The target is at rest (`E = 1`, `pc = 0`).
- Total energy `E_tot = 2 + K`. Total momentum `P c = √(K² + 2K)`.
- **System's mass** `M_F = √(E_tot² − (Pc)²) = √(4 + 2K)`. (Worked: `K = 3` gives `E_tot = 5`, `Pc = √15`, `M = √(25 − 15) = √10 = 3.162`.)
- The system's own observer moves at `β = Pc ÷ E_tot = √(K ÷ (K + 2))` (0.577c at `K = 1`, 0.913c at `K = 10`).

**Head-on beams.** Each particle has `E = 1 + K/2` and `pc = ±√(E² − 1)`.
- `E_tot = 2 + K`. `Pc = 0`. **System's mass** `M_C = 2 + K`.

**Usable and locked-in energy.** In the system's own observer's frame the total momentum is zero, the total energy is `M`, and the rest energies add up to 2, so the energy of motion there is `M − 2`.
- **Usable energy** `U = M − 2`. **Locked-in energy** `L = K − U = E_tot − M`.
- Stationary target: `U_F = √(4 + 2K) − 2`, `L_F = K − U_F`. Head-on: `U_C = K`, `L_C = 0`.
- For every `K > 0`: `M_C > M_F`, because `(2 + K)² = 4 + 4K + K² > 4 + 2K`.

**Making a new particle of mass `X`.** The reaction is particle + particle → particle + particle + `X`. Energy and momentum are conserved, so the system's mass is the same after as before. After the reaction the system's mass is at least the total rest mass `2 + X` (with equality when all the pieces move together, at rest in the system's own observer's frame). So the reaction is **allowed if and only if `M ≥ 2 + X`** (a rule used, not derived, Decision 12).
- Head-on beams: allowed if `K ≥ X`. Threshold `K_C = X`.
- Stationary target: allowed if `K ≥ 2X + X²/2`. Threshold `K_F = 2X + X²/2`. (From `√(4 + 2K) ≥ 2 + X`.)
- At the threshold, all the pieces end at rest in the system's own observer's frame. **Above** the threshold, the leftover `M − (2 + X)` is energy of motion of the pieces; how it is shared is not determined by conservation alone, so it is **not computed or drawn** (Decision 6).

### Part 2: decay at rest

Units: the parent's rest energy is 1. The parent is at rest in the lab (the frame where the total momentum is zero). It decays into two **equal** pieces, each of rest mass `r` (a fraction of the parent's mass; `r = 0` means two light pulses).
- Allowed if `2r ≤ 1` (the pieces' masses add up to at most the parent's). If `2r > 1` **no decay can happen**.
- Conservation: total energy 1, total momentum 0. The pieces are equal and move in opposite directions, so each has `E = ½` and `pc = ±√(¼ − r²)`. Speed `v = pc ÷ E = √(1 − 4r²)`.
- **Mass given up** `Δ = 1 − 2r` (the parent's mass minus the sum of the pieces' rest masses). It becomes energy of motion: each piece has `E − r = ½ − r` of kinetic energy (together, `Δ`).
- For `r = 0` (light), `v = 1` and `pc = ½`. For `r = ½` (exactly the threshold), `pc = 0`: the pieces are at rest.
- **A passing observer** at `u` finds each piece's reading by `readingFor(u, …)` (the same transformation as in Experiment 5). The parent, at rest in the lab, is seen moving left at `u` with `E′ = γ` and `p′c = −γu` (where `γ = 1 ÷ √(1 − u²)`), and the **system's mass of the two pieces is 1 for every observer**, the parent's mass.

### Numbers (computed 2026-10-15; the tests recompute them)

**Part 1, per `K`** (rest energies of one colliding particle):

| `K` | Stationary target: `M` | `β` of system's own observer | `U` | `L` | share locked | Head-on: `M` (`U = K`) |
|---|---|---|---|---|---|---|
| 1 | 2.4495 | 0.5774 | 0.4495 | 0.5505 | 55.1% | 3.000 |
| 2 | 2.8284 | 0.7071 | 0.8284 | 1.1716 | 58.6% | 4.000 |
| 5 | 3.7417 | 0.8452 | 1.7417 | 3.2583 | 65.2% | 7.000 |
| 10 | 4.8990 | 0.9129 | 2.8990 | 7.1010 | 71.0% | 12.000 |
| 100 | 14.2829 | 0.9901 | 12.2829 | 87.7171 | 87.7% | 102.000 |

**Part 1, thresholds** (least `K` that makes a new particle of mass `X`):

| `X` | Head-on: `K ≥ X` | Stationary target: `K ≥ 2X + X²/2` | ratio |
|---|---|---|---|
| 0.5 | 0.5 | 1.125 | 2.25 |
| 1 | 1 | 2.5 | 2.5 |
| 2 | 2 | 6 | 3 |
| 4 | 4 | 16 | 4 |

**Largest `X` that can be made, per `K`:** head-on `X = K`; stationary target `X = −2 + √(4 + 2K)`: 0.449 (`K = 1`), 0.828 (2), 1.742 (5), 2.899 (10), 12.283 (100).

**Part 2, per `r`** (parent's rest energy 1; two equal pieces):

| `r` | each `E` | each `pc` | speed | sum of rest masses | mass given up |
|---|---|---|---|---|---|
| 0 (light) | 0.5 | 0.5000 | 1c | 0 | 1.0 |
| 0.1 | 0.5 | 0.4899 | 0.980c | 0.2 | 0.8 |
| 0.25 | 0.5 | 0.4330 | 0.866c | 0.5 | 0.5 |
| 0.4 | 0.5 | 0.3000 | 0.600c | 0.8 | 0.2 |
| 0.5 | 0.5 | 0 | at rest | 1.0 | 0 |
| 0.6 | no decay can happen (the pieces' masses would add up to 1.2, more than 1) | | | | |

For `r = 0.25` and a passing observer at `u = +0.3c`: the piece moving right has `E′ = 0.3880`, `p′c = 0.2967`; the piece moving left has `E′ = 0.6603`, `p′c = −0.6112`; the total is `E′ = 1.0483`, `p′c = −0.3145`, and `√(1.0483² − 0.3145²) = 1.0000` (computed).

### New: a small independent physics module

`src/physics/makingNewParticles.ts` (new), importing from `energyMomentum.ts`:

```typescript
export type Setup = 'stationary-target' | 'head-on'
export interface SetupResult { /* the lab's pieces before; E_tot, Pc; systemMass; ownObserverSpeed;
  usable; lockedIn; allowed(X) via canMake; thresholdK(X) */ }
export function runSetup(setup: Setup, K: number): SetupResult
export function canMake(systemMass: number, X: number): boolean   // systemMass >= 2 + X
export function thresholdKineticEnergy(setup: Setup, X: number): number   // X, or 2X + X²/2
export function runDecay(r: number, passingSpeed: number): DecayResult
  // allowed, labPieces, passingPieces, parentMass, sumOfRestMasses, massGivenUp, systemMass for both observers
```

Out-of-range inputs throw `RangeError` (`K ≤ 0`, `X ≤ 0`, `r < 0`, `|passingSpeed| ≥ 1`, a non-finite value). A value of `r` above ½ is **not** out of range: `runDecay` returns `allowed: false` (the experiment shows "no decay can happen"), as `runReactionExperiment` does below the pair-creation threshold.

### Sign convention and limits

Momentum to the right is positive. Speeds are fractions of `c`. All the numbers come from the module, not from the interface (`CLAUDE.md` §9).

---

## Learner Controls

**Part 1**

1. **The energy of motion supplied, `K`:** presets 1, 2, 5, 10, 100 (rest energies of one colliding particle; Decision 8).
2. **The mass of the new particle, `X`:** presets 0.5, 1, 2, 4 (in masses of one colliding particle).
3. **Run:** gated on the prediction. Both setups are always shown together for the same `K` (Decision 3).

**Part 2** (revealed after Part 1's tutor explanation, with a skip link as in Experiment 5)

1. **The pieces' mass, `r`:** presets "pieces of light (no mass)" (0), 0.1, 0.25, 0.4, 0.5, 0.6 (each, as a fraction of the parent's mass).
2. **The passing observer's speed:** presets −0.6c, −0.3c, +0.3c, +0.6c.
3. **Run:** gated on the prediction.

Changing any setting, or the prediction, returns to the setup; changing the process-defining settings clears the prediction as in Experiment 5 Part 3 (Part 1: changing `K` or `X`; Part 2: changing `r`). The passing observer's speed does not clear it.

---

## Prediction Activity

**Part 1.** Draft wording:

> **The question.** You supply the same total energy of motion either way. In setup A, one beam particle hits a particle that is at rest. In setup B, two particles of the same kind meet head-on. Which setup leaves more energy usable for making new particles?
>
> (a) Setup A, the stationary target. (b) The same for both. (c) Setup B, the head-on beams.

Not scored. Run stays disabled until an answer is chosen. The learner is not told which is right. Answer (c) is right at every setting offered. (b) is the natural guess, "energy is energy"; (a) is the guess that a heavier, resting target "absorbs" more.

**Part 2.** Draft wording:

> **The question.** A particle at rest splits into two lighter pieces. Compare the total of the pieces' rest masses with the parent's mass. How do they compare?
>
> (a) The pieces' masses add up to less than the parent's. (b) The same. (c) More.

Not scored. Run stays disabled until an answer is chosen. The right answer depends on the setting, which is the point: **less** for `r < ½`, **the same** at `r = ½` (the pieces at rest), and **more** is exactly what **cannot happen** (`r = 0.6`: no decay). (b) is the natural guess, as in Experiment 5.

---

## Experiment Behavior

### Introduction: two stages, with every new term and formula explained where it is first needed (draft; the owner approves the wording, §28.1)

The rules are those of Experiment 5 (`CLAUDE.md` §15; Experiment 5's "Introduction" rules 1 to 5): every term defined in plain language before use, a concept before its formula, a worked example with real numbers and a note of what the formula does not mean, a daily-life example for each idea that is not obvious, nothing the learner is asked to predict revealed (§12), and a collapsed "Words and formulas" panel that lists every term and formula introduced so far (Experiment 5's entries, one line each, and this experiment's, added as each part appears).

**Stage A, at the top of the page (needed by Part 1).** Draft wording, in order:

- **The question.** In Experiment 5 we found that a system of pieces has a mass of its own, worked out from its total energy and total momentum, and that every observer agrees on it. Here we use that to answer a practical question. If you have a fixed amount of energy of motion to spend, how much of it can you use to make a new particle? And does it matter how you arrange the collision?
- **Reminders (a short paragraph, needed because the experiment uses them):** a particle's rest energy is 1, our unit; the system's mass is `M = √(E_total² − (P_total c)²)`; a reaction needs the system's mass to be at least the total rest mass of what comes out (the threshold). Each is also in the "Words and formulas" panel.
- **New words, each with an example:**
  - **Beam:** a stream of particles moving the same way. **Target:** what the beam hits. **Stationary target:** a target at rest in the lab. Example: a billiard ball (the beam) hits a ball at rest (the target).
  - **Collider:** a machine in which two beams are sent toward each other and meet head-on.
  - **Energy of motion supplied, `K`:** the total kinetic energy of all the moving particles in the lab, in rest energies of one colliding particle. Example: `K = 3` means the energy of motion is three times the rest energy of one particle.
  - **New particle:** a particle that was not there before the collision. Here we use a made-up neutral particle of mass `X`, measured in masses of one colliding particle. The colliding particles survive unchanged.
  - **The system's own observer:** an observer for whom the total momentum of the system is zero. They travel along with the system as a whole, as the particle's own observer travels along with a particle.
  - **Usable energy:** the part of the energy of motion that can become the mass of new particles. **Locked-in energy:** the part tied up in the motion of the whole system, which cannot.
- **A daily-life example (no relativity in it):** two identical cars meet head-on at equal speeds, and they stop, so all their energy of motion goes into crumpling the metal. A moving car hits an identical parked car, and the wreck keeps sliding along: some of the energy of motion is still motion afterward, so less is left to crumple. (The tutor revisits this.)
- **Formulas needed here, each in words with a worked example:**
  - **The system's mass again.** Example: `K = 3`, stationary target: the beam particle has energy 4 and momentum × c `√15 = 3.873`, the target has energy 1 and momentum 0, so `E_total = 5`, `P_total c = 3.873`, and `M = √(25 − 15) = √10 = 3.162`. The same `K = 3` shared between two head-on beams gives each particle an energy of 2.5, `E_total = 5` and `P_total c = 0`, so `M = 5`. (Both examples show the numbers for one setup each; which is better is the prediction, so the introduction does not compare them in words, §12.)
  - **Usable energy:** `U = M − 2`. In words: "the system's mass, minus the rest masses of the two colliding particles." Example: `M = 3.162` gives `U = 1.162`. *What it does not mean:* it is not the energy of motion in the lab.
  - **Locked-in energy:** `L = K − U`. In words: "what is left of the energy supplied."
  - **The threshold:** a new particle of mass `X` can be made only if `M ≥ 2 + X`. Example: `X = 1` needs `M ≥ 3`.
- **What happens.** Both setups are shown, for the same `K`: a beam particle hitting a stationary target, and two particles meeting head-on. Then the stationary-target collision is shown again as the system's own observer sees it.
- **Your job.** Choose the energy of motion `K` and the mass `X` of the new particle, predict which setup leaves more usable energy, and press Run. You are not graded. Run stays off until you choose a prediction.
- **What we assume.** One line; identical colliding particles; the new particle is neutral; only energy and momentum are tracked; whether a possible reaction happens is not modeled.

**Stage B, shown when Part 2 appears (needed by Part 2).** Draft wording:

- **A reminder if skipped:** "If you skipped Part 1": the system's mass and the threshold, with one worked example.
- **The question.** Making a new particle turned energy of motion into mass. Now we run it backward: can a particle turn into lighter pieces, and what happens to the mass that goes missing?
- **New words, each with an example:** **decay** (a particle turning into lighter pieces on its own, with nothing hitting it; the experiment shows what the pieces must be like, so no example is given that would reveal it, §12), **parent** (the particle before), **pieces** (what it turns into), **mass given up** (the parent's mass minus the sum of the pieces' rest masses).
- **Formulas needed here:** the pieces' energy and momentum. In words: "the parent is at rest, so the total momentum is zero and the two equal pieces move apart with equal energies, each half the parent's energy." Example, not among the choices: `r = 0.3` gives each piece `E = ½`, `pc = √(¼ − 0.09) = 0.4`, speed `0.4 ÷ 0.5 = 0.8c`.
- **What happens, your job and what we assume.** A parent at rest splits into two equal pieces (or two pulses of light), seen by the lab and then by a passing observer. You choose the pieces' mass and the observer's speed, predict how the masses compare, and run. A decay is shown only if it is allowed; when it will happen is not modeled.

### Display, Part 1

An animated diagram plus bars, following `CLAUDE.md` §14 "Animated Diagrams":

1. **Labeled components on the canvas:** the **stationary-target setup** (the beam particle, the target at rest, the dashed meeting line) and the **head-on setup** (two beam particles), each named, drawn side by side or one above the other on the same scale; an arrow on each moving particle (longer means faster); a **plain label for each setup's lab view**; and, for the stationary target, the **system's own observer's view** (the same collision with equal approach speeds).
2. **A visible contrast between the two quantities the learner compares.** After the collision, the stationary-target picture shows the **system as a whole still moving** (an arrow labeled "the whole system keeps moving at 0.91c"), and the head-on picture shows it **at rest**. A **stacked bar** for each setup splits the energy of motion supplied into a **usable part** and a **locked-in part** (labeled in words, and with different fills, not colour alone); the head-on bar has no locked-in part. A marker on each bar shows the energy needed to make the chosen `X`.
3. **Bars of the system's mass** for both setups, with a line at `2 + X` ("needed to make the new particle"), so that "can it be made?" is visible.
4. **A verdict for each setup**, in words ("a new particle of mass 2 can be made" or "cannot be made"), plus the thresholds from the table.
5. **A "How to read this diagram" caption,** matching the pattern of Experiment 5: each picture named, each part listed, a step-by-step walk-through of the animation, a worked moment with numbers that are not among the presets (`K = 3`), and a "what to look for" list.

### Run, Part 1

A playback of about 12 seconds (the length only sets how fast the result is shown, §11):

1. The two setups appear, with their numbers. The beam particles move toward the meeting line, in both setups at once.
2. They meet; the system's own observer's view of the stationary-target collision appears and shows equal approach speeds.
3. The bars fill: the system's mass for each setup, the usable and locked-in parts, and the line at `2 + X`. The verdicts appear. At the end everything stays on screen.

Playback speed does not change the result (§11).

### Display and run, Part 2

1. **The lab's view (the parent at rest):** a circle labeled with the parent's mass, which splits into two pieces moving apart (or two light pulses as arrows), each labeled with its energy, momentum × c and rest mass; light drawn as arrows with no circle, as in Experiment 5. If `r = 0.5` the pieces stay at rest; if `r = 0.6`, the parent stays and the picture says "no decay can happen: the pieces would weigh more than the parent".
2. **A ledger,** as in Experiment 5 Part 3: bars for the parent's mass and the sum of the pieces' rest masses (different), and bars for the system's mass of the pieces before and after (the same), with the mass given up written under them.
3. **The same moments as the passing observer measures them,** with the totals and the conservation panel in the results.
4. A caption in the same pattern, and a playback of about 12 seconds: the parent, the decay, the pieces, for the lab and then for the passing observer.

---

## Results Display

Shown only when the run ends. Values only, with plain labels (neutral; the explanation comes from the tutor, §12).

**Part 1:**
- the chosen `K` and `X`, and the learner's prediction as a record (not marked right or wrong);
- a table for each setup: the lab's total energy and total momentum × c; the system's mass `M`; the speed of the system's own observer; the usable energy `U`; the locked-in energy `L` and its share of `K`; and, for the chosen `X`, the least `K` that makes it and whether it can be made;
- the system's mass found by the lab and by the system's own observer (equal);
- the drawing.

**Part 2:**
- the chosen `r` and passing speed, and the prediction as a record;
- for `r ≤ ½`: the parent's mass; the sum of the pieces' rest masses; the mass given up; each piece's energy, momentum × c and speed;
- total energy and total momentum × c before and after, for each observer, with the difference (zero), and the system's mass for each observer (equal);
- for `r > ½`: the words "no decay can happen", the parent's mass and the pieces' total (`2r`);
- the drawing.

---

## Expected Observations

- **Part 1:** for every `K`, the head-on setup has the larger system's mass (3.00 against 2.45 at `K = 1`, 12.00 against 4.90 at `K = 10`), and no locked-in energy. The stationary target locks in 55 percent of `K` at `K = 1`, 71 percent at `K = 10`, and 88 percent at `K = 100`. A new particle of mass 2 needs `K ≥ 2` head-on and `K ≥ 6` against a stationary target. The system's own observer and the lab find the same `M` in each setup.
- **Part 2:** for `r = 0.25`, each piece has energy 0.5 and speed 0.866c; the sum of the rest masses is 0.5; the mass given up is 0.5. At `r = 0.5` the pieces are at rest. At `r = 0.6` no decay happens. The passing observer finds different energies and momenta for the pieces, but the system's mass of the pieces is 1.000 for every observer.

---

## Expected Learner Understanding

The learner should be able to say that making a new particle needs the system's mass to reach the total mass of the products; that two head-on beams make all of their energy of motion usable while a beam on a stationary target locks part of it into the motion of the whole system, so colliders reach much higher masses; that the two cases are one collision seen by two observers who agree on the system's mass; that a particle decays only into pieces that weigh less than it in total, with the difference becoming their energy of motion; and that a reaction or decay being allowed does not mean it happens. They need not derive the formulas, handle more than one dimension, or work out how energy is shared among three or more pieces.

---

## New Concepts Introduced

**Beam**, **target**, **stationary target**, **collider**; **the energy of motion supplied** (`K`); **the new particle**; **the system's own observer**; **usable** and **locked-in energy**; the **threshold** for making a particle in a collision (reused from Experiment 5, now with a stationary target); **decay**, **parent**, **pieces** and **mass given up**.

---

## Relationship to Previous Experiments

- **This group's Experiment 5, Part 2 (the collision):** the lump at rest in Part 2 is the head-on case here, where all the energy of motion became mass. The stationary-target case is the same collision with a lump that keeps moving, so some of the energy stays as motion.
- **This group's Experiment 5, Part 3 (pair creation and annihilation):** pair creation's threshold is this experiment's threshold, and decay is the reverse of making a particle at the threshold. The two photons from a neutral pion, mentioned in Experiment 5's tutor, are Part 2's decay into light.
- **This group's Experiment 5, Part 1 (the particle's own observer):** the system's own observer is the same idea for a whole system.
- **This group's Experiment 1 (the interval), 3 (cause before effect):** the same "what is the same for everyone" pattern, now for the system's mass; the observer-dependent parts (energy and momentum) change, the mass does not.
- **First chapter, Experiment 3 (the moving clock):** the time dilation factor and `E = 1 ÷ D(v)` are reused.
- **No earlier experiment uses a stationary target, a collider, or decay,** so there is no overlap.

---

## Relationship to Later Experiments

Candidates, none approved: **the relativistic Doppler effect** (the roadmap's next item; the energy shift of the photons here is the same factor), **aberration**, **adding velocities relativistically**, **the twin paradox seen with light signals**, **particle physics at higher energies** (many pieces, which needs the distribution of energy among pieces that this experiment leaves out), **neutrinos and the weak force**, and **forces and acceleration in special relativity**. Each would need its own proposal and approved specification (§23 Stages 1 to 4).

---

## Required Physics Tests

Tests verify the physics, not just that functions exist (§10). All are for `src/physics/makingNewParticles.ts`.

1. Stationary target: for `K` in a spread, the lab's total energy is `2 + K`, the total momentum × c is `√(K² + 2K)`, and `systemMass = √(4 + 2K)` (the test builds the pieces itself and does not copy the formula). At `K = 3` it is `√10 = 3.1623`.
2. Head-on: the total momentum is 0 (to a stated tolerance) and `systemMass = 2 + K`, for `K` in a spread.
3. For every `K > 0`, `systemMass(head-on) > systemMass(stationary target)`, and the two are equal in the limit `K → 0`.
4. The system's own observer's speed: for the stationary target it is `√(K ÷ (K + 2))`; transforming the lab's pieces to that observer with `readingFor` gives a total momentum of 0, a total energy equal to `systemMass`, and two particles approaching with equal speeds. Head-on: the speed is 0.
5. Usable energy `U = M − 2` equals the total energy of motion in the system's own observer's frame (summed from the transformed pieces), and `L = K − U = E_tot − M`; `L = 0` for head-on; `L ÷ K` is increasing in `K` for the stationary target (0.551, 0.586, 0.652, 0.710, 0.877 at the presets).
6. `systemMass` is the same, to a stated tolerance, for the lab and for the system's own observer, in both setups, and for any other observer speed in a spread.
7. Thresholds: `thresholdKineticEnergy('head-on', X) = X` and `('stationary-target', X) = 2X + X²/2` (the table, for `X = 0.5, 1, 2, 4`); at `K` equal to the threshold, `systemMass = 2 + X` exactly (the test would fail if a particle could be made below the threshold: `canMake` is false for `K` slightly below, true at and above).
8. `canMake` agrees with the "can it be made" table for `K` in the presets and `X` in the presets.
9. Real-world checks used by the tutor: for `X = 134.9768 MeV` and `m = 938.272 MeV`, the stationary-target threshold is `279.66 MeV` and the head-on total is `134.98 MeV`; a 6.5 TeV proton on a stationary proton gives `M = 110.45 GeV`; a stationary-target beam that matches `M = 13 TeV` has an energy of `9.006 × 10⁷ GeV` (about 90,000 TeV, about 13,900 times 6.5 TeV). The test states the constants (Decision 11).
10. Decay: for each `r` in the presets with `2r ≤ 1`, each piece has `E = ½`, `pc = √(¼ − r²)`, speed `√(1 − 4r²)` (the table), the pieces are equal and opposite, total energy is 1 and total momentum 0, the sum of the rest masses is `2r`, and the mass given up is `1 − 2r`.
11. Decay, threshold: `allowed` is true for `r ≤ ½` and false for `r > ½`; at `r = ½` the pieces are at rest; for `r = 0` each piece is a light pulse with `pc = E`.
12. Decay, passing observer: total energy and total momentum are conserved for every `u` in a spread, the system's mass of the pieces is 1 for every `u`, and the example for `r = 0.25`, `u = +0.3` matches the table.
13. Decay, conservation is checked **independently of how `runDecay` builds the pieces:** the test sums the pieces' energies and momenta itself and compares with the transformed parent.
14. The light case matches Experiment 5: for `r = 0` the passing observer's pulse energies equal `½ √((1 − u) ÷ (1 + u))` and `½ √((1 + u) ÷ (1 − u))`.
15. Out-of-range inputs throw `RangeError` (`K ≤ 0`, `X ≤ 0`, `r < 0`, `|passingSpeed| ≥ 1`, a non-finite value); `runDecay` with `r > ½` returns `allowed: false` and does not throw.
16. The results are a pure function of the inputs, so playback speed cannot change them (§11).

---

## AI Tutor Behavior

Following the established sequence (observe, compare with the prediction, a conceptual question, then the explanation), **once for each part**. Draft only; the owner approves the wording (§28.1). The explanations must use the learner's own numbers, simple math and daily-life examples (§15), and must keep terms defined in plain language.

### Part 1 tutor

1. **Observe.** "Look at the tables and the bars. Compare the system's mass for the two setups, and how much of the energy supplied was usable in each."
2. **Compare with the prediction.** Neutral: the learner's choice versus the numbers.
3. **Conceptual question.** "In the stationary-target collision, the whole system keeps moving after the collision. What does that tell you about the energy of motion, and why is the head-on collision different?"
4. **Explanation**, in numbered paragraphs:
   - **1. What the results show,** in the learner's own numbers (for example `K = 10`: the stationary target's `M = 4.899`, usable `2.899`, locked-in `7.101`; head-on `M = 12.000`, usable `10`).
   - **2. Why part of the energy is locked in.** Momentum is conserved, and the beam brought momentum with it, so the system as a whole must keep moving afterward. The energy of that motion is `E_total − M`, and it cannot become mass.
   - **3. The cars.** The daily-life example from the introduction, revisited: two cars meeting head-on stop and spend everything on crumpling; a moving car hitting a parked one leaves a sliding wreck.
   - **4. The same collision, two observers.** The system's own observer sees the stationary-target collision as a head-on one, with less energy of motion (the usable part) than the lab supplied. Both observers agree on the system's mass.
   - **5. The threshold for the learner's `X`:** head-on needs `K ≥ X`; the stationary target needs `K ≥ 2X + X²/2` (for `X = 2`: 2 against 6). The extra grows as `X²`, so heavier particles are much harder to make by hitting a stationary target.
   - **6. How big is this in the real world,** with sourced numbers (Decision 11): to make a neutral pion (mass 135 MeV) from two protons, two head-on beams need a total energy of motion of 135 MeV, while a proton beam on a stationary proton needs 280 MeV, more than twice as much. At the Large Hadron Collider, two 6.5 TeV beams meeting head-on give a system's mass of 13 TeV. A 6.5 TeV proton hitting a stationary proton would give only 110 GeV. To match 13 TeV with a stationary target, the beam would need about 90,000 TeV, about 14,000 times more. That is why the LHC is a collider.
   - **7. A remark on "allowed".** The experiment says only whether energy and momentum permit the reaction. Real reactions also obey other rules (such as electric charge) and happen with some probability, so an allowed reaction does not always happen.
   - **8. What was shown, and what was not.** One line; two identical particles; a neutral new particle; the leftover energy above the threshold was not shown; the formulas were used, not derived.
5. **Limits.** The tutor says what was and was not shown.

### Part 2 tutor

1. **Observe.** "Look at the ledger. What happened to the sum of the masses of the pieces, and to the mass of the whole system?"
2. **Compare with the prediction.** Neutral.
3. **Conceptual question.** "The pieces weigh less than the parent in total. Where did the missing mass go, and why do the pieces fly apart?"
4. **Explanation**, in numbered paragraphs:
   - **1. What the ledger shows,** in the learner's own numbers (for example `r = 0.25`: the parent's mass 1, the pieces' total 0.5, mass given up 0.5, each piece moving at 0.866c with energy 0.5).
   - **2. Where the mass went.** It did not vanish; it became the pieces' energy of motion (each piece's kinetic energy is `½ − r`). Total energy was conserved the whole time.
   - **3. Why equal pieces, flying apart.** The parent was at rest, so the total momentum was zero; two equal pieces with opposite momenta keep it zero. (The skaters again, pushing off from rest.)
   - **4. Why a particle cannot decay into heavier pieces.** The system's mass cannot change, and the pieces' total rest mass cannot exceed it. With `r = 0.6` the pieces would weigh 1.2, more than the parent's 1, so nothing happens. This is a threshold again.
   - **5. Decay is making a particle backward.** At `r = ½` the pieces just sit at rest, exactly the threshold case of Part 1 played in reverse; annihilation and pair creation in Experiment 5 are the same idea.
   - **6. The passing observer.** They find different energies and momenta for the pieces (for `r = 0.25` and `u = +0.3`: `0.388` and `0.660`), but the system's mass of the pieces is 1 for them too, the parent's mass.
   - **7. A real example.** A neutral pion at rest (mass 135 MeV) decays most often into two light pulses, each carrying 67.5 MeV in the pion's own frame. This is `r = 0`.
   - **8. A second real example: radioactive decay** (added 2026-10-15 at the owner's request; draft wording for the owner's approval, §28.1). "When a nucleus of uranium-238 decays, it turns into a nucleus of thorium-234 and an alpha particle, which is a helium nucleus. The two pieces weigh slightly less than the uranium nucleus did: about 2 parts in 100,000 less. That small mass difference becomes the pieces' energy of motion, about 4.27 million electron-volts (MeV). This is the same idea as the mass given up in this experiment. As the pieces slow down in the rock around them, their energy of motion becomes heat. Heat from the decay of uranium, thorium and potassium inside the Earth supplies about half of the heat the Earth gives off. **A difference from our model:** here the two pieces are not equal. The alpha particle is much lighter than the thorium nucleus, so it gets about 98 percent of the energy of motion (4.20 of the 4.27 MeV), and the thorium nucleus drifts away slowly. Our experiment used two equal pieces, which is the simplest case that conservation of energy and momentum settles completely. Some radioactive decays, such as beta decay, produce three pieces, which the experiment did not show." The figures and their source status are in the table "Real-World Facts Used, and Source Status".
   - **9. A remark on "will".** The experiment shows only what is allowed. When a particle decays, and how often, is a matter of probability and is not modeled.
   - **10. What was shown, and what was not.** Two equal pieces, along one line; unequal pieces, more pieces, and the timing of decay were not shown.
5. **Limits.**

The tutor must not invent physics, change results, or contradict the engine (§13).

### Chapter summary (draft, for the owner's review)

Shown below the experiment only after Part 2's tutor reaches its explanation (the experiment's progress marks follow Experiment 5's, Decision 14): "What you learned": to make a new particle, the system's mass must reach the total mass of what comes out; two head-on beams make all their energy of motion usable, while a beam on a stationary target locks part of it into the motion of the whole system (for `K = 10`, 7.1 of 10 locked in, 4.90 against 12.00 for the system's mass), so colliders reach much higher masses; a particle can decay only into pieces that weigh less than it in total, with the difference becoming their energy of motion. "What's next": a line saying one line only, no probabilities, two equal pieces, and that this group has no further experiment yet (until one is approved).

---

## Real-World Facts Used, and Source Status

Only the tutors use real-world figures; the experiment itself runs on the model.

| Statement | Value | Status |
|---|---|---|
| Neutral pion mass | 134.9768 MeV | Confirmed by search, 2026-10-15 (a Particle Data Group value quoted in several papers) |
| Pion production in a proton-proton collision on a stationary proton needs about 280 MeV; the formula is `T = m_π (2 + m_π ÷ 2M)`, giving 279.65 MeV; two head-on beams need only the pion's mass | | Confirmed by search, 2026-10-15 (physics course notes and papers). The computed 279.66 MeV agrees |
| LHC: two 6.5 TeV proton beams, 13 TeV collision energy | | Confirmed by search (CERN pages), 2026-10-15 |
| A 6.5 TeV proton on a stationary proton gives `M = 110.45 GeV`; matching 13 TeV needs about 90,000 TeV | | **Computed** from `M² = 2m² + 2mE` (the same formula as this experiment's `√(4 + 2K)`), not found as such in the search; the test recomputes it |
| A neutral pion at rest decays most often into two photons | | "Mostly decay into a pair of photons" confirmed by search, 2026-10-15; a specific percentage was **not** confirmed and is not used |
| The system's mass cannot be less than the sum of its pieces' rest masses, with equality when all the pieces move together | | Standard special relativity; used, not derived. **Not yet source-checked here** |
| Decay and reaction probabilities and lifetimes exist and are not modeled; reactions obey other conservation rules | | General knowledge; **not source-checked** |
| Uranium-238 alpha decay: ²³⁸U → ²³⁴Th + ⁴He, releasing about 4.27 MeV (4.273 MeV in one result) | | Confirmed by search, 2026-10-15 (textbook solutions and lecture notes; not a primary source) |
| In alpha decay the energy released is (parent mass − daughter mass − alpha mass) × c², and the alpha particle gets about `Q × (daughter mass ÷ total mass)` of it | | Confirmed by search, 2026-10-15 (university lecture notes and a textbook page) |
| The alpha particle gets about 98 percent (4.20 MeV) of the 4.27 MeV, and the thorium nucleus about 0.07 MeV; 4.27 MeV is about 2 parts in 100,000 of uranium-238's rest energy (`4.27 ÷ (238 × 931.5)`) | | **Computed** by Claude from the formula above and the mass numbers, not found as such; the tutor should state these as approximate |
| About half of the heat the Earth gives off comes from the decay of uranium, thorium and potassium inside it | | Confirmed by search, 2026-10-15 ("about half of Earth's total heat flux"; review and university pages; no primary source) |
| `E = 1 ÷ D(v)`, `M = √(E² − (pc)²)`, and the transformation of energy and momentum | | Reused from Experiment 5 (textbook special relativity; the phrase "tested in accelerators" there still has no source check) |

---

## Decisions Needing Human Review

1. **Is this the right next experiment?** Default: yes, as the practical payoff of Experiment 5, with decay included at the owner's request. Alternatives: the relativistic Doppler effect (the roadmap's sixth), velocity addition, aberration, or stopping the group at Experiment 5.
2. **Two parts, two tutors, a two-stage introduction.** Default: yes (Part 1 making a particle, Part 2 decay), following Experiment 5's pattern, with a skip link between them (Decision 14). Alternatives: Part 1 only, with decay as a later experiment; or decay as a short closing section in the tutor.
3. **Part 1 shows both setups together** for the same `K`, with no setup control. Default: yes, because the prediction is the comparison. Alternative: a control to choose one setup, with the comparison made by running twice.
4. **The fair comparison is the same energy of motion `K`.** Default: yes. Alternative: the same beam energy (the head-on setup then has twice the energy of motion, which blurs the point).
5. **A generic neutral new particle of mass `X`** in the model, with the real neutral pion only in the tutor. Default: yes. Alternative: use the real pion throughout (more concrete, but its mass is a small fraction of a proton's, so the presets would be less varied).
6. **How leftover energy is shared above the threshold is not drawn.** Default: not computed or drawn, stated plainly, because conservation alone does not fix it for three or more pieces. Alternative: draw only the case at the threshold.
7. **The system's own observer is shown automatically;** there is no passing-observer control in Part 1. Part 2 keeps the passing-observer control as Experiment 5 had. Default: yes. Alternative: add the control to Part 1.
8. **Presets.** Part 1: `K` = 1, 2, 5, 10, 100 and `X` = 0.5, 1, 2, 4. Part 2: `r` = 0 (light), 0.1, 0.25, 0.4, 0.5, 0.6 and passing speeds ±0.3c, ±0.6c. Alternatives: fewer presets, or a slider.
9. **Decay into two equal pieces only** (or two light pulses). Default: yes, because equal pieces are fixed by conservation alone. Alternative: unequal pieces (the energies then depend on both masses, and the formulas are longer), or decay into three pieces (not fixed by conservation, so excluded).
10. **Units.** Part 1 uses rest energies of one colliding particle; Part 2 uses the parent's rest energy (so that light pulses fit). The introduction says so. Alternative: one unit throughout (it makes light awkward).
11. **Real-world numbers in the tutors only:** the pion's mass, the 280 MeV threshold, the LHC's 13 TeV, the computed 110 GeV and 90,000 TeV, and the uranium-238 alpha decay figures (added 2026-10-15 at the owner's request, with a stated difference from the model's equal pieces). Default: yes, with the sources above. Alternative: leave them out.
12. **The rule `M ≥ 2 + X`** is stated and used, not derived, as Experiment 5 treated its starting rules. Default: yes. Alternative: a short plain-language argument (the pieces can only move together at best, which is the least system's mass).
13. **Other conservation laws** (electric charge and baryon number) are named as not modeled, and the antiproton's discovery (which needs baryon number) is left out. Default: yes. Alternative: include it, with a one-line statement of the extra rule.
14. **Skip and back links, reminders and progress marks follow Experiment 5** (link names such as "Skip to Part 2 - Decay"; the check mark when Part 2's playback ends, and the "explained" mark and the summary when Part 2's tutor reaches its explanation). Default: yes.
15. **Name.** Default: "Making New Particles: How Much Energy Does It Take?" as the learner-facing title. The owner may prefer another.
16. **Words "usable" and "locked-in".** Default: yes. Alternatives: "available" and "tied up in motion".
17. **What would be left for a primary-source check.** The pion figures and the LHC are confirmed by search only; the rule `M ≥ Σm`, the probability remark, and the "mostly two photons" claim are general knowledge; the fixed-target numbers are computed.

---

## Success Criteria

1. The physics model gives, for each `K`, the two setups' system's mass, speed of the system's own observer, usable and locked-in energy and thresholds, and for each `r` the decay's pieces, mass given up and passing observer's readings, and the numbers agree with the tables in "Physics Model" (to a stated tolerance).
2. The learner predicts before each run; each Run requires a prediction.
3. The Part 1 diagram shows the two setups on one scale, each labeled, and a contrast that does not rely on colour alone: the system as a whole still moving in one and at rest in the other, and a usable part and a locked-in part in each bar.
4. The Part 1 pictures show that the stationary-target collision, seen by the system's own observer, is a head-on one, and that both observers find the same system's mass.
5. The Part 2 pictures show the sum of the pieces' rest masses and the system's mass in separate bars, and say plainly when no decay can happen.
6. Results are shown neutrally, then explained by the tutor after the learner has responded.
7. The learner can say that the usable energy is the system's mass minus the masses of the parts, that head-on beams waste none, that a particle decays only into lighter pieces, and that "allowed" does not mean "happens".
8. The experiment never says that mass is "turned into" energy (it says energy changes form), never shows a reaction that conservation forbids, and never shows a decay into heavier pieces.
9. The two-stage introduction passes Experiment 5's check list: every term and every formula is defined or explained, with a worked example and a note of what it does not mean, before it is first used, and no introduction states the result of its part's prediction. The "Words and formulas" panel lists every term and formula so far.
10. Nothing in it contradicts Experiment 5, the first chapter's Experiments 1 to 11, or this group's Experiments 1 to 4.

---

## Implementation Notes

**Built (2026-10-15):** the physics model (`src/physics/makingNewParticles.ts`) and its tests (`src/physics/makingNewParticles.test.ts`: all sixteen required tests, as 30 test cases, with the specification's tables written out by hand). It reuses `readingFor`, `systemMassOf`, `totalsOf` and `makeReading` from `energyMomentum.ts`; `makeReading` was exported for this (the only change to that file). It also exports `runSetup`, `runMakingExperiment`, `canMake`, `thresholdKineticEnergy`, `largestMakeableMass`, `stationaryTargetSystemMass`, `stationaryTargetBeamEnergyFor`, `runDecay`, and the constants `NEUTRAL_PION_REST_ENERGY_MEV` and `LHC_BEAM_ENERGY_GEV`. `canMake` and `runDecay` use a tolerance of `10⁻⁹` at the threshold, so that rounding cannot turn "just enough" into "not enough". A mutation check (eight deliberate breaks of the module: a wrong beam momentum, a wrong head-on energy, a stationary-target threshold without the half, a `canMake` off by one rest mass, a wrong decay momentum, a decay that forbids the threshold, a wrong usable energy, and a wrong own-observer speed) was caught by at least two tests each. **Not built:** the interface, the introduction, the "Words and formulas" panel, the diagrams, the results, the two tutors and the chapter summary.
