'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

export const FormTextField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  return <TextField {...props} ref={ref} />;
});
