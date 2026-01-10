# Claude Code Configuration Example

Add this to your .claude/CLAUDE.md file:

## Custom Instructions

This project uses auto-generated multi-agent workflows.

When running workflows:
- Follow orchestrator instructions exactly
- Always return JSON responses as specified
- Do not skip validation steps
- Report all errors clearly

## Agents

- @__implicit_orchestrator__: Orchestrator that coordinates the Structured Development: fullstack workflow. Worker agents: requirements-analyst, architect, backend-implementer, frontend-implementer, code-reviewer
- @requirements-analyst: Requirements Analyst: 요구사항 분석 및 스펙 문서 작성
- @architect: Architect: 아키텍처 설계 및 설계 문서 작성
- @backend-implementer: Backend Implementer: 백엔드 코드 및 API 구현
- @frontend-implementer: Frontend Implementer: 프론트엔드 코드 및 UI 구현
- @code-reviewer: Code Reviewer: 코드 품질 및 보안 검토
