import { useEffect } from 'react'
import { useAllVerifiedHandles, HandleEntry } from './hooks'
import { fetchAllVerifiedHandles } from '../../data/social'

export default function Updater(): null {
  const [verifiedHandles, setVerifiedHandles] = useAllVerifiedHandles()

  // fetched handles if haven't yet
  useEffect(() => {
    async function fetchData() {
      const results: { [address: string]: HandleEntry } | undefined = await fetchAllVerifiedHandles()
      if (results) {
        setVerifiedHandles(results)
      }
    }
    if (!verifiedHandles) {
      fetchData()
    }
  }, [setVerifiedHandles, verifiedHandles])
  return null
}
