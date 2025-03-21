'use client';

import dynamic from 'next/dynamic';

// Import IssuesDashboard dynamically to avoid SSR issues
const IssuesDashboard = dynamic(
  () => import('./features/issues/components/IssuesDashboard').then(mod => mod.IssuesDashboard),
  { 
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <span>Loading...</span>
      </div>
    )
  }
);

export default function Home() {
  return <IssuesDashboard />;
}
