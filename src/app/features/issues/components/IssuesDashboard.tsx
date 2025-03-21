'use client';

import { useEffect, useState, useMemo } from 'react';
import { Alert, Box, Container, Paper, Stack, Typography, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import { CreateIssueForm } from './CreateIssueForm';
import { LinearClient, Team, Issue, WorkflowState, Connection } from '@linear/sdk';
import { IssueWithState, IssuePriority } from '@/app/features/issues/types';
import { ISSUE_AUTHOR } from '@/app/features/issues/constants';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`issue-tabpanel-${index}`}
      aria-labelledby={`issue-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            {children}
          </Stack>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `issue-tab-${index}`,
    'aria-controls': `issue-tabpanel-${index}`,
  };
}

export function IssuesDashboard() {
  const [issues, setIssues] = useState<IssueWithState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusTab, setStatusTab] = useState(0);
  const [priorityTab, setPriorityTab] = useState(0);
  const [statuses, setStatuses] = useState<Array<{ id: string; name: string }>>([]);

  const handleStatusTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setStatusTab(newValue);
  };

  const handlePriorityTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setPriorityTab(newValue);
  };

  const statusesWithIssues = useMemo(() => {
    return statuses.filter(status => 
      issues.some(issue => issue.stateId === status.id)
    );
  }, [issues, statuses]);

  const prioritiesWithIssues = useMemo(() => {
    const priorities = new Set(issues.map(issue => issue.priority));
    return [
      IssuePriority.NoPriority,
      IssuePriority.Low,
      IssuePriority.Medium,
      IssuePriority.High
    ].filter(priority => priorities.has(priority));
  }, [issues]);

  // Reset tab selections if the selected tab no longer exists
  useEffect(() => {
    if (statusTab > 0 && statusTab > statusesWithIssues.length) {
      setStatusTab(0);
    }
  }, [statusTab, statusesWithIssues.length]);

  useEffect(() => {
    if (priorityTab > 0 && priorityTab > prioritiesWithIssues.length) {
      setPriorityTab(0);
    }
  }, [priorityTab, prioritiesWithIssues.length]);

  const filteredIssues = useMemo(() => {
    let filtered = issues;

    // Filter by status
    if (statusTab !== 0) {
      const status = statusesWithIssues[statusTab - 1];
      filtered = status ? filtered.filter(issue => issue.stateId === status.id) : [];
    }

    // Filter by priority
    if (priorityTab !== 0) {
      const priority = prioritiesWithIssues[priorityTab - 1];
      filtered = filtered.filter(issue => issue.priority === priority);
    }

    return filtered;
  }, [issues, statusTab, priorityTab, statusesWithIssues, prioritiesWithIssues]);

  const getPriorityLabel = (priority: IssuePriority): string => {
    switch (priority) {
      case IssuePriority.NoPriority: return 'No Priority';
      case IssuePriority.Low: return 'Low';
      case IssuePriority.Medium: return 'Medium';
      case IssuePriority.High: return 'High';
      default: return 'Unknown';
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
          return {
            id: issue.id,
            title: issue.title,
            description: issue.description ?? null,
            stateId: state?.id ?? null,
            stateName: state?.name ?? null,
            labels: [],
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

  useEffect(() => {
    fetchIssues();
  }, []);

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

      const result = await client.createIssue({
        teamId: team.id,
        title: `${ISSUE_AUTHOR} - ${data.title}`,
        description: data.description,
        priority: Number(data.priority)
      });

      if (!result.success || !result.issue) {
        throw new Error('Failed to create issue');
      }

      const issueData = await result.issue;
      const issueState = await issueData.state;

      if (!issueState) {
        throw new Error('Failed to fetch issue state');
      }

      setIssues(prev => [{
        id: issueData.id,
        title: issueData.title,
        description: issueData.description ?? null,
        stateId: issueState.id,
        stateName: issueState.name,
        labels: [],
        priority: issueData.priority as IssuePriority
      }, ...prev]);
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

  const renderIssueCard = (issue: IssueWithState) => (
    <Paper 
      key={issue.id} 
      sx={{ 
        p: 3,
        boxShadow: 1,
        borderRadius: 2,
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{issue.title}</Typography>
        {issue.description && (
          <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
            {issue.description}
          </Typography>
        )}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography 
            variant="body2" 
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'white',
              px: 2,
              py: 0.75,
              borderRadius: '20px',
              fontWeight: 500
            }}
          >
            {issue.stateName}
          </Typography>
          {issue.priority !== undefined && (
            <Typography 
              variant="body2" 
              sx={{ 
                bgcolor: issue.priority === IssuePriority.NoPriority ? 'grey.400' :
                       issue.priority === IssuePriority.Low ? 'info.light' :
                       issue.priority === IssuePriority.Medium ? 'warning.light' :
                       'error.light',
                color: 'white',
                px: 2,
                py: 0.75,
                borderRadius: '20px',
                fontWeight: 500
              }}
            >
              Priority: {getPriorityLabel(issue.priority)}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );

  const renderTabContent = (issues: IssueWithState[], status?: { name: string }) => {
    let priorityLabel: string | null = null;
    if (priorityTab > 0) {
      const priority = prioritiesWithIssues[priorityTab - 1];
      priorityLabel = getPriorityLabel(priority);
    }

    const statusLabel = status?.name;
    
    let emptyMessage = 'No issues found';
    if (statusLabel && priorityLabel) {
      emptyMessage = `No ${priorityLabel} priority issues in ${statusLabel}`;
    } else if (statusLabel) {
      emptyMessage = `No issues found in ${statusLabel}`;
    } else if (priorityLabel) {
      emptyMessage = `No ${priorityLabel} priority issues found`;
    }

    return (
      <Stack spacing={3} sx={{ p: 3 }}>
        {issues.length === 0 ? (
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: 'grey.50'
            }}
          >
            <Typography color="text.secondary">
              {emptyMessage}
            </Typography>
          </Paper>
        ) : (
          issues.map(renderIssueCard)
        )}
      </Stack>
    );
  };

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
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Create Issue</Typography>
          <CreateIssueForm onSubmit={handleCreateIssue} isLoading={isLoading} />
        </Paper>

        <Paper 
          elevation={2}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Stack>
            {statusesWithIssues.length > 0 && (
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                <Tabs 
                  value={statusTab} 
                  onChange={handleStatusTabChange}
                  sx={{
                    px: 2,
                    pt: 2
                  }}
                >
                  <Tab label="All Statuses" />
                  {statusesWithIssues.map((status, index) => (
                    <Tab key={status.id} label={status.name} />
                  ))}
                </Tabs>
              </Box>
            )}

            {prioritiesWithIssues.length > 0 && (
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                <Tabs 
                  value={priorityTab} 
                  onChange={handlePriorityTabChange}
                  sx={{
                    px: 2,
                    pt: 2
                  }}
                >
                  <Tab label="All Priorities" />
                  {prioritiesWithIssues.map((priority) => (
                    <Tab 
                      key={priority} 
                      label={getPriorityLabel(priority)} 
                    />
                  ))}
                </Tabs>
              </Box>
            )}

            {error && (
              <Alert 
                severity="error" 
                sx={{ mx: 3, mt: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={() => {
                    setError(null);
                    fetchIssues();
                  }}>
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
              <Box>
                {renderTabContent(filteredIssues, statusTab > 0 ? statusesWithIssues[statusTab - 1] : undefined)}
              </Box>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
