import { GraphQLServer } from 'graphql-yoga'
import { genSchema } from './utils/genSchema'
import { createTypeormConnection } from './utils/createTypeormConnection'

export const startServer = async () => {
  const server = new GraphQLServer({ schema: genSchema() })

  await createTypeormConnection()
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 4000
  })
  console.log(`🚀 Server ready at localhost:4000`)
  return app
}
