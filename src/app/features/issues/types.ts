import { Issue } from '@linear/sdk';

export interface IssueLabel {
  id: string;
  name: string;
  color: string;
}

export interface IssueWithState extends Pick<Issue, 'id'> {
  title: string;
  description: string | null;
  stateId: string | null;
  stateName: string | null;
  labels: IssueLabel[];
  priority?: IssuePriority;
}

export enum IssuePriority {
  NoPriority = 0,
  Urgent = 1,
  High = 2,
  Medium = 3,
  Low = 4
}

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  [IssuePriority.NoPriority]: 'No Priority',
  [IssuePriority.Urgent]: 'Urgent',
  [IssuePriority.High]: 'High',
  [IssuePriority.Medium]: 'Medium',
  [IssuePriority.Low]: 'Low'
};
