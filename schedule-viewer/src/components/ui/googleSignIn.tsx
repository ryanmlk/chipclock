'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

type Props = {
    name: string
  }

export default function GoogleCalendarButton({ name }: Props) {
  const { data: session } = useSession()

  const handleSignIn = async () => {
    signIn('google', {
      callbackUrl: `${window.location.origin}/?sync=true&name=${name}`,
    })
  }

  return (
    <>
      {!session ? (
        <button onClick={handleSignIn} className="bg-blue-500 text-white px-3 py-1 ml-3 rounded">
          Connect Google Calendar
        </button>
      ) : (
        <button onClick={() => signOut()} className="bg-red-500 text-white px-3 py-1 ml-3 rounded">
        Sign Out
      </button>
      )}
    </>
  )
}
