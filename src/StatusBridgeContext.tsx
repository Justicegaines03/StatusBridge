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
import {
  generateNetworkEvidence,
  generateStakeholderMessages,
} from "./lib/generators";
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
      ),
    );

  const selectedIncident = useMemo(
    () =>
      mockIncidents.find((incident) => incident.id === selectedIncidentId) ??
      mockIncidents[0],
    [selectedIncidentId],
  );

  useEffect(() => {
    setReportDraft((draft) => ({
      ...draft,
      service: selectedIncident.service,
    }));
  }, [selectedIncident.service]);

  useEffect(() => {
    setStakeholderDrafts(generateStakeholderMessages(selectedIncident));
  }, [selectedIncident.id]);

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
