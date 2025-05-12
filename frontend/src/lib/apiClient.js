import axios from 'axios'
import { API } from '../constants/endpoints'

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message, statusCode = null, data = null) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.data = data
  }
}

// Helper to handle API errors
const handleApiError = error => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const errorMessage = error.response.data?.message || 'An error occurred'
    throw new ApiError(errorMessage, error.response.status, error.response.data)
  } else if (error.request) {
    // The request was made but no response was received
    throw new ApiError('No response from server. Please check your connection.')
  } else {
    // Something else happened in setting up the request
    throw new ApiError(error.message || 'An unknown error occurred')
  }
}

// API Client with methods for all endpoints
const apiClient = {
  // Shop API methods
  shops: {
    getAll: async () => {
      try {
        const response = await axiosInstance.get(API.SHOP.GET_ALL)
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    getById: async id => {
      try {
        const response = await axiosInstance.get(API.SHOP.GET_BY_ID(id))
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    create: async data => {
      try {
        const response = await axiosInstance.post(API.SHOP.CREATE, data)
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    update: async (id, data) => {
      try {
        const response = await axiosInstance.put(API.SHOP.UPDATE(id), data)
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    delete: async id => {
      try {
        const response = await axiosInstance.delete(API.SHOP.DELETE(id))
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    }
  },
  // Location API methods
  locations: {
    getTypes: async () => {
      try {
        const response = await axiosInstance.get(API.LOCATION.TYPES)
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    getAll: async () => {
      try {
        const response = await axiosInstance.get(API.LOCATION.GET_ALL)
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    createType: async data => {
      try {
        const response = await axiosInstance.post(API.LOCATION.CREATE_TYPE, data)
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    updateType: async (id, data) => {
      try {
        const response = await axiosInstance.put(API.LOCATION.UPDATE_TYPE(id), data)
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    getByType: async typeId => {
      try {
        const response = await axiosInstance.get(API.LOCATION.GET_BY_TYPE(typeId))
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    getById: async id => {
      try {
        const response = await axiosInstance.get(API.LOCATION.GET_BY_ID(id))
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    create: async data => {
      try {
        const response = await axiosInstance.post(API.LOCATION.CREATE, data)
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    update: async (id, data) => {
      try {
        const response = await axiosInstance.put(API.LOCATION.UPDATE(id), data)
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    },
    delete: async id => {
      try {
        const response = await axiosInstance.delete(API.LOCATION.DELETE(id))
        return response.data
      } catch (error) {
        return handleApiError(error)
      }
    }
  }
}

export default apiClient
