import { Issue } from '@linear/sdk';

interface IssueLabel {
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
}
