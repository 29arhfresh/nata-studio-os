# Project Manager

The project lifecycle engine of Nata Studio OS — the single coordination layer for planning, executing, tracking, and closing every project across the platform.

## What This Skill Does

Project Manager gives every team and Skill a structured, queryable model of ongoing work. It turns raw ideas into tracked projects with tasks, milestones, risks, and resources — and keeps everything synchronized through automatic health scoring and progress reporting.

Core capabilities:

- **Project lifecycle** — create, activate, hold, complete, cancel, and archive projects
- **Task planning** — create tasks with priorities, estimates, assignees, due dates, and dependencies
- **Milestones** — define outcomes with success criteria and link tasks to each milestone
- **Risk management** — log risks with probability, impact, and mitigation plans; track status over time
- **Resource allocation** — allocate and track consumption of budget, time, human, and tool resources
- **Execution tracking** — log hours, advance task statuses, and record blocker reasons
- **Health scoring** — automatic `green / yellow / red` scoring based on schedule, blockers, and risks
- **Status reports** — generate period-based reports with completion metrics, issues, and next steps
- **Roadmaps** — produce milestone-ordered views showing linked tasks and on-track status
- **Project archive** — soft-archive completed projects while keeping data available for retrieval

## When to Use This Skill

Use Project Manager when you need to:

- Track a new initiative from idea through delivery
- Break down a goal into tasks with priorities and owners
- Define checkpoints and measure whether the project is on schedule
- Identify, assess, and mitigate risks before they materialize
- Allocate a budget or time pool and record consumption against it
- Generate a weekly status report for stakeholders
- Build a milestone-based roadmap for planning discussions
- Close out a completed project and retain its history

## Skill Files

| File | Purpose |
|---|---|
| `SKILL.md` | Full API documentation, parameter tables, examples, and changelog |
| `SYSTEM_PROMPT.md` | Persona and behavioral instructions for AI-assisted project management |
| `WORKFLOW.md` | End-to-end project lifecycle pipeline with decision gates |
| `CHECKLIST.md` | Pre-launch, in-flight, and closure checklists for every project phase |
| `EXAMPLES.md` | Annotated real-world patterns by project type |
| `TOOLS.md` | Integration reference for upstream and downstream tools |
| `TROUBLESHOOTING.md` | Failure mode diagnosis and recovery strategies |
| `templates/` | Ready-to-use templates for every project document type |

## Quick Start

```typescript
import projectManager from './src/index';

// 1. Start a project
const project = projectManager.createProject({
  name: 'Campaign Launch',
  description: 'Q4 product campaign across all channels.',
  priority: 'high',
  owner: 'marketing',
  startDate: '2026-10-01',
  targetEndDate: '2026-12-15',
});

// 2. Add a task
const task = projectManager.createTask({
  projectId: project.id,
  title: 'Write campaign brief',
  description: 'Define goals, audience, messaging, and budget.',
  priority: 'critical',
  assignee: 'brand-strategist',
  estimatedHours: 8,
});

// 3. Check project health
const health = projectManager.scoreHealth(project.id);
console.log(health.score); // 'green'

// 4. Generate a status report
const report = projectManager.generateStatusReport(project.id, 'Week 1');
console.log(report.completionPercent); // 0
```

## Core Principles

**Every project is a first-class entity.** Each project carries a status, priority, health score, owner, and full history — not just a name and a due date.

**Health is computed, not self-reported.** The health score derives automatically from schedule proximity, blocked task ratio, and open risk scores. No manual override required.

**Blocked tasks are explicit.** Setting a task to `blocked` requires a written reason. Silent blockers are not permitted.

**Resources are allocated before they are consumed.** Allocation and consumption are tracked separately so over-runs are visible before they become problems.

**Archiving preserves history.** Archived projects are hidden from default queries but their data remains fully accessible for retrospectives and reporting.
