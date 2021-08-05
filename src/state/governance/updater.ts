import { useEffect } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useSubgraphClient } from '../application/hooks'
import { useAllIdentities } from '../social/hooks'
import {
  fetchTopDelegates,
  fetchVerifiedDelegates,
  fetchGlobalData,
  fetchTopDelegatesOffset,
} from '../../data/governance'
import { useTopDelegates, useVerifiedDelegates, useGlobalData, useMaxFetched, useActiveProtocol } from './hooks'
import { GlobaData, FETCHING_INTERVAL } from './reducer'

export default function Updater(): null {
  // fetched all indentity info if haven't yet
  const { library } = useActiveWeb3React()

  // get graphql client for active protocol
  const client = useSubgraphClient()

  const [allIdentities] = useAllIdentities()

  const [activeProtocol] = useActiveProtocol()

  const [topDelegates, setTopDelegates] = useTopDelegates()
  const [, setVerifiedDelegates] = useVerifiedDelegates()

  // fetch global data stats for protocol if not loaded
  const [globalData, setGlobalData] = useGlobalData()
  useEffect(() => {
    if (!globalData) {
      fetchGlobalData(client).then((data: GlobaData | null) => {
        if (data) {
          setGlobalData(data)
        }
      })
    }
  }, [client, globalData, setGlobalData])

  const [maxFetched, setMaxFetched] = useMaxFetched()

  // udpate maxed fetched amount if protocol is active
  useEffect(() => {
    if (activeProtocol && !maxFetched) {
      setMaxFetched(FETCHING_INTERVAL)
    }
  }, [activeProtocol, maxFetched, setMaxFetched])

  useEffect(() => {
    async function fetchTopDelegateData() {
      try {
        library &&
          allIdentities &&
          client &&
          fetchTopDelegates(client, library, allIdentities).then(async (delegateData) => {
            if (delegateData) {
              setTopDelegates(delegateData)
            }
          })
      } catch (e) {
        console.log('ERROR:' + e)
      }
    }
    fetchTopDelegateData()
  }, [library, client, allIdentities, setTopDelegates])

  // fetch additional data and concat if needed
  useEffect(() => {
    async function fetchTopDelegateData() {
      if (
        library &&
        allIdentities &&
        client &&
        topDelegates &&
        maxFetched &&
        globalData &&
        topDelegates.length < maxFetched &&
        maxFetched < globalData.totalDelegates // dont fetch if we'eve reach max amount of delegates
      ) {
        try {
          fetchTopDelegatesOffset(client, library, allIdentities, maxFetched).then(async (delegateData) => {
            if (delegateData) {
              setTopDelegates(topDelegates.concat(delegateData))
            }
          })
        } catch (e) {
          console.log('ERROR:' + e)
        }
      }
    }
    fetchTopDelegateData()
  }, [library, client, allIdentities, setTopDelegates, topDelegates, maxFetched, globalData])

  useEffect(() => {
    async function fetchVerifiedDelegateData() {
      try {
        library &&
          allIdentities &&
          client &&
          fetchVerifiedDelegates(client, library, allIdentities).then(async (delegateData) => {
            if (delegateData) {
              setVerifiedDelegates(delegateData)
            }
          })
      } catch (e) {
        console.log(e)
      }
    }
    fetchVerifiedDelegateData()
  }, [library, client, allIdentities, setVerifiedDelegates])

  return null
}
