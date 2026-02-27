'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Props = {
    name: string
  }

export default function GoogleCalendarButton({ name }: Props) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignIn = async () => {
    signIn('google', {
      callbackUrl: `${window.location.origin}/?sync=true&name=${name}`,
    })
  }

  const handleSync = () => {
    const syncUrl = name ? `/sync?name=${encodeURIComponent(name)}` : '/sync'
    router.replace(syncUrl)
  }

  return (
    <>
      {!session ? (
        <button onClick={handleSignIn} className="bg-blue-500 text-white px-3 py-1 ml-3 rounded">
          Connect Google Calendar
        </button>
      ) : (<>
        <button onClick={() => signOut()} className="bg-red-500 text-white px-3 py-1 ml-3 rounded">
        Sign Out
        </button>
        <button onClick={handleSync} className="bg-blue-500 text-white px-3 py-1 ml-3 rounded">
        Sync Calendar
        </button></>
      )}
    </>
  )
}
