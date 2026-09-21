# Physics

This directory holds the physics/simulation engine for SpaceTime Explorer AI.

Rules:

* Code in this directory must not import React or any UI code.
* Code in this directory must not depend on the DOM.
* Each experiment's physics model should be testable in isolation via Vitest.

Implemented models, each with its own `.test.ts` file:

* `clockExperiment.ts` — Experiment 1, one clock.
* `twoClockExperiment.ts` — Experiment 2, two clocks at rest.
* `movingClockExperiment.ts` — Experiment 3, the moving clock (also defines the speed of light constant).
* `lightClockExperiment.ts` — Experiment 4, the light clock.
* `invariantLightSpeedExperiment.ts` — Experiment 5, the light clock under the everyday rule and light's actual rule. It reuses the Experiment 4 model for light's actual rule.
