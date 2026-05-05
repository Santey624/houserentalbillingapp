import { defineConfig } from '@prisma/config'

export default defineConfig({
  // Connection URL used for Prisma Migrate (schema push/migrations)
  // Only required for migrate commands, not for prisma generate
  ...(process.env.DIRECT_URL
    ? {
        datasource: {
          url: process.env.DIRECT_URL,
        },
      }
    : {}),
})
