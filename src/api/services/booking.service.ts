import api from '../axios';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse, PaginatedResponse, Booking, RevenueStats } from '../../types';

export interface BookingFilters {
    page?: number;
    limit?: number;
    status?: string;
    workshop_id?: string;
}

const bookingService = {
    create: async (workshop_id: string, seat_number: number) => {
        const res = await api.post<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS.BASE, { workshop_id, seat_number });
        return res.data.data;
    },

    getMyBookings: async (params?: BookingFilters) => {
        const res = await api.get<PaginatedResponse<Booking>>(ENDPOINTS.BOOKINGS.MY_BOOKINGS, { params });
        return res.data;
    },

    getAll: async (params?: BookingFilters) => {
        const res = await api.get<PaginatedResponse<Booking>>(ENDPOINTS.BOOKINGS.BASE, { params });
        return res.data;
    },

    getById: async (id: string) => {
        const res = await api.get<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS.BY_ID(id));
        return res.data.data;
    },

    getWorkshopBookings: async (workshopId: string, params?: BookingFilters) => {
        const res = await api.get<PaginatedResponse<Booking>>(ENDPOINTS.BOOKINGS.WORKSHOP(workshopId), { params });
        return res.data;
    },

    canBook: async (workshopId: string) => {
        const res = await api.get<ApiResponse<{ can_book: boolean; reason?: string }>>(ENDPOINTS.BOOKINGS.CAN_BOOK(workshopId));
        return res.data.data;
    },

    getNextSeat: async (workshopId: string) => {
        const res = await api.get<ApiResponse<{ next_seat: number }>>(ENDPOINTS.BOOKINGS.NEXT_SEAT(workshopId));
        return res.data.data;
    },

    approve: async (id: string) => {
        const res = await api.post<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS.APPROVE(id));
        return res.data.data;
    },

    updateStatus: async (id: string, status: string) => {
        const res = await api.patch<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS.STATUS(id), { status });
        return res.data.data;
    },

    markPayment: async (id: string) => {
        const res = await api.post<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS.PAYMENT(id));
        return res.data.data;
    },

    getStatistics: async () => {
        const res = await api.get<ApiResponse<Record<string, unknown>>>(ENDPOINTS.BOOKINGS.STATISTICS);
        return res.data.data;
    },

    getRevenue: async (params?: { workshop_id?: string }) => {
        const res = await api.get<ApiResponse<RevenueStats>>(ENDPOINTS.BOOKINGS.REVENUE, { params });
        return res.data.data;
    },
};

export default bookingService;
