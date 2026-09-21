# Components

This directory holds React UI components for SpaceTime Explorer AI.

Rules:

* Components may read results from `src/physics/` but must not perform
  physics calculations themselves.

Each experiment has its own component (`Experiment1.tsx` to `Experiment6.tsx`), and Experiments 2 to 6 have their own tutor component (`Experiment2Tutor.tsx` to `Experiment6Tutor.tsx`). Experiment 1 uses the shared `ExperimentTutor.tsx`. `src/App.tsx` sequences the experiments as chapters; the experiments do not depend on one another.
