'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShops } from '../../../../../hooks/useShops'
import { useLocations } from '../../../../../hooks/useLocations'

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

const EditShopPage = ({ params }) => {
  const shopId = params.id
  const router = useRouter()
  const { getShopById, updateShop } = useShops()
  const { getAllLocations } = useLocations()
  const { data: locationsData, isLoading: isLoadingLocations } = getAllLocations

  const { data: shopData, isLoading: isLoadingShop, isError: isLoadError, error: loadError } = getShopById(shopId)

  const { mutate: updateShopMutation, isPending: isSubmitting, isError: isUpdateError, error: updateError } = updateShop

  const [formData, setFormData] = useState({
    title: '', // Changed from name to title to match backend
    type: '', // Required by backend
    address: '',
    contactNumber: '',
    description: '',
    latitude: 0, // Required by backend
    longitude: 0, // Required by backend
    status: 'active', // Required by backend
    locationIds: [] // For location assignments
  })

  const [validationErrors, setValidationErrors] = useState({})

  // Prepare locations for dropdown
  const locations = locationsData?.data || []

  // Populate form when shop data is loaded
  useEffect(() => {
    if (shopData?.data) {
      const shop = shopData.data
      setFormData({
        title: shop.title || shop.name || '', // Support both title and name depending on backend response
        type: shop.type || '',
        address: shop.address || '',
        contactNumber: shop.contactNumber || '',
        description: shop.description || '',
        latitude: shop.latitude || 0,
        longitude: shop.longitude || 0,
        status: shop.status || 'active',
        locationIds: shop.locations ? shop.locations.map(loc => loc.id.toString()) : []
      })
    }
  }, [shopData])

  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'Shop name is required'
    } else if (formData.title.length < 3) {
      errors.title = 'Shop name must be at least 3 characters'
    }

    if (!formData.type) {
      errors.type = 'Shop type is required'
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required'
    }

    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.contactNumber)) {
      errors.contactNumber = 'Please enter a valid contact number'
    }

    // Basic validation for coordinates
    if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Please enter a valid latitude (-90 to 90)'
    }

    if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Please enter a valid longitude (-180 to 180)'
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

  const handleLocationChange = event => {
    const { value } = event.target
    setFormData(prev => ({ ...prev, locationIds: typeof value === 'string' ? value.split(',') : value }))
  }

  const handleNumberInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))

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
      ...formData,
      locationIds: formData.locationIds.map(id => parseInt(id, 10))
    }

    updateShopMutation(
      {
        id: shopId,
        data: formattedData
      },
      {
        onSuccess: () => {
          router.push(`/shops/${shopId}`)
        }
      }
    )
  }

  if (isLoadingShop) {
    return (
      <div className='flex justify-center items-center p-12'>
        <CircularProgress />
        <Typography variant='body1' className='ml-4'>
          Loading shop data...
        </Typography>
      </div>
    )
  }

  if (isLoadError) {
    return (
      <div className='p-6'>
        <Alert severity='error'>{loadError?.message || 'Failed to load shop details'}</Alert>
        <Button variant='contained' color='primary' className='mt-4' onClick={() => router.push('/shops')}>
          Back to Shops
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
          onClick={() => router.push(`/shops/${shopId}`)}
          className='mr-4'
        >
          Back to Shop Details
        </Button>
        <Typography variant='h5' component='h1' className='text-2xl font-bold'>
          Edit Shop
        </Typography>
      </div>

      <Card>
        <CardContent className='p-6'>
          {isUpdateError && (
            <Alert severity='error' className='mb-6'>
              {updateError?.message || 'An error occurred while updating the shop. Please try again.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Shop Name'
                  name='title'
                  value={formData.title}
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
                    value={formData.type}
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
                  value={formData.contactNumber}
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
                    value={formData.locationIds}
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
                  value={formData.address}
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
                  value={formData.latitude}
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
                  value={formData.longitude}
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
                  onClick={() => router.push(`/shops/${shopId}`)}
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

export default EditShopPage
