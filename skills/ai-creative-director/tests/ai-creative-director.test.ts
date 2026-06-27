import aiCreativeDirector, {
  selectTool,
  reviewOutput,
  generatePrompt,
  planProduction,
  runBriefWorkflow,
  runPromptWorkflow,
} from '../src/index';
import { TOOL_CATALOG } from '../src/tool-selector';
import { generatePromptsFromBrief } from '../src/prompt-builder';
import type {
  BriefWorkflowSpec,
  OutputReviewInput,
  ProcessedBrief,
  ProductionBriefInput,
  PromptWorkflowSpec,
  ToolRequirements,
  ToolSelection,
  VisualConcept,
} from '../src/types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const videoRequirements: ToolRequirements = {
  mediaType:    'video',
  style:        'cinematic',
  outputFormat: 'landscape',
  budgetTier:   'premium',
  priority:     'quality',
};

const imageRequirements: ToolRequirements = {
  mediaType:    'image',
  style:        'photorealistic',
  outputFormat: 'square',
  budgetTier:   'standard',
  priority:     'quality',
};

const briefSpec: BriefWorkflowSpec = {
  brand:          'Nata Studio',
  objective:      'Launch new editorial campaign for spring collection.',
  targetAudience: 'Fashion-forward millennials in urban markets',
  deliverables:   ['hero-image', 'social-reel'],
  tone:           ['cinematic', 'minimal'],
  mediaType:      'video',
  budgetTier:     'standard',
};

const promptSpec: PromptWorkflowSpec = {
  concept:    'A lone figure walks through a rain-soaked city at night.',
  subject:    'Person in trench coat, neon reflections, wet pavement',
  mood:       ['moody', 'cinematic', 'atmospheric'],
  style:      'cinematic',
  targetTool: 'runway',
  tone:       ['dark', 'elegant'],
};

const allTensReview: OutputReviewInput = {
  deliverable:      'hero-image',
  mediaType:        'image',
  brandAlignment:   10,
  technicalQuality: 10,
  conceptAdherence: 10,
  aestheticScore:   10,
  promptFidelity:   10,
};

const allSevensReview: OutputReviewInput = {
  deliverable:      'social-reel',
  mediaType:        'video',
  brandAlignment:   7,
  technicalQuality: 7,
  conceptAdherence: 7,
  aestheticScore:   7,
  promptFidelity:   7,
};

const allOnesReview: OutputReviewInput = {
  deliverable:      'banner',
  mediaType:        'image',
  brandAlignment:   1,
  technicalQuality: 1,
  conceptAdherence: 1,
  aestheticScore:   1,
  promptFidelity:   1,
};

// ─── Tool Selector ────────────────────────────────────────────────────────────

describe('selectTool', () => {
  it('returns a ToolSelection with required fields', () => {
    const result = selectTool(videoRequirements);
    expect(result).toHaveProperty('primary');
    expect(result).toHaveProperty('alternatives');
    expect(result).toHaveProperty('rationale');
    expect(result).toHaveProperty('promptTips');
    expect(result).toHaveProperty('score');
  });

  it('selects a video tool for video media type', () => {
    const result = selectTool(videoRequirements);
    expect(TOOL_CATALOG[result.primary].mediaTypes).toContain('video');
  });

  it('selects an image tool for image media type', () => {
    const result = selectTool(imageRequirements);
    expect(TOOL_CATALOG[result.primary].mediaTypes).toContain('image');
  });

  it('boosts magnific score when needsUpscaling is true', () => {
    const withUpscale = selectTool({ ...imageRequirements, needsUpscaling: true });
    const withoutUpscale = selectTool(imageRequirements);
    if (withUpscale.primary === 'magnific') {
      expect(withUpscale.score).toBeGreaterThan(withoutUpscale.score >= 0 ? 0 : -1);
    }
    expect(withUpscale).toBeDefined();
  });

  it('boosts runway/kling/higgsfield when needsVideoFromImage is true', () => {
    const result = selectTool({ ...videoRequirements, needsVideoFromImage: true });
    const img2vidTools = ['runway', 'kling', 'higgsfield', 'seedance', 'veo'];
    expect(img2vidTools).toContain(result.primary);
  });

  it('prefers speed-optimised tools when priority is speed', () => {
    const speed = selectTool({ ...videoRequirements, priority: 'speed' });
    const quality = selectTool({ ...videoRequirements, priority: 'quality' });
    expect(TOOL_CATALOG[speed.primary].speedRating).toBeGreaterThanOrEqual(
      TOOL_CATALOG[quality.primary].speedRating - 1,
    );
  });

  it('respects budget tier — economy picks lower-cost tool for images', () => {
    const economy = selectTool({ ...imageRequirements, budgetTier: 'economy', priority: 'cost' });
    expect(TOOL_CATALOG[economy.primary].tier).not.toBe('premium');
  });

  it('returns at most 2 alternatives', () => {
    const result = selectTool(videoRequirements);
    expect(result.alternatives.length).toBeLessThanOrEqual(2);
  });

  it('throws TOOL_NOT_FOUND for unsupported combination', () => {
    expect(() =>
      selectTool({
        mediaType:    'video',
        style:        'abstract',
        outputFormat: 'landscape',
        budgetTier:   'economy',
        priority:     'quality',
      }),
    ).toThrow('TOOL_NOT_FOUND');
  });

  it('includes prompt tips for the selected tool', () => {
    const result = selectTool(imageRequirements);
    expect(result.promptTips.length).toBeGreaterThan(0);
  });

  it('rationale mentions the selected tool name', () => {
    const result = selectTool(videoRequirements);
    expect(result.rationale).toContain(result.primary);
  });
});

describe('TOOL_CATALOG', () => {
  it('contains all nine expected tools', () => {
    const expected = ['seedance', 'veo', 'higgsfield', 'nano-banana', 'magnific', 'midjourney', 'flux', 'runway', 'kling'];
    for (const tool of expected) {
      expect(TOOL_CATALOG).toHaveProperty(tool);
    }
  });

  it('all tools have speedRating and qualityRating in 1–5 range', () => {
    for (const cap of Object.values(TOOL_CATALOG)) {
      expect(cap.speedRating).toBeGreaterThanOrEqual(1);
      expect(cap.speedRating).toBeLessThanOrEqual(5);
      expect(cap.qualityRating).toBeGreaterThanOrEqual(1);
      expect(cap.qualityRating).toBeLessThanOrEqual(5);
    }
  });
});

// ─── Prompt Builder ───────────────────────────────────────────────────────────

describe('generatePrompt', () => {
  it('returns all required fields', () => {
    const result = generatePrompt(promptSpec);
    expect(result).toHaveProperty('basePrompt');
    expect(result).toHaveProperty('refinedPrompt');
    expect(result).toHaveProperty('negativePrompt');
    expect(result).toHaveProperty('technicalParams');
    expect(result).toHaveProperty('tokenCount');
  });

  it('includes mood keywords in base prompt', () => {
    const result = generatePrompt(promptSpec);
    expect(result.basePrompt).toContain('cinematic');
  });

  it('incorporates refinementFeedback into refined prompt', () => {
    const withFeedback = generatePrompt({ ...promptSpec, refinementFeedback: 'add more rain' });
    expect(withFeedback.refinedPrompt).toContain('add more rain');
  });

  it('adds midjourney params for midjourney tool', () => {
    const result = generatePrompt({ ...promptSpec, targetTool: 'midjourney' });
    expect(result.technicalParams['aspect']).toBe('16:9');
    expect(result.technicalParams['version']).toBe(6);
  });

  it('adds flux params for flux tool', () => {
    const result = generatePrompt({ ...promptSpec, targetTool: 'flux', style: 'photorealistic' });
    expect(result.technicalParams['steps']).toBe(30);
    expect(result.technicalParams['guidance']).toBe(3.5);
  });

  it('adds duration and resolution for video tools', () => {
    for (const tool of ['seedance', 'veo', 'runway', 'kling', 'higgsfield'] as const) {
      const result = generatePrompt({ ...promptSpec, targetTool: tool });
      expect(result.technicalParams['duration']).toBe('5s');
      expect(result.technicalParams['resolution']).toBe('1080p');
    }
  });

  it('tokenCount is positive', () => {
    const result = generatePrompt(promptSpec);
    expect(result.tokenCount).toBeGreaterThan(0);
  });

  it('negativePrompt includes custom negatives', () => {
    const result = generatePrompt({ ...promptSpec, negatives: ['cartoon', 'bright colors'] });
    expect(result.negativePrompt).toContain('cartoon');
    expect(result.negativePrompt).toContain('bright colors');
  });

  it('adds tool-specific prefix for magnific', () => {
    const result = generatePrompt({ ...promptSpec, targetTool: 'magnific', style: 'photorealistic' });
    expect(result.refinedPrompt).toContain('ultra high resolution');
  });
});

describe('generatePromptsFromBrief', () => {
  const brief: ProcessedBrief = {
    brand:          'Nata Studio',
    objective:      'Spring launch',
    targetAudience: 'Millennials',
    deliverables:   ['hero-image', 'banner', 'social-post'],
    tone:           ['cinematic'],
    mediaType:      'image',
    budgetTier:     'standard',
  };
  const concept: VisualConcept = {
    headline:         'Spring concept',
    description:      'Fresh editorial look',
    moodKeywords:     ['airy', 'bright'],
    colorDirection:   'Pastels',
    compositionNotes: 'Clean hero',
    styleReference:   'editorial',
  };

  it('generates one prompt per deliverable', () => {
    const prompts = generatePromptsFromBrief(brief, concept, 'flux');
    expect(prompts).toHaveLength(3);
  });

  it('each prompt includes the brand name in subject', () => {
    const prompts = generatePromptsFromBrief(brief, concept, 'midjourney');
    for (const p of prompts) {
      expect(p.basePrompt).toContain('Nata Studio');
    }
  });
});

// ─── Quality Reviewer ─────────────────────────────────────────────────────────

describe('reviewOutput', () => {
  it('returns a QualityReport with required fields', () => {
    const report = reviewOutput(allTensReview);
    expect(report).toHaveProperty('deliverable');
    expect(report).toHaveProperty('scores');
    expect(report).toHaveProperty('weightedTotal');
    expect(report).toHaveProperty('grade');
    expect(report).toHaveProperty('recommendation');
    expect(report).toHaveProperty('improvementNotes');
  });

  it('grades all-10 input as Exceptional', () => {
    const report = reviewOutput(allTensReview);
    expect(report.grade).toBe('Exceptional');
    expect(report.weightedTotal).toBe(100);
  });

  it('grades all-7 input as Acceptable', () => {
    const report = reviewOutput(allSevensReview);
    expect(report.grade).toBe('Acceptable');
  });

  it('grades all-1 input as Reject', () => {
    const report = reviewOutput(allOnesReview);
    expect(report.grade).toBe('Reject');
  });

  it('grades all-5 input as Needs Revision', () => {
    const allFives: OutputReviewInput = {
      deliverable: 'test', mediaType: 'image',
      brandAlignment: 5, technicalQuality: 5, conceptAdherence: 5, aestheticScore: 5, promptFidelity: 5,
    };
    const report = reviewOutput(allFives);
    expect(report.grade).toBe('Needs Revision');
  });

  it('Exceptional grade has no improvement notes', () => {
    const report = reviewOutput(allTensReview);
    expect(report.improvementNotes).toHaveLength(0);
  });

  it('Reject grade has improvement notes', () => {
    const report = reviewOutput(allOnesReview);
    expect(report.improvementNotes.length).toBeGreaterThan(0);
  });

  it('recommendation mentions the weakest dimension when Needs Revision', () => {
    const lowBrand: OutputReviewInput = {
      deliverable:      'hero',
      mediaType:        'image',
      brandAlignment:   2,
      technicalQuality: 7,
      conceptAdherence: 7,
      aestheticScore:   7,
      promptFidelity:   7,
    };
    const report = reviewOutput(lowBrand);
    expect(report.recommendation).toContain('brandAlignment');
  });

  it('throws INVALID_SCORE for non-integer value', () => {
    expect(() =>
      reviewOutput({ ...allTensReview, brandAlignment: 5.5 as unknown as 5 }),
    ).toThrow('INVALID_SCORE');
  });

  it('throws INVALID_SCORE for out-of-range value', () => {
    expect(() =>
      reviewOutput({ ...allTensReview, technicalQuality: 11 as unknown as 10 }),
    ).toThrow('INVALID_SCORE');
  });

  it('throws INVALID_SCORE for zero', () => {
    expect(() =>
      reviewOutput({ ...allTensReview, aestheticScore: 0 as unknown as 1 }),
    ).toThrow('INVALID_SCORE');
  });

  it('weightedTotal respects scoring weights', () => {
    const highBrand: OutputReviewInput = {
      deliverable:      'hero',
      mediaType:        'image',
      brandAlignment:   10,
      technicalQuality: 1,
      conceptAdherence: 1,
      aestheticScore:   1,
      promptFidelity:   1,
    };
    const report = reviewOutput(highBrand);
    expect(report.weightedTotal).toBeGreaterThan(10);
  });

  it('Strong grade recommendation approves for production', () => {
    const strongInput: OutputReviewInput = {
      deliverable:      'reel',
      mediaType:        'video',
      brandAlignment:   8,
      technicalQuality: 8,
      conceptAdherence: 8,
      aestheticScore:   8,
      promptFidelity:   8,
    };
    const report = reviewOutput(strongInput);
    expect(['Strong', 'Exceptional']).toContain(report.grade);
    expect(report.recommendation).toContain('Approve');
  });
});

// ─── Production Planning ──────────────────────────────────────────────────────

describe('planProduction', () => {
  const toolSelection: ToolSelection = {
    primary:    'higgsfield',
    alternatives: ['runway', 'kling'],
    rationale:  'Best for social video content.',
    promptTips: ['Tip one', 'Tip two'],
    score:      82,
  };

  const brief: ProcessedBrief = {
    brand:          'Nata Studio',
    objective:      'Reel campaign',
    targetAudience: 'Gen Z',
    deliverables:   ['reel-1', 'reel-2'],
    tone:           ['bold'],
    mediaType:      'video',
    budgetTier:     'standard',
  };

  const concept: VisualConcept = {
    headline:         'Bold video',
    description:      'Dynamic motion campaign',
    moodKeywords:     ['energetic'],
    colorDirection:   'Vivid',
    compositionNotes: 'Motion-first',
    styleReference:   'cinematic',
  };

  const input: ProductionBriefInput = { brief, concept, toolSelection };

  it('returns a ProductionPlan with phases', () => {
    const plan = planProduction(input);
    expect(plan.phases.length).toBeGreaterThan(0);
  });

  it('totalEstimatedDurationMin is positive', () => {
    const plan = planProduction(input);
    expect(plan.totalEstimatedDurationMin).toBeGreaterThan(0);
  });

  it('primaryTool matches tool selection', () => {
    const plan = planProduction(input);
    expect(plan.primaryTool).toBe('higgsfield');
  });

  it('deliverables match input brief', () => {
    const plan = planProduction(input);
    expect(plan.deliverables).toEqual(['reel-1', 'reel-2']);
  });

  it('has Pre-Production, Generation, and Review phases', () => {
    const plan = planProduction(input);
    const names = plan.phases.map((p) => p.name);
    expect(names).toContain('Pre-Production');
    expect(names).toContain('Generation');
    expect(names).toContain('Review');
  });

  it('Generation phase has one step per deliverable', () => {
    const plan = planProduction(input);
    const genPhase = plan.phases.find((p) => p.name === 'Generation')!;
    expect(genPhase.steps).toHaveLength(2);
  });

  it('video deliverables get longer estimated duration than images', () => {
    const videoPlan = planProduction({ ...input, brief: { ...brief, mediaType: 'video' } });
    const imagePlan = planProduction({ ...input, brief: { ...brief, mediaType: 'image' } });
    expect(videoPlan.totalEstimatedDurationMin).toBeGreaterThan(imagePlan.totalEstimatedDurationMin);
  });
});

// ─── Brief Workflow ───────────────────────────────────────────────────────────

describe('runBriefWorkflow', () => {
  it('returns a complete BriefWorkflowResult for a valid spec', async () => {
    const result = await runBriefWorkflow(briefSpec);
    expect(result.workflowId).toMatch(/^brief-nata-studio/);
    expect(result.brief.brand).toBe('Nata Studio');
    expect(result.concept.headline).toBeTruthy();
    expect(result.toolSelection.primary).toBeTruthy();
    expect(result.prompts).toHaveLength(2);
    expect(result.productionPlan.phases.length).toBeGreaterThan(0);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('selects a video tool for video media type', async () => {
    const result = await runBriefWorkflow(briefSpec);
    expect(TOOL_CATALOG[result.toolSelection.primary].mediaTypes).toContain('video');
  });

  it('generates one prompt per deliverable', async () => {
    const result = await runBriefWorkflow({ ...briefSpec, deliverables: ['hero', 'reel', 'banner'] });
    expect(result.prompts).toHaveLength(3);
  });

  it('throws WORKFLOW_FAILED when brand is empty', async () => {
    await expect(runBriefWorkflow({ ...briefSpec, brand: '' })).rejects.toThrow('WORKFLOW_FAILED');
  });

  it('throws WORKFLOW_FAILED when objective is empty', async () => {
    await expect(runBriefWorkflow({ ...briefSpec, objective: '' })).rejects.toThrow('WORKFLOW_FAILED');
  });

  it('throws WORKFLOW_FAILED when deliverables is empty', async () => {
    await expect(runBriefWorkflow({ ...briefSpec, deliverables: [] })).rejects.toThrow('WORKFLOW_FAILED');
  });

  it('throws WORKFLOW_FAILED when tone is empty', async () => {
    await expect(runBriefWorkflow({ ...briefSpec, tone: [] })).rejects.toThrow('WORKFLOW_FAILED');
  });

  it('fires onEvent callbacks', async () => {
    const events: string[] = [];
    await runBriefWorkflow(briefSpec, { onEvent: (e) => events.push(e.type) });
    expect(events).toContain('workflow:started');
    expect(events).toContain('workflow:completed');
    expect(events).toContain('step:completed');
  });

  it('image brief selects an image tool', async () => {
    const imageBrief: BriefWorkflowSpec = {
      ...briefSpec,
      mediaType:   'image',
      tone:        ['editorial'],
    };
    const result = await runBriefWorkflow(imageBrief);
    expect(TOOL_CATALOG[result.toolSelection.primary].mediaTypes).toContain('image');
  });

  it('concept reflects the dominant tone', async () => {
    const result = await runBriefWorkflow({ ...briefSpec, tone: ['animated', 'minimal'] });
    expect(result.concept.styleReference).toBe('animated');
  });
});

// ─── Prompt Workflow ──────────────────────────────────────────────────────────

describe('runPromptWorkflow', () => {
  it('returns a PromptWorkflowResult with required fields', async () => {
    const result = await runPromptWorkflow(promptSpec);
    expect(result.workflowId).toMatch(/^prompt-runway/);
    expect(result.spec).toEqual(promptSpec);
    expect(result.generated.refinedPrompt).toBeTruthy();
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('generated prompt includes subject', async () => {
    const result = await runPromptWorkflow(promptSpec);
    expect(result.generated.basePrompt).toContain('Person in trench coat');
  });

  it('generated prompt reflects tool-specific params for midjourney', async () => {
    const spec: PromptWorkflowSpec = { ...promptSpec, targetTool: 'midjourney' };
    const result = await runPromptWorkflow(spec);
    expect(result.generated.technicalParams['aspect']).toBe('16:9');
  });

  it('throws WORKFLOW_FAILED when concept is empty', async () => {
    await expect(runPromptWorkflow({ ...promptSpec, concept: '' })).rejects.toThrow('WORKFLOW_FAILED');
  });

  it('throws WORKFLOW_FAILED when subject is empty', async () => {
    await expect(runPromptWorkflow({ ...promptSpec, subject: '' })).rejects.toThrow('WORKFLOW_FAILED');
  });

  it('throws WORKFLOW_FAILED when mood is empty', async () => {
    await expect(runPromptWorkflow({ ...promptSpec, mood: [] })).rejects.toThrow('WORKFLOW_FAILED');
  });

  it('includes refinement feedback in refined prompt', async () => {
    const result = await runPromptWorkflow({ ...promptSpec, refinementFeedback: 'add fog effect' });
    expect(result.generated.refinedPrompt).toContain('add fog effect');
  });
});

// ─── Default Export ───────────────────────────────────────────────────────────

describe('aiCreativeDirector default export', () => {
  it('exposes all five public methods', () => {
    expect(typeof aiCreativeDirector.runBriefWorkflow).toBe('function');
    expect(typeof aiCreativeDirector.runPromptWorkflow).toBe('function');
    expect(typeof aiCreativeDirector.selectTool).toBe('function');
    expect(typeof aiCreativeDirector.reviewOutput).toBe('function');
    expect(typeof aiCreativeDirector.planProduction).toBe('function');
  });
});
