import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useStatusBridge } from "../StatusBridgeContext";
import { mockIncidents } from "../data/incidents";
import {
  Badge,
  CopyButton,
  Panel,
  severityClasses,
} from "../components/bridgeUi";
import {
  formatDateTime,
  formatStatus,
  generateRssXml,
  generateWidgetSnippet,
} from "../lib/generators";

export function OutreachPage() {
  const { selectedIncident, networkEvidence, runEvidenceCheck } =
    useStatusBridge();

  const rssXml = useMemo(() => generateRssXml(mockIncidents), []);
  const widgetSnippet = useMemo(
    () => generateWidgetSnippet(selectedIncident),
    [selectedIncident],
  );
  const selectedEvidence = networkEvidence[selectedIncident.id];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
          Step 3 · Outreach &amp; distribution
        </p>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Previews for channels, unit sites, feeds, and optional ops context —
          all tied to{" "}
          <span className="font-semibold text-slate-800">
            {selectedIncident.service}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Collaboration thread preview" eyebrow="Channel-style layout">
          <div className="rounded-2xl border border-slate-200 bg-[#f5f5fb] p-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  # incident-comms
                </p>
                <h3 className="mt-1 font-black text-slate-950">
                  {selectedIncident.service} incident
                </h3>
              </div>
              <Badge className={severityClasses[selectedIncident.severity]}>
                {selectedIncident.severity}
              </Badge>
            </div>
            <div className="mt-4 max-h-[min(22rem,45vh)] space-y-4 overflow-y-auto pr-1">
              {[
                [
                  "Initial update",
                  selectedIncident.message,
                  selectedIncident.updatedAt,
                ],
                [
                  "Investigation update",
                  `IT is reviewing reports from ${selectedIncident.affectedAudience.toLowerCase()}`,
                  new Date().toISOString(),
                ],
                [
                  "Next suggested update",
                  "Share a follow-up in 30 minutes or sooner if service conditions change.",
                  new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                ],
              ].map(([title, body, timestamp]) => (
                <div className="rounded-2xl bg-white p-3" key={title}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(timestamp)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Embeddable unit widget" eyebrow="Department sites">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Department widget
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-black">{selectedIncident.service}</p>
                <p className="text-sm text-slate-300">
                  {formatStatus(selectedIncident.status)}
                </p>
              </div>
              <Badge className={severityClasses[selectedIncident.severity]}>
                {selectedIncident.severity}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-slate-200">
              {selectedIncident.message}
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-700">Embed snippet</p>
              <CopyButton value={widgetSnippet} />
            </div>
            <code className="block max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-700">
              {widgetSnippet}
            </code>
          </div>
        </Panel>
      </div>

      <Panel title="RSS feed output" eyebrow="Subscribers & integrations">
        <pre className="max-h-64 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-emerald-100">
          <code>{rssXml}</code>
        </pre>
      </Panel>

      <Panel title="Network evidence (optional)" eyebrow="Ops attachment">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Attach a deterministic sample card for{" "}
            <span className="font-bold text-slate-900">
              {selectedIncident.service}
            </span>{" "}
            to pair with internal outreach. No live speed test required in this
            build.
          </p>
          <button
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
            onClick={runEvidenceCheck}
            type="button"
          >
            Generate evidence sample
          </button>
        </div>
        {selectedEvidence ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Latency", `${selectedEvidence.latencyMs}ms`],
              ["Jitter", `${selectedEvidence.jitterMs}ms`],
              ["Download", selectedEvidence.downloadQuality],
              ["Upload", selectedEvidence.uploadQuality],
            ].map(([label, value]) => (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                key={label}
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-black capitalize text-slate-950">
                  {value}
                </p>
              </div>
            ))}
            <p className="sm:col-span-2 lg:col-span-4 text-sm text-slate-500">
              Checked at {formatDateTime(selectedEvidence.checkedAt)}
            </p>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            No evidence sample generated for this incident yet.
          </p>
        )}
      </Panel>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
        <Link
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-900"
          to="/messages"
        >
          ← Back to messages
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-900"
          to="/workspace"
        >
          Back to workspace
        </Link>
      </div>
    </div>
  );
}
