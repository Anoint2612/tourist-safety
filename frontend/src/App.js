import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Dashboard from "./pages/Dashboard";
import AlertsPage from "./pages/AlertsPage";
import EFIRPage from "./pages/EFIRPage";
import EFIRCreate from "./pages/EFIRCreate";
import SOSPage from "./pages/SOSPage";
import GeoPage from "./pages/GeoPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        <Route path="/efir" element={<ProtectedRoute><EFIRPage /></ProtectedRoute>} />
        <Route path="/efir/create" element={<ProtectedRoute><EFIRCreate /></ProtectedRoute>} />
        <Route path="/sos" element={<ProtectedRoute><SOSPage /></ProtectedRoute>} />
        <Route path="/geo" element={<ProtectedRoute><GeoPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
