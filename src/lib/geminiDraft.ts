import { generateStakeholderMessages } from "./generators";
import type { Incident, StakeholderMessages, UserReport } from "../types";

const DEFAULT_MODEL = "gemini-2.0-flash";
const MAX_TRIAGE_IN_PROMPT = 12;
const MAX_TRIAGE_DESC_CHARS = 400;
const API_VERSION = "v1";
const MODEL_FALLBACKS: string[] = [];
let cachedResolvedModel: string | null = null;

function normalizeModelName(value: string): string {
  const lower = value.trim().toLowerCase();
  if (!lower) {
    return DEFAULT_MODEL;
  }
  if (lower.startsWith("models/")) {
    return lower.slice("models/".length);
  }
  return lower.replace(/\s+/g, "-");
}

function buildModelCandidates(modelFromEnv: string | undefined): string[] {
  const preferred = normalizeModelName(modelFromEnv ?? DEFAULT_MODEL);
  const seen = new Set<string>();
  const ordered = [preferred, ...MODEL_FALLBACKS];
  const deduped: string[] = [];
  for (const model of ordered) {
    if (!seen.has(model)) {
      seen.add(model);
      deduped.push(model);
    }
  }
  return deduped;
}

async function resolveSupportedModel(
  apiKey: string,
  preferredModels: string[],
): Promise<string | null> {
  if (cachedResolvedModel) {
    return cachedResolvedModel;
  }

  const listUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(listUrl);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
  };
  const available = (data.models ?? [])
    .filter((m) =>
      (m.supportedGenerationMethods ?? []).includes("generateContent"),
    )
    .map((m) => (m.name ?? "").replace(/^models\//, ""))
    .filter(Boolean);

  const chosen =
    preferredModels.find((m) => available.includes(m)) ??
    available.find((m) => m.includes("flash")) ??
    available[0] ??
    null;

  if (chosen) {
    cachedResolvedModel = chosen;
  }
  return chosen;
}

function trimTriageReports(
  reports: UserReport[],
  service: string,
): UserReport[] {
  return reports
    .filter((r) => r.service === service)
    .slice(0, MAX_TRIAGE_IN_PROMPT)
    .map((r) => ({
      ...r,
      description:
        r.description.length > MAX_TRIAGE_DESC_CHARS
          ? `${r.description.slice(0, MAX_TRIAGE_DESC_CHARS)}…`
          : r.description,
    }));
}

function buildPrompt(incident: Incident, triage: UserReport[]): string {
  const triageBlock =
    triage.length === 0
      ? "No campus triage reports for this service yet."
      : triage
          .map(
            (r, i) =>
              `${i + 1}. Location/network: ${r.location}\n   Report: ${r.description}${r.contact ? `\n   Contact on file: yes` : ""}\n   Received: ${r.createdAt}`,
          )
          .join("\n\n");

  return `You draft incident communications for a university IT status team. The official status page (e.g. status.uoregon.edu) is the system of record.

Official incident (verified — use as ground truth; do not contradict):
- Service: ${incident.service}
- Status: ${incident.status}
- Severity: ${incident.severity}
- Last updated: ${incident.updatedAt}
- Affected audience (summary): ${incident.affectedAudience}
- Official message (quote or paraphrase faithfully; include this exact line once verbatim in each audience variant): ${JSON.stringify(incident.message)}

Campus triage reports (user-submitted, unverified — use only as optional context, may be wrong or duplicate):
${triageBlock}

Return ONLY valid JSON with these exact keys and string values (no markdown fence):
{"student":"...","internal":"...","executive":"..."}

Requirements:
- student: plain language, non-technical, reassuring, what to do next; suitable for email or portal.
- internal: concise operational tone for IT/Teams/Slack; mirror official wording externally; no speculation beyond triage hints.
- executive: very short briefing (under ~120 words), decision-relevant, no blame.
- Do not invent causes, ETAs, or scope not implied by the official message or triage.
- If triage conflicts with the official message, trust the official message.`;
}

function parseStakeholderJson(text: string): StakeholderMessages | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  const slice = trimmed.slice(start, end + 1);
  try {
    const parsed = JSON.parse(slice) as Record<string, unknown>;
    const student = parsed.student;
    const internal = parsed.internal;
    const executive = parsed.executive;
    if (
      typeof student === "string" &&
      typeof internal === "string" &&
      typeof executive === "string" &&
      student.length > 0 &&
      internal.length > 0 &&
      executive.length > 0
    ) {
      return { student, internal, executive };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Drafts stakeholder messages via Gemini when VITE_GEMINI_API_KEY is set;
 * otherwise returns the deterministic template from generateStakeholderMessages.
 */
export async function draftStakeholderMessagesWithGemini(
  incident: Incident,
  reports: UserReport[],
): Promise<StakeholderMessages> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  const configuredModel = import.meta.env.VITE_GEMINI_MODEL?.trim();
  const triage = trimTriageReports(reports, incident.service);
  const modelCandidates = buildModelCandidates(configuredModel);

  if (!apiKey) {
    return generateStakeholderMessages(incident);
  }

  const prompt = buildPrompt(incident, triage);

  try {
    const resolvedModel = await resolveSupportedModel(apiKey, modelCandidates);
    const effectiveCandidates = resolvedModel
      ? [resolvedModel]
      : modelCandidates;
    for (const model of effectiveCandidates) {
      const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        continue;
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
      const text =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("") ?? "";

      const parsed = parseStakeholderJson(text);
      if (parsed) {
        return parsed;
      }
    }
  } catch {
    /* fall through */
  }

  return generateStakeholderMessages(incident);
}
