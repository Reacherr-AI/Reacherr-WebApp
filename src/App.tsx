import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CreateAgentPage from './pages/CreateAgentPage';
import DashboardLayout from './components/DashboardLayout';
import AgentsPage from './pages/AgentsPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/agents" replace />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/create" element={<CreateAgentPage />} />
      </Route>
    </Routes>
  );
};

export default App;