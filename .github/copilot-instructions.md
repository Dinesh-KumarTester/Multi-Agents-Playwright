# Workspace Instructions

These rules apply to all Playwright automation work in this workspace and are mandatory for the orchestrator, every specialist agent, and every related skill.

## Required Preflight

- Before starting a Playwright workflow or invoking any Playwright agent or skill, review these workspace instructions and read the complete `.github/skills/playwright-agent-runtime/SKILL.md`.
- Treat this file as the common instruction set. Every agent and skill must obey it together with the phase order, handoffs, approval gates, retry limits, recovery rules, and escalation criteria in the runtime skill.
- The orchestrator must pass these rules and the relevant prior-phase findings to each specialist agent. Each specialist must independently follow the runtime skill's requirements for its phase and report evidence and blockers truthfully.
- Do not skip a required preflight or orchestration phase to save time. If the runtime skill or a required specialist is unavailable, stop and report the blocker.

## Browser Exploration and Tooling

- Use Playwright MCP as the primary tool for live application exploration, UI interaction, DOM and locator verification, workflow validation, and browser troubleshooting whenever MCP is available.
- Do not substitute assumptions, stale results, or another browser tool for required live Playwright MCP verification.
- If Playwright MCP is unavailable or cannot perform the required operation, use the project's already-installed Playwright CLI as a fallback where it supports the task, and clearly state what could not be verified through MCP.
- Check the existing project setup before deciding the CLI is absent. If Playwright CLI is not installed, ask the user for explicit permission before installing it or any dependency. Do not install it without permission.
- Do not claim that a CLI-only check provides MCP-level live DOM or visual verification when it does not. If the required verification cannot be completed, document the limitation and follow the runtime skill's blocker and escalation rules.
