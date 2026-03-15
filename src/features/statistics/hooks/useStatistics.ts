import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '../../../api/services/admin.service';

export const useDashboardStats = () => {
          return useQuery({
                    queryKey: ['statistics', 'dashboard'],
                    queryFn: statisticsService.getDashboard
          });
};

export const useWorkshopStats = () => {
          return useQuery({
                    queryKey: ['statistics', 'workshops'],
                    queryFn: statisticsService.getWorkshopStats
          });
};

export const useTrainerStats = () => {
          return useQuery({
                    queryKey: ['statistics', 'trainers'],
                    queryFn: statisticsService.getTrainerStats
          });
};

export const useAllStatistics = () => {
          const dashboardQuery = useDashboardStats();
          const workshopsQuery = useWorkshopStats();
          const trainersQuery = useTrainerStats();

          const isLoading = dashboardQuery.isLoading || workshopsQuery.isLoading || trainersQuery.isLoading;

          return {
                    dashboard: dashboardQuery.data as Record<string, any> || {},
                    workshopStats: workshopsQuery.data,
                    trainerStats: trainersQuery.data as Record<string, any> || {},
                    isLoading
          };
};
