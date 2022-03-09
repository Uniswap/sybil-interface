import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const uniswapClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/arr00/uniswap-governance-v2',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const compoundClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/arr00/compound-governance-2',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const aaveClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/aave/governance-sybil',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const poolClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-governance',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const radicleClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/radicle-dev/radicle-governance-homestead',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const nounsClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const ensClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/ens-governance',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const candleClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/candleplatforms/candlegovernor',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})
