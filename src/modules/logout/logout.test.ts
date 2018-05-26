import { Connection } from 'typeorm'
import { createTypeormConnection } from '../../utils/createTypeormConnection'
import { User } from '../../entity/User'
import { TestClient } from '../../utils/TestClient'

let connection: Connection
const firstName = 'testfirstname'
const lastName = 'testlastname'
const email = 'test@test.com'
const password = 'testpassword'

let userId: string
beforeAll(async () => {
  connection = await createTypeormConnection()
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
  connection.close()
})

describe('logout', () => {
  test('test logging out a user', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)

    await client.login(email, password)

    const response = await client.me()

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    })

    await client.logout()

    const response2 = await client.me()

    expect(response2.data.me).toBeNull()
  })

  test('logout of all sessions', async () => {
    const session1 = new TestClient(process.env.TEST_HOST as string)
    const session2 = new TestClient(process.env.TEST_HOST as string)

    await session1.login(email, password)
    await session2.login(email, password)
    expect(await session1.me()).toEqual(await session2.me())
    await session1.logout()
    expect(await session1.me()).toEqual(await session2.me())
  })
})
