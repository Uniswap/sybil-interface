import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/sybil'
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
})

export const governanceClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/governance-tracking'
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
})
