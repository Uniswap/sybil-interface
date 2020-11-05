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
    delegates(first: 50, orderBy: delegatedVotes, orderDirection: desc) {
      id
      delegatedVotes
      tokenHoldersRepresentedAmount
    }
  }
`

// all proposals
export const PROPOSALS = gql`
  query proposals {
    proposals(first: 100) {
      id
      targets
      values
      signatures
      status
      calldatas
      description
      startBlock
      endBlock
      proposer {
        id
      }
    }
  }
`
