import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import '../../App.css'

interface HomePageProps {
  onStartBuilding: (prompt: string) => void
}

type ProjectSummary = {
  id: string
  name?: string
  title?: string
  description?: string
  status?: string
  updatedAt?: string
}

function HomePage({ onStartBuilding }: HomePageProps) {
  const [prompt, setPrompt] = useState(() => sessionStorage.getItem('mogab:latestPrompt') || '')
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [tokenValue, setTokenValue] = useState(() => sessionStorage.getItem('mogab:token') || '')
  const [editingToken, setEditingToken] = useState(false)

  useEffect(() => {
    void loadProjects()
  }, [])

  async function loadProjects() {
    setLoadingProjects(true)
    try {
      const result = await apiFetch('/projects')
      if (Array.isArray(result)) {
        setProjects(result as ProjectSummary[])
      } else {
        setProjects([])
      }
    } catch {
      setProjects([])
    } finally {
      setLoadingProjects(false)
    }
  }

  function saveToken() {
    const t = tokenValue.trim()
    if (t) {
      sessionStorage.setItem('mogab:token', t)
    } else {
      sessionStorage.removeItem('mogab:token')
    }
    setEditingToken(false)
    void loadProjects()
  }

  return (
    <main className="mogab-home">
      <header className="mogab-header">
        <div className="mogab-brand">
          <span className="mogab-mark">M</span>
          <span>MOGAB</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {editingToken ? (
            <>
              <input
                className="token-input"
                aria-label="MOGAB auth token"
                value={tokenValue}
                onChange={(e) => setTokenValue(e.target.value)}
                placeholder="paste bearer token"
              />
              <button className="header-button" onClick={saveToken} type="button">
                Save
              </button>
            </>
          ) : (
            <button
              className="header-button"
              type="button"
              onClick={() => setEditingToken((v) => !v)}
            >
              {tokenValue ? 'Token ready' : 'Sign in'}
            </button>
          )}
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-eyebrow">AI-NATIVE WEBSITE BUILDER</div>

        <h1>
          What do you want
          <span> to build today?</span>
        </h1>

        <p className="hero-description">
          Describe your idea. MOGAB turns it into a project you can build,
          edit, preview, validate, and deploy.
        </p>

        <div className="prompt-card">
          <textarea
            aria-label="Describe what you want to build"
            value={prompt}
            onChange={(event) => {
              const val = event.target.value
              setPrompt(val)
              sessionStorage.setItem('mogab:latestPrompt', val)
            }}
            placeholder="Describe the website or app you want to build..."
            rows={4}
          />

          <div className="prompt-footer">
            <div className="project-types">
              <span>🌐 Website</span>
              <span>📱 Applications</span>
            </div>

            <button
              className="build-button"
              type="button"
              onClick={() => onStartBuilding(prompt)}
              disabled={!prompt.trim()}
            >
              Start building
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="quick-start">
          <span>Or start from</span>
          <button type="button">Template</button>
          <button type="button">Figma</button>
          <button type="button">Existing Project</button>
        </div>
      </section>

      <section className="recent-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">WORKSPACE</span>
            <h2>Recent projects</h2>
          </div>
        </div>

        {loadingProjects ? (
          <div className="empty-state">
            <div className="empty-icon">…</div>
            <h3>Loading projects…</h3>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">+</div>
            <h3>Your projects will appear here</h3>
            <p>
              Start your first project above and MOGAB will keep it available
              from your workspace.
            </p>
          </div>
        ) : (
          <div className="project-list">
            {projects.slice(0, 6).map((project) => (
              <button
                key={project.id}
                type="button"
                className="project-card"
                onClick={() => (window.location.href = `/project/${project.id}`)}
              >
                <div className="project-card-head">
                  <span className="project-dot" />
                  <strong>{project.name || project.title || 'Untitled project'}</strong>
                </div>
                <p>{project.description || 'No description yet.'}</p>
                <div className="project-meta">
                  <span>{project.status || 'created'}</span>
                  <span>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recent'}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default HomePage
