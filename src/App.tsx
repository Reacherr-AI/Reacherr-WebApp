import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CreateAgentPage from './pages/CreateAgentPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/agents/create" replace />} />
      <Route path="/agents/create" element={<CreateAgentPage />} />
    </Routes>
  );
};

export default App;