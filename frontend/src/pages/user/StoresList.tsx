import { useEffect, useState, useCallback } from 'react';
import api, { apiError } from '../../api/client';
import { Store } from '../../types';
import StarRating from '../../components/StarRating';

export default function StoresList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.get('/stores', { params: search });
      setStores(res.data.stores);
    } catch (err) {
      setError(apiError(err));
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const submitRating = async (storeId: number, rating: number) => {
    setSavingId(storeId);
    setError('');
    try {
      await api.post('/ratings', { storeId, rating });

      setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, userRating: rating } : s)));
      await load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page">
      <h1>Stores</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="filters">
        <input
          placeholder="Search by name"
          value={search.name}
          onChange={(e) => setSearch({ ...search, name: e.target.value })}
        />
        <input
          placeholder="Search by address"
          value={search.address}
          onChange={(e) => setSearch({ ...search, address: e.target.value })}
        />
      </div>

      <div className="store-grid">
        {stores.length === 0 && <p className="muted">No stores found.</p>}
        {stores.map((store) => (
          <div className="card store-card" key={store.id}>
            <h3>{store.name}</h3>
            <p className="muted">{store.address}</p>
            <div className="store-meta">
              <span>
                Overall:{' '}
                <strong>
                  {store.ratingCount > 0 ? `${store.overallRating} / 5` : 'No ratings'}
                </strong>{' '}
                <span className="muted">({store.ratingCount})</span>
              </span>
            </div>
            <div className="rating-row">
              <span className="rating-label">
                {store.userRating ? 'Your rating' : 'Rate this store'}
              </span>
              <StarRating
                value={store.userRating ?? 0}
                onChange={(r) => submitRating(store.id, r)}
              />
              {savingId === store.id && <span className="muted">Saving…</span>}
            </div>
            {store.userRating != null && (
              <p className="hint">Click a star to modify your rating.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
