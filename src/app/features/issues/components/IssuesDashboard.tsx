'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Alert, 
  Box, 
  Stack, 
  Typography, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
  Checkbox,
  ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CreateIssueForm } from './CreateIssueForm';
import { IssueCard } from './IssueCard';
import { LinearClient, Team, Issue, WorkflowState, Connection } from '@linear/sdk';
import { IssueWithState, IssuePriority, IssueLabel } from '@/app/features/issues/types';
import { ISSUE_AUTHOR } from '@/app/features/issues/constants';
import { UI_TEXTS, STATUS_TRANSLATIONS, LABEL_TRANSLATIONS } from '../constants/translations';
import { getPriorityColor, getStatusColor } from '../utils/colors';

const PRIORITY_LABELS: { [key in IssuePriority]: string } = {
  [IssuePriority.NoPriority]: UI_TEXTS.issues.priority.noPriority,
  [IssuePriority.Low]: UI_TEXTS.issues.priority.low,
  [IssuePriority.Medium]: UI_TEXTS.issues.priority.medium,
  [IssuePriority.High]: UI_TEXTS.issues.priority.high,
  [IssuePriority.Urgent]: UI_TEXTS.issues.priority.urgent,
};

export function IssuesDashboard() {
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState<IssueWithState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statuses, setStatuses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedStatuses(typeof event.target.value === 'string' ? [event.target.value] : event.target.value);
  };

  const handlePriorityChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedPriorities(typeof event.target.value === 'string' ? [event.target.value] : event.target.value);
  };

  const handleLabelChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedLabels(typeof event.target.value === 'string' ? [event.target.value] : event.target.value);
  };

  const availableLabels = useMemo(() => {
    const labelMap = new Map<string, IssueLabel>();
    issues.forEach(issue => {
      issue.labels.forEach(label => {
        labelMap.set(label.id, label);
      });
    });
    return Array.from(labelMap.values());
  }, [issues]);

  const filteredIssues = useMemo(() => {
    let filtered = [...issues];

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(issue => selectedStatuses.includes(issue.stateId || ''));
    }

    // Filter by priority
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter(issue => 
        selectedPriorities.includes(String(issue.priority))
      );
    }

    // Filter by label
    if (selectedLabels.length > 0) {
      filtered = filtered.filter(issue => 
        issue.labels.some(label => selectedLabels.includes(label.id))
      );
    }

    // Sort by priority (Urgent -> High -> Medium -> Low -> No Priority)
    // In Linear API: Urgent = 1, High = 2, Medium = 3, Low = 4, NoPriority = 0
    return filtered.sort((a, b) => {
      const priorityA = a.priority ?? IssuePriority.NoPriority;
      const priorityB = b.priority ?? IssuePriority.NoPriority;
      
      // Convert to sort order where higher numbers = higher priority
      const getSortOrder = (p: IssuePriority) => {
        if (p === IssuePriority.NoPriority) return -1;
        return 5 - p; // Urgent(1)->4, High(2)->3, Medium(3)->2, Low(4)->1
      };

      return getSortOrder(priorityB) - getSortOrder(priorityA);
    });
  }, [issues, selectedStatuses, selectedPriorities, selectedLabels]);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const teamsResponse = await client.teams();
      const teams = (teamsResponse as Connection<Team>).nodes;
      const team = teams[0];

      if (!team) {
        throw new Error('Team configuration error: No team found in Linear.');
      }

      const statesResponse = await team.states();
      const states = (statesResponse as Connection<WorkflowState>).nodes;
      setStatuses(states.map((state: WorkflowState) => ({ 
        id: state.id, 
        name: state.name 
      })));

      const issuesResponse = await team.issues();
      const issues = (issuesResponse as Connection<Issue>).nodes;
      const issuesWithState = await Promise.all(
        issues.map(async (issue: Issue) => {
          const state = await issue.state;
          const labelsResponse = await issue.labels();
          const labels = labelsResponse.nodes.map(label => ({
            id: label.id,
            name: label.name,
            color: label.color
          }));
          return {
            id: issue.id,
            title: issue.title,
            description: issue.description ?? null,
            stateId: state?.id ?? null,
            stateName: state?.name ?? null,
            labels,
            priority: issue.priority as IssuePriority
          };
        })
      );
      setIssues(issuesWithState);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Failed to fetch issues: ${err.message}`
        : 'Failed to fetch issues. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching issues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIssue = async (data: { title: string; description: string; priority: IssuePriority }) => {
    setError(null);
    setIsLoading(true);
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const teamsResponse = await client.teams();
      const teams = (teamsResponse as Connection<Team>).nodes;
      const team = teams[0];

      if (!team) {
        throw new Error('Team configuration error: No team found in Linear.');
      }

      await client.createIssue({
        teamId: team.id,
        title: `${searchParams.get('author') || ISSUE_AUTHOR} - ${data.title}`,
        description: data.description,
        priority: data.priority
      });

      await fetchIssues();
      handleCloseCreateDialog();
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Failed to create issue: ${err.message}`
        : 'Failed to create issue. Please try again later.';
      setError(errorMessage);
      console.error('Error creating issue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChangeIssue = async (issueId: string, newStatusId: string) => {
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const issue = await client.issue(issueId);
      await issue.update({ stateId: newStatusId });
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(prevIssue => {
          if (prevIssue.id === issueId) {
            const newState = statuses.find(s => s.id === newStatusId);
            return {
              ...prevIssue,
              stateId: newStatusId,
              stateName: newState?.name || prevIssue.stateName
            };
          }
          return prevIssue;
        })
      );
    } catch (error) {
      console.error('Error updating issue status:', error);
      setError('Failed to update issue status. Please try again.');
    }
  };

  const handlePriorityChangeIssue = async (issueId: string, newPriority: number) => {
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const issue = await client.issue(issueId);
      await issue.update({ priority: newPriority });
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(prevIssue => {
          if (prevIssue.id === issueId) {
            return {
              ...prevIssue,
              priority: newPriority
            };
          }
          return prevIssue;
        })
      );
    } catch (error) {
      console.error('Error updating issue priority:', error);
      setError('Failed to update issue priority. Please try again.');
    }
  };

  const handleLabelToggle = async (issueId: string, labelId: string, isAdding: boolean) => {
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const issue = await client.issue(issueId);
      
      // Get current label IDs
      const labelConnection = await issue.labels();
      const currentLabelIds = labelConnection.nodes.map((label: { id: string }) => label.id);
      
      // Update labels based on whether we're adding or removing
      const newLabelIds = isAdding
        ? [...currentLabelIds, labelId]
        : currentLabelIds.filter((id: string) => id !== labelId);
      
      await issue.update({ labelIds: newLabelIds });
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(prevIssue => {
          if (prevIssue.id === issueId) {
            const labels = isAdding
              ? [...prevIssue.labels, availableLabels.find(l => l.id === labelId)!]
              : prevIssue.labels.filter(label => label.id !== labelId);
            
            return {
              ...prevIssue,
              labels
            };
          }
          return prevIssue;
        })
      );
    } catch (error) {
      console.error('Error updating issue labels:', error);
      setError('Failed to update issue labels. Please try again.');
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const LoadingSpinner = ({ minHeight = 200 }: { minHeight?: number | string }) => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={minHeight}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Stack spacing={2}>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">{UI_TEXTS.filters.status}</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  multiple
                  value={selectedStatuses}
                  onChange={handleStatusChange}
                  label={UI_TEXTS.filters.status}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((statusId) => {
                        const status = statuses.find(s => s.id === statusId);
                        return status ? (
                          <Chip 
                            key={statusId} 
                            label={STATUS_TRANSLATIONS[status.name] || status.name}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(status.name)}15`,
                              borderColor: `${getStatusColor(status.name)}30`,
                              color: getStatusColor(status.name),
                              border: 1
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      <Checkbox checked={selectedStatuses.includes(status.id)} />
                      <ListItemText 
                        primary={STATUS_TRANSLATIONS[status.name] || status.name}
                        sx={{ 
                          '& .MuiTypography-root': { 
                            color: getStatusColor(status.name)
                          } 
                        }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>{UI_TEXTS.filters.priority}</InputLabel>
                <Select
                  multiple
                  value={selectedPriorities}
                  onChange={handlePriorityChange}
                  label={UI_TEXTS.filters.priority}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((priority) => (
                        <Chip 
                          key={priority} 
                          label={PRIORITY_LABELS[Number(priority) as IssuePriority]} 
                          size="small" 
                          sx={{
                            backgroundColor: `${getPriorityColor(Number(priority) as IssuePriority)}15`,
                            borderColor: `${getPriorityColor(Number(priority) as IssuePriority)}30`,
                            color: getPriorityColor(Number(priority) as IssuePriority),
                            border: 1
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      <Checkbox checked={selectedPriorities.includes(value)} />
                      <ListItemText primary={label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>{UI_TEXTS.filters.label}</InputLabel>
                <Select
                  multiple
                  value={selectedLabels}
                  onChange={handleLabelChange}
                  label={UI_TEXTS.filters.label}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((labelId) => {
                        const label = availableLabels.find(l => l.id === labelId);
                        return label ? (
                          <Chip 
                            key={labelId} 
                            label={LABEL_TRANSLATIONS[label.name] || label.name} 
                            size="small" 
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {availableLabels.map((label) => (
                    <MenuItem key={label.id} value={label.id}>
                      <Checkbox checked={selectedLabels.includes(label.id)} />
                      <ListItemText primary={LABEL_TRANSLATIONS[label.name] || label.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            action={
              <Button 
                variant="contained" 
                color="error" 
                onClick={() => {
                  setError(null);
                  fetchIssues();
                }}
              >
                {UI_TEXTS.errors.retry}
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box>
            <LoadingSpinner minHeight={200} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredIssues.map((issue) => (
              <Grid item xs={12} sm={6} md={4} key={issue.id}>
                <IssueCard 
                  issue={issue} 
                  onStatusChange={handleStatusChangeIssue}
                  onPriorityChange={handlePriorityChangeIssue}
                  onLabelToggle={handleLabelToggle}
                  availableStatuses={statuses}
                  availableLabels={availableLabels}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      <Fab 
        color="primary" 
        onClick={handleOpenCreateDialog}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog 
        open={isCreateDialogOpen} 
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {UI_TEXTS.issues.createIssue}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <CreateIssueForm
              onSubmit={handleCreateIssue}
              isLoading={isLoading}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
