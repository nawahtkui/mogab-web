import { useMemo, useState } from 'react'
import '../../App.css'
import { apiFetch } from '../../api/client'

const demoProject = {
  name: 'Nawah Cloud',
  type: 'Website',
  description:
    'A modern cloud platform for discovering digital services, launching projects, and managing deployments.',
}

interface SetupPageProps {
  initialPrompt?: string
  onBack: () => void
  onStartBuilding: (projectId: string) => void
}

type CreateProjectResponse = {
  id?: string
  success?: boolean
  project?: {
    id: string
  }
  error?: string
}

type ProductCategory = 'website' | 'app'

type WebsiteStructure = {
  pages: string[]
  features: string[]
}

type ApplicationStructure = {
  screens: string[]
  capabilities: string[]
}

async function createProject(
  name: string,
  type: string,
  description: string,
): Promise<string> {
  const template =
    type === 'SaaS'
      ? 'saas'
      : type === 'Web3'
        ? 'web3'
        : type === 'Website' || type === 'Landing'
          ? 'landing'
          : 'default'

  const body = (await apiFetch('/projects', {
    method: 'POST',
    body: JSON.stringify({
      name,
      template,
      status: 'created',
    }),
  })) as CreateProjectResponse

  if (!body.id) {
    throw new Error(body.error || 'Project creation failed')
  }

  if (description.trim()) {
    sessionStorage.setItem(
      `mogab:project:${body.id}:prompt`,
      description.trim(),
    )
  }

  return body.id
}

function inferStructure(
  category: ProductCategory,
  type: string,
  description: string,
): WebsiteStructure | ApplicationStructure {
  const text = description.toLowerCase()

  if (category === 'app') {
    const screens = new Set<string>(['Home'])
    const capabilities = new Set<string>([
      'Responsive application',
    ])

    const add = (
      newScreens: string[],
      newCapabilities: string[],
    ) => {
      newScreens.forEach((screen) => screens.add(screen))
      newCapabilities.forEach((capability) =>
        capabilities.add(capability),
      )
    }

    switch (type) {
      case 'Web App':
        add(
          ['App', 'Dashboard', 'Settings'],
          [
            'User authentication',
            'Interactive experience',
            'Application workflow',
          ],
        )
        break

      case 'SaaS App':
        add(
          ['Dashboard', 'Pricing', 'Settings'],
          [
            'User authentication',
            'Dashboard experience',
            'Subscription management',
          ],
        )
        break

      case 'Dashboard':
        add(
          ['Dashboard', 'Settings'],
          [
            'User authentication',
            'Dashboard experience',
            'Data visualization',
          ],
        )
        break

      case 'Marketplace':
        add(
          ['Marketplace', 'Product details', 'Cart', 'Checkout'],
          [
            'Listings and discovery',
            'Search and discovery',
            'Shopping cart',
            'Checkout',
          ],
        )
        break

      case 'Financial App':
        add(
          ['Dashboard', 'Transactions', 'Transfers'],
          [
            'User authentication',
            'Financial dashboard',
            'Balance management',
            'Transaction history',
            'Transfers',
          ],
        )
        break

      case 'Custom':
        add(
          ['App', 'Settings'],
          [
            'Interactive experience',
            'Custom application workflow',
          ],
        )
        break
    }

    if (
      text.includes('login') ||
      text.includes('sign in') ||
      text.includes('authentication')
    ) {
      screens.add('Login')
      capabilities.add('User authentication')
    }

    if (
      text.includes('payment') ||
      text.includes('checkout') ||
      text.includes('billing')
    ) {
      screens.add('Payments')
      capabilities.add('Payments and billing')
    }

    if (
      text.includes('search') ||
      text.includes('marketplace') ||
      text.includes('catalog')
    ) {
      capabilities.add('Search and discovery')
    }

    if (
      text.includes('notification') ||
      text.includes('alert')
    ) {
      capabilities.add('Notifications')
    }

    return {
      screens: Array.from(screens),
      capabilities: Array.from(capabilities),
    }
  }

  const pages = new Set<string>(['Home'])
  const features = new Set<string>(['Responsive design'])

  const add = (
    newPages: string[],
    newFeatures: string[],
  ) => {
    newPages.forEach((page) => pages.add(page))
    newFeatures.forEach((feature) => features.add(feature))
  }

  switch (type) {
    case 'Business':
      add(
        ['Services', 'About', 'Contact'],
        ['Service sections', 'Contact form'],
      )
      break

    case 'E-commerce':
      add(
        ['Products', 'Product details', 'Cart', 'Checkout'],
        [
          'Product catalog',
          'Search and discovery',
          'Shopping cart',
          'Checkout',
        ],
      )
      break

    case 'Landing Page':
      add(
        ['Contact'],
        [
          'Conversion-focused layout',
          'Call-to-action sections',
        ],
      )
      break

    case 'Blog / Magazine':
      add(
        ['Blog', 'Article'],
        [
          'Content collection',
          'Article publishing',
          'Search and discovery',
        ],
      )
      break

    case 'Services':
      add(
        ['Services', 'About', 'Contact'],
        [
          'Service sections',
          'Contact form',
          'Service discovery',
        ],
      )
      break

    case 'Portfolio':
      add(
        ['Projects', 'About', 'Contact'],
        [
          'Project showcase',
          'Content collection',
          'Contact form',
        ],
      )
      break

    case 'Product':
      add(
        ['Product', 'Features', 'Pricing'],
        [
          'Product presentation',
          'Feature sections',
          'Pricing section',
        ],
      )
      break

    case 'SaaS':
      add(
        ['Dashboard', 'Pricing', 'Settings'],
        [
          'User authentication',
          'Dashboard experience',
          'Subscription management',
        ],
      )
      break

    case 'Custom':
      add(
        ['About', 'Contact'],
        [
          'Modern visual design',
          'Interactive sections',
        ],
      )
      break
  }

  if (text.includes('pricing') || text.includes('price')) {
    pages.add('Pricing')
    features.add('Pricing section')
  }

  if (
    text.includes('contact') ||
    text.includes('form') ||
    text.includes('support')
  ) {
    pages.add('Contact')
    features.add('Contact form')
  }

  if (
    text.includes('blog') ||
    text.includes('article') ||
    text.includes('news')
  ) {
    pages.add('Blog')
    features.add('Content collection')
  }

  if (
    text.includes('search') ||
    text.includes('catalog') ||
    text.includes('product')
  ) {
    features.add('Search and discovery')
  }

  if (
    text.includes('cloud') ||
    text.includes('deploy') ||
    text.includes('hosting')
  ) {
    features.add('Cloud-ready deployment')
  }

  return {
    pages: Array.from(pages),
    features: Array.from(features),
  }
}

function SetupPage({
  initialPrompt = '',
  onBack,
  onStartBuilding,
}: SetupPageProps) {
  const [projectName, setProjectName] = useState(demoProject.name)

  const [productCategory, setProductCategory] =
    useState<ProductCategory>('website')

  const [projectType, setProjectType] = useState('Business')

  const [description, setDescription] = useState(
    initialPrompt.trim() || demoProject.description,
  )

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const isApplication = productCategory === 'app'

  const structure = useMemo(
    () =>
      inferStructure(
        productCategory,
        projectType,
        description,
      ),
    [productCategory, projectType, description],
  )

  const handleCategoryChange = (category: ProductCategory) => {
    setProductCategory(category)
    setError('')

    if (category === 'website') {
      setProjectType('Business')

      if (!initialPrompt.trim()) {
        setDescription(demoProject.description)
      }

      return
    }

    setProjectType('Web App')

    if (!initialPrompt.trim()) {
      setDescription(
        'Describe the application you want to build, the users it serves, and the main workflows it should support.',
      )
    }
  }

  const handleStartBuilding = async () => {
    const name = projectName.trim()
    const projectDescription = description.trim()

    if (!name) {
      setError('Please enter a project name.')
      return
    }

    if (!projectDescription) {
      setError(
        isApplication
          ? 'Please describe the application you want to build.'
          : 'Please describe the website you want to build.',
      )
      return
    }

    setError('')
    setIsCreating(true)

    try {
      const projectId = await createProject(
        name,
        projectType,
        projectDescription,
      )

      sessionStorage.setItem(
        `mogab:project:${projectId}:structure`,
        JSON.stringify({
          category: productCategory,
          type: projectType,
          ...structure,
        }),
      )

      onStartBuilding(projectId)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to create the project.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <main className="setup-page">
      <div className="setup-container">
        <header className="setup-heading">
          <div className="eyebrow">01 PROJECT SETUP</div>

          <h1>
            {isApplication
              ? 'UNDERSTANDING YOUR APPLICATION'
              : 'UNDERSTANDING YOUR WEBSITE'}
          </h1>

          <p>
            {isApplication
              ? 'Define the application model before building begins. MOGAB will use this structure as the foundation for the build.'
              : 'Define the website model before building begins. MOGAB will use this structure as the foundation for the build.'}
          </p>
        </header>

        <div className="setup-grid">
          <section className="setup-card">
            <div className="card-kicker">
              {isApplication ? 'APPLICATION' : 'PROJECT'}
            </div>

            <h2>Tell MOGAB what you are building.</h2>

            <div className="field-group">
              <label className="field-label" htmlFor="project-name">
                {isApplication
                  ? 'Application name'
                  : 'Project name'}
              </label>

              <input
                id="project-name"
                className="text-input"
                value={projectName}
                onChange={(event) =>
                  setProjectName(event.target.value)
                }
                placeholder={
                  isApplication
                    ? 'e.g. Nawah Express'
                    : 'e.g. Nawah Cloud'
                }
                disabled={isCreating}
              />
            </div>

            <div className="field-group">
              <span className="field-label">Product model</span>

              <div className="type-grid">
                <button
                  className={
                    productCategory === 'website'
                      ? 'type-option active'
                      : 'type-option'
                  }
                  type="button"
                  onClick={() =>
                    handleCategoryChange('website')
                  }
                  disabled={isCreating}
                >
                  🌐 Website
                </button>

                <button
                  className={
                    productCategory === 'app'
                      ? 'type-option active'
                      : 'type-option'
                  }
                  type="button"
                  onClick={() => handleCategoryChange('app')}
                  disabled={isCreating}
                >
                  📱 Applications
                </button>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="description">
                {isApplication
                  ? 'Application description'
                  : 'Website description'}
              </label>

              <textarea
                id="description"
                className="text-area"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder={
                  isApplication
                    ? 'Describe the users, workflows, screens, data, and capabilities your application should have.'
                    : 'Describe the purpose, audience, content, pages, and experience your website should have.'
                }
                rows={7}
                disabled={isCreating}
              />
            </div>
          </section>

          <section className="setup-card">
            <div className="card-kicker">
              {isApplication
                ? 'UNDERSTOOD APPLICATION'
                : 'UNDERSTOOD WEBSITE'}
            </div>

            <h2>
              {isApplication
                ? 'MOGAB mapped your application.'
                : 'MOGAB mapped your website.'}
            </h2>

            <p className="structure-intro">
              {isApplication
                ? 'These screens and capabilities form the initial application model.'
                : 'These pages and features form the initial website model.'}
            </p>

            <div className="structure-section">
              <div className="structure-label">
                {isApplication ? 'SCREENS' : 'PAGES'}
              </div>

              <div className="tag-list">
                {isApplication
                  ? (structure as ApplicationStructure).screens.map(
                      (screen) => (
                        <span
                          className="structure-tag"
                          key={screen}
                        >
                          {screen}
                        </span>
                      ),
                    )
                  : (structure as WebsiteStructure).pages.map(
                      (page) => (
                        <span
                          className="structure-tag"
                          key={page}
                        >
                          {page}
                        </span>
                      ),
                    )}
              </div>
            </div>

            <div className="structure-section">
              <div className="structure-label">
                {isApplication
                  ? 'CAPABILITIES'
                  : 'FEATURES'}
              </div>

              <ul className="feature-list">
                {isApplication
                  ? (
                      structure as ApplicationStructure
                    ).capabilities.map((capability) => (
                      <li key={capability}>{capability}</li>
                    ))
                  : (structure as WebsiteStructure).features.map(
                      (feature) => (
                        <li key={feature}>{feature}</li>
                      ),
                    )}
              </ul>
            </div>

            <div className="ai-note">
              <div className="ai-note-title">MOGAB AI</div>

              <p>
                {isApplication
                  ? 'This application model updates as you describe your product. Refine the users, workflows, screens, and capabilities before starting the build.'
                  : 'This website model updates as you describe your project. Refine the content, pages, and experience before starting the build.'}
              </p>
            </div>
          </section>
        </div>

        {error && (
          <div className="setup-error" role="alert">
            {error}
          </div>
        )}

        <div className="setup-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={onBack}
            disabled={isCreating}
          >
            Back
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={handleStartBuilding}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Start building'}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </main>
  )
}

export default SetupPage
