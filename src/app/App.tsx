import { useEffect, useState } from 'react'
import HomePage from '../pages/Home/HomePage'
import SetupPage from '../pages/Setup/SetupPage'
import PreparingPage from '../pages/Preparing/PreparingPage'
import WorkspacePage from '../pages/Workspace/WorkspacePage'

type AppRoute = 'home' | 'setup' | 'preparing' | 'workspace'

function getProjectIdFromPath(routePrefix: string): string {
  const match = window.location.pathname.match(new RegExp(`^${routePrefix}/([^/]+)$`))
  return match ? match[1] : ''
}

function getRoute(): AppRoute {
  const path = window.location.pathname

  if (path === '/setup') return 'setup'
  if (path.startsWith('/preparing/')) return 'preparing'
  if (path.startsWith('/project/')) return 'workspace'

  return 'home'
}

function App() {
  const [route, setRoute] = useState<AppRoute>(getRoute)
  const [initialPrompt, setInitialPrompt] = useState(() => {
    const stored = sessionStorage.getItem('mogab:latestPrompt')
    return stored || ''
  })
  const [preparingProjectId, setPreparingProjectId] = useState(() => {
    const projectId = getProjectIdFromPath('/preparing')
    return projectId || sessionStorage.getItem('mogab:preparingProjectId') || ''
  })

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (
    nextRoute: AppRoute,
    projectId?: string,
    prompt?: string,
  ) => {
    const path =
      nextRoute === 'home'
        ? '/'
        : nextRoute === 'setup'
          ? '/setup'
          : nextRoute === 'preparing'
            ? `/preparing/${(projectId ?? preparingProjectId) || 'new-project'}`
            : `/project/${projectId ?? 'demo-project'}`

    if (projectId) {
      setPreparingProjectId(projectId)
      sessionStorage.setItem('mogab:preparingProjectId', projectId)
    }

    if (prompt !== undefined) {
      setInitialPrompt(prompt)
      sessionStorage.setItem('mogab:latestPrompt', prompt)
    }

    window.history.pushState({}, '', path)
    setRoute(nextRoute)
  }

  useEffect(() => {
    if (route === 'preparing') {
      const idFromPath = getProjectIdFromPath('/preparing')
      if (idFromPath) {
        setPreparingProjectId(idFromPath)
        sessionStorage.setItem('mogab:preparingProjectId', idFromPath)
      }
    }
  }, [route])

  if (route === 'setup') {
    return (
      <SetupPage
        onBack={() => navigate('home')}
        initialPrompt={initialPrompt}
        onStartBuilding={(projectId) => {
          sessionStorage.setItem('mogab:preparingProjectId', projectId)
          navigate('preparing', projectId, initialPrompt)
        }}
      />
    )
  }

  if (route === 'preparing') {
    const projectIdFromPath = getProjectIdFromPath('/preparing') || preparingProjectId

    if (!projectIdFromPath) {
      navigate('home')
      return null
    }

    return (
      <PreparingPage
        projectId={projectIdFromPath}
        prompt={initialPrompt}
        onBack={() => navigate('setup')}
        onComplete={(projectId) => {
          sessionStorage.setItem('mogab:preparingProjectId', projectId)
          navigate('workspace', projectId)
        }}
      />
    )
  }

  if (route === 'workspace') {
    const projectId = getProjectIdFromPath('/project') || window.location.pathname.split('/')[2]

    if (!projectId) {
      return (
        <HomePage
          onStartBuilding={(prompt) => {
            setInitialPrompt(prompt)
            navigate('setup')
          }}
        />
      )
    }

    return <WorkspacePage projectId={projectId} />
  }

  return (
    <HomePage
      onStartBuilding={(prompt) => {
        setInitialPrompt(prompt)
        navigate('setup')
      }}
    />
  )
}

export default App
