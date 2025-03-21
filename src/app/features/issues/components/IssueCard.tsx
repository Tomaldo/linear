'use client';

import { Paper, Typography, Stack, Chip, Fade } from '@mui/material';
import { Issue } from '@linear/sdk';
import { memo } from 'react';

interface IssueCardProps {
  issue: Issue & { stateName?: string };
}

const IssueCard = memo(({ issue }: IssueCardProps) => {
  const getStateColor = (stateName?: string) => {
    if (!stateName) return undefined;
    
    const lowerState = stateName.toLowerCase();
    if (lowerState.includes('done') || lowerState.includes('completed')) {
      return 'success';
    }
    if (lowerState.includes('in progress') || lowerState.includes('active')) {
      return 'primary';
    }
    if (lowerState.includes('blocked') || lowerState.includes('canceled')) {
      return 'error';
    }
    if (lowerState.includes('backlog') || lowerState.includes('todo')) {
      return 'default';
    }
    return 'default';
  };

  return (
    <Fade in timeout={300}>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2,
          '&:hover': {
            bgcolor: 'action.hover',
            transition: theme => theme.transitions.create('background-color', {
              duration: theme.transitions.duration.shorter
            })
          }
        }}
      >
        <Stack spacing={1.5}>
          <Typography 
            variant="subtitle1" 
            fontWeight="medium"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {issue.title}
          </Typography>
          {issue.description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {issue.description}
            </Typography>
          )}
          {issue.stateName && (
            <Chip 
              label={issue.stateName}
              size="small"
              color={getStateColor(issue.stateName)}
              sx={{ 
                alignSelf: 'flex-start',
                fontWeight: 500,
                minWidth: 80,
                justifyContent: 'center'
              }}
            />
          )}
        </Stack>
      </Paper>
    </Fade>
  );
});

IssueCard.displayName = 'IssueCard';

export { IssueCard };
