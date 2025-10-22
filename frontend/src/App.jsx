import { useBackendStatus } from "./hooks/useBackendStatus.js";
import StatusCard from "./components/StatusCard.jsx";
import config from "./config.js";

const coreUseCases = [
  {
    title: "Login & Signup",
    description:
      "Unified authentication for buyers, sellers, and administrators keeps onboarding simple and secure.",
    highlights: ["Single identity across the platform", "Role-based access provisioning"],
  },
  {
    title: "Manage Products",
    description:
      "Sellers curate catalogues, update inventory, and localise pricing to reach global buyers.",
    highlights: ["Bulk uploads & smart categorisation", "Real-time stock visibility"],
  },
  {
    title: "Purchase",
    description:
      "Buyers enjoy a streamlined cart, multi-currency checkout, and secure payment workflows.",
    highlights: ["Support for purchase orders", "Fraud-aware payment gateway"],
  },
  {
    title: "Delivery Facility Across Countries",
    description:
      "Integrated logistics orchestration handles customs, carrier selection, and delivery status tracking.",
    highlights: ["Country-specific compliance rules", "Live shipment monitoring"],
  },
  {
    title: "Feedback & Rating",
    description:
      "Two-way reviews power trust signals, dispute resolution, and personalised recommendations.",
    highlights: ["Buyer & seller feedback loops", "Sentiment dashboards"],
  },
  {
    title: "Overall Summary",
    description:
      "Executives track KPIs, conversion funnels, and operational alerts in one analytics workspace.",
    highlights: ["Executive-ready dashboards", "Exportable reports"],
  },
  {
    title: "Ban Users",
    description:
      "Administrators enforce policy with account reviews, staged suspensions, and audit trails.",
    highlights: ["Automated rule triggers", "Granular ban history"],
  },
];

const roles = [
  {
    name: "Buyer",
    description:
      "Discovers products, completes purchases, leaves feedback, and tracks deliveries in real time.",
    flow: ["Discover products", "Checkout", "Track shipments", "Submit ratings"],
  },
  {
    name: "Seller",
    description:
      "Publishes inventory, manages orders, coordinates fulfilment partners, and engages with feedback.",
    flow: ["Create storefront", "Manage catalogue", "Dispatch orders", "Respond to reviews"],
  },
  {
    name: "Admin",
    description:
      "Maintains governance—overseeing performance metrics, resolving escalations, and moderating users.",
    flow: ["Monitor KPIs", "Audit activity", "Apply policy actions", "Optimise operations"],
  },
];

function App() {
  const { status, health, isLoading, error, refresh } = useBackendStatus();

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-pill">Unified commerce platform</div>
        <h1>ExportHub Experience</h1>
        <p className="hero-tagline">
          A full-stack marketplace connecting buyers and sellers worldwide with operational tooling
          for administrators.
        </p>
        <div className="hero-actions">
          <button type="button" className="primary-action">
            Explore platform
          </button>
          <button type="button" className="secondary-action" onClick={refresh}>
            Refresh system status
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="section">
          <div className="section-heading">
            <span className="eyebrow">Use case coverage</span>
            <h2>Every flow from the project use case diagram</h2>
            <p className="section-description">
              Navigate the primary responsibilities outlined in the requirements: authentication,
              catalogue management, purchasing, fulfilment, customer feedback, executive oversight,
              and policy enforcement.
            </p>
          </div>
          <div className="usecase-grid">
            {coreUseCases.map((useCase) => (
              <article className="usecase-card" key={useCase.title}>
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
                <ul>
                  {useCase.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section roles-section">
          <div className="section-heading">
            <span className="eyebrow">Personas</span>
            <h2>User journeys across the platform</h2>
            <p className="section-description">
              Understand how buyers, sellers, and administrators interact with ExportHub to complete
              daily tasks and keep the marketplace running smoothly.
            </p>
          </div>
          <div className="roles-grid">
            {roles.map((role) => (
              <article className="role-card" key={role.name}>
                <header>
                  <h3>{role.name}</h3>
                  <p>{role.description}</p>
                </header>
                <ol>
                  {role.flow.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <span className="eyebrow">Operations</span>
            <h2>Real-time system visibility</h2>
            <p className="section-description">
              Stay confident while the platform runs—monitor service health, investigate incidents,
              and keep stakeholders informed.
            </p>
          </div>
          <div className="grid">
            <StatusCard
              title="Backend service"
              isLoading={isLoading}
              error={error}
              onRetry={refresh}
            >
              {status && (
                <ul className="status-list">
                  <li>
                    <span className="label">Message</span>
                    <span className="value">{status.message}</span>
                  </li>
                  <li>
                    <span className="label">Storage bucket</span>
                    <span className="value">{status.storage_bucket}</span>
                  </li>
                </ul>
              )}
            </StatusCard>

            <StatusCard
              title="Database health"
              isLoading={isLoading}
              error={error}
              onRetry={refresh}
            >
              {health && (
                <ul className="status-list">
                  <li>
                    <span className="label">Status</span>
                    <span className={`value badge badge-${health.database}`}>
                      {health.database}
                    </span>
                  </li>
                  <li>
                    <span className="label">Debug mode</span>
                    <span className="value">{health.debug}</span>
                  </li>
                </ul>
              )}
            </StatusCard>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div>
          <span className="footer-title">API base URL</span>
          <code>{config.apiBaseUrl}</code>
        </div>
        <p className="footer-note">
          Need deeper insights? Connect monitoring, policy management, and analytics modules from
          the admin console.
        </p>
      </footer>
    </div>
  );
}

export default App;
