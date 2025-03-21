'use client';

import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';

// Import IssuesDashboard dynamically to avoid SSR issues
const IssuesDashboard = dynamic(
  () => import('./features/issues/components/IssuesDashboard'),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function Home() {
  return (
    <Box component="main">
      <IssuesDashboard />
    </Box>
  );
}
