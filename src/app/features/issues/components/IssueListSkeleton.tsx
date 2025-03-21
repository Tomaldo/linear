'use client';

import { Card, CardContent, Stack, Skeleton, Box } from '@mui/material';

export function IssueListSkeleton() {
  // Following our design system for realistic loading states
  const getRandomLabelCount = () => Math.floor(Math.random() * 3) + 2; // 2-4 labels
  const getRandomLabelWidth = () => Math.floor(Math.random() * 60) + 40; // 40-100px
  
  return (
    <Stack spacing={2}>
      {[1, 2, 3].map((item) => {
        const labelCount = getRandomLabelCount();
        return (
          <Card 
            key={item} 
            variant="outlined"
            sx={{ 
              '&:hover': {
                boxShadow: 1,
                transition: 'box-shadow 0.2s'
              }
            }}
          >
            <CardContent>
              {/* Title and badges row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Skeleton 
                  variant="text" 
                  width="60%" 
                  height={28} 
                  sx={{ 
                    borderRadius: 1,
                    flex: 1,
                    mr: 2
                  }} 
                />
                
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                  {/* Priority badge skeleton */}
                  <Skeleton 
                    variant="rounded" 
                    width={90} 
                    height={24} 
                    sx={{ 
                      borderRadius: 1,
                      opacity: 0.5
                    }} 
                  />
                  
                  {/* Status badge skeleton */}
                  <Skeleton 
                    variant="rounded" 
                    width={80} 
                    height={24} 
                    sx={{ 
                      borderRadius: 1,
                      opacity: 0.5
                    }} 
                  />
                </Stack>
              </Box>
              
              {/* Description lines with proper opacity */}
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Skeleton 
                  variant="text" 
                  width="90%" 
                  height={20} 
                  sx={{ opacity: 0.7 }} 
                />
                <Skeleton 
                  variant="text" 
                  width="75%" 
                  height={20} 
                  sx={{ opacity: 0.7 }} 
                />
              </Stack>
              
              {/* Labels with proper styling */}
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  flexWrap: 'wrap',
                  gap: 1,
                  minHeight: 24 // Match actual labels
                }}
              >
                {Array(labelCount).fill(0).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    width={getRandomLabelWidth()}
                    height={24}
                    sx={{ 
                      borderRadius: '12px', // Match label design
                      opacity: 0.6,
                      flexShrink: 0 // Prevent width compression
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
