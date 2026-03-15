import api from '../axios';
import { ApiResponse, WorkshopAttendance, DailyAttendanceRecord, AttendanceStatus } from '../../types';

export interface RecordAttendancePayload {
          date: string;
          records: {
                    trainee_id: string;
                    status: AttendanceStatus;
                    notes?: string;
          }[];
}

class AttendanceService {
          /**
           * Get trainees to record attendance for a specific date
           */
          async getDailyAttendance(workshopId: string, date: string): Promise<ApiResponse<DailyAttendanceRecord[]>> {
                    const response = await api.get(`/api/v1/workshops/${workshopId}/attendance/daily`, {
                              params: { date },
                    });
                    return response.data;
          }

          /**
           * Get overall attendance records for a workshop
           */
          async getWorkshopAttendance(workshopId: string, month?: string): Promise<ApiResponse<WorkshopAttendance[]>> {
                    const response = await api.get(`/api/v1/workshops/${workshopId}/attendance`, {
                              params: { month },
                    });
                    return response.data;
          }

          /**
           * Get trainee's own attendance
           */
          async getTraineeAttendance(workshopId: string): Promise<ApiResponse<WorkshopAttendance[]>> {
                    const response = await api.get(`/api/v1/workshops/${workshopId}/attendance/me`);
                    return response.data;
          }

          /**
           * Record attendance for a specific date (Batch)
           */
          async recordAttendance(workshopId: string, payload: RecordAttendancePayload): Promise<ApiResponse<null>> {
                    const response = await api.post(`/api/v1/workshops/${workshopId}/attendance`, payload);
                    return response.data;
          }
}

export const attendanceService = new AttendanceService();
