// React Query hooks for Locations
import { useMutation, useQuery } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import apiClient, { ApiError } from '../lib/apiClient'

// Query keys
export const LOCATION_QUERY_KEYS = {
  all: ['locations'],
  allTypes: ['locationTypes'],
  byType: typeId => ['locations', 'byType', typeId],
  details: id => ['locations', id]
}

// Hooks for location operations
export function useLocations() {
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

  // Get all locations (new function)
  const getAllLocations = useQuery({
    queryKey: LOCATION_QUERY_KEYS.all,
    queryFn: () => apiClient.locations.getAll(),
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })

  // Get all location types
  const getLocationTypes = useQuery({
    queryKey: LOCATION_QUERY_KEYS.allTypes,
    queryFn: () => apiClient.locations.getTypes(),
    retry: false, // Disable retries for this query
    retryOnMount: false, // Don't retry when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false // Don't refetch when reconnecting
  })

  // Get locations by type
  const getLocationsByType = typeId =>
    useQuery({
      queryKey: LOCATION_QUERY_KEYS.byType(typeId),
      queryFn: () => apiClient.locations.getByType(typeId),
      enabled: !!typeId,
      retry: false, // Disable retries for this query
      retryOnMount: false, // Don't retry when component mounts
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: false // Don't refetch when reconnecting
    })

  // Get location by ID
  const getLocationById = id =>
    useQuery({
      queryKey: LOCATION_QUERY_KEYS.details(id),
      queryFn: () => apiClient.locations.getById(id),
      enabled: !!id,
      retry: false, // Disable retries for this query
      retryOnMount: false, // Don't retry when component mounts
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: false // Don't refetch when reconnecting
    })

  // Create location type mutation
  const createLocationType = useMutation({
    mutationFn: data => apiClient.locations.createType(data),
    retry: 0, // No retries for mutations
    onSuccess: () => {
      // Show success message
      toast.success('Location type created successfully')
      // Invalidate the location types query to refetch
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.allTypes })
    },
    onError: handleError
  })

  // Update location type mutation
  const updateLocationType = useMutation({
    mutationFn: ({ id, data }) => apiClient.locations.updateType(id, data),
    retry: 0, // No retries for mutations
    onSuccess: () => {
      // Show success message
      toast.success('Location type updated successfully')
      // Invalidate the location types query to refetch
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.allTypes })
    },
    onError: handleError
  })

  // Create location mutation
  const createLocation = useMutation({
    mutationFn: data => apiClient.locations.create(data),
    retry: 0, // No retries for mutations
    onSuccess: (_, variables) => {
      // Show success message
      toast.success('Location created successfully')
      // Invalidate all location queries to refetch
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.all })
      // Also invalidate locations by type
      if (variables.typeId) {
        queryClient.invalidateQueries({
          queryKey: LOCATION_QUERY_KEYS.byType(variables.typeId)
        })
      }
    },
    onError: handleError
  })

  // Update location mutation
  const updateLocation = useMutation({
    mutationFn: ({ id, data }) => apiClient.locations.update(id, data),
    retry: 0, // No retries for mutations
    onSuccess: (_, variables) => {
      // Show success message
      toast.success('Location updated successfully')
      // Invalidate all location queries
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.all })
      // Invalidate the specific location query
      queryClient.invalidateQueries({
        queryKey: LOCATION_QUERY_KEYS.details(variables.id)
      })
      // Invalidate the locations by type query if typeId is available
      if (variables.data.typeId) {
        queryClient.invalidateQueries({
          queryKey: LOCATION_QUERY_KEYS.byType(variables.data.typeId)
        })
      }
    },
    onError: handleError
  })

  // Delete location mutation
  const deleteLocation = useMutation({
    mutationFn: ({ id, typeId }) => apiClient.locations.delete(id),
    retry: 0, // No retries for mutations
    onSuccess: (_, variables) => {
      // Show success message
      toast.success('Location deleted successfully')
      // Invalidate all location queries
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEYS.all })
      // Invalidate the locations by type query if typeId is available
      if (variables.typeId) {
        queryClient.invalidateQueries({
          queryKey: LOCATION_QUERY_KEYS.byType(variables.typeId)
        })
      }
    },
    onError: handleError
  })

  return {
    getAllLocations,
    getLocationTypes,
    getLocationsByType,
    getLocationById,
    createLocationType,
    updateLocationType,
    createLocation,
    updateLocation,
    deleteLocation
  }
}
