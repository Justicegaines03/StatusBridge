import type { Incident, IncidentSource, IncidentStatus, Severity } from "../types";

const statuses: IncidentStatus[] = [
  "operational",
  "degraded",
  "partial_outage",
  "major_outage",
];

const severities: Severity[] = ["low", "medium", "high", "critical"];

const sources: IncidentSource[] = [
  "mock",
  "status_page",
  "user_report",
  "network_evidence",
];

export function normalizeIncident(incident: Incident): Incident {
  return {
    id: incident.id.trim().toLowerCase(),
    service: incident.service.trim(),
    status: statuses.includes(incident.status) ? incident.status : "operational",
    severity: severities.includes(incident.severity) ? incident.severity : "low",
    message: incident.message.trim(),
    affectedAudience: incident.affectedAudience.trim(),
    source: sources.includes(incident.source) ? incident.source : "mock",
    updatedAt: incident.updatedAt,
  };
}

const rawIncidents: Incident[] = [
  {
    id: "wireless",
    service: "Wireless",
    status: "degraded",
    severity: "high",
    message: "Intermittent wireless connectivity reported in parts of campus.",
    affectedAudience: "Students, faculty, and staff using campus Wi-Fi.",
    source: "mock",
    updatedAt: "2026-05-02T14:35:00-07:00",
  },
  {
    id: "canvas",
    service: "Canvas",
    status: "partial_outage",
    severity: "medium",
    message: "Some users may experience delays loading course materials.",
    affectedAudience: "Students and instructors using Canvas.",
    source: "mock",
    updatedAt: "2026-05-02T14:20:00-07:00",
  },
  {
    id: "duckweb",
    service: "DuckWeb",
    status: "operational",
    severity: "low",
    message: "DuckWeb is operating normally.",
    affectedAudience: "Students and staff accessing registration and account services.",
    source: "mock",
    updatedAt: "2026-05-02T13:58:00-07:00",
  },
  {
    id: "email",
    service: "Email",
    status: "degraded",
    severity: "medium",
    message: "Email delivery delays may affect some users.",
    affectedAudience: "Campus email users.",
    source: "mock",
    updatedAt: "2026-05-02T14:42:00-07:00",
  },
  {
    id: "vpn",
    service: "VPN",
    status: "major_outage",
    severity: "critical",
    message: "VPN access is currently unavailable for some remote users.",
    affectedAudience: "Remote staff, faculty, and students.",
    source: "mock",
    updatedAt: "2026-05-02T14:50:00-07:00",
  },
];

export const mockIncidents = rawIncidents.map(normalizeIncident);
