'use client';

import { useState } from 'react';
import { Paper, Stack, Typography, Chip, Button } from '@mui/material';
import { IssueWithState, IssuePriority } from '@/app/features/issues/types';
import { PRIORITY_LABELS, UI_TEXTS, STATUS_TRANSLATIONS, LABEL_TRANSLATIONS } from '../constants/translations';

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
      elevation={1}
      sx={{ 
        p: 3,
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {issue.title}
          </Typography>

          {issue.description && (
            <>
              <Typography variant="body2" color="text.secondary">
                {isExpanded ? issue.description : truncatedFirstLine}
              </Typography>
              {hasMoreContent && (
                <Button
                  size="small"
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{ alignSelf: 'flex-start' }}
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
                  fontWeight: 500
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
                  fontWeight: 500
                }}
              />
            )}
          </Stack>

          {issue.labels.length > 0 && (
            <Stack 
              direction="row" 
              spacing={1} 
              sx={{ 
                flexWrap: 'wrap',
                gap: 1
              }}
            >
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
                    fontWeight: 500
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
