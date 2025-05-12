'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Client component to provide React Query functionality
export function ReactQueryProvider({ children }) {
  // Create a new QueryClient instance for each component lifecycle
  // This prevents sharing client state between different users and requests
  const [queryClient] = useState(() => new QueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
