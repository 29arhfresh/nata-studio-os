import type { OutputReviewInput, QualityGrade, QualityReport, ReviewScore } from './types';

const SCORE_WEIGHTS: Record<string, number> = {
  brandAlignment:   0.30,
  technicalQuality: 0.25,
  conceptAdherence: 0.20,
  aestheticScore:   0.15,
  promptFidelity:   0.10,
};

function computeWeightedTotal(scores: Record<string, ReviewScore>): number {
  return Math.round(
    Object.entries(scores).reduce(
      (sum, [key, val]) => sum + val * (SCORE_WEIGHTS[key] ?? 0) * 10,
      0,
    ),
  );
}

function assignGrade(total: number): QualityGrade {
  if (total >= 90) return 'Exceptional';
  if (total >= 75) return 'Strong';
  if (total >= 60) return 'Acceptable';
  if (total >= 45) return 'Needs Revision';
  return 'Reject';
}

function buildRecommendation(grade: QualityGrade, weakest: [string, ReviewScore]): string {
  if (grade === 'Exceptional') return 'Approve for final delivery. No revisions required.';
  if (grade === 'Strong') return 'Approve for production use. Minor polish optional.';
  if (grade === 'Acceptable') {
    return `Conditionally approved. Improve ${weakest[0]} before key placements.`;
  }
  return `Reject for revision. Priority fix: ${weakest[0]} (score: ${weakest[1]}/10).`;
}

function buildImprovementNotes(scores: Record<string, ReviewScore>, grade: QualityGrade): string[] {
  if (grade === 'Exceptional') return [];
  return Object.entries(scores)
    .filter(([, val]) => val <= 6)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([key, val]) => `${key}: ${val}/10 — below threshold, requires attention.`);
}

function assertReviewScore(value: number, field: string): asserts value is ReviewScore {
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new Error(`INVALID_SCORE: "${field}" must be an integer 1–10; got ${value}.`);
  }
}

export function reviewOutput(input: OutputReviewInput): QualityReport {
  assertReviewScore(input.brandAlignment,   'brandAlignment');
  assertReviewScore(input.technicalQuality, 'technicalQuality');
  assertReviewScore(input.conceptAdherence, 'conceptAdherence');
  assertReviewScore(input.aestheticScore,   'aestheticScore');
  assertReviewScore(input.promptFidelity,   'promptFidelity');

  const scores: Record<string, ReviewScore> = {
    brandAlignment:   input.brandAlignment,
    technicalQuality: input.technicalQuality,
    conceptAdherence: input.conceptAdherence,
    aestheticScore:   input.aestheticScore,
    promptFidelity:   input.promptFidelity,
  };

  const weightedTotal = computeWeightedTotal(scores);
  const grade = assignGrade(weightedTotal);
  const sorted = Object.entries(scores).sort(([, a], [, b]) => a - b);
  const weakest = sorted[0] as [string, ReviewScore];

  return {
    deliverable:      input.deliverable,
    scores,
    weightedTotal,
    grade,
    recommendation:   buildRecommendation(grade, weakest),
    improvementNotes: buildImprovementNotes(scores, grade),
  };
}
