'use client';

import { Stack, Box, Typography } from '@mui/material';
import { IssueCard } from './IssueCard';
import { IssueWithState } from '@/app/features/issues/types';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { IssueListSkeleton } from './IssueListSkeleton';

interface IssueListProps {
  issues: IssueWithState[];
  isLoading?: boolean;
}

export function IssueList({ issues, isLoading }: IssueListProps) {
  if (isLoading) {
    return <IssueListSkeleton />;
  }

  if (issues.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        py={4}
      >
        <AssignmentIcon 
          sx={{ 
            fontSize: 48, 
            color: 'text.secondary',
            mb: 2
          }} 
        />
        <Typography 
          color="text.secondary"
          variant="body1"
          align="center"
        >
          No issues found
        </Typography>
        <Typography 
          color="text.secondary"
          variant="body2"
          align="center"
          sx={{ mt: 1 }}
        >
          Issues will appear here once they are created
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </Stack>
  );
}
