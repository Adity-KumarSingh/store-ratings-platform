import { useEffect, useState } from 'react';
import api, { apiError } from '../../api/client';
import { User } from '../../types';
import { validateName, validateEmail, validateAddress } from '../../utils/validation';

interface Props {
  onCreated: () => void;
  onClose: () => void;
}

export default function AddStoreForm({ onCreated, onClose }: Props) {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/users')
      .then((res) =>
        setOwners(res.data.users.filter((u: User) => u.role === 'owner' || u.role === 'user')),
      )
      .catch(() => setOwners([]));
  }, []);

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
    };
    setErrors(next);
    return Object.values(next).every((v) => v === null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/stores', {
        name: form.name,
        email: form.email,
        address: form.address,
        ownerId: form.ownerId ? Number(form.ownerId) : null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setServerError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="stack">
      {serverError && <div className="alert error">{serverError}</div>}
      <label>
        Store name
        <input value={form.name} onChange={update('name')} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>
      <label>
        Email
        <input type="email" value={form.email} onChange={update('email')} />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </label>
      <label>
        Address
        <textarea value={form.address} onChange={update('address')} rows={2} />
        {errors.address && <span className="field-error">{errors.address}</span>}
      </label>
      <label>
        Owner (optional)
        <select value={form.ownerId} onChange={update('ownerId')}>
          <option value="">— No owner —</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.email}) {o.role === 'user' ? '· will become owner' : ''}
            </option>
          ))}
        </select>
      </label>
      <div className="row gap">
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create store'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
