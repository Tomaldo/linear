// Types for Linear issues and related entities
export enum IssuePriority {
  NoPriority = 0,
  Urgent = 1,
  High = 2,
  Medium = 3,
  Low = 4
}

export interface IssueLabel {
  id: string;
  name: string;
  color: string;
}

export interface IssueWithState {
  id: string;
  title: string;
  description: string | null;
  stateId: string | null;
  stateName: string | null;
  labels: IssueLabel[];
  priority: IssuePriority;
  createdAt: string;
  comments: {
    id: string;
    body: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    } | null;
  }[];
  memberLink: string | null;
}
