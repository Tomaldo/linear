'use client';

import { Stack, Paper, Typography, Box } from '@mui/material';
import { Issue } from '@linear/sdk';
import { IssueCard } from '@/app/features/issues/components/IssueCard';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface IssueListProps {
  issues: Array<Issue & { stateName?: string }>;
}

export const IssueList = ({ issues }: IssueListProps) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Issues ({issues.length})</Typography>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          {issues.length === 0 ? (
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
                No issues found in this category
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
          ) : (
            issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
              />
            ))
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};
