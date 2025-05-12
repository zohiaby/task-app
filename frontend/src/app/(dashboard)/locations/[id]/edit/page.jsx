'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocations } from '../../../../../hooks/useLocations'

// Import Materioo components
import { Card, CardContent, Typography, Button, Grid, TextField, MenuItem } from '@mui/material'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'

const EditLocationPage = ({ params }) => {
  const locationId = params.id
  const router = useRouter()
  const { getLocationById, getLocationTypes, updateLocation } = useLocations()

  // Get location details
  const {
    data: locationData,
    isLoading: isLoadingLocation,
    isError: isLoadError,
    error: loadError
  } = getLocationById(locationId)

  // Get location types
  const { data: locationTypesData, isLoading: isLoadingTypes, error: typesError } = getLocationTypes

  // Update location mutation
  const {
    mutate: updateLocationMutation,
    isPending: isSubmitting,
    isError: isUpdateError,
    error: updateError
  } = updateLocation

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    typeId: '',
    description: ''
  })

  const [validationErrors, setValidationErrors] = useState({})

  const locationTypes = locationTypesData?.data || []

  // Populate form when location data is loaded
  useEffect(() => {
    if (locationData?.data) {
      const location = locationData.data
      setFormData({
        name: location.name || '',
        address: location.address || '',
        contactNumber: location.contactNumber || '',
        typeId: location.typeId || '',
        description: location.description || ''
      })
    }
  }, [locationData])

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Location name is required'
    } else if (formData.name.length < 3) {
      errors.name = 'Location name must be at least 3 characters'
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required'
    }

    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.contactNumber)) {
      errors.contactNumber = 'Please enter a valid contact number'
    }

    if (!formData.typeId) {
      errors.typeId = 'Location type is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear validation error when the user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = e => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    updateLocationMutation(
      {
        id: locationId,
        data: formData
      },
      {
        onSuccess: () => {
          router.push(`/locations/${locationId}`)
        }
      }
    )
  }

  // Show loading spinner when fetching data
  if (isLoadingLocation || isLoadingTypes) {
    return (
      <div className='flex justify-center items-center p-12'>
        <CircularProgress />
        <Typography variant='body1' className='ml-4'>
          Loading data...
        </Typography>
      </div>
    )
  }

  // Show error if location details couldn't be loaded
  if (isLoadError) {
    return (
      <div className='p-6'>
        <Alert severity='error'>{loadError?.message || 'Failed to load location details'}</Alert>
        <Button variant='contained' color='primary' className='mt-4' onClick={() => router.push('/locations')}>
          Back to Locations
        </Button>
      </div>
    )
  }

  // Show error if location types couldn't be loaded
  if (typesError) {
    return (
      <div className='p-6'>
        <Alert severity='error'>Failed to load location types. Please try again.</Alert>
        <Button variant='contained' color='primary' className='mt-4' onClick={() => router.push('/locations')}>
          Back to Locations
        </Button>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6'>
      <div className='flex items-center mb-4'>
        <Button
          variant='text'
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/locations/${locationId}`)}
          className='mr-4'
        >
          Back to Location Details
        </Button>
        <Typography variant='h5' component='h1' className='text-2xl font-bold'>
          Edit Location
        </Typography>
      </div>

      <Card>
        <CardContent className='p-6'>
          {isUpdateError && (
            <Alert severity='error' className='mb-6'>
              {updateError?.message || 'An error occurred while updating the location. Please try again.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Location Name'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label='Contact Number'
                  name='contactNumber'
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.contactNumber}
                  helperText={validationErrors.contactNumber}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label='Address'
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.address}
                  helperText={validationErrors.address}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label='Location Type'
                  name='typeId'
                  value={formData.typeId}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.typeId}
                  helperText={validationErrors.typeId}
                  disabled={isSubmitting}
                >
                  {locationTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label='Description'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12} className='flex justify-end mt-4'>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={() => router.push(`/locations/${locationId}`)}
                  className='mr-4'
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  startIcon={isSubmitting ? <CircularProgress size={20} color='inherit' /> : <SaveIcon />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditLocationPage
