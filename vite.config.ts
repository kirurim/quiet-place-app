import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Honor a PORT env var (used by the preview harness) while defaulting to 5173.
const PORT = Number((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.PORT)

export default defineConfig({
  plugins: [react()],
  server: {
    port: PORT || 5173,
  },
})
