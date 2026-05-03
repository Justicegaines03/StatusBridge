import { useState, type ReactNode } from "react";
import type { Incident, Severity } from "../types";

export const severityClasses: Record<Severity, string> = {
  low: "bg-slate-100 text-slate-700 ring-slate-200",
  medium: "bg-amber-100 text-amber-800 ring-amber-200",
  high: "bg-orange-100 text-orange-800 ring-orange-200",
  critical: "bg-red-100 text-red-800 ring-red-200",
};

export const statusClasses: Record<Incident["status"], string> = {
  operational: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  degraded: "bg-amber-100 text-amber-800 ring-amber-200",
  partial_outage: "bg-orange-100 text-orange-800 ring-orange-200",
  major_outage: "bg-red-100 text-red-800 ring-red-200",
};

export const sourceLabels: Record<Incident["source"], string> = {
  mock: "Mock status feed",
  status_page: "Official status page",
  user_report: "User report",
  network_evidence: "Network evidence",
};

export function Badge({
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

export function Panel({
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

export function CopyButton({ value }: { value: string }) {
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
