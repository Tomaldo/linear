'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
  },
  '& .MuiOutlinedInput-root': {
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.action.disabledBackground,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: theme.typography.body2.fontSize,
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    fontSize: theme.typography.caption.fontSize,
  },
}));

export const FormTextField = (props: TextFieldProps) => {
  return (
    <StyledTextField
      variant="outlined"
      size="medium"
      {...props}
      FormHelperTextProps={{
        ...props.FormHelperTextProps,
        sx: {
          ...(props.error && {
            color: 'error.main',
          }),
        },
      }}
    />
  );
};
