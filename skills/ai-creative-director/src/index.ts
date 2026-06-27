import workflowEngine from '../../workflow-engine/src/index';
import type { StepInput, WorkflowRunOptions } from '../../workflow-engine/src/index';
import { selectTool } from './tool-selector';
import { generatePrompt, generatePromptsFromBrief } from './prompt-builder';
import { reviewOutput } from './quality-reviewer';
import type {
  BriefWorkflowResult,
  BriefWorkflowSpec,
  GeneratedPrompt,
  OutputReviewInput,
  ProcessedBrief,
  ProductionBriefInput,
  ProductionPhase,
  ProductionPlan,
  ProductionStep,
  PromptWorkflowResult,
  PromptWorkflowSpec,
  QualityReport,
  StyleCategory,
  ToolRequirements,
  ToolSelection,
  VisualConcept,
} from './types';

export { selectTool } from './tool-selector';
export { reviewOutput } from './quality-reviewer';
export { generatePrompt } from './prompt-builder';
export type * from './types';

// ─── Domain Logic ─────────────────────────────────────────────────────────────

const TONE_TO_STYLE: Record<string, StyleCategory> = {
  cinematic:   'cinematic',
  editorial:   'editorial',
  minimal:     'photorealistic',
  bold:        'cinematic',
  animated:    'animated',
  illustrated: 'illustration',
  abstract:    'abstract',
};

function validateBrief(spec: BriefWorkflowSpec): ProcessedBrief {
  if (!spec.brand.trim())      throw new Error('INVALID_BRIEF: brand is required.');
  if (!spec.objective.trim())  throw new Error('INVALID_BRIEF: objective is required.');
  if (spec.deliverables.length === 0) throw new Error('INVALID_BRIEF: at least one deliverable is required.');
  if (spec.tone.length === 0)  throw new Error('INVALID_BRIEF: at least one tone word is required.');
  return {
    brand:          spec.brand.trim(),
    objective:      spec.objective.trim(),
    targetAudience: spec.targetAudience.trim(),
    deliverables:   spec.deliverables,
    tone:           spec.tone,
    mediaType:      spec.mediaType,
    budgetTier:     spec.budgetTier,
  };
}

function deriveConcept(brief: ProcessedBrief): VisualConcept {
  const dominantTone = brief.tone[0] ?? 'cinematic';
  const style: StyleCategory =
    TONE_TO_STYLE[dominantTone] ?? (brief.mediaType === 'video' ? 'cinematic' : 'photorealistic');
  const motionNote =
    brief.mediaType === 'video'
      ? 'Dynamic framing, motion-forward composition.'
      : 'Static hero composition, rule of thirds.';

  return {
    headline:         `${brief.brand}: ${dominantTone} ${brief.mediaType} campaign`,
    description:      `${brief.objective} — targeting ${brief.targetAudience}. ${brief.tone.join(', ')} aesthetic.`,
    moodKeywords:     [...brief.tone, `${brief.mediaType}-native`],
    colorDirection:   'To be determined by brand color system.',
    compositionNotes: motionNote,
    styleReference:   style,
  };
}

function buildRequirements(brief: ProcessedBrief, concept: VisualConcept): ToolRequirements {
  return {
    mediaType:    brief.mediaType,
    style:        concept.styleReference,
    outputFormat: 'landscape',
    budgetTier:   brief.budgetTier,
    priority:     'quality',
  };
}

function buildPrepPhase(toolSelection: ToolSelection): ProductionPhase {
  const prep: ProductionStep = {
    id:                   'brief-review',
    name:                 'Brief Review',
    tool:                 toolSelection.primary,
    description:          'Review and approve creative brief, concept, and tool selection.',
    estimatedDurationMin: 30,
    dependsOn:            [],
  };
  return { name: 'Pre-Production', steps: [prep] };
}

function buildGenerationPhase(
  brief: ProcessedBrief,
  toolSelection: ToolSelection,
  prompts: GeneratedPrompt[],
): ProductionPhase {
  const perUnit = brief.mediaType === 'video' ? 45 : 20;
  const steps: ProductionStep[] = brief.deliverables.map((del, i) => ({
    id:                   `generate-${i}`,
    name:                 `Generate: ${del}`,
    tool:                 toolSelection.primary,
    description:          `Generate ${del} using ${toolSelection.primary}. Prompt: ${(prompts[i]?.refinedPrompt ?? '').slice(0, 60)}…`,
    estimatedDurationMin: perUnit,
    dependsOn:            ['brief-review'],
  }));
  return { name: 'Generation', steps };
}

function buildReviewPhase(
  toolSelection: ToolSelection,
  generationStepIds: string[],
): ProductionPhase {
  const step: ProductionStep = {
    id:                   'quality-review',
    name:                 'Quality Review',
    tool:                 toolSelection.primary,
    description:          'Score all outputs against brief criteria and approve or flag for revision.',
    estimatedDurationMin: 30,
    dependsOn:            generationStepIds,
  };
  return { name: 'Review', steps: [step] };
}

function buildProductionPlan(
  brief: ProcessedBrief,
  concept: VisualConcept,
  toolSelection: ToolSelection,
  prompts: GeneratedPrompt[],
): ProductionPlan {
  void concept;
  const prep       = buildPrepPhase(toolSelection);
  const generation = buildGenerationPhase(brief, toolSelection, prompts);
  const review     = buildReviewPhase(toolSelection, generation.steps.map((s) => s.id));

  const phases   = [prep, generation, review];
  const totalMin = phases.flatMap((p) => p.steps).reduce((s, st) => s + st.estimatedDurationMin, 0);

  return {
    phases,
    totalEstimatedDurationMin: totalMin,
    primaryTool:               toolSelection.primary,
    deliverables:              brief.deliverables,
  };
}

// ─── Brief Workflow Step Handlers ─────────────────────────────────────────────

function handleValidateBrief(input: StepInput): { brief: ProcessedBrief } {
  const spec = input.context['spec'] as BriefWorkflowSpec;
  return { brief: validateBrief(spec) };
}

function handleDevelopConcept(input: StepInput): { concept: VisualConcept } {
  const brief = input.data['brief'] as ProcessedBrief;
  return { concept: deriveConcept(brief) };
}

function handleSelectTool(input: StepInput): { toolSelection: ToolSelection } {
  const brief   = input.data['brief'] as ProcessedBrief;
  const concept = input.data['concept'] as VisualConcept;
  return { toolSelection: selectTool(buildRequirements(brief, concept)) };
}

function handleGeneratePrompts(input: StepInput): { prompts: GeneratedPrompt[] } {
  const brief         = input.data['brief'] as ProcessedBrief;
  const concept       = input.data['concept'] as VisualConcept;
  const toolSelection = input.data['toolSelection'] as ToolSelection;
  return { prompts: generatePromptsFromBrief(brief, concept, toolSelection.primary) };
}

function handlePlanProduction(input: StepInput): { productionPlan: ProductionPlan } {
  const brief         = input.data['brief'] as ProcessedBrief;
  const concept       = input.data['concept'] as VisualConcept;
  const toolSelection = input.data['toolSelection'] as ToolSelection;
  const prompts       = input.data['prompts'] as GeneratedPrompt[];
  return { productionPlan: buildProductionPlan(brief, concept, toolSelection, prompts) };
}

// ─── Prompt Workflow Step Handlers ────────────────────────────────────────────

function handleAnalyzeConcept(input: StepInput): { spec: PromptWorkflowSpec } {
  const spec = input.context['spec'] as PromptWorkflowSpec;
  if (!spec.concept.trim()) throw new Error('INVALID_SPEC: concept is required.');
  if (!spec.subject.trim()) throw new Error('INVALID_SPEC: subject is required.');
  if (spec.mood.length === 0) throw new Error('INVALID_SPEC: mood array must not be empty.');
  return { spec };
}

function handleGeneratePrompt(input: StepInput): { generated: GeneratedPrompt } {
  const spec = input.data['spec'] as PromptWorkflowSpec;
  return { generated: generatePrompt(spec) };
}

// ─── Workflow Route Tables ─────────────────────────────────────────────────────

function briefRoutes() {
  return [
    { fromStep: 'validate-brief',  toStep: 'develop-concept',  outputKey: 'brief',         inputKey: 'brief' },
    { fromStep: 'validate-brief',  toStep: 'select-tool',      outputKey: 'brief',         inputKey: 'brief' },
    { fromStep: 'develop-concept', toStep: 'select-tool',      outputKey: 'concept',       inputKey: 'concept' },
    { fromStep: 'validate-brief',  toStep: 'generate-prompts', outputKey: 'brief',         inputKey: 'brief' },
    { fromStep: 'develop-concept', toStep: 'generate-prompts', outputKey: 'concept',       inputKey: 'concept' },
    { fromStep: 'select-tool',     toStep: 'generate-prompts', outputKey: 'toolSelection', inputKey: 'toolSelection' },
    { fromStep: 'validate-brief',  toStep: 'plan-production',  outputKey: 'brief',         inputKey: 'brief' },
    { fromStep: 'develop-concept', toStep: 'plan-production',  outputKey: 'concept',       inputKey: 'concept' },
    { fromStep: 'select-tool',     toStep: 'plan-production',  outputKey: 'toolSelection', inputKey: 'toolSelection' },
    { fromStep: 'generate-prompts', toStep: 'plan-production', outputKey: 'prompts',       inputKey: 'prompts' },
  ];
}

// ─── Public API ───────────────────────────────────────────────────────────────

function extractStepOutput<T>(
  stepResults: Array<{ stepId: string; output: unknown }>,
  stepId: string,
  key: string,
): T {
  const step = stepResults.find((s) => s.stepId === stepId);
  return (step?.output as Record<string, unknown>)[key] as T;
}

export async function runBriefWorkflow(
  spec: BriefWorkflowSpec,
  options?: WorkflowRunOptions,
): Promise<BriefWorkflowResult> {
  const slug      = spec.brand.toLowerCase().replace(/\s+/g, '-');
  const workflowId = `brief-${slug}-${Date.now()}`;
  const startedAt  = Date.now();

  const result = await workflowEngine.run(
    {
      id:     workflowId,
      steps: [
        { id: 'validate-brief',  dependsOn: [],                 handler: handleValidateBrief  },
        { id: 'develop-concept', dependsOn: ['validate-brief'], handler: handleDevelopConcept },
        { id: 'select-tool',     dependsOn: ['develop-concept'], handler: handleSelectTool    },
        { id: 'generate-prompts', dependsOn: ['select-tool'],   handler: handleGeneratePrompts },
        { id: 'plan-production', dependsOn: ['generate-prompts'], handler: handlePlanProduction },
      ],
      routes: briefRoutes(),
    },
    { context: { spec, ...(options?.context ?? {}) }, onEvent: options?.onEvent },
  );

  if (result.status !== 'completed') {
    throw new Error(`WORKFLOW_FAILED: ${result.error ?? 'Unknown error'}`);
  }

  const get = <T>(stepId: string, key: string) =>
    extractStepOutput<T>(result.stepResults, stepId, key);

  return {
    workflowId,
    brief:          get<ProcessedBrief>('validate-brief',   'brief'),
    concept:        get<VisualConcept>('develop-concept',   'concept'),
    toolSelection:  get<ToolSelection>('select-tool',       'toolSelection'),
    prompts:        get<GeneratedPrompt[]>('generate-prompts', 'prompts'),
    productionPlan: get<ProductionPlan>('plan-production',  'productionPlan'),
    durationMs:     Date.now() - startedAt,
  };
}

export async function runPromptWorkflow(
  spec: PromptWorkflowSpec,
  options?: WorkflowRunOptions,
): Promise<PromptWorkflowResult> {
  const workflowId = `prompt-${spec.targetTool}-${Date.now()}`;
  const startedAt  = Date.now();

  const result = await workflowEngine.run(
    {
      id:    workflowId,
      steps: [
        { id: 'analyze-concept', dependsOn: [],                  handler: handleAnalyzeConcept },
        { id: 'generate-prompt', dependsOn: ['analyze-concept'], handler: handleGeneratePrompt },
      ],
      routes: [
        { fromStep: 'analyze-concept', toStep: 'generate-prompt', outputKey: 'spec', inputKey: 'spec' },
      ],
    },
    { context: { spec, ...(options?.context ?? {}) }, onEvent: options?.onEvent },
  );

  if (result.status !== 'completed') {
    throw new Error(`WORKFLOW_FAILED: ${result.error ?? 'Unknown error'}`);
  }

  const genStep  = result.stepResults.find((s) => s.stepId === 'generate-prompt');
  const generated = (genStep?.output as Record<string, unknown>)['generated'] as GeneratedPrompt;

  return { workflowId, spec, generated, durationMs: Date.now() - startedAt };
}

export function planProduction(input: ProductionBriefInput): ProductionPlan {
  const emptyPrompts: GeneratedPrompt[] = input.brief.deliverables.map(() => ({
    basePrompt:      '',
    refinedPrompt:   '',
    negativePrompt:  '',
    technicalParams: {},
    tokenCount:      0,
  }));
  return buildProductionPlan(input.brief, input.concept, input.toolSelection, emptyPrompts);
}

// ─── Default Export ───────────────────────────────────────────────────────────

const aiCreativeDirector = {
  runBriefWorkflow,
  runPromptWorkflow,
  selectTool,
  reviewOutput,
  planProduction,
};

export default aiCreativeDirector;
