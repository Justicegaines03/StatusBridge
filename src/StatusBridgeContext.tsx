import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { mockIncidents } from "./data/incidents";
import { draftStakeholderMessagesWithGemini } from "./lib/geminiDraft";
import { generateNetworkEvidence, generateStakeholderMessages } from "./lib/generators";
import type {
  Incident,
  NetworkEvidence,
  StakeholderMessages,
  UserReport,
} from "./types";

const defaultServiceName =
  mockIncidents.find((i) => i.id === "canvas")?.service ??
  mockIncidents[0].service;

export const emptyReport = {
  service: defaultServiceName,
  location: "",
  description: "",
  contact: "",
};

type StatusBridgeContextValue = {
  selectedIncidentId: string;
  setSelectedIncidentId: (id: string) => void;
  selectedIncident: Incident;
  reports: UserReport[];
  reportDraft: typeof emptyReport;
  setReportDraft: React.Dispatch<React.SetStateAction<typeof emptyReport>>;
  stakeholderDrafts: StakeholderMessages;
  setStakeholderDrafts: React.Dispatch<
    React.SetStateAction<StakeholderMessages>
  >;
  networkEvidence: Record<string, NetworkEvidence>;
  submitReport: (event: FormEvent<HTMLFormElement>) => void;
  runEvidenceCheck: () => void;
};

const StatusBridgeContext = createContext<StatusBridgeContextValue | null>(
  null,
);

export function StatusBridgeProvider({ children }: { children: ReactNode }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState(
    mockIncidents.some((i) => i.id === "canvas") ? "canvas" : mockIncidents[0].id,
  );
  const [reports, setReports] = useState<UserReport[]>([]);
  const [reportDraft, setReportDraft] = useState(emptyReport);
  const reportDraftRef = useRef(reportDraft);
  reportDraftRef.current = reportDraft;
  const [networkEvidence, setNetworkEvidence] = useState<
    Record<string, NetworkEvidence>
  >({});
  const [stakeholderDrafts, setStakeholderDrafts] =
    useState<StakeholderMessages>(() =>
      generateStakeholderMessages(
        mockIncidents.find((i) => i.id === "canvas") ?? mockIncidents[0],
        [],
      ),
    );

  const selectedIncident = useMemo(
    () =>
      mockIncidents.find((incident) => incident.id === selectedIncidentId) ??
      mockIncidents[0],
    [selectedIncidentId],
  );

  const triageSignature = useMemo(() => {
    return reports
      .filter((r) => r.service === selectedIncident.service)
      .map((r) => `${r.id}\0${r.createdAt}\0${r.location}\0${r.description}`)
      .join("\n");
  }, [reports, selectedIncident.service]);

  const incidentSignature = useMemo(
    () =>
      [
        selectedIncident.id,
        selectedIncident.message,
        selectedIncident.status,
        selectedIncident.severity,
        selectedIncident.updatedAt,
        selectedIncident.affectedAudience,
      ].join("\0"),
    [selectedIncident],
  );

  useEffect(() => {
    setReportDraft((draft) => ({
      ...draft,
      service: selectedIncident.service,
    }));
  }, [selectedIncident.service]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const hasKey = Boolean(
        import.meta.env.VITE_GEMINI_API_KEY?.trim(),
      );
      // #region agent log
      fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "4798fb",
        },
        body: JSON.stringify({
          sessionId: "4798fb",
          runId: "post-fix",
          hypothesisId: "H1",
          location: "StatusBridgeContext.tsx:draftEffect",
          message: "stakeholder draft effect start",
          data: {
            hasKey,
            incidentId: selectedIncident.id,
            mode: import.meta.env.MODE,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!hasKey) {
        if (!cancelled) {
          setStakeholderDrafts(
            generateStakeholderMessages(selectedIncident, reports),
          );
        }
        return;
      }

      const next = await draftStakeholderMessagesWithGemini(
        selectedIncident,
        reports,
      );
      // #region agent log
      fetch("http://127.0.0.1:7735/ingest/802d69fb-de10-4855-89a2-7541fa3b4a5e", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "4798fb",
        },
        body: JSON.stringify({
          sessionId: "4798fb",
          runId: "post-fix",
          hypothesisId: "H6",
          location: "StatusBridgeContext.tsx:draftEffect:afterAwait",
          message: "gemini await settled",
          data: {
            cancelled,
            willApply: !cancelled,
            draftStudentLen: next.student?.length ?? 0,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!cancelled) {
        setStakeholderDrafts(next);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [incidentSignature, triageSignature, selectedIncident]);

  const submitReport = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const draft = reportDraftRef.current;
    const location = draft.location.trim();
    const description = draft.description.trim();
    if (!location || !description) {
      return;
    }

    setReports((currentReports) => [
      {
        id: crypto.randomUUID(),
        service: draft.service,
        location,
        description,
        contact: draft.contact.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
      ...currentReports,
    ]);
    setReportDraft({ ...emptyReport, service: draft.service });
  }, []);

  const runEvidenceCheck = useCallback(() => {
    setNetworkEvidence((currentEvidence) => {
      const incident =
        mockIncidents.find((i) => i.id === selectedIncidentId) ??
        mockIncidents[0];
      const evidence = generateNetworkEvidence(incident);
      return { ...currentEvidence, [incident.id]: evidence };
    });
  }, [selectedIncidentId]);

  const value = useMemo(
    () => ({
      selectedIncidentId,
      setSelectedIncidentId,
      selectedIncident,
      reports,
      reportDraft,
      setReportDraft,
      stakeholderDrafts,
      setStakeholderDrafts,
      networkEvidence,
      submitReport,
      runEvidenceCheck,
    }),
    [
      selectedIncidentId,
      selectedIncident,
      reports,
      reportDraft,
      stakeholderDrafts,
      networkEvidence,
      submitReport,
      runEvidenceCheck,
    ],
  );

  return (
    <StatusBridgeContext.Provider value={value}>
      {children}
    </StatusBridgeContext.Provider>
  );
}

export function useStatusBridge() {
  const ctx = useContext(StatusBridgeContext);
  if (!ctx) {
    throw new Error("useStatusBridge must be used within StatusBridgeProvider");
  }
  return ctx;
}
