import { Issue } from '@linear/sdk';

export type IssueWithState = Issue & {
  stateId?: string;
  stateName?: string;
};
