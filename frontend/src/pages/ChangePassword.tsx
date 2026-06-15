import { useState } from 'react';
import api, { apiError } from '../api/client';
import { validatePassword } from '../utils/validation';

export default function ChangePassword() {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const pwError = validatePassword(newPassword);
    if (pwError) return setError(pwError);
    if (newPassword !== confirm) return setError('New passwords do not match.');

    setSubmitting(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setMessage('Password updated successfully.');
      setCurrent('');
      setNew('');
      setConfirm('');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page narrow">
      <h1>Change password</h1>
      <form className="card" onSubmit={handleSubmit} noValidate>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
        <label>
          Current password
          <input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} required />
        </label>
        <label>
          New password
          <input type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} required />
          <small className="hint">
            8–16 characters, at least one uppercase letter and one special character.
          </small>
        </label>
        <label>
          Confirm new password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </label>
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
