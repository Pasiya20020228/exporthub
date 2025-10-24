'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import StatusBanner from '../components/StatusBanner';
import { apiRequest } from '../lib/api';
import { useSession } from '../providers/SessionProvider';

const ROLES = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'admin', label: 'Administrator' },
];

export default function SignupPage() {
  const router = useRouter();
  const { login } = useSession();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'buyer',
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!form.full_name.trim()) {
      setStatus({ type: 'error', message: 'Enter your full name to continue.' });
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/auth/signup', {
        method: 'POST',
        body: {
          full_name: form.full_name.trim(),
          email: form.email,
          password: form.password,
          role: form.role,
        },
      });
      const loginPayload = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email: form.email, password: form.password },
      });
      login(loginPayload.token, loginPayload.user);
      setStatus({ type: 'success', message: 'Account created successfully! Redirecting…' });
      setTimeout(() => router.push(form.role === 'admin' ? '/dashboard' : '/products'), 900);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="section-header">
        <h2>Create your ExportHub account</h2>
        <p>Unlock the tools you need to run a modern export operation.</p>
      </div>
      <div className="hero-card" style={{ maxWidth: '480px' }}>
        <StatusBanner status={status} />
        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              placeholder="Alexei Kaur"
              value={form.full_name}
              onChange={updateField('full_name')}
              required
            />
          </label>
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
              placeholder="Create a secure password"
              value={form.password}
              onChange={updateField('password')}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label>
            Role
            <select value={form.role} onChange={updateField('role')}>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Setting up your workspace…' : 'Create account'}
          </button>
        </form>
      </div>
    </section>
  );
}
