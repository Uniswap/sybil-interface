import gql from 'graphql-tag'

export const LOOKUP = gql`
  query attestations($user: Bytes!) {
    attestations(where: { id: $user }) {
      id
      handle
    }
  }
`
