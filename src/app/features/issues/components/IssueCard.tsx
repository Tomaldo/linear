'use client';

import { useState, Suspense } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Stack, 
  Button, 
  Chip, 
  styled, 
  Skeleton,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { IssueWithState, IssuePriority } from '@/app/features/issues/types';
import { UI_TEXTS, STATUS_TRANSLATIONS, PRIORITY_LABELS, LABEL_TRANSLATIONS } from '../constants/translations';
import { getPriorityColor, getStatusColor } from '../utils/colors';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { getLinearClient } from '@/app/utils/linear-client';
import { LinearClient } from '@linear/sdk';

interface StyledChipProps {
  bgColor: string;
}

const StyledChip = styled(Chip)<StyledChipProps>(({ theme, bgColor }) => ({
  backgroundColor: `${bgColor}15`,
  color: bgColor,
  borderColor: `${bgColor}30`,
  border: 1,
  fontWeight: 500,
  height: '24px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: `${bgColor}25`,
  }
}));

interface IssueCardProps {
  issue: IssueWithState;
  isLoading?: boolean;
  onStatusChange?: (issueId: string, newStatusId: string) => Promise<void>;
  availableStatuses?: Array<{ id: string; name: string }>;
}

const IssueCardSkeleton = () => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack spacing={1}>
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton variant="text" width="90%" height={20} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={60} height={24} />
      </Stack>
    </Stack>
  </Paper>
);

export function IssueCard({ issue, isLoading, onStatusChange, availableStatuses }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const firstLine = issue?.description?.split('\n')[0] ?? '';
  const truncatedFirstLine = firstLine.length > 150 ? `${firstLine.slice(0, 150)}...` : firstLine;
  const hasMoreContent = (issue?.description && issue.description.includes('\n')) || firstLine.length > 150;

  const handleStatusClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  const handleStatusChange = async (newStatusId: string) => {
    if (onStatusChange) {
      setIsStatusUpdating(true);
      try {
        await onStatusChange(issue.id, newStatusId);
      } finally {
        setIsStatusUpdating(false);
        handleStatusClose();
      }
    }
  };

  if (isLoading) {
    return <IssueCardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<IssueCardSkeleton />}>
        <Paper 
          variant="outlined" 
          sx={{ 
            borderRadius: 1,
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
          role="article"
          aria-label={`Issue: ${issue.title}`}
        >
          <Box sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={500} component="h3">
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
                      aria-expanded={isExpanded}
                      aria-controls={`issue-description-${issue.id}`}
                    >
                      {isExpanded ? UI_TEXTS.issues.showLess : UI_TEXTS.issues.showMore}
                    </Button>
                  )}
                </>
              )}

              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ flexWrap: 'wrap', gap: 1 }}
                role="group"
                aria-label="Issue metadata"
              >
                {issue.stateName && (
                  <>
                    <StyledChip
                      label={
                        isStatusUpdating ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} />
                            {STATUS_TRANSLATIONS[issue.stateName] || issue.stateName}
                          </Box>
                        ) : (
                          STATUS_TRANSLATIONS[issue.stateName] || issue.stateName
                        )
                      }
                      size="small"
                      bgColor={getStatusColor(issue.stateName)}
                      aria-label={`Status: ${STATUS_TRANSLATIONS[issue.stateName] || issue.stateName}`}
                      onClick={handleStatusClick}
                      aria-haspopup="true"
                      aria-expanded={Boolean(statusAnchorEl)}
                    />
                    <Menu
                      anchorEl={statusAnchorEl}
                      open={Boolean(statusAnchorEl)}
                      onClose={handleStatusClose}
                    >
                      {availableStatuses?.map((status) => (
                        <MenuItem
                          key={status.id}
                          onClick={() => handleStatusChange(status.id)}
                          selected={status.name === issue.stateName}
                        >
                          <StyledChip
                            label={STATUS_TRANSLATIONS[status.name] || status.name}
                            size="small"
                            bgColor={getStatusColor(status.name)}
                          />
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
                
                {issue.priority !== undefined && (
                  <StyledChip
                    label={PRIORITY_LABELS[issue.priority]}
                    size="small"
                    bgColor={getPriorityColor(issue.priority)}
                    aria-label={`Priority: ${PRIORITY_LABELS[issue.priority]}`}
                  />
                )}

                {issue.labels.map(label => (
                  <StyledChip
                    key={label.id}
                    label={LABEL_TRANSLATIONS[label.name] || label.name}
                    size="small"
                    bgColor={label.color}
                    aria-label={`Label: ${LABEL_TRANSLATIONS[label.name] || label.name}`}
                  />
                ))}
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Suspense>
    </ErrorBoundary>
  );
}
