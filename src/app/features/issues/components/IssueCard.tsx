'use client';

import { useState } from 'react';
import { Box, Paper, Typography, Stack, Button, Chip } from '@mui/material';
import { IssueWithState, IssuePriority } from '@/app/features/issues/types';
import { UI_TEXTS, STATUS_TRANSLATIONS, PRIORITY_LABELS, LABEL_TRANSLATIONS } from '../constants/translations';

interface IssueCardProps {
  issue: IssueWithState;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const firstLine = issue.description?.split('\n')[0] ?? '';
  const truncatedFirstLine = firstLine.length > 150 ? `${firstLine.slice(0, 150)}...` : firstLine;
  const hasMoreContent = (issue.description && issue.description.includes('\n')) || firstLine.length > 150;

  const getPriorityColor = (priority: IssuePriority): string => {
    switch (priority) {
      case IssuePriority.Urgent:
        return '#EF4444'; // Red
      case IssuePriority.High:
        return '#F59E0B'; // Orange
      case IssuePriority.Medium:
        return '#3B82F6'; // Blue
      case IssuePriority.Low:
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        borderRadius: 1,
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={500}>
            {issue.title}
          </Typography>

          {issue.description && (
            <>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {isExpanded ? issue.description : truncatedFirstLine}
              </Typography>
              {hasMoreContent && (
                <Button
                  size="small"
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{ alignSelf: 'flex-start', p: 0 }}
                >
                  {isExpanded ? UI_TEXTS.issues.showLess : UI_TEXTS.issues.showMore}
                </Button>
              )}
            </>
          )}

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {issue.stateName && (
              <Chip
                label={STATUS_TRANSLATIONS[issue.stateName] || issue.stateName}
                size="small"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 500,
                  height: '24px'
                }}
              />
            )}
            
            {issue.priority !== undefined && (
              <Chip
                label={PRIORITY_LABELS[issue.priority]}
                size="small"
                sx={{
                  backgroundColor: `${getPriorityColor(issue.priority)}1A`, 
                  color: getPriorityColor(issue.priority),
                  borderColor: `${getPriorityColor(issue.priority)}40`, 
                  border: '1px solid',
                  fontWeight: 500,
                  height: '24px'
                }}
              />
            )}

            {issue.labels.map(label => (
              <Chip
                key={label.id}
                label={LABEL_TRANSLATIONS[label.name] || label.name}
                size="small"
                sx={{
                  backgroundColor: `${label.color}1A`,
                  color: label.color,
                  borderColor: `${label.color}40`,
                  border: '1px solid',
                  fontWeight: 500,
                  height: '24px'
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
