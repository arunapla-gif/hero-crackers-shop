import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  let dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not defined.')
  }
  if (dbUrl.includes('connection_limit=10')) {
    dbUrl = dbUrl.replace('connection_limit=10', 'connection_limit=5')
  } else if (dbUrl.includes('connection_limit=1')) {
    dbUrl = dbUrl.replace('connection_limit=1', 'connection_limit=5')
  }
  const pool = new Pool({ 
    connectionString: dbUrl,
    max: 5,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 10000,
    allowExitOnIdle: true
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
