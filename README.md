<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./src/assets/StatusBridge_Logo_Dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./src/assets/StatusBridge_Logo_Light.png">
  <img alt="StatusBridge logo" src="./src/assets/StatusBridge_Logo_Light.png" width="340">
</picture>

### Your status page tells the truth. StatusBridge tells everyone else.

<br/>

![Built with React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

<br/>

**Overview:** [What it is](#what-statusbridge-is) · [Problem](#problem) · [Solution](#solution) · [Features](#features)

**Run it:** [Quick start](#quick-start) · [Gemini optional](#gemini-optional) · [Stack](#architecture--stack)

---

</div>


<div align="center">

# One incident. Many audiences. Same truth.

</div>

## What StatusBridge is

StatusBridge Lite sits beside an official status page and helps the incident team translate one verified service update into the formats everyone else needs: student-facing copy, IT/internal updates, executive summaries, embeddable widgets, RSS-style output, and triage intake.

The shipped experience uses realistic mock services with UO-style naming, so reviewers can evaluate the workflow without live production feeds, credentials, databases, or external integrations.

---

## The story

Universities invest in official status pages, yet during an incident the same underlying fact still has to reach students, IT staff, executives, department sites, and downstream tools—often through separate drafts, channels, and formats.

A team maintaining a page such as **status.uoregon.edu** would use StatusBridge **after** publishing the canonical update there. The official page stays authoritative. StatusBridge becomes the workspace where that same verified incident is turned into every other message campus needs.

---

## Problem

When services degrade or fail, communication work multiplies exactly when teams have the least spare attention.

- **Students and campus users** need clear, non-technical reassurance.
- **IT and operations** need a consistent operational narrative.
- **Leadership** needs short, decision-ready summaries.
- **Departments and college sites** need embeddable status indicators.
- **Campus systems** benefit from structured, machine-readable feeds.
- **Support teams** need a path for crowdsourced field reports.

The result is repetitive, urgent, high-stakes communication work that is easy to defer while everyone focuses on restoration.

---

## Solution

StatusBridge Lite normalizes incident-like inputs into a single internal model, then derives parallel outputs from that model.

```text
Official status signal / mock incident
        |
normalizeIncident()
        |
Current Incidents workspace
        |
Derived communication surfaces
  · Student-ready message
  · IT/internal update
  · Executive summary
  · Collaboration-style thread
  · RSS XML for active incidents
  · Embeddable department widget
  · Local outage report queue
  · Optional network evidence card
```

One normalized incident drives many surfaces, so the message stays aligned even when the audience and format change.

---

## Features

### Current incidents

A dashboard lists monitored services—wireless, learning management, identity, email, VPN, and more—with status, severity, human-readable message, source, and last-updated time.

### Incident model

Every downstream generator reads from the same TypeScript shape, keeping provenance, service identity, status, severity, messaging, and timestamps aligned.

```ts
type Incident = {
  id: string;
  service: string;
  status: "operational" | "degraded" | "partial_outage" | "major_outage";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  source: "mock" | "status_page" | "user_report" | "network_evidence";
  updatedAt: string;
};
```

### Stakeholder messaging

For the selected incident, StatusBridge produces copy-ready variants for students, IT/internal teams, and executives—each tuned to the same facts.

### Collaboration-style thread

A channel-style preview presents the incident as an operational narrative: initial update, follow-on context, suggested next communication, timestamp, and visible severity.

### RSS output

Active, non-operational incidents appear as visible RSS XML, showing how the same incident posture could feed portals, monitors, and downstream systems.

### Embeddable status widget

A compact department-facing card mirrors the selected incident and includes a copyable embed snippet for unit websites.

### Outage reporting

A structured intake form captures service, location or network, description, and optional contact. Submissions appear in an on-device queue for this reference build.

### Network evidence sample

A deterministic sample evidence card can attach latency, jitter, and quality indicators to the selected incident without requiring live network tests.

---

## Product tour

The interface follows a status-team workflow:

1. **Confirm the incident** — Select a monitored service and review the canonical message.
2. **Capture field signal** — File campus outage reports and review the local triage queue.
3. **Generate audience copy** — Produce student, IT/internal, and executive-ready messaging.
4. **Distribute everywhere else** — Preview a collaboration thread, RSS output, embeddable widget, and optional evidence card.

Together, the flow is simple: **publish on the official page first, then redistribute everywhere else from one workspace.**

---

## Architecture & stack

| Layer | Choice |
| --- | --- |
| UI | React, Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Runtime/tooling | Bun |
| Data | Local mock data, in-memory state |

This repository is a client-only reference implementation. No database, authentication, or live integrations are required to evaluate the experience.

---

## Quick start

```bash
bun install
bun run dev
```

Production build:

```bash
bun run build
```

Typecheck only:

```bash
bun run typecheck
```

---

## Gemini optional

Stakeholder drafts can optionally be generated with Google Gemini from the selected mock official incident plus triage reports for that service. Without a key, the app falls back to deterministic templates.

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Copy [`.env.example`](.env.example) to `.env.local`.
3. Set the key:

   ```bash
   VITE_GEMINI_API_KEY=your_key_here
   ```

   Optional fallback model override:

   ```bash
   VITE_GEMINI_MODEL=gemini-1.5-flash
   ```

4. Restart the dev server:

   ```bash
   bun run dev
   ```

> [!CAUTION]
> `VITE_*` variables are embedded in the client bundle. Use this for local demos only; a production version should call Gemini from a backend.

---

## Why it matters

Status pages are good at publishing truth. Incidents still need translation.

StatusBridge exists for the moment after the status page update goes live: when students, staff, executives, department sites, support teams, and automation all need the same truth in different shapes.

<div align="center">

**StatusBridge tells everyone else.**

</div>
