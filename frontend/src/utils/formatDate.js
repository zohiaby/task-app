// Utility function to format dates
export const formatDate = dateString => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date'

  // Format the date as "MMM DD, YYYY"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
