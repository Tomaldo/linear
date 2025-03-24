'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Alert, 
  Box, 
  Stack, 
  Typography, 
  Chip,
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
  useMediaQuery,
  Checkbox,
  ListItemText,
  TextField,
  Avatar,
  FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CreateIssueForm } from './CreateIssueForm';
import { IssueCard } from './IssueCard';
import { LinearClient, Team, Issue, WorkflowState, Connection, IssuePayload, User } from '@linear/sdk';
import { IssueWithState, IssuePriority, IssueLabel } from '@/app/features/issues/types';
import { ISSUE_AUTHOR } from '../constants';
import { UI_TEXTS, STATUS_TRANSLATIONS } from '../constants/translations';
import { getPriorityColor, getStatusColor } from '../utils/colors';

const PRIORITY_LABELS: { [key in IssuePriority]: string } = {
  [IssuePriority.NoPriority]: UI_TEXTS.issues.priority.noPriority,
  [IssuePriority.Low]: UI_TEXTS.issues.priority.low,
  [IssuePriority.Medium]: UI_TEXTS.issues.priority.medium,
  [IssuePriority.High]: UI_TEXTS.issues.priority.high,
  [IssuePriority.Urgent]: UI_TEXTS.issues.priority.urgent,
};

export function IssuesDashboard() {
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState<IssueWithState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [statuses, setStatuses] = useState<Array<{ id: string; name: string }>>([]);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<IssueLabel[]>([]);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedStatuses(typeof event.target.value === 'string' ? [event.target.value] : event.target.value);
  };

  const handlePriorityChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedPriorities(typeof event.target.value === 'string' ? [event.target.value] : event.target.value);
  };

  const handleLabelChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedLabels(typeof event.target.value === 'string' ? [event.target.value] : event.target.value);
  };

  const handleAssigneeFilterChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedAssignees(typeof event.target.value === 'string' ? [event.target.value] : event.target.value);
  };

  const filteredIssues = useMemo(() => {
    let filtered = [...issues];

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(issue => selectedStatuses.includes(issue.stateId || ''));
    }

    // Filter by priority
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter(issue => 
        selectedPriorities.includes(String(issue.priority))
      );
    }

    // Filter by label
    if (selectedLabels.length > 0) {
      filtered = filtered.filter(issue => 
        issue.labels.some(label => selectedLabels.includes(label.id))
      );
    }

    // Filter by assignee
    if (selectedAssignees.length > 0) {
      filtered = filtered.filter(issue => {
        // If "unassigned" is selected (we'll use "none" as the special value)
        if (selectedAssignees.includes('none')) {
          if (issue.assigneeId === null) return true;
        }
        return selectedAssignees.includes(issue.assigneeId || '');
      });
    }

    // Filter by author (show only mine)
    if (showOnlyMine) {
      const currentAuthor = searchParams.get('author') || ISSUE_AUTHOR;
      filtered = filtered.filter(issue => 
        issue.title.startsWith(`${currentAuthor} - `)
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
  }, [issues, selectedStatuses, selectedPriorities, selectedLabels, selectedAssignees, showOnlyMine]);

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

      // Fetch team members
      const membersResponse = await team.members();
      const members = (membersResponse as Connection<User>).nodes;
      setTeamMembers(members.map(member => ({
        id: member.id,
        name: member.name || member.email,
        email: member.email
      })));

      const statesResponse = await team.states();
      const states = (statesResponse as Connection<WorkflowState>).nodes;
      setStatuses(states.map((state: WorkflowState) => ({ 
        id: state.id, 
        name: state.name 
      })));

      const labelsResponse = await team.labels();
      const labels = (labelsResponse as Connection<IssueLabel>).nodes;
      setAvailableLabels(labels.map(label => ({
        id: label.id,
        name: label.name,
        color: label.color
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
          const assignee = await issue.assignee;
          const commentsResponse = await issue.comments();
          const comments = await Promise.all(commentsResponse.nodes.map(async comment => {
            const user = await comment.user;
            return {
              id: comment.id,
              body: comment.body,
              createdAt: comment.createdAt.toISOString(),
              user: user ? {
                name: user.name || user.email,
                email: user.email
              } : null
            };
          }));

          // Get attachments to find member link
          const attachmentsResponse = await issue.attachments();
          const memberLink = attachmentsResponse.nodes.find(
            attachment => attachment.title === 'Medlemslink'
          )?.url || null;

          return {
            id: issue.id,
            title: issue.title,
            description: issue.description ?? null,
            stateId: state?.id ?? null,
            stateName: state?.name ?? null,
            labels,
            priority: issue.priority as IssuePriority,
            createdAt: issue.createdAt.toISOString(),
            assigneeId: assignee?.id ?? null,
            assigneeName: assignee?.name ?? assignee?.email ?? null,
            comments,
            memberLink
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

  const handleCreateIssue = async (data: { 
    title: string; 
    description: string; 
    priority: IssuePriority;
    addMemberLink?: boolean;
  }) => {
    setError(null);
    setIsCreating(true);
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const teamsResponse = await client.teams();
      const teams = (teamsResponse as Connection<Team>).nodes;
      const team = teams[0];

      if (!team) {
        throw new Error('Team configuration error: No team found in Linear.');
      }

      const author = searchParams.get('author') || ISSUE_AUTHOR;
      const memberId = searchParams.get('id');
      const ticketId = searchParams.get('ticketId');
      const pensionFund = searchParams.get('pensionFund');

      // Find the pension fund label from the cached labels
      let pensionFundLabelId: string | undefined;
      if (pensionFund) {
        const existingLabel = availableLabels.find(label => label.name === pensionFund);
        pensionFundLabelId = existingLabel?.id;
      }

      const issuePayload = await client.createIssue({
        teamId: team.id,
        title: `${author} - ${data.title}`,
        description: data.description,
        priority: data.priority,
        ...(pensionFundLabelId && { labelIds: [pensionFundLabelId] })
      });

      // Get the actual issue ID from the response
      const issue = await issuePayload.issue;
      const issueId = issue ? issue.id : null;
      
      if (data.addMemberLink && issueId && memberId) {
        const url = ticketId
          ? `https://saksbehandler.opensjon.no/members/${memberId}/ticket/${ticketId}`
          : `https://saksbehandler.opensjon.no/members/${memberId}`;
        try {
          await client.createAttachment({
            issueId,
            url,
            title: 'Medlemslink'
          });
        } catch (attachmentError) {
          console.error('Error creating attachment:', attachmentError);
          // Don't throw the error since the issue was still created successfully
        }
      }

      await fetchIssues();
      handleCloseCreateDialog();
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Failed to create issue: ${err.message}`
        : 'Failed to create issue. Please try again later.';
      setError(errorMessage);
      console.error('Error creating issue:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddComment = async (issueId: string, body: string) => {
    setError(null);
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      await client.createComment({
        issueId,
        body
      });
      await fetchIssues();
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Failed to add comment: ${err.message}`
        : 'Failed to add comment. Please try again later.';
      setError(errorMessage);
      console.error('Error adding comment:', err);
    }
  };

  const handleStatusChangeIssue = async (issueId: string, newStatusId: string) => {
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const issue = await client.issue(issueId);
      await issue.update({ stateId: newStatusId });
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(prevIssue => {
          if (prevIssue.id === issueId) {
            const newState = statuses.find(s => s.id === newStatusId);
            return {
              ...prevIssue,
              stateId: newStatusId,
              stateName: newState?.name || prevIssue.stateName
            };
          }
          return prevIssue;
        })
      );
    } catch (error) {
      console.error('Error updating issue status:', error);
      setError('Failed to update issue status. Please try again.');
    }
  };

  const handlePriorityChangeIssue = async (issueId: string, newPriority: number) => {
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const issue = await client.issue(issueId);
      await issue.update({ priority: newPriority });
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(prevIssue => {
          if (prevIssue.id === issueId) {
            return {
              ...prevIssue,
              priority: newPriority
            };
          }
          return prevIssue;
        })
      );
    } catch (error) {
      console.error('Error updating issue priority:', error);
      setError('Failed to update issue priority. Please try again.');
    }
  };

  const handleAssigneeChange = async (issueId: string, assigneeId: string | null) => {
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const issue = await client.issue(issueId);
      await issue.update({ assigneeId });
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(prevIssue => {
          if (prevIssue.id === issueId) {
            const newAssignee = teamMembers.find(m => m.id === assigneeId);
            return {
              ...prevIssue,
              assigneeId,
              assigneeName: newAssignee?.name ?? null
            };
          }
          return prevIssue;
        })
      );
    } catch (error) {
      console.error('Error updating issue assignee:', error);
      setError('Failed to update issue assignee. Please try again.');
    }
  };

  const handleLabelToggle = async (issueId: string, labelId: string, isAdding: boolean) => {
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const issue = await client.issue(issueId);
      
      // Get current label IDs
      const labelConnection = await issue.labels();
      const currentLabelIds = labelConnection.nodes.map((label: { id: string }) => label.id);
      
      // Update labels based on whether we're adding or removing
      const newLabelIds = isAdding
        ? [...currentLabelIds, labelId]
        : currentLabelIds.filter((id: string) => id !== labelId);
      
      await issue.update({ labelIds: newLabelIds });
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(prevIssue => {
          if (prevIssue.id === issueId) {
            const labels = isAdding
              ? [...prevIssue.labels, availableLabels.find(l => l.id === labelId)!]
              : prevIssue.labels.filter(label => label.id !== labelId);
            
            return {
              ...prevIssue,
              labels
            };
          }
          return prevIssue;
        })
      );
    } catch (error) {
      console.error('Error updating issue labels:', error);
      setError('Failed to update issue labels. Please try again.');
    }
  };

  const handleEditIssue = async (issueId: string, title: string, description: string) => {
    try {
      const client = new LinearClient({ apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY });
      const issue = await client.issue(issueId);
      await issue.update({ title, description });

      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(prevIssue => {
          if (prevIssue.id === issueId) {
            return {
              ...prevIssue,
              title,
              description
            };
          }
          return prevIssue;
        })
      );
    } catch (error) {
      console.error('Error updating issue:', error);
      setError('Failed to update issue. Please try again.');
    }
  };

  // Set default selected statuses when statuses are loaded
  useEffect(() => {
    if (statuses.length > 0) {
      const defaultStatuses = statuses
        .filter(status => ['Todo', 'In Progress'].includes(status.name))
        .map(status => status.id);
      setSelectedStatuses(defaultStatuses);
    }
  }, [statuses]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const LoadingSpinner = ({ minHeight = 200 }: { minHeight?: number | string }) => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={minHeight}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ pt: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ px: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">{UI_TEXTS.filters.status}</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  multiple
                  value={selectedStatuses}
                  onChange={handleStatusChange}
                  label={UI_TEXTS.filters.status}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((statusId) => {
                        const status = statuses.find(s => s.id === statusId);
                        return status ? (
                          <Chip 
                            key={statusId} 
                            label={STATUS_TRANSLATIONS[status.name] || status.name}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(status.name)}15`,
                              borderColor: `${getStatusColor(status.name)}30`,
                              color: getStatusColor(status.name),
                              border: 1
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      <Checkbox checked={selectedStatuses.includes(status.id)} />
                      <ListItemText 
                        primary={STATUS_TRANSLATIONS[status.name] || status.name}
                        sx={{ 
                          '& .MuiTypography-root': { 
                            color: getStatusColor(status.name)
                          } 
                        }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{UI_TEXTS.filters.priority}</InputLabel>
                <Select
                  multiple
                  value={selectedPriorities}
                  onChange={handlePriorityChange}
                  label={UI_TEXTS.filters.priority}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((priority) => (
                        <Chip 
                          key={priority} 
                          label={PRIORITY_LABELS[Number(priority) as IssuePriority]} 
                          size="small" 
                          sx={{
                            backgroundColor: `${getPriorityColor(Number(priority) as IssuePriority)}15`,
                            borderColor: `${getPriorityColor(Number(priority) as IssuePriority)}30`,
                            color: getPriorityColor(Number(priority) as IssuePriority),
                            border: 1
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      <Checkbox checked={selectedPriorities.includes(value)} />
                      <ListItemText primary={label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{UI_TEXTS.filters.label}</InputLabel>
                <Select
                  multiple
                  value={selectedLabels}
                  onChange={handleLabelChange}
                  label={UI_TEXTS.filters.label}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((labelId) => {
                        const label = availableLabels.find(l => l.id === labelId);
                        return label ? (
                          <Chip 
                            key={labelId} 
                            label={label.name} 
                            size="small" 
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {availableLabels.map((label) => (
                    <MenuItem key={label.id} value={label.id}>
                      <Checkbox checked={selectedLabels.includes(label.id)} />
                      <ListItemText primary={label.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{UI_TEXTS.filters.assignee}</InputLabel>
                <Select
                  multiple
                  value={selectedAssignees}
                  onChange={handleAssigneeFilterChange}
                  label={UI_TEXTS.filters.assignee}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((assigneeId) => {
                        if (assigneeId === 'none') {
                          return (
                            <Chip 
                              key="none" 
                              label={UI_TEXTS.issues.unassigned}
                              size="small"
                            />
                          );
                        }
                        const assignee = teamMembers.find(m => m.id === assigneeId);
                        return assignee ? (
                          <Chip 
                            key={assigneeId} 
                            label={assignee.name}
                            size="small"
                            avatar={
                              <Avatar sx={{ width: 24, height: 24 }}>
                                {assignee.name.charAt(0)}
                              </Avatar>
                            }
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  <MenuItem value="none">
                    <Checkbox checked={selectedAssignees.includes('none')} />
                    <ListItemText primary={UI_TEXTS.issues.unassigned} />
                  </MenuItem>
                  {teamMembers.map((assignee) => (
                    <MenuItem key={assignee.id} value={assignee.id}>
                      <Checkbox checked={selectedAssignees.includes(assignee.id)} />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {assignee.name.charAt(0)}
                        </Avatar>
                        <ListItemText primary={assignee.name} />
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ px: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
              />
            }
            label="Vis kun mine"
          />
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
          <Box sx={{ px: 2 }}>
            <Grid container spacing={2}>
              {filteredIssues.map((issue) => (
                <Grid item xs={12} sm={6} md={4} key={issue.id}>
                  <IssueCard 
                    issue={issue} 
                    onStatusChange={handleStatusChangeIssue}
                    onPriorityChange={handlePriorityChangeIssue}
                    onLabelToggle={handleLabelToggle}
                    onEdit={handleEditIssue}
                    onAddComment={handleAddComment}
                    onAssigneeChange={handleAssigneeChange}
                    availableStatuses={statuses}
                    availableLabels={availableLabels}
                    availableAssignees={teamMembers}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
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

      <CreateIssueForm 
        onSubmit={handleCreateIssue}
        isLoading={isCreating}
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        showMemberLinkToggle={!!searchParams.get('id')}
      />
    </Box>
  );
}
