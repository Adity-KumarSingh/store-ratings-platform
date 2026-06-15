import { useEffect, useState, useCallback } from 'react';
import api, { apiError } from '../../api/client';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import DataTable, { Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import AddUserForm from './AddUserForm';

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  user: 'Normal User',
  owner: 'Store Owner',
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState<User | null>(null);
  const [roleDraft, setRoleDraft] = useState<User['role']>('user');
  const [roleSaving, setRoleSaving] = useState(false);

  const openDetail = (u: User) => {
    setDetail(u);
    setRoleDraft(u.role);
  };

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.get('/users', { params: filters });
      setUsers(res.data.users);
    } catch (err) {
      setError(apiError(err));
    }
  }, [filters]);

  const handleRoleUpdate = async () => {
    if (!detail) return;
    setRoleSaving(true);
    setError('');
    try {
      const res = await api.patch(`/users/${detail.id}/role`, { role: roleDraft });
      setDetail(res.data.user);
      await load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setRoleSaving(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (!window.confirm(`Delete user "${u.name}"? This also removes their ratings.`)) return;
    setError('');
    try {
      await api.delete(`/users/${u.id}`);
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const updateFilter = (field: keyof typeof filters) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setFilters({ ...filters, [field]: e.target.value });

  const columns: Column<User>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'address', header: 'Address' },
    { key: 'role', header: 'Role', render: (u) => roleLabels[u.role] ?? u.role },
    {
      key: 'rating',
      header: 'Rating',
      render: (u) => (u.role === 'owner' ? (u.rating ?? 'No ratings') : '—'),
      sortValue: (u) => u.rating ?? -1,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (u) => (
        <div className="row gap">
          <button className="btn btn-link" onClick={() => openDetail(u)}>
            View
          </button>
          {u.id !== currentUser?.id && (
            <button className="btn btn-link danger" onClick={() => handleDelete(u)}>
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Users</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add user
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
        <select value={filters.role} onChange={updateFilter('role')}>
          <option value="">All roles</option>
          <option value="user">Normal User</option>
          <option value="admin">Administrator</option>
          <option value="owner">Store Owner</option>
        </select>
      </div>

      <DataTable columns={columns} data={users} rowKey={(u) => u.id} />

      {showAdd && (
        <Modal title="Add user" onClose={() => setShowAdd(false)}>
          <AddUserForm onCreated={load} onClose={() => setShowAdd(false)} />
        </Modal>
      )}

      {detail && (
        <Modal title="User details" onClose={() => setDetail(null)}>
          <dl className="detail-list">
            <dt>Name</dt>
            <dd>{detail.name}</dd>
            <dt>Email</dt>
            <dd>{detail.email}</dd>
            <dt>Address</dt>
            <dd>{detail.address}</dd>
            <dt>Role</dt>
            <dd>{roleLabels[detail.role] ?? detail.role}</dd>
            {detail.role === 'owner' && (
              <>
                <dt>Store rating</dt>
                <dd>{detail.rating ?? 'No ratings yet'}</dd>
              </>
            )}
          </dl>

          {detail.id === currentUser?.id ? (
            <p className="hint">You cannot change your own role.</p>
          ) : (
            <div className="role-editor">
              <h3>Change role</h3>
              <div className="row gap">
                <select
                  value={roleDraft}
                  onChange={(e) => setRoleDraft(e.target.value as User['role'])}
                >
                  <option value="user">Normal User</option>
                  <option value="owner">Store Owner</option>
                  <option value="admin">Administrator</option>
                </select>
                <button
                  className="btn btn-primary"
                  disabled={roleSaving || roleDraft === detail.role}
                  onClick={handleRoleUpdate}
                >
                  {roleSaving ? 'Saving…' : 'Update role'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
