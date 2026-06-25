# Template — Talking Avatar

A talking avatar is a video of a person (real or AI-generated) speaking to camera with synchronized lip movement and natural expression. This template covers the full pipeline: generating the video subject, preparing the audio, and synchronizing speech.

---

## Use Cases

- Brand spokesperson videos
- AI news presenters
- Product explainer narrators
- Educational instructors
- Social media spokespeople
- Personalized video messages at scale
- Language dubbing for existing video

---

## Pipeline Overview

```
1. Define the avatar character
2. Generate the base portrait video (or use a real photo/video)
3. Prepare the speech audio
4. Synchronize audio to the avatar (lip sync)
5. Add background, b-roll, lower thirds if needed
6. Export and deliver
```

---

## Step 1: Define the Avatar Character

Write a character seed (see `consistent-character.md`) with attention to features that matter for talking head video:

**Face-critical descriptors** (highest impact on lip sync quality):
- Skin tone and texture (even skin reads better for lip sync)
- Mouth shape and lips (neutral lip position in the description)
- Teeth visibility (if smiling, specify "subtle natural smile, teeth slightly visible")
- Eye behavior (direct eye contact with camera is essential)

**Avoid in talking avatar descriptions**:
- Sunglasses or face-obscuring accessories
- Extreme emotional expressions in the base pose (neutral or slight smile is best)
- Heavily styled makeup (may interfere with natural movement detection)
- Profile or angled face (lip sync requires frontal or near-frontal face view)

### Character Seed for Talking Avatar

```
[CHARACTER NAME]: [AGE]-year-old [GENDER PRESENTATION]. 
Skin: [TONE — even, clear]. 
Face: [SHAPE], [FEATURES — natural, expressive, open]. 
Eyes: [COLOR], looking directly at camera. 
Expression: professional and warm, slight natural smile. 
Wearing: [WARDROBE suitable for the context — corporate, casual, editorial]. 
Background: [ENVIRONMENT SETTING].
```

---

## Step 2: Generate the Base Portrait Video

Generate a talking-ready base video on the target platform.

### Talking Avatar Base Video Prompt

```
[SHOT SIZE — MCU or CU]. [CHARACTER SEED]. Speaking directly to camera with natural, 
engaged expression. Subtle natural head movement — slight nods, micro-movements that 
indicate active speaking. Eyes maintain contact with camera throughout. 
[ENVIRONMENT]. [LIGHTING]. Professional talking head style, broadcast quality.
```

**Critical elements**:
- **"Speaking directly to camera"** — prevents off-axis eye contact
- **"Subtle natural head movement"** — prevents robotic frozen-head output
- **"Eyes maintain contact with camera throughout"** — reinforces the eye direction
- Shot size should be MCU (medium close-up, chest up) for most contexts; CU (face only) for emotional or intimate delivery

### Model Recommendations for Talking Avatar Base Video

| Model | Recommendation |
|---|---|
| Higgsfield | Best choice — strong face quality, reference image support, natural expression |
| Seedance v2 | Excellent skin and eye quality; no reference image, so use detailed character seed |
| Veo 3 | Good for varied lighting setups; has native audio but audio may not match custom script |
| Kling | Good for fast iteration and style variety |

### Platform-Specific Parameters

**Higgsfield**:
```yaml
camera_motion: static  # Always static for lip sync base videos
duration: 8
reference_image: [character reference URL]
```

**Seedance v2**:
```yaml
duration: 8
motion_intensity: 0.3  # Low motion for stable head position
```

---

## Step 3: Prepare the Speech Audio

### Option A: Record Real Voice
- Record narration at 48kHz, 24-bit WAV
- Ensure clean recording (no room echo, no background noise)
- Leave 0.5s silence at start and end

### Option B: AI Voice Generation

**Higgsfield Audio (via MCP)**:
```
Tool: mcp__Hihhsfield__generate_audio
Input: script text, voice selection
Voices: mcp__Hihhsfield__list_voices
```

**Magnific TTS (via MCP)**:
```
Tool: mcp__Magnific__audio_tts
Input: script text, voice ID
Voice list: mcp__Magnific__audio_voices_list
```

### Voice Selection Criteria

| Use Case | Voice Type |
|---|---|
| Corporate/B2B | Neutral, clear diction, measured pace |
| Consumer brand | Warm, approachable, conversational |
| News/Announcer | Authoritative, crisp articulation |
| Educational | Patient, clear, slightly slower pace |
| Luxury/Premium | Calm, low register, deliberate |
| Youth/Social | Energetic, contemporary inflection |

### Script Formatting for AI TTS

To improve AI voice output quality:

```
// Use punctuation for pacing:
"We designed this for you. Because you deserve better."
// Not:
"We designed this for you because you deserve better"

// Mark emphasis with caps (for some systems):
"This is the ONLY system that works."

// Break long sentences with commas:
"Our team has spent three years, refining every detail, so that you don't have to think about it."
```

---

## Step 4: Lip Sync

### Higgsfield Dubbing (Recommended)

Higgsfield's dubbing tool replaces the audio and synchronizes lip movement to the new speech track.

```
Tool: mcp__Hihhsfield__dubbing
Input: base_video_id, audio_file or script
```

**Workflow**:
1. Upload base video to Higgsfield
2. Provide the audio track or text script
3. Select target language if dubbing to a different language
4. Generate — the output has synchronized lip movement

### General Lip Sync Tips

- **Base video duration should match or exceed audio duration** — generate longer base video than needed and trim
- **Avoid excessive head movement in base video** — large head movements reduce lip sync accuracy
- **Clear audio improves accuracy** — remove background noise from the audio track before sync
- **Test with short clips first** — generate 10s clips to check sync quality before committing to full duration

---

## Step 5: Finishing

### Background Options

**Clean studio background** (most versatile):
```
In the base video prompt: 
"...against a clean [COLOR] gradient background."
```

**Environmental background** (for context):
```
"...in a [ENVIRONMENT — modern office, library, outdoor garden] background, 
soft-focus behind the subject."
```

**Replace background in post**:
Generate the avatar on a green screen background, then composite in post. Higgsfield remove_background tool can assist with isolation if green screen isn't available.

### Lower Thirds and Graphics

Add text overlays, logo badges, and lower-third name cards in post-production. AI video models should not be asked to render text — use a video editor (Premiere Pro, DaVinci Resolve, CapCut) for these elements.

### Color Matching for Sequences

If this avatar appears in multiple clips:
- Apply the same color LUT to all clips
- Match the exposure across clips in post
- Use consistent background color across all clips if possible

---

## Quality Checklist for Talking Avatars

- [ ] Eyes are directed at camera throughout (no wandering gaze)
- [ ] Lip sync is accurate — no obvious lag or anticipation
- [ ] Head movement feels natural — not robotically still, not excessively nodding
- [ ] Expression is appropriate for the script tone
- [ ] Skin rendering is photorealistic (no wax quality, no uncanny texture)
- [ ] Blink rate is natural (not staring, not blinking excessively)
- [ ] Audio is clear, properly leveled, and consistent throughout
- [ ] Wardrobe is consistent if multiple clips are used
- [ ] Background is appropriate for the content context
- [ ] Lower thirds and text are added in post, not baked into the AI video

---

## Common Failure Recovery

| Failure | Fix |
|---|---|
| Eyes look off-camera | Add "maintaining direct eye contact with the camera lens throughout" |
| Lips move too much / exaggerated | Use a lower motion intensity; regenerate base video |
| Lips don't move enough | Ensure audio file is not silenced or at very low volume |
| Uncanny skin / wax face | Add "photorealistic skin texture, natural microexpressions, lifelike" to prompt |
| Sync delay (mouth lags behind audio) | Trim 2–3 frames from audio start; adjust sync offset in video editor |
| Character doesn't match across clips | Ensure same seed + reference image; color correct in post |
