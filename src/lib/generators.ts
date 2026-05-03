import type {
  Incident,
  NetworkEvidence,
  StakeholderMessages,
  UserReport,
} from "../types";

const MAX_TEMPLATE_TRIAGE = 12;
const MAX_TEMPLATE_DESC_CHARS = 200;

function triageForTemplate(
  reports: UserReport[],
  service: string,
): UserReport[] {
  return reports
    .filter((r) => r.service === service)
    .slice(0, MAX_TEMPLATE_TRIAGE)
    .map((r) => ({
      ...r,
      description:
        r.description.length > MAX_TEMPLATE_DESC_CHARS
          ? `${r.description.slice(0, MAX_TEMPLATE_DESC_CHARS)}…`
          : r.description,
    }));
}

type TriageBlurb = { student: string; internal: string; executive: string };

function buildTriageBlurbs(triage: UserReport[]): TriageBlurb | null {
  if (triage.length === 0) {
    return null;
  }

  const byLocation = new Map<string, number>();
  for (const r of triage) {
    const key = r.location.trim() || "unspecified location";
    byLocation.set(key, (byLocation.get(key) ?? 0) + 1);
  }
  const ranked = [...byLocation.entries()].sort((a, b) => b[1] - a[1]);
  const n = triage.length;
  const volume =
    n === 1
      ? "One unverified campus report"
      : n >= 4
        ? `${n} unverified campus reports (notable volume)`
        : `${n} unverified campus reports`;

  const topPhrase = ranked
    .slice(0, 4)
    .map(([loc, c]) => (c > 1 ? `${loc} (${c})` : loc))
    .join(", ");

  const [headLoc, headCount] = ranked[0] ?? ["", 0];
  const clusterNote =
    headCount >= 2
      ? ` Strongest cluster: ${headLoc} (${headCount}).`
      : n >= 3
        ? " Reports span several locations—no single site dominates."
        : "";

  const themeSamples = triage
    .slice(0, 3)
    .map((r) => r.description.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const themesPreview =
    themeSamples.length > 0
      ? ` Themes in descriptions: ${themeSamples.join(" · ")}${triage.length > 3 ? " …" : ""}`
      : "";

  return {
    student: `Triage (unverified): ${volume}. Mentions by location/network: ${topPhrase}.${clusterNote}${themesPreview} Use the official message as truth; triage may be incomplete or wrong.`,
    internal: `Triage: ${n} reports | loc skew: ${topPhrase}${clusterNote} | Cross-check descriptions for overlapping symptoms before assigning.`,
    executive: `Unverified triage: ${volume}; geographic hint: ${topPhrase}.${clusterNote ? clusterNote.trim() : ""}`,
  };
}

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
  triageBlurb: TriageBlurb | null,
): string {
  const when = formatDateTime(incident.updatedAt);
  const headline = `${incident.service} · ${formatStatus(incident.status)} · ${incident.severity} · ${when}`;
  const official = `Official (status.uoregon.edu): "${incident.message}"`;
  const triageLine = triageBlurb ? triageBlurb[variant] : null;

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

    const core = [headline, "", official];
    if (triageLine) {
      core.push("", triageLine);
    }
    core.push("", affected, "", next);
    return core.join("\n");
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

  const core = [headline, "", official];
  if (triageLine) {
    core.push("", triageLine);
  }
  core.push("", affected, "", next);
  return core.join("\n");
}

export function generateStakeholderMessages(
  incident: Incident,
  reports: UserReport[] = [],
): StakeholderMessages {
  const triage = triageForTemplate(reports, incident.service);
  const triageBlurb = buildTriageBlurbs(triage);
  return {
    student: buildCompactStakeholderBody(incident, "student", triageBlurb),
    internal: buildCompactStakeholderBody(incident, "internal", triageBlurb),
    executive: buildCompactStakeholderBody(incident, "executive", triageBlurb),
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
