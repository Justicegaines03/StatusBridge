import { Navigate, Route, Routes } from "react-router-dom";
import { StatusBridgeProvider } from "./StatusBridgeContext";
import { WorkflowLayout } from "./layout/WorkflowLayout";
import { WorkspacePage } from "./pages/WorkspacePage";
import { MessagesPage } from "./pages/MessagesPage";
import { OutreachPage } from "./pages/OutreachPage";

export default function App() {
  return (
    <StatusBridgeProvider>
      <Routes>
        <Route element={<WorkflowLayout />}>
          <Route element={<Navigate replace to="/workspace" />} path="/" />
          <Route element={<WorkspacePage />} path="/workspace" />
          <Route element={<MessagesPage />} path="/messages" />
          <Route element={<OutreachPage />} path="/outreach" />
        </Route>
      </Routes>
    </StatusBridgeProvider>
  );
}
