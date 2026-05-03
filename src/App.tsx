import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { mockIncidents } from "./data/incidents";
import {
  formatDateTime,
  formatStatus,
  generateNetworkEvidence,
  generateRssXml,
  generateStakeholderMessages,
  generateWidgetSnippet,
} from "./lib/generators";
import type { Incident, NetworkEvidence, Severity, UserReport } from "./types";

const severityClasses: Record<Severity, string> = {
  low: "bg-slate-100 text-slate-700 ring-slate-200",
  medium: "bg-amber-100 text-amber-800 ring-amber-200",
  high: "bg-orange-100 text-orange-800 ring-orange-200",
  critical: "bg-red-100 text-red-800 ring-red-200",
};

const statusClasses: Record<Incident["status"], string> = {
  operational: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  degraded: "bg-amber-100 text-amber-800 ring-amber-200",
  partial_outage: "bg-orange-100 text-orange-800 ring-orange-200",
  major_outage: "bg-red-100 text-red-800 ring-red-200",
};

const sourceLabels: Record<Incident["source"], string> = {
  mock: "Mock status feed",
  status_page: "Official status page",
  user_report: "User report",
  network_evidence: "Network evidence",
};

const emptyReport = {
  service: "Wireless",
  location: "",
  description: "",
  contact: "",
};

function Badge({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CopyButton({ value }: { value: string }) {
  const [label, setLabel] = useState("Copy");

  async function copy() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setLabel("Copied");
    window.setTimeout(() => setLabel("Copy"), 1200);
  }

  return (
    <button
      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
      onClick={copy}
      type="button"
    >
      {label}
    </button>
  );
}

function App() {
  const [selectedIncidentId, setSelectedIncidentId] = useState(
    mockIncidents[0].id,
  );
  const [reports, setReports] = useState<UserReport[]>([]);
  const [reportDraft, setReportDraft] = useState(emptyReport);
  const [networkEvidence, setNetworkEvidence] = useState<
    Record<string, NetworkEvidence>
  >({});

  const selectedIncident = useMemo(
    () =>
      mockIncidents.find((incident) => incident.id === selectedIncidentId) ??
      mockIncidents[0],
    [selectedIncidentId],
  );

  const messages = useMemo(
    () => generateStakeholderMessages(selectedIncident),
    [selectedIncident],
  );
  const rssXml = useMemo(() => generateRssXml(mockIncidents), []);
  const widgetSnippet = useMemo(
    () => generateWidgetSnippet(selectedIncident),
    [selectedIncident],
  );
  const selectedEvidence = networkEvidence[selectedIncident.id];

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reportDraft.location.trim() || !reportDraft.description.trim()) {
      return;
    }

    setReports((currentReports) => [
      {
        id: crypto.randomUUID(),
        service: reportDraft.service,
        location: reportDraft.location.trim(),
        description: reportDraft.description.trim(),
        contact: reportDraft.contact.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
      ...currentReports,
    ]);
    setReportDraft({ ...emptyReport, service: reportDraft.service });
  }

  function runEvidenceCheck() {
    const evidence = generateNetworkEvidence(selectedIncident);
    setNetworkEvidence((currentEvidence) => ({
      ...currentEvidence,
      [selectedIncident.id]: evidence,
    }));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d1fae5,transparent_32rem),linear-gradient(180deg,#f8fafc,#eef2ff)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-slate-950 text-white shadow-soft">
          <div className="grid gap-6 p-6 md:grid-cols-[1.35fr_0.65fr] md:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Hackathon demo
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                StatusBridge Lite
              </h1>
              <p className="mt-3 max-w-3xl text-lg text-slate-200">
                Incident communication layer for official university status
                pages
              </p>
              <p className="mt-4 max-w-3xl rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
                Demo uses mock UO-like service data. Official status page
                remains source of truth.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-emerald-200">
                Product one-liner
              </p>
              <p className="mt-3 text-xl font-bold leading-snug">
                Turns incidents into accessible, reusable communications without
                replacing the official status page.
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Panel title="Current Incidents" eyebrow="Official-page companion">
              <div className="space-y-3">
                {mockIncidents.map((incident) => {
                  const isSelected = incident.id === selectedIncident.id;

                  return (
                    <article
                      className={`rounded-2xl border p-4 transition ${
                        isSelected
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      key={incident.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-950">
                            {incident.service}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {incident.message}
                          </p>
                        </div>
                        <Badge className={severityClasses[incident.severity]}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge className={statusClasses[incident.status]}>
                          {formatStatus(incident.status)}
                        </Badge>
                        <span className="text-xs font-medium text-slate-500">
                          {sourceLabels[incident.source]} · Updated{" "}
                          {formatDateTime(incident.updatedAt)}
                        </span>
                      </div>
                      <button
                        className={`mt-4 w-full rounded-xl px-4 py-2 text-sm font-bold transition ${
                          isSelected
                            ? "bg-emerald-700 text-white"
                            : "bg-slate-950 text-white hover:bg-emerald-700"
                        }`}
                        onClick={() => setSelectedIncidentId(incident.id)}
                        type="button"
                      >
                        {isSelected ? "Selected" : "View incident details"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Report Outage" eyebrow="Local-only intake">
              <form className="space-y-4" onSubmit={submitReport}>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Service
                  </span>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                    onChange={(event) =>
                      setReportDraft({
                        ...reportDraft,
                        service: event.target.value,
                      })
                    }
                    value={reportDraft.service}
                  >
                    {mockIncidents.map((incident) => (
                      <option key={incident.id}>{incident.service}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Location / network
                  </span>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    onChange={(event) =>
                      setReportDraft({
                        ...reportDraft,
                        location: event.target.value,
                      })
                    }
                    placeholder="Knight Library, residence hall, VPN, etc."
                    value={reportDraft.location}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Description
                  </span>
                  <textarea
                    className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2"
                    onChange={(event) =>
                      setReportDraft({
                        ...reportDraft,
                        description: event.target.value,
                      })
                    }
                    placeholder="What are users experiencing?"
                    value={reportDraft.description}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Optional contact
                  </span>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    onChange={(event) =>
                      setReportDraft({
                        ...reportDraft,
                        contact: event.target.value,
                      })
                    }
                    placeholder="name@example.edu"
                    value={reportDraft.contact}
                  />
                </label>
                <button
                  className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                  type="submit"
                >
                  Add to User Report Queue
                </button>
              </form>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Selected Incident Detail" eyebrow="Reusable context">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="text-2xl font-black">
                    {selectedIncident.service}
                  </h3>
                  <p className="mt-2 text-slate-700">
                    {selectedIncident.message}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    Affected audience:{" "}
                    <span className="font-semibold text-slate-700">
                      {selectedIncident.affectedAudience}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Source: {sourceLabels[selectedIncident.source]} · Updated{" "}
                    {formatDateTime(selectedIncident.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2 md:justify-end">
                  <Badge className={statusClasses[selectedIncident.status]}>
                    {formatStatus(selectedIncident.status)}
                  </Badge>
                  <Badge className={severityClasses[selectedIncident.severity]}>
                    {selectedIncident.severity}
                  </Badge>
                </div>
              </div>
            </Panel>

            <Panel title="Stakeholder Message Generator" eyebrow="Copy-ready">
              <div className="grid gap-3">
                {[
                  ["Student-facing update", messages.student],
                  ["IT/internal update", messages.internal],
                  ["Executive summary", messages.executive],
                ].map(([title, message]) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    key={title}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-slate-950">{title}</h3>
                      <CopyButton value={message} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {message}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Teams-Style Thread Preview">
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
                    <Badge
                      className={severityClasses[selectedIncident.severity]}
                    >
                      {selectedIncident.severity}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-4">
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
                          <p className="text-sm font-bold text-slate-900">
                            {title}
                          </p>
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

              <Panel title="Embeddable Widget Preview">
                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                    Department widget
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">
                        {selectedIncident.service}
                      </p>
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
                    <p className="text-sm font-bold text-slate-700">
                      Copyable snippet
                    </p>
                    <CopyButton value={widgetSnippet} />
                  </div>
                  <code className="block overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                    {widgetSnippet}
                  </code>
                </div>
              </Panel>
            </div>

            <Panel title="RSS Preview" eyebrow="Visible feed output">
              <pre className="max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-emerald-100">
                <code>{rssXml}</code>
              </pre>
            </Panel>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Network Evidence Card" eyebrow="Sample fallback">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Attach a deterministic evidence sample to{" "}
                <span className="font-bold text-slate-900">
                  {selectedIncident.service}
                </span>
                . The demo does not depend on a live speed test.
              </p>
              <button
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                onClick={runEvidenceCheck}
                type="button"
              >
                Run Network Evidence Check
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
                No evidence sample has been generated for this incident yet.
              </p>
            )}
          </Panel>

          <Panel title="User Report Queue" eyebrow="Stored in React state">
            {reports.length ? (
              <div className="space-y-3">
                {reports.map((report) => (
                  <article
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    key={report.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {report.service} · {report.location}
                        </h3>
                        <p className="mt-1 text-sm text-slate-700">
                          {report.description}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        {formatDateTime(report.createdAt)}
                      </span>
                    </div>
                    {report.contact ? (
                      <p className="mt-2 text-xs text-slate-500">
                        Contact: {report.contact}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                Submitted outage reports will appear here for triage. Nothing is
                sent anywhere.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}

export default App;
