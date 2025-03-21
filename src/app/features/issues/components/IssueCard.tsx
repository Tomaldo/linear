'use client';

import { Card, CardContent, Typography, Chip, Stack, Box } from '@mui/material';
import { IssueWithState } from '@/app/features/issues/types';

interface IssueCardProps {
  issue: IssueWithState;
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Card 
      variant="outlined"
      sx={{ 
        '&:hover': {
          boxShadow: 1,
          transition: 'box-shadow 0.2s'
        }
      }}
    >
      <CardContent>
        <Typography 
          variant="subtitle1" 
          component="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 500,
            mb: 1
          }}
        >
          {issue.title}
        </Typography>

        {issue.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {issue.description}
          </Typography>
        )}

        {issue.labels && issue.labels.length > 0 && (
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              mb: 2,
              flexWrap: 'wrap',
              gap: 1,
              minHeight: 24 // Match loading skeleton
            }}
          >
            {issue.labels.map((label) => (
              <Chip
                key={label.id}
                label={label.name}
                size="small"
                sx={{
                  height: 24,
                  backgroundColor: `${label.color}26`, // 15% opacity
                  border: `1px solid ${label.color}4D`, // 30% opacity
                  color: label.color,
                  fontWeight: 500,
                  borderRadius: '12px',
                  maxWidth: 160,
                  '.MuiChip-label': {
                    px: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }}
              />
            ))}
          </Stack>
        )}

        <Box>
          <Chip
            label={issue.stateName || 'No Status'}
            size="small"
            sx={{
              height: 24,
              backgroundColor: 'action.hover'
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

IssueCard.displayName = 'IssueCard';
