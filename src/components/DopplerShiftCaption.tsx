import { runSky } from '../physics/aberration'
import { DEFAULT_SOURCE_NM, runDoppler } from '../physics/dopplerShift'
import { LookForList } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'

// Spacetime Geometry 8: "How to read this diagram" (CLAUDE.md §14), the approved wording of 2026-10-16 with the audit changes of 2026-11-23
// (docs/audit/spacetime-geometry/08-draft-wording.md, section 3, approved the same day): the orange ring in place of the white one, the white-marks bullet, the worked moment for the star we
// follow, look-for items in three parts (each shown only once its feature is drawn) and "Where the real picture comes from". Nothing here says which way a color shifts before the learner
// has seen the traveler's sky (§12).

function formatNm(nm: number): string {
  return nm >= 100 ? String(Math.round(nm)) : String(Number(nm.toPrecision(2)))
}

interface SkyCaptionProps {
  speed: number
  stepsShown: number // how many of the 13 build-up steps are drawn
  showMarks: boolean // the bar's marks, the wedge counts and the crossing lines are drawn
  complete: boolean // the run has ended
  marksDrawn: boolean // the learner's white marks are drawn (Part 1 only)
}

export function SkyCaption({ speed, stepsShown, showMarks, complete, marksDrawn }: SkyCaptionProps) {
  const doppler = runDoppler(speed)
  const sky = runSky(speed)
  const followed = doppler.stars[6]
  const ahead = doppler.stars[0]
  const behind = doppler.stars[12]
  const crossing = doppler.travelerCrossingAngle ?? 0
  const lookFor: LookFor[] = []
  if (stepsShown >= 1) {
    lookFor.push({
      look: 'the dots in the lab’s sky and in the traveler’s sky.',
      means: `both rings hold the same 24 stars. In the lab’s sky every dot is the same yellow-green, ${DEFAULT_SOURCE_NM} nm.`,
      matters: 'it is the same stars and the same starlight in both pictures, so any difference between the pictures comes from who is looking, not from the stars.',
    })
  }
  if (showMarks) {
    lookFor.push(
      {
        look: 'the orange-ringed dot at the right of the traveler’s sky and the orange row on the bar.',
        means: `this is the traveler’s measurement of the star straight ahead. At ${speed}c its factor is ${ahead.factor.toFixed(2)} and its wavelength is ${DEFAULT_SOURCE_NM} ÷ ${ahead.factor.toFixed(2)} = ${formatNm(ahead.wavelengthNm)} nm${ahead.range === 'visible' ? ', which is visible' : ahead.range === 'ultraviolet' ? ', which is ultraviolet, so its dot is drawn as a UV marker and not as a color' : ', which is infrared, so its dot is drawn as an IR marker and not as a color'}.`,
        matters: 'this is the one star the traveler flies straight toward, so it is the cleanest test of whether motion changes color.',
      },
      {
        look: 'the yellow-ringed dot and the yellow row on the bar.',
        means: `this is the star the lab sees exactly sideways, at 90°. At ${speed}c the traveler’s factor for it is ${followed.factor.toFixed(2)}, so its wavelength is ${DEFAULT_SOURCE_NM} ÷ ${followed.factor.toFixed(2)} = ${formatNm(followed.wavelengthNm)} nm.`,
        matters: 'a star neither ahead nor behind is the case where an everyday guess is most likely to say “no change”.',
      },
      {
        look: 'the star straight behind (the purple row on the bar).',
        means: `its factor is ${behind.factor.toFixed(2)}, so its wavelength is ${DEFAULT_SOURCE_NM} ÷ ${behind.factor.toFixed(2)} = ${formatNm(behind.wavelengthNm)} nm${behind.range === 'infrared' ? ': infrared, so it is an IR marker' : ''}.`,
        matters: 'it is the opposite case to the star straight ahead, so the pair shows that the effect depends on direction.',
      },
      {
        look: 'the dashed yellow lines and the dotted vertical line in the traveler’s sky.',
        means: `the dashed lines are at ${crossing.toFixed(1)}° from straight ahead. A star on them has a factor of exactly 1: the same color as the lab. The dotted line is 90°.`,
        matters: 'the dashed lines are ahead of the dotted line, so the stars on the 90° line are not the “no change” stars. That is a first hint that something extra is going on, which the tutor explains.',
      },
      {
        look: 'the numbers beside the wedges in the traveler’s sky.',
        means: `the traveler counts ${sky.countsTraveler.within30OfAhead} stars in the striped wedge and ${sky.countsTraveler.within30OfBehind} in the dotted one.`,
        matters: 'the stars are crowded toward the front, which is the effect of Experiment 7. This experiment adds the color to that crowded sky.',
      },
    )
  }
  return (
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> There are three pictures: two round pictures of the sky, and a bar of colors under
            them. Read them in this order: the lab’s sky, the traveler’s sky, then the bar.
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>The idea behind them.</strong> Imagine standing at the centre of a huge ring of 24 stars and looking outward at them. The
            round pictures show that ring from above, like a clock face with you in the middle. Every star sends out the same single color of
            light, a yellow-green. The question is whether the traveler, who is flying, measures that same color.
          </p>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Picture 1: The lab’s sky (sky blue title, on the left)</strong>
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            This is what the lab observer measures. Picture the lab observer sitting at the centre of the ring, looking out at the stars. The
            stars are not moving, and neither is this observer: the distance and direction to each star stay the same. “At rest” in this
            experiment just means “not moving relative to the stars.” The traveler is the one who moves, flying through the centre of the
            ring, and the next picture shows what the traveler measures instead.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>The big circle is the ring of stars, and each dot on it is one star. There are 24 stars, one every 15 degrees.</li>
            <li>
              Every dot is the same yellow-green, because this is the one color every star sends out. It is shown from the start and does
              not change during the run.
            </li>
            <li>
              The little spaceship in the middle is the traveler, and the arrow marked “direction of travel” shows which way it is flying:
              to the right.
            </li>
            <li>
              The star on the right edge is labeled “straight ahead (0°)”. The star on the left edge is “straight behind (180°)”. The
              stars at the very top and bottom are exactly sideways (90°) to the line of travel.
            </li>
            <li>The yellow ring on the top star marks “the star we follow”: the star the lab sees exactly sideways. Your second prediction is about it.</li>
            <li>The dashed orange ring on the right-hand star marks the star straight ahead. Your first prediction is about it.</li>
            <li>
              The two shaded slices are wedges. The striped one covers every direction within 30 degrees of straight ahead, and the dotted
              one covers every direction within 30 degrees of straight behind. The number beside each says how many stars are inside it.
            </li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Picture 2: The traveler’s sky (purple title, on the right)</strong>
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            This is the same sky, as measured by someone else: the traveler. Here is what that means, step by step.
          </p>
          <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Who the traveler is.</strong> The traveler is in a spaceship, flying in a straight line at a steady speed, the speed
              you chose. The lab observer sits still. The traveler does not.
            </li>
            <li>
              <strong>“At the moment it flies through the centre of the ring.”</strong> The ring of stars stays where it is, and the
              traveler moves through it. We do not follow the whole trip. We freeze one instant: the instant the traveler passes exactly
              through the centre, the same spot where the lab observer is sitting. At that instant the traveler and the lab observer are at the
              same place, so both are receiving the same light from the same stars. The only difference between them is that one is moving.
            </li>
            <li>
              <strong>“Measures.”</strong> The traveler has its own instruments. For each star it measures two things about the light that
              arrives right then: the direction the light comes from (the angle, as in Experiment 7) and its color (the wavelength). The
              traveler’s measurements are just as valid as the lab’s. This picture does not say the lab is wrong.
            </li>
            <li>
              <strong>“The same stars.”</strong> It uses the same 24 stars as Picture 1, so every star here is the partner of one in the
              lab’s picture. If you find a star in one picture, you can look for the same star in the other and compare what each observer
              measures for it. The stars themselves have not changed. What can differ is how each observer measures the light that reaches them.
            </li>
            <li>
              <strong>Why it starts empty.</strong> This picture stays empty until you press Run, so that you make your predictions first.
            </li>
          </ul>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              After you press Run, the stars are drawn a pair at a time (one above the line of travel and its mirror image below), starting
              straight ahead and going around to straight behind.
            </li>
            <li>
              A <strong>colored dot</strong> is a star whose measured color is one the eye can see. The dot is drawn in that color.
            </li>
            <li>
              A <strong>hollow circle with the letters UV</strong> is a star whose light the traveler measures as ultraviolet: a wavelength
              shorter than 400 nm, too short for the eye to see. A <strong>hollow circle with a dashed outline and the letters IR</strong>{' '}
              is infrared: longer than 700 nm, too long for the eye to see. We do not invent a color for these, so they are drawn as
              markers. The letters sit just inside the ring, next to their circle.
            </li>
            <li>
              The stars can be at different places than in the lab’s picture. That is the effect of Experiment 7: the traveler measures a
              different direction for the same star. The yellow ring and the dashed orange ring follow the same two stars as before, to wherever
              they now are.
            </li>
            <li>When the last pair is drawn, the two wedges and their star counts appear, as in the lab’s picture.</li>
            <li>
              When the last pair is drawn, two lines also appear in this picture. The <strong>dashed yellow lines</strong> run from the
              centre to the ring, one above and one below the line of travel, and they mark where the traveler’s measured frequency is exactly
              the same as the lab’s ({'“'}blue turns to red here{'”'}, with its angle). The <strong>dotted vertical line</strong> is the exactly sideways
              (90°) line, drawn so you can compare where that line is with where the dashed ones are.
            </li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Picture 3: The spectrum bar</strong>
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            A ruler for light. Each color of light has a wavelength, the distance between two crests of its wave, and the bar puts colors in
            order of wavelength, in nanometres (nm). A nanometre is one billionth of a metre.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>The numbers under the bar (400, 500, 600, 700) are wavelengths in nm. The bar runs from 300 nm on the left to 800 nm on the right.</li>
            <li>The rainbow part in the middle, from 400 nm to 700 nm, is the visible range: the colors the eye can see, from violet to red.</li>
            <li>The patterned part on the left, marked UV, is ultraviolet. The dotted part on the right, marked IR, is infrared. Neither can be seen.</li>
            <li>
              The blue line is the lab’s color for every star, {DEFAULT_SOURCE_NM} nm. It sits exactly in the middle of the visible range:
              150 nm from 400 and 150 nm from 700.
            </li>
            <li>
              After the run, three more marks hang under the bar, each on its own row: the star straight ahead (orange, dashed line), the
              star we follow (yellow line) and the star straight behind (purple line). Where a line meets the bar is the wavelength the
              traveler measures for that star, and the text gives the number. The text also gives the <em>shift factor</em>: the
              traveler’s frequency divided by the lab’s frequency for the same light, so 2.00 means twice the frequency and 0.50 means
              half. If a wavelength is off the end of the bar, its line is drawn at that end and the text says so.
            </li>
          {marksDrawn && (
            <li>
              The <strong>white marks</strong> under the bar are your guesses. Each has a box saying YOUR GUESS and a line to its place on the bar. A white ring on the blue line means you
              guessed “the same color”. A white arrow pointing left means you guessed “bluer” (a shorter wavelength, toward the violet end). A white arrow pointing right means you guessed
              “redder” (a longer wavelength, toward the red end). <strong>The arrows only show a direction. Your guess had no number, so how long an arrow is means nothing.</strong>
            </li>
          )}
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>Words used in the drawing</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              A <em>degree</em> measures angle: a full circle is 360 degrees and a quarter circle is 90.
            </li>
            <li>
              <em>Frequency</em> is how many wave crests pass each second. A shorter wavelength means a higher frequency.
            </li>
            <li>
              <em>c</em> is the speed of light, so 0.6c is six tenths of it.
            </li>
          </ul>

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <strong>A worked moment</strong> (reading the bar, before you run). The lab’s color is {DEFAULT_SOURCE_NM} nm. The visible range
            runs from 400 nm to 700 nm, so {DEFAULT_SOURCE_NM} nm is halfway along it, the yellow-green in the middle. A star drawn as UV would
            have a wavelength below 400 nm, off the left end of the visible part.
          </p>
          {showMarks && (
            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>A worked moment</strong> (the star we follow, now that it is drawn). At {speed}c the lab measures {DEFAULT_SOURCE_NM} nm for the star we follow. The traveler measures a
              frequency {followed.factor.toFixed(2)} times the lab’s, so the wavelength is {DEFAULT_SOURCE_NM} ÷ {followed.factor.toFixed(2)} = {formatNm(followed.wavelengthNm)} nm. On the bar,{' '}
              {formatNm(followed.wavelengthNm)} nm is {followed.wavelengthNm >= 400 && followed.wavelengthNm <= 700 ? `inside the visible range, ${formatNm(followed.wavelengthNm - 400)} nm past the 400 line` : 'outside the visible range'}.
            </p>
          )}

          {complete && (
            <>
              <p style={{ margin: '1rem 0 0.25rem' }}>
                <strong>Reading your run, at {speed}c</strong> (now that you have predicted and watched)
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {[
                  { name: 'The star straight ahead', star: doppler.stars[0] },
                  { name: 'The star we follow (the lab sees it sideways)', star: doppler.stars[6] },
                  { name: 'The star straight behind', star: doppler.stars[12] },
                ].map(({ name, star }) => (
                  <li key={name}>
                    <strong>{name}:</strong> the lab measures {DEFAULT_SOURCE_NM} nm. The traveler measures a frequency {star.factor.toFixed(2)} times
                    the lab’s, which is a wavelength of {DEFAULT_SOURCE_NM} ÷ {star.factor.toFixed(2)} ={' '}
                    {star.wavelengthNm >= 100 ? Math.round(star.wavelengthNm) : Number(star.wavelengthNm.toPrecision(2))} nm (
                    {star.range === 'visible'
                      ? 'visible, so its dot is colored'
                      : star.range === 'ultraviolet'
                        ? 'ultraviolet, so it is a UV marker'
                        : 'infrared, so it is an IR marker'}
                    ).
                  </li>
                ))}
              </ul>
            </>
          )}

          <p style={{ margin: '1rem 0 0.25rem' }}>
            <em>What to look for</em> (each item appears once the thing it names is drawn):
          </p>
          <LookForList items={lookFor} />
          <WhereFrom>
            <em>Measured:</em> nothing in these pictures. No one has measured a traveler at {speed}c flying through a ring of stars. <em>Calculated here:</em> every color and wavelength in the
            traveler’s sky, the bar’s marks, the wedge counts and the crossing lines are worked out by the page from the lab’s angle and the speed, {complete ? 'using f′ ÷ f = (1 + β cos θ) ÷ D' : '(the formula is shown after the run)'}. The page
            checks it two other ways (the energy of each ray, and the traveler’s own angle) and a third from Einstein’s published formula (see the check-up in Part 3).{' '}
            <em>Imagined for the question:</em> the ring of 24 evenly spaced, very distant stars, the single pure {DEFAULT_SOURCE_NM} nm color of every star, and a traveler flying at exactly {speed}c.
            Real stars send out a mixture of colors. {marksDrawn && 'Your white marks are your guesses, not calculations. '}The colors of the dots are an ordinary drawing approximation of the
            visible spectrum; the physics gives only the wavelength.
          </WhereFrom>
        </div>
  )
}
