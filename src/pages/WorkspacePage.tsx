import { useStatusBridge } from "../StatusBridgeContext";
import { mockIncidents } from "../data/incidents";
import {
  Badge,
  CopyButton,
  Panel,
  severityClasses,
  sourceLabels,
  statusClasses,
} from "../components/bridgeUi";
import { formatDateTime, formatStatus } from "../lib/generators";

export function WorkspacePage() {
  const {
    selectedIncident,
    selectedIncidentId,
    setSelectedIncidentId,
    reports,
    reportDraft,
    setReportDraft,
    submitReport,
  } = useStatusBridge();

  return (
    <div className="space-y-4">
      <Panel title="Services from official status" eyebrow="Pick the active incident">
        <div className="space-y-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Service</span>
            <select
              className="mt-1 w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm"
              onChange={(event) => setSelectedIncidentId(event.target.value)}
              value={selectedIncidentId}
            >
              {mockIncidents.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  {incident.service}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Latest official message
              </p>
              <CopyButton value={selectedIncident.message} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              {selectedIncident.message}
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Affected audience:{" "}
              <span className="font-semibold text-slate-700">
                {selectedIncident.affectedAudience}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className={statusClasses[selectedIncident.status]}>
                {formatStatus(selectedIncident.status)}
              </Badge>
              <Badge className={severityClasses[selectedIncident.severity]}>
                {selectedIncident.severity}
              </Badge>
              <span className="text-xs font-medium text-slate-500">
                {sourceLabels[selectedIncident.source]} · Updated{" "}
                {formatDateTime(selectedIncident.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Report outage & triage"
        eyebrow="Campus-submitted signal · Reports awaiting review"
      >
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <form
            className="flex h-full min-h-0 flex-col space-y-3"
            onSubmit={submitReport}
          >
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Service
              </span>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                className="mt-1 min-h-[4.5rem] w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
              className="mt-auto w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
              type="submit"
            >
              Add to triage queue
            </button>
          </form>

          <div className="flex min-h-0 flex-col lg:border-l lg:border-slate-200 lg:pl-4">
            {reports.length ? (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {reports.map((report) => (
                  <article
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    key={report.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950">
                          {report.service} · {report.location}
                        </h3>
                        <p className="mt-1 text-xs leading-snug text-slate-700">
                          {report.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-[0.65rem] font-medium text-slate-500">
                        {formatDateTime(report.createdAt)}
                      </span>
                    </div>
                    {report.contact ? (
                      <p className="mt-1.5 text-[0.65rem] text-slate-500">
                        Contact: {report.contact}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                Submitted reports appear here. This reference build stores them
                locally only.
              </p>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}