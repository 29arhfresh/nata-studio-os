# Examples — Project Manager

Real-world usage patterns organized by project type. Each example shows the complete setup for a common scenario.

---

## Example 1: Creative Campaign

A time-boxed marketing campaign with a fixed deadline and external stakeholders.

```typescript
import projectManager from './src/index';

// Create the project
const campaign = projectManager.createProject({
  name: 'Q4 Holiday Campaign',
  description: 'Multi-channel holiday campaign: video, social, email, and display ads.',
  priority: 'critical',
  owner: 'marketing-director',
  startDate: '2026-10-01',
  targetEndDate: '2026-11-28',
  tags: ['campaign', 'holiday', 'q4'],
});

// Tasks
const brief = projectManager.createTask({
  projectId: campaign.id,
  title: 'Write creative brief',
  description: 'Define campaign goals, target audience, messaging, and budget.',
  priority: 'critical',
  assignee: 'brand-strategist',
  estimatedHours: 8,
  dueDate: '2026-10-07',
});

const video = projectManager.createTask({
  projectId: campaign.id,
  title: 'Produce hero video',
  description: '60-second hero video for YouTube and paid social.',
  priority: 'high',
  assignee: 'ai-video-director',
  estimatedHours: 40,
  dueDate: '2026-10-28',
  dependencies: [brief.id],
});

const assets = projectManager.createTask({
  projectId: campaign.id,
  title: 'Design display ad set',
  description: 'Static and animated display ads in all IAB standard sizes.',
  priority: 'high',
  assignee: 'ai-image-director',
  estimatedHours: 24,
  dueDate: '2026-10-28',
  dependencies: [brief.id],
});

// Milestones
projectManager.createMilestone({
  projectId: campaign.id,
  name: 'Creative Brief Approved',
  description: 'All stakeholders sign off on the creative brief.',
  dueDate: '2026-10-09',
  linkedTasks: [brief.id],
  successCriteria: ['Brief reviewed by marketing director', 'Budget confirmed', 'Key messages approved'],
});

projectManager.createMilestone({
  projectId: campaign.id,
  name: 'Assets Ready for Launch',
  description: 'All creative assets produced, reviewed, and ready to deploy.',
  dueDate: '2026-11-01',
  linkedTasks: [video.id, assets.id],
  successCriteria: ['Hero video exported at 4K', 'All 12 ad sizes exported', 'Legal review complete'],
});

// Risks
projectManager.createRisk({
  projectId: campaign.id,
  title: 'Late brief approval',
  description: 'Delayed sign-off on the creative brief will compress production time.',
  level: 'high',
  probability: 0.5,
  impact: 0.8,
  mitigationPlan: 'Schedule brief review meeting on Day 3; send brief 24 hours in advance.',
  owner: 'brand-strategist',
  reviewDate: '2026-10-08',
});

// Resources
const adBudget = projectManager.createResource({
  projectId: campaign.id,
  name: 'Paid Media Budget',
  type: 'budget',
  allocated: 25000,
  unit: 'USD',
});

// Mark brief complete and log hours
projectManager.setTaskStatus(brief.id, 'done');
projectManager.logHours({ taskId: brief.id, hours: 7 });
projectManager.consumeResource(adBudget.id, 5000);

// Report
const report = projectManager.generateStatusReport(campaign.id, 'Week 1');
console.log(report.completionPercent); // 33
console.log(report.health);            // 'yellow' (high-risk open)
```

---

## Example 2: Software Feature Development

A multi-sprint engineering feature with task dependencies and a technical risk.

```typescript
import projectManager from './src/index';

const feature = projectManager.createProject({
  name: 'Real-Time Collaboration',
  description: 'Add live cursor sharing and conflict-free editing to the canvas.',
  priority: 'high',
  owner: 'engineering-lead',
  startDate: '2026-08-01',
  targetEndDate: '2026-10-31',
  tags: ['engineering', 'canvas', 'q3'],
});

// Sprint 1 tasks
const spec = projectManager.createTask({
  projectId: feature.id,
  title: 'Write technical specification',
  description: 'Define the WebSocket protocol, CRDT choice, and conflict resolution rules.',
  priority: 'critical',
  assignee: 'tech-lead',
  estimatedHours: 16,
  dueDate: '2026-08-08',
});

const protoTask = projectManager.createTask({
  projectId: feature.id,
  title: 'Build WebSocket prototype',
  description: 'Prove that the chosen CRDT library handles 50 concurrent cursors.',
  priority: 'high',
  assignee: 'backend-engineer',
  estimatedHours: 24,
  dependencies: [spec.id],
  dueDate: '2026-08-22',
});

const uiTask = projectManager.createTask({
  projectId: feature.id,
  title: 'Implement cursor UI layer',
  description: 'Render remote cursors with user avatars and smooth interpolation.',
  priority: 'medium',
  assignee: 'frontend-engineer',
  estimatedHours: 20,
  dependencies: [protoTask.id],
  dueDate: '2026-09-12',
});

// Milestones
projectManager.createMilestone({
  projectId: feature.id,
  name: 'Prototype Validated',
  description: 'Technical prototype demonstrates feasibility under realistic load.',
  dueDate: '2026-08-25',
  linkedTasks: [spec.id, protoTask.id],
  successCriteria: [
    '50 concurrent cursors at < 50 ms latency',
    'No data loss under simulated conflict',
    'Tech lead sign-off',
  ],
});

// Risks
projectManager.createRisk({
  projectId: feature.id,
  title: 'CRDT library performance under load',
  description: 'The chosen CRDT library may not scale to 50+ concurrent editors at acceptable latency.',
  level: 'high',
  probability: 0.55,
  impact: 0.85,
  mitigationPlan: 'Benchmark two CRDT libraries in the prototype. Keep fallback operational transform implementation ready.',
  owner: 'tech-lead',
  reviewDate: '2026-08-22',
});

// Resources
projectManager.createResource({
  projectId: feature.id,
  name: 'Engineering Hours',
  type: 'time',
  allocated: 200,
  unit: 'hours',
});

// Advance spec task
projectManager.setTaskStatus(spec.id, 'in-progress');
projectManager.logHours({ taskId: spec.id, hours: 8 });

const roadmap = projectManager.generateRoadmap(feature.id);
console.log(roadmap.milestones[0].isOnTrack); // false (tasks in progress)
```

---

## Example 3: Long-Running Product Roadmap

A multi-quarter product initiative tracked at the milestone level.

```typescript
import projectManager from './src/index';

const product = projectManager.createProject({
  name: 'Nata Studio 3.0',
  description: 'Major platform release with new AI director, improved canvas, and enterprise features.',
  priority: 'critical',
  owner: 'cpo',
  startDate: '2026-01-01',
  targetEndDate: '2026-12-31',
  tags: ['product', 'roadmap', 'annual'],
  metadata: { fiscalYear: 2026, releaseVersion: '3.0.0' },
});

// Q1 milestone
const q1m = projectManager.createMilestone({
  projectId: product.id,
  name: 'Q1: AI Director GA',
  description: 'AI Image Director and AI Video Director reach general availability.',
  dueDate: '2026-03-31',
  successCriteria: ['99.5% uptime for 30 days', 'P50 latency < 3s', 'Documentation complete'],
});

// Q2 milestone
const q2m = projectManager.createMilestone({
  projectId: product.id,
  name: 'Q2: Canvas v2',
  description: 'New canvas engine ships with real-time collaboration and vector export.',
  dueDate: '2026-06-30',
  successCriteria: ['50 concurrent users tested', 'SVG export fidelity > 98%'],
});

// Q3 milestone
projectManager.createMilestone({
  projectId: product.id,
  name: 'Q3: Enterprise Beta',
  description: 'Enterprise tier with SSO, audit logs, and team management in private beta.',
  dueDate: '2026-09-30',
  successCriteria: ['10 design partner accounts onboarded', 'SOC 2 Type I audit initiated'],
});

// Q4 milestone
projectManager.createMilestone({
  projectId: product.id,
  name: 'Q4: 3.0 Launch',
  description: 'Public launch of Nata Studio 3.0.',
  dueDate: '2026-11-30',
  successCriteria: ['Launch blog post published', 'App Store rating ≥ 4.5', 'Press embargo lifted'],
});

// Risks
projectManager.createRisk({
  projectId: product.id,
  title: 'GPU cost overrun',
  description: 'AI inference costs may exceed the annual budget at projected usage growth rates.',
  level: 'medium',
  probability: 0.6,
  impact: 0.6,
  mitigationPlan: 'Implement per-user generation quota; negotiate reserved GPU capacity by Q2.',
  owner: 'cto',
  reviewDate: '2026-02-01',
});

// Annual budget
projectManager.createResource({
  projectId: product.id,
  name: 'Annual Engineering Budget',
  type: 'budget',
  allocated: 1_200_000,
  unit: 'USD',
});

projectManager.setProjectStatus(product.id, 'active');

const health = projectManager.scoreHealth(product.id);
console.log(health.score); // 'yellow' (medium risk open)

const roadmap = projectManager.generateRoadmap(product.id);
console.log(roadmap.milestones.length); // 4
```

---

## Example 4: Emergency Response Project

A short-duration incident response with immediate priority and rapid closure.

```typescript
import projectManager from './src/index';

const incident = projectManager.createProject({
  name: 'P0 — Canvas Data Loss Incident',
  description: 'Investigate and remediate canvas auto-save data loss affecting enterprise tier.',
  priority: 'critical',
  owner: 'on-call-lead',
  startDate: '2026-07-15',
  targetEndDate: '2026-07-17',
  tags: ['incident', 'p0', 'data-loss'],
});

const diagnose = projectManager.createTask({
  projectId: incident.id,
  title: 'Identify root cause',
  description: 'Trace the data loss to a specific commit, service, or race condition.',
  priority: 'critical',
  assignee: 'senior-engineer',
  estimatedHours: 4,
  dueDate: '2026-07-15',
});

const patch = projectManager.createTask({
  projectId: incident.id,
  title: 'Deploy hotfix',
  description: 'Ship the fix to production with zero downtime.',
  priority: 'critical',
  assignee: 'senior-engineer',
  estimatedHours: 2,
  dependencies: [diagnose.id],
  dueDate: '2026-07-16',
});

const postmortem = projectManager.createTask({
  projectId: incident.id,
  title: 'Write postmortem',
  description: 'Document timeline, root cause, impact, and preventive actions.',
  priority: 'high',
  assignee: 'on-call-lead',
  estimatedHours: 4,
  dependencies: [patch.id],
  dueDate: '2026-07-17',
});

projectManager.setProjectStatus(incident.id, 'active');

// Simulate rapid resolution
projectManager.setTaskStatus(diagnose.id, 'done');
projectManager.logHours({ taskId: diagnose.id, hours: 3 });

projectManager.setTaskStatus(patch.id, 'done');
projectManager.logHours({ taskId: patch.id, hours: 2 });

projectManager.setTaskStatus(postmortem.id, 'done');
projectManager.logHours({ taskId: postmortem.id, hours: 4 });

const finalReport = projectManager.generateStatusReport(incident.id, 'Incident Closed');
console.log(finalReport.completionPercent); // 100
console.log(finalReport.health);            // 'green'

projectManager.setProjectStatus(incident.id, 'completed');
projectManager.archiveProject(incident.id);
```
