/**
 * Tests for the Project Manager Skill.
 * Covers all public functions with positive, negative, and edge cases.
 */

import projectManager, {
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
} from '../src/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeProject(overrides: Partial<Parameters<typeof createProject>[0]> = {}) {
  return createProject({
    name: 'Test Project',
    description: 'A test project.',
    priority: 'high',
    owner: 'alice',
    startDate: '2026-01-01',
    targetEndDate: '2026-12-31',
    ...overrides,
  });
}

// ─── Project Tests ────────────────────────────────────────────────────────────

describe('createProject', () => {
  test('creates a project with the correct fields', () => {
    const p = makeProject({ name: 'Alpha', owner: 'bob' });
    expect(p.name).toBe('Alpha');
    expect(p.owner).toBe('bob');
    expect(p.status).toBe('planning');
    expect(p.healthScore).toBe('green');
    expect(p.completionPercent).toBe(0);
    expect(p.id).toMatch(/^prj-/);
  });

  test('throws VALIDATION_FAILED when name is empty', () => {
    expect(() => makeProject({ name: '' })).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED when owner is empty', () => {
    expect(() => makeProject({ owner: '' })).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED when startDate is after targetEndDate', () => {
    expect(() => makeProject({ startDate: '2026-12-31', targetEndDate: '2026-01-01' })).toThrow(
      'VALIDATION_FAILED',
    );
  });
});

describe('getProject', () => {
  test('returns the correct project by ID', () => {
    const p = makeProject({ name: 'GetTest' });
    expect(getProject(p.id).name).toBe('GetTest');
  });

  test('throws NOT_FOUND for unknown ID', () => {
    expect(() => getProject('prj-does-not-exist')).toThrow('NOT_FOUND');
  });
});

describe('updateProject', () => {
  test('updates mutable fields', () => {
    const p = makeProject({ name: 'UpdateMe' });
    const updated = updateProject(p.id, { name: 'Updated Name' });
    expect(updated.name).toBe('Updated Name');
  });

  test('preserves immutable fields', () => {
    const p = makeProject();
    const updated = updateProject(p.id, { name: 'Patched' });
    expect(updated.id).toBe(p.id);
    expect(updated.createdAt).toBe(p.createdAt);
  });
});

describe('setProjectStatus', () => {
  test('transitions status correctly', () => {
    const p = makeProject();
    const updated = setProjectStatus(p.id, 'active');
    expect(updated.status).toBe('active');
  });

  test('sets actualEndDate when completing a project', () => {
    const p = makeProject();
    const completed = setProjectStatus(p.id, 'completed');
    expect(completed.actualEndDate).toBeDefined();
  });
});

describe('archiveProject', () => {
  test('sets status to archived', () => {
    const p = makeProject({ name: 'ArchiveMe' });
    const archived = archiveProject(p.id);
    expect(archived.status).toBe('archived');
  });

  test('archived project does not appear in default listProjects', () => {
    const p = makeProject({ name: 'ShouldDisappear' });
    archiveProject(p.id);
    const visible = listProjects().map((proj) => proj.id);
    expect(visible).not.toContain(p.id);
  });
});

describe('listProjects', () => {
  test('filters by status', () => {
    const p = makeProject({ name: 'OnHold' });
    setProjectStatus(p.id, 'on-hold');
    const results = listProjects({ status: 'on-hold' });
    expect(results.some((r) => r.id === p.id)).toBe(true);
  });

  test('filters by owner', () => {
    const p = makeProject({ name: 'OwnedByCarol', owner: 'carol' });
    const results = listProjects({ owner: 'carol' });
    expect(results.some((r) => r.id === p.id)).toBe(true);
  });

  test('filters by tags', () => {
    const p = makeProject({ name: 'Tagged', tags: ['marketing'] });
    const results = listProjects({ tags: ['marketing'] });
    expect(results.some((r) => r.id === p.id)).toBe(true);
  });
});

// ─── Task Tests ───────────────────────────────────────────────────────────────

describe('createTask', () => {
  test('creates a task linked to the project', () => {
    const p = makeProject();
    const t = createTask({
      projectId: p.id,
      title: 'Write tests',
      description: 'Cover all public functions.',
      priority: 'high',
      assignee: 'alice',
      estimatedHours: 4,
    });
    expect(t.projectId).toBe(p.id);
    expect(t.status).toBe('backlog');
    expect(t.loggedHours).toBe(0);
  });

  test('throws VALIDATION_FAILED for empty title', () => {
    const p = makeProject();
    expect(() =>
      createTask({
        projectId: p.id,
        title: '',
        description: '',
        priority: 'low',
        assignee: 'bob',
        estimatedHours: 1,
      }),
    ).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED for negative estimatedHours', () => {
    const p = makeProject();
    expect(() =>
      createTask({
        projectId: p.id,
        title: 'Bad hours',
        description: '',
        priority: 'low',
        assignee: 'bob',
        estimatedHours: -1,
      }),
    ).toThrow('VALIDATION_FAILED');
  });

  test('throws NOT_FOUND for unknown project', () => {
    expect(() =>
      createTask({
        projectId: 'prj-nonexistent',
        title: 'Ghost task',
        description: '',
        priority: 'low',
        assignee: 'nobody',
        estimatedHours: 0,
      }),
    ).toThrow('NOT_FOUND');
  });
});

describe('setTaskStatus', () => {
  test('transitions task status', () => {
    const p = makeProject();
    const t = createTask({
      projectId: p.id,
      title: 'Status task',
      description: '',
      priority: 'medium',
      assignee: 'alice',
      estimatedHours: 2,
    });
    const updated = setTaskStatus(t.id, 'in-progress');
    expect(updated.status).toBe('in-progress');
  });

  test('requires blockerReason when setting to blocked', () => {
    const p = makeProject();
    const t = createTask({
      projectId: p.id,
      title: 'Block me',
      description: '',
      priority: 'medium',
      assignee: 'alice',
      estimatedHours: 2,
    });
    expect(() => setTaskStatus(t.id, 'blocked')).toThrow('VALIDATION_FAILED');
    expect(() => setTaskStatus(t.id, 'blocked', '')).toThrow('VALIDATION_FAILED');
  });

  test('accepts blockerReason when blocking a task', () => {
    const p = makeProject();
    const t = createTask({
      projectId: p.id,
      title: 'Block me 2',
      description: '',
      priority: 'medium',
      assignee: 'alice',
      estimatedHours: 2,
    });
    const blocked = setTaskStatus(t.id, 'blocked', 'Waiting for design approval');
    expect(blocked.status).toBe('blocked');
    expect(blocked.blockerReason).toBe('Waiting for design approval');
  });

  test('sets completedAt when marking done', () => {
    const p = makeProject();
    const t = createTask({
      projectId: p.id,
      title: 'Complete me',
      description: '',
      priority: 'low',
      assignee: 'bob',
      estimatedHours: 1,
    });
    const done = setTaskStatus(t.id, 'done');
    expect(done.completedAt).toBeDefined();
  });
});

describe('logHours', () => {
  test('accumulates logged hours', () => {
    const p = makeProject();
    const t = createTask({
      projectId: p.id,
      title: 'Log hours',
      description: '',
      priority: 'low',
      assignee: 'alice',
      estimatedHours: 8,
    });
    logHours({ taskId: t.id, hours: 3 });
    const updated = logHours({ taskId: t.id, hours: 2 });
    expect(updated.loggedHours).toBe(5);
  });

  test('throws VALIDATION_FAILED for zero hours', () => {
    const p = makeProject();
    const t = createTask({
      projectId: p.id,
      title: 'Zero hours',
      description: '',
      priority: 'low',
      assignee: 'alice',
      estimatedHours: 4,
    });
    expect(() => logHours({ taskId: t.id, hours: 0 })).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED for negative hours', () => {
    const p = makeProject();
    const t = createTask({
      projectId: p.id,
      title: 'Negative hours',
      description: '',
      priority: 'low',
      assignee: 'alice',
      estimatedHours: 4,
    });
    expect(() => logHours({ taskId: t.id, hours: -1 })).toThrow('VALIDATION_FAILED');
  });
});

// ─── Milestone Tests ──────────────────────────────────────────────────────────

describe('createMilestone', () => {
  test('creates a milestone and links it to the project', () => {
    const p = makeProject();
    const m = createMilestone({
      projectId: p.id,
      name: 'Beta Launch',
      description: 'Ship the beta.',
      dueDate: '2026-06-01',
      successCriteria: ['All P0 bugs fixed', 'Load time < 2s'],
    });
    expect(m.status).toBe('upcoming');
    expect(m.successCriteria).toHaveLength(2);
    expect(getProject(p.id).milestones).toContain(m.id);
  });

  test('throws VALIDATION_FAILED for empty name', () => {
    const p = makeProject();
    expect(() =>
      createMilestone({ projectId: p.id, name: '', description: '', dueDate: '2026-06-01' }),
    ).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED for missing dueDate', () => {
    const p = makeProject();
    expect(() =>
      createMilestone({ projectId: p.id, name: 'M1', description: '', dueDate: '' }),
    ).toThrow('VALIDATION_FAILED');
  });
});

describe('updateMilestone', () => {
  test('sets achievedDate when status changes to achieved', () => {
    const p = makeProject();
    const m = createMilestone({
      projectId: p.id,
      name: 'Achieve me',
      description: '',
      dueDate: '2026-04-01',
    });
    const achieved = updateMilestone(m.id, { status: 'achieved' });
    expect(achieved.achievedDate).toBeDefined();
  });
});

// ─── Risk Tests ───────────────────────────────────────────────────────────────

describe('createRisk', () => {
  test('creates a risk with status open', () => {
    const p = makeProject();
    const r = createRisk({
      projectId: p.id,
      title: 'Scope creep',
      description: 'Features expanding beyond original estimate.',
      level: 'high',
      probability: 0.7,
      impact: 0.8,
      mitigationPlan: 'Strict change control process.',
      owner: 'alice',
      reviewDate: '2026-03-01',
    });
    expect(r.status).toBe('open');
    expect(r.probability).toBe(0.7);
    expect(r.impact).toBe(0.8);
  });

  test('throws VALIDATION_FAILED for probability out of range', () => {
    const p = makeProject();
    expect(() =>
      createRisk({
        projectId: p.id,
        title: 'Bad probability',
        description: '',
        level: 'low',
        probability: 1.5,
        impact: 0.5,
        mitigationPlan: '',
        owner: 'alice',
        reviewDate: '2026-03-01',
      }),
    ).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED for impact out of range', () => {
    const p = makeProject();
    expect(() =>
      createRisk({
        projectId: p.id,
        title: 'Bad impact',
        description: '',
        level: 'low',
        probability: 0.5,
        impact: -0.1,
        mitigationPlan: '',
        owner: 'alice',
        reviewDate: '2026-03-01',
      }),
    ).toThrow('VALIDATION_FAILED');
  });

  test('throws VALIDATION_FAILED for empty title', () => {
    const p = makeProject();
    expect(() =>
      createRisk({
        projectId: p.id,
        title: '',
        description: '',
        level: 'low',
        probability: 0.5,
        impact: 0.5,
        mitigationPlan: '',
        owner: 'alice',
        reviewDate: '2026-03-01',
      }),
    ).toThrow('VALIDATION_FAILED');
  });
});

// ─── Resource Tests ───────────────────────────────────────────────────────────

describe('createResource', () => {
  test('creates a resource with zero consumption', () => {
    const p = makeProject();
    const r = createResource({
      projectId: p.id,
      name: 'Design Budget',
      type: 'budget',
      allocated: 10000,
      unit: 'USD',
    });
    expect(r.consumed).toBe(0);
    expect(r.allocated).toBe(10000);
  });

  test('throws VALIDATION_FAILED for negative allocation', () => {
    const p = makeProject();
    expect(() =>
      createResource({
        projectId: p.id,
        name: 'Negative resource',
        type: 'budget',
        allocated: -100,
        unit: 'USD',
      }),
    ).toThrow('VALIDATION_FAILED');
  });
});

describe('consumeResource', () => {
  test('accumulates consumption', () => {
    const p = makeProject();
    const r = createResource({
      projectId: p.id,
      name: 'Hours Pool',
      type: 'time',
      allocated: 100,
      unit: 'hours',
    });
    consumeResource(r.id, 30);
    const updated = consumeResource(r.id, 20);
    expect(updated.consumed).toBe(50);
  });

  test('throws VALIDATION_FAILED for zero amount', () => {
    const p = makeProject();
    const r = createResource({
      projectId: p.id,
      name: 'Zero consume',
      type: 'time',
      allocated: 100,
      unit: 'hours',
    });
    expect(() => consumeResource(r.id, 0)).toThrow('VALIDATION_FAILED');
  });
});

// ─── Health and Reporting Tests ───────────────────────────────────────────────

describe('scoreHealth', () => {
  test('returns green for a new project with no risks or blockers', () => {
    const p = makeProject({
      name: 'Healthy',
      startDate: '2026-01-01',
      targetEndDate: '2027-01-01',
    });
    const result = scoreHealth(p.id);
    expect(result.score).toBe('green');
    expect(result.factors).toHaveLength(3);
  });

  test('returns red when a critical risk exists', () => {
    const p = makeProject({
      name: 'Risky',
      startDate: '2026-01-01',
      targetEndDate: '2027-01-01',
    });
    createRisk({
      projectId: p.id,
      title: 'Critical blocker',
      description: '',
      level: 'critical',
      probability: 0.9,
      impact: 0.95,
      mitigationPlan: 'TBD',
      owner: 'alice',
      reviewDate: '2026-03-01',
    });
    const result = scoreHealth(p.id);
    expect(result.score).toBe('red');
  });

  test('throws NOT_FOUND for unknown project', () => {
    expect(() => scoreHealth('prj-unknown')).toThrow('NOT_FOUND');
  });
});

describe('generateStatusReport', () => {
  test('generates a report with correct completion metrics', () => {
    const p = makeProject({ name: 'Report Project', targetEndDate: '2027-06-01' });
    const t1 = createTask({
      projectId: p.id,
      title: 'Task 1',
      description: '',
      priority: 'high',
      assignee: 'alice',
      estimatedHours: 4,
    });
    const t2 = createTask({
      projectId: p.id,
      title: 'Task 2',
      description: '',
      priority: 'medium',
      assignee: 'bob',
      estimatedHours: 4,
    });
    setTaskStatus(t1.id, 'done');
    const report = generateStatusReport(p.id, 'Q2 2026');
    expect(report.tasksTotal).toBe(2);
    expect(report.tasksCompleted).toBe(1);
    expect(report.completionPercent).toBe(50);
    expect(report.period).toBe('Q2 2026');
  });

  test('includes blocked tasks in issues', () => {
    const p = makeProject({ name: 'Blocked Report', targetEndDate: '2027-06-01' });
    const t = createTask({
      projectId: p.id,
      title: 'Stuck task',
      description: '',
      priority: 'high',
      assignee: 'alice',
      estimatedHours: 4,
    });
    setTaskStatus(t.id, 'blocked', 'Pending external API');
    const report = generateStatusReport(p.id, 'Q2 2026');
    expect(report.blockedTasks).toBe(1);
    expect(report.issues.some((i) => i.includes('Stuck task'))).toBe(true);
  });
});

describe('generateRoadmap', () => {
  test('generates roadmap with milestones and their tasks', () => {
    const p = makeProject({ name: 'Roadmap Project', targetEndDate: '2027-06-01' });
    const t = createTask({
      projectId: p.id,
      title: 'Design spec',
      description: '',
      priority: 'high',
      assignee: 'alice',
      estimatedHours: 8,
    });
    const m = createMilestone({
      projectId: p.id,
      name: 'Design Complete',
      description: 'Finish all design work.',
      dueDate: '2026-09-01',
      linkedTasks: [t.id],
    });
    const roadmap = generateRoadmap(p.id);
    expect(roadmap.milestones).toHaveLength(1);
    expect(roadmap.milestones[0].milestone.id).toBe(m.id);
    expect(roadmap.milestones[0].tasks).toHaveLength(1);
  });

  test('marks milestone as on-track when all linked tasks are done', () => {
    const p = makeProject({ name: 'On Track', targetEndDate: '2027-01-01' });
    const t = createTask({
      projectId: p.id,
      title: 'Done task',
      description: '',
      priority: 'high',
      assignee: 'alice',
      estimatedHours: 2,
    });
    setTaskStatus(t.id, 'done');
    createMilestone({
      projectId: p.id,
      name: 'M Done',
      description: '',
      dueDate: '2027-01-01',
      linkedTasks: [t.id],
    });
    const roadmap = generateRoadmap(p.id);
    const entry = roadmap.milestones.find((rm) => rm.milestone.name === 'M Done');
    expect(entry?.isOnTrack).toBe(true);
  });

  test('throws NOT_FOUND for unknown project', () => {
    expect(() => generateRoadmap('prj-unknown')).toThrow('NOT_FOUND');
  });
});

// ─── Default Export ───────────────────────────────────────────────────────────

describe('default export', () => {
  test('exposes all public methods', () => {
    expect(typeof projectManager.createProject).toBe('function');
    expect(typeof projectManager.getProject).toBe('function');
    expect(typeof projectManager.updateProject).toBe('function');
    expect(typeof projectManager.setProjectStatus).toBe('function');
    expect(typeof projectManager.archiveProject).toBe('function');
    expect(typeof projectManager.listProjects).toBe('function');
    expect(typeof projectManager.createTask).toBe('function');
    expect(typeof projectManager.getTask).toBe('function');
    expect(typeof projectManager.updateTask).toBe('function');
    expect(typeof projectManager.setTaskStatus).toBe('function');
    expect(typeof projectManager.logHours).toBe('function');
    expect(typeof projectManager.listTasks).toBe('function');
    expect(typeof projectManager.createMilestone).toBe('function');
    expect(typeof projectManager.getMilestone).toBe('function');
    expect(typeof projectManager.updateMilestone).toBe('function');
    expect(typeof projectManager.listMilestones).toBe('function');
    expect(typeof projectManager.createRisk).toBe('function');
    expect(typeof projectManager.getRisk).toBe('function');
    expect(typeof projectManager.updateRisk).toBe('function');
    expect(typeof projectManager.listRisks).toBe('function');
    expect(typeof projectManager.createResource).toBe('function');
    expect(typeof projectManager.getResource).toBe('function');
    expect(typeof projectManager.consumeResource).toBe('function');
    expect(typeof projectManager.listResources).toBe('function');
    expect(typeof projectManager.scoreHealth).toBe('function');
    expect(typeof projectManager.generateStatusReport).toBe('function');
    expect(typeof projectManager.generateRoadmap).toBe('function');
  });
});
