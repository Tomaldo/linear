'use client';

import { Box, FormControl, MenuItem, Select } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { IssuePriority } from '../types';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import RemoveIcon from '@mui/icons-material/Remove';

interface PrioritySelectProps {
  name: string;
  control: Control<any>;
  disabled?: boolean;
}

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  [IssuePriority.NoPriority]: 'No Priority',
  [IssuePriority.Urgent]: 'Urgent',
  [IssuePriority.High]: 'High',
  [IssuePriority.Medium]: 'Medium',
  [IssuePriority.Low]: 'Low'
};

export function PrioritySelect({ name, control, disabled }: PrioritySelectProps) {
  const getPriorityIcon = (priority: IssuePriority) => {
    if (priority === IssuePriority.NoPriority) {
      return <RemoveIcon fontSize="small" />;
    }
    return (
      <SignalCellularAltIcon 
        fontSize="small" 
        sx={{ 
          opacity: (5 - priority) / 4, // Higher priority = higher opacity
          transform: priority === IssuePriority.Urgent ? 'rotate(180deg)' : undefined 
        }} 
      />
    );
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl size="small">
          <Select
            {...field}
            displayEmpty
            disabled={disabled}
            renderValue={(value) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getPriorityIcon(value as IssuePriority)}
                {PRIORITY_LABELS[value as IssuePriority]}
              </Box>
            )}
            sx={{
              minWidth: 200,
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <MenuItem 
                key={value} 
                value={value}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {getPriorityIcon(Number(value) as IssuePriority)}
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
}
