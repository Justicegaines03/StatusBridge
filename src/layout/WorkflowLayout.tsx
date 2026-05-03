import { NavLink, Outlet } from "react-router-dom";
import { useStatusBridge } from "../StatusBridgeContext";

const steps = [
  { path: "/workspace", label: "1 · Workspace", short: "Workspace" },
  { path: "/messages", label: "2 · Messages", short: "Messages" },
  { path: "/outreach", label: "3 · Outreach", short: "Outreach" },
] as const;

export function WorkflowLayout() {
  const { selectedIncident } = useStatusBridge();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d1fae5,transparent_32rem),linear-gradient(180deg,#f8fafc,#eef2ff)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
                StatusBridge Lite
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                After{" "}
                <span className="text-emerald-800">status.uoregon.edu</span> is
                updated — one step at a time.
              </p>
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
            {steps.map(({ path, label, short }) => (
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
                to={path}
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{short}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
