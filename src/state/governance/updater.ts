import { useEffect } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useSubgraphClient } from '../application/hooks'
import { useAllIdentities } from '../social/hooks'
import { fetchTopDelegates, fetchVerifiedDelegates } from '../../data/governance'
import { useTopDelegates, useVerifiedDelegates } from './hooks'

export default function Updater(): null {
  // fetched all indentity info if haven't yet
  const { library } = useActiveWeb3React()

  // get graphql client for active protocol
  const client = useSubgraphClient()

  const [allIdentities] = useAllIdentities()

  const [, setTopDelegates] = useTopDelegates()
  const [, setVerifiedDelegates] = useVerifiedDelegates()

  useEffect(() => {
    async function fetchTopDelegateData() {
      try {
        library &&
          allIdentities &&
          client &&
          fetchTopDelegates(client, library, allIdentities).then(async delegateData => {
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

  useEffect(() => {
    async function fetchVerifiedDelegateData() {
      try {
        library &&
          allIdentities &&
          client &&
          fetchVerifiedDelegates(client, library, allIdentities).then(async delegateData => {
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
