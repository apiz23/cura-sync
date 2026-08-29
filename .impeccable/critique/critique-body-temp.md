# CuraSync User Dashboard — UX Design Review

## Design Specificity Verdict

**Partially grounded (5/10).** The dot-grid background, monospaced micro-labels, and `font-mono text-[10px] uppercase tracking-[0.2em]` system give it a distinctive texture, and the "five-layer pipeline" terminology is product-specific. However, the core layout patterns — metric strip, activity list, quick actions grid, two-column card split — are interchangeable across any SaaS dashboard. The symptom analyzer's result card (urgency bar, source badge, severity strip) is the most CuraSync-specific element. A competing healthcare product could adopt this layout with only branding swaps.

## Nielsen Heuristic Scores

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading skeletons present. Analysis progress panel strong. But no skeleton on health page alerts. |
| 2 | Match System / Real World | 2 | Technical jargon ("BioClinicalBERT NER", "JamAIBase RAG") dumped on patients. |
| 3 | User Control and Freedom | 3 | Cancel on analysis good. No undo on medication "mark as taken". |
| 4 | Consistency and Standards | 3 | Dashboard greeting differs from sectionLabel+title pattern. Card styling inconsistent. |
| 5 | Error Prevention | 2 | No confirmation on irreversible medication action. No guardrails on empty symptom submission. |
| 6 | Recognition Rather Than Recall | 3 | Symptoms as selectable tags good. History hidden behind expand. |
| 7 | Flexibility and Efficiency | 3 | Quick actions on dashboard. No keyboard shortcuts anywhere. |
| 8 | Aesthetic and Minimalist Design | 2 | Overloaded. Appointments has TWO stat strips. Dashboard has 7 information zones. |
| 9 | Error Recovery | 3 | Error banner with link to profile. Health page shows raw error with no retry. |
| 10 | Help and Documentation | 2 | Pipeline description buried in sidebar. No contextual help tooltips. No onboarding. |

**Total: 26/40 — Acceptable**

## Cognitive Load Assessment

**Failures: 5/8** — Significant cognitive overload.

- Single focus: FAIL — Dashboard tries to be greeting hub, metric dashboard, activity feed, quick launcher, health overview, wearable summary, and care summary (7 jobs).
- Chunking: PASS
- Grouping: PASS
- Visual hierarchy: FAIL — `font-mono text-[10px]` labels appear identically on 15+ elements, losing signifier role.
- One thing at a time: FAIL — Appointments has 5 sequential tasks stacked vertically.
- Minimal choices: FAIL — Dashboard presents 12+ decision points on first screen.
- Working memory: FAIL — Profile completion % shown on dashboard, fields on /profile.
- Progressive disclosure: PASS

## Emotional Journey

- **Peak:** Symptom analysis result hero card with urgency bar is well-crafted.
- **End:** "Start a new analysis" is neutral. No "save for your appointment" nudge.
- **Valleys:** Empty state redirects to profile with no explanation. "Not synced" / "Missing" / "Off" labels create anxiety. "Analyzing health data" loading with 5 pipeline steps increases worry.
- **Reassurance gaps:** Emergency banner visually similar to error states. Medical disclaimer buried after results.

## Strengths

1. Consistent shell system (UserPageShell + UserPageHeader) creates predictable page structure.
2. Symptom analyzer's progressive analysis UI with pipeline visualization builds trust.
3. Graceful degradation — dashboard handles partial failures independently.

## Priority Issues

### P0 — Jargon dumping on vulnerable users
`symptom-analyzer/page.tsx:1078-1080` names "BioClinicalBERT NER enrichment" and "JamAIBase RAG reasoning" to patients. Replace with patient-friendly language.

### P0 — No confirmation on irreversible medication action
`medications/page.tsx:146-171` fires POST immediately on "mark as taken" click. Highest-stakes action with lowest friction.

### P1 — Dashboard cognitive overload
`dashboard/page.tsx` presents 7 distinct information zones. Reduce metric cards, collapse health overview, remove quick actions.

### P1 — Duplicate stat strips on appointments
`appointments/page.tsx:564-583` and `686-707` have overlapping stat blocks. Second strip's metrics are admin-level, not patient concerns.

### P2 — No onboarding or first-use guidance
No page provides orientation for first-time users. Dashboard empty state redirects without explaining why.

## Persona Red Flags

### Alex (68, retired teacher, diabetes)
- Dashboard "Off" / "Not synced" states create shame for non-wearable owners.
- "BioClinicalBERT NER enrichment" creates immediate distrust.
- No medication reminders or simplified dose tracking.

### Jordan (34, working parent, anxiety)
- "Analyzing health data" loading with 5 pipeline steps increases anxiety.
- "Emergency contact: Missing" surfaces every gap rather than next step.
- No severity filtering on notifications.

### Sam (22, student, first-time user)
- No onboarding. Doesn't understand "Health Connect" or profile completion %.
- Appointments overwhelming with 2 stat strips + search + filter + table.
- Symptom history hidden behind expandable sidebar card.

## Minor Observations

- Dashboard greeting pattern differs from other pages.
- Active sidebar state uses no background highlight — hard to distinguish on mobile.
- Relative time format is English-only.
- Activity items truncate dates with fragile string split.
- Health alerts dismissed with PATCH but reappear on refresh until backend processes.
