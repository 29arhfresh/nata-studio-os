import type { AITool, GeneratedPrompt, ProcessedBrief, PromptWorkflowSpec, StyleCategory, VisualConcept } from './types';

const STYLE_MODIFIERS: Record<StyleCategory, string[]> = {
  photorealistic: ['RAW photo', 'DSLR quality', 'natural lighting', 'sharp focus'],
  cinematic:      ['cinematic lighting', 'anamorphic lens', 'film grain', 'shallow depth of field'],
  editorial:      ['editorial photography', 'high fashion', 'studio lighting', 'clean background'],
  abstract:       ['abstract', 'non-representational', 'textural', 'expressive'],
  animated:       ['animation', 'stylized', 'smooth motion', 'expressive character'],
  illustration:   ['digital illustration', 'clean lines', 'conceptual art', 'vector-style'],
};

const TOOL_STYLE_TOKENS: Record<AITool, string> = {
  seedance:      '--style cinematic',
  veo:           'captured on RED camera,',
  higgsfield:    '',
  'nano-banana': '',
  magnific:      'ultra high resolution, 8K detail,',
  midjourney:    '--ar 16:9 --style raw',
  flux:          'professional photograph,',
  runway:        'Camera motion:',
  kling:         'cinematic,',
};

const NEGATIVE_BASE = [
  'blurry', 'low quality', 'pixelated', 'watermark', 'text overlay',
  'oversaturated', 'distorted', 'excessive noise', 'artifacts',
];

function buildSubjectLine(spec: PromptWorkflowSpec): string {
  return `${spec.subject}, ${spec.mood.slice(0, 4).join(', ')} mood`;
}

function buildStyleLine(spec: PromptWorkflowSpec): string {
  const modifiers = STYLE_MODIFIERS[spec.style] ?? [];
  return [...spec.tone, ...modifiers].slice(0, 6).join(', ');
}

function buildNegativePrompt(negatives: string[] = []): string {
  return [...NEGATIVE_BASE, ...negatives].join(', ');
}

function countTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
}

function buildBasePrompt(spec: PromptWorkflowSpec): string {
  const subject = buildSubjectLine(spec);
  const style = buildStyleLine(spec);
  return `${subject}. ${style}.`;
}

function refineForTool(basePrompt: string, spec: PromptWorkflowSpec): string {
  const token = TOOL_STYLE_TOKENS[spec.targetTool] ?? '';
  const feedback = spec.refinementFeedback ? ` ${spec.refinementFeedback}.` : '';
  const prefix = token ? `${token} ` : '';
  return `${prefix}${basePrompt}${feedback}`.trim();
}

function buildTechnicalParams(spec: PromptWorkflowSpec): Record<string, string | number> {
  const params: Record<string, string | number> = { style: spec.style };
  if (spec.targetTool === 'midjourney') {
    params['aspect'] = '16:9';
    params['version'] = 6;
  }
  if (spec.targetTool === 'flux') {
    params['steps'] = 30;
    params['guidance'] = 3.5;
  }
  if (['seedance', 'veo', 'runway', 'kling', 'higgsfield'].includes(spec.targetTool)) {
    params['duration'] = '5s';
    params['resolution'] = '1080p';
  }
  return params;
}

export function generatePrompt(spec: PromptWorkflowSpec): GeneratedPrompt {
  const basePrompt = buildBasePrompt(spec);
  const refinedPrompt = refineForTool(basePrompt, spec);
  const negativePrompt = buildNegativePrompt(spec.negatives);
  const technicalParams = buildTechnicalParams(spec);

  return {
    basePrompt,
    refinedPrompt,
    negativePrompt,
    technicalParams,
    tokenCount: countTokens(refinedPrompt),
  };
}

export function generatePromptsFromBrief(
  brief: ProcessedBrief,
  concept: VisualConcept,
  tool: AITool,
): GeneratedPrompt[] {
  return brief.deliverables.map((deliverable) =>
    generatePrompt({
      concept:    concept.description,
      subject:    `${brief.brand} — ${deliverable}`,
      mood:       concept.moodKeywords,
      style:      concept.styleReference,
      targetTool: tool,
      tone:       brief.tone,
    }),
  );
}
