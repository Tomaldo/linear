import { IssuePriority } from '../types';

export const getPriorityColor = (priority: IssuePriority): string => {
  switch (priority) {
    case IssuePriority.Urgent:
      return '#EF4444'; // Red
    case IssuePriority.High:
      return '#F59E0B'; // Orange
    case IssuePriority.Medium:
      return '#3B82F6'; // Blue
    case IssuePriority.Low:
      return '#10B981'; // Green
    default:
      return '#6B7280'; // Gray
  }
};

export const getStatusColor = (statusName: string): string => {
  switch (statusName.toLowerCase()) {
    case 'backlog':
      return '#6B7280'; // Gray
    case 'todo':
    case 'å gjøre':
      return '#3B82F6'; // Blue
    case 'in progress':
    case 'under arbeid':
      return '#8B5CF6'; // Purple
    case 'done':
    case 'ferdig':
      return '#10B981'; // Green
    case 'canceled':
    case 'kansellert':
      return '#EF4444'; // Red
    case 'duplicate':
    case 'duplikat':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
};
