import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookingService, { type BookingFilters } from '../../../api/services/booking.service';
import { workshopKeys } from '../../workshops/hooks/useWorkshops';
import toast from 'react-hot-toast';

export const bookingKeys = {
          all: ['bookings'] as const,
          lists: () => [...bookingKeys.all, 'list'] as const,
          list: (filters: BookingFilters) => [...bookingKeys.lists(), filters] as const,
          my: (filters: BookingFilters) => [...bookingKeys.all, 'my', filters] as const,
          details: () => [...bookingKeys.all, 'detail'] as const,
          detail: (id: string) => [...bookingKeys.details(), id] as const,
          workshop: (wid: string) => [...bookingKeys.all, 'workshop', wid] as const,
          canBook: (wid: string) => [...bookingKeys.all, 'canBook', wid] as const,
          revenue: (params?: Record<string, string>) => [...bookingKeys.all, 'revenue', params] as const,
          statistics: () => [...bookingKeys.all, 'statistics'] as const,
};

export const useMyBookings = (filters: BookingFilters = { page: 1, limit: 10 }, options?: { enabled?: boolean }) =>
          useQuery({
                    queryKey: bookingKeys.my(filters),
                    queryFn: () => bookingService.getMyBookings(filters),
                    enabled: options?.enabled,
          });

export const useAllBookings = (filters: BookingFilters = { page: 1, limit: 10 }) =>
          useQuery({
                    queryKey: bookingKeys.list(filters),
                    queryFn: () => bookingService.getAll(filters),
          });

export const useBookingDetail = (id: string) =>
          useQuery({
                    queryKey: bookingKeys.detail(id),
                    queryFn: () => bookingService.getById(id),
                    enabled: !!id,
          });

export const useWorkshopBookings = (workshopId: string, filters?: BookingFilters) =>
          useQuery({
                    queryKey: bookingKeys.workshop(workshopId),
                    queryFn: () => bookingService.getWorkshopBookings(workshopId, filters),
                    enabled: !!workshopId,
          });

export const useCanBook = (workshopId: string) =>
          useQuery({
                    queryKey: bookingKeys.canBook(workshopId),
                    queryFn: () => bookingService.canBook(workshopId),
                    enabled: !!workshopId,
          });

export const useRevenue = (params?: { workshop_id?: string }) =>
          useQuery({
                    queryKey: bookingKeys.revenue(params as Record<string, string>),
                    queryFn: () => bookingService.getRevenue(params),
          });

export const useBookingStats = () =>
          useQuery({
                    queryKey: bookingKeys.statistics(),
                    queryFn: () => bookingService.getStatistics(),
          });

// ==========================================
// MUTATIONS (Booking Lifecycle)
// ==========================================

const useBookingMutation = (
          mutationFn: (id: string) => Promise<unknown>,
          successMsg: string,
) => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: (id: string) => mutationFn(id),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: bookingKeys.all });
                              qc.invalidateQueries({ queryKey: workshopKeys.all });
                              toast.success(successMsg);
                    },
          });
};

export const useCreateBooking = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: async (workshopId: string) => {
                              const seatData = await bookingService.getNextSeat(workshopId);
                              return bookingService.create(workshopId, seatData.next_seat);
                    },
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: bookingKeys.all });
                              qc.invalidateQueries({ queryKey: workshopKeys.all });
                              toast.success('Booking created / تم الحجز بنجاح');
                    },
          });
};

export const useConfirmBooking = () => useBookingMutation(bookingService.confirm, 'Booking confirmed / تم التأكيد');
export const useCancelBooking = () => useBookingMutation(bookingService.cancel, 'Booking cancelled / تم الإلغاء');
export const useMarkPayment = () => useBookingMutation(bookingService.markPayment, 'Payment confirmed / تم تأكيد الدفع');

export const useMarkAttendance = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: ({ id, status }: { id: string; status: 'attended' | 'no_show' }) =>
                              bookingService.markAttendance(id, status),
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: bookingKeys.all });
                              toast.success('Attendance updated / تم تحديث الحضور');
                    },
          });
};

export const useBulkAttendance = () => {
          const qc = useQueryClient();
          return useMutation({
                    mutationFn: bookingService.markBulkAttendance,
                    onSuccess: () => {
                              qc.invalidateQueries({ queryKey: bookingKeys.all });
                              toast.success('Bulk attendance updated / تم تحديث الحضور الجماعي');
                    },
          });
};
