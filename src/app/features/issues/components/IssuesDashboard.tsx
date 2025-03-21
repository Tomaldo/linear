'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Alert, 
  Box, 
  Container, 
  Paper, 
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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CreateIssueForm } from './CreateIssueForm';
import { LinearClient, Team, Issue, WorkflowState, Connection } from '@linear/sdk';
import { IssueWithState, IssuePriority, IssueLabel } from '@/app/features/issues/types';
import { ISSUE_AUTHOR } from '@/app/features/issues/constants';

export function IssuesDashboard() {
  const [issues, setIssues] = useState<IssueWithState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statuses, setStatuses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedLabel, setSelectedLabel] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value);
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setSelectedPriority(event.target.value);
  };

  const handleLabelChange = (event: SelectChangeEvent) => {
    setSelectedLabel(event.target.value);
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
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(issue => issue.stateId === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(issue => 
        issue.priority === Number(selectedPriority) as IssuePriority
      );
    }

    // Filter by label
    if (selectedLabel !== 'all') {
      filtered = filtered.filter(issue => 
        issue.labels.some(label => label.id === selectedLabel)
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
  }, [issues, selectedStatus, selectedPriority, selectedLabel]);

  const getPriorityLabel = (priority: IssuePriority): string => {
    switch (priority) {
      case IssuePriority.NoPriority: return 'No Priority';
      case IssuePriority.Low: return 'Low';
      case IssuePriority.Medium: return 'Medium';
      case IssuePriority.High: return 'High';
      default: return 'Unknown';
    }
  };

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
        title: `${ISSUE_AUTHOR} - ${data.title}`,
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

  useEffect(() => {
    fetchIssues();
  }, []);

  const renderIssueCard = (issue: IssueWithState) => (
    <Paper 
      key={issue.id} 
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
            <Typography variant="body2" color="text.secondary">
              {issue.description}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {issue.stateName && (
              <Chip
                label={issue.stateName}
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
                label={getPriorityLabel(issue.priority)}
                size="small"
                sx={{
                  backgroundColor: `${getPriorityColor(issue.priority)}1A`, // 10% opacity
                  color: getPriorityColor(issue.priority),
                  borderColor: `${getPriorityColor(issue.priority)}40`, // 25% opacity
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
                  label={label.name}
                  size="small"
                  sx={{
                    backgroundColor: `${label.color}1A`, // 10% opacity
                    color: label.color,
                    borderColor: `${label.color}40`, // 25% opacity
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

  const LoadingSpinner = ({ minHeight = 200 }: { minHeight?: number | string }) => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={minHeight}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Paper 
          elevation={2}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Stack>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    {statuses.map(status => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={selectedPriority}
                    label="Priority"
                    onChange={handlePriorityChange}
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    {Object.values(IssuePriority)
                      .filter(p => typeof p === 'number')
                      .map(priority => (
                        <MenuItem key={priority} value={priority.toString()}>
                          {getPriorityLabel(priority as IssuePriority)}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Label</InputLabel>
                  <Select
                    value={selectedLabel}
                    label="Label"
                    onChange={handleLabelChange}
                  >
                    <MenuItem value="all">All Labels</MenuItem>
                    {availableLabels.map(label => (
                      <MenuItem key={label.id} value={label.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: label.color,
                              mr: 1
                            }} 
                          />
                          {label.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ mx: 3, mt: 2 }}
                action={
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => {
                      setError(null);
                      fetchIssues();
                    }}
                  >
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {isLoading ? (
              <Box sx={{ p: 4 }}>
                <LoadingSpinner minHeight={200} />
              </Box>
            ) : (
              <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {filteredIssues.length > 0 ? (
                    filteredIssues.map(issue => renderIssueCard(issue))
                  ) : (
                    <Typography color="text.secondary" align="center">
                      No issues found matching the selected filters.
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      </Stack>

      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={handleOpenCreateDialog}
      >
        <AddIcon />
      </Fab>

      <Dialog 
        open={isCreateDialogOpen} 
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Create Issue</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <CreateIssueForm onSubmit={handleCreateIssue} isLoading={isLoading} />
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
