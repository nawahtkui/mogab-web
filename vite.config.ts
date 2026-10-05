import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function getBuilderToken(env: Record<string, string>) {
  const raw = env.MOGAB_BUILDER_AUTH_TOKENS || ''

  const first = raw
    .split(',')
    .map((entry) => entry.trim())
    .find(Boolean)

  if (!first) return undefined

  return first.split(':')[0].trim() || undefined
}

export default defineConfig(({ mode }) => {
  const repoRoot = import.meta.dirname
  const env = loadEnv(mode, repoRoot, '')
  const token = getBuilderToken(env)

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : undefined

  const proxy = {
    target: 'http://localhost:3007',
    changeOrigin: true,
    headers: authHeaders,
  }

  return {
    plugins: [react()],

    server: {
      port: 5173,

      proxy: {
        '/projects': proxy,
        '/ai': proxy,
        '/builder': proxy,
        '/workspace': proxy,
        '/deploy': proxy,
        '/domains': proxy,
        '/preview': {
          target: 'ws://localhost:3007',
          ws: true,
          changeOrigin: true,
          headers: authHeaders,
        },
        '/health': {
          target: 'http://localhost:3007',
          changeOrigin: true,
        },
      },
    },
  }
})
