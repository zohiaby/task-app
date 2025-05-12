'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useLocations } from '../../../../hooks/useLocations'
import { formatDate } from '../../../../utils/formatDate'

// Import Materioo components
import { Card, CardContent, Typography, Button, Grid, Divider } from '@mui/material'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'

const LocationDetailsPage = ({ params }) => {
  const locationId = params.id
  const router = useRouter()
  const { getLocationById, getLocationTypes } = useLocations()

  // Get location details and location types
  const { data: locationData, isLoading, isError, error } = getLocationById(locationId)
  const { data: locationTypesData } = getLocationTypes

  const location = locationData?.data
  const locationTypes = locationTypesData?.data || []

  // Find the location type name
  const getTypeName = typeId => {
    const typeObject = locationTypes.find(type => type.id === typeId)
    return typeObject ? typeObject.name : 'Unknown'
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-12'>
        <CircularProgress />
        <Typography variant='body1' className='ml-4'>
          Loading location details...
        </Typography>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='p-6'>
        <Alert severity='error'>{error?.message || 'Failed to load location details'}</Alert>
        <Button variant='contained' color='primary' className='mt-4' onClick={() => router.push('/locations')}>
          Back to Locations
        </Button>
      </div>
    )
  }

  if (!location) {
    return (
      <div className='p-6'>
        <Alert severity='warning'>Location not found or has been deleted</Alert>
        <Button variant='contained' color='primary' className='mt-4' onClick={() => router.push('/locations')}>
          Back to Locations
        </Button>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6'>
      <div className='flex flex-wrap items-center justify-between mb-4'>
        <div className='flex items-center'>
          <Button
            variant='text'
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/locations')}
            className='mr-4'
          >
            Back to Locations
          </Button>
          <Typography variant='h5' component='h1' className='text-2xl font-bold'>
            Location Details
          </Typography>
        </div>

        <Button
          variant='contained'
          color='primary'
          startIcon={<EditIcon />}
          onClick={() => router.push(`/locations/${locationId}/edit`)}
          className='mt-2 sm:mt-0'
        >
          Edit Location
        </Button>
      </div>

      <Card>
        <CardContent className='p-6'>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant='h6' className='text-xl font-bold mb-2'>
                {location.name}
              </Typography>
              <Divider className='my-4' />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                Address
              </Typography>
              <Typography variant='body1'>{location.address}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                Contact Number
              </Typography>
              <Typography variant='body1'>{location.contactNumber}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                Location Type
              </Typography>
              <Typography variant='body1'>{getTypeName(location.typeId)}</Typography>
            </Grid>

            {location.description && (
              <Grid item xs={12} className='mt-4'>
                <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                  Description
                </Typography>
                <Typography variant='body1' className='whitespace-pre-line'>
                  {location.description}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider className='my-4' />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                Created At
              </Typography>
              <Typography variant='body1'>{formatDate(location.createdAt)}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                Last Updated
              </Typography>
              <Typography variant='body1'>{formatDate(location.updatedAt)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  )
}

export default LocationDetailsPage
