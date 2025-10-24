'use client';

import Link from 'next/link';

import { useSession } from './providers/SessionProvider';

const highlights = [
  {
    title: 'Global-ready catalogue',
    description:
      'Showcase export-ready goods with detailed specifications, certifications, and pricing in one place.',
  },
  {
    title: 'Buyer confidence',
    description:
      'Real-time product availability and transparent seller profiles build trusted trade relationships.',
  },
  {
    title: 'Trade workflow automation',
    description:
      'Capture orders, manage fulfilment, and keep stakeholders aligned with streamlined digital tools.',
  },
];

const steps = [
  {
    title: 'Create your ExportHub account',
    detail: 'Sign up in minutes to unlock the marketplace and personalise your company profile.',
  },
  {
    title: 'List products with ease',
    detail: 'Admins can publish rich product listings, manage pricing, and update inventory instantly.',
  },
  {
    title: 'Connect with global buyers',
    detail: 'Securely accept orders from verified buyers and keep conversations organised.',
  },
];

export default function HomePage() {
  const { isAuthenticated, user } = useSession();

  return (
    <>
      <section className="hero-section">
        <div>
          <h1>Powering modern export businesses</h1>
          <p>
            ExportHub brings together international buyers and export-ready suppliers with a beautifully
            crafted digital experience. Launch curated product showcases, manage orders in real time,
            and give your team a collaborative hub for cross-border trade.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            {isAuthenticated ? (
              <Link href="/products" className="cta-button">
                Browse marketplace
              </Link>
            ) : (
              <>
                <Link href="/signup" className="cta-button">
                  Create a free account
                </Link>
                <Link href="/login" className="ghost">
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-card">
          <h3>Why ExportHub?</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 0', display: 'grid', gap: '1rem' }}>
            <li>• Unified catalogue and order management for export teams</li>
            <li>• Secure authentication for both buyers and administrators</li>
            <li>• Responsive design optimised for busy trade professionals</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Designed for high-performing trade teams</h2>
          {isAuthenticated && user?.role === 'admin' ? (
            <Link href="/dashboard" className="ghost">
              Go to admin dashboard
            </Link>
          ) : null}
        </div>
        <div className="card-grid">
          {highlights.map((item) => (
            <article key={item.title} className="card">
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Start transacting in three simple steps</h2>
        </div>
        <div className="card-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="card">
              <small>Step {index + 1}</small>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
