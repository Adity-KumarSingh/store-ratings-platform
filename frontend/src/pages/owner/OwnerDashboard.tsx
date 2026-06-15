import { useEffect, useState } from 'react';
import api, { apiError } from '../../api/client';
import { OwnerStore } from '../../types';
import DataTable, { Column } from '../../components/DataTable';

type Rater = OwnerStore['raters'][number];

export default function OwnerDashboard() {
  const [stores, setStores] = useState<OwnerStore[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/stores/owner/dashboard')
      .then((res) => setStores(res.data.stores))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Rater>[] = [
    { key: 'name', header: 'User' },
    { key: 'email', header: 'Email' },
    { key: 'rating', header: 'Rating', sortValue: (r) => r.rating },
    {
      key: 'ratedAt',
      header: 'Rated on',
      render: (r) => new Date(r.ratedAt).toLocaleDateString(),
      sortValue: (r) => r.ratedAt,
    },
  ];

  if (loading) return <div className="page">Loading…</div>;

  return (
    <div className="page">
      <h1>My store dashboard</h1>
      {error && <div className="alert error">{error}</div>}
      {stores.length === 0 && !error && (
        <p className="muted">No store is currently assigned to your account.</p>
      )}

      {stores.map((store) => (
        <div className="card" key={store.id}>
          <div className="page-head">
            <div>
              <h2>{store.name}</h2>
              <p className="muted">{store.address}</p>
            </div>
            <div className="stat-card inline">
              <span className="stat-value">
                {store.ratingCount > 0 ? store.averageRating : '—'}
              </span>
              <span className="stat-label">Average rating ({store.ratingCount})</span>
            </div>
          </div>

          <h3>Users who rated this store</h3>
          <DataTable
            columns={columns}
            data={store.raters}
            rowKey={(r) => r.userId}
            emptyMessage="No ratings submitted yet."
          />
        </div>
      ))}
    </div>
  );
}
