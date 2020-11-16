import gql from 'graphql-tag'

// check subgraph if address has an announced handle
export const CONTENT_LOOKUP_FOR_ADDRESS = gql`
  query attestations($account: Bytes!) {
    attestations(where: { account: $account }) {
      id
      account
      tweetID
    }
  }
`

export const CONTENT_SUBSCRIPTION = gql`
  subscription onContetUpdate($account: Bytes!) {
    attestations(where: { account: $account }) {
      id
      account
      tweetID
    }
  }
`

export const GLOBAL_DATA = gql`
  query governance {
    governances(first: 1) {
      delegatedVotes
      delegatedVotesRaw
      totalTokenHolders
      totalDelegates
    }
  }
`

// fetch top delegates by votes delegated at current time
export const TOP_DELEGATES = gql`
  query delegates {
    delegates(first: 50, orderBy: delegatedVotes, orderDirection: desc) {
      id
      delegatedVotes
      delegatedVotesRaw
      tokenHoldersRepresentedAmount
      votes {
        id
        votes
        support
      }
    }
  }
`

// all proposals
export const PROPOSALS = gql`
  query proposals {
    proposals(first: 100, orderBy: startBlock, orderDirection: desc) {
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
