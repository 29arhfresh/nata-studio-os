import type {
  AITool,
  BudgetTier,
  ToolCapability,
  ToolRequirements,
  ToolSelection,
} from './types';

const TIER_RANK: Record<BudgetTier, number> = { economy: 1, standard: 2, premium: 3 };

export const TOOL_CATALOG: Record<AITool, ToolCapability> = {
  seedance: {
    tool: 'seedance',
    mediaTypes: ['video'],
    styles: ['cinematic', 'photorealistic'],
    formats: ['landscape', 'portrait', 'square'],
    strengths: ['consistent motion', 'character consistency', 'scene transitions'],
    weaknesses: ['abstract styles', 'text rendering'],
    tier: 'premium',
    speedRating: 3,
    qualityRating: 5,
  },
  veo: {
    tool: 'veo',
    mediaTypes: ['video'],
    styles: ['photorealistic', 'cinematic'],
    formats: ['landscape', 'portrait'],
    strengths: ['photorealism', 'physics accuracy', 'long-form video'],
    weaknesses: ['stylized art', 'animation'],
    tier: 'premium',
    speedRating: 2,
    qualityRating: 5,
  },
  higgsfield: {
    tool: 'higgsfield',
    mediaTypes: ['video'],
    styles: ['cinematic', 'editorial', 'animated'],
    formats: ['landscape', 'portrait', 'vertical'],
    strengths: ['social content', 'reels', 'motion styles', 'character animation'],
    weaknesses: ['long-form video'],
    tier: 'standard',
    speedRating: 4,
    qualityRating: 4,
  },
  'nano-banana': {
    tool: 'nano-banana',
    mediaTypes: ['image'],
    styles: ['illustration', 'abstract', 'editorial'],
    formats: ['square', 'portrait', 'landscape'],
    strengths: ['creative concepts', 'unique styles', 'fast iteration'],
    weaknesses: ['photorealism', 'video'],
    tier: 'economy',
    speedRating: 5,
    qualityRating: 3,
  },
  magnific: {
    tool: 'magnific',
    mediaTypes: ['image', 'video'],
    styles: ['photorealistic', 'editorial', 'cinematic'],
    formats: ['square', 'portrait', 'landscape'],
    strengths: ['upscaling', 'detail enhancement', 'creative upscale', 'relighting'],
    weaknesses: ['original generation from scratch'],
    tier: 'standard',
    speedRating: 3,
    qualityRating: 5,
  },
  midjourney: {
    tool: 'midjourney',
    mediaTypes: ['image'],
    styles: ['editorial', 'cinematic', 'illustration', 'photorealistic'],
    formats: ['square', 'portrait', 'landscape'],
    strengths: ['artistic quality', 'aesthetic consistency', 'style range'],
    weaknesses: ['text rendering', 'precise control'],
    tier: 'standard',
    speedRating: 4,
    qualityRating: 5,
  },
  flux: {
    tool: 'flux',
    mediaTypes: ['image'],
    styles: ['photorealistic', 'editorial', 'illustration'],
    formats: ['square', 'portrait', 'landscape'],
    strengths: ['photorealism', 'text rendering', 'fine detail', 'prompt adherence'],
    weaknesses: ['abstract styles'],
    tier: 'standard',
    speedRating: 4,
    qualityRating: 4,
  },
  runway: {
    tool: 'runway',
    mediaTypes: ['video'],
    styles: ['cinematic', 'animated', 'editorial'],
    formats: ['landscape', 'portrait', 'vertical'],
    strengths: ['image-to-video', 'camera motion control', 'scene transitions'],
    weaknesses: ['complex multi-scene', 'photorealism at scale'],
    tier: 'standard',
    speedRating: 4,
    qualityRating: 4,
  },
  kling: {
    tool: 'kling',
    mediaTypes: ['video'],
    styles: ['cinematic', 'photorealistic', 'animated'],
    formats: ['landscape', 'portrait', 'vertical'],
    strengths: ['motion quality', 'character animation', 'face consistency'],
    weaknesses: ['complex backgrounds'],
    tier: 'standard',
    speedRating: 3,
    qualityRating: 4,
  },
};

const TOOL_PROMPT_TIPS: Record<AITool, string[]> = {
  seedance:      ['Describe camera movement before scene', 'Lead with subject description'],
  veo:           ['Use cinematic language and lens specs', 'Specify lighting as a DoP would'],
  higgsfield:    ['Include aspect ratio in the prompt', 'Name the motion style explicitly'],
  'nano-banana': ['Use abstract descriptors first', 'Put mood keywords before subject'],
  magnific:      ['Describe the enhancement goal', 'Specify which area to add detail'],
  midjourney:    ['Append --ar and --style flags', 'Reference specific photographers or art styles'],
  flux:          ['Be literal and precise', 'Include lighting setup for photorealism'],
  runway:        ['Start motion lines with "Camera:"', 'Describe start and end frame separately'],
  kling:         ['Describe character emotion and pose', 'Define background environment separately'],
};

function scoreCandidate(tool: ToolCapability, req: ToolRequirements): number {
  if (!tool.mediaTypes.includes(req.mediaType)) return 0;
  if (!tool.styles.includes(req.style)) return 0;
  let score = 60;
  if (tool.formats.includes(req.outputFormat)) score += 10;
  if (TIER_RANK[tool.tier] <= TIER_RANK[req.budgetTier]) score += 10;
  if (req.priority === 'quality') score += tool.qualityRating * 3;
  else if (req.priority === 'speed') score += tool.speedRating * 3;
  else score += (4 - TIER_RANK[tool.tier]) * 3;
  if (req.needsUpscaling === true && tool.tool === 'magnific') score += 20;
  if (req.needsVideoFromImage === true && ['runway', 'kling', 'higgsfield'].includes(tool.tool)) {
    score += 15;
  }
  return score;
}

function buildRationale(primary: AITool, req: ToolRequirements, score: number): string {
  const cap = TOOL_CATALOG[primary];
  const topStrengths = cap.strengths.slice(0, 2).join(', ');
  return (
    `${primary} selected for ${req.mediaType}/${req.style} at ${req.budgetTier} tier` +
    ` (score: ${score}). Key strengths: ${topStrengths}.`
  );
}

export function selectTool(requirements: ToolRequirements): ToolSelection {
  const scored = (Object.values(TOOL_CATALOG) as ToolCapability[])
    .map((cap) => ({ tool: cap.tool, score: scoreCandidate(cap, requirements) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    throw new Error(
      `TOOL_NOT_FOUND: No tool supports ${requirements.mediaType} + ${requirements.style}.`,
    );
  }

  const primary = scored[0].tool;
  const alternatives = scored.slice(1, 3).map((e) => e.tool);

  return {
    primary,
    alternatives,
    rationale: buildRationale(primary, requirements, scored[0].score),
    promptTips: TOOL_PROMPT_TIPS[primary],
    score: scored[0].score,
  };
}
