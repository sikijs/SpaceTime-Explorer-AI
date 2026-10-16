import { useState } from 'react'
import { runRotatedCube, sphereOutlineRadius } from '../physics/rotatedObject'

type ShapePrediction = 'squashed' | 'same' | 'stretched' | 'turned'
type FacePrediction = 'none' | 'leading' | 'trailing'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface RotatedObjectTutorProps {
  speed: number
  predictedShape: ShapePrediction
  predictedFace: FacePrediction
  onExplained?: () => void
}

const shapeWords: Record<ShapePrediction, string> = {
  squashed: 'squashed along its direction of motion',
  same: 'the same as at rest',
  stretched: 'stretched along its direction of motion',
  turned: 'turned, as though the cube were rotated',
}
const faceWords: Record<FacePrediction, string> = { none: 'no other face', leading: 'the leading face', trailing: 'the trailing face' }

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior": observe, compare with the
// predictions, one conceptual question, then the explanation after the learner has responded. The explanation begins by marking each
// prediction as matched or not matched, and nowhere earlier. Every number comes from the physics module (`runRotatedCube`,
// `sphereOutlineRadius`), never typed in by hand (CLAUDE.md §9). The effect is named once, in part 6, as the specification's Decision 8
// says. No real example beyond Terrell and Penrose is used (Decision 10).
export function RotatedObjectTutor({ speed, predictedShape, predictedFace, onExplained }: RotatedObjectTutorProps) {
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

  const two = (value: number) => value.toFixed(2)
  const one = (value: number) => value.toFixed(1)
  const result = runRotatedCube(speed)
  const D = result.timeDilationFactor
  // What the run showed: a trailing face beside the contracted front face looks like a turned cube. The leading face is the one that would
  // show if a back leading corner appeared beyond the front leading corner.
  const shapeOutcome: ShapePrediction = result.trailingFaceWidth > 1e-9 ? 'turned' : 'same'
  const faceOutcome: FacePrediction = result.leadingFaceVisible ? 'leading' : result.trailingFaceWidth > 1e-9 ? 'trailing' : 'none'
  const restWidth = result.restPhotographWidth

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
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the three pictures and the table. What do you notice about the photograph of the moving cube, compared with the cube at rest and with the cube as the lab measures it?'}
            {tutorStep === 'compare' &&
              `You predicted that the photograph would look ${shapeWords[predictedShape]}, and that, besides the front face, the camera could see ${faceWords[predictedFace]}. In this run, the front face was ${two(result.frontFaceWidth)} wide and the trailing face ${two(result.trailingFaceWidth)} wide. Comparing that with your predictions, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'The lab’s ruler says the cube is shorter. So why isn’t the cube squashed in the photograph? And why can the camera see a face that points away from the direction the cube is moving?'}
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

      {tutorStep === 'explained' && (
        <div>
          {/* The predictions are marked here, in the explanation, and nowhere earlier, so the learner reasons first (CLAUDE.md §12). */}
          <p style={paragraphStyle}>
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You
            predicted the photograph would look <em>{shapeWords[predictedShape]}</em>. It looked <em>{shapeWords[shapeOutcome]}</em>.{' '}
            {predictedShape === shapeOutcome ? 'Your prediction matched.' : 'Your prediction did not match.'} You predicted that, besides the front
            face, the camera could see <em>{faceWords[predictedFace]}</em>. It could see <em>{faceWords[faceOutcome]}</em>.{' '}
            {predictedFace === faceOutcome ? 'Your prediction matched.' : 'Your prediction did not match.'} Either way, the parts below explain
            why.
          </p>
          <p style={paragraphStyle}>
            <strong>1. What the results show, in your own numbers.</strong> At {speed}c, the lab’s ruler measured the cube at {two(result.measuredWidth)} of
            its side. In the photograph, the front face was {two(result.frontFaceWidth)} wide and the trailing face {two(result.trailingFaceWidth)} wide,
            so the whole photograph was {two(result.photographWidth)} wide, against {two(restWidth)} for the cube at rest. A cube at rest, turned by{' '}
            {one(result.turnDegrees)}°, shows a front face {two(result.turnedFrontFaceWidth)} wide and a side face {two(result.turnedSideFaceWidth)} wide:
            the same two numbers.
          </p>
          <p style={paragraphStyle}>
            <strong>2. An everyday example: a long train and sound.</strong> The sound from the far end of a long passing train left it
            earlier than the sound from the near end, because it had farther to travel. A photograph of light has the same feature: it
            records light that left different parts of the cube at different times. Light is much faster than sound, so in daily life
            the delay is tiny. But a cube moving close to the speed of light moves a long way in the time its own light takes to cross it.
          </p>
          <p style={paragraphStyle}>
            <strong>3. The counting, with simple math.</strong> The back face is one cube-side farther from the camera than the front
            face, so its light left one side’s worth of light travel time earlier. At {speed}c the cube moves {speed} × 1 = {two(result.trailingFaceWidth)} of its
            side in that time, so the back corners appear {two(result.trailingFaceWidth)} behind where they would otherwise. The camera therefore sees the
            trailing face with a width of {two(result.trailingFaceWidth)}, next to the front face at {two(result.frontFaceWidth)} (the contraction: D = √(1 − {speed}²) ={' '}
            {two(D)}). The total is {two(result.frontFaceWidth)} + {two(result.trailingFaceWidth)} = {two(result.photographWidth)}, against {two(restWidth)} for the cube at rest. So the
            photograph is not squashed: the front face is shorter, but a second face has come into view. The camera sees the trailing face, and
            not the leading face, because the back corners appear shifted toward the trailing side, never toward the leading side.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why it looks turned.</strong> A cube at rest turned by {one(result.turnDegrees)}° shows a front face {two(result.turnedFrontFaceWidth)} wide and
            a side face {two(result.turnedSideFaceWidth)} wide: the same two numbers as the moving cube’s photograph. (This works because D² + β² = 1, so D
            can be the cosine of the angle and β its sine.) The cube is the same cube, and it has not turned. Only its photograph looks as if it
            had.
          </p>
          <p style={paragraphStyle}>
            <strong>5. The contraction is still real.</strong> The lab’s ruler, at one lab time, measures the cube at {two(result.measuredWidth)} of its side
            (Experiment 6). A photograph answers a different question: what light arrives at the camera now (Experiment 4). Both answers are
            right. Neither is “the real shape”.
          </p>
          <p style={paragraphStyle}>
            <strong>6. A sphere, and a name.</strong> A moving sphere keeps its round outline in the photograph: the contraction and the lag
            cancel, and its outline has radius {two(sphereOutlineRadius(speed))} for a sphere of radius 1.00, at every speed. Roger Penrose and James Terrell
            found this independently, in 1959. The way a fast cube looks turned in a photograph is called the Terrell-Penrose effect, after
            them.
          </p>
          <p style={paragraphStyle}>
            <strong>7. What was shown, and what was not.</strong> You saw a flat slice: the cube from above and its flat photograph, with a
            camera very far away, looking straight across the path, with an instant shutter, and only the shape (not color or brightness). A
            camera close to the path, a camera looking along it, and a human eye would all show different distortions. The cube has not turned,
            and it has not stopped being contracted. The lab’s ruler and the camera simply answer different questions.
          </p>
        </div>
      )}
    </div>
  )
}
