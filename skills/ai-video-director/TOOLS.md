# Tools Reference — AI Video Director

Platform-by-platform capability reference for AI video generation and post-production.

---

## Generation Models

### Seedance v2

**Provider**: ByteDance  
**Access**: Via Higgsfield platform, direct API  
**Best for**: Photorealistic commercial video, human subjects, product shoots

**Capabilities**
- Duration: 4s, 6s, 8s per clip
- Aspect ratios: 16:9, 9:16, 1:1, 4:3
- Max resolution: 1080p
- Motion control: Prompt-driven; responds to explicit camera language
- Image-to-video: Supported
- Negative prompts: Not natively supported; embed exclusions in prompt

**Prompt Behavior**
- Weights the first 30 words heavily — lead with subject and camera
- Responds well to brand-quality adjectives: "luxury," "premium," "editorial," "cinematic"
- "Camera slowly pushes in" is more reliable than directional terms like "dolly"
- Strong with human skin, fabric, and reflective surfaces
- Tends to add subtle camera movement even on static shots — state "camera holds completely static" if needed

**Known Limitations**
- Struggles with text rendering
- Hands occasionally incorrect — use negative prompts or crop to avoid full hand visibility
- Long prompt descriptions of background elements can pull focus from subject

**Parameters**
```
model: seedance-v2
duration: [4 | 6 | 8]
aspect_ratio: [16:9 | 9:16 | 1:1 | 4:3]
motion_intensity: [0.0–1.0]
seed: [integer]
```

---

### Google Veo (Veo 3)

**Provider**: Google DeepMind  
**Access**: Google AI Studio, Vertex AI, VideoFX  
**Best for**: Long-form cinematic content, environmental scenes, physics-heavy subjects

**Capabilities**
- Duration: Up to 60s (8s increments recommended)
- Aspect ratios: 16:9, 9:16, 4:3, 1:1
- Max resolution: 4K
- Motion control: Advanced — responds to cinematic language and lens specifications
- Image-to-video: Supported (strong)
- Negative prompts: Fully supported
- Audio generation: Veo 3 generates synchronized audio

**Prompt Behavior**
- Longer, more descriptive prompts produce better results than brief ones
- Mm-equivalent lens descriptions work ("as if shot on 85mm portrait lens")
- Strong with natural elements: water, fire, weather, foliage physics
- Negative prompt is essential — default outputs without it have more artifacts

**Known Limitations**
- Human faces at extreme close-up can have subtle uncanny quality
- Very complex multi-character scenes may produce positional drift
- API access may be rate-limited for high-volume use

**Parameters**
```
model: veo-3
duration: [8 | 16 | 24 | ...]
aspect_ratio: [16:9 | 9:16 | 4:3]
negative_prompt: [string]
seed: [integer]
temperature: [0.0–1.0]
```

---

### Kling (Kling 2.0 / Kling 2.1)

**Provider**: Kuaishou  
**Access**: Kling AI platform, API  
**Best for**: Style exploration, fast iteration, motion brush control, animated aesthetics

**Capabilities**
- Duration: 5s, 10s
- Aspect ratios: 16:9, 9:16, 1:1
- Max resolution: 1080p (2K in Master mode)
- Motion control: Motion brush (region-specific), camera control presets, prompt-driven
- Image-to-video: Supported (strong)
- Negative prompts: Supported
- Styles: Realistic, anime, 3D animation, comic

**Prompt Behavior**
- Responds well to style keywords that match the platform's mode (Realistic, Animation)
- Motion brush allows drawing motion vectors on specific regions of an image
- Camera control mode offers presets: Static, Zoom In/Out, Pan Left/Right, Tilt Up/Down, Push In, Pull Out, Orbit Left/Right
- Shorter prompts (under 80 words) often outperform long ones for style-focused work

**Known Limitations**
- Transitions between camera presets can feel mechanical at higher speeds
- Complex multi-subject scenes with specific interactions are harder to control
- Audio is not generated natively

**Parameters**
```
model: kling-2.1
mode: [standard | pro | master]
duration: [5 | 10]
aspect_ratio: [16:9 | 9:16 | 1:1]
camera_control: [preset or custom]
negative_prompt: [string]
cfg_scale: [0–1.0]
seed: [integer]
```

---

### Sora

**Provider**: OpenAI  
**Access**: ChatGPT Pro/Team, Sora.com  
**Best for**: Complex scene composition, multi-element interactions, surreal and fantastical content

**Capabilities**
- Duration: 5s, 10s, 20s
- Aspect ratios: 16:9, 9:16, 1:1, custom
- Max resolution: 1080p
- Motion control: Storyboard mode for multi-shot sequences, prompt-driven
- Image-to-video: Supported
- Negative prompts: Not directly; use "avoid" language in main prompt
- Remix mode: Available for variations

**Prompt Behavior**
- Storyboard mode allows prompting individual scenes in sequence
- World-model approach produces spatially consistent environments
- Strong with physically complex scenes: crowds, multiple moving objects, architecture
- Abstract and metaphorical prompts often work surprisingly well
- Responds to film reference names: "in the style of a Wong Kar-wai film" 

**Known Limitations**
- Consistency of specific characters across multiple generations is limited without reference images
- Text in video is unreliable
- Less predictable on short commercial-style prompts

**Parameters**
```
model: sora
duration: [5 | 10 | 20]
aspect_ratio: [16:9 | 9:16 | 1:1]
resolution: [480p | 1080p]
variation: [0–100]
```

---

### Higgsfield

**Provider**: Higgsfield AI  
**Access**: Higgsfield platform, MCP server integration  
**Best for**: Character-consistent cinematic video, drama, character-driven content

**Capabilities**
- Duration: 4s, 8s
- Aspect ratios: 16:9, 9:16, 1:1, 4:5, 2.39:1
- Max resolution: 1080p (upscale to 4K available)
- Motion control: Named camera presets + custom trajectories
- Image-to-video: Strong; reference image locks character appearance
- Negative prompts: Supported
- Character consistency: Best-in-class with reference image seeding
- Upscale: Built-in 2K/4K upscaling

**Camera Motion Presets**
```
orbit_left | orbit_right
zoom_in | zoom_out
truck_left | truck_right
tilt_up | tilt_down
push_in | pull_out
arc_left | arc_right
drone_ascent | drone_descent
static
```

**Prompt Behavior**
- Reference images dramatically improve character consistency
- Camera motion preset should be specified as a parameter, not in the prompt
- "Cinematic," "anamorphic," "film grain" are reliable quality triggers
- Strong with dialogue-style shots and emotional close-ups

**Known Limitations**
- Complex crowd scenes with many characters degrade consistency
- Very abstract or non-narrative content is not a strength

**Parameters**
```
model: higgsfield-1
duration: [4 | 8]
aspect_ratio: [16:9 | 9:16 | ...]
camera_motion: [preset name]
negative_prompt: [string]
seed: [integer]
reference_image: [url or asset_id]
upscale: [true | false]
```

---

### Nano Banana

**Provider**: Nano Banana  
**Access**: Platform interface  
**Best for**: Stylized, experimental, motion-graphic, and abstract content

**Capabilities**
- Duration: 3s, 6s
- Aspect ratios: 16:9, 9:16, 1:1
- Styles: Experimental, abstract, stylized realistic, motion graphic
- Image-to-video: Limited
- Negative prompts: Not supported

**Prompt Behavior**
- Short prompts (under 50 words) produce more coherent results than long ones
- Strong with particle systems, morphing transitions, abstract geometry
- Avoid trying to specify specific cinematic camera moves — not well-supported
- "Glowing," "flowing," "crystalline," "organic" are reliable texture triggers

**Known Limitations**
- Not suitable for photorealistic human subjects
- Limited control over camera movement
- Consistency across generations is low

---

## Post-Production Tools

### Upscaling

**Higgsfield Upscale**
- Input: Generated video clips
- Output: 2K or 4K enhanced video
- Best for: Higgsfield and Seedance outputs
- Access: Within Higgsfield platform

**Magnific Video Upscale**
- Input: Any video
- Output: Up to 4K with detail enhancement
- Best for: Improving quality before delivery
- Access: Magnific platform (`mcp__Magnific__video_upscale`)

### Video Concatenation

**Magnific Video Concatenate**
- Joins multiple clips in sequence
- Access: `mcp__Magnific__video_concatenate`
- Input: Ordered list of clip identifiers

### Audio Generation

**Higgsfield Audio**
- Generate music, SFX, and ambient audio
- Access: `mcp__Hihhsfield__generate_audio`
- Voice list: `mcp__Hihhsfield__list_voices`

**Magnific TTS**
- Text-to-speech for dialogue
- Access: `mcp__Magnific__audio_tts`
- Voice options: `mcp__Magnific__audio_voices_list`

**Magnific Music Generation**
- AI music for video scoring
- Access: `mcp__Magnific__audio_music_generate`

### Dubbing and Voice Replacement

**Higgsfield Dubbing**
- Replace audio track with generated voice
- Access: `mcp__Hihhsfield__dubbing`

**Higgsfield Voice Change**
- Modify voice characteristics in existing audio
- Access: `mcp__Hihhsfield__voice_change`

### Image Enhancement (Pre-Video)

**Magnific Image Upscale**
- Enhance reference images before image-to-video generation
- Access: `mcp__Magnific__images_upscale`

**Higgsfield Remove Background**
- Clean subject isolation for compositing
- Access: `mcp__Hihhsfield__remove_background`

**Magnific Relight**
- Change lighting direction and quality on images
- Access: `mcp__Magnific__images_relight`

---

## Model Capability Summary

| Capability | Seedance v2 | Veo 3 | Kling 2.1 | Sora | Higgsfield | Nano Banana |
|------------|:-----------:|:-----:|:---------:|:----:|:----------:|:-----------:|
| Photorealism | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★☆☆☆ |
| Character consistency | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★☆☆☆☆ |
| Camera control | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★★★ | ★★☆☆☆ |
| Physics simulation | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |
| Abstract/stylized | ★★☆☆☆ | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★☆☆☆ | ★★★★★ |
| Long-form coherence | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ |
| Iteration speed | ★★★★☆ | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★★ |
| Audio generation | ☆☆☆☆☆ | ★★★★★ | ☆☆☆☆☆ | ☆☆☆☆☆ | ☆☆☆☆☆ | ☆☆☆☆☆ |
| Negative prompt support | ☆☆☆☆☆ | ★★★★★ | ★★★★☆ | ★★☆☆☆ | ★★★★☆ | ☆☆☆☆☆ |
| Image-to-video | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★★ | ★★☆☆☆ |
