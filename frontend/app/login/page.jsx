'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import StatusBanner from '../components/StatusBanner';
import { apiRequest } from '../lib/api';
import { useSession } from '../providers/SessionProvider';

export default function LoginPage() {
  const { login } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!form.email || !form.password) {
      setStatus({ type: 'error', message: 'Enter both email and password to continue.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = await apiRequest('/auth/login', {
        method: 'POST',
        body: form,
      });
      login(payload.token, payload.user);
      setStatus({ type: 'success', message: 'Welcome back! Redirecting you to the marketplace…' });
      setTimeout(() => router.push('/products'), 800);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="section-header">
        <h2>Log in to ExportHub</h2>
        <p>Access your dashboard and keep trade conversations moving.</p>
      </div>
      <div className="hero-card" style={{ maxWidth: '420px' }}>
        <StatusBanner status={status} />
        <form onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={updateField('email')}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={updateField('password')}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Signing you in…' : 'Log in'}
          </button>
        </form>
      </div>
    </section>
  );
}
