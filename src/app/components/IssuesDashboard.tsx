'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Stack, Alert } from '@mui/material';
import { Issue } from '@linear/sdk';
import { IssueList } from './IssueList';
import { CreateIssueForm } from './CreateIssueForm';
import { getLinearClient } from '../utils/linear-client';

export const IssuesDashboard = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      const client = getLinearClient();
      const { nodes } = await client.issues();
      setIssues(nodes);
      setError(null);
    } catch (err) {
      setError('Failed to fetch issues. Please check your Linear API key.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleCreateIssue = async (data: { title: string; description: string }) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" component="h1">Linear Issue Tracker</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Create New Issue</Typography>
          <CreateIssueForm onSubmit={handleCreateIssue} isLoading={isLoading} />
        </Box>

        <IssueList issues={issues} />
      </Stack>
    </Container>
  );
};
