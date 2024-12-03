import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prismaClientSingleton = () => {
  const prisma = new PrismaClient()
  return prisma.$extends(withAccelerate())
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

// Create a separate instance without Accelerate for NextAuth adapter
export const authPrisma = new PrismaClient()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma