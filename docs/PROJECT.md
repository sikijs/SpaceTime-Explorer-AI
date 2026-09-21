# SpaceTime Explorer AI — Project Definition

## 1. Project Purpose

SpaceTime Explorer AI is an interactive educational application designed to help learners understand relativity and spacetime by **experiencing physical ideas through experiments and simulations**, rather than learning them only through text, formulas, or lectures.

The project is intended to make difficult ideas in relativity easier to understand by allowing the learner to:

1. Make a prediction.
2. Run an experiment.
3. Observe what happens.
4. Compare the observation with the prediction.
5. Think about what the observation means.
6. Receive an explanation from an AI tutor when appropriate.

The goal is not simply to demonstrate relativistic effects. The deeper goal is to help the learner develop an **intuitive understanding of why those effects occur**.

---

## 2. Educational Vision

Relativity contains concepts that are difficult to visualize because they differ from everyday experience.

Examples include:

* time as measured along different histories
* the relationship between clocks and motion
* the relationship between space and time
* spacetime
* reference frames
* proper time
* time dilation
* length contraction
* simultaneity
* gravity and curved spacetime
* the relationship between geometry and physical measurements

SpaceTime Explorer AI should introduce these ideas gradually.

The learner should encounter a concept first through a simple physical situation, then gradually move toward more sophisticated situations.

The application should avoid asking the learner to accept abstract statements merely because they appear in a textbook.

Instead, the learner should be able to **see what the model predicts and investigate it personally**.

---

## 3. Core Learning Philosophy

The central learning cycle is:

**Predict → Experiment → Observe → Explain**

The learner should be an active participant rather than a passive reader.

### Predict

Before an experiment runs, the learner should be encouraged to decide what they think will happen.

The prediction may be:

* a numerical prediction
* a comparison
* a qualitative prediction
* an explanation of what they expect to observe

The exact form depends on the experiment.

### Experiment

The learner runs a controlled simulation.

The experiment should make clear:

* what is being controlled
* what is being measured
* what is happening physically
* what assumptions are being used

### Observe

The application should present the result clearly.

The learner should be able to distinguish between:

* what they predicted
* what actually happened
* what was measured
* what the simulation is showing visually

### Explain

Only after the learner has had an opportunity to observe and think should the application provide the deeper conceptual explanation.

The AI tutor should help the learner connect the observation to the underlying physics.

---

## 4. Role of the AI Tutor

The AI tutor is an educational guide, not the source of physical truth.

The physics implemented by the application and defined in the experiment specification is authoritative.

The AI tutor should:

* ask useful questions
* encourage predictions
* encourage observation
* help the learner interpret results
* explain concepts in simple language
* connect experiments to previously learned concepts
* gradually introduce more sophisticated terminology
* help correct misunderstandings

The AI tutor should not:

* invent physical rules
* change the physics of an experiment
* contradict the experiment specification
* give unexplained answers when a question could help the learner reason it out
* overwhelm the learner with mathematics
* turn every experiment into a lecture

The tutor should generally behave more like a **patient physics teacher working beside the learner** than like a textbook.

---

## 5. The Learner's Role

The learner should remain in control of the investigation.

The application should encourage the learner to ask:

> What do I think will happen?

Then:

> What actually happened?

And finally:

> Why did it happen?

This distinction between **prediction, observation, and explanation** is fundamental to the project.

A learner should be allowed to make an incorrect prediction without being penalized simply for being wrong.

An incorrect prediction can be educational because it creates an opportunity to investigate the difference between intuition and the physical model.

---

## 6. Experiments

SpaceTime Explorer AI will be organized around a sequence of interactive experiments.

Each experiment should introduce or reinforce a specific physical idea.

An experiment is not merely a visualization. It should have a clearly defined:

* physical situation
* initial state
* controllable parameters
* physical rules
* measurements
* expected results
* learner interaction
* educational purpose

Every experiment should have its own specification document.

The specification is the authoritative definition of what the experiment is supposed to teach and how it is supposed to behave.

The implementation should follow the specification rather than allowing the software developer or AI coding agent to invent the experiment while building it.

---

## 7. Progressive Learning

The experiments should build upon one another.

A later experiment may rely on concepts established by an earlier experiment.

Therefore, the project should not treat experiments as unrelated demonstrations.

The intended structure is a **learning journey**.

Early experiments should establish simple physical ideas.

Later experiments can introduce increasingly sophisticated concepts, mathematical relationships, and spacetime reasoning.

The exact sequence and content of future experiments will be defined and approved separately. Future experiments must not be invented merely to fill out a roadmap.

---

## 8. Mathematics

Mathematics should be introduced progressively.

The application should first establish an intuitive understanding of the physical situation whenever practical.

Mathematical formulas should then be introduced as a way of describing or predicting what the learner has observed.

The project should avoid using equations merely because they are mathematically available.

When an equation is introduced, the learner should understand:

* what the quantities represent
* what physical question the equation answers
* what the equation predicts
* how the prediction relates to the experiment

The level of mathematics should increase as the learner progresses through the experiments.

---

## 9. Scientific Integrity

Scientific accuracy is a fundamental requirement of the project.

Every experiment must explicitly define its physical assumptions.

The application must distinguish between:

* the physical model
* the numerical calculation
* the visual representation
* the educational interpretation

A visual animation must never be allowed to imply a physical effect that is not actually part of the underlying model.

For example, animation speed may be changed to make an experiment easier to watch, but changing the animation speed must not change the physical result.

The project should prefer simple, explicit models over hidden complexity.

---

## 10. Separation of Physics and User Interface

The physics of an experiment should be independent of the React user interface.

Where practical, the application should use a structure in which:

**Physics model → Simulation state → User interface**

The physics layer should be testable without a browser or visual interface.

This allows the project to verify that the physical result is correct independently of whether the UI animation looks correct.

This separation also makes future experiments easier to develop and test.

---

## 11. Technology

The initial application technology is:

* React
* TypeScript
* Vite
* Vitest

The project should keep dependencies and architecture as simple as practical.

Technology should serve the educational purpose of the application rather than become an objective in itself.

Additional libraries, frameworks, services, or infrastructure should only be introduced when there is a clear reason to do so.

---

## 12. Project Architecture

The project should develop toward a structure containing separate responsibilities for:

### Physics

Contains the physical models and simulation calculations.

Physics code should not depend on React components or browser presentation.

### User Interface

Provides the controls, displays, animations, experiment state, and learner interaction.

### Educational Interaction

Handles the learner's prediction, observation, questions, explanations, and other educational flow.

### AI Tutor

Provides conversational guidance while respecting the physics and educational rules defined by the project.

### Tests

Verify the physics and important application behavior.

### Documentation

Defines the project, experiments, development rules, and scientific assumptions.

---

## 13. Experiment Development Pattern

Experiments should generally be developed in stages rather than all at once.

A typical experiment development process is:

1. Define the physics.
2. Implement the physics model.
3. Test the physics independently.
4. Build the basic experiment interface.
5. Connect the interface to the physics.
6. Add the learner prediction interaction.
7. Add the simulation and observation experience.
8. Add results and interpretation.
9. Add the AI tutor interaction.
10. Test the complete learning flow.
11. Review the experiment against its specification.

The exact steps may vary when the experiment requires something different.

The important principle is that **the physics should be established and tested before complicated educational or visual features are built on top of it**.

---

## 14. Experiment 1

The first experiment establishes the most basic idea:

> A clock measures elapsed time along its own history.

Experiment 1 deliberately does not introduce:

* motion
* gravity
* acceleration
* time dilation
* reference-frame comparisons
* curved spacetime

It is intended to establish the fundamental relationship between a clock, its history, and elapsed time before introducing relativistic complications.

### Learner Controls

The learner selects an experiment duration.

Preset choices are:

* 5 seconds
* 10 seconds
* 20 seconds
* 30 seconds

The learner may also select **Other** and enter a duration from 1 to 60 seconds.

### Prediction

Before starting the experiment, the learner makes a numerical prediction.

The experiment cannot start until the required prediction has been entered.

### Experiment

The clock begins at:

`00:00:00`

The clock runs for the selected simulated duration.

The visual playback may be accelerated so that the learner does not have to wait for the full real-world duration.

Changing playback speed must not change the physical result.

### Observation

When the experiment finishes, the learner can see:

* the starting event
* the ending event
* the initial clock reading
* the final clock reading
* the elapsed time
* the learner's prediction
* the actual result
* the difference between prediction and result

The prediction is not scored.

### AI Tutor

Before the experiment, the tutor helps the learner make a prediction.

During the experiment, the tutor remains silent.

After the experiment, the tutor first asks the learner what they observed.

The tutor then helps the learner compare the prediction with the actual result and asks a conceptual question.

A deeper explanation is provided after the learner has had an opportunity to respond.

### Experiment 1 Physics

The physics model should:

* start from a defined initial state
* advance simulation time
* maintain the clock reading
* record the start event
* record the end event
* calculate elapsed time
* produce a structured experiment result

The physics model must be independent of the UI.

---

## 15. User Experience Principles

The application should be:

* clear
* uncluttered
* visually understandable
* interactive
* accessible
* patient
* appropriate for learners who may be encountering the concepts for the first time

The learner should always be able to understand:

* where they are in the experiment
* what they are expected to do
* whether the experiment is running
* what they are observing
* what happened when the experiment finished

The interface should not require the learner to understand the underlying software architecture.

### Plain language for new ideas

Most learners have no everyday experience of ideas such as reference frames, and they take time for granted. Every specialized term should be explained in plain language, at the point where the learner first needs it and before an experiment relies on it. Each experiment opens with a short introduction that states the question, what will happen, what the learner is asked to do, any new term, and the assumptions being made.

---

## 16. Visualizations

Visualizations should exist to support physical understanding.

They should answer questions such as:

* What is happening?
* What is being measured?
* What changed?
* What stayed the same?
* How are two events related?
* How does the observation connect to the physical concept?

Animations should not be decorative for their own sake.

Whenever a visualization represents a physical quantity, its relationship to the underlying simulation should be clearly defined.

---

## 17. Scope Control

SpaceTime Explorer AI is intended to be developed carefully and incrementally.

The project should not grow simply because a feature sounds interesting.

New functionality should be added when it supports:

* the educational goals
* an approved experiment
* the learner experience
* scientific clarity
* maintainability

Features outside the approved scope should be discussed before implementation.

In particular, Claude Code or another coding agent must not independently invent:

* new physics
* new experiments
* new educational objectives
* new scientific assumptions
* major architectural changes

---

## 18. Human and AI Responsibilities

The human project owner defines:

* the physics
* scientific assumptions
* educational goals
* experiment objectives
* experiment behavior
* project scope
* priorities

The coding agent implements those decisions.

The coding agent may suggest improvements or identify ambiguities, but suggestions must not silently become project requirements.

When an important decision has not been defined, the agent should identify the issue and ask for clarification rather than inventing an answer.

---

## 19. Development Philosophy

The project should be built in **small, understandable, testable increments**.

A development step should normally accomplish one logical objective.

After completing that step, the implementation should be tested and reviewed before proceeding to the next step.

This is particularly important because SpaceTime Explorer AI combines:

* physics
* software
* visualization
* education
* AI interaction

Keeping these areas separate and developing them incrementally will make it easier to determine whether a problem is physical, computational, visual, or educational.

---

## 20. Future Development

Experiment 1 is the beginning of the project rather than the complete application.

Future experiments will progressively expand the learner's understanding of relativity and spacetime.

However, future experiments and their order will be defined explicitly.

The project documentation should be updated as new experiments are designed and approved.

Each new experiment should answer three questions:

1. **What physical idea is being introduced?**
2. **What should the learner discover through the experiment?**
3. **How does this experiment build on what the learner already understands?**

Only after those questions have been answered should implementation begin.

---

## 21. Definition of Success

SpaceTime Explorer AI will be successful if a learner can use the application to move from:

**"I have read about this concept."**

to:

**"I have experienced an experiment that demonstrates it."**

to:

**"I can describe what happened."**

to:

**"I understand why it happened."**

and eventually to:

**"I can use the underlying physical and mathematical ideas to reason about a new situation."**

The ultimate objective is therefore not merely to create an attractive relativity simulator.

It is to create an **interactive learning environment in which the learner develops physical intuition through experimentation, observation, and guided reasoning**.

---

## 22. Current Project Status

The project foundation uses:

* React
* TypeScript
* Vite
* Vitest

Experiments 1 and 2 are implemented.

Experiment 3 (the moving clock) has an approved specification, a tested physics model, and an interface with the prediction step, results panel, and AI tutor. It has had its complete-flow test and final review, and its review items have been addressed.

Experiment 4 (the light clock) has an approved specification and is implemented, with its complete-flow test and final review done. It explains why the effect shown in Experiment 3 happens.

Experiment 5 (why can't light go faster?) has an approved specification and is implemented, with its complete-flow test and final review done. It shows the light clock of Experiment 4 under two rules for light, an everyday rule in which speeds add and light's actual rule in which light always travels at `c` in the lab, so that the learner can see what the constancy of the speed of light is responsible for. Experiment 6 (does motion change length?) has an approved specification and is implemented, with its complete-flow test and final review done. It was chosen by the project owner beyond the planned progression, and it shows that time dilation with light at `c` requires a clock moving along its own length to be shorter, as seen from the lab (length contraction). The next step is to decide the direction of the next experiment with the project owner and propose its specification.

The application is presented as a guided journey: one experiment per screen, in order, with a sidebar showing the sequence and the learner's progress. This follows the progressive structure described in Section 7. Learners can revisit any chapter.

This document defines the overall project vision.

Individual experiment specification documents define the detailed behavior of each experiment.

Development instructions define how the coding agent should work within this project.
