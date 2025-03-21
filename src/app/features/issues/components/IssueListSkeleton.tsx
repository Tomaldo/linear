'use client';

import { Stack, Paper, Skeleton, Box } from '@mui/material';

export const IssueListSkeleton = () => {
  return (
    <Stack spacing={2}>
      <Skeleton variant="text" width={200} height={32} />
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          {[...Array(3)].map((_, index) => (
            <Box key={index}>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
              <Skeleton 
                variant="rounded" 
                width={80} 
                height={24} 
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};
