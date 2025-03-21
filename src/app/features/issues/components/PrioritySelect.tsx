'use client';

import { Box, FormControl, MenuItem, Select } from '@mui/material';
import { IssuePriority } from '@/app/features/issues/types';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import RemoveIcon from '@mui/icons-material/Remove';

interface PrioritySelectProps {
  value: IssuePriority;
  onChange: (value: IssuePriority) => void;
  disabled?: boolean;
}

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  [IssuePriority.NoPriority]: 'No Priority',
  [IssuePriority.Urgent]: 'Urgent',
  [IssuePriority.High]: 'High',
  [IssuePriority.Medium]: 'Medium',
  [IssuePriority.Low]: 'Low'
};

export function PrioritySelect({ value, onChange, disabled }: PrioritySelectProps) {
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
    <FormControl fullWidth disabled={disabled}>
      <Select
        value={value.toString()}
        onChange={(e) => onChange(Number(e.target.value) as IssuePriority)}
        size="medium"
        displayEmpty
      >
        {Object.entries(PRIORITY_LABELS).map(([priority, label]) => (
          <MenuItem key={priority} value={priority}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getPriorityIcon(Number(priority) as IssuePriority)}
              {label}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
