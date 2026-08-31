---
name: Playwright Multi-Agent Ecosystem Registry
description: "Central registry of all Playwright automation agents and skills in the multi-agent system"
last-updated: "2026-08-31"
version: "1.0"
---

# Playwright Multi-Agent Ecosystem - Agent Registry

This file documents all registered agents and skills in the Playwright Multi-Agent Automation System.

---

## Registered Agents (7 Total)

### 1. Playwright Requirement Analyst
**File**: `.github/agents/playwright-requirement-analyst.agent.md`  
**Type**: Discovery Agent  
**Phase**: Requirement Analysis (Phase 1)  
**Responsibility**: Analyze business requirements and explore application to verify automation scope  
**Key Functions**:
- Requirement validation against real application
- Scope definition and acceptance criteria
- Risk identification
- Scenario definition (positive, negative, boundary, alternate)
- Application exploration to verify requirements feasibility

**Invocation**: `@Playwright Requirement Analyst`

---

### 2. Playwright Application Explorer
**File**: `.github/agents/playwright-application-explorer.agent.md`  
**Type**: Discovery Agent  
**Phase**: Application Exploration (Phase 2)  
**Responsibility**: Map application workflows, controls, and behaviors  
**Key Functions**:
- User journey discovery
- Workflow validation
- Control identification
- Validation testing
- Dynamic behavior documentation
- Boundary testing

**Invocation**: `@Playwright Application Explorer`

---

### 3. Playwright Locator Architect
**File**: `.github/agents/playwright-locator-architect.agent.md`  
**Type**: Design Agent  
**Phase**: Locator Architecture (Phase 3)  
**Responsibility**: Design stable, maintainable locators through DOM analysis  
**Key Functions**:
- DOM analysis and accessibility evaluation
- Locator prioritization (getByTestId > role > CSS > XPath)
- Stability scoring
- Fragile pattern detection
- Accessibility-first selector strategy

**Invocation**: `@Playwright Locator Architect`

---

### 4. Playwright Script Generator
**File**: `.github/agents/playwright-script-generator.agent.md`  
**Type**: Implementation Agent  
**Phase**: Script Generation (Phase 4)  
**Responsibility**: Generate production-ready Playwright test scripts  
**Key Functions**:
- Hybrid framework generation (Page Object Model + Data-Driven)
- 5-layer architecture implementation
- Business-readable test implementation
- Enterprise-grade code generation
- Reusability and scalability

**Invocation**: `@Playwright Script Generator`

---

### 5. Playwright Framework Reviewer
**File**: `.github/agents/playwright-framework-reviewer.agent.md`  
**Type**: Quality Gate Agent  
**Phase**: Framework Review (Phase 5)  
**Responsibility**: Audit generated framework for enterprise-grade quality  
**Key Functions**:
- Architecture validation
- Separation of concerns review
- Hardcoded data detection
- Maintainability assessment
- Quality gatekeeping (approval/rejection)
- Framework audit (16-point checklist)

**Invocation**: `@Playwright Framework Reviewer`

---

### 6. Playwright Self-Healing Engineer
**File**: `.github/agents/playwright-self-healing-engineer.agent.md`  
**Type**: Recovery Agent  
**Phase**: Self-Healing & Recovery (Phase 7)  
**Responsibility**: Investigate failures and provide framework-compliant fixes  
**Key Functions**:
- Root cause analysis
- Failure investigation using Playwright MCP
- Test reproduction
- Self-healing recommendations
- Framework-compliant fix generation
- 9 failure categories (locator, sync, assertion, data, network, frame, popup, dialog, app/framework)

**Invocation**: `@Playwright Self-Healing Engineer`

---

### 7. Playwright Reporting Architect
**File**: `.github/agents/playwright-reporting-architect.agent.md`  
**Type**: Reporting Agent  
**Phase**: Reporting (Phase 8)  
**Responsibility**: Generate professional, multi-format execution reports  
**Key Functions**:
- HTML report generation and validation
- Allure report installation, generation, and opening
- Execution summary creation
- Failure analysis and categorization
- Automation health assessment
- Stability assessment
- Recommendation generation
- Evidence validation (screenshots, traces, videos)

**Invocation**: `@Playwright Reporting Architect`

---

## Registered Skills (2 Total)

### 1. Playwright Agent Runtime (Orchestration Skill)
**File**: `.github/skills/playwright-agent-runtime/SKILL.md`  
**Type**: Orchestration Skill  
**Responsibility**: Manage complete 8-phase lifecycle and coordinate all 6 agents  
**Key Functions**:
- Workflow orchestration
- Agent routing and handoff management
- Approval gate enforcement
- Retry and recovery limit management
- State tracking
- Failure routing
- Escalation trigger management
- Completion verification

**Invocation**: `@Playwright Agent Runtime`

**8-Phase Workflow**:
```
Phase 1: Requirement Analysis (Requirement Analyst)
Phase 2: Application Exploration (Application Explorer)
Phase 3: Locator Architecture (Locator Architect)
Phase 4: Script Generation (Script Generator)
Phase 5: Framework Review (Framework Reviewer) [Approval Gate]
Phase 6: Test Execution (Execution Engine)
Phase 7: Self-Healing & Recovery (Self-Healing Engineer) [If failures]
Phase 8: Reporting (Reporting Architect) [Always]
```

---

## System Architecture

### Orchestration Flow
```
┌──────────────────────────────────────────────────┐
│   PLAYWRIGHT AGENT RUNTIME (Orchestrator Skill)  │
│                                                  │
│  Manages 8-phase workflow:                       │
│  - Agent routing                                 │
│  - Approval gates                                │
│  - Retry limits                                  │
│  - State tracking                                │
│  - Escalation                                    │
└──────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼────┐      ┌────▼────┐      ┌───▼────┐
    │ Discovery   │  │ Design  │      │Quality │
    │  Agents     │  │ Agents  │      │ Gate   │
    └────┬────┘   │  └────┬────┘      └───┬────┘
         │        │       │                │
    ┌────▼────────▼───┬───▼────────┬──────▼────┐
    │ 1. Req. Analyst │ 2. App Ex. │ 3. Locator│
    │ 4. Script Gen.  │ 5. Reviewer│ 6. Healing│
    │ 7. Reporting    │            │           │
    └─────────────────┴────────────┴───────────┘
```

### Data Flow
```
User Requirement
        │
        ▼
[Phase 1-7 Agent Outputs ← Playwright MCP Exploration Data]
        │
        ▼
[Phase 8: Reporting Architect]
        │
        ├─ HTML Report
        ├─ Allure Report
        ├─ Execution Summary
        ├─ Failure Analysis
        ├─ Health Assessment
        └─ Recommendations
        │
        ▼
Professional Reporting Artifacts
```

---

## Quality Standards

All agents must comply with:

### ✅ Mandatory Practices
- Use Playwright MCP for exploration and verification
- Document all findings with evidence
- Follow separation of concerns strictly
- Provide professional, stakeholder-ready output
- Validate all findings against real application state

### ✅ Phase-Specific Gates
- **Phase 1**: Requirement approval required
- **Phase 2**: Workflow exploration completion
- **Phase 3**: Locator validation with stability scores
- **Phase 4**: Script generation with no hardcoded values
- **Phase 5**: Framework audit with ≤3 review retries
- **Phase 6**: Test execution with results collection
- **Phase 7**: Self-healing with ≤5 recovery attempts (if needed)
- **Phase 8**: Reporting with all required artifacts

### ✅ Escalation Conditions
- Application unavailable
- Authentication failures
- Missing environment/dependencies
- Ambiguous requirements
- Agent unavailable
- Retry/recovery limits exceeded
- Critical blockers

---

## Usage Examples

### Start Complete Automation Workflow
```
@Playwright Agent Runtime
Analyze and automate user login flow with email and password
```

### Use Specific Agent
```
@Playwright Requirement Analyst
Verify if multi-factor authentication can be automated
```

### Continue from Failure
```
@Playwright Self-Healing Engineer
Fix test failure: "Element not found" on login button
```

### Generate Reports Only
```
@Playwright Reporting Architect
Generate complete reporting for execution completed at 2026-08-31T14:30Z
```

---

## Integration Points

### With Playwright Configuration
- Uses `playwright.config.js` for test execution settings
- Allure reporter must be configured in reporter array
- Screenshot and trace collection must be enabled

### With CI/CD Pipeline
- Runtime skill can be invoked from CI/CD workflows
- Agents validate application accessibility
- Reports published to artifact repositories
- Recommendations trigger follow-up pipeline steps

### With Test Data Management
- Script Generator externalizes test data to `Data/locators_testdata.json`
- All hardcoded values prohibited
- Configuration management centralized

---

## Maintenance & Updates

**Last Updated**: 2026-08-31  
**System Version**: 1.0  
**Status**: Production Ready  

### Future Enhancements
- Trend analysis agent (multi-execution health trends)
- Performance profiling agent
- Visual regression testing agent
- Load/stress testing agent
- Accessibility compliance agent

---

## Support & Documentation

- **Runtime Skill**: See [playwright-agent-runtime/SKILL.md](./skills/playwright-agent-runtime/SKILL.md)
- **Agent Specifications**: See `.github/agents/*.agent.md` files
- **Framework Standards**: Refer to Script Generator specifications
- **Quality Standards**: See Framework Reviewer audit checklist

---

## System Principles

1. **Agent Specialization**: Each agent owns specific domain with clear boundaries
2. **Quality Gates**: Every workflow phase has approval requirements
3. **Evidence-Driven**: All decisions backed by Playwright MCP exploration
4. **Traceability**: Complete audit trail from requirement to report
5. **Scalability**: Hybrid POM + data-driven architecture for maintainability
6. **Professional**: All outputs business-readable and stakeholder-ready
7. **Automation**: Minimal manual intervention in workflow execution
8. **Recovery**: Built-in self-healing for common failure patterns

---

**Registry Authority**: Playwright Multi-Agent System Administrator  
**Last Validation**: 2026-08-31  
**Next Review**: 2026-09-30
