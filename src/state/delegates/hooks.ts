import { useState, useEffect } from 'react'
import { governanceClient } from '../../apollo/client'
import { TOP_DELEGATES } from '../../apollo/queries'

export interface DelegateData {
  id: string
  delegatedVotes: number
}

interface DelegateResponse {
  data: {
    delegates: DelegateData[]
  }
}

// @todo add typed query response
export function useTopDelegates() {
  const [delegates, setDelegates] = useState<DelegateData[] | undefined>()

  // subgraphs only store ids in lowercase, format
  useEffect(() => {
    governanceClient
      .query({
        query: TOP_DELEGATES,

        fetchPolicy: 'cache-first'
      })
      .then((res: DelegateResponse) => {
        if (res) {
          setDelegates(res.data.delegates)
        }
      })
  }, [])

  return delegates
}
