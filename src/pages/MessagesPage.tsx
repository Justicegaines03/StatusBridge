import { useState } from "react";
import { useStatusBridge } from "../StatusBridgeContext";
import { Badge, CopyButton, severityClasses } from "../components/bridgeUi";

type AudienceKey = "student" | "internal" | "executive";

const audienceTabs: { key: AudienceKey; label: string; hint: string }[] = [
  { key: "student", label: "Student-facing", hint: "Student-facing update" },
  { key: "internal", label: "IT / internal", hint: "IT / internal update" },
  { key: "executive", label: "Executive", hint: "Executive summary" },
];

export function MessagesPage() {
  const { selectedIncident, stakeholderDrafts, setStakeholderDrafts } =
    useStatusBridge();
  const [audience, setAudience] = useState<AudienceKey>("student");

  const activeBody =
    audience === "student"
      ? stakeholderDrafts.student
      : audience === "internal"
        ? stakeholderDrafts.internal
        : stakeholderDrafts.executive;

  const activeHint =
    audienceTabs.find((t) => t.key === audience)?.hint ?? "Message";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-950">
          Stakeholder messages
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-sm text-slate-600">
            Active service:{" "}
            <span className="font-semibold text-slate-800">
              {selectedIncident.service}
            </span>
          </p>
          <Badge className={severityClasses[selectedIncident.severity]}>
            {selectedIncident.severity}
          </Badge>
        </div>
      </header>

      <section
        aria-label="Stakeholder messages"
        className="flex min-h-0 flex-1 flex-col gap-2"
      >
        <div
          className="flex shrink-0 flex-wrap gap-2"
          role="tablist"
          aria-label="Choose audience"
        >
          {audienceTabs.map(({ key, label }) => {
            const selected = audience === key;
            return (
              <button
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  selected
                    ? "bg-slate-950 text-white shadow-md ring-2 ring-emerald-400/40"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-900"
                }`}
                key={key}
                onClick={() => setAudience(key)}
                role="tab"
                aria-selected={selected}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-950">{activeHint}</h2>
            <CopyButton value={activeBody} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-2 pt-1.5">
            <textarea
              value={activeBody}
              onChange={(event) =>
                setStakeholderDrafts((previous) => ({
                  ...previous,
                  [audience]: event.target.value,
                }))
              }
              className="min-h-0 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs leading-snug text-slate-800 shadow-inner outline-none transition-[background-color,box-shadow] duration-200 ease-out selection:bg-emerald-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25 sm:text-[13px] sm:leading-snug"
              spellCheck={true}
              aria-label={`${activeHint} text to edit and copy`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
