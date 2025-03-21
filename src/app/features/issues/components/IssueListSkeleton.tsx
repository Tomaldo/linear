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
              {/* Title - matching our typography scale */}
              <Skeleton 
                variant="text" 
                width="60%" 
                height={28} 
                sx={{ 
                  mb: 1,
                  borderRadius: 1
                }} 
              />
              
              {/* Description - two lines with proper opacity */}
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
              
              {/* Labels - following our label design system */}
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 1,
                  minHeight: 24 // Consistent with actual label height
                }}
              >
                {Array(labelCount).fill(0).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    width={getRandomLabelWidth()}
                    height={24}
                    sx={{ 
                      borderRadius: '12px', // Matching our label design
                      opacity: 0.6,
                      flexShrink: 0 // Prevent label width compression
                    }}
                  />
                ))}
              </Stack>
              
              {/* Status chip - consistent with our hierarchy */}
              <Box>
                <Skeleton 
                  variant="rounded" 
                  width={80} 
                  height={24} 
                  sx={{ 
                    borderRadius: 1,
                    opacity: 0.5
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
