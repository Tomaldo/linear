'use client';

import { Paper, Typography, Stack, Chip } from '@mui/material';
import { Issue } from '@linear/sdk';

interface IssueCardProps {
  issue: Issue;
  state: string;
}

export const IssueCard = ({ issue, state }: IssueCardProps) => {
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2,
        '&:hover': {
          bgcolor: 'action.hover',
          transition: 'background-color 0.2s'
        }
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight="medium">
          {issue.title}
        </Typography>
        {issue.description && (
          <Typography variant="body2" color="text.secondary">
            {issue.description}
          </Typography>
        )}
        <Chip 
          label={state}
          size="small"
          sx={{ 
            alignSelf: 'flex-start',
            bgcolor: state.toLowerCase() === 'completed' ? 'success.light' : 'default'
          }}
        />
      </Stack>
    </Paper>
  );
};
