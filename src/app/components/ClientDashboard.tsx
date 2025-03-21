'use client';

import dynamic from 'next/dynamic';

const LoadingSpinner = dynamic(
  () => import('@/app/components/common/LoadingSpinner').then(mod => mod.LoadingSpinner),
  { ssr: false }
);

const IssuesDashboard = dynamic(
  () => import('@/app/features/issues/components/IssuesDashboard').then(mod => mod.IssuesDashboard),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export function ClientDashboard() {
  return <IssuesDashboard />;
}
