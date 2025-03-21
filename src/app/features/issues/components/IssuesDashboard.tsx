'use client';

import { Container, Stack, Typography, Alert, Tabs, Tab, Box, Fade } from '@mui/material';
import { useState, useEffect } from 'react';
import { IssueList } from '@/app/features/issues/components/IssueList';
import { CreateIssueForm } from '@/app/features/issues/components/CreateIssueForm';
import { IssueListSkeleton } from '@/app/features/issues/components/IssueListSkeleton';
import { getLinearClient } from '@/app/utils/linear-client';
import { ISSUE_AUTHOR } from '@/app/features/issues/constants';
import { IssueWithState } from '@/app/features/issues/types';
import { ErrorBoundary } from '@/app/components/common/ErrorBoundary';
import { categorizeError } from '@/app/features/issues/utils';

type IssueState = {
  id: string;
  name: string;
};

export function IssuesDashboard() {
  const [issues, setIssues] = useState<IssueWithState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [issueStates, setIssueStates] = useState<IssueState[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchIssues = async () => {
    try {
      setIsLoading(true);
      const client = getLinearClient();
      
      const { nodes: issueNodes } = await client.issues();
      
      const stateMap = new Map<string, IssueState>();
      const processedIssues: IssueWithState[] = [];
      
      for (const issue of issueNodes) {
        // Get issue state
        const issueState = await issue.state;
        if (issueState) {
          stateMap.set(issueState.id, { id: issueState.id, name: issueState.name });
        }

        // Get issue labels
        const { nodes: labelNodes } = await issue.labels();
        
        processedIssues.push({
          id: issue.id,
          title: issue.title || '',
          description: issue.description || '',
          stateId: issueState?.id || null,
          stateName: issueState?.name || null,
          labels: labelNodes.map(label => ({
            id: label.id,
            name: label.name,
            color: label.color
          }))
        });
      }

      setIssues(processedIssues);
      setIssueStates(Array.from(stateMap.values()));
      setError(null);
    } catch (err) {
      setError(categorizeError(err));
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
        throw new Error('No team found in Linear. Please create a team before creating issues.');
      }

      await client.createIssue({
        teamId: team.id,
        title: `${ISSUE_AUTHOR} - ${data.title}`,
        description: data.description,
      });

      await fetchIssues();
    } catch (err) {
      setError(categorizeError(err));
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const filteredIssues = selectedTab === 'all' 
    ? issues 
    : issues.filter(issue => issue.stateName?.toLowerCase() === selectedTab);

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <Typography variant="h6">Create New Issue</Typography>
          <CreateIssueForm onSubmit={handleCreateIssue} isLoading={isCreating} />
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
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
              label={`All (${issues.length})`}
              value="all"
            />
            {issueStates.map((state) => (
              <Tab
                key={state.id}
                label={`${state.name} (${issues.filter(i => i.stateId === state.id).length})`}
                value={state.name.toLowerCase()}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Fade in={!isLoading}>
            <div>
              <IssueList issues={filteredIssues} />
            </div>
          </Fade>
          {isLoading && <IssueListSkeleton />}
        </Box>
      </Container>
    </ErrorBoundary>
  );
}
