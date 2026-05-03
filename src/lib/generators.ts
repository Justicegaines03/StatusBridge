import type {
  Incident,
  NetworkEvidence,
  StakeholderMessages,
} from "../types";

const statusLabels: Record<Incident["status"], string> = {
  operational: "operating normally",
  degraded: "currently degraded",
  partial_outage: "experiencing a partial outage",
  major_outage: "experiencing a major outage",
};

const qualityBySeverity: Record<
  Incident["severity"],
  Pick<NetworkEvidence, "latencyMs" | "jitterMs" | "downloadQuality" | "uploadQuality">
> = {
  low: {
    latencyMs: 24,
    jitterMs: 3,
    downloadQuality: "normal",
    uploadQuality: "normal",
  },
  medium: {
    latencyMs: 42,
    jitterMs: 8,
    downloadQuality: "degraded",
    uploadQuality: "normal",
  },
  high: {
    latencyMs: 68,
    jitterMs: 14,
    downloadQuality: "degraded",
    uploadQuality: "degraded",
  },
  critical: {
    latencyMs: 112,
    jitterMs: 28,
    downloadQuality: "poor",
    uploadQuality: "degraded",
  },
};

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatStatus(status: Incident["status"]): string {
  return status.replace("_", " ");
}

export function generateStakeholderMessages(
  incident: Incident,
): StakeholderMessages {
  const statusPhrase = statusLabels[incident.status];

  if (incident.status === "operational") {
    return {
      student: `${incident.service} is operating normally. No action is needed at this time.`,
      internal: `${incident.service} is currently operational. Continue routine monitoring and keep this status available for reference.`,
      executive: `${incident.service} is operating normally with no active incident communication needed.`,
    };
  }

  return {
    student: `${incident.service} service is ${statusPhrase}. IT is investigating. ${incident.affectedAudience} may experience service interruptions and should use available alternatives where possible.`,
    internal: `${incident.service} ${formatStatus(incident.status)} reported for ${incident.affectedAudience.toLowerCase()} Continue monitoring user reports and network quality evidence while investigation is underway.`,
    executive: `${incident.service} is ${statusPhrase}. IT is investigating and user-facing messaging is available for distribution.`,
  };
}

export function generateRssXml(incidents: Incident[]): string {
  const activeIncidents = incidents.filter(
    (incident) => incident.status !== "operational",
  );

  const items = activeIncidents
    .map(
      (incident) => `    <item>
      <title>${incident.service} ${formatStatus(incident.status)}</title>
      <description>${incident.message}</description>
      <pubDate>${new Date(incident.updatedAt).toUTCString()}</pubDate>
      <guid>statusbridge-lite-${incident.id}</guid>
    </item>`,
    )
    .join("\n");

  return `<rss version="2.0">
  <channel>
    <title>StatusBridge Lite Updates</title>
    <description>Accessible university incident communication previews.</description>
${items}
  </channel>
</rss>`;
}

export function generateWidgetSnippet(incident: Incident): string {
  return `<iframe src="https://statusbridge.demo/widget?service=${incident.id}" title="${incident.service} status widget"></iframe>`;
}

export function generateNetworkEvidence(incident: Incident): NetworkEvidence {
  return {
    incidentId: incident.id,
    ...qualityBySeverity[incident.severity],
    checkedAt: new Date().toISOString(),
  };
}
