import { useEffect, useState } from "react";
import { useStatusBridge } from "../StatusBridgeContext";
import { Badge, CopyButton, severityClasses } from "../components/bridgeUi";
import type { StakeholderMessages } from "../types";
import {
  formatStatus,
  generateRssItemSnippet,
  generateWidgetSnippet,
} from "../lib/generators";

type ReadyFlags = {
  collaboration: boolean;
  campus: boolean;
  executive: boolean;
  widget: boolean;
  rss: boolean;
};

const okLabelClass =
  "flex shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-white has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-900";

const okCheckboxClass =
  "h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/40 sm:h-5 sm:w-5";

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
    widget: false,
    rss: false,
  });
  const [published, setPublished] = useState(false);

  const anyChannelReady =
    ready.collaboration || ready.campus || ready.executive;
  const canPublish = anyChannelReady && ready.widget && ready.rss;

  useEffect(() => {
    setWidgetEmbed(generateWidgetSnippet(selectedIncident));
    setRssItem(generateRssItemSnippet(selectedIncident));
  }, [selectedIncident.id]);

  useEffect(() => {
    if (!canPublish) {
      setPublished(false);
    }
  }, [canPublish]);

  const allSelected =
    ready.collaboration &&
    ready.campus &&
    ready.executive &&
    ready.widget &&
    ready.rss;

  const toggleSelectAll = () => {
    if (allSelected) {
      setReady({
        collaboration: false,
        campus: false,
        executive: false,
        widget: false,
        rss: false,
      });
    } else {
      setReady({
        collaboration: true,
        campus: true,
        executive: true,
        widget: true,
        rss: true,
      });
    }
  };

  const patchDraft = (key: keyof StakeholderMessages, value: string) => {
    setStakeholderDrafts((d) => ({ ...d, [key]: value }));
  };

  const channels: {
    key: keyof StakeholderMessages;
    label: string;
    hint: string;
    readyKey: "collaboration" | "campus" | "executive";
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
              <label className={okLabelClass}>
                <input
                  checked={ready[readyKey]}
                  className={okCheckboxClass}
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
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900">Unit widget</h2>
              <p className="text-[0.65rem] text-slate-500">Embed HTML</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <label className={okLabelClass}>
                <input
                  checked={ready.widget}
                  className={okCheckboxClass}
                  onChange={(event) =>
                    setReady((r) => ({ ...r, widget: event.target.checked }))
                  }
                  type="checkbox"
                />
                OK
              </label>
              <CopyButton value={widgetEmbed} />
            </div>
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
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900">RSS item</h2>
              <p className="text-[0.65rem] text-slate-500">Paste into feed</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <label className={okLabelClass}>
                <input
                  checked={ready.rss}
                  className={okCheckboxClass}
                  onChange={(event) =>
                    setReady((r) => ({ ...r, rss: event.target.checked }))
                  }
                  type="checkbox"
                />
                OK
              </label>
              <CopyButton value={rssItem} />
            </div>
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

      <div className="shrink-0 flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
          <button
            className="order-1 w-full rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none sm:order-2 sm:min-w-0 sm:flex-1 sm:text-base"
            disabled={!canPublish}
            onClick={() => setPublished(true)}
            type="button"
          >
            Publish
          </button>
          <button
            aria-pressed={allSelected}
            className={`order-2 w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:order-1 sm:w-auto sm:min-w-[11rem] sm:shrink-0 ${
              allSelected
                ? "border-slate-200 text-slate-800 hover:border-rose-200 hover:bg-rose-50/60 focus-visible:outline-rose-500"
                : "border-slate-200 text-slate-800 hover:border-emerald-300 hover:bg-slate-50 focus-visible:outline-emerald-600"
            }`}
            onClick={toggleSelectAll}
            type="button"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
        {!canPublish ? (
          <p className="text-center text-[0.7rem] text-slate-500 sm:text-xs">
            Mark OK on at least one message channel, plus widget and RSS, to
            publish (demo).
          </p>
        ) : null}
        {published ? (
          <div
            className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-4 text-center shadow-sm"
            role="status"
          >
            <p className="text-base font-bold text-emerald-950 sm:text-lg">
              Messages Sent
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-900/85">
              Demo only — no external systems received these messages.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
