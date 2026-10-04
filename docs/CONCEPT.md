# Doodle Tutor: concept

> An AI tutor that explains things the way a good teacher does at a board: it talks and draws at the same time. It comes in two versions, a chalkboard classroom for ages 6–12 and a study app for ages 13–18 whose board changes with the subject.

"Doodle Tutor", "Professor Hoot" (kids) and "Atlas" (high school) are working names.

---

## 1. The idea

Students learn best when they hear an explanation and see it built up in front of them, one piece at a time. A chatbot can only produce a wall of text. A video plays the same way for everyone and can't be asked questions.

Doodle Tutor combines the two. The student asks a question by speaking or typing. The tutor answers out loud and draws the answer as it speaks. Each sentence comes with its own strokes: the pizza appears while it says "here is a pizza", and the cut lines appear while it says "we cut it into four". The student can interrupt at any time, ask a follow-up, answer the tutor's check-in question, or draw on the board themselves.

The same approach covers any subject that can be sketched:

| Level | Subject | Example question | What the tutor draws |
|---|---|---|---|
| Kids | Maths | "What is ¼?" | A pizza cut into 4, one slice shaded, then the fraction with labels |
| Kids | Maths | "What is 3 × 5?" | Rows of dots, row totals, the sum, then the turned-around array |
| Kids | Science | "How does rain happen?" | Sea, sun, evaporation arrows, a cloud, rain, a river back to the sea |
| Kids | Geography | "Why is there night?" | The Sun, a spinning Earth, the day side and the night side |
| High school | Maths | "Solve x² − 5x + 6 = 0" | Worked factorisation on the left, the parabola and its roots on the right |
| High school | Physics | "Explain projectile motion" | Trajectory, velocity components, gravity, the two equations of motion |
| High school | Chemistry | "Balance H₂ + O₂ → H₂O" | Molecules as atoms, an atom count that goes from ✗ to ✓ |
| High school | Biology | "What's inside a cell?" | A labelled animal cell, built one organelle at a time |

---

## 2. Two versions, one engine

Both versions share the same lesson format, board renderer, voice and player. What differs is the look, the tone of voice, the way students ask, and the way they're rewarded.

| | Kids (6–12): **Classroom** | High school (13–18): **Study** |
|---|---|---|
| Tutor | Professor Hoot, an animated owl teacher | Atlas, a voice "orb" with a live waveform; no mascot |
| Board | Green chalkboard in a wooden frame with a chalk tray | Changes with the subject (see 2.3) |
| Asking | A big **Tap and ask me!** mic button, plus picture topic cards; typing is secondary | Text box with a mic button; subject cards with sample problems |
| Reading | Big rounded text; each word lights up as it's spoken (read-along) | Transcript style; the current sentence is outlined, upcoming words dimmed |
| Check-ins | Chunky coloured answer buttons; a wrong answer gets a spoken hint and a retry | A/B/C quiz card with the same hint-and-retry flow |
| Reward | Stars counter, a star burst over the board, a gold star stamped in the corner, and the owl jumps | A quiet ✓ on the board and a short confirmation |
| Voice | Slightly slower and higher (0.92× speed) | Natural speed (1.02×) |

### 2.1 Kids: the classroom

```
┌──────────── 30% ─────────────┬───────────────────────── 70% ──────────────────────────┐
│ Doodle Classroom  ⭐3  🔊 ⚙   │ ╔═ What is a fraction?  ● ● ◉ ○ ○ ○ ══════════════════╗ │
│┌────┐ ▭Professor Hoot▭        │ ║                                                    ║ │
││ 🦉 │  Watch the board!       │ ║        ╭───┬───╮          1  ← pieces we have      ║ │
│└────┘ (wing points to board)  │ ║       │ ░░ │▒▒▒▒│        ───                       ║ │
│ ┌──────────────────────────┐  │ ║       │────┼────│         4  ← pieces in all       ║ │
│ │ Now we [cut] it into 4…  │  │ ║        ╰───┴───╯   🖍                            ║ │
│ └──────────────────────────┘  │ ║                                    🌟 (reward)    ║ │
│ ┌ Your turn! How many… ────┐  │ ╚════════════════════════════════════════════════════╝ │
│ │  [ 2 ]  [ 3 ]  [ 4 ]     │  │   [▬ My chalk]                          [▭ Wipe board] │
│ 🍕  ✖️  🌧️  🌱  🌍            │                                                         │
│ [ 🎤  Tap and ask me! ]  [⌨] │                                                         │
└──────────────────────────────┴─────────────────────────────────────────────────────────┘
```

- **Professor Hoot** blinks while idle, moves its beak while talking, points a wing at the board while explaining, tilts its head while listening, looks up while thinking, and jumps when the child gets an answer right.
- **Voice first.** Many 6-year-olds can't type. The biggest button on the screen is the microphone. Picture cards (🍕 Fractions, 🌧️ Rain…) start a lesson with one tap. Typing hides behind a small keyboard button.
- **Read-along.** The sentence being spoken is shown large, and the current word is highlighted like a karaoke line, so early readers can follow along.
- **Chalk that feels like chalk.** Strokes are thicker and dusty, fills are pastel, and the tutor holds a chalk stick that follows the drawing. The tray has "My chalk" so children can draw too, and an eraser to wipe the board.
- **Stars.** Every correct check-in earns a star, with a burst of stars and a gold star stamped on the board.
- **Gentle mistakes.** A wrong answer greys out that button with a shake, and Hoot gives a spoken hint ("Count the slices on the pizza…"). The child tries again.

### 2.2 High school: the study app

```
┌──────────── 30% ─────────────┬───────────────────────── 70% ──────────────────────────┐
│ (|||) Atlas · step 3 of 6 🔊⚙ │ ■ Blueprint / Projectile motion  ▬▬▬▭▭    Stop Pen Clear│
│ ┌ Maths ──────┐┌ Physics ───┐ │ ┌────────────────────────────────────────────────────┐ │
│ │ Quadratics  ││ Projectiles│ │ │ x = vₓt          ╭──────╮            g = 9.8 m/s² ↓ │ │
│ ┌ Chemistry ──┐┌ Biology ───┐ │ │ y = v_y t − ½gt² ╱  →    ╲→                         │ │
│ │ Balancing   ││ Cells      │ │ │               ↑╱          ╲↓                        │ │
│ ┃ Horizontally there is no   │ │      v₀ ↗θ  →╱              ╲                       │ │
│ ┃ force, so vₓ stays…        │ │ ──────────────────────────────────── range R ───── │ │
│ ┌ CHECK YOUR UNDERSTANDING ─┐ │ └────────────────────────────────────────────────────┘ │
│ │ A  Zero   B  Max   C  vₓ  │ │                                                        │
│ (🎤) [ Ask a question…  ] Ask │                                                        │
└──────────────────────────────┴─────────────────────────────────────────────────────────┘
```

- Calm and focused: a dark interface, no mascot, no confetti rain. The accent colour follows the subject.
- Lessons are denser: worked algebra, real units, labelled diagrams, the equations to remember.
- Check-ins are short exam-style questions, each with a targeted hint for the common mistake.

### 2.3 The board changes with the subject (high school)

Each subject gets the material a student would use for it. The same drawing commands are recoloured by the theme, so one lesson works on any board.

| Subject | Board | Look | Tutor's tool | Handwriting |
|---|---|---|---|---|
| Maths | **Graph paper** | White with a fine blue grid, blue and red pen | Pen | Kalam |
| Physics | **Blueprint** | Deep blue with a white grid, crisp cyan and yellow lines | Drafting pen | Architects Daughter |
| Chemistry | **Lab notebook** | Ruled lines and a red margin | Pen | Patrick Hand |
| Biology | **Sketchbook** | Warm paper, pencil grain and watercolour fills | Pencil | Caveat |
| (Kids, all subjects) | **Chalkboard** | Green slate, dusty chalk, pastel fills | Chalk stick | Patrick Hand |

When the student moves to a new subject, the board's background, palette, stroke texture and tool change together.

### 2.4 Layout rules for both versions

- The conversation takes 30% of the width and the board 70%. On phones the board moves on top, sized to the drawing, with the conversation below.
- The board is a fixed 1000 × 640 drawing space scaled to fit, so lessons look the same on every screen.
- Every spoken sentence also appears as text (captions are always on).
- Every lesson can be replayed, and the student can stop it or ask something new at any moment.

## 3. The core mechanism: lessons as "say + draw" steps

The tutor never paints pixels. It returns a **lesson**: an ordered list of steps, where each step pairs one or two spoken sentences with the drawing commands for that moment.

```jsonc
{
  "title": "What is a fraction?",
  "subject": "Maths",
  "steps": [
    {
      "say": "Let's imagine a yummy pizza! Here is one whole pizza.",
      "draw": [
        { "op": "clear" },
        { "op": "circle", "id": "pizza", "center": [300, 320], "r": 180, "fill": "#fde68a" },
        { "op": "text", "at": [300, 560], "text": "1 whole pizza" }
      ]
    },
    {
      "say": "Each friend gets one piece. Let me colour in one piece.",
      "draw": [
        { "op": "wedge", "id": "slice", "center": [300, 320], "r": 180, "fromDeg": -90, "toDeg": 0, "fill": "#fca5a5" },
        { "op": "highlight", "target": "slice" }
      ]
    }
  ],
  "checkIn": {
    "question": "How many quarters make one whole pizza?",
    "choices": ["2", "3", "4"],
    "answer": 2,
    "praise": "Yes! Four quarters make one whole pizza.",
    "hint": "Count the slices. How many pieces did we cut it into?"
  }
}
```

**Drawing commands** (`src/whiteboard/types.ts`)

| op | Purpose |
|---|---|
| `line`, `arrow` (with optional `curve`) | Connections, flows, cuts, pointers |
| `circle`, `rect`, `wedge` | Basic shapes; wedges cover fractions and pie charts |
| `path` | Any freeform shape (SVG path data): leaves, clouds, mountains |
| `text` | Labels, equations, words; written letter by letter |
| `emoji` | Quick pictures a child recognises instantly (💧 ⭐ 👋) |
| `highlight` / `erase` / `clear` | Point at, remove, or wipe things by `id` |
| `pause` | Dramatic timing ("…and then!") |

Each shape can set `id`, `color`, `width`, `opacity` and `duration` (how long the pen takes).

**Why this format:**
1. **LLMs can write it reliably.** It is small, absolute-coordinate JSON with no layout engine to reason about.
2. **Voice and drawing stay in sync for free.** The player starts the speech and the drawing together, and only moves to the next step when both have finished.
3. **Ids make the board stateful.** The tutor can say "remember this slice?" and highlight `slice` instead of drawing it again.
4. **It's replayable and cheap.** A lesson is a few KB of JSON, so it can be cached, shared, reviewed by teachers, and replayed offline.

### The playback loop

```
student asks ─► brain returns Lesson ─► for each step:
                                          ├─ show `say` as a chat bubble (highlighted)
                                          ├─ speak `say` (TTS)            ┐ run in
                                          └─ execute `draw` commands       ┘ parallel
                                          wait for both, short pause
                                        ─► show checkIn question
student speaks or types at any point ─► abort current lesson, answer the new question
```

---

## 4. Agent design (production)

### 4.1 The model call

The model gets a system prompt with the tutor's persona (Professor Hoot or Atlas), the student's level and the teaching rules, plus one tool:

```jsonc
{
  "name": "teach_on_whiteboard",
  "description": "Explain something to the student by speaking and drawing on a 1000x640 whiteboard, step by step.",
  "input_schema": {
    "type": "object",
    "properties": {
      "title":   { "type": "string" },
      "subject": { "type": "string" },
      "steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "say":  { "type": "string", "description": "1–2 short sentences, spoken aloud" },
            "draw": { "type": "array", "items": { "$ref": "#/definitions/DrawCommand" } }
          },
          "required": ["say", "draw"]
        }
      },
      "checkIn": {
        "type": "object",
        "description": "A question that makes the student think or act, with optional tap-to-answer choices, the correct index, praise, and a hint for a wrong answer",
        "properties": {
          "question": { "type": "string" },
          "choices":  { "type": "array", "items": { "type": "string" } },
          "answer":   { "type": "integer" },
          "praise":   { "type": "string" },
          "hint":     { "type": "string" }
        },
        "required": ["question"]
      }
    },
    "required": ["title", "steps"]
  }
}
```

For a small reply ("Great job! That's right!") the model can answer with plain text and no tool call. The board stays as it is, and the reply is simply spoken.

### 4.2 Context the model receives each turn
- The conversation so far (text).
- **Board state as a scene graph**: a compact list of what is on the board (`id`, type, position, label). This lets the model build on its last drawing ("now let's colour a second slice") instead of starting over.
- **The student's drawing**: when the child uses *My pen*, the board is rendered to an image and sent to a vision-capable model. That way the tutor can see that the child shaded 3 of the 4 slices and respond to it.
- The learner profile: age or grade, language, and topics already covered.

### 4.3 Streaming for low latency
Children won't wait 8 seconds. The tool input is streamed and each step is played **as soon as it is complete in the stream**: step 1 is already being spoken and drawn while the model is still writing step 3. Target: under 1.5 s from the end of the question to the first stroke.

### 4.4 Better drawings
LLMs are weak at freehand coordinates. Options to add on top of the primitive commands:
- **A diagram library**: higher-level ops such as `{ "op": "diagram", "kind": "number_line", "from": 0, "to": 10, "marks": [3, 7] }`, `fraction_bar`, `clock`, `plant`, `earth`, `bar_chart`, `labelled_triangle`, `food_chain`. The renderer expands each one into primitives, so the result looks consistent and polished every time.
- **Layout regions**: the model can place things in named areas ("left", "right-top") instead of exact pixels.
- **Self-check**: render the board, send it back to the model with "does this look right?" when the scene is complex, and fix overlaps.
- **Maths rendering**: a `math` op backed by KaTeX for proper fractions, exponents and long division.

### 4.5 Voice pipeline
| Piece | Prototype | Production |
|---|---|---|
| Student → text | Browser `SpeechRecognition` | Streaming STT with voice-activity detection and child-speech tuning |
| Text → tutor's voice | Browser `speechSynthesis` | Streaming neural TTS with a warm, consistent character voice; word timings so the bubble text can highlight word by word |
| Barge-in | Typing or tapping 🎤 stops the tutor | Always-on VAD: when the student starts talking, the tutor stops mid-sentence and listens |
| Read-along | Word-boundary events from the voice, or a time-based estimate when the voice doesn't report them | Word timings from the TTS provider |

**How voice works in the prototype.** It uses the browser's built-in voices (Web Speech API), so it needs no key or server. Quality depends on the device: Safari on Mac and iPhone and Chrome's Google voices sound best. A grown-up can pick the voice and speed from the ⚙ menu. Browsers only allow speech after a click, so the tutor starts talking when the student presses Start (or picks a version). Voice *input* needs microphone access: it works when the app runs from its own address (for example `npm run dev` in Chrome, Edge or Safari), but embedded previews that block the microphone fall back to typing with a friendly message.

---

## 5. Teaching approach

Written into the system prompt and enforced by tests:

- **Short sentences**, everyday words, one idea per step, 4–7 steps per lesson.
- **Concrete before abstract**: pizzas before ¼, dots before ×, a puddle before "evaporation".
- **Draw in the order you speak.** Never draw something before it has been mentioned.
- **Always end with a check-in** the child can answer or draw, never with "any questions?"
- **Socratic when practising**: for homework-style questions, the tutor shows a similar example and guides with hints rather than handing over the answer.
- **Praise effort, not intelligence.** Treat mistakes as normal ("Lots of people think that! Let's look again…").
- **Adapt the level**: if the child is stuck twice, drop down a level (bigger pictures, smaller numbers). If they answer quickly, add a challenge.
- **Same visual language every time**: red for "what we have", blue for "the whole", green for answers.

High school changes the defaults:
- Show the method, not just the answer: every step of the working stays on the board, and the final answer is boxed.
- Connect representations: algebra next to its graph, equations next to the diagram they describe.
- Check-ins target the common misconception (sign errors, changing subscripts, "vertical velocity is maximum at the top").
- A neutral, encouraging tone, without baby talk.

---

## 6. Safety, privacy and trust

Children are the users, so this is a design requirement from the start, not an add-on.

- **Content safety**: filter input and output, keep the model on learning topics, and redirect upsetting topics gently with a suggestion to talk to a trusted adult.
- **No personal data collection**: the tutor never asks for names, schools or addresses. Voice is transcribed and then discarded. Comply with COPPA, GDPR-K and local equivalents.
- **Parents and teachers**: a dashboard with topics covered, check-in answers, and lesson replays. Time limits, and the option to disable voice input.
- **Accuracy**: core curriculum topics use reviewed lesson templates or diagram ops. Model-generated lessons for long-tail questions are sampled and reviewed.
- **Accessibility**: captions are always on (the chat bubbles), reduced-motion mode, dyslexia-friendly font option, high-contrast board.

---

## 7. Roadmap

| Phase | Scope |
|---|---|
| **0. Prototype (this repo)** | Kids classroom and high-school study app, drawing language, 5 board materials, animated renderer, voice in and out with read-along, 9 scripted lessons with check-ins, stars, student pen, interrupting |
| **1. MVP** | Real LLM behind `TutorBrain`, streamed step playback, scene-graph context, diagram library v1 (number line, fraction bar, clock, bar chart), maths rendering, 1 grade band, 1 language |
| **2. Seeing the student** | Vision on student drawings, "show your working" exercises, handwriting recognition for answers |
| **3. Personal** | Learner profile, spaced repetition of check-ins, parent/teacher dashboard, curriculum alignment (e.g. by country and grade) |
| **4. Scale** | Multilingual voice, offline lesson packs, classroom mode (teacher projects the board, students answer on tablets) |

---

## 8. How the prototype maps to this concept

| Concept | Prototype file |
|---|---|
| Drawing language, check-ins, theme colour tokens | `src/whiteboard/types.ts` |
| Board materials (chalk, graph paper, blueprint, lab notebook, sketchbook) | `src/whiteboard/themes.ts`, `src/styles.css` |
| Animated renderer, chalk/pencil textures, tutor's tool, student pen | `src/whiteboard/Whiteboard.tsx` |
| Step player (voice and drawing in sync, read-along, interrupting) | `src/tutor/useLessonPlayer.ts` |
| Brain interface plus keyword-matching stand-ins for the LLM | `src/tutor/brain.ts` |
| Kids lessons / high-school lessons | `src/tutor/kidsLessons.ts`, `src/tutor/teenLessons.ts` |
| Chat, check-ins, stars (shared by both versions) | `src/shared/useTutorSession.ts` |
| Voice in and out, voice picker | `src/voice/speech.ts`, `src/shared/VoicePanel.tsx`, `src/shared/useMic.ts` |
| Kids classroom and Professor Hoot | `src/kids/KidsApp.tsx`, `src/kids/OwlTeacher.tsx` |
| High-school study app | `src/teens/TeenApp.tsx` |
| Landing (pick a version) | `src/App.tsx` |

To move from prototype to MVP, replace the two stand-in brains with implementations of `TutorBrain` that call a model with the `teach_on_whiteboard` tool, passing the level (kids or high school) in the system prompt. Nothing else needs to change.

---

## 9. Open questions

1. **Device priority**: tablet first (touch pen is natural for kids) or laptop first?
2. **Curriculum**: which country's or which board's syllabus should the first version follow?
3. **Languages**: English only at first, or several languages from the start?
4. **Answers vs. guidance**: should the tutor ever give the direct answer to a homework problem?
5. **Character**: keep one owl mascot for kids, or let the child pick or customise an avatar?
6. **Age switch**: should students pick their version, or should it follow a grade set by a parent or teacher?
