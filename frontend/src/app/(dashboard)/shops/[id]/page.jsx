'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useShops } from '../../../../hooks/useShops'
import { formatDate } from '../../../../utils/formatDate'

// Import Materioo components
import { Card, CardContent, Typography, Button, Grid, Divider } from '@mui/material'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'

const ShopDetailsPage = ({ params }) => {
  const shopId = params.id
  const router = useRouter()
  const { getShopById } = useShops()
  const { data: shopData, isLoading, isError, error } = getShopById(shopId)

  const shop = shopData?.data

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-12'>
        <CircularProgress />
        <Typography variant='body1' className='ml-4'>
          Loading shop details...
        </Typography>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='p-6'>
        <Alert severity='error'>{error?.message || 'Failed to load shop details'}</Alert>
        <Button variant='contained' color='primary' className='mt-4' onClick={() => router.push('/shops')}>
          Back to Shops
        </Button>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className='p-6'>
        <Alert severity='warning'>Shop not found or has been deleted</Alert>
        <Button variant='contained' color='primary' className='mt-4' onClick={() => router.push('/shops')}>
          Back to Shops
        </Button>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6'>
      <div className='flex flex-wrap items-center justify-between mb-4'>
        <div className='flex items-center'>
          <Button variant='text' startIcon={<ArrowBackIcon />} onClick={() => router.push('/shops')} className='mr-4'>
            Back to Shops
          </Button>
          <Typography variant='h5' component='h1' className='text-2xl font-bold'>
            Shop Details
          </Typography>
        </div>

        <Button
          variant='contained'
          color='primary'
          startIcon={<EditIcon />}
          onClick={() => router.push(`/shops/${shopId}/edit`)}
          className='mt-2 sm:mt-0'
        >
          Edit Shop
        </Button>
      </div>

      <Card>
        <CardContent className='p-6'>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant='h6' className='text-xl font-bold mb-2'>
                {shop.name}
              </Typography>
              <Divider className='my-4' />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                Address
              </Typography>
              <Typography variant='body1'>{shop.address}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                Contact Number
              </Typography>
              <Typography variant='body1'>{shop.contactNumber}</Typography>
            </Grid>

            {shop.description && (
              <Grid item xs={12} className='mt-4'>
                <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                  Description
                </Typography>
                <Typography variant='body1' className='whitespace-pre-line'>
                  {shop.description}
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
              <Typography variant='body1'>{formatDate(shop.createdAt)}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='subtitle2' className='text-gray-500 mb-1'>
                Last Updated
              </Typography>
              <Typography variant='body1'>{formatDate(shop.updatedAt)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  )
}

export default ShopDetailsPage
