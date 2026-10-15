# Experiment 5 (Spacetime Geometry): Energy, Momentum and Mass, What Do All Observers Agree On?

**Status: APPROVED by the owner on 2026-10-14 ("spec approved"), with all eighteen "Decisions Needing Human Review" taken on their defaults (including the three tutors and the three-stage introduction, which the owner delegated to Claude). The experiment is built, tested, complete-flow tested and finally reviewed (2026-10-15), and the owner approved all its learner-facing wording on 2026-10-15 ("wordings approved"). The owner approved all eight differences from this specification on 2026-10-15 (listed under "Implementation Notes").** Proposed by Claude per §23 Stages 1 to 3 on 2026-10-14, at the owner's request for a comprehensive experiment that takes all the relevant scientific facts into account and may be long, because the topic is complex. **Revised on 2026-10-14 at the owner's request before approval** to add nuclear reactions and the creation and destruction of particles as a third part (Part 3), with the extra facts source-checked as far as search results allow (see "Real-World Facts Used, and Source Status"). The learner-facing wording below is the original draft; the wording as built, which the owner approved on 2026-10-15, is in the components (see "Implementation Notes"). Every number marked "computed" was computed by script on 2026-10-14 and must be re-checked by the physics tests before approval of the build.

**Group:** "Spacetime Geometry: What Is Real, What Is Seen". Specifications for this group live in `docs/experiments/spacetime-geometry/`. This experiment is **not on the first specification's roadmap** (which lists aberration, the Doppler effect and a fast object looking rotated as items 5 to 7). It is proposed in its place because energy, momentum and mass are barely covered anywhere in the project (see "Relationship to Previous Experiments"), and because it repeats the group's central pattern, "what is the same for everyone", on a new pair of quantities. The roadmap items remain available as later proposals.

---

## Overview

Experiment 1 of this group found one number that every observer agrees on: `time² − distance²`, the interval. Time and distance differ from observer to observer, but this combination does not.

This experiment asks the same question about **a moving object's energy and momentum**. Two observers who move differently measure *different* energies and *different* momenta for the same particle. Yet there is a combination that all of them agree on, and it has exactly the same shape as the interval: `energy² − (momentum × c)²`. That agreed-on number is the particle's **mass** (more exactly, the square of its rest energy, `(mc²)²`). So:

- **Mass is the "interval" of energy and momentum.** It is the same for everyone, and it is what you would measure if you rode along with the particle.
- **A particle that is not moving still has energy: `E = mc²`.** The famous formula is the special case of the invariant when the momentum is zero.
- **Total energy is `E = (time dilation factor)⁻¹ × mc²`**, and it grows without limit as the speed approaches the speed of light. This is why nothing with mass can reach `c`, and why Newton's `½mv²` fails at high speed.
- **Light has energy and momentum but no mass**: its invariant is zero, it has no rest frame, and its energy differs between observers.
- **In a collision, energy and momentum are conserved for every observer, but the sum of the masses of the parts is not**: two particles that collide and stick form a lump whose mass is *more* than the two masses added. Energy of motion became part of the mass. What *is* unchanged is the mass of the whole system, worked out from its total energy and total momentum.
- **Particles can be destroyed and created.** An electron and its antiparticle (the positron) can meet and turn into light, so that two masses become none. Two beams of light can make an electron and a positron, but only if each has enough energy: a threshold set by conservation alone.
- **Nuclear reactions follow the same rule.** A helium-4 nucleus weighs about 0.75 percent less than the two protons and two neutrons it is made of, and that difference, about 28.3 million electron-volts, is the energy released when it forms. The Sun does this at the rate of about 4 million tonnes of mass per second.

The experiment has **three parts**, each with its own prediction, run, results and tutor conversation (Decision 2):

- **Part 1: One particle, three observers.** The invariant, rest energy, total and kinetic energy, and the light pulse.
- **Part 2: A collision seen by two observers.** Conservation of energy and momentum, the lump heavier than its parts, and the mass of the whole system.
- **Part 3: Reactions: where mass goes and where it comes from.** A particle and its antiparticle turning into light, light making a particle and its antiparticle, and the nuclear binding of helium-4.

An honest limit, stated to the learner and not hidden: **the formulas for energy and momentum are not derived from scratch here.** They are introduced as the correct rules (tested in particle accelerators, Decision 12), motivated by Part 2, where the everyday rule for momentum is shown to fail and the relativistic one to work. A full derivation is left for a later experiment, if the owner wants one.

---

## Learning Objective

After this experiment, the learner should understand:

1. A moving particle has **energy and momentum**, and different observers measure **different values** for both, just as they measure different times and distances.
2. There is one combination that **every observer agrees on**: `E² − (pc)²`. It has the same "subtract the squares" shape as the interval. It equals `(mc²)²`, so it defines the particle's **mass**, a number that does not depend on who measures it. The particle's own observer (the one riding along) is the one who measures zero momentum.
3. A particle at rest still has energy, its **rest energy**, `E = mc²`. This is the special case of the invariant when `p = 0`. It is a statement about what a mass is *worth* as energy, not about a mass "turning into" something.
4. A moving particle's **total energy** is its rest energy times a factor that grows as it speeds up: `E = (1 ÷ time dilation factor) × mc²`. Its **kinetic energy** (energy of motion) is the total minus the rest energy. At low speeds this is close to Newton's `½mv²`; at high speeds it is much larger and grows without limit as `v → c`, which is why a particle with mass can never be pushed up to the speed of light.
5. **Light** has energy and momentum with `E = pc`, so its invariant is zero: it has no mass, always moves at `c` for every observer, and **no observer can ride along with it**. Different observers measure different energies for the same light pulse (the shift is the same factor as the Doppler shift, seen again in a later experiment).
6. In a collision, **total energy and total momentum are conserved for every observer**. The everyday momentum `mv` is *not*, once speeds combine the relativistic way. **The sum of the parts' masses is not conserved**: two particles that stick together make a lump whose mass is more than the sum of theirs, because the energy of their motion became internal energy (such as heat), and internal energy counts toward mass.
7. The effect on everyday objects is **tiny**: two 1-kilogram lumps of clay colliding at 100 meters per second gain about a ten-trillionth of a kilogram of mass, far too little to notice. This is why we never see it in daily life.
8. The **mass of a whole system**, worked out from its total energy and total momentum, is the same before and after a collision or a reaction, for every observer. The **sum of the masses of its parts** is not. Two photons flying apart have no mass each, but together, as a system, they have mass.
9. Particles can be **destroyed and created**. A particle and its antiparticle (same mass, opposite electric charge) can turn into light, so that their rest energy goes entirely into the energy of light; and light can make a particle and its antiparticle, but only if the energy is at least the sum of their rest energies (the threshold). Conservation of energy and momentum decides what is possible.
10. In a **nuclear reaction** the sum of the masses of the products is less than that of the parts that went in (or, in a decay, the reverse), and the difference, times `c²`, is the energy released. For helium-4 it is about 0.75 percent of the mass of its parts, about 28.3 MeV. The same idea powers the Sun. Mass is not "turned into" energy: energy moves from one form to another and the total is conserved.
11. (A short remark.) The statement "mass increases with speed", found in many books, uses an older meaning of the word. In this experiment **mass always means the invariant**, and it does not change with speed. Energy does.

---

## Physical Situation

### Reused

- Flat spacetime, no gravity, constant velocities, one dimension of space (as in the earlier experiments).
- Units: `c = 1`. Speeds are fractions of `c`.
- `lorentzTransform(event, velocity)` from `src/physics/lorentzTransform.ts` and `timeDilationFactorFor(velocity)` from `src/physics/movingClockExperiment.ts` (the **time dilation factor**, `√(1 − v²)`, which equals `1/γ`; the project does not introduce the symbol `γ`, Decision 6). The transformation of energy and momentum is **the same transformation** as for time and position, with energy playing the part of time and `pc` the part of position (see "Physics Model"). The module will use `lorentzTransform` instead of duplicating it.
- `intervalSquared` from `src/physics/spacetimeInterval.ts` for the comparison with Experiment 1, and the light cone's 45-degree edges from Experiment 2, now drawn in energy-momentum space.
- The dark-canvas diagram style of Experiments 1 to 4 and the introduction/prediction/run/results/tutor structure.

### What is new

- **A particle** with mass `m` (one preset mass, so energies can be written as multiples of the rest energy, Decision 4) moving along the line at speed `v` in the lab.
- **A light pulse** as a second kind of "particle" with no mass (Decision 7).
- **Three observers** in Part 1: the **lab**, the **particle's own observer** (who rides along; exists only for a particle with mass), and a **passing observer** moving at a chosen speed `u`.
- **Energy** `E` and **momentum** `p` of the particle, and the combination `E² − (pc)²`.
- In Part 2, **two identical particles** that collide head-on in the lab and **stick together** into one lump (Decision 10).
- In Part 3, **antiparticles** (a particle with the same mass and the opposite electric charge, such as the positron, the electron's antiparticle), **photons as products and as ingredients**, and **a nucleus** (helium-4) with its protons and neutrons (Decisions 14 to 17).

### Simplifying assumptions (all stated to the learner in plain language)

- One line: everything moves along the same line.
- Constant speeds before and after the collision. The collision itself is not shown in detail, only the situation just before and just after.
- No gravity. No forces other than the collision. Nothing leaves the system (no radiation escapes in Part 2: the extra energy stays inside the lump, as internal energy).
- Energy is **measured in units of the particle's rest energy `mc²`**, and momentum is shown as **`pc`**, so both have the same units and can be compared (Decision 4).
- The observers' speeds are all below `c`.

### Not introduced

Force and acceleration (the collisions and reactions are treated by their before and after only), the symbol `γ`, four-vectors by name, the quantum idea that light comes in particles (photons) and `E = hf` (a "photon" here is only a light pulse of a given energy), the strong force that holds a nucleus together (the binding energy is used as a measured number, not explained), neutrinos, electric charge beyond saying that it is conserved, the weak force, gravity acting on energy, a proof of the momentum and energy formulas, and the older idea of "relativistic mass" except for one clarifying remark (Decision 3). Real-world numbers (rest energies of the electron and proton, the Large Hadron Collider, `1 kg`, the 511 keV photons of a PET scan, the helium-4 binding energy, the Sun's mass loss) appear only in the tutor, and the helium-4 binding energy as the one number the model uses, as stated facts with sources (Decision 9).

---

## Physics Model

All formulas below are standard textbook special relativity. Each is used exactly as written here. None is derived in the interface (see the honest limit in the Overview).

### Units and symbols

`c = 1`. A speed `v` is a fraction of `c`. Mass `m` is the particle's mass, the same for every observer. **Energy is measured in rest energies** (`mc² = 1`) and **momentum is shown as `pc`**, also in rest energies. Let `D(v) = √(1 − v²)` be the **time dilation factor** (it equals `1 ÷ γ`).

### One particle with mass, in the lab

- Total energy: `E = mc² ÷ D(v)`, which in rest-energy units is `E = 1 ÷ D(v)`.
- Momentum times `c`: `pc = (mc² ÷ D(v)) × v`, in rest-energy units `pc = v ÷ D(v)`.
- Rest energy: `E₀ = mc² = 1`. Kinetic energy: `KE = E − E₀ = (1 ÷ D(v)) − 1`.
- The **invariant**: `E² − (pc)² = (mc²)² = 1`.
- The speed is recovered from energy and momentum: `v = pc ÷ E` (with `c = 1`).

**Stable computation.** `1 ÷ D(v) − 1` loses accuracy at small speeds when computed directly (the two terms are almost equal). The module must compute `KE = v² ÷ (D(v) × (1 + D(v)))`, which is the same quantity written without the subtraction. (A test compares it with `½v²` at small `v`.)

### The same particle, as another observer measures it

An observer moving at speed `u` along the line (relative to the lab) measures `E′` and `p′c` given by the same transformation as for time and position, with `E` in the place of time and `pc` in the place of position:

- `E′ = (E − u × pc) ÷ D(u)`
- `p′c = (pc − u × E) ÷ D(u)`

(This is `lorentzTransform({ time: E, position: pc }, u)`.) Then:

- `E′² − (p′c)² = E² − (pc)²`. The invariant is the same for every observer.
- The speed this observer measures for the particle is `v′ = p′c ÷ E′`, which equals `(v − u) ÷ (1 − uv)`. This is the relativistic way speeds combine. It is **not** `v − u`, and it stays below `c` for every pair of speeds below `c` (Decision 6: displayed, not derived).
- The **particle's own observer** is the observer with `u = v`. They measure `E′ = mc² = 1` and `p′c = 0`: the lowest possible energy for this particle.

### A light pulse (no mass)

Moving along the line toward positive positions, a light pulse of lab energy `E` has `pc = E` (and `pc = −E` for the other direction):

- Invariant: `E² − (pc)² = 0`, so its mass is zero.
- Speed: `v′ = p′c ÷ E′ = 1` for **every** observer. (Consistent with Experiment 5 of the first chapter.)
- The transformed energy is `E′ = E × √((1 − u) ÷ (1 + u))` for an observer moving at `u` in the same direction as the pulse. It is lower for `u > 0`, and higher for `u < 0`. This is the Doppler factor, which a later experiment and Gravitational Waves Experiment 5 treat as redshift. In this experiment it is only a result.
- No observer can have `p′c = 0` (every observer measures `v′ = 1`), so **a light pulse has no rest frame**.
- For light, energy is measured in units of the pulse's lab energy (it has no rest energy to use as a unit, Decision 4).

### Kinetic energy and the speed limit

- The energy needed to speed a particle from rest to speed `v` is its kinetic energy `KE(v)` (the work done on it equals the gain in energy).
- Newton's value: `KE_N = ½ m v²`, in rest-energy units `½ v²`. The ratio `KE ÷ KE_N` is close to 1 at low speed and grows without limit as `v → 1`.
- `KE(v) → ∞` as `v → 1`: reaching `c` would need an infinite amount of energy. (This is a mathematical fact of the formula, stated as a consequence, not as an experiment.)

### Part 2: two identical particles collide head-on and stick (computed)

In the **lab frame**, two identical particles, each of mass `m`, move toward each other at speed `v`, one to the right and one to the left, and collide head-on and stick together. By symmetry the lab is the frame where the **total momentum is zero**, so the lump ends at rest in the lab.

- Before, in the lab: each particle has `E = 1 ÷ D(v)` and `pc = ± v ÷ D(v)`. Total energy `E_tot = 2 ÷ D(v)`, total momentum `P = 0`.
- After, in the lab: one lump at rest. Conservation of energy and momentum (taken as the physical rules of this experiment, Decision 12) gives the lump's energy `E_lump = 2 ÷ D(v)` and momentum 0. Its **mass** is therefore `M = 2m ÷ D(v)`, more than `2m`. The extra, `M − 2m`, equals the particles' total kinetic energy divided by `c²`.
- For a passing observer at speed `u`, each particle's `E′` and `p′c` come from the transformation above. Then, for the **totals** before and after, `E′_before = E′_after` and `P′_before = P′_after` for **every** `u`. The lump's own `E′` and `p′c` come from the transformation of `(M, 0)`, and `√(E′² − (p′c)²) = M` for every `u`.
- **The mass of the whole system.** The two particles together, *before* the collision, have total energy `2 ÷ D(v)` and total momentum 0, so as a system their invariant mass is also `2m ÷ D(v) = M`. So `M` is **unchanged** by the collision. What the collision changes is the *sum of the masses of the parts*, from `2m` to `M` (a single lump). Generally: for any isolated system, `M_system = √(E_tot² − (P_tot c)²)` is conserved, and it is the same for every observer; the sum of the parts' masses is not.
- **The everyday momentum fails.** Using the passing observer's measured speeds `v₁′`, `v₂′` of the two particles (from the relativistic rule above) and the lump's measured speed `−u`, the quantity `m v` added before (`m(v₁′ + v₂′)`) differs from after (`2m × (−u)`). Example, `v = 0.6`, `u = 0.3` (computed): `v₁′ = 0.366`, `v₂′ = −0.763`, so before `= m × (−0.397)`, after `= 2m × (−0.3) = m × (−0.6)`. These are not equal, so `mv` with `M = 2m` is not conserved for this observer. The relativistic momentum and the relativistic mass `M = 2.5 m` are.

### Part 3: reactions, in the frame where the total momentum is zero (computed)

Each process is described in the **lab frame, chosen to be the frame where the total momentum is zero** (so the products can be written down by conservation alone), and then transformed to a passing observer exactly as in Part 2. In each, **total energy and total momentum are conserved, and so is the system's invariant mass** `M_sys = √(E_tot² − (P_tot c)²)`; what changes is the **sum of the rest masses of the pieces**, called here `Σm`.

**(a) A particle and its antiparticle meet: annihilation.** Two particles of the same mass `m`, one a particle and the other its antiparticle (for example the electron and the positron), move toward each other at speed `v` in the lab, with `v = 0` allowed ("at rest"). They turn into **two photons** going in opposite directions (Decision 15: why two, not one).
- Before: total energy `2 ÷ D(v)`, total momentum 0, `Σm = 2m`, `M_sys = 2 ÷ D(v)`.
- After: two photons, each with energy `E_γ = 1 ÷ D(v)` (in rest energies) and `pc = ± E_γ`. Total energy `2 ÷ D(v)`, total momentum 0, `Σm = 0` (photons have no mass), `M_sys = 2 ÷ D(v)`. So all the rest energy `2m c²` has gone into light, yet `M_sys` is unchanged.
- At `v = 0`, each photon has exactly one rest energy: **0.511 MeV for the electron and positron**, the two back-to-back photons of a PET scan.
- A passing observer at `u` finds the photon energies `E_γ √((1 − u) ÷ (1 + u))` and `E_γ √((1 + u) ÷ (1 − u))` (the same Doppler factor as in Part 1), with the same total energy and total momentum before and after, and the same `M_sys`.

**(b) Light makes matter: pair creation.** Two photons, each of energy `E_γ` (in rest energies of the particle to be made), move toward each other in the lab and meet. The pair that could be made is a particle and its antiparticle, each of mass `m`.
- Before: total energy `2E_γ`, total momentum 0, `Σm = 0`, `M_sys = 2E_γ`.
- A pair can be made only if the system's mass is at least `2m`: **the threshold is `E_γ ≥ 1` rest energy each** (a total of `1.022 MeV` for the electron). Below it, **no pair can be made** (conservation forbids it), so nothing happens and the photons pass each other.
- At or above the threshold: the pair is made, moving apart with equal speeds, each with `E = E_γ`, so each has `1 ÷ D(v) = E_γ`, giving `v = √(1 − 1 ÷ E_γ²)`. At the threshold `v = 0`; at `E_γ = 2`, `v = 0.866`; at `E_γ = 5`, `v = 0.980`. `Σm = 2m`, and `M_sys = 2E_γ` is unchanged.
- Real-world note (the model is deliberately simple): a **single** photon cannot make a pair in empty space, because the pair would have mass but the photon has none; in practice pair production happens when a photon passes close to a nucleus, which takes up the recoil, or when two photons collide (Decision 15). The experiment shows the two-photon case, where nothing else is needed.

**(c) A nucleus forms: the binding of helium-4.** Two protons and two neutrons, treated at rest and far apart, bind into one helium-4 nucleus. This is shown as **energy accounting only** (Decision 16): the model does not describe how the particles come together (it takes several steps in practice), and the released energy leaves as light and fast particles that the model does not follow. Using the measured masses:
- Before: `Σm = 2 × 938.272 + 2 × 939.565 = 3755.674 MeV/c²` (proton and neutron; `M_sys = Σm` because the parts are at rest).
- After: the helium-4 nucleus, `3727.379 MeV/c²`. The difference, **`28.295 MeV/c²`**, is the energy `28.3 MeV` released, which is **0.753 percent** of the parts' mass. This agrees with the accepted binding energy, 28.295674 MeV (Decision 12).
- Conservation: total energy is the same before and after, if the released energy is counted. In the frame of the nucleus at rest, the released energy can be written as two back-to-back light pulses of `14.148 MeV` each, so that the total momentum stays zero (a model, to show the accounting, not a description of the real reaction).
- The same idea, on a large scale: in the Sun, hydrogen is fused into helium, and about **0.7 percent** of the mass of the hydrogen is released as energy, about **4 million tonnes of mass per second** (the rounded value in the sources; the nominal solar luminosity `3.828 × 10²⁶ W` divided by `c²` gives `4.26 × 10⁹ kg/s`, to be checked, Decision 12).

### Numbers for Part 3 (computed 2026-10-14; the tests recompute them)

| Process | Setting | Before | After |
|---|---|---|---|
| (a) annihilation | `v = 0` | `Σm = 2`, `M_sys = 2` | two photons of `E = 1`, `Σm = 0`, `M_sys = 2` |
| (a) annihilation | `v = 0.6c` | `Σm = 2`, `M_sys = 2.5` | two photons of `E = 1.25`, `Σm = 0`, `M_sys = 2.5` |
| (b) pair creation | `E_γ = 0.5` | `M_sys = 1` | no pair (below threshold) |
| (b) pair creation | `E_γ = 1` | `M_sys = 2`, `Σm = 0` | pair at rest, `Σm = 2`, `M_sys = 2` |
| (b) pair creation | `E_γ = 2` | `M_sys = 4`, `Σm = 0` | pair at `v = 0.866c`, `Σm = 2`, `M_sys = 4` |
| (b) pair creation | `E_γ = 5` | `M_sys = 10`, `Σm = 0` | pair at `v = 0.980c`, `Σm = 2`, `M_sys = 10` |
| (c) helium-4 | at rest | `Σm = 3755.674 MeV/c²` | `3727.379 MeV/c²`, `28.295 MeV` released (0.753 percent) |

For annihilation at `v = 0` (two photons of energy 1 in the lab), a passing observer at `u = +0.3c` finds photon energies `0.7338` (the photon moving the same way as the observer) and `1.3628`, a total of `2.0966 = 2 ÷ D(0.3)`, and a total momentum `pc = −0.6290 = −2 × 0.3 ÷ D(0.3)`. The lab's total, transformed, gives the same (computed; the tests recompute it).

### Numbers for Parts 1 and 2 (computed 2026-10-14; the tests recompute them)

**Part 1, the lab's reading, per particle speed** (energy in rest energies):

| `v` | `E` | `pc` | `E² − (pc)²` | `KE = E − 1` | Newton `½v²` | `KE ÷ ½v²` |
|---|---|---|---|---|---|---|
| 0.3c | 1.0483 | 0.3145 | 1 | 0.0483 | 0.0450 | 1.07 |
| 0.6c | 1.2500 | 0.7500 | 1 | 0.2500 | 0.1800 | 1.39 |
| 0.8c | 1.6667 | 1.3333 | 1 | 0.6667 | 0.3200 | 2.08 |
| 0.9c | 2.2942 | 2.0647 | 1 | 1.2942 | 0.4050 | 3.20 |
| 0.99c | 7.0888 | 7.0179 | 1 | 6.0888 | 0.4901 | 12.4 |

**Part 1, an example with a passing observer** (`v = 0.6c`, passing observer `u = +0.3c`): lab `E = 1.250`, `pc = 0.750`; passing observer `E′ = 1.0745`, `p′c = 0.3931`, speed `v′ = 0.3659 = (0.6 − 0.3) ÷ (1 − 0.18)`; both give `E² − (pc)² = 1`. The particle's own observer (`u = 0.6c`, moving with it) measures `E′ = 1`, `p′c = 0`. A particle at rest in the lab (`v = 0`) seen by an observer at `u = 0.6c`: `E′ = 1.25`, `p′c = −0.75`, speed `0.6c` to the left.

**Part 1, the light pulse** (lab energy 1, moving right): for `u = −0.6, +0.3, +0.6, +0.8`: `E′ = 2.000, 0.734, 0.500, 0.333`, always `p′c = E′`, `E′² − (p′c)² = 0`, speed always 1.

**Part 2, the lump's mass for `v` each** (lab frame, in units of the mass `m`): `M = 2.097 (0.3c), 2.500 (0.6c), 3.333 (0.8c), 4.588 (0.9c)`, compared with the sum `2`. For `v = 0.6c`, `u = +0.3c`: before, `E′₁ = 1.0745`, `E′₂ = 1.5462`, total `2.6207`; after (lump), `E′ = 2.6207`; momentum before `0.3931 − 1.1793 = −0.7862`, after `−0.7862`; lump mass `√(2.6207² − 0.7862²) = 2.500`.

**An everyday case** (computed): two 1-kilogram lumps colliding head-on at 100 m/s each (`v ÷ c = 3.34 × 10⁻⁷`). Their total kinetic energy is `2 × ½ × 1 × 100² = 10,000 J`. Dividing by `c²` (`8.99 × 10¹⁶ m²/s²`) gives the extra mass, `1.11 × 10⁻¹³ kg`, about a tenth of a nanogram, in a lump of 2 kg.

### New: a small independent physics module

```typescript
// src/physics/energyMomentum.ts (proposed)
export interface EnergyMomentumReading {
  energy: number        // E, in rest energies (or in lab energies for a light pulse)
  momentumTimesC: number // pc, in the same units
  speed: number         // pc ÷ E, a fraction of c
  invariant: number     // E² − (pc)²
}

export function particleReading(speed: number): EnergyMomentumReading        // in the lab
export function lightReading(direction: 1 | -1): EnergyMomentumReading      // lab energy 1
export function readingFor(observerSpeed: number, reading: EnergyMomentumReading): EnergyMomentumReading
export function kineticEnergy(speed: number): number                        // stable form
export function newtonKineticEnergy(speed: number): number                  // ½v²

export function runInvariantExperiment(kind: 'particle' | 'light', speed: number, passingSpeed: number):
  { lab: EnergyMomentumReading; own: EnergyMomentumReading | null; passing: EnergyMomentumReading; kineticEnergy: number; newtonKineticEnergy: number }

export function runCollisionExperiment(speed: number, passingSpeed: number): {
  labBefore: EnergyMomentumReading[]; labAfter: EnergyMomentumReading
  passingBefore: EnergyMomentumReading[]; passingAfter: EnergyMomentumReading
  lumpMass: number; extraMass: number
  newtonMomentumBefore: number; newtonMomentumAfter: number   // for the passing observer
  systemMass: number                                           // the whole system's invariant mass, before and after
}

export type ReactionKind = 'annihilation' | 'pair-creation' | 'helium-binding'
export interface ReactionPiece { label: string; restMass: number; reading: EnergyMomentumReading }
export function runReactionExperiment(kind: ReactionKind, parameter: number, passingSpeed: number): {
  created: boolean                         // false below the threshold in pair creation
  labBefore: ReactionPiece[]; labAfter: ReactionPiece[]
  passingBefore: ReactionPiece[]; passingAfter: ReactionPiece[]
  sumOfRestMassesBefore: number; sumOfRestMassesAfter: number
  systemMassBefore: number; systemMassAfter: number
  energyReleased: number                   // sum of rest masses before minus after (rest energies, or MeV for helium)
}
```

`parameter` is the particle speed for annihilation, the photon energy for pair creation, and unused for helium-4. The helium-4 constants (proton 938.272 MeV, neutron 939.565 MeV, helium-4 nucleus 3727.379 MeV, the electron's 0.511 MeV for the PET remark) are named, sourced constants in the module, and a test checks that they agree with the accepted binding energy (test 18).

The module reuses `lorentzTransform` (energy as time, `pc` as position) and `timeDilationFactorFor`. Out-of-range inputs (`speed < 0` or `≥ 1`, `|passingSpeed| ≥ 1`) throw `RangeError`. `runCollisionExperiment` conserves energy and momentum **by construction of the physical rule**, so the tests also check that its results satisfy them independently (test 9).

### Sign convention and limits

- Positive speeds, momentum and positions are to the right (as in the earlier experiments). The passing observer's speed `u` is positive when they move to the right.
- A particle at rest in the lab has `pc = 0`. The "own" observer exists only for a particle with mass (`own` is null for light).

---

## Learner Controls

**Part 1**

1. **What is it?** Two presets: "a particle with mass" and "a light pulse".
2. **The particle's speed in the lab** (particle only): presets 0 (at rest), 0.3c, 0.6c, 0.8c, 0.9c, 0.99c (Decision 5).
3. **The passing observer's speed:** presets −0.8c, −0.6c, −0.3c, 0, +0.3c, +0.6c, +0.8c (Decision 5; `u = 0` makes the passing observer agree with the lab).
4. **Run:** gated on the prediction.

**Part 2** (revealed after Part 1's tutor explanation, Decision 2)

1. **The speed of each particle in the lab:** presets 0.3c, 0.6c, 0.8c, 0.9c.
2. **The passing observer's speed:** presets −0.6c, −0.3c, +0.3c, +0.6c (Decision 5).
3. **Run:** gated on the prediction.

**Part 3** (revealed after Part 2's tutor explanation)

1. **Which process:** three presets: "a particle and its antiparticle meet", "two beams of light meet", "a helium nucleus forms".
2. **The setting for the process:** for the first, the speed of each particle (0, 0.6c, 0.9c); for the second, the energy of each light beam in rest energies (0.5, 1, 2, 5); for the third, none.
3. **The passing observer's speed:** presets −0.6c, −0.3c, +0.3c, +0.6c.
4. **Run:** gated on the prediction.

---

## Prediction Activity

**Part 1.** Draft wording:

> **The question.** A particle with mass is moving past the lab. The lab measures its energy and its momentum. A passing observer, who moves differently, measures them too. Earlier, two observers measured different times and different distances between two events, but the same `time² − distance²`. What do you think the two observers find for this particle?
>
> (a) The same energy and the same momentum. (b) Different energies and different momenta, with nothing about them that they agree on. (c) Different energies and different momenta, but there is some number, worked out from the energy and the momentum, that they agree on.

(For the light pulse, the same question with "light pulse" in place of "particle with mass".) Not scored. Run stays disabled until an answer is chosen. The learner is not told which is right. Answer (c) is right at every setting offered. (a) and (b) are included because they are the natural guesses (the first, if you think energy is a fixed property; the second, if you take "everything is relative" too far).

**Part 2.** Draft wording:

> **The question.** Two identical lumps of clay, each of mass `m` (that is `m` measured when the lump is at rest), move toward each other at speed `v` in the lab, collide head-on and stick together. Energy and momentum are not lost: nothing escapes. What is the mass of the single lump that results, compared with `2m`, the two masses added?
>
> (a) Less than `2m`. (b) Exactly `2m`. (c) More than `2m`.

Not scored. Run stays disabled until an answer is chosen. Answer (c) is right at every setting offered. (b) is the natural guess, because "mass is conserved" is what we are taught in everyday life.

**Part 3.** Draft wording (one question for all three processes, with the process named):

> **The question.** {The two particles meet and turn into something else / The two beams of light meet / The two protons and two neutrons bind into a helium nucleus}. Energy and momentum are conserved. Add up the masses of the separate pieces **before**, and the masses of the pieces **after**. How do the two totals compare?
>
> (a) The total mass after is less than before. (b) The total mass is the same. (c) The total mass after is more than before.

Not scored. Run stays disabled until an answer is chosen. The right answer depends on the process, which is the point: **less** for a particle and its antiparticle turning into light, and for the helium nucleus; **more** for light making a pair (at or above the threshold); and **the same** for light below the threshold, where nothing is made. (b) is the natural guess, as in Part 2.

---

## Experiment Behavior

### Introduction: three stages, with every new term and formula explained where it is first needed (draft; the owner approves the wording, §28.1)

This experiment brings in many new words and several formulas. The rules for the introduction are therefore stricter than usual (`CLAUDE.md` §15, `AGENTS.md`):

1. **Every term is defined in plain, everyday language before it is used, at the point where the learner first needs it.** Where a term is needed only by Part 2 or Part 3, it is defined in that part's introduction, not at the top of the page.
2. **A concept comes before its formula.** Each formula is introduced only after the words it uses have been explained. The formula is then read out in plain words ("this says that..."), every symbol is named, a **worked calculation with real numbers** is given step by step, and a short note says what the formula does *not* mean.
3. **A daily-life example** (with no relativity in it) is given for each idea that is not obvious.
4. **Nothing the learner is asked to predict is revealed** (§12). The introduction gives the formulas for one observer's numbers and shows the arithmetic for one example. It does not say that other observers get the same value of `E² − (pc)²` (Part 1's prediction), what the lump's mass is (Part 2's), or how the masses compare in a reaction (Part 3's).
5. **A quick-reference panel** ("Words and formulas") stays on the page, collapsed, from the start. It lists every term and formula introduced so far in one line each, so that a learner can look one up without scrolling back. Terms from a later part appear in it only once that part's introduction has appeared.

**Stage A, at the top of the page (needed by Part 1).** Draft wording, in order:

- **The question.** Time and distance can differ between observers, but one combination, `time² − distance²`, does not (Experiment 1). This experiment asks the same question about something else about a moving thing: its **energy** and its **momentum**. Do observers who move differently agree on them? If not, is there something that they do agree on?
- **Some words we will use.** Each in plain language, with an example:
  - **Particle:** a very small piece of matter, such as an electron or a proton. In this experiment we treat it as a single point, with no size.
  - **Observer:** someone with their own ruler and synchronized clocks, as in earlier experiments. **The lab** is at rest. **A passing observer** moves past the lab. **The particle's own observer** travels along with the particle, so the particle is at rest for them.
  - **The speed of light, `c`:** about 300,000 kilometers per second. Speeds are given as a fraction of `c`: 0.6c is 60 percent of it.
  - **Time dilation factor:** from Experiment 3, the number `√(1 − v²)` that says how much a moving clock's ticking is slowed. Example: at 0.6c it is `√(1 − 0.36) = √0.64 = 0.8`, so a clock moving at 0.6c ticks at 0.8 of the usual rate. We write `D(v)` for it. It is 1 for something at rest, and it gets smaller and smaller as the speed gets closer to `c`.
  - **Mass:** how much matter a thing has, which you can also feel as how hard it is to get moving. A 5-kilogram bag of sugar is harder to push than a 1-kilogram bag. In this experiment, **the mass of a particle means the number you would find if the particle were sitting still beside you.** (Some books use the word "mass" differently, for something that changes with speed. We do not.)
  - **Energy:** the ability to make things happen, such as to heat water, to move something, or to make light. It comes in many forms. A moving car can dent a wall. Hot water can cook an egg. In everyday life energy is measured in **joules (J)**.
  - **Kinetic energy:** energy of motion. For everyday speeds it is `½ × mass × speed²`. Example: a 1000-kilogram car at 20 meters per second has `½ × 1000 × 20² = 200,000` joules. This everyday formula is correct for slow things. The experiment shows how it changes for fast ones.
  - **Momentum:** a measure of how hard a moving thing is to stop. For everyday speeds it is `mass × speed`. A 7-kilogram bowling ball rolling at 2 meters per second has `7 × 2 = 14` units; a 0.06-kilogram tennis ball flying at 30 meters per second has `0.06 × 30 = 1.8`. The heavy, slow ball is harder to stop, even though the light one moves faster.
  - **Rest energy:** the energy a particle has when it is not moving at all, its **own** energy. We use it as our unit of energy, so that a particle's rest energy is written as **1**. Energy of 2.5 means 2.5 times the particle's rest energy.
  - **Total energy:** the rest energy plus the kinetic energy.
  - **A light pulse:** a short flash of light. It carries energy and momentum, but it has no mass.
- **The rules this experiment uses.** We do not derive these here. They are the correct rules of special relativity, tested in particle accelerators (a source is still to be checked, Decision 12), and the experiment lets you see what they predict. Each is read out in words, with its symbols explained, and with a worked example:
  - **Total energy:** `E = mc² ÷ D(v)`. In words: "the total energy is the rest energy `mc²` divided by the time dilation factor." In our units, `mc² = 1`, so `E = 1 ÷ D(v)`. As the speed rises, `D` shrinks, so the energy grows. Example at 0.5c: `D = √(1 − 0.25) = √0.75 = 0.866`, so `E = 1 ÷ 0.866 = 1.155` rest energies. At `v = 0`, `D = 1`, so `E = mc²`, the **rest energy**. *What it does not mean:* it does not say that the particle's mass grows. The mass stays the number found at rest. What grows with speed is the energy.
  - **Momentum (times `c`):** `pc = (mc² ÷ D(v)) × v`. In words: "the total energy multiplied by the speed." We multiply the momentum by `c` so that it has the same units as energy, and the two can be compared. In our units, `pc = v ÷ D(v)`. Example at 0.5c: `pc = 0.5 ÷ 0.866 = 0.577`. *What it does not mean:* it is not the everyday `mass × speed`, which is the slow-speed version of it (they agree at low speed and differ at high speed).
  - **A combination of the two:** `E² − (pc)²`. In words: "square the energy, square the momentum times `c`, and subtract", the same "subtract the squares" move as in Experiment 1. Example at 0.5c: `1.155² − 0.577² = 1.333 − 0.333 = 1.000`. (The experiment asks you to predict what other observers would get.) *What it does not mean:* it is not `E² + (pc)²`. The minus sign matters, as it did in Experiment 1.
  - **What speed does another observer measure?** `v′ = (v − u) ÷ (1 − uv)`, where `v` is the particle's speed in the lab and `u` is the passing observer's speed (both fractions of `c`, in the same direction). In words: "it is almost the difference of the two speeds, but divided by a correction that keeps the result below `c`." Example: `v = 0.6`, `u = 0.3`: `(0.6 − 0.3) ÷ (1 − 0.18) = 0.3 ÷ 0.82 = 0.366`, not 0.3. If `u = v`, the result is 0: the particle's own observer finds it at rest. We will not derive this rule here. *What it does not mean:* it is not a plain subtraction, `v − u`, which would let speeds pass `c`.
  - **Energy and momentum seen by a passing observer.** The same rule that turns the lab's times and positions into the passing observer's (Experiment 3 of the first chapter and Experiment 1 of this group) turns the lab's energy and momentum into theirs, with energy playing the part of time, and `pc` the part of position. The experiment does this arithmetic for you and shows the result.
  - **Light:** for a light pulse, `E = pc` (the energy equals the momentum times `c`), and it always moves at `c`. *What it does not mean:* it does not mean that light has mass. For light, the combination `E² − (pc)²` is zero.
- **What happens.** A particle (or a light pulse) moves past the lab. Three observers (the lab, the particle's own observer, and a passing observer) each measure its energy and momentum. A diagram shows the three readings as points, and the table gives the numbers.
- **Your job.** Choose whether the object is a particle with mass or a light pulse; for a particle, choose its speed in the lab; choose the passing observer's speed; and make a prediction. You are not graded. Run stays off until you choose a prediction.
- **What we assume.** One line; steady speeds; no gravity; energy in rest energies and momentum as `pc` (and, for light, energy in units of the lab's measurement of the pulse).

**Stage B, shown when Part 2 appears (needed by Part 2).** Draft wording:

- **Why a collision.** So far we looked at one particle. Now two particles meet. This is how momentum was first understood, and it is where the everyday rule `mass × speed` is put to the test.
- **New words, each with an example:**
  - **Collision:** two things meeting. **Head-on:** meeting from opposite directions. **Stick together:** they join into one lump, as two balls of clay do.
  - **Conserved:** a quantity is conserved if its total does not change. Example: money moved between two bank accounts. The money in each account changes, but the total stays the same. **Total energy** and **total momentum** are conserved in a collision (we use this as the rule of the experiment, Decision 12). The totals add the pieces' values with their directions: a piece moving left has negative momentum, so two equal pieces moving toward each other have total momentum zero.
  - **System:** the whole group of pieces taken together, as if they were one thing. The pieces' own masses are one thing; the system's is another (it is worked out from the total energy and total momentum).
  - **The mass of a system:** `M = √(E_total² − (P_total c)²)`, the same "subtract the squares" combination as before, applied to the totals. In words: "put the total energy and the total momentum through the same combination." Example: two pieces with total energy 2.5 and total momentum 0 give `M = √(6.25 − 0) = 2.5`.
  - **Internal energy:** energy inside a thing that is not its motion as a whole. A lump of clay that gets warm has more internal energy, in the heat of its jiggling atoms.
- **A worked everyday example of conservation (momentum):** two equal billiard balls, `1` kilogram each, roll toward each other at 2 meters per second and stick. Before: `1 × 2 + 1 × (−2) = 0`. After: they stop. `0`. The total is unchanged.
- **What happens, your job and what we assume.** Two identical lumps collide head-on in the lab and stick. You choose their speed and a passing observer's speed, predict the mass of the resulting lump, and run. Nothing escapes (no light or heat leaves the lump).

**Stage C, shown when Part 3 appears (needed by Part 3).** Draft wording:

- **New words, each with an example:**
  - **Electric charge:** a property that makes things pull or push each other. The electron has negative charge, the proton positive, the neutron none.
  - **Antiparticle:** a particle with the same mass as another, but opposite electric charge. The electron's antiparticle is the **positron**. Charge is conserved too: a particle and its antiparticle have total charge zero.
  - **Photon:** here, a light pulse of a given energy, with no mass. (The quantum idea behind the word is not needed.)
  - **Annihilation:** a particle and its antiparticle meeting and turning into light. **Pair creation:** light turning into a particle and its antiparticle.
  - **Threshold:** the least energy at which something can happen. Daily-life example: to get over a 1-meter wall you have to jump at least high enough to reach the top; with less, nothing happens at all.
  - **Atomic nucleus:** the tiny, heavy core of an atom, made of **protons** (positive) and **neutrons** (no charge). **Helium-4** has two of each.
  - **Binding energy:** the energy needed to pull a nucleus apart into its separate protons and neutrons. It is also the energy released when they come together. Daily-life example: a ball in a pit. It takes energy to lift it out, and it gives up that same energy when it falls in.
  - **Mass defect:** how much less a nucleus weighs than its separate parts. (The experiment shows the amount.)
  - **Fusion:** nuclei joining into a heavier nucleus, as happens in the Sun.
  - **The electron-volt (eV):** the unit of energy used for particles: the energy an electron gains when it crosses a 1-volt battery. 1 eV is a tiny `1.6 × 10⁻¹⁹` joules. A particle of visible light carries about 2 or 3 eV. **keV** is a thousand eV, **MeV** a million, **GeV** a billion, **TeV** a million million. Particle masses are written as energy divided by `c²`: "938 MeV/c²" is the proton's.
  - **The sum of the rest masses versus the system's mass:** the first adds up the masses of the separate pieces (a light pulse counts as zero). The second is the `M` above, worked out from the pieces' total energy and momentum. The experiment compares them.
- **Formulas needed here, each in words with a worked example:**
  - **The system's mass again:** `M = √(E_total² − (P_total c)²)`.
  - **Speed from energy:** a particle with energy `E` (in its own rest energies) has `D = 1 ÷ E`, so `v = √(1 − 1 ÷ E²)`. Example, not among the choices: `E = 3` gives `D = 1/3`, so `v = √(1 − 1/9) = √(8/9) = 0.943`. It follows from `E = 1 ÷ D(v)` above.
  - **Energy released:** `(sum of rest masses before − sum after) × c²`. Example, in rest energies: if the pieces' rest masses are 3 before and 2.5 after, then 0.5 rest energies are released.
- **What happens, your job and what we assume.** You choose one of three processes and its setting, predict how the total of the rest masses compares before and after, and run. The helium-4 process is energy accounting only (Decision 16).

**The "Words and formulas" quick-reference panel** (collapsed) lists, one line each: particle, observer, `c`, time dilation factor `D(v)`, mass, energy, kinetic energy, momentum, rest energy, total energy, light pulse, `E = 1 ÷ D(v)`, `pc = v ÷ D(v)`, `E² − (pc)²`, `v′ = (v − u) ÷ (1 − uv)`, `E = pc` for light (Stage A); collision, conserved, system, internal energy, system mass `M` (Stage B); charge, antiparticle, photon, annihilation, pair creation, threshold, nucleus, proton, neutron, binding energy, mass defect, fusion, electron-volt and its multiples, `v = √(1 − 1 ÷ E²)`, energy released (Stage C).

**Check list for the introduction** (used in the review): every term in the learning objectives appears in the list above, each defined before use; each formula in "Physics Model" appears with its symbols named, a plain-language reading, a worked example and a note of what it does not mean; no introduction text states the result of the prediction of its part; a term used first in the tutor (for example "invariant") is defined there, in plain language, before use.


### Display, Part 1

An animated **energy-momentum diagram** plus bars, following §14 "Animated Diagrams":

1. **Labeled components on the canvas:** the two axes (`pc` across, `E` up, both in rest energies), the **curve** of all the (momentum, energy) pairs that a particle of this mass can have (for the particle), or the **two straight 45-degree edges** (for light), the **lab's point**, the **particle's own point** (at `pc = 0`, `E = 1`, the bottom of the curve), the **passing observer's point**, and an **arrow from the lab's point along the curve to the passing observer's point** during the run.
2. **A visible contrast between what differs and what does not.** The three points sit at *different* heights and *different* places across (energy and momentum differ), yet all lie on the *same curve*, whose bottom point is the particle's own reading. The learner sees "different numbers, same curve". For light the points slide along the 45-degree edge, where `E = pc`, and stay on it. Differences are shown by labels and by shapes (solid, hollow and diamond markers), not by colour alone.
3. **Bars** under the diagram: for each observer, the energy `E`, the momentum `pc` and the invariant `E² − (pc)²`, on one scale, so the learner sees the first two change and the third not.
4. **The "Words and formulas" panel** (collapsed, see "Introduction") stays above the diagram.
5. **A "How to read these pictures" caption** matching the pattern of Experiment 4: each picture named, each part listed, a step-by-step walk-through of the animation, a worked moment with numbers that are not among the presets, and a "what to look for" list.

### Run, Part 1

A playback of about 12 seconds (the length only sets how fast the result is shown, §11):

1. The lab's point appears, with its numbers. The particle's own point appears (for a particle).
2. The passing observer's speed sweeps up from 0 to the chosen `u`, and the passing observer's point slides along the curve (or the light's edge) from the lab's point to its final place. The bars update as it goes.
3. When the run ends, all three points, the curve, and the final bars stay on screen, and the **energy ledger** appears: the rest energy, the kinetic energy and the total, with the kinetic energy next to Newton's `½mv²`.

Playback speed does not change the result (§11).

### Display and run, Part 2

1. **Before the collision (lab):** two circles (lumps) with arrows for their velocities, each labeled with its energy and momentum.
2. **After the collision (lab):** one larger circle at rest, labeled with the energy, the momentum (zero) and the **mass** `M`, drawn beside a bar for `2m` so that the extra is visible.
3. **The same two moments, as the passing observer measures them:** the same lumps with their different speeds, energies and momenta, and the totals before and after.
4. **A conservation panel:** for each observer, total energy before and after, and total momentum before and after, with a mark that says they are equal.
5. **A "the everyday rule" panel:** for the passing observer, `m × (sum of speeds)` before and after, showing that they are *not* equal, and the relativistic momentum totals showing that they are.
6. A caption in the Experiment 4 pattern, and a playback of about 12 seconds: before, the collision, after, for the lab and then for the passing observer.
7. **The whole-system panel:** the system's mass, before (two moving particles) and after (one lump), shown as equal, next to the bars for the sum of the parts' masses, `2m` before and `M` after, shown as different.

### Display and run, Part 3

1. **Before and after, in the lab:** pictures of the pieces (two particles; two light pulses; four separate particles) and what they become (two light pulses; a pair of particles, or "nothing made" below the threshold; one nucleus plus light), each piece labeled with its energy, momentum and rest mass. Light pulses are drawn as arrows with no mass, so that "no mass" is visible and not only written.
2. **A mass ledger:** two bars, the **sum of the rest masses** before and after (different), and two bars, the **system's mass** before and after (the same). The released or absorbed energy is written between them.
3. **The same moments, as the passing observer measures them,** with the totals, and a conservation panel as in Part 2.
4. For the helium nucleus, the numbers are in MeV and the parts are drawn at rest; for annihilation at rest and for the threshold case, the pieces are drawn at rest.
5. A caption in the Experiment 4 pattern, and a playback of about 12 seconds: before, the reaction, after, for the lab and then for the passing observer. Below the pair-creation threshold the playback shows the two beams passing through each other, with the words "no pair can be made".

---

## Results Display

Shown only when the run ends. Values only, with plain labels (neutral; the explanation comes from the tutor, §12).

**Part 1** (particle):
- the chosen particle speed and passing observer's speed, and the learner's prediction as a record (not marked right or wrong);
- a table, one row per observer (the lab, the particle's own observer, the passing observer): the speed they measure for the particle, the energy `E`, the momentum `pc`, and `E² − (pc)²`, with a one-line note under it saying what each column is;
- the energy ledger: rest energy, kinetic energy, total, and Newton's `½mv²` beside it;
- the bars drawing, as above.

**Part 1** (light): the same table with two rows (the lab, the passing observer) and the invariant (zero) and the speed (1) in every row. No own-observer row, with the note that no observer can ride along with light.

**Part 2:**
- the chosen speed and passing observer's speed, and the learner's prediction as a record;
- the lump's mass `M` compared with `2m`, and the extra mass;
- a conservation table for each observer: total energy before and after, total momentum before and after, the difference (zero);
- a "the everyday momentum" table for the passing observer: before, after, difference (not zero);
- the drawing.

**Part 3:**
- the chosen process, its setting and the passing observer's speed, and the learner's prediction as a record;
- for each observer, a table of the total energy and total momentum before and after, and the difference (zero);
- the **sum of the rest masses** before and after, the **system's mass** before and after, and the energy released (or absorbed), with the units stated (rest energies, or MeV for helium-4, and for helium-4 the percentage);
- for pair creation below the threshold, the words "no pair can be made" with the system's mass and the threshold;
- the drawing.

---

## Expected Observations

- **Part 1, particle:** for every preset, the lab's, the own observer's and the passing observer's `E` and `pc` differ, but `E² − (pc)²` is 1.000 for all three. The own observer's `pc` is 0 and `E` is 1 (the lowest of the three). A particle at rest in the lab (`v = 0`) has `E = 1`, `pc = 0` in the lab.
- **Part 1, light:** the invariant is 0.000 and the speed is 1.000 for both observers. The passing observer's energy is lower for `u > 0` and higher for `u < 0`.
- **Part 1, ledger:** `KE` is close to `½v²` at 0.3c (ratio 1.07), and much larger at 0.9c (3.2 times) and at 0.99c (12.4 times).
- **Part 2:** the lump's mass is more than `2m` at every preset (2.10, 2.50, 3.33, 4.59 times `m`). Energy and momentum totals match before and after for every observer. The everyday `m × (sum of speeds)` does not match for the passing observer (except in the trivial `u = 0` case).

- **Part 2, whole system:** the system's mass is the same before and after (2.10, 2.50, 3.33, 4.59 times `m`), while the sum of the parts' masses changes from `2m` to that.
- **Part 3, annihilation:** the sum of the rest masses falls from 2 to 0; the system's mass is unchanged; at `v = 0` each photon has energy 1 (0.511 MeV for the electron).
- **Part 3, pair creation:** below `E_γ = 1`, no pair; at 1, a pair at rest; at 2 and 5, a pair at `0.866c` and `0.980c`; the sum of the rest masses rises from 0 to 2; the system's mass is unchanged.
- **Part 3, helium-4:** `28.295 MeV` released, 0.753 percent of the parts' mass.
- In every process, for every passing speed, energy and momentum totals match before and after.

---

## Expected Learner Understanding

The learner should be able to say that two observers can measure different energies and momenta for the same particle, but that `E² − (pc)²` is the same for everyone, and that this number is the particle's mass; that a particle at rest has energy `mc²`; that the energy needed to speed a particle up grows without limit as it nears the speed of light; that light has energy and momentum but no mass; and that in a collision or reaction energy and momentum are conserved for everyone, while the sum of the parts' masses is not: stuck-together lumps are heavier than the sum of their masses, a particle and its antiparticle can turn entirely into light, light can make particles if its energy is at least the threshold, and a nucleus is lighter than its parts by the energy released when it formed. They should be able to say that the mass of the whole system stays the same, and that mass is not "turned into" energy but energy moves from one form to another. They need not yet be able to derive the formulas, to handle motion in more than one dimension, or to use the formulas for forces and accelerations.

---

## New Concepts Introduced

**Energy**, **momentum**, **kinetic energy**, **rest energy** and **total energy** as physical quantities with observer-dependent values; **mass as an invariant** (`E² − (pc)² = (mc²)²`); **conservation** of energy and momentum for all observers; the **energy ledger** (rest plus kinetic); the **speed limit as an energy cost** (infinite energy to reach `c`); **light as massless** (`E = pc`, no rest frame, energy changes with the observer); the **lump that is heavier than its parts**; the **mass of a system** as distinct from the sum of the masses of its parts; the **antiparticle**; **annihilation** and **pair creation**, with the **threshold**; and **binding energy** and the **mass defect** of a nucleus. The relativistic combination of speeds `(v − u) ÷ (1 − uv)` appears as a displayed result, not as a derived formula (Decision 6).

---

## Relationship to Previous Experiments

- **This group's Experiment 1 (the interval):** the same "subtract the squares" shape, `time² − distance²` there and `E² − (pc)²` here. The transformation is the same one. The "stick on a table" comparison of Experiment 1's summary has a close analogue here: the invariant is the part of the picture that does not change when you change your point of view.
- **This group's Experiment 2 (light cones):** the 45-degree edges, here drawn in energy-momentum space as the line where a light pulse sits (`E = pc`); particles with mass lie on the curve inside that cone.
- **This group's Experiment 3 (cause before effect):** the speed limit, here as an energy cost.
- **This group's Experiment 4 (what you see is the past):** the Doppler-like energy shift for light appears only as a result; the ship's travel-time effect is not repeated.
- **First chapter, Experiment 3 (the moving clock):** the time dilation factor `√(1 − v²)` is reused, and `E = mc² ÷ (time dilation factor)` connects energy to something the learner already knows.
- **First chapter, Experiment 5 (invariant light speed):** the speed of light is the same for all observers, here as `v′ = 1` for every light pulse.
- **Gravity chapter (Experiments 6 and 7) and Black Holes Experiment 8 (spinning black holes):** both mention `E = mc²` only as a stated fact (rest-mass energy). This experiment is where it is first explained.
- **Gravitational Waves Experiment 5 and Black Holes Experiment 7:** the energy shift of light for a moving observer is the same Doppler factor, here as a result, to be taken up properly in a later experiment.

---

## Relationship to Later Experiments

Candidates, none approved: **the relativistic Doppler effect** (the energy shift of light here is its core, so that experiment could use it directly), **adding velocities relativistically** (here `(v − u) ÷ (1 − uv)` is only displayed), **aberration**, **particle physics at higher energies** (many particles made at once, which needs more than the one-dimensional picture used here), **fission and the other nuclear reactions in detail**, and **neutrinos and the weak force** (left out of Part 3 on purpose, Decisions 11 and 16), **forces and acceleration in special relativity**, and **a fast object looking rotated**. Each would need its own proposal and approved specification (§23 Stages 1 to 4).

---

## Required Physics Tests

Tests verify the physics, not just that functions exist (§10). All are for `src/physics/energyMomentum.ts`.

1. `particleReading` matches the hand-calculated table for 0.3c, 0.6c, 0.8c, 0.9c and 0.99c (`E`, `pc`) and at `v = 0` (`E = 1`, `pc = 0`).
2. The invariant `E² − (pc)²` is 1 (to a stated tolerance) for every observer, for every particle speed in a spread (0, 0.01c to 0.99c) and every passing speed in a spread (−0.99c to +0.99c).
3. `readingFor` equals `lorentzTransform({ time: E, position: pc }, u)` (the same transformation as for time and position).
4. The speed a passing observer measures, `pc ÷ E`, equals `(v − u) ÷ (1 − uv)` and is below 1 for every pair of speeds below 1. The own observer (`u = v`) has `E = 1` and `pc = 0`.
5. Light: the invariant is 0 for every observer; the speed is 1 for every observer; the transformed energy equals `E × √((1 − u) ÷ (1 + u))` for the pulse moving right and `√((1 + u) ÷ (1 − u))` for the pulse moving left; the own reading is null.
6. Kinetic energy: `kineticEnergy(v) = E − 1` to a stated tolerance, computed by the stable form (compared at `v = 10⁻³`, `10⁻⁵` and `10⁻⁷` with `½v²`, and the ratio tends to 1 as `v → 0`). `kineticEnergy(v) > newtonKineticEnergy(v)` for every `v > 0`. `kineticEnergy` grows without bound as `v → 1` (for example above 20 at `v = 0.999`, and above 200 at `v = 0.99999`), and the ratio to `½v²` is strictly increasing in `v`.
7. Collision, lab frame: total momentum before is 0, the lump is at rest, `lumpMass = 2 ÷ D(v)` (in units of `m`), and `lumpMass > 2` for every `v > 0` with `lumpMass → 2` as `v → 0`. `extraMass = lumpMass − 2` equals the total kinetic energy (in rest energies).
8. Collision, passing observer: total energy before equals total energy after, and total momentum before equals total momentum after, to a stated tolerance, for every `v` in a spread and every `u` in a spread. The lump's mass, `√(E′² − (p′c)²)` of the totals, is `lumpMass` for both observers.
9. The conservation in test 8 is **checked independently of how `runCollisionExperiment` builds the "after" values** (the test builds the lump by transforming `(M, 0)` and compares with the transformed total of the "before" particles), so that the test would fail if the module simply copied the "before" totals.
10. The everyday momentum: for `v = 0.6`, `u = 0.3`, `m × (v₁′ + v₂′) ≈ −0.397` before and `2m × (−u) = −0.6` after (not equal); at small speeds the difference shrinks toward zero; at `u = 0` it is zero.
11. The everyday case: two 1-kilogram lumps at 100 m/s each give an extra mass of `1.11 × 10⁻¹³ kg` (to three significant figures), computed from the total kinetic energy `10,000 J` divided by `c²`, with `c = 299,792,458 m/s` stated as a constant.
12. Real-world checks used by the tutor: a proton of kinetic energy 6.5 TeV and rest energy 938.272 MeV has `E ÷ (mc²) = 6927.6` (so `E` is 6927.6 rest energies) and a speed below 1 by `1.04 × 10⁻⁸` (the test states the value of the constants, Decision 9).
13. Out-of-range inputs throw `RangeError` (`speed < 0` or `≥ 1`, `|passingSpeed| ≥ 1`, a non-finite value).
14. The results are a pure function of the inputs, so playback speed cannot change them (§11).
15. System mass: for every collision and every reaction, `systemMassBefore = systemMassAfter` for the lab and for the passing observer, and the value is the same for both observers. For Part 2, the system's mass before the collision (two moving particles) equals `lumpMass`.
16. Annihilation: the photons each have `E = 1 ÷ D(v)` and `pc = ±E`, the sum of the rest masses falls from 2 to 0, total energy and total momentum are conserved for every `u` in a spread, and at `v = 0` each photon has one rest energy (with the electron's `0.511 MeV` as a named constant, the photon energy is `0.511 MeV`). The passing observer's photon energies equal `E √((1 − u) ÷ (1 + u))` and `E √((1 + u) ÷ (1 − u))`, and the example at `u = 0.3` matches the table.
17. Pair creation: `created` is false for `E_γ < 1` and true for `E_γ ≥ 1`; at `E_γ = 1` the pair is at rest; above it `v = √(1 − 1 ÷ E_γ²)` (0.866 at 2, 0.980 at 5) and each product has `E = E_γ`; the sum of the rest masses is 0 before and 2 after; total energy and momentum are conserved for every `u`; the threshold is exactly where `systemMass = 2` (the test would fail if a pair could be made below it).
18. Helium-4: `2 × 938.272 + 2 × 939.565 − 3727.379` equals `28.295` MeV to a stated tolerance and agrees with the accepted binding energy `28.295674 MeV` (so the three mass constants are consistent with each other and with the source); the fraction of the parts' mass is `0.753` percent (the sources say about `0.75`).
19. The Sun's figure used in the tutor: `3.828 × 10²⁶ W ÷ c²` is `4.26 × 10⁹ kg/s`, within the sources' "about 4 million tonnes per second" (the tolerance is stated; the nominal luminosity is a named constant).
20. Conservation is checked **independently** of how `runReactionExperiment` builds the "after" pieces: the test sums the pieces' energies and momenta itself and compares with the transformed totals of the "before" pieces.

---

## AI Tutor Behavior

Following the established sequence (observe, compare with the prediction, a conceptual question, then the explanation), **once for each part** (Decision 2). Draft only; the owner approves the wording (§28.1). The explanations must use the learner's own numbers from the run, simple math and daily-life examples (§15), and must keep terms defined in plain language.

### Part 1 tutor

1. **Observe.** "Look at the table and the diagram. How did the energy and the momentum differ between the observers? Was anything the same?"
2. **Compare with the prediction.** Neutral: the learner's choice (a, b or c) versus the table.
3. **Conceptual question.** "The own observer is riding along with the particle. Why do you think they measure zero momentum? And what is their energy, compared with the lab's?"
4. **Explanation**, in numbered paragraphs, kept short and concrete:
   - **1. What the table shows,** in the learner's own numbers (for example `v = 0.6c` and `u = +0.3c`: the lab finds `E = 1.250`, `pc = 0.750`; the passing observer finds `E′ = 1.075`, `p′c = 0.393`; both give `1.5625 − 0.5625 = 1` and `1.1545 − 0.1545 = 1`).
   - **2. The invariant is the mass.** A number that every observer agrees on is called an **invariant** (this word is defined here, in plain language, before it is used again). `E² − (pc)² = (mc²)²`, the same shape as the interval of Experiment 1. A comparison with the stick on a table: turning it changes its east-west and north-south parts, not its length (with the usual caveat that the comparison is not exact, because the invariant subtracts squares instead of adding).
   - **3. A particle at rest has energy.** With `pc = 0`, the invariant becomes `E = mc²`, the rest energy. Daily-life example: a hot cup of tea. Its heat is energy inside it, and, because of the rule above, that energy counts toward its mass, by an amount far too small to weigh.
   - **4. Energy and the speed limit.** Total energy is the rest energy divided by the time dilation factor, so as `v` approaches `c` the factor goes to zero and the energy grows without limit. The ledger table (kinetic energy versus Newton's `½v²`: ratios 1.07, 1.39, 2.08, 3.20, 12.4 for 0.3c, 0.6c, 0.8c, 0.9c, 0.99c), with a worked example: going from 0.99c to 0.999c needs the kinetic energy to rise from 6.09 to 21.4 rest energies (computed from `1 ÷ D − 1`), more than three times as much, for a speed gain of less than 1 percent. A daily-life comparison: a hill that keeps getting steeper the higher you climb, so that the last metres cost more than all the rest put together.
   - **5. Light.** The light pulse has `E = pc`, so its invariant is zero: it has no mass. Every observer finds its speed to be 1. No observer can ride along with it (there is no frame where `pc = 0`). Its energy differs between observers by the factor `√((1 − u) ÷ (1 + u))` (computed example: at `u = 0.6c` the factor is `0.5`, so the passing observer finds half the lab's energy). A later experiment treats this shift as the Doppler effect.
   - **6. A remark about the word "mass".** Many books say "mass increases with speed". That uses an older meaning of the word. In modern physics, and in this experiment, the mass is the invariant, and it does not change with speed. What grows with speed is the energy (a source check is needed, Decision 12).
   - **7. How big is this in the real world,** with sourced numbers (Decision 9): the electron's rest energy is 0.511 MeV and the proton's is about 938 MeV (a "MeV" is a unit of energy used for particles, one million electron-volts). At the Large Hadron Collider, protons were accelerated to 6.5 TeV (6.5 million million electron-volts), which is about 6,900 times the proton's rest energy; their speed is below the speed of light by about one part in a hundred million. And one kilogram is worth about `9 × 10¹⁶` joules as rest energy.
   - **8. What was shown, and what was not.** One particle at a time, one line, one passing observer; the formulas were not derived (they are tested in accelerators, Decision 12).
5. **Limits.** The tutor says what was and was not shown (Part 1 does not show forces, acceleration or collisions; Part 2 follows).

### Part 2 tutor

1. **Observe.** "Look at the conservation panel. Compare the totals before and after for the lab and for the passing observer."
2. **Compare with the prediction.** Neutral: the learner's choice versus the lump's mass in the results.
3. **Conceptual question.** "The two lumps were moving, and the final lump is at rest in the lab. Where did the energy of their motion go?"
4. **Explanation:**
   - **1. What the table shows,** in the learner's own numbers (for example `v = 0.6c`: each lump has `E = 1.25`, so the total is `2.50`; the lump at rest has `E = 2.50`, so its mass is `2.5 m`, not `2 m`; for the passing observer at `+0.3c`, the totals are `2.621` before and after).
   - **2. Where the energy goes.** The lumps' energy of motion becomes internal energy of the lump (heat, in the case of clay), and internal energy counts toward mass. So the lump is heavier than the two lumps added, by `0.5 m`, exactly the kinetic energy that disappeared (`2 × 0.25`).
   - **3. Why energy and momentum are conserved for everyone, but the sum of the masses is not.** The mass of a *single object* is the invariant of its own energy and momentum. A lump made from two objects is a different object. What is conserved is the *total* energy and momentum, and so the mass of the whole *system*, taken together: here it was `2.5 m` before the collision (two moving lumps, total energy 2.50, total momentum 0) and `2.5 m` after (one lump at rest). The *sum of the parts' masses* changed, from `2 m` to `2.5 m`.
   - **4. The everyday momentum fails.** The sum `m × v` with the passing observer's measured speeds is `−0.397 m` before and `−0.6 m` after (`v = 0.6`, `u = 0.3`): not conserved. The relativistic momentum is conserved. This is why the formula for momentum has the extra factor. A daily-life example: two billiard balls colliding. At everyday speeds the failure is too small to notice.
   - **5. An everyday number.** Two 1-kilogram clay lumps colliding at 100 m/s each: the energy of motion is `2 × ½ × 1 × 100² = 10,000 joules`; divided by `c²` (`9 × 10¹⁶`), this is `1.1 × 10⁻¹³ kilograms`, a tenth of a nanogram added to a 2-kilogram lump, far too little for any scale (the "far too little" claim needs a source check, Decision 12).
   - **6. A remark on a common slogan.** "Mass turns into energy" is a poor description. What happens is that energy moves between forms, and total energy is conserved. When internal energy changes, the mass changes with it. Part 3 shows the famous cases, where the change is large.
   - **7. What was shown, and what was not.** One collision of two identical lumps, head-on, in one dimension, with nothing escaping; no forces or accelerations; no particles created or destroyed.
5. **Limits.**

### Part 3 tutor

1. **Observe.** "Look at the mass ledger. What happened to the sum of the masses of the pieces? What happened to the mass of the whole system?"
2. **Compare with the prediction.** Neutral: the learner's choice versus the ledger for this process.
3. **Conceptual question.** "Energy and momentum are conserved here. Where did the energy go (or where did it come from) when the sum of the masses changed?"
4. **Explanation**, in numbered paragraphs:
   - **1. What the ledger shows,** in the learner's own numbers (for example, an electron and a positron at rest: total energy 2 rest energies, total momentum 0; afterwards two light pulses of 1 rest energy each, going opposite ways; sum of the masses 2 before and 0 after; the system's mass 2 before and after).
   - **2. Why two lights, not one.** After the particles meet, the total momentum is zero. A single light pulse has momentum, so one pulse cannot be all there is. Two pulses of equal energy going opposite ways have zero total momentum. (Source: momentum conservation, Decision 15.) Daily-life example: two ice skaters pushing apart from rest, who must move in opposite directions so that the total "oomph" stays zero.
   - **3. A system of lights has mass.** Each light pulse has no mass, but the two together have total energy 2 and total momentum 0, so as a system their mass is `√(2² − 0²) = 2` rest energies, the same as the electron and positron had. (A source says the same of the two photons from a neutral pion.) The mass of the whole system never changed; what changed is that it is now carried by light.
   - **4. PET scans.** In a PET scan (a medical imaging technique), a positron from a tracer meets an electron in the body and they turn into two 511 keV light pulses going in almost exactly opposite directions. The two detectors that catch them mark a line, and that is how the scan locates the tracer. 511 keV is the rest energy of the electron: exactly the case you ran at `v = 0`.
   - **5. Light makes matter, but only above a threshold.** Light of energy 1 rest energy each (a total of 2) is exactly enough for a pair at rest, and no more. Below that, the system's mass is less than `2m`, and no pair can be made, because the system's mass cannot change. Above it, the extra goes into the pair's motion (at 2 each, a speed of 0.866c; at 5, 0.980c). In real life, a single light pulse cannot make a pair in empty space; the pair needs a nearby nucleus to take up the recoil, or a second pulse to meet it. The experiment used two pulses.
   - **6. A helium nucleus is lighter than its parts.** Two protons and two neutrons weigh `3755.674 MeV/c²` apart and `3727.379 MeV/c²` together, a difference of `28.295 MeV/c²`: 0.753 percent. When they bind, `28.3 MeV` of energy leaves, as light and fast particles. That is the "binding energy". A daily-life comparison: a ball dropped into a pit gives up energy as it falls, and it takes that same energy to lift it out again.
   - **7. The Sun.** The Sun fuses hydrogen into helium, and about 0.7 percent of the mass of the hydrogen is released as energy, about 4 million tonnes of mass every second (out of about 600 million tonnes of hydrogen fused). That is why the Sun shines.
   - **8. What was shown, and what was not.** One kind of reaction at a time, in one dimension; the helium nucleus shown as accounting only, not as a process; no neutrinos or electric charge; no explanation of why the strong force binds a nucleus.
5. **Limits.**

The tutor must not invent physics, change results, or contradict the engine (§13).

---

## Real-World Facts Used, and Source Status

Only the tutor uses real-world figures; the experiment itself runs on the model.

| Statement | Value | Status |
|---|---|---|
| Electron rest energy | 0.511 MeV (0.510998950 MeV in CODATA) | Confirmed by search, 2026-10-14 (CODATA values quoted in several physics sources; a primary check on the CODATA page itself is still open) |
| Proton rest energy | about 938.272 MeV | Same |
| LHC proton energy | 6.5 TeV per beam (2015 to 2018 running) | Confirmed by CERN pages, 2026-10-14. The speed given by CERN (0.999999991 c) is for the design energy of 7 TeV; at 6.5 TeV the computed speed is `1 − 1.04 × 10⁻⁸`, which the tutor states as "about one part in a hundred million below the speed of light" |
| `E ÷ (mc²)` for a 6.5 TeV proton | 6927.6 (computed from 6.5 TeV ÷ 938.272 MeV) | Computed, and tested (test 12) |
| One kilogram as rest energy | `c² = 8.99 × 10¹⁶ J` per kg | Computed from `c = 299,792,458 m/s`, a defined constant |
| Mass in modern physics is the invariant; "relativistic mass" is deprecated | | Supported by the DESY physics FAQ on mass and by Okun's campaign against the concept, 2026-10-14 (search results only; the pages were not read in full) |
| Helium-4 binding energy | 28.295674 MeV (the "conventionally accepted figure"); the nucleus is about 0.0303 u lighter than two protons and two neutrons | Confirmed by search (San José State University pages on helium-4), 2026-10-14 |
| Helium-4 nucleus mass `3727.379 MeV/c²`, neutron `939.565 MeV/c²` | | **Confirmed by search, 2026-10-15:** CODATA 2022 gives the neutron mass energy equivalent as 939.565 421 94 MeV and the alpha particle (the helium-4 nucleus) as 3727.379 4118 MeV (via search results, from the CODATA 2022 paper, arXiv 2409.03787; the paper itself was not opened). They are also consistent with the binding energy and the proton mass (`2 × 938.272 + 2 × 939.565 − 3727.379 = 28.295`) |
| Electron and positron annihilation: two 511 keV photons in opposite directions, because of momentum conservation; PET scans use this | | Confirmed by search (PET physics notes and papers), 2026-10-14 |
| Pair production threshold: `2 × 511 keV = 1.022 MeV`; a photon must be near a nucleus, or collide with another photon, to conserve momentum | | Confirmed by search (Wikipedia and physics notes), 2026-10-14. The two-photon case is the one used |
| The invariant mass of a two-photon system is not zero (for the neutral pion's decay it equals the pion's mass) | | Confirmed by search, 2026-10-14 |
| The Sun converts about 4 million tonnes of mass to energy per second, about 0.7 percent of the hydrogen fused; about 600 million tonnes of hydrogen per second | | Confirmed by search (several astronomy course notes), 2026-10-14. The 4.26 × 10⁹ kg/s from the nominal solar luminosity `3.828 × 10²⁶ W` is computed, and the luminosity value is from memory (Decision 12). A further search on 2026-10-15 found 4.3 to 4.7 million tonnes per second quoted, which fits "about 4 million"; it did not re-find the 600 million tonnes of hydrogen per second. The figure 26.7 MeV per helium nucleus is **not used**, because it was not confirmed |
| The electron-volt: the energy gained by an electron crossing 1 volt; `1 eV = 1.602 × 10⁻¹⁹ J` (an exact value in the SI); visible light carries about 2 to 3 eV | | The SI definition (`1 eV = 1.602176634 × 10⁻¹⁹ J`, exact) and visible light at about 1.6 to 3.1 eV were confirmed by search on 2026-10-15; the text says "about 2 or 3 eV" |
| `E = (time dilation factor)⁻¹ mc²`, `p = (time dilation factor)⁻¹ mv`, `E² = (pc)² + (mc²)²`, and the formulas have been tested in particle accelerators | | Textbook special relativity. The phrase "tested in accelerators" has no source check yet (Decision 12) |

---

## Decisions Needing Human Review

1. **Is this the right next experiment?** Default: yes, as a comprehensive experiment, at the owner's request, in place of the roadmap's aberration (item 5). Alternatives: velocity addition first (smaller, 1D, and it would let Part 2 derive the speeds it now only displays); the Doppler effect (close to Experiment 4); aberration (needs two dimensions); stop the group at Experiment 4.
2. **One experiment with three parts, three tutor conversations and a three-stage introduction.** **Decided by Claude at the owner's delegation (2026-10-14): three tutors**, one for each part, rather than one or two. Reasons: (i) each part has its own prediction and results, and the project's cycle is predict, run, observe, explain (`PROJECT.md` §3), so each prediction needs its own explanation while it is fresh; (ii) the parts teach different things (the invariant and the speed limit; conservation and the system's mass; creation, destruction and nuclear binding), and one final tutor would be very long and would ask the learner to recall Part 1 after two more experiments; (iii) two tutors would still put two quite different sets of ideas (Parts 2 and 3) into one conversation; (iv) it matches the three-stage introduction, so each new set of terms and formulas is explained just before it is needed and the matching tutor revisits only those. Each tutor keeps the usual sequence of observe, compare with the prediction, one conceptual question, then the explanation. Consequences, for the owner to know: the experiment is long; a learner who leaves part-way starts again (switching chapters resets it, as for all experiments); the completion check mark is saved when Part 3's playback ends (Decision 18), and the "explained" mark and the chapter summary when Part 3's tutor reaches its explanation. Alternatives considered: two separate experiments (this one and a follow-up for Part 3); one tutor at the end covering all.
3. **The meaning of "mass".** Default: only the invariant; one short remark that some books use the word differently, so that the learner is not confused by a book or video. Alternative: leave out the remark, to avoid raising a term that the learner has not met.
4. **Units.** Default: energy in "rest energies" (so the particle's rest energy is 1) and momentum as `pc` in the same units; for light, in lab energies. Alternative: a real particle (the proton) with energies in GeV and a short introduction to the electron-volt. This is more concrete but needs more setup.
5. **Presets.** Defaults as in "Learner Controls". Part 1 speeds include 0 (at rest) so the learner can see `E = mc²` directly, and 0.99c to show the energy cost. The passing speeds go to ±0.8c in Part 1 and ±0.6c in Part 2. Alternative: fewer presets.
6. **Show the speed a passing observer measures, `(v − u) ÷ (1 − uv)`.** Default: yes, as a displayed result with a one-line note that it is not `v − u` and that it stays below `c`; it is not derived (the first chapter excluded relativistic velocity addition, and this decision partly opens it). Alternative: leave out the speed column. This is the owner's decision because it touches an excluded topic.
7. **Include the light pulse.** Default: yes, as a choice in Part 1, with its energy factor shown as a result. Alternative: leave it to a later experiment (the Doppler effect).
8. **The introduction's worked example.** Default: a particle at 0.5c with `E = 1.155`, `pc = 0.577` and `E² − (pc)² = 1`, which shows the numbers for one observer but not that others agree. Alternative: show only `E = 1 ÷ D(v)` and `pc = v ÷ D(v)` with no invariant arithmetic, so that nothing about the answer is shown (§12).
9. **Real-world numbers.** Default: the electron and proton rest energies, the LHC's 6.5 TeV, and 1 kg ≈ `9 × 10¹⁶ J`, all in the tutor only, with the sources above. Alternative: leave the real-world figures out.
10. **The collision.** Default: two identical particles, head-on, speed `v` each in the lab, perfectly sticking. Alternatives: an elastic collision (no change of mass, so it would not show the mass idea), or a decay (a particle splitting in two, which needs the mass to go the other way).
11. **Nuclear reactions and particles created or destroyed.** Decided by the owner on 2026-10-14: **include them.** They are Part 3 (annihilation, pair creation, helium-4 binding), with the facts source-checked as far as search allows (see the table). This replaces the earlier default of leaving them out.
12. **What would be left for a primary-source check.** The formulas are standard, and the tests check their internal consistency (the transformation, the invariant, conservation). Added by Part 3: the helium-4 nucleus and neutron masses (from memory, internally consistent with the confirmed binding energy), the nominal solar luminosity, the claim that annihilation at rest gives exactly two photons "in almost exactly opposite directions" (confirmed for PET, but the model treats it as exact), and the claim that a particle and its antiparticle have the same mass and opposite charge. Still unchecked from before: the statement that they have been tested in particle accelerators; that a gain of about a tenth of a nanogram in a 2-kilogram lump is too small to weigh; the CODATA values on the CODATA page itself; the DESY and Okun statements on "relativistic mass", which were seen only as search results; and the choice to treat the conservation of energy and momentum as the starting rules of Part 2 and not derive them.
13. **Name of the experiment.** Default: "Energy, Momentum and Mass: What Do All Observers Agree On?" as the learner-facing title. The owner may prefer another.

14. **Antiparticles.** Default: introduce the antiparticle in one plain sentence (same mass, opposite charge; the positron is the electron's) and use the real names (electron, positron) with the real rest energy `0.511 MeV` in the tutor only. Alternative: a generic "particle and antiparticle" with no real names.
15. **Why two photons.** Default: the tutor explains it by momentum conservation (the total momentum after the meeting is zero, so a single pulse is impossible), with the skaters example, and notes that real pair production from one photon needs a nucleus or a second photon. Alternative: say only "two pulses" with no reason.
16. **The helium-4 process as accounting only.** Default: yes, stated plainly, because the real fusion happens in several steps and also releases neutrinos, which the experiment does not model. The released energy is drawn as two back-to-back light pulses only so that the accounting balances. Alternative: leave helium-4 out of the interactive part and mention it only in the tutor.
17. **The Sun.** Default: the tutor states the Sun's roughly 4 million tonnes of mass per second and the 0.7 percent, as sourced facts, not as part of the model. Alternative: leave the Sun out.

18. **The staged introduction and the reference panel.** Default: three stages (A at the top, B when Part 2 appears, C when Part 3 appears), with a collapsed "Words and formulas" panel kept on the page, so that every term and formula is explained where it is first needed and can be looked up later. This is how the owner's request ("many new terms and formulas, clearly explained in the intro") is met without a single enormous introduction. Alternatives: one long introduction at the top (simpler, but it defines Part 3's terms before the learner has a reason to care, against `CLAUDE.md` §15); stage A and B together. Also for the owner: **the formulas for one observer (`E = 1 ÷ D(v)`, `pc = v ÷ D(v)`) and the rest energy `E = mc²` at `v = 0` are given in the introduction**, because the learner cannot read the table without them. This shows that a particle at rest has energy, which is one of the things the experiment teaches. The prediction itself (whether observers agree on anything) is not given away. **Completion:** the completion mark is saved when Part 3's playback ends.

---

## Success Criteria

1. The physics model gives, for each preset, each observer's energy, momentum, speed and invariant, the kinetic-energy ledger, and the collision's before and after for two observers, and the numbers agree with the tables in "Physics Model" (to a stated tolerance).
2. The learner predicts before each run; each Run requires a prediction.
3. The Part 1 diagram shows the three observers' points at different places on **one** curve (or edge, for light), each labeled, in a way that does not rely on colour alone; the bars show the invariant staying the same while energy and momentum change.
4. The Part 2 drawing shows both observers' before and after, the conservation panel, and the lump's mass beside `2m`.
5. Results are shown neutrally, then explained by the tutor after the learner has responded.
6. The learner can say that mass is what all observers agree on, that a particle at rest has energy `mc²`, that reaching `c` would take infinite energy, that light has no mass and no rest frame, and that in a collision energy and momentum are conserved but mass is not.
7. The experiment never says that mass increases with speed (other than in the clarifying remark), never claims that mass is "turned into" energy, and never shows anything with mass reaching `c`. It does show particles destroyed and created, always with energy, momentum and the system's mass conserved.
8. The Part 3 pictures show the pieces' rest masses and the system's mass in separate bars, so that "the sum of the masses changes, the system's mass does not" is visible, and the helium-4 case is stated as accounting only.
9. The three-stage introduction passes its check list: every term and every formula is defined or explained, with a worked example and a note of what it does not mean, before it is first used, and no introduction states the result of its part's prediction. The quick-reference panel lists every term and formula introduced so far.
10. Nothing in it contradicts the first chapter's Experiments 1 to 11, or Experiments 1 to 4 of this group.

---

## Implementation Notes

**Built (2026-10-14):** the physics model (`src/physics/energyMomentum.ts`) and its tests (`src/physics/energyMomentum.test.ts`: all twenty required tests, plus three extra: test 4b, the example for `v = 0.6` and `u = 0.3`; a check that every piece's `E² − (pc)²` equals its rest mass squared and every light pulse's is zero; and a particle at rest seen by a passing observer). The module reuses `lorentzTransform` and `timeDilationFactorFor`. It also exports `speedFromEnergy` and `speedDeficit` (for the tutor's real-world numbers, with `1 − v` written without a subtraction so it stays exact at accelerator energies), `systemMassOf`, `totalsOf`, `leftMovingParticleReading`, `everydayCollisionExtraMassKg` and the named constants. A mutation check (six deliberate breaks of the module, such as a wrong momentum, a wrong threshold, a lump built as `2m`, a naive kinetic energy and a wrong proton mass) was caught by at least one test each. (At that point the interface, the introductions, the panel, the diagrams, the results, the tutors and the chapter summary were not built; they are described below.) The neutron and helium-4 nucleus masses were then from memory; they were confirmed on 2026-10-15 (see the source table).

**Built and tested (2026-10-14 to 2026-10-15):** the interface for all three parts, each with its introduction, controls, prediction (Run needs one), animated diagram with caption, results panel and tutor (`src/components/EnergyMomentumExperiment.tsx` for Part 1, `EnergyMomentumCollision.tsx` for Part 2, `EnergyMomentumReactions.tsx` for Part 3, and `EnergyMomentumTutor.tsx`, `EnergyMomentumCollisionTutor.tsx`, `EnergyMomentumReactionsTutor.tsx`); the three-stage introduction with the "Words and formulas" panel (16 entries at the start, 5 more when Part 2 appears, 15 more when Part 3 appears); a draft chapter summary (`learned` and `next` in `src/App.tsx`); and the progress marks, as Decision 18 says (the check mark when Part 3's playback ends, the "explained" mark and the summary when Part 3's tutor reaches its explanation; Parts 1 and 2 mark nothing). Committed in the commits from `b3b647a` to `3fed9b5`.

**Complete-flow test (2026-10-15):** in Chrome, a full run at the real 12-second playback, then sweeps of every preset with a shortened playback (the length only sets how fast the result is shown, §11). The checks compared every displayed number with independently computed physics: Part 1, 49 runs (every particle speed and the light pulse, with all seven observer speeds), 686 checks; Part 2, 16 runs, 368 checks (the mass and extra mass, the conservation tables, the everyday momentum, and the system mass); Part 3, 32 runs (all eight process settings with four observer speeds), 772 checks, plus a check that no two text labels overlap in either picture. It also checked that Run is off until a prediction is chosen, that Part 2 and Part 3 appear only after the tutor explanation of the part before (or by a skip link), that the check mark and "explained" mark are saved at the right moments, that the summary appears only after Part 3's tutor, that changing a setting hides the results and the tutor, and that switching chapters resets the parts. The tutor was run through its three answers for six process settings. No failures. Not checked: narrow widths (the browser window would not shrink), browsers other than Chrome, a real learner, keyboard use and screen readers. The scripted checks are not in the repository.

**Final review (2026-10-15)** against `PROJECT.md`, `AGENTS.md`, this specification and the intended learning sequence. It found five items that were fixed at the owner's request: (1) the Part 3 introduction said the drop in the sum of the rest masses was "turned into energy", against Success Criterion 7 (now "times c², is the amount of energy given off"); (2) Part 3's prediction stayed selected when the process changed (now cleared when the process or its setting changes); (3) the Part 2 and Part 3 captions lacked a worked moment (added, with 0.5c and a passing observer at +0.2c); (4) the Part 3 tutor's explanation covers only the process that was run (a closing "Try the other two processes" paragraph was added); (5) Experiment 4's "What's next" said the group had no further experiment (it now points to this experiment). Also found, not part of this experiment: `npm run build` fails on 23 existing TypeScript errors in other experiments' files (missing Node types in test files, and an unused variable in `gravitationalWaveChirpExperiment.ts`); the development server and the tests are not affected.

**Approved differences from this specification (owner, 2026-10-15, all eight):**
1. Part 3's tutor explanation is specific to the process that was run (the specification lists all eight paragraphs for every run), with an added "Where the energy went, or came from" paragraph and a closing "Try the other two processes" paragraph. For two beams of light below the threshold, the conceptual question is "Energy and momentum are conserved here, and nothing was made. The light had energy, so why was that not enough to make a pair?"
2. Part 3's ledger writes the energy released or absorbed under the four bars, not between them, and calls the pair-creation case "energy absorbed".
3. Part 3 starts at 0.6c (annihilation) and at 2 (pair creation), and clears the prediction when the process or its setting changes. Part 3's conservation tables are in the results, not in the drawing, as in Part 2.
4. Skip and back links, added at the owner's request: Part 1 has "Skip to Part 2 - Collision" and "Skip to Part 3 - Reactions" (reading "Go to ... ↓" once open); Part 2 has "← Back to Part 1 - Energy and momentum" and the skip link to Part 3; Part 3 has back links to Parts 1 and 2. Skipping to Part 3 also opens Part 2 above it, shows a reminder paragraph for each part that was skipped, and marks nothing.
5. The introductions go beyond the specification's draft: Part 2 gained "The question" paragraph, and Part 3's stage C gained the two "If you skipped" reminders, "The question", "Why these three processes", longer definitions with examples, a longer "What happens" with "What you will see", "Why the lab is a special observer" and "The passing observer", and longer "Your job" and "What we assume". The panel has an added "Rest mass" entry (owner's request).
6. Part 2 draws the merged lump larger (its area is `M ÷ m` times a single lump's), at the owner's request, and the Part 2 and Part 3 captions are longer (each picture, the mass ledger, a worked moment and "What to look for"). Part 1's tutor has an added paragraph on why the readings sit on the curve (or the lines), and for a particle, a paragraph introducing the light pulse.
7. Part 1 has a "Part 1" heading to match Part 2.
8. The draft chapter summary was written for this experiment, and Experiment 4's "What's next" was changed (see above).

**Approved wording (owner, 2026-10-15, "wordings approved"):** all learner-facing wording as built, including the three introductions, the captions, the predictions, the results panels, the three tutors, the chapter summary, the link labels, and the new last sentence of Experiment 4's "What's next". The components and `src/App.tsx` hold the verbatim text.

**Still open:** the source checks of the claims that the formulas have been tested in particle accelerators, that a gain of about a tenth of a nanogram in a 2-kilogram lump and the heat in a cup of tea are far too small to weigh, the 600 million tonnes of hydrogen per second, and the DESY and Okun statements on "relativistic mass" (seen only as search results); the CODATA page itself was not opened, and the claims that helium-4 is the common kind of helium and that a neutron is a little heavier than a proton were not source-checked; the nominal solar luminosity is from memory (it is not shown to the learner); a check with a real learner, narrow widths, browsers other than Chrome, keyboard use and screen readers.
