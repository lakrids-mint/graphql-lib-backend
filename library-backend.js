"use strict"
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const dotenv = require("dotenv")

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

//Mongo db stuff
mongoose.set('useFindAndModify', false)
dotenv.config()
//
const db_uri = process.env.MONGODB_URI;
console.log('connecting to', db_uri)

mongoose.connect(db_uri, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: String!
    genres: [String!]!
    id: ID!
  }
  type Author{
    name: String
    born: Int
    id: ID
    bookCount: Int
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published:Int!
      genres: [String]
    ):Book,

    addAuthor(
      name: String!
      born: Int!
    ):Author,

    editAuthor(
      name: String!
      born: Int!
    ): Author
  }

  type Query {
    bookCount: Int!,
    authorCount:Int!,
    allBooks(author: String, genre: String): [Book], 
    allAuthors: [Author]
  }
`

const resolvers = {
  Query: {
    bookCount: ()=> Book.collection.countDocuments(),
    authorCount: ()=>Author.collection.countDocuments(),
    allBooks: (root, args)=> {
      return Book.find({})
      },
    allAuthors: (root, args)=>{
      return Author.find({})
    }
  },
  Author:{
    //make this work
    bookCount: (root)=>{
      return Book.find({author:root.author}).countDocuments()
    }
  },
  Mutation: {
    addBook: async(root, args)=>{
      const book = new Book({...args})
      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return book
    },
    addAuthor: async(root, args)=>{
      const author = new Author({...args})
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    },
    editAuthor:async (root, args)=>{
     const author = await Author.findOne({name:args.name})
      if(!author){
        return null
      }
      try {
        author.born = args.born
        author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    }
  },
}
//add context 
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})