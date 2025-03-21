'use client';

import { Paper, Stack } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { FormTextField } from '@/app/components/common/FormTextField';
import { LoadingButton } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';

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
    <Paper variant="outlined" sx={{ p: 3 }}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Stack spacing={3}>
          <Controller
            name="title"
            control={control}
            rules={{ 
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters'
              }
            }}
            render={({ field, fieldState }) => (
              <FormTextField
                {...field}
                label="Title"
                placeholder="Enter issue title"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
                disabled={isLoading}
                autoFocus
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <FormTextField
                {...field}
                label="Description"
                placeholder="Enter issue description"
                multiline
                rows={4}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
                disabled={isLoading}
              />
            )}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading}
            loadingPosition="start"
            startIcon={<AddIcon />}
            sx={{ alignSelf: 'flex-start', px: 3 }}
          >
            Create Issue
          </LoadingButton>
        </Stack>
      </form>
    </Paper>
  );
};
