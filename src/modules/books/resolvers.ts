import { ResolverMap } from '../../types/graphql-utils'
import { Book } from '../../entity/Book'

export const resolvers: ResolverMap = {
  Query: {
    getAllBooks: async () => {
      const books = await Book.find()
      return books
    }
  },
  Mutation: {
    addBook: async (_, args: GQL.IAddBookOnMutationArguments) => {
      const { title, author } = args
      const bookAlreadyExists = await Book.findOne({ where: { title, author } })
      if (bookAlreadyExists) {
        return {
          ok: '👎',
          message: 'Book already exists'
        }
      }

      const book = Book.create({
        title,
        author,
        createdAt: new Date()
      })
      await book.save()
      return {
        ok: '👍',
        message: 'Book added'
      }
    },
    deleteBook: async (_, args: GQL.IDeleteBookOnMutationArguments) => {
      const { id } = args
      const retrieveBook = await Book.findOne({ where: { id } })
      if (!retrieveBook) {
        return {
          ok: '👎',
          message: 'Book does not exist'
        }
      }
      await retrieveBook.remove()
      return {
        ok: '👍',
        message: 'Book has been removed'
      }
    },
    updateBook: async (_, args: GQL.IUpdateBookOnMutationArguments) => {
      const { id, title, author } = args
      const retrieveBook = await Book.findOne({ where: { id } })
      if (!retrieveBook) {
        return {
          ok: '👎',
          message: 'Book does not exist'
        }
      }
      if (!title && !author) {
        return {
          ok: '👎',
          message: 'No fields updated'
        }
      }
      if (title) {
        retrieveBook.title = title
      }
      if (author) {
        retrieveBook.author = author
      }
      await Book.update(
        { id },
        { title: retrieveBook.title, author: retrieveBook.author }
      )
      return {
        ok: '👍',
        message: 'Book updated'
      }
    }
  }
}
