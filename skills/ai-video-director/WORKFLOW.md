# Workflow — AI Video Director

The AI Video Director workflow runs in four stages. Each stage has defined inputs, outputs, and decision gates.

---

## Stage 1: Creative Brief

**Input**: User's raw creative intent  
**Output**: Structured creative brief

### Capture These Elements

Before writing a single prompt, establish:

| Element | Questions to Answer |
|---------|---------------------|
| **Subject** | Who or what is the primary focus? Human, object, environment, abstract? |
| **Action** | What is happening? Static, motion, transformation, reaction? |
| **Setting** | Where does this occur? Interior/exterior, time of day, real/fantastical? |
| **Mood** | What feeling should this evoke? Tension, warmth, wonder, dread, joy? |
| **Style reference** | Which film, director, photographer, or aesthetic is the visual north star? |
| **Platform** | Which AI video model will generate this? |
| **Format** | Aspect ratio (16:9, 9:16, 1:1, 2.39:1), duration (4s, 8s, 16s), resolution |
| **Purpose** | Social post, commercial, film clip, demo, loop? |

### Brief Template

```
Subject: [primary visual element]
Action: [what it's doing]
Setting: [location, time, world]
Mood: [emotional register]
Style reference: [film/photographer/aesthetic]
Model: [Seedance / Veo / Kling / Sora / Higgsfield / Nano Banana]
Format: [aspect ratio × duration]
Purpose: [end use]
```

---

## Stage 2: Shot Planning

**Input**: Creative brief  
**Output**: Shot list with camera direction

### Single Shot

For a single clip, define:

1. **Shot size** — What does the frame contain? (EWS → ECU)
2. **Camera position** — Where is the camera relative to the subject?
3. **Camera movement** — How does the camera move through the duration?
4. **Subject movement** — What does the subject do?
5. **Lighting setup** — Where is the key light? What quality of light?
6. **Depth of field** — Shallow or deep? Any rack focus?
7. **Lens character** — Wide/telephoto feel? Anamorphic? Handheld?

### Multi-Shot Sequence

For sequences, build a shot list before writing any prompts:

```
Shot 01 — [Shot type] [Camera movement]
Shot 02 — [Shot type] [Camera movement]
Shot 03 — [Shot type] [Camera movement]
...
```

Identify **consistency anchors** — elements that must remain identical across shots:
- Character appearance (skin tone, hair, wardrobe, age)
- Environment (architecture, props, lighting direction)
- Color palette (grade, saturation level, shadows/highlights)
- Time of day (sun angle, sky condition)

---

## Stage 3: Prompt Construction

**Input**: Shot plan  
**Output**: Model-optimized prompts

### Prompt Structure

All prompts follow this ordering principle:

```
[Shot size + camera movement] + [subject + action] + [setting/environment] + [lighting] + [mood/atmosphere] + [technical qualities]
```

**Lead with camera and subject.** Everything else serves those two elements.

### Model-Specific Considerations

**Seedance v2**
- Excels at photorealistic human subjects and commercial-grade motion
- Responds well to brand adjectives: "luxury," "premium," "editorial"
- Use explicit camera direction: "camera slowly pushes in," not "close-up"
- Duration: 4s and 8s clips; chain for longer content

**Google Veo**
- Best for long-form coherence and environmental detail
- Accepts negative prompts — always include them
- Strong physics simulation: water, fabric, hair, fire
- Describe lens choices with mm equivalents for better results

**Kling**
- Fastest iteration cycle; good for style exploration
- Supports motion brush for region-specific movement control
- Camera control mode available; use for precise dolly/pan
- Strong with stylized, animated, and semi-realistic aesthetics

**Sora**
- Exceptional at complex multi-element compositions
- World-model approach means physical consistency is strong
- Use "storyboard" prompting for complex scenes
- Works well with abstract and surreal subject matter

**Higgsfield**
- Best-in-class character consistency across shots
- Explicit camera motion presets: "orbit," "zoom in," "truck left"
- Strong for cinematic drama and character-driven content
- Reference images dramatically improve consistency

**Nano Banana**
- Experimental and stylized; not for photorealism
- Strengths: motion graphics, abstract, surreal, morphing
- Short, punchy prompts work better than long descriptive ones
- Strong with loop-friendly content

### Negative Prompts (When Supported)

Always include for Veo, Kling, and any platform supporting them:

```
Negative: blurry, out of focus, low quality, watermark, text overlay, 
distorted face, extra limbs, bad anatomy, jittery motion, overexposed, 
underexposed, duplicate subjects, cropped frame
```

---

## Stage 4: Generation, Evaluation, and Iteration

**Input**: Prompts + parameters  
**Output**: Final approved clips

### Generation Parameters

| Parameter | Guideline |
|-----------|-----------|
| **Duration** | Start with minimum (4s); extend once composition is confirmed |
| **Aspect ratio** | Match your delivery format from the start; cropping loses quality |
| **Motion intensity** | Start at medium; increase only if the scene requires it |
| **Seed** | Once a good result is found, lock the seed for variations |
| **Temperature/creativity** | Lower for commercial/brand work; higher for experimental |

### Evaluation Criteria

After each generation, assess:

- [ ] Subject is correctly identified and positioned
- [ ] Camera movement matches the specified direction
- [ ] Lighting is consistent and motivated
- [ ] No anatomical errors (hands, faces, proportions)
- [ ] Motion feels natural and has appropriate weight
- [ ] No visual artifacts, flickering, or frame jitter
- [ ] Duration feels right for the intended cut

### Iteration Strategy

**If the subject is wrong**: Rewrite the opening of the prompt. The model weighted something else more heavily.

**If the camera movement is wrong**: Make the motion direction the very first phrase: "Camera slowly dollies in on..."

**If lighting is off**: Add lighting specification earlier in the prompt. Use concrete terms: "hard directional sidelight from frame left" not "dramatic lighting."

**If there are artifacts**: Add to negative prompt; reduce motion intensity; try a different seed.

**If motion is too fast/slow**: Describe the speed explicitly: "in slow deliberate motion," "rapidly," "imperceptibly slow."

### Handoff to Post-Production

Once clips are approved:

1. Download at highest available quality
2. Note seed numbers for any clips that may need re-generation
3. Upscale if needed (Higgsfield upscale, Magnific for stills-to-video enhancement)
4. Concatenate in order per shot list
5. Color grade to match across cuts (models have slightly different color signatures)
6. Add audio: music, SFX, dialogue, or ambient
7. Export at delivery spec
