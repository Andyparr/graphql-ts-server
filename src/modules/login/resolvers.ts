import * as bcrypt from 'bcryptjs'
import { ResolverMap } from '../../types/graphql-utils'
import { User } from '../../entity/User'
import { invalidLogin, confirmEmailError } from './errorMessages'
import { userSessionIdPrefix } from '../../constants'

const errorResponse = [
  {
    ok: '👎',
    message: invalidLogin
  }
]

export const resolvers: ResolverMap = {
  Query: {
    hello: () => 'hello'
  },
  Mutation: {
    login: async (
      _,
      args: GQL.ILoginOnMutationArguments,
      { session, redis, req }
    ) => {
      const { email, password } = args
      const user = await User.findOne({
        where: { email }
      })

      if (!user) {
        return errorResponse
      }

      if (!user.confirmed) {
        return [
          {
            ok: '👎',
            message: confirmEmailError
          }
        ]
      }

      const validLogin = await bcrypt.compare(password, user.password)

      if (!validLogin) {
        return errorResponse
      }

      session.userId = user.id
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID)
      }

      return [
        {
          ok: '👍',
          message: 'Logged in successfully'
        }
      ]
    }
  }
}
