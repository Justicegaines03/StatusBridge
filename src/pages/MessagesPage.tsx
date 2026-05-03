import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStatusBridge } from "../StatusBridgeContext";
import {
  Badge,
  CopyButton,
  Panel,
  severityClasses,
} from "../components/bridgeUi";
import { generateStakeholderMessages } from "../lib/generators";

export function MessagesPage() {
  const { selectedIncident } = useStatusBridge();

  const messages = useMemo(
    () => generateStakeholderMessages(selectedIncident),
    [selectedIncident],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
          Step 2 · Copy-ready messaging
        </p>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Copy and paste into email, Teams, or exec briefings. Text matches your
          selected service:{" "}
          <span className="font-semibold text-slate-800">
            {selectedIncident.service}
          </span>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className={severityClasses[selectedIncident.severity]}>
            {selectedIncident.severity}
          </Badge>
        </div>
      </div>

      <Panel title="Stakeholder messages" eyebrow="Audience-specific text">
        <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-3">
          {[
            ["Student-facing update", messages.student],
            ["IT / internal update", messages.internal],
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
              <p className="mt-2 text-sm leading-6 text-slate-700">{message}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
        <Link
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-900"
          to="/workspace"
        >
          ← Back to workspace
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          to="/outreach"
        >
          Next: outreach previews →
        </Link>
      </div>
    </div>
  );
}
