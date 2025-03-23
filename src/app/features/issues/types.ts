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
  createdAt: string;
  comments?: IssueComment[];
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

export interface IssueComment {
  id: string;
  body: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  } | null;
}
