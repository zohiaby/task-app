'use client'

import { useState, useEffect } from 'react'
import { useLocations } from '@/hooks/useLocations'
import LocationForm from '@/components/forms/LocationForm'
import { formatDate } from '@/utils/formatDate'

// MUI Components
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'

const LocationsPage = () => {
  const { getAllLocations, createLocation, deleteLocation, updateLocation } = useLocations()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [formSubmitSuccess, setFormSubmitSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, typeId: null })

  const { data: locationsData, isLoading, error, refetch } = getAllLocations
  const { mutate: deleteLocationMutation, isPending: isDeleting } = deleteLocation
  const { mutate: updateLocationMutation, isPending: isUpdating } = updateLocation

  // Get locations from the API response
  const locations = locationsData?.data || []

  // Handle search filter
  const filteredLocations = locations.filter(location =>
    location.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle form open/close
  const handleOpenForm = () => setIsFormOpen(true)
  const handleCloseForm = () => setIsFormOpen(false)

  // Handle edit modal
  const handleOpenEditModal = location => {
    setCurrentLocation({
      id: location.id,
      title: location.name,
      typeId: location.location_type_id,
      type: location.type_name,
      address: location.address || '',
      contactNumber: location.contact_number || '',
      description: location.description || '',
      latitude: location.latitude || '',
      longitude: location.longitude || ''
    })
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setCurrentLocation(null)
  }

  // Pagination handlers
  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Delete handlers
  const handleDeleteConfirm = location => {
    setConfirmDelete({
      open: true,
      id: location.id,
      typeId: location.location_type_id
    })
  }

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, id: null, typeId: null })
  }

  const handleDeleteLocation = () => {
    if (confirmDelete.id) {
      deleteLocationMutation(
        {
          id: confirmDelete.id,
          typeId: confirmDelete.typeId
        },
        {
          onSuccess: () => {
            refetch()
            setConfirmDelete({ open: false, id: null, typeId: null })
          },
          onError: error => {
            console.error('Error deleting location:', error)
            setConfirmDelete({ open: false, id: null, typeId: null })
          }
        }
      )
    }
  }

  // Handle form submission
  const handleSubmit = async data => {
    try {
      await createLocation.mutateAsync(data)
      setFormSubmitSuccess(true)
      // Close form after successful submission
      setTimeout(() => {
        setIsFormOpen(false)
        setFormSubmitSuccess(false)
      }, 1500)
    } catch (error) {
      console.error('Error creating location:', error)
    }
  }

  // Handle edit form submission
  const handleEditSubmit = async data => {
    if (!currentLocation) return

    try {
      await updateLocationMutation(
        {
          id: currentLocation.id,
          data: data
        },
        {
          onSuccess: () => {
            refetch()
            setFormSubmitSuccess(true)
            // Close form after successful submission
            setTimeout(() => {
              setIsEditModalOpen(false)
              setCurrentLocation(null)
              setFormSubmitSuccess(false)
            }, 1500)
          }
        }
      )
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  return (
    <Box sx={{ p: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h5'>Location Management</Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleOpenForm}>
          Add New Location
        </Button>
      </Box>

      {/* Search Field */}
      <Box sx={{ mb: 4 }}>
        <TextField
          label='Search by location name'
          variant='outlined'
          fullWidth
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ bgcolor: 'background.paper' }}
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

      {/* Location Form Dialog */}
      <Dialog open={isFormOpen} onClose={handleCloseForm} fullWidth maxWidth='md'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #eee'
          }}
        >
          <Typography variant='h6'>Add New Location</Typography>
          <IconButton onClick={handleCloseForm} edge='end'>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
          {formSubmitSuccess && (
            <Alert severity='success' sx={{ mb: 3 }}>
              Location created successfully!
            </Alert>
          )}
          {createLocation.isPending && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
          {!formSubmitSuccess && !createLocation.isPending && (
            <LocationForm onSubmit={handleSubmit} onCancel={handleCloseForm} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} fullWidth maxWidth='md'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #eee'
          }}
        >
          <Typography variant='h6'>Edit Location</Typography>
          <IconButton onClick={handleCloseEditModal} edge='end'>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
          {formSubmitSuccess && (
            <Alert severity='success' sx={{ mb: 3 }}>
              Location updated successfully!
            </Alert>
          )}
          {isUpdating && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
          {!formSubmitSuccess && !isUpdating && currentLocation && (
            <LocationForm initialData={currentLocation} onSubmit={handleEditSubmit} onCancel={handleCloseEditModal} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant='h6'>Confirm Delete</Typography>
        </Box>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant='body1' sx={{ mb: 2 }}>
            Are you sure you want to delete this location? This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant='outlined'
              color='inherit'
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button variant='contained' color='error' onClick={handleDeleteLocation} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Locations list */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
              <CircularProgress />
              <Typography variant='body1' sx={{ ml: 2 }}>
                Loading locations...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity='error' sx={{ m: 2 }}>
              Failed to load locations.
              <Button color='inherit' size='small' onClick={() => refetch()} sx={{ ml: 1 }}>
                Retry
              </Button>
            </Alert>
          ) : filteredLocations.length === 0 ? (
            <Alert severity='info' sx={{ m: 2 }}>
              No locations found. Add a new location or adjust your search criteria.
            </Alert>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Location Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Created Date</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLocations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(location => (
                      <TableRow hover key={location.id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.type_name}</TableCell>
                        <TableCell>{formatDate(location.created_at)}</TableCell>
                        <TableCell align='right'>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton
                              color='primary'
                              size='small'
                              sx={{ mr: 1 }}
                              onClick={() => handleOpenEditModal(location)}
                            >
                              <EditIcon fontSize='small' />
                            </IconButton>
                            <IconButton color='error' size='small' onClick={() => handleDeleteConfirm(location)}>
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component='div'
                count={filteredLocations.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default LocationsPage
