# StatusBridge Lite

**StatusBridge Lite** is a reference implementation of an **incident communication layer** for higher education IT. It sits alongside the official status page: the status page remains the system of record; StatusBridge turns incident signals into **audience-specific, channel-ready outputs** in one place.

The shipped experience uses **realistic mock services** (UO-style naming) so reviewers can evaluate flows and copy without live production feeds or external integrations.

---

## The story

Universities invest in official status pages, yet during an incident the same underlying fact still has to reach students, IT staff, executives, department sites, and downstream tools—often through separate drafts, channels, and formats. StatusBridge is the **bridge** between “what IT knows” and “what each audience needs to see,” without replacing the authoritative source.

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

The experience is designed to read as a **single incident story** end to end.

1. **Roster** — The opening view establishes scope: multiple services, mixed health, and severity at a glance.
2. **Selection** — Focus moves to one incident; the right-hand surface becomes the communication workspace for that case.
3. **Audiences** — Stakeholder blocks appear side by side, showing one incident expressed as student, internal, and executive language.
4. **Operations** — The thread-style panel shows how the same incident reads as a time-ordered operational channel, including suggested follow-up cadence.
5. **Distribution** — The widget preview and snippet illustrate embedding on college or department pages; the RSS panel shows machine-readable redistribution.
6. **Signal intake** — The report form and queue model how grassroots reports enter the picture alongside top-down status.
7. **Evidence (optional)** — The network evidence action rounds out the story with a concrete operational attachment tied to the selected service.

Together, these panels tell a coherent product story: **normalize once, communicate everywhere the campus looks.**

---

## Architecture & stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| UI           | React (Vite), TypeScript, Tailwind CSS      |
| Runtime/tool | Bun                                         |
| Data         | Local mock data, in-memory state (no server) |

This repository is a **client-only reference**: no database, authentication, or live integrations are required to evaluate behavior. That keeps review fast and reproducible.

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
