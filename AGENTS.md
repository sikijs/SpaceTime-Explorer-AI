# SpaceTime Explorer AI — Project Instructions

## Project Purpose

SpaceTime Explorer AI is an interactive educational laboratory for understanding
relativity, spacetime, gravity, astronomy, aerospace, and cosmology.

Relativity is the central subject. Other space and aerospace topics are used as
applications that help learners understand the underlying physics.

The project is educational, not a professional scientific simulation package.

## Development Philosophy

Build the project incrementally.

Do NOT attempt to build the complete application at once.

Each experiment or feature must be designed and scientifically specified before
it is implemented.

Work on one small, independently testable task at a time.

Do not implement future phases unless explicitly requested.

## Physics Authority

The physics engine is authoritative.

The AI tutor must interpret results produced by the physics engine rather than
inventing physical results.

Do not introduce physical assumptions, equations, approximations, or models
unless they are explicitly specified in the experiment design or approved
during development.

When an approximation is used, document it clearly.

## Separation of Responsibilities

Keep these concerns separate:

1. Physics

   * Physical laws
   * Calculations
   * Simulation state
   * Numerical methods

2. Simulation

   * Experiment setup
   * Parameters
   * Running experiments
   * Producing measurable results

3. Visualization

   * Graphs
   * Diagrams
   * Animations
   * 2-D and 3-D representations

4. AI Tutor

   * Explaining the experiment
   * Asking questions
   * Interpreting simulation results
   * Adjusting explanations to the learner's level

The AI must not replace the physics engine.

## Educational Philosophy

The primary learning cycle is:

Observe → Predict → Experiment → Analyze → Explain → Mathematics

Whenever practical, learners should be encouraged to make a prediction
before running an experiment.

Explanations should begin conceptually and introduce mathematics gradually.

Avoid introducing mathematical formulas before the learner understands what
the physical quantities represent.

Provide multiple levels of explanation where appropriate:

* Conceptual
* Visualization
* Mathematics
* Advanced / Derivation

## Experiment Development

Every experiment should have a written specification before implementation.

Experiment specifications should define:

* Purpose
* Learning objective
* Physics
* Inputs
* Outputs
* Simulation rules
* Visualization
* User interaction
* Learner-facing introduction, including any new terms it must define
* AI tutor behavior
* Tests
* Explicit exclusions

Do not combine several experiments into one implementation task unless
specifically requested.

## Code Quality

Prefer simple, readable code over unnecessary abstraction.

Keep modules small and understandable.

Write tests for physics calculations.

Physics calculations should be deterministic whenever possible.

Do not hide important physical calculations inside UI code.

## Coding Agent Workflow

The project may be developed using different coding agents, including Claude Code
and OpenCode.

AGENTS.md is the shared, agent-independent source of project instructions.

The human decides what physics and educational behavior the application should
implement.

The coding agent implements the approved specification.

Before coding a significant feature:

1. Read the relevant documentation.
2. Confirm the requested scope.
3. Implement only that scope.
4. Write or update tests.
5. Verify the implementation.
6. Report what was changed.

Do not silently expand the scope of a task.

After completing a step, report the result and stop. Do not begin the next
step until the human authorizes it.

Do not implement an experiment until the human has approved its
specification. Do not change an approved specification without the human's
approval.

Learner-facing text (introductions, explanations, captions, tutor wording) is
part of the educational design. Draft it from the approved specification, add
no claims the specification does not contain, and let the human review it.

Define every specialized term in plain language before it is used.

Check user-interface changes in a browser, since tests do not cover
appearance, and report anything that was not verified.

## Git

Make small, meaningful commits.

A commit should represent a coherent change that can be understood and,
if necessary, reverted independently.

Do not make large unrelated changes in a single commit.

Commit only when the human asks. Keep the human's own uncommitted changes in
separate commits from the agent's changes.

## Current Development Rule

Documentation and scientific design take priority over application code.
Each new experiment is specified and approved by the human before it is
implemented.

Build the architecture only as far as the approved experiments require.
