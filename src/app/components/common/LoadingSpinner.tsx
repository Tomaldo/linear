'use client';

import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  minHeight?: string | number;
}

export const LoadingSpinner = ({ minHeight = '100vh' }: LoadingSpinnerProps) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={minHeight}>
      <CircularProgress />
    </Box>
  );
};
