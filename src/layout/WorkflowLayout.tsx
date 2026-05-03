import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useStatusBridge } from "../StatusBridgeContext";
import statusBridgeLogo from "../assets/statusbridge-logo.png";

const steps = [
  {
    path: "/workspace",
    phase: 1,
    short: "Workspace",
    purpose:
      "Pick the official status service, confirm the published message and audience, and capture campus intake next to triage.",
  },
  {
    path: "/messages",
    phase: 2,
    short: "Messages",
    purpose:
      "Draft detailed stakeholder updates by audience—edit the text in place, then copy for email, Teams, or briefings.",
  },
  {
    path: "/outreach",
    phase: 3,
    short: "Outreach",
    purpose:
      "Preview RSS, embed snippets, and optional ops checks so distribution matches what you already published.",
  },
] as const;

function PhaseArrowNav() {
  const location = useLocation();
  const stepIndex = steps.findIndex((s) => s.path === location.pathname);
  const index = stepIndex === -1 ? 0 : stepIndex;
  const prevStep = index > 0 ? steps[index - 1] : null;
  const nextStep = index < steps.length - 1 ? steps[index + 1] : null;
  const current = steps[index];

  return (
    <nav
      aria-label="Previous and next workflow phase"
      className="mb-4 flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/90 pb-3"
    >
      {prevStep ? (
        <Link
          className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-900 sm:px-4"
          to={prevStep.path}
        >
          <span className="text-xl leading-none text-emerald-700" aria-hidden>
            ←
          </span>
          <span>
            <span className="hidden sm:inline">{prevStep.short}</span>
            <span className="sm:hidden">Back</span>
          </span>
        </Link>
      ) : (
        <span className="inline-flex min-h-[2.75rem] min-w-[5rem] items-center px-2 text-sm text-slate-300">
          <span className="text-xl" aria-hidden>
            ←
          </span>
        </span>
      )}

      <div className="min-w-0 flex-1 px-1 text-center sm:px-3">
        <p className="rounded-2xl border border-slate-200/50 bg-slate-100/35 px-4 py-2.5 text-xs font-normal leading-relaxed text-slate-500/90 sm:text-sm">
          {current?.purpose ?? ""}
        </p>
      </div>

      {nextStep ? (
        <Link
          className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-900 sm:px-4"
          to={nextStep.path}
        >
          <span>
            <span className="hidden sm:inline">{nextStep.short}</span>
            <span className="sm:hidden">Next</span>
          </span>
          <span className="text-xl leading-none text-emerald-700" aria-hidden>
            →
          </span>
        </Link>
      ) : (
        <span className="inline-flex min-h-[2.75rem] min-w-[5rem] items-center justify-end px-2 text-sm text-slate-300">
          <span className="text-xl" aria-hidden>
            →
          </span>
        </span>
      )}
    </nav>
  );
}

export function WorkflowLayout() {
  const { selectedIncident } = useStatusBridge();

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,#d1fae5,transparent_32rem),linear-gradient(180deg,#f8fafc,#eef2ff)] text-slate-900">
      <header className="shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <img
                alt="StatusBridge Lite"
                className="h-14 w-auto sm:h-16 lg:h-20"
                src={statusBridgeLogo}
              />
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-slate-800">
              <span className="font-medium text-slate-500">Active service</span>{" "}
              <span className="font-bold text-slate-950">
                {selectedIncident.service}
              </span>
            </div>
          </div>

          <nav
            aria-label="Workflow steps"
            className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2"
          >
            {steps.map(({ path, phase, short, purpose }) => (
              <NavLink
                className={({ isActive }) =>
                  [
                    "rounded-xl px-4 py-3 text-center text-sm font-bold transition sm:flex-1 sm:min-w-[8rem]",
                    isActive
                      ? "bg-slate-950 text-white shadow-md"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-900",
                  ].join(" ")
                }
                key={path}
                title={purpose}
                to={path}
              >
                <span className="tabular-nums">{phase}</span>
                <span className="opacity-70"> · </span>
                {short}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        <PhaseArrowNav />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
