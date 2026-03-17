import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService, RecordAttendancePayload } from '../../../api/services/attendance.service';

export const attendanceKeys = {
          all: ['attendance'] as const,
          daily: (workshopId: string, date: string) => [...attendanceKeys.all, workshopId, 'daily', date] as const,
          workshop: (workshopId: string, month?: string) => [...attendanceKeys.all, workshopId, 'overview', month] as const,
          trainee: (workshopId: string) => [...attendanceKeys.all, workshopId, 'me'] as const,
};

export const useDailyAttendance = (workshopId: string, date: string) => {
          return useQuery({
                    queryKey: attendanceKeys.daily(workshopId, date),
                    queryFn: () => attendanceService.getDailyAttendance(workshopId, date),
                    enabled: !!workshopId && !!date,
          });
};

export const useWorkshopAttendance = (workshopId: string, month?: string) => {
          return useQuery({
                    queryKey: attendanceKeys.workshop(workshopId, month),
                    queryFn: () => attendanceService.getWorkshopAttendance(workshopId, month),
                    enabled: !!workshopId,
          });
};

export const useTraineeAttendance = (workshopId: string, options?: { enabled?: boolean }) => {
          return useQuery({
                    queryKey: attendanceKeys.trainee(workshopId),
                    queryFn: () => attendanceService.getTraineeAttendance(workshopId),
                    enabled: options?.enabled !== undefined ? options.enabled && !!workshopId : !!workshopId,
          });
};

export const useRecordAttendance = () => {
          const queryClient = useQueryClient();

          return useMutation({
                    mutationFn: ({ workshopId, payload }: { workshopId: string; payload: RecordAttendancePayload }) =>
                              attendanceService.recordAttendance(workshopId, payload),
                    onSuccess: (_, variables) => {
                              // Invalidate relevant queries to refetch fresh data
                              queryClient.invalidateQueries({ queryKey: attendanceKeys.daily(variables.workshopId, variables.payload.date) });
                              queryClient.invalidateQueries({ queryKey: attendanceKeys.workshop(variables.workshopId) });
                    },
          });
};
