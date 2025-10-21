import { useBackendStatus } from "./hooks/useBackendStatus.js";
import StatusCard from "./components/StatusCard.jsx";
import config from "./config.js";

function App() {
  const { status, health, isLoading, error, refresh } = useBackendStatus();

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>ExportHub</h1>
        <p className="subtitle">Deployment status dashboard</p>
      </header>

      <section className="content">
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

      <footer className="app-footer">
        <span>
          API base URL: <code>{config.apiBaseUrl}</code>
        </span>
        <button type="button" onClick={refresh} className="refresh-button">
          Refresh status
        </button>
      </footer>
    </div>
  );
}

export default App;
