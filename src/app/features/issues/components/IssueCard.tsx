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
  CircularProgress,
  useTheme,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { IssueWithState, IssuePriority } from '@/app/features/issues/types';
import { UI_TEXTS, STATUS_TRANSLATIONS, PRIORITY_LABELS, LABEL_TRANSLATIONS } from '../constants/translations';
import { getPriorityColor, getStatusColor } from '../utils/colors';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { getLinearClient } from '@/app/utils/linear-client';
import { LinearClient } from '@linear/sdk';
import { EditIssueForm } from './EditIssueForm';

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
  onPriorityChange?: (issueId: string, newPriority: number) => Promise<void>;
  onLabelToggle?: (issueId: string, labelId: string, isAdding: boolean) => Promise<void>;
  onEdit?: (issueId: string, title: string, description: string) => Promise<void>;
  availableStatuses?: Array<{ id: string; name: string }>;
  availableLabels?: Array<{ id: string; name: string; color: string }>;
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

export function IssueCard({ 
  issue, 
  isLoading, 
  onStatusChange, 
  onPriorityChange, 
  onLabelToggle,
  onEdit,
  availableStatuses,
  availableLabels 
}: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState<null | HTMLElement>(null);
  const [labelAnchorEl, setLabelAnchorEl] = useState<null | HTMLElement>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isPriorityUpdating, setIsPriorityUpdating] = useState(false);
  const [updatingLabelIds, setUpdatingLabelIds] = useState<Set<string>>(new Set());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const theme = useTheme();
  const firstLine = issue?.description?.split('\n')[0] ?? '';
  const truncatedFirstLine = firstLine.length > 150 ? `${firstLine.slice(0, 150)}...` : firstLine;
  const hasMoreContent = (issue?.description && issue.description.includes('\n')) || firstLine.length > 150;

  const handleStatusClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  const handlePriorityClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setPriorityAnchorEl(event.currentTarget);
  };

  const handlePriorityClose = () => {
    setPriorityAnchorEl(null);
  };

  const handleLabelClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setLabelAnchorEl(event.currentTarget);
  };

  const handleLabelClose = () => {
    setLabelAnchorEl(null);
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

  const handlePriorityChange = async (newPriority: number) => {
    if (onPriorityChange) {
      setIsPriorityUpdating(true);
      try {
        await onPriorityChange(issue.id, newPriority);
      } finally {
        setIsPriorityUpdating(false);
        handlePriorityClose();
      }
    }
  };

  const handleLabelToggle = async (labelId: string) => {
    if (onLabelToggle) {
      const isCurrentlyApplied = issue.labels.some(label => label.id === labelId);
      setUpdatingLabelIds(prev => {
        const next = new Set(prev);
        next.add(labelId);
        return next;
      });
      try {
        await onLabelToggle(issue.id, labelId, !isCurrentlyApplied);
      } finally {
        setUpdatingLabelIds(prev => {
          const next = new Set(prev);
          next.delete(labelId);
          return next;
        });
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
          elevation={1} 
          sx={{ 
            p: 2,
            '&:hover': {
              boxShadow: 3,
              bgcolor: 'action.hover'
            },
            transition: theme.transitions.create(['box-shadow', 'background-color'], {
              duration: theme.transitions.duration.short
            })
          }}
          role="article"
          aria-label={`Issue: ${issue.title}`}
        >
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  sx={{ 
                    fontSize: '1rem',
                    fontWeight: 500,
                    wordBreak: 'break-word',
                    flex: 1
                  }}
                >
                  {issue.title}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setIsEditDialogOpen(true)}
                  aria-label="Edit issue"
                  sx={{ 
                    ml: 1,
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Stack>

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
                  <>
                    <StyledChip
                      label={
                        isPriorityUpdating ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} />
                            {PRIORITY_LABELS[issue.priority]}
                          </Box>
                        ) : (
                          PRIORITY_LABELS[issue.priority]
                        )
                      }
                      size="small"
                      bgColor={getPriorityColor(issue.priority)}
                      aria-label={`Priority: ${PRIORITY_LABELS[issue.priority]}`}
                      onClick={handlePriorityClick}
                      aria-haspopup="true"
                      aria-expanded={Boolean(priorityAnchorEl)}
                    />
                    <Menu
                      anchorEl={priorityAnchorEl}
                      open={Boolean(priorityAnchorEl)}
                      onClose={handlePriorityClose}
                    >
                      {Object.entries(PRIORITY_LABELS).map(([priority, label]) => (
                        <MenuItem
                          key={priority}
                          onClick={() => handlePriorityChange(Number(priority))}
                          selected={Number(priority) === issue.priority}
                        >
                          <StyledChip
                            label={label}
                            size="small"
                            bgColor={getPriorityColor(Number(priority) as IssuePriority)}
                          />
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}

                <Box>
                  <StyledChip
                    label="+"
                    size="small"
                    bgColor={theme.palette.grey[500]}
                    onClick={handleLabelClick}
                    aria-haspopup="true"
                    aria-expanded={Boolean(labelAnchorEl)}
                    aria-label="Add or remove labels"
                  />
                  <Menu
                    anchorEl={labelAnchorEl}
                    open={Boolean(labelAnchorEl)}
                    onClose={handleLabelClose}
                  >
                    {availableLabels?.map((label) => {
                      const isApplied = issue.labels.some(l => l.id === label.id);
                      const isUpdating = updatingLabelIds.has(label.id);
                      return (
                        <MenuItem
                          key={label.id}
                          onClick={() => handleLabelToggle(label.id)}
                          selected={isApplied}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {isUpdating && <CircularProgress size={16} />}
                            <StyledChip
                              label={LABEL_TRANSLATIONS[label.name] || label.name}
                              size="small"
                              bgColor={label.color}
                            />
                          </Stack>
                        </MenuItem>
                      );
                    })}
                  </Menu>
                </Box>

                {issue.labels.map(label => (
                  <StyledChip
                    key={label.id}
                    label={
                      updatingLabelIds.has(label.id) ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          {LABEL_TRANSLATIONS[label.name] || label.name}
                        </Box>
                      ) : (
                        LABEL_TRANSLATIONS[label.name] || label.name
                      )
                    }
                    size="small"
                    bgColor={label.color}
                    aria-label={`Label: ${LABEL_TRANSLATIONS[label.name] || label.name}`}
                    onDelete={() => handleLabelToggle(label.id)}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
          <EditIssueForm 
            issue={issue}
            open={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSubmit={onEdit || (() => Promise.resolve())}
          />
        </Paper>
      </Suspense>
    </ErrorBoundary>
  );
}
