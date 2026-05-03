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

/** Compact copy blocks: short enough to avoid textarea scrolling on a typical laptop layout. */
function buildCompactStakeholderBody(
  incident: Incident,
  variant: MessageVariant,
): string {
  const when = formatDateTime(incident.updatedAt);
  const headline = `${incident.service} · ${formatStatus(incident.status)} · ${incident.severity} · updated ${when}`;
  const officialBlock = [
    "OFFICIAL (status.uoregon.edu)",
    `"${incident.message}"`,
  ].join("\n");

  if (incident.status === "operational") {
    const affected =
      variant === "student"
        ? [
            "AFFECTED",
            `${incident.affectedAudience} — Status shows operational; errors may be device or network-specific.`,
          ].join("\n")
        : variant === "internal"
          ? [
              "AFFECTED",
              `${incident.affectedAudience} — Treat reports as isolated unless monitors contradict status.uoregon.edu.`,
            ].join("\n")
          : [
              "AFFECTED",
              `${incident.affectedAudience} — No exec action unless impact metrics or vendor risk spike.`,
            ].join("\n");

    const next =
      variant === "student"
        ? ["NEXT STEPS", "• Retry or try another browser/network.", "• Help: service.uoregon.edu"].join(
            "\n",
          )
        : variant === "internal"
          ? [
              "NEXT STEPS",
              `• Tag tickets with status time (${when}).`,
              "• Escalate only if tooling disagrees with the status page.",
            ].join("\n")
          : [
              "NEXT STEPS",
              "• Brief leadership only on measurable impact change.",
              "• Media / exec comms via University Communications & CIO protocols.",
            ].join("\n");

    return [headline, "", officialBlock, "", affected, "", next].join("\n");
  }

  const statusPhrase = statusLabels[incident.status];

  const affected =
    variant === "student"
      ? [
          "AFFECTED",
          `${incident.affectedAudience} — Service is ${statusPhrase}; symptoms may vary by location or device.`,
        ].join("\n")
      : variant === "internal"
        ? [
            "AFFECTED",
            `${incident.affectedAudience} — Align response to ${incident.severity}; mirror official language externally.`,
          ].join("\n")
        : [
            "AFFECTED",
            `${incident.affectedAudience} — Watch teaching/research deadlines and comms risk until cleared.`,
          ].join("\n");

  const next =
    variant === "student"
      ? [
          "NEXT STEPS",
          "• Watch status.uoregon.edu for updates.",
          "• Save work often; use alternatives only if your instructor/supervisor approves.",
          "• Help Desk if blocked: service.uoregon.edu",
        ].join("\n")
      : variant === "internal"
        ? [
            "NEXT STEPS",
            `• Bridge / ticket hygiene; cite ${when} and official text above.`,
            "• Pause risky changes on dependent systems until green.",
          ].join("\n")
        : [
            "NEXT STEPS",
            "• Sync with Communications if harm or press interest grows.",
            "• Avoid speculative ETAs unless engineering posts them on status.",
          ].join("\n");

  return [headline, "", officialBlock, "", affected, "", next].join("\n");
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
