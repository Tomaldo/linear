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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="subtitle1" 
            component="h3" 
            sx={{ 
              fontWeight: 500,
              flex: 1,
              mr: 2
            }}
          >
            {issue.title}
          </Typography>

          <Chip
            label={issue.stateName || 'No Status'}
            size="small"
            sx={{
              height: 24,
              backgroundColor: 'action.hover',
              flexShrink: 0
            }}
          />
        </Box>

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
      </CardContent>
    </Card>
  );
}

IssueCard.displayName = 'IssueCard';
