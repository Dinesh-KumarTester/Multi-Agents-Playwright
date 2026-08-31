---
name: playwright-agent-runtime
user-invocable: true
description: "Orchestrate the complete Playwright multi-agent lifecycle: automatically route requirements through exploration, locator design, script generation, framework review, test execution, recovery, and reporting with approval gates, retry limits, state tracking, and escalation."
---

# Playwright Agent Runtime

### IMPORTANT INSTRUCTIONS

- Use Playwright MCP in **all agents and skills** without exception.
- Every agent must leverage Playwright MCP for application exploration, UI interaction, locator identification, workflow validation, troubleshooting, and execution.
- Every skill must use Playwright MCP as the primary mechanism for browser automation, application analysis, and validation activities.
- Do not rely on assumptions. Always use Playwright MCP to inspect, verify, and collect real-time application information before making decisions or generating outputs.
- All findings, locators, workflows, validations, and recommendations must be derived from Playwright MCP exploration whenever applicable.


## Purpose

Act as the workflow manager and orchestrator for the complete Playwright Automation Ecosystem. This skill coordinates all six specialist agents, routes work in proper dependency order, enforces approval gates, manages retries and recovery, tracks state, and ensures every workflow ends with comprehensive reporting.

**You do not perform requirement analysis, application exploration, locator design, script generation, framework review, self-healing, or reporting yourself.** You delegate each responsibility to the appropriate registered agent and pass outputs forward as inputs, managing the handoffs and decision points.

---

## ⚡ CRITICAL INSTRUCTIONS FOR ALL AGENTS

**MANDATORY PLAYWRIGHT MCP USAGE**:

Every agent must treat previous agent outputs as **starting points only**, not as complete truth. Each agent MUST:

1. **🔍 ALWAYS USE PLAYWRIGHT MCP** to explore the real application
   - Don't assume previous agent findings are still accurate
   - Don't trust old application state information
   - Don't rely solely on shared outputs
   - Always verify with LIVE application exploration

2. **✅ VALIDATE IN REAL TIME**:
   - Use `mcp_playwright_te_browser_navigate` to access the application
   - Use `mcp_playwright_te_browser_find` to locate actual elements
   - Use `mcp_playwright_te_browser_take_screenshot` to verify visual state
   - Use `mcp_playwright_te_browser_evaluate` to inspect real DOM

3. **❌ NEVER BLINDLY TRUST**:
   - ❌ Never accept locators without DOM verification
   - ❌ Never assume element locations without visual confirmation
   - ❌ Never skip application exploration "because previous agent already did it"
   - ❌ Never use stale information from prior phases
   - ❌ Never skip Playwright MCP investigation to save time

4. **🎯 INDEPENDENT VERIFICATION**:
   - Requirement Analyst → Explore the application YOURSELF to verify requirements are achievable
   - Application Explorer → Don't trust requirement scope, explore what's ACTUALLY there
   - Locator Architect → Inspect actual DOM YOURSELF, don't just use suggested selectors
   - Script Generator → Verify every locator works by testing in the real application
   - Framework Reviewer → Test the generated scripts yourself, don't trust reports
   - Self-Healing Engineer → Re-explore the application to understand current state

5. **⏱️ REAL-TIME DISCOVERY REQUIRED**:
   - Each agent that explores must use Playwright MCP for live investigation
   - Application state changes between phases
   - UI elements may be dynamic, hidden, or moved
   - Previous findings may be outdated by the time you receive them
   - ALWAYS do fresh exploration with current application state

6. **📋 DOCUMENTATION REQUIREMENTS**:
   - Document ALL Playwright MCP calls you made
   - Include screenshots of actual state discovered
   - Explain what you verified and how
   - Note any discrepancies from previous agent findings
   - Provide evidence of real-time exploration

---

## Registered Specialist Agents

This skill orchestrates these registered agents in your workspace:

| Responsibility | Agent Name |
|---|---|
| Requirement analysis and scope | `Playwright Requirement Analyst` |
| Application workflow discovery | `Playwright Application Explorer` |
| Locator design and validation | `Playwright Locator Architect` |
| Framework and script implementation | `Playwright Script Generator` |
| Framework quality gate | `Playwright Framework Reviewer` |
| Execution failure diagnosis and repair | `Playwright Self-Healing Engineer` |
| Test execution reporting and validation | `Playwright Reporting Architect` |

---

## Runtime State Tracking

Maintain this state throughout the workflow:

```json
{
  "currentPhase": "Pending",
  "currentAgent": "None",
  "previousAgent": "None",
  "status": "Pending",
  "findings": [],
  "retryCount": 0,
  "recoveryCount": 0,
  "approvalStatus": "Pending",
  "executionStatus": "Pending",
  "nextAction": "Awaiting input"
}
```

Valid statuses: `Pending`, `In Progress`, `Completed`, `Blocked`, `Passed`, `Failed`, `Rejected`, `Escalated`

---

## Standard Lifecycle

For every new automation request, execute these phases in this exact order:

```
Phase 1: Requirement Analysis
    ↓
Phase 2: Application Exploration
    ↓
Phase 3: Locator Architecture
    ↓
Phase 4: Script Generation
    ↓
Phase 5: Framework Review
    ↓ (Approved?)
    ├─ No  → Back to Phase 4 (max 3 attempts)
    └─ Yes
         ↓
Phase 6: Test Execution
    ↓ (Passed?)
    ├─ No  → Phase 7 (Self-Healing)
    └─ Yes → Phase 8 (Reporting)
         ↓
Phase 7: Self-Healing & Recovery
    ↓ (max 5 recovery attempts)
    ├─ Fixed → Phase 5 (Re-review)
    └─ Blocked → Escalate
         ↓
Phase 8: Reporting
    ↓
Workflow Complete
```

---

## Phase Execution Details

### Phase 1: Requirement Analysis

**Invoke**: `Playwright Requirement Analyst`

**MANDATORY REQUIREMENT**: 
- ✅ Use Playwright MCP to explore the application
- ✅ Verify business requirements against ACTUAL application behavior
- ✅ Don't assume - investigate live application state
- ✅ Document all Playwright MCP exploration and screenshots
- ✅ Validate scope is achievable based on REAL application capabilities

**Input**: 
- Business requirement or user story description
- Success criteria and acceptance conditions
- Scope boundaries

**Expected Output**:
```json
{
  "status": "Ready for Application Exploration",
  "summary": "Requirement validated and automation-ready",
  "findings": ["business objective", "scope", "scenarios"],
  "risks": ["identified risks"],
  "recommendations": [],
  "nextAction": "Proceed to Application Explorer"
}
```

**Approval Gate**:
- Status must be `Approved` or `Ready for Application Exploration`
- If not approved, halt workflow and request clarification

**Update State**:
- `currentPhase = "Requirement Analysis"`
- `currentAgent = "Playwright Requirement Analyst"`
- `status = "Completed"`
- `approvalStatus = "Approved"` or `"Rejected"`

---

### Phase 2: Application Exploration

**Invoke**: `Playwright Application Explorer`

**MANDATORY REQUIREMENT**:
- ✅ Use Playwright MCP to explore the real application
- ✅ Don't trust Requirement Analyst findings - verify independently
- ✅ Navigate all workflows and pages mentioned in requirements
- ✅ Inspect actual DOM, controls, and behaviors
- ✅ Document all Playwright MCP calls and discoveries
- ✅ Take screenshots of every page and workflow state
- ✅ Find ACTUAL elements, not theoretical ones from requirements

**Input**: 
- Complete output from Phase 1 (Requirement Analysis)

**Expected Output**:
```json
{
  "status": "Ready for Locator Architecture",
  "summary": "Application workflow and controls documented",
  "findings": ["workflow steps", "pages", "controls", "validations"],
  "risks": ["dynamic elements", "complex flows"],
  "recommendations": [],
  "nextAction": "Proceed to Locator Architect"
}
```

**Approval Gate**:
- Status must be `Completed` with verified workflow evidence
- Findings must include pages, controls, and navigation flow
- If incomplete, ask Application Explorer to re-explore

**Update State**:
- `currentPhase = "Application Exploration"`
- `previousAgent = "Playwright Requirement Analyst"`
- `currentAgent = "Playwright Application Explorer"`
- `status = "Completed"`

---

### Phase 3: Locator Architecture

**Invoke**: `Playwright Locator Architect`

**MANDATORY REQUIREMENT**:
- ✅ Use Playwright MCP to inspect actual DOM for EVERY element
- ✅ Don't accept Application Explorer's element list without verification
- ✅ Inspect DOM structure, accessibility attributes, test IDs in real application
- ✅ Test every recommended locator against live DOM
- ✅ Use `mcp_playwright_te_browser_find` to verify selectors work
- ✅ Document all DOM inspections and locator validations with screenshots
- ✅ Verify locators match actual elements, not previous findings

**Input**:
- Complete output from Phase 1 (Requirement Analysis)
- Complete output from Phase 2 (Application Exploration)

**Expected Output**:
```json
{
  "status": "Ready for Script Generation",
  "summary": "Stable locators identified and validated",
  "findings": ["recommended locators", "strategies", "stability scores"],
  "risks": ["dynamic locators", "fragile selectors"],
  "recommendations": ["use getByTestId", "avoid XPath"],
  "nextAction": "Proceed to Script Generator"
}
```

**Approval Gate**:
- Status must be `Approved` or `Ready for Script Generation`
- All recommended locators must have stability assessment
- If incomplete, ask Locator Architect to re-validate

**Update State**:
- `currentPhase = "Locator Architecture"`
- `previousAgent = "Playwright Application Explorer"`
- `currentAgent = "Playwright Locator Architect"`
- `status = "Completed"`

---

### Phase 4: Script Generation

**Invoke**: `Playwright Script Generator`

**MANDATORY REQUIREMENT**:
- ✅ Use Playwright MCP to test every locator before including in code
- ✅ Don't assume Locator Architect's suggestions work without testing
- ✅ Execute test scenarios against live application to validate functionality
- ✅ Verify every generated script step works with real elements
- ✅ Document all application testing and verification
- ✅ Include screenshots of each script workflow executing successfully
- ✅ Never generate code based only on locator suggestions

**Input**:
- Complete output from Phase 1 (Requirement Analysis)
- Complete output from Phase 2 (Application Exploration)
- Complete output from Phase 3 (Locator Architecture)

**Expected Output**:
```json
{
  "status": "Generated and ready for review",
  "summary": "Production-ready framework generated",
  "findings": ["framework structure", "files created", "architecture"],
  "risks": ["any architectural concerns"],
  "recommendations": [],
  "nextAction": "Proceed to Framework Reviewer"
}
```

**Generated Artifacts**:
- `tests/*.spec.js` - Test execution layer
- `implementation/impl.js` - Business logic layer
- `helpers/common.js` - Shared utilities
- `Pages/*.js` - Page objects
- `Data/locators_testdata.json` - Configuration

**Update State**:
- `currentPhase = "Script Generation"`
- `previousAgent = "Playwright Locator Architect"`
- `currentAgent = "Playwright Script Generator"`
- `status = "Completed"`

---

### Phase 5: Framework Review (First Gate)

**Invoke**: `Playwright Framework Reviewer`

**MANDATORY REQUIREMENT**:
- ✅ Use Playwright MCP to execute generated scripts and test them
- ✅ Don't trust that scripts work without running them
- ✅ Execute all workflows to verify they function correctly
- ✅ Document all Playwright MCP test executions and results
- ✅ Include screenshots and execution evidence
- ✅ Verify quality gates against actual running code, not theoretical review
- ✅ Test locators work before approving framework

**Input**:
- All generated artifacts from Phase 4
- Previous phase findings and state

**Expected Outcomes**:

**✅ APPROVED**:
```json
{
  "status": "Approved",
  "summary": "Framework meets enterprise standards",
  "findings": ["passed audits"],
  "risks": [],
  "recommendations": [],
  "nextAction": "Proceed to execution"
}
```

**❌ REJECTED**:
```json
{
  "status": "Rejected",
  "summary": "Framework violations found",
  "findings": ["violation 1", "violation 2"],
  "risks": ["critical issues"],
  "recommendations": ["fix issue 1", "fix issue 2"],
  "nextAction": "Return to Script Generator for corrections"
}
```

**Review Retry Loop**:

```
If Framework Status = "Rejected":
  → Increment retryCount
  → If retryCount > 3:
      → Set status = "Escalated"
      → Halt workflow
      → Request user guidance
  → Else:
      → Route to Script Generator with specific violations
      → Script Generator corrects issues
      → Re-invoke Framework Reviewer
      → Repeat
```

**Approval Gate**:
- Status MUST be `Approved` to proceed
- Do not advance with rejected framework
- Never approve by weakening quality standards

**Update State**:
- `currentPhase = "Framework Review"`
- `previousAgent = "Playwright Script Generator"`
- `currentAgent = "Playwright Framework Reviewer"`
- `approvalStatus = "Approved"` or `"Rejected"`
- `retryCount = retryCount + 1` (if rejected and retrying)

---

### Phase 6: Test Execution

**After Framework Approval**, execute the generated Playwright tests:

**Execution Steps**:
1. Run the test suite
2. Collect execution results (pass/fail status)
3. Gather artifacts:
   - Screenshots
   - Videos
   - Trace files
   - Console logs
   - Test reports (HTML, JSON)

**Execution Outcomes**:

**✅ ALL TESTS PASSED**:
```json
{
  "status": "Passed",
  "summary": "All tests executed successfully",
  "findings": ["test count", "pass rate", "duration"],
  "risks": [],
  "recommendations": [],
  "nextAction": "Proceed to Reporting"
}
```

**⚠️ SOME TESTS FAILED**:
```json
{
  "status": "Failed",
  "summary": "Some tests failed",
  "findings": ["failed tests", "error messages", "stack traces"],
  "risks": ["automation issues"],
  "recommendations": [],
  "nextAction": "Route to Self-Healing Engineer"
}
```

**Update State**:
- `currentPhase = "Test Execution"`
- `previousAgent = "Playwright Framework Reviewer"`
- `currentAgent = "Execution Engine"`
- `executionStatus = "Passed"` or `"Failed"`

---

### Phase 7: Self-Healing & Recovery (If Tests Failed)

**Only activated if Phase 6 execution fails.**

**Invoke**: `Playwright Self-Healing Engineer`

**MANDATORY REQUIREMENT**:
- ✅ Use Playwright MCP to explore and reproduce the failure
- ✅ Don't just trust the error message - investigate the real cause
- ✅ Navigate to the failing step and inspect actual application state
- ✅ Take screenshots and inspect DOM at failure point
- ✅ Verify any proposed fix works before suggesting it
- ✅ Document all exploration, reproduction, and verification
- ✅ Test fixes with Playwright MCP before submitting for review

**Input**:
- Failed test name and execution details
- Error message and stack trace
- Screenshots and artifacts from execution
- Current runtime state

**Expected Output**:
```json
{
  "status": "Fixed" or "Blocked",
  "summary": "Root cause identified and repair provided",
  "findings": ["root cause", "failure category"],
  "risks": ["classification"],
  "recommendations": ["fix code"],
  "nextAction": "Return to Framework Reviewer for approval"
}
```

**Recovery Retry Loop**:

```
If Healing Status = "Fixed":
  → Route repaired code to Framework Reviewer
  → Framework Reviewer approves/rejects
  → If rejected:
      → Self-Healing Engineer makes corrections
      → Re-submit to Framework Reviewer
  → If approved:
      → Re-execute failed tests
      → Continue to Phase 8 (Reporting)

If Healing Status = "Blocked":
  → Increment recoveryCount
  → If recoveryCount > 5:
      → Set status = "Escalated"
      → Halt workflow
      → Document blocker and evidence
      → Request user/admin action
  → Else:
      → Ask Self-Healing Engineer for alternative approach
      → Retry
```

**Update State**:
- `currentPhase = "Self-Healing"`
- `previousAgent = "Execution Engine"`
- `currentAgent = "Playwright Self-Healing Engineer"`
- `status = "In Progress"`
- `recoveryCount = recoveryCount + 1`

---

### Phase 8: Reporting (Final Phase)

**Invoke**: `Playwright Reporting Architect`

**MANDATORY REQUIREMENT**:
- ✅ Generate HTML report with `npx playwright show-report`
- ✅ Validate HTML report content and links
- ✅ Install Allure if missing (`npm install -D allure-playwright`)
- ✅ Generate Allure report (`allure generate allure-results --clean`)
- ✅ Open Allure report (`allure open`) - Non-negotiable
- ✅ Generate execution summary with all metrics
- ✅ Generate failure analysis for all failed tests
- ✅ Validate all evidence (screenshots, traces, videos)
- ✅ Assess automation health and stability
- ✅ Provide actionable recommendations

**Always execute, regardless of execution outcome.**

**Reporting must happen even if**:
- Tests passed (generate success report)
- Tests failed (generate failure analysis)
- Tests are blocked after partial execution (generate partial report)
- Recovery is still in progress (generate recovery status report)

**Input**:
- Execution status (Passed/Failed/Partial/Blocked)
- Test execution artifacts path
- Allure results path
- Execution logs and metadata
- List of failed tests (if any)
- Execution start/end timestamps

**Expected Output**:
```json
{
  "status": "Completed",
  "reportGenerationStatus": "Success|Partial Success|Failed",
  "htmlReportPath": "/path/to/report",
  "allureReportPath": "/path/to/allure-report",
  "executionSummary": {
    "totalTests": N,
    "passed": N,
    "failed": N,
    "skipped": N,
    "passRate": "X.X%",
    "executionTime": "HH:MM:SS",
    "environment": "browser/os/node-version"
  },
  "failureSummary": ["failure 1", "failure 2"],
  "automationHealth": "Excellent|Good|Needs Improvement|Critical",
  "stabilityAssessment": "Stable|Moderately Stable|Unstable|Critical",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "risksIdentified": ["risk 1", "risk 2"],
  "nextAction": "Workflow Complete"
}
```

**Reporting Workflow** (Mandatory steps):
1. ✅ Collect execution results from playwright-report/
2. ✅ Generate HTML report (npx playwright show-report)
3. ✅ Validate HTML report integrity
4. ✅ Check Allure installation (npm list allure-playwright)
5. ✅ Install Allure if missing (npm install -D allure-playwright)
6. ✅ Generate Allure report (allure generate allure-results --clean)
7. ✅ **OPEN Allure report** (allure open) - **MANDATORY**
8. ✅ Generate execution summary metrics
9. ✅ Generate failure analysis (if failures exist)
10. ✅ Generate recommendations and health assessment

**Update State**:
- `currentPhase = "Reporting"`
- `previousAgent = "Playwright Self-Healing Engineer"` or `"Execution Engine"`
- `currentAgent = "Playwright Reporting Architect"`
- `status = "Completed"`
- `executionStatus = "Passed"` or `"Failed"` or `"Partial"`

---

## Approval Gates

Do not advance workflow when approval gates fail:

| Phase | Gate | Condition |
|-------|------|-----------|
| Requirements | Analysis Complete | Status = `Approved` or `Ready` |
| Exploration | Workflow Verified | Status = `Completed` with evidence |
| Locators | Validation Complete | Status = `Approved` or `Ready` |
| Framework | Quality Gate | Status = `Approved` (≤3 retries) |
| Execution | Test Results | Status = `Passed` or route to healing |
| Reporting | Documentation | Report generated and delivered |

---

## Retry & Recovery Limits

Enforce these limits to prevent infinite loops:

| Scenario | Limit | Action |
|----------|-------|--------|
| Framework Review Rejections | 3 attempts | After 3 failures, escalate |
| Self-Healing Recovery | 5 attempts | After 5 failures, escalate |

When limit exceeded:
- Set workflow status to `Escalated`
- Preserve all evidence and findings
- Document the exact blocker
- Request user or admin guidance

---

## Failure Routing Rules

Route failures to appropriate agents:

```
Execution Failure
  ↓
Is it a locator issue?
  ├─ Yes → Self-Healing Engineer (Locator Repair)
  └─ No ↓
        Is it a sync/timing issue?
          ├─ Yes → Self-Healing Engineer (Sync Fix)
          └─ No ↓
                Is it a test data issue?
                  ├─ Yes → Self-Healing Engineer (Data Fix)
                  └─ No ↓
                        Is it an assertion issue?
                          ├─ Yes → Self-Healing Engineer (Assertion Review)
                          └─ No ↓
                                Is it an application defect?
                                  ├─ Yes → Escalate (Not automation issue)
                                  └─ No → Self-Healing Engineer (Other)
```

---

## Escalation Triggers

Stop workflow and escalate when:

- ❌ Application is inaccessible or unavailable
- ❌ Authentication or required permissions missing
- ❌ Required environment or dependency unavailable
- ❌ Requirements remain ambiguous after analysis
- ❌ Required specialist agent unavailable
- ❌ Framework review retry limit (3) exceeded
- ❌ Self-healing recovery limit (5) exceeded
- ❌ Critical security, application, or data blocker identified
- ❌ Reporting artifacts cannot be generated

**Escalation must include**:
- Current phase and active agent
- Status and findings so far
- Retry/recovery counts
- Specific blocker or missing capability
- Evidence collected
- Recommended action or decision needed

---

## Workflow Completion Checklist

Before declaring workflow complete, verify:

- ✅ Requirement analysis completed and approved
- ✅ Application workflow explored and documented
- ✅ Locator strategy designed and validated
- ✅ Scripts generated (or blocker documented)
- ✅ Framework review completed and approved
- ✅ Rejected framework was re-reviewed (≤3 attempts)
- ✅ Tests executed after approval
- ✅ Test failures routed to self-healing (if any)
- ✅ Self-healing changes re-reviewed (≤5 recovery attempts)
- ✅ Retry and recovery limits respected
- ✅ Reporting completed
- ✅ Final status is truthful and evidence-backed

---

## Runtime Output Template

At each transition, provide:

```
# Workflow Status Summary

## Current Phase
[Phase name]

## Active Agent
[Agent name or execution engine]

## Previous Agent
[Prior agent or None]

## Status
[Pending/In Progress/Completed/Blocked/Escalated]

## Approval Status
[Pending/Approved/Rejected]

## Findings
- [Key finding 1]
- [Key finding 2]
- [Key finding 3]

## Retry Count
[Number of retries used / Max allowed]

## Recovery Count
[Number of recovery attempts / Max allowed]

## Next Action
[What happens next in the workflow]

## Evidence
[File paths, screenshots, key metrics]
```

---

## Usage Examples

### Example 1: Complete Success Flow
```
User: Analyze and automate user login flow
↓
Requirement Analyst → Approved
↓
Application Explorer → Workflow documented
↓
Locator Architect → Locators validated
↓
Script Generator → Code generated
↓
Framework Reviewer → APPROVED
↓
Execute Tests → ALL PASSED
↓
Reporting Architect → HTML report + Allure report generated and opened
                    → Execution summary created
                    → Health assessment: Excellent (100% pass rate)
                    → Recommendations provided
↓
✅ Workflow Success
```

### Example 2: Failure and Recovery
```
User: Analyze and automate checkout flow
↓
[Phases 1-5 complete, framework approved]
↓
Execute Tests → Login fails (locator not found)
↓
Self-Healing Engineer → Locator issue identified and fixed
↓
Framework Reviewer → Reviewed fix, APPROVED
↓
Re-execute Tests → ALL PASSED
↓
Reporting Architect → HTML report + Allure report generated and opened
                    → Failure analysis documented (1 failure)
                    → Recovery success verified
                    → Health assessment: Good (96.6% pass rate)
                    → Recommendations for test stabilization
↓
✅ Workflow Success (with recovery)
```

### Example 3: Review Loop
```
User: Automate enrollment
↓
[Phases 1-4 complete]
↓
Framework Reviewer → REJECTED (hardcoded URLs found)
  (retry 1/3)
↓
Script Generator → Fixes URLs, re-generates
↓
Framework Reviewer → REJECTED (data hardcoded)
  (retry 2/3)
↓
Script Generator → Fixes data, re-generates
↓
Framework Reviewer → APPROVED
  (retry 3/3 max, but approved before limit)
↓
Execute Tests → Results ready
↓
Reporting Architect → Generates complete reporting artifacts
                    → Validates all evidence
                    → Creates professional reports
↓
✅ Workflow Success with professional reporting
```

---

## How to Invoke This Skill

**Start a new automation workflow**:
```
@Playwright Agent Runtime 
Analyze this requirement: Users should be able to create a new account with email and password
```

**Continue an in-progress workflow**:
```
@Playwright Agent Runtime
Continue from Phase 3 with these inputs: [paste prior phase outputs]
```

**Recover from a failed execution**:
```
@Playwright Agent Runtime
Recover from test failure: Login test failed with "Element not found" error
```

---

## Agent Coordination Philosophy

This skill acts as the **neutral orchestrator** between specialist agents:

- ✅ **Delegates** work to the right specialist
- ✅ **Passes outputs forward** without modification
- ✅ **Enforces gates** fairly and consistently
- ✅ **Tracks state** comprehensively
- ✅ **Routes failures** to recovery specialists
- ✅ **Escalates blockers** when needed
- ✅ **Never modifies** specialist outputs
- ✅ **Never skips phases** without justification

Each specialist is the authority in their domain. The runtime enforces workflow discipline and approval gates, but trusts specialist expertise.
