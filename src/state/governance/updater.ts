import { useEffect } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useSubgraphClient } from '../application/hooks'
import { useAllIdentities } from '../social/hooks'
import { fetchTopDelegates, fetchVerifiedDelegates } from '../../data/governance'
import { useTopDelegates, useActiveProtocol, useVerifiedDelegates } from './hooks'

export default function Updater(): null {
  // fetched all indentity info if haven't yet
  const { library } = useActiveWeb3React()

  // get graphql client for active protocol
  const client = useSubgraphClient()

  const [allIdentities] = useAllIdentities()

  const [topDelegates, setTopDelegates] = useTopDelegates()
  const [verifiedDelegates, setVerifiedDelegates] = useVerifiedDelegates()

  // reset lists on active protocol change
  const [activeProtocol] = useActiveProtocol()

  useEffect(() => {
    setTopDelegates(undefined)
    setVerifiedDelegates(undefined)
  }, [activeProtocol, setTopDelegates, setVerifiedDelegates])

  // if verified handles update, reset
  useEffect(() => {
    if (allIdentities) {
      setTopDelegates(undefined)
      setVerifiedDelegates(undefined)
    }
  }, [allIdentities, setTopDelegates, setVerifiedDelegates])

  useEffect(() => {
    async function fetchTopDelegateData() {
      try {
        library &&
          allIdentities &&
          fetchTopDelegates(client, library, allIdentities).then(async delegateData => {
            if (delegateData) {
              setTopDelegates(delegateData)
            }
          })
      } catch (e) {
        console.log(e)
      }
    }
    if (!topDelegates && client && allIdentities) {
      fetchTopDelegateData()
    }
  }, [library, client, topDelegates, allIdentities, setTopDelegates])

  useEffect(() => {
    async function fetchVerifiedDelegateData() {
      try {
        library &&
          allIdentities &&
          fetchVerifiedDelegates(client, library, allIdentities).then(async delegateData => {
            if (delegateData) {
              setVerifiedDelegates(delegateData)
            }
          })
      } catch (e) {
        console.log(e)
      }
    }
    if (!verifiedDelegates && client && allIdentities) {
      fetchVerifiedDelegateData()
    }
  }, [library, client, allIdentities, verifiedDelegates, setVerifiedDelegates])

  return null
}
