import { useEffect } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useSubgraphClient } from '../application/hooks'
import { useAllIdentities } from '../social/hooks'
import { fetchDelegates } from '../../data/governance'
import { useFilterActive, useTopDelegates, useActiveProtocol } from './hooks'

export default function Updater(): null {
  // fetched all indentity info if haven't yet
  const { library } = useActiveWeb3React()

  // get graphql client for active protocol
  const client = useSubgraphClient()

  const [allIdentities] = useAllIdentities()

  const [filter] = useFilterActive()

  const [topDelegates, setTopDelegates] = useTopDelegates()

  // reset list on active protocol change
  const [activeProtocol] = useActiveProtocol()

  useEffect(() => {
    setTopDelegates(undefined)
  }, [activeProtocol, setTopDelegates])

  // if verified handles update, reset
  useEffect(() => {
    if (allIdentities) {
      setTopDelegates(undefined)
    }
  }, [allIdentities, setTopDelegates])

  // if filter handles update, reset
  useEffect(() => {
    setTopDelegates(undefined)
  }, [filter, setTopDelegates])

  useEffect(() => {
    async function fetchTopDelegates() {
      try {
        library &&
          allIdentities &&
          fetchDelegates(client, library, allIdentities, filter).then(async delegateData => {
            if (delegateData) {
              setTopDelegates(delegateData)
            }
          })
      } catch (e) {
        console.log(e)
      }
    }
    if (!topDelegates && client && allIdentities) {
      fetchTopDelegates()
    }
  }, [library, client, topDelegates, allIdentities, filter, setTopDelegates])

  return null
}
