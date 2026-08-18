import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { config as dotenvConfig } from 'dotenv'

// Load .env for Prisma CLI commands (db push, migrate, studio)
dotenvConfig({ path: path.join(import.meta.dirname, '.env') })
dotenvConfig({ path: path.join(import.meta.dirname, '.env.local') })

const DIRECT_URL =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  'file:./prisma/dev.db'

export default defineConfig({
  schema: path.join(import.meta.dirname, 'prisma/schema.prisma'),
  datasource: {
    url: DIRECT_URL,
  },
})
