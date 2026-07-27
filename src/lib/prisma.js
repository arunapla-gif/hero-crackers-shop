import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  let dbUrl = "postgresql://postgres.gqfpfnqepdkletbbhwcx:IevuJqEtZ8V1eKhz@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?schema=shop"
  const pool = new Pool({ 
    connectionString: dbUrl,
    max: 1,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 15000,
    allowExitOnIdle: true
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
