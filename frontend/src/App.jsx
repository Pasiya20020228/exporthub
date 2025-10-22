import { useBackendStatus } from "./hooks/useBackendStatus.js";
import StatusCard from "./components/StatusCard.jsx";
import config from "./config.js";

const capabilitySections = [
  {
    id: "login",
    title: "Login & Signup",
    description:
      "Unified authentication for buyers, sellers, and administrators keeps onboarding simple and secure.",
    highlights: [
      "Single identity across the platform",
      "Role-based access provisioning",
      "Identity proofing and MFA",
    ],
    actions: ["OAuth & email registration", "Profile completion checklist"],
  },
  {
    id: "products",
    title: "Manage Products",
    description:
      "Sellers curate catalogues, update inventory, and localise pricing to reach global buyers.",
    highlights: [
      "Bulk uploads & smart categorisation",
      "Real-time stock visibility",
      "Automated localisation",
    ],
    actions: ["Import via CSV/XLSX", "AI-assisted product descriptions"],
  },
  {
    id: "purchase",
    title: "Purchase",
    description:
      "Buyers enjoy a streamlined cart, multi-currency checkout, and secure payment workflows.",
    highlights: [
      "Support for purchase orders",
      "Fraud-aware payment gateway",
      "Wallet & invoice payments",
    ],
    actions: ["Checkout orchestration", "3DS & compliance checks"],
  },
  {
    id: "delivery",
    title: "Delivery Facility Across Countries",
    description:
      "Integrated logistics orchestration handles customs, carrier selection, and delivery status tracking.",
    highlights: [
      "Country-specific compliance rules",
      "Live shipment monitoring",
      "Carrier performance scoring",
    ],
    actions: ["HS-code auto suggestion", "Global fulfilment partners"],
  },
  {
    id: "feedback",
    title: "Feedback & Rating",
    description:
      "Two-way reviews power trust signals, dispute resolution, and personalised recommendations.",
    highlights: [
      "Buyer & seller feedback loops",
      "Sentiment dashboards",
      "Escalation workflows",
    ],
    actions: ["Post-delivery surveys", "AI-moderated reviews"],
  },
  {
    id: "summary",
    title: "Overall Summary",
    description:
      "Executives track KPIs, conversion funnels, and operational alerts in one analytics workspace.",
    highlights: ["Executive-ready dashboards", "Exportable reports", "Automated forecasting"],
    actions: ["Schedule analytics digests", "Global trade insights"],
  },
  {
    id: "moderation",
    title: "Ban Users",
    description:
      "Administrators enforce policy with account reviews, staged suspensions, and audit trails.",
    highlights: ["Automated rule triggers", "Granular ban history", "Appeals management"],
    actions: ["Progressive enforcement", "Governance evidence locker"],
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

const lifecycle = [
  {
    step: "01",
    title: "Identity & Access",
    copy:
      "Centralised login with configurable password policies, MFA enforcement, and SSO for enterprise buyers.",
  },
  {
    step: "02",
    title: "Product Onboarding",
    copy:
      "Guided catalog setup validates trade compliance, auto-translates listings, and maps pricing to target markets.",
  },
  {
    step: "03",
    title: "Order & Payment",
    copy:
      "Cart orchestration handles split shipments, multi-currency totals, and synchronises invoices for ERP exports.",
  },
  {
    step: "04",
    title: "Cross-border Fulfilment",
    copy:
      "Smart routing chooses best-fit carriers, pre-books customs documentation, and alerts on delivery exceptions.",
  },
  {
    step: "05",
    title: "Engagement & Governance",
    copy:
      "Feedback loops, executive dashboards, and policy enforcement close the lifecycle with actionable insight.",
  },
];

const adminHighlights = [
  {
    title: "Policy cockpit",
    items: [
      "Moderation queues for disputes and escalations",
      "Templated ban reasons and evidence uploads",
    ],
  },
  {
    title: "Global trade monitor",
    items: [
      "Export compliance alerts by country",
      "Carrier SLAs with predictive risk scoring",
    ],
  },
  {
    title: "Executive summary",
    items: [
      "Revenue, conversion, and fulfilment KPIs",
      "Automated weekly digests to leadership",
    ],
  },
];

function App() {
  const { status, health, isLoading, error, refresh } = useBackendStatus();

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-pill">Unified commerce platform</div>
        <h1>ExportHub — Global Trade, One Control Centre</h1>
        <p className="hero-tagline">
          A full-stack marketplace connecting buyers and sellers worldwide, with operational tooling
          and policy governance that match the complete use case flow.
        </p>
        <div className="hero-actions">
          {capabilitySections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="primary-action link-button">
              {section.title}
            </a>
          ))}
        </div>
        <div className="hero-actions secondary">
          <button type="button" className="secondary-action" onClick={refresh}>
            Refresh system status
          </button>
          <span className="status-hint">Backend health cards update in real time.</span>
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
            {capabilitySections.map((useCase) => (
              <article className="usecase-card" key={useCase.title} id={useCase.id}>
                <h3>{useCase.title}</h3>
                <p>{useCase.description}</p>
                <ul>
                  {useCase.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="action-chips">
                  {useCase.actions.map((action) => (
                    <span key={action}>{action}</span>
                  ))}
                </div>
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

        <section className="section lifecycle-section">
          <div className="section-heading">
            <span className="eyebrow">Commerce lifecycle</span>
            <h2>From onboarding to governance without gaps</h2>
            <p className="section-description">
              Trace how ExportHub orchestrates each milestone in the use case diagram with
              enterprise-grade automation for every stakeholder.
            </p>
          </div>
          <div className="lifecycle-grid">
            {lifecycle.map((item) => (
              <article className="lifecycle-card" key={item.step}>
                <span className="lifecycle-step">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section admin-section" id="moderation">
          <div className="section-heading">
            <span className="eyebrow">Operations control centre</span>
            <h2>Admin toolkit aligned with policy enforcement</h2>
            <p className="section-description">
              Administrators can moderate accounts, monitor global commerce, and keep leadership
              informed—matching the governance flows in the diagram.
            </p>
          </div>
          <div className="admin-grid">
            {adminHighlights.map((highlight) => (
              <article className="admin-card" key={highlight.title}>
                <h3>{highlight.title}</h3>
                <ul>
                  {highlight.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
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
