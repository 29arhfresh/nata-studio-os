/**
 * Prompt Architect — production-quality prompt engineering engine.
 * Converts task requirements into version-controlled, evaluated prompts
 * with measurable quality criteria and known failure modes.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_MAX_TOKENS = 4_096;
const QUALITY_PASS_THRESHOLD = 0.75;
const QUALITY_WARN_THRESHOLD = 0.55;
const WORDS_PER_TOKEN = 0.75;
const TOKENS_PER_EXAMPLE = 120;
const BASE_PROMPT_VERSION = '1.0.0';

// ─── Core Types ───────────────────────────────────────────────────────────────

export type TaskType =
  | 'chain-of-thought'
  | 'code-generation'
  | 'document-analysis'
  | 'evaluation-judge'
  | 'few-shot-classifier'
  | 'multi-agent-orchestrator'
  | 'role-persona'
  | 'structured-output';

export type OutputFormat = 'json' | 'xml' | 'markdown' | 'prose' | 'code';

export type EvaluationVerdict = 'pass' | 'warn' | 'fail';

export type ChangeType = 'major' | 'minor' | 'patch';

export interface TemplateDescriptor {
  taskType: TaskType;
  templatePath: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  structureRules: string[];
  outputFormats: OutputFormat[];
}

export interface PromptExample {
  input: string;
  output: string;
  label?: string;
}

export interface PromptBrief {
  taskObjective: string;
  taskType: TaskType;
  persona?: string;
  context?: string;
  constraints?: string[];
  outputFormat: OutputFormat;
  outputSchema?: string;
  examples?: PromptExample[];
  evaluationCriteria?: string[];
  targetModel?: string;
  maxTokens?: number;
}

export interface BuiltPrompt {
  id: string;
  version: string;
  systemPrompt: string;
  userTemplate: string;
  outputSchema?: string;
  estimatedTokens: number;
  qualityScore: number;
  qualityVerdict: EvaluationVerdict;
  metadata: {
    taskType: TaskType;
    outputFormat: OutputFormat;
    hasPersona: boolean;
    hasExamples: boolean;
    hasConstraints: boolean;
    targetModel?: string;
  };
  createdAt: string;
}

export interface TestCase {
  id: string;
  description: string;
  expectedOutputPattern?: string;
  expectedOutputContains?: string[];
  mustNotContain?: string[];
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  verdict: EvaluationVerdict;
  findings: string[];
}

export interface EvaluationReport {
  promptId: string;
  promptVersion: string;
  verdict: EvaluationVerdict;
  score: number;
  testCaseResults: TestCaseResult[];
  recommendations: string[];
  evaluatedAt: string;
}

export interface CompressionResult {
  original: string;
  compressed: string;
  originalTokens: number;
  compressedTokens: number;
  reductionPercent: number;
  sectionsRemoved: string[];
}

export interface VersionedPrompt extends BuiltPrompt {
  previousVersion?: string;
  changeType: ChangeType;
  changeSummary: string;
  changelog: ChangelogEntry[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changeType: ChangeType;
  summary: string;
}

// ─── Template Registry ────────────────────────────────────────────────────────

const TEMPLATE_REGISTRY: Record<TaskType, TemplateDescriptor> = {
  'chain-of-thought': {
    taskType: 'chain-of-thought',
    templatePath: 'templates/chain-of-thought.md',
    description: 'Multi-step reasoning tasks requiring explicit intermediate steps',
    requiredFields: ['taskObjective', 'outputFormat'],
    optionalFields: ['persona', 'context', 'constraints', 'examples', 'evaluationCriteria'],
    structureRules: [
      'Instruct the model to reason before producing the final answer',
      'Separate reasoning steps from the final output with a clear delimiter',
      'Specify the number of reasoning steps if the task has a known complexity',
      'Include at least one worked example when the chain has more than three steps',
    ],
    outputFormats: ['prose', 'markdown', 'json'],
  },
  'code-generation': {
    taskType: 'code-generation',
    templatePath: 'templates/code-generation.md',
    description: 'Structured code output with language and style constraints',
    requiredFields: ['taskObjective', 'outputFormat', 'outputSchema'],
    optionalFields: ['persona', 'context', 'constraints', 'examples'],
    structureRules: [
      'Specify the target language, version, and style guide',
      'Define the exact function signature or class interface expected',
      'State whether tests, comments, or type annotations are required',
      'Include error handling requirements explicitly',
    ],
    outputFormats: ['code'],
  },
  'document-analysis': {
    taskType: 'document-analysis',
    templatePath: 'templates/document-analysis.md',
    description: 'Extraction, classification, or summarization from long documents',
    requiredFields: ['taskObjective', 'outputFormat'],
    optionalFields: ['persona', 'context', 'constraints', 'outputSchema', 'evaluationCriteria'],
    structureRules: [
      'Define the document input format and expected length range',
      'Specify whether the task is extraction, classification, or summarization',
      'Add token-budget guidance when documents may exceed context limits',
      'State citation or source-reference requirements',
    ],
    outputFormats: ['json', 'markdown', 'prose'],
  },
  'evaluation-judge': {
    taskType: 'evaluation-judge',
    templatePath: 'templates/evaluation-judge.md',
    description: 'LLM-as-judge evaluation harnesses for automated quality scoring',
    requiredFields: ['taskObjective', 'outputFormat', 'outputSchema', 'evaluationCriteria'],
    optionalFields: ['persona', 'context', 'constraints', 'examples'],
    structureRules: [
      'Define scoring dimensions with explicit numeric ranges',
      'Provide rubric anchors for high, medium, and low scores on each dimension',
      'Require the judge to reason before assigning any score',
      'Specify tie-breaking rules and how to handle partial compliance',
    ],
    outputFormats: ['json'],
  },
  'few-shot-classifier': {
    taskType: 'few-shot-classifier',
    templatePath: 'templates/few-shot-classifier.md',
    description: 'Category classification with in-context examples',
    requiredFields: ['taskObjective', 'outputFormat', 'examples'],
    optionalFields: ['persona', 'context', 'constraints', 'outputSchema', 'evaluationCriteria'],
    structureRules: [
      'List all valid categories explicitly with brief definitions',
      'Provide at least two examples per category, ordered simple to complex',
      'Specify the exact output format for the classification label',
      'Add a fallback category for ambiguous inputs',
    ],
    outputFormats: ['json', 'prose'],
  },
  'multi-agent-orchestrator': {
    taskType: 'multi-agent-orchestrator',
    templatePath: 'templates/multi-agent-orchestrator.md',
    description: 'System prompts for AI agents coordinating sub-tasks',
    requiredFields: ['taskObjective', 'outputFormat', 'constraints'],
    optionalFields: ['persona', 'context', 'outputSchema', 'examples', 'evaluationCriteria'],
    structureRules: [
      'Define the agent role, scope, and hard capability boundaries',
      'List available tools with input/output contracts for each',
      'Specify handoff format when delegating to sub-agents',
      'State termination conditions and iteration limits explicitly',
    ],
    outputFormats: ['json', 'markdown'],
  },
  'role-persona': {
    taskType: 'role-persona',
    templatePath: 'templates/role-persona.md',
    description: 'Persona-constrained AI behavior with tone and capability boundaries',
    requiredFields: ['taskObjective', 'persona', 'outputFormat'],
    optionalFields: ['context', 'constraints', 'examples', 'evaluationCriteria'],
    structureRules: [
      'Define the persona with role, expertise level, and communication style',
      'State explicit capability and topic boundaries for the persona',
      'Specify how the persona should handle out-of-scope requests',
      'Include tone anchors with concrete examples of in-persona phrasing',
    ],
    outputFormats: ['prose', 'markdown'],
  },
  'structured-output': {
    taskType: 'structured-output',
    templatePath: 'templates/structured-output.md',
    description: 'JSON or XML output with schema enforcement',
    requiredFields: ['taskObjective', 'outputFormat', 'outputSchema'],
    optionalFields: ['persona', 'context', 'constraints', 'examples', 'evaluationCriteria'],
    structureRules: [
      'Provide the complete output schema with field names, types, and allowed values',
      'Instruct the model to output only valid structured data with no surrounding text',
      'Add field-level constraints for every nullable or enum field',
      'Specify validation behavior: reject vs. best-effort on schema violations',
    ],
    outputFormats: ['json', 'xml'],
  },
};

// ─── ID Generation ────────────────────────────────────────────────────────────

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `pa_${timestamp}_${random}`;
}

// ─── Token Estimation ─────────────────────────────────────────────────────────

function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / WORDS_PER_TOKEN);
}

// ─── System Prompt Assembly ───────────────────────────────────────────────────

function assembleSystemPrompt(brief: PromptBrief): string {
  const sections: string[] = [];

  if (brief.persona) {
    sections.push(`## Role\n${brief.persona}`);
  }

  sections.push(`## Objective\n${brief.taskObjective}`);

  if (brief.context) {
    sections.push(`## Context\n${brief.context}`);
  }

  sections.push(
    `## Output Format\nFormat: ${brief.outputFormat.toUpperCase()}` +
      (brief.outputSchema ? `\n\nSchema:\n${brief.outputSchema}` : '')
  );

  const userConstraints = brief.constraints ?? [];
  if (userConstraints.length > 0) {
    const constraintText = userConstraints.map((c) => `- ${c}`).join('\n');
    sections.push(`## Constraints\n${constraintText}`);
  }

  if (brief.evaluationCriteria && brief.evaluationCriteria.length > 0) {
    const criteriaText = brief.evaluationCriteria.map((c) => `- ${c}`).join('\n');
    sections.push(`## Quality Criteria\n${criteriaText}`);
  }

  return sections.join('\n\n');
}

// ─── User Template Assembly ───────────────────────────────────────────────────

function assembleUserTemplate(brief: PromptBrief): string {
  const parts: string[] = [];

  if (brief.examples && brief.examples.length > 0) {
    const exampleBlock = brief.examples
      .map((ex, i) => {
        const label = ex.label ?? `Example ${i + 1}`;
        return `### ${label}\nInput: ${ex.input}\nOutput: ${ex.output}`;
      })
      .join('\n\n');
    parts.push(`## Examples\n${exampleBlock}`);
  }

  parts.push('## Input\n{{INPUT}}');

  return parts.join('\n\n');
}

// ─── Quality Scoring ──────────────────────────────────────────────────────────

interface QualityDimension {
  score: number;
  weight: number;
}

function scorePromptQuality(brief: PromptBrief, systemPrompt: string, template: TemplateDescriptor): number {
  const dimensions: QualityDimension[] = [
    { score: scoreTaskClarity(brief), weight: 0.30 },
    { score: scoreOutputSpecification(brief), weight: 0.25 },
    { score: scoreConstraintCompleteness(brief, template), weight: 0.20 },
    { score: scoreExampleCoverage(brief), weight: 0.15 },
    { score: scoreTokenEfficiency(systemPrompt, brief.maxTokens ?? DEFAULT_MAX_TOKENS), weight: 0.10 },
  ];

  return dimensions.reduce((total, d) => total + d.score * d.weight, 0);
}

function scoreTaskClarity(brief: PromptBrief): number {
  const objective = brief.taskObjective.trim().toLowerCase();
  let score = 0.4;

  if (objective.length >= 20) score += 0.2;
  if (objective.includes('given') || objective.includes('produce') || objective.includes('return')) score += 0.2;
  if (brief.context) score += 0.1;
  if (brief.persona) score += 0.1;

  return Math.min(score, 1.0);
}

function scoreOutputSpecification(brief: PromptBrief): number {
  // outputFormat is always present (required field), so base score reflects that
  let score = 0.5;

  if (brief.outputSchema) score += 0.3;
  if (brief.evaluationCriteria && brief.evaluationCriteria.length > 0) score += 0.2;

  return Math.min(score, 1.0);
}

function scoreConstraintCompleteness(brief: PromptBrief, template: TemplateDescriptor): number {
  const requiredCovered = template.requiredFields.filter((f) => {
    const key = f as keyof PromptBrief;
    const value = brief[key];
    return (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    );
  });

  const coverage = requiredCovered.length / Math.max(template.requiredFields.length, 1);
  const hasExplicitConstraints = brief.constraints && brief.constraints.length > 0 ? 0.2 : 0;

  return Math.min(coverage * 0.8 + hasExplicitConstraints, 1.0);
}

function scoreExampleCoverage(brief: PromptBrief): number {
  if (!brief.examples || brief.examples.length === 0) return 0.3;
  if (brief.examples.length === 1) return 0.6;
  if (brief.examples.length === 2) return 0.8;
  return 1.0;
}

function scoreTokenEfficiency(systemPrompt: string, maxTokens: number): number {
  const estimated = estimateTokens(systemPrompt);
  const ratio = estimated / maxTokens;

  if (ratio > 1.0) return 0.1;
  if (ratio > 0.8) return 0.5;
  if (ratio > 0.5) return 0.8;
  return 1.0;
}

function verdictFromScore(score: number): EvaluationVerdict {
  if (score >= QUALITY_PASS_THRESHOLD) return 'pass';
  if (score >= QUALITY_WARN_THRESHOLD) return 'warn';
  return 'fail';
}

// ─── selectTemplate ───────────────────────────────────────────────────────────

export function selectTemplate(taskType: TaskType): TemplateDescriptor {
  const descriptor = TEMPLATE_REGISTRY[taskType];
  if (!descriptor) {
    throw new Error(`Unknown task type: ${taskType}`);
  }
  return { ...descriptor };
}

// ─── buildPrompt ──────────────────────────────────────────────────────────────

export function buildPrompt(brief: PromptBrief): BuiltPrompt {
  const template = selectTemplate(brief.taskType);
  const maxTokens = brief.maxTokens ?? DEFAULT_MAX_TOKENS;

  let systemPrompt = assembleSystemPrompt(brief);
  const userTemplate = assembleUserTemplate(brief);

  const exampleTokens = (brief.examples?.length ?? 0) * TOKENS_PER_EXAMPLE;
  const totalEstimate = estimateTokens(systemPrompt) + estimateTokens(userTemplate) + exampleTokens;

  if (totalEstimate > maxTokens) {
    const result = compressPrompt(systemPrompt, maxTokens - estimateTokens(userTemplate) - exampleTokens);
    systemPrompt = result.compressed;
  }

  const qualityScore = scorePromptQuality(brief, systemPrompt, template);
  const estimatedTokens = estimateTokens(systemPrompt) + estimateTokens(userTemplate) + exampleTokens;

  return {
    id: generateId(),
    version: BASE_PROMPT_VERSION,
    systemPrompt,
    userTemplate,
    outputSchema: brief.outputSchema,
    estimatedTokens,
    qualityScore: Math.round(qualityScore * 100) / 100,
    qualityVerdict: verdictFromScore(qualityScore),
    metadata: {
      taskType: brief.taskType,
      outputFormat: brief.outputFormat,
      hasPersona: !!brief.persona,
      hasExamples: !!(brief.examples && brief.examples.length > 0),
      hasConstraints: !!(brief.constraints && brief.constraints.length > 0),
      targetModel: brief.targetModel,
    },
    createdAt: new Date().toISOString(),
  };
}

// ─── evaluatePrompt ───────────────────────────────────────────────────────────

export function evaluatePrompt(prompt: BuiltPrompt, testCases: TestCase[]): EvaluationReport {
  const testCaseResults: TestCaseResult[] = testCases.map((tc) => evaluateTestCase(prompt, tc));
  const recommendations = buildRecommendations(prompt, testCaseResults);

  const passCount = testCaseResults.filter((r) => r.passed).length;
  const score =
    testCases.length > 0
      ? Math.round((passCount / testCases.length) * 100) / 100
      : prompt.qualityScore;

  const verdict: EvaluationVerdict =
    testCases.length === 0
      ? verdictFromScore(prompt.qualityScore)
      : passCount === testCases.length
      ? 'pass'
      : passCount > 0
      ? 'warn'
      : 'fail';

  return {
    promptId: prompt.id,
    promptVersion: prompt.version,
    verdict,
    score,
    testCaseResults,
    recommendations,
    evaluatedAt: new Date().toISOString(),
  };
}

function evaluateTestCase(prompt: BuiltPrompt, tc: TestCase): TestCaseResult {
  const findings: string[] = [];
  let passed = true;

  const combinedText = `${prompt.systemPrompt}\n${prompt.userTemplate}`;

  if (tc.expectedOutputContains) {
    for (const term of tc.expectedOutputContains) {
      const termLower = term.toLowerCase();
      const promptLower = combinedText.toLowerCase();
      if (!promptLower.includes(termLower)) {
        findings.push(`Missing expected term in prompt: "${term}"`);
        passed = false;
      }
    }
  }

  if (tc.mustNotContain) {
    for (const term of tc.mustNotContain) {
      const termLower = term.toLowerCase();
      const promptLower = combinedText.toLowerCase();
      if (promptLower.includes(termLower)) {
        findings.push(`Forbidden term found in prompt: "${term}"`);
        passed = false;
      }
    }
  }

  if (tc.expectedOutputPattern) {
    try {
      const pattern = new RegExp(tc.expectedOutputPattern, 'i');
      if (!pattern.test(combinedText)) {
        findings.push(`Pattern not matched: ${tc.expectedOutputPattern}`);
        passed = false;
      }
    } catch {
      findings.push(`Invalid regex pattern: ${tc.expectedOutputPattern}`);
      passed = false;
    }
  }

  if (passed && findings.length === 0) {
    findings.push('All checks passed');
  }

  return {
    testCaseId: tc.id,
    passed,
    verdict: passed ? 'pass' : 'fail',
    findings,
  };
}

function buildRecommendations(prompt: BuiltPrompt, results: TestCaseResult[]): string[] {
  const recommendations: string[] = [];

  if (!prompt.metadata.hasExamples) {
    recommendations.push('Add at least one input/output example to improve model alignment');
  }

  if (!prompt.metadata.hasConstraints) {
    recommendations.push('Add explicit constraints to prevent schema hallucination and out-of-scope outputs');
  }

  if (!prompt.metadata.hasPersona && prompt.metadata.taskType === 'role-persona') {
    recommendations.push('role-persona task type requires a persona field');
  }

  if (prompt.qualityScore < QUALITY_WARN_THRESHOLD) {
    recommendations.push('Quality score is below warning threshold — review required fields for this template');
  }

  const failedCases = results.filter((r) => !r.passed);
  if (failedCases.length > 0) {
    recommendations.push(
      `${failedCases.length} test case(s) failed — review prompt for missing terms or forbidden content`
    );
  }

  if (prompt.estimatedTokens > DEFAULT_MAX_TOKENS * 0.9) {
    recommendations.push('Prompt approaches token limit — consider compressPrompt() to reduce size');
  }

  return recommendations;
}

// ─── compressPrompt ───────────────────────────────────────────────────────────

// Matches only ## level headers used in assembled system prompts.
// Using ## (not ###) prevents subsections from being split into orphaned entries.
const SECTION_HEADER_PATTERN = /^##\s+.+$/;

const REMOVABLE_SECTIONS = ['Quality Criteria', 'Examples'];

export function compressPrompt(text: string, maxTokens: number): CompressionResult {
  const originalTokens = estimateTokens(text);
  const sectionsRemoved: string[] = [];

  if (originalTokens <= maxTokens) {
    return {
      original: text,
      compressed: text,
      originalTokens,
      compressedTokens: originalTokens,
      reductionPercent: 0,
      sectionsRemoved: [],
    };
  }

  let compressed = text;
  for (const sectionName of REMOVABLE_SECTIONS) {
    if (estimateTokens(compressed) <= maxTokens) break;
    const currentSections = splitIntoSections(compressed);
    const withoutSection = removeSectionByName(currentSections, sectionName);
    if (withoutSection !== compressed) {
      compressed = withoutSection;
      sectionsRemoved.push(sectionName);
    }
  }

  if (estimateTokens(compressed) > maxTokens) {
    compressed = truncateToTokenBudget(compressed, maxTokens);
  }

  const compressedTokens = estimateTokens(compressed);
  const reductionPercent = Math.round(((originalTokens - compressedTokens) / originalTokens) * 100);

  return {
    original: text,
    compressed,
    originalTokens,
    compressedTokens,
    reductionPercent,
    sectionsRemoved,
  };
}

function splitIntoSections(text: string): Array<{ header: string; body: string }> {
  const lines = text.split('\n');
  const sections: Array<{ header: string; body: string }> = [];
  let currentHeader = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    if (SECTION_HEADER_PATTERN.test(line)) {
      if (currentHeader || currentBody.length > 0) {
        sections.push({ header: currentHeader, body: currentBody.join('\n') });
      }
      currentHeader = line;
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentHeader || currentBody.length > 0) {
    sections.push({ header: currentHeader, body: currentBody.join('\n') });
  }

  return sections;
}

function removeSectionByName(
  sections: Array<{ header: string; body: string }>,
  sectionName: string
): string {
  const filtered = sections.filter(
    (s) => !s.header.toLowerCase().includes(sectionName.toLowerCase())
  );
  return filtered.map((s) => (s.header ? `${s.header}\n${s.body}` : s.body)).join('\n\n');
}

function truncateToTokenBudget(text: string, maxTokens: number): string {
  const words = text.split(/\s+/);
  const maxWords = Math.floor(maxTokens * WORDS_PER_TOKEN);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + ' [truncated]';
}

// ─── versionPrompt ────────────────────────────────────────────────────────────

export function versionPrompt(
  current: BuiltPrompt,
  previous?: BuiltPrompt,
  changeSummary?: string
): VersionedPrompt {
  const changeType = deriveChangeType(current, previous);
  const newVersion = bumpVersion(current.version, changeType);
  const summary = changeSummary ?? deriveChangeSummary(current, previous);

  const newEntry: ChangelogEntry = {
    version: newVersion,
    date: new Date().toISOString().slice(0, 10),
    changeType,
    summary,
  };

  const previousChangelog = (previous as VersionedPrompt | undefined)?.changelog ?? [];

  return {
    ...current,
    id: generateId(),
    version: newVersion,
    previousVersion: previous?.version,
    changeType,
    changeSummary: summary,
    changelog: [newEntry, ...previousChangelog],
    createdAt: new Date().toISOString(),
  };
}

function deriveChangeType(current: BuiltPrompt, previous?: BuiltPrompt): ChangeType {
  if (!previous) return 'major';

  const structuralChange =
    current.metadata.taskType !== previous.metadata.taskType ||
    current.metadata.outputFormat !== previous.metadata.outputFormat;

  if (structuralChange) return 'major';

  const contentChange =
    current.systemPrompt !== previous.systemPrompt ||
    current.userTemplate !== previous.userTemplate;

  if (contentChange) return 'minor';

  return 'patch';
}

function deriveChangeSummary(current: BuiltPrompt, previous?: BuiltPrompt): string {
  if (!previous) return 'Initial version';

  if (current.metadata.taskType !== previous.metadata.taskType) {
    return `Changed task type from ${previous.metadata.taskType} to ${current.metadata.taskType}`;
  }

  if (current.metadata.outputFormat !== previous.metadata.outputFormat) {
    return `Changed output format from ${previous.metadata.outputFormat} to ${current.metadata.outputFormat}`;
  }

  if (current.systemPrompt !== previous.systemPrompt) {
    return 'Updated system prompt content';
  }

  if (current.userTemplate !== previous.userTemplate) {
    return 'Updated user template';
  }

  return 'Minor refinements';
}

function bumpVersion(version: string, changeType: ChangeType): string {
  const parts = version.split('.').map(Number);
  const [major, minor, patch] = parts.length === 3 ? parts : [1, 0, 0];

  switch (changeType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

// ─── Default Export ───────────────────────────────────────────────────────────

const promptArchitect = {
  selectTemplate,
  buildPrompt,
  evaluatePrompt,
  compressPrompt,
  versionPrompt,
};

export default promptArchitect;
