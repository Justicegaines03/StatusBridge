import { Link } from "react-router-dom";
import { useStatusBridge } from "../StatusBridgeContext";
import { mockIncidents } from "../data/incidents";
import {
  Badge,
  Panel,
  severityClasses,
  sourceLabels,
  statusClasses,
} from "../components/bridgeUi";
import { formatDateTime, formatStatus } from "../lib/generators";

export function WorkspacePage() {
  const {
    selectedIncident,
    setSelectedIncidentId,
    reports,
    reportDraft,
    setReportDraft,
    submitReport,
  } = useStatusBridge();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
          Step 1 · Incident workspace &amp; intake
        </p>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Select the service that matches the official status page, confirm the
          message you published, then capture campus reports.
        </p>
      </div>

      <Panel title="Services from official status" eyebrow="Pick the active incident">
        <div className="max-h-[min(20rem,40vh)] space-y-3 overflow-y-auto pr-1">
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
                  {isSelected ? "Working in StatusBridge" : "Use for messaging"}
                </button>
              </article>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="Canonical incident (from status page)"
        eyebrow="Source of truth you already published"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-2xl font-black">{selectedIncident.service}</h3>
            <p className="mt-2 text-slate-700">{selectedIncident.message}</p>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Report outage (intake)" eyebrow="Campus-submitted signal">
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
              Add to triage queue
            </button>
          </form>
        </Panel>

        <Panel title="Triage queue" eyebrow="Reports awaiting review">
          {reports.length ? (
            <div className="max-h-[min(24rem,50vh)] space-y-3 overflow-y-auto pr-1">
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
              Submitted reports appear here for the status team. This reference
              build stores them locally only.
            </p>
          )}
        </Panel>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <Link
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          to="/messages"
        >
          Next: copy-ready messages →
        </Link>
      </div>
    </div>
  );
}