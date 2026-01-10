# Usage Guide

## Running the Workflow

```bash
/study-planner-workflow <task description>
```

## What Happens

1. Orchestrator reads your task
2. Executes agents in sequence
3. Each agent produces output files
4. Orchestrator validates all outputs
5. Shows final summary

## Input Guidelines

### Good Task Descriptions

- **Be specific**: "Implement user authentication with JWT tokens"
- **Provide context**: "Add a dashboard page that shows user statistics"
- **Set constraints**: "Use React hooks, no class components"

### Bad Task Descriptions

- Too vague: "Make it work"
- Too broad: "Build an app"
- Missing context: "Add the feature"

## Output Locations

| Type | Location |
|------|----------|
| Agent outputs | `.claude.config/study-planner-workflow/docs/` |
| Execution logs | `.claude.config/study-planner-workflow/logs/` |
| State files | `.claude.config/study-planner-workflow/states/` |

## Advanced Usage

### Running Specific Phases

You can ask the orchestrator to run specific phases:

```bash
/study-planner-workflow "Only run the analysis phase"
/study-planner-workflow "Skip validation and go to implementation"
```

### Debugging

To see detailed execution info:

```bash
# Watch logs in real-time
tail -f .claude.config/study-planner-workflow/logs/workflow-execution.log

# Check iteration count
cat .claude.config/study-planner-workflow/states/.iteration
```

### Resuming Failed Workflows

If a workflow fails partway through:

```bash
/study-planner-workflow "Continue from where we left off"
```

The orchestrator will read the state files and resume.

## Troubleshooting

### Workflow doesn't start

1. Check `.claude/commands/study-planner-workflow.md` exists
2. Verify `.claude/CLAUDE.md` is present
3. Restart Claude Code

### Agents not being called

1. Check agent files in `.claude/agents/`
2. Ensure Task tool is available
3. Try explicitly: "Use Task tool to call @agent-name"

### Output files missing

1. Check the docs folder: `.claude.config/study-planner-workflow/docs/`
2. Review execution log for errors
3. Verify agent completed successfully

### Infinite loop

1. Check feedback loop conditions
2. Review `.iteration` file (should increment)
3. Set max iterations in workflow if needed
