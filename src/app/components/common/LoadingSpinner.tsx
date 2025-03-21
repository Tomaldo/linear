'use client';

import { Box, CircularProgress } from '@mui/material';

export const LoadingSpinner = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
};
