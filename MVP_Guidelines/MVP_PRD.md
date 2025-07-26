# VibeCheck – Hackathon Demo Requirements

## 1. Purpose
VibeCheck lets developers drop a GitHub repository URL and instantly receive an AI‑generated audit report. **DEMO GOAL: Show that we can analyze any public GitHub repo and give useful feedback using Claude Code SDK.**

## 2. Demo Success Criteria
| Goal | Target |
|------|--------|
| **IT WORKS** | Can paste GitHub URL → get some kind of analysis report |
| **LOOKS COOL** | Output is readable and seems intelligent |
| **DEMO READY** | Works for 2-3 example repos without crashing |

## 3. Demo Audience
* **Hackathon judges** who need to see it work in 5 minutes
* **Anyone with a GitHub repo** they want analyzed

## 4. Demo Scope (Minimum Viable Demo)
* **Input:** Public GitHub repo URL
* **Analysis:** Whatever Claude Code SDK can tell us about the repo
* **Engine:** `@instantlyeasy/claude-code-sdk-ts` + Claude CLI
* **Output:** Text/Markdown that looks smart
* **Interface:** Simple API endpoint OR even just a CLI script

## 5. Out of Scope (Don't Waste Time On)
* Pretty UI, authentication, databases, error handling, scalability, security, testing, documentation beyond README

## 6. Demo Requirements
| Category | Requirement |
|----------|-------------|
| **Works** | Doesn't crash during demo |
| **Fast enough** | Completes analysis in reasonable time for demo |
| **Looks good** | Output is impressive enough for judges |

## 7. Demo Risks
* Claude Code SDK authentication issues
* Repo too large and times out
* **MITIGATION: Have 2-3 tested repos ready as backups**

## 8. Hackathon Timeline (3 HOURS)
| Phase | Time | Goal |
|-------|------|------|
| Setup & Bootstrap | 30 min | Project structure, dependencies installed |
| Core Implementation | 90 min | Clone repo + Claude analysis working |
| Demo Polish | 60 min | Test with multiple repos, fix obvious bugs |
