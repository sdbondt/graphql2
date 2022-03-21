import { ApolloServer } from 'apollo-server'
import resolvers from './resolvers'
import typeDefs from './typeDefs'
import { PrismaClient, Prisma } from '@prisma/client'
import { getUserFromToken } from './utils/getUser'

const prisma = new PrismaClient()

export interface Context {
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;
    userInfo: {
        userId: number 
    } | null
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }: any): Promise<Context> => {
        const userInfo = await getUserFromToken(req.headers.authorization);

    return {
      prisma,
      userInfo,
    }
    }
})

server.listen().then(({ url }) => {
    console.log(`Server is running on ${url}`)
})