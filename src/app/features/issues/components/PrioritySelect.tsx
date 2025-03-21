'use client';

import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { IssuePriority } from '@/app/features/issues/types';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import RemoveIcon from '@mui/icons-material/Remove';
import { UI_TEXTS } from '../constants/translations';

interface PrioritySelectProps {
  value: IssuePriority;
  onChange: (value: IssuePriority) => void;
  disabled?: boolean;
}

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

export function PrioritySelect({ value, onChange, disabled }: PrioritySelectProps) {
  const priorityOptions = [
    { value: IssuePriority.NoPriority, label: UI_TEXTS.issues.priority.noPriority },
    { value: IssuePriority.Low, label: UI_TEXTS.issues.priority.low },
    { value: IssuePriority.Medium, label: UI_TEXTS.issues.priority.medium },
    { value: IssuePriority.High, label: UI_TEXTS.issues.priority.high },
    { value: IssuePriority.Urgent, label: UI_TEXTS.issues.priority.urgent }
  ];

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{UI_TEXTS.filters.priority}</InputLabel>
      <Select
        value={value}
        label={UI_TEXTS.filters.priority}
        onChange={(e) => onChange(e.target.value as IssuePriority)}
      >
        {priorityOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getPriorityIcon(option.value)}
              {option.label}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
