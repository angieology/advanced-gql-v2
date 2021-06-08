const {ApolloServer} = require('apollo-server')
const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const {createToken, getUserFromToken} = require('./auth')
const db = require('./db')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({req, connection}) {
    const context = {...db}
    // if connection, return the context because its formed differently
    if (connection){
      return {...context, ...connection.context}
    }
    const token = req.headers.authorization
    console.log({token})
    const user = getUserFromToken(token)
    console.log(' context user', user)
    return {...context, user, createToken}
  },
  subscriptions: {
    onConnect(params) {
      // explicit: not normalized like headers are, differentiate the two "AuthAuth"
      const token = params.authToken
      const user = getUserFromToken(token)
      console.log({user})
      if (!user) throw new Error('nope')
      return {user} // this object gets merged with connection.context above
    }
  }
})

server.listen(4000).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`)
})
