// React Query hooks for Shops
import { useMutation, useQuery } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import apiClient, { ApiError } from '../lib/apiClient'

// Query keys
export const SHOP_QUERY_KEYS = {
  all: ['shops'],
  details: id => ['shops', id]
}

// Hooks for shop operations
export function useShops() {
  const queryClient = useQueryClient()

  // Error handler for react-query
  const handleError = error => {
    if (error instanceof ApiError) {
      // Use the error message from our custom error class
      toast.error(error.message)
      return error
    }
    // Generic error handling
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    toast.error(message)
    return new Error(message)
  }

  // Get all shops
  const getAllShops = useQuery({
    queryKey: SHOP_QUERY_KEYS.all,
    queryFn: () => apiClient.shops.getAll(),
    retry: false, // Disable retries for this query
    retryOnMount: false, // Don't retry when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false // Don't refetch when reconnecting
  })

  // Get shop by ID
  const getShopById = id =>
    useQuery({
      queryKey: SHOP_QUERY_KEYS.details(id),
      queryFn: () => apiClient.shops.getById(id),
      enabled: !!id,
      retry: false, // Disable retries for this query
      retryOnMount: false, // Don't retry when component mounts
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: false // Don't refetch when reconnecting
    })

  // Create shop mutation
  const createShop = useMutation({
    mutationFn: shopData => apiClient.shops.create(shopData),
    retry: 0, // No retries for mutations
    onSuccess: () => {
      // Show success message
      toast.success('Shop created successfully')
      // Invalidate the shops list query to refetch
      queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.all })
    },
    onError: handleError
  })

  // Update shop mutation
  const updateShop = useMutation({
    mutationFn: ({ id, data }) => apiClient.shops.update(id, data),
    retry: 0, // No retries for mutations
    onSuccess: (_, variables) => {
      // Show success message
      toast.success('Shop updated successfully')
      // Invalidate both the list and the specific shop query
      queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: SHOP_QUERY_KEYS.details(variables.id)
      })
    },
    onError: handleError
  })

  // Delete shop mutation
  const deleteShop = useMutation({
    mutationFn: id => apiClient.shops.delete(id),
    retry: 0, // No retries for mutations
    onSuccess: () => {
      // Show success message
      toast.success('Shop deleted successfully')
      // Invalidate the shops list query to refetch
      queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.all })
    },
    onError: handleError
  })

  return {
    getAllShops,
    getShopById,
    createShop,
    updateShop,
    deleteShop
  }
}
