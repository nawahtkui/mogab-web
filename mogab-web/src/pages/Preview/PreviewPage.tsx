import './PreviewPage.css'

interface PreviewPageProps {
  onBack: () => void
  onDeploy: () => void
}

function PreviewPage({ onBack, onDeploy }: PreviewPageProps) {
  return (
    <main className="mogab-preview-page">
      <header className="preview-topbar">
        <div className="preview-brand">
          <button
            className="preview-back"
            type="button"
            onClick={onBack}
            aria-label="Back to workspace"
          >
            ←
          </button>

          <span className="mogab-mark">M</span>
          <span>MOGAB</span>

          <span className="preview-divider">/</span>
          <span className="preview-project">Nawah Cloud</span>
        </div>

        <div className="preview-actions">
          <span className="preview-status">
            <span className="status-dot" />
            Preview
          </span>

          <button className="preview-button" type="button">
            Desktop
          </button>

          <button className="preview-button" type="button">
            Tablet
          </button>

          <button className="preview-button" type="button">
            Mobile
          </button>

          <button
            className="deploy-button"
            type="button"
            onClick={onDeploy}
          >
            Deploy
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </header>

      <section className="preview-stage">
        <div className="browser-frame">
          <div className="browser-bar">
            <div className="browser-controls">
              <span />
              <span />
              <span />
            </div>

            <div className="browser-address">
              mogab-preview.local
            </div>

            <div className="browser-placeholder" />
          </div>

          <div className="preview-site">
            <nav className="site-nav">
              <strong>Nawah Cloud</strong>

              <div className="site-links">
                <span>Services</span>
                <span>Pricing</span>
                <span>About</span>
                <span>Contact</span>
              </div>

              <button type="button">Get started</button>
            </nav>

            <section className="preview-hero">
              <span className="preview-label">POWERED BY MOGAB</span>

              <h1>
                Build your digital future
                <br />
                with Nawah Cloud.
              </h1>

              <p>
                Cloud services, hosting, and AI-powered digital experiences
                built for modern businesses.
              </p>

              <div className="hero-actions">
                <button type="button">Explore services</button>
                <button type="button">Learn more</button>
              </div>
            </section>

            <section className="preview-cards">
              <article>
                <span>01</span>
                <h3>Cloud Hosting</h3>
                <p>Reliable infrastructure for your projects.</p>
              </article>

              <article>
                <span>02</span>
                <h3>MOGAB Builder</h3>
                <p>Build and deploy websites with AI.</p>
              </article>

              <article>
                <span>03</span>
                <h3>Digital Services</h3>
                <p>Tools and services for growing businesses.</p>
              </article>
            </section>
          </div>
        </div>
      </section>

      <footer className="preview-footer">
        <span>Draft preview</span>
        <span>•</span>
        <span>All systems ready</span>
      </footer>
    </main>
  )
}

export default PreviewPage
