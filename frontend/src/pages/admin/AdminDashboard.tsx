import { useEffect, useState } from 'react';
import api, { apiError } from '../../api/client';
import { DashboardStats } from '../../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/users/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(apiError(err)));
  }, []);

  return (
    <div className="page">
      <h1>Admin dashboard</h1>
      {error && <div className="alert error">{error}</div>}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{stats?.totalUsers ?? '—'}</span>
          <span className="stat-label">Total users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.totalStores ?? '—'}</span>
          <span className="stat-label">Total stores</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.totalRatings ?? '—'}</span>
          <span className="stat-label">Total ratings</span>
        </div>
      </div>
    </div>
  );
}
