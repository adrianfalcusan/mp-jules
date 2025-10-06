
// STREAMLINED COURSE CREATION BUTTON FOR TEACHER DASHBOARD
// Add this button to replace the old course creation flow:

<Button
  variant='contained'
  size='large'
  startIcon={<VideoLibraryIcon />}
  onClick={() => navigate('/create-course-streamlined')}
  sx={{ mb: 2 }}
>
  Create Course with Video (New!)
</Button>

// This replaces the old multi-step process with a single streamlined flow
