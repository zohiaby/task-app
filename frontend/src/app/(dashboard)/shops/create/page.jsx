'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShops } from '../../../../hooks/useShops'
import { useLocations } from '../../../../hooks/useLocations'

// Import Materioo components
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormHelperText,
  FormControl
} from '@mui/material'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'

const SHOP_TYPES = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'other', label: 'Other' }
]

const CreateShopPage = () => {
  const router = useRouter()
  const { createShop } = useShops()
  const { mutate: createShopMutation, isPending: isSubmitting, isError, error } = createShop
  const { getAllLocations } = useLocations()
  const { data: locationsData, isLoading: isLoadingLocations } = getAllLocations

  const [shopData, setShopData] = useState({
    title: '', // Changed from name to title as required by backend
    type: '', // Required by backend
    address: '',
    contactNumber: '',
    description: '',
    latitude: 0, // Required by backend
    longitude: 0, // Required by backend
    locationIds: [] // For assigning locations
  })

  const [validationErrors, setValidationErrors] = useState({})

  // Prepare locations for dropdown
  const locations = locationsData?.data || []

  const validateForm = () => {
    const errors = {}

    if (!shopData.title.trim()) {
      errors.title = 'Shop name is required'
    } else if (shopData.title.length < 3) {
      errors.title = 'Shop name must be at least 3 characters'
    }

    if (!shopData.type) {
      errors.type = 'Shop type is required'
    }

    if (!shopData.address.trim()) {
      errors.address = 'Address is required'
    }

    if (!shopData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(shopData.contactNumber)) {
      errors.contactNumber = 'Please enter a valid contact number'
    }

    // Basic validation for coordinates
    if (isNaN(shopData.latitude) || shopData.latitude < -90 || shopData.latitude > 90) {
      errors.latitude = 'Please enter a valid latitude (-90 to 90)'
    }

    if (isNaN(shopData.longitude) || shopData.longitude < -180 || shopData.longitude > 180) {
      errors.longitude = 'Please enter a valid longitude (-180 to 180)'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setShopData(prev => ({ ...prev, [name]: value }))

    // Clear validation error when the user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleLocationChange = event => {
    const { value } = event.target
    setShopData(prev => ({ ...prev, locationIds: typeof value === 'string' ? value.split(',') : value }))
  }

  const handleNumberInputChange = e => {
    const { name, value } = e.target
    setShopData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))

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

    // Backend expects locationIds as numbers
    const formattedData = {
      ...shopData,
      locationIds: shopData.locationIds.map(id => parseInt(id, 10))
    }

    createShopMutation(formattedData, {
      onSuccess: () => {
        router.push('/shops')
      }
    })
  }

  return (
    <div className='grid grid-cols-1 gap-6'>
      <div className='flex items-center mb-4'>
        <Button variant='text' startIcon={<ArrowBackIcon />} onClick={() => router.push('/shops')} className='mr-4'>
          Back to Shops
        </Button>
        <Typography variant='h5' component='h1' className='text-2xl font-bold'>
          Create New Shop
        </Typography>
      </div>

      <Card>
        <CardContent className='p-6'>
          {isError && (
            <Alert severity='error' className='mb-6'>
              {error?.message || 'An error occurred while creating the shop. Please try again.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Shop Name'
                  name='title'
                  value={shopData.title}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.title}
                  helperText={validationErrors.title}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.type}>
                  <InputLabel id='shop-type-label'>Shop Type</InputLabel>
                  <Select
                    labelId='shop-type-label'
                    id='shop-type'
                    name='type'
                    value={shopData.type}
                    label='Shop Type'
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    {SHOP_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.type && <FormHelperText>{validationErrors.type}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label='Contact Number'
                  name='contactNumber'
                  value={shopData.contactNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.contactNumber}
                  helperText={validationErrors.contactNumber}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id='locations-label'>Assign Locations</InputLabel>
                  <Select
                    labelId='locations-label'
                    id='locations'
                    multiple
                    value={shopData.locationIds}
                    onChange={handleLocationChange}
                    label='Assign Locations'
                    disabled={isSubmitting || isLoadingLocations}
                    renderValue={selected => {
                      const selectedLocations = locations
                        .filter(location => selected.includes(location.id.toString()))
                        .map(location => location.name)
                      return selectedLocations.join(', ')
                    }}
                  >
                    {isLoadingLocations ? (
                      <MenuItem disabled>Loading locations...</MenuItem>
                    ) : locations.length === 0 ? (
                      <MenuItem disabled>No locations available</MenuItem>
                    ) : (
                      locations.map(location => (
                        <MenuItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label='Address'
                  name='address'
                  value={shopData.address}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.address}
                  helperText={validationErrors.address}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label='Latitude'
                  name='latitude'
                  type='number'
                  inputProps={{ step: 'any' }}
                  value={shopData.latitude}
                  onChange={handleNumberInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.latitude}
                  helperText={validationErrors.latitude}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label='Longitude'
                  name='longitude'
                  type='number'
                  inputProps={{ step: 'any' }}
                  value={shopData.longitude}
                  onChange={handleNumberInputChange}
                  fullWidth
                  required
                  error={!!validationErrors.longitude}
                  helperText={validationErrors.longitude}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label='Description'
                  name='description'
                  value={shopData.description}
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
                  onClick={() => router.push('/shops')}
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
                  {isSubmitting ? 'Creating...' : 'Create Shop'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateShopPage
