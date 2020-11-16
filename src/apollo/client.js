import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { split } from 'apollo-link'

// Create an http link:
const httpLink = new HttpLink({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/sybil'
})

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: 'wss://api.thegraph.com/subgraphs/name/ianlapham/sybil',
  options: {
    reconnect: true
  }
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  httpLink
)

export const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
  shouldBatch: true
})

export const uniswapClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/governance-tracking'
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
})

export const compoundClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/protofire/compound-governance'
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
})
