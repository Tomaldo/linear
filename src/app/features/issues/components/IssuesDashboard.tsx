'use client';

import { useEffect, useState, useMemo } from 'react';
import { Alert, Box, Container, Paper, Stack, Typography, Tabs, Tab, Button } from '@mui/material';
import { CreateIssueForm } from './CreateIssueForm';
import { LinearClient, Team, Issue, WorkflowState, Connection } from '@linear/sdk';
import { IssueWithState, IssuePriority } from '@/app/features/issues/types';
import { ISSUE_AUTHOR } from '@/app/features/issues/constants';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';

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
  const [selectedTab, setSelectedTab] = useState(0);
  const [statuses, setStatuses] = useState<Array<{ id: string; name: string }>>([]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const filteredIssues = useMemo(() => {
    if (selectedTab === 0) return issues;
    const status = statuses[selectedTab - 1];
    return status ? issues.filter(issue => issue.stateId === status.id) : [];
  }, [issues, selectedTab, statuses]);

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
          <Typography 
            variant="body2" 
            sx={{ 
              bgcolor: issue.priority === 0 ? 'grey.400' :
                     issue.priority === 1 ? 'info.light' :
                     issue.priority === 2 ? 'warning.light' :
                     'error.light',
              color: 'white',
              px: 2,
              py: 0.75,
              borderRadius: '20px',
              fontWeight: 500
            }}
          >
            Priority: {issue.priority === 0 ? 'None' :
                     issue.priority === 1 ? 'Low' :
                     issue.priority === 2 ? 'Medium' :
                     'High'}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );

  const renderTabContent = (issues: IssueWithState[], status?: { name: string }) => (
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
            {status 
              ? `No issues found in ${status.name}`
              : 'No issues found'
            }
          </Typography>
        </Paper>
      ) : (
        issues.map(renderIssueCard)
      )}
    </Stack>
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange}
              sx={{
                px: 2,
                pt: 2
              }}
            >
              <Tab label="Show All" />
              {statuses.map((status, index) => (
                <Tab key={status.id} label={status.name} />
              ))}
            </Tabs>
          </Box>

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
            <>
              <TabPanel value={selectedTab} index={0}>
                {renderTabContent(filteredIssues)}
              </TabPanel>

              {statuses.map((status, index) => (
                <TabPanel key={status.id} value={selectedTab} index={index + 1}>
                  {renderTabContent(filteredIssues, status)}
                </TabPanel>
              ))}
            </>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
