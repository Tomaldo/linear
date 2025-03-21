'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

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

export const FormTextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ onChange, onBlur, value, name, ...props }, ref) => {
    return (
      <StyledTextField
        variant="outlined"
        size="medium"
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        inputRef={ref}
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
  }
);

FormTextField.displayName = 'FormTextField';
