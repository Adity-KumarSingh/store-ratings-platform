import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../api/client';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from '../utils/validation';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const runValidation = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setErrors(next);
    return Object.values(next).every((v) => v === null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!runValidation()) return;
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/stores');
    } catch (err) {
      setServerError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create your account</h1>
        <p className="muted">Sign up as a normal user to rate stores.</p>
        {serverError && <div className="alert error">{serverError}</div>}

        <label>
          Name
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
          <textarea value={form.address} onChange={update('address')} rows={3} />
          <small className="hint">Up to 400 characters.</small>
          {errors.address && <span className="field-error">{errors.address}</span>}
        </label>

        <label>
          Password
          <input type="password" value={form.password} onChange={update('password')} />
          <small className="hint">
            8–16 characters, at least one uppercase letter and one special character.
          </small>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>

        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Sign up'}
        </button>
        <p className="muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
