# Template — Dialogue

A dialogue scene involves two or more characters in conversation. In film, dialogue scenes are among the most technically demanding — requiring coverage of multiple angles, eyeline matches, consistent lighting across the cut, and the illusion of natural conversation. This template covers how to plan, prompt, and generate convincing dialogue scenes with AI video.

---

## Why Dialogue Is Hard in AI Video

AI video models generate one clip at a time. They don't "know" that Shot A and Shot B are part of the same conversation. The director must engineer visual consistency manually:

- Eyeline must match (if Character A looks left, Character B must look right)
- Lighting must be coherent within the scene
- Shot sizes must have a logical relationship to each other
- Environment must be identical across all shots

---

## The Standard Dialogue Coverage Pattern

Traditional film dialogue coverage follows this pattern:

```
1. Master shot (WS or MWS) — establishes the two characters and the space
2. Character A — OTS (over Character B's shoulder)
3. Character A — Single (cut-in, MCU or CU)
4. Character B — OTS (over Character A's shoulder)
5. Character B — Single (cut-in, MCU or CU)
6. Reaction shots (CU of the listening character)
7. Return to master (optional, for beats or resolution)
```

You don't need all seven shots for every dialogue sequence. A simple two-shot conversation may only need shots 1, 2, and 4.

---

## Eyeline Mathematics

This is the most critical consistency rule in dialogue coverage:

**The 180° Rule**: Establish an imaginary line between the two characters. Camera must always stay on the same side of this line. If it crosses, the characters appear to switch positions, breaking spatial logic.

**Eyeline direction**:
- Character A's single shot → A looks **frame right** toward B's position
- Character B's single shot → B looks **frame left** toward A's position
- If A is closer to camera in the OTS: B is framed on the far side, looking **toward camera**

Always specify eyeline direction explicitly in each prompt:

```
"...looking frame right toward the other character..."
"...looking frame left, slightly up (as if speaking to a taller person)..."
"...looking directly at the person across from them, eye level..."
```

---

## Scene Setup Template

Before writing any prompts, establish the scene's geometry:

```
DIALOGUE SCENE SETUP
Scene: [NAME]
Location: [SPECIFIC ENVIRONMENT]
Time/Lighting: [DAY/NIGHT + LIGHTING CONDITIONS]
Color anchor: [CONSISTENT GRADE/PALETTE]

Characters:
  A: [CHARACTER SEED for Character A]
  B: [CHARACTER SEED for Character B]

Spatial arrangement:
  Character A: [position in the space — e.g., "standing at the kitchen counter on the left"]
  Character B: [position — e.g., "sitting at the table on the right"]
  Distance: [far apart / medium distance / very close / face-to-face]
  Height difference: [same height / A is taller / B is seated]

180° line: [describe the imaginary line — "runs east-west through the kitchen"]
Camera stays on: [NORTH or SOUTH side of the line]

Eyelines:
  When shooting A: A looks [frame right / frame left] + [up / down / level]
  When shooting B: B looks [frame right / frame left] + [up / down / level]
```

---

## Shot-by-Shot Prompt Templates

### Master Shot (Wide / Medium Wide)

```
[SHOT SIZE — WS or MWS]. [CHARACTER A SEED] stands/sits [POSITION]. 
[CHARACTER B SEED] stands/sits [POSITION]. 
They [ARE MID-CONVERSATION / HAVE JUST FACED EACH OTHER / ARE IN TENSE STANDOFF]. 
[ENVIRONMENT ANCHOR]. [LIGHTING]. Camera [MOVEMENT — usually static or very slow push in]. 
Both characters visible, their relationship established by their spatial positions.
```

**Example**:
```
Wide shot. Maya (warm brown skin, natural coils, cream blazer) stands at the kitchen 
counter on the left, arms crossed. Dr. Chen (silver hair, glasses, lab coat) sits at 
the table on the right, hands folded. They are mid-argument — the space between them 
charged. Modern open-plan kitchen, afternoon light from a north-facing window overhead. 
Camera holds static, both characters fully visible.
```

---

### OTS — Over Character B's Shoulder, Facing Character A

```
Over-the-shoulder shot. We see [CHARACTER A] from behind [CHARACTER B's] shoulder. 
[CHARACTER A SEED]. [CHARACTER A is SPEAKING / REACTING / LISTENING]. 
[CHARACTER A EYELINE — looks toward B, i.e., looks into camera-side of frame]. 
[CHARACTER B's SHOULDER/BACK OF HEAD visible at frame edge]. 
[ENVIRONMENT ANCHOR]. [LIGHTING on A's face]. Camera [USUALLY STATIC].
```

**Example**:
```
Over-the-shoulder shot from behind Dr. Chen's shoulder. Maya faces the camera, 
speaking directly and intensely. Her eyeline is frame right, locked on Chen. 
Dr. Chen's silver hair and lab coat shoulder are visible at the left frame edge 
in soft-focus. Morning kitchen light falls on Maya's face from the left. 
Camera holds static.
```

---

### Single — Character A (MCU or CU)

```
[MCU or CU]. [CHARACTER A SEED]. [SPEAKING / LISTENING / REACTING]. 
[SPECIFIC EXPRESSION OR MICRO-ACTION — not generic]. 
Looking [FRAME DIRECTION + EYE LEVEL] toward [CHARACTER B'S off-screen position]. 
[ENVIRONMENT ANCHOR — soft-focus background elements that place us in the same space]. 
[LIGHTING consistent with scene]. Camera [STATIC or BARELY PERCEPTIBLE PUSH IN].
```

**Example**:
```
Medium close-up. Maya. She finishes her sentence and holds her gaze on Chen, 
waiting — jaw set, eyes searching his face for a reaction. Looking frame right, 
eye level. Soft-focus kitchen background behind her, same morning window light. 
Camera holds completely static. The silence after her line.
```

---

### Reaction Shot (CU, Listening Character)

```
Close-up. [LISTENING CHARACTER SEED]. 
[WHAT THEY ARE REACTING TO — implied by previous line]. 
[SPECIFIC EXPRESSION — micro-movements, eye changes, breath]. 
Looking [FRAME DIRECTION] toward the speaker. 
[SAME LIGHTING]. Camera static. Duration: short (3–4s).
```

**Example**:
```
Close-up. Dr. Chen. He absorbs what Maya has said — a slight tightening around the eyes, 
a slow blink, then he exhales. Looking frame left toward Maya's off-screen position. 
Same kitchen window light, catching the grey in his hair. Camera static. 4 seconds.
```

---

## Emotional Progression in Dialogue

Map the emotional arc of the conversation before prompting:

```
Beat 1: [Both characters + emotional state]
Beat 2: [Turning point — what changes?]
Beat 3: [Resolution or new tension]
```

Then assign shots to beats:

| Beat | Shot Type | Duration | Camera |
|---|---|---|---|
| Opening / establish | Master (WS) | 6–8s | Static |
| Tension builds | OTS singles | 4–6s each | Static or slow push |
| Peak moment | CU singles | 3–5s | Barely perceptible push |
| Reaction | Reaction CU | 3–4s | Static |
| Resolution | Master or two-shot | 4–6s | Slow pull out or static |

---

## Writing Dialogue in Prompts

AI video models cannot generate speech — they generate silent video. Dialogue is added in post (voice acting, TTS, or lip sync). But you can describe the speech behavior in the prompt:

**For active speaking**:
```
"She speaks emphatically — we see the effort of the words even without hearing them. 
Her lips move in measured, deliberate speech."
```

**For intense listening**:
```
"She listens without speaking, expression cycling through recognition, 
discomfort, and finally resignation — all without a word."
```

**For heated argument**:
```
"Both characters speak simultaneously for a moment, then one backs down. 
The moment is visible in their body language even without audio."
```

**For pause / silence**:
```
"After the line, silence. He doesn't respond immediately. 
The pause is where the meaning lives."
```

---

## Post-Production Integration

### Adding Dialogue Audio

1. Record or generate voice acting for each line
2. Use Higgsfield dubbing (`mcp__Hihhsfield__dubbing`) to lip-sync generated videos
3. Mix dialogue under appropriate ambience (room tone, environment)
4. Apply subtle reverb that matches the environment (kitchen, outdoor, office)

### Editing Dialogue Coverage

**Cut on action**: Cut when a character begins to speak or react — not before, not long after.

**L-cuts and J-cuts**: Audio from the next shot starts before the cut (J-cut), or audio continues from the previous shot after the cut (L-cut). These feel more like real conversation.

**Hold on reactions**: The listening character's reaction often carries more meaning than the speaker's delivery. Give reaction shots their full duration.

**Match on eyeline**: When cutting from Speaker A to Speaker B, their eyelines should feel like they're looking at each other, not past each other.

---

## Quick Reference: Dialogue Consistency Checklist

Before generating any dialogue coverage shots:

- [ ] Scene setup document is complete with spatial layout
- [ ] 180° line is established and noted
- [ ] Both character seeds are written and ready to paste
- [ ] Eyeline directions are determined for each character
- [ ] Environment anchor paragraph is written (will paste into every shot)
- [ ] Lighting anchor is defined (same conditions for all shots in scene)
- [ ] Shot list covers: master, at least one OTS per character, singles, reactions
- [ ] Emotional arc of conversation is mapped to shots
