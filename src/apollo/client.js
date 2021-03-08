import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

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

export const aaveClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/aave/governance-sybil'
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
})

export const poolClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-governance'
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
})

export const radicleClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/radicle-dev/radicle-governance-homestead'
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
})
