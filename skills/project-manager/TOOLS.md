# Tools — Project Manager

Integration reference for tools that Project Manager consumes, produces data for, or operates alongside.

---

## Upstream Tools (Inputs to Project Manager)

These tools generate work or data that Project Manager tracks.

### Knowledge Manager (`knowledge-manager`)

| Integration Point | Details |
|---|---|
| **Purpose** | Store project briefs, retrospectives, decision records, and postmortems as knowledge entries |
| **How to use** | After creating a project brief document, index it in Knowledge Manager with `type: 'decision'` and tags matching the project |
| **Relationship** | Project Manager tracks execution; Knowledge Manager stores institutional memory |

**Example flow:**
```typescript
// After completing a project retrospective, index it
knowledgeManager.create({
  title: `Retrospective: ${project.name}`,
  content: retrospectiveText,
  type: 'decision',
  status: 'active',
  tags: ['retrospective', ...project.tags],
  author: project.owner,
  version: '0.1.0',
  relationships: [],
  citations: [],
  metadata: { projectId: project.id },
});
```

### Prompt Architect (`prompt-architect`)

| Integration Point | Details |
|---|---|
| **Purpose** | Generate structured project prompts, briefs, and task descriptions using AI |
| **How to use** | Use Prompt Architect to draft the initial `description` field for projects and tasks |
| **Relationship** | Prompt Architect produces the content; Project Manager stores the plan |

### Agent Orchestrator (`agent-orchestrator`)

| Integration Point | Details |
|---|---|
| **Purpose** | Trigger multi-agent execution pipelines from project task states |
| **How to use** | When a task transitions to `in-progress`, the orchestrator routes it to the correct specialist agent |
| **Relationship** | Project Manager is the source of truth for task status; Orchestrator handles execution |

---

## Downstream Tools (Consumers of Project Manager Data)

These tools read project data to drive their own behavior.

### AI Video Director (`ai-video-director`)

| Integration Point | Details |
|---|---|
| **Purpose** | Receives video production tasks from Project Manager |
| **Data consumed** | Task `title`, `description`, `assignee`, `dueDate`, and `priority` |
| **Status updates** | Video Director signals completion; task is moved to `done` via `setTaskStatus` |

### AI Image Director (`ai-image-director`)

| Integration Point | Details |
|---|---|
| **Purpose** | Receives image and visual asset production tasks from Project Manager |
| **Data consumed** | Task details including linked milestone success criteria |
| **Status updates** | Image Director signals asset delivery; task is moved to `done` |

### Memory System (`memory-system`)

| Integration Point | Details |
|---|---|
| **Purpose** | Persists project state across sessions |
| **Data written** | Active project IDs, recent task transitions, open blockers |
| **Data read** | Restores project context at session start |

---

## Reporting Integrations

### Status Report → Stakeholder Communication

The `StatusReport` object produced by `generateStatusReport` maps to common external formats:

| `StatusReport` Field | Email / Slack | Dashboard Widget |
|---|---|---|
| `health` | Color indicator in subject line | RAG status badge |
| `completionPercent` | Progress bar text | Progress ring |
| `recentAccomplishments` | "Wins this week" section | Achievement feed |
| `issues` | "Issues and blockers" section | Alert list |
| `nextSteps` | "Up next" section | Sprint backlog preview |

### Roadmap → Visual Planning Tools

The `Roadmap` object produced by `generateRoadmap` maps directly to Gantt-style views:

| `RoadmapMilestone` Field | Gantt Column |
|---|---|
| `milestone.name` | Row label |
| `milestone.dueDate` | Target date marker |
| `milestone.status` | Row color (upcoming = blue, achieved = green, missed = red) |
| `isOnTrack` | On-track indicator |
| `tasks` | Sub-row list |
| `riskCount` | Risk badge count |

---

## Tool Dependency Matrix

| Tool | Direction | Data Exchanged |
|---|---|---|
| `knowledge-manager` | Bidirectional | Project briefs in; retrospectives out |
| `prompt-architect` | Inbound | Generates task and project descriptions |
| `agent-orchestrator` | Outbound | Sends task assignments to specialist agents |
| `ai-video-director` | Outbound | Sends video production tasks |
| `ai-image-director` | Outbound | Sends image production tasks |
| `memory-system` | Bidirectional | Persists and restores project state |

---

## Environment Variables

Project Manager reads no environment variables in the current version. Any future integration requiring API keys must declare them here with a description, default value, and security guidance.

---

## Permissions

Project Manager requires no elevated permissions. All data is stored in memory within the Skill's process. Future versions that persist to a database must declare the required database access permissions in `skill.json`.
