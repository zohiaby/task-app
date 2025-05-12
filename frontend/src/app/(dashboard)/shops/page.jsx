'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShops } from '../../../hooks/useShops'
import { useLocations } from '../../../hooks/useLocations'
import { formatDate } from '../../../utils/formatDate'
import ShopForm from '../../../components/forms/ShopForm'

// Import Material UI components
import { Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'

// Import specific icons instead of using Icon component
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const ShopsPage = () => {
  const router = useRouter()
  const { getAllShops, deleteShop, updateShop } = useShops()
  const { getAllLocations } = useLocations()
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentShop, setCurrentShop] = useState(null)
  const [formSubmitSuccess, setFormSubmitSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [locationCheckWarning, setLocationCheckWarning] = useState(false)

  const { data: shopsData, isLoading, error, refetch } = getAllShops
  const { data: locationsData, isLoading: isLoadingLocations } = getAllLocations
  const { mutate: deleteShopMutation, isPending: isDeleting } = deleteShop
  const { mutate: updateShopMutation, isPending: isUpdating } = updateShop

  // Ensure shops is always an array
  const shops = Array.isArray(shopsData?.data?.shops)
    ? shopsData.data.shops
    : shopsData?.data && Array.isArray(shopsData.data)
      ? shopsData.data
      : []

  // Get locations from the API response
  const locations = locationsData?.data || []

  // Handle search filter
  const filteredShops = shops.filter(shop => shop.title?.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewShop = shop => {
    router.push(`/shops/${shop.id}`)
  }

  // Handle edit modal
  const handleEditShop = shop => {
    // Check if locations exist
    if (locations.length === 0) {
      setLocationCheckWarning(true)
      return
    }

    setCurrentShop({
      id: shop.id,
      title: shop.title || '',
      type: shop.type || '',
      address: shop.address || '',
      contactNumber: shop.contactNumber || '',
      description: shop.description || '',
      latitude: shop.latitude || 0,
      longitude: shop.longitude || 0,
      status: shop.status || 'active',
      locationIds: shop.locations ? shop.locations.map(loc => loc.id.toString()) : []
    })
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setCurrentShop(null)
    setFormSubmitSuccess(false)
  }

  const handleSubmitEditForm = async data => {
    if (!currentShop) return

    try {
      await updateShopMutation(
        {
          id: currentShop.id,
          data: data
        },
        {
          onSuccess: () => {
            refetch()
            setFormSubmitSuccess(true)
            // Close form after successful submission
            setTimeout(() => {
              setIsEditModalOpen(false)
              setCurrentShop(null)
              setFormSubmitSuccess(false)
            }, 1500)
          }
        }
      )
    } catch (error) {
      console.error('Error updating shop:', error)
    }
  }

  const handleDeleteConfirm = shop => {
    setConfirmDelete({ open: true, id: shop.id })
  }

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, id: null })
  }

  const handleDeleteShop = () => {
    if (confirmDelete.id) {
      deleteShopMutation(confirmDelete.id, {
        onSuccess: () => {
          refetch()
          setConfirmDelete({ open: false, id: null })
        },
        onError: error => {
          console.error('Error deleting shop:', error)
          setConfirmDelete({ open: false, id: null })
        }
      })
    }
  }

  const handleCloseLocationWarning = () => {
    setLocationCheckWarning(false)
  }

  const handleAddLocation = () => {
    router.push('/locations')
    setLocationCheckWarning(false)
  }

  return (
    <div className='grid grid-cols-1 gap-6'>
      <Card elevation={3} className='min-h-[600px]'>
        <CardContent className='p-6 md:p-8'>
          <div className='flex flex-wrap justify-between items-center mb-8'>
            <Typography variant='h5' component='h1' className='text-2xl font-bold mb-4 md:mb-0'>
              Shops Management
            </Typography>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                // Check if locations exist before allowing to create a shop
                if (locations.length === 0) {
                  setLocationCheckWarning(true)
                } else {
                  router.push('/shops/create')
                }
              }}
              startIcon={<AddIcon />}
              size='medium'
            >
              Add New Shop
            </Button>
          </div>

          {/* Search Field */}
          <Box className='mb-8'>
            <Typography variant='subtitle1' className='mb-2 font-medium'>
              Search
            </Typography>
            <TextField
              label='Search by shop name'
              variant='outlined'
              fullWidth
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='bg-white'
              size='medium'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position='end'>
                    <IconButton aria-label='clear search' onClick={() => setSearchTerm('')} edge='end' size='small'>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <CircularProgress />
              <Typography variant='body1' className='ml-2'>
                Loading shops...
              </Typography>
            </div>
          ) : error ? (
            <Alert severity='error' className='mb-6'>
              Failed to load shops.
              <Button color='inherit' size='small' onClick={() => refetch()}>
                Retry
              </Button>
            </Alert>
          ) : filteredShops.length === 0 ? (
            <Alert severity='info'>No shops found. Please add a new shop or adjust your search criteria.</Alert>
          ) : (
            <Paper className='w-full overflow-hidden' elevation={2}>
              <TableContainer>
                <Table stickyHeader aria-label='shops table'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Shop Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Created Date</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredShops.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(shop => (
                      <TableRow hover key={shop.id}>
                        <TableCell>{shop.title}</TableCell>
                        <TableCell>{shop.address}</TableCell>
                        <TableCell>{shop.contactNumber}</TableCell>
                        <TableCell>{formatDate(shop.created_at)}</TableCell>
                        <TableCell align='right'>
                          <div className='flex justify-end space-x-2'>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => handleViewShop(shop)}
                              aria-label='view'
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='info'
                              onClick={() => handleEditShop(shop)}
                              aria-label='edit'
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteConfirm(shop)}
                              aria-label='delete'
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component='div'
                count={filteredShops.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Edit Shop Dialog */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} fullWidth maxWidth='md'>
        <DialogTitle>
          <div className='flex justify-between items-center'>
            <Typography variant='h6'>Edit Shop</Typography>
            <IconButton onClick={handleCloseEditModal} edge='end'>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {formSubmitSuccess && (
            <Alert severity='success' sx={{ mb: 3 }}>
              Shop updated successfully!
            </Alert>
          )}
          {!formSubmitSuccess && currentShop && (
            <ShopForm
              initialData={currentShop}
              onSubmit={handleSubmitEditForm}
              onCancel={handleCloseEditModal}
              isSubmitting={isUpdating}
              error={null}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Location Check Warning Dialog */}
      <Dialog open={locationCheckWarning} onClose={handleCloseLocationWarning}>
        <DialogTitle>
          <div className='flex justify-between items-center'>
            <Typography variant='h6'>Location Required</Typography>
            <IconButton onClick={handleCloseLocationWarning} edge='end'>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <Alert severity='warning' sx={{ mb: 3 }}>
            You need to add at least one location before adding a shop.
          </Alert>
          <Typography variant='body1' sx={{ mb: 2 }}>
            Each shop requires at least one location. Please add a location first before proceeding.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant='outlined' onClick={handleCloseLocationWarning} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant='contained' onClick={handleAddLocation} color='primary'>
              Go to Locations
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete.open} onClose={handleDeleteCancel} aria-labelledby='delete-dialog-title'>
        <DialogTitle id='delete-dialog-title'>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this shop? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='primary' disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteShop} color='error' variant='contained' disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ShopsPage
