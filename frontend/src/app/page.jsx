'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page automatically redirects to the shops page
export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect directly to the shops page
    router.push('/shops')
  }, [router])

  // Return a minimal loading state for the brief moment before redirect
  return (
    <div className='h-screen w-screen flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold mb-4'>Loading SalesFlo Dashboard...</h1>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
      </div>
    </div>
  )
}
