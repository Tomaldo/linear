'use client';

import { Paper, Typography, Box, Chip } from '@mui/material';
import { IssueWithState } from '@/app/features/issues/types';

interface IssueCardProps {
  issue: IssueWithState;
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Paper 
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
          <Typography variant="h6" gutterBottom>
            {issue.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {issue.description || 'No description provided'}
          </Typography>
        </Box>
        {issue.stateName && (
          <Chip 
            label={issue.stateName}
            size="small"
            sx={{ 
              ml: 2,
              backgroundColor: (theme) => {
                switch (issue.stateName?.toLowerCase()) {
                  case 'todo':
                    return theme.palette.info.light;
                  case 'in progress':
                    return theme.palette.warning.light;
                  case 'done':
                    return theme.palette.success.light;
                  default:
                    return theme.palette.grey[300];
                }
              },
              color: (theme) => theme.palette.getContrastText(theme.palette.info.light),
            }}
          />
        )}
      </Box>
    </Paper>
  );
}

IssueCard.displayName = 'IssueCard';
