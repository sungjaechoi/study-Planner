---
description: Structured Development: fullstack workflow
argument-hint: <task description>
---

# Structured Development: fullstack

Request: $ARGUMENTS

---

## 🚨🚨🚨 ABSOLUTE RULES - READ THIS FIRST 🚨🚨🚨

### ⛔ YOU ARE AN ORCHESTRATOR, NOT A WORKER ⛔

**YOU MUST NEVER DO THE ACTUAL WORK YOURSELF.**

Your ONLY job is to call agents using the Task tool. You are a **COORDINATOR**.

### ❌ FORBIDDEN ACTIONS (WILL BREAK THE WORKFLOW):

1. **NEVER write code yourself** - Call an agent to write code
2. **NEVER edit files yourself** - Call an agent to edit files
3. **NEVER analyze code yourself** - Call an agent to analyze
4. **NEVER review code yourself** - Call an agent to review
5. **NEVER test code yourself** - Call an agent to test
6. **NEVER create files yourself** - Call an agent to create files
7. **NEVER use Write/Edit/Bash tools for actual work** - Only for state management
8. **NEVER call MCP tools (`mcp__*`)** - MCP is only for agents

### ✅ ALLOWED ACTIONS (ONLY THESE):

1. ✅ Call agents using Task tool
2. ✅ Manage state files (read/write state JSON only)
3. ✅ Coordinate workflow between agents
4. ✅ Pass context between agents

### 🔴 IF YOU CATCH YOURSELF ABOUT TO DO WORK:

**STOP. Call an agent instead.**

Example of WRONG behavior:
- "Let me write this function..." ❌ → Call @implementer instead
- "I'll review the code..." ❌ → Call @reviewer instead
- "I'll fix this bug..." ❌ → Call @debugger instead

**EVERY piece of actual work MUST go through an agent via Task tool.**

---

## MCP Server Usage Guide

**IMPORTANT: Main (you) must NOT call MCP tools directly!**

MCP tools can only be used by agents with the appropriate permissions.

### Agents with MCP Permissions

| Server | Assigned Agent(s) | Required Env Vars |
|--------|-------------------|-------------------|
| GitHub | @requirements-analyst, @architect, @backend-implementer, @frontend-implementer, @code-reviewer | `GITHUB_TOKEN` |

### MCP Rules

1. **Main cannot call MCP tools directly** - `mcp__*` tools are for agents only
2. **Delegate MCP tasks to assigned agents** - Use Task tool to invoke the agent
3. **On MCP errors** - If agent reports error, ask user to verify environment variables

### Handling MCP Not Configured

If an agent reports MCP connection failure:
- Inform user: "MCP server configuration is required"
- Provide required environment variables: `GITHUB_TOKEN`
- Ask user if proceeding without MCP is acceptable

---

## ▶️ Execute Now

```
Task(__implicit_orchestrator__, "INIT: $ARGUMENTS")
```

After executing the above command, extract the `[UPDATED_STATE]` JSON from the Orchestrator's response and save it to the state file.

---

## ⚙️ Workflow Execution - Orchestrator-Executor Pattern (v12.3)

This workflow uses the **Orchestrator-Executor Pattern**:
- **Orchestrator**: Decide next action + **Intent analysis** (record in state file)
- **Main (you)**: Execute actual Task calls


**State File Directory**: `.claude.config/study-planner-workflow/states/`
**State File Format**: `.claude.config/study-planner-workflow/states/workflow-state-*.json`
**Worker Agents**: @requirements-analyst, @architect, @backend-implementer, @frontend-implementer, @code-reviewer
**👤 Human Approval Agents**: (none)

### Execution Phases
- Phase 1: requirements-analyst
- Phase 2: architect
- Phase 3: backend-implementer
- Phase 4: frontend-implementer
- Phase 5: code-reviewer


---

## 📁 State File Management (v7.7)

### State File Storage Location
```
.claude.config/study-planner-workflow/states/
├── 20241208-143052_login-feature-development.json
├── 20241208-151230_signup-implementation.json
└── 20241209-091500_bug-fix.json
```

### State File Naming Rules
`{YYYYMMDD-HHmmss}_{request-summary}.json`

- **Timestamp**: Workflow start time
- **Request Summary**: Key keywords from user request (max 30 chars, Korean/English allowed)

### State File Selection Logic

**1. When Starting New Workflow:**
```bash
# Create directory (if not exists)
mkdir -p .claude.config/study-planner-workflow/states

# Create new state file
STATE_FILE=".claude.config/study-planner-workflow/states/$(date '+%Y%m%d-%H%M%S')_{request-summary}.json"
```

**2. When Resuming/Partial Execution of Existing Workflow:**
```bash
# Check existing state file list
ls -la .claude.config/study-planner-workflow/states/

# Select most recent or related state file
```

**3. State File Selection Criteria:**
- Resume request + specific task mentioned → Select that task's state file
- Resume request + no specific mention → Select most recent state file
- New task → Create new state file

---

## Available Skills

The following skills are available to worker agents in this workflow.
Skills are **auto-invoked** by Claude when tasks match their purpose.

- **React Analyzer** (`.claude/skills/react-analyzer/SKILL.md`)

---

## Step 0: Intent Analysis and State File Determination (⭐ v7.7)

**After analyzing user request, determine appropriate command and state file:**

```
1. Check existing state file list:
   ls .claude.config/study-planner-workflow/states/

2. Determine state file:
   IF new task request:
       STATE_FILE = ".claude.config/study-planner-workflow/states/$(date '+%Y%m%d-%H%M%S')_{request-summary}.json"
       STATE_CONTENT = null (starting fresh)
   ELSE IF specific task resumption request:
       STATE_FILE = that task's state file
       STATE_CONTENT = Read(STATE_FILE)
   ELSE IF general resumption request:
       STATE_FILE = most recent state file
       STATE_CONTENT = Read(STATE_FILE)
```

**Decision Criteria**:
- `RESUME`: Keywords like "continue", "resume", "restart", "finish" + existing state file exists
- `PARTIAL`: Specific agent name mentioned, "only", "just", "~only" etc
- `INIT`: New task, "from scratch", "complete", "new" etc

---

## Step 1: Workflow Initialization (v7.7 Content-Based)

### 1.1 Determine State File

```bash
# Check/create directory
mkdir -p .claude.config/study-planner-workflow/states

# Check existing state file list
ls .claude.config/study-planner-workflow/states/
```

### 1.2 Determine State File Path and Read Content

**For new task:**
```bash
STATE_FILE=".claude.config/study-planner-workflow/states/$(date '+%Y%m%d-%H%M%S')_{request-summary}.json"
# No STATE_CONTENT (Orchestrator initializes)
```

**For resume/partial execution:**
```
STATE_FILE=".claude.config/study-planner-workflow/states/{existing-file}.json"
STATE_CONTENT = Read(STATE_FILE)  # Read content
```

### 1.3 Request to Orchestrator (⭐ State Content Transfer Method)

**Select appropriate command based on intent analysis result:**

| Situation | Command |
|------|------|
| New task (full execution) | `Task(__implicit_orchestrator__, "INIT: $ARGUMENTS")` |
| Execute specific agent only | `Task(__implicit_orchestrator__, "PARTIAL: $ARGUMENTS\n\n[CURRENT_STATE]\n{STATE_CONTENT}")` |
| Resume previous task | `Task(__implicit_orchestrator__, "RESUME: $ARGUMENTS\n\n[CURRENT_STATE]\n{STATE_CONTENT}")` |

**⚠️ Important**: Pass **state file content** (not file path) to Orchestrator.

→ Orchestrator **analyzes intent** to determine `execution_mode`, and returns updated state JSON in response.
→ **Main writes the returned state to `${STATE_FILE}`**.

**Log Recording:**
```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Workflow Structured Development: fullstack - STARTED" >> .claude.config/study-planner-workflow/logs/workflow-execution.log
```

---

## Step 2: Execution Loop (v7.7 Content-Based)

**Repeat the following until `status` becomes `"COMPLETED"` or `"FAILED"`:**

### 2.1 Extract and Save State from Orchestrator Response

**Orchestrator returns updated state JSON in response.**

```
ORCHESTRATOR_RESPONSE = result of Task(...)
STATE_JSON = extract JSON from ORCHESTRATOR_RESPONSE
Write(${STATE_FILE}, STATE_JSON)  # Main saves to state file
```

### 2.2 Check Status

- `status === "COMPLETED"` → Move to **Step 3**
- `status === "FAILED"` → Handle error and terminate
- `status === "IN_PROGRESS"` → Continue

### 2.3 Extract Next Action (v12.3 Parallel Support)

Check the following information in the `next_action` field:

**For Sequential Execution** (`type: "sequential"`):
- `type`: "sequential"
- `agents`: Array with single agent object
- `agents[0].agent`: Agent ID to call
- `agents[0].instruction`: Instructions to pass

**For Parallel Execution** (`type: "parallel"`):
- `type`: "parallel"
- `agents`: Array of agent objects to execute simultaneously
- Each `agents[n].agent`: Agent ID
- Each `agents[n].instruction`: Agent-specific instructions
- `aggregation_strategy`: "all_must_pass" | "any_pass" | "majority"

### 2.4 Call Worker Agent(s) (v12.3 Parallel Support)

**Check `next_action.type` to determine execution method:**

**IF `type === "parallel"`:**
```
⚡ CRITICAL: Execute ALL agents in a SINGLE response!

// Call all agents SIMULTANEOUSLY (in ONE message):
Task({next_action.agents[0].agent}, "{next_action.agents[0].instruction}")
Task({next_action.agents[1].agent}, "{next_action.agents[1].instruction}")
... (repeat for all agents in the array)

// All Task calls MUST be in the SAME message.
// Do NOT call them one by one in separate responses!
```

**IF `type === "sequential"` (or type not specified):**
```
Task({next_action.agents[0].agent}, "{next_action.agents[0].instruction}")
```

Include `context.previous_results` and `context.required_documents` when passing context.

### 2.4.1 👤 Human Approval Check (v11.5)

**After agent execution**, check if `next_action.human_approval` exists:

```
IF next_action.human_approval.enabled == true:
    Use AskUserQuestion tool:

    question: {next_action.human_approval.question}
    options: {next_action.human_approval.options}

    Based on user response:
    - "Approve" → Continue to Step 2.5
    - "Revise" → Report rejection, Orchestrator routes to target agent
    - "Cancel/Abort" → Report abort, set status to FAILED
```

**⚠️ Important**: Human Approval is now an **Agent property**, not a separate node.
Agents with Human Approval enabled will have `human_approval` in their `next_action`.

### 2.5 Collect Results (v12.3 Parallel Support)

Collect agent execution results:
- Success status (`success`)
- Result summary (`summary`)
- Modified file list (`files_modified`)

**For Parallel Execution**: Collect results from ALL agents before proceeding.

### 2.6 Request Evaluation from Orchestrator (⭐ v12.3 Parallel Support)

**For Sequential Execution:**
```
STATE_CONTENT = Read(${STATE_FILE})

Task(__implicit_orchestrator__, "EVALUATE: {phase: N, type: 'sequential', results: [{agent: '{agent_id}', success: true/false, summary: '...', files_modified: [...]}]}

[CURRENT_STATE]
{STATE_CONTENT}")
```

**For Parallel Execution:**
```
STATE_CONTENT = Read(${STATE_FILE})

Task(__implicit_orchestrator__, "EVALUATE: {phase: N, type: 'parallel', results: [
  {agent: '{agent1_id}', success: true/false, summary: '...', files_modified: [...]},
  {agent: '{agent2_id}', success: true/false, summary: '...', files_modified: [...]},
  ... (all parallel agents)
]}

[CURRENT_STATE]
{STATE_CONTENT}")
```

→ Orchestrator evaluates results and **returns updated state JSON in response**.
→ For parallel: Orchestrator aggregates results based on `aggregation_strategy`.
→ **Main writes the returned state to `${STATE_FILE}`**.

### 2.7 Loop Repeat

Return to **Step 2.1** and repeat.

---

## Step 3: Completion Handling

### Check Final Result from State File

```
Read(${STATE_FILE})
```

Check the contents of the `final_result` field and output the final result.

**Log Recording:**
```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Workflow Structured Development: fullstack - COMPLETED" >> .claude.config/study-planner-workflow/logs/workflow-execution.log
```

---

## ⚠️ Important Rules

1. **Never directly decide Worker agents**
   - Always follow `next_action` from `workflow-state.json`

2. **Do not arbitrarily terminate the loop**
   - Continue until `status` becomes `"COMPLETED"` or `"FAILED"`

3. **Always report results to Orchestrator**
   - Always call `EVALUATE` command after Worker execution

4. **Feedback Loop Handling**
   - If Orchestrator sets `feedback_loop.active: true`
   - Re-invoke that agent with feedback

5. **👤 Human Approval Handling (v11.5)**
   - Check `next_action.human_approval` after each agent execution
   - If `human_approval.enabled === true` → Use **AskUserQuestion** tool
   - Based on user response:
     - **Approve** → Report success to Orchestrator, proceed to next step
     - **Revise** → Report rejection with `targetNodeId`, Orchestrator routes back
     - **Abort** → Report abort, Orchestrator will set status to FAILED

---

## 📋 workflow-state.json Structure (v12.3 Parallel Support)

```json
{
  "workflow_id": "wf-...",
  "workflow_name": "Structured Development: fullstack",
  "status": "IN_PROGRESS",
  "phase": 1,
  "total_phases": 5,
  "execution_phases": [
      {
          "phase": 1,
          "type": "sequential",
          "agents": [
              "requirements-analyst"
          ]
      },
      {
          "phase": 2,
          "type": "sequential",
          "agents": [
              "architect"
          ]
      },
      {
          "phase": 3,
          "type": "sequential",
          "agents": [
              "backend-implementer"
          ]
      },
      {
          "phase": 4,
          "type": "sequential",
          "agents": [
              "frontend-implementer"
          ]
      },
      {
          "phase": 5,
          "type": "sequential",
          "agents": [
              "code-reviewer"
          ]
      }
  ],
  "next_action": {
    "type": "sequential | parallel",
    "agents": [
      {
        "agent": "agent-id",
        "instruction": "task instructions"
      }
    ],
    "aggregation_strategy": "all_must_pass",
    "context": {
      "original_request": "$ARGUMENTS",
      "previous_results": [],
      "required_documents": []
    },
    "expected_output": {
      "format": "json",
      "required_fields": ["success", "summary", "files_modified"]
    },
    "human_approval": null
  },
  "completed_phases": [],
  "phase_results": {},
  "feedback_loop": null,
  "final_result": null
}
```

**Key Fields:**
- `execution_phases`: Pre-defined phases with sequential/parallel type
- `next_action.type`: "sequential" (default) or "parallel"
- `next_action.agents`: Array of agent objects (single for sequential, multiple for parallel)
- `next_action.aggregation_strategy`: For parallel phases - "all_must_pass" | "any_pass" | "majority"
- `phase_results`: Results organized by phase number

---

**Generated by Claude Workflow Builder v12.3**

