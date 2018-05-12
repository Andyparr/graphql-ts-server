import 'reflect-metadata'
import 'dotenv/config'
import { GraphQLServer } from 'graphql-yoga'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'

import { redis } from './redis'
import { genSchema } from './utils/genSchema'
import { createTypeormConnection } from './utils/createTypeormConnection'

const SESSION_SECRET = 'ajslkjalksjdfkl'
const RedisStore = connectRedis(session)

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      session: request.session
    })
  })

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: 'qid',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  )

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === 'test'
        ? '*'
        : (process.env.FRONTEND_HOST as string)
  }

  await createTypeormConnection()
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === 'test' ? 0 : 4000
  })
  console.log(`🚀 Server ready at localhost:4000`)
  return app
}
