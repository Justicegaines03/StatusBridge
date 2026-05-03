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
  return status.replace(/_/g, " ");
}

type MessageVariant = "student" | "internal" | "executive";

/**
 * Ultra-compact copy: ~6–8 lines so Outreach channel textareas fit without scrolling
 * at 8–9px type on a typical laptop + Messages stays readable.
 */
function buildCompactStakeholderBody(
  incident: Incident,
  variant: MessageVariant,
): string {
  const when = formatDateTime(incident.updatedAt);
  const headline = `${incident.service} · ${formatStatus(incident.status)} · ${incident.severity} · ${when}`;
  const official = `Official (status.uoregon.edu): "${incident.message}"`;

  if (incident.status === "operational") {
    const affected =
      variant === "student"
        ? `Audience: ${incident.affectedAudience} — operational on status; local/device issues possible.`
        : variant === "internal"
          ? `Audience: ${incident.affectedAudience} — isolate tickets unless monitors contradict status.uoregon.edu.`
          : `Audience: ${incident.affectedAudience} — exec action only if metrics or vendor risk spike.`;

    const next =
      variant === "student"
        ? `Next: retry / other browser or network · Help: service.uoregon.edu`
        : variant === "internal"
          ? `Next: tag ${when} · escalate only if tools disagree with status page`
          : `Next: brief leaders on measured impact only · media via Comms & CIO`;

    return [headline, "", official, "", affected, "", next].join("\n");
  }

  const statusPhrase = statusLabels[incident.status];

  const affected =
    variant === "student"
      ? `Audience: ${incident.affectedAudience} — ${statusPhrase}; impact may vary by site/device.`
      : variant === "internal"
        ? `Audience: ${incident.affectedAudience} — sev ${incident.severity}; mirror official wording externally.`
        : `Audience: ${incident.affectedAudience} — watch deadlines & comms risk until cleared.`;

  const next =
    variant === "student"
      ? `Next: status.uoregon.edu · save work · alt tools only if approved · Help: service.uoregon.edu`
      : variant === "internal"
        ? `Next: cite ${when} + official above · pause risky deploys on dependents until green`
        : `Next: loop Comms if harm/press · no ETAs unless posted on status`;

  return [headline, "", official, "", affected, "", next].join("\n");
}

export function generateStakeholderMessages(
  incident: Incident,
): StakeholderMessages {
  return {
    student: buildCompactStakeholderBody(incident, "student"),
    internal: buildCompactStakeholderBody(incident, "internal"),
    executive: buildCompactStakeholderBody(incident, "executive"),
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** RSS 2.0 item for paste fields — formatted across lines for readability in the UI. */
export function generateRssItemSnippet(incident: Incident): string {
  const title = `${incident.service} — ${formatStatus(incident.status)}`;
  const pub = new Date(incident.updatedAt).toUTCString();
  return `<item>
  <title>${escapeXml(title)}</title>
  <description>${escapeXml(incident.message)}</description>
  <pubDate>${pub}</pubDate>
  <guid isPermaLink="false">statusbridge-${incident.id}</guid>
</item>`;
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
