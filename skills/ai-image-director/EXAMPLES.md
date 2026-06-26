# Examples — AI Image Director

Annotated production examples across use cases. Each example includes the brief, the completed prompt, the design rationale, known failure modes for this pattern, and iteration notes.

---

## Example 1 — Luxury Product Hero (Flux Pro)

### Brief
A perfume bottle — tall rectangular frosted glass, black cap, gold foil label — on a dark reflective surface. Luxury positioning. For use as a homepage hero image.

### Visual Specification
- **Subject**: Perfume bottle, three-quarter angle, 20° rotation
- **Environment**: Dark seamless, charcoal near black, slight vignette
- **Lighting**: Single narrow strip light from camera right, 3200K warm, hard specular on glass, subtle warm glow on surface reflection
- **Lens**: 85–100mm equivalent, f/8 deep focus, slight compression
- **Materials**: Frosted glass (diffuse, no clear reflection), metallic gold foil (bright specular highlight), glossy black cap (mirror-like)
- **Color**: Near-monochromatic dark palette, warm gold accent, black shadow
- **Grade**: Muted, luxury dark

### Prompt

```
Luxury perfume bottle, tall rectangular frosted glass body, matte black cap, 
embossed gold foil label with serif typography, standing upright on glossy 
dark charcoal reflective surface, reflection visible below. 

Three-quarter angle, 20° clockwise rotation, 85mm lens equivalent, f/8, 
deep focus, tack sharp entire bottle.

Single narrow strip light from camera right, 3200K warm white, hard specular 
highlight running vertical on right edge of glass, gold foil catching warm 
bright specular, black cap with mirror-like reflection. Subtle warm ambient fill 
from left, very low intensity. Dark vignette at frame edges.

Frosted glass: diffuse translucent surface, no clear reflections visible through 
glass, slight internal glow. Gold foil: crisp anisotropic specular, sharp edges, 
warm metallic. Reflective surface: deep, slightly blurred reflection of bottle base.

Color palette: near-black background, charcoal shadows, warm gold accent only, 
dark muted tonal grade. No color cast except gold warmth.

Packshot quality, luxury perfume photography, Vogue fragrance spread, 
ultra-high resolution, Phase One medium format digital, no dust, no fingerprints.
```

### Negative Prompt

```
blurry, low quality, jpeg artifacts, oversaturated, cheap, drugstore product, 
bright background, white background, harsh shadows on background, 
plastic appearance, amateur, color bleeding, chromatic aberration
```

### Parameters

```
Model: flux-pro
Aspect ratio: 4:5 (portrait, homepage hero)
Steps: 30
Guidance: 3.5
```

### Design Rationale

The single narrow strip light from camera right is the defining choice here. It creates a vertical specular line on the frosted glass that communicates the bottle's shape, height, and material without flooding the dark background. Hard light on a dark set is the standard luxury perfume photography formula — used by Tom Ford, Chanel, Dior across decades of commercial photography.

The 85mm lens with f/8 was chosen over a shallower aperture because the bottle must be entirely sharp. Product photography for e-commerce and hero positioning requires every feature of the product to read clearly. Bokeh would sell atmosphere, not product.

The gold foil label is an anchor for a warm accent in a monochromatic palette. Without it, the image risks being too cold and industrial.

### Known Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Background appears brown or warm-tinted | Model interprets "warm light" as a global grade | Add "cool charcoal background, only gold is warm" |
| Glass looks clear (not frosted) | "Frosted" reads inconsistently on Flux | Add "ground glass finish, diffuse, translucent, no see-through, matte glass surface" |
| Label text is distorted | All AI models struggle with rendered type | Use Ideogram for text-critical images, or inpaint the label with a real asset |
| Reflection too sharp and distracting | Reflective surface reads as mirror | Add "blurred floor reflection, slight motion blur in reflection" |

---

## Example 2 — Editorial Portrait (Flux Ultra)

### Brief
A portrait of a woman in her late 30s for a feature profile in a business magazine. Subject is a CEO. The image should read confident, intelligent, approachable — not austere. Shot feels like Annie Leibovitz-era Vogue portraiture with natural light.

### Visual Specification
- **Subject**: Woman, late 30s, business casual attire, direct eye contact
- **Environment**: Neutral architectural background, pale warm wall, shallow depth
- **Lighting**: Large window light from camera left, soft and natural, 5000K neutral, slight warm fill from right
- **Lens**: 85mm, f/2.8, shallow DOF, subject sharp, background soft
- **Shot size**: Medium close-up — shoulders to just above head
- **Color**: Warm natural, lifted shadows, skin-forward palette

### Prompt

```
Executive portrait of a 38-year-old woman, natural warm olive skin, dark brown 
straight hair pulled loosely back, minimal makeup, direct confident gaze into 
camera, slight almost-smile, shoulders relaxed downward, wearing a fitted 
charcoal blazer over a white silk blouse.

Architectural background: warm pale greige wall, smooth painted plaster, slightly 
out of focus, no distracting elements.

Large window light from camera left, soft diffused north-facing daylight, 5000K 
neutral white, wrapping across face, catchlight visible in left eye. Slight warm 
reflector fill from camera right, lower intensity, warming right cheek. No rim 
light. Natural ambient light fills shadows softly.

85mm portrait lens, f/2.8, medium close-up framing chin to just above crown, 
camera at subject eye level, slight left-of-center composition, subject's face 
on right third.

Skin: natural, even-toned, healthy without airbrushed perfection, fine pores 
visible at 1:1, subsurface scattering warmth. Hair: natural shine, individual 
strands visible, no plastic or wet-look sheen.

Color grade: warm natural, lifted shadow floor, slightly compressed highlights, 
skin tones lead the palette, background neutral. No digital filter appearance.

Annie Leibovitz editorial portrait, published in Bloomberg Businessweek, 
shot on Leica, natural light portraiture, magazine quality retouching, 
ultra-high resolution, tack sharp eyes.
```

### Negative Prompt

```
blurry, low quality, artificial looking, plastic skin, overly retouched, 
uncanny valley, asymmetrical eyes, deformed hands, unnatural pose, 
studio strobe, harsh shadows, glamour photography, oversaturated
```

### Parameters

```
Model: flux-ultra
Aspect ratio: 2:3
Steps: 35
Guidance: 3.0
```

### Design Rationale

Window light is specified as "north-facing" because north light in the northern hemisphere is indirect, consistently soft, and neutral — a legacy of portrait painters and the reason photography studios historically faced north. This level of specificity activates photographic realism.

The camera placement at "subject eye level" prevents either looking up at the subject (creates authority but reduces warmth) or looking down (creates vulnerability). Eye level at f/2.8 with 85mm is the classic editorial standard for approachable authority.

"Fine pores visible at 1:1" is included deliberately. Heavily retouched images lose the texture cues that make skin feel real. Editorial portrait retouching leaves pore structure intact — it is a mark of quality, not a failure.

### Known Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Eyes are different sizes | Common Flux failure on angled faces | Add "symmetrical eyes, both eyes identical size and shape" or try different seed |
| Skin appears plastic | Over-smoothed texture | Reinforce with "natural skin texture, pores visible, not retouched" |
| Background bleeds warmth into subject | Model applies global grade | Add "background neutral, no light spill from background onto subject" |
| Hair looks wet or oily | Texture cue interpretation | Add "dry natural hair, matte finish, flyaways visible" |

---

## Example 3 — Fashion Editorial (Midjourney)

### Brief
A fashion editorial for a linen summer collection. Maximalist Mediterranean setting — terracotta, bougainvillea, white plaster. Garment is a wide-leg cream linen trouser and matching blazer. Mood: languid European summer, 1970s Italian Vogue reference.

### Prompt

```
Fashion editorial photography, female model, early 20s, slim build, sun-kissed 
light skin, wavy honey-blond hair loose past shoulders, wearing wide-leg cream 
linen trousers and an oversized cream linen blazer, lapels open, no shirt underneath. 

Posed leaning against an old white plaster wall, one hand touching wall, 
one arm loose at side, head tilted slightly looking away from camera, 
weight shifted to back foot.

Mediterranean courtyard setting, ancient white plaster wall with vertical 
cracks, bougainvillea vine with fuchsia flowers entering from upper left, 
terracotta pot partially visible lower right, old stone floor.

Golden hour backlight from upper left, sun just below visible frame, 
rim lighting through linen fabric creating warm translucency, 
warm fill light reflecting from plaster wall. Color temperature 4000K golden.

Wide lens, 35mm equivalent, slight wide-angle perspective, 
full body in frame, head to floor, generous negative space right side. 
Shot from slightly low angle, approx 3° below waist height.

Linen fabric: natural cream with slight wrinkle texture, visible weave at fabric edge, 
warm translucent quality in backlight, slight flutter in imagined breeze. 
Skin: warm golden tan, minimal visible makeup.

Color grade: warm golden hour palette, slightly blown highlights on wall, 
shadows warm not cold, saturated bougainvillea fuchsia as accent pop, 
cream and terracotta dominant.

1970s Italian Vogue, Helmut Newton summer editorial, luxury fashion photography, 
film grain, shot on Contax RTS, ultra-high resolution --ar 2:3 --style raw --stylize 400 --v 6.1
```

### Design Rationale

Midjourney's `--style raw` is essential for fashion editorial work that must feel like film photography rather than AI illustration. Without it, Midjourney tends toward stylized painterliness that clashes with the photographic realism required for a fashion client.

`--stylize 400` gives enough stylization for the editorial warmth and 1970s aesthetic reference without losing structural realism. At `--stylize 750+`, the proportions and fabric rendering drift toward illustration.

The 35mm equivalent lens with a low camera angle is the choice that makes models appear taller and garments read more dramatically. Fashion photographers routinely shoot at this angle for full-body looks.

The backlight through linen creates the translucency that sells the fabric's quality — this is a technique from film photography where placing translucent materials against a backlight source reveals the fabric's structure.

### Known Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Garment looks like a dress | Midjourney conflates loose linen with dresses | Add "wide-leg trousers, palazzo pants, visible separation between legs" |
| 1970s reference produces vintage photo quality | Style reference overweights decade over photography quality | Change to "inspired by 1970s Italian fashion photography, contemporary editorial production quality" |
| Bougainvillea looks painted | Midjourney stylizes plants heavily | Add `--style raw` if not present, reduce `--stylize` |
| Model face appears overly composite | Multiple style references conflict | Remove photographer name references, keep only magazine and decade |

---

## Example 4 — Character Design (Flux Pro)

### Brief
An original character for an animated series. Young female scientist, early 20s, South Asian heritage, glasses, working in a near-future lab. The character should feel grounded and real, not cartoony — closer to animated feature film than TV animation.

### Prompt

```
Character concept art, original animated feature film aesthetic, young female 
scientist, early 20s, South Asian heritage, warm medium-brown skin, 
dark black hair in a practical high bun with loose strands escaping, 
large dark eyes behind round wire-frame glasses, slight natural brow, 
warm expression focused on work.

Wearing a fitted deep navy lab coat, white crew-neck t-shirt visible at collar, 
dark jeans, white sneakers. Small gold stud earrings. Lab lanyard with 
ID badge around neck.

Character pose: three-quarter view, turned 30° from camera, looking down 
at a holographic display projecting from a handheld device, slight lean forward.

Near-future laboratory background: clean white surfaces, ambient blue LED 
underlighting from workstation surfaces, holographic displays in background 
out of focus, high-ceiling industrial converted space.

Lighting: cool ambient blue from workstation displays below, warm tungsten 
fill from above, slight rim light from right catching hair and shoulder.

Character design quality: Pixar character development study, model sheet style, 
clean line work visible at edges, consistent proportions, animated feature 
film production art, ultra-detailed, high-resolution character turnaround.
```

### Negative Prompt

```
blurry, low quality, cartoon, flat, 2D illustration style, anime, manga, 
chibi proportions, oversimplified, realistic photography (not illustration)
```

### Parameters

```
Model: flux-pro
Aspect ratio: 3:4
Steps: 30
Guidance: 4.0
```

### Design Rationale

Character design prompting on Flux requires the model to land in the narrow zone between photographic realism and full illustration. "Animated feature film production art" with "Pixar character development study" creates this zone — both references produce three-dimensional characters with human proportions that are clearly illustrated, not photographed.

The "model sheet style" cue is critical for character design work. It activates the presentation format that professional character artists use — clean, on-model, consistent — rather than an in-action dynamic pose that may be harder to use as a reference.

The lighting description places cool from below and warm from above — a deliberate near-future lab aesthetic that contrasts with natural environment lighting. It makes the space feel technological without being cold.

### Known Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Image looks like photograph | Flux defaults toward realism | Strengthen illustration cues: "animation production art, character design illustration" |
| Glasses distort the face | Complex optics near eyes challenge models | Try `deformed glasses, asymmetrical glasses` in negative prompt; add `clean round wire-frame glasses, no lens distortion` |
| Hair looks messy beyond spec | "Loose strands" reads too broadly | Specify "two or three loose strands at temples, otherwise clean bun, controlled hairstyle" |
| Background competes with character | Lab detail too prominent | Add "shallow depth of field background, 85mm equivalent, character in sharp focus" |

---

## Example 5 — Product Inpaint (Magnific)

### Brief
A packshot of a serum bottle was generated on white background. The label region shows a generic placeholder label. The client wants the label area replaced with a realistic premium label with a specific embossed texture — no text (text will be composited separately).

### Source Image
High-quality packshot, white background, bottle shape and cap are correct. Label region: flat, generic, incorrect.

### Inpaint Prompt

```
Premium skincare label, white uncoated paper stock, slight embossed texture 
visible at edges, matte finish, clean rectangular proportions matching bottle 
curve, slight shadow along top and bottom label edges from bottle curve, 
no text, no graphics, pure textured white surface, label fits flush to bottle.
```

### Magnific Settings

```
Tool: inpaint
Creativity: 2
Style: photographic
Prompt weight: 0.7
```

### Design Rationale

Creativity at 2 (on a 1–5 scale) preserves the lighting, shading, and material quality of the surrounding bottle while allowing enough creativity to fill the masked label region convincingly. Higher creativity would introduce hallucinated label graphics; lower creativity would not deviate enough from the placeholder content.

The prompt describes the label purely in terms of material and surface properties — "embossed texture," "matte finish," "flush to bottle" — because the goal is a texturally correct blank that a designer will composite real text onto. Prompting for a label design would produce unreliable type rendering.

### Known Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Seam visible at mask edge | Mask boundary too sharp | Feather mask by 5–10px and re-run |
| New label has different lighting | Creativity too high | Reduce creativity to 1–2 |
| Label appears curved incorrectly | Mask did not account for bottle curvature | Re-mask carefully following the label edge curvature, not a rectangle |

---

## Example 6 — Consistent Character Sequence (Flux Pro + Reference)

### Brief
Three-image lifestyle sequence for a sustainable clothing brand. Same character across all three images. Different environments, same person, same outfit.

### Character Seed

```
NADIA: 34-year-old woman. Skin: light warm beige with visible freckles across 
nose and cheeks. Hair: auburn red, natural wave, medium length just past shoulders, 
slightly tousled. Eyes: pale grey-green, light brows. Build: slender, medium height.
Distinctive features: freckles, slightly angular jaw, soft expression.
Wearing: moss green wide-leg organic cotton trousers, cream ribbed knit turtleneck 
tucked loosely into waistband, no jewelry, tan suede loafers.
```

### Image 1 — Morning Kitchen

```
NADIA: 34-year-old woman, light warm beige skin, auburn red shoulder-length wavy 
hair, pale grey-green eyes, freckles across nose and cheeks, wearing moss green 
wide-leg organic cotton trousers, cream ribbed knit turtleneck, tan suede loafers.

She stands in a bright morning kitchen, holding a ceramic mug with both hands, 
looking out the window, slight smile, relaxed and unhurried.

Scandinavian minimalist kitchen, pale oak cabinets, white countertops, single 
potted herb on windowsill, natural morning light flooding from window.

Natural north-facing window light from camera right, 5500K daylight, soft and 
diffused, fill from white kitchen surfaces. Warm glow of natural light on skin.

50mm lens, f/2.8, medium shot waist to head, eye level. Subject on left third, 
window on right third.

Color grade: natural, warm morning palette, lifted shadows, skin-forward, 
pale green and cream dominant, soft sunlight whites.

Lifestyle photography, sustainable brand campaign, clean editorial, Kinfolk magazine.
```

### Image 2 — Urban Street

```
NADIA: 34-year-old woman, light warm beige skin, auburn red shoulder-length wavy 
hair, pale grey-green eyes, freckles across nose and cheeks, wearing moss green 
wide-leg organic cotton trousers, cream ribbed knit turtleneck, tan suede loafers.

She walks along a quiet tree-lined city street, mid-stride, canvas tote bag over 
left shoulder, looking forward with purpose, slight movement in hair and trouser leg.

Tree-lined urban sidewalk, dappled leaf shadow on pavement, warm autumn trees in 
background, no traffic in frame, quiet European street aesthetic.

Dappled natural daylight through overhead tree canopy, warm 4500K golden autumn 
light, alternating light and soft shadow across subject, slight backlighting from sun 
behind trees.

35mm lens, f/5.6, full body shot feet to head, camera at waist height looking up 
slightly, subject centered, movement implied.

Color grade: warm autumn palette, amber and moss green, desaturated but warm, 
slight analog film quality.

Lifestyle campaign photography, sustainable fashion, street style editorial.
```

### Image 3 — Workspace

```
NADIA: 34-year-old woman, light warm beige skin, auburn red shoulder-length wavy 
hair, pale grey-green eyes, freckles across nose and cheeks, wearing moss green 
wide-leg organic cotton trousers, cream ribbed knit turtleneck, tan suede loafers.

She sits at a light wood desk, leaning forward on both elbows, reading from a 
notebook, pen in right hand, fully absorbed.

Minimal home studio workspace, white walls, pale natural wood desk, single 
architectural lamp from left (off frame), clean surfaces, no clutter.

Architectural task lamp from camera left, warm tungsten 3200K, focused directional 
light on desk surface and left side of subject, natural daylight from right window 
as cooler ambient fill.

85mm lens, f/2.0, medium close-up from upper chest to above head, slight low angle, 
subject on right third.

Color grade: warm tungsten desk lamp accent, cool neutral ambient, skin warm from 
lamp, clean whites, intentional temperature contrast.

Lifestyle photography, interiors editorial, sustainable brand campaign.
```

### Consistency Notes

Each prompt opens with the identical character seed. When using Flux without reference image conditioning, this is the only anchor for visual consistency. Generate each image with the same seed across the three prompts for additional consistency.

If consistency is critical for commercial use, generate Image 1 at the best seed, then use that image as a reference conditioning input for Images 2 and 3 on a platform that supports it (Magnific, Kling).

---

## Example 7 — Advertising Hero (Flux Ultra + Ideogram for Text)

### Brief
A full-bleed outdoor advertising image for a premium bottled water brand. The image is a landscape of a high-altitude glacier lake. Needs text overlay space. Pure nature, no people. Aspect ratio 16:9 for billboard format.

### Prompt (Flux Ultra — Image Base)

```
Ultra-high-altitude mountain glacier lake, crystal-clear turquoise-blue water, 
mirror-perfect reflection of snow-capped peak, glacial moraine stones in 
foreground, pure white glacier descending upper left background.

Full panoramic landscape, no people, no structures, no aircraft trails, pristine 
untouched natural environment.

Overcast bright sky with soft directional light through thin cloud layer, 
diffused cool 7000K light, even illumination across landscape, no harsh shadows. 
Pale blue and white sky, water reflects sky color.

Ultra-wide 14mm lens, f/16 maximum depth of field, every element sharp from 
foreground stones to distant peak, low camera position near water surface.

Water: crystal clear, highly transparent, teal-blue hue, stones visible on 
lake floor 1–2m from shore, gentle ripples at far shore, still center reflection.
Snow and glacier: pure white, slight blue shadow in crevasses, fresh unmelted.
Foreground stones: wet, dark grey and slate, rounded glacial moraine shape.

Color palette: cold white, glacial teal, slate grey, pale sky blue. 
No warm tones — entire palette is cool and clean.

Color grade: desaturated blue-cool, clean whites not blown, 
maximum clarity grade, HDR landscape photograph.

National Geographic landscape photography, luxury brand campaign, 
16:9 format billboard, shot on Phase One XF, ultra-high resolution, 
tack sharp, no visible noise.
```

### Parameters

```
Model: flux-ultra
Aspect ratio: 16:9
Steps: 40
Guidance: 3.5
```

### Text Overlay Strategy

After generating the landscape, do not place text in Flux. Generate on Ideogram separately using the `ideogram.md` template for the text treatment — "PURE." in a clean geometric sans, white, positioned in the upper third where the sky provides adequate contrast. Composite in post.

### Design Rationale

Text in AI-generated landscapes on Flux produces typographic errors. Ideogram handles typography reliably. The correct workflow is to generate the visual background and the text treatment separately, then composite — which is also how this is done in professional advertising production (photography + design studio are separate disciplines).

The cold color palette is a deliberate brand code decision. Premium water brands consistently use cool palettes because they signal purity, clarity, and altitude. Warm palettes code as earthy, rustic, or warm-climate — wrong for a glacier positioning.
