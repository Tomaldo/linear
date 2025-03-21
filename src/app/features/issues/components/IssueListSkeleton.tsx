'use client';

import { Stack, Paper, Skeleton, Box } from '@mui/material';

export function IssueListSkeleton() {
  return (
    <Stack spacing={2}>
      {[1, 2, 3].map((index) => (
        <Paper
          key={index}
          sx={{
            p: 2,
            '&:hover': {
              boxShadow: (theme) => theme.shadows[3],
              transition: (theme) => theme.transitions.create('box-shadow'),
            }
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="80%" />
            </Box>
            <Skeleton 
              variant="rounded" 
              width={80} 
              height={24} 
              sx={{ ml: 2 }} 
            />
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
