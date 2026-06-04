import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NaturalTalk from "./pages/NaturalTalk";
import ProfessionalPrep from "./pages/ProfessionalPrep";
import ConversationRoom from "./pages/ConversationRoom";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/natural-talk"
        element={
          <ProtectedRoute>
            <NaturalTalk />
          </ProtectedRoute>
        }
      />

      <Route
        path="/professional-prep"
        element={
          <ProtectedRoute>
            <ProfessionalPrep />
          </ProtectedRoute>
        }
      />

      <Route
        path="/conversation/:conversationId"
        element={
          <ProtectedRoute>
            <ConversationRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      <Route path="/home" element={<Navigate to="/" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
