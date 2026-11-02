# Audit Plan: Bringing the Older Experiments Up to the Newer Rules

**Status:** DRAFT, written 2026-11-02 for the owner's review (CLAUDE.md §23 Stage 4 and §28.1). Nothing in this plan is started or approved. No code, wording or specification has been changed because of it.

## 1. Why this audit exists

On 2026-10-24 the owner decided that the experiments built before the newer rules would be audited and updated later, one at a time, after the project was complete. The project was completed on 2026-11-02 (the Conclusion page). This plan sets out what the audit would check and change, and asks the owner to decide the open points in §7 before anything starts.

Until the owner approves a plan, CLAUDE.md §14 still says: do not add guess marks to the older experiments and do not change their wording.

## 2. What is audited

71 experiments follow the older rules:

| Group | Experiments | Count |
|---|---|---|
| Relativity of Time and Motion | 1 to 11 | 11 |
| Gravity and Curved Spacetime | 1 to 9 | 9 |
| Gravitational Waves | 1 to 7 | 7 |
| Cosmology | 1 to 10 | 10 |
| Black Holes and Strong Gravity | 1 to 10 | 10 |
| Spacetime Geometry | 1 to 10 | 10 |
| Cosmic Horizons | 1 to 14 (specification numbers) | 14 |
| **Total** | | **71** |

Not audited, because they were built to the newer rules: Cosmic Horizons 15 (the pilot) and 17 to 25 (specification numbers), and all seven experiments of Evidence and Imagination. Cosmic Horizons Experiment 12 already has the reading guide (Rule B below), so it needs only Rule A.

The group recaps and the Conclusion and Welcome pages are not experiments and are not audited, except that a recap's quoted figures must still match any experiment this audit changes.

## 3. The rules the audit applies

Each one comes from CLAUDE.md §14 (and §29 for Cosmic Horizons).

**Rule A: Predictions and the Real Results.** For every experiment with a prediction:

1. The real pictures, tables and numbers never change with a guess.
2. The guess is drawn on the real picture where its answer lives, as a separate white mark with a "YOUR GUESS" box joined by a line. Imagined things are drawn in another colour and called "imagined".
3. The mark follows the guess. Where a guess has no size or position (yes or no), a marker is drawn and the caption says it is only a marker.
4. The mark is drawn only once the feature beside it is drawn.
5. If the predicted quantity has no picture, it goes into the nearest picture as its own panel, not a new picture.
6. Every picture with a guess mark has a "Where the real picture comes from" line (measured, calculated here, imagined).
7. The introduction says that predictions never change the pictures or tables, that guesses are drawn in white and shown again beside the results, and which controls change which drawings. Controls get a note saying the same.
8. Every number for the marks comes from the physics module, with tests.

The tutor's observe and compare prompts then point to the marks by name. The mark never says "right" or "wrong"; the tutor marks predictions in its explanation.

**Rule B: Reading the Results.** For every Results panel:

1. A check-up table (expected against found, with a plain reading), only where a real reference exists.
2. A "What this table tells us" note under each table: what it is, what it means with real numbers, why it matters.
3. Optional: a table that follows the learner's controls, only where a real reference exists and it tells the learner something the pictures do not.
4. The learner's predictions shown beside the results, guess only.

All comparison numbers come from the physics module, with tests.

**Rule C: Animated diagram standards.** Every drawn component is labelled on the canvas; compared quantities look different; a "How to read this diagram" caption names every picture and element, defines units, describes what appears when, gives a worked moment, and has "what to look for" items in Look at / What it means / Why it matters form, drawn only once the feature is drawn, with no early reveal of what the learner is to predict.

**Rule D (Cosmic Horizons 1 to 14 only): §29.** Introduction and captions to the group's standard; a "Want to know more?" list; the §29 rule 3(c) gap recording where no plain official page exists.

## 4. What a text search found (rough; not a finding)

A search of `src/components` for the rules' wording gave this picture. It shows where to expect the largest gaps. **It is not an audit result.** The search matches wording, and older experiments may meet a rule in different words, or fail it while using the same words. For example, a search for "your guess" also matches ordinary prediction text, so it cannot tell a white guess mark from a prediction button. Step 1 of the audit reads every experiment and replaces this section with real findings.

- "Where the real picture comes from" (Rule A, item 6): found only in experiments built to the newer rules (Cosmic Horizons 15 and 17 to 25, and Evidence and Imagination). It was not found for any of the 71 older experiments. Expect every one to need it where it gets a guess mark.
- "What this table tells us" (Rule B): found in Cosmic Horizons 12 to 14 among the older experiments and not in the rest of the 71. CLAUDE.md says only Experiment 12 has the full guide, so 13 and 14 still need checking against §14.
- Caption headings (Rule C): the captions use many headings ("How to read this diagram", "How to read this drawing", "How to read these results", "How to read Picture 1", and others), in 68 files. A search for the heading therefore says nothing about whether a caption meets Rule C. Each caption must be read for the Look at / What it means / Why it matters form and for the worked moment.
- "Want to know more" (Rule D): not checked for the 71 beyond the group rule of 2026-10-19; Step 1 checks it for Cosmic Horizons 1 to 14.
- Limits of the search: it matched file-name prefixes, so a few experiments' results were mixed with those of experiments whose names begin the same way (for example the first Black Holes experiment with the later ones). Experiments 1 to 6 of Relativity of Time and Motion use differently named files and were not covered. No count in this section should be reused.

## 5. The method for each experiment

Follows CLAUDE.md §6 (one step at a time) and §28.

**Step 0, one-off, before any experiment:** the owner approves this plan and the decisions in §7. Claude then writes a short checklist file for the audit (`docs/audit/00-checklist.md`) so every experiment is judged the same way.

**For each experiment, in the order the owner chooses:**

1. **Read.** Claude reads the experiment's specification, component files, physics module and tests, and writes a one-page gap report in `docs/audit/<group>/<number>-gap-report.md`: for each of Rules A to D, "met", "partly met" or "not met", with what is missing. Nothing is changed. Claude stops; the owner reads the report and says which gaps to fix.
2. **Draft wording.** Claude drafts every new piece of learner-facing wording (introduction lines, guess-mark labels, "Where the real picture comes from" lines, captions, reading guide, tutor prompts). The owner approves it line by line (§28.1). Claude stops.
3. **Physics.** Any new number for a guess mark or a comparison is added to the physics module with tests first (§9, §10). The approved physics is not changed. Claude stops.
4. **Build.** Claude builds the approved change into the interface and runs the tests, `tsc --noEmit -p tsconfig.app.json` and the build.
5. **Check in a browser** at the normal width, and at a narrow width where the drawing changes (§28.4). Claude tells the owner the address and says what was and was not checked.
6. **Update the specification** (only with the owner's approval, §28.2) and the status file `docs/DEVELOPMENT-STATE.md`.
7. **Commit** only when the owner asks (§28.5), one focused commit per step.

Claude never moves on to the next experiment without the owner's go-ahead.

## 6. Risks and things to protect

- **Physics must not change.** The audit changes what is drawn and said, not the approved physics. If a guess mark needs a number the module does not give, the module gets a new tested function; existing functions and results stay as they are. Any result that would change is reported to the owner first (§8, §16).
- **§12 (no early reveal).** A guess mark or caption must not show the answer before the learner has predicted. Several older experiments were written when this was handled differently, so each caption must be rechecked.
- **Experiments with no suitable picture.** Some predictions (for example a yes or no) may have no natural place on a picture. Rule A, item 5 says to add a panel to the nearest picture. Where that would clutter the drawing, Claude reports it and the owner decides.
- **Cross-references.** "What's next" lines, group recaps and the Conclusion page quote or point to earlier experiments. A changed experiment may need those rechecked, and numbering follows the learner's numbers (CLAUDE.md §27, Cosmic Horizons numbering).
- **Volume.** Every experiment has about four to six pieces of wording to approve. The plan asks for one experiment at a time so that review never piles up.
- **Tests.** The suite (2,152 tests) must keep passing after each experiment. Where an older experiment has no physics module for a guess's number (for example, a purely qualitative prediction), the module gets a small tested function rather than a number typed into the interface (§9).

## 7. Decisions needed from the owner

1. **Scope of Rule B.** Apply the full reading guide to every older experiment, or only the check-up and "What this table tells us" notes, or leave Rule B out? CLAUDE.md says whether to add it is the owner's decision, one experiment at a time. Recommendation: decide per experiment in its gap report; do not pre-commit all 71.
2. **Experiments where a guess mark makes no sense.** Should the audit skip Rule A for an experiment whose predictions have no place on any picture, or add a marker panel? Recommendation: add the panel where one fits and skip with a recorded reason where it does not.
3. **Order.** Options:
   - **(a) Group by group, in sidebar order**, starting with Relativity of Time and Motion. Easy to follow; matches how the learner meets the lessons; but the oldest experiments are also the simplest and may need the least.
   - **(b) Cosmic Horizons 1 to 14 first.** They are newest of the older set, closest to the new rules (they already have §29 links, a "Words and formulas" panel, controls and four tables) and so the cheapest to bring up to date; Experiment 12 already has Rule B. This builds the routine on easy cases.
   - **(c) Biggest gaps first**, decided after the Step 1 gap reports.
   - Recommendation: (b), then (a) for the other six groups.
4. **Gap reports first, all at once?** Claude could write gap reports (Step 1 only, no changes to the app) for all 71 before any fix, so the owner can see the total work and choose the order with real information. Recommendation: yes; it is read-only and gives the owner a real count.
5. **Tutors.** The rule says the tutor's observe and compare prompts point to the marks by name. Allow tutor wording to change for each audited experiment, always with line-by-line approval?
6. **Specifications and project documents.** Update each experiment's specification and `docs/DEVELOPMENT-STATE.md` as each one is finished (the plan's default), or in a batch at the end?
7. **Pace and stopping rule.** Default: one experiment fully finished (Steps 1 to 7) before the next begins. The owner may prefer to batch several gap reports or several approvals.

## 8. What is not part of this audit

- New experiments or new physics (§16).
- Fixing the open source-check items listed for each experiment (these stay as recorded in `docs/DEVELOPMENT-STATE.md`), unless the owner asks.
- Narrow-width, other-browser, keyboard or real-learner checks that were left open earlier, except for the pages this audit changes.
- Redesigning any screen or changing the font size or toggle-button styling (§27).

## 9. How the plan will be tracked

A single file, `docs/audit/PROGRESS.md`, lists the 71 experiments, each with: gap report written, wording approved, built and tested, browser-checked, specification updated, committed, with dates. It would be created at Step 0.
