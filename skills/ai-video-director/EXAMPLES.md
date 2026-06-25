# Examples — AI Video Director

Annotated real-world examples across content types. Each example includes the creative brief, the final prompt, and notes on the key decisions made.

---

## 1. Luxury Product Commercial (Seedance v2)

### Brief
**Subject**: Premium watch  
**Action**: Reveal on wrist during a handshake  
**Setting**: High-end hotel lobby, afternoon  
**Mood**: Confident, aspirational  
**Model**: Seedance v2  
**Format**: 16:9, 6 seconds

### Prompt
```
Extreme close-up shot, camera slowly pulls back to reveal a polished luxury watch 
on a man's wrist as he extends his arm for a handshake. Warm afternoon light streams 
through floor-to-ceiling windows, catching the watch's crystal face with a subtle lens 
flare. The background is a soft-focus hotel lobby with marble floors and brass fixtures. 
The motion is deliberate, confident. Shallow depth of field, the watch face perfectly sharp.
```

**Negative**: blurry, overexposed, watermark, distorted hand, extra fingers, low quality

**Notes**:
- Opens with camera move + shot size before describing the subject
- "Slowly pulls back" is more precise than "zoom out" — models understand dolly/pull better
- Lens flare is called out as "subtle" to prevent it from overwhelming the frame
- "Deliberate, confident" gives the motion editor a clear quality target
- Shallow DOF is specified to avoid a cluttered background

---

## 2. Cinematic Character Introduction (Higgsfield)

### Brief
**Subject**: A weathered detective in her 50s  
**Action**: Entering a rain-soaked alley, scanning the scene  
**Setting**: Neo-noir city, night, heavy rain  
**Mood**: Tense, world-weary, determined  
**Model**: Higgsfield  
**Format**: 2.39:1 anamorphic, 8 seconds

### Prompt
```
Wide shot. A weathered female detective in her 50s, tan trench coat, short silver hair, 
walks slowly into frame from the left and stops in the center of a rain-soaked alley. 
She pauses and scans the scene with sharp eyes, rain falling across her face. 
Hard neon signs from above cast fractured blue and red light across the wet cobblestones. 
Camera holds static on a low angle, slightly below eye level, giving her presence. 
Heavy rain practical effect, steam rising from a grate in the background. Anamorphic lens flares.
```

**Camera control**: Static, low-angle hold

**Notes**:
- Character physical description is detailed because Higgsfield uses it for consistency seeding
- "Walks slowly into frame from the left" gives the model precise blocking
- Light sources are identified as practical (neon signs) — motivated lighting reads better
- "Anamorphic lens flares" is a known quality trigger for Higgsfield cinematic output
- Shot ends on her scanning — a natural cut point for the next shot

---

## 3. Social Media Loop (Kling)

### Brief
**Subject**: Coffee being poured into a white ceramic cup  
**Action**: Slow pour, cream dispersing  
**Setting**: Minimal white surface, morning  
**Mood**: Calm, satisfying, premium  
**Model**: Kling  
**Format**: 1:1, 4 seconds, loop-friendly

### Prompt
```
Overhead flat-lay shot, camera static. A rich dark espresso pours from a sleek matte black 
pitcher into a white ceramic cup centered in frame. A swirl of cream follows, blooming 
outward in slow motion through the dark coffee. Soft diffused natural light from the left, 
clean white marble surface. The motion is slow, fluid, and tactile.
```

**Motion intensity**: Low  
**Style**: Photorealistic

**Notes**:
- "Overhead flat-lay" instantly orients the camera — this is the most important framing for a loop
- "In slow motion" is the single most important quality instruction for this type of clip
- "Tactile" is a useful abstract quality word that often improves food/product video quality
- Low motion intensity keeps the background completely still, reducing noise in the loop
- "Bloom outward" describes the cream dispersal in a way the model can interpret visually

---

## 4. Talking Avatar — Brand Spokesperson (Higgsfield)

### Brief
**Subject**: Professional woman, 30s, brand spokesperson  
**Action**: Delivering a 10-second product message to camera  
**Setting**: Minimal studio background, brand blue  
**Mood**: Warm, authoritative, approachable  
**Model**: Higgsfield + lip sync  
**Format**: 9:16, 10 seconds

### Prompt
```
Medium close-up shot, camera static. A professional woman in her 30s with warm brown skin, 
dark shoulder-length hair, wearing a crisp white blouse, speaks directly to camera with 
a warm, confident expression. Soft box lighting from front-left, subtle fill from right, 
clean gradient background in navy blue. Natural eye contact, slight natural head movement 
while speaking. Studio-quality.
```

**Lip sync input**: Pre-recorded audio track  
**Expression**: Warm, engaged

**Notes**:
- "Speaks directly to camera" is critical — models default to off-axis eye contact
- "Slight natural head movement while speaking" prevents the robotic still-head look
- Lighting is described as soft box (frontal soft key + fill) — this reads to the model as professional studio setup
- Character description is thorough because the lip sync step requires high face quality
- White blouse on gradient background reduces clothing complexity and keeps face focus

---

## 5. Image-to-Video Animation (Veo)

### Brief
**Source**: Static photograph of a forest path at dawn  
**Action**: Subtle mist movement, leaves shifting in breeze  
**Mood**: Peaceful, ethereal  
**Model**: Google Veo (image-to-video mode)  
**Format**: 16:9, 8 seconds

### Prompt
```
Gentle morning mist drifts slowly through a forest path at dawn. Leaves on nearby trees 
shift softly in a light breeze. Golden light filters through the canopy, moving subtly 
as the leaves sway. The camera is perfectly still, observing. The atmosphere is peaceful 
and slightly magical. Very slow, subtle motion throughout — nothing dramatic.
```

**Negative**: camera movement, zoom, strong wind, rapid motion, blurry, overexposed

**Notes**:
- For image-to-video, the prompt describes what MOVES, not what the image looks like
- "Camera is perfectly still" is stated explicitly — models often add camera movement by default
- Three distinct motion elements (mist, leaves, light) give the model clear targets
- "Nothing dramatic" in the prompt actively suppresses over-enthusiastic motion generation
- Negative prompt explicitly blocks camera movement, which is the most common failure mode

---

## 6. Dialogue Scene — Two Characters (Sora)

### Brief
**Subject**: Two friends having an intense conversation  
**Action**: Argument that turns to laughter  
**Setting**: Rooftop at sunset, New York skyline  
**Mood**: Emotional, authentic, bittersweet  
**Model**: Sora  
**Format**: 16:9, 8 seconds

### Shot Plan (3 shots):

**Shot 1 — Wide Establishing**
```
Wide shot of two young women facing each other on a New York rooftop at golden hour. 
The city skyline stretches behind them. Both are animated, mid-conversation, gesturing. 
Camera holds static at chest height. Warm sunset light from the west backlit by the skyline.
```

**Shot 2 — OTS Character A**
```
Over-the-shoulder shot from behind Character B, facing Character A who is speaking with 
intensity, then breaks into reluctant laughter. MCU, camera static. Same golden hour 
rooftop setting. Warm key light on Character A's face from frame right.
```

**Shot 3 — Two-shot Reaction**
```
Medium two-shot, both women now laughing together, the tension broken. One reaches out 
and touches the other's arm. Camera very slowly pushes in during the laughter. 
Same rooftop, same golden sunset. The emotional release is palpable.
```

**Notes**:
- Three-shot pattern follows: establish → single → two-shot reaction (classic dialogue coverage)
- "Same golden hour rooftop" repeated across all prompts serves as a consistency anchor
- Camera movement only appears in the final shot (slow push in) — this reserves movement for emotional emphasis
- Character actions are described as emotional states, not mechanical movements

---

## 7. Abstract / Motion Graphics (Nano Banana)

### Brief
**Subject**: Data visualization coming to life  
**Action**: Particles forming into a globe  
**Mood**: Technological, awe-inspiring  
**Model**: Nano Banana  
**Format**: 16:9, 6 seconds

### Prompt
```
Thousands of luminous blue-white particles swirl and converge in 3D space, gradually 
forming a rotating wireframe globe. Dark space background. Particles trail light as they move.
```

**Notes**:
- Nano Banana performs better with short, punchy prompts — this one is 35 words
- Abstract visual language works better than cinematic language for this model
- "Luminous" and "trail light" are known quality triggers for particle effects
- No camera direction needed — Nano Banana handles motion-graphic camera automatically

---

## 8. Product Commercial — Skincare (Seedance v2)

### Brief
**Subject**: Moisturizer bottle and cream texture  
**Action**: Cream dispensed onto fingertips, skin application  
**Setting**: Soft spa-like environment  
**Mood**: Clean, luxurious, effective  
**Model**: Seedance v2  
**Format**: 9:16, 8 seconds

### Prompt
```
Close-up shot, camera slowly pulls back. A single pump of white moisturizing cream 
dispenses onto clean feminine fingertips. The cream has a rich, silky texture that 
catches soft white diffused light. She gently applies it in smooth circular motions 
to dewy skin. Background is soft-focus white marble with a single green leaf for contrast. 
The pace is slow, deliberate, and luxurious.
```

**Negative**: harsh lighting, visible pores, rough texture, watermark, blurry, clinical look

**Notes**:
- Opens immediately with shot and camera move
- Texture description ("rich, silky") is critical for product video — models respond to material quality words
- "Dewy skin" triggers the high-quality skin rendering mode in Seedance
- "Single green leaf for contrast" is a deliberate compositional choice stated explicitly
- Negative prompt includes "clinical look" to steer away from medical aesthetics
