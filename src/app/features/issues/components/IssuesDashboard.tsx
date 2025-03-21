'use client';

import { useEffect, useState, useMemo } from 'react';
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
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CreateIssueForm } from './CreateIssueForm';
import { IssueCard } from './IssueCard';
import { LinearClient, Team, Issue, WorkflowState, Connection } from '@linear/sdk';
import { IssueWithState, IssuePriority, IssueLabel } from '@/app/features/issues/types';
import { ISSUE_AUTHOR } from '@/app/features/issues/constants';
import { UI_TEXTS, STATUS_TRANSLATIONS, LABEL_TRANSLATIONS } from '../constants/translations';

const PRIORITY_LABELS: { [key in IssuePriority]: string } = {
  [IssuePriority.NoPriority]: UI_TEXTS.issues.priority.noPriority,
  [IssuePriority.Low]: UI_TEXTS.issues.priority.low,
  [IssuePriority.Medium]: UI_TEXTS.issues.priority.medium,
  [IssuePriority.High]: UI_TEXTS.issues.priority.high,
  [IssuePriority.Urgent]: UI_TEXTS.issues.priority.urgent,
};

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
              <FormControl fullWidth size="small">
                <InputLabel>{UI_TEXTS.filters.status}</InputLabel>
                <Select
                  value={selectedStatus}
                  label={UI_TEXTS.filters.status}
                  onChange={handleStatusChange}
                >
                  <MenuItem value="all">{UI_TEXTS.filters.allStatuses}</MenuItem>
                  {statuses.map(status => (
                    <MenuItem key={status.id} value={status.id}>
                      {STATUS_TRANSLATIONS[status.name] || status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{UI_TEXTS.filters.priority}</InputLabel>
                <Select
                  value={selectedPriority}
                  label={UI_TEXTS.filters.priority}
                  onChange={(e: SelectChangeEvent) => setSelectedPriority(e.target.value)}
                >
                  <MenuItem value="all">{UI_TEXTS.filters.allPriorities}</MenuItem>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{UI_TEXTS.filters.label}</InputLabel>
                <Select
                  value={selectedLabel}
                  label={UI_TEXTS.filters.label}
                  onChange={(e: SelectChangeEvent) => setSelectedLabel(e.target.value)}
                >
                  <MenuItem value="all">{UI_TEXTS.filters.allLabels}</MenuItem>
                  {availableLabels.map(label => (
                    <MenuItem key={label.id} value={label.id}>
                      {LABEL_TRANSLATIONS[label.name] || label.name}
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
          <Stack spacing={2}>
            {filteredIssues.length > 0 ? (
              filteredIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))
            ) : (
              <Typography color="text.secondary" align="center">
                {UI_TEXTS.issues.noIssuesFound}
              </Typography>
            )}
          </Stack>
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
