---
name: react-analyzer
description: Analyzes symbol usage in React/Next.js codebases before refactoring
---

# React Analyzer

Analyzes symbol usage in React/Next.js codebases before refactoring. Finds hooks, components, server actions, and assesses breaking change risk.

## When to Use

Use this skill when modifying shared React code to understand the impact of changes.

## Capabilities

- **Component Analysis**: Find all usages of React components across the codebase
- **Hook Tracking**: Identify custom hooks and their consumers
- **Server Action Detection**: Map server actions and their call sites
- **Breaking Change Assessment**: Evaluate risk level of proposed changes

## Usage Instructions

When this skill is invoked, perform the following analysis:

1. **Identify the target symbol** (component, hook, or server action)
2. **Search for all imports** of the symbol across the codebase
3. **Map usage patterns**:
   - Direct usage in JSX
   - Prop drilling
   - Re-exports
   - Dynamic imports
4. **Assess impact**:
   - Count affected files
   - Identify critical paths
   - Flag breaking changes

## Output Format

```json
{
  "symbol": "ComponentName",
  "type": "component | hook | serverAction",
  "usages": [
    {
      "file": "path/to/file.tsx",
      "line": 42,
      "usageType": "import | jsx | prop | reexport"
    }
  ],
  "impactLevel": "low | medium | high | critical",
  "breakingChanges": ["list of potential breaking changes"],
  "recommendations": ["list of recommendations"]
}
```
