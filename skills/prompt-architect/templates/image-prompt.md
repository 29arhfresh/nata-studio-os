# Template: Image Prompt

Use for text-to-image generation with models like Midjourney, DALL-E, Stable Diffusion, Firefly, Ideogram, or similar.

---

## Anatomy of an Image Prompt

Image models are token-weighted — earlier terms carry more influence. Order matters.

```
[SUBJECT] [ACTION/STATE], [ENVIRONMENT/SETTING], [LIGHTING], [COMPOSITION], [STYLE], [TECHNICAL PARAMS], [EXCLUSIONS]
```

---

## Template

```
[Subject description — who or what, with key visual attributes]
[Action or pose — what they are doing or their state]
[Environment — where, with specific details]
[Lighting — direction, quality, color temperature]
[Composition — angle, framing, depth of field]
[Style — photographic, illustrative, painterly, etc.]
[Technical parameters — lens, film stock, render engine, etc.]
[Mood/atmosphere — optional, one or two words]
[Exclusions — no text, no watermark, no [unwanted element]]
```

---

## Filled Example: Photorealistic

```
Portrait of an elderly fisherman with weathered skin and a grey beard, 
mending a fishing net on a wooden dock at dusk. 
Warm golden hour light from the right. Overcast sky with orange horizon. 
Close-up, shallow depth of field, bokeh background. 
Documentary photography style. 
Shot on Canon EOS R5 with 85mm f/1.4 lens. Film grain. Desaturated shadows. 
Mood: quiet, contemplative.
No text. No watermark. No artifacting.
```

---

## Filled Example: Illustration / Digital Art

```
Fantasy map of a coastal kingdom with mountains to the north and a great river delta, 
illustrated in the style of antique cartography. 
Aged parchment texture. Decorative compass rose in the lower right. 
Hand-lettered place names. Watercolor and ink. Soft warm tones — sepia, ochre, dusty blue.
Overhead view. Highly detailed. No modern elements. No borders or frame.
```

---

## Style Reference Vocabulary

### Photography Styles
- Documentary, portrait, street photography, architectural, macro, aerial, fashion editorial

### Lighting
- Golden hour, blue hour, overcast diffused, studio softbox, hard rim light, candlelight, neon, bioluminescent

### Film / Camera
- Shot on 35mm, Kodak Portra 400, Hasselblad, Leica, anamorphic lens, tilt-shift, fish-eye

### Illustration / Art
- Watercolor, gouache, oil painting, woodblock print, risograph, Moebius-style, Studio Ghibli, Art Nouveau, brutalist

### Render Engines (3D / AI)
- Octane render, Unreal Engine 5, Cinema 4D, Blender, ray-traced, subsurface scattering

---

## Negative Prompts (Stable Diffusion / SDXL)

Add these to the negative prompt field to avoid common artifacts:

```
ugly, deformed, blurry, watermark, text, logo, signature, extra fingers, 
bad anatomy, low resolution, jpeg artifacts, oversaturated, flat lighting
```

---

## Checklist

- [ ] Subject is described before setting and style
- [ ] Lighting direction and quality are explicit
- [ ] Style keyword matches the desired output (photo vs illustration vs 3D)
- [ ] Exclusions are listed (especially: no text, no watermark)
- [ ] Color palette is named if it matters
- [ ] Aspect ratio / resolution specified if the model supports it (e.g., `--ar 16:9`)
