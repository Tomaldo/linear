'use client';

import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Stack, FormControl } from '@mui/material';
import { IssuePriority } from '@/app/features/issues/types';
import { PrioritySelect } from '@/app/features/issues/components/PrioritySelect';
import { UI_TEXTS } from '../constants/translations';
import { FormTextField } from '@/app/components/FormTextField';

interface CreateIssueFormProps {
  onSubmit: (data: { title: string; description: string; priority: IssuePriority }) => Promise<void>;
  isLoading: boolean;
}

export function CreateIssueForm({ onSubmit, isLoading }: CreateIssueFormProps) {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: IssuePriority.NoPriority
    }
  });

  const onSubmitForm = async (data: { title: string; description: string; priority: IssuePriority }) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitForm)}>
      <Stack spacing={3}>
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
              helperText={error?.message}
              disabled={isLoading}
              fullWidth
              inputProps={{
                'aria-label': UI_TEXTS.issues.form.title
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

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isLoading ? UI_TEXTS.issues.form.creating : UI_TEXTS.issues.form.create}
        </Button>
      </Stack>
    </Box>
  );
}
