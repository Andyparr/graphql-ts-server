import { Connection } from 'typeorm'
import { User } from '../../entity/User'
import { createTypeormConnection } from '../../utils/createTypeormConnection'
import { invalidLogin, confirmEmailError } from './errorMessages'
import { TestClient } from '../../utils/TestClient'

const validFirstName = 'Test'
const validLastName = 'Test'
const validEmail = 'test@email.com'
const validPassword = 'testpassword'

let connection: Connection

beforeAll(async () => {
  connection = await createTypeormConnection()
})

afterAll(async () => {
  connection.close()
})

const loginExpectError = async (
  client: TestClient,
  email: string,
  password: string,
  errorMessage: string
) => {
  const response = await client.login(email, password)

  expect(response.data).toEqual({
    login: [
      {
        ok: '👎',
        path: null,
        message: errorMessage
      }
    ]
  })
}

describe('login', () => {
  test('email not found error', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    await loginExpectError(
      client,
      'test@test.com',
      'testpassword',
      invalidLogin
    )
  })

  test('email not confirmed', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)

    await client.register(
      validFirstName,
      validLastName,
      validEmail,
      validPassword
    )

    await loginExpectError(client, validEmail, validPassword, confirmEmailError)
  })

  test('login successfully', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)

    await User.update({ email: validEmail }, { confirmed: true })

    const response = await client.login(validEmail, validPassword)

    expect(response.data).toEqual({
      login: [
        {
          ok: '👍',
          path: null,
          message: 'Logged in successfully'
        }
      ]
    })
  })

  test('invalid password', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    await loginExpectError(client, validEmail, 'aslkdfjaksdljf', invalidLogin)
  })
})
