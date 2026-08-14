import path from 'node:path'
import { defineConfig } from 'prisma/config'

const DB_URL = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

export default defineConfig({
  schema: path.join(import.meta.dirname, 'prisma/schema.prisma'),
  datasource: {
    url: DB_URL,
  },
})
