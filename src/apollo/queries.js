import gql from 'graphql-tag'

// check subgraph if address has an announced handle
export const HANDLE_LOOKUP = gql`
  query attestations($user: Bytes!) {
    attestations(where: { id: $user }) {
      id
      handle
    }
  }
`

// fetch top delegates by votes delegated at current time
export const TOP_DELEGATES = gql`
  query delegates {
    delegates(first: 10, orderBy: delegatedVotes, orderDirection: desc) {
      id
      delegatedVotes
      tokenHoldersRepresentedAmount
    }
  }
`
