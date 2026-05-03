import { useEffect, useState } from "react";
import { useStatusBridge } from "../StatusBridgeContext";
import { Badge, CopyButton, severityClasses } from "../components/bridgeUi";
import type { StakeholderMessages } from "../types";
import {
  formatStatus,
  generateRssItemSnippet,
  generateWidgetSnippet,
} from "../lib/generators";

type ReadyFlags = { collaboration: boolean; campus: boolean; executive: boolean };

export function OutreachPage() {
  const { selectedIncident, stakeholderDrafts, setStakeholderDrafts } =
    useStatusBridge();

  const [widgetEmbed, setWidgetEmbed] = useState(() =>
    generateWidgetSnippet(selectedIncident),
  );
  const [rssItem, setRssItem] = useState(() =>
    generateRssItemSnippet(selectedIncident),
  );
  const [ready, setReady] = useState<ReadyFlags>({
    collaboration: false,
    campus: false,
    executive: false,
  });

  useEffect(() => {
    setWidgetEmbed(generateWidgetSnippet(selectedIncident));
    setRssItem(generateRssItemSnippet(selectedIncident));
  }, [selectedIncident.id]);

  const patchDraft = (key: keyof StakeholderMessages, value: string) => {
    setStakeholderDrafts((d) => ({ ...d, [key]: value }));
  };

  const channels: {
    key: keyof StakeholderMessages;
    label: string;
    hint: string;
    readyKey: keyof ReadyFlags;
  }[] = [
    {
      key: "internal",
      label: "Collaboration",
      hint: "Teams / Slack",
      readyKey: "collaboration",
    },
    {
      key: "student",
      label: "Campus-facing",
      hint: "Email / web / social",
      readyKey: "campus",
    },
    {
      key: "executive",
      label: "Executive",
      hint: "Brief / leadership",
      readyKey: "executive",
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-100 pb-1.5">
        <div className="min-w-0">
          <h1 className="text-sm font-bold tracking-tight text-slate-950">
            Approve &amp; send
          </h1>
          <p className="sr-only">
            Same copy as Messages—edit, mark OK, copy into each channel.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <span className="text-[0.65rem] font-semibold text-slate-800">
            {selectedIncident.service}
          </span>
          <Badge className={severityClasses[selectedIncident.severity]}>
            {selectedIncident.severity}
          </Badge>
          <span className="text-[0.6rem] capitalize text-slate-500">
            {formatStatus(selectedIncident.status)}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 max-h-[min(46vh,calc(100dvh-17.5rem))] flex-1 flex-col gap-1.5 overflow-hidden lg:flex-row lg:gap-2">
        {channels.map(({ key, label, hint, readyKey }) => (
          <section
            className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-soft"
            key={key}
          >
            <div className="flex shrink-0 items-start justify-between gap-2">
              <div>
                <h2 className="text-xs font-bold text-slate-900">{label}</h2>
                <p className="text-[0.65rem] text-slate-500">{hint}</p>
              </div>
              <label className="flex shrink-0 cursor-pointer items-center gap-1 text-[0.65rem] text-slate-600">
                <input
                  checked={ready[readyKey]}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                  onChange={(event) =>
                    setReady((r) => ({
                      ...r,
                      [readyKey]: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                OK
              </label>
            </div>
            <textarea
              className="mt-0.5 min-h-0 w-full flex-1 resize-none rounded-md border border-slate-200 px-1 py-0.5 text-[8px] leading-[1.28] text-slate-800 outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-500/30 sm:text-[9px] sm:leading-[1.32]"
              onChange={(event) => patchDraft(key, event.target.value)}
              spellCheck={true}
              value={stakeholderDrafts[key]}
            />
            <div className="mt-0.5 flex shrink-0 justify-end">
              <CopyButton value={stakeholderDrafts[key]} />
            </div>
          </section>
        ))}
      </div>

      <div className="shrink-0 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Unit widget</h2>
              <p className="text-[0.65rem] text-slate-500">Embed HTML</p>
            </div>
            <CopyButton value={widgetEmbed} />
          </div>
          <textarea
            className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-[10px] leading-snug text-slate-700"
            onChange={(event) => setWidgetEmbed(event.target.value)}
            rows={2}
            spellCheck={false}
            value={widgetEmbed}
          />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">RSS item</h2>
              <p className="text-[0.65rem] text-slate-500">Paste into feed</p>
            </div>
            <CopyButton value={rssItem} />
          </div>
          <textarea
            className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-[10px] leading-snug text-slate-700"
            onChange={(event) => setRssItem(event.target.value)}
            rows={3}
            spellCheck={false}
            value={rssItem}
          />
        </section>
      </div>
    </div>
  );
}
