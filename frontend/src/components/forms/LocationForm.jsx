'use client'

import { useState, useEffect } from 'react'
import { useLocations } from '@/hooks/useLocations'

// MUI Components
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'

const LocationForm = ({ initialData = null, onSubmit, onCancel }) => {
  const { getLocationTypes } = useLocations()
  const { data: locationTypesResponse, isLoading: typesLoading, error: typesError } = getLocationTypes

  // Extract the actual array of location types from the response
  const locationTypes = locationTypesResponse?.data || []

  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: initialData?.type || '',
    typeId: initialData?.typeId || '',
    address: initialData?.address || '',
    contactNumber: initialData?.contactNumber || '',
    description: initialData?.description || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || ''
  })

  // Field validation
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title) newErrors.title = 'Title is required'
    if (!formData.type && !formData.typeId) newErrors.type = 'Type is required'
    if (!formData.latitude) newErrors.latitude = 'Latitude is required'
    if (!formData.longitude) newErrors.longitude = 'Longitude is required'

    // Validate latitude and longitude format
    const latRegex = /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/
    const lngRegex = /^-?((1[0-7][0-9]|[1-9]?[0-9])(\.[0-9]+)?|180(\.0+)?)$/

    if (formData.latitude && !latRegex.test(formData.latitude)) {
      newErrors.latitude = 'Invalid latitude format (must be between -90 and 90)'
    }

    if (formData.longitude && !lngRegex.test(formData.longitude)) {
      newErrors.longitude = 'Invalid longitude format (must be between -180 and 180)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form changes
  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault()

    if (validateForm()) {
      // Get the type name for the selected typeId
      const selectedType = locationTypes.find(t => t.id === formData.typeId)

      // Prepare data for API with the exact field names expected by the backend
      const submitData = {
        name: formData.title, // Map 'title' to 'name' for the backend
        typeId: formData.typeId,
        type: selectedType?.name || formData.type || '',
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        address: formData.address || '',
        contactNumber: formData.contactNumber || '',
        description: formData.description || ''
      }

      onSubmit(submitData)
    }
  }

  return (
    <Card>
      <CardHeader title={initialData ? 'Edit Location' : 'Add New Location'} />
      <CardContent>
        {typesError && (
          <Alert severity='error' sx={{ mb: 3 }}>
            Failed to load location types. Please try again.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Location Title'
                name='title'
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel id='location-type-label'>Location Type</InputLabel>
                <Select
                  labelId='location-type-label'
                  name='typeId'
                  value={formData.typeId}
                  onChange={handleChange}
                  label='Location Type'
                  required
                  disabled={typesLoading}
                >
                  {typesLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : (
                    locationTypes?.map(type => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Address'
                name='address'
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Contact Number'
                name='contactNumber'
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Description'
                name='description'
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant='subtitle1' gutterBottom>
                Location Coordinates
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Latitude'
                name='latitude'
                value={formData.latitude}
                onChange={handleChange}
                error={!!errors.latitude}
                helperText={errors.latitude || 'Enter latitude (e.g., 24.8607)'}
                required
                InputProps={{
                  endAdornment: <InputAdornment position='end'>°N/S</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Longitude'
                name='longitude'
                value={formData.longitude}
                onChange={handleChange}
                error={!!errors.longitude}
                helperText={errors.longitude || 'Enter longitude (e.g., 67.0011)'}
                required
                InputProps={{
                  endAdornment: <InputAdornment position='end'>°E/W</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  p: 2,
                  fontSize: '0.875rem',
                  color: 'text.secondary'
                }}
              >
                <Typography variant='body2' sx={{ mb: 1 }}>
                  <strong>Note:</strong> Enter coordinates in decimal degrees format.
                </Typography>
                <Typography variant='body2'>
                  Example: Karachi, Pakistan is at latitude 24.8607° N, longitude 67.0011° E
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant='outlined' onClick={onCancel}>
                Cancel
              </Button>
              <Button type='submit' variant='contained'>
                {initialData ? 'Update' : 'Create'} Location
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default LocationForm
