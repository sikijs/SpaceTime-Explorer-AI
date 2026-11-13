import { useState } from 'react'
import { aimSweep, fallsInEdge, flybySummary, PART_ONE_AIMS, publishedSunRatio, tutorMarking, workedNumbers, SUN_PUBLISHED } from '../physics/lightBendingExperiment'
import type { BendChoice, MoreLessSameChoice } from '../physics/lightBendingExperiment'

// Gravity and Curved Spacetime, Experiment 8, Part 4: the tutor (docs/audit/gravity-and-curved-spacetime/08-draft-wording.md, section 6,
// approved by the owner on 2026-11-13). The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the
// explanation marks each guess. Every number comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface LightBendingTutorProps {
  bentGuess: BendChoice
  closerGuess: MoreLessSameChoice
  realGuess: MoreLessSameChoice
  onExplained?: () => void
}

const deg = (v: number | null, digits = 1) => (v === null ? 'n/a' : `${v.toFixed(digits)}°`)

function moreLessSameText(choice: MoreLessSameChoice, same: string): string {
  if (choice === 'more') return 'more'
  if (choice === 'less') return 'less'
  return same
}

export function LightBendingTutor({ bentGuess, closerGuess, realGuess, onExplained }: LightBendingTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return

    if (tutorStep === 'observe') {
      setTutorStep('compare')
    } else if (tutorStep === 'compare') {
      setTutorStep('conceptual')
    } else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }

  const isResponseEmpty = responseInput.trim() === ''

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #d9e8f5',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' &&
              'Look at the drawing and the graph. What happened to the light\'s path as it passed the mass: did it stay on the dashed line, or leave it?'}
            {tutorStep === 'compare' &&
              'Look at your three white marks on the pictures: the ring on the drawing for the first question, the white line on the graph for the second and the white ring for the third. What do you notice when you compare each with the amber curve and the green curve?'}
            {tutorStep === 'conceptual' &&
              'This simulation calculated one bending angle using ordinary gravity. Do you think that is the same amount the real universe bends light by? Try a few aims of your own in Part 2 first if you want to.'}
          </p>

          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />

          <button
            onClick={handleContinue}
            disabled={isResponseEmpty}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backgroundColor: isResponseEmpty ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isResponseEmpty ? 'not-allowed' : 'pointer',
              opacity: isResponseEmpty ? 0.6 : 1,
            }}
          >
            Continue
          </button>
        </div>
      )}

      {tutorStep === 'explained' && <LightBendingExplanation bentGuess={bentGuess} closerGuess={closerGuess} realGuess={realGuess} />}
    </div>
  )
}

const pointStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const subListStyle = { margin: '0.25rem 0', paddingLeft: '1.25rem' } as const

export function LightBendingExplanation({ bentGuess, closerGuess, realGuess }: { bentGuess: BendChoice; closerGuess: MoreLessSameChoice; realGuess: MoreLessSameChoice }) {
  const m = tutorMarking(bentGuess, closerGuess, realGuess)
  const sweep = aimSweep()
  const edge = fallsInEdge()
  const two = workedNumbers(2)
  const far = flybySummary(PART_ONE_AIMS.far)
  const close = flybySummary(PART_ONE_AIMS.close)
  const four = workedNumbers(4)
  const bentMarked = m.bends.matches ? 'That was right.' : 'That was not right.'
  const closerMarked = m.closer.matches ? 'That was right.' : 'That was not right.'
  const realMarked = m.realVsOrdinary.matches ? 'That was right.' : 'That was not right.'
  const edgeAim = ((edge.lastFallsIn + edge.firstPassesBy) / 2).toFixed(2)
  return (
    <div>
      <p style={pointStyle}>
        <strong>Your guesses, marked.</strong> For the first question you guessed {bentGuess === 'yes' ? 'yes, the light bends' : 'no, it stays straight'}. The light was bent:
        the amber path turns away from the dashed line ({deg(m.bends.degreesAtFarPass)} at aim {PART_ONE_AIMS.far.toFixed(1)}). {bentMarked} For the second you guessed that aiming
        closer bends the light {moreLessSameText(closerGuess, 'about the same amount')}. The curve rises as the aim gets smaller, from {deg(sweep[0].simulatedDegrees)} at aim{' '}
        {sweep[0].aim.toFixed(1)} to {deg(sweep[sweep.length - 1].simulatedDegrees)} at aim {sweep[sweep.length - 1].aim.toFixed(1)}: closer bends more, until the light falls in
        below about {edgeAim}. {closerMarked} For the third you guessed the real universe bends starlight {moreLessSameText(realGuess, 'exactly the same amount')} compared with
        ordinary gravity. The real-universe angle is {m.realVsOrdinary.ratio.toFixed(0)} times the ordinary one ({deg(m.realVsOrdinary.realDegreesAtAim2)} against{' '}
        {deg(m.realVsOrdinary.ordinaryDegreesAtAim2)} at aim 2.0). {realMarked}
      </p>
      <p style={pointStyle}>
        <strong>1. Light passing near a mass is bent from a straight line, more so the closer it passes</strong>, until it passes so close that it falls in. This connects to
        Experiment 4&rsquo;s &ldquo;as straight as possible path&rdquo; (geodesic) idea, now applied to something with no mass at all.
      </p>
      <p style={pointStyle}>
        <strong>2. This experiment&rsquo;s simulation calculates that bending using the same ordinary, first-order gravity</strong> as the rest of this chapter, treating light as a
        fast-moving particle. The angle it gives is 2 × mass ÷ (speed of light squared × aim) = 2 × 1 ÷ (4 × 2) = {two.ordinaryFormulaRadians.toFixed(2)} of a unit of angle at aim 2.0,
        which is {deg(two.ordinaryFormulaDegrees)}. The stepped path gave {deg(two.simulatedDegrees)}.
      </p>
      <div style={pointStyle}>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>3. The real universe bends light exactly twice as much</strong>, because real gravity (general relativity) does two things to light&rsquo;s path, and this simulation
          only does the first.
        </p>
        <ul style={subListStyle}>
          <li>
            <strong>Effect 1: the pull.</strong> Gravity pulls the light toward the mass, as it pulls a fast ball. This is the only effect the animation includes. It gives 2 × mass ÷
            (speed of light squared × aim) = 2 × 1 ÷ (4 × 2) = {two.ordinaryFormulaRadians.toFixed(2)} of a unit of angle at aim 2.0, which is {deg(two.ordinaryFormulaDegrees)}.
          </li>
          <li>
            <strong>Effect 2: the curving of space.</strong> Near a mass, space itself is curved. Light takes the straightest path it can through that curved space, but a path that is as
            straight as possible in curved space still looks bent when you view it from far away. Nothing pushes the light here: the bend comes from the shape of the space. The animation
            leaves this effect out. In general relativity it bends the light by exactly as much again as Effect 1 does.
          </li>
        </ul>
        <p style={{ margin: '0.5rem 0' }}>
          <strong>A daily-life picture of Effect 2.</strong> On a flat map, a flight from London to New York curves north. The plane is not turning to the side: it flies as straight as it
          can across the curved Earth, and on the flat map that straightest route looks bent. Light near a mass does the same in curved space.
        </p>
        <p style={{ margin: '0.5rem 0' }}>
          <strong>Add the two.</strong> At aim 2.0: {deg(two.ordinaryFormulaDegrees)} + {deg(two.ordinaryFormulaDegrees)} = {deg(two.realFormulaDegrees)}, which is the green curve. The
          same sum works at every aim, so the green curve is always twice the amber one. In one step: 4 × mass ÷ (speed of light squared × aim) = 4 × 1 ÷ (4 × 2) = 0.5 of a unit of angle,
          which is {deg(two.realFormulaDegrees)}.
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>
          <strong>How we know it is not just a story.</strong> For light grazing the Sun the published values are about {SUN_PUBLISHED.ordinaryArcseconds} arcseconds for the pull alone and
          about {SUN_PUBLISHED.realArcseconds} arcseconds in all. {SUN_PUBLISHED.realArcseconds} ÷ {SUN_PUBLISHED.ordinaryArcseconds} is about {publishedSunRatio().toFixed(1)}, the same
          factor of 2 as this page&rsquo;s two curves. Why curved space adds exactly the same amount again needs the equations of general relativity, which this page does not go into. It is
          stated here as a fact, as physics books state it.
        </p>
      </div>
      <p style={pointStyle}>
        <strong>4. Real numbers for the Sun.</strong> For light grazing the Sun&rsquo;s edge, the ordinary-gravity value is about {SUN_PUBLISHED.ordinaryArcseconds} arcseconds and the real
        value about {SUN_PUBLISHED.realArcseconds} arcseconds (Physics Today, Kennefick, 2009). An arcsecond is 1/3600 of a degree, so {SUN_PUBLISHED.realArcseconds} arcseconds is{' '}
        {SUN_PUBLISHED.realArcseconds} ÷ 3600, about 0.0005 of a degree. The angles on this page, tens of degrees, are on a made-up scale and are far bigger than the real ones.
      </p>
      <p style={pointStyle}>
        <strong>5. The 1919 eclipse.</strong> In 1919 astronomers photographed stars near the Sun during a total solar eclipse and measured how far their light was bent. Royal Museums
        Greenwich say the angle was &ldquo;a little under 2 arcseconds&rdquo;, which is close to the real value and about twice the ordinary one. The Science Museum notes that the
        photographs from the smaller telescope at Sobral were the decisive ones. The measurement was tiny and difficult, and this page quotes no figure for how sure it was. This is what
        first convinced the world that Einstein&rsquo;s general relativity, not Newton&rsquo;s gravity, was correct.
      </p>
      <div style={{ ...pointStyle, marginBottom: 0 }}>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>6. Gravitational lensing: this bending, used as a telescope.</strong> The bending you have just measured is not only a curiosity. Astronomers put it to work. It is one of
          the main ways the bending of light by gravity is used to learn about the universe.
        </p>

        <p style={{ margin: '0.75rem 0 0.25rem' }}>
          <strong>(a) What it is.</strong>
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          A glass lens, or the bottom of a wine glass, bends light so that what is behind it looks bigger, stretched or doubled. A massive object in space does the same to the light of things
          far behind it. That is gravitational lensing. NASA&rsquo;s Hubble pages describe a lens of this kind as one that can magnify and distort the light of distant objects.
        </p>

        <p style={{ margin: '0.75rem 0 0.25rem' }}>
          <strong>(b) How it works, using this page&rsquo;s picture.</strong>
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          Imagine a distant galaxy far behind the mass, and us far in front of it. Light that passes the mass on one side is bent toward the mass, and so is light that passes on the other
          side. By symmetry, a beam at aim {far.aim.toFixed(1)} on either side turns by {deg(far.simulatedDegrees)} on the simulated scale of this page. So light from the same galaxy can reach us by two
          different routes, one on each side of the mass, and we see the galaxy in two places.
        </p>
        <ul style={subListStyle}>
          <li>
            <strong>Rings.</strong> If the galaxy, the mass and we are lined up exactly, light comes around every side at once and we see a ring. NASA JPL describes an Einstein ring as light
            from a distant galaxy bending to form a ring that appears aligned with a foreground object.
          </li>
          <li>
            <strong>Arcs and several images.</strong> If the line-up is not exact, we see arcs or several copies. ESA/Hubble says lensing gives multiple images of the original galaxy, each with a
            distorted, banana-like shape, or even rings.
          </li>
        </ul>

        <p style={{ margin: '0.75rem 0 0.25rem' }}>
          <strong>(c) Why the images are stretched into arcs.</strong>
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          A galaxy is not a point: different parts of it send light past the mass at different aims. You found that the closer the pass, the bigger the bend: on this page, {deg(far.simulatedDegrees)} at aim
          3.0 but {deg(close.simulatedDegrees)} at aim 1.0. So the part of the galaxy whose light passes closer is bent more than the part whose light passes farther, and the picture is smeared into an arc
          instead of being moved as one piece. It is like looking at a spot of ink through the curved bottom of a glass: the stretching comes from different parts of the picture being bent by different
          amounts.
        </p>

        <p style={{ margin: '0.75rem 0 0.25rem' }}>
          <strong>(d) Why lensed galaxies look brighter.</strong>
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          A magnifying glass gathers sunlight from a wide patch and sends it into one small spot, which is why the spot is so bright. A gravitational lens does something similar with the light of a
          distant galaxy: it bends light that would have passed us by toward us. NASA JPL says relativity predicts that light will bend and brighten around objects in space, and calls massive objects
          such as galaxies and galaxy clusters cosmic magnifying glasses. ESA/Hubble says astronomers use lenses to study distant galaxies from the early Universe that would otherwise be impossible to see.
        </p>

        <p style={{ margin: '0.75rem 0 0.25rem' }}>
          <strong>(e) Weighing a cluster, step by step.</strong>
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          ESA/Hubble says the amount of lensing depends on the total mass of the cluster, so lensing can be used to &ldquo;weigh&rdquo; clusters, including mass we cannot see. Here is the idea in this page&rsquo;s
          units. The real-universe rule is bend = 4 × mass ÷ (speed of light squared × aim).
        </p>
        <ul style={subListStyle}>
          <li>
            <strong>The bend grows with the mass.</strong> At aim 4.0 and mass 1, the bend is {deg(four.realFormulaDegrees)}. Double the mass to 2 and the bend doubles to {deg(four.realFormulaDegrees * 2)}.
          </li>
          <li>
            <strong>So a measured bend tells you the mass.</strong> Suppose you saw light bent by {deg(two.realFormulaDegrees)} (that is {(two.ordinaryFormulaRadians * 2).toFixed(1)} of a unit of angle) at an
            aim of 2.0. Turn the rule around: mass = bend × (speed of light squared) × aim ÷ 4 = {(two.ordinaryFormulaRadians * 2).toFixed(1)} × 4 × 2 ÷ 4 = {((two.ordinaryFormulaRadians * 2 * 4 * 2) / 4).toFixed(1)}.
            That is the mass of the page&rsquo;s central object, found only from how much it bent the light.
          </li>
          <li>
            <strong>Real clusters are harder.</strong> A real cluster is a spread-out collection of galaxies and hidden matter, not one point, so astronomers use more complicated calculations than this
            one. The idea is the same: more bending means more mass.
          </li>
        </ul>

        <p style={{ margin: '0.75rem 0 0.25rem' }}>
          <strong>(f) Why astronomers must use the real rule, not the ordinary-gravity one.</strong>
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          The amber curve (ordinary gravity) gives half the bend per unit of mass that the green curve (the real universe) gives. If astronomers used the amber rule, then for the same measured bend they
          would calculate a mass twice as big as the real one: in the example above they would get 2.0 instead of 1.0. So the factor of 2 you met in point 3 matters in practice: it decides how heavy a
          cluster is found to be.
        </p>

        <p style={{ margin: '0.75rem 0 0.25rem' }}>
          <strong>(g) What lensing has shown.</strong>
        </p>
        <ul style={subListStyle}>
          <li>
            <strong>Mapping hidden matter.</strong> ESA/Hubble says lensing has improved our understanding of how &ldquo;hidden&rdquo; dark matter is spread through galaxy clusters. Where the light is bent more
            than the visible galaxies can explain, there must be more mass than we can see.
          </li>
          <li>
            <strong>Magnifying the early universe.</strong> Lenses act as natural telescopes, bringing very distant galaxies into view.
          </li>
          <li>
            <strong>Real examples.</strong> NASA JPL reported a newly found Einstein ring in February 2025, a ring of light around a nearer galaxy, seen by the Euclid space telescope.
          </li>
        </ul>

        <p style={{ margin: '0.75rem 0 0' }}>
          <strong>Where you will meet it again.</strong> The chapter &ldquo;Cosmology&rdquo; has an experiment called &ldquo;Gravitational Lensing&rdquo;, where the ring that a cluster makes is used to weigh the cluster.
          Links to the pages named here, and the others, are below, after this explanation.
        </p>
      </div>
    </div>
  )
}
