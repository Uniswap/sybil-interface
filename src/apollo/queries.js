import gql from 'graphql-tag'

export const HANDLES_BULK = gql`
  query governance($accounts: [Bytes]!) {
    attestations(where: { account_in: $accounts }) {
      id
      account
      tweetID
      timestamp
    }
  }
`

export const ATTESTATIONS_QUERY = gql`
  query attestations($account: Bytes!) {
    attestations(where: { account: $account }) {
      id
      account
      tweetID
      timestamp
    }
  }
`

export const CONTENT_SUBSCRIPTION = gql`
  subscription onContetUpdate($account: Bytes!) {
    attestations(where: { account: $account }) {
      id
      account
      tweetID
      timestamp
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
