import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { BlockPlanPage } from './pages/BlockPlanPage';
import { ConflictsPage } from './pages/ConflictsPage';
import { fetchBlockPlans, fetchConflicts } from './services/api';
import { BlockPlanItem, ConflictAlertItem } from './types';

export const App: React.FC = () => {
  const [plans, setPlans] = useState<BlockPlanItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictAlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [planData, conflictData] = await Promise.all([
        fetchBlockPlans(),
        fetchConflicts(),
      ]);
      setPlans(planData);
      setConflicts(conflictData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load scheduling data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <BrowserRouter>
      <Layout conflictCount={conflicts.length}>
        <Routes>
          <Route path="/" element={<Navigate to="/block-plan" replace />} />
          <Route
            path="/block-plan"
            element={
              <BlockPlanPage
                plans={plans}
                loading={loading}
                error={error}
                onRefresh={loadData}
              />
            }
          />
          <Route
            path="/conflicts"
            element={
              <ConflictsPage
                conflicts={conflicts}
                loading={loading}
                error={error}
                onRefresh={loadData}
              />
            }
          />
          <Route path="*" element={<Navigate to="/block-plan" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
