/**
 * Project Manager — full project lifecycle engine for Nata Studio OS.
 * Manages projects, tasks, milestones, roadmaps, risks, resource allocation,
 * health scoring, progress reporting, and project archiving.
 */

// ─── Core Types ───────────────────────────────────────────────────────────────

export type ProjectId = string;
export type TaskId = string;
export type MilestoneId = string;
export type RiskId = string;
export type ResourceId = string;

export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'archived';

export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'blocked'
  | 'in-review'
  | 'done'
  | 'cancelled';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type RiskStatus = 'open' | 'mitigated' | 'accepted' | 'closed';

export type MilestoneStatus = 'upcoming' | 'in-progress' | 'achieved' | 'missed' | 'deferred';

export type ResourceType = 'human' | 'tool' | 'budget' | 'time';

export type HealthScore = 'green' | 'yellow' | 'red';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Project {
  id: ProjectId;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  owner: string;
  tags: string[];
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  milestones: MilestoneId[];
  tasks: TaskId[];
  risks: RiskId[];
  resources: ResourceId[];
  healthScore: HealthScore;
  healthNotes: string;
  completionPercent: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface Task {
  id: TaskId;
  projectId: ProjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  estimatedHours: number;
  loggedHours: number;
  dueDate?: string;
  completedAt?: string;
  dependencies: TaskId[];
  blockerReason?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: MilestoneId;
  projectId: ProjectId;
  name: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  achievedDate?: string;
  linkedTasks: TaskId[];
  successCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: RiskId;
  projectId: ProjectId;
  title: string;
  description: string;
  level: RiskLevel;
  status: RiskStatus;
  probability: number;
  impact: number;
  mitigationPlan: string;
  owner: string;
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: ResourceId;
  projectId: ProjectId;
  name: string;
  type: ResourceType;
  allocated: number;
  unit: string;
  consumed: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatusReport {
  projectId: ProjectId;
  generatedAt: string;
  period: string;
  health: HealthScore;
  summary: string;
  completionPercent: number;
  milestonesAchieved: number;
  milestonesTotal: number;
  tasksCompleted: number;
  tasksTotal: number;
  openRisks: number;
  criticalRisks: number;
  blockedTasks: number;
  resourceUtilization: ResourceUtilization[];
  recentAccomplishments: string[];
  nextSteps: string[];
  issues: string[];
}

export interface ResourceUtilization {
  resourceId: ResourceId;
  name: string;
  type: ResourceType;
  utilizationPercent: number;
  unit: string;
}

export interface Roadmap {
  projectId: ProjectId;
  generatedAt: string;
  milestones: RoadmapMilestone[];
}

export interface RoadmapMilestone {
  milestone: Milestone;
  tasks: Task[];
  riskCount: number;
  isOnTrack: boolean;
}

export interface ProjectHealthResult {
  projectId: ProjectId;
  score: HealthScore;
  notes: string;
  factors: HealthFactor[];
}

export interface HealthFactor {
  name: string;
  status: HealthScore;
  detail: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  priority: Priority;
  owner: string;
  tags?: string[];
  startDate: string;
  targetEndDate: string;
  metadata?: Record<string, unknown>;
}

export interface CreateTaskInput {
  projectId: ProjectId;
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  estimatedHours: number;
  dueDate?: string;
  dependencies?: TaskId[];
  tags?: string[];
}

export interface CreateMilestoneInput {
  projectId: ProjectId;
  name: string;
  description: string;
  dueDate: string;
  linkedTasks?: TaskId[];
  successCriteria?: string[];
}

export interface CreateRiskInput {
  projectId: ProjectId;
  title: string;
  description: string;
  level: RiskLevel;
  probability: number;
  impact: number;
  mitigationPlan: string;
  owner: string;
  reviewDate: string;
}

export interface CreateResourceInput {
  projectId: ProjectId;
  name: string;
  type: ResourceType;
  allocated: number;
  unit: string;
}

export interface LogHoursInput {
  taskId: TaskId;
  hours: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OVERDUE_YELLOW_DAYS = 3;
const OVERDUE_RED_DAYS = 7;
const RISK_SCORE_HIGH_THRESHOLD = 0.6;
const RISK_SCORE_CRITICAL_THRESHOLD = 0.8;
const BLOCKED_RATIO_YELLOW = 0.1;
const BLOCKED_RATIO_RED = 0.25;
const COMPLETION_BEHIND_YELLOW_DAYS = 7;
const COMPLETION_BEHIND_RED_DAYS = 14;

// ─── In-Memory Stores ─────────────────────────────────────────────────────────

const _projects = new Map<ProjectId, Project>();
const _tasks = new Map<TaskId, Task>();
const _milestones = new Map<MilestoneId, Milestone>();
const _risks = new Map<RiskId, Risk>();
const _resources = new Map<ResourceId, Resource>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function _nowIso(): string {
  return new Date().toISOString();
}

function _daysBetween(isoA: string, isoB: string): number {
  const msPerDay = 86_400_000;
  return Math.floor((new Date(isoB).getTime() - new Date(isoA).getTime()) / msPerDay);
}

/** Returns project tasks sorted by priority then due date. */
function _projectTasks(projectId: ProjectId): Task[] {
  const order: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [..._tasks.values()]
    .filter((t) => t.projectId === projectId)
    .sort((a, b) => order[a.priority] - order[b.priority]);
}

/** Returns project milestones ordered by due date. */
function _projectMilestones(projectId: ProjectId): Milestone[] {
  return [..._milestones.values()]
    .filter((m) => m.projectId === projectId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/** Returns project risks ordered by combined risk score (probability × impact). */
function _projectRisks(projectId: ProjectId): Risk[] {
  return [..._risks.values()]
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => b.probability * b.impact - a.probability * a.impact);
}

/** Returns project resources. */
function _projectResources(projectId: ProjectId): Resource[] {
  return [..._resources.values()].filter((r) => r.projectId === projectId);
}

/** Computes overall task completion percentage for a project. */
function _completionPercent(projectId: ProjectId): number {
  const tasks = _projectTasks(projectId).filter((t) => t.status !== 'cancelled');
  if (tasks.length === 0) {
    return 0;
  }
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

/** Evaluates project health based on schedule, task blockers, and open risks. */
function _computeHealth(project: Project): ProjectHealthResult {
  const factors: HealthFactor[] = [];
  const today = _nowIso();
  const daysUntilEnd = _daysBetween(today, project.targetEndDate);
  const tasks = _projectTasks(project.id).filter((t) => t.status !== 'cancelled');
  const blockedCount = tasks.filter((t) => t.status === 'blocked').length;
  const blockedRatio = tasks.length > 0 ? blockedCount / tasks.length : 0;
  const openRisks = _projectRisks(project.id).filter((r) => r.status === 'open');
  const criticalRisk = openRisks.find(
    (r) => r.probability * r.impact >= RISK_SCORE_CRITICAL_THRESHOLD,
  );
  const highRisk = openRisks.find(
    (r) => r.probability * r.impact >= RISK_SCORE_HIGH_THRESHOLD,
  );

  // Schedule factor
  let scheduleStatus: HealthScore = 'green';
  if (daysUntilEnd < -OVERDUE_RED_DAYS) {
    scheduleStatus = 'red';
  } else if (daysUntilEnd < -OVERDUE_YELLOW_DAYS || daysUntilEnd < COMPLETION_BEHIND_YELLOW_DAYS) {
    scheduleStatus = 'yellow';
  }
  factors.push({
    name: 'Schedule',
    status: scheduleStatus,
    detail:
      daysUntilEnd >= 0
        ? `${daysUntilEnd} day(s) remaining.`
        : `${Math.abs(daysUntilEnd)} day(s) past target end date.`,
  });

  // Blockers factor
  let blockerStatus: HealthScore = 'green';
  if (blockedRatio >= BLOCKED_RATIO_RED) {
    blockerStatus = 'red';
  } else if (blockedRatio >= BLOCKED_RATIO_YELLOW) {
    blockerStatus = 'yellow';
  }
  factors.push({
    name: 'Blockers',
    status: blockerStatus,
    detail: `${blockedCount} of ${tasks.length} task(s) blocked (${Math.round(blockedRatio * 100)}%).`,
  });

  // Risk factor
  let riskStatus: HealthScore = 'green';
  if (criticalRisk) {
    riskStatus = 'red';
  } else if (highRisk) {
    riskStatus = 'yellow';
  }
  factors.push({
    name: 'Risks',
    status: riskStatus,
    detail: `${openRisks.length} open risk(s).${criticalRisk ? ' Critical risk present.' : ''}`,
  });

  // Derive overall score (worst factor wins)
  const overall: HealthScore =
    factors.some((f) => f.status === 'red')
      ? 'red'
      : factors.some((f) => f.status === 'yellow')
      ? 'yellow'
      : 'green';

  const notes = factors
    .filter((f) => f.status !== 'green')
    .map((f) => `[${f.name}] ${f.detail}`)
    .join(' ');

  return {
    projectId: project.id,
    score: overall,
    notes: notes || 'All indicators healthy.',
    factors,
  };
}

// ─── Project Operations ───────────────────────────────────────────────────────

/** Creates a new project and registers it in the index. */
export function createProject(input: CreateProjectInput): Project {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Project name is required.');
  }
  if (!input.owner || input.owner.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Project owner is required.');
  }
  if (!input.startDate || !input.targetEndDate) {
    throw new Error('VALIDATION_FAILED: startDate and targetEndDate are required.');
  }
  if (input.startDate > input.targetEndDate) {
    throw new Error('VALIDATION_FAILED: startDate must not be after targetEndDate.');
  }

  const project: Project = {
    id: _generateId('prj'),
    name: input.name.trim(),
    description: input.description ?? '',
    status: 'planning',
    priority: input.priority,
    owner: input.owner.trim(),
    tags: input.tags ?? [],
    startDate: input.startDate,
    targetEndDate: input.targetEndDate,
    milestones: [],
    tasks: [],
    risks: [],
    resources: [],
    healthScore: 'green',
    healthNotes: 'All indicators healthy.',
    completionPercent: 0,
    createdAt: _nowIso(),
    updatedAt: _nowIso(),
    metadata: input.metadata ?? {},
  };

  _projects.set(project.id, project);
  return project;
}

/** Returns a project by ID. */
export function getProject(id: ProjectId): Project {
  const project = _projects.get(id);
  if (!project) {
    throw new Error(`NOT_FOUND: No project with id "${id}".`);
  }
  return project;
}

/** Updates project fields and refreshes health and completion metrics. */
export function updateProject(
  id: ProjectId,
  patch: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Project {
  const project = getProject(id);
  const merged: Project = { ...project, ...patch, id, updatedAt: _nowIso() };
  merged.completionPercent = _completionPercent(id);
  const health = _computeHealth(merged);
  merged.healthScore = health.score;
  merged.healthNotes = health.notes;
  _projects.set(id, merged);
  return merged;
}

/** Transitions a project to a new status. */
export function setProjectStatus(id: ProjectId, status: ProjectStatus): Project {
  const project = getProject(id);
  const patch: Partial<Project> = { status };
  if (status === 'completed' || status === 'cancelled') {
    patch.actualEndDate = _nowIso();
  }
  return updateProject(id, patch);
}

/** Archives a project; excludes it from default list results. */
export function archiveProject(id: ProjectId): Project {
  return setProjectStatus(id, 'archived');
}

/** Lists all projects, optionally filtering by status or tags. */
export function listProjects(filter?: {
  status?: ProjectStatus;
  tags?: string[];
  owner?: string;
}): Project[] {
  let results = [..._projects.values()].filter((p) => p.status !== 'archived');

  if (filter?.status) {
    results = results.filter((p) => p.status === filter.status);
  }
  if (filter?.owner) {
    results = results.filter((p) => p.owner === filter.owner);
  }
  if (filter?.tags && filter.tags.length > 0) {
    results = results.filter((p) => filter.tags!.some((t) => p.tags.includes(t)));
  }

  return results.sort((a, b) => {
    const order: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
}

// ─── Task Operations ──────────────────────────────────────────────────────────

/** Creates a task and links it to its parent project. */
export function createTask(input: CreateTaskInput): Task {
  const project = getProject(input.projectId);

  if (!input.title || input.title.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Task title is required.');
  }
  if (input.estimatedHours < 0) {
    throw new Error('VALIDATION_FAILED: estimatedHours must be non-negative.');
  }

  const task: Task = {
    id: _generateId('tsk'),
    projectId: input.projectId,
    title: input.title.trim(),
    description: input.description ?? '',
    status: 'backlog',
    priority: input.priority,
    assignee: input.assignee ?? '',
    estimatedHours: input.estimatedHours,
    loggedHours: 0,
    dueDate: input.dueDate,
    dependencies: input.dependencies ?? [],
    tags: input.tags ?? [],
    createdAt: _nowIso(),
    updatedAt: _nowIso(),
  };

  _tasks.set(task.id, task);

  const updatedProject: Project = { ...project, tasks: [...project.tasks, task.id], updatedAt: _nowIso() };
  _projects.set(project.id, updatedProject);

  return task;
}

/** Returns a task by ID. */
export function getTask(id: TaskId): Task {
  const task = _tasks.get(id);
  if (!task) {
    throw new Error(`NOT_FOUND: No task with id "${id}".`);
  }
  return task;
}

/** Updates a task and refreshes its project's completion percentage and health. */
export function updateTask(id: TaskId, patch: Partial<Omit<Task, 'id' | 'projectId' | 'createdAt'>>): Task {
  const task = getTask(id);
  const merged: Task = { ...task, ...patch, id, updatedAt: _nowIso() };

  if (merged.status === 'done' && !merged.completedAt) {
    merged.completedAt = _nowIso();
  }

  _tasks.set(id, merged);
  updateProject(task.projectId, {});
  return merged;
}

/** Transitions a task to a new status. Requires a blocker reason when setting to blocked. */
export function setTaskStatus(id: TaskId, status: TaskStatus, blockerReason?: string): Task {
  if (status === 'blocked' && (!blockerReason || blockerReason.trim().length === 0)) {
    throw new Error('VALIDATION_FAILED: blockerReason is required when setting status to "blocked".');
  }
  return updateTask(id, { status, blockerReason: status === 'blocked' ? blockerReason : undefined });
}

/** Logs hours worked on a task. */
export function logHours(input: LogHoursInput): Task {
  if (input.hours <= 0) {
    throw new Error('VALIDATION_FAILED: Hours logged must be greater than zero.');
  }
  const task = getTask(input.taskId);
  return updateTask(input.taskId, { loggedHours: task.loggedHours + input.hours });
}

/** Returns all tasks for a project, sorted by priority. */
export function listTasks(projectId: ProjectId): Task[] {
  getProject(projectId);
  return _projectTasks(projectId);
}

// ─── Milestone Operations ─────────────────────────────────────────────────────

/** Creates a milestone and links it to its parent project. */
export function createMilestone(input: CreateMilestoneInput): Milestone {
  const project = getProject(input.projectId);

  if (!input.name || input.name.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Milestone name is required.');
  }
  if (!input.dueDate) {
    throw new Error('VALIDATION_FAILED: Milestone dueDate is required.');
  }

  const milestone: Milestone = {
    id: _generateId('mst'),
    projectId: input.projectId,
    name: input.name.trim(),
    description: input.description ?? '',
    status: 'upcoming',
    dueDate: input.dueDate,
    linkedTasks: input.linkedTasks ?? [],
    successCriteria: input.successCriteria ?? [],
    createdAt: _nowIso(),
    updatedAt: _nowIso(),
  };

  _milestones.set(milestone.id, milestone);

  const updatedProject: Project = {
    ...project,
    milestones: [...project.milestones, milestone.id],
    updatedAt: _nowIso(),
  };
  _projects.set(project.id, updatedProject);

  return milestone;
}

/** Returns a milestone by ID. */
export function getMilestone(id: MilestoneId): Milestone {
  const milestone = _milestones.get(id);
  if (!milestone) {
    throw new Error(`NOT_FOUND: No milestone with id "${id}".`);
  }
  return milestone;
}

/** Updates a milestone. */
export function updateMilestone(
  id: MilestoneId,
  patch: Partial<Omit<Milestone, 'id' | 'projectId' | 'createdAt'>>,
): Milestone {
  const milestone = getMilestone(id);
  const merged: Milestone = { ...milestone, ...patch, id, updatedAt: _nowIso() };

  if (merged.status === 'achieved' && !merged.achievedDate) {
    merged.achievedDate = _nowIso();
  }

  _milestones.set(id, merged);
  return merged;
}

/** Returns all milestones for a project, ordered by due date. */
export function listMilestones(projectId: ProjectId): Milestone[] {
  getProject(projectId);
  return _projectMilestones(projectId);
}

// ─── Risk Operations ──────────────────────────────────────────────────────────

/** Creates a risk and links it to its parent project. */
export function createRisk(input: CreateRiskInput): Risk {
  const project = getProject(input.projectId);

  if (!input.title || input.title.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Risk title is required.');
  }
  if (input.probability < 0 || input.probability > 1) {
    throw new Error('VALIDATION_FAILED: probability must be between 0 and 1.');
  }
  if (input.impact < 0 || input.impact > 1) {
    throw new Error('VALIDATION_FAILED: impact must be between 0 and 1.');
  }

  const risk: Risk = {
    id: _generateId('rsk'),
    projectId: input.projectId,
    title: input.title.trim(),
    description: input.description ?? '',
    level: input.level,
    status: 'open',
    probability: input.probability,
    impact: input.impact,
    mitigationPlan: input.mitigationPlan ?? '',
    owner: input.owner ?? '',
    reviewDate: input.reviewDate,
    createdAt: _nowIso(),
    updatedAt: _nowIso(),
  };

  _risks.set(risk.id, risk);

  const updatedProject: Project = {
    ...project,
    risks: [...project.risks, risk.id],
    updatedAt: _nowIso(),
  };
  _projects.set(project.id, updatedProject);
  updateProject(project.id, {});

  return risk;
}

/** Returns a risk by ID. */
export function getRisk(id: RiskId): Risk {
  const risk = _risks.get(id);
  if (!risk) {
    throw new Error(`NOT_FOUND: No risk with id "${id}".`);
  }
  return risk;
}

/** Updates a risk's fields. */
export function updateRisk(id: RiskId, patch: Partial<Omit<Risk, 'id' | 'projectId' | 'createdAt'>>): Risk {
  const risk = getRisk(id);
  const merged: Risk = { ...risk, ...patch, id, updatedAt: _nowIso() };
  _risks.set(id, merged);
  updateProject(risk.projectId, {});
  return merged;
}

/** Returns all risks for a project, ordered by risk score descending. */
export function listRisks(projectId: ProjectId): Risk[] {
  getProject(projectId);
  return _projectRisks(projectId);
}

// ─── Resource Operations ──────────────────────────────────────────────────────

/** Creates a resource allocation entry for a project. */
export function createResource(input: CreateResourceInput): Resource {
  const project = getProject(input.projectId);

  if (!input.name || input.name.trim().length === 0) {
    throw new Error('VALIDATION_FAILED: Resource name is required.');
  }
  if (input.allocated < 0) {
    throw new Error('VALIDATION_FAILED: allocated must be non-negative.');
  }

  const resource: Resource = {
    id: _generateId('res'),
    projectId: input.projectId,
    name: input.name.trim(),
    type: input.type,
    allocated: input.allocated,
    unit: input.unit ?? '',
    consumed: 0,
    createdAt: _nowIso(),
    updatedAt: _nowIso(),
  };

  _resources.set(resource.id, resource);

  const updatedProject: Project = {
    ...project,
    resources: [...project.resources, resource.id],
    updatedAt: _nowIso(),
  };
  _projects.set(project.id, updatedProject);

  return resource;
}

/** Returns a resource by ID. */
export function getResource(id: ResourceId): Resource {
  const resource = _resources.get(id);
  if (!resource) {
    throw new Error(`NOT_FOUND: No resource with id "${id}".`);
  }
  return resource;
}

/** Records consumption against an allocated resource. */
export function consumeResource(id: ResourceId, amount: number): Resource {
  if (amount <= 0) {
    throw new Error('VALIDATION_FAILED: Consumption amount must be greater than zero.');
  }
  const resource = getResource(id);
  const updated: Resource = { ...resource, consumed: resource.consumed + amount, updatedAt: _nowIso() };
  _resources.set(id, updated);
  return updated;
}

/** Returns all resources for a project. */
export function listResources(projectId: ProjectId): Resource[] {
  getProject(projectId);
  return _projectResources(projectId);
}

// ─── Health and Reporting ─────────────────────────────────────────────────────

/** Computes and returns the current health report for a project. */
export function scoreHealth(projectId: ProjectId): ProjectHealthResult {
  const project = getProject(projectId);
  const result = _computeHealth(project);
  updateProject(projectId, { healthScore: result.score, healthNotes: result.notes });
  return result;
}

/** Generates a full status report for a project. */
export function generateStatusReport(projectId: ProjectId, period: string): StatusReport {
  const project = getProject(projectId);
  const tasks = _projectTasks(projectId).filter((t) => t.status !== 'cancelled');
  const milestones = _projectMilestones(projectId);
  const risks = _projectRisks(projectId);
  const resources = _projectResources(projectId);
  const health = _computeHealth(project);

  const tasksCompleted = tasks.filter((t) => t.status === 'done').length;
  const milestonesAchieved = milestones.filter((m) => m.status === 'achieved').length;
  const openRisks = risks.filter((r) => r.status === 'open');
  const criticalRisks = openRisks.filter((r) => r.probability * r.impact >= RISK_SCORE_CRITICAL_THRESHOLD);
  const blockedTasks = tasks.filter((t) => t.status === 'blocked');

  const resourceUtilization: ResourceUtilization[] = resources.map((r) => ({
    resourceId: r.id,
    name: r.name,
    type: r.type,
    utilizationPercent: r.allocated > 0 ? Math.round((r.consumed / r.allocated) * 100) : 0,
    unit: r.unit,
  }));

  const recentAccomplishments = milestones
    .filter((m) => m.status === 'achieved')
    .map((m) => `Milestone achieved: ${m.name}`);

  const nextSteps = milestones
    .filter((m) => m.status === 'upcoming' || m.status === 'in-progress')
    .slice(0, 3)
    .map((m) => `Complete milestone: ${m.name} (due ${m.dueDate})`);

  const issues = [
    ...blockedTasks.map((t) => `Blocked task: "${t.title}" — ${t.blockerReason ?? 'No reason given'}`),
    ...criticalRisks.map((r) => `Critical risk: "${r.title}"`),
  ];

  return {
    projectId,
    generatedAt: _nowIso(),
    period,
    health: health.score,
    summary: health.notes,
    completionPercent: _completionPercent(projectId),
    milestonesAchieved,
    milestonesTotal: milestones.length,
    tasksCompleted,
    tasksTotal: tasks.length,
    openRisks: openRisks.length,
    criticalRisks: criticalRisks.length,
    blockedTasks: blockedTasks.length,
    resourceUtilization,
    recentAccomplishments,
    nextSteps,
    issues,
  };
}

/** Generates a roadmap showing milestones, their linked tasks, and on-track status. */
export function generateRoadmap(projectId: ProjectId): Roadmap {
  getProject(projectId);
  const milestones = _projectMilestones(projectId);
  const today = _nowIso();

  const roadmapMilestones: RoadmapMilestone[] = milestones.map((m) => {
    const linkedTasks = m.linkedTasks
      .map((tid) => _tasks.get(tid))
      .filter((t): t is Task => t !== undefined);

    const projectRisks = _projectRisks(projectId);
    const milestoneRisks = projectRisks.filter(
      (r) => r.status === 'open' && r.reviewDate <= m.dueDate,
    );

    const allDone = linkedTasks.length > 0 && linkedTasks.every((t) => t.status === 'done');
    const isOverdue = m.dueDate < today && m.status !== 'achieved';
    const isOnTrack = (allDone || m.status === 'achieved') && !isOverdue;

    return {
      milestone: m,
      tasks: linkedTasks,
      riskCount: milestoneRisks.length,
      isOnTrack,
    };
  });

  return { projectId, generatedAt: _nowIso(), milestones: roadmapMilestones };
}

// ─── Public Default Export ────────────────────────────────────────────────────

const projectManager = {
  createProject,
  getProject,
  updateProject,
  setProjectStatus,
  archiveProject,
  listProjects,
  createTask,
  getTask,
  updateTask,
  setTaskStatus,
  logHours,
  listTasks,
  createMilestone,
  getMilestone,
  updateMilestone,
  listMilestones,
  createRisk,
  getRisk,
  updateRisk,
  listRisks,
  createResource,
  getResource,
  consumeResource,
  listResources,
  scoreHealth,
  generateStatusReport,
  generateRoadmap,
};

export default projectManager;
