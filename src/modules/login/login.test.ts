import { request } from 'graphql-request'
import { User } from '../../entity/User'

import { createTypeormConnection } from '../../utils/createTypeormConnection'
import { invalidLogin, confirmEmailError } from './errorMessages'

const validFirstName = 'Test'
const validLastName = 'Test'
const validEmail = 'test@email.com'
const validPassword = 'testpassword'

const registerMutation = (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => `
mutation {
  register(firstName: "${firstName}", lastName: "${lastName}", email: "${email}", password: "${password}") {
    ok
    path
    message
  }
}
`

const loginMutation = (email: string, password: string) => `
mutation {
  login(email: "${email}", password: "${password}") {
    ok
    path
    message
  }
}
`

const loginExpectError = async (
  email: string,
  password: string,
  errorMessage: string
) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(email, password)
  )

  expect(response).toEqual({
    login: [
      {
        ok: '👎',
        path: null,
        message: errorMessage
      }
    ]
  })
}

beforeAll(async () => {
  await createTypeormConnection()
})

describe('login', () => {
  test('email not found error', async () => {
    await loginExpectError('bob@bob.com', 'whatever', invalidLogin)
  })

  test('email not confirmed', async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(validFirstName, validLastName, validEmail, validPassword)
    )
    await loginExpectError(validEmail, validPassword, confirmEmailError)
  })

  test('login successfully', async () => {
    await User.update({ email: validEmail }, { confirmed: true })

    const response: any = await request(
      process.env.TEST_HOST as string,
      loginMutation(validEmail, validPassword)
    )

    expect(response.login[0]).toEqual({
      ok: '👍',
      path: null,
      message: 'Logged in successfully'
    })
  })

  test('invalid password', async () => {
    await loginExpectError(validEmail, 'aslkdfjaksdljf', invalidLogin)
  })
})
