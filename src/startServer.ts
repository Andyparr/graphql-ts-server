import * as connectRedis from 'connect-redis'
import * as session from 'express-session'
import { createTestConnection } from './testUtils/createTestConnection'
import { createTypeormConnection } from './utils/createTypeormConnection'
import { genSchema } from './utils/genSchema'
import { GraphQLServer } from 'graphql-yoga'
import { redis } from './redis'
import { redisSessionPrefix } from './constants'
import 'reflect-metadata'
import 'dotenv/config'

const SESSION_SECRET = 'ajslkjalksjdfkl'
const RedisStore = connectRedis(session as any)

export const startServer = async () => {
  if (process.env.NODE_ENV === 'test') {
    await redis.flushall()
  }

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      session: request.session,
      req: request
    })
  })

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
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
    } as any)
  )

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === 'test'
        ? '*'
        : (process.env.FRONTEND_HOST as string)
  }

  if (process.env.NODE_ENV === 'test') {
    await createTestConnection(true)
  } else {
    await createTypeormConnection()
  }

  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === 'test' ? 0 : 4000
  })
  console.log(`🚀 Server ready at localhost:4000`)
  return app
}
