'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// Create a styled TextField following our theme patterns
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const FormTextField = (props: TextFieldProps) => {
  return (
    <StyledTextField
      variant="outlined"
      size="medium"
      {...props}
    />
  );
};
