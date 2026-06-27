export type AITool =
  | 'seedance'
  | 'veo'
  | 'higgsfield'
  | 'nano-banana'
  | 'magnific'
  | 'midjourney'
  | 'flux'
  | 'runway'
  | 'kling';

export type MediaType = 'image' | 'video';
export type OutputFormat = 'square' | 'portrait' | 'landscape' | 'vertical';
export type StyleCategory =
  | 'photorealistic'
  | 'cinematic'
  | 'editorial'
  | 'abstract'
  | 'animated'
  | 'illustration';
export type BudgetTier = 'economy' | 'standard' | 'premium';
export type PriorityMode = 'quality' | 'speed' | 'cost';
export type QualityGrade = 'Exceptional' | 'Strong' | 'Acceptable' | 'Needs Revision' | 'Reject';
export type ReviewScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ToolCapability {
  tool: AITool;
  mediaTypes: MediaType[];
  styles: StyleCategory[];
  formats: OutputFormat[];
  strengths: string[];
  weaknesses: string[];
  tier: BudgetTier;
  speedRating: 1 | 2 | 3 | 4 | 5;
  qualityRating: 1 | 2 | 3 | 4 | 5;
}

export interface ToolRequirements {
  mediaType: MediaType;
  style: StyleCategory;
  outputFormat: OutputFormat;
  budgetTier: BudgetTier;
  priority: PriorityMode;
  needsUpscaling?: boolean;
  needsVideoFromImage?: boolean;
}

export interface ToolSelection {
  primary: AITool;
  alternatives: AITool[];
  rationale: string;
  promptTips: string[];
  score: number;
}

export interface VisualConcept {
  headline: string;
  description: string;
  moodKeywords: string[];
  colorDirection: string;
  compositionNotes: string;
  styleReference: StyleCategory;
}

export interface ProcessedBrief {
  brand: string;
  objective: string;
  targetAudience: string;
  deliverables: string[];
  tone: string[];
  mediaType: MediaType;
  budgetTier: BudgetTier;
}

export interface BriefWorkflowSpec {
  brand: string;
  objective: string;
  targetAudience: string;
  deliverables: string[];
  tone: string[];
  mediaType: MediaType;
  budgetTier: BudgetTier;
  references?: string[];
}

export interface GeneratedPrompt {
  basePrompt: string;
  refinedPrompt: string;
  negativePrompt: string;
  technicalParams: Record<string, string | number>;
  tokenCount: number;
}

export interface PromptWorkflowSpec {
  concept: string;
  subject: string;
  mood: string[];
  style: StyleCategory;
  targetTool: AITool;
  tone: string[];
  negatives?: string[];
  refinementFeedback?: string;
}

export interface ProductionStep {
  id: string;
  name: string;
  tool: AITool;
  description: string;
  estimatedDurationMin: number;
  dependsOn: string[];
}

export interface ProductionPhase {
  name: string;
  steps: ProductionStep[];
}

export interface ProductionPlan {
  phases: ProductionPhase[];
  totalEstimatedDurationMin: number;
  primaryTool: AITool;
  deliverables: string[];
}

export interface ProductionBriefInput {
  brief: ProcessedBrief;
  concept: VisualConcept;
  toolSelection: ToolSelection;
}

export interface OutputReviewInput {
  deliverable: string;
  mediaType: MediaType;
  brandAlignment: ReviewScore;
  technicalQuality: ReviewScore;
  conceptAdherence: ReviewScore;
  aestheticScore: ReviewScore;
  promptFidelity: ReviewScore;
}

export interface QualityReport {
  deliverable: string;
  scores: Record<string, number>;
  weightedTotal: number;
  grade: QualityGrade;
  recommendation: string;
  improvementNotes: string[];
}

export interface BriefWorkflowResult {
  workflowId: string;
  brief: ProcessedBrief;
  concept: VisualConcept;
  toolSelection: ToolSelection;
  prompts: GeneratedPrompt[];
  productionPlan: ProductionPlan;
  durationMs: number;
}

export interface PromptWorkflowResult {
  workflowId: string;
  spec: PromptWorkflowSpec;
  generated: GeneratedPrompt;
  durationMs: number;
}
