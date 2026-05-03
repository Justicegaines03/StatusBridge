# StatusBridge Lite

StatusBridge Lite is a hackathon prototype that shows how a university could make official IT status information more accessible without replacing the official status page.

## Core Demo Story

Universities already have official status pages, but status communication is still manual. StatusBridge Lite does not replace the official page. It helps redistribute and contextualize status information by turning incidents into RSS updates, Teams-style threads, embeddable widgets, outage reports, and stakeholder-ready messages.

The official status page remains the source of truth. StatusBridge Lite is the communication layer around it.

## Problem

During an IT incident, the same status update often has to be repackaged for several audiences:

- Students need a plain-language update.
- IT teams need an operational thread.
- Executives need a concise summary.
- Departments may want an embeddable service status card.
- Other tools may need RSS-style machine-readable updates.
- Help desks need a way to collect bottom-up outage reports.

That work is repetitive, time-sensitive, and easy to delay during an incident.

## Solution

StatusBridge Lite takes UO-like mock incident data, normalizes it into a consistent TypeScript shape, and generates reusable communication outputs in one local dashboard.

```text
Mock UO-like incident data
        |
normalizeIncident()
        |
Current Incidents Dashboard
        |
Generated Outputs
  - stakeholder messages
  - Teams-style thread preview
  - RSS XML preview
  - embeddable widget snippet
  - user report queue
        |
Optional network evidence card
```

## MVP Features

### Current Incidents Dashboard

Shows mock UO-like incidents for:

- Wireless
- Canvas
- DuckWeb
- Email
- VPN

Each incident includes service name, status, severity, message, source, and last updated time.

Demo value: gives judges a clear home screen that immediately shows service impact.

### Incident Normalizer

The app includes a `normalizeIncident()` function that converts incident data into one standard shape.

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

Demo value: shows how inconsistent status signals can become clean, reusable communication objects.

### Stakeholder Message Generator

For each selected incident, the app generates copy-ready messages for:

- Student-facing updates
- IT/internal updates
- Executive summaries

Demo value: this directly reduces manual communication overhead during incidents.

### Teams-Style Incident Thread Preview

Shows how an incident could appear in a collaboration channel, including a severity badge, latest update, suggested next message, and timestamped thread layout.

This is a preview only. It does not send real Teams messages.

Demo value: makes the workflow feel operational and status-ops aligned without requiring external accounts or webhooks.

### RSS Preview

Generates visible RSS XML for active incidents.

Demo value: shows how status updates could be consumed by other tools, subscribers, or campus systems.

### Embeddable Widget Preview

Shows a compact status widget and copyable iframe-style snippet.

Demo value: demonstrates how departments could display relevant status information without rebuilding status tooling.

### Report Outage Form

Lets a user submit a local outage report with:

- Affected service
- Location or network
- Description
- Optional contact

Submitted reports appear in a local queue and are not sent anywhere.

Demo value: adds bottom-up signal from students and staff.

### Network Evidence Card

Includes a "Run Network Evidence Check" button that attaches deterministic sample evidence to the selected incident:

- Latency
- Jitter
- Download quality
- Upload quality
- Checked timestamp

Demo value: adds cybersecurity/status-ops credibility while keeping the demo reliable. Live speed testing is intentionally not required.

## Tech Stack

- Vite
- React
- TypeScript
- Bun
- Tailwind CSS
- Local mock data and React state

No backend, database, authentication, scraping, monitoring integration, or real Teams messaging is required.

## Why This Stack

Vite React keeps the demo fast, local, and simple. TypeScript makes the incident model explicit. Tailwind enables quick visual polish for cards, badges, forms, and dashboard layout. Bun keeps install and dev commands fast.

## Run Locally

Install dependencies:

```bash
bun install
```

Start the demo:

```bash
bun run dev
```

Build for verification:

```bash
bun run build
```