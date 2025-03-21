'use client';

import { Box, Button, Stack } from '@mui/material';
import { FormTextField } from '@/app/components/common/FormTextField';
import { useForm, Controller } from 'react-hook-form';
import { IssuePriority } from '@/app/features/issues/types';
import { PrioritySelect } from '@/app/features/issues/components/PrioritySelect';

interface CreateIssueFormProps {
  onSubmit: (data: { title: string; description: string; priority: IssuePriority }) => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  priority: IssuePriority;
}

export function CreateIssueForm({ onSubmit, isLoading }: CreateIssueFormProps) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      priority: IssuePriority.NoPriority
    },
    mode: 'onChange'
  });

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit({
        ...data,
        priority: Number(data.priority) as IssuePriority
      });
      reset();
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <Stack spacing={3}>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Title is required' }}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <FormTextField
              {...field}
              label="Title"
              required
              error={!!error}
              helperText={error?.message}
              disabled={isLoading}
              fullWidth
              inputProps={{
                'aria-label': 'Title'
              }}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormTextField
              {...field}
              label="Description"
              multiline
              rows={4}
              disabled={isLoading}
              fullWidth
            />
          )}
        />

        <Controller
          name="priority"
          control={control}
          defaultValue={IssuePriority.NoPriority}
          render={({ field }) => (
            <PrioritySelect
              value={field.value}
              onChange={field.onChange}
              disabled={isLoading}
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
}
