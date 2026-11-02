# Gap report: Black Holes and Strong Gravity Experiment 3 (Orbits Near a Black Hole: Is There a Point of No Safe Orbit?)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/03-orbits-near-a-black-hole.md | Components: src/components/OrbitsNearBlackHoleExperiment.tsx, OrbitsNearBlackHoleTutor.tsx | Physics module: src/physics/orbitsNearBlackHoleExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, two bird's-eye orbit pictures (ordinary gravity, exact theory) plus a distance-against-turns graph, each with a captioned guide, a Results part (one table, three text prediction checks, worked math) and a tutor. The captions are the most detailed of the five experiments. Gaps: no guess marks, no source lines, no check-up or table notes, "What to look for" is one or two sentences. Size: **Medium** (the last-safe-orbit guess fits the existing purple ring and the graph's distance axis; Prediction 1 and 3 are outcome markers).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Probe circling at 2 horizon radii gets a tiny inward nudge: what happens? (OrbitsNearBlackHoleExperiment.tsx:655) | wobbles / spirals in / flies off (:66-70); `nudgePrediction`, locked as `submittedNudge` (:473-477) | Orbit pictures, only when the learner starts at 2 radii; the distance graph |
| 2 | Where is the last safe place to circle? | anywhere / about 3 / about 10 horizon radii (:72-77); `lastSafePrediction` | Purple "last safe orbit" ring in the exact-theory picture and the purple dashed line in the graph (real value 3) |
| 3 | 20 horizon radii out, does the exact theory's orbit look different from ordinary gravity's? | very different / nearly the same (:79-83); `farPrediction` | The two panels at start = 20 (the paths nearly coincide) |

## Rule A
| Item | Result | Evidence | Gap / what is needed |
|---|---|---|---|
| A0 | Met | :422-424 | Listed |
| A1 | Met | `runOrbitsNearBlackHoleExperiment` etc.; prediction state only picks wording in :1031-1066 | None |
| A2 | Not met | no mark in `OrbitPanel` or `DistanceGraph` (:177-420) | P2: white YOUR GUESS ring at 3 or 10 radii (and a line on the graph); "anywhere" has no position so a marker. P1 and P3: outcome markers |
| A3 | Not met | | P2 would follow the guess; P1, P3 are marker-only |
| A4 | Not met | purple ring is drawn from the first frame (`showLastSafeOrbit`, :893) | The mark must wait with the ring; the graph's scale is zoomed to the start (:971), so a ring at 10 may fall off the graph and needs thought |
| A5 | Partly | P1 and P3 need the start set to 2 or 20; the learner may be looking at another start | Marker only where the start matches; otherwise state "your guess was about 2 radii" in a small panel |
| A6 | Not met | none under the pictures (:850-976) | Needed: paths are calculated here by a model with our own nudge (:1129), not observed |
| A7 | Not met | intro (:534-650) does not mention predictions not changing pictures, white marks or controls | Add; add note by the black hole and start controls |
| A8 | Not met | module has `exactCircularSpeedFractionOfLight`, `ordinaryCircularSpeedFractionOfLight`, `orbitPath`, `runOrbitsNearBlackHoleExperiment`, `modelEdgeInHorizonRadii` | Missing: guess to ring radius mapping and tests |
| A9 | Partly | Tutor observe (OrbitsNearBlackHoleTutor.tsx:~114) asks about the probes, not marks; compare (:117) restates the guesses; explained step does not mark them | As A9 in the checklist |
| A10 | Not met as such | no "predictions do not change" sentence found; "locked in" wording only | n/a |

## Rule B
- B0 tables today: Results table of 6 rows (:987-1020): the two probes, two launch speeds, last safe orbit, the model's edge; paragraph on why the model's edge is above 3 (:1022-1030); three prediction checks (:1031-1066); worked math (:1069-1105); daily-life comparison (marble in a bowl, :1109); "can and cannot tell you" box (:1127).
- B1 Not met. Reference exists in the same physics: the exact theory's last safe orbit 6GM/c² = 3 horizon radii (the module test :161 compares the model's edge with it). Nothing measured is cited. A check-up could set "exact theory: 3" beside "this model's edge: about 3.0x" (row 6 already states both).
- B2 Not met: no "What this table tells us". The paragraph after the table explains the 3 vs model's edge, which is the nearest thing.
- B3 N/A: the controls pick a hole and a start; nothing published to compare.
- B4 Partly: guesses repeated with verdicts "So your prediction was right / off this time" (:1038-1066); no tag on a row; no marks.
- B5 Partly: table values come from the module. The UI does arithmetic: `(exact/ordinary - 1) * 100`, "% of its starting distance" (`Math.max(1 - closest/2, farthest/2 - 1)`, :1038), and a hard-coded "3.5" in the text (:1046). Tutor imports not read for numbers.

## Rule C
- C1 Met (read): each `OrbitPanel` has a title, a legend with row labels, a scale bar and labelled rings (:340-406); the graph labels the three dashed lines and both lines (:220-249).
- C2 Met: gold versus blue, plunge ends at the rose horizon; launch speeds differ.
- C3 Met: three captions "How to read this picture / graph" (:852, :899, :942).
- C4 Met in structure: "What you are looking at", the probe, the nudge (with 0.6% of distance per turn), the purple ring, scale, axes, dashed lines, "how to read a line" with a car-on-a-ring-road comparison. Unit: "horizon radii" is used in Prediction 1 and the controls, but the intro's word list (:584-597) defines circular orbit, nudge, plunge and horizon, not horizon radius (it relies on Experiment 1).
- C5 Partly: the "0.6%" nudge and the ring-road comparison help, but no worked moment with run numbers.
- C6 Not met: "What to look for" is one or two sentences per picture (:872, :920), not Look at / Means / Why.
- C7 Partly: the caption of the exact picture says "Notice where the white start ring sits compared with it [the purple ring]" (:915-916) and defines the last safe orbit (:913-915) and its value 3, which is Prediction 2's answer. The picture only appears after lock-in, so this is not a pre-prediction leak.
- C8 Partly met: circular orbit, nudge, plunge, horizon and last safe orbit are defined where first used; "horizon radius" is not defined on this page (the prediction at :655 and the sliders already use it).

## Other findings
- O1: none against the spec found in the parts read.
- O2: Results verdict sentences ("right", "off this time") are the older-rule form.
- O2: the Results state, in a hard-coded sentence, "a probe starting at 3.5 keeps circling for all {MAX_TURNS} turns" (:1046); this is a module test fact (test :115) but is typed in the UI.
- O2: the marble-in-a-bowl comparison is labelled as an analogy; no source.

## What an update would touch, and its size (O3, O4)
OrbitsNearBlackHoleExperiment.tsx (marks in OrbitPanel and DistanceGraph, source lines, check-up, notes, caption items, intro and control notes), OrbitsNearBlackHoleTutor.tsx, physics/orbitsNearBlackHoleExperiment.ts and .test.ts, specification. Size: **Medium**.

## Not checked
Not run in a browser; SVG detail judged from grep of the text elements and the caption text. The tutor's explained step was not read line by line. Links: none on this page.
