'use client';

import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  Button, 
  Stack, 
  FormControl, 
  TextField, 
  TextFieldProps, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Switch,
  FormControlLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { IssuePriority } from '@/app/features/issues/types';
import { PrioritySelect } from '@/app/features/issues/components/PrioritySelect';
import { UI_TEXTS } from '../constants/translations';
import { forwardRef } from 'react';

const FormTextField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  return <TextField {...props} ref={ref} />;
});

interface CreateIssueFormProps {
  onSubmit: (data: { 
    title: string; 
    description: string; 
    priority: IssuePriority;
    addMemberLink?: boolean;
  }) => Promise<void>;
  isLoading: boolean;
  open: boolean;
  onClose: () => void;
  showMemberLinkToggle?: boolean;
}

export function CreateIssueForm({ onSubmit, isLoading, open, onClose, showMemberLinkToggle = false }: CreateIssueFormProps) {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: IssuePriority.NoPriority,
      addMemberLink: false
    }
  });

  const onSubmitForm = async (data: { 
    title: string; 
    description: string; 
    priority: IssuePriority;
    addMemberLink: boolean;
  }) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{UI_TEXTS.issues.form.create}</Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            disabled={isLoading}
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
        <Box component="form" onSubmit={handleSubmit(onSubmitForm)}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Controller
              name="title"
              control={control}
              rules={{ required: UI_TEXTS.errors.required }}
              render={({ field, fieldState: { error } }) => (
                <FormTextField
                  {...field}
                  label={UI_TEXTS.issues.form.title}
                  required
                  error={!!error}
                  helperText={error?.message || ' '}
                  disabled={isLoading}
                  fullWidth
                  autoFocus
                  inputProps={{
                    'aria-label': UI_TEXTS.issues.form.title,
                    maxLength: 255
                  }}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <FormTextField
                  {...field}
                  label={UI_TEXTS.issues.form.description}
                  multiline
                  rows={4}
                  disabled={isLoading}
                  fullWidth
                  helperText=" "
                />
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <PrioritySelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              )}
            />

            {showMemberLinkToggle && (
              <Controller
                name="addMemberLink"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value}
                        onChange={onChange}
                        disabled={isLoading}
                      />
                    }
                    label="Legg til medlemslink"
                  />
                )}
              />
            )}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isLoading}
          size="large"
        >
          {UI_TEXTS.issues.form.cancel}
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isLoading}
          size="large"
          onClick={handleSubmit(onSubmitForm)}
        >
          {UI_TEXTS.issues.form.create}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
