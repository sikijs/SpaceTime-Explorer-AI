# Audit Checklist and Gap-Report Template

Applies `docs/AUDIT-PLAN.md` (approved 2026-11-02, "approved, write the gap reports first"). A gap report is **read-only**: it changes no code, wording, specification or test. It records what each older experiment has and lacks against Rules A to D of the plan. Source of the rules: `CLAUDE.md` §14, §15, §29.

Mark each item **Met**, **Partly met** or **Not met**, or **N/A** with a reason. Quote the file and line (`path:line`) for the evidence. Do not judge from a text search of a heading; read the thing. Never mark Met for something you did not read.

## Rule A: Predictions and the Real Results
- A0. Does the experiment have a prediction at all? List each prediction (question, answer buttons or input, and where the learner's answer is stored).
- A1. Real pictures, tables and numbers do not change with a guess. (Check the code: no real value reads the prediction state.)
- A2. Each guess is drawn on the real picture where its answer lives: a white mark with a "YOUR GUESS" box joined by a line. Say where each guess would go (which picture, which axis or element) and whether one exists.
- A3. The mark follows the guess; where a guess has no size or position (yes or no) a marker is used and the caption says so.
- A4. The mark appears only once the feature beside it is drawn.
- A5. If the predicted quantity has no picture: name the nearest picture and what panel would be added.
- A6. "Where the real picture comes from" line under every picture that carries a mark (measured by whom, calculated here, imagined).
- A7. Introduction says predictions never change the pictures or tables, that guesses are drawn in white and shown again beside the results, and which controls change which drawings; a note beside any controls says the same.
- A8. Numbers for the marks (the guess's size or position and the real value) come from the physics module, with tests. List which module functions exist and which are missing.
- A9. Tutor's observe and compare prompts point to the marks by name, and the tutor marks each prediction in its explanation only.
- A10. Does the experiment currently say, anywhere, that predictions do not change the results (the older rule)? Quote it.

## Rule B: Reading the Results
- B1. Check-up table near the top: expected beside found, with a plain reading. Only where a real reference exists. Say whether a real reference exists and what it would be (from the specification's sources).
- B2. A "What this table tells us" note under each table: what it is, what it means with real numbers, why it matters.
- B3. (Optional) a table that follows the learner's controls, only where a real reference exists and it tells the learner something the pictures do not.
- B4. The learner's predictions shown beside the results, guess only, with a small tag on the table row where the number appears.
- B5. Comparison numbers come from the physics module, with tests.
- B0. List each Results table or block that exists today.

## Rule C: Animated diagram standards (and captions)
- C1. Every drawn component is labelled directly on the canvas. List any unlabelled shape.
- C2. Compared quantities look visibly different (a control that changes a number must change the drawing).
- C3. A "How to read this diagram" caption (any heading) beneath every picture.
- C4. The caption names every picture, lists every drawn element and says what it means, defines units and terms used in labels, describes what appears when in order, and uses short sections or bullets.
- C5. A worked moment with real numbers.
- C6. Every "what to look for" item is in three parts: Look at / What it means / Why it matters, and an item appears only once its feature is drawn.
- C7. Nothing in the caption reveals what the learner is asked to predict (§12).
- C8. Terms are defined in plain words before they are used (§15).

## Rule D (Cosmic Horizons 1 to 14 only): §29
- D1. Introduction up to date, detailed and in simple terms (§29 rule 1).
- D2. Captions to the same standard (§29 rule 2; overlaps C).
- D3. A "Want to know more?" list of links, visible from the start: paper or official release for each result, and a plain official page for each background idea; or a recorded "no plain official page found" gap (rule 3(c)).
- D4. Results reading guide (§29 rule 4; same as Rule B).

## Rule E: The page in four Parts (added 2026-11-02, after Cosmic Horizons 12; not yet a written rule in `CLAUDE.md`)
The pattern began with Experiment 15 and is used by every experiment built to the newer layout (for example the learner's Experiment 24). Check, by reading the component:
- E1. The page below the introduction is split into **Part 1: Predict, then watch** (the predictions, Run, the stages and the pictures), **Part 2: Now try it yourself** (the controls and any drawing that follows them), **Part 3: The results** and **Part 4: The tutor**. An experiment with no controls or no tutor step says which Part it lacks.
- E2. Each Part starts with a thick coloured line, a coloured heading and a short "What we are about to do" lead, in the shared colours: amber `#d97706`, pink `#be185d`, teal `#0f766e`, blue `#0066cc`.
- E3. The introduction, the "Want to know more?" list (Cosmic Horizons) and any "Words and formulas" panel stay above Part 1, with no Part heading.
- E4. Each lead is accurate for its Part (Part 1's gives none of the answers; Part 3's says which tables never change with a guess or a setting; Part 4's matches the tutor's steps).
- E5. Where the experiment has more than one part of its own (Spacetime Geometry 5 and 6 have three and two), say how they map onto the four Parts. Do not decide it.

The first 71 gap reports were written before this item existed. They do not cover Rule E, and each experiment's Step 1 re-read must add it.

## Other things to record (not rules, but the owner needs to know)
- O1. Anything that conflicts with `docs/PROJECT.md`, `AGENTS.md` or the specification (CLAUDE.md §3, §20). Report, do not decide.
- O2. Anything in the learner-facing text that looks wrong, early (§12) or unsourced. Report, do not fix.
- O3. Files that would be touched by an update (component, pictures, results, tutor, physics module, tests, specification).
- O4. A rough size of the update: **Small** (wording and labels only), **Medium** (new physics-module functions plus marks on one or two pictures), **Large** (new pictures or panels, or a reading guide for several tables).

## Report template (copy into each report)

```
# Gap report: <Group> Experiment <N> (<title>)
Date: 2026-11-02 | Specification: <path> | Components: <paths> | Physics module: <path> | Status: read-only, nothing changed

## Summary
<3 to 5 lines: what the experiment has, the biggest gaps, size S/M/L>

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |

## Rule A
| Item | Result | Evidence (path:line) | Gap and what would be needed |
(A1 to A10)

## Rule B
(B0 to B5)

## Rule C
(C1 to C8)

## Rule D  (Cosmic Horizons 1 to 14 only)
(D1 to D4)

## Other findings (O1 to O2)

## What an update would touch, and its size (O3, O4)

## Not checked
<what was not read or run>
```
