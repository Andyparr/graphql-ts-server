import { createTypeormConnection } from '../../utils/createTypeormConnection'
import { User } from '../../entity/User'
import { Connection } from 'typeorm'
import { TestClient } from '../../utils/TestClient'

let userId: string
let conn: Connection
const firstName = 'test'
const lastName = 'test'
const email = 'test@test.com'
const password = 'testpassword'

beforeAll(async () => {
  conn = await createTypeormConnection()
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    registeredAt: new Date(),
    confirmed: true
  }).save()
  userId = user.id
})

afterAll(async () => {
  conn.close()
})

describe('me', () => {
  test('return null if no cookie', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    const response = await client.me()
    expect(response.data.me).toBeNull()
  })

  test('get current user', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    await client.login(email, password)
    const response = await client.me()

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    })
  })
})
