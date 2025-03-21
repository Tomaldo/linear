'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, Container, Paper, Stack, Typography } from '@mui/material';
import { CreateIssueForm } from './CreateIssueForm';
import { IssueList } from './IssueList';
import { LinearClient } from '@linear/sdk';
import { categorizeError } from '../utils';
import { IssueWithState, IssuePriority } from '../types';
import { ISSUE_AUTHOR } from '../constants';

interface CreateIssueData {
  title: string;
  description: string;
  priority: IssuePriority;
}

export default function IssuesDashboard() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issues, setIssues] = useState<IssueWithState[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);

  const fetchIssues = async () => {
    try {
      const client = new LinearClient({
        apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY
      });

      const response = await client.issues();
      const issuesWithState = await Promise.all(
        response.nodes.map(async (issue) => {
          const state = await issue.state;
          const labels = await issue.labels();
          
          if (!state) {
            throw new Error('Failed to fetch issue state');
          }

          return {
            id: issue.id,
            title: issue.title,
            description: issue.description ?? null,
            stateId: state.id,
            stateName: state.name,
            labels: labels.nodes.map(label => ({
              id: label.id,
              name: label.name,
              color: label.color
            })),
            priority: (issue.priority ?? IssuePriority.NoPriority) as IssuePriority
          };
        })
      );

      setIssues(issuesWithState);
    } catch (err) {
      setError(categorizeError(err));
    } finally {
      setIsLoadingIssues(false);
    }
  };

  const handleCreateIssue = async (data: CreateIssueData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const client = new LinearClient({
        apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY
      });

      // Get the first team (for demo purposes)
      const teams = await client.teams();
      const team = teams.nodes[0];

      if (!team) {
        throw new Error('team_not_found');
      }

      // Create the issue
      const result = await client.createIssue({
        teamId: team.id,
        title: `${ISSUE_AUTHOR} - ${data.title}`,
        description: data.description,
        priority: Number(data.priority)
      });

      if (!result.success || !result.issue) {
        throw new Error('Failed to create issue');
      }

      // Get the issue's state
      const issueData = await result.issue;
      const issueState = await issueData.state;
      
      if (!issueState) {
        throw new Error('Failed to fetch issue state');
      }

      // Add the new issue to the list
      setIssues(prev => [{
        id: issueData.id,
        title: issueData.title,
        description: issueData.description ?? null,
        stateId: issueState.id,
        stateName: issueState.name,
        labels: [],
        priority: (issueData.priority ?? IssuePriority.NoPriority) as IssuePriority
      }, ...prev]);

    } catch (err) {
      setError(categorizeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch issues on component mount
  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Issues Dashboard
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ 
              '& .MuiAlert-message': { 
                flex: 1 
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Create Issue
          </Typography>
          <CreateIssueForm onSubmit={handleCreateIssue} isLoading={isSubmitting} />
        </Paper>

        <IssueList issues={issues} isLoading={isLoadingIssues} />
      </Stack>
    </Container>
  );
}
