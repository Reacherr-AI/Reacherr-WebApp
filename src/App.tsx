import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CreateAgentPage from './pages/CreateAgentPage';
import DashboardLayout from './components/DashboardLayout';
import AgentsPage from './pages/AgentsPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/create" element={<CreateAgentPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/agents" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;