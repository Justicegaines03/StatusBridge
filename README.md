# StatusBridge Lite

**StatusBridge Lite** is a reference implementation of an **incident communication layer** for higher education IT. It sits alongside the official status page: the status page remains the system of record; StatusBridge turns incident signals into **audience-specific, channel-ready outputs** in one place.

The shipped experience uses **realistic mock services** (UO-style naming) so reviewers can evaluate flows and copy without live production feeds or external integrations.

---

## The story

Universities invest in official status pages, yet during an incident the same underlying fact still has to reach students, IT staff, executives, department sites, and downstream tools—often through separate drafts, channels, and formats. The team that maintains a page such as **status.uoregon.edu** would use StatusBridge **after** publishing there: the official page stays canonical; StatusBridge is where that same team turns one verified incident into every other format the campus needs.

---

## Problem

When services degrade or fail, communication work multiplies:

- **Students and campus users** need clear, non-technical language and timely reassurance.
- **IT and operations** need a consistent operational narrative they can extend over time.
- **Leadership** needs short, decision-ready summaries.
- **Departments and college sites** need embeddable indicators that match official posture.
- **Automation and campus systems** benefit from structured, machine-readable feeds.
- **Support organizations** need a structured path for crowdsourced reports from the field.

That work is **repetitive, urgent, and easy to defer** when teams are focused on restoration—exactly when communication matters most.

---

## Solution

StatusBridge Lite **normalizes** incident-like inputs into a single internal model, then **derives** parallel outputs from that model: stakeholder-ready text, a collaboration-style thread layout, RSS-style XML for active incidents, an embeddable widget representation, a local intake queue for user-submitted reports, and an optional deterministic “network evidence” card for operational context.

One normalized incident drives many surfaces—so messaging stays **aligned** even when the format changes.

```text
Incident signals (mock / companion to official page)
        |
normalizeIncident()
        |
Current Incidents view
        |
Derived outputs
  · Stakeholder messages (student / IT / executive)
  · Collaboration-style thread preview
  · RSS XML (active incidents)
  · Embeddable widget + snippet
  · User report queue
  · Optional network evidence card
```

---

## Features

### Current incidents

A dashboard lists monitored services (e.g. wireless, learning management, identity, email, VPN) with **status**, **severity**, **human-readable message**, **source**, and **last updated** time. Reviewers see service impact at a glance and select any incident to drive the rest of the product.

### Incident model

Incidents conform to a single TypeScript shape—status, severity, service identity, messaging, provenance, and timestamps—so every downstream generator reads the same truth.

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

For the selected incident, the product produces **copy-ready** variants: student-facing, IT/internal, and executive summary—each tuned to the same facts so tone and emphasis match the audience without manual rewrites from scratch.

### Collaboration-style thread

A **channel-style** preview presents the incident as a threaded operational narrative: initial update, follow-on context, and suggested next communication—with timestamps and severity visible in line with how many campuses run incident comms in chat tools.

### RSS output

Active (non-operational) incidents are reflected in **visible RSS XML**, illustrating subscription and integration paths for portals, monitors, and other systems.

### Embeddable status widget

A compact **department-facing** status card mirrors the selected incident, paired with a **copyable embed snippet** so the same posture can be reflected on unit websites without duplicating status infrastructure.

### Outage reporting

A structured form captures **service**, **location or network**, **description**, and optional **contact**. Submissions appear in an **on-device queue** in this reference build, modeling bottom-up signal from campus users into the comms workflow.

### Network evidence (sample)

A control attaches **deterministic sample** latency, jitter, and quality indicators to the selected incident, illustrating how operational evidence can sit next to narrative updates without depending on live network tests in a review environment.

---

## Product tour (what reviewers see)

The interface follows the **status-team workflow**: confirm what was published on the official page, capture intake, then generate copy and channel previews.

1. **Incident workspace and intake** — Services mirror the official roster; the team selects the active line item, sees the **canonical message** aligned with the status page, files **campus outage reports** through intake, and reviews the **triage queue**.
2. **Copy-ready messaging** — **Student**, **IT/internal**, and **executive** text is derived from that selection for paste-ready use in email, chat, and briefings.
3. **Outreach and distribution** — **Collaboration-style thread**, **embeddable unit widget** (with snippet), **RSS** for feeds and integrations, and optional **network evidence** for operational context complete the picture.

Together, the flow reads: **publish on the official page first, then redistribute everywhere else from one workspace.**

---

## Architecture & stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| UI           | React (Vite), TypeScript, Tailwind CSS      |
| Runtime/tool | Bun                                         |
| Data         | Local mock data, in-memory state (no server) |

This repository is a **client-only reference**: no database, authentication, or live integrations are required to evaluate behavior. That keeps review fast and reproducible.

### Gemini (optional)

Stakeholder drafts on step 2 can be generated with **Google Gemini** from the mock official incident (status-page line) plus **triage reports for the selected service** from step 1. Without a key, the app uses the same deterministic templates as before.

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey) (or enable **Generative Language API** in Google Cloud and create a key).
2. Copy [`.env.example`](.env.example) to `.env.local` and set:

   ```bash
   VITE_GEMINI_API_KEY=your_key_here
   ```

   Optional: `VITE_GEMINI_MODEL=gemini-1.5-flash` if the default model is unavailable on your project.

3. Restart `bun run dev`.

**Security:** `VITE_*` variables are embedded in the client bundle. Use this for local demos only; production should call Gemini from a backend.

**Quota:** Each incident switch or triage change for that service triggers one generation request—keep that in mind on the free tier.

---

## Running the application

```bash
bun install
bun run dev
```

Production build:

```bash
bun run build
```
