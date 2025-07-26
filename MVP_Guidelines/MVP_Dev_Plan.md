# VibeCheck – Hackathon DevPlan (3 HOURS)

## Overview
**GOAL: Working demo in 3 hours.** Skip everything that doesn't directly contribute to "it works for the demo."

## Tasks (3 HOURS TOTAL)

### Phase 1: Bootstrap (30 min)
- [ ] Create Node.js project with basic package.json
- [ ] Install dependencies: `@instantlyeasy/claude-code-sdk-ts`, `simple-git`
- [ ] Verify Claude CLI is installed and authenticated (`claude login`)

### Phase 2: Core Implementation (90 min)
- [ ] Implement `cloneRepo(url)` using simple-git (basic, no error handling)
- [ ] Implement Claude analysis using SDK:
  ```js
  await claude()
    .allowTools('Read', 'Grep', 'LS', 'ViewFile')
    .inDirectory(repoPath)
    .query('Analyze this codebase and tell me about its structure, quality, and any issues')
    .asText()
  ```
- [ ] Create simple CLI script that takes GitHub URL as argument
- [ ] Test with 2-3 small public repos

### Phase 3: Demo Polish (60 min)
- [ ] Add basic error handling (repo not found, Claude fails)
- [ ] Make output look nice (add headers, formatting)
- [ ] Test demo flow end-to-end
- [ ] Prepare backup repos that definitely work

## Implementation Notes
- **No TypeScript** - Use plain JavaScript for speed
- **No tests** - Manual testing only
- **No fancy prompts** - One generic "analyze this repo" prompt
- **No API** - CLI script is fine for demo
- **No error handling** - Just enough to not crash during demo

## Demo Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Claude SDK auth fails | Test `claude login` first, have backup account |
| Repo too big/slow | Use small test repos (< 50 files) |
| Internet/GitHub down | Clone test repos locally as backup |
| Code breaks during demo | Test the exact demo flow 3 times before presenting |

## Deliverables
1. Working `/audit` endpoint.  
2. Sample markdown report committed to `examples/`.  
3. PRD & DevPlan committed for posterity.
