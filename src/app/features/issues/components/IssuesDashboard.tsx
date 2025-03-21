'use client';

import { Container, Stack, Typography, Alert, Tabs, Tab, Box, Fade } from '@mui/material';
import { Issue } from '@linear/sdk';
import { useState, useEffect } from 'react';
import { IssueList } from '@/app/features/issues/components/IssueList';
import { CreateIssueForm } from '@/app/features/issues/components/CreateIssueForm';
import { IssueListSkeleton } from '@/app/features/issues/components/IssueListSkeleton';
import { getLinearClient } from '@/app/utils/linear-client';

type IssueWithState = Issue & {
  stateId?: string;
  stateName?: string;
};

export function IssuesDashboard() {
  const [issues, setIssues] = useState<IssueWithState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [issueStates, setIssueStates] = useState<{ id: string; name: string }[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchIssues = async () => {
    try {
      setIsLoading(true);
      const client = getLinearClient();
      const { nodes } = await client.issues();
      
      // Create a map to store unique states
      const stateMap = new Map<string, { id: string; name: string }>();
      
      // Process each issue and its state
      const processedIssues: IssueWithState[] = [];
      
      for (const issue of nodes) {
        const issueState = await issue.state;
        if (issueState) {
          stateMap.set(issueState.id, { id: issueState.id, name: issueState.name });
        }
        
        processedIssues.push({
          ...issue,
          stateId: issueState?.id,
          stateName: issueState?.name
        } as IssueWithState);
      }

      setIssues(processedIssues);
      setIssueStates(Array.from(stateMap.values()));
      setError(null);
    } catch (err) {
      setError('Failed to fetch issues. Please check your Linear API key.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleCreateIssue = async (data: { title: string; description: string }) => {
    setIsCreating(true);
    setError(null);
    try {
      const client = getLinearClient();
      const { nodes: teams } = await client.teams();
      const team = teams[0];
      
      if (!team) {
        throw new Error('No team found');
      }

      await client.createIssue({
        teamId: team.id,
        title: data.title,
        description: data.description,
      });

      await fetchIssues();
    } catch (err) {
      setError('Failed to create issue. Please check your Linear API key and permissions.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const filteredIssues = selectedTab === 'all' 
    ? issues 
    : issues.filter(issue => issue.stateId === selectedTab);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" component="h1">Linear Issue Tracker</Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Box component="button" onClick={fetchIssues} sx={{ cursor: 'pointer' }}>
                Retry
              </Box>
            }
          >
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <Typography variant="h6">Create New Issue</Typography>
          <CreateIssueForm onSubmit={handleCreateIssue} isLoading={isCreating} />
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '.MuiTab-root': {
                textTransform: 'none',
                minHeight: 48,
                fontSize: 'body2.fontSize',
                fontWeight: 'medium',
              }
            }}
          >
            <Tab 
              label={`All Issues (${issues.length})`}
              value="all"
            />
            {issueStates.map((state) => {
              const count = issues.filter(issue => issue.stateId === state.id).length;
              return (
                <Tab
                  key={state.id}
                  label={`${state.name} (${count})`}
                  value={state.id}
                />
              );
            })}
          </Tabs>
        </Box>

        <Fade in={!isLoading} timeout={300}>
          <Box>
            {isLoading ? (
              <IssueListSkeleton />
            ) : (
              <IssueList issues={filteredIssues} />
            )}
          </Box>
        </Fade>
      </Stack>
    </Container>
  );
}
