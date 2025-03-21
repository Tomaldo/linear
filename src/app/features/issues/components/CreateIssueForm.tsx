'use client';

import { Box, Button, Stack } from '@mui/material';
import { FormTextField } from '@/app/components/common/FormTextField';
import { useForm } from 'react-hook-form';
import { IssuePriority } from '../types';
import { PrioritySelect } from './PrioritySelect';

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
    }
  });

  const onFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <Stack spacing={3}>
        <FormTextField
          label="Title"
          {...register('title', { required: 'Title is required' })}
          error={!!errors.title}
          helperText={errors.title?.message}
          disabled={isLoading}
          fullWidth
        />

        <FormTextField
          label="Description"
          {...register('description')}
          multiline
          rows={4}
          disabled={isLoading}
          fullWidth
        />

        <PrioritySelect
          name="priority"
          control={control}
          disabled={isLoading}
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
