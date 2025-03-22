'use client';

import { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Alert,
  IconButton,
  useTheme,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { IssueWithState } from '../types';
import { UI_TEXTS } from '../constants/translations';

interface EditIssueFormProps {
  issue: IssueWithState;
  open: boolean;
  onClose: () => void;
  onSubmit: (issueId: string, title: string, description: string) => Promise<void>;
}

export function EditIssueForm({ issue, open, onClose, onSubmit }: EditIssueFormProps) {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(issue.id, trimmedTitle, description.trim());
      onClose();
    } catch (error) {
      setError('Failed to update issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle(issue.title);
      setDescription(issue.description || '');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ m: 0, p: 2, pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Edit Issue</Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              disabled={isSubmitting}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label={UI_TEXTS.issues.form.title}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error === 'Title is required' && e.target.value.trim()) {
                  setError(null);
                }
              }}
              fullWidth
              required
              disabled={isSubmitting}
              error={!title.trim()}
              helperText={!title.trim() ? 'Title is required' : ' '}
              autoFocus
              inputProps={{
                maxLength: 255,
                'aria-label': 'Issue title'
              }}
            />
            <TextField
              label={UI_TEXTS.issues.form.description}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              disabled={isSubmitting}
              inputProps={{
                'aria-label': 'Issue description'
              }}
              helperText=" "
            />
            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
            size="large"
          >
            Cancel
          </Button>
          <LoadingButton 
            type="submit" 
            variant="contained" 
            loading={isSubmitting}
            disabled={!title.trim()}
            size="large"
          >
            Save Changes
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
