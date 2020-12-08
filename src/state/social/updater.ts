import { useEffect } from 'react'
import { useAllVerifiedHandles, HandleEntry, useAllUncategorizedNames, UncategorizedContentEntry } from './hooks'
import { fetchAllVerifiedHandles } from '../../data/social'

export default function Updater(): null {
  // twitter handles
  const [verifiedHandles, setVerifiedHandles] = useAllVerifiedHandles()

  // non twitter names
  const [uncategorizedNames, setNames] = useAllUncategorizedNames()

  // fetched handles if haven't yet
  useEffect(() => {
    async function fetchData() {
      const results:
        | { [address: string]: { twitter: HandleEntry | undefined; other: UncategorizedContentEntry | undefined } }
        | undefined = await fetchAllVerifiedHandles()
      if (results) {
        // transform to only parse twitter data
        const twitterData: { [key: string]: HandleEntry } = {}
        Object.keys(results)
          .filter(k => !!results[k].twitter)
          .map(k => {
            const data = results[k].twitter
            if (data !== undefined) {
              twitterData[k] = data
            }
            return true
          })
        setVerifiedHandles(twitterData)

        const uncategorizedData: { [key: string]: UncategorizedContentEntry } = {}
        Object.keys(results)
          .filter(k => !!results[k].other)
          .map(k => {
            const data = results[k].other
            if (data !== undefined) {
              uncategorizedData[k] = data
            }
            return true
          })
        setNames(uncategorizedData)
      }
    }

    if (!verifiedHandles) {
      fetchData()
    }
  }, [setVerifiedHandles, verifiedHandles, uncategorizedNames, setNames])
  return null
}
