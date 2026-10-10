# Black Holes and Strong Gravity — Experiment 1: How Small Must Something Be to Become a Black Hole?

**Status: APPROVED by the owner on 2026-10-10 (the group "Black Holes and Strong Gravity" was chosen by the owner from three options on 2026-10-09; this experiment was proposed by Claude per `CLAUDE.md` §23 Stages 1–2 on 2026-10-09 and drafted as a specification per Stage 3 on 2026-10-09). Nothing is built yet. On review, two fixes were applied (the ruler's landmarks, and the first prediction's choices; see "Implementation Notes"), and all eleven "Decisions Needing Human Review" items were accepted as Claude's recommended defaults, with decision 8 as amended.**

This is the first experiment of a new group, "Black Holes and Strong Gravity" (numbering restarts within each group, as in the other groups). The group is planned as five experiments; only this one is proposed here, and the others are not approved:

1. **How small must something be to become a black hole?** (this specification)
2. Time near a black hole (the exact version of Gravity Experiments 2 and 9)
3. Orbits around a black hole
4. How a black hole bends light
5. Falling in (tidal forces at the horizon)

---

## Overview

Gravity and Curved Spacetime Experiment 7 asked what happens when a mass is so concentrated that the escape speed at some distance reaches the speed of light. It used ordinary gravity, made-up units, and an abstract mass, and it said plainly that the exact picture needs general relativity. This experiment starts the group that gives that exact picture. It uses **real objects and real numbers** and asks a first, simple question: **how small would a real object have to be squeezed to become a black hole?**

The new idea is one thing: **every mass has a critical radius, the horizon radius, `r_s = 2GM/c²`. Squeeze the mass inside a ball smaller than that, and it is a black hole. The horizon radius is directly proportional to the mass (about 2.95 kilometers for each solar mass), so it is tiny for ordinary objects and large only for enormous masses.** The learner picks a real object (Earth, the Sun, a neutron star, or one of three black holes), squeezes it, and sees how the object's size compares with its own horizon radius.

The experiment's headline result is the **squeeze needed**: how many times smaller than its real size an object would have to be. It is exact in this model and needs no measured data beyond the masses and radii of the objects themselves: about 720 million times for Earth (to a ball under 9 millimeters), about 236,000 times for the Sun (to about 3 kilometers), and only about 2.9 times for a neutron star.

The experiment is a **thought experiment**. It does not model how an object could be squeezed, what would stop it, or what happens inside the horizon; those are stated, not modeled.

It reuses ordinary-gravity constants from earlier experiments and **does not reuse Gravity Experiment 7's abstracted units**. It also notes, after the learner has observed the result, that this radius is the same one Experiment 7 found from "escape speed equals the speed of light", and what the exact theory adds.

---

## Learning Objective

After this experiment, the learner should understand:

1. Any mass becomes a black hole if its whole mass is squeezed inside a small enough sphere. The critical radius is the **horizon radius**, `r_s = 2GM/c²`.
2. The horizon radius is proportional to the mass. Twice the mass means twice the radius, and a black hole with 1,000 times the mass has a horizon only 1,000 times as wide. It is not a million times, and it is not 10 times.
3. How far real objects are from the threshold. The Sun would have to be squeezed to a radius of about 3 kilometers, Earth to about 9 millimeters, and a neutron star is only about 3 times too big. This is why, in the earlier chapters, gravity's strange effects were so small for everyday objects.
4. The three black holes in the list (a stellar one, the one at the center of our galaxy, and the one imaged in the galaxy M87) have horizons of very different sizes: about 30 kilometers, about a fifth of Mercury's distance from the Sun, and about four times Neptune's distance from the Sun.
5. Gravity Experiment 7 found this same radius by asking when the escape speed from a surface reaches the speed of light. The exact theory (general relativity) gives the same number, and it adds what the horizon really is: a one-way boundary, not a physical wall or surface.
6. What the experiment does not say: how an object could be squeezed, what happens inside the horizon, and what real black holes are like if they spin.

---

## Physical Situation

A single object of known mass whose entire mass is imagined squeezed, without losing any, into a sphere of a chosen radius. The quantity followed is the ratio of the chosen radius to the object's horizon radius, `radius ÷ r_s`:

- if the ratio is **greater than 1**, the object is not a black hole;
- if it is **1 or less**, the mass is inside its own horizon, and it is a black hole.

### The formula (given, not derived)

`r_s = 2GM / c²`

where `G` is the gravitational constant, `M` the mass, and `c` the speed of light. In the units already used in this project, with the mass in solar masses, this is `r_s = 2 × G × M / c²` converted to kilometers. This equals about **2.953 kilometers for every solar mass.** The formula is exact in general relativity for a non-rotating, uncharged object (see below). It is stated and used here, not derived: deriving it needs Einstein's equations, which are outside this project (as with the formulas given in the Cosmology chapter).

### The objects

All values are rounded, real, and given, not computed from anything else here.

| Object | Mass (solar masses) | Real radius | Horizon radius | Squeeze needed |
|---|---|---|---|---|
| Earth | 3.0 × 10⁻⁶ | 6,371 km | about 8.9 mm | about 720 million times |
| The Sun | 1 | 695,700 km | about 2.95 km | about 236,000 times |
| A neutron star | 1.4 | about 12 km | about 4.1 km | about 2.9 times |
| A stellar black hole | 10 | none (already a black hole) | about 29.5 km | not applicable |
| Sagittarius A* (the black hole at the center of our galaxy) | about 4.3 million | none | about 12.7 million km, about 0.085 AU | not applicable |
| M87* (the black hole imaged in the galaxy M87) | about 6.5 billion | none | about 19 billion km, about 128 AU | not applicable |

A note on the values (checked 2026-10-09 against search results, not against the papers): M87*'s mass is about 6.5 billion Suns with an uncertainty of about 0.7 billion (Event Horizon Telescope); Sagittarius A*'s mass is about 4.3 million Suns (GRAVITY instrument); the Sun's horizon radius is about 2.95 km; a neutron star of about 1.4 Suns has a radius of about 12 to 13 km. The "stellar black hole" mass of 10 Suns is an illustrative round value, not a particular object. The Earth, Sun and neutron-star radii are the objects' own sizes, used only as the starting point of the squeeze.

For the three black holes, there is no "real radius" to squeeze from, since the mass is already inside its horizon. So that every object works with the same controls, the squeeze for these three starts from a **hypothetical ball 100 times as wide as the horizon radius**, clearly labeled "hypothetical" on the screen (see Decision 3). The "squeeze needed" is shown as "not applicable" for them.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **A thought experiment.** The experiment does not model how a real object could be squeezed, what force would do it, or what stops it. Real stars of enough mass do collapse on their own, but that process is not modeled.
- **What happens inside is not modeled.** The horizon is where the experiment's story stops.
- **A non-rotating, uncharged black hole only.** Real black holes usually spin, and a spinning one has a different, more complicated horizon. The formula here is for the simplest case.
- **The mass is treated as all inside the sphere, at rest.** Nothing is lost, and the sphere does not spin.
- **The radii of real objects are rounded values** and are only the starting points of the squeeze. A neutron star's radius depends on a physical model of its matter that is not settled; the value used is a round figure inside the range found by observations.
- **The "radius" is the circumference divided by 2π,** as it is measured around the object. For this experiment it is just "the radius", and the difference between that and a radius measured inward is not discussed (the exact theory distinguishes them; Experiment 2 of this group may return to it).
- **The three black holes are named for their real masses only.** The experiment does not describe their surroundings, the glowing gas, or the images made of them.

### Not introduced

Time near a horizon, orbits, light bending, tidal forces and falling in (these are Experiments 2 to 5 of this group); the Schwarzschild metric as a named object; spinning (Kerr) and charged black holes; what is inside; Hawking radiation; mean density; and the detailed physics of how black holes form (a plain-language account of what a black hole is and how stellar ones form is given in the introduction only, at the owner's request on 2026-10-10; see "Implementation Notes"). All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16). The tutor may name a few of these in one sentence each as things the model cannot say anything about.

---

## Physics Model

One new, self-contained module. It deliberately **reuses** earlier experiments' code unchanged (imported, not redefined):

- `GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS` and `KM_PER_KPC` from Cosmology Experiment 4 (`darkMatterExperiment.ts`), which together give `G` in the units of solar masses, kilometers per second and kiloparsecs, and the conversion to kilometers,
- `REAL_SPEED_OF_LIGHT_KM_PER_S` from Cosmology Experiment 1 (`hubblesLawExperiment.ts`).

It does **not** import Gravity Experiment 7's constants (`SPEED_OF_LIGHT` in made-up units) and does not use `blackHoleExperiment.ts`. This is checked by a regression test (see "Required Physics Tests").

The one new calculation is `r_s = 2 × G × M / c²`, converted to kilometers (checked: 1 solar mass gives about 2.953 km).

```typescript
// src/physics/blackHoleSizeExperiment.ts

export const HYPOTHETICAL_START_IN_HORIZON_RADII = 100   // for the three objects that are already black holes
export const MIN_RADIUS_IN_HORIZON_RADII = 0.1           // the end of the squeeze slider

export interface ObjectPreset {
  id: 'earth' | 'sun' | 'neutron-star' | 'stellar-black-hole' | 'sgr-a-star' | 'm87-star'
  label: string
  massSolarMasses: number
  realRadiusKm: number | null       // null for the three black holes
}

export const OBJECT_PRESETS: ObjectPreset[]

// The horizon radius, 2GM/c², in kilometers.
export function horizonRadiusKm(massSolarMasses: number): number

// radius / horizon radius.
export function radiusInHorizonRadii(radiusKm: number, massSolarMasses: number): number

// True if the radius is at or below the horizon radius.
export function isBlackHole(radiusKm: number, massSolarMasses: number): boolean

// The speed that ordinary gravity (Experiment 6's escape-speed idea) would need to escape from a ball of this
// radius, as a fraction of the speed of light: sqrt(r_s / radius). Reaches exactly 1 at the horizon radius.
export function ordinaryGravityEscapeSpeedFractionOfLight(radiusKm: number, massSolarMasses: number): number

export interface BlackHoleSizeResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startRadiusKm: number               // the real radius, or 100 horizon radii if there is none
  startIsHypothetical: boolean
  squeezeNeeded: number | null        // real radius / horizon radius; null if the object has no real radius
  chosenRadiusKm: number
  chosenInHorizonRadii: number
  becomesBlackHole: boolean
  escapeSpeedFractionOfLight: number  // by the ordinary-gravity formula above, at the chosen radius
  curve: Array<{ progress: number; radiusKm: number }>   // log interpolation from the start to the chosen radius
}

export function runBlackHoleSizeExperiment(presetId: ObjectPreset['id'], chosenRadiusKm: number): BlackHoleSizeResult
```

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser. The ordinary-gravity escape speed is the same Newtonian idea as Gravity Experiment 6 and 7, written in real units; it is used only to connect to Experiment 7, and the specification states it is the ordinary-gravity version.

---

## Learner Controls

- **The object:** Earth, the Sun, a neutron star, a stellar black hole, Sagittarius A*, M87*.
- **The squeeze radius:** a logarithmic slider from the starting radius down to 0.1 of the horizon radius, with four presets: "Real size" (or "Hypothetical start" for the black holes), "10 times the horizon radius", "Exactly the horizon radius", and "Half the horizon radius". Presets are the quickest way to see the contrast on either side of the threshold.
- **Run**, which plays the squeeze from the start radius to the chosen radius over a fixed duration, independent of the physics result (`CLAUDE.md` §11).

---

## Prediction Activity

Before the controls and results are shown, the learner answers two questions in sequence (not scored):

1. "To turn the Sun into a black hole, you would have to squeeze all of its mass into a ball of what radius?" (about 6,000 kilometers, the size of Earth / about 30 kilometers / about 3 kilometers, a few city blocks). The model's answer is the third (2.95 kilometers).
2. "A black hole has 1,000 times the mass of another. How much wider is its horizon?" (about 10 times / about 1,000 times / about a million times). The model's answer is the second (exactly 1,000 times).

The controls are disabled until both predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the choices. The ruler picture and the caption appear only after predictions are locked in (`CLAUDE.md` §12).

---

## Experiment Behavior

### Display

- **A labeled radius ruler, the main picture.** A horizontal logarithmic axis of radius, in kilometers. Along it:
  - a **marker for the object's radius** (gold), which moves toward the left as the object is squeezed;
  - a **line at the horizon radius** (a distinct color), labeled with its value;
  - the region to the left of the line shaded and labeled "inside the horizon: a black hole" (a second visual contrast, `CLAUDE.md` §14);
  - **fixed landmarks** for scale, clearly labeled and drawn from fixed illustrative values: a coin (about 1 centimeter), a person's height (about 2 meters), the radius of a small city (about 10 kilometers), Earth (6,371 kilometers), the Sun (695,700 kilometers), Mercury's orbit (about 58 million kilometers, about 0.39 AU), the distance from Earth to the Sun (about 150 million kilometers, one "astronomical unit", AU), and Neptune's orbit (about 4.5 billion kilometers, about 30 AU). **Only the landmarks that fall inside the current axis range are drawn**, so each object's ruler shows the landmarks that make its own scale understandable (for example, Mercury's and Neptune's orbits for Sagittarius A* and M87*, and the coin for Earth). The landmark labels are fixed and do not move; their only purpose is to make the scale understandable (they are not results).
  The axis spans the object's start radius down to 0.1 of its horizon radius, so the range changes with the object, and each decade tick is labeled in plain units.
- **A second, small "to scale" picture is not drawn** (the sizes differ by up to eight orders of magnitude, so a true-scale picture would show nothing). The caption says so.
- **When the chosen radius is at or inside the horizon,** the marker turns to a distinct color and a clear label says "a black hole".
- **Live readout:** the object, its mass, the current radius, the horizon radius, the radius in horizon radii ("how many horizons wide"), and whether it is a black hole.
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are locked in, in the same step-by-step style as the Cosmology experiments.

### Results

States the object, the horizon radius, the squeeze needed (or "not applicable"), and, for the chosen radius, how many horizon radii wide it is and whether it is a black hole; compares both predictions with what the model gave; includes simple math per `CLAUDE.md` §15, for example for the Sun, `r_s = 2GM/c²` worked as "about 2.95 km for each solar mass, so 1 solar mass gives about 3 km, and 10 solar masses gives about 30 km", and for the proportionality, "1,000 solar masses gives 1,000 × 2.95 ≈ 2,950 km"; shows the ordinary-gravity escape speed at the chosen radius as a fraction of the speed of light, reaching 1 at the horizon (the connection to Experiment 7); includes a daily-life comparison; and states the model's limits in a prominent bordered box (`CLAUDE.md` §28.1 pattern).

The daily-life comparison (to be confirmed, kept out of the introduction so it does not reveal the answers): a person's weight depends on both the planet's mass and how close they are to its center, so standing on a much smaller Earth would make you much heavier; squeezing a mass smaller makes the pull at its surface stronger. It is an analogy for why squeezing matters, not the same calculation.

### Introductory text

To be drafted during implementation, covering the question (how small would something have to be to become a black hole?), what happens, the learner's job, what to look for, new terms defined in plain language before use (**horizon radius**, **solar mass** if not already defined, **astronomical unit**), reuse of Gravity and Curved Spacetime Experiment 7 and Experiment 6 and of the Cosmology chapter's real-units approach, a "Why even ask this" paragraph, and the assumptions above. The introduction states plainly that this experiment uses real objects and real numbers, as Gravity Experiment 9 (GPS) and the Cosmology chapter did, and that this is a deliberate departure from Experiment 7's made-up units. Any daily-life picture that gives away the prediction answers is kept out of the introduction (`CLAUDE.md` §12). The name "Schwarzschild radius" is introduced only in the tutor, after the learner has observed the result (`CLAUDE.md` §15). Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "Look at the ruler. Where is the object's marker compared with the horizon line? How many times would you have to squeeze it, and what happened when you squeezed it past the line?"
  2. Prediction comparison: the learner's two predicted answers beside what the model gave.
  3. Conceptual question: "A bigger mass needs a bigger ball to be a black hole. Why would more mass make the critical radius larger, not smaller?" — intended to let the learner reach "more mass pulls harder at every distance, so it takes a bigger ball to keep the pull below the limit".
  4. Explanation: (1) the horizon radius is `r_s = 2GM/c²`, about 2.95 km per solar mass, and the name "Schwarzschild radius" (after the physicist who first found it in Einstein's theory, in 1916); (2) it is directly proportional to the mass, so 1,000 times the mass is 1,000 times the radius, with a worked example; (3) real objects are far from the threshold: the Sun by about 236,000 times, Earth by about 720 million times, a neutron star by only about 3 times, which is why the chapter's earlier effects were small for ordinary objects and large near compact ones; (4) the three real black holes span a huge range of size, from about 30 km to about 128 AU, because their masses differ so much, which is also why the largest black holes are not "dense" in the everyday sense (stated plainly in one sentence and not worked out); (5) Experiment 7 found the same radius from "escape speed equals the speed of light", using ordinary gravity; the exact theory gives the same number, and adds that the horizon is a one-way boundary, not a surface: you can cross it inward, but nothing, not even light, can come back out; (6) honest limits: a thought experiment, non-rotating and uncharged, what happens inside is not modeled, and spinning black holes are different; (7) not covered here but coming next in this group: what time does near a black hole, what orbits and light do, and what falling in is like.

---

## Required Physics Tests

1. `horizonRadiusKm(1)` is about 2.953 km (within 0.1%), and `horizonRadiusKm` of the Sun's mass matches the same value.
2. `horizonRadiusKm` is exactly proportional to mass: doubling the mass doubles the radius, and 1,000 times the mass gives 1,000 times the radius, checked at several masses.
3. `horizonRadiusKm` for Earth's mass is about 8.87 millimeters (0.00000887 km, within 1%).
4. The values in the table agree with the model: the horizon radius of the neutron star (about 4.13 km), the stellar black hole (about 29.5 km), Sagittarius A* (about 12.7 million km, about 0.085 AU) and M87* (about 19 billion km, about 128 AU), each within 1%.
5. `radiusInHorizonRadii` equals the radius divided by the horizon radius, and equals 1 at the horizon radius.
6. `isBlackHole` is true if and only if the radius is at or below the horizon radius, checked just below, at, and just above the horizon for several masses.
7. `squeezeNeeded` for Earth, the Sun and the neutron star matches the table (about 720 million, 236,000 and 2.9, each within 1%), and it is `null` for the three black holes.
8. For the three black holes, `startIsHypothetical` is true and `startRadiusKm` is 100 horizon radii; for the other three, `startIsHypothetical` is false and `startRadiusKm` is the real radius.
9. `ordinaryGravityEscapeSpeedFractionOfLight` equals 1 at the horizon radius, is below 1 above it, is above 1 below it, and equals `sqrt(r_s / radius)` at several radii. Written independently: the Newtonian escape speed `sqrt(2GM/r)` equals `c` exactly at `r = 2GM/c²` (the link to Experiment 7).
10. The `curve` starts at the start radius, ends at the chosen radius, is monotonic, and is evenly spaced in the logarithm of the radius.
11. `becomesBlackHole` is consistent with `isBlackHole` for the chosen radius.
12. The module imports its constants from `darkMatterExperiment` and `hubblesLawExperiment` rather than redefining them, and does not import from `blackHoleExperiment` — a regression check (`CLAUDE.md` §8).

---

## Decisions Needing Human Review

The owner had not answered decisions 2 to 4 of the group proposal when this was drafted, and had not seen the details below; each shows Claude's recommended default as used above.

1. **Group name, and where the group goes.** Default: "Black Holes and Strong Gravity", added to `groupOrder` in `src/App.tsx` after "Cosmology", as the owner first asked. Alternative: next to the Gravity chapter it extends (a reordering of the sidebar). Adding the group also means updating the last Cosmology chapter's "What's next" line, which currently says it is the last experiment in the project. The owner's earlier wording on that line applies; any change needs approval.
2. **Real numbers and the six objects.** Default: real masses and radii (the Gravity chapter used real numbers once, in Experiment 9, by owner decision), with the sources checked 2026-10-09 as noted above. Alternative: abstracted masses, as in Experiment 7. The stellar black hole's 10 solar masses is an illustrative round value, and the neutron star's 12 km is a round value inside an observed range.
3. **The three black holes and the "hypothetical" start.** Default: for the three black holes, the squeeze starts from a hypothetical ball 100 horizon radii wide, clearly labeled, so every object has the same controls. This is an invented starting point, not a real object. Alternative: hide the squeeze control for the black holes and show only their horizon radii against the landmarks. The alternative has no invented value but a second layout.
4. **The thought-experiment framing, and how much to say about a neutron star.** Default: state plainly that what could squeeze an object, and what happens inside, is not modeled. A neutron star is shown only as "about 3 times too big". Is that the right amount of caution?
5. **Whether this is too slight for a whole experiment.** It is one formula, with the learning in the scale and the proportionality. Default: keep it separate (one idea per experiment, `CLAUDE.md` §16). Alternative: merge it into Experiment 2 (time near a black hole).
6. **Naming.** Default: "horizon radius" in the introduction and "Schwarzschild radius" introduced in the tutor, after the observation (`CLAUDE.md` §15).
7. **The ordinary-gravity escape speed in the Results.** Default: include it, to connect to Experiment 7 and show it reaching the speed of light at the horizon, labeled as the ordinary-gravity version. Below the horizon it exceeds the speed of light, which the text says means "nothing can escape", not that anything travels faster than light. Alternative: leave it out and mention Experiment 7 in words only.
8. **The landmarks on the ruler** (a coin, a person, a small city, Earth, the Sun, Mercury's orbit, the Earth–Sun distance, Neptune's orbit). Default, as amended on review: include these eight fixed illustrative values for scale, drawing only those inside the current axis range. They are presentation only and are labeled as such. The "small city" radius of 10 km is a round illustrative value.
9. **The daily-life comparison** (a heavier you on a much smaller Earth). Default as above, kept out of the introduction. It is an analogy for why squeezing increases the pull at the surface, and the text must say it is not the same calculation.
10. **The tutor's point about the largest black holes not being "dense".** It is true (the average density of a black hole's volume falls as its mass grows) but it needs mean density, which is not otherwise introduced. Default: say it in one plain sentence without working it out. Alternative: leave it out.
11. **Not yet confirmed against a primary source:** the real radii of Earth and the Sun are standard values; the neutron star's radius, M87*'s mass and Sagittarius A*'s mass were checked only against search results; "Schwarzschild found it in 1916" is from general knowledge.

---

## Relationship to Previous Experiments

- **Gravity and Curved Spacetime Experiment 7 (what is a black hole?):** this experiment asks the same question in real units and states that Experiment 7's radius is the same one. Its idea (escape speed equals the speed of light) is not changed, and its abstracted units are not reused.
- **Gravity Experiments 5 and 6 (what curves spacetime; orbits):** mass and distance, and the escape speed.
- **Gravity Experiments 2 and 9 (gravitational time dilation; GPS):** the "strength" of gravity near a mass, which Experiment 2 of this group will make exact.
- **Cosmology Experiments 1 and 4:** the real constants this experiment reuses (the speed of light, and the gravitational constant in real units).
- **Gravitational Waves Experiments 1 to 4:** black holes were mentioned as the sources of the waves, and the real mass range there overlaps this experiment's objects.

## Relationship to Later Experiments

The rest of the group is planned but not approved:

- **Experiment 2, time near a black hole:** uses this experiment's ratio `radius ÷ r_s` as its main quantity, in the exact formula `√(1 − r_s / radius)`.
- **Experiment 3, orbits;** **Experiment 4, how a black hole bends light;** **Experiment 5, falling in (tidal forces):** each needs its own Stage 1–2 proposal and an approved specification.

---

## Success Criteria

1. The learner makes both predictions before the ruler and caption are shown.
2. Choosing a different object or squeeze radius visibly changes the picture, not just a number; the marker visibly crosses the horizon line when the radius is squeezed past it, and the "black hole" label and shading change accordingly.
3. The ruler shows the marker, the horizon line, the inside-the-horizon region and the fixed landmarks that fall inside the axis range (always at least one, for every object), all labeled, with units, and the caption says why the picture is not drawn to true scale.
4. The Results panel correctly states the horizon radius for the chosen object and the squeeze needed, compares both predictions with what the model gives, and includes the worked math for the Sun and for the proportionality.
5. The horizon radius is directly proportional to the mass, shown with a worked example.
6. The experiment states plainly that it is a thought experiment, that what happens inside is not modeled, that the formula is for a non-rotating, uncharged black hole, and that the formula is given, not derived.
7. The introduction, Results and tutor connect to Gravity Experiment 7 and say that the exact theory gives the same radius and adds that the horizon is a one-way boundary.
8. "Horizon radius", "astronomical unit" and (if not already defined) "solar mass" are defined in plain language at first use (`CLAUDE.md` §15); "Schwarzschild radius" appears only after the observation.
9. The three black holes' hypothetical start is labeled as hypothetical wherever it appears.
10. No existing experiment's physics is modified or recomputed.

---

## Implementation Notes

Nothing has been built. Changes made at the owner's review on 2026-10-10:

- **Landmarks:** a first check showed that most landmarks would fall off the axis for most objects (for the Sun, the coin and the person; for M87*, almost everything), and that the Mercury and Neptune comparisons in Learning Objective 4 were not on the ruler. Fixed by drawing only landmarks inside the current range and adding Mercury's and Neptune's orbits. Success Criterion 3 now requires at least one landmark in range for every object. **To check at build time:** that this is true for all six objects (M87*'s axis, about 2 × 10⁹ to 2 × 10¹² km, should include Neptune's orbit at about 4.5 × 10⁹ km and the Earth–Sun distance only if the range reaches it).
- **Prediction 1:** the choice "about 30 kilometers, the size of a small city" contradicted the landmark list's 10 km small city, and the right answer is about 3 km. Reworded as above.
- **Required Physics Test 7:** tolerance fixed at 1%. Recomputed from the reused constants: Earth 8.87 mm and about 718 million times, the Sun 2.953 km and about 235,600 times, the neutron star 4.13 km and about 2.90 times, Sagittarius A* 12.70 million km (0.0849 AU), M87* 19.2 billion km (128 AU); all agree with the table's rounded figures.
- All eleven "Decisions Needing Human Review" items were accepted as Claude's recommended defaults (decision 8 as amended). The unchecked sources in decision 11 remain unchecked.

- **Introduction scope extended (2026-10-10, at the owner's request):** the introduction gained a plain-language "What is a black hole?" section (a one-way boundary, not a surface; not a vacuum cleaner, with the Sun-replaced-by-a-black-hole example; found by its effects on nearby things) and a "How are black holes formed?" section (the balloon comparison for the balance between gravity and outward pressure, the collapse of a massive star's core, white dwarf and neutron star outcomes, and that how the largest black holes grew is an open question). This overrides the specification's original exclusion of "the formation of black holes" for the introduction only; the experiment's physics, results and tutor are unchanged. **Not checked against a source:** all of these statements are general knowledge, including that the Earth would keep orbiting if the Sun were replaced by a black hole of the same mass, and the sequence white dwarf, neutron star, black hole by core mass (no mass thresholds are stated).

- **Complete-flow test and final review (2026-10-10, headless Chrome via Playwright, `http://localhost:5173/`, Claude in Chrome would not connect):** from a cleared `localStorage`, the controls and Run were disabled and no picture, caption, Results, guide or tutor was shown until both predictions were answered; after the first Run the two pictures, the caption, the Results panel, the optional guide (closed) and the tutor appeared; "Change predictions" hid them all again and kept the choices; the tutor's three questions and seven-point explanation worked and saved progress recorded the chapter as completed and explained; no console errors. All six objects were run (squeezed to half the horizon radius): each ruler showed at least one landmark (Earth 4, Sun 3, neutron star 1, stellar black hole 1, Sagittarius A* 2, M87* 1), closing the "To check at build time" item above; all six reported "It is a black hole" and the Results and tutor appeared each time. The figures in the Results, tutor and guide table matched the physics model. Against the Success Criteria, one gap was found and fixed: the introduction connected to Experiment 7 but did not say that the exact theory gives the same radius (Criterion 7). Also fixed: figures that were too precise (for example "235,571 times", now "236,000"), and a mismatch between the guide's "130 AU" and the tutor's "128 AU". Not checked: a 390-pixel window, keyboard use, and any browser other than headless Chromium. Left as is: on Earth's ruler the "a coin (1 cm)" label sits next to the horizon line, since 1 cm and the 8.86 mm horizon radius nearly coincide. The ruler's right end for the three black holes is the hypothetical start but is not labeled as such (the "Hypothetical start" button, the idle label, the caption and the Results note are).
