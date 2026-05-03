import { generateStakeholderMessages } from "./generators";
import type { Incident, StakeholderMessages, UserReport } from "../types";

const DEFAULT_MODEL = "gemini-2.0-flash";
const MAX_TRIAGE_IN_PROMPT = 12;
const MAX_TRIAGE_DESC_CHARS = 400;
const API_VERSION = "v1";
const MODEL_FALLBACKS: string[] = [];
/** IDs from ListModels that support generateContent (session cache). */
let cachedModelsSupportingGenerate: string[] | null = null;

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

function buildEffectiveCandidateOrder(
  available: string[],
  modelCandidates: string[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (id: string) => {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  };
  for (const m of modelCandidates) {
    if (available.includes(m)) {
      push(m);
    }
  }
  const autoPick =
    modelCandidates.find((m) => available.includes(m)) ??
    available.find((m) => m.includes("flash")) ??
    available[0] ??
    null;
  if (autoPick) {
    push(autoPick);
  }
  for (const m of available) {
    push(m);
  }
  if (out.length === 0) {
    for (const m of modelCandidates) {
      push(m);
    }
  }
  return out;
}

async function fetchModelsSupportingGenerate(
  apiKey: string,
  preferredModels: string[],
): Promise<string[]> {
  if (cachedModelsSupportingGenerate?.length) {
    // #region agent log
    fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "4798fb",
      },
      body: JSON.stringify({
        sessionId: "4798fb",
        runId: "post-fix",
        hypothesisId: "H2",
        location: "geminiDraft.ts:fetchModelsSupportingGenerate",
        message: "using cached model list",
        data: { cachedCount: cachedModelsSupportingGenerate.length },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return cachedModelsSupportingGenerate;
  }

  const listUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(listUrl);
  if (!response.ok) {
    // #region agent log
    fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "4798fb",
      },
      body: JSON.stringify({
        sessionId: "4798fb",
        runId: "post-fix",
        hypothesisId: "H2",
        location: "geminiDraft.ts:fetchModelsSupportingGenerate:listFail",
        message: "listModels non-OK",
        data: { httpStatus: response.status },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return [];
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

  cachedModelsSupportingGenerate = available;
  const chosen =
    preferredModels.find((m) => available.includes(m)) ??
    available.find((m) => m.includes("flash")) ??
    available[0] ??
    null;
  // #region agent log
  fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "4798fb",
    },
    body: JSON.stringify({
      sessionId: "4798fb",
      runId: "post-fix",
      hypothesisId: "H2",
      location: "geminiDraft.ts:fetchModelsSupportingGenerate:resolved",
      message: "listModels parsed",
      data: {
        chosen,
        availableCount: available.length,
        preferredFirst: preferredModels[0] ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return available;
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

/** Deterministic hints so the model surfaces volume, buildings, and clusters. */
function summarizeTriageSignals(triage: UserReport[]): string {
  if (triage.length === 0) {
    return "";
  }
  const byLocation = new Map<string, number>();
  for (const r of triage) {
    const key = r.location.trim() || "(location not specified)";
    byLocation.set(key, (byLocation.get(key) ?? 0) + 1);
  }
  const ranked = [...byLocation.entries()].sort((a, b) => b[1] - a[1]);
  const locationLines = ranked
    .slice(0, 8)
    .map(([loc, n]) =>
      n > 1 ? `- ${n} reports from / mentioning: ${loc}` : `- 1 report: ${loc}`,
    )
    .join("\n");
  return `Triage signals (counts from the Location/network field — use with full reports below):
- Total reports in this batch: ${triage.length}
- Distribution (note clusters = possible building, department, or network pocket):
${locationLines}`;
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
  const triageSignals = summarizeTriageSignals(triage);

  return `You draft incident communications for a university IT status team. The official status page (e.g. status.uoregon.edu) is the system of record.

Official incident (verified — use as ground truth; do not contradict):
- Service: ${incident.service}
- Status: ${incident.status}
- Severity: ${incident.severity}
- Last updated: ${incident.updatedAt}
- Affected audience (summary): ${incident.affectedAudience}
- Official message (quote or paraphrase faithfully; include this exact line once verbatim in each audience variant): ${JSON.stringify(incident.message)}

${
    triageSignals
      ? `${triageSignals}\n\n`
      : ""
}Campus triage reports (user-submitted, unverified — may be wrong, duplicate, or noisy; still READ them and reflect patterns):
${triageBlock}

Return ONLY valid JSON with these exact keys and string values (no markdown fence):
{"student":"...","internal":"...","executive":"..."}

Requirements:
- If there is at least one triage report, EVERY audience variant must briefly incorporate what triage shows: volume (e.g. "multiple reports", "several users"), recurring symptoms or themes in the descriptions, and geographic or organizational clustering from the Location/network field (specific building, department, residence hall, lab, or network name when repeated). If one location dominates, say so. If reports are scattered, say that instead of implying a single site.
- student: plain language, non-technical, reassuring, what to do next; suitable for email or portal. Use cautious wording ("we're hearing reports that…", "some users have noted…") since triage is unverified.
- internal: concise operational tone for IT/Teams/Slack; mirror official wording externally; explicitly call out location clusters and symptom themes for situational awareness and routing.
- executive: very short briefing (under ~120 words), decision-relevant, no blame; include triage-derived pattern summary if reports exist.
- Do not invent causes, ETAs, or scope not implied by the official message or triage text.
- If triage conflicts with the official message, trust the official message and do not repeat the conflicting triage claim as fact.`;
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
    return generateStakeholderMessages(incident, reports);
  }

  const prompt = buildPrompt(incident, triage);

  try {
    const available = await fetchModelsSupportingGenerate(
      apiKey,
      modelCandidates,
    );
    const effectiveCandidates = buildEffectiveCandidateOrder(
      available,
      modelCandidates,
    );
    // #region agent log
    fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "4798fb",
      },
      body: JSON.stringify({
        sessionId: "4798fb",
        runId: "post-fix",
        hypothesisId: "H2",
        location: "geminiDraft.ts:draftStakeholderMessagesWithGemini:order",
        message: "effective generateContent model order",
        data: {
          tryCount: effectiveCandidates.length,
          head: effectiveCandidates.slice(0, 8),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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

      let errorSnippet: string | undefined;
      const rawJson = await response.json().catch(() => null);
      if (!response.ok) {
        const errObj = rawJson as { error?: { message?: string; status?: string } } | null;
        errorSnippet = errObj?.error?.message?.slice(0, 200);
        // #region agent log
        fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "4798fb",
          },
          body: JSON.stringify({
            sessionId: "4798fb",
            runId: "post-fix",
            hypothesisId: "H3",
            location: "geminiDraft.ts:generateContent",
            message: "generateContent HTTP error",
            data: {
              model,
              httpStatus: response.status,
              errorSnippet,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        continue;
      }

      const data = rawJson as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
        promptFeedback?: { blockReason?: string };
      };
      const text =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("") ?? "";

      const parsed = parseStakeholderJson(text);
      // #region agent log
      fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "4798fb",
        },
        body: JSON.stringify({
          sessionId: "4798fb",
            runId: "post-fix",
            hypothesisId: "H4",
            location: "geminiDraft.ts:generateContent:body",
          message: "generateContent parsed body",
          data: {
            model,
            httpStatus: response.status,
            candidateCount: data.candidates?.length ?? 0,
            textLen: text.length,
            textHead: text.slice(0, 160),
            parseOk: Boolean(parsed),
            blockReason: data.promptFeedback?.blockReason ?? null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (parsed) {
        return parsed;
      }
    }
  } catch {
    // #region agent log
    fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "4798fb",
      },
      body: JSON.stringify({
        sessionId: "4798fb",
        runId: "post-fix",
        hypothesisId: "H3",
        location: "geminiDraft.ts:draftStakeholderMessagesWithGemini:catch",
        message: "exception in gemini path",
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    /* fall through */
  }

  // #region agent log
  fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "4798fb",
    },
    body: JSON.stringify({
      sessionId: "4798fb",
      runId: "post-fix",
      hypothesisId: "H5",
      location: "geminiDraft.ts:draftStakeholderMessagesWithGemini:fallback",
      message: "returning template fallback",
      data: { incidentId: incident.id },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return generateStakeholderMessages(incident, reports);
}
