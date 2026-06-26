import promptArchitect, {
  selectTemplate,
  buildPrompt,
  evaluatePrompt,
  compressPrompt,
  versionPrompt,
  type TaskType,
  type PromptBrief,
  type BuiltPrompt,
  type TestCase,
} from '../src/index';

// ─── selectTemplate ───────────────────────────────────────────────────────────

describe('selectTemplate()', () => {
  const ALL_TASK_TYPES: TaskType[] = [
    'chain-of-thought',
    'code-generation',
    'document-analysis',
    'evaluation-judge',
    'few-shot-classifier',
    'multi-agent-orchestrator',
    'role-persona',
    'structured-output',
  ];

  it('returns a descriptor for every registered task type', () => {
    for (const taskType of ALL_TASK_TYPES) {
      const descriptor = selectTemplate(taskType);
      expect(descriptor.taskType).toBe(taskType);
    }
  });

  it('returns templatePath pointing to the correct template file', () => {
    const descriptor = selectTemplate('chain-of-thought');
    expect(descriptor.templatePath).toBe('templates/chain-of-thought.md');
  });

  it('returns requiredFields array with at least one entry', () => {
    const descriptor = selectTemplate('structured-output');
    expect(descriptor.requiredFields.length).toBeGreaterThan(0);
    expect(descriptor.requiredFields).toContain('outputSchema');
  });

  it('returns structureRules with at least four entries', () => {
    const descriptor = selectTemplate('evaluation-judge');
    expect(descriptor.structureRules.length).toBeGreaterThanOrEqual(4);
  });

  it('returns a copy — mutations do not affect the registry', () => {
    const d1 = selectTemplate('role-persona');
    d1.description = 'mutated';
    const d2 = selectTemplate('role-persona');
    expect(d2.description).not.toBe('mutated');
  });

  it('throws for an unknown task type', () => {
    expect(() => selectTemplate('unknown-type' as TaskType)).toThrow();
  });

  it('evaluation-judge requires evaluationCriteria', () => {
    const descriptor = selectTemplate('evaluation-judge');
    expect(descriptor.requiredFields).toContain('evaluationCriteria');
  });

  it('few-shot-classifier requires examples', () => {
    const descriptor = selectTemplate('few-shot-classifier');
    expect(descriptor.requiredFields).toContain('examples');
  });

  it('code-generation output formats include code', () => {
    const descriptor = selectTemplate('code-generation');
    expect(descriptor.outputFormats).toContain('code');
  });
});

// ─── buildPrompt ──────────────────────────────────────────────────────────────

describe('buildPrompt()', () => {
  const MINIMAL_BRIEF: PromptBrief = {
    taskObjective: 'Given a product review, produce a sentiment classification as positive, negative, or neutral.',
    taskType: 'structured-output',
    outputFormat: 'json',
    outputSchema: '{ "sentiment": "positive" | "negative" | "neutral", "confidence": number }',
  };

  it('returns a BuiltPrompt with a unique id', () => {
    const p1 = buildPrompt(MINIMAL_BRIEF);
    const p2 = buildPrompt(MINIMAL_BRIEF);
    expect(p1.id).toBeDefined();
    expect(p1.id).not.toBe(p2.id);
  });

  it('starts at version 1.0.0', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(prompt.version).toBe('1.0.0');
  });

  it('systemPrompt contains the task objective', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(prompt.systemPrompt).toContain(MINIMAL_BRIEF.taskObjective);
  });

  it('systemPrompt contains the output format', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(prompt.systemPrompt.toLowerCase()).toContain('json');
  });

  it('systemPrompt contains the output schema when provided', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(prompt.systemPrompt).toContain('sentiment');
  });

  it('userTemplate contains the {{INPUT}} placeholder', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(prompt.userTemplate).toContain('{{INPUT}}');
  });

  it('metadata reflects the brief fields', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(prompt.metadata.taskType).toBe('structured-output');
    expect(prompt.metadata.outputFormat).toBe('json');
    expect(prompt.metadata.hasPersona).toBe(false);
    expect(prompt.metadata.hasExamples).toBe(false);
    expect(prompt.metadata.hasConstraints).toBe(false);
  });

  it('includes persona in systemPrompt when provided', () => {
    const brief: PromptBrief = {
      ...MINIMAL_BRIEF,
      persona: 'Senior data analyst with expertise in NLP',
    };
    const prompt = buildPrompt(brief);
    expect(prompt.systemPrompt).toContain('Senior data analyst');
    expect(prompt.metadata.hasPersona).toBe(true);
  });

  it('includes context in systemPrompt when provided', () => {
    const brief: PromptBrief = { ...MINIMAL_BRIEF, context: 'Reviews are from an e-commerce platform.' };
    const prompt = buildPrompt(brief);
    expect(prompt.systemPrompt).toContain('e-commerce platform');
  });

  it('includes constraints in systemPrompt when provided', () => {
    const brief: PromptBrief = {
      ...MINIMAL_BRIEF,
      constraints: ['Output only valid JSON', 'Do not include markdown fences'],
    };
    const prompt = buildPrompt(brief);
    expect(prompt.systemPrompt).toContain('Output only valid JSON');
    expect(prompt.metadata.hasConstraints).toBe(true);
  });

  it('includes examples in userTemplate when provided', () => {
    const brief: PromptBrief = {
      ...MINIMAL_BRIEF,
      examples: [
        { input: 'Great product!', output: '{"sentiment":"positive","confidence":0.95}' },
        { input: 'Terrible quality.', output: '{"sentiment":"negative","confidence":0.9}' },
      ],
    };
    const prompt = buildPrompt(brief);
    expect(prompt.userTemplate).toContain('Great product!');
    expect(prompt.metadata.hasExamples).toBe(true);
  });

  it('estimatedTokens is a positive integer', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(prompt.estimatedTokens).toBeGreaterThan(0);
    expect(Number.isInteger(prompt.estimatedTokens)).toBe(true);
  });

  it('qualityScore is between 0 and 1', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(prompt.qualityScore).toBeGreaterThanOrEqual(0);
    expect(prompt.qualityScore).toBeLessThanOrEqual(1);
  });

  it('qualityVerdict is pass, warn, or fail', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(['pass', 'warn', 'fail']).toContain(prompt.qualityVerdict);
  });

  it('createdAt is a valid ISO date string', () => {
    const prompt = buildPrompt(MINIMAL_BRIEF);
    expect(() => new Date(prompt.createdAt)).not.toThrow();
    expect(new Date(prompt.createdAt).toISOString()).toBe(prompt.createdAt);
  });

  it('a fully specified brief produces a higher quality score than a minimal brief', () => {
    const rich: PromptBrief = {
      ...MINIMAL_BRIEF,
      persona: 'NLP expert',
      context: 'E-commerce reviews from verified buyers.',
      constraints: ['Return only JSON', 'Confidence must be 0.0–1.0'],
      examples: [
        { input: 'Amazing!', output: '{"sentiment":"positive","confidence":0.98}' },
        { input: 'Broken on arrival.', output: '{"sentiment":"negative","confidence":0.95}' },
      ],
      evaluationCriteria: ['Sentiment must be one of three values', 'Confidence must be numeric'],
    };
    const minimal = buildPrompt(MINIMAL_BRIEF);
    const full = buildPrompt(rich);
    expect(full.qualityScore).toBeGreaterThan(minimal.qualityScore);
  });

  it('compresses systemPrompt when estimated tokens exceed maxTokens', () => {
    const brief: PromptBrief = {
      ...MINIMAL_BRIEF,
      maxTokens: 10,
      context: 'A'.repeat(500),
    };
    const prompt = buildPrompt(brief);
    expect(prompt.estimatedTokens).toBeLessThanOrEqual(50);
  });

  it('stores targetModel in metadata when provided', () => {
    const brief: PromptBrief = { ...MINIMAL_BRIEF, targetModel: 'claude-opus-4-8' };
    const prompt = buildPrompt(brief);
    expect(prompt.metadata.targetModel).toBe('claude-opus-4-8');
  });

  it('chain-of-thought systemPrompt includes reasoning structure rules', () => {
    const brief: PromptBrief = {
      taskObjective: 'Given a dataset, produce the three key statistical insights.',
      taskType: 'chain-of-thought',
      outputFormat: 'prose',
    };
    const prompt = buildPrompt(brief);
    expect(prompt.systemPrompt.toLowerCase()).toContain('reason');
  });

  it('role-persona systemPrompt includes persona content', () => {
    const brief: PromptBrief = {
      taskObjective: 'Answer customer questions in a friendly tone.',
      taskType: 'role-persona',
      persona: 'Helpful customer support agent with 5 years of experience',
      outputFormat: 'prose',
    };
    const prompt = buildPrompt(brief);
    expect(prompt.systemPrompt).toContain('Helpful customer support agent');
  });
});

// ─── evaluatePrompt ───────────────────────────────────────────────────────────

describe('evaluatePrompt()', () => {
  const BASE_BRIEF: PromptBrief = {
    taskObjective: 'Given a code snippet, produce a brief explanation of what it does.',
    taskType: 'document-analysis',
    outputFormat: 'prose',
    constraints: ['Explain in plain English', 'Avoid jargon'],
  };

  function makePrompt(overrides?: Partial<PromptBrief>): BuiltPrompt {
    return buildPrompt({ ...BASE_BRIEF, ...overrides });
  }

  it('returns pass verdict when all test cases pass', () => {
    const prompt = makePrompt();
    const testCases: TestCase[] = [
      {
        id: 'tc1',
        input: '',
        description: 'Checks that objective is present in prompt',
        expectedOutputContains: ['code snippet'],
      },
      {
        id: 'tc2',
        input: '',
        description: 'Checks plain English constraint is present',
        expectedOutputContains: ['plain english'],
      },
    ];
    const report = evaluatePrompt(prompt, testCases);
    expect(report.verdict).toBe('pass');
    expect(report.score).toBe(1);
  });

  it('returns fail verdict when a test case fails', () => {
    const prompt = makePrompt();
    const testCases: TestCase[] = [
      {
        id: 'tc1',
        input: '',
        description: 'Checks for a term that is not in the prompt',
        expectedOutputContains: ['TERM_THAT_DOES_NOT_EXIST_IN_ANY_PROMPT_XYZQQ'],
      },
    ];
    const report = evaluatePrompt(prompt, testCases);
    expect(report.verdict).toBe('fail');
    expect(report.score).toBe(0);
  });

  it('fails when mustNotContain term is found in prompt', () => {
    const prompt = makePrompt();
    const systemPromptContent = prompt.systemPrompt.split(' ')[0];
    const testCases: TestCase[] = [
      {
        id: 'tc1',
        input: '',
        description: 'Forbidden term present',
        mustNotContain: [systemPromptContent],
      },
    ];
    const report = evaluatePrompt(prompt, testCases);
    expect(report.verdict).toBe('fail');
  });

  it('passes when mustNotContain term is absent', () => {
    const prompt = makePrompt();
    const testCases: TestCase[] = [
      {
        id: 'tc1',
        input: '',
        description: 'Absent forbidden term',
        mustNotContain: ['FORBIDDEN_TERM_NEVER_IN_ANY_PROMPT_12345'],
      },
    ];
    const report = evaluatePrompt(prompt, testCases);
    expect(report.verdict).toBe('pass');
  });

  it('validates expectedOutputPattern with regex', () => {
    const prompt = makePrompt();
    const testCases: TestCase[] = [
      {
        id: 'tc1',
        input: '',
        description: 'Objective section present',
        expectedOutputPattern: 'objective',
      },
    ];
    const report = evaluatePrompt(prompt, testCases);
    expect(report.verdict).toBe('pass');
  });

  it('fails on invalid regex pattern gracefully', () => {
    const prompt = makePrompt();
    const testCases: TestCase[] = [
      {
        id: 'tc1',
        input: '',
        description: 'Invalid regex',
        expectedOutputPattern: '[invalid(regex',
      },
    ];
    const report = evaluatePrompt(prompt, testCases);
    expect(report.verdict).toBe('fail');
    expect(report.testCaseResults[0].findings[0]).toContain('Invalid regex');
  });

  it('returns an EvaluationReport with all required fields', () => {
    const prompt = makePrompt();
    const report = evaluatePrompt(prompt, []);
    expect(report.promptId).toBe(prompt.id);
    expect(report.promptVersion).toBe(prompt.version);
    expect(report.evaluatedAt).toBeDefined();
    expect(Array.isArray(report.testCaseResults)).toBe(true);
    expect(Array.isArray(report.recommendations)).toBe(true);
  });

  it('score equals passing cases over total cases', () => {
    const prompt = makePrompt();
    const testCases: TestCase[] = [
      { id: 'tc1', input: '', description: 'pass', expectedOutputContains: ['objective'] },
      { id: 'tc2', input: '', description: 'fail', expectedOutputContains: ['NONEXISTENT_TERM_99'] },
    ];
    const report = evaluatePrompt(prompt, testCases);
    expect(report.score).toBe(0.5);
  });

  it('includes recommendations for missing examples', () => {
    const prompt = makePrompt();
    const report = evaluatePrompt(prompt, []);
    expect(report.recommendations.some((r) => r.toLowerCase().includes('example'))).toBe(true);
  });

  it('includes recommendations for missing constraints', () => {
    const promptNoConstraints = buildPrompt({
      taskObjective: 'Summarize a document.',
      taskType: 'document-analysis',
      outputFormat: 'prose',
    });
    const report = evaluatePrompt(promptNoConstraints, []);
    expect(report.recommendations.some((r) => r.toLowerCase().includes('constraint'))).toBe(true);
  });
});

// ─── compressPrompt ───────────────────────────────────────────────────────────

describe('compressPrompt()', () => {
  const LONG_TEXT = `## Objective
Given a document, produce a concise summary.

## Context
This is additional context about the task that provides background information for the model to use when processing inputs.

## Output Format
Format: PROSE

## Constraints
- Be concise
- Use plain English
- Avoid technical jargon
- Do not exceed three sentences

## Quality Criteria
- Summary must capture the main point
- Summary must not introduce new facts

## Examples
### Example 1
Input: Long document here.
Output: Short summary here.`;

  it('returns unchanged text when already within token budget', () => {
    const result = compressPrompt(LONG_TEXT, 10_000);
    expect(result.compressed).toBe(LONG_TEXT);
    expect(result.reductionPercent).toBe(0);
    expect(result.sectionsRemoved).toHaveLength(0);
  });

  it('reduces token count when budget is tight', () => {
    const result = compressPrompt(LONG_TEXT, 20);
    expect(result.compressedTokens).toBeLessThanOrEqual(result.originalTokens);
  });

  it('originalTokens is greater than zero', () => {
    const result = compressPrompt(LONG_TEXT, 1_000);
    expect(result.originalTokens).toBeGreaterThan(0);
  });

  it('reductionPercent is between 0 and 100', () => {
    const result = compressPrompt(LONG_TEXT, 20);
    expect(result.reductionPercent).toBeGreaterThanOrEqual(0);
    expect(result.reductionPercent).toBeLessThanOrEqual(100);
  });

  it('preserves Objective section during compression', () => {
    const result = compressPrompt(LONG_TEXT, 30);
    expect(result.compressed).toContain('Objective');
  });

  it('removes Examples section when needed', () => {
    const result = compressPrompt(LONG_TEXT, 30);
    if (result.sectionsRemoved.length > 0) {
      expect(result.sectionsRemoved).toContain('Examples');
    }
  });

  it('returns original in result.original unchanged', () => {
    const result = compressPrompt(LONG_TEXT, 20);
    expect(result.original).toBe(LONG_TEXT);
  });

  it('handles empty string input', () => {
    const result = compressPrompt('', 100);
    expect(result.compressed).toBe('');
    expect(result.originalTokens).toBe(0);
    expect(result.reductionPercent).toBe(0);
  });
});

// ─── versionPrompt ────────────────────────────────────────────────────────────

describe('versionPrompt()', () => {
  const BRIEF: PromptBrief = {
    taskObjective: 'Given a support ticket, produce a category label.',
    taskType: 'few-shot-classifier',
    outputFormat: 'json',
    outputSchema: '{ "category": string }',
    examples: [{ input: 'My order is late', output: '{"category":"shipping"}' }],
  };

  it('returns a VersionedPrompt with a bumped version', () => {
    const v1 = buildPrompt(BRIEF);
    const v2 = versionPrompt(v1);
    expect(v2.version).not.toBe(v1.version);
  });

  it('sets changeType to major when no previous version', () => {
    const v1 = buildPrompt(BRIEF);
    const versioned = versionPrompt(v1);
    expect(versioned.changeType).toBe('major');
  });

  it('bumps major version correctly', () => {
    const v1 = buildPrompt(BRIEF);
    const versioned = versionPrompt(v1);
    expect(versioned.version).toBe('2.0.0');
  });

  it('sets changeType to minor when systemPrompt differs', () => {
    const v1 = buildPrompt(BRIEF);
    const v2 = buildPrompt({ ...BRIEF, context: 'Additional context here' });
    const versioned = versionPrompt(v2, v1);
    expect(['major', 'minor']).toContain(versioned.changeType);
  });

  it('preserves previousVersion reference', () => {
    const v1 = buildPrompt(BRIEF);
    const versioned = versionPrompt(v1);
    const v3 = versionPrompt(versioned, v1);
    expect(v3.previousVersion).toBe(v1.version);
  });

  it('changelog contains at least one entry', () => {
    const v1 = buildPrompt(BRIEF);
    const versioned = versionPrompt(v1);
    expect(versioned.changelog.length).toBeGreaterThan(0);
  });

  it('changelog entry has version, date, changeType, and summary', () => {
    const v1 = buildPrompt(BRIEF);
    const versioned = versionPrompt(v1, undefined, 'Initial production deployment');
    const entry = versioned.changelog[0];
    expect(entry.version).toBeDefined();
    expect(entry.date).toBeDefined();
    expect(entry.changeType).toBeDefined();
    expect(entry.summary).toBe('Initial production deployment');
  });

  it('uses provided changeSummary in changelog', () => {
    const v1 = buildPrompt(BRIEF);
    const versioned = versionPrompt(v1, undefined, 'Added few-shot examples for edge cases');
    expect(versioned.changeSummary).toBe('Added few-shot examples for edge cases');
  });

  it('generates a changeSummary automatically when not provided', () => {
    const v1 = buildPrompt(BRIEF);
    const versioned = versionPrompt(v1);
    expect(versioned.changeSummary).toBeTruthy();
    expect(versioned.changeSummary.length).toBeGreaterThan(0);
  });

  it('accumulates changelog across multiple versions', () => {
    const v1 = buildPrompt(BRIEF);
    const v2 = versionPrompt(v1, undefined, 'v2 change');
    const v3 = versionPrompt(v2, v1, 'v3 change');
    expect(v3.changelog.length).toBeGreaterThanOrEqual(2);
  });

  it('version is a valid semver string', () => {
    const v1 = buildPrompt(BRIEF);
    const versioned = versionPrompt(v1);
    expect(versioned.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('returns a new unique id on each versioning', () => {
    const v1 = buildPrompt(BRIEF);
    const versioned = versionPrompt(v1);
    expect(versioned.id).not.toBe(v1.id);
  });
});

// ─── Default export ───────────────────────────────────────────────────────────

describe('default export', () => {
  it('exposes selectTemplate', () => {
    expect(typeof promptArchitect.selectTemplate).toBe('function');
  });

  it('exposes buildPrompt', () => {
    expect(typeof promptArchitect.buildPrompt).toBe('function');
  });

  it('exposes evaluatePrompt', () => {
    expect(typeof promptArchitect.evaluatePrompt).toBe('function');
  });

  it('exposes compressPrompt', () => {
    expect(typeof promptArchitect.compressPrompt).toBe('function');
  });

  it('exposes versionPrompt', () => {
    expect(typeof promptArchitect.versionPrompt).toBe('function');
  });

  it('default export functions match named exports', () => {
    expect(promptArchitect.selectTemplate).toBe(selectTemplate);
    expect(promptArchitect.buildPrompt).toBe(buildPrompt);
    expect(promptArchitect.evaluatePrompt).toBe(evaluatePrompt);
    expect(promptArchitect.compressPrompt).toBe(compressPrompt);
    expect(promptArchitect.versionPrompt).toBe(versionPrompt);
  });
});
