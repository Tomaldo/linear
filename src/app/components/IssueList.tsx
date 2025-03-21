'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Issue } from '@linear/sdk';
import { useEffect, useState } from 'react';

interface IssueListProps {
  issues: Issue[];
}

export const IssueList = ({ issues }: IssueListProps) => {
  const [issueStates, setIssueStates] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch states for all issues
    const fetchStates = async () => {
      const states: Record<string, string> = {};
      for (const issue of issues) {
        try {
          const state = await issue.state;
          if (state) {
            states[issue.id] = state.name;
          }
        } catch (error) {
          console.error(`Failed to fetch state for issue ${issue.id}:`, error);
          states[issue.id] = 'Unknown';
        }
      }
      setIssueStates(states);
    };

    fetchStates();
  }, [issues]);

  return (
    <Box component="section">
      <Typography variant="h5" sx={{ mb: 2 }}>Issues</Typography>
      <Box component={Paper} sx={{ p: 2 }}>
        {issues.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
            No issues found
          </Typography>
        ) : (
          issues.map((issue) => (
            <Box key={issue.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1">{issue.title}</Typography>
              <Typography variant="body2" color="text.secondary">{issue.description}</Typography>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Status: {issueStates[issue.id] || 'Loading...'}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};
