import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { IssueWithState } from '../types';
import { UI_TEXTS } from '../constants/translations';

interface EditIssueFormProps {
  issue: IssueWithState;
  onSave: (title: string, description: string) => Promise<void>;
  onClose: () => void;
}

export function EditIssueForm({ issue, onSave, onClose }: EditIssueFormProps) {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(title.trim(), description.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ m: 0, p: 2, pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <span>{UI_TEXTS.issues.form.edit}</span>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500]
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              autoFocus
              label={UI_TEXTS.issues.form.title}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label={UI_TEXTS.issues.form.description}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            {UI_TEXTS.issues.form.cancel}
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                {UI_TEXTS.issues.form.submitting}
                <CircularProgress size={16} sx={{ ml: 1 }} />
              </>
            ) : (
              UI_TEXTS.issues.form.submit
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
