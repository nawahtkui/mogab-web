import { useEffect, useRef, useState } from 'react'
import { MOGABCanvasBridge } from '../../canvas/bridge'
import './WorkspacePage.css'

type LeftPanel =
  | 'Pages'
  | 'Layers'
  | 'Components'
  | 'Assets'
  | 'Files'
  | 'Data'
  | 'Integrations'

type AITab = 'Chat' | 'Plan' | 'Actions' | 'Queue' | 'Context'

type RuntimeTab =
  | 'Build'
  | 'Preview'
  | 'Tests'
  | 'Runtime'
  | 'Logs'
  | 'Errors'

const leftPanels: LeftPanel[] = [
  'Pages',
  'Layers',
  'Components',
  'Assets',
  'Files',
  'Data',
  'Integrations',
]

const aiTabs: AITab[] = [
  'Chat',
  'Plan',
  'Actions',
  'Queue',
  'Context',
]

const runtimeTabs: RuntimeTab[] = [
  'Build',
  'Preview',
  'Tests',
  'Runtime',
  'Logs',
  'Errors',
]

const pages = ['Home', 'Services', 'Pricing', 'About', 'Contact']

interface WorkspacePageProps {
  projectId: string
}

function WorkspacePage({ projectId }: WorkspacePageProps) {
  const canvasRootRef = useRef<HTMLDivElement | null>(null)
  const canvasBridgeRef = useRef<MOGABCanvasBridge | null>(null)

  useEffect(() => {
    const root = canvasRootRef.current

    if (!root) {
      return
    }

    const bridge = new MOGABCanvasBridge({
      root,
      baseUrl: window.location.origin,
      projectId,
      token: sessionStorage.getItem('mogab:token') || undefined,
    })

    canvasBridgeRef.current = bridge

    void bridge.load('home')

    return () => {
      bridge.destroy()
      canvasBridgeRef.current = null
    }
  }, [projectId])
  const [activePanel, setActivePanel] = useState<LeftPanel>('Pages')
  const [activeAITab, setActiveAITab] = useState<AITab>('Chat')
  const [activeRuntimeTab, setActiveRuntimeTab] =
    useState<RuntimeTab>('Build')
  const [prompt, setPrompt] = useState('')

  return (
    <main className="workspace">
      <header className="workspace-topbar">
        <div className="workspace-brand">
          <span className="mogab-mark">M</span>
          <strong>MOGAB</strong>
        </div>

        <div className="workspace-project">
          <span className="project-dot" />
          <span>Nawah Cloud</span>
          <span className="project-status">Draft</span>
        </div>

        <div className="workspace-actions">
          <button type="button">Save</button>
          <button type="button">Preview</button>
          <button className="top-primary" type="button">
            Deploy
          </button>
          <button type="button" aria-label="More actions">
            ⋯
          </button>
        </div>
      </header>

      <div className="workspace-body">
        <aside className="workspace-left">
          <div className="panel-title">PROJECT</div>

          <nav className="left-navigation">
            {leftPanels.map((panel) => (
              <button
                className={activePanel === panel ? 'active' : ''}
                key={panel}
                type="button"
                onClick={() => setActivePanel(panel)}
              >
                <span className="nav-icon">
                  {panel === 'Pages'
                    ? '▤'
                    : panel === 'Layers'
                      ? '◇'
                      : panel === 'Components'
                        ? '◈'
                        : panel === 'Assets'
                          ? '▧'
                          : panel === 'Files'
                            ? '□'
                            : panel === 'Data'
                              ? '⌁'
                              : '◎'}
                </span>
                {panel}
              </button>
            ))}
          </nav>

          <div className="left-content">
            {activePanel === 'Pages' && (
              <>
                <div className="content-heading">
                  <span>Pages</span>
                  <button type="button">+</button>
                </div>

                <div className="page-list">
                  {pages.map((page, index) => (
                    <button
                      className={index === 0 ? 'page active' : 'page'}
                      key={page}
                      type="button"
                    >
                      <span>□</span>
                      {page}
                    </button>
                  ))}
                </div>
              </>
            )}

            {activePanel !== 'Pages' && (
              <div className="panel-empty">
                <span>◇</span>
                <strong>{activePanel}</strong>
                <p>
                  This workspace panel is ready for the next integration
                  phase.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section className="workspace-canvas">
          <div className="canvas-toolbar">
            <div className="canvas-breadcrumb">
              <span>Home</span>
              <span>/</span>
              <strong>Canvas</strong>
            </div>

            <div className="canvas-controls">
              <button type="button">−</button>
              <span>100%</span>
              <button type="button">+</button>
              <button type="button">↗</button>
            </div>
          </div>

          <div className="canvas-stage">
            <div className="canvas-device">
              <div className="canvas-browser">
                <span />
                <span />
                <span />
              </div>

              <div
                ref={canvasRootRef}
                className="canvas-content mogab-engine-canvas"
              />
            </div>
          </div>
        </section>

        <aside className="workspace-ai">
          <div className="ai-header">
            <div>
              <div className="ai-title">
                <span>✦</span>
                MOGAB AI
              </div>
              <small>Ready to build</small>
            </div>

            <button type="button">⋯</button>
          </div>

          <nav className="ai-tabs">
            {aiTabs.map((tab) => (
              <button
                className={activeAITab === tab ? 'active' : ''}
                key={tab}
                type="button"
                onClick={() => setActiveAITab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="ai-content">
            {activeAITab === 'Chat' && (
              <div className="chat-view">
                <div className="ai-welcome">
                  <span>✦</span>
                  <h3>What should we build?</h3>
                  <p>
                    Describe a change, add a feature, or ask MOGAB to improve
                    the current project.
                  </p>
                </div>

                <div className="suggestion-list">
                  <button type="button">
                    Create a modern hero section
                  </button>
                  <button type="button">
                    Add a pricing section
                  </button>
                  <button type="button">
                    Make the page responsive
                  </button>
                </div>
              </div>
            )}

            {activeAITab !== 'Chat' && (
              <div className="ai-empty">
                <span>✦</span>
                <strong>{activeAITab}</strong>
                <p>
                  {activeAITab === 'Plan'
                    ? 'Project planning will appear here.'
                    : activeAITab === 'Actions'
                      ? 'Executed and pending actions will appear here.'
                      : activeAITab === 'Queue'
                        ? 'Queued requests will appear here.'
                        : 'Relevant project context will appear here.'}
                </p>
              </div>
            )}
          </div>

          <div className="ai-composer">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask MOGAB to build or change something..."
              rows={3}
            />

            <div className="composer-footer">
              <button type="button">+</button>
              <button className="send-button" type="button">
                ↑
              </button>
            </div>
          </div>
        </aside>
      </div>

      <footer className="workspace-runtime">
        <div className="runtime-tabs">
          {runtimeTabs.map((tab) => (
            <button
              className={activeRuntimeTab === tab ? 'active' : ''}
              key={tab}
              type="button"
              onClick={() => setActiveRuntimeTab(tab)}
            >
              <span
                className={
                  tab === 'Build'
                    ? 'runtime-dot ready'
                    : 'runtime-dot'
                }
              />
              {tab}
            </button>
          ))}
        </div>

        <div className="runtime-status">
          <span className="status-dot" />
          All systems ready
        </div>
      </footer>
    </main>
  )
}

export default WorkspacePage
