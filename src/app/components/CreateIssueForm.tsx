'use client';

import { Box, Button, TextField, Stack } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface CreateIssueFormData {
  title: string;
  description: string;
}

interface CreateIssueFormProps {
  onSubmit: (data: CreateIssueFormData) => Promise<void>;
  isLoading?: boolean;
}

export const CreateIssueForm = ({ onSubmit, isLoading }: CreateIssueFormProps) => {
  const { control, handleSubmit, reset } = useForm<CreateIssueFormData>({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onFormSubmit = async (data: CreateIssueFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} sx={{ width: '100%', maxWidth: 600 }}>
      <Stack spacing={3}>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Title is required' }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Title"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Description"
              multiline
              rows={4}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isLoading ? 'Creating...' : 'Create Issue'}
        </Button>
      </Stack>
    </Box>
  );
};
