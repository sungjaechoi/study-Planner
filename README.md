# Structured Development: fullstack

> 9단계 AI Agent 기반 코드 작성 프로세스 - Please create a workflow that analyzes user requirements, performs backend tasks, validates them, then does frontend tasks, validates those, performs integration validation, and finishes.

## 🚀 Quick Start (3 steps)

1. **압축 해제**
   ```bash
   unzip study-planner-workflow-workflow.zip
   cd study-planner-workflow
   ```

2. **초기화 스크립트 실행** (선택사항)
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. **Claude Code에서 실행**

   Claude Code를 열고 다음과 같이 실행하세요:

   ```bash
   /study-planner-workflow "작업 설명"
   ```

## 💡 사용 방법 및 예제

### 기본 사용법

Claude Code CLI에서 슬래시 커맨드로 워크플로우를 실행합니다:

```bash
/study-planner-workflow "여기에 원하는 작업을 자세히 설명하세요"
```

### 📝 실제 사용 예제

**예제 1: 간단한 요청**
```bash
/study-planner-workflow "사용자 로그인 기능을 구현해주세요"
```

**예제 2: 상세한 요청**
```bash
/study-planner-workflow "이메일과 비밀번호로 로그인하는 API를 만들어주세요. JWT 토큰을 발급하고, 비밀번호는 bcrypt로 해싱해야 합니다."
```

**예제 3: 복잡한 작업**
```bash
/study-planner-workflow "쇼핑몰 장바구니 기능 전체를 구현해주세요. 상품 추가, 삭제, 수량 변경, 총 금액 계산이 필요합니다."
```

### 🎯 효과적인 요청 작성 팁

1. **구체적으로 작성하세요**
   - ❌ "회원가입 만들어줘"
   - ✅ "이메일 중복 체크를 포함한 회원가입 API와 프론트엔드 폼을 만들어주세요"

2. **필요한 기술 스택을 명시하세요**
   - "React와 TypeScript로 대시보드를 만들어주세요"
   - "PostgreSQL을 사용하는 REST API를 구현해주세요"

3. **제약사항이 있다면 함께 알려주세요**
   - "모바일에서도 잘 보이도록 반응형으로 만들어주세요"
   - "페이지네이션은 커서 기반으로 구현해주세요"

### 🔄 실행 흐름

1. **명령어 입력**: Claude Code에서 `/study-planner-workflow` 실행
2. **작업 분석**: 오케스트레이터가 요청 분석
3. **에이전트 실행**: 필요한 에이전트들이 순차/병렬로 작업 수행
4. **결과 확인**: 생성된 코드와 파일 확인

### 📊 진행 상황 모니터링

실행 중 로그를 확인하려면:

```bash
# 실시간 로그 확인
tail -f .claude.config/study-planner-workflow/docs/workflow-execution.log

# 전체 로그 보기
cat .claude.config/study-planner-workflow/docs/workflow-execution.log
```

## 📋 포함된 에이전트 (6개)

- **@__implicit_orchestrator__** 🎯 **Orchestrator**: Orchestrator that coordinates the Structured Development: fullstack workflow. Worker agents: requirements-analyst, architect, backend-implementer, frontend-implementer, code-reviewer
- **@requirements-analyst** : Requirements Analyst: 요구사항 분석 및 스펙 문서 작성
- **@architect** : Architect: 아키텍처 설계 및 설계 문서 작성
- **@backend-implementer** : Backend Implementer: 백엔드 코드 및 API 구현
- **@frontend-implementer** : Frontend Implementer: 프론트엔드 코드 및 UI 구현
- **@code-reviewer** : Code Reviewer: 코드 품질 및 보안 검토

## 📁 프로젝트 구조

```
study-planner-workflow/
├── README.md (이 파일)
├── QUICKSTART.md
├── install.sh
├── .claude/
│   ├── commands/study-planner-workflow.md
│   ├── agents/
│   └── CLAUDE.md
└── claude.config/
    └── study-planner-workflow/
        ├── docs/
        │   ├── ORCHESTRATOR.md
        │   ├── ARCHITECTURE.md
        │   ├── USAGE.md
        │   └── workflow-execution.log
        ├── devcontainer/ (선택적)
        ├── scripts/
        ├── workflow-metadata.json
        └── workflow-runtime.json (FeedbackLoop 사용 시)
```

## 📚 자세한 문서

- **[QUICKSTART.md](./QUICKSTART.md)**: 빠른 시작 가이드
- **[ORCHESTRATOR.md](.claude.config/study-planner-workflow/docs/ORCHESTRATOR.md)**: 오케스트레이터 설명
- **[USAGE.md](.claude.config/study-planner-workflow/docs/USAGE.md)**: 사용법 가이드
- **[ARCHITECTURE.md](.claude.config/study-planner-workflow/docs/ARCHITECTURE.md)**: 아키텍처 문서

## ⚙️ 요구사항

- Claude Code CLI
- Node.js 18+ (선택사항, devcontainer 사용 시)

## 🐛 문제 해결

문제가 발생하면 다음을 확인하세요:

1. Claude Code가 올바르게 설치되었는지 확인
2. `.claude` 디렉토리가 올바른 위치에 있는지 확인
3. `./validate.sh`를 실행하여 구조 검증

## 📝 라이선스

이 워크플로우는 ./claude로 생성되었습니다.

---

**생성 정보**
- 워크플로우 버전: 1.0.0
- 생성 일시: 2026. 1. 10. 오후 9:14:02
