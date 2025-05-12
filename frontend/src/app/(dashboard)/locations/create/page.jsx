'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocations } from '../../../../hooks/useLocations'

// Import Materioo components
import { Card, CardContent, CardHeader, Typography, Button, Grid, TextField, MenuItem } from '@mui/material'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'

const CreateLocationPage = () => {
  const router = useRouter()
  const { getLocationTypes, createLocation } = useLocations()

  // Get all location types
  const { data: locationTypesData, isLoading: isLoadingTypes, error: typesError } = getLocationTypes

  const locationTypes = locationTypesData?.data || []

  // Create location mutation
  const { mutate: createLocationMutation, isPending: isSubmitting, isError, error } = createLocation

  const [locationData, setLocationData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    typeId: '',
    description: ''
  })

  const [validationErrors, setValidationErrors] = useState({})

  const validateForm = () => {
    const errors = {}

    if (!locationData.name.trim()) {
      errors.name = 'Location name is required'
    } else if (locationData.name.length < 3) {
      errors.name = 'Location name must be at least 3 characters'
    }

    if (!locationData.address.trim()) {
      errors.address = 'Address is required'
    }

    if (!locationData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(locationData.contactNumber)) {
      errors.contactNumber = 'Please enter a valid contact number'
    }

    if (!locationData.typeId) {
      errors.typeId = 'Location type is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setLocationData(prev => ({ ...prev, [name]: value }))

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

    createLocationMutation(locationData, {
      onSuccess: () => {
        router.push('/locations')
      }
    })
  }

  // Show loading or error if location types couldn't be loaded
  if (isLoadingTypes) {
    return (
      <div className='flex justify-center items-center p-12'>
        <CircularProgress />
        <Typography variant='body1' className='ml-4'>
          Loading location types...
        </Typography>
      </div>
    )
  }

  if (typesError) {
    return (
      <div className='p-6'>
        <Alert severity='error'>{typesError.message || 'Failed to load location types'}</Alert>
        <Button variant='contained' color='primary' className='mt-4' onClick={() => router.push('/locations')}>
          Back to Locations
        </Button>
      </div>
    )
  }

  // Show message if no location types exist
  if (locationTypes.length === 0) {
    return (
      <div className='p-6'>
        <Alert severity='warning'>No location types found. Please create a location type first.</Alert>
        <Button variant='contained' color='primary' className='mt-4' onClick={() => router.push('/locations')}>
          Back to Locations
        </Button>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6'>
      <div className='flex items-center mb-6'>
        <Button variant='text' startIcon={<ArrowBackIcon />} onClick={() => router.push('/locations')} className='mr-4'>
          Back to Locations
        </Button>
        <Typography variant='h5' component='h1' className='text-2xl font-bold'>
          Create New Location
        </Typography>
      </div>

      <Card elevation={3} className='min-h-[600px]'>
        <CardContent className='p-6 md:p-8'>
          {isError && (
            <Alert severity='error' className='mb-8'>
              {error?.message || 'An error occurred while creating the location. Please try again.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Typography variant='h6' component='h2' className='mb-4 font-medium'>
                  Location Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label='Location Name'
                  name='name'
                  value={locationData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  disabled={isSubmitting}
                  size='medium'
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label='Contact Number'
                  name='contactNumber'
                  value={locationData.contactNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.contactNumber}
                  helperText={validationErrors.contactNumber}
                  disabled={isSubmitting}
                  size='medium'
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label='Address'
                  name='address'
                  value={locationData.address}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.address}
                  helperText={validationErrors.address}
                  disabled={isSubmitting}
                  size='medium'
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label='Location Type'
                  name='typeId'
                  value={locationData.typeId}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.typeId}
                  helperText={validationErrors.typeId}
                  disabled={isSubmitting}
                  size='medium'
                >
                  <MenuItem value=''>
                    <em>Select a location type</em>
                  </MenuItem>
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
                  value={locationData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isSubmitting}
                  size='medium'
                />
              </Grid>

              <Grid item xs={12} className='flex justify-end mt-6'>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={() => router.push('/locations')}
                  className='mr-4'
                  disabled={isSubmitting}
                  size='large'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  startIcon={isSubmitting ? <CircularProgress size={20} color='inherit' /> : <SaveIcon />}
                  disabled={isSubmitting}
                  size='large'
                >
                  {isSubmitting ? 'Creating...' : 'Create Location'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateLocationPage
