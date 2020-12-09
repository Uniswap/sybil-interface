import { Identities } from './reducer'
import { useEffect } from 'react'
import { useAllIdentities } from './hooks'
import { fetchAllIdentities } from '../../data/social'

export default function Updater(): null {
  const [identities, setIdentities] = useAllIdentities()

  // fetched all indentity info if haven't yet
  useEffect(() => {
    async function fetchData() {
      const results: Identities | undefined = await fetchAllIdentities()
      if (results) {
        setIdentities(results)
      }
    }
    if (!identities) {
      fetchData()
    }
  }, [identities, setIdentities])

  return null
}
