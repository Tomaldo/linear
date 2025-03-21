'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';

const IssuesDashboard = dynamic(
  () => import('@/app/features/issues/components/IssuesDashboard').then(mod => ({ default: mod.IssuesDashboard })),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function Home() {
  return <IssuesDashboard />;
}
