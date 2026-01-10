# Structured Development: fullstack - Quick Start Guide

이 가이드는 3분 안에 워크플로우를 실행할 수 있도록 도와줍니다.

## 전제 조건

- ✅ Claude Code CLI가 설치되어 있어야 합니다
- ✅ 터미널에서 명령을 실행할 수 있어야 합니다

## Step 1: 압축 해제 및 이동

```bash
# ZIP 파일 압축 해제
unzip study-planner-workflow-workflow.zip

# 디렉토리 이동
cd study-planner-workflow
```

## Step 2: 설치 (선택사항)

초기화 스크립트를 실행하면 필요한 설정이 자동으로 완료됩니다.

```bash
chmod +x install.sh
./install.sh
```

**이 단계에서 수행되는 작업:**
- Claude Code 설정 파일 복사
- 권한 설정
- 필요한 디렉토리 생성

## Step 3: 실행

이제 Claude Code에서 워크플로우를 실행할 수 있습니다!

```bash
# 기본 실행
/study-planner-workflow "작업 설명을 여기에 입력하세요"

# 예제
/study-planner-workflow "사용자 인증 기능을 구현해주세요"
```

## 🎯 다음 단계

워크플로우가 실행되면:

1. **오케스트레이터**가 작업을 분석합니다
2. 필요한 **에이전트들**이 순차적으로 실행됩니다
3. 결과가 통합되어 표시됩니다

## 📊 실행 로그 확인

실행 로그는 다음 위치에 저장됩니다:

```bash
cat .claude.config/study-planner-workflow/docs/workflow-execution.log
```

## ❓ 문제가 생겼나요?

### 워크플로우가 실행되지 않아요

```bash
# 구조 검증
./validate.sh

# .claude 디렉토리 확인
ls -la .claude/commands/
ls -la .claude/agents/
```

### 에이전트를 찾을 수 없어요

- `.claude/agents/` 디렉토리에 모든 에이전트 파일이 있는지 확인
- 파일 이름이 올바른지 확인

### 더 자세한 도움이 필요해요

```bash
# 상세 문서 확인
cat .claude.config/study-planner-workflow/docs/USAGE.md
cat .claude.config/study-planner-workflow/docs/ORCHESTRATOR.md
```

---

**Tip**: 처음 실행 시 시간이 걸릴 수 있습니다. 인내심을 가지고 기다려주세요!
