# Gap report: Black Holes and Strong Gravity Experiment 7 (The color of the fall)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/07-color-of-the-fall.md | Components: src/components/ColorOfTheFallExperiment.tsx, ColorOfTheFallTutor.tsx | Physics module: src/physics/colorOfTheFallExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, two pictures (a colour strip and a wavelength graph), three tables with a worked calculation, and a four-step tutor. Older rule: guesses are text only, and Results marks each "right" or "off". Biggest gaps: no guess marks, no "where the picture comes from" lines, no table notes, no three-part look-for items, and the verdict logic is in the component. Prediction 3 (does the black hole's size matter) has no picture, because the pictures show one black hole at a time. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | What happens to the colour the observer receives? (ColorOfTheFallExperiment.tsx:39-45) | stays green / bluer / redder to a limit / redder with no limit | Picture 1 strip: the orange marker against the green marker; Picture 2 curve |
| 2 | Does the light stay visible to the horizon? (:47-52) | all the way / near the horizon / well before | Picture 2: where the curve crosses the 750 nm line, along the gap axis |
| 3 | Is the colour at 5 horizon radii different for a 10-Sun hole and M87*? (:54-59) | much redder for small / for M87* / same | No picture (only one black hole is drawn at a time) |
Stored in `submitted*` state; read only in Results (:967-1007) and the tutor props (:1147-1154).

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `ColorStrip` (:158) and `WavelengthGraph` (:343) take only `result` and `progress`; tables read `result`/`start` | none |
| A2 | Not met | No white mark or "YOUR GUESS" box (:158-340, :343-466) | P1: white marker on the strip (a position along the wavelength axis for "same" and "bluer"; an arrow past the edge for "no limit"); P2: white marker on Picture 2 |
| A3 | Not met | none | "Stays green" has a position (550 nm); "limit" has no number, so a marker only, with a caption line saying so |
| A4 | Not met | The strip builds with `progress`, no guess mark | Draw marks only once the received marker has moved |
| A5 | Not met | P3 has no picture | Add a small second panel to Picture 2 or the strip: the two black holes' colour at 5 horizon radii side by side, on its own scale and title (Results already notes they are equal, :999-1002) |
| A6 | Not met | No source line under either picture (:820-870, :874-912) | Add: calculated here from the given formula; nothing measured; the lamp wavelength 550 nm is the page's choice |
| A7 | Not met | Introduction (:575-661) says nothing about guesses never changing the pictures or being drawn in white | Add the wording (owner to approve) |
| A8 | Not met | Module exports `stretchFactor`, `receivedWavelengthNm`, `distanceWhereWavelengthPasses`, `bandOf`, `runColorOfTheFallExperiment` (colorOfTheFallExperiment.ts:45-162). No guess-mark values. Verdict logic is in the component (:975-1006) | New functions and tests |
| A9 | Partly met | Observe prompt names "the orange marker" and "the graph" (Tutor:124); compare lists the guesses without marking (:126-127). Results marks them first (:975-1006) | Prompts would name the white marks; verdicts move to the tutor (owner's decision) |
| A10 | Not met | No such sentence in the introduction, controls or Results | See O1 |

## Rule B
- B0: Results has a 6-row table (:931-965), three "Checking your Nth prediction" paragraphs (:967-1007), a 5-step worked calculation (:1009-1034), a "why the wavelength is stretched by the same number" check (:1035-1043), a near-horizon table (:1049-1074), a release-distance table (:1081-1107), a siren comparison (:1109-1115) and a limits box (:1117-1139).
- B1 Not met / probably N/A: no measured reference. The spec lists the received-wavelength relation and the band edges as not checked against a primary source (07-color-of-the-fall.md:238, :243). A reference-style row could be "the 750 nm edge of visible light", which is a convention the page itself calls non-sharp.
- B2 Not met: no "What this table tells us" notes; one-line remarks only (:1075-1079).
- B3 N/A: the controls only move marks.
- B4 Partly met: guesses are shown in Results with a verdict; no tag on a table row.
- B5 Partly met: numbers come from the module; the right/off decision is made in the component.

## Rule C
- C1 Met: traveler + lamp, observer, crests as emitted/received, bands, both markers and legend are labelled (:238-337); Picture 2 labels the curve, 550 nm line, 750 nm and 1 mm lines, the dot (see labels at :363-466).
- C2 Met: lamp's own colour (green, fixed) against received (orange, moving); crest spacing is drawn to scale up to 20 times (:187).
- C3 Met: captions at :822 and :876.
- C4 Mostly met: pictures, markers, strip bands, units (nm, log scale) and terms are explained. Not explained: how the picture builds over the run, step by step.
- C5 Partly met: no worked moment with numbers in either caption; numbers only in the "In this run" line for Picture 1 (none in Picture 2's caption).
- C6 Not met: Picture 1 has "What to watch" as one sentence (:862-864); Picture 2 has none.
- C7 Partly met: "What is really happening" (:848-853, :898-901) states the full mechanism (the stretch factor of Experiment 6 applied to the wavelength) before the tutor; §12 is not broken because the learner has predicted, but §14 leaves it to the tutor.
- C8 Met: wavelength, nanometer, visible, infrared, microwave, radio, as emitted/received are defined in the introduction (:607-621).

## Rule D
N/A. No external links on the page.

## Other findings
- O1: CLAUDE.md §14 says the older experiments state that predictions do not change the pictures. This one does not (A10).
- O2: White is already used for "where the traveler is now" (the dot on Picture 2, caption :894), which would clash with a white guess mark. The tutor's conceptual question (Tutor:128) follows a caption that already gives the reason (:848-853).

## What an update would touch, and its size
ColorOfTheFallExperiment.tsx, ColorOfTheFallTutor.tsx, the module and its tests, the specification. Size: **M** (marker-only marks on two pictures, one new panel for Prediction 3, new module functions, A6/A7 wording, table notes for three tables).

## Not checked
Not run in a browser; tests not run; the tutor's explanation step, the WavelengthGraph SVG body (only its text labels were scanned) and "What's next" not read in full.
