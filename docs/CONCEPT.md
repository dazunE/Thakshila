# Doodle Tutor: concept

> An AI tutor for children aged 6–12 that explains things the way a good teacher does at a whiteboard: it talks and draws at the same time.

"Dot" (an owl) and "Doodle Tutor" are working names.

---

## 1. The idea

Children learn best when they hear an explanation and see it built up in front of them, one piece at a time. A chatbot can only produce a wall of text. A video plays the same way for everyone and can't be asked questions.

Doodle Tutor combines the two. The child asks a question by typing or speaking. The tutor answers out loud and draws the answer on a whiteboard as it speaks. Each sentence comes with its own strokes: the pizza appears while it says "here is a pizza", and the cut lines appear while it says "we cut it into four". The child can interrupt at any time, ask a follow-up, or pick up a pen and draw on the board themselves.

The same approach covers any subject that can be sketched:

| Subject | Example question | What the tutor draws |
|---|---|---|
| Maths | "What is ¼?" | A pizza cut into 4, one slice shaded, then the fraction with labels |
| Maths | "What is 3 × 5?" | Rows of dots, row totals, the sum, then the turned-around array |
| Science | "How does rain happen?" | Sea, sun, evaporation arrows, a cloud, rain, a river back to the sea |
| Science | "How do plants eat?" | A plant, its roots, sunlight, CO₂ in, oxygen out |
| Geography | "Why is there night?" | The Sun, a spinning Earth, the day side and the night side |
| English | "What is a verb?" | A stick figure running, with the action word circled in a sentence |
| History | "Who built the pyramids?" | A timeline, a pyramid, workers moving blocks |

---

## 2. Screen layout

```
┌────────────── 30% ──────────────┬──────────────────────── 70% ────────────────────────┐
│ 🦉 Dot · explaining…      🔊    │ ● What is a fraction?  ▬▬▬▬▭▭      ⏹  🖍 My pen  🧽  │
│─────────────────────────────────│──────────────────────────────────────────────────────│
│                 What is ¼?  [me]│                                                      │
│ ➗ Maths · What is a fraction? ↻│          ╭─────╮                  1   ← pieces we    │
│ Let's imagine a yummy pizza!    │        ╱  🍕 │ ██ ╲               ──       have       │
│ ┃ Now we share it with 4      ┃ │       │──────┼────│             4   ← pieces in all  │
│ ┃ friends… (currently spoken) ┃ │        ╲     │    ╱    ✏️                           │
│                                 │          ╰─────╯                                     │
│ 🤔 Your turn: how many quarters │                         "one quarter"                │
│ make the whole pizza?           │                                                      │
│─────────────────────────────────│                                                      │
│ [What is ¼?] [How does rain…]   │                                                      │
│ 🎤 [ Ask Dot anything…  ] [Ask] │                                                      │
└─────────────────────────────────┴──────────────────────────────────────────────────────┘
```

**Left panel (30%): the conversation**
- Dot's avatar pulses while it is talking. The status line reads *thinking…* or *explaining on the board*.
- Every spoken sentence also appears as a chat bubble. The bubble being spoken right now is outlined, which helps children who are still learning to read follow along.
- Each lesson starts with a chip showing the subject and title, plus a ↻ replay button.
- Every lesson ends with a check-in question (yellow bubble), so the child does something instead of just watching.
- Suggested questions sit above the input, a 🎤 button handles voice input, and 🔊 mutes or unmutes Dot.

**Right panel (70%): the whiteboard**
- A fixed 1000 × 640 drawing space, scaled to fit any screen.
- Strokes animate as if drawn by hand. A ✏️ pencil follows Dot's pen. Text appears letter by letter in a handwriting font.
- Dot can highlight things it has already drawn (a yellow glow) to point at them, and can erase them.
- The toolbar shows the lesson title, a step progress bar, Stop, **My pen** (the child draws in purple), and Clear.
- On phones the board goes on top and the chat below.

---

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
  "checkIn": "How many quarters do you need to make the whole pizza?"
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

The model gets a system prompt describing Dot's persona and teaching rules, plus one tool:

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
      "checkIn": { "type": "string", "description": "A question that makes the student think or act" }
    },
    "required": ["title", "steps"]
  }
}
```

For a small reply ("Great job! That's right!") the model can answer with plain text and no tool call. The board stays as it is, and the reply is simply spoken.

### 4.2 Context the model receives each turn
- The conversation so far (text).
- **Board state as a scene graph**: a compact list of what is on the board (`id`, type, position, label). This lets the model build on its last drawing ("now let's colour a second slice") instead of starting over.
- **The student's drawing**: when the child uses *My pen*, the board is rendered to an image and sent to a vision-capable model. That way Dot can see that the child shaded 3 of the 4 slices and respond to it.
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
| Text → Dot's voice | Browser `speechSynthesis` | Streaming neural TTS with a warm, consistent character voice; word timings so the bubble text can highlight word by word |
| Barge-in | Typing or tapping 🎤 stops Dot | Always-on VAD: when the child starts talking, Dot stops mid-sentence and listens |

---

## 5. Teaching approach for ages 6–12

Written into the system prompt and enforced by tests:

- **Short sentences**, everyday words, one idea per step, 4–7 steps per lesson.
- **Concrete before abstract**: pizzas before ¼, dots before ×, a puddle before "evaporation".
- **Draw in the order you speak.** Never draw something before it has been mentioned.
- **Always end with a check-in** the child can answer or draw, never with "any questions?"
- **Socratic when practising**: for homework-style questions, Dot shows a similar example and guides with hints rather than handing over the answer.
- **Praise effort, not intelligence.** Treat mistakes as normal ("Lots of people think that! Let's look again…").
- **Adapt the level**: if the child is stuck twice, drop down a level (bigger pictures, smaller numbers). If they answer quickly, add a challenge.
- **Same visual language every time**: red for "what we have", blue for "the whole", green for answers.

---

## 6. Safety, privacy and trust

Children are the users, so this is a design requirement from the start, not an add-on.

- **Content safety**: filter input and output, keep the model on learning topics, and redirect upsetting topics gently with a suggestion to talk to a trusted adult.
- **No personal data collection**: Dot never asks for names, schools or addresses. Voice is transcribed and then discarded. Comply with COPPA, GDPR-K and local equivalents.
- **Parents and teachers**: a dashboard with topics covered, check-in answers, and lesson replays. Time limits, and the option to disable voice input.
- **Accuracy**: core curriculum topics use reviewed lesson templates or diagram ops. Model-generated lessons for long-tail questions are sampled and reviewed.
- **Accessibility**: captions are always on (the chat bubbles), reduced-motion mode, dyslexia-friendly font option, high-contrast board.

---

## 7. Roadmap

| Phase | Scope |
|---|---|
| **0. Prototype (this repo)** | Layout, drawing language, animated renderer, voice in and out via browser APIs, 5 scripted lessons, student pen, interrupting |
| **1. MVP** | Real LLM behind `TutorBrain`, streamed step playback, scene-graph context, diagram library v1 (number line, fraction bar, clock, bar chart), maths rendering, 1 grade band, 1 language |
| **2. Seeing the student** | Vision on student drawings, "show your working" exercises, handwriting recognition for answers |
| **3. Personal** | Learner profile, spaced repetition of check-ins, parent/teacher dashboard, curriculum alignment (e.g. by country and grade) |
| **4. Scale** | Multilingual voice, offline lesson packs, classroom mode (teacher projects the board, students answer on tablets) |

---

## 8. How the prototype maps to this concept

| Concept | Prototype file |
|---|---|
| Drawing language | `src/whiteboard/types.ts` |
| Hand-drawn renderer, pencil cursor, student pen | `src/whiteboard/Whiteboard.tsx`, `src/styles.css` |
| Step player (voice and drawing in sync, interrupting) | `src/tutor/useLessonPlayer.ts` |
| Brain interface plus a keyword-matching stand-in for the LLM | `src/tutor/brain.ts` |
| Example lessons (and a generated one: multiplication for any a×b up to 10) | `src/tutor/lessons.ts` |
| Voice in and out | `src/voice/speech.ts` |
| 30/70 layout, chat, check-ins | `src/App.tsx`, `src/components/ChatPanel.tsx` |

To move from prototype to MVP, replace `mockBrain` with an implementation of `TutorBrain` that calls a model with the `teach_on_whiteboard` tool and returns its input. Nothing else needs to change.

---

## 9. Open questions

1. **Device priority**: tablet first (touch pen is natural for kids) or laptop first?
2. **Curriculum**: which country's or which board's syllabus should the first version follow?
3. **Languages**: English only at first, or several languages from the start?
4. **Answers vs. guidance**: should Dot ever give the direct answer to a homework problem?
5. **Character**: an owl mascot, or a customisable avatar the child picks?
