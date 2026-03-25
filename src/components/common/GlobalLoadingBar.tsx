// Global loading bar — shows a thin progress bar at the top of the viewport
// whenever React Query has active background fetches.

import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { Box, LinearProgress, useTheme } from '@mui/material';

export default function GlobalLoadingBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const theme = useTheme();
  const isActive = isFetching > 0 || isMutating > 0;

  if (!isActive) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.tooltip + 1,
      }}
    >
      <LinearProgress
        sx={{
          height: 3,
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
          bgcolor: 'transparent',
        }}
      />
    </Box>
  );
}
