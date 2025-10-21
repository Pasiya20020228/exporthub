function StatusCard({ title, children, isLoading, error, onRetry }) {
  return (
    <article className="status-card">
      <header className="status-card__header">
        <h2>{title}</h2>
      </header>
      <div className="status-card__body">
        {isLoading && <p className="info">Checking status…</p>}
        {!isLoading && error && (
          <div className="error">
            <p>{error}</p>
            <button type="button" onClick={onRetry} className="retry-button">
              Try again
            </button>
          </div>
        )}
        {!isLoading && !error && children}
      </div>
    </article>
  );
}

export default StatusCard;
