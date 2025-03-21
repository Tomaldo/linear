'use client';

import { Stack, Paper, Typography } from '@mui/material';
import { Issue } from '@linear/sdk';
import { useEffect, useState } from 'react';
import { IssueCard } from '@/app/features/issues/components/IssueCard';

interface IssueListProps {
  issues: Issue[];
}

export const IssueList = ({ issues }: IssueListProps) => {
  const [issueStates, setIssueStates] = useState<Record<string, string>>({});

  useEffect(() => {
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
    <Stack spacing={2}>
      <Typography variant="h5">Issues</Typography>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          {issues.length === 0 ? (
            <Typography color="text.secondary">
              No issues found
            </Typography>
          ) : (
            issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                state={issueStates[issue.id] || 'Loading...'}
              />
            ))
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};
