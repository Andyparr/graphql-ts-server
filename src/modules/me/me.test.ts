import axios from 'axios'
import { createTypeormConnection } from '../../utils/createTypeormConnection'
import { User } from '../../entity/User'
import { Connection } from 'typeorm'

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

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}") {
    ok
    message
  }
}
`

const meQuery = `
{
  me {
    id
    email
  }
}
`

describe('me', () => {
  // test("can't get user if not logged in", async () => {
  // later
  // });

  test('get current user', async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    )

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        withCredentials: true
      }
    )

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    })
  })
})
