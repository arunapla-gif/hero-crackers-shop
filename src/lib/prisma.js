import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  let dbUrl = process.env.DATABASE_URL
  if (dbUrl && dbUrl.startsWith('prisma+postgres://')) {
    dbUrl = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'
  }
  const pool = new Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
