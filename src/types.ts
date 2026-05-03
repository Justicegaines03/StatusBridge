export type IncidentStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage";

export type Severity = "low" | "medium" | "high" | "critical";

export type IncidentSource =
  | "mock"
  | "status_page"
  | "user_report"
  | "network_evidence";

export type Incident = {
  id: string;
  service: string;
  status: IncidentStatus;
  severity: Severity;
  message: string;
  affectedAudience: string;
  source: IncidentSource;
  updatedAt: string;
};

export type UserReport = {
  id: string;
  service: string;
  location: string;
  description: string;
  contact?: string;
  createdAt: string;
};

export type NetworkEvidence = {
  incidentId: string;
  latencyMs: number;
  jitterMs: number;
  downloadQuality: "normal" | "degraded" | "poor";
  uploadQuality: "normal" | "degraded" | "poor";
  checkedAt: string;
};

export type StakeholderMessages = {
  student: string;
  internal: string;
  executive: string;
};
