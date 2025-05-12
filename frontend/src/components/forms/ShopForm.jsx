'use client'

import React, { useState, useEffect } from 'react'
import { useLocations } from '../../hooks/useLocations'

// Import Material UI components
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Box
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'

const SHOP_TYPES = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'other', label: 'Other' }
]

const ShopForm = ({ initialData = null, onSubmit, onCancel, isSubmitting = false, error = null }) => {
  const { getAllLocations } = useLocations()
  const { data: locationsData, isLoading: isLoadingLocations } = getAllLocations

  // Form state
  const [shopData, setShopData] = useState({
    title: initialData?.title || '',
    type: initialData?.type || '',
    address: initialData?.address || '',
    contactNumber: initialData?.contactNumber || '',
    description: initialData?.description || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    locationIds: initialData?.locationIds || [],
    status: initialData?.status || 'active'
  })

  // Field validation
  const [validationErrors, setValidationErrors] = useState({})

  // Prepare locations for dropdown
  const locations = locationsData?.data || []

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setShopData({
        title: initialData.title || '',
        type: initialData.type || '',
        address: initialData.address || '',
        contactNumber: initialData.contactNumber || '',
        description: initialData.description || '',
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        locationIds: initialData.locationIds || [],
        status: initialData.status || 'active'
      })
    }
  }, [initialData])

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

    onSubmit(formattedData)
  }

  return (
    <Card>
      <CardHeader title={initialData ? 'Edit Shop' : 'Add New Shop'} />
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error?.message || 'An error occurred. Please try again.'}
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

            {initialData && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id='status-label'>Status</InputLabel>
                  <Select
                    labelId='status-label'
                    id='status'
                    name='status'
                    value={shopData.status}
                    label='Status'
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='inactive'>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} className='flex justify-end mt-4'>
              <Button variant='outlined' color='secondary' onClick={onCancel} className='mr-4' disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                startIcon={isSubmitting ? <CircularProgress size={20} color='inherit' /> : <SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? initialData
                    ? 'Updating...'
                    : 'Creating...'
                  : initialData
                    ? 'Update Shop'
                    : 'Create Shop'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ShopForm
