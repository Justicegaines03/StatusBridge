import { useStatusBridge } from "../StatusBridgeContext";
import { mockIncidents } from "../data/incidents";
import {
  Badge,
  CopyButton,
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

  const triagePreview = reports.slice(0, 2);
  const triageExtra = reports.length - triagePreview.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <section className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-emerald-700">
          Pick the active incident
        </p>
        <h2 className="mt-1 text-base font-bold text-slate-950">
          Services from official status
        </h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-start">
          <label className="block min-w-0">
            <span className="text-xs font-semibold text-slate-600">Service</span>
            <select
              className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-900"
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
          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50/90 p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-500">
                Latest official message
              </p>
              <CopyButton value={selectedIncident.message} />
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-800">
              {selectedIncident.message}
            </p>
            <p className="mt-1 line-clamp-1 text-[0.7rem] text-slate-500">
              Affected:{" "}
              <span className="font-medium text-slate-700">
                {selectedIncident.affectedAudience}
              </span>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge className={statusClasses[selectedIncident.status]}>
                {formatStatus(selectedIncident.status)}
              </Badge>
              <Badge className={severityClasses[selectedIncident.severity]}>
                {selectedIncident.severity}
              </Badge>
              <span className="text-[0.65rem] font-medium text-slate-500">
                {sourceLabels[selectedIncident.source]} ·{" "}
                {formatDateTime(selectedIncident.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-emerald-700">
          Campus intake · Triage
        </p>
        <h2 className="mt-1 text-base font-bold text-slate-950">
          Report outage & triage
        </h2>
        <div className="mt-2 grid min-h-0 flex-1 gap-3 lg:grid-cols-2 lg:items-start">
          <form
            className="flex min-h-0 flex-col space-y-2"
            onSubmit={submitReport}
          >
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">
                Service
              </span>
              <select
                className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
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
              <span className="text-xs font-semibold text-slate-600">
                Location / network
              </span>
              <input
                className="mt-0.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
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
              <span className="text-xs font-semibold text-slate-600">
                Description
              </span>
              <textarea
                className="mt-0.5 max-h-[4.5rem] min-h-[3rem] w-full resize-none rounded-lg border border-slate-200 px-2 py-1.5 text-xs leading-snug"
                onChange={(event) =>
                  setReportDraft({
                    ...reportDraft,
                    description: event.target.value,
                  })
                }
                placeholder="What are users experiencing?"
                rows={2}
                value={reportDraft.description}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">
                Optional contact
              </span>
              <input
                className="mt-0.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
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
              className="mt-1 w-full rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
              type="submit"
            >
              Add to triage queue
            </button>
          </form>

          <div className="flex min-h-0 flex-col overflow-hidden lg:border-l lg:border-slate-200 lg:pl-3">
            {reports.length ? (
              <div className="space-y-1.5 overflow-hidden">
                {triagePreview.map((report) => (
                  <article
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2"
                    key={report.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-bold text-slate-950">
                          {report.service} · {report.location}
                        </h3>
                        <p className="line-clamp-2 text-[0.7rem] leading-snug text-slate-700">
                          {report.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-[0.6rem] font-medium text-slate-500">
                        {formatDateTime(report.createdAt)}
                      </span>
                    </div>
                    {report.contact ? (
                      <p className="mt-1 truncate text-[0.6rem] text-slate-500">
                        Contact: {report.contact}
                      </p>
                    ) : null}
                  </article>
                ))}
                {triageExtra > 0 ? (
                  <p className="text-center text-[0.65rem] font-medium text-slate-400">
                    +{triageExtra} more in queue
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-[0.7rem] leading-snug text-slate-500">
                Reports appear here (stored locally in this build).
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}