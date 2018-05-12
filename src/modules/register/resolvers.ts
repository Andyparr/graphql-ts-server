import * as yup from 'yup'
import { ResolverMap } from '../../types/graphql-utils'
import { User } from '../../entity/User'
import { formatYupError } from '../../utils/formatYupError'
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from './errorMessages'

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: yup
    .string()
    .min(3, passwordNotLongEnough)
    .max(255)
})

export const resolvers: ResolverMap = {
  Query: {
    getAllUsers: async () => {
      const users = await User.find()
      return users
    }
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      try {
        await schema.validate(args, { abortEarly: false })
      } catch (error) {
        return formatYupError(error)
      }
      const { firstName, lastName, email, password } = args
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ['id']
      })

      if (userAlreadyExists) {
        return [
          {
            ok: '👎',
            path: 'email',
            message: duplicateEmail
          }
        ]
      }

      const user = User.create({
        firstName,
        lastName,
        email,
        password,
        registeredAt: new Date()
      })

      await user.save()

      return [
        {
          ok: '👍',
          message: 'User has been registered successfully'
        }
      ]
    },
    deleteUser: async (_: any, args: GQL.IDeleteUserOnMutationArguments) => {
      const { id } = args
      const retrieveUser = await User.findOne({ where: { id } })
      if (!retrieveUser) {
        return {
          ok: '👎',
          message: 'User does not exist'
        }
      }
      await retrieveUser.remove()
      return {
        ok: '👍',
        message: 'User has been removed'
      }
    }
  }
}
