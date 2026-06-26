# Project Manager

## Overview

Project Manager is the project lifecycle engine of Nata Studio OS. It creates and tracks projects from planning through archival, manages tasks with priority and dependency tracking, defines milestones with success criteria, monitors risks, allocates resources, and produces health scores, status reports, and roadmaps. Every operational domain that needs structured project execution uses this Skill as its coordination layer.

## Usage

```typescript
import projectManager from './src/index';

// Create a project
const project = projectManager.createProject({
  name: 'Brand Identity Redesign',
  description: 'Refresh all visual branding assets.',
  priority: 'high',
  owner: 'nata',
  startDate: '2026-07-01',
  targetEndDate: '2026-09-30',
  tags: ['design', 'branding'],
});

// Add a task
const task = projectManager.createTask({
  projectId: project.id,
  title: 'Create logo concepts',
  description: 'Produce three logo directions for stakeholder review.',
  priority: 'high',
  assignee: 'design-lead',
  estimatedHours: 16,
  dueDate: '2026-07-15',
});

// Generate a status report
const report = projectManager.generateStatusReport(project.id, 'Week 1');
console.log(report.health); // 'green'
```

## Parameters

### `createProject(input)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | Yes | — | Unique, descriptive project name. |
| `description` | `string` | Yes | — | One-paragraph summary of the project goals. |
| `priority` | `Priority` | Yes | — | `critical`, `high`, `medium`, or `low`. |
| `owner` | `string` | Yes | — | Person or team accountable for delivery. |
| `tags` | `string[]` | No | `[]` | Lowercase labels for filtering and grouping. |
| `startDate` | `string` | Yes | — | ISO 8601 date (e.g., `2026-07-01`). Must be ≤ `targetEndDate`. |
| `targetEndDate` | `string` | Yes | — | ISO 8601 planned completion date. |
| `metadata` | `Record<string, unknown>` | No | `{}` | Arbitrary key-value data for downstream consumers. |

### `createTask(input)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `projectId` | `ProjectId` | Yes | — | Parent project ID. |
| `title` | `string` | Yes | — | Short, action-oriented task title. |
| `description` | `string` | Yes | — | Detailed description of the work required. |
| `priority` | `Priority` | Yes | — | `critical`, `high`, `medium`, or `low`. |
| `assignee` | `string` | Yes | — | Person or role responsible for the task. |
| `estimatedHours` | `number` | Yes | — | Non-negative effort estimate in hours. |
| `dueDate` | `string` | No | — | ISO 8601 date by which the task must be complete. |
| `dependencies` | `TaskId[]` | No | `[]` | IDs of tasks that must be done before this one starts. |
| `tags` | `string[]` | No | `[]` | Lowercase labels for filtering. |

### `createMilestone(input)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `projectId` | `ProjectId` | Yes | — | Parent project ID. |
| `name` | `string` | Yes | — | Clear, outcome-oriented milestone name. |
| `description` | `string` | Yes | — | What achievement this milestone represents. |
| `dueDate` | `string` | Yes | — | ISO 8601 target date for this milestone. |
| `linkedTasks` | `TaskId[]` | No | `[]` | Tasks that contribute to this milestone. |
| `successCriteria` | `string[]` | No | `[]` | Measurable conditions that define success. |

### `createRisk(input)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `projectId` | `ProjectId` | Yes | — | Parent project ID. |
| `title` | `string` | Yes | — | Short name for the risk. |
| `description` | `string` | Yes | — | Full description of the risk scenario. |
| `level` | `RiskLevel` | Yes | — | `critical`, `high`, `medium`, or `low`. |
| `probability` | `number` | Yes | — | Likelihood (0–1). |
| `impact` | `number` | Yes | — | Severity if realized (0–1). |
| `mitigationPlan` | `string` | Yes | — | Actions to reduce probability or impact. |
| `owner` | `string` | Yes | — | Person accountable for monitoring and mitigation. |
| `reviewDate` | `string` | Yes | — | ISO 8601 date for next risk review. |

### `createResource(input)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `projectId` | `ProjectId` | Yes | — | Parent project ID. |
| `name` | `string` | Yes | — | Resource label. |
| `type` | `ResourceType` | Yes | — | `human`, `tool`, `budget`, or `time`. |
| `allocated` | `number` | Yes | — | Total allocation (non-negative). |
| `unit` | `string` | Yes | — | Unit of measure (e.g., `hours`, `USD`). |

### `setTaskStatus(id, status, blockerReason?)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `TaskId` | Yes | — | Task to update. |
| `status` | `TaskStatus` | Yes | — | `backlog`, `todo`, `in-progress`, `blocked`, `in-review`, `done`, or `cancelled`. |
| `blockerReason` | `string` | No | — | Required when `status` is `blocked`. |

### `logHours(input)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `taskId` | `TaskId` | Yes | — | Task to log effort against. |
| `hours` | `number` | Yes | — | Hours worked. Must be greater than zero. |

### `generateStatusReport(projectId, period)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `projectId` | `ProjectId` | Yes | — | Project to report on. |
| `period` | `string` | Yes | — | Human-readable period label (e.g., `Week 12`, `Q3 2026`). |

### `scoreHealth(projectId)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `projectId` | `ProjectId` | Yes | — | Project to evaluate. Returns a `ProjectHealthResult`. |

### `generateRoadmap(projectId)`

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `projectId` | `ProjectId` | Yes | — | Project to generate a roadmap for. Returns a `Roadmap`. |

## Examples

### Minimal — create a project and add one task

```typescript
import projectManager from './src/index';

const project = projectManager.createProject({
  name: 'Podcast Launch',
  description: 'Launch the Nata Studio weekly podcast.',
  priority: 'medium',
  owner: 'content-team',
  startDate: '2026-08-01',
  targetEndDate: '2026-10-01',
});

const task = projectManager.createTask({
  projectId: project.id,
  title: 'Record pilot episode',
  description: 'Record and edit the 20-minute pilot episode.',
  priority: 'high',
  assignee: 'producer',
  estimatedHours: 8,
  dueDate: '2026-08-15',
});

console.log(task.status); // 'backlog'
```

### Realistic — full lifecycle with milestones, risks, resources, and reporting

```typescript
import projectManager from './src/index';

// 1. Create the project
const project = projectManager.createProject({
  name: 'Mobile App v2',
  description: 'Redesign and rebuild the Nata Studio mobile application.',
  priority: 'critical',
  owner: 'engineering',
  startDate: '2026-07-01',
  targetEndDate: '2026-12-15',
  tags: ['mobile', 'engineering', 'q4'],
});

// 2. Add tasks
const designTask = projectManager.createTask({
  projectId: project.id,
  title: 'Complete UX design',
  description: 'Deliver all screens in Figma.',
  priority: 'critical',
  assignee: 'ux-lead',
  estimatedHours: 80,
  dueDate: '2026-08-01',
});

const devTask = projectManager.createTask({
  projectId: project.id,
  title: 'Implement core navigation',
  description: 'Build the tab bar and stack navigation.',
  priority: 'high',
  assignee: 'dev-lead',
  estimatedHours: 40,
  dependencies: [designTask.id],
});

// 3. Define a milestone
const milestone = projectManager.createMilestone({
  projectId: project.id,
  name: 'Design Handoff',
  description: 'All UX screens approved and delivered to engineering.',
  dueDate: '2026-08-01',
  linkedTasks: [designTask.id],
  successCriteria: [
    'All 32 screens exported to Figma',
    'Design review sign-off obtained',
    'Component library published',
  ],
});

// 4. Register a risk
const risk = projectManager.createRisk({
  projectId: project.id,
  title: 'Third-party SDK delay',
  description: 'Core payment SDK may not support the target OS version by release.',
  level: 'high',
  probability: 0.6,
  impact: 0.75,
  mitigationPlan: 'Evaluate two alternative SDKs; prototype integration by Week 6.',
  owner: 'dev-lead',
  reviewDate: '2026-08-15',
});

// 5. Allocate resources
const budget = projectManager.createResource({
  projectId: project.id,
  name: 'Engineering Budget',
  type: 'budget',
  allocated: 50000,
  unit: 'USD',
});

// 6. Log work and advance task status
projectManager.logHours({ taskId: designTask.id, hours: 40 });
projectManager.setTaskStatus(designTask.id, 'in-progress');

// 7. Record resource consumption
projectManager.consumeResource(budget.id, 15000);

// 8. Check health
const health = projectManager.scoreHealth(project.id);
console.log(health.score);   // 'yellow' (high risk present)

// 9. Generate a status report
const report = projectManager.generateStatusReport(project.id, 'Week 4');
console.log(report.completionPercent); // 0
console.log(report.openRisks);         // 1

// 10. Build the roadmap
const roadmap = projectManager.generateRoadmap(project.id);
console.log(roadmap.milestones[0].milestone.name); // 'Design Handoff'
console.log(roadmap.milestones[0].isOnTrack);      // false (task not done yet)

// 11. Mark milestone achieved after design completion
projectManager.setTaskStatus(designTask.id, 'done');
projectManager.updateMilestone(milestone.id, { status: 'achieved' });

// 12. Archive when complete
projectManager.setProjectStatus(project.id, 'completed');
projectManager.archiveProject(project.id);
```

## Errors

| Code | Description | Remediation |
|---|---|---|
| `VALIDATION_FAILED` | A required field is missing, empty, or has an invalid value. | Read the error message to identify which field failed and supply a correct value. |
| `NOT_FOUND` | No entity exists with the provided ID. | Confirm the ID is correct; use the appropriate `list*` function to browse available IDs. |

## Changelog

### [0.1.0] — 2026-06-26

- Initial release of Project Manager Skill.
- Full project CRUD: `createProject`, `getProject`, `updateProject`, `setProjectStatus`, `archiveProject`, `listProjects`.
- Task management: `createTask`, `getTask`, `updateTask`, `setTaskStatus`, `logHours`, `listTasks`.
- Milestone tracking: `createMilestone`, `getMilestone`, `updateMilestone`, `listMilestones`.
- Risk management: `createRisk`, `getRisk`, `updateRisk`, `listRisks`.
- Resource allocation: `createResource`, `getResource`, `consumeResource`, `listResources`.
- Health scoring with schedule, blocker, and risk factors: `scoreHealth`.
- Status report generation: `generateStatusReport`.
- Roadmap generation with on-track analysis: `generateRoadmap`.
- Automatic health and completion refresh on every project mutation.
