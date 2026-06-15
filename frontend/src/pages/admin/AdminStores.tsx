import { useEffect, useState, useCallback } from 'react';
import api, { apiError } from '../../api/client';
import { Store } from '../../types';
import DataTable, { Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import AddStoreForm from './AddStoreForm';

export default function AdminStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.get('/stores', { params: filters });
      setStores(res.data.stores);
    } catch (err) {
      setError(apiError(err));
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const updateFilter = (field: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters({ ...filters, [field]: e.target.value });

  const handleDelete = async (s: Store) => {
    if (!window.confirm(`Delete store "${s.name}"? This also removes its ratings.`)) return;
    setError('');
    try {
      await api.delete(`/stores/${s.id}`);
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const columns: Column<Store>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'address', header: 'Address' },
    {
      key: 'overallRating',
      header: 'Rating',
      render: (s) => (s.ratingCount > 0 ? `${s.overallRating} (${s.ratingCount})` : 'No ratings'),
      sortValue: (s) => s.overallRating,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (s) => (
        <button className="btn btn-link danger" onClick={() => handleDelete(s)}>
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Stores</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add store
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="filters">
        <input placeholder="Filter by name" value={filters.name} onChange={updateFilter('name')} />
        <input placeholder="Filter by email" value={filters.email} onChange={updateFilter('email')} />
        <input
          placeholder="Filter by address"
          value={filters.address}
          onChange={updateFilter('address')}
        />
      </div>

      <DataTable columns={columns} data={stores} rowKey={(s) => s.id} />

      {showAdd && (
        <Modal title="Add store" onClose={() => setShowAdd(false)}>
          <AddStoreForm onCreated={load} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  );
}
